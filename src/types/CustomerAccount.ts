import { Customer } from './Customer';

export interface CustomerAccount {
  id: string;
  customerId: string;
  balance: number; // Positive for credit, negative for debit
  creditLimit: number;
  lastTransactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  amount: number; // Positive for credit, negative for debit
  type: 'sale' | 'payment' | 'refund' | 'adjustment';
  reference: string; // Invoice number, payment reference, etc.
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface AccountStatement {
  account: CustomerAccount;
  customer: Customer;
  transactions: AccountTransaction[];
  startDate: Date;
  endDate: Date;
  openingBalance: number;
  closingBalance: number;
}