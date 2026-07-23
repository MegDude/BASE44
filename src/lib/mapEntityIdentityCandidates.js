function compact(values = []) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

const DIRECT_ID_FIELDS = [
  "id",
  "entityId",
  "entity_id",
  "slug",
  "pinId",
  "pin_id",
  "markerId",
  "marker_id",
  "mapPinId",
  "map_pin_id",
  "launchPinId",
  "launch_pin_id",
  "sourcePinId",
  "source_pin_id",
  "canonicalId",
  "canonical_id",
  "legacyId",
  "legacy_id",
];

const ARRAY_ID_FIELDS = ["aliases", "aliasIds", "alias_ids", "legacyIds", "legacy_ids", "sourceIds", "source_ids"];

function readFields(source = {}) {
  if (!source || typeof source !== "object") return [];
  return [
    ...DIRECT_ID_FIELDS.map((field) => source[field]),
    ...ARRAY_ID_FIELDS.map((field) => source[field]),
  ];
}

/**
 * Returns every supported public/runtime identity attached to a map entity.
 * Generated launch-pin IDs are aliases, not a replacement for canonical IDs.
 */
export function getMapEntityIdentityCandidates(entity = {}) {
  return [...new Set(compact([
    ...readFields(entity),
    ...readFields(entity.raw),
    ...readFields(entity.source),
    ...readFields(entity.metadata),
  ]))];
}

export function normalizeMapEntityIdentity(value) {
  return String(value || "").trim().toLowerCase();
}

export function entityHasMapIdentity(entity = {}, requestedIdentity = "") {
  const requested = normalizeMapEntityIdentity(requestedIdentity);
  if (!requested) return false;
  return getMapEntityIdentityCandidates(entity)
    .some((candidate) => normalizeMapEntityIdentity(candidate) === requested);
}
