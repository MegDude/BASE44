export type DowntownPerksRole =
  | "resident"
  | "property_manager"
  | "hotel"
  | "venue"
  | "brand"
  | "broker"
  | "civic"
  | "admin"
  | "super_admin";

export type SessionClaims = {
  userId?: string;
  email?: string;
  role?: DowntownPerksRole;
  partnerType?: string;
  entityId?: string;
  organizationId?: string;
};

const DEFAULT_SUPER_ADMIN_EMAILS = ["me@megdude.com"];

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function splitAllowlist(value: unknown) {
  return String(value || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function getSuperAdminEmails() {
  const env = (import.meta as any)?.env || {};
  return Array.from(new Set([
    ...DEFAULT_SUPER_ADMIN_EMAILS,
    ...splitAllowlist(env.VITE_SUPER_ADMIN_EMAILS),
    ...splitAllowlist(env.SUPER_ADMIN_EMAILS),
  ]));
}

export function normalizeSessionClaims(claims: Record<string, unknown> = {}): SessionClaims {
  return {
    userId: String(claims.sub || claims.user_id || claims.userId || ""),
    email: normalizeEmail(claims.email || claims.user_email || claims.userEmail),
    role: claims.role as DowntownPerksRole | undefined,
    partnerType: String(claims.partnerType || claims.partner_type || ""),
    entityId: String(claims.entityId || claims.entity_id || ""),
    organizationId: String(claims.organizationId || claims.organization_id || ""),
  };
}

export function isSuperAdminSession(session: SessionClaims = {}) {
  if (session.role === "super_admin") return true;
  const email = normalizeEmail(session.email);
  return Boolean(email && getSuperAdminEmails().includes(email));
}

export function isAdminSession(session: SessionClaims = {}) {
  return session.role === "admin" || isSuperAdminSession(session);
}

export function canViewEverything(session: SessionClaims | Record<string, unknown> = {}) {
  return isAdminSession(normalizeSessionClaims(session));
}

export function isPartnerSession(session: SessionClaims) {
  return Boolean(session.partnerType || session.entityId || ["property_manager", "hotel", "venue", "brand", "broker", "civic"].includes(session.role || ""));
}
