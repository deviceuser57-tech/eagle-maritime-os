import { createClient } from '@supabase/supabase-js';

// Factory to create a Supabase client configured for the MCP server
export const createMcpSupabaseClient = (authHeader?: string) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    },
    auth: {
      persistSession: false, // MCP servers are typically stateless per request
    },
  });
};
