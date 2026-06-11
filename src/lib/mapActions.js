const SAVED_KEY = "downtown-perks-map-saved-entities";
const RSVP_KEY = "downtown-perks-map-rsvps";
const LEADS_KEY = "downtown-perks-map-leads";

function readStoredArray(key) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredArray(key, items) {
  if (typeof window === "undefined") return items;
  window.localStorage.setItem(key, JSON.stringify(items));
  return items;
}

function entityRecord(entity, extra = {}) {
  const id = String(entity?.id || entity?.entityId || "");
  return {
    id,
    name: entity?.name || entity?.title || id,
    sourceType: entity?.sourceType || entity?.type || entity?.category || "place",
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

export function saveMapEntity(entity) {
  const record = entityRecord(entity);
  if (!record.id) return null;
  const next = [record, ...readStoredArray(SAVED_KEY).filter((item) => item.id !== record.id)];
  writeStoredArray(SAVED_KEY, next);
  return record;
}

export function getSavedMapEntities() {
  return readStoredArray(SAVED_KEY);
}

export function rsvpToMapEntity(entity) {
  const record = entityRecord(entity, { status: "rsvp" });
  if (!record.id) return null;
  const next = [record, ...readStoredArray(RSVP_KEY).filter((item) => item.id !== record.id)];
  writeStoredArray(RSVP_KEY, next);
  return record;
}

export function getMapRsvps() {
  return readStoredArray(RSVP_KEY);
}

export function submitMapLead(payload) {
  const record = {
    ...payload,
    id: payload?.id || `map-lead-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  const next = [record, ...readStoredArray(LEADS_KEY)];
  writeStoredArray(LEADS_KEY, next);
  // TODO: Replace with CRM/booking API once production credentials are available.
  return record;
}

export function getMapLeads() {
  return readStoredArray(LEADS_KEY);
}
