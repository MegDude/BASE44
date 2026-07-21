import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/interface-density-regression-lock.css", "utf8");
const marker = "Resident Home owns one continuous bright-white plane";
const lockStart = styles.indexOf(marker);
const lockEnd = styles.indexOf("Partner workspace governance", lockStart);
const residentSurfaceLock = styles.slice(lockStart, lockEnd);
const terminalMarker = "Platform overlay surface terminal authority";
const terminalStart = styles.indexOf(terminalMarker);
const terminalLock = styles.slice(terminalStart);

assert.ok(residentSurfaceLock.startsWith(marker), "Resident Home white-surface lock is missing");
assert.ok(terminalLock.startsWith(terminalMarker), "Resident Home terminal white-surface authority is missing");
assert.equal(
  (main.match(/^import "@\/styles\/[^"]+"$/gm) || []).at(-1),
  'import "@/styles/resident-home-ios-native-final.css"',
  "Resident Home surface lock must remain in the final stylesheet",
);
assert.match(residentSurfaceLock, /\.dp-resident-home\.dp-resident-home\[data-panel="home"\][\s\S]*?background:\s*#ffffff\s*!important;/, "Resident Home does not own a bright-white page surface");
assert.match(residentSurfaceLock, /\.dp-resident-command-nav\.dp-resident-command-nav[\s\S]*?backdrop-filter:\s*none\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home header still permits blur or glow");
assert.match(residentSurfaceLock, /\.dp-resident-ai-concierge,[\s\S]*?\.dp-resident-directory-list[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home sections still permit elevated card styling");
assert.match(residentSurfaceLock, /\.dp-resident-category-rail\s*>\s*a[\s\S]*?border-bottom:\s*1px solid/, "Resident Home quick actions do not use simple row dividers");
const shadowValues = [...residentSurfaceLock.matchAll(/box-shadow:\s*([^;]+)!important/g)].map((match) => match[1].trim());
assert.ok(shadowValues.length > 0 && shadowValues.every((value) => value === "none"), "Resident Home white-surface lock introduces a shadow");
assert.match(terminalLock, /\.dp-resident-native-tabs\.dp-resident-native-tabs\s*\{[\s\S]*?background:\s*#ffffff\s*!important;[\s\S]*?backdrop-filter:\s*none\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home navigation still permits translucency or glow");
assert.match(terminalLock, /\.dp-resident-hero-card::before,[\s\S]*?\.dp-resident-hero-card::after\s*\{[\s\S]*?display:\s*none\s*!important;[\s\S]*?background:\s*none\s*!important;/, "Resident Home hero still permits a shaded overlay");
assert.match(terminalLock, /\.dp-resident-search-entry,[\s\S]*?\.dp-resident-directory-list\s*>\s*a[\s\S]*?background:\s*transparent\s*!important;[\s\S]*?box-shadow:\s*none\s*!important;/, "Resident Home nested surfaces still permit shading or glow");
const terminalShadowValues = [...terminalLock.matchAll(/box-shadow:\s*([^;]+)!important/g)].map((match) => match[1].trim());
assert.ok(terminalShadowValues.length > 0 && terminalShadowValues.every((value) => value === "none"), "Resident Home terminal authority introduces a shadow or glow");

console.log("Resident Home uses one bright-white surface without section shading or glow: PASS");
