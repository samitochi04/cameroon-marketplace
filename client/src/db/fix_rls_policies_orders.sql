-- Update orders table policy to use is_admin function
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;

CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
USING (public.is_admin());
