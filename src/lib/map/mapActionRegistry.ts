import type { NormalizedEntity } from "./normalizeEntity";

export const mapRoutes = {
  residentMap: "/map?mode=resident&tab=map",
  residentPass: "/map?mode=resident&tab=pass",
  partnerMap: "/map?mode=partner&tab=map",
  dashboard: "/partners/dashboard",
  partnerWorkspace: "/partner-workspace/overview",
  campaigns: "/partners/campaigns",
  reports: "/partner-workspace/reports",
  card: "/card",
  events: "/events",
  perks: "/perks",
  properties: "/partners/properties",
  partners: "/partners",
};

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
