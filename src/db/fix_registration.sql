-- Allow profiles to be created during registration by turning off RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Create a function to handle new user creation with admin rights
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;
    
  -- Also create vendor record if role is vendor
  IF (NEW.raw_user_meta_data->>'role') = 'vendor' THEN
    INSERT INTO public.vendors (id, store_name, description, status)
    VALUES (
      NEW.id, 
      'Store ' || COALESCE(NEW.raw_user_meta_data->>'name', 'New Vendor'), 
      'New vendor store', 
      'pending'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that runs when a user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Re-enable RLS with proper policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update the policy to allow users to view and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Allow admins to view and manage all profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Similar updates for vendors table
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view and update their own profile" ON public.vendors;
CREATE POLICY "Vendors can view and update their own profile"
ON public.vendors
FOR ALL
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all vendor profiles" ON public.vendors;
CREATE POLICY "Admins can manage all vendor profiles"
ON public.vendors
FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
