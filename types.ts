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

export interface ChartDataPoint {
  name: string;
  value: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LEDGER = 'LEDGER',
  SETTINGS = 'SETTINGS',
  AI_INSIGHTS = 'AI_INSIGHTS'
}
