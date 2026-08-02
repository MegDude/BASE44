import { requireTransactionDatabase, sendTransactionError } from "../../src/lib/api/transactionAuth.js";
import { resolveAuthorizedWorkspaceScope } from "../_lib/workspaceScope.js";

const MINIMUM_COHORT_SIZE = 5;

function cohort(count, isSuperAdmin) {
  const value = Number(count || 0);
  if (isSuperAdmin || value >= MINIMUM_COHORT_SIZE) return { count: value, display: String(value), suppressed: false };
  return { count: null, display: value > 0 ? `<${MINIMUM_COHORT_SIZE}` : "0", suppressed: value > 0 };
}

function uniqueSources(bindings = []) {
  const sources = new Map();
  bindings.forEach((binding) => {
    const source = binding.audience_sources;
    if (!source?.source_name) return;
    sources.set(source.source_name, {
      name: source.source_name,
      type: source.source_type,
      status: source.status,
      lastSyncedAt: source.last_synced_at || source.updated_at || null,
    });
  });
  return [...sources.values()];
}

function scopedBindingQuery(database, scope) {
  let query = database
    .from("audience_scope_bindings")
    .select("building_id,source_id,audience_sources(source_name,source_type,status,last_synced_at,updated_at)")
    .eq("organization_id", scope.organization.id)
    .eq("status", "active");
  if (scope.portfolio?.id) query = query.or(`portfolio_id.is.null,portfolio_id.eq.${scope.portfolio.id}`);
  if (scope.listing?.id) query = query.or(`listing_id.is.null,listing_id.eq.${scope.listing.id}`);
  return query;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const database = requireTransactionDatabase();
    const scope = await resolveAuthorizedWorkspaceScope(req, database);
    const { data: bindings, error: bindingError } = await scopedBindingQuery(database, scope);
    if (bindingError) throw bindingError;

    const buildingIds = [...new Set((bindings || []).map((item) => item.building_id).filter(Boolean))];
    const sources = uniqueSources(bindings || []);
    const baseScope = {
      organizationId: scope.organization.id,
      organizationName: scope.organization.name,
      portfolioId: scope.portfolio?.id || null,
      listingId: scope.listing?.id || null,
    };

    if (!buildingIds.length) {
      return res.status(200).json({
        data: {
          scope: baseScope,
          audience: {
            status: "setup_required",
            minimumCohortSize: MINIMUM_COHORT_SIZE,
            totals: { eligible: cohort(0, scope.isSuperAdmin), contactable: cohort(0, scope.isSuperAdmin), activity: cohort(0, scope.isSuperAdmin) },
            sources,
            buildings: [],
            privacyNote: "Aggregate, consent-aware counts only. Person-level records are never returned.",
          },
        },
      });
    }

    const [{ data: members, error: memberError }, { data: buildings, error: buildingError }] = await Promise.all([
      database
        .from("audience_members")
        .select("building_id,consent_partner_contact,consent_personalization,source_updated_at")
        .eq("status", "active")
        .in("building_id", buildingIds),
      database
        .from("resident_membership_buildings")
        .select("id,name,district")
        .in("id", buildingIds),
    ]);
    if (memberError || buildingError) throw memberError || buildingError;

    const metadata = new Map((buildings || []).map((building) => [building.id, building]));
    const groups = new Map();
    for (const member of members || []) {
      const building = metadata.get(member.building_id);
      const group = groups.get(member.building_id) || {
        name: building?.name || "Authorized building",
        district: building?.district || "",
        eligible: 0,
        contactable: 0,
        activity: 0,
        lastUpdatedAt: null,
      };
      group.eligible += 1;
      if (member.consent_partner_contact) group.contactable += 1;
      if (member.consent_personalization || member.consent_partner_contact) group.activity += 1;
      if (member.source_updated_at && (!group.lastUpdatedAt || new Date(member.source_updated_at) > new Date(group.lastUpdatedAt))) group.lastUpdatedAt = member.source_updated_at;
      groups.set(member.building_id, group);
    }

    const total = (members || []).length;
    const contactable = (members || []).filter((member) => member.consent_partner_contact).length;
    const activity = (members || []).filter((member) => member.consent_partner_contact || member.consent_personalization).length;

    return res.status(200).json({
      data: {
        scope: baseScope,
        audience: {
          status: "connected",
          minimumCohortSize: MINIMUM_COHORT_SIZE,
          totals: {
            eligible: cohort(total, scope.isSuperAdmin),
            contactable: cohort(contactable, scope.isSuperAdmin),
            activity: cohort(activity, scope.isSuperAdmin),
          },
          sources,
          buildings: [...groups.values()].map((group) => ({
            name: group.name,
            district: group.district,
            lastUpdatedAt: group.lastUpdatedAt,
            eligible: cohort(group.eligible, scope.isSuperAdmin),
            contactable: cohort(group.contactable, scope.isSuperAdmin),
            activity: cohort(group.activity, scope.isSuperAdmin),
          })),
          privacyNote: "Aggregate, consent-aware counts only. Person-level records are never returned.",
        },
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
