export const GOOGLE_MAPS_INTELLIGENCE_PHASE_2 = {
  status: "roadmap",
  cacheTtlHours: 24,
  sources: [
    "Google Places Details",
    "Google Nearby Search",
    "Opening Hours",
    "Reviews",
    "Ratings",
    "Photo Metadata",
  ],
  outputs: [
    "Popular Nearby",
    "Open Now",
    "Trending Tonight",
    "Residential Nearby",
    "Hotel Traffic Nearby",
    "Event Traffic Nearby",
    "Dining Cluster Nearby",
  ],
} as const;

export type GooglePlaceLookupInput = {
  placeId?: string;
  query?: string;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
};

export async function getPlaceDetails(_input: GooglePlaceLookupInput) {
  return null;
}

export async function getNearbyPlaces(_input: GooglePlaceLookupInput) {
  return [];
}

export async function getOpeningHours(_input: GooglePlaceLookupInput) {
  return null;
}

export async function getPopularTimes(_input: GooglePlaceLookupInput) {
  return null;
}

export async function getReviews(_input: GooglePlaceLookupInput) {
  return [];
}

export async function getPhotos(_input: GooglePlaceLookupInput) {
  return [];
}
