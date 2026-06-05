import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  luxuryPresenceBuildings,
  luxuryPresenceInventorySummary,
  luxuryPresenceListings,
} from "../src/data/luxuryPresenceInventory.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "public", "inventory", "luxury-presence");

function csvEscape(value) {
  if (Array.isArray(value)) return csvEscape(value.join(" | "));
  if (value && typeof value === "object") return csvEscape(JSON.stringify(value));
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(name, rows, columns) {
  const body = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n");
  return writeFile(join(outDir, name), `${body}\n`);
}

await mkdir(outDir, { recursive: true });

await writeCsv(
  "listings.csv",
  luxuryPresenceListings.map((listing) => ({
    listing_id: listing.listing_id,
    address: listing.address,
    unit: listing.unit,
    building_name: listing.building_name,
    price: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    mls_number: listing.mls_number,
    status: listing.status,
    district: listing.district,
    lat: listing.lat,
    lng: listing.lng,
    image_url: listing.image_url,
    listing_url: listing.listing_url,
    property_type: listing.property_type,
    listing_type: listing.listing_type,
    zip_code: listing.zip_code,
    source: listing.source,
    updated_at: listing.updated_at,
  })),
  [
    "listing_id",
    "address",
    "unit",
    "building_name",
    "price",
    "beds",
    "baths",
    "sqft",
    "mls_number",
    "status",
    "district",
    "lat",
    "lng",
    "image_url",
    "listing_url",
    "property_type",
    "listing_type",
    "zip_code",
    "source",
    "updated_at",
  ],
);

await writeCsv(
  "buildings.csv",
  luxuryPresenceBuildings.map((building) => ({
    building_id: building.id,
    building_name: building.name,
    address: building.address,
    district: building.district,
    lat: building.latitude,
    lng: building.longitude,
    active_listings: building.activeListings,
    price_range: building.priceRange,
    sqft_range: building.sqftRange,
    average_price: building.averagePrice,
    source: building.source,
    updated_at: building.updated_at,
  })),
  [
    "building_id",
    "building_name",
    "address",
    "district",
    "lat",
    "lng",
    "active_listings",
    "price_range",
    "sqft_range",
    "average_price",
    "source",
    "updated_at",
  ],
);

await writeCsv(
  "property-images.csv",
  luxuryPresenceListings.map((listing) => ({
    listing_id: listing.listing_id,
    building_name: listing.building_name,
    primaryImage: listing.primaryImage,
    heroImage: listing.heroImage,
    panelImage: listing.panelImage,
    mobileCardImage: listing.mobileCardImage,
    galleryImages: listing.galleryImages,
    thumbnail: listing.thumbnail,
  })),
  [
    "listing_id",
    "building_name",
    "primaryImage",
    "heroImage",
    "panelImage",
    "mobileCardImage",
    "galleryImages",
    "thumbnail",
  ],
);

await writeCsv(
  "building-images.csv",
  luxuryPresenceBuildings.map((building) => ({
    building_id: building.id,
    building_name: building.name,
    buildingExterior: building.buildingExterior,
    lifestyleImage: building.lifestyleImage,
    districtImage: building.districtImage,
    heroImage: building.heroImage,
    panelImage: building.panelImage,
    thumbnail: building.thumbnail,
  })),
  [
    "building_id",
    "building_name",
    "buildingExterior",
    "lifestyleImage",
    "districtImage",
    "heroImage",
    "panelImage",
    "thumbnail",
  ],
);

await writeCsv(
  "property-panels.csv",
  luxuryPresenceBuildings.map((building) => ({
    building_id: building.id,
    title: building.panelContent.title,
    subhead: building.panelContent.subhead,
    body: building.panelContent.body,
    facts: building.panelContent.facts,
    cta: building.panelContent.cta,
    secondaryActions: building.panelContent.secondaryActions,
  })),
  ["building_id", "title", "subhead", "body", "facts", "cta", "secondaryActions"],
);

await writeFile(
  join(outDir, "summary.json"),
  `${JSON.stringify(luxuryPresenceInventorySummary, null, 2)}\n`,
);

console.log(`Luxury Presence inventory exported to ${outDir}`);
