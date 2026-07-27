export type CoordinateValidationResult = {
  latitude: number;
  longitude: number;
  valid: boolean;
};

export const AUSTIN_AREA_BOUNDS = {
  north: 30.55,
  south: 30.05,
  west: -98.05,
  east: -97.45,
} as const;

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function isValidCoordinate(latitude: unknown, longitude: unknown): boolean {
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);
  return (
    lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function isWithinAustinArea(latitude: unknown, longitude: unknown): boolean {
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);
  if (!isValidCoordinate(lat, lng) || lat === null || lng === null) return false;

  return (
    lat >= AUSTIN_AREA_BOUNDS.south &&
    lat <= AUSTIN_AREA_BOUNDS.north &&
    lng >= AUSTIN_AREA_BOUNDS.west &&
    lng <= AUSTIN_AREA_BOUNDS.east
  );
}

export function validateCoordinate(latitude: unknown, longitude: unknown): CoordinateValidationResult | null {
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);

  if (!isValidCoordinate(lat, lng) || lat === null || lng === null) {
    if (import.meta.env.DEV) {
      console.warn("[CoordinateValidation] Invalid coordinate", { latitude, longitude });
    }
    return null;
  }

  return { latitude: lat, longitude: lng, valid: true };
}
