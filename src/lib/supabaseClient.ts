import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if variables are set
const hasValidConfig = !!(supabaseUrl && supabaseAnonKey);

// Create a mock client or real client based on config availability
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null as any; // Type assertion to avoid changing all the code

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => hasValidConfig;
