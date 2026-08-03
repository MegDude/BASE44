import {
  requireTransactionDatabase,
  sendTransactionError,
  TransactionApiError,
} from "../../src/lib/api/transactionAuth.js";
import { cleanWorkspaceValue, resolveAuthorizedWorkspaceScope } from "../_lib/workspaceScope.js";
import { getLegendsSeoReport } from "../../src/server/integrations/luxuryPresence/seoReport.js";

const PROVIDERS = new Set(["luxury_presence", "google_analytics", "stripe", "resend", "webhook"]);

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body); } catch { return {}; }
}

function sourceStatus({ active = false, hasSnapshot = false, lastUpdated = null }) {
  if (active) return { code: "connected", label: "Connected", lastUpdated };
  if (hasSnapshot) return { code: "snapshot", label: "Snapshot available", lastUpdated };
  return { code: "needs_connection", label: "Needs connection", lastUpdated: null };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  try {
    const database = requireTransactionDatabase();
    const scope = await resolveAuthorizedWorkspaceScope(req, database);
    const organizationId = scope.organization.id;

    if (req.method === "POST") {
      const body = readBody(req);
      if (body.action !== "request_connection") throw new TransactionApiError(400, "CONNECTION_ACTION_INVALID", "That connection action is not available.");
      const provider = cleanWorkspaceValue(body.provider, 80);
      const note = cleanWorkspaceValue(body.note, 1200);
      if (!PROVIDERS.has(provider)) throw new TransactionApiError(400, "CONNECTION_PROVIDER_INVALID", "Choose a supported service.");

      const { data: existing, error: existingError } = await database
        .from("partner_integration_requests")
        .select("id,status")
        .eq("organization_id", organizationId)
        .eq("provider", provider)
        .in("status", ["requested", "configuring"])
        .maybeSingle();
      if (existingError) throw existingError;
      if (!existing?.id) {
        const { error } = await database.from("partner_integration_requests").insert({
          organization_id: organizationId,
          provider,
          status: "requested",
          requested_by_user_id: scope.user.id,
          note: note || null,
        });
        if (error) throw error;
      }
      return res.status(202).json({ data: { provider, status: existing?.status || "requested" } });
    }

    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [requests, activityCount, listingCount, luxuryEvents, liveIntelligence] = await Promise.all([
      database.from("partner_integration_requests").select("provider,status,requested_at,updated_at").eq("organization_id", organizationId).order("requested_at", { ascending: false }),
      database.from("analytics_signals").select("id", { count: "exact", head: true }).eq("partner_organization_id", organizationId).gte("created_at", since),
      database.from("partner_listings").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "active"),
      scope.organization.external_id === "legends-real-estate"
        ? database.from("lead_activity_events").select("id", { count: "exact", head: true }).eq("source", "luxury_presence").gte("created_at", since)
        : Promise.resolve({ count: 0, error: null }),
      scope.organization.external_id === "legends-real-estate"
        ? database.from("luxury_presence_listing_intelligence").select("external_listing_id,updated_at")
        : Promise.resolve({ data: [], error: null }),
    ]);
    for (const result of [requests, activityCount, listingCount, luxuryEvents, liveIntelligence]) {
      if (result.error) throw result.error;
    }

    const requestByProvider = new Map((requests.data || []).map((row) => [row.provider, row]));
    const legendsSnapshot = scope.organization.external_id === "legends-real-estate" ? getLegendsSeoReport() : null;
    const lastLiveUpdate = (liveIntelligence.data || []).reduce((latest, row) => !latest || String(row.updated_at) > latest ? row.updated_at : latest, null);
    const cards = [
      {
        id: "workspace_activity",
        service: "Downtown Perks activity",
        connection: "Canonical workspace analytics",
        supports: "Map opens, saves, directions, QR, offers, campaigns, and events",
        status: sourceStatus({ active: Number(activityCount.count || 0) > 0 }),
        value: Number(activityCount.count || 0),
        action: null,
      },
      {
        id: "workspace_inventory",
        service: "Map and listing inventory",
        connection: "Canonical partner listings",
        supports: "Listing context, map management, and workspace attribution",
        status: sourceStatus({ active: Number(listingCount.count || 0) > 0 }),
        value: Number(listingCount.count || 0),
        action: null,
      },
      ...(legendsSnapshot ? [{
        id: "luxury_presence_seo",
        service: "Luxury Presence SEO Snapshot",
        connection: "Verified reporting snapshot",
        supports: "Search demand, keyword opportunities, and listing-content priorities",
        status: sourceStatus({ hasSnapshot: true, lastUpdated: legendsSnapshot.capturedAt }),
        value: legendsSnapshot.keywordMetrics.length,
        action: requestByProvider.get("luxury_presence")?.status || null,
        detail: "The current snapshot is available. Live export or webhook analytics has not yet delivered activity records.",
      }, {
        id: "luxury_presence_live",
        service: "Luxury Presence activity feed",
        connection: "Webhook or structured export",
        supports: "Listing views, favorites, inquiries, and qualified follow-up",
        status: sourceStatus({ active: Number(luxuryEvents.count || 0) > 0 || (liveIntelligence.data || []).length > 0, lastUpdated: lastLiveUpdate }),
        value: Number(luxuryEvents.count || 0),
        action: requestByProvider.get("luxury_presence")?.status || null,
        detail: "Live activity is shown only after the provider delivers a verified event or export.",
      }] : []),
    ];

    return res.status(200).json({
      data: {
        scope: {
          organizationId,
          organizationName: scope.organization.name,
          organizationSlug: scope.organization.external_id,
          role: scope.role,
          isSuperAdmin: scope.isSuperAdmin,
        },
        cards,
        requests: requests.data || [],
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendTransactionError(res, error);
  }
}
