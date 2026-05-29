import type { NormalizedEntity } from "./normalizeEntity";

export function adaptToUI(entity: NormalizedEntity) {
  return {
    ...entity,
    coords: [entity.latitude, entity.longitude] as [number, number],
    subtitle: `${entity.category} · ${entity.district}`,
    walkTime: entity.type === "hotel" ? "8 min walk" : entity.type === "event" ? "Tonight" : "5 min walk",
  };
}
