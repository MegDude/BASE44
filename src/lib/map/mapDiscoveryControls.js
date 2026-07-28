const DISCOVERY_CONTROL_FILTERS = new Set([
  "all",
  "featured",
  "nearby",
  "open now",
  "tonight",
  "walkable",
  "this week",
]);

const DISCOVERY_CONTROL_QUERIES = new Set([
  "all",
  "featured",
  "nearby",
  "near me",
  "open now",
  "tonight",
  "walkable",
  "this week",
]);

function normalizeControlValue(value = "") {
  return String(value || "").trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
}

export function isDiscoveryControlFilter(filter = "") {
  return DISCOVERY_CONTROL_FILTERS.has(normalizeControlValue(filter));
}

export function normalizeDiscoveryControlQuery(query = "", filter = "") {
  const normalizedQuery = String(query || "").trim();
  const queryKey = normalizeControlValue(normalizedQuery);
  const filterKey = normalizeControlValue(filter);
  if (DISCOVERY_CONTROL_QUERIES.has(queryKey)) return "";
  if (DISCOVERY_CONTROL_FILTERS.has(filterKey) && queryKey === filterKey) return "";
  return normalizedQuery;
}

