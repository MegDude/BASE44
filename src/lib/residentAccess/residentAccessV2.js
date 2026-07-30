import { TransactionApiError } from "../api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value, max = 300) => String(value || "").trim().slice(0, max);

export function residentAccessCandidate(body) {
  const candidateBuildingId = clean(body?.candidateBuildingId, 80);
  if (!UUID.test(candidateBuildingId)) {
    throw new TransactionApiError(400, "BUILDING_CANDIDATE_INVALID", "Choose a valid building to continue.");
  }

  return Object.freeze({
    candidateBuildingId,
    returnTo: clean(body?.returnTo, 300),
    intendedAction: clean(body?.intendedAction, 100),
  });
}

export function isResidentBuildingEligible(building) {
  return building?.partner_status === "active" && building?.resident_membership_included === true;
}

export function residentAccessShadowDecision({ profile, building, membership }) {
  const candidateBuildingResolved = Boolean(building?.id);
  const buildingIncluded = candidateBuildingResolved && isResidentBuildingEligible(building);
  const profileExists = Boolean(profile?.id);
  const existingMembership = Boolean(membership?.id);
  const profileActive = profile?.resident_status === "active";
  const existingMembershipActive = membership?.status === "active";
  const existingBuildingMatches = Boolean(
    building?.id
      && (
        profile?.building_id === building.id
        || membership?.building_id === building.id
      ),
  );

  let proposedAction = "deny";
  if (
    buildingIncluded
    && profileExists
    && profileActive
    && existingMembership
    && existingMembershipActive
    && existingBuildingMatches
  ) {
    proposedAction = "retain_existing_access";
  } else if (buildingIncluded && profileExists) {
    proposedAction = "requires_eligibility_verification";
  } else if (buildingIncluded) {
    proposedAction = "requires_profile_and_eligibility_verification";
  }

  return Object.freeze({
    profileExists,
    profileActive,
    candidateBuildingResolved,
    buildingIncluded,
    existingMembership,
    existingMembershipActive,
    existingBuildingMatches,
    proposedAction,
  });
}
