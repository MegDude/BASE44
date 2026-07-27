import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { createBuildingExperience } from "../src/lib/buildingExperienceEngine.js";

const buildingModuleSource = fs.readFileSync("src/components/map/BuildingExperienceModule.jsx", "utf8");
const buildingStyles = fs.readFileSync("src/styles/building-experience-engine.css", "utf8");

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
for (const section of ["overview", "perks", "campaigns", "amenities", "events", "nearby", "guide"]) {
  assert.match(buildingModuleSource, new RegExp(`id="${section}" controlId=`), `${section} must have an instance-scoped section target`);
}
assert.match(buildingModuleSource, /data-building-nav=\{id\}[\s\S]*?aria-controls=\{`\$\{sectionPrefix\}-\$\{id\}`\}/, "each building navigation control must reference its section");
assert.match(buildingModuleSource, /scrollRoot\.scrollTo\(\{/, "building navigation must scroll the active panel rather than the page");
assert.match(buildingModuleSource, /event\.key === "Home"[\s\S]*?event\.key === "End"[\s\S]*?event\.key === "ArrowRight"[\s\S]*?event\.key === "ArrowLeft"/, "building navigation must support rail keyboard controls");
assert.match(buildingStyles, /--dp-building-font:\s*"Inter"/, "building panels must use the canonical product typeface");
assert.doesNotMatch(buildingStyles, /font:[^;]*Inter,\s*sans-serif/, "building typography must resolve through the shared font token");

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
