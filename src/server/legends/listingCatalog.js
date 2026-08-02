import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const LEGENDS_ORGANIZATION_ID = "legends-real-estate";
export const LEGENDS_PORTFOLIO_ID = "legends-downtown-listings";
export const LEGENDS_PIN_ASSET = "/pins/downtown-perks/legends-logo-gold.svg";
export const STANDARD_MAP_PIN_SIZE = 36;

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const GENERATED_LISTINGS_CSV = path.join(DATA_DIR, "legends_full_listings_generated.csv");

const BUILDING_COORDS = {
  "360 nueces": [30.267029, -97.749595],
  "360 nueces st": [30.267029, -97.749595],
  "222 west ave": [30.2672, -97.75148],
  "501 west ave": [30.26914, -97.75111],
  "301 west ave": [30.267451, -97.750793],
  "300 bowie": [30.2692, -97.7508],
  "202 nueces": [30.26595, -97.7496],
  "202 nueces st": [30.26595, -97.7496],
  "70 rainey": [30.2583, -97.7383],
  "70 rainey st": [30.2583, -97.7383],
  "1212 guadalupe": [30.27542, -97.7431],
  "1212 guadalupe st": [30.27542, -97.7431],
  "44 east": [30.25894, -97.7391],
  "44 east ave": [30.25894, -97.7391],
  "54 rainey": [30.25878, -97.73988],
  "54 rainey st": [30.25878, -97.73988],
  "800 brazos": [30.269, -97.74096],
  "800 brazos st": [30.269, -97.74096],
  "300 bowie": [30.2692, -97.7508],
  "300 bowie st": [30.2692, -97.7508],
  "610 davis": [30.2602, -97.7389],
};

function clean(value) {
  return String(value || "").trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") { row.push(field); field = ""; }
    else if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers = [], ...records] = rows;
  return records.filter((record) => record.some(Boolean)).map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

function slug(value) {
  return clean(value).toLowerCase().replace(/#/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function baseAddress(value) {
  return clean(value).split("#")[0].replace(/\b(ST|Street)\b/i, "st").replace(/\b(Ave|Avenue)\b/i, "ave").toLowerCase().trim();
}

function propertyIdFromListing(row = {}) {
  const building = slug(row.building_name || baseAddress(row.address));
  if (/\bshore\b/.test(building) || /610-davis/.test(slug(row.address))) return "the-shore";
  return building || slug(baseAddress(row.address)) || "unknown-property";
}

function mlsNumber(row = {}) {
  return clean(row.listing_id).match(/-([0-9]{6,})$/)?.[1] || clean(row.mls_number || row.mlsNumber);
}

function listingStatus(row = {}) {
  const status = clean(row.status || row.listing_status).toLowerCase();
  if (/pending|under contract/.test(status)) return "pending";
  if (/sold|closed/.test(status)) return "sold";
  if (/off[-\s]?market|withdrawn|expired|hold/.test(status)) return "off-market";
  return "active";
}

function splitList(value) {
  return clean(value).split("|").map((item) => item.trim()).filter(Boolean);
}

function coordsFor(row = {}) {
  const key = baseAddress(row.address || row.building_name);
  const coords = BUILDING_COORDS[key] || BUILDING_COORDS[slug(row.building_name).replace(/-/g, " ")];
  if (!coords) return [Number.NaN, Number.NaN];
  return coords;
}

function priceFromFacts(row = {}) {
  const text = clean(row.listings || row.panel_subtitle || row.summary);
  const match = text.match(/\$[0-9][0-9,]*(?:\.\d+)?(?:\/MONTH)?/i);
  return match ? Number(match[0].replace(/[^0-9.]/g, "")) : undefined;
}

export function normalizeLegendsListing(row = {}) {
  const [latitude, longitude] = coordsFor(row);
  const id = clean(row.listing_id) || `legends-listing-${slug(row.address)}`;
  const propertyId = propertyIdFromListing(row);
  const media = [row.image_asset, ...splitList(row.media), ...splitList(row.gallery)].filter(Boolean).map((src, index) => ({ src, alt: `${clean(row.address)} image ${index + 1}` }));
  return {
    id,
    organizationId: LEGENDS_ORGANIZATION_ID,
    portfolioId: LEGENDS_PORTFOLIO_ID,
    propertyId,
    address: clean(row.address),
    unit: clean(row.unit),
    status: listingStatus(row),
    price: priceFromFacts(row),
    beds: Number(clean(row.beds)) || undefined,
    baths: Number(clean(row.baths)) || undefined,
    squareFeet: Number(clean(row.square_feet || row.sqft)) || undefined,
    mlsNumber: mlsNumber(row),
    latitude,
    longitude,
    media,
    description: clean(row.summary || row.interest_copy),
    representative: { name: "Legends Real Estate", organizationId: LEGENDS_ORGANIZATION_ID },
    sourceUrl: clean(row.source_url),
    sourceSystem: "approved-brokerage-feed",
    sourceRecordId: mlsNumber(row) || id,
    sourceUpdatedAt: clean(row.source_updated_at),
    importedAt: clean(row.imported_at),
    verifiedAt: clean(row.verified_at),
    displayPermission: "public",
    marker: {
      markerId: id,
      entityId: id,
      entityType: "listing",
      position: { lat: latitude, lng: longitude },
      icon: LEGENDS_PIN_ASSET,
      anchor: "bottom-center",
      size: STANDARD_MAP_PIN_SIZE,
    },
  };
}

export function publicListing(listing) {
  return {
    id: listing.id,
    organizationId: listing.organizationId,
    propertyId: listing.propertyId,
    address: listing.address,
    unit: listing.unit,
    status: listing.status,
    price: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    squareFeet: listing.squareFeet,
    mlsNumber: listing.mlsNumber,
    latitude: listing.latitude,
    longitude: listing.longitude,
    media: listing.media,
    description: listing.description,
    representative: listing.representative,
    sourceUrl: listing.sourceUrl,
    verifiedAt: listing.verifiedAt,
    displayPermission: listing.displayPermission,
    marker: listing.marker,
  };
}

export function adminListing(listing) {
  return listing;
}

export function getLegendsListings({ includeNonPublic = false } = {}) {
  const rows = parseCsv(readFileSync(GENERATED_LISTINGS_CSV, "utf8"));
  return rows.map(normalizeLegendsListing)
    .filter((listing) => listing.id && Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude))
    .filter((listing) => includeNonPublic || listing.displayPermission === "public");
}

export function getLegendsListingById(listingId) {
  const id = clean(listingId);
  return getLegendsListings({ includeNonPublic: true }).find((listing) => listing.id === id || listing.mlsNumber === id) || null;
}

export function getLegendsProperty(propertyId) {
  const listings = getLegendsListings({ includeNonPublic: true }).filter((listing) => listing.propertyId === propertyId);
  if (!listings.length) return null;
  const [first] = listings;
  return { id: propertyId, organizationId: LEGENDS_ORGANIZATION_ID, name: propertyId === "the-shore" ? "The Shore" : first.address.split("#")[0].trim(), latitude: first.latitude, longitude: first.longitude, listingCount: listings.length, listings: listings.map(publicListing) };
}

export function getRelatedLegendsListings(listingId) {
  const listing = getLegendsListingById(listingId);
  if (!listing) return [];
  return getLegendsListings().filter((item) => item.id !== listing.id && (item.propertyId === listing.propertyId || item.status === "active")).slice(0, 6).map(publicListing);
}

export function getDowntownTop10Listings() {
  return getLegendsListings()
    .filter((listing) => listing.status === "active" && listing.displayPermission === "public" && listing.media.length && Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude))
    .slice(0, 10)
    .map((listing, index) => ({ ...publicListing(listing), rank: index + 1, whyFeatured: "Active Legends listing with validated coordinates, public display permission, and approved media." }));
}

export function getListingQualityRows() {
  return getLegendsListings({ includeNonPublic: true }).map((listing) => ({
    listingId: listing.id,
    propertyId: listing.propertyId,
    organizationId: listing.organizationId,
    status: listing.status,
    issues: [!listing.address ? "missing_address" : "", !Number.isFinite(listing.latitude) || !Number.isFinite(listing.longitude) ? "invalid_coordinates" : "", !listing.media.length ? "missing_media" : "", !listing.displayPermission ? "missing_display_permission" : ""].filter(Boolean),
    sourceSystem: listing.sourceSystem,
    sourceRecordId: listing.sourceRecordId,
    verifiedAt: listing.verifiedAt,
  }));
}
