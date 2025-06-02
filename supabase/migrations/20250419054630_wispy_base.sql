/*
  # Add storage policies for products bucket

  1. Changes
    - Create products storage bucket if it doesn't exist
    - Enable RLS on products bucket
    - Add policies for:
      - Admins and inventory users can manage all product images
      - All authenticated users can view product images
*/

-- Create products bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for admins and inventory users to manage product images
CREATE POLICY "Admins and inventory users can manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role IN ('admin', 'inventory')
  )
)
WITH CHECK (
  bucket_id = 'products' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role IN ('admin', 'inventory')
  )
);

-- Policy for viewing product images
CREATE POLICY "All authenticated users can view product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'products');