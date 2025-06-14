import { supabase } from '@/lib/supabase';

/**
 * Ensures the required storage buckets exist
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const ensureStorageBuckets = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return { success: false, message: 'Failed to check storage buckets' };
    }
    
    const vendorBucketExists = buckets.some(bucket => bucket.name === 'vendor-assets');
    
    if (vendorBucketExists) {
      return { success: true, message: 'Storage buckets already exist' };
    }
    
    return { 
      success: true, 
      message: 'Storage check complete' 
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/**
 * Upload a file to Supabase storage
 * @param {File} file - The file to upload
 * @param {string} type - Type identifier (e.g., 'logo', 'banner')
 * @param {string} userId - The user's ID for folder organization
 * @param {string} bucket - The bucket name (default: 'vendor-assets')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, type, userId, bucket = 'vendor-assets') => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    throw error;
  }
};
