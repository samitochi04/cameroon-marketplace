import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Display warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create a singleton client with simpler options
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Let Supabase handle storage keys automatically
    debug: true
  }
});

// Test the connection with a safer method
supabase.auth.getSession()
  .then(response => {
    if (response.error) {
      console.warn('Supabase auth session check warning:', response.error);
    } else {
      console.log('Supabase connection established successfully');
      console.log('Session exists:', !!response.data.session);
    }
  })
  .catch(err => {
    console.error('Supabase connection test exception:', err);
  });

export { supabase };
export default supabase;
