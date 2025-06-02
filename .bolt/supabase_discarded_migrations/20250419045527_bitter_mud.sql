/*
  # Fix Categories RLS Policies

  1. Security Changes
    - Drop existing policies
    - Enable RLS
    - Create policies for admin and inventory users
    - Allow read access for all authenticated users

  2. Notes
    - Ensures proper access control
    - Maintains data security
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins and inventory users can manage categories" ON categories;
DROP POLICY IF EXISTS "All authenticated users can view categories" ON categories;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for admins and inventory users to manage categories
CREATE POLICY "admins_inventory_manage_categories"
ON categories
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'inventory')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'inventory')
  )
);

-- Create policy for all authenticated users to view categories
CREATE POLICY "authenticated_view_categories"
ON categories
FOR SELECT
TO authenticated
USING (true);