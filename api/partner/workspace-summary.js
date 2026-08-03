import {
<<<<<<< HEAD
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
} from "../../src/lib/api/transactionAuth.js";

const ACTIVE_STATUSES = ["active", "live", "published"];
const UPCOMING_EVENT_STATUSES = ["upcoming", "live", "scheduled"];
const PUBLISHED_EXPERIENCE_STATUSES = ["active", "live", "published", "scheduled"];
=======
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
>>>>>>> origin/main

function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

<<<<<<< HEAD
function metric(value, sourceStatus = "connected", detail = "") {
  return { value: Number.isFinite(Number(value)) ? Number(value) : null, sourceStatus, detail };
}

function sourceMetric(value, sourceSystem, sourceStatus = "connected", detail = "") {
  return {
    ...metric(value, sourceStatus, detail),
    sourceSystem,
    freshness: { asOf: new Date().toISOString() },
  };
=======
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
>>>>>>> origin/main
}

async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return Number(count || 0);
}

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
<<<<<<< HEAD
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

    const persistedCampaigns = await optionalCount("partner_experiences", () => {
      let query = database.from("partner_experiences").select("id", { count: "exact", head: true });
      if (organizationId) query = query.eq("organization_id", organizationId);
      if (requestedPortfolioId) query = query.eq("portfolio_id", requestedPortfolioId);
      if (requestedListingId) query = query.eq("listing_id", requestedListingId);
      return query.in("status", PUBLISHED_EXPERIENCE_STATUSES);
    });

    const attributedActivity = await optionalCount("user_activity_events", () => {
      let query = database.from("user_activity_events").select("id", { count: "exact", head: true });
      query = query.eq("partner_organization_id", organizationId || "__none__");
      if (requestedListingId) query = query.eq("listing_id", requestedListingId);
      return query;
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
        persistedCampaigns,
        attributedActivity,
        contactableAudience: metric(null, "not_connected", "Connect a consented CRM/audience source before showing contactable residents."),
        danaAudience: metric(null, "not_connected", "Connect DANA member ingestion before showing DANA audience counts."),
        eligibleResidentAudience: activeMemberships,
        mapActivity: metric(mapActivity.value, "unassigned", "Platform activity is currently unassigned until event tracking records entity and partner identifiers."),
      },
      sections: {
        mapCoverage: {
          label: "Map inventory",
          description: "Public inventory available to discover. This is coverage, not partner performance.",
          metrics: {
            publicMapEntities: sourceMetric(connectedMapEntities.value, "map_entities", connectedMapEntities.sourceStatus, connectedMapEntities.detail || "Active public map entities"),
          },
        },
        partnerResults: {
          label: "Partner results",
          description: "Persisted, scope-authorized records and attributed actions only.",
          metrics: {
            connectedListings: sourceMetric(connectedActiveListings.value, "partner_listings", connectedActiveListings.sourceStatus, connectedActiveListings.detail || "Active listings in this authorized partner scope"),
            liveOffers: sourceMetric(liveOffers.value, "perks", liveOffers.sourceStatus, liveOffers.detail || "Persisted active offers"),
            upcomingEvents: sourceMetric(upcomingEvents.value, "events", upcomingEvents.sourceStatus, upcomingEvents.detail || "Persisted upcoming events"),
            campaigns: sourceMetric(persistedCampaigns.value, "partner_experiences", persistedCampaigns.sourceStatus, persistedCampaigns.detail || "Persisted published campaigns"),
            attributedActivity: sourceMetric(attributedActivity.value, "user_activity_events", attributedActivity.sourceStatus, attributedActivity.detail || "Events carrying this partner scope"),
          },
        },
        audience: {
          label: "Audience",
          description: "Consent-based audience segments. Not-connected sources remain visible as not connected.",
          metrics: {
            eligibleResidents: sourceMetric(activeMemberships.value, "resident_memberships", activeMemberships.sourceStatus, activeMemberships.detail || "Active resident memberships"),
            residentProfiles: sourceMetric(activeResidentProfiles.value, "resident_profiles", activeResidentProfiles.sourceStatus, activeResidentProfiles.detail || "Active resident profiles"),
            residentIdentities: sourceMetric(activeResidentIdentities.value, "users", activeResidentIdentities.sourceStatus, activeResidentIdentities.detail || "Active resident identities"),
            contactableAudience: sourceMetric(null, "consented_audience", "not_connected", "Connect a consented CRM/audience source before showing contactable residents."),
            danaAudience: sourceMetric(null, "dana_member_sync", "not_connected", "DANA member ingestion is not connected."),
          },
        },
      },
      viewer: { id: user.id, role: membership.role },
=======
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

    const [{ data: listingRows, error: listingError }, livePerks, liveEvents, liveCampaigns, attributedActions, sourceRows, databaseMapCount, audienceBindingRows] = await Promise.all([
      scopedListingsQuery(database, organization.id, portfolioId, listingId),
      countRows(perks),
      portfolioId || listingId ? Promise.resolve(0) : countRows(events.eq("partner_id", organization.legacy_partner_id)),
      countRows(campaigns),
      countRows(activity),
      database.from("audience_sources").select("source_key,source_name,source_type,status,last_synced_at").order("source_name"),
      countRows(database.from("map_inventory").select("id", { count: "exact", head: true }).eq("status", "active")),
      database.from("audience_scope_bindings").select("building_id").eq("organization_id", organization.id).eq("status", "active"),
    ]);
    if (listingError) throw listingError;
    if (sourceRows.error) throw sourceRows.error;
    if (audienceBindingRows.error) throw audienceBindingRows.error;

    const audienceBuildingIds = [...new Set((audienceBindingRows.data || []).map((row) => row.building_id).filter(Boolean))];
    const [audienceEligible, audienceContactable] = audienceBuildingIds.length
      ? await Promise.all([
          countRows(database.from("audience_members").select("id", { count: "exact", head: true }).eq("status", "active").in("building_id", audienceBuildingIds)),
          countRows(database.from("audience_members").select("id", { count: "exact", head: true }).eq("status", "active").eq("consent_partner_contact", true).in("building_id", audienceBuildingIds)),
        ])
      : [null, null];

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
          eligibleResidents: audienceEligible,
          contactableResidents: audienceContactable,
          danaMembers: null,
          bindingCount: audienceBuildingIds.length,
          status: audienceBuildingIds.length ? (audienceEligible ? "connected" : "connected_empty") : "setup_required",
          reason: audienceBuildingIds.length ? "Only aggregate, consent-aware members in explicitly connected buildings are included." : "No authorized building is linked to this workspace yet.",
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
>>>>>>> origin/main
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
