import React, { useState, useMemo } from 'react';
import { 
  FileDown, 
  TrendingDown, 
  TrendingUp, 
  Layers,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Search,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Expense, Sale, SubCategory, AppUser, CompanySettings } from '../types';
import { ExportPdfModal } from './ExportPdfModal';
import { ExportVendasPdfModal } from './ExportVendasPdfModal';

interface ReportsViewProps {
  expenses: Expense[];
  sales?: Sale[];
  cities?: string[];
  subCategories?: SubCategory[];
  appUsers?: AppUser[];
  settings?: CompanySettings;
}

const DONUT_COLORS = ['#00e676', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#64748b'];

export const ReportsView: React.FC<ReportsViewProps> = ({
  expenses,
  sales = [],
  settings,
}) => {
  // Main Category Switch: Despesas or Vendas
  const [reportCategory, setReportCategory] = useState<'despesas' | 'vendas'>('despesas');

  // Sub-view: ranking, lancamentos, or charts
  const [viewMode, setViewMode] = useState<'ranking' | 'lancamentos' | 'charts'>('ranking');

  // Period Filter
  const [periodFilter, setPeriodFilter] = useState<'all' | 'current_month' | 'last_month' | 'year'>('all');

  // Search within detailed lancamentos
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for PDF export
  const [isExpensePdfModalOpen, setIsExpensePdfModalOpen] = useState(false);
  const [isVendasPdfModalOpen, setIsVendasPdfModalOpen] = useState(false);

  // Helper date filtering keys
  const filterKeys = useMemo(() => {
    const now = new Date();
    const currentMonthKey = now.toISOString().slice(0, 7); // YYYY-MM
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = prevMonthDate.toISOString().slice(0, 7);
    const currentYearKey = String(now.getFullYear());
    return { currentMonthKey, prevMonthKey, currentYearKey };
  }, []);

  // Filtered Expenses by period
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (!e.date) return true;
      if (periodFilter === 'current_month') {
        return e.date.startsWith(filterKeys.currentMonthKey);
      }
      if (periodFilter === 'last_month') {
        return e.date.startsWith(filterKeys.prevMonthKey);
      }
      if (periodFilter === 'year') {
        return e.date.startsWith(filterKeys.currentYearKey);
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, periodFilter, filterKeys]);

  // Filtered Sales by period
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (!s.date) return true;
      if (periodFilter === 'current_month') {
        return s.date.startsWith(filterKeys.currentMonthKey);
      }
      if (periodFilter === 'last_month') {
        return s.date.startsWith(filterKeys.prevMonthKey);
      }
      if (periodFilter === 'year') {
        return s.date.startsWith(filterKeys.currentYearKey);
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, periodFilter, filterKeys]);

  // Totals
  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || curr.value || 0), 0);
  }, [filteredExpenses]);

  const totalSalesAmount = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filteredSales]);

  // ==================== DESPESAS CALCULATIONS ====================

  // Ranking de Alocação por Despesa
  const expenseAllocationRanking = useMemo(() => {
    const map = new Map<string, { volume: number; count: number }>();

    filteredExpenses.forEach(e => {
      const name = (e.description || e.subCategory || e.category || 'OUTROS').toUpperCase();
      const val = Number(e.amount || e.value || 0);
      const existing = map.get(name) || { volume: 0, count: 0 };
      map.set(name, { volume: existing.volume + val, count: existing.count + 1 });
    });

    const list = Array.from(map.entries()).map(([item, data]) => {
      const percent = totalExpenseAmount > 0 ? (data.volume / totalExpenseAmount) * 100 : 0;
      return {
        item,
        volume: data.volume,
        count: data.count,
        percent,
      };
    });

    return list.sort((a, b) => b.volume - a.volume);
  }, [filteredExpenses, totalExpenseAmount]);

  // Top 3 Concentration for Expenses
  const top3ExpenseConcentration = useMemo(() => {
    const top3Sum = expenseAllocationRanking.slice(0, 3).reduce((acc, curr) => acc + curr.volume, 0);
    return totalExpenseAmount > 0 ? (top3Sum / totalExpenseAmount) * 100 : 0;
  }, [expenseAllocationRanking, totalExpenseAmount]);

  // Expenses Donut chart data (Top 5 + Outros)
  const expenseDonutData = useMemo(() => {
    if (expenseAllocationRanking.length <= 5) {
      return expenseAllocationRanking.map((r, i) => ({
        name: r.item,
        value: r.volume,
        color: DONUT_COLORS[i % DONUT_COLORS.length]
      }));
    }
    const top5 = expenseAllocationRanking.slice(0, 5).map((r, i) => ({
      name: r.item,
      value: r.volume,
      color: DONUT_COLORS[i % DONUT_COLORS.length]
    }));
    const othersSum = expenseAllocationRanking.slice(5).reduce((acc, curr) => acc + curr.volume, 0);
    top5.push({
      name: 'OUTROS',
      value: othersSum,
      color: '#64748b'
    });
    return top5;
  }, [expenseAllocationRanking]);

  // Monthly timeline for Expenses
  const expenseMonthlyTimeline = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      if (!e.date) return;
      const key = e.date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + Number(e.amount || e.value || 0));
    });

    return Array.from(map.entries())
      .map(([m, val]) => {
        const [y, mon] = m.split('-');
        return {
          month: `${mon}/${y.slice(2)}`,
          rawKey: m,
          valor: val
        };
      })
      .sort((a, b) => a.rawKey.localeCompare(b.rawKey))
      .slice(-8);
  }, [expenses]);

  // ==================== VENDAS CALCULATIONS ====================

  // Ranking de Alocação por Praça / Cidade
  const salesCityRanking = useMemo(() => {
    const map = new Map<string, { volume: number; count: number }>();

    filteredSales.forEach(s => {
      const city = (s.city || 'NÃO INFORMADA').toUpperCase();
      const val = Number(s.amount || 0);
      const existing = map.get(city) || { volume: 0, count: 0 };
      map.set(city, { volume: existing.volume + val, count: existing.count + 1 });
    });

    const list = Array.from(map.entries()).map(([city, data]) => {
      const percent = totalSalesAmount > 0 ? (data.volume / totalSalesAmount) * 100 : 0;
      return {
        city,
        volume: data.volume,
        count: data.count,
        percent,
      };
    });

    return list.sort((a, b) => b.volume - a.volume);
  }, [filteredSales, totalSalesAmount]);

  // Top 3 Concentration for Sales
  const top3SalesConcentration = useMemo(() => {
    const top3Sum = salesCityRanking.slice(0, 3).reduce((acc, curr) => acc + curr.volume, 0);
    return totalSalesAmount > 0 ? (top3Sum / totalSalesAmount) * 100 : 0;
  }, [salesCityRanking, totalSalesAmount]);

  // Sales Donut chart data (Top 5 + Outros)
  const salesDonutData = useMemo(() => {
    if (salesCityRanking.length <= 5) {
      return salesCityRanking.map((r, i) => ({
        name: r.city,
        value: r.volume,
        color: DONUT_COLORS[i % DONUT_COLORS.length]
      }));
    }
    const top5 = salesCityRanking.slice(0, 5).map((r, i) => ({
      name: r.city,
      value: r.volume,
      color: DONUT_COLORS[i % DONUT_COLORS.length]
    }));
    const othersSum = salesCityRanking.slice(5).reduce((acc, curr) => acc + curr.volume, 0);
    top5.push({
      name: 'OUTRAS PRAÇAS',
      value: othersSum,
      color: '#64748b'
    });
    return top5;
  }, [salesCityRanking]);

  // Monthly timeline for Sales
  const salesMonthlyTimeline = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach(s => {
      if (!s.date) return;
      const key = s.date.slice(0, 7);
      map.set(key, (map.get(key) || 0) + Number(s.amount || 0));
    });

    return Array.from(map.entries())
      .map(([m, val]) => {
        const [y, mon] = m.split('-');
        return {
          month: `${mon}/${y.slice(2)}`,
          rawKey: m,
          valor: val
        };
      })
      .sort((a, b) => a.rawKey.localeCompare(b.rawKey))
      .slice(-8);
  }, [sales]);

  // Sales Received vs Pending
  const salesStatusSummary = useMemo(() => {
    let recebido = 0;
    let pendente = 0;
    filteredSales.forEach(s => {
      if (s.status === 'recebido') {
        recebido += Number(s.amount || 0);
      } else {
        pendente += Number(s.amount || 0);
      }
    });
    return { recebido, pendente };
  }, [filteredSales]);

  // Filtered detailed items for "Lançamentos" tab
  const detailedExpensesList = useMemo(() => {
    if (!searchTerm.trim()) return filteredExpenses;
    const term = searchTerm.toLowerCase();
    return filteredExpenses.filter(e => 
      (e.description || '').toLowerCase().includes(term) ||
      (e.category || '').toLowerCase().includes(term) ||
      (e.user || '').toLowerCase().includes(term) ||
      (e.notes || '').toLowerCase().includes(term)
    );
  }, [filteredExpenses, searchTerm]);

  const detailedSalesList = useMemo(() => {
    if (!searchTerm.trim()) return filteredSales;
    const term = searchTerm.toLowerCase();
    return filteredSales.filter(s => 
      (s.description || '').toLowerCase().includes(term) ||
      (s.city || '').toLowerCase().includes(term) ||
      (s.user || '').toLowerCase().includes(term) ||
      (s.notes || '').toLowerCase().includes(term)
    );
  }, [filteredSales, searchTerm]);

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleOpenExportModal = () => {
    setIsExpensePdfModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Primary Switcher: Relatório de Despesas vs Relatório de Vendas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121317] border border-[#1f2128] p-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 p-1 bg-[#17181e] border border-[#23252d] rounded-xl w-full sm:w-auto">
          {/* Aba Relatório de Despesas */}
          <button
            onClick={() => {
              setReportCategory('despesas');
              setSearchTerm('');
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
              reportCategory === 'despesas'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>RELATÓRIO DE DESPESAS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-950/60 text-rose-300">
              {expenses.length}
            </span>
          </button>

          {/* Aba Relatório de Vendas */}
          <button
            onClick={() => {
              setReportCategory('vendas');
              setSearchTerm('');
            }}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
              reportCategory === 'vendas'
                ? 'bg-emerald-500/20 text-[#00e676] border border-emerald-500/40 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#00e676]" />
            <span>RELATÓRIO DE VENDAS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300">
              {sales.length}
            </span>
          </button>
        </div>

        {/* Global Export Button for the Active Category */}
        <button
          onClick={handleOpenExportModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
        >
          <FileDown className="w-4 h-4 text-black" />
          <span>EXPORTAR {reportCategory === 'despesas' ? 'DESPESAS' : 'VENDAS'} EM PDF</span>
        </button>
      </div>

      {/* Sub-Navigation (Ranking de Alocação | Lançamentos | Gráficos & Tendências) + Filtro de Período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Sub-views tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121317] border border-[#1f2128] rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('ranking')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              viewMode === 'ranking'
                ? 'bg-[#181920] text-white border border-[#2c2e38] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ranking de Alocação
          </button>
          
          <button
            onClick={() => setViewMode('lancamentos')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              viewMode === 'lancamentos'
                ? 'bg-[#181920] text-white border border-[#2c2e38] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lançamentos
          </button>

          <button
            onClick={() => setViewMode('charts')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              viewMode === 'charts'
                ? 'bg-[#181920] text-white border border-[#2c2e38] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gráficos & Tendências
          </button>
        </div>

        {/* Period selection */}
        <div className="flex items-center gap-1 bg-[#121317] border border-[#1f2128] p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setPeriodFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition ${
              periodFilter === 'all' ? 'bg-[#181920] text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setPeriodFilter('current_month')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition ${
              periodFilter === 'current_month' ? 'bg-[#181920] text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setPeriodFilter('last_month')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition ${
              periodFilter === 'last_month' ? 'bg-[#181920] text-amber-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mês Anterior
          </button>
          <button
            onClick={() => setPeriodFilter('year')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition ${
              periodFilter === 'year' ? 'bg-[#181920] text-blue-400' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ano
          </button>
        </div>

      </div>

      {/* ==================== DESPESAS SECTION ==================== */}
      {reportCategory === 'despesas' && (
        <div className="space-y-6">

          {/* KPI Cards: Despesas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Alocado em Despesas */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Total Despesas no Filtro
              </span>
              <div className="text-xl font-extrabold text-rose-400 font-mono">
                R$ {totalExpenseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-zinc-500">
                {filteredExpenses.length} desembolsos contabilizados
              </div>
            </div>

            {/* Maior Centro de Despesa */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Maior Centro de Despesa
              </span>
              <div className="text-lg font-extrabold text-white truncate uppercase">
                {expenseAllocationRanking[0]?.item || '-'}
              </div>
              <div className="text-[11px] text-rose-400 font-mono font-bold">
                {expenseAllocationRanking[0] ? `R$ ${expenseAllocationRanking[0].volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${expenseAllocationRanking[0].percent.toFixed(1)}%)` : '-'}
              </div>
            </div>

            {/* Concentração Top 3 */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Concentração dos Top 3
              </span>
              <div className="text-xl font-extrabold text-amber-400 font-mono">
                {top3ExpenseConcentration.toFixed(1)}%
              </div>
              <div className="text-[11px] text-zinc-500">
                Participação dos 3 maiores centros
              </div>
            </div>

            {/* Total de Centros com Movimento */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Centros Movimentados
              </span>
              <div className="text-xl font-extrabold text-indigo-400 font-mono">
                {expenseAllocationRanking.length}
              </div>
              <div className="text-[11px] text-zinc-500">
                Categorias com despesas alocadas
              </div>
            </div>

          </div>

          {/* Sub-View: Ranking de Alocação de Despesas */}
          {viewMode === 'ranking' && (
            <div className="rounded-2xl bg-[#121317] border border-[#1f2128] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-[#1f2128] flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                  RANKING DE ALOCAÇÃO POR DESPESA
                </h3>
                <button
                  onClick={handleOpenExportModal}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 tracking-wider uppercase transition flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>GERAR PDF DE DESPESAS</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121317] border-b border-[#1f2128]">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        ITEM DE DESPESA
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">
                        VOLUME ALOCADO
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right w-48">
                        PARTICIPAÇÃO
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181920]">
                    {expenseAllocationRanking.map((row) => (
                      <tr key={row.item} className="hover:bg-[#15161c] transition">
                        <td className="py-4 px-6 font-bold text-white uppercase tracking-wide">
                          {row.item}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-xs text-rose-400">
                          R$ {row.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-zinc-400 font-mono text-[11px] font-semibold">
                              {row.percent.toFixed(1)}%
                            </span>
                            <div className="w-24 bg-[#1f2129] h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(row.percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {expenseAllocationRanking.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-zinc-500 text-xs">
                          Nenhuma despesa localizada para o período selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View: Lançamentos de Despesas */}
          {viewMode === 'lancamentos' && (
            <div className="rounded-2xl bg-[#121317] border border-[#1f2128] overflow-hidden shadow-2xl space-y-4">
              <div className="p-4 border-b border-[#1f2128] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar em despesas, usuário, obs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  Exibindo <strong>{detailedExpensesList.length}</strong> lançamentos de despesas
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121317] border-b border-[#1f2128]">
                    <tr>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">DATA</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">DESPESA / CATEGORIA</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">USUÁRIO</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">PAGAMENTO</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">VALOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181920]">
                    {detailedExpensesList.slice(0, 50).map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#15161c] transition">
                        <td className="py-3.5 px-6 whitespace-nowrap text-zinc-300 font-mono text-xs">
                          {formatDateDisplay(exp.date)}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-rose-400 text-xs uppercase">{exp.description}</div>
                          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                            <span>{exp.category}</span>
                            {exp.notes && <span>• {exp.notes}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-indigo-400 font-bold uppercase text-xs">
                          {exp.user || 'ADMIN'}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-zinc-400 text-xs">
                          {exp.paymentMethod || 'Dinheiro'}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap font-mono font-bold text-xs text-rose-400">
                          - R$ {Number(exp.amount || exp.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}

                    {detailedExpensesList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                          Nenhum lançamento localizado com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View: Gráficos de Despesas */}
          {viewMode === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Evolution Bar Chart */}
              <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Evolução Mensal dos Desembolsos
                  </h4>
                  <p className="text-[11px] text-zinc-500">Histórico de saídas por competência</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseMonthlyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1d24" />
                      <XAxis dataKey="month" stroke="#52525b" fontSize={11} />
                      <YAxis stroke="#52525b" fontSize={11} />
                      <Tooltip 
                        formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Desembolso']}
                        contentStyle={{ backgroundColor: '#121317', borderColor: '#27272a', borderRadius: '10px', color: '#fff' }}
                      />
                      <Bar dataKey="valor" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Distribution Chart */}
              <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Concentração das Maiores Despesas
                  </h4>
                  <p className="text-[11px] text-zinc-500">Divisão percentual dos grupos de custo</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Alocado']}
                        contentStyle={{ backgroundColor: '#121317', borderColor: '#27272a', borderRadius: '10px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f2128]">
                  {expenseDonutData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate uppercase font-semibold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================== VENDAS SECTION ==================== */}
      {reportCategory === 'vendas' && (
        <div className="space-y-6">

          {/* KPI Cards: Vendas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Faturamento em Vendas */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Total Faturado no Filtro
              </span>
              <div className="text-xl font-extrabold text-[#00e676] font-mono">
                R$ {totalSalesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-zinc-500">
                {filteredSales.length} vendas registradas
              </div>
            </div>

            {/* Praça Líder em Vendas */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Praça Líder em Vendas
              </span>
              <div className="text-lg font-extrabold text-white truncate uppercase">
                {salesCityRanking[0]?.city || '-'}
              </div>
              <div className="text-[11px] text-[#00e676] font-mono font-bold">
                {salesCityRanking[0] ? `R$ ${salesCityRanking[0].volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${salesCityRanking[0].percent.toFixed(1)}%)` : '-'}
              </div>
            </div>

            {/* Recebido vs A Receber */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Status de Recebimento
              </span>
              <div className="text-sm font-bold text-zinc-200">
                <span className="text-[#00e676] font-mono">R$ {salesStatusSummary.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-zinc-500 text-[10px] ml-1">rec.</span>
              </div>
              <div className="text-[11px] text-amber-400 font-mono">
                R$ {salesStatusSummary.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a receber
              </div>
            </div>

            {/* Cidades com Movimentação */}
            <div className="p-4 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                Praças Atendidas
              </span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {salesCityRanking.length}
              </div>
              <div className="text-[11px] text-zinc-500">
                Cidades com faturamento no período
              </div>
            </div>

          </div>

          {/* Sub-View: Ranking de Alocação de Vendas por Praça/Cidade */}
          {viewMode === 'ranking' && (
            <div className="rounded-2xl bg-[#121317] border border-[#1f2128] overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-[#1f2128] flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
                  RANKING DE ALOCAÇÃO POR PRAÇA / CIDADE
                </h3>
                <button
                  onClick={handleOpenExportModal}
                  className="text-xs font-bold text-[#00e676] hover:text-emerald-300 tracking-wider uppercase transition flex items-center gap-1.5"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>GERAR PDF DE VENDAS</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121317] border-b border-[#1f2128]">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        CIDADE / PRAÇA
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                        QTD VENDAS
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">
                        VOLUME FATURADO
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right w-48">
                        PARTICIPAÇÃO
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181920]">
                    {salesCityRanking.map((row) => (
                      <tr key={row.city} className="hover:bg-[#15161c] transition">
                        <td className="py-4 px-6 font-bold text-white uppercase tracking-wide flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{row.city}</span>
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap font-mono text-zinc-300">
                          {row.count}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-xs text-[#00e676]">
                          R$ {row.volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-zinc-400 font-mono text-[11px] font-semibold">
                              {row.percent.toFixed(1)}%
                            </span>
                            <div className="w-24 bg-[#1f2129] h-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#00e676] h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(row.percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {salesCityRanking.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-zinc-500 text-xs">
                          Nenhuma venda localizada para o período selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View: Lançamentos de Vendas */}
          {viewMode === 'lancamentos' && (
            <div className="rounded-2xl bg-[#121317] border border-[#1f2128] overflow-hidden shadow-2xl space-y-4">
              <div className="p-4 border-b border-[#1f2128] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar em vendas, cidade, usuário, obs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-zinc-400">
                  Exibindo <strong>{detailedSalesList.length}</strong> lançamentos de vendas
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121317] border-b border-[#1f2128]">
                    <tr>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">DATA</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">MERCADORIA / VENDA</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">CIDADE / PRAÇA</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">USUÁRIO</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">PAGAMENTO</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center">STATUS</th>
                      <th className="py-3 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-right">VALOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181920]">
                    {detailedSalesList.slice(0, 50).map((sale) => (
                      <tr key={sale.id} className="hover:bg-[#15161c] transition">
                        <td className="py-3.5 px-6 whitespace-nowrap text-zinc-300 font-mono text-xs">
                          {formatDateDisplay(sale.date)}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-[#00e676] text-xs uppercase">{sale.description}</div>
                          {sale.notes && (
                            <div className="text-[11px] text-zinc-500 mt-0.5">{sale.notes}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-amber-400 font-semibold text-xs uppercase">
                          {sale.city}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-indigo-400 font-bold uppercase text-xs">
                          {sale.user || 'ADMIN'}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-zinc-400 text-xs">
                          {sale.paymentMethod || 'Dinheiro'}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap text-center text-xs">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            sale.status === 'recebido'
                              ? 'bg-emerald-500/15 text-[#00e676] border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {sale.status === 'recebido' ? 'Recebido' : 'A Receber'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap font-mono font-bold text-xs text-[#00e676]">
                          + R$ {Number(sale.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}

                    {detailedSalesList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                          Nenhuma venda localizada com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-View: Gráficos de Vendas */}
          {viewMode === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Sales Evolution Bar Chart */}
              <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Evolução Mensal do Faturamento
                  </h4>
                  <p className="text-[11px] text-zinc-500">Histórico de receitas por competência</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesMonthlyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1d24" />
                      <XAxis dataKey="month" stroke="#52525b" fontSize={11} />
                      <YAxis stroke="#52525b" fontSize={11} />
                      <Tooltip 
                        formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                        contentStyle={{ backgroundColor: '#121317', borderColor: '#27272a', borderRadius: '10px', color: '#fff' }}
                      />
                      <Bar dataKey="valor" fill="#00e676" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* City Donut Distribution Chart */}
              <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Faturamento por Praça / Cidade
                  </h4>
                  <p className="text-[11px] text-zinc-500">Participação de mercado por localidade</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {salesDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturado']}
                        contentStyle={{ backgroundColor: '#121317', borderColor: '#27272a', borderRadius: '10px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f2128]">
                  {salesDonutData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate uppercase font-semibold">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Unified PDF Export Modal */}
      <ExportPdfModal
        isOpen={isExpensePdfModalOpen}
        onClose={() => setIsExpensePdfModalOpen(false)}
        expenses={expenses}
        sales={sales}
        settings={settings}
        title="Exportar Relatório em PDF"
        defaultCategory={reportCategory}
        reportType={viewMode === 'ranking' ? 'ranking' : 'history'}
      />

    </div>
  );
};
