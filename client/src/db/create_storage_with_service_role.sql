-- This script should be run with service_role permissions from the Supabase dashboard SQL editor

BEGIN;
-- Create the vendor-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-assets', 'vendor-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create public read access policy
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-assets');

-- Create vendor write access policy (allow authenticated users to upload to their folder)
DROP POLICY IF EXISTS "Authenticated User Upload Access" ON storage.objects;
CREATE POLICY "Authenticated User Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'vendor-assets' AND
  auth.role() = 'authenticated'
);

-- Create update access policy
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create delete access policy
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
