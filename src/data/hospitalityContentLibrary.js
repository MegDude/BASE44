import hospitalityCsvText from "./imports/downtown_perks_hospitality_map_copy_deck.csv?raw";

const HOTEL_DEFAULTS = {
  "brand-hotel-van-zandt": {
    name: "Hotel Van Zandt",
    latitude: 30.2598,
    longitude: -97.7392,
    district: "Rainey",
    address: "605 Davis St, Austin, TX 78701",
    image: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
  },
  "brand-fairmont-austin": {
    name: "Fairmont Austin",
    latitude: 30.262108,
    longitude: -97.738204,
    district: "Red River",
    address: "101 Red River St, Austin, TX 78701",
    image: "/images/map-entities/fairmont-austin/fairmont-austin-skyline.jpg",
  },
};

const MAP_ENTITY_ALIASES = {
  "partner-hotel-van-zandt": ["hotel-van-zandt", "brand-hotel-van-zandt"],
  "partner-fairmont-austin": ["brand-fairmont-austin"],
  "partner-four-seasons": ["four-seasons-austin", "brand-four-seasons"],
  "partner-austin-marriott-downtown": ["austin-marriott-downtown", "brand-austin-marriott-downtown"],
  "partner-austin-proper": ["austin-proper"],
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "").replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = (rows.shift() || []).map((header) => header.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, String(values[index] ?? "").trim()])));
}

function list(value) {
  return String(value || "").split(/\s*\|\s*/).map((item) => item.trim()).filter(Boolean);
}

function boolean(value) {
  return /^(true|yes|1)$/i.test(String(value || ""));
}

function actionType(label, target) {
  const text = `${label} ${target}`.toLowerCase();
  if (text.includes("toggle_saved_state") || /^save\b/.test(text)) return "toggle_saved_state";
  if (text.includes("toggle_rsvp_state")) return "toggle_rsvp_state";
  if (text.includes("open_visibility_controls")) return "open_visibility_controls";
  if (text.includes("open_audience_view")) return "open_audience_view";
  if (text.includes("open_offer_subview")) return "open_offer_subview";
  if (text.includes("open_venue_subview")) return "open_venue_subview";
  if (text.includes("open_property_contact_form")) return "open_property_contact_form";
  if (/google_maps_url|directions|route/.test(text)) return "route";
  return /^https?:\/\//i.test(target) ? "external" : "route";
}

function actions(value) {
  return list(value).map((item) => {
    const [label = "Open", target = ""] = item.split(/\s*->\s*/, 2);
    return { label: label.trim(), type: actionType(label, target), target: target.trim() };
  });
}

function insights(value) {
  return list(value).map((item) => {
    const [label, ...rest] = item.split(/\s*:\s*/);
    return { label: label || "Detail", value: rest.join(": ") || label || "" };
  });
}

function normalizedValidThrough(value) {
  const match = String(value || "").match(/(20\d{2})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

export function getHospitalityOfferState(entity, now = new Date()) {
  const validThrough = normalizedValidThrough(entity?.validThrough || entity?.valid_through);
  if (!validThrough) return entity?.verificationStatus ? "verification_required" : "verification_required";
  const expiry = new Date(`${validThrough}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) return "verification_required";
  const remainingDays = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
  if (remainingDays < 0) return "expired";
  if (remainingDays <= 14) return "expiring_soon";
  return "active";
}

function transformRow(row) {
  const parent = HOTEL_DEFAULTS[row.parent_entity_id] || {};
  const latitude = Number(row.latitude || parent.latitude);
  const longitude = Number(row.longitude || parent.longitude);
  const residentActions = actions(row.resident_actions);
  const partnerActions = actions(row.partner_actions);
  const entity = {
    id: row.entity_id,
    parentEntityId: row.parent_entity_id || undefined,
    parentHotelId: row.parent_entity_id || undefined,
    parentHotelName: parent.name || undefined,
    slug: row.slug || row.entity_id,
    name: row.name,
    recordStatus: row.record_status,
    recordType: row.record_type,
    type: row.record_type === "perk" ? "perk" : row.record_type,
    kind: row.record_type === "perk" ? "hospitality-offer" : row.record_type,
    entityType: row.record_type,
    category: row.category || row.record_type,
    partnerType: row.partner_type || (row.parent_entity_id ? "hotels" : row.record_type),
    brand: row.brand || parent.name,
    district: row.district || parent.district || "Downtown Austin",
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    address: row.address || parent.address || "",
    sourceLayer: row.source_layer,
    pin: { key: row.pin_key, label: row.pin_label, assetPath: row.pin_asset_path },
    pinKey: row.pin_key || (row.record_type === "perk" ? "offer" : row.record_type),
    pinAssetPath: row.pin_asset_path,
    hasPerk: boolean(row.has_perk),
    isInKind: boolean(row.is_inkind),
    offerSummary: row.offer_summary,
    overview: row.listing_brand_property_business_overview,
    residentPanel: {
      badge: row.resident_badge,
      eyebrow: row.resident_eyebrow,
      meta: list(row.resident_meta),
      description: row.resident_panel_copy || row.offer_summary || row.listing_brand_property_business_overview,
      signal: row.resident_signal,
      contextLabels: list(row.resident_context_labels),
      insightGrid: insights(row.resident_insight_grid),
      actions: residentActions,
    },
    partnerPanel: {
      badge: row.partner_badge,
      eyebrow: row.partner_eyebrow,
      meta: list(row.partner_meta),
      description: row.partner_panel_copy || row.offer_summary || row.listing_brand_property_business_overview,
      signal: row.partner_signal,
      contextLabels: list(row.partner_context_labels),
      insightGrid: insights(row.partner_insight_grid),
      actions: partnerActions,
    },
    image: row.image_path || parent.image,
    heroImage: row.image_path || parent.image,
    sourceUrl: row.source_url,
    website: row.source_url,
    bookingUrl: row.source_url,
    validThrough: normalizedValidThrough(row.valid_through),
    validThroughLabel: row.valid_through,
    termsSummary: row.terms_summary,
    verificationStatus: row.verification_status,
    amenityNetwork: row.parent_entity_id || ["brand-hotel-van-zandt", "brand-fairmont-austin", "hotel-van-zandt"].includes(row.entity_id) ? "downtown-hospitality" : undefined,
    primaryAction: residentActions[0]?.label || "View details",
    secondaryAction: residentActions[1]?.label || "Save",
    summary: row.resident_panel_copy || row.offer_summary || row.listing_brand_property_business_overview,
    description: row.resident_panel_copy || row.offer_summary || row.listing_brand_property_business_overview,
    residentSummary: row.resident_panel_copy || row.offer_summary,
    partnerSummary: row.partner_panel_copy || row.offer_summary,
    highlights: list(row.resident_context_labels),
    bestFor: list(row.resident_meta),
    source: "Downtown Perks canonical hospitality CSV",
    rawCsvRow: row,
  };
  return { ...entity, offerState: getHospitalityOfferState(entity) };
}

export const hospitalityCsvRows = parseCsv(hospitalityCsvText);
export const hospitalityEntities = hospitalityCsvRows.map(transformRow);
export const hospitalityCurrentEntityUpdates = hospitalityEntities.filter((entity) => entity.recordStatus === "current_map_entity");
export const hospitalityChildEntities = hospitalityEntities.filter((entity) => entity.recordStatus === "new_enriched_hospitality_record");
export const hospitalityOfferEntities = hospitalityChildEntities.filter((entity) => entity.recordType === "perk");
export const hospitalityAmenityEntities = hospitalityChildEntities.filter((entity) => entity.recordType === "amenity");
export const hospitalityParentEntities = hospitalityCurrentEntityUpdates.filter((entity) => ["hotel-van-zandt", "brand-hotel-van-zandt", "brand-fairmont-austin"].includes(entity.id));
export const hospitalityContentLibraryEntities = [...hospitalityParentEntities, ...hospitalityChildEntities];
export const hospitalityRelationships = [
  ...hospitalityChildEntities.map((entity) => ({
    fromEntityId: entity.id,
    toEntityId: entity.parentEntityId,
    relationshipType: "inside_property",
  })),
  { fromEntityId: "geraldines", toEntityId: "brand-hotel-van-zandt", relationshipType: "inside_property" },
  { fromEntityId: "brand-geraldines", toEntityId: "brand-hotel-van-zandt", relationshipType: "inside_property" },
  { fromEntityId: "brand-hotel-van-zandt", toEntityId: "rainey-food-drink-loop", relationshipType: "nearby_walkable" },
];

const updateById = new Map(hospitalityCurrentEntityUpdates.map((entity) => [entity.id, entity]));
const updateBySlug = new Map(hospitalityCurrentEntityUpdates.filter((entity) => entity.slug).map((entity) => [entity.slug, entity]));

export function getHospitalityCsvUpdate(item) {
  const id = String(item?.id || item?.raw?.id || "");
  const slug = String(item?.slug || item?.raw?.slug || "");
  const aliases = [
    ...(MAP_ENTITY_ALIASES[id] || []),
    ...(slug && slug !== id ? MAP_ENTITY_ALIASES[slug] || [] : []),
  ];
  return updateById.get(id) || (slug ? updateBySlug.get(slug) : null) || aliases.map((alias) => updateById.get(alias) || updateBySlug.get(alias)).find(Boolean) || null;
}

export const hospitalityImportReport = {
  rowCount: hospitalityEntities.length,
  currentEntityCount: hospitalityCurrentEntityUpdates.length,
  newHospitalityRecordCount: hospitalityChildEntities.length,
  duplicateEntityIds: hospitalityEntities.filter((entity, index, list) => list.findIndex((candidate) => candidate.id === entity.id) !== index).map((entity) => entity.id),
  parentCounts: hospitalityChildEntities.reduce((counts, entity) => ({ ...counts, [entity.parentEntityId]: (counts[entity.parentEntityId] || 0) + 1 }), {}),
};
