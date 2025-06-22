-- Check if the bucket exists and create it if it doesn't
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('vendor-assets', 'vendor-assets', true)
    ON CONFLICT DO NOTHING;
END $$;

-- Create policies for public read access
BEGIN;
    DROP POLICY IF EXISTS "Public Read Access for vendor assets" ON storage.objects;
    
    CREATE POLICY "Public Read Access for vendor assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'vendor-assets');
    
    -- Allow authenticated uploads to vendor-assets bucket
    DROP POLICY IF EXISTS "Authenticated users can upload vendor images" ON storage.objects;
    
    CREATE POLICY "Authenticated users can upload vendor images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'vendor-assets' AND
        auth.role() = 'authenticated'
    );
    
    -- Allow users to update their own uploads
    DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
    
    CREATE POLICY "Users can update their own uploads"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'vendor-assets' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
    
    -- Allow users to delete their own uploads
    DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
    
    CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'vendor-assets' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );
COMMIT;
