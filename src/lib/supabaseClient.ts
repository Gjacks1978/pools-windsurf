import { createClient } from '@supabase/supabase-js';

// Fallback para garantir que o cliente sempre seja criado, mesmo sem as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kysauxdsdzhghptfcpjy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5c2F1eGRzZHpoZ2hwdGZjcGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NDU4NzksImV4cCI6MjA2MDQyMTg3OX0.xXSUNF5hDY7bpVe92MqmCjp-loo8mkuBnu4yuG-AS3k';

// Sempre criamos um cliente válido, já que temos fallbacks
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verificamos se as variáveis de ambiente foram carregadas para logging
const hasValidConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
if (!hasValidConfig && typeof window !== 'undefined') {
  console.warn('Supabase: usando URLs de fallback. Verifique se .env.local está configurado corretamente.');
}

// Helper para verificar se Supabase está configurado via variáveis de ambiente
export const isSupabaseConfigured = () => hasValidConfig;
