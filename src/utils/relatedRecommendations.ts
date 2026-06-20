import { getDistanceMeters, getEntityKind, getNearbyRecommendations, type NearbyRecommendation } from "./nearbyRecommendations";

type MapEntity = Record<string, any>;

function text(entity: MapEntity) {
  return [
    entity?.name,
    entity?.title,
    entity?.category,
    entity?.kind,
    entity?.type,
    entity?.partnerType,
    entity?.district,
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
    ...(Array.isArray(entity?.raw?.tags) ? entity.raw.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

export function getRelatedRecommendations({
  selectedEntity,
  entities,
  excludeIds = [],
  limit = 6,
  mode = "resident",
}: {
  selectedEntity: MapEntity;
  entities: MapEntity[];
  excludeIds?: string[];
  limit?: number;
  mode?: string;
}): NearbyRecommendation[] {
  const selectedText = text(selectedEntity);
  const selectedKind = getEntityKind(selectedEntity);
  const selectedTokens = new Set(selectedText.split(/\s+/).filter((token) => token.length > 3));
  const excluded = new Set([selectedEntity?.id, ...excludeIds].filter(Boolean).map(String));

  const nearby = getNearbyRecommendations({
    selectedEntity,
    entities,
    radiusMeters: 1200,
    fallbackRadiusMeters: 2200,
    limit: Math.max(limit * 2, 8),
    mode,
  });

  return nearby
    .filter((item) => !excluded.has(String(item.entity?.id || "")))
    .map((item) => {
      const candidateText = text(item.entity);
      const overlap = candidateText.split(/\s+/).filter((token) => selectedTokens.has(token)).length;
      const kindMatch = getEntityKind(item.entity) === selectedKind ? 8 : 0;
      const districtMatch = item.entity?.district && selectedEntity?.district && item.entity.district === selectedEntity.district ? 5 : 0;
      const distancePenalty = Math.min(getDistanceMeters(selectedEntity, item.entity) / 400, 5);
      return {
        ...item,
        relevanceScore: item.relevanceScore + overlap + kindMatch + districtMatch - distancePenalty,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore || a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}
