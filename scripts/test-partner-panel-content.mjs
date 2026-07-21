import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolvePartnerPanelCopy } from "../src/lib/partner/partnerPanelContent.js";
import { isGenericInventoryPanelCopy, resolveEntityPanelContent } from "../src/lib/map/entityPanelArchetypes.js";

const fixtures = [
  { name: "Waterloo Greenway", type: "civic", category: "Parks and culture", district: "Waterloo" },
  { name: "The Shore #4301", type: "property", category: "Real Estate Listing", district: "Rainey" },
  { name: "Fairmont Austin", type: "hotel", category: "Hotel", district: "Convention Center" },
  { name: "Geraldine's", type: "restaurant", category: "Dining and live music", district: "Rainey" },
  { name: "First Thursday", type: "event", category: "Event", district: "South Congress" },
  { name: "Fine Eyewear", type: "brand", category: "Retail", district: "Downtown" },
  { name: "Recovery Studio", type: "wellness", category: "Wellness", district: "West Sixth" },
  { name: "Convention Center Garage", type: "parking", category: "Parking", district: "Convention Center" },
  { name: "Downtown Service", type: "service", category: "Service", district: "Downtown" },
];

const residentOnly = /show your card|resident perk|worth visiting|save this place/i;

for (const fixture of fixtures) {
  const copy = resolvePartnerPanelCopy(fixture);
  assert.ok(copy.category, `${fixture.name}: category is required`);
  assert.ok(copy.audience, `${fixture.name}: audience is required`);
  assert.ok(copy.timing, `${fixture.name}: timing is required`);
  assert.ok(copy.placement, `${fixture.name}: placement is required`);
  assert.ok(copy.action, `${fixture.name}: action is required`);
  const values = [copy.title, copy.value, copy.description, copy.terms, copy.audience, copy.timing, copy.placement, copy.action].filter(Boolean);
  const normalized = values.map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
  assert.equal(new Set(normalized).size, normalized.length, `${fixture.name}: repeated panel copy`);
  assert.equal(residentOnly.test(values.join(" ")), false, `${fixture.name}: resident-facing copy leaked into partner view`);
}

const backendOverride = resolvePartnerPanelCopy({
  name: "Synced Partner",
  type: "brand",
  district: "Downtown",
  partnerPanel: {
    audience: "Verified event attendees within a ten-minute walk.",
    objective: "Drive appointment bookings from the live event route.",
    timing: "Two hours before doors through event close.",
    placement: "Event route and partner report.",
    primaryActionLabel: "Manage booking activation",
  },
});
assert.equal(backendOverride.audience, "Verified event attendees within a ten-minute walk.");
assert.equal(backendOverride.action, "Manage booking activation");

const waterloo = {
  id: "civic-waterloo-greenway",
  name: "Waterloo Greenway",
  type: "civic",
  partnerType: "civic",
  category: "Civic / Public Space",
  district: "Waterloo",
  summary: "Urban greenway, public space, events, trails, and community programming in downtown Austin.",
  description: "Waterloo Greenway connects people to nature, culture, art, community, and downtown movement.",
  offer: "Home of the DANA-connected See Austin Differently discovery trail.",
};

const waterlooResident = resolveEntityPanelContent(waterloo, "resident");
assert.equal(waterlooResident.panelType, "civic");
assert.equal(waterlooResident.eyebrow, "Downtown landmark");
assert.equal(/resident perk|redeem perk|DANA perk/i.test([waterlooResident.context, waterlooResident.whyBody].join(" ")), false);

const waterlooPartner = resolveEntityPanelContent(waterloo, "partner");
assert.equal(waterlooPartner.eyebrow, "Civic participation");
assert.equal(/resident perk|resident pass|show your card|redeem perk/i.test(Object.values(waterlooPartner).flat().join(" ")), false);
assert.match(waterlooPartner.primaryActionLabel, /manage civic programming/i);

const rejectedResidentOverride = resolvePartnerPanelCopy({
  name: "Audience Guard Test",
  type: "event",
  partnerPanel: {
    summary: "Show your card to redeem this resident perk.",
    objective: "Claim perk with your Resident Pass.",
    primaryActionLabel: "Redeem Perk",
  },
});
assert.equal(/show your card|resident perk|resident pass|redeem perk/i.test(Object.values(rejectedResidentOverride).join(" ")), false);

const uniqueResidentFixtures = [
  {
    name: "Augustine",
    entityType: "bar",
    category: "Drinks",
    subcategory: "Bar / Nightlife",
    district: "Rainey",
    address: "86, Rainey Street, Austin, TX, 78701",
    description: "Bar / Nightlife listing in Downtown Austin.",
  },
  {
    name: "ATX Cocina",
    entityType: "restaurant",
    category: "Dining",
    subcategory: "Restaurant / Food",
    district: "Downtown Core",
    address: "110, San Antonio Street, Austin, TX, 78701",
    description: "Restaurant / Food with cuisine focus: mexican.",
  },
  {
    name: "Hotel Van Zandt",
    entityType: "hotel",
    category: "Hotel",
    district: "Rainey",
    address: "605, Davis Street, Austin, TX, 78701",
    description: "Hotel / Hospitality listing in Downtown Austin.",
  },
  {
    name: "Republic Square",
    entityType: "park",
    category: "Civic",
    district: "Downtown Core",
    address: "422, Guadalupe Street, Austin, TX, 78701",
    description: "Civic / Culture listing operated by Austin Parks and Recreation Department.",
  },
  {
    name: "Sunday Supper Passport",
    entityType: "perk",
    category: "Perks",
    district: "Downtown Core",
    hostName: "Larry & Guy",
    offer: "Unlock a dining credit after a second participating visit.",
  },
];

const genericPanelLanguage = /listing in Downtown Austin|cuisine focus:|This pin matters because|not a generic nearby result|this panel should/i;
const residentNarratives = uniqueResidentFixtures.map((fixture) => {
  assert.equal(isGenericInventoryPanelCopy(fixture.description), Boolean(fixture.description), `${fixture.name}: generic source classification`);
  const copy = resolveEntityPanelContent(fixture, "resident");
  const narrative = [copy.context, copy.whyHeading, copy.whyBody, copy.insight].join(" ");
  assert.match(narrative, new RegExp(fixture.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), `${fixture.name}: named narrative`);
  assert.equal(genericPanelLanguage.test(narrative), false, `${fixture.name}: generic panel language removed`);
  return narrative;
});
assert.equal(new Set(residentNarratives).size, residentNarratives.length, "Every resident fixture receives distinct panel copy");

const authoredResidentCopy = resolveEntityPanelContent({
  name: "Waterloo Greenway",
  entityType: "civic",
  district: "Waterloo",
  description: "Waterloo Greenway links Waller Creek, Waterloo Park, Moody Amphitheater, and public programs through the eastern edge of downtown.",
}, "resident");
assert.match(authoredResidentCopy.whyBody, /Waller Creek, Waterloo Park, Moody Amphitheater/i, "Authored place copy is preserved");

const inventorySource = JSON.parse(readFileSync(new URL("../src/data/production/production-map-inventory.json", import.meta.url), "utf8"));
const inventory = inventorySource.entities || inventorySource.items || inventorySource.records || inventorySource;
let replacedGenericDescriptions = 0;
for (const entity of inventory) {
  if (isGenericInventoryPanelCopy(entity.description)) replacedGenericDescriptions += 1;
  const copy = resolveEntityPanelContent(entity, "resident");
  const narrative = [copy.context, copy.whyHeading, copy.whyBody, copy.insight].join(" ");
  assert.equal(genericPanelLanguage.test(narrative), false, `${entity.id}: inventory placeholder leaked into resident panel`);
  if (entity.name || entity.title) {
    const name = String(entity.name || entity.title);
    assert.ok(narrative.toLowerCase().includes(name.toLowerCase()), `${entity.id}: panel narrative must name its destination`);
  }
}
assert.ok(replacedGenericDescriptions > 1_000, "The full generated inventory placeholder set is covered by the resolver");

console.log(`Panel content audit passed for ${fixtures.length} partner families, all ${inventory.length} resident destinations (${replacedGenericDescriptions} generated placeholders replaced), authored-copy preservation, and Waterloo mode separation.`);
