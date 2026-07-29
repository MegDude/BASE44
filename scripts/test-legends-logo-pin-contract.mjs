import fs from "node:fs";
import assert from "node:assert/strict";

const registry = fs.readFileSync("src/lib/map/mapIconRegistry.ts", "utf8");
const map = fs.readFileSync("src/pages/Map.jsx", "utf8");

assert.match(registry, /if \(registryKey === "legends"\) return pin\.glyph/);
assert.match(registry, /dp-live-pin__legends-logo/);
assert.match(registry, /LEGENDS_PIN_ASSET = "\/pins\/downtown-perks\/legends-logo-gold\.svg"/);
assert.match(map, /const iconKey = normalizeMapIconKey\(pin\.label\)/);
assert.match(map, /const iconSvg = getCanonicalMapGlyph\(pin\)/);
assert.match(map, /isLegendsListingLike\(place\)/);
assert.match(map, /Legends Real Estate Founding Partner/);
assert.match(map, /Led by Nina Seely/);

console.log("Legends logo pin and profile contract verified.");
