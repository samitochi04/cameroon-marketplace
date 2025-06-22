-- Create public storage bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('public', 'public', true)
    ON CONFLICT DO NOTHING;
END $$;

-- Public access policy
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public');

-- Allow authenticated users to upload to public bucket
CREATE POLICY "Authenticated users can upload public images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'public' AND
    auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their public uploads"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'public' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their public uploads"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'public' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
