import assert from "node:assert/strict";
import { cleanPublicMapTitle, launchMapPinToPlace } from "../src/data/imports/launchMapPins.js";

assert.equal(cleanPublicMapTitle("citizenM Austin Downtown — guest guide anchor"), "citizenM Austin Downtown");
assert.equal(cleanPublicMapTitle("Hotel Van Zandt - hotel guest anchor"), "Hotel Van Zandt");
assert.equal(cleanPublicMapTitle("Waterloo Greenway — route anchor"), "Waterloo Greenway");

const citizenM = launchMapPinToPlace({
  id: "launch-dp-pin-94d920bcbc",
  pinId: "dp-pin-94d920bcbc",
  publicDisplayTitle: "citizenM Austin Downtown — guest guide anchor",
  name: "citizenM Austin Downtown — guest guide anchor",
  publicCategory: "Hotels",
  category: "Hotels",
  pinType: "hotel_guest_pin",
  districtOrNeighborhood: "Downtown Core",
  latitude: 30.267,
  longitude: -97.739,
  hasExactMarker: true,
  recommendedTags: [],
  searchKeywords: [],
});

assert.equal(citizenM.title, "citizenM Austin Downtown");
assert.equal(citizenM.name, "citizenM Austin Downtown");
assert.match(citizenM.summary, /compact downtown hotel/i);
assert.match(citizenM.description, /Congress Avenue/i);
assert.equal(citizenM.primaryAction, "Explore nearby");
assert.ok(citizenM.searchKeywords.includes("citizenM Austin Downtown"));

console.log("Launch map public-copy contract passed.");
