-- This script fixes storage permissions - run it in the Supabase SQL Editor

-- Create vendor-assets bucket if it doesn't exist
BEGIN;
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('vendor-assets', 'vendor-assets', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-images', 'product-images', true)
  ON CONFLICT (id) DO NOTHING;
COMMIT;

-- Allow public read access for vendor-assets
DROP POLICY IF EXISTS "Public Read Access for vendor-assets" ON storage.objects;
CREATE POLICY "Public Read Access for vendor-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'vendor-assets');

-- Allow vendors to upload to their folder
DROP POLICY IF EXISTS "Vendors can upload to their folder" ON storage.objects;
CREATE POLICY "Vendors can upload to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow vendors to update their own files
DROP POLICY IF EXISTS "Vendors can update their own files" ON storage.objects;
CREATE POLICY "Vendors can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow vendors to delete their own files
DROP POLICY IF EXISTS "Vendors can delete their own files" ON storage.objects;
CREATE POLICY "Vendors can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-assets' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Same policies for product-images bucket
DROP POLICY IF EXISTS "Public Read Access for product-images" ON storage.objects;
CREATE POLICY "Public Read Access for product-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Vendors can upload product images" ON storage.objects;
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Vendors can update their product images" ON storage.objects;
CREATE POLICY "Vendors can update their product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Vendors can delete their product images" ON storage.objects;
CREATE POLICY "Vendors can delete their product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
