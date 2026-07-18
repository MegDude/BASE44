import { toFiniteNumber, validateCoordinate } from "./coordinateValidation";
import { assertImageMatchesEntityType, resolveEntityImage } from "./entityImageResolver";
import { resolveEntityPin } from "./entityPinResolver";
import { resolveEntityType } from "./entityTypeResolver";

export type EntityCategory =
  | "venue"
  | "restaurant"
  | "coffee"
  | "retail"
  | "wellness"
  | "property"
  | "listing"
  | "rental"
  | "residential"
  | "hotel"
  | "event"
  | "perk"
  | "offer"
  | "brand"
  | "civic"
  | "service"
  | "commercial"
  | "guide"
  | "journal"
  | "campaign"
  | "analytics"
  | "overlay";

export type PartnerType = "properties" | "hotels" | "venues" | "brands" | "civic" | "resident" | "platform";

export type NormalizedEntity = {
  id: string;
  title: string;
  name: string;
  kind: string;
  type: EntityCategory | string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
  coords: [number, number];
  image: string;
  pinKey: string;
  district: string;
  partnerType: PartnerType | string;
  phone?: string;
  email?: string;
  website?: string;
  source?: string;
  brand?: string;
  raw?: Record<string, unknown>;
};

type CoordinateLike =
  | [unknown, unknown]
  | {
      lat?: unknown;
      lng?: unknown;
      latitude?: unknown;
      longitude?: unknown;
    }
  | null
  | undefined;

function readCoordinateLike(value: CoordinateLike): { latitude: unknown; longitude: unknown } | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return { latitude: value[0], longitude: value[1] };
  }
  return {
    latitude: value.latitude ?? value.lat,
    longitude: value.longitude ?? value.lng,
  };
}

function readEntityCoordinates(entity: Record<string, unknown>): { latitude: unknown; longitude: unknown } | null {
  const direct = {
    latitude: entity.latitude ?? entity.lat,
    longitude: entity.longitude ?? entity.lng,
  };
  if (toFiniteNumber(direct.latitude) !== null && toFiniteNumber(direct.longitude) !== null) return direct;

  const coordinates = readCoordinateLike(entity.coordinates as CoordinateLike);
  if (coordinates && toFiniteNumber(coordinates.latitude) !== null && toFiniteNumber(coordinates.longitude) !== null) {
    return coordinates;
  }

  const coords = readCoordinateLike(entity.coords as CoordinateLike);
  if (coords && toFiniteNumber(coords.latitude) !== null && toFiniteNumber(coords.longitude) !== null) return coords;

  const location = readCoordinateLike(entity.location as CoordinateLike);
  if (location && toFiniteNumber(location.latitude) !== null && toFiniteNumber(location.longitude) !== null) return location;

  const geometry = entity.geometry as { location?: CoordinateLike } | undefined;
  const geometryLocation = readCoordinateLike(geometry?.location);
  if (
    geometryLocation &&
    toFiniteNumber(geometryLocation.latitude) !== null &&
    toFiniteNumber(geometryLocation.longitude) !== null
  ) {
    return geometryLocation;
  }

  return null;
}

function isSourceInventoryOnly(entity: Record<string, unknown>): boolean {
  const text = [
    entity.source,
    entity.sourceType,
    entity.datasetStatus,
    entity.importStatus,
    entity.visibilityMode,
    entity.status,
    Array.isArray(entity.tags) ? entity.tags.join(" ") : entity.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("google_maps_list") ||
    text.includes("browser_seed") ||
    text.includes("needs-google-places-enrichment") ||
    text.includes("source inventory") ||
    text.includes("source_inventory")
  );
}

function slug(value: unknown, fallback: string): string {
  const cleaned = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || fallback;
}

function inferDistrict(entity: Record<string, unknown>): string {
  const haystack = [entity.name, entity.address, entity.category, entity.source].filter(Boolean).join(" ").toLowerCase();
  if (haystack.includes("rainey")) return "Rainey";
  if (haystack.includes("seaholm")) return "Seaholm";
  if (haystack.includes("6th")) return "West 6th";
  if (haystack.includes("congress")) return "Congress";
  if (haystack.includes("red river")) return "Red River";
  if (haystack.includes("warehouse")) return "Warehouse District";
  if (haystack.includes("2nd")) return "2nd Street";
  if (haystack.includes("lake")) return "Lady Bird Lake";
  if (haystack.includes("east")) return "East Downtown";
  return "Downtown Austin";
}

function inferType(entity: Record<string, unknown>): string {
  const text = [entity.type, entity.entityType, entity.category, entity.category_key, entity.partnerType, entity.name, entity.subcategory]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const hasResidentialSource =
    text.includes("luxury_presence") ||
    text.includes("legends") ||
    text.includes("mls") ||
    text.includes("residential property") ||
    text.includes("condominium") ||
    text.includes("apartment") ||
    text.includes(" for sale") ||
    text.includes(" for rent");
  const hasVenueSignal =
    text.includes("venue") ||
    text.includes("restaurant") ||
    text.includes("bar") ||
    text.includes("nightlife") ||
    text.includes("live music") ||
    text.includes("music venue") ||
    text.includes("cocktail") ||
    text.includes("coffee") ||
    text.includes("retail") ||
    text.includes("store");
  if (text.includes("hotel") || text.includes("hospitality")) return "hotel";
  if (text.includes("rental") || text.includes("leasing")) return "rental";
  if (text.includes("wellness") || text.includes("bathhouse") || text.includes("sauna") || text.includes("cold plunge") || text.includes("massage")) return "wellness";
  if (hasResidentialSource && !hasVenueSignal) return text.includes("listing") || text.includes("mls") || text.includes(" for sale") || text.includes(" for rent") ? "listing" : "property";
  if (text.includes("event") || text.includes("activation")) return "event";
  if (text.includes("offer") || text.includes("perk") || text.includes("inkind")) return "perk";
  if (text.includes("brand")) return "brand";
  if (text.includes("civic") || text.includes("public")) return "civic";
  if (text.includes("service")) return "service";
  if (text.includes("coffee") || text.includes("cafe")) return "coffee";
  if (text.includes("restaurant") || text.includes("dining")) return "restaurant";
  if (text.includes("retail") || text.includes("store") || text.includes("shop")) return "retail";
  if (hasVenueSignal) return "venue";
  if (text.includes("journal")) return "journal";
  if (text.includes("guide")) return "guide";
  return "property";
}

export function createFallbackEntity(entity: Record<string, unknown> = {}, index = 0): NormalizedEntity {
  const title = String(entity.title || entity.name || entity.address || entity.id || `Downtown property ${index + 1}`);
  const latitude = Number(entity.latitude ?? entity.lat) || 30.2672;
  const longitude = Number(entity.longitude ?? entity.lng) || -97.7431;
  const fallback = {
    ...entity,
    id: entity.id || title,
    name: title,
    title,
    type: "property",
    kind: "property",
    category: entity.category || "Property",
    latitude,
    longitude,
    address: String(entity.address || "Downtown Austin"),
    district: entity.district || inferDistrict(entity),
  };
  const pin = resolveEntityPin(fallback);
  const image = resolveEntityImage(fallback);

  return {
    id: slug(fallback.id, `entity-${index}`),
    title,
    name: title,
    kind: "property",
    type: "property",
    category: String(fallback.category || "Property"),
    address: String(fallback.address),
    lat: latitude,
    lng: longitude,
    latitude,
    longitude,
    coords: [latitude, longitude],
    image,
    pinKey: pin.label,
    district: String(fallback.district || "Downtown Austin"),
    partnerType: String(entity.partnerType || "properties"),
    source: typeof entity.source === "string" ? entity.source : "fallback",
    raw: entity,
  };
}

export function normalizeEntity(entity: Record<string, unknown>, index = 0): NormalizedEntity | null {
  if (entity.sourceType === "launch_map" && entity.hasExactMarker === false) {
    const type = String(entity.type || entity.kind || inferType(entity));
    const pin = resolveEntityPin({ ...entity, type });
    const image = resolveEntityImage({ ...entity, type });
    return {
      id: slug(entity.id, `entity-${index}`),
      title: String(entity.title || entity.name || entity.address || `Downtown launch listing ${index + 1}`),
      name: String(entity.name || entity.title || entity.address || `Downtown launch listing ${index + 1}`),
      kind: type,
      type,
      category: String(entity.category || type),
      address: typeof entity.address === "string" ? entity.address : "",
      lat: undefined as unknown as number,
      lng: undefined as unknown as number,
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
      coords: [] as unknown as [number, number],
      image,
      pinKey: pin.label,
      district: String(entity.district || inferDistrict(entity)),
      partnerType: String(entity.partnerType || type),
      phone: typeof entity.contact_phone === "string" ? entity.contact_phone : typeof entity.phone === "string" ? entity.phone : undefined,
      email: typeof entity.contact_email === "string" ? entity.contact_email : typeof entity.email === "string" ? entity.email : undefined,
      website: typeof entity.website === "string" ? entity.website : undefined,
      source: typeof entity.source === "string" ? entity.source : undefined,
      brand: typeof entity.brand === "string" ? entity.brand : undefined,
      raw: entity,
    };
  }

  const rawCoordinate = readEntityCoordinates(entity);
  if (!rawCoordinate) {
    return isSourceInventoryOnly(entity) ? null : createFallbackEntity(entity, index);
  }

  const coordinate = validateCoordinate(rawCoordinate.latitude, rawCoordinate.longitude);
  if (!coordinate) {
    return isSourceInventoryOnly(entity) ? null : createFallbackEntity(entity, index);
  }

  let type: string;
  try {
    type = resolveEntityType(entity);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    type = "property";
  }
  if (!type) type = String(entity.type || inferType(entity));
  const normalizedBase = {
    ...entity,
    type,
    district: entity.district || inferDistrict(entity),
  };
  const pin = resolveEntityPin(normalizedBase);
  const image = resolveEntityImage(normalizedBase);
  if (import.meta.env.DEV) {
    assertImageMatchesEntityType(type, image);
  }

  return {
    id: slug(entity.id, `entity-${index}`),
    title: String(entity.title || entity.name || entity.address || `Downtown property ${index + 1}`),
    name: String(entity.name || entity.title || entity.address || `Downtown property ${index + 1}`),
    kind: type,
    type,
    category: String(entity.category || type),
    address: typeof entity.address === "string" ? entity.address : "Downtown Austin",
    lat: coordinate.latitude,
    lng: coordinate.longitude,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    coords: [coordinate.latitude, coordinate.longitude],
    image,
    pinKey: pin.label,
    district: String(entity.district || inferDistrict(entity)),
    partnerType: String(entity.partnerType || type),
    phone: typeof entity.contact_phone === "string" ? entity.contact_phone : typeof entity.phone === "string" ? entity.phone : undefined,
    email: typeof entity.contact_email === "string" ? entity.contact_email : typeof entity.email === "string" ? entity.email : undefined,
    website: typeof entity.website === "string" ? entity.website : undefined,
    source: typeof entity.source === "string" ? entity.source : undefined,
    brand: typeof entity.brand === "string" ? entity.brand : undefined,
    raw: entity,
  };
}

export function normalizeEntities(entities: Array<Record<string, unknown>>): NormalizedEntity[] {
  return entities.map((entity, index) => normalizeEntity(entity, index)).filter(Boolean) as NormalizedEntity[];
}
