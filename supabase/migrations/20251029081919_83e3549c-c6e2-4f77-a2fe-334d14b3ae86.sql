-- Create RPC function for atomic order acceptance
-- This prevents race conditions when multiple partners try to accept the same order
CREATE OR REPLACE FUNCTION accept_order(order_id_to_accept bigint)
RETURNS TABLE (
  id bigint,
  status order_status,
  partner_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_role user_role;
  current_user_store_id bigint;
BEGIN
  -- 1. Get the partner's info
  SELECT role, store_id INTO current_user_role, current_user_store_id
  FROM public.profiles
  WHERE id = current_user_id;

  -- 2. Check if the user is a partner
  IF current_user_role != 'partner' THEN
    RAISE EXCEPTION 'Only partners can accept orders.';
  END IF;

  -- 3. Atomically update the order
  --    This is the magic: it finds the order, checks if it's
  --    still available, and assigns it to the partner
  --    in one single, unbreakable step.
  UPDATE public.orders
  SET 
    partner_id = current_user_id,
    status = 'in_transit'
  WHERE 
    id = order_id_to_accept AND
    status = 'ready_for_pickup' AND
    partner_id IS NULL AND
    store_id = current_user_store_id;

  -- 4. If the update fails (e.g., another partner
  --    grabbed it first), the 'FOUND' check will fail.
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not available or already taken.';
  END IF;

  -- 5. Return the updated order details
  RETURN QUERY
  SELECT o.id, o.status, o.partner_id
  FROM public.orders o
  WHERE o.id = order_id_to_accept;

END;
$$;