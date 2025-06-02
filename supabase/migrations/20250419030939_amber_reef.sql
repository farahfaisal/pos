/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `type` (text)
      - `discount_type` (text)
      - `discount_value` (numeric)
      - `total_purchases` (numeric)
      - `last_visit` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `barcode` (text)
      - `price` (numeric)
      - `cost_price` (numeric)
      - `stock_quantity` (integer)
      - `category` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `receipt_number` (text)
      - `customer_id` (uuid, references customers)
      - `cashier_id` (uuid, references users)
      - `total` (numeric)
      - `discount` (numeric)
      - `payment_method` (text)
      - `created_at` (timestamptz)
    
    - `transaction_items`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, references transactions)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamptz)
    
    - `customer_accounts`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references customers)
      - `balance` (numeric)
      - `credit_limit` (numeric)
      - `last_transaction_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `account_transactions`
      - `id` (uuid, primary key)
      - `account_id` (uuid, references customer_accounts)
      - `amount` (numeric)
      - `type` (text)
      - `reference` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cashier', 'inventory')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  type text NOT NULL CHECK (type IN ('retail', 'wholesale')),
  discount_type text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric,
  total_purchases numeric DEFAULT 0,
  last_visit timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  barcode text UNIQUE,
  price numeric NOT NULL CHECK (price >= 0),
  cost_price numeric CHECK (cost_price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES customers(id),
  cashier_id uuid REFERENCES users(id) NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  discount numeric DEFAULT 0,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')),
  created_at timestamptz DEFAULT now()
);

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) NOT NULL UNIQUE,
  balance numeric DEFAULT 0,
  credit_limit numeric NOT NULL DEFAULT 0,
  last_transaction_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_transactions table
CREATE TABLE IF NOT EXISTS account_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES customer_accounts(id) NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('sale', 'payment', 'refund', 'adjustment')),
  reference text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "All authenticated users can view customers" ON customers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage customers" ON customers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "All authenticated users can view products" ON products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and inventory users can manage products" ON products
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'inventory')
  ));

CREATE POLICY "All authenticated users can view transactions" ON transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage transactions" ON transactions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "All authenticated users can view transaction items" ON transaction_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage transaction items" ON transaction_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "All authenticated users can view customer accounts" ON customer_accounts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage customer accounts" ON customer_accounts
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "All authenticated users can view account transactions" ON account_transactions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins and cashiers can manage account transactions" ON account_transactions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_customer_id ON customer_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_account_transactions_account_id ON account_transactions(account_id);