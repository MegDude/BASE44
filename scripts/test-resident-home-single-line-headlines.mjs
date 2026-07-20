import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync("src/styles/resident-home-headline-lock-final.css", "utf8");
const entry = readFileSync("src/main.jsx", "utf8");
const page = readFileSync("src/pages/ResidentHome.tsx", "utf8");
const marker = "/* Resident Home headline rhythm.";
const markerIndex = styles.indexOf(marker);

assert.ok(markerIndex >= 0, "Resident Home headline lock must remain in the terminal stylesheet");
assert.match(
  entry,
  /resident-home-headline-lock-final\.css"\s*import "@\/styles\/canonical-surface-system\.css"/,
  "Resident Home headline lock must load before the governed surface cascade",
);

const contract = styles.slice(markerIndex);

for (const selector of [
  ".dp-resident-section-title > h2",
  ".dp-resident-live-activity > div:last-child > a strong",
  ".dp-resident-home__saved-rows > button strong",
  ".dp-resident-home__compact-list > div:last-child > a strong",
  ".dp-resident-route-list > a strong",
  ".dp-resident-directory-list > a strong",
  ".dp-resident-shared-amenity h2",
  ".dp-resident-dana-question h2",
]) {
  assert.ok(contract.includes(selector), `Headline contract must cover ${selector}`);
}

for (const declaration of [
  "min-width: 0 !important;",
  "overflow: hidden !important;",
  "text-overflow: ellipsis !important;",
  "white-space: nowrap !important;",
  "line-height: 1.25 !important;",
]) {
  assert.ok(contract.includes(declaration), `Headline contract must preserve ${declaration}`);
}

assert.match(page, /DAA Art & Parks Walk/, "The DAA route must remain in Resident Home");
assert.match(
  page,
  /Waterloo Greenway weekend festival/,
  "The Waterloo Greenway feature headline must remain in Resident Home",
);

console.log("Resident Home single-line headline contract verified.");
