/*
  # Update Categories RLS Policies

  1. Security Changes
    - Enable RLS on categories table if not already enabled
    - Drop existing policies to avoid conflicts
    - Recreate policies for:
      - Admins and inventory users can manage categories
      - All authenticated users can view categories

  2. Notes
    - Ensures proper access control for category management
    - Maintains data security while allowing necessary operations
    - Handles existing policy cleanup
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'categories'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins and inventory users can manage categories" ON categories;
DROP POLICY IF EXISTS "All authenticated users can view categories" ON categories;

-- Recreate policies
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