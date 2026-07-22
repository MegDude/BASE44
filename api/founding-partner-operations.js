import {
  requireAuthenticatedUser,
  sendTransactionError,
  TransactionApiError,
} from "../src/lib/api/transactionAuth.js";
import {
  collectionAdditionalRoutes,
  collectionLaunchSequence,
  collectionOperatingGoals,
  collectionPriorityTargets,
  collectionResidentialRoutes,
  collectionSuccessMeasures,
  collectionTechnicalNotes,
  collectionWorkingRecords,
} from "../src/server/foundingPartnerCollectionOperations.js";
import {
  collectionResolvedBriefMeta,
  collectionResolvedBuildingDirectory,
  collectionResolvedTargetDirectory,
} from "../src/server/foundingPartnerTargetDirectoryResolved.js";
import {
  collectionForwardableNote,
  collectionIntroductionPriorities,
  collectionPilotOptions,
  collectionWarmRelationships,
} from "../src/server/foundingPartnerBriefSupport.js";

const DEFAULT_OPERATOR_EMAILS = ["me@megdude.com"];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function operatorEmails() {
  return Array.from(new Set([
    ...DEFAULT_OPERATOR_EMAILS,
    ...String(process.env.SUPER_ADMIN_EMAILS || process.env.FOUNDING_PARTNER_OPERATOR_EMAILS || "")
      .split(",")
      .map(normalize)
      .filter(Boolean),
  ]));
}

function canAccessOperations(user) {
  const role = normalize(user?.app_metadata?.role || user?.user_metadata?.role || user?.role);
  const email = normalize(user?.email);
  return ["admin", "super_admin"].includes(role) || Boolean(email && operatorEmails().includes(email));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");

  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", error: "Method not allowed" });
    }

    const user = await requireAuthenticatedUser(req);
    if (!canAccessOperations(user)) {
      throw new TransactionApiError(403, "COLLECTION_OPERATIONS_FORBIDDEN", "Authorized Downtown Perks operator access is required.");
    }

    return res.status(200).json({
      ok: true,
      data: {
        briefMeta: collectionResolvedBriefMeta,
        targetDirectory: collectionResolvedTargetDirectory,
        buildingDirectory: collectionResolvedBuildingDirectory,
        warmRelationships: collectionWarmRelationships,
        introductionPriorities: collectionIntroductionPriorities,
        pilotOptions: collectionPilotOptions,
        forwardableNote: collectionForwardableNote,
        operatingGoals: collectionOperatingGoals,
        priorityTargets: collectionPriorityTargets,
        residentialRoutes: collectionResidentialRoutes,
        additionalRoutes: collectionAdditionalRoutes,
        technicalNotes: collectionTechnicalNotes,
        launchSequence: collectionLaunchSequence,
        successMeasures: collectionSuccessMeasures,
        workingRecords: collectionWorkingRecords,
        reconciledAt: "2026-07-22",
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
