-- Add missing columns to the vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS store_address TEXT,
ADD COLUMN IF NOT EXISTS store_phone TEXT,
ADD COLUMN IF NOT EXISTS store_city TEXT,
ADD COLUMN IF NOT EXISTS store_country TEXT DEFAULT 'Cameroon';

-- Add index for faster vendor queries
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);

-- Update comment on table for documentation
COMMENT ON TABLE public.vendors IS 'Stores vendor profiles and store information';
