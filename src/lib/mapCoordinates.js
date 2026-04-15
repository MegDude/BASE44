/**
 * Shared coordinate validation and normalization utility
 * Prevents NaN/invalid LatLng objects from reaching Leaflet
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

export const getValidLatLng = (entity) => {
  const normalized = normalizeCoordinates(entity);
  if (!normalized || !normalized.hasValidCoordinates) return null;
  return [normalized.normalizedLat, normalized.normalizedLng];
};

export const filterValidMapItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    const normalized = normalizeCoordinates(item);
    return normalized && normalized.hasValidCoordinates;
  });
};