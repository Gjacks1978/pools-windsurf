import { createClient } from '@supabase/supabase-js';

// Substitua pelos valores do seu projeto Supabase
const supabaseUrl = 'https://kysauxdsdzhghptfcpjy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5c2F1eGRzZHpoZ2hwdGZjcGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDU4NzksImV4cCI6MjA2MDQyMTg3OX0.xXSUNF5hDY7bpVe92MqmCjp-loo8mkuBnu4yuG-AS3k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
