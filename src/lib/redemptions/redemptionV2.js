import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { TransactionApiError } from "../api/transactionAuth.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_VERSION = "dpqr1";
const MIN_SECRET_LENGTH = 32;
const MAX_TOKEN_SECONDS = 300;
const clean = (value, max = 300) => String(value || "").trim().slice(0, max);

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function parseBase64urlJson(value) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new TransactionApiError(400, "QR_TOKEN_INVALID", "Scan a valid Downtown Perks code.");
  }
}

function signingSecret(secret) {
  const value = clean(secret, 1000);
  if (value.length < MIN_SECRET_LENGTH) {
    throw new TransactionApiError(503, "QR_SIGNING_UNAVAILABLE", "Secure QR validation is not available.");
  }
  return value;
}

function signature(payloadSegment, secret) {
  return createHmac("sha256", signingSecret(secret))
    .update(`${TOKEN_VERSION}.${payloadSegment}`)
    .digest("base64url");
}

export function redemptionIssueCandidate(body) {
  const perkId = clean(body?.perkId, 80);
  if (!UUID.test(perkId)) {
    throw new TransactionApiError(400, "PERK_INVALID", "Choose a valid perk.");
  }
  return Object.freeze({
    perkId,
    sourceSurface: clean(body?.sourceSurface, 100) || "resident_perk",
  });
}

export function redemptionVerifyCandidate(body) {
  const token = clean(body?.token, 1800);
  const locationId = clean(body?.locationId, 80);
  if (token.length < 80) {
    throw new TransactionApiError(400, "QR_TOKEN_REQUIRED", "Scan a valid Downtown Perks code.");
  }
  if (locationId && !UUID.test(locationId)) {
    throw new TransactionApiError(400, "LOCATION_INVALID", "Choose a valid partner location.");
  }
  return Object.freeze({ token, locationId: locationId || null });
}

export function signRedemptionToken(input, options = {}) {
  const nowSeconds = Math.floor((options.nowMs ?? Date.now()) / 1000);
  const expiresInSeconds = Math.max(60, Math.min(MAX_TOKEN_SECONDS, Number(options.expiresInSeconds) || 180));
  for (const field of ["sessionId", "residentProfileId", "perkId"]) {
    if (!UUID.test(clean(input?.[field], 80))) {
      throw new TransactionApiError(500, "QR_TOKEN_CONTEXT_INVALID", "Secure QR context is incomplete.");
    }
  }

  const payload = Object.freeze({
    sid: input.sessionId,
    rid: input.residentProfileId,
    pid: input.perkId,
    iat: nowSeconds,
    exp: nowSeconds + expiresInSeconds,
    nonce: randomBytes(12).toString("base64url"),
  });
  const payloadSegment = base64urlJson(payload);
  return `${TOKEN_VERSION}.${payloadSegment}.${signature(payloadSegment, options.secret)}`;
}

export function verifyRedemptionToken(token, options = {}) {
  const [version, payloadSegment, suppliedSignature, extra] = clean(token, 1800).split(".");
  if (version !== TOKEN_VERSION || !payloadSegment || !suppliedSignature || extra) {
    throw new TransactionApiError(400, "QR_TOKEN_INVALID", "Scan a valid Downtown Perks code.");
  }

  const expectedSignature = signature(payloadSegment, options.secret);
  const expected = Buffer.from(expectedSignature);
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new TransactionApiError(400, "QR_TOKEN_INVALID", "Scan a valid Downtown Perks code.");
  }

  const payload = parseBase64urlJson(payloadSegment);
  if (!UUID.test(payload?.sid) || !UUID.test(payload?.rid) || !UUID.test(payload?.pid)) {
    throw new TransactionApiError(400, "QR_TOKEN_INVALID", "Scan a valid Downtown Perks code.");
  }
  const nowSeconds = Math.floor((options.nowMs ?? Date.now()) / 1000);
  if (!Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) || payload.exp <= nowSeconds) {
    throw new TransactionApiError(410, "QR_TOKEN_EXPIRED", "This code has expired. Ask the resident to refresh it.");
  }
  if (payload.exp - payload.iat > MAX_TOKEN_SECONDS || payload.iat > nowSeconds + 30) {
    throw new TransactionApiError(400, "QR_TOKEN_INVALID", "Scan a valid Downtown Perks code.");
  }
  return Object.freeze(payload);
}

export function redemptionIssueShadowDecision({ profile, membership, perk }, nowMs = Date.now()) {
  const profileActive = profile?.resident_status === "active";
  const membershipActive = membership?.status === "active";
  const membershipCurrent = !membership?.expires_at || Date.parse(membership.expires_at) > nowMs;
  const buildingMatches = !profile?.building_id
    || !membership?.building_id
    || profile.building_id === membership.building_id;
  const perkActive = perk?.status === "active";
  const startsAt = perk?.starts_at ? Date.parse(perk.starts_at) : null;
  const endsAt = perk?.ends_at ? Date.parse(perk.ends_at) : null;
  const withinWindow = (!startsAt || startsAt <= nowMs) && (!endsAt || endsAt >= nowMs);
  const eligible = Boolean(
    profile?.id
      && profileActive
      && membership?.id
      && membershipActive
      && membershipCurrent
      && buildingMatches
      && perk?.id
      && perkActive
      && withinWindow,
  );
  return Object.freeze({
    profileExists: Boolean(profile?.id),
    profileActive,
    membershipActive,
    membershipCurrent,
    buildingMatches,
    perkResolved: Boolean(perk?.id),
    perkActive,
    withinWindow,
    proposedAction: eligible ? "issue_short_lived_token" : "deny",
  });
}

export function redemptionVerifyShadowDecision({ membership, session, perk, payload, locationId }, nowMs = Date.now()) {
  const partnerActive = membership?.active === true;
  const sessionMatches = Boolean(
    session?.id
      && session.id === payload?.sid
      && session.resident_profile_id === payload?.rid
      && session.perk_id === payload?.pid,
  );
  const sessionUsable = sessionMatches
    && !session?.consumed_at
    && !session?.revoked_at
    && Date.parse(session?.expires_at || "") > nowMs;
  const partnerMatches = Boolean(perk?.partner_id && perk.partner_id === membership?.partner_id);
  const locationMatches = !locationId || !perk?.location_id || perk.location_id === locationId;
  const authorizedLocations = Array.isArray(membership?.location_ids) ? membership.location_ids : [];
  const membershipLocationAuthorized = !locationId
    || authorizedLocations.length === 0
    || authorizedLocations.includes(locationId);
  const startsAt = perk?.starts_at ? Date.parse(perk.starts_at) : null;
  const endsAt = perk?.ends_at ? Date.parse(perk.ends_at) : null;
  const perkCurrent = perk?.status === "active"
    && (!startsAt || startsAt <= nowMs)
    && (!endsAt || endsAt >= nowMs);
  const eligible = partnerActive
    && sessionUsable
    && partnerMatches
    && locationMatches
    && membershipLocationAuthorized
    && perkCurrent;
  return Object.freeze({
    partnerActive,
    sessionMatches,
    sessionUsable,
    partnerMatches,
    locationMatches,
    membershipLocationAuthorized,
    perkCurrent,
    proposedAction: eligible ? "validate_atomically" : "deny",
  });
}
