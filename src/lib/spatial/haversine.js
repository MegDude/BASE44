const EARTH_RADIUS_METERS = 6371000;

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function haversineDistanceMeters(a, b) {
  const lat1 = toRadians(a.lat ?? a.latitude);
  const lat2 = toRadians(b.lat ?? b.latitude);
  const deltaLat = toRadians((b.lat ?? b.latitude) - (a.lat ?? a.latitude));
  const deltaLng = toRadians((b.lng ?? b.longitude) - (a.lng ?? a.longitude));
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function filterWithinRadius(entities, center, radiusMeters = 400) {
  return (entities || []).filter((entity) => haversineDistanceMeters(center, entity) <= radiusMeters);
}

