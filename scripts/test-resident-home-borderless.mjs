import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Resident Home is one uninterrupted white surface";
const lockStart = styles.indexOf(marker);
const borderlessLock = styles.slice(lockStart);

assert.ok(lockStart >= 0, "Resident Home borderless surface lock is missing");
assert.match(borderlessLock, /\.dp-resident-home\.dp-resident-home\[data-panel="home"\] \*/, "The borderless contract does not cover every Home descendant");
assert.match(borderlessLock, /border:\s*0\s*!important;/, "Resident Home still permits borders");
assert.match(borderlessLock, /outline:\s*0\s*!important;/, "Resident Home still permits outline chrome");
assert.match(borderlessLock, /box-shadow:\s*none\s*!important;/, "Resident Home still permits bordered shadow substitutes");
assert.match(borderlessLock, /:focus-visible[\s\S]*color:\s*#9a7a3e\s*!important;/i, "Keyboard focus does not retain a visible borderless state");

console.log("Resident Home uses one borderless bright-white surface: PASS");
