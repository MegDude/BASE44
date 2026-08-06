import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import {
  collectionBriefMeta,
  collectionBuildingDirectory,
  collectionTargetDirectory,
} from "../src/server/foundingPartnerTargetDirectory.js";
import {
  collectionForwardableNote,
  collectionIntroductionPriorities,
  collectionPilotOptions,
  collectionWarmRelationships,
} from "../src/server/foundingPartnerBriefSupport.js";

const publicPage = readFileSync("public/founding-partners.html", "utf8");
const worker = readFileSync("worker/index.ts", "utf8");
const main = readFileSync("src/main.jsx", "utf8");
const qrStyles = readFileSync("src/styles/perk-action-visibility-final.css", "utf8");
const targetStyles = readFileSync("src/styles/workspace-founding-partner-targets-final.css", "utf8");
const pinResolver = readFileSync("src/lib/map/entityPinResolver.ts", "utf8");
const typeResolver = readFileSync("src/lib/map/entityTypeResolver.ts", "utf8");
const intentRegistry = readFileSync("src/map/searchIntent/mapIntentRegistry.ts", "utf8");
const operationsView = readFileSync("src/components/partner/workspace/WorkspaceLaunchBrief.jsx", "utf8");
const targetView = readFileSync("src/components/partner/workspace/WorkspaceFoundingPartnerTargets.jsx", "utf8");
const operationsClient = readFileSync("src/lib/partner/foundingPartnerOperationsClient.ts", "utf8");
const operationsApi = readFileSync("api/founding-partner-operations.js", "utf8");
const operationsData = readFileSync("src/server/foundingPartnerCollectionOperations.js", "utf8");
const directoryData = readFileSync("src/server/foundingPartnerTargetDirectory.js", "utf8");
const supportData = readFileSync("src/server/foundingPartnerBriefSupport.js", "utf8");
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
  "One measurable outcome.",
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
  "CONFIDENTIAL BRIEF",
]) {
  assert.ok(!publicPage.toLowerCase().includes(internalTerm.toLowerCase()), `Public page leaks internal language: ${internalTerm}`);
}

for (const confidentialValue of [
  "info4hoa@worthross.com",
  "leasing@paseoatx.com",
  "shawn.bell@fsresidential.com",
  "bridget@dunlapatx.com",
  "MMiller@LPC.com",
]) {
  assert.ok(!publicPage.includes(confidentialValue), `Public invitation leaks confidential contact data: ${confidentialValue}`);
  assert.ok(!operationsView.includes(confidentialValue), `Client launch component bundles confidential contact data: ${confidentialValue}`);
  assert.ok(!targetView.includes(confidentialValue), `Client target component bundles confidential contact data: ${confidentialValue}`);
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

assert.match(worker, /url\.pathname === "\/founding-partner-collection"/, "Collection alias is missing");
assert.match(worker, /url\.pathname = "\/founding-partners\.html"/, "Founding Partners asset route is missing");

assert.ok(main.includes('import "@/styles/workspace-founding-partner-targets-final.css"'), "Target directory styles are not imported");
assert.ok(main.trim().includes('import "@/styles/perk-action-visibility-final.css"'), "Show QR correction stylesheet is not imported");
assert.match(qrStyles, /\.dp-perk-cta\.is-secondary[\s\S]*?grid-column:\s*1 \/ -1/, "Show QR secondary action is not kept visible");
assert.match(pinResolver, /function hasRestaurantSignal/, "Restaurant pin identity guard is missing");
assert.match(pinResolver, /if \(hasRestaurantSignal\(entity\)\)[\s\S]*?return getMapIcon\("dining"\)/, "Restaurant glyph precedence is missing");
assert.match(typeResolver, /collectDeclaredEntityTypeText/, "Declared restaurant type preservation is missing");
assert.match(intentRegistry, /export function entityHasExplicitInKindMembership/, "Explicit inKind membership resolver is missing");
assert.match(intentRegistry, /if \(intent\.id === "inkind"\)[\s\S]*?entityHasExplicitInKindMembership/, "inKind intent is not gated by explicit membership");

assert.equal(collectionBriefMeta.label, "CONFIDENTIAL BRIEF", "Confidential brief label is missing");
assert.match(collectionBriefMeta.objective, /two building routes/i, "60-day objective is incomplete");
assert.ok(collectionTargetDirectory.length >= 30, `Target directory is too small (${collectionTargetDirectory.length})`);
assert.ok(collectionBuildingDirectory.length >= 15, `Building directory is too small (${collectionBuildingDirectory.length})`);
assert.equal(collectionWarmRelationships.length, 15, "Warm relationship list is incomplete");
assert.equal(collectionIntroductionPriorities.length, 7, "Introduction priorities are incomplete");
assert.equal(collectionPilotOptions.length, 6, "Pilot options are incomplete");
assert.match(collectionForwardableNote.body, /Hello \[Name\]/, "Forwardable note is incomplete");

const requiredTargets = [
  "Worth Ross / WRMC",
  "Greystar / Paseo",
  "LV Collective",
  "Endeavor Real Estate Group",
  "DivcoWest",
  "Lincoln Property Company",
  "Rainey Street Coalition",
  "Rainey Ventures",
  "Dunlap ATX",
  "MML Hospitality",
  "Emmer & Rye Hospitality Group",
  "Guy + Larry Restaurants",
  "New Waterloo",
  "White Lodging",
  "Hai Hospitality",
  "Lobo Hospitality",
  "inKind",
  "Hotel Van Zandt",
  "KMG Hotels",
  "Downtown Austin Neighborhood Association (DANA)",
  "Downtown Austin Alliance",
  "Waterloo Greenway",
  "Do512",
  "Visit Austin",
  "Austin Way / Modern Luxury",
  "Crexi",
  "Urbanspace",
  "Compass",
  "Moreland Properties",
  "Christie’s International Real Estate",
  "Bramlett Partners",
  "Lifestyle Brand Prospect Set",
  "Hotel Expansion Set",
];
const targetNames = new Set(collectionTargetDirectory.map((target) => target.name));
for (const name of requiredTargets) assert.ok(targetNames.has(name), `Target directory is missing ${name}`);

for (const target of collectionTargetDirectory) {
  assert.ok(target.id && target.name && target.segment && target.priority, `Target identity is incomplete: ${JSON.stringify(target)}`);
  assert.ok(Array.isArray(target.assets) && target.assets.length > 0, `${target.name} has no assets or entities`);
  assert.ok(Array.isArray(target.contacts) && target.contacts.length > 0, `${target.name} has no contact path`);
  assert.ok(target.contacts.every((contact) => contact.name && contact.role && contact.status), `${target.name} contains an incomplete contact`);
  assert.ok(target.why && target.pilot && target.nextAction && target.ask, `${target.name} is missing operating copy`);
  assert.ok(target.assetNote, `${target.name} is missing an asset-governance note`);
}

const worthRoss = collectionTargetDirectory.find((target) => target.id === "worth-ross");
assert.ok(worthRoss.assets.includes("44 East") && worthRoss.assets.includes("70 Rainey"), "Worth Ross building scope is incomplete");
assert.match(JSON.stringify(worthRoss.contacts), /info4hoa@worthross\.com/, "Verified Worth Ross portal route is missing");
assert.doesNotMatch(JSON.stringify(worthRoss.contacts), /CustomerCare@worthross\.com/, "Unverified Worth Ross inbox remains in the directory");
const greystar = collectionTargetDirectory.find((target) => target.id === "greystar-paseo");
assert.match(JSON.stringify(greystar.contacts), /leasing@paseoatx\.com/, "Paseo contact route is missing");
assert.ok(greystar.contacts.length >= 10, "Greystar related contacts are incomplete");
const dunlap = collectionTargetDirectory.find((target) => target.id === "dunlap-atx");
assert.ok(dunlap.assets.includes("Lustre Pearl") && dunlap.assets.includes("Lucille"), "Dunlap assets are incomplete");
assert.match(JSON.stringify(dunlap.contacts), /bridget@dunlapatx\.com/, "Dunlap supplied contact route is missing");
const mml = collectionTargetDirectory.find((target) => target.id === "mml-hospitality");
assert.ok(mml.assets.includes("Jeffrey’s") && mml.assets.includes("Hotel Saint Cecilia"), "MML portfolio is incomplete");
const newWaterloo = collectionTargetDirectory.find((target) => target.id === "new-waterloo");
assert.ok(newWaterloo.assets.includes("South Congress Hotel") && newWaterloo.assets.includes("Central Machine Works"), "New Waterloo assets are incomplete");
const directBuildings = new Set(collectionBuildingDirectory.map((building) => building.property));
for (const property of ["The Austonian", "Four Seasons Residences", "Residences at 6G", "5 Fifty Five", "Brown Building", "Plaza Lofts", "Paseo", "70 Rainey", "The Shore", "Plaza on Republic Square"]) {
  assert.ok(directBuildings.has(property), `Building directory is missing ${property}`);
}

assert.match(operationsView, /Downtown Perks · Founding Partner Collection/, "Operations workspace is not using the collection name");
assert.match(operationsView, /fetchFoundingPartnerOperations/, "Operations view is not loading protected data through the API client");
assert.match(operationsView, /Authorized operations access required/, "Unauthorized access state is missing");
assert.match(operationsView, /view === "targets"/, "Protected all-targets view is not routed");
assert.match(operationsView, /Open all targets/, "Operations overview does not link to the complete directory");
assert.match(targetView, /All target companies, contacts, and assets\./, "Target directory headline is missing");
assert.match(targetView, /Full contact detail from the working data/, "Expanded contact detail is missing");
assert.match(targetView, /Pilot options that are easy to approve/, "Pilot support detail is missing");
assert.match(targetView, /Forwardable introduction note/, "Forwardable note is missing");
assert.doesNotMatch(targetStyles, /box-shadow\s*:/i, "Target directory must remain shadow-free");
assert.doesNotMatch(targetStyles, /(?:linear|radial)-gradient\s*\(/i, "Target directory must remain gradient-free");
assert.doesNotMatch(targetStyles, /\bbento\b/i, "Target directory must not use bento language");

assert.match(operationsClient, /supabaseClient\?\.auth\.getSession\(\)/, "Operations client does not read the authenticated session");
assert.match(operationsClient, /Authorization: `Bearer \$\{token\}`/, "Operations client does not send the bearer token");
assert.match(operationsClient, /targetDirectory/, "Operations client does not type the target directory");
assert.match(operationsClient, /\/api\/founding-partner-operations/, "Operations client does not call the protected endpoint");
assert.match(operationsApi, /requireAuthenticatedUser\(req\)/, "Operations endpoint does not require authentication");
assert.match(operationsApi, /canAccessOperations\(user\)/, "Operations endpoint does not enforce operator authorization");
assert.match(operationsApi, /COLLECTION_OPERATIONS_FORBIDDEN/, "Operations endpoint lacks a clear forbidden state");
assert.match(operationsApi, /Cache-Control", "private, no-store, max-age=0"/, "Protected operations response can be cached");
assert.match(operationsApi, /X-Robots-Tag", "noindex, nofollow, noarchive"/, "Protected operations response is not excluded from indexing");
assert.match(operationsApi, /targetDirectory: collectionTargetDirectory/, "Protected API does not return the target directory");
assert.match(operationsApi, /buildingDirectory: collectionBuildingDirectory/, "Protected API does not return building contacts");
assert.match(operationsApi, /warmRelationships: collectionWarmRelationships/, "Protected API does not return warm relationships");
assert.equal(existsSync("src/data/foundingPartnerCollectionOperations.js"), false, "Protected operations data remains in the client data directory");
assert.equal(existsSync("src/data/foundingPartnerTargetDirectory.js"), false, "Protected target data remains in the client data directory");
assert.match(operationsData, /info4hoa@worthross\.com/, "Verified Worth Ross portal contact is missing from priority operations");
assert.match(directoryData, /shawn\.bell@fsresidential\.com/, "Direct residential contacts are incomplete");
assert.match(directoryData, /MMiller@LPC\.com/, "Lincoln contact data is incomplete");
assert.match(supportData, /Tamara Stuart/, "Warm relationship data is incomplete");

assert.match(inventoryWorkflow, /Validate Founding Partner Collection[\s\S]*?node scripts\/test-founding-partner-collection\.mjs/, "Collection regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map panel actions and Show QR[\s\S]*?node scripts\/test-map-panel-action-rail\.mjs/, "Show QR regression is not wired into CI");
assert.match(inventoryWorkflow, /Validate map intent routing[\s\S]*?npm run test:map-intents/, "Map intent regression is not wired into CI");

console.log("Founding Partner Collection public invitation, protected complete target directory, and product regressions: PASS");
