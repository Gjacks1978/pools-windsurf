import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
