export function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function normalizeCoordinates(input) {
  if (!input) return null;

  const lat = toFiniteNumber(input.lat ?? input.latitude);
  const lng = toFiniteNumber(input.lng ?? input.longitude);

  if (!isValidCoordinate(lat, lng)) return null;

  return { lat, lng };
}
