-- Update existing products to have proper category_id based on category name
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(TRIM(p.category)) = LOWER(TRIM(c.name))
AND p.category_id IS NULL
AND p.category IS NOT NULL;