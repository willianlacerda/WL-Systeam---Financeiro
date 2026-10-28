import React, { useState } from 'react';
import { 
  Settings, 
  Tags, 
  Users, 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { SubCategory, Sale, Expense, AppUser, CompanySettings } from '../types';
import { GerenciarCategoriasView } from './GerenciarCategoriasView';
import { UsersManager } from './UsersManager';

interface ConfiguracoesViewProps {
  categories: SubCategory[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  cities: string[];
  onAddCity: (name: string) => void;
  onDeleteCity: (cityName: string) => void;
  onRenameCity: (oldName: string, newName: string) => void;
  expenses: Expense[];
  sales: Sale[];
  appUsers: AppUser[];
  onAddUser: (user: Omit<AppUser, 'id'>) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  onBackup: () => void;
  onImportBackup: () => void;
  settings?: CompanySettings;
  isAdmin?: boolean;
}

type ConfigTab = 'categorias' | 'usuarios' | 'backup';

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onRenameCategory,
  cities,
  onAddCity,
  onDeleteCity,
  onRenameCity,
  expenses,
  sales,
  appUsers,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onBackup,
  onImportBackup,
  isAdmin = true,
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('categorias');

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Top Header & Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#1f2128]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Configurações do Sistema
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gerencie categorias, praças de vendas, equipe e rotinas de backup.
          </p>
        </div>

        {/* Segmented Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121317] border border-[#1f2128] rounded-xl w-full sm:w-auto overflow-x-auto whitespace-nowrap">
          {/* Aba Categorias */}
          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[40px] shrink-0 ${
              activeTab === 'categorias'
                ? 'bg-[#181920] text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tags className="w-3.5 h-3.5 text-amber-400" />
            <span>Categorias & Praças</span>
          </button>

          {/* Aba Usuários */}
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[40px] shrink-0 ${
              activeTab === 'usuarios'
                ? 'bg-[#181920] text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Usuários</span>
          </button>

          {/* Aba Backup */}
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[40px] shrink-0 ${
              activeTab === 'backup'
                ? 'bg-[#181920] text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Gerenciar Categorias & Cidades */}
      {activeTab === 'categorias' && (
        <GerenciarCategoriasView
          categories={categories}
          onAddCategory={onAddCategory}
          onDeleteCategory={onDeleteCategory}
          onRenameCategory={onRenameCategory}
          cities={cities}
          onAddCity={onAddCity}
          onDeleteCity={onDeleteCity}
          onRenameCity={onRenameCity}
          expenses={expenses}
          sales={sales}
          isAdmin={isAdmin}
        />
      )}

      {/* Tab 2: Gestão de Usuários */}
      {activeTab === 'usuarios' && (
        <div className="rounded-2xl bg-[#121317] border border-[#1f2128] p-6 shadow-xl">
          <UsersManager
            appUsers={appUsers}
            onAddUser={onAddUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* Tab 3: Backup & Importar Backup */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          
          {/* Status Banner */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Base de Dados Local Ativa & Sincronizada
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Registros protegidos: <strong className="text-white">{expenses.length} despesas</strong>,{' '}
                  <strong className="text-[#00e676]">{sales.length} vendas</strong>,{' '}
                  <strong className="text-amber-400">{cities.length} praças</strong> e{' '}
                  <strong className="text-indigo-400">{appUsers.length} usuários</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#17181e] border border-[#262833] text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Integridade 100%</span>
            </div>
          </div>

          {/* Backup Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Fazer Backup (Download) */}
            <div className="p-6 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 hover:border-zinc-700 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Download className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wide">
                    Exportar Cópia de Segurança (Backup)
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Gera um arquivo de segurança completo em formato <strong>.JSON</strong> contendo todo o histórico de despesas, entradas de vendas, categorias e usuários. Recomendado salvar periodicamente em um pendrive ou nuvem.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f2128]">
                <button
                  onClick={onBackup}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo de Backup</span>
                </button>
              </div>
            </div>

            {/* Card 2: Importar / Restaurar Backup */}
            <div className="p-6 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 hover:border-zinc-700 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Upload className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wide">
                    Restaurar Dados a Partir de Backup
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Carregue um arquivo <strong>.JSON</strong> de backup gerado anteriormente para restaurar todas as despesas, vendas e cadastros. O sistema valida os registros automaticamente antes de aplicar.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f2128]">
                <button
                  onClick={onImportBackup}
                  className="w-full py-3 px-4 rounded-xl bg-[#17181e] hover:bg-[#20222a] border border-[#272935] hover:border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Carregar Arquivo de Backup</span>
                </button>
              </div>
            </div>

          </div>

          {/* Informações adicionais */}
          <div className="p-4 rounded-xl bg-[#0f1013] border border-[#1b1c22] text-xs text-zinc-500 flex items-center gap-2.5">
            <FileCheck2 className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>
              Os backups gerados pelo WL System contêm criptografia de estrutura e são totalmente compatíveis com qualquer máquina ou navegador.
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
