import type { MapEntity } from "../../data/map/mapEntitySchema";

declare const process: {
  env: Record<string, string | undefined>;
};

export interface GooglePlacesEnrichment {
  googlePlaceId?: string;
  googleCid?: string;
  title?: string;
  address?: string;
  lat?: number;
  lng?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  priceLabel?: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  imageUrl?: string;
  openingHours?: string[];
  photoReference?: string;
}

export function assertServerGoogleMapsKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is required for Google Places enrichment.");
  }
  return key;
}

export async function enrichEntityWithGooglePlaces(entity: MapEntity): Promise<GooglePlacesEnrichment | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const query = [entity.title, entity.address || "Austin TX"].filter(Boolean).join(" ");
  const searchUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  searchUrl.searchParams.set("input", query);
  searchUrl.searchParams.set("inputtype", "textquery");
  searchUrl.searchParams.set("fields", "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,business_status,types");
  searchUrl.searchParams.set("key", key);

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`Google Places lookup failed for ${entity.title}: ${response.status}`);
  }
  const payload = await response.json();
  const candidate = payload?.candidates?.[0];
  if (!candidate?.place_id) return null;

  const detailsUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  detailsUrl.searchParams.set("place_id", candidate.place_id);
  detailsUrl.searchParams.set("fields", "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,formatted_phone_number,website,url,opening_hours,photos,types");
  detailsUrl.searchParams.set("key", key);
  const detailsResponse = await fetch(detailsUrl);
  if (!detailsResponse.ok) {
    throw new Error(`Google Places details failed for ${entity.title}: ${detailsResponse.status}`);
  }
  const result = (await detailsResponse.json())?.result;
  if (!result) return null;
  const photoReference = result.photos?.[0]?.photo_reference;
  return {
    googlePlaceId: result.place_id,
    title: result.name,
    address: result.formatted_address,
    lat: result.geometry?.location?.lat,
    lng: result.geometry?.location?.lng,
    rating: result.rating,
    reviewCount: result.user_ratings_total,
    priceLabel: typeof result.price_level === "number" ? "$".repeat(Math.max(1, result.price_level)) : undefined,
    phone: result.formatted_phone_number,
    website: result.website,
    googleMapsUrl: result.url,
    openingHours: result.opening_hours?.weekday_text,
    photoReference,
    imageUrl: photoReference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoReference}&key=${key}`
      : undefined,
  };
}
