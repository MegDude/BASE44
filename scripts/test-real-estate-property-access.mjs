import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const map = readFileSync("src/pages/Map.jsx", "utf8");
const data = readFileSync("src/data/supplementalMapEntities.js", "utf8");
const adapter = readFileSync("src/lib/map/realEstateListings.ts", "utf8");
const marker = readFileSync("src/lib/map/canonicalMarkerRecords.ts", "utf8");
const analytics = readFileSync("src/lib/analytics/track.ts", "utf8");
const inquiry = readFileSync("api/listing-interest.js", "utf8");
const styles = readFileSync("src/styles/real-estate-property-access.css", "utf8");
const main = readFileSync("src/main.jsx", "utf8");

assert.match(adapter, /export type RealEstateListingEntity/, "real-estate entity contract is missing");
assert.match(adapter, /entityType: "real_estate"/, "adapter must emit real_estate entity type");
assert.match(adapter, /detailKind: "real_estate"/, "adapter must emit real_estate detail kind");
assert.match(adapter, /iconKey: "property"/, "adapter must use property icon key");
assert.match(adapter, /TODO: replace this internal map ID/, "unconfirmed database ID must be documented as TODO");

assert.match(data, /id: "legends-real-estate-210-lavaca-st-1910"[\s\S]*?entityType: "real_estate"/, "210 Lavaca listing must be typed as real_estate");
assert.match(data, /name: "210 Lavaca St, Unit 1910"/, "210 Lavaca display address must use approved title casing");
assert.match(data, /offer: "Pricing available from the listing agent"/, "pricing copy must not say Contact for pricing");
assert.doesNotMatch(data.match(/id: "legends-real-estate-210-lavaca-st-1910"[\s\S]*?\n  \}\),/)?.[0] || "", /entityType: "perk"|perkId|Use Perk|Show Card|QR|redemption/i, "Lavaca listing data must not use perk, card, QR, or redemption semantics");

assert.match(map, /function RealEstateListingDrawer/, "real-estate drawer is missing");
assert.match(map, /PROPERTY ACCESS · \{listing\.district/, "drawer must use Property Access eyebrow");
assert.match(map, /Request listing details/, "drawer must use Request listing details action");
assert.match(map, /Schedule a tour/, "drawer must expose Schedule a tour action");
assert.match(map, /Similar downtown homes/, "drawer must include similar homes section");
assert.match(map, /Listing information provided by Legends Real Estate/, "drawer must include source attribution");
assert.match(map, /toRealEstateListingEntity\(selected\)/, "selected drawer must route through real-estate adapter");
assert.match(map, /entityType: "real_estate"[\s\S]*?perkId: ""[\s\S]*?campaignId: ""[\s\S]*?cardId: ""[\s\S]*?residentUid: ""[\s\S]*?touchpoint: ""/, "real-estate selection must clear perk/campaign/card/pass URL params");
assert.match(map, /data-map-pin="true"[\s\S]*?data-entity-type="\$\{escapedEntityType\}"/, "markers must expose semantic pin and entity type attributes");
assert.match(map, /isRealEstateListingEntity\(place\) \? "property"/, "real-estate markers must use property icon treatment");
assert.doesNotMatch(map.match(/function RealEstateListingDrawer[\s\S]*?\nfunction LegendsResidentialIntelligenceDrawer/)?.[0] || "", /Use Perk|Show Card|Resident Perk|Why this perk|QR|redemption|resident pass/i, "real-estate drawer must not include perk, QR, card, or redemption copy");

assert.match(map, /sourceSurface = "resident_map_listing"/, "inquiry form must use resident_map_listing source surface");
assert.match(map, /listingId: listing\.listingId[\s\S]*?organizationId: listing\.organizationId[\s\S]*?portfolioId: listing\.portfolioId/, "inquiry payload must be scoped to listing and Legends organization");
assert.doesNotMatch(map.match(/trackingEvents\.realEstateInquirySubmitted[\s\S]*?\);/)?.[0] || "", /name|email|phone|message/i, "analytics must not include personal inquiry fields");

assert.match(analytics, /real_estate_listing_opened/, "real-estate opened event is missing");
assert.match(analytics, /real_estate_inquiry_submitted/, "real-estate inquiry submitted event is missing");
assert.match(inquiry, /sourceSurface/, "existing inquiry endpoint must accept scoped source surface");
assert.match(inquiry, /Missing required fields: name, email, and listing\.address/, "phone must be optional for property-access inquiries");

assert.match(marker, /real_estate/, "canonical marker model must include real_estate");
assert.match(styles, /Legends property-access extension/, "property-access stylesheet must document scope");
assert.match(styles, /min-height: 48px !important/, "inquiry controls must be at least 48px high");
assert.match(main, /real-estate-property-access\.css/, "property-access stylesheet must be loaded");

for (const forbidden of ["partner_organizations", "partner_portfolios", "partner_listings"]) {
  assert.doesNotMatch(data, new RegExp(`from\\(['\"]${forbidden}|insert\\([\\s\\S]*${forbidden}|upsert\\([\\s\\S]*${forbidden}`), `must not mutate ${forbidden}`);
}

console.log("Real-estate property access contract checks passed.");
