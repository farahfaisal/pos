export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'products' | 'payment';
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: Date;
  endDate: Date;
  data: {
    transactions?: {
      id: string;
      receiptNumber: string;
      total: number;
      paymentMethod: string;
      customerName?: string;
      createdAt: string;
    }[];
    products?: {
      id: string;
      name: string;
      quantity: number;
      total: number;
    }[];
    salesByMethod?: Record<string, number>;
    totalSales?: number;
    totalTransactions?: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}