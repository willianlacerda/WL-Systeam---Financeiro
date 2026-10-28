import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Expense, CompanySettings, Sale } from '../types';

export const formatCurrencyBRL = (value: number): string => {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Helper to fetch logo data URL safely
async function getLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// 1. Relatório Detalhado de Lançamentos (Histórico)
export async function exportFinancialReportPDF(
  expenses: Expense[],
  settings?: CompanySettings,
  filterDescription?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyName = settings?.companyName || 'WL SYSTEM';
  const logoDataUrl = await getLogoDataUrl();

  // Top Dark Banner (210mm x 34mm)
  doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
  doc.rect(0, 0, 210, 34, 'F');

  // Vibrant Green Accent Stripe
  doc.setFillColor(0, 230, 118); // #00e676
  doc.rect(0, 34, 210, 1.5, 'F');

  // Logo rendering
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 7, 20, 20);
    } catch {
      // Fallback WL badge
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WL', 18, 19);
    }
  } else {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WL', 18, 19);
  }

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 36, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SISTEMA DE GESTÃO FINANCEIRA EMPRESARIAL', 36, 23);

  // Right Top Metadata
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const tagDoc = 'RELATÓRIO ANALÍTICO DE DESPESAS';
  doc.text(tagDoc, 198 - doc.getTextWidth(tagDoc), 15);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const emissaoStr = `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;
  doc.text(emissaoStr, 198 - doc.getTextWidth(emissaoStr), 23);

  // Filter Box / Scope Bar
  let currentY = 40;
  if (filterDescription) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, currentY, 186, 8, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Filtro Aplicado: ${filterDescription} • Total de ${expenses.length} lançamentos`, 16, currentY + 5.2);
    currentY += 12;
  }

  // Summary statistics (strictly 2 decimal digits)
  const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  const paid = expenses.filter(e => e.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  const pending = expenses.filter(e => e.status === 'pendente').reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  const scheduled = expenses.filter(e => e.status === 'agendado').reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);

  // 4 Modern KPI Cards (Width each: 43.5mm, gap: 4mm)
  const cardW = 43.5;
  const cardH = 19;
  const gap = 4;
  const startX = 12;

  // Card 1: Total Geral
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(startX, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DESPESAS', startX + 4, currentY + 6);
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(total), startX + 4, currentY + 14);

  // Card 2: Pagas
  const c2X = startX + cardW + gap;
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208); // green-200
  doc.roundedRect(c2X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LIQUIDADO (PAGO)', c2X + 4, currentY + 6);
  doc.setTextColor(20, 83, 45);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(paid), c2X + 4, currentY + 14);

  // Card 3: Pendentes
  const c3X = c2X + cardW + gap;
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(c3X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PENDENTE A PAGAR', c3X + 4, currentY + 6);
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(pending), c3X + 4, currentY + 14);

  // Card 4: Agendadas
  const c4X = c3X + cardW + gap;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.roundedRect(c4X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AGENDADO / FUTURO', c4X + 4, currentY + 6);
  doc.setTextColor(49, 46, 129);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(scheduled), c4X + 4, currentY + 14);

  currentY += cardH + 7;

  // Table Data: 186mm total width (22 + 66 + 26 + 26 + 18 + 28 = 186mm)
  const tableRows = expenses.map(e => {
    let dateStr = e.date || e.expenseDate || '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const desc = (e.description || e.subCategory || e.category || '').toUpperCase();
    const obs = e.notes || e.observation ? `\nObs: ${e.notes || e.observation}` : '';
    const fullDesc = `${desc}${obs}`;

    const user = (e.user || e.createdBy || '-').toUpperCase();
    const method = (e.paymentMethod || 'TRANSFERÊNCIA').toUpperCase().replace('_', ' ');
    const status = (e.status || 'PAGO').toUpperCase();
    const amountVal = formatCurrencyBRL(Number(e.amount || e.value || 0));

    return [dateStr, fullDesc, user, method, status, amountVal];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    head: [['Data', 'Item de Despesa / Observação', 'Responsável', 'Forma Pagto', 'Status', 'Valor (R$)']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 66, fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      // Draw status tag nicely
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw || '').toUpperCase();
        const posX = data.cell.x + 2;
        const posY = data.cell.y + 2;
        const width = data.cell.width - 4;
        const height = data.cell.height - 4;

        if (val === 'PAGO') {
          doc.setFillColor(220, 252, 231); // emerald-100
          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setTextColor(21, 128, 61);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text('PAGO', posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        } else if (val === 'PENDENTE') {
          doc.setFillColor(254, 243, 199); // amber-100
          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setTextColor(180, 83, 9);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text('PENDENTE', posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        } else {
          doc.setFillColor(224, 231, 255); // indigo-100
          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setTextColor(67, 56, 202);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text('AGENDADO', posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        }
      }
    },
    foot: [
      ['', 'TOTAL GERAL CONSOLIDADO', '', '', `${expenses.length} itens`, formatCurrencyBRL(total)]
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
      cellPadding: 3,
    }
  });

  // Modern Page Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, 287, 198, 287);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('WL System • Gestão Financeira Empresarial', 12, 291.5);
    doc.text('Documento oficial consolidado eletronicamente', 105, 291.5, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 198, 291.5, { align: 'right' });
  }

  doc.save(`WL-System-Relatorio-Despesas-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 2. Relatório Executivo de Ranking de Alocação de Despesas
export async function exportRankingReportPDF(
  expenses: Expense[],
  settings?: CompanySettings,
  periodDescription?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyName = settings?.companyName || 'WL SYSTEM';
  const logoDataUrl = await getLogoDataUrl();

  // Top Dark Banner (210mm x 34mm)
  doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
  doc.rect(0, 0, 210, 34, 'F');

  // Vibrant Green Accent Stripe
  doc.setFillColor(0, 230, 118); // #00e676
  doc.rect(0, 34, 210, 1.5, 'F');

  // Logo rendering
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 7, 20, 20);
    } catch {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WL', 18, 19);
    }
  } else {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('WL', 18, 19);
  }

  // Company Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 36, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('DEMONSTRATIVO EXECUTIVO DE ALOCAÇÃO DE RECURSOS', 36, 23);

  // Right Top Metadata
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const tagDoc = 'RANKING DE ALOCAÇÃO POR DESPESA';
  doc.text(tagDoc, 198 - doc.getTextWidth(tagDoc), 15);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const emissaoStr = `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;
  doc.text(emissaoStr, 198 - doc.getTextWidth(emissaoStr), 23);

  // Calculate ranking
  const grandTotal = expenses.reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  const map = new Map<string, number>();

  expenses.forEach(e => {
    const name = (e.description || e.subCategory || e.category || 'OUTROS').toUpperCase();
    const val = Number(e.amount || e.value || 0);
    map.set(name, (map.get(name) || 0) + val);
  });

  const ranking = Array.from(map.entries()).map(([item, volume]) => ({
    item,
    volume,
    percent: grandTotal > 0 ? (volume / grandTotal) * 100 : 0,
  })).sort((a, b) => b.volume - a.volume);

  const top1 = ranking[0];
  const top3Volume = ranking.slice(0, 3).reduce((a, b) => a + b.volume, 0);
  const top3Percent = grandTotal > 0 ? (top3Volume / grandTotal) * 100 : 0;

  // Filter Box
  let currentY = 40;
  if (periodDescription) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, currentY, 186, 8, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Filtro Aplicado: ${periodDescription} • ${ranking.length} centros de custos avaliados`, 16, currentY + 5.2);
    currentY += 12;
  }

  // 3 Large Executive Cards (Width: 59mm each, gap: 4.5mm)
  const cW = 59;
  const cH = 20;
  const cGap = 4.5;
  const sX = 12;

  // Card 1: Volume Total Alocado
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(sX, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('VOLUME TOTAL ALOCADO', sX + 4, currentY + 6.5);
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(10.5);
  doc.text(formatCurrencyBRL(grandTotal), sX + 4, currentY + 15);

  // Card 2: Maior Despesa (Top 1)
  const c2_X = sX + cW + cGap;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(c2_X, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('MAIOR CENTRO DE CUSTO (TOP 1)', c2_X + 4, currentY + 6.5);
  doc.setTextColor(20, 83, 45);
  doc.setFontSize(9);
  doc.text(top1 ? `${top1.item.slice(0, 24)}` : '-', c2_X + 4, currentY + 12);
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text(top1 ? `${formatCurrencyBRL(top1.volume)} (${top1.percent.toFixed(1)}%)` : '', c2_X + 4, currentY + 16.5);

  // Card 3: Concentração Top 3
  const c3_X = c2_X + cW + cGap;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(c3_X, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCENTRAÇÃO DOS TOP 3 GASTOS', c3_X + 4, currentY + 6.5);
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(10.5);
  doc.text(`${top3Percent.toFixed(1)}% do total`, c3_X + 4, currentY + 15);

  currentY += cH + 8;

  // Ranking Table (186mm available: 16 + 86 + 44 + 40 = 186mm)
  const rankingRows = ranking.map((r, idx) => [
    `${idx + 1}º`,
    r.item,
    formatCurrencyBRL(r.volume),
    `${r.percent.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    head: [['Pos.', 'Item de Despesa / Centro de Custo', 'Volume Alocado (R$)', 'Participação (%)']],
    body: rankingRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 86, fontStyle: 'bold' },
      2: { cellWidth: 44, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 40, halign: 'right' },
    },
    didDrawCell: (data) => {
      // Highlight top 3 rank positions nicely
      if (data.section === 'body' && data.column.index === 0) {
        const rowIdx = data.row.index;
        if (rowIdx < 3) {
          const posX = data.cell.x + 2;
          const posY = data.cell.y + 2;
          const width = data.cell.width - 4;
          const height = data.cell.height - 4;

          if (rowIdx === 0) {
            doc.setFillColor(254, 240, 138); // Gold #fef08a
            doc.setTextColor(133, 77, 14);
          } else if (rowIdx === 1) {
            doc.setFillColor(226, 232, 240); // Silver #e2e8f0
            doc.setTextColor(51, 65, 85);
          } else {
            doc.setFillColor(254, 215, 170); // Bronze #fed7aa
            doc.setTextColor(154, 52, 18);
          }

          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text(`${rowIdx + 1}º`, posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        }
      }
    },
    foot: [
      ['', 'TOTAL GERAL ALOCADO', formatCurrencyBRL(grandTotal), '100.0%']
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
      cellPadding: 3,
    }
  });

  // Modern Page Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, 287, 198, 287);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('WL System • Demonstrativo de Alocação de Recursos', 12, 291.5);
    doc.text('Auditoria Financeira Automatizada', 105, 291.5, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 198, 291.5, { align: 'right' });
  }

  doc.save(`WL-System-Ranking-Alocacao-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 3. Relatório de Entradas / Vendas por Cidade (PDF)
export async function exportSalesEntriesPDF(
  sales: Sale[],
  settings?: CompanySettings,
  periodDescription?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyName = settings?.companyName || 'WL SYSTEM';
  const logoDataUrl = await getLogoDataUrl();

  // Top Dark Banner (210mm x 34mm)
  doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
  doc.rect(0, 0, 210, 34, 'F');

  // Vibrant Green Accent Stripe
  doc.setFillColor(0, 230, 118); // #00e676
  doc.rect(0, 34, 210, 1.5, 'F');

  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 7, 20, 20);
    } catch {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WL', 18, 19);
    }
  }

  // Company Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 36, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('RELATÓRIO DE ENTRADAS & FATURAMENTO POR CIDADE', 36, 23);

  // Right Top Metadata
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const tagDoc = 'DEMONSTRATIVO DE RECEITAS';
  doc.text(tagDoc, 198 - doc.getTextWidth(tagDoc), 15);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const emissaoStr = `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;
  doc.text(emissaoStr, 198 - doc.getTextWidth(emissaoStr), 23);

  let currentY = 40;
  if (periodDescription) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, currentY, 186, 8, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Filtro Aplicado: ${periodDescription} • Total de ${sales.length} vendas registradas`, 16, currentY + 5.2);
    currentY += 12;
  }

  // Totals
  const totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalReceived = sales.filter(s => s.status === 'recebido').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalPending = totalSales - totalReceived;

  // City Breakdown
  const cityMap = new Map<string, number>();
  sales.forEach(s => {
    const c = (s.city || 'NÃO INFORMADA').toUpperCase();
    cityMap.set(c, (cityMap.get(c) || 0) + Number(s.amount || 0));
  });
  const cityRanking = Array.from(cityMap.entries()).map(([city, volume]) => ({
    city,
    volume,
    percent: totalSales > 0 ? (volume / totalSales) * 100 : 0
  })).sort((a, b) => b.volume - a.volume);

  const topCity = cityRanking[0];

  // 4 Modern KPI Cards
  const cardW = 43.5;
  const cardH = 19;
  const gap = 4;
  const startX = 12;

  // Card 1: Total
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(startX, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL ENTRADAS', startX + 4, currentY + 6);
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(totalSales), startX + 4, currentY + 14);

  // Card 2: Recebido
  const c2X = startX + cardW + gap;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(c2X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURADO RECEBIDO', c2X + 4, currentY + 6);
  doc.setTextColor(20, 83, 45);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(totalReceived), c2X + 4, currentY + 14);

  // Card 3: A Receber
  const c3X = c2X + cardW + gap;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(c3X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTAS A RECEBER', c3X + 4, currentY + 6);
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(9.5);
  doc.text(formatCurrencyBRL(totalPending), c3X + 4, currentY + 14);

  // Card 4: Top Cidade
  const c4X = c3X + cardW + gap;
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(c4X, currentY, cardW, cardH, 2.5, 2.5, 'FD');
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRINCIPAL PRAÇA', c4X + 4, currentY + 6);
  doc.setTextColor(49, 46, 129);
  doc.setFontSize(8);
  doc.text(topCity ? `${topCity.city.slice(0, 16)} (${topCity.percent.toFixed(0)}%)` : '-', c4X + 4, currentY + 14);

  currentY += cardH + 7;

  // Table Data (186mm total width: 20 + 64 + 32 + 24 + 18 + 28 = 186mm)
  const salesRows = sales.map(s => {
    let dateStr = s.date || '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    const desc = (s.description || 'VENDA DE MERCADORIA').toUpperCase();
    const city = (s.city || 'GERAL').toUpperCase();
    const method = (s.paymentMethod || 'DINHEIRO').toUpperCase().replace('_', ' ');
    const status = s.status === 'recebido' ? 'RECEBIDO' : 'A RECEBER';
    const amountVal = formatCurrencyBRL(Number(s.amount || 0));

    return [dateStr, desc, city, method, status, amountVal];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    head: [['Data', 'Descrição da Venda', 'Cidade / Praça', 'Forma Pagto', 'Status', 'Valor (R$)']],
    body: salesRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 24 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = String(data.cell.raw || '').toUpperCase();
        const posX = data.cell.x + 1.5;
        const posY = data.cell.y + 2;
        const width = data.cell.width - 3;
        const height = data.cell.height - 4;

        if (val === 'RECEBIDO') {
          doc.setFillColor(220, 252, 231);
          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setTextColor(21, 128, 61);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text('RECEBIDO', posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        } else {
          doc.setFillColor(254, 243, 199);
          doc.roundedRect(posX, posY, width, height, 1.5, 1.5, 'F');
          doc.setTextColor(180, 83, 9);
          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.text('A RECEBER', posX + width / 2, posY + height / 2 + 1, { align: 'center' });
        }
      }
    },
    foot: [
      ['', 'TOTAL GERAL DE ENTRADAS', '', '', `${sales.length} vendas`, formatCurrencyBRL(totalSales)]
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
      cellPadding: 3,
    }
  });

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, 287, 198, 287);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('WL System • Relatório de Entradas e Faturamento', 12, 291.5);
    doc.text('Documento Auditado e Consolidado', 105, 291.5, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 198, 291.5, { align: 'right' });
  }

  doc.save(`WL-System-Relatorio-Entradas-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// 4. Relatório Oficial DRE (Demonstração do Resultado do Exercício)
export async function exportDRE_PDF(
  sales: Sale[],
  expenses: Expense[],
  settings?: CompanySettings,
  periodDescription?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const companyName = settings?.companyName || 'WL SYSTEM';
  const logoDataUrl = await getLogoDataUrl();

  // Top Dark Banner
  doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
  doc.rect(0, 0, 210, 34, 'F');

  // Vibrant Green Accent Stripe
  doc.setFillColor(0, 230, 118); // #00e676
  doc.rect(0, 34, 210, 1.5, 'F');

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, 7, 20, 20);
    } catch {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(12, 7, 20, 20, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('WL', 18, 19);
    }
  }

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 36, 16);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)', 36, 23);

  // Right Top Metadata
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  const tagDoc = 'BALANÇO FINANCEIRO DE RESULTADO';
  doc.text(tagDoc, 198 - doc.getTextWidth(tagDoc), 15);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const emissaoStr = `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`;
  doc.text(emissaoStr, 198 - doc.getTextWidth(emissaoStr), 23);

  // Calculations for DRE
  // 1. Receita Bruta de Vendas
  const receitaBruta = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  
  // 2. Custos das Mercadorias Vendidas (CMV)
  const cmv = expenses
    .filter(e => (e.category || '').toUpperCase().includes('MERCADORIA') || (e.description || '').toUpperCase().includes('COMPRAS'))
    .reduce((a, b) => a + Number(b.amount || b.value || 0), 0);
  
  // Lucro Bruto
  const lucroBruto = receitaBruta - cmv;
  const margemBruta = receitaBruta > 0 ? (lucroBruto / receitaBruta) * 100 : 0;

  // 3. Despesas Operacionais com Logística & Frota
  const despLogistica = expenses
    .filter(e => (e.category || '').toUpperCase().includes('LOGÍSTICA') || (e.description || '').toUpperCase().includes('COMBUSTÍVEL') || (e.description || '').toUpperCase().includes('VEÍCULO') || (e.description || '').toUpperCase().includes('BALSA'))
    .reduce((a, b) => a + Number(b.amount || b.value || 0), 0);

  // 4. Despesas Administrativas & Gerais
  const despAdmin = expenses
    .filter(e => (e.category || '').toUpperCase().includes('ADMINISTRATIVA') || (e.description || '').toUpperCase().includes('ENERGIA') || (e.description || '').toUpperCase().includes('ÁGUA') || (e.description || '').toUpperCase().includes('INTERNET') || (e.description || '').toUpperCase().includes('MATERIAL'))
    .reduce((a, b) => a + Number(b.amount || b.value || 0), 0);

  // 5. Pessoal & Diaristas
  const despPessoal = expenses
    .filter(e => (e.category || '').toUpperCase().includes('PESSOAL') || (e.description || '').toUpperCase().includes('FOLHA') || (e.description || '').toUpperCase().includes('DIARISTA') || (e.description || '').toUpperCase().includes('REFEIÇ'))
    .reduce((a, b) => a + Number(b.amount || b.value || 0), 0);

  // 6. Impostos & Tributos
  const despImpostos = expenses
    .filter(e => (e.category || '').toUpperCase().includes('IMPOSTO') || (e.description || '').toUpperCase().includes('IMPOSTOS') || (e.description || '').toUpperCase().includes('TRIBUT'))
    .reduce((a, b) => a + Number(b.amount || b.value || 0), 0);

  // Outras Despesas
  const totalExpenses = expenses.reduce((a, b) => a + Number(b.amount || b.value || 0), 0);
  const somatorioDespesas = cmv + despLogistica + despAdmin + despPessoal + despImpostos;
  const outrasDespesas = Math.max(0, totalExpenses - somatorioDespesas);

  // Resultado Líquido Final (Lucro ou Prejuízo)
  const totalDesembolsos = totalExpenses;
  const resultadoLiquido = receitaBruta - totalDesembolsos;
  const margemLiquida = receitaBruta > 0 ? (resultadoLiquido / receitaBruta) * 100 : 0;
  const isLucro = resultadoLiquido >= 0;

  let currentY = 40;
  if (periodDescription) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, currentY, 186, 8, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Período de Apuração: ${periodDescription} • Análise de Resultado Contábil (Vendas vs Despesas)`, 16, currentY + 5.2);
    currentY += 12;
  }

  // 3 Top Executive Cards (59mm each)
  const cW = 59;
  const cH = 20;
  const cGap = 4.5;
  const sX = 12;

  // Card 1: Vendas Brutas
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  doc.roundedRect(sX, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEITA BRUTA DE VENDAS', sX + 4, currentY + 6.5);
  doc.setTextColor(0, 230, 118);
  doc.setFontSize(10.5);
  doc.text(formatCurrencyBRL(receitaBruta), sX + 4, currentY + 15);

  // Card 2: Total de Despesas
  const c2_X = sX + cW + cGap;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(c2_X, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DE CUSTOS & DESPESAS', c2_X + 4, currentY + 6.5);
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(10.5);
  doc.text(formatCurrencyBRL(totalDesembolsos), c2_X + 4, currentY + 15);

  // Card 3: Resultado Líquido
  const c3_X = c2_X + cW + cGap;
  doc.setFillColor(isLucro ? 240 : 254, isLucro ? 253 : 242, isLucro ? 244 : 242);
  doc.setDrawColor(isLucro ? 187 : 254, isLucro ? 247 : 202, isLucro ? 208 : 202);
  doc.roundedRect(c3_X, currentY, cW, cH, 2.5, 2.5, 'FD');
  doc.setTextColor(isLucro ? 22 : 185, isLucro ? 101 : 28, isLucro ? 52 : 28);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(isLucro ? 'LUCRO LÍQUIDO DO PERÍODO' : 'PREJUÍZO LÍQUIDO DO PERÍODO', c3_X + 4, currentY + 6.5);
  doc.setFontSize(10.5);
  doc.text(`${formatCurrencyBRL(resultadoLiquido)} (${margemLiquida.toFixed(1)}%)`, c3_X + 4, currentY + 15);

  currentY += cH + 8;

  // DRE Table (186mm width: 18 + 96 + 42 + 30 = 186mm)
  const formatPercent = (v: number) => receitaBruta > 0 ? `${((v / receitaBruta) * 100).toFixed(1)}%` : '0.0%';

  const dreRows: any[] = [
    ['1.0', '(+) RECEITA BRUTA OPERACIONAL (ABA DE VENDAS)', formatCurrencyBRL(receitaBruta), '100.0%'],
    ['2.0', '(-) Custo das Mercadorias / CMV (Área de Despesas)', `-${formatCurrencyBRL(cmv)}`, `-${formatPercent(cmv)}`],
    ['3.0', '(=) LUCRO BRUTO OPERACIONAL (Vendas - Mercadorias)', formatCurrencyBRL(lucroBruto), `${margemBruta.toFixed(1)}%`],
    ['4.0', '(-) Despesas com Logística, Frota & Combustível (Área Despesas)', `-${formatCurrencyBRL(despLogistica)}`, `-${formatPercent(despLogistica)}`],
    ['5.0', '(-) Despesas com Pessoal, Salários & Diárias (Área Despesas)', `-${formatCurrencyBRL(despPessoal)}`, `-${formatPercent(despPessoal)}`],
    ['6.0', '(-) Despesas Administrativas & Infraestrutura (Área Despesas)', `-${formatCurrencyBRL(despAdmin)}`, `-${formatPercent(despAdmin)}`],
    ['7.0', '(-) Tributos, Impostos & Encargos Fiscais (Área Despesas)', `-${formatCurrencyBRL(despImpostos)}`, `-${formatPercent(despImpostos)}`],
  ];

  if (outrasDespesas > 0) {
    dreRows.push(['8.0', '(-) Outras Despesas e Custos Registrados (Área Despesas)', `-${formatCurrencyBRL(outrasDespesas)}`, `-${formatPercent(outrasDespesas)}`]);
  }

  dreRows.push(['9.0', isLucro ? '(=) LUCRO LÍQUIDO DO EXERCÍCIO' : '(=) PREJUÍZO LÍQUIDO DO EXERCÍCIO', formatCurrencyBRL(resultadoLiquido), `${margemLiquida.toFixed(1)}%`]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    head: [['Item', 'Discriminação das Contas do Exercício (DRE)', 'Valor Apurado (R$)', 'Análise Vertical (%)']],
    body: dreRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 96 },
      2: { cellWidth: 44, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 30, halign: 'right' },
    },
    didDrawCell: (data) => {
      // Highlight main subtotals and final result
      if (data.section === 'body') {
        const text = String(data.cell.raw || '');
        if (text.includes('(=)') || text.includes('RECEITA BRUTA')) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    foot: [
      ['', isLucro ? 'RESULTADO FINAL: LUCRO LÍQUIDO' : 'RESULTADO FINAL: PREJUÍZO', formatCurrencyBRL(resultadoLiquido), `${margemLiquida.toFixed(1)}%`]
    ],
    footStyles: {
      fillColor: isLucro ? [220, 252, 231] : [254, 226, 226],
      textColor: isLucro ? [21, 128, 61] : [185, 28, 28],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'right',
      cellPadding: 3.5,
    }
  });

  // Secondary Table: Detalhamento por Categoria de Despesas (Área de Despesas)
  const catMap = new Map<string, number>();
  expenses.forEach(e => {
    const cat = (e.category || 'OUTROS').toUpperCase();
    const val = Number(e.amount ?? e.value ?? 0);
    catMap.set(cat, (catMap.get(cat) || 0) + val);
  });

  const categoryBreakdown = Array.from(catMap.entries())
    .map(([cat, val]) => ({
      cat,
      val,
      pctDespesas: totalExpenses > 0 ? (val / totalExpenses) * 100 : 0,
      pctVendas: receitaBruta > 0 ? (val / receitaBruta) * 100 : 0,
    }))
    .sort((a, b) => b.val - a.val);

  if (categoryBreakdown.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || currentY + 110;
    
    // Check if we need space or if it fits
    const startNext = finalY > 230 ? 40 : finalY + 8;
    if (finalY > 230) {
      doc.addPage();
    }

    autoTable(doc, {
      startY: startNext,
      margin: { left: 12, right: 12 },
      head: [['Detalhamento das Despesas por Categoria (Área Despesas)', 'Valor Gasto (R$)', '% Despesas', 'Impacto s/ Vendas']],
      body: categoryBreakdown.map(c => [
        c.cat,
        formatCurrencyBRL(c.val),
        `${c.pctDespesas.toFixed(1)}%`,
        `${c.pctVendas.toFixed(1)}%`
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        cellPadding: 2.5,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 96, fontStyle: 'bold' },
        1: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 27, halign: 'right' },
        3: { cellWidth: 27, halign: 'right' },
      },
      foot: [
        ['TOTAL CONSOLIDADO DE GASTOS', formatCurrencyBRL(totalExpenses), '100.0%', formatPercent(totalExpenses)]
      ],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'right',
        cellPadding: 2.8,
      }
    });
  }

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, 287, 198, 287);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('WL System • Demonstração do Resultado do Exercício (DRE)', 12, 291.5);
    doc.text('Balanço Contábil Oficial', 105, 291.5, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 198, 291.5, { align: 'right' });
  }

  doc.save(`WL-System-DRE-Resultado-${new Date().toISOString().slice(0, 10)}.pdf`);
}

