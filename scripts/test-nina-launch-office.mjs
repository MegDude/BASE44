import assert from "node:assert/strict";
import { Script } from "node:vm";
import { readFileSync } from "node:fs";

const page = readFileSync("public/nina-launch-office.html", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const main = readFileSync("src/main.jsx", "utf8");
const qrStyles = readFileSync("src/styles/perk-action-visibility-final.css", "utf8");
const pinResolver = readFileSync("src/lib/map/entityPinResolver.ts", "utf8");
const typeResolver = readFileSync("src/lib/map/entityTypeResolver.ts", "utf8");
const intentRegistry = readFileSync("src/map/searchIntent/mapIntentRegistry.ts", "utf8");
const inventoryWorkflow = readFileSync(".github/workflows/generated-content-inventory.yml", "utf8");

for (const requiredCopy of [
  "The places people return to make a city worth staying for.",
  "A city can have everything and still feel disconnected.",
  "Downtown Perks connects what already makes downtown worth choosing.",
  "Built around an ordinary Thursday.",
  "Different organizations. One connected neighborhood.",
  "Six relationships. Two clean pilots. One path to scale.",
  "Restaurants remain restaurants.",
  "Show QR stays visible.",
  "Dining and inKind can coexist without overwriting identity.",
  "One focused beginning.",
  "Judge the work by what people do next.",
  "Partnership path",
  "Great downtowns are built when remarkable people make it easier",
]) {
  assert.ok(page.includes(requiredCopy), `Nina Launch Office is missing: ${requiredCopy}`);
}

for (const requiredId of ["story", "opportunity", "experience", "office", "relationships", "product", "launch", "next", "decisionList", "relationshipList", "relationshipDrawer"]) {
  assert.match(page, new RegExp(`id=["']${requiredId}["']`), `Nina Launch Office is missing #${requiredId}`);
}

assert.doesNotMatch(page, /class=["'][^"']*\bcard\b/i, "Nina Launch Office must not use card components");
assert.doesNotMatch(page, /\bbento\b/i, "Nina Launch Office must not use bento language or layout");
assert.doesNotMatch(page, /box-shadow\s*:/i, "Nina Launch Office must remain shadow-free");
assert.doesNotMatch(page, /(?:linear|radial)-gradient\s*\(/i, "Nina Launch Office must remain gradient-free");
assert.match(page, /border-top:\s*1px solid var\(--line\)/, "Editorial rules are missing");
assert.match(page, /font-family:\s*Canela, Georgia/, "Editorial display typography is missing");
assert.match(page, /meta name="robots" content="noindex,nofollow,noarchive"/, "Private page must remain noindex");

const inlineScript = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inlineScript, "Nina Launch Office inline behavior is missing");
assert.doesNotThrow(() => new Script(inlineScript, { filename: "nina-launch-office.inline.js" }), "Nina Launch Office inline JavaScript must parse");

const rewrites = new Map(vercel.rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));
assert.equal(rewrites.get("/nina-launch-office"), "/nina-launch-office.html", "Friendly Nina route is missing");
assert.equal(rewrites.get("/founding-partners"), "/nina-launch-office.html", "Founding Partners alias is missing");

assert.ok(main.trim().includes('import "@/styles/perk-action-visibility-final.css"'), "Show QR correction stylesheet is not imported");
assert.match(qrStyles, /\.dp-perk-cta\.is-secondary[\s\S]*?grid-column:\s*1 \/ -1/, "Show QR secondary action is not kept visible");
assert.match(pinResolver, /function hasRestaurantSignal/, "Restaurant pin identity guard is missing");
assert.match(pinResolver, /if \(hasRestaurantSignal\(entity\)\)[\s\S]*?return getMapIcon\("dining"\)/, "Restaurant glyph precedence is missing");
assert.match(typeResolver, /collectDeclaredEntityTypeText/, "Declared restaurant type preservation is missing");
assert.match(typeResolver, /return "restaurant"/, "Restaurant drawer type preservation is missing");
assert.match(intentRegistry, /export function entityHasExplicitInKindMembership/, "Explicit inKind membership resolver is missing");
assert.match(intentRegistry, /if \(intent\.id === "inkind"\)[\s\S]*?entityHasExplicitInKindMembership/, "inKind intent is not gated by explicit membership");
assert.match(inventoryWorkflow, /Validate Nina Launch Office[\s\S]*?node scripts\/test-nina-launch-office\.mjs/, "Nina regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map panel actions and Show QR[\s\S]*?node scripts\/test-map-panel-action-rail\.mjs/, "Show QR regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map intent routing[\s\S]*?npm run test:map-intents/, "Map intent regression is not wired into CI");

console.log("Nina Launch Office editorial system and integrated product fixes: PASS");
