import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/styles/native-detail-panel-action-lock.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

assert.match(css, /\.dp-native-detail-panel__actions[\s\S]*position:\s*sticky\s*!important/, "detail panel actions remain anchored inside the drawer");
assert.match(css, /\.dp-native-detail-panel__actions[\s\S]*overflow:\s*visible\s*!important/, "detail panel action rail does not scroll");
assert.doesNotMatch(css, /\.dp-native-detail-panel__actions[\s\S]*overflow-(?:x|y):\s*auto/, "detail panel action rail cannot inherit scrolling");
assert.match(css, /min-height:\s*44px\s*!important/, "panel actions retain an iOS-safe touch target");
assert.match(css, /@media \(max-width:\s*374px\)/, "narrow 320px and 375px layouts receive explicit spacing protection");
assert.ok(main.includes('import "@/styles/native-detail-panel-action-lock.css"'), "final action lock loads after the shared panel styles");

console.log("Native detail panel action lock contract passed.");
