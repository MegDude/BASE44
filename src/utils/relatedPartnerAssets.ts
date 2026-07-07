import { resolveMapImage } from "@/lib/map/entityImageResolver";
import { getEntityKind, type NearbyRecommendation } from "./nearbyRecommendations";

function entityText(entity: Record<string, any>) {
  return [
    entity?.id,
    entity?.name,
    entity?.title,
    entity?.brand,
    entity?.category,
    entity?.category_key,
    entity?.type,
    entity?.kind,
    entity?.partnerType,
    entity?.summary,
    entity?.description,
    entity?.raw?.category,
    entity?.raw?.category_key,
  ].filter(Boolean).join(" ").toLowerCase();
}

function explicitTypeText(entity: Record<string, any>) {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  return [
    entity?.kind,
    entity?.entityType,
    entity?.destinationKind,
    entity?.partnerType,
    entity?.type,
    entity?.category,
    entity?.category_key,
    raw?.kind,
    raw?.entityType,
    raw?.destinationKind,
    raw?.partnerType,
    raw?.type,
    raw?.category,
    raw?.category_key,
  ].filter(Boolean).join(" ").toLowerCase();
}

function isListingEntity(entity: Record<string, any>) {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  const text = entityText(entity);
  return Boolean(
    entity?.legendsListing ||
      raw?.legendsListing ||
      raw?.luxuryPresenceListing ||
      entity?.luxuryPresenceListing ||
      /\b(legends[_\s-]*(sale|rent|listing)|mls|for sale|for rent)\b/.test(text),
  );
}

function isPropertyLike(entity: Record<string, any>) {
  if (isHotelLike(entity)) return false;
  if (isVenueLike(entity)) return false;
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  return (
    isListingEntity(entity) ||
    /\b(properties|property|residential|residence|building|tower|condo|condominium|apartment|office)\b/.test(explicit) ||
    /\b(frost tower|residence|residences|condominiums|apartments|west ave|nueces|building)\b/.test(text)
  );
}

function isHotelLike(entity: Record<string, any>) {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  return /\b(hotel|hospitality|lodging)\b/.test(explicit) || /\b(hotel|inn|suites|proper|zaza|van zandt|four seasons)\b/.test(text);
}

function isCivicLike(entity: Record<string, any>) {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  return /\b(civic|public art|public realm|park|plaza|trail|library|museum|monument|landmark|auditorium shores|lady bird|butler trail|shoal beach|republic square|palmer events|long center)\b/.test(`${explicit} ${text}`);
}

function isVenueLike(entity: Record<string, any>) {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  return /\b(venue|restaurant|dining|food|coffee|cafe|bar|nightlife|cocktail|beer|music|retail|store|shop|service)\b/.test(`${explicit} ${text}`);
}

function isActualPerk(entity: Record<string, any>) {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  const kind = getEntityKind(entity);
  if (isListingEntity(entity)) return false;
  if (isPropertyLike(entity) || isHotelLike(entity) || isVenueLike(entity)) return false;
  if (/\b(civic|property|properties|residential|hotel|brand|event|building|listing|venue|venues|restaurant|bar|retail)\b/.test(kind)) return false;
  if (/\b(civic|alliance|public|program|district management)\b/.test(text)) return false;
  return (
    /\b(perk|perks|benefit|benefits|resident benefit|member benefit|inkind)\b/.test(explicit) ||
    Boolean(entity?.perk || entity?.raw?.perk)
  );
}

function listingFacts(entity: Record<string, any>) {
  const raw = entity?.raw && typeof entity.raw === "object" ? entity.raw : {};
  const listing = entity?.legendsListing || raw?.legendsListing || raw?.luxuryPresenceListing || entity?.luxuryPresenceListing || {};
  const facts = [
    listing?.priceDisplay || listing?.price || entity?.price || raw?.price,
    listing?.beds || entity?.beds || raw?.beds ? `${listing?.beds || entity?.beds || raw?.beds} bd` : "",
    listing?.baths || entity?.baths || raw?.baths ? `${listing?.baths || entity?.baths || raw?.baths} ba` : "",
    listing?.sqftDisplay || (listing?.sqft || entity?.sqft || raw?.sqft ? `${Number(listing?.sqft || entity?.sqft || raw?.sqft).toLocaleString()} sq ft` : ""),
  ].filter(Boolean);
  return facts.join(" · ");
}

function labelFor(entity: Record<string, any>) {
  const kind = getEntityKind(entity);
  const text = entityText(entity);
  const explicit = explicitTypeText(entity);
  if (/\b(downtown austin alliance|daa|civic|public realm|district organization)\b/.test(text) || isCivicLike(entity)) return "Civic";
  if (isListingEntity(entity)) return "Listing";
  if (isHotelLike(entity)) return "Hotel";
  if (isPropertyLike(entity)) return "Residential";
  if (kind.includes("brand")) return "Brand";
  if (/\b(brands|brand|retail_business|retail|shop|shopping|store|boots|eyewear|yeti|rivian|lululemon|equinox|ariat)\b/.test(explicit)) return "Brand";
  if (kind.includes("event")) return "Event";
  if (kind.includes("hotel")) return "Hotel";
  if (kind.includes("property") || kind.includes("properties")) return "Residential";
  if (kind.includes("civic")) return "Civic";
  const categoryText = `${explicit} ${text}`;
  if (/\b(coffee|cafe|espresso)\b/.test(categoryText)) return "Coffee";
  if (/\b(drink|drinks|bar|cocktail|nightlife|beer|happy hour)\b/.test(categoryText)) return "Drinks";
  if (/\b(dining|restaurant|food|pizza|burger)\b/.test(categoryText)) return "Dining";
  if (/\b(wellness|fitness|spa|recovery|yoga)\b/.test(categoryText)) return "Wellness";
  if (/\b(retail|shop|store)\b/.test(categoryText)) return "Retail";
  if (/\b(culture|art|music|museum|gallery)\b/.test(categoryText)) return "Culture";
  if (isActualPerk(entity)) return "Perk";
  return "Places";
}

function groupLabelFor(type: string) {
  if (type === "Listing") return "Homes Nearby";
  if (type === "Hotel") return "Nearby Hotels";
  if (type === "Residential") return "Nearby Buildings";
  if (type === "Perk") return "Member Benefits";
  if (type === "Event") return "Events Nearby";
  if (type === "Coffee") return "Coffee Nearby";
  if (type === "Dining") return "Dining Nearby";
  if (type === "Drinks") return "Drinks Nearby";
  if (type === "Wellness") return "Wellness Nearby";
  if (type === "Retail") return "Nearby Shopping";
  if (type === "Brand") return "Nearby Shopping";
  if (type === "Culture") return "Culture Nearby";
  if (type === "Civic") return "Nearby civic stops";
  return "Places";
}

function headlineFor(group: string) {
  const headlines: Record<string, string> = {
    "Dining Nearby": "Where people eat nearby",
    "Drinks Nearby": "Where plans continue nearby",
    "Nearby Hotels": "Places guests discover nearby",
    "Homes Nearby": "Available homes near this pin",
    "Nearby Buildings": "Buildings shaping local routines",
    "Events Nearby": "Moments pulling people nearby",
    "Member Benefits": "Benefits people can use nearby",
    "Coffee Nearby": "Coffee stops close by",
    "Wellness Nearby": "Wellness stops close by",
    "Nearby Shopping": "Useful shops nearby",
    "Culture Nearby": "Culture stops nearby",
    "Nearby civic stops": "Public places that can make a simple downtown route",
    Places: "Useful places around this pin",
  };
  return headlines[group] || "Useful places around this pin";
}

function typeLabelFor(type: string) {
  const labels: Record<string, string> = {
    Listing: "Listing",
    Hotel: "Hotel",
    Residential: "Building",
    Perk: "Member benefit",
    Event: "Event",
    Coffee: "Coffee",
    Dining: "Dining",
    Drinks: "Drinks",
    Wellness: "Wellness",
    Retail: "Shopping",
    Culture: "Culture",
    Civic: "Civic",
    Brand: "Brand",
  };
  return labels[type] || "Place";
}

function cardMetaFor(entity: Record<string, any>, type: string) {
  const district = entity?.district || entity?.neighborhood || "Downtown Austin";
  return `${typeLabelFor(type)} · ${district}`;
}

function isCivicSelected(entity: Record<string, any>) {
  return isCivicLike(entity) || labelFor(entity) === "Civic";
}

function shouldShowForCivicRoute(entity: Record<string, any>) {
  if (isListingEntity(entity) || isPropertyLike(entity) || isHotelLike(entity) || isActualPerk(entity)) return false;
  const type = labelFor(entity);
  return type === "Civic" || type === "Culture";
}

function isBrandOrRetailSelected(entity: Record<string, any> | null | undefined) {
  if (!entity) return false;
  const text = `${explicitTypeText(entity)} ${entityText(entity)}`;
  const kind = getEntityKind(entity);
  return kind.includes("brand") || /\b(brand|retail|shop|shopping|store|boots|eyewear|yeti|rivian|lululemon|equinox|ariat)\b/.test(text);
}

function isUsefulForBrandActivation(entity: Record<string, any>) {
  if (!entity || isListingEntity(entity) || isPropertyLike(entity)) return false;
  const type = labelFor(entity);
  if (type === "Hotel" || type === "Civic") return false;
  return ["Event", "Dining", "Drinks", "Coffee", "Wellness", "Retail", "Culture", "Brand", "Perk", "Places"].includes(type);
}

export function getRelatedPartnerAssets({
  nearby = [],
  selectedEntity = null,
}: {
  nearby: NearbyRecommendation[];
  selectedEntity?: Record<string, any> | null;
}) {
  const groups = new Map<string, any[]>();
  const civicSelected = selectedEntity ? isCivicSelected(selectedEntity) : false;
  const brandSelected = isBrandOrRetailSelected(selectedEntity);
  const groupOrder = civicSelected
    ? ["Nearby civic stops", "Culture Nearby", "Coffee Nearby", "Dining Nearby", "Drinks Nearby", "Events Nearby"]
    : brandSelected
      ? ["Events Nearby", "Nearby Shopping", "Dining Nearby", "Drinks Nearby", "Coffee Nearby", "Wellness Nearby", "Culture Nearby", "Places"]
    : [
      "Events Nearby",
      "Member Benefits",
      "Homes Nearby",
      "Nearby Buildings",
      "Coffee Nearby",
      "Dining Nearby",
      "Drinks Nearby",
      "Nearby Hotels",
      "Wellness Nearby",
      "Nearby Shopping",
      "Culture Nearby",
      "Nearby civic stops",
      "Places",
    ];
  const seen = new Set<string>();
  nearby.forEach((item) => {
    if (civicSelected && !shouldShowForCivicRoute(item.entity)) return;
    if (brandSelected && !isUsefulForBrandActivation(item.entity)) return;
    const type = labelFor(item.entity);
    const groupLabel = groupLabelFor(type);
    if (!groupOrder.includes(groupLabel)) return;
    const key = String(item.entity?.id || item.entity?.name || item.entity?.title || "");
    if (!key || seen.has(key)) return;
    seen.add(key);
    const current = groups.get(groupLabel) || [];
    const image = resolveMapImage(item.entity, type === "Listing" ? "card" : "relatedRail");
    current.push({
      entity: item.entity,
      title: item.entity?.name || item.entity?.title,
      type,
      district: item.entity?.district || "Downtown Austin",
      distance: item.distanceLabel,
      image,
      meta: cardMetaFor(item.entity, type),
      context: "",
      status: isActualPerk(item.entity) ? "Member benefit nearby" : "",
      actionLabel: "Open",
    });
    groups.set(groupLabel, current);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
    .map(([title, items]) => ({ title, label: title, headline: headlineFor(title), items: items.slice(0, 4) }))
    .filter((section) => section.items.length);
}
