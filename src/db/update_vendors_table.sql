-- Add payment-related fields to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS payout_method TEXT,
ADD COLUMN IF NOT EXISTS payout_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS has_payment_setup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS balance DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_payout_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payout_amount DECIMAL(12,2);

-- Create a table for vendor earnings transactions
CREATE TABLE IF NOT EXISTS public.vendor_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  order_item_id UUID REFERENCES public.order_items(id),
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create a table for vendor payouts
CREATE TABLE IF NOT EXISTS public.vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  amount DECIMAL(12,2) NOT NULL,
  fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  payout_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_earnings_vendor_id ON public.vendor_earnings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor_id ON public.vendor_payouts(vendor_id);
