import { supabase } from '@/lib/supabase';

/**
 * Utility function to check if required tables exist and create them if needed
 */
export const checkAndSetupDatabase = async () => {
  console.log('Checking database setup...');
  
  try {
    // Check if profiles table exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('does not exist')) {
      console.log('Profiles table does not exist, creating now...');
      
      // Create the profiles table
      const { error: createError } = await supabase.rpc('create_profiles_table');
      
      if (createError) {
        console.error('Error creating profiles table:', createError.message);
        return false;
      }
      
      console.log('Profiles table created successfully');
      return true;
    } else if (error) {
      console.error('Error checking profiles table:', error.message);
      return false;
    }
    
    console.log('Database setup looks good!');
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
