import { resolveMapEntityAlias, normalizePropertyId } from "../mapEntityAliases";
import { validateCoordinate } from "./coordinateValidation";

export type CanonicalMarkerEntityType =
  | "property"
  | "venue"
  | "event"
  | "perk"
  | "hotel"
  | "brand"
  | "civic"
  | "service"
  | "listing"
  | "real_estate"
  | "parking";

export type CanonicalMarkerRecord = Readonly<{
  markerId: string;
  entityId: string;
  entityType: CanonicalMarkerEntityType;
  latitude: number;
  longitude: number;
  iconVariant: string;
  audienceVisibility: Readonly<{
    resident: boolean;
    partner: boolean;
  }>;
  sourceVersion: string;
}>;

export type CanonicalMarkerDiagnostic = Readonly<{
  reason: "missing-entity" | "missing-id" | "invalid-coordinate";
  entityId: string;
  rawId: string;
  name: string;
}>;

const ENTITY_TYPES = new Set<CanonicalMarkerEntityType>([
  "property",
  "venue",
  "event",
  "perk",
  "hotel",
  "brand",
  "civic",
  "service",
  "listing",
  "real_estate",
  "parking",
]);

function stableSlug(value: unknown, fallback = ""): string {
  return normalizePropertyId(value) || fallback;
}

function textForEntity(entity: Record<string, any> = {}): string {
  const raw = entity.raw || {};
  return [
    entity.id,
    entity.entityId,
    entity.entity_id,
    entity.slug,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.entity_type,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.partnerType,
    entity.sourceType,
    raw.id,
    raw.entityId,
    raw.entity_id,
    raw.slug,
    raw.name,
    raw.title,
    raw.type,
    raw.kind,
    raw.entityType,
    raw.entity_type,
    raw.markerType,
    raw.detailDrawerType,
    raw.category,
    raw.category_key,
    raw.partnerType,
    raw.sourceType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function resolveCanonicalMarkerEntityType(entity: Record<string, any> = {}): CanonicalMarkerEntityType {
  const text = textForEntity(entity);
  if (/\b(parking|garage|reservable)\b/.test(text)) return "parking";
  if (/\b(real[_\s-]*estate|property access)\b/.test(text)) return "real_estate";
  if (/\b(listing|mls|for sale|for rent|legends[_\s-]*property)\b/.test(text)) return "real_estate";
  if (/\b(hotel|hospitality)\b/.test(text)) return "hotel";
  if (/\b(event|activation|class|concert|show)\b/.test(text)) return "event";
  if (/\b(perk|offer|happy hour|inkind|discount)\b/.test(text)) return "perk";
  if (/\b(brand|sponsor)\b/.test(text)) return "brand";
  if (/\b(civic|public|park|trail|library|museum|district)\b/.test(text)) return "civic";
  if (/\b(service|wellness|fitness|salon|spa)\b/.test(text)) return "service";
  if (/\b(property|building|residential|condo|apartment|rental|leasing|mixed[_\s-]*use)\b/.test(text)) return "property";
  if (/\b(restaurant|venue|bar|coffee|retail|shop|dining|nightlife|music)\b/.test(text)) return "venue";
  return "venue";
}

function rawIdCandidates(entity: Record<string, any> = {}): string[] {
  const raw = entity.raw || {};
  return [
    entity.id,
    entity.entityId,
    entity.entity_id,
    entity.slug,
    raw.id,
    raw.entityId,
    raw.entity_id,
    raw.slug,
    entity.name,
    entity.title,
    raw.name,
    raw.title,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function resolveParkingParentId(entity: Record<string, any> = {}): string {
  const raw = entity.raw || {};
  return String(
    entity.propertyId ||
      entity.property_id ||
      entity.buildingId ||
      entity.building_id ||
      raw.propertyId ||
      raw.property_id ||
      raw.buildingId ||
      raw.building_id ||
      "",
  ).trim();
}

function normalizeCanonicalEntityId(value: string): string {
  const id = stableSlug(value, value);
  if (["property-the-shore", "priority-the-shore", "shore-condos", "shore-building", "shore-property", "603-davis", "603-davis-st", "610-davis", "610-davis-st"].includes(id)) {
    return "the-shore";
  }
  return id;
}

export function resolveCanonicalMarkerEntityId(entity: Record<string, any> = {}): string {
  const entityType = resolveCanonicalMarkerEntityType(entity);
  if (entityType === "parking") {
    const parentId = resolveParkingParentId(entity);
    const resolvedParent = parentId ? resolveMapEntityAlias(parentId) : "";
    if (resolvedParent) return normalizeCanonicalEntityId(resolvedParent);
  }

  for (const candidate of rawIdCandidates(entity)) {
    const resolved = resolveMapEntityAlias(candidate);
    if (resolved) return normalizeCanonicalEntityId(resolved);
  }

  return "";
}

function resolveChildLocationId(entity: Record<string, any> = {}, entityType: CanonicalMarkerEntityType): string {
  const raw = entity.raw || {};
  if (entityType === "parking") {
    return stableSlug(
      entity.parkingId || entity.parking_id || raw.parkingId || raw.parking_id || entity.id || raw.id || entity.name || raw.name,
      "parking",
    );
  }
  if (entityType === "listing" || entityType === "real_estate") {
    const listing = entity.legendsListing || entity.luxuryPresenceListing || raw.legendsListing || raw.luxuryPresenceListing || {};
    return stableSlug(
      listing.id || listing.listingId || listing.listing_id || listing.mlsNumber || listing.mls_number || entity.listingId || entity.listing_id || raw.listingId || raw.listing_id,
      "",
    );
  }
  return "";
}

export function createCanonicalMarkerRecord(
  entity: Record<string, any> = {},
  options: { sourceVersion?: string; audienceMode?: "resident" | "partner" } = {},
): CanonicalMarkerRecord | null {
  if (!entity) return null;
  const raw = entity.raw || {};
  const coordinate = validateCoordinate(
    entity.latitude ?? entity.lat ?? entity.coords?.[0] ?? raw.latitude ?? raw.lat ?? raw.coords?.[0],
    entity.longitude ?? entity.lng ?? entity.coords?.[1] ?? raw.longitude ?? raw.lng ?? raw.coords?.[1],
  );
  if (!coordinate) return null;

  const entityId = resolveCanonicalMarkerEntityId(entity);
  if (!entityId) return null;
  const entityType = resolveCanonicalMarkerEntityType(entity);
  const childLocationId = resolveChildLocationId(entity, entityType);
  const markerId = childLocationId && childLocationId !== entityId ? `${entityId}:${childLocationId}` : entityId;
  const iconVariant = String(entity.iconVariant || entity.pinKey || entity.pin || entity.category_key || entity.category || entityType || "default");
  const visibility = entity.audienceVisibility || raw.audienceVisibility || {};
  const residentVisible = visibility.resident !== false && (!options.audienceMode || options.audienceMode === "resident" || visibility.partner !== true);
  const partnerVisible = visibility.partner !== false;

  const record: CanonicalMarkerRecord = Object.freeze({
    markerId,
    entityId,
    entityType: ENTITY_TYPES.has(entityType) ? entityType : "venue",
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    iconVariant,
    audienceVisibility: Object.freeze({
      resident: residentVisible,
      partner: partnerVisible,
    }),
    sourceVersion: String(options.sourceVersion || entity.sourceVersion || raw.sourceVersion || entity.updatedAt || entity.updated_at || raw.updatedAt || raw.updated_at || "static"),
  });

  return record;
}

export function markerDiagnosticForEntity(entity: Record<string, any> = {}): CanonicalMarkerDiagnostic | null {
  if (!entity) return Object.freeze({ reason: "missing-entity", entityId: "", rawId: "", name: "" });
  const rawId = String(entity.id || entity.entityId || entity.entity_id || entity.raw?.id || entity.raw?.entityId || entity.raw?.entity_id || "");
  const entityId = resolveCanonicalMarkerEntityId(entity);
  const name = String(entity.name || entity.title || entity.raw?.name || entity.raw?.title || "");
  const coordinate = validateCoordinate(
    entity.latitude ?? entity.lat ?? entity.coords?.[0] ?? entity.raw?.latitude ?? entity.raw?.lat ?? entity.raw?.coords?.[0],
    entity.longitude ?? entity.lng ?? entity.coords?.[1] ?? entity.raw?.longitude ?? entity.raw?.lng ?? entity.raw?.coords?.[1],
  );
  if (!rawId && !entityId) return Object.freeze({ reason: "missing-id", entityId, rawId, name });
  if (!coordinate) return Object.freeze({ reason: "invalid-coordinate", entityId, rawId, name });
  return null;
}
