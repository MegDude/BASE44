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
import {
  normalizeDiscoveryControlQuery,
} from "../src/lib/map/mapDiscoveryControls.js";

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

assert.equal(normalizeDiscoveryControlQuery("Nearby", "Nearby"), "", "Nearby is a discovery control, not a literal entity query");
assert.equal(normalizeDiscoveryControlQuery("near me", "Nearby"), "", "near-me controls resolve spatially");
assert.equal(normalizeDiscoveryControlQuery("Coffee nearby", "Coffee"), "Coffee nearby", "descriptive searches keep their text");

const hookSource = await readFile(new URL("../src/hooks/useSearchDrivenMapEntities.js", import.meta.url), "utf8");
assert.match(hookSource, /normalizeDiscoveryControlQuery\(scope\.query, scope\.filter\)/, "resolver normalizes semantic discovery labels before matching entities");
assert.match(hookSource, /!isDiscoveryControlFilter\(normalizedFilter\)/, "semantic discovery labels are not emitted as backend entity categories");
assert.match(hookSource, /normalizedFilter === "nearby"[\s\S]{0,120}\? "nearby"/, "Nearby remains an explicit bounded spatial intent");
assert.match(hookSource, /const places = resultPlaces;/, "idle places must come only from resolved results");
assert.doesNotMatch(hookSource, /setLoadedRegistry|initialEntityRequestCount:\s*current\.initialEntityRequestCount\s*\|\|\s*1/, "the hook must not hydrate the registry on mount");
const catalogResolverSource = hookSource.slice(
  hookSource.indexOf("async function loadPlatformSearchIndex"),
  hookSource.indexOf("export function useSearchDrivenMapEntities"),
);
assert.match(catalogResolverSource, /import\("@\/data\/production\/platform-search-index\.json"\)/, "the complete search index must load lazily after a query");
const searchCatalogSource = hookSource.slice(
  hookSource.indexOf("const searchCatalog = useCallback"),
  hookSource.indexOf("const runSearch = useCallback"),
);
assert.doesNotMatch(searchCatalogSource, /loadRegistry\(/, "typing in search must not hydrate the full map registry");
assert.doesNotMatch(hookSource, /Promise\.all\(\[\s*searchOperationalMap/, "bounded pin search must not run beside full map-registry hydration");
assert.match(hookSource, /await searchCatalog\(normalizedScope\.query, resolvedEntities/, "bounded pin responses may enrich the lightweight search index");
assert.match(hookSource, /loadRegistryForScope\(normalizedScope\)/, "an explicit request may hydrate only matched canonical records for marker resolution");

const quickSearchSource = await readFile(new URL("../src/components/navigation/QuickSearchModal.tsx", import.meta.url), "utf8");
assert.doesNotMatch(quickSearchSource, /quick_search_open/, "opening quick search must not fetch pins");
assert.match(quickSearchSource, /searchCatalog\(cleanQuery, places, "resident"\)/, "platform quick search uses the same lazy complete index");

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
assert.match(mapSource, /searchScopedCatalog\(query, places, urlState\.mode\)/, "typed queries search the complete lightweight catalog without mounting markers");
assert.match(mapSource, /entityId: canonicalTargetId/, "selecting a catalog result deep-links only that entity into the bounded resolver");
assert.match(mapSource, /role="combobox"/, "the map search input exposes its dropdown relationship");
assert.match(mapSource, /role="listbox"/, "typed matches render as an accessible dropdown list");
assert.match(mapSource, /href=\{`\/map\?\$\{params\.toString\(\)\}`\}/, "each mappable dropdown match is a real map link");
assert.match(mapSource, /hasResolvedMapScope[\s\S]{0,700}visibleMapResultIds\.has\(String\(id\)\)/, "resolved dropdown matches stay aligned with the pins visible on the map");
assert.match(mapSource, /selectPlace\(catalogEntity, \{ catalogResult: true, perkId \}\)/, "selecting a dropdown match opens the resolved map entity and its perk");
assert.match(mapSource, /hasAuthoritativeScopedResults[\s\S]{0,500}if \(hasAuthoritativeScopedResults\) return true;/, "resolved search pins are not removed by a second local text filter");
assert.match(mapSource, /data-marker-entity-id/, "every rendered marker exposes its canonical entity id for interaction QA");
assert.match(mapSource, /ariaLabel:[^\n]+`Open \$\{place\.name\}/, "every rendered marker has an Open {entity name} accessible label");
assert.match(mapSource, /MAP_DISCOVERY_LIMITS\.maxVisibleMobile/, "explicit mobile searches request the complete governed mobile pin set");
assert.doesNotMatch(
  mapSource,
  /Explore Downtown Austin[\s\S]{0,180}Search for a place, property, perk, event, business, building, or experience to begin/i,
  "the search console must not render the retired idle instruction",
);

console.log("Search-first map regression checks passed.");
