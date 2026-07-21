import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../src/components/Layout.jsx", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const residentHome = readFileSync(new URL("../src/pages/ResidentHome.tsx", import.meta.url), "utf8");
const backStyles = readFileSync(new URL("../src/styles/global-back-control-final.css", import.meta.url), "utf8");
const surfaceStyles = readFileSync(new URL("../src/styles/borderless-panel-content-final.css", import.meta.url), "utf8");
const mapDrawerStyles = readFileSync(new URL("../src/styles/map-drawer-containment-final.css", import.meta.url), "utf8");
const qrStyles = readFileSync(new URL("../src/styles/resident-qr-modal-final.css", import.meta.url), "utf8");

assert.match(layout, /pageOwnsBackNavigation/, "Layout does not detect contextual Back controls");
assert.match(layout, /MutationObserver/, "Layout does not respond when contextual navigation changes");
assert.match(layout, /data-page-back/, "Layout does not support an explicit contextual Back contract");
assert.match(layout, /dp-layout-back-row/, "Layout fallback Back row is missing");
assert.match(layout, /navigate\(-1\)/, "Layout Back does not preserve browser history");
assert.match(layout, /location\.key !== "default"/, "Direct-entry fallback is not distinguished from routed history");
assert.match(layout, /usesPersistentProductNavigation/, "Persistent product shells are not protected from duplicate Back controls");

assert.match(residentHome, /className="dp-resident-header-back"/, "Resident subpanels do not use the compact Back action");
assert.match(residentHome, /data-page-back="true"/, "Resident Back action is not registered as contextual navigation");
assert.match(residentHome, /<ArrowLeft aria-hidden="true" \/>/, "Resident Back action is missing its directional icon");
assert.match(residentHome, /className="dp-resident-home-close"/, "Resident Home does not provide a close action");
assert.match(residentHome, /aria-label="Close resident home"/, "Resident Home close action is not accessible");
assert.match(residentHome, /location\.key !== "default"[\s\S]*navigate\(-1\)[\s\S]*\/map\?mode=resident&tab=map&filter=All/, "Resident Home close action does not preserve history or provide a direct-entry fallback");
assert.doesNotMatch(residentHome, />Done<|>Done<\/button>/, "The vague Done action remains in Resident Home");

assert.match(backStyles, /\.dp-layout-back/, "Shared Back control styling is missing");
assert.match(backStyles, /min-height:\s*44px/, "Shared Back control does not keep an accessible target");
assert.match(backStyles, /font-size:\s*12px\s*!important/, "Shared Back label is not visually compact");
assert.match(backStyles, /width:\s*15px\s*!important[\s\S]*height:\s*15px\s*!important/, "Shared Back icon is oversized");
const styleImports = [...main.matchAll(/import\s+"@\/styles\/[^"]+"/g)];
assert.equal(
  styleImports.at(-1)?.[0],
  'import "@/styles/global-back-control-final.css"',
  "Shared Back control contract must be the final stylesheet import",
);
assert.match(surfaceStyles, /\.dp-resident-header-back/, "Resident Back polish is missing from the final surface lock");
assert.match(surfaceStyles, /border-radius:\s*0\s*!important/, "Resident Back action can regress to a pill");
assert.match(mapDrawerStyles, /:is\(\.dp-panel-back, \.dp-panel-close\)[\s\S]*width:\s*44px\s*!important/, "Map drawer Back control lost its 44px target");
assert.match(mapDrawerStyles, /:is\(\.dp-panel-back, \.dp-panel-close\)[\s\S]*border-radius:\s*0\s*!important/, "Map drawer Back control can regress to a rounded block");
assert.match(qrStyles, /:is\(\.dp-resident-qr-back, \.dp-resident-qr-close\) svg[\s\S]*width:\s*15px\s*!important/, "Resident pass Back icon is oversized");

console.log("Global and resident Back navigation contracts passed.");
