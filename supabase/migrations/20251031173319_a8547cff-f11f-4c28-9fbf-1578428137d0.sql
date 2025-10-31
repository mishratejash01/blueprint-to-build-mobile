-- Map existing products to correct categories based on their current category field

-- Update 'fruits' products to 'Fresh Fruits' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Fresh Fruits' LIMIT 1)
WHERE LOWER(category) = 'fruits' AND category_id IS NULL;

-- Update 'vegetables' products to 'Fresh Vegetables' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Fresh Vegetables' LIMIT 1)
WHERE LOWER(category) = 'vegetables' AND category_id IS NULL;

-- Update 'dairy' products to 'Dairy & Breakfast' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Dairy & Breakfast' LIMIT 1)
WHERE LOWER(category) = 'dairy' AND category_id IS NULL;

-- Update 'eggs' products to 'Eggs' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Eggs' LIMIT 1)
WHERE LOWER(category) = 'eggs' AND category_id IS NULL;

-- Update 'snacks' products to 'Munchies' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Munchies' LIMIT 1)
WHERE LOWER(category) = 'snacks' AND category_id IS NULL;

-- Update 'beverages' products to 'Cold Drinks & Juices' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Cold Drinks & Juices' LIMIT 1)
WHERE LOWER(category) = 'beverages' AND category_id IS NULL;

-- Update 'meat' products to 'Chicken, Meat & Fish' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Chicken, Meat & Fish' LIMIT 1)
WHERE LOWER(category) = 'meat' AND category_id IS NULL;

-- Update 'bakery' products to 'Bakery & Biscuits' category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Bakery & Biscuits' LIMIT 1)
WHERE LOWER(category) = 'bakery' AND category_id IS NULL;

-- For any remaining products, try exact name match
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
AND p.category_id IS NULL
AND p.category IS NOT NULL;