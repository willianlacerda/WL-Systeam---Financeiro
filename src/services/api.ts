import { FinancialData, Expense, SubCategory, AppUser, Sale } from '../types';

export const ORIGINAL_CATEGORIES: string[] = [
  'ÁGUA',
  'ALUGUEL',
  'BALSA PIPES',
  'COMBUSTÍVEL ENTREGA',
  'COMISSÕES',
  'COMPRAS BAHIA',
  'COMPRAS CT',
  'COMPRAS GOIÂNIA',
  'COMPRAS IMPERATRIZ',
  'COMPRAS NC',
  'CONSÓRCIO MAGALU',
  'CONTABILIDADE',
  'CUSTOS CARTORIAIS',
  'DÉCIMO TERCEIRO',
  'DIARISTAS',
  'ENERGIA',
  'FOLHA DE PAGAMENTO',
  'FRETES CAMINHÕES (TERCEIROS)',
  'HOSPEDAGEM/ALIMENTAÇÃO',
  'IMPOSTOS',
  'INTERNET',
  'MANUT. PREDIAL',
  'MANUT./REVISÕES VEÍCULO',
  'MÁQUINAS E EQUIPAMENTOS',
  'MATERIAL DE ESCRITÓRIO',
  'MATERIAL DE LIMPEZA',
  'PROCESSO CAMINHÃO',
  'RECISÕES',
];

const INITIAL_SUBCATEGORIES: SubCategory[] = ORIGINAL_CATEGORIES.map((cat, idx) => ({
  id: `cat-${idx + 1}`,
  name: cat,
}));

const INITIAL_USERS: AppUser[] = [
  { id: 'usr-1', name: 'Willian', setor: 'Administrativo', role: 'admin', active: true },
  { id: 'usr-2', name: 'Operador Padrão', setor: 'Operacional', role: 'operador', active: true },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: 'COMPRAS BAHIA',
    category: 'COMPRAS BAHIA',
    amount: 537630.00,
    date: '2026-08-30',
    paymentMethod: 'Transferência',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
    notes: 'Lote de suprimentos e mercadorias Bahia',
  },
  {
    id: 'exp-2',
    description: 'MANUT./REVISÕES VEÍCULO',
    category: 'MANUT./REVISÕES VEÍCULO',
    amount: 933.66,
    date: '2026-12-09',
    paymentMethod: 'Boleto',
    status: 'agendado',
    user: 'Willian',
    setor: 'Administrativo',
    notes: 'Revisão preventiva frota',
  },
  {
    id: 'exp-3',
    description: 'MANUT./REVISÕES VEÍCULO',
    category: 'MANUT./REVISÕES VEÍCULO',
    amount: 933.66,
    date: '2026-11-11',
    paymentMethod: 'Boleto',
    status: 'agendado',
    user: 'Willian',
    setor: 'Administrativo',
    notes: 'Parcela manutenção mecânica',
  },
  {
    id: 'exp-4',
    description: 'MANUT./REVISÕES VEÍCULO',
    category: 'MANUT./REVISÕES VEÍCULO',
    amount: 933.66,
    date: '2026-10-22',
    paymentMethod: 'Boleto',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
    notes: 'Troca de pneus e suspensão',
  },
  {
    id: 'exp-5',
    description: 'MANUT. PREDIAL',
    category: 'MANUT. PREDIAL',
    amount: 400.00,
    date: '2026-10-22',
    paymentMethod: 'PIX',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
    notes: 'Reparo elétrico galpão',
  },
  {
    id: 'exp-6',
    description: 'FOLHA DE PAGAMENTO',
    category: 'FOLHA DE PAGAMENTO',
    amount: 485000.00,
    date: '2026-10-05',
    paymentMethod: 'Transferência',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
  },
  {
    id: 'exp-7',
    description: 'IMPOSTOS',
    category: 'IMPOSTOS',
    amount: 122979.16,
    date: '2026-10-20',
    paymentMethod: 'Boleto',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
  },
  {
    id: 'exp-8',
    description: 'COMPRAS CT',
    category: 'COMPRAS CT',
    amount: 1850000.00,
    date: '2026-07-15',
    paymentMethod: 'Transferência',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
  },
  {
    id: 'exp-9',
    description: 'COMPRAS GOIÂNIA',
    category: 'COMPRAS GOIÂNIA',
    amount: 1636741.84,
    date: '2026-06-10',
    paymentMethod: 'Transferência',
    status: 'pago',
    user: 'Willian',
    setor: 'Administrativo',
  }
];

export const INITIAL_SALES: Sale[] = [];


export const INITIAL_CITIES: string[] = [
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

export const INITIAL_DATA: FinancialData = {
  expenses: INITIAL_EXPENSES,
  subCategories: INITIAL_SUBCATEGORIES,
  appUsers: INITIAL_USERS,
  sales: INITIAL_SALES,
  cities: INITIAL_CITIES,
  settings: {
    companyName: 'WL SYSTEM',
    currentUser: 'Willian',
    currentSetor: 'Administrativo',
  }
};

declare global {
  interface Window {
    electronAPI?: {
      getData: () => Promise<any>;
      saveData: (data: any) => Promise<any>;
      saveDataSync?: (data: any) => { success: boolean; error?: string };
      saveLogo?: (base64: string) => Promise<any>;
      getExternalLogo?: () => Promise<string | null>;
    };
  }
}

export const normalizeSale = (s: any, idx?: number): Sale => ({
  id: s.id || `sale-${idx !== undefined ? idx + 1 : Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  description: s.description || s.desc || 'Venda de Mercadoria',
  client: s.client || s.cliente || '',
  city: s.city || s.cidade || s.praca || 'Geral',
  amount: Number(s.amount !== undefined ? s.amount : s.value) || 0,
  date: s.date || s.saleDate || (s.createdAt ? s.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
  paymentMethod: s.paymentMethod || s.formaPagamento || 'Transferência',
  status: s.status === 'a_receber' || s.status === 'pendente' ? 'a_receber' : 'recebido',
  user: (s.user || s.createdBy || 'Willian').toUpperCase(),
  notes: s.notes || s.observacao || s.observation || '',
  createdAt: s.createdAt || new Date().toISOString(),
});

export const normalizeExpense = (e: any): Expense => ({
  id: e.id || `exp-${Math.random()}`,
  description: e.description || e.subcategory || e.category || 'Despesa',
  category: e.category || 'Geral',
  subCategory: e.subCategory || e.subcategory || e.description || e.category,
  amount: Number(e.amount !== undefined ? e.amount : e.value) || 0,
  date: e.date || e.expenseDate || (e.createdAt ? e.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
  user: (e.user || e.createdBy || 'Willian').toUpperCase(),
  setor: e.setor || 'Administrativo',
  notes: e.notes || e.observation || '',
  paymentMethod: e.paymentMethod || 'Transferência',
  status: e.status || 'pago',
  createdAt: e.createdAt || new Date().toISOString(),
});

export const normalizeSubCategory = (c: any, idx: number): SubCategory => ({
  id: c.id || `cat-${idx + 1}`,
  name: c.name || c.subcategory || c.description || 'Outros',
  category: c.category || 'Geral',
});

export const normalizeAppUser = (u: any, idx: number): AppUser => ({
  id: u.id || `usr-${idx + 1}`,
  name: u.name || u.username || 'Usuário',
  username: u.username || u.name || 'usuario',
  pass: u.pass || u.password || (u.role === 'admin' || u.name?.toLowerCase().includes('willian') ? '7548' : '123'),
  setor: u.setor || 'Operacional',
  role: (u.role === 'admin' || u.role === 'master' || u.name?.toLowerCase().includes('willian')) ? 'admin' : 'operador',
  active: u.active !== undefined ? u.active : true,
});

import { 
  getFirebaseFinancialData, 
  saveFirebaseFinancialData 
} from './firebase';

export async function fetchFinancialData(): Promise<FinancialData> {
  // 1. Cloud Firestore mode (Primary for real-time multi-device sync)
  try {
    const cloudData = await getFirebaseFinancialData();
    if (cloudData && (cloudData.expenses?.length || cloudData.subCategories?.length || cloudData.sales?.length !== undefined)) {
      // Mirror to local storage and electron for offline access
      try {
        localStorage.setItem('wl_system_data', JSON.stringify(cloudData));
        if (typeof window !== 'undefined' && window.electronAPI?.saveData) {
          window.electronAPI.saveData(cloudData).catch(() => {});
        }
      } catch {}

      return {
        expenses: (cloudData.expenses || []).map(normalizeExpense),
        subCategories: (cloudData.subCategories || []).map(normalizeSubCategory),
        appUsers: (cloudData.appUsers || []).map(normalizeAppUser),
        sales: Array.isArray(cloudData.sales) ? cloudData.sales.map(normalizeSale) : [],
        cities: (cloudData.cities && cloudData.cities.length > 0) ? cloudData.cities : INITIAL_CITIES,
        settings: cloudData.settings || INITIAL_DATA.settings,
      };
    }
  } catch (err) {
    console.warn('Could not read from Firestore, falling back to local:', err);
  }

  // 2. Electron IPC mode
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getData === 'function') {
    try {
      const data = await window.electronAPI.getData();
      if (data && (data.expenses?.length || data.subCategories?.length || data.sales?.length !== undefined)) {
        const normalized = {
          expenses: (data.expenses || []).map(normalizeExpense),
          subCategories: (data.subCategories || []).map(normalizeSubCategory),
          appUsers: (data.appUsers || []).map(normalizeAppUser),
          sales: Array.isArray(data.sales) ? data.sales.map(normalizeSale) : [],
          cities: (data.cities && data.cities.length > 0) ? data.cities : INITIAL_CITIES,
          settings: data.settings || INITIAL_DATA.settings,
        };
        // Seed cloud if empty
        saveFirebaseFinancialData(normalized).catch(() => {});
        return normalized;
      }
    } catch (e) {
      console.warn('Error reading from electronAPI:', e);
    }
  }

  // 3. HTTP Server API mode
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data && (data.expenses?.length || data.subCategories?.length || data.sales?.length !== undefined)) {
        const normalized = {
          expenses: (data.expenses || []).map(normalizeExpense),
          subCategories: (data.subCategories || []).map(normalizeSubCategory),
          appUsers: (data.appUsers || []).map(normalizeAppUser),
          sales: Array.isArray(data.sales) ? data.sales.map(normalizeSale) : [],
          cities: (data.cities && data.cities.length > 0) ? data.cities : INITIAL_CITIES,
          settings: data.settings || INITIAL_DATA.settings,
        };
        saveFirebaseFinancialData(normalized).catch(() => {});
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Failed to load /api/data:', err);
  }

  // 4. LocalStorage fallback
  try {
    const local = localStorage.getItem('wl_system_data');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && (parsed.expenses?.length || parsed.subCategories?.length || parsed.sales?.length !== undefined)) {
        const normalized = {
          expenses: (parsed.expenses || []).map(normalizeExpense),
          subCategories: (parsed.subCategories || []).map(normalizeSubCategory),
          appUsers: (parsed.appUsers || []).map(normalizeAppUser),
          sales: Array.isArray(parsed.sales) ? parsed.sales.map(normalizeSale) : [],
          cities: (parsed.cities && parsed.cities.length > 0) ? parsed.cities : INITIAL_CITIES,
          settings: parsed.settings || INITIAL_DATA.settings,
        };
        saveFirebaseFinancialData(normalized).catch(() => {});
        return normalized;
      }
    }
  } catch (e) {}

  // 5. Default Seed Data (upload to cloud on first run)
  saveFirebaseFinancialData(INITIAL_DATA).catch(() => {});
  saveFinancialData(INITIAL_DATA).catch(() => {});
  return INITIAL_DATA;
}

export async function saveFinancialData(data: FinancialData): Promise<boolean> {
  // 1. LocalStorage for immediate persistence
  try {
    localStorage.setItem('wl_system_data', JSON.stringify(data));
  } catch (e) {}

  // 2. Electron file persistence for desktop app
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveData === 'function') {
    try {
      await window.electronAPI.saveData(data);
    } catch (e) {
      console.error('saveData Electron failed:', e);
    }
  }

  // 3. Firestore in Cloud for real-time mobile and desktop sync
  try {
    await saveFirebaseFinancialData(data);
  } catch (e) {
    console.warn('Firestore cloud save error:', e);
  }

  // 4. Local Express server if available
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {}

  return true;
}

export async function fetchAiInsights(
  expenses: Expense[],
  subCategories: SubCategory[],
  period: string
): Promise<any> {
  try {
    const res = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses, subCategories, period }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('fetchAiInsights error:', err);
  }
  return {
    score: 88,
    insights: [
      {
        type: 'summary',
        title: 'Balanço Geral',
        description: 'Análise operacional consolidada.'
      }
    ]
  };
}

