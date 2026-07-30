import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isResidentBuildingEligible,
  residentAccessCandidate,
  residentAccessShadowDecision,
} from "../src/lib/residentAccess/residentAccessV2.js";
import residentAccessHandler from "../api/resident-access-v2.js";

const activeBuilding = {
  id: "11111111-1111-4111-8111-111111111111",
  partner_status: "active",
  resident_membership_included: true,
};
const pendingBuilding = {
  id: "22222222-2222-4222-8222-222222222222",
  partner_status: "pending",
  resident_membership_included: false,
};

assert.deepEqual(residentAccessCandidate({
  candidateBuildingId: activeBuilding.id,
  role: "super_admin",
  tier: "vip",
  buildingId: pendingBuilding.id,
  email: "attacker@example.com",
}), {
  candidateBuildingId: activeBuilding.id,
  returnTo: "",
  intendedAction: "",
});
assert.throws(
  () => residentAccessCandidate({ candidateBuildingId: "the-shore", role: "resident" }),
  (error) => error.code === "BUILDING_CANDIDATE_INVALID",
);
assert.equal(isResidentBuildingEligible(activeBuilding), true);
assert.equal(isResidentBuildingEligible({ ...activeBuilding, partner_status: "pending" }), false);
assert.equal(isResidentBuildingEligible({ ...activeBuilding, resident_membership_included: false }), false);

assert.deepEqual(
  residentAccessShadowDecision({
    profile: { id: "profile-1", building_id: activeBuilding.id, resident_status: "active" },
    building: activeBuilding,
    membership: { id: "membership-1", building_id: activeBuilding.id, status: "active" },
  }),
  {
    profileExists: true,
    profileActive: true,
    candidateBuildingResolved: true,
    buildingIncluded: true,
    existingMembership: true,
    existingMembershipActive: true,
    existingBuildingMatches: true,
    proposedAction: "retain_existing_access",
  },
);
assert.equal(
  residentAccessShadowDecision({ profile: null, building: activeBuilding, membership: null }).proposedAction,
  "requires_profile_and_eligibility_verification",
);
assert.equal(
  residentAccessShadowDecision({ profile: { id: "profile-1" }, building: pendingBuilding, membership: null }).proposedAction,
  "deny",
);
assert.equal(
  residentAccessShadowDecision({ profile: null, building: null, membership: null }).proposedAction,
  "deny",
);
assert.equal(
  residentAccessShadowDecision({
    profile: { id: "profile-1", building_id: activeBuilding.id, resident_status: "active" },
    building: activeBuilding,
    membership: { id: "membership-1", building_id: activeBuilding.id, status: "cancelled" },
  }).proposedAction,
  "requires_eligibility_verification",
);

const endpoint = readFileSync("api/resident-access-v2.js", "utf8");
assert.match(endpoint, /requireAuthenticatedUser\(req\)/);
assert.match(endpoint, /requireBackendFeature\("resident_access_v2", \{ allowShadow: true \}\)/);
assert.match(endpoint, /featureState !== "shadow"/);
assert.match(endpoint, /requestIdempotencyKey\(req, \{ required: true \}\)/);
assert.match(endpoint, /applyPrivateTransactionHeaders\(res, context\)/);
assert.doesNotMatch(endpoint, /\.insert\(/);
assert.doesNotMatch(endpoint, /\.update\(/);
assert.doesNotMatch(endpoint, /\.upsert\(/);
assert.doesNotMatch(endpoint, /user_metadata/);
assert.doesNotMatch(endpoint, /req\.body\?\.(role|tier|email|status|price|access)/);

function responseRecorder() {
  const result = { headers: {}, statusCode: 200, body: null };
  return {
    result,
    setHeader(name, value) {
      result.headers[name] = value;
    },
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
      return result;
    },
  };
}

const previousFlag = process.env.DP_FEATURE_RESIDENT_ACCESS_V2;
delete process.env.DP_FEATURE_RESIDENT_ACCESS_V2;
const disabledResponse = responseRecorder();
await residentAccessHandler({
  method: "POST",
  headers: {},
  body: { candidateBuildingId: activeBuilding.id },
}, disabledResponse);
assert.equal(disabledResponse.result.statusCode, 404);
assert.equal(disabledResponse.result.body.code, "FEATURE_NOT_AVAILABLE");
assert.equal(disabledResponse.result.headers["Cache-Control"], "private, no-store");
assert.ok(disabledResponse.result.headers["X-Request-Id"]);

process.env.DP_FEATURE_RESIDENT_ACCESS_V2 = "on";
const prematureWriteResponse = responseRecorder();
await residentAccessHandler({
  method: "POST",
  headers: { "idempotency-key": "resident-write-attempt" },
  body: { candidateBuildingId: activeBuilding.id },
}, prematureWriteResponse);
assert.equal(prematureWriteResponse.result.statusCode, 503);
assert.equal(prematureWriteResponse.result.body.code, "RESIDENT_ACCESS_WRITE_NOT_READY");

if (previousFlag === undefined) delete process.env.DP_FEATURE_RESIDENT_ACCESS_V2;
else process.env.DP_FEATURE_RESIDENT_ACCESS_V2 = previousFlag;

console.log("resident access v2 shadow contract passed");
