import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { legendsListingPlaces, LEGENDS_RECONCILIATION_NOTE } from "../src/data/legendsListings.js";
import {
  luxuryPresenceBuildings,
  luxuryPresenceInventorySummary,
  luxuryPresenceListings,
} from "../src/data/luxuryPresenceInventory.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "src", "data", "production");
const today = "2026-06-04";

const locations = JSON.parse(await fs.readFile(path.join(root, "src", "data", "locations.json"), "utf8"));
const happyHourInventory = await loadTsExport("src/data/happyHourInventory.ts", "happyHourInventory");
const waterlooParkInventory = await loadTsExport("src/data/waterlooParkInventory.ts", "waterlooParkInventory");
const waterlooParkCampaignPins = await loadTsExport("src/data/waterlooParkCampaignPins.ts", "waterlooParkCampaignPins");

async function loadTsExport(relativePath, exportName) {
  const source = await fs.readFile(path.join(root, relativePath), "utf8");
  const transformed = await transform(source, {
    loader: "ts",
    format: "esm",
    target: "es2022",
    treeShaking: false,
  });
  const module = await import(`data:text/javascript;base64,${Buffer.from(transformed.code).toString("base64")}`);
  return module[exportName] || [];
}

function slug(value, fallback = "downtown-perks") {
  return String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || fallback;
}

function shortCopy(value, fallback) {
  const cleaned = String(value || fallback || "")
    .replace(/\bDining Perk\b/gi, "Dining")
    .replace(/\bCoffee Stop\b/gi, "Coffee")
    .replace(/\bNight[- ]Out Nearby\b/gi, "Drinks nearby")
    .replace(/\bProperty Discovery\b/gi, "Property")
    .replace(/\bResident Access\b/gi, "Resident Card")
    .replace(/\bCreate Map Plan\b/gi, "Start Campaign")
    .replace(/\bNearby Downtown Option\b/gi, "Nearby")
    .replace(/\bLearn More\b/gi, "View Details")
    .replace(/\bRead More\b/gi, "View Details")
    .replace(/\bDiscover More\b/gi, "Explore Nearby")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= 120) return cleaned;
  return `${cleaned.slice(0, 119).replace(/\s+\S*$/, "").trim()}.`;
}

function inferDistrict(entity) {
  const text = [entity.district, entity.address, entity.name, entity.category, entity.category_key]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("seaholm")) return "Seaholm";
  if (text.includes("rainey")) return "Rainey";
  if (text.includes("congress")) return "Congress";
  if (text.includes("2nd") || text.includes("second street")) return "2nd Street";
  if (text.includes("west 6th") || text.includes("w 6th")) return "West 6th";
  if (text.includes("red river")) return "Red River";
  if (text.includes("warehouse")) return "Warehouse";
  if (text.includes("waterloo")) return "Waterloo";
  if (text.includes("waterfront") || text.includes("lake")) return "Waterfront";
  return String(entity.district || "Downtown Core");
}

function inferType(entity) {
  const text = [entity.type, entity.category, entity.category_key, entity.partnerType, entity.name, entity.source]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (text.includes("legends") || text.includes("mls") || text.includes("listing")) return "listing";
  if (text.includes("residential") || text.includes("building") || text.includes("property")) return "building";
  if (text.includes("hotel") || text.includes("hospitality")) return "hotel";
  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) return "coffee";
  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("beer")) return "bar";
  if (text.includes("restaurant") || text.includes("dining") || text.includes("food")) return "restaurant";
  if (text.includes("retail") || text.includes("shop") || text.includes("store") || text.includes("market")) return "retail";
  if (text.includes("wellness") || text.includes("fitness") || text.includes("yoga") || text.includes("spa")) return "wellness";
  if (text.includes("brand")) return "brand";
  if (text.includes("event") || text.includes("rsvp") || text.includes("music") || text.includes("concert")) return "event";
  if (text.includes("perk") || text.includes("offer") || text.includes("happy hour")) return "perk";
  if (text.includes("service")) return "service";
  if (text.includes("civic") || text.includes("public") || text.includes("park")) return "civic";
  return "restaurant";
}

function categoryForType(type, entity = {}) {
  const text = [type, entity.category, entity.category_key, entity.name].filter(Boolean).join(" ").toLowerCase();
  if (text.includes("coffee")) return "Coffee";
  if (type === "restaurant") return "Dining";
  if (type === "bar") return "Drinks";
  if (type === "hotel") return "Hotel";
  if (text.includes("grocery")) return "Grocery";
  if (type === "retail") return "Retail";
  if (type === "wellness") return text.includes("fitness") ? "Fitness" : "Wellness";
  if (type === "building") return "Residential";
  if (type === "listing") return "Property";
  if (type === "event") return text.includes("music") ? "Music" : "Events";
  if (type === "brand") return "Brands";
  if (type === "civic") return "Civic";
  if (type === "service") return "Services";
  if (type === "perk") return "Perks";
  return "Dining";
}

function defaultActions(type) {
  const actions = {
    building: ["View Listings", "Schedule Tour", "Explore Nearby"],
    listing: ["View Property", "Schedule Tour", "Save Property", "Explore Nearby", "Contact Legends"],
    hotel: ["View Hotel", "Directions", "Save"],
    restaurant: ["Save", "Reserve", "Directions"],
    bar: ["Save", "Directions", "Website"],
    coffee: ["Save", "Directions", "Website"],
    retail: ["Save", "Directions", "Website"],
    wellness: ["Save", "Directions", "Website"],
    brand: ["Save", "Website", "Directions"],
    event: ["RSVP", "Save", "Directions"],
    perk: ["Save", "Directions", "Website"],
    service: ["Save", "Directions", "Website"],
    civic: ["Save", "Website", "Directions"],
    district: ["Explore", "View Events", "View Perks"],
  };
  return (actions[type] || actions.restaurant).map((label) => ({ label }));
}

const RESIDENTIAL_NARRATIVE = {
  headline: "Want to live here?",
  copy: [
    "This Downtown Austin residence is currently available through Legends Real Estate.",
    "Explore the neighborhood, discover nearby restaurants, coffee shops, parks, fitness studios, grocery options, events, and everyday essentials before scheduling a private tour.",
    "Because where you live should connect to how you live.",
  ],
};

const NEARBY_REQUIREMENTS = [
  "Coffee Nearby",
  "Dining Nearby",
  "Fitness Nearby",
  "Grocery Nearby",
  "Parks & Trails Nearby",
  "Events Nearby",
];

const BUILDING_STORIES = {
  "seaholm-residences": {
    name: "Seaholm Residences",
    walkTo: ["Trader Joe's", "Central Library", "Lady Bird Lake", "True Food Kitchen", "Merit Coffee", "Seaholm Plaza"],
    narrative: "Located in the Seaholm District, these residences connect downtown living with waterfront access, daily convenience, and some of Austin's most walkable amenities.",
  },
  "44-east": {
    name: "44 East",
    walkTo: ["Lady Bird Lake Trail", "Rainey Street", "Hotel Van Zandt", "Royal Blue Grocery"],
    narrative: "Modern luxury living positioned between the lake and one of Austin's most active entertainment districts.",
  },
  "360-condominiums": {
    name: "360 Nueces",
    walkTo: ["Trader Joe's", "2nd Street District", "Whole Foods", "Central Library"],
    narrative: "A centrally located tower offering immediate access to dining, fitness, retail, and daily essentials.",
  },
  "the-independent": {
    name: "The Independent",
    walkTo: ["Trader Joe's", "Seaholm Plaza", "Central Library", "Lady Bird Lake", "Merit Coffee"],
    narrative: "A Seaholm tower connected to lake access, downtown dining, fitness, and daily essentials within a short walk.",
  },
  "the-austonian": {
    name: "The Austonian",
    walkTo: ["Congress Avenue", "2nd Street District", "Lady Bird Lake", "Downtown dining"],
    narrative: "Downtown residential living connected to restaurants, culture, offices, and lake access from the center of Austin.",
  },
};

const DISTRICT_STORY_OVERRIDES = {
  "Downtown Austin": {
    focus: ["Walkability", "Business district", "Culture", "Entertainment"],
    narrative: "Downtown Austin connects daily convenience with restaurants, culture, events, and walkable neighborhood routines.",
  },
  "Downtown Core": {
    focus: ["Walkability", "Business district", "Culture", "Entertainment"],
    narrative: "Downtown Austin connects daily convenience with restaurants, culture, events, and walkable neighborhood routines.",
  },
  Rainey: {
    focus: ["Waterfront", "Restaurants", "Nightlife", "Trails"],
    narrative: "Rainey connects waterfront access with restaurants, nightlife, trail access, and some of downtown's most active evenings.",
  },
  Congress: {
    focus: ["Employment", "Culture", "Events", "Restaurants"],
    narrative: "Congress places work, culture, restaurants, events, and downtown movement close together.",
  },
  "2nd Street": {
    focus: ["Retail", "Dining", "Fitness", "Daily convenience"],
    narrative: "2nd Street brings retail, dining, fitness, grocery access, and daily convenience into one walkable district.",
  },
  Seaholm: {
    focus: ["Urban lifestyle", "Trail access", "Grocery", "Residential convenience"],
    narrative: "Seaholm connects urban living with grocery access, trails, fitness, restaurants, and residential convenience.",
  },
};

function imageFor(entity, type, slugValue) {
  const primary =
    entity.primaryImage ||
    entity.heroImage ||
    entity.panelImage ||
    entity.image ||
    entity.thumbnail ||
    entity.buildingExterior ||
    entity.lifestyleImage ||
    entity.raw?.heroImage ||
    entity.raw?.image ||
    "";
  const category = categoryForType(type, entity).toLowerCase();
  return {
    heroImage: primary || `/images/fallbacks/${category}.jpg`,
    thumbnail: entity.thumbnail || primary || `/images/fallbacks/${category}-thumb.jpg`,
    gallery: Array.isArray(entity.gallery)
      ? entity.gallery
      : Array.isArray(entity.galleryImages)
        ? entity.galleryImages
        : primary
          ? [primary]
          : [],
    fallback: `/images/fallbacks/${category}.jpg`,
    source: primary ? "source" : "category-fallback",
    slug: slugValue,
  };
}

function normalizeBase(entity, namespace, overrides = {}) {
  const name = String(overrides.name || entity.name || entity.address || "Downtown entity");
  const slugValue = slug(overrides.slug || name);
  const type = overrides.entityType || inferType(entity);
  const category = overrides.category || categoryForType(type, entity);
  const district = overrides.district || inferDistrict(entity);
  const description = shortCopy(
    overrides.description || entity.description || entity.summary || entity.drawerCopy,
    `${name} is part of the Downtown Perks inventory for ${district}.`
  );
  const visual = imageFor(entity, type, slugValue);
  return {
    id: overrides.id || entity.id || `${namespace}-${slugValue}`,
    slug: slugValue,
    name,
    entityType: type,
    category,
    subcategory: overrides.subcategory || entity.subCategory || entity.subcategory || entity.category || "",
    district,
    address: overrides.address || entity.address || "",
    lat: overrides.lat ?? entity.lat ?? entity.latitude ?? null,
    lng: overrides.lng ?? entity.lng ?? entity.longitude ?? null,
    status: overrides.status || entity.status || "active",
    source: overrides.source || entity.source || namespace,
    updatedAt: overrides.updatedAt || entity.updatedAt || entity.updated_at || entity.lastUpdated || today,
    description,
    primaryImage: visual.heroImage,
    galleryImages: visual.gallery,
    thumbnail: visual.thumbnail,
    actions: overrides.actions || defaultActions(type),
    inheritance: overrides.inheritance || {
      district,
      imageStrategy: visual.source,
      buildingSlug: "",
      mlsOverridesImage: false,
    },
    seo: {
      title: `${name} | Downtown Perks`,
      description,
    },
    searchText: [name, category, district, entity.address, entity.category, entity.category_key, description]
      .filter(Boolean)
      .join(" "),
  };
}

function baseAddress(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/#.*$/, "")
    .replace(/,\s*austin.*$/, "")
    .replace(/\b(street)\b/g, "st")
    .replace(/\b(avenue)\b/g, "ave")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSqft(value) {
  if (!value && value !== 0) return "";
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) return `${numeric.toLocaleString()} sq ft`;
  return String(value);
}

function buildingSlugForListing(source) {
  return slug(source.building_name || source.buildingName || source.panelTitle || baseAddress(source.address || source.name));
}

function buildingStoryForListing(source, fallbackDistrict) {
  const story = BUILDING_STORIES[buildingSlugForListing(source)] || BUILDING_STORIES[slug(baseAddress(source.address || source.name))];
  if (story) return story;
  const districtStory = DISTRICT_STORY_OVERRIDES[fallbackDistrict] || DISTRICT_STORY_OVERRIDES["Downtown Austin"];
  return {
    name: source.building_name || source.buildingName || source.panelTitle || baseAddress(source.address || source.name) || "Downtown Austin residence",
    walkTo: [],
    narrative: districtStory.narrative,
  };
}

function districtStoryForListing(district) {
  return DISTRICT_STORY_OVERRIDES[district] || DISTRICT_STORY_OVERRIDES["Downtown Austin"];
}

function factsFromLegendsListing(listing) {
  return {
    price: listing.priceDisplay || listing.price || "",
    bedrooms: listing.beds ?? "",
    bathrooms: listing.baths ?? "",
    squareFeet: listing.sqftDisplay || formatSqft(listing.sqft),
    mlsNumber: listing.mlsNumber || listing.mls_number || "",
    status: listing.status || listing.listingTypeLabel || "",
    daysOnMarket: listing.daysOnMarket ?? "",
    availableThrough: "Legends Real Estate",
  };
}

function factsFromLuxuryListing(listing) {
  return {
    price: listing.price || listing.facts?.price || "",
    bedrooms: listing.beds ?? listing.facts?.beds ?? "",
    bathrooms: listing.baths ?? listing.facts?.baths ?? "",
    squareFeet: formatSqft(listing.sqft || listing.facts?.sqft),
    mlsNumber: listing.mls_number || listing.mlsNumber || String(listing.facts?.mls || "").replace(/^MLS\s+/i, ""),
    status: listing.status || "",
    daysOnMarket: listing.daysOnMarket ?? "",
    availableThrough: "Legends Real Estate",
  };
}

function legendsContentForListing({ address, district, sourceRecord, facts, sourceName }) {
  const buildingStory = buildingStoryForListing(sourceRecord, district);
  const districtStory = districtStoryForListing(district);
  const seoAddress = String(address || sourceRecord.address || sourceRecord.name || "Downtown Austin residence");
  return {
    universalHeader: {
      eyebrow: "Legends Real Estate · Residential Property · Downtown Austin",
      address: seoAddress,
      district,
    },
    resident: {
      ...RESIDENTIAL_NARRATIVE,
      purpose: "Help someone decide whether this building fits their lifestyle.",
      actions: ["View Property", "Schedule Tour", "Save Property", "Explore Nearby", "Contact Legends"],
    },
    partner: {
      headline: "Property Visibility",
      purpose: "Help partners understand how residential inventory connects to neighborhood activity.",
      actions: ["Create Property Plan", "Reports", "Contact Legends"],
    },
    propertyFacts: facts,
    propertyFactsDisplayOrder: [
      "price",
      "bedrooms",
      "bathrooms",
      "squareFeet",
      "mlsNumber",
      "status",
      "daysOnMarket",
      "availableThrough",
    ],
    buildingStory,
    districtStory,
    nearbySections: NEARBY_REQUIREMENTS,
    sourceHierarchy: ["MLS", "Luxury Presence", "Legends Feed", "Building Registry", "District Registry", "Downtown Perks Inventory"],
    sourceIntegrity: {
      sourceName,
      mlsWins: true,
      neverGenerate: ["Price", "Beds", "Baths", "MLS Number", "Availability", "SqFt"],
    },
    seo: {
      title: `${seoAddress} | Downtown Austin Condo For Sale | Legends Real Estate`,
      meta: `Explore ${seoAddress}, a downtown Austin residence available through Legends Real Estate. View neighborhood amenities, nearby dining, fitness, events, and property details.`,
    },
  };
}

const rawMapEntities = locations.map((entity, index) => normalizeBase(entity, "locations", { id: entity.id || `map-${index}-${slug(entity.name)}` }));

const legendsListings = legendsListingPlaces.map((place) => {
  const listing = place.legendsListing || {};
  const buildingSlug = slug(baseAddress(listing.address || place.address));
  const district = place.district || "Downtown Austin";
  const facts = factsFromLegendsListing(listing);
  const legendsContent = legendsContentForListing({
    address: listing.address || place.address,
    district,
    sourceRecord: listing,
    facts,
    sourceName: "Legends listing feed",
  });
  return {
    ...normalizeBase(place, "legends", {
    entityType: "listing",
    category: "Property",
    source: "Legends Real Estate",
    updatedAt: today,
    description: "This Downtown Austin residence is currently available through Legends Real Estate.",
    actions: defaultActions("listing"),
    inheritance: {
      district,
      buildingSlug,
      imageStrategy: "MLS listing photography wins; otherwise inherit building imagery.",
      mlsOverridesImage: Boolean(listing.image),
    },
    }),
    legendsContent,
    propertyFacts: facts,
    seo: legendsContent.seo,
  };
});

const luxuryListings = luxuryPresenceListings.map((listing) => {
  const buildingSlug = slug(baseAddress(listing.address));
  const district = listing.district || "Downtown Austin";
  const facts = factsFromLuxuryListing(listing);
  const legendsContent = legendsContentForListing({
    address: listing.address,
    district,
    sourceRecord: listing,
    facts,
    sourceName: "Luxury Presence MLS feed",
  });
  return {
    ...normalizeBase(listing, "luxury-presence", {
    id: listing.id || `luxury-presence-${slug(listing.address)}`,
    name: listing.address,
    entityType: "listing",
    category: "Property",
    source: "Luxury Presence MLS feed",
    updatedAt: today,
    description: "This Downtown Austin residence is currently available through Legends Real Estate.",
    actions: defaultActions("listing"),
    inheritance: {
      district,
      buildingSlug,
      imageStrategy: "MLS listing photography wins; otherwise inherit building imagery.",
      mlsOverridesImage: Boolean(listing.primaryImage || listing.heroImage),
    },
    }),
    legendsContent,
    propertyFacts: facts,
    seo: legendsContent.seo,
  };
});

const buildings = luxuryPresenceBuildings.map((building) => normalizeBase(building, "building", {
  entityType: "building",
  category: "Residential",
  source: building.source || "Building Registry",
  updatedAt: today,
  description: shortCopy(building.summary, `${building.name} connects downtown living with nearby places, events, and daily essentials.`),
  actions: defaultActions("building"),
  inheritance: {
    district: building.district,
    buildingSlug: slug(building.name),
    imageStrategy: "Building hero; MLS listing photography may override for listing panels.",
    mlsOverridesImage: false,
  },
}));

const happyHours = happyHourInventory.map((venue) => normalizeBase(venue, "happy-hour", {
  entityType: venue.category.toLowerCase().includes("coffee") ? "coffee" : venue.category.toLowerCase().includes("bar") ? "bar" : "restaurant",
  category: venue.category.toLowerCase().includes("bar") ? "Drinks" : "Dining",
  source: "Happy Hour Inventory",
  updatedAt: today,
  description: `${venue.name} has food and drink specials worth saving when you are already nearby.`,
}));

const waterloo = waterlooParkInventory.map((pin) => normalizeBase(pin, "waterloo", {
  entityType: pin.kind === "destination" ? "civic" : pin.kind === "event" ? "event" : "event",
  category: pin.category === "Live Music" ? "Music" : pin.category === "Parks" ? "Civic" : "Events",
  source: pin.source,
  updatedAt: pin.lastUpdated,
  description: pin.description,
}));

const waterlooCampaigns = waterlooParkCampaignPins.map((pin) => normalizeBase(pin, "waterloo-campaign", {
  entityType: pin.kind === "event" ? "event" : "brand",
  category: pin.kind === "event" ? "Events" : "Campaigns",
  source: "Downtown Perks Waterloo Park campaign inventory",
  updatedAt: today,
  description: pin.description,
}));

const all = [
  ...rawMapEntities,
  ...buildings,
  ...legendsListings,
  ...luxuryListings,
  ...happyHours,
  ...waterloo,
  ...waterlooCampaigns,
];

const seen = new Map();
for (const record of all) {
  const key = [record.entityType, record.slug, baseAddress(record.address)].join("|");
  if (!seen.has(key)) seen.set(key, record);
}
const inventory = [...seen.values()].sort((a, b) => a.slug.localeCompare(b.slug));

const heroRegistry = inventory.map(({ slug, primaryImage, thumbnail, galleryImages, category, inheritance }) => ({
  slug,
  heroImage: primaryImage,
  thumbnail,
  gallery: galleryImages,
  fallback: `/images/fallbacks/${String(category).toLowerCase()}.jpg`,
  inheritance,
}));

const districtNarratives = {
  Congress: {
    headline: "Work, culture, dining, and events in the center of downtown.",
    themes: ["Employment", "Culture", "Restaurants", "Events"],
  },
  Rainey: {
    headline: "Restaurants, nightlife, waterfront access, and trail connections.",
    themes: ["Waterfront", "Restaurants", "Nightlife", "Trail Access"],
  },
  Seaholm: {
    headline: "Urban living with groceries, trails, fitness, and residential convenience nearby.",
    themes: ["Urban Living", "Groceries", "Trails", "Fitness", "Residential Convenience"],
    walkTo: ["Trader Joe's", "Central Library", "Lady Bird Lake", "Merit Coffee", "True Food", "Seaholm Plaza"],
  },
  "2nd Street": {
    headline: "Retail, wellness, dining, and daily convenience within a short walk.",
    themes: ["Retail", "Wellness", "Dining", "Daily Convenience"],
  },
  "West 6th": {
    headline: "Restaurants, bars, and evening activity close to downtown offices.",
    themes: ["Restaurants", "Bars", "Evening Activity"],
  },
  "Red River": {
    headline: "Music venues, nightlife, and entertainment within a few blocks.",
    themes: ["Music", "Nightlife", "Entertainment"],
  },
};

const entityCopyRegistry = {
  residential: {
    headline: "Want to live here?",
    summary: "Because where you live should connect to how you live.",
    actions: ["View Property", "Schedule Tour", "Save Property", "Explore Nearby", "Contact Legends"],
  },
  hotel: { headline: "Staying downtown?", actions: ["View Hotel", "Directions", "Save"] },
  restaurant: { headline: "Worth saving for later.", actions: ["Save", "Directions"] },
  coffee: { headline: "A useful stop nearby.", actions: ["Save", "Directions", "Website"] },
  civic: { headline: "Part of the neighborhood.", actions: ["Save", "Website", "Directions"] },
  event: { headline: "Happening nearby.", actions: ["RSVP", "Save", "Directions"] },
};

const partnerCopyRegistry = {
  property: { headline: "Property Visibility Opportunity", action: "Create Property Plan" },
  hotel: { headline: "Guest Experience Opportunity", action: "Create Guest Guide" },
  venue: { headline: "Dining Visibility Opportunity", action: "Create Map Plan" },
  brand: { headline: "Brand Activation Opportunity", action: "Plan Brand Moment" },
  civic: { headline: "Community Engagement Opportunity", action: "Create Community Campaign" },
};

const drawerContentRegistry = {
  resident: ["Image", "District", "Entity Name", "Narrative", "Actions", "Nearby"],
  partner: ["Image", "District", "Entity Name", "Opportunity Narrative", "Resident Narrative", "Actions", "Nearby Activity"],
  removed: ["Tabs", "Details tab", "Map tab", "Cards inside cards", "Statistic grids", "Perk grids", "Active perk badges", "Pill buttons", "Nested panels", "Dashboard layouts"],
  heroImageRules: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    no: ["Radius", "Border", "Shadow", "Card"],
  },
};

const categoryFallbackRegistry = Object.fromEntries(
  ["Dining", "Coffee", "Hotel", "Residential", "Retail", "Wellness", "Brand", "Civic", "Event", "Service", "Nightlife"].map((name) => [
    name,
    `/images/fallbacks/${name.toLowerCase()}.jpg`,
  ])
);

const buildingNarrativeRegistry = Object.fromEntries(
  buildings.map((building) => [
    building.slug,
    {
      name: building.name,
      district: building.district,
      narrative: BUILDING_STORIES[building.slug]?.narrative || districtStoryForListing(building.district).narrative,
      walkTo: BUILDING_STORIES[building.slug]?.walkTo || districtNarratives[building.district]?.walkTo || [],
    },
  ])
);

const legendsMLSRegistry = {
  sourceHierarchy: ["MLS", "Luxury Presence", "Legends Feed", "Building Registry", "District Registry", "Downtown Perks Inventory"],
  rules: {
    mlsWins: true,
    neverGenerate: ["Price", "Beds", "Baths", "MLS Number", "Availability", "SqFt"],
    listingImageInheritance: "Listings inherit building imagery unless MLS photography exists.",
  },
  universalHeader: "Legends Real Estate · Residential Property · Downtown Austin",
  residentNarrative: RESIDENTIAL_NARRATIVE,
  partnerNarrative: {
    headline: "Property Visibility",
    purpose: "Help partners understand how residential inventory connects to neighborhood activity.",
    actions: ["Create Property Plan", "Reports", "Contact Legends"],
  },
  propertyFactsDisplayOrder: ["Price", "Bedrooms", "Bathrooms", "Square Feet", "MLS Number", "Status", "Days On Market", "Available Through"],
  nearbySections: NEARBY_REQUIREMENTS,
  residentActions: ["View Property", "Schedule Tour", "Save Property", "Explore Nearby", "Contact Legends"],
  partnerActions: ["Create Property Plan", "Reports", "Contact Legends"],
  drawerStructure: {
    resident: ["Hero Image", "Address", "District", "Price", "Beds", "Baths", "Sq Ft", "Summary", "Building Story", "Nearby Places", "CTA Group"],
    partner: ["Hero Image", "Address", "District", "MLS Metrics", "Resident Narrative", "Opportunity Narrative", "Building Story", "Nearby Activity", "CTA Group"],
  },
  seoTemplate: {
    title: "[Address] | Downtown Austin Condo For Sale | Legends Real Estate",
    meta: "Explore [Address], a downtown Austin residence available through Legends Real Estate. View neighborhood amenities, nearby dining, fitness, events, and property details.",
  },
  reconciliation: LEGENDS_RECONCILIATION_NOTE,
  luxuryPresenceInventorySummary,
  listingCount: legendsListings.length + luxuryListings.length,
  buildingCount: buildings.length,
  targetLegendsRecords: 942,
  targetNote: "The generator only normalizes committed local source data. Import the full production Legends feed to reach 942 records; do not fabricate MLS facts.",
};

const searchIntentRegistry = {
  resident: {
    placeholders: ["Coffee nearby", "Happy hour now", "Live music tonight", "Dinner nearby", "What should we do tonight?"],
    surfaces: ["Coffee", "Dinner", "Events", "Perks", "Nearby", "Tonight"],
    filters: ["Nearby", "Tonight", "Perks", "Events", "Places"],
    inventorySource: "production-map-inventory.json",
  },
  partner: {
    placeholders: [
      "What drove the most activity?",
      "Which perk performed best?",
      "What should we promote next?",
      "What are residents saving?",
      "Which buildings are most engaged?",
      "What is trending downtown?",
    ],
    surfaces: ["Activity", "Campaigns", "Properties", "Events", "Perks", "Trends"],
    filters: ["Activity", "Campaigns", "Events", "Perks", "Properties", "Trends"],
    inventorySource: "production-map-inventory.json",
  },
};

const campaignAssetRegistry = {
  brandActivation: "brand-activation-hero.jpg",
  communityMarket: "community-market-hero.jpg",
  concertSeries: "concert-series-hero.jpg",
  eventZone: "event-zone-hero.jpg",
  familyEvents: "family-events-hero.jpg",
  familyPavilion: "family-pavilion-hero.jpg",
};

const production = {
  schema: "Downtown Perks Production UX + Content + Inventory System V6",
  version: "V6",
  generatedAt: today,
  sourceOfTruth: "local committed inventory",
  coverage: {
    requestedMapEntities: 466,
    requestedLegendsRecords: 942,
    rawMapRowsAvailable: locations.length,
    normalizedProductionRecords: inventory.length,
    legendsListingPlacesAvailable: legendsListingPlaces.length,
    luxuryPresenceListingsAvailable: luxuryPresenceListings.length,
    luxuryPresenceBuildingsAvailable: luxuryPresenceBuildings.length,
    note: "Generated from committed local source data only. Missing target records should be imported from the production feed; MLS facts were not invented.",
  },
  inheritanceRules: {
    imageHierarchy: ["Actual Place Photography", "MLS Photography", "Building Hero", "District Hero", "Category Fallback"],
    mlsWins: true,
    listingsInheritBuildingImagery: true,
    districtInheritance: true,
    buildingInheritance: true,
  },
  searchIntelligence: {
    residentMode: searchIntentRegistry.resident.surfaces,
    partnerMode: searchIntentRegistry.partner.surfaces,
    inventorySource: "production-map-inventory.json",
  },
  campaignAssets: campaignAssetRegistry,
  records: inventory,
};

function tsExport(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "production-map-inventory.json"), JSON.stringify(production, null, 2));
await fs.writeFile(path.join(outputDir, "heroImageRegistry.ts"), tsExport("heroImageRegistry", heroRegistry));
await fs.writeFile(path.join(outputDir, "entityCopyRegistry.ts"), tsExport("entityCopyRegistry", entityCopyRegistry));
await fs.writeFile(path.join(outputDir, "partnerCopyRegistry.ts"), tsExport("partnerCopyRegistry", partnerCopyRegistry));
await fs.writeFile(path.join(outputDir, "drawerContentRegistry.ts"), tsExport("drawerContentRegistry", drawerContentRegistry));
await fs.writeFile(path.join(outputDir, "districtHeroRegistry.ts"), tsExport("districtHeroRegistry", Object.fromEntries(Object.keys(districtNarratives).map((district) => [district, `/images/districts/${slug(district)}-hero.jpg`]))));
await fs.writeFile(path.join(outputDir, "categoryFallbackRegistry.ts"), tsExport("categoryFallbackRegistry", categoryFallbackRegistry));
await fs.writeFile(path.join(outputDir, "buildingNarrativeRegistry.ts"), tsExport("buildingNarrativeRegistry", buildingNarrativeRegistry));
await fs.writeFile(path.join(outputDir, "districtNarrativeRegistry.ts"), tsExport("districtNarrativeRegistry", districtNarratives));
await fs.writeFile(path.join(outputDir, "legendsMLSRegistry.ts"), tsExport("legendsMLSRegistry", legendsMLSRegistry));
await fs.writeFile(path.join(outputDir, "searchIntentRegistry.ts"), tsExport("searchIntentRegistry", searchIntentRegistry));
await fs.writeFile(path.join(outputDir, "campaignAssetRegistry.ts"), tsExport("campaignAssetRegistry", campaignAssetRegistry));

console.log(JSON.stringify(production.coverage, null, 2));
