import assert from "node:assert/strict";
import { resolvePartnerPanelCopy } from "../src/lib/partner/partnerPanelContent.js";
import { resolveEntityPanelContent } from "../src/lib/map/entityPanelArchetypes.js";

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

console.log(`Partner panel content audit passed for ${fixtures.length} audience families, Waterloo resident/partner separation, and backend overrides.`);
