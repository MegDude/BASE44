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

/* =========================================================
   SAFE NUMBER PARSING
========================================================= */

export const toFiniteNumber = (value) => {
  if (value === null || value === undefined) return null;

  const num =
    typeof value === "string"
      ? parseFloat(value.trim())
      : Number(value);

  return isFinite(num) ? num : null;
};

/* =========================================================
   CORE VALIDATION (UPDATED)
========================================================= */

export const isValidCoordinate = (lat, lng) => {
  const finLat = toFiniteNumber(lat);
  const finLng = toFiniteNumber(lng);

  // 🚨 Must be valid numbers
  if (finLat === null || finLng === null) return false;

  // 🚨 Must be within Earth bounds
  if (finLat < -90 || finLat > 90) return false;
  if (finLng < -180 || finLng > 180) return false;

  return true;
};

/* =========================================================
   NORMALIZATION
========================================================= */

/**
 * Normalize any entity with coordinates
 * Returns consistent internal structure
 */
export const normalizeCoordinates = (entity) => {
  if (!entity) return null;

  const lat = toFiniteNumber(
    entity.latitude ??
      entity.lat ??
      entity.location?.latitude ??
      entity.location?.lat ??
      entity.coordinates?.latitude ??
      entity.coordinates?.lat
  );
  const lng = toFiniteNumber(
    entity.longitude ??
      entity.lng ??
      entity.lon ??
      entity.location?.longitude ??
      entity.location?.lng ??
      entity.location?.lon ??
      entity.coordinates?.longitude ??
      entity.coordinates?.lng ??
      entity.coordinates?.lon
  );

  const isValid = isValidCoordinate(lat, lng);

  return {
    ...entity,
    latitude: isValid ? lat : entity.latitude ?? entity.lat ?? null,
    longitude: isValid ? lng : entity.longitude ?? entity.lng ?? entity.lon ?? null,
    lat: isValid ? lat : entity.lat ?? entity.latitude ?? null,
    lng: isValid ? lng : entity.lng ?? entity.longitude ?? null,
    normalizedLat: isValid ? lat : null,
    normalizedLng: isValid ? lng : null,
    hasValidCoordinates: isValid,
  };
};

/* =========================================================
   LEAFLET-SAFE OUTPUT
========================================================= */

/**
 * Get safe [lat, lng] for Leaflet
 * Returns null if invalid
 */
export const getValidLatLng = (entity) => {
  const normalized = normalizeCoordinates(entity);

  if (!normalized || !normalized.hasValidCoordinates) {
    return null;
  }

  return [normalized.normalizedLat, normalized.normalizedLng];
};

/* =========================================================
   COLLECTION HELPERS
========================================================= */

/**
 * Filter only valid map items
 */
export const filterValidMapItems = (items) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    const normalized = normalizeCoordinates(item);
    return normalized && normalized.hasValidCoordinates;
  });
};

/* =========================================================
   LOW-LEVEL VALIDATION
========================================================= */

/**
 * Validate Leaflet position array
 */
export const isValidLatLngArray = (position) => {
  return (
    position &&
    Array.isArray(position) &&
    position.length === 2 &&
    position.every(
      (v) => typeof v === "number" && isFinite(v)
    )
  );
};
