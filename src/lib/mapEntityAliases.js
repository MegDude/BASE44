import { legendsListingPlaces } from "@/data/legendsListings";
import { luxuryPresenceListings } from "@/data/luxuryPresenceInventory";
import { canonicalEntityAliasRegistry } from "@/data/production/canonicalEntityAliasRegistry";

export function normalizePropertyId(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(street)\b/g, "st")
    .replace(/\b(avenue)\b/g, "ave")
    .replace(/\b(unit|suite|apt|apartment)\b/g, " ")
    .replace(/#/g, " ")
    .replace(/\b(austin|texas|tx|united states|usa)\b/g, " ")
    .replace(/\b7870[0-9]\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const REMOVED_MAP_ENTITY_IDS = new Set([
  ["dot", "tie-may"].join(""),
  ["dot", "tie-may-venue"].join(""),
  ["featured-", "dot", "tie-may"].join(""),
]);

const REMOVED_MAP_ENTITY_TERMS = [
  ["dot", "tie may"].join(""),
  ["dot", "tie-may"].join(""),
  ["featured-", "dot", "tie-may"].join(""),
];

export function isRemovedMapEntityId(value) {
  const id = String(value || "").trim().toLowerCase();
  if (!id) return false;
  return REMOVED_MAP_ENTITY_IDS.has(id) || REMOVED_MAP_ENTITY_IDS.has(normalizePropertyId(id));
}

export function isRemovedMapEntity(entity = {}) {
  const haystack = [
    entity?.id,
    entity?.entityId,
    entity?.slug,
    entity?.name,
    entity?.title,
    entity?.raw?.id,
    entity?.raw?.entityId,
    entity?.raw?.slug,
    entity?.raw?.name,
    entity?.raw?.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return REMOVED_MAP_ENTITY_TERMS.some((term) => haystack.includes(term));
}

function parseLegacyOsmEntityId(value) {
  const match = String(value || "").trim().toLowerCase().match(/^(.+)-(node|way|relation|osm)-([0-9]+)$/);
  if (!match) return null;
  return {
    slug: normalizePropertyId(match[1]),
    osmType: match[2],
    osmId: match[3],
  };
}

function getEntityOsmId(entity) {
  return String(
    entity?.osm_id ??
      entity?.osmId ??
      entity?.raw?.osm_id ??
      entity?.raw?.osmId ??
      entity?.source?.osm_id ??
      "",
  ).trim();
}

function getEntityOsmType(entity) {
  return String(
    entity?.osm_type ??
      entity?.osmType ??
      entity?.raw?.osm_type ??
      entity?.raw?.osmType ??
      entity?.source?.osm_type ??
      "",
  ).trim().toLowerCase();
}

function getEntitySlugCandidates(entity) {
  return [
    entity?.slug,
    entity?.raw?.slug,
    entity?.id,
    entity?.entityId,
    entity?.raw?.id,
    entity?.raw?.entityId,
    entity?.name,
    entity?.title,
    entity?.raw?.name,
    entity?.raw?.title,
  ]
    .filter(Boolean)
    .map((value) => normalizePropertyId(value));
}

const BUILDING_NAME_ALIASES = {
  "70-rainey": "luxury-presence-70-rainey-st-1409-9192982",
  "44-east": "luxury-building-44-east",
  "44-east-ave": "luxury-building-44-east",
  "the-independent": "luxury-building-the-independent",
  independent: "luxury-building-the-independent",
  "seaholm-residences": "luxury-building-seaholm-residences",
  "fifth-and-west": "luxury-building-fifth-and-west",
  "fifth-west": "luxury-building-fifth-and-west",
  "360-condominiums": "luxury-building-360-condominiums",
  "360-nueces": "luxury-building-360-condominiums",
  "the-shore": "property-the-shore",
  "austin-proper-residences": "luxury-building-austin-proper-residences",
  "1212-guadalupe": "luxury-building-1212-guadalupe",
  milago: "luxury-building-milago",
  "spring-condominiums": "luxury-building-spring-condominiums",
  "brazos-place": "luxury-building-brazos-place",
};

const ADDRESS_BUILDING_ALIASES = {
  "70-rainey": "luxury-presence-70-rainey-st-1409-9192982",
  "70-rainey-st": "luxury-presence-70-rainey-st-1409-9192982",
  "44-east": "luxury-building-44-east",
  "44-east-ave": "luxury-building-44-east",
  "301-west-ave": "luxury-building-the-independent",
  "222-west-ave": "luxury-building-seaholm-residences",
  "501-west-ave": "luxury-building-fifth-and-west",
  "360-nueces": "luxury-building-360-condominiums",
  "360-nueces-st": "luxury-building-360-condominiums",
  "603-davis": "property-the-shore",
  "603-davis-st": "property-the-shore",
  "610-davis": "property-the-shore",
  "610-davis-st": "property-the-shore",
  "202-nueces": "luxury-building-austin-proper-residences",
  "202-nueces-st": "luxury-building-austin-proper-residences",
  "1212-guadalupe": "luxury-building-1212-guadalupe",
  "1212-guadalupe-st": "luxury-building-1212-guadalupe",
  "54-rainey": "luxury-building-milago",
  "54-rainey-st": "luxury-building-milago",
  "300-bowie": "luxury-building-spring-condominiums",
  "300-bowie-st": "luxury-building-spring-condominiums",
  "800-brazos": "luxury-building-brazos-place",
  "800-brazos-st": "luxury-building-brazos-place",
};

export const PROPERTY_BUILDING_TO_PUBLIC_ID = {
  "luxury-building-70-rainey": "70-rainey",
  "luxury-building-44-east": "44-east",
  "luxury-building-the-independent": "the-independent",
  "luxury-building-seaholm-residences": "seaholm-residences",
  "luxury-building-fifth-and-west": "fifth-and-west",
  "luxury-building-360-condominiums": "360-condominiums",
  "luxury-building-the-shore": "property-the-shore",
  "luxury-building-austin-proper-residences": "austin-proper-residences",
  "luxury-building-1212-guadalupe": "1212-guadalupe",
  "luxury-building-milago": "milago",
  "luxury-building-spring-condominiums": "spring-condominiums",
  "luxury-building-brazos-place": "brazos-place",
};

function baseAddressKey(address) {
  return normalizePropertyId(String(address || "").replace(/\s+(#|unit|suite|apt)\s*[\w-]+.*$/i, ""));
}

function unitKey(address, unit = "") {
  const normalizedAddress = normalizePropertyId(address);
  const normalizedUnit = normalizePropertyId(unit);
  return normalizedUnit && !normalizedAddress.endsWith(normalizedUnit)
    ? `${normalizedAddress}-${normalizedUnit}`
    : normalizedAddress;
}

function buildingIdForAddress(address) {
  const base = baseAddressKey(address);
  return ADDRESS_BUILDING_ALIASES[base] || null;
}

const listingAliasEntries = [
  ...luxuryPresenceListings.map((listing) => {
    const buildingId = BUILDING_NAME_ALIASES[slug(listing.building_name)] || buildingIdForAddress(listing.address);
    return { listing, buildingId };
  }),
  ...legendsListingPlaces.map((place) => {
    const listing = place.legendsListing || place.raw?.legendsListing || {};
    const buildingId = buildingIdForAddress(listing.address || place.address || place.name);
    return { listing: { ...listing, id: place.id, slug: place.slug, address: listing.address || place.address || place.name, unit: listing.unit }, buildingId };
  }),
].filter((entry) => entry.buildingId);

export const LEGENDS_LISTING_TO_BUILDING_ALIASES = listingAliasEntries.reduce((aliases, { listing, buildingId }) => {
  [
    listing.id,
    listing.listing_id,
    listing.slug,
    listing.address,
    unitKey(listing.address, listing.unit),
    `${listing.address || ""}-${listing.mls_number || listing.mlsNumber || ""}`,
  ].forEach((value) => {
    const key = normalizePropertyId(value);
    if (key) aliases[key] = buildingId;
  });
  return aliases;
}, {
  "70-rainey-st-1409-legends-property-70-rainey-st-1409-9192982": "luxury-presence-70-rainey-st-1409-9192982",
  "70-rainey-st-1409": "luxury-presence-70-rainey-st-1409-9192982",
  "70-rainey-1409": "luxury-presence-70-rainey-st-1409-9192982",
});

const NON_PROPERTY_URL_ENTITY_IDS = new Set([
  "rivian-downtown-austin-activation",
  "rivian-downtown-activation",
  "rivian-downtown-experience-layer",
  "campaign-rivian-downtown-experience-layer",
  "perk-rivian-waterfront-drive",
  "partner-rivian",
]);

const HOSPITALITY_URL_ENTITY_IDS = new Set(["hotel-van-zandt", "brand-hotel-van-zandt", "brand-fairmont-austin"]);
const RESIDENTIAL_CONTENT_URL_ENTITY_IDS = new Set([
  "44-east-ave", "natiivo-austin", "the-shore", "milago", "70-rainey", "vesper", "the-quincy", "waterline-residences", "paseo", "700-river",
  "the-independent", "fifth-and-west", "the-austonian", "360-condominiums", "spring-condominiums", "austin-proper-residences", "four-seasons-residences", "the-catherine", "northshore", "the-monarch",
]);

export function resolvePropertyEntityId(rawEntityId) {
  const normalized = normalizePropertyId(rawEntityId);
  if (!normalized) return "";
  if (BUILDING_NAME_ALIASES[normalized]) return BUILDING_NAME_ALIASES[normalized];
  if (LEGENDS_LISTING_TO_BUILDING_ALIASES[normalized]) return LEGENDS_LISTING_TO_BUILDING_ALIASES[normalized];
  return normalized;
}

export function resolvePropertyUrlEntityId(rawEntityId) {
  const hospitalityId = String(rawEntityId || "").trim().toLowerCase();
  if (/^(hvz-|fairmont-)/.test(hospitalityId) || HOSPITALITY_URL_ENTITY_IDS.has(hospitalityId) || RESIDENTIAL_CONTENT_URL_ENTITY_IDS.has(hospitalityId)) return hospitalityId;
  const resolved = resolvePropertyEntityId(rawEntityId);
  return PROPERTY_BUILDING_TO_PUBLIC_ID[resolved] || resolved;
}

export function resolvePropertyListingUrlId(rawEntityId) {
  const hospitalityId = String(rawEntityId || "").trim().toLowerCase();
  if (/^(hvz-|fairmont-)/.test(hospitalityId) || HOSPITALITY_URL_ENTITY_IDS.has(hospitalityId) || RESIDENTIAL_CONTENT_URL_ENTITY_IDS.has(hospitalityId)) return "";
  const normalized = normalizePropertyId(rawEntityId);
  if (!normalized) return "";
  if (NON_PROPERTY_URL_ENTITY_IDS.has(normalized)) return "";

  const matchingEntry = listingAliasEntries.find(({ listing }) => {
    return [
      listing.id,
      listing.listing_id,
      listing.slug,
      listing.address,
      unitKey(listing.address, listing.unit),
      `${listing.address || ""}-${listing.mls_number || listing.mlsNumber || ""}`,
    ].some((value) => normalizePropertyId(value) === normalized);
  });

  if (matchingEntry?.listing?.address) {
    const unit = normalizePropertyId(matchingEntry.listing.unit);
    return unit ? `${baseAddressKey(matchingEntry.listing.address)}-unit-${unit}` : normalizePropertyId(matchingEntry.listing.address);
  }
  if (normalized.includes("70-rainey") && normalized.includes("1409")) return "70-rainey-st-unit-1409";
  return normalized;
}

export const mapEntityAliases = {
  ...canonicalEntityAliasRegistry,
  bathe: "bathe-austin",
  "bathe-austin": "bathe-austin",
  "bathe-wellness": "bathe-austin",
  "bathe-bathhouse": "bathe-austin",
  "venue-antones": "antone-s-nightclub-way-929865592",
  "venue-antone-s": "antone-s-nightclub-way-929865592",
  "antones": "antone-s-nightclub-way-929865592",
  "antone-s": "antone-s-nightclub-way-929865592",
  "antone-s-nightclub": "antone-s-nightclub-way-929865592",
  "map-3-antone-s-nightclub": "antone-s-nightclub-way-929865592",
  "republic-ann-and-roy-butler-trail-access-culture-and-entertainment": "republic-austin-ann-and-roy-butler-trail-access-culture-and-entertainment",
  "ann-and-roy-butler-trail-access": "republic-austin-ann-and-roy-butler-trail-access-culture-and-entertainment",
  "butler-trail-access": "republic-austin-ann-and-roy-butler-trail-access-culture-and-entertainment",
  "the-independent": "priority-the-independent",
  "property-the-independent": "priority-the-independent",
  independent: "priority-the-independent",
  "the-austonian": "priority-the-austonian",
  austonian: "priority-the-austonian",
  "the-bowie": "priority-the-bowie",
  bowie: "priority-the-bowie",
  "amli-downtown": "priority-amli-downtown",
  amli: "priority-amli-downtown",
  "the-paseo": "priority-the-paseo",
  paseo: "priority-the-paseo",
  "44-east": "44-east",
  "the-waterline": "priority-the-waterline",
  waterline: "priority-the-waterline",
  "hotel-van-zandt": "partner-hotel-van-zandt",
  "van-zandt": "partner-hotel-van-zandt",
  "holiday-inn-town-lake": "map-475-holiday-inn-austin-town-lake",
  "holiday-inn-austin-town-lake": "map-475-holiday-inn-austin-town-lake",
  "holiday-inn-town-lake-way-134786196": "map-475-holiday-inn-austin-town-lake",
  "holiday-inn-austin-town-lake-way-134786196": "map-475-holiday-inn-austin-town-lake",
  fairmont: "partner-fairmont-austin",
  "fairmont-austin": "partner-fairmont-austin",
  "fairmont-hotel": "partner-fairmont-austin",
  "summer-wellness-series": "event-fairmont-summer-wellness",
  "fairmont-summer-wellness": "event-fairmont-summer-wellness",
  "fairmont-wellness": "event-fairmont-summer-wellness",
  "fairmont-yoga": "event-fairmont-summer-wellness",
  "fairmont-spa-yoga": "event-fairmont-summer-wellness",
  geraldines: "partner-geraldines",
  "geraldine-s": "partner-geraldines",
  "70-rainey": "luxury-presence-70-rainey-st-1409-9192982",
  "70-rainey-st": "luxury-presence-70-rainey-st-1409-9192982",
  "70-rainey-st-unit-1409": "luxury-presence-70-rainey-st-1409-9192982",
  "360-condominiums": "luxury-building-360-condominiums",
  "seaholm-residences": "luxury-building-seaholm-residences",
  "fifth-west": "luxury-building-fifth-and-west",
  "fifth-and-west": "luxury-building-fifth-and-west",
  "the-shore": "property-the-shore",
  "priority-the-shore": "property-the-shore",
  "shore-condos": "property-the-shore",
  "shore-building": "property-the-shore",
  "shore-property": "property-the-shore",
  "603-davis": "property-the-shore",
  "603-davis-st": "property-the-shore",
  milago: "luxury-building-milago",
  "austin-proper-residences": "luxury-building-austin-proper-residences",
  "1212-guadalupe": "luxury-building-1212-guadalupe",
  "topo-chico": "partner-topo-chico",
  "perk-topo-chico-downtown-hydration": "perk-yeti-downtown-hydration",
  "topo-chico-hydration": "perk-yeti-downtown-hydration",
  "topo-chico-hydration-activation": "perk-yeti-downtown-hydration",
  "topo-chico-downtown-hydration-activation": "perk-yeti-downtown-hydration",
  "yeti-hydration": "perk-yeti-downtown-hydration",
  "yeti-hydration-station": "perk-yeti-downtown-hydration",
  "yeti-downtown-hydration": "perk-yeti-downtown-hydration",
  "yeti-downtown-hydration-station": "perk-yeti-downtown-hydration",
  "rivian-downtown-austin-activation": "campaign-rivian-downtown-experience-layer",
  "rivian-downtown-activation": "campaign-rivian-downtown-experience-layer",
  "rivian-downtown-experience-layer": "campaign-rivian-downtown-experience-layer",
  "rivian-downtown-experience": "campaign-rivian-downtown-experience-layer",
  "rivian-experience-layer": "campaign-rivian-downtown-experience-layer",
  "rivian-waterfront-drive": "perk-rivian-waterfront-drive",
  "rivian-test-drive": "perk-rivian-waterfront-drive",
  "rivian-downtown-test-drive": "perk-rivian-waterfront-drive",
  "yeti-congress-district-activation": "perk-yeti-trail-day",
  "yeti-trail-day": "perk-yeti-trail-day",
  "lululemon-waterloo-run-club-activation": "perk-lululemon-run-club",
  "lululemon-run-club": "perk-lululemon-run-club",
  "featured-fine-eyewear": "campaign-see-austin-differently-fine-eyewear",
  "fine-eyewear-featured": "campaign-see-austin-differently-fine-eyewear",
  "see-austin-differently": "campaign-see-austin-differently-fine-eyewear",
  "see-austin-differently-fine-eyewear": "campaign-see-austin-differently-fine-eyewear",
  "fine-eyewear-dana": "campaign-see-austin-differently-fine-eyewear",
  "dana-fine-eyewear": "campaign-see-austin-differently-fine-eyewear",
  "fine-eyewear": "partner-fine-eyewear",
  "partner-four-seasons": "four-seasons-austin",
  "fine-eyewear-style-stop": "perk-fine-eyewear-style-stop",
  "inspired-closets": "inspired-closets-austin",
  "inspired-closets-residential-services-activation": "inspired-closets-austin-residential-services-activation",
  "inspired-closets-austin-residential-services-activation": "inspired-closets-austin-residential-services-activation",
  "inspired-closets-move-in": "perk-inspired-closets-move-in",
  "inspired-closets-consult": "perk-inspired-closets-move-in",
  "featured-fc": "featured-austin-fc",
  "austin-fc": "featured-austin-fc",
  "district-rainey-st-historic": "district-rainey-street-historic",
  "rainey-st-historic-district": "district-rainey-street-historic",
  "we-all-ride": "daa-stop-04-we-all-ride",
  "we-all-ride-mosaics": "daa-stop-04-we-all-ride",
  "daa-stop-04-we-all-ride-mosaics": "daa-stop-04-we-all-ride",
};

export function resolveMapEntityAlias(entityId) {
  const id = String(entityId || "").trim();
  if (!id) return "";
  if (isRemovedMapEntityId(id)) return "";
  const hospitalityId = id.toLowerCase();
  if (/^(hvz-|fairmont-)/.test(hospitalityId) || HOSPITALITY_URL_ENTITY_IDS.has(hospitalityId) || RESIDENTIAL_CONTENT_URL_ENTITY_IDS.has(hospitalityId)) return hospitalityId;
  const propertyId = resolvePropertyEntityId(id);
  return mapEntityAliases[propertyId] || mapEntityAliases[id] || propertyId || id;
}

export function resolveMapEntityFromCollection(entityId, entities = []) {
  const raw = String(entityId || "").trim();
  const rawNormalized = raw.toLowerCase();
  const rawSlug = normalizePropertyId(raw);
  const legacyOsm = parseLegacyOsmEntityId(raw);
  const exactMatch = entities.find((entity) => {
    return [
      entity?.id,
      entity?.entityId,
      entity?.raw?.id,
      entity?.raw?.entityId,
      entity?.slug,
      entity?.raw?.slug,
    ].some((value) => String(value || "").toLowerCase() === rawNormalized || normalizePropertyId(value) === rawSlug);
  });
  if (exactMatch) return exactMatch;

  if (legacyOsm) {
    const osmMatch = entities.find((entity) => {
      const entityOsmId = getEntityOsmId(entity);
      if (!entityOsmId || entityOsmId !== legacyOsm.osmId) return false;
      const entityOsmType = getEntityOsmType(entity);
      return !entityOsmType || legacyOsm.osmType === "osm" || entityOsmType === legacyOsm.osmType;
    });
    if (osmMatch) return osmMatch;

    const slugMatch = entities.find((entity) => getEntitySlugCandidates(entity).includes(legacyOsm.slug));
    if (slugMatch) return slugMatch;
  }

  const id = resolveMapEntityAlias(entityId);
  if (!id) return null;
  const normalized = id.toLowerCase();
  const normalizedSlug = normalizePropertyId(id);
  return (
    entities.find((entity) => String(entity?.id || "").toLowerCase() === normalized || normalizePropertyId(entity?.id) === normalizedSlug) ||
    entities.find((entity) => String(entity?.entityId || "").toLowerCase() === normalized || normalizePropertyId(entity?.entityId) === normalizedSlug) ||
    entities.find((entity) => String(entity?.raw?.id || entity?.raw?.entityId || "").toLowerCase() === normalized || normalizePropertyId(entity?.raw?.id || entity?.raw?.entityId) === normalizedSlug) ||
    entities.find((entity) => String(entity?.slug || entity?.raw?.slug || "").toLowerCase() === normalized || normalizePropertyId(entity?.slug || entity?.raw?.slug) === normalizedSlug) ||
    entities.find((entity) => String(entity?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === normalized) ||
    null
  );
}
