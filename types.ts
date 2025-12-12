export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  event: string;
  amount: number;
  type: TransactionType;
  category: string;
  remark: string;
}

export interface BudgetSettings {
  year: number;
  month: number;
  monthlyLimit: number;
  enabled: boolean;
}

export const isValidYear = (year: number): boolean => {
  return Number.isInteger(year) && year >= 1000 && year <= 9999;
};

export interface ChartDataPoint {
  name: string;
  value: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LEDGER = 'LEDGER',
  SETTINGS = 'SETTINGS',
  AI_INSIGHTS = 'AI_INSIGHTS',
  TODO_LIST = 'TODO_LIST'
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: string;
  createdAt: string;
}
