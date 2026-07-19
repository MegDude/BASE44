import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const stylesheet = read("src/styles/canonical-surface-system.css");
const main = read("src/main.jsx");
const map = read("src/pages/Map.jsx");
const activePerks = read("src/components/map/ActivePerksSheet.jsx");
const nativePanelLock = read("src/styles/native-panel-surface-lock-final.css");
const premiumDrawer = read("src/styles/map-drawer-premium-regression-final.css");
const recovery = read("src/styles/dp-recovery-final.css");
const legendsSeoSnapshot = read("src/styles/legends-seo-snapshot-final.css");

const requiredTokens = [
  "--dp-surface-primary",
  "--dp-surface-border",
  "--dp-radius-control",
  "--dp-radius-card",
  "--dp-radius-panel",
  "--dp-shadow-panel",
  "--dp-motion-standard",
];

for (const token of requiredTokens) {
  if (!stylesheet.includes(token)) throw new Error(`Missing canonical token: ${token}`);
}

const importLine = 'import "@/styles/canonical-surface-system.css"';
if (!main.includes(importLine)) throw new Error("Canonical surface system is not imported");
const governedPostCanonicalLocks = [
  'import "@/styles/map-marker-governance-final.css"',
  'import "@/styles/search-intent-console-regression-lock.css"',
  'import "@/styles/accessibility-pin-art-final.css"',
  'import "@/styles/partner-workspace-deep-polish-final.css"',
  'import "@/styles/legends-seo-snapshot-final.css"',
  'import "@/styles/interface-density-regression-lock.css"',
  'import "@/styles/surface-containment-final.css"',
];
const stylesheetImports = main.match(/^import "@\/styles\/[^\n]+$/gm) || [];
const canonicalIndex = stylesheetImports.indexOf(importLine);
const importsAfterCanonical = stylesheetImports.slice(canonicalIndex + 1);
if (importsAfterCanonical.some((stylesheetImport) => !governedPostCanonicalLocks.includes(stylesheetImport))) {
  throw new Error("Only governed map and accessibility locks may follow the canonical surface system");
}

for (const selector of [
  ".dp-panel-shell",
  ".dp-map-detail-sheet",
  ".dp-active-perks-sheet",
  ".dp-entity-action-row",
  ".dp-entity-row",
  ".dp-native-detail-panel__section",
]) {
  if (!stylesheet.includes(selector)) throw new Error(`Missing shared surface selector: ${selector}`);
}

if (!map.includes("dp-map-detail-navigation-title")) throw new Error("Detail header does not expose one canonical title");
if (map.includes("transition={{ duration: 0.42")) throw new Error("Legacy 420ms detail-panel transition remains");
if (!map.includes('className="dp-entity-inline-links"')) throw new Error("Secondary property actions still compete with the primary action bar");
if (activePerks.includes('"28px 28px 0 0"')) throw new Error("Active Perks does not use the canonical panel radius");
if (activePerks.includes("dp-active-perk-map-icon")) throw new Error("Active Perks still overlays a boxed marker on the real image");
if (!activePerks.includes("const source = image || fallbackImage")) throw new Error("Active Perks does not prefer the canonical full-size image");
if (!stylesheet.includes("Images own their allotted media area")) throw new Error("Canonical full-bleed image treatment is missing");
if (!stylesheet.includes("border-radius: 0 !important;\n  background: transparent !important;\n  box-shadow: none !important;")) {
  throw new Error("Media wrappers still apply an inner box treatment");
}
if (nativePanelLock.includes("#dp-active-map-drawer#dp-active-map-drawer#dp-active-map-drawer {\n    max-width: 100vw !important;\n    border: 1px solid rgba(11, 31, 51, 0.08) !important;\n    border-bottom: 0 !important;\n    border-radius: 10px")) {
  throw new Error("Legacy mobile drawer radius overrides the canonical panel geometry");
}
if (premiumDrawer.includes(".dp-entity-action-row > .dp-entity-action.is-primary {\n  border-color: #c8a96a")) {
  throw new Error("Legacy gold primary entity action remains");
}
if (/\.dp-shore-home-rail,\s*\n\s*\.dp-entity-row-list/.test(recovery)) {
  throw new Error("Entity lists are still forced into the shared media-rail layout");
}
for (const protectedMapSelector of [".dp-map-page", ".dp-panel-shell", ".dp-detail-drawer", ".dp-active-perks-sheet"]) {
  if (legendsSeoSnapshot.includes(protectedMapSelector)) {
    throw new Error(`Legends SEO Snapshot styling leaks into the map panel system: ${protectedMapSelector}`);
  }
}

console.log("canonical surface system: tokens, import order, panel geometry, action hierarchy, and motion verified");
