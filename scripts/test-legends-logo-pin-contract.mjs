import fs from "node:fs";
import assert from "node:assert/strict";

const registry = fs.readFileSync("src/lib/map/mapIconRegistry.ts", "utf8");
const map = fs.readFileSync("src/pages/Map.jsx", "utf8");
const listingData = fs.readFileSync("src/data/legendsListings.js", "utf8");
const propertyData = fs.readFileSync("src/data/legendsPropertyContent.js", "utf8");
const propertyDataTs = fs.readFileSync("src/data/legendsPropertyContent.ts", "utf8");
const generatedListings = fs.readFileSync("src/data/legends_full_listings_generated.csv", "utf8");
const useLocations = fs.readFileSync("src/lib/useLocations.js", "utf8");

assert.match(registry, /if \(registryKey === "legends"\) return pin\.glyph/);
assert.match(registry, /dp-live-pin__legends-logo/);
assert.match(registry, /LEGENDS_PIN_ASSET = "\/pins\/downtown-perks\/legends-logo-gold\.svg"/);
assert.match(listingData, /LEGENDS_PIN_ASSET = "\/pins\/downtown-perks\/legends-logo-gold\.svg"/);
assert.match(propertyData, /\/pins\/downtown-perks\/legends-logo-gold\.svg/);
assert.match(propertyDataTs, /\/pins\/downtown-perks\/legends-logo-gold\.svg/);
assert.match(generatedListings, /legends-logo-gold\.svg/);
assert.match(useLocations, /\/pins\/downtown-perks\/legends-logo-gold\.svg/);
assert.match(map, /const iconKey = normalizeMapIconKey\(pin\.label\)/);
assert.match(map, /const iconSvg = getCanonicalMapGlyph\(pin\)/);
assert.match(map, /isLegendsListingLike\(place\)/);
assert.match(map, /Legends Real Estate Founding Partner/);
assert.match(map, /Led by Nina Seely/);
for (const [name, source] of Object.entries({ registry, map, listingData, propertyData, propertyDataTs, generatedListings, useLocations })) {
  assert.doesNotMatch(source, /legends-logo\.png|legends-butterfly\.png|legends-logo\.avif/, `${name} must not reference unapproved Legends logo variants`);
}

console.log("Legends logo pin and profile contract verified.");
