import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const main = readFileSync("src/main.jsx", "utf8");
const styles = readFileSync("src/styles/resident-qr-modal-final.css", "utf8");

assert.match(map, /header=\{\(\s*<header className="dp-resident-qr-header">/s);
assert.match(map, /dp-resident-qr-header-title">Resident Pass</);
assert.match(map, /Ask the partner to scan this code to apply your perk\./);
assert.match(map, /Keep this screen open until the scan is confirmed\./);
assert.match(map, /<div className="dp-resident-qr-frame">\s*<DemoQrCode/s);
assert.match(map, /<div><span>Venue<\/span><strong>/);
assert.match(map, /<div><span>Location<\/span><strong>/);
assert.match(map, /<div><span>Pass ID<\/span><code>/);
assert.match(main, /resident-qr-modal-final\.css"[\s\S]*canonical-surface-system\.css"/);

for (const prohibited of [/#f5efe3/i, /#f7f1e7/i, /\bbeige\b/i, /\bwheat\b/i, /\btan\b/i, /\bsand\b/i, /linear-gradient/i, /radial-gradient/i]) {
  assert.doesNotMatch(styles, prohibited, `resident QR modal contains prohibited warm or gradient styling: ${prohibited}`);
}

assert.match(styles, /\.dp-resident-qr-modal[\s\S]*background:\s*#ffffff\s*!important/i);
assert.match(styles, /:is\(\.dp-resident-qr-back, \.dp-resident-qr-close\)[\s\S]*width:\s*40px\s*!important[\s\S]*height:\s*40px\s*!important/);
assert.match(styles, /\.dp-resident-qr-frame[\s\S]*width:\s*min\(100%, 284px\)\s*!important[\s\S]*background:\s*#ffffff\s*!important/i);
assert.match(styles, /\.dp-resident-qr-meta > div[\s\S]*border-bottom:/);
assert.doesNotMatch(styles, /\.dp-resident-qr-(?:back|close)[^{]*\{[^}]*border-radius:\s*999px/is);

console.log("Resident QR modal uses the bright-white native pass hierarchy: PASS");
