import { createHash } from "node:crypto";
import { supabaseServer } from "../supabaseServer.js";

export class TransactionApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "TransactionApiError";
    this.status = status;
    this.code = code;
  }
}

function bearerToken(req) {
  const header = String(req.headers?.authorization || "");
  return header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
}

export function requireTransactionDatabase() {
  if (!supabaseServer) {
    throw new TransactionApiError(503, "DATABASE_UNAVAILABLE", "Account storage is not available right now.");
  }
  return supabaseServer;
}

export async function requireAuthenticatedUser(req) {
  const database = requireTransactionDatabase();
  const token = bearerToken(req);
  if (!token) throw new TransactionApiError(401, "AUTH_REQUIRED", "Sign in to continue.");

  const { data, error } = await database.auth.getUser(token);
  if (error || !data?.user) throw new TransactionApiError(401, "AUTH_INVALID", "Your session has expired. Sign in again.");
  return data.user;
}

export async function requireResidentProfile(req) {
  const database = requireTransactionDatabase();
  const user = await requireAuthenticatedUser(req);
  const { data: existing, error } = await database
    .from("resident_profiles")
    .select("id,auth_user_id,building_id,first_name,last_name,email,resident_status,consent_personalization")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) throw new TransactionApiError(500, "PROFILE_LOOKUP_FAILED", "We couldn't load your resident profile.");
  if (existing) {
    if (existing.resident_status !== "active") throw new TransactionApiError(403, "RESIDENT_INACTIVE", "Resident access is not active.");
    return { user, profile: existing };
  }

  const metadata = user.user_metadata || {};
  const { data: created, error: createError } = await database
    .from("resident_profiles")
    .insert({
      auth_user_id: user.id,
      email: user.email || null,
      first_name: String(metadata.first_name || metadata.given_name || "").trim() || null,
      last_name: String(metadata.last_name || metadata.family_name || "").trim() || null,
    })
    .select("id,auth_user_id,building_id,first_name,last_name,email,resident_status,consent_personalization")
    .single();

  if (createError || !created) throw new TransactionApiError(500, "PROFILE_CREATE_FAILED", "We couldn't prepare your resident profile.");
  return { user, profile: created };
}

export async function requirePartnerMembership(req) {
  const database = requireTransactionDatabase();
  const user = await requireAuthenticatedUser(req);
  const { data, error } = await database
    .from("partner_users")
    .select("id,partner_id,role,location_ids")
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new TransactionApiError(500, "PARTNER_LOOKUP_FAILED", "We couldn't verify partner access.");
  if (!data) throw new TransactionApiError(403, "PARTNER_ACCESS_REQUIRED", "Partner access is required.");
  return { user, membership: data };
}

export function hashOpaqueToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

export function readOpaqueToken(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).at(-1) || "");
  } catch {
    return raw;
  }
}

export function sendTransactionError(res, error) {
  if (error instanceof TransactionApiError) {
    return res.status(error.status).json({ ok: false, code: error.code, error: error.message });
  }
  console.error("[transaction-api]", error);
  return res.status(500).json({ ok: false, code: "TRANSACTION_FAILED", error: "We couldn't complete that action. Try again." });
}
