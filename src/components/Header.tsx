import React from 'react';
import { LogOut, Shield, UserCheck, RefreshCw, Cloud } from 'lucide-react';

interface HeaderProps {
  title: string;
  setor?: string;
  usuario?: string;
  isAdmin?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'error';
  onManualSync?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  usuario = 'Willian',
  isAdmin = true,
  syncStatus = 'synced',
  onManualSync,
  onLogout,
}) => {
  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 border-b border-[#1c1d22] flex items-center justify-between shrink-0 bg-[#0b0c0e] sticky top-0 z-30">
      {/* Left: Mobile Brand + Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="md:hidden h-7 w-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          <img 
            src="/logo.png" 
            alt="WL" 
            className="h-full w-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[130px] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* Right User & Role Info + Logout Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Nível Operacional Badge */}
        <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
          isAdmin
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
        }`}>
          {isAdmin ? (
            <>
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Administrador Geral</span>
              <span className="sm:hidden">Admin</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Operador de Lançamento</span>
              <span className="sm:hidden">Operador</span>
            </>
          )}
        </div>

        {/* Cloud Sync Status / Button */}
        <button
          onClick={onManualSync}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition active:scale-95 cursor-pointer ${
            syncStatus === 'syncing'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : syncStatus === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title="Clique para sincronizar com a nuvem (celular e PC)"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">
            {syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Erro na Nuvem' : 'Nuvem Conectada'}
          </span>
          <span className="md:hidden">
            {syncStatus === 'syncing' ? '...' : 'Nuvem'}
          </span>
        </button>

        <span className="hidden sm:inline text-zinc-700">|</span>

        {/* Current Active User Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#14151a] border border-[#23252d]">
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-[11px] shrink-0 ${
            isAdmin ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'
          }`}>
            {usuario.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[9px] text-zinc-500 uppercase font-semibold leading-none">Usuário:</span>
            <strong className="text-white font-black text-xs uppercase tracking-wide leading-tight truncate max-w-[100px]">
              {usuario}
            </strong>
          </div>
        </div>

        {/* Logout / Switch User Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm min-h-[36px]"
            title="Sair do sistema e voltar para tela de login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-xs font-bold">Sair</span>
          </button>
        )}

      </div>
    </header>
  );
};
