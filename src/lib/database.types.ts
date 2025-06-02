export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'cashier' | 'inventory'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'cashier' | 'inventory'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'cashier' | 'inventory'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          type: 'retail' | 'wholesale'
          discount_type: 'percentage' | 'fixed' | null
          discount_value: number | null
          total_purchases: number
          last_visit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          type: 'retail' | 'wholesale'
          discount_type?: 'percentage' | 'fixed' | null
          discount_value?: number | null
          total_purchases?: number
          last_visit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          type?: 'retail' | 'wholesale'
          discount_type?: 'percentage' | 'fixed' | null
          discount_value?: number | null
          total_purchases?: number
          last_visit?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          barcode: string | null
          price: number
          cost_price: number | null
          stock_quantity: number
          category: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          barcode?: string | null
          price: number
          cost_price?: number | null
          stock_quantity?: number
          category: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          barcode?: string | null
          price?: number
          cost_price?: number | null
          stock_quantity?: number
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          receipt_number: string
          customer_id: string | null
          cashier_id: string
          total: number
          discount: number | null
          payment_method: 'cash' | 'card' | 'mobile'
          created_at: string
        }
        Insert: {
          id?: string
          receipt_number: string
          customer_id?: string | null
          cashier_id: string
          total: number
          discount?: number | null
          payment_method: 'cash' | 'card' | 'mobile'
          created_at?: string
        }
        Update: {
          id?: string
          receipt_number?: string
          customer_id?: string | null
          cashier_id?: string
          total?: number
          discount?: number | null
          payment_method?: 'cash' | 'card' | 'mobile'
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      customer_accounts: {
        Row: {
          id: string
          customer_id: string
          balance: number
          credit_limit: number
          last_transaction_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          balance?: number
          credit_limit?: number
          last_transaction_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          balance?: number
          credit_limit?: number
          last_transaction_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      account_transactions: {
        Row: {
          id: string
          account_id: string
          amount: number
          type: 'sale' | 'payment' | 'refund' | 'adjustment'
          reference: string
          description: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          account_id: string
          amount: number
          type: 'sale' | 'payment' | 'refund' | 'adjustment'
          reference: string
          description?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          account_id?: string
          amount?: number
          type?: 'sale' | 'payment' | 'refund' | 'adjustment'
          reference?: string
          description?: string | null
          created_at?: string
          created_by?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          type: 'sales' | 'products' | 'payment'
          period: 'daily' | 'weekly' | 'monthly' | 'custom'
          start_date: string
          end_date: string
          data: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'sales' | 'products' | 'payment'
          period: 'daily' | 'weekly' | 'monthly' | 'custom'
          start_date: string
          end_date: string
          data: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'sales' | 'products' | 'payment'
          period?: 'daily' | 'weekly' | 'monthly' | 'custom'
          start_date?: string
          end_date?: string
          data?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}