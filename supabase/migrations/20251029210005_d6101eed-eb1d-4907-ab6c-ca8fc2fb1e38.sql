-- Add customer contact info to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_name text,
ADD COLUMN customer_phone text;

-- Create saved_addresses table
CREATE TABLE public.saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on saved_addresses
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_addresses
CREATE POLICY "Users can view their own addresses"
  ON public.saved_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON public.saved_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.saved_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.saved_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_addresses_updated_at
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment_method column to orders
ALTER TABLE public.orders 
ADD COLUMN payment_method text DEFAULT 'cash_on_delivery';

-- Add discount_amount column to orders
ALTER TABLE public.orders 
ADD COLUMN discount_amount numeric DEFAULT 0;