import { TransactionApiError } from "./transactionAuth.js";

export const BACKEND_V2_FLAGS = Object.freeze([
  "resident_access_v2",
  "redemption_v2",
  "rsvp_v2",
  "survey_pipeline_v2",
  "broadcast_delivery_v2",
  "partner_reporting_v2",
  "imports_v2",
]);

const ENV_BY_FLAG = Object.freeze({
  resident_access_v2: "DP_FEATURE_RESIDENT_ACCESS_V2",
  redemption_v2: "DP_FEATURE_REDEMPTION_V2",
  rsvp_v2: "DP_FEATURE_RSVP_V2",
  survey_pipeline_v2: "DP_FEATURE_SURVEY_PIPELINE_V2",
  broadcast_delivery_v2: "DP_FEATURE_BROADCAST_DELIVERY_V2",
  partner_reporting_v2: "DP_FEATURE_PARTNER_REPORTING_V2",
  imports_v2: "DP_FEATURE_IMPORTS_V2",
});

const VALID_STATES = new Set(["off", "shadow", "on"]);

export function backendFeatureState(flag, env = process.env) {
  if (!BACKEND_V2_FLAGS.includes(flag)) {
    throw new TransactionApiError(500, "FEATURE_FLAG_UNKNOWN", "The requested backend capability is not registered.");
  }
  const raw = String(env?.[ENV_BY_FLAG[flag]] || "off").trim().toLowerCase();
  return VALID_STATES.has(raw) ? raw : "off";
}

export function backendFeatureSnapshot(env = process.env) {
  return Object.fromEntries(BACKEND_V2_FLAGS.map((flag) => [flag, backendFeatureState(flag, env)]));
}

export function requireBackendFeature(flag, options = {}) {
  const state = backendFeatureState(flag, options.env);
  if (state === "on" || (state === "shadow" && options.allowShadow === true)) return state;
  throw new TransactionApiError(404, "FEATURE_NOT_AVAILABLE", "This capability is not available.");
}

export function isBackendFeatureEnabled(flag, env = process.env) {
  return backendFeatureState(flag, env) === "on";
}
