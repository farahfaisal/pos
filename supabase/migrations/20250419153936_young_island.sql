/*
  # Add image_url column to products table

  1. Changes
    - Add image_url column to products table to store image URLs
    - Make it nullable since not all products will have images
    - Add comment explaining the column purpose

  2. Notes
    - Column is TEXT type to store full URLs
    - No constraints needed since URLs can vary in length
*/

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN image_url text;

    COMMENT ON COLUMN products.image_url IS 'URL of the product image stored in Supabase Storage';
  END IF;
END $$;