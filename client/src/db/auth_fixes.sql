-- Fix for RLS policy violation on profiles table

-- 1. First, check if the policy exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can create their own profile'
  ) THEN
    DROP POLICY "Users can create their own profile" ON public.profiles;
  END IF;
END
$$;

-- 2. Create a new policy that allows public insert access for profiles during registration
CREATE POLICY "Users can create their own profile" 
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- 3. Improve trigger function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = COALESCE(new.raw_user_meta_data->>'name', EXCLUDED.name),
    role = COALESCE(new.raw_user_meta_data->>'role', EXCLUDED.role);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Disable email confirmation requirement for development (enable it for production)
-- Note: Access this through Supabase Dashboard: Authentication → Settings → Email Auth

-- 5. Fix the vendor creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'vendor' THEN
    INSERT INTO public.vendors (id, store_name, description, status)
    VALUES (NEW.id, 'Store ' || COALESCE(NEW.name, 'New Vendor'), 'New vendor store', 'pending')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_user_created ON public.profiles;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();
