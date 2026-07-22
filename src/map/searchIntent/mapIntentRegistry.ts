import { mapCollections } from "../../data/mapCollections";
import { brandCampaignExamples, liveCampaignLayerExamples } from "../../data/campaignLayerExamples";

export type MapIntentMode = "resident" | "partner";

export const CANONICAL_PARTNER_INTENT_IDS = [
  "performance",
  "campaigns",
  "audience",
  "opportunity",
  "activation",
  "insights",
  "trails",
  "parking",
  "properties",
  "events",
  "perks",
] as const;

export type PartnerIntentId = (typeof CANONICAL_PARTNER_INTENT_IDS)[number];

const PARTNER_INTENT_ALIASES: Record<string, PartnerIntentId> = {
  campaign_opportunity: "campaigns",
  coverage_gap: "opportunity",
  demand_signal: "audience",
  partner_intelligence: "insights",
  partner_performance: "performance",
  partner_campaigns: "campaigns",
  partner_opportunity: "opportunity",
  partner_coverage: "opportunity",
  partner_properties: "properties",
  partner_events: "events",
  partner_perks: "perks",
};

export type MapIntentType =
  | "category"
  | "subcategory"
  | "perk"
  | "event"
  | "route"
  | "collection"
  | "campaign"
  | "brand"
  | "district"
  | "property"
  | "hotel"
  | "natural-language";

export type EntityType =
  | "restaurant"
  | "cafe"
  | "bar"
  | "hotel"
  | "property"
  | "retail"
  | "wellness"
  | "civic"
  | "mobility"
  | "experience"
  | "service"
  | "venue"
  | "event"
  | "brand"
  | "campaign";

export type MapIntent = {
  id: string;
  label: string;
  intentType: MapIntentType;
  entityTypes?: EntityType[];
  categories?: string[];
  subcategories?: string[];
  districtIds?: string[];
  brandIds?: string[];
  campaignIds?: string[];
  collectionIds?: string[];
  routeIds?: string[];
  perkOnly?: boolean;
  activeNow?: boolean;
  openNow?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerms?: string[];
  allowEmpty?: boolean;
  mode: MapIntentMode;
};

export type TaxonomyProjection = {
  primaryType: string;
  category: string;
  subcategories: string[];
  searchTokens: string[];
  applicableIntents: string[];
};

type AnyEntity = Record<string, any>;

const DISTRICT_ALIASES: Record<string, string> = {
  rainey: "Rainey",
  "rainey street": "Rainey",
  "rainey historic district": "Rainey",
  "rainey street historic district": "Rainey",
  seaholm: "Seaholm",
  "west 6th": "West 6th",
  "west sixth": "West 6th",
  "red river": "Red River",
  congress: "Congress",
  waterloo: "Waterloo",
  downtown: "Downtown Core",
  "downtown core": "Downtown Core",
  "2nd street": "2nd Street",
  warehouse: "Warehouse",
};

const CATEGORY_ALIASES: Record<string, string> = {
  dining: "Restaurant",
  restaurants: "Restaurant",
  restaurant: "Restaurant",
  "restaurant / food": "Restaurant",
  "food hall": "Restaurant",
  "cocktail bar": "Bar",
  bars: "Bar",
  bar: "Bar",
  "coffee shop": "Coffee",
  coffee: "Coffee",
  cafe: "Cafe",
  "café": "Cafe",
  apartments: "Property",
  apartment: "Property",
  residential: "Property",
  "residential property": "Property",
  "mixed use": "Property",
  "mixed-use": "Property",
  hotel: "Hotel",
  hotels: "Hotel",
  civic: "Civic",
  services: "Services",
  service: "Services",
  retail: "Retail",
  shopping: "Retail",
  wellness: "Wellness",
  fitness: "Wellness",
};

export const MAP_INTENT_REGISTRY: MapIntent[] = [
  {
    id: "all",
    label: "All",
    intentType: "category",
    mode: "resident",
    searchTerms: ["all", "everything", "nearby"],
  },
  {
    id: "coffee",
    label: "Coffee",
    intentType: "subcategory",
    mode: "resident",
    entityTypes: ["cafe", "restaurant", "venue"],
    categories: ["Coffee", "Cafe"],
    subcategories: ["Coffee", "Cafe", "Bakery"],
    collectionIds: ["coffee-before-work"],
    searchTerms: ["coffee", "cafe", "espresso", "bakery", "morning coffee"],
  },
  {
    id: "dining",
    label: "Dining",
    intentType: "category",
    mode: "resident",
    entityTypes: ["restaurant", "cafe", "venue", "hotel"],
    categories: ["Restaurant", "Dining", "Food"],
    subcategories: ["Breakfast", "Lunch", "Dinner", "Brunch", "Food Hall"],
    collectionIds: ["inkind-dining-market", "date-night"],
    searchTerms: ["dining", "restaurant", "restaurants", "food", "eat", "dinner", "lunch", "brunch"],
  },
  {
    id: "happy_hour",
    label: "Happy Hour",
    intentType: "perk",
    mode: "resident",
    entityTypes: ["bar", "restaurant", "venue"],
    categories: ["Bar", "Restaurant", "Dining"],
    subcategories: ["Happy Hour", "Cocktails", "Drinks"],
    collectionIds: ["warehouse-district-happy-hour"],
    perkOnly: true,
    activeNow: true,
    searchTerms: ["happy hour", "specials", "cocktails", "drinks after work", "drink specials"],
  },
  {
    id: "events",
    label: "Events",
    intentType: "event",
    mode: "resident",
    entityTypes: ["event", "experience", "venue", "civic"],
    categories: ["Event", "Events", "Entertainment"],
    subcategories: ["Live Music", "Tonight", "Weekend"],
    searchTerms: ["events", "event", "tonight", "weekend", "rsvp", "things to do", "live music", "show"],
  },
  {
    id: "hotels",
    label: "Hotels",
    intentType: "hotel",
    mode: "resident",
    entityTypes: ["hotel"],
    categories: ["Hotel", "Hospitality"],
    collectionIds: ["hotel-guest-arrival-route"],
    searchTerms: ["hotel", "hotels", "stay", "guest", "convention center"],
  },
  {
    id: "properties",
    label: "Properties",
    intentType: "property",
    mode: "resident",
    entityTypes: ["property"],
    categories: ["Property", "Residential", "Real Estate"],
    searchTerms: ["properties", "property", "apartment", "residential", "building", "condo", "leasing", "seaholm"],
  },
  {
    id: "brands",
    label: "Brands",
    intentType: "brand",
    mode: "resident",
    entityTypes: ["brand", "retail", "venue"],
    categories: ["Brand", "Retail"],
    brandIds: ["brand-austin-fc", "brand-yeti", "brand-rivian", "brand-lululemon", "brand-equinox", "partner-fine-eyewear"],
    searchTerms: ["brand", "brands", "activation", "sponsor", "austin fc", "yeti", "rivian", "lululemon"],
  },
  {
    id: "inkind",
    label: "inKind",
    intentType: "brand",
    mode: "resident",
    entityTypes: ["restaurant", "venue"],
    categories: ["Restaurant", "Dining"],
    brandIds: ["inkind"],
    collectionIds: ["inkind-dining-market"],
    searchTerms: ["inkind", "in kind", "inKind restaurants", "dining access"],
  },
  {
    id: "legends",
    label: "Legends",
    intentType: "brand",
    mode: "resident",
    entityTypes: ["property"],
    categories: ["Property", "Real Estate"],
    brandIds: ["legends-real-estate-downtown-austin"],
    campaignIds: ["campaign-legends-real-estate-listing-tour"],
    searchTerms: ["legends", "legends locations", "real estate", "listings", "listing tour"],
  },
  {
    id: "civic",
    label: "Civic",
    intentType: "category",
    mode: "resident",
    entityTypes: ["civic", "experience", "service"],
    categories: ["Civic", "Public", "Attraction"],
    collectionIds: ["daa-art-walk", "waterloo-greenway", "downtown-stories-walk"],
    searchTerms: ["civic", "public art", "parks", "waterloo", "daa", "library", "attractions"],
  },
  {
    id: "services",
    label: "Services",
    intentType: "category",
    mode: "resident",
    entityTypes: ["service", "mobility", "civic"],
    categories: ["Services", "Parking", "Mobility"],
    searchTerms: ["services", "parking", "pharmacy", "printing", "cleaners", "shipping", "bike share", "ev charging"],
  },
  {
    id: "rainey",
    label: "Rainey",
    intentType: "district",
    mode: "resident",
    districtIds: ["Rainey"],
    searchTerms: ["rainey", "rainey street", "rainey walking route"],
  },
  {
    id: "seaholm",
    label: "Seaholm",
    intentType: "district",
    mode: "resident",
    districtIds: ["Seaholm"],
    searchTerms: ["seaholm", "properties near seaholm"],
  },
  {
    id: "west_6th",
    label: "West 6th",
    intentType: "district",
    mode: "resident",
    districtIds: ["West 6th"],
    searchTerms: ["west 6th", "west sixth"],
  },
  {
    id: "red_river",
    label: "Red River",
    intentType: "district",
    mode: "resident",
    districtIds: ["Red River"],
    searchTerms: ["red river"],
  },
  {
    id: "congress",
    label: "Congress",
    intentType: "district",
    mode: "resident",
    districtIds: ["Congress"],
    searchTerms: ["congress"],
  },
  {
    id: "waterloo",
    label: "Waterloo",
    intentType: "district",
    mode: "resident",
    districtIds: ["Waterloo"],
    collectionIds: ["waterloo-greenway"],
    searchTerms: ["waterloo", "waterloo park", "waterloo greenway"],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    intentType: "campaign",
    mode: "partner",
    campaignIds: [...brandCampaignExamples, ...liveCampaignLayerExamples].map((campaign) => campaign.id),
    searchTerms: ["campaign", "campaigns", "active campaigns", "austin fc campaign"],
  },
  {
    id: "performance",
    label: "Performance",
    intentType: "campaign",
    mode: "partner",
    campaignIds: [...brandCampaignExamples, ...liveCampaignLayerExamples].map((campaign) => campaign.id),
    searchTerms: ["performance", "scans", "saves", "opens", "redemptions", "reports"],
  },
  {
    id: "audience",
    label: "Interest",
    intentType: "district",
    mode: "partner",
    allowEmpty: true,
    searchTerms: ["audience", "resident interest", "demand", "nearby interest"],
  },
  {
    id: "opportunity",
    label: "Opportunity",
    intentType: "natural-language",
    mode: "partner",
    allowEmpty: true,
    searchTerms: ["opportunity", "coverage gap", "white space", "promote next"],
  },
  {
    id: "activation",
    label: "Activation",
    intentType: "campaign",
    mode: "partner",
    entityTypes: ["campaign", "event", "brand"],
    searchTerms: ["activation", "sponsorship", "promotion", "launch"],
  },
  {
    id: "insights",
    label: "Insights",
    intentType: "natural-language",
    mode: "partner",
    allowEmpty: true,
    searchTerms: ["insights", "trending", "opportunity", "demand"],
  },
  {
    id: "trails",
    label: "Trails",
    intentType: "route",
    mode: "partner",
    searchTerms: ["trail", "route", "discovery route", "placement"],
  },
  {
    id: "parking",
    label: "Parking",
    intentType: "category",
    mode: "partner",
    entityTypes: ["mobility", "service"],
    categories: ["Parking", "Mobility"],
    searchTerms: ["parking", "garage", "valet", "mobility"],
  },
  {
    id: "properties",
    label: "Properties",
    intentType: "property",
    mode: "partner",
    entityTypes: ["property"],
    categories: ["Property", "Real Estate"],
    searchTerms: ["properties", "buildings", "residential", "leasing"],
  },
  {
    id: "events",
    label: "Events",
    intentType: "event",
    mode: "partner",
    entityTypes: ["event", "experience", "venue"],
    categories: ["Event", "Events"],
    searchTerms: ["events", "event sponsorship", "rsvp"],
  },
  {
    id: "perks",
    label: "Perks",
    intentType: "perk",
    mode: "partner",
    perkOnly: true,
    searchTerms: ["perks", "offers", "resident value"],
  },
  {
    id: "natural_language",
    label: "Natural-language search",
    intentType: "natural-language",
    mode: "resident",
    searchTerms: ["near me", "open now", "tonight", "this weekend", "date night", "dog-friendly"],
  },
];

function getIntentById(id: string, mode: MapIntentMode): MapIntent | undefined {
  const normalizedId = mode === "partner" ? PARTNER_INTENT_ALIASES[id] || id : id;
  return MAP_INTENT_REGISTRY.find((intent) => intent.id === normalizedId && intent.mode === mode)
    || MAP_INTENT_REGISTRY.find((intent) => intent.id === normalizedId && intent.mode === "resident");
}

function asTextParts(entity: AnyEntity): string[] {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  return [
    entity?.entityId,
    entity?.listingId,
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.slug,
    entity?.type,
    entity?.kind,
    entity?.entityType,
    entity?.markerType,
    entity?.detailDrawerType,
    entity?.sourceType,
    entity?.category,
    entity?.subcategory,
    entity?.category_key,
    entity?.district,
    entity?.address,
    entity?.brand,
    entity?.summary,
    entity?.description,
    entity?.offerType,
    entity?.utilityType,
    raw.id,
    raw.title,
    raw.kind,
    raw.category,
    raw.neighborhood,
    raw.visibilityMode,
    raw.utilityType,
    raw.offerType,
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
    ...(Array.isArray(raw.tags) ? raw.tags : []),
    ...(Array.isArray(entity?.searchKeywords) ? entity.searchKeywords : []),
  ].filter(Boolean).map(String);
}

export function entitySearchText(entity: AnyEntity): string {
  return asTextParts(entity).join(" ").toLowerCase();
}

function uniq(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function includesAny(text: string, terms: string[] = []): boolean {
  return terms.some((term) => text.includes(String(term).toLowerCase()));
}

export function entityHasExplicitInKindMembership(entity: AnyEntity): boolean {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  const booleanSignals = [
    entity?.isInKind,
    entity?.is_inkind,
    entity?.inKindEligible,
    entity?.inkindEligible,
    entity?.inkind_eligible,
    raw.isInKind,
    raw.is_inkind,
    raw.inKindEligible,
    raw.inkindEligible,
    raw.inkind_eligible,
  ];
  if (booleanSignals.some((value) => value === true)) return true;

  const membershipSignals = [
    entity?.id,
    entity?.partnerType,
    entity?.partnerNetwork,
    entity?.brand,
    entity?.brandId,
    entity?.partnerBrand,
    entity?.program,
    raw.id,
    raw.partnerType,
    raw.partnerNetwork,
    raw.brand,
    raw.brandId,
    raw.partnerBrand,
    raw.program,
    ...(Array.isArray(entity?.programs) ? entity.programs : []),
    ...(Array.isArray(entity?.partnerPrograms) ? entity.partnerPrograms : []),
    ...(Array.isArray(entity?.partner_programs) ? entity.partner_programs : []),
    ...(Array.isArray(entity?.residentSearchIntents) ? entity.residentSearchIntents : []),
    ...(Array.isArray(raw.programs) ? raw.programs : []),
    ...(Array.isArray(raw.partnerPrograms) ? raw.partnerPrograms : []),
    ...(Array.isArray(raw.partner_programs) ? raw.partner_programs : []),
    ...(Array.isArray(raw.residentSearchIntents) ? raw.residentSearchIntents : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase().replace(/[_-]+/g, " "));

  return membershipSignals.some((value) => /\binkind\b|\bin\s+kind\b/.test(value));
}

function entityType(entity: AnyEntity): string {
  return String(entity?.kind || entity?.type || entity?.entityType || entity?.sourceType || entity?.raw?.kind || "venue").toLowerCase();
}

function entityCategory(entity: AnyEntity): string {
  const raw = String(entity?.category || entity?.raw?.category || entityType(entity) || "").toLowerCase();
  return CATEGORY_ALIASES[raw] || CATEGORY_ALIASES[raw.split("/")[0]?.trim()] || raw.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeDistrict(value: unknown): string {
  const key = String(value || "").trim().toLowerCase();
  return DISTRICT_ALIASES[key] || String(value || "").trim();
}

export function normalizeEntityTaxonomy(entity: AnyEntity): TaxonomyProjection {
  const text = entitySearchText(entity);
  const type = entityType(entity);
  const category = entityCategory(entity);
  const subcategories = uniq([
    String(entity?.subcategory || ""),
    String(entity?.restaurantType || ""),
    ...(Array.isArray(entity?.restaurantType) ? entity.restaurantType : []),
    ...(Array.isArray(entity?.tags) ? entity.tags : []),
  ].flat().map((value) => CATEGORY_ALIASES[String(value).toLowerCase()] || String(value)).filter(Boolean));

  const applicableIntents = MAP_INTENT_REGISTRY
    .filter((intent) => entityMatchesMapIntent(entity, intent, { allowAll: false }))
    .map((intent) => intent.id);

  return {
    primaryType: type,
    category,
    subcategories,
    searchTokens: uniq([...asTextParts(entity).join(" ").toLowerCase().split(/[^a-z0-9]+/), ...subcategories.map((item) => item.toLowerCase())]).filter((token) => token.length > 1),
    applicableIntents: applicableIntents.length ? applicableIntents : ["all"],
  };
}

export function resolveSearchIntent(input: string | Partial<MapIntent>, mode: MapIntentMode = "resident"): MapIntent {
  if (typeof input === "object" && input.id) {
    const fromRegistry = getIntentById(input.id, input.mode || mode);
    return { ...(fromRegistry || input as MapIntent), ...input, mode: input.mode || mode } as MapIntent;
  }

  const query = String(input || "").trim().toLowerCase();
  const directId = query.replace(/[\s-]+/g, "_");
  const direct = getIntentById(directId, mode) || getIntentById(query, mode);
  if (direct) return { ...direct, mode };

  const scoped = MAP_INTENT_REGISTRY.filter((intent) => intent.mode === mode || intent.mode === "resident");
  const matched = scoped.find((intent) => includesAny(query, [intent.label, ...(intent.searchTerms || []), ...(intent.categories || []), ...(intent.subcategories || [])]));
  if (matched) return { ...matched, mode };

  const district = Object.entries(DISTRICT_ALIASES).find(([alias]) => query.includes(alias))?.[1];
  if (district) {
    return {
      id: district.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      label: district,
      intentType: "district",
      districtIds: [district],
      searchTerms: [query],
      mode,
    };
  }

  return {
    ...(getIntentById("natural_language", mode) as MapIntent),
    id: `natural:${query || "empty"}`,
    label: query || "Natural-language search",
    searchTerms: query ? query.split(/\s+/).filter(Boolean) : [],
    mode,
  };
}

function hasCoords(entity: AnyEntity): boolean {
  const lat = Number(entity?.latitude ?? entity?.lat ?? entity?.coords?.[0] ?? entity?.raw?.lat);
  const lng = Number(entity?.longitude ?? entity?.lng ?? entity?.coords?.[1] ?? entity?.raw?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function isActiveEntity(entity: AnyEntity): boolean {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  return entity?.active !== false && raw.active !== false && !/\b(test|demo|placeholder|archived|unpublished)\b/.test(entitySearchText(entity));
}

export function entityMatchesMapIntent(entity: AnyEntity, intentInput: string | Partial<MapIntent>, options: { allowAll?: boolean } = {}): boolean {
  const intent = typeof intentInput === "string" ? resolveSearchIntent(intentInput) : resolveSearchIntent(intentInput);
  const text = entitySearchText(entity);
  const type = entityType(entity);
  const category = entityCategory(entity).toLowerCase();
  const taxonomyText = [type, category, text].join(" ");
  const allowAll = options.allowAll !== false;

  if (allowAll && intent.id === "all") return true;
  if (!isActiveEntity(entity) || !hasCoords(entity)) return false;

  // inKind is a verified program layer, not an alias for the Restaurant
  // category. A place must carry explicit program membership or belong to the
  // curated inKind collection; being a restaurant alone is never sufficient.
  if (intent.id === "inkind") {
    const collectionMatch = Boolean(intent.collectionIds?.some((id) => entityBelongsToCollection(entity, id)));
    return entityHasExplicitInKindMembership(entity) || collectionMatch;
  }

  if (intent.districtIds?.length) {
    const district = normalizeDistrict(entity?.district || entity?.neighborhood || entity?.raw?.neighborhood);
    return intent.districtIds.some((id) => normalizeDistrict(id).toLowerCase() === String(district).toLowerCase());
  }

  if (intent.collectionIds?.length && intent.collectionIds.some((id) => entityBelongsToCollection(entity, id))) return true;
  if (intent.campaignIds?.length && intent.campaignIds.some((id) => entityBelongsToCampaign(entity, id))) return true;
  if (intent.brandIds?.length && intent.brandIds.some((id) => entityBelongsToBrand(entity, id))) return true;
  if (intent.routeIds?.length && intent.routeIds.some((id) => entityBelongsToCollection(entity, id))) return true;

  if (intent.perkOnly) {
    if (!/\b(perk|offer|happy hour|special|resident perk|inkind|in kind)\b/.test(text)) return false;
    if (intent.id === "happy_hour") return /\b(happy hour|cocktail|drink|special|bar|wine|beer)\b/.test(text);
    return true;
  }

  if (intent.entityTypes?.length && intent.entityTypes.includes(type as EntityType)) return true;
  if (intent.categories?.length && includesAny(taxonomyText, intent.categories)) return true;
  if (intent.subcategories?.length && includesAny(taxonomyText, intent.subcategories)) return true;
  if (intent.searchTerms?.length && includesAny(taxonomyText, intent.searchTerms)) return true;

  if (intent.id === "dining") return /\b(restaurant|dining|food|brunch|lunch|dinner|sushi|taco|steak|pizza)\b/.test(taxonomyText) && !/\b(bar only|nightclub)\b/.test(taxonomyText);
  if (intent.id === "coffee") return /\b(coffee|cafe|espresso|bakery)\b/.test(taxonomyText);
  if (intent.id === "events") return /\b(event|rsvp|festival|show|concert|tonight|weekend)\b/.test(taxonomyText);
  if (intent.id === "services") return /\b(service|parking|printing|pharmacy|shipping|cleaning|bike share|ev charging|visitor info|mobility)\b/.test(taxonomyText);
  if (intent.id.startsWith("natural:")) return (intent.searchTerms || []).some((term) => taxonomyText.includes(term));

  return false;
}

export function entityBelongsToCollection(entity: AnyEntity, collectionId: string): boolean {
  const collection = mapCollections.find((item) => item.id === collectionId);
  if (!collection) return false;
  const id = String(entity?.id || entity?.entityId || entity?.raw?.id || "");
  const text = entitySearchText(entity);
  return collection.stopIds?.includes(id) || collection.stopHints?.some((hint) => text.includes(String(hint).toLowerCase())) || false;
}

function entityBelongsToBrand(entity: AnyEntity, brandId: string): boolean {
  const normalizedBrand = brandId.replace(/^brand-/, "").replace(/^partner-/, "").replace(/-/g, " ").toLowerCase();
  const text = entitySearchText(entity);
  return text.includes(normalizedBrand) || text.includes(brandId.toLowerCase());
}

function entityBelongsToCampaign(entity: AnyEntity, campaignId: string): boolean {
  const campaign = [...brandCampaignExamples, ...liveCampaignLayerExamples].find((item) => item.id === campaignId);
  if (!campaign) return false;
  const text = entitySearchText(entity);
  return [
    campaign.id,
    campaign.brandId,
    campaign.brandName,
    campaign.campaignName,
    campaign.area,
    campaign.intent,
    campaign.layerType,
  ].filter(Boolean).some((value) => text.includes(String(value).toLowerCase().replace(/^brand-/, "").replace(/-/g, " ")));
}

export function queryEntitiesForIntent(entities: AnyEntity[], intentInput: string | Partial<MapIntent>, mode: MapIntentMode = "resident"): AnyEntity[] {
  const intent = resolveSearchIntent(intentInput, mode);
  const matches = entities.filter((entity) => entityMatchesMapIntent(entity, intent));
  const deduped = new Map<string, AnyEntity>();
  for (const entity of matches) {
    const key = String(entity?.id || entity?.entityId || `${entity?.latitude || entity?.lat},${entity?.longitude || entity?.lng}`);
    if (!deduped.has(key)) deduped.set(key, entity);
  }
  return [...deduped.values()].sort((a, b) => rankIntentResult(a, intent) - rankIntentResult(b, intent) || String(a?.name || a?.title).localeCompare(String(b?.name || b?.title)));
}

export function rankIntentResult(entity: AnyEntity, intent: MapIntent): number {
  const text = entitySearchText(entity);
  let score = 100;
  if (intent.searchTerms?.some((term) => text.includes(term.toLowerCase()))) score -= 35;
  if (intent.perkOnly && /\b(perk|offer|happy hour|special)\b/.test(text)) score -= 25;
  if (/\bevent|rsvp\b/.test(text) && intent.intentType === "event") score -= 20;
  if (intent.campaignIds?.some((id) => entityBelongsToCampaign(entity, id))) score -= 15;
  if (intent.collectionIds?.some((id) => entityBelongsToCollection(entity, id))) score -= 12;
  if (intent.brandIds?.some((id) => entityBelongsToBrand(entity, id))) score -= 10;
  if (/\bsponsored|featured\b/.test(text)) score -= 4;
  return score;
}

export function resolveIntentRelationships(intentInput: string | Partial<MapIntent>, entities: AnyEntity[], mode: MapIntentMode = "resident") {
  const intent = resolveSearchIntent(intentInput, mode);
  const pins = queryEntitiesForIntent(entities, intent, mode);
  const routeLayers = mapCollections
    .filter((collection) => intent.collectionIds?.includes(collection.id) || intent.routeIds?.includes(collection.id))
    .map((collection) => ({
      routeId: collection.id,
      title: collection.title,
      orderedStopIds: collection.stopIds || [],
      matchedStopIds: (collection.stopIds || []).filter((id) => pins.some((pin) => String(pin.id) === String(id))),
      estimatedDistance: collection.distanceLabel || "",
      estimatedDuration: collection.estimatedTime || "",
    }));
  const campaigns = [...brandCampaignExamples, ...liveCampaignLayerExamples].filter((campaign) => {
    const status = String(campaign.status || "").toLowerCase();
    const isActive = ["live", "ready", "active"].includes(status);
    return isActive && (intent.campaignIds?.includes(campaign.id) || includesAny([campaign.campaignName, campaign.brandName, campaign.intent, campaign.area].filter(Boolean).join(" ").toLowerCase(), intent.searchTerms || []));
  });
  const brands = uniq([
    ...(intent.brandIds || []),
    ...campaigns.map((campaign) => campaign.brandId || campaign.brandName || "").filter(Boolean),
  ]);

  return {
    pins,
    routeLayers,
    collections: mapCollections.filter((collection) => intent.collectionIds?.includes(collection.id)),
    campaigns,
    brands,
    primaryResult: pins[0] || null,
    bounds: buildBounds(pins),
    resultCount: pins.length,
  };
}

function buildBounds(entities: AnyEntity[]) {
  const coords = entities
    .map((entity) => ({
      lat: Number(entity?.latitude ?? entity?.lat ?? entity?.coords?.[0]),
      lng: Number(entity?.longitude ?? entity?.lng ?? entity?.coords?.[1]),
    }))
    .filter((coord) => Number.isFinite(coord.lat) && Number.isFinite(coord.lng));
  if (!coords.length) return null;
  return {
    north: Math.max(...coords.map((coord) => coord.lat)),
    south: Math.min(...coords.map((coord) => coord.lat)),
    east: Math.max(...coords.map((coord) => coord.lng)),
    west: Math.min(...coords.map((coord) => coord.lng)),
  };
}

export function clearPreviousMapIntent() {
  return {
    filteredPins: [],
    selectedPinId: "",
    routeLayers: [],
    districtBoundary: null,
    collectionBadges: [],
    campaignBadges: [],
    brandLogos: [],
    clusters: [],
    drawerContext: null,
  };
}

export function applyMapIntent(entities: AnyEntity[], intentInput: string | Partial<MapIntent>, mode: MapIntentMode = "resident") {
  const intent = resolveSearchIntent(intentInput, mode);
  const cleared = clearPreviousMapIntent();
  const relationships = resolveIntentRelationships(intent, entities, mode);
  return {
    ...cleared,
    intent,
    ...relationships,
    urlState: {
      mode,
      tab: "map",
      filter: intent.label,
      intent: intent.id,
      routeId: intent.routeIds?.[0] || "",
      collectionId: intent.collectionIds?.[0] || "",
      campaignId: intent.campaignIds?.[0] || "",
      brandId: intent.brandIds?.[0] || "",
      district: intent.districtIds?.[0] || "",
      query: mode === "partner" ? "" : intent.searchTerms?.[0] || "",
    },
  };
}
