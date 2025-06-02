/*
  # Add Categories Management
  
  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Changes
    - Add foreign key constraint to products table
    - Update existing products to use categories table
  
  3. Security
    - Enable RLS on categories table
    - Add policies for viewing and managing categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and inventory users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'inventory')
  ));

-- Add categories to products table
ALTER TABLE products
  DROP COLUMN category,
  ADD COLUMN category_id uuid REFERENCES categories(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);