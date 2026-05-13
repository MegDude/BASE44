export function toFiniteNumber(value) {
  const n = typeof value === 'string' ? Number(value.trim()) : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isValidCoordinate(lat, lng) {
  const la = toFiniteNumber(lat);
  const lo = toFiniteNumber(lng);
  if (la === null || lo === null) return false;
  if (la < -90 || la > 90) return false;
  if (lo < -180 || lo > 180) return false;
  return true;
}

export function normalizeCoordinates(entity) {
  if (!entity || typeof entity !== 'object') return null;
  const lat = toFiniteNumber(
    entity.latitude ?? entity.lat ?? entity.location?.latitude ?? entity.location?.lat
  );
  const lng = toFiniteNumber(
    entity.longitude ?? entity.lng ?? entity.lon ?? entity.location?.longitude ?? entity.location?.lng ?? entity.location?.lon
  );
  if (!isValidCoordinate(lat, lng)) return null;
  return { ...entity, lat, lng, latitude: lat, longitude: lng };
}
