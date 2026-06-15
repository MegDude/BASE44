import type { NormalizedEntity } from "./normalizeEntity";

export type MapAction =
  | "SWITCH_TO_RESIDENT"
  | "SWITCH_TO_PARTNER"
  | "SHOW_RESIDENT_PASS"
  | "OPEN_EVENTS"
  | "LAUNCH_CAMPAIGN"
  | "OPEN_REPORTS"
  | "OPEN_DASHBOARD"
  | "OPEN_PARTNER_PAGE"
  | "OPEN_PRICING"
  | "OPEN_CONTACT"
  | "SAVE_ENTITY"
  | "UNSAVE_ENTITY"
  | "RSVP_EVENT"
  | "GET_DIRECTIONS";

export const mapRoutes = {
  residentMap: "/map?mode=resident&tab=map",
  residentPass: "/map?mode=resident&tab=pass",
  partnerMap: "/map?mode=partner&tab=map",
  dashboard: "/partners/dashboard",
  partnerWorkspace: "/partner-workspace/overview",
  campaigns: "/partners/campaigns",
  reports: "/partner-workspace/reports",
  card: "/map?mode=resident&tab=pass",
  events: "/map?mode=resident&tab=map&filter=Events",
  perks: "/map?mode=resident&tab=map&filter=Perks",
  properties: "/map?mode=partner&tab=map&filter=Properties",
  partners: "/partners",
};

export const mapActionRoutes: Record<
  Exclude<MapAction, "SAVE_ENTITY" | "UNSAVE_ENTITY" | "RSVP_EVENT" | "GET_DIRECTIONS">,
  string
> = {
  SWITCH_TO_RESIDENT: mapRoutes.residentMap,
  SWITCH_TO_PARTNER: mapRoutes.partnerMap,
  SHOW_RESIDENT_PASS: mapRoutes.residentPass,
  OPEN_EVENTS: "/map?mode=resident&tab=events",
  LAUNCH_CAMPAIGN: "/map?mode=partner&tab=campaigns",
  OPEN_REPORTS: "/map?mode=partner&tab=reports",
  OPEN_DASHBOARD: "/map?mode=partner&tab=activity",
  OPEN_PARTNER_PAGE: "/map?mode=partner&tab=info",
  OPEN_PRICING: mapRoutes.partnerWorkspace,
  OPEN_CONTACT: mapRoutes.partnerWorkspace,
};

export function mapActionPath(
  action: keyof typeof mapActionRoutes,
  entity?: Pick<Partial<NormalizedEntity>, "id" | "type" | "district"> & {
    entity_id?: string;
    entity_type?: string;
  },
) {
  const base = mapActionRoutes[action];
  if (action !== "LAUNCH_CAMPAIGN" || !entity) return base;

  const [path, existingQuery = ""] = base.split("?");
  const params = new URLSearchParams(existingQuery);
  const entityId = entity.id || entity.entity_id;
  const entityType = entity.type || entity.entity_type;
  if (entityId) params.set("entityId", String(entityId));
  if (entityType) params.set("entityType", String(entityType));
  if (entity.district) params.set("district", String(entity.district));

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function campaignRoute(entity?: Partial<NormalizedEntity>) {
  if (!entity?.id) return mapRoutes.campaigns;
  const params = new URLSearchParams({
    entityId: String(entity.id),
    entityType: String(entity.type || ""),
    district: String(entity.district || ""),
  });
  return `${mapRoutes.campaigns}?${params.toString()}`;
}

export function directionsUrl(entity: Partial<NormalizedEntity>) {
  const query = encodeURIComponent(
    entity.address || `${entity.latitude || ""},${entity.longitude || ""}` || String(entity.name || "Austin, TX"),
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export const panelActionRoutes = {
  showCard: (entityId?: string) =>
    `/map?mode=resident&tab=pass${entityId ? `&sourceEntity=${encodeURIComponent(entityId)}` : ""}`,
  venueQuery: (name: string) =>
    `/map?mode=resident&tab=map&filter=Venues&query=${encodeURIComponent(name)}`,
  nearbyPerks: (entityId?: string) =>
    `/map?mode=resident&tab=map&filter=Perks${entityId ? `&near=${encodeURIComponent(entityId)}` : ""}`,
  eventsNearby: (entityId?: string) =>
    `/map?mode=resident&tab=map&filter=Events${entityId ? `&near=${encodeURIComponent(entityId)}` : ""}`,
  becomePartner: (entityId?: string, partnerType?: string) => {
    const filter =
      partnerType === "property"
        ? "Properties"
        : partnerType === "venue"
          ? "Venues"
          : "All";
    return `/map?mode=partner&tab=info&filter=${encodeURIComponent(filter)}${entityId ? `&entityId=${encodeURIComponent(entityId)}` : ""}`;
  },
  partnerCampaign: (entityId?: string, network = "inkind") =>
    `/map?mode=partner&tab=campaigns&network=${encodeURIComponent(network)}${entityId ? `&entityId=${encodeURIComponent(entityId)}` : ""}`,
  partnerReports: (entityId?: string, network = "inkind") =>
    `/map?mode=partner&tab=reports&network=${encodeURIComponent(network)}${entityId ? `&entityId=${encodeURIComponent(entityId)}` : ""}`,
};

export const workspaceActionRoutes = {
  LAUNCH_CAMPAIGN: "/partner-workspace/campaigns",
  GENERATE_REPORT: "/partner-workspace/reports",
  OPEN_DASHBOARD: "/partner-workspace/overview",
  OPEN_VISIBILITY: "/partner-workspace/analytics",
  OPEN_REPORTS: "/partner-workspace/reports",
  OPEN_ENGAGEMENT: "/partner-workspace/engagement",
  OPEN_EVENTS: "/partner-workspace/events",
  OPEN_BUILDINGS: "/partner-workspace/buildings",
  OPEN_SEGMENTS: "/partner-workspace/segmentation",
  OPEN_LIVE_MAP: "/partner-workspace/map",
  OPEN_PARTNER_MAP: mapRoutes.partnerMap,
} as const;

export const FILTER_TO_ENTITY_TYPES = {
  all: ["venue", "property", "event", "offer", "hotel", "brand", "civic", "service", "wellness", "journal", "guide"],
  perks: ["offer", "perk"],
  inkind: ["inkind", "offer", "venue", "restaurant", "bar", "hospitality"],
  aroundTheCorner: ["nearby"],
  properties: ["property", "residential", "listing"],
  venues: ["venue", "restaurant", "bar", "coffee", "wellness"],
  hotels: ["hotel"],
  brands: ["brand", "sponsor"],
  events: ["event"],
  civic: ["civic"],
  services: ["service"],
  wellness: ["wellness", "venue", "service"],
  journal: ["journal"],
  localGuide: ["guide"],
} as const;
