export const PRODUCTION_ACCOUNT_ACCESS_MESSAGE =
  "Production account access is not available yet. Add Supabase environment variables before enabling sign-in.";

export const DEMO_WRITE_MESSAGE = "Saved for this demo session.";

export const PRODUCTION_PERSISTENCE_MESSAGE =
  "This action requires production persistence before it can be treated as permanent.";

function hasValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isProductionLike(env: ImportMetaEnv = import.meta.env): boolean {
  return env.PROD || env.MODE === "production" || env.VITE_APP_ENV === "production";
}

export function hasFrontendSupabaseAuth(env: ImportMetaEnv = import.meta.env): boolean {
  return hasValue(env.VITE_SUPABASE_URL) && hasValue(env.VITE_SUPABASE_ANON_KEY);
}

export function getFrontendProductionGuard(env: ImportMetaEnv = import.meta.env) {
  const production = isProductionLike(env);
  const accountAccessEnabled = hasFrontendSupabaseAuth(env);
  const demoMode = production && !accountAccessEnabled;

  return {
    production,
    accountAccessEnabled,
    demoMode,
    persistenceLabel: demoMode ? "Not configured" : "Connected",
    accountAccessLabel: accountAccessEnabled ? "Enabled" : "Missing Supabase env vars",
    writeModeLabel: demoMode ? "Demo session only" : "Durable",
    message: demoMode ? PRODUCTION_ACCOUNT_ACCESS_MESSAGE : "",
  };
}

export function canUseProductionAccountAccess(env: ImportMetaEnv = import.meta.env): boolean {
  const guard = getFrontendProductionGuard(env);
  return !guard.production || guard.accountAccessEnabled;
}

export function markDemoRecord<T extends Record<string, unknown>>(record: T): T & {
  writeMode: "demo_session_only";
  temporary: true;
} {
  return {
    ...record,
    writeMode: "demo_session_only",
    temporary: true,
  };
}
