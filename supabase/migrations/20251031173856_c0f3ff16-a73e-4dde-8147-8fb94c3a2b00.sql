-- Comprehensive category mapping for ALL existing categories

-- Update 'Paneer & Tofu' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Paneer & Tofu' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'paneer & tofu' AND category_id IS NULL;

-- Update 'Tea, Coffee & Health Drinks' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Tea, Coffee & Health Drinks' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'tea, coffee & health drinks' AND category_id IS NULL;

-- Update 'Instant & Frozen Food' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Instant & Frozen Food' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'instant & frozen food' AND category_id IS NULL;

-- Update 'Atta, Rice & Dal' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Atta, Rice & Dal' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'atta, rice & dal' AND category_id IS NULL;

-- Update 'Masala, Oil & More' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Masala, Oil & More' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'masala, oil & more' AND category_id IS NULL;

-- Update 'Sauces & Spreads' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Sauces & Spreads' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'sauces & spreads' AND category_id IS NULL;

-- Update 'Fresh Fruits' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Fresh Fruits' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'fresh fruits' AND category_id IS NULL;

-- Update 'Fresh Vegetables' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Fresh Vegetables' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'fresh vegetables' AND category_id IS NULL;

-- Update 'Milk' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Milk' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'milk' AND category_id IS NULL;

-- Update 'Butter & Cream' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Butter & Cream' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'butter & cream' AND category_id IS NULL;

-- Update 'Bread & Pav' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Bread & Pav' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'bread & pav' AND category_id IS NULL;

-- Update 'Sweet Tooth' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Sweet Tooth' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'sweet tooth' AND category_id IS NULL;

-- Update 'Herbs & Seasonings' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Herbs & Seasonings' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'herbs & seasonings' AND category_id IS NULL;

-- Update 'Exotic Fruits & Veggies' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Exotic Fruits & Veggies' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'exotic fruits & veggies' AND category_id IS NULL;

-- Update 'Vegetables & Fruits' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Vegetables & Fruits' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'vegetables & fruits' AND category_id IS NULL;

-- Update 'Dairy & Breakfast' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Dairy & Breakfast' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'dairy & breakfast' AND category_id IS NULL;

-- Update 'Munchies' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Munchies' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'munchies' AND category_id IS NULL;

-- Update 'Cold Drinks & Juices' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Cold Drinks & Juices' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'cold drinks & juices' AND category_id IS NULL;

-- Update 'Chicken, Meat & Fish' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Chicken, Meat & Fish' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'chicken, meat & fish' AND category_id IS NULL;

-- Update 'Bakery & Biscuits' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Bakery & Biscuits' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'bakery & biscuits' AND category_id IS NULL;

-- Update 'Eggs' products
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Eggs' LIMIT 1)
WHERE LOWER(TRIM(category)) = 'eggs' AND category_id IS NULL;

-- Final fallback: exact match for any remaining products
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
AND p.category_id IS NULL
AND p.category IS NOT NULL;