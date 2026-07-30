import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import issueHandler from "../api/redemptions/issue.js";
import verifyHandler from "../api/redemptions/verify.js";
import {
  redemptionIssueCandidate,
  redemptionIssueShadowDecision,
  redemptionVerifyShadowDecision,
  signRedemptionToken,
  verifyRedemptionToken,
} from "../src/lib/redemptions/redemptionV2.js";

const ids = {
  sessionId: "11111111-1111-4111-8111-111111111111",
  residentProfileId: "22222222-2222-4222-8222-222222222222",
  perkId: "33333333-3333-4333-8333-333333333333",
  partnerId: "44444444-4444-4444-8444-444444444444",
};
const secret = "test-only-redemption-signing-secret-32-chars";
const nowMs = Date.parse("2026-07-29T20:00:00Z");

assert.deepEqual(redemptionIssueCandidate({
  perkId: ids.perkId,
  residentId: "attacker-selected-resident",
  partnerId: "attacker-selected-partner",
  role: "super_admin",
}), { perkId: ids.perkId, sourceSurface: "resident_perk" });
assert.throws(() => redemptionIssueCandidate({ perkId: "demo-perk" }), (error) => error.code === "PERK_INVALID");

const token = signRedemptionToken(ids, { secret, nowMs, expiresInSeconds: 180 });
const payload = verifyRedemptionToken(token, { secret, nowMs: nowMs + 1000 });
assert.equal(payload.sid, ids.sessionId);
assert.equal(payload.rid, ids.residentProfileId);
assert.equal(payload.pid, ids.perkId);
assert.throws(
  () => verifyRedemptionToken(`${token.slice(0, -1)}x`, { secret, nowMs }),
  (error) => error.code === "QR_TOKEN_INVALID",
);
assert.throws(
  () => verifyRedemptionToken(token, { secret, nowMs: nowMs + 181_000 }),
  (error) => error.code === "QR_TOKEN_EXPIRED",
);
assert.throws(
  () => signRedemptionToken(ids, { secret: "short", nowMs }),
  (error) => error.code === "QR_SIGNING_UNAVAILABLE",
);

const activePerk = {
  id: ids.perkId,
  partner_id: ids.partnerId,
  status: "active",
  starts_at: "2026-07-29T19:00:00Z",
  ends_at: "2026-07-29T21:00:00Z",
};
assert.equal(redemptionIssueShadowDecision({
  profile: { id: ids.residentProfileId, building_id: ids.sessionId, resident_status: "active" },
  membership: { id: "membership", building_id: ids.sessionId, status: "active" },
  perk: activePerk,
}, nowMs).proposedAction, "issue_short_lived_token");
assert.equal(redemptionIssueShadowDecision({
  profile: { id: ids.residentProfileId, resident_status: "active" },
  membership: { id: "membership", status: "cancelled" },
  perk: activePerk,
}, nowMs).proposedAction, "deny");

const session = {
  id: ids.sessionId,
  resident_profile_id: ids.residentProfileId,
  perk_id: ids.perkId,
  expires_at: new Date(Date.now() + 60_000).toISOString(),
  consumed_at: null,
  revoked_at: null,
};
assert.equal(redemptionVerifyShadowDecision({
  membership: { partner_id: ids.partnerId, active: true },
  session,
  perk: activePerk,
  payload,
  locationId: null,
}, nowMs).proposedAction, "validate_atomically");
assert.equal(redemptionVerifyShadowDecision({
  membership: { partner_id: "55555555-5555-4555-8555-555555555555", active: true },
  session,
  perk: activePerk,
  payload,
  locationId: null,
}, nowMs).proposedAction, "deny");
assert.equal(redemptionVerifyShadowDecision({
  membership: { partner_id: ids.partnerId, active: true },
  session: { ...session, consumed_at: new Date().toISOString() },
  perk: activePerk,
  payload,
  locationId: null,
}, nowMs).proposedAction, "deny");

for (const path of ["api/redemptions/issue.js", "api/redemptions/verify.js"]) {
  const source = readFileSync(path, "utf8");
  assert.match(source, /requireBackendFeature\("redemption_v2", \{ allowShadow: true \}\)/);
  assert.match(source, /state !== "shadow"/);
  assert.match(source, /requireAuthenticatedUser\(req\)/);
  assert.match(source, /requestIdempotencyKey\(req, \{ required: true \}\)/);
  assert.match(source, /applyPrivateTransactionHeaders\(res, context\)/);
  assert.doesNotMatch(source, /\.insert\(/);
  assert.doesNotMatch(source, /\.update\(/);
  assert.doesNotMatch(source, /\.upsert\(/);
  assert.doesNotMatch(source, /user_metadata/);
}

function responseRecorder() {
  const result = { headers: {}, statusCode: 200, body: null };
  return {
    result,
    setHeader(name, value) { result.headers[name] = value; },
    status(statusCode) { result.statusCode = statusCode; return this; },
    json(body) { result.body = body; return result; },
  };
}

const previousFlag = process.env.DP_FEATURE_REDEMPTION_V2;
delete process.env.DP_FEATURE_REDEMPTION_V2;
for (const handler of [issueHandler, verifyHandler]) {
  const response = responseRecorder();
  await handler({ method: "POST", headers: {}, body: {} }, response);
  assert.equal(response.result.statusCode, 404);
  assert.equal(response.result.body.code, "FEATURE_NOT_AVAILABLE");
  assert.equal(response.result.headers["Cache-Control"], "private, no-store");
  assert.ok(response.result.headers["X-Request-Id"]);
}
if (previousFlag === undefined) delete process.env.DP_FEATURE_REDEMPTION_V2;
else process.env.DP_FEATURE_REDEMPTION_V2 = previousFlag;

console.log("redemption v2 shadow contract passed");
