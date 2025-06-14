-- Add address and phone_number columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phoneNumber TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Users can update their profile data" ON public.profiles;

-- Create policy without IF NOT EXISTS (not supported for policies)
CREATE POLICY "Users can update their profile data" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
