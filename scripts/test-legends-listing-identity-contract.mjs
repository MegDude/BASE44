import fs from "node:fs";
import assert from "node:assert/strict";

const map = fs.readFileSync("src/pages/Map.jsx", "utf8");

assert.match(map, /isLegendsListingLike\(place\)/);
assert.match(map, /isListingPanel \? inquiryListing\?\.address/);
assert.match(map, /resolvedLegendsListing && !isPropertyEntity\(place\)/);
assert.doesNotMatch(map, /!luxuryBuilding && resolvedLegendsListing/);
assert.match(map, /Listing actions/);
assert.match(map, /Request tour/);
assert.match(map, /BuildingExperienceModule/);

console.log("Legends listing and parent-building identity contract verified.");
