import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  FileDown, 
  Landmark, 
  MapPin, 
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Building2,
  Trash2,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Sale, Expense, CompanySettings } from '../types';
import { formatCurrencyBRL } from '../services/pdfExport';
import { SaleModal } from './SaleModal';
import { ExportVendasPdfModal } from './ExportVendasPdfModal';

interface VendasViewProps {
  sales: Sale[];
  expenses: Expense[];
  settings?: CompanySettings;
  currentUser: string;
  cities?: string[];
  onSaveSale: (saleData: Omit<Sale, 'id'>, editId?: string) => void;
  onDeleteSale: (id: string) => void;
  onToggleSaleStatus: (id: string) => void;
  isAdmin?: boolean;
}

const CIDADES_PADRAO = [
  'AGUIARNÓPOLIS',
  'AMARANTE',
  'ANANÁS',
  'ANGICO',
  'CAMPESTRE',
  'CAROLINA',
  'CENTRO DOS BORGES',
  'DARCINÓPOLIS',
  'LAJEADO',
  'PASSAGEM BOA',
  'PORTO FRANCO',
  'RIACHÃO',
  'RIACHINHO',
  'SÍTIO NOVO',
  'TOCANTINÓPOLIS',
  'WANDERLÂNDIA',
];

export const VendasView: React.FC<VendasViewProps> = ({
  sales,
  expenses,
  settings,
  currentUser,
  cities,
  onSaveSale,
  onDeleteSale,
  onToggleSaleStatus,
  isAdmin = true,
}) => {
  // Modal states
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedCityForModal, setSelectedCityForModal] = useState<string>('CAROLINA');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<'entradas' | 'dre'>('entradas');

  // Search filter for cities list
  const [citySearchTerm, setCitySearchTerm] = useState('');

  // Combined list of cities (from system cities + registered sales)
  const allCities = useMemo(() => {
    const baseList = cities && cities.length > 0 ? cities : CIDADES_PADRAO;
    const fromSales = sales.map(s => (s.city || '').toUpperCase().trim()).filter(Boolean);
    const set = new Set([...baseList.map(c => c.toUpperCase().trim()), ...fromSales]);
    return Array.from(set).sort();
  }, [sales, cities]);

  const filteredCities = useMemo(() => {
    if (!citySearchTerm.trim()) return allCities;
    const term = citySearchTerm.toUpperCase().trim();
    return allCities.filter(c => c.includes(term));
  }, [allCities, citySearchTerm]);

  // Top 6 recent sales
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [sales]);

  // Current month total
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonthSalesTotal = useMemo(() => {
    return sales
      .filter(s => s.date && s.date.startsWith(currentMonthKey))
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
  }, [sales, currentMonthKey]);

  const currentMonthExpensesTotal = useMemo(() => {
    return expenses
      .filter(e => {
        const d = (e.date || e.expenseDate || '').slice(0, 7);
        return d === currentMonthKey;
      })
      .reduce((acc, e) => acc + Number(e.amount ?? e.value ?? 0), 0);
  }, [expenses, currentMonthKey]);

  const currentMonthNetResult = currentMonthSalesTotal - currentMonthExpensesTotal;
  const isMonthLucro = currentMonthNetResult >= 0;

  const totalSalesAmount = useMemo(() => {
    return sales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
  }, [sales]);


  // Action: Launch Sale for specific City
  const handleOpenCitySale = (cityName: string) => {
    setEditingSale(null);
    setSelectedCityForModal(cityName);
    setIsSaleModalOpen(true);
  };

  // Action: Export Reports
  const handleOpenExportEntradas = () => {
    setExportMode('entradas');
    setIsExportModalOpen(true);
  };

  const handleOpenExportDRE = () => {
    setExportMode('dre');
    setIsExportModalOpen(true);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* Top Header Bar with Report Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-[#1c1d22]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ÁREA DE VENDAS (FATURAMENTO)
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-xs text-zinc-400">WL System</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-wide mt-1">
            Vendas do Mês & Faturamento
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Lançamento exclusivo de vendas por praça e comparativo financeiro.
          </p>
        </div>

        {/* The Two Report Emission Buttons (Apenas Administrador Geral) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenExportEntradas}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#16171d] hover:bg-[#1e2027] border border-[#272935] text-zinc-200 text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-sm group active:scale-95 min-h-[40px]"
              title="Exportar Relatório de Entradas (Vendas) em PDF"
            >
              <FileDown className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Relatório de Entradas (PDF)</span>
            </button>

            <button
              onClick={handleOpenExportDRE}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-[#16171d] hover:from-indigo-900/60 hover:to-[#1e2027] border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-sm group active:scale-95 min-h-[40px]"
              title="Exportar Demonstração do Resultado do Exercício (DRE): Vendas vs Despesas"
            >
              <Landmark className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>DRE Demonstrativo (PDF)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Grid (8 cols left, 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column (8 cols): Seleção de Cidade para Lançar Venda */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          
          {/* Opção Lançar Venda por Cidade */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Adicionar Venda por Cidade
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  ({filteredCities.length} cidades)
                </span>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar cidade..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 sm:py-1.5 bg-[#17181e] border border-[#23252d] rounded-xl sm:rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Grid of City Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredCities.map((cidade) => (
                <button
                  key={cidade}
                  onClick={() => handleOpenCitySale(cidade)}
                  className="min-h-[56px] sm:min-h-[64px] p-2.5 sm:p-3 rounded-xl text-xs font-extrabold tracking-wide uppercase flex flex-col items-center justify-center text-center transition-all duration-150 bg-[#16171d] hover:bg-[#1f2129] text-zinc-200 border border-[#23252e] hover:border-amber-500/50 hover:shadow-md group active:scale-95"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 group-hover:scale-105 transition-transform mb-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-white group-hover:text-amber-300 truncate max-w-[120px]">{cidade}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-normal group-hover:text-zinc-400">
                    Lançar Venda
                  </span>
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Resumo e Lançamentos Recentes */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card Resumo do Mês (Vendas - Apenas Administrador) */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                  FATURAMENTO DO MÊS (VENDAS)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 uppercase">
                  ENTRADAS
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-[#00e676] font-mono tracking-tight">
                  {formatCurrencyBRL(currentMonthSalesTotal)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Total acumulado geral: <strong className="text-white font-mono">{formatCurrencyBRL(totalSalesAmount)}</strong>
                </div>

                {/* Visual bar */}
                <div className="w-full bg-[#1e2027] h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#00e676] h-full rounded-full w-3/4 shadow-sm shadow-emerald-500/50" />
                </div>
              </div>
            </div>
          )}

          {/* Card Comparativo DRE do Mês (Vendas vs Despesas - Apenas Administrador) */}
          {isAdmin && (
            <div className="p-5 rounded-2xl bg-[#121317] border border-indigo-500/30 space-y-3 shadow-sm bg-gradient-to-b from-[#141520] to-[#111216]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                  <span>BALANÇO DRE DO MÊS</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  isMonthLucro 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {isMonthLucro ? 'LUCRO' : 'PREJUÍZO'}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>(+) Vendas do Mês:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrencyBRL(currentMonthSalesTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>(-) Despesas da Empresa:</span>
                  <span className="font-mono font-bold text-rose-400">
                    -{formatCurrencyBRL(currentMonthExpensesTotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#232533]">
                  <span className="text-zinc-200 font-bold">(=) Saldo do Exercício:</span>
                  <span className={`font-mono font-black text-sm ${isMonthLucro ? 'text-[#00e676]' : 'text-rose-400'}`}>
                    {formatCurrencyBRL(currentMonthNetResult)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenExportDRE}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold tracking-wide transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>Emitir Demonstrativo DRE (PDF)</span>
              </button>
            </div>
          )}

          {/* Card Lançamentos Recentes de Vendas */}
          <div className="p-5 rounded-2xl bg-[#121317] border border-[#1f2128] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                VENDAS RECENTES
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {sales.length} no total
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl bg-[#16171d] border border-[#202229] hover:border-zinc-700 transition flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#1d1f2b] text-amber-300 border border-amber-500/30">
                        {sale.city}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatDateShort(sale.date)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-1">
                      {sale.description}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#00e676] font-mono">
                      {formatCurrencyBRL(sale.amount)}
                    </div>
                    <button
                      onClick={() => onToggleSaleStatus(sale.id)}
                      className={`text-[9px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded border transition ${
                        sale.status === 'recebido'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {sale.status === 'recebido' ? 'RECEBIDO' : 'A RECEBER'}
                    </button>
                  </div>
                </div>
              ))}

              {recentSales.length === 0 && (
                <div className="py-6 text-center text-xs text-zinc-500">
                  Nenhuma venda registrada ainda.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Sale Modal for Adding or Editing */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={onSaveSale}
        currentUser={currentUser}
        initialSale={editingSale}
        defaultCity={selectedCityForModal}
        existingCities={allCities}
      />

      {/* Export PDF Modal (Prompting for Date Interval for Entradas and DRE) */}
      <ExportVendasPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        mode={exportMode}
        sales={sales}
        expenses={expenses}
        settings={settings}
      />

    </div>
  );
};
