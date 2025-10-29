-- Create categories table with hierarchical structure
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create index on parent_id for better query performance
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- Create index on sort_order for ordering
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample top-level categories
INSERT INTO public.categories (name, parent_id, sort_order) VALUES
  ('Vegetables & Fruits', NULL, 1),
  ('Dairy & Breakfast', NULL, 2),
  ('Munchies', NULL, 3),
  ('Cold Drinks & Juices', NULL, 4),
  ('Instant & Frozen Food', NULL, 5),
  ('Tea, Coffee & Health Drinks', NULL, 6),
  ('Bakery & Biscuits', NULL, 7),
  ('Sweet Tooth', NULL, 8),
  ('Atta, Rice & Dal', NULL, 9),
  ('Masala, Oil & More', NULL, 10),
  ('Sauces & Spreads', NULL, 11),
  ('Chicken, Meat & Fish', NULL, 12);

-- Insert sample subcategories for Vegetables & Fruits
INSERT INTO public.categories (name, parent_id, sort_order)
SELECT 'Fresh Vegetables', id, 1 FROM public.categories WHERE name = 'Vegetables & Fruits'
UNION ALL
SELECT 'Fresh Fruits', id, 2 FROM public.categories WHERE name = 'Vegetables & Fruits'
UNION ALL
SELECT 'Exotic Fruits & Veggies', id, 3 FROM public.categories WHERE name = 'Vegetables & Fruits'
UNION ALL
SELECT 'Herbs & Seasonings', id, 4 FROM public.categories WHERE name = 'Vegetables & Fruits';

-- Insert sample subcategories for Dairy & Breakfast
INSERT INTO public.categories (name, parent_id, sort_order)
SELECT 'Milk', id, 1 FROM public.categories WHERE name = 'Dairy & Breakfast'
UNION ALL
SELECT 'Bread & Pav', id, 2 FROM public.categories WHERE name = 'Dairy & Breakfast'
UNION ALL
SELECT 'Eggs', id, 3 FROM public.categories WHERE name = 'Dairy & Breakfast'
UNION ALL
SELECT 'Paneer & Tofu', id, 4 FROM public.categories WHERE name = 'Dairy & Breakfast'
UNION ALL
SELECT 'Butter & Cream', id, 5 FROM public.categories WHERE name = 'Dairy & Breakfast';

-- Update products table to use category_id instead of category name
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);