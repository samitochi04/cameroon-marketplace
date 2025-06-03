-- Function to safely check user role without recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT 
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin';
$$;
