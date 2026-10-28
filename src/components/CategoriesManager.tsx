import React, { useState } from 'react';
import { Tags, Plus, Trash2, Edit2, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { SubCategory, Expense } from '../types';

interface CategoriesManagerProps {
  subCategories: SubCategory[];
  expenses: Expense[];
  onAddSubCategory: (cat: Omit<SubCategory, 'id'>) => void;
  onUpdateSubCategory: (cat: SubCategory) => void;
  onDeleteSubCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#64748B'
];

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  subCategories,
  expenses,
  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryGroup, setCategoryGroup] = useState('Operacional');
  const [color, setColor] = useState('#3B82F6');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Calculate actual spending per category
  const getCategorySpending = (catName: string) => {
    return expenses
      .filter(e => (e.subCategory === catName || e.category === catName))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setName('');
    setCategoryGroup('Operacional');
    setColor('#3B82F6');
    setBudgetLimit('');
  };

  const handleStartEdit = (cat: SubCategory) => {
    setEditingId(cat.id);
    setIsAdding(false);
    setName(cat.name);
    setCategoryGroup(cat.category);
    setColor(cat.color || '#3B82F6');
    setBudgetLimit(cat.budgetLimit ? String(cat.budgetLimit) : '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBudget = budgetLimit ? parseFloat(budgetLimit.replace(',', '.')) : undefined;

    if (editingId) {
      onUpdateSubCategory({
        id: editingId,
        name: name.trim(),
        category: categoryGroup.trim(),
        color,
        budgetLimit: parsedBudget
      });
      setEditingId(null);
    } else {
      onAddSubCategory({
        name: name.trim(),
        category: categoryGroup.trim(),
        color,
        budgetLimit: parsedBudget
      });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Categorias & Limites Orçamentários
          </h2>
          <p className="text-sm text-slate-400">
            Defina centros de custo, limites de gastos e cores de identificação visual
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Drawer/Box */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              {editingId ? 'Editar Categoria' : 'Criar Nova Categoria / Centro de Custo'}
            </h3>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Subcategoria *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Treinamentos, Softwares, Logística"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Grupo Macro *
              </label>
              <select
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Operacional">Operacional</option>
                <option value="Pessoal / RH">Pessoal / RH</option>
                <option value="Infraestrutura & TI">Infraestrutura & TI</option>
                <option value="Marketing">Marketing</option>
                <option value="Tributário & Fiscal">Tributário & Fiscal</option>
                <option value="Serviços de Terceiros">Serviços de Terceiros</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Teto Orçamentário Mensal (R$)
              </label>
              <input
                type="text"
                placeholder="Ex: 5000.00"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cor de Destaque
              </label>
              <div className="flex items-center gap-2 pt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md"
            >
              Salvar Categoria
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories with Budget Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subCategories.map((cat) => {
          const spent = getCategorySpending(cat.name);
          const limit = cat.budgetLimit || 0;
          const ratio = limit > 0 ? (spent / limit) * 100 : 0;
          const isOverBudget = limit > 0 && spent > limit;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {cat.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {cat.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                        onDeleteSubCategory(cat.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Gasto Atual:</span>
                  <span className="font-semibold text-white">
                    R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {limit > 0 ? (
                  <>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Teto Orçado:</span>
                      <span>R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isOverBudget
                            ? 'bg-rose-500'
                            : ratio > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isOverBudget ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                        {ratio.toFixed(0)}% utilizado
                      </span>
                      {isOverBudget && (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Excedido em R$ {(spent - limit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    Sem teto orçamentário configurado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
