export type PlacesSearchRequest = {
  query: string;
  location?: { lat: number; lng: number };
  radiusMeters?: number;
};

export function createPlacesTextSearchRequest(request: PlacesSearchRequest): Record<string, unknown> {
  return {
    query: request.query,
    location: request.location,
    radius: request.radiusMeters,
  };
}
