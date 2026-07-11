import { supabaseServer } from "../src/lib/supabaseServer.js";

const ALLOWED_EVENT_TYPES = new Set([
  "entity.viewed",
  "entity.saved",
  "entity.shared",
  "entity.opened",
  "entity.dismissed",
  "directions.requested",
  "phone.clicked",
  "website.clicked",
  "booking.started",
  "booking.completed",
  "perk.viewed",
  "perk.saved",
  "perk.redeemed",
  "campaign.joined",
  "campaign.completed",
  "passport.started",
  "passport.completed",
  "qr.scanned",
  "event.rsvp",
  "event.checkin",
  "notification.opened",
  "search.completed",
  "cms.entity.updated",
]);

function clean(value, limit = 240) {
  if (value === null || value === undefined) return null;
  return String(value).trim().slice(0, limit) || null;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function nullableUuid(value) {
  return isUuid(value) ? String(value) : null;
}

async function insertBestEffort(table, row) {
  if (!supabaseServer) return { table, status: "skipped", reason: "supabase_not_configured" };
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    return error ? { table, status: "skipped", reason: error.message } : { table, status: "stored" };
  } catch (error) {
    return { table, status: "skipped", reason: error?.message || "insert_failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const type = clean(body.type, 120);
  if (!type) return res.status(400).json({ error: "Event type is required" });
  if (!ALLOWED_EVENT_TYPES.has(type)) return res.status(400).json({ error: "Unsupported event type" });

  const event = {
    id: clean(body.id, 180) || `evt-${Date.now()}`,
    type,
    timestamp: clean(body.timestamp, 80) || new Date().toISOString(),
    userId: clean(body.userId, 180),
    profileId: clean(body.profileId, 180),
    sessionId: clean(body.sessionId, 180),
    entityId: clean(body.entityId, 180),
    entityType: clean(body.entityType, 120),
    district: clean(body.district, 120),
    campaignId: clean(body.campaignId, 180),
    partnerId: clean(body.partnerId, 180),
    buildingId: clean(body.buildingId, 180),
    source: clean(body.source, 120) || "downtown-perks-web",
    result: clean(body.result, 120) || "recorded",
    metadata: typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {},
  };

  const writes = [];
  writes.push(await insertBestEffort("analytics_signals", {
    source_type: "map_discovery",
    action_type: type === "event.rsvp" ? "rsvp" : type === "perk.redeemed" ? "redemption" : "open",
    value: 1,
    session_token: event.sessionId,
    user_email: event.profileId || event.userId,
    district: event.district,
    campaign_id: nullableUuid(event.campaignId),
    event_id: nullableUuid(event.entityType === "event" ? event.entityId : null),
  }));
  if (type === "event.rsvp") {
    writes.push(await insertBestEffort("event_rsvps", {
      event_id: nullableUuid(event.entityId),
      status: event.result === "cancelled" ? "cancelled" : "interested",
      source: event.source,
      metadata: event,
    }));
  }

  return res.status(200).json({ ok: true, event, storage: { stored: writes.some((write) => write.status === "stored"), writes } });
}
