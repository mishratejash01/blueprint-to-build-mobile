-- Fix the security warning by setting search_path
CREATE OR REPLACE FUNCTION auto_set_order_ready()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a new order is created with 'pending' status, change it to 'ready_for_pickup'
  IF NEW.status = 'pending' THEN
    NEW.status := 'ready_for_pickup';
  END IF;
  RETURN NEW;
END;
$$;