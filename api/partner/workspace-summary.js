import {
  requireAuthenticatedUser,
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

const MAP_COVERAGE = {
  total: 1473,
  byType: { restaurant: 421, building: 230, listing: 119, retail: 215, bar: 222, civic: 57, hotel: 59, wellness: 69, coffee: 77, brand: 4, event: 13, service: 1 },
  source: "published_map_inventory",
  status: "published_registry",
};

const ACTIVE_EVENT_STATUSES = ["upcoming", "scheduled", "active", "live", "published"];

function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return Number(count || 0);
}

async function resolveScope(req, database) {
  const user = await requireAuthenticatedUser(req);
  const { data: profile, error: profileError } = await database
    .from("platform_profiles")
    .select("platform_role,is_super_admin,is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const isSuperAdmin = profile?.is_active === true
    && (profile?.is_super_admin === true || profile?.platform_role === "super_admin");
  const requestedOrganization = clean(req.query?.organization || req.query?.organizationId);

  if (isSuperAdmin) {
    let query = database.from("partner_organizations").select("id,external_id,legacy_partner_id,name,organization_type,status").eq("status", "active");
    if (requestedOrganization) query = query.or(`id.eq.${requestedOrganization},external_id.eq.${requestedOrganization}`);
    const { data, error } = await query.order("name").limit(2);
    if (error) throw error;
    if (!data?.length) throw new TransactionApiError(404, "WORKSPACE_SCOPE_NOT_FOUND", "This workspace is not connected.");
    if (data.length > 1) throw new TransactionApiError(400, "WORKSPACE_SCOPE_REQUIRED", "Choose a workspace before loading its summary.");
    return { user, organization: data[0], role: "super_admin" };
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
  return { user, organization, role: membership.role };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const database = requireTransactionDatabase();
    const { organization, role } = await resolveScope(req, database);
    const portfolioId = clean(req.query?.portfolioId);
    const listingId = clean(req.query?.listingId);

    let listings = database.from("partner_listings").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "active");
    let perks = database.from("perks").select("id", { count: "exact", head: true }).eq("partner_organization_id", organization.id).eq("status", "active");
    let events = database.from("events").select("id", { count: "exact", head: true }).in("status", ACTIVE_EVENT_STATUSES);
    let campaigns = database.from("partner_campaigns").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).in("status", ["scheduled", "active"]);
    let activity = database.from("analytics_signals").select("id", { count: "exact", head: true }).eq("partner_organization_id", organization.id);

    if (portfolioId) {
      listings = listings.eq("portfolio_id", portfolioId);
      campaigns = campaigns.eq("portfolio_id", portfolioId);
    }
    if (listingId) {
      listings = listings.eq("id", listingId);
      perks = perks.eq("listing_id", listingId);
      campaigns = campaigns.eq("listing_id", listingId);
      activity = activity.eq("listing_id", listingId);
    }

    const [{ data: listingRows, error: listingError }, livePerks, liveEvents, liveCampaigns, attributedActions, sourceRows] = await Promise.all([
      database.from("partner_listings").select("id,entity_id").eq("organization_id", organization.id).eq("status", "active"),
      countRows(perks),
      countRows(events.eq("partner_id", organization.legacy_partner_id)),
      countRows(campaigns),
      countRows(activity),
      database.from("audience_sources").select("source_key,source_name,source_type,status,last_synced_at").order("source_name"),
    ]);
    if (listingError) throw listingError;
    if (sourceRows.error) throw sourceRows.error;

    const scopedListingIds = (listingRows || []).map((row) => row.id);
    const scopedEntityIds = (listingRows || []).map((row) => row.entity_id).filter(Boolean);
    const mapInventory = scopedEntityIds.length
      ? { total: scopedEntityIds.length, source: "canonical_database", status: "connected" }
      : { ...MAP_COVERAGE, status: "published_registry_unowned" };

    return res.status(200).json({
      data: {
        scope: { organizationId: organization.id, organizationSlug: organization.external_id, organizationName: organization.name, portfolioId: portfolioId || null, listingId: listingId || null, role },
        inventory: {
          connectedPlaces: scopedListingIds.length,
          mapInventory,
          liveOffers: livePerks,
          upcomingEvents: liveEvents,
          liveCampaigns,
        },
        audience: {
          eligibleResidents: null,
          contactableResidents: null,
          danaMembers: null,
          status: "not_connected",
          reason: "No consented audience segment is linked to this workspace.",
        },
        activity: {
          attributedActions,
          status: attributedActions ? "connected" : "connected_empty",
          note: attributedActions ? "Only attributed workspace actions are included." : "No attributed workspace actions have been recorded.",
        },
        sources: {
          map: mapInventory.status,
          audience: sourceRows.data || [],
          refreshedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}