import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const panel = readFileSync("src/components/map/CanonicalDetailPanel.jsx", "utf8");
const styles = readFileSync("src/styles/detail-panel-fixed-actions-final.css", "utf8");

assert.match(map, /function isBangersVenue\(place\)/, "Banger's canonical venue resolver is missing");
assert.match(map, /if \(isBangersVenue\(place\)\) return "place";/, "Banger's panel kind is not locked to the canonical place schema");
assert.match(map, /if \(isBangersVenue\(place\)\) \{\s*return "venue";/s, "Banger's resident entity kind is not locked to venue");
assert.match(map, /Restaurant & beer garden/, "Banger's canonical venue identity is missing");
assert.match(map, /if \(isBangersVenue\(entity\)\) return "\/images\/map-entities\/attached\/venues\/bangers\.jpg";/, "Banger's verified fallback media is missing");
assert.match(map, /title=\{isBangersVenue\(place\) \? "Resident perk" : "Happy Hour"\}/, "Banger's perk is not represented as child content");
assert.match(map, /<DrawerActionFooter label=\{`\$\{place\.name\} actions`\}/, "Banger's actions still render inside scrolling content");
assert.match(panel, /createPortal\(actions, drawerHost\)/, "Canonical category actions are not portaled to the drawer shell");
assert.match(styles, /> \.dp-canonical-detail-actions/, "The shell footer selector is not direct-child scoped");
assert.match(styles, /grid-template-rows:\s*auto minmax\(0, 1fr\) auto/, "The drawer does not reserve a dedicated footer row");
assert.doesNotMatch(styles, /position:\s*fixed\s*!important/, "The footer still uses viewport-fixed positioning and can be clipped");

console.log("Banger's venue identity, child perk, verified media resolver, and universal drawer footer contract: PASS");
