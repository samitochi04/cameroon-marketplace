-- Fix for vendors table RLS policy issue

-- 1. First, enable RLS on vendors table if not already enabled
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing INSERT policy that might be causing conflicts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vendors' AND policyname = 'Users can create their own vendor profile'
  ) THEN
    DROP POLICY "Users can create their own vendor profile" ON public.vendors;
  END IF;
END
$$;

-- 3. Create a policy that allows users to insert their own vendor profile
CREATE POLICY "Users can create their own vendor profile"
ON public.vendors
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Create a policy that allows users to view their own vendor profile
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vendors' AND policyname = 'Vendors can view their own profile'
  ) THEN
    DROP POLICY "Vendors can view their own profile" ON public.vendors;
  END IF;
END
$$;

CREATE POLICY "Vendors can view their own profile"
ON public.vendors
FOR SELECT
USING (auth.uid() = id);

-- 5. Create policy for admins to manage vendor profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'vendors' AND policyname = 'Admins can manage all vendor profiles'
  ) THEN
    DROP POLICY "Admins can manage all vendor profiles" ON public.vendors;
  END IF;
END
$$;

CREATE POLICY "Admins can manage all vendor profiles"
ON public.vendors
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
