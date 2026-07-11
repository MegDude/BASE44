const RAINEY_RESIDENTIAL_ANCHORS = [
  "milago",
  "70 rainey",
  "the quincy",
  "quincy",
  "the shore",
  "camden rainey",
  "44 east",
  "the travis",
  "vesper",
  "waterline",
  "paseo",
  "the paseo",
  "the modern",
  "700 river",
  "residences at 6g",
];

const RAINEY_HOSPITALITY_ANCHORS = [
  "hotel van zandt",
  "homewood suites",
  "cambria",
  "hyatt place",
  "hyatt centric",
  "fairmont",
  "austin proper",
  "thompson",
  "the loren",
];

const RAINEY_DINING_ANCHORS = [
  "banger",
  "emmer & rye",
  "anthem",
  "ciclo",
  "geraldine",
  "half step",
  "lustre pearl",
  "salvation pizza",
  "via 313",
  "container bar",
  "clive bar",
  "icenhauers",
  "icenhauers",
  "idle hands",
  "parlor room",
  "lucille",
  "atx cocina",
  "j. carver",
  "red ash",
  "restaurant francois",
  "restaurant françois",
  "roaring fork",
];

export const RAINEY_LAUNCH_TAXONOMY = [
  "Dining",
  "Coffee",
  "Nightlife",
  "Fitness",
  "Wellness",
  "Retail",
  "Entertainment",
  "Services",
  "Property Amenities",
  "Hotel Access",
  "Experiences",
  "Community",
];

export const RAINEY_AMENITY_PROGRAMS = [
  "Pool access",
  "Gym access",
  "Coworking",
  "Pet amenities",
  "Roof deck",
  "Guest parking",
  "Meeting rooms",
  "Business lounge",
  "EV charging",
];

export const RAINEY_EDITORIAL_COLLECTIONS = [
  "Resident Favorites",
  "Dog Friendly",
  "Date Night",
  "Work From Anywhere",
  "Best Happy Hours",
  "Under $20",
  "Brunch",
  "Pool Day",
  "Live Music",
  "Hidden Gems",
];

export const RAINEY_WALKING_ROUTES = [
  "Coffee Walk",
  "Happy Hour Walk",
  "Waterfront Walk",
  "Resident Welcome Walk",
  "Weekend Explorer",
  "Live Music Trail",
  "Rainey Social Loop",
];

function entityText(entity = {}) {
  return [
    entity.id,
    entity.name,
    entity.title,
    entity.type,
    entity.kind,
    entity.category,
    entity.category_key,
    entity.partnerType,
    entity.district,
    entity.neighborhood,
    entity.address,
    ...(Array.isArray(entity.tags) ? entity.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function includesAny(text, values) {
  return values.some((value) => text.includes(value));
}

export function applyLaunchMapCuration(entity = {}) {
  const text = entityText(entity);
  const isRainey = /\b(rainey|east avenue|east ave|river street|river st|davis street|davis st)\b/.test(text);
  const isResidential = includesAny(text, RAINEY_RESIDENTIAL_ANCHORS) || /\b(residential|residence|apartment|condo|building|property)\b/.test(text);
  const isHotel = includesAny(text, RAINEY_HOSPITALITY_ANCHORS) || /\b(hotel|hospitality|staycation)\b/.test(text);
  const isDining = includesAny(text, RAINEY_DINING_ANCHORS) || /\b(restaurant|dining|coffee|cafe|bar|nightlife|happy hour)\b/.test(text);
  const isEvent = /\b(event|rsvp|concert|live music|tonight)\b/.test(text);
  const isAmenity = /\b(pool|gym|cowork|pet spa|roof deck|parking|meeting room|business lounge|ev charging|amenity)\b/.test(text);
  const isRouteOrCollection = /\b(route|walk|trail|collection|passport)\b/.test(text);
  const isCivic = /\b(civic|public art|government|library|park|waterloo|greenway)\b/.test(text);
  const isUtility = /\b(utility|pharmacy|cleaner|dry cleaning|shipping|printing|bike share|visitor info)\b/.test(text);
  const hasPerk = Boolean(entity.perk?.isActive || entity.hasPerk || entity.perkEligible || entity.offer || entity.deals_offers);
  const hasCampaign = Boolean(entity.campaignId || entity.activeCampaign || /\b(campaign|activation)\b/.test(text));
  const hasIdentity = Boolean(entity.name || entity.title);
  const hasCoordinates = Number.isFinite(Number(entity.latitude ?? entity.lat)) && Number.isFinite(Number(entity.longitude ?? entity.lng));
  const isPlaceholder = /\b(placeholder|test entity|qa only|incomplete)\b/.test(text) || !hasIdentity || !hasCoordinates;

  let priorityTier = 3;
  if (hasPerk || isEvent || (isRainey && isResidential)) priorityTier = 1;
  else if (isHotel || isDining || isAmenity) priorityTier = 2;
  else if (isRouteOrCollection || isCivic) priorityTier = 3;
  else if (isUtility) priorityTier = 4;

  const mapVisibility = isPlaceholder
    ? "hidden"
    : isUtility
      ? "intent_only"
      : hasPerk || hasCampaign || (isRainey && (isResidential || isHotel || isDining))
        ? "priority"
        : "viewport_only";

  const residentHub = isRainey && isResidential
    ? {
        activePerks: Number(entity.activePerkCount || entity.perks?.length || (hasPerk ? 1 : 0)),
        happyHours: Number(entity.happyHourCount || 3),
        eventsTonight: Number(entity.eventsTonightCount || 2),
        nearbyCategories: ["Dining nearby", "Coffee nearby", "Hotel access", "Walking routes"],
        amenityPrograms: RAINEY_AMENITY_PROGRAMS,
      }
    : null;

  return {
    ...entity,
    priorityTier,
    mapVisibility,
    publicationStatus: isPlaceholder ? "draft" : entity.publicationStatus || "published",
    launchDistrict: isRainey ? "Rainey" : entity.launchDistrict,
    launchDecisionLayer: true,
    primaryResidentActions: hasPerk ? ["Redeem Perk", "Show QR", "Directions"] : ["Directions", "Save"],
    launchTaxonomy: RAINEY_LAUNCH_TAXONOMY,
    collectionIds: isRainey ? RAINEY_EDITORIAL_COLLECTIONS : entity.collectionIds,
    routeIds: isRainey ? RAINEY_WALKING_ROUTES : entity.routeIds,
    amenityPrograms: isRainey && (isResidential || isHotel || isAmenity) ? RAINEY_AMENITY_PROGRAMS : entity.amenityPrograms,
    residentHub,
    raw: {
      ...(entity.raw || {}),
      priorityTier,
      mapVisibility,
      launchDistrict: isRainey ? "Rainey" : entity.launchDistrict,
      launchDecisionLayer: true,
      residentHub,
    },
  };
}
