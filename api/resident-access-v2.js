import {
  applyPrivateTransactionHeaders,
  buildBackendRequestContext,
  requestIdempotencyKey,
} from "../src/lib/api/backendTransactionContext.js";
import { requireBackendFeature } from "../src/lib/api/backendFeatureFlags.js";
import {
  requireAuthenticatedUser,
  requireTransactionDatabase,
  TransactionApiError,
} from "../src/lib/api/transactionAuth.js";
import {
  residentAccessCandidate,
  residentAccessShadowDecision,
} from "../src/lib/residentAccess/residentAccessV2.js";

export default async function handler(req, res) {
  const context = buildBackendRequestContext(req);
  applyPrivateTransactionHeaders(res, context);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      error: "Method not allowed.",
      requestId: context.requestId,
    });
  }

  try {
    const featureState = requireBackendFeature("resident_access_v2", { allowShadow: true });
    if (featureState !== "shadow") {
      throw new TransactionApiError(
        503,
        "RESIDENT_ACCESS_WRITE_NOT_READY",
        "Resident access changes are not available yet.",
      );
    }
    requestIdempotencyKey(req, { required: true });

    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);
    const candidate = residentAccessCandidate(req.body);

    const [{ data: profile, error: profileError }, { data: building, error: buildingError }] = await Promise.all([
      database
        .from("resident_profiles")
        .select("id,auth_user_id,building_id,resident_status")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
      database
        .from("resident_membership_buildings")
        .select("id,partner_status,resident_membership_included")
        .eq("id", candidate.candidateBuildingId)
        .maybeSingle(),
    ]);

    if (profileError) {
      throw new TransactionApiError(500, "PROFILE_LOOKUP_FAILED", "We couldn't evaluate resident access.");
    }
    if (buildingError) {
      throw new TransactionApiError(500, "BUILDING_LOOKUP_FAILED", "We couldn't evaluate resident access.");
    }

    let membership = null;
    if (profile?.id) {
      const { data, error } = await database
        .from("resident_memberships")
        .select("id,resident_id,building_id,status")
        .eq("resident_id", profile.id)
        .eq("building_id", candidate.candidateBuildingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        throw new TransactionApiError(500, "MEMBERSHIP_LOOKUP_FAILED", "We couldn't evaluate resident access.");
      }
      membership = data;
    }

    return res.status(200).json({
      ok: true,
      mode: "shadow",
      requestId: context.requestId,
      comparison: residentAccessShadowDecision({ profile, building, membership }),
    });
  } catch (error) {
    if (error instanceof TransactionApiError) {
      return res.status(error.status).json({
        ok: false,
        code: error.code,
        error: error.message,
        requestId: context.requestId,
      });
    }
    console.error("[resident-access-v2]", context.requestId, error);
    return res.status(500).json({
      ok: false,
      code: "RESIDENT_ACCESS_EVALUATION_FAILED",
      error: "We couldn't evaluate resident access.",
      requestId: context.requestId,
    });
  }
}
