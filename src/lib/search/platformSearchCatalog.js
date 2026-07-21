const PRIVATE_FIELD_PATTERN = /\b(email|phone|mobile|unit|crm|lead|pipeline|private|internal|billing|payment|auth|role|permission|token|session|notes?)\b/i;

const PUBLIC_PROFILE_RECORDS = Object.freeze([
  {
    id: "public-profile-nina-seely",
    entityId: "301-west-ave-4105-legends-property-301-west-ave-4105-austin-tx-us-78701-3710500",
    resultType: "person",
    title: "Nina Seely",
    subtitle: "Legends Real Estate · Austin real estate",
    keywords: ["Nina Seely Austin", "Legends Real Estate", "real estate agent"],
  },
  {
    id: "public-profile-frank-seely",
    entityId: "301-west-ave-4105-legends-property-301-west-ave-4105-austin-tx-us-78701-3710500",
    resultType: "person",
    title: "Frank Seely",
    subtitle: "Legends Real Estate · Austin real estate",
    keywords: ["Frank Seely Austin", "Frank Seeley", "Legends Real Estate", "real estate agent"],
  },
  {
    id: "organization-legends-real-estate",
    entityId: "301-west-ave-4105-legends-property-301-west-ave-4105-austin-tx-us-78701-3710500",
    resultType: "organization",
    title: "Legends Real Estate",
    subtitle: "Real estate partner · Downtown Austin",
    keywords: ["Legends Realty", "Legends listings", "Luxury Presence"],
  },
]);

const PARTNER_WORKSPACE_RECORDS = Object.freeze([
  {
    id: "workspace-tool-publish",
    resultType: "tool",
    title: "Publish",
    subtitle: "Offers, events, campaigns, broadcasts, and surveys",
    route: "/partner-workspace/publish",
    keywords: ["create offer", "create event", "create campaign", "workspace tool"],
    modes: ["partner"],
  },
  {
    id: "workspace-tool-performance",
    resultType: "tool",
    title: "Performance",
    subtitle: "Analytics, audience activity, and results",
    route: "/partner-workspace/performance",
    keywords: ["analytics", "performance", "audience", "workspace tool"],
    modes: ["partner"],
  },
  {
    id: "report-legends-seo-snapshot",
    resultType: "report",
    title: "SEO Snapshot",
    subtitle: "Legends search demand and next actions",
    route: "/partner-workspace/reports",
    keywords: ["Legends report", "search report", "Luxury Presence reporting dashboard"],
    modes: ["partner"],
  },
]);

export const PLATFORM_SEARCH_LIMITS = Object.freeze({
  mobile: 24,
  desktop: 40,
});

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function validCoordinates(entity = {}) {
  const lat = Number(entity.lat ?? entity.latitude ?? entity.coords?.[0]);
  const lng = Number(entity.lng ?? entity.longitude ?? entity.coords?.[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function resultTypeForEntity(entity = {}) {
  const declaredType = normalizeText([
    entity.entity_type,
    entity.entityType,
    entity.sourceType,
    entity.type,
    entity.kind,
    entity.detailDrawerType,
  ].filter(Boolean).join(" "));
  const text = normalizeText([
    entity.id,
    entity.name,
    entity.title,
    entity.entity_type,
    entity.entityType,
    entity.sourceType,
    entity.type,
    entity.kind,
    entity.category,
    entity.detailDrawerType,
  ].filter(Boolean).join(" "));
  if (/\b(person|agent|member|author)\b/.test(declaredType)) return "person";
  if (/\b(organization|partner|brand|sponsor)\b/.test(declaredType)) return "organization";
  if (/\b(listing|rental|unit)\b/.test(text)) return "listing";
  if (/\b(event|concert|festival|show)\b/.test(text)) return "event";
  if (entity.operatorPortfolioId && entity.hasPerk === false) return "place";
  if (/\b(perk|offer|happy hour)\b/.test(text)) return "perk";
  if (/\b(campaign|activation|passport|challenge)\b/.test(text)) return "campaign";
  if (/\b(route|collection|guide|tour|trail|walk)\b/.test(text)) return "route";
  if (/\b(service|parking|legal|insurance|bank|mobility)\b/.test(text)) return "service";
  if (/\b(building|property|residential|hotel)\b/.test(text)) return "place";
  return "place";
}

function safeKeywordValues(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const values = [
    entity.id,
    entity.entity_id,
    entity.slug,
    entity.name,
    entity.title,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.type,
    entity.kind,
    entity.entity_type,
    entity.sourceType,
    entity.district,
    entity.neighborhood,
    entity.address,
    entity.brand,
    entity.summary,
    entity.description,
    ...(Array.isArray(entity.tags) ? entity.tags : []),
    ...(Array.isArray(entity.searchKeywords) ? entity.searchKeywords : []),
    ...(Array.isArray(raw.searchKeywords) ? raw.searchKeywords : []),
    raw.legendsListing?.mls,
    raw.legendsListing?.mls_number,
    entity.legendsListing?.mls,
    entity.legendsListing?.mls_number,
  ];
  return values.filter((value) => value !== undefined && value !== null && !PRIVATE_FIELD_PATTERN.test(String(value)));
}

export function toPlatformSearchDocument(entity = {}) {
  const id = String(entity.id || entity.entity_id || "");
  const title = String(entity.name || entity.title || id).trim();
  const resultType = resultTypeForEntity(entity);
  const markerEligible = !["person", "organization", "report", "tool"].includes(resultType) && validCoordinates(entity);
  const subtitle = [
    entity.category || entity.type || resultType,
    entity.district || entity.neighborhood,
  ].filter(Boolean).join(" · ");
  const keywords = safeKeywordValues(entity);
  return {
    id,
    entityId: String(entity.entity_id || id),
    linkedEntityId: String(entity.linked_entity_id || entity.linkedEntityId || ""),
    resultType,
    title,
    subtitle,
    markerEligible,
    searchText: normalizeText(keywords.join(" ")),
  };
}

function toPublicProfileDocument(record) {
  return {
    id: record.id,
    entityId: record.entityId,
    linkedEntityId: record.entityId,
    resultType: record.resultType,
    title: record.title,
    subtitle: record.subtitle,
    markerEligible: false,
    route: record.route || "",
    modes: record.modes || ["resident", "partner"],
    searchText: normalizeText([record.title, record.subtitle, ...record.keywords].join(" ")),
  };
}

export function buildPlatformSearchCatalog(entities = [], { includePublicProfiles = true } = {}) {
  const documents = entities.map(toPlatformSearchDocument).filter((document) => document.id && document.title);
  if (includePublicProfiles) documents.push(...PUBLIC_PROFILE_RECORDS.map(toPublicProfileDocument));
  documents.push(...PARTNER_WORKSPACE_RECORDS.map(toPublicProfileDocument));
  const deduped = new Map();
  for (const document of documents) {
    const key = `${document.resultType}:${normalizeText(document.title)}:${document.entityId}`;
    if (!deduped.has(key)) deduped.set(key, document);
  }
  return [...deduped.values()];
}

function scoreDocument(document, normalizedQuery, tokens) {
  const title = normalizeText(document.title);
  if (title === normalizedQuery) return 0;
  if (title.startsWith(normalizedQuery)) return 10;
  if (document.searchText.includes(normalizedQuery)) return 20;
  const matchedTokens = tokens.filter((token) => document.searchText.includes(token)).length;
  return 100 - matchedTokens * 10 + (document.markerEligible ? 0 : 2);
}

const NATURAL_LANGUAGE_SEARCH_WORDS = new Set([
  "a", "about", "around", "at", "best", "close", "for", "in", "me", "near", "nearby",
  "now", "of", "show", "the", "this", "to", "today", "tonight", "walk", "walkable", "within",
  "what", "whats", "where",
]);

const SEARCH_INTENT_ALIASES = Object.freeze({
  breakfast: ["breakfast", "brunch", "coffee", "morning"],
  brunch: ["brunch", "breakfast", "dining", "restaurant"],
  coffee: ["coffee", "cafe", "espresso"],
  dinner: ["dinner", "dining", "restaurant", "food", "supper"],
  dining: ["dining", "dinner", "restaurant", "food"],
  drinks: ["drinks", "cocktail", "bar", "happy hour", "nightlife"],
  events: ["event", "events", "concert", "festival", "music", "show"],
  happening: ["event", "events", "concert", "festival", "music", "show"],
  music: ["music", "concert", "performance", "show"],
  perks: ["perk", "perks", "offer", "benefit", "discount"],
  rooftop: ["rooftop", "terrace", "skyline"],
});

function getQuerySignalGroups(normalizedQuery) {
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const significantTokens = tokens.filter((token) => !NATURAL_LANGUAGE_SEARCH_WORDS.has(token));
  const sourceTokens = significantTokens.length ? significantTokens : tokens;
  return sourceTokens.map((token) => SEARCH_INTENT_ALIASES[token] || [token]);
}

export function searchPlatformCatalog(catalog = [], query = "", options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const signalGroups = getQuerySignalGroups(normalizedQuery);
  const scoringTokens = signalGroups.flat();
  const limit = Math.max(1, Math.min(PLATFORM_SEARCH_LIMITS.desktop, Number(options.limit || PLATFORM_SEARCH_LIMITS.mobile)));
  return catalog
    .filter((document) => !document.modes?.length || document.modes.includes(options.mode || "resident"))
    .filter((document) => (
      document.searchText.includes(normalizedQuery) ||
      tokens.every((token) => document.searchText.includes(token)) ||
      signalGroups.every((aliases) => aliases.some((alias) => document.searchText.includes(alias)))
    ))
    .sort((a, b) => scoreDocument(a, normalizedQuery, scoringTokens) - scoreDocument(b, normalizedQuery, scoringTokens) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function groupPlatformSearchResults(results = []) {
  const order = ["person", "organization", "listing", "place", "event", "perk", "campaign", "route", "service", "report", "tool"];
  const labels = {
    person: "People",
    organization: "Organizations",
    listing: "Listings",
    place: "Places",
    event: "Events",
    perk: "Perks",
    campaign: "Campaigns",
    route: "Routes and guides",
    service: "Services",
    report: "Reports",
    tool: "Workspace tools",
  };
  return order
    .map((type) => ({ type, label: labels[type], results: results.filter((result) => result.resultType === type) }))
    .filter((group) => group.results.length);
}
