import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Centralised Supabase client with auth handling
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Optionally set auth if needed elsewhere
export const setAuth = (accessToken: string) => {
  supabase.auth.setAuth(accessToken);
};

export default supabase;
