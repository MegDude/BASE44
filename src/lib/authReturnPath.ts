export const DEFAULT_RESIDENT_MAP_PATH = "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured";
export const DEFAULT_PARTNER_RETURN_PATH = "/partner-workspace/overview";
export const DEFAULT_ADMIN_RETURN_PATH = "/admin";
const DEFAULT_RESIDENT_FILTER = "Featured";
const ADMIN_ROLES = new Set(["admin", "platform_admin", "super_admin"]);

function normalizeResidentFilter(value?: string | null) {
  const filter = String(value || DEFAULT_RESIDENT_FILTER).trim();
  const normalized = filter.toLowerCase();
  if (!filter || normalized === "all") return DEFAULT_RESIDENT_FILTER;
  if (normalized === "hotels") return "Buildings";
  return filter;
}

function collectionForFilter(filter: string) {
  const normalized = filter.toLowerCase();
  if (normalized === "featured") return "downtown-perks-featured";
  if (normalized === "perks") return "resident-benefits";
  if (normalized === "events") return "events-nearby";
  if (normalized === "dining") return "downtown-dining";
  if (normalized === "buildings" || normalized === "properties" || normalized === "hotels") return "buildings-and-residences";
  if (normalized === "routes") return "walking-routes";
  return null;
}

const PRESERVED_MAP_KEYS = [
  "mode",
  "tab",
  "filter",
  "intent",
  "entity",
  "entityId",
  "entityType",
  "perkId",
  "eventId",
  "listing",
  "listingId",
  "campaign",
  "campaignId",
  "partner",
  "collectionId",
  "collection",
  "routeId",
  "district",
  "buildingId",
  "query",
  "q",
  "prompt",
  "radius",
  "panel",
  "panelTab",
  "source",
  "guest",
] as const;

const TRANSIENT_CONTEXT_KEYS = ["query", "q", "prompt", "intent", "stop"] as const;

function shouldDropLegacyInKindContext(source: URLSearchParams, target: URLSearchParams) {
  const collection = target.get("collection") || "";
  const text = TRANSIENT_CONTEXT_KEYS.map((key) => source.get(key) || "").join(" ").toLowerCase();
  const hasLegacyInKindContext = /\binkind\b/.test(text) || source.get("intent") === "resident_perks";
  const collectionSupportsInKind = collection === "downtown-perks-featured" || collection === "resident-benefits" || collection === "downtown-dining";

  return hasLegacyInKindContext && !collectionSupportsInKind;
}

function deleteTransientContext(target: URLSearchParams) {
  TRANSIENT_CONTEXT_KEYS.forEach((key) => target.delete(key));
}

export function isSafeFirstPartyPath(value?: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(value));
}

export function normalizeResidentReturnPath(value?: string | null) {
  if (!isSafeFirstPartyPath(value)) return DEFAULT_RESIDENT_MAP_PATH;

  const parsed = new URL(value, "https://downtownperks.local");
  const path = parsed.pathname;

  if (path === "/map" || path === "/app/map") {
    return buildResidentMapPath(parsed.search, "/map");
  }

  if (path === "/resident/card" || path === "/card") {
    return buildResidentMapPath("?mode=resident&tab=pass&filter=Featured", "/map");
  }

  if (path === "/resident/saved") {
    return buildResidentMapPath("?mode=resident&tab=saved&filter=Featured", "/map");
  }

  if (path === "/resident/events" || path === "/events") {
    return buildResidentMapPath("?mode=resident&tab=events&filter=Events", "/map");
  }

  if (path === "/resident/perks" || path === "/perks") {
    return buildResidentMapPath("?mode=resident&tab=perks&filter=Perks", "/map");
  }

  if (path === "/resident/home" || path === "/resident/onboarding" || path === "/onboarding" || path.startsWith("/onboarding/") || path.startsWith("/resident/")) {
    return DEFAULT_RESIDENT_MAP_PATH;
  }

  return DEFAULT_RESIDENT_MAP_PATH;
}

export function getAuthenticatedAccountRole(account?: Record<string, unknown> | null) {
  const appMetadata = account?.app_metadata as Record<string, unknown> | undefined;
  const userMetadata = account?.user_metadata as Record<string, unknown> | undefined;
  const candidates = [
    appMetadata?.role,
    appMetadata?.account_type,
    userMetadata?.role,
    userMetadata?.account_type,
    userMetadata?.partner_type,
    account?.role,
    account?.partner_type,
  ].map((value) => String(value || "").toLowerCase()).filter(Boolean);
  const platformRole = candidates.find((role) => role === "resident" || role === "partner" || ADMIN_ROLES.has(role));
  if (platformRole) return platformRole;
  const partnerType = candidates.find((role) => !["authenticated", "anon"].includes(role));
  return partnerType || "resident";
}

export function getAuthenticatedDestination(
  account?: Record<string, unknown> | null,
  residentReturnPath = DEFAULT_RESIDENT_MAP_PATH,
) {
  const role = getAuthenticatedAccountRole(account);
  if (role === "resident") return normalizeResidentReturnPath(residentReturnPath);
  if (ADMIN_ROLES.has(role)) return DEFAULT_ADMIN_RETURN_PATH;
  return DEFAULT_PARTNER_RETURN_PATH;
}

export function normalizeAuthReturnPath(value: string | null | undefined, fallback = DEFAULT_RESIDENT_MAP_PATH) {
  if (!isSafeFirstPartyPath(value)) return fallback;
  const parsed = new URL(value, "https://downtownperks.local");
  if (["/auth/callback", "/sign-in", "/partners/sign-in", "/residents/login"].includes(parsed.pathname)) return fallback;
  return fallback === DEFAULT_RESIDENT_MAP_PATH ? normalizeResidentReturnPath(value) : value;
}

export function getSafeReturnPath(search: string, fallback = DEFAULT_RESIDENT_MAP_PATH) {
  return normalizeAuthReturnPath(new URLSearchParams(search).get("returnTo"), fallback);
}

export function buildResidentMapPath(search: string, pathname = "/map") {
  const source = new URLSearchParams(search);
  const filter = normalizeResidentFilter(source.get("filter"));
  const target = new URLSearchParams({
    mode: "resident",
    tab: source.get("tab") || "map",
    filter,
  });

  PRESERVED_MAP_KEYS.forEach((key) => {
    if (["mode", "tab", "filter"].includes(key)) return;
    const value = source.get(key);
    if (key === "entityId") {
      if (value && !target.get("entity")) target.set("entity", value);
      return;
    }
    if (value) target.set(key, value);
  });

  const collection = collectionForFilter(filter);
  if (collection) target.set("collection", collection);

  if (shouldDropLegacyInKindContext(source, target)) deleteTransientContext(target);

  return `${pathname}?${target.toString()}`;
}

export function storeAuthReturnPath(path: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("dp_auth_return_to", normalizeResidentReturnPath(path));
}

export function consumeAuthReturnPath(fallback = DEFAULT_RESIDENT_MAP_PATH) {
  if (typeof window === "undefined") return fallback;
  const stored = window.sessionStorage.getItem("dp_auth_return_to");
  window.sessionStorage.removeItem("dp_auth_return_to");
  return stored ? normalizeResidentReturnPath(stored) : fallback;
}
