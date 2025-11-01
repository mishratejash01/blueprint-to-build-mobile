-- Migration to fix all partner roles, including those mis-assigned as 'customer'.
-- This script finds anyone with a delivery_partner entry and ensures their profile role is 'partner'.

UPDATE public.profiles p
SET 
  role = 'partner'
FROM 
  public.delivery_partners dp
WHERE 
  p.id = dp.id
  AND p.role != 'partner';
