import React from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  History, 
  PieChart, 
  Settings 
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isAdmin = false,
}) => {
  const navItems = [
    {
      id: 'lancar' as ActiveTab,
      label: 'Lançar',
      icon: PlusCircle,
    },
    {
      id: 'vendas' as ActiveTab,
      label: 'Vendas',
      icon: TrendingUp,
    },
    {
      id: 'historico' as ActiveTab,
      label: 'Histórico',
      icon: History,
    },
    ...(isAdmin ? [{
      id: 'relatorios' as ActiveTab,
      label: 'Relatórios',
      icon: PieChart,
    }] : []),
    {
      id: 'configuracoes' as ActiveTab,
      label: 'Config',
      icon: Settings,
    },
  ];

  return (
    <nav 
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#101114]/95 backdrop-blur-md border-t border-[#1c1d22] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-amber-400' : 'text-zinc-400'
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${
                isActive ? 'text-amber-300 font-black' : 'text-zinc-400 font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
