-- Add RLS policy for partners to view available orders
-- This allows ANY authenticated partner to see orders that are ready for pickup
CREATE POLICY "Partners can view available orders for their store"
ON public.orders
FOR SELECT
TO authenticated
USING (
  status = 'ready_for_pickup' 
  AND delivery_partner_id IS NULL
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'partner'
    AND profiles.store_id = orders.store_id
  )
);