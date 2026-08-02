import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";
import { resolveAuthorizedWorkspaceScope, cleanWorkspaceValue } from "../_lib/workspaceScope.js";

const PROVIDERS = new Set(["luxury_presence", "google_analytics", "stripe", "resend", "webhook", "audience_buildings"]);

function statusFromRequest(request, fallback) {
  if (request?.status === "requested") return "requested";
  if (request?.status === "configuring") return "configuring";
  if (request?.status === "failed") return "failed";
  return fallback;
}

function baseScope(scope) {
  return {
    organizationId: scope.organization.id,
    organizationName: scope.organization.name,
    portfolioId: scope.portfolio?.id || null,
    listingId: scope.listing?.id || null,
  };
}

function scopedListings(database, scope) {
  let query = database
    .from("partner_listings")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", scope.organization.id)
    .eq("status", "active");
  if (scope.portfolio?.id) query = query.eq("portfolio_id", scope.portfolio.id);
  if (scope.listing?.id) query = query.eq("id", scope.listing.id);
  return query;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    const database = requireTransactionDatabase();
    const scope = await resolveAuthorizedWorkspaceScope(req, database);

    if (req.method === "POST") {
      const body = typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
      const provider = cleanWorkspaceValue(body.provider, 80);
      if (!PROVIDERS.has(provider)) throw new TransactionApiError(400, "CONNECTION_PROVIDER_INVALID", "Choose a supported service.");
      const { error } = await database.from("partner_integration_requests").upsert({
        organization_id: scope.organization.id,
        portfolio_id: scope.portfolio?.id || null,
        listing_id: scope.listing?.id || null,
        provider,
        status: "requested",
        requested_by_user_id: scope.user.id,
        note: cleanWorkspaceValue(body.note, 1200) || null,
      }, { onConflict: "organization_id,provider" });
      if (error) throw error;
      return res.status(202).json({ data: { provider, status: "requested" } });
    }

    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const [listingsResult, requestsResult, snapshotResult, liveResult] = await Promise.all([
      scopedListings(database, scope),
      database
        .from("partner_integration_requests")
        .select("provider,status,updated_at")
        .eq("organization_id", scope.organization.id),
      scope.organization.external_id === "legends-real-estate"
        ? database.from("luxury_presence_listing_intelligence").select("external_listing_id,updated_at,last_activity_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1)
        : Promise.resolve({ count: 0, data: [], error: null }),
      scope.organization.external_id === "legends-real-estate"
        ? database.from("lead_activity_events").select("created_at,occurred_at", { count: "exact" }).eq("source", "luxury_presence").order("created_at", { ascending: false }).limit(1)
        : Promise.resolve({ count: 0, data: [], error: null }),
    ]);
    if (listingsResult.error || requestsResult.error || snapshotResult.error || liveResult.error) {
      throw listingsResult.error || requestsResult.error || snapshotResult.error || liveResult.error;
    }

    const requests = requestsResult.data || [];
    const requestFor = (provider) => requests.find((request) => request.provider === provider);
    const cards = [];
    const inventoryRequest = requestFor("webhook");
    cards.push({
      id: "inventory",
      provider: "webhook",
      service: "Downtown Perks inventory",
      source: "Canonical Downtown Perks source",
      connection: "Partner listings and map context",
      lastUpdate: null,
      detail: "Powers map context, scoped analytics, and workspace calls-to-action.",
      value: listingsResult.count || 0,
      status: statusFromRequest(inventoryRequest, (listingsResult.count || 0) ? "connected" : "needs_connection"),
      action: (listingsResult.count || 0) ? "open_analytics" : "request_connection",
      request: inventoryRequest || null,
    });

    const audienceRequest = requestFor("audience_buildings");
    cards.push({
      id: "audience_buildings",
      provider: "audience_buildings",
      service: "Resident audience",
      source: "Downtown Perks verified buildings",
      connection: "Authorized building audience scope",
      lastUpdate: audienceRequest?.updated_at || null,
      detail: "Supports aggregate resident reach and consent-aware contactability.",
      status: statusFromRequest(audienceRequest, "needs_connection"),
      action: "request_connection",
      request: audienceRequest || null,
    });

    if (scope.organization.external_id === "legends-real-estate") {
      const snapshot = snapshotResult.data?.[0] || null;
      const live = liveResult.data?.[0] || null;
      const request = requestFor("luxury_presence");
      const hasLiveDelivery = (liveResult.count || 0) > 0;
      cards.push({
        id: "luxury_presence",
        provider: "luxury_presence",
        service: "SEO Snapshot",
        source: "Source: Luxury Presence reporting dashboard",
        connection: hasLiveDelivery ? "Verified webhook or structured export" : "Captured SEO snapshot",
        lastUpdate: hasLiveDelivery ? (live?.occurred_at || live?.created_at) : (snapshot?.last_activity_at || snapshot?.updated_at || null),
        detail: hasLiveDelivery
          ? "Supports live listing views, favorites, inquiries, and activity. Person-level lead data is excluded."
          : "Snapshot available. Live listing views, favorites, inquiries, and activity require a verified webhook or structured export.",
        value: snapshotResult.count || 0,
        status: statusFromRequest(request, hasLiveDelivery ? "connected" : (snapshotResult.count || 0) ? "snapshot_available" : "needs_connection"),
        action: hasLiveDelivery ? "open_analytics" : "request_connection",
        request: request || null,
      });
    }

    return res.status(200).json({ data: { scope: baseScope(scope), cards, requests } });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
