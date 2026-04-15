/**
 * Map Coordinate and Entity Validation
 * Prevents NaN errors and ensures only valid entities are rendered
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Strict coordinate validation
 * Returns true only if both lat/lng are valid finite numbers within geographic bounds
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  // Check if both exist and are numbers
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }

  // Check for NaN
  if (isNaN(lat) || isNaN(lng)) {
    return false;
  }

  // Check for Infinity
  if (!isFinite(lat) || !isFinite(lng)) {
    return false;
  }

  // Validate geographic bounds (approximate Austin area with margin)
  // Austin is around 30.27°N, 97.74°W
  const latValid = lat >= 29.5 && lat <= 30.8;
  const lngValid = lng >= -98.5 && lng <= -97.2;

  return latValid && lngValid;
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