export type CoordinateValidationResult = {
  latitude: number;
  longitude: number;
  valid: boolean;
};

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
  return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function validateCoordinate(latitude: unknown, longitude: unknown): CoordinateValidationResult | null {
  const lat = toFiniteNumber(latitude);
  const lng = toFiniteNumber(longitude);

  if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    if (import.meta.env.DEV) {
      console.warn("[CoordinateValidation] Invalid coordinate", { latitude, longitude });
    }
    return null;
  }

  return { latitude: lat, longitude: lng, valid: true };
}
