-- Function to fix infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_value TEXT;
BEGIN
  -- Direct query without RLS checking
  SELECT role INTO role_value
  FROM profiles
  WHERE id = user_id;
  
  RETURN COALESCE(role_value, 'customer');
END;
$$;

-- Function to safely create a profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
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
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (user_id, user_email, user_name, COALESCE(user_role, 'customer'))
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Function to get service role key for admin operations from client
CREATE OR REPLACE FUNCTION public.get_service_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
  -- This function will only return a value if called by an admin
  IF (SELECT get_user_role(auth.uid()) = 'admin') THEN
    RETURN 'service_role_access_granted';
  ELSE
    RETURN NULL;
  END IF;
END;
$$;
