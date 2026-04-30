export function toFiniteNumber(value) {
  if (value === null || value === undefined) return null;
  const next =
    typeof value === "string"
      ? Number.parseFloat(value.trim())
      : Number(value);
  return Number.isFinite(next) ? next : null;
}

export function isValidCoordinate(lat, lng) {
  const nextLat = toFiniteNumber(lat);
  const nextLng = toFiniteNumber(lng);
  return (
    nextLat !== null &&
    nextLng !== null &&
    nextLat >= -90 &&
    nextLat <= 90 &&
    nextLng >= -180 &&
    nextLng <= 180
  );
}

export function getValidLatLng(entity) {
  const lat = toFiniteNumber(
    entity?.location?.latitude ?? entity?.latitude ?? entity?.lat ?? entity?.metadata?.latitude
  );
  const lng = toFiniteNumber(
    entity?.location?.longitude ?? entity?.longitude ?? entity?.lng ?? entity?.lon ?? entity?.metadata?.longitude
  );

  if (!isValidCoordinate(lat, lng)) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
      console.warn("Skipping invalid coordinates", {
        id: entity?.id || entity?.entity_id,
        name: entity?.name || entity?.title,
        lat,
        lng,
      });
    }
    return null;
  }

  return { lat, lng };
}
