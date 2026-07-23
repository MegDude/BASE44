import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const css = readFileSync("src/styles/search-intent-expanded-readability-final.css", "utf8");

assert.ok(
  main.includes('import "@/styles/search-intent-expanded-readability-final.css"'),
  "expanded intent readability stylesheet must be loaded",
);
assert.match(css, /data-expanded="true"[\s\S]*color:\s*#0b1f33\s*!important;/i, "expanded intent labels must use dark navy");
assert.match(css, /aria-expanded="true"[\s\S]*color:\s*#0b1f33\s*!important;/i, "expanded More control must use dark navy");
assert.match(css, /\.dp-search-intent-secondary-track button[\s\S]*color:\s*#0b1f33\s*!important;/i, "partner and resident secondary rail buttons must remain readable");
assert.match(css, /stroke:\s*currentColor\s*!important;/i, "expanded intent icons must inherit the readable text color");

console.log("Expanded resident and partner intent rails use readable dark text: PASS");
