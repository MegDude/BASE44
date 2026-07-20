import { randomBytes } from "node:crypto";
import {
  hashOpaqueToken,
  requireResidentProfile,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const { profile } = await requireResidentProfile(req);
    const purpose = String(req.body?.purpose || "resident_pass");
    const perkReference = String(req.body?.perkId || "").trim().slice(0, 180);
    let perkId = "";
    if (!new Set(["resident_pass", "perk_redemption", "check_in"]).has(purpose)) {
      throw new TransactionApiError(400, "PURPOSE_INVALID", "Choose a valid pass action.");
    }
    if (purpose === "perk_redemption" && !perkReference) {
      throw new TransactionApiError(400, "PERK_REQUIRED", "Choose a perk before showing its QR code.");
    }

    if (perkReference) {
      const safeReference = perkReference.replace(/[,()]/g, "");
      const { data: perk, error: perkError } = await database
        .from("perks")
        .select("id,status,valid_from,valid_until")
        .or(UUID.test(perkReference) ? `id.eq.${perkReference},external_id.eq.${safeReference}` : `external_id.eq.${safeReference}`)
        .maybeSingle();
      const now = Date.now();
      if (perkError || !perk || perk.status !== "active" || (perk.valid_from && Date.parse(perk.valid_from) > now) || (perk.valid_until && Date.parse(perk.valid_until) < now)) {
        throw new TransactionApiError(409, "PERK_UNAVAILABLE", "This perk is not available right now.");
      }
      perkId = perk.id;
    }

    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + (purpose === "resident_pass" ? 300 : 180) * 1000).toISOString();
    const { data: session, error } = await database
      .from("resident_qr_sessions")
      .insert({
        resident_profile_id: profile.id,
        perk_id: perkId || null,
        token_hash: hashOpaqueToken(rawToken),
        purpose,
        expires_at: expiresAt,
      })
      .select("id,expires_at")
      .single();
    if (error || !session) throw error || new Error("qr_session_not_created");

    await database.from("user_activity_events").insert({
      resident_profile_id: profile.id,
      perk_id: perkId || null,
      entity_type: perkId ? "perk" : "resident_pass",
      entity_id: perkId || session.id,
      event_type: "qr_displayed",
      source_surface: String(req.body?.sourceSurface || "resident_pass").slice(0, 120),
      metadata: { purpose, qrSessionId: session.id },
    });

    const origin = `https://${req.headers?.["x-forwarded-host"] || req.headers?.host || "platform.downtownperks.com"}`;
    return res.status(201).json({
      ok: true,
      sessionId: session.id,
      token: rawToken,
      qrValue: `${origin}/r/${encodeURIComponent(rawToken)}`,
      expiresAt: session.expires_at,
      purpose,
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
