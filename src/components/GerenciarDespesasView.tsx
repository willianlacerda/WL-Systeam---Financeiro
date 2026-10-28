import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tags } from 'lucide-react';
import { SubCategory } from '../types';

interface GerenciarDespesasViewProps {
  categories: SubCategory[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
}

export const GerenciarDespesasView: React.FC<GerenciarDespesasViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim().toUpperCase());
    setNewCatName('');
  };

  const handleStartEdit = (cat: SubCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onRenameCategory(id, editName.trim().toUpperCase());
    setEditingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header & Add form */}
      <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Gerenciar Botões de Despesas
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Cadastre novos botões ou edite os nomes que aparecem na tela principal de lançamentos.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
          <input
            type="text"
            required
            placeholder="NOME DA NOVA DESPESA (ex: COMBUSTÍVEL CAMINHÃO)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 uppercase focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#4f46e5] hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Botão</span>
          </button>
        </form>
      </div>

      {/* Grid of existing buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-xl bg-[#141519] border border-[#20222a] flex items-center justify-between gap-2"
          >
            {editingId === cat.id ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 bg-[#1a1b22] border border-indigo-500 rounded text-xs text-white uppercase"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(cat.id)}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs font-bold text-white uppercase truncate">
                  {cat.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1 text-zinc-500 hover:text-indigo-400 transition"
                    title="Renomear"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remover botão "${cat.name}"?`)) {
                        onDeleteCategory(cat.id);
                      }
                    }}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
