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

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function isExternalId(value) {
  return /^[a-z0-9][a-z0-9_-]{0,179}$/i.test(String(value || ""));
}

function scopedListingsQuery(database, organizationId, portfolioId, listingId) {
  let query = database.from("partner_listings").select("id,name,entity_id,metadata").eq("organization_id", organizationId).eq("status", "active");
  if (portfolioId) query = query.eq("portfolio_id", portfolioId);
  if (listingId) query = query.eq("id", listingId);
  return query;
}

async function resolveListingId(database, organizationId, requestedListingId) {
  if (!requestedListingId || isUuid(requestedListingId)) return requestedListingId || null;
  const { data, error } = await database
    .from("partner_listings")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("entity_id", requestedListingId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new TransactionApiError(404, "WORKSPACE_LISTING_NOT_FOUND", "This listing is not available in the active workspace.");
  return data.id;
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
    if (requestedOrganization) {
      if (isUuid(requestedOrganization)) query = query.eq("id", requestedOrganization);
      else if (isExternalId(requestedOrganization)) query = query.eq("external_id", requestedOrganization);
      else throw new TransactionApiError(400, "WORKSPACE_SCOPE_INVALID", "The requested workspace is invalid.");
    }
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
    const requestedListingId = clean(req.query?.listingId);
    if (portfolioId && !isUuid(portfolioId)) {
      throw new TransactionApiError(400, "WORKSPACE_PORTFOLIO_INVALID", "The requested portfolio is invalid.");
    }
    const listingId = await resolveListingId(database, organization.id, requestedListingId);

    let listings = database.from("partner_listings").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "active");
    let perks = database.from("perks").select("id", { count: "exact", head: true }).eq("partner_organization_id", organization.id).eq("status", "active");
    let events = database.from("events").select("id", { count: "exact", head: true }).eq("active", true).in("status", ACTIVE_EVENT_STATUSES);
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

    const [{ data: listingRows, error: listingError }, livePerks, liveEvents, liveCampaigns, attributedActions, sourceRows, databaseMapCount] = await Promise.all([
      scopedListingsQuery(database, organization.id, portfolioId, listingId),
      countRows(perks),
      portfolioId || listingId ? Promise.resolve(0) : countRows(events.eq("partner_id", organization.legacy_partner_id)),
      countRows(campaigns),
      countRows(activity),
      database.from("audience_sources").select("source_key,source_name,source_type,status,last_synced_at").order("source_name"),
      countRows(database.from("map_inventory").select("id", { count: "exact", head: true }).eq("status", "active")),
    ]);
    if (listingError) throw listingError;
    if (sourceRows.error) throw sourceRows.error;

    const scopedListingIds = (listingRows || []).map((row) => row.id);
    const scopedEntityIds = (listingRows || []).map((row) => row.entity_id).filter(Boolean);
    const [workspaceMapCount, managedMapRows] = scopedEntityIds.length
      ? await Promise.all([
          countRows(database.from("map_inventory").select("id", { count: "exact", head: true }).eq("status", "active").in("canonical_entity_id", scopedEntityIds)),
          database.from("map_inventory").select("canonical_entity_id,name,entity_type,district,address,source_name,source_updated_at,source_payload").eq("status", "active").in("canonical_entity_id", scopedEntityIds).order("source_updated_at", { ascending: false }).limit(80),
        ])
      : [0, { data: [], error: null }];
    if (managedMapRows.error) throw managedMapRows.error;
    const managedPlaces = (managedMapRows.data || []).map((item) => ({
      entityId: item.canonical_entity_id,
      name: item.name,
      entityType: item.entity_type,
      district: item.district || null,
      address: item.address || null,
      image: item.source_payload?.primaryImage || item.source_payload?.thumbnail || null,
      imageAlt: item.source_payload?.name || item.name,
      source: item.source_name,
      updatedAt: item.source_updated_at || null,
    }));
    const mapInventory = databaseMapCount
      ? { total: databaseMapCount, linkedToWorkspace: workspaceMapCount, source: "map_inventory", status: "connected", places: managedPlaces, focus: managedPlaces[0] || null }
      : { ...MAP_COVERAGE, linkedToWorkspace: 0, status: "published_registry_pending_import", places: [], focus: null };

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
