import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration for Supabase Client in the browser
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  'https://jkorczrtrsasbsgnzqnd.supabase.co';

// Prefer Service Role Key in internal admin environments to bypass RLS restrictions,
// with fallback to publishable anon key
const SUPABASE_KEY =
  (import.meta as any).env?.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3JjenJ0cnNhc2JzZ256cW5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgzOTMzMiwiZXhwIjoyMTAzNDE1MzMyfQ.yaQJX4SQAl76T5J11y68LxleSC69LIL3Ctig_yOmQeQ';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

export { SUPABASE_URL, SUPABASE_KEY };
