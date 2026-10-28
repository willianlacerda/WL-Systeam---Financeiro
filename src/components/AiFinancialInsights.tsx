import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { Expense, SubCategory, AiReportResponse } from '../types';
import { fetchAiInsights } from '../services/api';

interface AiFinancialInsightsProps {
  expenses: Expense[];
  subCategories: SubCategory[];
}

export const AiFinancialInsights: React.FC<AiFinancialInsightsProps> = ({
  expenses,
  subCategories,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiReportResponse | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const data = await fetchAiInsights(expenses, subCategories, 'Período Atual');
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Inteligência Analítica WL System
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Auditoria Financeira & Diagnóstico Estratégico
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Análise inteligente de fluxo de caixa, detecção de custos anormais e recomendações de economia baseadas em seus lançamentos.
            </p>
          </div>

          <button
            onClick={runAudit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm shadow-xl shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Processando Auditoria...' : 'Executar Análise IA'}</span>
          </button>
        </div>
      </div>

      {/* Results / Cards */}
      {report ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Score Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
                {report.score || 88}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Índice de Saúde Financeira
                </div>
                <div className="text-lg font-bold text-white">
                  {(report.score || 88) >= 80 ? 'Excelente Controle Orçamentário' : 'Atenção aos Prazos & Concentração'}
                </div>
                <div className="text-xs text-slate-400">
                  Pontuação gerada a partir da liquidez, pontualidade e equilíbrio entre categorias
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dados Auditados
              </span>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.insights.map((insight, idx) => {
              const isAlert = insight.type === 'alert';
              const isTip = insight.type === 'tip';
              const isForecast = insight.type === 'forecast';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    isAlert
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                      : isTip
                      ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                      : isForecast
                      ? 'bg-blue-950/20 border-blue-900/40 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAlert ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    ) : isTip ? (
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                    ) : isForecast ? (
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {insight.title}
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {insight.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Nenhuma auditoria executada nesta sessão
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Clique no botão acima para submeter os lançamentos financeiros à análise inteligente e receber pareceres executivos.
          </p>
          <button
            onClick={runAudit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Gerar Diagnóstico Agora
          </button>
        </div>
      )}

    </div>
  );
};
