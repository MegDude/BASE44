import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const publicPage = readFileSync("public/founding-partners.html", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const main = readFileSync("src/main.jsx", "utf8");
const qrStyles = readFileSync("src/styles/perk-action-visibility-final.css", "utf8");
const pinResolver = readFileSync("src/lib/map/entityPinResolver.ts", "utf8");
const typeResolver = readFileSync("src/lib/map/entityTypeResolver.ts", "utf8");
const intentRegistry = readFileSync("src/map/searchIntent/mapIntentRegistry.ts", "utf8");
const operationsView = readFileSync("src/components/partner/workspace/WorkspaceLaunchBrief.jsx", "utf8");
const operationsClient = readFileSync("src/lib/partner/foundingPartnerOperationsClient.ts", "utf8");
const operationsApi = readFileSync("api/founding-partner-operations.js", "utf8");
const operationsData = readFileSync("src/server/foundingPartnerCollectionOperations.js", "utf8");
const operationsStyles = readFileSync("src/styles/workspace-launch-brief-final.css", "utf8");
const inventoryWorkflow = readFileSync(".github/workflows/generated-content-inventory.yml", "utf8");

for (const requiredCopy of [
  "Downtown Perks · Founding Partner Collection",
  "Helping shape a more connected downtown.",
  "Why we're building this",
  "A better way to experience downtown",
  "What Founding Partners receive",
  "Be discovered naturally",
  "Create reasons to return",
  "Understand engagement",
  "Help shape the platform",
  "Imagine an ordinary Thursday",
  "What's worth doing next?",
  "Built for every part of downtown",
  "How partnerships begin",
  "Designed to learn",
  "Partnership journey",
  "Why become a Founding Partner?",
  "Ready to explore?",
  "Start a Founding Partner conversation",
  "Explore Downtown Perks",
]) {
  assert.ok(publicPage.includes(requiredCopy), `Founding Partner Collection is missing: ${requiredCopy}`);
}

for (const requiredId of ["top", "why", "experience", "benefits", "thursday", "partners", "how", "pilot", "journey", "why-join", "ready"]) {
  assert.match(publicPage, new RegExp(`id=["']${requiredId}["']`), `Founding Partner Collection is missing #${requiredId}`);
}

for (const internalTerm of [
  "Private working system",
  "priority routes",
  "Relationship map",
  "contact sheet",
  "owner routes",
  "approval routes",
  "Needs confirmation",
  "product defects",
  "PR #75",
  "PR #76",
  "Platform integrity",
  "Behavior contract",
  "QA checklist",
  "Material strategy corrections",
  "Contact verification rules",
  "internal identity guide",
  "Copied",
]) {
  assert.ok(!publicPage.toLowerCase().includes(internalTerm.toLowerCase()), `Public page leaks internal language: ${internalTerm}`);
}

assert.doesNotMatch(publicPage, /class=["'][^"']*\bcard\b/i, "Public page must not use card components");
assert.doesNotMatch(publicPage, /\bbento\b/i, "Public page must not use bento language or layout");
assert.doesNotMatch(publicPage, /box-shadow\s*:/i, "Public page must remain shadow-free");
assert.doesNotMatch(publicPage, /(?:linear|radial)-gradient\s*\(/i, "Public page must remain gradient-free");
assert.doesNotMatch(publicPage, /<script\b/i, "Public invitation must not ship internal application behavior");
assert.match(publicPage, /border-top:\s*1px solid var\(--line\)/, "Editorial rules are missing");
assert.match(publicPage, /font-family:\s*Canela, Georgia/, "Editorial display typography is missing");
assert.match(publicPage, /meta name="robots" content="index,follow"/, "Public page must be indexable");
assert.match(publicPage, /rel="canonical" href="https:\/\/downtownperks\.com\/founding-partners"/, "Canonical Founding Partners URL is missing");

const rewrites = new Map(vercel.rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));
assert.equal(rewrites.get("/founding-partners"), "/founding-partners.html", "Founding Partners route is missing");
assert.equal(rewrites.get("/founding-partner-collection"), "/founding-partners.html", "Collection alias is missing");
assert.equal(rewrites.has("/nina-launch-office"), false, "Retired public launch-office route still exists");
assert.equal(existsSync("public/nina-launch-office.html"), false, "Legacy public operations page still exists");

assert.ok(main.trim().includes('import "@/styles/perk-action-visibility-final.css"'), "Show QR correction stylesheet is not imported");
assert.match(qrStyles, /\.dp-perk-cta\.is-secondary[\s\S]*?grid-column:\s*1 \/ -1/, "Show QR secondary action is not kept visible");
assert.match(pinResolver, /function hasRestaurantSignal/, "Restaurant pin identity guard is missing");
assert.match(pinResolver, /if \(hasRestaurantSignal\(entity\)\)[\s\S]*?return getMapIcon\("dining"\)/, "Restaurant glyph precedence is missing");
assert.match(typeResolver, /collectDeclaredEntityTypeText/, "Declared restaurant type preservation is missing");
assert.match(intentRegistry, /export function entityHasExplicitInKindMembership/, "Explicit inKind membership resolver is missing");
assert.match(intentRegistry, /if \(intent\.id === "inkind"\)[\s\S]*?entityHasExplicitInKindMembership/, "inKind intent is not gated by explicit membership");

assert.match(operationsView, /Downtown Perks · Founding Partner Collection/, "Operations workspace is not using the collection name");
assert.match(operationsView, /fetchFoundingPartnerOperations/, "Operations view is not loading protected data through the API client");
assert.match(operationsView, /Authorized operations access required/, "Unauthorized access state is missing");
assert.doesNotMatch(operationsView, /leasing@paseoatx\.com|CustomerCare@worthross\.com|shawn\.bell@fsresidential\.com/, "Protected contact data is bundled into the client component");
assert.match(operationsClient, /supabaseClient\?\.auth\.getSession\(\)/, "Operations client does not read the authenticated session");
assert.match(operationsClient, /Authorization: `Bearer \$\{token\}`/, "Operations client does not send the bearer token");
assert.match(operationsClient, /\/api\/founding-partner-operations/, "Operations client does not call the protected endpoint");
assert.match(operationsApi, /requireAuthenticatedUser\(req\)/, "Operations endpoint does not require authentication");
assert.match(operationsApi, /canAccessOperations\(user\)/, "Operations endpoint does not enforce operator authorization");
assert.match(operationsApi, /COLLECTION_OPERATIONS_FORBIDDEN/, "Operations endpoint lacks a clear forbidden state");
assert.match(operationsApi, /Cache-Control", "private, no-store, max-age=0"/, "Protected operations response can be cached");
assert.match(operationsApi, /X-Robots-Tag", "noindex, nofollow, noarchive"/, "Protected operations response is not excluded from indexing");
assert.equal(existsSync("src/data/foundingPartnerCollectionOperations.js"), false, "Protected operations data remains in the client data directory");
assert.match(operationsData, /CustomerCare@worthross\.com/, "Worth Ross public contact route is missing");
assert.match(operationsData, /leasing@paseoatx\.com/, "Paseo public contact route is missing");
assert.match(operationsData, /info@haihospitality\.com/, "Hai Hospitality public contact route is missing");
assert.match(operationsData, /support@inkind\.com/, "inKind public contact route is missing");
assert.match(operationsData, /shawn\.bell@fsresidential\.com/, "Residential starting contacts are incomplete");
assert.doesNotMatch(operationsView, /Nina Launch Office|For Nina|NINA_BRIEF|dp-launch-brief__nina/, "Legacy internal naming remains in the operations view");
assert.doesNotMatch(operationsData, /Nina Launch Office|Nina Introduction/, "Legacy internal naming remains in operations data");
assert.doesNotMatch(operationsStyles, /dp-launch-brief__nina/, "Legacy internal selector remains in operations styles");

assert.match(inventoryWorkflow, /Validate Founding Partner Collection[\s\S]*?node scripts\/test-founding-partner-collection\.mjs/, "Collection regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map panel actions and Show QR[\s\S]*?node scripts\/test-map-panel-action-rail\.mjs/, "Show QR regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map intent routing[\s\S]*?npm run test:map-intents/, "Map intent regression is not wired into CI");

console.log("Founding Partner Collection public invitation, protected operations boundary, and product regressions: PASS");
