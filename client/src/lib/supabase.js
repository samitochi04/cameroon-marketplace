import { createClient } from '@supabase/supabase-js';
import { create } from 'zustand';

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
    debug: false // Reduced debug output
  }
});

// Maintain a global refresh counter that components can subscribe to
export const useSupabaseRefresh = create((set) => ({
  refreshCounter: 0,
  lastRefreshTime: new Date(),
  refreshData: () => set((state) => ({ 
    refreshCounter: state.refreshCounter + 1,
    lastRefreshTime: new Date()
  })),
}));

// Function to refresh session state
export const refreshSupabaseSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    console.error("Failed to refresh Supabase session:", error);
    return { session: null, error };
  }
};

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
