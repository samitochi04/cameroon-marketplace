-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  commission DECIMAL(12,2) NOT NULL,
  vendor_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  payment_link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON public.transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference);

-- Add transaction_id column to vendor_earnings if it doesn't exist
DO $$ 
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vendor_earnings' AND column_name = 'transaction_id'
    ) THEN
        -- Add transaction_id column
        ALTER TABLE public.vendor_earnings ADD COLUMN transaction_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE public.vendor_earnings 
        ADD CONSTRAINT fk_vendor_earnings_transaction 
        FOREIGN KEY (transaction_id) 
        REFERENCES public.transactions(id);
        
        -- Create index for the new column
        CREATE INDEX idx_vendor_earnings_transaction_id ON public.vendor_earnings(transaction_id);
    END IF;
END $$;

-- Add cinetpay_merchant_id column to vendors table if it doesn't exist
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS cinetpay_merchant_id TEXT;

-- Add required fields to vendors table if they don't exist
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS payout_frequency TEXT DEFAULT 'monthly';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS payout_threshold DECIMAL(12,2) DEFAULT 5000;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;

-- Row Level Security for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies with DO blocks to check if they exist first
DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'transactions' AND policyname = 'Vendors can see their own transactions'
    ) THEN
        -- Create the policy
        CREATE POLICY "Vendors can see their own transactions"
        ON public.transactions
        FOR SELECT
        USING (vendor_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'transactions' AND policyname = 'Admins can see all transactions'
    ) THEN
        -- Create the policy
        CREATE POLICY "Admins can see all transactions"
        ON public.transactions
        FOR ALL
        USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END $$;

-- Row Level Security for vendor payouts
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies with DO blocks to check if they exist first
DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'vendor_payouts' AND policyname = 'Vendors can see their own payouts'
    ) THEN
        -- Create the policy
        CREATE POLICY "Vendors can see their own payouts"
        ON public.vendor_payouts
        FOR SELECT
        USING (vendor_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'vendor_payouts' AND policyname = 'Admins can manage all payouts'
    ) THEN
        -- Create the policy
        CREATE POLICY "Admins can manage all payouts"
        ON public.vendor_payouts
        FOR ALL
        USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END $$;
