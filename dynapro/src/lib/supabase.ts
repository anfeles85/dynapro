import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration for Supabase Client in the browser
const SUPABASE_URL: string =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  '';

// Browser client must strictly use the public anon key to respect RLS and prevent credential leakage
const SUPABASE_KEY: string =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '[Supabase] Credenciales de cliente no configuradas. Defina VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en su archivo .env.'
  );
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

export { SUPABASE_URL, SUPABASE_KEY };
