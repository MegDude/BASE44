import {
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
} from "../../src/lib/api/transactionAuth.js";

const ACTIVE_STATUSES = ["active", "live", "published"];
const UPCOMING_EVENT_STATUSES = ["upcoming", "live", "scheduled"];

function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

function metric(value, sourceStatus = "connected", detail = "") {
  return { value: Number.isFinite(Number(value)) ? Number(value) : null, sourceStatus, detail };
}

async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return Number(count || 0);
}

async function optionalCount(label, queryFactory) {
  try {
    return metric(await countRows(queryFactory()), "connected");
  } catch (error) {
    return metric(null, "unavailable", error?.message || `${label} source unavailable`);
  }
}

async function maybeOrganization(database, partnerId) {
  try {
    const { data, error } = await database
      .from("partner_organizations")
      .select("id,name,legacy_partner_id,status")
      .eq("legacy_partner_id", partnerId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const { user, membership } = await requirePartnerMembership(req);
    const organization = await maybeOrganization(database, membership.partner_id);
    const requestedOrganizationId = clean(req.query?.organizationId);
    const requestedPortfolioId = clean(req.query?.portfolioId);
    const requestedListingId = clean(req.query?.listingId);
    const organizationId = organization?.id || "";

    if (requestedOrganizationId && requestedOrganizationId !== organizationId) {
      return res.status(403).json({ ok: false, code: "SCOPE_NOT_AUTHORIZED", error: "This workspace scope is not available to this account." });
    }

    const listingScope = (query) => {
      // Always tenant-scope by organization. When the partner's organization
      // cannot be resolved, force an empty scope (mirroring admin/scope.js and
      // the mapActivity "__none__" sentinel) so we never leak platform-wide counts.
      query = query.eq("organization_id", organizationId || "__none__");
      if (requestedPortfolioId) query = query.eq("portfolio_id", requestedPortfolioId);
      if (requestedListingId) query = query.eq("id", requestedListingId);
      return query;
    };

    const connectedActiveListings = await optionalCount("partner_listings", () => {
      let query = database.from("partner_listings").select("id", { count: "exact", head: true });
      query = listingScope(query);
      return query.in("status", ACTIVE_STATUSES);
    });

    const connectedMapEntities = await optionalCount("map_entities", () => {
      let query = database.from("map_entities").select("id", { count: "exact", head: true });
      return query.in("status", ACTIVE_STATUSES);
    });

    const liveOffers = await optionalCount("perks", () => database
      .from("perks")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", membership.partner_id)
      .in("status", ACTIVE_STATUSES));

    const upcomingEvents = await optionalCount("events", () => database
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", membership.partner_id)
      .in("status", UPCOMING_EVENT_STATUSES));

    const activeResidentProfiles = await optionalCount("resident_profiles", () => database
      .from("resident_profiles")
      .select("id", { count: "exact", head: true })
      .in("resident_status", ACTIVE_STATUSES));

    const activeResidentIdentities = await optionalCount("users", () => database
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "resident")
      .eq("status", "active"));

    const activeMemberships = await optionalCount("resident_memberships", () => database
      .from("resident_memberships")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"));

    const completedOnboarding = await optionalCount("resident_profiles", () => database
      .from("resident_profiles")
      .select("id", { count: "exact", head: true })
      .eq("onboarding_status", "completed"));

    const mapActivity = await optionalCount("user_activity_events", () => database
      .from("user_activity_events")
      .select("id", { count: "exact", head: true })
      .eq("partner_organization_id", organizationId || "__none__"));

    return res.status(200).json({
      ok: true,
      asOf: new Date().toISOString(),
      audienceBasis: "Aggregate-only counts resolved from the authenticated partner membership and available production sources. Individual resident identities are never returned.",
      scope: {
        organizationId: organizationId || null,
        portfolioId: requestedPortfolioId || null,
        listingId: requestedListingId || null,
        label: organization?.name || "Authorized workspace",
      },
      sourceStatus: {
        danaCrm: "not_connected",
        contactableAudience: "not_connected",
        residentPrivacy: "aggregate_only",
      },
      metrics: {
        connectedActiveListings,
        connectedMapEntities,
        liveOffers,
        upcomingEvents,
        activeResidentProfiles,
        activeResidentIdentities,
        activeMemberships,
        completedOnboarding,
        contactableAudience: metric(null, "not_connected", "Connect a consented CRM/audience source before showing contactable residents."),
        mapActivity,
      },
      viewer: { id: user.id, role: membership.role },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
