/**
 * utilityPinGating.js
 *
 * Pecan Street Plumbing & Utility/Service Pin Culling Architecture
 * Spec: `utility-pin-cull`
 *
 * Establishes spatial gating for utility and service-based entities.
 * These pins are culled from the default ambient map view and only
 * surfaced when a user explicitly queries them or activates a matching
 * search console filter.
 *
 * The primary classification logic lives in Map.jsx (isUtilityServiceEntity,
 * isLocalServiceEntity, isSearchOnlyRuntimeUtility). This module provides
 * the canonical evaluatePinVisibility API that MapController and any future
 * map layer renderers should call before mounting markers to the canvas.
 */

/**
 * Utility / service category detection.
 * Mirrors the patterns in isUtilityServiceEntity (Map.jsx) so this module
 * can operate independently without importing the monolith.
 *
 * @param {object} place
 * @returns {boolean}
 */
function isUtilityOrServicePlace(place) {
  if (!place) return false;

  const category = String(place.category || place.raw?.category || "").toLowerCase();
  // "Local Service / Plumbing", "Local Service / Roofing", etc.
  if (category.startsWith("local service")) return true;

  const type = String(place.type || place.kind || place.raw?.kind || "").toLowerCase();
  if (type === "utility" || type === "service" || type === "plumbing") return true;

  const text = [
    place.name,
    place.title,
    category,
    type,
    place.category_key,
    ...(place.tags || []),
    ...(place.searchKeywords || []),
    ...(place.raw?.tags || []),
    ...(place.raw?.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    /\b(plumb|plumbing|plumber|pipe|drain|water heater|leak)\b/.test(text) ||
    /\b(repair|restoration|water damage|roofing|roofer|contractor|hvac|electrician)\b/.test(text) ||
    /\b(print|printing|fedex|copies|copy shop)\b/.test(text) ||
    /\b(cleaner|cleaners|dry clean|dry cleaning)\b/.test(text) ||
    /\b(shipping|mail|package|ups|post office)\b/.test(text) ||
    /\b(municipal|maintenance|utility|concierge)\b/.test(text)
  );
}

/**
 * Determines whether a map marker should be visible and interactive
 * given the current search query and active filter set.
 *
 * Rule 1 — Ambient culling (default state):
 *   Utility / service pins are hidden unless explicitly triggered.
 *
 * Rule 2 — Explicit search query match:
 *   Pin becomes visible if the user's search query matches the place name
 *   or category.
 *
 * Rule 3 — Search console filter activation:
 *   Selecting "Services" or "Utilities" from the filter rail unlocks
 *   the corresponding hidden pins for the duration of the active session.
 *
 * @param {object}      place          - Place / entity data object
 * @param {Set<string>} currentFilters - Currently active filter labels
 * @param {string}      searchQuery    - Current search bar input value
 * @returns {{ visible: boolean, interactive: boolean, opacity: number }}
 */
export function evaluatePinVisibility(place, currentFilters, searchQuery) {
  if (!isUtilityOrServicePlace(place)) {
    // Standard non-utility place: follow normal display rules.
    return { visible: true, interactive: true, opacity: 1 };
  }

  // Rule 2: explicit search query match
  const query = String(searchQuery || "").trim().toLowerCase();
  const matchesQuery =
    query.length > 0 &&
    (
      String(place.name || "").toLowerCase().includes(query) ||
      String(place.category || "").toLowerCase().includes(query) ||
      String(place.type || "").toLowerCase().includes(query) ||
      (place.searchKeywords || []).some((kw) => String(kw).toLowerCase().includes(query))
    );

  // Rule 3: active search console filter match
  const filters = currentFilters instanceof Set ? currentFilters : new Set(currentFilters || []);
  const matchesFilter =
    filters.has("Services") ||
    filters.has("Utilities") ||
    filters.has("Local Services");

  const shouldShow = Boolean(matchesQuery || matchesFilter);

  return {
    visible: shouldShow,
    interactive: shouldShow,
    opacity: shouldShow ? 1 : 0,
  };
}

/**
 * Applies the gating state to a Google Maps Marker or AdvancedMarkerElement.
 * Call this inside the marker rendering loop before or after mounting.
 *
 * Usage (Map.jsx marker loop):
 *   markers.forEach((marker) => {
 *     const place = marker.get("placeData");
 *     applyPinGating(marker, place, activeFilters, currentSearchQuery, mapInstance);
 *   });
 *
 * @param {google.maps.Marker} marker
 * @param {object}             place
 * @param {Set<string>}        currentFilters
 * @param {string}             searchQuery
 * @param {google.maps.Map}    mapInstance
 */
export function applyPinGating(marker, place, currentFilters, searchQuery, mapInstance) {
  const { visible } = evaluatePinVisibility(place, currentFilters, searchQuery);
  marker.setVisible(visible);
  if (!visible) {
    marker.setMap(null);
  } else if (marker.getMap() !== mapInstance) {
    marker.setMap(mapInstance);
  }
}
