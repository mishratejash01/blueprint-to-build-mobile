-- Fix orders stuck in in_transit status (cleanup orphaned orders)
UPDATE orders
SET status = 'delivered',
    updated_at = now()
WHERE status = 'in_transit'
  AND updated_at < now() - interval '2 hours'
  AND delivery_partner_id IS NOT NULL;

-- Add index to speed up partner order queries
CREATE INDEX IF NOT EXISTS idx_orders_partner_status 
ON orders(delivery_partner_id, status, created_at DESC) 
WHERE delivery_partner_id IS NOT NULL;

-- Add index for store order queries
CREATE INDEX IF NOT EXISTS idx_orders_store_status 
ON orders(store_id, status, created_at DESC);