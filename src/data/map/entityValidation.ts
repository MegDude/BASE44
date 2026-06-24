import type { MapEntity, MapEntityQaIssue, MapEntityQaReport } from "./mapEntitySchema";
import { isLikelyDowntownAustin } from "./neighborhoodMapping";

export function validateMapEntity(entity: MapEntity, allEntities: MapEntity[]): MapEntityQaIssue | null {
  const issues: string[] = [];
  if (typeof entity.lat !== "number" || typeof entity.lng !== "number") issues.push("missing_coordinates");
  if (!entity.address) issues.push("missing_address");
  if (typeof entity.rating !== "number") issues.push("missing_rating");
  if (!entity.imageUrl) issues.push("missing_image");
  if (!entity.category) issues.push("unknown_category");
  if (!entity.active) issues.push("inactive");
  if (!isLikelyDowntownAustin(entity)) issues.push("outside_downtown_or_austin_review");
  if (entity.googlePlaceId && allEntities.filter((item) => item.googlePlaceId === entity.googlePlaceId).length > 1) {
    issues.push("duplicate_google_place_id");
  }
  if (allEntities.filter((item) => item.title.toLowerCase() === entity.title.toLowerCase()).length > 1) {
    issues.push("duplicate_title");
  }
  if (!entity.googlePlaceId && entity.source !== "manual" && entity.source !== "partner") {
    issues.push("needs_google_places_enrichment");
  }
  if (!issues.length) return null;
  return { entityId: entity.id, title: entity.title, issues };
}

export function buildQaReport(entities: MapEntity[], expectedFullListCount = 369): MapEntityQaReport {
  const issues = entities
    .map((entity) => validateMapEntity(entity, entities))
    .filter((issue): issue is MapEntityQaIssue => Boolean(issue));
  return {
    generatedAt: new Date().toISOString(),
    expectedFullListCount,
    actualEntityCount: entities.length,
    activeEntityCount: entities.filter((entity) => entity.active).length,
    issueCount: issues.reduce((count, item) => count + item.issues.length, 0),
    issues,
  };
}
