import { daaTourStops } from "./daaArtParksTour";
import { downtownPerksCollectionSeeds } from "./downtownPerksCollections.seed";
import { universalCollections } from "./universalCollections";
import { waterlooParkInventory } from "./waterlooParkInventory";

const daaArtWalkStopIds = daaTourStops.map((stop) => stop.id);
const daaArtWalkStopHints = daaTourStops.map((stop) => stop.displayName || stop.name);
const waterlooInventoryStopIds = waterlooParkInventory.map((stop) => stop.id);
const waterlooInventoryStopHints = waterlooParkInventory.map((stop) => stop.name);
const waterlooDiscoveryStopIds = [
  "civic-waterloo-greenway",
  ...waterlooInventoryStopIds,
  "discovery-waterloo-reflection-point",
  "discovery-waller-creek-design-marker",
  "discovery-golden-hour-waterloo",
];
const waterlooDiscoveryStopHints = [
  "Waterloo Greenway",
  ...waterlooInventoryStopHints,
  "Waterloo Reflection Point",
  "Waller Creek Design Marker",
  "Golden Hour Walks",
];

export const mapCollections = [
  ...downtownPerksCollectionSeeds.map((seed) => ({
    id: seed.id,
    title: seed.label,
    description: seed.description,
    category: String(seed.defaultFilter || "Featured").toLowerCase(),
    routeMode: seed.id === "walking-routes" ? "walking" : "collection",
    colorTheme: "gold",
    icon: seed.id === "walking-routes" ? "route" : "map",
    estimatedTime: "Curated map view",
    distanceLabel: "Downtown Austin",
    neighborhood: "Downtown Austin",
    ctaLabel: "Open collection",
    benefitTitle: "A focused shortlist built around one downtown need",
    benefitDescription: "Compare relevant places quickly, then open a stop for current access details, directions, and eligible perks.",
    checkInEnabled: true,
    badge: `${seed.residentLabel} Explorer`,
    completionReward: `${seed.residentLabel} Explorer is added to the Resident Passport after every stop is verified.`,
    accessibility: ["Live map", "Walking context", "Resident progress"],
    stories: [{ title: `Why ${seed.residentLabel} matters`, body: seed.description }],
    relatedCollectionIds: [],
    aiHints: ["Start with the nearest relevant stop.", "Continue with an unvisited place that matches your current plan."],
    stopIds: [],
    stopHints: [],
    priority: seed.priority,
    entityRules: seed.entityRules,
  })),
  ...universalCollections.map((collection) => ({ ...collection, checkInEnabled: true, stopIds: [], stopHints: [] })),
  {
    id: "daa-art-walk",
    title: "Downtown Art & Parks Walk",
    description: "A Downtown Austin Alliance public-realm walk for sculptures, murals, public art, parks, plazas, and cultural landmarks.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    estimatedTime: "Self-guided walk",
    distanceLabel: "Downtown-wide",
    neighborhood: "Downtown Austin",
    ctaLabel: "Start art walk",
    benefitTitle: "A self-guided public art route with collectible stop check-ins",
    benefitDescription: "See the work, story, artist, and nearby public space. Scan the posted code or check in nearby to build your Art & Parks progress.",
    checkInEnabled: true,
    completionReward: "Art & Parks walk complete — all visited stops are saved to your route activity.",
    stopIds: daaArtWalkStopIds,
    stopHints: daaArtWalkStopHints,
  },
  {
    id: "waterloo-greenway",
    title: "Waterloo Greenway Discovery Walk",
    description: "A Waterloo Greenway walking route connecting parks, gardens, Waller Creek, Moody Amphitheater, discovery markers, events, and useful nearby stops.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "emerald",
    icon: "route",
    estimatedTime: "Self-guided walk",
    distanceLabel: "Waterloo-wide",
    neighborhood: "Waterloo",
    ctaLabel: "Start Waterloo walk",
    benefitTitle: "A Waterloo discovery passport for parks, culture, and creek moments",
    benefitDescription: "Get useful detail for every stop, collect verified visit check-ins, and keep a record of the gardens, trail, event spaces, and design markers you explored.",
    checkInEnabled: true,
    completionReward: "Waterloo Explorer complete — all 11 stops are saved to your route activity.",
    stopIds: waterlooDiscoveryStopIds,
    stopHints: waterlooDiscoveryStopHints,
  },
  {
    id: "warehouse-district-happy-hour",
    title: "Warehouse District Happy Hour",
    description: "A compact drinks-and-dining route for nearby resident plans.",
    category: "nightlife",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    estimatedTime: "18 min walk",
    distanceLabel: "0.8 mi",
    neighborhood: "Warehouse District",
    ctaLabel: "Start route",
    benefitTitle: "A walkable happy-hour sequence without the planning overhead",
    benefitDescription: "Open each stop for its current resident offer, timing, directions, and redemption instructions before you go.",
    stopIds: ["inkind-j-carvers", "inkind-peche", "inkind-parkside", "partner-comedor"],
    stopHints: ["J Carver", "Péché", "Parkside", "Comedor"],
  },
  {
    id: "downtown-stories-walk",
    title: "Downtown Stories Walk",
    description: "A welcoming civic walk connecting public spaces, downtown stories, heritage points, cultural destinations, and useful nearby stops.",
    category: "civic",
    routeMode: "editorial",
    colorTheme: "emerald",
    icon: "route",
    estimatedTime: "25 min walk",
    distanceLabel: "1.1 mi",
    neighborhood: "Downtown Core",
    ctaLabel: "Start walk",
    benefitTitle: "A civic discovery route with progress you can collect",
    benefitDescription: "Learn why each public space matters, check in as you visit, and keep the completed downtown story in your route activity.",
    checkInEnabled: true,
    completionReward: "Downtown Stories walk complete — every civic stop is saved to your route activity.",
    stopIds: ["civic-republic-square-programming", "civic-daa", "civic-waterloo-greenway", "waterloo-park"],
    stopHints: ["Republic Square", "Downtown Austin Alliance", "Waterloo Greenway", "Waterloo Park"],
  },
  {
    id: "inkind-dining-market",
    title: "inKind Dining Market",
    description: "A dining value route connecting participating restaurants and nearby resident plans.",
    category: "dining",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    estimatedTime: "20 min walk",
    distanceLabel: "0.9 mi",
    neighborhood: "Warehouse District",
    ctaLabel: "View stops",
    benefitTitle: "Participating dining value organized into one walkable route",
    benefitDescription: "Open a restaurant stop to see current eligible inKind value and redemption terms; route guidance never replaces the restaurant's live offer rules.",
    stopIds: ["inkind-j-carvers", "inkind-peche", "inkind-parkside", "inkind-hopdoddy-congress"],
    stopHints: ["J Carver", "Péché", "Parkside", "Burger Bar Congress"],
  },
  {
    id: "coffee-before-work",
    title: "Coffee Before Work",
    description: "A short morning route for coffee, errands, and downtown workday starts.",
    category: "dining",
    routeMode: "walking",
    colorTheme: "emerald",
    icon: "route",
    estimatedTime: "14 min walk",
    distanceLabel: "0.6 mi",
    neighborhood: "2nd Street",
    ctaLabel: "Start route",
    benefitTitle: "A fast morning shortlist for coffee and workday errands",
    benefitDescription: "Compare nearby useful stops, see what each place offers, and move to your next downtown destination with less backtracking.",
    stopIds: ["partner-jos-coffee", "venue-merit-coffee", "priority-frost-tower"],
    stopHints: ["Jo's Coffee", "Merit Coffee", "Frost Tower"],
  },
  {
    id: "hotel-guest-arrival-route",
    title: "Hotel Guest Arrival Route",
    description: "A guest-friendly route from a downtown hotel into nearby food, music, and riverfront plans.",
    category: "hotel",
    routeMode: "walking",
    colorTheme: "navy",
    icon: "route",
    estimatedTime: "16 min walk",
    distanceLabel: "0.7 mi",
    neighborhood: "Rainey",
    ctaLabel: "Start route",
    benefitTitle: "A guest-ready arrival plan with useful nearby benefits",
    benefitDescription: "Move from check-in to food, music, and riverfront stops; open each place for current guest or resident eligibility and exact redemption details.",
    stopIds: ["partner-hotel-van-zandt", "partner-geraldines", "partner-stay-put", "partner-bangers"],
    stopHints: ["Hotel Van Zandt", "Geraldine's", "The Stay Put", "Banger's"],
  },
];

export function getMapCollectionById(collectionId) {
  const rawKey = String(collectionId || "").trim().toLowerCase();
  const key = rawKey === "daa-art-parks-tour" ? "daa-art-walk" : rawKey;
  const collection = mapCollections.find((item) => item.id === key);
  if (!collection) return null;
  return {
    checkInEnabled: true,
    badge: `${collection.title} Explorer`,
    accessibility: ["Live map", "Walking context", "Resident progress"],
    stories: [{ title: `Why ${collection.title} exists`, body: collection.description }],
    relatedCollectionIds: [],
    aiHints: ["Start with the closest unvisited stop.", "Continue with a nearby place that fits the time you have."],
    ...collection,
  };
}

export function getRelatedMapCollections(collectionId, limit = 3) {
  const active = getMapCollectionById(collectionId);
  if (!active) return [];
  const explicit = (active.relatedCollectionIds || []).map(getMapCollectionById).filter(Boolean);
  const fallback = mapCollections
    .filter((collection) => collection.id !== active.id && collection.category === active.category)
    .map((collection) => getMapCollectionById(collection.id))
    .filter(Boolean);
  const seen = new Set();
  return [...explicit, ...fallback]
    .filter((collection) => {
      if (!collection || seen.has(collection.id)) return false;
      seen.add(collection.id);
      return true;
    })
    .slice(0, limit);
}

export function getMapCollectionForQuery(query) {
  const text = String(query || "").toLowerCase();
  if (!text) return null;
  const hasRouteIntent = /\b(route|walk|crawl|loop|itinerary|stops|tour)\b/.test(text);
  if (/\b(dog friendly|pet friendly|with my dog)\b/.test(text)) return getMapCollectionById("dog-friendly-downtown");
  if (/\b(public art|art collection|murals|sculptures)\b/.test(text)) return getMapCollectionById("public-art-downtown");
  if (/\b(architecture|buildings walk|historic buildings|skyline)\b/.test(text)) return getMapCollectionById("architecture-downtown");
  if (/\b(live music|concerts|music tonight|shows tonight)\b/.test(text)) return getMapCollectionById("live-music-downtown");
  if (/\b(family weekend|kids downtown|family friendly)\b/.test(text)) return getMapCollectionById("family-weekend");
  if (/\b(wellness|fitness route|recovery|healthy downtown)\b/.test(text)) return getMapCollectionById("wellness-downtown");
  if (/\b(date night|romantic|dinner date)\b/.test(text)) return getMapCollectionById("date-night-downtown");
  if (/\b(luxury living|luxury residences|premium living)\b/.test(text)) return getMapCollectionById("luxury-living-downtown");
  if (/\b(resident essentials|moving downtown|new resident)\b/.test(text)) return getMapCollectionById("resident-essentials");
  if (/\b(coworking|coffee meeting|meeting space|work remotely)\b/.test(text)) return getMapCollectionById("coworking-and-meetings");
  if (/\b(breakfast|brunch)\b/.test(text)) return getMapCollectionById("breakfast-downtown");
  if (/\b(happy hour|cocktails after work|drinks after work)\b/.test(text) && !hasRouteIntent) return getMapCollectionById("happy-hour-downtown");
  if (/\b(coffee collection|coffee downtown|coffee shops)\b/.test(text) && !hasRouteIntent) return getMapCollectionById("coffee-downtown");
  if (/\b(inkind dining market|dining market)\b/.test(text)) return getMapCollectionById("inkind-dining-market");
  if (hasRouteIntent && /\b(inkind|restaurant|dining)\b/.test(text)) return getMapCollectionById("inkind-dining-market");
  if (hasRouteIntent && /\b(happy hour|drinks after work)\b/.test(text)) return getMapCollectionById("warehouse-district-happy-hour");
  if (/\b(waterloo|waterloo greenway|waller creek|moody amphitheater|see austin differently|greenway|waterloo discovery|waterloo walk)\b/.test(text)) return getMapCollectionById("waterloo-greenway");
  if (/\b(daa|downtown austin alliance|art walk|artwork|public art|sculpture|sculptures|wall art|mural|murals|parks tour|art and parks)\b/.test(text)) return getMapCollectionById("daa-art-walk");
  if (hasRouteIntent && /\b(story|stories|civic|downtown)\b/.test(text)) return getMapCollectionById("downtown-stories-walk");
  if (hasRouteIntent && /\b(coffee|before work|morning)\b/.test(text)) return getMapCollectionById("coffee-before-work");
  if (hasRouteIntent && /\b(hotel guest|arrival|van zandt)\b/.test(text)) return getMapCollectionById("hotel-guest-arrival-route");
  if (/\b(route|walk|crawl|loop|itinerary)\b/.test(text)) return getMapCollectionById("downtown-stories-walk");
  return null;
}
