const AUSTIN_CENTER = [30.267, -97.743];
const WALKING_RADIUS_DEG = 0.018; // ~2km / ~5-min walk

/**
 * Smart filter: walking distance (~5 min walk radius)
 */
export function isWalkingDistance(item) {
  const lat = item.normalizedLat || item.latitude;
  const lng = item.normalizedLng || item.longitude;
  if (lat === null || lng === null) return false;
  const dlat = lat - AUSTIN_CENTER[0];
  const dlng = lng - AUSTIN_CENTER[1];
  return Math.sqrt(dlat * dlat + dlng * dlng) <= WALKING_RADIUS_DEG;
}

/**
 * Smart filter: free perks detection
 */
export function hasFreePerks(item) {
  const text = `${item.perk_description || ""} ${item.perk_value || ""}`.toLowerCase();
  return (
    text.includes("free") ||
    text.includes("complimentary") ||
    text.includes("on us") ||
    text.includes("no charge")
  );
}

/**
 * Smart filter: event-based venue detection
 */
export function isEventBased(item) {
  const EVENT_CATEGORIES = ["entertainment", "bar", "fitness", "wellness"];
  return EVENT_CATEGORIES.includes(item.category);
}

/**
 * Filter venues by category, search query, and smart filters
 */
export function filterVenues(venues, { category = "all", query = "", smartFilters = {} }) {
  return venues.filter((v) => {
    if (category !== "all" && category !== "building" && v.category !== category)
      return false;
    if (category === "building") return false;
    if (
      query &&
      !`${v.name} ${v.category} ${v.address} ${v.perk_description}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
      return false;
    if (smartFilters.walking && !isWalkingDistance(v)) return false;
    if (smartFilters.freePerks && !hasFreePerks(v)) return false;
    if (smartFilters.eventBased && !isEventBased(v)) return false;
    return true;
  });
}

/**
 * Filter buildings by search query and smart filters
 */
export function filterBuildings(buildings, { query = "", smartFilters = {} }) {
  return buildings.filter((b) => {
    if (query && !`${b.name} ${b.address} ${b.developer}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    if (smartFilters.walking && !isWalkingDistance(b)) return false;
    return true;
  });
}

/**
 * Filter events by category, search query
 */
export function filterEvents(events, { category = "all", query = "" }) {
  return events.filter((e) => {
    if (category !== "all" && e.category !== category) return false;
    if (query && !`${e.title} ${e.venue_name} ${e.address} ${e.category}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });
}