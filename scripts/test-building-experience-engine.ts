import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { createBuildingExperience } from "../src/lib/buildingExperienceEngine.js";

const buildingModuleSource = fs.readFileSync("src/components/map/BuildingExperienceModule.jsx", "utf8");
const buildingStyles = fs.readFileSync("src/styles/building-experience-engine.css", "utf8");
const nativeBuildingStyles = fs.readFileSync("src/styles/building-experience-ios-native-final.css", "utf8");
const mainSource = fs.readFileSync("src/main.jsx", "utf8");

const building = {
  id: "test-building",
  name: "Test Building",
  district: "Rainey",
  latitude: 30.26,
  longitude: -97.74,
  sharedAmenities: ["Fitness centre", "Yoga studio", "Resident lounge", "Package lockers", "Co-working lounge"],
  residentRoutines: ["Walk to the trail before breakfast."],
  residentGoodFor: ["Wellness", "Easy lake access"],
  partnerCampaigns: ["Resident recovery series"],
};

const places = [
  { id: "coffee", name: "Nearby Coffee", type: "venue", category: "Coffee", latitude: 30.2604, longitude: -97.7402, offer: "Save 10% today", hasPerk: true },
  { id: "event", name: "Rainey Market", type: "event", category: "Event", latitude: 30.2606, longitude: -97.7401 },
  { id: "campaign", name: "Rainey Weekend", type: "campaign", status: "active", district: "Rainey", participatingEntities: ["test-building"] },
];

const experience = createBuildingExperience(building, {
  places,
  routeDefinitions: [{ id: "rainey-walk", title: "Rainey Walk", neighborhood: "Rainey", summary: "A short neighborhood route." }],
});

assert.equal(experience.buildingId, building.id);
assert.ok(experience.amenities.find((group) => group.id === "wellness")?.amenities.includes("Fitness centre"));
assert.ok(experience.amenities.find((group) => group.id === "work")?.amenities.includes("Co-working lounge"));
assert.equal(experience.perks[0]?.id, "coffee");
assert.equal(experience.events[0]?.id, "event");
assert.equal(experience.campaigns[0]?.id, "campaign");
assert.ok(experience.campaigns.some((campaign) => campaign.propertyId === building.id));
assert.equal(experience.routes[0]?.id, "rainey-walk");
assert.ok(experience.collections.some((collection) => collection.id === "everyday" && collection.places[0]?.id === "coffee"));
assert.ok(experience.nearby.some((place) => place.id === "coffee"));
assert.equal(experience.analytics.relationshipIds.buildingId, building.id);
assert.ok(experience.analytics.events.includes("route_started"));
for (const section of ["overview", "perks", "collections", "campaigns", "amenities", "events", "routes", "nearby", "guide"]) {
  assert.match(buildingModuleSource, new RegExp(`id="${section}"\\s+controlId=`), `${section} must have an instance-scoped section target`);
}
assert.match(buildingModuleSource, /experience\.collections\?\.length[\s\S]*?items\.push\("collections"\)/, "collection content must add a visible navigation destination");
assert.match(buildingModuleSource, /experience\.routes\?\.length[\s\S]*?items\.push\("routes"\)/, "walking routes must add a visible navigation destination");
assert.match(buildingModuleSource, /data-building-nav=\{id\}[\s\S]*?aria-controls=\{`\$\{sectionPrefix\}-\$\{id\}`\}/, "each building navigation control must reference its section");
assert.match(buildingModuleSource, /scrollRoot\.scrollTo\(\{/, "building navigation must scroll the active panel rather than the page");
assert.match(buildingModuleSource, /event\.key === "Home"[\s\S]*?event\.key === "End"[\s\S]*?event\.key === "ArrowRight"[\s\S]*?event\.key === "ArrowLeft"/, "building navigation must support rail keyboard controls");
assert.match(buildingModuleSource, /disabled=\{!onSelect\}/, "place rows must not appear actionable when selection is unavailable");
assert.match(buildingModuleSource, /disabled=\{!onExplore\}/, "discovery actions must not appear actionable when exploration is unavailable");
assert.match(buildingModuleSource, /disabled=\{!onOpenRoute\}/, "route rows must not appear actionable when route opening is unavailable");
assert.match(buildingModuleSource, /withQuery\(campaignRoute, \{ suggestion: campaign\.title \}\)/, "campaign recommendations must open prefilled campaign setup");
assert.match(buildingModuleSource, /Create the first offer/, "partner offer empty state must lead to offer creation");
assert.match(buildingModuleSource, /Create the first event/, "partner event empty state must lead to event creation");
assert.match(buildingStyles, /--dp-building-font:\s*"Inter"/, "building panels must use the canonical product typeface");
assert.doesNotMatch(buildingStyles, /font:[^;]*Inter,\s*sans-serif/, "building typography must resolve through the shared font token");
assert.ok(mainSource.indexOf("building-experience-ios-native-final.css") > mainSource.indexOf("map-bottom-drawer-contract-final.css"), "native building surface must load after shared drawer geometry");
assert.match(nativeBuildingStyles, /position:\s*sticky\s*!important/, "building section navigation must remain available while the drawer scrolls");
assert.match(nativeBuildingStyles, /min-height:\s*48px\s*!important/, "building tabs must use an iOS-size control height");
assert.match(nativeBuildingStyles, /min-height:\s*58px\s*!important/, "building rows must use a comfortable mobile touch target");
assert.match(nativeBuildingStyles, /background:\s*#ffffff\s*!important/, "building content must stay on a bright-white surface");
assert.doesNotMatch(nativeBuildingStyles, /linear-gradient|radial-gradient/i, "building drawer must not use gradients");

const residentialRows = parse(fs.readFileSync("src/data/imports/downtown_perks_residential_mixed_use_copy_deck.csv", "utf8"), {
  columns: true,
  skip_empty_lines: true,
  bom: true,
});
for (const row of residentialRows) {
  const resolved = createBuildingExperience({
    id: row.entity_id,
    name: row.name,
    district: row.district,
    sharedAmenities: row.shared_amenities.split(/\s*[;|]\s*/).filter(Boolean),
    residentRoutines: row.hidden_gem.split(/\s*[;|]\s*/).filter(Boolean),
    residentGoodFor: row.campaign_alignment.split(/\s*[;|]\s*/).filter(Boolean),
    partnerCampaigns: row.campaign_alignment.split(/\s*[;|]\s*/).filter(Boolean),
  });
  assert.equal(resolved.buildingId, row.entity_id);
  assert.ok(resolved.amenities.length, `${row.entity_id} should have structured amenities`);
  assert.ok(resolved.collections.length, `${row.entity_id} should have collections`);
  assert.ok(resolved.campaigns.some((campaign) => campaign.propertyId === row.entity_id), `${row.entity_id} should have property-scoped campaigns`);
}

console.log(JSON.stringify({ status: "passed", buildings: residentialRows.length, modules: Object.keys(experience), campaignCount: experience.campaigns.length }, null, 2));
