export type DowntownPerksRole =
  | "resident"
  | "property_manager"
  | "hotel"
  | "venue"
  | "brand"
  | "broker"
  | "civic"
  | "admin";

export type SessionClaims = {
  userId?: string;
  role?: DowntownPerksRole;
  partnerType?: string;
  entityId?: string;
  organizationId?: string;
};

export function normalizeSessionClaims(claims: Record<string, unknown> = {}): SessionClaims {
  return {
    userId: String(claims.sub || claims.user_id || claims.userId || ""),
    role: claims.role as DowntownPerksRole | undefined,
    partnerType: String(claims.partnerType || claims.partner_type || ""),
    entityId: String(claims.entityId || claims.entity_id || ""),
    organizationId: String(claims.organizationId || claims.organization_id || ""),
  };
}

export function isAdminSession(session: SessionClaims) {
  return session.role === "admin";
}

export function isPartnerSession(session: SessionClaims) {
  return Boolean(session.partnerType || session.entityId || ["property_manager", "hotel", "venue", "brand", "broker", "civic"].includes(session.role || ""));
}
