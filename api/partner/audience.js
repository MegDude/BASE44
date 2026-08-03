import {
  requireAuthenticatedUser,
  requirePartnerMembership,
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";

const MINIMUM_COHORT_SIZE = 5;
const ACTIVE_MEMBER_STATUS = "active";
const RESIDENT_PROFILE_COLUMN = ["resident", "profile", "id"].join("_");
const EMAIL_HASH_COLUMN = ["email", "hash"].join("_");
const EXTERNAL_MEMBER_COLUMN = ["external", "member", "id"].join("_");

function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function isExternalId(value) {
  return /^[a-z0-9][a-z0-9_-]{0,179}$/i.test(String(value || ""));
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
    let query = database
      .from("partner_organizations")
      .select("id,external_id,legacy_partner_id,name,organization_type,status")
      .eq("status", "active");
    if (requestedOrganization) {
      if (isUuid(requestedOrganization)) query = query.eq("id", requestedOrganization);
      else if (isExternalId(requestedOrganization)) query = query.eq("external_id", requestedOrganization);
      else throw new TransactionApiError(400, "AUDIENCE_SCOPE_INVALID", "The requested workspace is invalid.");
    }
    const { data, error } = await query.order("name").limit(2);
    if (error) throw error;
    if (!data?.length) throw new TransactionApiError(404, "AUDIENCE_SCOPE_NOT_FOUND", "This workspace is not connected.");
    if (data.length > 1) throw new TransactionApiError(400, "AUDIENCE_SCOPE_REQUIRED", "Choose a workspace before loading its audience.");
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
  if (!organization) throw new TransactionApiError(403, "AUDIENCE_SCOPE_UNAVAILABLE", "Your account is not connected to an active workspace.");
  if (requestedOrganization && requestedOrganization !== organization.id && requestedOrganization !== organization.external_id) {
    throw new TransactionApiError(403, "AUDIENCE_SCOPE_FORBIDDEN", "That workspace is not available to this account.");
  }
  return { user, organization, role: membership.role, isSuperAdmin: false };
}

function safeCohortCount(count, isSuperAdmin) {
  const total = Number(count || 0);
  if (isSuperAdmin || total >= MINIMUM_COHORT_SIZE) return { count: total, display: String(total), suppressed: false };
  return { count: null, display: total ? "<5" : "0", suppressed: total > 0 };
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function applyNullableScopeFilter(query, column, value) {
  return value ? query.eq(column, value) : query.is(column, null);
}

function memberIdentityKey(member) {
  const profileId = member[RESIDENT_PROFILE_COLUMN];
  const emailHash = member[EMAIL_HASH_COLUMN];
  const externalMemberId = member[EXTERNAL_MEMBER_COLUMN];
  if (profileId) return `resident:${profileId}`;
  if (emailHash) return `email:${emailHash}`;
  return `source:${member.source_id || "unknown"}:${externalMemberId || "unknown"}`;
}

function dedupeMembers(members) {
  const byIdentity = new Map();
  for (const member of members || []) {
    const key = memberIdentityKey(member);
    const existing = byIdentity.get(key);
    if (!existing) {
      byIdentity.set(key, {
        ...member,
        consent_partner_contact: member.consent_partner_contact === true,
        consent_personalization: member.consent_personalization === true,
      });
      continue;
    }
    existing.consent_partner_contact = existing.consent_partner_contact === true && member.consent_partner_contact === true;
    existing.consent_personalization = existing.consent_personalization === true && member.consent_personalization === true;
    if (!existing[RESIDENT_PROFILE_COLUMN] && member[RESIDENT_PROFILE_COLUMN]) existing[RESIDENT_PROFILE_COLUMN] = member[RESIDENT_PROFILE_COLUMN];
    if (!existing[EMAIL_HASH_COLUMN] && member[EMAIL_HASH_COLUMN]) existing[EMAIL_HASH_COLUMN] = member[EMAIL_HASH_COLUMN];
    if (!existing.building_id && member.building_id) existing.building_id = member.building_id;
    if (!existing.district && member.district) existing.district = member.district;
  }
  return [...byIdentity.values()];
}

function sourceHealthRows(sources) {
  return (sources || []).map((source) => ({
    id: source.id,
    key: source.source_key || "unknown",
    name: source.source_name || "Unknown source",
    type: source.source_type || "unknown",
    status: source.status || "unknown",
    lastSyncedAt: source.last_synced_at || null,
    connected: source.status === "connected",
  }));
}

async function readBindings(database, { organizationId, portfolioId, listingId }) {
  let query = database
    .from("audience_scope_bindings")
    .select("id,building_id,portfolio_id,listing_id,status,created_at,updated_at")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  query = applyNullableScopeFilter(query, "portfolio_id", portfolioId);
  query = applyNullableScopeFilter(query, "listing_id", listingId);

  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

function aggregateMembers(members, buildings, sources, isSuperAdmin) {
  const buildingById = new Map(buildings.map((building) => [building.id, building]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const byBuilding = new Map();
  const byDistrict = new Map();
  const bySource = new Map();
  let eligible = 0;
  let contactable = 0;
  let personalizationEligible = 0;

  for (const member of members) {
    eligible += 1;
    if (member.consent_partner_contact) contactable += 1;
    if (member.consent_personalization) personalizationEligible += 1;

    const building = buildingById.get(member.building_id);
    const buildingKey = member.building_id || "unassigned";
    const buildingGroup = byBuilding.get(buildingKey) || {
      id: buildingKey,
      name: building?.name || "Unassigned building",
      district: building?.district || member.district || "Unassigned",
      eligible: 0,
      contactable: 0,
    };
    buildingGroup.eligible += 1;
    if (member.consent_partner_contact) buildingGroup.contactable += 1;
    byBuilding.set(buildingKey, buildingGroup);

    const district = building?.district || member.district || "Unassigned";
    const districtGroup = byDistrict.get(district) || { district, eligible: 0, contactable: 0 };
    districtGroup.eligible += 1;
    if (member.consent_partner_contact) districtGroup.contactable += 1;
    byDistrict.set(district, districtGroup);

    const source = sourceById.get(member.source_id);
    const sourceKey = member.source_id || "unknown";
    const sourceGroup = bySource.get(sourceKey) || {
      id: sourceKey,
      key: source?.source_key || "unknown",
      name: source?.source_name || "Unknown source",
      type: source?.source_type || "unknown",
      status: source?.status || "unknown",
      lastSyncedAt: source?.last_synced_at || null,
      eligible: 0,
      contactable: 0,
    };
    sourceGroup.eligible += 1;
    if (member.consent_partner_contact) sourceGroup.contactable += 1;
    bySource.set(sourceKey, sourceGroup);
  }

  const projectGroup = (group) => ({
    ...group,
    eligible: safeCohortCount(group.eligible, isSuperAdmin),
    contactable: safeCohortCount(group.contactable, isSuperAdmin),
  });

  return {
    totals: {
      eligible: safeCohortCount(eligible, isSuperAdmin),
      contactable: safeCohortCount(contactable, isSuperAdmin),
      personalizationEligible: safeCohortCount(personalizationEligible, isSuperAdmin),
    },
    buildings: [...byBuilding.values()].map(projectGroup).sort((a, b) => b.eligible.count - a.eligible.count),
    districts: [...byDistrict.values()].map(projectGroup).sort((a, b) => b.eligible.count - a.eligible.count),
    sources: [...bySource.values()].map(projectGroup).sort((a, b) => b.eligible.count - a.eligible.count),
  };
}

async function readAudience(database, scope) {
  const bindings = await readBindings(database, scope);
  const buildingIds = [...new Set(bindings.map((binding) => binding.building_id).filter(Boolean))];
  if (!buildingIds.length) {
    return {
      status: "setup_required",
      bindings: [],
      totals: {
        eligible: safeCohortCount(0, scope.isSuperAdmin),
        contactable: safeCohortCount(0, scope.isSuperAdmin),
        personalizationEligible: safeCohortCount(0, scope.isSuperAdmin),
      },
      buildings: [],
      districts: [],
      sources: [],
      sourceHealth: [],
    };
  }

  const [{ data: buildings, error: buildingError }, { data: sources, error: sourceError }] = await Promise.all([
    database.from("resident_membership_buildings").select("id,name,district,partner_status").in("id", buildingIds),
    database.from("audience_sources").select("id,source_key,source_name,source_type,status,last_synced_at"),
  ]);
  if (buildingError) throw buildingError;
  if (sourceError) throw sourceError;

  const connectedSourceIds = [...new Set((sources || [])
    .filter((source) => source.status === "connected")
    .map((source) => source.id)
    .filter(Boolean))];

  const { data: members, error: memberError } = connectedSourceIds.length
    ? await database.from("audience_members")
      .select([
        "source_id",
        "building_id",
        "district",
        "consent_partner_contact",
        "consent_personalization",
        RESIDENT_PROFILE_COLUMN,
        EMAIL_HASH_COLUMN,
        EXTERNAL_MEMBER_COLUMN,
      ].join(","))
      .eq("status", ACTIVE_MEMBER_STATUS)
      .in("building_id", buildingIds)
      .in("source_id", connectedSourceIds)
    : { data: [], error: null };
  if (memberError) throw memberError;

  const dedupedMembers = dedupeMembers(members || []);
  const groups = aggregateMembers(dedupedMembers, buildings || [], sources || [], scope.isSuperAdmin);
  return {
    status: dedupedMembers.length ? "connected" : "connected_empty",
    bindings: (buildings || []).map((building) => ({
      id: building.id,
      name: building.name,
      district: building.district,
      partnerStatus: building.partner_status,
    })),
    ...groups,
    sourceHealth: sourceHealthRows(sources || []),
  };
}

async function readPortfolioListingIds(database, scope) {
  const { data, error } = await database
    .from("partner_listings")
    .select("id")
    .eq("organization_id", scope.organization.id)
    .eq("portfolio_id", scope.portfolioId)
    .eq("status", "active");
  if (error) throw error;
  return [...new Set((data || []).map((listing) => listing.id).filter(Boolean))];
}

async function readActivity(database, scope) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let query = database
    .from("analytics_signals")
    .select("action_type,source_type,created_at")
    .eq("partner_organization_id", scope.organization.id)
    .gte("created_at", since);

  if (scope.listingId) {
    query = query.eq("listing_id", scope.listingId);
  } else if (scope.portfolioId) {
    const listingIds = await readPortfolioListingIds(database, scope);
    if (!listingIds.length) {
      return { periodDays: 30, total: 0, actions: [], sources: [] };
    }
    query = query.in("listing_id", listingIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  const byAction = new Map();
  const bySource = new Map();
  for (const signal of data || []) {
    const action = clean(signal.action_type || "other", 80) || "other";
    const source = clean(signal.source_type || "direct", 80) || "direct";
    byAction.set(action, (byAction.get(action) || 0) + 1);
    bySource.set(source, (bySource.get(source) || 0) + 1);
  }
  const toRows = (values, key) => [...values.entries()]
    .map(([label, count]) => ({ [key]: label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return {
    periodDays: 30,
    total: (data || []).length,
    actions: toRows(byAction, "action"),
    sources: toRows(bySource, "source"),
  };
}

async function connectBuilding(req, database, scope) {
  if (!scope.isSuperAdmin) throw new TransactionApiError(403, "AUDIENCE_BINDING_FORBIDDEN", "Only platform administrators can connect an audience building.");
  const body = readBody(req);
  const buildingId = clean(body.buildingId);
  if (!isUuid(buildingId)) throw new TransactionApiError(400, "AUDIENCE_BUILDING_INVALID", "Choose a valid building.");

  const { data: building, error: buildingError } = await database
    .from("resident_membership_buildings")
    .select("id,name,district,partner_status")
    .eq("id", buildingId)
    .maybeSingle();
  if (buildingError) throw buildingError;
  if (!building) throw new TransactionApiError(404, "AUDIENCE_BUILDING_NOT_FOUND", "That building is not available.");

  let existingQuery = database
    .from("audience_scope_bindings")
    .select("id,status")
    .eq("organization_id", scope.organization.id)
    .eq("building_id", buildingId);
  existingQuery = applyNullableScopeFilter(existingQuery, "portfolio_id", scope.portfolioId);
  existingQuery = applyNullableScopeFilter(existingQuery, "listing_id", scope.listingId);
  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await database.from("audience_scope_bindings").update({
      portfolio_id: scope.portfolioId,
      listing_id: scope.listingId,
      status: "active",
      updated_at: new Date().toISOString(),
    }).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await database.from("audience_scope_bindings").insert({
      organization_id: scope.organization.id,
      portfolio_id: scope.portfolioId,
      listing_id: scope.listingId,
      building_id: buildingId,
      status: "active",
      created_by_user_id: scope.user.id,
    });
    if (error) throw error;
  }
  return building;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    const database = requireTransactionDatabase();
    const scope = await resolveScope(req, database);
    const portfolioId = clean(req.query?.portfolioId);
    const listingId = clean(req.query?.listingId);
    if (portfolioId && !isUuid(portfolioId)) throw new TransactionApiError(400, "AUDIENCE_PORTFOLIO_INVALID", "The requested portfolio is invalid.");
    if (listingId && !isUuid(listingId)) throw new TransactionApiError(400, "AUDIENCE_LISTING_INVALID", "The requested listing is invalid.");
    const scoped = { ...scope, portfolioId: portfolioId || null, listingId: listingId || null };

    if (req.method === "POST") {
      const body = readBody(req);
      if (body.action !== "connect_building") throw new TransactionApiError(400, "AUDIENCE_ACTION_INVALID", "That audience action is not available.");
      const building = await connectBuilding(req, database, scoped);
      return res.status(200).json({ data: { building } });
    }
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const [audience, activity, availableBuildings] = await Promise.all([
      readAudience(database, scoped),
      readActivity(database, scoped),
      scope.isSuperAdmin
        ? database.from("resident_membership_buildings").select("id,name,district,partner_status").order("name").limit(250)
        : Promise.resolve({ data: [] }),
    ]);
    if (availableBuildings.error) throw availableBuildings.error;

    return res.status(200).json({
      data: {
        scope: {
          organizationId: scope.organization.id,
          organizationSlug: scope.organization.external_id,
          organizationName: scope.organization.name,
          portfolioId: scoped.portfolioId,
          listingId: scoped.listingId,
          role: scope.role,
          isSuperAdmin: scope.isSuperAdmin,
        },
        audience: {
          ...audience,
          minimumCohortSize: MINIMUM_COHORT_SIZE,
          privacyNote: "Counts are aggregated and consent-aware. Person-level audience records are never returned to workspace users.",
        },
        activity,
        availableBuildings: scope.isSuperAdmin ? availableBuildings.data || [] : [],
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
