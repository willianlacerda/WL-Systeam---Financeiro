import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Shield, 
  Trash2, 
  Edit2, 
  X, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck
} from 'lucide-react';
import { AppUser } from '../types';

interface UsersManagerProps {
  appUsers: AppUser[];
  onAddUser: (user: Omit<AppUser, 'id'>) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  isAdmin?: boolean;
}

export const UsersManager: React.FC<UsersManagerProps> = ({
  appUsers,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  isAdmin = true,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states (sem e-mail conforme solicitado)
  const [name, setName] = useState('');
  const [setor, setSetor] = useState('Operacional');
  const [role, setRole] = useState<'admin' | 'operador'>('operador');
  const [pass, setPass] = useState('');
  const [active, setActive] = useState(true);

  const handleStartAdd = () => {
    if (!isAdmin) {
      alert('Apenas o Administrador Geral possui permissão para cadastrar novos usuários.');
      return;
    }
    setIsAdding(true);
    setEditingId(null);
    setName('');
    setSetor('Operacional');
    setRole('operador');
    setPass('123');
    setActive(true);
  };

  const handleStartEdit = (user: AppUser) => {
    if (!isAdmin) {
      alert('Apenas o Administrador Geral possui permissão para editar usuários.');
      return;
    }
    setEditingId(user.id);
    setIsAdding(false);
    setName(user.name);
    setSetor(user.setor || 'Operacional');
    setRole(user.role === 'admin' ? 'admin' : 'operador');
    setPass(user.pass || '');
    setActive(user.active);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Ação não autorizada. Apenas o Administrador Geral pode salvar alterações de usuários.');
      return;
    }
    if (!name.trim()) return;

    if (editingId) {
      onUpdateUser({
        id: editingId,
        name: name.trim().toUpperCase(),
        setor: setor.trim(),
        role,
        pass: pass.trim() || '123',
        active,
      });
      setEditingId(null);
    } else {
      onAddUser({
        name: name.trim().toUpperCase(),
        setor: setor.trim(),
        role,
        pass: pass.trim() || '123',
        active,
      });
      setIsAdding(false);
    }
  };

  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const handleDelete = (user: AppUser) => {
    if (!isAdmin) return;
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete || !isAdmin) {
      setUserToDelete(null);
      return;
    }
    onDeleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Gestão de Usuários</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de operadores e administradores do sistema financeiro.
          </p>
        </div>

        {/* Botão Novo Usuário (somente para Administrador Geral) */}
        {!isAdding && !editingId && (
          <div>
            {isAdmin ? (
              <button
                onClick={handleStartAdd}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#17181e] border border-[#262833] text-zinc-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Criação restrita ao Administrador Geral</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security notice for non-admin */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-300 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Acesso de Operador:</strong> Você está visualizando a listagem de usuários em modo de leitura. Somente o <strong>Administrador Geral</strong> pode cadastrar novos usuários, alterar cargos ou excluir contas.
          </span>
        </div>
      )}

      {/* Add / Edit Form Modal/Drawer */}
      {(isAdding || editingId) && isAdmin && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#14151a] border border-indigo-500/40 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#23252d]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {editingId ? 'Editar Cadastro do Usuário' : 'Cadastrar Novo Usuário'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="text-zinc-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nome do Usuário *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: CARLOS ALBERTO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
                autoFocus
              />
            </div>

            {/* Nível Operacional (Apenas 2 níveis) */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nível Operacional *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'operador')}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="operador">Operador de Lançamento</option>
                <option value="admin">Administrador Geral</option>
              </select>
            </div>

            {/* Setor */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Setor / Lotação
              </label>
              <input
                type="text"
                placeholder="Ex: Operacional / Administrativo"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Senha de Acesso / PIN */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Senha / PIN *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 123 ou 7548"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#23252d] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
          </div>

          {/* Status Ativo / Inativo */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="active-check"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded bg-[#17181e] border-[#23252d] text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="active-check" className="text-xs text-zinc-300 font-medium cursor-pointer">
              Usuário ativo com permissão para operar no sistema
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#23252d]">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-4 py-2 rounded-xl bg-[#17181e] hover:bg-[#20222a] text-zinc-300 text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg transition"
            >
              Salvar Usuário
            </button>
          </div>
        </form>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appUsers.map((user) => {
          const isUserAdmin = user.role === 'admin';
          return (
            <div
              key={user.id}
              className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] hover:border-zinc-700 transition flex items-center justify-between gap-3 shadow-sm group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                  isUserAdmin
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                }`}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white tracking-wide uppercase truncate">
                      {user.name}
                    </h4>
                    {user.active ? (
                      <span className="h-2 w-2 rounded-full bg-[#00e676]" title="Usuário Ativo" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-zinc-600" title="Usuário Inativo" />
                    )}
                  </div>

                  {/* Nível Operacional Badge (Apenas 2 níveis) */}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                      isUserAdmin
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-[#181920] text-zinc-300 border-[#262833]'
                    }`}>
                      {isUserAdmin ? 'Administrador Geral' : 'Operador de Lançamento'}
                    </span>
                  </div>

                  {user.setor && (
                    <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                      Setor: {user.setor}
                    </div>
                  )}
                  {isAdmin && user.pass && (
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      Senha de acesso: <span className="text-zinc-200 font-semibold">{user.pass}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação (Apenas habilitados para o Administrador Geral) */}
              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(user)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    title="Editar usuário"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                    title="Remover usuário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for User Deletion */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#131418] border border-rose-500/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Confirmar Exclusão de Usuário
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestão de Acesso do Sistema
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#181920] border border-[#23252d] space-y-2">
              <p className="text-xs text-zinc-300">
                Você realmente deseja excluir o usuário:
              </p>
              <div className="p-3 rounded-lg bg-black/50 border border-rose-500/30 text-sm font-black text-rose-400 uppercase tracking-wide text-center">
                {userToDelete.name}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                O usuário perderá o acesso operacional imediatamente ao sistema financeiro.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-[#1c1d24] hover:bg-[#252732] text-zinc-300 hover:text-white text-xs font-bold transition active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition flex items-center gap-2 active:scale-95"
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
