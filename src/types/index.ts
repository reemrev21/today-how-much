export type TransactionType = 'income' | 'expense';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface Ledger {
  id: string;
  name: string;
  created_at: number;
}

export interface Transaction {
  id: string;
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  date: string; // "YYYY-MM-DD"
  created_at: number;
}

export interface RecurringRule {
  id: string;
  ledger_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment_method: string;
  memo: string | null;
  day_of_month: number;
  is_active: boolean;
  sort_order: number;
}

export interface DaySummary {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category: string;
  total: number;
}

export interface PaymentMethodSummary {
  payment_method: string;
  total: number;
}

export interface MonthlyTrend {
  month: string; // "YYYY-MM"
  income: number;
  expense: number;
}

export interface TransactionFilter {
  category?: string;
  payment_method?: string;
  type?: TransactionType;
  search?: string;
}
