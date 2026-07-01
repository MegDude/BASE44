import { categoryImageFallbacks, districtImageFallbacks, perkImageRegistry } from "./perkImageRegistry";
import { resolveDowntownPerksEntityImage } from "../../data/downtownPerksEntityImages";

export type ImageResolveContext = "pin" | "drawerHeader" | "nearbyRail" | "relatedRail" | "card" | "fallback";
const IMAGE_RESOLVER_WARNINGS = import.meta.env.DEV && import.meta.env.VITE_IMAGE_RESOLVER_WARNINGS === "true";

export function assertImageMatchesEntityType(entityType: string, imageAsset: string) {
  const asset = String(imageAsset || "").toLowerCase();
  if (!asset) return;
  const normalizedType = String(entityType || "").toLowerCase();
  const rules: Array<[string, string[]]> = [
    ["property", ["/reports/", "/map/entities/", "/map/listings/", "/map/panels/", "/properties/", "/property-listings", "/buildings/", "/map-pins/property"]],
    ["listing", ["/reports/", "/map/entities/", "/map/listings/", "/map/panels/", "/property-listings", "/legends-listings", "/buildings/", "/map-pins/property"]],
    ["rental", ["/reports/", "/map/entities/", "/map/listings/", "/map/panels/", "/property-listings", "/buildings/", "/map-pins/property"]],
    ["venue", ["/reports/", "/map/entities/", "/map/panels/", "/venues/", "/perks/", "/map-entities/perks/partner_dining", "/map-pins/venue"]],
    ["restaurant", ["/reports/", "/map/entities/", "/map/panels/", "/venues/", "/perks/", "/map-entities/perks/partner_dining"]],
    ["coffee", ["/reports/", "/map/entities/", "/map/panels/", "/venues/", "/perks/", "/map-entities/perks/partner_coffee"]],
    ["hotel", ["/reports/", "/map/entities/", "/map/panels/", "/hotels/", "/map-entities/perks/partner_hotel", "/property-listings-premium/four-seasons"]],
    ["brand", ["/brands/", "/perks/", "/imported/perks/"]],
    ["event", ["/events/", "/map-entities/perks/moody", "/map-entities/perks/rooftop", "/map-entities/perks/downtown_art"]],
    ["wellness", ["/wellness/", "/map-entities/perks/partner_wellness", "/perks/"]],
  ];
  const rule = rules.find(([type]) => type === normalizedType);
  if (IMAGE_RESOLVER_WARNINGS && rule && !rule[1].some((prefix) => asset.includes(prefix))) {
    console.warn(`${rule[0][0].toUpperCase()}${rule[0].slice(1)} image mismatch`, imageAsset);
  }
}

const FINAL_NEUTRAL_FALLBACK = "/images/imported/perks/places-nearby.png";
const PROPERTY_PLACEHOLDER_REPLACEMENT = "/images/imported/perks/prospective-residents-walking-through-the-neighborhood.png";
const PREMIUM_PROPERTY_IMAGE_BASE = "/images/property-listings-premium";
const REPORT_IMAGE_BASE = "/images/reports";
const LOCAL_IMAGE_PRIORITY = {
  residential: [
    "/images/reports/the-independent-austin-tower.jpg",
    "/images/map-entities/perks/austonian_lobby_1779052725341.png",
    "/images/map-entities/perks/waustin_pool_1779052756806.png",
    "/images/map-entities/perks/seaholm_coworking_1779052742037.png",
  ],
  commercial: [
    "/images/map-entities/perks/commercial_lobby_arrival_1779052774111.png",
    "/images/map-entities/perks/commercial_street_level_1779052788888.png",
  ],
  dining: ["/images/map-entities/perks/partner_dining_patio_1779052819620.png"],
  coffee: ["/images/map-entities/perks/partner_coffee_shop_1779052868356.png"],
  hotel: ["/images/map-entities/perks/partner_hotel_rooftop_1779052803267.png"],
  wellness: ["/images/map-entities/perks/partner_wellness_1779052883675.png"],
  event: [
    "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
    "/images/map-entities/perks/rooftop_yoga_1779052654323.png",
    "/images/map-entities/perks/downtown_art_walk_1779052670656.png",
  ],
  civic: [
    "/images/map-entities/perks/civic_lake_trail_1779052853070.png",
    "/images/map-entities/perks/civic_republic_square_1779052838327.png",
  ],
};
const BLOCKED_PLACEHOLDER_IMAGES = new Set([
  "/images/properties/bowie-attached.jpg",
  "/images/imported/perks/bowie-attached.jpg",
  "/images/splash/walkable-map.png",
  "/images/independent_residential_1779052707992.png",
  "/images/map-entities/perks/independent_residential_1779052707992.png",
  "/images/imported/perks/83dcefb7.jpg",
  "/images/imported/perks/83dcefb7-1.jpg",
  "/images/imported/perks/83dcefb7-2.jpg",
  "/images/imported/perks/83dcefb7-3.jpg",
  "/images/imported/perks/83dcefb7-4.jpg",
  "/images/imported/perks/83dcefb7-5.jpg",
  "/images/legends-listings/83dcefb7.jpeg",
  "/images/legends-listings/83dcefb7 (1).jpeg",
  "/images/legends-listings/83dcefb7 (2).jpeg",
  "/images/legends-listings/83dcefb7 (3).jpeg",
  "/images/legends-listings/83dcefb7 (4).jpeg",
  "/images/legends-listings/83dcefb7 (5).jpeg",
]);

const PREMIUM_PROPERTY_IMAGE_SETS: Record<string, string[]> = {
  "44-east": [
    `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east2.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east.jpg`,
  ],
  "70-rainey": [
    `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey2.jpeg`,
  ],
  "700-river": [
    `${PREMIUM_PROPERTY_IMAGE_BASE}/700-river.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/700-river1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/700-river2.jpeg`,
  ],
  "austin-proper-residences": [
    `${REPORT_IMAGE_BASE}/austin-proper-202-nueces.jpg`,
    `${REPORT_IMAGE_BASE}/austin-proper-bar.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences2.jpeg`,
  ],
  "fifth-and-west": [
    `${REPORT_IMAGE_BASE}/fifth-and-west-building.jpeg`,
    `${REPORT_IMAGE_BASE}/fifth-and-west-entrance.jpeg`,
    `${REPORT_IMAGE_BASE}/fifth-and-west-pool.avif`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west2.jpeg`,
  ],
  "four-seasons-residences": [
    `${REPORT_IMAGE_BASE}/four-seasons-austin.jpg`,
    `${REPORT_IMAGE_BASE}/four-seasons-grounds.avif`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/four-seasons-residences.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/four-seasons-residences1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/four-seasons-residences2.jpeg`,
  ],
  "alexan-waterloo": [
    `${REPORT_IMAGE_BASE}/alexan-waterloo-building.jpg`,
    `${REPORT_IMAGE_BASE}/alexan-waterloo-pool.jpg`,
  ],
  milago: [
    `${REPORT_IMAGE_BASE}/milago-building.jpeg`,
    `${REPORT_IMAGE_BASE}/milago-pool.jpeg`,
    "/images/map-pins/property/milago.webp",
    "/buildings/milago.webp",
  ],
  natiivo: [
    `${REPORT_IMAGE_BASE}/natiivo-building.jpg`,
    `${REPORT_IMAGE_BASE}/natiivo-pool.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/natiivo.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/natiivo1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/natiivo2.jpeg`,
  ],
  paseo: [
    `${REPORT_IMAGE_BASE}/paseo-building.webp`,
    `${REPORT_IMAGE_BASE}/paseo-deck.jpeg`,
    `${REPORT_IMAGE_BASE}/paseo-pool.webp`,
    `${REPORT_IMAGE_BASE}/paseo-gym.webp`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/paseo.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/paseo1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/paseo2.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/paseo3.jpeg`,
  ],
  "seaholm-residences": [
    `${REPORT_IMAGE_BASE}/seaholm-residences-building.jpg`,
    `${REPORT_IMAGE_BASE}/seaholm-residences-pool.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences-austin-tx-primary-photo.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences-deck.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/seaholm-residences-pool.webp`,
  ],
  "the-shore": [
    `${REPORT_IMAGE_BASE}/the-shore-austin.jpeg`,
    `${REPORT_IMAGE_BASE}/the-shore-pool.jpg`,
    `${REPORT_IMAGE_BASE}/the-shore-entrance.webp`,
    `${REPORT_IMAGE_BASE}/the-shore-condos.jpg`,
    "/images/map/panels/the-shore-austin.jpg",
    "/images/imported/perks/the-shore.jpg",
    "/images/properties/the-shore/hero.jpg",
  ],
  "spring-condominiums": [
    "/images/map-listing-actual/spring-condominiums/spring-condos-tower.jpeg",
    "/images/map-listing-actual/spring-condominiums/spring-condos-entry.jpeg",
  ],
  "sixth-and-guadalupe": [
    `${REPORT_IMAGE_BASE}/sixth-guadalupe-building.jpg`,
    `${REPORT_IMAGE_BASE}/sixth-guadalupe-deck.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/sixth-and-guadalupe.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/sixth-and-guadalupe1.jpeg`,
  ],
  "the-austonian": [
    `${REPORT_IMAGE_BASE}/austonian-building.jpg`,
    `${REPORT_IMAGE_BASE}/austonian-terrace.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-austonian.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-austonian1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-austonian2.jpeg`,
  ],
  "the-independent": [
    `${REPORT_IMAGE_BASE}/the-independent-301-west.jpg`,
    `${REPORT_IMAGE_BASE}/the-independent-301-west-alt.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-independent.jpeg`,
    "/images/map/panels/the-independent-austin-tower.jpg",
    "/images/reports/the-independent-austin-tower.jpg",
  ],
  "the-modern": [
    `${REPORT_IMAGE_BASE}/the-modern-building.jpeg`,
    `${REPORT_IMAGE_BASE}/the-modern-pool.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-modern.png`,
  ],
  "the-quincy": [
    `${REPORT_IMAGE_BASE}/the-quincy-building.webp`,
    `${REPORT_IMAGE_BASE}/the-quincy-pool-deck.jpg`,
    "/images/map-pins/property/the-quincy.jpg",
    "/images/map-pins/property/the-quincy-1.jpg",
  ],
  "the-travis": [
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-travis.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-travis1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/the-travis2.jpeg`,
  ],
  vesper: [
    `${REPORT_IMAGE_BASE}/vesper-building.jpg`,
    `${REPORT_IMAGE_BASE}/vesper-pool.png`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/vesper.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/vesper1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/vesper2.jpeg`,
  ],
  "w-residences": [
    `${PREMIUM_PROPERTY_IMAGE_BASE}/w-residences.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/w-residences1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/w-residences2.jpeg`,
  ],
  waterline: [
    `${REPORT_IMAGE_BASE}/waterline-building.jpg`,
    `${REPORT_IMAGE_BASE}/waterline-looking-west.jpg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/waterline.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/waterline-1.jpeg`,
    `${PREMIUM_PROPERTY_IMAGE_BASE}/waterline2.jpeg`,
    "/images/map/panels/waterline-austin.jpg",
    "/images/reports/waterline-austin.jpg",
  ],
};

const actualVenueImageSets: Record<string, { hero: string; card: string; thumb: string; gallery: string[] }> = {
  "burger-bar": {
    hero: "/images/map-listing-actual/burger-bar/burger-bar-congress-arrival.jpeg",
    card: "/images/map-listing-actual/burger-bar/burger-bar-congress-arrival.jpeg",
    thumb: "/images/map-listing-actual/burger-bar/burger-bar-congress-arrival.jpeg",
    gallery: [],
  },
  "24-diner": {
    hero: "/images/map-listing-actual/24-diner/24-diner_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/24-diner/24-diner_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/24-diner/24-diner_map_thumb_512x512.png",
    gallery: [],
  },
  aris: {
    hero: "/images/map-listing-actual/aris/aris_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/aris/aris_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/aris/aris_map_thumb_512x512.png",
    gallery: [],
  },
  "atx-cocina": {
    hero: "/images/map-listing-actual/atx-cocina/atx-cocina_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/atx-cocina/atx-cocina_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/atx-cocina/atx-cocina_map_thumb_512x512.png",
    gallery: [],
  },
  "las-perlas": {
    hero: "/images/map-listing-actual/las-perlas/las-perlas_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/las-perlas/las-perlas_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/las-perlas/las-perlas_map_thumb_512x512.png",
    gallery: [],
  },
  pelons: {
    hero: "/images/map-listing-actual/pelons/pelons_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/pelons/pelons_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/pelons/pelons_map_thumb_512x512.png",
    gallery: [],
  },
  "scholz-garten": {
    hero: "/images/map-listing-actual/scholz-garten/scholz-garten_hero_clean_1600x900.png",
    card: "/images/map-listing-actual/scholz-garten/scholz-garten_listing_card_1600x900.png",
    thumb: "/images/map-listing-actual/scholz-garten/scholz-garten_map_thumb_512x512.png",
    gallery: [],
  },
};

const actualVenueImageRules = [
  { key: "burger-bar", terms: ["burger bar", "burger-bar"] },
  { key: "24-diner", terms: ["24 diner", "24diner"] },
  { key: "aris", terms: ["aris"] },
  { key: "atx-cocina", terms: ["atx cocina"] },
  { key: "las-perlas", terms: ["las perlas"] },
  { key: "pelons", terms: ["pelons", "pelon", "pelon’s", "pelon's"] },
  { key: "scholz-garten", terms: ["scholz garten", "scholz"] },
];

const premiumPropertyImageRules = [
  { key: "44-east", terms: ["44 east", "44 east ave"] },
  { key: "70-rainey", terms: ["70 rainey", "70 rainey st", "rainey 70"] },
  { key: "700-river", terms: ["700 river", "700 river street"] },
  { key: "austin-proper-residences", terms: ["austin proper residences", "austin proper", "proper residences", "202 nueces"] },
  { key: "fifth-and-west", terms: ["fifth and west", "fifth & west", "5th and west", "501 west ave"] },
  { key: "four-seasons-residences", terms: ["four seasons residences", "four seasons residential", "four seasons"] },
  { key: "alexan-waterloo", terms: ["alexan waterloo"] },
  { key: "milago", terms: ["milago", "54 rainey"] },
  { key: "natiivo", terms: ["natiivo"] },
  { key: "paseo", terms: ["paseo", "the paseo", "modern austin residences", "80 rainey", "90 rainey"] },
  { key: "seaholm-residences", terms: ["seaholm residences", "seaholm", "222 west ave"] },
  { key: "the-shore", terms: ["the shore", "shore austin", "603 davis"] },
  { key: "spring-condominiums", terms: ["spring condominiums", "spring condos", "spring austin", "300 bowie"] },
  { key: "sixth-and-guadalupe", terms: ["sixth and guadalupe", "sixth & guadalupe", "6th and guadalupe", "6th & guadalupe", "400 w 6th"] },
  { key: "the-austonian", terms: ["the austonian", "austonian", "200 congress"] },
  { key: "the-independent", terms: ["the independent", "independent", "jenga tower", "301 west ave"] },
  { key: "the-modern", terms: ["the modern", "modern austin"] },
  { key: "the-quincy", terms: ["the quincy", "quincy", "300 w 6th"] },
  { key: "the-travis", terms: ["the travis", "travis"] },
  { key: "vesper", terms: ["vesper", "vesper atx", "84 east avenue"] },
  { key: "w-residences", terms: ["w residences", "w austin residences", "w hotel residences"] },
  { key: "waterline", terms: ["waterline", "98 red river"] },
];

function resolvePremiumPropertyImageSet(entity: Record<string, unknown>): string[] {
  const text = entityText(entity);
  const match = premiumPropertyImageRules.find((rule) => rule.terms.some((term) => includesTerm(text, term)));
  return match ? PREMIUM_PROPERTY_IMAGE_SETS[match.key] || [] : [];
}

export const BUILDING_IMAGE_FALLBACK: Record<string, string> = {
  austonian: "/buildings/austonian.webp",
  independent: "/images/imported/perks/301-west-ave.jpg",
  seaholm: "/buildings/seaholm.webp",
  "360": "/buildings/360.webp",
  shore: "/images/properties/the-shore/hero.jpg",
  quincy: `${REPORT_IMAGE_BASE}/the-quincy-building.webp`,
  rainey70: "/images/imported/perks/70-rainey.webp",
  east44: "/images/map-pins/property/44-east.jpg",
  natiivo: `${REPORT_IMAGE_BASE}/natiivo-building.jpg`,
  waterline: `${REPORT_IMAGE_BASE}/waterline-building.jpg`,
  block185: "/buildings/block-185.webp",
  catherine: "/buildings/catherine.webp",
  waller3: "/images/map-pins/property/3-waller.webp",
  rio404: "/images/map-pins/property/404-rio-grande.jpeg",
  river700: "/images/map-pins/property/700-river.jpg",
  fivefiftyfive: "/buildings/five-fifty-five.webp",
  monarch: "/buildings/monarch.webp",
  spring: "/images/map-listing-actual/spring-condominiums/spring-condos-tower.jpeg",
  milago: `${REPORT_IMAGE_BASE}/milago-building.jpeg`,
  bowie: "/buildings/bowie.webp",
  "hanover-republic-square": "/buildings/hanover-republic-square.jpg",
  "fifth-and-west": `${REPORT_IMAGE_BASE}/fifth-and-west-building.jpeg`,
  "austin-proper-residences": `${REPORT_IMAGE_BASE}/austin-proper-202-nueces.jpg`,
  "brazos-place": "/images/reports/200-congress-austin.jpg",
  "311-west-5th": `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west.jpeg`,
  "505-west-7th": "/images/map-pins/property/404-rio-grande.jpeg",
  "506-west-7th": "/images/map-pins/property/404-rio-grande.jpeg",
  "800-west-5th": "/images/reports/360-nueces-austin.jpg",
  "1212-guadalupe": `${REPORT_IMAGE_BASE}/sixth-guadalupe-building.jpg`,
  "gables-republic-square": "/images/imported/perks/gables-republic-square.jpg",
  "modern-austin-residences": `${REPORT_IMAGE_BASE}/paseo-building.webp`,
  "residential-west-avenue-300": "/images/imported/perks/residential-property-west-avenue-300.webp",
  "millenium-rainey": "/images/imported/perks/millenium-rainey.jpg",
  "towers-of-town-lake": "/images/map-pins/property/towers-of-town-lake.jpeg",
  "vesper-atx": "/images/map-pins/property/vesper-atx.jpg",
  "windsor-on-the-lake": "/images/map-pins/property/windsor-on-the-lake.avif",
};

const curatedBuildingImageOverrides: Record<string, string> = {
  austonian: `${REPORT_IMAGE_BASE}/austonian-building.jpg`,
  independent: `${REPORT_IMAGE_BASE}/the-independent-301-west.jpg`,
  seaholm: `${REPORT_IMAGE_BASE}/seaholm-residences-building.jpg`,
  "360": "/buildings/360.webp",
  shore: `${REPORT_IMAGE_BASE}/the-shore-austin.jpeg`,
  quincy: `${REPORT_IMAGE_BASE}/the-quincy-building.webp`,
  rainey70: `${PREMIUM_PROPERTY_IMAGE_BASE}/70-rainey.jpeg`,
  east44: `${PREMIUM_PROPERTY_IMAGE_BASE}/44-east.jpeg`,
  natiivo: `${REPORT_IMAGE_BASE}/natiivo-building.jpg`,
  waterline: `${REPORT_IMAGE_BASE}/waterline-building.jpg`,
  block185: "/buildings/block-185.webp",
  river700: `${PREMIUM_PROPERTY_IMAGE_BASE}/700-river.jpeg`,
  waller3: "/images/map-pins/property/3-waller.webp",
  rio404: "/images/map-pins/property/404-rio-grande.jpeg",
  monarch: "/buildings/monarch.webp",
  milago: `${REPORT_IMAGE_BASE}/milago-building.jpeg`,
  bowie: "/buildings/bowie.webp",
  "hanover-republic-square": "/buildings/hanover-republic-square.jpg",
  "fifth-and-west": `${REPORT_IMAGE_BASE}/fifth-and-west-building.jpeg`,
  "austin-proper-residences": `${REPORT_IMAGE_BASE}/austin-proper-202-nueces.jpg`,
  "brazos-place": "/images/reports/200-congress-austin.jpg",
  "311-west-5th": `${PREMIUM_PROPERTY_IMAGE_BASE}/fifth-and-west.jpeg`,
  "505-west-7th": "/images/map-pins/property/404-rio-grande.jpeg",
  "506-west-7th": "/images/map-pins/property/404-rio-grande.jpeg",
  "800-west-5th": "/images/reports/360-nueces-austin.jpg",
  "1212-guadalupe": `${REPORT_IMAGE_BASE}/sixth-guadalupe-building.jpg`,
  "gables-republic-square": "/images/imported/perks/gables-republic-square.jpg",
  "modern-austin-residences": `${REPORT_IMAGE_BASE}/paseo-building.webp`,
  "residential-west-avenue-300": "/images/imported/perks/residential-property-west-avenue-300.webp",
  "millenium-rainey": "/images/imported/perks/millenium-rainey.jpg",
  "towers-of-town-lake": "/images/map-pins/property/towers-of-town-lake.jpeg",
  "vesper-atx": `${REPORT_IMAGE_BASE}/vesper-building.jpg`,
  "windsor-on-the-lake": "/images/map-pins/property/windsor-on-the-lake.avif",
};

export const HOTEL_IMAGE_FALLBACK: Record<string, string> = {
  hotelVanZandt: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
  austinProper: "/hotels/austin-proper.webp",
  fourSeasons: "/images/imported/perks/four-seasons-resi.jpg",
  hyattCentric: "/hotels/hyatt-centric.webp",
  stephenFAustin: "/hotels/stephen-f-austin.webp",
  fairmontAustin: "/images/map-pins/property/fairmont-austin.jpg",
  jwMarriott: "/hotels/jw-marriott.webp",
  thompsonAustin: "/hotels/thompson-austin.webp",
  cambriaAustin: "/images/map-pins/property/cambria-hotel-austin-downtown.jpg",
  westinAustinDowntown: "/hotels/westin-austin-downtown.webp",
  fairfieldInnSuitesAustinDowntown: "/images/map-pins/property/fairfield-inn-and-suites-austin-downtown.jpg",
  holidayInnTownLake: "/images/map-pins/property/holiday-inn-austin-town-lake.webp",
};

const curatedHotelImageOverrides: Record<string, string> = {
  hotelVanZandt: "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
  austinProper: `${PREMIUM_PROPERTY_IMAGE_BASE}/austin-proper-residences.jpeg`,
  fourSeasons: `${PREMIUM_PROPERTY_IMAGE_BASE}/four-seasons-residences.jpeg`,
  fairmontAustin: "/images/map-pins/property/fairmont-austin.jpg",
  hyattCentric: "/hotels/hyatt-centric.webp",
  jwMarriott: "/hotels/jw-marriott.webp",
  cambriaAustin: "/images/map-pins/property/cambria-hotel-austin-downtown.jpg",
  westinAustinDowntown: "/hotels/westin-austin-downtown.webp",
  fairfieldInnSuitesAustinDowntown: "/images/map-pins/property/fairfield-inn-and-suites-austin-downtown.jpg",
  holidayInnTownLake: "/images/map-pins/property/holiday-inn-austin-town-lake.webp",
};

const buildingImageRules = [
  { key: "austonian", terms: ["the austonian", "austonian", "200 congress"] },
  { key: "independent", terms: ["the independent", "independent", "jenga tower", "301 west ave"] },
  { key: "seaholm", terms: ["seaholm residences", "seaholm", "222 west ave"] },
  { key: "360", terms: ["360 condominiums", "360 condos", "360 condo", "360 nueces"] },
  { key: "shore", terms: ["the shore", "shore austin", "shore condos"] },
  { key: "quincy", terms: ["the quincy", "quincy"] },
  { key: "rainey70", terms: ["70 rainey", "70 rainey st", "rainey 70"] },
  { key: "east44", terms: ["44 east", "44 east ave"] },
  { key: "natiivo", terms: ["natiivo"] },
  { key: "waterline", terms: ["waterline", "98 red river"] },
  { key: "block185", terms: ["block 185", "google tower", "601 w 2nd"] },
  { key: "catherine", terms: ["the catherine", "catherine"] },
  { key: "waller3", terms: ["3 waller", "three waller"] },
  { key: "rio404", terms: ["404 rio grande", "404 rio"] },
  { key: "river700", terms: ["700 river", "700 river street"] },
  { key: "fivefiftyfive", terms: ["five fifty five", "555", "five-fifty-five"] },
  { key: "monarch", terms: ["the monarch", "monarch"] },
  { key: "spring", terms: ["spring condominiums", "spring condos", "spring austin"] },
  { key: "milago", terms: ["milago"] },
  { key: "bowie", terms: ["the bowie", "bowie"] },
  { key: "hanover-republic-square", terms: ["hanover republic square", "303 w 5th", "305, west 5th", "west 5th street"] },
  { key: "fifth-and-west", terms: ["fifth and west", "fifth & west", "501 west ave"] },
  { key: "austin-proper-residences", terms: ["austin proper residences", "austin proper", "202 nueces"] },
  { key: "brazos-place", terms: ["brazos place", "800 brazos"] },
  { key: "311-west-5th", terms: ["311 w 5th", "311 west 5th"] },
  { key: "505-west-7th", terms: ["505 w 7th", "505 west 7th"] },
  { key: "506-west-7th", terms: ["506 w 7th", "506 west 7th"] },
  { key: "800-west-5th", terms: ["800 w 5th", "800 west 5th"] },
  { key: "1212-guadalupe", terms: ["1212 guadalupe"] },
  { key: "gables-republic-square", terms: ["gables republic square", "401 guadalupe"] },
  { key: "modern-austin-residences", terms: ["modern austin residences", "paseo", "80 rainey", "90 rainey"] },
  { key: "residential-west-avenue-300", terms: ["residential property west avenue 300", "300 west avenue"] },
  { key: "millenium-rainey", terms: ["millenium rainey", "millennium rainey", "91 rainey"] },
  { key: "towers-of-town-lake", terms: ["towers of town lake", "40 north interstate 35"] },
  { key: "vesper-atx", terms: ["vesper atx", "84 east avenue"] },
  { key: "windsor-on-the-lake", terms: ["windsor on the lake", "43 rainey"] },
];

const hotelImageRules = [
  { key: "hotelVanZandt", terms: ["hotel van zandt", "van zandt"] },
  { key: "austinProper", terms: ["austin proper", "proper hotel"] },
  { key: "fourSeasons", terms: ["four seasons", "four seasons hotel"] },
  { key: "hyattCentric", terms: ["hyatt centric", "hyatt centric congress"] },
  { key: "stephenFAustin", terms: ["stephen f austin", "stephen f. austin", "intercontinental stephen"] },
  { key: "fairmontAustin", terms: ["fairmont austin", "fairmont"] },
  { key: "jwMarriott", terms: ["jw marriott", "jw marriott austin"] },
  { key: "thompsonAustin", terms: ["thompson austin", "thompson hotel"] },
  { key: "cambriaAustin", terms: ["cambria austin", "cambria hotel"] },
  { key: "westinAustinDowntown", terms: ["westin austin downtown", "westin downtown"] },
  { key: "fairfieldInnSuitesAustinDowntown", terms: ["fairfield inn", "fairfield inn & suites austin downtown"] },
  { key: "holidayInnTownLake", terms: ["holiday inn austin town lake", "holiday inn town lake"] },
];

const entityImageSets: Record<string, string[]> = {
  "parkside": [
    "/images/map-entities/dining/outdoor-dining-arrival.avif",
    "/images/map-entities/dining/dinner-table.avif",
  ],
  "peche": [
    "/images/map-entities/dining/inside-foxtail-bar.jpeg",
    "/images/map-entities/dining/cocktails-3.avif",
  ],
  "j-carvers": [
    "/images/map-entities/dining/private-dinner.avif",
    "/images/map-entities/dining/gourmet-food.avif",
  ],
  comedor: [
    "/images/map-entities/dining/gourmet-food.avif",
    "/images/map-entities/dining/private-dinner.avif",
  ],
  foxtail: [
    "/images/map-entities/dining/inside-foxtail-bar.jpeg",
  ],
  "republic-square-bar": [
    "/images/map-entities/dining/republic-square-bar.jpg",
  ],
  "salvation-pizza": [
    "/images/map-entities/dining/salvation-pizza-rainey.jpg",
  ],
  "driskill-bar": [
    "/images/map-entities/dining/driskill-hotel-bar.jpg",
  ],
  "violet-crown": [
    "/images/map-entities/dining/violet-crown-wine-coffee.jpg",
  ],
  "bangers": [
    "/images/restaurants/bangers-bar.webp",
  ],
  "via-313": [
    "/images/imported/perks/via313.jpg",
    "/images/imported/perks/via313-january-2019-114.jpg",
    "/images/imported/perks/friends-at-pizza-night-at-via-313.png",
  ],
  "emmer-rye": [
    "/images/restaurants/emmer-rye-interior.jpg",
    "/images/restaurants/emmer-rye-dish.webp",
    "/images/imported/perks/restaurantfrancois-int-ext-richardcasteel-atx-38-rr9smo.avif",
  ],
  geraldines: [
    "/images/imported/perks/geraldine-s.jpg",
    "/images/imported/perks/hotel-van-zandt-first-thiursdays.png",
  ],
  "joes-coffee": [
    "/images/imported/perks/joe-s-coffee.png",
    "/images/imported/perks/joes-coffee-1.png",
    "/images/imported/perks/joes.png",
  ],
  daydreamer: [
    "/images/imported/perks/daydreamer-coffee-at-paseo-tower.jpg",
    "/images/imported/perks/daydreamer-paseo-9qzwfotyqhhddwxerfwvtfwvu-hrr7vr0obl9-41abxqezzfexmrnzxrpbnqdfnqjw9ol.jpg",
  ],
  desnudo: [
    "/images/imported/perks/desnudo-coffee-nicolaimccrary-3-zsd7wp.avif",
    "/images/imported/perks/desnudo-coffee-trailer.png",
    "/images/imported/perks/desnudo-coffee-hands.png",
  ],
  "royal-blue": [
    "/images/imported/perks/royal-blue-grocery.png",
    "/images/imported/perks/royal-blue.png",
    "/images/imported/perks/rotal-blue-inside.png",
  ],
  "hotel-van-zandt": [
    "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
    "/images/imported/perks/hotel-van-zandt-entrance.jpg",
    "/images/imported/perks/hotel-van-zandt-image-2578566-810.jpg",
    "/images/imported/perks/hotel-van-zandt-pool.jpg",
    "/images/imported/perks/rooftop-pools-austin-hotel-van-zandt-hero.jpg",
  ],
  waterloo: [
    "/images/imported/perks/03-waterloo-park.jpg",
    "/images/imported/perks/waterlook-trail.png",
    "/images/imported/perks/04-waterlook-trail.jpg",
    "/images/imported/perks/waterlook-greenway.png",
  ],
  "republic-square": [
    "/images/imported/perks/republic-square.jpg",
    "/images/imported/perks/republic-square-bar.jpg",
    "/images/imported/perks/republic-square-outside.jpg",
    "/images/imported/perks/republic-square-facade.jpg",
  ],
  "happy-hour-photo": [
    "/images/imported/perks/rooftop-happy-hour.png",
    "/images/imported/perks/15-sunset-happy-hour.png",
    "/images/imported/perks/happy-hour-2.png",
  ],
  "nightlife-photo": [
    "/images/imported/perks/cocktails.avif",
    "/images/imported/perks/rooftop-cocktails.png",
    "/images/imported/perks/the-elephant-room.jpg",
  ],
  "live-music-photo": [
    "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
    "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
  ],
  "event-photo": [
    "/images/imported/perks/hotel-van-zandt-first-thiursdays.png",
    "/images/imported/perks/people-at-event.png",
    "/images/imported/perks/member-appreciation-maw26-header-1-1680x962.jpg",
    "/images/imported/perks/rebuplic-square-event.jpg",
    "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
  ],
  "civic-photo": [
    "/images/imported/perks/art-gallery-johnston-exhibition-768x512.jpg",
    "/images/imported/perks/visitors-at-second-saturdays-at-the-blanton-3-3-1024x683.jpg",
    "/images/imported/perks/blanton-grounds-photo-by-casey-dunn.jpg",
    "/images/imported/perks/republic-square.jpg",
    "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
    "/images/imported/perks/downtonw-trail.jpg",
  ],
  "wellness-photo": [
    "/images/imported/perks/republic-square-yoga.jpg",
    "/images/imported/perks/yoga-event.png",
    "/images/imported/perks/running-on-trail.png",
  ],
  "perk-redemption-photo": [
    "/images/imported/perks/scanning-downtown-perks-in-a-cafe.png",
    "/images/imported/perks/scan-at-pos.png",
    "/images/imported/perks/redeem-perk.png",
  ],
  rivian: [
    "/images/imported/perks/rivian.png",
    "/images/imported/perks/rivian-campaign.png",
    "/images/imported/perks/02-rivian.png",
  ],
  yeti: [
    "/images/imported/perks/yeti-store.png",
    "/images/imported/perks/yeti-bar-inside.webp",
    "/images/imported/perks/yeti-event.jpeg",
    "/images/imported/perks/yeti.png",
  ],
  "topo-chico": [
    "/images/map-entities/brand-topo-chico/b1g2sfUyEIlTZ9VEepoCGMqVCLXHb0D-kzHHHFUwYqO_q2dw0vkhg5cFGV7ogZYYcoKjYrSIf3UPg1CFBvs9oenhBSpjg-PcikVcaoO-kcZ3YyPdpTt5PSc6cs24NuetCoYLC1FmPT9Pj0o099AbIU7lTkr_h4fDMlotA0ZA-GaBzWODjOtsGnjWkhciQqIR.jpeg",
    "/images/map-entities/brand-topo-chico/pY2OKGdMlKsBrbk_PXgTqTr8MWqVyOENfCgwhPk8gIDqcRa77Rty1G1ckUw71k40VsjMCCxK5qYCthVrOTlYMcPoBhqlY_QZQhDG4duxU2_wIFIDHmisbVQMOn8nqWk3YLdDCan7L3xZF2qpVdaw-Optii2gViGtyC1_mZLEsJseVXMJC8k2sLhMvN_z0_pN.jpeg",
  ],
  "kendra-scott": [
    "/images/map-entities/brand-kendra-scott/kendra_scott_lifestyle_reference.png",
    "/images/map-entities/brand-kendra-scott/225a8873-e308-477c-9089-022cea139bbe.png",
  ],
  lululemon: [
    "/images/imported/perks/lululemon-yoga-leggings-64529a1e874e4.webp",
    "/images/imported/perks/yoga-fashion-china-1.jpg",
    "/images/map-entities/brand-lululemon/YOga-Fashion-China-1.jpg",
    "/images/map-entities/brand-lululemon/l.jpg",
    "/images/map-entities/brand-lululemon/istockphoto-458869903-612x612.jpg",
  ],
  "heritage-boots": [
    "/images/map-entities/brand-heritage-boots/made-in-texas-opener-Nevena-christi-el-paso.jpg",
    "/images/map-entities/brand-heritage-boots/Boot-wars.jpg",
    "/images/map-entities/brand-heritage-boots/nyI2DFGiqYSfYQQAIbr1ZCQoAW4AEnOoUlUEmtQ8lLBG-RRxJa7PlZ-bzhaqeqDl0sCMJ6IZ1J2xsaoP_BHaeS8z74xNCxxTGPD6XYnvHzVkc0TBqiH-9zagzXtFtSjjS-YzMsymv14CX2KM2NHHXFhsdrXV1yPOtzXE6uZ2urJrzhyhnKYTSJlu8FAW6lZV.jpeg",
  ],
  tecovas: ["/images/map-entities/brand-tecovas/Chilis_Tecovas_Booth_Boots_2.jpg"],
  "fine-eyewear": [
    "/images/imported/perks/fine-eyewear.png",
    "/images/imported/perks/fine-eyewear-campaign.png",
    "/images/imported/perks/fine-eywear-survey.png",
  ],
  "standard-proof": [
    "/images/imported/perks/standard-proof-whiskey-co.webp",
    "/images/imported/perks/restaurantfrancois-martiniflight-richardcasteel-atx-5-h31lmk.avif",
    "/images/imported/perks/restaurantfrancois-int-ext-richardcasteel-atx-26-fnm2bj.avif",
  ],
  "stay-put": [
    "/images/imported/perks/stayput.png",
    "/images/map-entities/rainey-bars/stay-put-pool.jpeg",
    "/images/map-entities/rainey-bars/stay-put-jazz.jpeg",
    "/images/imported/perks/stay-put-sign.jpg",
  ],
  property: [
    ...LOCAL_IMAGE_PRIORITY.residential,
    "/images/imported/perks/waterline-hero.webp",
    "/images/properties/the-shore/hero.jpg",
    "/images/imported/perks/paseo.webp",
    "/images/imported/perks/70-rainey.webp",
    "/images/imported/perks/301-west-ave.jpg",
    "/images/map-pins/property/44-east.jpg",
    "/images/map-entities/properties/INDEPENDANT INFINITY POOL.jpeg",
    "/images/map-entities/properties/BOWIE.jpeg",
    "/images/imported/perks/prospective-residents-walking-through-the-neighborhood.png",
  ],
  hotel: [
    ...LOCAL_IMAGE_PRIORITY.hotel,
    "/images/imported/perks/hotel-van-zandt-2560x1570.webp",
    "/images/imported/perks/four-seasons-resi.jpg",
    "/images/imported/perks/four-seasons-residents-lounge.jpeg",
    "/images/imported/perks/w-austin-serenade-cowhide-window-view-scaled.jpg",
    "/images/imported/perks/the-austin-lobby.jpg",
  ],
  coffee: [
    ...LOCAL_IMAGE_PRIORITY.coffee,
    "/images/imported/perks/desnudo-coffee-nicolaimccrary-3-zsd7wp.avif",
    "/images/imported/perks/daydreamer-coffee-at-paseo-tower.jpg",
    "/images/imported/perks/joe-s-coffee.png",
  ],
  event: [
    ...LOCAL_IMAGE_PRIORITY.event,
    "/images/imported/perks/hotel-van-zandt-first-thiursdays.png",
    "/images/imported/perks/people-at-event.png",
    "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
    "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
  ],
  dining: [
    ...LOCAL_IMAGE_PRIORITY.dining,
    "/images/map-entities/dining/outdoor-dining-arrival.avif",
    "/images/map-entities/dining/dinner-table.avif",
    "/images/map-entities/dining/gourmet-food.avif",
    "/images/imported/perks/restaurantfrancois-int-ext-richardcasteel-atx-38-rr9smo.avif",
    "/images/imported/perks/geraldine-s.jpg",
    "/images/restaurants/bangers-bar.webp",
    "/images/imported/perks/via313.jpg",
  ],
  parking: [
    "/images/imported/perks/waterline-hero.webp",
    "/images/map/panels/the-shore-austin.jpg",
    "/images/districts/rainey-hero.jpg",
    "/images/imported/perks/atx-street.png",
  ],
  wellness: [
    ...LOCAL_IMAGE_PRIORITY.wellness,
    "/images/imported/perks/republic-square-yoga.jpg",
    "/images/imported/perks/yoga-event.png",
    "/images/imported/perks/running-on-trail.png",
  ],
  civic: [
    ...LOCAL_IMAGE_PRIORITY.civic,
    "/images/imported/perks/art-gallery-johnston-exhibition-768x512.jpg",
    "/images/imported/perks/visitors-at-second-saturdays-at-the-blanton-3-3-1024x683.jpg",
    "/images/imported/perks/waterlook-trail.png",
    "/images/imported/perks/republic-square.jpg",
    "/images/imported/perks/downtonw-trail.jpg",
    "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
  ],
  commercial: [
    ...LOCAL_IMAGE_PRIORITY.commercial,
    "/images/imported/perks/republic-lpc-republic-lobby-031121-1200x500-v241.jpg",
    "/images/imported/perks/republic-square-facade.jpg",
    "/images/imported/perks/scanning-downtown-perks-in-a-cafe.png",
  ],
};

const contentImageRules = [
  { key: "parkside", terms: ["parkside"] },
  { key: "peche", terms: ["péché", "peche"] },
  { key: "j-carvers", terms: ["j carver", "j carver's", "j carvers"] },
  { key: "comedor", terms: ["comedor"] },
  { key: "foxtail", terms: ["foxtail"] },
  { key: "republic-square-bar", terms: ["republic square bar"] },
  { key: "salvation-pizza", terms: ["salvation pizza", "salvation"] },
  { key: "driskill-bar", terms: ["driskill bar", "driskill hotel bar"] },
  { key: "violet-crown", terms: ["violet crown"] },
  { key: "bangers", terms: ["banger", "bangers"] },
  { key: "via-313", terms: ["via 313", "via313", "detroit-style pizza"] },
  { key: "emmer-rye", terms: ["emmer", "emmer & rye"] },
  { key: "geraldines", terms: ["geraldine", "geraldine's"] },
  { key: "joes-coffee", terms: ["jo's coffee", "jos coffee", "joe's coffee"] },
  { key: "daydreamer", terms: ["daydreamer", "paseo coffee"] },
  { key: "desnudo", terms: ["desnudo"] },
  { key: "royal-blue", terms: ["royal blue"] },
  { key: "standard-proof", terms: ["standard proof", "whiskey", "distillery"] },
  { key: "hotel-van-zandt", terms: ["hotel van zandt", "van zandt first thursday"] },
  { key: "waterloo", terms: ["waterloo", "waller creek", "moody amphitheater"] },
  { key: "republic-square", terms: ["republic square"] },
  { key: "live-music-photo", terms: ["antone", "nightclub", "live music", "music venue"] },
  { key: "happy-hour-photo", terms: ["happy hour", "cocktail special", "resident cocktail pricing"] },
  { key: "perk-redemption-photo", terms: ["redeem", "redemption", "scan perk", "resident card", "qr"] },
  { key: "nightlife-photo", terms: ["bar", "nightlife", "cocktail", "drinks", "pub", "beer garden"] },
  { key: "rivian", terms: ["rivian"] },
  { key: "yeti", terms: ["yeti"] },
  { key: "kendra-scott", terms: ["kendra scott"] },
  { key: "lululemon", terms: ["lululemon"] },
  { key: "topo-chico", terms: ["topo chico", "topochico"] },
  { key: "heritage-boots", terms: ["heritage boots"] },
  { key: "tecovas", terms: ["tecovas", "teacoves"] },
  { key: "fine-eyewear", terms: ["fine eyewear", "optique", "eyewear", "frame adjustment", "styling offer"] },
  { key: "stay-put", terms: ["stay put", "brewery", "house brew"] },
  { key: "parking", terms: ["parking", "garage", "reservable parking", "resident parking", "ev charging"] },
  { key: "hotel", terms: ["hotel", "hospitality", "guest", "four seasons", "van zandt", "rooftop access", "spa"] },
  { key: "coffee", terms: ["coffee", "cafe", "espresso", "morning", "jo's"] },
  { key: "property", terms: ["bowie", "amli", "the independent", "austonian", "residential", "condo", "apartment", "property", "building", "leasing", "real estate"] },
  { key: "wellness", terms: ["yoga", "fitness", "wellness", "run club", "trail", "workout"] },
  { key: "civic", terms: ["art walk", "public art", "gallery", "blanton", "waterloo", "republic square", "greenway", "lady bird", "civic", "museum"] },
  { key: "event", terms: ["event", "activation", "live music", "music", "night market", "show", "rsvp"] },
  { key: "dining", terms: ["bar", "nightlife", "restaurant", "dining", "coffee", "happy hour", "pizza", "cocktail", "venue", "lobby hour"] },
  { key: "commercial", terms: ["retail", "business", "service", "office", "commercial", "restoration"] },
];

function slug(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function entityText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const legendsListing = raw.legendsListing && typeof raw.legendsListing === "object" ? raw.legendsListing as Record<string, unknown> : {};
  return [
    entity.id,
    entity.name,
    entity.brand,
    entity.category,
    entity.category_key,
    entity.type,
    entity.entityType,
    entity.partnerType,
    entity.address,
    entity.source,
    entity.summary,
    entity.description,
    raw.id,
    raw.name,
    raw.address,
    raw.entityType,
    raw.type,
    raw.category,
    raw.category_key,
    raw.summary,
    raw.description,
    legendsListing.address,
    legendsListing.buildingName,
    legendsListing.neighborhood,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function explicitTypeText(entity: Record<string, unknown>): string {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return [
    entity.type,
    entity.entityType,
    entity.category,
    entity.category_key,
    entity.partnerType,
    raw.type,
    raw.entityType,
    raw.category,
    raw.category_key,
    raw.partnerType,
    raw.source,
    entity.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesTerm(text: string, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalized)}([^a-z0-9]|$)`).test(text);
}

function hasVenueIntent(entity: Record<string, unknown>): boolean {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  return (
    /\b(venue|restaurant|bar|nightlife|coffee|retail|store|shop)\b/.test(explicit) ||
    /\b(antone'?s|nightclub|live music|music venue|bar|cocktail|restaurant|dining|pizza|brewery|beer|coffee|cafe|retail|store)\b/.test(text)
  );
}

function hasResidentialIntent(entity: Record<string, unknown>): boolean {
  const explicit = explicitTypeText(entity);
  const text = entityText(entity);
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  if (hasVenueIntent(entity) && !/\b(residential property|property|listing|mls|luxury[_\s-]*presence|legends)\b/.test(explicit)) return false;
  return (
    /\b(property|residential|listing)\b/.test(String(entity.type || entity.entityType || raw.type || raw.entityType || "").toLowerCase()) ||
    /\b(properties|property|realestate|real[_\s-]*estate)\b/.test(String(entity.partnerType || raw.partnerType || "").toLowerCase()) ||
    /\b(residential property|luxury residential|luxury[_\s-]*presence|legends|mls)\b/.test(explicit) ||
    /\b(for sale|for rent|condominium|condo|apartment)\b/.test(text) ||
    Boolean(raw.luxuryPresenceBuilding || raw.luxuryPresenceListing || raw.legendsListing || entity.legendsListing)
  );
}

function hasListingIntent(entity: Record<string, unknown>): boolean {
  const explicit = explicitTypeText(entity);
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  return Boolean(
    raw.luxuryPresenceListing ||
      raw.legendsListing ||
      entity.legendsListing ||
      entity.luxuryPresenceListing ||
      /\b(legends[_\s-]*(sale|rent|listing)|luxury[_\s-]*presence[_\s-]*listing|mls|for sale|for rent)\b/.test(explicit),
  );
}

function pickFrom(images: string[], seed: unknown): string {
  if (images.length === 1) return images[0];
  const value = String(seed || "");
  const index = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0) % images.length;
  return images[index];
}

function matchingImageSet(entity: Record<string, unknown>): string[] | null {
  const text = entityText(entity);
  for (const rule of contentImageRules) {
    if (rule.terms.some((term) => includesTerm(text, term))) return entityImageSets[rule.key] || null;
  }
  return null;
}

function actualVenueImageSet(entity: Record<string, unknown>) {
  const text = entityText(entity);
  const match = actualVenueImageRules.find((rule) => rule.terms.some((term) => includesTerm(text, term)));
  return match ? actualVenueImageSets[match.key] || null : null;
}

function actualVenueImage(entity: Record<string, unknown>, context: ImageResolveContext = "fallback"): string | null {
  const set = actualVenueImageSet(entity);
  if (!set) return null;
  if (context === "pin" || context === "nearbyRail" || context === "relatedRail") return set.thumb;
  if (context === "card") return set.card;
  return set.hero;
}

function firstGalleryImage(entity: Record<string, unknown>): string | null {
  const galleryImages = Array.isArray(entity.galleryImages)
    ? entity.galleryImages
    : Array.isArray(entity.gallery)
      ? entity.gallery
      : [];
  const first = galleryImages[0];
  return typeof first === "string" && first.trim() ? first : null;
}

function mediaHeroImage(entity: Record<string, unknown>): string | null {
  const media = entity.media && typeof entity.media === "object" ? entity.media as Record<string, unknown> : null;
  return firstString(media?.hero, media?.image, media?.imageUrl);
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function cleanImagePath(path: string | null): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  const withoutRelativePrefix = trimmed.replace(/^\.\//, "").replace(/^\.\.\//, "");
  return `/${withoutRelativePrefix}`;
}

function normalizeResolvedImage(path: string | null): string | null {
  const cleaned = cleanImagePath(path);
  if (!cleaned) return null;
  const comparablePath = cleaned.toLowerCase().split("?")[0];
  return BLOCKED_PLACEHOLDER_IMAGES.has(comparablePath) ? PROPERTY_PLACEHOLDER_REPLACEMENT : cleaned;
}

function directImage(entity: Record<string, unknown>, context: ImageResolveContext = "fallback"): string | null {
  const gallery = firstGalleryImage(entity);
  const mediaHero = mediaHeroImage(entity);
  if (context === "drawerHeader") {
    return normalizeResolvedImage(firstString(entity.heroImage, entity.imageUrl, mediaHero, entity.image, gallery, entity.primaryImage, entity.panelImage, entity.pinImage));
  }
  if (context === "nearbyRail" || context === "relatedRail" || context === "card") {
    return normalizeResolvedImage(firstString(entity.imageUrl, entity.image, mediaHero, entity.heroImage, gallery, entity.primaryImage, entity.thumbnail, entity.pinImage));
  }
  const direct =
    entity.imageUrl ||
    entity.image ||
    mediaHero ||
    entity.heroImage ||
    entity.imageUrl ||
    gallery ||
    entity.pinImage ||
    entity.primaryImage ||
    entity.panelImage ||
    entity.mobileCardImage ||
    entity.thumbnail ||
    entity.relatedImage ||
    entity.assetKey;
  return typeof direct === "string" && direct.trim() ? normalizeResolvedImage(direct) : null;
}

function looksResidential(entity: Record<string, unknown>): boolean {
  return hasResidentialIntent(entity);
}

function looksHotel(entity: Record<string, unknown>): boolean {
  const text = entityText(entity);
  return /\b(hotel|hospitality|guest|stay|lodging)\b/.test(text);
}

function buildingImageKey(entity: Record<string, unknown>): string | null {
  if (!looksResidential(entity)) return null;
  const text = entityText(entity);
  const match = buildingImageRules.find((rule) => rule.terms.some((term) => includesTerm(text, term)));
  return match?.key || null;
}

export function resolveBuildingImage(entity: Record<string, unknown>): string | null {
  const premium = resolvePremiumPropertyImageSet(entity);
  if (premium.length) return premium[0];
  const key = buildingImageKey(entity);
  if (!key) return null;
  return curatedBuildingImageOverrides[key] || null;
}

function hotelImageKey(entity: Record<string, unknown>): string | null {
  if (!looksHotel(entity)) return null;
  const text = entityText(entity);
  const match = hotelImageRules.find((rule) => rule.terms.some((term) => includesTerm(text, term)));
  return match?.key || null;
}

export function resolveHotelImage(entity: Record<string, unknown>): string | null {
  const key = hotelImageKey(entity);
  if (!key) return null;
  return curatedHotelImageOverrides[key] || null;
}

export function resolveMapImage(entity: Record<string, unknown>, context: ImageResolveContext = "fallback"): string {
  const actualVenue = actualVenueImage(entity, context);
  if (actualVenue) return actualVenue;

  const direct = directImage(entity, context);
  if (direct && hasListingIntent(entity)) return direct;

  const canonical = resolveDowntownPerksEntityImage(entity);
  if (canonical?.src) return canonical.src;

  if (looksResidential(entity)) {
    const buildingImage = resolveBuildingImage(entity);
    if (buildingImage) return buildingImage;
  }
  if (looksHotel(entity)) {
    const hotelImage = resolveHotelImage(entity);
    if (hotelImage) return hotelImage;
  }

  if (context === "drawerHeader" && direct && !direct.includes("/images/fallbacks/")) return direct;

  if (direct && !direct.includes("/images/fallbacks/")) return direct;
  if (direct && direct.includes("/images/map-pins/")) return direct;
  if (direct && direct.includes("/images/legends-listings/")) return direct;

  const buildingImage = resolveBuildingImage(entity);
  if (buildingImage) return buildingImage;
  const hotelImage = resolveHotelImage(entity);
  if (hotelImage) return hotelImage;

  const matchedSet = matchingImageSet(entity);
  if (matchedSet?.length) return pickFrom(matchedSet, entity.id || entity.name);

  const keys = [
    slug(entity.id),
    slug(entity.name),
    slug(entity.brand),
    slug(entity.source),
  ].filter(Boolean);

  for (const key of keys) {
    if (perkImageRegistry[key]) return perkImageRegistry[key];
  }

  if (direct) return direct;

  const district = String(entity.district || "").toLowerCase();
  if (district && districtImageFallbacks[district]) return districtImageFallbacks[district];

  const category = slug(entity.category || entity.type || entity.partnerType);
  const categoryKey = Object.keys(categoryImageFallbacks).find((key) => category.includes(key) || key.includes(category));
  const fallback = categoryImageFallbacks[category] || (categoryKey ? categoryImageFallbacks[categoryKey] : undefined) || categoryImageFallbacks.default;

  if (IMAGE_RESOLVER_WARNINGS && !fallback) {
    console.warn("[ImageResolver] Missing image", entity);
  }

  return fallback || FINAL_NEUTRAL_FALLBACK;
}

export function resolveEntityImage(entity: Record<string, unknown>, context: ImageResolveContext = "fallback"): string {
  return resolveMapImage(entity, context);
}

export function resolveEntityGallery(entity: Record<string, unknown>): string[] {
  const raw = entity.raw && typeof entity.raw === "object" ? entity.raw as Record<string, unknown> : {};
  const rawGallery = Array.isArray(raw.gallery) ? raw.gallery : [];
  const explicitGallery = Array.isArray(entity.gallery) ? entity.gallery : [];
  const actualVenueSet = actualVenueImageSet(entity);
  const actualVenueGallery = actualVenueSet ? [actualVenueSet.hero, actualVenueSet.card, actualVenueSet.thumb, ...actualVenueSet.gallery] : [];
  const premiumPropertyImages = (looksResidential(entity) || looksHotel(entity)) ? resolvePremiumPropertyImageSet(entity) : [];
  const matchedSet = premiumPropertyImages.length ? [] : matchingImageSet(entity) || [];
  const primary = resolveEntityImage(entity);
  return [primary, ...actualVenueGallery, ...premiumPropertyImages, ...explicitGallery, ...rawGallery, ...matchedSet]
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .filter((item, index, list) => list.indexOf(item) === index);
}
