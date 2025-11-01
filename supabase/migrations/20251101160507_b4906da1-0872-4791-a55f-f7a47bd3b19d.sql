-- Migration 1: Fix Product Categories Data Consistency
-- Update all products with NULL or empty category text to use their category_id name
UPDATE products p
SET category = c.name
FROM categories c
WHERE p.category_id = c.id
AND (p.category IS NULL OR p.category = '');

-- Migration 2: Partner Availability Column (Performance Optimization)
-- Add dedicated availability column for faster queries
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;

-- Migrate existing data from JSONB to dedicated column
UPDATE profiles
SET is_available = COALESCE((partner_data->>'is_available')::boolean, false)
WHERE role = 'partner' AND partner_data IS NOT NULL;

-- Create index for fast partner availability queries
CREATE INDEX IF NOT EXISTS idx_profiles_partner_available 
ON profiles(role, is_available) WHERE role = 'partner';

-- Migration 3: Fix Security - Set search_path for Database Functions
-- This prevents security vulnerabilities in functions
ALTER FUNCTION public.accept_order(uuid) SET search_path = 'public';
ALTER FUNCTION public.has_store_access(uuid, uuid) SET search_path = 'public';