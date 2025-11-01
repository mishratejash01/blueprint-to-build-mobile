-- Migration to update all existing 'delivery_partner' roles to the correct 'partner' role.

-- 1. Update the 'profiles' table
UPDATE public.profiles
SET role = 'partner'
WHERE role = 'delivery_partner';

-- 2. Update the 'handle_new_user' function just in case it was missed in other migrations.
-- This ensures any new auth.users entries also get the correct 'partner' role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_from_meta user_role;
BEGIN
  -- Check the raw_user_meta_data for a role
  user_role_from_meta := (NEW.raw_user_meta_data->>'role')::user_role;

  -- Fix the role if it's the old 'delivery_partner' value
  IF user_role_from_meta = 'delivery_partner' THEN
    user_role_from_meta := 'partner';
  END IF;

  -- Insert the new profile
  INSERT INTO public.profiles (id, role, email, phone, full_name)
  VALUES (
    NEW.id,
    COALESCE(user_role_from_meta, 'customer'),
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;
