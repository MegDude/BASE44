export const DEFAULT_RESIDENT_MAP_PATH = "/app/map?mode=resident&tab=map&filter=All";

const PRESERVED_MAP_KEYS = [
  "mode",
  "tab",
  "filter",
  "intent",
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

export function isSafeFirstPartyPath(value?: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(value));
}

export function getSafeReturnPath(search: string, fallback = DEFAULT_RESIDENT_MAP_PATH) {
  const requested = new URLSearchParams(search).get("returnTo");
  return isSafeFirstPartyPath(requested) ? requested : fallback;
}

export function buildResidentMapPath(search: string, pathname = "/app/map") {
  const source = new URLSearchParams(search);
  const target = new URLSearchParams({
    mode: source.get("mode") || "resident",
    tab: source.get("tab") || "map",
    filter: source.get("filter") || "All",
  });

  PRESERVED_MAP_KEYS.forEach((key) => {
    if (["mode", "tab", "filter"].includes(key)) return;
    const value = source.get(key);
    if (value) target.set(key, value);
  });

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
