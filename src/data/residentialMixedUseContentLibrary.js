import residentialCsvText from "./imports/downtown_perks_residential_mixed_use_copy_deck.csv?raw";

const BUILDING_COORDINATES = {
  "44-east-ave": [30.2583, -97.7397], "natiivo-austin": [30.259, -97.7386], "the-shore": [30.258, -97.7389],
  milago: [30.2572, -97.738], "70-rainey": [30.2585, -97.739], vesper: [30.2602, -97.7391],
  "the-quincy": [30.2604, -97.7401], "waterline-residences": [30.2594, -97.7385], paseo: [30.2607, -97.7387],
  "700-river": [30.26, -97.7382], "the-independent": [30.2693, -97.7511], "fifth-and-west": [30.2691, -97.75],
  "the-austonian": [30.2642, -97.7447], "360-condominiums": [30.2674, -97.7505], "spring-condominiums": [30.2683, -97.7519],
  "austin-proper-residences": [30.268, -97.748], "four-seasons-residences": [30.2618, -97.7428], "the-catherine": [30.2555, -97.744],
  northshore: [30.2685, -97.7507], "the-monarch": [30.2677, -97.7495],
};

const IMAGE_EXTENSIONS = {
  "the-quincy": "webp", paseo: "webp", "fifth-and-west": "jpeg", "austin-proper-residences": "jpeg", "the-monarch": "avif",
};
const BUILDING_GALLERIES = {
  paseo: [
    "/images/residential-content/paseo-amenity.jpg",
    "/images/residential-content/shared-access-amenity.jpeg",
    "/images/residential-content/shared-access-downtown-lake.jpeg",
  ],
  "the-shore": ["/images/residential-content/the-shore-hospitality.webp"],
  "700-river": [
    "/images/residential-content/shared-access-700-red-river.jpeg",
    "/images/residential-content/700-river-shared-access.jpeg",
    "/images/residential-content/shared-access-downtown-lake.jpeg",
  ],
};

function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') { if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted; }
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && source[index + 1] === "\n") index += 1; row.push(cell); if (row.some((value) => String(value).trim())) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() || []).map((header) => header.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] ?? "").trim()])));
}

const list = (value) => String(value || "").split(/\s*[;|]\s*/).map((item) => item.trim()).filter(Boolean);
const actionList = (value) => list(value).map((label) => ({ label, type: /save/i.test(label) ? "save" : /direction/i.test(label) ? "directions" : /contact/i.test(label) ? "contact" : /report/i.test(label) ? "reports" : /campaign/i.test(label) ? "campaign" : /audience/i.test(label) ? "audience" : /visibility|access/i.test(label) ? "visibility" : "section" }));

function transform(row) {
  const [latitude, longitude] = BUILDING_COORDINATES[row.entity_id] || [];
  const extension = IMAGE_EXTENSIONS[row.entity_id] || "jpg";
  return {
    id: row.entity_id,
    slug: row.entity_id,
    name: row.name,
    title: row.name,
    type: "property",
    kind: "residential",
    entityType: "residential_building",
    partnerType: "properties",
    category: row.building_type,
    district: row.district,
    latitude,
    longitude,
    address: `${row.district}, Austin, TX 78701`,
    image: `/images/residential-content/${row.entity_id}.${extension}`,
    heroImage: `/images/residential-content/${row.entity_id}.${extension}`,
    galleryImages: BUILDING_GALLERIES[row.entity_id] || [],
    pinKey: row.pin_key || "property",
    pinAssetPath: row.pin_asset_path,
    operatingStatus: row.operating_status,
    overview: row.listing_brand_property_business_overview,
    summary: row.resident_panel_copy,
    residentSummary: row.resident_panel_copy,
    partnerSummary: row.partner_panel_copy,
    sharedAmenities: list(row.shared_amenities),
    residentPerk: row.resident_perk,
    secretSauce: row.secret_sauce,
    hiddenGems: list(row.hidden_gem),
    campaignAlignment: list(row.campaign_alignment),
    residentActions: actionList(row.resident_actions),
    partnerActions: actionList(row.partner_actions),
    residentContextLabels: list(row.resident_context_labels),
    partnerContextLabels: list(row.partner_context_labels),
    searchKeywords: list(row.search_tags),
    sourceUrl: row.source_url,
    verificationStatus: row.verification_status,
    residentialContentSystem: "canonical-residential-mixed-use",
    source: "Downtown Perks canonical residential mixed-use CSV",
    rawCsvRow: row,
  };
}

export const residentialMixedUseCsvRows = parseCsv(residentialCsvText);
export const residentialMixedUseEntities = residentialMixedUseCsvRows.map(transform);
const byId = new Map(residentialMixedUseEntities.map((entity) => [entity.id, entity]));
const byName = new Map(residentialMixedUseEntities.map((entity) => [entity.name.toLowerCase(), entity]));

export function getResidentialMixedUseUpdate(item) {
  const id = String(item?.id || item?.raw?.id || "").toLowerCase();
  const name = String(item?.name || item?.title || item?.raw?.name || "").toLowerCase();
  return byId.get(id) || byName.get(name) || null;
}

export const residentialMixedUseImportReport = {
  rowCount: residentialMixedUseEntities.length,
  duplicateEntityIds: residentialMixedUseEntities.filter((entity, index, list) => list.findIndex((candidate) => candidate.id === entity.id) !== index).map((entity) => entity.id),
  districts: [...new Set(residentialMixedUseEntities.map((entity) => entity.district))],
};
