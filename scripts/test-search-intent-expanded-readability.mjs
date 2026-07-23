import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const css = readFileSync("src/styles/search-intent-expanded-readability-final.css", "utf8");

assert.ok(
  main.includes('import "@/styles/search-intent-expanded-readability-final.css"'),
  "Expanded search intent readability stylesheet must be loaded",
);
assert.match(css, /data-expanded="true"[\s\S]*color:\s*#0b1f33\s*!important;/i, "Expanded intent labels must stay dark");
assert.match(css, /dp-search-intent-secondary-track[\s\S]*button[\s\S]*color:\s*#0b1f33\s*!important;/i, "Secondary rail controls must stay dark");
assert.match(css, /stroke:\s*currentColor\s*!important;/i, "Expanded intent icons must inherit readable text color");

console.log("Expanded resident and partner search intent controls remain dark and readable: PASS");
