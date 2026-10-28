import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  FileDown, 
  Settings as SettingsIcon,
  HardDrive,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { CompanySettings } from '../types';

interface NavbarProps {
  settings?: CompanySettings;
  onOpenNewExpense: () => void;
  onExportPDF: () => void;
  onOpenSettings: () => void;
  onOpenAiInsights: () => void;
  totalExpensesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenNewExpense,
  onExportPDF,
  onOpenSettings,
  onOpenAiInsights,
  totalExpensesCount
}) => {
  const [isElectron, setIsElectron] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setServerOnline(data.status === 'online'))
      .catch(() => setServerOnline(false));
  }, []);

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-lg tracking-wider">
            WL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {settings?.companyName || 'WL System'}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                v2.1
              </span>
            </div>
            <p className="text-xs text-slate-400 capitalize hidden sm:block">
              {todayStr}
            </p>
          </div>
        </div>

        {/* Runtime Status Pill */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {isElectron ? 'Desktop Portable (Electron)' : 'Web Server Online'}
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400 flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{totalExpensesCount} Lançamentos</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiInsights}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition text-sm font-medium"
            title="Análise com Inteligência Financeira"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>IA Financeira</span>
          </button>

          <button
            onClick={onExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-sm font-medium"
            title="Exportar Relatório em PDF"
          >
            <FileDown className="w-4 h-4 text-slate-300" />
            <span className="hidden md:inline">Exportar PDF</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Despesa</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
            title="Configurações e Backup"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
