import { daaTourStops } from "./daaArtParksTour";
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
  {
    id: "daa-art-walk",
    title: "DAA Art & Parks Tour",
    description: "The actual Downtown Austin Alliance walking route for sculptures, murals, public art, parks, plazas, and cultural landmarks.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    estimatedTime: "Self-guided walk",
    distanceLabel: "Downtown-wide",
    neighborhood: "Downtown Austin",
    ctaLabel: "Start art walk",
    stopIds: daaArtWalkStopIds,
    stopHints: daaArtWalkStopHints,
  },
  {
    id: "waterloo-greenway",
    title: "Waterloo Greenway Discovery Walk",
    description: "A Waterloo Greenway walking route connecting parks, gardens, Waller Creek, Moody Amphitheater, discovery markers, events, and useful nearby perks.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "emerald",
    icon: "route",
    estimatedTime: "Self-guided walk",
    distanceLabel: "Waterloo-wide",
    neighborhood: "Waterloo",
    ctaLabel: "Start Waterloo walk",
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
    stopIds: ["inkind-j-carvers", "inkind-peche", "inkind-parkside", "partner-comedor"],
    stopHints: ["J Carver", "Péché", "Parkside", "Comedor"],
  },
  {
    id: "downtown-stories-walk",
    title: "Downtown Stories Walk",
    description: "A civic route connecting public spaces, downtown stories, and useful stops.",
    category: "civic",
    routeMode: "editorial",
    colorTheme: "emerald",
    icon: "route",
    estimatedTime: "25 min walk",
    distanceLabel: "1.1 mi",
    neighborhood: "Downtown Core",
    ctaLabel: "Start walk",
    stopIds: ["civic-republic-square-programming", "civic-daa", "priority-frost-tower", "civic-waterloo-greenway"],
    stopHints: ["Republic Square", "Downtown Austin Alliance", "Frost Tower", "Waterloo Greenway"],
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
    stopIds: ["partner-hotel-van-zandt", "partner-geraldines", "partner-stay-put", "partner-bangers"],
    stopHints: ["Hotel Van Zandt", "Geraldine's", "The Stay Put", "Banger's"],
  },
];

export function getMapCollectionById(collectionId) {
  const rawKey = String(collectionId || "").trim().toLowerCase();
  const key = rawKey === "daa-art-parks-tour" ? "daa-art-walk" : rawKey;
  return mapCollections.find((collection) => collection.id === key) || null;
}

export function getMapCollectionForQuery(query) {
  const text = String(query || "").toLowerCase();
  if (!text) return null;
  const hasRouteIntent = /\b(route|walk|crawl|loop|itinerary|stops|tour)\b/.test(text);
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
