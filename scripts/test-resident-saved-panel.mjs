import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/pages/ResidentHome.tsx", "utf8");
const styles = readFileSync("src/styles/resident-home-headline-lock-final.css", "utf8");
const marker = "/* Saved Perks uses the same uninterrupted white plane";
const contract = styles.slice(styles.indexOf(marker));

assert.ok(contract.startsWith(marker), "Saved Perks surface contract must remain available");
assert.match(page, /<p>Saved perks<\/p>/, "Saved Perks intro must identify the panel clearly");
assert.match(page, /<h2 id="saved-perks-title">Ready when you are\.<\/h2>/, "Saved Perks headline must remain concise");
assert.match(page, /className="dp-resident-saved-row"/, "Each saved perk must use the complete row as its action");
assert.doesNotMatch(page, /Featured Austin Fc|Partner Jos Coffee|Partner Half Step/, "Raw saved IDs must never appear as resident-facing names");

for (const fragment of [
  '"FC"',
  '"Jo\'s"',
  '.replace(/^(?:(?:place|perk|venue|event|entity|partner|featured)-)+/i, "")',
]) {
  assert.ok(page.includes(fragment), `Saved-name normalization must retain ${fragment}`);
}

for (const declaration of [
  "background: #ffffff !important;",
  "border: 0 !important;",
  "box-shadow: none !important;",
  "text-overflow: ellipsis !important;",
  "white-space: nowrap !important;",
]) {
  assert.ok(contract.includes(declaration), `Saved Perks contract must preserve ${declaration}`);
}

assert.match(
  contract,
  /(?:#root){12}[^\n]+\.dp-resident-saved-list article\s*\{[\s\S]*?border:\s*0\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/,
  "Saved rows must outrank the legacy card treatment",
);

console.log("Resident Saved Perks panel uses canonical names and one clean white surface: PASS");
