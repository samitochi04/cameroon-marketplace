import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a vendor image (logo or banner) to Supabase storage
 * 
 * @param {File} file - The image file to upload
 * @param {string} type - The type of image ('logo' or 'banner')
 * @param {string} vendorId - The vendor's user ID
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadVendorImage = async (file, type, vendorId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Get file extension
    const fileExt = file.name.split('.').pop();
    
    // Create a unique filename
    const fileName = `${type}_${uuidv4()}.${fileExt}`;
    
    // Create the path where the file will be stored
    // Format: {vendorId}/{type}_{uuid}.{extension}
    const filePath = `${vendorId}/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('vendor-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if file exists
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('vendor-assets')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadVendorImage:', error);
    throw error;
  }
};

/**
 * Update vendor profile with image URLs
 * 
 * @param {string} vendorId - The vendor's user ID
 * @param {object} data - Object containing logo_url and/or banner_url
 * @returns {Promise<object>} The updated vendor profile
 */
export const updateVendorImages = async (vendorId, data) => {
  try {
    const { data: updatedVendor, error } = await supabase
      .from('vendors')
      .update(data)
      .eq('id', vendorId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating vendor profile:', error);
      throw new Error(`Failed to update vendor profile: ${error.message}`);
    }
    
    return updatedVendor;
  } catch (error) {
    console.error('Error in updateVendorImages:', error);
    throw error;
  }
};
