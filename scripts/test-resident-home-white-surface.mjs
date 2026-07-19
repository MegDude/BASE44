import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Resident Home owns one continuous bright-white plane";
const lockStart = styles.indexOf(marker);
const lockEnd = styles.indexOf("Partner workspace governance", lockStart);
const residentSurfaceLock = styles.slice(lockStart, lockEnd);

assert.ok(residentSurfaceLock.startsWith(marker), "Resident Home white-surface lock is missing");
assert.equal(
  (main.match(/^import "@\/styles\/[^"]+"$/gm) || []).at(-1),
  'import "@/styles/interface-density-regression-lock.css"',
  "Resident Home surface lock must remain in the final stylesheet",
);
assert.match(residentSurfaceLock, /\.dp-resident-home\.dp-resident-home\[data-panel="home"\][\s\S]*?background:\s*#ffffff\s*!important;/, "Resident Home does not own a bright-white page surface");
assert.match(residentSurfaceLock, /\.dp-resident-command-nav\.dp-resident-command-nav[\s\S]*?backdrop-filter:\s*none\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home header still permits blur or glow");
assert.match(residentSurfaceLock, /\.dp-resident-ai-concierge,[\s\S]*?\.dp-resident-directory-list[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home sections still permit elevated card styling");
assert.match(residentSurfaceLock, /\.dp-resident-category-rail\s*>\s*a[\s\S]*?border-bottom:\s*1px solid/, "Resident Home quick actions do not use simple row dividers");
const shadowValues = [...residentSurfaceLock.matchAll(/box-shadow:\s*([^;]+)!important/g)].map((match) => match[1].trim());
assert.ok(shadowValues.length > 0 && shadowValues.every((value) => value === "none"), "Resident Home white-surface lock introduces a shadow");

console.log("Resident Home uses one bright-white surface without section shading or glow: PASS");
