-- This script adds missing foreign key relationships to the database

-- Add foreign key from orders to profiles for the user relationship
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_user 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id);

-- Make sure order_items has a foreign key to orders
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_order 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id);

-- Make sure order_items has a foreign key to products
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_product 
FOREIGN KEY (product_id) 
REFERENCES public.products(id);

-- Make sure order_items has a foreign key to vendors (if needed)
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_vendor 
FOREIGN KEY (vendor_id) 
REFERENCES public.vendors(id);
