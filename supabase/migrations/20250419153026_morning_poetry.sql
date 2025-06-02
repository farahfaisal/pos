/*
  # Update storage policies for public access
  
  1. Changes
    - Allow public access to upload and manage product images
    - Remove authentication requirements
    - Maintain existing bucket settings
  
  2. Notes
    - Enables unrestricted access to product image management
    - Removes role-based restrictions
*/

-- Recreate products bucket with proper settings
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage product images" ON storage.objects;

-- Create new storage policies that allow public access
CREATE POLICY "Public Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');