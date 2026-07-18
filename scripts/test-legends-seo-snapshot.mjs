import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/pages/PartnerWorkspace.jsx", "utf8");
const snapshot = readFileSync("src/data/luxuryPresenceSeoSnapshot.js", "utf8");
const styles = readFileSync("src/styles/legends-seo-snapshot-final.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(source, /className="dp-workspace-reports dp-report-system"/);
assert.match(source, /dp-workspace-report-label">SEO Snapshot</);
assert.match(source, /Search visibility is strong\. The next job is conversion\./);
assert.match(source, /Source: verified Luxury Presence snapshot\./);
assert.match(source, /Make the two Shore listings easier to compare\./);
assert.match(source, /DOWNTOWN_AUSTIN_REPORT_CONTEXT\.map/);
assert.match(snapshot, /source: "Luxury Presence reporting dashboard"/);
assert.match(snapshot, /brandedAveragePosition: 3\.71/);
assert.match(snapshot, /nonBrandedTop10KeywordCount: 943/);
assert.match(snapshot, /Nina seely/);
assert.match(main, /legends-seo-snapshot-final\.css/);
assert.match(styles, /\.dp-report-metric-grid article > strong[\s\S]*?display: block !important/);
assert.match(styles, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
assert.match(styles, /padding-bottom: calc\(96px \+ env\(safe-area-inset-bottom/);
assert.doesNotMatch(styles, /border-radius:\s*(?:18|24|30|999)px/);

console.log("Legends SEO Snapshot content and mobile hierarchy: PASS");
