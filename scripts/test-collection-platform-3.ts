import assert from "node:assert/strict";
import { universalCollections } from "../src/data/universalCollections";
import { getMapCollectionById, getMapCollectionForQuery } from "../src/data/mapCollections";
import { resolveMapCollectionRoute } from "../src/lib/map/collectionRoutes";

assert.ok(universalCollections.length >= 12, "Collection 3.0 should ship a meaningful universal catalog");

for (const collection of universalCollections) {
  const tokens = collection.dynamicRule.tokens;
  const places = [0, 1, 2].map((index) => ({
    id: `${collection.id}-test-${index}`,
    name: `${collection.title} Stop ${index + 1}`,
    type: collection.dynamicRule.entityTypes?.[0] || "venue",
    category: `${collection.category} ${tokens[index % tokens.length]}`,
    description: `${tokens.join(" ")} live collection stop`,
    latitude: 30.26 + index * 0.001,
    longitude: -97.74 - index * 0.001,
    offer: collection.dynamicRule.requireActivePerk ? "Resident reward" : undefined,
  }));
  const route = resolveMapCollectionRoute(getMapCollectionById(collection.id), places);
  assert.equal(route?.status, "pass", `${collection.id} should resolve a map-ready dynamic route`);
  assert.equal(route?.stops.length, 3, `${collection.id} should keep matching live stops`);
  assert.equal(route?.checkInEnabled, true, `${collection.id} should support collection check-ins`);
  assert.ok(route?.badge, `${collection.id} should define a Resident Passport badge`);
  assert.ok(route?.stories?.length, `${collection.id} should include editorial storytelling`);
  assert.ok(route?.aiHints?.length, `${collection.id} should include contextual recommendation hints`);
}

assert.equal(getMapCollectionForQuery("dog friendly downtown")?.id, "dog-friendly-downtown");
assert.equal(getMapCollectionForQuery("architecture walk")?.id, "architecture-downtown");
assert.equal(getMapCollectionForQuery("coffee collection")?.id, "coffee-downtown");
assert.equal(getMapCollectionForQuery("family weekend")?.id, "family-weekend");

console.log(`collection platform 3.0: ${universalCollections.length} universal collections resolve live map routes`);
