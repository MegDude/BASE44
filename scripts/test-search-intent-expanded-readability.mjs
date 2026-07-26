import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const css = readFileSync("src/styles/search-intent-expanded-readability-final.css", "utf8");

const cohesionImport = 'import "@/styles/platform-panel-cohesion-final.css"';
const readabilityImport = 'import "@/styles/search-intent-expanded-readability-final.css"';
const cohesionIndex = main.lastIndexOf(cohesionImport);
const readabilityIndex = main.lastIndexOf(readabilityImport);

assert.ok(readabilityIndex >= 0, "Expanded search intent readability stylesheet must be loaded");
assert.ok(cohesionIndex >= 0, "Platform panel cohesion stylesheet must be loaded");
assert.ok(
  readabilityIndex > cohesionIndex,
  "Expanded search intent readability stylesheet must load after platform cohesion overrides",
);
assert.match(css, /data-expanded="true"[\s\S]*color:\s*#0b1f33\s*!important;/i, "Expanded intent labels must stay dark");
assert.match(css, /dp-search-intent-secondary-track[\s\S]*button[\s\S]*color:\s*#0b1f33\s*!important;/i, "Secondary rail controls must stay dark");
assert.match(css, /stroke:\s*currentColor\s*!important;/i, "Expanded intent icons must inherit readable text color");
assert.match(css, /-webkit-text-fill-color:\s*#0b1f33\s*!important;/i, "WebKit text fill must remain dark on iOS");

console.log("Expanded resident and partner search intent controls remain dark and readable after final cascade: PASS");