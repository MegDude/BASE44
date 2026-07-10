import assert from "node:assert/strict";
import productionMapInventory from "../src/data/production/production-map-inventory.json";
import {
  MAP_INTENT_REGISTRY,
  applyMapIntent,
  entityMatchesMapIntent,
  resolveSearchIntent,
} from "../src/map/searchIntent/mapIntentRegistry";

const entities = productionMapInventory.records;
const failures: Array<{ intentId: string; message: string }> = [];

function testIntent(intent: (typeof MAP_INTENT_REGISTRY)[number]) {
  const applied = applyMapIntent(entities, intent, intent.mode);

  assert.equal(applied.intent.id, intent.id, "intent resolves through canonical registry");
  assert.equal(applied.urlState.mode, intent.mode, "URL state preserves mode");
  assert.equal(applied.urlState.tab, "map", "URL state preserves map tab");
  assert.ok(Array.isArray(applied.filteredPins), "previous filtered pins are cleared before applying intent");
  assert.ok(Array.isArray(applied.routeLayers), "route layer output is always present");

  if (intent.id !== "natural_language") {
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
