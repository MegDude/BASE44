import {
  requireTransactionDatabase,
  sendTransactionError,
} from "../../src/lib/api/transactionAuth.js";
import { cleanWorkspaceValue, isWorkspaceUuid, resolveAuthorizedWorkspaceScope } from "../_lib/workspaceScope.js";
import { getLegendsSeoReport } from "../../src/server/integrations/luxuryPresence/seoReport.js";

function countRows(query) {
  return query.then(({ count, error }) => {
    if (error) throw error;
    return Number(count || 0);
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const scope = await resolveAuthorizedWorkspaceScope(req, database);
    const requestedPortfolioId = cleanWorkspaceValue(req.query?.portfolioId);
    const requestedListingId = cleanWorkspaceValue(req.query?.listingId);
    if (requestedPortfolioId && !isWorkspaceUuid(requestedPortfolioId)) {
      return res.status(400).json({ error: "The requested portfolio is invalid." });
    }
    if (requestedListingId && !isWorkspaceUuid(requestedListingId)) {
      return res.status(400).json({ error: "The requested listing is invalid." });
    }
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let listingQuery = database.from("partner_listings").select("id,external_id,entity_id,name,listing_type,updated_at").eq("organization_id", scope.organization.id).eq("status", "active");
    if (requestedPortfolioId) listingQuery = listingQuery.eq("portfolio_id", requestedPortfolioId);
    if (requestedListingId) listingQuery = listingQuery.eq("id", requestedListingId);

    const listings = await listingQuery;
    if (listings.error) throw listings.error;

    const scopedListingIds = (listings.data || []).map((listing) => listing.id).filter(Boolean);
    const scopedExternalIds = (listings.data || []).map((listing) => listing.external_id).filter(Boolean);
    let signalQuery = database.from("analytics_signals").select("action_type,source_type,created_at").eq("partner_organization_id", scope.organization.id).gte("created_at", since);
    if (requestedListingId) signalQuery = signalQuery.eq("listing_id", requestedListingId);
    else if (requestedPortfolioId) {
      if (!scopedListingIds.length) signalQuery = null;
      else signalQuery = signalQuery.in("listing_id", scopedListingIds);
    }

    const isLegendsScope = scope.organization.external_id === "legends-real-estate";
    const [signals, liveIntelligence, leadEvents] = await Promise.all([
      signalQuery || Promise.resolve({ data: [], error: null }),
      isLegendsScope && scopedExternalIds.length
        ? database.from("luxury_presence_listing_intelligence").select("external_listing_id,views_last_7_days,favorites_last_7_days,inquiries_last_7_days,demand_score,seller_intent_score,last_activity_at,updated_at").in("external_listing_id", scopedExternalIds)
        : Promise.resolve({ data: [], error: null }),
      isLegendsScope
        ? countRows(database.from("lead_activity_events").select("id", { count: "exact", head: true }).eq("source", "luxury_presence").gte("created_at", since))
        : Promise.resolve(0),
    ]);
    if (signals.error) throw signals.error;
    if (liveIntelligence.error) throw liveIntelligence.error;

    const byAction = {};
    for (const signal of signals.data || []) {
      const key = cleanWorkspaceValue(signal.action_type, 80) || "other";
      byAction[key] = (byAction[key] || 0) + 1;
    }
    const intelligenceByExternalId = new Map((liveIntelligence.data || []).map((row) => [row.external_listing_id, row]));
    const lp = (liveIntelligence.data || []).reduce((total, row) => ({
      views: total.views + Number(row.views_last_7_days || 0),
      favorites: total.favorites + Number(row.favorites_last_7_days || 0),
      inquiries: total.inquiries + Number(row.inquiries_last_7_days || 0),
      demand: total.demand + Number(row.demand_score || 0),
    }), { views: 0, favorites: 0, inquiries: 0, demand: 0 });
    const snapshot = isLegendsScope ? getLegendsSeoReport() : null;

    return res.status(200).json({
      data: {
        scope: {
          organizationId: scope.organization.id,
          organizationName: scope.organization.name,
          externalId: scope.organization.external_id,
          portfolioId: requestedPortfolioId || null,
          listingId: requestedListingId || null,
          role: scope.role,
        },
        listings: (listings.data || []).map((row) => ({
          id: row.id,
          entity_id: row.entity_id,
          display_name: row.name,
          entity_type: row.listing_type || "listing",
          map_filter: "Properties",
          updatedAt: row.updated_at,
          luxuryPresence: intelligenceByExternalId.get(row.external_id) || null,
        })),
        activity: { periodDays: 30, total: (signals.data || []).length, byAction },
        luxuryPresence: snapshot ? {
          seoSnapshot: snapshot,
          live: { ...lp, events: leadEvents, listingCount: (liveIntelligence.data || []).length },
          mode: leadEvents || (liveIntelligence.data || []).length ? "live" : "snapshot",
        } : null,
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
