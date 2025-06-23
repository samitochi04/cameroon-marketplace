-- Add Mobile Money fields to vendors table

-- Check if the column exists before adding
DO $$ 
BEGIN
   IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_name = 'vendors' AND column_name = 'mobile_money_accounts') THEN
      ALTER TABLE public.vendors ADD COLUMN mobile_money_accounts JSONB DEFAULT '{}'::jsonb;
   END IF;
END $$;

-- Example structure of mobile_money_accounts:
/*
{
  "mtn": {
    "phone": "67XXXXXXX",
    "name": "John Doe"
  },
  "orange": {
    "phone": "69XXXXXXX",
    "name": "John Doe"
  }
}
*/

-- Create functions to access specific mobile money accounts
CREATE OR REPLACE FUNCTION get_mtn_mobile_money_phone(vendor_data jsonb)
RETURNS TEXT AS $$
BEGIN
    RETURN vendor_data->'mobile_money_accounts'->'mtn'->>'phone';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_mtn_account_name(vendor_data jsonb)
RETURNS TEXT AS $$
BEGIN
    RETURN vendor_data->'mobile_money_accounts'->'mtn'->>'name';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_orange_money_phone(vendor_data jsonb)
RETURNS TEXT AS $$
BEGIN
    RETURN vendor_data->'mobile_money_accounts'->'orange'->>'phone';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_orange_account_name(vendor_data jsonb)
RETURNS TEXT AS $$
BEGIN
    RETURN vendor_data->'mobile_money_accounts'->'orange'->>'name';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
