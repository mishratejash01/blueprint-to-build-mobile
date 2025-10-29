-- Update the accept_order function to use UUID instead of bigint
DROP FUNCTION IF EXISTS accept_order(bigint);

CREATE OR REPLACE FUNCTION accept_order(order_id_to_accept uuid)
RETURNS TABLE (
  id uuid,
  status order_status,
  delivery_partner_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_role user_role;
  current_user_store_id uuid;
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
  UPDATE public.orders
  SET 
    delivery_partner_id = current_user_id,
    status = 'in_transit'
  WHERE 
    id = order_id_to_accept AND
    status = 'ready_for_pickup' AND
    delivery_partner_id IS NULL AND
    store_id = current_user_store_id;

  -- 4. If the update fails, raise an exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not available or already taken.';
  END IF;

  -- 5. Return the updated order details
  RETURN QUERY
  SELECT o.id, o.status, o.delivery_partner_id
  FROM public.orders o
  WHERE o.id = order_id_to_accept;

END;
$$;