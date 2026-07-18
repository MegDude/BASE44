import { z } from "zod";

export const MAP_DISCOVERY_LIMITS = Object.freeze({
  mobile: 8,
  desktop: 15,
  deepLink: 6,
  qr: 4,
  maxVisibleMobile: 15,
  maxVisibleDesktop: 25,
  cacheEntries: 32,
  cacheTtlMs: 5 * 60 * 1000,
});

export const mapSearchSourceSchema = z.enum([
  "direct-search",
  "intent-console",
  "category",
  "deep-link",
  "qr",
  "campaign",
  "saved",
  "nearby",
  "search-area",
  "route",
]);

export type MapSearchSource = z.infer<typeof mapSearchSourceSchema>;
export type MapDiscoveryStatus = "idle" | "resolving" | "resolved" | "empty" | "error";

export const mapBoundsSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
}).passthrough();

export const mapSearchRequestSchema = z.object({
  query: z.string().optional(),
  intent: z.string().optional(),
  source: mapSearchSourceSchema,
  mode: z.enum(["resident", "partner", "admin"]),
  entity_types: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  district: z.string().optional(),
  radius_meters: z.number().positive().optional(),
  center: z.object({ lat: z.number(), lng: z.number() }).optional(),
  bounds: mapBoundsSchema.optional(),
  selected_entity_id: z.string().optional(),
  partner_id: z.string().optional(),
  campaign_id: z.string().optional(),
  perk_id: z.string().optional(),
  event_id: z.string().optional(),
  route_id: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(MAP_DISCOVERY_LIMITS.maxVisibleDesktop),
});

export type MapSearchRequest = z.infer<typeof mapSearchRequestSchema>;

export const mapPinSchema = z.object({
  id: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  title: z.string().min(1),
  category: z.string().nullable().default(null),
  district: z.string().nullable().default(null),
  status: z.string().default("active"),
  visibility: z.string().default("public"),
  tenant_id: z.string().nullable().default(null),
  workspace_id: z.string().nullable().default(null),
  partner_id: z.string().nullable().default(null),
  property_id: z.string().nullable().default(null),
  building_id: z.string().nullable().default(null),
  campaign_id: z.string().nullable().default(null),
  perk_id: z.string().nullable().default(null),
  event_id: z.string().nullable().default(null),
  analytics_summary: z.record(z.unknown()).nullable().default(null),
  last_updated: z.string().default(""),
  rank: z.number().optional(),
  relevance_score: z.number().optional(),
  reason: z.string().optional(),
  distance_meters: z.number().optional(),
  walking_minutes: z.number().optional(),
  is_primary_result: z.boolean().optional(),
}).passthrough();

export type ResolvedMapPin = z.infer<typeof mapPinSchema>;

export const mapSearchResponseSchema = z.object({
  query_id: z.string().default(""),
  interpreted_intent: z.string().nullable().default(null),
  pins: z.array(mapPinSchema),
  total_available: z.number().int().nonnegative().default(0),
  next_cursor: z.string().nullable().default(null),
  result_context: z.object({
    title: z.string().default("Downtown results"),
    subtitle: z.string().optional(),
    applied_filters: z.array(z.string()).default([]),
  }).default({ title: "Downtown results", applied_filters: [] }),
});

export type MapSearchResponse = z.infer<typeof mapSearchResponseSchema>;

export interface MapDiscoveryState {
  query: string;
  interpretedIntent: string | null;
  source: MapSearchSource | null;
  status: MapDiscoveryStatus;
  pins: ResolvedMapPin[];
  selectedPinId: string | null;
  resultTitle: string | null;
  resultSubtitle: string | null;
  nextCursor: string | null;
  totalAvailable: number;
  lastSearchBounds: z.infer<typeof mapBoundsSchema> | null;
  hasMovedSinceSearch: boolean;
}

export const mapInteractionEventSchema = z.object({
  event_name: z.enum([
    "pin_viewed",
    "pin_selected",
    "drawer_opened",
    "directions_clicked",
    "save_clicked",
    "share_clicked",
    "perk_redeemed",
    "event_rsvp",
    "qr_scanned",
    "nearby_clicked",
    "ai_recommendation_clicked",
  ]),
  pin_id: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  tenant_id: z.string().nullable().optional(),
  workspace_id: z.string().nullable().optional(),
  partner_id: z.string().nullable().optional(),
  property_id: z.string().nullable().optional(),
  building_id: z.string().nullable().optional(),
  campaign_id: z.string().nullable().optional(),
  perk_id: z.string().nullable().optional(),
  event_id: z.string().nullable().optional(),
  query_id: z.string().optional(),
  search_query: z.string().optional(),
  interpreted_intent: z.string().optional(),
  result_rank: z.number().int().nonnegative().optional(),
  source: mapSearchSourceSchema,
  occurred_at: z.string().datetime(),
});

export type MapInteractionEvent = z.infer<typeof mapInteractionEventSchema>;

export function sourceFromTrigger(trigger = "search"): MapSearchSource {
  if (/qr/i.test(trigger)) return "qr";
  if (/campaign/i.test(trigger)) return "campaign";
  if (/saved/i.test(trigger)) return "saved";
  if (/nearby|entity_prompt/i.test(trigger)) return "nearby";
  if (/search_this_area/i.test(trigger)) return "search-area";
  if (/route|collection/i.test(trigger)) return "route";
  if (/entity|deep|url_entity/i.test(trigger)) return "deep-link";
  if (/intent/i.test(trigger)) return "intent-console";
  if (/filter|category|bottom_nav/i.test(trigger)) return "category";
  return "direct-search";
}

export function getDiscoveryLimit({
  viewportWidth,
  source,
  routeStopCount = 0,
}: {
  viewportWidth: number;
  source: MapSearchSource;
  routeStopCount?: number;
}) {
  if (source === "route" && routeStopCount > 0) return Math.min(routeStopCount, MAP_DISCOVERY_LIMITS.maxVisibleDesktop);
  if (source === "deep-link") return MAP_DISCOVERY_LIMITS.deepLink;
  if (source === "qr") return MAP_DISCOVERY_LIMITS.qr;
  return viewportWidth <= 767 ? MAP_DISCOVERY_LIMITS.mobile : MAP_DISCOVERY_LIMITS.desktop;
}

export function isExplicitMapSearch(request: Partial<MapSearchRequest>) {
  return Boolean(
    request.query?.trim() ||
    request.intent?.trim() ||
    request.selected_entity_id?.trim() ||
    request.campaign_id?.trim() ||
    request.perk_id?.trim() ||
    request.event_id?.trim() ||
    request.route_id?.trim() ||
    request.categories?.length ||
    request.entity_types?.length ||
    request.source === "saved" ||
    request.source === "search-area"
  );
}

export function buildMapSearchCacheKey(request: MapSearchRequest) {
  const bounds = request.bounds
    ? Object.fromEntries(Object.entries(request.bounds).map(([key, value]) => [key, Number(Number(value).toFixed(4))]))
    : null;
  return JSON.stringify({
    ...request,
    query: request.query?.trim().toLowerCase() || "",
    intent: request.intent?.trim().toLowerCase() || "",
    bounds,
  });
}

export function reconcileMarkerIds(currentIds: Iterable<string>, nextIds: Iterable<string>) {
  const current = new Set(currentIds);
  const next = new Set(nextIds);
  return {
    keep: [...next].filter((id) => current.has(id)),
    create: [...next].filter((id) => !current.has(id)),
    release: [...current].filter((id) => !next.has(id)),
  };
}

export function backendPinToMapEntity(pin: ResolvedMapPin) {
  return {
    ...pin,
    name: pin.title,
    entityType: pin.entity_type,
    entityId: pin.entity_id,
    latitude: pin.lat,
    longitude: pin.lng,
    district: pin.district || "",
    category: pin.category || "",
    partnerId: pin.partner_id || "",
    workspaceId: pin.workspace_id || "",
    campaignId: pin.campaign_id || "",
    perkId: pin.perk_id || "",
    eventId: pin.event_id || "",
  };
}

function operationsBaseUrl() {
  const env = (import.meta.env || {}) as Record<string, string | undefined>;
  const configured = env.VITE_OPERATIONS_API_BASE_URL || env.VITE_BACKEND_PLATFORM_URL;
  return configured ? String(configured).replace(/\/$/, "") : "";
}

export async function searchOperationalMap(request: MapSearchRequest, signal?: AbortSignal) {
  const baseUrl = operationsBaseUrl();
  if (!baseUrl) return null;
  const parsedRequest = mapSearchRequestSchema.parse(request);
  const response = await fetch(`${baseUrl}/api/map/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedRequest),
    signal,
  });
  if (!response.ok) throw new Error(`Map search failed with ${response.status}`);
  return mapSearchResponseSchema.parse(await response.json());
}
