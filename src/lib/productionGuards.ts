export const PRODUCTION_ACCOUNT_ACCESS_MESSAGE =
  "Partner accounts are coming online. You can still explore plans, preview the workspace, and continue setup.";

export const ACTION_ACCEPTED_MESSAGE = "Saved.";

export const ACCOUNT_PREPARING_MESSAGE =
  "We will keep this ready while partner account access opens.";

function hasValue(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isProductionLike(env: ImportMetaEnv = import.meta.env): boolean {
  return env.PROD || env.MODE === "production" || env.VITE_APP_ENV === "production";
}

export function hasFrontendSupabaseAuth(env: ImportMetaEnv = import.meta.env): boolean {
  return hasValue(env.VITE_SUPABASE_URL)
    && (hasValue(env.VITE_SUPABASE_PUBLISHABLE_KEY) || hasValue(env.VITE_SUPABASE_ANON_KEY));
}

export function getFrontendProductionGuard(env: ImportMetaEnv = import.meta.env) {
  const production = isProductionLike(env);
  const accountAccessEnabled = hasFrontendSupabaseAuth(env);
  const accountAccessBlocked = production && !accountAccessEnabled;

  return {
    production,
    accountAccessEnabled,
    accountAccessBlocked,
    persistenceLabel: accountAccessEnabled ? "Ready" : "Preparing",
    accountAccessLabel: accountAccessEnabled ? "Ready" : "Preparing",
    accountStateLabel: accountAccessEnabled ? "Ready" : "Preparing",
    message: accountAccessBlocked ? PRODUCTION_ACCOUNT_ACCESS_MESSAGE : "",
    persistenceMessage: ACCOUNT_PREPARING_MESSAGE,
  };
}

export function canUseProductionAccountAccess(env: ImportMetaEnv = import.meta.env): boolean {
  const guard = getFrontendProductionGuard(env);
  return !guard.production || guard.accountAccessEnabled;
}

export function markLocalRecord<T extends Record<string, unknown>>(record: T): T & {
  syncStatus: "pending";
} {
  return {
    ...record,
    syncStatus: "pending",
  };
}
