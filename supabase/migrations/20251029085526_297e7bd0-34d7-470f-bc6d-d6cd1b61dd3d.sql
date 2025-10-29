-- Drop and recreate the accept_order function with fixed column names
DROP FUNCTION IF EXISTS accept_order(uuid);

CREATE FUNCTION accept_order(order_id_to_accept uuid)
RETURNS TABLE (
  order_id uuid,
  order_status order_status,
  partner_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_role user_role;
  current_user_store_id uuid;
  order_store_id uuid;
  order_current_status order_status;
  order_current_partner uuid;
BEGIN
  -- 1. Get the partner's info
  SELECT role, store_id INTO current_user_role, current_user_store_id
  FROM public.profiles
  WHERE id = current_user_id;

  -- 2. Check if the user is a partner
  IF current_user_role != 'partner' THEN
    RAISE EXCEPTION 'Only partners can accept orders. Your role is: %', current_user_role;
  END IF;

  -- 3. Get order details for debugging
  SELECT store_id, status, delivery_partner_id 
  INTO order_store_id, order_current_status, order_current_partner
  FROM public.orders
  WHERE id = order_id_to_accept;

  -- Check specific conditions
  IF order_current_status != 'ready_for_pickup' THEN
    RAISE EXCEPTION 'Order status is % (must be ready_for_pickup)', order_current_status;
  END IF;

  IF order_current_partner IS NOT NULL THEN
    RAISE EXCEPTION 'Order already assigned to partner %', order_current_partner;
  END IF;

  IF order_store_id != current_user_store_id THEN
    RAISE EXCEPTION 'Order is from store % but you are assigned to store %', 
      order_store_id, current_user_store_id;
  END IF;

  -- 4. Atomically update the order
  UPDATE public.orders
  SET 
    delivery_partner_id = current_user_id,
    status = 'in_transit'
  WHERE 
    id = order_id_to_accept AND
    status = 'ready_for_pickup' AND
    delivery_partner_id IS NULL AND
    store_id = current_user_store_id;

  -- 5. If the update fails, raise an exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not available (update failed)';
  END IF;

  -- 6. Return the updated order details with renamed columns
  RETURN QUERY
  SELECT o.id, o.status, o.delivery_partner_id
  FROM public.orders o
  WHERE o.id = order_id_to_accept;

END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION accept_order(uuid) TO authenticated;