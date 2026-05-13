import { toFiniteNumber } from './coordinateValidation.js';

export function adaptMapEntity(raw = {}) {
  const lat = toFiniteNumber(raw.lat ?? raw.latitude ?? raw.location?.lat ?? raw.location?.latitude);
  const lng = toFiniteNumber(raw.lng ?? raw.longitude ?? raw.location?.lng ?? raw.location?.longitude);
  return {
    id: String(raw.id ?? raw.slug ?? raw.name ?? Math.random()),
    type: raw.type ?? 'venue',
    name: raw.name ?? 'Downtown location',
    category: raw.category ?? raw.type ?? 'place',
    district: raw.district ?? 'downtown',
    lat,
    lng,
    description: raw.description ?? '',
    offer: raw.offer ?? raw.perk ?? null,
    image: raw.image ?? raw.imageUrl ?? null,
    partnerId: raw.partnerId ?? raw.partner_id ?? null,
    active: raw.active !== false,
    isOpenNow: raw.isOpenNow ?? false,
    metadata: raw.metadata ?? {},
  };
}

export function hasValidCoords(entity) {
  return Number.isFinite(entity?.lat) && Number.isFinite(entity?.lng);
}
