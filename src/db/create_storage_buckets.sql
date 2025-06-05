-- Create a storage bucket for vendor assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'vendor-assets', 'vendor-assets', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'vendor-assets'
);

-- Create bucket security policies

-- Allow public read access to vendor assets
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-assets');

-- Allow vendors to upload to their own folder
CREATE POLICY "Vendor Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to update their own files
CREATE POLICY "Vendor Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to delete their own files
CREATE POLICY "Vendor Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
