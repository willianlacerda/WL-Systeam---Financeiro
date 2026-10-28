const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

// Localização dos dados no executável (na mesma pasta do executável para facilitar o uso com Google Drive)
const getDataPath = () => {
  const isDev = !app.isPackaged;
  
  // No modo Portável do Electron Builder, o app é extraído para um diretório temporário.
  // Para salvar REALMENTE onde o .exe está (ex: no Google Drive), precisamos usar PORTABLE_EXECUTABLE_DIR.
  let baseDir;
  
  if (isDev) {
    baseDir = app.getPath('userData');
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    baseDir = process.env.PORTABLE_EXECUTABLE_DIR;
  } else {
    baseDir = path.dirname(app.getPath('exe'));
  }
  
  const dataDir = path.join(baseDir, 'data_wl_system');
  const paths = {
    dir: dataDir,
    backups: path.join(dataDir, 'backups'),
    file: path.join(dataDir, 'financial_data.json')
  };
  
  console.log("Caminho de dados garantido na pasta do sistema:", paths.dir);
  return paths;
};

// Handlers para o Frontend (Via IPC)
ipcMain.handle('get-data', async () => {
  const paths = getDataPath();
  try {
    const data = await fs.readFile(paths.file, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { expenses: [], subCategories: [], appUsers: [] };
  }
});

ipcMain.handle('save-data', async (event, newData) => {
  const paths = getDataPath();
  try {
    await fs.mkdir(paths.dir, { recursive: true });
    await fs.mkdir(paths.backups, { recursive: true });

    // Backup rotativo (simplificado para o Electron)
    try {
      await fs.access(paths.file);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await fs.copyFile(paths.file, path.join(paths.backups, `backup_${timestamp}.json`));
      
      const files = await fs.readdir(paths.backups);
      const backups = files.filter(f => f.startsWith('backup_')).sort();
      if (backups.length > 5) {
        await fs.unlink(path.join(paths.backups, backups[0]));
      }
    } catch (e) {}

    await fs.writeFile(paths.file, JSON.stringify(newData, null, 2));
    return { success: true };
  } catch (err) {
    console.error("Erro ao salvar no Electron (Async):", err);
    throw err;
  }
});

// Handler síncrono para salvamento crítico no fechamento (X)
ipcMain.on('save-data-sync', (event, newData) => {
  const paths = getDataPath();
  try {
    const fsSync = require('fs');
    if (!fsSync.existsSync(paths.dir)) fsSync.mkdirSync(paths.dir, { recursive: true });
    fsSync.writeFileSync(paths.file, JSON.stringify(newData, null, 2));
    console.log("Salvamento síncrono concluído com sucesso.");
    event.returnValue = { success: true };
  } catch (err) {
    console.error("Erro no salvamento síncrono:", err);
    event.returnValue = { success: false, error: err.message };
  }
});

ipcMain.handle('save-logo', async (event, dataBase64) => {
  const paths = getDataPath();
  try {
    const buffer = Buffer.from(dataBase64.split(",")[1], 'base64');
    await fs.mkdir(paths.dir, { recursive: true });
    await fs.writeFile(path.join(paths.dir, 'logo_custom.png'), buffer);
    return { success: true };
  } catch (err) {
    console.error("Erro ao salvar logo:", err);
    throw err;
  }
});

// Novo Handler para ler a logo que estiver na pasta do executável
ipcMain.handle('get-external-logo', async () => {
  const paths = getDataPath();
  const logoPath = path.join(paths.dir, 'logo.png'); // Procura por logo.png na pasta de dados
  try {
    const data = await fs.readFile(logoPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (err) {
    return null; // Se não tiver a logo na pasta, usa a padrão do sistema
  }
});

function createWindow() {
  const isDev = !app.isPackaged;
  const paths = getDataPath();
  const externalLogoPath = path.join(paths.dir, 'logo.png');
  
  // Define o ícone padrão
  let windowIcon = path.join(__dirname, isDev ? 'public/logo.png' : 'dist/logo.png');

  // Se existir a logo externa, tenta usar ela como ícone da janela
  const fsSync = require('fs');
  if (fsSync.existsSync(externalLogoPath)) {
    windowIcon = externalLogoPath;
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs')
    },
    title: "WL System - Sistema Financeiro",
    backgroundColor: '#000000',
    icon: windowIcon
  });

  // Em produção, carrega do dist. Em desenvolvimento, do localhost
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
