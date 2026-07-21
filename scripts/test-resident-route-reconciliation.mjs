import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("src/App.jsx", "utf8");
const registry = readFileSync("src/components/map/mobileTabRegistry.ts", "utf8");
const home = readFileSync("src/pages/ResidentHome.tsx", "utf8");
const homeRegistryRow = registry.split("\n").find((line) => line.includes('{ id: "home", label: "Home"')) || "";

assert.match(app, /path="\/resident" element={<RedirectWithSearch to="\/resident\/home" \/>}/, "/resident does not enter the canonical Resident Home");
assert.match(app, /path="\/resident\/home" element={<ResidentHome \/>}/, "canonical Resident Home route is missing");
assert.doesNotMatch(homeRegistryRow, /Ask Downtown/, "mobile registry still advertises Ask Downtown on Home");
assert.doesNotMatch(homeRegistryRow, /Walking routes/, "mobile registry still advertises walking routes on Home");
assert.match(homeRegistryRow, /sections: \["Personal briefing", "Primary actions", "Happening now", "Resident benefits", "Civic inbox", "Saved and upcoming", "Recent activity"\]/, "mobile registry does not match the rebuilt Home");
assert.match(home, />Open map<\/span>/, "Open map action is missing");
assert.match(home, />Show resident pass<\/span>/, "Resident Pass action is missing");
assert.match(home, />Civic inbox<\/span>/, "Civic Inbox action is missing");

console.log("/resident and /resident/home share one canonical resident experience: PASS");
