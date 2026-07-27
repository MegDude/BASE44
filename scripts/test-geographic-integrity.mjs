import assert from "node:assert/strict";
import fs from "node:fs";

const coordinateSource = fs.readFileSync(
  new URL("../src/lib/map/coordinateValidation.ts", import.meta.url),
  "utf8",
);
const registrySource = fs.readFileSync(
  new URL("../src/data/map/mapEntityRegistry.ts", import.meta.url),
  "utf8",
);
const aliasSource = fs.readFileSync(
  new URL("../src/lib/mapEntityAliases.js", import.meta.url),
  "utf8",
);
const markerManagerSource = fs.readFileSync(
  new URL("../src/map/MarkerManager.ts", import.meta.url),
  "utf8",
);
const mapSource = fs.readFileSync(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");

assert.match(
  coordinateSource,
  /!\(lat === 0 && lng === 0\)/,
  "zero-value coordinates must be rejected",
);
assert.match(
  coordinateSource,
  /export function isWithinAustinArea/,
  "public coordinates must pass the configured Austin-area boundary",
);
assert.match(
  registrySource,
  /function isPublicMapEntity[\s\S]*?entity\.active && isWithinAustinArea\(entity\.lat, entity\.lng\)/,
  "the public map registry must use the shared geographic gate",
);
assert.match(
  registrySource,
  /filterEntitiesByIntent\(registry, intent\)\.filter\(isPublicMapEntity\)/,
  "search intent results must not bypass the public geographic gate",
);

for (const alias of ["the-shore", "priority-the-shore", "shore-condos", "shore-building", "shore-property", "603-davis", "603-davis-st"]) {
  assert.match(
    aliasSource,
    new RegExp(`"${alias}":\\s*"property-the-shore"`),
    `${alias} must resolve to the canonical Shore property`,
  );
}
assert.doesNotMatch(
  aliasSource,
  /"parking-the-shore-evening":\s*"property-the-shore"/,
  "The Shore parking must remain a child entity, not a property alias",
);

assert.match(
  markerManagerSource,
  /position,[\s\S]*?gmpDraggable:\s*false/,
  "Google markers must be created from canonical coordinates and remain non-draggable",
);
assert.match(
  mapSource,
  /const markerRegistryRef = useRef\(new Map\(\)\)/,
  "marker instances must use a stable entity registry",
);
assert.doesNotMatch(
  markerManagerSource,
  /\b(top|left|translateX|translateY)\b/,
  "the map adapter must not position markers with viewport CSS",
);

console.log("Geographic integrity and Shore alias checks passed.");
