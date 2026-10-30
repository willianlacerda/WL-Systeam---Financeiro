import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { Expense, SubCategory } from '../types';

interface NovoLancamentoViewProps {
  categories: SubCategory[];
  expenses: Expense[];
  onSelectCategory: (categoryName: string) => void;
  onViewAllExpenses: () => void;
  isAdmin?: boolean;
}

export const NovoLancamentoView: React.FC<NovoLancamentoViewProps> = ({
  categories,
  expenses,
  onSelectCategory,
  onViewAllExpenses,
  isAdmin = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ÁGUA');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(term));
  }, [categories, searchTerm]);

  // Top 5 recent expenses
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [expenses]);

  const handleCategoryClick = (name: string) => {
    setSelectedCategory(name);
    onSelectCategory(name);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-');
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const mIdx = parseInt(month, 10) - 1;
      return `${day} ${months[mIdx] || ''}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6">
      
      {/* Center 1. SELECIONE A DESPESA (8 cols) */}
      <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 sm:space-y-5 shadow-xl">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <h2 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
            1. SELECIONE A DESPESA
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 sm:top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 sm:py-1.5 bg-[#17181e] border border-[#23252d] rounded-xl sm:rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* 4-Columns Button Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-h-[55vh] sm:max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`min-h-[52px] sm:min-h-[58px] p-2 sm:p-2.5 rounded-xl text-[11px] font-bold tracking-wide uppercase flex items-center justify-center text-center transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/50'
                    : 'bg-[#18191e] hover:bg-[#22242b] text-zinc-300 border border-[#222329]'
                }`}
              >
                <span className="line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Right Column (4 cols) */}
      <div className="lg:col-span-4 space-y-4 sm:space-y-6">
        
        {/* LANÇAMENTOS RECENTES Card */}
        <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              LANÇAMENTOS RECENTES
            </span>
            <button
              onClick={onViewAllExpenses}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase transition"
            >
              <span>VER TUDO</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                onClick={onViewAllExpenses}
                className="p-3.5 rounded-xl bg-[#17181e] border border-[#202229] hover:border-zinc-700 transition cursor-pointer flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[140px] uppercase">
                    {exp.description}
                  </h4>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                    {formatDateShort(exp.date)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-[#00e676] font-mono">
                    - R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}

            {recentExpenses.length === 0 && (
              <div className="py-6 text-center text-xs text-zinc-500">
                Nenhum lançamento recente
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
