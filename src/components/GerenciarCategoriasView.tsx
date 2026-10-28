import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Tags, 
  MapPin, 
  Receipt, 
  Search, 
  Building2, 
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SubCategory, Sale, Expense } from '../types';

interface GerenciarCategoriasViewProps {
  categories: SubCategory[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  cities: string[];
  onAddCity: (name: string) => void;
  onDeleteCity: (cityName: string) => void;
  onRenameCity: (oldName: string, newName: string) => void;
  expenses?: Expense[];
  sales?: Sale[];
  isAdmin?: boolean;
}

export const GerenciarCategoriasView: React.FC<GerenciarCategoriasViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  cities,
  onAddCity,
  onDeleteCity,
  onRenameCity,
  expenses = [],
  sales = [],
  isAdmin = true,
}) => {
  // Tab selection: 'despesas' or 'vendas'
  const [activeSubTab, setActiveSubTab] = useState<'despesas' | 'vendas'>('despesas');

  // Expenses categories states
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [catSearch, setCatSearch] = useState('');

  // Cities states
  const [newCityName, setNewCityName] = useState('');
  const [editingCityName, setEditingCityName] = useState<string | null>(null);
  const [editCityValue, setEditCityValue] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Count sales per city
  const salesCountByCity = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach(s => {
      const c = (s.city || '').toUpperCase().trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return map;
  }, [sales]);

  // Count expenses per category
  const expensesCountByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const c = (e.subCategory || e.category || e.description || '').toUpperCase().trim();
      map.set(c, (map.get(c) || 0) + 1);
    });
    return map;
  }, [expenses]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const term = catSearch.toUpperCase().trim();
    return categories.filter(c => c.name.toUpperCase().includes(term));
  }, [categories, catSearch]);

  // Filtered cities
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const term = citySearch.toUpperCase().trim();
    return cities.filter(c => c.toUpperCase().includes(term));
  }, [cities, citySearch]);

  // Add Expense Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim().toUpperCase());
    setNewCatName('');
  };

  const handleStartEditCat = (cat: SubCategory) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.name);
  };

  const handleSaveEditCat = (id: string) => {
    if (!editCatName.trim()) return;
    onRenameCategory(id, editCatName.trim().toUpperCase());
    setEditingCatId(null);
  };

  // Add City
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const formatted = newCityName.trim().toUpperCase();
    if (cities.map(c => c.toUpperCase()).includes(formatted)) {
      alert(`A cidade "${formatted}" já está cadastrada!`);
      return;
    }
    onAddCity(formatted);
    setNewCityName('');
  };

  const handleStartEditCity = (city: string) => {
    setEditingCityName(city);
    setEditCityValue(city);
  };

  const handleSaveEditCity = (oldCity: string) => {
    if (!editCityValue.trim()) return;
    const formatted = editCityValue.trim().toUpperCase();
    if (formatted !== oldCity && cities.map(c => c.toUpperCase()).includes(formatted)) {
      alert(`A cidade "${formatted}" já existe!`);
      return;
    }
    onRenameCity(oldCity, formatted);
    setEditingCityName(null);
  };

  // Confirmation Modal state for deletion
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'despesa' | 'cidade';
    id?: string;
    name: string;
  } | null>(null);

  // Solicitar exclusão de Categoria (Apenas Administrador Geral)
  const handleRequestDeleteCat = (cat: SubCategory) => {
    if (!isAdmin) return;
    setDeleteConfirmTarget({
      type: 'despesa',
      id: cat.id,
      name: cat.name,
    });
  };

  // Solicitar exclusão de Cidade (Apenas Administrador Geral)
  const handleRequestDeleteCity = (city: string) => {
    if (!isAdmin) return;
    setDeleteConfirmTarget({
      type: 'cidade',
      name: city,
    });
  };

  // Executar exclusão definitiva após confirmação explícita do usuário
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget || !isAdmin) {
      setDeleteConfirmTarget(null);
      return;
    }

    if (deleteConfirmTarget.type === 'despesa') {
      onDeleteCategory(deleteConfirmTarget.id || deleteConfirmTarget.name);
    } else {
      onDeleteCity(deleteConfirmTarget.name);
    }

    setDeleteConfirmTarget(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c1d22]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              CONFIGURAÇÃO DO SISTEMA
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400">WL System</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-wide mt-1">
            Gerenciar Categorias
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Selecione se deseja gerenciar as categorias de Despesas ou as categorias de Cidades.
          </p>
        </div>
      </div>

      {/* Primary Switcher: Despesas vs Vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Tab 1: Despesas */}
        <button
          type="button"
          onClick={() => setActiveSubTab('despesas')}
          className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between group ${
            activeSubTab === 'despesas'
              ? 'bg-[#15161d] border-indigo-500 ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/5'
              : 'bg-[#121317] border-[#1f2128] hover:border-zinc-700 hover:bg-[#16171d]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl border transition ${
              activeSubTab === 'despesas'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-[#181920] text-zinc-400 border-[#23252d] group-hover:text-white'
            }`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                LANÇAMENTO OPERACIONAL
              </span>
              <h2 className="text-base font-black text-white tracking-wide">
                Categorias de Despesas
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tipos de gastos e custos operacionais
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              activeSubTab === 'despesas'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-[#181920] text-zinc-400 border-[#23252d]'
            }`}>
              {categories.length} Despesas
            </span>
          </div>
        </button>

        {/* Tab 2: Vendas */}
        <button
          type="button"
          onClick={() => setActiveSubTab('vendas')}
          className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between group ${
            activeSubTab === 'vendas'
              ? 'bg-[#15161d] border-amber-500 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
              : 'bg-[#121317] border-[#1f2128] hover:border-zinc-700 hover:bg-[#16171d]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl border transition ${
              activeSubTab === 'vendas'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-[#181920] text-zinc-400 border-[#23252d] group-hover:text-white'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                FATURAMENTO COMERCIAL
              </span>
              <h2 className="text-base font-black text-white tracking-wide">
                Categorias de Cidades
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Praças e municípios de entrega de mercadorias
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
              activeSubTab === 'vendas'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#181920] text-zinc-400 border-[#23252d]'
            }`}>
              {cities.length} cidades
            </span>
          </div>
        </button>

      </div>

      {/* ============================================================== */}
      {/* 1. SEÇÃO DE GERENCIAR DESPESAS                                 */}
      {/* ============================================================== */}
      {activeSubTab === 'despesas' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Security notice for operator */}
          {!isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Acesso de Operador:</strong> Você pode cadastrar novas despesas. A exclusão de categorias existentes é restrita ao <strong>Administrador Geral</strong>.
              </span>
            </div>
          )}

          {/* Add Category Form */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <span>Adicionar Novo Tipo de Despesa</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cadastre novas categorias para aparecerem na grade de botões da aba "Lançar Despesa".
              </p>
            </div>

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <input
                type="text"
                required
                placeholder="NOME DA NOVA DESPESA (ex: MANUTENÇÃO ELÉTRICA)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Despesa</span>
              </button>
            </form>
          </div>

          {/* List / Grid of Expense Categories */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Categorias de Despesas Cadastradas
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {filteredCategories.length} de {categories.length} categorias
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar categoria..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#17181e] border border-[#23252d] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredCategories.map((cat) => {
                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-xl bg-[#15161c] border border-[#20222a] hover:border-zinc-700 transition flex items-center justify-between gap-2"
                  >
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          className="w-full px-2 py-1 bg-[#1a1b22] border border-indigo-500 rounded text-xs text-white uppercase focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditCat(cat.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Salvar alteração"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1 text-zinc-500 hover:text-zinc-300"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-zinc-200 uppercase truncate block">
                            {cat.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEditCat(cat)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                            title="Renomear categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleRequestDeleteCat(cat)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SEÇÃO DE GERENCIAR CIDADES DE VENDAS                        */}
      {/* ============================================================== */}
      {activeSubTab === 'vendas' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Security notice for operator */}
          {!isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Acesso de Operador:</strong> Você pode cadastrar novas praças de venda. A exclusão de cidades existentes é restrita ao <strong>Administrador Geral</strong>.
              </span>
            </div>
          )}

          {/* Add City Form */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Adicionar Nova Cidade / Praça de Venda</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cadastre novas cidades para aparecerem imediatamente como botões de lançamento na aba "Vendas".
              </p>
            </div>

            <form onSubmit={handleAddCity} className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <input
                type="text"
                required
                placeholder="NOME DA NOVA CIDADE (ex: ARAGUAÍNA)"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Adicionar Cidade</span>
              </button>
            </form>
          </div>

          {/* List / Grid of Cities */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Cidades Cadastradas para Vendas
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {filteredCities.length} de {cities.length} cidades ativas
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar cidade..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#17181e] border border-[#23252d] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredCities.map((city) => {
                return (
                  <div
                    key={city}
                    className="p-3.5 rounded-xl bg-[#15161c] border border-[#20222a] hover:border-amber-500/40 transition flex items-center justify-between gap-2 group"
                  >
                    {editingCityName === city ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editCityValue}
                          onChange={(e) => setEditCityValue(e.target.value)}
                          className="w-full px-2 py-1 bg-[#1a1b22] border border-amber-500 rounded text-xs text-white uppercase focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditCity(city)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Salvar alteração"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingCityName(null)}
                          className="p-1 text-zinc-500 hover:text-zinc-300"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-xs font-black text-white uppercase truncate block">
                              {city}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEditCity(city)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                            title="Renomear cidade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleRequestDeleteCity(city)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition"
                              title="Excluir cidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Modal: "Realmente deseja apagar?" */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#131418] border-t sm:border border-rose-500/40 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 sm:space-y-5 animate-scale-in">
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1.5 bg-zinc-600 rounded-full mx-auto sm:hidden shrink-0" />

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Confirmar Exclusão
                </h3>
                <p className="text-xs text-zinc-400">
                  {deleteConfirmTarget.type === 'despesa' ? 'Categoria de Despesa' : 'Praça de Venda'}
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-[#181920] border border-[#23252d] space-y-2">
              <p className="text-xs text-zinc-300">
                Você realmente deseja apagar {deleteConfirmTarget.type === 'despesa' ? 'a categoria' : 'a praça de cidade'}:
              </p>
              <div className="p-3 rounded-lg bg-black/50 border border-rose-500/30 text-sm font-black text-rose-400 uppercase tracking-wide text-center">
                {deleteConfirmTarget.name}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                Essa ação é definitiva. O botão correspondente será removido da tela e não estará mais disponível para novos lançamentos.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-[#1c1d24] hover:bg-[#252732] text-zinc-300 hover:text-white text-xs font-bold transition active:scale-95 text-center min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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
