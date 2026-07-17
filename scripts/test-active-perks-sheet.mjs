import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const mapSource = readFileSync(resolve(root, "src/pages/Map.jsx"), "utf8");
const styles = readFileSync(resolve(root, "src/styles/active-perks-sheet.css"), "utf8");
const mainSource = readFileSync(resolve(root, "src/main.jsx"), "utf8");

const expectations = [
  ["canonical Active Perks sheet", mapSource.includes('aria-label={isLegendsDirectoryLayer') && mapSource.includes('? "Active perks"')],
  ["compact header", mapSource.includes('className="dp-perks-sheet-header"')],
  ["resident-benefits hierarchy", mapSource.includes('Resident benefits') && mapSource.includes('<h2>Active perks</h2>')],
  ["live nearby count", mapSource.includes('dp-perks-sheet-count') && mapSource.includes('aria-live="polite"')],
  ["dense perk rows", mapSource.includes('className="dp-perk-row"') && mapSource.includes('className="dp-perk-row-main"')],
  ["lazy decorative thumbnails", mapSource.includes('className="dp-perk-row-image"') && mapSource.includes('alt=""') && mapSource.includes('loading="lazy"')],
  ["separate accessible actions", mapSource.includes('className="dp-perk-action-primary"') && mapSource.includes('className="dp-perk-icon-action"')],
  ["saved state", mapSource.includes('aria-pressed={savedIds.has(place.id)}')],
  ["perk deep link", mapSource.includes('perkId: isResidentPerkSelection ? place.id : ""')],
  ["medium entry state", mapSource.includes('tab === "perks" ? "medium" : "expanded"')],
  ["design-token-only stylesheet", !/(?:#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\s*\()/i.test(styles)],
  ["no pill radius", !/(?:999|9999)px|rounded-full/i.test(styles)],
  ["no nested utility panel", !/utility-panel|offer-card|offer-stack/i.test(styles)],
  ["stylesheet loaded", mainSource.includes("@/styles/active-perks-sheet.css")],
];

const failures = expectations.filter(([, passes]) => !passes);
if (failures.length) {
  for (const [label] of failures) console.error(`FAIL ${label}`);
  process.exit(1);
}

console.log(`Active Perks sheet: PASS (${expectations.length} checks)`);
