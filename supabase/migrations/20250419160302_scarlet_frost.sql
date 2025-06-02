-- Recreate products bucket with proper settings
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;

-- Create new storage policies
-- Allow public access for viewing images
CREATE POLICY "Public Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Ensure RLS is enabled but with public access
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);