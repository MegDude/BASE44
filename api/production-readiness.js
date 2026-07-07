function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VITE_APP_ENV === "production";
}

function getReadiness() {
  const frontendAuthConfigured =
    hasValue(process.env.VITE_SUPABASE_URL) &&
    hasValue(process.env.VITE_SUPABASE_ANON_KEY);
  const supabaseServerConfigured =
    hasValue(process.env.SUPABASE_URL) &&
    hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const databaseConfigured = hasValue(process.env.DATABASE_URL);
  const durablePersistenceConfigured = databaseConfigured || supabaseServerConfigured;
  const production = isProductionLike();

  return {
    production,
    persistence: durablePersistenceConfigured ? "Ready" : "Needs account storage",
    accountAccess: frontendAuthConfigured ? "Ready" : "Connect sign-in",
    writeMode: durablePersistenceConfigured ? "Ready to save" : "Session preview",
    durablePersistenceConfigured,
    frontendAuthConfigured,
    supabaseServerConfigured,
    databaseConfigured,
    warning:
      production && !durablePersistenceConfigured
        ? "Connect account storage before treating this as a permanent workspace change."
        : "",
    accountNotice:
      production && !frontendAuthConfigured
        ? "Account sign-in is not connected yet. You can still explore the workspace, create a partner account, or continue setup."
        : "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json(getReadiness());
}
