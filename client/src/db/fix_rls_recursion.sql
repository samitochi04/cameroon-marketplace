-- Drop problematic policies that may be causing recursion
DO $$
BEGIN
  -- Drop policies that might reference profile table in their USING clause
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can manage all profiles'
  ) THEN
    DROP POLICY "Admins can manage all profiles" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    DROP POLICY "Users can view their own profile" ON public.profiles;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    DROP POLICY "Users can update their own profile" ON public.profiles;
  END IF;
END
$$;

-- Temporarily disable RLS on profiles table to allow initial app loading
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Create new, non-recursive policies
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Create a function to determine admin status safely
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- First check if user is authenticated at all
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Direct query without using RLS (prevents recursion)
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a safer admin policy
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
USING (
  is_admin() -- Uses our custom function that avoids recursion
);

-- Re-enable RLS with our new policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
