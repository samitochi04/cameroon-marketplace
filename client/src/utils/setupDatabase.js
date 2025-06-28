import { supabase } from '@/lib/supabase';

/**
 * Utility function to check if required tables exist and create them if needed
 */
export const checkAndSetupDatabase = async () => {
  
  try {
    // Check if profiles table exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      
      // Create the profiles table
      const { error: createError } = await supabase.rpc('create_profiles_table');
      
      if (createError) {
        console.error('Error creating profiles table:', createError.message);
        return false;
      }
      
      return true;
    } else if (error) {
      console.error('Error checking profiles table:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error setting up database:', err);
    return false;
  }
};

/**
 * Helper function to initialize database for development
 * Should only be called in development environment
 */
export const initDevDatabase = async () => {
  if (import.meta.env.DEV) {
    return checkAndSetupDatabase();
  }
  return true;
};
