import { supabaseServer } from "../src/lib/supabaseServer.js";

const ALLOWED_ACTIONS = new Set([
  "reserve",
  "plan_visit",
  "rsvp",
  "cancel_rsvp",
  "redeem",
  "show_card",
  "request_info",
  "request_tour",
  "concierge_request",
  "service_request",
  "campaign_request",
  "directions",
  "save",
  "unsave",
  "website",
  "phone",
  "share",
  "explore",
]);

function clean(value, limit = 500) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, limit);
}

function cleanObject(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [clean(key, 80), typeof item === "object" && item !== null ? item : clean(item, 1000)])
      .filter(([key]) => key),
  );
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function nullableUuid(value) {
  return isUuid(value) ? String(value) : null;
}

function normalizePayload(body = {}) {
  const action = clean(body.action, 80);
  const entity = cleanObject(body.entity);
  const standard = cleanObject(body.standard);
  const form = cleanObject(body.form);
  const metadata = cleanObject(body.metadata);
  return {
    id: clean(body.id, 180) || `map-action-${Date.now()}`,
    action,
    mode: clean(body.mode, 40) || "resident",
    sessionId: clean(body.sessionId, 180),
    profileId: clean(body.profileId, 180),
    source: clean(body.source, 120) || "map_standard_panel",
    pageUrl: clean(body.pageUrl || body.url, 1000),
    route: clean(body.route || body.path, 500),
    filter: clean(body.filter, 120),
    collection: clean(body.collection, 180),
    campaignId: clean(body.campaignId || form.campaignId || metadata.campaignId, 180),
    partnerId: clean(body.partnerId || form.partnerId || metadata.partnerId, 180),
    workspaceId: clean(body.workspaceId || form.workspaceId || metadata.workspaceId, 180),
    listingId: clean(body.listingId || form.listingId || metadata.listingId, 180),
    entity: {
      id: clean(entity.id, 180),
      name: clean(entity.name, 240),
      type: clean(entity.type, 120),
      category: clean(entity.category, 160),
      district: clean(entity.district, 160),
      address: clean(entity.address, 300),
      partnerId: clean(entity.partnerId, 180),
      workspaceId: clean(entity.workspaceId, 180),
      campaignId: clean(entity.campaignId, 180),
      brand: clean(entity.brand, 180),
    },
    standard: {
      category: clean(standard.category, 120),
      intent: clean(standard.intent, 120),
      label: clean(standard.label, 120),
    },
    form,
    metadata,
    createdAt: new Date().toISOString(),
  };
}

function responseMessage(action) {
  if (action === "reserve") return "Reservation request saved.";
  if (action === "rsvp") return "RSVP saved.";
  if (action === "cancel_rsvp") return "RSVP removed.";
  if (action === "redeem") return "Perk action saved.";
  if (action === "show_card") return "Resident card presentation saved.";
  if (action === "request_tour") return "Tour request saved.";
  if (action === "request_info") return "Information request saved.";
  if (action === "campaign_request") return "Campaign request saved.";
  if (action === "directions") return "Directions action recorded.";
  if (action === "save") return "Saved.";
  if (action === "unsave") return "Removed from saved.";
  return "Map action saved.";
}

function actionTypeForAnalytics(action) {
  if (action === "redeem" || action === "show_card") return "redemption";
  if (action === "rsvp" || action === "cancel_rsvp") return "rsvp";
  if (action === "directions") return "visit_intent";
  if (action === "save" || action === "unsave") return "save";
  if (["request_info", "request_tour", "concierge_request", "service_request", "campaign_request", "reserve"].includes(action)) return "lead";
  return "open";
}

function pointsForAction(action) {
  if (action === "redeem" || action === "show_card") return 20;
  if (action === "rsvp") return 10;
  if (action === "save") return 5;
  return 1;
}

function workspaceMetadata(payload) {
  return {
    ...payload.metadata,
    mapActionId: payload.id,
    action: payload.action,
    mode: payload.mode,
    source: payload.source,
    sessionId: payload.sessionId,
    profileId: payload.profileId,
    pageUrl: payload.pageUrl,
    route: payload.route,
    filter: payload.filter,
    collection: payload.collection,
    campaignId: payload.campaignId,
    partnerId: payload.partnerId,
    workspaceId: payload.workspaceId,
    listingId: payload.listingId,
    entity: payload.entity,
    standard: payload.standard,
    form: payload.form,
  };
}

async function safeInsert(table, row, required = false) {
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    if (error) return { table, status: required ? "failed" : "skipped", reason: error.message };
    return { table, status: "stored" };
  } catch (error) {
    return { table, status: required ? "failed" : "skipped", reason: error?.message || "insert_failed" };
  }
}

async function recordSupabaseAction(payload) {
  if (!supabaseServer) return { persisted: false, writes: [] };

  const metadata = workspaceMetadata(payload);
  const entityType = payload.entity.type || payload.entity.category || "place";
  const uuidEntityId = nullableUuid(payload.entity.id || payload.listingId);

  const analyticsPayload = {
    source_type: "map_discovery",
    action_type: actionTypeForAnalytics(payload.action),
    value: 1,
    session_token: payload.sessionId || null,
    user_email: payload.profileId || null,
    district: payload.entity.district || null,
  };
  const analyticsCampaignId = nullableUuid(payload.campaignId);
  if (analyticsCampaignId) analyticsPayload.campaign_id = analyticsCampaignId;
  if (entityType === "event" && uuidEntityId) analyticsPayload.event_id = uuidEntityId;
  if (["venue", "restaurant", "bar", "retail", "hotel"].includes(entityType) && uuidEntityId) analyticsPayload.venue_id = uuidEntityId;
  if (["property", "building", "residential"].includes(entityType) && uuidEntityId) analyticsPayload.building_id = uuidEntityId;

  const writes = [await safeInsert("analytics_signals", analyticsPayload, true)];
  writes.push(await safeInsert("resident_activity", {
    entity_id: uuidEntityId,
    entity_type: entityType,
    activity_type: payload.action,
    points: pointsForAction(payload.action),
    source: payload.source || "map",
    status: payload.action === "cancel_rsvp" || payload.action === "unsave" ? "inactive" : "active",
    metadata,
  }));

  if (payload.action === "save" && uuidEntityId) {
    writes.push(await safeInsert("saved_entities", {
      entity_id: uuidEntityId,
      entity_type: entityType,
      source: payload.source || "map",
      status: "active",
      metadata,
    }));
  }

  if (payload.action === "rsvp" || payload.action === "cancel_rsvp") {
    writes.push(await safeInsert("event_rsvps", {
      event_id: nullableUuid(payload.form.eventId || payload.entity.id),
      status: payload.action === "cancel_rsvp" ? "cancelled" : "interested",
      source: payload.source || "map",
      metadata,
    }));
  }

  if (payload.action === "redeem" || payload.action === "show_card") {
    writes.push(await safeInsert("perk_redemptions", {
      perk_id: nullableUuid(payload.form.perkId || payload.entity.id),
      source: payload.source || "resident_card",
      status: payload.action === "redeem" ? "redeemed" : "presented",
      metadata,
    }));
  }

  if (["request_info", "request_tour", "concierge_request", "service_request", "campaign_request", "reserve"].includes(payload.action)) {
    writes.push(await safeInsert("partner_crm_leads", {
      id: payload.id,
      source: payload.source || "map",
      resident_id: payload.profileId || payload.sessionId || null,
      resident_name: clean(payload.form.name, 180) || null,
      resident_email: clean(payload.form.email || payload.form.contact, 240) || null,
      resident_phone: clean(payload.form.phone, 80) || null,
      building_id: payload.form.buildingId || payload.entity.id || null,
      partner_id: payload.partnerId || payload.entity.partnerId || null,
      perk_id: payload.form.perkId || null,
      campaign_id: payload.campaignId || payload.entity.campaignId || null,
      status: "new",
      metadata,
    }));
  }

  return { persisted: writes.some((write) => write.status === "stored"), table: "analytics_signals", writes };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = normalizePayload(req.body || {});
  if (!payload.action) return res.status(400).json({ error: "Action is required" });
  if (!ALLOWED_ACTIONS.has(payload.action)) return res.status(400).json({ error: "Unsupported map action" });
  if (!payload.entity.id && !payload.entity.name) return res.status(400).json({ error: "Entity context is required" });

  try {
    await recordSupabaseAction(payload);
    return res.status(200).json({
      ok: true,
      id: payload.id,
      action: payload.action,
      status: "accepted",
      message: responseMessage(payload.action),
    });
  } catch (error) {
    console.error("[map-actions] accepted action but persistence failed", error);
    return res.status(202).json({
      ok: true,
      id: payload.id,
      action: payload.action,
      status: "accepted",
      message: responseMessage(payload.action),
    });
  }
}
