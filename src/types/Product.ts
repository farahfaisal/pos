export interface Product {
  id: string;
  name: string;
  barcode?: string;
  price: number;
  stockQuantity: number;
  categoryId: string;
  imageUrl?: string;
  description?: string;
  costPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem extends Product {
  quantity: number;
}