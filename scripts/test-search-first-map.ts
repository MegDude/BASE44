import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  MAP_DISCOVERY_LIMITS,
  buildMapSearchCacheKey,
  getDiscoveryLimit,
  isExplicitMapSearch,
  mapPinSchema,
  mapSearchRequestSchema,
  reconcileMarkerIds,
  sourceFromTrigger,
} from "../src/lib/map/mapDiscovery";

const idleRequest = {
  source: "direct-search" as const,
  mode: "resident" as const,
  limit: MAP_DISCOVERY_LIMITS.mobile,
};

assert.equal(isExplicitMapSearch(idleRequest), false, "an idle map request must not resolve entities");
assert.equal(isExplicitMapSearch({ ...idleRequest, query: "Legends Real Estate" }), true);
assert.equal(isExplicitMapSearch({ ...idleRequest, source: "search-area" }), true);

assert.equal(getDiscoveryLimit({ viewportWidth: 393, source: "direct-search" }), 8);
assert.equal(getDiscoveryLimit({ viewportWidth: 1280, source: "intent-console" }), 15);
assert.equal(getDiscoveryLimit({ viewportWidth: 1280, source: "deep-link" }), 6);
assert.equal(getDiscoveryLimit({ viewportWidth: 393, source: "route", routeStopCount: 4 }), 4);

assert.equal(sourceFromTrigger("intent_filter"), "intent-console");
assert.equal(sourceFromTrigger("entity_url"), "deep-link");
assert.equal(sourceFromTrigger("search_this_area"), "search-area");

const parsedRequest = mapSearchRequestSchema.parse({
  query: "coffee nearby",
  source: "direct-search",
  mode: "resident",
  limit: 8,
});
assert.equal(parsedRequest.limit, 8);
assert.throws(() => mapSearchRequestSchema.parse({ ...parsedRequest, limit: 100 }), /25/);

const pin = mapPinSchema.parse({
  id: "venue-coffee",
  entity_type: "venue",
  entity_id: "venue-coffee",
  lat: 30.2672,
  lng: -97.7431,
  title: "Coffee Downtown",
});
assert.equal(pin.visibility, "public");
assert.equal(pin.workspace_id, null);

const firstPlan = reconcileMarkerIds([], ["pin:a", "pin:b"]);
assert.deepEqual(firstPlan.create, ["pin:a", "pin:b"]);
const replacementPlan = reconcileMarkerIds(["pin:a", "pin:b"], ["pin:b", "pin:c"]);
assert.deepEqual(replacementPlan.keep, ["pin:b"]);
assert.deepEqual(replacementPlan.create, ["pin:c"]);
assert.deepEqual(replacementPlan.release, ["pin:a"]);

const firstKey = buildMapSearchCacheKey({
  query: " Coffee Nearby ",
  source: "direct-search",
  mode: "resident",
  limit: 8,
});
const secondKey = buildMapSearchCacheKey({
  query: "coffee nearby",
  source: "direct-search",
  mode: "resident",
  limit: 8,
});
assert.equal(firstKey, secondKey, "normalized searches must share a bounded cache entry");

const hookSource = await readFile(new URL("../src/hooks/useSearchDrivenMapEntities.js", import.meta.url), "utf8");
assert.match(hookSource, /const places = resultPlaces;/, "idle places must come only from resolved results");
assert.doesNotMatch(hookSource, /setLoadedRegistry|initialEntityRequestCount:\s*current\.initialEntityRequestCount\s*\|\|\s*1/, "the hook must not hydrate the registry on mount");

const quickSearchSource = await readFile(new URL("../src/components/navigation/QuickSearchModal.tsx", import.meta.url), "utf8");
assert.doesNotMatch(quickSearchSource, /quick_search_open/, "opening quick search must not fetch pins");

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
assert.doesNotMatch(
  mapSource,
  /Explore Downtown Austin[\s\S]{0,180}Search for a place, property, perk, event, business, building, or experience to begin/i,
  "the search console must not render the retired idle instruction",
);

console.log("Search-first map regression checks passed.");
