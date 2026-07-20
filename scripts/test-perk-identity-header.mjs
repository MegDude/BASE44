import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mapSource = await readFile(new URL("../src/pages/Map.jsx", import.meta.url), "utf8");
const detailSource = await readFile(new URL("../src/components/map/CanonicalDetailPanel.jsx", import.meta.url), "utf8");
const identitySource = await readFile(new URL("../src/components/map/PerkIdentityHeader.jsx", import.meta.url), "utf8");
const activePerksSource = await readFile(new URL("../src/components/map/ActivePerksSheet.jsx", import.meta.url), "utf8");
const identityCss = await readFile(new URL("../src/styles/perk-identity-header-final.css", import.meta.url), "utf8");

assert.match(activePerksSource, /className=\{`dp-active-perks-sheet is-\$\{drawerState\}`\}/);
assert.match(activePerksSource, /<p>Resident benefits<\/p>\s*<h2>Active perks<\/h2>/);
assert.match(activePerksSource, /className="dp-active-perks-list"/);
assert.doesNotMatch(activePerksSource, /PerkIdentityHeader|dp-perk-identity|qrCode/i, "the Active Perks list must never render the QR identity header");

assert.match(identitySource, /grid className="dp-perk-identity-qr"|className="dp-perk-identity-qr"/);
assert.match(identitySource, /className="dp-perk-identity-copy"/);
assert.match(identitySource, /aria-labelledby=\{titleId\}/);
assert.match(identitySource, /alt=\{qrCodeAlt \|\| `QR code for \$\{accessibleName\}`\}/);

assert.match(detailSource, /model\.perkIdentity \? \(/);
assert.match(detailSource, /<PerkIdentityHeader \{\.\.\.model\.perkIdentity\} titleId=\{model\.titleId\} \/>/);
assert.match(detailSource, /\) : \(\s*<>\s*<DetailHero/s, "the normal hero and repeated title must render only when there is no perk identity");
assert.match(mapSource, /navigationTitle=\{getMapDetailNavigationTitle\(selected, Boolean\(urlState\.perkId\)\)\}/);
assert.match(mapSource, /if \(entityType === "perk"\) return "Perk details"/);
assert.match(mapSource, /backLabel=\{getCanonicalDetailEntityType[^\n]+\? "Back to active perks" : "Back"\}/);
assert.match(mapSource, /isPerkRedemption \? \(\s*<PerkIdentityHeader/s);
assert.match(mapSource, /!isPerkRedemption \? \(\s*<div className="dp-resident-qr-frame">/s, "the legacy standalone QR frame must not render for perk redemptions");

assert.match(identityCss, /\.dp-perk-identity-header[\s\S]*?border:\s*0\s*!important/);
assert.match(identityCss, /\.dp-perk-identity-qr[\s\S]*?border-radius:\s*0\s*!important/);
assert.match(identityCss, /\.dp-native-detail-panel\[data-entity-type="perk"\] \.dp-detail-context-strip[\s\S]*?border:\s*0\s*!important/);
assert.doesNotMatch(identityCss, /border-left\s*:/i);
assert.doesNotMatch(identityCss, /border-right\s*:/i);

console.log("Perk identity header regression checks passed.");
