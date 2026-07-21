import { resolvePartnerPanelCopy } from "../partner/partnerPanelContent.js";

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
    eyebrow: "Dining nearby",
    nearbyTitle: "Nearby Now",
    primaryAction: "Plan a Visit",
    secondaryAction: "Directions",
    tertiaryAction: "Save",
    partnerHeadline: "Appear while nearby residents are deciding.",
  },
  guide: {
    id: "guide",
    label: "Guide",
    eyebrow: "Local Guide",
    nearbyTitle: "Nearby",
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
  campaign: {
    id: "campaign",
    label: "Campaign",
    eyebrow: "Active Campaign",
    nearbyTitle: "Campaign Context",
    primaryAction: "Open Campaign",
    secondaryAction: "Save Campaign",
    tertiaryAction: "View Nearby",
    partnerHeadline: "A focused activation tied to nearby intent.",
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
  const explicitId = String(entity.id || entity.raw?.id || "").toLowerCase();
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

  const strongCivicIdentity = (
    /^(civic|discovery|daa-stop)[-_]/.test(explicitId) ||
    /(^|[\s_-])(civic|landmark|public[\s_-]*art|public[\s_-]*space|park|trail)([\s_-]|$)/.test(explicitTypeText) ||
    String(entity.datasetLayer || entity.raw?.datasetLayer || "").toLowerCase() === "civic" ||
    String(entity.pinKey || entity.raw?.pinKey || "").toLowerCase() === "civic"
  ) && !/^(perk|offer|event|campaign)[-_]/.test(explicitId);

  if (strongCivicIdentity) return "landmark-civic";

  if (/(^|[\s_-])(perk|offer|brand[\s_-]*activation[\s_-]*perk|happy[\s_-]*hour)([\s_-]|$)/.test(explicitTypeText) || /\bbrand perk\b/.test(text)) {
    return "perk";
  }

  if (
    /(^|[\s_-])(campaign|brand[\s_-]*campaign|activation[\s_-]*layer|discovery[\s_-]*trail)([\s_-]|$)/.test(explicitTypeText) ||
    hasObjectSignal(entity, ["campaignType", "campaignPins", "participatingEntities", "activationStops"]) ||
    /\b(map-native campaign|discovery trail|see austin differently|local lens rate)\b/.test(text)
  ) {
    return "campaign";
  }

  if (/\b(retail|retail_business|shop|store|boutique|eyewear|frames|lens|lenses|optical|vision partner|fine eyewear)\b/.test(text)) {
    return "retail";
  }

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

  if (/\b(campaign|activation layer|brand campaign)\b/.test(text)) return "campaign";
  if (/\b(civic|landmark|public art|public realm|park|trail|museum|library|lady bird|colorado river|congress bridge|waterloo|republic square|central library|auditorium shores|shoal creek|waller creek)\b/.test(text)) return "landmark-civic";
  if (/\b(event|rsvp|tonight|series|run club|neighbor night)\b/.test(text)) return "event";
  if (/\b(guide|collection|passport|best rooftops|date night|coffee guide|happy hour guide)\b/.test(text)) return "guide";
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
  if (productionType === "campaign") return "campaign";
  if (productionType === "guide" || productionType === "landmark-civic") return "guide";
  return "venue";
}

function venueEyebrowForProductionType(productionType) {
  if (productionType === "coffee") return "Coffee nearby";
  if (productionType === "bars-nightlife") return "Drinks nearby";
  if (productionType === "rooftop") return "Rooftops nearby";
  if (productionType === "hotel") return "Hotel experiences nearby";
  if (productionType === "retail") return "Retail nearby";
  if (productionType === "restaurant") return "Dining nearby";
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

function safePanelText(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || /^(undefined|null|nan|\[object object\])$/i.test(text)) return fallback;
  return text;
}

const PARTNER_ONLY_COPY = /\b(campaign strategy|audience targeting|conversion rate|partner reporting|partner dashboard|workspace|publish(?:ing)?|impressions|analytics|performance reporting|lead generation|operating opportunity|manage (?:campaign|content|visibility|programming))\b/i;

function residentSafePanelText(value, fallback = "") {
  const text = safePanelText(value, "");
  return text && !PARTNER_ONLY_COPY.test(text) ? text : fallback;
}

function panelTitleFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(
    entity.title ||
      entity.name ||
      entity.buildingName ||
      raw.title ||
      raw.name ||
      raw.buildingName ||
      raw.address,
    "Downtown destination",
  );
}

function panelDistrictFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(entity.district || entity.neighborhood || raw.district || raw.neighborhood, "Downtown Austin");
}

function panelSubtitleFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(entity.address || raw.address || entity.neighborhood || entity.district || raw.neighborhood || raw.district, "");
}

function panelEntityType(entity = {}) {
  const productionType = inferProductionType(entity);
  const text = archetypeText(entity);
  const explicit = [
    entity.type,
    entity.kind,
    entity.entityType,
    entity.sourceType,
    entity.markerType,
    entity.detailDrawerType,
    entity.partnerType,
    entity.raw?.type,
    entity.raw?.kind,
    entity.raw?.entityType,
    entity.raw?.partnerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (productionType === "active-listing") return "listing";
  if (productionType === "residential-tower") return "propertyOverview";
  if (productionType === "event") return "event";
  if (productionType === "perk") return "perk";
  if (productionType === "campaign") return "campaign";
  if (productionType === "hotel") return "hotel";
  if (productionType === "landmark-civic") return "civic";
  if (productionType === "guide") return "localGuide";
  if (productionType === "retail") return "retail";
  if (/\b(brand|activation|campaign|sponsor|yeti|dana|inkind|waterloo greenway|fine eyewear)\b/.test(text)) return "brand";
  if (/\b(service|salon|spa|doctor|dental|care|repair|charging|parking|mobility|errand)\b/.test(text) || /\b(service|parking|mobility)\b/.test(explicit)) return "service";
  if (["restaurant", "coffee", "bars-nightlife", "rooftop"].includes(productionType)) return "venue";
  return "venue";
}

function formatPanelTemplate(template, title) {
  return template.replace(/\{title\}/g, title);
}

function compactPanelSentence(value = "") {
  const text = safePanelText(value, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim();
  if (!text) return "";
  const firstSentence = text.match(/^(.+?[.!?])(?:\s|$)/)?.[1] || text;
  return firstSentence.length > 230 ? `${firstSentence.slice(0, 227).trim()}...` : firstSentence;
}

const GENERIC_INVENTORY_COPY = [
  /^(?:.+?\s+)?listing in downtown austin\.?$/i,
  /^(?:.+?\s+)?listing operated by .+?\.?$/i,
  /^(?:restaurant\s*\/\s*food|coffee\s*\/\s*cafe) with cuisine focus:\s*.+?\.?$/i,
  /^this downtown austin residence is currently available through legends real estate\.?$/i,
];

export function isGenericInventoryPanelCopy(value = "") {
  const text = compactPanelSentence(value);
  return Boolean(text) && GENERIC_INVENTORY_COPY.some((pattern) => pattern.test(text));
}

function authoredPanelContext(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const candidates = [
    raw.panelContext,
    raw.downtown_perks_summary,
    raw.context,
    entity.context,
    raw.summary,
    entity.summary,
    raw.description,
    entity.description,
    raw.campaignObjective,
    entity.campaignObjective,
    raw.partnerInsight,
    entity.partnerInsight,
  ];
  return candidates
    .map((value) => compactPanelSentence(value))
    .find((value) => value && !isGenericInventoryPanelCopy(value)) || "";
}

function panelAddressFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(entity.address || raw.address, "")
    .replace(/,\s*/g, ", ")
    .replace(/^(\d+),\s+/, "$1 ")
    .replace(/,\s*Austin(?:,\s*(?:TX|Texas))?(?:,\s*\d{5}(?:-\d{4})?)?\.?$/i, "")
    .trim();
}

function panelLocationPhrase(entity = {}) {
  const district = panelDistrictFor(entity);
  const address = panelAddressFor(entity);
  if (!address) return district;
  if (district && district !== "Downtown Austin") return `${address} in ${district}`;
  return address;
}

function panelCuisineFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const source = [raw.cuisine, entity.cuisine, raw.description, entity.description].filter(Boolean).join(" ");
  const match = source.match(/cuisine focus:\s*([a-z0-9_-]+)/i);
  const cuisine = safePanelText(raw.cuisine || entity.cuisine || match?.[1], "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!cuisine || /^(yes|no|unknown|restaurant|food)$/i.test(cuisine)) return "";
  return cuisine.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function panelOperatorFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const source = [raw.operator, entity.operator, raw.description, entity.description].filter(Boolean).join(" ");
  const match = source.match(/listing operated by\s+(.+?)(?:\.|$)/i);
  return safePanelText(raw.operator || entity.operator || match?.[1], "");
}

function panelHostFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(
    entity.hostName || entity.venueName || entity.partnerName || raw.hostName || raw.venueName || raw.partnerName || raw.organizationName,
    "",
  );
}

function panelTimingFor(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return safePanelText(
    entity.displayDate || entity.dateLabel || entity.startsAt || entity.startAt || raw.displayDate || raw.dateLabel || raw.startsAt || raw.startAt,
    "",
  );
}

function panelCategoryLabel(entity = {}, productionType = "venue") {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const explicit = safePanelText(entity.category || raw.category || entity.subcategory || raw.subcategory || "", "");
  if (explicit) {
    return explicit
      .replace(/[_|/]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }
  const labels = {
    restaurant: "dining",
    coffee: "coffee",
    "bars-nightlife": "drinks and nightlife",
    rooftop: "rooftop plans",
    retail: "retail",
    hotel: "hotel and guest plans",
    event: "event",
    perk: "resident perk",
    campaign: "campaign",
    guide: "local guide",
    "landmark-civic": "civic stop",
    "active-listing": "available listing",
    "residential-tower": "residential building",
  };
  return labels[productionType] || "downtown stop";
}

function panelOfferLine(entity = {}) {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  return compactPanelSentence(raw.perk?.title || raw.offer || entity.offer || entity.deals_offers || raw.deals_offers || entity.perkValue || raw.perkValue || "");
}

function panelActualContext(entity = {}) {
  return authoredPanelContext(entity);
}

function buildContextualPanelWhy(entity = {}, title = "this destination", type = "venue") {
  const productionType = inferProductionType(entity);
  const district = panelDistrictFor(entity);
  const category = panelCategoryLabel(entity, productionType);
  const actualContext = panelActualContext(entity);
  const offer = panelOfferLine(entity);
  const locationLine = panelLocationPhrase(entity);
  const cuisine = panelCuisineFor(entity);
  const operator = panelOperatorFor(entity);
  const host = panelHostFor(entity);
  const timing = panelTimingFor(entity);
  const lowerCategory = category.toLowerCase();
  const categoryLabel = lowerCategory === "venue" ? "downtown stop" : lowerCategory;

  if (type === "propertyOverview") {
    return {
      heading: `Why ${title} works`,
      body: actualContext || `${title} is a residential address at ${locationLine}. The building sits within a distinct set of nearby places, resident benefits, and routes.`,
      insight: `Open ${title} to compare the address with nearby places, resident benefits, and the routes connected to this part of downtown.`,
    };
  }

  if (type === "listing") {
    return {
      heading: `Why this listing fits`,
      body: actualContext || `${title} is an available home at ${locationLine}. The listing connects the residence to the building and nearby places a prospective resident may want to review before a tour.`,
      insight: `Open ${title} for its available home details, then use the map to understand the surrounding block before contacting the listing team.`,
    };
  }

  if (type === "event") {
    return {
      heading: `Why ${title} fits tonight`,
      body: actualContext || `${title}${host ? ` is hosted by ${host}` : ""}${timing ? ` on ${timing}` : ""}${locationLine ? ` at ${locationLine}` : ""}.`,
      insight: `Open ${title} for the current event details, then see what is close enough to add before or after it.`,
    };
  }

  if (type === "perk") {
    return {
      heading: `Why this perk fits`,
      body: offer
        ? `${title}${host ? ` from ${host}` : ""} gives residents this benefit: ${offer}`
        : actualContext || `${title}${host ? ` is available from ${host}` : ""}${locationLine ? ` at ${locationLine}` : ` in ${district}`}. Open it to confirm the current resident benefit.`,
      insight: `Open ${title} to check availability and terms before showing or scanning your Resident Pass.`,
    };
  }

  if (type === "hotel") {
    return {
      heading: `Why ${title} fits the stay`,
      body: actualContext || `${title} gives guests a downtown base at ${locationLine}, close to the places, events, and neighborhood stops surrounding the property.`,
      insight: `Open ${title} to plan from the hotel door and compare the closest useful stops for this stay.`,
    };
  }

  if (type === "brand") {
    return {
      heading: `Why ${title} belongs here`,
      body: actualContext || `${title} has a downtown presence at ${locationLine}${operator ? `, operated by ${operator}` : ""}. Current local places, offers, and events give that presence a practical purpose.`,
      insight: `Open ${title} to see the specific downtown experience or offer connected to this location.`,
    };
  }

  if (type === "civic") {
    return {
      heading: `Why people come here`,
      body: actualContext || `${title} is a civic or cultural place at ${locationLine}${operator ? `, managed by ${operator}` : ""}. It anchors public life in this part of downtown.`,
      insight: `Open ${title} for its location and connect it to nearby public spaces, programs, and walking routes.`,
    };
  }

  if (type === "service") {
    return {
      heading: `Why residents use ${title}`,
      body: actualContext || `${title} is a local service at ${locationLine}${operator ? `, operated by ${operator}` : ""}. It gives residents a specific nearby option for a practical downtown need.`,
      insight: `Open ${title} for directions and the latest available details before making the trip.`,
    };
  }

  if (type === "localGuide") {
    return {
      heading: `Why this guide helps`,
      body: actualContext || `${title} brings a selected group of ${district} stops into one guide, with each place kept visible as its own map destination.`,
      insight: `Open ${title} to choose a first stop and follow the ordered places from there.`,
    };
  }

  if (type === "campaign") {
    return {
      heading: `Why ${title} fits`,
      body: actualContext || `${title} connects selected ${district} places to one timely resident action${host ? ` led by ${host}` : ""}.`,
      insight: `Open ${title} to see the participating places, current timing, and the action available from the map.`,
    };
  }

  if (productionType === "restaurant") {
    return {
      heading: `Why choose ${title}`,
      body: actualContext || `${title} is ${cuisine ? `${cuisine} dining` : "a dining destination"} at ${locationLine}. The address places the restaurant within a specific downtown block and its surrounding evening stops.`,
      insight: `Open ${title} for directions${offer ? ` and the current resident benefit: ${offer}` : ", current details, and nearby places that can complete the outing"}.`,
    };
  }

  if (productionType === "coffee") {
    return {
      heading: `Why choose ${title}`,
      body: actualContext || `${title} is ${cuisine ? `a ${cuisine} stop` : "a coffee stop"} at ${locationLine}. It gives this part of downtown a named café destination with its own exact address.`,
      insight: `Open ${title} for directions${offer ? ` and its current resident benefit: ${offer}` : " and to see the closest places around it"}.`,
    };
  }

  if (productionType === "bars-nightlife" || productionType === "rooftop") {
    return {
      heading: `Why choose ${title}`,
      body: actualContext || `${title} is ${productionType === "rooftop" ? "a rooftop destination" : "a drinks and nightlife destination"} at ${locationLine}. It gives an evening in ${district} a precise place to start or continue.`,
      insight: `Open ${title} for directions${offer ? ` and the current resident benefit: ${offer}` : ", then compare the other evening stops closest to this address"}.`,
    };
  }

  if (productionType === "retail") {
    return {
      heading: `Why choose ${title}`,
      body: actualContext || `${title} is a retail stop at ${locationLine}${operator ? `, operated by ${operator}` : ""}. This specific shop or service belongs to the surrounding downtown block.`,
      insight: `Open ${title} for directions${offer ? ` and its current resident benefit: ${offer}` : " and the latest available place details"}.`,
    };
  }

  return {
    heading: `Why choose ${title}`,
    body: offer
      ? `${title} is a ${categoryLabel} at ${locationLine} with this current resident benefit: ${offer}`
      : actualContext || `${title} is a ${categoryLabel} at ${locationLine}${operator ? `, operated by ${operator}` : ""}. Its exact address gives the place a clear position in downtown.`,
    insight: `Open ${title} for directions, current details, and the places closest to this address.`,
  };
}

const PANEL_CONTENT_BY_TYPE = {
  venue: {
    eyebrow: "Downtown place",
    primaryActionLabel: "Plan a Visit",
    whyHeading: "Why people go",
    whyBody: "{title} works when you want somewhere nearby that already fits the moment — dinner, drinks, coffee, a quick reset, or a reason to stay out a little longer.",
    bestFor: ["After-work plans", "Low-friction meetups", "Visitors staying nearby", "Residents choosing by mood, not search results"],
    insight: "This pin matters because it turns nearby intent into an actual plan.",
    nearbyHeading: "Nearby",
    askPrompts: ["Is this good for tonight?", "What is nearby after this?", "Is this better for a date or a group?", "What perk can I use here?"],
  },
  event: {
    eyebrow: "Event",
    primaryActionLabel: "View Event",
    whyHeading: "Why it matters tonight",
    whyBody: "{title} gives residents a clear reason to leave the building and plug into what is happening nearby.",
    bestFor: ["Tonight plans", "Friends visiting downtown", "Low-commitment cultural plans", "Residents looking for something already happening"],
    insight: "Events should feel easy to act on, not buried in calendars, flyers, and social feeds.",
    nearbyHeading: "Nearby",
    askPrompts: ["What should I do before this?", "Where should we go after?", "Is this walkable?", "What else is happening tonight?"],
  },
  perk: {
    eyebrow: "Resident perk",
    primaryActionLabel: "Use Perk",
    whyHeading: "Why this perk is useful",
    whyBody: "This offer gives residents a simple reason to choose {title} when they are already nearby.",
    bestFor: ["Quick local decisions", "Trying somewhere new", "Turning a nearby place into a routine", "Saving without hunting for codes"],
    insight: "The best perks do not interrupt behavior. They make the next local choice easier.",
    perkInstructions: "The resident offer should describe the benefit first; redemption details belong in the terms.",
    nearbyHeading: "Perks nearby",
    askPrompts: ["How do I use this?", "What else is nearby?", "Is this good today?", "What other perks are close?"],
  },
  retail: {
    eyebrow: "Retail",
    primaryActionLabel: "View Details",
    whyHeading: "Why this stop is useful",
    whyBody: "{title} works as a nearby retail stop for fittings, appointments, errands, and resident value when people are already moving through downtown.",
    bestFor: ["Shopping nearby", "Appointments", "Errands", "Resident value"],
    insight: "Useful retail pins should help people decide whether to save, visit, or plan the next stop nearby.",
    nearbyHeading: "Retail nearby",
    askPrompts: ["What perk is available?", "Is this close to me?", "What else is nearby?", "When should I go?"],
  },
  hotel: {
    eyebrow: "Hotel",
    primaryActionLabel: "Explore Nearby",
    whyHeading: "Why guests use this area",
    whyBody: "{title} works as a downtown base because food, music, coffee, trails, venues, and local routines are close enough to become part of the stay.",
    bestFor: ["Guest arrivals", "Walkable dining", "Coffee nearby", "Events nearby"],
    insight: "The hotel is not just a stay. It is a starting point.",
    nearbyHeading: "Hotels Nearby",
    askPrompts: ["Where should guests go first?", "What is walkable from here?", "Where should we send visitors?", "What is good tonight?"],
  },
  brand: {
    eyebrow: "Brand guide",
    primaryActionLabel: "Open Brand Guide",
    whyHeading: "Why it matters",
    whyBody: "{title} connects to downtown through the places people already move through — trails, events, hotels, water, retail moments, and local routines.",
    bestFor: ["Resident moments", "Event nights", "Trail routines", "Visitor discovery"],
    insight: "A strong brand pin should feel useful in place, not like an ad dropped onto a map.",
    nearbyHeading: "Activation nearby",
    askPrompts: ["Where does this brand show up nearby?", "What perk is available?", "What events connect to this?", "What should I do before or after?"],
  },
  civic: {
    eyebrow: "Downtown landmark",
    primaryActionLabel: "Explore Nearby",
    whyHeading: "Why People Come Here",
    whyBody: "{title} helps downtown feel more usable, memorable, and connected — a place residents and visitors can fold into real plans, walks, routines, and civic discovery.",
    bestFor: ["Visitors", "Downtown residents", "Walking routes", "Civic discovery", "Weekend plans"],
    insight: "Start here when you want an easy downtown landmark, nearby plans, and a walkable next stop.",
    nearbyHeading: "Nearby Now",
    askPrompts: ["What can I do here?", "What is nearby?", "Where should I walk next?", "What else should I see?"],
  },
  service: {
    eyebrow: "Local service",
    primaryActionLabel: "View Details",
    whyHeading: "Why residents use this",
    whyBody: "{title} supports the practical side of downtown life — the errands, appointments, care, and everyday needs that make the neighborhood easier to use.",
    bestFor: ["Errands nearby", "Everyday convenience", "Resident support", "Practical planning"],
    insight: "Useful services turn downtown from a place to visit into a place that works.",
    nearbyHeading: "Useful nearby",
    askPrompts: ["Is this close to me?", "When should I go?", "What else can I do nearby?", "Is there a resident offer?"],
  },
  localGuide: {
    eyebrow: "Local guide",
    primaryActionLabel: "Open Guide",
    whyHeading: "Why this guide helps",
    whyBody: "This guide turns nearby options into a clearer plan, organized around how people actually move through downtown.",
    bestFor: ["Choosing faster", "Planning with visitors", "Finding nearby clusters", "Turning scattered options into a route"],
    insight: "Use the nearby context to choose a first stop, then build the rest of the plan around what is close.",
    nearbyHeading: "Stops in the guide",
    askPrompts: ["What is the best first stop?", "What is nearby after this?", "Can I walk this route?", "What fits tonight?"],
  },
  campaign: {
    eyebrow: "Active campaign",
    primaryActionLabel: "Open Campaign",
    whyHeading: "Why this campaign fits",
    whyBody: "{title} works when it is tied to a real nearby routine, not a generic impression.",
    bestFor: ["Clear next steps", "Nearby intent", "Measurable saves", "Partner follow-up"],
    insight: "Campaigns should make one useful action easier to take from the map.",
    nearbyHeading: "Campaign context",
    askPrompts: ["Who is close enough to act?", "What should the next step be?", "What nearby places matter?", "How should this be measured?"],
  },
  propertyOverview: {
    eyebrow: "Residential building",
    primaryActionLabel: "Explore Neighborhood",
    whyHeading: "Why living here works",
    whyBody: "{title} is useful because the surrounding routine is strong — coffee, dining, trails, hotels, services, and events are close enough to shape daily life.",
    bestFor: ["Residents comparing neighborhoods", "Walkability research", "Lifestyle-first decisions", "Understanding the area before touring"],
    insight: "Square footage matters. The surrounding routine is what makes the address feel livable.",
    nearbyHeading: "Walkable nearby",
    askPrompts: ["What is walkable from here?", "Where would I go every week?", "How does this area feel at night?", "What buildings are nearby?"],
  },
};

export function resolveEntityPanelContent(entity = {}, mode = "resident") {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw : {};
  const title = panelTitleFor(entity);
  const type = panelEntityType(entity);
  const base = PANEL_CONTENT_BY_TYPE[type] || PANEL_CONTENT_BY_TYPE.venue;
  const isYeti = /^yeti(?: flagship)?$/i.test(title);
  const context = residentSafePanelText(
    raw.panelContext ||
      raw.downtown_perks_summary ||
      raw.context ||
      entity.context ||
      raw.summary ||
      entity.summary ||
      raw.description ||
      entity.description,
    formatPanelTemplate(base.whyBody, title),
  );
  const content = {
    panelType: type,
    eyebrow: safePanelText(base.eyebrow, "Downtown Austin"),
    title,
    subtitle: panelSubtitleFor(entity),
    context,
    primaryActionLabel: base.primaryActionLabel,
    whyHeading: base.whyHeading,
    whyBody: formatPanelTemplate(base.whyBody, title),
    bestFor: [...(base.bestFor || [])],
    insight: base.insight,
    perkTitle: safePanelText(raw.perk?.title || raw.offer || entity.offer || entity.deals_offers || raw.deals_offers, ""),
    perkValue: safePanelText(raw.perk?.value || entity.perkValue || raw.perkValue || "", ""),
    perkInstructions: base.perkInstructions || "",
    nearbyHeading: base.nearbyHeading || "Nearby",
    askPrompts: [...(base.askPrompts || [])],
  };

  if (mode === "partner") {
    const partnerCopy = resolvePartnerPanelCopy(entity);
    return {
      ...content,
      eyebrow: partnerCopy.category || "Partner opportunity",
      subtitle: partnerCopy.value || content.subtitle,
      context: partnerCopy.description || partnerCopy.audience,
      primaryActionLabel: partnerCopy.action || "Manage partner content",
      whyHeading: `${title} partner opportunity`,
      whyBody: partnerCopy.value || partnerCopy.description,
      bestFor: [partnerCopy.audience, partnerCopy.timing, partnerCopy.placement].filter(Boolean),
      insight: partnerCopy.description || partnerCopy.terms,
      perkTitle: "",
      perkValue: "",
      perkInstructions: "",
      nearbyHeading: "Nearby demand and placement",
      askPrompts: [
        "Which audience is closest to acting?",
        "What should we publish next?",
        "Which nearby signals matter?",
        "How should this be measured?",
      ],
    };
  }

  const contextualWhy = buildContextualPanelWhy(entity, title, type);
  content.whyHeading = contextualWhy.heading || content.whyHeading;
  content.whyBody = contextualWhy.body || content.whyBody;
  content.insight = contextualWhy.insight || content.insight;
  if (!content.context || isGenericInventoryPanelCopy(content.context)) content.context = content.whyBody;

  if (PARTNER_ONLY_COPY.test(content.whyBody)) content.whyBody = formatPanelTemplate(base.whyBody, title);
  if (PARTNER_ONLY_COPY.test(content.insight)) content.insight = base.insight;

  if (isYeti) {
    const yetiLocation = panelLocationPhrase(entity);
    content.primaryActionLabel = "Open Brand Guide";
    content.whyHeading = `Why choose ${title}`;
    content.whyBody = `${title} connects Austin's lake, trail, paddle, hotel, and event routines to a specific stop at ${yetiLocation}.`;
    content.context = content.whyBody;
    content.bestFor = [];
    content.insight = `Open ${title} for the current store or activation details and the closest outdoor routes.`;
    content.perkTitle = content.perkTitle || "Resident refill stop and engraving window";
    content.perkValue = content.perkValue || "Cold-water refill context plus YETI engraving access when active.";
    content.perkInstructions = content.perkInstructions || "Show your Resident Pass at a participating YETI station or store window when the activation is live.";
    content.nearbyHeading = "Trail and lake nearby";
    content.askPrompts = ["Where does YETI show up nearby?", "What perk can I use?", "What should I pair with this?", "What is walkable from here?"];
  }

  return content;
}
