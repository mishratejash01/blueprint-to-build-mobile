-- Drop the restrictive RLS policy that requires store_id match
DROP POLICY IF EXISTS "Partners can view available orders for their store" ON public.orders;

-- Create new policy: ANY authenticated partner can view ALL available orders
CREATE POLICY "Partners can view all available orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  -- Must be a partner
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'partner'
  )
  AND
  -- Order must be available (not assigned yet)
  status = 'ready_for_pickup'
  AND delivery_partner_id IS NULL
);