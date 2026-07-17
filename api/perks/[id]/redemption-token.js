import { randomUUID } from "node:crypto";
import { supabaseServer } from "../../../src/lib/supabaseServer.js";

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
  if (!supabaseServer) return { table, status: "unavailable", reason: "supabase_not_configured" };
  try {
    const { error } = await supabaseServer.from(table).insert(row);
    return error ? { table, status: "skipped", reason: error.message } : { table, status: "stored" };
  } catch (error) {
    return { table, status: "skipped", reason: error?.message || "insert_failed" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const perkId = clean(req.query?.id || body.entityId || body.perkId || body.entity?.id, 180);
  const profileId = clean(body.profileId || body.uid || body.residentId, 180);
  const cardId = clean(body.cardId || body.metadata?.cardId, 180);
  const qrPayload = clean(body.qrPayload || body.token || body.qrValue || body.metadata?.qrValue, 1800);
  const expiresAt = clean(body.expiresAt || body.form?.expiresAt || body.metadata?.expiresAt, 80);

  if (!perkId || !profileId || !cardId || !qrPayload) {
    return res.status(400).json({
      error: "A perk, resident profile, card, and QR payload are required to prepare redemption.",
    });
  }

  const redemptionId = `redemption-${randomUUID()}`;
  const issuedAt = new Date().toISOString();
  const metadata = {
    ...body.metadata,
    redemptionId,
    perkId,
    profileId,
    cardId,
    qrPayload,
    issuedAt,
    expiresAt: expiresAt || null,
    source: clean(body.source, 120) || "resident_map",
    status: "ready",
  };

  const writes = [];
  writes.push(await insertBestEffort("perk_redemptions", {
    perk_id: nullableUuid(perkId),
    source: metadata.source,
    status: "ready",
    metadata,
  }));
  writes.push(await insertBestEffort("resident_activity", {
    entity_id: nullableUuid(perkId),
    entity_type: "perk",
    activity_type: "redemption_token_issued",
    points: 0,
    source: metadata.source,
    status: "active",
    metadata,
  }));

  const persisted = writes.some((write) => write.status === "stored");
  return res.status(200).json({
    ok: true,
    redemption: {
      id: redemptionId,
      perkId,
      profileId,
      cardId,
      qrPayload,
      status: "ready",
      issuedAt,
      expiresAt: expiresAt || null,
    },
    storage: { persisted, writes },
    writeMode: persisted ? "durable" : "demo_session_only",
  });
}
