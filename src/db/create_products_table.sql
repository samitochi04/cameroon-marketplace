-- This script creates/updates the products table in Supabase

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id),
  category_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  weight DECIMAL(10,2),
  dimensions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Create RLS policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read published products
DROP POLICY IF EXISTS "Anyone can read published products" ON public.products;
CREATE POLICY "Anyone can read published products"
ON public.products
FOR SELECT
USING (status = 'published');

-- Vendors can read their own products
DROP POLICY IF EXISTS "Vendors can read their own products" ON public.products;
CREATE POLICY "Vendors can read their own products"
ON public.products
FOR SELECT
USING (vendor_id = auth.uid());

-- Vendors can create their own products
DROP POLICY IF EXISTS "Vendors can create their own products" ON public.products;
CREATE POLICY "Vendors can create their own products"
ON public.products
FOR INSERT
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own products
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (vendor_id = auth.uid());
