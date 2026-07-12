import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const start = source.indexOf("function beginSearchIntentTransition");
const transition = source.slice(start, source.indexOf("function setFilter", start));

for (const staleKey of ["entityId", "perkId", "eventId", "routeId", "collectionId", "listingId", "campaignId"]) {
  assert.match(transition, new RegExp(`${staleKey}: \\\"\\\"`), `intent transition clears ${staleKey}`);
}
for (const stateClear of ["setClusterDrawer(null)", "setMapAnswer(null)", "setSelectedId(\"\")", "clearScopedMapResults()"] ) {
  assert.ok(transition.includes(stateClear), `intent transition includes ${stateClear}`);
}
assert.ok(source.includes("return getMapEntityIntentTags(place).includes(canonicalFilter)"), "entities use the canonical intent selector");
assert.ok(!source.includes('activeFilter: urlState.mode === "partner" && urlState.intent ? "All" : activeFilter'), "partner markers do not bypass active intent");
assert.ok(source.includes("aria-selected={active}"), "intent controls expose single-select state");
assert.ok(source.includes("selectedIntentAnnouncement"), "intent result count is announced");

console.log("search intent exclusivity: transition, taxonomy, markers, URL, and accessibility verified");
