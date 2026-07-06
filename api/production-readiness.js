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
    persistence: durablePersistenceConfigured ? "Connected" : "Not configured",
    accountAccess: frontendAuthConfigured ? "Enabled" : "Missing Supabase env vars",
    writeMode: durablePersistenceConfigured ? "Durable" : "Demo session only",
    durablePersistenceConfigured,
    frontendAuthConfigured,
    supabaseServerConfigured,
    databaseConfigured,
    warning:
      production && !durablePersistenceConfigured
        ? "This action requires production persistence before it can be treated as permanent."
        : "",
    accountNotice:
      production && !frontendAuthConfigured
        ? "Production account access is not available yet. Add Supabase environment variables before enabling sign-in."
        : "",
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json(getReadiness());
}
