-- Create a trigger to automatically set orders to ready_for_pickup
-- This ensures partners see orders immediately, even if the frontend has a bug
CREATE OR REPLACE FUNCTION auto_set_order_ready()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new order is created with 'pending' status, change it to 'ready_for_pickup'
  IF NEW.status = 'pending' THEN
    NEW.status := 'ready_for_pickup';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_ready_on_insert
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_order_ready();