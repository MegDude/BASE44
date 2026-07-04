import csvText from "./legends_full_listings_generated.csv?raw";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records
    .filter((record) => record.some(Boolean))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

function splitList(value) {
  return String(value || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLegendsPinAsset(value) {
  const asset = String(value || "").trim();
  if (!asset || /legends/i.test(asset)) return "/pins/circular/special/legends-badge.svg";
  return asset.startsWith("/") ? asset : `/pins/${asset}`;
}

export const legendsGeneratedListings = parseCsv(csvText).map((row) => ({
  id: row.listing_id,
  buildingName: row.building_name,
  unit: row.unit,
  address: row.address,
  neighborhood: row.neighborhood,
  propertyType: row.property_type,
  style: row.style,
  walkability: row.walkability,
  residentExperience: row.resident_experience,
  panelMetadata: row.panel_metadata,
  panelTitle: row.panel_title,
  panelSubtitle: row.panel_subtitle,
  summary: row.summary,
  benefitMatrix: splitList(row.benefit_matrix),
  walkableNearby: row.walkable_nearby,
  coffee: splitList(row.coffee),
  dining: splitList(row.dining),
  drinks: splitList(row.drinks),
  wellness: splitList(row.wellness),
  groceries: splitList(row.groceries),
  whyItMatters: row.why_it_matters,
  placesNearby: splitList(row.places_nearby),
  goodToKnow: splitList(row.good_to_know),
  listingFacts: row.listings,
  interestCopy: row.interest_copy,
  ctaPrimary: row.cta_primary,
  ctaSecondary: row.cta_secondary,
  ctaListing: row.cta_listing,
  ctaTour: row.cta_tour,
  ctaContact: row.cta_contact,
  imageAsset: row.image_asset,
  pinAsset: normalizeLegendsPinAsset(row.pin_asset),
}));

export function getGeneratedLegendsListingsForRecord(record) {
  if (!record) return [];
  const raw = record.raw || {};
  const rental = record.rentalListing || raw.rentalListing || {};
  const legendsListing = record.legendsListing || raw.legendsListing || {};
  const candidates = [
    record.id,
    record.name,
    record.title,
    record.address,
    record.building,
    record.buildingName,
    rental.id,
    rental.address,
    rental.building,
    legendsListing.id,
    legendsListing.address,
    legendsListing.building,
    legendsListing.buildingName,
  ].map(normalize).filter(Boolean);

  return legendsGeneratedListings.filter((listing) => {
    const listingKeys = [
      listing.id,
      listing.address,
      listing.buildingName,
      `${listing.buildingName} ${listing.unit}`,
    ].map(normalize).filter(Boolean);
    return listingKeys.some((key) => candidates.some((candidate) => candidate === key || candidate.includes(key) || key.includes(candidate)));
  });
}
