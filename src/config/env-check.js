// Check for required environment variables in production
if (import.meta.env.PROD) {
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.warn('Using fallback values for development. Please set proper environment variables in production.');
  }
}