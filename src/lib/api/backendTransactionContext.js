import { createHash, randomUUID } from "node:crypto";
import { TransactionApiError } from "./transactionAuth.js";

const clean = (value, max = 180) => String(value || "").trim().slice(0, max);
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{7,127}$/;

export function trustedPlatformRole(user) {
  const app = user?.app_metadata || {};
  if (app.is_super_admin === true) return "super_admin";
  return clean(app.platform_role || app.role, 80).toLowerCase() || "authenticated";
}

export function requestCorrelationId(req) {
  const supplied = clean(req?.headers?.["x-request-id"], 128);
  return REQUEST_ID_PATTERN.test(supplied) ? supplied : randomUUID();
}

export function requestIdempotencyKey(req, options = {}) {
  const key = clean(req?.headers?.["idempotency-key"], 180);
  if (!key && options.required !== true) return "";
  if (key.length < 8) {
    throw new TransactionApiError(400, "IDEMPOTENCY_KEY_REQUIRED", "A valid request key is required.");
  }
  return key;
}

export function buildBackendRequestContext(req, options = {}) {
  return Object.freeze({
    requestId: requestCorrelationId(req),
    idempotencyKey: requestIdempotencyKey(req, { required: options.requireIdempotency === true }),
    method: clean(req?.method, 12).toUpperCase(),
  });
}

export function applyPrivateTransactionHeaders(res, context) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Request-Id", context.requestId);
  return res;
}

export function hashRequestAddress(req, salt = process.env.AUDIT_IP_HASH_SALT) {
  const address = clean(req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress, 240).split(",")[0].trim();
  if (!address || !salt) return null;
  return createHash("sha256").update(`${salt}:${address}`).digest("hex");
}

export async function writePlatformAuditEvent(database, input) {
  const actorUserId = clean(input?.actor?.id, 80);
  const action = clean(input?.action, 120);
  if (!actorUserId || !action) {
    throw new TransactionApiError(500, "AUDIT_CONTEXT_INVALID", "Audit context is incomplete.");
  }

  const metadata = {
    ...(input.metadata && typeof input.metadata === "object" ? input.metadata : {}),
    requestId: clean(input.requestId, 128) || null,
    result: clean(input.result, 40) || "unknown",
  };
  const { error } = await database.from("platform_audit_events").insert({
    actor_user_id: actorUserId,
    actor_role: trustedPlatformRole(input.actor),
    action,
    target_type: clean(input.targetType, 100) || null,
    target_id: clean(input.targetId, 180) || null,
    workspace_id: clean(input.workspaceId, 180) || null,
    metadata,
  });
  if (error) throw new TransactionApiError(500, "AUDIT_WRITE_FAILED", "The action could not be audited.");
}
