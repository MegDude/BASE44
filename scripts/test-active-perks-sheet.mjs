import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const sheetSource = await readFile(new URL("../src/components/map/ActivePerksSheet.jsx", import.meta.url), "utf8");
const panelNavigationSource = await readFile(new URL("../src/hooks/useMapPanelNavigation.ts", import.meta.url), "utf8");
const sheetCss = await readFile(new URL("../src/styles/active-perks-sheet.css", import.meta.url), "utf8");
const geometryCss = await readFile(new URL("../src/styles/native-drawer-geometry-final.css", import.meta.url), "utf8");
const shellSource = await readFile(new URL("../src/components/map/NativeDrawerShell.jsx", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");

assert.match(mapSource, /"Featured"/, "Featured must remain a canonical resident filter");
assert.match(mapSource, /discoverDisplayPlaces\s*\.filter\(\(place\) => hasActivePerkData\(place\)\)\s*\.slice\(0,\s*40\)/s, "active perks must be derived from canonical map data and capped at 40");
assert.match(mapSource, /getCanonicalResidentPerkId/, "perk selection must use the canonical perk resolver");
assert.match(mapSource, /tab: "map", entityId:[^\n]+perkId: nextPerkId/, "perk rows must write entity and perk context into the canonical map URL");
assert.match(mapSource, /openResidentQrModal\(item\.place/, "Redeem must use the existing resident QR workflow");
assert.match(mapSource, /toggleSaved\(item\.place\)/, "Save must use the existing saved-place workflow");
assert.match(mapSource, /pin:\s*resolveEntityPin\(place\)/, "perk rows must use the canonical map icon resolver");

assert.match(sheetSource, /<NativeDrawerShell/);
assert.match(shellSource, /role="dialog"/);
assert.match(shellSource, /aria-modal="true"/);
assert.match(sheetSource, /aria-label="Active perks"/);
assert.match(sheetSource, /aria-live="polite"/);
assert.match(sheetSource, /aria-label="Close active perks"/);
assert.match(sheetSource, /aria-pressed=\{saved\}/);
assert.match(sheetSource, /loading="lazy"/);
assert.match(sheetSource, /decoding="async"/);
assert.match(sheetSource, /alt=""/);
assert.doesNotMatch(sheetSource, /dp-active-perk-fallback/, "letter-tile media fallbacks are forbidden");
assert.doesNotMatch(sheetSource, /dp-active-perk-map-icon/, "map icons must not overlay the real image");
assert.match(sheetSource, /const source = image \|\| fallbackImage/, "the real image must be preferred over a direct logo fallback");
assert.match(sheetSource, /dp-active-perk-main\$\{item\.image \|\| item\.pin\?\.asset \? " has-media"/, "rows without media must not reserve an empty image box");
assert.match(sheetSource, /<\/button>\s*<div className="dp-active-perk-actions"/, "row selection and actions must be sibling controls");

assert.match(panelNavigationSource, /scrollTop/);
assert.match(panelNavigationSource, /focusId/);
assert.match(panelNavigationSource, /window\.sessionStorage/, "panel history must survive refresh when storage is available");

assert.match(geometryCss, /data-drawer-state="expanded"/);
assert.match(geometryCss, /var\(--dp-bottom-nav-total-height\)/);
assert.match(sheetCss, /min-(?:width|height):\s*44px/);
assert.match(sheetCss, /width:\s*72px/);
assert.match(sheetCss, /max-width:\s*760px/);
assert.doesNotMatch(sheetCss, /#[0-9a-f]{3,8}/i, "the sheet stylesheet must use design tokens only");
assert.doesNotMatch(sheetCss, /border-radius:\s*(?:999|9999)px/i, "pill geometry is forbidden");
assert.match(mainSource, /styles\/active-perks-sheet\.css/, "the canonical sheet stylesheet must be loaded globally");
assert.match(mainSource, /styles\/native-drawer-geometry-final\.css/, "the shared drawer geometry must be loaded globally");

console.log("Active perks sheet regression checks passed.");
