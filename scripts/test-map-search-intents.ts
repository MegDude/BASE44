import assert from "node:assert/strict";
import fs from "node:fs";
import productionMapInventory from "../src/data/production/production-map-inventory.json";
import { DOWNTOWN_CORE_RESTAURANT_RECORDS } from "../src/data/downtownCoreRestaurantPerks";
import {
  getCanonicalIntentForFilter,
  getEntityGovernance,
  getMarkerProjection,
  getViewportBoundedMarkerPlaces,
  hasVerifiedInKindMembership,
} from "../src/lib/map/intentGovernance";
import { resolveEntityPin } from "../src/lib/map/entityPinResolver";
import { resolveEntityType } from "../src/lib/map/entityTypeResolver";
import {
  CANONICAL_PARTNER_INTENT_IDS,
  MAP_INTENT_REGISTRY,
  applyMapIntent,
  entityHasExplicitInKindMembership,
  entityMatchesMapIntent,
  resolveSearchIntent,
} from "../src/map/searchIntent/mapIntentRegistry";
import { parseSearchIntent } from "../src/map/searchIntent/searchIntentParser";

const entities = productionMapInventory.records;
const failures: Array<{ intentId: string; message: string }> = [];

for (const intentId of CANONICAL_PARTNER_INTENT_IDS) {
  const definition = MAP_INTENT_REGISTRY.find((intent) => intent.mode === "partner" && intent.id === intentId);
  assert.ok(definition, `canonical partner intent ${intentId} is registered`);
  const applied = applyMapIntent(entities, intentId, "partner");
  assert.equal(applied.intent.id, intentId, `canonical partner intent ${intentId} resolves directly`);
  assert.equal(applied.urlState.query, "", `partner intent ${intentId} clears free-text query state`);
}

for (const [legacyId, canonicalId] of Object.entries({
  campaign_opportunity: "campaigns",
  coverage_gap: "opportunity",
  partner_intelligence: "insights",
  partner_performance: "performance",
  partner_properties: "properties",
  partner_events: "events",
  partner_perks: "perks",
})) {
  assert.equal(resolveSearchIntent(legacyId, "partner").id, canonicalId, `${legacyId} resolves to ${canonicalId}`);
}

const ordinaryRestaurant = {
  id: "venue-independent-dining-room",
  name: "Independent Dining Room",
  type: "venue",
  kind: "venue",
  entityType: "restaurant",
  category: "Dining",
  description: "A restaurant with a Downtown Perks offer, but no verified partner-program membership.",
  latitude: 30.2672,
  longitude: -97.7431,
  active: true,
  pinKey: "dining",
};

const inKindRestaurant = {
  ...ordinaryRestaurant,
  id: "venue-participating-dining-room",
  name: "Participating Dining Room",
  partnerType: "inkind",
  partnerNetwork: "inkind",
  hasPerk: true,
  pinKey: "inkind",
};

const curatedInKindRestaurant = {
  ...ordinaryRestaurant,
  id: "inkind-j-carvers",
  name: "J Carver's",
};

assert.equal(entityHasExplicitInKindMembership(ordinaryRestaurant), false, "restaurant text alone does not create inKind membership");
assert.equal(entityHasExplicitInKindMembership(inKindRestaurant), true, "explicit partner metadata creates inKind membership");
assert.equal(resolveEntityType(inKindRestaurant), "restaurant", "inKind membership does not replace the restaurant entity type");
assert.equal(resolveEntityPin(ordinaryRestaurant).label, "Dining", "ordinary restaurants use the canonical dining pin");
assert.equal(resolveEntityPin(inKindRestaurant).label, "Dining", "inKind restaurants keep the canonical dining pin");
assert.equal(entityMatchesMapIntent(ordinaryRestaurant, "dining"), true, "ordinary restaurants remain in Dining");
assert.equal(entityMatchesMapIntent(inKindRestaurant, "dining"), true, "inKind restaurants remain in Dining");
assert.equal(entityMatchesMapIntent(ordinaryRestaurant, "inkind"), false, "ordinary restaurants do not leak into the inKind layer");
assert.equal(entityMatchesMapIntent(inKindRestaurant, "inkind"), true, "explicit members appear in the inKind layer");
assert.equal(entityMatchesMapIntent(curatedInKindRestaurant, "inkind"), true, "curated inKind collection stops appear in the inKind layer");

assert.equal(parseSearchIntent("inKind restaurants"), "inkind", "explicit inKind language wins before the generic restaurant keyword");
assert.equal(getCanonicalIntentForFilter("All", "inKind restaurants"), "inkind", "map governance prioritizes the inKind program query");
assert.equal(getCanonicalIntentForFilter("inKind", ""), "inkind", "the inKind filter uses a dedicated program intent");
assert.equal(getCanonicalIntentForFilter("Dining", "restaurants"), "eat_drink", "generic restaurant queries remain in Dining");

assert.equal(hasVerifiedInKindMembership(ordinaryRestaurant), false, "ordinary restaurants are not verified inKind members");
assert.equal(hasVerifiedInKindMembership(inKindRestaurant), true, "explicit program metadata is accepted by marker governance");
assert.equal(hasVerifiedInKindMembership(curatedInKindRestaurant), true, "curated collection stops are accepted by marker governance");

const ordinaryMarker = getMarkerProjection(ordinaryRestaurant);
const inKindMarker = getMarkerProjection(inKindRestaurant);
assert.equal(ordinaryMarker.iconKey, "dining", "ordinary restaurants project the canonical dining icon");
assert.equal(inKindMarker.iconKey, "dining", "inKind restaurants still project the canonical dining icon");
assert.equal(ordinaryMarker.primaryIntentId, "eat_drink", "restaurant place identity owns the primary marker intent");
assert.equal(inKindMarker.primaryIntentId, "eat_drink", "program membership does not replace the primary restaurant intent");
assert.deepEqual(inKindMarker.programIntentIds, ["inkind"], "verified membership is emitted as secondary program state");

const inKindGovernedResults = getViewportBoundedMarkerPlaces(
  [ordinaryRestaurant, inKindRestaurant, curatedInKindRestaurant],
  { activeFilter: "inKind", query: "", zoom: 17, mode: "resident" },
);
assert.equal(inKindGovernedResults.intentId, "inkind", "inKind viewport filtering uses the dedicated intent");
assert.deepEqual(
  inKindGovernedResults.places.map((entity) => entity.id).sort(),
  [curatedInKindRestaurant.id, inKindRestaurant.id].sort(),
  "inKind viewport filtering excludes ordinary restaurants",
);

for (const restaurant of DOWNTOWN_CORE_RESTAURANT_RECORDS) {
  assert.equal(restaurant.entityType, "restaurant", `${restaurant.id} keeps restaurant as its primary type`);
  assert.equal(restaurant.partnerType, "venues", `${restaurant.id} defaults to the venue partner type`);
  assert.equal(restaurant.partnerNetwork, undefined, `${restaurant.id} has no unverified inKind network assignment`);
  assert.equal(restaurant.isInKind, false, `${restaurant.id} is not marked inKind without verification`);
  assert.equal(restaurant.pinKey, "dining", `${restaurant.id} uses the knife-and-fork dining glyph`);
  assert.ok(!restaurant.applicableIntents.includes("inkind"), `${restaurant.id} is excluded from the inKind intent`);
  assert.ok(!restaurant.tags.some((tag) => /^in[\s-]?kind$/i.test(String(tag))), `${restaurant.id} has no inKind search tag`);
  assert.ok(!getEntityGovernance(restaurant).searchIntentIds.includes("inkind"), `${restaurant.id} does not inherit inKind through marker governance`);
}

const mainSource = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const markerLockCss = fs.readFileSync(new URL("../src/styles/restaurant-program-layer-final.css", import.meta.url), "utf8");
assert.ok(mainSource.includes('import "@/styles/restaurant-program-layer-final.css"'), "restaurant program marker lock loads after the shared marker system");
assert.ok(markerLockCss.includes(".dp-map-pin.dp-live-pin--inkind"), "marker lock covers the inKind program class");
assert.ok(markerLockCss.includes("--dp-canonical-pin-navy"), "inKind program state preserves the canonical restaurant marker palette");

function testIntent(intent: (typeof MAP_INTENT_REGISTRY)[number]) {
  const applied = applyMapIntent(entities, intent, intent.mode);

  assert.equal(applied.intent.id, intent.id, "intent resolves through canonical registry");
  assert.equal(applied.urlState.mode, intent.mode, "URL state preserves mode");
  assert.equal(applied.urlState.tab, "map", "URL state preserves map tab");
  assert.ok(Array.isArray(applied.filteredPins), "previous filtered pins are cleared before applying intent");
  assert.ok(Array.isArray(applied.routeLayers), "route layer output is always present");

  if (intent.id !== "natural_language" && !intent.allowEmpty) {
    assert.ok(applied.resultCount > 0, "registered intent should return at least one pin");
  }

  for (const pin of applied.pins) {
    assert.ok(pin.id || pin.entityId, "returned pin has stable id");
    assert.ok(entityMatchesMapIntent(pin, intent) || intent.id === "all", `pin ${pin.id || pin.entityId} matches intent`);
  }

  if (intent.collectionIds?.length || intent.routeIds?.length) {
    assert.ok(applied.routeLayers.length || applied.collections.length, "collection/route intent returns route or collection context");
  }

  if (intent.campaignIds?.length) {
    assert.ok(applied.campaigns.length > 0, "campaign intent returns active campaign context");
  }

  if (intent.brandIds?.length) {
    assert.ok(applied.brands.length > 0, "brand intent returns brand context");
  }

  const mouseIntent = resolveSearchIntent(intent.id, intent.mode);
  const keyboardIntent = resolveSearchIntent(intent.label, intent.mode);
  const pointerIntent = resolveSearchIntent(intent.searchTerms?.[0] || intent.label, intent.mode);
  assert.ok(mouseIntent.id, "mouse click resolves intent");
  assert.ok(keyboardIntent.id, "keyboard activation resolves intent");
  assert.ok(pointerIntent.id, "pointer/touch activation resolves intent");

  if (applied.primaryResult) {
    assert.ok(applied.urlState.intent, "pin opening can carry source intent");
  }
}

for (const intent of MAP_INTENT_REGISTRY) {
  try {
    testIntent(intent);
  } catch (error) {
    failures.push({ intentId: intent.id, message: error instanceof Error ? error.message : String(error) });
  }
}

const zeroResult = applyMapIntent(entities, {
  id: "natural:zero-result-unicorn-helipad",
  label: "zero result unicorn helipad",
  intentType: "natural-language",
  mode: "resident",
  searchTerms: ["zero-result-unicorn-helipad"],
});
assert.equal(zeroResult.resultCount, 0, "zero-result natural-language query should not fall back to All pins");
assert.deepEqual(zeroResult.pins, [], "zero-result natural-language query clears previous pins");

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(`Map search intent tests passed for ${MAP_INTENT_REGISTRY.length} registered intents.`);
