-- Add description column to products table if not exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT;