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

  return res.status(200).json({ ok: true, event });
}
