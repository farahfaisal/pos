export interface Transaction {
  id: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  discount?: number;
  tax?: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  customerName?: string;
  createdAt: Date;
  receiptNumber: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
}