import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Coffee,
  CreditCard,
  CalendarDays,
  CalendarRange,
  Car,
  Clock,
  Dumbbell,
  Gift,
  Heart,
  HeartPulse,
  BadgePercent,
  Info,
  Landmark,
  MapPin,
  Megaphone,
  Moon,
  Music2,
  Navigation,
  Route,
  ScanLine,
  Search,
  Send,
  Sparkles,
  Star,
  TicketPercent,
  TrendingUp,
  Utensils,
  Users,
  Wine,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import AboutDowntownPerksModal from "@/components/modals/AboutDowntownPerksModal";
import EntityDiscoveryGrid from "@/components/map/EntityDiscoveryGrid";
import EntityIdentityPanel from "@/components/map/unified/EntityIdentityPanel";
import MapActionStandardPanel from "@/components/map/MapActionStandardPanel";
import { AppButton } from "@/components/ui/AppButton";
import { useMapEntityData } from "@/hooks/useMapEntityData";
import { directionsUrl, campaignRoute, mapRoutes } from "../lib/map/mapActionRegistry";
import { resolveMapEntityAlias, resolveMapEntityFromCollection, resolvePropertyListingUrlId, resolvePropertyUrlEntityId } from "../lib/mapEntityAliases";
import { resolveEntityGallery, resolveEntityImage, resolveMapImage } from "../lib/map/entityImageResolver";
import { resolveEntityPanelArchetype, resolveEntityPanelContent } from "../lib/map/entityPanelArchetypes";
import { resolveEntityPin } from "../lib/map/entityPinResolver";
import { normalizeMapIconKey } from "../lib/map/mapIconRegistry";
import { formatDistanceLabel, getDistanceMeters, getNearbyRecommendations } from "@/utils/nearbyRecommendations";
import { getRelatedRecommendations } from "@/utils/relatedRecommendations";
import { buildMapIntelligence } from "@/utils/mapIntelligence";
import { getNearbyPartnerOpportunities } from "@/utils/nearbyPartnerOpportunities";
import { recommendCampaigns } from "@/utils/recommendCampaigns";
import { getRelatedPartnerAssets } from "@/utils/relatedPartnerAssets";
import { getEntityAgentQuestions } from "@/platform";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { fireWorkflow, getWorkflowProfileId, getWorkflowSessionId, postWorkflow } from "@/lib/backendWorkflows";
import { getDaaCheckIn, recordDaaCheckIn } from "@/lib/daaCheckIns";
import { trackingEvents } from "@/lib/analytics/track";
import { queryAgent } from "@/services/agent/agentClient";
import { legendsListingPlaces } from "@/data/legendsListings";
import { luxuryPresenceListings } from "@/data/luxuryPresenceInventory";
import { getLegendsPropertyContent } from "@/data/legendsPropertyContent";
import {
  createGenericLegendsResidentialExperience,
  getLegendsResidentialExperience,
  legendsResidentialAnalytics,
} from "@/data/legendsResidentialExperience";
import { theShoreResidentialBuilding } from "@/data/theShoreResidentialBuilding";
import { brandCampaignExamples, liveCampaignLayerExamples } from "@/data/campaignLayerExamples";
import { DAA_TOUR_STOP_COUNT, daaArtWalkImages, getDaaTourStopById } from "@/data/daaArtParksTour";
import {
  DPParkingReservation,
  DPQuickActions,
  DPPricingRail,
  quickActionsByEntityType,
} from "@/components/downtown-perks/primitives";
import { getGoogleMapsConfigError, loadGoogleMaps } from "@/lib/googleMapsLoader";
import { PRIMARY_SEARCH_INTENT_RAIL, SECONDARY_SEARCH_INTENT_RAIL } from "@/components/map/searchIntentRailConfig";
import { parseSearchIntent, searchIntentToFilter } from "@/map/searchIntent/searchIntentParser";
import CollectionRoutePanel from "@/components/map/CollectionRoutePanel";
import { getMapCollectionById, getMapCollectionForQuery } from "@/data/mapCollections";
import { resolveMapCollectionRoute } from "@/lib/map/collectionRoutes";

const RAINEY_STREET_CENTER = [30.25855, -97.73835];
const AUSTIN_CENTER = RAINEY_STREET_CENTER;
const INITIAL_MAP_ZOOM = 15.6;
const SELECTED_ROUTE_INITIAL_MAX_ZOOM = 16.4;
const MAP_MAX_ZOOM = 22;
const MAP_STREET_FOCUS_ZOOM = 18;
const INITIAL_DISCOVERY_MARKER_LIMIT = 16;
const DEFAULT_INTERACTION_MARKER_LIMIT = 36;
const DEFAULT_HIGH_ZOOM_MARKER_LIMIT = 60;
const INTENT_MARKER_FALLBACK_LIMIT = 96;
const FOCUSED_INTENT_MARKER_LIMIT = 28;
const FOCUSED_INTENT_HIGH_ZOOM_LIMIT = 44;
const FOCUSED_INTENT_FILTERS = new Set([
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Dessert",
  "Dining",
  "Coffee",
  "Drinks",
  "Cocktails",
  "Happy Hour",
  "Happy Hours",
  "Happy Hour Now",
  "Happy Hour Today",
  "Perks",
  "Events",
  "Live Music",
  "Fitness",
  "Wellness",
  "Retail",
  "Parking",
  "Brand Activations",
  "Campaigns",
  "inKind",
]);
const MAP_VIEW_STORAGE_KEY = "downtown-perks-map-view-v1";
const MAP_USER_NAVIGATED_STORAGE_KEY = "downtown-perks-map-user-navigated-v1";
const MAP_USER_CONTEXT_STORAGE_KEY = "downtown-perks-map-user-context-v1";
const MAP_PANEL_IMAGE_FALLBACK = "/images/map-entities/perks/civic_republic_square_1779052838327.png";
const STREET_LEVEL_ZOOM = 18.25;
const DAA_CIVIC_VIDEOS = [
  {
    title: "DAA Art Walk",
    label: "Public art route",
    src: "/videos/partners/civic/daa-art-walk.mp4",
  },
  {
    title: "Welcome to Downtown",
    label: "Downtown event context",
    src: "/videos/partners/civic/daa-welcome-to-downtown-event.mp4",
  },
  {
    title: "Bike Lanes",
    label: "Mobility and public realm",
    src: "/videos/partners/civic/daa-bike-lanes.mp4",
  },
  {
    title: "Waterloo Loop",
    label: "Connected civic route",
    src: "/videos/partners/civic/daa-waterloo-loop.mp4",
  },
];
const LEGENDS_BRAND_LINE = "Legends Real Estate";
const LEGENDS_PIN_LOGO = "/pins/circular/special/legends-badge.svg";
const MAP_DRAWER_SURFACE_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.94)",
  backgroundImage: "none",
  border: "1px solid rgba(11, 31, 51, 0.06)",
  borderBottom: 0,
  borderRadius: "20px 20px 0 0",
  boxShadow: "0 -16px 44px rgba(11, 31, 51, 0.10)",
  color: "#0B1F33",
  WebkitTextFillColor: "#0B1F33",
  WebkitBackdropFilter: "blur(10px) saturate(1.1)",
  backdropFilter: "blur(10px) saturate(1.1)",
};
const FILTERS = [
  "All",
  "Saved",
  "Nearby",
  "Open Now",
  "Tonight",
  "Walkable",
  "This Week",
  "Perks",
  "Events",
  "Campaigns",
  "Brand Activations",
  "Explore Downtown",
  "Discovery Trails",
  "Places",
  "Dining",
  "Coffee",
  "Drinks",
  "Breakfast",
  "Brunch",
  "Lunch",
  "Dinner",
  "Dessert",
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
  "Living Here",
  "All Listings",
  "Luxury",
  "Waterfront",
  "Downtown Core",
  "Seaholm",
  "Rainey",
  "Congress",
  "Move-In Ready",
  "Newest Listings",
  "Listings",
  "Legends",
  "Rentals",
  "Venues",
  "Hotels",
  "Hospitality",
  "Staycations",
  "Parking",
  "Brands",
  "Live Music",
  "Arts & Culture",
  "Culture",
  "Walking",
  "Family",
  "Fitness",
  "Wellness",
  "Retail",
  "Waterfront",
  "Grocery",
  "Transit",
  "Mobility",
  "EV Charging",
  "Bike Share",
  "Visitor Info",
  "Print",
  "Printing",
  "Pharmacy",
  "Cleaners",
  "Shipping",
  "Food Trucks",
  "Markets",
  "Public Art",
  "DAA",
  "DANA",
  "Civic",
  "Services",
  "Local Guide",
];

const MAP_NATIVE_PARTNER_PANELS = ["campaigns", "activity", "reports", "info", "civic"];
const MAP_NATIVE_RESIDENT_PANELS = ["info", "perks", "events", "saved"];
const MAP_COLLECTION_FILTER_ALIASES = {
  legends: "Legends",
  inkind: "inKind",
  "daa-art-walk": "Civic",
  "waterloo-greenway": "Civic",
  rainey: "Rainey",
  "rainey-district": "Rainey",
  "date-night": "Dinner",
  "happy-hour": "Happy Hour",
  "warehouse-district-happy-hour": "Happy Hour",
  "inkind-dining-market": "inKind",
  "downtown-stories-walk": "Civic",
  "coffee-before-work": "Coffee",
  "hotel-guest-arrival-route": "Hotels",
  "live-music": "Live Music",
  "weekend-plans": "Events",
  "civic-downtown": "Civic",
};
const MAP_LAYER_FILTER_ALIASES = {
  parking: "Parking",
  properties: "Properties",
  hotels: "Hotels",
  events: "Events",
  perks: "Perks",
  civic: "Civic",
  services: "Services",
  mobility: "Services",
};

const DISCOVER_FEATURED_ORDER = [
  "priority-the-waterline",
  "priority-the-paseo",
  "priority-the-independent",
  "priority-70-rainey",
  "property-the-shore",
  "luxury-building-seaholm-residences",
  "partner-hotel-van-zandt",
  "partner-four-seasons",
  "partner-geraldines",
  "partner-emmer-rye",
  "partner-bangers",
  "partner-stay-put",
  "partner-yeti",
  "partner-rivian",
  "partner-lululemon",
  "partner-fine-eyewear",
  "waterloo-park",
  "moody-amphitheater",
  "event-hotel-van-zandt-first-thursday",
  "event-first-thursday-hotel-van-zandt",
  "event-parker-jazz-club",
  "republic-austin-the-republic",
  "republic-austin-republic-square-park",
  "republic-austin-acl-live",
  "republic-austin-austin-central-library",
];

const DISCOVER_FEATURED_TERMS = [
  "waterline",
  "paseo",
  "the independent",
  "70 rainey",
  "the shore",
  "seaholm residences",
  "hotel van zandt",
  "four seasons",
  "geraldine",
  "emmer",
  "banger",
  "stay put",
  "yeti",
  "rivian",
  "lululemon",
  "fine eyewear",
  "waterloo park",
  "moody amphitheater",
  "first thursday",
  "parker jazz",
  "acl live",
  "republic square park",
  "austin central library",
];

function luxuryPresenceListingToPlace(listing) {
  if (!listing) return null;

  const sqftDisplay = listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "";
  const residentialContent = listing.legendsResidentialContent || getLegendsPropertyContent(listing);
  return {
    id: listing.id || listing.listing_id,
    name: listing.address,
    type: "property",
    partnerType: "properties",
    brand: LEGENDS_BRAND_LINE,
    pinKey: "legends",
    category: "Residential Property",
    category_key: "residential_property legends listing mls",
    latitude: listing.lat,
    longitude: listing.lng,
    district: listing.district,
    address: listing.address,
    summary: residentialContent?.summary || "This Downtown Austin residence is currently available through Legends Real Estate.",
    image: listing.panelImage || listing.primaryImage || listing.heroImage,
    primaryImage: listing.primaryImage,
    heroImage: listing.heroImage,
    panelImage: listing.panelImage,
    mobileCardImage: listing.mobileCardImage,
    thumbnail: listing.thumbnail,
    galleryImages: listing.galleryImages,
    raw: {
      luxuryPresenceListing: true,
      legendsResidentialContent: residentialContent,
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
    source: listing.source || "Legends listing feed",
  };
}

const luxuryPresenceListingPlaces = luxuryPresenceListings
  .map(luxuryPresenceListingToPlace)
  .filter(Boolean);

const FILTER_MATCHERS = {
  Perks: ["offer", "perk", "deal", "discount", "reward", "card"],
  Breakfast: ["breakfast", "morning", "coffee", "pastry", "bakery", "brunch"],
  Brunch: ["brunch", "breakfast", "weekend", "morning", "pastry", "bakery"],
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
  inKind: ["inkind", "in kind", "dining credit", "restaurant credit"],
  Properties: ["property", "residential", "apartment", "condo", "tower", "listing", "building"],
  Venues: ["venue", "bar", "restaurant", "coffee", "dining", "nightlife", "retail", "store"],
  Hotels: ["hotel", "hospitality", "stay", "guest"],
  Hospitality: ["hospitality", "hotel", "guest", "visitor", "concierge", "four seasons", "live oak", "ciclo", "spa", "staycation"],
  Staycations: ["staycation", "staycations", "weekend escape", "hotel experience", "resident hotel", "hosting visitors", "four seasons", "proper", "zaza", "van zandt", "the loren"],
  Parking: ["parking", "garage", "reservable parking", "resident rate"],
  Rentals: ["rental", "rentals", "leasing", "lease", "available under", "bedroom rental", "mls", "property manager", "package service", "rooftop lounge"],
  Brands: ["brand", "sponsor", "rivian", "yeti", "topo chico", "fine eyewear", "inspired closets", "the stay put", "waterline", "ariat", "lululemon", "equinox", "legends real estate"],
  "Brand Activations": ["brand activation", "brand activations", "activation", "sponsor", "rivian", "yeti", "topo chico", "fine eyewear", "ariat", "lululemon", "equinox", "heritage boots"],
  Events: ["event", "activation", "music", "show", "festival", "rsvp"],
  Campaigns: ["campaign", "passport", "challenge", "guide", "access", "perk week", "series", "reward", "route", "collection"],
  "Discovery Trails": ["discovery trail", "discovery_marker", "discovery marker", "see austin differently", "golden hour", "waterloo reflection", "photo trail", "vision of austin"],
  "Explore Downtown": ["explore downtown", "public art", "mural", "historic", "landmark", "community story", "waterloo", "park", "greenway", "cultural destination", "civic"],
  "Live Music": ["live music", "concert", "moody amphitheater", "show"],
  Culture: ["culture", "entertainment", "library", "city hall", "history", "museum"],
  Walking: ["walking", "walk", "trail", "waller creek"],
  Family: ["family", "pavilion", "children", "play"],
  Fitness: ["fitness", "wellness", "yoga", "running"],
  Wellness: ["wellness", "recovery", "bathhouse", "sauna", "cold plunge", "massage", "sound bath", "hydrotherapy", "spa", "self care", "mental reset", "relaxation", "recharge"],
  Waterfront: ["waterfront", "lady bird lake", "trail", "ann roy butler", "congress bridge", "lake", "water"],
  Grocery: ["grocery", "pharmacy", "market", "essentials", "convenience"],
  Transit: ["transit", "metro", "mobility"],
  "EV Charging": ["ev charging", "ev_charging"],
  "Food Trucks": ["food truck", "food trucks"],
  Markets: ["market", "markets", "shopping"],
  "Public Art": ["public art", "art installation", "arts"],
  Civic: ["civic", "public", "district", "city"],
  Services: ["service", "services", "local service", "home service", "roof", "roofer", "plumber", "plumbing", "restoration", "water damage", "insurance", "bank", "mortgage", "lawyer", "legal", "condo", "real estate", "property manager", "hoa", "orthodontist", "volunteer", "church", "business registration", "interior design", "windows", "closets"],
  Nightlife: ["nightlife", "bar", "cocktail", "music", "late night"],
  "Arts & Culture": ["art", "arts", "culture", "museum", "gallery", "historic", "daa", "tour"],
  Walkable: ["walk", "walking", "walkable", "nearby", "trail"],
  Trending: ["trending", "popular", "saved", "active", "interest"],
  Nearby: ["nearby", "walkable", "around the corner", "downtown"],
  Performance: ["performance", "report", "analytics", "insight", "scan", "save", "redemption"],
  Opportunity: ["opportunity", "coverage", "campaign", "activation", "launch"],
  Coverage: ["coverage", "gap", "visibility", "low coverage"],
  Audience: ["audience", "resident", "guest", "nearby", "engagement"],
  Residents: ["resident", "building", "property", "home", "apartment"],
  Surveys: ["survey", "question", "feedback", "response"],
  Broadcasts: ["broadcast", "announcement", "visibility", "placement"],
  Activations: ["activation", "campaign", "event", "placement"],
  "Local Guide": ["guide", "local", "downtown", "austin"],
  Visibility: ["venue", "bar", "restaurant", "coffee", "hotel", "property", "brand", "event", "perk"],
  Reports: ["venue", "bar", "restaurant", "coffee", "hotel", "property", "brand", "event", "perk"],
  Listings: ["listing", "legends", "mls", "for rent", "for sale"],
  Legends: ["legends", "legends real estate", "legends listing", "mls", "for rent", "for sale"],
};

const RESIDENT_ASK_PROMPTS = [
  "Coffee nearby",
  "Dinner tonight",
  "Happy hour now",
  "Things to do",
  "Live music",
  "inKind nearby",
];

const PARTNER_ASK_PROMPTS = [
  "Saved nearby",
  "Promote next",
  "Busy buildings",
  "inKind nearby",
  "Events watched",
  "Interest nearby",
];

const PARTNER_CONTEXT_PROMPTS = {
  Properties: [
    "Resident interest",
    "Saved perks",
    "Busy buildings",
    "Share next",
  ],
  Hotels: [
    "Guest interest",
    "Saved nearby",
    "Hotel offers",
  ],
  Venues: [
    "Guest traffic",
    "Top event",
    "Run next",
  ],
  inKind: [
    "inKind nearby",
    "Dining interest",
    "Dinner push",
  ],
  Brands: [
    "Show up",
    "Busy areas",
    "Audience",
  ],
  Civic: [
    "Public places",
    "Civic interest",
    "Art walk",
  ],
  "Real Estate": [
    "Home interest",
    "Tours nearby",
    "Listing saves",
  ],
};

const CANONICAL_CATEGORY_LABELS = {
  venue: "Venue",
  rental: "Rental",
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
  mobility: "Mobility",
  music: "Music",
  entertainment: "Entertainment",
  perk: "Perks",
  offer: "Perks",
  campaign: "Campaigns",
  discovery_marker: "Discovery Trail",
  place: "Place",
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

const LEGENDS_ANALYTICS_INSIGHT_COPY = {
  "Building Views": {
    signal: "How often people open this building before anything else.",
    why: "A first open usually means the address is already part of someone's search.",
    action: "Keep the strongest photos, location details, and nearby context easy to see.",
  },
  "Listing Views": {
    signal: "How often people move from the building into a specific available home.",
    why: "That shift usually means someone is comparing real options, not just browsing.",
    action: "Make the listing details, photos, and next step clear while interest is fresh.",
  },
  "Save Rate": {
    signal: "How often people save a building, listing, or nearby place.",
    why: "Saves are quiet, but they usually mean someone wants to come back and compare.",
    action: "Use high save-rate places to guide follow-up, tour prompts, and comparison copy.",
  },
  "Tour Requests": {
    signal: "How often interest turns into a request to see the space.",
    why: "A tour request is a clear sign that the person is ready for a more direct next step.",
    action: "Make availability, timing, and contact details simple to confirm.",
  },
  "Neighborhood Opens": {
    signal: "How often people open the surrounding district, walkability, and lifestyle context.",
    why: "The block around the building often matters as much as the home itself.",
    action: "Show the nearby places and daily routines that make the location easier to understand.",
  },
  "Nearby Entity Clicks": {
    signal: "Which nearby restaurants, hotels, wellness spots, civic places, and services people open next.",
    why: "Those clicks show what makes the address feel useful in real life.",
    action: "Bring the strongest nearby places into the panel, neighborhood notes, and follow-up copy.",
  },
  "Collection Opens": {
    signal: "How often people move from this place into a curated downtown collection.",
    why: "Collection opens suggest someone is thinking about the wider neighborhood, not just one listing.",
    action: "Connect the place to the guides that best match how people are exploring.",
  },
  "Comparison Opens": {
    signal: "How often people compare this building with other downtown options.",
    why: "Comparison usually means the decision is getting more serious.",
    action: "Make the building's clearest differences visible without making people hunt for them.",
  },
  "Walkability Interest": {
    signal: "How often people open errands, trails, groceries, transit, and daily-use places.",
    why: "Walkability helps someone picture the week before they think about square footage.",
    action: "Lead with the everyday places people can actually use from here.",
  },
  "Dining Interest": {
    signal: "How often people open restaurants, happy hours, coffee, and evening options nearby.",
    why: "Dining interest shows how the location fits into someone's real week.",
    action: "Make nearby food, coffee, and after-work plans easy to discover from the panel.",
  },
  "Wellness Interest": {
    signal: "How often people open fitness, recovery, spa, trail, and wellness places nearby.",
    why: "Wellness interest points to routines people may repeat, not just one-time visits.",
    action: "Show the wellness options that make the location feel easier to live with.",
  },
  "Lifestyle Benefit Engagement": {
    signal: "Which benefits people open most: walkability, dining, wellness, waterfront access, or local services.",
    why: "The strongest choices show what people are already trying to imagine for themselves.",
    action: "Lead with the benefits people choose first and keep the rest secondary.",
  },
};

function truncatePanelCopy(value, limit = PANEL_COPY_LIMIT) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const clipped = text
    .slice(0, limit - 1)
    .replace(/\s+\S*$/, "")
    .replace(/[,\-–—:;]+$/, "")
    .trim();
  return `${clipped}.`;
}

function stripPanelPlaceholderCopy(value) {
  const removedCopy = [
    ["Dining", " Perk", "Dining"],
    ["Coffee", " Stop", "Coffee"],
    ["Night Out", " Nearby", "Drinks nearby"],
    ["Property", " Discovery", "Property"],
    ["Resident", " Access", "Downtown Access"],
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
  "Search downtown...",
  "Nearby now?",
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
  "Waterloo",
  "Lady Bird Lake",
  "Downtown Austin",
];

const RESIDENT_SEARCH_FILTERS = [
  { label: "All", filter: "All" },
  { label: "Fitness", filter: "Fitness" },
  { label: "Wellness", filter: "Wellness" },
  { label: "Nightlife", filter: "Nightlife" },
  { label: "Arts", filter: "Arts & Culture" },
  { label: "Retail", filter: "Retail" },
  { label: "Services", filter: "Services" },
  { label: "Properties", filter: "Properties" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Civic", filter: "Civic" },
  { label: "Discovery Trails", filter: "Discovery Trails" },
  { label: "Live Music", filter: "Live Music" },
  { label: "Happy Hour", filter: "Happy Hour" },
  { label: "Trending", filter: "Trending" },
  { label: "Stories", filter: "Stories" },
  { label: "Saved", filter: "Saved" },
  { label: "This Week", filter: "This Week" },
  { label: "inKind", filter: "inKind" },
  { label: "Legends", filter: "Legends" },
  { label: "All neighborhoods", filter: "All", prompt: "All neighborhoods" },
];

const PARTNER_SEARCH_FILTERS = [
  { label: "All", filter: "All" },
  { label: "Results", filter: "Performance" },
  { label: "Next", filter: "Opportunity" },
  { label: "Gaps", filter: "Coverage" },
  { label: "Audience", filter: "Audience" },
  { label: "Campaigns", filter: "Campaigns" },
  { label: "Brand Activations", filter: "Brand Activations" },
  { label: "Explore Downtown", filter: "Explore Downtown" },
  { label: "Discovery Trails", filter: "Discovery Trails" },
  { label: "Residents", filter: "Residents" },
  { label: "Properties", filter: "Properties" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Venues", filter: "Venues" },
  { label: "Wellness", filter: "Wellness" },
  { label: "Parking", filter: "Parking" },
  { label: "Brands", filter: "Brands" },
  { label: "Civic", filter: "Civic" },
  { label: "Events", filter: "Events" },
  { label: "Offers", filter: "Perks" },
  { label: "Stories", filter: "Stories" },
  { label: "Surveys", filter: "Surveys" },
  { label: "Activity", filter: "Visibility" },
  { label: "Reports", filter: "Reports" },
  { label: "Broadcasts", filter: "Broadcasts" },
  { label: "Activations", filter: "Activations" },
  { label: "Scans", filter: "Scans" },
  { label: "Saves", filter: "Saves" },
  { label: "RSVPs", filter: "Events" },
  { label: "Redemptions", filter: "Redemptions" },
  { label: "Next", filter: "Opportunities" },
  { label: "Gaps", filter: "Coverage" },
  { label: "Legends", filter: "Legends" },
];

const RESIDENT_ADVANCED_SEARCH_FILTERS = [
  { label: "Coffee", filter: "Coffee" },
  { label: "Drinks", filter: "Cocktails" },
  { label: "Fitness", filter: "Fitness" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Places to Live", filter: "Properties" },
  { label: "Living Here", filter: "Living Here" },
  { label: "Rentals", filter: "Rentals" },
  { label: "Parking", filter: "Parking" },
  { label: "Services", filter: "Services" },
  { label: "Saved", filter: "Saved" },
];

const PARTNER_ADVANCED_SEARCH_FILTERS = [
  { label: "Properties", filter: "Properties" },
  { label: "Venues", filter: "Venues" },
  { label: "Wellness", filter: "Wellness" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Brands", filter: "Brands" },
  { label: "Civic", filter: "Civic" },
  { label: "Parking", filter: "Parking" },
  { label: "Services", filter: "Services" },
  { label: "inKind", filter: "inKind" },
  { label: "Listings", filter: "Listings" },
  { label: "Rentals", filter: "Rentals" },
];

const RESIDENT_PROMPTS = [
  "Coffee within walking distance",
  "What should we do tonight?",
  "Best happy hour nearby",
  "Dinner for a date night",
  "What's happening this weekend?",
  "Show me rooftop views",
  "Where should we take visitors?",
  "Find resident perks nearby",
  "Best sushi downtown",
  "Luxury apartments nearby",
  "Civic updates nearby",
  "Brunch this weekend",
];

const PARTNER_PROMPTS = [
  "What campaign should I launch?",
  "Show nearby resident interest",
  "What is trending nearby?",
  "Find sponsorship opportunities",
  "Show activation ideas",
  "Where are residents spending time?",
  "Compare campaign performance",
  "What should we promote next?",
  "Find partner opportunities",
];

const RESIDENT_PLACEHOLDERS = [
  "Coffee nearby",
  "Dinner tonight",
  "Happy hour now",
  "Live music nearby",
  "Rooftops near me",
  "Walkable events",
  "Apartments near Rainey",
  "Perks I can use now",
];

const RESIDENT_INTENT_CONSOLE_PLACEHOLDERS = [
  "Coffee within walking distance",
  "Happy hour nearby",
  "What’s happening tonight?",
  "Rooftops nearby",
  "Taco spot open now",
  "Where should we go?",
  "Live music tonight",
  "Something low-key nearby",
];

const RESIDENT_INTENT_CONSOLE_BUTTONS = [
  { id: "coffee", label: "Coffee", prompt: "Coffee within walking distance", icon: Coffee },
  { id: "dinner", label: "Dinner", prompt: "Dinner nearby", icon: Utensils },
  { id: "drinks", label: "Drinks", prompt: "Happy hour nearby", icon: Wine },
  { id: "fitness", label: "Fitness", prompt: "Fitness nearby", icon: Dumbbell },
  { id: "wellness", label: "Wellness", prompt: "Wellness nearby", icon: HeartPulse },
  { id: "music", label: "Live Music", prompt: "Live music tonight", icon: Music2 },
  { id: "perks", label: "Perks", prompt: "Resident perks nearby", icon: Gift },
  { id: "events", label: "Events", prompt: "What’s happening tonight?", icon: CalendarDays },
  { id: "quiet-work", label: "Quiet Work", prompt: "Quiet work nearby", icon: BriefcaseBusiness },
  { id: "late-night", label: "Late Night", prompt: "Late night nearby", icon: Moon },
];

const RESIDENT_INTENT_TIME_BUTTONS = [
  { id: "now", label: "Now", prompt: "Open now nearby" },
  { id: "tonight", label: "Tonight", prompt: "What’s worth walking to tonight?" },
  { id: "this-week", label: "This Week", prompt: "Events this week" },
  { id: "weekend", label: "Weekend", prompt: "Weekend plans nearby" },
];

const RESIDENT_INTENT_RADIUS_BUTTONS = [
  { id: "400m", label: "400m" },
  { id: "800m", label: "800m" },
  { id: "1-mile", label: "1 mile" },
  { id: "5-min", label: "5 min walk" },
  { id: "10-min", label: "10 min walk" },
];

const RESIDENT_CONSOLE_PROMPTS = [
  "Coffee",
  "Dinner",
  "Drinks",
  "Fitness",
  "Events",
];

const RESIDENT_CONSOLE_FILTER_RAIL = [
  { id: "all", label: "All", icon: MapPin, kind: "filter", filter: "All", prompt: "All downtown" },
  { id: "perks", label: "Perks", icon: Gift, kind: "filter", filter: "Perks", prompt: "Perks I can use now" },
  { id: "events", label: "Events", icon: CalendarDays, kind: "filter", filter: "Events", prompt: "Events" },
  { id: "campaigns", label: "Campaigns", icon: Megaphone, kind: "filter", filter: "Campaigns", prompt: "Show active campaigns" },
  { id: "explore-downtown", label: "Explore", icon: Landmark, kind: "filter", filter: "Explore Downtown", prompt: "What should I explore today?" },
  { id: "food", label: "Food", icon: Utensils, kind: "filter", filter: "Dining", prompt: "Food nearby" },
  { id: "coffee", label: "Coffee", icon: Coffee, kind: "filter", filter: "Coffee", prompt: "Coffee nearby" },
  { id: "drinks", label: "Drinks", icon: Wine, kind: "filter", filter: "Drinks", prompt: "Drinks nearby" },
  { id: "fitness", label: "Fitness", icon: Dumbbell, kind: "filter", filter: "Fitness", prompt: "Fitness nearby" },
  { id: "wellness", label: "Wellness", icon: HeartPulse, kind: "filter", filter: "Wellness", prompt: "Wellness nearby" },
  { id: "nightlife", label: "Nightlife", icon: Moon, kind: "filter", filter: "Nightlife", prompt: "Nightlife nearby" },
  { id: "arts", label: "Arts", icon: Landmark, kind: "filter", filter: "Arts", prompt: "Arts nearby" },
  { id: "retail", label: "Retail", icon: Sparkles, kind: "filter", filter: "Retail", prompt: "Retail nearby" },
  { id: "services", label: "Services", icon: BriefcaseBusiness, kind: "filter", filter: "Services", prompt: "Services nearby" },
  { id: "properties", label: "Properties", icon: Building2, kind: "filter", filter: "Properties", prompt: "Properties nearby" },
  { id: "hotels", label: "Hotels", icon: Landmark, kind: "filter", filter: "Hotels", prompt: "Hotels nearby" },
  { id: "civic", label: "Civic", icon: Compass, kind: "filter", filter: "Civic", prompt: "Civic nearby" },
  { id: "live-music", label: "Live Music", icon: Music2, kind: "filter", filter: "Live Music", prompt: "Live music tonight" },
  { id: "happy-hour", label: "Happy Hour", icon: BadgePercent, kind: "filter", filter: "Happy Hour", prompt: "Happy hour nearby" },
  { id: "walkable", label: "Walkable", icon: Navigation, kind: "radius", radius: "5 min walk", prompt: "Walkable nearby" },
  { id: "trending", label: "Trending", icon: TrendingUp, kind: "filter", filter: "Trending", prompt: "Trending nearby" },
  { id: "saved", label: "Saved", icon: Star, kind: "filter", filter: "Saved", prompt: "Saved places" },
  { id: "open-now", label: "Open Now", icon: Clock, kind: "filter", filter: "Open Now", prompt: "Open now nearby" },
  { id: "tonight", label: "Tonight", icon: CalendarDays, kind: "time", time: "tonight", prompt: "Events tonight" },
  { id: "this-week", label: "This Week", icon: CalendarRange, kind: "time", time: "this-week", prompt: "Events this week" },
  { id: "nearby", label: "Nearby", icon: Navigation, kind: "filter", filter: "Nearby", prompt: "Nearby" },
  { id: "inkind", label: "inKind", icon: TicketPercent, kind: "filter", filter: "inKind", prompt: "inKind offers" },
  { id: "legends", label: "Legends", icon: Star, kind: "filter", filter: "Legends", prompt: "Legends listings" },
  { id: "all-neighborhoods", label: "All neighborhoods", icon: MapPin, kind: "filter", filter: "All", prompt: "All neighborhoods" },
];

const RESIDENT_DEFAULT_DISCOVERY_CARDS = [
  { label: "Dinner Nearby", prompt: "Dinner nearby", helper: "Places worth walking to tonight." },
  { label: "Live Music Tonight", prompt: "Live music tonight", helper: "A few things happening close by." },
  { label: "Coffee Tomorrow Morning", prompt: "Coffee tomorrow morning", helper: "Easy stops near where you are." },
  { label: "Walkable Happy Hours", prompt: "Walkable happy hours", helper: "Drinks and bites without a long ride." },
  { label: "Events This Week", prompt: "Events this week", helper: "Good reasons to make a plan." },
];

const PARTNER_PLACEHOLDERS = [
  "Demand nearby",
  "After work",
  "Saved offers",
  "Promote next",
  "Rainey properties",
  "Hotel guests",
  "Venues tonight",
];

const SEARCH_CONSOLE_MODE_CONFIG = {
  resident: {
    eyebrow: "Ask the Map",
    placeholder: "",
    fallbackTitle: "Ask the map",
    fallbackSignal: "Nearby",
    pulseFallback: "Live nearby",
    intentChips: [
      { label: "Dining", filter: "Dining", icon: Utensils, prompt: "Dinner for a date night" },
      { label: "Drinks", filter: "Drinks", icon: Wine, prompt: "Best happy hour nearby" },
      { label: "Events", filter: "Events", icon: CalendarDays, prompt: "What should we do tonight?" },
      { label: "Perks", filter: "Perks", icon: Gift, prompt: "Find resident perks nearby" },
      { label: "Explore", filter: "Explore Downtown", icon: Compass, prompt: "Show me public art nearby" },
      { label: "Trails", filter: "Discovery Trails", icon: Compass, prompt: "See Austin Differently" },
      { label: "Coffee", filter: "Coffee", icon: Coffee, prompt: "Coffee within walking distance" },
      { label: "Art Walk", filter: "Civic", collection: "daa-art-walk", icon: Landmark, prompt: "DAA Art Walk walking route" },
      { label: "Parking", filter: "Parking", icon: Car, prompt: "Parking nearby" },
      { label: "Rentals", filter: "Rentals", icon: Building2, prompt: "Luxury apartments nearby" },
    ],
    featuredPins: [
      { label: "inKind", kind: "filter", filter: "inKind", logo: "/pins/brands/inkind-logo.png", prompt: "inKind dining nearby" },
      { label: "DANA", kind: "filter", filter: "Civic", logo: "/pins/brands/dana-logo-gold.svg", prompt: "DANA civic updates" },
      { label: "Legends", kind: "filter", filter: "Legends", logo: LEGENDS_PIN_LOGO, prompt: "Legends listings nearby" },
      { label: "Fine Eyewear", kind: "filter", filter: "Discovery Trails", logo: "/pins/brands/fine-eyewear-logo-gold.svg", prompt: "See Austin Differently" },
      { label: "Waterloo Greenway", kind: "filter", filter: "Civic", collection: "waterloo-greenway", logo: "/pins/brands/waterloo-greenway-logo-gold.svg", prompt: "Waterloo Greenway discovery walk" },
    ],
  },
  partner: {
    eyebrow: "Map Intelligence",
    placeholder: "",
    fallbackTitle: "Partner map",
    fallbackSignal: "Opportunity nearby",
    pulseFallback: "Interest nearby",
    intentChips: [
      { label: "Performance", filter: "Performance", icon: Activity, prompt: "Compare campaign performance" },
      { label: "Campaigns", filter: "Campaigns", icon: Megaphone, prompt: "What campaign should I launch?" },
      { label: "Trails", filter: "Discovery Trails", icon: Compass, prompt: "Show discovery trail placements" },
      { label: "Interest", filter: "Audience", icon: Users, prompt: "Show nearby resident interest" },
      { label: "Activation", filter: "Opportunity", icon: Sparkles, prompt: "Show activation ideas" },
      { label: "Insights", filter: "Reports", icon: TrendingUp, prompt: "What is trending nearby?" },
      { label: "Parking", filter: "Parking", icon: Car, prompt: "Parking nearby" },
    ],
    filterRail: [
      { label: "Perks", kind: "filter", filter: "Perks", prompt: "Perk performance nearby" },
      { label: "Events", kind: "filter", filter: "Events", prompt: "Event sponsorship opportunities" },
      { label: "Residential", kind: "filter", filter: "Properties", prompt: "Nearby resident interest" },
      { label: "Hotels", kind: "filter", filter: "Hotels", prompt: "Hotel guest opportunity" },
      { label: "Civic", kind: "filter", filter: "Civic", prompt: "DAA sponsorship opportunity" },
      { label: "Brand Activations", kind: "filter", filter: "Brand Activations", prompt: "Brand activation opportunities" },
    ],
    featuredPins: [
      { label: "inKind", kind: "filter", filter: "inKind", logo: "/pins/brands/inkind-logo.png", prompt: "inKind dining performance" },
      { label: "DANA", kind: "filter", filter: "Civic", logo: "/pins/brands/dana-logo-gold.svg", prompt: "DANA sponsorship opportunity" },
      { label: "Legends", kind: "filter", filter: "Legends", logo: LEGENDS_PIN_LOGO, prompt: "Legends listings nearby" },
      { label: "Fine Eyewear", kind: "filter", filter: "Discovery Trails", logo: "/pins/brands/fine-eyewear-logo-gold.svg", prompt: "Fine Eyewear discovery trail" },
      { label: "Waterloo Greenway", kind: "filter", filter: "Civic", collection: "waterloo-greenway", logo: "/pins/brands/waterloo-greenway-logo-gold.svg", prompt: "Waterloo Greenway discovery walk" },
    ],
  },
};

const RESIDENT_CONTEXT_RAILS = {
  Dining: [
    { label: "Breakfast", kind: "filter", filter: "Breakfast", prompt: "Breakfast nearby", icon: Clock },
    { label: "Brunch", kind: "filter", filter: "Brunch", prompt: "Brunch this weekend", icon: CalendarRange },
    { label: "Lunch", kind: "filter", filter: "Lunch", prompt: "Lunch nearby", icon: Utensils },
    { label: "Dinner", kind: "filter", filter: "Dinner", prompt: "Dinner tonight", icon: Moon },
    { label: "Coffee", kind: "filter", filter: "Coffee", prompt: "Coffee within walking distance", icon: Coffee },
    { label: "Dessert", kind: "filter", filter: "Dessert", prompt: "Dessert nearby", icon: Sparkles },
    { label: "Happy Hour", kind: "filter", filter: "Happy Hour", prompt: "Best happy hour nearby", icon: BadgePercent },
    { label: "Sushi", kind: "filter", filter: "Dining", prompt: "Best sushi downtown", icon: Star },
  ],
  Drinks: [
    { label: "Happy Hour", kind: "filter", filter: "Happy Hour", prompt: "Best happy hour nearby" },
    { label: "Cocktails", kind: "filter", filter: "Cocktails", prompt: "Cocktails nearby" },
    { label: "Rooftops", kind: "filter", filter: "Drinks", prompt: "Show me rooftop views" },
    { label: "Wine", kind: "filter", filter: "Wine", prompt: "Wine bars nearby" },
  ],
  Events: [
    { label: "Tonight", kind: "filter", filter: "Events", prompt: "What should we do tonight?" },
    { label: "Tomorrow", kind: "filter", filter: "Events", prompt: "Events tomorrow" },
    { label: "Weekend", kind: "filter", filter: "Events", prompt: "What's happening this weekend?" },
    { label: "Music", kind: "filter", filter: "Live Music", prompt: "Live music tonight" },
    { label: "Community", kind: "filter", filter: "Events", prompt: "Community events nearby" },
    { label: "Sports", kind: "filter", filter: "Events", prompt: "Sports events nearby" },
    { label: "Festivals", kind: "filter", filter: "Events", prompt: "Festivals nearby" },
  ],
  Perks: [
    { label: "Dining", kind: "filter", filter: "Dining", prompt: "Dining perks nearby", icon: Utensils },
    { label: "Happy Hour", kind: "filter", filter: "Happy Hour", prompt: "Happy hour perks nearby", icon: Wine },
    { label: "Parking", kind: "filter", filter: "Parking", prompt: "Parking near this perk", icon: Car },
  ],
  Explore: [
    { label: "Art Walk", kind: "filter", filter: "Civic", prompt: "Art walk nearby" },
    { label: "Parks", kind: "filter", filter: "Civic", prompt: "Parks nearby" },
    { label: "Museums", kind: "filter", filter: "Civic", prompt: "Museums nearby" },
    { label: "Waterfront", kind: "filter", filter: "Civic", prompt: "Waterfront public spaces" },
    { label: "Architecture", kind: "filter", filter: "Civic", prompt: "Architecture tour downtown" },
    { label: "Neighborhoods", kind: "filter", filter: "Explore Downtown", prompt: "Downtown neighborhoods" },
  ],
  default: SEARCH_CONSOLE_MODE_CONFIG.resident.featuredPins,
};

const PARTNER_CONTEXT_RAILS = {
  Performance: [
    { label: "Views", kind: "filter", filter: "Performance", prompt: "Compare campaign performance" },
    { label: "Saves", kind: "filter", filter: "Performance", prompt: "Saved activity nearby" },
    { label: "Visits", kind: "filter", filter: "Performance", prompt: "Visits nearby" },
    { label: "Redemptions", kind: "filter", filter: "Performance", prompt: "Redemption activity nearby" },
  ],
  Campaigns: [
    { label: "Launch Campaign", kind: "filter", filter: "Campaigns", prompt: "What campaign should I launch?" },
    { label: "Resident Interest", kind: "filter", filter: "Audience", prompt: "Show nearby resident interest" },
    { label: "Event Sponsorship", kind: "filter", filter: "Events", prompt: "Event sponsorship opportunities" },
    { label: "Parking", kind: "filter", filter: "Parking", prompt: "Parking nearby", icon: Car },
  ],
  Demand: SEARCH_CONSOLE_MODE_CONFIG.partner.filterRail,
  Activation: SEARCH_CONSOLE_MODE_CONFIG.partner.filterRail,
  Insights: SEARCH_CONSOLE_MODE_CONFIG.partner.filterRail,
  default: SEARCH_CONSOLE_MODE_CONFIG.partner.filterRail,
};

const SEARCH_RADIUS_OPTIONS = ["400m", "800m", "1 mile", "5 min walk", "10 min walk"];
const RESIDENT_TIME_FILTERS = ["Now", "Tonight", "Tomorrow", "This Weekend", "This Week"];
const PARTNER_TIME_FILTERS = ["Today", "After Work", "This Week", "Weekend", "Last 7 Days", "Last 30 Days"];
const RESIDENT_INTENT_FILTERS = ["Eat", "Drink", "Work", "Move", "Shop", "Relax", "Reset", "Meet", "Live", "Explore", "DAA Art Walk", "InKind", "Legends", "Public Art", "Live Music"];
const PARTNER_INTENT_FILTERS = ["Activity", "Offer", "Campaign", "Scan", "Save", "RSVP", "Use", "Residents", "Guests", "Next", "DAA", "inKind", "Legends", "Gaps"];
const ENTITY_TYPE_FILTERS = ["Venue", "Property", "Rental", "Hotel", "Brand", "Civic", "Event", "Perk", "Service", "Wellness", "Listing"];

const MAP_INTENT_RULES = [
  { intent: "DAA_art_walk", filter: "Civic", entityType: "Civic", tokens: ["daa", "art walk", "art and parks", "parks tour", "public art", "civic tour", "historic stops", "historic markers", "cultural landmarks"] },
  { intent: "InKind", filter: "inKind", entityType: "Venue", tokens: ["inkind", "in kind", "dining benefits", "dining perks", "restaurants with perks"] },
  { intent: "Legends", filter: "Legends", entityType: "Listing", tokens: ["legends", "legends listings", "available homes", "condos", "apartments", "live here", "properties near me"] },
  { intent: "rentals", filter: "Rentals", entityType: "Rental", tokens: ["rental", "rentals", "for rent", "1 bedroom rentals", "bedroom rentals", "under $4,000", "under 4000", "available under", "near whole foods", "near lady bird lake"] },
  { intent: "coffee", filter: "Coffee", entityType: "Venue", tokens: ["coffee", "cafe", "espresso", "morning coffee"] },
  { intent: "dinner", filter: "Dinner", entityType: "Venue", tokens: ["dinner", "date night"] },
  { intent: "dining", filter: "Dining", entityType: "Venue", tokens: ["lunch", "brunch", "food", "restaurant", "tacos", "sushi", "eat"] },
  { intent: "drinks", filter: "Drinks", entityType: "Venue", tokens: ["drinks", "cocktails", "wine bar", "bar", "rooftop before sunset"] },
  { intent: "happy_hour", filter: "Happy Hour", entityType: "Perk", timeContext: "Tonight", tokens: ["happy hour", "after work", "drink specials"] },
  { intent: "parking", filter: "Parking", entityType: "Parking", tokens: ["parking", "garage", "reservable parking", "event parking", "parking nearby", "resident parking"] },
  { intent: "printing", filter: "Printing", entityType: "Service", tokens: ["print", "printing", "fedex", "copies", "copy shop", "print shop"] },
  { intent: "cleaning", filter: "Cleaners", entityType: "Service", tokens: ["cleaner", "cleaning", "laundry", "dry clean", "dry cleaning"] },
  { intent: "pharmacy", filter: "Pharmacy", entityType: "Service", tokens: ["pharmacy", "medicine", "cvs", "walgreens"] },
  { intent: "ev_charging", filter: "EV Charging", entityType: "Parking", tokens: ["ev", "charging", "tesla", "chargepoint", "ev charger"] },
  { intent: "bike_share", filter: "Bike Share", entityType: "Service", tokens: ["bike share", "bike", "metrobike"] },
  { intent: "visitor_info", filter: "Visitor Info", entityType: "Service", tokens: ["visitor info", "visitor information", "tourist information"] },
  { intent: "shipping", filter: "Shipping", entityType: "Service", tokens: ["shipping", "mail", "package", "ups", "post office"] },
  { intent: "nightlife", filter: "Nightlife", entityType: "Venue", tokens: ["nightlife", "honky tonk", "late night", "dance"] },
  { intent: "events", filter: "Events", entityType: "Event", tokens: ["events", "things to do", "what is happening", "happening nearby"] },
  { intent: "brand_activations", filter: "Brand Activations", entityType: "Brand", tokens: ["brand activation", "brand activations", "brand campaigns", "heritage boots campaign", "show heritage boots", "show brand activations"] },
  { intent: "campaigns", filter: "Campaigns", entityType: "Campaign", tokens: ["campaign", "campaigns", "active campaigns", "show active campaigns", "show sugar wolf", "sugar wolf", "pastry passport", "show coffee passport", "show wellness week", "show rooftop guide", "show hidden perks", "what challenges are active", "campaigns nearby"] },
  { intent: "explore_downtown", filter: "Explore Downtown", entityType: "Civic", tokens: ["explore", "explore downtown", "show public art nearby", "build an art walk", "show waterloo greenway highlights", "show historic places", "show community stories", "what should i explore today", "show landmarks nearby", "create a walking route", "what makes this neighborhood unique"] },
  { intent: "live_music", filter: "Live Music", entityType: "Event", timeContext: "Tonight", tokens: ["live music", "concert", "show tonight", "music tonight"] },
  { intent: "fitness", filter: "Fitness", entityType: "Venue", tokens: ["fitness", "workout", "pilates", "gym", "yoga", "move"] },
  { intent: "wellness", filter: "Wellness", entityType: "Wellness", tokens: ["wellness", "spa", "relax", "self care", "need to relax", "recovery nearby", "cold plunge", "sauna", "date idea", "something different", "recharge", "work somewhere calm", "mental reset", "massage", "wellness experience", "hot and cold therapy", "recovery after workout"] },
  { intent: "retail", filter: "Retail", entityType: "Brand", tokens: ["retail", "shop", "shopping", "store"] },
  { intent: "services", filter: "Services", entityType: "Service", tokens: ["services", "parking", "concierge", "help"] },
  { intent: "civic", filter: "Civic", entityType: "Civic", tokens: ["civic", "library", "museum", "park", "trail", "public space", "government", "city programs", "waterloo"] },
  { intent: "hotels", filter: "Hotels", entityType: "Hotel", tokens: ["hotel", "guest", "stay", "visitor"] },
  { intent: "properties", filter: "Properties", entityType: "Property", tokens: ["property", "building", "apartment", "condo", "homes", "residential"] },
  { intent: "resident_perks", filter: "Perks", entityType: "Perk", tokens: ["resident perks", "perks", "offers", "discounts", "redeem", "use perk"] },
  { intent: "open_now", filter: "Open Now", tokens: ["open now", "right now", "near me now"] },
  { intent: "tonight", timeContext: "Tonight", tokens: ["tonight", "this evening"] },
  { intent: "this_week", timeContext: "This Week", tokens: ["this week", "weekend", "tomorrow"] },
  { intent: "nearby", filter: "Nearby", tokens: ["nearby", "near me", "what's nearby", "around me", "walkable"] },
  { intent: "trending", filter: "Trending", tokens: ["popular", "trending", "what people like", "what people are saving"] },
  { intent: "partner_performance", filter: "Performance", tokens: ["performing", "performance", "reports", "view reports", "what changed"] },
  { intent: "partner_opportunity", filter: "Opportunity", tokens: ["opportunity", "campaign opportunities", "what should we launch", "what should we share", "launch next"] },
  { intent: "partner_coverage", filter: "Coverage", tokens: ["coverage", "coverage gaps", "low coverage"] },
  { intent: "partner_campaigns", filter: "Campaigns", tokens: ["campaign", "campaigns", "activation", "placements"] },
];

function parseMapIntent(query, mode = "resident") {
  const normalized = String(query || "").toLowerCase().trim();
  const matched = MAP_INTENT_RULES.filter((rule) => (Array.isArray(rule.tokens) ? rule.tokens : []).some((token) => normalized.includes(token)));
  const intents = matched.map((rule) => rule.intent);
  const filters = [...new Set(matched.map((rule) => rule.filter).filter(Boolean))];
  const districtMatch = NEIGHBORHOODS.find((item) => item !== ALL_NEIGHBORHOODS && normalized.includes(item.toLowerCase()));
  const partnerDefault = mode === "partner" && !filters.length && /\b(engaging|activity|audience|residents|guest|demand|insight)\b/.test(normalized);

  if (partnerDefault) {
    intents.push("partner_opportunity");
    filters.push("Opportunity");
  }

  return {
    query: String(query || ""),
    mode,
    intents: [...new Set(intents)],
    filters,
    timeContext: matched.find((rule) => rule.timeContext)?.timeContext || (/\btonight|evening\b/.test(normalized) ? "Tonight" : ""),
    locationContext: districtMatch ? "district" : /\bnearby|near me|walkable|around me\b/.test(normalized) ? "nearby" : "",
    district: districtMatch || "",
    entityType: matched.find((rule) => rule.entityType)?.entityType || "",
  };
}

function resolveFilterForIntent(query, mode = "resident") {
  const parsed = parseMapIntent(query, mode);
  const parsedFallbackFilter = searchIntentToFilter(parseSearchIntent(query));
  const filters = parsed.filters.length ? parsed.filters : parsedFallbackFilter && parsedFallbackFilter !== "All" ? [parsedFallbackFilter] : [];
  if (!filters.length) return "";
  const preferred = mode === "partner"
    ? ["Opportunity", "Performance", "Coverage", "Campaigns", "Brand Activations", "Explore Downtown", "Hospitality", "Staycations", "Waterfront", "Parking", "EV Charging", "Printing", "Pharmacy", "Cleaners", "Shipping", "Bike Share", "Visitor Info", "Services", "Rentals", "Properties", "Hotels", "Venues", "Brands", "Civic", "Events", "Perks", "inKind", "Legends", "Listings"]
    : ["Dinner", "Coffee", "Dining", "Drinks", "Happy Hour", "Events", "Perks", "Wellness", "Fitness", "Parking", "EV Charging", "Printing", "Pharmacy", "Cleaners", "Shipping", "Bike Share", "Visitor Info", "Services", "inKind", "Civic", "Explore Downtown", "Rentals", "Legends", "Listings", "Properties", "Hotels", "Campaigns", "Live Music", "Nearby"];
  return preferred.find((item) => filters.includes(item)) || filters[0] || "";
}

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
const DEMO_CARD_CODE = "DP-RES-78701";
const PERKS_CARD_QR_SRC = "/images/card/perks-card-qr.png";
const RESIDENT_ACCESS_STORAGE_KEY = "dp_resident_access:current";
const RESIDENT_TOUCHPOINTS_STORAGE_KEY = "downtown-perks-resident-touchpoints";
const RESIDENT_QR_EVENT_TYPE = "resident_qr_presented";

function getQrImageUrl(value) {
  const encoded = encodeURIComponent(String(value || DEMO_CARD_CODE));
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encoded}`;
}

function getResidentProfileUid() {
  if (typeof window !== "undefined") {
    try {
      const resident = JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_STORAGE_KEY) || "null");
      const residentUid = resident?.id || resident?.residentId || resident?.uid || resident?.profileId;
      if (residentUid) return String(residentUid);
    } catch {
      // Fall back to the workflow profile id below.
    }
  }
  return getWorkflowProfileId();
}

function getEntityTouchpointId(place) {
  return String(place?.id || place?.entityId || place?.raw?.id || place?.slug || "resident-card");
}

function getEntityTouchpointName(place) {
  return String(place?.name || place?.title || place?.raw?.name || "Downtown Perks");
}

function getResidentQrPerkCopy(place) {
  if (!place) {
    return {
      title: "Downtown Perks Card",
      value: "Verified resident access",
      description: "Use this card for eligible resident perks, event check-ins, and participating partner experiences.",
      terms: "Availability can vary by partner, event, and building.",
    };
  }

  const perk = getResidentPerkDetails(place);
  const title = formatResidentPerkHeading(perk.offer);
  const value = String(perk.value || perk.offer || "").trim();
  const description = getPerkOutlineCopy(place, perk) || perk.description || place.summary || place.description || "";
  const terms = String(perk.terms || "").trim();

  return {
    title,
    value,
    description,
    terms,
  };
}

function buildResidentQrPayload({ place, action = "show_card", source = "resident_map" } = {}) {
  const uid = getResidentProfileUid();
  const entityId = getEntityTouchpointId(place);
  const entityName = getEntityTouchpointName(place);
  const perk = getResidentQrPerkCopy(place);
  const sessionId = getWorkflowSessionId();
  const issuedAt = new Date().toISOString();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : LIVE_CARD_URL;
  const qrUrl = new URL("/card", baseUrl);
  qrUrl.searchParams.set("residentUid", uid);
  qrUrl.searchParams.set("touchpoint", action);
  qrUrl.searchParams.set("entityId", entityId);

  return {
    type: "downtown_perks.resident_qr",
    version: 1,
    uid,
    profileId: uid,
    sessionId,
    action,
    source,
    entityId,
    entityName,
    perkTitle: perk.title,
    perkValue: perk.value,
    perkDescription: perk.description,
    perkTerms: perk.terms,
    issuedAt,
    qrValue: qrUrl.toString(),
  };
}

function recordResidentTouchpoint(payload) {
  if (!payload?.uid) return;
  const event = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...payload,
    eventType: RESIDENT_QR_EVENT_TYPE,
    capturedAt: new Date().toISOString(),
    path: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "",
  };

  if (typeof window !== "undefined") {
    try {
      const current = JSON.parse(window.localStorage.getItem(RESIDENT_TOUCHPOINTS_STORAGE_KEY) || "[]");
      const next = [event, ...(Array.isArray(current) ? current : [])].slice(0, 200);
      window.localStorage.setItem(RESIDENT_TOUCHPOINTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Local capture is best-effort; backend workflow still receives the event below.
    }
    window.dispatchEvent(new CustomEvent("downtown-perks:resident-touchpoint", { detail: event }));
  }

  fireWorkflow("/api/track", {
    type: RESIDENT_QR_EVENT_TYPE,
    entityId: event.entityId,
    entityType: "perk",
    profileId: event.uid,
    sessionId: event.sessionId,
    sourceType: "resident_card",
    value: 1,
    metadata: event,
  });

  if (event.action === "use_perk") {
    trackingEvents.redeem(event.entityId);
  }
}

const RESIDENT_OFFER_RECORDS = [
  ["DANA", ["dana", "downtown austin neighborhood association"], "Resident advocacy & premium meetings", "Resident civic access", "The DANA perk gives residents easier access to civic meetings, advocacy updates, and neighborhood decisions that shape downtown living.", "Save it to follow upcoming resident meetings and local advocacy updates.", "Civic"],
  ["Downtown Austin Alliance", ["downtown austin alliance", "daa"], "Infrastructure & Public Realm Updates", "Downtown civic updates", "The DAA perk gives residents a direct civic-update layer for public realm, safety, mobility, and infrastructure changes around downtown.", "Save it to keep civic updates and downtown route context close by.", "Civic"],
  ["Waterloo Greenway", ["waterloo greenway", "waterloo park"], "Park Activation & Green Space Access", "Park and event access", "The Waterloo Greenway perk connects residents to park programming, green space access, trail moments, and cultural events nearby.", "Save it for nearby park events, wellness moments, and community programming.", "Civic"],
  ["The Paseo", ["the paseo", "paseo"], "Priority move-in incentive", "Residential access", "The Paseo perk gives residents priority context for move-in incentives, building life, nearby dining, retail, events, and services.", "Save it and open the listing or building drawer when you want details.", "Property"],
  ["The Waterline", ["the waterline", "waterline"], "Reserved co-working access", "Residential amenity access", "The Waterline perk highlights reserved co-working access and mixed-use resident benefits tied to dining, hotel, retail, and lake routines.", "Save it to compare building amenities and nearby routines.", "Property"],
  ["The Independent", ["the independent", "independent"], "Skydeck guest passes", "Resident building benefit", "The Independent perk gives residents skydeck guest-pass context plus a Seaholm anchor for nearby dining, events, lake access, and daily routines.", "Save it to explore nearby perks and building context.", "Property"],
  ["70 Rainey", ["70 rainey", "seventy rainey"], "Herb garden harvest share", "Resident building benefit", "The 70 Rainey perk gives residents herb garden harvest-share access tied to Rainey restaurants, music, trail access, and everyday local stops.", "Save it to compare nearby routines and resident benefits.", "Property"],
  ["The Shore", ["the shore", "shore"], "Verified Resident: Lakeside Infinity Pool Access", "Resident access", "The Shore perk gives verified residents lakeside infinity pool access and lakefront benefit context around Rainey dining and nearby resident offers.", "Available to verified residents through the Resident Pass.", "Property"],
  ["Fixe Austin's Southern House", ["fixe", "fixe southern house", "fixe austin's southern house", "fixe austins southern house"], "Free biscuit board for the table", "Resident dining perk", "The Fixe perk gives residents a complimentary biscuit board with dinner for two or more.", "Valid dine-in only. One per table. Subject to restaurant approval and availability. Not valid with other offers.", "Dining"],
  ["Perry's Steakhouse & Grille", ["perry's", "perrys", "perry's steakhouse", "perrys steakhouse", "perry's steakhouse & grille"], "Complimentary Bar 79 starter", "Resident steakhouse perk", "The Perry's perk gives residents a complimentary Bar 79 starter with dinner for two or more.", "Valid dine-in only. One per table. Dinner only. Subject to restaurant approval and availability. Not valid with other offers.", "Dining"],
  ["Truluck's Ocean's Finest Seafood & Crab", ["truluck", "truluck's", "trulucks", "truluck's ocean's finest seafood & crab"], "Complimentary bubbles or dessert", "Resident seafood perk", "The Truluck's perk gives residents a complimentary glass of bubbles or dessert with dinner for two or more.", "Valid dine-in only. One per table. Subject to restaurant approval and availability. Alcohol option only for guests 21+. Not valid with other offers.", "Dining"],
  ["BarChi Sushi", ["barchi", "barchi sushi", "bar chi", "bar chi sushi"], "Resident reverse happy hour", "Resident drinks perk", "The BarChi perk unlocks resident reverse happy hour pricing on select sushi, sake, and cocktails.", "Valid during approved reverse happy hour windows only. Dine-in only. Subject to restaurant approval and availability. Alcohol only for guests 21+.", "Drinks"],
  ["Comedor", ["comedor"], "Mezcal welcome pour", "Resident dining perk", "The Comedor perk gives residents a complimentary mezcal welcome pour or spirit-free house agua with dinner.", "Valid dine-in only. One per guest with dinner purchase. Alcohol option only for guests 21+. Subject to restaurant approval and availability.", "Dining"],
  ["Dean's Italian Steakhouse", ["dean's", "deans", "dean's italian steakhouse", "deans italian steakhouse"], "This summer, give the gift of Dean's", "$100 gift card + $25 bonus card", "Purchase a $100 Dean's Italian Steakhouse gift card between May 25 and August 1 and receive a $25 bonus card for a future visit - yours to enjoy before Labor Day, September 7. Whether you're celebrating someone special or treating yourself, there's no better time to give the gift of a great meal.", "Purchase gift cards through Dean's Italian Steakhouse. $25 bonus card is for a future visit and must be enjoyed before Labor Day, September 7.", "Dining"],
  ["Banger's Sausage House & Beer Garden", ["banger", "banger’s", "banger's", "banger's sausage house", "banger's sausage house & beer garden"], "Beer garden and live energy nearby", "Drinks nearby", "The Banger's perk gives residents beer garden value tied to outdoor gatherings, live music energy, and easy Rainey-area group plans.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["The Stay Put", ["stay put", "the stay put"], "Free house brew with Resident Pass", "Resident drink offer", "The Stay Put perk gives residents a free house brew as a simple nearby drink offer around Rainey.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["Lustre Pearl", ["lustre pearl"], "Happy Hour pricing for residents anytime", "Resident drink offer", "The Lustre Pearl perk gives residents happy hour pricing anytime, turning a familiar Rainey stop into an easier-value drink plan.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["Half Step", ["half step"], "Cocktails around the corner", "Drinks nearby", "The Half Step perk highlights resident cocktail access around a craft cocktail stop close to Rainey Street.", "Save it and show Resident Pass when active.", "Drinks"],
  ["BATHE", ["bathe"], "10% Off First Soak", "Wellness perk", "The BATHE perk gives residents 10% off a first soak across sauna, cold plunge, soaking pools, massage, sound immersion, and coworking.", "Claim the wellness perk and confirm availability before visiting.", "Wellness"],
  ["YETI", ["yeti"], "Free Custom Engraving For Verified Residents", "Retail resident offer", "The YETI perk gives verified residents free custom engraving in-store, tied to downtown routes, lake days, and weekend plans.", "Show the Resident Pass in-store when the offer is active.", "Retail"],
  ["Rivian", ["rivian"], "Priority Test Drives & Resident Charging Perks", "Mobility resident offer", "The Rivian perk gives residents priority test-drive access and charging-perk context for weekend routes and local exploration.", "Save it and open the partner drawer for current test-drive details.", "Mobility"],
  ["Standard Proof Whiskey Co.", ["standard proof"], "Complimentary Whiskey Flight Upgrade", "Resident drink offer", "The Standard Proof perk gives residents a complimentary whiskey flight upgrade at a focused Rainey-area drinks stop.", "Show the Resident Pass when the offer is active.", "Drinks"],
].map(([name, aliases, title, value, description, terms, category]) => ({
  name,
  aliases,
  title,
  value,
  description,
  terms,
  category,
  isActive: true,
  source: "Downtown Perks resident offer registry",
}));

function getPartnerBusinessInsights(place) {
  const text = placeText(place);
  const district = place?.district || "Downtown Austin";
  const category = String(place?.category || place?.type || "place");
  const name = place?.name || "this partner";
  const listing = getResolvedLegendsListing(place);
  const rental = place?.raw?.rentalListing || place?.rentalListing || null;
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const explicitObjective = cleanDisplayCopy(place?.campaignObjective || place?.raw?.campaignObjective || "");
  const explicitInsight = cleanDisplayCopy(place?.partnerInsight || place?.raw?.partnerInsight || "");
  const explicitAudience = cleanDisplayCopy(place?.audience || place?.raw?.audience || "");

  if (explicitObjective || explicitInsight || explicitAudience) {
    return {
      intent: explicitObjective || explicitInsight,
      audience: explicitAudience || `People already close enough to act around ${district}.`,
      opportunity: explicitInsight || explicitObjective,
      timing: place?.moment || place?.raw?.moment || "Active campaign windows",
      placement: `${name} near ${district}`,
      action: place?.primaryAction || place?.raw?.primaryAction || "Open campaign action",
      fit: place?.offer || place?.raw?.offer || place?.category || "Campaign action",
    };
  }

  if (isParkingEntity(place)) {
    const booking = getParkingBooking(place);
    return {
      intent: `People near ${district} are trying to solve parking before they commit to dinner, events, listings, hotels, or a night out.`,
      audience: `Best fit: event-goers, hotel guests, residents, restaurant guests, and visitors already close enough to act around ${district}.`,
      opportunity: `Put ${name} beside nearby plans so parking helps the visit instead of becoming the reason people give up.`,
      timing: "Strongest window: pre-arrival, event nights, dinner, and weekend planning",
      placement: `Parking near ${district}`,
      action: "Promote parking availability",
      fit: booking?.rateLabel || booking?.availabilityLabel || "Reservable parking",
    };
  }

  if (listing || rental || luxuryBuilding || isLegendsMapPlace(place)) {
    const listingCount = Array.isArray(luxuryBuilding?.listings) ? luxuryBuilding.listings.length : 0;
    const listingSignal = listing
      ? getListingFactLine(listing)
      : rental
        ? [rental.priceLabel, rental.beds ? `${rental.beds} bd` : "", rental.baths ? `${rental.baths} ba` : "", rental.sqft ? `${Number(rental.sqft).toLocaleString()} sqft` : ""].filter(Boolean).join(" · ")
        : listingCount ? `${listingCount} active listing${listingCount === 1 ? "" : "s"}` : "Residential interest nearby";
    return {
      intent: `Prospects, brokers, residents, and nearby businesses use ${name} to understand the building and what makes the surrounding blocks useful.`,
      audience: `Best fit: qualified residential prospects, Legends agents, property teams, nearby brands, and partners trying to reach people around ${district}.`,
      opportunity: `Use the pin to connect listing interest with walkable dining, hotel, wellness, event, and retail context around ${district}.`,
      timing: "Strongest window: showing research, lunch breaks, and after-work neighborhood comparison",
      placement: `Legends interest near ${district}`,
      action: "Review listing interest",
      fit: listingSignal,
    };
  }

  if (isInKindPartner(place)) {
    return {
      intent: "Residents and hotel guests nearby are choosing where to eat, drink, or start the night. inKind works here because the value is immediate and tied to restaurants people can actually walk to.",
      audience: `Best fit: verified residents, nearby buildings, hotel guests, and dinner groups already moving through ${district}.`,
      opportunity: `Use ${name} as a dining perk that can turn nearby interest into saves, scans, redemptions, and repeat visits.`,
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

  if (text.includes("closet") || text.includes("home organization") || text.includes("residential service") || text.includes("service")) {
    return {
      intent: "Residents nearby are solving practical home, move-in, or everyday setup needs.",
      audience: "Best fit: downtown residents, new movers, property teams, and people already planning a home upgrade.",
      opportunity: `Use ${name} as a useful service stop that turns nearby resident interest into a consult, save, or follow-up.`,
      timing: "Strongest window: move-ins, home resets, and weekend planning",
      placement: `Useful service near ${district}`,
      action: "Route to the right service step",
    };
  }

  if (text.includes("brand perk") || text.includes("brand activation") || text.includes("hydration") || text.includes("run club") || text.includes("mobility") || text.includes("eyewear")) {
    return {
      intent: "People nearby are already making plans, comparing stops, or looking for a useful reason to engage.",
      audience: "Best fit: residents, visitors, hotel guests, and nearby audiences close enough to act.",
      opportunity: `Keep ${name} tied to a specific perk, scan, save, or visit instead of a generic brand impression.`,
      timing: "Strongest window: active downtown plans nearby",
      placement: `Activation near ${district}`,
      action: "Lead with the active perk",
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
      intent: "Nearby coffee searches happen around work breaks, meetings, and quick morning decisions.",
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
      intent: `${name} should appear when shopping has a real reason: a fitting, styling appointment, event route, or stop before dinner.`,
      audience: `Residents, hotel guests, visitors, and eventgoers already planning around ${district}.`,
      opportunity: `Make the ${name} action specific enough to save, book, or route to from the map.`,
      timing: "Weekend afternoons, lunch errands, and pre-event browsing.",
      placement: `Retail activation near ${district}`,
      action: "Route to the retail action",
    };
  }

  return {
    intent: `People nearby are using the map to decide what is useful around ${district}.`,
    audience: "Nearby residents, visitors, hotel guests, and people already downtown.",
    opportunity: `Use this ${category.toLowerCase()} context to show up when people are close enough to act.`,
    timing: "Lunch, after work, and before nearby events.",
    placement: `Near ${district}`,
    action: "Show up while people are nearby",
  };
}

function getPartnerPanelCopy(place) {
  const insights = getPartnerBusinessInsights(place);
  const kind = getResidentEntityKind(place);
  const category = kind === "property" || kind === "rental"
    ? "Residential intelligence"
    : isInKindPartner(place)
      ? "Dining intelligence"
      : isCampaignEntity(place)
        ? "Campaign intelligence"
        : isBrandEntity(place)
          ? "Brand activation"
        : `${String(place?.category || place?.type || "Partner").replace(/[_-]/g, " ")} insight`;

  return {
    category,
    title: insights.action || "Review opportunity",
    value: insights.fit || insights.placement,
    description: insights.intent,
    terms: insights.opportunity,
    audience: insights.audience,
    timing: insights.timing,
    placement: insights.placement,
    action: insights.action,
  };
}

function collectSearchTerms(value, depth = 0) {
  if (!value || depth > 3) return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectSearchTerms(item, depth + 1));
  if (typeof value === "object") return Object.values(value).flatMap((item) => collectSearchTerms(item, depth + 1));
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  return [];
}

function placeText(place) {
  const raw = place?.raw || {};
  return [
    place.name,
    place.title,
    place.displayTitle,
    place.summary,
    place.description,
    place.offer,
    place.category,
    place.category_key,
    place.type,
    place.kind,
    place.entityType,
    place.destinationKind,
    place.detailDrawerType,
    place.markerType,
    place.partnerType,
    place.brand,
    place.source,
    place.datasetLayer,
    place.district,
    place.neighborhood,
    place.address,
    ...collectSearchTerms(place.tags),
    ...collectSearchTerms(place.searchKeywords),
    raw.summary,
    raw.description,
    raw.offer,
    raw.deals_offers,
    raw.alignment_to_downtown_perks,
    raw.category_key,
    raw.entityType,
    raw.datasetLayer,
    raw.partnerType,
    raw.campaign,
    raw.campaignName,
    raw.campaignType,
    raw.campaigns,
    raw.parking,
    raw.parkingBooking,
    raw.perk,
    raw.perks,
    ...collectSearchTerms(raw.tags),
    ...collectSearchTerms(raw.searchKeywords),
    ...collectSearchTerms(raw.daaTourStop),
    ...collectSearchTerms(raw.legendsListing),
    ...collectSearchTerms(raw.happyHour),
    ...collectSearchTerms(raw.campaignContext),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getDiscoverFeatureScore(place) {
  const id = String(place?.id || "");
  const explicitIndex = DISCOVER_FEATURED_ORDER.indexOf(id);
  if (explicitIndex >= 0) return 10000 - explicitIndex * 25;

  const text = placeText(place);
  const termIndex = DISCOVER_FEATURED_TERMS.findIndex((term) => text.includes(term));
  let score = termIndex >= 0 ? 8000 - termIndex * 20 : 0;

  const tier = String(place?.tier || place?.raw?.tier || "").toLowerCase();
  if (tier === "signature") score += 280;
  if (tier === "premium") score += 180;
  if (isPropertyEntity(place)) score += 90;
  if (isHotelEntity(place)) score += 80;
  if (isBrandEntity(place)) score += 70;
  if (isEventEntity(place)) score += 70;
  if (hasActivePerkData(place)) score += 45;

  return score;
}

function sortDiscoverPlaces(places) {
  return [...places]
    .map((place, index) => ({ place, index, score: getDiscoverFeatureScore(place) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ place }) => place);
}

function getSearchRelevanceScore(place, query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return 0;

  const name = String(place?.name || "").toLowerCase();
  const brand = String(place?.brand || place?.raw?.brand || "").toLowerCase();
  const text = placeText(place);
  const tokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 2 && token !== "austin");
  let score = 0;

  if (name === normalizedQuery || brand === normalizedQuery) score += 12000;
  if (name.includes(normalizedQuery)) score += 9000;
  if (brand.includes(normalizedQuery)) score += 8500;
  if (text.includes(normalizedQuery)) score += 6000;
  score += tokens.reduce((sum, token) => sum + (text.includes(token) ? 450 : 0), 0);

  return score;
}

function sortSearchPlaces(places, query) {
  return [...places]
    .map((place, index) => ({
      place,
      index,
      searchScore: getSearchRelevanceScore(place, query),
      featureScore: getDiscoverFeatureScore(place),
    }))
    .sort((a, b) => b.searchScore - a.searchScore || b.featureScore - a.featureScore || a.index - b.index)
    .map(({ place }) => place);
}

function getCollectionFilter(collection) {
  const key = String(collection || "").trim().toLowerCase();
  return MAP_COLLECTION_FILTER_ALIASES[key] || "";
}

function getLayerFilter(layer) {
  const key = String(layer || "").trim().toLowerCase();
  return MAP_LAYER_FILTER_ALIASES[key] || "";
}

function matchesCollection(place, collection) {
  const key = String(collection || "").trim().toLowerCase();
  if (!key) return true;
  const text = placeText(place);
  if (key === "legends") return isLegendsMapPlace(place) || Boolean(getLegendsListing(place) || getLegendsResidentialProfileForPlace(place)) || isPropertyEntity(place);
  if (key === "inkind") return isInKindEntity(place);
  if (key === "daa-art-walk") return Boolean(getDaaStopFromPlace(place)) || /\b(daa|art walk|public art)\b/i.test(text);
  if (key === "waterloo-greenway") return /\b(waterloo|waller creek|greenway|mood theater|symphony square)\b/i.test(text);
  if (key === "rainey" || key === "rainey-district") return /\brainey\b/i.test(text) || String(place?.district || "").toLowerCase().includes("rainey");
  if (key === "date-night") return /\b(date night|dinner|sushi|cocktail|wine|dessert|restaurant)\b/i.test(text);
  if (key === "happy-hour" || key === "warehouse-district-happy-hour") return isHappyHourEntity(place) || isInKindEntity(place) || /\bhappy hour|cocktail|restaurant|dining|drinks\b/i.test(text);
  if (key === "inkind-dining-market") return isInKindEntity(place) || /\binkind|restaurant|dining\b/i.test(text);
  if (key === "downtown-stories-walk") return isCivicEntity(place) || isFrostTowerEntity(place) || /\bcivic|public space|downtown|waterloo|republic square|frost tower\b/i.test(text);
  if (key === "coffee-before-work") return isCoffeeEntity(place) || isFrostTowerEntity(place) || /\bcoffee|cafe|espresso|workplace|office\b/i.test(text);
  if (key === "hotel-guest-arrival-route") return isHotelEntity(place) || /\bhotel|guest|rainey|music|dining|bar\b/i.test(text);
  if (key === "live-music") return /\b(live music|music|concert|venue|show)\b/i.test(text);
  if (key === "weekend-plans") return isEventEntity(place) || /\b(weekend|event|show|market|class|tour)\b/i.test(text);
  if (key === "civic-downtown") return isCivicEntity(place) || Boolean(getDaaStopFromPlace(place));
  return text.includes(key.replace(/-/g, " "));
}

function getMarkerDisclosureLimit({ hasIntent, isFocusedIntent, isDefaultDiscoverScope, userHasNavigatedMap, mapZoom }) {
  if (isDefaultDiscoverScope && !userHasNavigatedMap) return INITIAL_DISCOVERY_MARKER_LIMIT;
  if (isFocusedIntent && mapZoom >= 17.5) return FOCUSED_INTENT_HIGH_ZOOM_LIMIT;
  if (isFocusedIntent) return FOCUSED_INTENT_MARKER_LIMIT;
  if (!hasIntent && mapZoom < 15) return 20;
  if (!hasIntent && mapZoom < 16.5) return DEFAULT_INTERACTION_MARKER_LIMIT;
  if (!hasIntent) return DEFAULT_HIGH_ZOOM_MARKER_LIMIT;
  return INTENT_MARKER_FALLBACK_LIMIT;
}

function selectProgressiveMarkerPlaces(places, {
  activeFilter,
  collection,
  effectiveSearch,
  mapZoom,
  selectedId,
  savedIds,
  userHasNavigatedMap,
  isDefaultDiscoverScope,
}) {
  const deduped = dedupeMapPinPlaces(places);
  const hasIntent = Boolean(effectiveSearch || collection || activeFilter !== "All");
  const isFocusedIntent = FOCUSED_INTENT_FILTERS.has(activeFilter) || Boolean(effectiveSearch && FOCUSED_INTENT_FILTERS.has(resolveFilterForIntent(effectiveSearch, "resident") || ""));
  const source = isFocusedIntent
    ? deduped.filter((place) => matchesFilter(place, activeFilter, savedIds || new Set()))
    : deduped;
  const selectedPlace = selectedId ? source.find((place) => resolveMapEntityAlias(place.id) === selectedId) : null;
  const limit = getMarkerDisclosureLimit({ hasIntent, isFocusedIntent, isDefaultDiscoverScope, userHasNavigatedMap, mapZoom });
  const sorted = effectiveSearch ? sortSearchPlaces(source, effectiveSearch) : sortDiscoverPlaces(source);
  const selectedFirst = selectedPlace ? [selectedPlace, ...sorted.filter((place) => place.id !== selectedPlace.id)] : sorted;

  if (hasIntent && !isFocusedIntent && mapZoom >= 17.5) return selectedFirst;
  return selectedFirst.slice(0, limit);
}

function placeCoreText(place) {
  return [
    place.name,
    place.category,
    place.category_key,
    place.type,
    place.entityType,
    place.partnerType,
    place.brand,
    place.raw?.category,
    place.raw?.category_key,
    place.raw?.type,
    place.raw?.entityType,
    place.raw?.partnerType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function placeIntentText(place) {
  const raw = place?.raw || {};
  return [
    place?.name,
    place?.title,
    place?.displayTitle,
    place?.category,
    place?.subcategory,
    place?.category_key,
    place?.type,
    place?.kind,
    place?.entityType,
    place?.destinationKind,
    place?.detailDrawerType,
    place?.markerType,
    place?.partnerType,
    place?.brand,
    place?.source,
    place?.datasetLayer,
    place?.offer,
    place?.deals_offers,
    ...collectSearchTerms(place?.tags),
    ...collectSearchTerms(place?.searchKeywords),
    raw.category,
    raw.subcategory,
    raw.category_key,
    raw.type,
    raw.kind,
    raw.entityType,
    raw.destinationKind,
    raw.detailDrawerType,
    raw.markerType,
    raw.partnerType,
    raw.brand,
    raw.source,
    raw.datasetLayer,
    raw.offer,
    raw.deals_offers,
    raw.perk,
    raw.perks,
    raw.specials,
    raw.happyHour,
    raw.campaign,
    raw.campaignName,
    raw.campaignType,
    raw.campaignContext,
    ...collectSearchTerms(raw.tags),
    ...collectSearchTerms(raw.searchKeywords),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function coreMatches(place, tokens) {
  const text = placeCoreText(place);
  return (Array.isArray(tokens) ? tokens : []).some((token) => text.includes(String(token).toLowerCase()));
}

function getExplicitEntityType(place) {
  return String(place?.type || place?.entityType || place?.raw?.type || place?.raw?.entityType || "").toLowerCase();
}

function getExplicitEntityCategory(place) {
  return String(place?.category || place?.raw?.category || "").toLowerCase();
}

function getExplicitEntityCategoryKey(place) {
  return String(place?.category_key || place?.raw?.category_key || "").toLowerCase();
}

function getExplicitPartnerType(place) {
  return String(place?.partnerType || place?.raw?.partnerType || "").toLowerCase();
}

function isAntonesEntity(place) {
  return /\bantone'?s\b/i.test(placeCoreText(place));
}

function hasVenueSignals(place) {
  const text = placeCoreText(place);
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const partnerType = getExplicitPartnerType(place);
  return (
    type === "venue" ||
    type === "restaurant" ||
    type === "bar" ||
    type === "nightlife" ||
    type === "coffee" ||
    type === "retail" ||
    partnerType === "venues" ||
    partnerType === "venue" ||
    category.includes("venue") ||
    category.includes("restaurant") ||
    category.includes("bar") ||
    category.includes("nightlife") ||
    category.includes("coffee") ||
    category.includes("retail") ||
    categoryKey.includes("venue") ||
    categoryKey.includes("restaurant") ||
    categoryKey.includes("bar_nightlife") ||
    categoryKey.includes("nightlife") ||
    /\b(antone'?s|nightclub|live music|music venue|bar|cocktail|restaurant|dining|pizza|brewery|beer|coffee|cafe|retail|store)\b/i.test(text)
  );
}

function isExplicitPropertyRecord(place) {
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const partnerType = getExplicitPartnerType(place);
  return (
    type === "property" ||
    type === "residential" ||
    type === "listing" ||
    partnerType === "properties" ||
    partnerType === "property" ||
    partnerType === "realestate" ||
    partnerType === "real_estate" ||
    category === "residential property" ||
    category.includes("luxury residential") ||
    categoryKey.includes("residential_property") ||
    categoryKey.includes("legends") ||
    Boolean(place?.raw?.luxuryPresenceBuilding || place?.raw?.luxuryPresenceListing || place?.raw?.legendsListing || place?.legendsListing)
  );
}

function isRentalEntity(place) {
  const text = placeCoreText(place);
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  return (
    type === "rental" ||
    place?.kind === "rental" ||
    place?.raw?.kind === "rental" ||
    place?.raw?.rentalListing ||
    category.includes("rental") ||
    categoryKey.includes("rental") ||
    /\b(rental|rentals|leasing|for rent)\b/i.test(text)
  );
}

function isPropertyEntity(place) {
  if (isRentalEntity(place)) return false;
  if (isFrostTowerEntity(place)) return false;
  if (isExplicitPropertyRecord(place)) return true;
  if (hasVenueSignals(place)) return false;
  return Boolean(getLegendsListing(place) || getLuxuryPresenceBuilding(place) || getLegendsResidentialContentForPlace(place));
}

function isFrostTowerEntity(place) {
  const id = String(place?.id || place?.raw?.id || "").toLowerCase();
  const name = String(place?.name || place?.title || place?.raw?.name || place?.raw?.title || "").toLowerCase();
  return id === "priority-frost-tower" || name === "frost tower";
}

function isHotelEntity(place) {
  if (isPropertyEntity(place)) return false;
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const partnerType = getExplicitPartnerType(place);
  const name = String(place?.name || place?.title || place?.raw?.name || place?.raw?.title || "").toLowerCase();
  return (
    type === "hotel" ||
    type === "hospitality" ||
    partnerType === "hotel" ||
    partnerType === "hotels" ||
    partnerType === "hospitality" ||
    category === "hotel" ||
    category === "hotel / hospitality" ||
    category.includes("hotel / hospitality") ||
    categoryKey.includes("hotel_hospitality") ||
    categoryKey === "hotel" ||
    /\b(hotel|inn|resort|stay|lodging)\b/i.test(name)
  );
}

function isCampaignEntity(place) {
  const type = String(place?.type || place?.kind || place?.entityType || place?.raw?.type || "").toLowerCase();
  const markerType = String(place?.markerType || place?.raw?.markerType || "").toLowerCase();
  const detailType = String(place?.detailDrawerType || place?.raw?.detailDrawerType || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  const source = String(place?.source || place?.raw?.source || "").toLowerCase();
  return (
    type === "campaign" ||
    markerType === "campaign" ||
    detailType === "campaign" ||
    Boolean(place?.campaignType || place?.raw?.campaignType) ||
    category.includes("campaign") ||
    source.includes("map-native campaign")
  );
}

function isNeighborhoodEntity(place) {
  const type = String(place?.type || place?.kind || place?.entityType || place?.raw?.type || place?.raw?.kind || "").toLowerCase();
  const detailType = String(place?.detailDrawerType || place?.raw?.detailDrawerType || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  const categoryKey = String(place?.category_key || place?.raw?.category_key || "").toLowerCase();
  return type.includes("neighborhood") || detailType === "neighborhood" || category.includes("neighborhood") || categoryKey.includes("neighborhood");
}

function getMapDrawerPanelKind(place, mode = "resident") {
  if (!place) return "destination";
  const entityKind = getResidentEntityKind(place);
  if (isNeighborhoodEntity(place)) return "place";
  if (isDaaTourPlace(place) || entityKind === "civic" || entityKind === "landmark") return "civic";
  if (isCampaignEntity(place) || entityKind === "campaign") return "campaign";
  if (entityKind === "event" || getDestinationKind(place) === "event") return "event";
  if (entityKind === "property" || entityKind === "rental" || isRentalEntity(place) || isLegendsMapPlace(place) || isLegendsListingLike(place)) return "residential";
  if (mode === "partner") return "destination";
  if (entityKind === "place" || entityKind === "civic" || entityKind === "service") return "place";
  return "destination";
}

function isBrandEntity(place) {
  const text = placeCoreText(place);
  if (isCampaignEntity(place)) return false;
  if (text.includes("brand_activation")) return true;
  if (isPropertyEntity(place) || isHotelEntity(place)) return false;
  const type = String(place.type || "").toLowerCase();
  const partnerType = String(place.partnerType || "").toLowerCase();
  const name = String(place.name || "").toLowerCase();
  const knownBrands = ["rivian", "yeti", "topo chico", "fine eyewear", "inspired closets", "the stay put", "waterline", "ariat", "lululemon", "equinox", "austin fc", "legends real estate"];
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

function isRetailBrandEntity(place) {
  const text = placeCoreText(place);
  const id = String(place?.id || place?.raw?.id || "").toLowerCase();
  const name = String(place?.name || place?.raw?.name || "").toLowerCase();
  return Boolean(
    id === "partner-fine-eyewear" ||
    name === "fine eyewear" ||
    /\b(eyewear|frames|lens|lenses|optical|vision partner|retail_business|retail|shop|store|boutique)\b/i.test(text)
  );
}

function isVenueEntity(place) {
  if (isCampaignEntity(place) || isPropertyEntity(place) || isHotelEntity(place) || isBrandEntity(place)) return false;
  return hasVenueSignals(place) || coreMatches(place, FILTER_MATCHERS.Venues) || String(place.type || "").toLowerCase() === "venue";
}

function isEventEntity(place) {
  const type = String(place.type || "").toLowerCase();
  const category = String(place.category || "").toLowerCase();
  const categoryKey = String(place.category_key || "").toLowerCase();
  const markerType = String(place.markerType || place.raw?.markerType || "").toLowerCase();
  const detailType = String(place.detailDrawerType || place.raw?.detailDrawerType || "").toLowerCase();
  const text = placeText(place);
  const civicPlaceSignal = /\b(civic|public realm|public art|trail|greenway|park|plaza|square|library|city hall|government|museum|history center|waterfront|lady bird lake|butler trail|ann and roy butler)\b/i.test(text);
  const explicitEventSignal =
    type === "event" ||
    place.isEvent === true ||
    place.raw?.isEvent === true ||
    markerType === "event" ||
    detailType === "event";

  if (civicPlaceSignal && !explicitEventSignal) {
    return false;
  }

  return (
    explicitEventSignal ||
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
  return (
    !isCampaignEntity(place) &&
    (
      coreMatches(place, FILTER_MATCHERS.Civic) ||
      String(place.type || "").toLowerCase() === "civic" ||
      String(place.partnerType || place.raw?.partnerType || "").toLowerCase() === "civic" ||
      String(place.pinKey || place.raw?.pinKey || "").toLowerCase() === "civic"
    )
  );
}

function isExploreDowntownEntity(place) {
  if (isCampaignEntity(place)) return false;
  if (isNeighborhoodEntity(place)) return true;
  const source = String(place?.source || place?.raw?.source || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  const civicCategory = String(place?.civicCategory || place?.raw?.civicCategory || "").toLowerCase();
  const partner = String(place?.partner || place?.raw?.partner || "").toLowerCase();
  const tags = [
    ...(Array.isArray(place?.tags) ? place.tags : []),
    ...(Array.isArray(place?.raw?.tags) ? place.raw.tags : []),
    ...(Array.isArray(place?.searchKeywords) ? place.searchKeywords : []),
    ...(Array.isArray(place?.raw?.searchKeywords) ? place.raw.searchKeywords : []),
  ].join(" ").toLowerCase();

  return (
    source.includes("civic discovery network") ||
    category.includes("explore downtown") ||
    tags.includes("explore downtown") ||
    ["public-art", "mural", "historic-place", "landmark", "community-story", "park", "green-space", "cultural-destination", "civic-project"].includes(civicCategory) ||
    ["daa", "dana", "waterloo greenway"].includes(partner)
  );
}

function isListingEntity(place) {
  const text = placeCoreText(place);
  if (hasVenueSignals(place) && !isExplicitPropertyRecord(place)) return false;
  return Boolean(
    getLegendsListing(place) ||
    getLuxuryPresenceBuilding(place)?.listings?.length ||
    getLegendsResidentialContentForPlace(place) ||
    (/\b(legends real estate|mls)\b/i.test(text) && /\b(listing|unit|for rent|for sale|condo|condominium|apartment|residential property)\b/i.test(text)),
  );
}

function isInKindEntity(place) {
  const text = placeText(place);
  const partnerType = String(place?.partnerType || place?.raw?.partnerType || "").toLowerCase();
  const type = String(place?.type || place?.raw?.type || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  const pinKey = String(place?.pinKey || place?.raw?.pinKey || "").toLowerCase();
  const hasInKindSignal =
    partnerType === "inkind" ||
    pinKey === "inkind" ||
    text.includes("inkind") ||
    text.includes("in kind") ||
    text.includes("dining credit") ||
    text.includes("restaurant credit") ||
    text.includes("dining perk");
  const hasDiningSignal =
    partnerType === "inkind" ||
    type === "restaurant" ||
    category.includes("dining") ||
    category.includes("restaurant") ||
    text.includes("restaurant") ||
    text.includes("dining") ||
    text.includes("burger") ||
    text.includes("oyster") ||
    text.includes("food");
  const hotelCarrier = isHotelEntity(place) && partnerType !== "inkind" && type !== "restaurant" && !category.includes("dining");
  return hasInKindSignal && hasDiningSignal && !hotelCarrier;
}

function isServiceEntity(place) {
  const partnerType = String(place?.partnerType || place?.raw?.partnerType || "").toLowerCase();
  const type = String(place?.type || place?.raw?.type || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  return partnerType === "services" || type === "service" || category.includes("local service") || coreMatches(place, FILTER_MATCHERS.Services);
}

function isLocalServiceEntity(place) {
  const partnerType = String(place?.partnerType || place?.raw?.partnerType || "").toLowerCase();
  const category = String(place?.category || place?.raw?.category || "").toLowerCase();
  return partnerType === "services" || category.includes("local service") || Boolean(place?.localService || place?.raw?.localService);
}

function getParkingBooking(place) {
  return place?.parkingBooking || place?.raw?.parkingBooking || null;
}

function isParkingEntity(place) {
  const type = String(place?.type || "").toLowerCase();
  const kind = String(place?.kind || place?.raw?.kind || "").toLowerCase();
  const markerType = String(place?.markerType || place?.raw?.markerType || "").toLowerCase();
  const detailType = String(place?.detailDrawerType || place?.raw?.detailDrawerType || "").toLowerCase();
  const text = placeText(place);

  return (
    type === "parking" ||
    kind === "parking" ||
    markerType === "parking" ||
    detailType === "parking" ||
    Boolean(getParkingBooking(place)) ||
    text.includes("reservable parking") ||
    text.includes("parking booking")
  );
}

function isUtilityServiceEntity(place, utilityFilter = "") {
  const text = placeText(place);
  const normalizedFilter = String(utilityFilter || "").toLowerCase();
  const utilityMatchers = {
    printing: /\b(print|printing|fedex|copies|copy shop|print shop)\b/i,
    cleaners: /\b(cleaner|cleaners|cleaning|laundry|dry clean|dry cleaning)\b/i,
    pharmacy: /\b(pharmacy|medicine|cvs|walgreens)\b/i,
    "ev charging": /\b(ev charging|ev charger|chargepoint|tesla charging|charging station)\b/i,
    "bike share": /\b(bike share|metrobike|bike station)\b/i,
    "visitor info": /\b(visitor info|visitor information|tourist information)\b/i,
    shipping: /\b(shipping|mail|package|ups|post office)\b/i,
    services: /\b(service|errand|utility|concierge|coworking|business center)\b/i,
  };

  if (normalizedFilter && utilityMatchers[normalizedFilter]) return utilityMatchers[normalizedFilter].test(text);
  return Object.values(utilityMatchers).some((matcher) => matcher.test(text));
}

function isSearchOnlyRuntimeUtility(place) {
  if (isHappyHourEntity(place)) return false;
  if (coreMatches(place, FILTER_MATCHERS.Wellness) || String(place.type || place.kind || place.raw?.kind || "").toLowerCase() === "wellness") return false;
  return isParkingEntity(place) || isUtilityServiceEntity(place);
}

function isDiningEntity(place) {
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const partnerType = getExplicitPartnerType(place);
  const coreText = placeCoreText(place);
  const intentText = placeIntentText(place);
  const curatedFoodText = [
    place?.name,
    place?.title,
    place?.brand,
    type,
    categoryKey,
    partnerType,
    ...collectSearchTerms(place?.tags),
    ...collectSearchTerms(place?.searchKeywords),
    ...collectSearchTerms(place?.raw?.tags),
    ...collectSearchTerms(place?.raw?.searchKeywords),
  ].filter(Boolean).join(" ");
  const explicitFoodSignal = /\b(restaurant|dining|food|kitchen|sushi|taco|pizza|burger|steak|seafood|mexican|italian|brunch|breakfast|lunch|dinner|dessert|coffee|cafe|bakery|bar|cocktail|happy hour)\b/i.test([
    curatedFoodText,
  ].filter(Boolean).join(" "));
  const isBlockedNonDining =
    isCampaignEntity(place) ||
    isPropertyEntity(place) ||
    isHotelEntity(place) ||
    isCivicEntity(place) ||
    isRentalEntity(place) ||
    isParkingEntity(place) ||
    /\b(wellness|fitness|recreation|bathhouse|spa|sauna|cold plunge|massage|library|museum|park|public art|residential|hotel|parking|service)\b/i.test(coreText) ||
    (/\b(office|business|coworking|government|civic|property|residential|hotel|retail_business|office_business|service)\b/i.test([type, categoryKey, partnerType].join(" ")) && !explicitFoodSignal);

  if (isBlockedNonDining) return false;

  const compactText = [place.name, place.brand, type, category, categoryKey, partnerType].filter(Boolean).join(" ").toLowerCase();
  return (
    ["restaurant", "dining", "food", "bar", "coffee", "cafe", "happy_hour"].includes(type) ||
    partnerType === "restaurant" ||
    partnerType === "dining" ||
    category.includes("dining") ||
    category.includes("restaurant") ||
    category.includes("coffee") ||
    category.includes("bar") ||
    categoryKey.includes("dining") ||
    categoryKey.includes("restaurant") ||
    categoryKey.includes("coffee") ||
    categoryKey.includes("bar") ||
    categoryKey.includes("happy_hour") ||
    /\b(restaurant|dining|dinner|lunch|brunch|breakfast|sushi|taco|pizza|kitchen|cafe|coffee|bakery|dessert|happy hour|cocktail|bar)\b/i.test(compactText) ||
    /\b(restaurant|dining|dinner|lunch|brunch|breakfast|sushi|taco|pizza|kitchen|cafe|coffee|bakery|dessert|happy hour|cocktail|bar)\b/i.test(intentText)
  );
}

function isCoffeeEntity(place) {
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const compactText = [place.name, place.brand, type, category, categoryKey, placeIntentText(place)].filter(Boolean).join(" ").toLowerCase();
  if (!isDiningEntity(place)) return false;
  return /\b(coffee|cafe|espresso|latte|bakery|pastry|breakfast|morning|bagel|donut)\b/i.test(compactText);
}

function isDrinksEntity(place) {
  if (isCivicEntity(place) || isPropertyEntity(place) || isHotelEntity(place) || isRentalEntity(place) || isParkingEntity(place)) return false;
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const compactText = [place.name, place.brand, type, category, categoryKey, placeIntentText(place)].filter(Boolean).join(" ").toLowerCase();
  return /\b(bar|cocktail|drinks|wine|beer|brewery|nightlife|happy hour|rooftop|patio)\b/i.test(compactText) || (isHappyHourEntity(place) && isDiningEntity(place));
}

function isLivingEntity(place) {
  const type = getExplicitEntityType(place);
  const category = getExplicitEntityCategory(place);
  const categoryKey = getExplicitEntityCategoryKey(place);
  const partnerType = getExplicitPartnerType(place);
  const coreText = placeCoreText(place);
  return (
    isLegendsMapPlace(place) ||
    isPropertyEntity(place) ||
    isRentalEntity(place) ||
    isListingEntity(place) ||
    Boolean(getLegendsListing(place) || getLegendsResidentialProfileForPlace(place) || getLuxuryPresenceBuilding(place)) ||
    ["property", "residential", "building", "listing", "rental"].includes(type) ||
    ["property", "properties", "realestate", "real_estate"].includes(partnerType) ||
    category.includes("residential") ||
    category.includes("property") ||
    category.includes("listing") ||
    categoryKey.includes("residential") ||
    categoryKey.includes("property") ||
    categoryKey.includes("listing") ||
    /\b(legends real estate|residential tower|residential building|available listing|mls|condo|condominium|apartment|luxury living)\b/i.test(coreText)
  );
}

function isStrictIntentMatch(place, activeFilter) {
  const text = placeText(place);
  const intentText = placeIntentText(place);
  const categoryText = [
    place?.name,
    place?.title,
    place?.brand,
    place?.category,
    place?.category_key,
    place?.type,
    place?.kind,
    place?.partnerType,
    place?.raw?.category,
    place?.raw?.category_key,
    place?.raw?.type,
    place?.raw?.kind,
    place?.raw?.partnerType,
  ].filter(Boolean).join(" ").toLowerCase();
  const matchText = [categoryText, intentText].join(" ");

  if (activeFilter === "Dinner" || activeFilter === "Lunch") {
    const mealPattern = activeFilter === "Lunch"
      ? /\b(lunch|sandwich|salad|taco|pizza|burger|sushi|noon|midday)\b/i
      : /\b(dinner|supper|evening|sushi|steak|restaurant|date night)\b/i;
    return (isDiningEntity(place) && !isCoffeeEntity(place) && (mealPattern.test(matchText) || activeFilter === "Lunch")) || (isCampaignEntity(place) && mealPattern.test(text));
  }
  if (activeFilter === "Breakfast") {
    return isDiningEntity(place) && /\b(breakfast|morning|coffee|cafe|bakery|pastry|bagel|donut|espresso)\b/i.test(matchText);
  }
  if (activeFilter === "Brunch") {
    return isDiningEntity(place) && /\b(brunch|breakfast|weekend|morning|cafe|bakery|pastry)\b/i.test(matchText);
  }
  if (activeFilter === "Dessert") {
    return isDiningEntity(place) && /\b(dessert|ice cream|gelato|pastry|bakery|sweet|cookie|cake)\b/i.test(matchText);
  }
  if (activeFilter === "Dining") {
    return (isDiningEntity(place) && !isCoffeeEntity(place)) || (isCampaignEntity(place) && /\b(dining|dinner|restaurant|sushi|brunch|passport|happy hour)\b/i.test(intentText)) || (hasActivePerkData(place) && isDiningEntity(place));
  }
  if (activeFilter === "Coffee") return isCoffeeEntity(place);
  if (activeFilter === "Drinks" || activeFilter === "Cocktails" || activeFilter === "Happy Hour" || activeFilter === "Happy Hours") return isDrinksEntity(place);
  if (activeFilter === "Civic" || activeFilter === "Public Art" || activeFilter === "Arts & Culture" || activeFilter === "Explore Downtown") {
    return isCivicEntity(place) || isExploreDowntownEntity(place) || Boolean(getDaaStopFromPlace(place));
  }
  if (activeFilter === "Rentals") return isLivingEntity(place);
  if (activeFilter === "Legends" || activeFilter === "Living Here" || activeFilter === "Listings" || activeFilter === "All Listings") return isLivingEntity(place);
  if (activeFilter === "inKind") return isInKindEntity(place) || (isCampaignEntity(place) && /\b(inkind|dining|restaurant|passport|date night|brunch|happy hour)\b/i.test(placeText(place)));
  return true;
}

function isIntentOnlyFilter(activeFilter) {
  return [
    "Dining",
    "Breakfast",
    "Brunch",
    "Lunch",
    "Dinner",
    "Dessert",
    "Coffee",
    "Drinks",
    "Cocktails",
    "Happy Hour",
    "Happy Hours",
    "Civic",
    "Public Art",
    "Arts & Culture",
    "Explore Downtown",
    "Rentals",
    "Legends",
    "Living Here",
    "Listings",
    "All Listings",
    "inKind",
  ].includes(activeFilter);
}

function matchesFilter(place, activeFilter, savedIds) {
  if (activeFilter === "All") return !isSearchOnlyRuntimeUtility(place) || hasActivePerkData(place);
  if (["Open Now", "Tonight", "This Week", "Scans", "Saves", "Redemptions", "Opportunities", "Performance", "Opportunity", "Coverage", "Audience", "Stories", "Surveys", "Broadcasts", "Activations"].includes(activeFilter)) return true;
  if (activeFilter === "Saved") return savedIds.has(place.id);
  if (activeFilter === "Perks") return hasActivePerkData(place);
  if (activeFilter === "Campaigns") return isCampaignEntity(place);
  if (activeFilter === "Brand Activations") return isBrandEntity(place) || (isCampaignEntity(place) && /\b(brand|activation|sponsor|retail|heritage|rivian|yeti|topo|lululemon|equinox|ariat)\b/i.test(placeText(place)));
  if (activeFilter === "Explore Downtown") return isExploreDowntownEntity(place) || Boolean(getDaaStopFromPlace(place));
  if (activeFilter === "Places") {
    return (
      isVenueEntity(place) ||
      isHotelEntity(place) ||
      isServiceEntity(place) ||
      ["Dining", "Drinks", "Coffee", "Fitness", "Retail", "Grocery", "Culture", "Live Music"].includes(place.category)
    );
  }
  if (activeFilter === "Dining") return isStrictIntentMatch(place, "Dining");
  if (activeFilter === "Coffee") return isStrictIntentMatch(place, "Coffee");
  if (activeFilter === "Drinks" || activeFilter === "Cocktails") return isStrictIntentMatch(place, "Drinks");
  if (["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert"].includes(activeFilter)) return isStrictIntentMatch(place, activeFilter);
  if (activeFilter === "Happy Hours" || activeFilter === "Happy Hour") return isStrictIntentMatch(place, "Happy Hour");
  if (activeFilter === "Happy Hour Now") return isHappyHourEntity(place) && Boolean(place.isLiveNow);
  if (activeFilter === "Happy Hour Today") return isHappyHourEntity(place) && Boolean(place.happyHour?.days);
  if (activeFilter === "Properties") return isPropertyEntity(place);
  if (activeFilter === "Listings") return isListingEntity(place);
  if (activeFilter === "Legends" || activeFilter === "Living Here" || activeFilter === "All Listings") {
    return isLegendsMapPlace(place) || Boolean(getLegendsListing(place) || getLegendsResidentialProfileForPlace(place)) || isListingEntity(place) || isRentalEntity(place) || isPropertyEntity(place);
  }
  if (["Luxury", "Waterfront", "Downtown Core", "Seaholm", "Rainey", "Congress", "Move-In Ready", "Newest Listings"].includes(activeFilter)) {
    const profile = getLegendsResidentialProfileForPlace(place);
    const legendsText = placeText(place);
    if (!profile && !isLegendsMapPlace(place) && !isRentalEntity(place) && !getLegendsListing(place)) return false;
    if (activeFilter === "Luxury") return /\b(luxury|penthouse|concierge|premium|residence|condo|condominium)\b/i.test(legendsText);
    if (activeFilter === "Move-In Ready" || activeFilter === "Newest Listings") return Boolean(isRentalEntity(place) || getLegendsListing(place));
    return [profile?.neighborhood, profile?.district, place?.district, place?.neighborhood, place?.address, place?.name, legendsText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(activeFilter.toLowerCase());
  }
  if (activeFilter === "Rentals") return isLivingEntity(place);
  if (activeFilter === "inKind") return isInKindEntity(place);
  if (activeFilter === "Hotels") return isHotelEntity(place);
  if (activeFilter === "Brands") return isBrandEntity(place);
  if (activeFilter === "Venues") return isVenueEntity(place);
  if (activeFilter === "Wellness") return coreMatches(place, FILTER_MATCHERS.Wellness) || String(place.type || "").toLowerCase() === "wellness" || String(place.kind || place.raw?.kind || "").toLowerCase() === "wellness";
  if (activeFilter === "Retail") return coreMatches(place, FILTER_MATCHERS.Retail) || /\b(retail|shop|shopping|store|fashion|boutique)\b/i.test(placeText(place));
  if (activeFilter === "Events") return isEventEntity(place);
  if (activeFilter === "Discovery Trails") return coreMatches(place, FILTER_MATCHERS["Discovery Trails"]) || String(place.type || place.kind || place.raw?.type || place.raw?.kind || "").toLowerCase() === "discovery_marker";
  if (["Civic", "DAA", "DANA"].includes(activeFilter)) return isCivicEntity(place) || Boolean(getDaaStopFromPlace(place)) || new RegExp(`\\b${activeFilter.toLowerCase()}\\b`, "i").test(placeText(place));
  if (activeFilter === "Parking") return isParkingEntity(place);
  if (activeFilter === "Mobility") return isUtilityServiceEntity(place) || /\b(mobility|transit|bike|scooter|ev charging|parking|ride)\b/i.test(placeText(place));
  if (activeFilter === "Print") return isUtilityServiceEntity(place, "Printing");
  if (["Printing", "Pharmacy", "Cleaners", "EV Charging", "Bike Share", "Visitor Info", "Shipping"].includes(activeFilter)) return isUtilityServiceEntity(place, activeFilter);
  if (activeFilter === "Services") return isServiceEntity(place) || isUtilityServiceEntity(place);
  const tokens = FILTER_MATCHERS[activeFilter] || [];
  const text = placeText(place);
  return (Array.isArray(tokens) ? tokens : []).some((token) => text.includes(String(token).toLowerCase()));
}

function getAskMapCategoryHint(place, fallback = "places") {
  if (!place) return fallback;
  if (hasActivePerkData(place)) return "perks";
  const kind = getDestinationKind(place);
  const hintByKind = {
    brand: "brand activations",
    civic: "civic places",
    coffee: "coffee",
    dining: "dining",
    event: "events",
    grocery: "errands",
    hotel: "hotels",
    nightlife: "drinks",
    parking: "parking",
    property: "properties",
    retail: "shopping",
    service: "services",
  };
  return hintByKind[kind] || fallback;
}

function buildMapAnswer(query, results, mode, district, activeFilter) {
  const cleanQuery = query.trim();
  const scope = isAllNeighborhoodScope(district) ? "downtown" : district;
  const topResults = results.slice(0, 3);

  if (!topResults.length) {
    return {
      title: cleanQuery ? cleanQuery.toUpperCase() : "DOWNTOWN",
      body:
        mode === "partner"
          ? `Start with the map, then choose the area where people are already active. The useful move is visibility, not another filter.`
          : `Start with the map, then choose what feels closest to the plan. The useful move is a nearby decision, not a longer list.`,
      picks: [],
      actions: ["open-nearby"],
    };
  }

  const best = topResults[0];
  const categoryHint = activeFilter === "All" ? getAskMapCategoryHint(best) : String(activeFilter || "places").toLowerCase();
  const bestName = best?.name || "the first nearby option";
  const bestDistrict = best?.district || scope;
  const why =
    mode === "partner"
      ? `${bestName} is a good place to start. It connects nearby activity with one clear next step in ${bestDistrict}.`
      : `${bestName} is the cleanest starting point for ${categoryHint} because it is nearby, easy to act on, and fits the way people are already moving through ${bestDistrict}.`;

  return {
    title: `Start with ${bestName}.`,
    body: why,
    picks: topResults,
    actions: ["open-nearby", "save"],
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
  const best = topResults[0];
  const alternatives = topResults.slice(1).map((place) => place.name).filter(Boolean);
  const scope = isAllNeighborhoodScope(district) ? "downtown" : district;
  const audience = mode === "partner" ? "partner" : "resident";
  const normalizedFilter = String(activeFilter || "").toLowerCase();
  const isCivicFilter = normalizedFilter.includes("civic") || normalizedFilter === "daa";
  const isDiningFilter = normalizedFilter.includes("dining") || normalizedFilter.includes("dinner");
  const isInKindFilter = normalizedFilter.includes("inkind");

  if (!topResults.length) return base;

  const answerStack = {
    bestMatch: best,
    alternatives,
    collections: isCivicFilter ? ["Downtown Austin Art & Parks Tour"] : isDiningFilter ? ["Best Sushi Downtown", "Dinner Tonight"] : isInKindFilter ? ["Date Night Downtown", "Brunch Collection"] : [],
    campaigns: isCivicFilter ? ["DAA Art Walk Sponsor"] : isDiningFilter ? ["Downtown Sushi Week", "Resident Dining Week"] : isInKindFilter ? ["Downtown Sushi Passport", "Restaurant Week"] : [],
    events: topResults.filter(isEventEntity).map((place) => place.name).slice(0, 2),
    nextAction: mode === "partner" ? "Launch Campaign" : isCivicFilter ? "Open Tour Stop" : isDiningFilter ? "Reserve Table" : "Open Recommendation",
  };

  if (audience === "partner") {
    const focus = activeFilter === "All" ? "activity" : activeFilter.toLowerCase();
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the clearest ${focus} read in ${scope}. It shows what people are doing nearby and gives you one place to act.${alternatives.length ? ` Compare it with ${alternatives.slice(0, 2).join(" and ")}.` : ""}`,
      picks: topResults,
      actions: ["Launch Campaign", "View Report"],
      why: `${best.name} connects nearby activity with one clear next step in ${scope}.`,
      ...answerStack,
    };
  }

  if (promptIntent === "go") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the easiest place to start if you want a plan that works nearby. It keeps the decision close to ${scope}.${alternatives.length ? ` ${alternatives[0]} is the better backup if the first stop does not fit.` : ""}`,
      picks: topResults,
      actions: [answerStack.nextAction, "Save"],
      why: `${best.name} fits the nearby context and gives you the cleanest first move.`,
      ...answerStack,
    };
  }

  if (promptIntent === "see") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the clearest thing to look at first in ${scope}. It gives you context without turning the map into a result dump.${alternatives.length ? ` ${alternatives.join(" and ")} are useful alternatives.` : ""}`,
      picks: topResults,
      actions: [answerStack.nextAction, "Save"],
      why: `${best.name} is the clearest match for what you asked to see.`,
      ...answerStack,
    };
  }

  if (promptIntent === "do") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} gives you the simplest next move in ${scope}. Open it, save it, or compare the nearby options before you leave the map.`,
      picks: topResults,
      actions: [answerStack.nextAction, "Save"],
      why: `${best.name} gives you a practical next step without making the map noisy.`,
      ...answerStack,
    };
  }

  return {
    ...base,
    actions: [answerStack.nextAction, "Save"],
    why: base.body,
    ...answerStack,
  };
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
  const resultText = localResults.map((place) => placeText(place)).join(" ");
  const isCivicResponse = /\b(civic|daa|public art|art walk|museum|park)\b/i.test(resultText);
  const isDiningResponse = /\b(dining|restaurant|dinner|sushi|happy hour|coffee|bar)\b/i.test(resultText);
  const isResidentialResponse = /\b(residential|listing|legends|rental|condo|apartment)\b/i.test(resultText);
  const fallbackCollections = isCivicResponse
    ? ["Downtown Austin Art & Parks Tour"]
    : isDiningResponse
      ? ["Dinner Tonight", "Best Sushi Downtown"]
      : isResidentialResponse
        ? ["Luxury Living"]
        : ["Downtown Picks"];
  const fallbackCampaigns = isCivicResponse
    ? ["DAA Art Walk Sponsor"]
    : isDiningResponse
      ? ["Resident Dining Week", "Downtown Sushi Week"]
      : isResidentialResponse
        ? ["Resident Welcome Guide"]
        : ["Resident Summer Guide"];
  const fallbackEvents = localResults.filter(isEventEntity).map((place) => place.name).slice(0, 3);

  return {
    title: agentAnswer.title || fallbackTitle,
    body: agentAnswer.answer,
    picks,
    actions: Array.isArray(agentAnswer.actions) ? agentAnswer.actions.slice(0, 4) : [],
    bestMatch: picks[0],
    alternatives: picks.slice(1).map((place) => place.name),
    why: agentAnswer.explanation || agentAnswer.answer,
    collections: Array.isArray(agentAnswer.collections) && agentAnswer.collections.length ? agentAnswer.collections.slice(0, 3) : fallbackCollections,
    campaigns: Array.isArray(agentAnswer.campaigns) && agentAnswer.campaigns.length ? agentAnswer.campaigns.slice(0, 3) : fallbackCampaigns,
    events: Array.isArray(agentAnswer.events) && agentAnswer.events.length ? agentAnswer.events.slice(0, 3) : fallbackEvents,
    nextAction: Array.isArray(agentAnswer.actions) && agentAnswer.actions[0] ? agentAnswer.actions[0] : "Open Recommendation",
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
  if (/\b(rental|rentals|for rent|lease|leasing|available under|under 4000|under \$4,000)\b/.test(q)) add(["rental", "rentals", "leasing", "residential", "building"]);
  if (/\b(property|building|apartment|condo|resident|home)\b/.test(q)) add(["property", "residential", "building", "apartment", "condo"]);
  if (/\b(brand|sponsor|campaign|activate|activation|audience)\b/.test(q)) add(["brand", "campaign", "activation", "audience"]);
  if (/\b(event|rsvp|happening|live)\b/.test(q)) add(["event", "rsvp", "music", "activation"]);
  if (/\b(wellness|fitness|gym|yoga|spa)\b/.test(q)) add(["wellness", "fitness", "gym", "yoga", "spa"]);
  MAP_INTENT_RULES.forEach((rule) => {
    const ruleTokens = Array.isArray(rule.tokens) ? rule.tokens : [];
    if (ruleTokens.some((token) => q.includes(token))) {
      add([rule.intent, rule.filter, rule.entityType, ...ruleTokens].filter(Boolean).map((item) => String(item).toLowerCase().replace(/_/g, " ")));
    }
  });

  return Array.from(tokens);
}

function scorePlaceForIntent(place, intentTokens, query, mode) {
  const text = placeText(place);
  const parsedIntent = parseMapIntent(query, mode);
  let score = 0;

  intentTokens.forEach((token) => {
    if (text.includes(token)) score += token.length > 5 ? 6 : 4;
    if (String(place.name || "").toLowerCase().includes(token)) score += 8;
    if (String(place.category || "").toLowerCase().includes(token)) score += 5;
    if (String(place.district || "").toLowerCase().includes(token)) score += 4;
  });

  if (hasActivePerkData(place)) score += query.includes("perk") || query.includes("card") ? 10 : 2;
  if (parsedIntent.intents.includes("DAA_art_walk") && /\b(daa|downtown austin alliance|art|parks tour|public art|historic|museum|library|civic|park|trail)\b/.test(text)) score += 28;
  if (parsedIntent.intents.includes("InKind") && /\b(in[\s-]?kind|dining credit|restaurant credit)\b/.test(text)) score += 30;
  if (parsedIntent.intents.includes("Legends") && (isLegendsMapPlace(place) || getLegendsListing(place) || /\b(legends|listing|mls|for sale|for rent|condo|apartment)\b/.test(text))) score += 40;
  if (parsedIntent.entityType && text.includes(parsedIntent.entityType.toLowerCase())) score += 8;
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

function isLegendsListingLike(place) {
  const text = placeCoreText(place);
  if (hasVenueSignals(place) && !isExplicitPropertyRecord(place)) return false;
  if (hasNonResidentialActivationSignals(place)) return false;
  return Boolean(
    getLegendsListing(place) ||
    getLuxuryPresenceBuilding(place) ||
    getLegendsResidentialContentForPlace(place) ||
    (/\b(legends real estate|mls)\b/i.test(text) && /\b(listing|unit|for rent|for sale|condo|condominium|apartment|residential property)\b/i.test(text)),
  );
}

function hasNonResidentialActivationSignals(place) {
  const text = placeCoreText(place);
  const hasActivationSignal = /\b(brand activation|activation|campaign|perk|service|sponsorship|hydration|run club|eyewear|closets?|mobility|retail|topo chico|rivian|yeti|lululemon|fine eyewear|inspired closets)\b/i.test(text);
  const hasPropertySignal = /\b(legends real estate|residential property|condo|condominium|apartment|for sale|for rent|mls|building)\b/i.test(text);
  return hasActivationSignal && !hasPropertySignal && !getLegendsListing(place) && !getLuxuryPresenceBuilding(place) && !isExplicitPropertyRecord(place);
}

function isSpringCondominiums(place) {
  const text = placeCoreText(place);
  return /\bspring\s+condominiums\b|300\s+bowie|spring-condominiums/i.test(text);
}

function getLegendsResidentialContentForPlace(place) {
  if (hasNonResidentialActivationSignals(place)) return null;
  return place?.raw?.legendsResidentialContent || place?.legendsResidentialContent || getLegendsPropertyContent(place);
}

function getLegendsResidentialProfileForPlace(place) {
  if (hasNonResidentialActivationSignals(place)) return null;
  const directProfile = place?.raw?.legendsResidentialExperience || place?.legendsResidentialExperience || getLegendsResidentialExperience(place);
  if (directProfile) return directProfile;
  return createGenericLegendsResidentialExperience(getLegendsResidentialContentForPlace(place));
}

const SPRING_CONDOMINIUMS_PROFILE = {
  eyebrow: "SEAHOLM DISTRICT",
  title: "Spring Condominiums",
  brand: "LEGENDS REAL ESTATE",
  address: "300 Bowie Street",
  location: "Seaholm District",
  summary: "Modern downtown living in the heart of Seaholm. Walk to restaurants, coffee shops, fitness studios, Lady Bird Lake, Whole Foods, and some of Austin's most active downtown destinations.",
  why: "Spring sits at one of downtown's most useful intersections: Seaholm, the lake, Whole Foods, coffee, fitness, restaurants, and West Sixth are all close enough to become part of daily life.",
  perksCopy: "Living at Spring means downtown starts at your front door. Downtown Perks helps residents discover what is happening nearby without searching across multiple apps.",
  snapshot: [
    ["Address", "300 Bowie Street"],
    ["Neighborhood", "Seaholm District"],
    ["Property Type", "Luxury Residential Condominium"],
    ["Style", "High-Rise"],
    ["Walkability", "Excellent"],
    ["Resident Experience", "Urban Lifestyle"],
  ],
  nearbyDistricts: ["Seaholm", "Downtown Core", "Market District", "West Sixth", "Lady Bird Lake"],
  perksIncluded: ["Nearby dining", "Happy hours", "Events", "Fitness classes", "Coffee shops", "Local services", "Resident-exclusive offers"],
  walkTimes: [
    ["Whole Foods", "3 min walk"],
    ["Lady Bird Lake Trail", "5 min walk"],
    ["Seaholm District", "2 min walk"],
    ["Downtown Core", "8 min walk"],
    ["West Sixth", "6 min walk"],
  ],
  lifestyle: {
    Coffee: ["Jo's Coffee", "Merit Coffee", "Starbucks Reserve", "Codependent"],
    Dining: ["True Food Kitchen", "Hestia", "Qi", "La Condesa", "Comedor"],
    Drinks: ["Garage", "The Roosevelt Room", "Ranch 616", "Coconut Club"],
    Wellness: ["CorePower Yoga", "Pure Barre", "Lifetime", "Love Cycling"],
    Groceries: ["Whole Foods Market", "Trader Joe's"],
  },
};

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

function isUnitLevelListingPlace(place) {
  if (!place) return false;
  if (getLuxuryPresenceBuilding(place)) return false;
  if (getLegendsListing(place)) return true;
  const raw = place?.raw || {};
  if (raw?.luxuryPresenceListing || raw?.legendsListing) return true;
  const text = [
    place.id,
    place.name,
    place.address,
    place.slug,
    place.osm_id,
    place.osmType,
    place.category_key,
    place.source,
    raw.address,
    raw.name,
    raw.osm_id,
    raw.osm_type,
    raw.category_key,
    raw.source,
    raw.mls_number,
    raw.mlsNumber,
  ].filter(Boolean).join(" ").toLowerCase();
  if (/\b(unit|#)\s*[a-z0-9-]+/.test(text) && /\b(mls|legends|property|residential)\b/.test(text)) return true;
  if (/\blegends[_\s-]*property\b/.test(text) || /\blegends[_\s-]*real[_\s-]*estate\b/.test(text)) return true;
  return /\bmls\b/.test(text) && /\b\d{3,5}\b/.test(text) && /\b(property|residential|condo|listing)\b/.test(text);
}

function isLegendsMapPlace(place) {
  if (isUnitLevelListingPlace(place)) return false;
  return Boolean(getLuxuryPresenceBuilding(place)) || String(place?.pinKey || place?.brand || place?.source || "").toLowerCase().includes("legends");
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
  if (isRentalEntity(place)) {
    return `Rental · ${place?.district || "Downtown Austin"}`;
  }
  if (isAntonesEntity(place)) {
    return "Venue · East Downtown";
  }
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

function getEventTimeContext(place) {
  const raw = place?.raw || {};
  return cleanDisplayCopy(
    raw.time ||
      raw.startTime ||
      raw.start_time ||
      raw.date ||
      place?.time ||
      place?.startTime ||
      place?.date ||
      ""
  );
}

function getEntityIdentity(place, mode = "resident") {
  const district = place?.district || place?.neighborhood || place?.raw?.district || "Downtown Austin";
  const address = String(place?.address || place?.raw?.address || "").replace(/,\s*(Austin|TX|78701).*$/i, "").trim();
  const legendsListing = getResolvedLegendsListing(place);
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const kind = getResidentEntityKind(place);
  const destinationKind = getDestinationKind(place);
  const context = getPanelContextSentence(place, mode);
  const panelArchetype = resolveEntityPanelArchetype(place);
  const panelContent = resolveEntityPanelContent(place, mode);
  const panelTypeLabel = `${panelContent.eyebrow || panelArchetype.eyebrow} · ${district}`;
  const panelTitle = panelContent.title || place?.name || place?.title || "Downtown destination";
  const panelSubtitle = panelContent.subtitle || [getCanonicalCategoryLabel(place), address || district].filter(Boolean).join(" · ");
  const panelContext = panelContent.context || context;

  if (isBurgerBarCongress(place)) {
    return {
      id: place?.id,
      entityType: mode === "partner" ? "opportunity" : "perk",
      displayTypeLabel: `${mode === "partner" ? "Dining opportunity" : "Resident dining"} · Congress Avenue`,
      displayTitle: BURGER_BAR_CONGRESS_CONTENT.title,
      displaySubtitle: mode === "partner" ? BURGER_BAR_CONGRESS_CONTENT.partnerSubtitle : BURGER_BAR_CONGRESS_CONTENT.residentSubtitle,
      displayContext: truncatePanelCopy(
        mode === "partner" ? BURGER_BAR_CONGRESS_CONTENT.partnerOverview : BURGER_BAR_CONGRESS_CONTENT.residentOverview,
        130,
      ),
      address: address || "110 E 2nd St",
      neighborhood: "Congress Avenue",
      categoryLabel: mode === "partner" ? "Dining opportunity" : "Resident dining",
      panelArchetype,
    };
  }

  if (mode === "partner" && isParkingEntity(place)) {
    const copy = getPartnerPanelCopy(place);
    return {
      id: place?.id,
      entityType: "parking",
      displayTypeLabel: `Parking intelligence · ${district}`,
      displayTitle: place?.name || "Parking opportunity",
      displaySubtitle: copy.value || "Parking people can reserve",
      displayContext: truncatePanelCopy(copy.description || context, 130),
      address,
      neighborhood: district,
      categoryLabel: "Parking intelligence",
      panelArchetype,
    };
  }

  if (isRentalEntity(place)) {
    const rental = place?.raw?.rentalListing || place?.rentalListing || {};
    const facts = [
      place?.priceLabel || rental.priceLabel,
      rental.beds || place?.beds ? `${rental.beds || place?.beds} bd` : "",
      rental.baths || place?.baths ? `${rental.baths || place?.baths} ba` : "",
      rental.sqft || place?.sqft ? `${Number(rental.sqft || place?.sqft).toLocaleString()} sqft` : "",
    ].filter(Boolean).join(" · ");
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} · ${district}`,
      displayTitle: place?.name || rental.building || "Downtown rental",
      displaySubtitle: facts || [district, address].filter(Boolean).join(" · "),
      displayContext: context,
      address,
      neighborhood: district,
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (legendsListing) {
    const facts = getListingFactLine(legendsListing);
    return {
      id: place?.id || legendsListing.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} · ${district}`,
      displayTitle: place?.name || legendsListing.address || "Downtown residence",
      displaySubtitle: facts || [district, address].filter(Boolean).join(" · "),
      displayContext: context,
      address,
      neighborhood: district,
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (luxuryBuilding || kind === "property") {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} · ${district}`,
      displayTitle: place?.name || "Downtown residence",
      displaySubtitle: [district, address].filter(Boolean).join(" · "),
      displayContext: context,
      address,
      neighborhood: district,
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (isAntonesEntity(place)) {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} · East Downtown`,
      displayTitle: "Antone's Nightclub",
      displaySubtitle: "Live Music · Nightlife",
      displayContext: "Live music, late nights, and downtown shows.",
      address: address || "305 East 5th Street",
      neighborhood: "East Downtown",
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (isFrostTowerEntity(place)) {
    return {
      id: place?.id,
      entityType: "premium-workplace",
      displayTypeLabel: `Downtown Partner · ${district || "Congress Avenue"}`,
      displayTitle: "Frost Tower",
      displaySubtitle: "Congress Avenue · Premium Workplace",
      displayContext: "Austin's most recognizable workplace destination connects business, hospitality, services, and community through Downtown Perks.",
      address: address || "401 Congress Ave, Austin TX, 78701",
      neighborhood: district || "Congress",
      categoryLabel: "Premium Workplace",
      panelArchetype,
    };
  }

  if (kind === "campaign" || isCampaignEntity(place)) {
    const raw = place?.raw || {};
    const partnerLine = place?.partnerLine || raw.partnerLine || place?.sponsorName || raw.sponsorName;
    const campaignSummary = place?.summary || raw.summary || place?.description || raw.description || context;
    return {
      id: place?.id,
      entityType: "guide",
      displayTypeLabel: `${panelArchetype.eyebrow} · ${district}`,
      displayTitle: place?.name || place?.title || "Downtown campaign",
      displaySubtitle: partnerLine ? `Partner: ${partnerLine}` : [district, address].filter(Boolean).join(" · "),
      displayContext: truncatePanelCopy(campaignSummary, 210),
      address,
      neighborhood: district,
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (isInKindEntity(place)) {
    const perk = getResidentPerkDetails(place);
    const perkTitle = formatResidentPerkHeading(perk?.offer || getExplicitGroupedOffer(place) || "Resident perk");
    const contextCopy = isGeraldinesEntity(place)
      ? "Upscale dining and live music inside Hotel Van Zandt."
      : truncatePanelCopy(perk?.description || context, 130);
    return {
      id: place?.id,
      entityType: "perk",
      displayTypeLabel: `${mode === "partner" ? "Dining opportunity" : "Resident Perk"} · ${district}`,
      displayTitle: place?.name || perkTitle,
      displaySubtitle: perkTitle,
      displayContext: contextCopy,
      perkTitle,
      offerTitle: perkTitle,
      address,
      neighborhood: district,
      categoryLabel: mode === "partner" ? "Dining opportunity" : "Resident perk",
      panelArchetype,
    };
  }

  if (kind === "retail" || destinationKind === "retail" || isRetailBrandEntity(place)) {
    const perk = getResidentPerkDetails(place);
    const offerTitle = formatResidentPerkHeading(perk?.offer || getExplicitGroupedOffer(place) || "");
    return {
      id: place?.id,
      entityType: "retail",
      displayTypeLabel: `Retail · ${district}`,
      displayTitle: place?.name || place?.title || panelTitle || "Downtown retail",
      displaySubtitle: offerTitle || [panelSubtitle || getCanonicalCategoryLabel(place), address || district].filter(Boolean).join(" · "),
      displayContext: truncatePanelCopy(panelContext || perk?.description || context, 130),
      parentEntityName: place?.name,
      perkTitle: offerTitle,
      offerTitle,
      address,
      neighborhood: district,
      categoryLabel: "Retail",
      panelArchetype,
    };
  }

  if (panelArchetype.id === "perk") {
    if (mode === "partner") {
      const copy = getPartnerPanelCopy(place);
      return {
        id: place?.id,
        entityType: "opportunity",
        displayTypeLabel: `${copy.category} · ${district}`,
        displayTitle: place?.name || copy.title || "Partner opportunity",
        displaySubtitle: copy.value || copy.placement || "Business insight",
        displayContext: truncatePanelCopy(copy.description || context, 130),
        parentEntityName: place?.name,
        perkTitle: copy.title,
        offerTitle: copy.title,
        address,
        neighborhood: district,
        categoryLabel: copy.category,
        panelArchetype,
      };
    }
    const perk = getResidentPerkDetails(place);
    const perkTitle = formatResidentPerkHeading(perk?.offer || getExplicitGroupedOffer(place) || place?.name || "Resident perk");
    const isHappyHourPerk = isHappyHourEntity(place);
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: panelTypeLabel,
      displayTitle: place?.name || place?.title || panelTitle || perkTitle,
      displaySubtitle: perkTitle !== (place?.name || place?.title) ? perkTitle : perk?.category || "Resident perk",
      displayContext: isHappyHourPerk ? "" : truncatePanelCopy(perk?.description || panelContext, 110),
      parentEntityName: place?.name,
      perkTitle,
      offerTitle: perkTitle,
      address,
      neighborhood: district,
      categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (kind === "brand" || destinationKind === "brand" || (mode === "partner" && isBrandEntity(place))) {
    const copy = mode === "partner" ? getPartnerPanelCopy(place) : null;
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: mode === "partner" ? `${copy.category || "Brand activation"} · ${district}` : panelTypeLabel,
      displayTitle: panelTitle,
      displaySubtitle: mode === "partner" ? (copy.placement || panelSubtitle) : [panelSubtitle, hasActivePerkData(place) ? "Resident offer" : ""].filter(Boolean).join(" · "),
      displayContext: mode === "partner" ? truncatePanelCopy(copy.description || panelContext, 150) : panelContext,
      address,
      neighborhood: district,
      categoryLabel: mode === "partner" ? copy.category : panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (kind === "event" || destinationKind === "event") {
    const timeContext = getEventTimeContext(place);
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelContent.eyebrow || panelArchetype.eyebrow} · ${timeContext || district}`,
      displayTitle: panelTitle,
      displaySubtitle: [timeContext, district].filter(Boolean).join(" · "),
      displayContext: panelContext,
      eventTitle: place?.name || place?.title,
      address,
      neighborhood: district,
      categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (kind === "hotel" || destinationKind === "hotel") {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: panelTypeLabel,
      displayTitle: panelTitle,
      displaySubtitle: panelSubtitle || (address ? `${district} · ${address}` : district),
      displayContext: panelContext,
      address,
      neighborhood: district,
      categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (destinationKind === "wellness") {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: panelTypeLabel,
      displayTitle: panelTitle,
      displaySubtitle: panelSubtitle,
      displayContext: panelContext,
      address,
      neighborhood: district,
      categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (destinationKind === "civic" || isCivicEntity(place)) {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: panelTypeLabel,
      displayTitle: panelTitle,
      displaySubtitle: panelSubtitle || address || district,
      displayContext: panelContext,
      address,
      neighborhood: district,
      categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  return {
    id: place?.id,
    entityType: panelArchetype.id,
    displayTypeLabel: panelTypeLabel,
    displayTitle: panelTitle,
    displaySubtitle: panelSubtitle,
    displayContext: panelContext,
    address,
    neighborhood: district,
    categoryLabel: panelContent.eyebrow || panelArchetype.eyebrow,
    panelArchetype,
  };
}

function getCanonicalCategoryLabel(place) {
  const kind = getDestinationKind(place);
  if (isRentalEntity(place)) return "Rental";
  if (getLuxuryPresenceBuilding(place)) return "Residential";
  if (getResolvedLegendsListing(place)) return "Property";
  if (isAntonesEntity(place)) return "Venue";
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

function normalizeMapPinKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\b(downtown perks|austin|texas|tx|united states|usa)\b/g, " ")
    .replace(/\b(street)\b/g, "st")
    .replace(/\b(avenue)\b/g, "ave")
    .replace(/\b(boulevard)\b/g, "blvd")
    .replace(/\b(road)\b/g, "rd")
    .replace(/\b(suite)\b/g, "ste")
    .replace(/\b(apartment)\b/g, "apt")
    .replace(/\s+#\s*/g, " unit ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMapPinTitleKey(place) {
  return normalizeMapPinKey(place?.name || place?.raw?.name || place?.title || place?.raw?.title || "");
}

function getMapPinAddressKey(place) {
  const listing = getLegendsListing(place);
  return normalizeMapPinKey(
    listing?.address ||
      place?.address ||
      place?.raw?.address ||
      place?.raw?.formatted_address ||
      place?.raw?.location ||
      "",
  );
}

function getMapPinCoordinateKey(place, precision = 4) {
  const coords = getPlaceCoords(place);
  if (!coords) return "";
  return `${Number(coords[0]).toFixed(precision)},${Number(coords[1]).toFixed(precision)}`;
}

function getMapPinCanonicalKeys(place) {
  const id = String(place?.id || "").trim();
  if (id.startsWith("daa-stop-")) return [`id:${id}`];
  const title = getMapPinTitleKey(place);
  const address = getMapPinAddressKey(place);
  const coord = getMapPinCoordinateKey(place, 4);
  const listing = getLegendsListing(place);
  const mls = normalizeMapPinKey(listing?.mlsNumber || listing?.mls_number || place?.raw?.mls_number || place?.raw?.mlsNumber || "");
  const keys = [];

  if (id) keys.push(`id:${id}`);
  if (mls) keys.push(`mls:${mls}`);
  if (title && address) keys.push(`title-address:${title}|${address}`);
  if (title && coord) keys.push(`title-coord:${title}|${coord}`);

  return keys;
}

function getMapPinRecordScore(place) {
  const source = String(place?.source || place?.raw?.source || "").toLowerCase();
  const title = getMapPinTitleKey(place);
  const address = getMapPinAddressKey(place);
  const image = resolveMapImage(place);
  let score = 0;

  if (getLegendsListing(place) || getLuxuryPresenceBuilding(place)) score += 350;
  if (String(place?.id || "").startsWith("daa-stop-")) score += 260;
  if (hasActivePerkData(place)) score += 300;
  if (isInKindEntity(place)) score += 240;
  if (isHappyHourEntity(place)) score += 220;
  if (isParkingEntity(place)) score += 180;
  if (source.includes("supplemental") || source.includes("partner")) score += 160;
  if (source.includes("production") || source.includes("content deck")) score += 120;
  if (source.includes("republic austin")) score += 90;
  if (source.includes("openstreetmap")) score -= 80;
  if (title) score += 20;
  if (address) score += 20;
  if (image && !String(image).includes("default-map-hero")) score += 20;
  if (place?.summary || place?.description || place?.raw?.summary) score += 14;
  if (place?.website || place?.raw?.website) score += 8;

  return score;
}

function dedupeMapPinPlaces(places) {
  const chosen = [];
  const keyToIndex = new Map();

  places.forEach((place) => {
    if (!place?.id || !getPlaceCoords(place)) return;

    const keys = getMapPinCanonicalKeys(place);
    const duplicateIndexes = Array.from(
      new Set(keys.map((key) => keyToIndex.get(key)).filter((index) => Number.isInteger(index))),
    );

    if (!duplicateIndexes.length) {
      const nextIndex = chosen.length;
      chosen.push(place);
      keys.forEach((key) => keyToIndex.set(key, nextIndex));
      return;
    }

    const existingIndex = duplicateIndexes[0];
    const existing = chosen[existingIndex];
    const keepNew = getMapPinRecordScore(place) > getMapPinRecordScore(existing);
    const winner = keepNew ? place : existing;
    chosen[existingIndex] = winner;

    getMapPinCanonicalKeys(existing).forEach((key) => keyToIndex.delete(key));
    getMapPinCanonicalKeys(winner).forEach((key) => keyToIndex.set(key, existingIndex));
  });

  return chosen;
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

function escapeJsString(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function getZoomScaledMarkerSize(zoom, baseSize) {
  const numericZoom = Number(zoom) || 0;
  if (numericZoom >= 22) return Math.round(baseSize * 1.55);
  if (numericZoom >= 21) return Math.round(baseSize * 1.45);
  if (numericZoom >= 20) return Math.round(baseSize * 1.36);
  if (numericZoom >= 19) return Math.round(baseSize * 1.25);
  if (numericZoom >= 18) return Math.round(baseSize * 1.15);
  if (numericZoom >= 17) return Math.round(baseSize * 1.08);
  if (numericZoom >= 16) return Math.round(baseSize * 1);
  return baseSize;
}

function getZoomMarkerMetrics(zoom, { selected = false, clusterCount = 0 } = {}) {
  const pinSize = getZoomScaledMarkerSize(zoom, selected ? 32 : 28);
  const clusterBase = clusterCount > 49 ? 42 : clusterCount > 9 ? 36 : 30;
  const clusterSize = getZoomScaledMarkerSize(zoom, clusterBase);
  return {
    pinSize,
    pinIconSize: Math.max(13, Math.round(pinSize * 0.48)),
    legendsLogoSize: Math.max(17, Math.round(pinSize * 0.66)),
    stopNumberSize: Math.max(14, Math.round(pinSize * 0.43)),
    clusterSize,
    largeClusterSize: getZoomScaledMarkerSize(zoom, 46),
  };
}

function zoomMarkerStyleAttribute(zoom, options = {}) {
  const metrics = getZoomMarkerMetrics(zoom, options);
  return [
    `--dp-zoom-pin-size:${metrics.pinSize}px`,
    `--dp-zoom-pin-icon-size:${metrics.pinIconSize}px`,
    `--dp-zoom-legends-logo-size:${metrics.legendsLogoSize}px`,
    `--dp-zoom-stop-number-size:${metrics.stopNumberSize}px`,
    `--dp-zoom-cluster-size:${metrics.clusterSize}px`,
    `--dp-zoom-large-cluster-size:${metrics.largeClusterSize}px`,
  ].join(";");
}

function applyZoomMarkerStyle(element, zoom, options = {}) {
  if (!element) return;
  const metrics = getZoomMarkerMetrics(zoom, options);
  element.style.setProperty("--dp-zoom-pin-size", `${metrics.pinSize}px`);
  element.style.setProperty("--dp-zoom-pin-icon-size", `${metrics.pinIconSize}px`);
  element.style.setProperty("--dp-zoom-legends-logo-size", `${metrics.legendsLogoSize}px`);
  element.style.setProperty("--dp-zoom-stop-number-size", `${metrics.stopNumberSize}px`);
  element.style.setProperty("--dp-zoom-cluster-size", `${metrics.clusterSize}px`);
  element.style.setProperty("--dp-zoom-large-cluster-size", `${metrics.largeClusterSize}px`);
}

function mapPinButtonHtml({ place, pin, ariaLabel, selected, pulsing, classes, zoom = INITIAL_MAP_ZOOM }) {
  const escapedId = escapeHtmlAttribute(place.id);
  const escapedLabel = escapeHtmlAttribute(ariaLabel);
  const pinLabel = escapeHtmlAttribute(pin.label);
  const iconKey = normalizeMapIconKey(pin.label);
  const kind = escapeHtmlAttribute(iconKey);
  const activeClass = selected ? "is-selected is-active" : "";
  const pulseClass = pulsing ? "is-pulsing" : "";
  const rental = place?.raw?.rentalListing || place?.rentalListing || {};
  const rentalPriceLabel = place?.priceLabel || place?.raw?.priceLabel || rental.priceLabel;
  const priceLabel = isRentalEntity(place) && rentalPriceLabel ? `<span class="dp-live-pin__price">${escapeHtmlAttribute(rentalPriceLabel)}</span>` : "";
  const isLegendsPin = isLegendsMapPlace(place) || Boolean(getLegendsListing(place) || getLegendsResidentialProfileForPlace(place));
  const iconSvg = isLegendsPin
    ? `<img class="dp-pin-logo dp-live-pin__legends-logo" src="${LEGENDS_PIN_LOGO}" alt="" aria-hidden="true" loading="eager" decoding="async" />`
    : pin.glyph;

  const zoomStyle = zoomMarkerStyleAttribute(zoom, { selected });
  const buttonHtml = `<button type="button" class="dp-map-pin dp-map-pin--${kind} ${classes} ${activeClass} ${pulseClass}" style="${zoomStyle}" data-entity-id="${escapedId}" data-kind="${kind}" data-pin-label="${pinLabel}" aria-label="${escapedLabel}" data-active="${selected ? "true" : "false"}"><span class="dp-map-pin__icon" aria-hidden="true">${iconSvg}</span>${priceLabel}</button>`;
  const stopNumber = Number(place?.routeStopNumber || 0);
  if (!stopNumber) return buttonHtml;
  return `<div class="dp-collection-stop ${selected ? "is-current" : ""}" style="${zoomStyle}" data-collection-stop="${stopNumber}">${buttonHtml}<span class="dp-collection-stop__number">${stopNumber}</span></div>`;
}

function getMarkerDataKind(place) {
  if (isCampaignEntity(place)) return "campaign";
  if (isRentalEntity(place)) return "rental";
  if (isInKindEntity(place)) return "inkind";
  if (isListingEntity(place)) return "listing";
  if (isPropertyEntity(place)) return "property";
  if (isCivicEntity(place)) return "civic";
  if (isEventEntity(place)) return "event";
  if (isHotelEntity(place)) return "hotel";
  if (isBrandEntity(place)) return "brand";
  if (isVenueEntity(place)) return "venue";
  return String(place?.type || "place").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const LEGENDS_MARKER_FALLBACK_PATH = '<path fill="currentColor" stroke="none" d="M12 12.8c-.6-1.5-1.7-3.8-3.4-5.4C6.9 5.8 4.5 4.7 2.9 5.9 1.2 7.2 2 10.5 4 12.5c1.7 1.7 4.5 2.2 6.4 1.8-.4 1.6-1.4 3.1-2.9 4.5l1.3 1.3c1.5-1.4 2.5-2.9 3.1-4.5.6 1.6 1.6 3.1 3.1 4.5l1.3-1.3c-1.5-1.4-2.5-2.9-2.9-4.5 1.9.4 4.7-.1 6.4-1.8 2-2 2.8-5.3 1.1-6.6-1.6-1.2-4-.1-5.7 1.5-1.6 1.6-2.7 3.9-3.2 5.4z"/>';

function mapIconSvgInner(glyph) {
  return String(glyph || "").match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1] || "";
}

const DOWNTOWN_PERKS_GOOGLE_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.55 }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.8 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#C8A96A" }, { weight: 0.55 }, { visibility: "simplified" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.55 }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.68 }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 2 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#FAFBFA" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#F3F5F3" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#0B3E31" }, { weight: 0.48 }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.8 }] },
  { featureType: "poi.attraction", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#DCE8DF" }, { saturation: -10 }, { lightness: 4 }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#0B3E31" }, { weight: 0.55 }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.9 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E4D8BD" }, { weight: 0.5 }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#54625B" }, { weight: 0.45 }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.7 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#EFE7D6" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#C8A96A" }, { weight: 0.85 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#F7F8F7" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#D6D2C8" }, { saturation: -60 }, { lightness: 18 }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#0B3E31" }] },
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#E6EEF4" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }] },
];

function getInlineGoogleMapStyles() {
  return DOWNTOWN_PERKS_GOOGLE_MAP_STYLES.map((style) => ({
    ...style,
    stylers: (style.stylers || []).filter((styler) => !Object.prototype.hasOwnProperty.call(styler, "weight")),
  })).filter((style) => style.stylers.length);
}

function svgMarkerDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function legacyDowntownMarkerIcon(maps, place, selected = false, zoom = 16) {
  const isLegends = isLegendsMapPlace(place) || getLegendsListing(place);
  const size = getZoomMarkerMetrics(zoom, { selected }).pinSize;
  const stopNumber = Number(place?.routeStopNumber || 0);
  const fill = isLegends ? "#FFFFFF" : "#0B1F33";
  const stroke = "#C8A96A";
  const iconColor = isLegends ? "#0B1F33" : "#C8A96A";
  const pin = resolveEntityPin(place);
  const paths = isLegends ? LEGENDS_MARKER_FALLBACK_PATH : mapIconSvgInner(pin.glyph);
  const iconSize = Math.max(18, Math.round(size * 0.5));
  const iconScale = Math.max(0.75, size / 48);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="${fill}" stroke="${stroke}" stroke-width="${isLegends ? "2.4" : "1.8"}"/>
      ${isLegends ? "" : `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 7}" fill="none" stroke="#FFFFFF" stroke-opacity="0.26" stroke-width="1"/>`}
      ${isLegends ? "" : `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1.4}" fill="none" stroke="#0B3E31" stroke-opacity="0.2" stroke-width="1"/>`}
      ${selected ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 0.8}" fill="none" stroke="#C8A96A" stroke-opacity="0.42" stroke-width="1.2"/>` : ""}
      <g transform="translate(${size / 2 - iconSize / 2} ${size / 2 - iconSize / 2}) scale(${iconScale})" color="${iconColor}" fill="none" stroke="${iconColor}" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
      ${stopNumber ? `<circle cx="${size - 7}" cy="7" r="6" fill="#FFFFFF" stroke="#0B1F33" stroke-width="1.2"/><text x="${size - 7}" y="7.6" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="800" fill="#0B1F33">${Math.min(stopNumber, 9)}</text>` : ""}
    </svg>`;
  return {
    url: svgMarkerDataUrl(svg),
    scaledSize: new maps.Size(size, size),
    anchor: new maps.Point(size / 2, size / 2),
  };
}

function legacyDowntownClusterIcon(maps, count, zoom = 16) {
  const safeCount = Math.min(Number(count) || 0, 99);
  const baseSize = safeCount > 49 ? 42 : safeCount > 9 ? 36 : 30;
  const size = getZoomScaledMarkerSize(zoom, baseSize);
  const label = safeCount > 99 ? "99+" : String(safeCount);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="#0B1F33" stroke="#C8A96A" stroke-width="1.8"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 7}" fill="none" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="1"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1.4}" fill="none" stroke="#0B3E31" stroke-opacity="0.22" stroke-width="1"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${size * 0.36}" font-weight="600" fill="#C8A96A">${label}</text>
    </svg>`;
  return {
    url: svgMarkerDataUrl(svg),
    scaledSize: new maps.Size(size, size),
    anchor: new maps.Point(size / 2, size / 2),
  };
}

function getCollectionRouteStyle(collectionRoute) {
  const category = String(collectionRoute?.category || "").toLowerCase();
  const theme = String(collectionRoute?.colorTheme || "gold").toLowerCase();
  const isDashed = ["civic", "event"].includes(category);
  const mainColor = theme === "emerald" ? "#0B3E31" : theme === "navy" ? "#0B1F33" : "#C8A96A";
  const dotColor = theme === "navy" ? "#C8A96A" : theme === "emerald" ? "#FFFFFF" : "#0B1F33";
  return {
    mainColor,
    dotColor,
    ambientColor: "#0B3E31",
    overlapColor: "#FFFFFF",
    isDashed,
    mainOpacity: theme === "emerald" ? 0.92 : 0.95,
    ambientOpacity: theme === "navy" ? 0.18 : 0.22,
    overlapOpacity: 0.86,
  };
}

function getZoomRouteMetrics(zoom) {
  const scale = Math.max(1, getZoomScaledMarkerSize(zoom, 100) / 100);
  return {
    strokeWeight: Math.round((4 * scale) * 10) / 10,
    ambientStrokeWeight: Math.round((8 * scale) * 10) / 10,
    overlapStrokeWeight: Math.round((5 * scale) * 10) / 10,
    dotScale: Math.round((2.1 * scale) * 10) / 10,
    dashedDotScale: Math.round((2.4 * scale) * 10) / 10,
    repeat: zoom >= 18 ? "34px" : zoom >= 17 ? "38px" : "42px",
    dashedRepeat: zoom >= 18 ? "24px" : zoom >= 17 ? "27px" : "30px",
  };
}

function pinIcon(place, selected, pulsing = false, zoom = INITIAL_MAP_ZOOM) {
  const pin = resolveEntityPin(place);
  const isEventPin = isEventEntity(place);
  const isHappyHourPin = isHappyHourEntity(place);
  const isCampaignPin = isCampaignEntity(place);
  const legendsListing = getLegendsListing(place);
  const isLegendsPin =
    isLegendsMapPlace(place) ||
    Boolean(legendsListing) ||
    isRentalEntity(place) ||
    String(place?.pinKey || "").toLowerCase() === "legends" ||
    String(pin?.label || "").toLowerCase() === "legends";
  const eventPinClass = isEventPin ? "dp-live-pin--event" : "";
  const happyHourPinClass = isHappyHourPin ? "dp-live-pin--happy-hour" : "";
  const campaignPinClass = isCampaignPin ? "dp-live-pin--campaign" : "";
  const legendsPinClass = isLegendsPin ? "dp-live-pin--legends dp-live-pin--legends-logo" : "";
  const rentalPinClass = isRentalEntity(place) ? "dp-live-pin--rental" : "";
  const shouldPulse = false;
  const pinSize = getZoomMarkerMetrics(zoom, { selected }).pinSize;
  const iconSize = [pinSize, pinSize];
  const iconAnchor = [pinSize / 2, pinSize / 2];
  const ariaLabel = legendsListing ? `Legends listing at ${legendsListing.address}` : `${place.name} details`;
  return L.divIcon({
    className: "dp-leaflet-pin",
    html: mapPinButtonHtml({
      place,
      pin,
      ariaLabel,
      selected,
      pulsing: shouldPulse,
      classes: `${eventPinClass} ${happyHourPinClass} ${campaignPinClass} ${legendsPinClass} ${rentalPinClass}`,
      zoom,
    }),
    iconSize,
    iconAnchor,
    popupAnchor: [0, -12],
  });
}

function clusterIcon(count, zoom = INITIAL_MAP_ZOOM) {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 2;
  const size = getZoomMarkerMetrics(zoom, { clusterCount: safeCount }).clusterSize;
  return L.divIcon({
    className: "dp-leaflet-cluster",
    html: `<div class="dp-map-cluster" style="${zoomMarkerStyleAttribute(zoom, { clusterCount: safeCount })}" aria-hidden="true"><span>${safeCount > 99 ? "99+" : safeCount}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getClusterCellSize(zoom) {
  if (zoom >= 17.5) return 0;
  if (zoom >= 16.5) return 0;
  if (zoom >= 16) return 0.0012;
  if (zoom >= 15) return 0.003;
  if (zoom >= 14) return 0.0055;
  return 0.01;
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

  return "Places nearby";
}

function getClusterSubtitle(cluster, mode) {
  if (cluster?.groupType === "building") {
    return `${cluster.places?.length || 0} units available here`;
  }

  return `${cluster.places?.length || 0} places nearby`;
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

function DemoQrTile({ code = "DP-RES-78701" }) {
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
      src={getQrImageUrl(code)}
      alt={`Downtown Perks resident QR code for ${code}`}
      className={`${className} block bg-white object-contain [image-rendering:crisp-edges]`}
      loading="eager"
      decoding="async"
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(PERKS_CARD_QR_SRC)) {
          event.currentTarget.src = PERKS_CARD_QR_SRC;
        }
      }}
    />
  );
}

function ResidentPerkRedemptionSheet({ data, onClose, onBack }) {
  if (!data) return null;

  const placeName = getEntityTouchpointName(data.place);
  const isPerkRedemption = data.action === "use_perk";
  const redemptionStatus = data.redemptionStatus || data.status || (isPerkRedemption ? "ready" : "presented");
  const actionLabel = isPerkRedemption ? "Ready to scan" : "Resident card";
  const title = data.perkTitle || (data.action === "use_perk" ? `${placeName} resident perk` : "Downtown Perks Card");
  const value = data.perkValue && data.perkValue !== title ? data.perkValue : "";
  const description = isPerkRedemption
    ? "Partner scans this code to apply the perk."
    : data.perkDescription || `Show this code when a participating partner asks to confirm resident access for ${placeName}.`;
  const terms = data.perkTerms || "";
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  const validityLabel = redemptionStatus === "redeemed"
    ? "Redeemed"
    : redemptionStatus === "expired"
      ? "Expired"
      : redemptionStatus === "unavailable"
        ? "Currently unavailable"
        : "Ready to scan";

  return (
    <AnimatePresence>
      <motion.div
        className="dp-resident-qr-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.section
          className="dp-resident-qr-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resident-qr-title"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" className="dp-resident-qr-back" onClick={onBack || onClose} aria-label="Back to map">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" className="dp-resident-qr-close" onClick={onClose} aria-label="Close resident QR code">
            <X className="h-4 w-4" />
          </button>
          <p className="dp-resident-qr-eyebrow">{isPerkRedemption ? "RESIDENT PERK" : "VERIFIED RESIDENT"}</p>
          <h2 id="resident-qr-title">{title}</h2>
          {value && <p className="dp-resident-qr-value">{value}</p>}
          <p className={`dp-resident-qr-status is-${redemptionStatus}`}>{validityLabel}</p>
          <p className="dp-resident-qr-copy">{description}</p>
          {terms && <p className="dp-resident-qr-terms">{terms}</p>}
          <div className="dp-resident-qr-frame">
            <DemoQrCode code={data.qrValue} className="dp-resident-qr-image" />
          </div>
          <div className="dp-resident-qr-meta">
            <span>{actionLabel}</span>
            <strong>{placeName}</strong>
            <code>{data.uid}</code>
            {expiresAt && redemptionStatus === "ready" && <small>Valid until {expiresAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>}
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
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

function isPerkMechanicsCopy(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return false;
  return /^(show|save|use|open|claim|redeem|check|ask|present)\b/.test(text)
    || /\b(show your|show the|resident pass|downtown perks card|save it|use it|ask for it|when active|before visiting|confirm availability)\b/.test(text);
}

function getPerkOutlineCopy(place, perk = {}) {
  const name = place?.name || place?.title || "This partner";
  const title = cleanDisplayCopy(perk.offer || perk.title);
  const value = cleanDisplayCopy(perk.value);
  const description = cleanDisplayCopy(perk.description);

  if (description && !isPerkMechanicsCopy(description)) return description;
  if (value && title && value.toLowerCase() !== title.toLowerCase()) {
    return `${title.replace(/[.!?]+$/g, "")}: ${value.replace(/[.!?]+$/g, "")}.`;
  }
  if (title) return `${name} offers ${title.replace(/[.!?]+$/g, "").toLowerCase()}.`;
  if (value) return `${name} offers ${value.replace(/[.!?]+$/g, "").toLowerCase()}.`;
  return `${name} has an active resident perk available through Downtown Perks.`;
}

function getCanonicalResidentOffer(place) {
  if (!place) return null;
  const text = placeText(place);
  const name = String(place.name || place.title || place.raw?.name || place.raw?.title || "").toLowerCase();
  const id = String(place.id || place.raw?.id || "").toLowerCase();
  return RESIDENT_OFFER_RECORDS.find((record) => (Array.isArray(record.aliases) ? record.aliases : []).some((alias) => {
    const normalized = String(alias || "").toLowerCase();
    return Boolean(normalized && (name.includes(normalized) || id.includes(normalized.replace(/\s+/g, "-")) || text.includes(normalized)));
  })) || null;
}

function hasActivePerkData(place) {
  const raw = place?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  if (!place) return false;
  if (isFrostTowerEntity(place)) return false;
  if (getCanonicalResidentOffer(place)) return true;
  if (cleanPerkValue(embeddedPerk?.title || raw.deals_offers || place?.deals_offers || raw.offer || place?.offer || raw.specials || place?.specials)) {
    return true;
  }
  const categorySignal = normalizeMapPinKey([
    place.category_key,
    raw.category_key,
    place.category,
    raw.category,
    place.partnerType,
    raw.partnerType,
    raw.mapLayer,
    raw.resolvedMapLayer,
    place.source,
    raw.source,
  ]
    .filter(Boolean)
    .join(" "));
  if (
    categorySignal.includes("perk") ||
    categorySignal.includes("inkind") ||
    categorySignal.includes("in kind") ||
    categorySignal.includes("happy hour")
  ) {
    return true;
  }
  return Boolean(isInKindPartner(place) || isHappyHourEntity(place) || isParkingEntity(place));
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
  const canonicalOffer = getCanonicalResidentOffer(place);
  if (luxuryBuilding) {
    const listings = luxuryBuilding.listings || place?.listings || [];
    const panelContent = luxuryBuilding.panelContent || place?.panelContent || {};
    const buildingName = cleanDisplayCopy(place?.name || place?.title || luxuryBuilding.name || "This building");
    const activeText = listings.length === 1 ? "1 active listing" : `${listings.length} active listings`;
    const listingFacts = listings
      .slice(0, 4)
      .map((listing) => [listing.price, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "", listing.mls_number ? `MLS ${listing.mls_number}` : ""].filter(Boolean).join(" · "))
      .join(" • ");

    return {
      offer: `${buildingName} Resident Access`,
      value: place?.listingSummary || `${activeText}${place?.priceRange ? ` from ${place.priceRange}` : ""}`,
      description: panelContent.body || `${buildingName} has ${activeText}. Downtown Perks residents can review real listing details, compare nearby perks and places, and contact Legends Real Estate for showing options.`,
      terms: listingFacts || "Contact Legends Real Estate for availability, showing options, MLS details, and similar downtown properties.",
      validUntil: "",
      source: "",
      isActive: true,
      category: "Residential Property",
    };
  }
  if (legendsListing) {
    const listingName = cleanDisplayCopy(place?.name || legendsListing.buildingName || legendsListing.address || "This downtown home");
    const detailText = [
      legendsListing.priceDisplay,
      legendsListing.beds ? `${legendsListing.beds} bd` : "",
      legendsListing.baths ? `${legendsListing.baths} ba` : "",
      legendsListing.sqftDisplay,
    ].filter(Boolean).join(" · ");

    return {
      offer: `${listingName} Resident Listing Access`,
      value: detailText || "Resident listing access",
      description: legendsListing.interestCopy || `${listingName} is available through Legends Real Estate. Downtown Perks residents can contact Legends to discover availability, showing options, and property opportunities that may not always be easy to find on other listing sites.`,
      terms: legendsListing.listingFacts || "Use the contact form to ask about availability, showing times, private tour options, and similar downtown properties.",
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
  const offer = listedOffer || canonicalOffer?.title || fallbackOffer.title;
  const value = cleanPerkValue(embeddedPerk?.value || listedOffer) || canonicalOffer?.value || fallbackOffer.value || "Resident Pass access";
  const rawDescription = inKindPartner
    ? cleanDisplayCopy(embeddedPerk?.description) ||
      cleanDisplayCopy(raw.alignment_to_downtown_perks) ||
      `${place?.name || "This inKind partner"} offers resident dining value through inKind, giving residents a benefit to compare against nearby dinner or drinks.`
    : listedOffer
    ? cleanDisplayCopy(embeddedPerk?.description) ||
      cleanDisplayCopy(raw.alignment_to_downtown_perks) ||
      getPerkOutlineCopy(place, { offer, value })
    : canonicalOffer?.description || fallbackOffer.description;
  const description = isPerkMechanicsCopy(rawDescription)
    ? getPerkOutlineCopy(place, { offer, value, description: "" })
    : rawDescription;
  const terms = inKindPartner
    ? cleanDisplayCopy(raw.terms || raw.perk_terms) || "Save it to your Resident Pass, open it when you are nearby, and redeem when the inKind offer is active."
    : cleanDisplayCopy(raw.terms || raw.perk_terms) || canonicalOffer?.terms || fallbackOffer.terms;
  const validUntil = embeddedPerk?.expiresAt || raw.valid_until || raw.expires || "";
  const source = canonicalOffer?.source || "";
  const isActive = embeddedPerk?.isActive !== false;
  const category = canonicalOffer?.category || String(raw.category || place?.category || "Downtown place");

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

function getExplicitGroupedOffer(place) {
  const raw = place?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  return cleanPerkValue(
    embeddedPerk?.title ||
    embeddedPerk?.offer ||
    place?.perk?.offer ||
    raw.deals_offers ||
    place?.deals_offers ||
    place?.recommended_perk ||
    raw.offer ||
    place?.offer
  ) || getCanonicalResidentOffer(place)?.title || "";
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
  const canonicalOffer = getCanonicalResidentOffer(place);
  if (canonicalOffer) return canonicalOffer;
  const text = placeText(place);
  const district = place?.district || "Downtown Austin";
  const name = place?.name || "this place";
  const legendsListing = getLegendsListing(place);

  if (isCampaignEntity(place)) {
    const reward = place?.rewardLabel || place?.reward || place?.raw?.rewardLabel || place?.raw?.reward;
    const campaignType = place?.campaignType || place?.raw?.campaignType;
    return {
      title: reward || "Campaign reward",
      value: campaignType ? `${String(campaignType).replace(/-/g, " ")} campaign` : "Downtown Perks campaign",
      description: place?.description || `${name} brings together pins, routes, rewards, and resident activity in one downtown campaign.`,
      terms: "Start the campaign from the map, follow participating pins, and track progress through Downtown Perks.",
    };
  }

  if (isFrostTowerEntity(place)) {
    return {
      title: "Downtown Partner",
      value: "Premium workplace and district activation hub",
      description: "Frost Tower is an iconic commercial workplace on Congress Avenue. Downtown Perks helps residents, employees, visitors, and nearby businesses discover services, dining, events, wellness, and everyday downtown experiences around the tower.",
      terms: "Use the map to explore the district, save nearby pins, get directions, or ask for partner information.",
    };
  }

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
      title: legendsListing ? `${name} Listing Access` : `${name} Resident Access`,
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
      description: `${name} offers resident dining value through inKind, giving residents a credit-style benefit or restaurant-backed dining offer around ${district}.`,
      terms: "Save it to your Downtown Access and redeem when the inKind offer is active.",
    };
  }

  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) {
    return {
      title: "Free Size Upgrade",
      value: "Resident coffee upgrade",
      description: `${name} offers a resident coffee upgrade, turning a nearby coffee stop into extra value for mornings, meetings, or a short walk through ${district}.`,
      terms: "Use it during morning service or meeting runs when the coffee upgrade is active.",
    };
  }

  if (text.includes("pizza")) {
    return {
      title: "Resident Pizza Offer",
      value: "Easy dinner option",
      description: `${name} offers a resident pizza benefit for quick dinners, group plans, or late decisions near ${district}.`,
      terms: "Open it before ordering so the resident dinner benefit is ready at checkout.",
    };
  }

  if (text.includes("grocery") || text.includes("market") || text.includes("pantry")) {
    return {
      title: "Grocery Discount",
      value: "Resident shopping value",
      description: `${name} offers resident grocery value for coffee, snacks, pantry basics, wine, and quick downtown errands around ${district}.`,
      terms: "Save the offer and use it when a resident discount is active.",
    };
  }

  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("pub")) {
    return {
      title: "Resident Cocktail Pricing",
      value: "Easy after-hours option",
      description: `${name} offers resident cocktail pricing for drinks, music, or an after-dinner plan around ${district}.`,
      terms: "Use it during the listed after-hours window and show the resident pass when prompted.",
    };
  }

  if (text.includes("restaurant") || text.includes("dining") || text.includes("food") || text.includes("kitchen")) {
    return {
      title: "Complimentary Dessert",
      value: "Walkable dining option",
      description: `${name} offers a complimentary dessert-style dining benefit so residents have a clear walkable dinner reason in ${district}.`,
      terms: "Open it before dinner so the dining team can confirm the resident dessert benefit.",
    };
  }

  if (text.includes("hotel") || text.includes("hospitality")) {
    return {
      title: "Preferred Resident Dining Access",
      value: "Local access context",
      description: `${name} offers preferred resident dining or hospitality access for lounges, guest plans, and local hotel experiences near ${district}.`,
      terms: "Save it and check what resident access is available.",
    };
  }

  if (text.includes("event") || text.includes("music")) {
    return {
      title: "Priority Event Access",
      value: "Save or RSVP",
      description: `${name} offers priority event access or resident RSVP value for plans around ${district}.`,
      terms: "RSVP or save it when a resident offer is available. Timing may vary.",
    };
  }

  if (text.includes("retail") || text.includes("store") || text.includes("eyewear") || text.includes("shop")) {
    return {
      title: "Exclusive In-Store Offer",
      value: "Retail access nearby",
      description: `${name} offers an exclusive in-store resident benefit for nearby shopping, fittings, appointments, or retail stops around ${district}.`,
      terms: "Open it before visiting so staff can confirm the fitting, styling, or in-store benefit.",
    };
  }

  return {
    title: "Resident Perk",
    value: "Save it or go now",
    description: `${name} has a resident perk available through Downtown Perks, giving residents a benefit to compare, save, and use near ${district}.`,
    terms: "Save it, get directions, or ask for the resident offer when available.",
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
          { label: "Useful for", value: panel.bestFor || "Appointments, service, errands", emphasis: true },
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

function ResidentPerkDetails({ place, savedIds, onSave, onUse }) {
  const perk = getResidentPerkDetails(place);
  const entityKind = getResidentEntityKind(place);
  const isProperty = entityKind === "property";
  const sectionLabel = isProperty ? "Property access" : "Resident perk";
  const isSaved = savedIds?.has?.(place?.id);
  const useText = isProperty ? "Listings, tours, and neighborhood context." : getPerkOutlineCopy(place, perk);
  const termsText = String(perk.terms || "").trim();
  const perkTitle = isProperty ? "Want to live here?" : formatResidentPerkHeading(perk.offer);
  const perkValue = String(perk.value || "").trim();
  const normalizedPerkTitle = perkTitle.toLowerCase();
  const normalizedPerkValue = perkValue.toLowerCase();
  const isGenericPerkTitle = /^(resident perk|resident offer|perk)$/i.test(perkTitle.trim());
  const displayPerkTitle = isGenericPerkTitle && perkValue ? perkValue : perkTitle;
  const normalizedUseText = String(useText || "").trim().toLowerCase();
  const shouldShowValue = perkValue && normalizedPerkValue !== String(displayPerkTitle || "").trim().toLowerCase();
  const shouldShowUseText = normalizedUseText && normalizedUseText !== String(displayPerkTitle || "").trim().toLowerCase() && normalizedUseText !== normalizedPerkValue;
  const shouldShowTerms = termsText
    && termsText.toLowerCase() !== normalizedUseText
    && termsText.toLowerCase() !== normalizedPerkValue
    && termsText.toLowerCase() !== String(displayPerkTitle || "").trim().toLowerCase();

  return (
    <section className="dp-destination-section dp-perk-module">
      <div className="dp-perk-module-copy text-left">
        <div className="dp-perk-module-meta">
          <Gift className="h-3.5 w-3.5 text-[#C8A96A]" />
          {sectionLabel}
        </div>
        <h3 className="dp-perk-module-title">
          {displayPerkTitle}
        </h3>
        {shouldShowValue && (
          <p className="dp-perk-module-value">
            {perkValue}
          </p>
        )}
        {shouldShowUseText && (
          <p className="dp-perk-module-description">
            {useText}
          </p>
        )}
        {shouldShowTerms && (
          <p className="dp-perk-module-terms">
            {termsText}
          </p>
        )}
        {!isProperty && (
          <div className="dp-perk-action-row" aria-label={`${place.name} perk actions`}>
            <button type="button" onClick={onUse || onSave} className="dp-perk-cta is-primary">
              Use
            </button>
            <button type="button" onClick={onSave} className="dp-perk-cta is-secondary">
              {isSaved ? "Saved" : "Save"}
            </button>
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-perk-cta is-tertiary">
              Directions
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function isBatheEntity(place) {
  return String(place?.id || place?.raw?.id || "").toLowerCase() === "bathe-austin"
    || String(place?.name || "").toLowerCase() === "bathe";
}

function BatheWellnessDetails({ place, mode = "resident" }) {
  if (!isBatheEntity(place)) return null;
  const raw = place?.raw || {};
  const pricing = place.pricing || raw.pricing || [];
  const membership = place.membership || raw.membership;
  const quickFacts = place.residentQuickFacts || raw.residentQuickFacts || raw.resident_quick_facts || [];
  const opportunity = place.opportunityScore || raw.opportunityScore;
  return (
    <DestinationSection title={mode === "partner" ? "Wellness opportunity" : "BATHE experience"} className="dp-bathe-detail-section">
      <p className="dp-bathe-subhead">Heat. Cold. Water. Stillness.</p>
      <p>
        Whether you want recovery, mental clarity, or a quiet place to reset, BATHE brings sauna, cold plunge, soaking pools, massage, sound immersion, and coworking into one wellness routine.
      </p>
      {quickFacts.length > 0 && (
        <div className="dp-bathe-inline-list" aria-label="BATHE quick facts">
          {quickFacts.map((fact) => <span key={fact}>{fact}</span>)}
        </div>
      )}
      {pricing.length > 0 && (
        <div className="dp-bathe-row-list" aria-label="BATHE pricing">
          {pricing.map((item) => (
            <div key={item.title} className="dp-bathe-row">
              <span>
                <strong>{item.title}</strong>
                <small>{Array.isArray(item.details) ? item.details.join(" · ") : item.details}</small>
              </span>
              <em>{item.price}</em>
            </div>
          ))}
        </div>
      )}
      {membership && (
        <div className="dp-bathe-row">
          <span>
            <strong>{membership.title}</strong>
            <small>{Array.isArray(membership.details) ? membership.details.join(" · ") : membership.details}</small>
          </span>
          <em>{membership.price}</em>
        </div>
      )}
      {mode === "partner" && opportunity && (
        <p className="dp-bathe-partner-note">
          Demand is {opportunity.demand?.toLowerCase?.() || "high"}, resident interest is {opportunity.residentInterest?.toLowerCase?.() || "high"}, and repeat visit potential is {opportunity.repeatVisitPotential?.toLowerCase?.() || "very high"}.
        </p>
      )}
    </DestinationSection>
  );
}

function getInKindNearbyDining(place, places = []) {
  const coords = getPlaceCoords(place);
  return places
    .filter((candidate) => candidate?.id && candidate.id !== place?.id && isInKindEntity(candidate))
    .map((candidate) => {
      const candidateCoords = getPlaceCoords(candidate);
      const distance = coords && candidateCoords
        ? Math.hypot((candidateCoords[0] - coords[0]) * 69, (candidateCoords[1] - coords[1]) * 60)
        : Number.MAX_SAFE_INTEGER;
      return { candidate, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6)
    .map(({ candidate }) => candidate);
}

function isGeraldinesEntity(place) {
  return /\bgeraldine'?s?\b/i.test([place?.id, place?.name, place?.title, place?.raw?.name].filter(Boolean).join(" "));
}

function getInKindMenuUrl(place) {
  const raw = place?.raw || {};
  return raw.menuUrl || raw.menu_url || place?.menuUrl || raw.website || raw.url || place?.website || "";
}

function getInKindActionUrl(place, type) {
  const raw = place?.raw || {};
  if (type === "menu") {
    return getInKindMenuUrl(place);
  }
  if (type === "pay") {
    return raw.inkindUrl || raw.inkind_url || place?.inkindUrl || "https://app.inkind.com/";
  }
  return directionsUrl(place);
}

const INKIND_DISCOVERY_PROFILES = [
  {
    match: /\bcomedor\b/i,
    subtitle: "Modern Mexican dining a few blocks from the lake.",
    story:
      "One of downtown's most celebrated dining rooms, Comedor blends contemporary Mexican cooking with dramatic architecture, warm hospitality, and a menu designed for sharing.",
    benefit:
      "The Downtown Perks benefit adds resident dining value at this participating restaurant.",
    why:
      "Residents keep it on the short list for date nights, client dinners, mezcal rounds, and the kind of meal that feels worth walking to.",
    loves: "Contemporary Mexican plates, mezcal, cocktails, and a room that feels distinctly Austin.",
    localTip: "Book ahead for prime dinner hours, or use it when you want a polished plan near the lake and Seaholm.",
    goodFor: ["Date night", "Out-of-town guests", "Celebrations", "Cocktails"],
    nearbyContext: "Close to The Austonian, The Independent, The Shore, and the Seaholm District.",
  },
  {
    match: /\bred ash\b/i,
    subtitle: "Handmade pasta, wood-fired cooking, and a downtown room people plan around.",
    story:
      "Red Ash is a downtown favorite known for handmade pastas, wood-fired cooking, and one of the hardest reservations in Austin.",
    benefit:
      "Eligible Downtown Perks members can unlock additional dining value through participating restaurant benefits.",
    why:
      "It works for celebrations, business dinners, wine nights, and visiting friends who want downtown energy with a refined meal.",
    loves: "Fresh pasta, wood-fired entrees, strong service, and a dining room people plan ahead for.",
    localTip: "Try earlier dinner windows or bar seating when the main room is booked.",
    goodFor: ["Anniversaries", "Business dinners", "Wine nights", "Visiting friends"],
    nearbyContext: "Easy from Congress, the Warehouse District, and nearby downtown hotels.",
  },
  {
    match: /\bbulevar\b/i,
    subtitle: "Coastal Mediterranean dining for long dinners and easy conversation.",
    story:
      "Bulevar brings coastal Mediterranean influences to downtown Austin with seafood-forward dishes, elegant interiors, and an atmosphere designed for lingering.",
    benefit:
      "Enjoy additional dining value through Downtown Perks participating restaurant benefits.",
    why:
      "Residents use it when they want a dinner that feels elevated without leaving the neighborhood.",
    loves: "Seafood-forward plates, polished service, cocktails, and a dining room that softens as the night settles in.",
    localTip: "Reserve around sunset and stay for drinks as the room shifts from bright to intimate.",
    goodFor: ["Seafood", "Date night", "Cocktails", "Long dinners"],
    nearbyContext: "A strong fit for downtown residents, hotel guests, and west side dinner plans.",
  },
  {
    match: /\bemmer\s*&?\s*rye\b/i,
    subtitle: "Seasonal Texas dining nearby.",
    story:
      "Emmer & Rye is a Rainey-area dining room built around seasonal Texas ingredients, thoughtful hospitality, and a menu that changes with what is fresh.",
    benefit:
      "The Downtown Perks benefit adds resident dining value at this participating restaurant.",
    why:
      "Residents choose it when dinner should feel local, creative, and close enough to walk to before or after Rainey plans.",
    loves: "Seasonal plates, handmade pastas, local ingredients, and a dining room that rewards ordering a few things to share.",
    localTip: "Go when you want dinner to be the plan, then walk into Rainey for a drink after.",
    goodFor: ["Seasonal dining", "Sharing plates", "Date night", "Walkable dinner"],
    nearbyContext: "Near Rainey, Hotel Van Zandt, The Shore, Waterline, and nearby downtown buildings.",
  },
  {
    match: /\bgeraldine'?s?\b/i,
    subtitle: "Dining and live music inside Hotel Van Zandt.",
    story:
      "Geraldine's is a polished Rainey dining and live music spot inside Hotel Van Zandt, good for cocktails, dinner, and plans before or after a show.",
    benefit:
      "The Downtown Perks benefit adds resident dining value and current resident-perk access when available.",
    why:
      "It gives residents a dependable reason to stay around Rainey when dinner, drinks, and live music can all happen in one place.",
    loves: "Cocktails, dinner, live music, hotel energy, and a room that works for both dates and groups.",
    localTip: "Use it for weekday happy hour, then stay into the evening when the music starts.",
    goodFor: ["Happy hour", "Date night", "Cocktails", "Live music"],
    nearbyContext: "Walkable from nearby downtown buildings, hotels, and Rainey Street plans.",
  },
  {
    match: /\bparkside\b/i,
    subtitle: "Oysters, cocktails, and downtown dining on Congress.",
    story:
      "Parkside is a downtown staple for oysters, cocktails, and a room that works before shows, after work, or when dinner needs to stay central.",
    benefit:
      "The Downtown Perks benefit adds resident dining value at this participating restaurant.",
    why:
      "Residents use it for reliable seafood, easy downtown meetups, and nights when Congress Avenue is already part of the plan.",
    loves: "Oysters, cocktails, seafood plates, and a central downtown location.",
    localTip: "Start with oysters and drinks, then decide whether dinner becomes the full plan.",
    goodFor: ["Oysters", "Cocktails", "Pre-show dinner", "Downtown meetups"],
    nearbyContext: "Close to Congress Avenue, the Warehouse District, hotels, and downtown venues.",
  },
];

function cleanInKindResidentCopy(value) {
  return cleanDisplayCopy(value)
    .replace(/\bearn rewards?\b/gi, "unlock member benefits")
    .replace(/\breceive dining credit\b/gi, "enjoy additional dining value")
    .replace(/\bdining credit\b/gi, "dining value")
    .replace(/\bparticipating merchant network\b/gi, "participating restaurant benefits")
    .replace(/\bpowered by inKind\b/gi, "included with Downtown Perks")
    .replace(/\bthrough inKind dining access\b/gi, "through Downtown Perks dining benefits")
    .replace(/\binKind-compatible resident value\b/gi, "Downtown Perks resident value")
    .replace(/\bthrough inKind\b/gi, "through Downtown Perks")
    .replace(/\s+/g, " ")
    .trim();
}

function getInKindDiscoveryProfile(place) {
  const name = place?.name || place?.title || "this restaurant";
  const searchText = [
    place?.id,
    place?.name,
    place?.title,
    place?.raw?.name,
    place?.raw?.title,
    place?.category,
    place?.summary,
  ].filter(Boolean).join(" ");
  const matched = INKIND_DISCOVERY_PROFILES.find((profile) => profile.match.test(searchText));
  if (matched) return matched;
  const cuisine = String(place?.category || place?.raw?.category || "Dining").split("/")[0].trim() || "Dining";
  const neighborhood = place?.district || place?.neighborhood || "Downtown Austin";
  const story = cleanInKindResidentCopy(place?.raw?.story || place?.raw?.summary || place?.summary || place?.description) ||
    `${name} gives downtown residents a nearby dining option that is easy to choose when the night is still taking shape.`;

  return {
    subtitle: `${cuisine} near ${neighborhood}.`,
    story,
    benefit: "The Downtown Perks benefit adds resident dining value at this participating restaurant.",
    why: `${name} is useful when you want a real local option nearby instead of scrolling for another place to go.`,
    loves: cleanInKindResidentCopy(place?.raw?.knownFor || place?.raw?.cuisine || place?.category) || "Good food, easy access, and a reason to make nearby plans feel more useful.",
    localTip: "Check the current benefit before you go, then save it for dinner plans, visiting friends, or an easy night out.",
    goodFor: ["Dinner nearby", "Date night", "Visiting friends", "Cocktails"],
    nearbyContext: `Useful for residents, hotel guests, and downtown plans around ${neighborhood}.`,
  };
}

function getAppliedInKindPerk(place) {
  const raw = place?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : place?.perk && typeof place.perk === "object" ? place.perk : null;
  const title = cleanDisplayCopy(embeddedPerk?.title || raw.perkTitle || raw.offer || place?.offer) || "inKind dining benefit";
  const rawValue = cleanDisplayCopy(embeddedPerk?.value || raw.deals_offers || place?.deals_offers || place?.offer);
  const value = /^(resident dining perk|resident drink offer|resident perk|perk)$/i.test(rawValue) ? title : rawValue || "Resident dining value applied through inKind";
  return {
    title,
    value,
    description:
      cleanDisplayCopy(embeddedPerk?.description || raw.perkDescription) ||
      "A restaurant-backed dining benefit or credit-style value residents can use when the active inKind offer is available.",
    terms:
      cleanDisplayCopy(raw.terms || raw.perk_terms) ||
      "Offer availability, eligible checks, and redemption windows are managed by the participating restaurant and inKind. Check the active benefit before ordering.",
  };
}

function InKindAppliedLayer({ place, mode = "resident" }) {
  if (!isInKindEntity(place)) return null;
  const perk = getAppliedInKindPerk(place);
  const placeName = place?.name || "this restaurant";
  const partnerMode = mode === "partner";
  const steps = partnerMode
    ? [
        ["Discovery", "Downtown Perks places the restaurant in map search, nearby rails, saved places, and local recommendations."],
        ["Transaction", "inKind supports the payment-linked value or dining benefit after the resident decides to go."],
        ["Reporting", "Partners can compare views, saves, directions, benefit opens, and ready-to-use restaurant actions around each location."],
      ]
    : [
        ["Save it", `Add ${placeName} to your Downtown Perks saved places so it is easy to find later.`],
        ["Check the benefit", "Open the inKind benefit before you order to confirm the current offer and eligible window."],
        ["Redeem when active", "Use the participating restaurant benefit through inKind when it fits your plan."],
      ];

  return (
    <section className="dp-inkind-zone dp-inkind-decision-zone" aria-label="How inKind works with Downtown Perks">
      <p className="dp-inkind-zone-meta">inKind layer · Downtown Perks applied perk</p>
      <h3>{partnerMode ? "How inKind works with Downtown Perks" : "How to use the inKind benefit"}</h3>
      <p>
        {partnerMode
          ? "Downtown Perks helps create the local decision before the check is opened. inKind can support the dining value and transaction flow after someone chooses the restaurant."
          : "Downtown Perks helps you find the right nearby restaurant. inKind carries the active dining benefit when the restaurant offer is available."}
      </p>
      <div className="dp-inkind-time-grid" aria-label="Applied inKind perk">
        <div>
          <span>Applied perk</span>
          <strong>{perk.value}</strong>
        </div>
        <div>
          <span>How it applies</span>
          <strong>{perk.description}</strong>
        </div>
      </div>
      <div className="dp-inkind-time-grid" aria-label="inKind steps">
        {steps.map(([label, copy]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{copy}</strong>
          </div>
        ))}
      </div>
      <p className="dp-inkind-walkability">{perk.terms}</p>
      <div className="dp-inkind-perk-actions">
        <a href={getInKindActionUrl(place, "pay")} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">
          Open inKind Benefit
        </a>
        <Link to="/brands/inkind" className="dp-panel-action-text">
          How it works
        </Link>
      </div>
    </section>
  );
}

function asCleanArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|•|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getLocalServiceProfile(place) {
  const raw = place?.raw || {};
  const service = place?.localService || raw.localService || {};
  const serviceCategory = service.serviceCategory || place?.serviceCategory || raw.serviceCategory || "Local Service";
  const serviceType = service.serviceType || place?.serviceType || raw.serviceType || place?.subcategory || "Service";
  const prompt = cleanDisplayCopy(service.prompt || place?.offer || raw.offer) || "Who can help?";
  const whyUse =
    cleanDisplayCopy(service.whyUse || place?.description || raw.description || place?.summary || raw.summary) ||
    "A local business already connected to downtown routines, buildings, and resident needs.";
  return {
    serviceCategory,
    serviceType,
    prompt,
    whyUse,
    oneSentence:
      cleanDisplayCopy(service.oneSentence || place?.summary || raw.summary) ||
      `${serviceType} help for downtown residents, buildings, and local businesses.`,
    about:
      cleanDisplayCopy(service.about || place?.description || raw.description || whyUse) ||
      whyUse,
    bestFor: asCleanArray(service.bestFor || place?.bestFor || raw.bestFor),
    goodToKnow: asCleanArray(service.goodToKnow || place?.goodToKnow || raw.goodToKnow),
    downtownConnection:
      cleanDisplayCopy(service.downtownConnection || place?.downtownConnection || raw.downtownConnection) ||
      "Already useful for downtown residents, buildings, property teams, and local businesses.",
    nearbyBuildings: asCleanArray(service.nearbyBuildings || place?.nearbyBuildings || raw.nearbyBuildings),
    nearbyServices: asCleanArray(service.nearbyServices || place?.related || raw.related),
    website: place?.website || raw.website || place?.url || raw.url || "",
    phone: place?.contact_phone || raw.contact_phone || place?.phone || raw.phone || "",
  };
}

function getLocalServiceCategoryLabel(profile) {
  const labelMap = {
    Home: "Home Services",
    Property: "Property Services",
    Money: "Money",
    Legal: "Legal",
    Health: "Health",
    Community: "Community",
    Business: "Business",
    Design: "Design",
  };
  return (labelMap[profile.serviceCategory] || profile.serviceCategory || "Local Service").toUpperCase();
}

function getWhyPeopleChooseService(profile) {
  const service = String(profile.serviceType || "").toLowerCase();
  if (service.includes("roof")) {
    return ["A roof starts leaking", "Hail damages shingles", "Insurance requests an inspection", "A building needs preventative maintenance", "It is time for a replacement"];
  }
  if (service.includes("plumb")) {
    return ["A leak needs a quick answer", "A water heater stops working", "A condo has a plumbing issue", "A business needs scheduled repair", "A building wants someone already close to downtown"];
  }
  if (service.includes("restoration")) {
    return ["Water damage needs cleanup", "Fire or smoke affects a space", "Mold needs professional attention", "A burst pipe affects more than one unit", "A property needs help getting back to normal"];
  }
  if (service.includes("real estate") || service.includes("condo")) {
    return ["They are comparing downtown buildings", "They want to buy or sell with local context", "They need help understanding HOA, amenities, and walkability", "They are deciding whether a building fits daily life"];
  }
  if (service.includes("insurance")) {
    return ["They want coverage explained clearly", "They need condo, home, auto, or business options", "They want to compare policies without calling five companies", "A property or business decision needs insurance context"];
  }
  if (service.includes("bank")) {
    return ["They are opening an account", "They are buying a home", "They need a local loan or credit union", "They are starting or growing a business"];
  }
  if (service.includes("legal") || service.includes("injury")) {
    return ["They need options explained clearly", "A contract, dispute, or accident needs advice", "They want practical guidance before taking the next step", "They need representation without getting lost in jargon"];
  }
  return profile.bestFor.slice(0, 5).map((item) => `They need help with ${String(item).toLowerCase()}`);
}

function getServiceRelatedPlaces(place, places = [], profile = getLocalServiceProfile(place)) {
  const names = new Set(profile.nearbyServices.map((item) => item.toLowerCase()));
  const direct = places.filter((candidate) => candidate?.id && candidate.id !== place?.id && names.has(String(candidate.name || "").toLowerCase()));
  if (direct.length) return direct.slice(0, 8);
  return places
    .filter((candidate) => candidate?.id && candidate.id !== place?.id && isLocalServiceEntity(candidate))
    .map((candidate) => ({ candidate, score: getMapDistanceScore(place, candidate) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map(({ candidate }) => candidate);
}

function getLocalServiceRailIcon(item) {
  if (typeof item === "string") return BadgePercent;
  const profile = getLocalServiceProfile(item);
  const text = `${profile.serviceType || ""} ${profile.serviceCategory || ""} ${item?.category || ""}`.toLowerCase();
  if (text.includes("bank") || text.includes("money")) return Landmark;
  if (text.includes("fitness") || text.includes("health") || text.includes("wellness")) return HeartPulse;
  if (text.includes("real estate") || text.includes("property") || text.includes("community") || text.includes("condo")) return Building2;
  if (text.includes("design") || text.includes("closet") || text.includes("storage")) return Sparkles;
  if (text.includes("business") || text.includes("legal") || text.includes("insurance")) return BriefcaseBusiness;
  return MapPin;
}

function LocalServiceRail({ title, items = [], onSelect, kind = "text" }) {
  if (!items.length) return null;
  return (
    <div className={`dp-local-service-rail dp-local-service-rail--${kind}`} aria-label={title}>
      {items.map((item) => {
        const key = typeof item === "string" ? item : item.id || item.name;
        const label = typeof item === "string" ? item : item.name;
        const meta = typeof item === "string" ? "" : getLocalServiceProfile(item).serviceType || item.category || "Local Service";
        const Icon = getLocalServiceRailIcon(item);
        return (
          <button
            key={key}
            type="button"
            className="dp-local-service-chip"
            onClick={typeof item === "string" ? undefined : () => onSelect?.(item)}
            disabled={typeof item === "string"}
          >
            <span className="dp-local-service-chip-icon" aria-hidden="true">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="dp-local-service-chip-copy">
              <strong>{label}</strong>
              {meta && <span>{meta}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LocalServiceDrawer({ place, places = [], savedIds, onSave, onSelect, answer, loading, onAsk, onCloseAnswer, mode = "resident" }) {
  const profile = getLocalServiceProfile(place);
  const relatedServices = getServiceRelatedPlaces(place, places, profile);
  const isSaved = savedIds?.has?.(place?.id);
  const whyChoose = getWhyPeopleChooseService(profile);

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-local-service-drawer dp-business-detail-drawer">
      <DestinationHero place={place} mode="resident" />
      <header className="dp-entity-panel-header dp-entity-summary dp-local-service-summary">
        <p className="dp-entity-eyebrow">{getLocalServiceCategoryLabel(profile)}</p>
        <h2 className="dp-entity-title">{place.name}</h2>
        <p className="dp-entity-meta">{profile.serviceType}{place.district ? ` · ${place.district}` : ""}</p>
        <p className="dp-entity-dek">{profile.prompt}</p>
        <p className="dp-business-one-line">{profile.oneSentence}</p>
      </header>

      <DestinationSection title="About" className="dp-local-service-section">
        <p>{profile.about}</p>
      </DestinationSection>

      <div className="dp-primary-action-row dp-editorial-hero-actions">
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">
            Website
          </a>
        )}
        {profile.phone && (
          <a href={`tel:${profile.phone}`} className="dp-panel-action">
            Call
          </a>
        )}
        <button type="button" onClick={onSave} className="dp-panel-action">
          {isSaved ? "Saved" : "Save"}
        </button>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
          Directions
        </a>
      </div>

      <DestinationSection title="Best For" className="dp-local-service-section">
        <LocalServiceRail title="Services" items={profile.bestFor} />
      </DestinationSection>

      <DestinationSection title="Why People Choose Them" className="dp-local-service-section">
        <LocalServiceRail title="Why people choose them" items={whyChoose} />
      </DestinationSection>

      <DestinationSection title="Good to know" className="dp-local-service-section">
        <LocalServiceRail title="Good to know" items={profile.goodToKnow} />
      </DestinationSection>

      <DestinationSection title="Downtown connection" className="dp-local-service-section">
        <p>{profile.downtownConnection}</p>
      </DestinationSection>

      <DestinationSection title="Nearby buildings" className="dp-local-service-section">
        <LocalServiceRail title="Nearby buildings" items={profile.nearbyBuildings} />
      </DestinationSection>

      <DestinationSection title="Nearby businesses" className="dp-local-service-section">
        <LocalServiceRail title="Nearby services" items={relatedServices} onSelect={onSelect} kind="places" />
      </DestinationSection>

      <NearbyImageRail
        place={place}
        places={places.filter((candidate) => !isServiceEntity(candidate))}
        onSelect={onSelect}
        title="Nearby perks"
        support="Places nearby that help this service stay connected to the rest of downtown."
      />

      <DestinationSection title="Related Services" className="dp-local-service-section">
        <LocalServiceRail title="Similar businesses" items={relatedServices} onSelect={onSelect} kind="places" />
      </DestinationSection>

      <DestinationSection title="Contact" className="dp-local-service-section">
        <div className="dp-business-contact-list">
          {profile.website && <span><strong>Website</strong>{profile.website.replace(/^https?:\/\//, "")}</span>}
          {profile.phone && <span><strong>Phone</strong>{profile.phone}</span>}
          {place.address && <span><strong>Where</strong>{place.address}</span>}
          <span><strong>Hours</strong>Check current availability before you go.</span>
        </div>
        <div className="dp-primary-action-row">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">
              Open Website
            </a>
          )}
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
            Get Directions
          </a>
        </div>
      </DestinationSection>

      <DestinationSection title="Map" className="dp-local-service-section">
        <p>Save this business, get directions, or open nearby places from the map when you need local help.</p>
        <div className="dp-primary-action-row">
          <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
            {isSaved ? "Saved" : "Save"}
          </button>
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
            Directions
          </a>
          <button
            type="button"
            className="dp-panel-action"
            onClick={() => navigator.clipboard?.writeText?.(typeof window !== "undefined" ? window.location.href : "")}
          >
            Share
          </button>
        </div>
      </DestinationSection>

      {onAsk && (
        <EntityAssistant
          place={place}
          mode={mode}
          answer={answer}
          loading={loading}
          onAsk={onAsk}
          onClose={onCloseAnswer}
          onSelect={onSelect}
        />
      )}
    </motion.div>
  );
}

function getEventProfile(place) {
  const raw = place?.raw || {};
  const category = cleanDisplayCopy(String(place?.category || raw.category || "Event").replace(/^Event\s*\/\s*/i, "")) || "Event";
  const summary = cleanDisplayCopy(place?.panelBody || raw.panelBody || place?.summary || raw.summary || place?.description || raw.description);
  const description = cleanDisplayCopy(place?.description || raw.description || summary);
  const aboutParts = [summary, description].filter(Boolean);
  const about = aboutParts.length > 1 && aboutParts[0] !== aboutParts[1] ? aboutParts.join(" ") : aboutParts[0] || "A downtown event worth checking before you go.";
  const primaryAction = cleanDisplayCopy(place?.primaryAction || raw.primaryAction || (place?.bookingUrl || raw.bookingUrl ? "Book" : "Save"));
  const secondaryAction = cleanDisplayCopy(place?.secondaryAction || raw.secondaryAction || "Add to Calendar");
  return {
    eyebrow: category.toUpperCase(),
    title: cleanDisplayCopy(place?.panelHeadline || raw.panelHeadline || place?.name || raw.name || "Downtown event"),
    meta: [getEventTimeContext(place), cleanDisplayCopy(place?.district || raw.district)].filter(Boolean).join(" · "),
    oneSentence: cleanDisplayCopy(place?.panelBody || raw.panelBody || summary) || "A downtown event to save, book, or build a plan around.",
    about,
    address: cleanDisplayCopy(place?.address || raw.address || ""),
    time: getEventTimeContext(place),
    duration: cleanDisplayCopy(place?.eventDuration || raw.eventDuration || ""),
    room: cleanDisplayCopy(place?.eventRoom || raw.eventRoom || ""),
    price: cleanDisplayCopy(place?.price || raw.price || place?.offer || raw.offer || ""),
    addOn: cleanDisplayCopy(place?.addOn || raw.addOn || ""),
    checkIn: cleanDisplayCopy(place?.checkIn || raw.checkIn || ""),
    reservation: cleanDisplayCopy(place?.reservation || raw.reservation || ""),
    included: asCleanArray(place?.included || raw.included),
    goodFor: asCleanArray(place?.goodFor || raw.goodFor),
    quickFacts: asCleanArray(place?.quickFacts || raw.quickFacts),
    schedule: Array.isArray(place?.schedule || raw.schedule) ? (place?.schedule || raw.schedule) : [],
    url: place?.bookingUrl || raw.bookingUrl || place?.website || raw.website || place?.url || raw.url || "",
    primaryAction,
    secondaryAction,
  };
}

function EventDetailDrawer({ place, places = [], savedIds, eventRsvps, onRsvp, onSave, onSelect, answer, loading, onAsk, onCloseAnswer, mode = "resident" }) {
  const profile = getEventProfile(place);
  const isSaved = savedIds?.has?.(place?.id);
  const isRsvped = (Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === place?.id);
  const factItems = [
    profile.time && ["When", profile.time],
    profile.duration && ["Duration", profile.duration],
    profile.room && ["Location", profile.room],
    profile.price && ["Price", profile.price],
    profile.addOn && ["Add-on", profile.addOn],
  ].filter(Boolean);
  const aboutText = String(profile.about || "").trim();
  const shouldShowAbout = aboutText && aboutText !== String(profile.oneSentence || "").trim();

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-event-detail-drawer">
      <DestinationHero place={place} mode="resident" />
      <header className="dp-entity-panel-header dp-entity-summary dp-event-summary">
        <p className="dp-entity-eyebrow">{profile.eyebrow}</p>
        <h2 className="dp-entity-title">{profile.title}</h2>
        {profile.meta && <p className="dp-entity-meta">{profile.meta}</p>}
        <p className="dp-entity-dek">{profile.oneSentence}</p>
      </header>

      {shouldShowAbout && (
        <DestinationSection title="About" className="dp-event-section">
          <p>{aboutText}</p>
        </DestinationSection>
      )}

      <DestinationSection title="Quick facts" className="dp-event-section">
        <div className="dp-event-fact-rail">
          {factItems.map(([label, value]) => (
            <span key={`${label}-${value}`} className="dp-event-fact">
              <strong>{label}</strong>
              {value}
            </span>
          ))}
          {profile.address && (
            <span className="dp-event-fact">
              <strong>Where</strong>
              {profile.address}
            </span>
          )}
        </div>
      </DestinationSection>

      <div className="dp-primary-action-row dp-editorial-hero-actions">
        <button type="button" onClick={onRsvp} className="dp-panel-action dp-primary-action">
          {isRsvped ? "RSVP Submitted" : "RSVP"}
        </button>
        <button type="button" onClick={onSave} className="dp-panel-action">
          {isSaved ? "Saved" : "Save"}
        </button>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
          Directions
        </a>
        {profile.url && (
          <a href={profile.url} target="_blank" rel="noreferrer" className="dp-panel-action">
            Event Page
          </a>
        )}
      </div>

      {!!profile.included.length && (
        <DestinationSection title="What to expect" className="dp-event-section">
          <LocalServiceRail title="What to expect" items={profile.included} />
        </DestinationSection>
      )}

      {!!profile.goodFor.length && (
        <DestinationSection title="Good For" className="dp-event-section">
          <LocalServiceRail title="Good for" items={profile.goodFor} />
        </DestinationSection>
      )}

      {!!profile.schedule.length && (
        <DestinationSection title="Schedule" className="dp-event-section">
          <div className="dp-event-schedule-rail" aria-label="Event schedule">
            {profile.schedule.slice(0, 12).map((item) => (
              <span key={`${item.isoDate || item.label}-${item.className || item.room}`} className="dp-event-schedule-item">
                <strong>{item.label || item.isoDate}</strong>
                <span>{item.className}</span>
                <small>{item.duration || item.room}</small>
              </span>
            ))}
          </div>
        </DestinationSection>
      )}

      <NearbyImageRail
        place={place}
        places={places.filter((candidate) => candidate?.id !== place?.id && !isCampaignEntity(candidate))}
        onSelect={onSelect}
        title="Nearby"
      />

      {onAsk && (
        <EntityAssistant
          place={place}
          mode={mode}
          answer={answer}
          loading={loading}
          onAsk={onAsk}
          onClose={onCloseAnswer}
          onSelect={onSelect}
        />
      )}
    </motion.div>
  );
}

function NeighborhoodDetailDrawer({ place, places = [], mode = "resident", savedIds, onSave, onSelect }) {
  const raw = place?.raw || {};
  const image = getLifestyleImage(place, mode);
  const isSaved = savedIds?.has?.(place.id);
  const list = (key) => {
    const value = place?.[key] || raw?.[key] || [];
    return Array.isArray(value) ? value.filter(Boolean) : [];
  };
  const featuredPerk = place?.featuredPerk || raw?.featuredPerk;
  const comparisonRows = place?.comparisonAttributes || raw?.comparisonAttributes;
  const linkedNames = [...list("linkedBuildings"), ...list("linkedBusinesses")];
  const linkedPlaces = linkedNames
    .map((name) => places.find((candidate) => String(candidate.name || "").toLowerCase() === String(name).toLowerCase()))
    .filter(Boolean)
    .slice(0, 8);
  const campaignRecommendations = list("campaignRecommendations");

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-neighborhood-drawer">
      <DestinationHero place={{ ...place, image }} mode={mode} />
      <EntityIdentityPanel identity={getEntityIdentity(place, mode)} />
      <section className="dp-destination-action-row dp-neighborhood-actions" aria-label={`${place.name} actions`}>
        <button type="button" onClick={onSave}>{isSaved ? "Saved" : "Save"}</button>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer">Directions</a>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: place.name, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(window.location.href);
            }
          }}
        >
          Share
        </button>
      </section>

      <DestinationSection title={mode === "partner" ? "Why this district matters" : (place.drawerHeadline || raw.drawerHeadline || "Why choose this neighborhood")}>
        <p className="dp-why-people-go">{place.drawerBody || raw.drawerBody || place.description || place.summary}</p>
        {(place.history || raw.history) && <p>{place.history || raw.history}</p>}
      </DestinationSection>

      {Array.isArray(comparisonRows) && comparisonRows.length > 0 && (
        <DestinationSection title="Compare Neighborhoods">
          <div className="dp-neighborhood-comparison-rail" aria-label="Neighborhood comparison">
            {comparisonRows.map(([name, style, walkability, atmosphere]) => (
              <article key={name} className="dp-neighborhood-comparison-card">
                <strong>{name}</strong>
                <span>{style}</span>
                <em>{walkability} walkability</em>
                <small>{atmosphere}</small>
              </article>
            ))}
          </div>
        </DestinationSection>
      )}

      {list("residentialSnapshot").length > 0 && (
        <DestinationSection title="Residential snapshot">
          <div className="dp-civic-text-rail">
            {list("residentialSnapshot").map((item) => (
              <span key={item}><strong>{item}</strong></span>
            ))}
          </div>
        </DestinationSection>
      )}

      {list("notableBuildings").length > 0 && (
        <DestinationSection title="Buildings nearby">
          <div className="dp-civic-text-rail">
            {list("notableBuildings").map((item) => (
              <button key={item} type="button" onClick={() => {
                const match = places.find((candidate) => String(candidate.name || "").toLowerCase() === String(item).toLowerCase());
                if (match) onSelect(match);
              }}>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        </DestinationSection>
      )}

      {list("dailyEssentials").length > 0 && (
        <DestinationSection title="Everyday essentials">
          <ul className="dp-daa-clean-list">
            {list("dailyEssentials").map((item) => <li key={item}>{item}</li>)}
          </ul>
        </DestinationSection>
      )}

      {list("localHighlights").length > 0 && (
        <DestinationSection title="Local highlights">
          <div className="dp-civic-text-rail">
            {list("localHighlights").map((item) => (
              <button key={item} type="button" onClick={() => {
                const match = places.find((candidate) => String(candidate.name || "").toLowerCase() === String(item).toLowerCase());
                if (match) onSelect(match);
              }}>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        </DestinationSection>
      )}

      {featuredPerk?.title && (
        <DestinationSection title="Featured resident perk">
          <p><strong>{featuredPerk.title}</strong></p>
          <p>{featuredPerk.body}</p>
        </DestinationSection>
      )}

      {list("bestFor").length > 0 && (
        <DestinationSection title="Good for">
          <ul className="dp-daa-clean-list">
            {list("bestFor").map((item) => <li key={item}>{item}</li>)}
          </ul>
        </DestinationSection>
      )}

      {mode === "partner" && campaignRecommendations.length > 0 && (
        <DestinationSection title="Campaign ideas">
          <div className="dp-civic-text-rail">
            {campaignRecommendations.map((item) => (
              <span key={item}><strong>{item}</strong></span>
            ))}
          </div>
        </DestinationSection>
      )}

      {linkedPlaces.length > 0 && (
        <DestinationSection title="Open nearby pins">
          <div className="dp-daa-next-rail">
            {linkedPlaces.map((candidate) => (
              <button key={candidate.id} type="button" className="dp-daa-next-card" onClick={() => onSelect(candidate)}>
                <span className="dp-daa-next-card-kicker">{candidate.category || candidate.type || "Nearby"}</span>
                <strong>{candidate.name}</strong>
                <em>{candidate.district || "Downtown Austin"}</em>
              </button>
            ))}
          </div>
        </DestinationSection>
      )}
    </motion.div>
  );
}

function BuildingLocalServicesRail({ place, places = [], onSelect }) {
  const isFrostTower = String(place?.id || "").toLowerCase() === "priority-frost-tower" || /frost tower/i.test(place?.name || "");
  const categoryOrder = ["Home", "Property", "Money", "Legal", "Health", "Community", "Business", "Design"];
  const services = places
    .filter((candidate) => candidate?.id && isLocalServiceEntity(candidate))
    .map((candidate) => {
      const profile = getLocalServiceProfile(candidate);
      const order = categoryOrder.indexOf(profile.serviceCategory);
      return { candidate, order: order === -1 ? 99 : order, score: getMapDistanceScore(place, candidate) };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.order - b.order || a.score - b.score)
    .slice(0, 10)
    .map(({ candidate }) => candidate);
  if (!services.length) return null;

  return (
    <DestinationSection
      title={isFrostTower ? "District Services" : "Local Services"}
      className="dp-local-service-section dp-building-services-section"
      support={isFrostTower
        ? "Frost Tower is a commercial workplace and downtown business hub. These nearby pins connect people to banking, property, professional, community, and everyday services around the Congress Avenue district."
        : "People living here commonly use businesses like these when they need help around the home, property, money, legal, or community needs."}
    >
      <LocalServiceRail title="Local services nearby" items={services} onSelect={onSelect} kind="places" />
    </DestinationSection>
  );
}

const BURGER_BAR_CONGRESS_CONTENT = {
  title: "Burger Bar Congress",
  residentSubtitle: "Burgers, drinks, and downtown energy right on Congress.",
  residentOverview:
    "Located at the corner of 2nd Street and Congress Avenue, Burger Bar Congress is a casual downtown favorite for burgers, fries, local beer, cocktails, and late-night bites. Whether you're heading to a concert, leaving the office, or looking for an easy place to meet friends, it's a reliable stop in the center of downtown activity.",
  whyPeopleGo: [
    "Quick lunch between meetings",
    "Casual happy hour drinks",
    "Pre-event dining",
    "Late-night food downtown",
    "Weekend people watching on Congress",
  ],
  whatYouWillFind: [
    "Signature burgers",
    "Hand-cut fries",
    "Beer and cocktails",
    "Outdoor patio seating",
    "Walk-up ordering",
    "Late-night hours",
  ],
  nearby: [
    "2-minute walk to Congress Avenue",
    "5-minute walk to Lady Bird Lake",
    "Close to JW Marriott, ACL Live, and the Warehouse District",
  ],
  residentNote:
    "One of downtown's easiest casual gathering spots when you want something simple, fast, and close to where the action is happening.",
  partnerSubtitle:
    "A high-traffic downtown dining destination serving residents, workers, visitors, and event attendees throughout the day.",
  partnerOverview:
    "Burger Bar Congress occupies a highly visible location at 2nd Street and Congress Avenue, benefiting from consistent pedestrian activity generated by nearby hotels, office towers, residential buildings, entertainment venues, and convention visitors.",
  businessOverview: [
    ["Category", "Restaurant · Burgers · Drinks"],
    ["District", "Congress Avenue"],
    ["Audience", "Residents, office workers, hotel guests, convention attendees, event-goers, tourists"],
    ["Visit Patterns", "Lunch · Happy Hour · Dinner · Late Night"],
  ],
  visibilityOpportunities: [
    "Limited-time menu items",
    "Happy hour specials",
    "Event-night offers",
    "Resident-exclusive perks",
    "Seasonal campaigns",
    "Partnership promotions",
  ],
  recommendedCampaigns: [
    ["Happy Hour Spotlight", "Increase awareness during afternoon and early evening traffic periods."],
    ["Resident Perk Campaign", "Reward nearby residents with exclusive offers and encourage repeat visits."],
    ["Event Night Promotion", "Capture traffic before concerts, sporting events, and downtown activations."],
    ["Sponsored Campaign", "Show up across the places people already open downtown."],
  ],
  audienceAlignment: [
    "Downtown residents",
    "Young professionals",
    "Hotel guests",
    "Convention visitors",
    "Concert attendees",
    "Weekend guests",
  ],
  partnerInsights: [
    "Profile views",
    "Saves",
    "Direction requests",
    "Offer opens",
    "Perk redemptions",
    "Campaign engagement",
    "Repeat visitor behavior",
  ],
  assessment:
    "Burger Bar Congress is a strong everyday-use venue that benefits from frequency rather than destination travel. Visibility campaigns should focus on convenience, proximity, timing, and repeat visitation rather than special occasions.",
};

function isBurgerBarCongress(place) {
  const id = String(place?.id || place?.raw?.id || "").toLowerCase();
  const name = String(place?.name || place?.raw?.name || "").toLowerCase();
  const address = String(place?.address || place?.raw?.address || "").toLowerCase();
  const osmId = String(place?.osm_id || place?.raw?.osm_id || "");
  return (
    id === "inkind-hopdoddy-congress" ||
    id === "burger-bar-node-4304618025" ||
    id === "map-987-burger-bar" ||
    osmId === "4304618025" ||
    ((name.includes("burger bar") || name.includes("hopdoddy burger bar")) &&
      (address.includes("110") || address.includes("2nd") || address.includes("congress")))
  );
}

function DetailBulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[6px_1fr] gap-2 text-[13px] leading-5 text-[#0B1F33]/72">
          <span className="mt-2 h-1.5 w-1.5 rounded-[2px] bg-[#C8A96A]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BurgerBarCongressDetails({ place, places = [], mode = "resident", savedIds, onSave, onSelect }) {
  if (!isBurgerBarCongress(place)) return null;
  const isPartnerMode = mode === "partner";
  const isSaved = savedIds?.has?.(place?.id);
  const shareBurgerBar = () => {
    const shareData = {
      title: BURGER_BAR_CONGRESS_CONTENT.title,
      text: BURGER_BAR_CONGRESS_CONTENT.residentSubtitle,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }
    window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n${shareData.url}`)}`;
  };

  if (isPartnerMode) {
    return (
      <div className="space-y-5">
        <DestinationSection title={BURGER_BAR_CONGRESS_CONTENT.title} support={BURGER_BAR_CONGRESS_CONTENT.partnerSubtitle}>
          <p className="text-[13px] leading-6 text-[#0B1F33]/72">{BURGER_BAR_CONGRESS_CONTENT.partnerOverview}</p>
        </DestinationSection>

        <DestinationSection title="Business Overview">
          <div className="grid gap-3 sm:grid-cols-2">
            {BURGER_BAR_CONGRESS_CONTENT.businessOverview.map(([label, value]) => (
              <div key={label} className="border-t border-[rgba(11,31,51,.06)] pt-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">{label}</div>
                <p className="mt-1 text-[13px] leading-5 text-[#0B1F33]/72">{value}</p>
              </div>
            ))}
          </div>
        </DestinationSection>

        <DestinationSection title="Visibility Opportunities" support="Promote">
          <DetailBulletList items={BURGER_BAR_CONGRESS_CONTENT.visibilityOpportunities} />
        </DestinationSection>

        <DestinationSection title="Recommended Campaigns">
          <div className="space-y-3">
            {BURGER_BAR_CONGRESS_CONTENT.recommendedCampaigns.map(([title, description]) => (
              <div key={title} className="border-t border-[rgba(11,31,51,.06)] pt-3">
                <h4 className="text-[13px] font-semibold text-[#0B1F33]">{title}</h4>
                <p className="mt-1 text-[13px] leading-5 text-[#0B1F33]/68">{description}</p>
              </div>
            ))}
          </div>
        </DestinationSection>

        <DestinationSection title="Audience Alignment" support="Burger Bar Congress performs well with">
          <DetailBulletList items={BURGER_BAR_CONGRESS_CONTENT.audienceAlignment} />
        </DestinationSection>

        <DestinationSection title="Suggested Partner Insights" support="Track">
          <DetailBulletList items={BURGER_BAR_CONGRESS_CONTENT.partnerInsights} />
        </DestinationSection>

        <DestinationSection title="Downtown Perks Assessment">
          <p className="text-[13px] leading-6 text-[#0B1F33]/72">{BURGER_BAR_CONGRESS_CONTENT.assessment}</p>
        </DestinationSection>

        <InKindAppliedLayer place={place} mode={mode} />

        <DestinationSection title="Partner Actions">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to="/map?mode=partner&tab=campaigns" className="dp-panel-action dp-primary-action">Launch Campaign</Link>
            <Link to="/partner-workspace/perks" className="dp-panel-action">Create Resident Perk</Link>
            <Link to="/dashboard" className="dp-panel-action">View Performance</Link>
            <Link to="/partner-workspace/events" className="dp-panel-action">Promote Event Night Offer</Link>
          </div>
        </DestinationSection>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DestinationSection title={BURGER_BAR_CONGRESS_CONTENT.title} support={BURGER_BAR_CONGRESS_CONTENT.residentSubtitle}>
        <p className="text-[13px] leading-6 text-[#0B1F33]/72">{BURGER_BAR_CONGRESS_CONTENT.residentOverview}</p>
      </DestinationSection>

      <DestinationSection title="Why People Go">
        <DetailBulletList items={BURGER_BAR_CONGRESS_CONTENT.whyPeopleGo} />
      </DestinationSection>

      <DestinationSection title="What You'll Find">
        <DetailBulletList items={BURGER_BAR_CONGRESS_CONTENT.whatYouWillFind} />
      </DestinationSection>

      <NearbyImageRail
        place={place}
        places={places}
        onSelect={onSelect}
        mode={mode}
        title="Nearby"
        support="Real places from the Downtown Perks map registry around this spot."
      />

      <DestinationSection title="Downtown Perks Note">
        <p className="text-[13px] leading-6 text-[#0B1F33]/72">{BURGER_BAR_CONGRESS_CONTENT.residentNote}</p>
      </DestinationSection>

      <InKindAppliedLayer place={place} mode={mode} />

      <DestinationSection title="Primary Actions">
        <div className="grid gap-2 sm:grid-cols-3">
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">Get Directions</a>
          <button type="button" className="dp-panel-action" onClick={onSave}>{isSaved ? "Saved Place" : "Save Place"}</button>
          <button type="button" className="dp-panel-action" onClick={shareBurgerBar}>Share</button>
        </div>
      </DestinationSection>
    </div>
  );
}

function InKindDiningDetails({
  place,
  places = [],
  mode = "resident",
  savedIds,
  onSave,
  onSelect,
  answer,
  loading = false,
  onAsk,
  onCloseAnswer,
}) {
  if (!isInKindEntity(place)) return null;
  const isGeraldines = isGeraldinesEntity(place);
  const discoveryProfile = getInKindDiscoveryProfile(place);
  const nearbyRecommendations = getNearbyRecommendations({
    selectedEntity: place,
    entities: places,
    radiusMeters: 800,
    fallbackRadiusMeters: 1600,
    limit: 8,
    mode,
  });
  const nearbyRecommendationIds = new Set(nearbyRecommendations.slice(0, 4).map((item) => item.entity?.id).filter(Boolean));
  const relatedRecommendations = getRelatedRecommendations({
    selectedEntity: place,
    entities: places,
    excludeIds: Array.from(nearbyRecommendationIds),
    limit: 8,
    mode,
  });
  const relatedDiningCandidates = relatedRecommendations
    .map((item) => item.entity)
    .filter((candidate) => {
      const candidateText = `${candidate?.name || ""} ${candidate?.category || ""} ${candidate?.type || ""} ${candidate?.summary || ""}`.toLowerCase();
      const candidateKind = getDestinationKind(candidate);
      return isInKindEntity(candidate) || ["dining", "nightlife", "coffee", "event"].includes(candidateKind) || /\b(dining|restaurant|bar|cocktail|music|pizza|burger|coffee|inkind)\b/.test(candidateText);
    });
  const nearbyCards = [...nearbyRecommendations.map((item) => item.entity), ...relatedDiningCandidates, ...getInKindNearbyDining(place, places)]
    .filter((candidate) => {
      const candidateText = `${candidate?.id || ""} ${candidate?.name || ""} ${candidate?.title || ""} ${candidate?.category || ""} ${candidate?.type || ""} ${candidate?.summary || ""}`.toLowerCase();
      if (!candidate?.id || candidate.id === place?.id) return false;
      if (isGeraldines && isGeraldinesEntity(candidate)) return false;
      if (/\b(neighborhood story|story layer|narrative|district story|status)\b/.test(candidateText)) return false;
      return true;
    })
    .filter((candidate, index, list) => {
      const key = getRailDedupeKey(candidate);
      return key && list.findIndex((item) => getRailDedupeKey(item) === key) === index;
    })
    .slice(0, 4);
  const cuisine = String(place?.category || place?.raw?.category || "Dining").split("/")[0].trim() || "Dining";
  const neighborhood = place?.district || place?.neighborhood || "Downtown Austin";
  const placeName = place?.name || "this restaurant";
  const decisionTags = [...(discoveryProfile.goodFor || []), "Downtown Perks"].filter(Boolean).slice(0, 6);
  const menuUrl = getInKindMenuUrl(place);
  const prompts = ["How does it work?", "What's nearby?", "Worth going tonight?", "Similar spots?"];

  return (
    <div className="dp-inkind-editorial-panel" data-editorial-panel="inkind">
      <section className="dp-inkind-zone dp-inkind-story-zone" aria-label="Short venue story">
        <p className="dp-inkind-zone-meta">{cuisine} · {neighborhood}</p>
        <h3>{discoveryProfile.subtitle}</h3>
        <p>{discoveryProfile.story}</p>
      </section>

      <section className="dp-inkind-zone dp-inkind-perk-zone" aria-label="Downtown Perks benefit">
        <div className="dp-inkind-accent-copy">
          <span>Included with Downtown Perks</span>
          <h3>Your Downtown Perks Benefit</h3>
          <p>{discoveryProfile.benefit}</p>
          <div className="dp-inkind-perk-actions">
            <a href={getInKindActionUrl(place, "pay")} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">
              View Benefit
            </a>
            {menuUrl && (
              <a href={menuUrl} target="_blank" rel="noreferrer" className="dp-panel-action-text">
                View Menu
              </a>
            )}
          </div>
        </div>
      </section>

      <InKindAppliedLayer place={place} mode={mode} />

      <section className="dp-inkind-zone dp-inkind-experience-zone" aria-label="Why locals use it">
        <h3>Why residents go</h3>
        <p>{discoveryProfile.why}</p>
        <p className="dp-inkind-walkability">{discoveryProfile.localTip}</p>
        <div className="dp-inkind-tag-row" aria-label="Good for">
          {decisionTags.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="dp-inkind-time-grid" aria-label="What people love">
          <div>
            <span>What people love</span>
            <strong>{discoveryProfile.loves}</strong>
          </div>
          <div>
            <span>Nearby now</span>
            <strong>{discoveryProfile.nearbyContext}</strong>
          </div>
        </div>
      </section>

      {nearbyCards.length > 0 && (
        <section className="dp-inkind-zone dp-inkind-nearby-zone" aria-label="Nearby">
          <h3>Nearby</h3>
          <div className="dp-inkind-related-rail" aria-label="Nearby places">
            {nearbyCards.map((candidate) => {
              const nearbyItem = nearbyRecommendations.find((item) => item.entity?.id === candidate.id);
              const candidateKind = getNearbyKindLabel(candidate, getDestinationKind(candidate)).replace(/\s+nearby$/i, "");
              const meta = [candidateKind, candidate.district || "Downtown Austin", nearbyItem?.distanceLabel].filter(Boolean).join(" · ");
              return (
                <button
                  type="button"
                  key={candidate.id}
                  className="dp-inkind-related-card"
                  onClick={() => onSelect(candidate)}
                >
                  <img src={getLifestyleImage(candidate, mode)} alt="" loading="lazy" decoding="async" onError={handlePanelImageError} />
                  <span>{shortenEntityTitle(candidate.name || candidate.title)}</span>
                  <small>{meta}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {onAsk && (
        <section className="dp-inkind-zone dp-inkind-discovery-zone" aria-label="Ask the Map">
          <h3>Ask the Map</h3>
          <div className="dp-inkind-prompt-list">
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
                <button type="button" onClick={onCloseAnswer} aria-label="Close Downtown Perks answer">Close</button>
                <h4>{answer.title}</h4>
                <p>{answer.body}</p>
                {answer.picks?.length > 0 && (
                  <div className="dp-inkind-prompt-list">
                    {answer.picks.slice(0, 4).map((item) => (
                      <button key={item.id} type="button" onClick={() => onSelect(item)}>
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
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
  if (isRentalEntity(place)) return "rental";
  if (kind === "parking" || isParkingEntity(place)) return "parking";
  if (kind === "service" || isServiceEntity(place)) return "service";
  if (kind === "retail" || isRetailBrandEntity(place)) return "retail";
  if (kind === "perk" || kind === "brand-activation-perk" || text.includes("brand perk") || text.includes("resident perk")) return "perk";
  if (kind === "brand" || isBrandEntity(place) || text.includes("partnerType brands")) return "brand";
  if (text.includes("ev charging") || text.includes("charging") || text.includes("transit") || text.includes("mobility")) return "mobility";
  if (kind === "property" || isPropertyEntity(place) || isListingEntity(place)) return "property";
  if (isAntonesEntity(place)) return "venue";
  if (text.includes("wellness") || text.includes("bathhouse") || text.includes("sauna") || text.includes("cold plunge") || text.includes("massage") || text.includes("recovery")) return "wellness";
  if (kind === "event" || text.includes("event") || text.includes("rsvp")) return "event";
  if (text.includes("grocery") || text.includes("market") || text.includes("pantry")) return "grocery";
  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) return "coffee";
  if (hasVenueSignals(place) && (text.includes("live music") || text.includes("nightclub") || text.includes("music venue"))) return "venue";
  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("brewery") || text.includes("beer")) return "nightlife";
  if (text.includes("restaurant") || text.includes("dining") || text.includes("pizza") || text.includes("food")) return "dining";
  if (text.includes("hotel") || text.includes("hospitality")) return "hotel";
  if (text.includes("retail") || text.includes("store") || text.includes("shop")) return "retail";
  if (text.includes("civic") || text.includes("park") || text.includes("public")) return "civic";
  if (text.includes("brand") || text.includes("experience")) return "brand";
  return "place";
}

function isBrandLikePanelPlace(place) {
  const raw = place?.raw || {};
  const text = [
    place?.id,
    place?.name,
    place?.title,
    place?.type,
    place?.partnerType,
    place?.brand,
    place?.category,
    place?.category_key,
    raw.id,
    raw.name,
    raw.type,
    raw.partnerType,
    raw.brand,
    raw.category,
    raw.category_key,
  ].filter(Boolean).join(" ").toLowerCase();
  return /\b(brand|brands|brand_activation|sponsor|sponsorship|yeti|equinox|rivian|lululemon|tecovas)\b/.test(text);
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

  if (isRentalEntity(place)) {
    return truncatePanelCopy(
      cleanDisplayCopy(place?.description || place?.summary || place?.raw?.description || place?.raw?.summary) ||
        "A downtown rental with building details, nearby perks, and walkable context on the map.",
      120,
    );
  }

  if (mode === "partner") {
    const partnerCopy = {
      venue: "A live downtown venue people can save, visit, and build the rest of the night around.",
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
    return truncatePanelCopy(partnerCopy[kind] || partnerCopy.place, 90);
  }

  if (luxuryBuilding) {
    if (isSpringCondominiums(place)) {
      return truncatePanelCopy(SPRING_CONDOMINIUMS_PROFILE.why);
    }
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

  if (isAntonesEntity(place)) {
    return truncatePanelCopy("One of Austin's most recognized live music venues, with touring acts, local performances, and downtown nightlife.");
  }

  if (curatedSummary) return truncatePanelCopy(curatedSummary);
  if (summary) return truncatePanelCopy(summary);

  const byKind = {
    venue: "A live downtown venue people can save, visit, and build the rest of the night around.",
    grocery: "A useful downtown stop for quick essentials, coffee, wine, and errands without leaving the neighborhood.",
    coffee: "A good stop before work, between errands, or when you need somewhere nearby to reset. Useful for quick coffee, casual meetings, laptop time, and downtown routines.",
    nightlife: "A nearby place for after-work plans, late-night stops, live music, or drinks with friends. Useful when the plan is forming now and people want somewhere easy to get to.",
    dining: "More than a place to eat. This spot sits close to downtown homes, hotels, offices, and events — useful for lunch, dinner, happy hour, or a plan that does not need much planning.",
    hotel: "A downtown stay with nearby dining, events, coffee, and places worth saving before or after check-in. Useful for guests looking for what to do nearby without overplanning.",
    property: "More than a place to live. This building places residents close to coffee before work, dinner without driving, a walk near the lake, and events without planning ahead.",
    event: "Something happening nearby that gives people a reason to go out, meet up, or stay downtown a little longer.",
    retail: "A useful downtown stop for errands, shopping, appointments, or something you need nearby. Good when you want to handle something without leaving the neighborhood.",
    civic: "A public place that helps downtown feel more usable. Good for walks, events, meeting up, taking a break, or building a simple plan around what is nearby.",
    brand: "A local brand moment connected to downtown culture, useful stops, limited offers, and nearby plans.",
    place: DISTRICT_CONTEXT[district] || "A useful downtown place with context, directions, and next steps.",
  };
  return truncatePanelCopy(byKind[kind] || byKind.place);
}

function getWhyGoChips(place) {
  const kind = getDestinationKind(place);
  if (isAntonesEntity(place)) return ["Live Music", "Nightlife", "Upcoming Events", "Save for Later"];
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding || getResolvedLegendsListing(place)) return ["Listings", "Tours", "Perks nearby", "Neighborhood context"];
  const byKind = {
    grocery: ["Coffee", "Breakfast", "Wine", "Quick Stop"],
    coffee: ["Coffee", "Breakfast", "Work Break", "Walkable"],
    nightlife: ["Drinks", "Patio", "Night Out", "Friends"],
    dining: ["Dinner", "Groups", "Walkable", "Perk"],
    hotel: ["Guests", "Lobby", "Dining", "Downtown Base"],
    property: ["Listings", "Tours", "Perks nearby", "Neighborhood context"],
    event: ["Tonight", "RSVP", "Friends", "Nearby"],
    retail: ["Shopping", "Errands", "Appointments", "Perk"],
    civic: ["Art", "Parks", "Tour", "Downtown"],
    brand: ["Experience", "Try It", "Limited", "Nearby"],
    place: ["Nearby", "Useful", "Save", "Walkable"],
  };
  return byKind[kind] || byKind.place;
}

function getWhyGoSectionTitle(place) {
  if (getDestinationKind(place) === "property") return "Why Go";
  if (getLuxuryPresenceBuilding(place) || getResolvedLegendsListing(place)) return "Next Steps";
  return "Why Go";
}

function getEntityAssistantPrompts(place, mode) {
  const contentPrompts = resolveEntityPanelContent(place, mode).askPrompts;
  if (contentPrompts?.length) return contentPrompts;
  if (mode === "partner") return ["Who comes here?", "What else is nearby?", "Best time to visit?", "What's happening tonight?"];
  if (getLuxuryPresenceBuilding(place)) {
    return ["What is nearby?", "Tour plan", "Daily routine", "Ask Legends"];
  }
  if (getResolvedLegendsListing(place)) {
    return ["Listing details", "Nearby places", "Tour plan", "Ask Legends"];
  }
  return ["Who comes here?", "What else is nearby?", "Best time to visit?", "What's happening tonight?"];
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

function normalizeRailDedupeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(austin|downtown|restaurant|restaurants|bar|coffee|cafe|pizza|pizzeria|grill|kitchen|location|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getEntityIdentityKeys(item) {
  const source = item?.entity || item?.candidate || item?.place || item;
  if (!source) return [];
  const raw = source.raw || {};
  const values = [
    source.id,
    raw.id,
    source.listingId,
    raw.listingId,
    raw.listing_id,
    source.slug,
    raw.slug,
    source.parentId,
    raw.parentId,
    raw.parent_id,
  ];
  return values.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
}

function getRailDedupeKey(item) {
  const source = item?.entity || item?.candidate || item?.place || item;
  const raw = source?.raw || {};
  const rawName = source?.name || source?.title || source?.label || item?.title || item?.label || item?.value || source;
  const name = normalizeRailDedupeText(rawName);
  const combined = normalizeRailDedupeText([
    rawName,
    source?.brand,
    raw.brand,
    source?.parentId,
    raw.parentId,
    raw.parent_id,
    source?.category,
    raw.category,
  ].filter(Boolean).join(" "));
  if (!name) return "";
  if (/\btopo\s+chico\b/.test(combined)) return "brand-perk:topo-chico";
  if (/\binspired\s+closets?\b/.test(combined)) return "brand-perk:inspired-closets";
  if (/\b1\s*hotel\b/.test(name)) return "place:1-hotel";
  if (/\bvia\s*313\b/.test(name) || /\bvia313\b/.test(name)) return "place:via-313";
  if (/\bbangers?\b/.test(name)) return "place:bangers";
  if (/\blustre\s+pearl\b/.test(name)) return "place:lustre-pearl";
  if (/\bhotel\s+van\s+zandt\b/.test(name)) return "place:hotel-van-zandt";
  return name;
}

function getRelatedPlaceDedupeKeys(item) {
  const source = item?.entity || item?.candidate || item?.place || item;
  if (!source) return [];
  const name = normalizeRailDedupeText(source.name || source.title || source.label || item?.title || item?.label || "");
  if (!name) return [];
  const address = normalizeRailDedupeText(source.address || source.raw?.address || "");
  const district = normalizeRailDedupeText(source.district || source.neighborhood || source.raw?.district || "");
  const keys = getEntityIdentityKeys(source).map((key) => `id:${key}`);
  if (source.id) keys.push(`id:${source.id}`);
  if (/\b1\s*hotel\b/.test(name)) keys.push("place:1-hotel");
  if (address) keys.push(`name-address:${name}:${address}`);
  if (district) keys.push(`name-district:${name}:${district}`);
  keys.push(`name:${name}`);
  return keys;
}

function dedupeRelatedPlaces(items = [], currentPlace = null, limit = Infinity) {
  const seen = new Set(getRelatedPlaceDedupeKeys(currentPlace));
  const output = [];

  for (const item of items) {
    const keys = getRelatedPlaceDedupeKeys(item);
    if (!keys.length || keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

function dedupeRailItems(items = [], currentPlace = null, limit = Infinity) {
  const currentKey = getRailDedupeKey(currentPlace);
  const seen = new Set(currentKey ? [currentKey] : []);
  getEntityIdentityKeys(currentPlace).forEach((key) => seen.add(`id:${key}`));
  const output = [];

  for (const item of items) {
    const key = getRailDedupeKey(item);
    const identityKeys = getEntityIdentityKeys(item).map((value) => `id:${value}`);
    if (!key || seen.has(key) || identityKeys.some((identityKey) => seen.has(identityKey))) continue;
    seen.add(key);
    identityKeys.forEach((identityKey) => seen.add(identityKey));
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

function isRoyalBlueGroceryPlace(place) {
  return /\broyal\s+blue\s+grocery\b/i.test([place?.id, place?.name, place?.address, place?.raw?.name].filter(Boolean).join(" "));
}

function getNearbyAreaPlaces(place, places = [], limit = 4) {
  const nearby = getNearbyRecommendations({
    selectedEntity: place,
    entities: places,
    radiusMeters: 800,
    fallbackRadiusMeters: 1600,
    limit: Math.max(limit * 2, 6),
    mode: "resident",
  })
    .filter((item) => getDestinationKind(item.entity) !== "property")
    .map((item) => {
      const candidateKind = getDestinationKind(item.entity);
      const perk = getResidentPerkDetails(item.entity);
      const hasPerk = hasActivePerkData(item.entity);
      return {
        candidate: item.entity,
        distance: item.distanceMeters,
        distanceLabel: item.distanceLabel,
        score: item.relevanceScore,
        candidateKind,
        perk,
        hasPerk,
      };
    });
  return dedupeRailItems(nearby, place, limit);
}

function getNearbyKindLabel(candidate, candidateKind) {
  const text = placeText(candidate);
  if (isPerkLikeEntity(candidate)) return "Perk";
  if (isBrandLikeEntity(candidate)) return "Brand";
  if (isServiceLikeEntity(candidate)) return "Service";
  if (isHotelEntity(candidate)) return "Hotel nearby";
  if (candidateKind === "coffee") return "Coffee nearby";
  if (candidateKind === "grocery") return "Grocery nearby";
  if (candidateKind === "hotel") return "Hotel experiences nearby";
  if (candidateKind === "event") return "Events nearby";
  if (candidateKind === "property") return "Building nearby";
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

function isPerkLikeEntity(candidate) {
  const raw = candidate?.raw || {};
  const text = placeText(candidate);
  return Boolean(
    hasActivePerkData(candidate) ||
    raw.perk ||
    candidate?.perk ||
    /(^|\b)(perk|offer|resident\s+benefit|resident\s+value|redemption)(\b|$)/i.test(text)
  );
}

function isBrandLikeEntity(candidate) {
  const raw = candidate?.raw || {};
  const text = [
    candidate?.type,
    candidate?.kind,
    candidate?.partnerType,
    candidate?.category,
    candidate?.category_key,
    raw.type,
    raw.kind,
    raw.partnerType,
    raw.category,
    raw.category_key,
    candidate?.brand,
    raw.brand,
  ].filter(Boolean).join(" ");
  return /\b(brand|brands|campaign\s+brand|sponsor)\b/i.test(text) && !isPerkLikeEntity(candidate);
}

function isServiceLikeEntity(candidate) {
  const raw = candidate?.raw || {};
  const text = [
    candidate?.type,
    candidate?.kind,
    candidate?.category,
    candidate?.category_key,
    raw.type,
    raw.kind,
    raw.category,
    raw.category_key,
  ].filter(Boolean).join(" ");
  return /\b(service|services|home\s+organization|storage|consult)\b/i.test(text) && !isPerkLikeEntity(candidate);
}

function getNearbyRailCategory(candidate, candidateKind = getDestinationKind(candidate)) {
  const text = placeText(candidate);
  if (candidateKind === "dining" || isInKindEntity(candidate)) return "Dining";
  if (candidateKind === "event" || isEventEntity(candidate)) {
    return /\b(perk|card\s+perk|resident\s+benefit|offer)\b/i.test(text) ? "Perk" : "Event";
  }
  if (isPerkLikeEntity(candidate)) return "Perk";
  if (isBrandLikeEntity(candidate)) return "Brand";
  if (isServiceLikeEntity(candidate)) return "Service";
  if (isHotelEntity(candidate) || candidateKind === "hotel") return "Hotel";
  if (candidateKind === "coffee") return "Coffee";
  if (candidateKind === "grocery") return "Grocery";
  if (candidateKind === "event") return "Event";
  if (candidateKind === "property") return "Building";
  if (candidateKind === "nightlife") return "Drinks";
  if (candidateKind === "dining") return "Dining";
  if (candidateKind === "retail") return "Retail";
  if (candidateKind === "civic") return "Civic";
  return "Nearby";
}

function isResidentialRailListing(candidate) {
  const raw = candidate?.raw || {};
  const text = [
    candidate?.id,
    candidate?.name,
    candidate?.title,
    candidate?.address,
    candidate?.category,
    candidate?.category_key,
    candidate?.type,
    candidate?.partnerType,
    raw.id,
    raw.name,
    raw.title,
    raw.address,
    raw.category,
    raw.category_key,
    raw.type,
    raw.partnerType,
  ].filter(Boolean).join(" ");
  return (
    /#\s*[A-Za-z0-9-]+/.test(text) ||
    /\b(unit|condo|condominium|residence|residences|apartment|apartments|penthouse|listing|mls)\b/i.test(text) ||
    /\b(the\s+austonian|waterline|the\s+shore|paseo|360\s+condos|spring\s+condominiums|w\s+residences)\b/i.test(text)
  );
}

function getNearbyContextItems(place, places = []) {
  const district = String(place?.district || "Downtown Austin").replace(/\s+District$/i, "");
  const kind = getDestinationKind(place);
  const raw = place?.raw || {};
  if (/\byeti\b/i.test(`${place?.id || ""} ${place?.name || ""} ${place?.brand || ""} ${raw.id || ""} ${raw.name || ""} ${raw.brand || ""}`)) {
    return [
      { label: "Ann & Roy Butler Trail Access", value: "Trail access near the lake" },
      { label: "Rainey Street", value: "Drinks, dining, and live energy nearby" },
      { label: "Congress Avenue Bridge", value: "Downtown landmark and evening walk" },
      { label: "Waterfront restaurants", value: "Dinner and drinks by Lady Bird Lake" },
    ];
  }
  if (isRoyalBlueGroceryPlace(place)) {
    return [
      { label: "Lady Bird Lake", value: "Ann and Roy Butler Trail" },
      { label: "Rainey Street", value: "Lady Bird Lake" },
      { label: "Congress Avenue Bridge", value: "Lady Bird Lake" },
      { label: "Waterfront restaurants", value: "Lady Bird Lake" },
    ];
  }
  const curatedNearby = getCuratedArray(raw.nearby || raw.nearbyPlaces || raw.nearby_places || place?.nearby);
  if (curatedNearby.length) {
    return dedupeRailItems(curatedNearby.map((label) => ({ label, value: district })), place, 4);
  }
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    const nearbyItems = getNearbyAreaItems(place, places);
    if (nearbyItems.length) return nearbyItems;
    return dedupeRailItems([
      { label: "Trader Joe's", value: "Grocery nearby · Seaholm" },
      { label: "Merit Coffee", value: "Coffee nearby · Seaholm" },
      { label: "Whole Foods", value: "Grocery nearby · Downtown Core" },
      { label: "Ruiz Salon", value: "Wellness nearby · Seaholm" },
    ], place, 4);
  }
  const legendsListing = getResolvedLegendsListing(place);
  if (legendsListing) {
    const nearbyItems = getNearbyAreaItems(place, places);
    if (nearbyItems.length) return nearbyItems;
    return dedupeRailItems([
      { label: "Austin Proper Hotel", value: "Hotel experiences nearby · 2nd Street" },
      { label: "ACL Live", value: "Music venue nearby · 2nd Street" },
      { label: "Royal Blue Grocery", value: "Grocery nearby · Resident grocery discount" },
    ], place, 3);
  }
  if (kind === "property") {
    const nearbyItems = getNearbyAreaItems(place, places);
    return nearbyItems.length ? nearbyItems : [`In ${district}`, "Contact the listing team for current availability", "Compare building context from the map"];
  }
  if (kind === "grocery") {
    return [
      { label: "Quick errands", value: district },
      { label: "Nearby lunch plans", value: district },
      { label: "Downtown essentials", value: district },
      { label: "Coffee stops", value: district },
    ];
  }
  const nearbyFallbacks = DISTRICT_NEARBY_FALLBACKS[district] || DISTRICT_NEARBY_FALLBACKS["Downtown Austin"];
  return dedupeRailItems(nearbyFallbacks.map((label) => ({ label, value: district })), place, 4);
}

function getContextSectionTitle(place) {
  return resolveEntityPanelArchetype(place).nearbyTitle;
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
  const pickedPlaces = dedupeRailItems(localResults.filter((place) => place?.id && place.id !== selected?.id), selected, 4);
  const legendsListing = getResolvedLegendsListing(selected);
  const luxuryBuilding = getLuxuryPresenceBuilding(selected);

  if (mode === "partner") {
    return buildAgenticMapAnswer(prompt, [selected, ...pickedPlaces], mode, selected?.district || "Downtown Austin", getAskMapCategoryHint(selected, "activity"));
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

  return buildAgenticMapAnswer(prompt, [selected, ...pickedPlaces], mode, selected?.district || "Downtown Austin", getAskMapCategoryHint(selected));
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
    property: ["property"],
    place: ["place", "dining", "coffee", "retail"],
  };
  const allowedKinds = compatibleKinds[kind] || compatibleKinds.place;
  const related = places
    .filter((candidate) => candidate?.id !== place?.id)
    .filter((candidate) => {
      if (kind === "property") return true;
      const isResidentialListing = Boolean(getResolvedLegendsListing(candidate) || getLuxuryPresenceBuilding(candidate) || isLegendsListingLike(candidate));
      return !isResidentialListing;
    })
    .map((candidate) => {
      const candidateKind = getDestinationKind(candidate);
      const candidateText = [
        candidate?.name,
        candidate?.category,
        candidate?.category_key,
        candidate?.type,
        candidate?.partnerType,
        candidate?.summary,
        candidate?.address,
      ].filter(Boolean).join(" ").toLowerCase();
      let score = 0;
      if (kind === "property" && candidateKind !== "property") score -= 10;
      if (kind === "property" && /\b(hotel|aloft|inn|suites|hospitality|guest|stay)\b/.test(candidateText)) score -= 10;
      if (candidateKind === kind) score += 4;
      else if (allowedKinds.includes(candidateKind)) score += 3;
      if (candidate.district && candidate.district === district) score += 1;
      if (hasActivePerkData(candidate)) score += 1;
      if (kind !== "property" && candidateKind === "property") score -= 5;
      return { candidate, score };
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score || String(a.candidate.name).localeCompare(String(b.candidate.name)))
    .map((item) => item.candidate);
  return dedupeRelatedPlaces(related, place, 6);
}

function getV4DestinationSectionTitle(title = "") {
  const normalized = String(title || "").trim().toLowerCase();
  if (["why it matters", "why go", "why go here", "overview", "description", "information"].includes(normalized)) {
    return "Why this matters";
  }
  if (["nearby recommendations", "other inkind locations nearby", "next stops", "next nearby"].includes(normalized)) {
    return "Nearby";
  }
  if (["ask about this", "ask downtown perks", "discovery"].includes(normalized)) {
    return "Ask the map";
  }
  if (["details", "listing details", "event details", "property details"].includes(normalized)) {
    return "Quick facts";
  }
  return title;
}

function DestinationSection({ title, children, className = "", support = "" }) {
  const displayTitle = getV4DestinationSectionTitle(title);
  return (
    <section className={`dp-destination-section ${className}`}>
      <h3>{displayTitle}</h3>
      {support && <p className="dp-destination-section-support">{support}</p>}
      {children}
    </section>
  );
}

function DestinationHero({ place, mode }) {
  const image = getLifestyleImage(place, mode);
  const isProperty = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place) || isLegendsListingLike(place));
  if (!isProperty) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="dp-panel-detail-hero dp-destination-hero"
      >
        <figure className="dp-destination-media dp-destination-hero-media">
          <img
            src={image}
            alt={place.name}
            onError={handlePanelImageError}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 768px) 430px, 100vw"
            style={{ objectPosition: getPanelImageObjectPosition(place) }}
          />
        </figure>
      </motion.section>
    );
  }
  return (
    <motion.section
      initial={{ scale: 1.04 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="dp-polished-panel dp-destination-hero"
    >
      <figure className="dp-polished-panel-hero dp-destination-hero-media">
        <img
          src={image}
          alt={place.name}
          onError={handlePanelImageError}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 768px) 430px, 100vw"
          style={{ objectPosition: getPanelImageObjectPosition(place) }}
        />
      </figure>
    </motion.section>
  );
}

function getDestinationLocationLine(place) {
  const district = getDestinationDistrictLabel(place);
  const rawAddress = String(place?.address || place?.raw?.address || "").replace(/,\s*(Austin|TX|78701).*$/i, "").trim();
  if (rawAddress && !/downtown austin/i.test(rawAddress)) return `${district} · ${rawAddress}`;
  return district;
}

function PanelContext({ place, mode }) {
  const isProperty = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place) || isLegendsListingLike(place));
  const panelContent = resolveEntityPanelContent(place, mode);
  const insightText = String(panelContent.insight || "").trim();
  const showPanelInsight = Boolean(insightText) && !/\b(decision fatigue|ad dropped onto a map)\b/i.test(insightText);
  if (isBatheEntity(place)) {
    return (
      <DestinationSection title="Why it matters" className="dp-property-opening-section dp-property-narrative-section">
        <p className="dp-why-people-go">BATHE gives residents and visitors a way to slow down, reset, and reconnect without leaving downtown. It fits naturally into weekend plans, recovery days, and wellness-focused routines.</p>
      </DestinationSection>
    );
  }
  if (isSpringCondominiums(place)) {
    return (
      <DestinationSection title="Why it matters" className="dp-property-opening-section dp-property-narrative-section">
        <p className="dp-why-people-go">{SPRING_CONDOMINIUMS_PROFILE.why}</p>
      </DestinationSection>
    );
  }
  if (isFrostTowerEntity(place)) {
    return (
      <DestinationSection title="Why this workplace matters" className="dp-property-opening-section dp-property-narrative-section">
        <div className="dp-drawer-meta-line">Premium Workplace · Congress Avenue</div>
        <p className="dp-why-people-go">Frost Tower is one of downtown Austin's primary commercial destinations, connecting office workers, visitors, residents, hospitality, dining, wellness, and professional services in a walkable district.</p>
        <p className="dp-destination-section-note">Downtown Perks treats Frost Tower as a district activation partner, not a residential building or a simple discount pin.</p>
      </DestinationSection>
    );
  }
  if (isProperty) {
    if (mode === "partner") {
      return (
        <DestinationSection title={panelContent.whyHeading || "Why this matters"} className="dp-property-opening-section dp-property-narrative-section">
          <p className="dp-why-people-go">{panelContent.whyBody}</p>
          <div className="dp-neighborhood-narrative" aria-label="Partner location intelligence">
            <p><strong>Why it matters</strong></p>
            <p>{panelContent.insight || "The best next steps happen when someone is already nearby and choosing where to go."}</p>
            <p><strong>Next move</strong></p>
            <p>Connect offers, events, and useful places to what people can reach within a short walk.</p>
          </div>
        </DestinationSection>
      );
    }
    return (
      <DestinationSection title={panelContent.whyHeading || "Why living here works"} className="dp-property-opening-section dp-property-narrative-section">
        <div className="dp-drawer-meta-line">Property · {place?.district || "Downtown Austin"}</div>
        <p className="dp-why-people-go">{panelContent.whyBody}</p>
        <div className="dp-neighborhood-narrative" aria-label="Neighborhood narrative">
          <p>{panelContent.insight || "The surrounding routine is what makes the address feel livable."}</p>
        </div>
      </DestinationSection>
    );
  }

  return (
    <DestinationSection title={panelContent.whyHeading || "Why this matters"} className="dp-property-opening-section dp-property-narrative-section">
      <p className="dp-why-people-go">{panelContent.whyBody || getPanelContextSentence(place, mode)}</p>
      {showPanelInsight && (
        <p className="dp-destination-section-note">{insightText}</p>
      )}
    </DestinationSection>
  );
}

function getWhyGoActionPrompt(chip, place) {
  const name = place?.name || "this listing";
  const byChip = {
    "Available Listings": `Show the active listing details for ${name}, including price, beds, baths, square footage, and the best next step.`,
    "Private Tour": `Help me plan a private tour for ${name}. Include what to ask Legends and what nearby places matter before or after the showing.`,
    "Listing Details": `Summarize the actual listing details for ${name}: price, beds, baths, square footage, MLS details, and what makes the location useful.`,
    "Schedule Tour": `Help me request a private tour for ${name} and explain what I should ask Legends before seeing it.`,
    "Perks Nearby": `Show nearby restaurants, perks, and useful places around ${name} that matter for daily life.`,
    "Want To Live Here": `What should I know if I want to live at ${name}?`,
    "Ask Legends": `What should I ask Legends Real Estate about ${name}?`,
    "Contact Legends": `What should I include when contacting Legends Real Estate about ${name}?`,
  };
  return byChip[chip] || `${chip} for ${name}`;
}

function WhyGoChips({ place, onAsk }) {
  return (
    <DestinationSection title={getWhyGoSectionTitle(place)}>
      <div className="dp-destination-chip-row">
        {getWhyGoChips(place).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
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

function KnownForSection() {
  return null;
}

function getRentalListingData(place) {
  const rental = place?.raw?.rentalListing || place?.rentalListing || {};
  return {
    status: rental.status || place?.status || "active",
    priceLabel: rental.priceLabel || place?.priceLabel || (rental.price ? `$${Number(rental.price).toLocaleString()}` : ""),
    beds: rental.beds ?? place?.beds,
    baths: rental.baths ?? place?.baths,
    sqft: rental.sqft ?? place?.sqft,
    address: rental.address || place?.address || "",
    building: rental.building || place?.building || place?.name || "",
    unit: rental.unit || place?.unit || "",
    mls: rental.mls || place?.mls || "",
    neighborhood: rental.neighborhood || place?.district || "",
    description: rental.description || place?.description || place?.summary || "",
    highlights: rental.highlights || place?.raw?.highlights || [],
    amenities: rental.amenities || place?.raw?.amenities || [],
    nearbyPerks: rental.nearbyPerks || place?.raw?.nearbyPerks || [],
  };
}

function formatLegendsRentPrice(priceLabel = "") {
  const text = String(priceLabel || "").trim();
  if (!text) return "Price available";
  if (/\/mo\b/i.test(text)) return text;
  return `${text}/mo`;
}

function stripListingUnitFromAddress(address = "", unit = "") {
  const text = String(address || "").replace(/,\s*Austin,\s*TX\s*\d{5}.*/i, "").trim();
  const unitText = String(unit || "").trim();
  if (!unitText) return text;
  return text
    .replace(new RegExp(`\\s+#?${unitText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "")
    .replace(/\s+#\s*$/i, "")
    .trim();
}

function getLegendsDirectoryRowCopy(place) {
  if (isRentalEntity(place)) {
    const listing = getRentalListingData(place);
    const facts = [
      listing.beds !== undefined ? `${listing.beds} bd` : "",
      listing.baths !== undefined ? `${listing.baths} ba` : "",
      listing.sqft ? `${Number(listing.sqft).toLocaleString()} sqft` : "",
      listing.mls ? `MLS ${listing.mls}` : "",
    ].filter(Boolean).join(" · ");
    return {
      meta: `${String(listing.status || "Active").replace(/^./, (letter) => letter.toUpperCase())} · ${formatLegendsRentPrice(listing.priceLabel)}`,
      title: `${listing.building}${listing.unit ? ` #${listing.unit}` : ""}`,
      address: `${stripListingUnitFromAddress(listing.address, listing.unit)} · ${listing.neighborhood || "Downtown Austin"}`,
      details: facts || "Rental and showing context",
    };
  }

  const listing = getResolvedLegendsListing(place);
  const profile = getLegendsResidentialProfileForPlace(place);
  const facts = listing ? getListingFactLine(listing) : "";
  return {
    meta: "Legends Real Estate",
    title: place?.name || profile?.buildingName || listing?.address || "Downtown residence",
    address: place?.address || profile?.neighborhood || place?.district || "Downtown Austin",
    details: facts || "Listing interest with walkable context",
  };
}

function MapPanelButton({
  action,
  label,
  ariaLabel,
  variant = "secondary",
  size = "md",
  disabled = false,
  onPress,
  children,
  className = "",
}) {
  const appVariant = variant === "primary" ? "primary" : "secondary";
  const appSize = variant === "icon" ? "icon" : size === "sm" ? "sm" : "md";

  return (
    <AppButton
      variant={appVariant}
      size={appSize}
      className={`dp-map-panel-button dp-map-panel-button--${variant} dp-map-panel-button--${size} ${className}`.trim()}
      data-action={action}
      aria-label={ariaLabel || label}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) onPress?.();
      }}
    >
      {children || label}
    </AppButton>
  );
}

function MapSheet({ variant, ariaLabel, onClose, onBack, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`dp-map-sheet dp-map-sheet--${variant} ${className}`.trim()}
      data-variant={variant}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-has-close={Boolean(onClose)}
      data-has-back={Boolean(onBack)}
    >
      {children}
    </motion.section>
  );
}

function MapSheetToolbar({ eyebrow, onBack, onClose }) {
  return (
    <div className="dp-map-sheet-toolbar">
      <MapPanelButton action="back" label="Back" ariaLabel="Return to map" variant="icon" onPress={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </MapPanelButton>
      <span className="dp-map-sheet-toolbar-title">{eyebrow}</span>
      <MapPanelButton action="close" label="Close" ariaLabel="Close panel" variant="icon" onPress={onClose}>
        <X className="h-4 w-4" aria-hidden="true" />
      </MapPanelButton>
    </div>
  );
}

function MapPanelMatrix({ label, children }) {
  return (
    <section className="dp-map-panel-section" aria-label={label}>
      <p className="dp-map-panel-section-label">{label}</p>
      <h3 className="dp-map-panel-section-title">Active resident access</h3>
      <div className="dp-map-panel-matrix">{children}</div>
    </section>
  );
}

function MapPanelMatrixRow({ label, value }) {
  return (
    <span className="dp-map-panel-matrix-row">
      <strong>{label}</strong>
      <em>{value}</em>
    </span>
  );
}

function InteractiveMatrix({
  title,
  eyebrow,
  description,
  items = [],
  initialSelectedId = "",
  onAction,
  className = "",
}) {
  const firstItemId = items[0]?.id || "";
  const [selectedId, setSelectedId] = useState(initialSelectedId || firstItemId);
  const previousInitialSelectedId = useRef(initialSelectedId);
  useEffect(() => {
    if (initialSelectedId === previousInitialSelectedId.current) return;
    previousInitialSelectedId.current = initialSelectedId;
    const nextSelectedId = items.some((item) => item.id === initialSelectedId) ? initialSelectedId : firstItemId;
    if (nextSelectedId) setSelectedId(nextSelectedId);
  }, [firstItemId, initialSelectedId, items]);
  const selectedItem = items.find((item) => item.id === selectedId) || items[0] || null;

  if (!items.length) {
    return (
      <section className={`dp-interactive-matrix ${className}`.trim()}>
        {eyebrow && <p className="dp-interactive-matrix-eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
        {description && <p className="dp-interactive-matrix-copy">{description}</p>}
        <div className="dp-matrix-empty-state">Nothing to show yet.</div>
      </section>
    );
  }

  const handleAction = (action, item = selectedItem) => {
    if (!action || !item) return;
    onAction?.(action, item);
  };

  return (
    <section className={`dp-interactive-matrix ${className}`.trim()} aria-label={title}>
      <div className="dp-interactive-matrix-header">
        {eyebrow && <p className="dp-interactive-matrix-eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
        {description && <p className="dp-interactive-matrix-copy">{description}</p>}
      </div>
      <div className="dp-matrix-layout">
        <div className="dp-matrix-selector-rail" role="tablist" aria-label={`${title} options`}>
          {items.map((item) => {
            const active = item.id === selectedItem?.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? "is-active" : ""}
                onClick={() => setSelectedId(item.id)}
              >
                <span>{item.label || item.title}</span>
                {item.status && <small>{item.status}</small>}
              </button>
            );
          })}
        </div>

        <div className="dp-matrix-detail-panel" role="tabpanel" aria-live="polite">
          {selectedItem.eyebrow && <p className="dp-interactive-matrix-eyebrow">{selectedItem.eyebrow}</p>}
          <h4>{selectedItem.title}</h4>
          {selectedItem.meta?.length ? (
            <div className="dp-matrix-meta-row">
              {selectedItem.meta.slice(0, 4).map((meta) => <span key={meta}>{meta}</span>)}
            </div>
          ) : null}
          <p>{selectedItem.description}</p>
          <div className="dp-matrix-action-row">
            {selectedItem.primaryAction && (
              <button type="button" className="dp-matrix-action-primary" onClick={() => handleAction(selectedItem.primaryAction)}>
                {selectedItem.primaryAction.label}
              </button>
            )}
            {selectedItem.secondaryActions?.slice(0, 3).map((action) => (
              <button key={action.label} type="button" onClick={() => handleAction(action)}>
                {action.label}
              </button>
            ))}
          </div>
          {!!selectedItem.relatedItems?.length && (
            <div className="dp-matrix-related-rail" aria-label={`${selectedItem.title} related items`}>
              {selectedItem.relatedItems.slice(0, 4).map((related) => (
                <button key={related.id} type="button" onClick={() => handleAction({ action: "open-related", relatedId: related.id }, selectedItem)}>
                  {related.imageUrl && <img src={related.imageUrl} alt="" loading="lazy" />}
                  <span>
                    <strong>{related.title}</strong>
                    <small>{related.type}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const RESIDENT_BOTTOM_TABS = [
  { id: "map", label: "Map", icon: MapPin },
  { id: "perks", label: "Perks", icon: TicketPercent },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "info", label: "Info", icon: Info },
];

const PARTNER_BOTTOM_TABS = [
  { id: "map", label: "Map", icon: MapPin },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "reports", label: "Reports", icon: TrendingUp },
  { id: "info", label: "Info", icon: Info },
];

function MapBottomNav({ mode, activeTab, activeFilter, urlTab, contextCount = 0, onResidentTabChange, onPartnerTabChange }) {
  const tabs = mode === "partner" ? PARTNER_BOTTOM_TABS : RESIDENT_BOTTOM_TABS;
  return (
    <div className="dp-map-bottom-nav-shell pointer-events-auto">
      <nav className="dp-map-bottom-nav" aria-label="Map bottom navigation" style={{ "--dp-bottom-nav-count": tabs.length }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mode === "resident"
            ? (urlTab === "map" && activeTab === tab.id && (tab.id !== "map" || activeFilter === "All"))
            : urlTab === "map" && activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              data-active={active}
              aria-label={`Open ${tab.label}`}
              onClick={() => (mode === "partner" ? onPartnerTabChange(tab.id) : onResidentTabChange(tab.id))}
            >
              <Icon aria-hidden="true" />
              <span>{tab.label}</span>
              {mode === "partner" && tab.id === "activity" && contextCount > 0 ? (
                <span aria-hidden="true" className="dp-nav-activity-badge">{Math.min(contextCount, 9)}</span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function LegendsRentalResultRow({ place, selected = false, onSelect }) {
  const row = getLegendsDirectoryRowCopy(place);

  return (
    <button
      type="button"
      className="dp-legends-result-row"
      data-action="select"
      data-selected={selected ? "true" : "false"}
      onClick={onSelect}
      aria-label={`View ${row.title}`}
    >
      <span className="dp-legends-result-pin" aria-hidden="true">
        <PinBadge place={place} selected={selected} size="sm" />
      </span>
      <span className="min-w-0">
        <span className="dp-legends-result-meta">
          {row.meta}
        </span>
        <span className="dp-legends-result-title">{row.title}</span>
        <span className="dp-legends-result-address">{row.address}</span>
        <span className="dp-legends-result-details">{row.details}</span>
      </span>
      <span className="dp-legends-result-action">View</span>
    </button>
  );
}

function RentalListingDetails({ place }) {
  const rental = getRentalListingData(place);
  const facts = [
    rental.beds !== undefined ? `${rental.beds} bd` : "",
    rental.baths !== undefined ? `${rental.baths} ba` : "",
    rental.sqft ? `${Number(rental.sqft).toLocaleString()} sqft` : "",
  ].filter(Boolean).join(" · ");
  const rows = [
    ["Status", String(rental.status).replace(/\b\w/g, (letter) => letter.toUpperCase())],
    ["Price", rental.priceLabel],
    ["Beds / Baths / Sqft", facts],
    ["Building", rental.building],
    ["Unit", rental.unit],
    ["Address", rental.address],
    ["Neighborhood", rental.neighborhood],
    ["MLS", rental.mls],
  ].filter(([, value]) => value);
  return (
    <DestinationSection title="Listing Details" className="dp-rental-details">
      <div className="dp-rental-detail-list">
        {rows.map(([label, value]) => (
          <div className="dp-rental-detail-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {rental.description && <p className="dp-destination-section-copy">{rental.description}</p>}
      <div className="dp-rental-detail-columns">
        <article>
          <strong>Perks nearby</strong>
          {(rental.nearbyPerks.length ? rental.nearbyPerks : rental.highlights).slice(0, 4).map((item) => <span key={item}>{item}</span>)}
        </article>
        <article>
          <strong>Amenity system</strong>
          {rental.amenities.slice(0, 5).map((item) => <span key={item}>{item}</span>)}
        </article>
      </div>
    </DestinationSection>
  );
}

function getNearbyCardEntityTitle(entity) {
  return shortenEntityTitle(entity?.name || entity?.title || entity?.raw?.name || entity?.raw?.title || "Nearby place");
}

function getNearbyCardMeta(entity, recommendation = null, mode = "resident") {
  const kind = getNearbyRailCategory(entity, getDestinationKind(entity));
  const district = entity?.district || entity?.neighborhood || entity?.raw?.district || "Downtown Austin";
  return [kind, recommendation?.distanceLabel, district].filter(Boolean).join(" · ");
}

const WATERLOO_RAIL_IMAGES_BY_KEY = {
  "waterloo-park": "/images/map-entities/attached/civic/waterloo-park.jpeg",
  "moody-amphitheater": "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
  "great-lawn": "/images/imported/perks/03-waterloo-park.jpg",
  "waller-creek-trail": "/images/imported/perks/04-waterlook-trail.jpg",
  "downtown-austin-alliance-daa": "/images/imported/perks/austin-downtown.jpg",
  "downtown-austin-alliance": "/images/imported/perks/austin-downtown.jpg",
  "moody-amphitheater-activation-plot": "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
  "waterloo-moody-amphitheater-activation-plot": "/images/map-entities/perks/moody_theater_live_music_1779052684229.png",
  "public-art-tours": "/images/partners/civic/daa-art-walk/daa-art-walk-2.jpg",
  "waterloo-public-art-tours": "/images/partners/civic/daa-art-walk/daa-art-walk-2.jpg",
  "family-events": "/images/imported/perks/community-0087-edibleaustin-picnic-2015-768x512.jpg",
  "waterloo-family-events": "/images/imported/perks/community-0087-edibleaustin-picnic-2015-768x512.jpg",
  "brand-activations": "/images/imported/perks/brand-activations.png",
  "waterloo-brand-activations": "/images/imported/perks/brand-activations.png",
  "food-truck-activations": "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
  "waterloo-food-truck-activations": "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
  "concert-series": "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
  "waterloo-concert-series": "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
};

function getWaterlooRailImage(entity) {
  const explicit = entity?.image || entity?.imageUrl || entity?.thumbnail || entity?.heroImage;
  if (explicit && !String(explicit).includes("/images/fallbacks/")) return explicit;
  const keys = [
    entity?.id,
    entity?.slug,
    entity?.name,
    entity?.title,
    entity?.raw?.id,
    entity?.raw?.name,
  ]
    .map((value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean);
  for (const key of keys) {
    if (WATERLOO_RAIL_IMAGES_BY_KEY[key]) return WATERLOO_RAIL_IMAGES_BY_KEY[key];
  }
  return "";
}

function getBrandPerkRailImage(entity) {
  const text = [
    entity?.id,
    entity?.slug,
    entity?.name,
    entity?.title,
    entity?.raw?.id,
    entity?.raw?.name,
    entity?.raw?.title,
    getNearbyCardEntityTitle(entity),
    placeCoreText(entity),
  ].filter(Boolean).join(" ").toLowerCase();
  if (/topo\s+chico|hydration/.test(text)) return "/images/map-entities/brand-topo-chico/topo-chico-bottle-yellow.jpeg";
  if (/sunday\s+brunch|brunch\s+card|brunch/.test(text)) return "/images/imported/perks/boozy-brunch.png";
  if (/rooftop\s+social|rooftop/.test(text)) return "/images/imported/perks/hospitality-rooftop-social.png";
  if (/coffee\s+walk|walking\s+towards\s+coffee|morning\s+coffee/.test(text)) return "/images/imported/perks/walking-towards-coffee-shop.png";
  if (/burger\s+bar\s+congress|hopdoddy|burger\s+bar/.test(text)) return "/images/map-listing-actual/burger-bar/burger-bar-congress-arrival.jpeg";
  if (/inspired\s+closets?/.test(text)) return "/images/fallbacks/retail.jpg";
  if (/rainey\s+patio\s+night|monday\s+meetups|resident\s+event|rooftop\s+event/.test(text)) return "/images/imported/perks/people-at-event.png";
  if (/lustre\s+pearl|partner-lustre-pearl-rainey|happy-hour-lustre-pearl/.test(text)) return "/images/imported/perks/brand-updates/lustre-pearl-happy-hour.png";
  if (/banger'?s?|sausage\s+house|beer\s+garden/.test(text)) return "/images/imported/perks/brand-updates/bangers-sausage.webp";
  if (/stay\s+put|deep\s+ellum/.test(text)) return "/images/imported/perks/brand-updates/stay-put-patio.png";
  if (/hotel\s+van\s+zandt|van\s+zandt/.test(text)) return "/images/imported/perks/hotel-van-zandt-entrance.jpg";
  if (/geraldine/.test(text)) return "/images/map-entities/attached/venues/geraldines-live.jpeg";
  if (/rainey\s+street\s+historic|rainey\s+street/.test(text)) return "/images/map-entities/rainey-bars/rainey-street.jpeg";
  if (/stagger\s+lee/.test(text)) return "/images/imported/perks/happy-hour-2.png";
  if (/emmer|rye/.test(text)) return "/images/map-entities/rainey-bars/emmer-rye-bread.png";
  if (/half\s+step/.test(text)) return "/images/restaurants/half-step.jpg";
  if (/\bpaseo\b/.test(text)) return "/images/map-entities/attached/properties/paseo/daydreamer-lobby.jpeg";
  return "";
}

function getNearbyCardImage(entity, mode = "resident") {
  return getBrandPerkRailImage(entity) || getWaterlooRailImage(entity) || resolveMapImage(entity, "nearbyRail") || resolveEntityImage(entity, "nearbyRail") || getLifestyleImage(entity, mode) || MAP_PANEL_IMAGE_FALLBACK;
}

function getContextualRailFallbackImage(entity, mode = "resident") {
  const text = placeCoreText({ ...entity, mode });
  const kind = getDestinationKind(entity);
  if (text.includes("fitness") || text.includes("athletic") || text.includes("gym") || text.includes("workout") || text.includes("orangetheory")) return "/images/fallbacks/fitness.jpg";
  if (text.includes("wellness") || text.includes("yoga") || text.includes("pilates") || text.includes("spa") || text.includes("recovery")) return "/images/fallbacks/wellness.jpg";
  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) return "/images/fallbacks/coffee.jpg";
  if (text.includes("retail") || text.includes("shop") || text.includes("store") || text.includes("lululemon") || text.includes("yeti")) return "/images/fallbacks/retail.jpg";
  if (text.includes("hotel") || kind === "hotel") return "/images/fallbacks/hotel.jpg";
  if (text.includes("music") || text.includes("concert")) return "/images/fallbacks/music.jpg";
  if (kind === "event" || text.includes("event")) return "/images/fallbacks/events.jpg";
  if (kind === "property" || text.includes("residential") || text.includes("apartment") || text.includes("condo")) return "/images/fallbacks/property.jpg";
  if (kind === "civic" || text.includes("park") || text.includes("square") || text.includes("library")) return "/images/fallbacks/civic.jpg";
  if (kind === "grocery" || text.includes("grocery") || text.includes("market")) return "/images/fallbacks/grocery.jpg";
  if (kind === "nightlife" || text.includes("bar") || text.includes("cocktail")) return "/images/fallbacks/drinks.jpg";
  if (["dining", "restaurant", "food"].some((needle) => kind === needle || text.includes(needle))) return "/images/fallbacks/dining.jpg";
  return "/images/fallbacks/brand.jpg";
}

function matchesNearbyTargetKind(entity, targetKind = "") {
  if (!targetKind) return true;
  if (targetKind === "hotel") return isHotelEntity(entity);
  return getDestinationKind(entity) === targetKind;
}

function getNearbyRecommendationCards(place, places = [], mode = "resident", limit = 8, targetKind = "") {
  const nearby = getNearbyRecommendations({
    selectedEntity: place,
    entities: places,
    radiusMeters: mode === "partner" ? 1000 : 850,
    fallbackRadiusMeters: mode === "partner" ? 2200 : 1800,
    limit: Math.max(limit * 2, 10),
    mode,
  }).filter((item) => item?.entity?.id && matchesNearbyTargetKind(item.entity, targetKind));

  const related = getRelatedRecommendations({
    selectedEntity: place,
    entities: places,
    excludeIds: nearby.map((item) => item.entity.id),
    limit,
    mode,
  }).filter((item) => item?.entity?.id && matchesNearbyTargetKind(item.entity, targetKind));

  return dedupeRailItems([...nearby, ...related], place, limit)
    .map((item) => {
      const entity = item.entity || item.candidate || item.place || item;
      if (!entity?.id) return null;
      const isResidentialListing = Boolean(getResolvedLegendsListing(entity) || getLuxuryPresenceBuilding(entity) || isLegendsListingLike(entity) || isResidentialRailListing(entity));
      if (isResidentialListing) return null;
      return {
        id: entity.id,
        place: entity,
        title: getNearbyCardEntityTitle(entity),
        meta: getNearbyCardMeta(entity, item.entity ? item : null, mode),
        image: getNearbyCardImage(entity, mode),
        fallbackImage: getContextualRailFallbackImage(entity, mode),
      };
    })
    .filter(Boolean)
    .slice(0, limit);
}

function isDaaArtWalkRoute(route) {
  return String(route?.id || "").toLowerCase() === "daa-art-walk"
    || String(route?.title || "").toLowerCase().includes("art & parks");
}

function isWaterlooGreenwayRoute(route) {
  const id = String(route?.id || "").toLowerCase();
  const title = String(route?.title || "").toLowerCase();
  return id === "waterloo-greenway" || title.includes("waterloo greenway");
}

function routeStopIndex(route, place) {
  const id = String(place?.id || "");
  return Array.isArray(route?.stops) ? route.stops.findIndex((stop) => String(stop.id) === id) : -1;
}

function getRouteAwareNearbyCards(place, places = [], mode = "resident", route = null, savedIds = new Set(), limit = 10) {
  if (!place?.id || !route?.stops?.length) return getNearbyRecommendationCards(place, places, mode, limit);

  const currentIndex = routeStopIndex(route, place);
  const isDaaPanel = isDaaCivicEntity(place) || Boolean(getDaaStopFromPlace(place));
  const isDaaRoute = isDaaArtWalkRoute(route) || isDaaPanel;
  const isWaterlooRoute = isWaterlooGreenwayRoute(route) || Boolean(place?.raw?.isWaterlooPark || place?.isWaterlooPark) || /waterloo|waller creek|greenway/i.test(placeText(place));
  const isCivicDiscoveryRoute = isDaaRoute || isWaterlooRoute;
  const routeStopIds = new Set(route.stops.map((stop) => stop.id));
  const nearbyRouteStops = route.stops
    .map((stop, index) => ({
      entity: stop,
      routeIndex: index,
      distanceMeters: getDistanceMeters(place, stop),
      distanceLabel: formatDistanceLabel(getDistanceMeters(place, stop)),
    }))
    .filter((item) => item.entity?.id && item.entity.id !== place.id)
    .filter((item) => !isResidentialRailListing(item.entity))
    .sort((a, b) => {
      const aUpcoming = currentIndex >= 0 && a.routeIndex > currentIndex ? 0 : 1;
      const bUpcoming = currentIndex >= 0 && b.routeIndex > currentIndex ? 0 : 1;
      return aUpcoming - bUpcoming || Math.abs(a.routeIndex - currentIndex) - Math.abs(b.routeIndex - currentIndex) || a.distanceMeters - b.distanceMeters;
    })
    .slice(0, isCivicDiscoveryRoute ? 4 : 3);

  const nearbyPlaces = getNearbyRecommendations({
    selectedEntity: place,
    entities: places.filter((candidate) => candidate?.id && candidate.id !== place.id && !routeStopIds.has(candidate.id)),
    radiusMeters: isCivicDiscoveryRoute ? 650 : 800,
    fallbackRadiusMeters: isCivicDiscoveryRoute ? 1200 : 1600,
    limit: Math.max(limit * 2, 12),
    mode,
  }).filter((item) => {
    const entity = item?.entity;
    if (!entity?.id) return false;
    if (isResidentialRailListing(entity)) return false;
    if (isCivicDiscoveryRoute && (
      getDestinationKind(entity) === "property" ||
      isPropertyEntity(entity) ||
      isRentalEntity(entity) ||
      isUnitLevelListingPlace(entity) ||
      isLegendsListingLike(entity) ||
      Boolean(getResolvedLegendsListing(entity) || getLuxuryPresenceBuilding(entity))
    )) return false;
    return hasActivePerkData(entity) || isInKindEntity(entity) || isCoffeeEntity(entity) || isHappyHourEntity(entity) || isEventEntity(entity) || isCivicEntity(entity);
  });

  const savedNearby = places
    .filter((candidate) => {
      if (!candidate?.id || !savedIds?.has?.(candidate.id) || candidate.id === place.id || routeStopIds.has(candidate.id)) return false;
      if (isResidentialRailListing(candidate)) return false;
      if (!isCivicDiscoveryRoute) return true;
      return !(
        getDestinationKind(candidate) === "property" ||
        isPropertyEntity(candidate) ||
        isRentalEntity(candidate) ||
        isUnitLevelListingPlace(candidate) ||
        isLegendsListingLike(candidate) ||
        Boolean(getResolvedLegendsListing(candidate) || getLuxuryPresenceBuilding(candidate))
      );
    })
    .map((entity) => ({ entity, distanceMeters: getDistanceMeters(place, entity), distanceLabel: formatDistanceLabel(getDistanceMeters(place, entity)), saved: true }))
    .filter((item) => Number.isFinite(item.distanceMeters) && item.distanceMeters <= 1400)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);

  const routeCards = nearbyRouteStops.map((item) => {
    const stop = item.entity;
    return {
      id: stop.id,
      place: stop,
      title: getNearbyCardEntityTitle(stop),
      meta: [`Route stop ${item.routeIndex + 1}`, item.distanceLabel, stop.category || "DAA Art & Parks Tour"].filter(Boolean).join(" · "),
      image: getNearbyCardImage(stop, mode),
      fallbackImage: getContextualRailFallbackImage(stop, mode),
    };
  });

  const placeCards = [...savedNearby, ...nearbyPlaces].map((item) => {
    const entity = item.entity;
    return {
      id: entity.id,
      place: entity,
      title: getNearbyCardEntityTitle(entity),
      meta: [
        isDaaPanel
          ? item.saved
            ? "Saved DAA context"
            : isCivicEntity(entity)
              ? "DAA civic context"
              : isEventEntity(entity)
                ? "Route engagement stop"
                : "Nearby route support"
          : item.saved ? "Saved nearby" : hasActivePerkData(entity) ? "Perk nearby" : getNearbyKindLabel(entity, getDestinationKind(entity)),
        item.distanceLabel,
        entity.district || "Downtown Austin",
      ].filter(Boolean).join(" · "),
      image: getNearbyCardImage(entity, mode),
      fallbackImage: getContextualRailFallbackImage(entity, mode),
    };
  });

  const protectedPlaceCards = [];
  if (isWaterlooGreenwayRoute(route)) {
    const daaEntity = places.find((candidate) => candidate?.id === "downtown-austin-alliance-civic-layer");
    if (daaEntity && daaEntity.id !== place.id && !routeStopIds.has(daaEntity.id)) {
      protectedPlaceCards.push({
        id: daaEntity.id,
        place: daaEntity,
        title: "Downtown Austin Alliance (DAA)",
        meta: ["Saved nearby", formatDistanceLabel(getDistanceMeters(place, daaEntity)), daaEntity.district || "Congress"].filter(Boolean).join(" · "),
        image: getNearbyCardImage(daaEntity, mode),
        fallbackImage: getContextualRailFallbackImage(daaEntity, mode),
      });
    }
  }

  return dedupeRailItems([...routeCards, ...protectedPlaceCards, ...placeCards], place, limit)
    .filter((item) => item?.place?.id)
    .slice(0, limit);
}

function NearbyImageRail({ place, places = [], onSelect, mode = "resident", title = "Nearby", support = "", route = null, savedIds = new Set(), targetKind = "" }) {
  const items = route?.stops?.length
    ? getRouteAwareNearbyCards(place, places, mode, route, savedIds, 10)
    : getNearbyRecommendationCards(place, places, mode, 8, targetKind);
  if (!items.length) return null;

  return (
    <DestinationSection title={title} support={support} className="dp-discovery-context-section dp-nearby-image-section">
      <div className="dp-nearby-image-rail" aria-label={`${title} places`}>
        {items.map((item) => (
          <button key={item.id} type="button" className="dp-nearby-image-card" onClick={() => onSelect?.(item.place)}>
            <span className="dp-nearby-image-media">
              <img src={item.image} alt="" loading="lazy" decoding="async" data-fallback-src={item.fallbackImage} onError={handlePanelImageError} />
            </span>
            <span className="dp-nearby-image-copy">
              <strong>{item.title}</strong>
              <em>{item.meta}</em>
            </span>
          </button>
        ))}
      </div>
    </DestinationSection>
  );
}

function NearbyContext({ place, places = [], onSelect, mode = "resident", route = null, savedIds = new Set() }) {
  if (getDestinationKind(place) === "property") {
    return <PropertyNearbyRail place={place} places={places} onSelect={onSelect} mode={mode} />;
  }
  const panelContent = resolveEntityPanelContent(place, mode);
  const isDaaPanel = isDaaCivicEntity(place) || Boolean(getDaaStopFromPlace(place));
  const isRouteContext = route?.stops?.length && (isDaaArtWalkRoute(route) || Boolean(getDaaStopFromPlace(place)) || isCivicEntity(place));
  const isHotelPanel = isHotelEntity(place);
  const title = isDaaPanel
    ? isDaaArtWalkRoute(route) || Boolean(getDaaStopFromPlace(place)) ? "Art Walk Stops Nearby" : "DAA Routes & Initiatives"
    : isRouteContext
      ? isWaterlooGreenwayRoute(route) ? "Along This Waterloo Walk" : "Route Stops Nearby"
    : isHotelPanel
      ? "Hotels nearby"
    : panelContent.nearbyHeading || resolveEntityPanelArchetype(place).nearbyTitle;
  const support = isDaaPanel
    ? isDaaArtWalkRoute(route) || Boolean(getDaaStopFromPlace(place))
      ? "Keep moving through the DAA Art & Parks Tour with nearby stops, saved places, and useful downtown context."
      : "Explore DAA-connected civic routes, public realm updates, Waterloo context, art walk stops, and nearby places that support the downtown experience."
    : isRouteContext
      ? isWaterlooGreenwayRoute(route)
      ? "Nearby perks, saved places, events, gardens, and next Waterloo stops tied to this route."
      : "Nearby stops, saved places, and civic context tied to this route."
    : "";
  return <NearbyImageRail place={place} places={places} onSelect={onSelect} mode={mode} title={title} support={support} route={route} savedIds={savedIds} targetKind={isHotelPanel ? "hotel" : ""} />;
}

function getPropertyNearbyCards(place, places = [], mode = "resident") {
  return getNearbyRecommendationCards(place, places, mode, 8).filter((item) => getDestinationKind(item.place) !== "property").slice(0, 6);
}

function PropertyNearbyRail({ place, places = [], onSelect, mode = "resident" }) {
  const items = getPropertyNearbyCards(place, places, mode);
  if (!items.length) return null;
  const isPartner = mode === "partner";
  return (
    <DestinationSection
      title={resolveEntityPanelArchetype(place).nearbyTitle}
      className="dp-property-nearby-section"
      support="Walkable places that help this location feel connected to downtown."
    >
      <div className="dp-property-image-rail">
        {items.map((item) => (
          <button key={item.place?.id || item.title} type="button" className="dp-property-nearby-card" onClick={() => item.place && onSelect?.(item.place)}>
            <img src={item.image} alt={item.title} loading="lazy" decoding="async" onError={handlePanelImageError} />
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

function getRelatedPlaceMeta(item, currentPlace, mode = "resident") {
  if (mode !== "partner") {
    return [getNearbyKindLabel(item, getDestinationKind(item)), item.district || "Downtown Austin"].filter(Boolean).join(" · ");
  }
  const itemKind = getDestinationKind(item);
  const currentKind = getDestinationKind(currentPlace);
  if (itemKind === currentKind) return "Similar place · Similar timing";
  if (["dining", "nightlife", "coffee"].includes(itemKind)) return "Food and drinks nearby";
  if (itemKind === "hotel") return "Hotel guests nearby";
  if (itemKind === "brand") return "Brand moment nearby";
  if (itemKind === "event") return "Event nearby";
  if (itemKind === "property") return "Residents nearby";
  return "Nearby place";
}

function getPartnerRelatedCopy(item, currentPlace) {
  const itemKind = getDestinationKind(item);
  const currentKind = getDestinationKind(currentPlace);
  const district = item?.district || currentPlace?.district || "downtown";

  if (isInKindEntity(item)) return "Dining value nearby";
  if (isEventEntity(item)) return "Event traffic nearby";
  if (isHotelEntity(item)) return "Guest interest nearby";
  if (getResolvedLegendsListing(item) || getLuxuryPresenceBuilding(item)) return "Residential interest nearby";
  if (itemKind === "brand") return "Campaign fit nearby";
  if (["dining", "nightlife", "coffee"].includes(itemKind)) return "Food and drinks nearby";
  if (itemKind === currentKind) return `Same area in ${district}`;
  return `Worth checking near ${district}`;
}

function PeopleAlsoVisit({ place, places, onSelect, mode = "resident" }) {
  const isPropertyLike = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place));
  if (isPropertyLike) return null;
  const isHotelPanel = isHotelEntity(place);
  const related = getRelatedPlaces(place, places)
    .filter((item) => !isHotelPanel || isHotelEntity(item));
  if (!related.length) return null;
  const title = isHotelPanel ? "Hotels nearby" : resolveEntityPanelContent(place, mode).nearbyHeading || "Nearby";
  return (
    <DestinationSection title={title} className="dp-related-section">
      <div className="dp-related-rail">
        {related.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item)} className="dp-related-place">
            <img src={getLifestyleImage(item, "resident")} alt={item.name} onError={handlePanelImageError} />
            <span>
              <strong>{item.name}</strong>
              <em>{getRelatedPlaceMeta(item, place, mode)}</em>
            </span>
          </button>
        ))}
      </div>
    </DestinationSection>
  );
}

function EntityAssistant({ place, mode, answer, loading, onAsk, onClose, onSelect }) {
  const prompts = getEntityAssistantPrompts(place, mode);

  return (
    <DestinationSection title="Ask the Map" className="dp-entity-assistant">
      <div className="dp-ask-prompts">
        {prompts.map((prompt) => (
          <button key={prompt} type="button" className="dp-ask-prompt-chip" onClick={() => onAsk(prompt)} disabled={loading}>
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

function PartnerStrategySummary({ place }) {
  const insights = getPartnerBusinessInsights(place);
  const isEvent = getDestinationKind(place) === "event";

  return (
    <section className="dp-partner-strategy-summary">
      <span>Why it matters</span>
      <strong>{insights.fit || "This is useful when people are already nearby and deciding what to do next."}</strong>
      <p>
        {isEvent
          ? "Use this before the event, while people are making plans, and again when they are close enough to act."
          : insights.action || "Pick one clear next step and make it easy for nearby people to act."}
      </p>
    </section>
  );
}

function cleanPartnerGuideValue(value) {
  return String(value || "")
    .replace(/^Best fit:\s*/i, "")
    .replace(/^Strongest window:\s*/i, "")
    .trim();
}

function PartnerNearbyGuide({ place }) {
  const insights = getPartnerBusinessInsights(place);
  const isEvent = getDestinationKind(place) === "event";
  const items = [
    { label: "Useful for", value: isBatheEntity(place) ? "Recovery, wellness, and weekend routines." : cleanPartnerGuideValue(insights.intent) },
    { label: "Who is nearby", value: isBatheEntity(place) ? "Residents, hotel guests, and people looking for a reset close to downtown." : cleanPartnerGuideValue(insights.audience) },
    { label: "Good moment", value: isEvent ? "The day before and the two hours before start." : cleanPartnerGuideValue(insights.timing) },
  ].filter((item) => item.value).slice(0, 3);

  return (
    <section className="dp-partner-nearby-guide" aria-label="Good to know">
      <header>
        <span>Good to know</span>
        <h3>{isEvent ? "Useful around event night." : "What helps people decide."}</h3>
      </header>
      <div className="dp-partner-guide-list">
        {items.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <p>{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PartnerAskSection({ place, answer, loading, onAsk, onClose, onSelect }) {
  const promptLabelMap = {
    "Who will use this?": "Audience",
    "What should it pair with?": "Pair with",
    "Where should it appear?": "Placement",
    "What makes it easy to use?": "Ease",
    "What should we promote before?": "Before",
    "What should we promote after?": "After",
    "Who is nearby?": "Nearby",
    "What else supports this?": "Support",
  };
  const prompts = getEntityAgentQuestions(place).slice(0, 4).map((prompt) => ({
    value: prompt,
    label: promptLabelMap[prompt] || cleanPartnerPanelText(prompt).replace(/\?$/, "").slice(0, 16),
  }));
  const [draft, setDraft] = useState("");
  const submitQuestion = (question = draft) => {
    const nextQuestion = String(question || "").trim();
    if (!nextQuestion || loading) return;
    setDraft(nextQuestion);
    onAsk(nextQuestion);
  };

  return (
    <section className="dp-partner-ask-section dp-partner-ask-module" aria-label="Ask Downtown Perks">
      <div className="dp-partner-ask-header">
        <span>Ask the Map</span>
      </div>
      <div className="dp-partner-ask-rail">
        {prompts.map((prompt) => (
          <button key={prompt.value} type="button" onClick={() => submitQuestion(prompt.value)} disabled={loading} title={prompt.value}>
            {prompt.label}
          </button>
        ))}
      </div>
      <form
        className="dp-partner-ask-form"
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Ask about ${place?.name || "this pin"}`}
          aria-label={`Ask about ${place?.name || "this placement"}`}
        />
        <button type="submit" disabled={loading || !draft.trim()}>
          Ask
        </button>
      </form>
      <AnimatePresence initial={false}>
        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="dp-partner-agent-answer"
            role="status"
            aria-live="polite"
          >
            <div className="dp-partner-answer-header">
              <h4>{answer.title}</h4>
              {onClose && (
                <button type="button" onClick={onClose} aria-label="Clear answer">
                  Clear
                </button>
              )}
            </div>
            <p>{answer.body}</p>
            {answer.picks?.length > 0 && (
              <div className="dp-partner-ask-rail">
                {answer.picks.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => onSelect(item)}>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PartnerSignalsSection({ place }) {
  const kind = getDestinationKind(place);
  const byKind = {
    event: ["Attendance", "Group plans", "Pre-event dining", "Post-event traffic", "RSVPs"],
    brand: ["Audience fit", "Event crowd", "Local launch", "Nearby plans", "Saves"],
    hotel: ["Hotel guests", "Short walk", "Nearby dining", "Event traffic", "Guest plans"],
    dining: ["Dinner", "After work", "Groups", "Offer fit", "Nearby events"],
    nightlife: ["Tonight", "Groups", "Late plans", "After dinner", "Hotel guests"],
    place: ["Nearby plans", "Residents nearby", "Short walk", "Offer fit", "Repeat visits"],
  };
  const items = (byKind[kind] || byKind.place).slice(0, 7);
  if (!items.length) return null;

  return (
    <section className="dp-partner-tags-section">
      <h3>Useful cues</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function PartnerSectionHeader({ label, title }) {
  return (
    <div className="dp-section-heading-block">
      <div className="dp-section-header">
        <span className="dp-section-label">{label}</span>
        <div className="dp-section-rule" />
      </div>
      {title && <h3 className="dp-section-title">{title}</h3>}
    </div>
  );
}

function cleanPartnerPanelText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function uniquePartnerPanelItems(items = []) {
  const seen = new Set();
  return items
    .map(cleanPartnerPanelText)
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function PartnerActivityIntelligence({ intelligence }) {
  if (!intelligence) return null;
  const summary = cleanPartnerPanelText(intelligence.summary);
  const signals = uniquePartnerPanelItems(intelligence.signals || [])
    .filter((signal) => signal.toLowerCase() !== summary.toLowerCase())
    .slice(0, 2);
  return (
    <section className="dp-partner-intelligence-section">
      <PartnerSectionHeader label="Nearby" />
      {summary && <p>{summary}</p>}
      {signals.length > 0 && (
        <ul className="dp-partner-signal-list">
          {signals.map((signal) => <li key={signal}>{signal}</li>)}
        </ul>
      )}
    </section>
  );
}

function PartnerPerkIntelligencePanel({ place }) {
  if (!hasActivePerkData(place)) return null;
  const perk = getResidentPerkDetails(place);
  const strategyCopy = cleanPartnerPanelText(
    place?.partnerInsight ||
    place?.raw?.partnerInsight ||
    place?.campaignObjective ||
    place?.raw?.campaignObjective ||
    perk.description ||
    place?.summary ||
    place?.raw?.summary ||
    "",
  );
  const offerCopy = cleanPartnerPanelText(perk.offer || place?.offer || place?.raw?.offer || "Resident action");
  const descriptionCopy = strategyCopy && strategyCopy.toLowerCase() !== offerCopy.toLowerCase()
    ? strategyCopy
    : cleanPartnerPanelText(place?.partnerInsight || place?.raw?.partnerInsight || place?.summary || place?.raw?.summary || "");
  const actionLabel = isBrandEntity(place) ? "Brand action" : perk.category || "Campaign action";
  const sharePlace = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: place?.name || "Downtown Perks", text: perk.description || perk.offer || place?.name || "Downtown Perks", url: shareUrl });
        return;
      }
      await navigator.clipboard?.writeText?.(shareUrl);
    } catch {
      // Sharing is best-effort.
    }
  };

  return (
    <section className="dp-partner-intelligence-section dp-partner-perk-intel-panel" aria-label={`${place?.name || "Partner"} perk intelligence`}>
      <div className="dp-partner-perk-intel-header">
        <span>{actionLabel}</span>
        <h3>{offerCopy}</h3>
        {descriptionCopy && <p>{descriptionCopy}</p>}
      </div>

      <div className="dp-partner-perk-action-row" aria-label={`${place?.name || "Partner"} perk actions`}>
        <Link to={campaignRoute(place)} className="dp-perk-cta is-primary">Build Campaign</Link>
        <Link to={getPartnerDashboardRoute(place)} className="dp-perk-cta is-secondary">Track Performance</Link>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-perk-cta is-tertiary">Directions</a>
        <button type="button" className="dp-perk-cta is-tertiary" onClick={sharePlace}>Share</button>
      </div>
    </section>
  );
}

function PartnerNearbyContextSection({ opportunities = [] }) {
  const items = opportunities.slice(0, 2);
  if (!items.length) return null;
  return (
    <section className="dp-partner-intelligence-section">
      <PartnerSectionHeader label="Partner Opportunity" title="Specific moves tied to this place" />
      <div className="dp-partner-opportunity-list">
        {items.map((item) => (
          <article key={item.title} className="dp-partner-opportunity-item">
            <h4>{item.title}</h4>
            <p>{item.reason}</p>
            {item.supportingEntities?.length > 0 && <small>{item.supportingEntities.join(" · ")}</small>}
            {cleanPartnerPanelText(item.recommendedAction) && <strong>{item.recommendedAction}</strong>}
          </article>
        ))}
      </div>
    </section>
  );
}

function PartnerCampaignRecommendationsSection({ recommendations = [] }) {
  if (!recommendations.length) return null;
  return (
    <section className="dp-partner-intelligence-section">
      <PartnerSectionHeader label="Best fit" />
      <div className="dp-partner-opportunity-list">
        {recommendations.slice(0, 2).map((item) => (
          <article key={item.actionTitle || item.title} className="dp-partner-opportunity-item">
            <h4>{item.actionTitle || item.title}</h4>
            <p>{item.whyNow || item.reason}</p>
            {cleanPartnerPanelText([item.bestAudience, item.suggestedTiming, ...(item.supportingEntities || [])].filter(Boolean).join(" · ")) && (
              <small>{[item.bestAudience, item.suggestedTiming, ...(item.supportingEntities || [])].filter(Boolean).join(" · ")}</small>
            )}
            {cleanPartnerPanelText(item.nextSignal || item.recommendedAction) && <strong>{item.nextSignal || item.recommendedAction}</strong>}
          </article>
        ))}
      </div>
    </section>
  );
}

function CommunityStoriesMapLayer() {
  return (
    <section className="dp-community-stories-map-layer" aria-label="Community Stories">
      <div>
        <p className="dp-tab-eyebrow">Resident Favorite</p>
        <h3>Community Stories</h3>
        <p>See how downtown residents are using local perks in real life.</p>
      </div>
      <article>
        <img src="/images/imported/perks/4-scan-perk.png" alt="Resident using a Downtown Perks offer" loading="lazy" decoding="async" onError={handlePanelImageError} />
        <span>
          <strong>Maya R.</strong>
          <small>The Shore</small>
          <em>“The best part is finding something close by that actually fits my routine.”</em>
          <b>Free welcome beer · Rainey Social House</b>
        </span>
      </article>
      <Link to="/perks">Explore Resident Perks</Link>
    </section>
  );
}

function PartnerRelatedAssetsSection({ sections = [], onSelect }) {
  if (!sections.length) return null;
  return (
    <section className="dp-partner-intelligence-section">
      <PartnerSectionHeader label="Nearby" />
      <EntityDiscoveryGrid sections={sections.slice(0, 3)} mode="partner" onSelect={onSelect} />
    </section>
  );
}

function PartnerCampaignReviewSection({ place }) {
  const reviewItems = Array.isArray(place?.measurement)
    ? place.measurement
    : Array.isArray(place?.raw?.measurement)
      ? place.raw.measurement
      : [];
  if (!reviewItems.length) return null;

  return (
    <section className="dp-partner-intelligence-section dp-partner-campaign-review-section">
      <PartnerSectionHeader label="What to review" />
      <ul className="dp-partner-signal-list" aria-label="Campaign review points">
        {reviewItems.slice(0, 8).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PartnerCampaignTrailSection({ place, places = [], onSelect }) {
  const stopIds = [
    ...(place?.campaignPins || []),
    ...(place?.participatingEntities || []),
    ...((place?.activationStops || []).map((stop) => stop.entityId).filter(Boolean)),
  ];
  const seen = new Set([place?.id]);
  const relatedStops = stopIds
    .map((id) => resolveMapEntityFromCollection(id, places))
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 8);

  if (!relatedStops.length) return null;

  return (
    <section className="dp-partner-intelligence-section">
      <PartnerSectionHeader label="Trail stops" />
      <div className="dp-related-rail">
        {relatedStops.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item)} className="dp-related-place">
            <img src={getLifestyleImage(item, "partner")} alt={item.name} onError={handlePanelImageError} />
            <span>
              <strong>{item.name}</strong>
              <em>{getRelatedPlaceMeta(item, place, "partner")}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PartnerCampaignDrawer({ place, places = [], onSelect, answer, loading, onAsk, onCloseAnswer }) {
  return (
    <motion.div className="dp-partner-detail-content dp-partner-intelligence-drawer">
      <DestinationHero place={place} mode="partner" />
      <EntityIdentityPanel identity={getEntityIdentity(place, "partner")} />
      <MapNativeCampaignDetails place={place} mode="partner" />
      <PartnerCampaignTrailSection place={place} places={places} onSelect={onSelect} />
      <PartnerAskSection
        place={place}
        answer={answer}
        loading={loading}
        onAsk={onAsk}
        onClose={onCloseAnswer}
        onSelect={onSelect}
      />
    </motion.div>
  );
}

function isResidentialNearbyContextEntity(entity) {
  const text = placeCoreText(entity);
  return Boolean(
    getLegendsListing(entity) ||
    getLuxuryPresenceBuilding(entity) ||
    isExplicitPropertyRecord(entity) ||
    /\b(legends real estate|mls|for sale|for rent|residential property|priority building|condo|condominium|apartment|building)\b/i.test(text),
  );
}

function isBrandOrPerkPartnerPanelPlace(place) {
  const text = placeCoreText(place);
  return Boolean(
    isBrandEntity(place) ||
    hasActivePerkData(place) ||
    /\b(brand|retail|shop|shopping|store|boots|eyewear|yeti|rivian|lululemon|equinox|ariat|activation)\b/i.test(text),
  );
}

function PartnerIntelligenceDrawer({ place, places = [], onSelect, onContact, answer, loading, onAsk, onCloseAnswer }) {
  if (isCampaignEntity(place)) {
    return (
      <PartnerCampaignDrawer
        place={place}
        places={places}
        onSelect={onSelect}
        answer={answer}
        loading={loading}
        onAsk={onAsk}
        onCloseAnswer={onCloseAnswer}
      />
    );
  }

  const nearbyResults = getNearbyRecommendations({
    selectedEntity: place,
    entities: places,
    radiusMeters: 800,
    fallbackRadiusMeters: 1600,
    limit: 12,
    mode: "partner",
  });
  const nearby = hasNonResidentialActivationSignals(place)
    ? nearbyResults.filter((item) => !isResidentialNearbyContextEntity(item.entity))
    : nearbyResults;
  const intelligence = buildMapIntelligence({ selectedEntity: place, nearby });
  const opportunities = getNearbyPartnerOpportunities({ selectedEntity: place, nearby });
  const campaigns = recommendCampaigns({ selectedEntity: place, nearby });
  const relatedAssets = getRelatedPartnerAssets({ nearby, selectedEntity: place });
  const brandOrPerkPanel = isBrandOrPerkPartnerPanelPlace(place);

  return (
    <motion.div className="dp-partner-detail-content dp-partner-intelligence-drawer">
      <DestinationHero place={place} mode="partner" />
      <EntityIdentityPanel identity={getEntityIdentity(place, "partner")} />
      {!brandOrPerkPanel && <PartnerActivityIntelligence intelligence={intelligence} />}
      <PartnerPerkIntelligencePanel place={place} />
      {!brandOrPerkPanel && <PartnerCampaignRecommendationsSection recommendations={campaigns.length ? campaigns : opportunities} />}
      <PartnerRelatedAssetsSection sections={relatedAssets} onSelect={onSelect} />
      <PartnerAskSection
        place={place}
        answer={answer}
        loading={loading}
        onAsk={onAsk}
        onClose={onCloseAnswer}
        onSelect={onSelect}
      />
    </motion.div>
  );
}

function getContextNearbyImage(item, selectedPlace) {
  const text = `${item?.label || ""} ${item?.value || ""} ${selectedPlace?.district || ""}`.toLowerCase();
  if (text.includes("trail") || text.includes("lake") || text.includes("butler")) return "/images/map-entities/perks/civic_lake_trail_1779052853070.png";
  if (text.includes("bridge") || text.includes("congress")) return "/images/legends-listings/Bat-show-on-Congress-Avenue-Bridge-in-Austin.avif";
  if (text.includes("rainey")) return "/images/map-entities/rainey-bars/rainey-street.jpeg";
  if (text.includes("restaurant") || text.includes("dining") || text.includes("waterfront")) return "/images/map-entities/dining/outdoor-dining-arrival.avif";
  if (text.includes("wellness") || text.includes("recovery") || text.includes("bath")) return "/images/map-entities/perks/partner_wellness_1779052883675.png";
  if (text.includes("retail") || text.includes("shopping") || text.includes("store")) return "/images/imported/perks/fine-eyewear.png";
  return MAP_PANEL_IMAGE_FALLBACK;
}

function PartnerNearbyPlacesSection({ place, places = [], onSelect }) {
  const contextItems = getNearbyContextItems(place, places).map((item, index) => {
    const normalized = normalizeContextItem(item);
    const matchedPlace = places.find((candidate) => String(candidate?.name || "").toLowerCase().includes(String(normalized.label || "").toLowerCase()));
    const meta = String(normalized.value || getPartnerRelatedCopy(matchedPlace, place) || "").replace(/^Resident offer:/i, "Resident offer:");
    return {
      id: matchedPlace?.id || `${normalized.label}-${index}`,
      title: normalized.label || normalized.value,
      meta,
      image: matchedPlace ? getLifestyleImage(matchedPlace, "partner") : getContextNearbyImage(normalized, place),
      place: matchedPlace,
    };
  });
  const relatedItems = getRelatedPlaces(place, places).map((item) => ({
    id: item.id,
    title: item.name,
    meta: getPartnerRelatedCopy(item, place),
    image: getLifestyleImage(item, "resident"),
    place: item,
  }));
  const seen = new Set();
  const items = [...contextItems, ...relatedItems]
    .filter((item) => {
      const key = String(item.place?.id || item.title || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
  if (!items.length) return null;

  return (
    <section className="dp-partner-nearby-section">
      <h3>Places nearby</h3>
      <div className="dp-partner-nearby-grid dp-partner-nearby-rail">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="dp-partner-nearby-card"
            onClick={() => item.place && onSelect(item.place)}
          >
            <img src={item.image} alt={item.title} loading="lazy" decoding="async" onError={handlePanelImageError} />
            <span>
              <strong>{item.title}</strong>
              {item.meta && <em>{item.meta}</em>}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PartnerSimilarAudienceSection({ place, places = [], onSelect }) {
  return null;
}

function HappyHourDetails({ place, savedIds, onSave, onUse }) {
  const happyHour = place.raw?.happyHour || place.happyHour || {};
  const days = happyHour.days || "This week";
  const time = String(happyHour.time || "").trim();
  const offer = happyHour.offer || "Food and drink specials nearby";
  const details = happyHour.details || place.raw?.summary || "A nearby happy hour for residents looking for an easy place to start.";
  const rawRedemption = String(happyHour.redemption || "").trim();
  const redemption = /\bsave\b.*\bdirections\b|\bdirections\b.*\bsave\b|what else is nearby/i.test(rawRedemption) ? "" : rawRedemption;
  const normalizedOffer = String(offer || "").trim().toLowerCase();
  const normalizedDetails = String(details || "").trim().toLowerCase();
  const normalizedRedemption = String(redemption || "").trim().toLowerCase();
  const shouldShowDetails = normalizedDetails && normalizedDetails !== normalizedOffer;
  const shouldShowRedemption = normalizedRedemption && normalizedRedemption !== normalizedOffer && normalizedRedemption !== normalizedDetails;
  const isSaved = savedIds?.has?.(place?.id);

  return (
    <DestinationSection title="Happy Hour" className="dp-happy-hour-section">
      {shouldShowDetails && <p className="dp-destination-section-copy">{details}</p>}
      <div className="dp-quiet-facts" aria-label={`${place.name} happy hour details`}>
        {time && (
          <div>
            <span>{days}</span>
            <strong>{time}</strong>
          </div>
        )}
        <div>
          <span>Offer</span>
          <strong>{offer}</strong>
        </div>
      </div>
      {shouldShowRedemption && <p className="dp-destination-section-note">{redemption}</p>}
      <div className="dp-primary-action-row dp-perk-action-row" aria-label={`${place.name} happy hour actions`}>
        <button type="button" onClick={onUse || onSave} className="dp-panel-action dp-primary-action dp-perk-cta is-primary">
          Use Perk
        </button>
        <button type="button" onClick={onSave} className="dp-panel-action dp-perk-cta is-secondary">
          {isSaved ? "Saved" : "Save"}
        </button>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action dp-perk-cta is-tertiary">
          Directions
        </a>
      </div>
    </DestinationSection>
  );
}

function ParkingBookingDetails({ place, mode }) {
  const item = getParkingBooking(place);
  if (!item) return null;

  const firstRate = item.timeSlots?.[0]?.perkPrice || item.timeSlots?.[0]?.price || item.pricingLabel || "Resident rate";
  const isPartner = mode === "partner";
  const imageCaption = item.imageCaption || place.imageCaption || place.raw?.imageCaption || "";
  const openParkingDirections = () => {
    window.open(directionsUrl(place), "_blank", "noopener,noreferrer");
  };
  const reserveParking = (payload) => {
    window.dispatchEvent(new CustomEvent("downtown-perks:parking-reserved", { detail: { ...payload, entityId: place.id } }));
    window.alert(`${item.title || "Parking"} reservation request saved.`);
  };
  const editParkingInventory = () => {
    window.location.href = `/partner-workspace/parking?entityId=${encodeURIComponent(place.id)}`;
  };
  const handleParkingQuickAction = (action) => {
    const entityId = encodeURIComponent(place.id);
    if (action === "edit-inventory") {
      window.location.href = `/partner-workspace/parking?entityId=${entityId}`;
      return;
    }
    if (action === "promote-parking") {
      window.location.href = campaignRoute(place);
      return;
    }
    if (action === "reservations") {
      window.location.href = `/partner-workspace/reports?layer=parking&entityId=${entityId}`;
      return;
    }
    if (action === "parking-demand") {
      window.location.href = `/map?mode=partner&tab=reports&filter=Parking&entityId=${entityId}`;
      return;
    }
    if (action === "directions") {
      openParkingDirections();
      return;
    }
    if (action === "export-report") {
      const csv = [
        ["Parking", "Available", "Total", "Rate"],
        [item.title, item.availableSpots, item.totalSpots, item.pricingLabel || firstRate],
      ].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${place.id}-parking-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  const parkingCampaigns = [
    {
      name: "Evening parking offer",
      audience: "Residents heading out",
      price: item.pricingLabel || firstRate,
      description: "Resident-rate parking gives people a clearer nearby option while they are making evening plans.",
      features: ["Resident rate", "Directions", "Reservation time"],
    },
    {
      name: "Event parking",
      audience: "Event-goers nearby",
      price: "Custom",
      description: "Timed event parking creates limited-space inventory around concerts, dinners, and downtown events.",
      features: ["Timed spaces", "People nearby", "Results report"],
    },
  ];

  return (
    <DestinationSection title={isPartner ? "Parking options" : "Reserve parking"} className="dp-parking-detail-section">
      <p className="dp-destination-section-copy">
        {isPartner
          ? "Show available parking when people nearby are choosing dinner, events, or a night out."
          : "Reserve nearby parking before you head out. Resident rate available."}
      </p>
      {imageCaption && <p className="dp-parking-context-caption">{imageCaption}</p>}

      {isPartner && (
        <>
          <DPQuickActions actions={quickActionsByEntityType.parking} onAction={handleParkingQuickAction} />
          <PanelInsightGrid
            columns="sm:grid-cols-3"
            items={[
              { label: "Available now", value: "Parking times people can reserve before they leave.", emphasis: true },
              { label: "Why it matters", value: "Parking is easier to use when it appears next to nearby plans." },
              { label: "Next move", value: "Show the resident rate and send people straight to reserve.", emphasis: true },
            ]}
          />
        </>
      )}

      <DPParkingReservation
        item={item}
        mode={isPartner ? "partner" : "resident"}
        onReserve={reserveParking}
        onEditInventory={editParkingInventory}
        onDirections={openParkingDirections}
      />

      {isPartner && <DPPricingRail title="Parking offers" items={parkingCampaigns} />}
    </DestinationSection>
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
              {[
                ["Create Campaign Placement", campaignRoute(place)],
                ["Promote an Event", "/partner-workspace/events"],
              ].map(([label, href]) => (
                <Link key={label} to={href} className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#0B1F33]/[0.08] bg-white text-[12px] font-medium text-[#0B1F33]">
                  {label}
                </Link>
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

function isDaaCivicEntity(place) {
  const text = [
    place?.id,
    place?.name,
    place?.title,
    place?.raw?.id,
    place?.raw?.name,
    place?.raw?.title,
    place?.category,
    place?.raw?.category,
    ...(Array.isArray(place?.tags) ? place.tags : []),
    ...(Array.isArray(place?.raw?.tags) ? place.raw.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
  return text.includes("downtown austin alliance") || /\bdaa\b/.test(text) || text.includes("civic-daa");
}

function getDaaCivicVideos(place) {
  const raw = place?.raw || {};
  const explicit = [
    ...(Array.isArray(place?.videos) ? place.videos : []),
    ...(Array.isArray(raw.videos) ? raw.videos : []),
    ...(Array.isArray(place?.media?.videos) ? place.media.videos : []),
    ...(Array.isArray(raw.media?.videos) ? raw.media.videos : []),
  ].filter(Boolean);
  const videos = explicit.length ? explicit : isDaaCivicEntity(place) ? DAA_CIVIC_VIDEOS : [];
  const seen = new Set();
  return videos
    .map((video) => typeof video === "string" ? { src: video, title: "DAA civic video", label: "Downtown civic media" } : video)
    .filter((video) => {
      const src = String(video?.src || video?.url || "").trim();
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    })
    .map((video) => ({
      title: String(video.title || video.name || "DAA civic video").trim(),
      label: String(video.label || video.description || "Downtown civic media").trim(),
      src: String(video.src || video.url).trim(),
    }));
}

function DaaCivicVideoRail({ place }) {
  const videos = getDaaCivicVideos(place);
  if (!videos.length) return null;
  return (
    <section className="dp-destination-section dp-daa-video-section" aria-label="DAA civic media">
      <div className="dp-daa-video-section-head">
        <p className="dp-daa-kicker">DAA civic media</p>
        <h3>Downtown updates in motion.</h3>
      </div>
      <div className="dp-daa-video-rail">
        {videos.map((video) => (
          <article key={video.src} className="dp-daa-video-card">
            <video
              controls
              muted
              playsInline
              preload="metadata"
              src={video.src}
              aria-label={video.title}
            />
            <div>
              <strong>{video.title}</strong>
              <span>{video.label}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DaaArtWalkImageRail({ primaryImage }) {
  const images = [
    primaryImage
      ? {
          src: primaryImage,
          title: "Current route stop",
          label: "Selected Art Walk location",
        }
      : null,
    ...daaArtWalkImages,
  ]
    .filter(Boolean)
    .filter((image, index, list) => list.findIndex((item) => item.src === image.src) === index)
    .slice(0, 5);

  if (!images.length) return null;

  return (
    <section className="dp-destination-section dp-daa-art-image-section" aria-label="DAA Art Walk images">
      <div className="dp-daa-video-section-head">
        <p className="dp-daa-kicker">DAA Art Walk</p>
        <h3>Images from the route.</h3>
      </div>
      <div className="dp-daa-art-image-rail">
        {images.map((image) => (
          <figure key={image.src} className="dp-daa-art-image-card">
            <img src={image.src} alt={image.title} loading="lazy" />
            <figcaption>
              <strong>{image.title}</strong>
              <span>{image.label}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function getDaaStopFromPlace(place) {
  return place?.raw?.daaTourStop || place?.daaTourStop || null;
}

function DaaTourDetails({ place, places = [], onSelect, savedIds, onSave }) {
  const stop = getDaaStopFromPlace(place);
  const [isCivicReadMoreOpen, setIsCivicReadMoreOpen] = useState(false);
  const [checkInRecord, setCheckInRecord] = useState(() => (stop?.id ? getDaaCheckIn(stop.id) : null));
  useEffect(() => {
    setCheckInRecord(stop?.id ? getDaaCheckIn(stop.id) : null);
  }, [stop?.id]);
  if (!stop) return null;

  const stopNumber = String(stop.stopNumber).padStart(2, "0");
  const stopTitle = stop.displayName || stop.name;
  const locationLabel = stop.locationLabel || place?.district || "Downtown Austin";
  const stopImage = stop.imageUrl || place.image || resolveEntityImage(place, "card") || MAP_PANEL_IMAGE_FALLBACK;
  const introCopy = stop.daaIntro || "This stop is part of the Downtown Austin Alliance Art & Parks Tour.";
  const reasonCopy = stop.whyStopHere || `Use this stop as a small pause in ${locationLabel}, then keep moving toward nearby art, parks, food, and public places.`;
  const nearbyPlaces = (stop.nearbyStops || [])
    .map((stopId) => places.find((candidate) => candidate.id === stopId) || getDaaTourStopById(stopId))
    .filter(Boolean)
    .slice(0, 4);
  const civicGoodFor = [
    ["Short walk", "A quick place to notice, pause, and keep exploring nearby.", stopImage],
    ["Visitors", "An easy way to understand this part of downtown without a formal tour.", "/images/map-entities/perks/downtown_art_walk_1779052670656.png"],
    ["Build a route", "Start here, then add nearby art, parks, coffee, food, or resident perks.", "/images/imported/perks/downtown-dining-patio.png"],
  ];
  const whyStopBullets = Array.isArray(stop.whyStopBullets) ? stop.whyStopBullets.filter(Boolean) : [];
  const goodForLabels = Array.isArray(stop.goodFor) ? stop.goodFor.filter(Boolean) : [];
  const handleCheckInShare = async () => {
    const shareUrl = `${window.location.origin}/map?mode=resident&tab=map&filter=Civic&entityId=${encodeURIComponent(place.id)}`;
    const nextCheckIn = await recordDaaCheckIn({
      stopId: stop.id,
      stopName: stopTitle,
      stopNumber,
      placeId: place.id,
      district: stop.district || place?.district || "Downtown Austin",
      shareUrl,
      source: "resident-civic-drawer",
    });
    setCheckInRecord(nextCheckIn);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${stopTitle} · Downtown Austin Art & Parks Tour`,
          text: `I stopped at ${stopTitle} on the Downtown Austin Art & Parks Tour.`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to clipboard when the native share sheet is dismissed.
      }
    }
    try {
      await navigator.clipboard?.writeText(shareUrl);
      window.alert("This DAA stop link has been copied.");
    } catch {
      window.location.href = shareUrl;
    }
  };
  const openCivicLayer = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("mode", "resident");
    params.set("tab", "map");
    params.set("filter", "Civic");
    params.delete("entityId");
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <div className="dp-daa-destination-panel dp-civic-guide-panel">
      <section className="dp-daa-story-block dp-civic-guide-intro" aria-label="Why people stop here">
        <p className="dp-daa-kicker">Stop {stopNumber} of {DAA_TOUR_STOP_COUNT}</p>
        <h3>{stop.detailHeadline || "Why stop here"}</h3>
        <p>{introCopy}</p>
        <p>{reasonCopy}</p>
        <dl className="dp-daa-inline-facts" aria-label={`${stopTitle} details`}>
          {[
            ["Location", locationLabel],
            ["Created", stop.year],
            ["Managed by", stop.artist || "City of Austin"],
            ["Experience", "Art & Parks Tour"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "Downtown Austin"}</dd>
            </div>
          ))}
        </dl>
        {whyStopBullets.length > 0 && (
          <ul className="dp-daa-clean-list" aria-label="Why stop here">
            {whyStopBullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
      </section>

      <section className="dp-civic-image-card-section" aria-label="What this stop is good for">
        <p className="dp-daa-kicker">What It's Good For</p>
        {goodForLabels.length > 0 ? (
          <ul className="dp-daa-clean-list dp-daa-good-for-list" aria-label="Good for">
            {goodForLabels.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <div className="dp-civic-text-rail">
            {civicGoodFor.map(([title, body]) => (
              <button key={title} type="button" onClick={openCivicLayer}>
                <strong>{title}</strong>
                <span>{body}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <DaaArtWalkImageRail primaryImage={stopImage} />

      {stop.localTip && (
        <section className="dp-daa-story-block dp-daa-local-tip" aria-label="Local tip">
          <p className="dp-daa-kicker">Local Tip</p>
          <h3>Go before sunset.</h3>
          <p>{stop.localTip}</p>
        </section>
      )}

      {stop.ctaHeadline && stop.ctaBody && (
        <section className="dp-daa-story-block dp-daa-stop-cta" aria-label="Downtown Perks note">
          <p className="dp-daa-kicker">Downtown Perks</p>
          <h3>{stop.ctaHeadline}</h3>
          <p>{stop.ctaBody}</p>
        </section>
      )}

      <section className="dp-daa-read-more" aria-label="DAA and DANA civic integration">
        <button
          type="button"
          className="dp-daa-read-more-toggle"
          aria-expanded={isCivicReadMoreOpen}
          aria-controls={`daa-civic-more-${stop.id}`}
          onClick={() => setIsCivicReadMoreOpen((value) => !value)}
        >
          <span>Read more about the civic layer</span>
          <ChevronDown aria-hidden="true" className={isCivicReadMoreOpen ? "is-open" : ""} />
        </button>
        {isCivicReadMoreOpen && (
          <div id={`daa-civic-more-${stop.id}`} className="dp-daa-read-more-panel">
            <p>
              Downtown Perks brings civic stops, nearby events, local places, and resident benefits into the same map so
              downtown is easier to explore one stop at a time.
            </p>
            <ul className="dp-daa-read-more-list">
              <li>Find public art, parks, routes, and cultural stops without opening another list.</li>
              <li>Add coffee, food, events, and perks around the route when they are nearby.</li>
              <li>Save places you want to remember and come back to later.</li>
            </ul>
          </div>
        )}
      </section>

      <section className="dp-daa-action-panel" aria-label="DAA stop actions">
        <AppButton
          onClick={handleCheckInShare}
          variant="primary"
          className="dp-daa-action-primary"
        >
          <span className="dp-daa-action-primary-text">Check in and share</span>
          {checkInRecord && <span className="dp-daa-action-status">Recorded to DAA workspace</span>}
        </AppButton>
      </section>

      <section className="dp-daa-next-stops" aria-label="Next nearby stops">
        <p className="dp-daa-kicker">Keep Exploring</p>
        <h3>Continue the route nearby.</h3>
        <div className="dp-daa-next-rail">
          {nearbyPlaces.map((nearby) => {
            const nearbyStop = nearby.raw?.daaTourStop || nearby.daaTourStop || nearby;
            const nearbyPlace = nearby.raw ? nearby : places.find((candidate) => candidate.id === nearbyStop.id);
            return (
              <button
                key={nearbyStop.id}
                type="button"
                onClick={() => nearbyPlace && onSelect(nearbyPlace)}
                className="dp-daa-next-card"
              >
                <span className="dp-daa-next-card-kicker">Next stop</span>
                <strong>{nearbyStop.name}</strong>
                <em>{nearbyStop.district || "Downtown Austin"} · 4 min walk</em>
              </button>
            );
          })}
        </div>
      </section>
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
          {[
            ["Claim This Listing", `/partners/apply?entityId=${encodeURIComponent(place.id || "")}`],
            ["Add Resident Perk", "/partner-workspace/perks"],
            ["Update Happy Hour", "/partners/happy-hours"],
            ["Promote an Event", "/partner-workspace/events"],
          ].map(([label, href]) => (
            <Link key={label} to={href} className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#0B1F33]/[0.08] bg-white text-[12px] font-medium text-[#0B1F33]">
              {label}
            </Link>
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
      ["Available Through", "LEGENDS REAL ESTATE"],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
  }

  if (!building && isLegendsListingLike(place)) {
    const raw = place?.raw || {};
    const facts = raw.facts || place?.facts || {};
    return [
      ["Price", facts.price || raw.price || place?.price || place?.raw?.priceDisplay],
      ["Bedrooms", facts.beds || raw.beds || place?.beds],
      ["Bathrooms", facts.baths || raw.baths || place?.baths],
      ["Square Feet", facts.sqft || raw.sqft || place?.sqft],
      ["MLS Number", facts.mls || raw.mls_number || raw.mlsNumber || place?.mls_number || place?.mlsNumber],
      ["Available Through", "LEGENDS REAL ESTATE"],
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
      ["Available Through", "LEGENDS REAL ESTATE"],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");
  }

  return [];
}

function getLegendsFactRowsFromListing(listing) {
  if (!listing) return [];
  const hasUsefulFactValue = (value) => {
    const text = String(value ?? "").trim();
    if (!text) return false;
    if (/^(0|0\.0|unknown|n\/a|null|undefined)$/i.test(text)) return false;
    if (/^0\s*(beds?|baths?|sq\s*ft|square feet)$/i.test(text)) return false;
    return true;
  };
  return [
    ["Price", listing.priceDisplay || listing.price],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq Ft", listing.sqftDisplay || (listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "")],
    ["MLS", listing.mlsNumber || listing.mls_number],
    ["Broker", "LEGENDS REAL ESTATE"],
  ].filter(([, value]) => hasUsefulFactValue(value));
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
    .filter(([, value]) => {
      const text = String(value ?? "").trim();
      return text && !/^(0|0\.0|unknown|n\/a|null|undefined)$/i.test(text) && !/^0\s*(beds?|baths?|sq\s*ft|square feet)$/i.test(text);
    });
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

function PropertyMatrix({ rows = [], className = "" }) {
  const cleanRows = rows.filter(([, value]) => String(value || "").trim());
  if (!cleanRows.length) return null;
  return (
    <div className={`dp-property-matrix ${className}`}>
      {cleanRows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="dp-property-matrix-row">
          <span className="dp-property-matrix-label">{label}</span>
          <span className="dp-property-matrix-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function PropertyNearbyRows({ rows = [], onAsk }) {
  const cleanRows = rows.filter((item) => item?.label);
  if (!cleanRows.length) return null;
  return (
    <div className="dp-property-nearby-rows">
      {cleanRows.slice(0, 6).map((item) => (
        <button
          key={`${item.label}-${item.value}`}
          type="button"
          className="dp-property-nearby-row"
          onClick={() => onAsk?.(`Show ${item.label} near this property`)}
        >
          <span>
            <strong>{item.label}</strong>
            {item.value && <em>{item.value}</em>}
          </span>
        </button>
      ))}
    </div>
  );
}

function LegendsResidentialMatrixPanel({ place, onAsk }) {
  const content = getLegendsResidentialContentForPlace(place);
  if (!content) return null;
  const guideRows = [
    ["Coffee", content.coffee?.join(" · ")],
    ["Dining", content.dining?.join(" · ")],
    ["Drinks", content.drinks?.join(" · ")],
    ["Wellness", content.wellness?.join(" · ")],
    ["Groceries", content.groceries?.join(" · ")],
  ];
  const listingRows = [
    ["Listings", content.listingsText?.join(" · ") || "Listing data required"],
  ];

  return (
    <DestinationSection title="Residential guide" className="dp-legends-residential-panel">
      <div className="dp-legends-residential-intro">
        <p className="dp-legends-brand-line">LEGENDS REAL ESTATE</p>
        <p className="dp-legends-residential-summary">{content.summary}</p>
        <div className="dp-spring-action-row" aria-label="Residential actions">
          <button type="button" className="dp-tab-primary-action" onClick={() => onAsk?.(`Show nearby perks around ${content.building_name}`)}>
            {content.cta_primary || "View Perks Nearby"}
          </button>
          <button type="button" className="dp-tab-secondary-action" onClick={() => onAsk?.(`Explore the neighborhood around ${content.building_name}`)}>
            {content.cta_secondary || "Explore Neighborhood"}
          </button>
        </div>
      </div>

      <PropertyMatrix rows={content.snapshot} />

      <div className="dp-legends-residential-block">
        <h4>Included with Downtown Perks</h4>
        <p>{content.included_with_downtown_perks}</p>
        <PropertyMatrix rows={(content.benefits || []).map((item) => ["Benefit", item])} className="dp-property-matrix-compact" />
      </div>

      <div className="dp-legends-residential-block">
        <h4>Walkable nearby</h4>
        <PropertyMatrix rows={(content.walkableNearby || []).map((item) => [item.label, item.value])} />
      </div>

      <div className="dp-legends-residential-block">
        <h4>Neighborhood guide</h4>
        <PropertyMatrix rows={guideRows} />
      </div>

      <div className="dp-legends-residential-block">
        <h4>Why it matters</h4>
        <p>{content.why_it_matters}</p>
      </div>

      <div className="dp-legends-residential-block">
        <h4>Available listings</h4>
        <PropertyMatrix rows={listingRows} />
      </div>

      <div className="dp-legends-residential-block">
        <h4>Places nearby</h4>
        <PropertyNearbyRows rows={content.placesNearby || []} onAsk={onAsk} />
      </div>

      <div className="dp-legends-residential-block">
        <h4>Good to know</h4>
        <PropertyMatrix rows={(content.goodToKnow || []).slice(0, 6).map((item) => ["", item])} className="dp-property-matrix-compact" />
      </div>

      <div className="dp-legends-residential-interest">
        <h4>Interested?</h4>
        <p>{content.interest_copy || "Listings, tours, and neighborhood context."}</p>
        <div className="dp-property-action-footer">
          <button type="button" className="dp-tab-primary-action" onClick={() => onAsk?.(`Open listing details for ${content.building_name}`)}>
            {content.cta_listing || "View Listing"}
          </button>
        </div>
      </div>
    </DestinationSection>
  );
}

function SpringCondominiumsDestinationPanel({ onAsk }) {
  const profile = SPRING_CONDOMINIUMS_PROFILE;
  return (
    <DestinationSection title="Building summary" className="dp-spring-destination-section">
      <div className="dp-spring-brief">
        <p className="dp-legends-brand-line">{profile.brand}</p>
        <p className="dp-spring-summary">{profile.summary}</p>
        <div className="dp-spring-action-row" aria-label="Spring Condominiums actions">
          <button type="button" className="dp-tab-primary-action" onClick={() => onAsk?.("Show perks nearby around Spring Condominiums")}>
            View Perks Nearby
          </button>
          <button type="button" className="dp-tab-secondary-action" onClick={() => onAsk?.("Explore the neighborhood around Spring Condominiums")}>
            Explore the Neighborhood
          </button>
        </div>
      </div>

      <div className="dp-spring-snapshot" aria-label="Spring Condominiums property snapshot">
        {profile.snapshot.map(([label, value]) => (
          <span key={label}>
            <strong>{label}</strong>
            <em>{value}</em>
          </span>
        ))}
      </div>

      <div className="dp-spring-perks-block">
        <h4>Included With Downtown Perks</h4>
        <p>{profile.perksCopy}</p>
        <div className="dp-spring-text-rail" aria-label="Downtown Perks benefits">
          {profile.perksIncluded.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div className="dp-spring-walk-times" aria-label="Walk times from Spring Condominiums">
        {profile.walkTimes.map(([label, value]) => (
          <span key={label}>
            <strong>{label}</strong>
            <em>{value}</em>
          </span>
        ))}
      </div>

      <div className="dp-spring-lifestyle" aria-label="What is nearby">
        {Object.entries(profile.lifestyle).map(([label, items]) => (
          <section key={label}>
            <h4>{label}</h4>
            <p>{items.join(" · ")}</p>
          </section>
        ))}
      </div>

      <div className="dp-spring-cta">
        <h4>Everything Nearby, One Map.</h4>
        <p>Explore local perks, events, dining, fitness, and neighborhood experiences around Spring Condominiums.</p>
        <div className="dp-spring-action-row">
          <button type="button" className="dp-tab-primary-action" onClick={() => onAsk?.("Open the map around Spring Condominiums")}>
            Open Map
          </button>
          <button type="button" className="dp-tab-secondary-action" onClick={() => onAsk?.("Show Downtown Perks near Spring Condominiums")}>
            Get Downtown Perks
          </button>
        </div>
      </div>
    </DestinationSection>
  );
}

function LegendsMLSFactsSection({ place, mode, onSelect }) {
  const facts = getLiveLegendsFacts(place);
  const building = getLuxuryPresenceBuilding(place);
  const isLegends = facts.length && (getResolvedLegendsListing(place) || building || isLegendsListingLike(place));
  if (!isLegends) return null;

  const sortedListings = [...(building?.listings || place?.listings || [])].sort((a, b) => {
    const priceA = Number(String(a.price || "").replace(/[^0-9.]/g, "")) || 0;
    const priceB = Number(String(b.price || "").replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  if (building && sortedListings.length) {
    return (
      <DestinationSection title="Available Listings">
        <p className="dp-legends-brand-line">LEGENDS REAL ESTATE</p>
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
                </span>
              </button>
            );
          })}
        </div>
      </DestinationSection>
    );
  }

  return (
    <DestinationSection title="Listing Details">
      <p className="dp-legends-brand-line">LEGENDS REAL ESTATE</p>
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
      className="dp-contact-continuation mt-0 text-left"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitError("");
        setSubmitting(true);
        const form = new FormData(event.currentTarget);
        const listingPayload = {
          id: form.get("listingId"),
          name: form.get("listingName"),
          listingType: form.get("listingType"),
          address: form.get("address"),
          price: form.get("price"),
          beds: form.get("beds"),
          baths: form.get("baths"),
          sqft: form.get("sqft"),
          daysOnMarket: form.get("daysOnMarket"),
          neighborhood: form.get("neighborhood"),
          source: form.get("source"),
          brand: form.get("brand"),
          contactEmail: form.get("contactEmail"),
        };
        try {
          await postWorkflow("/api/listing-interest", {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            moveTimeline: form.get("moveTimeline"),
            message: form.get("message"),
            listing: listingPayload,
            sessionId: getWorkflowSessionId(),
            profileId: getWorkflowProfileId(),
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
          });
          setSubmitted(true);
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : "The request could not be sent.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="max-w-2xl text-left">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Interested?</div>
        <h3 className="mt-1 text-[14px] font-semibold leading-tight text-[#0B1F33] md:text-[15px]">{listing.address}</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#425466]">
          Send interest directly from the map. Legends receives the listing, your timing, and how to follow up.
        </p>
      </div>

      <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Name
          <input required name="name" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Your name" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Email
          <input required type="email" name="email" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="you@example.com" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Phone
          <input required name="phone" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Phone number" />
        </label>
        <label className="grid gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
          Move timeline
          <select name="moveTimeline" className="h-8 dp-soft-field rounded-[2px] bg-white px-2.5 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70">
            {["ASAP", "30-60 days", "60-90 days", "Just exploring"].map((timeline) => (
              <option key={timeline}>{timeline}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-2 grid max-w-2xl gap-1 text-left text-[9.5px] font-semibold uppercase tracking-[0.08em] text-[#0B1F33]/58">
        Message optional
        <textarea name="message" className="min-h-16 dp-soft-field rounded-[2px] bg-white px-2.5 py-2 text-[12px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" defaultValue={listing.prefilledMessage} />
      </label>

      <input type="hidden" name="listingId" value={listing.id || ""} />
      <input type="hidden" name="listingName" value={listing.buildingName || listing.name || listing.address || ""} />
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
      <input type="hidden" name="contactEmail" value={listing.contactEmail || ""} />

      {submitError && (
        <p className="mt-3 text-[12px] leading-5 text-red-700">
          {submitError}
        </p>
      )}

      <button type="submit" className="dp-panel-action-text mt-5 inline-flex items-center gap-1.5" disabled={submitting}>
        {submitting ? "Sending..." : "Submit Interest"}
        <Send className="h-3 w-3 text-[#C8A96A]" />
      </button>
    </form>
  );
}

function LegendsListingDetails({ listing }) {
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const title = listing.panelTitle || listing.buildingName || listing.address;
  const subtitle = listing.panelSubtitle || fullAddress;
  const stats = [
    ["Listed at", listing.priceDisplay],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq ft", listing.sqftDisplay],
    ["MLS", listing.mlsNumber],
    ["Status", listing.status],
    ["Days on market", listing.daysOnMarket],
  ];

  return (
      <section className="mt-3 dp-info-section p-3 text-left md:mt-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex min-w-0 items-start gap-3 text-left">
          <img
            src={LEGENDS_PIN_LOGO}
            alt="Legends Real Estate"
            className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
          />
          <div className="min-w-0 text-left">
              <div className="inline-flex dp-map-status-badge px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
              {listing.listingTypeLabel}
            </div>
            <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#0B1F33] md:text-[20px]">{title}</h3>
            <p className="mt-1 text-[12px] font-medium text-[#425466]">{subtitle}</p>
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

      <p className="mt-4 text-left text-[13px] leading-6 text-[#425466]">{listing.interestCopy || listing.panelCopy}</p>
      {!!listing.listingFacts && (
        <p className="mt-2 text-left text-[12px] font-semibold leading-5 text-[#0B1F33]/68">{listing.listingFacts}</p>
      )}
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

function LegendsPartnerListingDetails({ listing, place }) {
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const title = listing.panelTitle || listing.buildingName || listing.address;
  const insights = getPartnerBusinessInsights(place);
  const stats = [
    ["Price", listing.priceDisplay],
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq ft", listing.sqftDisplay],
    ["MLS", listing.mlsNumber],
    ["Status", listing.status],
    ["Days live", listing.daysOnMarket],
  ];

  return (
    <>
      <section className="mt-3 dp-info-section p-3 md:mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <img
              src={LEGENDS_PIN_LOGO}
              alt="Legends Real Estate"
              className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
            />
            <div className="min-w-0">
              <div className="inline-flex dp-map-status-badge px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
                {listing.listingTypeLabel}
              </div>
              <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#0B1F33] md:text-[20px]">{title}</h3>
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

      <PartnerMetricInsight place={place} />
    </>
  );
}

function PartnerDrawerActions({ place, onContact }) {
  const sharePlace = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, text: place.summary || place.description || place.name, url: shareUrl });
        return;
      }
      await navigator.clipboard?.writeText?.(shareUrl);
    } catch {
      // Sharing is best-effort.
    }
  };

  if (getResidentEntityKind(place) === "property") {
    const viewListings = () => {
      const listings = document.querySelector(".dp-destination-drawer .dp-legends-home-list");
      if (listings) {
        listings.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      onContact?.();
    };
    return (
      <section className="dp-partner-drawer-actions" aria-label="Partner actions">
        <div className="dp-primary-action-row dp-partner-action-row mt-3">
          <button type="button" onClick={viewListings} className="dp-panel-action dp-primary-action">
            <span>View Listings</span>
          </button>
          <Link to={campaignRoute(place)} className="dp-panel-action">
            <span>Create Campaign</span>
          </Link>
        </div>
        <div className="dp-secondary-action-row dp-partner-secondary-action-row">
          <button type="button" onClick={onContact} className="dp-panel-action-text">
            <span>Contact</span>
          </button>
          <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action-text">
            <span>Review Nearby Activity</span>
          </Link>
        </div>
      </section>
    );
  }
  return (
    <section className="dp-partner-drawer-actions" aria-label="Partner actions">
      <div className="dp-primary-action-row dp-partner-action-row mt-3">
        <Link to={campaignRoute(place)} className="dp-panel-action dp-primary-action">
          <span>Create Campaign</span>
        </Link>
        <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action">
          <span>Review Nearby Activity</span>
        </Link>
        <button type="button" onClick={sharePlace} className="dp-panel-action">
          <span>Share</span>
        </button>
      </div>
    </section>
  );
}

function shouldUsePartnerIntelligenceDrawer(place, mode) {
  if (mode !== "partner" || !place) return false;
  const entityKind = getResidentEntityKind(place);
  const legendsListing = getResolvedLegendsListing(place);
  const isRental = entityKind === "rental" || isRentalEntity(place);
  const isProperty = !isRental && (entityKind === "property" || Boolean(legendsListing || getLuxuryPresenceBuilding(place) || isLegendsListingLike(place)));
  const isDaaStop = isDaaTourPlace(place);
  return !isProperty && !isDaaStop;
}

function MapNativeCampaignDetails({ place, mode }) {
  if (!isCampaignEntity(place)) return null;
  const raw = place.raw || {};
  const stats = Array.isArray(place.stats) ? place.stats : Array.isArray(raw.stats) ? raw.stats : [];
  const analytics = place.analytics || raw.analytics || place.metrics || raw.metrics || {};
  const participating = Array.isArray(place.participatingEntities) ? place.participatingEntities : Array.isArray(raw.participatingEntities) ? raw.participatingEntities : [];
  const activationStops = Array.isArray(place.activationStops) ? place.activationStops : Array.isArray(raw.activationStops) ? raw.activationStops : [];
  const participatingCount = participating.length;
  const reward = place.reward || place.rewardLabel || raw.reward || raw.rewardLabel;
  const campaignType = place.campaignType || raw.campaignType;
  const reportItems = [
    ["Views", analytics.views],
    ["Opens", analytics.opens],
    ["Participants", analytics.participants],
    ["Completions", analytics.completions],
    ["Redemptions", analytics.redemptions],
    ["Directions", analytics.directions],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <section className="dp-destination-section dp-map-native-campaign-detail">
      <p className="dp-destination-section-kicker">Map-native campaign</p>
      <h3>How it works</h3>
      {(place.partnerLine || place.sponsorName) && (
        <p className="dp-destination-section-note">Partner: {place.partnerLine || place.sponsorName}</p>
      )}
      <p className="dp-destination-section-copy">
        {place.description || raw.description || place.summary || raw.summary || "This campaign lives inside the map with pins, routes, discovery placement, engagement metrics, and reporting."}
      </p>
      <div className="dp-campaign-native-stat-grid" aria-label={`${place.name} campaign stats`}>
        {(stats.length ? stats : [
          campaignType ? `${String(campaignType).replace(/-/g, " ")}` : "Map campaign",
          participatingCount ? `${participatingCount} participating places` : "Discovery placement",
          reward || "Reward tracked",
        ]).slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      {reward && (
        <p className="dp-destination-section-note">Reward: {reward}</p>
      )}
      {activationStops.length > 0 && (
        <div className="dp-campaign-activation-list" aria-label={`${place.name} activation stops`}>
          {activationStops.map((stop) => (
            <div key={stop.entityId || stop.title} className="dp-campaign-activation-row">
              <span>
                <strong>{stop.title}</strong>
                <small>{stop.role}</small>
              </span>
              <p>{stop.detail}</p>
            </div>
          ))}
        </div>
      )}
      {mode === "partner" && reportItems.length > 0 && (
        <div className="dp-campaign-native-report" aria-label={`${place.name} campaign performance`}>
          {reportItems.slice(0, 6).map(([label, value]) => (
            <span key={label}>
              <strong>{typeof value === "number" ? value.toLocaleString() : value}</strong>
              <small>{label}</small>
            </span>
          ))}
        </div>
      )}
      {mode === "partner" && <PartnerCampaignReviewSection place={place} />}
    </section>
  );
}

function ResidentDrawerActions({
  selected,
  selectedResidentAction,
  savedIds,
  eventRsvps = [],
  legendsListing,
  onRsvp,
  onShowCard,
  onAskMap,
  onSave,
  onTrackAction,
}) {
  const entityKind = getResidentEntityKind(selected);
  const panelArchetype = resolveEntityPanelArchetype(selected);
  const panelContent = resolveEntityPanelContent(selected, "resident");
  const isRental = entityKind === "rental";
  const isProperty = entityKind === "property";
  const isEvent = entityKind === "event";
  const isCampaign = entityKind === "campaign";
  const isAntonesVenue = isAntonesEntity(selected);
  const isCivicStop = isDaaTourPlace(selected) || isCivicEntity(selected) || isExploreDowntownEntity(selected);
  const hasPerk = hasActivePerkData(selected);
  const contacts = getContactDetails(selected);
  const websiteContact = contacts.find((item) => item.kind === "website");
  const viewPerk = () => document.querySelector(".dp-destination-drawer .dp-inkind-perk-zone, .dp-destination-drawer .dp-perk-module, .dp-destination-drawer .dp-happy-hour-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
  const exploreNearby = () => document.querySelector(".dp-destination-drawer .dp-discovery-context-section, .dp-destination-drawer .dp-property-nearby-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
  const sharePlace = async () => {
    onTrackAction?.("share", "resident_drawer_share");
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: selected.name, text: selected.summary || selected.description || selected.name, url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard?.writeText?.(shareUrl);
    } catch {
      // Sharing is best-effort; the visible action should never block the drawer.
    }
  };

  if (isCivicStop) {
    return null;
  }

  if (isRental) {
    const viewDetails = () => document.querySelector(".dp-destination-drawer .dp-rental-details")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return (
      <div className="dp-primary-action-row">
        <button type="button" onClick={viewDetails} className="dp-panel-action dp-primary-action">
          {panelArchetype.primaryAction}
        </button>
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : panelArchetype.secondaryAction}
        </button>
        <button type="button" onClick={onShowCard} className="dp-panel-action">
          Show Card
        </button>
      </div>
    );
  }

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
      <>
        <div className="dp-primary-action-row">
        <button type="button" onClick={exploreNearby} className="dp-panel-action dp-primary-action">
            {panelContent.primaryActionLabel || panelArchetype.primaryAction}
          </button>
          <button type="button" onClick={onSave} className="dp-panel-action">
            {savedIds.has(selected.id) ? "Saved" : panelArchetype.secondaryAction}
          </button>
          <button type="button" onClick={onShowCard} className="dp-panel-action">
            Show Card
          </button>
        </div>
      </>
    );
  }

  if (isCampaign) {
    return (
      <div className="dp-primary-action-row">
        <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
          {selected.primaryAction || "Start Campaign"}
        </button>
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("directions", "resident_campaign_route")}>
          Route
        </a>
      </div>
    );
  }

  if (isAntonesVenue) {
    return (
      <div className="dp-primary-action-row">
        <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("directions", "resident_antones_directions")}>
          Directions
        </a>
        <Link to={selectedResidentAction?.href || "/map?mode=resident&tab=map&filter=Events"} className="dp-panel-action">
          Upcoming Events
        </Link>
      </div>
    );
  }

  if (isInKindEntity(selected)) {
    return (
      <div className="dp-primary-action-row dp-editorial-hero-actions">
        <button type="button" onClick={viewPerk} className="dp-panel-action dp-primary-action">
          Claim Resident Perk
        </button>
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("directions", "resident_inkind_directions")}>
          Directions
        </a>
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
      </div>
    );
  }

  if (hasPerk && !isEvent) {
    return null;
  }

  return (
    <div className="dp-primary-action-row">
      {isEvent ? (
        <button type="button" onClick={onRsvp} className="dp-panel-action dp-primary-action">
          {(Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === selected.id) ? "Saved RSVP" : panelContent.primaryActionLabel || panelArchetype.primaryAction}
        </button>
      ) : hasPerk ? (
        <button type="button" onClick={viewPerk} className="dp-panel-action dp-primary-action">
          {panelContent.primaryActionLabel || panelArchetype.primaryAction}
        </button>
      ) : isCivicStop ? (
        <button type="button" onClick={exploreNearby} className="dp-panel-action dp-primary-action">
          Explore Nearby
        </button>
      ) : (
        <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
      )}
      {!isEvent && (hasPerk || isCivicStop) && (
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : "Save"}
        </button>
      )}
      {!isEvent && onShowCard && (
        <button type="button" onClick={onShowCard} className="dp-panel-action">
          Show Card
        </button>
      )}
      {!isEvent && (
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("directions", "resident_drawer_directions")}>
          Directions
        </a>
      )}
      {!isEvent && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("website", "resident_drawer_website")}>
          Website
        </a>
      )}
      {isEvent && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action" onClick={() => onTrackAction?.("website", "resident_event_website")}>
          {panelArchetype.secondaryAction}
        </a>
      )}
    </div>
  );
}

function isIndependentPropertyEntity(place) {
  const id = String(place?.id || place?.entityId || "").toLowerCase();
  const name = String(place?.name || place?.title || "").toLowerCase();
  return (
    id === "property-the-independent" ||
    id === "priority-the-independent" ||
    id === "luxury-building-the-independent" ||
    name === "the independent"
  );
}

function isTheShorePropertyEntity(place) {
  const id = String(place?.id || place?.entityId || "").toLowerCase();
  const name = String(place?.name || place?.title || "").toLowerCase();
  const address = String(place?.address || place?.raw?.address || "").toLowerCase();
  return (
    id === "property-the-shore" ||
    id === "priority-the-shore" ||
    id === "luxury-building-the-shore" ||
    name === "the shore" ||
    address.includes("603 davis")
  );
}

function usesCleanResidentialEntityDrawer(place) {
  if (hasNonResidentialActivationSignals(place)) return false;
  return isIndependentPropertyEntity(place) || isTheShorePropertyEntity(place) || isLegendsMapPlace(place) || isLegendsListingLike(place);
}

function CleanIndependentEntityDrawer({
  place,
  mode,
  places,
  savedIds,
  onSelect,
  onSave,
  onShowCard,
  onFilter,
  onRoute,
}) {
  const isPartnerMode = mode === "partner";
  const isSaved = savedIds?.has?.(place.id);
  const findByName = (name) => {
    const target = String(name || "").toLowerCase();
    return resolveMapEntityFromCollection(name, places)
      || places.find((candidate) => String(candidate?.name || "").toLowerCase() === target)
      || places.find((candidate) => String(candidate?.name || "").toLowerCase().includes(target));
  };
  const openRelatedEntity = (target) => {
    const match = findByName(target.id || target.title);
    if (match) onSelect(match);
  };
  const nearbyRows = [
    { title: "The Paseo", copy: "Residential + retail nearby", id: "priority-the-paseo" },
    { title: "The Waterline", copy: "Mixed-use district anchor", id: "priority-the-waterline" },
    { title: "Hotel Van Zandt", copy: "Rainey hotel and music-forward hospitality", id: "partner-hotel-van-zandt" },
    { title: "Geraldine's", copy: "Dinner, drinks, and live music nearby", id: "partner-geraldines" },
  ];
  const relatedRows = isPartnerMode
    ? [
        ["Seaholm", "Downtown district context", () => onRoute?.({ mode: "partner", tab: "map", district: "Seaholm", entityId: "" })],
        ["Campaigns", "Property campaigns around nearby activity", () => onRoute?.({ mode: "partner", tab: "campaigns", entityId: "" })],
        ["Reports", "What changed around this area", () => onRoute?.({ mode: "partner", tab: "reports", entityId: "" })],
      ]
    : [
        ["Seaholm", "Downtown district context", () => onRoute?.({ mode: "resident", tab: "map", district: "Seaholm", entityId: "" })],
        ["Perks Nearby", "Offers residents can use nearby", () => onRoute?.({ mode: "resident", tab: "perks", filter: "Perks", entityId: "" })],
        ["Events Nearby", "Plans and events close by", () => onRoute?.({ mode: "resident", tab: "events", entityId: "" })],
      ];

  return (
    <div className="dp-entity-drawer" role="document">
      <div className="dp-entity-handle" aria-hidden="true" />

      <figure className="dp-entity-hero dp-entity-hero-image">
        <img
          src={resolveMapImage({ id: "the-independent", name: "The Independent", type: "property" }, "drawerHeader")}
          alt="The Independent"
          loading="lazy"
          decoding="async"
        />
      </figure>

      <header className="dp-entity-summary">
        <p className="dp-entity-meta">Property · Seaholm</p>
        <h2>The Independent</h2>
        <p>A Seaholm residential tower connected to downtown dining, events, lake access, and everyday neighborhood routines.</p>
      </header>

      {isPartnerMode ? (
        <div className="dp-entity-action-row" aria-label="Partner actions">
          <Link to={campaignRoute(place)} className="dp-entity-action is-primary">Create Property Campaign</Link>
          <button type="button" className="dp-entity-action" onClick={() => onFilter?.("Activity")}>View Nearby Activity</button>
          <Link to={getPartnerDashboardRoute(place)} className="dp-entity-action">Open Dashboard</Link>
        </div>
      ) : (
        <div className="dp-entity-action-row" aria-label="Resident actions">
          <button type="button" className="dp-entity-action is-primary" onClick={() => onFilter?.("Perks")}>Perks Nearby</button>
          <button type="button" className="dp-entity-action" onClick={onShowCard}>Show Card</button>
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-entity-action">Get Directions</a>
          <button type="button" className="dp-entity-action" onClick={onSave}>{isSaved ? "Saved" : "Save"}</button>
        </div>
      )}

      <section className="dp-entity-section">
        <h3>Why it matters</h3>
        {isPartnerMode ? (
          <p>Residents nearby are saving dinner, fitness, and event plans around Seaholm. This property is a strong anchor for neighborhood-based campaigns.</p>
        ) : (
          <>
            <p>People do not choose a building only because of the unit. The neighborhood around it becomes part of the value.</p>
            <p>From The Independent, residents can move easily between Seaholm, the lake, coffee, dinner, fitness, and downtown events without turning every plan into a project.</p>
          </>
        )}
      </section>

      <section className="dp-entity-section">
        <h3>{isPartnerMode ? "Partner opportunity" : "Resident benefit"}</h3>
        <p>
          {isPartnerMode
            ? "Good for reaching residents when they are already choosing dinner, fitness, coffee, or a walkable plan nearby."
            : "Downtown Perks helps residents find nearby offers, events, dining, wellness, retail, and services from the places they already move through."}
        </p>
        <div className="dp-entity-text-rail" aria-label="Resident benefit examples">
          {["Dining nearby", "Fitness nearby", "Lake access", "Retail offers", "Weekend plans"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="dp-entity-section">
        <h3>Nearby</h3>
        <div className="dp-entity-row-list">
          {nearbyRows.map((row) => (
            <button key={row.title} type="button" className="dp-entity-row" onClick={() => openRelatedEntity(row)}>
              <span>
                <strong>{row.title}</strong>
                <small>{row.copy}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="dp-entity-section">
        <h3>Related</h3>
        <div className="dp-entity-row-list">
          {relatedRows.map(([title, copy, action]) => (
            <button key={title} type="button" className="dp-entity-row" onClick={action}>
              <span>
                <strong>{title}</strong>
                <small>{copy}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function TheShoreResidentialEntityDrawer({
  place,
  mode,
  places,
  savedIds,
  agentFormSubmitted,
  onSelect,
  onSave,
  onShowCard,
  onContact,
  onSubmitContact,
  onBack,
  onClose,
}) {
  const building = theShoreResidentialBuilding;
  const isPartnerMode = mode === "partner";
  const isSaved = savedIds?.has?.(place.id);
  const contactFormId = `shore-contact-form-${place.id}`;
  const availableHomesId = "shore-available-homes";
  const findByName = (name) => {
    const target = String(name || "").toLowerCase();
    return resolveMapEntityFromCollection(name, places)
      || places.find((candidate) => String(candidate?.name || "").toLowerCase() === target)
      || places.find((candidate) => String(candidate?.name || "").toLowerCase().includes(target));
  };
  const openRelatedEntity = (title) => {
    const match = findByName(title);
    if (match) onSelect(match);
  };
  const viewAvailableHomes = () => {
    document.getElementById(availableHomesId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const openContact = () => {
    onContact();
    window.setTimeout(() => {
      document.getElementById(contactFormId)?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 120);
  };

  return (
    <div className="dp-entity-drawer dp-shore-residential-drawer" role="document">
      <div className="dp-drawer-control-row" aria-label="Drawer controls">
        <button type="button" className="dp-drawer-control dp-drawer-back dp-drawer-back-icon" onClick={onBack} aria-label="Back to map">
          <ArrowLeft aria-hidden="true" />
        </button>
        <span className="dp-drawer-control-title">{building.name}</span>
        <button type="button" className="dp-drawer-icon-control dp-drawer-close" onClick={onClose} aria-label="Close panel">
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="dp-entity-handle" aria-hidden="true" />

      <figure className="dp-entity-hero dp-entity-hero-image">
        <img
          src={building.heroImage}
          alt="The Shore residential building near Lady Bird Lake"
          loading="lazy"
          decoding="async"
          onError={handlePanelImageError}
        />
      </figure>

      <header className="dp-entity-summary">
        <p className="dp-entity-meta">Residential Building · Rainey Street</p>
        <h2>{building.name}</h2>
        <p>{isPartnerMode ? building.partner.subheadline : building.subheadline}</p>
      </header>

      {isPartnerMode ? (
        <>
          <div className="dp-entity-action-row" aria-label="The Shore partner actions">
            <button type="button" className="dp-entity-action is-primary" onClick={() => openRelatedEntity("Hotel Van Zandt")}>Nearby Demand</button>
            <button type="button" className="dp-entity-action" onClick={onSave}>{isSaved ? "Saved" : "Save"}</button>
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-entity-action">Directions</a>
          </div>

          <section className="dp-entity-section">
            <h3>{building.partner.headline}</h3>
            <p>{building.partner.summary}</p>
          </section>

          <section className="dp-entity-section">
            <h3>Partner context</h3>
            <div className="dp-entity-row-list">
              {building.partner.insights.map(([title, copy]) => (
                <div key={title} className="dp-entity-row">
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="dp-entity-section">
            <h3>Nearby</h3>
            <div className="dp-entity-row-list">
              {building.nearby.map(([title, copy]) => (
                <button key={title} type="button" className="dp-entity-row" onClick={() => openRelatedEntity(title)}>
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="dp-entity-action-row" aria-label="The Shore residential actions">
            <button type="button" className="dp-entity-action is-primary" onClick={viewAvailableHomes}>{building.cta.primary}</button>
            <button type="button" className="dp-entity-action" onClick={onShowCard}>Show Card</button>
            <button type="button" className="dp-entity-action" onClick={onSave}>{isSaved ? "Saved" : "Save Building"}</button>
          </div>

          <section className="dp-entity-section">
            <h3>Overview</h3>
            <p>{building.overview}</p>
          </section>

          <section className="dp-entity-section">
            <h3>Building snapshot</h3>
            <div className="dp-entity-row-list">
              {building.snapshot.map(([label, value]) => (
                <div key={label} className="dp-entity-row">
                  <span>
                    <strong>{label}</strong>
                    <small>{value}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id={availableHomesId} className="dp-entity-section">
            <h3>Available Homes</h3>
            <div className="dp-shore-home-rail" aria-label="The Shore available homes">
              {building.availableHomes.map((home) => (
                <article key={home.id} className="dp-shore-home-card">
                  <img src={home.image} alt={`${home.address} listing`} loading="lazy" decoding="async" />
                  <div className="dp-shore-home-copy">
                    <div className="dp-shore-home-heading">
                      <strong>{home.address}</strong>
                      {home.badge && <span>{home.badge}</span>}
                    </div>
                    <p>{home.price}</p>
                    <small>{home.beds} bd · {home.baths} ba · {home.sqft} sqft · {home.status}</small>
                    <em>{home.description}</em>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dp-entity-section">
            <h3>Why residents choose The Shore</h3>
            <div className="dp-entity-row-list">
              {building.residentReasons.map(([title, copy]) => (
                <div key={title} className="dp-entity-row">
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="dp-entity-section">
            <h3>Nearby</h3>
            <div className="dp-entity-row-list">
              {building.nearby.map(([title, copy]) => (
                <button key={title} type="button" className="dp-entity-row" onClick={() => openRelatedEntity(title)}>
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="dp-entity-section">
            <h3>{building.cta.headline}</h3>
            <p>{building.cta.body}</p>
            <div className="dp-entity-action-row">
              <button type="button" className="dp-entity-action is-primary" onClick={viewAvailableHomes}>{building.cta.primary}</button>
              <button type="button" className="dp-entity-action" onClick={openContact} aria-controls={contactFormId}>{building.cta.secondary}</button>
            </div>
            <p className="dp-shore-disclaimer">{building.cta.footer}</p>
          </section>

          <form
            id={contactFormId}
            className="dp-contact-continuation dp-shore-contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmitContact();
            }}
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Interested?</div>
              <h3 className="mt-1 text-[16px] font-semibold text-[#0B1F33]">Contact Listing Agent</h3>
            </div>
            {agentFormSubmitted ? (
              <p className="mt-4 text-[13px] leading-5 text-[#0B1F33]/70">Sent. The request is ready with The Shore attached.</p>
            ) : (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                    Name
                    <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Your name" />
                  </label>
                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                    Email
                    <input required type="email" className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="you@example.com" />
                  </label>
                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                    Phone
                    <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" placeholder="Phone number" />
                  </label>
                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                    Timeline
                    <select required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70">
                      <option>ASAP</option>
                      <option>30-60 days</option>
                      <option>60-90 days</option>
                      <option>Just exploring</option>
                    </select>
                  </label>
                </div>
                <label className="mt-2 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                  Notes
                  <textarea name="message" className="min-h-20 dp-soft-field rounded-[8px] bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" defaultValue="I would like more information about available homes at The Shore." />
                </label>
                <button type="submit" className="dp-panel-action-text mt-5 inline-flex items-center gap-1.5">
                  Submit Interest
                  <Send className="h-3.5 w-3.5 text-[#C8A96A]" />
                </button>
              </>
            )}
          </form>
        </>
      )}
    </div>
  );
}

function getLegendsActiveListingRows(place, profile) {
  const rental = place?.rentalListing || place?.raw?.rentalListing || null;
  const legendsListing = getResolvedLegendsListing(place);
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const buildingListings = Array.isArray(luxuryBuilding?.listings) ? luxuryBuilding.listings : [];

  if (rental) {
    const facts = [
      rental.priceLabel,
      rental.beds ? `${rental.beds} bd` : "",
      rental.baths ? `${rental.baths} ba` : "",
      rental.sqft ? `${Number(rental.sqft).toLocaleString()} sqft` : "",
      rental.mls ? `MLS ${rental.mls}` : "",
    ].filter(Boolean).join(" · ");
    return [[`${rental.building} #${rental.unit}`, facts || "Active rental availability"]];
  }

  if (legendsListing) {
    const facts = [
      legendsListing.priceDisplay,
      legendsListing.beds ? `${legendsListing.beds} bd` : "",
      legendsListing.baths ? `${legendsListing.baths} ba` : "",
      legendsListing.sqftDisplay,
    ].filter(Boolean).join(" · ");
    return [[legendsListing.address || profile.buildingName, facts || "Active listing"]];
  }

  if (buildingListings.length) {
    return buildingListings.slice(0, 3).map((listing) => [
      listing.address || listing.unit || profile.buildingName,
      [listing.priceDisplay || listing.priceLabel, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqftDisplay].filter(Boolean).join(" · ") || "Listing detail available",
    ]);
  }

  return (profile.activeListings || []).slice(0, 3).map((item) => [item, "Availability changes quickly"]);
}

function getLegendsInquiryListing(place, profile) {
  const rental = place?.rentalListing || place?.raw?.rentalListing || null;
  const legendsListing = getResolvedLegendsListing(place);
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const firstBuildingListing = Array.isArray(luxuryBuilding?.listings) ? luxuryBuilding.listings[0] : null;
  const source = legendsListing || rental || firstBuildingListing || {};
  const address = source.address || rental?.address || profile?.buildingName || place?.address || place?.name || "Downtown Austin";
  const city = source.city || "Austin";
  const state = source.state || "TX";
  const zip = source.zip || source.postalCode || "78701";

  return {
    id: source.id || source.listingId || source.entityId || place?.id || "",
    name: source.name || source.title || source.buildingName || place?.name || place?.title || address,
    buildingName: source.buildingName || source.building_name || profile?.buildingName || place?.buildingName || place?.name || "",
    listingType: source.listingType || source.listing_type || rental?.listingType || "sale",
    listingTypeLabel: source.listingTypeLabel || source.listing_type_label || (rental ? "Rental" : "Residential"),
    address,
    city,
    state,
    zip,
    price: source.price || source.priceLabel || source.priceDisplay || rental?.priceLabel || "",
    priceDisplay: source.priceDisplay || source.priceLabel || rental?.priceLabel || "",
    beds: source.beds || rental?.beds || "",
    baths: source.baths || rental?.baths || "",
    sqft: source.sqft || rental?.sqft || "",
    sqftDisplay: source.sqftDisplay || (source.sqft ? `${Number(source.sqft).toLocaleString()} sqft` : ""),
    daysOnMarket: source.daysOnMarket || "",
    neighborhood: source.neighborhood || profile?.neighborhood || place?.district || "Downtown Austin",
    source: source.source || "Downtown Perks map",
    contactEmail: source.contactEmail || source.contact_email || profile?.contactEmail || profile?.contact_email || place?.contactEmail || place?.contact_email || place?.email || "",
    prefilledMessage: `I would like more information about ${address}.`,
  };
}

function LegendsResidentialIntelligenceDrawer({
  place,
  profile,
  mode,
  places,
  savedIds,
  onSelect,
  onSave,
  onFilter,
  onRoute,
  onBack,
  onClose,
}) {
  const isPartnerMode = mode === "partner";
  const isSaved = savedIds?.has?.(place.id);
  const listingRows = getLegendsActiveListingRows(place, profile);
  const hasActiveListings = listingRows.length > 0;
  const legendsInquiryFormId = `legends-inquiry-form-${place.id}`;
  const legendsAvailabilityId = `legends-active-listings-${place.id}`;
  const inquiryListing = getLegendsInquiryListing(place, profile);
  const [askMapQuestion, setAskMapQuestion] = useState("");
  const [activeAnalyticsInsight, setActiveAnalyticsInsight] = useState(legendsResidentialAnalytics[0]);
  const analyticsInsight = LEGENDS_ANALYTICS_INSIGHT_COPY[activeAnalyticsInsight] || LEGENDS_ANALYTICS_INSIGHT_COPY["Building Views"];
  const analyticsGroups = [
    ["Building", [
      ["Building Views", "Building opens"],
      ["Listing Views", "Home opens"],
      ["Save Rate", "Saves"],
      ["Tour Requests", "Tour requests"],
    ]],
    ["Nearby", [
      ["Neighborhood Opens", "Area opens"],
      ["Nearby Entity Clicks", "Nearby places"],
      ["Collection Opens", "Guide opens"],
      ["Comparison Opens", "Comparisons"],
    ]],
    ["Daily Life", [
      ["Walkability Interest", "Walkability"],
      ["Dining Interest", "Food nearby"],
      ["Wellness Interest", "Wellness nearby"],
      ["Lifestyle Benefit Engagement", "Most useful benefits"],
    ]],
  ];
  const safeText = (...values) => {
    for (const value of values) {
      const text = String(value ?? "").trim();
      if (text && !/^(undefined|null|nan|\[object object\])$/i.test(text)) return text;
    }
    return "";
  };
  const cleanTextList = (items = []) => items.filter((item) => safeText(item));
  const panelTitle = safeText(
    profile?.buildingName,
    place?.title,
    place?.name,
    place?.buildingName,
    inquiryListing?.buildingName,
    inquiryListing?.address,
    "70 Rainey",
  );
  const panelEyebrow = safeText(
    profile?.neighborhood,
    profile?.district,
    place?.neighborhood,
    place?.district,
    inquiryListing?.neighborhood,
    "Rainey",
  );
  const panelMeta = safeText(
    profile?.address,
    place?.address,
    inquiryListing?.address,
    "70 Rainey Street, Austin, TX 78701",
  );
  const rawPanelDek = safeText(profile?.headline);
  const panelDek = rawPanelDek && !/see what daily life feels like here/i.test(rawPanelDek)
    ? rawPanelDek
    : `Explore current listing details, nearby routines, and tour next steps with ${LEGENDS_BRAND_LINE}.`;
  const panelImage = safeText(profile?.heroImage, getLifestyleImage(place, mode));
  const cleanKeywordStuffing = (text) => String(text || "")
    .replace(/\b([a-z]+)\s*\+\s*([^+.]+)\s*\+\s*([^+.]+)/gi, (_match, first, second, third) => `${first}, ${String(second).trim()}, and ${String(third).trim()}`)
    .replace(/\bcongress avenue\s*\+\s*downtown core living\b/gi, "Congress Avenue and the Downtown Core")
    .replace(/\bRainey, the lake, hotel dining, and everyday routines\b/gi, "Congress Avenue, theaters, restaurants, coffee, errands, and the daily rhythm of downtown")
    .replace(/\bthe listing matters, but the neighborhood is what turns a building into a daily routine\./gi, "The listing gives you the home details. The map shows how the neighborhood fits real daily life.")
    .replace(/\s+/g, " ")
    .trim();
  const propertyOverview = cleanTextList(profile?.propertyOverview || []).map(cleanKeywordStuffing);
  const whyLivingHereMatters = cleanTextList(profile?.whyLivingHereMatters || []);
  const openInquiry = () => {
    document.getElementById(legendsInquiryFormId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const openAvailability = () => {
    document.getElementById(legendsAvailabilityId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const getNearbyCategory = (candidate) => {
    if (isCoffeeEntity(candidate)) return "Coffee";
    if (isDiningEntity(candidate)) return "Dining";
    if (coreMatches(candidate, FILTER_MATCHERS.Wellness) || String(candidate?.type || candidate?.kind || "").toLowerCase() === "wellness") return "Wellness";
    if (isBrandEntity(candidate) || coreMatches(candidate, FILTER_MATCHERS.Markets)) return "Retail";
    if (isCivicEntity(candidate)) return "Civic";
    if (isHotelEntity(candidate)) return "Hotel";
    return candidate?.category || candidate?.type || "Place";
  };
  const getNearbyIcon = (candidate) => {
    const category = getNearbyCategory(candidate).toLowerCase();
    if (category.includes("coffee")) return Coffee;
    if (category.includes("dining")) return Utensils;
    if (category.includes("wellness")) return Dumbbell;
    if (category.includes("retail")) return Sparkles;
    if (category.includes("civic")) return Landmark;
    if (category.includes("hotel")) return Building2;
    if (isEventEntity(candidate)) return CalendarDays;
    return MapPin;
  };
  const nearbyCards = places
    .filter((candidate) => {
      if (!candidate?.id || candidate.id === place?.id || !getPlaceCoords(candidate)) return false;
      if (isParkingEntity(candidate) || isServiceEntity(candidate) || isRentalEntity(candidate) || isListingEntity(candidate)) return false;
      if (getLegendsListing(candidate) || getLuxuryPresenceBuilding(candidate) || isPropertyEntity(candidate)) return false;
      return isCoffeeEntity(candidate) || isDiningEntity(candidate) || isHotelEntity(candidate) || isCivicEntity(candidate) || isEventEntity(candidate) || isBrandEntity(candidate);
    })
    .map((candidate) => ({ candidate, score: getMapDistanceScore(place, candidate) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map(({ candidate }) => candidate);
  const askPrompts = [
    "What is walkable from this building?",
    "Where should I get coffee nearby?",
    "What places become part of the weekly routine?",
    "How does this building compare with nearby options?",
  ];
  const submitAskMapQuestion = (question) => {
    const prompt = safeText(question);
    if (!prompt) return;
    onRoute?.({ mode: "resident", tab: "map", query: prompt, filter: "All", entityId: place.id });
  };

  return (
    <div className="dp-entity-drawer dp-legends-residential-drawer" role="document">
      <div className="dp-drawer-control-row" aria-label="Drawer controls">
        <button type="button" className="dp-drawer-control dp-drawer-back dp-drawer-back-icon" onClick={onBack} aria-label="Back to map">
          <ArrowLeft aria-hidden="true" />
        </button>
        <span className="dp-drawer-control-title">{panelTitle}</span>
        <button type="button" className="dp-drawer-icon-control dp-drawer-close" onClick={onClose} aria-label="Close panel">
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="dp-entity-handle" aria-hidden="true" />

      <figure className="dp-entity-hero dp-entity-hero-image">
        <img
          src={panelImage}
          alt={panelTitle}
          loading="lazy"
          decoding="async"
          onError={handlePanelImageError}
        />
      </figure>

      <header className="dp-entity-panel-header dp-entity-summary">
        <p className="dp-entity-eyebrow">{panelEyebrow}</p>
        <h2 className="dp-entity-title">{panelTitle}</h2>
        <p className="dp-entity-meta">{panelMeta}</p>
        <p className="dp-entity-dek">{panelDek}</p>
      </header>

      <section className="dp-legends-brand-card" aria-label="Legends Real Estate">
        <img src={LEGENDS_PIN_LOGO} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <span>
          <strong>{LEGENDS_BRAND_LINE}</strong>
          <small>Downtown listings, building context, showing requests, and nearby lifestyle guidance.</small>
        </span>
      </section>

      {!isPartnerMode && (
        <div className="dp-entity-action-row dp-legends-action-carousel" aria-label="Residential actions">
          <>
            {hasActiveListings && (
              <button type="button" className="dp-entity-action is-primary" onClick={openAvailability}>View Availability</button>
            )}
            <button type="button" className="dp-entity-action" onClick={onSave}>{isSaved ? "Saved Building" : "Save Building"}</button>
          </>
        </div>
      )}

      {isPartnerMode ? (
        <>
          <section className="dp-entity-section">
            <h3>What people are opening</h3>
            <div className="dp-legends-analytics-groups" aria-label="Legends analytics tracked">
              {analyticsGroups.map(([group, items]) => (
                <div key={group} className="dp-legends-analytics-group">
                  <p>{group}</p>
                  <div className="dp-legends-analytics-metric-list">
                    {items.map(([item, label]) => (
                      <button
                        key={item}
                        type="button"
                        className="dp-legends-analytics-metric"
                        aria-pressed={activeAnalyticsInsight === item}
                        onClick={() => setActiveAnalyticsInsight(item)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <article className="dp-legends-analytics-insight" aria-live="polite">
              <h4>{activeAnalyticsInsight}</h4>
              <dl>
                <div>
                  <dt>What it shows</dt>
                  <dd>{analyticsInsight.signal}</dd>
                </div>
                <div>
                  <dt>Why it matters</dt>
                  <dd>{analyticsInsight.why}</dd>
                </div>
                <div>
                  <dt>Next move</dt>
                  <dd>{analyticsInsight.action}</dd>
                </div>
              </dl>
            </article>
          </section>
        </>
      ) : (
        <>
          {!!propertyOverview.length && (
            <section className="dp-entity-section">
              <h3>Property overview</h3>
              {propertyOverview.map((line) => <p key={line}>{line}</p>)}
            </section>
          )}

          {!!whyLivingHereMatters.length && (
            <section className="dp-entity-section">
              <h3>Why living here matters</h3>
              {whyLivingHereMatters.map((line) => <p key={line}>{line}</p>)}
            </section>
          )}

          <section className="dp-entity-section">
            <h3>Explore nearby</h3>
            <div className="dp-entity-text-rail" aria-label="Nearby categories">
              {["Dining", "Coffee", "Wellness", "Retail"].map((label) => (
                <button key={label} type="button" className="dp-entity-text-chip" onClick={() => onFilter?.(label === "Retail" ? "Retail" : label)}>
                  {label}
                </button>
              ))}
            </div>
            {nearbyCards.length ? (
              <div className="dp-legends-nearby-grid">
                {nearbyCards.map((candidate) => {
                  const image = resolveEntityImage(candidate, "card");
                  const Icon = getNearbyIcon(candidate);
                  return (
                    <button key={candidate.id} type="button" className="dp-legends-nearby-card" onClick={() => onSelect(candidate)}>
                      <span className="dp-legends-nearby-card-media" aria-hidden="true">
                        {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <Icon className="h-4 w-4" />}
                      </span>
                      <span className="dp-legends-nearby-card-copy">
                        <strong>{candidate.name || candidate.title}</strong>
                        <span>{getNearbyCategory(candidate)} · {candidate.district || "Downtown Austin"}</span>
                        <em>Open pin</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p>No nearby registry matches are available for this building yet.</p>
            )}
          </section>

          <section className="dp-entity-section dp-legends-ask-map-section">
            <h3>Ask the Map</h3>
            <div className="dp-entity-text-rail" aria-label="Ask the Map prompts">
              {askPrompts.map((prompt) => (
                <button key={prompt} type="button" className="dp-entity-text-chip" onClick={() => submitAskMapQuestion(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="dp-legends-ask-map-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitAskMapQuestion(askMapQuestion);
              }}
            >
              <input
                value={askMapQuestion}
                onChange={(event) => setAskMapQuestion(event.target.value)}
                placeholder="Ask about this building"
                aria-label="Ask the Map about this building"
              />
              <button type="submit" className="dp-entity-action is-primary">Send</button>
            </form>
          </section>

          <section className="dp-entity-section">
            <h3>Legends Real Estate</h3>
            <p>Send a question, schedule a tour, compare nearby buildings, or save this listing while you decide what works for your routine.</p>
          </section>

          <section id={legendsAvailabilityId} className="dp-entity-section">
            <h3>Active listings</h3>
            {listingRows.length ? (
              <div className="dp-entity-row-list">
                {listingRows.map(([title, copy]) => (
                  <div key={`${title}-${copy}`} className="dp-entity-row">
                    <span>
                      <strong>{title}</strong>
                      <small>{copy} · Legends listing feed</small>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No active listings currently available for this building.</p>
            )}
          </section>

          <section className="dp-entity-section">
            <div className="dp-entity-action-row dp-legends-action-carousel">
              <button type="button" className="dp-entity-action is-primary" onClick={openInquiry}>Schedule Tour</button>
              <button type="button" className="dp-entity-action" onClick={() => onFilter?.("Legends")}>Compare Buildings</button>
            </div>
          </section>

          <section id={legendsInquiryFormId} className="dp-entity-section dp-legends-inquiry-section">
            <h3>Request information</h3>
            <p className="dp-legends-inquiry-intro">Your request goes to {LEGENDS_BRAND_LINE} with the building, listing, timing, and message attached.</p>
            <LegendsContactForm formId={`${legendsInquiryFormId}-form`} listing={inquiryListing} />
          </section>
        </>
      )}
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
  const resolveListingPanelImage = (image, source = {}) => {
    if (!image) return null;
    return resolveMapImage({
      ...place,
      ...source,
      image,
      primaryImage: image,
      panelImage: image,
    }, "drawerHeader");
  };

  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const luxuryListings = luxuryBuilding?.listings || [];
  const luxuryImage = luxuryBuilding?.panelImage || luxuryBuilding?.heroImage || luxuryBuilding?.buildingExterior || luxuryListings.find((listing) => listing?.heroImage)?.heroImage;
  if (luxuryImage) return resolveListingPanelImage(luxuryImage, luxuryBuilding);

  const directListing = getLegendsListing(place);
  if (directListing?.image) return resolveListingPanelImage(directListing.image, directListing);
  if (place?.image && String(place.image).includes("/images/legends-listings/")) return resolveListingPanelImage(place.image);
  if (place?.primaryImage && String(place.primaryImage).includes("/images/legends-listings/")) return resolveListingPanelImage(place.primaryImage);
  if (place?.panelImage && String(place.panelImage).includes("/images/legends-listings/")) return resolveListingPanelImage(place.panelImage);

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

  return resolveListingPanelImage(matchedListingPlace?.raw?.legendsListing?.image || matchedListingPlace?.image, matchedListingPlace);
}

function getLifestyleImage(place, mode) {
  const text = placeCoreText({ ...place, mode });
  const id = String(place?.id || place?.raw?.id || "").toLowerCase();
  const explicitPanelImages = [
    [/we all ride|bike mosaic|jmuzacz|daa-stop-04/, "/images/map-entities/civic/we-all-ride-mosaic-detail.webp"],
    [/central library|daa-stop-19/, "/images/map-entities/civic/austin-central-library-rooftop.avif"],
    [/republic square|daa-stop-08/, "/images/map-entities/perks/civic_republic_square_1779052838327.png"],
    [/palmer events center|daa-stop-26/, "/images/map-entities/events/palmer-events-center-grounds.webp"],
    [/mozart|jazz night|movies on the lake/, "/images/map-entities/events/mozarts-jazz.jpg"],
    [/summer wellness|fairmont spa|power flow|gentle yoga|recovery/, "/images/map-entities/fairmont-austin/summer-wellness-yoga.webp"],
    [/\balte[nñ]o\b/, "/images/map-entities/1-hotel-austin/alteno-rendering.webp"],
    [/\bwatr\b|1 hotel rooftop/, "/images/map-entities/1-hotel-austin/watr.webp"],
    [/\bneighbors\b|1 hotel cafe|wine bar/, "/images/map-entities/1-hotel-austin/waterline-hotel.avif"],
    [/rivian/, "/images/map-entities/brand-rivian/9JvnMPQ8kGuv11XCFhP4qI_0lIktNCTBBolhYsLAFdFrKtTRzkUq5Q31tv6T9ELH3voX6p5GdrTZtXeDJWPYBEvUKXwLboA0PHejrLBKAKZRKo7n0xwA5CQMUmC8eVeK__frO4QU1gVFAspV_WYn7zp3DhW7gT6T0Q9jZr3jl_veaPOYtJKM9M09OEVs68Sg.jpeg"],
    [/topo chico|hydration/, "/images/map-entities/brand-topo-chico/topo-chico-bottle-yellow.jpeg"],
    [/yeti/, "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg"],
    [/lustre pearl|happy-hour-lustre-pearl|partner-lustre-pearl-rainey/, "/images/imported/perks/brand-updates/lustre-pearl-happy-hour.png"],
    [/banger|sausage house|beer garden/, "/images/imported/perks/brand-updates/bangers-patio.jpg"],
    [/stay put|deep ellum/, "/images/imported/perks/brand-updates/stay-put-patio.png"],
    [/half step/, "/images/restaurants/half-step.jpg"],
    [/stagger lee/, "/images/imported/perks/happy-hour-2.png"],
    [/malin|public art|art walk|johnston/, "/images/map-entities/perks/downtown_art_walk_1779052670656.png"],
    [/honey rose ritual/, "/images/entities/four-seasons/honey-rose-ritual.png"],
    [/four seasons residences|partner-four-seasons|98 san jacinto/, "/images/property-listings-premium/four-seasons-residences.jpeg"],
    [/four seasons hotel|four seasons austin/, "/images/entities/four-seasons/four-seasons-austin-pool-garden.png"],
    [/waterline/, "/images/map/panels/waterline-austin.jpg"],
  ];
  const matched = explicitPanelImages.find(([pattern]) => pattern.test(`${id} ${text}`));
  if (matched) return matched[1];
  return getRelevantListingImage(place) || resolveMapImage({ ...place, mode }, "drawerHeader");
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
  if (kind === "property" || text.includes("building") || text.includes("residential")) return "center center";
  if (kind === "hotel" || text.includes("hotel")) return "center center";
  if (text.includes("via 313")) return "28% 24%";
  if (text.includes("lustre pearl")) return "50% 42%";
  if (text.includes("banger")) return "48% 42%";
  if (text.includes("stay put")) return "50% 38%";
  if (text.includes("stagger lee") || text.includes("half step")) return "50% 44%";
  if (text.includes("geraldine")) return "50% 42%";
  if (text.includes("anthem")) return "50% 45%";
  if (text.includes("emmer") || text.includes("rye")) return "50% 44%";
  return "center";
}

function handlePanelImageError(event) {
  const img = event.currentTarget;
  const contextualFallback = img.dataset.fallbackSrc;
  if (img.dataset.fallbackApplied !== "contextual" && contextualFallback && !String(img.getAttribute("src") || "").includes(contextualFallback)) {
    img.dataset.fallbackApplied = "contextual";
    img.src = contextualFallback;
    return;
  }
  if (img.dataset.fallbackApplied === "final") return;
  img.dataset.fallbackApplied = "final";
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
                  aria-label="Close"
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
  const isCivicLandmark = isDaaTourPlace(place) || /\b(civic|landmark|public art|public realm|park|trail|museum|library|lady bird|colorado river|congress bridge|waterloo|republic square|auditorium shores|shoal creek|waller creek)\b/i.test(coreText);

  if (isRentalEntity(place)) {
    return { label: "Ask the map", href: "/map?mode=resident&tab=map&filter=Rentals" };
  }

  if (type === "service" || category.includes("service") || category.includes("restoration") || coreText.includes("restoration")) {
    return { label: "More Services", href: "/map?mode=resident&tab=map&filter=Services" };
  }
  if (isHappyHourEntity(place)) {
    return { label: "Happy Hours", href: "/map?mode=resident&tab=map&filter=Happy%20Hours" };
  }
  if (isPropertyEntity(place) || isListingEntity(place)) {
    return { label: "View Property", href: mapRoutes.properties };
  }
  if (isCampaignEntity(place)) {
    return { label: place?.primaryAction || "Start Campaign", href: "/map?mode=resident&tab=map&filter=Campaigns" };
  }
  if (type === "perk" || category.includes("brand perk") || category.includes("resident perk")) {
    return { label: place?.primaryAction || "Use Perk", href: "/map?mode=resident&tab=map&filter=Perks" };
  }
  if (isCivicLandmark) {
    return { label: "Explore Nearby", href: "/map?mode=resident&tab=map&filter=Civic" };
  }
  if (isEventEntity(place) || coreText.includes("rsvp")) {
    return { label: "View Event", href: mapRoutes.events, canRsvp: true };
  }
  if (type === "hotel" || category.includes("hotel") || category.includes("hospitality")) {
    return { label: "View Hotels", href: "/map?mode=partner&tab=map&filter=Hotels" };
  }
  if (type === "brand" || category.includes("brand") || coreText.includes("legends real estate") || coreText.includes("yeti") || coreText.includes("rivian")) {
    return { label: "View Brand", href: "/map?mode=partner&tab=map&filter=Brands" };
  }
  if (isVenueEntity(place) || hasVenueSignals(place)) {
    return { label: isAntonesEntity(place) ? "Upcoming Events" : "View Venues", href: "/map?mode=resident&tab=map&filter=Events" };
  }
  return { label: "Explore Similar", href: mapRoutes.residentMap };
}

function getResidentEntityKind(place) {
  const text = placeCoreText(place);
  const category = String(place?.category || "").toLowerCase();
  const type = String(place?.type || "").toLowerCase();
  const isCivicLandmark = isDaaTourPlace(place) || /\b(civic|landmark|public art|public realm|park|trail|museum|library|lady bird|colorado river|congress bridge|waterloo|republic square|auditorium shores|shoal creek|waller creek)\b/i.test(text);

  if (isRentalEntity(place)) {
    return "rental";
  }

  if (isParkingEntity(place)) {
    return "parking";
  }

  if (isFrostTowerEntity(place) || type === "commercial_office" || category.includes("premium workplace")) {
    return "commercial_office";
  }

  if (type === "service" || category.includes("service") || category.includes("restoration") || text.includes("restoration")) {
    return "service";
  }

  if (isHappyHourEntity(place)) {
    return "happy_hour";
  }

  if (isPropertyEntity(place) || isListingEntity(place)) {
    return "property";
  }

  if (isCampaignEntity(place)) {
    return "campaign";
  }

  if (isCivicLandmark) {
    return "civic";
  }

  if (
    isEventEntity(place) ||
    text.includes("rsvp")
  ) {
    return "event";
  }

  if (type === "retail" || category.includes("retail") || isRetailBrandEntity(place)) {
    return "retail";
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

  if (isVenueEntity(place) || hasVenueSignals(place)) {
    return "venue";
  }

  return "place";
}

function getPartnerPrimaryActionLabel(place) {
  const kind = getResidentEntityKind(place);
  if (kind === "campaign") return "Review Campaign";
  if (kind === "parking") return "Promote Parking";
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
    ...(insights.fit ? [{ label: "Why it fits", value: insights.fit, emphasis: true }] : []),
    { label: "What people want", value: insights.intent },
    { label: "Who is nearby", value: insights.audience },
    { label: "What could help", value: insights.opportunity },
    { label: "Best timing", value: insights.timing, emphasis: true },
    { label: "Try this next", value: insights.action, emphasis: true },
  ];

  return (
    <section className="mt-4 dp-info-section p-3 md:mt-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Nearby guide</div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33] md:text-[20px]">How this place fits downtown</h3>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/70 md:text-[11px]">
          {insights.placement}
        </div>
      </div>

      <PanelInsightGrid items={insightItems} columns="md:grid-cols-3" />
    </section>
  );
}

function PartnerMetricInsight({ place }) {
  const insights = getPartnerBusinessInsights(place);

  return (
    <section className="mt-4 dp-info-section p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner next step</div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33] md:text-[20px]">What should happen next</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#425466]">{insights.action}</p>
        </div>
      </div>

      <PanelInsightGrid
        columns="md:grid-cols-3"
        items={[
          { label: "Nearby now", value: insights.intent },
          { label: "Why it matters", value: insights.audience },
          { label: "Next move", value: insights.action, emphasis: true },
        ]}
      />
    </section>
  );
}

function MapFocus({ selected }) {
  const map = useMap();
  const lastSelectedIdRef = useRef("");

  useEffect(() => {
    if (!selected) return;
    const selectedId = String(selected.id || selected.entityId || selected.name || "");
    if (selectedId && lastSelectedIdRef.current === selectedId) return;
    lastSelectedIdRef.current = selectedId;

    const coords = getPlaceCoords(selected);
    if (!coords) return;

    const panToSelected = () => {
      const size = map.getSize();
      const zoom = map.getZoom();
      const selectedPoint = map.project(coords, zoom);
      const desiredPoint = L.point(size.x * 0.5, size.y * (size.x < 768 ? 0.36 : 0.46));
      const currentCenterPoint = map.project(map.getCenter(), zoom);
      const centerPoint = selectedPoint.subtract(desiredPoint.subtract(size.divideBy(2)));
      const distance = currentCenterPoint.distanceTo(centerPoint);

      if (distance < 18) return;
      map.panTo(map.unproject(centerPoint, zoom), {
        animate: true,
        duration: 0.32,
        easeLinearity: 0.25,
      });
    };

    map.invalidateSize({ animate: false });
    window.requestAnimationFrame(panToSelected);
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

function getStoredMapView() {
  if (typeof window === "undefined") return { center: AUSTIN_CENTER, zoom: INITIAL_MAP_ZOOM };
  try {
    const params = new URLSearchParams(window.location.search || "");
    const hasSelectedEntity =
      Boolean(params.get("entityId")) ||
      Boolean(params.get("listing")) ||
      Boolean(params.get("listingId"));
    const isDefaultMapLaunch =
      !hasSelectedEntity &&
      !params.get("query") &&
      !params.get("q") &&
      ["All", "Perks"].includes(params.get("filter") || "Perks");
    if (isDefaultMapLaunch) {
      window.sessionStorage.removeItem(MAP_VIEW_STORAGE_KEY);
      return { center: AUSTIN_CENTER, zoom: INITIAL_MAP_ZOOM };
    }
    const parsed = JSON.parse(window.sessionStorage.getItem(MAP_VIEW_STORAGE_KEY) || "null");
    const center = Array.isArray(parsed?.center) ? parsed.center.map(Number) : null;
    const zoom = Number(parsed?.zoom);
    const validCenter = center?.length === 2 && center.every(Number.isFinite);
    const validZoom = Number.isFinite(zoom) && zoom >= 13 && zoom <= MAP_MAX_ZOOM;
    return {
      center: validCenter ? center : AUSTIN_CENTER,
      zoom: validZoom ? Math.min(zoom, hasSelectedEntity ? SELECTED_ROUTE_INITIAL_MAX_ZOOM : MAP_MAX_ZOOM) : INITIAL_MAP_ZOOM,
    };
  } catch {
    return { center: AUSTIN_CENTER, zoom: INITIAL_MAP_ZOOM };
  }
}

function MapViewPersistence() {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      window.sessionStorage.setItem(
        MAP_VIEW_STORAGE_KEY,
        JSON.stringify({ center: [center.lat, center.lng], zoom: map.getZoom() }),
      );
    },
    zoomend: () => {
      const center = map.getCenter();
      window.sessionStorage.setItem(
        MAP_VIEW_STORAGE_KEY,
        JSON.stringify({ center: [center.lat, center.lng], zoom: map.getZoom() }),
      );
    },
  });

  return null;
}

function MapInteractionCollapse({ onCollapse, onUserNavigate }) {
  useMapEvents({
    dragstart: () => {
      onUserNavigate?.();
      onCollapse?.();
    },
    zoomstart: () => {
      onUserNavigate?.();
    },
    movestart: () => {
      onUserNavigate?.();
    },
  });

  return null;
}

function MapViewportTracker({ onViewportChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onViewportChange?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: map.getZoom(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onViewportChange?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: map.getZoom(),
      });
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    onViewportChange?.({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
    });
  }, [map, onViewportChange]);

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

function MapResultBoundsFitter({ places = [], activeKey, selectedId, enabled = false }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    if (selectedId) return;
    const coords = places.map((place) => getPlaceCoords(place)).filter(Boolean);
    if (!coords.length) return;

    const frameId = window.requestAnimationFrame(() => {
      const size = map.getSize();
      const isCompact = size.x < 768 || size.y < 680;
      const topPadding = isCompact ? Math.min(132, Math.max(76, size.y * 0.18)) : 180;
      const bottomPadding = isCompact ? Math.min(132, Math.max(86, size.y * 0.20)) : 180;

      if (coords.length === 1) {
        map.flyTo(coords[0], Math.max(map.getZoom(), 16), {
          animate: true,
          duration: 0.45,
        });
        window.setTimeout(() => {
          map.panBy([0, -Math.min(120, Math.max(54, size.y * 0.16))], {
            animate: true,
            duration: 0.2,
          });
        }, 480);
        return;
      }

      const bounds = L.latLngBounds(coords);
      if (!bounds.isValid()) return;
      map.flyToBounds(bounds.pad(0.22), {
        animate: true,
        duration: 0.45,
        maxZoom: MAP_STREET_FOCUS_ZOOM,
        paddingTopLeft: [28, topPadding],
        paddingBottomRight: [28, bottomPadding],
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [map, activeKey, selectedId, places, enabled]);

  return null;
}

function GoogleMapCanvas({
  center,
  zoom,
  mapItems,
  collectionRoute,
  fitPlaces,
  fitActiveKey,
  fitEnabled,
  selected,
  selectedId,
  pulsingPinId,
  onSelect,
  onSelectNearestLegends,
  onClusterOpen,
  onZoomChange,
  onViewportChange,
  onUserNavigate,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const markersRef = useRef([]);
  const collectionRoutePolylinesRef = useRef([]);
  const lastFitKeyRef = useRef("");
  const lastSelectedFocusRef = useRef("");
  const userNavigatedRef = useRef(false);
  const programmaticMoveRef = useRef(false);
  const initialViewRef = useRef({ center, zoom });
  const interactionHandlersRef = useRef({ onUserNavigate, onViewportChange, onZoomChange });
  const [loadState, setLoadState] = useState(() => (getGoogleMapsConfigError() ? "error" : "loading"));
  const [loadError, setLoadError] = useState(() => getGoogleMapsConfigError());
  const [mapZoom, setMapZoom] = useState(() => Number(zoom) || INITIAL_MAP_ZOOM);

  useEffect(() => {
    interactionHandlersRef.current = { onUserNavigate, onViewportChange, onZoomChange };
  }, [onUserNavigate, onViewportChange, onZoomChange]);

  const markUserNavigated = useCallback(() => {
    if (programmaticMoveRef.current) return;
    userNavigatedRef.current = true;
    try {
      window.sessionStorage.setItem(MAP_USER_NAVIGATED_STORAGE_KEY, "true");
    } catch {
      // Viewport control is best-effort; storage failures should not block map gestures.
    }
    interactionHandlersRef.current.onUserNavigate?.();
  }, []);

  const runProgrammaticMove = useCallback((moveMap) => {
    programmaticMoveRef.current = true;
    moveMap();
    window.setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 350);
  }, []);

  const publishViewport = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds?.();
    const currentZoom = map.getZoom?.() || initialViewRef.current.zoom || INITIAL_MAP_ZOOM;
    setMapZoom(currentZoom);
    interactionHandlersRef.current.onZoomChange?.(currentZoom);
    if (!bounds) return;
    interactionHandlersRef.current.onViewportChange?.({
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
      zoom: currentZoom,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let readinessTimeoutId;
    let markedReady = false;
    const markMapReady = () => {
      if (cancelled || markedReady) return;
      markedReady = true;
      if (readinessTimeoutId) window.clearTimeout(readinessTimeoutId);
      setLoadState("ready");
      publishViewport();
    };
    const failMapLoad = (errorType = "authorization-failure") => {
      if (cancelled) return;
      if (readinessTimeoutId) window.clearTimeout(readinessTimeoutId);
      containerRef.current?.replaceChildren();
      setLoadState("error");
      setLoadError(errorType);
    };
    const configError = getGoogleMapsConfigError();
    if (configError) {
      setLoadState("error");
      setLoadError(configError);
      return undefined;
    }

    setLoadState("loading");
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapsRef.current = maps;
        try {
          if (!mapRef.current) {
            const initialView = initialViewRef.current;
            const googleMapId = import.meta.env.VITE_GOOGLE_MAP_ID || import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined;
            const mapOptions = {
              center: { lat: initialView.center[0], lng: initialView.center[1] },
              zoom: initialView.zoom,
              minZoom: 13,
              maxZoom: MAP_MAX_ZOOM,
              disableDefaultUI: true,
              clickableIcons: false,
              gestureHandling: "greedy",
              ...(googleMapId ? { mapId: googleMapId } : { styles: getInlineGoogleMapStyles() }),
            };
            mapRef.current = new maps.Map(containerRef.current, mapOptions);
            mapRef.current.addListener("dragstart", markUserNavigated);
            mapRef.current.addListener("drag", markUserNavigated);
            mapRef.current.addListener("dragend", markUserNavigated);
            mapRef.current.addListener("zoom_changed", markUserNavigated);
            mapRef.current.addListener("idle", () => {
              const map = mapRef.current;
              if (!map) return;
              if (containerRef.current?.querySelector(".gm-err-container")) {
                failMapLoad("authorization-failure");
                return;
              }
              const currentCenter = map.getCenter?.();
              if (currentCenter && !programmaticMoveRef.current) {
                window.sessionStorage.setItem(
                  MAP_VIEW_STORAGE_KEY,
                  JSON.stringify({ center: [currentCenter.lat(), currentCenter.lng()], zoom: map.getZoom() }),
                );
              }
              publishViewport();
              markMapReady();
            });
          } else if (containerRef.current.querySelector(".gm-style")) {
            markMapReady();
          }
        } catch (error) {
          if (cancelled) return;
          failMapLoad(/api|auth|key|billing|quota/i.test(error?.message || "") ? "authorization-failure" : "map-initialization-failure");
          return;
        }
        readinessTimeoutId = window.setTimeout(() => {
          if (cancelled || markedReady) return;
          if (containerRef.current?.querySelector(".gm-err-container")) {
            failMapLoad("authorization-failure");
            return;
          }
          if (containerRef.current?.querySelector(".gm-style")) {
            markMapReady();
            return;
          }
          failMapLoad("authorization-failure");
        }, 4500);
      })
      .catch((error) => {
        if (cancelled) return;
        failMapLoad(error?.message || "loader-failure");
      });

    return () => {
      cancelled = true;
      if (readinessTimeoutId) window.clearTimeout(readinessTimeoutId);
    };
  }, [markUserNavigated, publishViewport]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!selected) {
      lastSelectedFocusRef.current = "";
      return;
    }
    if (userNavigatedRef.current) return;
    const focusId = String(selectedId || selected.id || selected.entityId || selected.slug || selected.name || "");
    if (!focusId || lastSelectedFocusRef.current === focusId) return;
    const coords = getPlaceCoords(selected);
    if (!coords) return;
    lastSelectedFocusRef.current = focusId;
    runProgrammaticMove(() => {
      map.panTo({ lat: coords[0], lng: coords[1] });
      const currentZoom = map.getZoom?.() || INITIAL_MAP_ZOOM;
      if (currentZoom < INITIAL_MAP_ZOOM) map.setZoom(INITIAL_MAP_ZOOM);
    });
  }, [runProgrammaticMove, selected, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps || !fitEnabled || selectedId) return;
    if (userNavigatedRef.current) return;
    if (lastFitKeyRef.current === fitActiveKey) return;
    const coords = fitPlaces.map((place) => getPlaceCoords(place)).filter(Boolean);
    if (!coords.length) return;
    lastFitKeyRef.current = fitActiveKey;

    if (coords.length === 1) {
      runProgrammaticMove(() => {
        map.panTo({ lat: coords[0][0], lng: coords[0][1] });
        map.setZoom(Math.max(map.getZoom?.() || INITIAL_MAP_ZOOM, INITIAL_MAP_ZOOM));
      });
      return;
    }

    const bounds = new maps.LatLngBounds();
    coords.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
    runProgrammaticMove(() => {
      map.fitBounds(bounds, 64);
      maps.event.addListenerOnce(map, "bounds_changed", () => {
        if ((map.getZoom?.() || 0) < 15) map.setZoom(15);
        if ((map.getZoom?.() || 0) > MAP_STREET_FOCUS_ZOOM) map.setZoom(MAP_STREET_FOCUS_ZOOM);
      });
    });
  }, [fitActiveKey, fitEnabled, fitPlaces, runProgrammaticMove, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps || loadState !== "ready") return undefined;

    collectionRoutePolylinesRef.current.forEach((polyline) => polyline?.setMap?.(null));
    collectionRoutePolylinesRef.current = [];

    const routePath = collectionRoute?.routePath || [];
    if (routePath.length < 2) return undefined;

    const style = getCollectionRouteStyle(collectionRoute);
    const routeMetrics = getZoomRouteMetrics(mapZoom);
    const ambientRoute = new maps.Polyline({
      map,
      path: routePath,
      strokeColor: style.ambientColor,
      strokeOpacity: style.ambientOpacity,
      strokeWeight: routeMetrics.ambientStrokeWeight,
      clickable: false,
      zIndex: 18,
    });
    const overlapRoute = new maps.Polyline({
      map,
      path: routePath,
      strokeColor: style.overlapColor,
      strokeOpacity: style.overlapOpacity,
      strokeWeight: routeMetrics.overlapStrokeWeight,
      clickable: false,
      zIndex: 19,
    });
    const mainRoute = new maps.Polyline({
      map,
      path: routePath,
      strokeColor: style.mainColor,
      strokeOpacity: style.mainOpacity,
      strokeWeight: routeMetrics.strokeWeight,
      clickable: true,
      zIndex: 21,
      icons: [{
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: style.dotColor,
          fillOpacity: 0.92,
          strokeColor: style.overlapColor,
          strokeOpacity: 0.86,
          strokeWeight: 1.4,
          scale: style.isDashed ? routeMetrics.dashedDotScale : routeMetrics.dotScale,
        },
        offset: "14px",
        repeat: style.isDashed ? routeMetrics.dashedRepeat : routeMetrics.repeat,
      }],
    });

    collectionRoutePolylinesRef.current = [ambientRoute, overlapRoute, mainRoute];

    return () => {
      collectionRoutePolylinesRef.current.forEach((polyline) => polyline?.setMap?.(null));
      collectionRoutePolylinesRef.current = [];
    };
  }, [collectionRoute, loadState, mapZoom]);

  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps || loadState !== "ready") return undefined;

    markersRef.current.forEach((marker) => {
      if (marker?.map !== undefined) marker.map = null;
      else marker?.setMap?.(null);
    });
    markersRef.current = [];
    const canUseAdvancedMarkers = Boolean(
      maps.marker?.AdvancedMarkerElement &&
      (import.meta.env.VITE_GOOGLE_MAP_ID || import.meta.env.VITE_GOOGLE_MAPS_MAP_ID),
    );

    const collectionStopIds = new Set((collectionRoute?.stops || []).map((stop) => stop.id));
    const routeStopNumberById = new Map((collectionRoute?.stops || []).map((stop, index) => [stop.id, index + 1]));

    mapItems.forEach((item) => {
      if (item.type === "cluster") {
        const clusterPlaces = Array.isArray(item.places) ? item.places : [];
        if (collectionStopIds.size && !clusterPlaces.some((place) => collectionStopIds.has(place.id))) return;
        const element = document.createElement("button");
        element.type = "button";
        element.className = `dp-map-cluster ${item.count > 49 ? "is-large" : ""}`;
        element.innerHTML = `<span>${item.count > 99 ? "99+" : item.count}</span>`;
        element.setAttribute("aria-label", `Open ${item.count} places nearby`);
        applyZoomMarkerStyle(element, mapZoom, { clusterCount: item.count });
        element.addEventListener("click", () => {
          onClusterOpen(item);
          const bounds = new maps.LatLngBounds();
          clusterPlaces.map((place) => getPlaceCoords(place)).filter(Boolean).forEach(([lat, lng]) => bounds.extend({ lat, lng }));
          if (!bounds.isEmpty()) {
            runProgrammaticMove(() => {
              map.fitBounds(bounds, 64);
              maps.event.addListenerOnce(map, "bounds_changed", () => {
                if ((map.getZoom?.() || 0) > MAP_STREET_FOCUS_ZOOM) map.setZoom(MAP_STREET_FOCUS_ZOOM);
              });
            });
          }
        });

        const marker = canUseAdvancedMarkers
          ? new maps.marker.AdvancedMarkerElement({ map, position: { lat: item.coords[0], lng: item.coords[1] }, content: element, title: `${item.count} places nearby`, anchorLeft: "-50%", anchorTop: "-50%" })
          : new maps.Marker({
              map,
              position: { lat: item.coords[0], lng: item.coords[1] },
              title: `${item.count} places nearby`,
              icon: legacyDowntownClusterIcon(maps, item.count, mapZoom),
              optimized: true,
            });
        if (!canUseAdvancedMarkers) marker.addListener("click", () => onClusterOpen(item));
        markersRef.current.push(marker);
        return;
      }

      const place = routeStopNumberById.has(item.place?.id)
        ? { ...item.place, routeStopNumber: routeStopNumberById.get(item.place.id) }
        : item.place;
      const coords = getPlaceCoords(place);
      if (!coords) {
        if (import.meta.env.DEV) console.warn("[Downtown Perks] Invalid map coordinates", { id: place?.id, name: place?.name });
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "dp-google-map-marker-shell";
      applyZoomMarkerStyle(wrapper, mapZoom, { selected: place.id === selectedId });
      wrapper.innerHTML = mapPinButtonHtml({
        place,
        pin: resolveEntityPin(place),
        ariaLabel: `${place.name} details`,
        selected: place.id === selectedId,
        pulsing: place.id === pulsingPinId,
        classes: `${isEventEntity(place) ? "dp-live-pin--event" : ""} ${isHappyHourEntity(place) ? "dp-live-pin--happy-hour" : ""} ${isCampaignEntity(place) ? "dp-live-pin--campaign" : ""} ${isLegendsMapPlace(place) || getLegendsListing(place) ? "dp-live-pin--legends dp-live-pin--legends-logo" : ""} ${isRentalEntity(place) ? "dp-live-pin--rental" : ""} ${collectionStopIds.size && !collectionStopIds.has(place.id) ? "is-muted" : ""}`,
        zoom: mapZoom,
      });
      const button = wrapper.querySelector(".dp-map-pin");
      button?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(place);
      });
      button?.addEventListener("dblclick", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelectNearestLegends(place);
      });

      const marker = canUseAdvancedMarkers
        ? new maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: coords[0], lng: coords[1] },
            content: wrapper,
            title: place.name,
            anchorLeft: "-50%",
            anchorTop: "-50%",
          })
        : new maps.Marker({
            map,
            position: { lat: coords[0], lng: coords[1] },
            title: place.name,
            icon: legacyDowntownMarkerIcon(maps, place, place.id === selectedId, mapZoom),
            optimized: true,
          });

      if (!canUseAdvancedMarkers) {
        marker.addListener("click", () => onSelect(place));
      }
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => {
        if (marker?.map !== undefined) marker.map = null;
        else marker?.setMap?.(null);
      });
      markersRef.current = [];
    };
  }, [collectionRoute, loadState, mapItems, mapZoom, onClusterOpen, onSelect, onSelectNearestLegends, pulsingPinId, runProgrammaticMove, selectedId]);

  const isConfigError = loadError === "missing-api-key" || loadError === "invalid-api-key";
  const errorTitle = isConfigError ? "Google Maps is not configured." : "Google Maps could not load";
  const errorCopy = isConfigError
    ? "Add VITE_GOOGLE_MAPS_API_KEY to .env.local."
    : loadError === "authorization-failure"
      ? "Map could not load. Enable Maps JavaScript API for this browser key and check referrer restrictions."
      : "Map could not load. Check Google Maps API configuration.";

  return (
    <div className="dp-google-map-shell h-full w-full">
      <div ref={containerRef} className="dp-google-map-canvas h-full w-full" role="application" aria-label="Downtown Austin map" />
      {loadState === "loading" && (
        <div className="dp-google-map-state" role="status">
          <span>Loading downtown map...</span>
        </div>
      )}
      {loadState === "error" && (
        <div className="dp-google-map-state dp-google-map-state-error" role="alert">
          <strong>{errorTitle}</strong>
          <span>{errorCopy}</span>
        </div>
      )}
    </div>
  );
}

function GoogleMapFailureState() {
  return (
    <div className="dp-google-map-shell h-full w-full">
      <div className="dp-google-map-canvas h-full w-full" role="application" aria-label="Downtown Austin map" />
      <div className="dp-google-map-state dp-google-map-state-error" role="alert">
        <strong>Google Maps could not load</strong>
        <span>Map could not load. Enable Maps JavaScript API for this browser key and check referrer restrictions.</span>
      </div>
    </div>
  );
}

class GoogleMapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn("[Downtown Perks] Google Maps render failed", error);
    }
  }

  render() {
    if (this.state.hasError) return <GoogleMapFailureState />;
    return this.props.children;
  }
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
    onOpen(cluster);

    const bounds = L.latLngBounds(cluster.places.map((place) => [place.latitude, place.longitude]));
    if (bounds.isValid()) {
      map.flyToBounds(bounds.pad(0.18), {
        animate: true,
        duration: 0.55,
        maxZoom: Math.min(Math.max(map.getZoom() + 2, 16), 18),
        paddingTopLeft: [24, 112],
        paddingBottomRight: [24, 104],
      });
    } else {
      map.flyTo(cluster.coords, Math.min(map.getZoom() + 2, 18), { duration: 0.55 });
    }

    window.setTimeout(() => onOpen(cluster), 180);
    window.setTimeout(() => onOpen(cluster), 580);
  }, [cluster, map, onOpen]);

  useEffect(() => {
    let cleanup = null;
    let cancelled = false;
    let frameId = 0;

    const wireCluster = () => {
      const marker = markerRef.current;
      const element = marker?.getElement?.();
      if (!element) {
        if (!cancelled) frameId = window.requestAnimationFrame(wireCluster);
        return;
      }

      const handleExpand = (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.setTimeout(expandCluster, 40);
      };

      const handleKeyDown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        handleExpand(event);
      };

      const visibleCluster = element.querySelector(".dp-map-cluster");
      const targets = [element, visibleCluster].filter(Boolean);
      element.classList.add("dp-map-marker-hit-target");
      element.style.setProperty("background", "transparent", "important");
      element.style.setProperty("background-color", "transparent", "important");
      element.style.setProperty("border", "0", "important");
      element.style.setProperty("box-shadow", "none", "important");
      if (visibleCluster) {
        visibleCluster.style.setProperty("background", "#0B1F33", "important");
        visibleCluster.style.setProperty("background-color", "#0B1F33", "important");
        visibleCluster.style.setProperty("border", "1px solid #C8A96A", "important");
        visibleCluster.style.setProperty("color", "#FFFFFF", "important");
        visibleCluster.style.setProperty("box-shadow", "none", "important");
      }
      targets.forEach((target) => {
        target.addEventListener("mousedown", handleExpand, true);
        target.addEventListener("pointerdown", handleExpand, true);
        target.addEventListener("pointerup", handleExpand, true);
        target.addEventListener("click", handleExpand, true);
        target.addEventListener("keydown", handleKeyDown, true);
      });
      element.setAttribute("aria-label", `Open ${cluster.count} places nearby`);
      element.setAttribute("role", "button");
      element.setAttribute("tabindex", "0");
      visibleCluster?.setAttribute("role", "button");
      visibleCluster?.setAttribute("tabindex", "0");
      visibleCluster?.setAttribute("aria-label", `Open ${cluster.count} places nearby`);

      cleanup = () => {
        targets.forEach((target) => {
          target.removeEventListener("mousedown", handleExpand, true);
          target.removeEventListener("click", handleExpand, true);
          target.removeEventListener("pointerdown", handleExpand, true);
          target.removeEventListener("pointerup", handleExpand, true);
          target.removeEventListener("keydown", handleKeyDown, true);
        });
      };
    };

    wireCluster();

    return () => {
      cancelled = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [cluster.count, expandCluster]);

  return (
    <Marker
      ref={markerRef}
      position={cluster.coords}
      icon={clusterIcon(cluster.count, map.getZoom())}
      eventHandlers={{
        click: expandCluster,
      }}
    />
  );
}

function PlaceMarker({ place, selected, pulsing, onSelect, onSelectNearestLegends, onHover, onHoverEnd }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    let element = marker?.getElement?.();
    let retryId;

    const openPlace = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(place);
    };

    const openNearestLegends = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelectNearestLegends(place);
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      openPlace(event);
    };

    const attach = () => {
      element = marker?.getElement?.();
      if (!element) {
        retryId = window.setTimeout(attach, 60);
        return;
      }
      element.classList.add("dp-map-marker-hit-target");
      element.style.setProperty("background", "transparent", "important");
      element.style.setProperty("background-color", "transparent", "important");
      element.style.setProperty("border", "0", "important");
      element.style.setProperty("box-shadow", "none", "important");
      if (isLegendsMapPlace(place) || getLegendsListing(place)) {
        element.style.setProperty("z-index", selected ? "980" : "940", "important");
      }
      element.addEventListener("click", openPlace, true);
      element.addEventListener("pointerup", openPlace, true);
      element.addEventListener("mousedown", openPlace, true);
      element.addEventListener("dblclick", openNearestLegends, true);
      element.addEventListener("keydown", handleKeyDown, true);
      element.onclick = openPlace;
      element.setAttribute("tabindex", "0");
      element.setAttribute("role", "button");
      element.setAttribute("aria-label", `${place.name} details`);
      element.setAttribute(
        "onclick",
        `var u=new URL(window.location.href);u.searchParams.set('entityId','${escapeJsString(place.id)}');window.location.href=u.toString()`,
      );
    };

    attach();

    return () => {
      if (retryId) window.clearTimeout(retryId);
      if (!element) return;
      element.removeEventListener("click", openPlace, true);
      element.removeEventListener("pointerup", openPlace, true);
      element.removeEventListener("mousedown", openPlace, true);
      element.removeEventListener("dblclick", openNearestLegends, true);
      element.removeEventListener("keydown", handleKeyDown, true);
      element.onclick = null;
      element.removeAttribute("onclick");
    };
  }, [place, onSelect, onSelectNearestLegends]);

  return (
    <Marker
      ref={markerRef}
      position={place.coords}
      icon={pinIcon(place, selected, pulsing, map.getZoom())}
      keyboard
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

function getRailItemForMapState({ filter, collection, prompt }) {
  const rails = [...PRIMARY_SEARCH_INTENT_RAIL, ...SECONDARY_SEARCH_INTENT_RAIL];
  const normalizedPrompt = String(prompt || "").trim().toLowerCase();
  if (collection) return rails.find((item) => item.collection === collection) || null;
  const promptOwner = normalizedPrompt
    ? rails.find((item) => String(item.prompt || "").trim().toLowerCase() === normalizedPrompt)
    : null;
  const filterMatch = rails.find((item) => !item.collection && item.filter === filter) || null;
  if (promptOwner?.collection) return filterMatch;
  if (promptOwner && filterMatch && promptOwner.filter !== filterMatch.filter) return filterMatch;
  return promptOwner || filterMatch;
}

function workflowEntityType(place) {
  return String(place?.type || place?.category || place?.raw?.type || "place").toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
}

function SearchIntentConsole({
  mode,
  query,
  placeholder,
  activeIntent,
  activeTime,
  activeRadius,
  activeFilter,
  activeCollection,
  resultCount,
  inputRef,
  onQueryChange,
  onSubmit,
  onClear,
  onIntentSelect,
  onFilterSelect,
  onTimeSelect,
  onRadiusSelect,
  onCollectionSelect,
  onPromptSelect,
  onModeChange,
  isCollapsed = false,
  onCollapse,
  onExpand,
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const activeSearchLabel = query || activeFilter || "All";
  const promptPlaceholders = ["Coffee nearby", "What's happening tonight?", "Walkable dinner spots", "Happy hour near me"];
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % promptPlaceholders.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [promptPlaceholders.length]);

  const residentIntentRail = PRIMARY_SEARCH_INTENT_RAIL;
  const railIconFor = (item = {}) => {
    const text = `${item.id || ""} ${item.label || ""} ${item.filter || ""} ${item.kind || ""}`.toLowerCase();
    if (item.collection || /\b(route|walk|crawl|collection)\b/.test(text)) return Route;
    if (/\b(inkind|in kind)\b/.test(text)) return TicketPercent;
    if (/\b(legends)\b/.test(text)) return Star;
    if (/\b(breakfast|morning)\b/.test(text)) return Clock;
    if (/\b(brunch)\b/.test(text)) return CalendarRange;
    if (/\b(happy hour)\b/.test(text)) return BadgePercent;
    if (/\b(dessert|sushi)\b/.test(text)) return Sparkles;
    if (/\b(service|services|plumber|roof|legal|insurance|bank)\b/.test(text)) return BriefcaseBusiness;
    if (item.kind === "time" || /\b(tonight|week|event|rsvp)\b/.test(text)) return CalendarDays;
    if (item.kind === "radius" || /\b(walk|nearby|route|open now)\b/.test(text)) return Navigation;
    if (/\b(perk|offer|redemption)\b/.test(text)) return Gift;
    if (/\b(campaign|activation|promote|broadcast)\b/.test(text)) return Megaphone;
    if (/\b(audience|resident|guest|demand)\b/.test(text)) return Users;
    if (/\b(performance|activity|report|result|save|scan|visit)\b/.test(text)) return Activity;
    if (/\b(opportunit|next|trend|insight)\b/.test(text)) return TrendingUp;
    if (/\b(property|residential|listing|rental)\b/.test(text)) return Building2;
    if (/\b(hotel)\b/.test(text)) return Landmark;
    if (/\b(civic|explore|art|park|waterloo)\b/.test(text)) return Compass;
    if (/\b(brand|retail|shop)\b/.test(text)) return Sparkles;
    if (/\b(parking)\b/.test(text)) return Car;
    if (/\b(wellness|fitness)\b/.test(text)) return Heart;
    if (/\b(dining|food|lunch|dinner)\b/.test(text)) return Utensils;
    if (/\b(coffee)\b/.test(text)) return Coffee;
    if (/\b(drink|happy hour|nightlife)\b/.test(text)) return Wine;
    if (/\b(gap|coverage)\b/.test(text)) return Search;
    return Compass;
  };
  const withRailIcon = (item) => ({ ...item, icon: item.icon || railIconFor(item) });
  const intentRail = residentIntentRail;
  const rawMoreFilterRail = SECONDARY_SEARCH_INTENT_RAIL;
  const moreFilterRail = rawMoreFilterRail.filter((item) => (
    !intentRail.some((intentItem) => String(intentItem.label).toLowerCase() === String(item.label).toLowerCase())
  )).map(withRailIcon);

  const railKeyFor = (item) => String(item?.id || item?.label || item?.filter || item?.prompt || "").toLowerCase();
  const isRailItemActive = (item) => {
    if (item.collection) return activeCollection === item.collection;
    if (activeCollection) return false;
    if (item.kind === "time") return activeTime === item.time;
    if (item.kind === "radius") return activeRadius === item.radius;
    if (item.filter) return activeFilter === item.filter || activeSearchLabel.toLowerCase() === String(item.label).toLowerCase();
    return activeSearchLabel.toLowerCase() === String(item.label).toLowerCase();
  };
  const primaryCollectionActive = intentRail.some((item) => item.collection && isRailItemActive(item));
  const activeSecondaryItem = primaryCollectionActive ? null : moreFilterRail.find(isRailItemActive);
  const moreToggleLabel = activeSecondaryItem && !moreOpen ? `More · ${activeSecondaryItem.label}` : "More";
  const trackFilterRailEvent = (eventName, item, railState = moreOpen ? "expanded" : "collapsed") => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("dp:map-filter-rail", {
      detail: {
        eventName,
        filterName: item?.label || item?.filter || "More",
        filterGroup: activeSecondaryItem === item || moreFilterRail.includes(item) ? "secondary" : "primary",
        isSecondaryFilter: activeSecondaryItem === item || moreFilterRail.includes(item),
        railState,
        timestamp: new Date().toISOString(),
        mode,
      },
    }));
  };
  const handleMoreClick = (event) => {
    event.stopPropagation();
    setMoreOpen((value) => {
      const next = !value;
      trackFilterRailEvent(next ? "secondary_filter_rail_expanded" : "secondary_filter_rail_collapsed", null, next ? "expanded" : "collapsed");
      return next;
    });
  };
  const handleRailItem = (item) => {
    const isSecondaryFilter = moreFilterRail.includes(item);
    trackFilterRailEvent(isSecondaryFilter ? "secondary_filter_selected" : "filter_selected", item);
    if (item.collection) {
      onCollectionSelect?.(item.collection, item);
      return;
    }
    if (item.kind === "time") {
      onTimeSelect?.({ id: item.time, label: item.label, prompt: item.prompt });
      return;
    }
    if (item.kind === "radius") {
      onRadiusSelect?.({ id: item.id, label: item.radius, prompt: item.prompt });
      return;
    }
    onFilterSelect?.(item);
  };
  const focusSiblingTab = (event, direction) => {
    const container = event.currentTarget.closest('[role="tablist"]');
    if (!container) return;
    const tabs = Array.from(container.querySelectorAll('button[role="tab"], button'));
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0 || tabs.length < 2) return;
    const nextIndex = direction === "start"
      ? 0
      : direction === "end"
        ? tabs.length - 1
        : (currentIndex + direction + tabs.length) % tabs.length;
    tabs[nextIndex]?.focus();
  };
  const handleConsoleTabKeyDown = (event, selectCurrent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSiblingTab(event, -1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSiblingTab(event, 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusSiblingTab(event, "start");
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      focusSiblingTab(event, "end");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectCurrent?.();
    }
  };
  const renderRail = (items, className, label, options = {}) => (
    <div id={options.id} className={className} role="tablist" aria-label={label}>
      {items.flatMap((item, index) => {
        const Icon = item.icon;
        const active = isRailItemActive(item);
        const itemButton = (
          <button
            key={`${className}-${index}-${railKeyFor(item)}`}
            type="button"
            role="tab"
            className={active ? "is-active" : ""}
            aria-pressed={active}
            aria-selected={active}
            onClick={() => handleRailItem(item)}
            onKeyDown={(event) => handleConsoleTabKeyDown(event, () => handleRailItem(item))}
            title={item.label}
            aria-label={item.label}
            data-label={item.label}
          >
            {Icon ? (
              <Icon className="dp-search-intent-filter-icon" aria-hidden="true" />
            ) : null}
            <span className="dp-search-intent-filter-label">{item.label}</span>
          </button>
        );
        if (options.includeMoreToggle && index === options.insertMoreAfterIndex) {
          const MoreIcon = activeSecondaryItem?.icon || Compass;
          return [
            itemButton,
            <button
              key="more-filters-marker"
              type="button"
              className={`dp-search-more-toggle ${moreOpen || activeSecondaryItem ? "is-active" : ""}`}
              aria-expanded={moreOpen}
              aria-controls="dp-search-more-filter-panel"
              aria-label={moreToggleLabel}
              onClick={handleMoreClick}
              title={moreToggleLabel}
              data-label={moreToggleLabel}
            >
              <MoreIcon className="dp-search-intent-filter-icon" aria-hidden="true" />
              <span className="dp-search-intent-filter-label">{moreToggleLabel}</span>
            </button>,
          ];
        }
        return [itemButton];
      })}
      {options.includeMoreToggle && options.insertMoreAfterIndex == null ? (
        (() => {
          const MoreIcon = activeSecondaryItem?.icon || Compass;
          return (
        <button
          type="button"
          className={`dp-search-more-toggle ${moreOpen || activeSecondaryItem ? "is-active" : ""}`}
          aria-expanded={moreOpen}
          aria-controls="dp-search-more-filter-panel"
          aria-label={moreToggleLabel}
          onClick={handleMoreClick}
          title={moreToggleLabel}
          data-label={moreToggleLabel}
        >
          <MoreIcon className="dp-search-intent-filter-icon" aria-hidden="true" />
          <span className="dp-search-intent-filter-label">{moreToggleLabel}</span>
        </button>
          );
        })()
      ) : null}
    </div>
  );

  const renderCategoryRail = (items) => (
    <div className="dp-search-context-row dp-search-context-row-primary dp-search-more-filter-panel" role="tablist" aria-label="More map filters">
      {items.map((item) => {
        const normalizedActiveLabel = activeSearchLabel.toLowerCase();
        const normalizedItemLabel = String(item.label).toLowerCase();
        const labelMatches = normalizedActiveLabel === normalizedItemLabel;
        const active =
          labelMatches ||
          (item.filter === "All"
            ? item.label === "All" && activeFilter === "All" && normalizedActiveLabel === "all"
            : activeFilter === item.filter);
        return (
          <button
            key={`${item.label}-${item.filter}`}
            type="button"
            role="tab"
            aria-selected={active}
            className={`dp-console-chip dp-search-segment ${active ? "is-active" : ""}`}
            onClick={() => onFilterSelect?.(item)}
            onKeyDown={(event) => handleConsoleTabKeyDown(event, () => onFilterSelect?.(item))}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const renderModeSwitch = () => (
    <div className="dp-search-intent-switch dp-search-intent-audience-tabs" role="tablist" aria-label="Map audience">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "resident"}
        className={mode === "resident" ? "is-active" : ""}
        onClick={() => onModeChange("resident")}
        onKeyDown={(event) => handleConsoleTabKeyDown(event, () => onModeChange("resident"))}
      >
        Residents
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "partner"}
        className={mode === "partner" ? "is-active" : ""}
        onClick={() => onModeChange("partner")}
        onKeyDown={(event) => handleConsoleTabKeyDown(event, () => onModeChange("partner"))}
      >
        Partners
      </button>
    </div>
  );

  return (
    <div className={`dp-search-intent-console-wrap ${isCollapsed ? "is-collapsed" : ""}`}>
      <button
        type="button"
        className="dp-search-intent-rollup"
        aria-label="Expand search and filters"
        aria-expanded={!isCollapsed}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onExpand}
      >
        <span className="dp-search-brand-mark">
          <Sparkles className="dp-search-rollup-icon" aria-hidden="true" />
          <span className="dp-search-rollup-main">Ask the Map</span>
        </span>
      </button>
      <section
        className="dp-search-intent-console pointer-events-auto"
        role="region"
        aria-label="Map command console"
        aria-expanded={!isCollapsed}
        aria-hidden={isCollapsed}
        data-state={isCollapsed ? "collapsed" : "focused"}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="dp-search-intent-console-header dp-search-intent-top-rail">
          <div className="dp-search-intent-label">
            <span className="dp-search-brand-mark">
              <span>Ask the Map</span>
            </span>
          </div>
          <div className="dp-search-intent-top-actions">
            {renderModeSwitch()}
            <button
              type="button"
              className="dp-search-intent-collapse dp-search-intent-collapse-icon"
              aria-label="Collapse map search console"
              aria-expanded="true"
              onClick={onCollapse}
            >
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
        </div>

        <form className="dp-search-intent-form" onSubmit={onSubmit}>
          <div className="dp-search-intent-input-row">
            <Search className="dp-search-intent-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Ask the Map search"
              placeholder={promptPlaceholders[placeholderIndex]}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query && (
              <button type="button" className="dp-search-intent-clear" onClick={onClear} aria-label="Clear search">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button type="submit" className="dp-search-intent-submit" aria-label="Ask the Map">
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        {renderRail(
          intentRail,
          "dp-search-intent-prompt-rail",
          "Intent shortcuts",
          { includeMoreToggle: true, insertMoreAfterIndex: intentRail.length - 1 },
        )}
        {moreOpen ? renderRail(
          moreFilterRail,
          "dp-search-intent-filter-rail dp-search-context-row dp-search-context-row-primary dp-search-more-filter-panel",
          "More map filters",
          { id: "dp-search-more-filter-panel" },
        ) : (
          <div id="dp-search-more-filter-panel" hidden aria-hidden="true" />
        )}
        </section>
    </div>
  );
}

function useUrlMapState() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pathMode = location.pathname.startsWith("/partners") ? "partner" : "resident";
  const pathTab = "map";
  const rawTab = searchParams.get("tab") || pathTab;
  const rawPanel = searchParams.get("panel") || "";
  const mode = searchParams.get("mode") === "partner" ? "partner" : searchParams.get("mode") === "resident" ? "resident" : pathMode;
  const residentPanelCandidate = rawPanel || (rawTab === "home" ? "info" : rawTab);
  const panelCandidate = mode === "resident" ? residentPanelCandidate : rawPanel || rawTab;
  const panelTab = mode === "partner" && MAP_NATIVE_PARTNER_PANELS.includes(panelCandidate)
    ? panelCandidate
    : mode === "resident" && MAP_NATIVE_RESIDENT_PANELS.includes(panelCandidate)
      ? panelCandidate
      : "";
  const tab = rawTab === "pass" || rawTab === "card" ? "pass" : "map";
  const layer = searchParams.get("layer") || "";
  const collection = searchParams.get("collection") || "";
  const stopId = searchParams.get("stop") || "";
  const rentalListingId = layer === "rentals" ? searchParams.get("listing") || "" : "";
  const collectionFilter = getCollectionFilter(collection);
  const layerFilter = getLayerFilter(layer);
  const residentTabFilter = mode === "resident" && panelCandidate === "perks"
    ? "Perks"
    : mode === "resident" && panelCandidate === "events"
      ? "Events"
      : mode === "resident" && panelCandidate === "saved"
        ? "Saved"
        : "";
  const filter = searchParams.get("filter") || collectionFilter || residentTabFilter || (layer === "rentals" ? "Rentals" : layerFilter || (mode === "partner" ? "All" : "All"));
  const rawEntityId = searchParams.get("entityId") || searchParams.get("entity") || stopId || "";
  const listingId = searchParams.get("listingId") || "";
  const listingEntityId = resolveMapEntityAlias(listingId);
  const resolvedRawEntityId = resolveMapEntityAlias(rawEntityId);
  const entityId = rentalListingId || (listingEntityId === "bathe-austin" ? "bathe-austin" : resolvedRawEntityId || listingEntityId);
  const prompt = sanitizeMapPrompt(searchParams.get("query") || searchParams.get("prompt") || searchParams.get("q") || "", mode);
  const radius = searchParams.get("radius") || "5 min walk";
  const district = searchParams.get("district") || ALL_NEIGHBORHOODS;
  const time = searchParams.get("time") || "";
  const intent = searchParams.get("intent") || "";
  const entityType = searchParams.get("entityType") || "";
  const campaignId = searchParams.get("campaignId") || "";
  const drawerClosed = searchParams.get("drawerClosed") || "";

  function update(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params, { replace: false });
  }

  return { mode, tab, panelTab, filter, layer, collection, stopId, rawEntityId, entityId, listingId, rentalListingId, prompt, radius, district, time, intent, entityType, campaignId, drawerClosed, update };
}

export default function MapPage() {
  const navigate = useNavigate();
  const places = useMapEntityData();
  const urlState = useUrlMapState();
  const [initialMapView] = useState(() => getStoredMapView());
  const [search, setSearch] = useState(urlState.prompt);
  const [activeFilter, setActiveFilter] = useState(FILTERS.includes(urlState.filter) ? urlState.filter : "All");
  const [selectedId, setSelectedId] = useState(urlState.entityId);
  const [selectedPlaceOverride, setSelectedPlaceOverride] = useState(null);
  const [savedIds, setSavedIds] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(window.localStorage.getItem("downtown-perks-card-items") || "[]"));
    } catch {
      return new Set();
    }
  });
  const eventRsvps = useEventRsvpStore((state) => (Array.isArray(state.rsvps) ? state.rsvps : []));
  const addEventRsvp = useEventRsvpStore((state) => state.addRsvp);
  const removeEventRsvp = useEventRsvpStore((state) => state.removeRsvp);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [radius, setRadius] = useState(urlState.radius);
  const [residentSearchIntent, setResidentSearchIntent] = useState({
    intent: RESIDENT_INTENT_CONSOLE_BUTTONS.some((item) => item.id === urlState.intent) ? urlState.intent : null,
    time: RESIDENT_INTENT_TIME_BUTTONS.some((item) => item.id === urlState.time) ? urlState.time : null,
  });
  const [district, setDistrict] = useState(urlState.district);
  const [passPresented, setPassPresented] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const [residentQrModal, setResidentQrModal] = useState(null);
  const [redeemedPerkIds] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(window.localStorage.getItem("downtown-perks-redeemed-perks") || "[]"));
    } catch {
      return new Set();
    }
  });
  const buildMapActionPayload = useCallback((place = null, action = "explore", source = "resident_map", extra = {}) => {
    const raw = place?.raw || {};
    const entityId = getEntityTouchpointId(place);
    const entityName = getEntityTouchpointName(place);
    const entityType = workflowEntityType(place || {});
    const partnerId = place?.partnerId || raw.partnerId || raw.partner_id || raw.ownerId || raw.owner_id || "";
    const workspaceId = place?.workspaceId || raw.workspaceId || raw.workspace_id || partnerId || "";
    const campaignId = place?.campaignId || raw.campaignId || raw.campaign_id || urlState.campaignId || "";
    const route = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const form = extra.form && typeof extra.form === "object" ? extra.form : {};
    const metadata = extra.metadata && typeof extra.metadata === "object" ? extra.metadata : {};

    return {
      id: extra.id || `${action}-${entityId}-${Date.now()}`,
      action,
      mode: urlState.mode,
      sessionId: getWorkflowSessionId(),
      profileId: getWorkflowProfileId(),
      source,
      pageUrl,
      route,
      filter: activeFilter,
      collection: urlState.collection,
      campaignId,
      partnerId,
      workspaceId,
      listingId: place?.listingId || raw.listingId || raw.listing_id || "",
      entity: {
        id: entityId,
        name: entityName,
        type: entityType,
        category: place?.category || raw.category || "",
        district: place?.district || raw.district || district || "",
        address: place?.address || raw.address || "",
        partnerId,
        workspaceId,
        campaignId,
        brand: place?.brand || raw.brand || raw.partnerName || raw.partner_name || "",
      },
      standard: {
        category: form.category || place?.category || raw.category || entityType,
        intent: form.intent || action,
        label: form.label || place?.primaryAction || action,
      },
      form,
      metadata: {
        ...metadata,
        district,
        entityKind: getResidentEntityKind(place),
      },
    };
  }, [activeFilter, district, urlState.campaignId, urlState.collection, urlState.mode]);
  const openResidentQrModal = useCallback((place = null, action = "show_card", source = "resident_map") => {
    const payload = buildResidentQrPayload({ place, action, source });
    const mapAction = action === "use_perk" ? "redeem" : "show_card";
    const expiresAt = action === "use_perk" ? new Date(Date.now() + 10 * 60 * 1000).toISOString() : "";
    const workflowPayload = buildMapActionPayload(place, mapAction, source, {
      form: {
        intent: action,
        label: action === "use_perk" ? "Use resident perk" : "Show resident card",
        perkId: payload.entityId,
        qrValue: payload.qrValue,
        status: action === "use_perk" ? "ready" : "presented",
        expiresAt,
      },
      metadata: { ...payload, expiresAt },
    });
    if (action === "use_perk") {
      fireWorkflow(`/api/perks/${encodeURIComponent(payload.entityId)}/redemption-token`, {
        ...workflowPayload,
        token: payload.qrValue,
        qrPayload: payload.qrValue,
        status: "ready",
        expiresAt,
      });
    }
    fireWorkflow("/api/map-actions", workflowPayload);
    fireWorkflow("/api/redeem", {
      ...payload,
      ...workflowPayload,
      action,
      status: action === "use_perk" ? "ready" : "presented",
      expiresAt,
    });
    recordResidentTouchpoint(payload);
    setPassPresented(true);
    setResidentQrModal({ ...payload, place, redemptionStatus: action === "use_perk" ? "ready" : "presented", expiresAt });
  }, [buildMapActionPayload]);
  const residentCardPayload = useMemo(() => buildResidentQrPayload({ action: "show_card", source: "resident_card" }), []);
  const presentResidentPass = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    openResidentQrModal(null, "show_card", "resident_pass");
  }, [openResidentQrModal]);
  const saveResidentPassForLater = useCallback(async (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try {
      await postWorkflow("/api/map-actions", {
        action: "add_wallet",
        type: "resident_card",
        profileId: getWorkflowProfileId(),
        sessionId: getWorkflowSessionId(),
        source: "resident_card_sheet",
        payload: residentCardPayload,
      });
      setWalletAdded(true);
    } catch (error) {
      console.warn("Wallet action failed", error);
      if (typeof window !== "undefined") {
        window.alert("We couldn't add the card right now. Please try again.");
      }
    }
  }, [residentCardPayload]);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState(() => (
    urlState.panelTab
      ? urlState.panelTab
      : urlState.mode === "resident" && urlState.tab === "map" && ["Perks", "Events", "Saved"].includes(urlState.filter)
        ? urlState.filter.toLowerCase()
        : "map"
  ));
  const [activeCampaignStep, setActiveCampaignStep] = useState(urlState.campaignId || "campaign-after-work-dining");
  const [clusterDrawer, setClusterDrawer] = useState(null);
  const [mapZoom, setMapZoom] = useState(initialMapView.zoom);
  const [viewportBounds, setViewportBounds] = useState(null);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);

  useEffect(() => {
    if (urlState.campaignId && urlState.campaignId !== activeCampaignStep) {
      setActiveCampaignStep(urlState.campaignId);
    }
  }, [activeCampaignStep, urlState.campaignId]);
  const [secondaryRailOpen, setSecondaryRailOpen] = useState(false);
  const [mapAnswer, setMapAnswer] = useState(null);
  const [userHasNavigatedMap, setUserHasNavigatedMap] = useState(() => {
    if (initialMapView.zoom >= STREET_LEVEL_ZOOM) return true;
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(MAP_USER_NAVIGATED_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [userInteractionContext, setUserInteractionContext] = useState(() => {
    if (typeof window === "undefined") return { actions: [], searches: [], selectedPins: [], savedPins: [] };
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(MAP_USER_CONTEXT_STORAGE_KEY) || "null");
      return parsed && typeof parsed === "object"
        ? { actions: parsed.actions || [], searches: parsed.searches || [], selectedPins: parsed.selectedPins || [], savedPins: parsed.savedPins || [] }
        : { actions: [], searches: [], selectedPins: [], savedPins: [] };
    } catch {
      return { actions: [], searches: [], selectedPins: [], savedPins: [] };
    }
  });
  const [entityAnswer, setEntityAnswer] = useState(null);
  const [entityAssistantLoading, setEntityAssistantLoading] = useState(false);
  const [selectedDrawerClosed, setSelectedDrawerClosed] = useState(false);
  const [selectedDrawerMinimized, setSelectedDrawerMinimized] = useState(false);
  const searchInputRef = useRef(null);
  const searchRollupRef = useRef(null);
  const updateViewportBounds = useCallback((bounds) => {
    setViewportBounds((current) => {
      if (
        current &&
        Math.abs(current.north - bounds.north) < 0.00001 &&
        Math.abs(current.south - bounds.south) < 0.00001 &&
        Math.abs(current.east - bounds.east) < 0.00001 &&
        Math.abs(current.west - bounds.west) < 0.00001 &&
        Math.abs((current.zoom || 0) - (bounds.zoom || 0)) < 0.01
      ) {
        return current;
      }
      return bounds;
    });
  }, []);
  const recordMapUserAction = useCallback((type, detail = {}) => {
    const action = {
      type,
      ...detail,
      timestamp: new Date().toISOString(),
    };
    setUserInteractionContext((current) => {
      const searches = type === "search" && detail.query
        ? [detail.query, ...(current.searches || []).filter((item) => item !== detail.query)].slice(0, 8)
        : (current.searches || []).slice(0, 8);
      const selectedPins = type === "select_pin" && detail.entityId
        ? [detail.entityId, ...(current.selectedPins || []).filter((item) => item !== detail.entityId)].slice(0, 12)
        : (current.selectedPins || []).slice(0, 12);
      const savedPins = type === "save" && detail.entityId
        ? [detail.entityId, ...(current.savedPins || []).filter((item) => item !== detail.entityId)].slice(0, 20)
        : type === "unsave" && detail.entityId
          ? (current.savedPins || []).filter((item) => item !== detail.entityId).slice(0, 20)
          : (current.savedPins || []).slice(0, 20);
      const next = {
        actions: [action, ...(current.actions || [])].slice(0, 40),
        searches,
        selectedPins,
        savedPins,
      };
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(MAP_USER_CONTEXT_STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // Session memory is best-effort and should never block map behavior.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (urlState.panelTab) {
      setActiveBottomTab(urlState.panelTab);
      setConsoleCollapsed(true);
      setSelectedId("");
      setClusterDrawer(null);
    }
  }, [urlState.panelTab]);
  const [pulsingPinId, setPulsingPinId] = useState("");
  const [agentFormPlaceId, setAgentFormPlaceId] = useState("");
  const [agentFormSubmitted, setAgentFormSubmitted] = useState(false);
  useEffect(() => {
    const railItem = getRailItemForMapState({
      filter: urlState.filter,
      collection: urlState.collection,
      prompt: urlState.prompt,
    });
    const nextPrompt = railItem?.prompt && urlState.prompt && railItem.prompt !== urlState.prompt
      ? railItem.prompt
      : urlState.prompt;
    setSearch(nextPrompt);
    if (nextPrompt && nextPrompt !== urlState.prompt) {
      urlState.update({ query: nextPrompt });
    }
  }, [urlState.prompt, urlState.filter, urlState.collection]);

  useEffect(() => {
    setEntityAnswer(null);
    setEntityAssistantLoading(false);
    setSelectedDrawerMinimized(false);
  }, [selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("downtown-perks-card-items", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  useEffect(() => {
    if (consoleCollapsed || urlState.tab !== "map") return undefined;
    const focusId = window.setTimeout(() => {
      searchInputRef.current?.focus?.({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(focusId);
  }, [consoleCollapsed, urlState.tab]);

  useEffect(() => {
    setActiveFilter(FILTERS.includes(urlState.filter) ? urlState.filter : "All");
  }, [urlState.filter]);

  useEffect(() => {
    if (!urlState.entityId) {
      setSelectedId("");
      setSelectedPlaceOverride(null);
      setSelectedDrawerClosed(true);
      setSelectedDrawerMinimized(false);
      setClusterDrawer(null);
      setMapAnswer(null);
      return;
    }
    const nextSelectedId = resolveMapEntityAlias(urlState.entityId);
    setSelectedId(nextSelectedId);
    setSelectedPlaceOverride(null);
    setMapAnswer(null);
    setEntityAnswer(null);
    setSearch("");
    setSelectedDrawerClosed(false);
  }, [selectedId, urlState.entityId]);

  useEffect(() => {
    if (!urlState.drawerClosed) return;
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab("map");
  }, [urlState.drawerClosed]);

  useEffect(() => {
    if (!urlState.rawEntityId) return;
    const publicPropertyId = resolvePropertyUrlEntityId(urlState.rawEntityId);
    if (!publicPropertyId || publicPropertyId === urlState.rawEntityId) return;
    const next = { entityId: publicPropertyId };
    if (!urlState.listingId) next.listingId = resolvePropertyListingUrlId(urlState.rawEntityId);
    urlState.update(next);
  }, [urlState.rawEntityId, urlState.listingId]);

  useEffect(() => {
    setAgentFormPlaceId("");
    setAgentFormSubmitted(false);
  }, [selectedId]);

  useEffect(() => {
    setDistrict(urlState.district);
  }, [urlState.district]);

  useEffect(() => {
    setActiveFilter(FILTERS.includes(urlState.filter) ? urlState.filter : "All");
  }, [urlState.filter]);

  const effectiveSearch = useMemo(() => {
    return sanitizeMapPrompt(search, urlState.mode);
  }, [search, urlState.mode]);
  const consoleHasActiveWork = Boolean(effectiveSearch || mapAnswer || filtersOpen || neighborhoodsOpen || intelOpen);

  useEffect(() => {
    if (mapZoom < STREET_LEVEL_ZOOM) return;
    setUserHasNavigatedMap(true);
    try {
      window.sessionStorage.setItem(MAP_USER_NAVIGATED_STORAGE_KEY, "true");
    } catch {
      // Session storage can be unavailable; keep the in-memory camera lock.
    }
  }, [mapZoom]);

  useEffect(() => {
    const scopedResultSet = Boolean(effectiveSearch) || !isAllNeighborhoodScope(district);
    if (!scopedResultSet || selectedId) return;
    if (effectiveSearch) {
      setConsoleCollapsed(false);
      return;
    }
    setConsoleCollapsed(activeFilter === "Legends" || activeFilter === "Listings");
  }, [activeFilter, effectiveSearch, district, selectedId, urlState.mode]);

  const neighborhoodBasePlaces = useMemo(() => {
    const query = effectiveSearch.toLowerCase();
    const intentTokens = getIntentTokens(query);
    const parsed = parseMapIntent(query, urlState.mode);
    const parsedIntents = Array.isArray(parsed.intents) ? parsed.intents : [];
    const isBroadPartnerIntent = urlState.mode === "partner" && parsedIntents.some((intent) => ["partner_opportunity", "partner_coverage", "partner_performance", "partner_campaigns"].includes(intent));
    const isCivicLayerIntent = activeFilter === "Civic" || parsedIntents.includes("DAA_art_walk") || /\b(daa|dana|waterloo|art walk|public art|civic)\b/i.test(query);
    return places.filter((place) => {
      if (!matchesCollection(place, urlState.collection)) return false;
      if (!matchesFilter(place, activeFilter, savedIds)) return false;
      if (isCivicLayerIntent && (isCivicEntity(place) || getDaaStopFromPlace(place))) return true;
      if (isIntentOnlyFilter(activeFilter)) return true;
      if (!query) return true;
      const text = placeText(place);
      return (
        isBroadPartnerIntent ||
        text.includes(query) ||
        intentTokens.some((token) => text.includes(token)) ||
        parsedIntents.some((intent) => text.includes(String(intent).toLowerCase().replace(/_/g, " "))) ||
        (query.includes("perk") && hasActivePerkData(place))
      );
    });
  }, [places, effectiveSearch, activeFilter, savedIds, urlState.mode, urlState.collection]);

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
    return places.filter((place) => savedIds.has(place.id));
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
    () => {
      if (!selectedId) return null;
      const overrideId = selectedPlaceOverride?.id ? resolveMapEntityAlias(selectedPlaceOverride.id) : "";
      const override = overrideId && overrideId === selectedId ? selectedPlaceOverride : null;
      const candidate = resolveMapEntityFromCollection(selectedId, places) || resolveMapEntityFromCollection(selectedId, luxuryPresenceListingPlaces) || override || null;
      if (!candidate) return null;
      if ((activeFilter !== "All" || urlState.collection || effectiveSearch) && !matchesFilter(candidate, activeFilter, savedIds)) return null;
      return candidate;
    },
    [activeFilter, effectiveSearch, luxuryPresenceListingPlaces, places, savedIds, selectedId, selectedPlaceOverride, urlState.collection],
  );
  const selectedResidentAction = useMemo(
    () => (selected ? getResidentDetailAction(selected) : null),
    [selected],
  );

  useEffect(() => {
    if (!selected?.id || selectedDrawerClosed) return;
    window.requestAnimationFrame(() => {
      document.querySelectorAll(".dp-detail-drawer .dp-drawer-scroll, .dp-detail-drawer .dp-map-panel-scroll, .dp-destination-drawer .dp-destination-scroll").forEach((node) => {
        node.scrollTop = 0;
      });
    });
  }, [selected?.id, selectedDrawerClosed]);

  useEffect(() => {
    if (!selectedId || !selected) return;
    if (activeFilter === "All" && !urlState.collection && !effectiveSearch) return;
    if (matchesFilter(selected, activeFilter, savedIds)) return;
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    urlState.update({ entityId: "" });
  }, [activeFilter, effectiveSearch, savedIds, selected, selectedId, urlState]);

  const clusterPlacesForDrawer = clusterDrawer?.places || [];

  const hasActiveCategoryScope = activeFilter !== "All" || !isAllNeighborhoodScope(district) || Boolean(effectiveSearch) || Boolean(urlState.collection || urlState.layer);
  const displayPlaces = filtered.length
    ? filtered
    : activeFilter === "Saved"
      ? residentSavedPlaces
      : activeFilter === "Perks"
        ? residentPerkPlaces
        : hasActiveCategoryScope
          ? []
          : places.slice(0, 12);
  const isUsingFallbackPlaces = !filtered.length && !hasActiveCategoryScope && places.length > 0;
  const contextCount = displayPlaces.length;
  const isDefaultDiscoverScope = activeFilter === "All" && isAllNeighborhoodScope(district) && !effectiveSearch;
  const isCleanResidentPerksLaunch = urlState.mode === "resident" && urlState.tab === "map" && activeFilter === "Perks" && isAllNeighborhoodScope(district) && !effectiveSearch && !selectedId;
  const contextLabel = contextCount > 0
    ? isDefaultDiscoverScope
      ? "Featured downtown places"
      : `${contextCount} ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()}`
    : `Showing suggested ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()} nearby`;
  const discoverDisplayPlaces = useMemo(
    () => effectiveSearch ? sortSearchPlaces(displayPlaces, effectiveSearch) : sortDiscoverPlaces(displayPlaces),
    [displayPlaces, effectiveSearch],
  );
  const visiblePlaces = discoverDisplayPlaces;
  const activeCollection = useMemo(
    () => getMapCollectionById(urlState.collection),
    [urlState.collection],
  );
  const activeCollectionRoute = useMemo(
    () => activeCollection ? resolveMapCollectionRoute(activeCollection, places) : null,
    [activeCollection, places],
  );
  const activeRouteAgentContext = useMemo(() => {
    if (!activeCollectionRoute?.stops?.length) return null;
    const selectedStopIndex = selectedId ? activeCollectionRoute.stops.findIndex((stop) => stop.id === selectedId) : -1;
    const selectedStop = selectedStopIndex >= 0 ? activeCollectionRoute.stops[selectedStopIndex] : null;
    const upcomingStops = activeCollectionRoute.stops
      .slice(Math.max(0, selectedStopIndex + 1), Math.max(0, selectedStopIndex + 1) + 6)
      .map((stop, index) => ({
        id: stop.id,
        name: stop.name,
        category: stop.category,
        routeStopNumber: selectedStopIndex >= 0 ? selectedStopIndex + index + 2 : index + 1,
        district: stop.district,
      }));
    return {
      id: activeCollectionRoute.id,
      title: activeCollectionRoute.title,
      routeMode: activeCollectionRoute.routeMode,
      stopCount: activeCollectionRoute.stops.length,
      status: activeCollectionRoute.status,
      selectedStop: selectedStop ? {
        id: selectedStop.id,
        name: selectedStop.name,
        category: selectedStop.category,
        district: selectedStop.district,
        routeStopNumber: selectedStopIndex + 1,
      } : null,
      upcomingStops,
      routeStopIds: activeCollectionRoute.stops.map((stop) => stop.id).slice(0, 80),
    };
  }, [activeCollectionRoute, selectedId]);
  const mapPlaces = useMemo(() => {
    const shouldPreserveListingPins = activeFilter === "Rentals" || activeFilter === "Legends" || activeFilter === "Listings" || activeFilter === "All Listings";
    const pinSourcePlaces = shouldPreserveListingPins
      ? discoverDisplayPlaces
      : discoverDisplayPlaces.filter((place) => !isUnitLevelListingPlace(place));
    if (activeCollectionRoute?.stops?.length) return activeCollectionRoute.stops;

    return selectProgressiveMarkerPlaces(pinSourcePlaces, {
      activeFilter,
      collection: urlState.collection,
      effectiveSearch,
      mapZoom,
      selectedId,
      savedIds,
      userHasNavigatedMap,
      isDefaultDiscoverScope: urlState.mode === "resident" && isDefaultDiscoverScope,
    });
  }, [activeCollectionRoute, activeFilter, discoverDisplayPlaces, effectiveSearch, isDefaultDiscoverScope, mapZoom, savedIds, selectedId, urlState.collection, urlState.mode, userHasNavigatedMap]);
  const mapResultBoundsKey = `${urlState.mode}:${activeFilter}:${urlState.collection || "none"}:${urlState.layer || "none"}:${district}:${effectiveSearch || "none"}:${discoverDisplayPlaces.length}`;
  const visibleLegendsPlaces = useMemo(
    () => dedupeMapPinPlaces(discoverDisplayPlaces).filter((place) => isLegendsMapPlace(place)),
    [discoverDisplayPlaces],
  );
  const shouldShowListingPins = activeFilter === "Legends" || activeFilter === "Listings" || /\b(legends|listing|mls|condo|for sale|for rent)\b/i.test(effectiveSearch || "");
  const shouldShowIndividualPins = shouldShowListingPins || activeFilter === "Civic" || activeFilter === "Explore Downtown" || /\b(daa|art walk|public art|civic)\b/i.test(effectiveSearch || "");
  const clusteredMapItems = useMemo(
    () => activeCollectionRoute?.stops?.length
      ? activeCollectionRoute.stops.map((place) => ({ id: place.id, type: "place", place }))
      : shouldShowIndividualPins
      ? mapPlaces.map((place) => ({ id: place.id, type: "place", place }))
      : clusterPlaces(mapPlaces, mapZoom, selectedId),
    [activeCollectionRoute, mapPlaces, mapZoom, selectedId, shouldShowIndividualPins],
  );
  const isStreetLevelMapView = mapZoom >= STREET_LEVEL_ZOOM || (viewportBounds?.zoom || 0) >= STREET_LEVEL_ZOOM;
  useEffect(() => {
    if (!selectedId) return;
    if (selected) return;
    const mapMatch = resolveMapEntityFromCollection(selectedId, mapPlaces);
    if (mapMatch) setSelectedPlaceOverride(mapMatch);
  }, [mapPlaces, selected, selectedId]);
  const previewLimit = resultsExpanded ? 12 : 4;
  const previewPlaces = discoverDisplayPlaces.slice(0, previewLimit);
  const isRentalLayer = urlState.mode === "resident" && activeFilter === "Rentals";
  const isLegendsDirectoryLayer = ["Rentals", "Living Here", "Legends", "All Listings"].includes(activeFilter);
  const isResidentSavedDrawer = urlState.mode === "resident" && activeBottomTab === "saved";
  const savedDrawerPlaces = residentSavedPlaces.slice(0, previewLimit);
  const drawerPreviewPlaces = isResidentSavedDrawer ? savedDrawerPlaces : previewPlaces;
  const legendsDirectoryPlaces = isLegendsDirectoryLayer
    ? discoverDisplayPlaces
      .filter((place) => isRentalEntity(place) || getLegendsResidentialProfileForPlace(place) || isLegendsMapPlace(place))
      .slice(0, 80)
    : [];
  const hiddenPreviewCount = Math.max(0, Math.min(discoverDisplayPlaces.length, 12) - previewPlaces.length);
  const hiddenSavedPreviewCount = Math.max(0, Math.min(residentSavedPlaces.length, 12) - savedDrawerPlaces.length);
  const searchPlaceholder = urlState.mode === "partner"
    ? "Ask about campaigns, nearby use, or saved places"
    : "Ask about places, perks, events, or civic updates";
  const searchConsoleLabel = "Ask the map";
  const areaRailLabel = getAreaRailLabel(urlState.mode, activeFilter);
  const allAreaLabel = getAllAreaLabel(urlState.mode, activeFilter);
  const urlPartnerPanel = urlState.mode === "partner" && MAP_NATIVE_PARTNER_PANELS.includes(urlState.tab) ? urlState.tab : "";
  const activePartnerPanel = urlPartnerPanel || (urlState.mode === "partner" && MAP_NATIVE_PARTNER_PANELS.includes(activeBottomTab) ? activeBottomTab : "");
  const residentPanelCopy = {
    perks: {
      eyebrow: "Perks",
      title: "Useful offers nearby.",
      body: "Places with resident value, card moments, or offers worth saving.",
    },
    events: {
      eyebrow: "Events",
      title: "Nearby now.",
      body: "Events, music, park moments, and plans close enough to use.",
    },
    saved: {
      eyebrow: "MY DOWNTOWN",
      title: "Saved Downtown",
      body: "Places, events and experiences you've chosen to come back to.",
    },
  }[isRentalLayer ? "rentals" : activeBottomTab] || (isRentalLayer ? {
    eyebrow: "Rentals",
    title: "Downtown rentals on the map.",
    body: "Building-first listings with nearby perks, amenities, and walking context.",
  } : null);
  const panelPlaces = previewPlaces.length ? previewPlaces : discoverDisplayPlaces.slice(0, 8);
  const searchTimeOptions = urlState.mode === "partner" ? PARTNER_TIME_FILTERS : RESIDENT_TIME_FILTERS;
  const searchIntentOptions = urlState.mode === "partner" ? PARTNER_INTENT_FILTERS : RESIDENT_INTENT_FILTERS;
  const activeSearchSummary = [
    effectiveSearch || (activeFilter !== "All" ? activeFilter : ""),
    !isAllNeighborhoodScope(district) ? district : "",
    urlState.time,
  ].filter(Boolean);
  const resultsContextLine = activeSearchSummary.length
    ? urlState.mode === "partner"
      ? "Showing useful matches nearby."
      : `Showing ${activeFilter === "All" ? "places" : activeFilter.toLowerCase()} nearby.`
    : "";

  function placeDistanceLabel(place) {
    const coords = getPlaceCoords(place);
    if (!coords) return "nearby";
    const latDelta = coords[0] - AUSTIN_CENTER[0];
    const lngDelta = (coords[1] - AUSTIN_CENTER[1]) * Math.cos(((coords[0] + AUSTIN_CENTER[0]) / 2) * (Math.PI / 180));
    const miles = Math.sqrt((latDelta * 69) ** 2 + (lngDelta * 69) ** 2);
    return `${Math.max(0.1, miles).toFixed(1)} mi`;
  }

  function entityCardCopy(place) {
    const offer = urlState.mode === "partner" ? getPartnerPanelCopy(place) : getCanonicalResidentOffer(place) || getResidentPerkDetails(place);
    return truncatePanelCopy(
      offer?.title ||
      offer?.offer ||
      place.recommended_perk ||
      place.perk?.offer ||
      place.partner_opportunity ||
      place.summary ||
      place.description ||
      place.raw?.summary ||
      "Open the specific campaign action for this pin.",
      86,
    );
  }

  function renderEntityCard(place, actionLabel = "Open") {
    const image = resolveEntityImage(place, "card");
    const saved = savedIds.has(place.id);
    const offer = urlState.mode === "partner" ? getPartnerPanelCopy(place) : getCanonicalResidentOffer(place) || getResidentPerkDetails(place);
    return (
      <article key={place.id} className="dp-tab-discovery-card dp-tab-perk-card">
        <button
          type="button"
          className="dp-tab-discovery-media"
          aria-label={`Open ${place.name}`}
          onClick={() => selectPlace(place)}
        >
          {image ? <img alt={place.name} src={image} /> : null}
        </button>
        <div className="dp-tab-discovery-body">
          <div className="dp-tab-row-meta">
            <span>{[offer?.category || place.category || place.type || "place", place.district || place.neighborhood || "Downtown", placeDistanceLabel(place)].filter(Boolean).join(" • ")}</span>
          </div>
          <h3>{place.name}</h3>
          <p>{entityCardCopy(place)}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="dp-tab-primary-action px-3 py-2 text-[10px] font-semibold" onClick={() => selectPlace(place)}>
              {actionLabel}
            </button>
            <button type="button" className="dp-tab-secondary-action" aria-pressed={saved} onClick={() => toggleSaved(place)}>
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  function renderCompactEntityRow(place, actionLabel = "Open") {
    const offer = urlState.mode === "partner" ? getPartnerPanelCopy(place) : getCanonicalResidentOffer(place) || getResidentPerkDetails(place);
    const offerLine = offer?.title || offer?.offer || "";
    return (
      <button key={place.id} type="button" className="dp-tab-row dp-compact-place-row" onClick={() => selectPlace(place)}>
        <span className="dp-partner-feed-main">
          <span>
            <strong>{place.name}</strong>
            <small>{[offerLine || place.category || place.type || "Place", place.district || place.neighborhood || "Downtown", placeDistanceLabel(place)].filter(Boolean).join(" • ")}</small>
          </span>
        </span>
        <span className="dp-compact-place-actions">
          <em>{actionLabel}</em>
        </span>
      </button>
    );
  }

  function getSavedItemGroup(place) {
    const kind = getResidentEntityKind(place);
    const text = placeText(place);
    if (kind === "event" || isEventEntity(place) || /\b(rsvp|tonight|this thursday|showcase|first thursday|class|concert)\b/i.test(text)) return "events";
    if (hasActivePerkData(place) || kind === "perk" || isBrandEntity(place) || /\b(benefit|offer|resident access|discount|engraving|perk)\b/i.test(text)) return "benefits";
    return "places";
  }

  function getSavedItemCopy(place) {
    const offer = getCanonicalResidentOffer(place) || getResidentPerkDetails(place);
    const rawCopy = offer?.title || offer?.offer || place.summary || place.description || place.raw?.summary || place.raw?.description || "";
    if (rawCopy) return truncatePanelCopy(rawCopy, 96);
    if (getSavedItemGroup(place) === "events") return "An experience worth planning around while you are downtown.";
    if (getSavedItemGroup(place) === "benefits") return "A resident benefit worth using when you are nearby.";
    return "A downtown place worth revisiting when the plan comes together.";
  }

  function getSavedLocationLabel(place) {
    return place.district || place.neighborhood || place.address || "Downtown Austin";
  }

  function findSavedRecommendation(place) {
    const name = String(place?.name || "").toLowerCase();
    const text = placeText(place);
    const targets = [
      [/\byeti\b/, ["Tecovas", "Ariat", "Whole Foods"]],
      [/\b(waterloo|greenway|park)\b/, ["Moody Amphitheater", "Waller Creek Trail", "Central Library"]],
      [/\bhotel van zandt\b/, ["Geraldine's", "Rainey Street Food + Drink Loop", "Half Step"]],
      [/\blady bird|lake|trail|shoal creek\b/, ["Merit Coffee", "Central Library", "Congress Avenue Bridge"]],
    ];
    const match = targets.find(([pattern]) => pattern.test(name) || pattern.test(text));
    const labels = match?.[1] || ["Merit Coffee", "Waterloo Park", "Geraldine's"];
    return labels
      .map((label) => places.find((candidate) => String(candidate.name || "").toLowerCase().includes(label.toLowerCase())))
      .find(Boolean);
  }

  function getMyDowntownSuggestions() {
    const recommendedFromSaves = residentSavedPlaces
      .map(findSavedRecommendation)
      .filter(Boolean)
      .filter((place, index, list) => list.findIndex((item) => item.id === place.id) === index)
      .filter((place) => !savedIds.has(place.id));
    const fallback = ["Tecovas", "Moody Amphitheater", "Geraldine's", "Waterloo Park", "Merit Coffee"]
      .map((label) => places.find((place) => String(place.name || "").toLowerCase().includes(label.toLowerCase())))
      .filter(Boolean);
    return (recommendedFromSaves.length ? recommendedFromSaves : fallback).slice(0, 3);
  }

  function openResidentDiscovery(filter = "All") {
    setConsoleCollapsed(true);
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab(filter === "Events" ? "events" : filter === "Perks" ? "perks" : "map");
    setActiveFilter(filter);
    navigate(`/map?mode=resident&tab=map&filter=${encodeURIComponent(filter)}`);
  }

  function shareSavedCollection() {
    const titles = residentSavedPlaces.map((place) => place.name).slice(0, 8).join(", ");
    const text = titles ? `My Downtown collection: ${titles}` : "My Downtown collection on Downtown Perks.";
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({ title: "My Downtown", text });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
  }

  function renderSavedCollectionCard(place, statusLabel = "Recently Added") {
    const image = resolveEntityImage(place, "card") || MAP_PANEL_IMAGE_FALLBACK;
    return (
      <button key={place.id} type="button" className="dp-saved-collection-card" onClick={() => selectPlace(place)}>
        <span className="dp-saved-card-media">
          <img src={image} alt={place.name} loading="lazy" />
        </span>
        <span className="dp-saved-card-body">
          <span className="dp-saved-card-status">{statusLabel}</span>
          <strong>{place.name}</strong>
          <span>{getSavedItemCopy(place)}</span>
          <em>{getSavedLocationLabel(place)}</em>
        </span>
      </button>
    );
  }

  function renderSavedCollectionSection(title, items) {
    if (!items.length) return null;
    return (
      <section className="dp-saved-collection-section" aria-label={title}>
        <div className="dp-saved-section-heading">
          <h3>{title}</h3>
        </div>
        <div className="dp-saved-collection-grid">
          {items.map((place, index) => renderSavedCollectionCard(place, index === 0 ? "Saved Today" : "Recently Added"))}
        </div>
      </section>
    );
  }

  function renderSavedCollectionPanel() {
    const savedGroups = residentSavedPlaces.reduce(
      (groups, place) => {
        groups[getSavedItemGroup(place)].push(place);
        return groups;
      },
      { places: [], events: [], benefits: [] },
    );
    const recommended = getMyDowntownSuggestions();
    const askPrompts = [
      "What should I visit first?",
      "What's closest right now?",
      "Any events near my saved places?",
      "What should I do tonight?",
      residentSavedPlaces[0]?.name ? `What's happening near ${residentSavedPlaces[0].name}?` : "What's happening near YETI?",
    ];
    const favoriteMatrixItems = (residentSavedPlaces.length ? residentSavedPlaces : recommended).slice(0, 8).map((place) => {
      const group = getSavedItemGroup(place);
      const related = getRelatedPlaces(place, places).slice(0, 3);
      return {
        id: place.id,
        label: place.name,
        eyebrow: group === "events" ? "Event" : group === "benefits" ? "Perk" : "Place",
        title: place.name,
        description: getSavedItemCopy(place),
        status: savedIds.has(place.id) ? "Saved" : "Suggested",
        meta: [
          place.category || place.type || "Downtown",
          getSavedLocationLabel(place),
          placeDistanceLabel(place),
        ].filter(Boolean),
        primaryAction: { label: "Open", action: "open" },
        secondaryActions: [
          { label: savedIds.has(place.id) ? "Remove" : "Save", action: savedIds.has(place.id) ? "remove" : "save" },
          { label: "Directions", action: "directions" },
          { label: "Share", action: "share" },
        ],
        relatedItems: related.map((item) => ({
          id: item.id,
          title: item.name,
          type: item.category || item.type || "Nearby",
          imageUrl: resolveEntityImage(item, "card"),
        })),
      };
    });
    const handleFavoriteMatrixAction = (action, item) => {
      const place = places.find((candidate) => candidate.id === item.id) || residentSavedPlaces.find((candidate) => candidate.id === item.id);
      if (action.action === "open" && place) {
        selectPlace(place);
        return;
      }
      if ((action.action === "save" || action.action === "remove") && place) {
        toggleSaved(place);
        return;
      }
      if (action.action === "directions" && place) {
        window.open(directionsUrl(place), "_blank", "noopener,noreferrer");
        return;
      }
      if (action.action === "share") {
        shareSavedCollection();
        return;
      }
      if (action.action === "open-related" && action.relatedId) {
        const relatedPlace = places.find((candidate) => candidate.id === action.relatedId);
        if (relatedPlace) selectPlace(relatedPlace);
      }
    };

    return (
      <div className="dp-tabs-content dp-resident-tab-panel dp-saved-downtown-panel min-h-0 flex-1 overflow-hidden">
        <div className="dp-saved-downtown-scroll dp-tab-stack">
          <section className="dp-resident-tab-panel-header dp-saved-downtown-header">
            <p>MY DOWNTOWN</p>
            <h2>Saved Downtown</h2>
            <span>Your saved places, benefits, events, and next nearby options.</span>
            <strong>{residentSavedPlaces.length} saved</strong>
          </section>

          <section className="dp-saved-overview-rail" aria-label="Saved downtown summary">
            <span><strong>{savedGroups.places.length}</strong> places</span>
            <span><strong>{savedGroups.benefits.length}</strong> benefits</span>
            <span><strong>{savedGroups.events.length}</strong> events</span>
          </section>

          {!residentSavedPlaces.length && (
            <section className="dp-saved-empty-state" aria-label="Nothing saved yet">
              <h3>Nothing saved yet.</h3>
              <p>Save places, events and benefits while you explore downtown.</p>
              <div className="dp-saved-action-row">
                <button type="button" onClick={() => openResidentDiscovery("All")}>Explore Nearby</button>
                <button type="button" onClick={() => openResidentDiscovery("Events")}>View Events</button>
                <button type="button" onClick={() => openResidentDiscovery("Perks")}>Find Benefits</button>
              </div>
            </section>
          )}

          <InteractiveMatrix
            eyebrow="Saved"
            title="Saved places, perks, events, and buildings."
            description="Choose an item to see why it matters, what to do next, and what is connected nearby."
            items={favoriteMatrixItems}
            onAction={handleFavoriteMatrixAction}
            className="dp-favorites-matrix"
          />

          {!!recommended.length && (
            <section className="dp-saved-collection-section" aria-label="Explore Nearby">
              <div className="dp-saved-section-heading">
                <h3>Explore Nearby</h3>
              </div>
              <div className="dp-saved-collection-grid">
                {recommended.map((place) => renderSavedCollectionCard(place, "Popular Nearby"))}
              </div>
            </section>
          )}

          <section className="dp-saved-ask-section" aria-label="Ask the Map about saved places">
            <h3>Ask the Map</h3>
            <div>
              {askPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => void applyPrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="dp-saved-action-row dp-saved-primary-actions" aria-label="Saved downtown actions">
            <button type="button" onClick={() => openResidentDiscovery("All")}>
              <Navigation aria-hidden="true" />
              <span>Nearby</span>
            </button>
            <button type="button" onClick={() => openResidentDiscovery("Events")}>
              <CalendarDays aria-hidden="true" />
              <span>Events</span>
            </button>
            <button type="button" onClick={shareSavedCollection}>
              <Send aria-hidden="true" />
              <span>Share</span>
            </button>
          </section>
        </div>
      </div>
    );
  }

  const reportSections = [
    {
      section: "Evening",
      value: "Best window",
      headline: "People plan fastest after work.",
      copy: "Dinner, events, drinks, and short walks are the easiest moments to support.",
      action: "Read more",
      target: "reports",
      observation: "Nearby residents, hotel guests, and visitors are opening dinner, event, and short-walk options after work.",
      trend: "People save places, ask for directions, and use offers in the same early evening window.",
      recommendation: "Put one clear offer near the places people already pass.",
      helps: "Partners can turn a nearby plan into a real visit without making people search again.",
    },
    {
      section: "Short walks",
      value: "Close by",
      headline: "The short walk matters.",
      copy: "People are more likely to act when the place is close enough to reach now.",
      action: "See nearby",
      target: "reports",
      observation: "Rainey, Seaholm, Congress, and Waterloo work because the next stop feels easy.",
      trend: "Nearby places get saved before broader district browsing.",
      recommendation: "Keep the message close to the walk.",
      helps: "Partners can focus on the places people can actually reach.",
    },
    {
      section: "Offers",
      value: "Keep simple",
      headline: "One clear offer works best.",
      copy: "Simple offers tied to a clear moment are easier to understand and use.",
      action: "Plan offer",
      target: "campaigns",
      observation: "People respond best when the next step is obvious: save, scan, RSVP, or get directions.",
      trend: "Clear offers are easier for residents and guests to use.",
      recommendation: "Try one after-work offer before adding more.",
      helps: "The next campaign is easier to launch, review, and improve.",
    },
    {
      section: "Saved places",
      value: "Follow up",
      headline: "Saved places show what people may come back to.",
      copy: "A save usually means someone wants to compare, share, or return later.",
      action: "View activity",
      target: "reports",
      observation: "Residents and guests are using saved places as a short list for later.",
      trend: "Saved places often come before directions, card opens, and visits.",
      recommendation: "Give saved places a useful next step nearby.",
      helps: "Partners can follow interest with a clear reason to visit.",
    },
    {
      section: "Next best move",
      value: "Try next",
      headline: "Start where people already are.",
      copy: "Pair one location with one clear action and one useful time of day.",
      action: "Open campaigns",
      target: "campaigns",
      observation: "The strongest ideas sit near places people are already opening and saving.",
      trend: "Rainey, Seaholm, and Congress are overlapping around evening plans.",
      recommendation: "Start with one place, then widen from there.",
      helps: "Partners get a clearer test without building a heavy campaign plan.",
    },
    {
      section: "Ready",
      value: "Next step",
      headline: "Turn the read into one partner action.",
      copy: "Pick the place, the time, and the one thing you want people to do.",
      action: "Open campaigns",
      target: "campaigns",
      observation: "A report is only useful if it helps someone do the next right thing.",
      trend: "Teams are reviewing reports and then opening campaign planning.",
      recommendation: "Start with saves, directions, scans, or requests.",
      helps: "The map stays focused on useful partner decisions.",
    },
  ];

  function renderReportsPanel() {
    return (
      <div className="dp-tabs-content dp-partner-readable-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Partner reports</p>
            <h2>Nearby activity, simplified.</h2>
            <p>Open, save, scan, and use signals turned into the next useful move.</p>
          </section>

          <section className="dp-partner-report-visual" aria-label="What changed this week">
            <div className="dp-report-signal-copy">
              <span>This week</span>
              <strong>After work is the clearest window.</strong>
              <p>Dinner, events, drinks, and short walks are the moments partners can support first.</p>
            </div>
            <div className="dp-partner-report-bars" aria-hidden="true">
              <i style={{ "--value": "76%" }} />
              <i style={{ "--value": "58%" }} />
              <i style={{ "--value": "42%" }} />
            </div>
          </section>

          <section className="dp-partner-report-analytics" aria-label="Weekly read summary">
            {[
              ["People open", "Places", "Where residents and guests look first"],
              ["People save", "Shortlists", "Places and offers they may revisit"],
              ["People use", "Offers", "Perks, RSVPs, scans, and directions"],
            ].map(([label, value, copy]) => (
              <div key={label} className="dp-partner-summary-card">
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{copy}</p>
              </div>
            ))}
          </section>

          <section className="dp-partner-report-readout" aria-label="Report next steps">
            <p className="dp-tab-eyebrow">What to do next</p>
            <div>
              {[
                ["Strongest window", "5-8 PM", "People are choosing dinner, drinks, and events."],
                ["Useful action", "One clear offer", "Partners get a cleaner test when the next step is save, scan, RSVP, or request."],
                ["What to review", "Follow-up", "Look for places people save, directions they request, and offers they use."],
              ].map(([label, value, copy]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="dp-austin-growth-read" aria-label="Austin growth context">
            <span>Downtown context</span>
            <strong>People decide closer to the moment.</strong>
            <p>Residents, hotel guests, and visitors often choose where to go while they are already nearby. Partners should make the next step obvious.</p>
            <div aria-label="Austin population context">
              <span><b>Residents</b> nearby buildings</span>
              <span><b>Guests</b> nearby hotels</span>
              <span><b>Visitors</b> nearby events</span>
            </div>
          </section>

          <section className="dp-report-next-action">
            <div>
              <span>Next move</span>
              <strong>Give people one easy next step.</strong>
              <p>Start with a simple offer, event, route, or request path near places people already pass.</p>
            </div>
            <button type="button" onClick={() => openPartnerPanel("campaigns")}>Open campaigns</button>
          </section>

          <div className="dp-partner-report-card-grid" aria-label="Report details">
            {reportSections.map((item, index) => (
              <details key={item.section} className="dp-partner-report-card" open={index === 0}>
                <summary>
                  <span className="dp-report-label">{item.section}</span>
                  <strong>{item.headline}</strong>
                  <p>{item.copy}</p>
                  <div className="dp-report-card-footer">
                    <span>{item.value}</span>
                    <em>{item.action}</em>
                  </div>
                </summary>
                <dl className="dp-report-mini-table">
                  <div>
                    <dt>What happened</dt>
                    <dd>{item.observation}</dd>
                  </div>
                  <div>
                    <dt>What changed</dt>
                    <dd>{item.trend}</dd>
                  </div>
                  <div>
                    <dt>What to do</dt>
                    <dd>{item.recommendation}</dd>
                  </div>
                  <div>
                    <dt>What this helps</dt>
                    <dd>{item.helps}</dd>
                  </div>
                </dl>
              </details>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderActivityPanel() {
    const activityRows = [
      ["People are opening the map", "Nearby places, offers, and events are being saved together.", "Open map", () => openPartnerMap("All")],
      ["Dining is getting attention", "Happy hour, patios, and dinner searches are picking up.", "Create offer", () => openPartnerPanel("campaigns")],
      ["Events are shaping nearby plans", "Evening saves are picking up around Seaholm, Rainey, and Congress.", "View events", () => openPartnerMap("Events")],
      ["After work is the clearest window", "People are most likely to save, ask for directions, or use an offer after work and on weekends.", "Review report", () => openPartnerPanel("reports")],
    ];
    return (
      <div className="dp-tabs-content dp-partner-readable-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Partner activity</p>
            <h2>Nearby activity, simplified.</h2>
            <p>Open, save, scan, and use signals without the extra noise.</p>
          </section>

          <section className="dp-partner-summary-grid" aria-label="Activity summary">
            {[
              ["People open", "Places", "Where residents and guests look first"],
              ["People save", "Shortlists", "Places and offers they may revisit"],
              ["People use", "Offers", "Perks, RSVPs, scans, and directions"],
            ].map(([label, value, copy]) => (
              <article key={label} className="dp-partner-summary-card">
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="dp-partner-feed-list" aria-label="Recent partner activity">
            {activityRows.map(([title, copy, action, onClick]) => (
              <button key={title} type="button" className="dp-tab-row dp-partner-feed-row" onClick={onClick}>
                <span className="dp-partner-feed-main">
                  <span className="dp-tab-row-icon"><ScanLine className="h-4 w-4" /></span>
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </span>
                <span className="dp-tab-signal">{action}</span>
              </button>
            ))}
          </section>
        </div>
      </div>
    );
  }

  function renderCampaignPanel() {
    const campaignRows = [...liveCampaignLayerExamples, ...brandCampaignExamples];
    const selectedCampaign = campaignRows.find((campaign) => campaign.id === (urlState.campaignId || activeCampaignStep)) || liveCampaignLayerExamples[0];
    const selectedStatus = selectedCampaign?.status || "Ready";
    const selectedEntity = (urlState.entityId ? places.find((place) => place.id === urlState.entityId || place.raw?.id === urlState.entityId) : null) || findCampaignEntity(selectedCampaign);
    const isBrandActivation = selectedCampaign?.layerType === "brand" || (selectedEntity && isBrandEntity(selectedEntity));
    const mapFilter = isBrandActivation ? "Brand Activations" : getCampaignFilter(selectedCampaign);
    const partnerLabel = selectedCampaign?.brandName || selectedCampaign?.placeName || selectedEntity?.name || "Partner";
    const campaignTitle = selectedCampaign?.campaignName || "One clear campaign";
    const momentLine = selectedCampaign?.moment ? `${selectedCampaign.moment}${selectedCampaign.area ? ` · ${selectedCampaign.area}` : ""}` : selectedCampaign?.intent || "Choose the strongest nearby moment.";
    const audienceLine = selectedCampaign?.audience || "People already close enough to act.";
    const actionLine = selectedCampaign?.residentFacingOffer || "Give people one useful reason to save, visit, RSVP, request, scan, or get directions.";
    const measureLine = selectedCampaign?.partnerInsight || "Watch opens, saves, scans, directions, and follow-up requests.";
    const strategyLine = selectedCampaign?.strategyLine || actionLine;
    const bestMoveTitle = selectedCampaign?.bestMoveTitle || "One pin. One next tap.";
    const bestMoveCopy = selectedCampaign?.bestMoveCopy || "Keep the message short and measurable.";
    const selectedPinSummary = selectedEntity?.summary || selectedEntity?.description || selectedEntity?.offer || selectedCampaign?.pinUse || partnerLabel;
    const selectedPinCopy = selectedEntity
      ? `${selectedEntity.name}: ${selectedPinSummary}`
      : selectedCampaign?.pinUse || partnerLabel;
    const tapAction = selectedCampaign?.tapAction || actionLine;
    const proofPoint = selectedCampaign?.proofPoint || measureLine;
    const primaryActionLabel = selectedStatus === "Live" ? "Review results" : selectedStatus === "Draft" ? "Finish draft" : "Build campaign";

    function findCampaignEntity(campaign) {
      const brandId = String(campaign?.brandId || campaign?.placeId || "");
      const directMatch = brandId
        ? places.find((place) => place.id === brandId || place.raw?.id === brandId)
        : null;
      if (directMatch) return directMatch;
      const brandName = String(campaign?.brandName || campaign?.placeName || "").toLowerCase();
      if (!brandName) return null;
      const normalizedBrandName = brandName.replace(/^brand-/, "").replace(/^partner-/, "").replace(/-/g, " ");
      return places.find((place) => {
        const placeBrand = String(place.brand || place.raw?.brand || "").toLowerCase();
        const placeName = String(place.name || "").toLowerCase();
        return (
          place.id === brandId ||
          placeBrand === brandName ||
          placeName === brandName ||
          placeBrand === normalizedBrandName ||
          placeName === normalizedBrandName ||
          placeName.includes(normalizedBrandName) ||
          normalizedBrandName.includes(placeName)
        );
      }) || null;
    }

    function getCampaignFilter(campaign) {
      if (campaign?.layerType === "brand") return "Brands";
      if (campaign?.layerType === "hotel") return "Hotels";
      if (campaign?.layerType === "property") return "Properties";
      if (campaign?.layerType === "event") return "Events";
      return "Campaigns";
    }

    function handleCampaignPrimaryAction() {
      if (selectedStatus === "Live") {
        openPartnerPanel("reports");
        return;
      }
      if (selectedEntity) {
        navigate(campaignRoute(selectedEntity));
        return;
      }
      navigate(`/partners/campaigns?campaignId=${encodeURIComponent(selectedCampaign.id)}&moment=${encodeURIComponent(selectedCampaign.moment || "")}`);
    }

    function handleCampaignViewMap() {
      clearOpenMapSelection();
      setActiveBottomTab("map");
      setActiveFilter(mapFilter);
      if (selectedEntity) {
        setSelectedId(selectedEntity.id);
        setPulsingPinId(selectedEntity.id);
      }
      setMapAnswer(buildAgenticMapAnswer(campaignTitle, selectedEntity ? [selectedEntity, ...visiblePlaces] : visiblePlaces, "partner", selectedCampaign.area || district, mapFilter));
      setConsoleCollapsed(true);
      navigate(`/map?mode=partner&tab=map&filter=${encodeURIComponent(mapFilter)}&campaignId=${encodeURIComponent(selectedCampaign.id)}${selectedEntity?.id ? `&entityId=${encodeURIComponent(selectedEntity.id)}` : ""}`);
    }

    return (
      <div className="dp-tabs-content dp-partner-readable-panel dp-campaign-drawer">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero dp-campaign-hero">
            <p className="dp-tab-eyebrow">{isBrandActivation ? "Brand activation" : "Campaign"}</p>
            <h2>{partnerLabel}: {campaignTitle}</h2>
            <p>{strategyLine}</p>
          </section>

          <section className="dp-campaign-moment">
            <p className="dp-tab-eyebrow">Best move</p>
            <h3>{bestMoveTitle}</h3>
            <p>{bestMoveCopy}</p>
            <div className="dp-campaign-meta-row" aria-label="Recommended campaign context">
              <span>{mapFilter}</span>
              <span>{selectedStatus}</span>
              <span>{selectedCampaign.area || "Downtown"}</span>
            </div>
          </section>

          <div className="dp-campaign-action-bar">
            <button type="button" className="dp-tab-primary-action" onClick={handleCampaignPrimaryAction}>{primaryActionLabel}</button>
            <button type="button" className="dp-tab-secondary-action" onClick={handleCampaignViewMap}>View Map</button>
          </div>

          <section className="dp-campaign-suggestion">
            <p className="dp-tab-eyebrow">Campaign brief</p>
            <h3>{campaignTitle}</h3>
            <p>{momentLine}</p>
            <div className="dp-campaign-detail-list">
              <span><strong>Audience</strong> {audienceLine}</span>
              <span><strong>Action</strong> {actionLine}</span>
              <span><strong>Measure</strong> {measureLine}</span>
            </div>
          </section>

          <section className="dp-campaign-readout" aria-label="Campaign readiness">
            <p className="dp-tab-eyebrow">Check before launch</p>
            <div>
              {[
                ["Pin", selectedPinCopy],
                ["Tap", tapAction],
                ["Proof", proofPoint],
              ].map(([label, copy]) => (
                <article key={label}>
                  <span>{label}</span>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

      </div>
      </div>
    );
  }

  function renderInfoPanel() {
    const isPartnerInfo = urlState.mode === "partner";
    const scrollToInfoFaq = () => {
      document.querySelector(".dp-info-guide-faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const content = isPartnerInfo
      ? {
          eyebrow: "PARTNER GUIDE",
          headline: "Everything you need to grow your presence downtown.",
          copy: "Manage your downtown presence, launch campaigns, and read the actions people take from the map.",
          primary: ["Open Workspace", () => navigate("/partner-workspace/overview")],
          secondary: ["Contact Support", () => navigate("/partners/sign-up?intent=support")],
          overview: [
            ["Workspace", "Profile, locations, team, and account settings."],
            ["Campaigns", "Offers, events, QR moments, and featured placements."],
            ["Reports", "Saves, scans, visits, and follow-up activity."],
            ["Map Presence", "How your business appears in nearby decisions."],
          ],
          steps: ["Complete your profile.", "Launch one clear campaign.", "Review what people did next."],
          how: [
            ["Show up nearby.", "Your place, offer, or event appears while people are deciding what to do."],
            ["Capture action.", "Saves, scans, RSVPs, direction taps, and QR moments connect back to your business."],
            ["Improve the next move.", "Reports turn local activity into a practical campaign decision."],
          ],
          features: [
            ["Profile", "Keep your public listing current."],
            ["Offers", "Give nearby people a reason to visit."],
            ["Events", "Promote moments people can attend."],
            ["QR", "Connect physical touchpoints to the map."],
            ["Reports", "Read saves, scans, visits, and use."],
            ["Team", "Manage access and permissions."],
          ],
          tipsTitle: "Helpful tips",
          tips: [
            "Keep hours and images current.",
            "Make each campaign time-specific.",
            "Use QR codes where people already pause.",
          ],
          faq: [
            ["How do campaigns work?", "Start with one place, one audience, and one action. Then review what people saved, scanned, opened, or used."],
            ["How are scans measured?", "QR scans are grouped with the related place, campaign, or offer."],
            ["How do QR codes work?", "QR codes can point to offers, events, places, or partner moments from the map."],
          ],
          help: ["Need a hand?", "We are here to help you set up the right next step.", "Partner Documentation", () => navigate("/partners")],
        }
      : {
          eyebrow: "USING DOWNTOWN PERKS",
          headline: "Everything you need to get more out of downtown.",
          copy: "Find nearby places, compare the moment, save what matters, and open resident perks when they apply.",
          primary: ["Explore the Map", () => openResidentLayer("All")],
          secondary: ["Get Your Perks Card", () => navigate("/card")],
          overview: [
            ["Map", "Restaurants, coffee, events, services, and buildings nearby."],
            ["Perks", "Resident benefits and partner offers in context."],
            ["Saved", "Places and plans you want to come back to."],
            ["Card", "Your resident QR for participating moments."],
          ],
          steps: ["Search or choose a filter.", "Open the place, event, or perk.", "Save it, get directions, or show your card."],
          how: [
            ["Start with intent.", "Use a category, nearby search, or Ask the Map prompt."],
            ["Open the right layer.", "Places, events, perks, listings, and useful local details stay connected to the map."],
            ["Act without losing context.", "Save, get directions, share, or show your resident card from the same flow."],
          ],
          features: [
            ["Nearby", "Dining, coffee, services, events, and buildings."],
            ["Perks", "Benefits attached to places and partner moments."],
            ["Events", "What is happening today or this week."],
            ["Resident Card", "A QR pass for participating partners."],
            ["Saved", "A personal list of places and plans."],
            ["Ask the Map", "Prompts for what you need right now."],
          ],
          tipsTitle: "Local tips",
          tips: [
            "Save places before the weekend.",
            "Check events before heading out.",
            "Show your card when a perk asks for it.",
          ],
          faq: [
            ["How do perks work?", "Open a perk from the map to see the benefit, where it applies, and what to show."],
            ["Do I need an account?", "You can browse freely. Saved places and resident access work best when connected to your resident profile."],
            ["How do I save places?", "Open a place, event, listing, or perk and use the save action when it appears."],
            ["How do I unlock offers?", "Open the Perks layer and show the resident card or offer details when a partner asks."],
          ],
          help: ["Need some help?", "We are happy to point you in the right direction.", "Frequently Asked Questions", scrollToInfoFaq],
        };
    const makeVisibilityRelatedItems = (filter) => places
      .filter((place) => matchesFilter(place, filter, savedIds))
      .slice(0, 4)
      .map((place) => ({
        id: place.id,
        title: place.name,
        type: place.category || place.type || "Nearby",
        imageUrl: resolveEntityImage(place, "card"),
      }));
    const visibilityCategories = [
      {
        id: "coffee",
        label: "Coffee",
        filter: "Coffee",
        description: "Shows nearby cafes, breakfast stops, and places useful before work or weekend plans.",
        status: activeFilter === "Coffee" ? "Showing now" : "Nearby",
        meta: ["Cafes", "Morning", "Walkable"],
      },
      {
        id: "dining",
        label: "Dining",
        filter: "Dining",
        description: "Prioritizes restaurants, dinner spots, and places worth planning around before or after events.",
        status: activeFilter === "Dining" ? "Showing now" : "Useful now",
        meta: ["Restaurants", "Dinner", "Plans"],
      },
      {
        id: "happy-hour",
        label: "Happy Hour",
        filter: "Happy Hour",
        description: "Finds drink specials, after-work stops, and resident-friendly value nearby.",
        status: activeFilter === "Happy Hour" ? "Showing now" : "Tonight",
        meta: ["After work", "Drinks", "Value"],
      },
      {
        id: "events",
        label: "Events",
        filter: "Events",
        description: "Shows live music, civic moments, sports, parks, and things happening soon.",
        status: activeFilter === "Events" ? "Showing now" : "Active",
        meta: ["Today", "This week", "RSVP"],
      },
      {
        id: "perks",
        label: "Perks",
        filter: "Perks",
        description: "Surfaces resident benefits and card moments tied to participating places.",
        status: activeFilter === "Perks" ? "Showing now" : "Resident value",
        meta: ["Offers", "Card", "Nearby"],
      },
      {
        id: "hotels",
        label: "Hotels",
        filter: "Hotels",
        description: "Shows hotels, lobby moments, guest-friendly places, and staycation context.",
        status: activeFilter === "Hotels" ? "Showing now" : "Guest layer",
        meta: ["Hotels", "Guests", "Concierge"],
      },
      {
        id: "properties",
        label: "Properties",
        filter: "Properties",
        description: "Shows residential buildings, listings, and nearby lifestyle context.",
        status: activeFilter === "Properties" ? "Showing now" : "Living here",
        meta: ["Buildings", "Listings", "Districts"],
      },
      {
        id: "legends",
        label: "Legends",
        filter: "Legends",
        description: "Highlights Legends residential listings, buildings, and downtown living context.",
        status: activeFilter === "Legends" ? "Showing now" : "Real estate",
        meta: ["Listings", "Buildings", "Tours"],
      },
      {
        id: "arts",
        label: "Arts",
        filter: "Arts & Culture",
        description: "Brings forward galleries, public art, culture stops, and district stories.",
        status: activeFilter === "Arts & Culture" ? "Showing now" : "Culture",
        meta: ["Art", "Stories", "Walks"],
      },
      {
        id: "retail",
        label: "Retail",
        filter: "Retail",
        description: "Shows shops, brands, errands, and places worth opening while walking downtown.",
        status: activeFilter === "Retail" ? "Showing now" : "Shopping",
        meta: ["Stores", "Brands", "Errands"],
      },
      {
        id: "fitness",
        label: "Fitness",
        filter: "Fitness",
        description: "Prioritizes gyms, wellness partners, trail access, and active downtown routines.",
        status: activeFilter === "Fitness" ? "Showing now" : "Active",
        meta: ["Wellness", "Movement", "Trail"],
      },
      {
        id: "services",
        label: "Services",
        filter: "Services",
        description: "Shows useful local services, everyday errands, and practical downtown resources.",
        status: activeFilter === "Services" ? "Showing now" : "Useful",
        meta: ["Errands", "Local", "Support"],
      },
      {
        id: "parking",
        label: "Parking",
        filter: "Parking",
        description: "Helps compare garages, arrival options, and places to park before a plan.",
        status: activeFilter === "Parking" ? "Showing now" : "Arrival",
        meta: ["Garages", "Arrival", "Routes"],
      },
      {
        id: "civic",
        label: "Civic",
        filter: "Civic",
        description: "Shows parks, public spaces, district programs, civic stops, and community resources.",
        status: activeFilter === "Civic" ? "Showing now" : "Public",
        meta: ["Parks", "Public", "District"],
      },
    ];
    const partnerManageItems = [
      {
        id: "profile",
        label: "Profile",
        title: "Profile",
        description: "Control the name, story, contact details, and public identity residents see first.",
        status: "Published",
        meta: ["Identity", "Contact", "Story"],
        primaryAction: { label: "Open Profile", action: "open-href", href: "/partner-workspace/profile" },
      },
      {
        id: "map-presence",
        label: "Map Presence",
        title: "Map Presence",
        description: "Control category, district, images, map visibility, and the first impression residents see.",
        status: "Map connected",
        meta: ["Category", "District", "Images"],
        primaryAction: { label: "Update Map Presence", action: "open-href", href: "/partner-workspace/map" },
      },
      {
        id: "campaigns",
        label: "Campaigns",
        title: "Campaigns",
        description: "Create and manage local moments that can appear on the map, resident feed, QR paths, or partner reports.",
        status: "Recommended",
        meta: ["Reach", "Timing", "Reporting"],
        primaryAction: { label: "Open Campaigns", action: "open-href", href: "/partner-workspace/campaigns" },
        secondaryActions: [{ label: "Create Campaign", action: "open-href", href: "/partner-workspace/campaigns?intent=new" }],
      },
      {
        id: "offers",
        label: "Offers",
        title: "Offers",
        description: "Give nearby people one clear reason to save, scan, request directions, or visit.",
        status: "Draft next",
        meta: ["Perks", "Redemptions", "Visits"],
        primaryAction: { label: "Open Offers", action: "open-href", href: "/partner-workspace/offers" },
        secondaryActions: [{ label: "Create Offer", action: "open-href", href: "/partner-workspace/offers?intent=new" }],
      },
      {
        id: "events",
        label: "Events",
        title: "Events",
        description: "Promote moments people can attend and connect RSVP activity back to map reporting.",
        status: "Available",
        meta: ["RSVP", "Calendar", "Nearby"],
        primaryAction: { label: "Open Events", action: "open-href", href: "/partner-workspace/events" },
        secondaryActions: [{ label: "Preview Events", action: "partner-map-filter", filter: "Events" }],
      },
      {
        id: "qr",
        label: "QR",
        title: "QR",
        description: "Connect printed materials, lobby moments, scans, and resident card interactions to reporting.",
        status: "Connected",
        meta: ["Scans", "Print", "Card"],
        primaryAction: { label: "Open QR Materials", action: "open-href", href: "/partner-workspace/media?section=qr" },
      },
      {
        id: "audience",
        label: "Audience",
        title: "Audience",
        description: "Understand who saves, scans, opens directions, and returns from nearby map activity.",
        status: "Signals live",
        meta: ["Residents", "Visitors", "Segments"],
        primaryAction: { label: "Open Audience", action: "open-href", href: "/partner-workspace/audience" },
      },
      {
        id: "media",
        label: "Media",
        title: "Media",
        description: "Keep the images and brand assets that appear across map cards, panels, and QR moments current.",
        status: "Needs review",
        meta: ["Photos", "Logo", "Cards"],
        primaryAction: { label: "Open Media", action: "open-href", href: "/partner-workspace/media" },
      },
      {
        id: "reports",
        label: "Reports",
        title: "Reports",
        description: "Read saves, scans, directions, RSVPs, and follow-up activity in one operating view.",
        status: "Live",
        meta: ["Saves", "Scans", "Directions"],
        primaryAction: { label: "View Reports", action: "open-href", href: "/partner-workspace/reports" },
      },
      {
        id: "membership",
        label: "Membership",
        title: "Membership",
        description: "Review plan access, billing, add-ons, and the tools included with your current membership.",
        status: "Active",
        meta: ["Plan", "Billing", "Access"],
        primaryAction: { label: "Open Membership", action: "open-href", href: "/partner-workspace/billing" },
      },
      {
        id: "account",
        label: "Account",
        title: "Account",
        description: "Review team access, account details, notifications, and workspace preferences.",
        status: "Team access",
        meta: ["Team", "Settings", "Access"],
        primaryAction: { label: "Open Account", action: "open-href", href: "/partner-workspace/profile?section=account" },
      },
    ];
    const matrixItems = isPartnerInfo
      ? partnerManageItems.map((item) => ({
          ...item,
          eyebrow: "Workspace area",
          secondaryActions: [
            ...(item.secondaryActions || []),
            { label: "Preview Resident View", action: "preview" },
          ],
        }))
      : visibilityCategories.map((item) => {
          const relatedItems = makeVisibilityRelatedItems(item.filter);
          return {
            ...item,
            eyebrow: "Map priority",
            title: item.label,
            meta: [
              ...item.meta,
              relatedItems.length ? `${relatedItems.length} examples` : "Downtown Austin",
            ],
            primaryAction: { label: activeFilter === item.filter ? "Hide" : "Show on map", action: activeFilter === item.filter ? "hide-filter" : "show-filter", filter: item.filter },
            secondaryActions: [
              { label: "Ask the Map", action: "ask", prompt: `${item.label} nearby` },
              { label: "Set as default", action: "show-filter", filter: item.filter },
            ],
            relatedItems,
          };
        });
    const handleInfoMatrixAction = (action, item) => {
      if (action.action === "ask") {
        void applyPrompt(action.prompt || `${item.title} nearby`);
        return;
      }
      if (action.action === "preview") {
        openPartnerMap("All");
        return;
      }
      if (action.action === "show-filter" && action.filter) {
        openResidentLayer(action.filter);
        return;
      }
      if (action.action === "hide-filter") {
        openResidentLayer("All");
        return;
      }
      if (action.action === "partner-map-filter" && action.filter) {
        openPartnerMap(action.filter);
        return;
      }
      if (action.action === "open-href" && action.href) {
        navigate(action.href);
        return;
      }
      if (action.action === "open-related" && action.relatedId) {
        const relatedPlace = places.find((candidate) => candidate.id === action.relatedId);
        if (relatedPlace) selectPlace(relatedPlace);
      }
    };
    const infoMatrixSelectedId = isPartnerInfo
      ? "profile"
      : visibilityCategories.find((item) => item.filter === activeFilter)?.id || "coffee";

    return (
      <div className={`dp-tabs-content dp-partner-readable-panel dp-partner-info-panel dp-shared-info-panel ${isPartnerInfo ? "is-partner" : "is-resident"}`}>
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero dp-info-guide-hero">
            <div>
              <p className="dp-tab-eyebrow">{content.eyebrow}</p>
              <h2>{content.headline}</h2>
              <p>{content.copy}</p>
            </div>
            <div className="dp-info-guide-media" aria-hidden="true">
              <Info className="h-5 w-5" />
              <span>{isPartnerInfo ? "Partner owner guide" : "Resident local guide"}</span>
            </div>
            <div className="dp-info-guide-actions">
              <button type="button" className="dp-tab-primary-action" onClick={content.primary[1]}>{content.primary[0]}</button>
              <button type="button" className="dp-tab-secondary-action" onClick={content.secondary[1]}>{content.secondary[0]}</button>
            </div>
          </section>

          <InteractiveMatrix
            eyebrow={isPartnerInfo ? "Workspace tools" : "Nearby visibility"}
            title={isPartnerInfo ? "Manage the parts of your downtown presence residents can see." : "Choose what the map prioritizes."}
            description={isPartnerInfo ? "Select a workspace area to see what it controls, what is current, and the next useful action." : "Pick a category to see what appears, why it is useful, and what to open next."}
            items={matrixItems}
            initialSelectedId={infoMatrixSelectedId}
            onAction={handleInfoMatrixAction}
            className={`dp-info-interactive-matrix ${isPartnerInfo ? "dp-partner-manage-matrix" : "dp-visibility-matrix"}`}
          />

          <section className="dp-partner-info-steps" aria-label="Getting started">
            <p className="dp-tab-eyebrow">Getting started</p>
            {content.steps.map((step, index) => (
              <div key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </section>

          <section className="dp-partner-feed-list dp-info-guide-list" aria-label="How it works">
            <p className="dp-tab-eyebrow">How it works</p>
            {content.how.map(([title, copy]) => (
              <article key={title} className="dp-tab-row dp-partner-feed-row">
                <span className="dp-partner-feed-main">
                  <span className="dp-tab-row-icon"><Compass className="h-4 w-4" /></span>
                  <span><strong>{title}</strong><small>{copy}</small></span>
                </span>
              </article>
            ))}
          </section>

          <section className="dp-info-guide-tips" aria-label={content.tipsTitle}>
            <p className="dp-tab-eyebrow">{content.tipsTitle}</p>
            <div>
              {content.tips.map((tip) => <span key={tip}>{tip}</span>)}
            </div>
          </section>

          <section className="dp-info-guide-faq" aria-label="Frequently Asked Questions">
            <p className="dp-tab-eyebrow">Frequently Asked Questions</p>
            {content.faq.map(([question, answer], index) => (
              <details key={question} open={index === 0}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </section>

          <section className="dp-report-next-action dp-info-guide-help" aria-label="Need help">
            <div>
              <span>Need help?</span>
              <strong>{content.help[0]}</strong>
              <p>{content.help[1]}</p>
            </div>
            <button type="button" onClick={content.secondary[1]}>Contact Support</button>
            <button type="button" onClick={content.help[3]}>{content.help[2]}</button>
          </section>

        </div>
      </div>
    );
  }

  function renderCivicPanel() {
    const civicPlaces = places
      .filter((place) => isCivicEntity(place) || (isEventEntity(place) && placeText(place).includes("civic")))
      .sort((a, b) => {
        const aStop = getDaaStopFromPlace(a);
        const bStop = getDaaStopFromPlace(b);
        if (aStop && bStop) return Number(aStop.stopNumber || 0) - Number(bStop.stopNumber || 0);
        if (aStop) return -1;
        if (bStop) return 1;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
    const daaStopCount = civicPlaces.filter((place) => getDaaStopFromPlace(place)).length;
    return (
      <div className="dp-tabs-content dp-partner-readable-panel dp-civic-readable-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Civic</p>
            <h2>Public places in the map.</h2>
            <p>Art Walk, parks, plazas, trailheads, and civic stops with nearby context.</p>
          </section>

          <section className="dp-partner-summary-grid" aria-label="Civic summary">
            {[
              ["Art Walk", `${daaStopCount || DAA_TOUR_STOP_COUNT} stops`],
              ["Public spaces", "Parks, plazas, trails"],
              ["Next", "Open useful pins"],
            ].map(([label, value]) => (
              <article key={label} className="dp-partner-summary-card">
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <section className="dp-partner-feed-list" aria-label="Civic opportunity">
            {[
              ["Nearby activity", "Public spaces anchor walks and plans.", "Open details"],
              ["Why it matters", "Civic moments make routes easier.", "View activity"],
              ["Next", "Build one route around a public place.", "Open pins"],
            ].map(([title, copy, action]) => (
              <button key={title} type="button" className="dp-tab-row dp-partner-feed-row" onClick={() => openPartnerPanel("reports")}>
                <span className="dp-partner-feed-main">
                  <span className="dp-tab-row-icon"><Landmark className="h-4 w-4" /></span>
                  <span><strong>{title}</strong><small>{copy}</small></span>
                </span>
                <span className="dp-tab-signal">{action}</span>
              </button>
            ))}
          </section>

          <section className="dp-campaign-panel">
            <p className="dp-tab-eyebrow">Civic pins</p>
            <div className="dp-partner-feed-list dp-horizontal-entity-rail" aria-label="Civic map entities">
              {civicPlaces.map((place) => renderCompactEntityRow(place, "Open"))}
            </div>
          </section>
        </div>
      </div>
    );
  }
  useEffect(() => {
    if (!selectedId) return;
    if (!places.length && !luxuryPresenceListingPlaces.length) return;
    if (selectedPlaceOverride && resolveMapEntityAlias(selectedPlaceOverride.id) === selectedId) return;
    if (/^(republic-austin|daa-stop|waterloo|parking)/i.test(selectedId)) return;
    if (!resolveMapEntityFromCollection(selectedId, places) && !resolveMapEntityFromCollection(selectedId, luxuryPresenceListingPlaces)) {
      setSelectedId("");
      setSelectedPlaceOverride(null);
      setSelectedDrawerClosed(true);
      setSelectedDrawerMinimized(false);
      urlState.update({ entityId: "" });
    }
  }, [places, selectedId, selectedPlaceOverride]);

  useEffect(() => {
    if (!pulsingPinId) return undefined;
    const timeoutId = window.setTimeout(() => setPulsingPinId(""), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [pulsingPinId]);

  useEffect(() => {
    if (!selectedId) return;
    if (urlState.mode === "partner" && MAP_NATIVE_PARTNER_PANELS.includes(urlState.tab)) {
      setActiveBottomTab(urlState.tab);
      setConsoleCollapsed(true);
      return;
    }
    if (!urlState.panelTab) setActiveBottomTab("map");
    setConsoleCollapsed(true);
  }, [consoleHasActiveWork, selectedId, urlState.mode, urlState.panelTab, urlState.tab]);

  useEffect(() => {
    if (selectedId || clusterDrawer || activePartnerPanel || urlState.tab === "pass" || urlState.tab === "campaigns") {
      setConsoleCollapsed(true);
      setFiltersOpen(false);
    }
  }, [activePartnerPanel, clusterDrawer, selectedId, urlState.tab]);

  useEffect(() => {
    const isCleanMapView =
      urlState.tab === "map" &&
      activeBottomTab === "map" &&
      !selectedId &&
      !clusterDrawer &&
      !activePartnerPanel &&
      activeFilter !== "Legends" &&
      activeFilter !== "Listings";
    if (isCleanMapView) setConsoleCollapsed(false);
  }, [activeBottomTab, activeFilter, activePartnerPanel, clusterDrawer, selectedId, urlState.tab]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        if (!consoleCollapsed && !selectedId && !clusterDrawer && !aboutOpen) {
          if (urlState.mode !== "resident") {
            setConsoleCollapsed(true);
            window.setTimeout(() => searchRollupRef.current?.focus?.({ preventScroll: true }), 0);
          }
          return;
        }
        setSelectedId("");
        setClusterDrawer(null);
        setAboutOpen(false);
        setActiveBottomTab("map");
        urlState.update({ entityId: "" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aboutOpen, clusterDrawer, consoleCollapsed, selectedId, urlState]);

  useEffect(() => {
    if (consoleCollapsed || urlState.tab !== "map") return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (target?.closest?.(".dp-map-search-surface, .dp-search-rollup-button, .dp-search-intent-console")) return;
      if (urlState.mode === "resident") return;
      if (consoleHasActiveWork) return;
      setConsoleCollapsed(true);
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [consoleCollapsed, consoleHasActiveWork, urlState.mode, urlState.tab]);

  function selectPlace(place) {
    triggerHaptic();
    const canonicalSelectedId = resolveMapEntityAlias(place.id);
    const isRentalSelection = isRentalEntity(place);
    const isListingSelection = isUnitLevelListingPlace(place);
    const isPropertySelection = isListingSelection || Boolean(getLuxuryPresenceBuilding(place)) || isPropertyEntity(place);
    const publicPropertyId = isPropertySelection ? resolvePropertyUrlEntityId(place.id) : "";
    const publicListingId = isListingSelection ? resolvePropertyListingUrlId(place.id) : "";
    const nextEntityId = canonicalSelectedId;
    setActiveBottomTab("map");
    setClusterDrawer(null);
    setConsoleCollapsed(true);
    setSearch("");
    setMapAnswer(null);
    setEntityAnswer(null);
    setEntityAssistantLoading(false);
    setSelectedDrawerClosed(false);
    setSelectedDrawerMinimized(false);
    setPulsingPinId(nextEntityId);
    setSelectedPlaceOverride(place);
    setSelectedId(nextEntityId);
    recordMapUserAction("select_pin", {
      entityId: nextEntityId,
      name: place.name,
      category: place.category,
      collection: urlState.collection,
      filter: activeFilter,
    });
    urlState.update(
      isRentalSelection
        ? { layer: "rentals", filter: "Rentals", listing: place.id, entityId: place.id, listingId: "" }
        : { entityId: isPropertySelection ? publicPropertyId : place.id, listingId: publicListingId || "" },
    );
    trackingEvents.markerClick(nextEntityId, workflowEntityType(place));
    trackingEvents.drawerOpen(nextEntityId);
    fireWorkflow("/api/impression", {
      sessionId: getWorkflowSessionId(),
      entityId: nextEntityId,
      entityType: workflowEntityType(place),
      lat: place.latitude || place.coords?.[0] || AUSTIN_CENTER[0],
      lng: place.longitude || place.coords?.[1] || AUSTIN_CENTER[1],
    });
  }

  useEffect(() => {
    window.__dpOpenMapPin = (entityId) => {
      const place = places.find((item) => item.id === entityId);
      if (place) selectPlace(place);
    };

    const handlePinOpen = (event) => {
      if (event.target?.closest?.(".dp-map-drawer-shell, .dp-destination-drawer, .dp-panel-shell")) return;
      const pin = event.target?.closest?.(".dp-map-pin[data-entity-id], .dp-live-pin[data-entity-id]");
      if (!pin) return;
      const entityId = pin.getAttribute("data-entity-id");
      const place = places.find((item) => item.id === entityId);
      if (!place) return;
      event.preventDefault();
      event.stopPropagation();
      selectPlace(place);
    };

    const handleLeafletMarkerOpen = (event) => {
      if (event.target?.closest?.(".dp-map-drawer-shell, .dp-destination-drawer, .dp-panel-shell")) return;
      if (event.target?.closest?.(".dp-map-pin[data-entity-id], .dp-live-pin[data-entity-id], .dp-leaflet-cluster")) return;
      const marker = event.target?.closest?.(".leaflet-marker-icon.dp-leaflet-pin[title]");
      if (!marker) return;
      const title = marker.getAttribute("title");
      const place = places.find((item) => item.name === title || item.title === title);
      if (!place) return;
      event.preventDefault();
      event.stopPropagation();
      selectPlace(place);
    };

    const handlePinKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handlePinOpen(event);
      handleLeafletMarkerOpen(event);
    };

    document.addEventListener("click", handlePinOpen, true);
    document.addEventListener("click", handleLeafletMarkerOpen, true);
    document.addEventListener("keydown", handlePinKeyDown, true);
    return () => {
      document.removeEventListener("click", handlePinOpen, true);
      document.removeEventListener("click", handleLeafletMarkerOpen, true);
      document.removeEventListener("keydown", handlePinKeyDown, true);
      if (window.__dpOpenMapPin) delete window.__dpOpenMapPin;
    };
  }, [places, urlState]);

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
    setConsoleCollapsed(false);
    setActiveFilter(filter);
    setClusterDrawer(null);
    setMapAnswer(null);
    recordMapUserAction("filter", { filter });
    urlState.update({ filter, collection: "", entityId: "", layer: filter === "Rentals" ? "rentals" : "", listing: "" });
  }

  function openCollectionRoute(collectionId, displayQuery = "") {
    const collection = getMapCollectionById(collectionId);
    if (!collection) return;
    const nextFilter = getCollectionFilter(collection.id) || activeFilter || "All";
    setActiveBottomTab("map");
    setConsoleCollapsed(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setSelectedDrawerClosed(true);
    setSelectedPlaceOverride(null);
    setSelectedId("");
    setActiveFilter(nextFilter);
    if (displayQuery) setSearch(displayQuery);
    recordMapUserAction("open_route", {
      collection: collection.id,
      title: collection.title,
      stopCount: collection.stopIds?.length || 0,
    });
    urlState.update({
      tab: "map",
      collection: collection.id,
      filter: nextFilter,
      query: displayQuery || collection.title,
      entityId: "",
      drawerClosed: "",
    });
  }

  function exitCollectionRoute() {
    setClusterDrawer(null);
    setMapAnswer(null);
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    urlState.update({ collection: "", stop: "", entityId: "", drawerClosed: "" });
  }

  function selectCollectionStop(stop) {
    if (!stop) return;
    recordMapUserAction("select_route_stop", {
      entityId: stop.id,
      name: stop.name,
      collection: urlState.collection,
      routeStopNumber: stop.routeStopNumber,
    });
    selectPlace(stop);
    urlState.update({ collection: urlState.collection, stop: stop.id, entityId: stop.id, drawerClosed: "" });
  }

  function setNeighborhood(neighborhood) {
    setConsoleCollapsed(false);
    setDistrict(neighborhood);
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    urlState.update({ district: isAllNeighborhoodScope(neighborhood) ? "" : neighborhood, entityId: "" });
  }

  function setSearchFacet(key, value) {
    setConsoleCollapsed(false);
    setMapAnswer(null);
    urlState.update({ [key]: value, entityId: "" });
  }

  function clearSearchFilters() {
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    setSearch("");
    setMapAnswer(null);
    setActiveFilter("All");
    setDistrict(ALL_NEIGHBORHOODS);
    setRadius("5 min walk");
    urlState.update({
      tab: urlState.tab === "pass" ? "pass" : "map",
      filter: "All",
      query: "",
      q: "",
      prompt: "",
      district: "",
      radius: "",
      time: "",
      intent: "",
      entityType: "",
      collection: "",
      layer: "",
      entityId: "",
      listingId: "",
    });
  }

  function openClusterDrawer(cluster) {
    setSelectedId("");
    setClusterDrawer(cluster);
    setConsoleCollapsed(!consoleHasActiveWork);
    setActiveBottomTab("map");
    urlState.update({ entityId: "" });
  }

  function toggleSaved(place) {
    const nextSaved = !savedIds.has(place.id);
    const action = nextSaved ? "save" : "unsave";
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(place.id) ? next.delete(place.id) : next.add(place.id);
      return next;
    });
    fireWorkflow("/api/map-actions", buildMapActionPayload(place, action, "resident_save_action", {
      form: {
        intent: action,
        label: nextSaved ? "Save entity" : "Remove saved entity",
        status: nextSaved ? "active" : "inactive",
      },
    }));
    if (nextSaved) {
      recordMapUserAction("save", {
        entityId: place.id,
        name: place.name,
        category: place.category,
        collection: urlState.collection,
      });
      trackingEvents.save(place.id);
      fireWorkflow("/api/save", {
        profileId: getWorkflowProfileId(),
        entityType: workflowEntityType(place),
        entityId: place.id,
      });
      return;
    }
    recordMapUserAction("unsave", {
      entityId: place.id,
      name: place.name,
      category: place.category,
      collection: urlState.collection,
    });
    trackingEvents.unsave(place.id);
  }

  function getMapAnswerActionLabel(action) {
    const normalized = String(action || "").toLowerCase();
    if (normalized.includes("open") || normalized.includes("map")) return "Open Nearby";
    if (normalized.includes("save")) return "Save";
    if (normalized.includes("compare") || normalized.includes("activity")) return "Compare Activity";
    if (normalized.includes("walk") || normalized.includes("near") || normalized.includes("next")) return "View Results";
    if (normalized.includes("direction")) return "Directions";
    return String(action || "Open").replace(/^check\s+/i, "");
  }

  function handleMapAnswerAction(action) {
    const normalized = String(action || "").toLowerCase();
    const firstPick = mapAnswer?.picks?.[0] || selected || visiblePlaces[0];

    if (normalized.includes("view") && normalized.includes("event")) {
      setActiveBottomTab("events");
      setActiveFilter("Events");
      setConsoleCollapsed(false);
      urlState.update({ tab: "map", filter: "Events", entityId: "" });
      return;
    }

    if (normalized.includes("save")) {
      if (firstPick) {
        toggleSaved(firstPick);
        selectPlace(firstPick);
      }
      return;
    }

    if (normalized.includes("walk") || normalized.includes("near") || normalized.includes("next")) {
      setActiveBottomTab("discover");
      setResultsExpanded(true);
      if (firstPick) selectPlace(firstPick);
      return;
    }

    if (normalized.includes("direction")) {
      if (firstPick && typeof window !== "undefined") {
        trackingEvents.directions(firstPick.id);
        fireWorkflow("/api/map-actions", buildMapActionPayload(firstPick, "directions", "ask_map_answer_action", {
          form: {
            intent: "directions",
            label: "Ask the Map directions",
          },
        }));
        fireWorkflow("/api/visit", {
          profileId: getWorkflowProfileId(),
          venueId: firstPick.id,
          source: "directions",
        });
        window.open(directionsUrl(firstPick), "_blank", "noopener,noreferrer");
      }
      return;
    }

    setActiveBottomTab("map");
    setConsoleCollapsed(false);
    if (firstPick) selectPlace(firstPick);
  }

  async function toggleRsvp(place) {
    if ((Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === place.id)) {
      removeEventRsvp(place.id);
      fireWorkflow("/api/map-actions", buildMapActionPayload(place, "cancel_rsvp", "map_event_detail_drawer", {
        form: {
          status: "cancelled",
          partnerId: place.partnerId || place.raw?.partnerId || "",
          workspaceId: place.workspaceId || place.raw?.workspaceId || "",
          eventId: place.id,
          category: "event",
          intent: "cancel_rsvp",
          label: "Cancel Event RSVP",
        },
      }));
      return;
    }
    const payload = buildMapActionPayload(place, "rsvp", "map_event_detail_drawer", {
      form: {
        status: "rsvped",
        partnerId: place.partnerId || place.raw?.partnerId || "",
        workspaceId: place.workspaceId || place.raw?.workspaceId || "",
        eventId: place.id,
        category: "event",
        intent: "rsvp",
        label: "Event RSVP",
      },
    });
    try {
      await postWorkflow("/api/map-actions", payload);
    } catch (error) {
      console.warn("RSVP action failed", error);
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

  function getSmartResults(query, filterOverride = activeFilter) {
    const q = query.trim().toLowerCase();
    const parsed = parseMapIntent(query, urlState.mode);
    const intentTokens = getIntentTokens(q);
    const parsedIntents = Array.isArray(parsed.intents) ? parsed.intents : [];
    const isBroadPartnerIntent = urlState.mode === "partner" && parsedIntents.some((intent) => ["partner_opportunity", "partner_coverage", "partner_performance", "partner_campaigns"].includes(intent));
    const scoped = places.filter((place) => {
      if (!matchesCollection(place, urlState.collection)) return false;
      if (!matchesFilter(place, filterOverride, savedIds)) return false;
      if (!isAllNeighborhoodScope(district) && place.district !== district) return false;
      if (isIntentOnlyFilter(filterOverride)) return true;
      if (!q) return true;
      const text = placeText(place);
      return (
        isBroadPartnerIntent ||
        text.includes(q) ||
        intentTokens.some((token) => text.includes(token)) ||
        parsedIntents.some((intent) => text.includes(String(intent).toLowerCase().replace(/_/g, " "))) ||
        (q.includes("perk") && hasActivePerkData(place))
      );
    });

    const baseResults = scoped.length ? scoped : displayPlaces.length ? displayPlaces : hasActiveCategoryScope ? [] : places;
    return rankPlacesForIntent(baseResults, query, urlState.mode);
  }

  function openSearchResultsLayer() {
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setActiveBottomTab("map");
  }

  async function askMapAgent(query, localResults) {
    try {
      const parsedIntent = parseMapIntent(query, urlState.mode);
      const activeSecondaryFilter = SECONDARY_SEARCH_INTENT_RAIL.find((item) => item.filter === activeFilter || item.label === activeFilter);
      const activePrimaryFilter = PRIMARY_SEARCH_INTENT_RAIL.find((item) => item.filter === activeFilter || item.label === activeFilter);
      const activeFilterGroup = activeSecondaryFilter ? "secondary" : activePrimaryFilter ? "primary" : "";
      const currentSearchAction = {
        type: "search",
        query,
        filter: activeFilter,
        collection: urlState.collection,
        timestamp: new Date().toISOString(),
      };
      const recentSearchesForAgent = [query, ...(userInteractionContext.searches || []).filter((item) => item !== query)].slice(0, 8);
      const recentActionsForAgent = [currentSearchAction, ...(userInteractionContext.actions || [])].slice(0, 16);
      const savedEntitySummaries = places
        .filter((place) => savedIds.has(place.id))
        .slice(0, 24)
        .map((place) => ({ id: place.id, name: place.name, category: place.category, district: place.district }));
      const recentlySelectedSummaries = (userInteractionContext.selectedPins || [])
        .map((entityId) => places.find((place) => place.id === entityId))
        .filter(Boolean)
        .slice(0, 12)
        .map((place) => ({ id: place.id, name: place.name, category: place.category, district: place.district }));
      const routeNearbyContext = activeCollectionRoute?.stops?.length && (selected || localResults[0])
        ? getRouteAwareNearbyCards(selected || localResults[0], places, urlState.mode, activeCollectionRoute, savedIds, 8)
          .map((item) => ({
            id: item.place.id,
            name: item.place.name,
            meta: item.meta,
            category: item.place.category,
            district: item.place.district,
          }))
        : [];
      const payload = await queryAgent({
        message: query,
        query,
        sessionId: getWorkflowSessionId(),
        mode: urlState.mode,
        intent: parsedIntent.intents[0] || "ask_map",
        district: isAllNeighborhoodScope(district) ? "Downtown Austin" : district,
        location: {
          label: isAllNeighborhoodScope(district) ? "Downtown Austin" : district,
          coordinates: { lat: AUSTIN_CENTER[0], lng: AUSTIN_CENTER[1] },
        },
        filter: activeFilter,
        activeFilter,
        activeLayer: urlState.layer,
        activeCollection: urlState.collection,
        activeEntity: selectedId,
        activeRoute: activeRouteAgentContext,
        routeContext: activeRouteAgentContext,
        mapBounds: viewportBounds,
        savedEntities: Array.from(savedIds),
        savedEntitySummaries,
        recentUserActions: recentActionsForAgent,
        recentSearches: recentSearchesForAgent,
        recentlySelectedEntities: recentlySelectedSummaries,
        routeNearbyContext,
        activeFilterGroup,
        isSecondaryFilter: Boolean(activeSecondaryFilter),
        parsedIntent,
        intentCategories: parsedIntent.intents.length
          ? parsedIntent.intents
          : urlState.mode === "partner"
            ? ["activity", "campaigns", "perks", "events", "properties", "trends"]
            : ["nearby", "tonight", "perks", "events", "places"],
        agentContext: {
          query,
          mode: urlState.mode,
          activeTab: urlState.tab,
          activeFilter,
          activeLayer: urlState.layer,
          activeCollection: urlState.collection,
          activeRoute: activeRouteAgentContext,
          activeEntity: selectedId,
          userLocation: null,
          mapBounds: viewportBounds,
          mapPosition: viewportBounds ? {
            center: viewportBounds.center || null,
            zoom: viewportBounds.zoom || mapZoom,
            bounds: viewportBounds,
          } : { center: null, zoom: mapZoom },
          timeContext: residentSearchIntent.time || urlState.time || "",
          selectedDistrict: isAllNeighborhoodScope(district) ? "Downtown Austin" : district,
          savedEntities: Array.from(savedIds),
          savedEntitySummaries,
          recentlySelectedEntities: recentlySelectedSummaries,
          recentSearches: recentSearchesForAgent,
          recentActions: recentActionsForAgent,
          routeNearbyContext,
          entityRegistry: places.map((place) => ({
            id: place.id,
            title: place.name,
            kind: place.kind || place.type || place.category || "",
            category: place.category || "",
            district: place.district || "",
            tags: place.tags || place.raw?.tags || [],
          })).slice(0, 220),
        },
        mapContext: localResults.slice(0, 8).map((place) => {
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
      });

      if (!payload?.answer) return null;
      return payload;
    } catch {
      return null;
    }
  }

  async function runSearch(event) {
    event?.preventDefault();
    const query = search.trim() || searchConsoleModeConfig.placeholder;
    const parsedIntent = parseMapIntent(query, urlState.mode);
    const nextFilter = resolveFilterForIntent(query, urlState.mode);
    const routeCollection = getMapCollectionForQuery(query);
    const nextDistrict = parsedIntent.district || district;
    const localResults = getSmartResults(query, nextFilter || activeFilter);
    openSearchResultsLayer();
    recordMapUserAction("search", {
      query,
      filter: nextFilter || activeFilter,
      collection: routeCollection?.id || urlState.collection || "",
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "Downtown Austin" : district),
      resultCount: localResults.length,
    });
    trackingEvents.searchSubmit(query);
    fireWorkflow("/api/search-log", {
      sessionId: getWorkflowSessionId(),
      query,
      lat: AUSTIN_CENTER[0],
      lng: AUSTIN_CENTER[1],
    });
    setSearch(query);
    if (nextFilter) setActiveFilter(nextFilter);
    if (parsedIntent.district) setDistrict(parsedIntent.district);
    setMapAnswer(buildAgenticMapAnswer(query, localResults, urlState.mode, nextDistrict, nextFilter || activeFilter));
    urlState.update({
      tab: "map",
      query,
      q: "",
      filter: nextFilter || activeFilter,
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "" : district),
      time: parsedIntent.timeContext || "",
      intent: parsedIntent.intents[0] || "",
      entityType: parsedIntent.entityType || "",
      collection: routeCollection?.id || "",
      layer: "",
      entityId: "",
      listingId: "",
      drawerClosed: "",
    });

    const agentAnswer = await askMapAgent(query, localResults);
    if (agentAnswer?.answer) {
      setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Start with ${localResults[0]?.name || "Downtown"}.`));
    }
  }

  async function applyPrompt(prompt) {
    const parsedIntent = parseMapIntent(prompt, urlState.mode);
    const nextFilter = resolveFilterForIntent(prompt, urlState.mode);
    const routeCollection = getMapCollectionForQuery(prompt);
    const nextDistrict = parsedIntent.district || district;
    const localResults = getSmartResults(prompt, nextFilter || activeFilter);
    openSearchResultsLayer();
    recordMapUserAction("search", {
      query: prompt,
      filter: nextFilter || activeFilter,
      collection: routeCollection?.id || urlState.collection || "",
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "Downtown Austin" : district),
      resultCount: localResults.length,
      source: "prompt",
    });
    trackingEvents.searchSubmit(prompt);
    fireWorkflow("/api/search-log", {
      sessionId: getWorkflowSessionId(),
      query: prompt,
      lat: AUSTIN_CENTER[0],
      lng: AUSTIN_CENTER[1],
    });
    setSearch(prompt);
    if (nextFilter) setActiveFilter(nextFilter);
    if (parsedIntent.district) setDistrict(parsedIntent.district);
    setMapAnswer(buildAgenticMapAnswer(prompt, localResults, urlState.mode, nextDistrict, nextFilter || activeFilter));
    urlState.update({
      tab: "map",
      query: prompt,
      q: "",
      filter: nextFilter || activeFilter,
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "" : district),
      time: parsedIntent.timeContext || "",
      intent: parsedIntent.intents[0] || "",
      entityType: parsedIntent.entityType || "",
      collection: routeCollection?.id || "",
      layer: "",
      entityId: "",
      listingId: "",
      drawerClosed: "",
    });

    const agentAnswer = await askMapAgent(prompt, localResults);
    if (agentAnswer?.answer) {
      setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Start with ${localResults[0]?.name || "Downtown"}.`));
    }
  }

  function applyResidentIntent(item) {
    setResidentSearchIntent((current) => ({ ...current, intent: item.id }));
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    void applyPrompt(item.prompt);
  }

  function applyResidentTime(item) {
    const currentQuery = search.trim();
    const activeIntentLabel = RESIDENT_INTENT_CONSOLE_BUTTONS.find((intentItem) => intentItem.id === residentSearchIntent.intent)?.label;
    const nextQuery = currentQuery
      ? `${currentQuery} ${item.label.toLowerCase()}`
      : activeIntentLabel
        ? `${activeIntentLabel} ${item.label.toLowerCase()}`
        : item.prompt;
    const nextFilter = resolveFilterForIntent(nextQuery, urlState.mode) || activeFilter;
    const localResults = getSmartResults(nextQuery, nextFilter);
    setResidentSearchIntent((current) => ({ ...current, time: item.id }));
    openSearchResultsLayer();
    setFiltersOpen(false);
    setSearch(nextQuery);
    setActiveFilter(nextFilter);
    setMapAnswer(buildAgenticMapAnswer(nextQuery, localResults, urlState.mode, district, nextFilter));
    urlState.update({
      tab: "map",
      query: nextQuery,
      time: item.id,
      filter: nextFilter,
      radius,
      collection: "",
      layer: "",
      entityId: "",
      listingId: "",
      drawerClosed: "",
    });
  }

  function applyResidentRadius(item) {
    const nextQuery = search.trim() || "What’s worth walking to tonight?";
    const nextFilter = resolveFilterForIntent(nextQuery, urlState.mode) || activeFilter;
    const localResults = getSmartResults(nextQuery, nextFilter);
    setRadius(item.label);
    openSearchResultsLayer();
    setFiltersOpen(false);
    setActiveFilter(nextFilter);
    setMapAnswer(buildAgenticMapAnswer(nextQuery, localResults, urlState.mode, district, nextFilter));
    urlState.update({
      tab: "map",
      query: nextQuery,
      radius: item.label,
      filter: nextFilter,
      collection: "",
      layer: "",
      entityId: "",
      listingId: "",
      drawerClosed: "",
    });
  }

  async function applyResidentConsoleFilter(item) {
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    if (item.collection) {
      setResidentSearchIntent((current) => ({ ...current, intent: null }));
      const nextQuery = item.prompt || item.label || item.collection;
      setSearch(nextQuery);
      if (item.filter) setActiveFilter(item.filter);
      openCollectionRoute(item.collection, nextQuery);
      return;
    }
    if (item.filter) {
      setResidentSearchIntent((current) => ({ ...current, intent: null }));
      const nextQuery = item.prompt || item.filter;
      setSearch(nextQuery);
      setActiveFilter(item.filter);
      const localResults = getSmartResults(nextQuery, item.filter);
      setMapAnswer(buildAgenticMapAnswer(nextQuery, localResults, urlState.mode, district, item.filter));
      openSearchResultsLayer();
      urlState.update({ tab: "map", query: nextQuery, filter: item.filter, collection: "", layer: "", entityId: "", listingId: "", drawerClosed: "" });
      const agentAnswer = await askMapAgent(nextQuery, localResults);
      if (agentAnswer?.answer) {
        setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Start with ${localResults[0]?.name || "Downtown"}.`));
      }
      return;
    }
    if (item.kind === "time") {
      applyResidentTime({ id: item.time, label: "Tonight", prompt: item.prompt });
      return;
    }
    if (item.kind === "radius") {
      applyResidentRadius({ id: "5-min", label: item.radius });
      return;
    }
    void applyPrompt(item.prompt);
  }

  function clearResidentSearchIntent() {
    setSearch("");
    setMapAnswer(null);
    setResidentSearchIntent({ intent: null, time: null });
    setConsoleCollapsed(false);
    urlState.update({ query: "", q: "", prompt: "", intent: "", time: "", collection: "", layer: "", entityId: "" });
  }

  async function askEntityAssistant(prompt) {
    if (!selected) return;
    const cleanPrompt = String(prompt || "").trim();
    if (!cleanPrompt) return;
    const entityPrompt = cleanPrompt.toLowerCase().includes(String(selected.name || "").toLowerCase()) ? cleanPrompt : `${cleanPrompt} for ${selected.name}`;
    const nearbyPlaces = getNearbyAreaPlaces(selected, places, 6).map((item) => item.candidate);
    const localResults = nearbyPlaces.length ? nearbyPlaces : getSmartResults(entityPrompt).filter((place) => place.id !== selected.id).slice(0, 6);
    const localAnswer = buildEntityAssistantAnswer(entityPrompt, selected, localResults, urlState.mode);
    const currentDistrict = selected.district || (isAllNeighborhoodScope(district) ? "Downtown Austin" : district);
    const resultPayload = [selected, ...localResults.filter((place) => place.id !== selected.id)];

    openSearchResultsLayer();
    recordMapUserAction("search", {
      query: entityPrompt,
      filter: activeFilter,
      district: currentDistrict,
      entityId: selected.id,
      entityName: selected.name,
      resultCount: resultPayload.length,
      source: "entity_prompt",
    });
    trackingEvents.searchSubmit(entityPrompt);
    fireWorkflow("/api/search-log", {
      sessionId: getWorkflowSessionId(),
      query: entityPrompt,
      lat: AUSTIN_CENTER[0],
      lng: AUSTIN_CENTER[1],
    });
    setSearch(entityPrompt);
    setMapAnswer(localAnswer);
    setEntityAnswer(localAnswer);
    setEntityAssistantLoading(true);
    urlState.update({
      tab: "map",
      query: entityPrompt,
      q: "",
      filter: activeFilter,
      district: isAllNeighborhoodScope(district) ? "" : district,
      entityId: selected.id,
      layer: "",
      listingId: "",
      drawerClosed: "",
    });

    try {
      const agentAnswer = await askMapAgent(entityPrompt, resultPayload);
      if (agentAnswer?.answer) {
        const mergedAnswer = mergeAgentAnswerWithLocalResults(
          agentAnswer,
          localResults,
          localAnswer?.title || `Start with ${localResults[0]?.name || selected?.name || "Downtown"}.`
        );
        setEntityAnswer(mergedAnswer);
        setMapAnswer(mergedAnswer);
      }
    } finally {
      setEntityAssistantLoading(false);
    }
  }

  function clearOpenMapSelection() {
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setEntityAnswer(null);
    setEntityAssistantLoading(false);
  }

  function switchMode(mode, tab = "map", requestedFilter = "", options = {}) {
    const nextFilter = requestedFilter || (mode === "partner" ? "All" : tab === "pass" ? "All" : activeFilter === "Saved" ? "Saved" : "All");
    clearOpenMapSelection();
    setSearch("");
    setActiveFilter(nextFilter);
    setDistrict(ALL_NEIGHBORHOODS);
    setRadius("5 min walk");
    setIntelOpen(false);
    setFiltersOpen(false);
    setNeighborhoodsOpen(false);
    setSecondaryRailOpen(false);
    setActiveBottomTab("map");
    setConsoleCollapsed(Boolean(options.collapseConsole));
    navigate(`/map?mode=${mode}&tab=${tab}${tab === "map" ? `&filter=${encodeURIComponent(nextFilter)}` : ""}`);
  }

  function openResidentLayer(filter) {
    setActiveBottomTab("map");
    setActiveFilter(filter);
    clearOpenMapSelection();
    setPanelMode("closed");
    setIntelOpen(false);
    setFiltersOpen(false);
    setSecondaryRailOpen(false);
    navigate(`/map?mode=resident&tab=map&filter=${encodeURIComponent(filter)}`);
  }

  const goBackToMap = useCallback(() => {
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab("map");
    setIntelOpen(false);
    setFiltersOpen(false);
    navigate(`/map?mode=${urlState.mode}&tab=map&filter=${encodeURIComponent(activeFilter || "All")}`, { replace: true });
  }, [activeFilter, navigate, urlState.mode]);

  const closeDirectoryToMap = useCallback(() => {
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab("map");
    setActiveFilter("All");
    setIntelOpen(false);
    setFiltersOpen(false);
    navigate(`/map?mode=${urlState.mode}&tab=map&filter=All`);
  }, [navigate, urlState.mode]);

  const closeSelectedMapDrawer = useCallback(() => {
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab("map");
    const collectionParam = urlState.collection ? `&collection=${encodeURIComponent(urlState.collection)}` : "";
    navigate(`/map?mode=${urlState.mode}&tab=map&filter=${encodeURIComponent(activeFilter || "All")}${collectionParam}`, { replace: true });
  }, [activeFilter, navigate, urlState.collection, urlState.mode]);

  const handleSelectedDrawerCloseEvent = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();
    closeSelectedMapDrawer();
  }, [closeSelectedMapDrawer]);

  useEffect(() => {
    function handleNativeDrawerClose(event) {
      const target = event.target;
      const closeTarget = target?.closest?.(".dp-drawer-close, .dp-destination-close, [data-map-drawer-close='true']");
      if (!closeTarget) return;
      const isNativeCloseLink = closeTarget.matches?.("a[data-map-drawer-close='true']");
      if (isNativeCloseLink) return;
      if (!isNativeCloseLink) event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      closeSelectedMapDrawer();
    }

    document.addEventListener("pointerdown", handleNativeDrawerClose, true);
    document.addEventListener("mousedown", handleNativeDrawerClose, true);
    document.addEventListener("touchstart", handleNativeDrawerClose, true);
    document.addEventListener("click", handleNativeDrawerClose, true);
    return () => {
      document.removeEventListener("pointerdown", handleNativeDrawerClose, true);
      document.removeEventListener("mousedown", handleNativeDrawerClose, true);
      document.removeEventListener("touchstart", handleNativeDrawerClose, true);
      document.removeEventListener("click", handleNativeDrawerClose, true);
    };
  }, [closeSelectedMapDrawer]);

  function openPartnerPanel(panel) {
    clearOpenMapSelection();
    setConsoleCollapsed(true);
    setActiveBottomTab(panel);
    navigate(`/map?mode=partner&tab=${panel}`);
  }

  function openPartnerMap(filter = "All") {
    clearOpenMapSelection();
    setConsoleCollapsed(true);
    setActiveBottomTab("map");
    setActiveFilter(filter);
    navigate(`/map?mode=partner&tab=map&filter=${encodeURIComponent(filter)}`);
  }

  const dedupeConsoleItems = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = String(item?.filter || item?.label || item || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const heroPromptLabels = dedupeConsoleItems(
    urlState.mode === "partner" ? PARTNER_PROMPTS : RESIDENT_PROMPTS,
  );
  const primarySearchFilters = dedupeConsoleItems(urlState.mode === "partner" ? PARTNER_SEARCH_FILTERS : RESIDENT_SEARCH_FILTERS);
  const advancedSearchFilters = dedupeConsoleItems(urlState.mode === "partner" ? PARTNER_ADVANCED_SEARCH_FILTERS : RESIDENT_ADVANCED_SEARCH_FILTERS);
  const searchRollupLabel = `Ask the map · ${activeFilter === "All" ? (urlState.mode === "partner" ? "Partners" : "Residents") : activeFilter}`;
  const hasOpenMapPanel = urlState.tab === "pass" || Boolean(selected) || Boolean(clusterDrawer) || Boolean(activePartnerPanel);
  const isCleanMapCommandView =
    urlState.tab === "map" &&
    activeBottomTab === "map" &&
    !selected &&
    !clusterDrawer &&
    !activePartnerPanel &&
    activeFilter !== "Legends" &&
    activeFilter !== "Listings";
  const shouldCollapseSearchConsole =
    consoleCollapsed ||
    hasOpenMapPanel ||
    activeFilter === "Legends" ||
    activeFilter === "Listings";
  const showBottomNavigation = urlState.tab === "map" || urlState.tab === "pass" || Boolean(urlState.panelTab);

  return (
    <div
      className={`dp-map-page relative h-screen overflow-hidden bg-white text-[#0B1F33] ${urlState.mode === "partner" ? "dp-map-page-partner" : "dp-map-page-resident"}`}
      data-map-zoom={mapZoom.toFixed(2)}
    >
      <div className="absolute inset-x-0 bottom-0 top-0">
        <GoogleMapErrorBoundary>
          <GoogleMapCanvas
            center={initialMapView.center}
            zoom={initialMapView.zoom}
            mapItems={clusteredMapItems}
            collectionRoute={activeCollectionRoute}
            fitPlaces={activeCollectionRoute?.stops?.length ? activeCollectionRoute.stops : discoverDisplayPlaces}
            fitActiveKey={mapResultBoundsKey}
            fitEnabled={hasActiveCategoryScope && !isCleanResidentPerksLaunch && !userHasNavigatedMap && !isStreetLevelMapView}
            selected={selected}
            selectedId={selectedId}
            pulsingPinId={pulsingPinId}
            onSelect={selectPlace}
            onSelectNearestLegends={selectNearestLegendsListing}
            onClusterOpen={openClusterDrawer}
            onZoomChange={(nextZoom) => setMapZoom((current) => (Math.abs(current - nextZoom) > 0.01 ? nextZoom : current))}
            onViewportChange={updateViewportBounds}
            onUserNavigate={() => {
              try {
                window.sessionStorage.setItem(MAP_USER_NAVIGATED_STORAGE_KEY, "true");
              } catch {
                // Session storage is best-effort only.
              }
              setUserHasNavigatedMap(true);
              if (urlState.mode !== "resident" && !consoleHasActiveWork) setConsoleCollapsed(true);
            }}
          />
        </GoogleMapErrorBoundary>
      </div>

      {urlState.tab === "map" && activeCollectionRoute?.stops?.length && (!selected || selectedDrawerClosed) ? (
        <CollectionRoutePanel
          route={activeCollectionRoute}
          selectedStopId={selectedId}
          onSelectStop={selectCollectionStop}
          onStart={() => selectCollectionStop(activeCollectionRoute.stops[0])}
          onViewStops={() => setResultsExpanded(true)}
          onExit={exitCollectionRoute}
        />
      ) : null}

      {urlState.tab === "map" && (
        <div
          className="dp-map-search-anchor pointer-events-none absolute inset-x-0 top-[72px] z-[680] px-2.5 md:top-[80px] md:px-5"
        >
          <SearchIntentConsole
            mode={urlState.mode}
            query={search}
            placeholder={searchPlaceholder}
            activeIntent={residentSearchIntent.intent}
            activeTime={residentSearchIntent.time}
            activeRadius={radius}
            activeFilter={activeFilter}
            activeCollection={urlState.collection}
            resultCount={mapPlaces.length}
            inputRef={searchInputRef}
            onQueryChange={(value) => {
              setConsoleCollapsed(false);
              setSearch(value);
              if (mapAnswer) setMapAnswer(null);
            }}
            onSubmit={(event) => {
              void runSearch(event);
            }}
            onClear={clearResidentSearchIntent}
            onIntentSelect={applyResidentIntent}
            onFilterSelect={applyResidentConsoleFilter}
            onTimeSelect={applyResidentTime}
            onRadiusSelect={applyResidentRadius}
            onCollectionSelect={(collection, item) => openCollectionRoute(collection, item?.prompt || item?.label || "")}
            onPromptSelect={(prompt) => {
              setResidentSearchIntent({ intent: null, time: null });
              void applyPrompt(prompt);
            }}
            onModeChange={(mode) => {
              if (mode === urlState.mode) return;
              setActiveBottomTab("map");
              urlState.update({
                mode,
                tab: "map",
                filter: activeFilter || "All",
                query: search || "",
              });
            }}
            isCollapsed={shouldCollapseSearchConsole}
            onCollapse={() => setConsoleCollapsed(true)}
            onExpand={() => setConsoleCollapsed(false)}
          />
        </div>
      )}

      {urlState.tab === "pass" && urlState.mode === "partner" && (
        <div className="pointer-events-none absolute inset-0 z-[540] flex items-end justify-center bg-[#0B1F33]/10 p-2 backdrop-blur-[2px] sm:p-4 md:items-center">
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="dp-panel-shell dp-pass-panel pointer-events-auto flex max-h-[calc(100dvh-12px)] w-full max-w-xl flex-col overflow-hidden rounded-t-[12px] p-0 md:max-h-[calc(100dvh-2rem)] md:rounded-[12px]"
            role="dialog"
            aria-modal="true"
            aria-label="Partner scanner"
          >
            <div className="dp-panel-header flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-4 md:py-2.5">
              <button type="button" onClick={goBackToMap} className="dp-panel-back" aria-label="Back to map">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="dp-panel-header-title text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A] md:text-[10px] md:tracking-[0.16em]">
                Partner scanner
              </span>
              <button type="button" onClick={() => switchMode(urlState.mode, "map")} className="dp-panel-close inline-flex h-8 w-8 items-center justify-center rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="dp-pass-panel-body min-h-0 flex-1 overflow-y-auto px-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 md:pb-4 md:pt-3">
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
                  <button type="button" onClick={() => navigate("/card")} className="dp-pass-action">Resident Pass</button>
                  <button type="button" onClick={() => switchMode("partner", "map")} className="dp-pass-action">Partner Map</button>
                </div>
            </div>
          </motion.section>
        </div>
      )}

      {urlState.tab === "pass" && urlState.mode !== "partner" && (
        <div className="pointer-events-none absolute inset-0 z-[540] flex items-end justify-center p-2 sm:p-4 md:items-center">
          <MapSheet
            variant="resident-card"
            ariaLabel="Resident access card"
            onBack={goBackToMap}
            onClose={() => switchMode(urlState.mode, "map")}
            className="dp-resident-card-sheet pointer-events-auto"
          >
            <div className="dp-map-sheet-handle" aria-hidden="true" />
            <MapSheetToolbar
              eyebrow="RESIDENT CARD"
              onBack={goBackToMap}
              onClose={() => switchMode(urlState.mode, "map")}
            />
            <div className="dp-map-sheet-scroll">
                <section className="dp-resident-card-identity">
                  <p className="dp-map-panel-eyebrow">RESIDENT ACCESS</p>
                  <h2 className="dp-map-panel-title">Your Downtown Card</h2>
                  <p className="dp-map-panel-subtitle">
                    Use your card when a participating place, event, or building benefit asks for resident access.
                  </p>
                </section>

                <section className={`dp-card-credential ${passPresented ? "is-ready" : ""}`} aria-label="Resident QR code">
                  <div className="dp-card-credential-header">
                    <span className="dp-card-credential-kicker">VERIFIED RESIDENT</span>
                    <span className="dp-card-credential-status">{passPresented ? "Scanned" : "Ready"}</span>
                  </div>
                  <h3 className="dp-card-credential-title">Downtown Austin</h3>
                  <p className="dp-card-credential-copy">
                    {passPresented
                      ? "Resident access is confirmed. You can use this card for eligible perks, event check-ins, and participating partner experiences."
                      : "Show this QR code when a participating partner asks to confirm resident access."}
                  </p>
                  <div className="dp-card-qr-wrap">
                    <DemoQrCode code={residentCardPayload.qrValue} className="dp-card-qr-image" />
                  </div>
                  <div className="dp-card-scan-demo" aria-live="polite">
                    <span>{passPresented ? "Resident access confirmed" : "Ready when a partner asks"}</span>
                    <button type="button" onClick={presentResidentPass}>
                      {passPresented ? "Show Again" : "Confirm Access"}
                    </button>
                  </div>
                  <div className="dp-card-verification-row">
                    <span>{passPresented ? "Confirmed resident · Downtown Austin" : "Verified resident · Downtown Austin"}</span>
                    <code>{residentCardPayload.uid}</code>
                  </div>
                </section>

                <MapPanelMatrix label="RESIDENT STATUS">
                  <MapPanelMatrixRow label="Status" value="Verified Resident" />
                  <MapPanelMatrixRow label="Access" value="Downtown Austin" />
                  <MapPanelMatrixRow label="Active Through" value="December 2026" />
                  <MapPanelMatrixRow label="Partner Access" value="Enabled" />
                </MapPanelMatrix>

                <section className="dp-map-panel-section dp-map-panel-section--compact" aria-label="Current access">
                  <p className="dp-map-panel-section-label">CURRENT ACCESS</p>
                  <h3 className="dp-map-panel-section-title">Resident benefits nearby</h3>
                  <p className="dp-map-panel-body-copy">Participating places can use this card for eligible resident perks, event entry, featured experiences, and limited-time offers.</p>
                  <span className="dp-map-panel-small-note">Availability can vary by partner, event, and building.</span>
                </section>

                <section className="dp-map-panel-section dp-map-panel-section--compact" aria-label="Tonight nearby">
                  <p className="dp-map-panel-section-label">TONIGHT NEARBY</p>
                  <p className="dp-map-panel-body-copy">Open the Events layer to see walkable plans, check-in moments, and resident-friendly experiences before you head out.</p>
                </section>

                <section className="dp-map-panel-note">
                  <p className="dp-map-panel-section-label">BUILDING MEMBERSHIP</p>
                  <p className="dp-map-panel-body-copy">If your building joins Downtown Perks after you purchase individual access, your resident membership can be credited or refunded through the building plan.</p>
                </section>
            </div>
            <footer className="dp-map-sheet-action-footer">
              <MapPanelButton action="open-detail" label={passPresented ? "Confirmed" : "Show QR"} ariaLabel={passPresented ? "Show confirmed resident QR again" : "Show resident QR code"} variant="primary" onPress={presentResidentPass} />
              <div className="dp-map-sheet-action-grid">
                <MapPanelButton action="open-detail" label="Add Wallet" ariaLabel={walletAdded ? "Add wallet already completed" : "Add card to wallet"} variant="secondary" onPress={saveResidentPassForLater} />
                <MapPanelButton action="open-filter" label="Perks" ariaLabel="Open Perks panel" variant="secondary" onPress={() => switchMode("resident", "map", "Perks")} />
                <MapPanelButton action="open-filter" label="Events" ariaLabel="Open Events panel" variant="secondary" onPress={() => switchMode("resident", "map", "Events")} />
              </div>
            </footer>
          </MapSheet>
        </div>
      )}

	      {showBottomNavigation && (
        <div className="dp-map-bottom-nav-shell pointer-events-none fixed inset-x-0 bottom-0 z-[700] pb-[env(safe-area-inset-bottom)]">
          <nav
            className="dp-map-bottom-nav pointer-events-auto grid grid-cols-5"
            aria-label="Map bottom navigation"
            style={{ "--dp-bottom-nav-count": 5 }}
          >
            {urlState.mode === "resident" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    clearOpenMapSelection();
                    setConsoleCollapsed(true);
                    setActiveBottomTab("info");
                    setActiveFilter("All");
                    navigate("/map?mode=resident&tab=map&filter=All&panel=info");
                  }}
                  aria-pressed={activeBottomTab === "info"}
                >
                  <Info className="h-4 w-4" />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearOpenMapSelection();
                    setConsoleCollapsed(true);
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
                    clearOpenMapSelection();
                    setConsoleCollapsed(true);
                    setActiveBottomTab("perks");
                    setActiveFilter("Perks");
                    navigate("/map?mode=resident&tab=map&filter=Perks");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "perks"}
                >
                  <Gift className="h-4 w-4" />
                  <span>Perks</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearOpenMapSelection();
                    setConsoleCollapsed(true);
                    setActiveBottomTab("events");
                    setActiveFilter("Events");
                    navigate("/map?mode=resident&tab=map&filter=Events");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "events"}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Events</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearOpenMapSelection();
                    setConsoleCollapsed(true);
                    setActiveBottomTab("card");
                    navigate("/map?mode=resident&tab=pass");
                  }}
                  aria-pressed={urlState.tab === "pass"}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </button>
              </>
            )}
            {urlState.mode === "partner" && (
              <>
                <button
                  type="button"
                  onClick={() => openPartnerMap("All")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "map"}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPartnerPanel("campaigns")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "campaigns"}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Campaigns</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPartnerPanel("activity")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "activity"}
                  aria-label="Activity"
                >
                  <ScanLine className="h-4 w-4" />
                  <span>Activity</span>
                  {contextCount > 0 && <span aria-hidden="true" className="dp-nav-activity-badge">{Math.min(contextCount, 9)}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => openPartnerPanel("reports")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "reports"}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Reports</span>
                </button>
                <button
                  type="button"
                  onClick={() => openPartnerPanel("info")}
                  aria-pressed={activeBottomTab === "info"}
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
        {(urlState.tab === "map" || Boolean(urlState.panelTab)) && (
          urlState.mode === "partner"
            ? Boolean(activePartnerPanel) || isLegendsDirectoryLayer
            : ["perks", "events", "saved", "info"].includes(activeBottomTab) || isLegendsDirectoryLayer
        ) && (!selected || selectedDrawerClosed || activePartnerPanel) && (
          <motion.aside
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={isLegendsDirectoryLayer
              ? "dp-map-directory-sheet dp-legends-directory-sheet"
              : `dp-panel-shell dp-map-drawer-shell ${isResidentSavedDrawer ? "dp-saved-drawer-shell" : ""} ${activePartnerPanel === "campaigns" ? "dp-map-campaign-drawer" : ""} ${activePartnerPanel === "reports" ? "dp-map-reports-drawer" : ""} absolute inset-x-0 bottom-0 z-[620] mx-auto flex max-h-[min(88dvh,calc(100dvh-72px))] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[12px] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:max-h-[64dvh] md:rounded-t-[12px]`}
            style={MAP_DRAWER_SURFACE_STYLE}
            role="dialog"
            aria-modal="true"
            aria-label={isLegendsDirectoryLayer ? "Legends Real Estate listings" : urlState.mode === "partner" && activePartnerPanel === "reports" ? "Partner map reports" : urlState.mode === "partner" ? "Partner map results" : "Map results"}
          >
            <div className={isLegendsDirectoryLayer ? "dp-map-directory-handle" : "dp-panel-handle mx-auto mb-2 h-0.5 w-10 shrink-0 rounded-[2px] bg-[#0B1F33]/14 md:mb-3 md:h-1 md:w-12"} aria-hidden="true" />
            <div className={isLegendsDirectoryLayer ? "dp-map-directory-toolbar" : "dp-panel-toolbar mb-2 flex shrink-0 items-center justify-between gap-2 md:mb-3 md:gap-3"}>
              {isLegendsDirectoryLayer ? (
                <>
                  <MapPanelButton action="back" label="Map" ariaLabel="Return to map" variant="secondary" size="sm" className="dp-map-directory-back" onPress={closeDirectoryToMap}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </MapPanelButton>
                  <MapPanelButton action="close" label="Close" ariaLabel="Close Legends Real Estate listings panel" variant="icon" size="sm" className="dp-map-directory-close" onPress={closeDirectoryToMap}>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </MapPanelButton>
                </>
              ) : (
                <>
                  <button type="button" onClick={goBackToMap} className="dp-panel-back" aria-label="Back to map">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={goBackToMap}
                    className="dp-panel-close flex h-8 w-8 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9"
                    aria-label={urlState.mode === "partner" && activePartnerPanel === "reports" ? "Close reports" : "Close"}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div
              className={`dp-panel-body dp-panel-scroll min-h-0 ${isLegendsDirectoryLayer ? "hidden" : urlState.mode === "partner" ? "flex-1 overflow-y-auto" : "hidden"}`}
              data-panel-body
            >
              {urlState.mode === "partner" && activePartnerPanel === "activity" && renderActivityPanel()}
              {urlState.mode === "partner" && activePartnerPanel === "reports" && renderReportsPanel()}
              {urlState.mode === "partner" && activePartnerPanel === "campaigns" && renderCampaignPanel()}
              {urlState.mode === "partner" && activePartnerPanel === "info" && renderInfoPanel()}
              {urlState.mode === "partner" && activePartnerPanel === "civic" && renderCivicPanel()}
              {urlState.mode === "partner" && !activePartnerPanel && (
              <div className="dp-partner-intel-grid mb-3 grid shrink-0 gap-2 md:grid-cols-3">
                {(activeFilter === "Events"
                  ? [
                      ["What events can show", "Saves, RSVPs, direction taps, timing, and nearby places people check before and after the event."],
                      ["Who is close enough", "Residents, hotel guests, visitors, and event-goers already moving through Rainey, Seaholm, and downtown."],
                      ["What to try next", "Feature Hotel Van Zandt, Geraldine's, First Thursday, happy hour, or live music moments when timing matters."],
                    ]
                  : activeFilter === "Brands"
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
            </div>

            {isLegendsDirectoryLayer ? (
              <>
                <section className="dp-map-directory-header">
                  <p className="dp-map-directory-eyebrow">LEGENDS REAL ESTATE</p>
                  <h2 className="dp-map-directory-title">Downtown listings, in context.</h2>
                  <span className="dp-map-directory-subtitle">
                    Active Legends inventory with building context, walkable demand, and nearby lifestyle signals for each address.
                  </span>
                  <strong className="dp-map-directory-count">
                    {legendsDirectoryPlaces.length || discoverDisplayPlaces.length} active listings
                  </strong>
                </section>
                <div className="dp-map-directory-list">
                  {legendsDirectoryPlaces.map((place) => (
                    isRentalEntity(place) ? (
                      <LegendsRentalResultRow
                        key={place.id}
                        place={place}
                        selected={place.id === selectedId}
                        onSelect={() => selectPlace(place)}
                      />
                    ) : (
                      (() => {
                        const row = getLegendsDirectoryRowCopy(place);
                        return (
                          <button
                            key={place.id}
                            type="button"
                            className="dp-legends-result-row"
                            data-action="select"
                            data-selected={place.id === selectedId ? "true" : "false"}
                            onClick={() => selectPlace(place)}
                            aria-label={`View ${row.title}`}
                          >
                            <span className="dp-legends-result-pin" aria-hidden="true">
                              <PinBadge place={place} selected={place.id === selectedId} size="sm" />
                            </span>
                            <span className="min-w-0">
                              <span className="dp-legends-result-meta">{row.meta}</span>
                              <span className="dp-legends-result-title">{row.title}</span>
                              <span className="dp-legends-result-address">{row.address}</span>
                              <span className="dp-legends-result-details">{row.details}</span>
                            </span>
                            <span className="dp-legends-result-action">View</span>
                          </button>
                        );
                      })()
                    )
                  ))}
                  {!legendsDirectoryPlaces.length && (
                    <div className="dp-info-row bg-white p-4 text-[13px] leading-6 text-[#425466]">
                      No active Legends inventory is visible yet. Try Legends, Listings, or a nearby real estate search.
                    </div>
                  )}
                </div>
              </>
            ) : urlState.mode !== "partner" && isResidentSavedDrawer ? (
              renderSavedCollectionPanel()
            ) : urlState.mode !== "partner" && activeBottomTab === "info" ? (
              <div className="dp-resident-tab-panel dp-resident-info-tab-panel min-h-0 flex-1 overflow-hidden">
                <div
                  className="dp-resident-tab-panel-list dp-resident-info-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]"
                >
                  {renderInfoPanel()}
                </div>
              </div>
            ) : urlState.mode !== "partner" ? (
            <div className="dp-resident-tab-panel min-h-0 flex-1 overflow-hidden">
              {residentPanelCopy && (
                <section className="dp-resident-tab-panel-header">
                  <p>{residentPanelCopy.eyebrow}</p>
                  <h2>{residentPanelCopy.title}</h2>
                  <span>{residentPanelCopy.body}</span>
                  <strong>{discoverDisplayPlaces.length} places</strong>
                </section>
              )}
              <div
                className="dp-resident-tab-panel-list min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] md:space-y-2"
              >
              {drawerPreviewPlaces.map((place) => (
                (() => {
                  const isRentalRow = isRentalEntity(place);
                  if (isRentalRow) {
                    const rental = getRentalListingData(place);
                    const facts = [
                      rental.beds !== undefined ? `${rental.beds} bd` : "",
                      rental.baths !== undefined ? `${rental.baths} ba` : "",
                      rental.sqft ? `${Number(rental.sqft).toLocaleString()} sqft` : "",
                    ].filter(Boolean).join(" · ");
                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className={`dp-directory-result-row dp-rental-list-row grid w-full grid-cols-[34px_1fr_auto] items-start gap-2 p-1.5 text-left transition-all md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2 ${
                          place.id === selectedId ? "dp-panel-row is-selected text-[#0B1F33]" : "dp-panel-row text-[#0B1F33]"
                        }`}
                      >
                        <PinBadge place={place} selected={place.id === selectedId} />
                        <span className="min-w-0">
                          <span className="dp-directory-context block truncate">Active · {rental.priceLabel}</span>
                          <span className="dp-directory-story block truncate">{rental.address || place.name}</span>
                          <span className="dp-directory-meaning mt-0.5 block truncate">
                            {facts} · Building: {rental.building}
                          </span>
                          <span className="dp-directory-meaning mt-0.5 block truncate">
                            Unit {rental.unit} · MLS {rental.mls} · {rental.neighborhood}
                          </span>
                        </span>
                        <span className="dp-directory-action">
                          Details
                        </span>
                      </button>
                    );
                  }
                  const offer = getCanonicalResidentOffer(place) || getResidentPerkDetails(place);
                  const offerTitle = offer?.title || offer?.offer || place.perk?.offer || place.recommended_perk || place.partner_opportunity || "";
                  const isPerkRow = activeBottomTab === "perks" && hasActivePerkData(place);
                  const perkRedeemed = redeemedPerkIds.has(place.id);
                  return (
                    <article
                      key={place.id}
                      className={`dp-directory-result-row dp-resident-native-row grid w-full grid-cols-[34px_1fr] items-start gap-2 p-1.5 text-left transition-all md:grid-cols-[42px_1fr] md:gap-3 md:p-2 ${
                        place.id === selectedId ? "dp-panel-row is-selected text-[#0B1F33]" : "dp-panel-row text-[#0B1F33]"
                      }`}
                    >
                      <PinBadge place={place} selected={place.id === selectedId} />
                      <span className="min-w-0 dp-resident-native-row-body">
                        <button type="button" className="dp-resident-native-row-main" onClick={() => selectPlace(place)} aria-label={`Open ${place.name}`}>
                          <span className="dp-directory-context block truncate">{offer?.category || place.category || "Downtown place"}</span>
                          <span className="dp-directory-story block truncate">{place.name}</span>
                          <span className="dp-directory-meaning mt-0.5 block">
                            {place.district ? `${place.district} · ` : ""}{offerTitle || "Explore what is useful nearby."}
                          </span>
                        </button>
                        {isPerkRow ? (
                          <span className="dp-resident-row-action-strip" aria-label={`${place.name} perk actions`}>
                            <button type="button" onClick={() => toggleSaved(place)} aria-pressed={savedIds.has(place.id)}>
                              {savedIds.has(place.id) ? "Saved" : "Save"}
                            </button>
                            <a href={directionsUrl(place)} target="_blank" rel="noreferrer">
                              Directions
                            </a>
                            <button type="button" onClick={() => openResidentQrModal(place, "use_perk", "resident_perks_panel")} disabled={perkRedeemed}>
                              {perkRedeemed ? "Redeemed" : "Use perk"}
                            </button>
                          </span>
                        ) : (
                          <span className="dp-resident-row-action-strip" aria-label={`${place.name} actions`}>
                            <button type="button" onClick={() => selectPlace(place)}>View details</button>
                          </span>
                        )}
                      </span>
                    </article>
                  );
                })()
              ))}
              {!drawerPreviewPlaces.length && (
                <div className="dp-info-row bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  Nothing here yet. Try a nearby search, save a place, or switch filters.
                </div>
              )}
              {isUsingFallbackPlaces && (
                <div className="dp-info-row bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  Keeping nearby downtown places visible while your question sorts the best next options.
                </div>
              )}
              {(isResidentSavedDrawer ? residentSavedPlaces : discoverDisplayPlaces).length > 4 && (
                <button
                  type="button"
                  onClick={() => setResultsExpanded((value) => !value)}
                  className="dp-action-link w-full justify-center bg-transparent text-[11px] text-[#0B1F33]/66"
                  aria-expanded={resultsExpanded}
                >
                  {resultsExpanded ? "Show less" : `Show more (${isResidentSavedDrawer ? hiddenSavedPreviewCount : hiddenPreviewCount})`}
                </button>
              )}
              </div>
            </div>
            ) : null}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clusterDrawer && urlState.tab === "map" && (!selected || selectedDrawerClosed) && (
          <motion.aside
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell dp-map-drawer-shell absolute inset-x-0 bottom-0 z-[640] mx-auto flex max-h-[min(88dvh,calc(100dvh-72px))] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[12px] md:max-h-[68dvh] md:rounded-t-[12px]"
            style={MAP_DRAWER_SURFACE_STYLE}
            role="dialog"
            aria-modal="true"
            aria-label="Grouped map places"
          >
            <div className="dp-panel-header shrink-0">
              <button type="button" onClick={goBackToMap} className="dp-panel-back dp-panel-back-floating" aria-label="Back to map">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="dp-panel-header-copy">
                <p className="dp-panel-eyebrow">{urlState.mode === "partner" ? "What's happening nearby" : "Nearby places"}</p>
                <h2 className="dp-panel-title">{getClusterTitle(clusterDrawer, urlState.mode)}</h2>
                <p className="dp-panel-subtitle">{getClusterSubtitle(clusterDrawer, urlState.mode)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setClusterDrawer(null);
                  setActiveBottomTab("map");
                  urlState.update({ entityId: "", drawerClosed: "" });
                }}
                className="dp-panel-close"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="dp-grouped-list min-h-0 flex-1">
              {clusterPlacesForDrawer.map((place) => {
                const listing = getLegendsListing(place);
                const explicitOffer = getExplicitGroupedOffer(place);
                const rowMeta = [place.category || "Downtown place", place.district || place.neighborhood || "Downtown"].filter(Boolean).join(" · ");
                const listingMeta = listing
                  ? [listing.price, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqft ? `${listing.sqft} sqft` : ""].filter(Boolean).join(" · ")
                  : "";
                const offerLine = listingMeta || explicitOffer;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="dp-grouped-row"
                  >
                    <span className="dp-grouped-icon">
                      <PinBadge place={place} />
                    </span>
                    <span className="dp-grouped-copy">
                      <span className="dp-grouped-title">{place.name}</span>
                      <span className="dp-grouped-meta">{rowMeta}</span>
                      {offerLine && <span className="dp-grouped-offer">{offerLine}</span>}
                    </span>
                    <span className="dp-grouped-status">
                      {listing ? "Contact" : "Open"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && !selectedDrawerClosed && !activePartnerPanel && urlState.tab !== "pass" && (
          <motion.aside
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className={`dp-map-panel dp-panel-shell dp-detail-drawer dp-destination-drawer dp-detail-framework dp-map-drawer-panel dp-map-drawer-shell ${usesCleanResidentialEntityDrawer(selected) ? "dp-entity-drawer-shell" : ""}`}
            data-panel-kind={getMapDrawerPanelKind(selected, urlState.mode)}
            data-drawer-state="expanded"
            role="dialog"
            aria-modal="true"
            aria-labelledby={!usesCleanResidentialEntityDrawer(selected) || shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? "destination-drawer-title" : undefined}
            aria-describedby={shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? "destination-drawer-context" : undefined}
            aria-label={shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? undefined : `${selected.name} details`}
          >
            {!usesCleanResidentialEntityDrawer(selected) && (
              <div className="dp-map-panel-header dp-drawer-control-row" aria-label="Drawer controls">
                <button
                  type="button"
                  onClick={goBackToMap}
                  className="dp-map-panel-icon-button dp-drawer-control dp-destination-back dp-drawer-back"
                  aria-label="Back to map"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <span id="destination-drawer-title" className="dp-map-panel-title dp-drawer-control-title">{getEntityIdentity(selected, urlState.mode).displayTitle || selected.name}</span>
                <button
                  type="button"
                  onClick={closeSelectedMapDrawer}
                  data-map-drawer-close="true"
                  className="dp-map-panel-icon-button dp-drawer-icon-control dp-destination-close dp-drawer-close"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div
              className="dp-map-panel-scroll dp-destination-scroll dp-drawer-scroll"
            >
              {(() => {
                const entityKind = getResidentEntityKind(selected);
                const legendsListing = getResolvedLegendsListing(selected);
                const isRental = entityKind === "rental" || isRentalEntity(selected);
                const isCampaign = entityKind === "campaign" || isCampaignEntity(selected);
                const isProperty = !isRental && (entityKind === "property" || Boolean(legendsListing || getLuxuryPresenceBuilding(selected) || isLegendsListingLike(selected)));
                const isParking = isParkingEntity(selected);
                const isDaaStop = isDaaTourPlace(selected);
                const isDaaCivic = isDaaCivicEntity(selected);
                const isInKindDining = isInKindEntity(selected);
                const isBurgerBarPanel = isBurgerBarCongress(selected);
                const isLocalService = isLocalServiceEntity(selected);
                const isFrostTowerPanel = isFrostTowerEntity(selected);
                const isNeighborhoodPanel = isNeighborhoodEntity(selected);
                const isEventPanel = isEventEntity(selected) && !isCampaign && !isHappyHourEntity(selected);
                const legendsResidentialContent = getLegendsResidentialContentForPlace(selected);
                const legendsResidentialProfile = getLegendsResidentialProfileForPlace(selected);
                const contactFormId = `map-contact-form-${selected.id}`;
                const openContactForm = () => {
                  setAgentFormPlaceId(selected.id);
                  setAgentFormSubmitted(false);
                  window.setTimeout(() => {
                    document.getElementById(contactFormId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                  }, 80);
                };
                const closeSelectedDrawer = () => {
                  closeSelectedMapDrawer();
                };
                const openEntityFilter = (filter) => {
                  setSelectedId("");
                  setActiveBottomTab("map");
                  setActiveFilter(filter);
                  urlState.update({ tab: "map", filter, entityId: "" });
                };
                const shouldShowStandardActionPanel = false;
                const standardActionPanel = shouldShowStandardActionPanel ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04, duration: 0.18 }}>
                    <MapActionStandardPanel
                      entity={selected}
                      mode={urlState.mode}
                      saved={savedIds.has(selected.id)}
                      rsvped={(Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === selected.id)}
                      onSave={() => toggleSaved(selected)}
                      onRsvp={() => toggleRsvp(selected)}
                      onContact={openContactForm}
                    />
                  </motion.div>
                ) : null;
                const withStandardActionPanel = (content) => (
                  <>
                    {standardActionPanel || null}
                    {content}
                  </>
                );

                if (isTheShorePropertyEntity(selected)) {
                  return withStandardActionPanel(
                    <TheShoreResidentialEntityDrawer
                      place={selected}
                      mode={urlState.mode}
                      places={places}
                      savedIds={savedIds}
                      agentFormSubmitted={agentFormSubmitted}
                      onSelect={selectPlace}
                      onSave={() => toggleSaved(selected)}
                      onShowCard={() => openResidentQrModal(selected, "show_card", "the_shore_residential_drawer")}
                      onContact={openContactForm}
                      onSubmitContact={() => setAgentFormSubmitted(true)}
                      onBack={goBackToMap}
                      onClose={closeSelectedMapDrawer}
                    />
                  );
                }

                if ((isRental || isProperty || legendsListing || isLegendsMapPlace(selected)) && legendsResidentialProfile && !isDaaStop) {
                  return withStandardActionPanel(
                    <LegendsResidentialIntelligenceDrawer
                      place={selected}
                      profile={legendsResidentialProfile}
                      mode={urlState.mode}
                      places={places}
                      savedIds={savedIds}
                      onSelect={selectPlace}
                      onSave={() => toggleSaved(selected)}
                      onFilter={openEntityFilter}
                      onBack={goBackToMap}
                      onClose={closeSelectedMapDrawer}
                      onRoute={(nextState) => {
                        setSelectedId(nextState?.entityId || "");
                        setSelectedPlaceOverride(null);
                        setMapAnswer(null);
                        setEntityAnswer(null);
                        setClusterDrawer(null);
                        setActiveBottomTab(nextState?.tab || "map");
                        if (nextState?.filter) setActiveFilter(nextState.filter);
                        if (nextState?.district !== undefined) setDistrict(nextState.district || ALL_NEIGHBORHOODS);
                        urlState.update(nextState);
                      }}
                    />
                  );
                }

                if (isIndependentPropertyEntity(selected)) {
                  return withStandardActionPanel(
                    <CleanIndependentEntityDrawer
                      place={selected}
                      mode={urlState.mode}
                      places={places}
                      savedIds={savedIds}
                      onSelect={selectPlace}
                      onSave={() => toggleSaved(selected)}
                      onShowCard={() => openResidentQrModal(selected, "show_card", "clean_residential_drawer")}
                      onFilter={openEntityFilter}
                      onRoute={(nextState) => {
                        setSelectedId("");
                        setSelectedPlaceOverride(null);
                        setMapAnswer(null);
                        setEntityAnswer(null);
                        setClusterDrawer(null);
                        setActiveBottomTab(nextState?.tab || "map");
                        if (nextState?.filter) setActiveFilter(nextState.filter);
                        if (nextState?.district !== undefined) setDistrict(nextState.district || ALL_NEIGHBORHOODS);
                        urlState.update(nextState);
                      }}
                    />
                  );
                }

                if (isNeighborhoodPanel) {
                  return withStandardActionPanel(
                    <NeighborhoodDetailDrawer
                      place={selected}
                      places={places}
                      mode={urlState.mode}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                    />
                  );
                }

                if (urlState.mode === "partner" && !isProperty) {
                  return withStandardActionPanel(
                    <PartnerIntelligenceDrawer
                      place={selected}
                      places={places}
                      onSelect={selectPlace}
                      onContact={openContactForm}
                      answer={entityAnswer}
                      loading={entityAssistantLoading}
                      onAsk={askEntityAssistant}
                      onCloseAnswer={() => setEntityAnswer(null)}
                    />
                  );
                }

                if (isLocalService) {
                  return withStandardActionPanel(
                    <LocalServiceDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      answer={entityAnswer}
                      loading={entityAssistantLoading}
                      onAsk={askEntityAssistant}
                      onCloseAnswer={() => setEntityAnswer(null)}
                      mode={urlState.mode}
                    />
                  );
                }

                if (isEventPanel) {
                  return withStandardActionPanel(
                    <EventDetailDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      eventRsvps={eventRsvps}
                      onRsvp={() => toggleRsvp(selected)}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      answer={entityAnswer}
                      loading={entityAssistantLoading}
                      onAsk={askEntityAssistant}
                      onCloseAnswer={() => setEntityAnswer(null)}
                      mode={urlState.mode}
                    />
                  );
                }

                return (
                  <motion.div className={urlState.mode === "partner" ? "dp-map-panel-content dp-partner-detail-content" : "dp-map-panel-content dp-destination-content dp-detail-content"}>
                    <DestinationHero place={selected} mode={urlState.mode} />
                    <EntityIdentityPanel identity={getEntityIdentity(selected, urlState.mode)} />
                    {standardActionPanel}
                    {!isInKindDining && !isBurgerBarPanel && !isHappyHourEntity(selected) && !(urlState.mode === "resident" && hasActivePerkData(selected)) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                        <PanelContext place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.18 }}>
                      {urlState.mode === "partner" && shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? null : urlState.mode === "partner" ? (
                        <PartnerDrawerActions place={selected} onContact={openContactForm} />
                      ) : (
                        <ResidentDrawerActions
                          selected={selected}
                          selectedResidentAction={selectedResidentAction}
                          savedIds={savedIds}
                          eventRsvps={eventRsvps}
                          legendsListing={legendsListing}
                          onContact={openContactForm}
                          onRsvp={() => toggleRsvp(selected)}
                          onShowCard={() => openResidentQrModal(selected, "show_card", "resident_drawer_actions")}
                          onAskMap={() => askEntityAssistant(`Which nearby perks make ${selected.name} fit?`)}
                          onSave={() => toggleSaved(selected)}
                          onTrackAction={(action, source, extra = {}) => {
                            fireWorkflow("/api/map-actions", buildMapActionPayload(selected, action, source, {
                              form: {
                                intent: action,
                                label: action,
                                ...extra.form,
                              },
                              metadata: extra.metadata,
                            }));
                          }}
                        />
                      )}
                    </motion.div>
                    {isCampaign && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.18 }}>
                        <MapNativeCampaignDetails place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    {isRental ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                        <RentalListingDetails place={selected} />
                      </motion.div>
                    ) : legendsResidentialContent ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                        <LegendsResidentialMatrixPanel place={selected} onAsk={askEntityAssistant} onContact={openContactForm} />
                      </motion.div>
                    ) : isSpringCondominiums(selected) ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                        <SpringCondominiumsDestinationPanel onAsk={askEntityAssistant} />
                      </motion.div>
                    ) : isProperty && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                        <LegendsMLSFactsSection place={selected} mode={urlState.mode} onSelect={selectPlace} />
                      </motion.div>
                    )}
                    {(isProperty || isFrostTowerPanel) && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.18 }}>
                        <BuildingLocalServicesRail place={selected} places={places} onSelect={selectPlace} />
                      </motion.div>
                    )}
                    {urlState.mode === "resident" && isHappyHourEntity(selected) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.18 }}>
                        <HappyHourDetails place={selected} savedIds={savedIds} onSave={() => toggleSaved(selected)} onUse={() => openResidentQrModal(selected, "use_perk", "happy_hour_details")} />
                      </motion.div>
                    )}
                    {isParking && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37, duration: 0.18 }}>
                        <ParkingBookingDetails place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    {isBurgerBarPanel && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39, duration: 0.18 }}>
                        <BurgerBarCongressDetails
                          place={selected}
                          places={places}
                          mode={urlState.mode}
                          savedIds={savedIds}
                          onSave={() => toggleSaved(selected)}
                          onSelect={selectPlace}
                        />
                      </motion.div>
                    )}
                    {isInKindDining && !isBurgerBarPanel && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39, duration: 0.18 }}>
                        <InKindDiningDetails
                          place={selected}
                          places={places}
                          mode={urlState.mode}
                          savedIds={savedIds}
                          onSave={() => toggleSaved(selected)}
                          onSelect={selectPlace}
                          answer={entityAnswer}
                          loading={entityAssistantLoading}
                          onAsk={askEntityAssistant}
                          onCloseAnswer={() => setEntityAnswer(null)}
                        />
                      </motion.div>
                    )}
                    {urlState.mode === "resident" && hasActivePerkData(selected) && !isCampaign && !isRental && !legendsResidentialContent && !isHappyHourEntity(selected) && !isParking && !isInKindDining && !isBatheEntity(selected) && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.18 }}>
                        <ResidentPerkDetails place={selected} savedIds={savedIds} onSave={() => toggleSaved(selected)} onUse={() => openResidentQrModal(selected, "use_perk", "resident_perk_details")} />
                      </motion.div>
                    )}
                    {(selected.raw?.isWaterlooPark || selected.isWaterlooPark) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.18 }}>
                        <WaterlooDetails place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    {!legendsResidentialContent && isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.18 }}>
                        <DaaTourDetails place={selected} places={places} onSelect={selectPlace} savedIds={savedIds} onSave={() => toggleSaved(selected)} />
                      </motion.div>
                    )}
                    {!legendsResidentialContent && isDaaStop && activeCollectionRoute?.stops?.length && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.18 }}>
                        <NearbyContext
                          place={selected}
                          places={places}
                          onSelect={selectPlace}
                          mode={urlState.mode}
                          route={activeCollectionRoute}
                          savedIds={savedIds}
                        />
                      </motion.div>
                    )}

                    {!legendsResidentialContent && !isDaaStop && !isInKindDining && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56, duration: 0.18 }}>
                        <NearbyContext
                          place={selected}
                          places={places}
                          onSelect={selectPlace}
                          mode={urlState.mode}
                          route={activeCollectionRoute}
                          savedIds={savedIds}
                        />
                      </motion.div>
                    )}

                    {!isRental && !legendsResidentialContent && !isInKindDining && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64, duration: 0.18 }}>
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

                    {!isDaaStop && !isInKindDining && !isBurgerBarPanel && !isHappyHourEntity(selected) && !hasActivePerkData(selected) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.92, duration: 0.18 }}>
                        <PeopleAlsoVisit place={selected} places={places} onSelect={selectPlace} mode={urlState.mode} />
                      </motion.div>
                    )}

                    {isProperty && legendsListing && (
                      <LegendsContactForm
                        formId={contactFormId}
                        listing={{
                          ...legendsListing,
                          fullAddress: `${legendsListing.address}, ${legendsListing.city}, ${legendsListing.state} ${legendsListing.zip}`,
                        }}
                      />
                    )}

                    {isProperty && !legendsListing && (
                      <form
                        id={contactFormId}
                        onSubmit={(event) => {
                          event.preventDefault();
                          setAgentFormSubmitted(true);
                        }}
                        className="dp-contact-continuation mt-8 md:mt-10"
                      >
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C8A96A]">Interested?</div>
                          <h3 className="mt-1 text-[16px] font-semibold text-[#0B1F33]">Interested in living here?</h3>
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
                              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Phone
                                <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70 md:h-10" placeholder="Phone number" />
                              </label>
                              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Move Timeline
                                <select required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70 md:h-10">
                                  <option>ASAP</option>
                                  <option>30-60 days</option>
                                  <option>60-90 days</option>
                                  <option>Just exploring</option>
                                </select>
                              </label>
                            </div>
                            <label className="mt-2 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                              Message optional
                              <textarea name="message" className="min-h-20 dp-soft-field rounded-[8px] bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#C8A96A]/70" defaultValue={`I would like more information about ${selected.name}.`} />
                            </label>
                            <button type="submit" className="dp-panel-action-text mt-5 inline-flex items-center gap-1.5">
                              Submit Interest
                              <Send className="h-3.5 w-3.5 text-[#C8A96A] md:h-4 md:w-4" />
                            </button>
                          </>
                        )}
                      </form>
                    )}
                  </motion.div>
                );
              })()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {residentQrModal && (
        <ResidentPerkRedemptionSheet
          data={residentQrModal}
          onBack={() => setResidentQrModal(null)}
          onClose={() => setResidentQrModal(null)}
        />
      )}

      <AboutDowntownPerksModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
