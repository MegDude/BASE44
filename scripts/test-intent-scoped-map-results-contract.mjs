import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const hook = readFileSync(join(root, "src/hooks/useSearchDrivenMapEntities.js"), "utf8");
const contract = readFileSync(join(root, "src/lib/map/intentScopedMapResults.ts"), "utf8");

for (const intent of [
  "discovery",
  "lunch",
  "happy_hour",
  "drinks",
  "coffee",
  "dinner",
  "fitness",
  "wellness",
  "events",
  "walking_route",
  "property",
  "partner",
  "campaign",
]) {
  assert.match(contract, new RegExp(`\\| "${intent}"|${intent}:`), `${intent} must be part of the canonical MapIntent contract`);
}

assert.match(contract, /export type MapQuery = \{/);
assert.match(contract, /audience: "resident" \| "partner"/);
assert.match(contract, /organizationId\?: string/);
assert.match(contract, /portfolioId\?: string/);
assert.match(contract, /listingId\?: string/);
assert.match(contract, /export type MapResultState/);
assert.match(contract, /status: "idle" \| "loading" \| "ready" \| "error"/);
assert.match(contract, /entities: Entity\[\]/);
assert.match(contract, /summary:[\s\S]*count: number;[\s\S]*label: string/);
assert.match(contract, /createLoadingMapResultState/);
assert.match(contract, /createReadyMapResultState/);
assert.match(contract, /mapResultContainsEntity/);

assert.match(hook, /buildMapQueryFromScope/);
assert.match(hook, /createLoadingMapResultState/);
assert.match(hook, /createReadyMapResultState/);
assert.match(hook, /createErrorMapResultState/);
assert.match(hook, /function normalizeLookupId/);
assert.match(hook, /function entityMatchesLookupId/);
assert.match(hook, /entityMatchesLookupId\(entity, activeEntityId\)/, "direct entity URLs must resolve public aliases and display names, not raw IDs only");
assert.match(hook, /Lunch: "lunch"/);
assert.match(hook, /"Happy Hour": "happy_hour"/);
assert.match(hook, /Drinks: "drinks"/);
assert.match(hook, /Dinner: "dinner"/);
assert.match(hook, /Fitness: "fitness"/);

assert.match(hook, /preserveSelectionDuringLookup = Boolean\(normalizedScope\.activeEntityId\) && \/entity\/i\.test\(trigger\)/, "direct entity selection may preserve the current marker set during lookup");
assert.match(hook, /resultIds: preserveSelectionDuringLookup \? current\.resultIds : \[\]/, "intent and search requests must clear stale result IDs before loading");
assert.match(hook, /entitiesById: preserveSelectionDuringLookup \? current\.entitiesById : \{\}/, "intent and search requests must clear stale rows before loading");
assert.match(hook, /mapResultState: preserveSelectionDuringLookup[\s\S]*: createLoadingMapResultState\(activeMapQuery\)/, "loading state must be explicit for new map queries");
assert.match(hook, /activeRequestRef\.current\.id !== requestId/, "late responses must be ignored");
assert.match(hook, /activeRequestRef\.current\.key !== queryKey/, "late responses from previous query keys must be ignored");
assert.match(hook, /result\.mapResultState = createReadyMapResultState\(activeMapQuery, resolvedEntities/, "ready state must derive from the same resolved entity array used by pins and lists");
assert.match(hook, /mapResultState: resultState\.mapResultState \|\| createIdleMapResultState\(\)/, "hook must expose one canonical mapResultState");
assert.match(hook, /if \(scope\.routeIds\?\.length\) \{[\s\S]*candidates = allEntities\.filter\(\(entity\) => routeIds\.has\(String\(entity\.id\)\)\);[\s\S]*\}/, "route results must stay limited to route-defined entity ids");
assert.match(hook, /intent === "lunch"[\s\S]*restaurant/);
assert.match(hook, /intent === "happy_hour"[\s\S]*happy hour/);
assert.match(hook, /intent === "drinks"[\s\S]*cocktail/);

console.log("Intent-scoped map results contract checks passed.");
