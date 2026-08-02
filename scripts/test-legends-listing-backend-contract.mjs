import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LEGENDS_ORGANIZATION_ID,
  LEGENDS_PIN_ASSET,
  STANDARD_MAP_PIN_SIZE,
  getDowntownTop10Listings,
  getLegendsListingById,
  getLegendsListings,
  getLegendsProperty,
  getListingQualityRows,
} from "../src/server/legends/listingCatalog.js";

const listingApi = readFileSync("api/listings.js", "utf8");
const listingDetailApi = readFileSync("api/listings/[listingId].js", "utf8");
const relatedApi = readFileSync("api/listings/[listingId]/related.js", "utf8");
const saveApi = readFileSync("api/listings/[listingId]/save.js", "utf8");
const contactApi = readFileSync("api/listings/[listingId]/contact.js", "utf8");
const propertyApi = readFileSync("api/properties/[propertyId].js", "utf8");
const qualityApi = readFileSync("api/admin/listings/quality.js", "utf8");
const catalogSource = readFileSync("src/server/legends/listingCatalog.js", "utf8");

assert.equal(LEGENDS_ORGANIZATION_ID, "legends-real-estate");
assert.equal(LEGENDS_PIN_ASSET, "/pins/downtown-perks/legends-logo-gold.svg");
assert.equal(STANDARD_MAP_PIN_SIZE, 36);

const listings = getLegendsListings({ includeNonPublic: true });
assert.ok(listings.length > 10, "Legends catalog must expose canonical listings");
assert.equal(new Set(listings.map((listing) => listing.id)).size, listings.length, "Listing IDs must be unique");
for (const listing of listings) {
  assert.equal(listing.organizationId, "legends-real-estate", `${listing.id} organization must be Legends`);
  assert.ok(listing.propertyId, `${listing.id} must link to a propertyId`);
  assert.ok(["active", "pending", "sold", "off-market"].includes(listing.status), `${listing.id} must normalize operational status`);
  assert.ok(Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude), `${listing.id} must have validated coordinates`);
  assert.equal(listing.marker.icon, "/pins/downtown-perks/legends-logo-gold.svg", `${listing.id} must use approved Legends SVG`);
  assert.equal(listing.marker.anchor, "bottom-center", `${listing.id} must use bottom-center anchor`);
  assert.equal(listing.marker.size, STANDARD_MAP_PIN_SIZE, `${listing.id} must use standard marker size`);
  assert.equal(listing.marker.markerId, listing.id, `${listing.id} markerId must equal canonical listing id`);
}

const top10 = getDowntownTop10Listings();
assert.ok(top10.length > 0 && top10.length <= 10, "Downtown Top 10 must be a bounded collection");
for (const listing of top10) {
  assert.equal(listing.status, "active", "Top 10 must only include active listings");
  assert.equal(listing.displayPermission, "public", "Top 10 must only include public listings");
  assert.ok(listing.media.length, "Top 10 listings must have approved media");
  assert.ok(listing.whyFeatured, "Top 10 listings must expose internal whyFeatured copy");
}

const first = listings[0];
assert.ok(getLegendsListingById(first.id), "Lookup by listing id must work");
assert.ok(getLegendsProperty(first.propertyId), "Linked property lookup must work");
assert.match(catalogSource, /propertyIdFromListing[\s\S]*return "the-shore";/, "The Shore must remain canonical property ID the-shore");
assert.doesNotMatch(catalogSource, /parking-the-shore-evening[\s\S]*primary/i, "Parking must not become the primary Shore destination");
assert.ok(getListingQualityRows().every((row) => row.organizationId === "legends-real-estate"), "Quality rows must remain Legends-scoped");

assert.match(listingApi, /getLegendsListings\(\)\.map\(publicListing\)/, "GET /api/listings must return public listing fields");
assert.match(listingDetailApi, /getLegendsListingById\(req\.query\?\.listingId\)/, "GET /api/listings/:listingId must use canonical lookup");
assert.match(relatedApi, /getRelatedLegendsListings\(req\.query\?\.listingId\)/, "GET related listings must use canonical lookup");
assert.match(saveApi, /resident_saved_entities[\s\S]*entity_type.*listing/, "Save endpoint must write canonical resident saved listing relationship");
assert.match(contactApi, /listingInterestHandler\(req, res\)/, "Contact endpoint must create a real listing interest handoff");
assert.match(propertyApi, /getLegendsProperty\(String\(req\.query\?\.propertyId/, "Property endpoint must use canonical property lookup");
assert.match(qualityApi, /Admin access required/, "Admin listing quality endpoint must reject non-admin callers");

console.log("Legends listing backend contract verified.");
