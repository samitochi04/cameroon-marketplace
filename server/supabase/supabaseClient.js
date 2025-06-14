const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Log a warning instead of crashing immediately
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('Warning: Missing Supabase environment variables. Using placeholder values for development.');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;