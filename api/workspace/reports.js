import { requireTransactionDatabase, sendTransactionError, TransactionApiError } from "../../src/lib/api/transactionAuth.js";
import { cleanWorkspaceValue, isWorkspaceUuid, resolveAuthorizedWorkspaceScope } from "../_lib/workspaceScope.js";

const METRICS = {
  views: new Set(["view", "view_item", "map_view", "page_view", "impression"]),
  mapActions: new Set(["map_action", "directions", "call", "website_click", "share"]),
  offerOpens: new Set(["offer_open", "perk_open", "offer_view"]),
  saves: new Set(["save", "favorite"]),
  redemptions: new Set(["redeem", "redemption", "perk_redemption"]),
  conversions: new Set(["conversion", "booking", "rsvp", "lead", "inquiry"]),
};

function parseDate(value, fallback) {
  const text = cleanWorkspaceValue(value, 32);
  const date = text ? new Date(`${text}T00:00:00.000Z`) : fallback;
  if (Number.isNaN(date.getTime())) throw new TransactionApiError(400, "REPORT_DATE_INVALID", "Choose a valid report date range.");
  return date;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function summarize(rows) {
  const summary = Object.fromEntries(Object.keys(METRICS).map((key) => [key, 0]));
  const actions = new Map();
  for (const row of rows || []) {
    const action = String(row.action_type || "activity").toLowerCase();
    const value = Number.isFinite(Number(row.value)) ? Number(row.value) : 1;
    for (const [metric, aliases] of Object.entries(METRICS)) if (aliases.has(action)) summary[metric] += value;
    const source = String(row.source_type || "workspace");
    const key = `${source}:${action}`;
    const current = actions.get(key) || { source, action, count: 0 };
    current.count += value;
    actions.set(key, current);
  }
  return { summary, actions: [...actions.values()].sort((a, b) => b.count - a.count) };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const database = requireTransactionDatabase();
    const scope = await resolveAuthorizedWorkspaceScope(req, database);
    const requestedPortfolioId = cleanWorkspaceValue(req.query?.portfolioId);
    const requestedListingId = cleanWorkspaceValue(req.query?.listingId);
    if (requestedPortfolioId && !isWorkspaceUuid(requestedPortfolioId)) throw new TransactionApiError(400, "REPORT_PORTFOLIO_INVALID", "The requested portfolio is invalid.");
    if (requestedListingId && !isWorkspaceUuid(requestedListingId)) throw new TransactionApiError(400, "REPORT_LISTING_INVALID", "The requested listing is invalid.");

    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setUTCDate(defaultStart.getUTCDate() - 29);
    const start = parseDate(req.query?.startDate, defaultStart);
    const end = parseDate(req.query?.endDate, today);
    end.setUTCHours(23, 59, 59, 999);
    if (start > end) throw new TransactionApiError(400, "REPORT_RANGE_INVALID", "The report start date must be before the end date.");
    const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - dayCount * 86400000);

    let listingQuery = database.from("partner_listings").select("id").eq("organization_id", scope.organization.id).eq("status", "active");
    if (requestedPortfolioId) listingQuery = listingQuery.eq("portfolio_id", requestedPortfolioId);
    if (requestedListingId) listingQuery = listingQuery.eq("id", requestedListingId);
    const { data: listings, error: listingError } = await listingQuery;
    if (listingError) throw listingError;
    const listingIds = (listings || []).map((listing) => listing.id).filter(Boolean);

    function signalQuery(from, to) {
      let query = database.from("analytics_signals").select("action_type,source_type,value,created_at,listing_id").eq("partner_organization_id", scope.organization.id).gte("created_at", from.toISOString()).lte("created_at", to.toISOString());
      if (requestedListingId) query = query.eq("listing_id", requestedListingId);
      else if (requestedPortfolioId && listingIds.length) query = query.in("listing_id", listingIds);
      else if (requestedPortfolioId) return Promise.resolve({ data: [], error: null });
      return query;
    }

    const [currentResult, previousResult] = await Promise.all([signalQuery(start, end), signalQuery(previousStart, previousEnd)]);
    if (currentResult.error) throw currentResult.error;
    if (previousResult.error) throw previousResult.error;
    const current = summarize(currentResult.data);
    const previous = summarize(previousResult.data);
    const metrics = Object.keys(METRICS).map((key) => ({
      key,
      value: current.summary[key],
      previous: previous.summary[key],
      change: current.summary[key] - previous.summary[key],
    }));
    const payload = {
      generatedAt: new Date().toISOString(),
      scope: { organizationId: scope.organization.id, organizationName: scope.organization.name, portfolioId: requestedPortfolioId || null, listingId: requestedListingId || null },
      period: { startDate: isoDate(start), endDate: isoDate(end), compareTo: "previous_period" },
      summary: current.summary,
      metrics,
      actions: current.actions,
    };

    if (req.query?.format === "csv") {
      const rows = [["Workspace", scope.organization.name], ["Period", `${isoDate(start)} to ${isoDate(end)}`], [], ["Metric", "Current", "Previous", "Change"], ...metrics.map((item) => [item.key, item.value, item.previous, item.change])];
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="downtown-perks-${scope.organization.external_id || "workspace"}-report.csv"`);
      return res.status(200).send(rows.map((row) => row.map(csvCell).join(",")).join("\n"));
    }
    return res.status(200).json(payload);
  } catch (error) {
    return sendTransactionError(res, error, "Workspace reports could not be loaded.");
  }
}
