export interface Expense {
  id: string;
  description: string;
  category: string;
  subCategory?: string;
  amount: number;
  value?: number;
  date: string;
  expenseDate?: string;
  paymentMethod: string;
  status: 'pago' | 'pendente' | 'agendado';
  user: string;
  createdBy?: string;
  setor?: string;
  notes?: string;
  observation?: string;
  recurrent?: boolean;
  createdAt?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  category?: string;
  color?: string;
  budgetLimit?: number;
}

export interface AppUser {
  id: string;
  name: string;
  username?: string;
  pass?: string;
  email?: string;
  setor?: string;
  role: 'admin' | 'operador';
  active: boolean;
}

export interface CompanySettings {
  companyName: string;
  cnpj?: string;
  currency?: string;
  logoUrl?: string;
  currentUser?: string;
  currentSetor?: string;
}

export interface Sale {
  id: string;
  description: string; // ex: "Venda Atacado Frutas", "Supermercado Mateus"
  client?: string;
  city: string; // Vendas por cidade (ex: "Bahia", "Goiânia", "Imperatriz", "Carolina", "Balsas", "São Luís")
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: string; // "Dinheiro" | "PIX" | "Cartão" | "Cheque"
  status: 'recebido' | 'a_receber';
  user?: string;
  notes?: string;
  createdAt?: string;
}

export interface FinancialData {
  expenses: Expense[];
  subCategories: SubCategory[];
  appUsers: AppUser[];
  sales?: Sale[];
  cities?: string[];
  settings?: CompanySettings;
}

export interface AiInsight {
  type: 'summary' | 'tip' | 'alert' | 'forecast';
  title: string;
  description: string;
}

export interface AiReportResponse {
  score?: number;
  insights: AiInsight[];
  status?: string;
}
