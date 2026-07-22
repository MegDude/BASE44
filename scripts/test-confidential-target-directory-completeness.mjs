import assert from "node:assert/strict";
import {
  collectionResolvedBriefMeta,
  collectionResolvedBuildingDirectory,
  collectionResolvedTargetDirectory,
} from "../src/server/foundingPartnerTargetDirectoryResolved.js";
import { collectionWarmRelationships } from "../src/server/foundingPartnerBriefSupport.js";

assert.equal(collectionResolvedBriefMeta.label, "CONFIDENTIAL BRIEF");
assert.ok(collectionResolvedTargetDirectory.length >= 34, `Expected at least 34 targets, found ${collectionResolvedTargetDirectory.length}`);
assert.ok(collectionResolvedBuildingDirectory.length >= 17, `Expected at least 17 building routes, found ${collectionResolvedBuildingDirectory.length}`);
assert.equal(collectionWarmRelationships.length, 15, "The Nina warm-relationship set changed unexpectedly");

const byId = new Map(collectionResolvedTargetDirectory.map((target) => [target.id, target]));
const names = new Set(collectionResolvedTargetDirectory.map((target) => target.name));

for (const name of [
  "Worth Ross / WRMC",
  "Greystar / Paseo",
  "LV Collective",
  "Endeavor Real Estate Group",
  "DivcoWest",
  "Lincoln Property Company",
  "Rainey Street Coalition",
  "Rainey Ventures",
  "Dunlap ATX",
  "Pouring With Heart",
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
]) {
  assert.ok(names.has(name), `Confidential directory is missing ${name}`);
}

const coalition = byId.get("rainey-street-coalition");
assert.ok(coalition, "Rainey Street Coalition record is missing");
assert.ok(coalition.assets.includes("Banger’s Sausage House & Beer Garden"), "Banger’s is missing from the coalition route");
assert.ok(coalition.contacts.some((contact) => contact.name === "Ben Siegel"), "Ben Siegel is missing from the coalition route");
assert.match(JSON.stringify(coalition.contacts), /current title.*authority to verify/i, "Ben Siegel is not clearly qualified as a supplied route requiring verification");
assert.doesNotMatch(JSON.stringify(coalition.contacts), /Ben Siegel[^}]*Founder/i, "Ben Siegel must not be described as founder without confirmation");

const pouringWithHeart = byId.get("pouring-with-heart");
assert.ok(pouringWithHeart, "The active Pouring With Heart relationship is missing");
assert.match(pouringWithHeart.relationshipStrength, /Active/i, "Pouring With Heart is not marked as active");
assert.ok(pouringWithHeart.assets.includes("Stay Put") && pouringWithHeart.assets.includes("Half Step"), "Pouring With Heart active concepts are incomplete");
assert.match(pouringWithHeart.nextAction, /out of the net-new introduction list/i, "Pouring With Heart is not separated from net-new outreach");

const mml = byId.get("mml-hospitality");
assert.ok(mml.assets.includes("Pool Burger"), "Pool Burger is missing from the MML scope");
const do512 = byId.get("do512");
assert.ok(do512.preparedPages.includes("Romantic Spots Austin"), "Romantic Spots Austin is missing from the prepared media assets");

const buildingNames = new Set(collectionResolvedBuildingDirectory.map((building) => building.property));
for (const building of [
  "The Austonian",
  "Four Seasons Residences",
  "Residences at 6G",
  "5 Fifty Five",
  "Brown Building",
  "Plaza Lofts",
  "Paseo",
  "Northshore",
  "Spring Condominiums",
  "SkyHouse Austin",
  "Camden Rainey Street",
  "ROOST Rainey",
  "70 Rainey",
  "44 East",
  "900 S. 1st",
  "The Shore",
  "Plaza on Republic Square",
]) {
  assert.ok(buildingNames.has(building), `Building directory is missing ${building}`);
}

for (const target of collectionResolvedTargetDirectory) {
  assert.ok(target.id && target.name && target.segment && target.priority, `Incomplete target identity: ${target.name || "unknown"}`);
  assert.ok(Array.isArray(target.assets) && target.assets.length > 0, `${target.name} has no represented assets`);
  assert.ok(Array.isArray(target.contacts) && target.contacts.length > 0, `${target.name} has no contact route`);
  assert.ok(target.contacts.every((contact) => contact.name && contact.role && contact.status), `${target.name} has incomplete contact detail`);
  assert.ok(target.assetNote && target.nextAction && target.ask, `${target.name} is missing governance or action copy`);
}

console.log("Confidential Founding Partner target directory: complete companies, assets, contacts, and active-route handling PASS");
