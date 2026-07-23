import launchMapPinsPayload from "./launchMapPins.generated.json";

const CATEGORY_PIN_KEYS = {
  Coffee: "coffee",
  Civic: "civic",
  Dining: "dining",
  Events: "event",
  Hotels: "hotel",
  Nightlife: "nightlife",
  Parking: "parking",
  Perks: "perk",
  Properties: "property",
  Retail: "retail",
  Wellness: "wellness",
};

const PIN_TYPE_KIND = {
  building_entry_pin: "property",
  civic_story_or_landmark_pin: "civic",
  event_or_collection_pin: "event",
  hotel_guest_pin: "hotel",
  mobility_pin: "parking",
  partner_listing_pin: "venue",
  public_listing_pin: "venue",
};

const INTERNAL_TITLE_SUFFIXES = [
  /\s+[—–-]\s+guest guide anchor\s*$/i,
  /\s+[—–-]\s+hotel guest anchor\s*$/i,
  /\s+[—–-]\s+campaign anchor\s*$/i,
  /\s+[—–-]\s+route anchor\s*$/i,
  /\s+[—–-]\s+map anchor\s*$/i,
  /\s+[—–-]\s+activation anchor\s*$/i,
  /\s+[—–-]\s+resident guide anchor\s*$/i,
  /\s+[—–-]\s+arrival anchor\s*$/i,
];

function normalizedKey(parts) {
  return parts
    .filter(Boolean)
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function clean(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function cleanPublicMapTitle(value) {
  let title = String(clean(value) || "").replace(/\s+/g, " ").trim();
  for (const suffix of INTERNAL_TITLE_SUFFIXES) title = title.replace(suffix, "").trim();
  return title;
}

function contentOverrideFor(pin = {}, title = "") {
  if (/^citizenm austin downtown$/i.test(title)) {
    return {
      summary: "A compact downtown hotel on East 7th with a social living room, rooftop pool, 24/7 food and drink, and a walkable base for exploring the city center.",
      description: "citizenM Austin Downtown puts guests near Congress Avenue, Red River, the Convention Center, museums, restaurants, and nightlife. Use this listing to plan the closest coffee, dining, events, civic stops, and practical arrival options from the hotel.",
      alignment: "Start from citizenM Austin Downtown and build a simple guest plan around nearby food, drinks, events, culture, and walkable downtown destinations.",
      primaryAction: "Explore nearby",
      tags: ["citizenM", "hotel", "East 7th", "Downtown Core", "rooftop pool", "24/7 food", "guest guide"],
      searchKeywords: ["citizenM Austin Downtown", "citizenM Austin", "downtown Austin hotel", "East 7th hotel", "hotel near Red River", "hotel near Convention Center"],
    };
  }
  return null;
}

export const launchMapPinImportSummary = launchMapPinsPayload.sourceSummary || {};
export const launchMapCampaigns = launchMapPinsPayload.campaigns || [];
export const launchMapOfferTemplates = launchMapPinsPayload.offerTemplates || [];
export const launchMapPins = launchMapPinsPayload.pins || [];

export function launchMapPinToPlace(pin) {
  const kind = PIN_TYPE_KIND[pin.pinType] || pin.kind || "venue";
  const category = clean(pin.category) || clean(pin.publicCategory) || "Dining";
  const pinKey = CATEGORY_PIN_KEYS[category] || CATEGORY_PIN_KEYS[pin.publicCategory] || kind || "venue";
  const sourceTitle = clean(pin.publicDisplayTitle) || clean(pin.name) || pin.pinId;
  const title = cleanPublicMapTitle(sourceTitle) || pin.pinId;
  const override = contentOverrideFor(pin, title);
  const tags = [
    pin.publicCategory,
    category,
    pin.campaignName,
    pin.campaignType,
    pin.collection,
    pin.sourceCategory,
    ...(pin.recommendedTags || []),
    ...(override?.tags || []),
  ].filter(Boolean);
  const searchKeywords = [
    title,
    cleanPublicMapTitle(pin.name),
    cleanPublicMapTitle(pin.publicDisplayTitle),
    pin.publicCategory,
    category,
    pin.districtOrNeighborhood,
    pin.campaignName,
    pin.collection,
    ...(pin.searchKeywords || []),
    ...(pin.recommendedTags || []),
    ...(override?.searchKeywords || []),
  ].filter(Boolean);
  const offerTitle = pin.offer?.offerTitle || pin.offer?.recommendedPerkOrOffer || "";
  const hasPerk = Boolean(offerTitle || pin.offer?.offerDescription);

  return {
    id: pin.id || `launch-${pin.pinId}`,
    venueId: pin.pinId,
    name: title,
    title,
    type: kind,
    kind,
    entityType: kind,
    sourceType: "launch_map",
    markerType: kind,
    detailDrawerType: kind,
    pinKey,
    partnerType: kind === "property" ? "properties" : kind === "civic" ? "civic" : undefined,
    category: pin.publicCategory || category,
    category_key: normalizedKey(searchKeywords),
    latitude: pin.hasExactMarker ? pin.latitude : null,
    longitude: pin.hasExactMarker ? pin.longitude : null,
    district: pin.districtOrNeighborhood || "Downtown Austin",
    neighborhood: pin.districtOrNeighborhood || "Downtown Austin",
    address: clean(pin.address) || "",
    website: clean(pin.website) || "",
    summary: override?.summary || pin.publicShortCardCopy || pin.residentValueProp || pin.visitorGuestValueProp || "",
    description: override?.description || pin.publicFullListingCopy || pin.publicShortCardCopy || "",
    alignment_to_downtown_perks: override?.alignment || pin.residentValueProp || pin.visitorGuestValueProp || pin.campaignCopy || "",
    deals_offers: hasPerk ? offerTitle : "",
    specials: hasPerk ? pin.offer?.offerDescription || offerTitle : "",
    hasPerk,
    hasPerkPotential: hasPerk,
    perk: hasPerk
      ? {
          title: offerTitle,
          value: pin.offer?.offerDescription || offerTitle,
          description: pin.offer?.redemptionOrCta || pin.offer?.offerDescription || offerTitle,
          isActive: true,
        }
      : undefined,
    offer: hasPerk ? pin.offer : undefined,
    campaignName: pin.campaignName,
    campaignType: pin.campaignType,
    campaignCopy: pin.campaignCopy,
    collection: pin.collection,
    mapCardCta: override?.primaryAction || pin.mapCardCta,
    qrPromptCopy: pin.qrPromptCopy,
    proofMetrics: pin.proofMetrics || [],
    primaryAction: override?.primaryAction || pin.mapCardCta || (pin.website ? "Open Website" : pin.hasExactMarker ? "Get Directions" : "View Details"),
    secondaryAction: pin.hasExactMarker ? "Get Directions" : pin.website ? "Open Website" : "Save",
    tags,
    searchKeywords,
    launchMapPin: true,
    launchPinType: pin.pinType,
    publicCategory: pin.publicCategory,
    raw: {
      launchMapPin: pin,
      originalPublicDisplayTitle: sourceTitle,
    },
    source: "Downtown Perks launch map",
  };
}

export const launchMapPinPlaces = launchMapPins.map(launchMapPinToPlace);
