import { getWorkflowProfileId, getWorkflowSessionId } from "@/lib/backendWorkflows";

const STORAGE_KEY = "dp_platform_events:v1";

export const platformEventTypes = {
  ENTITY_VIEWED: "entity.viewed",
  ENTITY_SAVED: "entity.saved",
  ENTITY_SHARED: "entity.shared",
  ENTITY_OPENED: "entity.opened",
  DIRECTIONS_REQUESTED: "directions.requested",
  PERK_REDEEMED: "perk.redeemed",
  CAMPAIGN_JOINED: "campaign.joined",
  EVENT_RSVP: "event.rsvp",
  EVENT_CHECK_IN: "event.checkin",
  QR_SCANNED: "qr.scanned",
  SEARCH_COMPLETED: "search.completed",
  CMS_ENTITY_UPDATED: "cms.entity.updated",
};

function safeReadEvents() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteEvents(events) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 200)));
  } catch {
    // Event persistence is a fallback only.
  }
}

function normalizeEvent(event = {}) {
  const now = new Date().toISOString();
  return {
    id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: event.type,
    timestamp: event.timestamp || now,
    userId: event.userId || null,
    profileId: event.profileId || getWorkflowProfileId(),
    sessionId: event.sessionId || getWorkflowSessionId(),
    entityId: event.entityId || null,
    entityType: event.entityType || null,
    district: event.district || null,
    campaignId: event.campaignId || event.campaign || null,
    partnerId: event.partnerId || null,
    buildingId: event.buildingId || null,
    source: event.source || "downtown-perks-web",
    result: event.result || "recorded",
    metadata: event.metadata || {},
  };
}

export async function publishPlatformEvent(event = {}) {
  const normalized = normalizeEvent(event);
  if (!normalized.type) {
    throw new Error("Platform event type is required");
  }

  const cached = [normalized, ...safeReadEvents()];
  safeWriteEvents(cached);

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error || "Platform event could not be published");
    return { ...normalized, ...(body.event || {}), syncStatus: "synced" };
  } catch (error) {
    return {
      ...normalized,
      syncStatus: "local",
      error: error instanceof Error ? error.message : String(error || ""),
    };
  }
}

export function readPlatformEvents() {
  return safeReadEvents();
}
