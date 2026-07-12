import {
  BadgePercent,
  BatteryCharging,
  Bike,
  Bookmark,
  Building2,
  CalendarDays,
  CalendarRange,
  Car,
  Clock,
  Coffee,
  CreditCard,
  Dumbbell,
  Gift,
  HeartPulse,
  Hotel,
  Info,
  Landmark,
  MapPin,
  Moon,
  Music,
  Navigation,
  Package,
  Palette,
  Pill,
  Printer,
  Route,
  Shirt,
  ShoppingBag,
  Sandwich,
  CookingPot,
  Sparkles,
  Star,
  Utensils,
  Wine,
  Flame,
} from "lucide-react";
import { resolveSearchIntent } from "../../map/searchIntent/mapIntentRegistry";

const SEARCH_INTENT_COPY = {
  breakfast: {
    fullLabel: "Breakfast nearby",
    description: "Morning cafes, breakfast counters and walkable brunch starts",
  },
  coffee: {
    fullLabel: "Coffee nearby",
    description: "Coffee shops, cafes, active perks and curated coffee routes",
    includesRoutes: true,
    includesPerks: true,
  },
  lunch: {
    fullLabel: "Lunch nearby",
    description: "Fast lunches, food halls, restaurants and midday perks",
    includesPerks: true,
  },
  dinner: {
    fullLabel: "Dinner nearby",
    description: "Dinner restaurants, date-night places and evening dining perks",
    includesPerks: true,
  },
  dining: {
    fullLabel: "Dining nearby",
    description: "Restaurants, food halls, dining perks and curated collections",
    includesCollections: true,
    includesPerks: true,
  },
  drinks: {
    fullLabel: "Drinks nearby",
    description: "Bars, patios, nightlife stops and drink-friendly routes",
    includesRoutes: true,
  },
  happy_hour: {
    fullLabel: "Happy Hour now",
    description: "Active offers, participating venues and happy-hour routes",
    includesRoutes: true,
    includesPerks: true,
  },
  events: {
    fullLabel: "Events nearby",
    description: "Upcoming events, venues, campaigns and event collections",
    includesCampaigns: true,
    includesCollections: true,
  },
  more: {
    fullLabel: "Explore more intents",
    description: "Hotels, properties, nightlife, wellness, shopping and civic places",
  },
  happy_hour_route: {
    fullLabel: "Happy Hour route",
    description: "A curated walking route for active happy-hour stops",
    includesRoutes: true,
  },
  dining_route: {
    fullLabel: "Dining route",
    description: "A curated inKind dining walk with participating restaurants",
    includesRoutes: true,
    includesBrands: true,
  },
  daa_art_walk: {
    fullLabel: "DAA Art Walk",
    description: "Public art, civic stops and a curated downtown walking route",
    includesRoutes: true,
    includesCollections: true,
  },
  waterloo_walk: {
    fullLabel: "Waterloo Walk",
    description: "Greenway stops, civic anchors and walkable public places",
    includesRoutes: true,
    includesCollections: true,
  },
  stories_walk: {
    fullLabel: "Stories Walk",
    description: "Downtown story stops, civic context and a curated route",
    includesRoutes: true,
    includesCollections: true,
  },
  inkind: {
    fullLabel: "inKind offers",
    description: "Participating restaurants, brand offers and dining campaigns",
    includesBrands: true,
    includesCampaigns: true,
  },
  hotels: {
    fullLabel: "Hotels nearby",
    description: "Hotels, guest-ready routes and nearby downtown anchors",
    includesRoutes: true,
  },
  properties: {
    fullLabel: "Properties nearby",
    description: "Residential buildings, listings and nearby district context",
  },
  legends: {
    fullLabel: "Legends listings",
    description: "Legends residential listings, featured properties and nearby places",
    includesBrands: true,
  },
  arts: {
    fullLabel: "Arts nearby",
    description: "Arts venues, culture stops, galleries and civic collections",
    includesCollections: true,
  },
  live_music: {
    fullLabel: "Live Music nearby",
    description: "Music venues, shows, nightlife and evening event context",
  },
  civic: {
    fullLabel: "Civic places nearby",
    description: "Civic anchors, public spaces, districts and cultural collections",
    includesCollections: true,
  },
  fitness: {
    fullLabel: "Fitness nearby",
    description: "Gyms, studios, trails and wellness-friendly places",
  },
  wellness: {
    fullLabel: "Wellness nearby",
    description: "Wellness studios, health services and restorative nearby stops",
  },
  retail: {
    fullLabel: "Shopping nearby",
    description: "Retail, shopping, brand locations and downtown services",
    includesBrands: true,
  },
  coffee_route: {
    fullLabel: "Coffee route",
    description: "A curated before-work coffee walking route",
    includesRoutes: true,
  },
  hotel_route: {
    fullLabel: "Hotel walk",
    description: "A guest arrival walking route through useful downtown stops",
    includesRoutes: true,
  },
  parking: {
    fullLabel: "Parking nearby",
    description: "Nearby garages, parking services and arrival context",
  },
  utilities: {
    fullLabel: "Utilities nearby",
    description: "Useful services, errands and practical downtown support",
  },
  services: {
    fullLabel: "Services nearby",
    description: "Useful services, errands, offices and downtown support",
  },
  perks: {
    fullLabel: "Perks nearby",
    description: "Active offers, redemptions and participating places",
    includesPerks: true,
  },
  near_me: {
    fullLabel: "Nearby now",
    description: "Closest places, perks and useful map results around you",
    includesPerks: true,
  },
  open_now: {
    fullLabel: "Open now",
    description: "Places currently open or useful right now",
  },
  tonight: {
    fullLabel: "Tonight nearby",
    description: "Evening events, dining, nightlife and time-sensitive results",
  },
  walkable: {
    fullLabel: "Walkable nearby",
    description: "Nearby places and routes within a short walk",
    includesRoutes: true,
  },
  trending: {
    fullLabel: "Trending nearby",
    description: "High-signal places, active events and popular downtown stops",
    includesCampaigns: true,
  },
  saved: {
    fullLabel: "Saved places",
    description: "Your saved downtown places and useful return points",
  },
  this_week: {
    fullLabel: "This week",
    description: "Events and campaigns happening across the week",
    includesCampaigns: true,
  },
  printing: {
    fullLabel: "Printing nearby",
    description: "Printing, shipping and workday service stops",
  },
  pharmacy: {
    fullLabel: "Pharmacy nearby",
    description: "Pharmacies, health errands and practical nearby services",
  },
  ev_charging: {
    fullLabel: "EV charging nearby",
    description: "EV chargers, parking and arrival support",
  },
  bike_share: {
    fullLabel: "Bike share nearby",
    description: "Bike share stations and short-trip mobility stops",
  },
  visitor_info: {
    fullLabel: "Visitor info nearby",
    description: "Visitor services, civic anchors and helpful downtown context",
  },
  cleaning: {
    fullLabel: "Cleaners nearby",
    description: "Cleaning services and practical residential errands",
  },
  shipping: {
    fullLabel: "Shipping nearby",
    description: "Shipping, mail, printing and practical workday stops",
  },
} as const;

export const SEARCH_INTENT_RAIL = [
  { id: "breakfast", label: "Breakfast", filter: "Breakfast", prompt: "Breakfast nearby", icon: Clock, defaultVisible: true },
  { id: "coffee", label: "Coffee", filter: "Coffee", prompt: "Coffee nearby", icon: Coffee, defaultVisible: true },
  { id: "lunch", label: "Lunch", filter: "Lunch", prompt: "Lunch nearby", icon: Sandwich, defaultVisible: true },
  { id: "dinner", label: "Dinner", filter: "Dinner", prompt: "Dinner nearby", icon: CookingPot, defaultVisible: true },
  { id: "dining", label: "Dining", filter: "Dining", prompt: "Dining nearby", icon: Sparkles, defaultVisible: true },
  { id: "drinks", label: "Drinks", filter: "Drinks", prompt: "Drinks nearby", icon: Wine, defaultVisible: true },
  { id: "happy_hour", label: "Happy Hour", filter: "Happy Hour", prompt: "Happy Hour nearby", icon: BadgePercent, defaultVisible: true },
  { id: "events", label: "Events", filter: "Events", prompt: "Events nearby", icon: CalendarDays, defaultVisible: true },
  { id: "happy_hour_route", label: "HH Route", filter: "Happy Hour", collection: "warehouse-district-happy-hour", prompt: "Warehouse District happy hour walking route", icon: Route, defaultVisible: true },
  { id: "dining_route", label: "Dining Route", filter: "inKind", collection: "inkind-dining-market", prompt: "inKind dining market walking route", icon: Route, defaultVisible: true },
  { id: "daa_art_walk", label: "DAA Art Walk", filter: "Civic", collection: "daa-art-walk", prompt: "DAA Art Walk walking route", icon: Route, defaultVisible: true },
  { id: "waterloo_walk", label: "Waterloo Walk", filter: "Civic", collection: "waterloo-greenway", prompt: "Waterloo Greenway discovery walk", icon: Route, defaultVisible: true },
  { id: "stories_walk", label: "Stories Walk", filter: "Civic", collection: "downtown-stories-walk", prompt: "Downtown stories walk", icon: Route, defaultVisible: true },
  { id: "inkind", label: "inKind", filter: "inKind", prompt: "inKind offers", icon: CreditCard, defaultVisible: true },
  { id: "hotels", label: "Hotels", filter: "Hotels", prompt: "Hotels nearby", icon: Hotel, defaultVisible: true },
  { id: "properties", label: "Properties", filter: "Properties", prompt: "Properties nearby", icon: Building2, defaultVisible: true },
  { id: "legends", label: "Legends", filter: "Legends", prompt: "Legends listings", icon: Star, defaultVisible: true },
  { id: "coffee_route", label: "Coffee Route", filter: "Coffee", collection: "coffee-before-work", prompt: "Coffee before work walking route", icon: Route, defaultVisible: false },
  { id: "hotel_route", label: "Hotel Walk", filter: "Hotels", collection: "hotel-guest-arrival-route", prompt: "Hotel guest arrival walking route", icon: Route, defaultVisible: false },
  { id: "arts", label: "Arts", filter: "Arts & Culture", prompt: "Arts nearby", icon: Palette, defaultVisible: false },
  { id: "live_music", label: "Live Music", filter: "Live Music", prompt: "Live music tonight", icon: Music, defaultVisible: false },
  { id: "civic", label: "Civic", filter: "Civic", prompt: "Civic nearby", icon: Landmark, defaultVisible: false },
  { id: "fitness", label: "Fitness", filter: "Fitness", prompt: "Fitness nearby", icon: Dumbbell, defaultVisible: true },
  { id: "wellness", label: "Wellness", filter: "Wellness", prompt: "Wellness nearby", icon: HeartPulse, defaultVisible: true },
  { id: "retail", label: "Retail", filter: "Retail", prompt: "Retail nearby", icon: ShoppingBag, defaultVisible: true },
  { id: "parking", label: "Parking", filter: "Parking", prompt: "Parking nearby", icon: Car, defaultVisible: false },
  { id: "utilities", label: "Utilities", filter: "Services", prompt: "Utilities nearby", icon: Sparkles, defaultVisible: false },
  { id: "perks", label: "Perks", filter: "Perks", prompt: "Perks I can use", icon: Gift, defaultVisible: false },
  { id: "near_me", label: "Nearby", filter: "Nearby", prompt: "Nearby", icon: Navigation, defaultVisible: false },
  { id: "open_now", label: "Open Now", filter: "Open Now", prompt: "Open now nearby", icon: Clock, defaultVisible: false },
  { id: "tonight", label: "Tonight", kind: "time", time: "tonight", prompt: "Tonight nearby", icon: Moon, defaultVisible: false },
  { id: "walkable", label: "Walkable", kind: "radius", radius: "5 min walk", prompt: "Walkable nearby", icon: Route, defaultVisible: false },
  { id: "trending", label: "Trending", filter: "Trending", prompt: "Trending nearby", icon: Flame, defaultVisible: true },
  { id: "saved", label: "Saved", filter: "Saved", prompt: "Saved places", icon: Bookmark, defaultVisible: true },
  { id: "this_week", label: "This Week", filter: "This Week", prompt: "Events this week", icon: CalendarRange, defaultVisible: true },
  { id: "printing", label: "Printing", filter: "Printing", prompt: "Printing nearby", icon: Printer, defaultVisible: false },
  { id: "pharmacy", label: "Pharmacy", filter: "Pharmacy", prompt: "Closest pharmacy", icon: Pill, defaultVisible: false },
  { id: "ev_charging", label: "EV Charging", filter: "EV Charging", prompt: "EV charger nearby", icon: BatteryCharging, defaultVisible: false },
  { id: "bike_share", label: "Bike Share", filter: "Bike Share", prompt: "Bike share nearby", icon: Bike, defaultVisible: false },
  { id: "visitor_info", label: "Visitor Info", filter: "Visitor Info", prompt: "Visitor info nearby", icon: Info, defaultVisible: false },
  { id: "cleaning", label: "Cleaners", filter: "Cleaners", prompt: "Cleaners nearby", icon: Shirt, defaultVisible: false },
  { id: "shipping", label: "Shipping", filter: "Shipping", prompt: "Shipping nearby", icon: Package, defaultVisible: false },
  { id: "services", label: "Services", filter: "Services", prompt: "Services nearby", icon: Sparkles, defaultVisible: false },
] as const;

export const SEARCH_INTENT_RAIL_WITH_CANONICAL_INTENTS = SEARCH_INTENT_RAIL.map((item) => ({
  ...item,
  canonicalIntentId: resolveSearchIntent(item.id).id,
  canonicalIntentType: resolveSearchIntent(item.id).intentType,
}));

const PRIMARY_SEARCH_INTENT_IDS = [
  "breakfast",
  "coffee",
  "lunch",
  "dinner",
  "dining",
  "drinks",
  "happy_hour",
  "events",
  "legends",
] as const;

const SECONDARY_SEARCH_INTENT_IDS = [
  "happy_hour_route",
  "dining_route",
  "daa_art_walk",
  "waterloo_walk",
  "stories_walk",
  "inkind",
  "hotels",
  "properties",
  "legends",
  "arts",
  "live_music",
  "civic",
  "fitness",
  "wellness",
  "retail",
  "coffee_route",
  "hotel_route",
  "parking",
  "utilities",
] as const;

export const PRIMARY_SEARCH_INTENT_RAIL = PRIMARY_SEARCH_INTENT_IDS
  .map((id) => SEARCH_INTENT_RAIL.find((item) => item.id === id))
  .filter(Boolean);

export const SECONDARY_SEARCH_INTENT_RAIL = SECONDARY_SEARCH_INTENT_IDS
  .map((id) => SEARCH_INTENT_RAIL.find((item) => item.id === id))
  .filter(Boolean);

type SearchIntentRailItemLike = {
  id?: string;
  label?: string;
  prompt?: string;
  filter?: string;
  collection?: string;
  kind?: string;
  icon?: unknown;
};

type SearchIntentCopy = {
  fullLabel: string;
  description: string;
  includesRoutes?: boolean;
  includesCollections?: boolean;
  includesCampaigns?: boolean;
  includesBrands?: boolean;
  includesPerks?: boolean;
};

export function getSearchIntentDefinition(item: SearchIntentRailItemLike) {
  const copy = SEARCH_INTENT_COPY[item?.id as keyof typeof SEARCH_INTENT_COPY] as SearchIntentCopy | undefined;
  const shortLabel = item?.label || "Intent";
  const fullLabel = copy?.fullLabel || item?.prompt || `${shortLabel} nearby`;
  const description = copy?.description || (
    item?.collection
      ? `Curated ${shortLabel.toLowerCase()} route and related downtown places`
      : `${shortLabel} places, useful map results and related downtown context`
  );

  return {
    id: item?.id || shortLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    shortLabel,
    fullLabel,
    description,
    icon: item?.icon,
    entityTypes: item?.filter ? [item.filter] : [],
    includesRoutes: Boolean(copy?.includesRoutes || item?.collection),
    includesCollections: Boolean(copy?.includesCollections || item?.collection),
    includesCampaigns: Boolean(copy?.includesCampaigns),
    includesBrands: Boolean(copy?.includesBrands || item?.filter === "inKind" || item?.filter === "Legends"),
    includesPerks: Boolean(copy?.includesPerks || item?.filter === "Perks"),
  };
}

export const SEARCH_INTENT_DEFINITIONS = SEARCH_INTENT_RAIL.map(getSearchIntentDefinition);

export const FALLBACK_MAP_PIN_ICON = MapPin;
