import { createClient } from '@supabase/supabase-js';

const env = globalThis.process?.env || {};
const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  const missingVars = [
    !supabaseUrl ? 'SUPABASE_URL' : null,
    !supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null
  ].filter(Boolean);
  const shouldLogMissingSupabase =
    env.NODE_ENV === 'production' ||
    env.VITE_LOG_MISSING_SUPABASE === 'true';

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