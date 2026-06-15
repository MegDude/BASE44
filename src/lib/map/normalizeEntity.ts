import { validateCoordinate } from "./coordinateValidation";
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
  name: string;
  type: EntityCategory | string;
  category: string;
  latitude: number;
  longitude: number;
  coords: [number, number];
  image: string;
  pinKey: string;
  district: string;
  partnerType: PartnerType | string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  source?: string;
  brand?: string;
  raw?: Record<string, unknown>;
};

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
  return "venue";
}

export function normalizeEntity(entity: Record<string, unknown>, index = 0): NormalizedEntity | null {
  const coordinate = validateCoordinate(
    entity.latitude ?? entity.lat ?? (entity.coordinates as Record<string, unknown> | undefined)?.lat,
    entity.longitude ?? entity.lng ?? (entity.coordinates as Record<string, unknown> | undefined)?.lng,
  );
  if (!coordinate) return null;

  let type: string;
  try {
    type = resolveEntityType(entity);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return null;
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
    name: String(entity.name || "Downtown place"),
    type,
    category: String(entity.category || type),
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    coords: [coordinate.latitude, coordinate.longitude],
    image,
    pinKey: pin.label,
    district: String(entity.district || inferDistrict(entity)),
    partnerType: String(entity.partnerType || type),
    address: typeof entity.address === "string" ? entity.address : undefined,
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
