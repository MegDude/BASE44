import type { NearbyRecommendation } from "../../utils/nearbyRecommendations";
import type { AgentEntity, AgentIntent, AgentRecommendation } from "./types";
import { getEntityTitle, getEntityType } from "./contextEngine";

function reasonForEntity(entity: AgentEntity, intent: AgentIntent, mode: string) {
  const district = entity?.district || entity?.neighborhood || "Downtown Austin";
  if (mode === "partner") {
    return `${getEntityTitle(entity)} helps explain nearby ${intent.label.toLowerCase()} context around ${district}.`;
  }
  return `${getEntityTitle(entity)} is a useful ${intent.label.toLowerCase()} fit near ${district}.`;
}

export function buildRecommendations({
  intent,
  entities,
  nearby = [],
  mode,
}: {
  intent: AgentIntent;
  entities: AgentEntity[];
  nearby?: NearbyRecommendation[];
  mode: string;
}): AgentRecommendation[] {
  const nearbyRecommendations = nearby.map((item) => ({
    id: String(item.entity.id || getEntityTitle(item.entity)),
    title: getEntityTitle(item.entity),
    type: getEntityType(item.entity),
    reason: reasonForEntity(item.entity, intent, mode),
    entity: item.entity,
    distanceLabel: item.distanceLabel,
    actionLabel: mode === "partner" ? "Review opportunity" : "Open details",
  }));

  const fallback = entities.slice(0, 6).map((entity) => ({
    id: String(entity.id || getEntityTitle(entity)),
    title: getEntityTitle(entity),
    type: getEntityType(entity),
    reason: reasonForEntity(entity, intent, mode),
    entity,
    actionLabel: mode === "partner" ? "Review opportunity" : "Open details",
  }));

  return (nearbyRecommendations.length ? nearbyRecommendations : fallback).slice(0, 6);
}
