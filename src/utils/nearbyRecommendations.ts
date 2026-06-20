type MapEntity = Record<string, any>;

type NearbyRecommendationInput = {
  selectedEntity: MapEntity;
  entities: MapEntity[];
  radiusMeters?: number;
  fallbackRadiusMeters?: number;
  limit?: number;
  includeTypes?: string[];
  excludeIds?: string[];
  mode?: "resident" | "partner" | string;
};

export type NearbyRecommendation = {
  entity: MapEntity;
  distanceMeters: number;
  distanceLabel: string;
  relevanceScore: number;
};

const DEFAULT_RADIUS_METERS = 800;
const DEFAULT_FALLBACK_RADIUS_METERS = 1600;

function toNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

export function getEntityCoordinates(entity: MapEntity | null | undefined): [number, number] | null {
  if (!entity) return null;
  if (Array.isArray(entity.coords) && entity.coords.length >= 2) {
    const lat = toNumber(entity.coords[0]);
    const lng = toNumber(entity.coords[1]);
    if (lat !== null && lng !== null) return [lat, lng];
  }
  const lat = toNumber(entity.latitude ?? entity.lat ?? entity.raw?.latitude ?? entity.raw?.lat);
  const lng = toNumber(entity.longitude ?? entity.lng ?? entity.raw?.longitude ?? entity.raw?.lng);
  if (lat === null || lng === null) return null;
  return [lat, lng];
}

export function getDistanceMeters(origin: MapEntity, candidate: MapEntity) {
  const originCoords = getEntityCoordinates(origin);
  const candidateCoords = getEntityCoordinates(candidate);
  if (!originCoords || !candidateCoords) return Number.POSITIVE_INFINITY;

  const [lat1, lon1] = originCoords;
  const [lat2, lon2] = candidateCoords;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceLabel(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters)) return "";
  const miles = distanceMeters / 1609.344;
  if (miles < 0.1) return "<0.1 mi";
  return `${miles.toFixed(miles < 1 ? 1 : 0)} mi`;
}

export function getEntityKind(entity: MapEntity) {
  return String(
    entity?.kind ||
      entity?.entityType ||
      entity?.destinationKind ||
      entity?.partnerType ||
      entity?.category_key ||
      entity?.category ||
      entity?.type ||
      entity?.raw?.kind ||
      entity?.raw?.type ||
      "",
  ).toLowerCase();
}

function getEntityText(entity: MapEntity) {
  return [
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.category_key,
    entity?.kind,
    entity?.type,
    entity?.partnerType,
    entity?.district,
    entity?.neighborhood,
    entity?.summary,
    entity?.description,
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
    ...(Array.isArray(entity?.raw?.tags) ? entity.raw.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function isInactiveEntity(entity: MapEntity) {
  const status = String(entity?.status || entity?.raw?.status || entity?.active || entity?.isActive || "").toLowerCase();
  return status === "inactive" || status === "archived" || status === "false" || entity?.inactive === true;
}

function getRelevanceScore(selectedEntity: MapEntity, candidate: MapEntity, mode?: string) {
  const selectedText = getEntityText(selectedEntity);
  const candidateText = getEntityText(candidate);
  const selectedKind = getEntityKind(selectedEntity);
  const candidateKind = getEntityKind(candidate);
  const selectedTags = new Set(selectedText.split(/\s+/).filter((token) => token.length > 3));
  const candidateTags = candidateText.split(/\s+/).filter((token) => selectedTags.has(token));
  let score = 0;

  if (candidateKind && candidateKind === selectedKind) score += 9;
  if (candidate?.district && selectedEntity?.district && candidate.district === selectedEntity.district) score += 6;
  score += Math.min(candidateTags.length, 8);
  if (candidateText.includes("perk") || candidateText.includes("offer")) score += mode === "partner" ? 4 : 5;
  if (candidateText.includes("event")) score += 3;
  if (candidateText.includes("hotel")) score += 3;
  if (candidateText.includes("residence") || candidateText.includes("property") || candidateText.includes("building")) score += mode === "partner" ? 5 : 1;
  return score;
}

function scoreAndFilter(input: NearbyRecommendationInput, radiusMeters: number) {
  const { selectedEntity, entities, includeTypes, excludeIds = [], mode } = input;
  const excluded = new Set([selectedEntity?.id, selectedEntity?.raw?.id, ...excludeIds].filter(Boolean).map(String));
  const include = includeTypes?.length ? new Set(includeTypes.map((item) => item.toLowerCase())) : null;

  return (entities || [])
    .filter((entity) => entity?.id && !excluded.has(String(entity.id)) && !excluded.has(String(entity.raw?.id || "")))
    .filter((entity) => !isInactiveEntity(entity))
    .filter((entity) => getEntityCoordinates(entity))
    .filter((entity) => !include || include.has(getEntityKind(entity)))
    .map((entity) => {
      const distanceMeters = getDistanceMeters(selectedEntity, entity);
      const relevanceScore = getRelevanceScore(selectedEntity, entity, mode);
      return { entity, distanceMeters, distanceLabel: formatDistanceLabel(distanceMeters), relevanceScore };
    })
    .filter((item) => item.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters || b.relevanceScore - a.relevanceScore);
}

export function getNearbyRecommendations(input: NearbyRecommendationInput): NearbyRecommendation[] {
  const radiusMeters = input.radiusMeters || DEFAULT_RADIUS_METERS;
  const fallbackRadiusMeters = input.fallbackRadiusMeters || DEFAULT_FALLBACK_RADIUS_METERS;
  const limit = input.limit || 6;
  if (!getEntityCoordinates(input.selectedEntity)) return [];

  let results = scoreAndFilter(input, radiusMeters);
  if (results.length < Math.min(4, limit) && fallbackRadiusMeters > radiusMeters) {
    results = scoreAndFilter(input, fallbackRadiusMeters);
  }

  return results
    .sort((a, b) => {
      const distanceBucket = Math.round(a.distanceMeters / 150) - Math.round(b.distanceMeters / 150);
      return distanceBucket || b.relevanceScore - a.relevanceScore || a.distanceMeters - b.distanceMeters;
    })
    .slice(0, limit);
}
