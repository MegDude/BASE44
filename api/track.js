import { supabaseServer } from "../src/lib/supabaseServer.js";

function cleanString(value, max = 160) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function cleanNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const eventType = cleanString(body.eventType || body.type, 96);

  if (!eventType) {
    return res.status(400).json({ error: "Missing eventType" });
  }

  if (!supabaseServer) {
    return res.status(200).json({ ok: true, stored: false });
  }

  const { error } = await supabaseServer.from("map_events").insert({
    event_type: eventType,
    entity_id: cleanString(body.entityId, 128),
    entity_type: cleanString(body.entityType, 80),
    partner_id: cleanString(body.partnerId, 128),
    partner_type: cleanString(body.partnerType, 96),
    source: cleanString(body.source, 160),
    page: cleanString(body.page, 160),
    district: cleanString(body.district, 96),
    lat: cleanNumber(body.lat),
    lng: cleanNumber(body.lng),
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, stored: true });
}
