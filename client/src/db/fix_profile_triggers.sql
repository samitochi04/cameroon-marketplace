-- First, check if profiles table exists and create it if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Index for faster lookups
    CREATE INDEX idx_profiles_email ON public.profiles(email);
  ELSE
    RAISE NOTICE 'profiles table already exists';
  END IF;
END
$$;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;

-- Create new, simple policies to allow registration
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Fix or create the trigger function for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Match field names with what we're passing in auth.signUp
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists and is correctly defined
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to check and fix missing profiles
CREATE OR REPLACE FUNCTION fix_missing_profiles()
RETURNS TABLE (fixed_count INT, error_count INT) AS $$
DECLARE
  user_rec RECORD;
  fixed INT := 0;
  errors INT := 0;
BEGIN
  -- Find auth users without profiles
  FOR user_rec IN 
    SELECT au.id, au.email, au.raw_user_meta_data 
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      -- Try to create missing profile
      INSERT INTO public.profiles (id, email, name, role)
      VALUES (
        user_rec.id,
        user_rec.email,
        user_rec.raw_user_meta_data->>'name',
        COALESCE(user_rec.raw_user_meta_data->>'role', 'customer')
      );
      fixed := fixed + 1;
    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT fixed, errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix function to repair any existing mismatches
SELECT * FROM fix_missing_profiles();
