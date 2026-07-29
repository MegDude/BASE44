import assert from "node:assert/strict";
import {
  BACKEND_V2_FLAGS,
  backendFeatureSnapshot,
  backendFeatureState,
  isBackendFeatureEnabled,
  requireBackendFeature,
} from "../src/lib/api/backendFeatureFlags.js";
import {
  applyPrivateTransactionHeaders,
  buildBackendRequestContext,
  requestCorrelationId,
  requestIdempotencyKey,
  trustedPlatformRole,
} from "../src/lib/api/backendTransactionContext.js";

assert.deepEqual(BACKEND_V2_FLAGS, [
  "resident_access_v2",
  "redemption_v2",
  "rsvp_v2",
  "survey_pipeline_v2",
  "broadcast_delivery_v2",
  "partner_reporting_v2",
  "imports_v2",
]);
assert.deepEqual(Object.values(backendFeatureSnapshot({})), Array(7).fill("off"));
assert.equal(backendFeatureState("resident_access_v2", { DP_FEATURE_RESIDENT_ACCESS_V2: "shadow" }), "shadow");
assert.equal(backendFeatureState("resident_access_v2", { DP_FEATURE_RESIDENT_ACCESS_V2: "invalid" }), "off");
assert.equal(isBackendFeatureEnabled("resident_access_v2", { DP_FEATURE_RESIDENT_ACCESS_V2: "on" }), true);
assert.throws(() => requireBackendFeature("resident_access_v2", { env: {} }), (error) => error.code === "FEATURE_NOT_AVAILABLE");
assert.equal(requireBackendFeature("resident_access_v2", { env: { DP_FEATURE_RESIDENT_ACCESS_V2: "shadow" }, allowShadow: true }), "shadow");

assert.equal(trustedPlatformRole({ app_metadata: { platform_role: "platform_admin" }, user_metadata: { role: "super_admin" } }), "platform_admin");
assert.equal(trustedPlatformRole({ app_metadata: {}, user_metadata: { role: "super_admin" } }), "authenticated");
assert.equal(requestCorrelationId({ headers: { "x-request-id": "request-12345678" } }), "request-12345678");
assert.match(requestCorrelationId({ headers: { "x-request-id": "bad" } }), /^[0-9a-f-]{36}$/);
assert.equal(requestIdempotencyKey({ headers: {} }), "");
assert.throws(() => requestIdempotencyKey({ headers: {} }, { required: true }), (error) => error.code === "IDEMPOTENCY_KEY_REQUIRED");
assert.equal(requestIdempotencyKey({ headers: { "idempotency-key": "retry-key-123" } }, { required: true }), "retry-key-123");

const context = buildBackendRequestContext(
  { method: "post", headers: { "x-request-id": "request-12345678", "idempotency-key": "retry-key-123" } },
  { requireIdempotency: true },
);
assert.equal(context.method, "POST");
assert.equal(context.requestId, "request-12345678");
assert.equal(context.idempotencyKey, "retry-key-123");
assert.equal(Object.isFrozen(context), true);

const headers = new Map();
const response = { setHeader(name, value) { headers.set(name, value); return this; } };
assert.equal(applyPrivateTransactionHeaders(response, context), response);
assert.equal(headers.get("Cache-Control"), "private, no-store");
assert.equal(headers.get("X-Request-Id"), "request-12345678");

console.log("Default-off backend v2 foundation contract: PASS");
