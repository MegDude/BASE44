import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

const LOCATIONS_PATH = path.join(
  projectRoot,
  "src/data/archive-imports/raw/downtown_austin_locations_1775185538585.csv"
);
const LISTINGS_PATH = path.join(
  projectRoot,
  "src/data/archive-imports/raw/downtown_austin_drawn_map_listings_1775518617289.csv"
);
const OPENAPI_PATH = path.join(projectRoot, "src/docs/archive-contracts/perks-dashboard-openapi.yaml");

let catalogPromise = null;

function normalizeSearchText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseCsvLine(line = "") {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(text = "") {
  const lines = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim());

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = cells[index] ?? "";
      return record;
    }, {});
  });
}

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  const next = Number.parseFloat(String(value || "").trim());
  return Number.isFinite(next) ? next : null;
}

function inferDistrict(address = "", name = "") {
  const text = `${address} ${name}`.toLowerCase();
  if (text.includes("rainey")) return "Rainey";
  if (text.includes("red river")) return "Red River";
  if (text.includes("seaholm")) return "Seaholm";
  if (text.includes("congress")) return "Congress";
  if (text.includes("6th")) return "6th Street";
  if (text.includes("2nd")) return "2nd Street";
  if (text.includes("waterloo")) return "Waterloo";
  if (text.includes("south congress")) return "South Congress";
  return "Downtown Core";
}

function normalizeLocationCategory(value = "") {
  const category = String(value).toLowerCase();
  if (category.includes("coffee")) return "Coffee";
  if (category.includes("restaurant") || category.includes("food")) return "Dining";
  if (category.includes("bar") || category.includes("nightlife") || category.includes("pub")) return "Nightlife";
  if (category.includes("hotel")) return "Hotel";
  if (category.includes("wellness") || category.includes("spa") || category.includes("fitness")) return "Wellness";
  if (category.includes("retail") || category.includes("shopping")) return "Retail";
  if (category.includes("park")) return "Park";
  return value || "Place";
}

function normalizeLocation(row = {}) {
  const latitude = toNumber(row.latitude);
  const longitude = toNumber(row.longitude);
  const name = row.name || "Downtown Place";
  const category = normalizeLocationCategory(row.category || row.sourceCategory || "Place");
  const district = inferDistrict(row.address, name);
  const specialsParts = [row.specials, row.deals_offers].filter(
    (value) => value && !/no public|not listed/i.test(String(value))
  );
  const specials = specialsParts.join(" · ");
  const supportsEvents =
    Boolean(row.events_available) && !/no public|not listed/i.test(String(row.events_available || ""));
  const hasHours = Boolean(row.operating_hours) && !/not listed/i.test(String(row.operating_hours || ""));

  return {
    id: row.id || `archive-place-${toSlug(name)}`,
    type: "location",
    name,
    category,
    district,
    latitude,
    longitude,
    address: row.address || "Downtown Austin",
    summary: row.summary || row.alignment_to_downtown_perks || "",
    alignment: row.alignment_to_downtown_perks || "",
    operatingHours: hasHours ? row.operating_hours : "",
    contactPhone: row.contact_phone || "",
    contactEmail: row.contact_email || "",
    website: row.website || "",
    specials,
    hasSpecials: specialsParts.length > 0,
    supportsEvents,
    source: row.source || "Archive import",
    lastEnrichedUtc: row.last_enriched_utc || "",
    searchText: normalizeSearchText([
      name,
      category,
      district,
      row.summary,
      row.alignment_to_downtown_perks,
      row.address,
      row.specials,
      row.deals_offers,
      row.events_available,
    ]
      .filter(Boolean)
      .join(" ")),
  };
}

function normalizeListing(row = {}) {
  const address = row.address || "Downtown Austin";
  const district = inferDistrict(address, row.search_term);
  const beds = row.beds ? `${row.beds} Bed` : null;
  const baths = row.baths ? `${row.baths} Bath` : null;
  const sqft = row.sqft ? `${row.sqft} Sq Ft` : null;

  return {
    id: `archive-listing-${toSlug(`${address}-${row.mls}`)}`,
    type: "listing",
    searchTerm: row.search_term || "Property",
    address,
    district,
    status: row.status || "Unknown",
    priceUsd: row.price_usd || "",
    beds: row.beds || "",
    baths: row.baths || "",
    sqft: row.sqft || "",
    mls: row.mls || "",
    summary: [row.status, beds, baths, sqft].filter(Boolean).join(" · "),
    searchText: normalizeSearchText([
      row.search_term,
      address,
      district,
      row.status,
      row.price_usd,
      row.beds,
      row.baths,
      row.sqft,
      row.mls,
    ]
      .filter(Boolean)
      .join(" ")),
  };
}

function buildCounts(items = [], accessor) {
  return items.reduce((store, item) => {
    const key = accessor(item);
    if (!key) return store;
    store[key] = Number(store[key] || 0) + 1;
    return store;
  }, {});
}

function toTopEntries(counts, labelKey) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({ [labelKey]: label, count }));
}

async function loadCatalogFromDisk() {
  const [locationsCsv, listingsCsv] = await Promise.all([
    readFile(LOCATIONS_PATH, "utf8"),
    readFile(LISTINGS_PATH, "utf8"),
  ]);

  const locations = parseCsv(locationsCsv)
    .map(normalizeLocation)
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  const listings = parseCsv(listingsCsv).map(normalizeListing);

  const byCategory = buildCounts(locations, (item) => item.category);
  const byDistrict = buildCounts([...locations, ...listings], (item) => item.district);

  return {
    manifest: {
      importedAt: new Date().toISOString(),
      archiveSources: [
        {
          id: "downtown-perks-map",
          type: "map-catalog",
          file: path.relative(projectRoot, LOCATIONS_PATH),
          records: locations.length,
        },
        {
          id: "downtown-perks-listings",
          type: "property-listings",
          file: path.relative(projectRoot, LISTINGS_PATH),
          records: listings.length,
        },
        {
          id: "perks-dashboard-contract",
          type: "openapi-contract",
          file: path.relative(projectRoot, OPENAPI_PATH),
        },
      ],
      capabilities: [
        "archive search",
        "catalog summary",
        "district rollups",
        "specials and offer lookup",
        "listing inventory lookup",
      ],
    },
    locations,
    listings,
    summary: {
      totalLocations: locations.length,
      totalListings: listings.length,
      locationsWithSpecials: locations.filter((item) => item.hasSpecials).length,
      locationsWithEvents: locations.filter((item) => item.supportsEvents).length,
      locationsWithHours: locations.filter((item) => item.operatingHours).length,
      topCategories: toTopEntries(byCategory, "category"),
      topDistricts: toTopEntries(byDistrict, "district"),
    },
  };
}

export async function loadArchiveCatalog() {
  if (!catalogPromise) {
    catalogPromise = loadCatalogFromDisk().catch((error) => {
      catalogPromise = null;
      throw error;
    });
  }
  return catalogPromise;
}

export async function getArchiveManifest() {
  const catalog = await loadArchiveCatalog();
  return catalog.manifest;
}

export async function getArchiveSummary() {
  const catalog = await loadArchiveCatalog();
  return catalog.summary;
}

export async function searchArchiveCatalog(query = "", { limit = 20, types = [] } = {}) {
  const catalog = await loadArchiveCatalog();
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const activeTypes = new Set((types || []).map((value) => String(value).toLowerCase()));
  const allItems = [...catalog.locations, ...catalog.listings];

  let items = allItems;

  if (activeTypes.size > 0) {
    items = items.filter((item) => activeTypes.has(item.type));
  }

  if (normalizedQuery) {
    const normalizedSearch = normalizeSearchText(normalizedQuery);
    const tokens = normalizedSearch.split(/\s+/).filter(Boolean);
    items = items
      .map((item) => ({
        ...item,
        _score: tokens.reduce((score, token) => {
          if (!token) return score;
          return score + (item.searchText.includes(token) ? 8 : 0);
        }, item.searchText.includes(normalizedSearch) ? 12 : 0),
      }))
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score);
  }

  const deduped = [];
  const seen = new Set();

  for (const item of items) {
    const key = `${normalizeSearchText(item.name)}|${normalizeSearchText(item.address || item.district || "")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, limit).map(({ _score, ...item }) => item);
}
