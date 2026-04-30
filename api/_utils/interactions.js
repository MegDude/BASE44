import { supabaseServer } from "../../src/lib/supabaseServer.js";

function cleanString(value, max = 160) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

function cleanNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function cleanUuid(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed)
    ? trimmed
    : null;
}

export async function logInteraction({
  type,
  entityId = null,
  entityType = null,
  partnerId = null,
  sponsorId = null,
  userId = null,
  sessionId = null,
  brandKey = null,
  source = null,
  district = null,
  valueCents = 0,
  metadata = {},
} = {}) {
  if (!supabaseServer || !type) return { ok: false, skipped: true };

  const payload = {
    type: cleanString(type, 96),
    entity_id: cleanString(entityId, 128),
    entity_type: cleanString(entityType, 80),
    partner_id: cleanUuid(partnerId),
    sponsor_id: cleanUuid(sponsorId),
    user_id: cleanString(userId, 128),
    session_id: cleanString(sessionId, 128),
    brand_key: cleanString(brandKey, 128),
    source: cleanString(source, 160),
    district: cleanString(district, 96),
    value_cents: cleanNumber(valueCents),
    metadata_json: metadata && typeof metadata === "object" ? metadata : {},
  };

  const { error } = await supabaseServer.from("interactions").insert(payload);

  if (error) {
    console.error("logInteraction failed", error);
    return { ok: false, error };
  }

  return { ok: true };
}

export function demandScore(snapshot = {}) {
  return (
    Number(snapshot.saves || 0) * 0.5 +
    Number(snapshot.visits || 0) * 0.3 +
    Number(snapshot.impressions || 0) * 0.2 +
    Number(snapshot.redemptions || 0) * 0.8
  );
}

export function trendBoost(current = {}, previous = null) {
  if (!previous) return 1;

  const growth =
    (Number(current.score || 0) - Number(previous.score || 0)) /
    (Number(previous.score || 0) + 1);

  return 1 + Math.max(0, growth);
}

export function pricingModel(score = 0) {
  if (score > 50) {
    return { bid: 150, budget: 5000, confidence: 0.82 };
  }

  if (score > 20) {
    return { bid: 100, budget: 3000, confidence: 0.72 };
  }

  return { bid: 50, budget: 1500, confidence: 0.6 };
}

export function computeSpend(impressions = 0, cpmCents = 500) {
  return Math.floor((Number(impressions || 0) / 1000) * Number(cpmCents || 0));
}
