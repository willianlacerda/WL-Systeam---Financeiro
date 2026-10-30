import React from 'react';
import { 
  PlusCircle, 
  History, 
  PieChart, 
  Settings, 
  Database,
  Menu,
  TrendingUp
} from 'lucide-react';

export type ActiveTab = 'lancar' | 'vendas' | 'historico' | 'relatorios' | 'configuracoes';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isAdmin = false,
}) => {
  return (
    <aside className="hidden md:flex w-64 bg-[#101114] border-r border-[#1c1d22] flex-col justify-between p-4 shrink-0 select-none">
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            {/* WL Logo Badge */}
            <div className="h-9 w-9 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="WL" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wider">
                  WL SYSTEM
                </span>
              </div>
              <p className="text-[9px] tracking-widest text-zinc-500 font-semibold uppercase">
                SISTEMA FINANCEIRO
              </p>
            </div>
          </div>
          <button className="text-zinc-500 hover:text-zinc-300 p-1">
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items (Clean 5 items) */}
        <nav className="space-y-1.5">
          {/* 1. Lançar Despesa */}
          <button
            onClick={() => onTabChange('lancar')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'lancar'
                ? 'bg-[#15161c] text-white border border-[#f59e0b] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#16171b]'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${activeTab === 'lancar' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Lançar Despesa</span>
          </button>

          {/* 2. Lança Venda */}
          <button
            onClick={() => onTabChange('vendas')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'vendas'
                ? 'bg-[#15161c] text-white border border-[#f59e0b] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#16171b]'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeTab === 'vendas' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Lança Venda</span>
          </button>

          {/* 3. Histórico */}
          <button
            onClick={() => onTabChange('historico')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'historico'
                ? 'bg-[#15161c] text-white border border-[#f59e0b] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#16171b]'
            }`}
          >
            <History className={`w-4 h-4 ${activeTab === 'historico' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Histórico</span>
          </button>

          {/* 4. Relatórios (Visível apenas para Administrador Geral) */}
          {isAdmin && (
            <button
              onClick={() => onTabChange('relatorios')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'relatorios'
                  ? 'bg-[#15161c] text-white border border-[#f59e0b] shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#16171b]'
              }`}
            >
              <PieChart className={`w-4 h-4 ${activeTab === 'relatorios' ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span>Relatórios</span>
            </button>
          )}

          {/* 5. Configurações (unifica Categorias, Usuários e Backup) */}
          <button
            onClick={() => onTabChange('configuracoes')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'configuracoes'
                ? 'bg-[#15161c] text-white border border-[#f59e0b] shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#16171b]'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'configuracoes' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Configurações</span>
          </button>
        </nav>
      </div>

      {/* Bottom Status Widget */}
      <div className="pt-4 border-t border-[#1c1d22]">
        <div className="flex items-center gap-2 text-[10px] tracking-wider font-semibold text-emerald-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>DADOS SINCRONIZADOS</span>
        </div>
      </div>
    </aside>
  );
};
