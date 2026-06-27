import { DAA_CAMPAIGN_ID } from "../../src/data/daaCampaignStrategy.js";

function cleanText(value, limit = 180) {
  return String(value || "").trim().slice(0, limit);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const stopId = cleanText(body.stopId, 120);
  const stopName = cleanText(body.stopName, 160);
  const profileId = cleanText(body.profileId, 160);
  const sessionId = cleanText(body.sessionId, 160);

  if (!stopId || !stopName) {
    return res.status(400).json({ error: "Stop id and stop name are required" });
  }

  const checkIn = {
    id: `daa-check-in-${stopId}-${Date.now()}`,
    campaignId: body.campaignId === DAA_CAMPAIGN_ID ? body.campaignId : DAA_CAMPAIGN_ID,
    stopId,
    stopName,
    stopNumber: cleanText(body.stopNumber, 12),
    placeId: cleanText(body.placeId, 120) || stopId,
    district: cleanText(body.district, 120) || "Downtown Austin",
    shareUrl: cleanText(body.shareUrl, 500),
    source: cleanText(body.source, 80) || "resident-map",
    checkedInAt: cleanText(body.checkedInAt, 80) || new Date().toISOString(),
    profileId: profileId || null,
    sessionId: sessionId || null,
    type: "daa-stop-check-in",
  };

  return res.status(200).json({ ok: true, checkIn });
}
