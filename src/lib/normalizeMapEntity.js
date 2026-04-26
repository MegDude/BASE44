export const MAP_ENTITY_TYPES = [
  "venue",
  "event",
  "property",
  "perk",
  "brand",
  "civic",
  "hotel",
  "office",
  "coworking",
  "medical",
  "wellness",
  "fitness",
  "community",
  "art",
  "development",
  "service",
  "for_sale",
  "for_rent"
];

export function normalizeMapEntity(raw = {}) {
  const lat = toFiniteNumber(raw.lat ?? raw.latitude);
  const lng = toFiniteNumber(raw.lng ?? raw.longitude);

  return {
    id: String(raw.id ?? raw.slug ?? raw.name ?? crypto.randomUUID()),
    type: raw.type ?? "venue",
    name: raw.name ?? "Downtown location",
    category: raw.category ?? raw.type ?? "place",
    district: raw.district ?? "downtown",
    lat,
    lng,
    description: raw.description ?? "",
    offer: raw.offer ?? raw.perk ?? null,
    image: raw.image ?? raw.imageUrl ?? null,
    partnerId: raw.partnerId ?? raw.partner_id ?? null,
    active: raw.active !== false,
    metadata: raw.metadata ?? {}
  };
}

function toFiniteNumber(value) {
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function hasValidCoordinates(entity) {
  return (
    Number.isFinite(entity.lat) &&
    Number.isFinite(entity.lng) &&
    entity.lat >= -90 &&
    entity.lat <= 90 &&
    entity.lng >= -180 &&
    entity.lng <= 180
  );
}
