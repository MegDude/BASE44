import { DAA_CAMPAIGN_ID } from "@/data/daaCampaignStrategy";
import { getWorkflowProfileId, getWorkflowSessionId } from "@/lib/backendWorkflows";
import { platformEventTypes, publishPlatformEvent } from "@/lib/platformEvents";

const STORAGE_KEY = "dp_daa_checkins:v1";

function safeRead() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(records) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Local persistence is a convenience, not a blocker for the check-in action.
  }
}

export function getDaaCheckIns() {
  return safeRead();
}

export function getDaaCheckIn(stopId) {
  return safeRead().find((record) => record.stopId === stopId) || null;
}

export function hasDaaCheckIn(stopId) {
  return Boolean(getDaaCheckIn(stopId));
}

function upsertLocalCheckIn(record) {
  const records = safeRead().filter((item) => item.stopId !== record.stopId);
  const next = [record, ...records].slice(0, 80);
  safeWrite(next);
  return record;
}

export async function recordDaaCheckIn(payload = {}) {
  const checkedInAt = new Date().toISOString();
  const record = {
    campaignId: DAA_CAMPAIGN_ID,
    stopId: payload.stopId,
    stopName: payload.stopName,
    stopNumber: payload.stopNumber,
    placeId: payload.placeId || payload.stopId,
    district: payload.district || "Downtown Austin",
    shareUrl: payload.shareUrl || "",
    source: payload.source || "resident-map",
    checkedInAt,
    sessionId: payload.sessionId || getWorkflowSessionId(),
    profileId: payload.profileId || getWorkflowProfileId(),
    syncStatus: "pending",
  };

  upsertLocalCheckIn(record);

  try {
    const response = await fetch("/api/daa/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error || "Check-in could not be recorded");
    const synced = { ...record, ...(body.checkIn || {}), syncStatus: "synced" };
    upsertLocalCheckIn(synced);
    void publishPlatformEvent({
      type: platformEventTypes.EVENT_CHECK_IN,
      entityId: synced.placeId,
      entityType: "civic",
      campaignId: synced.campaignId,
      district: synced.district,
      source: "daa-civic-check-in",
      result: "checked-in",
      metadata: {
        stopId: synced.stopId,
        stopName: synced.stopName,
        stopNumber: synced.stopNumber,
        shareUrl: synced.shareUrl,
      },
    });
    window.dispatchEvent?.(new CustomEvent("downtown-perks:daa-stop-check-in", { detail: synced }));
    return synced;
  } catch (error) {
    const local = { ...record, syncStatus: "local", error: error instanceof Error ? error.message : String(error || "") };
    upsertLocalCheckIn(local);
    void publishPlatformEvent({
      type: platformEventTypes.EVENT_CHECK_IN,
      entityId: local.placeId,
      entityType: "civic",
      campaignId: local.campaignId,
      district: local.district,
      source: "daa-civic-check-in",
      result: "saved-locally",
      metadata: {
        stopId: local.stopId,
        stopName: local.stopName,
        stopNumber: local.stopNumber,
        shareUrl: local.shareUrl,
        error: local.error,
      },
    });
    window.dispatchEvent?.(new CustomEvent("downtown-perks:daa-stop-check-in", { detail: local }));
    return local;
  }
}
