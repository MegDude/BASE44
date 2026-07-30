import {
  applyPrivateTransactionHeaders,
  buildBackendRequestContext,
  requestIdempotencyKey,
} from "../../src/lib/api/backendTransactionContext.js";
import { requireBackendFeature } from "../../src/lib/api/backendFeatureFlags.js";
import {
  requireAuthenticatedUser,
  requireTransactionDatabase,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";
import {
  redemptionIssueCandidate,
  redemptionIssueShadowDecision,
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
      throw new TransactionApiError(503, "REDEMPTION_WRITE_NOT_READY", "Secure QR issuance is not available yet.");
    }
    requestIdempotencyKey(req, { required: true });
    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);
    const candidate = redemptionIssueCandidate(req.body);

    const { data: profile, error: profileError } = await database
      .from("resident_profiles")
      .select("id,building_id,resident_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (profileError) throw new TransactionApiError(500, "PROFILE_LOOKUP_FAILED", "We couldn't evaluate this QR request.");

    const [{ data: membership, error: membershipError }, { data: perk, error: perkError }] = await Promise.all([
      profile?.id
        ? database
          .from("resident_memberships")
          .select("id,resident_id,building_id,status,expires_at")
          .eq("resident_id", profile.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      database
        .from("perks")
        .select("id,partner_id,partner_organization_id,listing_id,location_id,status,starts_at,ends_at,redemption_window_seconds")
        .eq("id", candidate.perkId)
        .maybeSingle(),
    ]);
    if (membershipError) throw new TransactionApiError(500, "MEMBERSHIP_LOOKUP_FAILED", "We couldn't evaluate this QR request.");
    if (perkError) throw new TransactionApiError(500, "PERK_LOOKUP_FAILED", "We couldn't evaluate this QR request.");

    return res.status(200).json({
      ok: true,
      mode: "shadow",
      requestId: context.requestId,
      comparison: redemptionIssueShadowDecision({ profile, membership, perk }),
    });
  } catch (error) {
    if (error instanceof TransactionApiError) {
      return res.status(error.status).json({ ok: false, code: error.code, error: error.message, requestId: context.requestId });
    }
    console.error("[redemption-v2-issue]", context.requestId, error);
    return res.status(500).json({ ok: false, code: "REDEMPTION_EVALUATION_FAILED", error: "We couldn't evaluate this QR request.", requestId: context.requestId });
  }
}
