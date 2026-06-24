import type { MapEntity } from "./mapEntitySchema";

export function normalizeEntityText(value = ""): string {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function coordinateDistanceMeters(a: MapEntity, b: MapEntity): number {
  if (typeof a.lat !== "number" || typeof a.lng !== "number" || typeof b.lat !== "number" || typeof b.lng !== "number") {
    return Number.POSITIVE_INFINITY;
  }
  const earthRadius = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function titleSimilarity(a: string, b: string): number {
  const left = normalizeEntityText(a);
  const right = normalizeEntityText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const shorter = left.length < right.length ? left : right;
  const longer = left.length >= right.length ? left : right;
  return longer.includes(shorter) ? shorter.length / longer.length : 0;
}

export function dedupeMapEntities(entities: MapEntity[]): { entities: MapEntity[]; manualReview: MapEntity[] } {
  const accepted: MapEntity[] = [];
  const manualReview: MapEntity[] = [];

  for (const entity of entities) {
    const duplicate = accepted.find((existing) => {
      if (entity.googlePlaceId && existing.googlePlaceId && entity.googlePlaceId === existing.googlePlaceId) return true;
      if (entity.googleCid && existing.googleCid && entity.googleCid === existing.googleCid) return true;
      const sameTitle = normalizeEntityText(entity.title) === normalizeEntityText(existing.title);
      const sameAddress = normalizeEntityText(entity.address || "") === normalizeEntityText(existing.address || "");
      if (sameTitle && sameAddress && entity.address && existing.address) return true;
      if (sameTitle && coordinateDistanceMeters(entity, existing) <= 30) return true;
      return titleSimilarity(entity.title, existing.title) > 0.95 && sameAddress;
    });

    if (!duplicate) {
      accepted.push(entity);
      continue;
    }

    const mergedTags = Array.from(new Set([...(duplicate.tags || []), ...(entity.tags || []), "deduped-source"]));
    duplicate.tags = mergedTags;
    if (!duplicate.address && entity.address) duplicate.address = entity.address;
    if (typeof duplicate.lat !== "number" && typeof entity.lat === "number") duplicate.lat = entity.lat;
    if (typeof duplicate.lng !== "number" && typeof entity.lng === "number") duplicate.lng = entity.lng;
    if (!duplicate.googleMapsUrl && entity.googleMapsUrl) duplicate.googleMapsUrl = entity.googleMapsUrl;
    if (!duplicate.googleCid && entity.googleCid) duplicate.googleCid = entity.googleCid;
    if (!duplicate.googlePlaceId && entity.googlePlaceId) duplicate.googlePlaceId = entity.googlePlaceId;
    if (titleSimilarity(entity.title, duplicate.title) < 1 || !entity.googlePlaceId) {
      manualReview.push({ ...entity, datasetStatus: "manual_review", tags: Array.from(new Set([...(entity.tags || []), "possible-duplicate"])) });
    }
  }

  return { entities: accepted, manualReview };
}
