export const DEFAULT_RESIDENT_MAP_PATH = "/map?mode=resident&tab=map&filter=Featured&collection=downtown-perks-featured";
const DEFAULT_RESIDENT_FILTER = "Featured";

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

export function getSafeReturnPath(search: string, fallback = DEFAULT_RESIDENT_MAP_PATH) {
  const requested = new URLSearchParams(search).get("returnTo");
  if (!isSafeFirstPartyPath(requested)) return fallback;
  if (requested === "/app/map" || requested.startsWith("/app/map?") || requested.startsWith("/app/map#")) {
    return `/map${requested.slice("/app/map".length)}`;
  }
  return requested;
}

export function buildResidentMapPath(search: string, pathname = "/map") {
  const source = new URLSearchParams(search);
  const filter = normalizeResidentFilter(source.get("filter"));
  const target = new URLSearchParams({
    mode: source.get("mode") || "resident",
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
  if (typeof window === "undefined" || !isSafeFirstPartyPath(path)) return;
  window.sessionStorage.setItem("dp_auth_return_to", path);
}

export function consumeAuthReturnPath(fallback = DEFAULT_RESIDENT_MAP_PATH) {
  if (typeof window === "undefined") return fallback;
  const stored = window.sessionStorage.getItem("dp_auth_return_to");
  window.sessionStorage.removeItem("dp_auth_return_to");
  return isSafeFirstPartyPath(stored) ? stored : fallback;
}
