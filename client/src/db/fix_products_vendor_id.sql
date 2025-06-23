-- Check if vendor_id exists in products table and add it if missing
-- This script will help fix the wishlist vendor_id issue

-- First, let's check the current structure of the products table
-- Run this query in Supabase SQL editor to see what columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Add vendor_id to products table if it doesn't exist
-- (Replace 'user_id' with 'vendor_id' if you're currently using user_id to store vendor info)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES auth.users(id);

-- If you already have a user_id column that represents the vendor, rename it
-- (Uncomment the line below if needed)
-- ALTER TABLE public.products RENAME COLUMN user_id TO vendor_id;

-- If you have an existing column that stores vendor info under a different name,
-- you can copy the data (adjust column name as needed):
-- UPDATE public.products SET vendor_id = user_id WHERE vendor_id IS NULL;

-- Make vendor_id NOT NULL after ensuring all products have a vendor
-- (Run this after updating existing records)
-- ALTER TABLE public.products ALTER COLUMN vendor_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);

-- Update RLS policies for products table to include vendor access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can manage their own products" ON public.products;
DROP POLICY IF EXISTS "Everyone can view published products" ON public.products;

-- Create new policies
CREATE POLICY "Everyone can view published products" 
ON public.products 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Vendors can manage their own products" 
ON public.products 
FOR ALL 
USING (auth.uid() = vendor_id);

-- Verify the wishlist query will work by testing the join
-- Run this query to test if vendor_id is now available in wishlist queries:
/*
SELECT 
  w.id,
  w.product_id,
  w.created_at,
  p.id as product_id_check,
  p.name,
  p.price,
  p.sale_price,
  p.images,
  p.stock_quantity,
  p.status,
  p.vendor_id  -- This should now be available
FROM public.wishlists w
JOIN public.products p ON w.product_id = p.id
WHERE w.user_id = auth.uid()
LIMIT 1;
*/