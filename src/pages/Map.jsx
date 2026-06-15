import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  CreditCard,
  CalendarDays,
  Clock,
  Dumbbell,
  Filter,
  Gift,
  Heart,
  Info,
  Landmark,
  MapPin,
  Moon,
  Music2,
  Navigation,
  ScanLine,
  Search,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Utensils,
  Wine,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import AboutDowntownPerksModal from "@/components/modals/AboutDowntownPerksModal";
import { useMapEntityData } from "@/hooks/useMapEntityData";
import { directionsUrl, campaignRoute, mapRoutes } from "../lib/map/mapActionRegistry";
import { resolveMapEntityAlias, resolveMapEntityFromCollection, resolvePropertyListingUrlId, resolvePropertyUrlEntityId } from "../lib/mapEntityAliases";
import { resolveEntityGallery, resolveEntityImage, resolveMapImage } from "../lib/map/entityImageResolver";
import { resolveEntityPin } from "../lib/map/entityPinResolver";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { fireWorkflow, getWorkflowProfileId, getWorkflowSessionId, postWorkflow } from "@/lib/backendWorkflows";
import { trackingEvents } from "@/lib/analytics/track";
import { legendsListingPlaces } from "@/data/legendsListings";
import { luxuryPresenceListings } from "@/data/luxuryPresenceInventory";
import { DAA_TOUR_STOP_COUNT, daaExplorerQuestions, getDaaTourStopById } from "@/data/daaArtParksTour";
import {
  DPParkingReservation,
  DPQuickActions,
  DPPricingRail,
  quickActionsByEntityType,
} from "@/components/downtown-perks/primitives";

const RAINEY_STREET_CENTER = [30.25855, -97.73835];
const AUSTIN_CENTER = RAINEY_STREET_CENTER;
const INITIAL_MAP_ZOOM = 16.5;
const MAP_PANEL_IMAGE_FALLBACK = "/images/imported/perks/republic-square.jpg";
const LEGENDS_BRAND_LINE = "Legends Real Estate";
const FILTERS = [
  "All",
  "Saved",
  "Perks",
  "Places",
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
  "Listings",
  "Venues",
  "Hotels",
  "Parking",
  "Brands",
  "Events",
  "Live Music",
  "Culture",
  "Walking",
  "Family",
  "Fitness",
  "Grocery",
  "Transit",
  "EV Charging",
  "Food Trucks",
  "Markets",
  "Public Art",
  "Civic",
  "Services",
  "Local Guide",
];

const MAP_NATIVE_PARTNER_PANELS = ["campaigns", "activity", "reports", "info", "civic"];

const DISCOVER_FEATURED_ORDER = [
  "priority-the-waterline",
  "priority-the-paseo",
  "priority-the-independent",
  "priority-70-rainey",
  "priority-the-shore",
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
  inKind: ["inkind", "in kind", "dining credit", "restaurant credit"],
  Properties: ["property", "residential", "apartment", "condo", "tower", "listing", "building"],
  Venues: ["venue", "bar", "restaurant", "coffee", "dining", "nightlife", "retail", "store"],
  Hotels: ["hotel", "hospitality", "stay", "guest"],
  Parking: ["parking", "garage", "reservable parking", "resident rate"],
  Brands: ["brand", "sponsor", "rivian", "yeti", "ariat", "lululemon", "equinox", "legends real estate"],
  Events: ["event", "activation", "music", "show", "festival", "rsvp"],
  "Live Music": ["live music", "concert", "moody amphitheater", "show"],
  Culture: ["culture", "entertainment", "library", "city hall", "history", "museum"],
  Walking: ["walking", "walk", "trail", "waller creek"],
  Family: ["family", "pavilion", "children", "play"],
  Fitness: ["fitness", "wellness", "yoga", "running"],
  Grocery: ["grocery", "pharmacy", "market", "essentials", "convenience"],
  Transit: ["transit", "metro", "mobility"],
  "EV Charging": ["ev charging", "ev_charging"],
  "Food Trucks": ["food truck", "food trucks"],
  Markets: ["market", "markets", "shopping"],
  "Public Art": ["public art", "art installation", "arts"],
  Civic: ["civic", "public", "district", "city"],
  Services: ["service", "concierge", "mobility", "parking"],
  Nightlife: ["nightlife", "bar", "cocktail", "music", "late night"],
  "Arts & Culture": ["art", "arts", "culture", "museum", "gallery", "historic", "daa", "tour"],
  Walkable: ["walk", "walking", "walkable", "nearby", "trail"],
  Trending: ["trending", "popular", "saved", "active", "demand"],
  Nearby: ["nearby", "walkable", "around the corner", "downtown"],
  Performance: ["performance", "report", "analytics", "insight", "scan", "save", "redemption"],
  Opportunity: ["opportunity", "coverage", "campaign", "activation", "launch"],
  Coverage: ["coverage", "gap", "visibility", "low coverage"],
  Audience: ["audience", "resident", "guest", "movement", "engagement"],
  Residents: ["resident", "building", "property", "home", "apartment"],
  Surveys: ["survey", "question", "feedback", "response"],
  Broadcasts: ["broadcast", "announcement", "visibility", "placement"],
  Activations: ["activation", "campaign", "event", "placement"],
  "Local Guide": ["guide", "local", "downtown", "austin"],
  Visibility: ["venue", "bar", "restaurant", "coffee", "hotel", "property", "brand", "event", "perk"],
  Campaigns: ["campaign", "offer", "perk", "brand", "event", "property", "hotel"],
  Reports: ["venue", "bar", "restaurant", "coffee", "hotel", "property", "brand", "event", "perk"],
  Listings: ["listing", "legends", "mls", "for rent", "for sale"],
  Legends: ["legends", "legends real estate", "legends listing", "mls", "for rent", "for sale"],
};

const RESIDENT_ASK_PROMPTS = [
  "Coffee nearby",
  "What is happening tonight?",
  "Happy hour nearby",
  "Where can I use InKind?",
  "Live music this week",
  "Where should we go?",
];

const PARTNER_ASK_PROMPTS = [
  "What are people saving?",
  "Which perk is working best?",
  "Where are residents spending time?",
  "What should I share next?",
  "Which building is busiest nearby?",
  "Show me InKind restaurants nearby",
  "What are people saving nearby?",
  "Which events are people watching?",
  "What is trending downtown?",
];

const PARTNER_CONTEXT_PROMPTS = {
  Properties: [
    "Which amenities are residents using?",
    "What are residents looking for?",
    "Which perks are getting saved?",
    "What should we share next month?",
  ],
  Hotels: [
    "What are guests interested in?",
    "What nearby perks are popular?",
    "Which nearby stops are guests saving?",
  ],
  Venues: [
    "What brought people in?",
    "Which event got the most interest?",
    "What should we run next?",
  ],
  inKind: [
    "Where can people use InKind?",
    "Which dining partners are nearby?",
    "What dinner moments should we promote?",
  ],
  Brands: [
    "Where should we show up?",
    "Which districts are busy?",
    "Who is responding?",
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
  "Who do you want to meet?",
  "Search downtown...",
  "What is happening nearby?",
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
  { label: "Perks", filter: "Perks" },
  { label: "Events", filter: "Events" },
  { label: "Food", filter: "Dining" },
  { label: "Coffee", filter: "Coffee" },
  { label: "Drinks", filter: "Drinks" },
  { label: "Fitness", filter: "Fitness" },
  { label: "Wellness", filter: "Wellness" },
  { label: "Nightlife", filter: "Nightlife" },
  { label: "Arts", filter: "Arts & Culture" },
  { label: "Retail", filter: "Retail" },
  { label: "Services", filter: "Services" },
  { label: "Properties", filter: "Properties" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Civic", filter: "Civic" },
  { label: "Live Music", filter: "Live Music" },
  { label: "Happy Hour", filter: "Happy Hour" },
  { label: "Walkable", filter: "Walkable" },
  { label: "Trending", filter: "Trending" },
  { label: "Saved", filter: "Saved" },
  { label: "Open Now", filter: "Open Now" },
  { label: "Tonight", filter: "Tonight" },
  { label: "This Week", filter: "This Week" },
  { label: "Nearby", filter: "Nearby" },
  { label: "inKind", filter: "inKind" },
  { label: "Legends", filter: "Legends" },
];

const PARTNER_SEARCH_FILTERS = [
  { label: "All", filter: "All" },
  { label: "Performance", filter: "Performance" },
  { label: "Opportunity", filter: "Opportunity" },
  { label: "Coverage", filter: "Coverage" },
  { label: "Audience", filter: "Audience" },
  { label: "Campaigns", filter: "Campaigns" },
  { label: "Residents", filter: "Residents" },
  { label: "Properties", filter: "Properties" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Venues", filter: "Venues" },
  { label: "Brands", filter: "Brands" },
  { label: "Civic", filter: "Civic" },
  { label: "Events", filter: "Events" },
  { label: "Offers", filter: "Perks" },
  { label: "Surveys", filter: "Surveys" },
  { label: "Activity", filter: "Visibility" },
  { label: "Reports", filter: "Reports" },
  { label: "Broadcasts", filter: "Broadcasts" },
  { label: "Activations", filter: "Activations" },
  { label: "Scans", filter: "Scans" },
  { label: "Saves", filter: "Saves" },
  { label: "RSVPs", filter: "Events" },
  { label: "Redemptions", filter: "Redemptions" },
  { label: "Opportunities", filter: "Opportunities" },
  { label: "Coverage", filter: "Coverage" },
  { label: "Legends", filter: "Legends" },
];

const RESIDENT_ADVANCED_SEARCH_FILTERS = [
  { label: "Coffee", filter: "Coffee" },
  { label: "Drinks", filter: "Cocktails" },
  { label: "Fitness", filter: "Fitness" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Places to Live", filter: "Properties" },
  { label: "Services", filter: "Services" },
  { label: "Saved", filter: "Saved" },
];

const PARTNER_ADVANCED_SEARCH_FILTERS = [
  { label: "Properties", filter: "Properties" },
  { label: "Venues", filter: "Venues" },
  { label: "Hotels", filter: "Hotels" },
  { label: "Brands", filter: "Brands" },
  { label: "Civic", filter: "Civic" },
  { label: "Services", filter: "Services" },
  { label: "inKind", filter: "inKind" },
  { label: "Listings", filter: "Listings" },
];

const RESIDENT_PROMPTS = [
  "Coffee",
  "Dinner",
  "Drinks",
  "Fitness",
  "Events",
  "Perks",
  "inKind",
];

const PARTNER_PROMPTS = [
  "Activity",
  "Campaigns",
  "Events",
  "Perks",
  "inKind",
  "Properties",
  "Trends",
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
  { id: "wellness", label: "Wellness", prompt: "Wellness nearby", icon: Heart },
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
  { id: "5-min", label: "5 min walk" },
  { id: "10-min", label: "10 min walk" },
  { id: "nearby", label: "Nearby" },
];

const RESIDENT_CONSOLE_PROMPTS = [
  "Find somewhere for dinner tonight",
  "Show me events within 10 minutes",
  "What perks can I use right now?",
  "Show me rooftop spots nearby",
];

const RESIDENT_CONSOLE_FILTER_RAIL = [
  { id: "nearby", label: "Nearby", icon: Navigation, kind: "prompt", prompt: "What’s worth walking to tonight?" },
  { id: "saving", label: "Worth saving", icon: Star, kind: "filter", filter: "Saved", prompt: "Worth saving nearby" },
  { id: "open", label: "Open now", icon: Clock, kind: "filter", filter: "Open Now", prompt: "Open now nearby" },
  { id: "walk", label: "Easy walk", icon: MapPin, kind: "radius", radius: "5 min walk", prompt: "Easy walk nearby" },
  { id: "tonight", label: "Tonight", icon: CalendarDays, kind: "time", time: "tonight", prompt: "What’s worth walking to tonight?" },
  { id: "more", label: "More", icon: Filter, kind: "prompt", prompt: "Where should we go?" },
];

const RESIDENT_DEFAULT_DISCOVERY_CARDS = [
  { label: "Dinner Nearby", prompt: "Dinner nearby", helper: "Places worth walking to tonight." },
  { label: "Live Music Tonight", prompt: "Live music tonight", helper: "A few things happening close by." },
  { label: "Coffee Tomorrow Morning", prompt: "Coffee tomorrow morning", helper: "Easy stops near where you are." },
  { label: "Walkable Happy Hours", prompt: "Walkable happy hours", helper: "Drinks and bites without a long ride." },
  { label: "Events This Week", prompt: "Events this week", helper: "Good reasons to make a plan." },
];

const PARTNER_PLACEHOLDERS = [
  "Dinner intent nearby",
  "After-work activity",
  "Residents saving offers",
  "Campaign opportunities",
  "Properties near Rainey",
  "Hotels with guest traffic",
  "Venues trending tonight",
  "Where should we place an offer?",
];

const SEARCH_RADIUS_OPTIONS = ["400m", "800m", "1 mile", "5 min walk", "10 min walk", "15 min walk"];
const RESIDENT_TIME_FILTERS = ["Now", "Tonight", "Tomorrow", "This Weekend", "This Week"];
const PARTNER_TIME_FILTERS = ["Today", "After Work", "This Week", "Weekend", "Last 7 Days", "Last 30 Days"];
const RESIDENT_INTENT_FILTERS = ["Eat", "Drink", "Work", "Move", "Shop", "Relax", "Meet", "Live", "Explore", "DAA Art Walk", "InKind", "Legends", "Public Art", "Live Music"];
const PARTNER_INTENT_FILTERS = ["Visibility", "Offer", "Campaign", "Scan", "Save", "RSVP", "Redemption", "Resident Movement", "Guest Movement", "Placement Opportunity", "DAA Activation", "InKind Activity", "Legends Demand", "Coverage Gap"];
const ENTITY_TYPE_FILTERS = ["Venue", "Property", "Hotel", "Brand", "Civic", "Event", "Perk", "Service", "Listing"];

const MAP_INTENT_RULES = [
  { intent: "DAA_art_walk", filter: "Civic", entityType: "Civic", tokens: ["daa", "art walk", "art and parks", "parks tour", "public art", "civic tour", "historic stops", "historic markers", "cultural landmarks"] },
  { intent: "InKind", filter: "inKind", entityType: "Venue", tokens: ["inkind", "in kind", "dining benefits", "dining perks", "restaurants with perks"] },
  { intent: "Legends", filter: "Legends", entityType: "Listing", tokens: ["legends", "legends listings", "available homes", "condos", "apartments", "live here", "properties near me"] },
  { intent: "coffee", filter: "Coffee", entityType: "Venue", tokens: ["coffee", "cafe", "espresso", "morning coffee"] },
  { intent: "dining", filter: "Dining", entityType: "Venue", tokens: ["dinner", "lunch", "brunch", "food", "restaurant", "tacos", "date night", "eat"] },
  { intent: "drinks", filter: "Drinks", entityType: "Venue", tokens: ["drinks", "cocktails", "wine bar", "bar", "rooftop before sunset"] },
  { intent: "happy_hour", filter: "Happy Hour", entityType: "Perk", timeContext: "Tonight", tokens: ["happy hour", "after work", "drink specials"] },
  { intent: "nightlife", filter: "Nightlife", entityType: "Venue", tokens: ["nightlife", "honky tonk", "late night", "dance"] },
  { intent: "events", filter: "Events", entityType: "Event", tokens: ["events", "things to do", "what is happening", "happening nearby"] },
  { intent: "live_music", filter: "Live Music", entityType: "Event", timeContext: "Tonight", tokens: ["live music", "concert", "show tonight", "music tonight"] },
  { intent: "fitness", filter: "Fitness", entityType: "Venue", tokens: ["fitness", "workout", "pilates", "gym", "yoga", "move"] },
  { intent: "wellness", filter: "Wellness", entityType: "Venue", tokens: ["wellness", "spa", "relax", "self care"] },
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
  const matched = MAP_INTENT_RULES.filter((rule) => rule.tokens.some((token) => normalized.includes(token)));
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
  if (!parsed.filters.length) return "";
  const preferred = mode === "partner"
    ? ["Opportunity", "Performance", "Coverage", "Campaigns", "Properties", "Hotels", "Venues", "Brands", "Civic", "Events", "Perks", "inKind", "Legends", "Listings"]
    : ["Perks", "Events", "Happy Hour", "Live Music", "Coffee", "Dining", "Drinks", "Fitness", "Wellness", "inKind", "Legends", "Listings", "Properties", "Hotels", "Civic", "Nearby"];
  return preferred.find((item) => parsed.filters.includes(item)) || parsed.filters[0] || "";
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
const DEMO_CARD_CODE = "DP-DEMO-78701";
const PERKS_CARD_QR_SRC = "/images/card/perks-card-qr.png";

if (typeof window !== "undefined" && !window.__dpMapPinDelegatedListener) {
  window.__dpMapPinDelegatedListener = true;
  const openMapPinFromDom = (event) => {
    const pin = event.target?.closest?.(".dp-live-pin[data-entity-id]");
    if (!pin) return;
    const entityId = pin.getAttribute("data-entity-id");
    if (!entityId) return;
    event.preventDefault();
    event.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set("entityId", entityId);
    window.history.pushState({}, "", url);
    window.dispatchEvent(typeof PopStateEvent === "function" ? new PopStateEvent("popstate") : new Event("popstate"));
  };
  document.addEventListener("click", openMapPinFromDom, true);
  document.addEventListener("pointerup", openMapPinFromDom, true);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    openMapPinFromDom(event);
  }, true);
}

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

function isListingEntity(place) {
  const text = placeCoreText(place);
  return Boolean(
    getLegendsListing(place) ||
    getLuxuryPresenceBuilding(place)?.listings?.length ||
    text.includes("listing") ||
    text.includes("mls") ||
    text.includes("for rent") ||
    text.includes("for sale"),
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
  return coreMatches(place, FILTER_MATCHERS.Services) || String(place.type || "").toLowerCase() === "service";
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

function matchesFilter(place, activeFilter, savedIds) {
  if (activeFilter === "All") return true;
  if (["Open Now", "Tonight", "This Week", "Scans", "Saves", "Redemptions", "Opportunities", "Performance", "Opportunity", "Coverage", "Audience", "Surveys", "Broadcasts", "Activations"].includes(activeFilter)) return true;
  if (activeFilter === "Saved") return savedIds.has(place.id);
  if (activeFilter === "Perks") return hasActivePerkData(place) || isParkingEntity(place);
  if (activeFilter === "Places") {
    return (
      isVenueEntity(place) ||
      isHotelEntity(place) ||
      isServiceEntity(place) ||
      ["Dining", "Drinks", "Coffee", "Fitness", "Retail", "Grocery", "Culture", "Live Music"].includes(place.category)
    );
  }
  if (activeFilter === "Happy Hours" || activeFilter === "Happy Hour") return isHappyHourEntity(place);
  if (activeFilter === "Happy Hour Now") return isHappyHourEntity(place) && Boolean(place.isLiveNow);
  if (activeFilter === "Happy Hour Today") return isHappyHourEntity(place) && Boolean(place.happyHour?.days);
  if (activeFilter === "Properties") return isPropertyEntity(place);
  if (activeFilter === "Listings") return isListingEntity(place);
  if (activeFilter === "Legends") return isLegendsMapPlace(place) || Boolean(getLegendsListing(place)) || isListingEntity(place) || isPropertyEntity(place);
  if (activeFilter === "inKind") return isInKindEntity(place);
  if (activeFilter === "Hotels") return isHotelEntity(place);
  if (activeFilter === "Brands") return isBrandEntity(place);
  if (activeFilter === "Venues") return isVenueEntity(place);
  if (activeFilter === "Events") return isEventEntity(place);
  if (activeFilter === "Civic") return isCivicEntity(place);
  if (activeFilter === "Parking") return isParkingEntity(place);
  if (activeFilter === "Services") return isServiceEntity(place);
  const tokens = FILTER_MATCHERS[activeFilter] || [];
  const text = placeText(place);
  return tokens.some((token) => text.includes(token.toLowerCase()));
}

function buildMapAnswer(query, results, mode, district, activeFilter) {
  const cleanQuery = query.trim();
  const scope = isAllNeighborhoodScope(district) ? "downtown" : district;
  const topResults = results.slice(0, 3);
  const categoryHint = activeFilter === "All" ? "places" : activeFilter.toLowerCase();

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
  const bestName = best?.name || "the first nearby option";
  const bestDistrict = best?.district || scope;
  const why =
    mode === "partner"
      ? `${bestName} is the cleanest starting point for ${categoryHint} because it connects nearby activity, audience fit, and a clear next action in ${bestDistrict}.`
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

  if (!topResults.length) return base;

  if (audience === "partner") {
    const focus = activeFilter === "All" ? "activity" : activeFilter.toLowerCase();
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the most useful ${focus} read in ${scope}. It gives the clearest signal for what people nearby are doing and what you should change next.${alternatives.length ? ` Compare it with ${alternatives.join(" and ")}.` : ""}`,
      picks: topResults,
      actions: ["open-nearby", "save"],
    };
  }

  if (promptIntent === "go") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the easiest place to start if you want a plan that works nearby. It keeps the decision close to ${scope}.${alternatives.length ? ` ${alternatives[0]} is the better backup if the first stop does not fit.` : ""}`,
      picks: topResults,
      actions: ["open-nearby", "save"],
    };
  }

  if (promptIntent === "see") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} is the clearest thing to look at first in ${scope}. It gives you context without turning the map into a result dump.${alternatives.length ? ` ${alternatives.join(" and ")} are useful alternatives.` : ""}`,
      picks: topResults,
      actions: ["open-nearby", "save"],
    };
  }

  if (promptIntent === "do") {
    return {
      title: `Start with ${best.name}.`,
      body: `${best.name} gives you the simplest next move in ${scope}. Open it, save it, or compare the nearby options before you leave the map.`,
      picks: topResults,
      actions: ["open-nearby", "save"],
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
  MAP_INTENT_RULES.forEach((rule) => {
    if (rule.tokens.some((token) => q.includes(token))) {
      add([rule.intent, rule.filter, rule.entityType, ...rule.tokens].filter(Boolean).map((item) => String(item).toLowerCase().replace(/_/g, " ")));
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

function mapPinButtonHtml({ place, pin, ariaLabel, selected, pulsing, classes }) {
  const escapedId = escapeHtmlAttribute(place.id);
  const escapedLabel = escapeHtmlAttribute(ariaLabel);
  const pinLabel = escapeHtmlAttribute(pin.label);
  const kind = escapeHtmlAttribute(getMarkerDataKind(place));
  const activeClass = selected ? "is-selected is-active" : "";
  const pulseClass = "";

  return `<button type="button" class="dp-live-pin ${classes} ${activeClass} ${pulseClass}" data-entity-id="${escapedId}" data-kind="${kind}" data-pin-label="${pinLabel}" aria-label="${escapedLabel}" data-active="${selected ? "true" : "false"}"><span class="dp-live-pin__halo" aria-hidden="true"></span><span class="dp-live-pin__core">${pin.glyph}</span></button>`;
}

function getMarkerDataKind(place) {
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

function pinIcon(place, selected, pulsing = false) {
  const pin = resolveEntityPin(place);
  const isEventPin = isEventEntity(place);
  const isHappyHourPin = isHappyHourEntity(place);
  const legendsListing = getLegendsListing(place);
  const isLegendsPin = isLegendsMapPlace(place);
  const eventPinClass = isEventPin ? "dp-live-pin--event" : "";
  const happyHourPinClass = isHappyHourPin ? "dp-live-pin--happy-hour" : "";
  const legendsPinClass = isLegendsPin ? "dp-live-pin--legends" : "";
  const inKindPinClass = isInKindEntity(place) ? "dp-live-pin--inkind" : "";
  const shouldPulse = false;
  const iconSize = [30, 30];
  const iconAnchor = [15, 15];
  const ariaLabel = legendsListing ? `Legends listing at ${legendsListing.address}` : `${place.name} details`;
  return L.divIcon({
    className: "dp-leaflet-pin",
    html: mapPinButtonHtml({
      place,
      pin,
      ariaLabel,
      selected,
      pulsing: shouldPulse,
      classes: `${eventPinClass} ${happyHourPinClass} ${legendsPinClass} ${inKindPinClass}`,
    }),
    iconSize,
    iconAnchor,
    popupAnchor: [0, -12],
  });
}

function clusterIcon(count) {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 2;
  const size = safeCount > 99 ? 40 : safeCount > 9 ? 36 : 32;
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

function ResidentPassIdentity({
  savedPlaces,
  perkPlaces,
  eventRsvps,
  passPresented,
  walletAdded,
  onOpenSaved,
  onOpenPerks,
  onOpenRsvps,
  onOpenPass,
}) {
  const savedList = savedPlaces.length ? savedPlaces : perkPlaces.slice(0, 3);
  const perkList = perkPlaces.length ? perkPlaces : savedPlaces.slice(0, 3);
  const preferredDistricts = Array.from(new Set([...savedList, ...perkList].map((place) => place.district).filter(Boolean))).slice(0, 3);
  const usefulNearby = savedList.slice(0, 4);
  const nearbyBenefits = [
    { label: "Dining", example: perkList.find((place) => getDestinationKind(place) === "dining")?.name || "ATX Cocina" },
    { label: "Coffee", example: perkList.find((place) => getDestinationKind(place) === "coffee")?.name || "Sugarwolf Bakery" },
    { label: "Hotels", example: perkList.find((place) => getDestinationKind(place) === "hotel")?.name || "Hotel Van Zandt" },
    { label: "Wellness", example: perkList.find((place) => /wellness|fitness|spa/i.test(placeText(place)))?.name || "Fitness nearby" },
    { label: "Retail", example: perkList.find((place) => getDestinationKind(place) === "retail")?.name || "Fine Eyewear" },
  ];
  const activePerks = perkList.slice(0, 5);
  const eventRsvpPlaces = eventRsvps.filter((place) => place && typeof place === "object");
  const eventSuggestions = eventRsvpPlaces.length ? eventRsvpPlaces.slice(0, 4) : perkPlaces.filter((place) => getDestinationKind(place) === "event").slice(0, 4);
  const renderPlaceRail = (places, emptyLabel, action = onOpenPerks) => (
    <div className="dp-pass-image-rail">
      {(places.length ? places : [{ id: "empty-pass-place", name: emptyLabel, category: "Downtown guide", district: "Nearby", image: resolveMapImage({ category: "Downtown guide" }, "card") }]).map((place) => {
        const perk = getResidentPerkDetails(place);
        const image = resolveEntityImage(place, "card");
        return (
          <button key={place.id} type="button" className="dp-pass-image-card" onClick={action}>
            <img src={image} alt={place.name || "Downtown place"} onError={handlePanelImageError} />
            <span>
              <strong>{place.name || emptyLabel}</strong>
              <em>{place.category || "Nearby place"}</em>
              <small>{perk.offer || place.district || "Useful nearby"}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
  const downtownSections = [
    { context: "Saved Places", story: savedPlaces.length ? "The places you already wanted to remember." : "Start with a few places worth coming back to.", action: "Open saved", onClick: onOpenSaved },
    { context: "Upcoming Plans", story: eventRsvps.length ? "Events and nights out already on your radar." : "Find something worth saying yes to.", action: "See plans", onClick: onOpenRsvps },
    { context: "Active Perks", story: perkPlaces.length ? "Offers nearby when the plan changes." : "Local perks appear as you explore downtown.", action: "View perks", onClick: onOpenPerks },
    { context: "Quick Access", story: passPresented ? "Your access is ready when a partner asks." : walletAdded ? "Wallet access is ready for the next stop." : "Keep the QR close for perks and check-ins.", action: "Show QR", onClick: onOpenPass },
  ];

  return (
    <div className="dp-resident-pass-editorial">
      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Resident Dashboard</div>
        <h3 className="dp-pass-section-title">Your downtown activity</h3>
        <p className="dp-pass-meaning">
          Your card keeps the places, perks, events, and nearby preferences you are most likely to use in one quick resident view.
        </p>
        <div className="dp-pass-metric-strip">
          <button type="button" onClick={onOpenSaved}>
            <span>Saved</span>
            <strong>{savedPlaces.length ? `${savedPlaces.length} saved` : "Start saving"}</strong>
          </button>
          <button type="button" onClick={onOpenPerks}>
            <span>Perks</span>
            <strong>{perkPlaces.length ? `${perkPlaces.length} active` : "12 active"}</strong>
          </button>
          <button type="button" onClick={onOpenRsvps}>
            <span>RSVPs</span>
            <strong>{eventRsvps.length ? `${eventRsvps.length} saved` : "Find events"}</strong>
          </button>
          <button type="button" onClick={onOpenPass}>
            <span>Pass</span>
            <strong>{passPresented ? "Ready to scan" : "Tap to present"}</strong>
          </button>
        </div>
      </section>

      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Saved and Useful Nearby</div>
        <h3 className="dp-pass-section-title">Nearby places</h3>
        {renderPlaceRail(usefulNearby, "Find a nearby place worth remembering.", onOpenPerks)}
        <div className="dp-pass-identity-list">
          {downtownSections.map((item) => (
            <button key={item.context} type="button" onClick={item.onClick} className="dp-pass-editorial-row">
              <span>
                <span className="dp-pass-row-context">{item.context}</span>
                <span className="dp-pass-row-story">{item.story}</span>
              </span>
              <span className="dp-pass-row-action">{item.action} <ArrowRight className="h-3 w-3" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Preferences</div>
        <div className="dp-pass-preference-grid">
          <div>
            <span>Neighborhoods</span>
            <strong>{(preferredDistricts.length ? preferredDistricts : ["East Downtown", "Rainey", "Red River"]).join(" · ")}</strong>
          </div>
          <div>
            <span>Best next move</span>
            <strong>Open saved places. Show your card. RSVP to something nearby.</strong>
          </div>
          <div>
            <span>Resident signal</span>
            <strong>Dinner · Happy Hour · Events · Errands</strong>
          </div>
        </div>
        <div className="dp-pass-text-stack" aria-label="Resident preferences">
          {(preferredDistricts.length ? preferredDistricts : ["Congress", "2nd Street", "East Downtown"]).map((district) => (
            <span key={district}>{district}</span>
          ))}
          <span>Dinner</span>
          <span>Events</span>
          <span>Happy Hour</span>
        </div>
      </section>

      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Where your card works</div>
        <div className="dp-pass-benefit-grid">
          {nearbyBenefits.map((benefit) => (
            <button key={benefit.label} type="button" onClick={onOpenPerks}>
              <span>{benefit.label}</span>
              <strong>{benefit.example}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Perks available now</div>
        {renderPlaceRail(activePerks, "Nearby perks", onOpenPerks)}
      </section>

      <section className="dp-pass-editorial-section">
        <div className="dp-pass-context">Events you may like</div>
        {renderPlaceRail(eventSuggestions, "Find events nearby", onOpenRsvps)}
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
  if (!place) return false;
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
  );
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
      terms: "Save it to your Downtown Access and redeem when the inKind offer is active.",
    };
  }

  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) {
    return {
      title: "Free Size Upgrade",
      value: "Resident coffee upgrade",
      description: `${name} is a good nearby coffee move for quick mornings, casual meetings, or a short walk through ${district}.`,
      terms: "Save the offer and ask for it when it is active.",
    };
  }

  if (text.includes("pizza")) {
    return {
      title: "Resident Pizza Offer",
      value: "Easy dinner option",
      description: `${name} works well for a quick dinner, group plan, or late decision near ${district}.`,
      terms: "Save the offer and ask for it when it is active.",
    };
  }

  if (text.includes("grocery") || text.includes("market") || text.includes("pantry")) {
    return {
      title: "Grocery Discount",
      value: "Resident shopping value",
      description: `${name} is a useful local grocery stop for coffee, snacks, pantry basics, wine, and quick downtown errands around ${district}.`,
      terms: "Save the offer and use it when a resident discount is active.",
    };
  }

  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("pub")) {
    return {
      title: "Resident Cocktail Pricing",
      value: "Easy after-hours option",
      description: `${name} is a nearby option for drinks, music, or an after-dinner plan around ${district}.`,
      terms: "Save the offer and ask for it when it is active.",
    };
  }

  if (text.includes("restaurant") || text.includes("dining") || text.includes("food") || text.includes("kitchen")) {
    return {
      title: "Complimentary Dessert",
      value: "Walkable dining option",
      description: `${name} is a useful nearby dining option when you want less searching and a clear next move in ${district}.`,
      terms: "Save the offer and ask for it when it is active.",
    };
  }

  if (text.includes("hotel") || text.includes("hospitality")) {
    return {
      title: "Preferred Resident Dining Access",
      value: "Local access context",
      description: `${name} can be useful for lounges, dining, stays, or guest plans near ${district}.`,
      terms: "Save it and check what resident access is available.",
    };
  }

  if (text.includes("event") || text.includes("music")) {
    return {
      title: "Priority Event Access",
      value: "Save or RSVP",
      description: `${name} is a nearby event to save when you are deciding what to do around ${district}.`,
      terms: "RSVP or save it when a resident offer is available. Timing may vary.",
    };
  }

  if (text.includes("retail") || text.includes("store") || text.includes("eyewear") || text.includes("shop")) {
    return {
      title: "Exclusive In-Store Offer",
      value: "Retail access nearby",
      description: `${name} is a nearby shopping or appointment stop residents can keep in mind around ${district}.`,
      terms: "Save the offer and ask for it when it is active.",
    };
  }

  return {
    title: "Resident Perk",
    value: "Save it or go now",
    description: `${name} is in the map so residents can quickly decide whether it fits the moment near ${district}.`,
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
    ? "Listings, tours, and neighborhood context."
    : destinationKind === "grocery"
      ? "Save the offer and use it when active."
    : perk.terms || "Save the offer and ask for it when active.";

  return (
    <section className="dp-destination-section dp-perk-module">
      <div className="dp-perk-module-copy text-left">
        <div className="dp-perk-module-meta">
          <Gift className="h-3.5 w-3.5 text-[#C8A96A]" />
          {sectionLabel}
        </div>
        <h3 className="dp-perk-module-title">
          {isProperty ? "Want to live here?" : formatResidentPerkHeading(perk.offer)}
        </h3>
        <p className="dp-perk-module-description">
          {useText}
        </p>
      </div>
    </section>
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

function getInKindActionUrl(place, type) {
  const raw = place?.raw || {};
  if (type === "menu") {
    return raw.menuUrl || raw.menu_url || place?.menuUrl || raw.website || raw.url || place?.website || directionsUrl(place);
  }
  if (type === "pay") {
    return raw.inkindUrl || raw.inkind_url || place?.inkindUrl || "https://app.inkind.com/";
  }
  return directionsUrl(place);
}

function InKindDiningDetails({ place, places = [], mode = "resident", savedIds, onSave, onSelect }) {
  if (!isInKindEntity(place)) return null;
  const perk = getResidentPerkDetails(place);
  const nearbyDining = getInKindNearbyDining(place, places);
  const cuisine = String(place?.category || place?.raw?.category || "Dining").split("/")[0].trim() || "Dining";
  const neighborhood = place?.district || place?.neighborhood || "Downtown Austin";
  const walkability = place?.raw?.walkability || place?.walkability || `Walkable from nearby downtown buildings and hotels.`;
  const overview = cleanDisplayCopy(place?.raw?.summary || place?.summary || place?.description) ||
    `${place?.name || "This restaurant"} gives residents and visitors a practical dining option when they are already nearby.`;
  const partnerSupport = mode === "partner"
    ? "Dining Visibility · Dining Engagement · Dining Participation"
    : "Participating dining partner";

  return (
    <div className="space-y-5">
      <DestinationSection title="Dining Overview" support={`${cuisine} · ${neighborhood}`}>
        <div className="space-y-3">
          <p className="text-[13px] leading-6 text-[#0B1F33]/72">{overview}</p>
          <p className="text-[12px] font-medium leading-5 text-[#0B1F33]/58">{walkability}</p>
        </div>
      </DestinationSection>

      <DestinationSection title="Why Go Here" support="InKind dining context">
        <p className="text-[13px] leading-6 text-[#0B1F33]/72">
          Good for dinner nearby, a date-night plan, business lunch, happy hour, or a group meal that can move from discovery to payment without leaving the downtown routine.
        </p>
      </DestinationSection>

      <DestinationSection title="InKind Benefits" support={partnerSupport}>
        <div className="dp-destination-chip-row">
          {["Use InKind Credit", "Pay with InKind", "Earn Rewards", "Participating Dining Partner"].map((item) => (
            <span key={item} className="dp-why-go-tag">{item}</span>
          ))}
        </div>
        {perk?.offer && (
          <div className="mt-3 border-t border-[rgba(11,31,51,.06)] pt-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8A96A]">Resident Perk Available</div>
            <p className="mt-1 text-[13px] leading-6 text-[#0B1F33]/72">{formatResidentPerkHeading(perk.offer)}</p>
          </div>
        )}
      </DestinationSection>

      <DestinationSection title="Dining Actions">
        <div className="dp-primary-action-row">
          <button type="button" className="dp-panel-action dp-primary-action" onClick={onSave}>
            {savedIds?.has?.(place.id) ? "Saved Restaurant" : "Save Restaurant"}
          </button>
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
            Directions
          </a>
        </div>
        <div className="dp-secondary-action-row">
          <a href={getInKindActionUrl(place, "menu")} target="_blank" rel="noreferrer" className="dp-panel-action-text">View Menu</a>
          <a href={getInKindActionUrl(place, "pay")} target="_blank" rel="noreferrer" className="dp-panel-action-text">Pay with InKind</a>
        </div>
      </DestinationSection>

      {nearbyDining.length > 0 && (
        <DestinationSection title="Other InKind Locations Nearby" support="Nearby Dining · You May Also Like">
          <div className="dp-card-rail dp-horizontal-entity-rail" aria-label="Nearby InKind dining">
            {nearbyDining.map((candidate) => (
              <button
                type="button"
                key={candidate.id}
                className="dp-related-place min-w-[180px] text-left"
                onClick={() => onSelect(candidate)}
              >
                <img src={getLifestyleImage(candidate, mode)} alt="" loading="lazy" />
                <span>{candidate.name}</span>
                <small>{candidate.district || "Downtown Austin"}</small>
              </button>
            ))}
          </div>
        </DestinationSection>
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
  if (kind === "parking" || isParkingEntity(place)) return "parking";
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
    return truncatePanelCopy(partnerCopy[kind] || partnerCopy.place, 90);
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
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding || getResolvedLegendsListing(place)) return ["Listings", "Tours", "Nearby perks", "Neighborhood context"];
  const byKind = {
    grocery: ["Coffee", "Breakfast", "Wine", "Quick Stop"],
    coffee: ["Coffee", "Breakfast", "Work Break", "Walkable"],
    nightlife: ["Drinks", "Patio", "Night Out", "Friends"],
    dining: ["Dinner", "Groups", "Walkable", "Perk"],
    hotel: ["Guests", "Lobby", "Dining", "Downtown Base"],
    property: ["Listings", "Tours", "Nearby perks", "Neighborhood context"],
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
  if (mode === "partner") {
    const kind = getDestinationKind(place);
    if (kind === "hotel") return ["Guest Activity", "Dining Nearby", "Event Traffic", "Create Guest Guide"];
    if (kind === "property") return ["Resident Activity", "Nearby Perks", "Building Opportunity", "Launch Campaign"];
    if (kind === "brand") return ["Audience Nearby", "Activation Window", "Event Activity", "Brand Opportunity"];
    if (kind === "dining" || kind === "nightlife" || kind === "coffee") return ["Audience Nearby", "Best Timing", "Launch Offer", "Similar Venues"];
    return ["Audience Nearby", "Best Timing", "Launch Offer", "Related Places"];
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

function getRailDedupeKey(item) {
  const source = item?.candidate || item?.place || item;
  const rawName = source?.name || source?.title || source?.label || item?.title || item?.label || item?.value || source;
  const name = normalizeRailDedupeText(rawName);
  if (!name) return "";
  if (/\bvia\s*313\b/.test(name) || /\bvia313\b/.test(name)) return "place:via-313";
  if (/\bbangers?\b/.test(name)) return "place:bangers";
  if (/\blustre\s+pearl\b/.test(name)) return "place:lustre-pearl";
  if (/\bhotel\s+van\s+zandt\b/.test(name)) return "place:hotel-van-zandt";
  return name;
}

function getRelatedPlaceDedupeKeys(item) {
  const source = item?.candidate || item?.place || item;
  if (!source) return [];
  const name = normalizeRailDedupeText(source.name || source.title || source.label || item?.title || item?.label || "");
  if (!name) return [];
  const address = normalizeRailDedupeText(source.address || source.raw?.address || "");
  const district = normalizeRailDedupeText(source.district || source.neighborhood || source.raw?.district || "");
  const keys = [];
  if (source.id) keys.push(`id:${source.id}`);
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
  const output = [];

  for (const item of items) {
    const key = getRailDedupeKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
    if (output.length >= limit) break;
  }

  return output;
}

function isRoyalBlueGroceryPlace(place) {
  return /\broyal\s+blue\s+grocery\b/i.test([place?.id, place?.name, place?.address, place?.raw?.name].filter(Boolean).join(" "));
}

function getNearbyAreaPlaces(place, places = [], limit = 4) {
  const originCoords = getPlaceCoords(place);
  if (!originCoords) return [];
  const scored = places
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
    .sort((a, b) => b.score - a.score);
  return dedupeRailItems(scored, place, limit);
}

function getNearbyKindLabel(candidate, candidateKind) {
  const text = placeText(candidate);
  if (candidateKind === "coffee") return "Coffee nearby";
  if (candidateKind === "grocery") return "Grocery nearby";
  if (candidateKind === "hotel") return "Hotel nearby";
  if (candidateKind === "event") return "Event nearby";
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

function getNearbyContextItems(place, places = []) {
  const district = String(place?.district || "Downtown Austin").replace(/\s+District$/i, "");
  const kind = getDestinationKind(place);
  const raw = place?.raw || {};
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
      { label: "Austin Proper Hotel", value: "Hotel nearby · 2nd Street" },
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
  return "Nearby Lifestyle";
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
    property: ["property"],
    place: ["place", "dining", "coffee", "retail"],
  };
  const allowedKinds = compatibleKinds[kind] || compatibleKinds.place;
  const related = places
    .filter((candidate) => candidate?.id !== place?.id)
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
  const image = getLifestyleImage(place, mode);
  const isProperty = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place));
  if (!isProperty) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="dp-panel-detail-hero"
      >
        <figure className="dp-destination-media">
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
        <header className="dp-panel-content dp-panel-detail-identity">
          <p className="dp-polished-panel-kicker dp-panel-kicker">{getPanelMetaLine(place)}</p>
          <h2 className="dp-panel-title">{place.name}</h2>
          <p className="dp-polished-panel-meta dp-panel-subtitle">{getDestinationLocationLine(place)}</p>
        </header>
      </motion.section>
    );
  }
  return (
    <motion.section
      initial={{ scale: 1.04 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="dp-polished-panel"
    >
      <figure className="dp-polished-panel-hero">
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
      <header className="dp-polished-panel-header dp-panel-content">
        <p className="dp-polished-panel-kicker dp-panel-kicker">{getPanelMetaLine(place)}</p>
        <h2 className="dp-panel-title">{place.name}</h2>
        <p className="dp-polished-panel-meta dp-panel-subtitle">{getDestinationLocationLine(place)}</p>
      </header>
    </motion.section>
  );
}

function getDestinationLocationLine(place) {
  const district = getDestinationDistrictLabel(place);
  const rawAddress = String(place?.address || place?.raw?.address || "").replace(/,\s*(Austin|TX|78701).*$/i, "").trim();
  if (rawAddress && !/downtown austin/i.test(rawAddress)) return `${rawAddress} · ${district}`;
  return district;
}

function PanelContext({ place, mode }) {
  const isProperty = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place));
  if (isProperty) {
    if (mode === "partner") {
      return (
        <DestinationSection title="What is happening nearby" className="dp-property-opening-section dp-property-narrative-section">
          <p className="dp-why-people-go">Residents, visitors, and nearby workers regularly move between this location and surrounding dining, retail, event, and wellness destinations.</p>
          <div className="dp-neighborhood-narrative" aria-label="Partner location intelligence">
            <p><strong>Why it matters</strong></p>
            <p>The strongest engagement opportunities happen when the next decision is only a short walk away.</p>
            <p><strong>Recommended action</strong></p>
            <p>Connect campaigns, perks, events, and offers to nearby activity rather than treating this as a standalone destination.</p>
          </div>
        </DestinationSection>
      );
    }
    return (
      <DestinationSection title="Why people choose this" className="dp-property-opening-section dp-property-narrative-section">
        <div className="dp-drawer-meta-line">Property · {place?.district || "Downtown Austin"}</div>
        <p className="dp-why-people-go">Residential property listing in Downtown Austin.</p>
        <div className="dp-neighborhood-narrative" aria-label="Neighborhood narrative">
          <p>More than a place to live.</p>
          <p>This building places residents close to the places that make downtown Austin feel connected.</p>
          <p>Coffee before work. A walk along the lake. Dinner without driving. Events without planning ahead.</p>
        </div>
      </DestinationSection>
    );
  }

  return (
    <DestinationSection title="Why people choose this" className="dp-property-opening-section dp-property-narrative-section">
      <p className="dp-why-people-go">{getPanelContextSentence(place, mode)}</p>
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
  const isPartnerProperty = mode === "partner" && getDestinationKind(place) === "property";
  const raw = place?.raw || {};
  const curatedItems = getCuratedArray(raw.residentValues || raw.resident_values || place?.residentValues);
  const kind = getDestinationKind(place);
  const byKind = {
    grocery: ["Quick essentials", "Coffee", "Wine", "Groceries", "Downtown errands"],
    coffee: ["Morning coffee", "Work nearby", "Quick stops", "Casual meetings", "Walkable errands"],
    nightlife: ["Cocktails", "Live music", "Happy hour", "Late night", "Groups"],
    dining: ["Lunch meetings", "Dinner plans", "Happy hour", "Groups", "Walkable plans"],
    hotel: ["Guest stays", "Dining nearby", "Lobby access", "Events nearby", "Walkable plans"],
    property: ["Walkability", "Downtown views", "Resident amenities", "Trail access", "Everyday convenience"],
    event: ["Tonight", "RSVP", "Groups", "Nearby plans", "Before or after dinner"],
    retail: ["Errands", "Shopping", "Services", "Quick stops", "Nearby residents"],
    civic: ["Public space", "Events", "Walks", "Community", "Nearby dining"],
    brand: ["Local launches", "Limited offers", "Resident access", "Events", "Downtown culture"],
    place: ["Useful nearby", "Walkable plans", "Local context", "Save for later", "Downtown routine"],
  };
  const partnerPropertyItems = ["Dining Activity", "Resident Movement", "Hotel Guests", "Event Traffic", "Repeat Visitors"];
  const items = (isPartnerProperty ? partnerPropertyItems : curatedItems.length ? curatedItems : byKind[kind] || byKind.place).slice(0, 7);
  if (!items.length) return null;
  return (
    <DestinationSection title={isPartnerProperty ? "Audience Context" : "Known For"}>
      {isPartnerProperty ? (
        <div className="dp-destination-chip-row">
          {items.map((item) => <span key={item} className="dp-why-go-tag">{item}</span>)}
        </div>
      ) : (
        <ul className="dp-known-for-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </DestinationSection>
  );
}

function NearbyContext({ place, places = [], onSelect, mode = "resident" }) {
  if (getDestinationKind(place) === "property") {
    return <PropertyNearbyRail place={place} places={places} onSelect={onSelect} mode={mode} />;
  }

  return (
    <DestinationSection title="Nearby" className="dp-nearby-section">
      <div className="dp-nearby-grid">
        {getNearbyContextItems(place, places).map((item, index) => {
          const normalized = normalizeContextItem(item);
          return (
            <button type="button" className="dp-nearby-item" key={`${normalized.label}-${normalized.value}-${index}`}>
              <span className="dp-nearby-title">{normalized.label || normalized.value}</span>
              {normalized.value && <span className="dp-nearby-meta">{normalized.value}</span>}
            </button>
          );
        })}
      </div>
    </DestinationSection>
  );
}

function getPropertyNearbyCards(place, places = [], mode = "resident") {
  const isPartner = mode === "partner";
  const district = String(place?.district || "").toLowerCase();
  const isRainey = district.includes("rainey");
  const isEastDowntown = district.includes("east");
  const preferredCards = [
    { title: "P6", image: "/images/imported/perks/rooftop-happy-hour.png", meta: isPartner ? "Strong evening activity · High dining overlap" : "Rooftop nearby · 5-minute walk", curated: true },
    { title: "YETI", image: "/images/imported/perks/yeti-store.png", meta: isPartner ? "Brand activation opportunity · Strong event audience overlap" : "Resident engraving offer · 6-minute walk", curated: true },
    { title: "Fine Eyewear", image: "/images/imported/perks/fine-eyewear.png", meta: isPartner ? "Retail crossover · Resident errand overlap" : "Shopping nearby · Styling offer", curated: true },
    { title: "Four Seasons", image: "/images/imported/perks/four-seasons-resi.jpg", meta: isPartner ? "Hotel guests nearby · Dining and spa overlap" : "Hotel nearby · Spa and dining access", curated: true },
    ...(isRainey
      ? [
          { title: "Via 313 Pizza", image: "/images/imported/perks/via313.jpg", meta: isPartner ? "Dining demand · Rainey dinner overlap" : "Dining nearby · Rainey", curated: true },
          { title: "The Stay Put", image: "/images/imported/perks/stayput.png", meta: isPartner ? "Drinks nearby · Strong after-work overlap" : "Drinks nearby · Rainey · 15% off Sunday-Thursday", curated: true },
        ]
      : []),
    ...(isEastDowntown
      ? [
          { title: "IHOP", image: "/images/imported/perks/places-nearby.png", meta: isPartner ? "Breakfast demand · East Downtown traffic" : "Dining nearby · East Downtown", curated: true },
          { title: "Bacalar", image: "/images/imported/perks/places-nearby.png", meta: isPartner ? "Dining demand · East Downtown crossover" : "Dining nearby · East Downtown", curated: true },
        ]
      : []),
  ];
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
  const nearby = getNearbyAreaPlaces(place, places, 5).map((item) => item.candidate);
  const cards = dedupeRailItems([...preferred, ...nearby], place)
    .filter((item) => {
      const candidate = item?.place ? item.place : item;
      if (item?.curated) return true;
      return !candidate || getDestinationKind(candidate) !== "property";
    })
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

  const seenImages = new Set();
  return cards.filter((card) => {
    const imageKey = String(card?.image || "").toLowerCase().split("?")[0];
    if (!imageKey) return true;
    if (seenImages.has(imageKey)) return false;
    seenImages.add(imageKey);
    return true;
  }).slice(0, 6);
}

function PropertyNearbyRail({ place, places = [], onSelect, mode = "resident" }) {
  const items = getPropertyNearbyCards(place, places, mode);
  if (!items.length) return null;
  const isPartner = mode === "partner";
  return (
    <DestinationSection
      title={isPartner ? "Nearby Activity" : "Nearby Lifestyle"}
      className="dp-property-nearby-section"
      support={isPartner ? "The destinations most often connected to this location through resident movement, event traffic, hotel stays, and discovery behavior." : "Places residents can walk to, save, visit, or use as part of their downtown routine."}
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
  if (itemKind === currentKind) return "Shared Audience · Similar timing";
  if (["dining", "nightlife", "coffee"].includes(itemKind)) return "Dining overlap · Resident crossover";
  if (itemKind === "hotel") return "Hotel guests · Walkable demand";
  if (itemKind === "brand") return "Brand opportunity · Event audience";
  if (itemKind === "event") return "Event traffic · Planning window";
  if (itemKind === "property") return "Resident movement · Nearby demand";
  return "Related audience · Nearby opportunity";
}

function PeopleAlsoVisit({ place, places, onSelect, mode = "resident" }) {
  const isPropertyLike = getResidentEntityKind(place) === "property" || Boolean(getResolvedLegendsListing(place) || getLuxuryPresenceBuilding(place));
  if (isPropertyLike) return null;
  const related = getRelatedPlaces(place, places);
  if (!related.length) return null;
  const title = mode === "partner" ? "Similar Audience" : "Similar Places";
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
    <DestinationSection title="Ask Downtown Perks" className="dp-entity-assistant">
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
            <button type="button" onClick={onClose} aria-label="Close">
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
  const offer = happyHour.offer || "Food and drink specials nearby";
  const details = happyHour.details || place.raw?.summary || "A nearby happy hour for residents looking for an easy place to start.";
  const redemption = happyHour.redemption || "Save it for later or get directions when you're ready.";

  return (
    <DestinationSection title="Happy Hour" className="dp-happy-hour-section">
      <p className="dp-destination-section-copy">{details}</p>
      <div className="dp-quiet-facts" aria-label={`${place.name} happy hour details`}>
        <div>
          <span>{days}</span>
          <strong>{time}</strong>
        </div>
        <div>
          <span>Offer</span>
          <strong>{offer}</strong>
        </div>
      </div>
      {redemption && <p className="dp-destination-section-note">{redemption}</p>}
    </DestinationSection>
  );
}

function ParkingBookingDetails({ place, mode }) {
  const item = getParkingBooking(place);
  if (!item) return null;

  const firstRate = item.timeSlots?.[0]?.perkPrice || item.timeSlots?.[0]?.price || item.pricingLabel || "Resident rate";
  const isPartner = mode === "partner";
  const parkingCampaigns = [
    {
      name: "Evening Parking Boost",
      audience: "Residents heading out",
      price: item.pricingLabel || firstRate,
      description: "Promote reservable parking when nearby plans start to form.",
      features: ["Resident rate", "Directions taps", "Reservation window"],
    },
    {
      name: "Event Parking Window",
      audience: "Event-goers nearby",
      price: "Custom",
      description: "Open limited spaces around concerts, dinners, and downtown events.",
      features: ["Timed release", "Resident interest", "Partner report"],
    },
  ];

  return (
    <DestinationSection title={isPartner ? "Parking options" : "Reserve parking"} className="dp-parking-detail-section">
      <p className="dp-destination-section-copy">
        {isPartner
          ? "Turn open parking into a resident perk and see when people are most likely to use it."
          : "Reserve nearby parking before you head out. Resident rate available."}
      </p>

      {isPartner && (
        <>
          <DPQuickActions actions={quickActionsByEntityType.parking} />
          <PanelInsightGrid
            columns="sm:grid-cols-3"
            items={[
              { label: "What is available", value: "Reservable parking windows tied to nearby plans.", emphasis: true },
              { label: "Why it matters", value: "Parking works best when dinner, events, and errands are already forming nearby." },
              { label: "Next move", value: "Use a clear resident rate and route people directly to the reservation flow.", emphasis: true },
            ]}
          />
        </>
      )}

      <DPParkingReservation item={item} mode={isPartner ? "partner" : "resident"} />

      {isPartner && <DPPricingRail title="Parking campaigns" items={parkingCampaigns} />}
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
            <Link to={`/map?mode=partner&tab=map&filter=Civic&entityId=${encodeURIComponent(stop.id)}`} className="dp-panel-action dp-primary-action">
              Check In & Share
            </Link>
            <button type="button" onClick={onSave} className="dp-panel-action">
              {isSaved ? "Saved For Later" : "Save For Later"}
            </button>
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
              Get Directions
            </a>
            <Link to="/map?mode=partner&tab=map&filter=Civic" className="dp-panel-action">
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
    ["Broker", "Legends Real Estate"],
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
      <DestinationSection title="Available Listings">
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
    <DestinationSection title="Available Listings">
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
      className="dp-contact-continuation mt-8 text-left md:mt-10"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitError("");
        setSubmitting(true);
        const form = new FormData(event.currentTarget);
        const listingPayload = {
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
            src="/pins/downtown-perks/legends-butterfly.png"
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

function LegendsPartnerListingDetails({ listing, place }) {
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
              src="/pins/downtown-perks/legends-butterfly.png"
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

      <PartnerMetricInsight place={place} />
    </>
  );
}

function PartnerDrawerActions({ place, onContact }) {
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
      <>
        <div className="dp-primary-action-row mt-3">
          <button type="button" onClick={viewListings} className="dp-panel-action dp-primary-action">View Listings →</button>
          <Link to={campaignRoute(place)} className="dp-panel-action">Create Property Plan →</Link>
        </div>
        <div className="dp-secondary-action-row">
          <button type="button" onClick={onContact} className="dp-panel-action-text">Contact →</button>
          <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action-text">View Reports →</Link>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="dp-primary-action-row mt-3">
        <Link to={campaignRoute(place)} className="dp-panel-action dp-primary-action">{getPartnerPrimaryActionLabel(place)} →</Link>
        <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action dp-panel-action-compact">View Reports →</Link>
      </div>
    </>
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
  const hasPerk = hasActivePerkData(selected);
  const contacts = getContactDetails(selected);
  const websiteContact = contacts.find((item) => item.kind === "website");
  const viewPerk = () => document.querySelector(".dp-destination-drawer .dp-perk-module, .dp-destination-drawer .dp-happy-hour-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
  const sharePlace = async () => {
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
          <button type="button" onClick={viewListings} className="dp-panel-action dp-primary-action">
            View Listings →
          </button>
          <button
            type="button"
            onClick={onContact}
            className="dp-panel-action"
            aria-expanded={agentFormPlaceId === selected.id}
          >
            Schedule Tour →
          </button>
        </div>
        <div className="dp-secondary-action-row">
          <button type="button" onClick={onContact} className="dp-panel-action-text">
            Contact Legends →
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="dp-primary-action-row">
      {isEvent ? (
        <button type="button" onClick={onRsvp} className="dp-panel-action dp-primary-action">
          {eventRsvps.some((item) => item.id === selected.id) ? "Saved RSVP" : "RSVP →"}
        </button>
      ) : hasPerk ? (
        <button type="button" onClick={viewPerk} className="dp-panel-action dp-primary-action">
          View Offer →
        </button>
      ) : (
        <button type="button" onClick={onSave} className="dp-panel-action dp-primary-action">
          {savedIds.has(selected.id) ? "Saved" : "Save →"}
        </button>
      )}
      {hasPerk && !isEvent && (
        <button type="button" onClick={onSave} className="dp-panel-action">
          {savedIds.has(selected.id) ? "Saved" : "Save →"}
        </button>
      )}
      {!isEvent && (
        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-panel-action">
          Get Directions →
        </a>
      )}
      <button type="button" onClick={sharePlace} className="dp-panel-action">
        Share →
      </button>
      {!isEvent && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action">
          {entityKind === "hotel" ? "Open →" : "Reserve / Open →"}
        </a>
      )}
      {isEvent && websiteContact && (
        <a href={websiteContact.href} target="_blank" rel="noreferrer" className="dp-panel-action">
          Add to Calendar →
        </a>
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
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  const luxuryListings = luxuryBuilding?.listings || [];
  const luxuryImage = luxuryBuilding?.panelImage || luxuryBuilding?.heroImage || luxuryBuilding?.buildingExterior || luxuryListings.find((listing) => listing?.heroImage)?.heroImage;
  if (luxuryImage) return luxuryImage;

  const directListing = getLegendsListing(place);
  if (directListing?.image) return directListing.image;
  if (place?.image && String(place.image).includes("/images/legends-listings/")) return place.image;
  if (place?.primaryImage && String(place.primaryImage).includes("/images/legends-listings/")) return place.primaryImage;
  if (place?.panelImage && String(place.panelImage).includes("/images/legends-listings/")) return place.panelImage;

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
    return { label: "View Hotels", href: "/map?mode=partner&tab=map&filter=Hotels" };
  }
  if (type === "brand" || category.includes("brand") || coreText.includes("legends real estate") || coreText.includes("yeti") || coreText.includes("rivian")) {
    return { label: "View Brand", href: "/map?mode=partner&tab=map&filter=Brands" };
  }
  return { label: "Explore Similar", href: mapRoutes.residentMap };
}

function getResidentEntityKind(place) {
  const text = placeCoreText(place);
  const category = String(place?.category || "").toLowerCase();
  const type = String(place?.type || "").toLowerCase();

  if (isParkingEntity(place)) {
    return "parking";
  }

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
          { label: "What is happening nearby", value: insights.intent },
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

function MapInteractionCollapse({ onCollapse }) {
  useMapEvents({
    dragstart: onCollapse,
  });

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
        maxZoom: 16.5,
        paddingTopLeft: [28, topPadding],
        paddingBottomRight: [28, bottomPadding],
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [map, activeKey, selectedId, places, enabled]);

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
      icon={clusterIcon(cluster.count)}
      eventHandlers={{
        click: expandCluster,
      }}
    />
  );
}

function PlaceMarker({ place, selected, pulsing, onSelect, onSelectNearestLegends, onHover, onHoverEnd }) {
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
      element.addEventListener("click", openPlace, true);
      element.addEventListener("pointerup", openPlace, true);
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
      icon={pinIcon(place, selected, pulsing)}
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
  resultCount,
  inputRef,
  onQueryChange,
  onSubmit,
  onClear,
  onIntentSelect,
  onFilterSelect,
  onTimeSelect,
  onRadiusSelect,
  onPromptSelect,
  onModeChange,
}) {
  const selectedIntent = RESIDENT_INTENT_CONSOLE_BUTTONS.find((item) => item.id === activeIntent);
  const selectedTime = RESIDENT_INTENT_TIME_BUTTONS.find((item) => item.id === activeTime);
  const summaryTitle = selectedIntent ? `${selectedIntent.label}${selectedTime ? ` ${selectedTime.label.toLowerCase()}` : " nearby"}` : "Nearby";

  return (
    <div className="dp-search-intent-console-wrap">
      <section
        className="dp-search-intent-console pointer-events-auto"
        aria-label="Resident search intent console"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="dp-search-intent-switch" role="tablist" aria-label="Map audience">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "resident"}
            className={mode === "resident" ? "is-active" : ""}
            onClick={() => onModeChange("resident")}
          >
            Residents
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "partner"}
            className={mode === "partner" ? "is-active" : ""}
            onClick={() => onModeChange("partner")}
          >
            Partners
          </button>
        </div>

        <form className="dp-search-intent-form" onSubmit={onSubmit}>
          <div className="dp-search-intent-label">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Ask the map</span>
          </div>
          <div className="dp-search-intent-input-row">
            <Search className="dp-search-intent-search-icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Ask the Map"
              placeholder={placeholder}
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

        <div className="dp-search-intent-prompt-rail" aria-label="Suggested searches">
          {RESIDENT_CONSOLE_PROMPTS.map((prompt) => (
            <button key={prompt} type="button" onClick={() => onPromptSelect(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="dp-search-intent-filter-rail" aria-label="Quick map filters">
          {RESIDENT_CONSOLE_FILTER_RAIL.map((item) => {
            const Icon = item.icon;
            const active = item.filter ? activeFilter === item.filter : item.time ? activeTime === item.time : item.radius ? activeRadius === item.radius : false;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? "is-active" : ""}
                aria-pressed={active}
                onClick={() => onFilterSelect(item)}
              >
                <Icon className="dp-search-intent-filter-icon" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="dp-search-intent-category-rail" aria-label="Categories">
          {RESIDENT_INTENT_CONSOLE_BUTTONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={activeIntent === item.id ? "is-active" : ""}
                aria-pressed={activeIntent === item.id}
                onClick={() => onIntentSelect(item)}
              >
                <Icon className="dp-search-intent-category-icon" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="dp-search-intent-mini-row" aria-live="polite">
          <span>{summaryTitle}</span>
          <strong>{resultCount || 0} places</strong>
          <div className="dp-search-intent-mini-controls" aria-label="Distance and time">
            {RESIDENT_INTENT_RADIUS_BUTTONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeRadius === item.label ? "is-active" : ""}
                aria-pressed={activeRadius === item.label}
                onClick={() => onRadiusSelect(item)}
              >
                {item.label}
              </button>
            ))}
            {RESIDENT_INTENT_TIME_BUTTONS.slice(0, 2).map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTime === item.id ? "is-active" : ""}
                aria-pressed={activeTime === item.id}
                onClick={() => onTimeSelect(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dp-search-intent-default-rail" aria-label="Quick ideas">
          {RESIDENT_DEFAULT_DISCOVERY_CARDS.map((item) => (
            <button key={item.label} type="button" onClick={() => onPromptSelect(item.prompt)}>
              {item.label}
            </button>
          ))}
        </div>
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
  const panelTab = MAP_NATIVE_PARTNER_PANELS.includes(rawTab) ? rawTab : "";
  const mode = searchParams.get("mode") === "partner" ? "partner" : searchParams.get("mode") === "resident" ? "resident" : pathMode;
  const tab = rawTab === "pass" ? "pass" : "map";
  const filter = searchParams.get("filter") || "All";
  const rawEntityId = searchParams.get("entityId") || "";
  const entityId = resolveMapEntityAlias(rawEntityId);
  const listingId = searchParams.get("listingId") || "";
  const prompt = sanitizeMapPrompt(searchParams.get("query") || searchParams.get("prompt") || searchParams.get("q") || "", mode);
  const radius = searchParams.get("radius") || "5 min walk";
  const district = searchParams.get("district") || ALL_NEIGHBORHOODS;
  const time = searchParams.get("time") || "";
  const intent = searchParams.get("intent") || "";
  const entityType = searchParams.get("entityType") || "";

  function update(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params, { replace: false });
  }

  return { mode, tab, panelTab, filter, rawEntityId, entityId, listingId, prompt, radius, district, time, intent, entityType, update };
}

export default function MapPage() {
  const navigate = useNavigate();
  const places = useMapEntityData();
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
  const [radius, setRadius] = useState(urlState.radius);
  const [residentSearchIntent, setResidentSearchIntent] = useState({
    intent: RESIDENT_INTENT_CONSOLE_BUTTONS.some((item) => item.id === urlState.intent) ? urlState.intent : null,
    time: RESIDENT_INTENT_TIME_BUTTONS.some((item) => item.id === urlState.time) ? urlState.time : null,
  });
  const [district, setDistrict] = useState(urlState.district);
  const [passPresented, setPassPresented] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const presentResidentPass = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setPassPresented(true);
  }, []);
  const saveResidentPassForLater = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setWalletAdded(true);
  }, []);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState(() => (
    urlState.mode === "partner" && urlState.panelTab
      ? urlState.panelTab
      : urlState.mode === "resident" && urlState.tab === "map" && ["Perks", "Events", "Saved"].includes(urlState.filter)
        ? urlState.filter.toLowerCase()
        : "map"
  ));
  const [activeCampaignStep, setActiveCampaignStep] = useState("Goal");
  const [clusterDrawer, setClusterDrawer] = useState(null);
  const [mapZoom, setMapZoom] = useState(INITIAL_MAP_ZOOM);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [secondaryRailOpen, setSecondaryRailOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [mapAnswer, setMapAnswer] = useState(null);
  const [entityAnswer, setEntityAnswer] = useState(null);
  const [entityAssistantLoading, setEntityAssistantLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchRollupRef = useRef(null);

  useEffect(() => {
    if (urlState.mode === "partner" && urlState.panelTab) {
      setActiveBottomTab(urlState.panelTab);
      setConsoleCollapsed(true);
      setSelectedId("");
      setClusterDrawer(null);
    }
  }, [urlState.mode, urlState.panelTab]);
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
    if (consoleCollapsed || urlState.tab !== "map") return undefined;
    const focusId = window.setTimeout(() => {
      searchInputRef.current?.focus?.({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(focusId);
  }, [consoleCollapsed, urlState.tab]);

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
    setSelectedId(resolveMapEntityAlias(urlState.entityId));
  }, [urlState.entityId]);

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

  const effectiveSearch = useMemo(() => {
    return sanitizeMapPrompt(search, urlState.mode);
  }, [search, urlState.mode]);
  const consoleHasActiveWork = Boolean(effectiveSearch || mapAnswer || filtersOpen || neighborhoodsOpen || intelOpen);

  useEffect(() => {
    const scopedResultSet = Boolean(effectiveSearch) || !isAllNeighborhoodScope(district);
    if (scopedResultSet) setConsoleCollapsed(false);
  }, [effectiveSearch, district]);

  const neighborhoodBasePlaces = useMemo(() => {
    const query = effectiveSearch.toLowerCase();
    const intentTokens = getIntentTokens(query);
    const parsed = parseMapIntent(query, urlState.mode);
    const isBroadPartnerIntent = urlState.mode === "partner" && parsed.intents.some((intent) => ["partner_opportunity", "partner_coverage", "partner_performance", "partner_campaigns"].includes(intent));
    return places.filter((place) => {
      if (!matchesFilter(place, activeFilter, savedIds)) return false;
      if (!query) return true;
      const text = placeText(place);
      return (
        isBroadPartnerIntent ||
        text.includes(query) ||
        intentTokens.some((token) => text.includes(token)) ||
        parsed.intents.some((intent) => text.includes(intent.toLowerCase().replace(/_/g, " "))) ||
        (query.includes("perk") && hasActivePerkData(place))
      );
    });
  }, [places, effectiveSearch, activeFilter, savedIds, urlState.mode]);

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
    () => resolveMapEntityFromCollection(selectedId, places) || resolveMapEntityFromCollection(selectedId, luxuryPresenceListingPlaces) || null,
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
        : hasActiveCategoryScope
          ? []
          : places.slice(0, 12);
  const isUsingFallbackPlaces = !filtered.length && !hasActiveCategoryScope && places.length > 0;
  const contextCount = displayPlaces.length;
  const isDefaultDiscoverScope = activeFilter === "All" && isAllNeighborhoodScope(district) && !effectiveSearch;
  const contextLabel = contextCount > 0
    ? isDefaultDiscoverScope
      ? "Featured downtown places"
      : `${contextCount} ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()}`
    : `Showing suggested ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()} nearby`;
  const discoverDisplayPlaces = useMemo(
    () => sortDiscoverPlaces(displayPlaces),
    [displayPlaces],
  );
  const mapPlaces = useMemo(() => {
    const pinPlaces = dedupeMapPinPlaces(discoverDisplayPlaces.filter((place) => !isUnitLevelListingPlace(place)));
    if (urlState.mode === "resident" && isDefaultDiscoverScope) return pinPlaces.slice(0, 48);
    return pinPlaces;
  }, [discoverDisplayPlaces, isDefaultDiscoverScope, urlState.mode]);
  const mapResultBoundsKey = `${urlState.mode}:${activeFilter}:${district}:${effectiveSearch || "none"}:${mapPlaces.length}`;
  const visibleLegendsPlaces = useMemo(
    () => dedupeMapPinPlaces(discoverDisplayPlaces).filter((place) => isLegendsMapPlace(place)),
    [discoverDisplayPlaces],
  );
  const clusteredMapItems = useMemo(
    () => clusterPlaces(mapPlaces, mapZoom, selectedId),
    [mapPlaces, mapZoom, selectedId],
  );
  const previewLimit = resultsExpanded ? 12 : 4;
  const previewPlaces = discoverDisplayPlaces.slice(0, previewLimit);
  const isResidentSavedDrawer = urlState.mode === "resident" && activeBottomTab === "saved";
  const savedDrawerPlaces = residentSavedPlaces.slice(0, previewLimit);
  const drawerPreviewPlaces = isResidentSavedDrawer ? savedDrawerPlaces : previewPlaces;
  const hiddenPreviewCount = Math.max(0, Math.min(discoverDisplayPlaces.length, 12) - previewPlaces.length);
  const hiddenSavedPreviewCount = Math.max(0, Math.min(residentSavedPlaces.length, 12) - savedDrawerPlaces.length);
  const activePromptList = urlState.mode === "partner" ? PARTNER_PLACEHOLDERS : RESIDENT_PLACEHOLDERS;
  const activePrompt = activePromptList[promptIndex % activePromptList.length] || activePromptList[0];
  const searchPlaceholder = urlState.mode === "partner" ? activePrompt || "Dinner intent nearby" : activePrompt || "What are you looking for?";
  const searchConsoleLabel = "Ask the map";
  const areaRailLabel = getAreaRailLabel(urlState.mode, activeFilter);
  const allAreaLabel = getAllAreaLabel(urlState.mode, activeFilter);
  const activePartnerPanel = urlState.mode === "partner" && MAP_NATIVE_PARTNER_PANELS.includes(activeBottomTab) ? activeBottomTab : "";
  const residentPanelCopy = {
    perks: {
      eyebrow: "Perks",
      title: "Useful offers nearby.",
      body: "Places with resident value, card moments, or offers worth saving.",
    },
    events: {
      eyebrow: "Events",
      title: "What is happening nearby.",
      body: "Events, music, park moments, and plans close enough to use.",
    },
    saved: {
      eyebrow: "Saved",
      title: "Places to remember.",
      body: "A quick list of saved places and nearby picks to come back to.",
    },
  }[activeBottomTab] || null;
  const panelPlaces = previewPlaces.length ? previewPlaces : discoverDisplayPlaces.slice(0, 8);
  const searchTimeOptions = urlState.mode === "partner" ? PARTNER_TIME_FILTERS : RESIDENT_TIME_FILTERS;
  const searchIntentOptions = urlState.mode === "partner" ? PARTNER_INTENT_FILTERS : RESIDENT_INTENT_FILTERS;
  const activeSearchSummary = [
    effectiveSearch,
    activeFilter !== "All" ? activeFilter : "",
    !isAllNeighborhoodScope(district) ? district : "",
    urlState.time,
    urlState.intent,
    urlState.entityType,
    radius && !["Any", "5 min walk"].includes(radius) ? radius : "",
  ].filter(Boolean);
  const resultsContextLine = activeSearchSummary.length
    ? urlState.mode === "partner"
      ? `Showing partner opportunities around ${activeSearchSummary.slice(0, 2).join(" · ")}.`
      : `Showing ${activeFilter === "All" ? "places" : activeFilter.toLowerCase()} around ${activeSearchSummary.slice(0, 2).join(" · ")}.`
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
    return truncatePanelCopy(
      place.perk?.offer ||
      place.recommended_perk ||
      place.partner_opportunity ||
      place.summary ||
      place.description ||
      place.raw?.summary ||
      "Useful nearby context for the next map action.",
      86,
    );
  }

  function renderEntityCard(place, actionLabel = "Open") {
    const image = resolveEntityImage(place, "card");
    const saved = savedIds.has(place.id);
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
            <span>{[place.category || place.type || "place", place.district || place.neighborhood || "Downtown", placeDistanceLabel(place)].filter(Boolean).join(" • ")}</span>
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
    return (
      <button key={place.id} type="button" className="dp-tab-row dp-compact-place-row" onClick={() => selectPlace(place)}>
        <span className="dp-partner-feed-main">
          <span>
            <strong>{place.name}</strong>
            <small>{[place.category || place.type || "Place", place.district || place.neighborhood || "Downtown", placeDistanceLabel(place)].filter(Boolean).join(" • ")}</small>
          </span>
        </span>
        <span className="dp-compact-place-actions">
          <em>{actionLabel}</em>
        </span>
      </button>
    );
  }

  const reportSections = [
    {
      section: "Quick read",
      value: "42%",
      headline: "After-work activity is leading the week.",
      copy: "Dinner, events, and nearby offers are leading.",
      action: "View report",
      target: "reports",
      observation: "People nearby are planning around dinner, events, and short walks after work.",
      trend: "Saves, scans, and directions rise together between 5 PM and 8 PM.",
      recommendation: "Keep the offer close to the route.",
      outcome: "More people can decide what to do next without leaving the map.",
    },
    {
      section: "Short walks",
      value: "+18%",
      headline: "Short routes outperform broad visibility.",
      copy: "Walkable places are getting the strongest activity.",
      action: "Review results",
      target: "reports",
      observation: "Walkable paths around Rainey, Seaholm, Congress, and Waterloo are the clearest behavior clusters.",
      trend: "Nearby saves are increasing faster than broad district impressions.",
      recommendation: "Use compact map placements.",
      outcome: "Partners see cleaner attribution from the places people can actually reach.",
    },
    {
      section: "Offers",
      value: "6.8%",
      headline: "Timed offers are easier to act on.",
      copy: "One focused reason to visit beats a long campaign message.",
      action: "Plan offer",
      target: "campaigns",
      observation: "Campaigns with a single save, scan, RSVP, or direction action are performing best.",
      trend: "Offer clarity is improving downstream redemptions.",
      recommendation: "Launch one after-work test.",
      outcome: "The next campaign should be easier to measure and easier to repeat.",
    },
    {
      section: "Saved places",
      value: "312",
      headline: "People save first, then decide.",
      copy: "Saves are turning into directions and visits.",
      action: "Review results",
      target: "reports",
      observation: "Residents are using saved places as a lightweight planning queue.",
      trend: "Saves are rising before visits and card opens.",
      recommendation: "Add nearby follow-up context.",
      outcome: "More saved places turn into visits, RSVPs, and card use.",
    },
    {
      section: "Best next step",
      value: "3",
      headline: "Run the next test near the busiest walk path.",
      copy: "Pair one place with one clear resident action.",
      action: "Open campaigns",
      target: "campaigns",
      observation: "The strongest opportunities sit near current movement, not isolated listings.",
      trend: "Rainey, Seaholm, and Congress are overlapping around evening plans.",
      recommendation: "Anchor the template to one place.",
      outcome: "Partners get a cleaner test and residents get a more useful prompt.",
    },
    {
      section: "Ready to do",
      value: "4",
      headline: "Move from insight to one live campaign.",
      copy: "Pick the place, timing, audience, and action.",
      action: "Open campaigns",
      target: "campaigns",
      observation: "The report is strongest when it becomes a next step inside the map.",
      trend: "Teams are reviewing reports and then opening campaign planning.",
      recommendation: "Start with save or directions.",
      outcome: "The platform stays focused on discovery, understanding, and action.",
    },
  ];

  function renderReportsPanel() {
    return (
      <div className="dp-tabs-content dp-partner-readable-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Reports</p>
            <h2>What changed nearby.</h2>
            <p>What people opened, saved, scanned, and used this week.</p>
          </section>

          <section className="dp-partner-report-visual" aria-label="This week at a glance">
            <div>
              <span>This week</span>
              <strong>After-work activity is leading the week.</strong>
              <p>Dinner, events, and walkable offers are getting the most attention.</p>
            </div>
            <div className="dp-partner-report-bars" aria-hidden="true">
              <i style={{ "--value": "76%" }} />
              <i style={{ "--value": "58%" }} />
              <i style={{ "--value": "42%" }} />
            </div>
          </section>

          <section className="dp-partner-report-analytics" aria-label="Report analytics">
            {[
              ["Opens", "612", "Map and drawer opens"],
              ["Saves", "284", "Saved places and offers"],
              ["Scans", "91", "Card and QR activity"],
            ].map(([label, value, copy]) => (
              <div key={label} className="dp-partner-summary-card">
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{copy}</p>
              </div>
            ))}
          </section>

          <div className="dp-partner-report-card-grid" aria-label="Report details">
            {reportSections.map((item, index) => (
              <button key={item.section} type="button" className="dp-partner-report-card" onClick={() => openPartnerPanel(item.target)}>
                <span className="dp-report-label">{item.section}</span>
                <strong>{item.headline}</strong>
                <div className="dp-report-progress" aria-hidden="true"><i style={{ width: `${Math.max(42, 84 - index * 7)}%` }} /></div>
                <div className="dp-report-card-footer">
                  <span>{item.value}</span>
                  <em>{item.action}</em>
                </div>
                <dl className="dp-report-mini-table">
                  <dt>What happened</dt><dd>{item.copy}</dd>
                  <dt>What to do</dt><dd>{item.recommendation}</dd>
                </dl>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderActivityPanel() {
    const activityRows = [
      ["Nearby activity updated", "Views, saves, and offer taps are moving together.", "Open scanner", () => openPartnerMap("All")],
      ["Dining is rising", "Happy hour and patios are getting stronger interest.", "Create offer", () => openPartnerPanel("campaigns")],
      ["Events are being saved", "Evening plans are trending in Seaholm and Rainey.", "View events", () => openPartnerMap("Events")],
      ["After work is busiest", "Most activity lands after work and on weekends.", "Review offer", () => openPartnerPanel("reports")],
    ];
    return (
      <div className="dp-tabs-content dp-partner-readable-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Activity</p>
            <h2>What people did nearby.</h2>
            <p>Recent scans, saves, RSVPs, claims, and map opens.</p>
          </section>

          <section className="dp-partner-summary-grid" aria-label="Activity summary">
            {[
              ["Map opens", "612", "This week"],
              ["Saves", "284", "Places and offers"],
              ["Scans", "91", "Cards and QR"],
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
    const campaignPlans = [
      ["Today, 4-8 PM", "After-work offer", "Food and drink saves are rising.", "Happy hour or dinner"],
      ["This weekend", "Event-night push", "Events are opening before dinner plans.", "Pre-show dining or RSVP"],
      ["Weekday mornings", "Lobby QR placement", "Building scans are turning into saves.", "Coffee or wellness"],
    ];
    const activeOffers = [
      ["After-work dining", "Rainey + Congress", "Dinner intent, 5-8 PM", "Ready", 78],
      ["New resident welcome", "Buildings + nearby perks", "First local visits", "Draft", 48],
      ["inKind dining access", "Pass + restaurants", "Card opens and directions", "Live", 66],
    ];
    const selectedPlan = campaignPlans.find(([, title]) => title === activeCampaignStep) || campaignPlans[0];
    return (
      <div className="dp-tabs-content dp-partner-readable-panel dp-campaign-drawer">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero dp-campaign-hero">
            <p className="dp-tab-eyebrow">Offers</p>
            <h2>Plan what shows up next.</h2>
            <p>Build from nearby intent, timing, and current activity.</p>
            <button type="button" className="dp-tab-primary-action" onClick={() => setActiveCampaignStep("After-work offer")}>New offer</button>
          </section>

          <div className="dp-campaign-action-rail">
            <button type="button" onClick={() => setActiveCampaignStep("After-work offer")}>Plan offer</button>
            <button type="button" onClick={() => openPartnerPanel("reports")}>Review results</button>
            <button type="button" onClick={() => openPartnerMap("All")}>View map</button>
          </div>

          <section className="dp-campaign-planner-panel">
            <p className="dp-tab-eyebrow">Planner</p>
            <div className="dp-campaign-plan-grid dp-action-card-rail">
              {campaignPlans.map(([time, title, copy, action]) => (
                <button
                  key={title}
                  type="button"
                  className={`dp-campaign-plan-card dp-action-card ${selectedPlan[1] === title ? "is-active" : ""}`}
                  onClick={() => setActiveCampaignStep(title)}
                >
                  <span className="dp-action-card-eyebrow">{time}</span>
                  <strong className="dp-action-card-title">{title}</strong>
                  <p className="dp-action-card-copy">{copy}</p>
                  <em className="dp-action-card-examples">{action}</em>
                  <span className="dp-action-card-link">Select plan <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </button>
              ))}
            </div>
          </section>

          <section className="dp-campaign-plan-detail">
            <p className="dp-tab-eyebrow">Selected plan</p>
            <h3>{selectedPlan[1]}</h3>
            <p>Rainey · {selectedPlan[0]}</p>
            <div className="dp-campaign-metric-bars dp-metric-table">
              {[
                ["Saves", "284", 72],
                ["Map opens", "612", 88],
                ["Claims", "42", 34],
              ].map(([label, value, width]) => (
                <div key={label}>
                  <span>{label}: {value}</span>
                  <i style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>
          </section>

          <section className="dp-campaign-panel">
            <p className="dp-tab-eyebrow">Active offers</p>
            <div className="dp-partner-feed-list">
              {activeOffers.map(([title, meta, copy, status, progress]) => (
                <button key={title} type="button" className="dp-campaign-row" onClick={() => openPartnerPanel(status === "Draft" ? "campaigns" : "reports")}>
                  <span>
                    <strong>{title}</strong>
                    <small>{meta}</small>
                    <em>{copy}</em>
                    <i style={{ width: `${progress}%` }} />
                  </span>
                  <b>{status}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="dp-campaign-panel">
            <p className="dp-tab-eyebrow">What to try</p>
            <div className="dp-partner-feed-list dp-map-campaign-place-rail" aria-label="Campaign-ready places">
              {panelPlaces.slice(0, 6).map((place) => renderCompactEntityRow(place, "Use place"))}
            </div>
          </section>
      </div>
      </div>
    );
  }

  function renderInfoPanel() {
    return (
      <div className="dp-tabs-content dp-partner-readable-panel dp-partner-info-panel">
        <div className="dp-tab-stack">
          <section className="dp-partner-readable-hero">
            <p className="dp-tab-eyebrow">Downtown Perks</p>
            <h2>One map for what is nearby.</h2>
            <p>Places, perks, events, listings, and local help in one view.</p>
          </section>

          <section className="dp-partner-info-copy">
            <p>Open the map, see what is close, save what fits, and make the next move.</p>
          </section>

          <section className="dp-partner-summary-grid dp-partner-info-grid" aria-label="Downtown Perks utility">
            {[
              ["Nearby", "Places, events, and services close enough to use."],
              ["Perks", "Resident offers from spots people already visit."],
              ["Homes", "Listings with walkable context nearby."],
              ["Ready", "Saved places, RSVPs, scans, and next steps."],
            ].map(([title, copy]) => (
              <article key={title} className="dp-partner-summary-card">
                <span>{title}</span>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="dp-partner-feed-list" aria-label="What Downtown Perks does">
            <p className="dp-tab-eyebrow">What it does</p>
            {[
              ["Resident Map", "See what is nearby, open, useful, and worth leaving for."],
              ["Perks Card", "Save places and use resident access."],
              ["Ask The Map", "Ask for coffee, dinner, a workout, or tonight."],
              ["Partner View", "See what people saved, scanned, joined, and used."],
            ].map(([title, copy]) => (
              <button key={title} type="button" className="dp-tab-row dp-partner-feed-row" onClick={() => title === "Partner View" ? openPartnerPanel("activity") : openPartnerMap("All")}>
                <span className="dp-partner-feed-main">
                  <span className="dp-tab-row-icon"><Info className="h-4 w-4" /></span>
                  <span><strong>{title}</strong><small>{copy}</small></span>
                </span>
                <span className="dp-tab-signal">Open</span>
              </button>
            ))}
          </section>

          <section className="dp-partner-info-steps" aria-label="How it works">
            <p className="dp-tab-eyebrow">How it works</p>
            {[
              "Open the map",
              "Discover nearby places, events, perks, and listings",
              "Save a place, RSVP, or show your perks card",
              "Partners see what people used and what helped them show up",
            ].map((step, index) => (
              <div key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
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
              ["Next step", "Open strongest pins"],
            ].map(([label, value]) => (
              <article key={label} className="dp-partner-summary-card">
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </section>

          <section className="dp-partner-feed-list" aria-label="Civic opportunity">
            {[
              ["Nearby signal", "Public spaces anchor walks and plans.", "Open report"],
              ["Why it matters", "Civic moments make routes easier.", "View activity"],
              ["Recommended action", "Build one route around a public place.", "Open pins"],
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
    if (!resolveMapEntityFromCollection(selectedId, places) && !resolveMapEntityFromCollection(selectedId, luxuryPresenceListingPlaces)) {
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
    if (urlState.mode !== "resident") setConsoleCollapsed(!consoleHasActiveWork);
  }, [consoleHasActiveWork, selectedId, urlState.mode]);

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
    const isListingSelection = isUnitLevelListingPlace(place);
    const isPropertySelection = isListingSelection || Boolean(getLuxuryPresenceBuilding(place)) || isPropertyEntity(place);
    const publicPropertyId = isPropertySelection ? resolvePropertyUrlEntityId(place.id) : "";
    const publicListingId = isListingSelection ? resolvePropertyListingUrlId(place.id) : "";
    const nextEntityId = canonicalSelectedId;
    setActiveBottomTab("map");
    setClusterDrawer(null);
    if (urlState.mode !== "resident") setConsoleCollapsed(!consoleHasActiveWork);
    setPulsingPinId(nextEntityId);
    setSelectedId(nextEntityId);
    urlState.update({ entityId: isPropertySelection ? publicPropertyId : place.id, listingId: publicListingId || "" });
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
      const pin = event.target?.closest?.(".dp-live-pin[data-entity-id]");
      if (!pin) return;
      const entityId = pin.getAttribute("data-entity-id");
      const place = places.find((item) => item.id === entityId);
      if (!place) return;
      event.preventDefault();
      event.stopPropagation();
      selectPlace(place);
    };

    const handlePinKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handlePinOpen(event);
    };

    document.addEventListener("click", handlePinOpen, true);
    document.addEventListener("pointerup", handlePinOpen, true);
    document.addEventListener("keydown", handlePinKeyDown, true);
    return () => {
      document.removeEventListener("click", handlePinOpen, true);
      document.removeEventListener("pointerup", handlePinOpen, true);
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
    urlState.update({ filter, entityId: "" });
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
    setSavedIds((current) => {
      const next = new Set(current);
      next.has(place.id) ? next.delete(place.id) : next.add(place.id);
      return next;
    });
    if (nextSaved) {
      trackingEvents.save(place.id);
      fireWorkflow("/api/save", {
        profileId: getWorkflowProfileId(),
        entityType: workflowEntityType(place),
        entityId: place.id,
      });
      return;
    }
    trackingEvents.unsave(place.id);
  }

  function getMapAnswerActionLabel(action) {
    const normalized = String(action || "").toLowerCase();
    if (normalized.includes("open") || normalized.includes("map")) return "Open Nearby";
    if (normalized.includes("save")) return "Save For Later";
    if (normalized.includes("walk") || normalized.includes("near") || normalized.includes("next")) return "Open Nearby";
    if (normalized.includes("direction")) return "Directions";
    return String(action || "Open").replace(/^check\s+/i, "").slice(0, 14);
  }

  function handleMapAnswerAction(action) {
    const normalized = String(action || "").toLowerCase();
    const firstPick = mapAnswer?.picks?.[0] || selected || visiblePlaces[0];

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

  function getSmartResults(query, filterOverride = activeFilter) {
    const q = query.trim().toLowerCase();
    const parsed = parseMapIntent(query, urlState.mode);
    const intentTokens = getIntentTokens(q);
    const isBroadPartnerIntent = urlState.mode === "partner" && parsed.intents.some((intent) => ["partner_opportunity", "partner_coverage", "partner_performance", "partner_campaigns"].includes(intent));
    const scoped = places.filter((place) => {
      if (!matchesFilter(place, filterOverride, savedIds)) return false;
      if (!isAllNeighborhoodScope(district) && place.district !== district) return false;
      if (!q) return true;
      const text = placeText(place);
      return (
        isBroadPartnerIntent ||
        text.includes(q) ||
        intentTokens.some((token) => text.includes(token)) ||
        parsed.intents.some((intent) => text.includes(intent.toLowerCase().replace(/_/g, " "))) ||
        (q.includes("perk") && hasActivePerkData(place))
      );
    });

    const baseResults = scoped.length ? scoped : displayPlaces.length ? displayPlaces : hasActiveCategoryScope ? [] : places;
    return rankPlacesForIntent(baseResults, query, urlState.mode);
  }

  async function askMapAgent(query, localResults) {
    try {
      const parsedIntent = parseMapIntent(query, urlState.mode);
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          mode: urlState.mode,
          district: isAllNeighborhoodScope(district) ? "Downtown Austin" : district,
          filter: activeFilter,
          parsedIntent,
          intentCategories: parsedIntent.intents.length
            ? parsedIntent.intents
            : urlState.mode === "partner"
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
    const query = search.trim() || (urlState.mode === "resident" ? "What’s worth walking to tonight?" : activePrompt);
    const parsedIntent = parseMapIntent(query, urlState.mode);
    const nextFilter = resolveFilterForIntent(query, urlState.mode);
    const nextDistrict = parsedIntent.district || district;
    const localResults = getSmartResults(query, nextFilter || activeFilter);
    setConsoleCollapsed(false);
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
    setActiveBottomTab("discover");
    urlState.update({
      query,
      q: "",
      filter: nextFilter || activeFilter,
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "" : district),
      time: parsedIntent.timeContext || "",
      intent: parsedIntent.intents[0] || "",
      entityType: parsedIntent.entityType || "",
    });

    const agentAnswer = await askMapAgent(query, localResults);
    if (agentAnswer?.answer) {
      setMapAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Start with ${localResults[0]?.name || "Downtown"}.`));
    }
  }

  async function applyPrompt(prompt) {
    const parsedIntent = parseMapIntent(prompt, urlState.mode);
    const nextFilter = resolveFilterForIntent(prompt, urlState.mode);
    const nextDistrict = parsedIntent.district || district;
    const localResults = getSmartResults(prompt, nextFilter || activeFilter);
    setConsoleCollapsed(false);
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
    setActiveBottomTab("discover");
    urlState.update({
      query: prompt,
      q: "",
      filter: nextFilter || activeFilter,
      district: parsedIntent.district || (isAllNeighborhoodScope(district) ? "" : district),
      time: parsedIntent.timeContext || "",
      intent: parsedIntent.intents[0] || "",
      entityType: parsedIntent.entityType || "",
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
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    setSearch(nextQuery);
    setActiveFilter(nextFilter);
    setMapAnswer(buildAgenticMapAnswer(nextQuery, localResults, urlState.mode, district, nextFilter));
    setActiveBottomTab("discover");
    urlState.update({
      query: nextQuery,
      time: item.id,
      filter: nextFilter,
      radius,
      entityId: "",
    });
  }

  function applyResidentRadius(item) {
    const nextQuery = search.trim() || "What’s worth walking to tonight?";
    const nextFilter = resolveFilterForIntent(nextQuery, urlState.mode) || activeFilter;
    const localResults = getSmartResults(nextQuery, nextFilter);
    setRadius(item.label);
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    setActiveFilter(nextFilter);
    setMapAnswer(buildAgenticMapAnswer(nextQuery, localResults, urlState.mode, district, nextFilter));
    setActiveBottomTab("discover");
    urlState.update({
      query: nextQuery,
      radius: item.label,
      filter: nextFilter,
      entityId: "",
    });
  }

  function applyResidentConsoleFilter(item) {
    setConsoleCollapsed(false);
    setFiltersOpen(false);
    if (item.kind === "filter" && item.filter) {
      setResidentSearchIntent((current) => ({ ...current, intent: null }));
      setSearch(item.prompt || item.filter);
      setActiveFilter(item.filter);
      const localResults = getSmartResults(item.prompt || item.filter, item.filter);
      setMapAnswer(buildAgenticMapAnswer(item.prompt || item.filter, localResults, urlState.mode, district, item.filter));
      setActiveBottomTab("discover");
      urlState.update({ query: item.prompt || item.filter, filter: item.filter, entityId: "" });
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
    urlState.update({ query: "", q: "", prompt: "", intent: "", time: "", entityId: "" });
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
      setEntityAnswer((current) => mergeAgentAnswerWithLocalResults(agentAnswer, localResults, current?.title || `Start with ${localResults[0]?.name || selected?.name || "Downtown"}.`));
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
    setRadius("5 min walk");
    setIntelOpen(false);
    setFiltersOpen(false);
    setNeighborhoodsOpen(false);
    setSecondaryRailOpen(false);
    setActiveBottomTab("map");
    setConsoleCollapsed(false);
    navigate(`/map?mode=${mode}&tab=${tab}${tab === "map" ? `&filter=${encodeURIComponent(nextFilter)}` : ""}`);
  }

  function openPartnerPanel(panel) {
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    setConsoleCollapsed(true);
    setActiveBottomTab(panel);
    navigate(`/map?mode=partner&tab=${panel}`);
  }

  function openPartnerMap(filter = "All") {
    setSelectedId("");
    setClusterDrawer(null);
    setMapAnswer(null);
    setConsoleCollapsed(false);
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
  const hasOpenMapPanel = urlState.tab === "pass" || Boolean(selected) || Boolean(clusterDrawer) || (urlState.tab === "map" && MAP_NATIVE_PARTNER_PANELS.includes(activeBottomTab));
  const showBottomNavigation = urlState.tab === "map" || urlState.tab === "pass";

  return (
    <div
      className={`dp-map-page relative h-screen overflow-hidden bg-white text-[#0B1F33] ${urlState.mode === "partner" ? "dp-map-page-partner" : "dp-map-page-resident"}`}
      data-map-zoom={mapZoom.toFixed(2)}
    >
      <div className="absolute inset-x-0 bottom-0 top-0">
        <MapContainer
          center={AUSTIN_CENTER}
          zoom={INITIAL_MAP_ZOOM}
          minZoom={13}
          maxZoom={20}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          keyboard={true}
          zoomSnap={0.5}
          zoomDelta={0.5}
          className="dp-spatial-map h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
          <MapResultBoundsFitter places={mapPlaces} activeKey={mapResultBoundsKey} selectedId={selectedId} enabled={hasActiveCategoryScope} />
          <MapZoomTracker onZoomChange={(zoom) => setMapZoom((current) => (Math.abs(current - zoom) > 0.01 ? zoom : current))} />
          <MapInteractionCollapse onCollapse={() => {
            if (urlState.mode !== "resident" && !consoleHasActiveWork) setConsoleCollapsed(true);
          }} />
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
          className="pointer-events-none absolute inset-x-0 top-[106px] z-[510] px-2.5 md:top-[84px] md:px-5"
        >
          {urlState.mode === "resident" ? (
            <SearchIntentConsole
              mode={urlState.mode}
              query={search}
              placeholder={RESIDENT_INTENT_CONSOLE_PLACEHOLDERS[promptIndex % RESIDENT_INTENT_CONSOLE_PLACEHOLDERS.length]}
              activeIntent={residentSearchIntent.intent}
              activeTime={residentSearchIntent.time}
              activeRadius={radius}
              activeFilter={activeFilter}
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
              onPromptSelect={(prompt) => {
                setResidentSearchIntent({ intent: null, time: null });
                void applyPrompt(prompt);
              }}
              onModeChange={(mode) => {
                if (mode !== urlState.mode) switchMode(mode, "map");
              }}
            />
          ) : consoleCollapsed ? (
            <button
              type="button"
              ref={searchRollupRef}
              className="dp-search-rollup-button pointer-events-auto"
              aria-label="Open map search"
              aria-expanded="false"
              data-state="collapsed"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setConsoleCollapsed(false);
                setFiltersOpen(false);
              }}
            >
              <Search className="dp-search-rollup-icon" aria-hidden="true" />
              <span className="dp-search-rollup-label">{searchRollupLabel}</span>
              <ChevronDown className="dp-search-rollup-chevron h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="dp-map-search-surface dp-map-search-shell pointer-events-auto relative mx-auto max-h-[calc(100dvh-124px)] max-w-2xl overflow-y-auto"
              role="region"
              aria-label="Map command console"
              aria-expanded="true"
              data-state={filtersOpen ? "expanded-filters" : "focused"}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setConsoleCollapsed(true);
                  setFiltersOpen(false);
                  window.setTimeout(() => searchRollupRef.current?.focus?.({ preventScroll: true }), 0);
                }}
                className="dp-console-rollup"
                aria-label="Collapse map search console"
                aria-expanded="true"
              >
                <ChevronUp className="h-4 w-4" />
              </button>

            <div className="dp-map-search-inner" data-state={filtersOpen ? "expanded-filters" : "focused"}>
              <div className="dp-console-topline">
                <div className="dp-hero-search-label">
                  <div className="dp-console-inline-ask">
                    <Sparkles className="h-3 w-3 text-[#C8A96A]" />
                    {searchConsoleLabel}
                  </div>
                </div>
                <form onSubmit={runSearch} className="dp-hero-search-form">
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
                          ref={searchInputRef}
                          type="text"
                          aria-label="Ask the Map search"
                          placeholder={searchPlaceholder}
                          value={search}
                          onChange={(e) => {
                            setConsoleCollapsed(false);
                            setSearch(e.target.value);
                            if (mapAnswer) setMapAnswer(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") runSearch(event);
                          }}
                          className="w-full min-w-0 bg-transparent text-[#0B1F33] placeholder:text-[#0B1F33]/38 focus:outline-none"
                        />
                      </motion.div>
                    </AnimatePresence>
                    {search && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                          setConsoleCollapsed(false);
                          setSearch("");
                          setMapAnswer(null);
                        }}
                        className="dp-hero-search-clear"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <button type="submit" className="dp-hero-search-submit">
                      Ask
                    </button>
                  </div>
                </form>
                <div className="dp-map-audience-tabs" role="tablist" aria-label="Map audience">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={urlState.mode === "resident"}
                    onClick={() => {
                      setFilter("All");
                      setFiltersOpen(false);
                      switchMode("resident", "map");
                    }}
                    className={`dp-map-audience-tab ${urlState.mode === "resident" ? "is-active" : ""}`}
                  >
                    Residents
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={urlState.mode === "partner"}
                    onClick={() => {
                      setFilter("All");
                      setFiltersOpen(false);
                      switchMode("partner", "map");
                    }}
                    className={`dp-map-audience-tab ${urlState.mode === "partner" ? "is-active" : ""}`}
                  >
                    Partners
                  </button>
                </div>
              </div>

              <div className="dp-suggested-prompt-row" aria-label="Suggested map prompts">
                {heroPromptLabels.slice(0, urlState.mode === "partner" ? 5 : 5).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="dp-suggested-prompt"
                    onClick={() => {
                      void applyPrompt(prompt);
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="dp-unified-search-console" aria-label="Search filters">
                <div className="dp-search-rail-header">
                  <span className="dp-rail-kicker">Filters</span>
                  <button
                    type="button"
                    className="dp-rail-toggle"
                    aria-expanded="true"
                    aria-label={urlState.mode === "resident" ? "Hide resident filter rail" : "Hide partner filter rail"}
                    onClick={() => {
                      setConsoleCollapsed(true);
                      setFiltersOpen(false);
                    }}
                  >
                    Hide
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="dp-search-context-row dp-search-context-row-primary" role="tablist" aria-label="What are you looking for?">
                  {primarySearchFilters.map((item) => {
                    const active = item.filter === activeFilter;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setFilter(item.filter)}
                        className={`dp-console-chip dp-search-segment ${active ? "is-active" : ""}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="dp-console-chip dp-console-chip-area"
                    aria-expanded={filtersOpen}
                    onClick={() => {
                      setConsoleCollapsed(false);
                      setFiltersOpen(true);
                    }}
                  >
                    {isAllNeighborhoodScope(district) ? "All neighborhoods" : district}
                  </button>
                </div>
                <div className="dp-distance-control" role="radiogroup" aria-label="Distance">
                  {SEARCH_RADIUS_OPTIONS.map((item) => {
                    const active = radius === item || (item === "Any" && !radius);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setConsoleCollapsed(false);
                          setRadius(item);
                          setMapAnswer(null);
                          urlState.update({ radius: item });
                        }}
                        className={active ? "is-active" : ""}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                {filtersOpen && (
                  <div className="dp-search-filter-scroll">
                    <div className="dp-search-filter-group">
                      <div className="dp-search-filter-group-title">Time</div>
                      <div className="dp-search-context-row dp-search-context-row-secondary" aria-label="Time filters">
                        {searchTimeOptions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={urlState.time === item}
                            className={`dp-console-chip ${urlState.time === item ? "is-active" : ""}`}
                            onClick={() => setSearchFacet("time", urlState.time === item ? "" : item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="dp-search-filter-group">
                      <div className="dp-search-filter-group-title">Intent</div>
                      <div className="dp-search-context-row dp-search-context-row-secondary" aria-label="Intent filters">
                        {searchIntentOptions.map((item) => (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={urlState.intent === item}
                            className={`dp-console-chip ${urlState.intent === item ? "is-active" : ""}`}
                            onClick={() => setSearchFacet("intent", urlState.intent === item ? "" : item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="dp-search-filter-group">
                      <div className="dp-search-filter-group-title">Entity Type</div>
                      <div className="dp-search-context-row dp-search-context-row-secondary" aria-label="Entity type filters">
                        {ENTITY_TYPE_FILTERS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            aria-pressed={urlState.entityType === item}
                            className={`dp-console-chip ${urlState.entityType === item ? "is-active" : ""}`}
                            onClick={() => setSearchFacet("entityType", urlState.entityType === item ? "" : item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="dp-search-filter-group">
                      <div className="dp-search-filter-group-title">More</div>
                      <div className="dp-search-context-row dp-search-context-row-secondary" aria-label="More map filters">
                        {advancedSearchFilters.map((item) => {
                          const active = item.filter === activeFilter;
                          return (
                            <button
                              key={item.label}
                              type="button"
                              aria-pressed={active}
                              className={`dp-console-chip ${active ? "is-active" : ""}`}
                              onClick={() => {
                                setFilter(item.filter);
                                setConsoleCollapsed(false);
                              }}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="dp-unified-search-meta">
                      <label className="dp-location-select">
                        <span>Area</span>
                        <select
                          value={isAllNeighborhoodScope(district) ? ALL_NEIGHBORHOODS : district}
                          onChange={(event) => {
                            setConsoleCollapsed(false);
                            setNeighborhood(event.target.value);
                          }}
                          aria-label="Area"
                        >
                          {NEIGHBORHOODS.map((neighborhood) => (
                            <option key={neighborhood} value={neighborhood}>
                              {neighborhood === ALL_NEIGHBORHOODS ? "All Areas" : neighborhood}
                            </option>
                          ))}
                        </select>
                      </label>

                    </div>
                  </div>
                )}

                {activeSearchSummary.length > 0 && (
                  <div className="dp-search-active-summary" aria-live="polite">
                    <span>{activeSearchSummary.join(" · ")}</span>
                    <button type="button" onClick={clearSearchFilters}>
                      Clear all
                    </button>
                  </div>
                )}
                {resultsContextLine && <p className="dp-search-context-line">{resultsContextLine}</p>}
                {activeSearchSummary.length > 0 && previewPlaces.length > 0 && (
                  <div className="dp-search-result-chip-row" aria-label="Ask the Map results">
                    {previewPlaces.slice(0, 5).map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className="dp-search-result-chip"
                        onClick={() => selectPlace(place)}
                      >
                        <span>{place.name}</span>
                        <small>{place.category || place.district || "Downtown"}</small>
                      </button>
                    ))}
                  </div>
                )}

              </div>

              <AnimatePresence initial={false}>

                {urlState.mode === "partner" && intelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-[170px] overflow-y-auto pt-2 pr-1">
                      <div className="grid gap-2">
                        <div className="grid gap-1.5 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("campaigns");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#C8A96A]">What people are doing</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">Open Nearby Activity for the fuller view.</p>
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
                              setActiveBottomTab("campaigns");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#C8A96A]">What to try next</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">Review what people are saving, then launch one focused offer.</p>
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
                            Open Nearby Activity
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                              setMapAnswer(buildAgenticMapAnswer("campaign opportunities", visiblePlaces, "partner", district, activeFilter));
                            }}
                            className="dp-map-control"
                          >
                            Campaigns
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                              setMapAnswer(buildAgenticMapAnswer("what changed nearby", visiblePlaces, "partner", district, activeFilter));
                            }}
                            className="dp-map-control"
                          >
                            Reports
                          </button>
                          <button type="button" onClick={() => setIntelOpen(false)} className="dp-map-control dp-map-control-icon" aria-label="Close intelligence panel">
                            <ChevronUp className="h-3.5 w-3.5" />
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
                className="dp-map-answer-decision mt-2 overflow-hidden p-3"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="dp-map-answer-context">Question</div>
                    <p className="dp-map-answer-question">{effectiveSearch || searchPlaceholder}</p>
                    <div className="dp-map-answer-context">Best answer</div>
                    <h3>{mapAnswer.title}</h3>
                    <div className="dp-map-answer-context">Why</div>
                    <p>{mapAnswer.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapAnswer(null)}
                    className="dp-map-control dp-map-control-icon inline-flex shrink-0 items-center gap-1.5"
                    aria-label="Close answer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {mapAnswer.picks.length > 1 && (
                  <div className="dp-map-answer-alternatives">
                    <div className="dp-map-answer-context">Alternatives</div>
                    {mapAnswer.picks.slice(1).map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className="dp-map-answer-pick"
                      >
                        <span>{place.category || "Downtown place"}</span>
                        <strong>{place.name}</strong>
                        <em>{place.district || "Downtown Austin"}</em>
                      </button>
                    ))}
                  </div>
                )}
                {mapAnswer.actions?.length > 0 && (
                  <div className="dp-map-answer-actions">
                    <div className="dp-map-answer-context">Action</div>
                    {mapAnswer.actions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => handleMapAnswerAction(action)}
                        className="dp-map-answer-action"
                      >
                        {getMapAnswerActionLabel(action)}
                        <ArrowRight className="h-3.5 w-3.5" />
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
              <button type="button" onClick={() => switchMode(urlState.mode, "map")} className="dp-panel-close inline-flex h-8 w-8 items-center justify-center rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9" aria-label="Close">
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
                  <button type="button" onClick={() => switchMode("partner", "map")} className="dp-pass-action">Partner Map</button>
                </div>
                </>
              ) : (
                <>
                <section className="dp-resident-pass-identity">
                  <div className="dp-pass-context">Resident Pass</div>
                  <h2 className="dp-pass-story">Your downtown access.</h2>
                  <p className="dp-pass-meaning">
                    Perks, events, local offers, and everything happening nearby.
                  </p>
                </section>

                <div className="dp-pass-access-grid">
                  <section className={`dp-pass-qr-hero ${passPresented ? "is-ready" : ""}`} aria-label="Downtown Perks Card">
                    <div className="dp-pass-context">Downtown Perks Card</div>
                    <div className="dp-pass-qr-title">{passPresented ? "Ready to scan" : "Downtown Perks"}</div>
                    <p className="dp-pass-qr-copy">Show the QR when a partner asks for resident access.</p>
                    <div className="dp-pass-qr-zip">Resident status · 78701</div>
                    <DemoQrCode code={DEMO_CARD_CODE} className="dp-pass-qr-image" />
                    <code>{DEMO_CARD_CODE}</code>
                  </section>

                  <section className="dp-pass-resident-card" aria-label="Resident Card">
                    <div className="dp-pass-context">Downtown Perks</div>
                    <h3 className="dp-pass-card-title">Resident Card</h3>
                    <p className="dp-pass-meaning">
                      Tap Present Pass when you are ready to redeem a perk or check in.
                    </p>
                    <div className="dp-pass-card-actions">
                      <button type="button" onPointerDown={presentResidentPass} onClick={presentResidentPass} className="dp-pass-action dp-pass-action-primary">{passPresented ? "Ready to scan" : "Present Pass"}</button>
                      <button type="button" onPointerDown={saveResidentPassForLater} onClick={saveResidentPassForLater} className="dp-pass-action">{walletAdded ? "Saved for later" : "Add Wallet"}</button>
                    </div>
                  </section>
                </div>

                <ResidentPassIdentity
                  savedPlaces={residentSavedPlaces}
                  perkPlaces={residentPerkPlaces}
                  eventRsvps={eventRsvps}
                  passPresented={passPresented}
                  walletAdded={walletAdded}
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
                <section className="dp-pass-editorial-section dp-pass-refund-rule">
                  <div className="dp-pass-context">Resident refund rule</div>
                  <p className="dp-pass-meaning">
                    If your building joins later, you’re covered. If you already paid and your building becomes part of Downtown Perks later, we’ll automatically refund or credit your resident membership.
                  </p>
                </section>
                <div className="dp-pass-action-stack">
                  <button type="button" onPointerDown={presentResidentPass} onClick={presentResidentPass} className="dp-pass-action">{passPresented ? "Pass ready" : "Present Pass"} <ArrowRight className="h-3 w-3" /></button>
                  <button type="button" onPointerDown={saveResidentPassForLater} onClick={saveResidentPassForLater} className="dp-pass-action">{walletAdded ? "Wallet added" : "Add Wallet"} <ArrowRight className="h-3 w-3" /></button>
                  <button type="button" onClick={() => navigate("/map?mode=resident&tab=map&filter=Perks")} className="dp-pass-action">View Perks <ArrowRight className="h-3 w-3" /></button>
                  <button type="button" onClick={() => switchMode("partner", "pass")} className="dp-pass-action">Partner Scan <ArrowRight className="h-3 w-3" /></button>
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
            className="dp-map-bottom-nav pointer-events-auto grid grid-cols-5"
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
                    setActiveBottomTab("saved");
                    setActiveFilter("Saved");
                    navigate("/map?mode=resident&tab=map&filter=Saved");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "saved"}
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
                  <ArrowRight className="h-4 w-4" />
                  <span>Reports</span>
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
          </nav>
        </div>
      )}

      <AnimatePresence>
        {urlState.tab === "map" && (
          urlState.mode === "partner"
            ? ["activity", "campaigns", "reports", "info", "civic"].includes(activeBottomTab)
            : ["perks", "events", "saved"].includes(activeBottomTab)
        ) && !selected && (
          <motion.aside
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={`dp-panel-shell dp-map-drawer-shell ${activeBottomTab === "campaigns" ? "dp-map-campaign-drawer" : ""} fixed inset-x-0 bottom-0 z-[620] mx-auto flex max-h-[58vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[2px] p-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:max-h-[64vh] md:rounded-t-2xl md:p-3 md:pb-[calc(0.75rem+env(safe-area-inset-bottom))]`}
            role="dialog"
            aria-modal="true"
            aria-label={urlState.mode === "partner" ? "Partner map results" : "Map results"}
          >
            <div className="dp-panel-handle mx-auto mb-2 h-0.5 w-10 shrink-0 rounded-[2px] bg-[#0B1F33]/14 md:mb-3 md:h-1 md:w-12" aria-hidden="true" />
            <div className="dp-panel-toolbar mb-2 flex shrink-0 items-center justify-end gap-2 md:mb-3 md:gap-3">
              <button
                type="button"
                onClick={() => setActiveBottomTab("map")}
                className="dp-panel-close flex h-8 w-8 rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] md:h-9 md:w-9"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`dp-panel-body dp-panel-scroll min-h-0 ${urlState.mode === "partner" ? "flex-1 overflow-y-auto" : "hidden"}`} data-panel-body>
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

            {urlState.mode !== "partner" && (
            <div className="dp-resident-tab-panel min-h-0 flex-1 overflow-hidden">
              {residentPanelCopy && (
                <section className="dp-resident-tab-panel-header">
                  <p>{residentPanelCopy.eyebrow}</p>
                  <h2>{residentPanelCopy.title}</h2>
                  <span>{residentPanelCopy.body}</span>
                  <strong>{(isResidentSavedDrawer ? residentSavedPlaces : discoverDisplayPlaces).length} places</strong>
                </section>
              )}
              <div className="dp-resident-tab-panel-list min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch] md:space-y-2">
              {drawerPreviewPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectPlace(place)}
                  className={`dp-directory-result-row grid w-full grid-cols-[34px_1fr_auto] items-start gap-2 p-1.5 text-left transition-all md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2 ${
                    place.id === selectedId ? "dp-panel-row is-selected text-[#0B1F33]" : "dp-panel-row text-[#0B1F33]"
                  }`}
                >
                  <PinBadge place={place} selected={place.id === selectedId} />
                  <span className="min-w-0">
                    <span className="dp-directory-context block truncate">{place.category || "Downtown place"}</span>
                    <span className="dp-directory-story block truncate">{place.name}</span>
                    <span className="dp-directory-meaning mt-0.5 block truncate">
                      {place.district ? `${place.district} · ` : ""}{place.perk?.offer || place.recommended_perk || place.partner_opportunity || "Explore what is useful nearby."}
                    </span>
                  </span>
                  <span className="dp-directory-action">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
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
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              </div>
            </div>
            )}
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
            className="dp-panel-shell dp-map-drawer-shell fixed inset-x-0 bottom-0 z-[640] mx-auto flex max-h-[62vh] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[2px] md:max-h-[68vh] md:rounded-t-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Grouped map places"
          >
            <div className="dp-panel-header shrink-0">
              <p className="dp-panel-eyebrow">{urlState.mode === "partner" ? "What's happening nearby" : "Nearby places"}</p>
              <h2 className="dp-panel-title">{getClusterTitle(clusterDrawer, urlState.mode)}</h2>
              <p className="dp-panel-subtitle">{getClusterSubtitle(clusterDrawer, urlState.mode)}</p>
              <button
                type="button"
                onClick={() => {
                  setClusterDrawer(null);
                  setActiveBottomTab("map");
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
                    <span className="dp-grouped-arrow" aria-hidden="true">
                      <ArrowRight className="h-4 w-4" />
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
            className="dp-panel-shell dp-detail-drawer dp-destination-drawer dp-detail-framework dp-map-drawer-panel dp-map-drawer-shell fixed inset-x-0 bottom-0 z-[650] mx-auto flex h-[84vh] max-h-[84vh] min-h-0 w-full max-w-[720px] flex-col overflow-hidden rounded-t-[12px] md:bottom-0 md:h-[88vh] md:max-h-[88vh] md:max-w-[760px] md:rounded-t-[12px]"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} details`}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedId("");
                setActiveBottomTab("map");
                urlState.update({ entityId: "" });
              }}
              className="dp-destination-close dp-drawer-close dp-drawer-close-floating"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="dp-destination-scroll dp-drawer-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(1.25rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] md:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {(() => {
                const entityKind = getResidentEntityKind(selected);
                const legendsListing = getResolvedLegendsListing(selected);
                const isProperty = entityKind === "property" || Boolean(legendsListing || getLuxuryPresenceBuilding(selected));
                const isParking = isParkingEntity(selected);
                const isDaaStop = isDaaTourPlace(selected);
                const isInKindDining = isInKindEntity(selected);
                const contactFormId = `map-contact-form-${selected.id}`;
                const openContactForm = () => {
                  setAgentFormPlaceId(selected.id);
                  setAgentFormSubmitted(false);
                  window.setTimeout(() => {
                    document.getElementById(contactFormId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                  }, 80);
                };

                return (
                  <motion.div className="dp-destination-content dp-detail-content">
                    <DestinationHero place={selected} mode={urlState.mode} />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.18 }}>
                      <PanelContext place={selected} mode={urlState.mode} />
                    </motion.div>
                    {urlState.mode === "partner" && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.18 }}>
                        <PartnerBusinessInsights place={selected} />
                      </motion.div>
                    )}
                    {isProperty && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.18 }}>
                        <LegendsMLSFactsSection place={selected} mode={urlState.mode} onSelect={selectPlace} />
                      </motion.div>
                    )}
                    {urlState.mode === "resident" && isHappyHourEntity(selected) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.18 }}>
                        <HappyHourDetails place={selected} />
                      </motion.div>
                    )}
                    {isParking && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37, duration: 0.18 }}>
                        <ParkingBookingDetails place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}
                    {isInKindDining && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39, duration: 0.18 }}>
                        <InKindDiningDetails
                          place={selected}
                          places={places}
                          mode={urlState.mode}
                          savedIds={savedIds}
                          onSave={() => toggleSaved(selected)}
                          onSelect={selectPlace}
                        />
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
                          <PartnerDrawerActions place={selected} onContact={openContactForm} />
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

                    {!isDaaStop && (
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

                    {((urlState.mode === "resident" && !isHappyHourEntity(selected) && !isParking && !isInKindDining) || isProperty) && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.18 }}>
                        <ResidentPerkDetails place={selected} />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isProperty ? 0.56 : 0.68, duration: 0.18 }}>
                        <KnownForSection place={selected} mode={urlState.mode} />
                      </motion.div>
                    )}

                    {!isDaaStop && urlState.mode === "resident" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isProperty ? 0.59 : 0.72, duration: 0.18 }}>
                        <WhyGoChips place={selected} onAsk={askEntityAssistant} onContact={isProperty ? openContactForm : undefined} />
                      </motion.div>
                    )}

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isProperty ? 0.62 : 0.8, duration: 0.18 }}>
                        <NearbyContext place={selected} places={places} onSelect={selectPlace} mode={urlState.mode} />
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

                    <AnimatePresence initial={false}>
                      {isProperty && !legendsListing && (
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
                                Submit Interest →
                                <Send className="h-3.5 w-3.5 text-[#C8A96A] md:h-4 md:w-4" />
                              </button>
                            </>
                          )}
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {!isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.92, duration: 0.18 }}>
                        <PeopleAlsoVisit place={selected} places={places} onSelect={selectPlace} mode={urlState.mode} />
                      </motion.div>
                    )}
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
