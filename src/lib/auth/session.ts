export type DowntownPerksRole =
  | "resident"
  | "property_manager"
  | "hotel"
  | "venue"
  | "brand"
  | "broker"
  | "civic"
  | "admin"
  | "platform_admin"
  | "super_admin";

export type SessionClaims = {
  userId?: string;
  email?: string;
  role?: DowntownPerksRole;
  platformRole?: DowntownPerksRole;
  isSuperAdmin?: boolean;
  partnerType?: string;
  entityId?: string;
  organizationId?: string;
};

// Canonical super-admin allowlist lives in the shared module so the client and
// serverless API never drift (session.ts previously held a typo'd address).
export { getSuperAdminEmails, isSuperAdminEmail } from "./superAdminEmails.js";

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeSessionClaims(claims: Record<string, unknown> = {}): SessionClaims {
  return {
    userId: String(claims.sub || claims.user_id || claims.userId || ""),
    email: normalizeEmail(claims.email || claims.user_email || claims.userEmail),
    role: String(claims.platformRole || claims.platform_role || claims.role || "").toLowerCase() as DowntownPerksRole | undefined,
    platformRole: String(claims.platformRole || claims.platform_role || "").toLowerCase() as DowntownPerksRole | undefined,
    isSuperAdmin: claims.isSuperAdmin === true || claims.is_super_admin === true,
    partnerType: String(claims.partnerType || claims.partner_type || ""),
    entityId: String(claims.entityId || claims.entity_id || ""),
    organizationId: String(claims.organizationId || claims.organization_id || ""),
  };
}

export function isSuperAdminSession(session: SessionClaims = {}) {
  // Authorization is derived from trusted Supabase app_metadata/profile claims.
  // Email allowlists may support recovery tooling, but never grant browser access.
  return session.role === "super_admin" || session.platformRole === "super_admin" || session.isSuperAdmin === true;
}

export function isAdminSession(session: SessionClaims = {}) {
  return session.role === "admin"
    || session.role === "platform_admin"
    || session.platformRole === "platform_admin"
    || isSuperAdminSession(session);
}

export function canViewEverything(session: SessionClaims | Record<string, unknown> = {}) {
  return isAdminSession(normalizeSessionClaims(session));
}

export function isPartnerSession(session: SessionClaims) {
  return Boolean(session.partnerType || session.entityId || ["property_manager", "hotel", "venue", "brand", "broker", "civic"].includes(session.role || ""));
}
