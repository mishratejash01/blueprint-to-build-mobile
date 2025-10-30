-- Phase 1: Update stores table with authorization and availability
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS authorized_users UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS total_sales NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_stores_authorized_users 
ON public.stores USING GIN (authorized_users);

-- Phase 2: Create store pickup OTP table
CREATE TABLE public.store_pickup_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  
  UNIQUE(order_id)
);

ALTER TABLE public.store_pickup_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store managers can view OTPs for their orders"
  ON public.store_pickup_otps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = store_pickup_otps.store_id 
      AND auth.uid() = ANY(stores.authorized_users)
    )
  );

CREATE POLICY "Delivery partners can verify OTPs"
  ON public.store_pickup_otps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = store_pickup_otps.order_id 
      AND orders.delivery_partner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert OTPs"
  ON public.store_pickup_otps FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_pickup_otp_order ON public.store_pickup_otps(order_id);
CREATE INDEX idx_pickup_otp_expires ON public.store_pickup_otps(expires_at);

-- Phase 3: Update orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS pickup_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_verified_at TIMESTAMPTZ;

-- Phase 4: Create store user roles for authorization
CREATE TYPE store_permission AS ENUM ('manager', 'staff', 'owner');

CREATE TABLE public.store_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  permission store_permission NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, store_id)
);

ALTER TABLE public.store_user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own store roles"
  ON public.store_user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function for checking store access
CREATE OR REPLACE FUNCTION public.has_store_access(_user_id uuid, _store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_user_roles
    WHERE user_id = _user_id
      AND store_id = _store_id
  ) OR EXISTS (
    SELECT 1
    FROM public.stores
    WHERE id = _store_id
      AND _user_id = ANY(authorized_users)
  )
$$;

-- Phase 5: Update RLS policies for orders with store authorization
CREATE POLICY "Store staff can view their store orders"
  ON public.orders FOR SELECT
  USING (
    public.has_store_access(auth.uid(), store_id)
  );

CREATE POLICY "Store staff can update their store orders"
  ON public.orders FOR UPDATE
  USING (
    public.has_store_access(auth.uid(), store_id)
  );

-- Phase 6: Update products RLS policies
DROP POLICY IF EXISTS "Store managers can manage their products" ON public.products;

CREATE POLICY "Store staff can manage their products"
  ON public.products FOR ALL
  USING (
    public.has_store_access(auth.uid(), store_id)
  );

-- Phase 7: Trigger to update products when store availability changes
CREATE OR REPLACE FUNCTION update_products_on_store_toggle()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET is_available = NEW.is_available
  WHERE store_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_availability_trigger
AFTER UPDATE OF is_available ON public.stores
FOR EACH ROW
WHEN (OLD.is_available IS DISTINCT FROM NEW.is_available)
EXECUTE FUNCTION update_products_on_store_toggle();

-- Phase 8: Trigger to update total sales when order is delivered
CREATE OR REPLACE FUNCTION update_store_total_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    UPDATE public.stores
    SET total_sales = COALESCE(total_sales, 0) + NEW.total
    WHERE id = NEW.store_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_trigger
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_store_total_sales();

-- Phase 9: Enable realtime for pickup OTPs
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_pickup_otps;