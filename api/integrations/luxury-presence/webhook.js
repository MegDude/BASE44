import { supabaseServer } from "../../../src/lib/supabaseServer.js";
import {
  getLuxuryPresenceExternalEventId,
  getLuxuryPresenceActivityType,
  normalizeLuxuryPresenceLeadEvent,
  toLeadActivityRow,
} from "../../../src/server/integrations/luxuryPresence/normalizeLeadEvent.js";
import {
  getLuxuryPresenceSignatureHeader,
  verifyLuxuryPresenceSignature,
} from "../../../src/server/integrations/luxuryPresence/verifyWebhookSignature.js";
import {
  getFollowUpPriority,
  getFollowUpReason,
  getListingDemandDelta,
  isSuppressionSignal,
} from "../../../src/server/integrations/luxuryPresence/intelligence.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  if (typeof req.text === "function") return req.text();

  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function isDuplicateError(error) {
  return error?.code === "23505" || /duplicate key/i.test(error?.message || "");
}

async function createListingIntelligence(normalized) {
  if (!normalized.externalListingId) return;
  const delta = getListingDemandDelta(normalized.activityType);
  const existing = await supabaseServer
    .from("luxury_presence_listing_intelligence")
    .select("*")
    .eq("external_listing_id", normalized.externalListingId)
    .maybeSingle();

  const current = existing.data || {};
  await supabaseServer.from("luxury_presence_listing_intelligence").upsert(
    {
      external_listing_id: normalized.externalListingId,
      listing_title: normalized.listingTitle || current.listing_title || null,
      listing_address: normalized.listingAddress || current.listing_address || null,
      listing_url: normalized.listingUrl || current.listing_url || null,
      views_last_7_days: Number(current.views_last_7_days || 0) + delta.views,
      favorites_last_7_days: Number(current.favorites_last_7_days || 0) + delta.favorites,
      inquiries_last_7_days: Number(current.inquiries_last_7_days || 0) + delta.inquiries,
      demand_score: Number(current.demand_score || 0) + delta.demandScore,
      seller_intent_score: Number(current.seller_intent_score || 0) + delta.sellerIntentScore,
      last_activity_at: normalized.occurredAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "external_listing_id" },
  );
}

async function createFollowUpQueueItem(normalized) {
  const priority = getFollowUpPriority(normalized.activityType);
  if (!priority) return;

  await supabaseServer.from("luxury_presence_followup_queue").insert({
    external_lead_id: normalized.externalLeadId || null,
    external_agent_id: normalized.externalAgentId || null,
    external_listing_id: normalized.externalListingId || null,
    activity_type: normalized.activityType,
    priority,
    reason: getFollowUpReason(normalized),
    metadata: {
      listingTitle: normalized.listingTitle || null,
      listingAddress: normalized.listingAddress || null,
      activityCategory: normalized.activityCategory,
    },
  });
}

async function createSuppressionSignal(normalized) {
  if (!isSuppressionSignal(normalized.activityType)) return;
  const conflictTarget = normalized.externalLeadId ? "external_lead_id,activity_type" : "lead_email,activity_type";

  await supabaseServer.from("luxury_presence_suppression_signals").upsert(
    {
      external_lead_id: normalized.externalLeadId || null,
      lead_email: normalized.leadEmail || null,
      activity_type: normalized.activityType,
      suppressed_at: normalized.occurredAt || new Date().toISOString(),
      metadata: normalized.metadata || {},
    },
    { onConflict: conflictTarget },
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  if (process.env.LUXURY_PRESENCE_WEBHOOK_ENABLED === "false") {
    return res.status(503).json({ error: "Luxury Presence webhook disabled" });
  }

  if (!supabaseServer) {
    return res.status(503).json({ error: "Supabase server client is not configured" });
  }

  const rawBody = await readRawBody(req);
  const secret = process.env.LUXURY_PRESENCE_WEBHOOK_SECRET;
  const signatureHeader = getLuxuryPresenceSignatureHeader(req.headers);

  if (!verifyLuxuryPresenceSignature({ rawBody, signatureHeader, secret })) {
    console.warn("Luxury Presence webhook rejected: invalid signature");
    return res.status(401).json({ error: "invalid signature" });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return res.status(400).json({ error: "malformed payload" });
  }

  const externalEventId = getLuxuryPresenceExternalEventId(payload);
  const activityType = getLuxuryPresenceActivityType(payload);
  const eventType = payload?.event_type || payload?.eventType || "leads";

  const rawInsert = await supabaseServer.from("luxury_presence_webhook_events").insert({
    external_event_id: externalEventId,
    event_type: eventType,
    activity_type: activityType,
    raw_payload: payload,
    status: "received",
  });

  if (rawInsert.error) {
    if (isDuplicateError(rawInsert.error)) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    return res.status(500).json({ error: rawInsert.error.message });
  }

  try {
    const normalized = normalizeLuxuryPresenceLeadEvent(payload);
    const activityRow = toLeadActivityRow(normalized);
    const activityInsert = await supabaseServer.from("lead_activity_events").insert(activityRow).select("id").single();

    if (activityInsert.error) throw activityInsert.error;

    await Promise.all([
      createListingIntelligence(normalized),
      createFollowUpQueueItem(normalized),
      createSuppressionSignal(normalized),
    ]);

    await supabaseServer
      .from("luxury_presence_webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("external_event_id", externalEventId);

    return res.status(200).json({ received: true });
  } catch (error) {
    await supabaseServer
      .from("luxury_presence_webhook_events")
      .update({ status: "failed", error_message: error.message || "processing failed" })
      .eq("external_event_id", externalEventId);

    return res.status(500).json({ error: "processing failed" });
  }
}
