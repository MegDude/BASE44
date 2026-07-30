import {
  applyPrivateTransactionHeaders,
  buildBackendRequestContext,
  requestIdempotencyKey,
} from "../../src/lib/api/backendTransactionContext.js";
import { requireBackendFeature } from "../../src/lib/api/backendFeatureFlags.js";
import {
  hashOpaqueToken,
  requireAuthenticatedUser,
  requireTransactionDatabase,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";
import {
  redemptionVerifyCandidate,
  redemptionVerifyShadowDecision,
  verifyRedemptionToken,
} from "../../src/lib/redemptions/redemptionV2.js";

export default async function handler(req, res) {
  const context = buildBackendRequestContext(req);
  applyPrivateTransactionHeaders(res, context);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", error: "Method not allowed.", requestId: context.requestId });
  }

  try {
    const state = requireBackendFeature("redemption_v2", { allowShadow: true });
    if (state !== "shadow") {
      throw new TransactionApiError(503, "REDEMPTION_WRITE_NOT_READY", "Secure QR verification is not available yet.");
    }
    requestIdempotencyKey(req, { required: true });
    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);
    const candidate = redemptionVerifyCandidate(req.body);
    const payload = verifyRedemptionToken(candidate.token, { secret: process.env.DP_REDEMPTION_SIGNING_SECRET });

    const [{ data: membership, error: membershipError }, { data: session, error: sessionError }] = await Promise.all([
      database
        .from("partner_users")
        .select("id,partner_id,role,location_ids,active")
        .eq("auth_user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      database
        .from("resident_qr_sessions")
        .select("id,resident_profile_id,perk_id,token_hash,purpose,expires_at,consumed_at,revoked_at")
        .eq("id", payload.sid)
        .eq("token_hash", hashOpaqueToken(candidate.token))
        .maybeSingle(),
    ]);
    if (membershipError) throw new TransactionApiError(500, "PARTNER_LOOKUP_FAILED", "We couldn't evaluate this scan.");
    if (!membership) throw new TransactionApiError(403, "PARTNER_ACCESS_REQUIRED", "Partner access is required.");
    if (sessionError) throw new TransactionApiError(500, "QR_LOOKUP_FAILED", "We couldn't evaluate this scan.");

    const { data: perk, error: perkError } = await database
      .from("perks")
      .select("id,partner_id,location_id,status,starts_at,ends_at")
      .eq("id", payload.pid)
      .maybeSingle();
    if (perkError) throw new TransactionApiError(500, "PERK_LOOKUP_FAILED", "We couldn't evaluate this scan.");

    return res.status(200).json({
      ok: true,
      mode: "shadow",
      requestId: context.requestId,
      comparison: redemptionVerifyShadowDecision({
        membership,
        session,
        perk,
        payload,
        locationId: candidate.locationId,
      }),
    });
  } catch (error) {
    if (error instanceof TransactionApiError) {
      return res.status(error.status).json({ ok: false, code: error.code, error: error.message, requestId: context.requestId });
    }
    console.error("[redemption-v2-verify]", context.requestId, error);
    return res.status(500).json({ ok: false, code: "REDEMPTION_EVALUATION_FAILED", error: "We couldn't evaluate this scan.", requestId: context.requestId });
  }
}
