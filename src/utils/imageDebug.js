import { supabase } from '@/lib/supabase';

/**
 * Debug helper for image URLs
 */
export const debugImageUrl = async (url) => {
  console.group('Image URL Debugging');
  console.log('Original URL:', url);
  
  try {
    if (!url) {
      console.log('URL is empty or undefined');
      return null;
    }
    
    // Check if the URL is absolute
    const isAbsolute = url.match(/^(https?:\/\/|data:)/);
    console.log('Is absolute URL:', isAbsolute ? 'Yes' : 'No');
    
    // If it's a storage path, try to get public URL
    if (!isAbsolute) {
      // Try to parse it as a Supabase storage path
      const segments = url.split('/');
      let bucket, path;
      
      if (segments[0] === 'vendor-assets' || segments[0] === 'product-images') {
        bucket = segments[0];
        path = segments.slice(1).join('/');
        console.log('Parsed as storage path:', { bucket, path });
        
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        console.log('Generated public URL:', data?.publicUrl);
        
        // Try to fetch the public URL to check if it works
        try {
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          console.log('URL check response:', response.status, response.statusText);
        } catch (error) {
          console.error('Error checking URL:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in debugImageUrl:', error);
  }
  
  console.groupEnd();
  return url;
};

/**
 * Try to fix a problematic image URL
 */
export const fixImageUrl = (url) => {
  if (!url) return '';
  
  // If URL already starts with http/https or data:, it's already absolute
  if (url.match(/^(https?:\/\/|data:)/)) {
    return url;
  }
  
  // If it's a storage URL that doesn't have the full path
  if (url.startsWith('/storage/')) {
    return `${window.location.origin}${url}`;
  }
  
  // If looks like a relative path within a bucket (bucket-name/path/to/file)
  const segments = url.split('/');
  if (segments[0] === 'vendor-assets' || segments[0] === 'product-images') {
    const bucket = segments[0];
    const path = segments.slice(1).join('/');
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || url;
  }
  
  // If it seems to be just a path with no bucket info, assume vendor-assets
  if (!url.includes('://')) {
    const { data } = supabase.storage.from('vendor-assets').getPublicUrl(url);
    return data?.publicUrl || url;
  }
  
  return url;
};
