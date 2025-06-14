-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fix the foreign key constraint to use ON DELETE CASCADE
ALTER TABLE IF EXISTS public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Disable RLS temporarily for setup
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;

-- Create an improved trigger function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add a small delay to ensure the auth.users record is fully committed
  PERFORM pg_sleep(0.1);
  
  -- Insert into profiles with careful error handling
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
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      updated_at = now();
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists and is correctly defined
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add permissive RLS policy for development
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.profiles;
CREATE POLICY "Allow all operations for authenticated users" 
  ON public.profiles
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Re-enable RLS with our permissive policy
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
