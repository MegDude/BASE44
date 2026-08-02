import { daaTourStops } from "./daaArtParksTour";
import { waterlooParkInventory } from "./waterlooParkInventory";
import type { RouteExperienceDefinition } from "@/types/routeExperience";

const daaArtWalkStopIds = daaTourStops.map((stop) => stop.id);
const daaArtWalkStopHints = daaTourStops.map((stop) => stop.displayName || stop.name);
const waterlooPhysicalStops = waterlooParkInventory.filter((stop) =>
  stop.id !== "waterloo-event-zones" && stop.kind !== "event"
);
const waterlooRouteStopIds = waterlooPhysicalStops.map((stop) => stop.id);
const waterlooRouteStopHints = waterlooPhysicalStops.map((stop) => stop.name);

export const mapCollections: RouteExperienceDefinition[] = [
  {
    id: "daa-art-walk",
    slug: "daa-art-walk",
    title: "Downtown Art & Parks Walk",
    shortTitle: "Art & Parks Walk",
    routeType: "walk",
    summary: "A self-guided walk through downtown art, parks, plazas, and cultural landmarks.",
    description: "A Downtown Austin Alliance public-realm walk for sculptures, murals, public art, parks, plazas, and cultural landmarks.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    estimatedTime: "Self-guided walk",
    distanceLabel: "Downtown-wide",
    neighborhood: "Downtown Austin",
    ctaLabel: "Start art walk",
    stopIds: daaArtWalkStopIds,
    stopHints: daaArtWalkStopHints,
    partnerName: "Downtown Austin Alliance",
    relatedRouteIds: ["downtown-stories-walk", "waterloo-greenway"],
  },
  {
    id: "waterloo-greenway",
    slug: "waterloo-greenway",
    title: "Waterloo Greenway Walk",
    shortTitle: "Waterloo Greenway Walk",
    routeType: "walk",
    format: "Self-guided walk",
    summary: "A 6-stop self-guided walk through Waterloo Park, Waller Creek, gardens, public spaces, and Moody Amphitheater.",
    description: "A self-guided route through Waterloo Park and the Greenway, connecting public spaces, gardens, Waller Creek, and cultural venues.",
    category: "civic",
    routeMode: "walking",
    colorTheme: "emerald",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    neighborhood: "Waterloo",
    estimatedTime: "Self-guided walk",
    distanceLabel: "6 stops",
    partnerName: "Waterloo Greenway",
    attribution: "Presented with Waterloo Greenway",
    heroImageUrl: "/images/map-entities/attached/civic/waterloo-park.jpeg",
    stopIds: waterlooRouteStopIds,
    stopHints: waterlooRouteStopHints,
    beforeYouGo: ["Self-guided", "Check current park and event access before starting"],
    relatedRouteIds: ["daa-art-walk", "downtown-stories-walk"],
  },
  {
    id: "warehouse-district-happy-hour",
    slug: "warehouse-district-happy-hour",
    title: "Warehouse District Happy Hour",
    routeType: "route",
    summary: "Four walkable drinks and dining stops for an after-work plan.",
    description: "A compact drinks-and-dining route for nearby resident plans.",
    category: "nightlife",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    estimatedTime: "18 min walk",
    distanceLabel: "0.8 mi",
    neighborhood: "Warehouse District",
    ctaLabel: "Start route",
    stopIds: ["inkind-j-carvers", "inkind-peche", "inkind-parkside", "partner-comedor"],
    stopHints: ["J Carver", "Péché", "Parkside", "Comedor"],
    relatedRouteIds: ["inkind-dining-market", "coffee-before-work"],
  },
  {
    id: "downtown-stories-walk",
    slug: "downtown-stories-walk",
    title: "Downtown Stories Walk",
    routeType: "walk",
    summary: "A civic walk through public spaces, heritage points, and downtown stories.",
    description: "A welcoming civic walk connecting public spaces, downtown stories, heritage points, cultural destinations, and useful nearby stops.",
    category: "civic",
    routeMode: "editorial",
    colorTheme: "emerald",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    estimatedTime: "25 min walk",
    distanceLabel: "1.1 mi",
    neighborhood: "Downtown Core",
    ctaLabel: "Start walk",
    stopIds: ["civic-republic-square-programming", "civic-daa", "civic-waterloo-greenway", "waterloo-park"],
    stopHints: ["Republic Square", "Downtown Austin Alliance", "Waterloo Greenway", "Waterloo Park"],
    partnerName: "Downtown Austin Alliance",
    relatedRouteIds: ["daa-art-walk", "waterloo-greenway"],
  },
  {
    id: "inkind-dining-market",
    slug: "inkind-dining-market",
    title: "inKind Dining Market",
    routeType: "guide",
    summary: "A dining guide connecting participating restaurants and resident value.",
    description: "A dining value route connecting participating restaurants and nearby resident plans.",
    category: "dining",
    routeMode: "walking",
    colorTheme: "gold",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: false,
    estimatedTime: "20 min walk",
    distanceLabel: "0.9 mi",
    neighborhood: "Warehouse District",
    ctaLabel: "View stops",
    stopIds: ["inkind-j-carvers", "inkind-peche", "inkind-parkside", "inkind-hopdoddy-congress"],
    stopHints: ["J Carver", "Péché", "Parkside", "Burger Bar Congress"],
    partnerName: "inKind",
    relatedRouteIds: ["warehouse-district-happy-hour"],
  },
  {
    id: "coffee-before-work",
    slug: "coffee-before-work",
    title: "Coffee Before Work",
    routeType: "route",
    summary: "A short morning route for coffee, errands, and the workday start.",
    description: "A short morning route for coffee, errands, and downtown workday starts.",
    category: "dining",
    routeMode: "walking",
    colorTheme: "emerald",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    estimatedTime: "14 min walk",
    distanceLabel: "0.6 mi",
    neighborhood: "2nd Street",
    ctaLabel: "Start route",
    stopIds: ["partner-jos-coffee", "venue-merit-coffee", "priority-frost-tower"],
    stopHints: ["Jo's Coffee", "Merit Coffee", "Frost Tower"],
    relatedRouteIds: ["downtown-stories-walk", "warehouse-district-happy-hour"],
  },
  {
    id: "hotel-guest-arrival-route",
    slug: "hotel-guest-arrival-route",
    title: "Hotel Guest Arrival Route",
    routeType: "route",
    summary: "A guest route from Hotel Van Zandt to nearby food, music, and the riverfront.",
    description: "A guest-friendly route from a downtown hotel into nearby food, music, and riverfront plans.",
    category: "hotel",
    routeMode: "walking",
    colorTheme: "navy",
    icon: "route",
    status: "published",
    visibility: "public",
    ordered: true,
    estimatedTime: "16 min walk",
    distanceLabel: "0.7 mi",
    neighborhood: "Rainey",
    ctaLabel: "Start route",
    stopIds: ["partner-hotel-van-zandt", "partner-geraldines", "partner-stay-put", "partner-bangers"],
    stopHints: ["Hotel Van Zandt", "Geraldine's", "The Stay Put", "Banger's"],
    partnerName: "Hotel Van Zandt",
    relatedRouteIds: ["warehouse-district-happy-hour"],
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
