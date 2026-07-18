import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/styles/accessibility-pin-art-final.css", import.meta.url), "utf8");
const workspace = await readFile(new URL("../src/pages/PartnerWorkspace.jsx", import.meta.url), "utf8");
const registry = await readFile(new URL("../src/lib/map/mapIconRegistry.ts", import.meta.url), "utf8");

assert.match(css, /dp-native-mobile-attention h2[\s\S]*?-webkit-text-fill-color:\s*#ffffff/, "dark attention surfaces must force readable white heading text");
assert.match(css, /dp-native-mobile-attention > span[\s\S]*?-webkit-text-fill-color:\s*rgba\(255, 255, 255, 0\.86\)/, "attention supporting copy must remain readable after global text rules");
assert.match(css, /dp-live-pin__premium-art[\s\S]*?border:\s*0\s*!important[\s\S]*?background:\s*transparent\s*!important/, "uploaded marker artwork must render without a card, circle, or badge wrapper");
assert.doesNotMatch(workspace, /activity\.map\([\s\S]{0,300}<i\b/, "activity rows must not use unexplained decorative dots");
assert.match(workspace, /activity\.map\(\(\[Icon, title, description, (?:time|status)\]\)/, "activity rows must render meaningful icons");

const assets = [
  "inkind.png",
  "boots.png",
  "coffee.png",
  "beer.png",
  "fine-eyewear.png",
  "dana.png",
  "condo-building.png",
  "rivian.png",
];

await Promise.all(assets.map((asset) => access(new URL(`../public/pins/downtown-perks/partners/${asset}`, import.meta.url))));
for (const asset of assets) {
  assert.match(registry, new RegExp(asset.replace(".", "\\.")), `${asset} must be registered in the canonical marker system`);
}

console.log("Accessible surface and premium pin artwork checks passed.");
