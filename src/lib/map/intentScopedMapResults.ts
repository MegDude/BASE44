export type MapIntent =
  | "discovery"
  | "lunch"
  | "happy_hour"
  | "drinks"
  | "coffee"
  | "dinner"
  | "fitness"
  | "wellness"
  | "events"
  | "walking_route"
  | "property"
  | "partner"
  | "campaign";

export type MapQuery = {
  audience: "resident" | "partner";
  intent: MapIntent;
  query?: string;
  routeId?: string;
  filters: {
    district?: string[];
    radius?: number;
    categories?: string[];
  };
  scope?: {
    organizationId?: string;
    portfolioId?: string;
    listingId?: string;
  };
};

export type MapResultState<Entity = unknown, Route = unknown> = {
  status: "idle" | "loading" | "ready" | "error";
  query: MapQuery;
  entities: Entity[];
  route?: Route | null;
  summary: {
    count: number;
    label: string;
  };
};

const INTENT_BY_FILTER: Record<string, MapIntent> = {
  all: "discovery",
  nearby: "discovery",
  lunch: "lunch",
  "happy hour": "happy_hour",
  "happy hours": "happy_hour",
  drinks: "drinks",
  cocktails: "drinks",
  coffee: "coffee",
  dinner: "dinner",
  fitness: "fitness",
  wellness: "wellness",
  events: "events",
  route: "walking_route",
  routes: "walking_route",
  walking: "walking_route",
  properties: "property",
  property: "property",
  buildings: "property",
  hotels: "property",
  partner: "partner",
  partners: "partner",
  campaigns: "campaign",
  campaign: "campaign",
  "brand activations": "campaign",
};

const LABEL_BY_INTENT: Record<MapIntent, string> = {
  discovery: "Downtown discovery",
  lunch: "Lunch nearby",
  happy_hour: "Happy hour nearby",
  drinks: "Drinks nearby",
  coffee: "Coffee nearby",
  dinner: "Dinner nearby",
  fitness: "Fitness nearby",
  wellness: "Wellness nearby",
  events: "Events nearby",
  walking_route: "Walking route",
  property: "Properties nearby",
  partner: "Partner results",
  campaign: "Campaign results",
};

function clean(value: unknown) {
  return String(value || "").trim();
}

export function normalizeMapIntent(value?: unknown, filter?: unknown): MapIntent {
  const explicit = clean(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (explicit === "eat_drink" || explicit === "all" || explicit === "nearby") return "discovery";
  if (explicit === "nightlife") return "drinks";
  if (explicit === "buildings" || explicit === "hotels" || explicit === "listings") return "property";
  if (explicit === "campaigns" || explicit === "brands") return "campaign";
  if (explicit === "resident_perks") return "happy_hour";
  if (Object.values(INTENT_BY_FILTER).includes(explicit as MapIntent)) return explicit as MapIntent;

  const normalizedFilter = clean(filter).toLowerCase();
  return INTENT_BY_FILTER[normalizedFilter] || "discovery";
}

export function buildMapQueryFromScope(scope: Record<string, any> = {}): MapQuery {
  const intent = normalizeMapIntent(scope.intent, scope.filter);
  const district = clean(scope.district);
  const radius = Number(scope.radius || scope.radiusMeters || 0);
  const categories = Array.isArray(scope.categories)
    ? scope.categories.map(clean).filter(Boolean)
    : clean(scope.filter) && !["All", "Nearby"].includes(clean(scope.filter))
      ? [clean(scope.filter)]
      : [];

  return {
    audience: scope.audienceMode === "partner" ? "partner" : "resident",
    intent,
    query: clean(scope.query) || undefined,
    routeId: clean(scope.routeId) || undefined,
    filters: {
      district: district && district !== "All Downtown" ? [district] : undefined,
      radius: Number.isFinite(radius) && radius > 0 ? radius : undefined,
      categories: categories.length ? categories : undefined,
    },
    scope: {
      organizationId: clean(scope.organizationId) || undefined,
      portfolioId: clean(scope.portfolioId) || undefined,
      listingId: clean(scope.listingId) || undefined,
    },
  };
}

export function getMapResultLabel(query: MapQuery) {
  if (query.query) return query.query;
  return LABEL_BY_INTENT[query.intent] || LABEL_BY_INTENT.discovery;
}

export function createIdleMapResultState(query: MapQuery = buildMapQueryFromScope()): MapResultState {
  return { status: "idle", query, entities: [], route: null, summary: { count: 0, label: "" } };
}

export function createLoadingMapResultState(query: MapQuery): MapResultState {
  return { status: "loading", query, entities: [], route: null, summary: { count: 0, label: "" } };
}

export function createReadyMapResultState<Entity>(query: MapQuery, entities: Entity[], route: unknown = null): MapResultState<Entity> {
  return {
    status: "ready",
    query,
    entities,
    route,
    summary: {
      count: entities.length,
      label: getMapResultLabel(query),
    },
  };
}

export function createErrorMapResultState(query: MapQuery): MapResultState {
  return { status: "error", query, entities: [], route: null, summary: { count: 0, label: getMapResultLabel(query) } };
}

export function mapResultContainsEntity(resultState: MapResultState, entityId: string) {
  const id = clean(entityId);
  if (!id) return false;
  return resultState.entities.some((entity: any) => (
    [entity?.id, entity?.entity_id, entity?.entityId].filter(Boolean).map(String).includes(id)
  ));
}
