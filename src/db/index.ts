export type DatabaseRuntime = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  supabaseDbUrl?: string;
};

export function getDatabaseRuntime(env: Record<string, string | undefined> = import.meta.env as Record<string, string | undefined>): DatabaseRuntime {
  return {
    supabaseUrl: env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseDbUrl: env.SUPABASE_DB_URL,
  };
}

export function assertServerDatabaseRuntime(env: DatabaseRuntime) {
  const missing = [
    !env.supabaseUrl ? "SUPABASE_URL" : "",
    !env.supabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : "",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Missing production database configuration: ${missing.join(", ")}`);
  }
}
