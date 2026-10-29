import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileDown, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Landmark, 
  BarChart3, 
  ListFilter 
} from 'lucide-react';
import { Expense, Sale, CompanySettings } from '../types';
import { 
  exportFinancialReportPDF, 
  exportRankingReportPDF, 
  exportSalesEntriesPDF, 
  exportDRE_PDF, 
  formatCurrencyBRL 
} from '../services/pdfExport';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  sales?: Sale[];
  settings?: CompanySettings;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultCategory?: 'despesas' | 'vendas';
  title?: string;
  reportType?: 'ranking' | 'history' | 'dre';
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  expenses,
  sales = [],
  settings,
  defaultStartDate,
  defaultEndDate,
  defaultCategory = 'despesas',
  title = 'Exportar Relatório em PDF',
  reportType = 'ranking',
}) => {
  // Category selection: Despesas or Vendas
  const [category, setCategory] = useState<'despesas' | 'vendas'>(defaultCategory);

  // Sub-model: ranking, history, or dre
  const [modelType, setModelType] = useState<'ranking' | 'history' | 'dre'>(reportType);

  // Dates
  const [startDate, setStartDate] = useState<string>(() => {
    if (defaultStartDate) return defaultStartDate;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });

  const [endDate, setEndDate] = useState<string>(() => {
    if (defaultEndDate) return defaultEndDate;
    return new Date().toISOString().slice(0, 10);
  });

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = e.date || e.expenseDate;
      if (!d) return true;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [expenses, startDate, endDate]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = s.date;
      if (!d) return true;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [sales, startDate, endDate]);

  // Totals
  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  }, [filteredExpenses]);

  const totalSalesAmount = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filteredSales]);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    const startFormatted = startDate ? startDate.split('-').reverse().join('/') : '';
    const endFormatted = endDate ? endDate.split('-').reverse().join('/') : '';
    const periodLabel = `Período: ${startFormatted} até ${endFormatted}`;
    const companySettings = settings || { companyName: 'WL SYSTEM', currency: 'BRL' };

    if (category === 'despesas') {
      if (filteredExpenses.length === 0) {
        alert('Nenhuma despesa encontrada no período selecionado.');
        return;
      }

      if (modelType === 'ranking') {
        await exportRankingReportPDF(filteredExpenses, companySettings, periodLabel);
      } else {
        await exportFinancialReportPDF(filteredExpenses, companySettings, periodLabel);
      }
    } else {
      // Vendas
      if (modelType === 'dre') {
        if (filteredSales.length === 0 && filteredExpenses.length === 0) {
          alert('Nenhum dado financeiro encontrado no período para o DRE.');
          return;
        }
        await exportDRE_PDF(filteredSales, filteredExpenses, companySettings, periodLabel);
      } else {
        if (filteredSales.length === 0) {
          alert('Nenhuma venda encontrada no período selecionado.');
          return;
        }
        // Entradas por Cidade / Extrato de vendas
        await exportSalesEntriesPDF(filteredSales, companySettings, periodLabel);
      }
    }

    onClose();
  };

  const setShortcut = (type: 'current_month' | 'last_month' | 'year' | 'all') => {
    const now = new Date();
    if (type === 'current_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      setStartDate(start);
      setEndDate(end);
    } else if (type === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      setStartDate(start);
      setEndDate(end);
    } else if (type === 'year') {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      const end = now.toISOString().slice(0, 10);
      setStartDate(start);
      setEndDate(end);
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#131418] border border-[#262833] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f2128] flex items-center justify-between bg-[#16171d]">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleExport} className="p-6 space-y-5">
          
          {/* STEP 1: Selecionar Categoria (DESPESAS ou VENDAS) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              1. Selecione o Tipo de Movimentação:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Botão Despesas */}
              <button
                type="button"
                onClick={() => {
                  setCategory('despesas');
                  if (modelType === 'dre') setModelType('ranking');
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2.5 border ${
                  category === 'despesas'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-[#181920] border-[#2c2e38] text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <div className="text-left">
                  <div className="font-extrabold">DESPESAS</div>
                  <div className="text-[10px] text-zinc-500 font-normal lowercase">saídas e custos</div>
                </div>
              </button>

              {/* Botão Vendas */}
              <button
                type="button"
                onClick={() => setCategory('vendas')}
                className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2.5 border ${
                  category === 'vendas'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-[#00e676] shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-[#181920] border-[#2c2e38] text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-[#00e676]" />
                <div className="text-left">
                  <div className="font-extrabold">VENDAS</div>
                  <div className="text-[10px] text-zinc-500 font-normal lowercase">faturamento / praças</div>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Selecionar Formato do Documento */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              2. Modelo de Documento PDF:
            </label>

            {/* Opções quando for DESPESAS */}
            {category === 'despesas' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModelType('ranking')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 border ${
                    modelType === 'ranking'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                      : 'bg-[#181920] text-zinc-400 border-[#262833] hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Ranking de Alocação</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModelType('history')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 border ${
                    modelType === 'history'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                      : 'bg-[#181920] text-zinc-400 border-[#262833] hover:text-white'
                  }`}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Extrato Detalhado</span>
                </button>
              </div>
            )}

            {/* Opções quando for VENDAS */}
            {category === 'vendas' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModelType('ranking')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 border ${
                    modelType === 'ranking'
                      ? 'bg-emerald-500/20 text-[#00e676] border-emerald-500/40 shadow-sm'
                      : 'bg-[#181920] text-zinc-400 border-[#262833] hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Venda por Cidade</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModelType('dre')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 border ${
                    modelType === 'dre'
                      ? 'bg-emerald-500/20 text-[#00e676] border-emerald-500/40 shadow-sm'
                      : 'bg-[#181920] text-zinc-400 border-[#262833] hover:text-white'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>DRE - Resultado Líquido</span>
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: Período e Atalhos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                3. Intervalo de Datas:
              </label>
              
              {/* Quick shortcuts */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShortcut('current_month')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 hover:text-white bg-[#181920] border border-[#2c2e38] transition"
                >
                  Mês Atual
                </button>
                <button
                  type="button"
                  onClick={() => setShortcut('last_month')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 hover:text-white bg-[#181920] border border-[#2c2e38] transition"
                >
                  Mês Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setShortcut('year')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 hover:text-white bg-[#181920] border border-[#2c2e38] transition"
                >
                  Ano
                </button>
                <button
                  type="button"
                  onClick={() => setShortcut('all')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 hover:text-white bg-[#181920] border border-[#2c2e38] transition"
                >
                  Tudo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[10px] text-zinc-500 uppercase mb-1 font-bold">Data Inicial</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181920] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500 uppercase mb-1 font-bold">Data Final</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181920] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Prévia dos Registros a serem exportados */}
          <div className="p-3.5 rounded-xl bg-[#181920] border border-[#262833] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Total a emitir no documento:</span>
              <span className="font-mono font-bold text-zinc-200">
                {category === 'despesas' && `${filteredExpenses.length} despesas`}
                {category === 'vendas' && modelType !== 'dre' && `${filteredSales.length} vendas`}
                {category === 'vendas' && modelType === 'dre' && `${filteredSales.length} vendas vs ${filteredExpenses.length} despesas`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-[#262833] pt-2">
              <span className="text-zinc-400 font-semibold">Volume Financeiro:</span>
              {category === 'despesas' && (
                <span className="font-mono font-extrabold text-rose-400 text-sm">
                  - R$ {totalExpenseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              {category === 'vendas' && modelType !== 'dre' && (
                <span className="font-mono font-extrabold text-[#00e676] text-sm">
                  + R$ {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
              {category === 'vendas' && modelType === 'dre' && (
                <div className="text-right">
                  <span className={`font-mono font-extrabold text-sm ${
                    totalSalesAmount - totalExpenseAmount >= 0 ? 'text-[#00e676]' : 'text-rose-400'
                  }`}>
                    {totalSalesAmount - totalExpenseAmount >= 0 ? '+' : '-'} R$ {Math.abs(totalSalesAmount - totalExpenseAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="text-[10px] text-zinc-500">resultado líquido</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1f2128]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition text-black ${
                category === 'despesas' ? 'bg-rose-400 hover:bg-rose-300' : 'bg-[#00e676] hover:bg-[#00c853]'
              }`}
            >
              <FileDown className="w-4 h-4 text-black" />
              <span>BAIXAR PDF DE {category === 'despesas' ? 'DESPESAS' : 'VENDAS'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
