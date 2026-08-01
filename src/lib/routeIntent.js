const INTENT_KEYS = new Set([
  "returnTo", "partnerType", "plan", "sku", "checkoutKey", "billingMode",
  "modules", "organizationId", "portfolioId", "listingId", "entityId",
]);

const ALLOWED_RETURN_PREFIXES = [
  "/map", "/app", "/resident", "/residents", "/partner-workspace",
  "/admin-studio", "/partners", "/pricing",
];

export function sanitizeReturnTo(candidate, fallback = "/map?mode=resident&tab=map&filter=All") {
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//")) return fallback;
  try {
    const url = new URL(candidate, "https://downtownperks.local");
    if (url.origin !== "https://downtownperks.local") return fallback;
    if (!ALLOWED_RETURN_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function currentSafeReturnTo(location, fallback) {
  return sanitizeReturnTo(`${location.pathname}${location.search}${location.hash}`, fallback);
}

export function preserveIntentParams(search) {
  const source = new URLSearchParams(search);
  const safe = new URLSearchParams();
  for (const [key, value] of source.entries()) {
    if (INTENT_KEYS.has(key) && value.length <= 1000) safe.set(key, value);
  }
  return safe;
}
