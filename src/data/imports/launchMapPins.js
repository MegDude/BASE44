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

export const launchMapPinImportSummary = launchMapPinsPayload.sourceSummary || {};
export const launchMapCampaigns = launchMapPinsPayload.campaigns || [];
export const launchMapOfferTemplates = launchMapPinsPayload.offerTemplates || [];
export const launchMapPins = launchMapPinsPayload.pins || [];

export function launchMapPinToPlace(pin) {
  const kind = PIN_TYPE_KIND[pin.pinType] || pin.kind || "venue";
  const category = clean(pin.category) || clean(pin.publicCategory) || "Dining";
  const pinKey = CATEGORY_PIN_KEYS[category] || CATEGORY_PIN_KEYS[pin.publicCategory] || kind || "venue";
  const tags = [
    pin.publicCategory,
    category,
    pin.campaignName,
    pin.campaignType,
    pin.collection,
    pin.sourceCategory,
    ...(pin.recommendedTags || []),
  ].filter(Boolean);
  const searchKeywords = [
    pin.name,
    pin.publicDisplayTitle,
    pin.publicCategory,
    category,
    pin.districtOrNeighborhood,
    pin.campaignName,
    pin.collection,
    ...(pin.searchKeywords || []),
    ...(pin.recommendedTags || []),
  ].filter(Boolean);
  const offerTitle = pin.offer?.offerTitle || pin.offer?.recommendedPerkOrOffer || "";
  const hasPerk = Boolean(offerTitle || pin.offer?.offerDescription);
  const canonicalDisplayName = clean(pin.name) || clean(pin.publicDisplayTitle) || pin.pinId;

  return {
    id: pin.id || `launch-${pin.pinId}`,
    venueId: pin.pinId,
    name: canonicalDisplayName,
    title: canonicalDisplayName,
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
    summary: pin.publicShortCardCopy || pin.residentValueProp || pin.visitorGuestValueProp || "",
    description: pin.publicFullListingCopy || pin.publicShortCardCopy || "",
    alignment_to_downtown_perks: pin.residentValueProp || pin.visitorGuestValueProp || pin.campaignCopy || "",
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
    mapCardCta: pin.mapCardCta,
    qrPromptCopy: pin.qrPromptCopy,
    proofMetrics: pin.proofMetrics || [],
    primaryAction: pin.mapCardCta || (pin.website ? "Open Website" : pin.hasExactMarker ? "Get Directions" : "View Details"),
    secondaryAction: pin.hasExactMarker ? "Get Directions" : pin.website ? "Open Website" : "Save",
    tags,
    searchKeywords,
    launchMapPin: true,
    launchPinType: pin.pinType,
    publicCategory: pin.publicCategory,
    raw: {
      launchMapPin: pin,
    },
    source: "Downtown Perks launch map",
  };
}

export const launchMapPinPlaces = launchMapPins.map(launchMapPinToPlace);
