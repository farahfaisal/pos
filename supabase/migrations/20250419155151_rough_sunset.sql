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
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'products' AND auth.role() IN ('authenticated', 'service_role'))
WITH CHECK (bucket_id = 'products' AND auth.role() IN ('authenticated', 'service_role'));

-- Add index on image_url column
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);