import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  const missingVars = [
    !supabaseUrl ? 'SUPABASE_URL' : null,
    !supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null
  ].filter(Boolean);
  const shouldLogMissingSupabase =
    process.env.NODE_ENV === 'production' ||
    process.env.VITE_LOG_MISSING_SUPABASE === 'true';

  if (shouldLogMissingSupabase) {
    console.warn(`Supabase server client not initialized. Missing: ${missingVars.join(', ')}`);
  }
}

export const supabaseServer =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;
