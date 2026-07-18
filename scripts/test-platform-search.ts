import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildPlatformSearchCatalog,
  groupPlatformSearchResults,
  searchPlatformCatalog,
  toPlatformSearchDocument,
} from "../src/lib/search/platformSearchCatalog.js";

const inventory = JSON.parse(await readFile(new URL("../src/data/production/production-map-inventory.json", import.meta.url), "utf8"));
const locations = inventory.records;
const catalog = buildPlatformSearchCatalog(locations);

assert.ok(catalog.length >= locations.length, "public search catalog retains the full canonical map inventory");

const nina = searchPlatformCatalog(catalog, "Nina Seely", { limit: 10 });
assert.equal(nina[0]?.resultType, "person", "public people are searchable without becoming map pins");
assert.equal(nina[0]?.markerEligible, false, "people do not receive fabricated coordinates");
assert.match(nina[0]?.linkedEntityId || "", /legends-property/);

const legends = searchPlatformCatalog(catalog, "Legends Real Estate", { limit: 20 });
assert.ok(legends.some((result) => result.resultType === "organization"), "organizations are searchable");
assert.ok(legends.some((result) => result.markerEligible), "organization searches can also return deliberate linked map locations");

const listing = searchPlatformCatalog(catalog, "5357248", { limit: 20 });
assert.ok(listing.some((result) => result.id.includes("5357248") && result.resultType === "listing"), "MLS identifiers resolve canonical listings");

const coffee = searchPlatformCatalog(catalog, "coffee", { limit: 24 });
assert.ok(coffee.length > 0, "places remain searchable");
assert.ok(coffee.length <= 24, "catalog results are bounded");

for (const [query, type] of [
  ["44 East", "place"],
  ["Concert Series", "event"],
  ["24 Diner", "perk"],
  ["Downtown Austin Space Activation", "campaign"],
  ["Shoal Creek Walk", "route"],
  ["Frost Bank Tower", "service"],
] as const) {
  assert.ok(searchPlatformCatalog(catalog, query, { limit: 20 }).some((result) => result.resultType === type), `${type} records remain searchable`);
}

assert.equal(searchPlatformCatalog(catalog, "SEO Snapshot", { mode: "resident" }).length, 0, "resident search does not expose workspace reports");
assert.ok(searchPlatformCatalog(catalog, "SEO Snapshot", { mode: "partner" }).some((result) => result.resultType === "report"), "authorized partner reports are searchable");
assert.ok(searchPlatformCatalog(catalog, "Performance", { mode: "partner" }).some((result) => result.resultType === "tool"), "workspace tools are searchable in partner mode");

const groups = groupPlatformSearchResults([...nina, ...listing, ...coffee]);
assert.ok(groups.some((group) => group.type === "person"));
assert.ok(groups.some((group) => ["listing", "place"].includes(group.type)));

const privateProbe = toPlatformSearchDocument({
  id: "person-private-probe",
  name: "Public Name",
  type: "person",
  email: "private@example.com",
  phone: "512-555-0100",
  unit: "4301",
  crmStatus: "lead",
  searchKeywords: ["public profile"],
});
const serializedProbe = JSON.stringify(privateProbe);
assert.doesNotMatch(serializedProbe, /private@example|512-555|4301|crmStatus|lead/i, "search documents exclude private CRM and contact fields");
assert.equal(privateProbe.markerEligible, false);

const filterIndependentA = searchPlatformCatalog(catalog, "Hotel Van Zandt", { limit: 10 });
const filterIndependentB = searchPlatformCatalog(catalog, "Hotel Van Zandt", { limit: 10, filter: "Coffee", bounds: { north: 0, south: 0, east: 0, west: 0 } });
assert.deepEqual(filterIndependentB, filterIndependentA, "map filters and viewport do not change global catalog discovery");

const syntheticRecords = Array.from({ length: 25_000 }, (_, index) => ({
  id: `synthetic-place-${index}`,
  name: `Downtown place ${index}`,
  type: index % 7 === 0 ? "event" : "venue",
  category: index % 5 === 0 ? "Coffee" : "Dining",
  district: "Downtown Core",
  lat: 30.26 + (index % 100) / 100_000,
  lng: -97.74 - (index % 100) / 100_000,
}));
const performanceStartedAt = performance.now();
const syntheticCatalog = buildPlatformSearchCatalog(syntheticRecords, { includePublicProfiles: false });
const syntheticResults = searchPlatformCatalog(syntheticCatalog, "Downtown place 249", { limit: 24 });
const performanceDuration = Math.round(performance.now() - performanceStartedAt);
assert.equal(syntheticCatalog.length, 25_003, "workspace routing records remain part of the complete platform catalog");
assert.ok(syntheticResults.length <= 24, "25,000-record searches still return bounded summaries");

console.log(`Platform search coverage checks passed for ${catalog.length} documents; 25,000-record build and query: ${performanceDuration} ms.`);
