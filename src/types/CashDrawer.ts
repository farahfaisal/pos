import { PaymentMethod } from './Transaction';

export interface CashDrawerSession {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  openedAt: Date;
  closedAt?: Date;
  openedBy: string;
  closedBy?: string;
  notes?: string;
  status: 'open' | 'closed';
}

export interface CashDrawerTransaction {
  id: string;
  sessionId: string;
  amount: number;
  type: 'sale' | 'refund' | 'expense' | 'deposit';
  paymentMethod: PaymentMethod;
  createdAt: Date;
  createdBy: string;
  notes?: string;
}

export interface DailyReport {
  date: Date;
  openingBalance: number;
  closingBalance: number;
  sales: {
    cash: number;
    card: number;
    mobile: number;
  };
  transactions: CashDrawerTransaction[];
  totalTransactions: number;
  difference: number;
}