import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  FileDown, 
  FileSpreadsheet,
  X,
  Repeat
} from 'lucide-react';
import { Expense, SubCategory, AppUser } from '../types';

interface ExpensesTableProps {
  expenses: Expense[];
  subCategories: SubCategory[];
  appUsers: AppUser[];
  onOpenNewExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onExportPDF: (filtered: Expense[], filterDesc: string) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  subCategories,
  appUsers,
  onOpenNewExpense,
  onEditExpense,
  onDeleteExpense,
  onToggleStatus,
  onExportPDF,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Available months from data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach(e => {
      if (e.date) {
        set.add(e.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesCat = (item.subCategory || item.category || '').toLowerCase().includes(term);
        const matchesUser = (item.user || '').toLowerCase().includes(term);
        const matchesNotes = (item.notes || '').toLowerCase().includes(term);
        if (!matchesDesc && !matchesCat && !matchesUser && !matchesNotes) return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const cat = item.subCategory || item.category;
        if (cat !== selectedCategory) return false;
      }

      // Method
      if (selectedMethod !== 'all' && item.paymentMethod !== selectedMethod) {
        return false;
      }

      // Month
      if (selectedMonth !== 'all' && !item.date.startsWith(selectedMonth)) {
        return false;
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, searchTerm, selectedStatus, selectedCategory, selectedMethod, selectedMonth]);

  // Aggregated totals for the current filter view
  const filterTotals = useMemo(() => {
    const total = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const paid = filteredExpenses.filter(e => e.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const pending = total - paid;
    return { total, paid, pending, count: filteredExpenses.length };
  }, [filteredExpenses]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Responsável', 'Forma Pagto', 'Status', 'Valor (R$)', 'Observações'];
    const rows = filteredExpenses.map(e => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      `"${(e.subCategory || e.category).replace(/"/g, '""')}"`,
      `"${(e.user || '').replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      `"${e.status}"`,
      `"${Number(e.amount).toFixed(2)}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `despesas_wl_system_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    let desc = 'Todos os registros filtrados';
    if (selectedMonth !== 'all') desc += ` | Mês: ${selectedMonth}`;
    if (selectedStatus !== 'all') desc += ` | Status: ${selectedStatus.toUpperCase()}`;
    if (selectedCategory !== 'all') desc += ` | Categoria: ${selectedCategory}`;
    onExportPDF(filteredExpenses, desc);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedMethod('all');
    setSelectedMonth('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedMethod !== 'all' || selectedMonth !== 'all';

  return (
    <div className="space-y-6">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Despesas & Contas a Pagar
          </h2>
          <p className="text-sm text-slate-400">
            Controle analítico de débitos, pagamentos e notas fiscais
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center gap-1.5 transition"
            title="Exportar planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center gap-1.5 transition"
            title="Exportar relatório em PDF com layout executivo"
          >
            <FileDown className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Despesa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por descrição, responsável ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">Todos os Status</option>
              <option value="pago">Liquidado (Pago)</option>
              <option value="pendente">Pendente a Pagar</option>
              <option value="agendado">Agendado</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">Todas as Categorias</option>
              {subCategories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="all">Todos os Meses</option>
              {availableMonths.map(m => {
                const [y, mon] = m.split('-');
                return (
                  <option key={m} value={m}>{mon}/{y}</option>
                );
              })}
            </select>
          </div>

        </div>

        {/* Filter bar footer with totals */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span>Listando: <strong className="text-white">{filterTotals.count}</strong> registros</span>
            <span>•</span>
            <span>Total: <strong className="text-white">R$ {filterTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span>•</span>
            <span className="text-emerald-400">Pago: <strong>R$ {filterTotals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            <span>•</span>
            <span className="text-amber-400">Pendente: <strong>R$ {filterTotals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data Venc.</th>
                <th className="py-3.5 px-4">Descrição</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4">Forma Pagto</th>
                <th className="py-3.5 px-4 text-right">Valor (R$)</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const isPaid = expense.status === 'pago';
                  const isPending = expense.status === 'pendente';
                  const isScheduled = expense.status === 'agendado';

                  return (
                    <tr key={expense.id} className="hover:bg-slate-800/40 transition">
                      {/* Status toggle cell */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onToggleStatus(expense.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                          }`}
                          title="Clique para alternar status entre Pago e Pendente"
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : isPending ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          <span>{expense.status}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                        {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>

                      {/* Description & recurring icon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {expense.description}
                          </span>
                          {expense.recurrent && (
                            <span title="Despesa recorrente">
                              <Repeat className="w-3 h-3 text-blue-400" />
                            </span>
                          )}
                        </div>
                        {expense.notes && (
                          <p className="text-xs text-slate-400 truncate max-w-xs">
                            {expense.notes}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          {expense.subCategory || expense.category}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {expense.user || '-'}
                      </td>

                      {/* Payment method */}
                      <td className="py-3 px-4 text-xs uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        {expense.paymentMethod.replace('_', ' ')}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isPaid ? 'text-slate-100' : 'text-amber-400'}>
                          R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditExpense(expense)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                            title="Editar lançamento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a despesa "${expense.description}"?`)) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="text-base font-medium">Nenhuma despesa localizada</p>
                    <p className="text-xs mt-1">Ajuste os filtros acima ou cadastre uma nova despesa.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
