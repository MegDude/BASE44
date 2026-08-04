// Single source of truth for the super-admin email allowlist, shared by the
// client (Vite bundle, via import.meta.env) and the serverless API layer
// (Node, via process.env). This is the ONLY place the canonical super-admin
// address is hardcoded.
//
// NOTE: An email match only enables platform/billing recovery bypass on the
// server. Primary authorization is still derived from trusted Supabase
// app_metadata / platform_profiles role claims — this list is a safety net,
// not the main gate. It is intentionally hardcoded so recovery access survives
// even if env vars are cleared. Additional operators can be added via the
// SUPER_ADMIN_EMAILS / VITE_SUPER_ADMIN_EMAILS (comma-separated) env vars.
export const DEFAULT_SUPER_ADMIN_EMAILS = ["me@megdude.com"];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function splitAllowlist(value) {
  return String(value || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

function readEnvValue(key) {
  // Server (Node) runtime env.
  if (typeof process !== "undefined" && process.env && process.env[key] != null) {
    return process.env[key];
  }
  // Client (Vite) build-time env. `import.meta.env` is replaced statically in
  // the browser bundle and is simply undefined in the Node serverless runtime.
  try {
    const viteEnv = import.meta && import.meta.env;
    if (viteEnv && viteEnv[key] != null) return viteEnv[key];
  } catch {
    // import.meta not available in this context — ignore.
  }
  return undefined;
}

/**
 * Returns the full, de-duplicated list of super-admin operator emails.
 * @param {string[]} [extraEnvKeys] Optional additional env var names to merge in
 *   (e.g. legacy FOUNDING_PARTNER_OPERATOR_EMAILS).
 */
export function getSuperAdminEmails(extraEnvKeys = []) {
  const merged = [
    ...DEFAULT_SUPER_ADMIN_EMAILS.map(normalizeEmail),
    ...splitAllowlist(readEnvValue("SUPER_ADMIN_EMAILS")),
    ...splitAllowlist(readEnvValue("VITE_SUPER_ADMIN_EMAILS")),
  ];
  for (const key of extraEnvKeys) {
    merged.push(...splitAllowlist(readEnvValue(key)));
  }
  return Array.from(new Set(merged));
}

/**
 * True when the given email is an allowlisted super-admin operator.
 * @param {unknown} email
 * @param {string[]} [extraEnvKeys]
 */
export function isSuperAdminEmail(email, extraEnvKeys = []) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized) && getSuperAdminEmails(extraEnvKeys).includes(normalized);
}
