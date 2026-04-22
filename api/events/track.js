import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { sanitizeEntityType, sanitizeString } from "../_utils/publicActor.js";

const EVENT_TYPES = new Set([
  "scan",
  "map_open",
  "map_recenter",
  "filter_change",
  "pin_view",
  "entity_open",
  "save",
  "unsave",
  "directions_click",
  "rsvp_start",
  "rsvp_complete",
  "perk_open",
  "unlock_start",
  "unlock_complete",
  "redeem_start",
  "redeem_complete",
  "share",
]);

function toFiniteNumber(value) {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const sessionId = sanitizeString(req.body?.session_id, { max: 128 });
    const eventType = sanitizeString(req.body?.event_type, { max: 48 }).toLowerCase();
    if (!EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: "Unsupported event type" });
    }

    if (!supabaseServer) {
      return res.status(200).json({ ok: true, persisted: false });
    }

    const payload = {
      session_id: sessionId,
      event_type: eventType,
      entity_id: sanitizeString(req.body?.entity_id, { max: 128, required: false }),
      entity_type:
        typeof req.body?.entity_type === "string"
          ? sanitizeEntityType(req.body.entity_type)
          : null,
      partner_id: sanitizeString(req.body?.partner_id, { max: 128, required: false }),
      source_partner_id: sanitizeString(req.body?.source_partner_id, { max: 128, required: false }),
      access_point_id: sanitizeString(req.body?.access_point_id, { max: 128, required: false }),
      source_code: sanitizeString(req.body?.source_code, { max: 128, required: false }),
      lat: toFiniteNumber(req.body?.lat),
      lng: toFiniteNumber(req.body?.lng),
      metadata: typeof req.body?.metadata === "object" && req.body?.metadata !== null ? req.body.metadata : {},
      occurred_at: new Date().toISOString(),
    };

    const { error } = await supabaseServer.from("interaction_events").insert(payload);
    if (error) {
      return res.status(200).json({ ok: true, persisted: false, warning: error.message });
    }

    return res.status(200).json({ ok: true, persisted: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Invalid tracking request" });
  }
}
