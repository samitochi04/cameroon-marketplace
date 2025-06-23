-- Create an admin function to create/repair profiles
CREATE OR REPLACE FUNCTION admin_create_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile if it doesn't exist
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (user_id, user_email, user_name, COALESCE(user_role, 'customer'))
  ON CONFLICT (id) DO NOTHING;
  
  -- If role is vendor, create vendor record too
  IF user_role = 'vendor' THEN
    INSERT INTO public.vendors (id, store_name, description, status)
    VALUES (
      user_id,
      'Store ' || COALESCE(user_name, 'New Vendor'),
      'New vendor store',
      'pending'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
