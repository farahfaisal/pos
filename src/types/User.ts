export enum UserRole {
  ADMIN = 'admin',
  CASHIER = 'cashier',
  INVENTORY = 'inventory',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}