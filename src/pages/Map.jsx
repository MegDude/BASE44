import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronUp,
  CreditCard,
  Gift,
  Info,
  MapPin,
  ScanLine,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import AboutDowntownPerksModal from "@/components/modals/AboutDowntownPerksModal";
import { useLocations } from "../lib/useLocations";
import { directionsUrl, campaignRoute, mapRoutes } from "../lib/map/mapActionRegistry";
import { resolveBuildingImage, resolveEntityGallery, resolveEntityImage } from "../lib/map/entityImageResolver";
import { resolveEntityPin } from "../lib/map/entityPinResolver";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { SEARCH_PROMPTS } from "@/lib/mapSystemConstants";
import { legendsListingPlaces } from "@/data/legendsListings";
import { luxuryPresenceListings } from "@/data/luxuryPresenceInventory";
import { searchIntentRegistry } from "@/data/production";
import { DAA_STORYMAP_URL, DAA_TOUR_STOP_COUNT, daaExplorerQuestions, daaTourStops, getDaaTourStopById } from "@/data/daaArtParksTour";

const RAINEY_STREET_CENTER = [30.25855, -97.73835];
const AUSTIN_CENTER = RAINEY_STREET_CENTER;
const INITIAL_MAP_ZOOM = 16.5;
const MAP_PANEL_IMAGE_FALLBACK = "/images/map-entities/perks/downtown_art_walk_1779052670656.png";
const LEGENDS_BRAND_LINE = "Legends Real Estate";
const FILTERS = [
  "All",
  "Saved",
  "Perks",
  "Happy Hour",
  "Happy Hours",
  "Happy Hour Now",
  "Happy Hour Today",
  "Cocktails",
  "Wine",
  "Beer",
  "Oysters",
  "Patio",
  "Rooftop",
  "Under $10",
  "Rainey",
  "West 6th",
  "inKind",
  "Waterloo Park",
  "Parks",
  "Properties",
  "Venues",
  "Hotels",
  "Brands",
  "Events",
  "Live Music",
  "Walking",
  "Family",
  "Fitness",
  "Food Trucks",
  "Markets",
  "Public Art",
  "Civic",
  "Services",
  "Local Guide",
];

function luxuryPresenceListingToPlace(listing) {
  if (!listing) return null;

  const sqftDisplay = listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "";
  return {
    id: listing.id || listing.listing_id,
    name: listing.address,
    type: "property",
    partnerType: "properties",
    brand: LEGENDS_BRAND_LINE,
    pinKey: "legends",
    category: "Residential Property",
    category_key: "residential_property luxury_presence listing mls",
    latitude: listing.lat,
    longitude: listing.lng,
    district: listing.district,
    address: listing.address,
    summary: "This Downtown Austin residence is currently available through Legends Real Estate.",
    image: listing.panelImage || listing.primaryImage || listing.heroImage,
    primaryImage: listing.primaryImage,
    heroImage: listing.heroImage,
    panelImage: listing.panelImage,
    mobileCardImage: listing.mobileCardImage,
    thumbnail: listing.thumbnail,
    galleryImages: listing.galleryImages,
    raw: {
      luxuryPresenceListing: true,
      legendsListing: {
        address: listing.address,
        city: "Austin",
        state: "TX",
        zip: listing.zip_code || "78701",
        price: listing.price,
        priceDisplay: listing.price,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        sqftDisplay,
        mlsNumber: listing.mls_number,
        mls_number: listing.mls_number,
        status: listing.status,
        listingTypeLabel: listing.listing_type || listing.status,
        image: listing.panelImage || listing.primaryImage || listing.heroImage,
        galleryImages: listing.galleryImages,
        buildingName: listing.building_name,
      },
    },
    source: listing.source || "Luxury Presence MLS feed",
  };
}

const luxuryPresenceListingPlaces = luxuryPresenceListings
  .map(luxuryPresenceListingToPlace)
  .filter(Boolean);

const FILTER_MATCHERS = {
  Perks: ["offer", "perk", "deal", "discount", "reward", "card"],
  "Happy Hour": ["happy hour", "happy_hour"],
  "Happy Hours": ["happy hour", "happy_hour"],
  "Happy Hour Now": ["happy hour", "happy_hour"],
  "Happy Hour Today": ["happy hour", "happy_hour"],
  Cocktails: ["cocktails", "cocktail", "martinis", "margarita"],
  Wine: ["wine", "wines", "bottles"],
  Beer: ["beer", "beers", "draft", "beer-garden"],
  Oysters: ["oyster", "oysters"],
  Patio: ["patio"],
  Rooftop: ["rooftop"],
  "Under $10": ["$3", "$4", "$5", "$6", "$7", "$8", "$9", "$10", "under-10", "half-off", "half off", "50%"],
  Rainey: ["rainey", "happy hour"],
  "West 6th": ["west 6th", "happy hour"],
  "Waterloo Park": ["waterloo park", "waterloo"],
  Parks: ["park", "parks", "outdoor", "lawn"],
  inKind: ["inkind", "offer", "perk", "restaurant"],
  Properties: ["property", "residential", "apartment", "condo", "tower", "listing", "building"],
  Venues: ["venue", "bar", "restaurant", "coffee", "dining", "nightlife", "retail", "store"],
  Hotels: ["hotel", "hospitality", "stay", "guest"],
  Brands: ["brand", "sponsor", "rivian", "yeti", "ariat", "lululemon", "equinox", "legends real estate"],
  Events: ["event", "activation", "music", "show", "festival", "rsvp"],
  "Live Music": ["live music", "concert", "moody amphitheater", "show"],
  Walking: ["walking", "walk", "trail", "waller creek"],
  Family: ["family", "pavilion", "children", "play"],
  Fitness: ["fitness", "wellness", "yoga", "running"],
  "Food Trucks": ["food truck", "food trucks"],
  Markets: ["market", "markets", "shopping"],
  "Public Art": ["public art", "art installation", "arts"],
  Civic: ["civic", "public", "district", "city"],
  Services: ["service", "concierge", "mobility", "parking"],
  "Local Guide": ["guide", "local", "downtown", "austin"],
};

const RESIDENT_ASK_PROMPTS = [
  "Coffee nearby",
  "What is happening tonight?",
  "Happy hour nearby",
  "Live music this week",
  "Where should we go?",
];

const PARTNER_ASK_PROMPTS = [
  "What drove the most activity?",
  "Which perk performed best?",
  "Where are residents spending time?",
  "What should I promote next?",
  "Which building is most engaged?",
  "What are people saving nearby?",
  "What events created the most interest?",
  "What is trending downtown?",
];

const PARTNER_CONTEXT_PROMPTS = {
  Properties: [
    "Which amenities drive engagement?",
    "What are residents looking for?",
    "Which perks perform best?",
    "What should we promote next month?",
  ],
  Hotels: [
    "What are guests interested in?",
    "What nearby perks are popular?",
    "Which experiences generate activity?",
  ],
  Venues: [
    "What brought people in?",
    "Which event performed best?",
    "What should we run next?",
  ],
  Brands: [
    "Where should we activate?",
    "What districts are active?",
    "Which audiences are responding?",
  ],
  Civic: [
    "What neighborhoods are participating?",
    "What topics are residents discussing?",
    "Where is interest growing?",
  ],
  "Real Estate": [
    "Which buildings generate interest?",
    "Where are people looking?",
    "Which districts are gaining momentum?",
  ],
};

const CANONICAL_CATEGORY_LABELS = {
  coffee: "Coffee",
  dining: "Dining",
  nightlife: "Drinks",
  grocery: "Grocery",
  hotel: "Hotel",
  retail: "Retail",
  wellness: "Wellness",
  fitness: "Fitness",
  service: "Services",
  services: "Services",
  residential: "Residential",
  property: "Property",
  event: "Events",
  brand: "Brands",
  civic: "Civic",
  music: "Music",
  entertainment: "Entertainment",
  perk: "Perks",
  offer: "Perks",
  campaign: "Campaigns",
  place: "Dining",
};

const DISTRICT_CONTEXT = {
  Seaholm: "Walkable grocery, fitness, restaurants, and lake access nearby.",
  Rainey: "Restaurants, nightlife, waterfront access, and trails close together.",
  Congress: "Work, culture, dining, and events in the center of downtown.",
  "2nd Street": "Retail, wellness, dining, and everyday errands within a short walk.",
  "West 6th": "Restaurants, bars, and evening plans close to downtown offices.",
  "Red River": "Music venues, nightlife, and entertainment within a few blocks.",
};

const DISTRICT_NEARBY_FALLBACKS = {
  Rainey: ["Hotel Van Zandt", "Lady Bird Lake", "Rainey Street", "The Shore", "Downtown Trail Network"],
  Seaholm: ["Trader Joe's", "Shoal Creek Trail", "True Food Kitchen", "Central Library", "Waterloo Greenway"],
  Congress: ["Four Seasons", "Congress Avenue", "Frost Tower", "The Paramount", "Republic Square"],
  "2nd Street": ["Austin Proper Hotel", "ACL Live", "La Piscina", "The Peacock", "Royal Blue Grocery"],
  "West 6th": ["West 6th Street", "Shoal Creek", "Whole Foods", "The Independent", "Downtown offices"],
  "Red River": ["Mohawk", "Stubb's", "Waterloo Park", "Hotel Indigo", "Live music venues"],
  "Warehouse District": ["Republic Square", "ACL Live", "The Contemporary", "Congress Avenue", "Downtown restaurants"],
  "Lady Bird Lake": ["Ann and Roy Butler Trail", "Rainey Street", "Congress Avenue Bridge", "Waterfront restaurants", "Downtown hotels"],
  "Downtown Austin": ["Congress Avenue", "Republic Square", "Lady Bird Lake", "Downtown restaurants", "Waterloo Greenway"],
};

const PANEL_COPY_LIMIT = 120;

function truncatePanelCopy(value, limit = PANEL_COPY_LIMIT) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit - 1).replace(/\s+\S*$/, "").trim();
  return `${clipped}.`;
}

function stripPanelPlaceholderCopy(value) {
  const removedCopy = [
    ["Dining", " Perk", "Dining"],
    ["Coffee", " Stop", "Coffee"],
    ["Night Out", " Nearby", "Drinks nearby"],
    ["Property", " Discovery", "Property"],
    ["Resident", " Access", "Resident Card"],
    ["Create Map", " Plan", "Start Campaign"],
    ["Nearby Downtown", " Option", "Nearby"],
    ["Learn", " More", "View Details"],
    ["Read", " More", "View Details"],
    ["Discover", " More", "Explore Nearby"],
  ];
  let text = String(value || "");
  removedCopy.forEach(([first, second, replacement]) => {
    text = text.replace(new RegExp(`\\b${first}${second}\\b`, "gi"), replacement);
  });
  return String(value || "")
    ? text
    : "";
}

function getPartnerAskPrompts(activeFilter) {
  return PARTNER_CONTEXT_PROMPTS[activeFilter] || PARTNER_ASK_PROMPTS;
}

const NON_SEARCH_PROMPTS = [
  "Where do you want to go?",
  "What do you want to do?",
  "Who do you want to meet?",
  "Search downtown...",
  "Analyze intelligence...",
];

function sanitizeMapPrompt(prompt, mode = "resident") {
  const trimmed = String(prompt || "").trim();
  const normalized = trimmed.toLowerCase();
  if (!trimmed) return "";
  if (NON_SEARCH_PROMPTS.some((item) => item.toLowerCase() === normalized)) return "";
  if (mode === "partner") {
    const residentOnly = ["coffee nearby", "happy hour nearby", "happy hour now", "dinner tonight", "dinner nearby", "live music tonight", "live music this week", "where should we go?", "rooftops nearby"];
    if (residentOnly.includes(normalized)) return "";
  }
  return trimmed;
}

const ALL_NEIGHBORHOODS = "All";
const NEIGHBORHOODS = [
  ALL_NEIGHBORHOODS,
  "Seaholm",
  "Rainey",
  "West 6th",
  "Red River",
  "Congress",
  "Warehouse District",
  "2nd Street",
  "Lady Bird Lake",
  "Downtown Austin",
];

function isAllNeighborhoodScope(value) {
  return !value || value === ALL_NEIGHBORHOODS || value === "District";
}

function getAreaRailType(mode, activeFilter) {
  return mode === "partner" || activeFilter === "Civic" ? "districts" : "neighborhoods";
}

function getAreaRailLabel(mode, activeFilter) {
  return getAreaRailType(mode, activeFilter) === "districts" ? "Districts" : "Neighborhoods";
}

function getAllAreaLabel(mode, activeFilter) {
  return getAreaRailType(mode, activeFilter) === "districts" ? "All districts" : "All neighborhoods";
}

const LIVE_CARD_URL = "https://downtown-perks-live.base44.app/card";
const DEMO_CARD_CODE = "DP-DEMO-78701";
const PERKS_CARD_QR_SRC = "/images/card/perks-card-qr.png";

const METRICS = [
  { id: "reach", label: "People nearby", value: "18.4k", copy: "People active near the selected area." },
  { id: "yield", label: "Took action", value: "24%", copy: "People who saved, scanned, RSVP'd, or asked for directions." },
  { id: "impact", label: "Map lift", value: "3.8x", copy: "How much better this does when it appears on the map at the right time." },
  { id: "flux", label: "Resident activity", value: "+31%", copy: "Change in resident activity around this area." },
];

function getPartnerBusinessInsights(place) {
  const text = placeText(place);
  const district = place?.district || "Downtown Austin";
  const category = String(place?.category || place?.type || "place");
  const name = place?.name || "this partner";

  if (isInKindPartner(place)) {
    return {
      intent: "Residents and hotel guests nearby are choosing where to eat, drink, or start the night. inKind works here because the value is immediate and tied to restaurants people can actually walk to.",
      audience: `Best fit: verified residents, nearby buildings, hotel guests, and dinner groups already moving through ${district}.`,
      opportunity: `Use ${name} as a dining perk that can turn map intent into saves, scans, redemptions, and repeat visits.`,
      timing: "Strongest window: 4 PM to 9 PM",
      placement: `inKind dining near ${district}`,
      action: "Lead with a simple dining perk",
      fit: "High-frequency dining behavior, easy resident redemption, and clear partner value without asking anyone to download another app.",
    };
  }

  if (text.includes("hotel") || text.includes("hospitality")) {
    return {
      intent: "Guests and residents nearby are looking for dinner, events, and easy walkable plans.",
      audience: "Best fit: hotel guests, nearby residents, and visitors already walking through the area.",
      opportunity: "Promote a concierge-style local guide or resident rate during late afternoon planning windows.",
      timing: "Strongest window: 3 PM to 8 PM",
      placement: `Near ${district}`,
      action: "Help guests find what is nearby",
    };
  }

  if (text.includes("property") || text.includes("condo") || text.includes("apartment") || text.includes("residential")) {
    return {
      intent: "Residents and prospects use this area to understand what daily life feels like around the building.",
      audience: "Best fit: current residents, people looking at the building, brokers, and nearby businesses.",
      opportunity: "Attach nearby perks, events, and walkable recommendations to the property story.",
      timing: "Strongest window: weekday lunch and after-work planning",
      placement: `Around ${district}`,
      action: "Show what life feels like nearby",
    };
  }

  if (text.includes("bar") || text.includes("nightlife") || text.includes("music") || text.includes("cocktail") || text.includes("pub")) {
    return {
      intent: "People nearby are deciding where to go next, often after dinner, events, or hotel check-in.",
      audience: "This is the nearby crowd most likely to act now: people already downtown, close enough to walk, and looking for an easy next stop.",
      opportunity: "Use a time-boxed perk or event reminder while people are already downtown and choosing a spot.",
      timing: "Strongest window: 6 PM to 11 PM",
      placement: `Tonight near ${district}`,
      action: "Share an evening offer",
    };
  }

  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) {
    return {
      intent: "Nearby searches cluster around coffee, work breaks, meetings, and quick morning decisions.",
      audience: "Best fit: residents, office workers, brokers, hotel guests, and morning regulars.",
      opportunity: "Place a simple resident perk or morning map placement near building and hotel activity.",
      timing: "Strongest window: 7 AM to 11 AM",
      placement: `Morning near ${district}`,
      action: "Share a morning offer",
    };
  }

  if (text.includes("fitness") || text.includes("wellness") || text.includes("spa") || text.includes("yoga")) {
    return {
      intent: "Residents nearby look for routine-friendly wellness options they can reach without planning around traffic.",
      audience: "Best fit: verified residents, nearby buildings, hotel guests, and downtown regulars.",
      opportunity: "Use resident access, trial classes, or recovery offers tied to walkable buildings.",
      timing: "Strongest window: early morning and after work",
      placement: `Wellness near ${district}`,
      action: "Share a resident wellness offer",
    };
  }

  if (text.includes("event") || text.includes("activation") || text.includes("rsvp")) {
    return {
      intent: "People nearby are already planning around a time-sensitive reason to come downtown.",
      audience: "Best fit: residents saving events, hotel guests, and people already moving through the area.",
      opportunity: "Connect the event to nearby perks, directions, and partner offers before and after attendance.",
      timing: "Strongest window: day-before saves and two hours before start",
      placement: `Event night near ${district}`,
      action: "Connect this to nearby plans",
    };
  }

  if (text.includes("happy hour") || text.includes("happy_hour")) {
    return {
      intent: "People nearby are deciding where to grab a drink, meet someone, or start the night without making it a whole production.",
      audience: "Best fit: residents within a short walk, hotel guests after check-in, and people leaving work or heading to a show.",
      opportunity: "Keep the offer simple, time-boxed, and easy to redeem with a scan or card view.",
      timing: "Strongest window: 4 PM to 7 PM",
      placement: `Happy hour near ${district}`,
      action: "Put the happy hour on the map",
    };
  }

  if (text.includes("shop") || text.includes("retail") || text.includes("store") || text.includes("eyewear")) {
    return {
      intent: "Nearby residents and visitors are comparing useful stops they can fold into a downtown trip.",
      audience: "Best fit: residents, hotel guests, event-goers, and people saving places from the map.",
      opportunity: "Use a map-visible perk or appointment prompt tied to the surrounding district flow.",
      timing: "Strongest window: lunch, weekend afternoons, and pre-event browsing",
      placement: `Shopping near ${district}`,
      action: "Make this easier to find",
    };
  }

  return {
    intent: `People nearby are using the map to decide what is useful around ${district}.`,
    audience: "Best fit: nearby residents, visitors, hotel guests, and people already downtown.",
    opportunity: `Use this ${category.toLowerCase()} context to show up when people are close enough to act.`,
    timing: "Strongest window: lunch, after work, and event-adjacent movement",
    placement: `Near ${district}`,
    action: "Show up while people are nearby",
  };
}

function placeText(place) {
  return [
    place.name,
    place.category,
    place.category_key,
    place.type,
    place.partnerType,
    place.brand,
    place.source,
    place.district,
    place.address,
    place.raw?.summary,
    place.raw?.deals_offers,
    place.raw?.alignment_to_downtown_perks,
    place.raw?.category_key,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function placeCoreText(place) {
  return [
    place.name,
    place.category,
    place.category_key,
    place.type,
    place.partnerType,
    place.brand,
    place.raw?.category,
    place.raw?.category_key,
    place.raw?.type,
    place.raw?.partnerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function coreMatches(place, tokens) {
  const text = placeCoreText(place);
  return tokens.some((token) => text.includes(token.toLowerCase()));
}

function isPropertyEntity(place) {
  return coreMatches(place, FILTER_MATCHERS.Properties);
}

function isHotelEntity(place) {
  if (isPropertyEntity(place)) return false;
  return coreMatches(place, FILTER_MATCHERS.Hotels);
}

function isBrandEntity(place) {
  if (isPropertyEntity(place) || isHotelEntity(place)) return false;
  const text = placeCoreText(place);
  const type = String(place.type || "").toLowerCase();
  const partnerType = String(place.partnerType || "").toLowerCase();
  const name = String(place.name || "").toLowerCase();
  const knownBrands = ["rivian", "yeti", "ariat", "lululemon", "equinox", "austin fc", "legends real estate"];
  const venueOnlySignals = ["bar", "nightlife", "restaurant", "coffee", "dining", "pizza", "cafe", "pub"];
  const knownBrandMatch = knownBrands.some((brand) => name === brand || name.startsWith(`${brand} `));

  return (
    type === "brand" ||
    partnerType === "brand" ||
    text.includes("brand") ||
    text.includes("sponsor") ||
    (knownBrandMatch && !coreMatches(place, venueOnlySignals))
  );
}

function isVenueEntity(place) {
  if (isPropertyEntity(place) || isHotelEntity(place) || isBrandEntity(place)) return false;
  return coreMatches(place, FILTER_MATCHERS.Venues) || String(place.type || "").toLowerCase() === "venue";
}

function isEventEntity(place) {
  const type = String(place.type || "").toLowerCase();
  const category = String(place.category || "").toLowerCase();
  const categoryKey = String(place.category_key || "").toLowerCase();
  const markerType = String(place.markerType || place.raw?.markerType || "").toLowerCase();
  const detailType = String(place.detailDrawerType || place.raw?.detailDrawerType || "").toLowerCase();
  return (
    type === "event" ||
    place.isEvent === true ||
    place.raw?.isEvent === true ||
    markerType === "event" ||
    detailType === "event" ||
    category.includes("event") ||
    categoryKey.includes("event")
  );
}

function isHappyHourEntity(place) {
  const text = placeText(place);
  const type = String(place.type || "").toLowerCase();
  const category = String(place.category || "").toLowerCase();
  const categoryKey = String(place.category_key || "").toLowerCase();
  const markerType = String(place.markerType || place.raw?.markerType || "").toLowerCase();
  const detailType = String(place.detailDrawerType || place.raw?.detailDrawerType || "").toLowerCase();
  const hasHappyHourDetails = Boolean(place.raw?.happyHour || place.happyHour);

  if (isEventEntity(place) && type !== "happy_hour" && !hasHappyHourDetails) {
    return false;
  }

  return (
    type === "happy_hour" ||
    markerType === "happy_hour" ||
    detailType === "happy_hour" ||
    category.includes("happy hour") ||
    categoryKey.includes("happy_hour") ||
    hasHappyHourDetails ||
    text.includes("happy hour")
  );
}

function isCivicEntity(place) {
  return coreMatches(place, FILTER_MATCHERS.Civic) || String(place.type || "").toLowerCase() === "civic";
}

function isServiceEntity(place) {
  return coreMatches(place, FILTER_MATCHERS.Services) || String(place.type || "").toLowerCase() === "service";
}

function matchesFilter(place, activeFilter, savedIds) {
  if (activeFilter === "All") return true;
  if (activeFilter === "Saved") return savedIds.has(place.id);
  if (activeFilter === "Perks") return hasActivePerkData(place);
  if (activeFilter === "Happy Hours" || activeFilter === "Happy Hour") return isHappyHourEntity(place);
  if (activeFilter === "Happy Hour Now") return isHappyHourEntity(place) && Boolean(place.isLiveNow);
  if (activeFilter === "Happy Hour Today") return isHappyHourEntity(place) && Boolean(place.happyHour?.days);
  if (activeFilter === "Properties") return isPropertyEntity(place);
  if (activeFilter === "Hotels") return isHotelEntity(place);
  if (activeFilter === "Brands") return isBrandEntity(place);
  if (activeFilter === "Venues") return isVenueEntity(place);
  if (activeFilter === "Events") return isEventEntity(place);
  if (activeFilter === "Civic") return isCivicEntity(place);
  if (activeFilter === "Services") return isServiceEntity(place);
  const tokens = FILTER_MATCHERS[activeFilter] || [];
  const text = placeText(place);
  return tokens.some((token) => text.includes(token.toLowerCase()));
}

function buildMapAnswer(query, results, mode, district, activeFilter) {
  const cleanQuery = query.trim();
  const scope = isAllNeighborhoodScope(district) ? "downtown" : district;
  const topResults = results.slice(0, 3);
  const topNames = topResults.map((place) => place.name).filter(Boolean).join(", ");
  const categoryHint = activeFilter === "All" ? "places" : activeFilter.toLowerCase();
  const intent = cleanQuery || (mode === "partner" ? "nearby partner opportunity" : "nearby resident plan");
  const lead = mode === "partner"
    ? `${results.length} ${categoryHint} fit what you are looking for in ${scope}.`
    : `${results.length} ${categoryHint} fit your question in ${scope}.`;

  if (!topResults.length) {
    return {
      title: cleanQuery ? `Answering: “${intent}”` : "Map answer",
      body:
        mode === "partner"
          ? `Start with the full downtown map, then narrow by area, time of day, or category. Even with a broad question, you can still see where people are nearby and what they are likely to choose next.`
          : `Start with the full downtown map, then narrow by coffee, dinner, events, perks, or a neighborhood. The map keeps showing useful nearby options instead of leaving you with a blank screen.`,
      picks: [],
    };
  }

  return {
    title: cleanQuery ? `Answering: “${intent}”` : "Map answer",
    body: `${lead} Start with ${topNames}. The map uses place details, neighborhood, perks, and time of day to make the next choice easier.`,
    picks: topResults,
  };
}

function getPromptIntent(query) {
  const normalized = query.trim().toLowerCase();
  if (normalized === "where do you want to go?") return "go";
  if (normalized === "what do you want to see?") return "see";
  if (normalized === "what do you want to do?") return "do";
  return "";
}

function buildAgenticMapAnswer(query, results, mode, district, activeFilter) {
  const base = buildMapAnswer(query, results, mode, district, activeFilter);
  const promptIntent = getPromptIntent(query);
  const topResults = results.slice(0, 3);
  const names = topResults.map((place) => place.name).filter(Boolean);
  const scope = isAllNeighborhoodScope(district) ? "downtown" : district;
  const audience = mode === "partner" ? "partner" : "resident";

  if (!topResults.length) return base;

  if (audience === "partner") {
    const focus = activeFilter === "All" ? "activity" : activeFilter.toLowerCase();
    return {
      title: `What the map shows about ${focus}`,
      body: `Start with ${names.join(", ")}. Use this to compare nearby activity, saves, visits, timing, and audience fit in ${scope}. The next move is to choose the place, perk, event, property, or campaign that is easiest for people nearby to act on.`,
      picks: topResults,
    };
  }

  if (promptIntent === "go") {
    return {
      title: audience === "partner" ? "Where the nearby audience is clustering" : "Places nearby worth going to",
      body:
        audience === "partner"
          ? `Start around ${names.join(", ")}. These are useful nearby anchors for understanding where people already are and what they may choose next in ${scope}.`
          : `Start with ${names.join(", ")}. These are nearby, map-ready options for an easy downtown plan in ${scope}.`,
      picks: topResults,
    };
  }

  if (promptIntent === "see") {
    return {
      title: audience === "partner" ? "What the map is showing right now" : "What is visible nearby",
      body:
        audience === "partner"
          ? `${names.join(", ")} are getting the strongest response right now. Use them to compare timing, local context, and what people are saving before launching an offer or campaign.`
          : `The map is showing ${names.join(", ")} first. Use this to scan events, perks, listings, and places without jumping between apps.`,
      picks: topResults,
    };
  }

  if (promptIntent === "do") {
    return {
      title: audience === "partner" ? "Actions the map can help with" : "A simple next move",
      body:
        audience === "partner"
          ? `Use ${names[0]} as the starting point, then open Activity or a campaign action to decide where to participate and who nearby should see it.`
          : `Pick ${names[0]} first, then save it, get directions, or compare similar nearby options. The map keeps the next step close to the decision.`,
      picks: topResults,
    };
  }

  return base;
}

function mergeAgentAnswerWithLocalResults(agentAnswer, localResults, fallbackTitle) {
  const agentPlaces = Array.isArray(agentAnswer?.places) ? agentAnswer.places : [];
  const matchedPicks = agentPlaces
    .map((agentPlace) => {
      const agentId = String(agentPlace.id || "");
      const agentName = String(agentPlace.name || "").toLowerCase();
      return localResults.find((place) => String(place.id) === agentId || String(place.name || "").toLowerCase() === agentName);
    })
    .filter(Boolean);

  const picks = matchedPicks.length ? matchedPicks : localResults.slice(0, 3);

  return {
    title: agentAnswer.title || fallbackTitle,
    body: agentAnswer.answer,
    picks,
    actions: Array.isArray(agentAnswer.actions) ? agentAnswer.actions.slice(0, 4) : [],
    source: agentAnswer.source,
    model: agentAnswer.model,
  };
}

function tokenizeIntent(query) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function getIntentTokens(query) {
  const q = query.trim().toLowerCase();
  const tokens = new Set(tokenizeIntent(q));
  const add = (items) => items.forEach((item) => tokens.add(item));

  if (/\b(perk|deal|offer|discount|save|card|redeem)\b/.test(q)) add(["perk", "offer", "discount", "resident", "card"]);
  if (/\b(dinner|lunch|eat|food|restaurant|pizza|taco|date)\b/.test(q)) add(["restaurant", "dining", "food", "pizza", "kitchen", "bar"]);
  if (/\b(coffee|cafe|espresso|morning|work)\b/.test(q)) add(["coffee", "cafe", "espresso", "morning"]);
  if (/\b(drink|drinks|bar|music|night|tonight|show|after)\b/.test(q)) add(["nightlife", "bar", "music", "event", "cocktail"]);
  if (/\b(hotel|guest|stay|visitor|concierge)\b/.test(q)) add(["hotel", "hospitality", "guest", "stay"]);
  if (/\b(property|building|apartment|condo|resident|leasing|home)\b/.test(q)) add(["property", "residential", "building", "apartment", "condo"]);
  if (/\b(brand|sponsor|campaign|activate|activation|audience)\b/.test(q)) add(["brand", "campaign", "activation", "audience"]);
  if (/\b(event|rsvp|happening|live)\b/.test(q)) add(["event", "rsvp", "music", "activation"]);
  if (/\b(wellness|fitness|gym|yoga|spa)\b/.test(q)) add(["wellness", "fitness", "gym", "yoga", "spa"]);

  return Array.from(tokens);
}

function scorePlaceForIntent(place, intentTokens, query, mode) {
  const text = placeText(place);
  let score = 0;

  intentTokens.forEach((token) => {
    if (text.includes(token)) score += token.length > 5 ? 6 : 4;
    if (String(place.name || "").toLowerCase().includes(token)) score += 8;
    if (String(place.category || "").toLowerCase().includes(token)) score += 5;
    if (String(place.district || "").toLowerCase().includes(token)) score += 4;
  });

  if (hasActivePerkData(place)) score += query.includes("perk") || query.includes("card") ? 10 : 2;
  if (mode === "partner" && ["property", "hotel", "brand", "event", "offer"].includes(String(place.type))) score += 3;
  if (mode === "resident" && ["venue", "event", "offer", "hotel"].includes(String(place.type))) score += 3;
  if (place.district && place.district !== "Downtown Austin") score += 1;

  return score;
}

function rankPlacesForIntent(places, query, mode) {
  const intentTokens = getIntentTokens(query);
  if (!intentTokens.length) return places;

  const ranked = places
    .map((place, index) => ({ place, index, score: scorePlaceForIntent(place, intentTokens, query.toLowerCase(), mode) }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const matches = ranked.filter((item) => item.score > 0).map((item) => item.place);
  return matches.length ? matches : places;
}

function getLegendsListing(place) {
  const listing = place?.raw?.legendsListing || place?.legendsListing;
  return listing && typeof listing === "object" ? listing : null;
}

function getResolvedLegendsListing(place) {
  const directListing = getLegendsListing(place);
  if (directListing) return directListing;
  if (getLuxuryPresenceBuilding(place)) return null;

  const placeTextForListing = normalizePanelImageText([
    place?.id,
    place?.name,
    place?.address,
    place?.raw?.address,
    place?.raw?.name,
  ].filter(Boolean).join(" "));

  const matchedListingPlace = legendsListingPlaces.find((listingPlace) => {
    const listing = getLegendsListing(listingPlace);
    const listingAddress = normalizePanelImageText(listing?.address || listingPlace.address || listingPlace.name);
    const listingBaseAddress = baseAddressText(listing?.address || listingPlace.address || listingPlace.name);
    return (listingAddress && placeTextForListing.includes(listingAddress)) || (listingBaseAddress && placeTextForListing.includes(listingBaseAddress));
  });

  return getLegendsListing(matchedListingPlace);
}

function getLuxuryPresenceBuilding(place) {
  const raw = place?.raw || {};
  if (raw?.luxuryPresenceBuilding) return raw;
  if (Array.isArray(raw?.listings) && raw.listings.length) return raw;
  if (Array.isArray(place?.listings) && place.listings.length) return place;
  return null;
}

function isLegendsMapPlace(place) {
  return Boolean(getLegendsListing(place)) || String(place?.pinKey || place?.brand || place?.source || "").toLowerCase().includes("legends");
}

function getResidentListingIntro(place) {
  const listing = getLegendsListing(place);
  if (!listing) return "";

  const details = [
    listing.priceDisplay,
    listing.beds ? `${listing.beds} bed${Number(listing.beds) === 1 ? "" : "s"}` : "",
    listing.baths ? `${listing.baths} bath${Number(listing.baths) === 1 ? "" : "s"}` : "",
    listing.sqftDisplay,
  ].filter(Boolean).join(" · ");

  return `Want to live here? ${details ? `${details}. ` : ""}See the listing details, compare what is walkable nearby, and contact Legends Real Estate for availability, showing options, and resident access to properties that may not always appear on other listing sites.`;
}

function getPanelMetaLine(place) {
  const listing = getLegendsListing(place);
  if (listing) {
    return `${getCanonicalCategoryLabel(place)} · ${place?.district || "Downtown Austin"}`;
  }
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    return `${getCanonicalCategoryLabel(place)} · ${place?.district || "Downtown Austin"}`;
  }
  return `${getCanonicalCategoryLabel(place)} · ${place?.district || "Downtown Austin"}`;
}

function getCanonicalCategoryLabel(place) {
  const kind = getDestinationKind(place);
  if (getLuxuryPresenceBuilding(place)) return "Residential";
  if (getResolvedLegendsListing(place)) return "Property";
  if (isHappyHourEntity(place)) return "Drinks";
  if (place?.raw?.isWaterlooPark || place?.isWaterlooPark) {
    const text = placeText(place);
    if (text.includes("music") || text.includes("concert")) return "Music";
    if (text.includes("fitness") || text.includes("wellness") || text.includes("yoga")) return "Fitness";
    if (text.includes("family")) return "Events";
    if (text.includes("market")) return "Retail";
    return "Events";
  }
  return CANONICAL_CATEGORY_LABELS[kind] || CANONICAL_CATEGORY_LABELS[String(place?.type || "").toLowerCase()] || "Dining";
}

function isLegendsPropertyPanel(place) {
  return Boolean(getLegendsListing(place) || getLuxuryPresenceBuilding(place) || String(place?.brand || place?.raw?.brand || "").toLowerCase().includes("legends"));
}

function getPlaceCoords(place) {
  if (Array.isArray(place?.coords) && place.coords.length >= 2) return place.coords;
  if (Number.isFinite(place?.latitude) && Number.isFinite(place?.longitude)) return [place.latitude, place.longitude];
  return null;
}

function dedupePlacesById(places) {
  const seen = new Set();
  return places.filter((place) => {
    if (!place?.id) return false;
    if (seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

function getMapDistanceScore(origin, candidate) {
  const originCoords = getPlaceCoords(origin);
  const candidateCoords = getPlaceCoords(candidate);
  if (!originCoords || !candidateCoords) return Number.POSITIVE_INFINITY;

  const [originLat, originLng] = originCoords;
  const [candidateLat, candidateLng] = candidateCoords;
  const latitudeScale = Math.cos(((originLat + candidateLat) / 2) * (Math.PI / 180));
  const latDelta = candidateLat - originLat;
  const lngDelta = (candidateLng - originLng) * latitudeScale;
  return latDelta * latDelta + lngDelta * lngDelta;
}

function escapeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mapPinButtonHtml({ place, pin, ariaLabel, selected, pulsing, classes }) {
  const escapedId = escapeHtmlAttribute(place.id);
  const escapedLabel = escapeHtmlAttribute(ariaLabel);
  const pinLabel = escapeHtmlAttribute(pin.label);
  const activeClass = selected ? "is-selected" : "";
  const pulseClass = pulsing ? "is-pulsing" : "";

  return `<button type="button" class="dp-live-pin ${classes} ${activeClass} ${pulseClass}" data-entity-id="${escapedId}" data-pin-label="${pinLabel}" aria-label="${escapedLabel}"><span class="dp-live-pin__halo" aria-hidden="true"></span><span class="dp-live-pin__core">${pin.glyph}</span></button>`;
}

function pinIcon(place, selected, pulsing = false) {
  const pin = resolveEntityPin(place);
  const isEventPin = isEventEntity(place);
  const isHappyHourPin = isHappyHourEntity(place);
  const legendsListing = getLegendsListing(place);
  const isLegendsPin = isLegendsMapPlace(place);
  const eventPinClass = isEventPin ? "dp-live-pin--event" : "";
  const happyHourPinClass = isHappyHourPin ? "dp-live-pin--happy-hour" : "";
  const legendsPinClass = isLegendsPin ? "dp-live-pin--legends" : "";
  const shouldPulse = isLegendsPin ? false : pulsing;
  const iconSize = isLegendsPin
    ? (selected ? [42, 42] : [38, 38])
    : isEventPin || isHappyHourPin
      ? (selected ? [29, 29] : [26, 26])
      : selected
        ? [31, 31]
        : [28, 28];
  const iconAnchor = isLegendsPin
    ? (selected ? [21, 21] : [19, 19])
    : isEventPin || isHappyHourPin
      ? (selected ? [14.5, 14.5] : [13, 13])
      : selected
        ? [15.5, 15.5]
        : [14, 14];
  const ariaLabel = legendsListing ? `Legends listing at ${legendsListing.address}` : `${place.name} details`;
  return L.divIcon({
    className: "dp-leaflet-pin",
    html: mapPinButtonHtml({
      place,
      pin,
      ariaLabel,
      selected,
      pulsing: shouldPulse,
      classes: `${eventPinClass} ${happyHourPinClass} ${legendsPinClass}`,
    }),
    iconSize,
    iconAnchor,
    popupAnchor: [0, -18],
  });
}

function clusterIcon(count) {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 2;
  const size = safeCount > 99 ? 46 : safeCount > 9 ? 42 : 38;
  return L.divIcon({
    className: "dp-leaflet-cluster",
    html: `<div class="dp-map-cluster" aria-hidden="true"><span>${count}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getClusterCellSize(zoom) {
  if (zoom >= 16.5) return 0;
  if (zoom >= 16) return 0.0009;
  if (zoom >= 15) return 0.0025;
  if (zoom >= 14) return 0.0045;
  return 0.008;
}

function clusterPlaces(places, zoom, selectedId) {
  const validPlaces = places.filter((place) => getPlaceCoords(place));
  const cellSize = getClusterCellSize(zoom);
  const buildingCells = new Map();
  const placesForGeoClustering = [];
  const loosePlaces = [];

  validPlaces.forEach((place) => {
    if (place.id === selectedId) {
      loosePlaces.push({ type: "place", id: place.id, place });
      return;
    }

    const listing = getLegendsListing(place);
    const buildingKey = listing ? baseAddressText(listing.address || place.address || place.raw?.address || place.name) : "";
    if (buildingKey) {
      const lat = Number(place.latitude);
      const lng = Number(place.longitude);
      const cell = buildingCells.get(buildingKey) || { key: `building-${buildingKey}`, places: [], latitude: 0, longitude: 0 };
      cell.places.push(place);
      cell.latitude += lat;
      cell.longitude += lng;
      buildingCells.set(buildingKey, cell);
      return;
    }

    placesForGeoClustering.push(place);
  });

  const buildingClusters = Array.from(buildingCells.values()).flatMap((cell) => {
    if (cell.places.length < 2) {
      return cell.places.map((place) => ({ type: "place", id: place.id, place }));
    }

    return {
      type: "cluster",
      id: `cluster-${cell.key}`,
      count: cell.places.length,
      places: cell.places,
      coords: [cell.latitude / cell.places.length, cell.longitude / cell.places.length],
      groupType: "building",
    };
  });

  if (!cellSize) {
    return [
      ...loosePlaces,
      ...placesForGeoClustering.map((place) => ({ type: "place", id: place.id, place })),
      ...buildingClusters,
    ];
  }

  const cells = new Map();

  placesForGeoClustering.forEach((place) => {
    const lat = Number(place.latitude);
    const lng = Number(place.longitude);
    const key = `${Math.round(lat / cellSize)}:${Math.round(lng / cellSize)}`;
    const cell = cells.get(key) || { key, places: [], latitude: 0, longitude: 0 };
    cell.places.push(place);
    cell.latitude += lat;
    cell.longitude += lng;
    cells.set(key, cell);
  });

  const clusters = Array.from(cells.values()).flatMap((cell) => {
    if (cell.places.length < 2) {
      return cell.places.map((place) => ({ type: "place", id: place.id, place }));
    }

    return {
      type: "cluster",
      id: `cluster-${cell.key}`,
      count: cell.places.length,
      places: cell.places,
      coords: [cell.latitude / cell.places.length, cell.longitude / cell.places.length],
    };
  });

  return [...loosePlaces, ...buildingClusters, ...clusters];
}

function getClusterTitle(cluster, mode) {
  if (cluster?.groupType === "building") {
    const firstListing = getLegendsListing(cluster.places?.[0]);
    const address = firstListing?.address || cluster.places?.[0]?.address || cluster.places?.[0]?.raw?.address;
    return address ? `${address} listings` : "Listings in this building";
  }

  return mode === "partner" ? "Grouped partner places" : "Grouped nearby places";
}

function getClusterSubtitle(cluster, mode) {
  if (cluster?.groupType === "building") {
    return `${cluster.places?.length || 0} units available here`;
  }

  return `${cluster.places?.length || 0} places in this area`;
}

function PinBadge({ place, selected = false, size = "sm" }) {
  const pin = resolveEntityPin(place);
  const dimensions = size === "lg" ? "h-16 w-16 text-lg md:h-20 md:w-20 md:text-xl" : "h-7 w-7 text-[10px] md:h-8 md:w-8 md:text-[11px]";

  return (
    <span
	      className={`${dimensions} inline-flex shrink-0 items-center justify-center font-semibold transition ${
	        selected
	          ? "dp-map-pin-badge is-selected text-[#0B1F33]"
	          : "dp-map-pin-badge text-[#0B1F33]"
	      }`}
      aria-hidden="true"
      title={pin.label}
    >
      <span dangerouslySetInnerHTML={{ __html: pin.glyph }} />
    </span>
  );
}

function DemoQrTile({ code = "DP-DEMO-78701" }) {
  return (
    <div className="dp-info-row bg-white/72 p-2">
      <DemoQrCode code={code} className="mx-auto h-28 w-28" />
      <code className="mt-1.5 block text-center font-mono text-[9px] font-semibold tracking-[0.1em] text-[#C8A96A]">
        {code}
      </code>
    </div>
  );
}

function DemoQrCode({ code = DEMO_CARD_CODE, className = "" }) {
  return (
    <img
      src={PERKS_CARD_QR_SRC}
      alt={`Downtown Perks resident QR code for ${code}`}
      className={`${className} block bg-white object-contain [image-rendering:crisp-edges]`}
      loading="eager"
      decoding="async"
    />
  );
}

function PartnerQrScanner({ onVerified }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(0);
  const demoTimerRef = useRef(0);
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [scannerSource, setScannerSource] = useState("idle");
  const [scannerMessage, setScannerMessage] = useState("Start the camera or use the demo scan to verify a resident pass.");

  const stopCamera = useCallback(() => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    if (demoTimerRef.current) {
      window.clearTimeout(demoTimerRef.current);
      demoTimerRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const verifyCode = useCallback((code = DEMO_CARD_CODE) => {
    setScannerStatus("verified");
    setScannerMessage(`${code} verified for a partner perk, event check-in, or front desk confirmation.`);
    stopCamera();
    onVerified?.(code);
  }, [onVerified, stopCamera]);

  const runDemoScan = useCallback(() => {
    stopCamera();
    setScannerStatus("scanning");
    setScannerSource("demo");
    setScannerMessage("Demo scan running. Reading the resident QR in the scanner window...");
    demoTimerRef.current = window.setTimeout(() => {
      demoTimerRef.current = 0;
      verifyCode(DEMO_CARD_CODE);
    }, 900);
  }, [stopCamera, verifyCode]);

  const runDetectionLoop = useCallback(async () => {
    const video = videoRef.current;
    const Detector = typeof window !== "undefined" ? window.BarcodeDetector : null;

    if (!video || !Detector) return;

    const detector = new Detector({ formats: ["qr_code"] });
    const tick = async () => {
      if (!videoRef.current || !streamRef.current) return;
      try {
        if (video.readyState >= 2) {
          const codes = await detector.detect(video);
          const rawValue = codes?.[0]?.rawValue || "";
          if (rawValue) {
            verifyCode(rawValue.includes("DP-") ? rawValue.match(/DP-[A-Z0-9-]+/)?.[0] || DEMO_CARD_CODE : DEMO_CARD_CODE);
            return;
          }
        }
      } catch {
        setScannerMessage("Camera is live. If your browser cannot read QR codes here, use Demo Scan.");
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    tick();
  }, [verifyCode]);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setScannerStatus("error");
      setScannerMessage("Camera scanning is not available in this browser. Use Demo Scan to test the flow.");
      return;
    }

    try {
      setScannerStatus("scanning");
      setScannerSource("camera");
      setScannerMessage("Camera is live. Point it at a Downtown Perks resident QR.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      runDetectionLoop();
    } catch {
      setScannerStatus("error");
      setScannerSource("idle");
      setScannerMessage("Camera permission was blocked or unavailable. Use Demo Scan to verify the partner flow.");
      stopCamera();
    }
  }, [runDetectionLoop, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return (
    <section className="mt-3 dp-info-section p-3 md:mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            Scan access
            <ScanLine className="h-3.5 w-3.5 text-[#C8A96A]" />
          </div>
          <h3 className="mt-1 text-[19px] font-semibold leading-tight text-[#0B1F33] md:text-[21px]">
            Scan resident access
          </h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[#425466]">
            Verify a resident QR for a perk, event check-in, or front desk moment. Camera scan works when the browser supports QR detection; Demo Scan keeps the flow testable.
          </p>
        </div>
        {scannerStatus === "verified" && <Check className="h-5 w-5 shrink-0 stroke-[2.7] text-[#C8A96A]" />}
      </div>

      <div className="dp-partner-scanner-row mt-3 grid gap-3 overflow-hidden bg-white/78 p-2.5 text-[#0B1F33] shadow-[0_10px_26px_rgba(11,31,51,0.035),0_0_22px_rgba(200,169,106,0.04)]">
        <div className="dp-partner-scanner-copy min-w-0">
          <div className="text-[12px] font-semibold text-[#0B1F33]">
            {scannerStatus === "verified" ? "Resident pass verified" : scannerStatus === "scanning" ? "Scanning resident QR" : "Ready to scan"}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#0B1F33]/66">{scannerMessage}</p>
          <p className="mt-1.5 text-[10.5px] leading-4 text-[#0B1F33]/58">
            The scanner reads the resident pass code, checks it against the access flow, then locks the result as verified for the partner moment.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 pb-0.5">
            <button type="button" onClick={startCamera} className="dp-scanner-action">
              {scannerStatus === "scanning" ? "Camera Live" : "Start Camera"}
            </button>
            <button type="button" onClick={runDemoScan} className="dp-scanner-action">
              {scannerStatus === "scanning" ? "Scanning..." : "Demo Scan"}
            </button>
            {(scannerStatus === "scanning" || scannerStatus === "verified" || scannerStatus === "error") && (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setScannerStatus("idle");
                  setScannerSource("idle");
                  setScannerMessage("Start the camera or use the demo scan to verify a resident pass.");
                }}
                className="dp-scanner-action"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <div className="dp-partner-scanner-window relative flex h-40 min-w-0 items-center justify-center overflow-hidden bg-white md:h-48">
          <video
            ref={videoRef}
            className={`h-full w-full object-cover transition-opacity duration-300 ${scannerSource === "demo" ? "opacity-0" : "opacity-100"}`}
            playsInline
            muted
            aria-label="Partner QR scanner camera preview"
          />
          {scannerSource === "demo" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white px-4">
              <div className="dp-demo-scan-card relative w-[154px] bg-white p-2.5 text-center shadow-[0_12px_32px_rgba(11,31,51,0.07),0_0_24px_rgba(200,169,106,0.07)] md:w-[174px]">
                <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Resident pass</div>
                <DemoQrCode code={DEMO_CARD_CODE} className="mx-auto mt-1 h-28 w-28 md:h-32 md:w-32" />
                <code className="mt-1 block font-mono text-[8px] font-semibold tracking-[0.08em] text-[#0B1F33]/58">
                  {DEMO_CARD_CODE}
                </code>
                {scannerStatus === "scanning" && (
                  <div className="pointer-events-none absolute inset-2">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[#C8A96A] shadow-[0_0_18px_rgba(200,169,106,0.55)] dp-agent-scan-line" />
                  </div>
                )}
                {scannerStatus === "verified" && (
                  <div className="absolute inset-0 grid place-items-center bg-white/68 backdrop-blur-[1px]">
                    <div className="grid h-14 w-14 place-items-center border border-[#C8A96A]/28 bg-white/84 text-[#0B1F33] shadow-[0_12px_28px_rgba(11,31,51,0.08),0_0_30px_rgba(200,169,106,0.18)]">
                      <Check className="h-8 w-8 stroke-[2.8]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {scannerStatus !== "scanning" && scannerSource !== "demo" && (
            <div className="absolute inset-0 grid place-items-center px-4 text-center">
              {scannerStatus === "verified" ? (
                <Check className="h-10 w-10 stroke-[2.8] text-[#C8A96A]" />
              ) : (
                <ScanLine className="h-9 w-9 text-[#C8A96A]" />
              )}
            </div>
          )}
          {scannerStatus === "scanning" && scannerSource !== "demo" && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-4 top-1/2 h-px bg-[#C8A96A] shadow-[0_0_18px_rgba(200,169,106,0.55)] dp-agent-scan-line" />
              <div className="absolute inset-4 border border-[#C8A96A]/28" />
              <div className="absolute left-5 top-5 h-6 w-6 border-l border-t border-[#C8A96A]" />
              <div className="absolute right-5 top-5 h-6 w-6 border-r border-t border-[#C8A96A]" />
              <div className="absolute bottom-5 left-5 h-6 w-6 border-b border-l border-[#C8A96A]" />
              <div className="absolute bottom-5 right-5 h-6 w-6 border-b border-r border-[#C8A96A]" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ResidentPassDashboard({
  savedPlaces,
  perkPlaces,
  eventRsvps,
  passPresented,
  walletAdded,
  savedCount,
  perkCount,
  rsvpCount,
  onOpenSaved,
  onOpenPerks,
  onOpenRsvps,
  onOpenPass,
}) {
  const savedList = savedPlaces.length ? savedPlaces : perkPlaces.slice(0, 3);
  const perkList = perkPlaces.length ? perkPlaces : savedPlaces.slice(0, 3);
  const preferredDistricts = Array.from(new Set([...savedList, ...perkList].map((place) => place.district).filter(Boolean))).slice(0, 3);
  const activityRows = [
    {
      label: "Saved",
      value: savedCount > 0 ? `${savedCount} saved` : "Start saving",
      emphasis: true,
      onClick: onOpenSaved,
    },
    {
      label: "Perks",
      value: perkCount > 0 ? `${perkCount} active` : "Perks nearby",
      emphasis: true,
      onClick: onOpenPerks,
    },
    {
      label: "RSVPs",
      value: rsvpCount > 0 ? `${rsvpCount} planned` : "Find events",
      emphasis: true,
      onClick: onOpenRsvps,
    },
    {
      label: "Pass",
      value: passPresented ? "Ready" : walletAdded ? "Wallet added" : "Tap to present",
      emphasis: true,
      onClick: onOpenPass,
    },
  ];

  return (
    <div className="mt-3 space-y-3">
      <section className="dp-info-section p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Resident dashboard</div>
        <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33]">Your downtown activity</h3>
        <p className="mt-1.5 text-[13px] leading-5 text-[#425466]">
          Your card keeps the places, perks, events, and nearby preferences you are most likely to use in one quick resident view.
        </p>
        <PanelInsightGrid
          columns="grid-cols-2 md:grid-cols-4"
          items={activityRows}
        />
      </section>

      <section className="dp-info-section p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Saved and useful nearby</div>
        <div className="mt-2 divide-y divide-[#0B1F33]/8">
          {savedList.slice(0, 4).map((place) => {
            const perk = getResidentPerkDetails(place);
            return (
              <div key={place.id} className="grid grid-cols-[1fr_auto] gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-[#0B1F33]">{place.name}</div>
                  <div className="mt-0.5 truncate text-[12px] text-[#425466]">{place.category || "Downtown place"} · {place.district}</div>
                </div>
                <div className="max-w-[140px] truncate text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C8A96A]">
                  {perk.offer}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dp-info-section p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Preferences</div>
        <div className="mt-2 grid gap-2 text-[13px] leading-5 text-[#425466] sm:grid-cols-3">
          <div><span className="font-semibold text-[#0B1F33]">Neighborhoods:</span> {preferredDistricts.length ? preferredDistricts.join(", ") : "Seaholm, Rainey, Congress"}</div>
          <div><span className="font-semibold text-[#0B1F33]">Best next move:</span> open saved places, show the card, or RSVP when plans firm up.</div>
          <div><span className="font-semibold text-[#0B1F33]">Resident signal:</span> dinner, happy hour, events, and local errands are ready from the map.</div>
        </div>
      </section>
    </div>
  );
}

function cleanPerkValue(value) {
  const text = String(value || "").trim();
  if (!text || /^(no active offer listed.*|no public deal listed.*|listed:\s*n\/a.*|n\/a)$/i.test(text)) return "";
  if (!/(\$|%|\boff\b|\bfree\b|\bcomplimentary\b|\bdiscount\b|\bdeal\b|\bperk\b|\bspecial\b|\bcredit\b|\brate\b|\boffer\b|\bresident\b)/i.test(text)) return "";
  return text;
}

function cleanDisplayCopy(value) {
  const text = String(value || "").trim();
  if (!text || /^(no active offer listed.*|no public deal listed.*|listed:\s*n\/a.*|n\/a)$/i.test(text)) return "";
  return text;
}

function hasActivePerkData(place) {
  const raw = place?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  return Boolean(place && (cleanPerkValue(embeddedPerk?.title || raw.deals_offers || place?.deals_offers) || getResidentFallbackOffer(place).title));
}

function isInKindPartner(place) {
  const text = placeText(place);
  return (
    text.includes("inkind") ||
    text.includes("in kind") ||
    text.includes("dining credit") ||
    text.includes("restaurant credit") ||
    text.includes("dining perk")
  );
}

function getResidentPerkDetails(place) {
  const raw = place?.raw || {};
  const legendsListing = getResolvedLegendsListing(place);
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    const listings = luxuryBuilding.listings || place?.listings || [];
    const panelContent = luxuryBuilding.panelContent || place?.panelContent || {};
    const activeText = listings.length === 1 ? "1 active listing" : `${listings.length} active listings`;
    const listingFacts = listings
      .slice(0, 4)
      .map((listing) => [listing.price, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "", listing.mls_number ? `MLS ${listing.mls_number}` : ""].filter(Boolean).join(" · "))
      .join(" • ");

    return {
      offer: "Want To Live Here?",
      value: place?.listingSummary || `${activeText}${place?.priceRange ? ` from ${place.priceRange}` : ""}`,
      description: panelContent.body || `${place?.name || "This downtown building"} has ${activeText}. Downtown Perks residents can review real listing details, compare nearby perks and places, and contact Legends Real Estate for showing options.`,
      terms: listingFacts || "Contact Legends Real Estate for availability, showing options, MLS details, and similar downtown properties.",
      validUntil: "",
      source: "",
      isActive: true,
      category: "Residential Property",
    };
  }
  if (legendsListing) {
    const detailText = [
      legendsListing.priceDisplay,
      legendsListing.beds ? `${legendsListing.beds} bd` : "",
      legendsListing.baths ? `${legendsListing.baths} ba` : "",
      legendsListing.sqftDisplay,
    ].filter(Boolean).join(" · ");

    return {
      offer: "Want To Live Here?",
      value: detailText || "Resident listing access",
      description: `${place?.name || legendsListing.address} is available through Legends Real Estate. Downtown Perks residents can contact Legends to discover availability, showing options, and property opportunities that may not always be easy to find on other listing sites.`,
      terms: "Use the contact form to ask about availability, showing times, private tour options, and similar downtown properties.",
      validUntil: "",
      source: "",
      isActive: true,
      category: "Residential Property",
    };
  }
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  const fallbackOffer = getResidentFallbackOffer(place);
  const listedOffer = cleanPerkValue(embeddedPerk?.title || raw.deals_offers || place?.deals_offers);
  const inKindPartner = isInKindPartner(place);
  const offer = listedOffer || fallbackOffer.title;
  const value = cleanPerkValue(embeddedPerk?.value || listedOffer) || fallbackOffer.value || "Resident card access";
  const description = inKindPartner
    ? cleanDisplayCopy(embeddedPerk?.description) ||
      cleanDisplayCopy(raw.alignment_to_downtown_perks) ||
      `${place?.name || "This inKind partner"} gives residents a simple dining reason to choose a nearby restaurant: easy value, a walkable plan, and a place worth saving for dinner or drinks.`
    : listedOffer
    ? cleanDisplayCopy(embeddedPerk?.description) ||
      cleanDisplayCopy(raw.alignment_to_downtown_perks) ||
      cleanDisplayCopy(raw.summary) ||
      fallbackOffer.description
    : fallbackOffer.description;
  const terms = inKindPartner
    ? cleanDisplayCopy(raw.terms || raw.perk_terms) || "Save it to your card, open it when you are nearby, and redeem when the inKind offer is active."
    : cleanDisplayCopy(raw.terms || raw.perk_terms) || fallbackOffer.terms;
  const validUntil = embeddedPerk?.expiresAt || raw.valid_until || raw.expires || "";
  const source = "";
  const isActive = embeddedPerk?.isActive !== false;
  const category = String(raw.category || place?.category || "Downtown place");

  return {
    offer,
    value,
    description,
    terms,
    validUntil,
    source,
    isActive,
    category,
  };
}

function formatResidentPerkHeading(value) {
  return String(value || "")
    .trim()
    .replace(/\S+/g, (word) => {
      if (/^[A-Z0-9&]+$/.test(word)) return word;
      return word
        .split(/(-|\/)/)
        .map((part) => {
          if (part === "-" || part === "/") return part;
          if (!part) return part;
          if (/^[A-Z0-9&]+$/.test(part)) return part;
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join("");
    });
}

function getResidentFallbackOffer(place) {
  const text = placeText(place);
  const district = place?.district || "Downtown Austin";
  const name = place?.name || "this place";
  const legendsListing = getLegendsListing(place);

  if (
    legendsListing ||
    text.includes("property") ||
    text.includes("apartment") ||
    text.includes("condo") ||
    text.includes("residential") ||
    text.includes("mls:") ||
    text.includes("listed:")
  ) {
    const listingDetail = legendsListing
      ? [legendsListing.priceDisplay, legendsListing.beds ? `${legendsListing.beds} bd` : "", legendsListing.baths ? `${legendsListing.baths} ba` : "", legendsListing.sqftDisplay].filter(Boolean).join(" · ")
      : "";
    return {
      title: "Want To Live Here?",
      value: listingDetail || "Listing and neighborhood context",
      description: legendsListing
        ? `${name} is a downtown home listing. Review the unit details, see what is walkable nearby, and contact Legends Real Estate when you want showing options.`
        : `${name} shows what daily life can feel like nearby: coffee, dinner, events, services, and resident access around ${district}.`,
      terms: legendsListing
        ? "Use the contact form to ask about availability, showing times, and what comes with the building."
        : "Use the map to compare nearby places, perks, and events connected to this property.",
    };
  }

  if (isInKindPartner(place)) {
    return {
      title: "Resident Dining Credit",
      value: "Resident dining value",
      description: `${name} gives residents a clear reason to choose a nearby restaurant through inKind: simple value, easy redemption, and a walkable place worth saving around ${district}.`,
      terms: "Save it to your Downtown Perks Card and redeem when the inKind offer is active.",
    };
  }

  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) {
    return {
      title: "Free Size Upgrade",
      value: "Resident coffee upgrade",
      description: `${name} is a good nearby coffee move for quick mornings, casual meetings, or a short walk through ${district}.`,
      terms: "Show your Downtown Perks Card before ordering if a resident offer is active.",
    };
  }

  if (text.includes("pizza")) {
    return {
      title: "Resident Pizza Offer",
      value: "Easy dinner option",
      description: `${name} works well for a quick dinner, group plan, or late decision near ${district}.`,
      terms: "Show your Downtown Perks Card before ordering if a resident offer is active.",
    };
  }

  if (text.includes("grocery") || text.includes("market") || text.includes("pantry")) {
    return {
      title: "Grocery Discount",
      value: "Resident shopping value",
      description: `${name} is a useful local grocery stop for coffee, snacks, pantry basics, wine, and quick downtown errands around ${district}.`,
      terms: "Show your Downtown Perks Card at checkout when a resident grocery discount is active.",
    };
  }

  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("pub")) {
    return {
      title: "Resident Cocktail Pricing",
      value: "Easy after-hours option",
      description: `${name} is a nearby option for drinks, music, or an after-dinner plan around ${district}.`,
      terms: "Show your Downtown Perks Card when you arrive if a resident offer is active.",
    };
  }

  if (text.includes("restaurant") || text.includes("dining") || text.includes("food") || text.includes("kitchen")) {
    return {
      title: "Complimentary Dessert",
      value: "Walkable dining option",
      description: `${name} is a useful nearby dining option when you want less searching and a clear next move in ${district}.`,
      terms: "Show your Downtown Perks Card before ordering or checking in if a resident offer is active.",
    };
  }

  if (text.includes("hotel") || text.includes("hospitality")) {
    return {
      title: "Preferred Resident Dining Access",
      value: "Local access context",
      description: `${name} can be useful for lounges, dining, stays, or guest plans near ${district}.`,
      terms: "Show your Downtown Perks Card and ask staff what resident access is available.",
    };
  }

  if (text.includes("event") || text.includes("music")) {
    return {
      title: "Priority Event Access",
      value: "Save or RSVP",
      description: `${name} is a nearby event to save when you are deciding what to do around ${district}.`,
      terms: "RSVP or show your Downtown Perks Card when a resident offer is available. Timing and capacity may vary.",
    };
  }

  if (text.includes("retail") || text.includes("store") || text.includes("eyewear") || text.includes("shop")) {
    return {
      title: "Exclusive In-Store Offer",
      value: "Retail access nearby",
      description: `${name} is a nearby shopping or appointment stop residents can keep in mind around ${district}.`,
      terms: "Show your Downtown Perks Card before checkout or booking if a resident offer is active.",
    };
  }

  return {
    title: "Resident Perk",
    value: "Save it or go now",
    description: `${name} is in the map so residents can quickly decide whether it fits the moment near ${district}.`,
    terms: "Save it, get directions, or show your Downtown Perks Card if a resident offer is available.",
  };
}

function BusinessServiceDetails({ place }) {
  const panel = place.raw?.resident_panel || {};
  const phone = place.raw?.contact_phone || place.phone;
  const gallery = resolveEntityGallery(place);

  return (
    <section className="mt-4 dp-info-section p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            <Building2 className="h-3.5 w-3.5 text-[#C8A96A]" />
            {panel.eyebrow || "Local service"}
          </div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33]">
            {panel.title || "Useful downtown service"}
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#425466]">
            {panel.description || place.raw?.summary || "Save this local service for later, get directions, or contact the business directly."}
          </p>
        </div>
        <div className="shrink-0 px-0 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-[#C8A96A]">
          Service
        </div>
      </div>

      <PanelInsightGrid
        columns="sm:grid-cols-3"
        items={[
          { label: "Address", value: place.address || "Downtown Austin", emphasis: true },
          { label: "Phone", value: phone || "Contact through map profile", emphasis: true },
          { label: "Best for", value: panel.bestFor || "Appointments, service, errands", emphasis: true },
        ]}
      />

      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {gallery.slice(1, 3).map((src) => (
            <div key={src} className="h-24 overflow-hidden bg-white p-1 shadow-[0_8px_20px_rgba(11,31,51,0.035),0_0_18px_rgba(200,169,106,0.03)]">
              <img
                src={src}
                alt={`${place.name} service context`}
                className="h-full w-full object-contain object-center"
                onError={handlePanelImageError}
              />
            </div>
          ))}
        </div>
      )}

    </section>
  );
}

function ResidentPerkDetails({ place }) {
  const perk = getResidentPerkDetails(place);
  const entityKind = getResidentEntityKind(place);
  const isProperty = entityKind === "property";
  const sectionLabel = isProperty ? "Property access" : "Resident perk";
  const destinationKind = getDestinationKind(place);
  const useText = isProperty
    ? perk.value || "Contact the listing team from the map."
    : destinationKind === "grocery"
      ? "Show your Downtown Perks Card at checkout."
    : perk.terms || "Show your Downtown Perks Card at checkout.";

  return (
    <section className="dp-destination-section dp-perk-module">
      <div className="dp-perk-module-copy text-left">
        <div className="dp-perk-module-meta">
          <Gift className="h-3.5 w-3.5 text-[#C8A96A]" />
          {sectionLabel}
        </div>
        <h3 className="dp-perk-module-title">
          {formatResidentPerkHeading(perk.offer)}
        </h3>
        <p className="dp-perk-module-description">
          {useText}
        </p>
      </div>
    </section>
  );
}

function getDestinationDistrictLabel(place) {
  const district = String(place?.district || place?.raw?.district || "Downtown Austin").trim();
  if (!district) return "Downtown Austin";
  return /district$/i.test(district) ? district : `${district} District`;
}

function getDestinationKind(place) {
  const text = placeText(place);
  const kind = getResidentEntityKind(place);
  if (kind === "property" || text.includes("listing") || text.includes("residential")) return "property";
  if (kind === "event" || text.includes("event") || text.includes("rsvp")) return "event";
  if (text.includes("grocery") || text.includes("market") || text.includes("pantry")) return "grocery";
  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) return "coffee";
  if (text.includes("hotel") || text.includes("hospitality")) return "hotel";
  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("brewery") || text.includes("beer")) return "nightlife";
  if (text.includes("restaurant") || text.includes("dining") || text.includes("pizza") || text.includes("food")) return "dining";
  if (text.includes("retail") || text.includes("store") || text.includes("shop")) return "retail";
  if (text.includes("civic") || text.includes("park") || text.includes("public")) return "civic";
  if (text.includes("brand") || text.includes("experience")) return "brand";
  return "place";
}

function getCuratedArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|•|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getWhyPeopleGoItems(place) {
  const kind = getDestinationKind(place);
  const raw = place?.raw || {};
  const curatedKnownFor = getCuratedArray(raw.knownFor || raw.known_for || place?.knownFor);
  if (curatedKnownFor.length) return curatedKnownFor.slice(0, 7).map((item) => item.replace(/\.$/, ""));

  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    const listings = luxuryBuilding.listings || place?.listings || [];
    const listingCount = listings.length ? `${listings.length} active listing${listings.length === 1 ? "" : "s"}` : "available homes";
    return [
      `Review ${listingCount} with real pricing and residence details.`,
      "Compare what is walkable nearby before you reach out.",
      "Contact Legends when you want availability, showing options, or a private tour.",
    ];
  }
  const legendsListing = getResolvedLegendsListing(place);
  if (legendsListing) {
    const facts = [
      legendsListing.priceDisplay,
      legendsListing.beds ? `${legendsListing.beds} bed` : "",
      legendsListing.baths ? `${legendsListing.baths} bath` : "",
      legendsListing.sqftDisplay,
    ].filter(Boolean).join(" · ");
    return [
      facts ? `See the actual listing details: ${facts}.` : "See the actual listing details before you tour.",
      "Check nearby restaurants, perks, and daily errands around the building.",
      "Ask Legends for current availability and a private showing.",
    ];
  }
  const byKind = {
    grocery: ["Coffee", "Wine", "Groceries", "Grab-and-go meals", "Everyday essentials"],
    coffee: ["Morning coffee", "Remote work", "Quick meetings", "Grab-and-go stops", "Daily routines"],
    nightlife: ["Cocktails", "Live music", "Weekend nights", "After-work drinks", "Group gatherings"],
    dining: ["Lunch meetings", "Happy hour", "Dinner reservations", "Date nights", "Weekend dining"],
    hotel: ["Downtown stays", "Weekend visits", "Business travel", "Rooftop experiences", "Local recommendations"],
    property: ["Walkability", "Downtown views", "Resident amenities", "Trail access", "Everyday convenience"],
    event: ["Plans tonight", "Friends nearby", "A reason to get out", "Downtown energy", "Something worth saving"],
    retail: ["Shopping", "Quick errands", "Appointments", "Useful local stops", "Resident value"],
    civic: ["Public programs", "Neighborhood information", "Events", "Public improvements", "Resident resources"],
    brand: ["Brand experience", "Community event", "Limited-time offer", "Downtown partnership", "Something to try"],
    place: ["A useful nearby stop", "A walkable plan", "Resident access", "Local context", "Something worth saving"],
  };
  return byKind[kind] || byKind.place;
}

function getNeighborhoodNarrativeItems(place) {
  const kind = getDestinationKind(place);
  const raw = place?.raw || {};
  const curatedNarrative = cleanDisplayCopy(raw.neighborhood_narrative || raw.neighborhoodNarrative || place?.neighborhoodNarrative);
  if (curatedNarrative) {
    return curatedNarrative
      .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const legendsListing = getResolvedLegendsListing(place);
  if (luxuryBuilding || legendsListing) {
    return [
      "More than a place to live.",
      "This building places residents close to the restaurants, trails, events, and everyday places that make downtown Austin feel connected.",
      "Coffee before work. A walk along the lake. Dinner without driving. Events without planning ahead.",
    ];
  }

  const byKind = {
    grocery: [
      "Part quick errand.",
      "Part neighborhood routine.",
      "Residents use stops like this for coffee, wine, pantry basics, and the small things that make downtown easier.",
    ],
    coffee: [
      "Part coffee shop.",
      "Part neighborhood meeting place.",
      "Residents stop in before work. Visitors discover it while exploring downtown. Regulars come back because they know exactly what they are getting.",
    ],
    nightlife: [
      "When the workday ends, places like this become part of the downtown routine.",
      "Meet friends. Stay for another round. Walk somewhere new. Walk home.",
    ],
    dining: [
      "More than a place to eat.",
      "This location sits within walking distance of residences, hotels, offices, and downtown events.",
      "Useful for lunch meetings, dinner reservations, happy hours, and spontaneous plans.",
    ],
    hotel: [
      "A stay downtown should extend beyond the lobby.",
      "This location places guests within walking distance of restaurants, nightlife, parks, coffee shops, and local experiences.",
    ],
    property: [
      "More than a place to live.",
      "This building places residents close to the places that make downtown Austin feel connected.",
      "Coffee before work. A walk along the lake. Dinner without driving. Events without planning ahead.",
    ],
    event: [
      "A good downtown event makes the rest of the night easier.",
      "Save the plan, see what is nearby, and make the next move without opening another app.",
    ],
    retail: [
      "Useful local stops make downtown feel more livable.",
      "Save it for errands, appointments, shopping, and the moments when nearby matters.",
    ],
    civic: [
      "Downtown works better when public information is easy to find.",
      "Use this for neighborhood updates, events, programs, and resident resources.",
    ],
    brand: [
      "The best brand moments feel like part of downtown.",
      "Use this to find a local experience, community event, limited-time offer, or useful partnership nearby.",
    ],
    place: [
      "A useful downtown stop should make the next decision easier.",
      "Save it, visit it, or use it as a starting point for what is nearby.",
    ],
  };
  return byKind[kind] || byKind.place;
}

function getPanelContextSentence(place, mode = "resident") {
  const kind = getDestinationKind(place);
  const district = String(place?.district || "Downtown Austin").replace(/\s+District$/i, "");
  const summary = stripPanelPlaceholderCopy(place?.summary || place?.raw?.summary || place?.description || place?.raw?.description || "");
  const curatedSummary = cleanDisplayCopy(place?.raw?.downtown_perks_summary || place?.raw?.listing_summary || "");
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const legendsListing = getResolvedLegendsListing(place);

  if (mode === "partner") {
    const partnerCopy = {
      coffee: "A morning stop people can use before work, between meetings, or while exploring downtown.",
      grocery: "An everyday stop for nearby residents who need quick essentials without leaving downtown.",
      dining: "A walkable place for lunch, dinner, happy hour, and the plans that happen in between.",
      nightlife: "A nearby option for after-work drinks, group plans, and nights that keep moving.",
      hotel: "A downtown stay connected to restaurants, parks, coffee, nightlife, and local recommendations.",
      property: "A residential address people understand through what is walkable around it.",
      event: "A nearby plan people can save, attend, and build the rest of the day around.",
      retail: "A useful local stop people can save for shopping, errands, appointments, and repeat visits.",
      civic: "A community resource for public information, programs, events, and resident participation.",
      brand: "A downtown brand experience that gives people something local to try, save, or attend.",
      place: "A nearby place people can use to decide where to go next.",
    };
    return truncatePanelCopy(partnerCopy[kind] || partnerCopy.place, 100);
  }

  if (luxuryBuilding) {
    const listings = luxuryBuilding.listings || place?.listings || [];
    const count = listings.length ? `${listings.length} available listing${listings.length === 1 ? "" : "s"}` : "available listings";
    return truncatePanelCopy(`Live close to trails, groceries, coffee, dinner, and everyday downtown plans, with ${count} currently available.`);
  }

  if (legendsListing) {
    return truncatePanelCopy(`A Downtown Austin residence with real MLS details and neighborhood context before you schedule a tour.`);
  }

  if (isHappyHourEntity(place)) {
    return truncatePanelCopy(`${place?.venueName || place?.name || "This place"} has food and drink specials worth saving when you are already nearby.`);
  }

  if (curatedSummary) return truncatePanelCopy(curatedSummary);
  if (summary) return truncatePanelCopy(summary);

  const byKind = {
    grocery: "Coffee, wine, groceries, and everyday essentials without leaving downtown.",
    coffee: "Coffee before the next plan and one of downtown's easiest morning stops.",
    nightlife: "Drinks, patios, and evening plans when you are already nearby.",
    dining: "A walkable place for dinner, group plans, or a quick downtown bite.",
    hotel: "Downtown stays with nearby dining, events, and local recommendations.",
    property: `Residential context in ${district} with nearby places and daily convenience.`,
    event: "A nearby reason to RSVP, save the plan, and show up when the timing works.",
    retail: "A useful local stop for appointments, errands, shopping, or repeat visits.",
    civic: "A downtown place for public space, community updates, and participation.",
    brand: "A local brand moment connected to downtown culture and nearby plans.",
    place: DISTRICT_CONTEXT[district] || "A useful downtown place with context, directions, and next steps.",
  };
  return truncatePanelCopy(byKind[kind] || byKind.place);
}

function getWhyGoChips(place) {
  const kind = getDestinationKind(place);
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) return ["Walkability", "Downtown Views", "Trail Access", "Daily Convenience"];
  if (getResolvedLegendsListing(place)) return ["Walkability", "Schedule Tour", "Nearby Coffee", "Contact Legends"];
  const byKind = {
    grocery: ["Coffee", "Breakfast", "Wine", "Quick Stop"],
    coffee: ["Coffee", "Breakfast", "Work Break", "Walkable"],
    nightlife: ["Drinks", "Patio", "Night Out", "Friends"],
    dining: ["Dinner", "Groups", "Walkable", "Perk"],
    hotel: ["Guests", "Lobby", "Dining", "Downtown Base"],
    property: ["Listings", "Tours", "Nearby Perks", "Want To Live Here"],
    event: ["Tonight", "RSVP", "Friends", "Nearby"],
    retail: ["Shopping", "Errands", "Appointments", "Perk"],
    civic: ["Art", "Parks", "Tour", "Downtown"],
    brand: ["Experience", "Try It", "Limited", "Nearby"],
    place: ["Nearby", "Useful", "Save", "Walkable"],
  };
  return byKind[kind] || byKind.place;
}

function getWhyGoSectionTitle(place) {
  if (getDestinationKind(place) === "property") return "Resident use cases";
  if (getLuxuryPresenceBuilding(place) || getResolvedLegendsListing(place)) return "Next Steps";
  return "Why Go";
}

function getEntityAssistantPrompts(place, mode) {
  if (mode === "partner") {
    return ["Activity", "Campaigns", "Events", "Trends"];
  }
  if (getLuxuryPresenceBuilding(place)) {
    return ["Compare listings", "Nearby perks", "Tour plan", "Ask Legends"];
  }
  if (getResolvedLegendsListing(place)) {
    return ["Listing details", "Nearby places", "Tour plan", "Ask Legends"];
  }
  return ["Nearby Coffee", "Tonight", "Happy Hour", "Resident Perks"];
}

function getNearbyAreaItems(place, places = []) {
  return getNearbyAreaPlaces(place, places).map(({ candidate, candidateKind, perk, hasPerk }) => {
    const perkText = hasPerk ? getExplicitPerkTitle(candidate) : "";
    return {
      label: candidate.name,
      value: [getNearbyKindLabel(candidate, candidateKind), candidate.district || "Downtown Austin", perkText ? `Resident offer: ${perkText}` : ""].filter(Boolean).join(" · "),
    };
  });
}

function getNearbyAreaPlaces(place, places = [], limit = 4) {
  const originCoords = getPlaceCoords(place);
  if (!originCoords) return [];
  const seen = new Set();
  return places
    .filter((candidate) => candidate?.id !== place?.id)
    .filter((candidate) => getPlaceCoords(candidate))
    .filter((candidate) => getDestinationKind(candidate) !== "property")
    .map((candidate) => {
      const candidateKind = getDestinationKind(candidate);
      const perk = getResidentPerkDetails(candidate);
      const hasPerk = hasActivePerkData(candidate);
      let score = 0;
      if (candidate.district && candidate.district === place?.district) score += 5;
      if (["dining", "coffee", "nightlife", "grocery", "hotel", "retail", "event"].includes(candidateKind)) score += 4;
      if (hasPerk) score += 3;
      score -= getMapDistanceScore(place, candidate) * 100000;
      return { candidate, score, candidateKind, perk, hasPerk };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(({ candidate }) => {
      const name = String(candidate.name || "").trim().toLowerCase();
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .slice(0, limit);
}

function getNearbyKindLabel(candidate, candidateKind) {
  const text = placeText(candidate);
  if (candidateKind === "coffee") return "Coffee nearby";
  if (candidateKind === "grocery") return "Grocery nearby";
  if (candidateKind === "hotel") return "Hotel nearby";
  if (candidateKind === "event") return "Event nearby";
  if (candidateKind === "nightlife") return "Drinks nearby";
  if (candidateKind === "dining") {
    if (text.includes("sushi") || text.includes("uchib")) return "Sushi nearby";
    if (text.includes("ceviche") || text.includes("fajita") || text.includes("peacock")) return "Dinner nearby";
    return "Dining nearby";
  }
  if (candidateKind === "retail") return "Shopping nearby";
  if (candidateKind === "civic") return "Downtown stop";
  return "Nearby";
}

function getExplicitPerkTitle(candidate) {
  const raw = candidate?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  const title = cleanPerkValue(embeddedPerk?.title || raw.deals_offers || candidate?.deals_offers);
  if (!title) return "";
  const generic = ["night-out nearby", "coffee nearby", "pizza plan", "want to live here?", "resident perk"];
  return generic.includes(title.toLowerCase()) ? "" : formatResidentPerkHeading(title);
}

function getNearbyContextItems(place, places = []) {
  const district = String(place?.district || "Downtown Austin").replace(/\s+District$/i, "");
  const kind = getDestinationKind(place);
  const raw = place?.raw || {};
  const curatedNearby = getCuratedArray(raw.nearby || raw.nearbyPlaces || raw.nearby_places || place?.nearby);
  if (curatedNearby.length) {
    return curatedNearby.slice(0, 5).map((label) => ({ label, value: "Nearby" }));
  }
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    const nearbyItems = getNearbyAreaItems(place, places);
    return nearbyItems.length ? nearbyItems : [
      { label: "Trader Joe's", value: "Grocery nearby · Seaholm" },
      { label: "Merit Coffee", value: "Coffee nearby · Seaholm" },
      { label: "Whole Foods", value: "Grocery nearby · Downtown Core" },
      { label: "Ruiz Salon", value: "Wellness nearby · Seaholm" },
    ];
  }
  const legendsListing = getResolvedLegendsListing(place);
  if (legendsListing) {
    const nearbyItems = getNearbyAreaItems(place, places);
    return nearbyItems.length ? nearbyItems : [
      { label: "Austin Proper Hotel", value: "Hotel nearby · 2nd Street" },
      { label: "ACL Live", value: "Music venue nearby · 2nd Street" },
      { label: "Royal Blue Grocery", value: "Grocery nearby · Resident grocery discount" },
    ];
  }
  if (kind === "property") {
    const nearbyItems = getNearbyAreaItems(place, places);
    return nearbyItems.length ? nearbyItems : [`In ${district}`, "Contact the listing team for current availability", "Compare building context from the map"];
  }
  if (kind === "grocery") {
    return [`2 min from ${district}`, "4 min from nearby lunch plans", "5 min from downtown errands"];
  }
  const nearbyFallbacks = DISTRICT_NEARBY_FALLBACKS[district] || DISTRICT_NEARBY_FALLBACKS["Downtown Austin"];
  return nearbyFallbacks.slice(0, 5).map((label) => ({ label, value: district }));
}

function getContextSectionTitle(place) {
  if (getLuxuryPresenceBuilding(place)) return "Nearby Places";
  if (getResolvedLegendsListing(place)) return "Nearby Places";
  return "Nearby";
}

function normalizeContextItem(item) {
  if (item && typeof item === "object") {
    return {
      label: item.label || "",
      value: item.value || "",
    };
  }
  return { label: "", value: String(item || "") };
}

function getListingFactLine(listing) {
  if (!listing) return "";
  return [
    listing.priceDisplay || listing.price,
    listing.beds ? `${listing.beds} bed` : "",
    listing.baths ? `${listing.baths} bath` : "",
    listing.sqftDisplay || (listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : ""),
    listing.mlsNumber || listing.mls_number ? `MLS ${listing.mlsNumber || listing.mls_number}` : "",
  ].filter(Boolean).join(" · ");
}

function buildEntityAssistantAnswer(prompt, selected, localResults = [], mode = "resident") {
  const pickedPlaces = localResults.filter((place) => place?.id && place.id !== selected?.id).slice(0, 4);
  const legendsListing = getResolvedLegendsListing(selected);
  const luxuryBuilding = getLuxuryPresenceBuilding(selected);

  if (mode === "partner") {
    return buildAgenticMapAnswer(prompt, [selected, ...pickedPlaces], mode, selected?.district || "Downtown Austin", "All");
  }

  if (legendsListing) {
    const facts = getListingFactLine(legendsListing);
    const nearbyNames = pickedPlaces.map((place) => place.name).filter(Boolean).slice(0, 3);
    return {
      title: `About ${selected?.name || legendsListing.address}`,
      body: `${facts ? `${facts}. ` : ""}${nearbyNames.length ? `Nearby, look at ${nearbyNames.join(", ")} for dinner, errands, or resident perks around the showing. ` : ""}For next steps, ask Legends Real Estate for current availability, showing windows, and similar downtown homes that may not be easy to find elsewhere.`,
      picks: pickedPlaces,
    };
  }

  if (luxuryBuilding) {
    const listings = luxuryBuilding.listings || selected?.listings || [];
    const firstListings = listings.slice(0, 3).map((listing) => {
      const unit = listing.unit ? `#${listing.unit}` : "Residence";
      return `${unit}: ${getListingFactLine(listing)}`;
    });
    return {
      title: `Listings at ${selected?.name}`,
      body: `${firstListings.length ? `${firstListings.join(" | ")}. ` : ""}Use the nearby places below to compare daily life around the building, then contact Legends for availability and private tour options.`,
      picks: pickedPlaces,
    };
  }

  return buildAgenticMapAnswer(prompt, [selected, ...pickedPlaces], mode, selected?.district || "Downtown Austin", "All");
}

function getRelatedPlaces(place, places = []) {
  const district = place?.district;
  const kind = getDestinationKind(place);
  const compatibleKinds = {
    grocery: ["grocery", "retail", "coffee"],
    coffee: ["coffee", "grocery", "dining"],
    nightlife: ["nightlife", "dining", "event"],
    dining: ["dining", "nightlife", "coffee"],
    hotel: ["hotel", "dining", "nightlife"],
    retail: ["retail", "grocery", "coffee"],
    event: ["event", "nightlife", "civic"],
    brand: ["brand", "retail", "event"],
    civic: ["civic", "event", "place"],
    property: ["property", "grocery", "coffee", "dining", "nightlife"],
    place: ["place", "dining", "coffee", "retail"],
  };
  const allowedKinds = compatibleKinds[kind] || compatibleKinds.place;
  const placeName = String(place?.name || "").trim().toLowerCase();
  const seenNames = new Set();
  const related = places
    .filter((candidate) => candidate?.id !== place?.id)
    .map((candidate) => {
      const candidateKind = getDestinationKind(candidate);
      let score = 0;
      if (candidateKind === kind) score += 4;
      else if (allowedKinds.includes(candidateKind)) score += 3;
      if (candidate.district && candidate.district === district) score += 1;
      if (hasActivePerkData(candidate)) score += 1;
      if (kind !== "property" && candidateKind === "property") score -= 5;
      return { candidate, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score || String(a.candidate.name).localeCompare(String(b.candidate.name)))
    .map((item) => item.candidate)
    .filter((candidate) => {
      const name = String(candidate.name || "").trim().toLowerCase();
      if (!name || name === placeName || seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });
  return related.slice(0, 6);
}

function DestinationSection({ title, children, className = "", support = "" }) {
  return (
    <section className={`dp-destination-section ${className}`}>
      <h3>{title}</h3>
      {support && <p className="dp-destination-section-support">{support}</p>}
      {children}
    </section>
  );
}

function DestinationHero({ place, mode }) {
  return (
    <motion.div
      initial={{ scale: 1.04 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="dp-destination-hero"
    >
      <img
        src={getLifestyleImage(place, mode)}
        alt={`${place.name} downtown context`}
        onError={handlePanelImageError}
        style={{ objectPosition: getPanelImageObjectPosition(place) }}
      />
      <div className="dp-destination-hero-overlay">
        <div className="dp-destination-hero-meta">{getPanelMetaLine(place)}</div>
        <h2>{place.name}</h2>
        <p>{getDestinationLocationLine(place)}</p>
      </div>
    </motion.div>
  );
}

function getDestinationLocationLine(place) {
  const district = getDestinationDistrictLabel(place);
  const rawAddress = String(place?.address || place?.raw?.address || "").replace(/,\s*(Austin|TX|78701).*$/i, "").trim();
  if (rawAddress && !/downtown austin/i.test(rawAddress)) return `${rawAddress} · ${district}`;
  return district;
}

function PanelContext({ place, mode }) {
  const narrativeItems = getNeighborhoodNarrativeItems(place);
  return (
    <section className="dp-destination-section dp-property-opening-section dp-property-narrative-section">
      <div className="dp-drawer-meta-line">{getPanelMetaLine(place)}</div>
      <p className="dp-why-people-go">{getPanelContextSentence(place, mode)}</p>
      {narrativeItems.length > 0 && (
        <div className="dp-neighborhood-narrative" aria-label="Neighborhood narrative">
          {narrativeItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function getWhyGoActionPrompt(chip, place) {
  const name = place?.name || "this listing";
  const byChip = {
    "Available Listings": `Show the active listing details for ${name}, including price, beds, baths, square footage, and the best next step.`,
    "Private Tour": `Help me plan a private tour for ${name}. Include what to ask Legends and what nearby places matter before or after the showing.`,
    "Listing Details": `Summarize the actual listing details for ${name}: price, beds, baths, square footage, MLS details, and what makes the location useful.`,
    "Schedule Tour": `Help me request a private tour for ${name} and explain what I should ask Legends before seeing it.`,
    "Nearby Perks": `Show nearby restaurants, perks, and useful places around ${name} that matter for daily life.`,
    "Want To Live Here": `What should I know if I want to live at ${name}?`,
    "Ask Legends": `What should I ask Legends Real Estate about ${name}?`,
    "Contact Legends": `What should I include when contacting Legends Real Estate about ${name}?`,
  };
  return byChip[chip] || `${chip} for ${name}`;
}

function WhyGoChips({ place, onAsk, onContact }) {
  const contactLabels = new Set(["Private Tour", "Schedule Tour", "Ask Legends", "Contact Legends", "Want To Live Here"]);
  return (
    <DestinationSection title={getWhyGoSectionTitle(place)}>
      <div className="dp-destination-chip-row">
        {getWhyGoChips(place).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              if (contactLabels.has(chip) && typeof onContact === "function") {
                onContact();
              }
              if (typeof onAsk === "function") {
                onAsk(getWhyGoActionPrompt(chip, place));
              }
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </DestinationSection>
  );
}

function KnownForSection({ place, mode = "resident" }) {
  const items = getWhyPeopleGoItems(place).slice(0, 7);
  if (!items.length) return null;
  const isPartnerProperty = mode === "partner" && getDestinationKind(place) === "property";
  const title = isPartnerProperty ? "What residents value" : "Known For";
  return (
    <DestinationSection title={title}>
      <ul className="dp-destination-list dp-destination-rail-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </DestinationSection>
  );
}

function NearbyContext({ place, places = [], onSelect }) {
  if (getDestinationKind(place) === "property") {
    return <PropertyNearbyRail place={place} places={places} onSelect={onSelect} />;
  }

  return (
    <DestinationSection title={getContextSectionTitle(place)}>
      <ul className="dp-destination-list dp-destination-rail-list dp-context-detail-list">
        {getNearbyContextItems(place, places).map((item, index) => {
          const normalized = normalizeContextItem(item);
          return (
            <li key={`${normalized.label}-${normalized.value}-${index}`}>
              {normalized.label && <span className="dp-context-label">{normalized.label}</span>}
              <span className="dp-context-value">{normalized.value}</span>
            </li>
          );
        })}
      </ul>
    </DestinationSection>
  );
}

function getPropertyNearbyCards(place, places = []) {
  const preferredCards = [
    { title: "P6", image: "/images/map-entities/perks/partner_hotel_rooftop_1779052803267.png", meta: "Rooftop nearby · Lady Bird Lake", curated: true },
    { title: "YETI", image: "/images/map-entities/brand-yeti/KACnwRHgns9AKAjC80eLAnpKWqYnwlvx8g5CH9QrlaJuaqdNuJmNXBMU0TuOPcpZwy1uxKQW8GeW2AtyfWvVGKWK-Mhpm6HuXRzDNSNO7DrlsL4X_aDJzqL1ftIZB8YjvoadSXwpXWPdwOnhnl9HK-KvIKi1e6ySO3B6dwG5upArEDFtGW0pv4VK-QUAvyR7.jpeg", meta: "Brand nearby · Lady Bird Lake · Resident engraving offer", curated: true },
    { title: "Fine Eyewear", image: "/images/map-entities/brand-fine-eyewear/ochialli.webp", meta: "Shopping nearby · Congress · Styling offer", curated: true },
    { title: "Four Seasons", image: "/hotels/four-seasons.webp", meta: "Hotel nearby · Congress · Spa and dining access", curated: true },
  ];
  const seen = new Set();
  const preferred = preferredCards.map((card) => {
    const candidate = places.find((placeCandidate) => String(placeCandidate?.name || "").toLowerCase().includes(card.title.toLowerCase()));
    if (!candidate) return { ...card, place: null };
    const kind = getNearbyKindLabel(candidate, getDestinationKind(candidate));
    const perk = getExplicitPerkTitle(candidate);
    return {
      curated: true,
      place: candidate,
      title: card.title,
      image: getLifestyleImage(candidate, "resident"),
      meta: card.meta || [kind, candidate.district, perk].filter(Boolean).join(" · "),
    };
  });
  const nearby = getNearbyAreaPlaces(place, places, 8).map((item) => item.candidate);
  return [...preferred, ...nearby]
    .filter((item) => {
      const candidate = item?.place ? item.place : item;
      const title = item?.title || candidate?.name || "";
      const key = String(candidate?.id || title).toLowerCase();
      if (!key || seen.has(key) || candidate?.id === place?.id) return false;
      seen.add(key);
      if (item?.curated) return true;
      return !candidate || getDestinationKind(candidate) !== "property";
    })
    .slice(0, 6)
    .map((item) => {
      if (!item?.id && item?.title) return item;
      const candidate = item;
      const kind = getNearbyKindLabel(candidate, getDestinationKind(candidate));
      const perk = getExplicitPerkTitle(candidate);
      return {
        place: candidate,
        title: shortenEntityTitle(candidate.name),
        image: getLifestyleImage(candidate, "resident"),
        meta: [kind, candidate.district, perk].filter(Boolean).join(" · "),
      };
    });
}

function PropertyNearbyRail({ place, places = [], onSelect }) {
  const items = getPropertyNearbyCards(place, places);
  if (!items.length) return null;
  return (
    <DestinationSection
      title="Nearby places"
      className="dp-property-nearby-section"
      support="Places residents can walk to, save, visit, or use as part of their downtown routine."
    >
      <div className="dp-property-image-rail">
        {items.map((item) => (
          <button key={item.place?.id || item.title} type="button" className="dp-property-nearby-card" onClick={() => item.place && onSelect?.(item.place)}>
            <img src={item.image} alt="" onError={handlePanelImageError} />
            <span>
              <strong>{shortenEntityTitle(item.title)}</strong>
              <em>{item.meta}</em>
            </span>
          </button>
        ))}
      </div>
    </DestinationSection>
  );
}

function shortenEntityTitle(value) {
  const text = String(value || "").trim();
  return text
    .replace(/\s+(Apartments|Residences|Condominiums|Condominium|Residential|Property)$/i, "")
    .replace(/\s+Austin$/i, "")
    .replace(/\s+-\s+Austin$/i, "");
}

function PeopleAlsoVisit({ place, places, onSelect }) {
  const related = getRelatedPlaces(place, places);
  if (!related.length) return null;
  const title = getResidentEntityKind(place) === "property" ? "Similar buildings" : "Similar Places";
  return (
    <DestinationSection title={title} className="dp-related-section">
      <div className="dp-related-rail">
        {related.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item)} className="dp-related-place">
            <img src={getLifestyleImage(item, "resident")} alt="" onError={handlePanelImageError} />
            <span>{getResidentEntityKind(place) === "property" ? shortenEntityTitle(item.name) : item.name}</span>
          </button>
        ))}
      </div>
    </DestinationSection>
  );
}

function EntityAssistant({ place, mode, answer, loading, onAsk, onClose, onSelect }) {
  const prompts = getEntityAssistantPrompts(place, mode);

  return (
    <DestinationSection title="Ask Downtown Perks" className="dp-entity-assistant">
      <div className="dp-destination-chip-row">
        {prompts.map((prompt) => (
          <button key={prompt} type="button" onClick={() => onAsk(prompt)} disabled={loading}>
            {prompt}
          </button>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="dp-entity-answer"
            role="status"
            aria-live="polite"
          >
            <button type="button" onClick={onClose} aria-label="Close answer">
              <X className="h-3.5 w-3.5" />
            </button>
            <h4>{answer.title}</h4>
            <p>{answer.body}</p>
            {answer.picks?.length > 0 && (
              <div className="dp-related-rail">
                {answer.picks.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelect(item)} className="dp-related-place is-compact">
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DestinationSection>
  );
}

function HappyHourDetails({ place }) {
  const happyHour = place.raw?.happyHour || place.happyHour || {};
  const days = happyHour.days || "This week";
  const time = happyHour.time || "Happy hour window";
  const offer = happyHour.offer || "Resident happy hour offer";
  const details = happyHour.details || place.raw?.summary || "A nearby happy hour for residents looking for an easy place to start.";
  const redemption = happyHour.redemption || "Show your Downtown Perks Card when you arrive.";

  return (
    <section className="mt-4 dp-info-section p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
            <Gift className="h-3.5 w-3.5 text-[#C8A96A]" />
            Offer details
          </div>
          <p className="mt-1.5 text-[12px] leading-5 text-[#0B1F33]/66 md:text-[13px]">{details}</p>
        </div>
        <div className="shrink-0 dp-map-status-badge px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.09em]">
          Live
        </div>
      </div>

      <PanelInsightGrid
        columns="sm:grid-cols-3"
        items={[
          { label: "When", value: `${days} · ${time}`, emphasis: true },
          { label: "Offer", value: offer, emphasis: true },
          { label: "Use it", value: redemption },
        ]}
      />
    </section>
  );
}

function WaterlooDetails({ place, mode }) {
  const pin = place.raw?.waterlooPin || place.waterlooPin || place.raw?.waterlooCampaignPin || place.waterlooCampaignPin;
  if (!pin && !place.raw?.isWaterlooPark && !place.isWaterlooPark) return null;
  const drawerCopy = pin?.drawerCopy || pin?.campaignCardCopy || place.raw?.drawerCopy || place.drawerCopy || place.summary;
  const tags = pin?.tags || place.tags || ["Waterloo Park", "Events", "Outdoors"];
  const isPartner = mode === "partner";

  return (
    <DestinationSection title="Waterloo Park">
      <div className="space-y-4">
        <p className="whitespace-pre-line text-[13px] leading-6 text-[#0B1F33]/68">{drawerCopy}</p>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Good for</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.slice(0, 6).map((tag) => (
              <span key={tag} className="rounded-[5px] border border-[#0B1F33]/[0.08] px-2 py-1 text-[10px] font-medium text-[#0B1F33]/58">
                {tag}
              </span>
            ))}
          </div>
        </div>
        {isPartner && (
          <div className="rounded-[6px] border border-[#0B1F33]/[0.08] bg-white p-3">
            <p className="text-[12px] leading-5 text-[#0B1F33]/66">
              Use this placement to show up around Waterloo Park when people are already nearby for events, walks, concerts, classes, and weekend plans.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["Create Campaign Placement", "Promote an Event"].map((label) => (
                <button key={label} type="button" className="h-9 rounded-[6px] border border-[#0B1F33]/[0.08] bg-white text-[12px] font-medium text-[#0B1F33]">
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DestinationSection>
  );
}

function isDaaTourPlace(place) {
  return Boolean(place?.raw?.isDaaArtParksTour || place?.isDaaArtParksTour || place?.raw?.daaTourStop || place?.daaTourStop);
}

function getDaaStopFromPlace(place) {
  return place?.raw?.daaTourStop || place?.daaTourStop || null;
}

function DaaTourDetails({ place, places = [], onSelect, savedIds, onSave }) {
  const stop = getDaaStopFromPlace(place);
  if (!stop) return null;

  const stopNumber = String(stop.stopNumber).padStart(2, "0");
  const isSaved = savedIds?.has?.(place.id);
  const nearbyPlaces = (stop.nearbyStops || [])
    .map((stopId) => places.find((candidate) => candidate.id === stopId) || getDaaTourStopById(stopId))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <DestinationSection title="DAA Civic Partner" support={`Stop ${stopNumber} of ${DAA_TOUR_STOP_COUNT}`}>
        <div className="space-y-4">
          <p className="max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/70">{stop.daaIntro}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Location", stop.locationLabel],
              ["Artist", stop.artist],
              ["Year", stop.year],
            ].map(([label, value]) => (
              <div key={label} className="border-t border-[rgba(11,31,51,.06)] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{label}</div>
                <p className="mt-1 text-[13px] leading-5 text-[#0B1F33]/72">{value || "Downtown Austin"}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(11,31,51,.06)] pt-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Description</div>
            <p className="mt-2 max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/72">{stop.description}</p>
          </div>
          <div className="border-t border-[rgba(11,31,51,.06)] pt-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Why Stop Here</div>
            <p className="mt-2 max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/72">{stop.whyStopHere}</p>
          </div>
        </div>
      </DestinationSection>

      <DestinationSection title="DAA Explorer" support="Tell DAA What You Think">
        <div className="space-y-4">
          <div>
            <h4 className="text-[16px] font-semibold leading-tight text-[#0B1F33]">Visited this stop?</h4>
            <p className="mt-2 max-w-[42ch] text-[13px] leading-6 text-[#0B1F33]/70">
              Check in and share a quick thought about your downtown experience. Your feedback helps the Downtown Austin Alliance understand what people enjoy,
              what they want more of, and how downtown can continue to improve.
            </p>
            <p className="mt-2 text-[12px] font-medium text-[#0B1F33]/54">Takes less than 15 seconds.</p>
          </div>
          <div className="flex snap-x gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {daaExplorerQuestions.map((item) => (
              <div key={item.id} className="min-w-[210px] snap-start border-t border-[rgba(11,31,51,.06)] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{item.optional ? "Optional" : "Question"}</div>
                <p className="mt-1 text-[13px] leading-5 text-[#0B1F33]/76">{item.question}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to={`/card/explorer/daa?stop=${encodeURIComponent(stop.id)}`} className="dp-panel-action dp-primary-action">
              Check In & Share
            </Link>
            <button type="button" onClick={onSave} className="dp-panel-action">
              {isSaved ? "Saved For Later" : "Save For Later"}
            </button>
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
              Get Directions
            </a>
            <Link to="/card/explorer/daa" className="dp-panel-action">
              Explore All 48 Stops
            </Link>
          </div>
        </div>
      </DestinationSection>

      <DestinationSection title="Next Nearby Stops">
        <div className="flex snap-x gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          {nearbyPlaces.map((nearby) => {
            const nearbyStop = nearby.raw?.daaTourStop || nearby.daaTourStop || nearby;
            const nearbyPlace = nearby.raw ? nearby : places.find((candidate) => candidate.id === nearbyStop.id);
            return (
              <button
                key={nearbyStop.id}
                type="button"
                onClick={() => nearbyPlace && onSelect(nearbyPlace)}
                className="min-w-[190px] snap-start rounded-[8px] border border-[rgba(11,31,51,.06)] bg-white/78 p-3 text-left transition hover:-translate-y-px"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">
                  Stop {String(nearbyStop.stopNumber).padStart(2, "0")}
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-5 text-[#0B1F33]">{nearbyStop.name}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/56">{nearbyStop.district}</p>
              </button>
            );
          })}
        </div>
      </DestinationSection>
    </div>
  );
}

function PartnerClaimPrompt({ place }) {
  if (!place) return null;
  return (
    <DestinationSection title="Partner Actions">
      <div className="rounded-[6px] border border-[#0B1F33]/[0.08] bg-white p-3">
        <p className="text-[12px] leading-5 text-[#0B1F33]/66">
          This listing is already useful to nearby residents. Claim it to keep details current, add a resident perk, promote events, and see how people respond.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {["Claim This Listing", "Add Resident Perk", "Update Happy Hour", "Promote an Event"].map((label) => (
            <button key={label} type="button" className="h-9 rounded-[6px] border border-[#0B1F33]/[0.08] bg-white text-[12px] font-medium text-[#0B1F33]">
              {label}
            </button>
          ))}
        </div>
      </div>
    </DestinationSection>
  );
}

function getLiveLegendsFacts(place) {
  const directListing = getLegendsListing(place);
  const building = getLuxuryPresenceBuilding(place);
  const listing = directListing || (!building ? getResolvedLegendsListing(place) : null);
  if (listing) {
    return [
      ["Price", listing.priceDisplay || listing.price],
      ["Bedrooms", listing.beds],
      ["Bathrooms", listing.baths],
      ["Square Feet", listing.sqftDisplay || (listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "")],
      ["MLS Number", listing.mlsNumber || listing.mls_number],
      ["Days On Market", listing.daysOnMarket],
      ["Available Through", "Legends Real Estate"],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
  }

  const listings = building?.listings || place?.listings || [];
  if (building && listings.length) {
    const sorted = [...listings].sort((a, b) => {
      const priceA = Number(String(a.price || "").replace(/[^0-9.]/g, "")) || 0;
      const priceB = Number(String(b.price || "").replace(/[^0-9.]/g, "")) || 0;
      return priceA - priceB;
    });
    const first = sorted[0] || {};
    return [
      ["Price", building.priceRange || first.price],
      ["Bedrooms", first.beds],
      ["Bathrooms", first.baths],
      ["Square Feet", first.sqft ? `${Number(first.sqft).toLocaleString()} sq ft` : ""],
      ["MLS Number", first.mls_number || first.mlsNumber],
      ["Available Listings", listings.length],
      ["Available Through", "Legends Real Estate"],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
  }

  return [];
}

function getLegendsFactRowsFromListing(listing) {
  if (!listing) return [];
  return [
    ["Price", listing.priceDisplay || listing.price],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq Ft", listing.sqftDisplay || (listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "")],
    ["MLS", listing.mlsNumber || listing.mls_number],
    ["Broker", "Legends Real Estate"],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");
}

function getLegendsFactRowsFromFacts(facts) {
  const labelMap = {
    Bedrooms: "Beds",
    Bathrooms: "Baths",
    "Square Feet": "Sq Ft",
    "MLS Number": "MLS",
    "Available Through": "Broker",
  };
  return facts
    .map(([label, value]) => [labelMap[label] || label, value])
    .filter(([, value]) => value !== undefined && value !== null && value !== "");
}

function LegendsHomeFactsGrid({ rows }) {
  if (!rows?.length) return null;
  return (
    <span className="dp-legends-home-facts-grid">
      {rows.map(([label, value]) => (
        <span key={`${label}-${value}`} className={`dp-legends-home-fact ${label === "Price" ? "is-price" : ""} ${label === "Broker" ? "is-broker" : ""}`}>
          <span className="dp-legends-home-fact-label">{label}</span>
          <span className="dp-legends-home-fact-value">{value}</span>
        </span>
      ))}
    </span>
  );
}

function LegendsMLSFactsSection({ place, mode, onSelect }) {
  const facts = getLiveLegendsFacts(place);
  const building = getLuxuryPresenceBuilding(place);
  const isLegends = facts.length && (getResolvedLegendsListing(place) || building);
  if (!isLegends) return null;

  const sortedListings = [...(building?.listings || place?.listings || [])].sort((a, b) => {
    const priceA = Number(String(a.price || "").replace(/[^0-9.]/g, "")) || 0;
    const priceB = Number(String(b.price || "").replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  if (building && sortedListings.length) {
    return (
      <DestinationSection title={mode === "partner" ? "MLS Metrics" : "Available Homes"}>
        <div className="dp-legends-home-list">
          {sortedListings.map((listing) => {
            const listingPlace = luxuryPresenceListingToPlace(listing);
            const unit = listing.unit || String(listing.address || "").match(/#\s*([A-Za-z0-9-]+)/)?.[1] || "";
            const rows = getLegendsFactRowsFromListing(listing);

            return (
              <button
                key={listing.id || listing.listing_id}
                type="button"
                onClick={() => listingPlace && onSelect?.(listingPlace)}
                className="dp-legends-home-link group"
              >
                <span className="dp-legends-home-title">Residence {unit || listing.address}</span>
                <LegendsHomeFactsGrid rows={rows} />
                <span className="dp-legends-home-arrow">
                  View Listing
                  <ArrowRight className="h-4 w-4 text-[#C8A96A] transition group-hover:translate-x-0.5" />
                </span>
              </button>
            );
          })}
        </div>
      </DestinationSection>
    );
  }

  return (
    <DestinationSection title={mode === "partner" ? "MLS Metrics" : "Available Homes"}>
      <div className="dp-legends-home-list">
        <div className="dp-legends-home-static">
          <LegendsHomeFactsGrid rows={getLegendsFactRowsFromFacts(facts)} />
        </div>
      </div>
    </DestinationSection>
  );
}

function LegendsContactForm({ listing, formId }) {
  const [submitted, setSubmitted] = useState(false);
  const contactMethods = ["Email", "Phone", "Text"];

  if (submitted) {
    return (
      <div className="mt-3 dp-info-section p-3 text-[12px] leading-5 text-[#0B1F33]/72 md:mt-4 md:p-4 md:text-[13px]">
        Thanks — your request has been sent to Legends Real Estate. The team will follow up with listing details and next steps.
      </div>
    );
  }

  return (
    <form
      id={formId}
      className="dp-contact-continuation mt-8 text-left md:mt-10"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="max-w-2xl text-left">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Contact agent</div>
        <h3 className="mt-1 text-[14px] font-semibold leading-tight text-[#0B1F33] md:text-[15px]">{listing.address}</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#425466]">
          Send a quick note about this listing. The agent gets the property, your contact info, and the request.
        </p>
      </div>

      <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Name
          <input required name="name" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Your name" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Phone or email
          <input required name="contact" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Best way to reach you" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Email
          <input type="email" name="email" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Optional email" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Preferred contact
          <select name="preferredContactMethod" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70">
            {contactMethods.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-2 grid max-w-2xl gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
        Message
        <textarea required name="message" className="min-h-16 dp-soft-field rounded-[2px] bg-white px-2.5 py-2 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" defaultValue={listing.prefilledMessage} />
      </label>

      <input type="hidden" name="listingType" value={listing.listingType === "rent" ? "Rent" : "Sale"} />
      <input type="hidden" name="address" value={`${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`} />
      <input type="hidden" name="price" value={listing.price} />
      <input type="hidden" name="beds" value={listing.beds} />
      <input type="hidden" name="baths" value={listing.baths} />
      <input type="hidden" name="sqft" value={listing.sqft} />
      <input type="hidden" name="daysOnMarket" value={listing.daysOnMarket} />
      <input type="hidden" name="neighborhood" value={listing.neighborhood} />
      <input type="hidden" name="source" value={listing.source} />
      <input type="hidden" name="brand" value="Legends Real Estate" />

      <button type="submit" className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 bg-[#0B1F33] px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]">
        Send Request
        <Send className="h-3 w-3 text-[#C8A96A]" />
      </button>
    </form>
  );
}

function LegendsListingDetails({ listing }) {
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const stats = [
    ["Listed at", listing.priceDisplay],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq ft", listing.sqftDisplay],
    ["Days on market", listing.daysOnMarket],
  ];

  return (
      <section className="mt-3 dp-info-section p-3 text-left md:mt-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex min-w-0 items-start gap-3 text-left">
          <img
            src="/pins/downtown-perks/legends-logo.png"
            alt="Legends Real Estate"
            className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
          />
          <div className="min-w-0 text-left">
              <div className="inline-flex dp-map-status-badge px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
              {listing.listingTypeLabel}
            </div>
            <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#0B1F33] md:text-[20px]">{listing.address}</h3>
            <p className="mt-1 text-[12px] font-medium text-[#425466]">{listing.city}, {listing.state} {listing.zip}</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">Listed at</div>
          <div className="mt-1 text-[20px] font-semibold text-[#0B1F33]">{listing.priceDisplay}</div>
        </div>
      </div>

      <div className="dp-editorial-detail-list mt-6 grid gap-0">
        {stats.map(([label, value]) => (
          <div key={label} className="dp-editorial-detail-row py-3 text-left">
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52">{label}</div>
            <div className="mt-1 text-[13px] font-medium leading-5 text-[#0B1F33]">{value}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-left text-[13px] leading-6 text-[#425466]">{listing.panelCopy}</p>
      {listing.reconciliationNote && (
        <p className="mt-2 text-[11px] leading-5 text-[#0B1F33]/48">
          Source note: 48 of 65 stated for-sale listings were provided; 17 still need reconciliation before launch.
        </p>
      )}

      <LegendsListingGallery listing={listing} />
    </section>
  );
}

function LegendsListingGallery({ listing }) {
  const images = Array.isArray(listing?.gallery) ? listing.gallery.filter(Boolean) : [];
  if (!images.length) return null;

  return (
    <div className="mt-4">
      <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Listing images</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
            <img
              src={image}
              alt={`${listing.address} listing view ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendsPartnerListingDetails({ listing, place, selectedMetric, onSelectMetric }) {
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const insights = getPartnerBusinessInsights(place);
  const stats = [
    ["Price", listing.priceDisplay],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq ft", listing.sqftDisplay],
    ["Days live", listing.daysOnMarket],
  ];

  return (
    <>
      <section className="mt-3 dp-info-section p-3 md:mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <img
              src="/pins/downtown-perks/legends-logo.png"
              alt="Legends Real Estate"
              className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
            />
            <div className="min-w-0">
              <div className="inline-flex dp-map-status-badge px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
                {listing.listingTypeLabel}
              </div>
              <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#0B1F33] md:text-[20px]">{listing.address}</h3>
              <p className="mt-1 text-[12px] font-medium text-[#425466]">{fullAddress}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">Partner read</div>
            <div className="mt-1 text-[18px] font-semibold text-[#0B1F33] md:text-[20px]">{insights.placement}</div>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[13px] leading-6 text-[#425466]">
          Legends can use this listing as a map-visible residential story: nearby residents, prospects, brokers, and local partners can understand the address, while the partner view shows saves, scans, listing interest, and walkable demand around the property.
        </p>

        <div className="dp-editorial-detail-list mt-6 grid gap-0">
          {stats.map(([label, value]) => (
            <div key={label} className="dp-editorial-detail-row py-3">
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/45">{label}</div>
              <div className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{value}</div>
            </div>
          ))}
        </div>

        {listing.reconciliationNote && (
          <p className="mt-3 text-[11px] leading-5 text-[#0B1F33]/48">
            Source note: 48 of 65 stated for-sale listings were provided; 17 still need reconciliation before launch.
          </p>
        )}

        <LegendsListingGallery listing={listing} />
      </section>

      <PartnerMetricInsight place={place} selectedMetric={selectedMetric} onSelectMetric={onSelectMetric} />
    </>
  );
}

function PartnerDrawerActions({ place }) {
  const isProperty = getResidentEntityKind(place) === "property";
  if (isProperty) {
    const viewListings = () => {
      document.querySelector(".dp-destination-drawer .dp-legends-home-list")?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    return (
      <div className="dp-primary-action-row mt-3">
        <button type="button" onClick={viewListings} className="dp-panel-action dp-primary-action">View Listings</button>
        <Link to={campaignRoute(place)} className="dp-panel-action dp-panel-action-compact">Create Property Plan</Link>
        <Link to="/contact" className="dp-panel-action dp-panel-action-compact">Contact</Link>
        <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action-text">View Reports</Link>
      </div>
    );
  }

  return (
    <div className="dp-primary-action-row mt-3">
      <Link to={campaignRoute(place)} className="dp-panel-action dp-panel-action-compact">{getPartnerPrimaryActionLabel(place)}</Link>
      <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action dp-panel-action-compact">Reports</Link>
      <Link to="/contact" className="dp-panel-action dp-panel-action-compact">Contact</Link>
    </div>
  );
}

function ResidentDrawerActions({
  selected,
  selectedResidentAction,
  savedIds,
  eventRsvps,
  legendsListing,
  agentFormPlaceId,
  onContact,
  onRsvp,
  onShowCard,
  onSave,
}) {
  const entityKind = getResidentEntityKind(selected);
  const isProperty = entityKind === "property";
  const isEvent = entityKind === "event";
  const isRestaurant = getDestinationKind(selected) === "dining";
  const hasPerk = hasActivePerkData(selected);
  const contacts = getContactDetails(selected);
  const websiteContact = contacts.find((item) => item.kind === "website");
  const viewPerk = () => document.querySelector(".dp-destination-drawer .dp-perk-module")?.scrollIntoView({ behavior: "smooth", block: "center" });
  const sharePlace = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = selected?.name || "Downtown Perks";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard?.writeText(url);
    } catch {
      // Sharing is optional; keep the button quiet if the browser blocks it.
    }
  };

  if (isProperty) {
    const viewListings = () => {
      const listings = document.querySelector(".dp-destination-drawer .dp-legends-home-list");
      if (listings) {
        listings.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      onContact();
    };
    return (
      <div className="dp-primary-action-row">
        <button type="button" onClick={viewListings} className="dp-panel-action dp-primary-action">
          View Listings
        </button>
        <button
          type="button"
          onClick={onContact}
          className="dp-panel-action"
          aria-expanded={agentFormPlaceId === selected.id}
        >
          Schedule Tour
        </button>
        <button type="button" onClick={onContact} className="dp-panel-action dp-panel-action-ghost">Contact Legends</button>
      </div>
    );
  }

  return (
    <div className="dp-primary-action-row">
      {isEvent ? (
        <button type="button" onClick={onRsvp} className="dp-panel-action dp-primary-action">
          {eventRsvps.some((item) => item.id === selected.id) ? "Saved RSVP" : "RSVP"}
        </button>
      ) : hasPerk ? (
        <button type="button" onClick={viewPerk} className="dp-panel-action dp-primary-action">
          View Perk
        </button>
      ) : (
        <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
      )}
      {hasPerk && !isEvent && (
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
      )}
      {!isEvent && (
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action">
          Directions
        </a>
      )}
      {hasPerk && !isEvent && (
        <button type="button" onClick={sharePlace} className="dp-panel-action">
          Share
        </button>
      )}
      {isRestaurant && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action">
          Reserve
        </a>
      )}
      {(!isRestaurant || isEvent || !websiteContact) && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action">
          Website
        </a>
      )}
      {isEvent && <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action">Directions</a>}
    </div>
  );
}

function normalizePanelImageText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(street)\b/g, "st")
    .replace(/\b(avenue)\b/g, "ave")
    .replace(/[#.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function baseAddressText(value) {
  return normalizePanelImageText(value).replace(/\s+(unit|apt|suite)?\s*\d+[a-z]?\s*$/i, "").trim();
}

function getRelevantListingImage(place) {
  const directListing = getLegendsListing(place);
  if (directListing?.image) return directListing.image;
  if (place?.image && String(place.image).includes("/images/legends-listings/")) return place.image;
  if (place?.primaryImage && String(place.primaryImage).includes("/images/legends-listings/")) return place.primaryImage;
  if (place?.panelImage && String(place.panelImage).includes("/images/legends-listings/")) return place.panelImage;

  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const luxuryListings = luxuryBuilding?.listings || [];
  const luxuryImage = luxuryBuilding?.panelImage || luxuryBuilding?.heroImage || luxuryListings.find((listing) => listing?.primaryImage)?.primaryImage;
  if (luxuryImage) return luxuryImage;

  const buildingImage = resolveBuildingImage(place);
  if (buildingImage) return buildingImage;

  const placeTextForImage = normalizePanelImageText([
    place?.id,
    place?.name,
    place?.address,
    place?.raw?.address,
    place?.raw?.name,
  ].filter(Boolean).join(" "));

  const imageSourceListings = [
    ...luxuryPresenceListings.map((listing) => ({
      name: listing.address,
      image: listing.primaryImage,
      raw: { legendsListing: { address: listing.address, image: listing.primaryImage } },
    })),
    ...legendsListingPlaces,
  ];
  const matchedListingPlace = imageSourceListings.find((listingPlace) => {
    const listing = getLegendsListing(listingPlace);
    const listingAddress = normalizePanelImageText(listing?.address || listingPlace.address || listingPlace.name);
    const listingBaseAddress = baseAddressText(listing?.address || listingPlace.address || listingPlace.name);
    return (listingAddress && placeTextForImage.includes(listingAddress)) || (listingBaseAddress && placeTextForImage.includes(listingBaseAddress));
  });

  return matchedListingPlace?.raw?.legendsListing?.image || matchedListingPlace?.image || null;
}

function getLifestyleImage(place, mode) {
  return getRelevantListingImage(place) || resolveBuildingImage({ ...place, mode }) || resolveEntityImage({ ...place, mode });
}

function getPanelImageObjectPosition(place) {
  const rawFocus = String(place?.imageFocus || place?.raw?.imageFocus || place?.raw?.image_focus || "").toLowerCase();
  const focusMap = {
    top: "center top",
    center: "center center",
    bottom: "center bottom",
    left: "left center",
    right: "right center",
  };
  if (focusMap[rawFocus]) return focusMap[rawFocus];

  const text = placeCoreText(place);
  const kind = getResidentEntityKind(place);
  if (kind === "property" || text.includes("building") || text.includes("residential")) return "center top";
  if (kind === "hotel" || text.includes("hotel")) return "center center";
  if (text.includes("via 313")) return "28% 24%";
  if (text.includes("banger")) return "48% 42%";
  if (text.includes("stay put")) return "50% 38%";
  if (text.includes("geraldine")) return "50% 42%";
  if (text.includes("anthem")) return "50% 45%";
  if (text.includes("emmer") || text.includes("rye")) return "50% 44%";
  return "center";
}

function handlePanelImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = MAP_PANEL_IMAGE_FALLBACK;
}

function shouldContainDrawerImage(place) {
  const kind = getResidentEntityKind(place);
  const text = placeCoreText(place);
  return !Boolean(getRelevantListingImage(place)) && (kind === "property" || text.includes("residential property"));
}

function shouldUseListingImageLayout(place) {
  const kind = getResidentEntityKind(place);
  const text = placeCoreText(place);
  return Boolean(getRelevantListingImage(place)) || kind === "property" || text.includes("listing") || text.includes("residential property");
}

function normalizeContactHref(kind, value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (kind === "phone") return `tel:${text.replace(/[^\d+]/g, "")}`;
  if (kind === "email") return `mailto:${text}`;
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function getContactDetails(place) {
  const raw = place?.raw || {};
  const website = raw.website || place?.website;
  const phone = raw.contact_phone || raw.phone || place?.phone;
  const email = raw.contact_email || raw.email || place?.email;
  return [
    phone && { kind: "phone", label: "Call", value: phone, href: normalizeContactHref("phone", phone) },
    website && { kind: "website", label: "Website", value: website, href: normalizeContactHref("website", website) },
    email && { kind: "email", label: "Email", value: email, href: normalizeContactHref("email", email) },
  ].filter(Boolean);
}

function DrawerContactStrip({ place }) {
  const [activeContact, setActiveContact] = useState(null);
  const contacts = getContactDetails(place);
  if (!contacts.length) return null;

  const activeLabel = activeContact?.kind === "phone"
    ? "Call"
    : activeContact?.kind === "email"
      ? "Email"
      : "Website";
  const activeAction = activeContact?.kind === "phone"
    ? "Call now"
    : activeContact?.kind === "email"
      ? "Send email"
      : "Open website";

  return (
    <>
      <div className="dp-contact-strip mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
        {contacts.map((item) => (
          <button
            key={`${item.kind}-${item.value}`}
            type="button"
            onClick={() => setActiveContact(item)}
            className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-expanded={activeContact?.kind === item.kind}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {activeContact && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="dp-contact-sheet mt-2 overflow-hidden"
          >
            <div className="grid gap-2 bg-white/72 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52">{activeLabel}</div>
                  <div className="mt-1 break-words text-[12px] font-medium leading-5 text-[#0B1F33]">
                    {activeContact.value}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveContact(null)}
                  className="grid h-6 w-6 shrink-0 place-items-center text-[#0B1F33]/58 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  aria-label={`Close ${activeLabel.toLowerCase()} details`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <a
                href={activeContact.href}
                target={activeContact.kind === "website" ? "_blank" : undefined}
                rel={activeContact.kind === "website" ? "noreferrer" : undefined}
                className="inline-flex h-8 w-fit items-center justify-center bg-white/72 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33] shadow-[0_8px_18px_rgba(11,31,51,0.045)] transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
              >
                {activeAction}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#C8A96A]" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getResidentDetailAction(place) {
  const coreText = placeCoreText(place);
  const category = String(place?.category || "").toLowerCase();
  const type = String(place?.type || "").toLowerCase();

  if (type === "service" || category.includes("service") || category.includes("restoration") || coreText.includes("restoration")) {
    return { label: "More Services", href: "/map?mode=resident&tab=map&filter=Services" };
  }
  if (isHappyHourEntity(place)) {
    return { label: "Happy Hours", href: "/map?mode=resident&tab=map&filter=Happy%20Hours" };
  }
  if (type === "property" || type === "residential" || category.includes("property") || category.includes("residential") || category.includes("apartment") || category.includes("condo")) {
    return { label: "View Property", href: mapRoutes.properties };
  }
  if (isEventEntity(place) || coreText.includes("rsvp")) {
    return { label: "View Event", href: mapRoutes.events, canRsvp: true };
  }
  if (type === "hotel" || category.includes("hotel") || category.includes("hospitality")) {
    return { label: "View Hotels", href: "/partners/hospitality" };
  }
  if (type === "brand" || category.includes("brand") || coreText.includes("legends real estate") || coreText.includes("yeti") || coreText.includes("rivian")) {
    return { label: "View Brand", href: "/brands" };
  }
  return { label: "Explore Similar", href: mapRoutes.residentMap };
}

function getResidentEntityKind(place) {
  const text = placeCoreText(place);
  const category = String(place?.category || "").toLowerCase();
  const type = String(place?.type || "").toLowerCase();

  if (type === "service" || category.includes("service") || category.includes("restoration") || text.includes("restoration")) {
    return "service";
  }

  if (isHappyHourEntity(place)) {
    return "happy_hour";
  }

  if (
    type === "property" ||
    type === "residential" ||
    category.includes("property") ||
    category.includes("residential") ||
    text.includes("residential property") ||
    text.includes("mls:") ||
    text.includes("listed:") ||
    text.includes("condominium") ||
    text.includes("condo") ||
    text.includes("apartment")
  ) {
    return "property";
  }

  if (
    isEventEntity(place) ||
    text.includes("rsvp") ||
    text.includes("live music")
  ) {
    return "event";
  }

  if (hasActivePerkData(place) || text.includes("perk") || text.includes("offer") || text.includes("discount")) {
    return "perk";
  }

  if (type === "hotel" || category.includes("hotel") || text.includes("hotel") || text.includes("hospitality")) {
    return "hotel";
  }

  if (type === "brand" || category.includes("brand") || text.includes("legends") || text.includes("yeti") || text.includes("rivian")) {
    return "brand";
  }

  return "place";
}

function getPartnerPrimaryActionLabel(place) {
  const kind = getResidentEntityKind(place);
  if (kind === "property") return "View Listings";
  if (kind === "event") return "Promote Event";
  if (kind === "happy_hour") return "Promote Happy Hour";
  if (kind === "hotel") return "Promote Hotel";
  if (kind === "brand") return "Promote Brand";
  if (kind === "perk") return "Launch Offer";
  return "Start Campaign";
}

function getPartnerDashboardRoute(place, activeFilter = "") {
  const params = new URLSearchParams();
  const normalizedFilter = String(activeFilter || "").toLowerCase();
  const hasPlace = Boolean(place);
  const kind = hasPlace ? getResidentEntityKind(place) : "";

  if (place?.id) params.set("entityId", String(place.id));
  if (place?.district) params.set("district", String(place.district));

  if (normalizedFilter === "civic" || kind === "civic" || (hasPlace && isCivicEntity(place))) {
    params.set("view", "civic");
  } else if (normalizedFilter === "inkind" || (hasPlace && isInKindPartner(place))) {
    params.set("view", "inKind");
  }

  const query = params.toString();
  return `${mapRoutes.dashboard}${query ? `?${query}` : ""}`;
}

function PanelInsightGrid({ items, columns = "md:grid-cols-3" }) {
  const visibleItems = items.filter((item) => item?.value || item?.body);
  if (!visibleItems.length) return null;

  return (
    <div className={`dp-panel-linked-grid mt-5 grid gap-0 ${columns}`}>
      {visibleItems.map((item) => {
        const content = (
          <>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">{item.label}</div>
            <p className={`mt-1.5 text-[12px] leading-5 ${item.emphasis ? "font-semibold text-[#0B1F33]" : "text-[#425466]"}`}>
              {item.value || item.body}
            </p>
          </>
        );

        return item.onClick ? (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={`text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${item.className || ""}`}
          >
            {content}
          </button>
        ) : (
          <article key={item.label} className={item.className || ""}>
            {content}
          </article>
        );
      })}
    </div>
  );
}

function PartnerBusinessInsights({ place }) {
  const insights = getPartnerBusinessInsights(place);
  const insightItems = [
    ...(insights.fit ? [{ label: "Partnership fit", value: insights.fit, emphasis: true }] : []),
    { label: "Intent", value: insights.intent },
    { label: "Audience", value: insights.audience },
    { label: "Opportunity", value: insights.opportunity },
    { label: "Best timing", value: insights.timing, emphasis: true },
    { label: "Next move", value: insights.action, emphasis: true },
  ];

  return (
    <section className="mt-4 dp-info-section p-3 md:mt-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner view</div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33] md:text-[20px]">What this place can help you understand</h3>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/70 md:text-[11px]">
          {insights.placement}
        </div>
      </div>

      <PanelInsightGrid items={insightItems} columns="md:grid-cols-3" />
    </section>
  );
}

function PartnerMetricInsight({ place, selectedMetric, onSelectMetric }) {
  const insights = getPartnerBusinessInsights(place);
  const metricCopy = {
    reach: {
      title: "People nearby",
      body: insights.audience,
      use: "Use this to decide who should see the offer first: residents, guests, visitors, or people already out for the night.",
    },
    yield: {
      title: "Who took action",
      body: "This shows the share of people who did something useful after seeing the place: saved it, scanned, RSVP'd, opened directions, or viewed the pass.",
      use: "Use this to compare what is just getting seen versus what is actually getting people to move.",
    },
    impact: {
      title: "Map lift",
      body: "This shows how much stronger the place performs when it appears on the map at the right moment.",
      use: insights.opportunity,
    },
    flux: {
      title: "Resident activity",
      body: "This shows whether resident movement around this area is picking up, slowing down, or shifting by time of day.",
      use: `For ${place?.name || "this place"}, start with ${insights.timing.toLowerCase()} and keep the offer easy to scan, save, or redeem.`,
    },
  };
  const activeInsight = metricCopy[selectedMetric.id] || metricCopy.reach;

  return (
    <section className="mt-4 dp-info-section p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Activity</div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33] md:text-[20px]">{activeInsight.title}</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#425466]">{activeInsight.body}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            type="button"
            onClick={() => onSelectMetric(metric)}
            className={`dp-map-metric-pill min-w-[124px] shrink-0 px-2.5 py-1.5 text-left transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] ${
              selectedMetric.id === metric.id
                ? "is-active"
                : ""
            }`}
            aria-pressed={selectedMetric.id === metric.id}
          >
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">{metric.label}</span>
            <span className="mt-0.5 block text-[14px] font-semibold leading-none">{metric.value}</span>
          </button>
        ))}
      </div>

      <PanelInsightGrid
        columns="md:grid-cols-3"
        items={[
          { label: "What it tells you", value: selectedMetric.copy },
          { label: "How to use it", value: activeInsight.use },
          { label: "Next move", value: insights.action, emphasis: true },
        ]}
      />
    </section>
  );
}

function MapFocus({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    const coords = getPlaceCoords(selected);
    if (!coords) return;
    map.flyTo(coords, Math.max(map.getZoom(), 17), {
      duration: 0.55,
    });
  }, [map, selected]);

  return null;
}

function MapZoomTracker({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function MapResizeStabilizer({ watchKey }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });
    const frameId = window.requestAnimationFrame(invalidate);
    const timeoutId = window.setTimeout(invalidate, 260);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [map, watchKey]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => map.invalidateSize({ animate: false }));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function ClusterMarker({ cluster, onOpen }) {
  const map = useMap();
  const markerRef = useRef(null);
  const lastExpandRef = useRef(0);

  const expandCluster = useCallback(() => {
    const now = Date.now();
    if (now - lastExpandRef.current < 350) return;
    lastExpandRef.current = now;

    triggerHaptic();

    const bounds = L.latLngBounds(cluster.places.map((place) => [place.latitude, place.longitude]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds.pad(0.18), {
        animate: true,
        duration: 0.55,
        maxZoom: Math.min(Math.max(map.getZoom() + 2, 16), 17),
        paddingTopLeft: [24, 112],
        paddingBottomRight: [24, 104],
      });
    } else {
      map.flyTo(cluster.coords, Math.min(map.getZoom() + 2, 17), { duration: 0.55 });
    }

    onOpen(cluster);
  }, [cluster, map, onOpen]);

  useEffect(() => {
    const marker = markerRef.current;
    const element = marker?.getElement?.();
    if (!element) return undefined;

    const handleExpand = (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(expandCluster, 40);
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handleExpand(event);
    };

    element.addEventListener("pointerdown", handleExpand, true);
    element.addEventListener("click", handleExpand, true);
    element.addEventListener("keydown", handleKeyDown, true);
    element.setAttribute("aria-label", `Zoom into ${cluster.count} places in this area`);

    return () => {
      element.removeEventListener("click", handleExpand, true);
      element.removeEventListener("pointerdown", handleExpand, true);
      element.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [cluster.count, expandCluster]);

  return (
    <Marker
      ref={markerRef}
      position={cluster.coords}
      icon={clusterIcon(cluster.count)}
      eventHandlers={{
        click: expandCluster,
      }}
    />
  );
}

function PlaceMarker({ place, selected, pulsing, onSelect, onSelectNearestLegends, onHover, onHoverEnd }) {
  const markerRef = useRef(null);

  return (
    <Marker
      ref={markerRef}
      position={place.coords}
      icon={pinIcon(place, selected, pulsing)}
      keyboard={false}
      title={place.name}
      alt={place.name}
      eventHandlers={{
        click: () => onSelect(place),
        dblclick: (event) => {
          event.originalEvent?.preventDefault?.();
          event.originalEvent?.stopPropagation?.();
          onSelectNearestLegends(place);
        },
        tap: () => onSelect(place),
        mouseover: () => onHover(place),
        mouseout: () => onHoverEnd(place),
      }}
    />
  );
}

function triggerHaptic() {
  if (typeof window === "undefined") return;
  window.navigator?.vibrate?.(12);
}

function useUrlMapState() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pathMode = location.pathname.startsWith("/partners") ? "partner" : "resident";
  const pathTab = location.pathname === "/residents/perks" ? "pass" : "map";
  const mode = searchParams.get("mode") === "partner" ? "partner" : searchParams.get("mode") === "resident" ? "resident" : pathMode;
  const tab = searchParams.get("tab") === "pass" ? "pass" : searchParams.get("tab") === "map" ? "map" : pathTab;
  const filter = searchParams.get("filter") || "All";
  const entityId = searchParams.get("entityId") || "";
  const prompt = sanitizeMapPrompt(searchParams.get("prompt") || searchParams.get("q") || "", mode);
  const radius = searchParams.get("radius") || "5 min";
  const district = searchParams.get("district") || ALL_NEIGHBORHOODS;

  function update(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params, { replace: false });
  }

  return { mode, tab, filter, entityId, prompt, radius, district, update };
}

export default function MapPage() {
  const navigate = useNavigate();
  const places = useLocations();
  const urlState = useUrlMapState();
  const [search, setSearch] = useState(urlState.prompt);
  const [activeFilter, setActiveFilter] = useState(FILTERS.includes(urlState.filter) ? urlState.filter : "All");
  const [selectedId, setSelectedId] = useState(urlState.entityId);
  const [savedIds, setSavedIds] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(window.localStorage.getItem("downtown-perks-card-items") || "[]"));
    } catch {
      return new Set();
    }
  });
  const eventRsvps = useEventRsvpStore((state) => state.rsvps);
  const addEventRsvp = useEventRsvpStore((state) => state.addRsvp);
  const removeEventRsvp = useEventRsvpStore((state) => state.removeRsvp);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  const [radius, setRadius] = useState(urlState.radius);
  const [district, setDistrict] = useState(urlState.district);
  const [passPresented, setPassPresented] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState(() => (
    urlState.mode === "resident" && urlState.tab === "map" && urlState.filter === "Saved" ? "saved" : "map"
  ));
  const [clusterDrawer, setClusterDrawer] = useState(null);
  const [mapZoom, setMapZoom] = useState(INITIAL_MAP_ZOOM);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [secondaryRailOpen, setSecondaryRailOpen] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const [mapAnswer, setMapAnswer] = useState(null);
  const [entityAnswer, setEntityAnswer] = useState(null);
  const [entityAssistantLoading, setEntityAssistantLoading] = useState(false);
  const [pulsingPinId, setPulsingPinId] = useState("");
  const [agentFormPlaceId, setAgentFormPlaceId] = useState("");
  const [agentFormSubmitted, setAgentFormSubmitted] = useState(false);
  const mapResizeKey = `${urlState.tab}:${urlState.mode}:${activeBottomTab}:${selectedId || "none"}:${clusterDrawer?.id || "none"}:${consoleCollapsed ? "closed" : "open"}:${filtersOpen ? "filters" : "nofilters"}:${neighborhoodsOpen ? "areas" : "noareas"}:${mapAnswer ? "answer" : "noanswer"}`;

  useEffect(() => {
    setSearch(urlState.prompt);
  }, [urlState.prompt]);

  useEffect(() => {
    setEntityAnswer(null);
    setEntityAssistantLoading(false);
  }, [selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("downtown-perks-card-items", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIndex((index) => index + 1);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setActiveFilter(FILTERS.includes(urlState.filter) ? urlState.filter : "All");
  }, [urlState.filter]);

  useEffect(() => {
    setSelectedId(urlState.entityId);
  }, [urlState.entityId]);

  useEffect(() => {
    setAgentFormPlaceId("");
    setAgentFormSubmitted(false);
  }, [selectedId]);

  useEffect(() => {
    setDistrict(urlState.district);
  }, [urlState.district]);

  const effectiveSearch = useMemo(() => {
    return sanitizeMapPrompt(search, urlState.mode);
  }, [search, urlState.mode]);

  const neighborhoodBasePlaces = useMemo(() => {
    const query = effectiveSearch.toLowerCase();
    return places.filter((place) => {
      if (!matchesFilter(place, activeFilter, savedIds)) return false;
      if (!query) return true;
      return placeText(place).includes(query);
    });
  }, [places, effectiveSearch, activeFilter, savedIds]);

  const neighborhoodCounts = useMemo(() => {
    return NEIGHBORHOODS.reduce((counts, neighborhood) => {
      counts[neighborhood] =
        neighborhood === ALL_NEIGHBORHOODS
          ? neighborhoodBasePlaces.length
          : neighborhoodBasePlaces.filter((place) => place.district === neighborhood).length;
      return counts;
    }, {});
  }, [neighborhoodBasePlaces]);

  const filtered = useMemo(() => {
    return neighborhoodBasePlaces.filter((place) => {
      if (!isAllNeighborhoodScope(district) && place.district !== district) return false;
      return true;
    });
  }, [neighborhoodBasePlaces, district]);

  const residentSavedPlaces = useMemo(() => {
    const saved = places.filter((place) => savedIds.has(place.id));
    if (saved.length) return saved;
    return places.filter((place) => hasActivePerkData(place)).slice(0, 8);
  }, [places, savedIds]);

  const actualSavedPlaces = useMemo(
    () => places.filter((place) => savedIds.has(place.id)),
    [places, savedIds],
  );

  const residentPerkPlaces = useMemo(() => {
    const perks = places.filter((place) => hasActivePerkData(place));
    return perks.length ? perks.slice(0, 12) : places.slice(0, 12);
  }, [places]);

  const selected = useMemo(
    () => places.find((place) => place.id === selectedId) || luxuryPresenceListingPlaces.find((place) => place.id === selectedId) || null,
    [places, selectedId],
  );
  const selectedResidentAction = useMemo(
    () => (selected ? getResidentDetailAction(selected) : null),
    [selected],
  );
  const clusterPlacesForDrawer = clusterDrawer?.places || [];

  const hasActiveCategoryScope = activeFilter !== "All" || !isAllNeighborhoodScope(district) || Boolean(effectiveSearch);
  const displayPlaces = filtered.length
    ? filtered
    : activeFilter === "Saved"
      ? residentSavedPlaces
      : activeFilter === "Perks"
        ? residentPerkPlaces
        : places.slice(0, 12);
  const isUsingFallbackPlaces = !filtered.length && places.length > 0;
  const contextCount = displayPlaces.length;
  const contextLabel = contextCount > 0
    ? `${contextCount} ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()}`
    : `Showing suggested ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()} nearby`;
  const mapPlaces = dedupePlacesById(displayPlaces).filter((place) => getPlaceCoords(place)).slice(0, 350);
  const visibleLegendsPlaces = useMemo(
    () => dedupePlacesById(displayPlaces).filter((place) => isLegendsMapPlace(place) && getPlaceCoords(place)),
    [displayPlaces],
  );
  const clusteredMapItems = useMemo(
    () => clusterPlaces(mapPlaces, mapZoom, selectedId),
    [mapPlaces, mapZoom, selectedId],
  );
  const previewLimit = resultsExpanded ? 12 : 4;
  const previewPlaces = displayPlaces.slice(0, previewLimit);
  const isResidentSavedDrawer = urlState.mode === "resident" && activeBottomTab === "saved";
  const savedDrawerPlaces = residentSavedPlaces.slice(0, previewLimit);
  const drawerPreviewPlaces = isResidentSavedDrawer ? savedDrawerPlaces : previewPlaces;
  const hiddenPreviewCount = Math.max(0, Math.min(displayPlaces.length, 12) - previewPlaces.length);
  const hiddenSavedPreviewCount = Math.max(0, Math.min(residentSavedPlaces.length, 12) - savedDrawerPlaces.length);
  const activePromptList = urlState.mode === "partner"
    ? [...searchIntentRegistry.partner.placeholders]
    : [...searchIntentRegistry.resident.placeholders];
  const activePrompt = activePromptList[promptIndex % activePromptList.length] || activePromptList[0];
  const searchPlaceholder = activePrompt || (urlState.mode === "partner" ? "What should we promote next?" : "Where do you want to go?");
  const areaRailLabel = getAreaRailLabel(urlState.mode, activeFilter);
  const allAreaLabel = getAllAreaLabel(urlState.mode, activeFilter);

  useEffect(() => {
    if (!selectedId) return;
    if (!places.some((place) => place.id === selectedId) && !luxuryPresenceListingPlaces.some((place) => place.id === selectedId)) {
      setSelectedId("");
      urlState.update({ entityId: "" });
    }
  }, [places, selectedId]);

  useEffect(() => {
    if (!pulsingPinId) return undefined;
    const timeoutId = window.setTimeout(() => setPulsingPinId(""), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [pulsingPinId]);

  useEffect(() => {
    if (!selectedId) return;
    setActiveBottomTab("map");
    setConsoleCollapsed(true);
  }, [selectedId]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedId("");
        setClusterDrawer(null);
        setAboutOpen(false);
        setActiveBottomTab("map");
        urlState.update({ entityId: "" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function selectPlace(place) {
    triggerHaptic();
    setActiveBottomTab("map");
    setClusterDrawer(null);
    setConsoleCollapsed(true);
    setPulsingPinId(place.id);
    setSelectedId(place.id);
    urlState.update({ entityId: place.id });
  }

  function selectNearestLegendsListing(place) {
    if (!isLegendsMapPlace(place)) {
      selectPlace(place);
      return;
    }

    const nearest = visibleLegendsPlaces
      .filter((candidate) => candidate.id !== place.id)
      .map((candidate) => ({ candidate, score: getMapDistanceScore(place, candidate) }))
      .sort((a, b) => a.score - b.score)[0]?.candidate;

    selectPlace(nearest || place);
  }

  function setFilter(filter) {
    setActiveFilter(filter);
    setClusterDrawer(null);
    setMapAnswer(null);
    urlState.update({ filter, entityId: "" });
  }

  function setNeighborhood(neighborhood) {
    setDistrict(neighborhood);
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    urlState.update({ district: isAllNeighborhoodScope(neighborhood) ? "" : neighborhood, entityId: "" });
  }

  function openClusterDrawer(cluster) {
    setSelectedId("");
    setClusterDrawer(cluster);
    setConsoleCollapsed(true);
    setActiveBottomTab("map");
    urlState.update({ entityId: "" });
  }

  function toggleSaved(place) {
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(place.id) ? next.delete(place.id) : next.add(place.id);
      return next;
    });
  }

  function toggleRsvp(place) {
    if (eventRsvps.some((item) => item.id === place.id)) {
      removeEventRsvp(place.id);
      return;
    }
    setSavedIds((current) => new Set(current).add(place.id));
    addEventRsvp(
      {
        id: place.id,
        title: place.name,
        date: place.date || new Date(),
        time: place.time || "Upcoming",
        venue: place.district || "Downtown Austin",
        category: place.category || "Event",
        going: place.raw?.rsvp_count || place.rsvp_count || 0,
        image: place.image,
        imageAlt: `${place.name} event`,
        description: place.description || place.raw?.summary || "A Downtown Perks event residents can save, RSVP to, and find on the map.",
      },
      "map"
    );
  }

  function getSmartResults(query) {
    const q = query.trim().toLowerCase();
    const scoped = places.filter((place) => {
      if (!matchesFilter(place, activeFilter, savedIds)) return false;
      if (!isAllNeighborhoodScope(district) && place.district !== district) return false;
      if (!q) return true;
      const text = placeText(place);
      return text.includes(q) || getIntentTokens(q).some((token) => text.includes(token)) || (q.includes("perk") && hasActivePerkData(place));
    });

    const baseResults = scoped.length ? scoped : displayPlaces.length ? displayPlaces : hasActiveCategoryScope ? [] : places;
    return rankPlacesForIntent(baseResults, query, urlState.mode);
  }

  async function askMapAgent(query, localResults) {
    try {
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          mode: urlState.mode,
          district: isAllNeighborhoodScope(district) ? "Downtown Austin" : district,
          filter: activeFilter,
          intentCategories: urlState.mode === "partner"
            ? ["activity", "campaigns", "perks", "events", "properties", "trends"]
            : ["nearby", "tonight", "perks", "events", "places"],
          context: localResults.slice(0, 8).map((place) => {
            const legendsListing = getResolvedLegendsListing(place);
            const luxuryBuilding = getLuxuryPresenceBuilding(place);
            const buildingListings = luxuryBuilding?.listings || place?.listings || [];
            return {
              id: place.id,
              name: place.name,
              category: place.category,
              district: place.district,
              type: place.type,
              address: place.address || place.raw?.address || "",
              summary: place.summary || place.description || place.raw?.summary || place.raw?.description || "",
              offer: place.deals_offers || place.offer || place.raw?.deals_offers || place.raw?.offer || place.happyHour?.offer || place.raw?.happyHour?.offer || "",
              timing: place.happyHour?.time || place.raw?.happyHour?.time || place.time || place.raw?.time || "",
              latitude: place.latitude,
              longitude: place.longitude,
              hasPerk: hasActivePerkData(place),
              listing: legendsListing
                ? {
                    address: legendsListing.address,
                    price: legendsListing.priceDisplay || legendsListing.price,
                    beds: legendsListing.beds,
                    baths: legendsListing.baths,
                    sqft: legendsListing.sqftDisplay || legendsListing.sqft,
                    unit: legendsListing.unit,
                    mls: legendsListing.mlsNumber || legendsListing.mls_number,
                    daysOnMarket: legendsListing.daysOnMarket,
                    status: legendsListing.status,
                    building: legendsListing.buildingName || legendsListing.building_name,
                  }
                : undefined,
              buildingListings: buildingListings.length
                ? buildingListings.slice(0, 6).map((listing) => ({
                    address: listing.address,
                    unit: listing.unit,
                    price: listing.price,
                    beds: listing.beds,
                    baths: listing.baths,
                    sqft: listing.sqft,
                    mls: listing.mls_number,
                    status: listing.status,
                  }))
                : undefined,
            };
          }),
        }),
      });

      if (!response.ok) return null;
      const payload = await response.json();
      if (!payload?.answer) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async function runSearch(event) {
    event?.preventDefault();
    const query = search.trim() || activePrompt;
    const localResults = getSmartResults(query);
    setSearch(query);
    setMapAnswer(buildAgenticMapAnswer(query, localResults, urlState.mode, district, activeFilter));
    setActiveBottomTab("discover");
    urlState.update({ q: query });

    const agentAnswer = await askMapAgent(query, localResults);
    if (agentAnswer?.answer) {
      setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Answering: “${query}”`));
    }
  }

  async function applyPrompt(prompt) {
    const localResults = getSmartResults(prompt);
    setSearch(prompt);
    setMapAnswer(buildAgenticMapAnswer(prompt, localResults, urlState.mode, district, activeFilter));
    setActiveBottomTab("discover");
    urlState.update({ q: prompt });

    const agentAnswer = await askMapAgent(prompt, localResults);
    if (agentAnswer?.answer) {
      setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Answering: “${prompt}”`));
    }
  }

  async function askEntityAssistant(prompt) {
    if (!selected) return;
    const entityPrompt = `${prompt} for ${selected.name}`;
    const nearbyPlaces = getNearbyAreaPlaces(selected, places, 6).map((item) => item.candidate);
    const localResults = nearbyPlaces.length ? nearbyPlaces : getSmartResults(entityPrompt).filter((place) => place.id !== selected.id).slice(0, 6);
    const localAnswer = buildEntityAssistantAnswer(entityPrompt, selected, localResults, urlState.mode);
    setEntityAnswer(localAnswer);
    setEntityAssistantLoading(true);

    const agentAnswer = await askMapAgent(entityPrompt, [selected, ...localResults.filter((place) => place.id !== selected.id)]);
    if (agentAnswer?.answer) {
      setEntityAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Answering: “${prompt}”`));
    }
    setEntityAssistantLoading(false);
  }

  function switchMode(mode, tab = "map") {
    const nextFilter = mode === "partner" ? "All" : tab === "pass" ? "All" : activeFilter === "Saved" ? "Saved" : "All";
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    setSearch("");
    setActiveFilter(nextFilter);
    setDistrict(ALL_NEIGHBORHOODS);
    setRadius("5 min");
    setIntelOpen(false);
    setFiltersOpen(false);
    setNeighborhoodsOpen(false);
    setSecondaryRailOpen(true);
    setActiveBottomTab("map");
    setConsoleCollapsed(false);
    navigate(`/map?mode=${mode}&tab=${tab}${tab === "map" ? `&filter=${encodeURIComponent(nextFilter)}` : ""}`);
  }

  const heroPromptLabels = urlState.mode === "partner"
    ? []
    : ["Coffee", "Happy Hour", "Dinner", "Fitness", "Rooftops", "inKind", "Civic", "Properties"];
  const primarySearchFilters = urlState.mode === "partner"
    ? [
        { label: "Activity", filter: "All" },
        { label: "Campaigns", filter: "Brands" },
        { label: "Events", filter: "Events" },
        { label: "Perks", filter: "Perks" },
        { label: "Properties", filter: "Properties" },
        { label: "Trends", filter: "Local Guide" },
      ]
    : [
        { label: "Nearby", filter: "All" },
        { label: "Tonight", filter: "Happy Hours" },
        { label: "Perks", filter: "Perks" },
        { label: "Events", filter: "Events" },
        { label: "Places", filter: "Venues" },
        { label: "inKind", filter: "inKind" },
        { label: "Civic", filter: "Civic" },
        { label: "Properties", filter: "Properties" },
      ];
  const secondarySearchFilters = urlState.mode === "partner"
    ? [
        { label: "inKind", filter: "inKind" },
        { label: "Venues", filter: "Venues" },
        { label: "Hotels", filter: "Hotels" },
        { label: "Brands", filter: "Brands" },
        { label: "Civic", filter: "Civic" },
        { label: "Services", filter: "Services" },
        { label: "Local Guide", filter: "Local Guide" },
      ]
    : [];
  const simplifiedFilterSet = new Set([
    ...primarySearchFilters.map((item) => item.filter),
    ...secondarySearchFilters.map((item) => item.filter),
  ]);
  const overflowFilters = FILTERS.filter((filter) => !simplifiedFilterSet.has(filter));
  const hasOpenMapPanel = urlState.tab === "pass" || Boolean(selected) || Boolean(clusterDrawer) || (urlState.tab === "map" && activeBottomTab === "discover");
  const showBottomNavigation = urlState.tab === "map" && !hasOpenMapPanel;

  return (
    <div className="dp-map-page relative h-screen overflow-hidden bg-white pt-[68px] text-[#0B1F33]">
      <div className="absolute inset-x-0 bottom-0 top-[68px]">
        <MapContainer
          center={AUSTIN_CENTER}
          zoom={INITIAL_MAP_ZOOM}
          minZoom={13}
          maxZoom={20}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom
          zoomSnap={0.5}
          zoomDelta={0.5}
          className="dp-spatial-map h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={20}
            maxNativeZoom={20}
            minNativeZoom={0}
            keepBuffer={8}
            updateWhenIdle={false}
            updateWhenZooming
            detectRetina
            crossOrigin
          />
          <MapFocus selected={selected} />
          <MapResizeStabilizer watchKey={mapResizeKey} />
          <MapZoomTracker onZoomChange={(zoom) => setMapZoom((current) => (Math.abs(current - zoom) > 0.01 ? zoom : current))} />
          {clusteredMapItems.map((item) =>
            item.type === "cluster" ? (
              <ClusterMarker key={item.id} cluster={item} onOpen={openClusterDrawer} />
            ) : (
              <PlaceMarker
                key={item.id}
                place={item.place}
                selected={item.place.id === selectedId}
                pulsing={item.place.id === pulsingPinId}
                onSelect={selectPlace}
                onSelectNearestLegends={selectNearestLegendsListing}
                onHover={(place) => {
                  if (!isLegendsMapPlace(place)) setPulsingPinId(place.id);
                }}
                onHoverEnd={(place) => {
                  if (place.id !== selectedId) setPulsingPinId("");
                }}
              />
            ),
          )}
        </MapContainer>
      </div>

      {urlState.tab === "map" && (
        <div
          className={`pointer-events-none absolute inset-x-0 top-[106px] z-[510] px-2.5 md:top-[84px] md:px-5 ${consoleCollapsed ? "flex justify-center" : ""}`}
        >
          {consoleCollapsed ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setConsoleCollapsed(false)}
              className="dp-collapsed-map-search pointer-events-auto mx-auto inline-flex h-11 items-center gap-2 px-4 text-[12px] font-medium text-[#C8A96A]"
              aria-label="Collapsed map search"
              aria-expanded="false"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C8A96A]" />
              Ask the map
            </motion.button>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="dp-map-search-surface pointer-events-auto relative mx-auto max-h-[calc(100dvh-124px)] max-w-2xl overflow-y-auto"
            role="region"
            aria-label="Map command console"
          >
            <div className="dp-map-audience-tabs" role="tablist" aria-label="Map audience">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={urlState.mode === "resident"}
                      onClick={() => switchMode("resident", "map")}
                      className={`dp-map-audience-tab ${urlState.mode === "resident" ? "is-active" : ""}`}
                    >
                      Residents
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={urlState.mode === "partner"}
                      onClick={() => switchMode("partner", "map")}
                      className={`dp-map-audience-tab ${urlState.mode === "partner" ? "is-active" : ""}`}
                    >
                      Partners
                    </button>
                  </div>

            <button
              type="button"
              onClick={() => setConsoleCollapsed(true)}
              className="dp-console-rollup"
              aria-label="Collapse map controls"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <div className="dp-map-search-inner">
              <form onSubmit={runSearch} className="dp-hero-search-form">
                <div className="dp-hero-search-label">
                  <div className="dp-console-inline-ask">
                    Ask the map
                    <Sparkles className="h-3 w-3 text-[#C8A96A]" />
                  </div>
                </div>
                <div className="dp-hero-search-input-row">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activePrompt}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="min-w-0 flex-1"
                    >
                      <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          if (mapAnswer) setMapAnswer(null);
                        }}
                        className="w-full min-w-0 bg-transparent text-[24px] font-light leading-none text-[#0B1F33] placeholder:text-[#0B1F33]/35 focus:outline-none md:text-[28px]"
                      />
                    </motion.div>
                  </AnimatePresence>
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setSearch("");
                        setMapAnswer(null);
                      }}
                      className="dp-hero-search-clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button type="submit" className="sr-only">Ask the map</button>
              </form>

              {heroPromptLabels.length > 0 && (
                <div className="dp-suggested-prompt-row">
                  {heroPromptLabels.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => applyPrompt(prompt)} className="dp-suggested-prompt">
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              {urlState.mode === "resident" && (
                <div className="dp-search-rail-header">
                  <span className="dp-rail-kicker">Explore</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSecondaryRailOpen((value) => !value);
                      if (secondaryRailOpen) setNeighborhoodsOpen(false);
                    }}
                    className="dp-rail-toggle"
                    aria-expanded={secondaryRailOpen}
                    aria-label={secondaryRailOpen ? "Hide resident filter rail" : "Show resident filter rail"}
                  >
                    {secondaryRailOpen ? "Hide" : "Show"}
                    <ChevronUp className={`h-3.5 w-3.5 transition-transform ${secondaryRailOpen ? "" : "rotate-180"}`} />
                  </button>
                </div>
              )}
              <AnimatePresence initial={false}>
                {(urlState.mode === "partner" || secondaryRailOpen) && (
                  <motion.div
                    initial={urlState.mode === "resident" ? { opacity: 0, height: 0, y: -4 } : false}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="dp-search-context-row dp-search-context-row-primary">
                      {primarySearchFilters.map((item) => {
                        const active = item.filter === activeFilter;
                        return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFilter(item.filter)}
                      className={`dp-console-chip ${active ? "is-active" : ""}`}
                    >
                      {item.label}
                    </button>
                        );
                      })}
                      {urlState.mode === "resident" && (
                        <button
                          type="button"
                          onClick={() => {
                            setNeighborhoodsOpen((value) => !value);
                            setFiltersOpen(false);
                            setIntelOpen(false);
                          }}
                          className={`dp-console-chip ${neighborhoodsOpen ? "is-active" : ""}`}
                          aria-expanded={neighborhoodsOpen}
                        >
                          {isAllNeighborhoodScope(district) ? allAreaLabel : district}
                        </button>
                      )}
                      {urlState.mode === "partner" && secondarySearchFilters.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSecondaryRailOpen((value) => !value)}
                          className={`dp-console-chip dp-console-chip-icon ${secondaryRailOpen ? "is-active" : ""}`}
                          aria-expanded={secondaryRailOpen}
                          aria-label={secondaryRailOpen ? "Hide partner filter rail" : "Show partner filter rail"}
                        >
                          <ChevronUp className={`h-3.5 w-3.5 transition-transform ${secondaryRailOpen ? "" : "rotate-180"}`} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {urlState.mode === "partner" && secondarySearchFilters.length > 0 && secondaryRailOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="dp-search-context-row dp-search-context-row-secondary">
                      {secondarySearchFilters.map((item) => {
                        const active = item.filter === activeFilter;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setFilter(item.filter)}
                            className={`dp-console-chip ${active ? "is-active" : ""}`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setNeighborhoodsOpen((value) => !value);
                          setFiltersOpen(false);
                          setIntelOpen(false);
                        }}
                        className={`dp-console-chip ${neighborhoodsOpen ? "is-active" : ""}`}
                        aria-expanded={neighborhoodsOpen}
                      >
                        {radius}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {filtersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 pt-3">
                      {urlState.mode === "partner" && (
                        <div className="dp-search-filter-rail flex items-center gap-1 overflow-x-auto px-2.5 pb-0.5 md:px-3">
                          <span className="dp-console-chip pointer-events-none shrink-0">Scope</span>
                          {["5 min", "10 min", "District"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setRadius(item);
                                setDistrict(item === "District" ? ALL_NEIGHBORHOODS : district);
                                setMapAnswer(null);
                                urlState.update({ radius: item });
                              }}
                              className={`dp-console-chip ${radius === item ? "is-active" : ""}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    <div className="dp-search-filter-rail flex gap-1 overflow-x-auto px-2.5 pb-0.5 md:px-3">
                      {overflowFilters.map((filter) => {
                        const active = filter === activeFilter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setFilter(filter)}
                            className={`dp-console-chip ${active ? "is-active" : ""}`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="dp-console-chip"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    </div>
                  </motion.div>
                )}

                {neighborhoodsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2 border-t border-[#0B1F33]/8 pt-2">
                      {urlState.mode === "partner" && (
                        <div className="dp-search-filter-rail flex gap-1 overflow-x-auto px-2.5 pb-1 md:px-3">
                          {["5 min", "10 min", "District"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setRadius(item);
                                setDistrict(item === "District" ? ALL_NEIGHBORHOODS : district);
                                setMapAnswer(null);
                                urlState.update({ radius: item });
                              }}
                              className={`dp-console-chip ${radius === item ? "is-active" : ""}`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {NEIGHBORHOODS.map((neighborhood) => {
                        const active = neighborhood === district || (neighborhood === ALL_NEIGHBORHOODS && isAllNeighborhoodScope(district));
                        const label = neighborhood === ALL_NEIGHBORHOODS ? allAreaLabel : neighborhood;
                        return (
                    <button
                      key={neighborhood}
                      type="button"
                      onClick={() => setNeighborhood(neighborhood)}
                      className={`dp-console-chip ${active ? "is-active" : ""}`}
                      aria-pressed={active}
                    >
                      {label}
                    </button>
                        );
                      })}
                        <button
                          type="button"
                          onClick={() => setNeighborhoodsOpen(false)}
                          className="dp-console-chip"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {urlState.mode === "partner" && intelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[170px] overflow-y-auto pt-2 pr-1">
                      <div className="grid gap-2">
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {METRICS.map((metric) => (
                            <button
                              key={metric.id}
                              type="button"
                              onClick={() => setSelectedMetric(metric)}
                              className={`dp-map-metric-pill min-w-[112px] shrink-0 px-2.5 py-1.5 text-left transition ${
                                selectedMetric.id === metric.id ? "is-active" : ""
                              }`}
                            >
                              <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">{metric.label}</span>
                              <span className="mt-0.5 block text-[14px] font-semibold leading-none">{metric.value}</span>
                            </button>
                          ))}
                        </div>
                        <p className="mt-1 text-[12px] leading-5 text-[#425466]">{selectedMetric.copy}</p>
                        <div className="grid gap-1.5 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#C8A96A]">What people are doing</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">Open Activity for the fuller view.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#C8A96A]">Who is nearby</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">Residents, guests, and visitors around this area.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#C8A96A]">What to try next</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">See the bottom drawer for next steps.</p>
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                            }}
                            className="dp-map-control"
                          >
                            Open Activity
                          </button>
                          <Link to={campaignRoute(selected || undefined)} className="dp-map-control">Campaigns</Link>
                          <Link to={getPartnerDashboardRoute(selected || undefined, activeFilter)} className="dp-map-control">Reports</Link>
                          <button type="button" onClick={() => setIntelOpen(false)} className="dp-map-control">
                            <ChevronUp className="h-3.5 w-3.5" />
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            <AnimatePresence initial={false}>
            {mapAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="dp-info-section mt-2 overflow-hidden p-3"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A96A]" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Map answer</div>
                    <h3 className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{mapAnswer.title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-[#425466]">{mapAnswer.body}</p>
                    {mapAnswer.actions?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mapAnswer.actions.map((action) => (
                          <span key={action} className="inline-flex min-h-6 items-center bg-white/72 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)]">
                            {action}
                          </span>
                        ))}
                      </div>
                    )}
                    {mapAnswer.source === "openai" && (
                      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/38">
                        OpenAI agentic mode {mapAnswer.model ? `· ${mapAnswer.model}` : ""}
                      </div>
                    )}
                  </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapAnswer(null)}
                    className="dp-map-control inline-flex shrink-0 items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                    aria-label="Close map answer"
                  >
                    <X className="h-3.5 w-3.5" />
                    Close
                  </button>
                </div>
                {mapAnswer.picks.length > 0 && (
                  <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                    {mapAnswer.picks.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className="dp-panel-row shrink-0 px-2.5 py-1.5 text-left text-[11px] text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                      >
                        <span className="block max-w-[180px] truncate font-semibold">{place.name}</span>
                        <span className="block max-w-[180px] truncate text-[#425466]">{place.category} · {place.district}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
            </AnimatePresence>

            </div>
          </motion.div>
          )}
        </div>
      )}

      {urlState.tab === "pass" && (
        <div className="pointer-events-none absolute inset-0 z-[540] flex items-end justify-center bg-[#0B1F33]/10 p-2 backdrop-blur-[2px] sm:p-4 md:items-center">
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="dp-panel-shell dp-pass-panel pointer-events-auto flex max-h-[calc(100dvh-0.75rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-[2px] p-0 md:max-h-[calc(100dvh-2rem)] md:rounded-[2px]"
            role="dialog"
            aria-modal="true"
            aria-label={urlState.mode === "partner" ? "Partner scanner" : "Resident pass"}
          >
            <div className="dp-panel-header flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4 md:py-2.5">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">
                {urlState.mode === "partner" ? "Partner scanner" : "Resident pass"}
              </span>
              <button type="button" onClick={() => switchMode(urlState.mode, "map")} className="dp-panel-close inline-flex h-8 w-8 items-center justify-center rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9" aria-label={urlState.mode === "partner" ? "Close partner scanner" : "Close resident pass"}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="dp-pass-panel-body min-h-0 flex-1 overflow-y-auto px-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 md:pb-4 md:pt-3">
              {urlState.mode === "partner" ? (
                <>
                <div className="px-3 pt-1 sm:px-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">QR verification</p>
                  <h2 className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.025em] text-[#0B1F33] md:mt-1.5 md:text-[25px]">Partner Scan View</h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#425466]">
                    Scan a resident QR and confirm the access moment without adding another workflow.
                  </p>
                </div>
                <PartnerQrScanner
                  onVerified={() => {
                    setPassPresented(true);
                  }}
                />
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  <button type="button" onClick={() => switchMode("resident", "pass")} className="dp-pass-action">Resident Pass</button>
                  <button type="button" onClick={() => switchMode("partner", "map")} className="dp-pass-action dp-pass-action-primary">Partner Map</button>
                </div>
                </>
              ) : (
                <>
                <div className="flex items-start justify-between gap-3 md:gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">Card access</p>
	                    <h2 className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.025em] text-[#0B1F33] md:mt-1.5 md:text-[25px]">Downtown Perks Card</h2>
                    <p className="mt-1.5 text-[12px] leading-5 text-[#425466]">
                      Show the QR when a partner asks for resident access.
                    </p>
                  </div>
                </div>
                <div className="dp-resident-pass-card-grid mt-3 grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <DemoQrTile />
                  <div className="dp-info-row p-3 text-left">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#C8A96A]" />
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#0B1F33]/56">Downtown Perks</div>
                    </div>
                    <div className="mt-2 text-lg font-semibold leading-tight text-[#0B1F33]">Resident Card</div>
                    <p className="mt-2 text-[11px] leading-5 text-[#425466]">
                      {passPresented ? "Pass ready. Show this code to the partner staff member." : "Tap Present Pass when you are ready to redeem a perk or check in."}
                    </p>
                  </div>
                </div>
                <ResidentPassDashboard
                  savedPlaces={residentSavedPlaces}
                  perkPlaces={residentPerkPlaces}
                  eventRsvps={eventRsvps}
                  passPresented={passPresented}
                  walletAdded={walletAdded}
                  savedCount={savedIds.size}
                  perkCount={residentPerkPlaces.length}
                  rsvpCount={eventRsvps.length}
                  onOpenSaved={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Saved");
                    navigate("/map?mode=resident&tab=map&filter=Saved");
                  }}
                  onOpenPerks={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Perks");
                    navigate("/map?mode=resident&tab=map&filter=Perks");
                  }}
                  onOpenRsvps={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Events");
                    navigate("/map?mode=resident&tab=map&filter=Events");
                  }}
                  onOpenPass={() => setPassPresented(true)}
                />
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  <button type="button" onClick={() => setPassPresented(true)} className="dp-pass-action dp-pass-action-primary">{passPresented ? "Pass Ready" : "Present Pass"}</button>
                  <button type="button" onClick={() => setWalletAdded(true)} className="dp-pass-action">{walletAdded ? "Wallet Added" : "Add Wallet"}</button>
                  <button type="button" onClick={() => navigate("/map?mode=resident&tab=map&filter=Perks")} className="dp-pass-action">Perks</button>
                  <button type="button" onClick={() => switchMode("partner", "pass")} className="dp-pass-action">Partner Scan</button>
                </div>
                </>
              )}
            </div>
          </motion.section>
        </div>
      )}

	      {showBottomNavigation && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[700] pb-[env(safe-area-inset-bottom)]">
          <nav
            className={`dp-map-bottom-nav pointer-events-auto grid ${urlState.mode === "resident" ? "grid-cols-6" : "grid-cols-5"}`}
            aria-label="Map bottom navigation"
          >
            {urlState.mode === "resident" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("All");
                    navigate("/map?mode=resident&tab=map&filter=All");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "map" && activeFilter === "All"}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Perks");
                    navigate("/map?mode=resident&tab=map&filter=Perks");
                  }}
                  aria-pressed={urlState.tab === "map" && activeFilter === "Perks"}
                >
                  <Gift className="h-4 w-4" />
                  <span>Perks</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Events");
                    navigate("/map?mode=resident&tab=map&filter=Events");
                  }}
                  aria-pressed={urlState.tab === "map" && activeFilter === "Events"}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Events</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("map");
                    setActiveFilter("Saved");
                    navigate("/map?mode=resident&tab=map&filter=Saved");
                  }}
                  aria-pressed={urlState.tab === "map" && activeFilter === "Saved"}
                >
                  <Check className="h-4 w-4" />
                  <span>Saved</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("resident", "pass")}
                  aria-pressed={urlState.tab === "pass"}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  aria-pressed={aboutOpen}
                >
                  <Info className="h-4 w-4" />
                  <span>Info</span>
                </button>
              </>
            )}
            {urlState.mode === "partner" && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode("partner", "map")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "map"}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </button>
                <Link to={campaignRoute(selected || undefined)}>
                  <Sparkles className="h-4 w-4" />
                  <span>Campaigns</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBottomTab("discover");
                    if (urlState.tab !== "map") switchMode("partner", "map");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "discover"}
                >
                  <ScanLine className="h-4 w-4" />
                  <span>Activity</span>
                  {contextCount > 0 && <span className="dp-nav-activity-badge">{Math.min(contextCount, 9)}</span>}
                </button>
                <Link to={getPartnerDashboardRoute(selected || undefined, activeFilter)}>
                  <ArrowRight className="h-4 w-4" />
                  <span>Reports</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  aria-pressed={aboutOpen}
                >
                  <Info className="h-4 w-4" />
                  <span>Info</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      <AnimatePresence>
        {urlState.tab === "map" && activeBottomTab === "discover" && !selected && (
          <motion.aside
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell fixed inset-x-0 bottom-0 z-[620] mx-auto flex max-h-[58vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[2px] p-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:max-h-[64vh] md:rounded-t-2xl md:p-3 md:pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
            role="dialog"
            aria-modal="true"
            aria-label={urlState.mode === "partner" ? "Partner map results" : "Map results"}
          >
            <div className="mx-auto mb-2 h-0.5 w-10 shrink-0 rounded-[2px] bg-[#0B1F33]/14 md:mb-3 md:h-1 md:w-12" aria-hidden="true" />
            <div className="mb-2 flex shrink-0 items-center justify-between gap-2 md:mb-3 md:gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">
                  {urlState.mode === "partner" ? "Partner map" : "Downtown nearby"}
                </div>
                <div className="mt-0.5 text-[12px] font-semibold text-[#0B1F33] md:text-[13px]">
                  {contextLabel}
                </div>
                {isUsingFallbackPlaces && (
                  <div className="mt-1 text-[12px] leading-4 text-[#425466]">
                    Showing nearby downtown places while you narrow the search.
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveBottomTab("map")}
                className="dp-panel-close flex h-8 w-8 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9"
                aria-label="Close discover results"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {urlState.mode === "partner" && (
              <div className="dp-partner-intel-grid mb-3 grid shrink-0 gap-2 md:grid-cols-3">
                {(activeFilter === "Brands"
                  ? [
                      ["What people are noticing", "Brand moments tied to nearby residents, events, and walkable plans."],
                      ["Who is close enough", "Residents, visitors, and event-goers already moving through the selected area."],
                      ["What to try next", "Campaigns, surveys, and placements that are easy to act on nearby."],
                    ]
                  : [
                      ["What people are looking for", "Searches, saves, scans, and card views grouped by time of day."],
                      ["Who is nearby", "Residents, visitors, and event-goers around the selected area."],
                      ["What to try next", "Places and moments that are close enough for people to act on."],
                    ]).map(([title, body]) => (
                  <div key={title} className="dp-partner-intel-card p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0B1F33]">{title}</div>
                    <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/68">{body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] md:space-y-2">
              {previewPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectPlace(place)}
                  className={`grid w-full grid-cols-[34px_1fr_auto] items-center gap-2 p-1.5 text-left transition-all hover:-translate-y-0.5 md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2 ${
                    place.id === selectedId ? "dp-panel-row is-selected text-[#0B1F33]" : "dp-panel-row text-[#0B1F33]"
                  }`}
                >
                  <PinBadge place={place} selected={place.id === selectedId} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{place.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] opacity-58">{place.category || "Downtown place"} · {place.district}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-42" />
                </button>
              ))}
              {!previewPlaces.length && (
                <div className="dp-info-row bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  Keeping useful downtown picks ready while this view narrows. Open {areaRailLabel}, adjust the filter rail, or ask the map for a better match nearby.
                </div>
              )}
              {isUsingFallbackPlaces && (
                <div className="dp-info-row bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  Keeping nearby downtown places visible while your question sorts the best next options.
                </div>
              )}
              {displayPlaces.length > 4 && (
                <button
                  type="button"
                  onClick={() => setResultsExpanded((value) => !value)}
                  className="w-full bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/56 transition hover:-translate-y-0.5 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  aria-expanded={resultsExpanded}
                >
                  {resultsExpanded ? "Show fewer results" : `Expand results (${hiddenPreviewCount} more)`}
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clusterDrawer && urlState.tab === "map" && !selected && (
          <motion.aside
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell fixed inset-x-0 bottom-0 z-[640] mx-auto flex max-h-[62vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[2px] md:max-h-[68vh] md:rounded-t-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Grouped map places"
          >
            <div className="dp-panel-header shrink-0">
              <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-[2px] bg-[#0B1F33]/14 md:mt-2 md:h-1 md:w-12" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">
                    {getClusterTitle(clusterDrawer, urlState.mode)}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#0B1F33]">
                    {getClusterSubtitle(clusterDrawer, urlState.mode)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClusterDrawer(null);
                    setActiveBottomTab("map");
                  }}
                  className="dp-panel-close rounded-[2px] p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  aria-label="Close grouped places"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:space-y-2 md:px-4 md:py-4 md:pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {clusterPlacesForDrawer.map((place) => {
                const perk = getResidentPerkDetails(place);
                const listing = getLegendsListing(place);
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="dp-panel-row grid w-full grid-cols-[34px_1fr_auto] items-center gap-2 p-2 text-left text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2.5"
                  >
                    <PinBadge place={place} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{place.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#0B1F33]/58">{place.category || "Downtown place"} · {place.district}</span>
                      {listing && (
                        <span className="mt-1 block truncate text-[11px] text-[#0B1F33]/68">
                          {[listing.price, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqft ? `${listing.sqft} sqft` : ""].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {urlState.mode === "resident" && (
                        <span className="mt-1 block truncate text-[11px] text-[#C8A96A]">{perk.offer}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52">
                      {listing ? "Contact" : "Open"}
                      <ArrowRight className="h-4 w-4 text-[#C8A96A]" />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && urlState.tab !== "pass" && (
          <motion.aside
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell dp-detail-drawer dp-destination-drawer fixed inset-x-0 bottom-0 z-[650] mx-auto flex h-[84vh] max-h-[84vh] min-h-0 w-full max-w-[720px] flex-col overflow-hidden rounded-t-[12px] md:bottom-0 md:h-[88vh] md:max-h-[88vh] md:max-w-[760px] md:rounded-t-[12px]"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} details`}
          >
            <div className="dp-destination-header shrink-0">
              <div className="min-w-0 flex-1" aria-hidden="true" />
              <button
                type="button"
                onClick={() => {
                  setSelectedId("");
                  setActiveBottomTab("map");
                  urlState.update({ entityId: "" });
                }}
                className="dp-destination-close"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="dp-destination-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(1.25rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {(() => {
                const entityKind = getResidentEntityKind(selected);
                const legendsListing = getResolvedLegendsListing(selected);
                const isProperty = entityKind === "property" || Boolean(legendsListing || getLuxuryPresenceBuilding(selected));
                const isDaaStop = isDaaTourPlace(selected);
                const contactFormId = `map-contact-form-${selected.id}`;
                const openContactForm = () => {
                  setAgentFormPlaceId(selected.id);
                  setAgentFormSubmitted(false);
                  window.setTimeout(() => {
                    document.getElementById(contactFormId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                  }, 80);
                };

                return (
                  <motion.div className="dp-destination-content">
                    <DestinationHero place={selected} mode={urlState.mode} />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                      <PanelContext place={selected} mode={urlState.mode} />
                    </motion.div>
                    {isProperty && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.18 }}>
                        <LegendsMLSFactsSection place={selected} mode={urlState.mode} onSelect={selectPlace} />
                      </motion.div>
                    )}
                    {isHappyHourEntity(selected) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.18 }}>
                        <HappyHourDetails place={selected} />
                      </motion.div>
                    )}
                    {(selected.raw?.isWaterlooPark || selected.isWaterlooPark) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.18 }}>
                        <WaterlooDetails place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    {isDaaStop ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.18 }}>
                        <DaaTourDetails place={selected} places={places} onSelect={selectPlace} savedIds={savedIds} onSave={() => toggleSaved(selected)} />
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.18 }}>
                        {urlState.mode === "partner" ? (
                          <PartnerDrawerActions place={selected} />
                        ) : (
                          <ResidentDrawerActions
                            selected={selected}
                            selectedResidentAction={selectedResidentAction}
                            savedIds={savedIds}
                            eventRsvps={eventRsvps}
                            legendsListing={legendsListing}
                            agentFormPlaceId={agentFormPlaceId}
                            onContact={openContactForm}
                            onRsvp={() => toggleRsvp(selected)}
                            onShowCard={() => switchMode("resident", "pass")}
                            onSave={() => toggleSaved(selected)}
                          />
                        )}
                      </motion.div>
                    )}

                    {!isProperty && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56, duration: 0.18 }}>
                        <EntityAssistant
                          place={selected}
                          mode={urlState.mode}
                          answer={entityAnswer}
                          loading={entityAssistantLoading}
                          onAsk={askEntityAssistant}
                          onClose={() => setEntityAnswer(null)}
                          onSelect={selectPlace}
                        />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.18 }}>
                        <ResidentPerkDetails place={selected} />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isProperty ? 0.56 : 0.68, duration: 0.18 }}>
                        <KnownForSection place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}

                    {!isProperty && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.74, duration: 0.18 }}>
                        <WhyGoChips place={selected} onAsk={askEntityAssistant} onContact={undefined} />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isProperty ? 0.62 : 0.8, duration: 0.18 }}>
                        <NearbyContext place={selected} places={places} onSelect={selectPlace} />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.86, duration: 0.18 }}>
                        <PeopleAlsoVisit place={selected} places={places} onSelect={selectPlace} />
                      </motion.div>
                    )}

                    {isProperty && legendsListing && agentFormPlaceId === selected.id && (
                      <LegendsContactForm
                        formId={contactFormId}
                        listing={{
                          ...legendsListing,
                          fullAddress: `${legendsListing.address}, ${legendsListing.city}, ${legendsListing.state} ${legendsListing.zip}`,
                        }}
                      />
                    )}

                    <AnimatePresence initial={false}>
                      {isProperty && !legendsListing && agentFormPlaceId === selected.id && (
                        <motion.form
                          id={contactFormId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          onSubmit={(event) => {
                            event.preventDefault();
                            setAgentFormSubmitted(true);
                          }}
                          className="dp-contact-continuation mt-8 md:mt-10"
                        >
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Interested?</div>
                            <h3 className="mt-1 text-[16px] font-semibold text-[#0B1F33]">Contact Legends Real Estate</h3>
                          </div>

                          {agentFormSubmitted ? (
                            <div className="mt-5 border-t border-[rgba(11,31,51,.06)] pt-5 text-[13px] leading-5 text-[#0B1F33]/70">
                              Sent. The listing request is ready for the agent with this property attached.
                            </div>
                          ) : (
                            <>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:mt-4">
                                <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                  Name
                                  <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70 md:h-10" placeholder="Your name" />
                                </label>
                                <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                  Email
                                  <input required type="email" className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70 md:h-10" placeholder="you@example.com" />
                                </label>
                              </div>
                              <label className="mt-2 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Message
                                <textarea name="message" className="min-h-20 dp-soft-field rounded-[8px] bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" defaultValue={`I would like more information about ${selected.name}.`} />
                              </label>
                              <button type="submit" className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-[8px] bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-normal text-white transition hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-11 md:gap-2 md:px-5">
                                Send Request
                                <Send className="h-3.5 w-3.5 text-[#C8A96A] md:h-4 md:w-4" />
                              </button>
                            </>
                          )}
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AboutDowntownPerksModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
