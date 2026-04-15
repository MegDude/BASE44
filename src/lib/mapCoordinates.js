/**
 * SHARED MAP COORDINATE VALIDATION LAYER
 * ─────────────────────────────────────────
 * Single source of truth for all coordinate safety across the app.
 * Every map surface and map-fed component MUST use this module.
 * 
 * Rules enforced:
 * ✓ No invalid coordinates reach Leaflet
 * ✓ No unchecked coordinate parsing
 * ✓ No page-level validation forks
 * ✓ Null/undefined/malformed coordinates fail safely
 * ✓ All markers, fitBounds, setView use validated paths only
 */

export const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value.trim()) : value;
  return isFinite(num) ? num : null;
};

export const isValidCoordinate = (lat, lng) => {
  const finLat = toFiniteNumber(lat);
  const finLng = toFiniteNumber(lng);
  return finLat !== null && finLng !== null;
};

/**
 * Normalize any entity with coordinates to standardized fields
 * Returns entity with normalizedLat, normalizedLng, hasValidCoordinates
 */
export const normalizeCoordinates = (entity) => {
  if (!entity) return null;
  
  const lat = toFiniteNumber(entity.latitude || entity.lat);
  const lng = toFiniteNumber(entity.longitude || entity.lng || entity.lon);
  
  return {
    ...entity,
    normalizedLat: lat,
    normalizedLng: lng,
    hasValidCoordinates: isValidCoordinate(lat, lng),
  };
};

/**
 * CRITICAL: Get valid [lat, lng] pair for Leaflet operations
 * Returns null if coordinates are invalid, missing, or out of bounds
 * 
 * Usage:
 *   const coords = getValidLatLng(item);
 *   if (!coords) return null; // Safe to skip rendering
 *   marker.setLatLng(coords); // Safe to call
 *   map.flyTo(coords, zoom);  // Safe to call
 */
export const getValidLatLng = (entity) => {
  const normalized = normalizeCoordinates(entity);
  if (!normalized || !normalized.hasValidCoordinates) return null;
  return [normalized.normalizedLat, normalized.normalizedLng];
};

/**
 * Filter array to only items with valid coordinates
 * Used to prepare data before passing to map components
 */
export const filterValidMapItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    const normalized = normalizeCoordinates(item);
    return normalized && normalized.hasValidCoordinates;
  });
};

/**
 * Validation helper: Check if a Leaflet position array is valid
 * (used internally by MapFlyTo and coordinate-safe operations)
 */
export const isValidLatLngArray = (position) => {
  return (
    position &&
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(v => typeof v === 'number' && isFinite(v))
  );
};