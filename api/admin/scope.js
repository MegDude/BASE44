import {
  requireAuthenticatedUser,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";
import { isSuperAdminEmail } from "../../src/lib/auth/superAdminEmails.js";

const ADMIN_ROLES = new Set(["admin", "platform_admin", "super_admin"]);
const clean = (value, max = 180) => String(value || "").trim().slice(0, max);

async function activePlatformRole(database, userId) {
  const { data: profile, error } = await database
    .from("platform_profiles")
    .select("platform_role,is_super_admin,is_active")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (profile?.is_active !== true) return "";
  if (profile.is_super_admin === true) return "super_admin";
  return clean(profile.platform_role, 80).toLowerCase();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const user = await requireAuthenticatedUser(req);

    // Explicit Super Admin Bypass — uses server-authenticated user.email
    let role = await activePlatformRole(database, user.id);
    if (isSuperAdminEmail(user?.email)) {
      role = "super_admin";
    }

    if (!ADMIN_ROLES.has(role)) throw new TransactionApiError(403, "ADMIN_ACCESS_REQUIRED", "An active administrator profile is required.");

    let organizationQuery = database.from("partner_organizations").select("id,name,external_id,status,legacy_partner_id").order("name");
    if (role !== "super_admin") {
      const { data: memberships, error: membershipError } = await database.from("partner_users").select("partner_id,role,active").eq("auth_user_id", user.id).eq("active", true);
      if (membershipError) throw membershipError;
      const partnerIds = [...new Set((memberships || []).map((item) => item.partner_id).filter(Boolean))];
      if (!partnerIds.length) return res.status(200).json({ role, organizations: [], portfolios: [], listings: [], activeScope: {} });
      organizationQuery = organizationQuery.in("legacy_partner_id", partnerIds);
    }

    const { data: organizations, error: organizationError } = await organizationQuery;
    if (organizationError) throw organizationError;
    const organizationIds = (organizations || []).map((item) => item.id);
    const [{ data: portfolios, error: portfolioError }, { data: listings, error: listingError }] = organizationIds.length
      ? await Promise.all([
          database.from("partner_portfolios").select("id,organization_id,name,status").in("organization_id", organizationIds).order("name"),
          database.from("partner_listings").select("id,organization_id,portfolio_id,name,status,entity_id,metadata").in("organization_id", organizationIds).order("name"),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];
    if (portfolioError) throw portfolioError;
    if (listingError) throw listingError;

    const requestedOrganizationId = clean(req.query?.organizationId);
    const requestedPortfolioId = clean(req.query?.portfolioId);
    const requestedListingId = clean(req.query?.listingId);
    const organization = (organizations || []).find((item) => item.id === requestedOrganizationId);
    const portfolio = organization && (portfolios || []).find((item) => item.id === requestedPortfolioId && item.organization_id === organization.id);
    const listing = organization && (listings || []).find((item) => item.id === requestedListingId && item.organization_id === organization.id && (!portfolio || !item.portfolio_id || item.portfolio_id === portfolio.id));

    return res.status(200).json({
      role,
      organizations: organizations || [],
      portfolios: portfolios || [],
      listings: listings || [],
      activeScope: { organizationId: organization?.id, portfolioId: portfolio?.id, listingId: listing?.id },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
