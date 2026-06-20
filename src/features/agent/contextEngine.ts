import { getNearbyRecommendations } from "../../utils/nearbyRecommendations";
import type { AgentContext, AgentEntity } from "./types";

export function getEntityTitle(entity: AgentEntity | null | undefined) {
  return String(entity?.name || entity?.title || entity?.displayName || entity?.address || "Downtown destination");
}

export function getEntityType(entity: AgentEntity | null | undefined) {
  return String(entity?.category || entity?.kind || entity?.entityType || entity?.type || "Place");
}

export function normalizeAgentEntities(items: AgentEntity[] = []) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item?.id || item?.name || item?.title || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildAgentContext(input: AgentContext) {
  const entities = normalizeAgentEntities(input.context || []);
  const selectedEntity = input.selectedEntity || entities[0] || null;
  const nearby = selectedEntity
    ? getNearbyRecommendations({
        selectedEntity,
        entities,
        mode: input.mode,
        limit: 6,
      })
    : [];

  return {
    ...input,
    entities,
    selectedEntity,
    nearby,
    district: input.district || selectedEntity?.district || selectedEntity?.neighborhood || "Downtown Austin",
  };
}
