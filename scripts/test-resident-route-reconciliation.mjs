import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.jsx", "utf8");
const registry = readFileSync("src/components/map/mobileTabRegistry.ts", "utf8");

assert.match(app, /path="\/resident" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "/resident does not enter the canonical resident map");
assert.doesNotMatch(app, /const ResidentHome = lazy\(/, "Resident Home must not load as a separate resident application");
assert.match(app, /path="\/resident\/home" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "/resident/home does not return to the canonical resident map");
assert.match(app, /path="\/resident\/\*" element={<Navigate to=\{DEFAULT_RESIDENT_MAP_PATH\} replace \/>}/, "unknown resident routes are not normalized to the resident map");
assert.match(app, /path="\/resident\/card" element={<Navigate to="\/map\?mode=resident&tab=pass" replace \/>}/, "resident Card does not use the canonical pass state");
assert.match(registry, /route: "\/map\?mode=resident&tab=pass"/, "mobile Card registry does not use canonical pass state");

console.log("Resident map gateway and canonical Card routes reconcile: PASS");
