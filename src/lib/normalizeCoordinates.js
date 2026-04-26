export function toNumber(value) {
  if (value === null || value === undefined) return null;

  const parsed =
    typeof value === "string"
      ? Number.parseFloat(value.trim())
      : Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeCoordinates(entity) {
  if (!entity || typeof entity !== "object") return null;

  const lat = toNumber(
    entity.latitude ??
      entity.lat ??
      entity.location?.latitude ??
      entity.location?.lat
  );

  const lng = toNumber(
    entity.longitude ??
      entity.lng ??
      entity.lon ??
      entity.location?.longitude ??
      entity.location?.lng ??
      entity.location?.lon
  );

  if (lat === null || lng === null) return null;
  if (lat > 90 || lat < -90) return null;
  if (lng > 180 || lng < -180) return null;

  return {
    ...entity,
    lat,
    lng,
    latitude: lat,
    longitude: lng,
  };
}

export default normalizeCoordinates;
