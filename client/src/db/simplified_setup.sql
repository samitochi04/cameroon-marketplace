-- ========== DISABLE ROW LEVEL SECURITY TEMPORARILY ==========
-- This makes development easier - re-enable for production
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;

-- ========== DROP EXISTING TRIGGERS ==========
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON public.profiles;

-- ========== FIX PROFILES TABLE ==========
-- Drop and recreate profiles table for a clean start
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========== FIX VENDORS TABLE ==========
-- Drop and recreate vendors table
DROP TABLE IF EXISTS public.vendors CASCADE;

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY,
  store_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT vendors_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========== CREATE SIMPLIFIED TRIGGER FUNCTION ==========
-- Create a simplified trigger function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  
  -- If user is vendor, also create vendor entry
  IF COALESCE(NEW.raw_user_meta_data->>'role', '') = 'vendor' THEN
    INSERT INTO public.vendors (id, store_name, description)
    VALUES (
      NEW.id,
      'Store ' || COALESCE(NEW.raw_user_meta_data->>'name', 'New Vendor'),
      'New vendor store'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RESET POLICIES ==========
-- Drop all potentially conflicting policies
DO $$ 
BEGIN
  -- Drop policies on profiles table
  DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
  
  -- Drop policies on vendors table
  DROP POLICY IF EXISTS "Vendors can view and update their own profile" ON public.vendors;
  DROP POLICY IF EXISTS "Admins can manage all vendor profiles" ON public.vendors;
  DROP POLICY IF EXISTS "Anyone can read approved vendors" ON public.vendors;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- ========== CREATE MINIMAL POLICIES ==========
-- Create extremely permissive policies for development
-- WARNING: These are NOT suitable for production!

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Development: Allow all operations on profiles"
  ON public.profiles
  FOR ALL
  USING (true);

-- Vendors table policies
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Development: Allow all operations on vendors"
  ON public.vendors
  FOR ALL
  USING (true);

-- ========== ENABLE ANONYMOUS ACCESS ==========
-- Allow the anon role to use the service for development
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ========== ADD TEST DATA ==========
-- Add a test admin user if it doesn't exist
-- Note: This needs to match a real user created through auth.users
-- INSERT INTO public.profiles (id, email, name, role)
-- VALUES ('your-user-id', 'your-email@example.com', 'Admin User', 'admin')
-- ON CONFLICT (id) DO NOTHING;
