import React, { useMemo } from 'react';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  Wallet,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { Expense, SubCategory } from '../types';

interface DashboardProps {
  expenses: Expense[];
  subCategories: SubCategory[];
  onNavigateToExpenses: () => void;
  onOpenNewExpense: () => void;
  onToggleStatus: (id: string) => void;
  onOpenAiInsights: () => void;
}

const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#64748B'
];

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  subCategories,
  onNavigateToExpenses,
  onOpenNewExpense,
  onToggleStatus,
  onOpenAiInsights,
}) => {
  // Calculations
  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const paid = expenses.filter(e => e.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const pending = expenses.filter(e => e.status === 'pendente').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const scheduled = expenses.filter(e => e.status === 'agendado').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const paidCount = expenses.filter(e => e.status === 'pago').length;
    const pendingCount = expenses.filter(e => e.status === 'pendente').length;
    const avgExpense = expenses.length > 0 ? total / expenses.length : 0;

    return {
      total,
      paid,
      pending,
      scheduled,
      paidCount,
      pendingCount,
      totalCount: expenses.length,
      avgExpense,
      paidRatio: total > 0 ? (paid / total) * 100 : 0,
    };
  }, [expenses]);

  // Data for Category Pie Chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const cat = e.subCategory || e.category || 'Geral';
      map.set(cat, (map.get(cat) || 0) + Number(e.amount || 0));
    });

    return Array.from(map.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  // Data for Monthly / Timeline Bar Chart
  const timelineData = useMemo(() => {
    const map = new Map<string, { month: string; paid: number; pending: number }>();
    
    // Sort expenses by date
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach(e => {
      if (!e.date) return;
      const key = e.date.substring(0, 7); // YYYY-MM
      const [year, month] = key.split('-');
      const label = `${month}/${year.slice(2)}`;
      
      if (!map.has(key)) {
        map.set(key, { month: label, paid: 0, pending: 0 });
      }
      const entry = map.get(key)!;
      if (e.status === 'pago') {
        entry.paid += Number(e.amount || 0);
      } else {
        entry.pending += Number(e.amount || 0);
      }
    });

    return Array.from(map.values()).slice(-6);
  }, [expenses]);

  // Upcoming / Pending items to pay
  const upcomingExpenses = useMemo(() => {
    return expenses
      .filter(e => e.status !== 'pago')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & AI highlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              Painel Financeiro
            </span>
            <span className="text-xs text-slate-400">WL System Enterprise</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Controle de Caixa & Gestão Estratégica de Despesas
          </h2>
          <p className="text-sm text-slate-300">
            Acompanhe lançamentos, orçamentos e auditoria automatizada em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>Auditoria por IA</span>
          </button>
          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-600/30 transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Lançar Despesa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Despesas */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Despesas Totais</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              R$ {stats.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {stats.totalCount} lançamentos contabilizados
            </div>
          </div>
        </div>

        {/* Total Liquidado / Pago */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pago</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400">
              R$ {stats.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{stats.paidRatio.toFixed(1)}% do total</span>
              <span className="text-slate-600">•</span>
              <span>{stats.paidCount} pagamentos</span>
            </div>
          </div>
        </div>

        {/* Total Pendente */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">A Pagar (Pendente)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">
              R$ {stats.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-amber-400/80 mt-1">
              {stats.pendingCount} contas aguardando quitação
            </div>
          </div>
        </div>

        {/* Total Agendado */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Agendado / Futuro</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-400">
              R$ {stats.scheduled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Média de R$ {stats.avgExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / item
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Categorias Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Despesas por Categoria</h3>
              <p className="text-xs text-slate-400">Distribuição percentual do orçamento</p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              Top 6 Grupos
            </span>
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Nenhum dado cadastrado para gráfico
              </div>
            )}
          </div>
        </div>

        {/* Evolução / Histórico Mensal */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Evolução Mensal (Pago vs Pendente)</h3>
              <p className="text-xs text-slate-400">Comparativo de fluxo por competência</p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              Últimos meses
            </span>
          </div>

          <div className="h-64 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => (
                      <span className="text-xs text-slate-300">
                        {val === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    )}
                  />
                  <Bar dataKey="paid" name="paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Sem histórico temporal suficiente
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Contas a Vencer & Ação Imediata */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Próximas Contas & Vencimentos</span>
            </h3>
            <p className="text-xs text-slate-400">Contas pendentes que exigem atenção financeira</p>
          </div>
          <button
            onClick={onNavigateToExpenses}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <span>Ver todas as despesas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {upcomingExpenses.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {upcomingExpenses.map(expense => (
              <div key={expense.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleStatus(expense.id)}
                    className="p-1 rounded-full text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition"
                    title="Marcar como Pago"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{expense.subCategory || expense.category}</span>
                      <span>•</span>
                      <span>Vencimento: {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-sm font-bold text-amber-400">
                      R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                      {expense.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-slate-400 text-sm">
            Nenhuma despesa pendente no momento! Todas as contas estão em dia.
          </div>
        )}
      </div>

    </div>
  );
};
