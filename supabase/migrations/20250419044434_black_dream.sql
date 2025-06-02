/*
  # Fix Categories RLS Policies

  1. Security Changes
    - Drop existing policies
    - Recreate policies with proper permissions
    - Ensure RLS is enabled

  2. Notes
    - Fixes policy conflicts
    - Maintains proper access control
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