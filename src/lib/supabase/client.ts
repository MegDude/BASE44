import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const publishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY;

export const supabaseClient = url && publishableKey
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "downtown-perks-auth",
        flowType: "pkce",
      },
    })
  : null;

export function requireSupabaseClient() {
  if (!supabaseClient) {
    throw new Error("Supabase browser client is not configured.");
  }
  return supabaseClient;
}
