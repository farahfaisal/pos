/*
  # Fix Categories Integration

  1. Changes
    - Drop existing policies
    - Recreate RLS policies with proper checks
    - Add foreign key constraint for products
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Set proper access policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and inventory users can manage categories" ON categories;
DROP POLICY IF EXISTS "All authenticated users can view categories" ON categories;

-- Ensure RLS is enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Admins and inventory users can manage categories"
ON categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'inventory')
  )
);

CREATE POLICY "All authenticated users can view categories"
ON categories
FOR SELECT
TO authenticated
USING (true);

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id);
  END IF;
END $$;