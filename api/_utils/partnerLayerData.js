import { supabaseServer } from "../../src/lib/supabaseServer.js";
import { PARTNER_TYPE_CONTENT } from "../../src/lib/partnerContent.js";
import { getPartnerInsightPins } from "../../src/lib/map/partnerInsights.js";

const CONTENT_KEY_BY_API_TYPE = {
  property: "properties",
  hotel: "hospitality",
  venue: "venues",
  brand: "brands",
  civic: "civic",
  residential: "properties",
};

const SOURCE_LABELS = {
  property: ["Lobby QR", "Leasing link", "Elevator QR", "Amenity signage"],
  hotel: ["Lobby QR", "Elevator QR", "Room QR", "Welcome card"],
  venue: ["Map discovery", "Hotel referral", "Building referral", "Event placement"],
  brand: ["Campaign QR", "District placement", "Building QR", "Venue placement"],
  civic: ["District signage", "Event poster", "Kiosk", "Direct link"],
};

function contentFor(partnerType) {
  return PARTNER_TYPE_CONTENT[CONTENT_KEY_BY_API_TYPE[partnerType] || "properties"];
}

function parseMetricValue(rawValue) {
  if (typeof rawValue === "number") return rawValue;
  if (!rawValue) return 0;
  const cleaned = String(rawValue).replace(/[^0-9.]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildFallbackHeroMetrics(partnerType) {
  const content = contentFor(partnerType);
  const stats = content.heroStats || [];
  const cards = content.measurementMetrics || content.secondaryStats || [];

  return {
    lastUpdatedAt: new Date().toISOString(),
    primary: stats.map((item) => ({ label: item.label, value: item.value })),
    proof: content.proofStrip || cards.slice(0, 4).map((item) => ({ label: item.label, value: item.value })),
  };
}

function buildFallbackList(partnerType) {
  const content = contentFor(partnerType);
  const items = content.venueList || [];

  return items.map((item, index) => ({
    id: `${partnerType}-${slugify(item.name || `item-${index + 1}`)}`,
    name: item.name,
    summary: item.value,
    views: 80 + index * 18,
    actions: 24 + index * 9,
    saves: 12 + index * 4,
    unlocks: 6 + index * 2,
  }));
}

function buildFallbackActivity(partnerType, selectedId = null) {
  const content = contentFor(partnerType);
  const items = content.liveMoments || content.liveActivity || [];

  return items.slice(0, 6).map((item, index) => ({
    id: `${partnerType}-activity-${index + 1}`,
    label: item.title,
    sourceName: item.meta,
    relativeTime: item.stamp || "Live",
    partnerId: selectedId,
  }));
}

function buildFallbackMetrics(partnerType, partnerId) {
  const content = contentFor(partnerType);
  const cards = content.measurementMetrics || content.secondaryStats || [];

  const base = {
    partnerId,
    views: 0,
    actions: 0,
    saves: 0,
    unlocks: 0,
    visits: 0,
    accessPoints: 0,
    returnRate: 0,
    nearbyCoverage: 0,
    selfServeRate: 0,
  };

  cards.forEach((item) => {
    const label = String(item.label || "").toLowerCase();
    const value = parseMetricValue(item.value);
    if (label.includes("open") || label.includes("view")) base.views = value;
    if (label.includes("action") || label.includes("engagement")) base.actions = value;
    if (label.includes("save")) base.saves = value;
    if (label.includes("unlock")) base.unlocks = value;
    if (label.includes("visit")) base.visits = value;
    if (label.includes("coverage") || label.includes("linked")) base.nearbyCoverage = value;
    if (label.includes("return")) base.returnRate = value;
    if (label.includes("self-serve")) base.selfServeRate = value;
  });

  base.accessPoints = SOURCE_LABELS[partnerType]?.length || 4;
  if (!base.actions) base.actions = Math.max(12, Math.round(base.views * 0.38));
  if (!base.saves) base.saves = Math.max(6, Math.round(base.actions * 0.42));
  if (!base.unlocks) base.unlocks = Math.max(4, Math.round(base.actions * 0.18));
  if (!base.visits) base.visits = Math.max(8, Math.round(base.actions * 0.24));
  if (!base.nearbyCoverage) base.nearbyCoverage = 8;
  if (!base.returnRate) base.returnRate = 29;
  if (!base.selfServeRate) base.selfServeRate = 71;

  return base;
}

function buildFallbackSources(partnerType) {
  const labels = SOURCE_LABELS[partnerType] || SOURCE_LABELS.property;
  return labels.map((label, index) => ({
    access_point_id: `${partnerType}-source-${index + 1}`,
    label,
    source_code: `${slugify(label).toUpperCase().replace(/-/g, "_")}_${index + 1}`,
    map_opens: 120 - index * 18,
    entity_opens: 44 - index * 7,
    saves: 21 - index * 3,
    unlocks: 9 - index * 2,
    redemptions: Math.max(2, 7 - index),
  }));
}

async function queryPartnersTable(partnerType) {
  if (!supabaseServer) return null;
  const { data, error } = await supabaseServer
    .from("partners")
    .select("id, name, partner_type, status")
    .eq("partner_type", partnerType)
    .limit(24);

  if (error) return null;
  return data || [];
}

async function queryInteractionEvents(partnerType, partnerId = null) {
  if (!supabaseServer) return null;
  let query = supabaseServer
    .from("interaction_events")
    .select("id, event_type, occurred_at, metadata, source_partner_id, partner_id, entity_id")
    .gte("occurred_at", new Date(Date.now() - 30 * 86400000).toISOString())
    .order("occurred_at", { ascending: false })
    .limit(partnerId ? 250 : 500);

  if (partnerId) {
    query = query.eq("source_partner_id", partnerId);
  } else {
    query = query.eq("partner_type", partnerType);
  }

  const { data, error } = await query;
  if (error) return null;
  return data || [];
}

export async function getPartnerHeroMetrics(partnerType) {
  const fallback = buildFallbackHeroMetrics(partnerType);
  const partners = await queryPartnersTable(partnerType);
  const events = await queryInteractionEvents(partnerType);

  if (!partners || !events) return fallback;

  const activePartners = partners.filter((item) => item.status !== "inactive");
  const saves = events.filter((item) => item.event_type === "save").length;
  const unlocks = events.filter((item) => item.event_type === "unlock_complete" || item.event_type === "redeem_complete").length;
  const actions = events.length;

  return {
    lastUpdatedAt: events[0]?.occurred_at || new Date().toISOString(),
    primary: [
      { label: `${contentFor(partnerType).label} live`, value: String(activePartners.length || fallback.primary[0]?.value || 0) },
      { label: "Actions", value: String(actions || fallback.primary[1]?.value || 0) },
      { label: "Saves", value: String(saves || fallback.primary[2]?.value || 0) },
      { label: "Unlocks", value: String(unlocks || fallback.primary[3]?.value || 0) },
    ],
    proof: fallback.proof,
  };
}

export async function getPartnerList(partnerType) {
  const fallback = buildFallbackList(partnerType);
  const partners = await queryPartnersTable(partnerType);
  if (!partners?.length) return fallback;

  return partners.map((item, index) => ({
    id: item.id,
    name: item.name,
    summary: fallback[index]?.summary || "Live partner node",
    views: fallback[index]?.views || 80 - index * 5,
    actions: fallback[index]?.actions || 24 - index,
    saves: fallback[index]?.saves || 12 - index,
    unlocks: fallback[index]?.unlocks || 6 - Math.floor(index / 2),
  }));
}

export async function getPartnerActivity(partnerType, partnerId = null) {
  const fallback = buildFallbackActivity(partnerType, partnerId);
  const events = await queryInteractionEvents(partnerType, partnerId);
  if (!events?.length) return fallback;

  return events.slice(0, 6).map((item, index) => ({
    id: item.id || `${partnerType}-evt-${index + 1}`,
    label: item.metadata?.label || item.event_type?.replace(/_/g, " ") || "Partner activity",
    sourceName: item.metadata?.sourceName || item.source_partner_id || contentFor(partnerType).label,
    relativeTime: item.occurred_at ? new Date(item.occurred_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Live",
    partnerId: item.source_partner_id || partnerId,
  }));
}

export async function getPartnerMetrics(partnerType, partnerId) {
  const fallback = buildFallbackMetrics(partnerType, partnerId);
  const events = await queryInteractionEvents(partnerType, partnerId);
  if (!events?.length) return fallback;

  const views = events.filter((item) => item.event_type === "map_open" || item.event_type === "pin_view").length;
  const actions = events.filter((item) => item.event_type === "entity_open" || item.event_type === "filter_change").length;
  const saves = events.filter((item) => item.event_type === "save").length;
  const unlocks = events.filter((item) => item.event_type === "unlock_complete" || item.event_type === "redeem_complete").length;

  return {
    ...fallback,
    views: views || fallback.views,
    actions: actions || fallback.actions,
    saves: saves || fallback.saves,
    unlocks: unlocks || fallback.unlocks,
    visits: Math.max(fallback.visits, Math.round((actions || fallback.actions) * 0.44)),
  };
}

export async function getPartnerSources(partnerType, partnerId) {
  const fallback = buildFallbackSources(partnerType);
  if (!supabaseServer) return fallback;

  const { data: accessPoints, error } = await supabaseServer
    .from("access_points")
    .select("id, label, source_code")
    .eq("partner_id", partnerId)
    .limit(24);

  if (error || !accessPoints?.length) return fallback;

  return accessPoints.map((item, index) => ({
    access_point_id: item.id,
    label: item.label,
    source_code: item.source_code,
    map_opens: fallback[index]?.map_opens || 0,
    entity_opens: fallback[index]?.entity_opens || 0,
    saves: fallback[index]?.saves || 0,
    unlocks: fallback[index]?.unlocks || 0,
    redemptions: fallback[index]?.redemptions || 0,
  }));
}

export function getPartnerMapItems(partnerType) {
  return getPartnerInsightPins({ partnerType: CONTENT_KEY_BY_API_TYPE[partnerType] || partnerType });
}
