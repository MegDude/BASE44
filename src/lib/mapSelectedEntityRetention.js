import { resolveMapEntityFromCollection } from "@/lib/mapEntityAliases";

function getCanonicalEntityKey(entity = {}) {
  return String(entity?.id || entity?.entityId || entity?.slug || "").trim().toLowerCase();
}

/**
 * Ensures an explicitly selected/deep-linked entity remains in the rendered cohort.
 * Normal discovery limits still apply to the rest of the collection.
 */
export function retainSelectedMapEntity({
  selectedEntityId = "",
  visibleEntities = [],
  allEntities = [],
  limit,
} = {}) {
  const visible = Array.isArray(visibleEntities) ? visibleEntities.filter(Boolean) : [];
  const all = Array.isArray(allEntities) ? allEntities.filter(Boolean) : [];
  const selected = resolveMapEntityFromCollection(selectedEntityId, all);

  if (!selected) {
    return Number.isFinite(limit) ? visible.slice(0, Math.max(0, limit)) : visible;
  }

  const selectedKey = getCanonicalEntityKey(selected);
  const withoutDuplicate = visible.filter((entity) => getCanonicalEntityKey(entity) !== selectedKey);

  if (!Number.isFinite(limit)) return [selected, ...withoutDuplicate];

  const normalizedLimit = Math.max(1, Math.floor(limit));
  return [selected, ...withoutDuplicate].slice(0, normalizedLimit);
}
