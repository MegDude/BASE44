import { validateCoordinate } from "./coordinateValidation";
import { resolveEntityImage } from "./entityImageResolver";
import { resolveEntityPin } from "./entityPinResolver";

export type EntityCategory =
  | "venue"
  | "property"
  | "residential"
  | "hotel"
  | "event"
  | "offer"
  | "brand"
  | "civic"
  | "service"
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
  const text = [entity.type, entity.category, entity.category_key, entity.partnerType, entity.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("hotel") || text.includes("hospitality")) return "hotel";
  if (text.includes("property") || text.includes("building")) return "property";
  if (text.includes("resident") || text.includes("apartment")) return "residential";
  if (text.includes("event") || text.includes("activation")) return "event";
  if (text.includes("offer") || text.includes("perk") || text.includes("inkind")) return "offer";
  if (text.includes("brand")) return "brand";
  if (text.includes("civic") || text.includes("public")) return "civic";
  if (text.includes("service")) return "service";
  if (text.includes("journal")) return "journal";
  if (text.includes("guide")) return "guide";
  return "venue";
}

export function normalizeEntity(entity: Record<string, unknown>, index = 0): NormalizedEntity | null {
  const coordinate = validateCoordinate(entity.latitude, entity.longitude);
  if (!coordinate) return null;

  const type = String(entity.type || inferType(entity));
  const normalizedBase = {
    ...entity,
    type,
    district: entity.district || inferDistrict(entity),
  };
  const pin = resolveEntityPin(normalizedBase);

  return {
    id: slug(entity.id, `entity-${index}`),
    name: String(entity.name || "Downtown place"),
    type,
    category: String(entity.category || type),
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    coords: [coordinate.latitude, coordinate.longitude],
    image: resolveEntityImage(normalizedBase),
    pinKey: pin.label,
    district: String(entity.district || inferDistrict(entity)),
    partnerType: String(entity.partnerType || type),
    address: typeof entity.address === "string" ? entity.address : undefined,
    source: typeof entity.source === "string" ? entity.source : undefined,
    brand: typeof entity.brand === "string" ? entity.brand : undefined,
    raw: entity,
  };
}

export function normalizeEntities(entities: Array<Record<string, unknown>>): NormalizedEntity[] {
  return entities.map((entity, index) => normalizeEntity(entity, index)).filter(Boolean) as NormalizedEntity[];
}
