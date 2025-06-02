export type CustomerType = 'retail' | 'wholesale';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  type: CustomerType;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  totalPurchases: number;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}