import {
  requireAuthenticatedUser,
  requirePartnerMembership,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

export function cleanWorkspaceValue(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

export function isWorkspaceUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function isExternalId(value) {
  return /^[a-z0-9][a-z0-9_-]{0,179}$/i.test(String(value || ""));
}

export async function resolveAuthorizedWorkspaceScope(req, database) {
  const user = await requireAuthenticatedUser(req);
  const requestedOrganization = cleanWorkspaceValue(req.query?.organization || req.query?.organizationId);
  const { data: profile, error: profileError } = await database
    .from("platform_profiles")
    .select("platform_role,is_super_admin,is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const isSuperAdmin = profile?.is_active === true
    && (profile?.is_super_admin === true || profile?.platform_role === "super_admin");

  if (isSuperAdmin) {
    let query = database
      .from("partner_organizations")
      .select("id,external_id,legacy_partner_id,name,organization_type,status")
      .eq("status", "active");
    if (requestedOrganization) {
      if (isWorkspaceUuid(requestedOrganization)) query = query.eq("id", requestedOrganization);
      else if (isExternalId(requestedOrganization)) query = query.eq("external_id", requestedOrganization);
      else throw new TransactionApiError(400, "WORKSPACE_SCOPE_INVALID", "The requested workspace is invalid.");
    }
    const { data, error } = await query.order("name").limit(2);
    if (error) throw error;
    if (!data?.length) throw new TransactionApiError(404, "WORKSPACE_SCOPE_NOT_FOUND", "This workspace is not connected.");
    if (data.length > 1) throw new TransactionApiError(400, "WORKSPACE_SCOPE_REQUIRED", "Choose a workspace before loading this module.");
    return { user, organization: data[0], role: "super_admin", isSuperAdmin: true };
  }

  const { membership } = await requirePartnerMembership(req);
  const { data: organization, error } = await database
    .from("partner_organizations")
    .select("id,external_id,legacy_partner_id,name,organization_type,status")
    .eq("legacy_partner_id", membership.partner_id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!organization) throw new TransactionApiError(403, "WORKSPACE_SCOPE_UNAVAILABLE", "Your account is not connected to an active workspace.");
  if (requestedOrganization && requestedOrganization !== organization.id && requestedOrganization !== organization.external_id) {
    throw new TransactionApiError(403, "WORKSPACE_SCOPE_FORBIDDEN", "That workspace is not available to this account.");
  }
  return { user, organization, role: membership.role, isSuperAdmin: false };
}
