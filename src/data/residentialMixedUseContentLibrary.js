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
    "/images/map-entities/attached/properties/paseo/daydreamer-lobby.jpeg",
    "/images/map-entities/attached/properties/paseo/rooftop-pool.jpeg",
    "/images/map-entities/attached/properties/paseo/exterior-sunset.jpeg",
    "/images/reports/paseo-deck.jpeg",
    "/images/reports/paseo-gym.webp",
    "/images/reports/paseo-pool.webp",
    "/images/residential-content/paseo-amenity.jpg",
  ],
  "the-shore": ["/images/residential-content/the-shore-hospitality.webp"],
  "700-river": ["/images/residential-content/700-river-shared-access.jpeg"],
};

const AUDIENCE_EDITORIAL_OVERRIDES = {
  "70-rainey": {
    residentSummary: "Step out of Rainey’s energy into a garden-led residential retreat with pools, dedicated wellness spaces, pet-friendly amenities, and the lake close by.",
    partnerSummary: "Use 70 Rainey’s wellness, landscape, and private-amenity strengths to create selective resident programs that add value without disrupting the building’s sense of retreat.",
    residentOverview: "70 Rainey pairs a private condominium setting with rooftop gardens, extensive wellness amenities, concierge service, and an easy walk to Rainey Street, the MACC, and Lady Bird Lake.",
    partnerOverview: "A premium Rainey condominium community whose strongest positioning is calm, wellness-led living in the center of an active downtown district.",
    residentBenefits: "With property approval, residents could receive wellness and recovery offers, private dining moments, pet-care benefits, and easier access to selected Rainey reservations.",
    partnerValueNarrative: "Build an approval-led resident program around recovery, private dining, pet services, and low-friction reservations. Keep every activation useful, quiet, and consistent with the property’s premium residential experience.",
    residentDifferentiator: "Layered gardens and wellness spaces create a genuine sense of retreat, while Rainey Street and the lake remain only a short walk away.",
    partnerDifferentiator: "70 Rainey can offer residents downtown access without making nightlife the center of the experience—a distinctive platform for thoughtful wellness and hospitality partnerships.",
    residentRoutines: ["Start the day on the east-facing yoga terrace.", "Choose the secluded plunge pool for a quieter reset.", "Pair herb-garden programming with seasonal food and wellness experiences.", "Take the quieter route toward the MACC and Lady Bird Lake."],
    partnerActivationIdeas: ["Morning movement and recovery sessions designed for residents.", "Seasonal garden programming with approved culinary partners.", "Private dining and reservation support for low-friction evenings.", "Pet-wellness partnerships connected to the building’s pet amenities."],
    residentGoodFor: ["Quiet wellness routines", "Pool and garden days", "Easy lake access", "Pet-friendly living", "Rainey on your terms"],
    partnerCampaigns: ["Resident recovery series", "Garden season", "Private dining access", "Pet wellness partners", "Quiet luxury downtown"],
    residentActions: [{ label: "Explore wellness and gardens", type: "section" }, { label: "View shared amenities", type: "section" }, { label: "Explore nearby", type: "section" }, { label: "Save", type: "save" }, { label: "Contact property", type: "contact" }],
    partnerActions: [{ label: "Plan a wellness campaign", type: "campaign" }, { label: "Shape amenity programming", type: "section" }, { label: "Review audience", type: "audience" }, { label: "Open reports", type: "reports" }],
    residentDisclosure: "These benefit ideas are not currently advertised as active. Availability depends on approval from 70 Rainey.",
    partnerDisclosure: "Campaigns, access, and benefit claims must be approved by 70 Rainey before publication.",
    sourceLabel: "Visit the official 70 Rainey website",
  },
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
  const editorialOverride = AUDIENCE_EDITORIAL_OVERRIDES[row.entity_id] || {};
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
    residentOverview: row.listing_brand_property_business_overview,
    partnerOverview: row.partner_panel_copy,
    sharedAmenities: list(row.shared_amenities),
    residentPerk: row.resident_perk,
    residentBenefits: row.resident_perk,
    partnerValueNarrative: row.resident_perk,
    secretSauce: row.secret_sauce,
    residentDifferentiator: row.secret_sauce,
    partnerDifferentiator: row.secret_sauce,
    hiddenGems: list(row.hidden_gem),
    residentRoutines: list(row.hidden_gem),
    partnerActivationIdeas: list(row.hidden_gem),
    campaignAlignment: list(row.campaign_alignment),
    residentGoodFor: list(row.campaign_alignment),
    partnerCampaigns: list(row.campaign_alignment),
    residentActions: actionList(row.resident_actions),
    partnerActions: actionList(row.partner_actions),
    residentContextLabels: list(row.resident_context_labels),
    partnerContextLabels: list(row.partner_context_labels),
    searchKeywords: list(row.search_tags),
    sourceUrl: row.source_url,
    sourceLabel: "View official source",
    verificationStatus: row.verification_status,
    residentDisclosure: "Access and benefit concepts require property approval before publication.",
    partnerDisclosure: "Campaigns, access, and benefit claims require property approval before publication.",
    residentialContentSystem: "canonical-residential-mixed-use",
    source: "Downtown Perks canonical residential mixed-use CSV",
    rawCsvRow: row,
    ...editorialOverride,
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
