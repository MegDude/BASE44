import { DAA_CAMPAIGN_ID, DAA_WORKSPACE_ID } from "../../src/data/daaCampaignStrategy.js";
import { getDaaTourStopById } from "../../src/data/daaArtParksTour.js";
import { supabaseServer } from "../../src/lib/supabaseServer.js";

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
  const canonicalStop = getDaaTourStopById(stopId);
  if (!canonicalStop) {
    return res.status(400).json({ error: "Unknown DAA Art & Parks Tour stop" });
  }

  const checkIn = {
    id: `daa-check-in-${stopId}-${Date.now()}`,
    campaignId: body.campaignId === DAA_CAMPAIGN_ID ? body.campaignId : DAA_CAMPAIGN_ID,
    stopId,
    stopName: canonicalStop.displayName || canonicalStop.name,
    stopNumber: String(canonicalStop.stopNumber).padStart(2, "0"),
    placeId: cleanText(body.placeId, 120) || stopId,
    district: canonicalStop.district || cleanText(body.district, 120) || "Downtown Austin",
    shareUrl: cleanText(body.shareUrl, 500),
    source: cleanText(body.source, 80) || "resident-map",
    checkedInAt: cleanText(body.checkedInAt, 80) || new Date().toISOString(),
    profileId: profileId || null,
    sessionId: sessionId || null,
    type: "daa-stop-check-in",
  };

  if (supabaseServer) {
    const meta = {
      ...checkIn,
      workspaceId: DAA_WORKSPACE_ID,
      workspaceName: "Downtown Austin Alliance",
      segment: "Civic",
      routeId: "daa-art-walk",
      database: "interactions",
    };

    const { error: interactionError } = await supabaseServer.from("interactions").insert({
      workspace_id: DAA_WORKSPACE_ID,
      entity_id: checkIn.placeId,
      user_id: checkIn.profileId,
      event_type: "check-in",
      points: 10,
      meta,
    });

    if (interactionError) {
      return res.status(500).json({ error: interactionError.message, checkIn });
    }

    const { error: analyticsError } = await supabaseServer.from("analytics_signals").insert({
      source_type: "daa_art_walk",
      action_type: "check_in",
      value: 1,
      session_token: checkIn.sessionId,
      user_email: checkIn.profileId,
      district: checkIn.district,
      metadata: meta,
    });

    if (analyticsError) {
      console.error("[daa/check-in] accepted check-in but analytics persistence failed", analyticsError);
    }
  }

  return res.status(200).json({ ok: true, status: "accepted", checkIn });
}
