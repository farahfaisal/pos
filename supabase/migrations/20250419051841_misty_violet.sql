/*
  # Add product image support

  1. Changes
    - Add image_url column to products table
    - Add storage policies for product images

  2. Security
    - Allow public read access to product images
    - Allow authenticated users to upload, update, and delete their own images
*/

-- Add image_url column to products table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products ADD COLUMN image_url text;
  END IF;
END $$;

-- Allow public access to product images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'products');
  END IF;
END $$;

-- Allow authenticated users to upload images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'products');
  END IF;
END $$;

-- Allow users to update their own images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can update their own images'
  ) THEN
    CREATE POLICY "Users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'products' AND owner = auth.uid());
  END IF;
END $$;

-- Allow users to delete their own images
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can delete their own images'
  ) THEN
    CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'products' AND owner = auth.uid());
  END IF;
END $$;