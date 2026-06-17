const PANEL_ARCHETYPES = {
  property: {
    id: "property",
    label: "Property",
    eyebrow: "Residential Building",
    nearbyTitle: "Around The Corner",
    primaryAction: "Explore Nearby",
    secondaryAction: "Save Building",
    tertiaryAction: "Want To Live Here",
    partnerHeadline: "Residential visibility inside the neighborhood.",
  },
  listing: {
    id: "listing",
    label: "Listing",
    eyebrow: "Available Listing",
    nearbyTitle: "Around The Corner",
    primaryAction: "View Listing",
    secondaryAction: "Save Listing",
    tertiaryAction: "Contact Legends",
    partnerHeadline: "Residential inventory currently available.",
  },
  venue: {
    id: "venue",
    label: "Venue",
    eyebrow: "Dining Nearby",
    nearbyTitle: "Nearby Now",
    primaryAction: "Claim Perk",
    secondaryAction: "Directions",
    tertiaryAction: "Save",
    partnerHeadline: "Appear while nearby residents are deciding.",
  },
  guide: {
    id: "guide",
    label: "Guide",
    eyebrow: "Local Guide",
    nearbyTitle: "Included Stops",
    primaryAction: "Open Guide",
    secondaryAction: "Save Guide",
    tertiaryAction: "Explore Nearby",
    partnerHeadline: "High-intent discovery pathway.",
  },
  event: {
    id: "event",
    label: "Event",
    eyebrow: "Event",
    nearbyTitle: "Nearby Now",
    primaryAction: "RSVP",
    secondaryAction: "Add To Calendar",
    tertiaryAction: "Save",
    partnerHeadline: "An active downtown gathering moment.",
  },
  perk: {
    id: "perk",
    label: "Perk",
    eyebrow: "Resident Perk",
    nearbyTitle: "Nearby Now",
    primaryAction: "Claim Perk",
    secondaryAction: "Directions",
    tertiaryAction: "Save",
    partnerHeadline: "Resident offer visibility near a decision moment.",
  },
};

function archetypeText(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.sourceType,
    entity.markerType,
    entity.detailDrawerType,
    entity.category,
    entity.category_key,
    entity.subcategory,
    entity.partnerType,
    entity.brand,
    entity.source,
    raw.id,
    raw.name,
    raw.title,
    raw.type,
    raw.kind,
    raw.entityType,
    raw.category,
    raw.category_key,
    raw.subcategory,
    raw.partnerType,
    raw.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasObjectSignal(entity = {}, keys = []) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return keys.some((key) => Boolean(entity[key] || raw[key]));
}

function inferProductionType(entity = {}) {
  const text = archetypeText(entity);
  const explicitTypeText = [
    entity.id,
    entity.type,
    entity.kind,
    entity.entityType,
    entity.sourceType,
    entity.markerType,
    entity.detailDrawerType,
    entity.raw?.type,
    entity.raw?.kind,
    entity.raw?.entityType,
    entity.raw?.markerType,
    entity.raw?.detailDrawerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /\b(active listing|available listing|listing|rental|mls|unit|for rent|for sale)\b/.test(text) ||
    hasObjectSignal(entity, ["rentalListing", "legendsListing", "luxuryPresenceListing"])
  ) {
    return "active-listing";
  }

  if (
    /\b(residential tower|residential building|residences|condominium|condo|apartment|tower|legends property|luxury presence building)\b/.test(text) ||
    hasObjectSignal(entity, ["luxuryPresenceBuilding", "listings"])
  ) {
    return "residential-tower";
  }

  if (/\b(event|rsvp|tonight|series|run club|neighbor night)\b/.test(text)) return "event";
  if (/(^|[\s_-])(perk|offer|happy[\s_-]*hour)([\s_-]|$)/.test(explicitTypeText)) return "perk";
  if (/\b(guide|collection|campaign|passport|trail|best rooftops|date night|coffee guide|happy hour guide)\b/.test(text)) return "guide";
  if (/\b(park|landmark|civic|public space|library|capitol|waterloo|republic square)\b/.test(text)) return "landmark-civic";
  if (/\b(hotel|hospitality|stay|guest)\b/.test(text)) return "hotel";
  if (/\b(rooftop|p6|zanzibar|edge|nido|rules and regs)\b/.test(text)) return "rooftop";
  if (/\b(bar|nightlife|cocktail|pub|saloon|lounge|brewery|beer|half step|banger)\b/.test(text)) return "bars-nightlife";
  if (/\b(coffee|cafe|espresso|jo'?s|houndstooth|patika|manana)\b/.test(text)) return "coffee";
  if (/\b(retail|bookpeople|records|whole foods|trader joe|toy joy|shop|store|market)\b/.test(text)) return "retail";
  if (/\b(restaurant|dining|sushi|taco|pizza|food|kitchen|grill|bistro|comedor|hestia|red ash|wu chow)\b/.test(text)) return "restaurant";

  return "venue";
}

function productionTypeToArchetype(productionType) {
  if (productionType === "residential-tower") return "property";
  if (productionType === "active-listing") return "listing";
  if (productionType === "event") return "event";
  if (productionType === "perk") return "perk";
  if (productionType === "guide" || productionType === "landmark-civic") return "guide";
  return "venue";
}

function venueEyebrowForProductionType(productionType) {
  if (productionType === "coffee") return "Coffee Nearby";
  if (productionType === "bars-nightlife") return "Drinks Nearby";
  if (productionType === "rooftop") return "Rooftop Nearby";
  if (productionType === "hotel") return "Hotel Nearby";
  if (productionType === "retail") return "Retail Nearby";
  if (productionType === "restaurant") return "Dining Nearby";
  return PANEL_ARCHETYPES.venue.eyebrow;
}

export function resolveEntityPanelArchetype(entity = {}) {
  const productionType = inferProductionType(entity);
  const archetypeId = productionTypeToArchetype(productionType);
  const base = PANEL_ARCHETYPES[archetypeId] || PANEL_ARCHETYPES.venue;
  return {
    ...base,
    productionType,
    archetypeId,
    eyebrow: archetypeId === "venue" ? venueEyebrowForProductionType(productionType) : base.eyebrow,
  };
}

export function getPanelArchetypeById(id) {
  return PANEL_ARCHETYPES[id] || PANEL_ARCHETYPES.venue;
}
