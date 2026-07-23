import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function replaceExact(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Missing exact patch target: ${label}`);
  const second = source.indexOf(from, first + from.length);
  if (second >= 0) throw new Error(`Patch target is not unique: ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

function replaceRegex(source, pattern, to, label) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const matches = [...source.matchAll(new RegExp(pattern.source, flags))];
  if (matches.length !== 1) {
    throw new Error(`Expected one regex patch target for ${label}; found ${matches.length}`);
  }
  return source.replace(pattern, to);
}

const updates = [];

{
  const file = "src/pages/Map.jsx";
  let source = read(file);

  source = replaceExact(
    source,
    'import { parseSearchIntent, searchIntentToFilter } from "@/map/searchIntent/searchIntentParser";',
    'import { entityHasExplicitInKindMembership } from "@/map/searchIntent/mapIntentRegistry";\nimport { parseSearchIntent, searchIntentToFilter } from "@/map/searchIntent/searchIntentParser";',
    "Map.jsx shared inKind membership import",
  );

  source = replaceRegex(
    source,
    /function isInKindEntity\(place\) \{\n[\s\S]*?\n\}\n\nfunction isInKindNetworkEntity\(place\) \{/,
    `function isInKindEntity(place) {
  if (!place) return false;
  if (entityHasExplicitInKindMembership(place)) return true;
  const id = String(place?.id || place?.entityId || place?.raw?.id || "");
  const curatedCollection = getMapCollectionById("inkind-dining-market");
  return Boolean(curatedCollection?.stopIds?.includes(id));
}

function isInKindNetworkEntity(place) {`,
    "Map.jsx strict inKind entity helper",
  );

  source = replaceExact(
    source,
    '  if (key === "inkind-dining-market") return isInKindEntity(place) || /\\binkind|restaurant|dining\\b/i.test(text);',
    '  if (key === "inkind-dining-market") return isInKindEntity(place);',
    "Map.jsx inKind collection match",
  );

  source = replaceExact(
    source,
    '  if (activeFilter === "inKind") return isInKindEntity(place) || (isCampaignEntity(place) && /\\b(inkind|dining|restaurant|passport|date night|brunch|happy hour)\\b/i.test(placeText(place)));',
    '  if (activeFilter === "inKind") return isInKindEntity(place);',
    "Map.jsx strict inKind filter",
  );

  updates.push([file, source]);
}

{
  const file = "src/data/downtownCoreRestaurantPerks.js";
  let source = read(file);

  source = replaceExact(
    source,
    '    partnerType: "inkind",\n    partnerNetwork: "inkind",',
    '    partnerType: "venues",\n    isInKind: false,',
    "downtown-core default partner identity",
  );

  source = replaceExact(
    source,
    '    pinKey: record.category === "Drinks" ? "cocktail" : "dining",',
    '    pinKey: "dining",',
    "downtown-core canonical restaurant pin",
  );

  source = replaceExact(
    source,
    '      record.neighborhood,\n      record.perkLabel,\n      record.perkTitle,',
    '      record.neighborhood,\n      record.perkTitle,',
    "downtown-core remove perk labels from taxonomy tags",
  );

  source = replaceExact(
    source,
    '    applicableIntents: ["dining", "perks", "inkind", "date-night", "hotel-dining", "resident-benefits"],',
    '    applicableIntents: ["dining", "perks", "date-night", "hotel-dining", "resident-benefits"],',
    "downtown-core remove unverified inKind intent",
  );

  updates.push([file, source]);
}

{
  const file = "src/map/searchIntent/mapIntentRegistry.ts";
  let source = read(file);

  source = replaceExact(
    source,
    `  {
    id: "inkind",
    label: "inKind",
    intentType: "brand",
    mode: "resident",
    entityTypes: ["restaurant", "venue"],
    categories: ["Restaurant", "Dining"],
    brandIds: ["inkind"],
    collectionIds: ["inkind-dining-market"],
    searchTerms: ["inkind", "in kind", "inKind restaurants", "dining access"],
  },`,
    `  {
    id: "inkind",
    label: "inKind",
    intentType: "brand",
    mode: "resident",
    brandIds: ["inkind"],
    collectionIds: ["inkind-dining-market"],
    searchTerms: ["inkind", "in kind", "inkind restaurants"],
  },`,
    "narrow inKind intent definition",
  );

  source = replaceRegex(
    source,
    /export function entityHasExplicitInKindMembership\(entity: AnyEntity\): boolean \{\n[\s\S]*?\n\}\n\nfunction entityType\(entity: AnyEntity\): string \{/,
    `export function entityHasExplicitInKindMembership(entity: AnyEntity): boolean {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  const booleanSignals = [
    entity?.isInKind,
    entity?.is_inkind,
    entity?.inKindEligible,
    entity?.inkindEligible,
    entity?.inkind_eligible,
    entity?.inKindVerified,
    entity?.inkindVerified,
    raw.isInKind,
    raw.is_inkind,
    raw.inKindEligible,
    raw.inkindEligible,
    raw.inkind_eligible,
    raw.inKindVerified,
    raw.inkindVerified,
  ];
  if (booleanSignals.some((value) => value === true)) return true;

  const verificationSignals = [
    entity?.inKindVerificationStatus,
    entity?.inkindVerificationStatus,
    entity?.programVerificationStatus,
    raw.inKindVerificationStatus,
    raw.inkindVerificationStatus,
    raw.programVerificationStatus,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  if (verificationSignals.includes("verified")) return true;

  const membershipSignals = [
    entity?.partnerType,
    entity?.partnerNetwork,
    entity?.brand,
    entity?.brandId,
    entity?.partnerBrand,
    entity?.program,
    raw.partnerType,
    raw.partnerNetwork,
    raw.brand,
    raw.brandId,
    raw.partnerBrand,
    raw.program,
    ...(Array.isArray(entity?.programs) ? entity.programs : []),
    ...(Array.isArray(entity?.partnerPrograms) ? entity.partnerPrograms : []),
    ...(Array.isArray(entity?.partner_programs) ? entity.partner_programs : []),
    ...(Array.isArray(entity?.verifiedPrograms) ? entity.verifiedPrograms : []),
    ...(Array.isArray(raw.programs) ? raw.programs : []),
    ...(Array.isArray(raw.partnerPrograms) ? raw.partnerPrograms : []),
    ...(Array.isArray(raw.partner_programs) ? raw.partner_programs : []),
    ...(Array.isArray(raw.verifiedPrograms) ? raw.verifiedPrograms : []),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase().replace(/[_-]+/g, " "));

  return membershipSignals.some((value) => /\binkind\b|\bin\s+kind\b/.test(value));
}

function entityType(entity: AnyEntity): string {`,
    "explicit inKind membership contract",
  );

  source = replaceExact(
    source,
    `  const direct = getIntentById(directId, mode) || getIntentById(query, mode);
  if (direct) return { ...direct, mode };

  const scoped = MAP_INTENT_REGISTRY.filter((intent) => intent.mode === mode || intent.mode === "resident");`,
    `  const direct = getIntentById(directId, mode) || getIntentById(query, mode);
  if (direct) return { ...direct, mode };

  if (/\binkind\b|\bin\s+kind\b/.test(query)) {
    const inKindIntent = getIntentById("inkind", mode);
    if (inKindIntent) return { ...inKindIntent, mode };
  }

  const scoped = MAP_INTENT_REGISTRY.filter((intent) => intent.mode === mode || intent.mode === "resident");`,
    "inKind free-text precedence",
  );

  source = replaceExact(
    source,
    `  const id = String(entity?.id || entity?.entityId || entity?.raw?.id || "");
  const text = entitySearchText(entity);
  return collection.stopIds?.includes(id) || collection.stopHints?.some((hint) => text.includes(String(hint).toLowerCase())) || false;`,
    `  const id = String(entity?.id || entity?.entityId || entity?.raw?.id || "");
  if (collectionId === "inkind-dining-market") {
    return collection.stopIds?.includes(id) || false;
  }
  const text = entitySearchText(entity);
  return collection.stopIds?.includes(id) || collection.stopHints?.some((hint) => text.includes(String(hint).toLowerCase())) || false;`,
    "exact inKind collection membership",
  );

  updates.push([file, source]);
}

{
  const file = "src/lib/map/intentGovernance.js";
  let source = read(file);

  source = replaceExact(
    source,
    'const DEFAULT_CENTER = { lat: 30.25855, lng: -97.73835 };',
    'import { entityMatchesMapIntent } from "../../map/searchIntent/mapIntentRegistry";\nimport { resolveEntityPin } from "./entityPinResolver";\n\nconst DEFAULT_CENTER = { lat: 30.25855, lng: -97.73835 };',
    "intent governance canonical imports",
  );

  source = replaceExact(
    source,
    `  resident_perks: {
    id: "resident_perks",
    label: "Resident Perks",
    aliases: ["perks", "perk", "offer", "offers", "redeem", "use perk", "resident perk", "inkind", "in kind"],
    iconKey: "offer",
    cap: 36,
  },
  hotels: {`,
    `  resident_perks: {
    id: "resident_perks",
    label: "Resident Perks",
    aliases: ["perks", "perk", "offer", "offers", "redeem", "use perk", "resident perk"],
    iconKey: "offer",
    cap: 36,
  },
  inkind: {
    id: "inkind",
    label: "inKind",
    aliases: ["inkind", "in kind", "inkind restaurants"],
    iconKey: "dining",
    cap: 24,
  },
  hotels: {`,
    "dedicated inKind marker intent",
  );

  source = replaceExact(
    source,
    '  inKind: "resident_perks",',
    '  inKind: "inkind",',
    "inKind filter mapping",
  );

  source = replaceExact(
    source,
    `  const ids = Object.values(CANONICAL_SEARCH_INTENTS)
    .filter((intent) => intent.aliases.some((alias) => text.includes(alias)))
    .map((intent) => intent.id);

  if (hasActivePerk(entity)) ids.push("resident_perks");`,
    `  const ids = Object.values(CANONICAL_SEARCH_INTENTS)
    .filter((intent) => intent.id !== "inkind" && intent.aliases.some((alias) => text.includes(alias)))
    .map((intent) => intent.id);

  if (entityMatchesMapIntent(entity, "inkind")) ids.push("inkind");
  if (hasActivePerk(entity)) ids.push("resident_perks");`,
    "strict inKind governance intent",
  );

  source = replaceExact(
    source,
    `export function getCanonicalIntentForFilter(filter = "All", query = "") {
  const mapped = FILTER_INTENT_MAP[filter] || "";
  if (mapped) return mapped;
  const normalizedQuery = String(query || "").toLowerCase();
  const matched = Object.values(CANONICAL_SEARCH_INTENTS).find((intent) => intent.aliases.some((alias) => normalizedQuery.includes(alias)));
  return matched?.id || "eat_drink";
}`,
    `export function getCanonicalIntentForFilter(filter = "All", query = "") {
  const normalizedQuery = String(query || "").toLowerCase();
  if (/\binkind\b|\bin\s+kind\b/.test(normalizedQuery)) return "inkind";
  const mapped = FILTER_INTENT_MAP[filter] || "";
  if (mapped) return mapped;
  const matched = Object.values(CANONICAL_SEARCH_INTENTS).find((intent) => intent.aliases.some((alias) => normalizedQuery.includes(alias)));
  return matched?.id || "eat_drink";
}`,
    "program query precedence in marker governance",
  );

  source = replaceExact(
    source,
    `export function getMarkerProjection(entity = {}) {
  const governance = getEntityGovernance(entity);
  return {
    id: String(entity.id || entity.raw?.id || ""),
    lat: governance.lat,
    lng: governance.lng,
    label: String(entity.name || entity.title || entity.raw?.title || ""),
    entityType: governance.targetType,
    primaryIntentId: governance.searchIntentIds[0] || "eat_drink",
    iconKey: CANONICAL_SEARCH_INTENTS[governance.searchIntentIds[0]]?.iconKey || entity.pinKey || "guide",
    priorityTier: governance.priorityTier,
    hasActivePerk: governance.hasActivePerk,
    hasActiveCampaign: governance.hasActiveCampaign,
  };
}`,
    `function getCanonicalMarkerIconKey(entity = {}) {
  const label = String(resolveEntityPin(entity)?.label || "").trim().toLowerCase();
  const aliases = {
    restaurant: "dining",
    venue: "dining",
    dining: "dining",
    drinks: "nightlife",
    bar: "nightlife",
    cocktail: "nightlife",
    "happy hour": "happy-hour",
    "ev charging": "ev",
    "arts & culture": "culture",
    reports: "analytics",
    perk: "offer",
    "discovery trail": "discovery",
    "local guide": "guide",
    "fine eyewear": "fine-eyewear",
    "waterloo greenway": "waterloo-greenway",
    "the stay put": "stay-put",
    "topo chico": "topo-chico",
    "four seasons": "four-seasons",
    downtown: "default",
  };
  return aliases[label] || label.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "guide";
}

export function getMarkerProjection(entity = {}) {
  const governance = getEntityGovernance(entity);
  return {
    id: String(entity.id || entity.raw?.id || ""),
    lat: governance.lat,
    lng: governance.lng,
    label: String(entity.name || entity.title || entity.raw?.title || ""),
    entityType: governance.targetType,
    primaryIntentId: governance.searchIntentIds[0] || "eat_drink",
    iconKey: getCanonicalMarkerIconKey(entity),
    highlightIntentIds: governance.searchIntentIds,
    priorityTier: governance.priorityTier,
    hasActivePerk: governance.hasActivePerk,
    hasActiveCampaign: governance.hasActiveCampaign,
  };
}`,
    "canonical marker projection",
  );

  updates.push([file, source]);
}

{
  const file = "scripts/test-map-search-intents.ts";
  let source = read(file);

  source = replaceExact(
    source,
    'import productionMapInventory from "../src/data/production/production-map-inventory.json";',
    'import productionMapInventory from "../src/data/production/production-map-inventory.json";\nimport { DOWNTOWN_CORE_RESTAURANT_RECORDS } from "../src/data/downtownCoreRestaurantPerks";\nimport { getCanonicalIntentForFilter, getMarkerProjection } from "../src/lib/map/intentGovernance";',
    "test imports for restaurant program routing",
  );

  source = replaceExact(
    source,
    `const curatedInKindRestaurant = {
  ...ordinaryRestaurant,
  id: "venue-curated-j-carvers",
  name: "J Carver's",
};`,
    `const curatedInKindRestaurant = {
  ...ordinaryRestaurant,
  id: "inkind-j-carvers",
  name: "J Carver's",
};

const genericPerkRestaurant = {
  ...ordinaryRestaurant,
  id: "venue-generic-resident-perk",
  name: "Generic Resident Perk Restaurant",
  description: "A restaurant with a resident dining perk, but no verified program membership.",
  hasPerk: true,
};

const searchTaggedRestaurant = {
  ...ordinaryRestaurant,
  id: "venue-search-tagged-restaurant",
  residentSearchIntents: ["inKind"],
};`,
    "test fixtures for strict program membership",
  );

  source = replaceExact(
    source,
    `assert.equal(entityHasExplicitInKindMembership(curatedInKindRestaurant), false, "curated membership stays distinct from explicit program metadata");
assert.equal(resolveEntityType(inKindRestaurant), "restaurant", "inKind membership does not replace the restaurant entity type");`,
    `assert.equal(entityHasExplicitInKindMembership(curatedInKindRestaurant), false, "curated membership stays distinct from explicit program metadata");
assert.equal(entityHasExplicitInKindMembership(genericPerkRestaurant), false, "generic dining-perk copy does not create inKind membership");
assert.equal(entityHasExplicitInKindMembership(searchTaggedRestaurant), false, "search intent tags do not create inKind membership");
assert.equal(resolveEntityType(inKindRestaurant), "restaurant", "inKind membership does not replace the restaurant entity type");`,
    "strict membership assertions",
  );

  source = replaceExact(
    source,
    `assert.equal(entityMatchesMapIntent(curatedInKindRestaurant, "inkind"), true, "curated inKind collection stops appear in the inKind layer");

function testIntent`,
    `assert.equal(entityMatchesMapIntent(curatedInKindRestaurant, "inkind"), true, "curated inKind collection stops appear in the inKind layer");
assert.equal(entityMatchesMapIntent(genericPerkRestaurant, "inkind"), false, "generic restaurant perks stay outside the inKind layer");
assert.equal(entityMatchesMapIntent(searchTaggedRestaurant, "inkind"), false, "search tags alone stay outside the inKind layer");
assert.equal(resolveSearchIntent("inKind restaurants").id, "inkind", "explicit inKind terms win before the generic restaurant intent");
assert.equal(resolveSearchIntent("restaurants").id, "dining", "generic restaurant queries continue to resolve to Dining");
assert.equal(getCanonicalIntentForFilter("Dining", "inKind restaurants"), "inkind", "marker governance preserves program query precedence");
assert.equal(getMarkerProjection(ordinaryRestaurant).iconKey, "dining", "ordinary restaurant marker projection uses Dining");
assert.equal(getMarkerProjection(inKindRestaurant).iconKey, "dining", "inKind restaurant marker projection keeps Dining");

for (const restaurant of DOWNTOWN_CORE_RESTAURANT_RECORDS) {
  assert.equal(restaurant.entityType, "restaurant", restaurant.id + " keeps restaurant as its primary type");
  assert.equal(restaurant.partnerType, "venues", restaurant.id + " is not assigned to inKind without verification");
  assert.equal(restaurant.partnerNetwork, undefined, restaurant.id + " has no unverified inKind network");
  assert.equal(restaurant.isInKind, false, restaurant.id + " defaults to non-inKind");
  assert.equal(restaurant.pinKey, "dining", restaurant.id + " uses the knife-and-fork dining glyph");
  assert.ok(!restaurant.applicableIntents.includes("inkind"), restaurant.id + " is excluded from the inKind intent");
  assert.ok(!restaurant.tags.some((tag) => /\binkind\b|\bin\s+kind\b/i.test(String(tag))), restaurant.id + " has no inKind taxonomy tag");
}

function testIntent`,
    "query, projection, and builder regression coverage",
  );

  updates.push([file, source]);
}

for (const [file, source] of updates) {
  fs.writeFileSync(file, source);
  console.log(`patched ${file}`);
}
