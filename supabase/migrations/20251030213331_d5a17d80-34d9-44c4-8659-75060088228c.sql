-- Add awaiting_pickup_verification to order_status enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'awaiting_pickup_verification' 
    AND enumtypid = 'order_status'::regtype
  ) THEN
    ALTER TYPE order_status ADD VALUE 'awaiting_pickup_verification' AFTER 'ready_for_pickup';
  END IF;
END $$;

-- Drop and recreate the accept_order function with fixes
DROP FUNCTION IF EXISTS public.accept_order(uuid);

CREATE OR REPLACE FUNCTION public.accept_order(order_id_to_accept uuid)
RETURNS TABLE(order_id uuid, order_status order_status, partner_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_role user_role;
  order_store_id uuid;
  order_current_status order_status;
  order_current_partner uuid;
BEGIN
  -- 1. Get the partner's role
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = current_user_id;

  -- 2. Check if the user is a partner
  IF current_user_role != 'partner' THEN
    RAISE EXCEPTION 'Only partners can accept orders. Your role is: %', current_user_role;
  END IF;

  -- 3. Get order details for validation
  SELECT store_id, status, delivery_partner_id 
  INTO order_store_id, order_current_status, order_current_partner
  FROM public.orders
  WHERE id = order_id_to_accept;

  -- Check if order exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Check specific conditions
  IF order_current_status != 'ready_for_pickup' THEN
    RAISE EXCEPTION 'Order status is % (must be ready_for_pickup)', order_current_status;
  END IF;

  IF order_current_partner IS NOT NULL THEN
    RAISE EXCEPTION 'Order already assigned to partner %', order_current_partner;
  END IF;

  -- NOTE: Removed store_id matching check - partners can accept orders from any store

  -- 4. Atomically update the order to awaiting_pickup_verification status
  UPDATE public.orders
  SET 
    delivery_partner_id = current_user_id,
    status = 'awaiting_pickup_verification'
  WHERE 
    id = order_id_to_accept AND
    status = 'ready_for_pickup' AND
    delivery_partner_id IS NULL;

  -- 5. If the update fails, raise an exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not available (update failed)';
  END IF;

  -- 6. Return the updated order details
  RETURN QUERY
  SELECT o.id, o.status, o.delivery_partner_id
  FROM public.orders o
  WHERE o.id = order_id_to_accept;

END;
$function$;