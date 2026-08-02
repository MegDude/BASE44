import { requireAuthenticatedUser, requirePartnerMembership, TransactionApiError } from "../../src/lib/api/transactionAuth.js";

export function cleanWorkspaceValue(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

export function isWorkspaceUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

const isExternalId = (value) => /^[a-z0-9][a-z0-9_-]{0,179}$/i.test(String(value || ""));

async function resolvePortfolio(database, organizationId, requestedPortfolioId) {
  if (!requestedPortfolioId) return null;
  if (!isWorkspaceUuid(requestedPortfolioId)) throw new TransactionApiError(400, "WORKSPACE_PORTFOLIO_INVALID", "The requested portfolio is invalid.");
  const { data, error } = await database
    .from("partner_portfolios")
    .select("id,organization_id,name,status")
    .eq("id", requestedPortfolioId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new TransactionApiError(403, "WORKSPACE_SCOPE_FORBIDDEN", "That portfolio is not available to this account.");
  return data;
}

async function resolveListing(database, organizationId, requestedListingId, portfolioId) {
  if (!requestedListingId) return null;
  let query = database
    .from("partner_listings")
    .select("id,organization_id,portfolio_id,name,status,entity_id,metadata")
    .eq("organization_id", organizationId)
    .eq("status", "active");
  query = isWorkspaceUuid(requestedListingId) ? query.eq("id", requestedListingId) : query.eq("entity_id", requestedListingId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data || (portfolioId && data.portfolio_id !== portfolioId)) throw new TransactionApiError(403, "WORKSPACE_SCOPE_FORBIDDEN", "That listing is not available to this account.");
  return data;
}

export async function resolveAuthorizedWorkspaceScope(req, database) {
  const user = await requireAuthenticatedUser(req);
  const requested = cleanWorkspaceValue(req.query?.organization || req.query?.organizationId || req.query?.workspaceId);
  const requestedPortfolioId = cleanWorkspaceValue(req.query?.portfolioId);
  const requestedListingId = cleanWorkspaceValue(req.query?.listingId || req.query?.entityId);

  const { data: profile, error: profileError } = await database
    .from("platform_profiles")
    .select("platform_role,is_super_admin,is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const appMetadata = user.app_metadata || {};
  const isTrustedAppSuperAdmin = appMetadata.is_super_admin === true || appMetadata.platform_role === "super_admin" || appMetadata.role === "super_admin";
  const isSuperAdmin = isTrustedAppSuperAdmin || (profile?.is_active === true && (profile?.is_super_admin === true || profile?.platform_role === "super_admin"));
  let query = database.from("partner_organizations").select("id,external_id,legacy_partner_id,name,status").eq("status", "active");

  let organization;
  let role;
  if (isSuperAdmin) {
    if (requested) {
      if (isWorkspaceUuid(requested)) query = query.eq("id", requested);
      else if (isExternalId(requested)) query = query.eq("external_id", requested);
      else throw new TransactionApiError(400, "WORKSPACE_SCOPE_INVALID", "The requested workspace is invalid.");
    }
    const { data, error } = await query.order("name").limit(2);
    if (error) throw error;
    if (!data?.length) throw new TransactionApiError(404, "WORKSPACE_SCOPE_NOT_FOUND", "This workspace is not connected.");
    if (data.length > 1) throw new TransactionApiError(400, "WORKSPACE_SCOPE_REQUIRED", "Choose a workspace before loading this module.");
    organization = data[0];
    role = "super_admin";
  } else {
    const { membership } = await requirePartnerMembership(req);
    const { data, error } = await query.eq("legacy_partner_id", membership.partner_id).maybeSingle();
    if (error) throw error;
    if (!data || (requested && requested !== data.id && requested !== data.external_id)) throw new TransactionApiError(403, "WORKSPACE_SCOPE_FORBIDDEN", "That workspace is not available to this account.");
    organization = data;
    role = membership.role;
  }

  const portfolio = await resolvePortfolio(database, organization.id, requestedPortfolioId);
  const listing = await resolveListing(database, organization.id, requestedListingId, portfolio?.id || null);

  return { user, organization, portfolio, listing, role, isSuperAdmin };
}
