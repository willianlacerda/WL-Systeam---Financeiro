import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  
  const DATA_DIR = path.join(process.cwd(), "data");
  const BACKUP_DIR = path.join(DATA_DIR, "backups");
  const DATA_FILE = path.join(DATA_DIR, "financial_data.json");

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Ensure directories exist
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (err) {
    console.error("Error creating directories:", err);
  }

  app.use(express.json({ limit: '50mb' }));

  // Registering API Routes
  console.log("Registering API routes...");

  // Health and Info
  app.get("/api/status", async (req, res) => {
    let dataFound = false;
    try {
      await fs.access(DATA_FILE);
      dataFound = true;
    } catch {
      dataFound = false;
    }
    res.json({ 
      status: "online", 
      dataFound,
      time: new Date().toISOString(),
      platform: process.platform
    });
  });

  // Custom Logo management
  const LOGO_FILE = path.join(DATA_DIR, "logo_custom.png");
  app.get("/api/logo", async (req, res) => {
    try {
      const data = await fs.readFile(LOGO_FILE);
      res.setHeader("Content-Type", "image/png");
      res.send(data);
    } catch {
      res.status(404).json({ error: "No custom logo found" });
    }
  });

  app.post("/api/logo", async (req, res) => {
    try {
      const { dataBase64 } = req.body;
      if (!dataBase64) {
        return res.status(400).json({ error: "Missing dataBase64" });
      }
      const buffer = Buffer.from(dataBase64.split(",")[1] || dataBase64, 'base64');
      await fs.writeFile(LOGO_FILE, buffer);
      res.json({ success: true });
    } catch (err) {
      console.error("Error saving custom logo:", err);
      res.status(500).json({ error: "Failed to save logo" });
    }
  });

  // AI Financial Insights route
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { expenses, subCategories, period } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const totalSpent = (expenses || []).reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
      const paidSpent = (expenses || []).filter((e: any) => e.status === 'pago').reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
      const pendingSpent = totalSpent - paidSpent;

      if (!apiKey) {
        return res.json({
          status: "fallback",
          insights: [
            {
              type: "summary",
              title: "Visão Geral Consolidada",
              description: `Total mapeado de R$ ${totalSpent.toFixed(2)} em ${expenses?.length || 0} lançamentos financeiros. R$ ${paidSpent.toFixed(2)} já liquidado e R$ ${pendingSpent.toFixed(2)} pendente.`
            },
            {
              type: "tip",
              title: "Otimização de Custos Fixos",
              description: "Revise despesas recorrentes e custos operacionais com vencimento nos próximos 15 dias para otimizar fluxo de caixa."
            },
            {
              type: "alert",
              title: "Controle de Prazos",
              description: pendingSpent > 0 
                ? `Atenção aos R$ ${pendingSpent.toFixed(2)} pendentes para evitar multas e juros por atraso.` 
                : "Parabéns! Todas as despesas cadastradas do período encontram-se quitadas."
            }
          ],
          score: Math.min(100, Math.max(50, Math.round(100 - (pendingSpent / (totalSpent || 1)) * 30)))
        });
      }

      // If GEMINI_API_KEY is present, use GoogleGenAI
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é um CFO e especialista em inteligência financeira empresarial do software WL System.
Analise os seguintes dados financeiros em formato JSON e forneça um parecer executivo estratégico em Português do Brasil.
Dados:
- Período: ${period || 'Geral'}
- Total de Despesas: R$ ${totalSpent.toFixed(2)}
- Liquidado: R$ ${paidSpent.toFixed(2)}
- Pendente: R$ ${pendingSpent.toFixed(2)}
- Categorias: ${JSON.stringify(subCategories?.slice(0, 10) || [])}
- Amostra de Lançamentos: ${JSON.stringify(expenses?.slice(0, 30) || [])}

Retorne ESTRITAMENTE um JSON no formato:
{
  "score": 85,
  "insights": [
    {
      "type": "summary" | "tip" | "alert" | "forecast",
      "title": "título curto e objetivo",
      "description": "análise prática e direta"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("AI Insights error:", err?.message || err);
      res.json({
        status: "fallback",
        insights: [
          {
            type: "summary",
            title: "Diagnóstico Financeiro",
            description: "Análise realizada com métricas internas do WL System baseada nos lançamentos cadastrados."
          }
        ],
        score: 82
      });
    }
  });

  app.get("/api/data", async (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/data requested`);
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      console.log("Data file not found, returning initial state");
      res.json({ expenses: [], subCategories: [], appUsers: [] });
    }
  });

  app.post("/api/data", async (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/data requested`);
    try {
      const newData = req.body;
      
      // 1. Create a backup of the current state before saving
      let currentExists = false;
      try {
        await fs.access(DATA_FILE);
        currentExists = true;
      } catch (e) {}

      if (currentExists) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupName = `backup_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupName);
        
        await fs.copyFile(DATA_FILE, backupPath);

        // 2. Manage backups (keep only latest 5)
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files
          .filter(f => f.startsWith("backup_") && f.endsWith(".json"))
          .map(f => ({ name: f, time: f.split("_")[1].replace("-json", "") }))
          .sort((a, b) => a.name.localeCompare(b.name));

        if (backupFiles.length > 5) {
          const filesToDelete = backupFiles.slice(0, backupFiles.length - 5);
          for (const file of filesToDelete) {
            await fs.unlink(path.join(BACKUP_DIR, file.name));
          }
        }
      }

      // 3. Save the new data
      await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));
      console.log("Data saved successfully");
      res.json({ success: true });
    } catch (err) {
      console.error("Error saving data:", err);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development or fallback if dist is not built yet
  const distPath = path.join(process.cwd(), "dist");
  let hasDist = false;
  try {
    await fs.access(distPath);
    hasDist = true;
  } catch {}

  if (process.env.NODE_ENV !== "production" || !hasDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
