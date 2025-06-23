-- Add user_id column to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing order_items to have the correct user_id based on the order
UPDATE public.order_items 
SET user_id = orders.user_id
FROM public.orders
WHERE order_items.order_id = orders.id
AND order_items.user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE public.order_items 
ALTER COLUMN user_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON public.order_items(user_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their own order items" ON public.order_items;

-- Create RLS policies for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policy for viewing order items - users can only see their own
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for inserting order items - users can only insert their own
CREATE POLICY "Users can insert their own order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy for updating order items - users can only update their own
CREATE POLICY "Users can update their own order items" 
ON public.order_items 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix the foreign key relationship ambiguity by dropping duplicate constraint
-- Check which foreign key constraints exist first
-- \d+ order_items  -- Run this in Supabase SQL editor to see constraints

-- Drop the duplicate foreign key constraint (adjust name as needed)
-- This assumes there are two constraints - keep the one you want to use
-- ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS fk_order_items_product;

-- Or alternatively, drop the system-generated one and keep the explicitly named one
-- ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Create wishlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);

-- Enable RLS for wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wishlists
CREATE POLICY "Users can view their own wishlist items" 
ON public.wishlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" 
ON public.wishlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
ON public.wishlists 
FOR DELETE 
USING (auth.uid() = user_id);
