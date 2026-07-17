import { base44 } from "@/api/base44Client";
import { readPlatformEvents } from "@/lib/platformEvents";

export const ANALYTICS_VIEWS = [
  ["overview", "Overview"],
  ["audience", "Audience"],
  ["places", "Places"],
  ["campaigns", "Campaigns"],
  ["activity", "Offers & Events"],
  ["sources", "Sources"],
  ["geography", "Geography"],
  ["reports", "Reports"],
];

export const ANALYTICS_RANGES = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  ytd: null,
};

export const METRIC_DEFINITIONS = {
  opens: "A unique or total opening of a Downtown Perks experience.",
  qr_activity: "A valid QR or approved trackable-link open associated with this workspace.",
  views: "A listing or entity detail that rendered successfully.",
  saves: "An intentional save of a place, offer, or event.",
  directions: "A directions action initiated from Downtown Perks.",
  visits: "A location visit recorded under the approved visit rules.",
  redemptions: "An offer validation completed successfully.",
  rsvps: "An event RSVP completed successfully.",
  repeat: "The same subject completing an action in separate sessions.",
};

const EVENT_METRICS = {
  "qr.opened": "qr_activity",
  "qr.scanned": "qr_activity",
  "qr_scan": "qr_activity",
  "entity.opened": "opens",
  "experience.opened": "opens",
  "entity.viewed": "views",
  "listing.viewed": "views",
  "entity.saved": "saves",
  "offer.saved": "saves",
  "event.saved": "saves",
  "directions.requested": "directions",
  "location.visited": "visits",
  "visit.verified": "visits",
  "perk.redeemed": "redemptions",
  "offer.redeemed": "redemptions",
  "event.rsvp": "rsvps",
  "event.rsvp_completed": "rsvps",
  "event.checkin": "visits",
  "campaign.joined": "opens",
};

const SOURCE_LABELS = {
  map_discovery: "Resident map",
  partner_map: "Partner map",
  qr: "QR code",
  qr_scan: "QR code",
  direct: "Direct link",
  direct_link: "Direct link",
  email: "Email",
  sms: "SMS",
  partner_website: "Partner website",
  social: "Social",
  campaign: "Campaign placement",
  building_portal: "Building portal",
  guest_guide: "Hotel guest guide",
  referral: "Referral",
  api: "API",
};

export async function loadWorkspaceAnalytics({ workspace, entities = [], range = "30d", from = null, to = null, filters = {} }) {
  const workspaceId = workspace?.id;
  if (!workspaceId) return emptyAnalytics("No workspace is selected.");
  const entityIds = new Set(entities.map((entity) => entity.entity_id).filter(Boolean));
  const period = getPeriodWindow({ range, from, to });
  const localEvents = readPlatformEvents().filter((event) => {
    const belongsToWorkspace = event.partnerId === workspaceId || entityIds.has(event.entityId);
    return belongsToWorkspace && isInWindow(event.timestamp, period.comparisonFrom, period.to);
  });

  let remoteEvents = [];
  let remoteStatus = "available";
  try {
    const signals = await base44.entities.AnalyticsSignal.filter({ workspace_id: workspaceId }, "-timestamp", 5000);
    remoteEvents = (signals || []).filter((signal) => isInWindow(signal.timestamp || signal.occurred_at, period.comparisonFrom, period.to));
  } catch {
    remoteStatus = "unavailable";
  }

  const allEvents = dedupeEvents([...localEvents, ...remoteEvents].map(normalizeAnalyticsEvent).filter(isReportableEvent))
    .filter((event) => matchesAnalyticsFilters(event, filters));
  const events = allEvents.filter((event) => isInWindow(event.occurredAt, period.from, period.to));
  const previousEvents = allEvents.filter((event) => isInWindow(event.occurredAt, period.comparisonFrom, period.comparisonTo));
  if (events.length === 0) {
    return {
      ...emptyAnalytics("No activity was recorded for this workspace and period."),
      remoteStatus,
      workspaceId,
      isDemo: Boolean(workspace.is_demo),
      period,
      previousScorecard: buildScorecard(previousEvents),
    };
  }

  const scorecard = buildScorecard(events);
  const places = buildPlaces(events, entities);
  const sources = buildSources(events);
  const geography = buildGeography(events);
  const trend = buildTrend(events);
  const funnel = buildFunnel(scorecard);
  return {
    status: "ready",
    statusMessage: remoteStatus === "unavailable"
      ? "Showing locally recorded activity. Hosted analytics are temporarily unavailable."
      : "Workspace-scoped event data is available.",
    remoteStatus,
    workspaceId,
    isDemo: Boolean(workspace.is_demo),
    eventCount: events.length,
    period,
    scorecard,
    previousScorecard: buildScorecard(previousEvents),
    trend,
    funnel,
    places,
    sources,
    geography,
    campaigns: groupById(events, "campaignId"),
    offers: groupById(events.filter((event) => /offer|perk|redeem/i.test(event.type)), "offerId"),
    partnerEvents: groupById(events.filter((event) => /event|rsvp/i.test(event.type)), "partnerEventId"),
    recommendation: recommendNextAction(scorecard, places),
  };
}

function matchesAnalyticsFilters(event, filters = {}) {
  return (!filters.entity || event.entityId === filters.entity)
    && (!filters.campaign || event.campaignId === filters.campaign)
    && (!filters.offer || event.offerId === filters.offer)
    && (!filters.partnerEvent || event.partnerEventId === filters.partnerEvent)
    && (!filters.source || event.source === filters.source)
    && (!filters.district || event.district === filters.district);
}

function emptyAnalytics(message) {
  return {
    status: "empty",
    statusMessage: message,
    eventCount: 0,
    scorecard: Object.keys(METRIC_DEFINITIONS).map((id) => ({ id, value: 0, definition: METRIC_DEFINITIONS[id] })),
    trend: [], funnel: [], places: [], sources: [], geography: [], campaigns: [], offers: [], partnerEvents: [],
    recommendation: {
      action: "Complete tracking setup",
      evidence: "No workspace-scoped events are available for the selected period.",
      outcome: "Verified tracking will make performance and comparisons available.",
      confidence: "High",
    },
  };
}

function normalizeAnalyticsEvent(event = {}) {
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
  return {
    id: event.id,
    type: event.type || event.eventName || event.event_name || event.action_type || "unknown",
    occurredAt: event.timestamp || event.occurredAt || event.occurred_at || event.created_date,
    sessionId: event.sessionId || event.session_id || null,
    entityId: event.entityId || event.entity_id || null,
    campaignId: event.campaignId || event.campaign_id || null,
    offerId: event.offerId || event.offer_id || metadata.offerId || null,
    partnerEventId: event.partnerEventId || event.partner_event_id || metadata.eventId || null,
    source: event.source || event.source_type || metadata.source || "unknown",
    district: event.district || event.district_id || metadata.district || metadata.districtId || "Unknown",
    anonymousVisitorId: event.anonymousVisitorId || event.anonymous_visitor_id || metadata.anonymousVisitorId || null,
    qrCodeId: event.qrCodeId || event.qr_code_id || metadata.qrCodeId || null,
    redemptionStatus: event.redemptionStatus || event.redemption_status || event.status || metadata.status || null,
    isInternal: Boolean(event.isInternal || event.is_internal || metadata.isInternal || metadata.is_internal),
    isTest: Boolean(event.isTest || event.is_test || metadata.isTest || metadata.is_test),
  };
}

function isReportableEvent(event) {
  if (event.isInternal || event.isTest) return false;
  if (/bot|crawler|preview|admin\.preview|qa\.test/i.test(event.type)) return false;
  if (/redeem/i.test(event.type) && event.redemptionStatus) {
    return ["confirmed", "validated", "completed"].includes(String(event.redemptionStatus).toLowerCase());
  }
  return true;
}

function buildScorecard(events) {
  const counts = Object.fromEntries(Object.keys(METRIC_DEFINITIONS).map((key) => [key, 0]));
  const sessions = new Map();
  for (const event of events) {
    const metric = EVENT_METRICS[event.type];
    if (metric) counts[metric] += 1;
    if (event.sessionId) sessions.set(event.sessionId, (sessions.get(event.sessionId) || 0) + 1);
  }
  counts.repeat = [...sessions.values()].filter((count) => count > 1).length;
  return Object.entries(counts).map(([id, value]) => ({ id, value, definition: METRIC_DEFINITIONS[id] }));
}

function buildTrend(events) {
  const byDay = new Map();
  for (const event of events) {
    const day = String(event.occurredAt || "").slice(0, 10);
    if (!day) continue;
    const metric = EVENT_METRICS[event.type];
    const row = byDay.get(day) || { date: day };
    if (metric) row[metric] = (row[metric] || 0) + 1;
    byDay.set(day, row);
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function buildFunnel(scorecard) {
  const counts = Object.fromEntries(scorecard.map((metric) => [metric.id, metric.value]));
  return [
    ["Discovered", counts.opens + counts.views], ["Opened", counts.opens], ["Saved", counts.saves],
    ["Directions", counts.directions], ["Visited", counts.visits], ["Redeemed", counts.redemptions],
    ["Returned", counts.repeat],
  ].map(([label, value], index, rows) => ({
    label, value,
    conversion: index === 0 ? 100 : rows[index - 1][1] > 0 ? Math.round((value / rows[index - 1][1]) * 100) : null,
  }));
}

function buildPlaces(events, entities) {
  const entityById = new Map(entities.map((entity) => [entity.entity_id, entity]));
  const counts = new Map();
  for (const event of events) {
    if (!event.entityId || !entityById.has(event.entityId)) continue;
    const row = counts.get(event.entityId) || { entityId: event.entityId, actions: 0, views: 0, saves: 0, directions: 0, visits: 0, redemptions: 0 };
    row.actions += 1;
    const metric = EVENT_METRICS[event.type];
    if (metric && metric in row) row[metric] += 1;
    counts.set(event.entityId, row);
  }
  return [...counts.values()].map((row) => ({ ...row, entity: entityById.get(row.entityId) }))
    .sort((a, b) => b.actions - a.actions);
}

function buildSources(events) {
  const rows = new Map();
  for (const event of events) {
    const id = event.source || "unknown";
    const row = rows.get(id) || { id, label: SOURCE_LABELS[id] || "Unknown", entries: 0, actions: 0 };
    row.entries += /opened|viewed|entered|scan/i.test(event.type) ? 1 : 0;
    row.actions += 1;
    rows.set(id, row);
  }
  return [...rows.values()].map((row) => ({ ...row, conversion: row.entries > 0 ? Math.round((row.actions / row.entries) * 100) : null }))
    .sort((a, b) => b.actions - a.actions);
}

function buildGeography(events) {
  const rows = new Map();
  for (const event of events) {
    const id = event.district || "Unknown";
    rows.set(id, (rows.get(id) || 0) + 1);
  }
  return [...rows].map(([district, actions]) => ({ district, actions })).sort((a, b) => b.actions - a.actions);
}

function groupById(events, key) {
  const rows = new Map();
  for (const event of events) {
    const id = event[key];
    if (!id) continue;
    const row = rows.get(id) || { id, actions: 0 };
    row.actions += 1;
    rows.set(id, row);
  }
  return [...rows.values()].sort((a, b) => b.actions - a.actions);
}

function recommendNextAction(scorecard, places) {
  const counts = Object.fromEntries(scorecard.map((metric) => [metric.id, metric.value]));
  if (counts.views > 0 && counts.saves === 0) return { action: "Improve the leading listing", evidence: `${counts.views} views produced no recorded saves.`, outcome: "A clearer offer and profile may turn attention into intent.", confidence: "Medium" };
  if (counts.saves > 0 && counts.directions === 0) return { action: "Follow up with saved audiences", evidence: `${counts.saves} saves produced no recorded direction requests.`, outcome: "A time-bound offer may help people take the next step.", confidence: "Medium" };
  if (places[0]) return { action: "Extend the strongest place", evidence: `${places[0].entity?.display_name || "The leading place"} generated the most recorded actions.`, outcome: "Use the same message or placement in the next campaign.", confidence: "Medium" };
  return emptyAnalytics("").recommendation;
}

export function getPeriodWindow({ range = "30d", from = null, to = null } = {}) {
  const end = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? new Date(`${to}T23:59:59.999-05:00`) : new Date();
  const customStart = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? new Date(`${from}T00:00:00.000-05:00`) : null;
  const days = ANALYTICS_RANGES[range] ?? 30;
  const rangeStart = range === "ytd"
    ? new Date(end.getFullYear(), 0, 1)
    : new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  const start = customStart || rangeStart;
  const duration = Math.max(1, end.getTime() - start.getTime() + 1);
  const comparisonTo = new Date(start.getTime() - 1);
  const comparisonFrom = new Date(comparisonTo.getTime() - duration + 1);
  return { from: start.toISOString(), to: end.toISOString(), comparisonFrom: comparisonFrom.toISOString(), comparisonTo: comparisonTo.toISOString() };
}
function isInWindow(value, from, to) { const date = new Date(value || 0); return !Number.isNaN(date.getTime()) && date >= new Date(from) && date <= new Date(to); }
function dedupeEvents(events) {
  const seen = new Set();
  const recentQr = new Map();
  const savedEntities = new Set();
  return events.filter((event, index) => {
    const key = event.id || `${event.type}:${event.occurredAt}:${event.entityId || ""}:${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (/save/i.test(event.type)) {
      const subject = event.anonymousVisitorId || event.sessionId;
      if (subject) {
        const saveKey = `${subject}:${event.entityId || event.offerId || event.partnerEventId || "unknown"}`;
        if (savedEntities.has(saveKey)) return false;
        savedEntities.add(saveKey);
      }
    }
    if (/qr|scan/i.test(event.type)) {
      const subject = event.anonymousVisitorId || event.sessionId;
      if (subject) {
        const qrKey = `${subject}:${event.qrCodeId || event.entityId || "workspace"}`;
        const occurredAt = new Date(event.occurredAt || 0).getTime();
        const previous = recentQr.get(qrKey);
        if (previous && occurredAt - previous < 30_000) return false;
        recentQr.set(qrKey, occurredAt);
      }
    }
    return true;
  });
}
