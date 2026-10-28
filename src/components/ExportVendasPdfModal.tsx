import React, { useState, useMemo } from 'react';
import { X, FileDown, Calendar, Filter, TrendingUp, Landmark, CheckCircle2 } from 'lucide-react';
import { Sale, Expense, CompanySettings } from '../types';
import { exportSalesEntriesPDF, exportDRE_PDF, formatCurrencyBRL } from '../services/pdfExport';

interface ExportVendasPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'entradas' | 'dre';
  sales: Sale[];
  expenses: Expense[];
  settings?: CompanySettings;
}

export const ExportVendasPdfModal: React.FC<ExportVendasPdfModalProps> = ({
  isOpen,
  onClose,
  mode,
  sales,
  expenses,
  settings,
}) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const d = s.date;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      if (mode === 'entradas' && selectedCity !== 'all' && s.city !== selectedCity) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, startDate, endDate, selectedCity, mode]);

  // Filtered expenses (for DRE comparison with Sales)
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = (e.date || e.expenseDate || '').slice(0, 10);
      if (!d) return true;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [expenses, startDate, endDate]);

  // Calculations
  const totalSales = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  }, [filteredSales]);

  const totalReceived = useMemo(() => {
    return filteredSales
      .filter((s) => s.status === 'recebido')
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
  }, [filteredSales]);

  const totalPending = totalSales - totalReceived;

  // DRE Metrics
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + Number(e.amount || e.value || 0), 0);
  }, [filteredExpenses]);

  const netResult = totalSales - totalExpenses;
  const isLucro = netResult >= 0;
  const netMargin = totalSales > 0 ? (netResult / totalSales) * 100 : 0;

  const citiesList = useMemo(() => {
    return Array.from(new Set(sales.map((s) => s.city).filter(Boolean))).sort();
  }, [sales]);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    const startFormatted = startDate ? startDate.split('-').reverse().join('/') : 'Início';
    const endFormatted = endDate ? endDate.split('-').reverse().join('/') : 'Atual';
    const cityNote = selectedCity !== 'all' ? ` • Praça: ${selectedCity}` : '';
    const periodLabel = `Período: ${startFormatted} até ${endFormatted}${cityNote}`;

    const defaultSettings: CompanySettings = settings || {
      companyName: 'WL SYSTEM',
      currency: 'BRL',
    };

    if (mode === 'entradas') {
      if (filteredSales.length === 0) {
        alert('Nenhuma venda encontrada no período selecionado.');
        return;
      }
      await exportSalesEntriesPDF(filteredSales, defaultSettings, periodLabel);
    } else {
      await exportDRE_PDF(filteredSales, filteredExpenses, defaultSettings, periodLabel);
    }

    onClose();
  };

  const setShortcut = (type: 'current_month' | 'last_month' | 'year' | 'all') => {
    const now = new Date();
    if (type === 'current_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (type === 'last_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10));
      setEndDate(new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10));
    } else if (type === 'year') {
      setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#131418] border border-[#262833] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2128] flex items-center justify-between bg-[#16171d]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${mode === 'dre' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {mode === 'dre' ? <Landmark className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
            </div>
            <div>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${mode === 'dre' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {mode === 'dre' ? 'RELATÓRIO CONTÁBIL OFICIAL' : 'RELATÓRIO DE FATURAMENTO'}
              </span>
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                {mode === 'dre' ? 'DRE - Demonstração de Resultado' : 'Relatório de Entradas (Vendas)'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleExport} className="p-6 space-y-4">
          
          <p className="text-xs text-zinc-400 leading-relaxed">
            {mode === 'dre'
              ? 'O relatório DRE realiza o comparativo oficial entre o faturamento (Aba de Vendas) e os gastos realizados (Área de Despesas) no período escolhido, calculando se a empresa obteve Lucro ou Prejuízo.'
              : 'Selecione a data inicial e final para exportar todas as vendas e faturamentos com detalhamento por praça.'}
          </p>

          {/* Quick Shortcuts */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Atalhos de Período:
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setShortcut('current_month')}
                className="px-2.5 py-1 rounded-lg bg-[#181920] hover:bg-[#22242e] text-[11px] font-semibold text-zinc-300 border border-[#23252d] transition"
              >
                Mês Atual
              </button>
              <button
                type="button"
                onClick={() => setShortcut('last_month')}
                className="px-2.5 py-1 rounded-lg bg-[#181920] hover:bg-[#22242e] text-[11px] font-semibold text-zinc-300 border border-[#23252d] transition"
              >
                Mês Anterior
              </button>
              <button
                type="button"
                onClick={() => setShortcut('year')}
                className="px-2.5 py-1 rounded-lg bg-[#181920] hover:bg-[#22242e] text-[11px] font-semibold text-zinc-300 border border-[#23252d] transition"
              >
                Ano 2026
              </button>
              <button
                type="button"
                onClick={() => setShortcut('all')}
                className="px-2.5 py-1 rounded-lg bg-[#181920] hover:bg-[#22242e] text-[11px] font-semibold text-zinc-300 border border-[#23252d] transition"
              >
                Todo o Período
              </button>
            </div>
          </div>

          {/* Dates Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>Data Inicial (De) *</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-zinc-400" />
                <span>Data Final (Até) *</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Optional Filter by City in Entradas mode */}
          {mode === 'entradas' && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Filtrar Praça / Cidade:
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="all">Todas as Cidades (Consolidado Geral)</option>
                {citiesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary Preview Box */}
          {mode === 'entradas' ? (
            <div className="p-3.5 rounded-xl bg-[#17181e] border border-[#20222a] space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Vendas no período:</span>
                <strong className="text-white font-mono">{filteredSales.length} lançamentos</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Recebido em caixa:</span>
                <strong className="text-emerald-400 font-mono font-bold">
                  {formatCurrencyBRL(totalReceived)}
                </strong>
              </div>
              {totalPending > 0 && (
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>A receber (pendente):</span>
                  <strong className="text-amber-400 font-mono font-bold">
                    {formatCurrencyBRL(totalPending)}
                  </strong>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-zinc-300 pt-1.5 border-t border-[#23252d]">
                <span className="font-bold">Total Faturado no Período:</span>
                <strong className="text-[#00e676] font-mono font-black text-sm">
                  {formatCurrencyBRL(totalSales)}
                </strong>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#17181e] border border-indigo-500/20 space-y-2.5">
              <div className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase pb-1 border-b border-[#232533] flex items-center justify-between">
                <span>Comparativo Vendas vs Despesas</span>
                <span>{filteredSales.length} vendas • {filteredExpenses.length} despesas</span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>(+) Faturamento Bruto (Aba Vendas):</span>
                <strong className="text-[#00e676] font-mono font-bold">
                  {formatCurrencyBRL(totalSales)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>(-) Custos & Gastos (Área Despesas):</span>
                <strong className="text-red-400 font-mono font-bold">
                  -{formatCurrencyBRL(totalExpenses)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-100 pt-2 border-t border-[#23252d]">
                <span className="font-extrabold flex items-center gap-1">
                  <span>(=)</span>
                  <span>{isLucro ? 'LUCRO LÍQUIDO APURADO:' : 'PREJUÍZO NO PERÍODO:'}</span>
                </span>
                <strong className={`font-mono font-black text-sm ${isLucro ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrencyBRL(netResult)} ({netMargin.toFixed(1)}%)
                </strong>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#1f2128] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1a1b22] hover:bg-[#22242c] text-zinc-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-black text-xs font-extrabold uppercase shadow-lg transition flex items-center gap-1.5 ${
                mode === 'dre'
                  ? 'bg-indigo-400 hover:bg-indigo-300'
                  : 'bg-emerald-400 hover:bg-emerald-300'
              }`}
            >
              <FileDown className="w-3.5 h-3.5 text-black" />
              <span>Gerar Relatório em PDF</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
