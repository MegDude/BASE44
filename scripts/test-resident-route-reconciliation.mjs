import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.jsx", "utf8");
const registry = readFileSync("src/components/map/mobileTabRegistry.ts", "utf8");
const homeRegistryRow = registry.split("\n").find((line) => line.includes('{ id: "home", label: "Home"')) || "";

assert.match(app, /path="\/resident" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "/resident does not enter the canonical resident map");
assert.match(app, /path="\/resident\/home" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "/resident/home does not enter the canonical resident map");
assert.match(app, /path="\/resident\/\*" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "unknown resident routes are not normalized to the resident map");
assert.doesNotMatch(app, /<ResidentHome \/>/, "standalone Resident Home remains exposed");
assert.doesNotMatch(homeRegistryRow, /Ask Downtown/, "mobile registry still advertises Ask Downtown on Home");
assert.doesNotMatch(homeRegistryRow, /Walking routes/, "mobile registry still advertises walking routes on Home");
assert.match(homeRegistryRow, /sections: \["Personal briefing", "Primary actions", "Happening now", "Resident benefits", "Civic inbox", "Saved and upcoming", "Recent activity"\]/, "mobile registry does not match the rebuilt Home");

console.log("Standalone resident routes reconcile into the canonical resident map: PASS");
