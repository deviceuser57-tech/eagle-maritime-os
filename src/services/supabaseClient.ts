// Centralised Supabase client — re-exports the generated integration client
// so the whole app shares one auth session and typed schema.
import { supabase } from '@/integrations/supabase/client';

export { supabase };
export default supabase;
