import React, { useState, useMemo, useEffect } from 'react';
import { Search, FileDown, Trash2, FileText, ArrowDownRight } from 'lucide-react';
import { Expense, Sale, CompanySettings } from '../types';
import { ExportPdfModal } from './ExportPdfModal';

interface HistoricoViewProps {
  expenses: Expense[];
  sales?: Sale[];
  onDeleteExpense: (id: string) => void;
  onDeleteSale?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  settings?: CompanySettings;
  isAdmin?: boolean;
}

type FilterTab = 'todos' | 'despesas' | 'vendas';

interface UnifiedHistoryItem {
  id: string;
  rawId: string;
  type: 'despesa' | 'venda';
  date: string;
  description: string;
  user: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  category?: string;
  city?: string;
  status?: string;
  raw: Expense | Sale;
}

const DEFAULT_PAGE_LIMIT = 20;

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  expenses,
  sales = [],
  onDeleteExpense,
  onDeleteSale,
  settings,
  isAdmin = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('todos');
  const [visibleLimit, setVisibleLimit] = useState<number>(DEFAULT_PAGE_LIMIT);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Reset visible limit whenever search or filter parameters change to keep UI ultra-fast
  useEffect(() => {
    setVisibleLimit(DEFAULT_PAGE_LIMIT);
  }, [searchTerm, startDate, endDate, activeFilterTab]);

  // Unify expenses and sales into a single structured list
  const unifiedItems: UnifiedHistoryItem[] = useMemo(() => {
    const expenseItems: UnifiedHistoryItem[] = expenses.map(exp => ({
      id: `expense-${exp.id}`,
      rawId: exp.id,
      type: 'despesa',
      date: exp.date || '',
      description: exp.description || 'Despesa Operacional',
      user: exp.user || 'ADMIN',
      amount: Number(exp.amount || 0),
      paymentMethod: exp.paymentMethod || 'Dinheiro',
      notes: exp.notes,
      category: exp.category,
      raw: exp,
    }));

    const saleItems: UnifiedHistoryItem[] = sales.map(s => ({
      id: `sale-${s.id}`,
      rawId: s.id,
      type: 'venda',
      date: s.date || '',
      description: s.description || 'Venda de Mercadoria',
      user: s.user || 'ADMIN',
      amount: Number(s.amount || 0),
      paymentMethod: s.paymentMethod || 'Dinheiro',
      notes: s.notes,
      city: s.city,
      status: s.status,
      raw: s,
    }));

    return [...expenseItems, ...saleItems];
  }, [expenses, sales]);

  // Counts for tabs (independent of text/date filters)
  const counts = useMemo(() => {
    const totalDespesas = expenses.length;
    const totalVendas = sales.length;
    return {
      total: totalDespesas + totalVendas,
      despesas: totalDespesas,
      vendas: totalVendas,
    };
  }, [expenses.length, sales.length]);

  // Filtered and sorted list (all matching records)
  const filteredItems = useMemo(() => {
    return unifiedItems.filter(item => {
      // Tab filter
      if (activeFilterTab === 'despesas' && item.type !== 'despesa') return false;
      if (activeFilterTab === 'vendas' && item.type !== 'venda') return false;

      // Text search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesUser = item.user.toLowerCase().includes(term);
        const matchesNotes = (item.notes || '').toLowerCase().includes(term);
        const matchesCat = (item.category || '').toLowerCase().includes(term);
        const matchesCity = (item.city || '').toLowerCase().includes(term);
        const matchesPay = item.paymentMethod.toLowerCase().includes(term);
        if (!matchesDesc && !matchesUser && !matchesNotes && !matchesCat && !matchesCity && !matchesPay) {
          return false;
        }
      }

      // Date range filter
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [unifiedItems, activeFilterTab, searchTerm, startDate, endDate]);

  // Sliced items for instant rendering (capped at visibleLimit, default 20)
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleLimit);
  }, [filteredItems, visibleLimit]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // State for in-app deletion confirmation modal
  const [itemToDelete, setItemToDelete] = useState<UnifiedHistoryItem | null>(null);

  const handleDelete = (item: UnifiedHistoryItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'despesa') {
      onDeleteExpense(itemToDelete.rawId);
    } else if (onDeleteSale) {
      onDeleteSale(itemToDelete.rawId);
    }
    setItemToDelete(null);
  };

  const hasMoreThanLimit = filteredItems.length > visibleLimit;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">

      {/* Top Filter & Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-xl">
        
        {/* Row 1: Segmented Tabs & Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1f2128] pb-4">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#17181e] border border-[#23252d] rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveFilterTab('todos')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeFilterTab === 'todos'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>TODOS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-700/60 text-zinc-300">
                {counts.total}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab('despesas')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeFilterTab === 'despesas'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              <span>DESPESAS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-950/60 text-rose-300">
                {counts.despesas}
              </span>
            </button>

            <button
              onClick={() => setActiveFilterTab('vendas')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeFilterTab === 'vendas'
                  ? 'bg-emerald-500/20 text-[#00e676] border border-emerald-500/30 shadow-md'
                  : 'text-zinc-400 hover:text-[#00e676]'
              }`}
            >
              <span>VENDAS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300">
                {counts.vendas}
              </span>
            </button>
          </div>

          {/* Export Report Button (Apenas Administrador Geral) */}
          {isAdmin && (
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-100 text-black font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg transition tracking-wider"
              >
                <FileDown className="w-4 h-4 text-black" />
                <span>EXPORTAR RELATÓRIO</span>
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Search and Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* BUSCAR */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              BUSCAR
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filtrar por nome, cidade, usuário ou obs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* INÍCIO */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              INÍCIO
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* FIM */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              FIM
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

      </div>

      {/* Main Table & Mobile Cards Card */}
      <div className="rounded-2xl bg-[#121317] border border-[#1f2128] overflow-hidden shadow-2xl">
        
        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121317] border-b border-[#1f2128]">
              <tr>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  USUÁRIO
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  DATA
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  TIPO / DESCRIÇÃO
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  PAGAMENTO
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">
                  VALOR
                </th>
                <th className="py-4 px-6 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181920]">
              {displayedItems.map((item) => {
                const isDespesa = item.type === 'despesa';
                return (
                  <tr key={item.id} className="hover:bg-[#15161c] transition group">
                    {/* USUÁRIO */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-indigo-400 font-extrabold text-xs tracking-wider uppercase">
                        {item.user || 'ADMIN'}
                      </span>
                    </td>

                    {/* DATA */}
                    <td className="py-4 px-6 whitespace-nowrap text-zinc-300 font-mono text-xs">
                      {formatDateDisplay(item.date)}
                    </td>

                    {/* TIPO / DESCRIÇÃO */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide ${
                          isDespesa
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-[#00e676] border border-emerald-500/20'
                        }`}>
                          {isDespesa ? 'DESPESA' : 'VENDA'}
                        </span>

                        <span className={`text-xs uppercase tracking-wide font-extrabold ${
                          isDespesa ? 'text-rose-400' : 'text-[#00e676]'
                        }`}>
                          {item.description}
                        </span>
                      </div>

                      {/* Informações complementares */}
                      <div className="text-[11px] text-zinc-400 font-normal mt-1 flex flex-wrap items-center gap-2">
                        {!isDespesa && item.city && (
                          <span className="text-amber-400 font-semibold tracking-wide">
                            Praça: {item.city}
                          </span>
                        )}
                        {isDespesa && item.category && (
                          <span className="text-zinc-400">
                            Categoria: {item.category}
                          </span>
                        )}
                        {item.notes && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500">{item.notes}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* PAGAMENTO */}
                    <td className="py-4 px-6 whitespace-nowrap text-zinc-300 text-xs">
                      <span className="px-2 py-1 rounded bg-[#17181e] border border-[#23252d] font-medium text-[11px] text-zinc-300">
                        {item.paymentMethod}
                      </span>
                    </td>

                    {/* VALOR */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span className={`font-mono font-bold text-xs tracking-tight tabular-nums ${
                        isDespesa ? 'text-rose-400' : 'text-[#00e676]'
                      }`}>
                        {isDespesa ? '- ' : '+ '}
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* AÇÕES */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-zinc-600 group-hover:text-zinc-400 hover:text-rose-400 transition"
                        title={isDespesa ? 'Excluir despesa' : 'Excluir venda'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                    Nenhum lançamento localizado para os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Tap Cards View (< md) */}
        <div className="md:hidden divide-y divide-[#1f2128]">
          {displayedItems.map((item) => {
            const isDespesa = item.type === 'despesa';
            return (
              <div key={item.id} className="p-4 space-y-2.5 hover:bg-[#15161c] transition">
                {/* Top: Badges and Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${
                      isDespesa
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-[#00e676] border border-emerald-500/20'
                    }`}>
                      {isDespesa ? 'DESPESA' : 'VENDA'}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">
                      {item.user || 'ADMIN'}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {formatDateDisplay(item.date)}
                  </span>
                </div>

                {/* Middle: Title & Details */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm uppercase tracking-wide font-extrabold ${
                      isDespesa ? 'text-rose-400' : 'text-[#00e676]'
                    }`}>
                      {item.description}
                    </h4>
                    <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
                      {!isDespesa && item.city && (
                        <span className="text-amber-400 font-semibold">Praça: {item.city}</span>
                      )}
                      {isDespesa && item.category && (
                        <span>Cat: {item.category}</span>
                      )}
                      {item.notes && (
                        <span className="text-zinc-500 truncate max-w-[200px]">{item.notes}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete action button (large touch hitbox) */}
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 active:scale-95 transition min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom: Payment Method and Amount */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#1a1c22] text-xs">
                  <span className="px-2 py-0.5 rounded bg-[#17181e] border border-[#23252d] text-[10px] text-zinc-400 font-medium">
                    {item.paymentMethod}
                  </span>
                  <span className={`font-mono font-black text-sm tracking-tight tabular-nums ${
                    isDespesa ? 'text-rose-400' : 'text-[#00e676]'
                  }`}>
                    {isDespesa ? '- ' : '+ '}
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs px-4">
              Nenhum lançamento localizado para os filtros informados.
            </div>
          )}
        </div>

        {/* Footer Notice & Actions for Performance Optimization */}
        {filteredItems.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#101115] border-t border-[#1f2128] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left w-full md:w-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Exibindo <span className="text-white font-mono font-bold">{displayedItems.length}</span> de <span className="text-indigo-400 font-mono font-bold">{filteredItems.length}</span> lançamentos recentes
                  <span className="text-zinc-400 font-normal ml-1">(Modo de Alta Performance)</span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isAdmin 
                    ? 'Para auditar o histórico completo sem sobrecarregar o navegador, emita o relatório oficial em PDF.'
                    : 'Listagem otimizada de lançamentos para consulta operacional.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              {hasMoreThanLimit && (
                <button
                  onClick={() => setVisibleLimit(prev => prev + 20)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#17181e] hover:bg-[#20222a] border border-[#23252d] rounded-xl transition flex items-center gap-1.5"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ver +20 na tela</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition tracking-wide uppercase"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Baixar Histórico Completo (PDF)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PDF Export with date range selection modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={expenses}
        sales={sales}
        settings={settings}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
        defaultCategory={activeFilterTab === 'vendas' ? 'vendas' : 'despesas'}
        title="Exportar Relatório em PDF"
      />

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#131418] border-t sm:border border-rose-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 animate-scale-in">
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1.5 bg-zinc-600 rounded-full mx-auto sm:hidden shrink-0" />

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  Confirmar Exclusão de Registro
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {itemToDelete.type === 'despesa' ? 'Despesa Financeira' : 'Entrada de Venda'}
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#181920] border border-[#23252d] space-y-2">
              <p className="text-xs text-zinc-300">
                Você realmente deseja apagar este lançamento?
              </p>
              <div className="p-3 rounded-lg bg-black/50 border border-rose-500/30 text-xs font-bold text-rose-400 uppercase tracking-wide">
                {itemToDelete.description}
                <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                  Valor: R$ {itemToDelete.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                Esta ação removerá o registro do histórico financeiro.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-[#1c1d24] hover:bg-[#252732] text-zinc-300 hover:text-white text-xs font-bold transition active:scale-95 text-center min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 active:scale-95 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Desejo Apagar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
