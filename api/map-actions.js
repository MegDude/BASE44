import { supabaseServer } from "../src/lib/supabaseServer.js";

const ALLOWED_ACTIONS = new Set([
  "reserve",
  "plan_visit",
  "rsvp",
  "redeem",
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

function normalizePayload(body = {}) {
  const action = clean(body.action, 80);
  const entity = cleanObject(body.entity);
  const standard = cleanObject(body.standard);
  const form = cleanObject(body.form);
  return {
    id: clean(body.id, 180) || `map-action-${Date.now()}`,
    action,
    mode: clean(body.mode, 40) || "resident",
    sessionId: clean(body.sessionId, 180),
    profileId: clean(body.profileId, 180),
    source: clean(body.source, 120) || "map_standard_panel",
    entity: {
      id: clean(entity.id, 180),
      name: clean(entity.name, 240),
      type: clean(entity.type, 120),
      category: clean(entity.category, 160),
      district: clean(entity.district, 160),
      address: clean(entity.address, 300),
    },
    standard: {
      category: clean(standard.category, 120),
      intent: clean(standard.intent, 120),
      label: clean(standard.label, 120),
    },
    form,
    createdAt: new Date().toISOString(),
  };
}

function responseMessage(action) {
  if (action === "reserve") return "Reservation request saved.";
  if (action === "rsvp") return "RSVP saved.";
  if (action === "redeem") return "Perk action saved.";
  if (action === "request_tour") return "Tour request saved.";
  if (action === "request_info") return "Information request saved.";
  if (action === "campaign_request") return "Campaign request saved.";
  if (action === "directions") return "Directions action recorded.";
  if (action === "save") return "Saved.";
  if (action === "unsave") return "Removed from saved.";
  return "Map action saved.";
}

async function recordSupabaseAction(payload) {
  if (!supabaseServer) return { stored: false, reason: "supabase_not_configured" };

  const analyticsPayload = {
    source_type: "map_discovery",
    action_type:
      payload.action === "redeem"
        ? "redemption"
        : payload.action === "rsvp"
          ? "rsvp"
          : payload.action === "directions"
            ? "visit_intent"
            : payload.action === "save" || payload.action === "unsave"
              ? "save"
              : "open",
    value: 1,
    session_token: payload.sessionId || null,
    user_email: payload.profileId || null,
    district: payload.entity.district || null,
    metadata: payload,
  };

  const { error } = await supabaseServer.from("analytics_signals").insert(analyticsPayload);
  if (error) throw error;
  return { stored: true, table: "analytics_signals" };
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
    const storage = await recordSupabaseAction(payload);
    return res.status(200).json({
      ok: true,
      id: payload.id,
      action: payload.action,
      message: responseMessage(payload.action),
      storage,
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Map action failed",
      id: payload.id,
    });
  }
}
