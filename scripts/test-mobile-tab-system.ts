import assert from "node:assert/strict";
import { mobileTabsByMode, normalizeMobileTab } from "../src/components/map/mobileTabRegistry";
import { createMobileTabState, rememberTabScroll, transitionMobileTabState } from "../src/components/map/mobileTabState";

assert.deepEqual(mobileTabsByMode.resident.map((tab) => tab.label), ["Home", "Map", "Perks", "Events", "Card"]);
assert.deepEqual(mobileTabsByMode.partner.map((tab) => tab.label), ["Home", "Publish", "Map", "Performance", "Workspace"]);
assert.equal(normalizeMobileTab("resident", "pass"), "card");
assert.equal(normalizeMobileTab("partner", "campaigns"), "publish");
assert.equal(normalizeMobileTab("partner", "audience"), "insights");
assert.equal(normalizeMobileTab("partner", "reports"), "insights");
assert.ok(mobileTabsByMode.resident.every((tab) => tab.emptyTitle && tab.emptyAction && tab.sections.length));
assert.ok(mobileTabsByMode.partner.every((tab) => tab.emptyTitle && tab.emptyAction && tab.sections.length));
assert.ok(mobileTabsByMode.resident.every((tab) => !/campaign|audience|performance/i.test(tab.purpose)));
assert.ok(mobileTabsByMode.partner.every((tab) => !/show your card|redeem/i.test(`${tab.purpose} ${tab.sections.join(" ")}`)));

const initial = createMobileTabState("resident", "map");
const scrolled = rememberTabScroll(initial, "map", 318);
assert.equal(scrolled.scrollPositions["resident:map"], 318);
const switched = transitionMobileTabState({ ...scrolled, selectedEntityId: "venue-1", searchIntent: "coffee" }, { mode: "partner", activeTab: "map" });
assert.equal(switched.selectedEntityId, undefined);
assert.equal(switched.searchIntent, undefined);
assert.equal(switched.scrollPositions["resident:map"], 318);

console.log(`mobile tab system: ${mobileTabsByMode.resident.length} resident tabs, ${mobileTabsByMode.partner.length} partner tabs`);
