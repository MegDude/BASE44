import assert from "node:assert/strict";
import { DOWNTOWN_CORE_RESTAURANT_RECORDS } from "../src/data/downtownCoreRestaurantPerks";
import { supplementalMapEntities } from "../src/data/supplementalMapEntities";
import { resolveEntityPin } from "../src/lib/map/entityPinResolver";
import { MAP_INTENT_REGISTRY, queryEntitiesForIntent } from "../src/map/searchIntent/mapIntentRegistry";

const explicitInKindIds = [
  "inkind-j-carvers",
  "inkind-peche",
  "inkind-parkside",
  "inkind-hopdoddy-congress",
];
const explicitInKindRestaurants = explicitInKindIds.map((id) => {
  const entity = supplementalMapEntities.find((item) => item.id === id);
  assert.ok(entity, `explicit inKind restaurant ${id} exists`);
  return entity;
});

for (const restaurant of DOWNTOWN_CORE_RESTAURANT_RECORDS) {
  assert.equal(restaurant.entityType, "restaurant", `${restaurant.id} keeps restaurant as its primary type`);
  assert.equal(restaurant.pinKey, "dining", `${restaurant.id} uses the knife-and-fork dining glyph`);
  assert.equal(resolveEntityPin(restaurant).label, "Dining", `${restaurant.id} resolves to the dining icon`);
  assert.equal(restaurant.partnerType, "venues", `${restaurant.id} is not assumed to be an inKind partner`);
  assert.equal(restaurant.partnerNetwork, undefined, `${restaurant.id} has no unverified inKind network assignment`);
  assert.equal(restaurant.isInKind, false, `${restaurant.id} is not marked inKind without verification`);
  assert.ok(!restaurant.applicableIntents.includes("inkind"), `${restaurant.id} is excluded from the inKind intent`);
  assert.ok(!restaurant.tags.some((tag) => /^in[\s-]?kind$/i.test(String(tag))), `${restaurant.id} has no inKind search tag`);
}

for (const restaurant of explicitInKindRestaurants) {
  assert.equal(resolveEntityPin(restaurant).label, "Dining", `${restaurant.id} keeps a restaurant glyph inside the inKind layer`);
}

const inKindIntent = MAP_INTENT_REGISTRY.find((intent) => intent.id === "inkind" && intent.mode === "resident");
assert.ok(inKindIntent, "resident inKind intent exists");
assert.equal(inKindIntent.entityTypes, undefined, "inKind intent does not match every restaurant by type");
assert.equal(inKindIntent.categories, undefined, "inKind intent does not match every dining category");
assert.deepEqual(inKindIntent.collectionIds, ["inkind-dining-market"], "inKind intent uses the verified cohort collection");

const testRestaurants = [...DOWNTOWN_CORE_RESTAURANT_RECORDS, ...explicitInKindRestaurants];
const inKindResultIds = queryEntitiesForIntent(testRestaurants, "inkind")
  .map((entity) => entity.id)
  .sort();
assert.deepEqual(inKindResultIds, [...explicitInKindIds].sort(), "inKind layer contains only the explicit cohort");

const diningResultIds = new Set(queryEntitiesForIntent(testRestaurants, "dining").map((entity) => entity.id));
for (const restaurant of testRestaurants) {
  assert.ok(diningResultIds.has(restaurant.id), `${restaurant.id} remains discoverable in Dining`);
}

console.log("Restaurant glyphs and explicit inKind program membership remain independent: PASS");
