import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 * 
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder within the bucket
 * @param {string} [existingPath] - Optional existing file path to replace
 * @returns {Promise<{path: string, url: string}>} - The file path and public URL
 */
export const uploadFile = async (file, bucket, folder, existingPath = null) => {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // If we're replacing an existing file, delete it first
    if (existingPath) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([existingPath]);
      
      if (deleteError) {
        console.error('Error deleting existing file:', deleteError);
      }
    }

    // Upload the new file
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * 
 * @param {File[]} files - Array of files to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder within the bucket
 * @returns {Promise<Array<{path: string, url: string}>>} - Array of file paths and URLs
 */
export const uploadMultipleFiles = async (files, bucket, folder) => {
  const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage
 * 
 * @param {string} path - The file path to delete
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteFile = async (path, bucket) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};