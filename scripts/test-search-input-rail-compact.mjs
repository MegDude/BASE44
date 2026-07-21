import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles/search-input-rail-compact-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(css, /height:\s*46px\s*!important/, "search rail is not compact");
assert.match(css, /padding:\s*0 0 0 12px\s*!important/, "search rail retains trailing space after submit");
assert.match(css, /flex:\s*0 0 44px\s*!important/, "submit control does not preserve a compact touch target");
assert.match(css, /border-radius:\s*0 11px 11px 0\s*!important/, "submit control is not flush with the rail edge");
assert.match(css, /font-size:\s*16px\s*!important/, "search type remains oversized");
assert.ok(main.indexOf('search-input-rail-compact-final.css') > main.indexOf('inkind-redemption-compact-final.css'), "compact search rail authority must load last");

console.log("Search input rail is compact and ends flush at the submit control: PASS");
