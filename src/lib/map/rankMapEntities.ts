import { normalizeEntity } from "./normalizeEntity";

type RankInput = Record<string, unknown>;

export function rankMapEntities(entities: RankInput[] = [], query = "") {
  const normalizedQuery = query.toLowerCase().trim();

  return entities
    .map((entity, index) => normalizeEntity(entity, index))
    .filter(Boolean)
    .map((entity) => {
      const haystack = [entity.title, entity.name, entity.kind, entity.category, entity.address, entity.district].join(" ").toLowerCase();
      const score = normalizedQuery && haystack.includes(normalizedQuery) ? 100 : entity.kind === "property" ? 20 : 40;
      return { ...entity, score };
    })
    .sort((a, b) => b.score - a.score);
}
