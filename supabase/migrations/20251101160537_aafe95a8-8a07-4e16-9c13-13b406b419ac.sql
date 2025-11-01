-- Fix remaining function security warnings by setting search_path
-- This ensures functions operate in the correct schema and prevents security issues

ALTER FUNCTION public.update_products_on_store_toggle() SET search_path = 'public';
ALTER FUNCTION public.update_store_total_sales() SET search_path = 'public';
ALTER FUNCTION public.auto_set_order_ready() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';