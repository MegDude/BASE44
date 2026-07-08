import { supabaseServer } from "../../src/lib/supabaseServer.js";

function clean(value, limit = 500) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function nullableUuid(value) {
  return isUuid(value) ? String(value) : null;
}

async function insertBestEffort(table, row) {
  if (!supabaseServer) return { table, status: "unavailable", reason: "Supabase is not configured" };
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    return error ? { table, status: "skipped", reason: error.message } : { table, status: "stored" };
  } catch (error) {
    return { table, status: "skipped", reason: error?.message || "insert_failed" };
  }
}

function normalizeEvent(body = {}) {
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const residentId = clean(body.residentId || body.profileId || metadata.residentId || metadata.uid || metadata.profileId, 180);
  const cardId = clean(body.cardId || metadata.cardId || `card-${residentId}`, 220);
  const entityId = clean(body.entityId || metadata.entityId || metadata.perkId || metadata.eventId, 220);
  const type = clean(body.type || metadata.type || "resident_card_shown", 80);
  return {
    type,
    residentId,
    profileId: clean(body.profileId || residentId, 180),
    cardId,
    cardNumber: clean(body.cardNumber || metadata.cardNumber, 80),
    source: clean(body.source || metadata.source || "map_pass", 120),
    entityType: clean(body.entityType || metadata.entityType || (type.includes("perk") ? "perk" : "card"), 80),
    entityId,
    partnerId: clean(body.partnerId || metadata.partnerId, 180),
    sessionId: clean(body.sessionId || metadata.sessionId, 180),
    metadata: {
      ...metadata,
      receivedAt: new Date().toISOString(),
      residentId,
      cardId,
      entityId,
      source: clean(body.source || metadata.source || "map_pass", 120),
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const event = normalizeEvent(req.body || {});
  if (!event.residentId || !event.cardId) {
    return res.status(400).json({ error: "Resident card event requires a resident profile and card id." });
  }

  const writes = [];
  writes.push(await insertBestEffort("resident_activity", {
    entity_id: nullableUuid(event.entityId),
    entity_type: event.entityType || "card",
    activity_type: event.type,
    points: event.type === "resident_card_shown" ? 5 : 20,
    source: event.source,
    status: "active",
    metadata: event.metadata,
  }));
  writes.push(await insertBestEffort("analytics_signals", {
    source_type: "resident_card",
    action_type: event.entityType === "perk" ? "redemption" : "open",
    value: 1,
    session_token: event.sessionId || null,
    user_email: event.profileId || event.residentId || null,
    district: clean(event.metadata.district || event.metadata.entity?.district, 120) || null,
  }));

  return res.status(200).json({
    ok: true,
    status: supabaseServer ? "accepted" : "accepted_without_persistence",
    event: {
      type: event.type,
      residentId: event.residentId,
      cardId: event.cardId,
      source: event.source,
      entityType: event.entityType,
      entityId: event.entityId,
    },
    writes,
  });
}
