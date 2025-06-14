-- Update users table read policy to use is_admin function
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
USING (public.is_admin());
