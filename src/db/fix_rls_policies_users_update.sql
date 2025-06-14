-- Update users table update policy to use is_admin function
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
USING (public.is_admin());
