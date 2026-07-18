export type PlatformIntentGroup = "Eat" | "Drink" | "Stay" | "Explore" | "Shop" | "Move" | "Live" | "Experience";

export type PlatformEntityCategory =
  | "Restaurants"
  | "Coffee"
  | "Bars"
  | "Nightlife"
  | "Hotels"
  | "Residential"
  | "Commercial"
  | "Retail"
  | "Brands"
  | "Attractions"
  | "Arts"
  | "Live Music"
  | "Museums"
  | "Civic"
  | "Parks"
  | "Wellness"
  | "Fitness"
  | "Coworking"
  | "Services"
  | "Parking"
  | "Transportation"
  | "Events"
  | "Routes"
  | "Collections"
  | "Campaigns"
  | "Perks"
  | "Listings"
  | "Deals"
  | "QR Experiences";

export type PlatformIconToken =
  | "sunrise"
  | "coffee"
  | "utensils"
  | "chef-hat"
  | "martini"
  | "calendar-days"
  | "hotel"
  | "building-2"
  | "house-key"
  | "shopping-bag"
  | "badge-check"
  | "palette"
  | "music-2"
  | "landmark"
  | "heart-pulse"
  | "dumbbell"
  | "square-parking"
  | "wrench"
  | "route"
  | "book-open"
  | "scan-line"
  | "wallet-cards"
  | "badge"
  | "ticket-percent"
  | "bookmark"
  | "sparkles"
  | "map-pin"
  | "flame"
  | "star";

export const PLATFORM_INTENT_GROUPS: Record<PlatformIntentGroup, string[]> = {
  Eat: ["Breakfast", "Coffee", "Brunch", "Lunch", "Dinner", "Dessert", "Food Trucks", "Patios"],
  Drink: ["Happy Hour", "Cocktails", "Wine", "Bars", "Breweries", "Rooftops"],
  Stay: ["Hotels", "Guests", "Concierge", "Amenities"],
  Explore: ["Arts", "Civic", "Parks", "Museums", "Public Art", "Architecture", "Stories"],
  Shop: ["Retail", "Brands", "Markets", "Pop-ups"],
  Move: ["Fitness", "Wellness", "Trails", "Bike Share", "Parking", "Transportation"],
  Live: ["Residential", "Listings", "Rentals", "Buildings", "Neighborhood Guides"],
  Experience: ["Events", "Routes", "Collections", "Campaigns", "Perks", "QR Experiences"],
};

export const PLATFORM_ENTITY_CATEGORIES: PlatformEntityCategory[] = [
  "Restaurants",
  "Coffee",
  "Bars",
  "Nightlife",
  "Hotels",
  "Residential",
  "Commercial",
  "Retail",
  "Brands",
  "Attractions",
  "Arts",
  "Live Music",
  "Museums",
  "Civic",
  "Parks",
  "Wellness",
  "Fitness",
  "Coworking",
  "Services",
  "Parking",
  "Transportation",
  "Events",
  "Routes",
  "Collections",
  "Campaigns",
  "Perks",
  "Listings",
  "Deals",
  "QR Experiences",
];

export const PLATFORM_ICON_TOKEN_BY_KEY: Record<string, PlatformIconToken> = {
  breakfast: "sunrise",
  coffee: "coffee",
  lunch: "utensils",
  dinner: "chef-hat",
  dining: "utensils",
  restaurant: "utensils",
  restaurants: "utensils",
  drinks: "martini",
  bar: "martini",
  bars: "martini",
  nightlife: "martini",
  "happy-hour": "martini",
  events: "calendar-days",
  event: "calendar-days",
  hotels: "hotel",
  hotel: "hotel",
  properties: "building-2",
  property: "building-2",
  residential: "building-2",
  building: "building-2",
  listings: "house-key",
  listing: "house-key",
  rentals: "house-key",
  retail: "shopping-bag",
  brands: "badge-check",
  brand: "badge-check",
  arts: "palette",
  culture: "palette",
  "live-music": "music-2",
  civic: "landmark",
  wellness: "heart-pulse",
  fitness: "dumbbell",
  parking: "square-parking",
  utilities: "wrench",
  services: "wrench",
  service: "wrench",
  routes: "route",
  route: "route",
  stories: "book-open",
  qr: "scan-line",
  "qr-experiences": "scan-line",
  perks: "wallet-cards",
  perk: "wallet-cards",
  card: "badge",
  offers: "ticket-percent",
  offer: "ticket-percent",
  saved: "bookmark",
  ai: "sparkles",
  nearby: "map-pin",
  trending: "flame",
  featured: "star",
  legends: "house-key",
  inkind: "wallet-cards",
  dana: "landmark",
};

export const PLATFORM_PIN_STATES = {
  default: { size: 40, description: "Navy pin with a white surface." },
  hover: { size: 40, description: "Navy pin with restrained elevation." },
  selected: { size: 48, description: "Gold ring with stable coordinate anchor." },
  saved: { size: 44, description: "Gold fill or bookmark treatment." },
  featured: { size: 44, description: "Navy pin with a small gold feature mark." },
  sponsored: { size: 44, description: "Navy pin with a restrained gold sparkle." },
  closed: { size: 40, description: "Muted state." },
  archived: { size: 0, description: "Hidden from map and search." },
} as const;

export function normalizeTaxonomyKey(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPlatformIntentGroup(value: unknown): PlatformIntentGroup | "Experience" {
  const key = normalizeTaxonomyKey(value);
  const match = (Object.entries(PLATFORM_INTENT_GROUPS) as [PlatformIntentGroup, string[]][]).find(([, children]) =>
    children.some((child) => normalizeTaxonomyKey(child) === key),
  );
  return match?.[0] || "Experience";
}

export function getPlatformIconToken(value: unknown): PlatformIconToken {
  return PLATFORM_ICON_TOKEN_BY_KEY[normalizeTaxonomyKey(value)] || "map-pin";
}
