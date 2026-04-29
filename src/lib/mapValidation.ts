/**
 * Map Coordinate and Entity Validation
 * Prevents NaN errors and ensures only valid entities are rendered
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Strict coordinate validation
 * Returns true only if both lat/lng are valid finite numbers within geographic bounds
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  const normalizedLat = toFiniteNumber(lat);
  const normalizedLng = toFiniteNumber(lng);
  if (normalizedLat === null || normalizedLng === null) return false;
  return normalizedLat >= -90 && normalizedLat <= 90 && normalizedLng >= -180 && normalizedLng <= 180;
}

/**
 * Validate a coordinate location object
 */
export function validateCoordinateLocation(location: {
  latitude?: unknown;
  longitude?: unknown;
  valid?: unknown;
}): boolean {
  return isValidCoordinate(location?.latitude, location?.longitude);
}

/**
 * Sanitize latitude/longitude to prevent NaN propagation
 * Returns valid coordinates or fallback center
 */
export function sanitizeCoordinates(
  lat: unknown,
  lng: unknown,
  fallback: [number, number] = [30.267, -97.743]
): [number, number] {
  if (isValidCoordinate(lat, lng)) {
    return [lat as number, lng as number];
  }
  return fallback;
}

export function getValidLatLng(entity: {
  lat?: unknown;
  lng?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  location?: { latitude?: unknown; longitude?: unknown };
}): [number, number] | null {
  const lat = toFiniteNumber(entity?.location?.latitude ?? entity?.latitude ?? entity?.lat);
  const lng = toFiniteNumber(entity?.location?.longitude ?? entity?.longitude ?? entity?.lng);

  if (!isValidCoordinate(lat, lng)) return null;
  return [lat as number, lng as number];
}

/**
 * Validate entity location before rendering
 * Throws error if location is invalid (fail-fast approach)
 */
export function assertValidLocation(
  entityId: string,
  lat: unknown,
  lng: unknown
): void {
  if (!isValidCoordinate(lat, lng)) {
    console.error(
      `Invalid location for entity ${entityId}: lat=${lat}, lng=${lng}`
    );
    throw new Error(
      `Entity ${entityId} has invalid coordinates: [${lat}, ${lng}]`
    );
  }
}

/**
 * Filter array of entities to only include those with valid coordinates
 */
export function filterValidEntities<T extends { location?: { latitude?: unknown; longitude?: unknown } }>(
  entities: T[]
): T[] {
  return entities.filter(entity => {
    if (!entity.location) return false;
    return isValidCoordinate(entity.location.latitude, entity.location.longitude);
  });
}

/**
 * Batch validate multiple coordinate pairs
 */
export function validateCoordinateBatch(
  coordinates: Array<[unknown, unknown]>
): ValidationResult {
  const errors: string[] = [];

  coordinates.forEach((coords, index) => {
    if (!isValidCoordinate(coords[0], coords[1])) {
      errors.push(
        `Index ${index}: Invalid coordinates [${coords[0]}, ${coords[1]}]`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate map center (array-based format used in Leaflet)
 */
export function isValidMapCenter(center: unknown): center is [number, number] {
  return (
    Array.isArray(center) &&
    center.length === 2 &&
    isValidCoordinate(center[0], center[1])
  );
}

/**
 * Ensure map center is always valid for rendering
 */
export function getValidMapCenter(
  center: unknown,
  fallback: [number, number] = [30.267, -97.743]
): [number, number] {
  if (isValidMapCenter(center)) {
    return center;
  }
  return fallback;
}
