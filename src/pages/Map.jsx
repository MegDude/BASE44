YªçŠx-®éÜj×¢ëiºÚ+Š§j[h‘éÜ¢éíßMµÓ}y÷Íúo+^²‰¢¶×import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PartnerGuide from "@/components/partner/PartnerGuide";
import fortyFourEastHero from "@/assets/map-detail/44-east-ave.jpg";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
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
  House,
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
import ActivePerksSheet from "@/components/map/ActivePerksSheet";
import { NativeDrawerShell } from "@/components/map/NativeDrawerShell";
import BuildingExperienceModule from "@/components/map/BuildingExperienceModule";
import { CanonicalDetailPanel } from "@/components/map/CanonicalDetailPanel";
import { readPartnerWorkspaceOrganizationId, withPartnerWorkspaceContext } from "@/lib/partnerWorkspaceContext";
import { useAuth } from "@/lib/AuthContext";
import { getResidentMembership } from "@/lib/residentMembership/residentMembershipClient";
import { residentAccountFromContext, residentAccountStatus } from "@/lib/residentMembership/residentAccount";
import EntityIdentityPanel from "@/components/map/unified/EntityIdentityPanel";
import MapActionStandardPanel from "@/components/map/MapActionStandardPanel";
import { AppButton } from "@/components/ui/AppButton";
import { useSearchDrivenMapEntities } from "@/hooks/useSearchDrivenMapEntities";
import { useMapPanelNavigation } from "@/hooks/useMapPanelNavigation";
import { useBottomNavigationGeometry } from "@/hooks/useBottomNavigationGeometry";
import { normalizeDrawerState } from "@/lib/map/nativeDrawerState";
import { directionsUrl, campaignRoute, mapRoutes } from "../lib/map/mapActionRegistry";
import { resolveMapEntityAlias, resolveMapEntityFromCollection, resolvePropertyListingUrlId, resolvePropertyUrlEntityId } from "../lib/mapEntityAliases";
import { resolveEntityGallery, resolveEntityImage, resolveMapImage } from "../lib/map/entityImageResolver";
import { resolveEntityPanelArchetype, resolveEntityPanelContent } from "../lib/map/entityPanelArchetypes";
import { resolveEntityPin } from "../lib/map/entityPinResolver";
import { getCanonicalMapGlyph, normalizeMapIconKey } from "../lib/map/mapIconRegistry";
import { formatDistanceLabel, getDistanceMeters, getNearbyRecommendations } from "@/utils/nearbyRecommendations";
import { getRelatedRecommendations } from "@/utils/relatedRecommendations";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { fireWorkflow, getWorkflowProfileId, getWorkflowSessionId, postWorkflow } from "@/lib/backendWorkflows";
import { toggleSavedEntity, useSavedEntitiesRealtime, useSavedStore } from "@/features/resident/saved/savedStore";
import { createResidentQrSession } from "@/features/resident/resident-pass/createQrSession";
import { getDaaCheckIn, recordDaaCheckIn } from "@/lib/daaCheckIns";
import { trackingEvents } from "@/lib/analytics/track";
import { queryAgent } from "@/services/agent/agentClient";
import { legendsListingPlaces } from "@/data/legendsListings";
import { legendsLuxuryPresenceSeoSnapshot } from "@/data/luxuryPresenceSeoSnapshot";
import { luxuryPresenceListings } from "@/data/luxuryPresenceInventory";
import { getLegendsPropertyContent } from "@/data/legendsPropertyContent";
import {
  createGenericLegendsResidentialExperience,
  getLegendsResidentialExperience,
  legendsResidentialAnalytics,
} from "@/data/legendsResidentialExperience";
import { theShoreResidentialBuilding } from "@/data/theShoreResidentialBuilding";
import { brandCampaignExamples, liveCampaignLayerExamples } from "@/data/campaignLayerExamples";
import { getBrandActivationIntelligence, getBrandActivationRoutesForEntity } from "@/data/brandActivationIntelligence";
import { DAA_TOUR_STOP_COUNT, daaArtWalkImages, getDaaTourStopById } from "@/data/daaArtParksTour";
import { hospitalityContentLibraryEntities } from "@/data/hospitalityContentLibrary";
import { residentialMixedUseEntities } from "@/data/residentialMixedUseContentLibrary";
import { DUNLAP_PORTFOLIO_ID, dunlapPortfolioHub } from "@/data/dunlapPortfolio";
import {
  DPParkingReservation,
  DPQuickActions,
  DPPricingRail,
  quickActionsByEntityType,
} from "@/components/downtown-perks/primitives";
import { getGoogleMapsConfigError, loadGoogleMaps } from "@/lib/googleMapsLoader";
import { normalizeLuxuryPresenceSeoSnapshot } from "@/lib/analytics/seoMetrics";
import { clearGoogleMapArtifacts, createDowntownGoogleMap, removeGoogleMapMarker } from "@/map/MapProvider";
import { createDowntownMarker } from "@/map/MarkerManager";
import { createBrandedRoutePolylines } from "@/map/RouteManager";
import {
  getAgentEntityRegistrySnapshot,
  getCanonicalIntentForFilter,
  getViewportBoundedMarkerPlaces,
} from "@/lib/map/intentGovernance";
import { getSearchIntentDefinition, PRIMARY_SEARCH_INTENT_RAIL, SECONDARY_SEARCH_INTENT_RAIL } from "@/components/map/searchIntentRailConfig";
import { parseSearchIntent, searchIntentToFilter } from "@/map/searchIntent/searchIntentParser";
import { RouteExperienceSheet } from "@/components/map/route/RouteExperienceSheet";
import { getMapCollectionById, getMapCollectionForQuery, mapCollections } from "@/data/mapCollections";
import { resolveMapCollectionRoute } from "@/lib/map/collectionRoutes";
import { MAP_DISCOVERY_LIMITS, reconcileMarkerIds } from "@/lib/map/mapDiscovery";
import { createBuildingExperience } from "@/lib/buildingExperienceEngine";

const SEO_NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
const SEO_PERCENT_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});
const SEO_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const LEGENDS_SEO_REPORT = normalizeLuxuryPresenceSeoSnapshot(legendsLuxuryPresenceSeoSnapshot);

function formatSeoNumber(value, fallback = "â€”") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? SEO_NUMBER_FORMATTER.format(number) : fallback;
}

function formatSeoPercent(value) {
  if (value === null || value === undefined) return "Not available";
  const number = Number(value);
  return Number.isFinite(number) ? SEO_PERCENT_FORMATTER.format(number) : "Not available";
}

function formatSeoDate(value) {
  if (!value) return "Snapshot date pending";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Snapshot date pending" : SEO_DATE_FORMATTER.format(date);
}

const RAINEY_STREET_CENTER = [30.25855, -97.73835];
const AUSTIN_CENTER = RAINEY_STREET_CENTER;
const INITIAL_MAP_ZOOM = 16.8;
const SELECTED_ROUTE_INITIAL_MAX_ZOOM = 16.4;
const MAP_MAX_ZOOM = 22;
const MAP_STREET_FOCUS_ZOOM = 21;
const INITIAL_DISCOVERY_MARKER_LIMIT = 10;
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
  "Performance",
  "Audience",
  "Opportunity",
  "Reports",
  "inKind",
]);
const SINGLE_SELECT_SEARCH_INTENT_FILTERS = new Set([
  "All",
  "Coffee",
  "Dining",
  "Happy Hour",
  "Happy Hours",
  "Events",
  "Hotels",
  "Properties",
  "Nightlife",
  "Wellness",
  "Fitness",
  "Retail",
  "Shopping",
  "Civic",
  "Arts & Culture",
  "Public Art",
  "Services",
]);
const MAP_VIEW_STORAGE_KEY = "downtown-perks-map-view-v1";
const MAP_USER_NAVIGATED_STORAGE_KEY = "downtown-perks-map-user-navigated-v1";
const MAP_USER_CONTEXT_STORAGE_KEY = "downtown-perks-map-user-context-v1";
const MAP_PANEL_IMAGE_FALLBACK = "/images/fallbacks/brand.jpg";
const STREET_LEVEL_ZOOM = 17.75;
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
const LEGENDS_PIN_LOGO = "/pins/downtown-perks/legends-logo.png";
const LEGENDS_PIN_ALT = "Legends Real Estate logo";
const MAP_DRAWER_SURFACE_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.97)",
  backgroundImage: "none",
  border: "1px solid rgba(11, 31, 51, 0.09)",
  borderBottom: 0,
  borderRadius: "16px 16px 0 0",
  boxShadow: "0 -10px 30px rgba(11, 31, 51, 0.10)",
  color: "#0B1F33",
  WebkitTextFillColor: "#0B1F33",
  WebkitBackdropFilter: "blur(14px) saturate(120%)",
  backdropFilter: "blur(14px) saturate(120%)",
};
const FILTERS = [
  "All",
  "Featured",
  "Saved",
  "Nearby",
  "Open Now",
  "Tonight",
  "Walkable",
  "This Week",
  "Perks",
  "Events",
  "Campaigns",
  "Performance",
  "Audience",
  "Opportunity",
  "Reports",
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

const PASEO_ATX_MAP_COPY = {
  name: "Paseo ATX",
  partnerName: "Paseo",
  eyebrow: "Your building Â· Rainey District",
  subtitle: "Luxury residential Â· Rainey District",
  context: "Paseo places residents at the center of Rainey, with nearby access to restaurants, hotels, events, wellness, coffee, and resident offers through Downtown Perks.",
  perkTitle: "Paseo resident access",
  perkValue: "Your building experience, extended into downtown.",
  perkDescription: "Downtown Perks helps Paseo residents discover nearby places, resident offers, events, hospitality access, directions, and local experiences from one map.",
  perkTerms: "Livly supports life inside Paseo. Downtown Perks helps residents experience everything around it.",
  whyHeading: "Why living here works",
  whyBody: "Paseo connects elevated residential living with direct access to the energy, hospitality, and culture of Downtown Austin.",
  insight: "Use Downtown Perks to explore what is happening beyond the building without adding another building-management workflow.",
};

function isPaseoResidentialProperty(place) {
  const raw = place?.raw || {};
  const text = [
    place?.id,
    place?.slug,
    place?.name,
    place?.title,
    place?.address,
    place?.buildingName,
    place?.building_name,
    raw.id,
    raw.slug,
    raw.name,
    raw.title,
    raw.address,
    raw.buildingName,
    raw.building_name,
    raw.panelContent?.title,
  ].filter(Boolean).join(" ").toLowerCase();
  return /\bpaseo\b/.test(text) || /\bmodern\s+austin\s+residences\b/.test(text) || /\b90\s*,?\s*rainey\b/.test(text);
}

function getPaseoDisplayName(place) {
  return isPaseoResidentialProperty(place) ? PASEO_ATX_MAP_COPY.name : place?.name || place?.title || "Downtown residence";
}

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
    .replace(/[,\-â€“â€”:;]+$/, "")
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
  "Show campaign ideas",
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
  "Whatâ€™s happening tonight?",
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
  { id: "events", label: "Events", prompt: "Whatâ€™s happening tonight?", icon: CalendarDays },
  { id: "quiet-work", label: "Quiet Work", prompt: "Quiet work nearby", icon: BriefcaseBusiness },
  { id: "late-night", label: "Late Night", prompt: "Late night nearby", icon: Moon },
];

const RESIDENT_INTENT_TIME_BUTTONS = [
  { id: "now", label: "Now", prompt: "Open now nearby" },
  { id: "tonight", label: "Tonight", prompt: "Whatâ€™s worth walking to tonight?" },
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
  { id: "explore-downtown", label: "Downtown", icon: Landmark, kind: "filter", filter: "Explore Downtown", prompt: "What is worth seeing today?" },
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
      { label: "Downtown", filter: "Explore Downtown", icon: Compass, prompt: "Show me public art nearby" },
      { label: "Trails", filter: "Discovery Trails", icon: Compass, prompt: "See Austin Differently" },
      { label: "Coffee", filter: "Coffee", icon: Coffee, prompt: "Coffee within walking distance" },
      { label: "Art Walk", filter: "Civic", collection: "daa-art-walk", icon: Landmark, prompt: "DAA Art Walk walking route" },
      { label: "Parking", filter: "Parking", icon: Car, prompt: "Parking nearby" },
      { label: "Rentals", filter: "Rentals", icon: Building2, prompt: "Downtown apartments nearby" },
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
      { id: "performance", label: "Performance", filter: "Performance", icon: Activity, prompt: "Compare campaign performance" },
      { id: "campaigns", label: "Campaigns", filter: "Campaigns", icon: Megaphone, prompt: "What campaign should I launch?" },
      { id: "trails", label: "Trails", filter: "Discovery Trails", icon: Compass, prompt: "Show discovery trail placements" },
      { id: "audience", label: "Interest", filter: "Audience", icon: Users, prompt: "Show nearby resident interest" },
      { id: "activation", label: "Campaigns", filter: "Opportunity", icon: Sparkles, prompt: "Show campaign ideas" },
      { id: "insights", label: "Insights", filter: "Reports", icon: TrendingUp, prompt: "What is trending nearby?" },
      { id: "parking", label: "Parking", filter: "Parking", icon: Car, prompt: "Parking nearby" },
    ],
    filterRail: [
      { id: "perks", label: "Perks", kind: "filter", filter: "Perks", prompt: "Perk performance nearby" },
      { id: "events", label: "Events", kind: "filter", filter: "Events", prompt: "Event sponsorship opportunities" },
      { id: "properties", label: "Residential", kind: "filter", filter: "Properties", prompt: "Nearby resident interest" },
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
  { intent: "performance", filter: "Performance", tokens: ["performing", "performance", "reports", "view reports", "what changed"] },
  { intent: "opportunity", filter: "Opportunity", tokens: ["opportunity", "campaign opportunities", "coverage", "coverage gaps", "low coverage", "what should we launch", "what should we share", "launch next"] },
  { intent: "campaigns", filter: "Campaigns", tokens: ["campaign", "campaigns", "placements"] },
  { intent: "activation", filter: "Brand Activations", tokens: ["activation", "activations", "sponsorship", "promotion"] },
  { intent: "insights", filter: "Reports", tokens: ["insights", "trending", "what is changing", "what is next"] },
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
const RESIDENT_CARD_ENTITY = {
  id: "resident-card",
  name: "Downtown Perks Card",
  type: "card",
  category: "Resident Card",
  district: "Downtown Austin",
  summary: "Verified resident access for eligible perks, offers, and event access.",
  raw: { type: "card", category: "Resident Card" },
};

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

function buildResidentQrPayload({ place, action = "show_card", source = "resident_map", residentAccount = null } = {}) {
  const uid = residentAccount?.id || getResidentProfileUid();
  const entityId = getEntityTouchpointId(place);
  const entityName = getEntityTouchpointName(place);
  const perk = getResidentQrPerkCopy(place);
  const sessionId = getWorkflowSessionId();
  const cardId = `card-${uid}`;
  const cardNumber = `DP-${String(uid).replace(/^profile-/, "").slice(0, 8).toUpperCase() || "78701"}`;
  const issuedAt = new Date().toISOString();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : LIVE_CARD_URL;
  const qrUrl = new URL("/card", baseUrl);
  qrUrl.searchParams.set("residentUid", uid);
  qrUrl.searchParams.set("cardId", cardId);
  qrUrl.searchParams.set("touchpoint", action);
  qrUrl.searchParams.set("entityId", entityId);

  return {
    type: "downtown_perks.resident_qr",
    version: 1,
    uid,
    residentId: uid,
    profileId: uid,
    cardId,
    cardNumber,
    cardStatus: "active",
    residentName: residentAccount?.fullName || "Downtown Perks resident",
    residentEmail: residentAccount?.email || "",
    buildingName: residentAccount?.buildingName || residentAccount?.buildingDistrict || "Downtown Austin",
    membershipStatus: residentAccountStatus(residentAccount),
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
    entityType: event.action === "use_perk" ? "perk" : "card",
    profileId: event.uid,
    sessionId: event.sessionId,
    sourceType: "resident_card",
    value: 1,
    metadata: event,
  });
  fireWorkflow("/api/resident-card/events", {
    type: "resident_card_shown",
    residentId: event.residentId || event.uid,
    profileId: event.profileId || event.uid,
    cardId: event.cardId,
    cardNumber: event.cardNumber,
    source: event.source || "resident_map",
    entityType: event.action === "use_perk" ? "perk" : "card",
    entityId: event.entityId,
    partnerId: event.partnerId || event.entityId,
    sessionId: event.sessionId,
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
  ["Banger's Sausage House & Beer Garden", ["banger", "bangerâ€™s", "banger's", "banger's sausage house", "banger's sausage house & beer garden"], "Beer garden and live energy nearby", "Drinks nearby", "The Banger's perk gives residents beer garden value tied to outdoor gatherings, live music energy, and easy Rainey-area group plans.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["The Stay Put", ["stay put", "the stay put"], "Free house brew with Resident Pass", "Resident drink offer", "The Stay Put perk gives residents a free house brew as a simple nearby drink offer around Rainey.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["Lustre Pearl", ["lustre pearl"], "Happy Hour pricing for residents anytime", "Resident drink offer", "The Lustre Pearl perk gives residents happy hour pricing anytime, turning a familiar Rainey stop into an easier-value drink plan.", "Show the Resident Pass when the offer is active.", "Drinks"],
  ["Half Step", ["half step"], "Cocktails around the corner", "Drinks nearby", "The Half Step perk highlights resident cocktail access around a craft cocktail stop close to Rainey Street.", "Save it and show Resident Pass when active.", "Drinks"],
  ["BATHE", ["bathe"], "10% Off First Soak", "Wellness perk", "The BATHE perk gives residents 10% off a first soak across sauna, cold plunge, soaking pools, massage, sound immersion, and coworking.", "Claim the wellness perk and confirm availability before visiting.", "Wellness"],
  ["YETI", ["yeti"], "Free Custom Engraving For Verified Residents", "Retail resident offer", "The YETI perk gives verified residents free custom engraving in-store, tied to downtown routes, lake days, and weekend plans.", "Show the Resident Pass in-store when the offer is active.", "Retail"],
  ["Rivian", ["rivian"], "Priority Test Drives & Resident Charging Perks", "Mobility resident offer", "The Rivian perk gives residents priority test-drive access and charging-perk context for weekend routes and local exploration.", "Save it and open the partner drawer for current test-drive details.", "Mobility"],
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
        ? [rental.priceLabel, rental.beds ? `${rental.beds} bd` : "", rental.baths ? `${rental.baths} ba` : "", rental.sqft ? `${Number(rental.sqft).toLocaleString()} sqft` : ""].filter(Boolean).join(" Â· ")
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
    ? "Residential opportunity"
    : isInKindPartner(place)
      ? "Dining opportunity"
      : isCampaignEntity(place)
        ? "Campaign on the map"
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
  if (isDefaultDiscoverScope) return INITIAL_DISCOVERY_MARKER_LIMIT;
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
  intent,
  mode,
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

function getCanonicalDetailEntityType(place, hasPerkContext = false) {
  const explicit = String(place?.detailEntityType || place?.raw?.detailEntityType || "").toLowerCase();
  const directType = String(place?.entityType || place?.kind || place?.type || "").toLowerCase();
  if (["perk", "campaign", "collection", "event", "route", "amenity", "venue", "property", "hotel", "brand", "civic", "portfolio"].includes(explicit)) return explicit;
  if (directType === "portfolio") return "portfolio";
  if (hasPerkContext && hasActivePerkData(place)) return "perk";
  if (isCampaignEntity(place)) return "campaign";
  if (isEventEntity(place)) return "event";
  if (isPropertyEntity(place)) return "property";
  if (isHotelEntity(place)) return "hotel";
  if (isBrandEntity(place)) return "brand";
  if (isDaaTourPlace(place) || isCivicEntity(place)) return "civic";
  if (isVenueEntity(place)) return "venue";
  return hasActivePerkData(place) ? "perk" : "venue";
}

function getMapDrawerPanelKind(place, mode = "resident", hasPerkContext = false) {
  if (!place) return "destination";
  const canonicalType = getCanonicalDetailEntityType(place, hasPerkContext);
  if (["perk", "event", "campaign", "collection", "route", "amenity", "portfolio"].includes(canonicalType)) return canonicalType;
  const entityKind = getResidentEntityKind(place);
  if (isInKindEntity(place) && !isInKindNetworkEntity(place)) return mode === "partner" ? "partner-opportunity" : "place";
  if (isHospitalityNetworkEntity(place)) return place?.kind === "hospitality-offer" ? "perk" : "place";
  if (isNeighborhoodEntity(place)) return "place";
  if (isDaaTourPlace(place) || entityKind === "civic" || entityKind === "landmark") return "civic";
  if (isCampaignEntity(place) || entityKind === "campaign") return "campaign";
  if (entityKind === "event" || getDestinationKind(place) === "event") return "event";
  if (entityKind === "property" || entityKind === "rental" || isRentalEntity(place) || isLegendsMapPlace(place) || isLegendsListingLike(place)) return "residential";
  if (mode === "partner") return "destination";
  if (entityKind === "place" || entityKind === "civic" || entityKind === "service") return "place";
  return "destination";
}

function isHospitalityNetworkEntity(place) {
  const id = String(place?.id || place?.raw?.id || "");
  const source = String(place?.source || place?.raw?.source || "");
  return String(place?.amenityNetwork || place?.raw?.amenityNetwork || "") === "downtown-hospitality" || id.startsWith("hospitality-") || ["brand-hotel-van-zandt", "brand-fairmont-austin", "hotel-van-zandt"].includes(id) || source.includes("canonical hospitality content library");
}

function isCanonicalResidentialMixedUseEntity(place) {
  return String(place?.residentialContentSystem || place?.raw?.residentialContentSystem || "") === "canonical-residential-mixed-use" || residentialMixedUseEntities.some((entity) => entity.id === place?.id);
}

function shouldSurfaceHospitalityChild(place, activeFilter, query = "") {
  if (!isHospitalityNetworkEntity(place) || !(place?.parentHotelId || place?.raw?.parentHotelId)) return true;
  if (["Perks", "Hotels"].includes(activeFilter)) return place?.offerState !== "expired";
  const search = String(query || "").toLowerCase();
  if (!search) return false;
  return /hotel offers?|resident rates?|staycation|rooftop pools?|pet.?friendly|group trips?|bachelor|bachelorette|suite packages?|parking included|breakfast included|government travel|convention hotels?|pool cabanas?|fairmont gold|rainey hotels?|convention core hotels?/.test(search) && place?.offerState !== "expired";
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

function isInKindNetworkEntity(place) {
  const id = String(place?.id || place?.entityId || place?.raw?.id || "").toLowerCase();
  const type = String(place?.type || place?.raw?.type || "").toLowerCase();
  const text = placeText(place);
  return id === "inkind-downtown-dining-market" || (type === "brand" && /\binkind\b/.test(text) && /\b(network|market|partner layer)\b/.test(text));
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

function getCanonicalSearchIntentFilter(filter = "All") {
  const normalized = String(filter || "All").trim().toLowerCase();
  if (!normalized || normalized === "all") return "All";
  if (normalized === "happy hours" || normalized === "happy_hour" || normalized === "happy-hour") return "Happy Hour";
  if (normalized === "shopping" || normalized === "shop" || normalized === "retail") return "Retail";
  if (normalized === "arts" || normalized === "arts & culture" || normalized === "public art" || normalized === "daa" || normalized === "dana") return "Civic";
  if (normalized === "drinks" || normalized === "cocktails" || normalized === "late night") return "Nightlife";
  return String(filter || "All").trim();
}

function getMapEntityIntentTags(place) {
  const explicitTags = [
    ...(Array.isArray(place?.intentTags) ? place.intentTags : []),
    ...(Array.isArray(place?.raw?.intentTags) ? place.raw.intentTags : []),
  ].map(getCanonicalSearchIntentFilter).filter(Boolean);
  const tags = new Set(explicitTags);
  const text = placeText(place);
  const intentText = placeIntentText(place);
  const combinedText = `${text} ${intentText}`;
  const kind = String(getDestinationKind(place) || "").toLowerCase();
  const rawKind = String(place?.kind || place?.type || place?.raw?.kind || place?.raw?.type || "").toLowerCase();

  if (isCoffeeEntity(place)) tags.add("Coffee");
  if ((isDiningEntity(place) && !isCoffeeEntity(place)) || (isCampaignEntity(place) && /\b(dining|dinner|restaurant|sushi|brunch|passport)\b/i.test(intentText)) || (hasActivePerkData(place) && isDiningEntity(place) && !isCoffeeEntity(place))) {
    tags.add("Dining");
  }
  if (isHappyHourEntity(place) || /\b(happy hour|happy-hour|happy_hour)\b/i.test(combinedText)) tags.add("Happy Hour");
  if (isEventEntity(place)) tags.add("Events");
  if (isHotelEntity(place)) tags.add("Hotels");
  if (isLivingEntity(place)) tags.add("Properties");
  if (
    !isCoffeeEntity(place) &&
    !isHotelEntity(place) &&
    !isPropertyEntity(place) &&
    (isDrinksEntity(place) || coreMatches(place, FILTER_MATCHERS.Nightlife) || /\b(nightlife|late night|cocktail|bar|wine|beer|rooftop)\b/i.test(combinedText))
  ) {
    tags.add("Nightlife");
  }
  if (coreMatches(place, FILTER_MATCHERS.Wellness) || rawKind === "wellness" || kind === "wellness") tags.add("Wellness");
  if (coreMatches(place, FILTER_MATCHERS.Fitness) || rawKind === "fitness" || kind === "fitness") tags.add("Fitness");
  if (isRetailBrandEntity(place) || isBrandEntity(place) || coreMatches(place, FILTER_MATCHERS.Markets) || /\b(retail|shop|shopping|store|fashion|boutique)\b/i.test(combinedText)) {
    tags.add("Retail");
  }
  if (isCivicEntity(place) || isExploreDowntownEntity(place) || getDaaStopFromPlace(place)) tags.add("Civic");
  if (isServiceEntity(place) || isUtilityServiceEntity(place)) tags.add("Services");
  return Array.from(tags);
}

function entityMatchesSearchIntent(place, activeFilter) {
  const canonicalFilter = getCanonicalSearchIntentFilter(activeFilter);
  if (canonicalFilter === "All") return !isSearchOnlyRuntimeUtility(place) || hasActivePerkData(place);
  if (!SINGLE_SELECT_SEARCH_INTENT_FILTERS.has(canonicalFilter)) return null;
  return getMapEntityIntentTags(place).includes(canonicalFilter);
}

function isSingleSelectSearchIntentFilter(filter) {
  return SINGLE_SELECT_SEARCH_INTENT_FILTERS.has(getCanonicalSearchIntentFilter(filter));
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
  const intentMatch = entityMatchesSearchIntent(place, activeFilter);
  if (intentMatch !== null) return intentMatch;
  if (["Open Now", "Tonight", "This Week", "Scans", "Saves", "Redemptions", "Opportunities", "Performance", "Opportunity", "Coverage", "Audience", "Stories", "Surveys", "Broadcasts", "Activations"].includes(activeFilter)) return true;
  if (activeFilter === "Saved") return savedIds.has(place.id);
  if (activeFilter === "Featured") return !isSearchOnlyRuntimeUtility(place);
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
    collections: isCivicFilter ? ["Downtown Stories Walk"] : isDiningFilter ? ["Best Sushi Downtown", "Dinner Tonight"] : isInKindFilter ? ["Date Night Downtown", "Brunch Collection"] : [],
    campaigns: isCivicFilter ? [] : isDiningFilter ? ["Downtown Sushi Week", "Resident Dining Week"] : isInKindFilter ? ["Downtown Sushi Passport", "Restaurant Week"] : [],
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
    ? ["Downtown Stories Walk"]
    : isDiningResponse
      ? ["Dinner Tonight", "Best Sushi Downtown"]
      : isResidentialResponse
        ? ["Luxury Living"]
        : ["Downtown Picks"];
  const fallbackCampaigns = isCivicResponse
    ? []
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
    campaigns: isCivicResponse ? fallbackCampaigns : Array.isArray(agentAnswer.campaigns) && agentAnswer.campaigns.length ? agentAnswer.campaigns.slice(0, 3) : fallbackCampaigns,
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

function isLegendsTopListingPlace(place) {
  const raw = place?.raw || {};
  const listing = getLegendsListing(place);
  return Boolean(
    place?.legendsTopListing ||
    raw?.legendsTopListing ||
    listing?.isTopListing ||
    listing?.topListingRank,
  );
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

function resolveListingEntityFromCollection(listingId, entities = []) {
  const raw = String(listingId || "").trim();
  if (!raw) return null;
  const normalized = normalizePanelImageText(raw);
  const compact = normalized.replace(/\b(unit|apt|suite)\b/g, "").replace(/\s+/g, " ").trim();
  return entities.find((entity) => {
    const listing = getLegendsListing(entity);
    const candidates = [
      entity?.id,
      entity?.entityId,
      entity?.slug,
      entity?.raw?.id,
      entity?.raw?.entityId,
      entity?.raw?.slug,
      entity?.name,
      entity?.address,
      listing?.id,
      listing?.listingId,
      listing?.address,
      listing?.unit ? `${listing?.buildingName || ""} ${listing.unit}` : "",
      listing?.unit ? `${entity?.address || entity?.name || ""} ${listing.unit}` : "",
    ].filter(Boolean);
    return candidates.some((value) => {
      const candidate = normalizePanelImageText(value);
      const candidateCompact = candidate.replace(/\b(unit|apt|suite)\b/g, "").replace(/\s+/g, " ").trim();
      return candidate === normalized || candidateCompact === compact || candidate.includes(compact) || compact.includes(candidateCompact);
    });
  }) || resolveMapEntityFromCollection(raw, entities);
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
  if (isLegendsTopListingPlace(place)) return false;
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
  if (isLegendsTopListingPlace(place)) return true;
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
  ].filter(Boolean).join(" Â· ");

  return `Want to live here? ${details ? `${details}. ` : ""}See the listing details, compare what is walkable nearby, and contact Legends Real Estate for availability, showing options, and resident access to properties that may not always appear on other listing sites.`;
}

function getPanelMetaLine(place) {
  if (isRentalEntity(place)) {
    return `Rental Â· ${place?.district || "Downtown Austin"}`;
  }
  if (isAntonesEntity(place)) {
    return "Venue Â· East Downtown";
  }
  const listing = getLegendsListing(place);
  if (listing) {
    return `${isLegendsTopListingPlace(place) ? "Legends Top Listing" : getCanonicalCategoryLabel(place)} Â· ${place?.district || "Downtown Austin"}`;
  }
  const luxuryBuilding = getLuxuryPresenceBuilding(place);
  if (luxuryBuilding) {
    return `${getCanonicalCategoryLabel(place)} Â· ${place?.district || "Downtown Austin"}`;
  }
  return `${getCanonicalCategoryLabel(place)} Â· ${place?.district || "Downtown Austin"}`;
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
  const panelTypeLabel = `${panelContent.eyebrow || panelArchetype.eyebrow} Â· ${district}`;
  const panelTitle = panelContent.title || place?.name || place?.title || "Downtown destination";
  const panelSubtitle = panelContent.subtitle || [getCanonicalCategoryLabel(place), address || district].filter(Boolean).join(" Â· ");
  const panelContext = panelContent.context || context;

  if (isBurgerBarCongress(place)) {
    return {
      id: place?.id,
      entityType: mode === "partner" ? "opportunity" : "perk",
      displayTypeLabel: `${mode === "partner" ? "Dining opportunity" : "Resident dining"} Â· Congress Avenue`,
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
      displayTypeLabel: `Parking opportunity Â· ${district}`,
      displayTitle: place?.name || "Parking opportunity",
      displaySubtitle: copy.value || "Parking people can reserve",
      displayContext: truncatePanelCopy(copy.description || context, 130),
      address,
      neighborhood: district,
      categoryLabel: "Parking opportunity",
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
    ].filter(Boolean).join(" Â· ");
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} Â· ${district}`,
      displayTitle: place?.name || rental.building || "Downtown rental",
      displaySubtitle: facts || [district, address].filter(Boolean).join(" Â· "),
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
      displayTypeLabel: `${panelArchetype.eyebrow} Â· ${district}`,
      displayTitle: place?.name || legendsListing.address || "Downtown residence",
      displaySubtitle: facts || [district, address].filter(Boolean).join(" Â· "),
      displayContext: context,
      address,
      neighborhood: district,
      categoryLabel: panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (luxuryBuilding || kind === "property") {
    const isPaseo = isPaseoResidentialProperty(place);
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: isPaseo ? PASEO_ATX_MAP_COPY.eyebrow : `${panelArchetype.eyebrow} Â· ${district}`,
      displayTitle: isPaseo ? PASEO_ATX_MAP_COPY.name : place?.name || "Downtown residence",
      displaySubtitle: isPaseo ? PASEO_ATX_MAP_COPY.subtitle : [district, address].filter(Boolean).join(" Â· "),
      displayContext: isPaseo ? truncatePanelCopy(PASEO_ATX_MAP_COPY.context, 130) : context,
      address,
      neighborhood: district,
      categoryLabel: isPaseo ? "Paseo resident partner" : panelArchetype.eyebrow,
      panelArchetype,
    };
  }

  if (isAntonesEntity(place)) {
    return {
      id: place?.id,
      entityType: panelArchetype.id,
      displayTypeLabel: `${panelArchetype.eyebrow} Â· East Downtown`,
      displayTitle: "Antone's Nightclub",
      displaySubtitle: "Live Music Â· Nightlife",
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
      displayTypeLabel: `Downtown Partner Â· ${district || "Congress Avenue"}`,
      displayTitle: "Frost Tower",
      displaySubtitle: "Congress Avenue Â· Premium Workplace",
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
      displayTypeLabel: `${panelArchetype.eyebrow} Â· ${district}`,
      displayTitle: place?.name || place?.title || "Downtown campaign",
      displaySubtitle: partnerLine ? `Partner: ${partnerLine}` : [district, address].filter(Boolean).join(" Â· "),
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
      displayTypeLabel: `${mode === "partner" ? "Dining opportunity" : "Resident Perk"} Â· ${district}`,
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
      displayTypeLabel: `Retail Â· ${district}`,
      displayTitle: place?.name || place?.title || panelTitle || "Downtown retail",
      displaySubtitle: offerTitle || [panelSubtitle || getCanonicalCategoryLabel(place), address || district].filter(Boolean).join(" Â· "),
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
        displayTypeLabel: `${copy.category} Â· ${district}`,
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
      displayTypeLabel: mode === "partner" ? `${copy.category || "Brand activation"} Â· ${district}` : panelTypeLabel,
      displayTitle: panelTitle,
      displaySubtitle: mode === "partner" ? (copy.placement || panelSubtitle) : [panelSubtitle, hasActivePerkData(place) ? "Resident offer" : ""].filter(Boolean).join(" Â· "),
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
      displayTypeLabel: `${panelContent.eyebrow || panelArchetype.eyebrow} Â· ${timeContext || district}`,
      displayTitle: panelTitle,
      displaySubtitle: [timeContext, district].filter(Boolean).join(" Â· "),
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
      displaySubtitle: panelSubtitle || (address ? `${district} Â· ${address}` : district),
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
  if (Array.isArray(place?.coords) && place.coords.length >= 2) {
    const lat = Number(place.coords[0]);
    const lng = Number(place.coords[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }
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
  const pinSize = 32;
  const clusterBase = clusterCount > 49 ? 42 : clusterCount > 9 ? 36 : 30;
  const clusterSize = getZoomScaledMarkerSize(zoom, clusterBase);
  return {
    pinSize,
    pinIconSize: 15,
    legendsLogoSize: 28,
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

function getStableMarkerZoom(zoom = INITIAL_MAP_ZOOM) {
  const numericZoom = Number(zoom);
  if (!Number.isFinite(numericZoom)) return INITIAL_MAP_ZOOM;
  return Math.max(13, Math.min(MAP_MAX_ZOOM, Math.round(numericZoom * 2) / 2));
}

function getBoundsCenter(bounds = null) {
  if (!bounds) return null;
  if (bounds.center?.lat !== undefined && bounds.center?.lng !== undefined) return bounds.center;
  const north = Number(bounds.north);
  const south = Number(bounds.south);
  const east = Number(bounds.east);
  const west = Number(bounds.west);
  if (![north, south, east, west].every(Number.isFinite)) return null;
  return { lat: (north + south) / 2, lng: (east + west) / 2 };
}

function getBoundsOverlapRatio(previousBounds = null, nextBounds = null) {
  if (!previousBounds || !nextBounds) return 1;
  const west = Math.max(Number(previousBounds.west), Number(nextBounds.west));
  const east = Math.min(Number(previousBounds.east), Number(nextBounds.east));
  const south = Math.max(Number(previousBounds.south), Number(nextBounds.south));
  const north = Math.min(Number(previousBounds.north), Number(nextBounds.north));
  const intersection = Math.max(0, east - west) * Math.max(0, north - south);
  const previousArea = Math.max(0, Number(previousBounds.east) - Number(previousBounds.west)) * Math.max(0, Number(previousBounds.north) - Number(previousBounds.south));
  const nextArea = Math.max(0, Number(nextBounds.east) - Number(nextBounds.west)) * Math.max(0, Number(nextBounds.north) - Number(nextBounds.south));
  const denominator = Math.min(previousArea, nextArea);
  return denominator > 0 ? intersection / denominator : 1;
}

function hasMeaningfulBoundsChange(previousBounds = null, nextBounds = null) {
  if (!previousBounds || !nextBounds) return false;
  const previousCenter = getBoundsCenter(previousBounds);
  const nextCenter = getBoundsCenter(nextBounds);
  const latSpan = Math.max(0.00001, Math.abs(Number(previousBounds.north) - Number(previousBounds.south)));
  const lngSpan = Math.max(0.00001, Math.abs(Number(previousBounds.east) - Number(previousBounds.west)));
  const centerShiftRatio = previousCenter && nextCenter
    ? Math.max(Math.abs(nextCenter.lat - previousCenter.lat) / latSpan, Math.abs(nextCenter.lng - previousCenter.lng) / lngSpan)
    : 0;
  const zoomDelta = Math.abs(Number(nextBounds.zoom || 0) - Number(previousBounds.zoom || 0));
  return centerShiftRatio > 0.2 || zoomDelta >= 1 || getBoundsOverlapRatio(previousBounds, nextBounds) < 0.6;
}

function mapPinButtonHtml({ place, pin, ariaLabel, selected, pulsing, classes, zoom = INITIAL_MAP_ZOOM }) {
  const escapedId = escapeHtmlAttribute(place.id);
  const escapedLabel = escapeHtmlAttribute(ariaLabel);
  const pinLabel = escapeHtmlAttribute(pin.label);
  const iconKey = normalizeMapIconKey(pin.label);
  const kind = escapeHtmlAttribute(iconKey);
  const activeClass = selected ? "is-selected is-active" : "";
  const pulseClass = pulsing ? "is-pulsing" : "";
  const iconSvg = getCanonicalMapGlyph(pin);

  const zoomStyle = zoomMarkerStyleAttribute(zoom, { selected });
  const buttonHtml = `<button type="button" class="dp-map-pin dp-map-pin--${kind} ${classes} ${activeClass} ${pulseClass}" style="${zoomStyle}" data-entity-id="${escapedId}" data-kind="${kind}" data-pin-label="${pinLabel}" aria-label="${escapedLabel}" data-active="${selected ? "true" : "false"}"><span class="dp-map-pin__icon" aria-hidden="true">${iconSvg}</span></button>`;
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

function mapIconSvgInner(glyph) {
  return String(glyph || "").match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1] || "";
}

const DOWNTOWN_PERKS_GOOGLE_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.55 }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.8 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#BFA46A" }, { weight: 0.55 }, { visibility: "simplified" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.55 }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.fill", stylers: [{ color: "#0B1F33" }, { weight: 0.68 }] },
  { featureType: "administrative.neighborhood", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 2 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#F7F8FB" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#EEF2F6" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#132238" }, { weight: 0.48 }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.8 }] },
  { featureType: "poi.attraction", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi.business", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E8F0EA" }, { saturation: -16 }, { lightness: 6 }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#132238" }, { weight: 0.55 }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.9 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#DDE4EA" }, { weight: 0.65 }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#334155" }, { weight: 0.45 }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }, { weight: 1.7 }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#F7F8FB" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#A98B4A" }, { weight: 0.85 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.local", elementType: "geometry.stroke", stylers: [{ color: "#E8EDF2" }, { weight: 0.5 }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#E2E7EE" }, { saturation: -60 }, { lightness: 18 }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#132238" }] },
  { featureType: "transit.station", elementType: "labels.icon", stylers: [{ visibility: "on" }] },
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
  const size = getZoomMarkerMetrics(zoom, { selected }).pinSize;
  const stopNumber = Number(place?.routeStopNumber || 0);
  const pin = resolveEntityPin(place);
  const paths = mapIconSvgInner(getCanonicalMapGlyph(pin));
  const fill = selected ? "#C8A96A" : "#0B1F33";
  const stroke = selected ? "#0B1F33" : "#C8A96A";
  const iconColor = selected ? "#0B1F33" : "#C8A96A";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${fill}" stroke="${stroke}" stroke-width="1.25"/>
      <g transform="translate(7 7) scale(.75)" color="${iconColor}" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</g>
      ${stopNumber ? `<text x="28" y="8" dominant-baseline="middle" text-anchor="middle" paint-order="stroke" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" font-family="Inter, Arial, sans-serif" font-size="8" font-weight="800" fill="#0B1F33">${Math.min(stopNumber, 9)}</text>` : ""}
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
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#0B1F33"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${size * 0.36}" font-weight="600" fill="#FFFFFF">${label}</text>
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
  const mainColor = theme === "emerald" ? "#0B3E31" : theme === "navy" ? "#0B1F33" : "#BFA46A";
  const dotColor = theme === "navy" ? "#BFA46A" : theme === "emerald" ? "#FFFFFF" : "#0B1F33";
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

function getClusterCellSize(zoom) {
  if (zoom >= 19) return 0.00006;
  if (zoom >= 18) return 0.0001;
  if (zoom >= 17) return 0.00016;
  if (zoom >= 16.5) return 0.00024;
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
  const count = cluster.places?.length || 0;
  if (cluster?.groupType === "building") {
    return `${count} ${count === 1 ? "listing" : "listings"} Â· Tap one to see details`;
  }

  return `${count} ${count === 1 ? "result" : "results"} Â· Tap one to see details`;
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
      <span dangerouslySetInnerHTML={{ __html: getCanonicalMapGlyph(pin) }} />
    </span>
  );
}

function DemoQrTile({ code = "DP-RES-78701" }) {
  return (
    <div className="dp-info-row bg-white/72 p-2">
      <DemoQrCode code={code} className="mx-auto h-28 w-28" />
      <code className="mt-1.5 block text-center font-mono text-[9px] font-semibold tracking-[0.1em] text-[#BFA46A]">
        {code}
      </code>
    </div>
  );
}

function DemoQrCode({ code = DEMO_CARD_CODE, className = "", alt = "" }) {
  return (
    <img
      src={getQrImageUrl(code)}
      alt={alt || `Downtown Perks resident QR code for ${code}`}
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
  const title = data.perkTitle || (data.action === "use_perk" ? `${placeName} resident perk` : "Downtown Perks Card");
  const value = data.perkValue && data.perkValue !== title ? data.perkValue : "";
  const description = isPerkRedemption
    ? "Ask the partner to scan this code to apply your perk."
    : "Show this code to use eligible resident perks, offers, and event access.";
  const terms = data.perkTerms || "";
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  const validityLabel = redemptionStatus === "redeemed"
    ? "Redeemed"
    : redemptionStatus === "expired"
      ? "Expired"
      : redemptionStatus === "unavailable"
        ? "Currently unavailable"
        : "Ready to scan";
  const valueLine = isPerkRedemption
    ? [placeName, value && value.toLowerCase() !== placeName.toLowerCase() ? value : ""].filter(Boolean).join(" Â· ")
    : value || `${placeName} Â· Resident access`;
  const scanInstructions = isPerkRedemption
    ? "Keep this screen open until the scan is confirmed."
    : "Keep this screen open while the partner checks your resident pass.";

  return (
    <AnimatePresence>
      <motion.div
        className="dp-resident-qr-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <NativeDrawerShell
          className={`dp-resident-qr-modal${isPerkRedemption ? " is-perk-redemption" : ""}`}
          drawerState="medium"
          panelKind="redemption"
          aria-labelledby="resident-qr-title"
          contentClassName="dp-resident-qr-content-viewport"
          scrollClassName="dp-resident-qr-content"
          header={(
            <header className="dp-resident-qr-header">
              <button type="button" className="dp-resident-qr-back" onClick={onBack || onClose} aria-label="Back to map">
                <ArrowLeft aria-hidden="true" />
              </button>
              <span className="dp-resident-qr-header-title">Resident Pass</span>
              <button type="button" className="dp-resident-qr-close" onClick={onClose} aria-label="Close resident QR code">
                <X aria-hidden="true" />
              </button>
            </header>
          )}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <p className="dp-resident-qr-eyebrow">{isPerkRedemption ? "Resident perk" : "Verified resident"}</p>
          <h2 id="resident-qr-title">{title}</h2>
          <p className="dp-resident-qr-value">{valueLine}</p>
          <p className={`dp-resident-qr-status is-${redemptionStatus}`} role="status">{validityLabel}</p>
          <div className="dp-resident-qr-frame">
            <DemoQrCode
              code={data.qrValue}
              className="dp-resident-qr-image"
              alt={`Downtown Perks resident QR code for ${placeName}`}
            />
          </div>
          <p className="dp-resident-qr-copy">{description}</p>
          <p className="dp-resident-qr-terms">{scanInstructions}</p>
          {terms ? <p className="dp-resident-qr-restrictions">{terms}</p> : null}
          <div className="dp-resident-qr-meta">
            <div><span>Venue</span><strong>{isPerkRedemption ? placeName : "Downtown Perks"}</strong></div>
            <div><span>Location</span><strong>{data.buildingName || "Downtown Austin"}</strong></div>
            <div><span>Pass ID</span><code>{data.cardNumber || data.uid}</code></div>
            {expiresAt && redemptionStatus === "ready" && <small>Valid until {expiresAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small>}
          </div>
        </NativeDrawerShell>
      </motion.div>
    </AnimatePresence>
  );
}

function PartnerQrScanner({ onVerified }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(0);
  const [scannerStatus, setScannerStatus] = useState("idle");
  const [scannerSource, setScannerSource] = useState("idle");
  const [scannerMessage, setScannerMessage] = useState("Scan the resident's current QR code or enter the code below.");
  const [manualCode, setManualCode] = useState("");
  const [validation, setValidation] = useState(null);
  const [originalAmount, setOriginalAmount] = useState("");
  const [scanKey, setScanKey] = useState("");

  const stopCamera = useCallback(() => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const verifyCode = useCallback(async (code) => {
    const token = String(code || "").trim();
    if (!token) {
      setScannerStatus("error");
      setScannerMessage("Enter or scan a resident code first.");
      return;
    }
    stopCamera();
    setScannerStatus("validating");
    setScannerMessage("Checking this pass and perk eligibilityâ€¦");
    const nextKey = typeof crypto !== "undefined" && crypto.randomUUID
      ? `scan-${crypto.randomUUID()}`
      : `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try {
      const result = await postWorkflow("/api/partner/redemptions/validate", {
        token,
        idempotencyKey: nextKey,
      });
      setScanKey(nextKey);
      setValidation(result);
      setScannerStatus("verified");
      setScannerMessage("Resident and perk confirmed. Review the details before completing.");
    } catch (error) {
      setValidation(null);
      setScannerStatus("error");
      setScannerMessage(error instanceof Error ? error.message : "This pass could not be verified.");
    }
  }, [stopCamera]);

  const completeRedemption = useCallback(async () => {
    if (!validation?.redemptionId) return;
    setScannerStatus("completing");
    setScannerMessage("Completing this perkâ€¦");
    try {
      const result = await postWorkflow(`/api/partner/redemptions/${validation.redemptionId}/complete`, {
        idempotencyKey: `${scanKey}-complete`,
        originalAmount: originalAmount === "" ? null : Number(originalAmount),
      });
      setValidation((current) => ({ ...current, completion: result }));
      setScannerStatus("completed");
      setScannerMessage("Perk completed and recorded for the resident and partner.");
      onVerified?.(result);
    } catch (error) {
      setScannerStatus("error");
      setScannerMessage(error instanceof Error ? error.message : "The perk could not be completed.");
    }
  }, [onVerified, originalAmount, scanKey, validation]);

  const rejectRedemption = useCallback(async () => {
    if (!validation?.redemptionId) return;
    setScannerStatus("completing");
    setScannerMessage("Recording that this perk was not completedâ€¦");
    try {
      await postWorkflow(`/api/partner/redemptions/${validation.redemptionId}/reject`, {
        reason: "Not completed by staff",
        idempotencyKey: `${scanKey}-reject`,
      });
      setScannerStatus("rejected");
      setScannerMessage("Not completed. The result was recorded without applying the perk.");
    } catch (error) {
      setScannerStatus("error");
      setScannerMessage(error instanceof Error ? error.message : "The result could not be recorded.");
    }
  }, [scanKey, validation]);

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
            verifyCode(rawValue);
            return;
          }
        }
      } catch {
        setScannerMessage("Camera is live. If this browser cannot read the code, enter it below.");
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    tick();
  }, [verifyCode]);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setScannerStatus("error");
      setScannerMessage("Camera scanning is not available in this browser. Enter the resident code below.");
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
      setScannerMessage("Camera permission was blocked or unavailable. Enter the resident code below.");
      stopCamera();
    }
  }, [runDetectionLoop, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  return (
    <section className="mt-3 dp-info-section p-3 md:mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">
            Scan access
            <ScanLine className="h-3.5 w-3.5 text-[#BFA46A]" />
          </div>
          <h3 className="mt-1 text-[19px] font-semibold leading-tight text-[#0B1F33] md:text-[21px]">
            Scan resident access
          </h3>
          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-[#425466]">
            Scan a current resident code, confirm the perk, and record the result in one place.
          </p>
        </div>
        {scannerStatus === "verified" && <Check className="h-5 w-5 shrink-0 stroke-[2.7] text-[#BFA46A]" />}
      </div>

      <div className="dp-partner-scanner-row mt-3 grid gap-3 overflow-hidden bg-white/78 p-2.5 text-[#0B1F33] shadow-[0_10px_26px_rgba(11,31,51,0.035),0_0_22px_rgba(191,164,106,0.04)]">
        <div className="dp-partner-scanner-copy min-w-0">
          <div className="text-[12px] font-semibold text-[#0B1F33]">
            {scannerStatus === "completed" ? "Perk completed" : scannerStatus === "verified" ? "Resident pass verified" : scannerStatus === "scanning" ? "Scanning resident QR" : scannerStatus === "validating" || scannerStatus === "completing" ? "Checking secure access" : "Ready to scan"}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#0B1F33]/66">{scannerMessage}</p>
          <p className="mt-1.5 text-[10.5px] leading-4 text-[#0B1F33]/58">
            Codes expire quickly and contain no resident contact details. Only staff for this partner can complete the perk.
          </p>
          <div className="mt-2 flex min-w-0 gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Enter resident code"
              aria-label="Resident pass code"
              className="min-h-11 min-w-0 flex-1 border border-[#0B1F33]/10 bg-white px-3 text-[12px] text-[#0B1F33] outline-none focus:border-[#BFA46A]"
            />
            <button type="button" onClick={() => verifyCode(manualCode)} className="dp-scanner-action">Check code</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 pb-0.5">
            <button type="button" onClick={startCamera} className="dp-scanner-action">
              {scannerStatus === "scanning" ? "Camera Live" : "Start Camera"}
            </button>
            {(scannerStatus !== "idle") && (
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setScannerStatus("idle");
                  setScannerSource("idle");
                  setScannerMessage("Scan the resident's current QR code or enter the code below.");
                  setValidation(null);
                  setOriginalAmount("");
                  setScanKey("");
                }}
                className="dp-scanner-action"
              >
                Start over
              </button>
            )}
          </div>
          {validation && (
            <div className="mt-3 border-t border-[#0B1F33]/8 pt-3">
              <strong className="block text-[13px] text-[#0B1F33]">{validation.perk?.title}</strong>
              <span className="mt-1 block text-[11px] text-[#0B1F33]/62">{validation.resident?.displayName} Â· Eligible resident</span>
              {validation.perk?.terms ? <p className="mt-2 text-[11px] leading-4 text-[#0B1F33]/66">{validation.perk.terms}</p> : null}
              {["percentage", "fixed_amount"].includes(validation.perk?.discountType) && (
                <label className="mt-2 block text-[11px] font-semibold text-[#0B1F33]">
                  Original amount
                  <input type="number" min="0" step="0.01" value={originalAmount} onChange={(event) => setOriginalAmount(event.target.value)} className="mt-1 min-h-11 w-full border border-[#0B1F33]/10 bg-white px-3 text-[13px] outline-none focus:border-[#BFA46A]" />
                </label>
              )}
              {!new Set(["completed", "rejected"]).has(scannerStatus) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={completeRedemption} disabled={scannerStatus === "completing"} className="dp-scanner-action">Complete perk</button>
                  <button type="button" onClick={rejectRedemption} disabled={scannerStatus === "completing"} className="dp-scanner-action">Do not apply</button>
                </div>
              )}
              {scannerStatus === "completed" && validation.completion && (
                <p className="mt-2 text-[11px] font-semibold text-[#0B5C3E]">Recorded Â· Final amount {validation.completion.final_amount ?? validation.completion.finalAmount ?? "confirmed"}</p>
              )}
            </div>
          )}
        </div>
        <div className="dp-partner-scanner-window relative flex h-40 min-w-0 items-center justify-center overflow-hidden bg-white md:h-48">
          <video
            ref={videoRef}
            className="h-full w-full object-cover transition-opacity duration-300"
            playsInline
            muted
            aria-label="Partner QR scanner camera preview"
          />
          {scannerStatus !== "scanning" && (
            <div className="absolute inset-0 grid place-items-center px-4 text-center">
              {scannerStatus === "verified" ? (
                <Check className="h-10 w-10 stroke-[2.8] text-[#BFA46A]" />
              ) : (
                <ScanLine className="h-9 w-9 text-[#BFA46A]" />
              )}
            </div>
          )}
          {scannerStatus === "scanning" && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-4 top-1/2 h-px bg-[#BFA46A] shadow-[0_0_18px_rgba(191,164,106,0.55)] dp-agent-scan-line" />
              <div className="absolute inset-4 border border-[#BFA46A]/28" />
              <div className="absolute left-5 top-5 h-6 w-6 border-l border-t border-[#BFA46A]" />
              <div className="absolute right-5 top-5 h-6 w-6 border-r border-t border-[#BFA46A]" />
              <div className="absolute bottom-5 left-5 h-6 w-6 border-b border-l border-[#BFA46A]" />
              <div className="absolute bottom-5 right-5 h-6 w-6 border-b border-r border-[#BFA46A]" />
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

function getCanonicalResidentPerkId(place) {
  const raw = place?.raw || {};
  return String(place?.perk_id || raw.perk_id || place?.perkId || raw.perkId || place?.id || raw.id || "");
}

function getResidentPerkExpiry(place) {
  const raw = place?.raw || {};
  const embeddedPerk = place?.perk || raw.perk || {};
  const firstPerk = place?.perks?.[0] || raw.perks?.[0] || {};
  return embeddedPerk.endsAt || embeddedPerk.expiresAt || firstPerk.endsAt || firstPerk.expiresAt || raw.valid_until || raw.expires || "";
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
    const isPaseo = isPaseoResidentialProperty(place);
    const buildingName = cleanDisplayCopy(isPaseo ? PASEO_ATX_MAP_COPY.name : place?.name || place?.title || luxuryBuilding.name || "This building");
    const activeText = listings.length === 1 ? "1 active listing" : `${listings.length} active listings`;
    const listingFacts = listings
      .slice(0, 4)
      .map((listing) => [listing.price, listing.beds ? `${listing.beds} bd` : "", listing.baths ? `${listing.baths} ba` : "", listing.sqft ? `${Number(listing.sqft).toLocaleString()} sq ft` : "", listing.mls_number ? `MLS ${listing.mls_number}` : ""].filter(Boolean).join(" Â· "))
      .join(" â€¢ ");

    return {
      offer: isPaseo ? PASEO_ATX_MAP_COPY.perkTitle : `${buildingName} Resident Access`,
      value: isPaseo ? PASEO_ATX_MAP_COPY.perkValue : place?.listingSummary || `${activeText}${place?.priceRange ? ` from ${place.priceRange}` : ""}`,
      description: isPaseo ? PASEO_ATX_MAP_COPY.perkDescription : panelContent.body || `${buildingName} has ${activeText}. Downtown Perks residents can review real listing details, compare nearby perks and places, and contact Legends Real Estate for showing options.`,
      terms: isPaseo ? PASEO_ATX_MAP_COPY.perkTerms : listingFacts || "Contact Legends Real Estate for availability, showing options, MLS details, and similar downtown properties.",
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
    ].filter(Boolean).join(" Â· ");

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
      ? [legendsListing.priceDisplay, legendsListing.beds ? `${legendsListing.beds} bd` : "", legendsListing.baths ? `${legendsListing.baths} ba` : "", legendsListing.sqftDisplay].filter(Boolean).join(" Â· ")
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
      terms: "Open it before dinner so the dining team can confirm the resident dessert benefit."×]µçkh‘éì¶»§q«^t€ô	½½±•…¸¡¡…ÍUÉ±EÕ•Éä€˜˜ÕÉÉ•¹ÑUÉ±EÕ•Éä€˜˜É••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğ€ôôôÕÉÉ•¹ÑUÉ±EÕ•Éä¤ì(€€€½¹ÍĞ¥ÍM•±™!å‘É…Ñ¥¹¥±Ñ•È€ô	½½±•…¸ (€€€€€¡…ÍáÁ±¥¥Ñ¥±Ñ•È€˜˜(€€€€€É••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğ€˜˜(€€€€€€…¡…ÍUÉ±EÕ•Éä€˜˜(€€€€€€…¡…ÍUÉ±¹Ñ¥Ñä€˜˜(€€€€€€…¡…Í½±±•Ñ¥½¸€˜˜(€€€€€€…¡…Í1…å•È°(€€€€¤ì(€€€½¹ÍĞ¥ÍM•±™!å‘É…Ñ¥¹M½Á•‘UÉ°€ô	½½±•…¸ (€€€€€É••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğ€˜˜(€€€€€€…¡…ÍUÉ±¹Ñ¥Ñä€˜˜(€€€€€€…¡…Í½±±•Ñ¥½¸€˜˜(€€€€€€…¡…Í1…å•È€˜˜(€€€€€€¡ÕÉÉ•¹ÑUÉ±EÕ•Éä€ôôôÉ••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğñğ•™™•Ñ¥Ù•M•…É €ôôôÉ••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğ¤°(€€€€¤ì((€€€¥˜€ …Í¡½Õ±‘!å‘É…Ñ”¤ì(€€€€€±•…ÉM½Á•‘5…ÁI•ÍÕ±ÑÌ ¤ì(€€€€€É••¹ÑM½Á•‘EÕ•ÉåI•˜¹ÕÉÉ•¹Ğ€ô€ˆˆì(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€¥˜€¡…±É•…‘å!å‘É…Ñ•‘EÕ•Éäñğ¥ÍM•±™!å‘É…Ñ¥¹EÕ•Éäñğ¥ÍM•±™!å‘É…Ñ¥¹¥±Ñ•Èñğ¥ÍM•±™!å‘É…Ñ¥¹M½Á•‘UÉ°¤É•ÑÕÉ¸ì((€€€Ù½¥É•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€ÅÕ•ÉäèÕÉ±MÑ…Ñ”¹ÁÉ½µÁĞñğÍ•…É ñğ€ˆˆ°(€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è…Ñ¥Ù•¥±Ñ•È°(€€€€€½±±•Ñ¥½¹%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€…Ñ¥Ù•¹Ñ¥Ñå%èÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%°(€€€€€ÑÉ¥•Èè¡…ÍUÉ±¹Ñ¥Ñä€ü€‰•¹Ñ¥Ñå}ÕÉ°ˆ€è¡…Í½±±•Ñ¥½¸€ü€‰ÕÉ…Ñ•‘}É½ÕÑ”ˆ€è¡…Í…µÁ…¥¸€ü€‰…µÁ…¥¹}ÕÉ°ˆ€è…Ñ¥Ù•¥±Ñ•È€ôôô€‰M…Ù•ˆ€ü€‰Í…Ù•ˆ€è€½ÅÈ½¤¹Ñ•ÍĞ¡ÕÉ±MÑ…Ñ”¹Í½ÕÉ”¤€ü€‰ÅÉ}ÕÉ°ˆ€è¡…ÍUÉ±EÕ•Éä€ü€‰ÕÉ±}ÅÕ•Éäˆ€è€‰ÕÉ±}™¥±Ñ•Èˆ°(€€€€€±¥µ¥Ğè¡…ÍUÉ±¹Ñ¥Ñä€ü€Ø€è¡…Í½±±•Ñ¥½¸€ü5…Ñ ¹µ¥¸ ÈÔ°•Ñ5…Á½±±•Ñ¥½¹	å%¡ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸¤ü¹ÍÑ½Á%‘Ìü¹±•¹Ñ ñğ€ÈÔ¤€èÕ¹‘•™¥¹•°(€€€ô¤ì(€ô°l(€€€…Ñ¥Ù•¥±Ñ•È°(€€€±•…ÉM½Á•‘5…ÁI•ÍÕ±ÑÌ°(€€€‘¥ÍÑÉ¥Ğ°(€€€É•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ°(€€€•™™•Ñ¥Ù•M•…É °(€€€Í•…É °(€€€Í½Á•‘1…ÍÑQÉ¥•È°(€€€Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹É•ÍÕ±Ñ%‘Ì¹±•¹Ñ °(€€€ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€ÕÉ±MÑ…Ñ”¹…µÁ…¥¹%°(€€€ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%°(€€€ÕÉ±MÑ…Ñ”¹•Ù•¹Ñ%°(€€€ÕÉ±MÑ…Ñ”¹±…å•È°(€€€ÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ°(€€€ÕÉ±MÑ…Ñ”¹µ½‘”°(€€€ÕÉ±MÑ…Ñ”¹ÁÉ½µÁĞ°(€€€ÕÉ±MÑ…Ñ”¹Á•É­%°(€€€ÕÉ±MÑ…Ñ”¹Í½ÕÉ”°(€t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€¡µ…Ái½½´€ğMQIQ}1Y1}i==4¤É•ÑÕÉ¸ì(€€€Í•ÑUÍ•É!…Í9…Ù¥…Ñ•‘5…À¡ÑÉÕ”¤ì(€€€ÑÉäì(€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹Í•Ñ%Ñ•´¡5A}UMI}9Y%Q}MQ=I}-d°€‰ÑÉÕ”ˆ¤ì(€€€ô…Ñ ì(€€€€€€¼¼M•ÍÍ¥½¸ÍÑ½É…”…¸‰”Õ¹…Ù…¥±…‰±”ì­••ÀÑ¡”¥¸µµ•µ½Éä…µ•É„±½¬¸(€€€ô(€ô°mµ…Ái½½µt¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€½¹ÍĞÍ½Á•‘I•ÍÕ±ÑM•Ğ€ô	½½±•…¸¡•™™•Ñ¥Ù•M•…É ¤ñğ€…¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤ì(€€€¥˜€ …Í½Á•‘I•ÍÕ±ÑM•ĞñğÍ•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€¡•™™•Ñ¥Ù•M•…É ¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡…Ñ¥Ù•¥±Ñ•È€ôôô€‰1••¹‘Ìˆñğ…Ñ¥Ù•¥±Ñ•È€ôôô€‰1¥ÍÑ¥¹Ìˆ¤ì(€ô°m…Ñ¥Ù•¥±Ñ•È°•™™•Ñ¥Ù•M•…É °‘¥ÍÑÉ¥Ğ°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹µ½‘•t¤ì((€½¹ÍĞ¹•¥¡‰½É¡½½‘	…Í•A±…•Ì€ôÕÍ•5•µ¼  ¤€ôøì(€€€½¹ÍĞÅÕ•Éä€ô•™™•Ñ¥Ù•M•…É ¹Ñ½1½İ•É…Í” ¤ì(€€€½¹ÍĞ¥¹Ñ•¹ÑQ½­•¹Ì€ô•Ñ%¹Ñ•¹ÑQ½­•¹Ì¡ÅÕ•Éä¤ì(€€€½¹ÍĞÁ…ÉÍ•€ôÁ…ÉÍ•5…Á%¹Ñ•¹Ğ¡ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞÁ…ÉÍ•‘%¹Ñ•¹ÑÌ€ôÉÉ…ä¹¥ÍÉÉ…ä¡Á…ÉÍ•¹¥¹Ñ•¹ÑÌ¤€üÁ…ÉÍ•¹¥¹Ñ•¹ÑÌ€èmtì(€€€½¹ÍĞ¥Í	É½…‘A…ÉÑ¹•É%¹Ñ•¹Ğ€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜Á…ÉÍ•‘%¹Ñ•¹ÑÌ¹Í½µ” ¡¥¹Ñ•¹Ğ¤€ôøl‰½ÁÁ½ÉÑÕ¹¥Ñäˆ°€‰Á•É™½Éµ…¹”ˆ°€‰…µÁ…¥¹Ìˆ°€‰…Ñ¥Ù…Ñ¥½¸ˆ°€‰¥¹Í¥¡ÑÌˆ°€‰…Õ‘¥•¹”‰t¹¥¹±Õ‘•Ì¡¥¹Ñ•¹Ğ¤¤ì(€€€½¹ÍĞ¥Í¥Ù¥1…å•É%¹Ñ•¹Ğ€ô…Ñ¥Ù•¥±Ñ•È€ôôô€‰¥Ù¥ŒˆñğÁ…ÉÍ•‘%¹Ñ•¹ÑÌ¹¥¹±Õ‘•Ì ‰}…ÉÑ}İ…±¬ˆ¤ñğ€½qˆ¡‘……ñ‘…¹…ñİ…Ñ•É±½½ñ…ÉĞİ…±­ñÁÕ‰±¥Œ…ÉÑñ¥Ù¥Œ¥qˆ½¤¹Ñ•ÍĞ¡ÅÕ•Éä¤ì(€€€½¹ÍĞ¡…ÍÕÑ¡½É¥Ñ…Ñ¥Ù•M½Á•‘I•ÍÕ±ÑÌ€ô	½½±•…¸ (€€€€€Í½Á•‘1…ÍÑQÉ¥•È€˜˜(€€€€€Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ€ôôô€‰ÍÕ•ÍÌˆ€˜˜(€€€€€Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå-•ä°(€€€€¤ì(€€€É•ÑÕÉ¸Á±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøì(€€€€€€¼¼áÁ±¥¥ĞÍ•…É¡•Ì…¹¥¹Ñ•¹ĞÍ•±•Ñ¥½¹Ì…±É•…‘äÉ•ÑÕÉ¸„½Ù•É¹•°(€€€€€€¼¼‰½Õ¹‘•É•ÍÕ±ĞÍ•Ğ¸QÉ•…ĞÑ¡…ĞÉ•ÍÁ½¹Í”…Ì…ÕÑ¡½É¥Ñ…Ñ¥Ù”Í¼„Í•½¹(€€€€€€¼¼Á…ÍÌ½Ù•ÈÍÁ…ÉÍ”Á¥¸µ•Ñ…‘…Ñ„…¹¹½ĞÉ•µ½Ù”É•±•Ù…¹ĞÁ¥¹Ì½ÈÉ•Ù•…°(€€€€€€¼¼Õ¹É•±…Ñ•™…±±‰…­Ì¸(€€€€€¥˜€¡¡…ÍÕÑ¡½É¥Ñ…Ñ¥Ù•M½Á•‘I•ÍÕ±ÑÌ¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€¥˜€ …Í¡½Õ±‘MÕÉ™…•!½ÍÁ¥Ñ…±¥Ñå¡¥±¡Á±…”°…Ñ¥Ù•¥±Ñ•È°ÅÕ•Éä¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€¡¥ÍM¥¹±•M•±•ÑM•…É¡%¹Ñ•¹Ñ¥±Ñ•È¡…Ñ¥Ù•¥±Ñ•È¤¤ì(€€€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸€˜˜•Ñ½±±•Ñ¥½¹¥±Ñ•È¡ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸¤€„ôô…Ñ¥Ù•¥±Ñ•È¤É•ÑÕÉ¸™…±Í”ì(€€€€€ô•±Í”¥˜€ …µ…Ñ¡•Í½±±•Ñ¥½¸¡Á±…”°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€ …µ…Ñ¡•Í¥±Ñ•È¡Á±…”°…Ñ¥Ù•¥±Ñ•È°Í…Ù•‘%‘Ì¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€¡¥Í¥Ù¥1…å•É%¹Ñ•¹Ğ€˜˜€¡¥Í¥Ù¥¹Ñ¥Ñä¡Á±…”¤ñğ•Ñ……MÑ½ÁÉ½µA±…”¡Á±…”¤¤¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€¥˜€¡¥Í%¹Ñ•¹Ñ=¹±å¥±Ñ•È¡…Ñ¥Ù•¥±Ñ•È¤¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€¥˜€ …ÅÕ•Éä¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€½¹ÍĞÑ•áĞ€ôÁ±…•Q•áĞ¡Á±…”¤ì(€€€€€É•ÑÕÉ¸€ (€€€€€€€¥Í	É½…‘A…ÉÑ¹•É%¹Ñ•¹Ğñğ(€€€€€€€Ñ•áĞ¹¥¹±Õ‘•Ì¡ÅÕ•Éä¤ñğ(€€€€€€€¥¹Ñ•¹ÑQ½­•¹Ì¹Í½µ” ¡Ñ½­•¸¤€ôøÑ•áĞ¹¥¹±Õ‘•Ì¡Ñ½­•¸¤¤ñğ(€€€€€€€Á…ÉÍ•‘%¹Ñ•¹ÑÌ¹Í½µ” ¡¥¹Ñ•¹Ğ¤€ôøÑ•áĞ¹¥¹±Õ‘•Ì¡MÑÉ¥¹œ¡¥¹Ñ•¹Ğ¤¹Ñ½1½İ•É…Í” ¤¹É•Á±…” ½|½œ°€ˆ€ˆ¤¤¤ñğ(€€€€€€€€¡ÅÕ•Éä¹¥¹±Õ‘•Ì ‰Á•É¬ˆ¤€˜˜¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤¤(€€€€€€¤ì(€€€ô¤ì(€ô°mÁ±…•Ì°•™™•Ñ¥Ù•M•…É °…Ñ¥Ù•¥±Ñ•È°Í…Ù•‘%‘Ì°Í½Á•‘1…ÍÑQÉ¥•È°Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå-•ä°ÕÉ±MÑ…Ñ”¹µ½‘”°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ñt¤ì((€½¹ÍĞ¹•¥¡‰½É¡½½‘½Õ¹ÑÌ€ôÕÍ•5•µ¼  ¤€ôøì(€€€É•ÑÕÉ¸9%!	=I!==L¹É•‘Õ” ¡½Õ¹ÑÌ°¹•¥¡‰½É¡½½¤€ôøì(€€€€€½Õ¹ÑÍm¹•¥¡‰½É¡½½‘t€ô(€€€€€€€¹•¥¡‰½É¡½½€ôôô11}9%!	=I!==L(€€€€€€€€€€ü¹•¥¡‰½É¡½½‘	…Í•A±…•Ì¹±•¹Ñ (€€€€€€€€€€è¹•¥¡‰½É¡½½‘	…Í•A±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøÁ±…”¹‘¥ÍÑÉ¥Ğ€ôôô¹•¥¡‰½É¡½½¤¹±•¹Ñ ì(€€€€€É•ÑÕÉ¸½Õ¹ÑÌì(€€€ô°íô¤ì(€ô°m¹•¥¡‰½É¡½½‘	…Í•A±…•Ít¤ì((€½¹ÍĞ™¥±Ñ•É•€ôÕÍ•5•µ¼  ¤€ôøì(€€€É•ÑÕÉ¸¹•¥¡‰½É¡½½‘	…Í•A±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøì(€€€€€¥˜€ …¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€˜˜Á±…”¹‘¥ÍÑÉ¥Ğ€„ôô‘¥ÍÑÉ¥Ğ¤É•ÑÕÉ¸™…±Í”ì(€€€€€É•ÑÕÉ¸ÑÉÕ”ì(€€€ô¤ì(€ô°m¹•¥¡‰½É¡½½‘	…Í•A±…•Ì°‘¥ÍÑÉ¥Ñt¤ì((€½¹ÍĞÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì€ôÕÍ•5•µ¼  ¤€ôøì(€€€É•ÑÕÉ¸Á±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤¤ì(€ô°mÁ±…•Ì°Í…Ù•‘%‘Ít¤ì((€½¹ÍĞ…ÑÕ…±M…Ù•‘A±…•Ì€ôÕÍ•5•µ¼ (€€€€ ¤€ôøÁ±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤¤°(€€€mÁ±…•Ì°Í…Ù•‘%‘Ít°(€€¤ì((€½¹ÍĞÉ•Í¥‘•¹ÑA•É­A±…•Ì€ôÕÍ•5•µ¼  ¤€ôøì(€€€½¹ÍĞÁ•É­Ì€ôÁ±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôø¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤¤ì(€€€É•ÑÕÉ¸Á•É­Ì¹±•¹Ñ €üÁ•É­Ì¹Í±¥” À°€ÄÈ¤€èÁ±…•Ì¹Í±¥” À°€ÄÈ¤ì(€ô°mÁ±…•Ít¤ì((€½¹ÍĞÍ•±•Ñ•€ôÕÍ•5•µ¼ (€€€€ ¤€ôøì(€€€€€¥˜€ …Í•±•Ñ•‘%¤É•ÑÕÉ¸¹Õ±°ì(€€€€€½¹ÍĞ½Ù•ÉÉ¥‘•%€ôÍ•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”ü¹¥€üÉ•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¹¥¤€è€ˆˆì(€€€€€½¹ÍĞ½Ù•ÉÉ¥‘”€ô½Ù•ÉÉ¥‘•%€˜˜½Ù•ÉÉ¥‘•%€ôôôÍ•±•Ñ•‘%€üÍ•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”€è¹Õ±°ì(€€€€€½¹ÍĞ±¥ÍÑ¥¹…¹‘¥‘…Ñ”€ôÕÉ±MÑ…Ñ”¹±¥ÍÑ¥¹%(€€€€€€€€üÉ•Í½±Ù•1¥ÍÑ¥¹¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡ÕÉ±MÑ…Ñ”¹±¥ÍÑ¥¹%°±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì¤ñğÉ•Í½±Ù•1¥ÍÑ¥¹¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡ÕÉ±MÑ…Ñ”¹±¥ÍÑ¥¹%°Á±…•Ì¤(€€€€€€€€è¹Õ±°ì(€€€€€½¹ÍĞ…¹‘¥‘…Ñ”€ô±¥ÍÑ¥¹…¹‘¥‘…Ñ”ñğÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°Á±…•Ì¤ñğÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°¡½ÍÁ¥Ñ…±¥Ñå½¹Ñ•¹Ñ1¥‰É…Éå¹Ñ¥Ñ¥•Ì¤ñğÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°É•Í¥‘•¹Ñ¥…±5¥á•‘UÍ•¹Ñ¥Ñ¥•Ì¤ñğÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì¤ñğ½Ù•ÉÉ¥‘”ñğ¹Õ±°ì(€€€€€¥˜€ ……¹‘¥‘…Ñ”¤É•ÑÕÉ¸¹Õ±°ì(€€€€€½¹ÍĞ¥ÍáÁ±¥¥ÑM•±•Ñ¥½¹=Ù•ÉÉ¥‘”€ô	½½±•…¸¡½Ù•ÉÉ¥‘”€˜˜É•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡…¹‘¥‘…Ñ”¹¥¤€ôôô½Ù•ÉÉ¥‘•%¤ì(€€€€€½¹ÍĞ¥ÍM•±•Ñ•‘!½ÍÁ¥Ñ…±¥Ñå¹Ñ¥Ñä€ô¥Í!½ÍÁ¥Ñ…±¥Ñå9•Ñİ½É­¹Ñ¥Ñä¡…¹‘¥‘…Ñ”¤ì(€€€€€¥˜€ …¥ÍáÁ±¥¥ÑM•±•Ñ¥½¹=Ù•ÉÉ¥‘”€˜˜€¡…Ñ¥Ù•¥±Ñ•È€„ôô€‰±°ˆñğÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğ•™™•Ñ¥Ù•M•…É ¤€˜˜€…µ…Ñ¡•Í¥±Ñ•È¡…¹‘¥‘…Ñ”°…Ñ¥Ù•¥±Ñ•È°Í…Ù•‘%‘Ì¤€˜˜€„¡¥ÍM•±•Ñ•‘!½ÍÁ¥Ñ…±¥Ñå¹Ñ¥Ñä€˜˜l‰!½Ñ•±Ìˆ°€‰A•É­Ì‰t¹¥¹±Õ‘•Ì¡…Ñ¥Ù•¥±Ñ•È¤¤¤É•ÑÕÉ¸¹Õ±°ì(€€€€€É•ÑÕÉ¸…¹‘¥‘…Ñ”ì(€€€ô°(€€€m…Ñ¥Ù•¥±Ñ•È°•™™•Ñ¥Ù•M•…É °±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì°Á±…•Ì°Í…Ù•‘%‘Ì°Í•±•Ñ•‘%°Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹±¥ÍÑ¥¹%‘t°(€€¤ì(€½¹ÍĞÍ•±•Ñ•‘I•Í¥‘•¹ÑÑ¥½¸€ôÕÍ•5•µ¼ (€€€€ ¤€ôø€¡Í•±•Ñ•€ü•ÑI•Í¥‘•¹Ñ•Ñ…¥±Ñ¥½¸¡Í•±•Ñ•¤€è¹Õ±°¤°(€€€mÍ•±•Ñ•‘t°(€€¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•ü¹¥ñğÍ•±•Ñ•‘É…İ•É±½Í•¤É•ÑÕÉ¸ì(€€€İ¥¹‘½Ü¹É•ÅÕ•ÍÑ¹¥µ…Ñ¥½¹É…µ”  ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½É±° ˆ¹‘Àµ‘•Ñ…¥°µ‘É…İ•È€¹‘Àµ‘É…İ•ÈµÍÉ½±°°€¹‘Àµ‘•Ñ…¥°µ‘É…İ•È€¹‘Àµµ…ÀµÁ…¹•°µÍÉ½±°°€¹‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ‘É…İ•È€¹‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µÍÉ½±°ˆ¤¹™½É…  ¡¹½‘”¤€ôøì(€€€€€€€¹½‘”¹ÍÉ½±±Q½À€ô€Àì(€€€€€ô¤ì(€€€ô¤ì(€ô°mÍ•±•Ñ•ü¹¥°Í•±•Ñ•‘É…İ•É±½Í•‘t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•ü¹¥ñğÍ•±•Ñ•‘É…İ•É±½Í•¤É•ÑÕÉ¸ì(€€€½¹ÍĞ•¹Ñ¥ÑåQåÁ”€ô•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤ì(€€€½¹ÍĞ­•ä€ô€‘íÍ•±•Ñ•¹¥‘ôè‘í•¹Ñ¥ÑåQåÁ•õ€ì(€€€¥˜€¡‘•Ñ…¥±A…¹•±¹…±åÑ¥ÍI•˜¹ÕÉÉ•¹Ğ¹¡…Ì¡­•ä¤¤É•ÑÕÉ¸ì(€€€‘•Ñ…¥±A…¹•±¹…±åÑ¥ÍI•˜¹ÕÉÉ•¹Ğ¹…‘¡­•ä¤ì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°€‰‘•Ñ…¥±}Á…¹•±}½Á•¹•ˆ°€‰µ…Á}‘•Ñ…¥±}Á…¹•°ˆ°ì(€€€€€µ•Ñ…‘…Ñ„èì•¹Ñ¥ÑåQåÁ”°Á…¹•±MÑ…Ñ”è‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°Í½ÕÉ•MÕÉ™…”èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸€ü€‰½±±•Ñ¥½¸ˆ€è€‰µ…Àˆô°(€€€ô¤¤ì(€ô°m‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°Í•±•Ñ•°Í•±•Ñ•‘É…İ•É±½Í•°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹Á•É­%‘t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•ü¹¥ñğÍ•±•Ñ•‘É…İ•É±½Í•¤É•ÑÕÉ¸ì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°€‰‘•Ñ…¥±}Á…¹•±}ÍÑ…Ñ•}¡…¹•ˆ°€‰µ…Á}‘•Ñ…¥±}Á…¹•°ˆ°ì(€€€€€µ•Ñ…‘…Ñ„èì•¹Ñ¥ÑåQåÁ”è•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤°Á…¹•±MÑ…Ñ”è‘•Ñ…¥±É…İ•ÉMÑ…Ñ”ô°(€€€ô¤¤ì(€ô°m‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°Í•±•Ñ•ü¹¥°Í•±•Ñ•‘É…İ•É±½Í•°ÕÉ±MÑ…Ñ”¹Á•É­%‘t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•‘%ñğ€…Í•±•Ñ•¤É•ÑÕÉ¸ì(€€€¥˜€¡Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”€˜˜É•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¹¥¤€ôôôÍ•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€¡…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€˜˜€…ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸€˜˜€…•™™•Ñ¥Ù•M•…É ¤É•ÑÕÉ¸ì(€€€¥˜€¡µ…Ñ¡•Í¥±Ñ•È¡Í•±•Ñ•°…Ñ¥Ù•¥±Ñ•È°Í…Ù•‘%‘Ì¤¤É•ÑÕÉ¸ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì•¹Ñ¥Ñå%è€ˆˆ°Á•É­%è€ˆˆô¤ì(€ô°m…Ñ¥Ù•¥±Ñ•È°•™™•Ñ¥Ù•M•…É °Í…Ù•‘%‘Ì°Í•±•Ñ•°Í•±•Ñ•‘%°Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”°ÕÉ±MÑ…Ñ•t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …ÕÉ±MÑ…Ñ”¹Á•É­%ñğ€…Í•±•Ñ•¤É•ÑÕÉ¸ì(€€€½¹ÍĞÉ…Ü€ôÍ•±•Ñ•¹É…Üñğíôì(€€€½¹ÍĞÙ…±¥‘%‘Ì€ô¹•ÜM•Ğ¡l(€€€€€Í•±•Ñ•¹¥°(€€€€€É…Ü¹¥°(€€€€€•Ñ…¹½¹¥…±I•Í¥‘•¹ÑA•É­%¡Í•±•Ñ•¤°(€€€€€Í•±•Ñ•¹Á•É¬ü¹¥°(€€€€€É…Ü¹Á•É¬ü¹¥°(€€€€€Í•±•Ñ•¹Á•É­Ìü¹lÁtü¹¥°(€€€€€É…Ü¹Á•É­Ìü¹lÁtü¹¥°(€€€t¹™¥±Ñ•È¡	½½±•…¸¤¹µ…À¡MÑÉ¥¹œ¤¤ì(€€€¥˜€ …Ù…±¥‘%‘Ì¹¡…Ì¡MÑÉ¥¹œ¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤¤ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ìÁ•É­%è€ˆˆô¤ì(€ô°mÍ•±•Ñ•°ÕÉ±MÑ…Ñ•t¤ì((€½¹ÍĞ±ÕÍÑ•ÉA±…•Í½ÉÉ…İ•È€ô±ÕÍÑ•ÉÉ…İ•Èü¹Á±…•Ìñğmtì((€½¹ÍĞ¡…ÍÑ¥Ù•…Ñ•½ÉåM½Á”€ô…Ñ¥Ù•¥±Ñ•È€„ôô€‰±°ˆñğ€…¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤ñğ	½½±•…¸¡•™™•Ñ¥Ù•M•…É ¤ñğ	½½±•…¸¡ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğÕÉ±MÑ…Ñ”¹±…å•È¤ì(€½¹ÍĞ¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”€ô…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€˜˜¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€˜˜€…•™™•Ñ¥Ù•M•…É ì(€½¹ÍĞ‘¥ÍÁ±…åA±…•Ì€ô¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”(€€€€üÍ½ÉÑ¥Í½Ù•ÉA±…•Ì¡Á±…•Ì¤¹Í±¥” À°%9%Q%1}%M=YIe}5I-I}1%5%P¤(€€€€è™¥±Ñ•É•¹±•¹Ñ (€€€€ü™¥±Ñ•É•(€€€€è…Ñ¥Ù•¥±Ñ•È€ôôô€‰M…Ù•ˆ(€€€€€€üÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì(€€€€€€è…Ñ¥Ù•¥±Ñ•È€ôôô€‰A•É­Ìˆ(€€€€€€€€üÉ•Í¥‘•¹ÑA•É­A±…•Ì(€€€€€€€€è¡…ÍÑ¥Ù•…Ñ•½ÉåM½Á”(€€€€€€€€€€ümt(€€€€€€€€€€èÁ±…•Ì¹Í±¥” À°€ÄÈ¤ì(€½¹ÍĞ¥ÍUÍ¥¹…±±‰…­A±…•Ì€ô€…™¥±Ñ•É•¹±•¹Ñ €˜˜€…¡…ÍÑ¥Ù•…Ñ•½ÉåM½Á”€˜˜Á±…•Ì¹±•¹Ñ €ø€Àì(€½¹ÍĞ½¹Ñ•áÑ½Õ¹Ğ€ô‘¥ÍÁ±…åA±…•Ì¹±•¹Ñ ì(€½¹ÍĞ¥Í±•…¹I•Í¥‘•¹ÑA•É­Í1…Õ¹ €ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•¥±Ñ•È€ôôô€‰A•É­Ìˆ€˜˜¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€˜˜€…•™™•Ñ¥Ù•M•…É €˜˜€…Í•±•Ñ•‘%ì(€½¹ÍĞ½¹Ñ•áÑ1…‰•°€ô½¹Ñ•áÑ½Õ¹Ğ€ø€À(€€€€ü¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”(€€€€€€ü€‰•…ÑÕÉ•‘½İ¹Ñ½İ¸Á±…•Ìˆ(€€€€€€è€‘í½¹Ñ•áÑ½Õ¹Ñô€‘í…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€ü€‰‘½İ¹Ñ½İ¸Á±…•Ìˆ€è…Ñ¥Ù•¥±Ñ•È¹Ñ½1½İ•É…Í” ¥õ€(€€€€èM¡½İ¥¹œÍÕ•ÍÑ•€‘í…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€ü€‰‘½İ¹Ñ½İ¸Á±…•Ìˆ€è…Ñ¥Ù•¥±Ñ•È¹Ñ½1½İ•É…Í” ¥ô¹•…É‰å€ì(€½¹ÍĞ‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì€ôÕÍ•5•µ¼ (€€€€ ¤€ôø•™™•Ñ¥Ù•M•…É €üÍ½ÉÑM•…É¡A±…•Ì¡‘¥ÍÁ±…åA±…•Ì°•™™•Ñ¥Ù•M•…É ¤€èÍ½ÉÑ¥Í½Ù•ÉA±…•Ì¡‘¥ÍÁ±…åA±…•Ì¤°(€€€m‘¥ÍÁ±…åA±…•Ì°•™™•Ñ¥Ù•M•…É¡t°(€€¤ì(€½¹ÍĞ…Ñ¥Ù•A•É­%Ñ•µÌ€ôÕÍ•5•µ¼  ¤€ôø‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì(€€€€¹™¥±Ñ•È ¡Á±…”¤€ôø¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤¤(€€€€¹Í±¥” À°€ĞÀ¤(€€€€¹µ…À ¡Á±…”¤€ôøì(€€€€€½¹ÍĞ½™™•È€ô•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€€€É•ÑÕÉ¸ì(€€€€€€€¥èÁ±…”¹¥°(€€€€€€€™½ÕÍ-•äèMÑÉ¥¹œ¡Á±…”¹¥¤¹É•Á±…” ½my„µèÀ´å|µt½¤°€ˆ´ˆ¤°(€€€€€€€¹…µ”èÁ±…”¹¹…µ”°(€€€€€€€½™™•ÉQ¥Ñ±”è½™™•Èü¹Ñ¥Ñ±”ñğ½™™•Èü¹½™™•Èñğ½™™•Èü¹Ù…±Õ”ñğ€‰I•Í¥‘•¹ĞÁ•É¬ˆ°(€€€€€€€•áÁ¥É•ÍĞè•ÑI•Í¥‘•¹ÑA•É­áÁ¥Éä¡Á±…”¤°(€€€€€€€‘¥ÍÑ…¹”èÁ±…•¥ÍÑ…¹•1…‰•°¡Á±…”¤°(€€€€€€€¥µ…”èÉ•Í½±Ù•¹Ñ¥Ñå%µ…”¡Á±…”°€‰…Éˆ¤°(€€€€€€€Á¥¸èÉ•Í½±Ù•¹Ñ¥ÑåA¥¸¡Á±…”¤°(€€€€€€€Á•É­%è•Ñ…¹½¹¥…±I•Í¥‘•¹ÑA•É­%¡Á±…”¤°(€€€€€€€Á±…”°(€€€€€ôì(€€€ô¤°m‘¥Í½Ù•É¥ÍÁ±…åA±…•Ít¤ì(€½¹ÍĞÙ¥Í¥‰±•A±…•Ì€ô‘¥Í½Ù•É¥ÍÁ±…åA±…•Ìì(€½¹ÍĞ…Ñ¥Ù•½±±•Ñ¥½¸€ôÕÍ•5•µ¼ (€€€€ ¤€ôø•Ñ5…Á½±±•Ñ¥½¹	å%¡ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸¤°(€€€mÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¹t°(€€¤ì(€½¹ÍĞ…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•I•˜€ôÕÍ•I•˜¡¹Õ±°¤ì(€½¹ÍĞ…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”€ôÕÍ•5•µ¼ (€€€€ ¤€ôøì(€€€€€¥˜€ ……Ñ¥Ù•½±±•Ñ¥½¸¤ì(€€€€€€€…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•I•˜¹ÕÉÉ•¹Ğ€ô¹Õ±°ì(€€€€€€€É•ÑÕÉ¸¹Õ±°ì(€€€€€ô(€€€€€½¹ÍĞÉ•Í½±Ù•‘I½ÕÑ”€ôÉ•Í½±Ù•5…Á½±±•Ñ¥½¹I½ÕÑ”¡…Ñ¥Ù•½±±•Ñ¥½¸°Á±…•Ì¤ì(€€€€€¥˜€¡É•Í½±Ù•‘I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €øô€È¤…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•I•˜¹ÕÉÉ•¹Ğ€ôÉ•Í½±Ù•‘I½ÕÑ”ì(€€€€€¥˜€¡…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•I•˜¹ÕÉÉ•¹Ğü¹¥€ôôô…Ñ¥Ù•½±±•Ñ¥½¸¹¥¤É•ÑÕÉ¸…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•I•˜¹ÕÉÉ•¹Ğì(€€€€€É•ÑÕÉ¸É•Í½±Ù•‘I½ÕÑ”ì(€€€ô°(€€€m…Ñ¥Ù•½±±•Ñ¥½¸°Á±…•Ít°(€€¤ì(€½¹ÍĞ…Ñ¥Ù•I•±…Ñ•‘I½ÕÑ•Ì€ôÕÍ•5•µ¼ (€€€€ ¤€ôø€¡…Ñ¥Ù•½±±•Ñ¥½¸ü¹É•±…Ñ•‘I½ÕÑ•%‘Ìñğmt¤(€€€€€€¹µ…À ¡É½ÕÑ•%¤€ôø•Ñ5…Á½±±•Ñ¥½¹	å%¡É½ÕÑ•%¤¤(€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤(€€€€€€¹™¥±Ñ•È ¡É½ÕÑ”¤€ôøÉ½ÕÑ”¹¥€„ôô…Ñ¥Ù•½±±•Ñ¥½¸ü¹¥¤(€€€€€€¹Í±¥” À°€Ì¤°(€€€m…Ñ¥Ù•½±±•Ñ¥½¹t°(€€¤ì(€½¹ÍĞ…Ñ¥Ù•I½ÕÑ••¹Ñ½¹Ñ•áĞ€ôÕÍ•5•µ¼  ¤€ôøì(€€€¥˜€ ……Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ ¤É•ÑÕÉ¸¹Õ±°ì(€€€½¹ÍĞÍ•±•Ñ•‘MÑ½Á%¹‘•à€ôÍ•±•Ñ•‘%€ü…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹™¥¹‘%¹‘•à ¡ÍÑ½À¤€ôøÍÑ½À¹¥€ôôôÍ•±•Ñ•‘%¤€è€´Äì(€€€½¹ÍĞÍ•±•Ñ•‘MÑ½À€ôÍ•±•Ñ•‘MÑ½Á%¹‘•à€øô€À€ü…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÍmÍ•±•Ñ•‘MÑ½Á%¹‘•át€è¹Õ±°ì(€€€½¹ÍĞÕÁ½µ¥¹MÑ½ÁÌ€ô…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ(€€€€€€¹Í±¥”¡5…Ñ ¹µ…à À°Í•±•Ñ•‘MÑ½Á%¹‘•à€¬€Ä¤°5…Ñ ¹µ…à À°Í•±•Ñ•‘MÑ½Á%¹‘•à€¬€Ä¤€¬€Ø¤(€€€€€€¹µ…À ¡ÍÑ½À°¥¹‘•à¤€ôø€¡ì(€€€€€€€¥èÍÑ½À¹¥°(€€€€€€€¹…µ”èÍÑ½À¹¹…µ”°(€€€€€€€…Ñ•½ÉäèÍÑ½À¹…Ñ•½Éä°(€€€€€€€É½ÕÑ•MÑ½Á9Õµ‰•ÈèÍ•±•Ñ•‘MÑ½Á%¹‘•à€øô€À€üÍ•±•Ñ•‘MÑ½Á%¹‘•à€¬¥¹‘•à€¬€È€è¥¹‘•à€¬€Ä°(€€€€€€€‘¥ÍÑÉ¥ĞèÍÑ½À¹‘¥ÍÑÉ¥Ğ°(€€€€€ô¤¤ì(€€€É•ÑÕÉ¸ì(€€€€€¥è…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹¥°(€€€€€Ñ¥Ñ±”è…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹Ñ¥Ñ±”°(€€€€€É½ÕÑ•5½‘”è…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹É½ÕÑ•5½‘”°(€€€€€ÍÑ½Á½Õ¹Ğè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹±•¹Ñ °(€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ…ÑÕÌ°(€€€€€Í•±•Ñ•‘MÑ½ÀèÍ•±•Ñ•‘MÑ½À€üì(€€€€€€€¥èÍ•±•Ñ•‘MÑ½À¹¥°(€€€€€€€¹…µ”èÍ•±•Ñ•‘MÑ½À¹¹…µ”°(€€€€€€€…Ñ•½ÉäèÍ•±•Ñ•‘MÑ½À¹…Ñ•½Éä°(€€€€€€€‘¥ÍÑÉ¥ĞèÍ•±•Ñ•‘MÑ½À¹‘¥ÍÑÉ¥Ğ°(€€€€€€€É½ÕÑ•MÑ½Á9Õµ‰•ÈèÍ•±•Ñ•‘MÑ½Á%¹‘•à€¬€Ä°(€€€€€ô€è¹Õ±°°(€€€€€ÕÁ½µ¥¹MÑ½ÁÌ°(€€€€€É½ÕÑ•MÑ½Á%‘Ìè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹µ…À ¡ÍÑ½À¤€ôøÍÑ½À¹¥¤¹Í±¥” À°€àÀ¤°(€€€ôì(€ô°m…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”°Í•±•Ñ•‘%‘t¤ì(€½¹ÍĞ…Ñ¥Ù•…¹½¹¥…±%¹Ñ•¹Ñ%€ôÕÍ•5•µ¼ (€€€€ ¤€ôø•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡…Ñ¥Ù•¥±Ñ•È°•™™•Ñ¥Ù•M•…É ¤°(€€€m…Ñ¥Ù•¥±Ñ•È°•™™•Ñ¥Ù•M•…É¡t°(€€¤ì(€½¹ÍĞµ…ÁI•ÍÕ±Ñ	½Õ¹‘Í-•ä€ô€‘íÕÉ±MÑ…Ñ”¹µ½‘•ôè‘í…Ñ¥Ù•¥±Ñ•Éôè‘íÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğ€‰¹½¹”‰ôè‘íÕÉ±MÑ…Ñ”¹±…å•Èñğ€‰¹½¹”‰ôè‘í‘¥ÍÑÉ¥Ñôè‘í•™™•Ñ¥Ù•M•…É ñğ€‰¹½¹”‰ôè‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ¡õ€ì(€½¹ÍĞµ…É­•É1…å½ÕÑ½¹Ñ•áĞ€ôÕÍ•5•µ¼  ¤€ôø€¡ì(€€€‰½Õ¹‘ÌèÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹‰½Õ¹‘ÌñğÙ¥•İÁ½ÉÑ	½Õ¹‘ÍI•˜¹ÕÉÉ•¹Ğñğ¹Õ±°°(€€€é½½´è•ÑMÑ…‰±•5…É­•Éi½½´ (€€€€€Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹‰½Õ¹‘Ìü¹é½½´ñğµ…Ái½½µI•˜¹ÕÉÉ•¹Ğñğ¥¹¥Ñ¥…±5…ÁY¥•Ü¹é½½´°(€€€€¤°(€ô¤°mµ…ÁI•ÍÕ±Ñ	½Õ¹‘Í-•ä°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå-•åt¤ì(€½¹ÍĞ½Ù•É¹•‘5…É­•É…¹‘¥‘…Ñ•Ì€ôÕÍ•5•µ¼  ¤€ôøì(€€€½¹ÍĞÍ¡½Õ±‘AÉ•Í•ÉÙ•1¥ÍÑ¥¹A¥¹Ì€ô…Ñ¥Ù•¥±Ñ•È€ôôô€‰I•¹Ñ…±Ìˆñğ…Ñ¥Ù•¥±Ñ•È€ôôô€‰1••¹‘Ìˆñğ…Ñ¥Ù•¥±Ñ•È€ôôô€‰1¥ÍÑ¥¹Ìˆñğ…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°1¥ÍÑ¥¹Ìˆì(€€€½¹ÍĞÁ¥¹M½ÕÉ•A±…•Ì€ôÍ¡½Õ±‘AÉ•Í•ÉÙ•1¥ÍÑ¥¹A¥¹Ì(€€€€€€ü‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì(€€€€€€è‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôø€…¥ÍU¹¥Ñ1•Ù•±1¥ÍÑ¥¹A±…”¡Á±…”¤ñğ¥Í1••¹‘ÍQ½Á1¥ÍÑ¥¹A±…”¡Á±…”¤¤ì((€€€¥˜€¡…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ ¤ì(€€€€€É•ÑÕÉ¸ì(€€€€€€€¥¹Ñ•¹Ñ%è…Ñ¥Ù•…¹½¹¥…±%¹Ñ•¹Ñ%°(€€€€€€€±¥µ¥Ğè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹±•¹Ñ °(€€€€€€€Á±…•Ìè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ°(€€€€€€€µ…É­•ÉA…å±½…è…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹µ…À ¡Á±…”¤€ôø€¡ì(€€€€€€€€€¥èÁ±…”¹¥°(€€€€€€€€€±…ĞèÁ±…”¹±…Ñ¥ÑÕ‘”°(€€€€€€€€€±¹œèÁ±…”¹±½¹¥ÑÕ‘”°(€€€€€€€€€±…‰•°èÁ±…”¹¹…µ”°(€€€€€€€€€•¹Ñ¥ÑåQåÁ”èÁ±…”¹ÑåÁ”ñğÁ±…”¹…Ñ•½Éäñğ€‰É½ÕÑ•}ÍÑ½Àˆ°(€€€€€€€€€ÁÉ¥µ…Éå%¹Ñ•¹Ñ%è…Ñ¥Ù•…¹½¹¥…±%¹Ñ•¹Ñ%°(€€€€€€€€€¥½¹-•äèÁ±…”¹Á¥¹-•äñğ€‰ÑÉ…¥°ˆ°(€€€€€€€€€ÁÉ¥½É¥ÑåQ¥•Èè€Ä°(€€€€€€€€€¡…ÍÑ¥Ù•A•É¬è¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤°(€€€€€€€€€¡…ÍÑ¥Ù•…µÁ…¥¸è	½½±•…¸¡Á±…”¹…µÁ…¥¹%ñğÁ±…”¹É…Üü¹…µÁ…¥¹%¤°(€€€€€€€ô¤¤°(€€€€€€€Ñ½Ñ…±…¹‘¥‘…Ñ•Ìè…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ¹±•¹Ñ °(€€€€€ôì(€€€ô((€€€É•ÑÕÉ¸•ÑY¥•İÁ½ÉÑ	½Õ¹‘•‘5…É­•ÉA±…•Ì¡Á¥¹M½ÕÉ•A±…•Ì°ì(€€€€€…Ñ¥Ù•¥±Ñ•È°(€€€€€ÅÕ•Éäè•™™•Ñ¥Ù•M•…É °(€€€€€Ù¥•İÁ½ÉÑ	½Õ¹‘Ìèµ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹‰½Õ¹‘Ì°(€€€€€é½½´èµ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹é½½´°(€€€€€Í•±•Ñ•‘%°(€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€ô¤ì(€ô°m…Ñ¥Ù•…¹½¹¥…±%¹Ñ•¹Ñ%°…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”°…Ñ¥Ù•¥±Ñ•È°‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì°•™™•Ñ¥Ù•M•…É °µ…É­•É1…å½ÕÑ½¹Ñ•áĞ°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹µ½‘•t¤ì(€½¹ÍĞµ…ÁA±…•Ì€ôÕÍ•5•µ¼  ¤€ôøì(€€€¥˜€¡…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ ¤É•ÑÕÉ¸…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌì((€€€½¹ÍĞµ…É­•ÉM½ÕÉ•A±…•Ì€ô¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”(€€€€€€ü‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì(€€€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôøÁ±…”ü¹¡…Íá…Ñ5…É­•È€„ôô™…±Í”ñğ	½½±•…¸¡•ÑA±…•½½É‘Ì¡Á±…”¤¤¤(€€€€€€€€¹Í±¥” À°%9%Q%1}%M=YIe}5I-I}1%5%P¤(€€€€€€è½Ù•É¹•‘5…É­•É…¹‘¥‘…Ñ•Ì¹Á±…•Ìì(€€€½¹ÍĞÍ•±•Ñ•‘5…É­•ÉA±…•Ì€ôÍ•±•ÑAÉ½É•ÍÍ¥Ù•5…É­•ÉA±…•Ì¡µ…É­•ÉM½ÕÉ•A±…•Ì°ì(€€€€€…Ñ¥Ù•¥±Ñ•È°(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€•™™•Ñ¥Ù•M•…É °(€€€€€¥¹Ñ•¹ĞèÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ°(€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€€€µ…Ái½½´èµ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹é½½´°(€€€€€Í•±•Ñ•‘%°(€€€€€Í…Ù•‘%‘Ì°(€€€€€ÕÍ•É!…Í9…Ù¥…Ñ•‘5…À°(€€€€€¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”°(€€€ô¤ì((€€€½¹ÍĞÍ¡½Õ±‘±•Ù…Ñ•1••¹‘ÍQ½Á1¥ÍÑ¥¹Ì€ô(€€€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆñğ(€€€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰1••¹‘Ìˆñğ(€€€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰1¥ÍÑ¥¹Ìˆñğ(€€€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰1¥Ù¥¹œ!•É”ˆñğ(€€€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°1¥ÍÑ¥¹Ìˆñğ(€€€€€€½qˆ¡±••¹‘Íñ±¥ÍÑ¥¹ñµ±Íñ½¹‘½ñ™½ÈÍ…±•ñ‘½İ¹Ñ½İ¸¡½µ•Ì¥qˆ½¤¹Ñ•ÍĞ¡•™™•Ñ¥Ù•M•…É ñğ€ˆˆ¤ì(€€€½¹ÍĞ±••¹‘ÍQ½Á1¥ÍÑ¥¹A¥¹Ì€ôÍ¡½Õ±‘±•Ù…Ñ•1••¹‘ÍQ½Á1¥ÍÑ¥¹Ì(€€€€€€ü‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì(€€€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôø¥Í1••¹‘ÍQ½Á1¥ÍÑ¥¹A±…”¡Á±…”¤¤(€€€€€€€€¹Í½ÉĞ ¡„°ˆ¤€ôøì(€€€€€€€€€½¹ÍĞ…I…¹¬€ô9Õµ‰•È¡•Ñ1••¹‘Í1¥ÍÑ¥¹œ¡„¤ü¹Ñ½Á1¥ÍÑ¥¹I…¹¬ñğ„ü¹Ñ½Á1¥ÍÑ¥¹I…¹¬ñğ€ää¤ì(€€€€€€€€€½¹ÍĞ‰I…¹¬€ô9Õµ‰•È¡•Ñ1••¹‘Í1¥ÍÑ¥¹œ¡ˆ¤ü¹Ñ½Á1¥ÍÑ¥¹I…¹¬ñğˆü¹Ñ½Á1¥ÍÑ¥¹I…¹¬ñğ€ää¤ì(€€€€€€€€€É•ÑÕÉ¸…I…¹¬€´‰I…¹¬ì(€€€€€€€ô¤(€€€€€€€€¹Í±¥” À°€Ô¤(€€€€€€èmtì((€€€É•ÑÕÉ¸‘•‘ÕÁ•5…ÁA¥¹A±…•Ì¡l¸¸¹±••¹‘ÍQ½Á1¥ÍÑ¥¹A¥¹Ì°€¸¸¹Í•±•Ñ•‘5…É­•ÉA±…•Ít¤ì(€ô°m…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”°…Ñ¥Ù•¥±Ñ•È°‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì°•™™•Ñ¥Ù•M•…É °½Ù•É¹•‘5…É­•É…¹‘¥‘…Ñ•Ì¹Á±…•Ì°¥Í•™…Õ±Ñ¥Í½Ù•ÉM½Á”°µ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹é½½´°Í…Ù•‘%‘Ì°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ°ÕÉ±MÑ…Ñ”¹µ½‘”°ÕÍ•É!…Í9…Ù¥…Ñ•‘5…Át¤ì(€½¹ÍĞµ…ÁÁ…‰±•A±…•Ì€ôÕÍ•5•µ¼ (€€€€ ¤€ôøµ…ÁA±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøÁ±…”ü¹¡…Íá…Ñ5…É­•È€„ôô™…±Í”ñğ	½½±•…¸¡•ÑA±…•½½É‘Ì¡Á±…”¤¤¤°(€€€mµ…ÁA±…•Ít°(€€¤ì(€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€¡Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ€„ôô€‰ÍÕ•ÍÌˆñğ€…Í½Á•‘1…ÍÑQÉ¥•Èñğ€…µ…ÁÁ…‰±•A±…•Ì¹±•¹Ñ ¤É•ÑÕÉ¸Õ¹‘•™¥¹•ì(€€€½¹ÍĞ¥µÁÉ•ÍÍ¥½¹Q¥µ•È€ôİ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøì(€€€€€µ…ÁÁ…‰±•A±…•Ì¹™½É…  ¡Á±…”°¥¹‘•à¤€ôøì(€€€€€€€½¹ÍĞ¥µÁÉ•ÍÍ¥½¹-•ä€ô€‘íÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå-•åôè‘íÁ±…”¹¥‘õ€ì(€€€€€€€¥˜€¡Ù¥•İ•‘A¥¹-•åÍI•˜¹ÕÉÉ•¹Ğ¹¡…Ì¡¥µÁÉ•ÍÍ¥½¹-•ä¤¤É•ÑÕÉ¸ì(€€€€€€€Ù¥•İ•‘A¥¹-•åÍI•˜¹ÕÉÉ•¹Ğ¹…‘¡¥µÁÉ•ÍÍ¥½¹-•ä¤ì(€€€€€€€½¹ÍĞÉ…Ü€ôÁ±…”¹É…Üñğíôì(€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½¥µÁÉ•ÍÍ¥½¸ˆ°ì(€€€€€€€€€•Ù•¹Ñ}¹…µ”è€‰Á¥¹}Ù¥•İ•ˆ°(€€€€€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€€€€€Á¥¹}¥èÁ±…”¹¥°(€€€€€€€€€•¹Ñ¥Ñå%èÁ±…”¹•¹Ñ¥Ñå}¥ñğÁ±…”¹•¹Ñ¥Ñå%ñğÁ±…”¹¥°(€€€€€€€€€•¹Ñ¥ÑåQåÁ”èÁ±…”¹•¹Ñ¥Ñå}ÑåÁ”ñğİ½É­™±½İ¹Ñ¥ÑåQåÁ”¡Á±…”¤°(€€€€€€€€€Ñ•¹…¹Ñ}¥èÁ±…”¹Ñ•¹…¹Ñ}¥ñğÉ…Ü¹Ñ•¹…¹Ñ}¥ñğ¹Õ±°°(€€€€€€€€€İ½É­ÍÁ…•}¥èÁ±…”¹İ½É­ÍÁ…•}¥ñğÉ…Ü¹İ½É­ÍÁ…•}¥ñğ¹Õ±°°(€€€€€€€€€Á…ÉÑ¹•É}¥èÁ±…”¹Á…ÉÑ¹•É}¥ñğÉ…Ü¹Á…ÉÑ¹•É}¥ñğ¹Õ±°°(€€€€€€€€€ÁÉ½Á•ÉÑå}¥èÁ±…”¹ÁÉ½Á•ÉÑå}¥ñğÉ…Ü¹ÁÉ½Á•ÉÑå}¥ñğ¹Õ±°°(€€€€€€€€€‰Õ¥±‘¥¹}¥èÁ±…”¹‰Õ¥±‘¥¹}¥ñğÉ…Ü¹‰Õ¥±‘¥¹}¥ñğ¹Õ±°°(€€€€€€€€€…µÁ…¥¹}¥èÁ±…”¹…µÁ…¥¹}¥ñğÉ…Ü¹…µÁ…¥¹}¥ñğ¹Õ±°°(€€€€€€€€€Á•É­}¥èÁ±…”¹Á•É­}¥ñğÉ…Ü¹Á•É­}¥ñğ¹Õ±°°(€€€€€€€€€•Ù•¹Ñ}¥èÁ±…”¹•Ù•¹Ñ}¥ñğÉ…Ü¹•Ù•¹Ñ}¥ñğ¹Õ±°°(€€€€€€€€€ÅÕ•Éå}¥èÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå%ñğ€ˆˆ°(€€€€€€€€€Í•…É¡}ÅÕ•Éäè•™™•Ñ¥Ù•M•…É °(€€€€€€€€€¥¹Ñ•ÉÁÉ•Ñ•‘}¥¹Ñ•¹ĞèÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹¥¹Ñ•¹Ğñğ€ˆˆ°(€€€€€€€€€É•ÍÕ±Ñ}É…¹¬è¥¹‘•à°(€€€€€€€€€Í½ÕÉ”èÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹Í½ÕÉ”ñğ€‰‘¥É•ĞµÍ•…É ˆ°(€€€€€€€€€½ÕÉÉ•‘}…Ğè¹•Ü…Ñ” ¤¹Ñ½%M=MÑÉ¥¹œ ¤°(€€€€€€€€€±…ĞèÁ±…”¹±…Ñ¥ÑÕ‘”ñğÁ±…”¹±…ĞñğÁ±…”¹½½É‘Ìü¹lÁtñğUMQ%9}9QIlÁt°(€€€€€€€€€±¹œèÁ±…”¹±½¹¥ÑÕ‘”ñğÁ±…”¹±¹œñğÁ±…”¹½½É‘Ìü¹lÅtñğUMQ%9}9QIlÅt°(€€€€€€€ô¤ì(€€€€€ô¤ì(€€€ô°€ÔÀÀ¤ì(€€€É•ÑÕÉ¸€ ¤€ôøİ¥¹‘½Ü¹±•…ÉQ¥µ•½ÕĞ¡¥µÁÉ•ÍÍ¥½¹Q¥µ•È¤ì(€ô°m•™™•Ñ¥Ù•M•…É °µ…ÁÁ…‰±•A±…•Ì°Í½Á•‘1…ÍÑQÉ¥•È°Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹¥¹Ñ•¹Ğ°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå%°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå-•ä°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹Í½ÕÉ•t¤ì(€½¹ÍĞÙ¥Í¥‰±•1••¹‘ÍA±…•Ì€ôÕÍ•5•µ¼ (€€€€ ¤€ôø‘•‘ÕÁ•5…ÁA¥¹A±…•Ì¡‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¤¹™¥±Ñ•È ¡Á±…”¤€ôø¥Í1••¹‘Í5…ÁA±…”¡Á±…”¤¤°(€€€m‘¥Í½Ù•É¥ÍÁ±…åA±…•Ít°(€€¤ì(€½¹ÍĞÍÑ…‰±•±ÕÍÑ•Éi½½´€ôµ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹é½½´ì(€½¹ÍĞ±ÕÍÑ•É•‘5…Á%Ñ•µÌ€ôÕÍ•5•µ¼ (€€€€ ¤€ôø…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ (€€€€€€ü±ÕÍÑ•ÉA±…•Ì¡…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ°ÍÑ…‰±•±ÕÍÑ•Éi½½´°Í•±•Ñ•‘%¤(€€€€€€è±ÕÍÑ•ÉA±…•Ì¡µ…ÁÁ…‰±•A±…•Ì°ÍÑ…‰±•±ÕÍÑ•Éi½½´°Í•±•Ñ•‘%¤°(€€€m…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”°µ…ÁÁ…‰±•A±…•Ì°Í•±•Ñ•‘%°ÍÑ…‰±•±ÕÍÑ•Éi½½µt°(€€¤ì(€½¹ÍĞ¥ÍMÑÉ••Ñ1•Ù•±5…ÁY¥•Ü€ôµ…Ái½½´€øôMQIQ}1Y1}i==4ñğ€¡Ù¥•İÁ½ÉÑ	½Õ¹‘Ìü¹é½½´ñğ€À¤€øôMQIQ}1Y1}i==4ì(€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€¡Í•±•Ñ•¤É•ÑÕÉ¸ì(€€€½¹ÍĞµ…Á5…Ñ €ôÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°µ…ÁA±…•Ì¤ì(€€€¥˜€¡µ…Á5…Ñ ¤Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡µ…Á5…Ñ ¤ì(€ô°mµ…ÁA±…•Ì°Í•±•Ñ•°Í•±•Ñ•‘%‘t¤ì(€½¹ÍĞÁÉ•Ù¥•İ1¥µ¥Ğ€ôÉ•ÍÕ±ÑÍáÁ…¹‘•€ü€ÄÈ€è€Ğì(€½¹ÍĞÁÉ•Ù¥•İA±…•Ì€ô‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹Í±¥” À°ÁÉ•Ù¥•İ1¥µ¥Ğ¤ì(€½¹ÍĞ¥ÍI•¹Ñ…±1…å•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜…Ñ¥Ù•¥±Ñ•È€ôôô€‰I•¹Ñ…±Ìˆì(€½¹ÍĞ¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ôl‰I•¹Ñ…±Ìˆ°€‰1¥Ù¥¹œ!•É”ˆ°€‰1••¹‘Ìˆ°€‰±°1¥ÍÑ¥¹Ì‰t¹¥¹±Õ‘•Ì¡…Ñ¥Ù•¥±Ñ•È¤ì(€½¹ÍĞ¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Í…Ù•ˆì(€½¹ÍĞÍ…Ù•‘É…İ•ÉA±…•Ì€ôÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹Í±¥” À°ÁÉ•Ù¥•İ1¥µ¥Ğ¤ì(€½¹ÍĞ¥ÍI•Í¥‘•¹ÑÙ•¹ÑÍÉ…İ•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰•Ù•¹ÑÌˆì(€½¹ÍĞ‘É…İ•ÉAÉ•Ù¥•İA±…•Ì€ô¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È(€€€€üÍ…Ù•‘É…İ•ÉA±…•Ì(€€€€è¥ÍI•Í¥‘•¹ÑÙ•¹ÑÍÉ…İ•È(€€€€€€ü‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹Í±¥” À°€àÀ¤(€€€€€€èÁÉ•Ù¥•İA±…•Ìì(€½¹ÍĞ±••¹‘Í¥É•Ñ½ÉåA±…•Ì€ô¥Í1••¹‘Í¥É•Ñ½Éå1…å•È(€€€€ü‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì(€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôø¥ÍI•¹Ñ…±¹Ñ¥Ñä¡Á±…”¤ñğ•Ñ1••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±•½ÉA±…”¡Á±…”¤ñğ¥Í1••¹‘Í5…ÁA±…”¡Á±…”¤¤(€€€€€€¹Í±¥” À°€àÀ¤(€€€€èmtì(€½¹ÍĞ¡¥‘‘•¹AÉ•Ù¥•İ½Õ¹Ğ€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸¡‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ °€ÄÈ¤€´ÁÉ•Ù¥•İA±…•Ì¹±•¹Ñ ¤ì(€½¹ÍĞ¡¥‘‘•¹M…Ù•‘AÉ•Ù¥•İ½Õ¹Ğ€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸¡É•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ °€ÄÈ¤€´Í…Ù•‘É…İ•ÉA±…•Ì¹±•¹Ñ ¤ì(€½¹ÍĞÍ•…É¡A±…•¡½±‘•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€ü€‰Í¬…‰½ÕĞ…µÁ…¥¹Ì°¹•…É‰äÕÍ”°½ÈÍ…Ù•Á±…•Ìˆ(€€€€è€‰Í¬…‰½ÕĞÁ±…•Ì°Á•É­Ì°•Ù•¹ÑÌ°½È¥Ù¥ŒÕÁ‘…Ñ•Ìˆì(€½¹ÍĞÍ•…É¡½¹Í½±•1…‰•°€ô€‰Í¬Ñ¡”µ…Àˆì(€½¹ÍĞ…É•…I…¥±1…‰•°€ô•ÑÉ•…I…¥±1…‰•°¡ÕÉ±MÑ…Ñ”¹µ½‘”°…Ñ¥Ù•¥±Ñ•È¤ì(€½¹ÍĞ…±±É•…1…‰•°€ô•Ñ±±É•…1…‰•°¡ÕÉ±MÑ…Ñ”¹µ½‘”°…Ñ¥Ù•¥±Ñ•È¤ì(€½¹ÍĞÕÉ±A…ÉÑ¹•ÉA…¹•°€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜5A}9Q%Y}AIQ9I}A91L¹¥¹±Õ‘•Ì¡ÕÉ±MÑ…Ñ”¹Ñ…ˆ¤€üÕÉ±MÑ…Ñ”¹Ñ…ˆ€è€ˆˆì(€½¹ÍĞ…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôÕÉ±A…ÉÑ¹•ÉA…¹•°ñğ€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜5A}9Q%Y}AIQ9I}A91L¹¥¹±Õ‘•Ì¡…Ñ¥Ù•	½ÑÑ½µQ…ˆ¤€ü…Ñ¥Ù•	½ÑÑ½µQ…ˆ€è€ˆˆ¤ì(€½¹ÍĞÉ•Í¥‘•¹ÑA…¹•±½Áä€ôì(€€€Á•É­Ìèì(€€€€€•å•‰É½Üè€‰A•É­Ìˆ°(€€€€€Ñ¥Ñ±”è€‰UÍ•™Õ°½™™•ÉÌ¹•…É‰ä¸ˆ°(€€€€€‰½‘äè€‰A±…•Ìİ¥Ñ É•Í¥‘•¹ĞÙ…±Õ”°…Éµ½µ•¹ÑÌ°½È½™™•ÉÌİ½ÉÑ Í…Ù¥¹œ¸ˆ°(€€€ô°(€€€•Ù•¹ÑÌèì(€€€€€•å•‰É½Üè€‰Ù•¹ÑÌˆ°(€€€€€Ñ¥Ñ±”è€‰9•…É‰ä¹½Ü¸ˆ°(€€€€€‰½‘äè€‰Ù•¹ÑÌ°µÕÍ¥Œ°Á…É¬µ½µ•¹ÑÌ°…¹Á±…¹Ì±½Í”•¹½Õ Ñ¼ÕÍ”¸ˆ°(€€€ô°(€€€Í…Ù•èì(€€€€€•å•‰É½Üè€‰5d=]9Q=]8ˆ°(€€€€€Ñ¥Ñ±”è€‰M…Ù•½İ¹Ñ½İ¸ˆ°(€€€€€‰½‘äè€‰A±…•Ì°•Ù•¹ÑÌ…¹•áÁ•É¥•¹•Ìå½ÔÙ”¡½Í•¸Ñ¼½µ”‰…¬Ñ¼¸ˆ°(€€€ô°(€õm¥ÍI•¹Ñ…±1…å•È€ü€‰É•¹Ñ…±Ìˆ€è…Ñ¥Ù•	½ÑÑ½µQ…‰tñğ€¡¥ÍI•¹Ñ…±1…å•È€üì(€€€•å•‰É½Üè€‰I•¹Ñ…±Ìˆ°(€€€Ñ¥Ñ±”è€‰½İ¹Ñ½İ¸É•¹Ñ…±Ì½¸Ñ¡”µ…À¸ˆ°(€€€‰½‘äè€‰	Õ¥±‘¥¹œµ™¥ÉÍĞ±¥ÍÑ¥¹Ìİ¥Ñ ¹•…É‰äÁ•É­Ì°…µ•¹¥Ñ¥•Ì°…¹İ…±­¥¹œ½¹Ñ•áĞ¸ˆ°(€ô€è¹Õ±°¤ì(€½¹ÍĞÉ•Í¥‘•¹ÑI•ÍÕ±Ñ½Õ¹Ñ1…‰•°€ô¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È(€€€€ü€‘íÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ¡ôÍ…Ù•€‘íÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ €ôôô€Ä€ü€‰Á±…”ˆ€è€‰Á±…•Ì‰õ€(€€€€è…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ìˆ(€€€€€€ü€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ¡ô…Ñ¥Ù”€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ €ôôô€Ä€ü€‰½™™•Èˆ€è€‰½™™•ÉÌ‰ô¥¸Ñ¡¥Ìµ…À…É•…€(€€€€€€è…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰•Ù•¹ÑÌˆ(€€€€€€€€ü€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ¡ô€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ €ôôô€Ä€ü€‰•Ù•¹Ğˆ€è€‰•Ù•¹ÑÌ‰ô¥¸Ñ¡¥Ìµ…À…É•…€(€€€€€€€€è€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ¡ôµ…Ñ¡¥¹œ€‘í‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ €ôôô€Ä€ü€‰Á±…”ˆ€è€‰Á±…•Ì‰õ€ì(€½¹ÍĞÁ…¹•±A±…•Ì€ôÁÉ•Ù¥•İA±…•Ì¹±•¹Ñ €üÁÉ•Ù¥•İA±…•Ì€è‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹Í±¥” À°€à¤ì(€½¹ÍĞÍ•…É¡Q¥µ•=ÁÑ¥½¹Ì€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üAIQ9I}Q%5}%1QIL€èIM%9Q}Q%5}%1QILì(€½¹ÍĞÍ•…É¡%¹Ñ•¹Ñ=ÁÑ¥½¹Ì€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üAIQ9I}%9Q9Q}%1QIL€èIM%9Q}%9Q9Q}%1QILì(€½¹ÍĞ…Ñ¥Ù•M•…É¡MÕµµ…Éä€ôl(€€€•™™•Ñ¥Ù•M•…É ñğ€¡…Ñ¥Ù•¥±Ñ•È€„ôô€‰±°ˆ€ü…Ñ¥Ù•¥±Ñ•È€è€ˆˆ¤°(€€€€…¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü‘¥ÍÑÉ¥Ğ€è€ˆˆ°(€€€ÕÉ±MÑ…Ñ”¹Ñ¥µ”°(€t¹™¥±Ñ•È¡	½½±•…¸¤ì(€½¹ÍĞÉ•ÍÕ±ÑÍ½¹Ñ•áÑ1¥¹”€ô…Ñ¥Ù•M•…É¡MÕµµ…Éä¹±•¹Ñ (€€€€üÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€€€ü€‰M¡½İ¥¹œÕÍ•™Õ°µ…Ñ¡•Ì¹•…É‰ä¸ˆ(€€€€€€èM¡½İ¥¹œ€‘í…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€ü€‰Á±…•Ìˆ€è…Ñ¥Ù•¥±Ñ•È¹Ñ½1½İ•É…Í” ¥ô¹•…É‰ä¹€(€€€€è€ˆˆì((€™Õ¹Ñ¥½¸Á±…•¥ÍÑ…¹•1…‰•°¡Á±…”¤ì(€€€½¹ÍĞ½½É‘Ì€ô•ÑA±…•½½É‘Ì¡Á±…”¤ì(€€€¥˜€ …½½É‘Ì¤É•ÑÕÉ¸€‰¹•…É‰äˆì(€€€½¹ÍĞ±…Ñ•±Ñ„€ô½½É‘ÍlÁt€´UMQ%9}9QIlÁtì(€€€½¹ÍĞ±¹•±Ñ„€ô€¡½½É‘ÍlÅt€´UMQ%9}9QIlÅt¤€¨5…Ñ ¹½Ì  ¡½½É‘ÍlÁt€¬UMQ%9}9QIlÁt¤€¼€È¤€¨€¡5…Ñ ¹A$€¼€ÄàÀ¤¤ì(€€€½¹ÍĞµ¥±•Ì€ô5…Ñ ¹ÍÅÉĞ ¡±…Ñ•±Ñ„€¨€Øä¤€¨¨€È€¬€¡±¹•±Ñ„€¨€Øä¤€¨¨€È¤ì(€€€É•ÑÕÉ¸€‘í5…Ñ ¹µ…à À¸Ä°µ¥±•Ì¤¹Ñ½¥á• Ä¥ôµ¥€ì(€ô((€™Õ¹Ñ¥½¸•¹Ñ¥Ñå…É‘½Áä¡Á±…”¤ì(€€€½¹ÍĞ½™™•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü•ÑA…ÉÑ¹•ÉA…¹•±½Áä¡Á±…”¤€è•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€É•ÑÕÉ¸ÑÉÕ¹…Ñ•A…¹•±½Áä (€€€€€½™™•Èü¹Ñ¥Ñ±”ñğ(€€€€€½™™•Èü¹½™™•Èñğ(€€€€€Á±…”¹É•½µµ•¹‘•‘}Á•É¬ñğ(€€€€€Á±…”¹Á•É¬ü¹½™™•Èñğ(€€€€€Á±…”¹Á…ÉÑ¹•É}½ÁÁ½ÉÑÕ¹¥Ñäñğ(€€€€€Á±…”¹ÍÕµµ…Éäñğ(€€€€€Á±…”¹‘•ÍÉ¥ÁÑ¥½¸ñğ(€€€€€Á±…”¹É…Üü¹ÍÕµµ…Éäñğ(€€€€€€‰=Á•¸Ñ¡”ÍÁ•¥™¥Œ…µÁ…¥¸…Ñ¥½¸™½ÈÑ¡¥ÌÁ¥¸¸ˆ°(€€€€€€àØ°(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•É¹Ñ¥Ñå…É¡Á±…”°…Ñ¥½¹1…‰•°€ô€‰=Á•¸ˆ¤ì(€€€½¹ÍĞ¥µ…”€ôÉ•Í½±Ù•¹Ñ¥Ñå%µ…”¡Á±…”°€‰…Éˆ¤ì(€€€½¹ÍĞÍ…Ù•€ôÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤ì(€€€½¹ÍĞ½™™•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü•ÑA…ÉÑ¹•ÉA…¹•±½Áä¡Á±…”¤€è•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€É•ÑÕÉ¸€ (€€€€€€ñ…ÉÑ¥±”­•äõíÁ±…”¹¥‘ô±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ‘¥Í½Ù•Éäµ…É‘ÀµÑ…ˆµÁ•É¬µ…Éˆø(€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ‘¥Í½Ù•Éäµµ•‘¥„ˆ(€€€€€€€€€…É¥„µ±…‰•°õí=Á•¸€‘íÁ±…”¹¹…µ•õô(€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô(€€€€€€€€ø(€€€€€€€€€í¥µ…”€ü€ñ¥µœ…±ĞõíÁ±…”¹¹…µ•ôÍÉŒõí¥µ…•ô€¼ø€è¹Õ±±ô(€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ‘¥Í½Ù•Éäµ‰½‘äˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Üµµ•Ñ„ˆø(€€€€€€€€€€€€ñÍÁ…¸ùím½™™•Èü¹…Ñ•½ÉäñğÁ±…”¹…Ñ•½ÉäñğÁ±…”¹ÑåÁ”ñğ€‰Á±…”ˆ°Á±…”¹‘¥ÍÑÉ¥ĞñğÁ±…”¹¹•¥¡‰½É¡½½ñğ€‰½İ¹Ñ½İ¸ˆ°Á±…•¥ÍÑ…¹•1…‰•°¡Á±…”¥t¹™¥±Ñ•È¡	½½±•…¸¤¹©½¥¸ ˆƒŠˆ€ˆ¥ôğ½ÍÁ…¸ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ñ ÌùíÁ±…”¹¹…µ•ôğ½ Ìø(€€€€€€€€€€ñÀùí•¹Ñ¥Ñå…É‘½Áä¡Á±…”¥ôğ½Àø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥É¥µ½±Ì´È…À´Èˆø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÁÉ¥µ…Éäµ…Ñ¥½¸Áà´ÌÁä´ÈÑ•áĞµlÄÁÁát™½¹ĞµÍ•µ¥‰½±ˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ôø(€€€€€€€€€€€€€í…Ñ¥½¹1…‰•±ô(€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍ•½¹‘…Éäµ…Ñ¥½¸ˆ…É¥„µÁÉ•ÍÍ•õíÍ…Ù•‘ô½¹±¥¬õì ¤€ôøÑ½±•M…Ù•¡Á±…”¥ôø(€€€€€€€€€€€€€íÍ…Ù•€ü€‰M…Ù•ˆ€è€‰M…Ù”‰ô(€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½…ÉÑ¥±”ø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•É½µÁ…Ñ¹Ñ¥ÑåI½Ü¡Á±…”°…Ñ¥½¹1…‰•°€ô€‰=Á•¸ˆ¤ì(€€€½¹ÍĞ½™™•È€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü•ÑA…ÉÑ¹•ÉA…¹•±½Áä¡Á±…”¤€è•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€½¹ÍĞ½™™•É1¥¹”€ô½™™•Èü¹Ñ¥Ñ±”ñğ½™™•Èü¹½™™•Èñğ€ˆˆì(€€€É•ÑÕÉ¸€ (€€€€€€ñ‰ÕÑÑ½¸­•äõíÁ±…”¹¥‘ôÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Ü‘Àµ½µÁ…ĞµÁ±…”µÉ½Üˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ôø(€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µµ…¥¸ˆø(€€€€€€€€€€ñÍÁ…¸ø(€€€€€€€€€€€€ñÍÑÉ½¹œùíÁ±…”¹¹…µ•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ñÍµ…±°ùím½™™•É1¥¹”ñğÁ±…”¹…Ñ•½ÉäñğÁ±…”¹ÑåÁ”ñğ€‰A±…”ˆ°Á±…”¹‘¥ÍÑÉ¥ĞñğÁ±…”¹¹•¥¡‰½É¡½½ñğ€‰½İ¹Ñ½İ¸ˆ°Á±…•¥ÍÑ…¹•1…‰•°¡Á±…”¥t¹™¥±Ñ•È¡	½½±•…¸¤¹©½¥¸ ˆƒŠˆ€ˆ¥ôğ½Íµ…±°ø(€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ½µÁ…ĞµÁ±…”µ…Ñ¥½¹Ìˆø(€€€€€€€€€€ñ•´ùí…Ñ¥½¹1…‰•±ôğ½•´ø(€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸•ÑM…Ù•‘%Ñ•µÉ½ÕÀ¡Á±…”¤ì(€€€½¹ÍĞ­¥¹€ô•ÑI•Í¥‘•¹Ñ¹Ñ¥Ñå-¥¹¡Á±…”¤ì(€€€½¹ÍĞÑ•áĞ€ôÁ±…•Q•áĞ¡Á±…”¤ì(€€€¥˜€¡­¥¹€ôôô€‰•Ù•¹Ğˆñğ¥ÍÙ•¹Ñ¹Ñ¥Ñä¡Á±…”¤ñğ€½qˆ¡ÉÍÙÁñÑ½¹¥¡ÑñÑ¡¥ÌÑ¡ÕÉÍ‘…åñÍ¡½İ…Í•ñ™¥ÉÍĞÑ¡ÕÉÍ‘…åñ±…ÍÍñ½¹•ÉĞ¥qˆ½¤¹Ñ•ÍĞ¡Ñ•áĞ¤¤É•ÑÕÉ¸€‰•Ù•¹ÑÌˆì(€€€¥˜€¡¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤ñğ­¥¹€ôôô€‰Á•É¬ˆñğ¥Í	É…¹‘¹Ñ¥Ñä¡Á±…”¤ñğ€½qˆ¡‰•¹•™¥Ññ½™™•ÉñÉ•Í¥‘•¹Ğ…•ÍÍñ‘¥Í½Õ¹Ññ•¹É…Ù¥¹ñÁ•É¬¥qˆ½¤¹Ñ•ÍĞ¡Ñ•áĞ¤¤É•ÑÕÉ¸€‰‰•¹•™¥ÑÌˆì(€€€É•ÑÕÉ¸€‰Á±…•Ìˆì(€ô((€™Õ¹Ñ¥½¸•ÑM…Ù•‘%Ñ•µ½Áä¡Á±…”¤ì(€€€½¹ÍĞ½™™•È€ô•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€½¹ÍĞÉ…İ½Áä€ô½™™•Èü¹Ñ¥Ñ±”ñğ½™™•Èü¹½™™•ÈñğÁ±…”¹ÍÕµµ…ÉäñğÁ±…”¹‘•ÍÉ¥ÁÑ¥½¸ñğÁ±…”¹É…Üü¹ÍÕµµ…ÉäñğÁ±…”¹É…Üü¹‘•ÍÉ¥ÁÑ¥½¸ñğ€ˆˆì(€€€¥˜€¡É…İ½Áä¤É•ÑÕÉ¸ÑÉÕ¹…Ñ•A…¹•±½Áä¡É…İ½Áä°€äØ¤ì(€€€¥˜€¡•ÑM…Ù•‘%Ñ•µÉ½ÕÀ¡Á±…”¤€ôôô€‰•Ù•¹ÑÌˆ¤É•ÑÕÉ¸€‰¸•áÁ•É¥•¹”İ½ÉÑ Á±…¹¹¥¹œ…É½Õ¹İ¡¥±”å½Ô…É”‘½İ¹Ñ½İ¸¸ˆì(€€€¥˜€¡•ÑM…Ù•‘%Ñ•µÉ½ÕÀ¡Á±…”¤€ôôô€‰‰•¹•™¥ÑÌˆ¤É•ÑÕÉ¸€‰É•Í¥‘•¹Ğ‰•¹•™¥Ğİ½ÉÑ ÕÍ¥¹œİ¡•¸å½Ô…É”¹•…É‰ä¸ˆì(€€€É•ÑÕÉ¸€‰‘½İ¹Ñ½İ¸Á±…”İ½ÉÑ É•Ù¥Í¥Ñ¥¹œİ¡•¸Ñ¡”Á±…¸½µ•ÌÑ½•Ñ¡•È¸ˆì(€ô((€™Õ¹Ñ¥½¸•ÑM…Ù•‘1½…Ñ¥½¹1…‰•°¡Á±…”¤ì(€€€É•ÑÕÉ¸Á±…”¹‘¥ÍÑÉ¥ĞñğÁ±…”¹¹•¥¡‰½É¡½½ñğÁ±…”¹…‘‘É•ÍÌñğ€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆì(€ô((€™Õ¹Ñ¥½¸™¥¹‘M…Ù•‘I•½µµ•¹‘…Ñ¥½¸¡Á±…”¤ì(€€€½¹ÍĞ¹…µ”€ôMÑÉ¥¹œ¡Á±…”ü¹¹…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€½¹ÍĞÑ•áĞ€ôÁ±…•Q•áĞ¡Á±…”¤ì(€€€½¹ÍĞÑ…É•ÑÌ€ôl(€€€€€l½q‰å•Ñ¥qˆ¼°l‰Q•½Ù…Ìˆ°€‰É¥…Ğˆ°€‰]¡½±”½½‘Ì‰ut°(€€€€€l½qˆ¡İ…Ñ•É±½½ñÉ••¹İ…åñÁ…É¬¥qˆ¼°l‰5½½‘äµÁ¡¥Ñ¡•…Ñ•Èˆ°€‰]…±±•ÈÉ••¬QÉ…¥°ˆ°€‰•¹ÑÉ…°1¥‰É…Éä‰ut°(€€€€€l½q‰¡½Ñ•°Ù…¸é…¹‘Ñqˆ¼°l‰•É…±‘¥¹”Ìˆ°€‰I…¥¹•äMÑÉ••Ğ½½€¬É¥¹¬1½½Àˆ°€‰!…±˜MÑ•À‰ut°(€€€€€l½q‰±…‘ä‰¥É‘ñ±…­•ñÑÉ…¥±ñÍ¡½…°É••­qˆ¼°l‰5•É¥Ğ½™™•”ˆ°€‰•¹ÑÉ…°1¥‰É…Éäˆ°€‰½¹É•ÍÌÙ•¹Õ”	É¥‘”‰ut°(€€€tì(€€€½¹ÍĞµ…Ñ €ôÑ…É•ÑÌ¹™¥¹ ¡mÁ…ÑÑ•É¹t¤€ôøÁ…ÑÑ•É¸¹Ñ•ÍĞ¡¹…µ”¤ñğÁ…ÑÑ•É¸¹Ñ•ÍĞ¡Ñ•áĞ¤¤ì(€€€½¹ÍĞ±…‰•±Ì€ôµ…Ñ ü¹lÅtñğl‰5•É¥Ğ½™™•”ˆ°€‰]…Ñ•É±½¼A…É¬ˆ°€‰•É…±‘¥¹”Ì‰tì(€€€É•ÑÕÉ¸±…‰•±Ì(€€€€€€¹µ…À ¡±…‰•°¤€ôøÁ±…•Ì¹™¥¹ ¡…¹‘¥‘…Ñ”¤€ôøMÑÉ¥¹œ¡…¹‘¥‘…Ñ”¹¹…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤¹¥¹±Õ‘•Ì¡±…‰•°¹Ñ½1½İ•É…Í” ¤¤¤¤(€€€€€€¹™¥¹¡	½½±•…¸¤ì(€ô((€™Õ¹Ñ¥½¸•Ñ5å½İ¹Ñ½İ¹MÕ•ÍÑ¥½¹Ì ¤ì(€€€½¹ÍĞÉ•½µµ•¹‘•‘É½µM…Ù•Ì€ôÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì(€€€€€€¹µ…À¡™¥¹‘M…Ù•‘I•½µµ•¹‘…Ñ¥½¸¤(€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤(€€€€€€¹™¥±Ñ•È ¡Á±…”°¥¹‘•à°±¥ÍĞ¤€ôø±¥ÍĞ¹™¥¹‘%¹‘•à ¡¥Ñ•´¤€ôø¥Ñ•´¹¥€ôôôÁ±…”¹¥¤€ôôô¥¹‘•à¤(€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôø€…Í…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤¤ì(€€€½¹ÍĞ™…±±‰…¬€ôl‰Q•½Ù…Ìˆ°€‰5½½‘äµÁ¡¥Ñ¡•…Ñ•Èˆ°€‰•É…±‘¥¹”Ìˆ°€‰]…Ñ•É±½¼A…É¬ˆ°€‰5•É¥Ğ½™™•”‰t(€€€€€€¹µ…À ¡±…‰•°¤€ôøÁ±…•Ì¹™¥¹ ¡Á±…”¤€ôøMÑÉ¥¹œ¡Á±…”¹¹…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤¹¥¹±Õ‘•Ì¡±…‰•°¹Ñ½1½İ•É…Í” ¤¤¤¤(€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤ì(€€€É•ÑÕÉ¸€¡É•½µµ•¹‘•‘É½µM…Ù•Ì¹±•¹Ñ €üÉ•½µµ•¹‘•‘É½µM…Ù•Ì€è™…±±‰…¬¤¹Í±¥” À°€Ì¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä¡™¥±Ñ•È€ô€‰±°ˆ¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡™¥±Ñ•È¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ¡¹•áÑ¥±Ñ•È€ôôô€‰Ù•¹ÑÌˆ€ü€‰•Ù•¹ÑÌˆ€è¹•áÑ¥±Ñ•È€ôôô€‰A•É­Ìˆ€ü€‰Á•É­Ìˆ€è€‰µ…Àˆ¤ì(€ô((€™Õ¹Ñ¥½¸Í¡…É•M…Ù•‘½±±•Ñ¥½¸ ¤ì(€€€½¹ÍĞÑ¥Ñ±•Ì€ôÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹µ…À ¡Á±…”¤€ôøÁ±…”¹¹…µ”¤¹Í±¥” À°€à¤¹©½¥¸ ˆ°€ˆ¤ì(€€€½¹ÍĞÑ•áĞ€ôÑ¥Ñ±•Ì€ü5ä½İ¹Ñ½İ¸½±±•Ñ¥½¸è€‘íÑ¥Ñ±•Íõ€€è€‰5ä½İ¹Ñ½İ¸½±±•Ñ¥½¸½¸½İ¹Ñ½İ¸A•É­Ì¸ˆì(€€€¥˜€¡ÑåÁ•½˜¹…Ù¥…Ñ½È€„ôô€‰Õ¹‘•™¥¹•ˆ€˜˜¹…Ù¥…Ñ½È¹Í¡…É”¤ì(€€€€€Ù½¥¹…Ù¥…Ñ½È¹Í¡…É”¡ìÑ¥Ñ±”è€‰5ä½İ¹Ñ½İ¸ˆ°Ñ•áĞô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡ÑåÁ•½˜¹…Ù¥…Ñ½È€„ôô€‰Õ¹‘•™¥¹•ˆ€˜˜¹…Ù¥…Ñ½È¹±¥Á‰½…É¤ì(€€€€€Ù½¥¹…Ù¥…Ñ½È¹±¥Á‰½…É¹İÉ¥Ñ•Q•áĞ¡Ñ•áĞ¤ì(€€€ô(€ô((€™Õ¹Ñ¥½¸É•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹…É¡Á±…”°ÍÑ…ÑÕÍ1…‰•°€ô€‰I••¹Ñ±ä‘‘•ˆ¤ì(€€€½¹ÍĞ¥µ…”€ôÉ•Í½±Ù•¹Ñ¥Ñå%µ…”¡Á±…”°€‰…Éˆ¤ñğ5A}A91}%5}11	,ì(€€€É•ÑÕÉ¸€ (€€€€€€ñ‰ÕÑÑ½¸­•äõíÁ±…”¹¥‘ôÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½±±•Ñ¥½¸µ…Éˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ôø(€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…Éµµ•‘¥„ˆø(€€€€€€€€€€ñ¥µœÍÉŒõí¥µ…•ô…±ĞõíÁ±…”¹¹…µ•ô±½…‘¥¹œô‰±…éäˆ€¼ø(€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…Éµ‰½‘äˆø(€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…ÉµÍÑ…ÑÕÌˆùíÍÑ…ÑÕÍ1…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€ñÍÑÉ½¹œùíÁ±…”¹¹…µ•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€ñÍÁ…¸ùí•ÑM…Ù•‘%Ñ•µ½Áä¡Á±…”¥ôğ½ÍÁ…¸ø(€€€€€€€€€€ñ•´ùí•ÑM…Ù•‘1½…Ñ¥½¹1…‰•°¡Á±…”¥ôğ½•´ø(€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹M•Ñ¥½¸¡Ñ¥Ñ±”°¥Ñ•µÌ¤ì(€€€¥˜€ …¥Ñ•µÌ¹±•¹Ñ ¤É•ÑÕÉ¸¹Õ±°ì(€€€É•ÑÕÉ¸€ (€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½±±•Ñ¥½¸µÍ•Ñ¥½¸ˆ…É¥„µ±…‰•°õíÑ¥Ñ±•ôø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µÍ•Ñ¥½¸µ¡•…‘¥¹œˆø(€€€€€€€€€€ñ ÌùíÑ¥Ñ±•ôğ½ Ìø(€€€€€€€€ğ½‘¥Øø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½±±•Ñ¥½¸µÉ¥ˆø(€€€€€€€€€í¥Ñ•µÌ¹µ…À ¡Á±…”°¥¹‘•à¤€ôøÉ•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹…É¡Á±…”°¥¹‘•à€ôôô€À€ü€‰M…Ù•Q½‘…äˆ€è€‰I••¹Ñ±ä‘‘•ˆ¤¥ô(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½Í•Ñ¥½¸ø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹A…¹•° ¤ì(€€€½¹ÍĞÍ…Ù•‘É½ÕÁÌ€ôÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹É•‘Õ” (€€€€€€¡É½ÕÁÌ°Á±…”¤€ôøì(€€€€€€€É½ÕÁÍm•ÑM…Ù•‘%Ñ•µÉ½ÕÀ¡Á±…”¥t¹ÁÕÍ ¡Á±…”¤ì(€€€€€€€É•ÑÕÉ¸É½ÕÁÌì(€€€€€ô°(€€€€€ìÁ±…•Ìèmt°•Ù•¹ÑÌèmt°‰•¹•™¥ÑÌèmtô°(€€€€¤ì(€€€½¹ÍĞÉ•½µµ•¹‘•€ô•Ñ5å½İ¹Ñ½İ¹MÕ•ÍÑ¥½¹Ì ¤ì(€€€½¹ÍĞ…Í­AÉ½µÁÑÌ€ôl(€€€€€€‰]¡…ĞÍ¡½Õ±$Ù¥Í¥Ğ™¥ÉÍĞüˆ°(€€€€€€‰]¡…ĞÌ±½Í•ÍĞÉ¥¡Ğ¹½Üüˆ°(€€€€€€‰¹ä•Ù•¹ÑÌ¹•…ÈµäÍ…Ù•Á±…•Ìüˆ°(€€€€€€‰]¡…ĞÍ¡½Õ±$‘¼Ñ½¹¥¡Ğüˆ°(€€€€€É•Í¥‘•¹ÑM…Ù•‘A±…•ÍlÁtü¹¹…µ”€ü]¡…ĞÌ¡…ÁÁ•¹¥¹œ¹•…È€‘íÉ•Í¥‘•¹ÑM…Ù•‘A±…•ÍlÁt¹¹…µ•ôı€€è€‰]¡…ĞÌ¡…ÁÁ•¹¥¹œ¹•…ÈeQ$üˆ°(€€€tì(€€€½¹ÍĞ™…Ù½É¥Ñ•5…ÑÉ¥á%Ñ•µÌ€ô€¡É•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ €üÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì€èÉ•½µµ•¹‘•¤¹Í±¥” À°€à¤¹µ…À ¡Á±…”¤€ôøì(€€€€€½¹ÍĞÉ½ÕÀ€ô•ÑM…Ù•‘%Ñ•µÉ½ÕÀ¡Á±…”¤ì(€€€€€½¹ÍĞÉ•±…Ñ•€ô•ÑI•±…Ñ•‘A±…•Ì¡Á±…”°Á±…•Ì¤¹Í±¥” À°€Ì¤ì(€€€€€É•ÑÕÉ¸ì(€€€€€€€¥èÁ±…”¹¥°(€€€€€€€±…‰•°èÁ±…”¹¹…µ”°(€€€€€€€•å•‰É½ÜèÉ½ÕÀ€ôôô€‰•Ù•¹ÑÌˆ€ü€‰Ù•¹Ğˆ€èÉ½ÕÀ€ôôô€‰‰•¹•™¥ÑÌˆ€ü€‰A•É¬ˆ€è€‰A±…”ˆ°(€€€€€€€Ñ¥Ñ±”èÁ±…”¹¹…µ”°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è•ÑM…Ù•‘%Ñ•µ½Áä¡Á±…”¤°(€€€€€€€ÍÑ…ÑÕÌèÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤€ü€‰M…Ù•ˆ€è€‰MÕ•ÍÑ•ˆ°(€€€€€€€µ•Ñ„èl(€€€€€€€€€Á±…”¹…Ñ•½ÉäñğÁ±…”¹ÑåÁ”ñğ€‰½İ¹Ñ½İ¸ˆ°(€€€€€€€€€•ÑM…Ù•‘1½…Ñ¥½¹1…‰•°¡Á±…”¤°(€€€€€€€€€Á±…•¥ÍÑ…¹•1…‰•°¡Á±…”¤°(€€€€€€€t¹™¥±Ñ•È¡	½½±•…¸¤°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸ˆ°…Ñ¥½¸è€‰½Á•¸ˆô°(€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèl(€€€€€€€€€ì±…‰•°èÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤€ü€‰I•µ½Ù”ˆ€è€‰M…Ù”ˆ°…Ñ¥½¸èÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤€ü€‰É•µ½Ù”ˆ€è€‰Í…Ù”ˆô°(€€€€€€€€€ì±…‰•°è€‰¥É•Ñ¥½¹Ìˆ°…Ñ¥½¸è€‰‘¥É•Ñ¥½¹Ìˆô°(€€€€€€€€€ì±…‰•°è€‰M¡…É”ˆ°…Ñ¥½¸è€‰Í¡…É”ˆô°(€€€€€€€t°(€€€€€€€É•±…Ñ•‘%Ñ•µÌèÉ•±…Ñ•¹µ…À ¡¥Ñ•´¤€ôø€¡ì(€€€€€€€€€¥è¥Ñ•´¹¥°(€€€€€€€€€Ñ¥Ñ±”è¥Ñ•´¹¹…µ”°(€€€€€€€€€ÑåÁ”è¥Ñ•´¹…Ñ•½Éäñğ¥Ñ•´¹ÑåÁ”ñğ€‰9•…É‰äˆ°(€€€€€€€€€¥µ…•UÉ°èÉ•Í½±Ù•¹Ñ¥Ñå%µ…”¡¥Ñ•´°€‰…Éˆ¤°(€€€€€€€ô¤¤°(€€€€€ôì(€€€ô¤ì(€€€½¹ÍĞ¡…¹‘±•…Ù½É¥Ñ•5…ÑÉ¥áÑ¥½¸€ô€¡…Ñ¥½¸°¥Ñ•´¤€ôøì(€€€€€½¹ÍĞÁ±…”€ôÁ±…•Ì¹™¥¹ ¡…¹‘¥‘…Ñ”¤€ôø…¹‘¥‘…Ñ”¹¥€ôôô¥Ñ•´¹¥¤ñğÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹™¥¹ ¡…¹‘¥‘…Ñ”¤€ôø…¹‘¥‘…Ñ”¹¥€ôôô¥Ñ•´¹¥¤ì(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰½Á•¸ˆ€˜˜Á±…”¤ì(€€€€€€€Í•±•ÑA±…”¡Á±…”¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€ ¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰Í…Ù”ˆñğ…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰É•µ½Ù”ˆ¤€˜˜Á±…”¤ì(€€€€€€€Ñ½±•M…Ù•¡Á±…”¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰‘¥É•Ñ¥½¹Ìˆ€˜˜Á±…”¤ì(€€€€€€€İ¥¹‘½Ü¹½Á•¸¡‘¥É•Ñ¥½¹ÍUÉ°¡Á±…”¤°€‰}‰±…¹¬ˆ°€‰¹½½Á•¹•È±¹½É•™•ÉÉ•Èˆ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰Í¡…É”ˆ¤ì(€€€€€€€Í¡…É•M…Ù•‘½±±•Ñ¥½¸ ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰½Á•¸µÉ•±…Ñ•ˆ€˜˜…Ñ¥½¸¹É•±…Ñ•‘%¤ì(€€€€€€€½¹ÍĞÉ•±…Ñ•‘A±…”€ôÁ±…•Ì¹™¥¹ ¡…¹‘¥‘…Ñ”¤€ôø…¹‘¥‘…Ñ”¹¥€ôôô…Ñ¥½¸¹É•±…Ñ•‘%¤ì(€€€€€€€¥˜€¡É•±…Ñ•‘A±…”¤Í•±•ÑA±…”¡É•±…Ñ•‘A±…”¤ì(€€€€€ô(€€€ôì((€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°‘ÀµÍ…Ù•µ‘½İ¹Ñ½İ¸µÁ…¹•°µ¥¸µ ´À™±•à´Ä½Ù•É™±½Üµ¡¥‘‘•¸ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ‘½İ¹Ñ½İ¸µÍÉ½±°‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°µ¡•…‘•È‘ÀµÍ…Ù•µ‘½İ¹Ñ½İ¸µ¡•…‘•Èˆø(€€€€€€€€€€€€ñÀù5d=]9Q=]8ğ½Àø(€€€€€€€€€€€€ñ ÈùM…Ù•½İ¹Ñ½İ¸ğ½ Èø(€€€€€€€€€€€€ñÍÁ…¸ùe½ÕÈÍ…Ù•Á±…•Ì°‰•¹•™¥ÑÌ°•Ù•¹ÑÌ°…¹¹•áĞ¹•…É‰ä½ÁÑ¥½¹Ì¸ğ½ÍÁ…¸ø(€€€€€€€€€€€€ñÍÑÉ½¹œùíÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ¡ôÍ…Ù•ğ½ÍÑÉ½¹œø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½Ù•ÉÙ¥•ÜµÉ…¥°ˆ…É¥„µ±…‰•°ô‰M…Ù•‘½İ¹Ñ½İ¸ÍÕµµ…Éäˆø(€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œùíÍ…Ù•‘É½ÕÁÌ¹Á±…•Ì¹±•¹Ñ¡ôğ½ÍÑÉ½¹œøÁ±…•Ìğ½ÍÁ…¸ø(€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œùíÍ…Ù•‘É½ÕÁÌ¹‰•¹•™¥ÑÌ¹±•¹Ñ¡ôğ½ÍÑÉ½¹œø‰•¹•™¥ÑÌğ½ÍÁ…¸ø(€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œùíÍ…Ù•‘É½ÕÁÌ¹•Ù•¹ÑÌ¹±•¹Ñ¡ôğ½ÍÑÉ½¹œø•Ù•¹ÑÌğ½ÍÁ…¸ø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€ì…É•Í¥‘•¹ÑM…Ù•‘A±…•Ì¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ•µÁÑäµÍÑ…Ñ”ˆ…É¥„µ±…‰•°ô‰9½Ñ¡¥¹œÍ…Ù•å•Ğˆø(€€€€€€€€€€€€€€ñ Ìù9½Ñ¡¥¹œÍ…Ù•å•Ğ¸ğ½ Ìø(€€€€€€€€€€€€€€ñÀùM…Ù”Á±…•Ì°•Ù•¹ÑÌ…¹‰•¹•™¥ÑÌİ¡¥±”å½Ô•áÁ±½É”‘½İ¹Ñ½İ¸¸ğ½Àø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…Ñ¥½¸µÉ½Üˆø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä ‰±°ˆ¥ôùáÁ±½É”9•…É‰äğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä ‰Ù•¹ÑÌˆ¥ôùY¥•ÜÙ•¹ÑÌğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä ‰A•É­Ìˆ¥ôù¥¹	•¹•™¥ÑÌğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€¥ô((€€€€€€€€€€ñ%¹Ñ•É…Ñ¥Ù•5…ÑÉ¥à(€€€€€€€€€€€•å•‰É½Üô‰M…Ù•ˆ(€€€€€€€€€€€Ñ¥Ñ±”ô‰M…Ù•Á±…•Ì°Á•É­Ì°•Ù•¹ÑÌ°…¹‰Õ¥±‘¥¹Ì¸ˆ(€€€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸ô‰¡½½Í”…¸¥Ñ•´Ñ¼Í•”İ¡ä¥Ğµ…ÑÑ•ÉÌ°İ¡…ĞÑ¼‘¼¹•áĞ°…¹İ¡…Ğ¥Ì½¹¹•Ñ•¹•…É‰ä¸ˆ(€€€€€€€€€€€¥Ñ•µÌõí™…Ù½É¥Ñ•5…ÑÉ¥á%Ñ•µÍô(€€€€€€€€€€€½¹Ñ¥½¸õí¡…¹‘±•…Ù½É¥Ñ•5…ÑÉ¥áÑ¥½¹ô(€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ™…Ù½É¥Ñ•Ìµµ…ÑÉ¥àˆ(€€€€€€€€€€¼ø((€€€€€€€€€ì„…É•½µµ•¹‘•¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½±±•Ñ¥½¸µÍ•Ñ¥½¸ˆ…É¥„µ±…‰•°ô‰áÁ±½É”9•…É‰äˆø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µÍ•Ñ¥½¸µ¡•…‘¥¹œˆø(€€€€€€€€€€€€€€€€ñ ÌùáÁ±½É”9•…É‰äğ½ Ìø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ½±±•Ñ¥½¸µÉ¥ˆø(€€€€€€€€€€€€€€€íÉ•½µµ•¹‘•¹µ…À ¡Á±…”¤€ôøÉ•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹…É¡Á±…”°€‰A½ÁÕ±…È9•…É‰äˆ¤¥ô(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€¥ô((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…Í¬µÍ•Ñ¥½¸ˆ…É¥„µ±…‰•°ô‰Í¬Ñ¡”5…À…‰½ÕĞÍ…Ù•Á±…•Ìˆø(€€€€€€€€€€€€ñ ÌùÍ¬Ñ¡”5…Àğ½ Ìø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€í…Í­AÉ½µÁÑÌ¹µ…À ¡ÁÉ½µÁĞ¤€ôø€ (€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸­•äõíÁÉ½µÁÑôÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÙ½¥…ÁÁ±åAÉ½µÁĞ¡ÁÉ½µÁĞ¥ôø(€€€€€€€€€€€€€€€€€íÁÉ½µÁÑô(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ…Ù•µ…Ñ¥½¸µÉ½Ü‘ÀµÍ…Ù•µÁÉ¥µ…Éäµ…Ñ¥½¹Ìˆ…É¥„µ±…‰•°ô‰M…Ù•‘½İ¹Ñ½İ¸…Ñ¥½¹Ìˆø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä ‰±°ˆ¥ôø(€€€€€€€€€€€€€€ñ9…Ù¥…Ñ¥½¸…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€ñÍÁ…¸ù9•…É‰äğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹I•Í¥‘•¹Ñ¥Í½Ù•Éä ‰Ù•¹ÑÌˆ¥ôø(€€€€€€€€€€€€€€ñ…±•¹‘…É…åÌ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€ñÍÁ…¸ùÙ•¹ÑÌğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õíÍ¡…É•M…Ù•‘½±±•Ñ¥½¹ôø(€€€€€€€€€€€€€€ñM•¹…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€ñÍÁ…¸ùM¡…É”ğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•ÉI•Á½ÉÑÍA…¹•° ¤ì(€€€½¹ÍĞÍ•½I•Á½ÉĞ€ô19M}M=}IA=IPì(€€€½¹ÍĞÍÕµµ…Éå5•ÑÉ¥Ì€ôl(€€€€€l‰	É…¹‘•…Ù•É…”É…¹¬ˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹‰É…¹‘•‘Ù•É…•A½Í¥Ñ¥½¸°€‰!½Ü1••¹‘ÌÁ•É™½ÉµÌİ¡•¸Á•½Á±”Í•…É ‰ä¹…µ”‰t°(€€€€€l‰¥Í½Ù•Éä…Ù•É…”É…¹¬ˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹¹½¹	É…¹‘•‘Ù•É…•A½Í¥Ñ¥½¸°€‰!½Ü1••¹‘Ì…ÁÁ•…ÉÌ™½È±¥™•ÍÑå±”…¹¹•¥¡‰½É¡½½Í•…É¡•Ì‰t°(€€€€€l‰	É…¹Ñ•ÉµÌ¥¸Ñ½À€ÄÀˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹‰É…¹‘•‘Q½ÀÄÁ-•åİ½É‘½Õ¹Ğ°€‰M•…É¡•Ì…±É•…‘äİ½É­¥¹œ‰t°(€€€€€l‰¥Í½Ù•ÉäÑ•ÉµÌ¥¸Ñ½À€ÄÀˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹¹½¹	É…¹‘•‘Q½ÀÄÁ-•åİ½É‘½Õ¹Ğ°€‰M•…É¡•ÌÉ•…‘äÑ¼ÍÕÁÁ½ÉĞ½¹Ñ•¹Ğ‰t°(€€€€€l‰QÉ…­•±¥­Ìˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹½É…¹¥±¥­Ì°€‰±¥­ÌÙ¥Í¥‰±”¥¸Ñ¡”Í¹…ÁÍ¡½Ğ‰t°(€€€€€l‰QÉ…­•¥µÁÉ•ÍÍ¥½¹Ìˆ°Í•½I•Á½ÉĞ¹ÍÕµµ…Éä¹½É…¹¥%µÁÉ•ÍÍ¥½¹Ì°€‰•µ…¹Ù¥Í¥‰±”¥¸Ñ¡”Í¹…ÁÍ¡½Ğ‰t°(€€€tì(€€€½¹ÍĞÁÉ¥½É¥Ñå-•åİ½É‘Ì€ôl¸¸¹Í•½I•Á½ÉĞ¹­•åİ½É‘5•ÑÉ¥Ít(€€€€€€¹Í½ÉĞ ¡„°ˆ¤€ôøˆ¹½ÁÁ½ÉÑÕ¹¥ÑåM½É”€´„¹½ÁÁ½ÉÑÕ¹¥ÑåM½É”¤(€€€€€€¹Í±¥” À°€Ø¤ì(€€€½¹ÍĞ¹•áÑ=ÁÁ½ÉÑÕ¹¥Ñ¥•Ì€ôÍ•½I•Á½ÉĞ¹½ÁÁ½ÉÑÕ¹¥Ñ¥•Ì¹Í±¥” À°€Ì¤ì(€€€½¹ÍĞÕÍ•É)½ÕÉ¹•åMÉ••¹Ì€ôl(€€€€€ì(€€€€€€€É½±”è€‰=İ¹•Èˆ°(€€€€€€€ÍÉ••¸è€‰á•ÕÑ¥Ù”É•…ˆ°(€€€€€€€©½ˆè€‰U¹‘•ÉÍÑ…¹İ¡•Ñ¡•ÈÍ•…É ‘•µ…¹¥ÌÉ½İ¥¹œ…¹İ¡…Ğ‘•Í•ÉÙ•Ì…ÑÑ•¹Ñ¥½¸™¥ÉÍĞ¸ˆ°(€€€€€€€…Ñ¥½¸è€‰ÁÁÉ½Ù”Ñ¡”¹•áĞÁ…”°…µÁ…¥¸°½È±¥ÍÑ¥¹œÁÉ¥½É¥Ñä¸ˆ°(€€€€€ô°(€€€€€ì(€€€€€€€É½±”è€‰5…É­•Ñ¥¹œˆ°(€€€€€€€ÍÉ••¸è€‰…µÁ…¥¸É•…ˆ°(€€€€€€€©½ˆè€‰QÕÉ¸¡¥ µ¥¹Ñ•¹ĞÍ•…É¡•Ì¥¹Ñ¼µ…ÀµÙ¥Í¥‰±”…µÁ…¥¹Ì°½™™•ÉÌ°…¹É½ÕÑ•Ì¸ˆ°(€€€€€€€…Ñ¥½¸è€‰A±…¸Ñ¡”¹•áĞ…µÁ…¥¸…É½Õ¹Ñ¡”±•…É•ÍĞ…Õ‘¥•¹”¥¹Ñ•É•ÍĞ¸ˆ°(€€€€€ô°(€€€€€ì(€€€€€€€É½±”è€‰½¹Ñ•¹Ğ…¹M<ˆ°(€€€€€€€ÍÉ••¸è€‰-•åİ½ÉÉ•…ˆ°(€€€€€€€©½ˆè€‰AÉ½Ñ•Ğ‰É…¹‘•Ù¥Í¥‰¥±¥Ñä…¹¥µÁÉ½Ù”ÕÍ•™Õ°½İ¹Ñ½İ¸ÕÍÑ¥¸Á…•Ì¸ˆ°(€€€€€€€…Ñ¥½¸è€‰UÁ‘…Ñ”Ñ¡”Á…”°±¥ÍÑ¥¹œ°Õ¥‘”°Í•…É ‘•Ñ…¥±Ì°½ÈÉ•±…Ñ•±¥¹­Ì™½ÈÑ¡”ÁÉ¥½É¥ÑäÑ•É´¸ˆ°(€€€€€ô°(€€€€€ì(€€€€€€€É½±”è€‰]½É­ÍÁ…”µ…¹…•Èˆ°(€€€€€€€ÍÉ••¸è€‰=Á•É…Ñ¥¹œÉ•…ˆ°(€€€€€€€©½ˆè€‰-¹½Üİ¡…Ğ¡…¹•°İ¡¼½İ¹ÌÑ¡”¹•áĞÍÑ•À°…¹İ¡•É”¥ĞÍ¡½Õ±‰”ÑÉ…­•¸ˆ°(€€€€€€€…Ñ¥½¸è€‰ÍÍ¥¸Ñ¡”ÕÁ‘…Ñ”…¹­••Àµ…À½É•Á½ÉÑ¥¹œÍÑ…ÑÕÌÕÉÉ•¹Ğ¸ˆ°(€€€€€ô°(€€€tì((€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µÁ…¹•°‘Àµ±••¹‘ÌµÍ•¼µÉ•Á½ÉĞµÁ…¹•°ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µ¡•É¼‘Àµ±••¹‘ÌµÍ•¼µ¡•É¼ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÍ•¼µÍ½ÕÉ”µ±¥¹”ˆùM<M¹…ÁÍ¡½Ğğ½Àø(€€€€€€€€€€€€ñ Èù1••¹‘ÌÍ•…É ‘•µ…¹°ÑÉ…¹Í±…Ñ•¥¹Ñ¼…Ñ¥½¸¸ğ½ Èø(€€€€€€€€€€€€ñÀø(€€€€€€€€€€€€€Q¡¥ÌÍÉ••¸ÑÕÉ¹ÌÍ•…É Ù¥Í¥‰¥±¥Ñä¥¹Ñ¼ÁÉ…Ñ¥…°İ½É¬™½ÈÑ¡”1••¹‘ÌÑ•…´¸%ĞÍ¡½İÌ(€€€€€€€€€€€€€İ¡¥ Ñ•ÉµÌ…É”…±É•…‘äİ½É­¥¹œ°İ¡¥ ‘½İ¹Ñ½İ¸Í•…É¡•Ì¹••ÍÑÉ½¹•ÈÁ…•Ì°…¹İ¡¥ (€€€€€€€€€€€€€ÕÁ‘…Ñ•ÌÍ¡½Õ±‰•½µ”µ…ÀµÙ¥Í¥‰±”½¹Ñ•¹Ğ°…µÁ…¥¹Ì°½È±¥ÍÑ¥¹œ¥µÁÉ½Ù•µ•¹ÑÌ¸(€€€€€€€€€€€€ğ½Àø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ•¼µÍ¹…ÁÍ¡½Ğµµ•Ñ„ˆ…É¥„µ±…‰•°ô‰M<Í¹…ÁÍ¡½ĞÍ½ÕÉ”ˆø(€€€€€€€€€€€€€€ñÍÁ…¸ùM½ÕÉ”èí±••¹‘Í1ÕáÕÉåAÉ•Í•¹•M•½M¹…ÁÍ¡½Ğ¹Í½ÕÉ•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÁ…¸ù…ÁÑÕÉ•í™½Éµ…ÑM•½…Ñ”¡Í•½I•Á½ÉĞ¹…ÁÑÕÉ•‘Ğ¥ôğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•¼µÍÕµµ…ÉäµÍÑÉ¥Àˆ…É¥„µ±…‰•°ô‰1••¹‘ÌM<…İ…É•¹•ÍÌÍÕµµ…Éäˆø(€€€€€€€€€€€íÍÕµµ…Éå5•ÑÉ¥Ì¹µ…À ¡m±…‰•°°Ù…±Õ”°½Áåt¤€ôø€ (€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõí±…‰•±ô±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•¼µµ•ÑÉ¥Œˆø(€€€€€€€€€€€€€€€€ñÍÁ…¸ùí±…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùí™½Éµ…ÑM•½9Õµ‰•È¡Ù…±Õ”¥ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€ñÀùí½Áåôğ½Àø(€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•¼µÉ•…‘½ÕĞˆ…É¥„µ±…‰•°ô‰M<É•Á½ÉÑ¥¹œ½¹Ñ•áĞˆø(€€€€€€€€€€€€ñÍÁ…¸ù]¡…ĞÑ¡¥Ìµ•…¹Ìğ½ÍÁ…¸ø(€€€€€€€€€€€€ñÍÑÉ½¹œùA•½Á±”…±É•…‘ä™¥¹1••¹‘Ì‰ä¹…µ”¸Q¡”¹•áĞİ¥¹Ì½µ”™É½´ÕÍ•™Õ°‘½İ¹Ñ½İ¸…¹¹•¥¡‰½É¡½½Á…•Ì¸ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ñÀø(€€€€€€€€€€€€€1¥ÍÑ¥¹œÍ•…É¡•Ì°…‘‘É•ÍÌ‘•µ…¹°™…µ¥±ä±¥™•ÍÑå±”Ñ•ÉµÌ°…¹±ÕáÕÉä¡½µ”Õ¥‘…¹”Í¡½Õ±•… (€€€€€€€€€€€€€±•…Ñ¼„±•…ÈÁ…”½È±¥ÍÑ¥¹œÁ…Ñ ¸Q¡”µ…À…¸Ñ¡•¸ÑÕÉ¸Ñ¡…Ğ‘•µ…¹¥¹Ñ¼Í…Ù•¡½µ•Ì°(€€€€€€€€€€€€€É½ÕÑ”Ù¥•İÌ°Í¡½İ¥¹œÉ•ÅÕ•ÍÑÌ°…¹¹•¥¡‰½É¡½½½¹Ñ•¹Ğ¸(€€€€€€€€€€€€ğ½Àø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÍ•¼µÕÍ•Èµ©½ÕÉ¹•åÌˆ…É¥„µ±…‰•°ô‰M<M¹…ÁÍ¡½ĞÕÍ•È©½ÕÉ¹•åÌˆø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•Ñ¥½¸µ¡•…‘¥¹œˆø(€€€€€€€€€€€€€€ñÍÁ…¸ùMÉ••¸‰äÕÍ•Èğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÑÉ½¹œù… Á•ÉÍ½¸•ÑÌÑ¡”Í…µ”Í¹…ÁÍ¡½Ğ°İ¥Ñ „‘¥™™•É•¹Ğ¹•áĞÍÑ•À¸ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÍ•¼µÕÍ•Èµ©½ÕÉ¹•äµ±¥ÍĞˆø(€€€€€€€€€€€€€íÕÍ•É)½ÕÉ¹•åMÉ••¹Ì¹µ…À ¡¥Ñ•´¤€ôø€ (€€€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõí¥Ñ•´¹É½±•ô±…ÍÍ9…µ”ô‰‘ÀµÍ•¼µÕÍ•Èµ©½ÕÉ¹•äµÉ½Üˆø(€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùí¥Ñ•´¹É½±•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùí¥Ñ•´¹ÍÉ••¹ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ñÀùí¥Ñ•´¹©½‰ôğ½Àø(€€€€€€€€€€€€€€€€€€ñ•´ùí¥Ñ•´¹…Ñ¥½¹ôğ½•´ø(€€€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘Ìµ­•åİ½ÉµÑ…‰±”ˆ…É¥„µ±…‰•°ô‰AÉ¥½É¥ÑäM<M¹…ÁÍ¡½Ğ­•åİ½É‘Ìˆø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•Ñ¥½¸µ¡•…‘¥¹œˆø(€€€€€€€€€€€€€€ñÍÁ…¸ùAÉ¥½É¥Ñä­•åİ½ÉÙ¥•Üğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÑÉ½¹œùM•…É Ñ•ÉµÌÑ¡…Ğ¹••…¸½İ¹•È°„Á…”°½È„…µÁ…¥¸¥‘•„¸ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ±••¹‘Ìµ­•åİ½Éµ±¥ÍĞˆø(€€€€€€€€€€€€€íÁÉ¥½É¥Ñå-•åİ½É‘Ì¹µ…À ¡µ•ÑÉ¥Œ¤€ôø€ (€€€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõíµ•ÑÉ¥Œ¹¹½Éµ…±¥é•‘-•åİ½É‘ô±…ÍÍ9…µ”ô‰‘Àµ±••¹‘Ìµ­•åİ½ÉµÉ½Üˆø(€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíµ•ÑÉ¥Œ¹­•åİ½É‘ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíµ•ÑÉ¥Œ¹±ÕÍÑ•É1…‰•±ôƒ
Üíµ•ÑÉ¥Œ¹­•åİ½É‘QåÁ”€ôôô€‰‰É…¹‘•ˆ€ü€‰	É…¹‘•ˆ€è€‰9½¸µ‰É…¹‘•‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ñ‘°ø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€ñ‘Ğù±¥­Ìğ½‘Ğø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ùí™½Éµ…ÑM•½9Õµ‰•È¡µ•ÑÉ¥Œ¹±¥­Ì¥ôğ½‘ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€ñ‘Ğù%µÁÉ•ÍÍ¥½¹Ìğ½‘Ğø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ùí™½Éµ…ÑM•½9Õµ‰•È¡µ•ÑÉ¥Œ¹¥µÁÉ•ÍÍ¥½¹Ì¥ôğ½‘ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ĞùQHğ½‘Ğø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ùí™½Éµ…ÑM•½A•É•¹Ğ¡µ•ÑÉ¥Œ¹ÑÈ¥ôğ½‘ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ĞùAÉ¥½É¥Ñäğ½‘Ğø(€€€€€€€€€€€€€€€€€€€€€€ñ‘ùíµ•ÑÉ¥Œ¹½ÁÁ½ÉÑÕ¹¥ÑåAÉ¥½É¥Ñåôğ½‘ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ğ½‘°ø(€€€€€€€€€€€€€€€€€€ñÀùíµ•ÑÉ¥Œ¹É•½µµ•¹‘•‘Ñ¥½¹ôğ½Àø(€€€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘Ìµ½ÁÁ½ÉÑÕ¹¥ÑäµÁ…¹•°ˆ…É¥„µ±…‰•°ô‰M<¹•áĞ…Ñ¥½¹Ìˆø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€ñÍÁ…¸ù]¡…ĞÑ¼‘¼¹•áĞğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÑÉ½¹œùQÕÉ¸Í•…É ¥¹Ñ•É•ÍĞ¥¹Ñ¼±•…È¹•áĞÍÑ•ÁÌ¸ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€ñÀù… É½ÜÁ…¥ÉÌ…¸½İ¹•È°„‘•ÍÑ¥¹…Ñ¥½¸Á…”°…¹Ñ¡”¹•áĞÕÁ‘…Ñ”Í¼Ñ¡”É•Á½ÉĞ‰•½µ•Ì½¹”ÁÉ…Ñ¥…°…Ñ¥½¸¸ğ½Àø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ±••¹‘Ìµ½ÁÁ½ÉÑÕ¹¥Ñäµ±¥ÍĞˆø(€€€€€€€€€€€€€í¹•áÑ=ÁÁ½ÉÑÕ¹¥Ñ¥•Ì¹µ…À ¡µ•ÑÉ¥Œ¤€ôø€ (€€€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõíµ•ÑÉ¥Œ¹¹½Éµ…±¥é•‘-•åİ½É‘ôø(€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíµ•ÑÉ¥Œ¹±ÕÍÑ•É1…‰•±ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíµ•ÑÉ¥Œ¹½İ¹•Éôƒ
Üíµ•ÑÉ¥Œ¹±…¹‘¥¹A…•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ñÀùíµ•ÑÉ¥Œ¹É•½µµ•¹‘•‘Ñ¥½¹ôğ½Àø(€€€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÍ•¼µÍÑ…ÑÕÌˆ…É¥„µ±…‰•°ô‰M<M¹…ÁÍ¡½ĞÍå¹ŒÍÑ…ÑÕÌˆø(€€€€€€€€€€€€ñÍÑÉ½¹œùM½ÕÉ”¹½Ñ”ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ñÀùíÍ•½I•Á½ÉĞ¹…•ÍÍ5•Ñ¡½¹¹½Ñ•ôğ½Àø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøİ¥¹‘½Ü¹±½…Ñ¥½¸¹…ÍÍ¥¸ ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½½Ù•ÉÙ¥•Üˆ¥ôù=Á•¸İ½É­ÍÁ…”É•Á½ÉĞğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø½Á•¹A…ÉÑ¹•ÉA…¹•° ‰…µÁ…¥¹Ìˆ¥ôùA±…¸½¹Ñ•¹Ğğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•ÉÑ¥Ù¥ÑåA…¹•° ¤ì(€€€½¹ÍĞ…Ñ¥Ù¥ÑåI½İÌ€ôl(€€€€€l‰A•½Á±”…É”½Á•¹¥¹œÑ¡”µ…Àˆ°€‰9•…É‰äÁ±…•Ì°½™™•ÉÌ°…¹•Ù•¹ÑÌ…É”‰•¥¹œÍ…Ù•Ñ½•Ñ¡•È¸ˆ°€‰=Á•¸µ…Àˆ°€ ¤€ôø½Á•¹A…ÉÑ¹•É5…À ‰±°ˆ¥t°(€€€€€l‰¥¹¥¹œ¥Ì•ÑÑ¥¹œ…ÑÑ•¹Ñ¥½¸ˆ°€‰!…ÁÁä¡½ÕÈ°Á…Ñ¥½Ì°…¹‘¥¹¹•ÈÍ•…É¡•Ì…É”Á¥­¥¹œÕÀ¸ˆ°€‰É•…Ñ”½™™•Èˆ°€ ¤€ôø½Á•¹A…ÉÑ¹•ÉA…¹•° ‰…µÁ…¥¹Ìˆ¥t°(€€€€€l‰Ù•¹ÑÌ…É”Í¡…Á¥¹œ¹•…É‰äÁ±…¹Ìˆ°€‰Ù•¹¥¹œÍ…Ù•Ì…É”Á¥­¥¹œÕÀ…É½Õ¹M•…¡½±´°I…¥¹•ä°…¹½¹É•ÍÌ¸ˆ°€‰Y¥•Ü•Ù•¹ÑÌˆ°€ ¤€ôø½Á•¹A…ÉÑ¹•É5…À ‰Ù•¹ÑÌˆ¥t°(€€€€€l‰™Ñ•Èİ½É¬¥ÌÑ¡”±•…É•ÍĞİ¥¹‘½Üˆ°€‰A•½Á±”…É”µ½ÍĞ±¥­•±äÑ¼Í…Ù”°…Í¬™½È‘¥É•Ñ¥½¹Ì°½ÈÕÍ”…¸½™™•È…™Ñ•Èİ½É¬…¹½¸İ••­•¹‘Ì¸ˆ°€‰I•Ù¥•ÜÉ•Á½ÉĞˆ°€ ¤€ôø½Á•¹A…ÉÑ¹•ÉA…¹•° ‰É•Á½ÉÑÌˆ¥t°(€€€tì(€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µÁ…¹•°ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µ¡•É¼ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½ÜˆùA…ÉÑ¹•È…Ñ¥Ù¥Ñäğ½Àø(€€€€€€€€€€€€ñ Èù9•…É‰ä…Ñ¥Ù¥Ñä°Í¥µÁ±¥™¥•¸ğ½ Èø(€€€€€€€€€€€€ñÀùM•”İ¡…ĞÁ•½Á±”½Á•¸°Í…Ù”°Í…¸°…¹ÕÍ”İ¥Ñ¡½ÕĞÑ¡”•áÑÉ„¹½¥Í”¸ğ½Àø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÍÕµµ…ÉäµÉ¥ˆ…É¥„µ±…‰•°ô‰Ñ¥Ù¥ÑäÍÕµµ…Éäˆø(€€€€€€€€€€€íl(€€€€€€€€€€€€€l‰A•½Á±”½Á•¸ˆ°€‰A±…•Ìˆ°€‰]¡•É”É•Í¥‘•¹ÑÌ…¹Õ•ÍÑÌ±½½¬™¥ÉÍĞ‰t°(€€€€€€€€€€€€€l‰A•½Á±”Í…Ù”ˆ°€‰M¡½ÉÑ±¥ÍÑÌˆ°€‰A±…•Ì…¹½™™•ÉÌÑ¡•äµ…äÉ•Ù¥Í¥Ğ‰t°(€€€€€€€€€€€€€l‰A•½Á±”ÕÍ”ˆ°€‰=™™•ÉÌˆ°€‰A•É­Ì°IMYAÌ°Í…¹Ì°…¹‘¥É•Ñ¥½¹Ì‰t°(€€€€€€€€€€€t¹µ…À ¡m±…‰•°°Ù…±Õ”°½Áåt¤€ôø€ (€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõí±…‰•±ô±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÍÕµµ…Éäµ…Éˆø(€€€€€€€€€€€€€€€€ñÍÁ…¸ùí±…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíÙ…±Õ•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€ñÀùí½Áåôğ½Àø(€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µ±¥ÍĞˆ…É¥„µ±…‰•°ô‰I••¹ĞÁ…ÉÑ¹•È…Ñ¥Ù¥Ñäˆø(€€€€€€€€€€€í…Ñ¥Ù¥ÑåI½İÌ¹µ…À ¡mÑ¥Ñ±”°½Áä°…Ñ¥½¸°½¹±¥­t¤€ôø€ (€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸­•äõíÑ¥Ñ±•ôÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Ü‘ÀµÁ…ÉÑ¹•Èµ™••µÉ½Üˆ½¹±¥¬õí½¹±¥­ôø(€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µµ…¥¸ˆø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Üµ¥½¸ˆøñM…¹1¥¹”±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíÑ¥Ñ±•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€€€€€ñÍµ…±°ùí½Áåôğ½Íµ…±°ø(€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍ¥¹…°ˆùí…Ñ¥½¹ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•É…µÁ…¥¹A…¹•° ¤ì(€€€½¹ÍĞ…µÁ…¥¹I½İÌ€ôl¸¸¹±¥Ù•…µÁ…¥¹1…å•Éá…µÁ±•Ì°€¸¸¹‰É…¹‘…µÁ…¥¹á…µÁ±•Ítì(€€€½¹ÍĞ¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ô€…ÕÉ±MÑ…Ñ”¹…µÁ…¥¹%€˜˜€…ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%ì(€€€½¹ÍĞÉ•ÅÕ•ÍÑ•‘…µÁ…¥¹%€ôÕÉ±MÑ…Ñ”¹…µÁ…¥¹%ñğ€¡¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€ˆˆ€è…Ñ¥Ù•…µÁ…¥¹MÑ•À¤ì(€€€½¹ÍĞÍ•±•Ñ•‘…µÁ…¥¸€ô…µÁ…¥¹I½İÌ¹™¥¹ ¡…µÁ…¥¸¤€ôø…µÁ…¥¸¹¥€ôôôÉ•ÅÕ•ÍÑ•‘…µÁ…¥¹%¤ñğ±¥Ù•…µÁ…¥¹1…å•Éá…µÁ±•ÍlÁtì(€€€½¹ÍĞÍ•±•Ñ•‘MÑ…ÑÕÌ€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹ÍÑ…ÑÕÌñğ€‰I•…‘äˆì(€€€½¹ÍĞÍ•±•Ñ•‘¹Ñ¥Ñä€ô€¡ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%€üÁ±…•Ì¹™¥¹ ¡Á±…”¤€ôøÁ±…”¹¥€ôôôÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%ñğÁ±…”¹É…Üü¹¥€ôôôÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%¤€è¹Õ±°¤ñğ™¥¹‘…µÁ…¥¹¹Ñ¥Ñä¡Í•±•Ñ•‘…µÁ…¥¸¤ì(€€€½¹ÍĞ¥Í	É…¹‘Ñ¥Ù…Ñ¥½¸€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹±…å•ÉQåÁ”€ôôô€‰‰É…¹ˆñğ€¡Í•±•Ñ•‘¹Ñ¥Ñä€˜˜¥Í	É…¹‘¹Ñ¥Ñä¡Í•±•Ñ•‘¹Ñ¥Ñä¤¤ì(€€€½¹ÍĞµ…Á¥±Ñ•È€ô¥Í	É…¹‘Ñ¥Ù…Ñ¥½¸€ü€‰	É…¹Ñ¥Ù…Ñ¥½¹Ìˆ€è•Ñ…µÁ…¥¹¥±Ñ•È¡Í•±•Ñ•‘…µÁ…¥¸¤ì(€€€½¹ÍĞÁ…ÉÑ¹•É1…‰•°€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹‰É…¹‘9…µ”ñğÍ•±•Ñ•‘…µÁ…¥¸ü¹Á±…•9…µ”ñğÍ•±•Ñ•‘¹Ñ¥Ñäü¹¹…µ”ñğ€‰A…ÉÑ¹•ÈÑ•…´ˆì(€€€½¹ÍĞ…µÁ…¥¹Q¥Ñ±”€ô¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€‰¡½½Í”„…µÁ…¥¸Ñ¼±…Õ¹ ˆ€èÍ•±•Ñ•‘…µÁ…¥¸ü¹…µÁ…¥¹9…µ”ñğ€‰=¹”±•…È…µÁ…¥¸ˆì(€€€½¹ÍĞµ½µ•¹Ñ1¥¹”€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹µ½µ•¹Ğ€ü€‘íÍ•±•Ñ•‘…µÁ…¥¸¹µ½µ•¹Ñô‘íÍ•±•Ñ•‘…µÁ…¥¸¹…É•„€ü€ƒ
Ü€‘íÍ•±•Ñ•‘…µÁ…¥¸¹…É•…õ€€è€ˆ‰õ€€èÍ•±•Ñ•‘…µÁ…¥¸ü¹¥¹Ñ•¹Ğñğ€‰¡½½Í”Ñ¡”ÍÑÉ½¹•ÍĞ¹•…É‰äµ½µ•¹Ğ¸ˆì(€€€½¹ÍĞ…Õ‘¥•¹•1¥¹”€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹…Õ‘¥•¹”ñğ€‰I•Í¥‘•¹ÑÌ°Ù¥Í¥Ñ½ÉÌ°¡½Ñ•°Õ•ÍÑÌ°…¹¹•…É‰äİ½É­•ÉÌ…±É•…‘äµ…­¥¹œ„‘½İ¹Ñ½İ¸‘•¥Í¥½¸¸ˆì(€€€½¹ÍĞ…Ñ¥½¹1¥¹”€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹É•Í¥‘•¹Ñ…¥¹=™™•Èñğ€‰¥Ù”Ñ¡…Ğ…Õ‘¥•¹”½¹”ÕÍ•™Õ°…Ñ¥½¸èÍ…Ù”°•Ğ‘¥É•Ñ¥½¹Ì°IMY@°Í…¸°É•ÅÕ•ÍĞ°½ÈÉ•‘••´¸ˆì(€€€½¹ÍĞµ•…ÍÕÉ•1¥¹”€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹Á…ÉÑ¹•É%¹Í¥¡Ğñğ€‰5•…ÍÕÉ”½Á•¹Ì°Í…Ù•Ì°Í…¹Ì°‘¥É•Ñ¥½¹Ì°É•‘•µÁÑ¥½¹Ì°IMYAÌ°…¹™½±±½ÜµÕÀÉ•ÅÕ•ÍÑÌ¸ˆì(€€€½¹ÍĞÍÑÉ…Ñ•å1¥¹”€ô¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü(€€€€€€ü€‰UÍ”Ñ¡¥ÌÙ¥•ÜÑ¼¡½½Í”½¹”…µÁ…¥¸°½¹”…Õ‘¥•¹”°…¹½¹”µ•…ÍÕÉ…‰±”…Ñ¥½¸‰•™½É”Í•¹‘¥¹œÁ•½Á±”Ñ¼Ñ¡”‰Õ¥±‘•È¸ˆ(€€€€€€èÍ•±•Ñ•‘…µÁ…¥¸ü¹ÍÑÉ…Ñ•å1¥¹”ñğ…Ñ¥½¹1¥¹”ì(€€€½¹ÍĞ‰•ÍÑ5½Ù•Q¥Ñ±”€ô¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€‰MÑ…ÉĞİ¥Ñ Ñ¡”±•…É•ÍĞ‘•µ…¹¸ˆ€èÍ•±•Ñ•‘…µÁ…¥¸ü¹‰•ÍÑ5½Ù•Q¥Ñ±”ñğ€‰¡½½Í”½¹”…Ñ¥½¸¸ˆì(€€€½¹ÍĞ‰•ÍÑ5½Ù•½Áä€ô¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü(€€€€€€ü€‰™Ñ•Èµİ½É¬‘¥¹¥¹œ¥ÌÑ¡”ÍÑÉ½¹•ÍĞ‘•™…Õ±Ğ‰•…ÕÍ”¥Ğ½¹¹•ÑÌÉ•Í¥‘•¹ÑÌ°¡½Ñ•°Õ•ÍÑÌ°…¹¹•…É‰äİ½É­•ÉÌÑ¼„Í¥µÁ±”¹•áĞÍÑ•À¸ˆ(€€€€€€èÍ•±•Ñ•‘…µÁ…¥¸ü¹‰•ÍÑ5½Ù•½Áäñğ€‰-••ÀÑ¡”µ•ÍÍ…”Í¡½ÉĞ°ÍÁ•¥™¥Œ°…¹µ•…ÍÕÉ…‰±”¸ˆì(€€€½¹ÍĞÍ•±•Ñ•‘A¥¹MÕµµ…Éä€ôÍ•±•Ñ•‘¹Ñ¥Ñäü¹ÍÕµµ…ÉäñğÍ•±•Ñ•‘¹Ñ¥Ñäü¹‘•ÍÉ¥ÁÑ¥½¸ñğÍ•±•Ñ•‘¹Ñ¥Ñäü¹½™™•ÈñğÍ•±•Ñ•‘…µÁ…¥¸ü¹Á¥¹UÍ”ñğÁ…ÉÑ¹•É1…‰•°ì(€€€½¹ÍĞÍ•±•Ñ•‘A¥¹½Áä€ôÍ•±•Ñ•‘¹Ñ¥Ñä(€€€€€€ü€‘íÍ•±•Ñ•‘¹Ñ¥Ñä¹¹…µ•ôè€‘íÍ•±•Ñ•‘A¥¹MÕµµ…Éåõ€(€€€€€€èÍ•±•Ñ•‘…µÁ…¥¸ü¹Á¥¹UÍ”ñğÁ…ÉÑ¹•É1…‰•°ì(€€€½¹ÍĞÑ…ÁÑ¥½¸€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹Ñ…ÁÑ¥½¸ñğ…Ñ¥½¹1¥¹”ì(€€€½¹ÍĞÁÉ½½™A½¥¹Ğ€ôÍ•±•Ñ•‘…µÁ…¥¸ü¹ÁÉ½½™A½¥¹Ğñğµ•…ÍÕÉ•1¥¹”ì(€€€½¹ÍĞÁÉ¥µ…ÉåÑ¥½¹1…‰•°€ôÍ•±•Ñ•‘MÑ…ÑÕÌ€ôôô€‰1¥Ù”ˆ€ü€‰I•Ù¥•ÜÉ•ÍÕ±ÑÌˆ€èÍ•±•Ñ•‘MÑ…ÑÕÌ€ôôô€‰É…™Ğˆ€ü€‰¥¹¥Í ‘É…™Ğˆ€è¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€‰=Á•¸‰Õ¥±‘•Èˆ€è€‰	Õ¥±…µÁ…¥¸ˆì(€€€½¹ÍĞÉ•½µµ•¹‘•‘…µÁ…¥¹I½İÌ€ô…µÁ…¥¹I½İÌ(€€€€€€¹™¥±Ñ•È ¡…µÁ…¥¸¤€ôø…µÁ…¥¸¹ÍÑ…ÑÕÌ€„ôô€‰É¡¥Ù•ˆ¤(€€€€€€¹Í±¥” À°€Ô¤ì((€€€™Õ¹Ñ¥½¸™¥¹‘…µÁ…¥¹¹Ñ¥Ñä¡…µÁ…¥¸¤ì(€€€€€½¹ÍĞ‰É…¹‘%€ôMÑÉ¥¹œ¡…µÁ…¥¸ü¹‰É…¹‘%ñğ…µÁ…¥¸ü¹Á±…•%ñğ€ˆˆ¤ì(€€€€€½¹ÍĞ‘¥É•Ñ5…Ñ €ô‰É…¹‘%(€€€€€€€€üÁ±…•Ì¹™¥¹ ¡Á±…”¤€ôøÁ±…”¹¥€ôôô‰É…¹‘%ñğÁ±…”¹É…Üü¹¥€ôôô‰É…¹‘%¤(€€€€€€€€è¹Õ±°ì(€€€€€¥˜€¡‘¥É•Ñ5…Ñ ¤É•ÑÕÉ¸‘¥É•Ñ5…Ñ ì(€€€€€½¹ÍĞ‰É…¹‘9…µ”€ôMÑÉ¥¹œ¡…µÁ…¥¸ü¹‰É…¹‘9…µ”ñğ…µÁ…¥¸ü¹Á±…•9…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€€€¥˜€ …‰É…¹‘9…µ”¤É•ÑÕÉ¸¹Õ±°ì(€€€€€½¹ÍĞ¹½Éµ…±¥é•‘	É…¹‘9…µ”€ô‰É…¹‘9…µ”¹É•Á±…” ½y‰É…¹´¼°€ˆˆ¤¹É•Á±…” ½yÁ…ÉÑ¹•È´¼°€ˆˆ¤¹É•Á±…” ¼´½œ°€ˆ€ˆ¤ì(€€€€€É•ÑÕÉ¸Á±…•Ì¹™¥¹ ¡Á±…”¤€ôøì(€€€€€€€½¹ÍĞÁ±…•	É…¹€ôMÑÉ¥¹œ¡Á±…”¹‰É…¹ñğÁ±…”¹É…Üü¹‰É…¹ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€€€€€½¹ÍĞÁ±…•9…µ”€ôMÑÉ¥¹œ¡Á±…”¹¹…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€Á±…”¹¥€ôôô‰É…¹‘%ñğ(€€€€€€€€€Á±…•	É…¹€ôôô‰É…¹‘9…µ”ñğ(€€€€€€€€€Á±…•9…µ”€ôôô‰É…¹‘9…µ”ñğ(€€€€€€€€€Á±…•	É…¹€ôôô¹½Éµ…±¥é•‘	É…¹‘9…µ”ñğ(€€€€€€€€€Á±…•9…µ”€ôôô¹½Éµ…±¥é•‘	É…¹‘9…µ”ñğ(€€€€€€€€€Á±…•9…µ”¹¥¹±Õ‘•Ì¡¹½Éµ…±¥é•‘	É…¹‘9…µ”¤ñğ(€€€€€€€€€¹½Éµ…±¥é•‘	É…¹‘9…µ”¹¥¹±Õ‘•Ì¡Á±…•9…µ”¤(€€€€€€€€¤ì(€€€€€ô¤ñğ¹Õ±°ì(€€€ô((€€€™Õ¹Ñ¥½¸•Ñ…µÁ…¥¹¥±Ñ•È¡…µÁ…¥¸¤ì(€€€€€¥˜€¡…µÁ…¥¸ü¹±…å•ÉQåÁ”€ôôô€‰‰É…¹ˆ¤É•ÑÕÉ¸€‰	É…¹‘Ìˆì(€€€€€¥˜€¡…µÁ…¥¸ü¹±…å•ÉQåÁ”€ôôô€‰¡½Ñ•°ˆ¤É•ÑÕÉ¸€‰!½Ñ•±Ìˆì(€€€€€¥˜€¡…µÁ…¥¸ü¹±…å•ÉQåÁ”€ôôô€‰ÁÉ½Á•ÉÑäˆ¤É•ÑÕÉ¸€‰AÉ½Á•ÉÑ¥•Ìˆì(€€€€€¥˜€¡…µÁ…¥¸ü¹±…å•ÉQåÁ”€ôôô€‰•Ù•¹Ğˆ¤É•ÑÕÉ¸€‰Ù•¹ÑÌˆì(€€€€€É•ÑÕÉ¸€‰…µÁ…¥¹Ìˆì(€€€ô((€€€™Õ¹Ñ¥½¸¡…¹‘±•…µÁ…¥¹AÉ¥µ…ÉåÑ¥½¸ ¤ì(€€€€€¥˜€¡Í•±•Ñ•‘MÑ…ÑÕÌ€ôôô€‰1¥Ù”ˆ¤ì(€€€€€€€½Á•¹A…ÉÑ¹•ÉA…¹•° ‰É•Á½ÉÑÌˆ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡Í•±•Ñ•‘¹Ñ¥Ñä¤ì(€€€€€€€¹…Ù¥…Ñ”¡…µÁ…¥¹I½ÕÑ”¡Í•±•Ñ•‘¹Ñ¥Ñä¤¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¹…Ù¥…Ñ”¡€½Á…ÉÑ¹•ÉÌ½…µÁ…¥¹Ìı…µÁ…¥¹%ô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡Í•±•Ñ•‘…µÁ…¥¸¹¥¥ô™µ½µ•¹Ğô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡Í•±•Ñ•‘…µÁ…¥¸¹µ½µ•¹Ğñğ€ˆˆ¥õ€¤ì(€€€ô((€€€™Õ¹Ñ¥½¸¡…¹‘±•…µÁ…¥¹Y¥•İ5…À ¤ì(€€€€€±•…É=Á•¹5…ÁM•±•Ñ¥½¸ ¤ì(€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€Í•ÑÑ¥Ù•¥±Ñ•È¡µ…Á¥±Ñ•È¤ì(€€€€€¥˜€¡Í•±•Ñ•‘¹Ñ¥Ñä¤ì(€€€€€€€Í•ÑM•±•Ñ•‘%¡Í•±•Ñ•‘¹Ñ¥Ñä¹¥¤ì(€€€€€€€Í•ÑAÕ±Í¥¹A¥¹%¡Í•±•Ñ•‘¹Ñ¥Ñä¹¥¤ì(€€€€€ô(€€€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡…µÁ…¥¹Q¥Ñ±”°Í•±•Ñ•‘¹Ñ¥Ñä€ümÍ•±•Ñ•‘¹Ñ¥Ñä°€¸¸¹Ù¥Í¥‰±•A±…•Ít€èÙ¥Í¥‰±•A±…•Ì°€‰Á…ÉÑ¹•Èˆ°Í•±•Ñ•‘…µÁ…¥¸¹…É•„ñğ‘¥ÍÑÉ¥Ğ°µ…Á¥±Ñ•È¤¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”õÁ…ÉÑ¹•È™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡µ…Á¥±Ñ•È¥ô™…µÁ…¥¹%ô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡Í•±•Ñ•‘…µÁ…¥¸¹¥¥ô‘íÍ•±•Ñ•‘¹Ñ¥Ñäü¹¥€ü€™•¹Ñ¥Ñå%ô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡Í•±•Ñ•‘¹Ñ¥Ñä¹¥¥õ€€è€ˆ‰õ€¤ì(€€€ô((€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µÁ…¹•°‘Àµ…µÁ…¥¸µ‘É…İ•Èˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µ¡•É¼‘Àµ…µÁ…¥¸µ¡•É¼ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆùí¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€‰A…ÉÑ¹•È…µÁ…¥¹Ìˆ€è¥Í	É…¹‘Ñ¥Ù…Ñ¥½¸€ü€‰	É…¹…Ñ¥Ù…Ñ¥½¸ˆ€è€‰…µÁ…¥¸‰ôğ½Àø(€€€€€€€€€€€€ñ Èùí¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€‰…µÁ…¥¹Ì‰Õ¥±Ğ…É½Õ¹É•…°‘½İ¹Ñ½İ¸‘•¥Í¥½¹Ì¸ˆ€è€‘íÁ…ÉÑ¹•É1…‰•±ôè€‘í…µÁ…¥¹Q¥Ñ±•õôğ½ Èø(€€€€€€€€€€€€ñÀùíÍÑÉ…Ñ•å1¥¹•ôğ½Àø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µµ½µ•¹Ğˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù	•ÍĞµ½Ù”ğ½Àø(€€€€€€€€€€€€ñ Ìùí‰•ÍÑ5½Ù•Q¥Ñ±•ôğ½ Ìø(€€€€€€€€€€€€ñÀùí‰•ÍÑ5½Ù•½Áåôğ½Àø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µµ•Ñ„µÉ½Üˆ…É¥„µ±…‰•°ô‰I•½µµ•¹‘•…µÁ…¥¸½¹Ñ•áĞˆø(€€€€€€€€€€€€€€ñÍÁ…¸ùíµ…Á¥±Ñ•Éôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÁ…¸ùíÍ•±•Ñ•‘MÑ…ÑÕÍôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÁ…¸ùíÍ•±•Ñ•‘…µÁ…¥¸¹…É•„ñğ€‰½İ¹Ñ½İ¸‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µ…Ñ¥½¸µ‰…Èˆø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÁÉ¥µ…Éäµ…Ñ¥½¸ˆ½¹±¥¬õí¡…¹‘±•…µÁ…¥¹AÉ¥µ…ÉåÑ¥½¹ôùíÁÉ¥µ…ÉåÑ¥½¹1…‰•±ôğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍ•½¹‘…Éäµ…Ñ¥½¸ˆ½¹±¥¬õí¡…¹‘±•…µÁ…¥¹Y¥•İ5…ÁôùY¥•Ü5…Àğ½‰ÕÑÑ½¸ø(€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µÍÕ•ÍÑ¥½¸ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù…µÁ…¥¸‰É¥•˜ğ½Àø(€€€€€€€€€€€€ñ Ìùí…µÁ…¥¹Q¥Ñ±•ôğ½ Ìø(€€€€€€€€€€€€ñÀùíµ½µ•¹Ñ1¥¹•ôğ½Àø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µ‘•Ñ…¥°µ±¥ÍĞˆø(€€€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œù]¡¼Í••Ì¥Ğğ½ÍÑÉ½¹œøí…Õ‘¥•¹•1¥¹•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œù]¡…ĞÑ¡•ä‘¼ğ½ÍÑÉ½¹œøí…Ñ¥½¹1¥¹•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œù]¡…Ğå½ÔÑÉ…¬ğ½ÍÑÉ½¹œøíµ•…ÍÕÉ•1¥¹•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€í¥Í…µÁ…¥¹=Ù•ÉÙ¥•Ü€ü€ (€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µ±…å•Èµ±¥ÍĞˆ…É¥„µ±…‰•°ô‰I•½µµ•¹‘•…µÁ…¥¸½ÁÑ¥½¹Ìˆø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½ÜˆùI•½µµ•¹‘•…µÁ…¥¸½ÁÑ¥½¹Ìğ½Àø(€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€íÉ•½µµ•¹‘•‘…µÁ…¥¹I½İÌ¹µ…À ¡…µÁ…¥¸¤€ôø€ (€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€­•äõí…µÁ…¥¸¹¥‘ô(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µ±…å•ÈµÉ½Ü‘Àµ…µÁ…¥¸µ½ÁÑ¥½¸µÉ½Üˆ(€€€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•…µÁ…¥¹MÑ•À¡…µÁ…¥¸¹¥¤ì(€€€€€€€€€€€€€€€€€€€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”õÁ…ÉÑ¹•È™Ñ…ˆõ…µÁ…¥¹Ì™™¥±Ñ•Èõ…µÁ…¥¹Ì™…µÁ…¥¹%ô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡…µÁ…¥¸¹¥¥õ€¤ì(€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùí…µÁ…¥¸¹…µÁ…¥¹9…µ•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€€€€€€€ñÍµ…±°ùí…µÁ…¥¸¹…Õ‘¥•¹”ñğ€‰½İ¹Ñ½İ¸…Õ‘¥•¹”‰ôƒ
Üí…µÁ…¥¸¹…É•„ñğ…µÁ…¥¸¹¥¹Ñ•¹Ğñğ€‰5…À…µÁ…¥¸‰ôğ½Íµ…±°ø(€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ñ•´ùí…µÁ…¥¸¹ÍÑ…ÑÕÌñğ€‰I•…‘ä‰ôğ½•´ø(€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€¤€è¹Õ±±ô((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µÉ•…‘½ÕĞˆ…É¥„µ±…‰•°ô‰…µÁ…¥¸É•…‘¥¹•ÍÌˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù¡•¬‰•™½É”±…Õ¹ ğ½Àø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€íl(€€€€€€€€€€€€€€€l‰5…ÀÁ±…•µ•¹Ğˆ°Í•±•Ñ•‘A¥¹½Áåt°(€€€€€€€€€€€€€€€l‰UÍ•È…Ñ¥½¸ˆ°Ñ…ÁÑ¥½¹t°(€€€€€€€€€€€€€€€l‰]¡…ĞÑ¼µ•…ÍÕÉ”ˆ°ÁÉ½½™A½¥¹Ñt°(€€€€€€€€€€€€€t¹µ…À ¡m±…‰•°°½Áåt¤€ôø€ (€€€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõí±…‰•±ôø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùí±…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÀùí½Áåôğ½Àø(€€€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•É%¹™½A…¹•° ¤ì(€€€½¹ÍĞ¥ÍA…ÉÑ¹•É%¹™¼€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆì(€€€¥˜€¡¥ÍA…ÉÑ¹•É%¹™¼¤É•ÑÕÉ¸€ñA…ÉÑ¹•ÉÕ¥‘”€¼øì(€€€½¹ÍĞÍÉ½±±Q½%¹™½…Ä€ô€ ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½È ˆ¹‘Àµ¥¹™¼µÕ¥‘”µ™…Äˆ¤ü¹ÍÉ½±±%¹Ñ½Y¥•Ü¡ì‰•¡…Ù¥½Èè€‰Íµ½½Ñ ˆ°‰±½¬è€‰ÍÑ…ÉĞˆô¤ì(€€€ôì(€€€½¹ÍĞ½¹Ñ•¹Ğ€ôì(€€€€€€€€€•å•‰É½Üè€‰UM%9=]9Q=]8AI-Lˆ°(€€€€€€€€€¡•…‘±¥¹”è€‰Ù•ÉåÑ¡¥¹œå½Ô¹••Ñ¼•Ğµ½É”½ÕĞ½˜‘½İ¹Ñ½İ¸¸ˆ°(€€€€€€€€€½Áäè€‰¥¹¹•…É‰äÁ±…•Ì°½µÁ…É”Ñ¡”µ½µ•¹Ğ°Í…Ù”İ¡…Ğµ…ÑÑ•ÉÌ°…¹½Á•¸É•Í¥‘•¹ĞÁ•É­Ìİ¡•¸Ñ¡•ä…ÁÁ±ä¸ˆ°(€€€€€€€€€ÁÉ¥µ…Éäèl‰áÁ±½É”Ñ¡”5…Àˆ°€ ¤€ôø½Á•¹I•Í¥‘•¹Ñ1…å•È ‰±°ˆ¥t°(€€€€€€€€€Í•½¹‘…Éäèl‰•Ğe½ÕÈA•É­Ì…Éˆ°€ ¤€ôø¹…Ù¥…Ñ” ˆ½…Éˆ¥t°(€€€€€€€€€½Ù•ÉÙ¥•Üèl(€€€€€€€€€€€l‰5…Àˆ°€‰I•ÍÑ…ÕÉ…¹ÑÌ°½™™•”°•Ù•¹ÑÌ°Í•ÉÙ¥•Ì°…¹‰Õ¥±‘¥¹Ì¹•…É‰ä¸‰t°(€€€€€€€€€€€l‰A•É­Ìˆ°€‰I•Í¥‘•¹Ğ‰•¹•™¥ÑÌ…¹Á…ÉÑ¹•È½™™•ÉÌ¥¸½¹Ñ•áĞ¸‰t°(€€€€€€€€€€€l‰M…Ù•ˆ°€‰A±…•Ì…¹Á±…¹Ìå½Ôİ…¹ĞÑ¼½µ”‰…¬Ñ¼¸‰t°(€€€€€€€€€€€l‰…Éˆ°€‰e½ÕÈÉ•Í¥‘•¹ĞEH™½ÈÁ…ÉÑ¥¥Á…Ñ¥¹œµ½µ•¹ÑÌ¸‰t°(€€€€€€€€€t°(€€€€€€€€€ÍÑ•ÁÌèl‰M•…É ½È¡½½Í”„™¥±Ñ•È¸ˆ°€‰=Á•¸Ñ¡”Á±…”°•Ù•¹Ğ°½ÈÁ•É¬¸ˆ°€‰M…Ù”¥Ğ°•Ğ‘¥É•Ñ¥½¹Ì°½ÈÍ¡½Üå½ÕÈ…É¸‰t°(€€€€€€€€€¡½Üèl(€€€€€€€€€€€l‰MÑ…ÉĞİ¥Ñ ¥¹Ñ•¹Ğ¸ˆ°€‰UÍ”„…Ñ•½Éä°¹•…É‰äÍ•…É °½ÈÍ¬Ñ¡”5…ÀÁÉ½µÁĞ¸‰t°(€€€€€€€€€€€l‰=Á•¸Ñ¡”É¥¡Ğ±…å•È¸ˆ°€‰A±…•Ì°•Ù•¹ÑÌ°Á•É­Ì°±¥ÍÑ¥¹Ì°…¹ÕÍ•™Õ°±½…°‘•Ñ…¥±ÌÍÑ…ä½¹¹•Ñ•Ñ¼Ñ¡”µ…À¸‰t°(€€€€€€€€€€€l‰Ğİ¥Ñ¡½ÕĞ±½Í¥¹œ½¹Ñ•áĞ¸ˆ°€‰M…Ù”°•Ğ‘¥É•Ñ¥½¹Ì°Í¡…É”°½ÈÍ¡½Üå½ÕÈÉ•Í¥‘•¹Ğ…É™É½´Ñ¡”Í…µ”™±½Ü¸‰t°(€€€€€€€€€t°(€€€€€€€€€™•…ÑÕÉ•Ìèl(€€€€€€€€€€€l‰9•…É‰äˆ°€‰¥¹¥¹œ°½™™•”°Í•ÉÙ¥•Ì°•Ù•¹ÑÌ°…¹‰Õ¥±‘¥¹Ì¸‰t°(€€€€€€€€€€€l‰A•É­Ìˆ°€‰	•¹•™¥ÑÌ…ÑÑ…¡•Ñ¼Á±…•Ì…¹Á…ÉÑ¹•Èµ½µ•¹ÑÌ¸‰t°(€€€€€€€€€€€l‰Ù•¹ÑÌˆ°€‰]¡…Ğ¥Ì¡…ÁÁ•¹¥¹œÑ½‘…ä½ÈÑ¡¥Ìİ••¬¸‰t°(€€€€€€€€€€€l‰I•Í¥‘•¹Ğ…Éˆ°€‰EHÁ…ÍÌ™½ÈÁ…ÉÑ¥¥Á…Ñ¥¹œÁ…ÉÑ¹•ÉÌ¸‰t°(€€€€€€€€€€€l‰M…Ù•ˆ°€‰Á•ÉÍ½¹…°±¥ÍĞ½˜Á±…•Ì…¹Á±…¹Ì¸‰t°(€€€€€€€€€€€l‰Í¬Ñ¡”5…Àˆ°€‰AÉ½µÁÑÌ™½Èİ¡…Ğå½Ô¹••É¥¡Ğ¹½Ü¸‰t°(€€€€€€€€€t°(€€€€€€€€€Ñ¥ÁÍQ¥Ñ±”è€‰1½…°Ñ¥ÁÌˆ°(€€€€€€€€€Ñ¥ÁÌèl(€€€€€€€€€€€€‰M…Ù”Á±…•Ì‰•™½É”Ñ¡”İ••­•¹¸ˆ°(€€€€€€€€€€€€‰¡•¬•Ù•¹ÑÌ‰•™½É”¡•…‘¥¹œ½ÕĞ¸ˆ°(€€€€€€€€€€€€‰M¡½Üå½ÕÈ…Éİ¡•¸„Á•É¬…Í­Ì™½È¥Ğ¸ˆ°(€€€€€€€€€t°(€€€€€€€€€™…Äèl(€€€€€€€€€€€l‰!½Ü‘¼Á•É­Ìİ½É¬üˆ°€‰=Á•¸„Á•É¬™É½´Ñ¡”µ…ÀÑ¼Í•”Ñ¡”‰•¹•™¥Ğ°İ¡•É”¥Ğ…ÁÁ±¥•Ì°…¹İ¡…ĞÑ¼Í¡½Ü¸‰t°(€€€€€€€€€€€l‰¼$¹••…¸…½Õ¹Ğüˆ°€‰e½Ô…¸‰É½İÍ”™É••±ä¸M…Ù•Á±…•Ì…¹É•Í¥‘•¹Ğ…•ÍÌİ½É¬‰•ÍĞİ¡•¸½¹¹•Ñ•Ñ¼å½ÕÈÉ•Í¥‘•¹ĞÁÉ½™¥±”¸‰t°(€€€€€€€€€€€l‰!½Ü‘¼$Í…Ù”Á±…•Ìüˆ°€‰=Á•¸„Á±…”°•Ù•¹Ğ°±¥ÍÑ¥¹œ°½ÈÁ•É¬…¹ÕÍ”Ñ¡”Í…Ù”…Ñ¥½¸İ¡•¸¥Ğ…ÁÁ•…ÉÌ¸‰t°(€€€€€€€€€€€l‰!½Ü‘¼$Õ¹±½¬½™™•ÉÌüˆ°€‰=Á•¸Ñ¡”A•É­Ì±…å•È…¹Í¡½ÜÑ¡”É•Í¥‘•¹Ğ…É½È½™™•È‘•Ñ…¥±Ìİ¡•¸„Á…ÉÑ¹•È…Í­Ì¸‰t°(€€€€€€€€€t°(€€€€€€€€€¡•±Àèl‰9••Í½µ”¡•±Àüˆ°€‰]”…É”¡…ÁÁäÑ¼Á½¥¹Ğå½Ô¥¸Ñ¡”É¥¡Ğ‘¥É•Ñ¥½¸¸ˆ°€‰É•ÅÕ•¹Ñ±äÍ­•EÕ•ÍÑ¥½¹Ìˆ°ÍÉ½±±Q½%¹™½…Åt°(€€€€€€€ôì(€€€½¹ÍĞµ…­•Y¥Í¥‰¥±¥ÑåI•±…Ñ•‘%Ñ•µÌ€ô€¡™¥±Ñ•È¤€ôøÁ±…•Ì(€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôøµ…Ñ¡•Í¥±Ñ•È¡Á±…”°™¥±Ñ•È°Í…Ù•‘%‘Ì¤¤(€€€€€€¹Í±¥” À°€Ğ¤(€€€€€€¹µ…À ¡Á±…”¤€ôø€¡ì(€€€€€€€¥èÁ±…”¹¥°(€€€€€€€Ñ¥Ñ±”èÁ±…”¹¹…µ”°(€€€€€€€ÑåÁ”èÁ±…”¹…Ñ•½ÉäñğÁ±…”¹ÑåÁ”ñğ€‰9•…É‰äˆ°(€€€€€€€¥µ…•UÉ°èÉ•Í½±Ù•¹Ñ¥Ñå%µ…”¡Á±…”°€‰…Éˆ¤°(€€€€€ô¤¤ì(€€€½¹ÍĞÙ¥Í¥‰¥±¥Ñå…Ñ•½É¥•Ì€ôl(€€€€€ì(€€€€€€€¥è€‰½™™•”ˆ°(€€€€€€€±…‰•°è€‰½™™•”ˆ°(€€€€€€€™¥±Ñ•Èè€‰½™™•”ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌ¹•…É‰ä…™•Ì°‰É•…­™…ÍĞÍÑ½ÁÌ°…¹Á±…•ÌÕÍ•™Õ°‰•™½É”İ½É¬½Èİ••­•¹Á±…¹Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰½™™•”ˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰9•…É‰äˆ°(€€€€€€€µ•Ñ„èl‰…™•Ìˆ°€‰5½É¹¥¹œˆ°€‰]…±­…‰±”‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰‘¥¹¥¹œˆ°(€€€€€€€±…‰•°è€‰¥¹¥¹œˆ°(€€€€€€€™¥±Ñ•Èè€‰¥¹¥¹œˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰AÉ¥½É¥Ñ¥é•ÌÉ•ÍÑ…ÕÉ…¹ÑÌ°‘¥¹¹•ÈÍÁ½ÑÌ°…¹Á±…•Ìİ½ÉÑ Á±…¹¹¥¹œ…É½Õ¹‰•™½É”½È…™Ñ•È•Ù•¹ÑÌ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰¥¹¥¹œˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰UÍ•™Õ°¹½Üˆ°(€€€€€€€µ•Ñ„èl‰I•ÍÑ…ÕÉ…¹ÑÌˆ°€‰¥¹¹•Èˆ°€‰A±…¹Ì‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰¡…ÁÁäµ¡½ÕÈˆ°(€€€€€€€±…‰•°è€‰!…ÁÁä!½ÕÈˆ°(€€€€€€€™¥±Ñ•Èè€‰!…ÁÁä!½ÕÈˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰¥¹‘Ì‘É¥¹¬ÍÁ•¥…±Ì°…™Ñ•Èµİ½É¬ÍÑ½ÁÌ°…¹É•Í¥‘•¹Ğµ™É¥•¹‘±äÙ…±Õ”¹•…É‰ä¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰!…ÁÁä!½ÕÈˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰Q½¹¥¡Ğˆ°(€€€€€€€µ•Ñ„èl‰™Ñ•Èİ½É¬ˆ°€‰É¥¹­Ìˆ°€‰Y…±Õ”‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰•Ù•¹ÑÌˆ°(€€€€€€€±…‰•°è€‰Ù•¹ÑÌˆ°(€€€€€€€™¥±Ñ•Èè€‰Ù•¹ÑÌˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌ±¥Ù”µÕÍ¥Œ°¥Ù¥Œµ½µ•¹ÑÌ°ÍÁ½ÉÑÌ°Á…É­Ì°…¹Ñ¡¥¹Ì¡…ÁÁ•¹¥¹œÍ½½¸¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰Ù•¹ÑÌˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰Ñ¥Ù”ˆ°(€€€€€€€µ•Ñ„èl‰Q½‘…äˆ°€‰Q¡¥Ìİ••¬ˆ°€‰IMY@‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰Á•É­Ìˆ°(€€€€€€€±…‰•°è€‰A•É­Ìˆ°(€€€€€€€™¥±Ñ•Èè€‰A•É­Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰MÕÉ™…•ÌÉ•Í¥‘•¹Ğ‰•¹•™¥ÑÌ…¹…Éµ½µ•¹ÑÌÑ¥•Ñ¼Á…ÉÑ¥¥Á…Ñ¥¹œÁ±…•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰A•É­Ìˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰I•Í¥‘•¹ĞÙ…±Õ”ˆ°(€€€€€€€µ•Ñ„èl‰=™™•ÉÌˆ°€‰…Éˆ°€‰9•…É‰ä‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰¡½Ñ•±Ìˆ°(€€€€€€€±…‰•°è€‰!½Ñ•±Ìˆ°(€€€€€€€™¥±Ñ•Èè€‰!½Ñ•±Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌ¡½Ñ•±Ì°±½‰‰äµ½µ•¹ÑÌ°Õ•ÍĞµ™É¥•¹‘±äÁ±…•Ì°…¹ÍÑ…å…Ñ¥½¸½¹Ñ•áĞ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰!½Ñ•±Ìˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰Õ•ÍĞ±…å•Èˆ°(€€€€€€€µ•Ñ„èl‰!½Ñ•±Ìˆ°€‰Õ•ÍÑÌˆ°€‰½¹¥•É”‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰ÁÉ½Á•ÉÑ¥•Ìˆ°(€€€€€€€±…‰•°è€‰AÉ½Á•ÉÑ¥•Ìˆ°(€€€€€€€™¥±Ñ•Èè€‰AÉ½Á•ÉÑ¥•Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌÉ•Í¥‘•¹Ñ¥…°‰Õ¥±‘¥¹Ì°±¥ÍÑ¥¹Ì°…¹¹•…É‰ä±¥™•ÍÑå±”½¹Ñ•áĞ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰AÉ½Á•ÉÑ¥•Ìˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰1¥Ù¥¹œ¡•É”ˆ°(€€€€€€€µ•Ñ„èl‰	Õ¥±‘¥¹Ìˆ°€‰1¥ÍÑ¥¹Ìˆ°€‰¥ÍÑÉ¥ÑÌ‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰±••¹‘Ìˆ°(€€€€€€€±…‰•°è€‰1••¹‘Ìˆ°(€€€€€€€™¥±Ñ•Èè€‰1••¹‘Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰!¥¡±¥¡ÑÌ1••¹‘ÌÉ•…°•ÍÑ…Ñ”±¥ÍÑ¥¹Ì°‰Õ¥±‘¥¹Ì°…¹‘½İ¹Ñ½İ¸±¥Ù¥¹œ½¹Ñ•áĞ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰1••¹‘Ìˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰I•…°•ÍÑ…Ñ”ˆ°(€€€€€€€µ•Ñ„èl‰1¥ÍÑ¥¹Ìˆ°€‰	Õ¥±‘¥¹Ìˆ°€‰Q½ÕÉÌ‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰…ÉÑÌˆ°(€€€€€€€±…‰•°è€‰ÉÑÌˆ°(€€€€€€€™¥±Ñ•Èè€‰ÉÑÌ€˜Õ±ÑÕÉ”ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰	É¥¹Ì™½Éİ…É…±±•É¥•Ì°ÁÕ‰±¥Œ…ÉĞ°Õ±ÑÕÉ”ÍÑ½ÁÌ°…¹‘¥ÍÑÉ¥ĞÍÑ½É¥•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰ÉÑÌ€˜Õ±ÑÕÉ”ˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰Õ±ÑÕÉ”ˆ°(€€€€€€€µ•Ñ„èl‰ÉĞˆ°€‰MÑ½É¥•Ìˆ°€‰]…±­Ì‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰É•Ñ…¥°ˆ°(€€€€€€€±…‰•°è€‰I•Ñ…¥°ˆ°(€€€€€€€™¥±Ñ•Èè€‰I•Ñ…¥°ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌÍ¡½ÁÌ°‰É…¹‘Ì°•ÉÉ…¹‘Ì°…¹Á±…•Ìİ½ÉÑ ½Á•¹¥¹œİ¡¥±”İ…±­¥¹œ‘½İ¹Ñ½İ¸¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰I•Ñ…¥°ˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰M¡½ÁÁ¥¹œˆ°(€€€€€€€µ•Ñ„èl‰MÑ½É•Ìˆ°€‰	É…¹‘Ìˆ°€‰ÉÉ…¹‘Ì‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰™¥Ñ¹•ÍÌˆ°(€€€€€€€±…‰•°è€‰¥Ñ¹•ÍÌˆ°(€€€€€€€™¥±Ñ•Èè€‰¥Ñ¹•ÍÌˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰AÉ¥½É¥Ñ¥é•ÌåµÌ°İ•±±¹•ÍÌÁ…ÉÑ¹•ÉÌ°ÑÉ…¥°…•ÍÌ°…¹…Ñ¥Ù”‘½İ¹Ñ½İ¸É½ÕÑ¥¹•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰¥Ñ¹•ÍÌˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰Ñ¥Ù”ˆ°(€€€€€€€µ•Ñ„èl‰]•±±¹•ÍÌˆ°€‰5½Ù•µ•¹Ğˆ°€‰QÉ…¥°‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰Í•ÉÙ¥•Ìˆ°(€€€€€€€±…‰•°è€‰M•ÉÙ¥•Ìˆ°(€€€€€€€™¥±Ñ•Èè€‰M•ÉÙ¥•Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌÕÍ•™Õ°±½…°Í•ÉÙ¥•Ì°•Ù•Éå‘…ä•ÉÉ…¹‘Ì°…¹ÁÉ…Ñ¥…°‘½İ¹Ñ½İ¸É•Í½ÕÉ•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰M•ÉÙ¥•Ìˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰UÍ•™Õ°ˆ°(€€€€€€€µ•Ñ„èl‰ÉÉ…¹‘Ìˆ°€‰1½…°ˆ°€‰MÕÁÁ½ÉĞ‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰Á…É­¥¹œˆ°(€€€€€€€±…‰•°è€‰A…É­¥¹œˆ°(€€€€€€€™¥±Ñ•Èè€‰A…É­¥¹œˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰!•±ÁÌ½µÁ…É”…É…•Ì°…ÉÉ¥Ù…°½ÁÑ¥½¹Ì°…¹Á±…•ÌÑ¼Á…É¬‰•™½É”„Á±…¸¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰A…É­¥¹œˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰ÉÉ¥Ù…°ˆ°(€€€€€€€µ•Ñ„èl‰…É…•Ìˆ°€‰ÉÉ¥Ù…°ˆ°€‰I½ÕÑ•Ì‰t°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰¥Ù¥Œˆ°(€€€€€€€±…‰•°è€‰¥Ù¥Œˆ°(€€€€€€€™¥±Ñ•Èè€‰¥Ù¥Œˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰M¡½İÌÁ…É­Ì°ÁÕ‰±¥ŒÍÁ…•Ì°‘¥ÍÑÉ¥ĞÁÉ½É…µÌ°¥Ù¥ŒÍÑ½ÁÌ°…¹½µµÕ¹¥ÑäÉ•Í½ÕÉ•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè…Ñ¥Ù•¥±Ñ•È€ôôô€‰¥Ù¥Œˆ€ü€‰M¡½İ¥¹œ¹½Üˆ€è€‰AÕ‰±¥Œˆ°(€€€€€€€µ•Ñ„èl‰A…É­Ìˆ°€‰AÕ‰±¥Œˆ°€‰¥ÍÑÉ¥Ğ‰t°(€€€€€ô°(€€€tì(€€€½¹ÍĞÁ…ÉÑ¹•É5…¹…•%Ñ•µÌ€ôl(€€€€€ì(€€€€€€€¥è€‰ÁÉ½™¥±”ˆ°(€€€€€€€±…‰•°è€‰AÉ½™¥±”ˆ°(€€€€€€€Ñ¥Ñ±”è€‰AÉ½™¥±”ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰½¹ÑÉ½°Ñ¡”¹…µ”°ÍÑ½Éä°½¹Ñ…Ğ‘•Ñ…¥±Ì°…¹ÁÕ‰±¥Œ¥‘•¹Ñ¥ÑäÉ•Í¥‘•¹ÑÌÍ•”™¥ÉÍĞ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰AÕ‰±¥Í¡•ˆ°(€€€€€€€µ•Ñ„èl‰%‘•¹Ñ¥Ñäˆ°€‰½¹Ñ…Ğˆ°€‰MÑ½Éä‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸AÉ½™¥±”ˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½ÁÉ½™¥±”ˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰µ…ÀµÁÉ•Í•¹”ˆ°(€€€€€€€±…‰•°è€‰5…ÀAÉ•Í•¹”ˆ°(€€€€€€€Ñ¥Ñ±”è€‰5…ÀAÉ•Í•¹”ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰½¹ÑÉ½°…Ñ•½Éä°‘¥ÍÑÉ¥Ğ°¥µ…•Ì°µ…ÀÙ¥Í¥‰¥±¥Ñä°…¹Ñ¡”™¥ÉÍĞ¥µÁÉ•ÍÍ¥½¸É•Í¥‘•¹ÑÌÍ•”¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰5…À½¹¹•Ñ•ˆ°(€€€€€€€µ•Ñ„èl‰…Ñ•½Éäˆ°€‰¥ÍÑÉ¥Ğˆ°€‰%µ…•Ì‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰UÁ‘…Ñ”5…ÀAÉ•Í•¹”ˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½µ…Àˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰…µÁ…¥¹Ìˆ°(€€€€€€€±…‰•°è€‰…µÁ…¥¹Ìˆ°(€€€€€€€Ñ¥Ñ±”è€‰…µÁ…¥¹Ìˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰É•…Ñ”…¹µ…¹…”±½…°µ½µ•¹ÑÌÑ¡…Ğ…¸…ÁÁ•…È½¸Ñ¡”µ…À°É•Í¥‘•¹Ğ™••°EHÁ…Ñ¡Ì°½ÈÁ…ÉÑ¹•ÈÉ•Á½ÉÑÌ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰I•½µµ•¹‘•ˆ°(€€€€€€€µ•Ñ„èl‰I•… ˆ°€‰Q¥µ¥¹œˆ°€‰I•Á½ÉÑ¥¹œ‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸…µÁ…¥¹Ìˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½…µÁ…¥¹Ìˆô°(€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèmì±…‰•°è€‰É•…Ñ”…µÁ…¥¸ˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½…µÁ…¥¹Ìı¥¹Ñ•¹Ğõ¹•Üˆõt°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰½™™•ÉÌˆ°(€€€€€€€±…‰•°è€‰=™™•ÉÌˆ°(€€€€€€€Ñ¥Ñ±”è€‰=™™•ÉÌˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰¥Ù”¹•…É‰äÁ•½Á±”½¹”±•…ÈÉ•…Í½¸Ñ¼Í…Ù”°Í…¸°É•ÅÕ•ÍĞ‘¥É•Ñ¥½¹Ì°½ÈÙ¥Í¥Ğ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰É…™Ğ¹•áĞˆ°(€€€€€€€µ•Ñ„èl‰A•É­Ìˆ°€‰I•‘•µÁÑ¥½¹Ìˆ°€‰Y¥Í¥ÑÌ‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸=™™•ÉÌˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½½™™•ÉÌˆô°(€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèmì±…‰•°è€‰É•…Ñ”=™™•Èˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½½™™•ÉÌı¥¹Ñ•¹Ğõ¹•Üˆõt°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰•Ù•¹ÑÌˆ°(€€€€€€€±…‰•°è€‰Ù•¹ÑÌˆ°(€€€€€€€Ñ¥Ñ±”è€‰Ù•¹ÑÌˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰AÉ½µ½Ñ”µ½µ•¹ÑÌÁ•½Á±”…¸…ÑÑ•¹…¹½¹¹•ĞIMY@…Ñ¥Ù¥Ñä‰…¬Ñ¼µ…ÀÉ•Á½ÉÑ¥¹œ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰Ù…¥±…‰±”ˆ°(€€€€€€€µ•Ñ„èl‰IMY@ˆ°€‰…±•¹‘…Èˆ°€‰9•…É‰ä‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸Ù•¹ÑÌˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½•Ù•¹ÑÌˆô°(€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèmì±…‰•°è€‰AÉ•Ù¥•ÜÙ•¹ÑÌˆ°…Ñ¥½¸è€‰Á…ÉÑ¹•Èµµ…Àµ™¥±Ñ•Èˆ°™¥±Ñ•Èè€‰Ù•¹ÑÌˆõt°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰ÅÈˆ°(€€€€€€€±…‰•°è€‰EHˆ°(€€€€€€€Ñ¥Ñ±”è€‰EHˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰½¹¹•ĞÁÉ¥¹Ñ•µ…Ñ•É¥…±Ì°±½‰‰äµ½µ•¹ÑÌ°Í…¹Ì°…¹É•Í¥‘•¹Ğ…É¥¹Ñ•É…Ñ¥½¹ÌÑ¼É•Á½ÉÑ¥¹œ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰½¹¹•Ñ•ˆ°(€€€€€€€µ•Ñ„èl‰M…¹Ìˆ°€‰AÉ¥¹Ğˆ°€‰…É‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸EH5…Ñ•É¥…±Ìˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½µ•‘¥„ıÍ•Ñ¥½¸õÅÈˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰…Õ‘¥•¹”ˆ°(€€€€€€€±…‰•°è€‰Õ‘¥•¹”ˆ°(€€€€€€€Ñ¥Ñ±”è€‰Õ‘¥•¹”ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰U¹‘•ÉÍÑ…¹İ¡¼Í…Ù•Ì°Í…¹Ì°½Á•¹Ì‘¥É•Ñ¥½¹Ì°…¹É•ÑÕÉ¹Ì™É½´¹•…É‰äµ…À…Ñ¥Ù¥Ñä¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰M¥¹…±Ì±¥Ù”ˆ°(€€€€€€€µ•Ñ„èl‰I•Í¥‘•¹ÑÌˆ°€‰Y¥Í¥Ñ½ÉÌˆ°€‰M•µ•¹ÑÌ‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸Õ‘¥•¹”ˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½…Õ‘¥•¹”ˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰µ•‘¥„ˆ°(€€€€€€€±…‰•°è€‰5•‘¥„ˆ°(€€€€€€€Ñ¥Ñ±”è€‰5•‘¥„ˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰-••ÀÑ¡”¥µ…•Ì…¹‰É…¹…ÍÍ•ÑÌÑ¡…Ğ…ÁÁ•…È…É½ÍÌµ…À…É‘Ì°Á…¹•±Ì°…¹EHµ½µ•¹ÑÌÕÉÉ•¹Ğ¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰9••‘ÌÉ•Ù¥•Üˆ°(€€€€€€€µ•Ñ„èl‰A¡½Ñ½Ìˆ°€‰1½¼ˆ°€‰…É‘Ì‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸5•‘¥„ˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½µ•‘¥„ˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰É•Á½ÉÑÌˆ°(€€€€€€€±…‰•°è€‰I•Á½ÉÑÌˆ°(€€€€€€€Ñ¥Ñ±”è€‰I•Á½ÉÑÌˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰I•…Í…Ù•Ì°Í…¹Ì°‘¥É•Ñ¥½¹Ì°IMYAÌ°…¹™½±±½ÜµÕÀ…Ñ¥Ù¥Ñä¥¸½¹”½Á•É…Ñ¥¹œÙ¥•Ü¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰1¥Ù”ˆ°(€€€€€€€µ•Ñ„èl‰M…Ù•Ìˆ°€‰M…¹Ìˆ°€‰¥É•Ñ¥½¹Ì‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰Y¥•ÜI•Á½ÉÑÌˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½É•Á½ÉÑÌˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰µ•µ‰•ÉÍ¡¥Àˆ°(€€€€€€€±…‰•°è€‰5•µ‰•ÉÍ¡¥Àˆ°(€€€€€€€Ñ¥Ñ±”è€‰5•µ‰•ÉÍ¡¥Àˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰I•Ù¥•ÜÁ±…¸…•ÍÌ°‰¥±±¥¹œ°…‘µ½¹Ì°…¹Ñ¡”Ñ½½±Ì¥¹±Õ‘•İ¥Ñ å½ÕÈÕÉÉ•¹Ğµ•µ‰•ÉÍ¡¥À¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰Ñ¥Ù”ˆ°(€€€€€€€µ•Ñ„èl‰A±…¸ˆ°€‰	¥±±¥¹œˆ°€‰•ÍÌ‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸5•µ‰•ÉÍ¡¥Àˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½‰¥±±¥¹œˆô°(€€€€€ô°(€€€€€ì(€€€€€€€¥è€‰…½Õ¹Ğˆ°(€€€€€€€±…‰•°è€‰½Õ¹Ğˆ°(€€€€€€€Ñ¥Ñ±”è€‰½Õ¹Ğˆ°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸è€‰I•Ù¥•ÜÑ•…´…•ÍÌ°…½Õ¹Ğ‘•Ñ…¥±Ì°¹½Ñ¥™¥…Ñ¥½¹Ì°…¹İ½É­ÍÁ…”ÁÉ•™•É•¹•Ì¸ˆ°(€€€€€€€ÍÑ…ÑÕÌè€‰Q•…´…•ÍÌˆ°(€€€€€€€µ•Ñ„èl‰Q•…´ˆ°€‰M•ÑÑ¥¹Ìˆ°€‰•ÍÌ‰t°(€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è€‰=Á•¸½Õ¹Ğˆ°…Ñ¥½¸è€‰½Á•¸µ¡É•˜ˆ°¡É•˜è€ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½ÁÉ½™¥±”ıÍ•Ñ¥½¸õ…½Õ¹Ğˆô°(€€€€€ô°(€€€tì(€€€½¹ÍĞµ…ÑÉ¥á%Ñ•µÌ€ô¥ÍA…ÉÑ¹•É%¹™¼(€€€€€€üÁ…ÉÑ¹•É5…¹…•%Ñ•µÌ¹µ…À ¡¥Ñ•´¤€ôø€¡ì(€€€€€€€€€€¸¸¹¥Ñ•´°(€€€€€€€€€•å•‰É½Üè€‰]½É­ÍÁ…”…É•„ˆ°(€€€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèl(€€€€€€€€€€€€¸¸¸¡¥Ñ•´¹Í•½¹‘…ÉåÑ¥½¹Ìñğmt¤°(€€€€€€€€€€€ì±…‰•°è€‰AÉ•Ù¥•ÜI•Í¥‘•¹ĞY¥•Üˆ°…Ñ¥½¸è€‰ÁÉ•Ù¥•Üˆô°(€€€€€€€€€t°(€€€€€€€ô¤¤(€€€€€€èÙ¥Í¥‰¥±¥Ñå…Ñ•½É¥•Ì¹µ…À ¡¥Ñ•´¤€ôøì(€€€€€€€€€½¹ÍĞÉ•±…Ñ•‘%Ñ•µÌ€ôµ…­•Y¥Í¥‰¥±¥ÑåI•±…Ñ•‘%Ñ•µÌ¡¥Ñ•´¹™¥±Ñ•È¤ì(€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€€¸¸¹¥Ñ•´°(€€€€€€€€€€€•å•‰É½Üè€‰5…ÀÁÉ¥½É¥Ñäˆ°(€€€€€€€€€€€Ñ¥Ñ±”è¥Ñ•´¹±…‰•°°(€€€€€€€€€€€µ•Ñ„èl(€€€€€€€€€€€€€€¸¸¹¥Ñ•´¹µ•Ñ„°(€€€€€€€€€€€€€É•±…Ñ•‘%Ñ•µÌ¹±•¹Ñ €ü€‘íÉ•±…Ñ•‘%Ñ•µÌ¹±•¹Ñ¡ô•á…µÁ±•Í€€è€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ°(€€€€€€€€€€€t°(€€€€€€€€€€€ÁÉ¥µ…ÉåÑ¥½¸èì±…‰•°è…Ñ¥Ù•¥±Ñ•È€ôôô¥Ñ•´¹™¥±Ñ•È€ü€‰!¥‘”ˆ€è€‰M¡½Ü½¸µ…Àˆ°…Ñ¥½¸è…Ñ¥Ù•¥±Ñ•È€ôôô¥Ñ•´¹™¥±Ñ•È€ü€‰¡¥‘”µ™¥±Ñ•Èˆ€è€‰Í¡½Üµ™¥±Ñ•Èˆ°™¥±Ñ•Èè¥Ñ•´¹™¥±Ñ•Èô°(€€€€€€€€€€€Í•½¹‘…ÉåÑ¥½¹Ìèl(€€€€€€€€€€€€€ì±…‰•°è€‰Í¬Ñ¡”5…Àˆ°…Ñ¥½¸è€‰…Í¬ˆ°ÁÉ½µÁĞè€‘í¥Ñ•´¹±…‰•±ô¹•…É‰å€ô°(€€€€€€€€€€€€€ì±…‰•°è€‰M•Ğ…Ì‘•™…Õ±Ğˆ°…Ñ¥½¸è€‰Í¡½Üµ™¥±Ñ•Èˆ°™¥±Ñ•Èè¥Ñ•´¹™¥±Ñ•Èô°(€€€€€€€€€€€t°(€€€€€€€€€€€É•±…Ñ•‘%Ñ•µÌ°(€€€€€€€€€ôì(€€€€€€€ô¤ì(€€€½¹ÍĞ¡…¹‘±•%¹™½5…ÑÉ¥áÑ¥½¸€ô€¡…Ñ¥½¸°¥Ñ•´¤€ôøì(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰…Í¬ˆ¤ì(€€€€€€€Ù½¥…ÁÁ±åAÉ½µÁĞ¡…Ñ¥½¸¹ÁÉ½µÁĞñğ€‘í¥Ñ•´¹Ñ¥Ñ±•ô¹•…É‰å€¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰ÁÉ•Ù¥•Üˆ¤ì(€€€€€€€½Á•¹A…ÉÑ¹•É5…À ‰±°ˆ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰Í¡½Üµ™¥±Ñ•Èˆ€˜˜…Ñ¥½¸¹™¥±Ñ•È¤ì(€€€€€€€½Á•¹I•Í¥‘•¹Ñ1…å•È¡…Ñ¥½¸¹™¥±Ñ•È¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰¡¥‘”µ™¥±Ñ•Èˆ¤ì(€€€€€€€½Á•¹I•Í¥‘•¹Ñ1…å•È ‰±°ˆ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰Á…ÉÑ¹•Èµµ…Àµ™¥±Ñ•Èˆ€˜˜…Ñ¥½¸¹™¥±Ñ•È¤ì(€€€€€€€½Á•¹A…ÉÑ¹•É5…À¡…Ñ¥½¸¹™¥±Ñ•È¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰½Á•¸µ¡É•˜ˆ€˜˜…Ñ¥½¸¹¡É•˜¤ì(€€€€€€€¹…Ù¥…Ñ”¡…Ñ¥½¸¹¡É•˜¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡…Ñ¥½¸¹…Ñ¥½¸€ôôô€‰½Á•¸µÉ•±…Ñ•ˆ€˜˜…Ñ¥½¸¹É•±…Ñ•‘%¤ì(€€€€€€€½¹ÍĞÉ•±…Ñ•‘A±…”€ôÁ±…•Ì¹™¥¹ ¡…¹‘¥‘…Ñ”¤€ôø…¹‘¥‘…Ñ”¹¥€ôôô…Ñ¥½¸¹É•±…Ñ•‘%¤ì(€€€€€€€¥˜€¡É•±…Ñ•‘A±…”¤Í•±•ÑA±…”¡É•±…Ñ•‘A±…”¤ì(€€€€€ô(€€€ôì(€€€½¹ÍĞ¥¹™½5…ÑÉ¥áM•±•Ñ•‘%€ô¥ÍA…ÉÑ¹•É%¹™¼(€€€€€€ü€‰ÁÉ½™¥±”ˆ(€€€€€€èÙ¥Í¥‰¥±¥Ñå…Ñ•½É¥•Ì¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹™¥±Ñ•È€ôôô…Ñ¥Ù•¥±Ñ•È¤ü¹¥ñğ€‰½™™•”ˆì((€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”õí‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µÁ…¹•°‘ÀµÁ…ÉÑ¹•Èµ¥¹™¼µÁ…¹•°‘ÀµÍ¡…É•µ¥¹™¼µÁ…¹•°€‘í¥ÍA…ÉÑ¹•É%¹™¼€ü€‰¥ÌµÁ…ÉÑ¹•Èˆ€è€‰¥ÌµÉ•Í¥‘•¹Ğ‰õôø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µ¡•É¼‘Àµ¥¹™¼µÕ¥‘”µ¡•É¼ˆø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆùí½¹Ñ•¹Ğ¹•å•‰É½İôğ½Àø(€€€€€€€€€€€€€€ñ Èùí½¹Ñ•¹Ğ¹¡•…‘±¥¹•ôğ½ Èø(€€€€€€€€€€€€€€ñÀùí½¹Ñ•¹Ğ¹½Áåôğ½Àø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÕ¥‘”µµ•‘¥„ˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆø(€€€€€€€€€€€€€€ñ%¹™¼±…ÍÍ9…µ”ô‰ ´ÔÜ´Ôˆ€¼ø(€€€€€€€€€€€€€€ñÍÁ…¸ùí¥ÍA…ÉÑ¹•É%¹™¼€ü€‰A…ÉÑ¹•Èİ½É­ÍÁ…”ƒ
ÜÑ¥Ù”ˆ€è€‰I•Í¥‘•¹Ğ±½…°Õ¥‘”‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÕ¥‘”µ…Ñ¥½¹Ìˆø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÁÉ¥µ…Éäµ…Ñ¥½¸ˆ½¹±¥¬õí½¹Ñ•¹Ğ¹ÁÉ¥µ…ÉålÅuôùí½¹Ñ•¹Ğ¹ÁÉ¥µ…ÉålÁuôğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍ•½¹‘…Éäµ…Ñ¥½¸ˆ½¹±¥¬õí½¹Ñ•¹Ğ¹Í•½¹‘…ÉålÅuôùí½¹Ñ•¹Ğ¹Í•½¹‘…ÉålÁuôğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñ%¹Ñ•É…Ñ¥Ù•5…ÑÉ¥à(€€€€€€€€€€€•å•‰É½Üõí¥ÍA…ÉÑ¹•É%¹™¼€ü€‰]½É­ÍÁ…”Ñ½½±Ìˆ€è€‰9•…É‰äÙ¥Í¥‰¥±¥Ñä‰ô(€€€€€€€€€€€Ñ¥Ñ±”õí¥ÍA…ÉÑ¹•É%¹™¼€ü€‰5…¹…”Ñ¡”Á…ÉÑÌ½˜å½ÕÈ‘½İ¹Ñ½İ¸ÁÉ•Í•¹”É•Í¥‘•¹ÑÌ…¸Í•”¸ˆ€è€‰¡½½Í”İ¡…ĞÑ¡”µ…ÀÁÉ¥½É¥Ñ¥é•Ì¸‰ô(€€€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸õí¥ÍA…ÉÑ¹•É%¹™¼€ü€‰M•±•Ğ„İ½É­ÍÁ…”…É•„Ñ¼Í•”İ¡…Ğ¥Ğ½¹ÑÉ½±Ì°İ¡…Ğ¥ÌÕÉÉ•¹Ğ°…¹Ñ¡”¹•áĞÕÍ•™Õ°…Ñ¥½¸¸ˆ€è€‰A¥¬„…Ñ•½ÉäÑ¼Í•”İ¡…Ğ…ÁÁ•…ÉÌ°İ¡ä¥Ğ¥ÌÕÍ•™Õ°°…¹İ¡…ĞÑ¼½Á•¸¹•áĞ¸‰ô(€€€€€€€€€€€¥Ñ•µÌõíµ…ÑÉ¥á%Ñ•µÍô(€€€€€€€€€€€¥¹¥Ñ¥…±M•±•Ñ•‘%õí¥¹™½5…ÑÉ¥áM•±•Ñ•‘%‘ô(€€€€€€€€€€€½¹Ñ¥½¸õí¡…¹‘±•%¹™½5…ÑÉ¥áÑ¥½¹ô(€€€€€€€€€€€±…ÍÍ9…µ”õí‘Àµ¥¹™¼µ¥¹Ñ•É…Ñ¥Ù”µµ…ÑÉ¥à€‘í¥ÍA…ÉÑ¹•É%¹™¼€ü€‰‘ÀµÁ…ÉÑ¹•Èµµ…¹…”µµ…ÑÉ¥àˆ€è€‰‘ÀµÙ¥Í¥‰¥±¥Ñäµµ…ÑÉ¥à‰õô(€€€€€€€€€€¼ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ¥¹™¼µÍÑ•ÁÌˆ…É¥„µ±…‰•°ô‰•ÑÑ¥¹œÍÑ…ÉÑ•ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù•ÑÑ¥¹œÍÑ…ÉÑ•ğ½Àø(€€€€€€€€€€€í½¹Ñ•¹Ğ¹ÍÑ•ÁÌ¹µ…À ¡ÍÑ•À°¥¹‘•à¤€ôø€ (€€€€€€€€€€€€€€ñ‘¥Ø­•äõíÍÑ•Áôø(€€€€€€€€€€€€€€€€ñÍÁ…¸ùíMÑÉ¥¹œ¡¥¹‘•à€¬€Ä¤¹Á…‘MÑ…ÉĞ È°€ˆÀˆ¥ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÀùíÍÑ•Áôğ½Àø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µ±¥ÍĞ‘Àµ¥¹™¼µÕ¥‘”µ±¥ÍĞˆ…É¥„µ±…‰•°ô‰!½Ü¥Ğİ½É­Ìˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù!½Ü¥Ğİ½É­Ìğ½Àø(€€€€€€€€€€€í½¹Ñ•¹Ğ¹¡½Ü¹µ…À ¡mÑ¥Ñ±”°½Áåt¤€ôø€ (€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõíÑ¥Ñ±•ô±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Ü‘ÀµÁ…ÉÑ¹•Èµ™••µÉ½Üˆø(€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µµ…¥¸ˆø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Üµ¥½¸ˆøñ½µÁ…ÍÌ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œùíÑ¥Ñ±•ôğ½ÍÑÉ½¹œøñÍµ…±°ùí½Áåôğ½Íµ…±°øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÕ¥‘”µÑ¥ÁÌˆ…É¥„µ±…‰•°õí½¹Ñ•¹Ğ¹Ñ¥ÁÍQ¥Ñ±•ôø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆùí½¹Ñ•¹Ğ¹Ñ¥ÁÍQ¥Ñ±•ôğ½Àø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€í½¹Ñ•¹Ğ¹Ñ¥ÁÌ¹µ…À ¡Ñ¥À¤€ôø€ñÍÁ…¸­•äõíÑ¥ÁôùíÑ¥Áôğ½ÍÁ…¸ø¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÕ¥‘”µ™…Äˆ…É¥„µ±…‰•°ô‰É•ÅÕ•¹Ñ±äÍ­•EÕ•ÍÑ¥½¹Ìˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½ÜˆùÉ•ÅÕ•¹Ñ±äÍ­•EÕ•ÍÑ¥½¹Ìğ½Àø(€€€€€€€€€€€í½¹Ñ•¹Ğ¹™…Ä¹µ…À ¡mÅÕ•ÍÑ¥½¸°…¹Íİ•Ét°¥¹‘•à¤€ôø€ (€€€€€€€€€€€€€€ñ‘•Ñ…¥±Ì­•äõíÅÕ•ÍÑ¥½¹ô½Á•¸õí¥¹‘•à€ôôô€Áôø(€€€€€€€€€€€€€€€€ñÍÕµµ…ÉäøñÍÁ…¸ùíÅÕ•ÍÑ¥½¹ôğ½ÍÁ…¸øñ¡•ÙÉ½¹½İ¸…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼øğ½ÍÕµµ…Éäø(€€€€€€€€€€€€€€€€ñÀùí…¹Íİ•Éôğ½Àø(€€€€€€€€€€€€€€ğ½‘•Ñ…¥±Ìø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Á½ÉĞµ¹•áĞµ…Ñ¥½¸‘Àµ¥¹™¼µÕ¥‘”µ¡•±Àˆ…É¥„µ±…‰•°ô‰9••¡•±Àˆø(€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€ñÍÁ…¸ù9••¡•±Àüğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñÍÑÉ½¹œùí½¹Ñ•¹Ğ¹¡•±ÁlÁuôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€ñÀùí½¹Ñ•¹Ğ¹¡•±ÁlÅuôğ½Àø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õí½¹Ñ•¹Ğ¹Í•½¹‘…ÉålÅuôù½¹Ñ…ĞMÕÁÁ½ÉĞğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õí½¹Ñ•¹Ğ¹¡•±ÁlÍuôùí½¹Ñ•¹Ğ¹¡•±ÁlÉuôğ½‰ÕÑÑ½¸ø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸É•¹‘•É¥Ù¥A…¹•° ¤ì(€€€½¹ÍĞ¥Ù¥A±…•Ì€ôÁ±…•Ì(€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôø¥Í¥Ù¥¹Ñ¥Ñä¡Á±…”¤ñğ€¡¥ÍÙ•¹Ñ¹Ñ¥Ñä¡Á±…”¤€˜˜Á±…•Q•áĞ¡Á±…”¤¹¥¹±Õ‘•Ì ‰¥Ù¥Œˆ¤¤¤(€€€€€€¹Í½ÉĞ ¡„°ˆ¤€ôøì(€€€€€€€½¹ÍĞ…MÑ½À€ô•Ñ……MÑ½ÁÉ½µA±…”¡„¤ì(€€€€€€€½¹ÍĞ‰MÑ½À€ô•Ñ……MÑ½ÁÉ½µA±…”¡ˆ¤ì(€€€€€€€¥˜€¡…MÑ½À€˜˜‰MÑ½À¤É•ÑÕÉ¸9Õµ‰•È¡…MÑ½À¹ÍÑ½Á9Õµ‰•Èñğ€À¤€´9Õµ‰•È¡‰MÑ½À¹ÍÑ½Á9Õµ‰•Èñğ€À¤ì(€€€€€€€¥˜€¡…MÑ½À¤É•ÑÕÉ¸€´Äì(€€€€€€€¥˜€¡‰MÑ½À¤É•ÑÕÉ¸€Äì(€€€€€€€É•ÑÕÉ¸MÑÉ¥¹œ¡„¹¹…µ”ñğ€ˆˆ¤¹±½…±•½µÁ…É”¡MÑÉ¥¹œ¡ˆ¹¹…µ”ñğ€ˆˆ¤¤ì(€€€€€ô¤ì(€€€½¹ÍĞ‘……MÑ½Á½Õ¹Ğ€ô¥Ù¥A±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôø•Ñ……MÑ½ÁÉ½µA±…”¡Á±…”¤¤¹±•¹Ñ ì(€€€É•ÑÕÉ¸€ (€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…‰Ìµ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µÁ…¹•°‘Àµ¥Ù¥ŒµÉ•…‘…‰±”µÁ…¹•°ˆø(€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍÑ…¬ˆø(€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÉ•…‘…‰±”µ¡•É¼ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù¥Ù¥Œğ½Àø(€€€€€€€€€€€€ñ ÈùAÕ‰±¥ŒÁ±…•Ì¥¸Ñ¡”µ…À¸ğ½ Èø(€€€€€€€€€€€€ñÀùÉĞ]…±¬°Á…É­Ì°Á±…é…Ì°ÑÉ…¥±¡•…‘Ì°…¹¥Ù¥ŒÍÑ½ÁÌİ¥Ñ ¹•…É‰ä½¹Ñ•áĞ¸ğ½Àø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÍÕµµ…ÉäµÉ¥ˆ…É¥„µ±…‰•°ô‰¥Ù¥ŒÍÕµµ…Éäˆø(€€€€€€€€€€€íl(€€€€€€€€€€€€€l‰ÉĞ]…±¬ˆ°€‘í‘……MÑ½Á½Õ¹Ğñğ}Q=UI}MQ=A}=U9QôÍÑ½ÁÍt°(€€€€€€€€€€€€€l‰AÕ‰±¥ŒÍÁ…•Ìˆ°€‰A…É­Ì°Á±…é…Ì°ÑÉ…¥±Ì‰t°(€€€€€€€€€€€€€l‰9•áĞˆ°€‰=Á•¸ÕÍ•™Õ°Á¥¹Ì‰t°(€€€€€€€€€€€t¹µ…À ¡m±…‰•°°Ù…±Õ•t¤€ôø€ (€€€€€€€€€€€€€€ñ…ÉÑ¥±”­•äõí±…‰•±ô±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•ÈµÍÕµµ…Éäµ…Éˆø(€€€€€€€€€€€€€€€€ñÍÁ…¸ùí±…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíÙ…±Õ•ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µ±¥ÍĞˆ…É¥„µ±…‰•°ô‰¥Ù¥Œ½ÁÁ½ÉÑÕ¹¥Ñäˆø(€€€€€€€€€€€íl(€€€€€€€€€€€€€l‰9•…É‰ä…Ñ¥Ù¥Ñäˆ°€‰AÕ‰±¥ŒÍÁ…•Ì…¹¡½Èİ…±­Ì…¹Á±…¹Ì¸ˆ°€‰=Á•¸‘•Ñ…¥±Ì‰t°(€€€€€€€€€€€€€l‰]¡ä¥Ğµ…ÑÑ•ÉÌˆ°€‰¥Ù¥Œµ½µ•¹ÑÌµ…­”É½ÕÑ•Ì•…Í¥•È¸ˆ°€‰Y¥•Ü…Ñ¥Ù¥Ñä‰t°(€€€€€€€€€€€€€l‰9•áĞˆ°€‰	Õ¥±½¹”É½ÕÑ”…É½Õ¹„ÁÕ‰±¥ŒÁ±…”¸ˆ°€‰=Á•¸Á¥¹Ì‰t°(€€€€€€€€€€€t¹µ…À ¡mÑ¥Ñ±”°½Áä°…Ñ¥½¹t¤€ôø€ (€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸­•äõíÑ¥Ñ±•ôÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Ü‘ÀµÁ…ÉÑ¹•Èµ™••µÉ½Üˆ½¹±¥¬õì ¤€ôø½Á•¹A…ÉÑ¹•ÉA…¹•° ‰É•Á½ÉÑÌˆ¥ôø(€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µµ…¥¸ˆø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÉ½Üµ¥½¸ˆøñ1…¹‘µ…É¬±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸øñÍÑÉ½¹œùíÑ¥Ñ±•ôğ½ÍÑÉ½¹œøñÍµ…±°ùí½Áåôğ½Íµ…±°øğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµÍ¥¹…°ˆùí…Ñ¥½¹ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€¤¥ô(€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµ…µÁ…¥¸µÁ…¹•°ˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÑ…ˆµ•å•‰É½Üˆù¥Ù¥ŒÁ¥¹Ìğ½Àø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ™••µ±¥ÍĞ‘Àµ¡½É¥é½¹Ñ…°µ•¹Ñ¥ÑäµÉ…¥°ˆ…É¥„µ±…‰•°ô‰¥Ù¥Œµ…À•¹Ñ¥Ñ¥•Ìˆø(€€€€€€€€€€€€€í¥Ù¥A±…•Ì¹µ…À ¡Á±…”¤€ôøÉ•¹‘•É½µÁ…Ñ¹Ñ¥ÑåI½Ü¡Á±…”°€‰=Á•¸ˆ¤¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€ğ½‘¥Øø(€€€€€€ğ½‘¥Øø(€€€€¤ì(€ô(€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€¡Í•±•Ñ•¤É•ÑÕÉ¸ì(€€€¥˜€ …Á±…•Ì¹±•¹Ñ €˜˜€…±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì¹±•¹Ñ ¤É•ÑÕÉ¸ì(€€€¥˜€¡Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”€˜˜É•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¹¥¤€ôôôÍ•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€ ½x¡É•ÁÕ‰±¥Œµ…ÕÍÑ¥¹ñ‘…„µÍÑ½Áñİ…Ñ•É±½½ñÁ…É­¥¹œ¤½¤¹Ñ•ÍĞ¡Í•±•Ñ•‘%¤¤É•ÑÕÉ¸ì(€€€¥˜€¡ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%€˜˜l‰¥‘±”ˆ°€‰±½…‘¥¹œ‰t¹¥¹±Õ‘•Ì¡Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ¤¤É•ÑÕÉ¸ì(€€€¥˜€ …É•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°Á±…•Ì¤€˜˜€…É•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡Í•±•Ñ•‘%°±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì¤¤ì(€€€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì•¹Ñ¥Ñå%è€ˆˆ°Á•É­%è€ˆˆô¤ì(€€€ô(€ô°m±ÕáÕÉåAÉ•Í•¹•1¥ÍÑ¥¹A±…•Ì°Á±…•Ì°Í½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÌ°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹É•ÍÕ±Ñ%‘Ì°Í•±•Ñ•°Í•±•Ñ•‘%°Í•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”°ÕÉ±MÑ…Ñ•t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …ÁÕ±Í¥¹A¥¹%¤É•ÑÕÉ¸Õ¹‘•™¥¹•ì(€€€½¹ÍĞÑ¥µ•½ÕÑ%€ôİ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøÍ•ÑAÕ±Í¥¹A¥¹% ˆˆ¤°€ÄÈÀÀ¤ì(€€€É•ÑÕÉ¸€ ¤€ôøİ¥¹‘½Ü¹±•…ÉQ¥µ•½ÕĞ¡Ñ¥µ•½ÕÑ%¤ì(€ô°mÁÕ±Í¥¹A¥¹%‘t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜5A}9Q%Y}AIQ9I}A91L¹¥¹±Õ‘•Ì¡ÕÉ±MÑ…Ñ”¹Ñ…ˆ¤¤ì(€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ¡ÕÉ±MÑ…Ñ”¹Ñ…ˆ¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€ …ÕÉ±MÑ…Ñ”¹Á…¹•±Q…ˆ¤Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€ô°m½¹Í½±•!…ÍÑ¥Ù•]½É¬°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹µ½‘”°ÕÉ±MÑ…Ñ”¹Á…¹•±Q…ˆ°ÕÉ±MÑ…Ñ”¹Ñ…‰t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€¡Í•±•Ñ•‘%ñğ±ÕÍÑ•ÉÉ…İ•Èñğ…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°ñğÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆñğÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰…µÁ…¥¹Ìˆ¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€ô(€ô°m…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°°±ÕÍÑ•ÉÉ…İ•È°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹Ñ…‰t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€½¹ÍĞ¥Í±•…¹5…ÁY¥•Ü€ô(€€€€€ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜(€€€€€…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…Àˆ€˜˜(€€€€€€…Í•±•Ñ•‘%€˜˜(€€€€€€…±ÕÍÑ•ÉÉ…İ•È€˜˜(€€€€€€……Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€˜˜(€€€€€…Ñ¥Ù•¥±Ñ•È€„ôô€‰1••¹‘Ìˆ€˜˜(€€€€€…Ñ¥Ù•¥±Ñ•È€„ôô€‰1¥ÍÑ¥¹Ìˆì(€€€¥˜€¡¥Í±•…¹5…ÁY¥•Ü¤Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€ô°m…Ñ¥Ù•	½ÑÑ½µQ…ˆ°…Ñ¥Ù•¥±Ñ•È°…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°°±ÕÍÑ•ÉÉ…İ•È°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ”¹Ñ…‰t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€™Õ¹Ñ¥½¸½¹-•å½İ¸¡•Ù•¹Ğ¤ì(€€€€€¥˜€¡•Ù•¹Ğ¹­•ä€ôôô€‰Í…Á”ˆ¤ì(€€€€€€€¥˜€ …½¹Í½±•½±±…ÁÍ•€˜˜€…Í•±•Ñ•‘%€˜˜€…±ÕÍÑ•ÉÉ…İ•È€˜˜€……‰½ÕÑ=Á•¸¤ì(€€€€€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€„ôô€‰É•Í¥‘•¹Ğˆ¤ì(€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€€€€€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøÍ•…É¡I½±±ÕÁI•˜¹ÕÉÉ•¹Ğü¹™½ÕÌü¸¡ìÁÉ•Ù•¹ÑMÉ½±°èÑÉÕ”ô¤°€À¤ì(€€€€€€€€€ô(€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€ô(€€€€€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€€€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€€€€€Í•Ñ‰½ÕÑ=Á•¸¡™…±Í”¤ì(€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì•¹Ñ¥Ñå%è€ˆˆô¤ì(€€€€€ô(€€€ô(€€€İ¥¹‘½Ü¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°½¹-•å½İ¸¤ì(€€€É•ÑÕÉ¸€ ¤€ôøİ¥¹‘½Ü¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°½¹-•å½İ¸¤ì(€ô°m…‰½ÕÑ=Á•¸°±ÕÍÑ•ÉÉ…İ•È°½¹Í½±•½±±…ÁÍ•°Í•±•Ñ•‘%°ÕÉ±MÑ…Ñ•t¤ì((€™Õ¹Ñ¥½¸Í•±•ÑA±…”¡Á±…”°Í•±•Ñ¥½¸€ôíô¤ì(€€€¥˜€ …Í•±•Ñ•‘%€˜˜ÑåÁ•½˜‘½Õµ•¹Ğ€„ôô€‰Õ¹‘•™¥¹•ˆ¤‘É…İ•ÉQÉ¥•ÉI•˜¹ÕÉÉ•¹Ğ€ô‘½Õµ•¹Ğ¹…Ñ¥Ù•±•µ•¹Ğì(€€€ÑÉ¥•É!…ÁÑ¥Œ ¤ì(€€€½¹ÍĞ…¹½¹¥…±M•±•Ñ•‘%€ôÉ•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡Á±…”¹¥¤ì(€€€½¹ÍĞ¥ÍI•¹Ñ…±M•±•Ñ¥½¸€ô¥ÍI•¹Ñ…±¹Ñ¥Ñä¡Á±…”¤ì(€€€½¹ÍĞ¥Í…Ñ…±½M•±•Ñ¥½¸€ô	½½±•…¸¡Í•±•Ñ¥½¸¹…Ñ…±½I•ÍÕ±Ğ¤ì(€€€½¹ÍĞ¥Í1¥ÍÑ¥¹M•±•Ñ¥½¸€ô€…¥Í…Ñ…±½M•±•Ñ¥½¸€˜˜¥ÍU¹¥Ñ1•Ù•±1¥ÍÑ¥¹A±…”¡Á±…”¤ì(€€€½¹ÍĞ¥ÍAÉ½Á•ÉÑåM•±•Ñ¥½¸€ô¥Í1¥ÍÑ¥¹M•±•Ñ¥½¸ñğ	½½±•…¸¡•Ñ1ÕáÕÉåAÉ•Í•¹•	Õ¥±‘¥¹œ¡Á±…”¤¤ñğ¥ÍAÉ½Á•ÉÑå¹Ñ¥Ñä¡Á±…”¤ì(€€€½¹ÍĞÁÕ‰±¥AÉ½Á•ÉÑå%€ô¥Í…Ñ…±½M•±•Ñ¥½¸€üÁ±…”¹¥€è¥ÍAÉ½Á•ÉÑåM•±•Ñ¥½¸€üÉ•Í½±Ù•AÉ½Á•ÉÑåUÉ±¹Ñ¥Ñå%¡Á±…”¹¥¤€è€ˆˆì(€€€½¹ÍĞÁÕ‰±¥1¥ÍÑ¥¹%€ô¥Í1¥ÍÑ¥¹M•±•Ñ¥½¸€üÉ•Í½±Ù•AÉ½Á•ÉÑå1¥ÍÑ¥¹UÉ±%¡Á±…”¹¥¤€è€ˆˆì(€€€½¹ÍĞ¹•áÑ¹Ñ¥Ñå%€ô…¹½¹¥…±M•±•Ñ•‘%ì(€€€½¹ÍĞ¹•áÑA•É­%€ôÍ•±•Ñ¥½¸¹Á•É­%ñğ€ˆˆì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€Í•ÑM•…É  ˆˆ¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡™…±Í”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡™…±Í”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•ÑAÕ±Í¥¹A¥¹%¡¹•áÑ¹Ñ¥Ñå%¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡Á±…”¤ì(€€€Í•ÑM•±•Ñ•‘%¡¹•áÑ¹Ñ¥Ñå%¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Í•±•Ñ}Á¥¸ˆ°ì(€€€€€•¹Ñ¥Ñå%è¹•áÑ¹Ñ¥Ñå%°(€€€€€¹…µ”èÁ±…”¹¹…µ”°(€€€€€…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•È°(€€€ô¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ” (€€€€€¥ÍI•¹Ñ…±M•±•Ñ¥½¸(€€€€€€€€üì±…å•Èè€‰É•¹Ñ…±Ìˆ°™¥±Ñ•Èè€‰I•¹Ñ…±Ìˆ°±¥ÍÑ¥¹œèÁ±…”¹¥°•¹Ñ¥Ñå%èÁ±…”¹¥°±¥ÍÑ¥¹%è€ˆˆ°Á•É­%è€ˆˆô(€€€€€€€€èìÑ…ˆè€‰µ…Àˆ°•¹Ñ¥Ñå%è¥ÍAÉ½Á•ÉÑåM•±•Ñ¥½¸€üÁÕ‰±¥AÉ½Á•ÉÑå%ñğÁ±…”¹¥€èÁ±…”¹¥°±¥ÍÑ¥¹%èÁÕ‰±¥1¥ÍÑ¥¹%ñğ€ˆˆ°Á•É­%è¹•áÑA•É­%ô°(€€€€¤ì(€€€½¹ÍĞÉ…Ü€ôÁ±…”¹É…Üñğíôì(€€€½¹ÍĞÑÉ…­¥¹½¹Ñ•áĞ€ôì(€€€€€Á¥¹%èÁ±…”¹¥°(€€€€€Í½ÕÉ”èÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹Í½ÕÉ”ñğ€‰‘¥É•ĞµÍ•…É ˆ°(€€€€€Ñ•¹…¹Ñ%èÁ±…”¹Ñ•¹…¹Ñ}¥ñğÉ…Ü¹Ñ•¹…¹Ñ}¥ñğ¹Õ±°°(€€€€€İ½É­ÍÁ…•%èÁ±…”¹İ½É­ÍÁ…•}¥ñğÉ…Ü¹İ½É­ÍÁ…•}¥ñğ¹Õ±°°(€€€€€Á…ÉÑ¹•É%èÁ±…”¹Á…ÉÑ¹•É}¥ñğÉ…Ü¹Á…ÉÑ¹•É}¥ñğ¹Õ±°°(€€€€€ÁÉ½Á•ÉÑå%èÁ±…”¹ÁÉ½Á•ÉÑå}¥ñğÉ…Ü¹ÁÉ½Á•ÉÑå}¥ñğ¹Õ±°°(€€€€€‰Õ¥±‘¥¹%èÁ±…”¹‰Õ¥±‘¥¹}¥ñğÉ…Ü¹‰Õ¥±‘¥¹}¥ñğ¹Õ±°°(€€€€€…µÁ…¥¸èÁ±…”¹…µÁ…¥¹}¥ñğÉ…Ü¹…µÁ…¥¹}¥ñğÕ¹‘•™¥¹•°(€€€€€Á•É­%èÁ±…”¹Á•É­}¥ñğÉ…Ü¹Á•É­}¥ñğ¹Õ±°°(€€€€€•Ù•¹Ñ%èÁ±…”¹•Ù•¹Ñ}¥ñğÉ…Ü¹•Ù•¹Ñ}¥ñğ¹Õ±°°(€€€€€ÅÕ•Éå%èÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹ÅÕ•Éå%ñğÕ¹‘•™¥¹•°(€€€€€Í•…É¡EÕ•Éäè•™™•Ñ¥Ù•M•…É ñğÕ¹‘•™¥¹•°(€€€€€¥¹Ñ•ÉÁÉ•Ñ•‘%¹Ñ•¹ĞèÍ½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹¥¹Ñ•¹ĞñğÕ¹‘•™¥¹•°(€€€€€É•ÍÕ±ÑI…¹¬è5…Ñ ¹µ…à À°Í½Á•‘I•ÍÕ±ÑMÑ…Ñ”¹É•ÍÕ±Ñ%‘Ì¹¥¹‘•á=˜¡Á±…”¹¥¤¤°(€€€ôì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹µ…É­•É±¥¬¡¹•áÑ¹Ñ¥Ñå%°İ½É­™±½İ¹Ñ¥ÑåQåÁ”¡Á±…”¤°ÑÉ…­¥¹½¹Ñ•áĞ¤ì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹‘É…İ•É=Á•¸¡¹•áÑ¹Ñ¥Ñå%°ì€¸¸¹ÑÉ…­¥¹½¹Ñ•áĞ°•¹Ñ¥ÑåQåÁ”èİ½É­™±½İ¹Ñ¥ÑåQåÁ”¡Á±…”¤ô¤ì(€ô((€™Õ¹Ñ¥½¸Í•±•Ñ…Ñ…±½I•ÍÕ±Ğ¡É•ÍÕ±Ğ¤ì(€€€¥˜€¡É•ÍÕ±Ğ¹É½ÕÑ”¤ì(€€€€€¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ¡É•ÍÕ±Ğ¹É½ÕÑ”°É•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤¤¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡É•ÍÕ±Ğ¹¥€ôôô‘Õ¹±…ÁA½ÉÑ™½±¥½!Õˆ¹¥¤ì(€€€€€½¹ÍĞÁ…É…µÌ€ô¹•ÜUI1M•…É¡A…É…µÌ¡±½…Ñ¥½¸¹Í•…É ¤ì(€€€€€Á…É…µÌ¹Í•Ğ ‰Ñ…ˆˆ°€‰µ…Àˆ¤ì(€€€€€Á…É…µÌ¹Í•Ğ ‰•¹Ñ¥Ñå%ˆ°‘Õ¹±…ÁA½ÉÑ™½±¥½!Õˆ¹¥¤ì(€€€€€¹…Ù¥…Ñ”¡€‘í±½…Ñ¥½¸¹Á…Ñ¡¹…µ•ôü‘íÁ…É…µÌ¹Ñ½MÑÉ¥¹œ ¥õ€¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€½¹ÍĞÑ…É•Ñ¹Ñ¥Ñå%€ôÉ•ÍÕ±Ğ¹•¹Ñ¥Ñå%ñğÉ•ÍÕ±Ğ¹±¥¹­•‘¹Ñ¥Ñå%ñğÉ•ÍÕ±Ğ¹¥ì(€€€¥˜€¡Ñ…É•Ñ¹Ñ¥Ñå%€˜˜€¡É•ÍÕ±Ğ¹µ…É­•É±¥¥‰±”ñğÉ•ÍÕ±Ğ¹±¥¹­•‘¹Ñ¥Ñå%¤¤ì(€€€€€½¹ÍĞ…¹½¹¥…±Q…É•Ñ%€ôÉ•Í½±Ù•5…Á¹Ñ¥Ñå±¥…Ì¡Ñ…É•Ñ¹Ñ¥Ñå%¤ì(€€€€€½¹ÍĞ…Ñ…±½¹Ñ¥Ñä€ô…Ñ…±½MÑ…Ñ”ü¹•¹Ñ¥Ñ¥•Í	å%ü¹mÉ•ÍÕ±Ğ¹¥‘tñğÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡…¹½¹¥…±Q…É•Ñ%°Á±…•Ì¤ì(€€€€€¥˜€¡…Ñ…±½¹Ñ¥Ñä¤ì(€€€€€€€½¹ÍĞÁ•É­%€ôÉ•ÍÕ±Ğ¹É•ÍÕ±ÑQåÁ”€ôôô€‰Á•É¬ˆñğ¡…ÍÑ¥Ù•A•É­…Ñ„¡…Ñ…±½¹Ñ¥Ñä¤(€€€€€€€€€€ü•Ñ…¹½¹¥…±I•Í¥‘•¹ÑA•É­%¡…Ñ…±½¹Ñ¥Ñä¤(€€€€€€€€€€è€ˆˆì(€€€€€€€Í•±•ÑA±…”¡…Ñ…±½¹Ñ¥Ñä°ì…Ñ…±½I•ÍÕ±ĞèÑÉÕ”°Á•É­%ô¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¹…Ù¥…Ñ•5…Á)½ÕÉ¹•ä¡ì(€€€€€€€Ñ…ˆè€‰µ…Àˆ°(€€€€€€€•¹Ñ¥Ñå%è…¹½¹¥…±Q…É•Ñ%°(€€€€€€€±¥ÍÑ¥¹%è€ˆˆ°(€€€€€€€Á•É­%èÉ•ÍÕ±Ğ¹É•ÍÕ±ÑQåÁ”€ôôô€‰Á•É¬ˆ€üÉ•ÍÕ±Ğ¹Á•É­%ñğÉ•ÍÕ±Ğ¹¥€è€ˆˆ°(€€€€€€€‘É…İ•É±½Í•è€ˆˆ°(€€€€€ô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Ù½¥…ÁÁ±åAÉ½µÁĞ¡É•ÍÕ±Ğ¹É•ÍÕ±ÑQåÁ”€ôôô€‰Á•ÉÍ½¸ˆñğÉ•ÍÕ±Ğ¹É•ÍÕ±ÑQåÁ”€ôôô€‰½É…¹¥é…Ñ¥½¸ˆ€ü€‰1••¹‘Ì±¥ÍÑ¥¹Ìˆ€èÉ•ÍÕ±Ğ¹Ñ¥Ñ±”¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹Ñ¥Ù•A•É­%Ñ•´¡¥Ñ•´°•Ù•¹Ğ¤ì(€€€½¹ÍĞ±¥ÍĞ€ô•Ù•¹Ğü¹ÕÉÉ•¹ÑQ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµ…Ñ¥Ù”µÁ•É­ÌµÍ¡••Ğˆ¤ü¹ÅÕ•ÉåM•±•Ñ½Èü¸ ‰m‘…Ñ„µ…Ñ¥Ù”µÁ•É­ÌµÍÉ½±°ôÑÉÕ”tˆ¤ì(€€€ÁÕÍ¡A…¹•±MÑ…Ñ”¡ì(€€€€€ÕÉ°è€‘í±½…Ñ¥½¸¹Á…Ñ¡¹…µ•ô‘í±½…Ñ¥½¸¹Í•…É¡õ€°(€€€€€‘É…İ•ÉMÑ…Ñ”è…Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ”°(€€€€€ÍÉ½±±Q½Àè±¥ÍĞü¹ÍÉ½±±Q½Àñğ€À°(€€€€€™½ÕÍ%è•Ù•¹Ğü¹ÕÉÉ•¹ÑQ…É•Ğü¹¥ñğ€ˆˆ°(€€€ô¤ì(€€€Í•±•ÑA±…”¡¥Ñ•´¹Á±…”°ìÁ•É­%è¥Ñ•´¹Á•É­%ô¤ì(€ô((€™Õ¹Ñ¥½¸±½Í•Ñ¥Ù•A•É­ÍM¡••Ğ ¤ì(€€€±•…ÉA…¹•±MÑ…¬ ¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡…Ñ¥Ù•¥±Ñ•Èñğ€‰A•É­Ìˆ¥õ€°ìÉ•Á±…”èÑÉÕ”ô¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹Ñ¥Ù•A•É­%Ñ•´¡¥Ñ•´°•Ù•¹Ğ¤ì(€€€½¹ÍĞ±¥ÍĞ€ô•Ù•¹Ğü¹ÕÉÉ•¹ÑQ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµ…Ñ¥Ù”µÁ•É­ÌµÍ¡••Ğˆ¤ü¹ÅÕ•ÉåM•±•Ñ½Èü¸ ‰m‘…Ñ„µ…Ñ¥Ù”µÁ•É­ÌµÍÉ½±°ôÑÉÕ”tˆ¤ì(€€€ÁÕÍ¡A…¹•±MÑ…Ñ”¡ì(€€€€€ÕÉ°è€‘í±½…Ñ¥½¸¹Á…Ñ¡¹…µ•ô‘í±½…Ñ¥½¸¹Í•…É¡õ€°(€€€€€‘É…İ•ÉMÑ…Ñ”è…Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ”°(€€€€€ÍÉ½±±Q½Àè±¥ÍĞü¹ÍÉ½±±Q½Àñğ€À°(€€€€€™½ÕÍ%è•Ù•¹Ğü¹ÕÉÉ•¹ÑQ…É•Ğü¹¥ñğ€ˆˆ°(€€€ô¤ì(€€€Í•±•ÑA±…”¡¥Ñ•´¹Á±…”°ìÁ•É­%è¥Ñ•´¹Á•É­%ô¤ì(€ô((€™Õ¹Ñ¥½¸±½Í•Ñ¥Ù•A•É­ÍM¡••Ğ ¤ì(€€€±•…ÉA…¹•±MÑ…¬ ¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡…Ñ¥Ù•¥±Ñ•Èñğ€‰A•É­Ìˆ¥õ€°ìÉ•Á±…”èÑÉÕ”ô¤ì(€ô((€ÕÍ•™™•Ğ  ¤€ôøì(€€€İ¥¹‘½Ü¹}}‘Á=Á•¹5…ÁA¥¸€ô€¡•¹Ñ¥Ñå%¤€ôøì(€€€€€½¹ÍĞÁ±…”€ôÁ±…•Ì¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹¥€ôôô•¹Ñ¥Ñå%¤ì(€€€€€¥˜€¡Á±…”¤Í•±•ÑA±…”¡Á±…”¤ì(€€€ôì((€€€½¹ÍĞ¡…¹‘±•A¥¹=Á•¸€ô€¡•Ù•¹Ğ¤€ôøì(€€€€€¥˜€¡•Ù•¹Ğ¹Ñ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµµ…Àµ‘É…İ•ÈµÍ¡•±°°€¹‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ‘É…İ•È°€¹‘ÀµÁ…¹•°µÍ¡•±°ˆ¤¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞÁ¥¸€ô•Ù•¹Ğ¹Ñ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµµ…ÀµÁ¥¹m‘…Ñ„µ•¹Ñ¥Ñäµ¥‘t°€¹‘Àµ±¥Ù”µÁ¥¹m‘…Ñ„µ•¹Ñ¥Ñäµ¥‘tˆ¤ì(€€€€€¥˜€ …Á¥¸¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞ•¹Ñ¥Ñå%€ôÁ¥¸¹•ÑÑÑÉ¥‰ÕÑ” ‰‘…Ñ„µ•¹Ñ¥Ñäµ¥ˆ¤ì(€€€€€½¹ÍĞÁ±…”€ôÁ±…•Ì¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹¥€ôôô•¹Ñ¥Ñå%¤ì(€€€€€¥˜€ …Á±…”¤É•ÑÕÉ¸ì(€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€•Ù•¹Ğ¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¤ì(€€€€€Í•±•ÑA±…”¡Á±…”¤ì(€€€ôì((€€€½¹ÍĞ¡…¹‘±•1•…™±•Ñ5…É­•É=Á•¸€ô€¡•Ù•¹Ğ¤€ôøì(€€€€€¥˜€¡•Ù•¹Ğ¹Ñ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµµ…Àµ‘É…İ•ÈµÍ¡•±°°€¹‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ‘É…İ•È°€¹‘ÀµÁ…¹•°µÍ¡•±°ˆ¤¤É•ÑÕÉ¸ì(€€€€€¥˜€¡•Ù•¹Ğ¹Ñ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµµ…ÀµÁ¥¹m‘…Ñ„µ•¹Ñ¥Ñäµ¥‘t°€¹‘Àµ±¥Ù”µÁ¥¹m‘…Ñ„µ•¹Ñ¥Ñäµ¥‘t°€¹‘Àµ±•…™±•Ğµ±ÕÍÑ•Èˆ¤¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞµ…É­•È€ô•Ù•¹Ğ¹Ñ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹±•…™±•Ğµµ…É­•Èµ¥½¸¹‘Àµ±•…™±•ĞµÁ¥¹mÑ¥Ñ±•tˆ¤ì(€€€€€¥˜€ …µ…É­•È¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞÑ¥Ñ±”€ôµ…É­•È¹•ÑÑÑÉ¥‰ÕÑ” ‰Ñ¥Ñ±”ˆ¤ì(€€€€€½¹ÍĞÁ±…”€ôÁ±…•Ì¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹¹…µ”€ôôôÑ¥Ñ±”ñğ¥Ñ•´¹Ñ¥Ñ±”€ôôôÑ¥Ñ±”¤ì(€€€€€¥˜€ …Á±…”¤É•ÑÕÉ¸ì(€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€•Ù•¹Ğ¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¤ì(€€€€€Í•±•ÑA±…”¡Á±…”¤ì(€€€ôì((€€€½¹ÍĞ¡…¹‘±•A¥¹-•å½İ¸€ô€¡•Ù•¹Ğ¤€ôøì(€€€€€¥˜€¡•Ù•¹Ğ¹­•ä€„ôô€‰¹Ñ•Èˆ€˜˜•Ù•¹Ğ¹­•ä€„ôô€ˆ€ˆ¤É•ÑÕÉ¸ì(€€€€€¡…¹‘±•A¥¹=Á•¸¡•Ù•¹Ğ¤ì(€€€€€¡…¹‘±•1•…™±•Ñ5…É­•É=Á•¸¡•Ù•¹Ğ¤ì(€€€ôì((€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•A¥¹=Á•¸°ÑÉÕ”¤ì(€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•1•…™±•Ñ5…É­•É=Á•¸°ÑÉÕ”¤ì(€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°¡…¹‘±•A¥¹-•å½İ¸°ÑÉÕ”¤ì(€€€É•ÑÕÉ¸€ ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•A¥¹=Á•¸°ÑÉÕ”¤ì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•1•…™±•Ñ5…É­•É=Á•¸°ÑÉÕ”¤ì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°¡…¹‘±•A¥¹-•å½İ¸°ÑÉÕ”¤ì(€€€€€¥˜€¡İ¥¹‘½Ü¹}}‘Á=Á•¹5…ÁA¥¸¤‘•±•Ñ”İ¥¹‘½Ü¹}}‘Á=Á•¹5…ÁA¥¸ì(€€€ôì(€ô°mÁ±…•Ì°ÕÉ±MÑ…Ñ•t¤ì((€™Õ¹Ñ¥½¸Í•±•Ñ9•…É•ÍÑ1••¹‘Í1¥ÍÑ¥¹œ¡Á±…”¤ì(€€€¥˜€ …¥Í1••¹‘Í5…ÁA±…”¡Á±…”¤¤ì(€€€€€Í•±•ÑA±…”¡Á±…”¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€½¹ÍĞ¹•…É•ÍĞ€ôÙ¥Í¥‰±•1••¹‘ÍA±…•Ì(€€€€€€¹™¥±Ñ•È ¡…¹‘¥‘…Ñ”¤€ôø…¹‘¥‘…Ñ”¹¥€„ôôÁ±…”¹¥¤(€€€€€€¹µ…À ¡…¹‘¥‘…Ñ”¤€ôø€¡ì…¹‘¥‘…Ñ”°Í½É”è•Ñ5…Á¥ÍÑ…¹•M½É”¡Á±…”°…¹‘¥‘…Ñ”¤ô¤¤(€€€€€€¹Í½ÉĞ ¡„°ˆ¤€ôø„¹Í½É”€´ˆ¹Í½É”¥lÁtü¹…¹‘¥‘…Ñ”ì((€€€Í•±•ÑA±…”¡¹•…É•ÍĞñğÁ±…”¤ì(€ô((€™Õ¹Ñ¥½¸‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡™¥±Ñ•È°½ÁÑ¥½¹Ì€ôíô¤ì(€€€½¹ÍĞ…¹½¹¥…±¥±Ñ•È€ô•Ñ…¹½¹¥…±M•…É¡%¹Ñ•¹Ñ¥±Ñ•È¡™¥±Ñ•È¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô%1QIL¹¥¹±Õ‘•Ì¡…¹½¹¥…±¥±Ñ•È¤€ü…¹½¹¥…±¥±Ñ•È€è€‰±°ˆì(€€€½¹ÍĞ¹•áÑEÕ•Éä€ô½ÁÑ¥½¹Ì¹ÅÕ•Éäñğ€ˆˆì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•Ñ9•¥¡‰½É¡½½‘Í=Á•¸¡™…±Í”¤ì(€€€Í•Ñ%¹Ñ•±=Á•¸¡™…±Í”¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•ÑM•…É ¡½ÁÑ¥½¹Ì¹‘¥ÍÁ±…åEÕ•Éä€üü¹•áÑEÕ•Éä¤ì(€€€Í•ÑÑ¥Ù•¥±Ñ•È¡¹•áÑ¥±Ñ•È¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡™…±Í”¤ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•ÑI•Í¥‘•¹ÑEÉ5½‘…°¡¹Õ±°¤ì(€€€Í•ÑAÕ±Í¥¹A¥¹% ˆˆ¤ì(€€€Í•ÑI•ÍÕ±ÑÍáÁ…¹‘•¡™…±Í”¤ì(€€€Í•ÑM•…É¡É•…¥ÉÑä¡™…±Í”¤ì(€€€Í•ÑUÍ•É!…Í9…Ù¥…Ñ•‘5…À¡™…±Í”¤ì(€€€±•…ÉM½Á•‘5…ÁI•ÍÕ±ÑÌ ¤ì(€€€ÑÉäì(€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹É•µ½Ù•%Ñ•´¡5A}Y%]}MQ=I}-d¤ì(€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹É•µ½Ù•%Ñ•´¡5A}UMI}9Y%Q}MQ=I}-d¤ì(€€€ô…Ñ ì(€€€€€€¼¼5…ÀÙ¥•ÜÉ•Í•Ğ¥Ì‰•ÍĞµ•™™½ÉĞìÍÑ…Ñ”É•Í•Ğ…‰½Ù”ÍÑ¥±°•¹™½É•Ì¥¹Ñ•¹Ğ•á±ÕÍ¥Ù¥Ñä¸(€€€ô(€€€½¹ÍĞ±•…É•‘I½ÕÑ•MÑ…Ñ”€ôì½±±•Ñ¥½¸è€ˆˆ°É½ÕÑ•%è€ˆˆ°É½ÕÑ•MÑ…Ñ”è€ˆˆ°ÍÑ½Á%è€ˆˆôì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì(€€€€€€¸¸¹±•…É•‘I½ÕÑ•MÑ…Ñ”°(€€€€€Ñ…ˆè€‰µ…Àˆ°(€€€€€™¥±Ñ•Èè¹•áÑ¥±Ñ•È°(€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€Äè€ˆˆ°(€€€€€ÁÉ½µÁĞè€ˆˆ°(€€€€€¥¹Ñ•¹Ğè½ÁÑ¥½¹Ì¹¥¹Ñ•¹Ğñğ€ˆˆ°(€€€€€Ñ¥µ”è½ÁÑ¥½¹Ì¹Ñ¥µ”ñğ€ˆˆ°(€€€€€½±±•Ñ¥½¸è½ÁÑ¥½¹Ì¹½±±•Ñ¥½¸ñğ±•…É•‘I½ÕÑ•MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€½±±•Ñ¥½¹%è€ˆˆ°(€€€€€É½ÕÑ•%è½ÁÑ¥½¹Ì¹É½ÕÑ•%ñğ½ÁÑ¥½¹Ì¹½±±•Ñ¥½¸ñğ±•…É•‘I½ÕÑ•MÑ…Ñ”¹É½ÕÑ•%°(€€€€€É½ÕÑ•MÑ…Ñ”è½ÁÑ¥½¹Ì¹É½ÕÑ•MÑ…Ñ”ñğ±•…É•‘I½ÕÑ•MÑ…Ñ”¹É½ÕÑ•MÑ…Ñ”°(€€€€€ÍÑ½Á%è½ÁÑ¥½¹Ì¹ÍÑ½Á%ñğ±•…É•‘I½ÕÑ•MÑ…Ñ”¹ÍÑ½Á%°(€€€€€±…å•Èè½ÁÑ¥½¹Ì¹±…å•Èñğ€ˆˆ°(€€€€€‘¥ÍÑÉ¥Ğè½ÁÑ¥½¹Ì¹‘¥ÍÑÉ¥Ğñğ€ˆˆ°(€€€€€É…‘¥ÕÌè½ÁÑ¥½¹Ì¹É…‘¥ÕÌñğ€ˆˆ°(€€€€€•¹Ñ¥ÑåQåÁ”è½ÁÑ¥½¹Ì¹•¹Ñ¥ÑåQåÁ”ñğ€ˆˆ°(€€€€€•¹Ñ¥Ñå%è€ˆˆ°(€€€€€Á•É­%è€ˆˆ°(€€€€€•Ù•¹Ñ%è€ˆˆ°(€€€€€±¥ÍÑ¥¹%è€ˆˆ°(€€€€€±¥ÍÑ¥¹œè€ˆˆ°(€€€€€…µÁ…¥¹%è€ˆˆ°(€€€€€‘É…İ•É±½Í•è€ˆˆ°(€€€ô¤ì(€€€É•ÑÕÉ¸¹•áÑ¥±Ñ•Èì(€ô((€™Õ¹Ñ¥½¸Í•Ñ¥±Ñ•È¡™¥±Ñ•È¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡™¥±Ñ•È°ì(€€€€€±…å•Èè™¥±Ñ•È€ôôô€‰I•¹Ñ…±Ìˆ€ü€‰É•¹Ñ…±Ìˆ€è€ˆˆ°(€€€ô¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰™¥±Ñ•Èˆ°ì™¥±Ñ•Èè¹•áÑ¥±Ñ•Èô¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹½±±•Ñ¥½¹I½ÕÑ”¡½±±•Ñ¥½¹%°‘¥ÍÁ±…åEÕ•Éä€ô€ˆˆ¤ì(€€€½¹ÍĞ½±±•Ñ¥½¸€ô•Ñ5…Á½±±•Ñ¥½¹	å%¡½±±•Ñ¥½¹%¤ì(€€€¥˜€ …½±±•Ñ¥½¸¤É•ÑÕÉ¸ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô•Ñ½±±•Ñ¥½¹¥±Ñ•È¡½±±•Ñ¥½¸¹¥¤ñğ…Ñ¥Ù•¥±Ñ•Èñğ€‰±°ˆì(€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ì(€€€€€ÅÕ•Éäè‘¥ÍÁ±…åEÕ•Éäñğ½±±•Ñ¥½¸¹Ñ¥Ñ±”°(€€€€€½±±•Ñ¥½¸è½±±•Ñ¥½¸¹¥°(€€€€€É½ÕÑ•%è½±±•Ñ¥½¸¹¥°(€€€€€¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°‘¥ÍÁ±…åEÕ•Éäñğ½±±•Ñ¥½¸¹Ñ¥Ñ±”¤°(€€€ô¤ì(€€€¥˜€¡‘¥ÍÁ±…åEÕ•Éä¤Í•ÑM•…É ¡‘¥ÍÁ±…åEÕ•Éä¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰É½ÕÑ•}½Á•¹•ˆ°ì(€€€€€½±±•Ñ¥½¸è½±±•Ñ¥½¸¹¥°(€€€€€Ñ¥Ñ±”è½±±•Ñ¥½¸¹Ñ¥Ñ±”°(€€€€€ÍÑ½Á½Õ¹Ğè½±±•Ñ¥½¸¹ÍÑ½Á%‘Ìü¹±•¹Ñ ñğ€À°(€€€ô¤ì(€ô((€™Õ¹Ñ¥½¸•á¥Ñ½±±•Ñ¥½¹I½ÕÑ” ¤ì(€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡…Ñ¥Ù•¥±Ñ•Èñğ€‰±°ˆ¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì½±±•Ñ¥½¸è€ˆˆ°É½ÕÑ•%è€ˆˆ°É½ÕÑ”è€ˆˆ°É½ÕÑ•MÑ…Ñ”è€ˆˆ°ÍÑ½Àè€ˆˆ°ÍÑ½Á%è€ˆˆ°•¹Ñ¥Ñå%è€ˆˆ°‘É…İ•É±½Í•è€ˆˆô¤ì(€ô((€™Õ¹Ñ¥½¸™½ÕÍ½±±•Ñ¥½¹MÑ½À¡ÍÑ½À¤ì(€€€¥˜€ …ÍÑ½À¤É•ÑÕÉ¸ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰É½ÕÑ•}ÍÑ½Á}Í•±•Ñ•ˆ°ì(€€€€€•¹Ñ¥Ñå%èÍÑ½À¹¥°(€€€€€¹…µ”èÍÑ½À¹¹…µ”°(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€É½ÕÑ•MÑ½Á9Õµ‰•ÈèÍÑ½À¹É½ÕÑ•MÑ½Á9Õµ‰•È°(€€€ô¤ì(€€€Í•ÑM•±•Ñ•‘%¡ÍÑ½À¹¥¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡ÍÑ½À¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°É½ÕÑ•%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÍÑ½Àè€ˆˆ°ÍÑ½Á%èÍÑ½À¹¥°•¹Ñ¥Ñå%èÍÑ½À¹¥°‘É…İ•É±½Í•è€‰ÑÉÕ”ˆô¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹½±±•Ñ¥½¹MÑ½À¡ÍÑ½À¤ì(€€€¥˜€ …ÍÑ½À¤É•ÑÕÉ¸ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰É½ÕÑ•}ÍÑ½Á}Í•±•Ñ•ˆ°ì•¹Ñ¥Ñå%èÍÑ½À¹¥°½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°É½ÕÑ•MÑ½Á9Õµ‰•ÈèÍÑ½À¹É½ÕÑ•MÑ½Á9Õµ‰•È°½Á•¹•èÑÉÕ”ô¤ì(€€€Í•±•ÑA±…”¡ÍÑ½À¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°É½ÕÑ•%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÍÑ½Àè€ˆˆ°ÍÑ½Á%èÍÑ½À¹¥°•¹Ñ¥Ñå%èÍÑ½À¹¥°‘É…İ•É±½Í•è€ˆˆô¤ì(€ô((€™Õ¹Ñ¥½¸ÍÑ…ÉÑ½±±•Ñ¥½¹I½ÕÑ”¡ÍÑ½À¤ì(€€€¥˜€ …ÍÑ½À¤É•ÑÕÉ¸ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸¡ÕÉ±MÑ…Ñ”¹É½ÕÑ•MÑ…Ñ”€ôôô€‰…Ñ¥Ù”ˆ€ü€‰É½ÕÑ•}½¹Ñ¥¹Õ•ˆ€è€‰É½ÕÑ•}ÍÑ…ÉÑ•ˆ°ì(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€•¹Ñ¥Ñå%èÍÑ½À¹¥°(€€€€€É½ÕÑ•MÑ½Á9Õµ‰•ÈèÍÑ½À¹É½ÕÑ•MÑ½Á9Õµ‰•È°(€€€ô¤ì(€€€Í•ÑM•±•Ñ•‘%¡ÍÑ½À¹¥¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡ÍÑ½À¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€É½ÕÑ•%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€É½ÕÑ•MÑ…Ñ”è€‰…Ñ¥Ù”ˆ°(€€€€€ÍÑ½Àè€ˆˆ°(€€€€€ÍÑ½Á%èÍÑ½À¹¥°(€€€€€•¹Ñ¥Ñå%èÍÑ½À¹¥°(€€€€€‘É…İ•É±½Í•è€‰ÑÉÕ”ˆ°(€€€ô¤ì(€ô((€™Õ¹Ñ¥½¸Í•Ñ9•¥¡‰½É¡½½¡¹•¥¡‰½É¡½½¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥ÍÑÉ¥Ğ¡¹•¥¡‰½É¡½½¤ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì‘¥ÍÑÉ¥Ğè¥Í±±9•¥¡‰½É¡½½‘M½Á”¡¹•¥¡‰½É¡½½¤€ü€ˆˆ€è¹•¥¡‰½É¡½½°•¹Ñ¥Ñå%è€ˆˆô¤ì(€ô((€™Õ¹Ñ¥½¸Í•ÑM•…É¡…•Ğ¡­•ä°Ù…±Õ”¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ìm­•åtèÙ…±Õ”°•¹Ñ¥Ñå%è€ˆˆô¤ì(€ô((€™Õ¹Ñ¥½¸±•…ÉM•…É¡¥±Ñ•ÉÌ ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•ÑM•…É  ˆˆ¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•ÑÑ¥Ù•¥±Ñ•È ‰±°ˆ¤ì(€€€Í•Ñ¥ÍÑÉ¥Ğ¡11}9%!	=I!==L¤ì(€€€Í•ÑI…‘¥ÕÌ ˆÔµ¥¸İ…±¬ˆ¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì(€€€€€Ñ…ˆèÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆ€ü€‰Á…ÍÌˆ€è€‰µ…Àˆ°(€€€€€™¥±Ñ•Èè€‰±°ˆ°(€€€€€ÅÕ•Éäè€ˆˆ°(€€€€€Äè€ˆˆ°(€€€€€ÁÉ½µÁĞè€ˆˆ°(€€€€€‘¥ÍÑÉ¥Ğè€ˆˆ°(€€€€€É…‘¥ÕÌè€ˆˆ°(€€€€€Ñ¥µ”è€ˆˆ°(€€€€€¥¹Ñ•¹Ğè€ˆˆ°(€€€€€•¹Ñ¥ÑåQåÁ”è€ˆˆ°(€€€€€½±±•Ñ¥½¸è€ˆˆ°(€€€€€±…å•Èè€ˆˆ°(€€€€€•¹Ñ¥Ñå%è€ˆˆ°(€€€€€±¥ÍÑ¥¹%è€ˆˆ°(€€€ô¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹±ÕÍÑ•ÉÉ…İ•È¡±ÕÍÑ•È¤ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡±ÕÍÑ•È¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ• …½¹Í½±•!…ÍÑ¥Ù•]½É¬¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì•¹Ñ¥Ñå%è€ˆˆô¤ì(€ô((€™Õ¹Ñ¥½¸Ñ½±•M…Ù•¡Á±…”¤ì(€€€½¹ÍĞ¹•áÑM…Ù•€ô€…Í…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤ì(€€€½¹ÍĞ…Ñ¥½¸€ô¹•áÑM…Ù•€ü€‰Í…Ù”ˆ€è€‰Õ¹Í…Ù”ˆì(€€€Ù½¥Ñ½±•M…Ù•‘¹Ñ¥Ñä¡ì(€€€€€•¹Ñ¥ÑåQåÁ”èİ½É­™±½İ¹Ñ¥ÑåQåÁ”¡Á±…”¤°(€€€€€•¹Ñ¥Ñå%èÁ±…”¹¥°(€€€€€Í…Ù•‘Ğè¹•Ü…Ñ” ¤¹Ñ½%M=MÑÉ¥¹œ ¤°(€€€€€Ñ¥Ñ±”èÁ±…”¹¹…µ”°(€€€€€¥µ…•UÉ°èÁ±…”¹¥µ…”°(€€€€€µ•Ñ…‘…Ñ„èì‘¥ÍÑÉ¥ĞèÁ±…”¹‘¥ÍÑÉ¥Ğñğ€ˆˆ°Í½ÕÉ”è€‰É•Í¥‘•¹Ñ}Í…Ù•}…Ñ¥½¸ˆô°(€€€ô°¹•áÑM…Ù•¤¹…Ñ  ¡•ÉÉ½È¤€ôøì(€€€€€½¹Í½±”¹İ…É¸ ‰M…Ù•¥Ñ•´½Õ±¹½Ğ‰”É•½¹¥±•ˆ°•ÉÉ½È¤ì(€€€€€¥˜€¡ÑåÁ•½˜İ¥¹‘½Ü€„ôô€‰Õ¹‘•™¥¹•ˆ¤İ¥¹‘½Ü¹…±•ÉĞ¡•ÉÉ½Èü¹µ•ÍÍ…”ñğ€‰½Õ±‘¸ĞÍ…Ù”¸QÉä……¥¸¸ˆ¤ì(€€€ô¤ì(€€€¥˜€¡¹•áÑM…Ù•¤ì(€€€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Í…Ù”ˆ°ì(€€€€€€€•¹Ñ¥Ñå%èÁ±…”¹¥°(€€€€€€€¹…µ”èÁ±…”¹¹…µ”°(€€€€€€€…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°(€€€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€ô¤ì(€€€€€ÑÉ…­¥¹Ù•¹ÑÌ¹Í…Ù”¡Á±…”¹¥¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Õ¹Í…Ù”ˆ°ì(€€€€€•¹Ñ¥Ñå%èÁ±…”¹¥°(€€€€€¹…µ”èÁ±…”¹¹…µ”°(€€€€€…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°(€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€ô¤ì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹Õ¹Í…Ù”¡Á±…”¹¥¤ì(€ô((€™Õ¹Ñ¥½¸•Ñ5…Á¹Íİ•ÉÑ¥½¹1…‰•°¡…Ñ¥½¸¤ì(€€€½¹ÍĞ¹½Éµ…±¥é•€ôMÑÉ¥¹œ¡…Ñ¥½¸ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰½Á•¸ˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰µ…Àˆ¤¤É•ÑÕÉ¸€‰=Á•¸9•…É‰äˆì(€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰Í…Ù”ˆ¤¤É•ÑÕÉ¸€‰M…Ù”ˆì(€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰½µÁ…É”ˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰…Ñ¥Ù¥Ñäˆ¤¤É•ÑÕÉ¸€‰½µÁ…É”Ñ¥Ù¥Ñäˆì(€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰İ…±¬ˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰¹•…Èˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰¹•áĞˆ¤¤É•ÑÕÉ¸€‰Y¥•ÜI•ÍÕ±ÑÌˆì(€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰‘¥É•Ñ¥½¸ˆ¤¤É•ÑÕÉ¸€‰¥É•Ñ¥½¹Ìˆì(€€€É•ÑÕÉ¸MÑÉ¥¹œ¡…Ñ¥½¸ñğ€‰=Á•¸ˆ¤¹É•Á±…” ½y¡•­qÌ¬½¤°€ˆˆ¤ì(€ô((€™Õ¹Ñ¥½¸¡…¹‘±•5…Á¹Íİ•ÉÑ¥½¸¡…Ñ¥½¸¤ì(€€€½¹ÍĞ¹½Éµ…±¥é•€ôMÑÉ¥¹œ¡…Ñ¥½¸ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤ì(€€€½¹ÍĞ™¥ÉÍÑA¥¬€ôµ…Á¹Íİ•Èü¹Á¥­Ìü¹lÁtñğÍ•±•Ñ•ñğÙ¥Í¥‰±•A±…•ÍlÁtì((€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰Ù¥•Üˆ¤€˜˜¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰•Ù•¹Ğˆ¤¤ì(€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰Ù•¹ÑÌˆ¤ì(€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰•Ù•¹ÑÌˆ¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰Í…Ù”ˆ¤¤ì(€€€€€¥˜€¡™¥ÉÍÑA¥¬¤ì(€€€€€€€Ñ½±•M…Ù•¡™¥ÉÍÑA¥¬¤ì(€€€€€€€Í•±•ÑA±…”¡™¥ÉÍÑA¥¬¤ì(€€€€€ô(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰İ…±¬ˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰¹•…Èˆ¤ñğ¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰¹•áĞˆ¤¤ì(€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰‘¥Í½Ù•Èˆ¤ì(€€€€€Í•ÑI•ÍÕ±ÑÍáÁ…¹‘•¡ÑÉÕ”¤ì(€€€€€¥˜€¡™¥ÉÍÑA¥¬¤Í•±•ÑA±…”¡™¥ÉÍÑA¥¬¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€¥˜€¡¹½Éµ…±¥é•¹¥¹±Õ‘•Ì ‰‘¥É•Ñ¥½¸ˆ¤¤ì(€€€€€¥˜€¡™¥ÉÍÑA¥¬€˜˜ÑåÁ•½˜İ¥¹‘½Ü€„ôô€‰Õ¹‘•™¥¹•ˆ¤ì(€€€€€€€ÑÉ…­¥¹Ù•¹ÑÌ¹‘¥É•Ñ¥½¹Ì¡™¥ÉÍÑA¥¬¹¥¤ì(€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡™¥ÉÍÑA¥¬°€‰‘¥É•Ñ¥½¹Ìˆ°€‰…Í­}µ…Á}…¹Íİ•É}…Ñ¥½¸ˆ°ì(€€€€€€€€€™½É´èì(€€€€€€€€€€€¥¹Ñ•¹Ğè€‰‘¥É•Ñ¥½¹Ìˆ°(€€€€€€€€€€€±…‰•°è€‰Í¬Ñ¡”5…À‘¥É•Ñ¥½¹Ìˆ°(€€€€€€€€€ô°(€€€€€€€ô¤¤ì(€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½Ù¥Í¥Ğˆ°ì(€€€€€€€€€ÁÉ½™¥±•%è•Ñ]½É­™±½İAÉ½™¥±•% ¤°(€€€€€€€€€Ù•¹Õ•%è™¥ÉÍÑA¥¬¹¥°(€€€€€€€€€Í½ÕÉ”è€‰‘¥É•Ñ¥½¹Ìˆ°(€€€€€€€ô¤ì(€€€€€€€İ¥¹‘½Ü¹½Á•¸¡‘¥É•Ñ¥½¹ÍUÉ°¡™¥ÉÍÑA¥¬¤°€‰}‰±…¹¬ˆ°€‰¹½½Á•¹•È±¹½É•™•ÉÉ•Èˆ¤ì(€€€€€ô(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€¥˜€¡™¥ÉÍÑA¥¬¤Í•±•ÑA±…”¡™¥ÉÍÑA¥¬¤ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸Ñ½±•IÍÙÀ¡Á±…”¤ì(€€€¥˜€ ¡ÉÉ…ä¹¥ÍÉÉ…ä¡•Ù•¹ÑIÍÙÁÌ¤€ü•Ù•¹ÑIÍÙÁÌ€èmt¤¹Í½µ” ¡¥Ñ•´¤€ôø¥Ñ•´¹¥€ôôôÁ±…”¹¥¤¤ì(€€€€€É•µ½Ù•Ù•¹ÑIÍÙÀ¡Á±…”¹¥¤ì(€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Á±…”°€‰…¹•±}ÉÍÙÀˆ°€‰µ…Á}•Ù•¹Ñ}‘•Ñ…¥±}‘É…İ•Èˆ°ì(€€€€€€€™½É´èì(€€€€€€€€€ÍÑ…ÑÕÌè€‰…¹•±±•ˆ°(€€€€€€€€€Á…ÉÑ¹•É%èÁ±…”¹Á…ÉÑ¹•É%ñğÁ±…”¹É…Üü¹Á…ÉÑ¹•É%ñğ€ˆˆ°(€€€€€€€€€İ½É­ÍÁ…•%èÁ±…”¹İ½É­ÍÁ…•%ñğÁ±…”¹É…Üü¹İ½É­ÍÁ…•%ñğ€ˆˆ°(€€€€€€€€€•Ù•¹Ñ%èÁ±…”¹¥°(€€€€€€€€€…Ñ•½Éäè€‰•Ù•¹Ğˆ°(€€€€€€€€€¥¹Ñ•¹Ğè€‰…¹•±}ÉÍÙÀˆ°(€€€€€€€€€±…‰•°è€‰…¹•°Ù•¹ĞIMY@ˆ°(€€€€€€€ô°(€€€€€ô¤¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€½¹ÍĞÁ…å±½…€ô‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Á±…”°€‰ÉÍÙÀˆ°€‰µ…Á}•Ù•¹Ñ}‘•Ñ…¥±}‘É…İ•Èˆ°ì(€€€€€™½É´èì(€€€€€€€ÍÑ…ÑÕÌè€‰ÉÍÙÁ•ˆ°(€€€€€€€Á…ÉÑ¹•É%èÁ±…”¹Á…ÉÑ¹•É%ñğÁ±…”¹É…Üü¹Á…ÉÑ¹•É%ñğ€ˆˆ°(€€€€€€€İ½É­ÍÁ…•%èÁ±…”¹İ½É­ÍÁ…•%ñğÁ±…”¹É…Üü¹İ½É­ÍÁ…•%ñğ€ˆˆ°(€€€€€€€•Ù•¹Ñ%èÁ±…”¹¥°(€€€€€€€…Ñ•½Éäè€‰•Ù•¹Ğˆ°(€€€€€€€¥¹Ñ•¹Ğè€‰ÉÍÙÀˆ°(€€€€€€€±…‰•°è€‰Ù•¹ĞIMY@ˆ°(€€€€€ô°(€€€ô¤ì(€€€ÑÉäì(€€€€€…İ…¥ĞÁ½ÍÑ]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°Á…å±½…¤ì(€€€ô…Ñ €¡•ÉÉ½È¤ì(€€€€€½¹Í½±”¹İ…É¸ ‰IMY@…Ñ¥½¸™…¥±•ˆ°•ÉÉ½È¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Í•ÑM…Ù•‘%‘Ì ¡ÕÉÉ•¹Ğ¤€ôø¹•ÜM•Ğ¡ÕÉÉ•¹Ğ¤¹…‘¡Á±…”¹¥¤¤ì(€€€…‘‘Ù•¹ÑIÍÙÀ (€€€€€ì(€€€€€€€¥èÁ±…”¹¥°(€€€€€€€Ñ¥Ñ±”èÁ±…”¹¹…µ”°(€€€€€€€‘…Ñ”èÁ±…”¹‘…Ñ”ñğ¹•Ü…Ñ” ¤°(€€€€€€€Ñ¥µ”èÁ±…”¹Ñ¥µ”ñğ€‰UÁ½µ¥¹œˆ°(€€€€€€€Ù•¹Õ”èÁ±…”¹‘¥ÍÑÉ¥Ğñğ€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ°(€€€€€€€…Ñ•½ÉäèÁ±…”¹…Ñ•½Éäñğ€‰Ù•¹Ğˆ°(€€€€€€€½¥¹œèÁ±…”¹É…Üü¹ÉÍÙÁ}½Õ¹ĞñğÁ±…”¹ÉÍÙÁ}½Õ¹Ğñğ€À°(€€€€€€€¥µ…”èÁ±…”¹¥µ…”°(€€€€€€€¥µ…•±Ğè€‘íÁ±…”¹¹…µ•ô•Ù•¹Ñ€°(€€€€€€€‘•ÍÉ¥ÁÑ¥½¸èÁ±…”¹‘•ÍÉ¥ÁÑ¥½¸ñğÁ±…”¹É…Üü¹ÍÕµµ…Éäñğ€‰½İ¹Ñ½İ¸A•É­Ì•Ù•¹ĞÉ•Í¥‘•¹ÑÌ…¸Í…Ù”°IMY@Ñ¼°…¹™¥¹½¸Ñ¡”µ…À¸ˆ°(€€€€€ô°(€€€€€€‰µ…Àˆ(€€€€¤ì(€ô((€™Õ¹Ñ¥½¸•ÑMµ…ÉÑI•ÍÕ±ÑÌ¡ÅÕ•Éä°™¥±Ñ•É=Ù•ÉÉ¥‘”€ô…Ñ¥Ù•¥±Ñ•È¤ì(€€€½¹ÍĞÄ€ôÅÕ•Éä¹ÑÉ¥´ ¤¹Ñ½1½İ•É…Í” ¤ì(€€€½¹ÍĞÁ…ÉÍ•€ôÁ…ÉÍ•5…Á%¹Ñ•¹Ğ¡ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞ¥¹Ñ•¹ÑQ½­•¹Ì€ô•Ñ%¹Ñ•¹ÑQ½­•¹Ì¡Ä¤ì(€€€½¹ÍĞÁ…ÉÍ•‘%¹Ñ•¹ÑÌ€ôÉÉ…ä¹¥ÍÉÉ…ä¡Á…ÉÍ•¹¥¹Ñ•¹ÑÌ¤€üÁ…ÉÍ•¹¥¹Ñ•¹ÑÌ€èmtì(€€€½¹ÍĞ¥Í	É½…‘A…ÉÑ¹•É%¹Ñ•¹Ğ€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜Á…ÉÍ•‘%¹Ñ•¹ÑÌ¹Í½µ” ¡¥¹Ñ•¹Ğ¤€ôøl‰½ÁÁ½ÉÑÕ¹¥Ñäˆ°€‰Á•É™½Éµ…¹”ˆ°€‰…µÁ…¥¹Ìˆ°€‰…Ñ¥Ù…Ñ¥½¸ˆ°€‰¥¹Í¥¡ÑÌˆ°€‰…Õ‘¥•¹”‰t¹¥¹±Õ‘•Ì¡¥¹Ñ•¹Ğ¤¤ì(€€€½¹ÍĞÍ½Á•€ôÁ±…•Ì¹™¥±Ñ•È ¡Á±…”¤€ôøì(€€€€€¥˜€ …µ…Ñ¡•Í½±±•Ñ¥½¸¡Á±…”°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€ …µ…Ñ¡•Í¥±Ñ•È¡Á±…”°™¥±Ñ•É=Ù•ÉÉ¥‘”°Í…Ù•‘%‘Ì¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€ …¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€˜˜Á±…”¹‘¥ÍÑÉ¥Ğ€„ôô‘¥ÍÑÉ¥Ğ¤É•ÑÕÉ¸™…±Í”ì(€€€€€¥˜€¡¥Í%¹Ñ•¹Ñ=¹±å¥±Ñ•È¡™¥±Ñ•É=Ù•ÉÉ¥‘”¤¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€¥˜€ …Ä¤É•ÑÕÉ¸ÑÉÕ”ì(€€€€€½¹ÍĞÑ•áĞ€ôÁ±…•Q•áĞ¡Á±…”¤ì(€€€€€É•ÑÕÉ¸€ (€€€€€€€¥Í	É½…‘A…ÉÑ¹•É%¹Ñ•¹Ğñğ(€€€€€€€Ñ•áĞ¹¥¹±Õ‘•Ì¡Ä¤ñğ(€€€€€€€¥¹Ñ•¹ÑQ½­•¹Ì¹Í½µ” ¡Ñ½­•¸¤€ôøÑ•áĞ¹¥¹±Õ‘•Ì¡Ñ½­•¸¤¤ñğ(€€€€€€€Á…ÉÍ•‘%¹Ñ•¹ÑÌ¹Í½µ” ¡¥¹Ñ•¹Ğ¤€ôøÑ•áĞ¹¥¹±Õ‘•Ì¡MÑÉ¥¹œ¡¥¹Ñ•¹Ğ¤¹Ñ½1½İ•É…Í” ¤¹É•Á±…” ½|½œ°€ˆ€ˆ¤¤¤ñğ(€€€€€€€€¡Ä¹¥¹±Õ‘•Ì ‰Á•É¬ˆ¤€˜˜¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤¤(€€€€€€¤ì(€€€ô¤ì((€€€½¹ÍĞ‰…Í•I•ÍÕ±ÑÌ€ôÍ½Á•¹±•¹Ñ €üÍ½Á•€è‘¥ÍÁ±…åA±…•Ì¹±•¹Ñ €ü‘¥ÍÁ±…åA±…•Ì€è¡…ÍÑ¥Ù•…Ñ•½ÉåM½Á”€ümt€èÁ±…•Ìì(€€€½¹ÍĞ½Ù•É¹•‘I•ÍÕ±ÑÌ€ô•ÑY¥•İÁ½ÉÑ	½Õ¹‘•‘5…É­•ÉA±…•Ì¡‰…Í•I•ÍÕ±ÑÌ°ì(€€€€€…Ñ¥Ù•¥±Ñ•Èè™¥±Ñ•É=Ù•ÉÉ¥‘”°(€€€€€ÅÕ•Éä°(€€€€€Ù¥•İÁ½ÉÑ	½Õ¹‘Ì°(€€€€€é½½´èµ…Ái½½´°(€€€€€Í•±•Ñ•‘%°(€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€ô¤¹Á±…•Ìì(€€€É•ÑÕÉ¸É…¹­A±…•Í½É%¹Ñ•¹Ğ¡½Ù•É¹•‘I•ÍÕ±ÑÌ°ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡™…±Í”¤ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•ÑM•…É¡É•…¥ÉÑä¡™…±Í”¤ì(€€€Í•ÑUÍ•É!…Í9…Ù¥…Ñ•‘5…À¡™…±Í”¤ì(€€€±•…ÉM½Á•‘5…ÁI•ÍÕ±ÑÌ ¤ì(€€€ÑÉäì(€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹É•µ½Ù•%Ñ•´¡5A}Y%]}MQ=I}-d¤ì(€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹É•µ½Ù•%Ñ•´¡5A}UMI}9Y%Q}MQ=I}-d¤ì(€€€ô…Ñ ì(€€€€€€¼¼	•ÍĞµ•™™½ÉĞ…µ•É„É•Í•Ğ™½ÈÑ¡”¹•áĞÉ•ÍÕ±ĞÍ•Ğ¸(€€€ô(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…Í­5…Á•¹Ğ¡ÅÕ•Éä°±½…±I•ÍÕ±ÑÌ¤ì(€€€ÑÉäì(€€€€€½¹ÍĞÁ…ÉÍ•‘%¹Ñ•¹Ğ€ôÁ…ÉÍ•5…Á%¹Ñ•¹Ğ¡ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€€€½¹ÍĞ…Ñ¥Ù•M•½¹‘…Éå¥±Ñ•È€ôM=9Ie}MI!}%9Q9Q}I%0¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹™¥±Ñ•È€ôôô…Ñ¥Ù•¥±Ñ•Èñğ¥Ñ•´¹±…‰•°€ôôô…Ñ¥Ù•¥±Ñ•È¤ì(€€€€€½¹ÍĞ…Ñ¥Ù•AÉ¥µ…Éå¥±Ñ•È€ôAI%5Ie}MI!}%9Q9Q}I%0¹™¥¹ ¡¥Ñ•´¤€ôø¥Ñ•´¹™¥±Ñ•È€ôôô…Ñ¥Ù•¥±Ñ•Èñğ¥Ñ•´¹±…‰•°€ôôô…Ñ¥Ù•¥±Ñ•È¤ì(€€€€€½¹ÍĞ…Ñ¥Ù•¥±Ñ•ÉÉ½ÕÀ€ô…Ñ¥Ù•M•½¹‘…Éå¥±Ñ•È€ü€‰Í•½¹‘…Éäˆ€è…Ñ¥Ù•AÉ¥µ…Éå¥±Ñ•È€ü€‰ÁÉ¥µ…Éäˆ€è€ˆˆì(€€€€€½¹ÍĞÕÉÉ•¹ÑM•…É¡Ñ¥½¸€ôì(€€€€€€€ÑåÁ”è€‰Í•…É ˆ°(€€€€€€€ÅÕ•Éä°(€€€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•È°(€€€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€€€Ñ¥µ•ÍÑ…µÀè¹•Ü…Ñ” ¤¹Ñ½%M=MÑÉ¥¹œ ¤°(€€€€€ôì(€€€€€½¹ÍĞÉ••¹ÑM•…É¡•Í½É•¹Ğ€ômÅÕ•Éä°€¸¸¸¡ÕÍ•É%¹Ñ•É…Ñ¥½¹½¹Ñ•áĞ¹Í•…É¡•Ìñğmt¤¹™¥±Ñ•È ¡¥Ñ•´¤€ôø¥Ñ•´€„ôôÅÕ•Éä¥t¹Í±¥” À°€à¤ì(€€€€€½¹ÍĞÉ••¹ÑÑ¥½¹Í½É•¹Ğ€ômÕÉÉ•¹ÑM•…É¡Ñ¥½¸°€¸¸¸¡ÕÍ•É%¹Ñ•É…Ñ¥½¹½¹Ñ•áĞ¹…Ñ¥½¹Ìñğmt¥t¹Í±¥” À°€ÄØ¤ì(€€€€€½¹ÍĞÍ…Ù•‘¹Ñ¥ÑåMÕµµ…É¥•Ì€ôÁ±…•Ì(€€€€€€€€¹™¥±Ñ•È ¡Á±…”¤€ôøÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤¤(€€€€€€€€¹Í±¥” À°€ÈĞ¤(€€€€€€€€¹µ…À ¡Á±…”¤€ôø€¡ì¥èÁ±…”¹¥°¹…µ”èÁ±…”¹¹…µ”°…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°‘¥ÍÑÉ¥ĞèÁ±…”¹‘¥ÍÑÉ¥Ğô¤¤ì(€€€€€½¹ÍĞÉ••¹Ñ±åM•±•Ñ•‘MÕµµ…É¥•Ì€ô€¡ÕÍ•É%¹Ñ•É…Ñ¥½¹½¹Ñ•áĞ¹Í•±•Ñ•‘A¥¹Ìñğmt¤(€€€€€€€€¹µ…À ¡•¹Ñ¥Ñå%¤€ôøÁ±…•Ì¹™¥¹ ¡Á±…”¤€ôøÁ±…”¹¥€ôôô•¹Ñ¥Ñå%¤¤(€€€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤(€€€€€€€€¹Í±¥” À°€ÄÈ¤(€€€€€€€€¹µ…À ¡Á±…”¤€ôø€¡ì¥èÁ±…”¹¥°¹…µ”èÁ±…”¹¹…µ”°…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°‘¥ÍÑÉ¥ĞèÁ±…”¹‘¥ÍÑÉ¥Ğô¤¤ì(€€€€€½¹ÍĞÉ½ÕÑ•9•…É‰å½¹Ñ•áĞ€ô…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €˜˜€¡Í•±•Ñ•ñğ±½…±I•ÍÕ±ÑÍlÁt¤(€€€€€€€€ü•ÑI½ÕÑ•İ…É•9•…É‰å…É‘Ì¡Í•±•Ñ•ñğ±½…±I•ÍÕ±ÑÍlÁt°Á±…•Ì°ÕÉ±MÑ…Ñ”¹µ½‘”°…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”°Í…Ù•‘%‘Ì°€à¤(€€€€€€€€€€¹µ…À ¡¥Ñ•´¤€ôø€¡ì(€€€€€€€€€€€¥è¥Ñ•´¹Á±…”¹¥°(€€€€€€€€€€€¹…µ”è¥Ñ•´¹Á±…”¹¹…µ”°(€€€€€€€€€€€µ•Ñ„è¥Ñ•´¹µ•Ñ„°(€€€€€€€€€€€…Ñ•½Éäè¥Ñ•´¹Á±…”¹…Ñ•½Éä°(€€€€€€€€€€€‘¥ÍÑÉ¥Ğè¥Ñ•´¹Á±…”¹‘¥ÍÑÉ¥Ğ°(€€€€€€€€€ô¤¤(€€€€€€€€èmtì(€€€€€½¹ÍĞÁ…å±½…€ô…İ…¥ĞÅÕ•Éå•¹Ğ¡ì(€€€€€€€µ•ÍÍ…”èÅÕ•Éä°(€€€€€€€ÅÕ•Éä°(€€€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€€€€€¥¹Ñ•¹ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹¥¹Ñ•¹ÑÍlÁtñğ€‰…Í­}µ…Àˆ°(€€€€€€€‘¥ÍÑÉ¥Ğè¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ°(€€€€€€€±½…Ñ¥½¸èì(€€€€€€€€€±…‰•°è¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ°(€€€€€€€€€½½É‘¥¹…Ñ•Ìèì±…ĞèUMQ%9}9QIlÁt°±¹œèUMQ%9}9QIlÅtô°(€€€€€€€ô°(€€€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•È°(€€€€€€€…Ñ¥Ù•¥±Ñ•È°(€€€€€€€…Ñ¥Ù•1…å•ÈèÕÉ±MÑ…Ñ”¹±…å•È°(€€€€€€€…Ñ¥Ù•½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€€€…Ñ¥Ù•¹Ñ¥ÑäèÍ•±•Ñ•‘%°(€€€€€€€…Ñ¥Ù•I½ÕÑ”è…Ñ¥Ù•I½ÕÑ••¹Ñ½¹Ñ•áĞ°(€€€€€€€É½ÕÑ•½¹Ñ•áĞè…Ñ¥Ù•I½ÕÑ••¹Ñ½¹Ñ•áĞ°(€€€€€€€µ…Á	½Õ¹‘ÌèÙ¥•İÁ½ÉÑ	½Õ¹‘Ì°(€€€€€€€Í…Ù•‘¹Ñ¥Ñ¥•ÌèÉÉ…ä¹™É½´¡Í…Ù•‘%‘Ì¤°(€€€€€€€Í…Ù•‘¹Ñ¥ÑåMÕµµ…É¥•Ì°(€€€€€€€É••¹ÑUÍ•ÉÑ¥½¹ÌèÉ••¹ÑÑ¥½¹Í½É•¹Ğ°(€€€€€€€É••¹ÑM•…É¡•ÌèÉ••¹ÑM•…É¡•Í½É•¹Ğ°(€€€€€€€É••¹Ñ±åM•±•Ñ•‘¹Ñ¥Ñ¥•ÌèÉ••¹Ñ±åM•±•Ñ•‘MÕµµ…É¥•Ì°(€€€€€€€É½ÕÑ•9•…É‰å½¹Ñ•áĞ°(€€€€€€€…Ñ¥Ù•¥±Ñ•ÉÉ½ÕÀ°(€€€€€€€¥ÍM•½¹‘…Éå¥±Ñ•Èè	½½±•…¸¡…Ñ¥Ù•M•½¹‘…Éå¥±Ñ•È¤°(€€€€€€€Á…ÉÍ•‘%¹Ñ•¹Ğ°(€€€€€€€¥¹Ñ•¹Ñ…Ñ•½É¥•ÌèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹¥¹Ñ•¹ÑÌ¹±•¹Ñ (€€€€€€€€€€üÁ…ÉÍ•‘%¹Ñ•¹Ğ¹¥¹Ñ•¹ÑÌ(€€€€€€€€€€èÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€€€€€€€€€ül‰…Ñ¥Ù¥Ñäˆ°€‰…µÁ…¥¹Ìˆ°€‰Á•É­Ìˆ°€‰•Ù•¹ÑÌˆ°€‰ÁÉ½Á•ÉÑ¥•Ìˆ°€‰ÑÉ•¹‘Ì‰t(€€€€€€€€€€€€èl‰¹•…É‰äˆ°€‰Ñ½¹¥¡Ğˆ°€‰Á•É­Ìˆ°€‰•Ù•¹ÑÌˆ°€‰Á±…•Ì‰t°(€€€€€€€…•¹Ñ½¹Ñ•áĞèì(€€€€€€€€€ÅÕ•Éä°(€€€€€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€€€€€€€…Ñ¥Ù•Q…ˆèÕÉ±MÑ…Ñ”¹Ñ…ˆ°(€€€€€€€€€…Ñ¥Ù•¥±Ñ•È°(€€€€€€€€€…Ñ¥Ù•1…å•ÈèÕÉ±MÑ…Ñ”¹±…å•È°(€€€€€€€€€…Ñ¥Ù•½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€€€€€…Ñ¥Ù•I½ÕÑ”è…Ñ¥Ù•I½ÕÑ••¹Ñ½¹Ñ•áĞ°(€€€€€€€€€…Ñ¥Ù•¹Ñ¥ÑäèÍ•±•Ñ•‘%°(€€€€€€€€€ÕÍ•É1½…Ñ¥½¸è¹Õ±°°(€€€€€€€€€µ…Á	½Õ¹‘ÌèÙ¥•İÁ½ÉÑ	½Õ¹‘Ì°(€€€€€€€€€µ…ÁA½Í¥Ñ¥½¸èÙ¥•İÁ½ÉÑ	½Õ¹‘Ì€üì(€€€€€€€€€€€•¹Ñ•ÈèÙ¥•İÁ½ÉÑ	½Õ¹‘Ì¹•¹Ñ•Èñğ¹Õ±°°(€€€€€€€€€€€é½½´èÙ¥•İÁ½ÉÑ	½Õ¹‘Ì¹é½½´ñğµ…Ái½½´°(€€€€€€€€€€€‰½Õ¹‘ÌèÙ¥•İÁ½ÉÑ	½Õ¹‘Ì°(€€€€€€€€€ô€èì•¹Ñ•Èè¹Õ±°°é½½´èµ…Ái½½´ô°(€€€€€€€€€Ñ¥µ•½¹Ñ•áĞèÉ•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¹Ñ¥µ”ñğÕÉ±MÑ…Ñ”¹Ñ¥µ”ñğ€ˆˆ°(€€€€€€€€€Í•±•Ñ•‘¥ÍÑÉ¥Ğè¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ°(€€€€€€€€€Í…Ù•‘¹Ñ¥Ñ¥•ÌèÉÉ…ä¹™É½´¡Í…Ù•‘%‘Ì¤°(€€€€€€€€€Í…Ù•‘¹Ñ¥ÑåMÕµµ…É¥•Ì°(€€€€€€€€€É••¹Ñ±åM•±•Ñ•‘¹Ñ¥Ñ¥•ÌèÉ••¹Ñ±åM•±•Ñ•‘MÕµµ…É¥•Ì°(€€€€€€€€€É••¹ÑM•…É¡•ÌèÉ••¹ÑM•…É¡•Í½É•¹Ğ°(€€€€€€€€€É••¹ÑÑ¥½¹ÌèÉ••¹ÑÑ¥½¹Í½É•¹Ğ°(€€€€€€€€€É½ÕÑ•9•…É‰å½¹Ñ•áĞ°(€€€€€€€€€•¹Ñ¥ÑåI•¥ÍÑÉäè•Ñ•¹Ñ¹Ñ¥ÑåI•¥ÍÑÉåM¹…ÁÍ¡½Ğ¡‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì°ì(€€€€€€€€€€€…Ñ¥Ù•¥±Ñ•È°(€€€€€€€€€€€ÅÕ•Éä°(€€€€€€€€€€€Ù¥•İÁ½ÉÑ	½Õ¹‘Ì°(€€€€€€€€€€€é½½´èµ…Ái½½´°(€€€€€€€€€€€Í•±•Ñ•‘%°(€€€€€€€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€€€€€€€ô¤°(€€€€€€€ô°(€€€€€€€µ…Á½¹Ñ•áĞè±½…±I•ÍÕ±ÑÌ¹Í±¥” À°€à¤¹µ…À ¡Á±…”¤€ôøì(€€€€€€€€€½¹ÍĞ±••¹‘Í1¥ÍÑ¥¹œ€ô•ÑI•Í½±Ù•‘1••¹‘Í1¥ÍÑ¥¹œ¡Á±…”¤ì(€€€€€€€€€½¹ÍĞ±ÕáÕÉå	Õ¥±‘¥¹œ€ô•Ñ1ÕáÕÉåAÉ•Í•¹•	Õ¥±‘¥¹œ¡Á±…”¤ì(€€€€€€€€€½¹ÍĞ‰Õ¥±‘¥¹1¥ÍÑ¥¹Ì€ô±ÕáÕÉå	Õ¥±‘¥¹œü¹±¥ÍÑ¥¹ÌñğÁ±…”ü¹±¥ÍÑ¥¹Ìñğmtì(€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€¥èÁ±…”¹¥°(€€€€€€€€€€€¹…µ”èÁ±…”¹¹…µ”°(€€€€€€€€€€€…Ñ•½ÉäèÁ±…”¹…Ñ•½Éä°(€€€€€€€€€€€‘¥ÍÑÉ¥ĞèÁ±…”¹‘¥ÍÑÉ¥Ğ°(€€€€€€€€€€€ÑåÁ”èÁ±…”¹ÑåÁ”°(€€€€€€€€€€€…‘‘É•ÍÌèÁ±…”¹…‘‘É•ÍÌñğÁ±…”¹É…Üü¹…‘‘É•ÍÌñğ€ˆˆ°(€€€€€€€€€€€ÍÕµµ…ÉäèÁ±…”¹ÍÕµµ…ÉäñğÁ±…”¹‘•ÍÉ¥ÁÑ¥½¸ñğÁ±…”¹É…Üü¹ÍÕµµ…ÉäñğÁ±…”¹É…Üü¹‘•ÍÉ¥ÁÑ¥½¸ñğ€ˆˆ°(€€€€€€€€€€€½™™•ÈèÁ±…”¹‘•…±Í}½™™•ÉÌñğÁ±…”¹½™™•ÈñğÁ±…”¹É…Üü¹‘•…±Í}½™™•ÉÌñğÁ±…”¹É…Üü¹½™™•ÈñğÁ±…”¹¡…ÁÁå!½ÕÈü¹½™™•ÈñğÁ±…”¹É…Üü¹¡…ÁÁå!½ÕÈü¹½™™•Èñğ€ˆˆ°(€€€€€€€€€€€Ñ¥µ¥¹œèÁ±…”¹¡…ÁÁå!½ÕÈü¹Ñ¥µ”ñğÁ±…”¹É…Üü¹¡…ÁÁå!½ÕÈü¹Ñ¥µ”ñğÁ±…”¹Ñ¥µ”ñğÁ±…”¹É…Üü¹Ñ¥µ”ñğ€ˆˆ°(€€€€€€€€€€€±…Ñ¥ÑÕ‘”èÁ±…”¹±…Ñ¥ÑÕ‘”°(€€€€€€€€€€€±½¹¥ÑÕ‘”èÁ±…”¹±½¹¥ÑÕ‘”°(€€€€€€€€€€€¡…ÍA•É¬è¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤°(€€€€€€€€€€€±¥ÍÑ¥¹œè±••¹‘Í1¥ÍÑ¥¹œ(€€€€€€€€€€€€€€üì(€€€€€€€€€€€€€€€€€…‘‘É•ÍÌè±••¹‘Í1¥ÍÑ¥¹œ¹…‘‘É•ÍÌ°(€€€€€€€€€€€€€€€€€ÁÉ¥”è±••¹‘Í1¥ÍÑ¥¹œ¹ÁÉ¥•¥ÍÁ±…äñğ±••¹‘Í1¥ÍÑ¥¹œ¹ÁÉ¥”°(€€€€€€€€€€€€€€€€€‰•‘Ìè±••¹‘Í1¥ÍÑ¥¹œ¹‰•‘Ì°(€€€€€€€€€€€€€€€€€‰…Ñ¡Ìè±••¹‘Í1¥ÍÑ¥¹œ¹‰…Ñ¡Ì°(€€€€€€€€€€€€€€€€€ÍÅ™Ğè±••¹‘Í1¥ÍÑ¥¹œ¹ÍÅ™Ñ¥ÍÁ±…äñğ±••¹‘Í1¥ÍÑ¥¹œ¹ÍÅ™Ğ°(€€€€€€€€€€€€€€€€€Õ¹¥Ğè±••¹‘Í1¥ÍÑ¥¹œ¹Õ¹¥Ğ°(€€€€€€€€€€€€€€€€€µ±Ìè±••¹‘Í1¥ÍÑ¥¹œ¹µ±Í9Õµ‰•Èñğ±••¹‘Í1¥ÍÑ¥¹œ¹µ±Í}¹Õµ‰•È°(€€€€€€€€€€€€€€€€€‘…åÍ=¹5…É­•Ğè±••¹‘Í1¥ÍÑ¥¹œ¹‘…åÍ=¹5…É­•Ğ°(€€€€€€€€€€€€€€€€€ÍÑ…ÑÕÌè±••¹‘Í1¥ÍÑ¥¹œ¹ÍÑ…ÑÕÌ°(€€€€€€€€€€€€€€€€€‰Õ¥±‘¥¹œè±••¹‘Í1¥ÍÑ¥¹œ¹‰Õ¥±‘¥¹9…µ”ñğ±••¹‘Í1¥ÍÑ¥¹œ¹‰Õ¥±‘¥¹}¹…µ”°(€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€èÕ¹‘•™¥¹•°(€€€€€€€€€€€‰Õ¥±‘¥¹1¥ÍÑ¥¹Ìè‰Õ¥±‘¥¹1¥ÍÑ¥¹Ì¹±•¹Ñ (€€€€€€€€€€€€€€ü‰Õ¥±‘¥¹1¥ÍÑ¥¹Ì¹Í±¥” À°€Ø¤¹µ…À ¡±¥ÍÑ¥¹œ¤€ôø€¡ì(€€€€€€€€€€€€€€€€€…‘‘É•ÍÌè±¥ÍÑ¥¹œ¹…‘‘É•ÍÌ°(€€€€€€€€€€€€€€€€€Õ¹¥Ğè±¥ÍÑ¥¹œ¹Õ¹¥Ğ°(€€€€€€€€€€€€€€€€€ÁÉ¥”è±¥ÍÑ¥¹œ¹ÁÉ¥”°(€€€€€€€€€€€€€€€€€‰•‘Ìè±¥ÍÑ¥¹œ¹‰•‘Ì°(€€€€€€€€€€€€€€€€€‰…Ñ¡Ìè±¥ÍÑ¥¹œ¹‰…Ñ¡Ì°(€€€€€€€€€€€€€€€€€ÍÅ™Ğè±¥ÍÑ¥¹œ¹ÍÅ™Ğ°(€€€€€€€€€€€€€€€€€µ±Ìè±¥ÍÑ¥¹œ¹µ±Í}¹Õµ‰•È°(€€€€€€€€€€€€€€€€€ÍÑ…ÑÕÌè±¥ÍÑ¥¹œ¹ÍÑ…ÑÕÌ°(€€€€€€€€€€€€€€€ô¤¤(€€€€€€€€€€€€€€èÕ¹‘•™¥¹•°(€€€€€€€€€ôì(€€€€€€€ô¤°(€€€€€ô¤ì((€€€€€¥˜€ …Á…å±½…ü¹…¹Íİ•È¤É•ÑÕÉ¸¹Õ±°ì(€€€€€É•ÑÕÉ¸Á…å±½…ì(€€€ô…Ñ ì(€€€€€É•ÑÕÉ¸¹Õ±°ì(€€€ô(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸ÉÕ¹M•…É ¡•Ù•¹Ğ¤ì(€€€•Ù•¹Ğü¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€½¹ÍĞÅÕ•Éä€ôÍ•…É ¹ÑÉ¥´ ¤ñğÍ•…É¡½¹Í½±•5½‘•½¹™¥œ¹Á±…•¡½±‘•Èì(€€€½¹ÍĞÁ…ÉÍ•‘%¹Ñ•¹Ğ€ôÁ…ÉÍ•5…Á%¹Ñ•¹Ğ¡ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÅÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞÉ½ÕÑ•½±±•Ñ¥½¸€ô•Ñ5…Á½±±•Ñ¥½¹½ÉEÕ•Éä¡ÅÕ•Éä¤ì(€€€½¹ÍĞ¹•áÑ¥ÍÑÉ¥Ğ€ôÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ‘¥ÍÑÉ¥Ğì(€€€½¹ÍĞ•™™•Ñ¥Ù•9•áÑ¥±Ñ•È€ô¹•áÑ¥±Ñ•Èñğ…Ñ¥Ù•¥±Ñ•Èì(€€€½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€½¹ÍĞ½µµ¥ÑÑ•‘¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡•™™•Ñ¥Ù•9•áÑ¥±Ñ•È°ì(€€€€€ÅÕ•Éä°(€€€€€½±±•Ñ¥½¸èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğ€ˆˆ°(€€€€€‘¥ÍÑÉ¥ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€ˆˆ€è‘¥ÍÑÉ¥Ğ¤°(€€€€€Ñ¥µ”èÁ…ÉÍ•‘%¹Ñ•¹Ğ¹Ñ¥µ•½¹Ñ•áĞñğ€ˆˆ°(€€€€€¥¹Ñ•¹ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹¥¹Ñ•¹ÑÍlÁtñğ•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡•™™•Ñ¥Ù•9•áÑ¥±Ñ•È°ÅÕ•Éä¤°(€€€€€•¹Ñ¥ÑåQåÁ”èÁ…ÉÍ•‘%¹Ñ•¹Ğ¹•¹Ñ¥ÑåQåÁ”ñğ€ˆˆ°(€€€ô¤ì(€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€ÅÕ•Éä°(€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€½±±•Ñ¥½¹%èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğ€ˆˆ°(€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€ÑÉ¥•ÈèÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥€ü€‰ÕÉ…Ñ•‘}É½ÕÑ”ˆ€è€‰Ñ•áÑ}Í•…É ˆ°(€€€€€±¥µ¥ĞèÉ½ÕÑ•½±±•Ñ¥½¸ü¹ÍÑ½Á%‘Ìü¹±•¹Ñ ñğÕ¹‘•™¥¹•°(€€€ô¤ì(€€€½¹ÍĞ¹½Éµ…±¥é•‘á…ÑEÕ•Éä€ôÅÕ•Éä¹Ñ½1½İ•É…Í” ¤¹É•Á±…” ½my„µèÀ´åt¬½œ°€ˆ€ˆ¤¹ÑÉ¥´ ¤ì(€€€½¹ÍĞ•á…ÑA±…”€ô±½…±I•ÍÕ±ÑÌ¹™¥¹ ¡Á±…”¤€ôøì(€€€€€½¹ÍĞ•á…Ñ…¹‘¥‘…Ñ•Ì€ômÁ±…”¹¥°Á±…”¹¹…µ”°Á±…”¹Ñ¥Ñ±”°Á±…”¹•¹Ñ¥Ñå}¥‘t(€€€€€€€€¹™¥±Ñ•È¡	½½±•…¸¤(€€€€€€€€¹µ…À ¡Ù…±Õ”¤€ôøMÑÉ¥¹œ¡Ù…±Õ”¤¹Ñ½1½İ•É…Í” ¤¹É•Á±…” ½my„µèÀ´åt¬½œ°€ˆ€ˆ¤¹ÑÉ¥´ ¤¤ì(€€€€€É•ÑÕÉ¸•á…Ñ…¹‘¥‘…Ñ•Ì¹¥¹±Õ‘•Ì¡¹½Éµ…±¥é•‘á…ÑEÕ•Éä¤ì(€€€ô¤ì(€€€¥˜€¡•á…ÑA±…”¤Í•±•ÑA±…”¡•á…ÑA±…”¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Í•…É ˆ°ì(€€€€€ÅÕ•Éä°(€€€€€™¥±Ñ•Èè½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€½±±•Ñ¥½¸èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğ€ˆˆ°(€€€€€‘¥ÍÑÉ¥ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ¤°(€€€€€É•ÍÕ±Ñ½Õ¹Ğè±½…±I•ÍÕ±ÑÌ¹±•¹Ñ °(€€€ô¤ì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹Í•…É¡MÕ‰µ¥Ğ¡ÅÕ•Éä¤ì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½Í•…É µ±½œˆ°ì(€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€ÅÕ•Éä°(€€€€€±…ĞèUMQ%9}9QIlÁt°(€€€€€±¹œèUMQ%9}9QIlÅt°(€€€ô¤ì(€€€¥˜€¡Á…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğ¤Í•Ñ¥ÍÑÉ¥Ğ¡Á…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğ¤ì(€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡ÅÕ•Éä°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”°¹•áÑ¥ÍÑÉ¥Ğ°½µµ¥ÑÑ•‘¥±Ñ•È¤¤ì((€€€½¹ÍĞ…•¹Ñ¹Íİ•È€ô…İ…¥Ğ…Í­5…Á•¹Ğ¡ÅÕ•Éä°±½…±I•ÍÕ±ÑÌ¤ì(€€€¥˜€¡…•¹Ñ¹Íİ•Èü¹…¹Íİ•È¤ì(€€€€€Í•Ñ5…Á¹Íİ•È ¡ÕÉÉ•¹Ğ¤€ôøµ•É••¹Ñ¹Íİ•É]¥Ñ¡1½…±I•ÍÕ±ÑÌ¡…•¹Ñ¹Íİ•È°±½…±I•ÍÕ±ÑÌ°ÕÉÉ•¹Ğü¹Ñ¥Ñ±”ñğMÑ…ÉĞİ¥Ñ €‘í±½…±I•ÍÕ±ÑÍlÁtü¹¹…µ”ñğ€‰½İ¹Ñ½İ¸‰ô¹€¤¤ì(€€€ô(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…ÁÁ±åAÉ½µÁĞ¡ÁÉ½µÁĞ¤ì(€€€½¹ÍĞÁ…ÉÍ•‘%¹Ñ•¹Ğ€ôÁ…ÉÍ•5…Á%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞÉ½ÕÑ•½±±•Ñ¥½¸€ô•Ñ5…Á½±±•Ñ¥½¹½ÉEÕ•Éä¡ÁÉ½µÁĞ¤ì(€€€½¹ÍĞ¹•áÑ¥ÍÑÉ¥Ğ€ôÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ‘¥ÍÑÉ¥Ğì(€€€½¹ÍĞ•™™•Ñ¥Ù•9•áÑ¥±Ñ•È€ô¹•áÑ¥±Ñ•Èñğ…Ñ¥Ù•¥±Ñ•Èì(€€€½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€½¹ÍĞ½µµ¥ÑÑ•‘¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡•™™•Ñ¥Ù•9•áÑ¥±Ñ•È°ì(€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€½±±•Ñ¥½¸èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğ€ˆˆ°(€€€€€‘¥ÍÑÉ¥ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€ˆˆ€è‘¥ÍÑÉ¥Ğ¤°(€€€€€Ñ¥µ”èÁ…ÉÍ•‘%¹Ñ•¹Ğ¹Ñ¥µ•½¹Ñ•áĞñğ€ˆˆ°(€€€€€¥¹Ñ•¹ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹¥¹Ñ•¹ÑÍlÁtñğ•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡•™™•Ñ¥Ù•9•áÑ¥±Ñ•È°ÁÉ½µÁĞ¤°(€€€€€•¹Ñ¥ÑåQåÁ”èÁ…ÉÍ•‘%¹Ñ•¹Ğ¹•¹Ñ¥ÑåQåÁ”ñğ€ˆˆ°(€€€ô¤ì(€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€½±±•Ñ¥½¹%èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğ€ˆˆ°(€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€ÑÉ¥•ÈèÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥€ü€‰ÕÉ…Ñ•‘}É½ÕÑ”ˆ€è€‰ÁÉ½µÁÑ}Í•…É ˆ°(€€€€€±¥µ¥ĞèÉ½ÕÑ•½±±•Ñ¥½¸ü¹ÍÑ½Á%‘Ìü¹±•¹Ñ ñğÕ¹‘•™¥¹•°(€€€ô¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Í•…É ˆ°ì(€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€™¥±Ñ•Èè½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€½±±•Ñ¥½¸èÉ½ÕÑ•½±±•Ñ¥½¸ü¹¥ñğÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğ€ˆˆ°(€€€€€‘¥ÍÑÉ¥ĞèÁ…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ¤°(€€€€€É•ÍÕ±Ñ½Õ¹Ğè±½…±I•ÍÕ±ÑÌ¹±•¹Ñ °(€€€€€Í½ÕÉ”è€‰ÁÉ½µÁĞˆ°(€€€ô¤ì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹Í•…É¡MÕ‰µ¥Ğ¡ÁÉ½µÁĞ¤ì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½Í•…É µ±½œˆ°ì(€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€±…ĞèUMQ%9}9QIlÁt°(€€€€€±¹œèUMQ%9}9QIlÅt°(€€€ô¤ì(€€€¥˜€¡Á…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğ¤Í•Ñ¥ÍÑÉ¥Ğ¡Á…ÉÍ•‘%¹Ñ•¹Ğ¹‘¥ÍÑÉ¥Ğ¤ì(€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡ÁÉ½µÁĞ°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”°¹•áÑ¥ÍÑÉ¥Ğ°½µµ¥ÑÑ•‘¥±Ñ•È¤¤ì((€€€½¹ÍĞ…•¹Ñ¹Íİ•È€ô…İ…¥Ğ…Í­5…Á•¹Ğ¡ÁÉ½µÁĞ°±½…±I•ÍÕ±ÑÌ¤ì(€€€¥˜€¡…•¹Ñ¹Íİ•Èü¹…¹Íİ•È¤ì(€€€€€Í•Ñ5…Á¹Íİ•È ¡ÕÉÉ•¹Ğ¤€ôøµ•É••¹Ñ¹Íİ•É]¥Ñ¡1½…±I•ÍÕ±ÑÌ¡…•¹Ñ¹Íİ•È°±½…±I•ÍÕ±ÑÌ°ÕÉÉ•¹Ğü¹Ñ¥Ñ±”ñğMÑ…ÉĞİ¥Ñ €‘í±½…±I•ÍÕ±ÑÍlÁtü¹¹…µ”ñğ€‰½İ¹Ñ½İ¸‰ô¹€¤¤ì(€€€ô(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…ÁÁ±åI•Í¥‘•¹Ñ%¹Ñ•¹Ğ¡¥Ñ•´¤ì(€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜¥Ñ•´ü¹¥¤ì(€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ€ôôô¥Ñ•´¹¥€˜˜€…•™™•Ñ¥Ù•M•…É €˜˜€…Í•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¡ÕÉÉ•¹Ğ¤€ôø€¡ì€¸¸¹ÕÉÉ•¹Ğ°¥¹Ñ•¹Ğè¥Ñ•´¹¥ô¤¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¥Ñ•´¹™¥±Ñ•Èñğ€‰±°ˆ°ì¥¹Ñ•¹Ğè¥Ñ•´¹¥ô¤ì(€€€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€€€ÅÕ•Éäè€ˆˆ°(€€€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è¹•áÑ¥±Ñ•È°(€€€€€€€¥¹Ñ•¹Ñ=Ù•ÉÉ¥‘”è¥Ñ•´¹¥°(€€€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€€€ÑÉ¥•Èè€‰Á…ÉÑ¹•É}¥¹Ñ•¹Ğˆ°(€€€€€ô¤ì(€€€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡¥Ñ•´¹±…‰•°ñğ¥Ñ•´¹¥°±½…±I•ÍÕ±ÑÌ°€‰Á…ÉÑ¹•Èˆ°‘¥ÍÑÉ¥Ğ°¹•áÑ¥±Ñ•È¤¤ì(€€€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰™¥±Ñ•Èˆ°ì¥¹Ñ•¹Ğè¥Ñ•´¹¥°™¥±Ñ•Èè¹•áÑ¥±Ñ•È°É•ÍÕ±Ñ½Õ¹Ğè±½…±I•ÍÕ±ÑÌ¹±•¹Ñ °Í½ÕÉ”è€‰Á…ÉÑ¹•É}¥¹Ñ•¹Ñ}½¹Í½±”ˆô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¡ÕÉÉ•¹Ğ¤€ôø€¡ì€¸¸¹ÕÉÉ•¹Ğ°¥¹Ñ•¹Ğè¥Ñ•´¹¥ô¤¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€…İ…¥Ğ…ÁÁ±åAÉ½µÁĞ¡¥Ñ•´¹ÁÉ½µÁĞ¤ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…ÁÁ±åI•Í¥‘•¹ÑQ¥µ”¡¥Ñ•´¤ì(€€€½¹ÍĞÕÉÉ•¹ÑEÕ•Éä€ôÍ•…É ¹ÑÉ¥´ ¤ì(€€€½¹ÍĞ…Ñ¥Ù•%¹Ñ•¹Ñ1…‰•°€ôIM%9Q}%9Q9Q}=9M=1}	UQQ=9L¹™¥¹ ¡¥¹Ñ•¹Ñ%Ñ•´¤€ôø¥¹Ñ•¹Ñ%Ñ•´¹¥€ôôôÉ•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¹¥¹Ñ•¹Ğ¤ü¹±…‰•°ì(€€€½¹ÍĞ¹•áÑEÕ•Éä€ôÕÉÉ•¹ÑEÕ•Éä(€€€€€€ü€‘íÕÉÉ•¹ÑEÕ•Éåô€‘í¥Ñ•´¹±…‰•°¹Ñ½1½İ•É…Í” ¥õ€(€€€€€€è…Ñ¥Ù•%¹Ñ•¹Ñ1…‰•°(€€€€€€€€ü€‘í…Ñ¥Ù•%¹Ñ•¹Ñ1…‰•±ô€‘í¥Ñ•´¹±…‰•°¹Ñ½1½İ•É…Í” ¥õ€(€€€€€€€€è¥Ñ•´¹ÁÉ½µÁĞì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡¹•áÑEÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ…Ñ¥Ù•¥±Ñ•Èì(€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¡ÕÉÉ•¹Ğ¤€ôø€¡ì€¸¸¹ÕÉÉ•¹Ğ°Ñ¥µ”è¥Ñ•´¹¥ô¤¤ì(€€€½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€½¹ÍĞ½µµ¥ÑÑ•‘¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ì(€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€Ñ¥µ”è¥Ñ•´¹¥°(€€€€€É…‘¥ÕÌ°(€€€€€¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°¹•áÑEÕ•Éä¤°(€€€ô¤ì(€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€ÑÉ¥•Èè€‰Ñ¥µ•}¥¹Ñ•¹Ğˆ°(€€€ô¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡¹•áÑEÕ•Éä°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”°‘¥ÍÑÉ¥Ğ°½µµ¥ÑÑ•‘¥±Ñ•È¤¤ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…ÁÁ±åI•Í¥‘•¹ÑI…‘¥ÕÌ¡¥Ñ•´¤ì(€€€½¹ÍĞ¹•áÑEÕ•Éä€ôÍ•…É ¹ÑÉ¥´ ¤ñğ€‰]¡…ÓŠeÌİ½ÉÑ İ…±­¥¹œÑ¼Ñ½¹¥¡Ğüˆì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡¹•áÑEÕ•Éä°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ…Ñ¥Ù•¥±Ñ•Èì(€€€Í•ÑI…‘¥ÕÌ¡¥Ñ•´¹±…‰•°¤ì(€€€½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€½¹ÍĞ½µµ¥ÑÑ•‘¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ì(€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€É…‘¥ÕÌè¥Ñ•´¹±…‰•°°(€€€€€¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°¹•áÑEÕ•Éä¤°(€€€ô¤ì(€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è½µµ¥ÑÑ•‘¥±Ñ•È°(€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€ÑÉ¥•Èè€‰É…‘¥ÕÍ}¥¹Ñ•¹Ğˆ°(€€€ô¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡¹•áÑEÕ•Éä°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”°‘¥ÍÑÉ¥Ğ°½µµ¥ÑÑ•‘¥±Ñ•È¤¤ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…ÁÁ±åI•Í¥‘•¹Ñ½¹Í½±•¥±Ñ•È¡¥Ñ•´¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€¥˜€¡¥Ñ•´¹½±±•Ñ¥½¸¤ì(€€€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¡ÕÉÉ•¹Ğ¤€ôø€¡ì€¸¸¹ÕÉÉ•¹Ğ°¥¹Ñ•¹Ğè¹Õ±°ô¤¤ì(€€€€€½¹ÍĞ¹•áÑEÕ•Éä€ô¥Ñ•´¹ÁÉ½µÁĞñğ¥Ñ•´¹±…‰•°ñğ¥Ñ•´¹½±±•Ñ¥½¸ì(€€€€€½Á•¹½±±•Ñ¥½¹I½ÕÑ”¡¥Ñ•´¹½±±•Ñ¥½¸°¹•áÑEÕ•Éä¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡¥Ñ•´¹™¥±Ñ•È¤ì(€€€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¡ÕÉÉ•¹Ğ¤€ôø€¡ì€¸¸¹ÕÉÉ•¹Ğ°¥¹Ñ•¹Ğè¹Õ±°ô¤¤ì(€€€€€½¹ÍĞ¹•áÑEÕ•Éä€ô¥Ñ•´¹ÁÉ½µÁĞñğ¥Ñ•´¹±…‰•°ñğ¥Ñ•´¹™¥±Ñ•Èì(€€€€€½¹ÍĞ¹•áÑ%¹Ñ•¹Ñ%€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€€€€€ü¥Ñ•´¹¥ñğ•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¥Ñ•´¹™¥±Ñ•È°¹•áÑEÕ•Éä¤(€€€€€€€€è•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¥Ñ•´¹™¥±Ñ•È°¹•áÑEÕ•Éä¤ì(€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜ÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ€ôôô¹•áÑ%¹Ñ•¹Ñ%€˜˜€…•™™•Ñ¥Ù•M•…É €˜˜€…Í•±•Ñ•‘%¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¥Ñ•´¹™¥±Ñ•È°ì(€€€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€€€¥¹Ñ•¹Ğè¹•áÑ%¹Ñ•¹Ñ%°(€€€€€€€‘¥ÍÁ±…åEÕ•Éäè¹•áÑEÕ•Éä°(€€€€€ô¤ì(€€€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô…İ…¥ĞÉ•ÅÕ•ÍÑM½Á•‘5…ÁI•ÍÕ±ÑÌ¡ì(€€€€€€€ÅÕ•Éäè¹•áÑEÕ•Éä°(€€€€€€€™¥±Ñ•É=Ù•ÉÉ¥‘”è¹•áÑ¥±Ñ•È°(€€€€€€€¥¹Ñ•¹Ñ=Ù•ÉÉ¥‘”è¹•áÑ%¹Ñ•¹Ñ%°(€€€€€€€…Ñ¥Ù•¹Ñ¥Ñå%è€ˆˆ°(€€€€€€€ÑÉ¥•Èè€‰¥¹Ñ•¹Ñ}™¥±Ñ•Èˆ°(€€€€€ô¤ì(€€€€€Í•Ñ5…Á¹Íİ•È¡‰Õ¥±‘•¹Ñ¥5…Á¹Íİ•È¡¹•áÑ¥±Ñ•È°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”°‘¥ÍÑÉ¥Ğ°¹•áÑ¥±Ñ•È¤¤ì(€€€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰™¥±Ñ•Èˆ°ì™¥±Ñ•Èè¹•áÑ¥±Ñ•È°É•ÍÕ±Ñ½Õ¹Ğè±½…±I•ÍÕ±ÑÌ¹±•¹Ñ °Í½ÕÉ”è€‰¥¹Ñ•¹Ñ}½¹Í½±”ˆô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡¥Ñ•´¹­¥¹€ôôô€‰Ñ¥µ”ˆ¤ì(€€€€€…ÁÁ±åI•Í¥‘•¹ÑQ¥µ”¡ì¥è¥Ñ•´¹Ñ¥µ”°±…‰•°è€‰Q½¹¥¡Ğˆ°ÁÉ½µÁĞè¥Ñ•´¹ÁÉ½µÁĞô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡¥Ñ•´¹­¥¹€ôôô€‰É…‘¥ÕÌˆ¤ì(€€€€€…ÁÁ±åI•Í¥‘•¹ÑI…‘¥ÕÌ¡ì¥è€ˆÔµµ¥¸ˆ°±…‰•°è¥Ñ•´¹É…‘¥ÕÌô¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Ù½¥…ÁÁ±åAÉ½µÁĞ¡¥Ñ•´¹ÁÉ½µÁĞ¤ì(€ô((€™Õ¹Ñ¥½¸±•…ÉI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ ¤ì(€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¡ì¥¹Ñ•¹Ğè¹Õ±°°Ñ¥µ”è¹Õ±°ô¤ì(€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰±°ˆ¤ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ğ¡ÁÉ½µÁĞ¤ì(€€€¥˜€ …Í•±•Ñ•¤É•ÑÕÉ¸ì(€€€½¹ÍĞ±•…¹AÉ½µÁĞ€ôMÑÉ¥¹œ¡ÁÉ½µÁĞñğ€ˆˆ¤¹ÑÉ¥´ ¤ì(€€€¥˜€ …±•…¹AÉ½µÁĞ¤É•ÑÕÉ¸ì(€€€½¹ÍĞ•¹Ñ¥ÑåAÉ½µÁĞ€ô±•…¹AÉ½µÁĞ¹Ñ½1½İ•É…Í” ¤¹¥¹±Õ‘•Ì¡MÑÉ¥¹œ¡Í•±•Ñ•¹¹…µ”ñğ€ˆˆ¤¹Ñ½1½İ•É…Í” ¤¤€ü±•…¹AÉ½µÁĞ€è€‘í±•…¹AÉ½µÁÑô™½È€‘íÍ•±•Ñ•¹¹…µ•õ€ì(€€€½¹ÍĞ¹•…É‰åA±…•Ì€ô•Ñ9•…É‰åÉ•…A±…•Ì¡Í•±•Ñ•°Á±…•Ì°€Ø¤¹µ…À ¡¥Ñ•´¤€ôø¥Ñ•´¹…¹‘¥‘…Ñ”¤ì(€€€½¹ÍĞ±½…±I•ÍÕ±ÑÌ€ô¹•…É‰åA±…•Ì¹±•¹Ñ €ü¹•…É‰åA±…•Ì€è•ÑMµ…ÉÑI•ÍÕ±ÑÌ¡•¹Ñ¥ÑåAÉ½µÁĞ¤¹™¥±Ñ•È ¡Á±…”¤€ôøÁ±…”¹¥€„ôôÍ•±•Ñ•¹¥¤¹Í±¥” À°€Ø¤ì(€€€½¹ÍĞ±½…±¹Íİ•È€ô‰Õ¥±‘¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ¹Íİ•È¡•¹Ñ¥ÑåAÉ½µÁĞ°Í•±•Ñ•°±½…±I•ÍÕ±ÑÌ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ì(€€€½¹ÍĞÕÉÉ•¹Ñ¥ÍÑÉ¥Ğ€ôÍ•±•Ñ•¹‘¥ÍÑÉ¥Ğñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ¤ì(€€€½¹ÍĞÉ•ÍÕ±ÑA…å±½…€ômÍ•±•Ñ•°€¸¸¹±½…±I•ÍÕ±ÑÌ¹™¥±Ñ•È ¡Á±…”¤€ôøÁ±…”¹¥€„ôôÍ•±•Ñ•¹¥¥tì((€€€½Á•¹M•…É¡I•ÍÕ±ÑÍ1…å•È ¤ì(€€€É•½É‘5…ÁUÍ•ÉÑ¥½¸ ‰Í•…É ˆ°ì(€€€€€ÅÕ•Éäè•¹Ñ¥ÑåAÉ½µÁĞ°(€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•È°(€€€€€‘¥ÍÑÉ¥ĞèÕÉÉ•¹Ñ¥ÍÑÉ¥Ğ°(€€€€€•¹Ñ¥Ñå%èÍ•±•Ñ•¹¥°(€€€€€•¹Ñ¥Ñå9…µ”èÍ•±•Ñ•¹¹…µ”°(€€€€€É•ÍÕ±Ñ½Õ¹ĞèÉ•ÍÕ±ÑA…å±½…¹±•¹Ñ °(€€€€€Í½ÕÉ”è€‰•¹Ñ¥Ñå}ÁÉ½µÁĞˆ°(€€€ô¤ì(€€€ÑÉ…­¥¹Ù•¹ÑÌ¹Í•…É¡MÕ‰µ¥Ğ¡•¹Ñ¥ÑåAÉ½µÁĞ¤ì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½Í•…É µ±½œˆ°ì(€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€ÅÕ•Éäè•¹Ñ¥ÑåAÉ½µÁĞ°(€€€€€±…ĞèUMQ%9}9QIlÁt°(€€€€€±¹œèUMQ%9}9QIlÅt°(€€€ô¤ì(€€€Í•ÑM•…É ¡•¹Ñ¥ÑåAÉ½µÁĞ¤ì(€€€Í•Ñ5…Á¹Íİ•È¡±½…±¹Íİ•È¤ì(€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡±½…±¹Íİ•È¤ì(€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡ÑÉÕ”¤ì(€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì(€€€€€Ñ…ˆè€‰µ…Àˆ°(€€€€€ÅÕ•Éäè•¹Ñ¥ÑåAÉ½µÁĞ°(€€€€€Äè€ˆˆ°(€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•È°(€€€€€‘¥ÍÑÉ¥Ğè¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€ˆˆ€è‘¥ÍÑÉ¥Ğ°(€€€€€•¹Ñ¥Ñå%èÍ•±•Ñ•¹¥°(€€€€€±…å•Èè€ˆˆ°(€€€€€±¥ÍÑ¥¹%è€ˆˆ°(€€€€€‘É…İ•É±½Í•è€ˆˆ°(€€€ô¤ì((€€€ÑÉäì(€€€€€½¹ÍĞ…•¹Ñ¹Íİ•È€ô…İ…¥Ğ…Í­5…Á•¹Ğ¡•¹Ñ¥ÑåAÉ½µÁĞ°É•ÍÕ±ÑA…å±½…¤ì(€€€€€¥˜€¡…•¹Ñ¹Íİ•Èü¹…¹Íİ•È¤ì(€€€€€€€½¹ÍĞµ•É•‘¹Íİ•È€ôµ•É••¹Ñ¹Íİ•É]¥Ñ¡1½…±I•ÍÕ±ÑÌ (€€€€€€€€€…•¹Ñ¹Íİ•È°(€€€€€€€€€±½…±I•ÍÕ±ÑÌ°(€€€€€€€€€±½…±¹Íİ•Èü¹Ñ¥Ñ±”ñğMÑ…ÉĞİ¥Ñ €‘í±½…±I•ÍÕ±ÑÍlÁtü¹¹…µ”ñğÍ•±•Ñ•ü¹¹…µ”ñğ€‰½İ¹Ñ½İ¸‰ô¹€(€€€€€€€€¤ì(€€€€€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡µ•É•‘¹Íİ•È¤ì(€€€€€€€Í•Ñ5…Á¹Íİ•È¡µ•É•‘¹Íİ•È¤ì(€€€€€ô(€€€ô™¥¹…±±äì(€€€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡™…±Í”¤ì(€€€ô(€ô((€™Õ¹Ñ¥½¸±•…É=Á•¹5…ÁM•±•Ñ¥½¸ ¤ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¤ì(€€€Í•Ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹œ¡™…±Í”¤ì(€ô((€™Õ¹Ñ¥½¸Íİ¥Ñ¡5½‘”¡µ½‘”°Ñ…ˆ€ô€‰µ…Àˆ°É•ÅÕ•ÍÑ•‘¥±Ñ•È€ô€ˆˆ°½ÁÑ¥½¹Ì€ôíô¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•ÅÕ•ÍÑ•‘¥±Ñ•Èñğ€¡µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰±°ˆ€èÑ…ˆ€ôôô€‰Á…ÍÌˆ€ü€‰±°ˆ€è…Ñ¥Ù•¥±Ñ•È€ôôô€‰M…Ù•ˆ€ü€‰M…Ù•ˆ€è€‰±°ˆ¤ì(€€€±•…É=Á•¹5…ÁM•±•Ñ¥½¸ ¤ì(€€€Í•ÑM•…É  ˆˆ¤ì(€€€Í•ÑÑ¥Ù•¥±Ñ•È¡¹•áÑ¥±Ñ•È¤ì(€€€Í•Ñ¥ÍÑÉ¥Ğ¡11}9%!	=I!==L¤ì(€€€Í•ÑI…‘¥ÕÌ ˆÔµ¥¸İ…±¬ˆ¤ì(€€€Í•Ñ%¹Ñ•±=Á•¸¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•Ñ9•¥¡‰½É¡½½‘Í=Á•¸¡™…±Í”¤ì(€€€Í•ÑM•½¹‘…ÉåI…¥±=Á•¸¡™…±Í”¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡	½½±•…¸¡½ÁÑ¥½¹Ì¹½±±…ÁÍ•½¹Í½±”¤¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”ô‘íµ½‘•ô™Ñ…ˆô‘íÑ…‰ô‘íÑ…ˆ€ôôô€‰µ…Àˆ€ü€™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡¹•áÑ¥±Ñ•È¥õ€€è€ˆ‰õ€¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹I•Í¥‘•¹Ñ1…å•È¡™¥±Ñ•È¤ì(€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ô‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡™¥±Ñ•È¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€Í•ÑA…¹•±5½‘” ‰±½Í•ˆ¤ì(€€€Í•Ñ%¹Ñ•±=Á•¸¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€Í•ÑM•½¹‘…ÉåI…¥±=Á•¸¡™…±Í”¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡¹•áÑ¥±Ñ•È¥õ€¤ì(€ô((€½¹ÍĞ½	…­Q½5…À€ôÕÍ•…±±‰…¬  ¤€ôøì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ%¹Ñ•±=Á•¸¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”ô‘íÕÉ±MÑ…Ñ”¹µ½‘•ô™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡…Ñ¥Ù•¥±Ñ•Èñğ€‰±°ˆ¥õ€°ìÉ•Á±…”èÑÉÕ”ô¤ì(€ô°m…Ñ¥Ù•¥±Ñ•È°¹…Ù¥…Ñ”°ÕÉ±MÑ…Ñ”¹µ½‘•t¤ì((€½¹ÍĞÉ•ÍÑ½É•AÉ•Ù¥½ÕÍ5…ÁA…¹•°€ôÕÍ•…±±‰…¬  ¤€ôøì(€€€½¹ÍĞÁÉ•Ù¥½ÕÌ€ôÁ½ÁA…¹•±MÑ…Ñ” ¤ì(€€€¥˜€ …ÁÉ•Ù¥½ÕÌ¤ì(€€€€€½	…­Q½5…À ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€ÕÁ‘…Ñ•Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ”¡ÁÉ•Ù¥½ÕÌ¹‘É…İ•ÉMÑ…Ñ”¤ì(€€€¹…Ù¥…Ñ”¡ÁÉ•Ù¥½ÕÌ¹ÕÉ°°ìÉ•Á±…”èÑÉÕ”ô¤ì(€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøì(€€€€€½¹ÍĞ±¥ÍĞ€ô‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½È ‰m‘…Ñ„µ…Ñ¥Ù”µÁ•É­ÌµÍÉ½±°ôÑÉÕ”tˆ¤ì(€€€€€¥˜€¡±¥ÍĞ¤±¥ÍĞ¹ÍÉ½±±Q½À€ôÁÉ•Ù¥½ÕÌ¹ÍÉ½±±Q½Àñğ€Àì(€€€€€¥˜€¡ÁÉ•Ù¥½ÕÌ¹™½ÕÍ%¤‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å%¡ÁÉ•Ù¥½ÕÌ¹™½ÕÍ%¤ü¹™½ÕÌü¸¡ìÁÉ•Ù•¹ÑMÉ½±°èÑÉÕ”ô¤ì(€€€ô°€À¤ì(€ô°m½	…­Q½5…À°¹…Ù¥…Ñ”°Á½ÁA…¹•±MÑ…Ñ”°ÕÁ‘…Ñ•Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ•t¤ì((€½¹ÍĞ±½Í•¥É•Ñ½ÉåQ½5…À€ôÕÍ•…±±‰…¬  ¤€ôøì(€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰±°ˆ¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•Ñ%¹Ñ•±=Á•¸¡™…±Í”¤ì(€€€Í•Ñ¥±Ñ•ÉÍ=Á•¸¡™…±Í”¤ì(€€€¹…Ù¥…Ñ”¡€½µ…Àıµ½‘”ô‘íÕÉ±MÑ…Ñ”¹µ½‘•ô™Ñ…ˆõµ…À™™¥±Ñ•Èõ±±€¤ì(€ô°m¹…Ù¥…Ñ”°ÕÉ±MÑ…Ñ”¹µ½‘•t¤ì((€½¹ÍĞ±½Í•M•±•Ñ•‘5…ÁÉ…İ•È€ôÕÍ•…±±‰…¬  ¤€ôøì(€€€¥˜€¡Í•±•Ñ•ü¹¥¤ì(€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°€‰Á…¹•±}±½Í•ˆ°€‰µ…Á}‘•Ñ…¥±}Á…¹•°ˆ°ì(€€€€€€€µ•Ñ…‘…Ñ„èì•¹Ñ¥ÑåQåÁ”è•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤°Á…¹•±MÑ…Ñ”è‘•Ñ…¥±É…İ•ÉMÑ…Ñ”ô°(€€€€€ô¤¤ì(€€€ô(€€€±•…ÉA…¹•±MÑ…¬ ¤ì(€€€¥¹-¥¹‘A…É•¹ÑI•˜¹ÕÉÉ•¹Ğ€ô¹Õ±°ì(€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É±½Í•¡ÑÉÕ”¤ì(€€€Í•ÑM•±•Ñ•‘É…İ•É5¥¹¥µ¥é•¡™…±Í”¤ì(€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€¹…Ù¥…Ñ•5…Á)½ÕÉ¹•ä (€€€€€ì(€€€€€€€µ½‘”èÕÉ±MÑ…Ñ”¹µ½‘”°(€€€€€€€Ñ…ˆè€‰µ…Àˆ°(€€€€€€€™¥±Ñ•Èè…Ñ¥Ù•¥±Ñ•Èñğ€‰±°ˆ°(€€€€€€€½±±•Ñ¥½¸èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğ€ˆˆ°(€€€€€€€ÍÑ½Á%èÕÉ±MÑ…Ñ”¹ÍÑ½Á%ñğ€ˆˆ°(€€€€€€€É½ÕÑ•MÑ…Ñ”èÕÉ±MÑ…Ñ”¹É½ÕÑ•MÑ…Ñ”ñğ€ˆˆ°(€€€€€ô°(€€€€€ì±•…ÉM•±•Ñ¥½¸èÑÉÕ”°É•Á±…”èÑÉÕ”ô(€€€€¤ì(€ô°m…Ñ¥Ù•¥±Ñ•È°±•…ÉA…¹•±MÑ…¬°‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°¹…Ù¥…Ñ•5…Á)½ÕÉ¹•ä°Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹µ½‘”°ÕÉ±MÑ…Ñ”¹Á•É­%°ÕÉ±MÑ…Ñ”¹É½ÕÑ•MÑ…Ñ”°ÕÉ±MÑ…Ñ”¹ÍÑ½Á%‘t¤ì((€½¹ÍĞ‘¥Íµ¥ÍÍY¥Í¥‰±•9…Ñ¥Ù•É…İ•È€ôÕÍ•…±±‰…¬  ¤€ôøì(€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜¹…Ñ¥Ù•É…İ•ÉMÑ…Ñ”€„ôô€‰½±±…ÁÍ•ˆ¤ì(€€€€€Í•Ñ9…Ñ¥Ù•É…İ•ÉMÑ…Ñ” ‰½±±…ÁÍ•ˆ¤ì(€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€±½Í•M•±•Ñ•‘5…ÁÉ…İ•È ¤ì(€ô°m±½Í•M•±•Ñ•‘5…ÁÉ…İ•È°¹…Ñ¥Ù•É…İ•ÉMÑ…Ñ”°ÕÉ±MÑ…Ñ”¹µ½‘•t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …Í•±•Ñ•‘%¤ì(€€€€€½¹ÍĞÑÉ¥•È€ô‘É…İ•ÉQÉ¥•ÉI•˜¹ÕÉÉ•¹Ğì(€€€€€‘É…İ•ÉQÉ¥•ÉI•˜¹ÕÉÉ•¹Ğ€ô¹Õ±°ì(€€€€€¥˜€¡ÑÉ¥•Èü¹¥Í½¹¹•Ñ•¤İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøÑÉ¥•È¹™½ÕÌü¸¡ìÁÉ•Ù•¹ÑMÉ½±°èÑÉÕ”ô¤°€À¤ì(€€€€€É•ÑÕÉ¸Õ¹‘•™¥¹•ì(€€€ô(€€€½¹ÍĞ‘É…İ•È€ô‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å% ‰‘Àµ…Ñ¥Ù”µµ…Àµ‘É…İ•Èˆ¤ì(€€€¥˜€ …‘É…İ•È¤É•ÑÕÉ¸Õ¹‘•™¥¹•ì(€€€½¹ÍĞ™½ÕÍ…‰±•M•±•Ñ½È€ô€‰ÕÑÑ½¸é¹½Ğ¡m‘¥Í…‰±•‘t¤°…m¡É•™t°¥¹ÁÕĞé¹½Ğ¡m‘¥Í…‰±•‘t¤°Í•±•Ğé¹½Ğ¡m‘¥Í…‰±•‘t¤°Ñ•áÑ…É•„é¹½Ğ¡m‘¥Í…‰±•‘t¤°mÑ…‰¥¹‘•áté¹½Ğ¡mÑ…‰¥¹‘•àôˆ´Ä‰t¤œì(€€€½¹ÍĞ™½ÕÍ…‰±•Ì€ô€ ¤€ôøÉÉ…ä¹™É½´¡‘É…İ•È¹ÅÕ•ÉåM•±•Ñ½É±°¡™½ÕÍ…‰±•M•±•Ñ½È¤¤¹™¥±Ñ•È ¡¹½‘”¤€ôø€…¹½‘”¹¡…ÍÑÑÉ¥‰ÕÑ” ‰¡¥‘‘•¸ˆ¤¤ì(€€€İ¥¹‘½Ü¹É•ÅÕ•ÍÑ¹¥µ…Ñ¥½¹É…µ”  ¤€ôø™½ÕÍ…‰±•Ì ¥lÁtü¹™½ÕÌü¸¡ìÁÉ•Ù•¹ÑMÉ½±°èÑÉÕ”ô¤¤ì(€€€¥˜€¡‘•Ñ…¥±É…İ•ÉMÑ…Ñ”€„ôô€‰™Õ±°ˆ¤É•ÑÕÉ¸Õ¹‘•™¥¹•ì((€€€½¹ÍĞÁÉ•Ù¥½ÕÍ	½‘å=Ù•É™±½Ü€ô‘½Õµ•¹Ğ¹‰½‘ä¹ÍÑå±”¹½Ù•É™±½Üì(€€€½¹ÍĞµ…ÁMÕÉ™…•Ì€ôÉÉ…ä¹™É½´¡‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½É±° ˆ¹´µÍÑå±”ˆ¤¤ì(€€€½¹ÍĞÁÉ•Ù¥½ÕÍ%¹•ÉĞ€ôµ…ÁMÕÉ™…•Ì¹µ…À ¡¹½‘”¤€ôø¹½‘”¹¥¹•ÉĞ¤ì(€€€‘½Õµ•¹Ğ¹‰½‘ä¹ÍÑå±”¹½Ù•É™±½Ü€ô€‰¡¥‘‘•¸ˆì(€€€µ…ÁMÕÉ™…•Ì¹™½É…  ¡¹½‘”¤€ôøì¹½‘”¹¥¹•ÉĞ€ôÑÉÕ”ìô¤ì((€€€™Õ¹Ñ¥½¸¡…¹‘±•Õ±±A…¹•±-•å‰½…É¡•Ù•¹Ğ¤ì(€€€€€¥˜€¡•Ù•¹Ğ¹­•ä€ôôô€‰Í…Á”ˆ¤ì(€€€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€€€±½Í•M•±•Ñ•‘5…ÁÉ…İ•È ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€¥˜€¡•Ù•¹Ğ¹­•ä€„ôô€‰Q…ˆˆ¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞ¥Ñ•µÌ€ô™½ÕÍ…‰±•Ì ¤ì(€€€€€¥˜€ …¥Ñ•µÌ¹±•¹Ñ ¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞ™¥ÉÍĞ€ô¥Ñ•µÍlÁtì(€€€€€½¹ÍĞ±…ÍĞ€ô¥Ñ•µÍm¥Ñ•µÌ¹±•¹Ñ €´€Åtì(€€€€€¥˜€¡•Ù•¹Ğ¹Í¡¥™Ñ-•ä€˜˜‘½Õµ•¹Ğ¹…Ñ¥Ù•±•µ•¹Ğ€ôôô™¥ÉÍĞ¤ì(€€€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€€€±…ÍĞ¹™½ÕÌ ¤ì(€€€€€ô•±Í”¥˜€ …•Ù•¹Ğ¹Í¡¥™Ñ-•ä€˜˜‘½Õµ•¹Ğ¹…Ñ¥Ù•±•µ•¹Ğ€ôôô±…ÍĞ¤ì(€€€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€€€™¥ÉÍĞ¹™½ÕÌ ¤ì(€€€€€ô(€€€ô((€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°¡…¹‘±•Õ±±A…¹•±-•å‰½…É¤ì(€€€É•ÑÕÉ¸€ ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½İ¸ˆ°¡…¹‘±•Õ±±A…¹•±-•å‰½…É¤ì(€€€€€‘½Õµ•¹Ğ¹‰½‘ä¹ÍÑå±”¹½Ù•É™±½Ü€ôÁÉ•Ù¥½ÕÍ	½‘å=Ù•É™±½Üì(€€€€€µ…ÁMÕÉ™…•Ì¹™½É…  ¡¹½‘”°¥¹‘•à¤€ôøì¹½‘”¹¥¹•ÉĞ€ôÁÉ•Ù¥½ÕÍ%¹•ÉÑm¥¹‘•átìô¤ì(€€€ôì(€ô°m±½Í•M•±•Ñ•‘5…ÁÉ…İ•È°‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°Í•±•Ñ•‘%‘t¤ì((€½¹ÍĞ¡…¹‘±•M•±•Ñ•‘É…İ•É±½Í•Ù•¹Ğ€ôÕÍ•…±±‰…¬ ¡•Ù•¹Ğ¤€ôøì(€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€•Ù•¹Ğ¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¤ì(€€€•Ù•¹Ğ¹¹…Ñ¥Ù•Ù•¹Ğü¹ÍÑ½Á%µµ•‘¥…Ñ•AÉ½Á……Ñ¥½¸ü¸ ¤ì(€€€±½Í•M•±•Ñ•‘5…ÁÉ…İ•È ¤ì(€ô°m±½Í•M•±•Ñ•‘5…ÁÉ…İ•Ét¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€™Õ¹Ñ¥½¸¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”¡•Ù•¹Ğ¤ì(€€€€€½¹ÍĞÑ…É•Ğ€ô•Ù•¹Ğ¹Ñ…É•Ğì(€€€€€½¹ÍĞ±½Í•Q…É•Ğ€ôÑ…É•Ğü¹±½Í•ÍĞü¸ ˆ¹‘Àµ‘É…İ•Èµ±½Í”°€¹‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ±½Í”°m‘…Ñ„µµ…Àµ‘É…İ•Èµ±½Í”ôÑÉÕ”tˆ¤ì(€€€€€¥˜€ …±½Í•Q…É•Ğ¤É•ÑÕÉ¸ì(€€€€€½¹ÍĞ¥Í9…Ñ¥Ù•±½Í•1¥¹¬€ô±½Í•Q…É•Ğ¹µ…Ñ¡•Ìü¸ ‰…m‘…Ñ„µµ…Àµ‘É…İ•Èµ±½Í”ôÑÉÕ”tˆ¤ì(€€€€€¥˜€¡¥Í9…Ñ¥Ù•±½Í•1¥¹¬¤É•ÑÕÉ¸ì(€€€€€¥˜€ …¥Í9…Ñ¥Ù•±½Í•1¥¹¬¤•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€•Ù•¹Ğ¹ÍÑ½ÁAÉ½Á……Ñ¥½¸ ¤ì(€€€€€•Ù•¹Ğ¹ÍÑ½Á%µµ•‘¥…Ñ•AÉ½Á……Ñ¥½¸ü¸ ¤ì(€€€€€±½Í•M•±•Ñ•‘5…ÁÉ…İ•È ¤ì(€€€ô((€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•É‘½İ¸ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰µ½ÕÍ•‘½İ¸ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Ñ½Õ¡ÍÑ…ÉĞˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€‘½Õµ•¹Ğ¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€É•ÑÕÉ¸€ ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•É‘½İ¸ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰µ½ÕÍ•‘½İ¸ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰Ñ½Õ¡ÍÑ…ÉĞˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€€€‘½Õµ•¹Ğ¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°¡…¹‘±•9…Ñ¥Ù•É…İ•É±½Í”°ÑÉÕ”¤ì(€€€ôì(€ô°m±½Í•M•±•Ñ•‘5…ÁÉ…İ•Ét¤ì((€™Õ¹Ñ¥½¸½Á•¹A…ÉÑ¹•ÉA…¹•°¡Á…¹•°¤ì(€€€±•…É=Á•¹5…ÁM•±•Ñ¥½¸ ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ¡Á…¹•°¤ì(€€€½¹ÍĞ½É…¹¥é…Ñ¥½¹%€ôÉ•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤ì(€€€¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ¡€½µ…Àıµ½‘”õÁ…ÉÑ¹•È™Ñ…ˆô‘íÁ…¹•±õ€°½É…¹¥é…Ñ¥½¹%¤¤ì(€ô((€™Õ¹Ñ¥½¸½Á•¹A…ÉÑ¹•É5…À¡™¥±Ñ•È€ô€‰±°ˆ¤ì(€€€±•…É=Á•¹5…ÁM•±•Ñ¥½¸ ¤ì(€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€Í•ÑÑ¥Ù•¥±Ñ•È¡™¥±Ñ•È¤ì(€€€½¹ÍĞ½É…¹¥é…Ñ¥½¹%€ôÉ•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤ì(€€€¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ¡€½µ…Àıµ½‘”õÁ…ÉÑ¹•È™Ñ…ˆõµ…À™™¥±Ñ•Èô‘í•¹½‘•UI%½µÁ½¹•¹Ğ¡™¥±Ñ•È¥õ€°½É…¹¥é…Ñ¥½¹%¤¤ì(€ô((€½¹ÍĞ‘•‘ÕÁ•½¹Í½±•%Ñ•µÌ€ô€¡¥Ñ•µÌ€ômt¤€ôøì(€€€½¹ÍĞÍ••¸€ô¹•ÜM•Ğ ¤ì(€€€É•ÑÕÉ¸¥Ñ•µÌ¹™¥±Ñ•È ¡¥Ñ•´¤€ôøì(€€€€€½¹ÍĞ­•ä€ôMÑÉ¥¹œ¡¥Ñ•´ü¹™¥±Ñ•Èñğ¥Ñ•´ü¹±…‰•°ñğ¥Ñ•´ñğ€ˆˆ¤¹ÑÉ¥´ ¤¹Ñ½1½İ•É…Í” ¤ì(€€€€€¥˜€ …­•äñğÍ••¸¹¡…Ì¡­•ä¤¤É•ÑÕÉ¸™…±Í”ì(€€€€€Í••¸¹…‘¡­•ä¤ì(€€€€€É•ÑÕÉ¸ÑÉÕ”ì(€€€ô¤ì(€ôì(€½¹ÍĞ¡•É½AÉ½µÁÑ1…‰•±Ì€ô‘•‘ÕÁ•½¹Í½±•%Ñ•µÌ (€€€ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üAIQ9I}AI=5AQL€èIM%9Q}AI=5AQL°(€€¤ì(€½¹ÍĞÁÉ¥µ…ÉåM•…É¡¥±Ñ•ÉÌ€ô‘•‘ÕÁ•½¹Í½±•%Ñ•µÌ¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üAIQ9I}MI!}%1QIL€èIM%9Q}MI!}%1QIL¤ì(€½¹ÍĞ…‘Ù…¹•‘M•…É¡¥±Ñ•ÉÌ€ô‘•‘ÕÁ•½¹Í½±•%Ñ•µÌ¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üAIQ9I}Y9}MI!}%1QIL€èIM%9Q}Y9}MI!}%1QIL¤ì(€½¹ÍĞÍ•…É¡I½±±ÕÁ1…‰•°€ôÍ¬Ñ¡”µ…Àƒ
Ü€‘í…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°ˆ€ü€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰A…ÉÑ¹•ÉÌˆ€è€‰I•Í¥‘•¹ÑÌˆ¤€è…Ñ¥Ù•¥±Ñ•Éõ€ì(€½¹ÍĞ¡…Í=Á•¹5…ÁA…¹•°€ô(€€€ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆñğ(€€€…Ñ¥Ù•	½ÑÑ½µQ…ˆ€„ôô€‰µ…Àˆñğ(€€€	½½±•…¸¡Í•±•Ñ•¤ñğ(€€€	½½±•…¸¡±ÕÍÑ•ÉÉ…İ•È¤ñğ(€€€	½½±•…¸¡…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°¤ì(€½¹ÍĞ¥Í±•…¹5…Á½µµ…¹‘Y¥•Ü€ô(€€€ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜(€€€…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…Àˆ€˜˜(€€€€…Í•±•Ñ•€˜˜(€€€€…±ÕÍÑ•ÉÉ…İ•È€˜˜(€€€€……Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€˜˜(€€€…Ñ¥Ù•¥±Ñ•È€„ôô€‰1••¹‘Ìˆ€˜˜(€€€…Ñ¥Ù•¥±Ñ•È€„ôô€‰1¥ÍÑ¥¹Ìˆì(€½¹ÍĞÍ¡½Õ±‘½±±…ÁÍ•M•…É¡½¹Í½±”€ô(€€€½¹Í½±•½±±…ÁÍ•ñğ(€€€¡…Í=Á•¹5…ÁA…¹•°ñğ(€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰1••¹‘Ìˆñğ(€€€…Ñ¥Ù•¥±Ñ•È€ôôô€‰1¥ÍÑ¥¹Ìˆì(€½¹ÍĞÍ¡½İ	½ÑÑ½µ9…Ù¥…Ñ¥½¸€ô€…ÕÉ±MÑ…Ñ”¹•µ‰•€˜˜€¡ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…ÀˆñğÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆñğ	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á…¹•±Q…ˆ¤¤ì(€ÕÍ•	½ÑÑ½µ9…Ù¥…Ñ¥½¹•½µ•ÑÉä¡Í¡½İ	½ÑÑ½µ9…Ù¥…Ñ¥½¸¤ì(€½¹ÍĞµ…ÁA…¹•±9…Ù¥…Ñ¥½¹Q¥Ñ±”€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€ü€¡ì…Ñ¥Ù¥Ñäè€‰Ñ¥Ù¥Ñäˆ°É•Á½ÉÑÌè€‰I•Á½ÉÑÌˆ°…µÁ…¥¹Ìè€‰…µÁ…¥¹Ìˆ°¥¹™¼è€‰A…ÉÑ¹•ÈÕ¥‘”ˆ°¥Ù¥Œè€‰¥Ù¥Œˆõm…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•±tñğ…Ñ¥Ù•¥±Ñ•Èñğ€‰A…ÉÑ¹•Èµ…Àˆ¤(€€€€è€¡ìÁ•É­Ìè€‰A•É­Ìˆ°•Ù•¹ÑÌè€‰Ù•¹ÑÌˆ°Í…Ù•è€‰M…Ù•ˆ°¥¹™¼è€‰Õ¥‘”ˆõm…Ñ¥Ù•	½ÑÑ½µQ…‰tñğ…Ñ¥Ù•¥±Ñ•Èñğ€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ¤ì(€½¹ÍĞ½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…”€ôÕÍ•…±±‰…¬ ¡¹½‘”¤€ôøì(€€€¥˜€ …¹½‘”ñğÑåÁ•½˜İ¥¹‘½Ü€ôôô€‰Õ¹‘•™¥¹•ˆ¤É•ÑÕÉ¸ì(€€€€¼¼…¹½¹¥…°µ…À‘•Ñ…¥°Í¡••ÑÌ…É”½Ù•É¹••¹Ñ¥É•±ä‰äÑ¡”Í¡…É•(€€€€¼¼ÍÑå±•Í¡••Ğ…¹ÍÑ…Ñ”…ÑÑÉ¥‰ÕÑ•Ì¸±•…È…¹ä±•…ä¥¹±¥¹”•½µ•ÑÉä(€€€€¼¼‰•™½É”Ñ¡”•¹•É¥Œ¹…Ñ¥Ù”µ‘É…İ•È™…±±‰…¬…¸±…¥´Ñ¡”ÍÕÉ™…”¸(€€€¥˜€¡¹½‘”¹±…ÍÍ1¥ÍĞ¹½¹Ñ…¥¹Ì ‰‘Àµµ…Àµ‘•Ñ…¥°µÍ¡••Ğˆ¤¤ì(€€€€€l‰¥¹Í•Ğˆ°€‰Ñ½Àˆ°€‰É¥¡Ğˆ°€‰‰½ÑÑ½´ˆ°€‰±•™Ğˆ°€‰Á…‘‘¥¹œ‰t¹™½É…  ¡ÁÉ½Á•ÉÑä¤€ôø¹½‘”¹ÍÑå±”¹É•µ½Ù•AÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä¤¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡¹½‘”¹±…ÍÍ1¥ÍĞ¹½¹Ñ…¥¹Ì ‰‘Àµ¹…Ñ¥Ù”µ‘É…İ•Èˆ¤¤ì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰Ñ½Àˆ°€‰…ÕÑ¼ˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰É¥¡Ğˆ°€ˆÀˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰‰½ÑÑ½´ˆ°€ˆÀˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰±•™Ğˆ°€ˆÀˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰Á…‘‘¥¹œˆ°€ˆÀ€ÀÙ…È ´µ‘Àµ‰½ÑÑ½´µ¹…ØµÑ½Ñ…°µ¡•¥¡Ğ¤ˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô((€€€½¹ÍĞ½İ¹•‘AÉ½Á•ÉÑ¥•Ì€ôl(€€€€€€‰Á½Í¥Ñ¥½¸ˆ°€‰¥¹Í•Ğˆ°€‰Ñ½Àˆ°€‰É¥¡Ğˆ°€‰‰½ÑÑ½´ˆ°€‰±•™Ğˆ°€‰İ¥‘Ñ ˆ°€‰µ¥¸µİ¥‘Ñ ˆ°€‰µ…àµİ¥‘Ñ ˆ°€‰¡•¥¡Ğˆ°€‰µ¥¸µ¡•¥¡Ğˆ°€‰µ…àµ¡•¥¡Ğˆ°(€€€€€€‰‘¥ÍÁ±…äˆ°€‰É¥µÑ•µÁ±…Ñ”µÉ½İÌˆ°€‰µ…É¥¸ˆ°€‰Á…‘‘¥¹œˆ°€‰½Ù•É™±½Üˆ°€‰‰½É‘•Èˆ°€‰‰½É‘•ÈµÉ…‘¥ÕÌˆ°€‰‰½àµÍ¡…‘½Üˆ°€‰èµ¥¹‘•àˆ°(€€€tì(€€€½¹ÍĞÁ…¹•±I…¥°€ô¹½‘”¹ÅÕ•ÉåM•±•Ñ½È ˆéÍ½Á”€ø€¹‘ÀµÁ…¹•°µÑ½½±‰…È°€éÍ½Á”€ø€¹‘ÀµÁ…¹•°µ¡•…‘•È°€éÍ½Á”€ø€¹‘Àµµ…ÀµÁ…¹•°µ¡•…‘•È°€éÍ½Á”€ø€¹‘Àµµ…Àµ‘¥É•Ñ½ÉäµÑ½½±‰…Èˆ¤ì(€€€½¹ÍĞÁ…¹•±	½‘ä€ô¹½‘”¹ÅÕ•ÉåM•±•Ñ½È ˆéÍ½Á”€ø€¹‘ÀµÁ…¹•°µ‰½‘ä°€éÍ½Á”€ø€¹‘ÀµÉ½ÕÁ•µ±¥ÍĞ°€éÍ½Á”€ø€¹‘Àµµ…ÀµÁ…¹•°µÍÉ½±°°€éÍ½Á”€ø€¹‘Àµµ…Àµ‘¥É•Ñ½Éäµ½¹Ñ•¹Ğˆ¤ì(€€€½¹ÍĞ¡¥±‘=İ¹•‘AÉ½Á•ÉÑ¥•Ì€ôl‰É¥µÉ½Üˆ°€‰É¥µ½±Õµ¸ˆ°€‰‘¥ÍÁ±…äˆ°€‰É¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìˆ°€‰…±¥¸µ¥Ñ•µÌˆ°€‰‰½àµÍ¥é¥¹œˆ°€‰İ¥‘Ñ ˆ°€‰µ¥¸µİ¥‘Ñ ˆ°€‰µ…àµİ¥‘Ñ ˆ°€‰¡•¥¡Ğˆ°€‰µ¥¸µ¡•¥¡Ğˆ°€‰µ…àµ¡•¥¡Ğˆ°€‰µ…É¥¸ˆ°€‰Á…‘‘¥¹œˆ°€‰‰½É‘•Èˆ°€‰‰½É‘•Èµ‰½ÑÑ½´ˆ°€‰‰…­É½Õ¹ˆ°€‰‰½àµÍ¡…‘½Üˆ°€‰½Ù•É™±½Üµàˆ°€‰½Ù•É™±½Üµä‰tì(€€€½İ¹•‘AÉ½Á•ÉÑ¥•Ì¹™½É…  ¡ÁÉ½Á•ÉÑä¤€ôø¹½‘”¹ÍÑå±”¹É•µ½Ù•AÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä¤¤ì(€€€mÁ…¹•±I…¥°°Á…¹•±	½‘åt¹™½É…  ¡•±•µ•¹Ğ¤€ôøì(€€€€€¡¥±‘=İ¹•‘AÉ½Á•ÉÑ¥•Ì¹™½É…  ¡ÁÉ½Á•ÉÑä¤€ôø•±•µ•¹Ğü¹ÍÑå±”¹É•µ½Ù•AÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä¤¤ì(€€€ô¤ì(€€€Á…¹•±I…¥°ü¹ÅÕ•ÉåM•±•Ñ½É±° ˆéÍ½Á”€ø‰ÕÑÑ½¸ˆ¤¹™½É…  ¡‰ÕÑÑ½¸¤€ôøì(€€€€€l‰É¥µ½±Õµ¸ˆ°€‰İ¥‘Ñ ˆ°€‰µ¥¸µİ¥‘Ñ ˆ°€‰µ…àµİ¥‘Ñ ˆ°€‰¡•¥¡Ğˆ°€‰µ¥¸µ¡•¥¡Ğˆ°€‰µ…àµ¡•¥¡Ğˆ°€‰µ…É¥¸ˆ°€‰Á…‘‘¥¹œ‰t¹™½É…  ¡ÁÉ½Á•ÉÑä¤€ôø‰ÕÑÑ½¸¹ÍÑå±”¹É•µ½Ù•AÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä¤¤ì(€€€ô¤ì(€€€½¹ÍĞ¥Í•Ñ…¥±A…¹•°€ô¹½‘”¹‘…Ñ…Í•Ğ¹Á…¹•±1…å½ÕĞ€ôôô€‰‘•Ñ…¥°ˆì(€€€½¹ÍĞ¥Í½µÁ…ÑY¥•İÁ½ÉĞ€ôİ¥¹‘½Ü¹µ…Ñ¡5•‘¥„ ˆ¡µ…àµİ¥‘Ñ è€ÜØİÁà¤ˆ¤¹µ…Ñ¡•Ìì(€€€½¹ÍĞ‘•Ñ…¥±!•¥¡Ğ€ô€‰µ¥¸ Üá‘Ù °…±Œ ÄÀÁ‘Ù €´€ÜÙÁà€´•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´°€ÁÁà¤¤¤ˆì(€€€½¹ÍĞ‘•Ñ…¥±]¥‘Ñ €ô¥Í½µÁ…ÑY¥•İÁ½ÉĞ€ü€ˆÄÀÁ‘ÙÜˆ€è€‰µ¥¸ ÜØÁÁà°€ÄÀÁ‘ÙÜ¤ˆì(€€€½¹ÍĞÁ…¹•±•½µ•ÑÉä€ôì(€€€€€Á½Í¥Ñ¥½¸è€‰™¥á•ˆ°(€€€€€¥¹Í•Ğè€‰…ÕÑ¼ˆ°(€€€€€Ñ½Àè¥Í•Ñ…¥±A…¹•°€ü€‰…ÕÑ¼ˆ€è€ˆÀˆ°(€€€€€É¥¡Ğè€ˆÀˆ°(€€€€€‰½ÑÑ½´è€‰…±Œ ØÑÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´°€ÁÁà¤¤ˆ°(€€€€€±•™Ğè€ˆÀˆ°(€€€€€İ¥‘Ñ è¥Í•Ñ…¥±A…¹•°€ü‘•Ñ…¥±]¥‘Ñ €è€ˆÄÀÁ‘ÙÜˆ°(€€€€€€‰µ¥¸µİ¥‘Ñ ˆè¥Í•Ñ…¥±A…¹•°€ü€ˆÀˆ€è€ˆÄÀÁ‘ÙÜˆ°(€€€€€€‰µ…àµİ¥‘Ñ ˆè¥Í•Ñ…¥±A…¹•°€ü‘•Ñ…¥±]¥‘Ñ €è€ˆÄÀÁ‘ÙÜˆ°(€€€€€¡•¥¡Ğè¥Í•Ñ…¥±A…¹•°€ü‘•Ñ…¥±!•¥¡Ğ€è€‰…±Œ ÄÀÁ‘Ù €´€ØÑÁà€´•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´°€ÁÁà¤¤ˆ°(€€€€€€‰µ¥¸µ¡•¥¡Ğˆè¥Í•Ñ…¥±A…¹•°€ü€ˆÀˆ€è€‰…±Œ ÄÀÁ‘Ù €´€ØÑÁà€´•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´°€ÁÁà¤¤ˆ°(€€€€€€‰µ…àµ¡•¥¡Ğˆè¥Í•Ñ…¥±A…¹•°€ü‘•Ñ…¥±!•¥¡Ğ€è€‰…±Œ ÄÀÁ‘Ù €´€ØÑÁà€´•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´°€ÁÁà¤¤ˆ°(€€€€€‘¥ÍÁ±…äè€‰É¥ˆ°(€€€€€€‰É¥µÑ•µÁ±…Ñ”µÉ½İÌˆè€‰…±Œ ÔÙÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•ĞµÑ½À°€ÁÁà¤¤µ¥¹µ…à À°€Å™È¤ˆ°(€€€€€µ…É¥¸è€ˆÀˆ°(€€€€€Á…‘‘¥¹œè€ˆÀˆ°(€€€€€½Ù•É™±½Üè€‰¡¥‘‘•¸ˆ°(€€€€€€‰èµ¥¹‘•àˆè€ˆÄÔÀÀˆ°(€€€ôì((€€€=‰©•Ğ¹•¹ÑÉ¥•Ì¡Á…¹•±•½µ•ÑÉä¤¹™½É…  ¡mÁÉ½Á•ÉÑä°Ù…±Õ•t¤€ôøì(€€€€€¹½‘”¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä°Ù…±Õ”°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€€€ô¤ì((€€€½¹ÍĞ…ÁÁ±å%µÁ½ÉÑ…¹Ğ€ô€¡•±•µ•¹Ğ°ÁÉ½Á•ÉÑ¥•Ì¤€ôøì(€€€€€=‰©•Ğ¹•¹ÑÉ¥•Ì¡ÁÉ½Á•ÉÑ¥•Ì¤¹™½É…  ¡mÁÉ½Á•ÉÑä°Ù…±Õ•t¤€ôø•±•µ•¹Ğü¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä¡ÁÉ½Á•ÉÑä°Ù…±Õ”°€‰¥µÁ½ÉÑ…¹Ğˆ¤¤ì(€€€ôì(€€€…ÁÁ±å%µÁ½ÉÑ…¹Ğ¡Á…¹•±I…¥°°ì(€€€€€€‰É¥µÉ½Üˆè€ˆÄˆ°(€€€€€‘¥ÍÁ±…äè€‰É¥ˆ°(€€€€€€‰É¥µÑ•µÁ±…Ñ”µ½±Õµ¹Ìˆè€ˆĞÑÁàµ¥¹µ…à À°€Å™È¤€ĞÑÁàˆ°(€€€€€€‰…±¥¸µ¥Ñ•µÌˆè€‰•¹Ñ•Èˆ°(€€€€€€‰‰½àµÍ¥é¥¹œˆè€‰‰½É‘•Èµ‰½àˆ°(€€€€€İ¥‘Ñ è€ˆÄÀÀ”ˆ°(€€€€€€‰µ¥¸µİ¥‘Ñ ˆè€ˆÀˆ°(€€€€€€‰µ…àµİ¥‘Ñ ˆè€‰¹½¹”ˆ°(€€€€€¡•¥¡Ğè€‰…±Œ ÔÙÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•ĞµÑ½À°€ÁÁà¤¤ˆ°(€€€€€€‰µ¥¸µ¡•¥¡Ğˆè€‰…±Œ ÔÙÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•ĞµÑ½À°€ÁÁà¤¤ˆ°(€€€€€€‰µ…àµ¡•¥¡Ğˆè€‰…±Œ ÔÙÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•ĞµÑ½À°€ÁÁà¤¤ˆ°(€€€€€µ…É¥¸è€ˆÀˆ°(€€€€€Á…‘‘¥¹œè€‰…±Œ ÙÁà€¬•¹Ø¡Í…™”µ…É•„µ¥¹Í•ĞµÑ½À°€ÁÁà¤¤€áÁà€ÙÁàˆ°(€€€€€‰½É‘•Èè€ˆÀˆ°(€€€€€€‰‰½É‘•Èµ‰½ÑÑ½´ˆè€ˆÀˆ°(€€€€€‰…­É½Õ¹è€‰ÑÉ…¹ÍÁ…É•¹Ğˆ°(€€€€€€‰‰½àµÍ¡…‘½Üˆè€‰¹½¹”ˆ°(€€€ô¤ì(€€€½¹ÍĞÉ…¥±	ÕÑÑ½¹Ì€ôÁ…¹•±I…¥°€üÉÉ…ä¹™É½´¡Á…¹•±I…¥°¹ÅÕ•ÉåM•±•Ñ½É±° ˆéÍ½Á”€ø‰ÕÑÑ½¸ˆ¤¤€èmtì(€€€É…¥±	ÕÑÑ½¹Ì¹™½É…  ¡‰ÕÑÑ½¸°¥¹‘•à¤€ôøì(€€€€€…ÁÁ±å%µÁ½ÉÑ…¹Ğ¡‰ÕÑÑ½¸°ì(€€€€€€€€‰É¥µ½±Õµ¸ˆè¥¹‘•à€ôôô€À€ü€ˆÄˆ€è¥¹‘•à€ôôôÉ…¥±	ÕÑÑ½¹Ì¹±•¹Ñ €´€Ä€ü€ˆÌˆ€è€‰…ÕÑ¼ˆ°(€€€€€€€İ¥‘Ñ è€ˆĞÑÁàˆ°(€€€€€€€€‰µ¥¸µİ¥‘Ñ ˆè€ˆĞÑÁàˆ°(€€€€€€€€‰µ…àµİ¥‘Ñ ˆè€ˆĞÑÁàˆ°(€€€€€€€¡•¥¡Ğè€ˆĞÑÁàˆ°(€€€€€€€€‰µ¥¸µ¡•¥¡Ğˆè€ˆĞÑÁàˆ°(€€€€€€€€‰µ…àµ¡•¥¡Ğˆè€ˆĞÑÁàˆ°(€€€€€€€µ…É¥¸è€ˆÀˆ°(€€€€€€€Á…‘‘¥¹œè€ˆÀˆ°(€€€€€ô¤ì(€€€ô¤ì(€€€…ÁÁ±å%µÁ½ÉÑ…¹Ğ¡Á…¹•±	½‘ä°ì(€€€€€€‰É¥µÉ½Üˆè€ˆÈˆ°(€€€€€İ¥‘Ñ è€ˆÄÀÀ”ˆ°(€€€€€€‰µ¥¸µİ¥‘Ñ ˆè€ˆÀˆ°(€€€€€€‰µ…àµİ¥‘Ñ ˆè€‰¹½¹”ˆ°(€€€€€¡•¥¡Ğè€ˆÄÀÀ”ˆ°(€€€€€€‰µ¥¸µ¡•¥¡Ğˆè€ˆÀˆ°(€€€€€€‰µ…àµ¡•¥¡Ğˆè€‰¹½¹”ˆ°(€€€€€µ…É¥¸è€ˆÀˆ°(€€€€€€‰½Ù•É™±½Üµàˆè€‰¡¥‘‘•¸ˆ°(€€€€€€‰½Ù•É™±½Üµäˆè€‰…ÕÑ¼ˆ°(€€€ô¤ì((€€€€¼¼=±‘•Èµ…À½¹Ñ…¥¹µ•¹ĞÍÑå±•ÌÕÍ”¥¹Ñ•¹Ñ¥½¹…±±ä¡¥ ÍÁ•¥™¥¥Ñä¸%¹±¥¹”(€€€€¼¼ÁÉ¥½É¥Ñä­••ÁÌ•Ù•Éä…Ñ¥Ù”Á…¹•°½¸Ñ¡”Í…µ”Ù¥•İÁ½ÉĞµÍ…™”ÍÕÉ™…”¸(€€€½¹ÍĞ¥¹¹•É½¹ÑÉ½±Ì€ô¹½‘”¹ÅÕ•ÉåM•±•Ñ½È ˆ¹‘Àµµ…ÀµÁ…¹•°µÍÉ½±°€¹‘Àµ•¹Ñ¥Ñäµ‘É…İ•È€ø€¹‘Àµ‘É…İ•Èµ½¹ÑÉ½°µÉ½Üé™¥ÉÍĞµ¡¥±ˆ¤ì(€€€¥¹¹•É½¹ÑÉ½±Ìü¹ÍÑå±”¹Í•ÑAÉ½Á•ÉÑä ‰‘¥ÍÁ±…äˆ°€‰¹½¹”ˆ°€‰¥µÁ½ÉÑ…¹Ğˆ¤ì(€ô°mt¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€½¹ÍĞÉ•™É•Í¡5½‰¥±•A…¹•±Ì€ô€ ¤€ôøì(€€€€€‘½Õµ•¹Ğ¹ÅÕ•ÉåM•±•Ñ½É±° ‰m‘…Ñ„µµ½‰¥±”µÁ…¹•°µÍÕÉ™…”ôÑÉÕ”tˆ¤¹™½É… ¡½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…”¤ì(€€€ôì(€€€É•™É•Í¡5½‰¥±•A…¹•±Ì ¤ì(€€€İ¥¹‘½Ü¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰É•Í¥é”ˆ°É•™É•Í¡5½‰¥±•A…¹•±Ì¤ì(€€€É•ÑÕÉ¸€ ¤€ôøİ¥¹‘½Ü¹É•µ½Ù•Ù•¹Ñ1¥ÍÑ•¹•È ‰É•Í¥é”ˆ°É•™É•Í¡5½‰¥±•A…¹•±Ì¤ì(€ô°m½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…•t¤ì((€½¹ÍĞ•µ‰•‘1½…‘Ù•¹Ñ-•åI•˜€ôÕÍ•I•˜ ˆˆ¤ì(€½¹ÍĞ™Õ±±5…Á!É•˜€ôÕÍ•5•µ¼  ¤€ôøì(€€€½¹ÍĞÁ…É…µÌ€ô¹•ÜUI1M•…É¡A…É…µÌ¡ÑåÁ•½˜İ¥¹‘½Ü€„ôô€‰Õ¹‘•™¥¹•ˆ€üİ¥¹‘½Ü¹±½…Ñ¥½¸¹Í•…É €è€ˆˆ¤ì(€€€Á…É…µÌ¹‘•±•Ñ” ‰•µ‰•ˆ¤ì(€€€É•ÑÕÉ¸€½µ…Àü‘íÁ…É…µÌ¹Ñ½MÑÉ¥¹œ ¥õ€ì(€ô°mÕÉ±MÑ…Ñ”¹•µ‰•‘t¤ì((€ÕÍ•™™•Ğ  ¤€ôøì(€€€¥˜€ …ÕÉ±MÑ…Ñ”¹•µ‰•¤É•ÑÕÉ¸ì(€€€½¹ÍĞ•Ù•¹Ñ-•ä€ôl(€€€€€ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%°(€€€€€ÕÉ±MÑ…Ñ”¹…µÁ…¥¹%°(€€€€€ÕÉ±MÑ…Ñ”¹Á…ÉÑ¹•É%°(€€€€€ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°(€€€€€ÕÉ±MÑ…Ñ”¹É½ÕÑ”°(€€€€€ÕÉ±MÑ…Ñ”¹Í½ÕÉ”°(€€€€€ÕÉ±MÑ…Ñ”¹ÕÑµ…µÁ…¥¸°(€€€€€‘¥ÍÑÉ¥Ğ°(€€€t¹©½¥¸ ‰ğˆ¤ì(€€€¥˜€¡•µ‰•‘1½…‘Ù•¹Ñ-•åI•˜¹ÕÉÉ•¹Ğ€ôôô•Ù•¹Ñ-•ä¤É•ÑÕÉ¸ì(€€€•µ‰•‘1½…‘Ù•¹Ñ-•åI•˜¹ÕÉÉ•¹Ğ€ô•Ù•¹Ñ-•äì(€€€™¥É•]½É­™±½Ü ˆ½…Á¤½•Ù•¹ÑÌˆ°ì(€€€€€ÑåÁ”è€‰•µ‰•¹±½…‘•ˆ°(€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€•¹Ñ¥Ñå%èÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%ñğÕ¹‘•™¥¹•°(€€€€€…µÁ…¥¹%èÕÉ±MÑ…Ñ”¹…µÁ…¥¹%ñğÕ¹‘•™¥¹•°(€€€€€Á…ÉÑ¹•É%èÕÉ±MÑ…Ñ”¹Á…ÉÑ¹•É%ñğÕ¹‘•™¥¹•°(€€€€€‘¥ÍÑÉ¥Ğè¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€üÕ¹‘•™¥¹•€è‘¥ÍÑÉ¥Ğ°(€€€€€Í½ÕÉ”èÕÉ±MÑ…Ñ”¹Í½ÕÉ”°(€€€€€µ•Ñ…‘…Ñ„èì(€€€€€€€½±±•Ñ¥½¹%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğÕ¹‘•™¥¹•°(€€€€€€€É½ÕÑ•%èÕÉ±MÑ…Ñ”¹É½ÕÑ”ñğÕ¹‘•™¥¹•°(€€€€€€€ÕÑµ…µÁ…¥¸èÕÉ±MÑ…Ñ”¹ÕÑµ…µÁ…¥¸ñğÕ¹‘•™¥¹•°(€€€€€ô°(€€€ô¤ì(€ô°m‘¥ÍÑÉ¥Ğ°ÕÉ±MÑ…Ñ”¹…µÁ…¥¹%°ÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸°ÕÉ±MÑ…Ñ”¹•µ‰•°ÕÉ±MÑ…Ñ”¹•¹Ñ¥Ñå%°ÕÉ±MÑ…Ñ”¹Á…ÉÑ¹•É%°ÕÉ±MÑ…Ñ”¹É½ÕÑ”°ÕÉ±MÑ…Ñ”¹Í½ÕÉ”°ÕÉ±MÑ…Ñ”¹ÕÑµ…µÁ…¥¹t¤ì((€É•ÑÕÉ¸€ (€€€€ñ‘¥Ø(€€€€€±…ÍÍ9…µ”õí‘Àµµ…ÀµÁ…”É•±…Ñ¥Ù” µÍÉ••¸½Ù•É™±½Üµ¡¥‘‘•¸‰œµİ¡¥Ñ”Ñ•áĞµlŒÁÅÌÍt€‘íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰‘Àµµ…ÀµÁ…”µÁ…ÉÑ¹•Èˆ€è€‰‘Àµµ…ÀµÁ…”µÉ•Í¥‘•¹Ğ‰ô€‘íÕÉ±MÑ…Ñ”¹•µ‰•€ü€‰‘Àµµ…ÀµÁ…”µ•µ‰•‘‘•ˆ€è€ˆ‰õô(€€€€€‘…Ñ„µµ…Àµé½½´õíµ…Ái½½´¹Ñ½¥á• È¥ô(€€€€€‘…Ñ„µÑ½Àµµ…Àµ‰…¬ô‰™…±Í”ˆ(€€€€ø(€€€€€íÕÉ±MÑ…Ñ”¹•µ‰•€ü€ (€€€€€€€€ñ¡•…‘•È±…ÍÍ9…µ”ô‰‘Àµ•µ‰•µµ…Àµ¡•…‘•Èˆø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ•µ‰•µµ…Àµ¡•…‘•É}}‰É…¹ˆø(€€€€€€€€€€€€ñÍÑÉ½¹œù½İ¹Ñ½İ¸A•É­Ìğ½ÍÑÉ½¹œø(€€€€€€€€€€€€ñÍÁ…¸ùí…Ñ¥Ù•½±±•Ñ¥½¸ü¹Ñ¥Ñ±”ñğ€¡¥Í±±9•¥¡‰½É¡½½‘M½Á”¡‘¥ÍÑÉ¥Ğ¤€ü€‰½İ¹Ñ½İ¸ÕÍÑ¥¸ˆ€è‘¥ÍÑÉ¥Ğ¥ôğ½ÍÁ…¸ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ•µ‰•µµ…Àµ¡•…‘•É}}ÍÕµµ…Éäˆø(€€€€€€€€€€€€ñÍÁ…¸ùí½¹Ñ•áÑ½Õ¹Ñôí½¹Ñ•áÑ½Õ¹Ğ€ôôô€Ä€ü€‰Á±…”ˆ€è€‰Á±…•Ì‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹Í½ÕÉ”€„ôô€‰•µ‰•‘‘•µµ…Àˆ€ü€ñÍÁ…¸ùÉ½´íÕÉ±MÑ…Ñ”¹Í½ÕÉ”¹É•Á±…” ¼´½œ°€ˆ€ˆ¥ôğ½ÍÁ…¸ø€è¹Õ±±ô(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ñ„(€€€€€€€€€€€¡É•˜õí™Õ±±5…Á!É•™ô(€€€€€€€€€€€Ñ…É•Ğô‰}‰±…¹¬ˆ(€€€€€€€€€€€É•°ô‰¹½É•™•ÉÉ•Èˆ(€€€€€€€€€€€½¹±¥¬õì ¤€ôø™¥É•]½É­™±½Ü ˆ½…Á¤½•Ù•¹ÑÌˆ°ì(€€€€€€€€€€€€€ÑåÁ”è€‰•µ‰•¹½Á•¹•‘}™Õ±±}µ…Àˆ°(€€€€€€€€€€€€€Í•ÍÍ¥½¹%è•Ñ]½É­™±½İM•ÍÍ¥½¹% ¤°(€€€€€€€€€€€€€Í½ÕÉ”èÕÉ±MÑ…Ñ”¹Í½ÕÉ”°(€€€€€€€€€€€€€…µÁ…¥¹%èÕÉ±MÑ…Ñ”¹…µÁ…¥¹%ñğÕ¹‘•™¥¹•°(€€€€€€€€€€€€€Á…ÉÑ¹•É%èÕÉ±MÑ…Ñ”¹Á…ÉÑ¹•É%ñğÕ¹‘•™¥¹•°(€€€€€€€€€€€€€µ•Ñ…‘…Ñ„èì½±±•Ñ¥½¹%èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸ñğÕ¹‘•™¥¹•°É½ÕÑ•%èÕÉ±MÑ…Ñ”¹É½ÕÑ”ñğÕ¹‘•™¥¹•ô°(€€€€€€€€€€€ô¥ô(€€€€€€€€€€ø(€€€€€€€€€€€=Á•¸™Õ±°µ…À€ñÉÉ½İI¥¡Ğ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€ğ½„ø(€€€€€€€€ğ½¡•…‘•Èø(€€€€€€¤€è¹Õ±±ô(€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰…‰Í½±ÕÑ”¥¹Í•Ğµà´À‰½ÑÑ½´´ÀÑ½À´Àˆø(€€€€€€€€ñ½½±•5…ÁÉÉ½É	½Õ¹‘…Éäø(€€€€€€€€€€ñ½½±•5…Á…¹Ù…Ì(€€€€€€€€€€€•¹Ñ•Èõí¥¹¥Ñ¥…±5…ÁY¥•Ü¹•¹Ñ•Éô(€€€€€€€€€€€é½½´õí¥¹¥Ñ¥…±5…ÁY¥•Ü¹é½½µô(€€€€€€€€€€€µ…É­•É1…å½ÕÑi½½´õíµ…É­•É1…å½ÕÑ½¹Ñ•áĞ¹é½½µô(€€€€€€€€€€€µ…Á%Ñ•µÌõí±ÕÍÑ•É•‘5…Á%Ñ•µÍô(€€€€€€€€€€€½±±•Ñ¥½¹I½ÕÑ”õí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€™¥ÑA±…•Ìõí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €ü…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”¹ÍÑ½ÁÌ€è‘¥Í½Ù•É¥ÍÁ±…åA±…•Íô(€€€€€€€€€€€™¥ÑÑ¥Ù•-•äõíµ…ÁI•ÍÕ±Ñ	½Õ¹‘Í-•åô(€€€€€€€€€€€™¥Ñ¹…‰±•õí¡…ÍÑ¥Ù•…Ñ•½ÉåM½Á”€˜˜€…¥Í±•…¹I•Í¥‘•¹ÑA•É­Í1…Õ¹ €˜˜€…ÕÍ•É!…Í9…Ù¥…Ñ•‘5…À€˜˜€…¥ÍMÑÉ••Ñ1•Ù•±5…ÁY¥•İô(€€€€€€€€€€€Í•±•Ñ•õíÍ•±•Ñ•‘ô(€€€€€€€€€€€Í•±•Ñ•‘%õíÍ•±•Ñ•‘%‘ô(€€€€€€€€€€€ÁÕ±Í¥¹A¥¹%õíÁÕ±Í¥¹A¥¹%‘ô(€€€€€€€€€€€½¹M•±•Ğõí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €ü™½ÕÍ½±±•Ñ¥½¹MÑ½À€èÍ•±•ÑA±…•ô(€€€€€€€€€€€½¹M•±•Ñ9•…É•ÍÑ1••¹‘ÌõíÍ•±•Ñ9•…É•ÍÑ1••¹‘Í1¥ÍÑ¥¹ô(€€€€€€€€€€€½¹±ÕÍÑ•É=Á•¸õí½Á•¹±ÕÍÑ•ÉÉ…İ•Éô(€€€€€€€€€€€½¹i½½µ¡…¹”õì¡¹•áÑi½½´¤€ôøÍ•Ñ5…Ái½½´ ¡ÕÉÉ•¹Ğ¤€ôø€¡5…Ñ ¹…‰Ì¡ÕÉÉ•¹Ğ€´¹•áÑi½½´¤€ø€À¸ÀÄ€ü¹•áÑi½½´€èÕÉÉ•¹Ğ¤¥ô(€€€€€€€€€€€½¹Y¥•İÁ½ÉÑ¡…¹”õíÕÁ‘…Ñ•Y¥•İÁ½ÉÑ	½Õ¹‘Íô(€€€€€€€€€€€½¹UÍ•É9…Ù¥…Ñ”õì ¤€ôøì(€€€€€€€€€€€€€ÑÉäì(€€€€€€€€€€€€€€€İ¥¹‘½Ü¹Í•ÍÍ¥½¹MÑ½É…”¹Í•Ñ%Ñ•´¡5A}UMI}9Y%Q}MQ=I}-d°€‰ÑÉÕ”ˆ¤ì(€€€€€€€€€€€€€ô…Ñ ì(€€€€€€€€€€€€€€€€¼¼M•ÍÍ¥½¸ÍÑ½É…”¥Ì‰•ÍĞµ•™™½ÉĞ½¹±ä¸(€€€€€€€€€€€€€ô(€€€€€€€€€€€€€Í•ÑUÍ•É!…Í9…Ù¥…Ñ•‘5…À¡ÑÉÕ”¤ì(€€€€€€€€€€€õô(€€€€€€€€€€€½¹	É½İÍ•A•É­Ìõì ¤€ôøì(€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰A•É­Ìˆ¤ì(€€€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰Á•É­Ìˆ¤ì(€€€€€€€€€€€€€¹…Ù¥…Ñ” ˆ½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõµ…À™™¥±Ñ•ÈõA•É­Ìˆ¤ì(€€€€€€€€€€€õô(€€€€€€€€€€¼ø(€€€€€€€€ğ½½½±•5…ÁÉÉ½É	½Õ¹‘…Éäø(€€€€€€ğ½‘¥Øø((€€€€€íÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €˜˜€ …Í•±•Ñ•ñğÍ•±•Ñ•‘É…İ•É±½Í•ñğ	½½±•…¸¡ÕÉ±MÑ…Ñ”¹‘É…İ•É±½Í•¤¤€ü€ (€€€€€€€€ñI½ÕÑ•áÁ•É¥•¹•M¡••Ğ(€€€€€€€€€É½ÕÑ”õí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€É½ÕÑ•MÑ…Ñ”õíÕÉ±MÑ…Ñ”¹É½ÕÑ•MÑ…Ñ•ô(€€€€€€€€€Í•±•Ñ•‘MÑ½Á%õíÕÉ±MÑ…Ñ”¹ÍÑ½Á%ñğÍ•±•Ñ•‘%‘ô(€€€€€€€€€É•±…Ñ•‘I½ÕÑ•Ìõí…Ñ¥Ù•I•±…Ñ•‘I½ÕÑ•Íô(€€€€€€€€€½¹M•±•ÑMÑ½Àõí™½ÕÍ½±±•Ñ¥½¹MÑ½Áô(€€€€€€€€€½¹=Á•¹MÑ½Àõí½Á•¹½±±•Ñ¥½¹MÑ½Áô(€€€€€€€€€½¹AÉ¥µ…ÉåÑ¥½¸õíÍÑ…ÉÑ½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€½¹=Á•¹I•±…Ñ•‘I½ÕÑ”õí½Á•¹½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€½¹á¥Ğõí•á¥Ñ½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€¼ø(€€€€€€¤€è¹Õ±±ô((€€€€€íÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜€ (€€€€€€€€ñ‘¥Ø(€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ•…É µ…¹¡½ÈÁ½¥¹Ñ•Èµ•Ù•¹ÑÌµ¹½¹”…‰Í½±ÕÑ”¥¹Í•Ğµà´ÀÑ½ÀµlÜÉÁátèµlØàÁtÁà´È¸ÔµéÑ½ÀµlàÁÁátµéÁà´Ôˆ(€€€€€€€€ø(€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÑ½Àµ¹…Øˆø(€€€€€€€€€€€€ñ5…ÁM•…É¡½¹Í½±”(€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€ÅÕ•ÉäõíÍ•…É¡ô(€€€€€€€€€€€€€Á±…•¡½±‘•ÈõíÍ•…É¡A±…•¡½±‘•Éô(€€€€€€€€€€€€€…Ñ¥Ù•%¹Ñ•¹ĞõíÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€üÕÉ±MÑ…Ñ”¹¥¹Ñ•¹Ğ€èÉ•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¹¥¹Ñ•¹Ñô(€€€€€€€€€€€€€…Ñ¥Ù•Q¥µ”õíÉ•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¹Ñ¥µ•ô(€€€€€€€€€€€€€…Ñ¥Ù•I…‘¥ÕÌõíÉ…‘¥ÕÍô(€€€€€€€€€€€€€…Ñ¥Ù•¥±Ñ•Èõí…Ñ¥Ù•¥±Ñ•Éô(€€€€€€€€€€€€€…Ñ¥Ù•½±±•Ñ¥½¸õíÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¹ô(€€€€€€€€€€€€€É•ÍÕ±Ñ½Õ¹Ğõíµ…ÁA±…•Ì¹±•¹Ñ¡ô(€€€€€€€€€€€€€Ù¥Í¥‰±•I•ÍÕ±Ñ%‘Ìõíµ…ÁA±…•Ì¹™±…Ñ5…À ¡Á±…”¤€ôømÁ±…”¹¥°Á±…”¹•¹Ñ¥Ñå}¥°Á±…”¹•¹Ñ¥Ñå%‘t¤¹™¥±Ñ•È¡	½½±•…¸¥ô(€€€€€€€€€€€€€É•ÅÕ•ÍÑMÑ…ÑÕÌõíÍ½Á•‘I•ÅÕ•ÍÑMÑ…ÑÕÍô(€€€€€€€€€€€€€±…ÍÑQÉ¥•ÈõíÍ½Á•‘1…ÍÑQÉ¥•Éô(€€€€€€€€€€€€€…Ñ…±½MÑ…Ñ”õí…Ñ…±½MÑ…Ñ•ô(€€€€€€€€€€€€€½¹…Ñ…±½I•ÍÕ±ÑM•±•ĞõíÍ•±•Ñ…Ñ…±½I•ÍÕ±Ñô(€€€€€€€€€€€€€¥¹ÁÕÑI•˜õíÍ•…É¡%¹ÁÕÑI•™ô(€€€€€€€€€€€€€½¹EÕ•Éå¡…¹”õì¡Ù…±Õ”¤€ôøì(€€€€€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¤ì(€€€€€€€€€€€€€€€Í•ÑM•…É ¡Ù…±Õ”¤ì(€€€€€€€€€€€€€€€¥˜€¡µ…Á¹Íİ•È¤Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€õô(€€€€€€€€€€€€€½¹MÕ‰µ¥Ğõì¡•Ù•¹Ğ¤€ôøì(€€€€€€€€€€€€€€€Ù½¥ÉÕ¹M•…É ¡•Ù•¹Ğ¤ì(€€€€€€€€€€€€€õô(€€€€€€€€€€€€€½¹±•…Èõí±•…ÉI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ñô(€€€€€€€€€€€€€½¹%¹Ñ•¹ÑM•±•Ğõí…ÁÁ±åI•Í¥‘•¹Ñ%¹Ñ•¹Ñô(€€€€€€€€€€€€€½¹¥±Ñ•ÉM•±•Ğõí…ÁÁ±åI•Í¥‘•¹Ñ½¹Í½±•¥±Ñ•Éô(€€€€€€€€€€€€€½¹Q¥µ•M•±•Ğõí…ÁÁ±åI•Í¥‘•¹ÑQ¥µ•ô(€€€€€€€€€€€€€½¹I…‘¥ÕÍM•±•Ğõí…ÁÁ±åI•Í¥‘•¹ÑI…‘¥ÕÍô(€€€€€€€€€€€€€½¹½±±•Ñ¥½¹M•±•Ğõì¡½±±•Ñ¥½¸°¥Ñ•´¤€ôø½Á•¹½±±•Ñ¥½¹I½ÕÑ”¡½±±•Ñ¥½¸°¥Ñ•´ü¹ÁÉ½µÁĞñğ¥Ñ•´ü¹±…‰•°ñğ€ˆˆ¥ô(€€€€€€€€€€€€€½¹AÉ½µÁÑM•±•Ğõì¡ÁÉ½µÁĞ¤€ôøì(€€€€€€€€€€€€€€€Í•ÑI•Í¥‘•¹ÑM•…É¡%¹Ñ•¹Ğ¡ì¥¹Ñ•¹Ğè¹Õ±°°Ñ¥µ”è¹Õ±°ô¤ì(€€€€€€€€€€€€€€€Ù½¥…ÁÁ±åAÉ½µÁĞ¡ÁÉ½µÁĞ¤ì(€€€€€€€€€€€€€õô(€€€€€€€€€€€€€½¹5½‘•¡…¹”õì¡µ½‘”¤€ôøì(€€€€€€€€€€€€€€€¥˜€¡µ½‘”€ôôôÕÉ±MÑ…Ñ”¹µ½‘”¤É•ÑÕÉ¸ì(€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€€€€€€€€€€€Í•ÑM•…É  ˆˆ¤ì(€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•¥±Ñ•È ‰±°ˆ¤ì(€€€€€€€€€€€€€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€€€€€€€€€€€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€€€€€€€€€€€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€€€±•…ÉM½Á•‘5…ÁI•ÍÕ±ÑÌ ¤ì(€€€€€€€€€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì(€€€€€€€€€€€€€€€€€µ½‘”°(€€€€€€€€€€€€€€€€€Ñ…ˆè€‰µ…Àˆ°(€€€€€€€€€€€€€€€€€™¥±Ñ•Èè€‰±°ˆ°(€€€€€€€€€€€€€€€€€ÅÕ•Éäè€ˆˆ°(€€€€€€€€€€€€€€€€€Äè€ˆˆ°(€€€€€€€€€€€€€€€€€ÁÉ½µÁĞè€ˆˆ°(€€€€€€€€€€€€€€€€€¥¹Ñ•¹Ğè€ˆˆ°(€€€€€€€€€€€€€€€€€•¹Ñ¥Ñå%è€ˆˆ°(€€€€€€€€€€€€€€€€€•¹Ñ¥ÑåQåÁ”è€ˆˆ°(€€€€€€€€€€€€€€€€€½±±•Ñ¥½¸è€ˆˆ°(€€€€€€€€€€€€€€€ô¤ì(€€€€€€€€€€€€€õô(€€€€€€€€€€€€€¥Í½±±…ÁÍ•õíÍ¡½Õ±‘½±±…ÁÍ•M•…É¡½¹Í½±•ô(€€€€€€€€€€€€€½¹½±±…ÁÍ”õì ¤€ôøÍ•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¥ô(€€€€€€€€€€€€€½¹áÁ…¹õì ¤€ôøÍ•Ñ½¹Í½±•½±±…ÁÍ•¡™…±Í”¥ô(€€€€€€€€€€€€€¡…ÍQ½Á5…Á	…¬õí™…±Í•ô(€€€€€€€€€€€€¼ø(€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€ğ½‘¥Øø(€€€€€€¥ô((€€€€€íÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆ€˜˜ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜€ (€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Á½¥¹Ñ•Èµ•Ù•¹ÑÌµ¹½¹”…‰Í½±ÕÑ”¥¹Í•Ğ´ÀèµlÔĞÁt™±•à¥Ñ•µÌµ•¹©ÕÍÑ¥™äµ•¹Ñ•È‰œµlŒÁÅÌÍt¼ÄÀÀ´È‰…­‘É½Àµ‰±ÕÈµlÉÁátÍ´éÀ´Ğµé¥Ñ•µÌµ•¹Ñ•Èˆø(€€€€€€€€€€ñµ½Ñ¥½¸¹Í•Ñ¥½¸(€€€€€€€€€€€¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÈĞ°Í…±”è€À¸äàõô(€€€€€€€€€€€…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€À°Í…±”è€Äõô(€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µÍ¡•±°‘ÀµÁ…ÍÌµÁ…¹•°Á½¥¹Ñ•Èµ•Ù•¹ÑÌµ…ÕÑ¼™±•àµ…àµ µm…±Œ ÄÀÁ‘Ù ´ÄÉÁà¥tÜµ™Õ±°µ…àµÜµá°™±•àµ½°½Ù•É™±½Üµ¡¥‘‘•¸É½Õ¹‘•µĞµlÄÉÁátÀ´Àµéµ…àµ µm…±Œ ÄÀÁ‘Ù ´ÉÉ•´¥tµéÉ½Õ¹‘•µlÄÉÁátˆ(€€€€€€€€€€€É½±”ô‰‘¥…±½œˆ(€€€€€€€€€€€…É¥„µµ½‘…°ô‰ÑÉÕ”ˆ(€€€€€€€€€€€…É¥„µ±…‰•°ô‰A…ÉÑ¹•ÈÍ…¹¹•Èˆ(€€€€€€€€€€ø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ¡•…‘•È™±•àÍ¡É¥¹¬´À¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ‰•Ñİ••¸…À´ÈÁà´ÌÁä´ÈÍ´éÁà´ĞµéÁä´È¸Ôˆø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õí½	…­Q½5…Áô±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ‰…¬ˆ…É¥„µ±…‰•°ô‰	…¬Ñ¼µ…Àˆø(€€€€€€€€€€€€€€€€ñÉÉ½İ1•™Ğ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ¡•…‘•ÈµÑ¥Ñ±”Ñ•áĞµlåÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÑ•µtÑ•áĞµl	ĞÙtµéÑ•áĞµlÄÁÁátµéÑÉ…­¥¹œµlÀ¸ÄÙ•µtˆø(€€€€€€€€€€€€€€€A…ÉÑ¹•ÈÍ…¹¹•È(€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÍİ¥Ñ¡5½‘”¡ÕÉ±MÑ…Ñ”¹µ½‘”°€‰µ…Àˆ¥ô±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ±½Í”¥¹±¥¹”µ™±•à ´àÜ´à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•ÈÉ½Õ¹‘•µlÉÁát™½ÕÌµÙ¥Í¥‰±”é½ÕÑ±¥¹”µ¹½¹”™½ÕÌµÙ¥Í¥‰±”éÉ¥¹œ´È™½ÕÌµÙ¥Í¥‰±”éÉ¥¹œµl	ĞÙtµé ´äµéÜ´äˆ…É¥„µ±…‰•°ô‰±½Í”ˆø(€€€€€€€€€€€€€€€€ñ`±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…ÍÌµÁ…¹•°µ‰½‘äµ¥¸µ ´À™±•à´Ä½Ù•É™±½Üµäµ…ÕÑ¼Áà´È¸ÔÁˆµm…±Œ ÅÉ•´­•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´¤¥tÁĞ´ÈÍ´éÁà´ĞµéÁˆ´ĞµéÁĞ´Ìˆø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Áà´ÌÁĞ´ÄÍ´éÁà´Ìˆø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áĞµlåÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÑ•µtÑ•áĞµl	ĞÙtµéÑ•áĞµlÄÁÁátµéÑÉ…­¥¹œµlÀ¸ÄÙ•µtˆùEHÙ•É¥™¥…Ñ¥½¸ğ½Àø(€€€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰µĞ´ÄÑ•áĞµlÈÉÁát™½¹ĞµÍ•µ¥‰½±±•…‘¥¹œµ¹½¹”ÑÉ…­¥¹œµl´À¸ÀÈÕ•µtÑ•áĞµlŒÁÅÌÍtµéµĞ´Ä¸ÔµéÑ•áĞµlÈÕÁátˆùM…¸„É•Í¥‘•¹ĞÁ…ÍÌğ½ Èø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µĞ´Ä¸ÔÑ•áĞµlÄÉÁát±•…‘¥¹œ´ÔÑ•áĞµlŒĞÈÔĞØÙtˆø(€€€€€€€€€€€€€€€€€€€¡•¬•±¥¥‰¥±¥Ñä°É•Ù¥•ÜÑ¡”Á•É¬°…¹É•½ÉÑ¡”É•ÍÕ±Ğ¸(€€€€€€€€€€€€€€€€€€ğ½Àø(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€ñA…ÉÑ¹•ÉEÉM…¹¹•È(€€€€€€€€€€€€€€€€€½¹Y•É¥™¥•õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€Í•ÑA…ÍÍAÉ•Í•¹Ñ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µĞ´Ì™±•à…À´Ì½Ù•É™±½Üµàµ…ÕÑ¼Áˆ´Äˆø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ” ˆ½…Éˆ¥ô±…ÍÍ9…µ”ô‰‘ÀµÁ…ÍÌµ…Ñ¥½¸ˆùI•Í¥‘•¹ĞA…ÍÌğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÍİ¥Ñ¡5½‘” ‰Á…ÉÑ¹•Èˆ°€‰µ…Àˆ¥ô±…ÍÍ9…µ”ô‰‘ÀµÁ…ÍÌµ…Ñ¥½¸ˆùA…ÉÑ¹•È5…Àğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½µ½Ñ¥½¸¹Í•Ñ¥½¸ø(€€€€€€€€ğ½‘¥Øø(€€€€€€¥ô((€€€€€íÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌˆ€˜˜ÕÉ±MÑ…Ñ”¹µ½‘”€„ôô€‰Á…ÉÑ¹•Èˆ€˜˜€ (€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Á½¥¹Ñ•Èµ•Ù•¹ÑÌµ¹½¹”…‰Í½±ÕÑ”¥¹Í•Ğ´ÀèµlÔĞÁt™±•à¥Ñ•µÌµ•¹©ÕÍÑ¥™äµ•¹Ñ•ÈÀ´ÈÍ´éÀ´Ğµé¥Ñ•µÌµ•¹Ñ•Èˆø(€€€€€€€€€€ñ5…ÁM¡••Ğ(€€€€€€€€€€€Ù…É¥…¹Ğô‰É•Í¥‘•¹Ğµ…Éˆ(€€€€€€€€€€€…É¥…1…‰•°ô‰I•Í¥‘•¹Ğ…•ÍÌ…Éˆ(€€€€€€€€€€€½¹	…¬õí½	…­Q½5…Áô(€€€€€€€€€€€½¹±½Í”õì ¤€ôøÍİ¥Ñ¡5½‘”¡ÕÉ±MÑ…Ñ”¹µ½‘”°€‰µ…Àˆ¥ô(€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ…ÉµÍ¡••ĞÁ½¥¹Ñ•Èµ•Ù•¹ÑÌµ…ÕÑ¼ˆ(€€€€€€€€€€ø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ¡••Ğµ¡…¹‘±”ˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€ñ5…ÁM¡••ÑQ½½±‰…È(€€€€€€€€€€€€€•å•‰É½Üô‰IM%9PIˆ(€€€€€€€€€€€€€½¹	…¬õí½	…­Q½5…Áô(€€€€€€€€€€€€€½¹±½Í”õì ¤€ôøÍİ¥Ñ¡5½‘”¡ÕÉ±MÑ…Ñ”¹µ½‘”°€‰µ…Àˆ¥ô(€€€€€€€€€€€€¼ø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ¡••ĞµÍÉ½±°ˆø(€€€€€€€€€€€€€ì…¥ÍÕÑ¡•¹Ñ¥…Ñ•€˜˜€…¥Í1½…‘¥¹ÕÑ €ü€ (€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ…Éµ¥‘•¹Ñ¥Ñä‘ÀµÉ•Í¥‘•¹Ğµ…Éµ¥‘•¹Ñ¥Ñä´µÍ¥¹•µ½ÕĞˆø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ•å•‰É½ÜˆùIM%9PMLğ½Àø(€€€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÑ¥Ñ±”ˆùM¥¸¥¸Ñ¼å½ÕÈÉ•Í¥‘•¹Ğ…É¸ğ½ Èø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍÕ‰Ñ¥Ñ±”ˆùM•”å½ÕÈµ•µ‰•ÉÍ¡¥À°¡½µ”ÁÉ½Á•ÉÑä°Í…Ù•Á±…•Ì°…¹½¹”µÑ¥µ”EHÁ…ÍÌ¥¸½¹”Í•ÕÉ”Ù¥•Ü¸ğ½Àø(€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€€€€í¥Í1½…‘¥¹ÕÑ €ü€ (€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ…Éµ¥‘•¹Ñ¥ÑäˆÉ½±”ô‰ÍÑ…ÑÕÌˆø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ•å•‰É½ÜˆùIM%9PMLğ½Àø(€€€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÑ¥Ñ±”ˆù¡•­¥¹œå½ÕÈ…½Õ¹Ğ¸ğ½ Èø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍÕ‰Ñ¥Ñ±”ˆùe½ÕÈÉ•Í¥‘•¹Ğ‘•Ñ…¥±Ìİ¥±°…ÁÁ•…È¡•É”İ¡•¸Ñ¡•ä…É”É•…‘ä¸ğ½Àø(€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€€€€í¥ÍÕÑ¡•¹Ñ¥…Ñ•€ü€ (€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ…Éµ¥‘•¹Ñ¥Ñäˆø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ•å•‰É½ÜˆùIM%9PMLğ½Àø(€€€€€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÑ¥Ñ±”ˆùíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹™Õ±±9…µ”ñğ€‰e½ÕÈ½İ¹Ñ½İ¸…É‰ôğ½ Èø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍÕ‰Ñ¥Ñ±”ˆø(€€€€€€€€€€€€€€€€€€€€€íÉ•Í¥‘•¹Ñ½Õ¹Ğü¹‰Õ¥±‘¥¹9…µ”€ü€‘íÉ•Í¥‘•¹Ñ½Õ¹Ğ¹‰Õ¥±‘¥¹9…µ•ô¥Ì½¹¹•Ñ•Ñ¼Ñ¡¥ÌÉ•Í¥‘•¹Ğ…É¹€€è€‰UÍ”å½ÕÈ…Éİ¡•¸„Á…ÉÑ¥¥Á…Ñ¥¹œÁ±…”½È•Ù•¹Ğ…Í­ÌÑ¼½¹™¥É´É•Í¥‘•¹Ğ…•ÍÌ¸‰ô(€€€€€€€€€€€€€€€€€€€€ğ½Àø(€€€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”õí‘Àµ…ÉµÉ•‘•¹Ñ¥…°€‘íÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰¥ÌµÉ•…‘äˆ€è€ˆ‰õô…É¥„µ±…‰•°ô‰I•Í¥‘•¹ĞEH½‘”ˆø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…ÉµÉ•‘•¹Ñ¥…°µ¡•…‘•Èˆø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ…ÉµÉ•‘•¹Ñ¥…°µ­¥­•ÈˆùíÉ•Í¥‘•¹Ñ½Õ¹ÑMÑ…ÑÕÌ¡É•Í¥‘•¹Ñ½Õ¹Ğ¤¹Ñ½UÁÁ•É…Í” ¥ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ…ÉµÉ•‘•¹Ñ¥…°µÍÑ…ÑÕÌˆùíÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰M…¹¹•ˆ€è€‰I•…‘ä‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ Ì±…ÍÍ9…µ”ô‰‘Àµ…ÉµÉ•‘•¹Ñ¥…°µÑ¥Ñ±”ˆùíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹‰Õ¥±‘¥¹9…µ”ñğÉ•Í¥‘•¹Ñ½Õ¹Ğü¹‰Õ¥±‘¥¹¥ÍÑÉ¥Ğñğ€‰½İ¹Ñ½İ¸ÕÍÑ¥¸‰ôğ½ Ìø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµ…ÉµÉ•‘•¹Ñ¥…°µ½Áäˆø(€€€€€€€€€€€€€€€€€€€€€íÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰I•Í¥‘•¹Ğ…•ÍÌ¥Ì½¹™¥Éµ•™½ÈÑ¡¥ÌÙ¥Í¥Ğ¸ˆ€è€‰M¡½ÜÑ¡¥ÌEH½‘”İ¡•¸„Á…ÉÑ¥¥Á…Ñ¥¹œÁ…ÉÑ¹•È…Í­ÌÑ¼½¹™¥É´É•Í¥‘•¹Ğ…•ÍÌ¸‰ô(€€€€€€€€€€€€€€€€€€€€ğ½Àø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…ÉµÅÈµİÉ…Àˆøñ•µ½EÉ½‘”½‘”õíÉ•Í¥‘•¹Ñ…É‘A…å±½…¹ÅÉY…±Õ•ô±…ÍÍ9…µ”ô‰‘Àµ…ÉµÅÈµ¥µ…”ˆ€¼øğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…ÉµÍ…¸µ‘•µ¼ˆ…É¥„µ±¥Ù”ô‰Á½±¥Ñ”ˆø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰I•Í¥‘•¹Ğ…•ÍÌ½¹™¥Éµ•ˆ€è€‰I•…‘äİ¡•¸„Á…ÉÑ¹•È…Í­Ì‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õíÁÉ•Í•¹ÑI•Í¥‘•¹ÑA…ÍÍôùíÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰M¡½Ü……¥¸ˆ€è€‰M¡½ÜEH‰ôğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ…ÉµÙ•É¥™¥…Ñ¥½¸µÉ½Üˆø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíÉ•Í¥‘•¹Ñ½Õ¹ÑMÑ…ÑÕÌ¡É•Í¥‘•¹Ñ½Õ¹Ğ¥õíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹‰Õ¥±‘¥¹9…µ”€ü€ƒ
Ü€‘íÉ•Í¥‘•¹Ñ½Õ¹Ğ¹‰Õ¥±‘¥¹9…µ•õ€€è€ˆ‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ñ½‘”ùíÉ•Í¥‘•¹Ñ…É‘A…å±½…¹Õ¥‘ôğ½½‘”ø(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥à±…‰•°ô‰e=UH=U9Pˆø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥áI½Ü±…‰•°ô‰9…µ”ˆÙ…±Õ”õíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹™Õ±±9…µ”ñğÕÍ•Èü¹™Õ±±}¹…µ”ñğÕÍ•Èü¹•µ…¥°ñğ€‰I•Í¥‘•¹Ğ‰ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥áI½Ü±…‰•°ô‰µ…¥°ˆÙ…±Õ”õíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹•µ…¥°ñğÕÍ•Èü¹•µ…¥°ñğ€‰9½Ğ…‘‘•‰ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥áI½Ü±…‰•°ô‰!½µ”ˆÙ…±Õ”õíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹‰Õ¥±‘¥¹9…µ”ñğ€‰9½Ğ½¹¹•Ñ•‰ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥áI½Ü±…‰•°ô‰MÑ…ÑÕÌˆÙ…±Õ”õíÉ•Í¥‘•¹Ñ½Õ¹ÑMÑ…ÑÕÌ¡É•Í¥‘•¹Ñ½Õ¹Ğ¥ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±5…ÑÉ¥áI½Ü±…‰•°ô‰I•¹•İ…°ˆÙ…±Õ”õíÉ•Í¥‘•¹Ñ½Õ¹Ğü¹É•¹•İ…±…Ñ”ñğÉ•Í¥‘•¹Ñ½Õ¹Ğü¹•áÁ¥É•ÍĞñğ€‰9¼É•¹•İ…°‘…Ñ”‰ô€¼ø(€€€€€€€€€€€€€€€€€€ğ½5…ÁA…¹•±5…ÑÉ¥àø((€€€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍ•Ñ¥½¸‘Àµµ…ÀµÁ…¹•°µÍ•Ñ¥½¸´µ½µÁ…Ğˆ…É¥„µ±…‰•°ô‰ÕÉÉ•¹Ğ…•ÍÌˆø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍ•Ñ¥½¸µ±…‰•°ˆù]!Pe=T8UMğ½Àø(€€€€€€€€€€€€€€€€€€€€ñ Ì±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍ•Ñ¥½¸µÑ¥Ñ±”ˆùI•Í¥‘•¹Ğ‰•¹•™¥ÑÌ¹•…É‰äğ½ Ìø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ‰½‘äµ½Áäˆù=Á•¸„Á…ÉÑ¥¥Á…Ñ¥¹œÁ•É¬Ñ¼É•Ù¥•Ü¥ÑÌÕÉÉ•¹ĞÑ•ÉµÌ°Ñ¡•¸Í¡½Ü„½¹”µÑ¥µ”EHİ¡•¸Ñ¡”Á…ÉÑ¹•È…Í­Ì¸ğ½Àø(€€€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø((€€€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ¹½Ñ”ˆø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µÍ•Ñ¥½¸µ±…‰•°ˆù	U%1%955	IM!%@ğ½Àø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÁ…¹•°µ‰½‘äµ½Áäˆù%˜å½ÕÈ‰Õ¥±‘¥¹œ¥Ì…¸…Ñ¥Ù”½İ¹Ñ½İ¸A•É­Ì½È9µ•µ‰•È°•±¥¥‰±”É•Í¥‘•¹Ğ…•ÍÌ¥Ì¥¹±Õ‘•…ÕÑ½µ…Ñ¥…±±ä¸ğ½Àø(€€€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ñ™½½Ñ•È±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ¡••Ğµ…Ñ¥½¸µ™½½Ñ•Èˆø(€€€€€€€€€€€€€í¥ÍÕÑ¡•¹Ñ¥…Ñ•€ü€ (€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰½Á•¸µ‘•Ñ…¥°ˆ±…‰•°õíÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰½¹™¥Éµ•ˆ€è€‰M¡½ÜEH‰ô…É¥…1…‰•°õíÁ…ÍÍAÉ•Í•¹Ñ•€ü€‰M¡½Ü½¹™¥Éµ•É•Í¥‘•¹ĞEH……¥¸ˆ€è€‰M¡½ÜÉ•Í¥‘•¹ĞEH½‘”‰ôÙ…É¥…¹Ğô‰ÁÉ¥µ…Éäˆ½¹AÉ•ÍÌõíÁÉ•Í•¹ÑI•Í¥‘•¹ÑA…ÍÍô€¼ø(€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ¡••Ğµ…Ñ¥½¸µÉ¥ˆø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰½Á•¸µ‘•Ñ…¥°ˆ±…‰•°ô‰AÉ½™¥±”ˆ…É¥…1…‰•°ô‰=Á•¸É•Í¥‘•¹ĞÁÉ½™¥±”ˆÙ…É¥…¹Ğô‰Í•½¹‘…Éäˆ½¹AÉ•ÍÌõì ¤€ôø¹…Ù¥…Ñ” ˆ½É•Í¥‘•¹Ğ½¡½µ”ıÁ…¹•°õ…Éˆ¥ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰½Á•¸µ‘•Ñ…¥°ˆ±…‰•°ô‰‘]…±±•Ğˆ…É¥…1…‰•°õíİ…±±•Ñ‘‘•€ü€‰‘İ…±±•Ğ…±É•…‘ä½µÁ±•Ñ•ˆ€è€‰‘…ÉÑ¼İ…±±•Ğ‰ôÙ…É¥…¹Ğô‰Í•½¹‘…Éäˆ½¹AÉ•ÍÌõíÍ…Ù•I•Í¥‘•¹ÑA…ÍÍ½É1…Ñ•Éô€¼ø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ…ÉµÍ¥¹½ÕĞˆ½¹±¥¬õì ¤€ôø±½½ÕĞ¡ÑÉÕ”°€ˆ½É•Í¥‘•¹ÑÌ½±½¥¸ˆ¥ôùM¥¸½ÕĞğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€¤€è€…¥Í1½…‘¥¹ÕÑ €ü€ (€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…ÀµÍ¡••Ğµ…Ñ¥½¸µÉ¥ˆø(€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰½Á•¸µ‘•Ñ…¥°ˆ±…‰•°ô‰M¥¸¥¸ˆ…É¥…1…‰•°ô‰M¥¸¥¸Ñ¼É•Í¥‘•¹Ğ…•ÍÌˆÙ…É¥…¹Ğô‰ÁÉ¥µ…Éäˆ½¹AÉ•ÍÌõì ¤€ôø¹…Ù¥…Ñ”¡€½É•Í¥‘•¹ÑÌ½±½¥¸ıÉ•ÑÕÉ¹Q¼ô‘í•¹½‘•UI%½µÁ½¹•¹Ğ ˆ½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõÁ…ÍÌˆ¥õ€¥ô€¼ø(€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰½Á•¸µ‘•Ñ…¥°ˆ±…‰•°ô‰É•…Ñ”…½Õ¹Ğˆ…É¥…1…‰•°ô‰É•…Ñ”„É•Í¥‘•¹Ğ…½Õ¹ĞˆÙ…É¥…¹Ğô‰Í•½¹‘…Éäˆ½¹AÉ•ÍÌõì ¤€ôø¹…Ù¥…Ñ” ˆ½É•Í¥‘•¹ÑÌ½µ•µ‰•ÉÍ¡¥Àˆ¥ô€¼ø(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€€€ğ½™½½Ñ•Èø(€€€€€€€€€€ğ½5…ÁM¡••Ğø(€€€€€€€€ğ½‘¥Øø(€€€€€€¥ô(($€€€€€íÍ¡½İ	½ÑÑ½µ9…Ù¥…Ñ¥½¸€˜˜€ (€€€€€€€€ñ‘¥Ø‘…Ñ„µ‘Àµ‰½ÑÑ½´µ¹…Ù¥…Ñ¥½¸ô‰ÑÉÕ”ˆ±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µ‰½ÑÑ½´µ¹…Ø‘Àµµ…Àµ‰½ÑÑ½´µ¹…ØµÍ¡•±°Á½¥¹Ñ•Èµ•Ù•¹ÑÌµ¹½¹”™¥á•¥¹Í•Ğµà´À‰½ÑÑ½´´ÀèµlÜÀÁtÁˆµm•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´¥tˆø(€€€€€€€€€€ñ¹…Ø(€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µ‰½ÑÑ½´µ¹…Øµ±¥ÍĞ‘Àµµ…Àµ‰½ÑÑ½´µ¹…ØÁ½¥¹Ñ•Èµ•Ù•¹ÑÌµ…ÕÑ¼É¥É¥µ½±Ì´Ôˆ(€€€€€€€€€€€…É¥„µ±…‰•°ô‰5…À‰½ÑÑ½´¹…Ù¥…Ñ¥½¸ˆ(€€€€€€€€€€€É½±”ô‰Ñ…‰±¥ÍĞˆ(€€€€€€€€€€€ÍÑå±”õíì€ˆ´µ‘Àµ‰½ÑÑ½´µ¹…Øµ½Õ¹Ğˆè€Ôõô(€€€€€€€€€€ø(€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜€ (€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰!½µ”ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ” ˆ½É•Í¥‘•¹Ğ½¡½µ”ˆ¥ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õí™…±Í•ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ!½ÕÍ”±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù!½µ”ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰5…Àˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰±°ˆ¤ì(€€€€€€€€€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€€€€€€€€€€€€€€€¹…Ù¥…Ñ” ˆ½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõµ…À™™¥±Ñ•Èõ±°ˆ¤ì(€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€…É¥„µÁÉ•ÍÍ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°‰ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•¥±Ñ•È€ôôô€‰±°‰ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ5…ÁA¥¸±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù5…Àğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰A•É­Ìˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€¥˜€¡…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ìˆ€˜˜€…Í•±•Ñ•‘%¤ì(€€€€€€€€€€€€€€€€€€€€€ÕÁ‘…Ñ•Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ”¡…Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ”€ôôô€‰Á••¬ˆ€ü€‰•áÁ…¹‘•ˆ€è€‰Á••¬ˆ¤ì(€€€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸ì(€€€€€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰A•É­Ìˆ¤ì(€€€€€€€€€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰Á•É­Ìˆ¤ì(€€€€€€€€€€€€€€€€€€€ÕÁ‘…Ñ•Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ” ‰•áÁ…¹‘•ˆ¤ì(€€€€€€€€€€€€€€€€€€€¹…Ù¥…Ñ” ˆ½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõÁ•É­Ì™™¥±Ñ•ÈõA•É­Ìˆ¤ì(€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€…É¥„µÁÉ•ÍÍ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ì‰ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ì‰ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ¥™Ğ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆùA•É­Ìğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰Ù•¹ÑÌˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰Ù•¹ÑÌˆ¤ì(€€€€€€€€€€€€€€€€€€€Í•Ñ½¹Í½±•½±±…ÁÍ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰•Ù•¹ÑÌˆ¤ì(€€€€€€€€€€€€€€€€€€€¹…Ù¥…Ñ” ˆ½µ…Àıµ½‘”õÉ•Í¥‘•¹Ğ™Ñ…ˆõ•Ù•¹ÑÌ™™¥±Ñ•ÈõÙ•¹ÑÌˆ¤ì(€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€…É¥„µÁÉ•ÍÍ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰•Ù•¹ÑÌ‰ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰•Ù•¹ÑÌ‰ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñMÁ…É­±•Ì±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆùÙ•¹ÑÌğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆÉ½±”ô‰Ñ…ˆˆ…É¥„µ±…‰•°ô‰…Éˆ½¹±¥¬õì ¤€ôøÍİ¥Ñ¡5½‘” ‰É•Í¥‘•¹Ğˆ°€‰Á…ÍÌˆ¥ô…É¥„µÍ•±•Ñ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰Á…ÍÌ‰ôø(€€€€€€€€€€€€€€€€€€ñÉ•‘¥Ñ…É±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù…Éğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€¥ô(€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜€ (€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰!½µ”ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½½Ù•ÉÙ¥•Üˆ°É•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤¤¥ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õí™…±Í•ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ	É¥•™…Í•	ÕÍ¥¹•ÍÌ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù!½µ”ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰5…Àˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø½Á•¹A…ÉÑ¹•É5…À ‰±°ˆ¥ô(€€€€€€€€€€€€€€€€€…É¥„µÁÉ•ÍÍ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…À‰ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õíÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰µ…À‰ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ5…ÁA¥¸±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù5…Àğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰AÕ‰±¥Í ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½ÁÕ‰±¥Í ˆ°É•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤¤¥ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õí™…±Í•ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ5•…Á¡½¹”±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆùAÕ‰±¥Í ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰A•É™½Éµ…¹”ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½Á•É™½Éµ…¹”ˆ°É•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤¤¥ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õí™…±Í•ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñÑ¥Ù¥Ñä±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆùA•É™½Éµ…¹”ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€É½±”ô‰Ñ…ˆˆ(€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰]½É­ÍÁ…”ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôø¹…Ù¥…Ñ”¡İ¥Ñ¡A…ÉÑ¹•É]½É­ÍÁ…•½¹Ñ•áĞ ˆ½Á…ÉÑ¹•Èµİ½É­ÍÁ…”½İ½É­ÍÁ…”ˆ°É•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¤¤¥ô(€€€€€€€€€€€€€€€€€…É¥„µÍ•±•Ñ•õí™…±Í•ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€ñ	É¥•™…Í•	ÕÍ¥¹•ÍÌ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µÑ…ˆµ±…‰•°ˆù]½É­ÍÁ…”ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€¥ô(€€€€€€€€€€ğ½¹…Øø(€€€€€€€€ğ½‘¥Øø(€€€€€€¥ô((€€€€€€ñ¹¥µ…Ñ•AÉ•Í•¹”ø(€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ìˆ€˜˜€…Í•±•Ñ•€˜˜€ (€€€€€€€€€€ñÑ¥Ù•A•É­ÍM¡••Ğ(€€€€€€€€€€€¥Ñ•µÌõí…Ñ¥Ù•A•É­%Ñ•µÍô(€€€€€€€€€€€‘É…İ•ÉMÑ…Ñ”õí…Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€É•‘••µ•‘%‘ÌõíÉ•‘••µ•‘A•É­%‘Íô(€€€€€€€€€€€¥¹¥Ñ¥…±MÉ½±±Q½ÀõíÁ••­A…¹•±MÑ…Ñ” ¤ü¹ÍÉ½±±Q½Àñğ€Áô(€€€€€€€€€€€½¹É…İ•ÉMÑ…Ñ•¡…¹”õíÕÁ‘…Ñ•Ñ¥Ù•A•É­ÍÉ…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€½¹±½Í”õí±½Í•Ñ¥Ù•A•É­ÍM¡••Ñô(€€€€€€€€€€€½¹=Á•¸õí½Á•¹Ñ¥Ù•A•É­%Ñ•µô(€€€€€€€€€€€½¹I•‘••´õì¡¥Ñ•´¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡¥Ñ•´¹Á±…”°€‰ÕÍ•}Á•É¬ˆ°€‰…Ñ¥Ù•}Á•É­Í}Í¡••Ğˆ¥ô(€€€€€€€€€€€½¹M…Ù”õì¡¥Ñ•´¤€ôøÑ½±•M…Ù•¡¥Ñ•´¹Á±…”¥ô(€€€€€€€€€€¼ø(€€€€€€€€¥ô(€€€€€€ğ½¹¥µ…Ñ•AÉ•Í•¹”ø((€€€€€€ñ¹¥µ…Ñ•AÉ•Í•¹”ø(€€€€€€€ì¡ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆñğ	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á…¹•±Q…ˆ¤¤€˜˜€ (€€€€€€€€€ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ(€€€€€€€€€€€€ü	½½±•…¸¡…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°¤ñğ¥Í1••¹‘Í¥É•Ñ½Éå1…å•È(€€€€€€€€€€€€èl‰Á•É­Ìˆ°€‰•Ù•¹ÑÌˆ°€‰Í…Ù•ˆ°€‰¥¹™¼‰t¹¥¹±Õ‘•Ì¡…Ñ¥Ù•	½ÑÑ½µQ…ˆ¤ñğ¥ÍI•¹Ñ…±1…å•Èñğ¥Í1••¹‘Í¥É•Ñ½Éå1…å•È(€€€€€€€€¤€˜˜€„¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ìˆ¤€˜˜€ …Í•±•Ñ•ñğÍ•±•Ñ•‘É…İ•É±½Í•ñğ…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°¤€˜˜€ (€€€€€€€€€€ñµ½Ñ¥½¸¹…Í¥‘”(€€€€€€€€€€€É•˜õí½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…•ô(€€€€€€€€€€€¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ĞĞõô(€€€€€€€€€€€…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€Àõô(€€€€€€€€€€€•á¥Ğõíì½Á…¥Ñäè€À°äè€ĞĞõô(€€€€€€€€€€€ÑÉ…¹Í¥Ñ¥½¸õíì‘ÕÉ…Ñ¥½¸è€À¸ÈĞ°•…Í”èlÀ¸ÈÈ°€Ä°€À¸ÌØ°€Åtõô(€€€€€€€€€€€±…ÍÍ9…µ”õí¥Í1••¹‘Í¥É•Ñ½Éå1…å•È(€€€€€€€€€€€€€€ü€‰‘Àµ¹…Ñ¥Ù”µ‘É…İ•È‘Àµµ…Àµ‘¥É•Ñ½ÉäµÍ¡••Ğ‘Àµ±••¹‘Ìµ‘¥É•Ñ½ÉäµÍ¡••Ğˆ(€€€€€€€€€€€€€€è‘Àµ¹…Ñ¥Ù”µ‘É…İ•È‘ÀµÁ…¹•°µÍ¡•±°‘Àµµ…Àµ‘É…İ•ÈµÍ¡•±°€‘í¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È€ü€‰‘ÀµÍ…Ù•µ‘É…İ•ÈµÍ¡•±°ˆ€è€ˆ‰ô€‘í¥ÍI•Í¥‘•¹ÑÙ•¹ÑÍÉ…İ•È€ü€‰‘ÀµÉ•Í¥‘•¹Ğµ•Ù•¹ÑÌµ‘É…İ•Èˆ€è€ˆ‰ô€‘í…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰…µÁ…¥¹Ìˆ€ü€‰‘Àµµ…Àµ…µÁ…¥¸µ‘É…İ•Èˆ€è€ˆ‰ô€‘í…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰É•Á½ÉÑÌˆ€ü€‰‘Àµµ…ÀµÉ•Á½ÉÑÌµ‘É…İ•Èˆ€è€ˆ‰ô…‰Í½±ÕÑ”¥¹Í•Ğµà´À‰½ÑÑ½´´ÀèµlØÈÁtµàµ…ÕÑ¼™±•àµ…àµ µmµ¥¸ àá‘Ù ±…±Œ ÄÀÁ‘Ù ´ÜÉÁà¤¥tµ¥¸µ ´ÀÜµ™Õ±°µ…àµÜ´Íá°™±•àµ½°½Ù•É™±½Üµ¡¥‘‘•¸É½Õ¹‘•µĞµlÄÉÁátÀ´ÌÁˆµm…±Œ À¸ÜÕÉ•´­•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ğµ‰½ÑÑ½´¤¥tµéµ…àµ µlØÑ‘Ù¡tµéÉ½Õ¹‘•µĞµlÄÉÁáuô(€€€€€€€€€€€ÍÑå±”õí5A}I]I}MUI}MQe1ô(€€€€€€€€€€€‘…Ñ„µ‘É…İ•ÈµÍÑ…Ñ”õí¥ÍI•Í¥‘•¹ÑÙ•¹ÑÍÉ…İ•È€ü€‰™Õ±°ˆ€è€‰•áÁ…¹‘•‰ô(€€€€€€€€€€€‘…Ñ„µµ½‰¥±”µÁ…¹•°µÍÕÉ™…”ô‰ÑÉÕ”ˆ(€€€€€€€€€€€É½±”ô‰‘¥…±½œˆ(€€€€€€€€€€€…É¥„µµ½‘…°ô‰ÑÉÕ”ˆ(€€€€€€€€€€€…É¥„µ±…‰•°õí¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ü€‰1••¹‘ÌI•…°ÍÑ…Ñ”±¥ÍÑ¥¹Ìˆ€èÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰É•Á½ÉÑÌˆ€ü€‰A…ÉÑ¹•Èµ…ÀÉ•Á½ÉÑÌˆ€èÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰A…ÉÑ¹•Èµ…ÀÉ•ÍÕ±ÑÌˆ€è€‰5…ÀÉ•ÍÕ±ÑÌ‰ô(€€€€€€€€€€ø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”õí¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ü€‰‘Àµµ…Àµ‘¥É•Ñ½ÉäµÑ½½±‰…Èˆ€è€‰‘ÀµÁ…¹•°µÑ½½±‰…Èµˆ´È™±•àÍ¡É¥¹¬´À¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ‰•Ñİ••¸…À´Èµéµˆ´Ìµé…À´Ì‰ôø(€€€€€€€€€€€€€í¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ü€ (€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰‰…¬ˆ±…‰•°ô‰5…Àˆ…É¥…1…‰•°ô‰I•ÑÕÉ¸Ñ¼µ…ÀˆÙ…É¥…¹Ğô‰Í•½¹‘…ÉäˆÍ¥é”ô‰Í´ˆ±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ‰…¬ˆ½¹AÉ•ÍÌõí±½Í•¥É•Ñ½ÉåQ½5…Áôø(€€€€€€€€€€€€€€€€€€€€ñÉÉ½İ1•™Ğ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€ğ½5…ÁA…¹•±	ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€ñ5…ÁA…¹•±	ÕÑÑ½¸…Ñ¥½¸ô‰±½Í”ˆ±…‰•°ô‰±½Í”ˆ…É¥…1…‰•°ô‰±½Í”1••¹‘ÌI•…°ÍÑ…Ñ”±¥ÍÑ¥¹ÌÁ…¹•°ˆÙ…É¥…¹Ğô‰¥½¸ˆÍ¥é”ô‰Í´ˆ±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ±½Í”ˆ½¹AÉ•ÍÌõí±½Í•¥É•Ñ½ÉåQ½5…Áôø(€€€€€€€€€€€€€€€€€€€€ñ`±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€ğ½5…ÁA…¹•±	ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õí½	…­Q½5…Áô±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ‰…¬ˆ…É¥„µ±…‰•°ô‰	…¬Ñ¼µ…Àˆø(€€€€€€€€€€€€€€€€€€€€ñÉÉ½İ1•™Ğ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µÑ½½±‰…ÈµÑ¥Ñ±”ˆùíµ…ÁA…¹•±9…Ù¥…Ñ¥½¹Q¥Ñ±•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€½¹±¥¬õí½	…­Q½5…Áô(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ±½Í”™±•à ´àÜ´àÉ½Õ¹‘•µláÁát™½ÕÌµÙ¥Í¥‰±”é½ÕÑ±¥¹”µ¹½¹”™½ÕÌµÙ¥Í¥‰±”éÉ¥¹œ´È™½ÕÌµÙ¥Í¥‰±”éÉ¥¹œµl	ĞÙtµé ´äµéÜ´äˆ(€€€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°õíÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰É•Á½ÉÑÌˆ€ü€‰±½Í”É•Á½ÉÑÌˆ€è€‰±½Í”‰ô(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñ`±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€±…ÍÍ9…µ”õí‘ÀµÁ…¹•°µ‰½‘ä‘ÀµÁ…¹•°µÍÉ½±°µ¥¸µ ´À€‘í¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ü€‰¡¥‘‘•¸ˆ€èÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰™±•à´Ä½Ù•É™±½Üµäµ…ÕÑ¼ˆ€è€‰¡¥‘‘•¸‰õô(€€€€€€€€€€€€€‘…Ñ„µÁ…¹•°µ‰½‘ä(€€€€€€€€€€€€ø(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰…Ñ¥Ù¥Ñäˆ€˜˜É•¹‘•ÉÑ¥Ù¥ÑåA…¹•° ¥ô(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰É•Á½ÉÑÌˆ€˜˜É•¹‘•ÉI•Á½ÉÑÍA…¹•° ¥ô(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰…µÁ…¥¹Ìˆ€˜˜É•¹‘•É…µÁ…¥¹A…¹•° ¥ô(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰¥¹™¼ˆ€˜˜É•¹‘•É%¹™½A…¹•° ¥ô(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€ôôô€‰¥Ù¥Œˆ€˜˜É•¹‘•É¥Ù¥A…¹•° ¥ô(€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜€……Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€˜˜€ (€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ¥¹Ñ•°µÉ¥µˆ´ÌÉ¥Í¡É¥¹¬´À…À´ÈµéÉ¥µ½±Ì´Ìˆø(€€€€€€€€€€€€€€€ì¡…Ñ¥Ù•¥±Ñ•È€ôôô€‰Ù•¹ÑÌˆ(€€€€€€€€€€€€€€€€€€ül(€€€€€€€€€€€€€€€€€€€€€l‰]¡…Ğ•Ù•¹ÑÌ…¸Í¡½Üˆ°€‰M…Ù•Ì°IMYAÌ°‘¥É•Ñ¥½¸Ñ…ÁÌ°Ñ¥µ¥¹œ°…¹¹•…É‰äÁ±…•ÌÁ•½Á±”¡•¬‰•™½É”…¹…™Ñ•ÈÑ¡”•Ù•¹Ğ¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡¼¥Ì±½Í”•¹½Õ ˆ°€‰I•Í¥‘•¹ÑÌ°¡½Ñ•°Õ•ÍÑÌ°Ù¥Í¥Ñ½ÉÌ°…¹•Ù•¹Ğµ½•ÉÌ…±É•…‘äµ½Ù¥¹œÑ¡É½Õ I…¥¹•ä°M•…¡½±´°…¹‘½İ¹Ñ½İ¸¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡…ĞÑ¼ÑÉä¹•áĞˆ°€‰•…ÑÕÉ”!½Ñ•°Y…¸i…¹‘Ğ°•É…±‘¥¹”Ì°¥ÉÍĞQ¡ÕÉÍ‘…ä°¡…ÁÁä¡½ÕÈ°½È±¥Ù”µÕÍ¥Œµ½µ•¹ÑÌİ¡•¸Ñ¥µ¥¹œµ…ÑÑ•ÉÌ¸‰t°(€€€€€€€€€€€€€€€€€€€t(€€€€€€€€€€€€€€€€€€è…Ñ¥Ù•¥±Ñ•È€ôôô€‰	É…¹‘Ìˆ(€€€€€€€€€€€€€€€€€€ül(€€€€€€€€€€€€€€€€€€€€€l‰]¡…ĞÁ•½Á±”…É”¹½Ñ¥¥¹œˆ°€‰	É…¹µ½µ•¹ÑÌÑ¥•Ñ¼¹•…É‰äÉ•Í¥‘•¹ÑÌ°•Ù•¹ÑÌ°…¹İ…±­…‰±”Á±…¹Ì¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡¼¥Ì±½Í”•¹½Õ ˆ°€‰I•Í¥‘•¹ÑÌ°Ù¥Í¥Ñ½ÉÌ°…¹•Ù•¹Ğµ½•ÉÌ…±É•…‘äµ½Ù¥¹œÑ¡É½Õ Ñ¡”Í•±•Ñ•…É•„¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡…ĞÑ¼ÑÉä¹•áĞˆ°€‰…µÁ…¥¹Ì°ÍÕÉÙ•åÌ°…¹Á±…•µ•¹ÑÌÑ¡…Ğ…É”•…ÍäÑ¼…Ğ½¸¹•…É‰ä¸‰t°(€€€€€€€€€€€€€€€€€€€t(€€€€€€€€€€€€€€€€€€èl(€€€€€€€€€€€€€€€€€€€€€l‰]¡…ĞÁ•½Á±”…É”±½½­¥¹œ™½Èˆ°€‰M•…É¡•Ì°Í…Ù•Ì°Í…¹Ì°…¹…ÉÙ¥•İÌÉ½ÕÁ•‰äÑ¥µ”½˜‘…ä¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡¼¥Ì¹•…É‰äˆ°€‰I•Í¥‘•¹ÑÌ°Ù¥Í¥Ñ½ÉÌ°…¹•Ù•¹Ğµ½•ÉÌ…É½Õ¹Ñ¡”Í•±•Ñ•…É•„¸‰t°(€€€€€€€€€€€€€€€€€€€€€l‰]¡…ĞÑ¼ÑÉä¹•áĞˆ°€‰A±…•Ì…¹µ½µ•¹ÑÌÑ¡…Ğ…É”±½Í”•¹½Õ ™½ÈÁ•½Á±”Ñ¼…Ğ½¸¸‰t°(€€€€€€€€€€€€€€€€€€€t¤¹µ…À ¡mÑ¥Ñ±”°‰½‘åt¤€ôø€ (€€€€€€€€€€€€€€€€€€ñ‘¥Ø­•äõíÑ¥Ñ±•ô±…ÍÍ9…µ”ô‰‘ÀµÁ…ÉÑ¹•Èµ¥¹Ñ•°µ…ÉÀ´Ìˆø(€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ•áĞµlÄÁÁát™½¹Ğµ‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍtˆùíÑ¥Ñ±•ôğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µĞ´ÄÑ•áĞµlÄÉÁát±•…‘¥¹œ´ÔÑ•áĞµlŒÁÅÌÍt¼Øàˆùí‰½‘åôğ½Àø(€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€€í¥Í1••¹‘Í¥É•Ñ½Éå1…å•È€ü€ (€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ¡•…‘•Èˆø(€€€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ•å•‰É½Üˆù19LI0MQQğ½Àø(€€€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½ÉäµÑ¥Ñ±”ˆù½İ¹Ñ½İ¸±¥ÍÑ¥¹Ì°¥¸½¹Ñ•áĞ¸ğ½ Èø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½ÉäµÍÕ‰Ñ¥Ñ±”ˆø(€€€€€€€€€€€€€€€€€€€Ñ¥Ù”1••¹‘Ì¡½µ•Ìİ¥Ñ ‰Õ¥±‘¥¹œ½¹Ñ•áĞ°İ…±­…‰±”‘•µ…¹°…¹¹•…É‰ä±¥™•ÍÑå±”‘•Ñ…¥±Ì™½È•… …‘‘É•ÍÌ¸(€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œ±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ½Õ¹Ğˆø(€€€€€€€€€€€€€€€€€€€í±••¹‘Í¥É•Ñ½ÉåA±…•Ì¹±•¹Ñ ñğ‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¹±•¹Ñ¡ô…Ñ¥Ù”±¥ÍÑ¥¹Ì(€€€€€€€€€€€€€€€€€€ğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘¥É•Ñ½Éäµ±¥ÍĞˆø(€€€€€€€€€€€€€€€€€í±••¹‘Í¥É•Ñ½ÉåA±…•Ì¹µ…À ¡Á±…”¤€ôø€ (€€€€€€€€€€€€€€€€€€€¥ÍI•¹Ñ…±¹Ñ¥Ñä¡Á±…”¤€ü€ (€€€€€€€€€€€€€€€€€€€€€€ñ1••¹‘ÍI•¹Ñ…±I•ÍÕ±ÑI½Ü(€€€€€€€€€€€€€€€€€€€€€€€­•äõíÁ±…”¹¥‘ô(€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÁ±…•ô(€€€€€€€€€€€€€€€€€€€€€€€Í•±•Ñ•õíÁ±…”¹¥€ôôôÍ•±•Ñ•‘%‘ô(€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•Ğõì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô(€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€€€  ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞÉ½Ü€ô•Ñ1••¹‘Í¥É•Ñ½ÉåI½İ½Áä¡Á±…”¤ì(€€€€€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€€€€€€€€€­•äõíÁ±…”¹¥‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±ĞµÉ½Üˆ(€€€€€€€€€€€€€€€€€€€€€€€€€€€‘…Ñ„µ…Ñ¥½¸ô‰Í•±•Ğˆ(€€€€€€€€€€€€€€€€€€€€€€€€€€€‘…Ñ„µÍ•±•Ñ•õíÁ±…”¹¥€ôôôÍ•±•Ñ•‘%€ü€‰ÑÉÕ”ˆ€è€‰™…±Í”‰ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€…É¥„µ±…‰•°õíY¥•Ü€‘íÉ½Ü¹Ñ¥Ñ±•õô(€€€€€€€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±ĞµÁ¥¸ˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñA¥¹	…‘”Á±…”õíÁ±…•ôÍ•±•Ñ•õíÁ±…”¹¥€ôôôÍ•±•Ñ•‘%‘ôÍ¥é”ô‰Í´ˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰µ¥¸µÜ´Àˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±Ğµµ•Ñ„ˆùíÉ½Ü¹µ•Ñ…ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±ĞµÑ¥Ñ±”ˆùíÉ½Ü¹Ñ¥Ñ±•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±Ğµ…‘‘É•ÍÌˆùíÉ½Ü¹…‘‘É•ÍÍôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±Ğµ‘•Ñ…¥±ÌˆùíÉ½Ü¹‘•Ñ…¥±Íôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ±••¹‘ÌµÉ•ÍÕ±Ğµ…Ñ¥½¸ˆùY¥•Üğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€€€€€€€ô¤ ¤(€€€€€€€€€€€€€€€€€€€€¤(€€€€€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€€€€€ì…±••¹‘Í¥É•Ñ½ÉåA±…•Ì¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÉ½Ü‰œµİ¡¥Ñ”À´ĞÑ•áĞµlÄÍÁát±•…‘¥¹œ´ØÑ•áĞµlŒĞÈÔĞØÙtˆø(€€€€€€€€€€€€€€€€€€€€€9¼…Ñ¥Ù”1••¹‘Ì¥¹Ù•¹Ñ½Éä¥ÌÙ¥Í¥‰±”å•Ğ¸QÉä1••¹‘Ì°1¥ÍÑ¥¹Ì°½È„¹•…É‰äÉ•…°•ÍÑ…Ñ”Í•…É ¸(€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€¤€èÕÉ±MÑ…Ñ”¹µ½‘”€„ôô€‰Á…ÉÑ¹•Èˆ€˜˜¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È€ü€ (€€€€€€€€€€€€€É•¹‘•ÉM…Ù•‘½±±•Ñ¥½¹A…¹•° ¤(€€€€€€€€€€€€¤€èÕÉ±MÑ…Ñ”¹µ½‘”€„ôô€‰Á…ÉÑ¹•Èˆ€˜˜…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰¥¹™¼ˆ€ü€ (€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°‘ÀµÉ•Í¥‘•¹Ğµ¥¹™¼µÑ…ˆµÁ…¹•°µ¥¸µ ´À™±•à´Ä½Ù•É™±½Üµ¡¥‘‘•¸ˆø(€€€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°µ±¥ÍĞ‘ÀµÉ•Í¥‘•¹Ğµ¥¹™¼µÍÉ½±°µ¥¸µ ´À™±•à´Ä½Ù•É™±½Üµäµ…ÕÑ¼½Ù•ÉÍÉ½±°µ½¹Ñ…¥¸ÁÈ´Älµİ•‰­¥Ğµ½Ù•É™±½ÜµÍÉ½±±¥¹œéÑ½Õ¡tˆ(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€íÉ•¹‘•É%¹™½A…¹•° ¥ô(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€¤€èÕÉ±MÑ…Ñ”¹µ½‘”€„ôô€‰Á…ÉÑ¹•Èˆ€ü€ (€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°µ¥¸µ ´À™±•à´Ä½Ù•É™±½Üµ¡¥‘‘•¸ˆø(€€€€€€€€€€€€€íÉ•Í¥‘•¹ÑA…¹•±½Áä€˜˜€ (€€€€€€€€€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°µ¡•…‘•Èˆø(€€€€€€€€€€€€€€€€€€ñÀùíÉ•Í¥‘•¹ÑA…¹•±½Áä¹•å•‰É½İôğ½Àø(€€€€€€€€€€€€€€€€€€ñ ÈùíÉ•Í¥‘•¹ÑA…¹•±½Áä¹Ñ¥Ñ±•ôğ½ Èø(€€€€€€€€€€€€€€€€€€ñÍÁ…¸ùíÉ•Í¥‘•¹ÑA…¹•±½Áä¹‰½‘åôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ñÍÑÉ½¹œùíÉ•Í¥‘•¹ÑI•ÍÕ±Ñ½Õ¹Ñ1…‰•±ôğ½ÍÑÉ½¹œø(€€€€€€€€€€€€€€€€ğ½Í•Ñ¥½¸ø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÑ…ˆµÁ…¹•°µ±¥ÍĞµ¥¸µ ´À™±•à´ÄÍÁ…”µä´Ä¸Ô½Ù•É™±½Üµäµ…ÕÑ¼½Ù•ÉÍÉ½±°µ½¹Ñ…¥¸ÁÈ´Älµİ•‰­¥Ğµ½Ù•É™±½ÜµÍÉ½±±¥¹œéÑ½Õ¡tµéÍÁ…”µä´Èˆ(€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€í‘É…İ•ÉAÉ•Ù¥•İA±…•Ì¹µ…À ¡Á±…”¤€ôø€ (€€€€€€€€€€€€€€€€  ¤€ôøì(€€€€€€€€€€€€€€€€€½¹ÍĞ¥ÍI•¹Ñ…±I½Ü€ô¥ÍI•¹Ñ…±¹Ñ¥Ñä¡Á±…”¤ì(€€€€€€€€€€€€€€€€€¥˜€¡¥ÍI•¹Ñ…±I½Ü¤ì(€€€€€€€€€€€€€€€€€€€½¹ÍĞÉ•¹Ñ…°€ô•ÑI•¹Ñ…±1¥ÍÑ¥¹…Ñ„¡Á±…”¤ì(€€€€€€€€€€€€€€€€€€€½¹ÍĞ™…ÑÌ€ôl(€€€€€€€€€€€€€€€€€€€€€É•¹Ñ…°¹‰•‘Ì€„ôôÕ¹‘•™¥¹•€ü€‘íÉ•¹Ñ…°¹‰•‘Íô‰‘€€è€ˆˆ°(€€€€€€€€€€€€€€€€€€€€€É•¹Ñ…°¹‰…Ñ¡Ì€„ôôÕ¹‘•™¥¹•€ü€‘íÉ•¹Ñ…°¹‰…Ñ¡Íô‰…€€è€ˆˆ°(€€€€€€€€€€€€€€€€€€€€€É•¹Ñ…°¹ÍÅ™Ğ€ü€‘í9Õµ‰•È¡É•¹Ñ…°¹ÍÅ™Ğ¤¹Ñ½1½…±•MÑÉ¥¹œ ¥ôÍÅ™Ñ€€è€ˆˆ°(€€€€€€€€€€€€€€€€€€€t¹™¥±Ñ•È¡	½½±•…¸¤¹©½¥¸ ˆƒ
Ü€ˆ¤ì(€€€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€€€€€­•äõíÁ±…”¹¥‘ô(€€€€€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô(€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”õí‘Àµ‘¥É•Ñ½ÉäµÉ•ÍÕ±ĞµÉ½Ü‘ÀµÉ•¹Ñ…°µ±¥ÍĞµÉ½ÜÉ¥Üµ™Õ±°É¥µ½±ÌµlÌÑÁá|Å™É}…ÕÑ½t¥Ñ•µÌµÍÑ…ÉĞ…À´ÈÀ´Ä¸ÔÑ•áĞµ±•™ĞÑÉ…¹Í¥Ñ¥½¸µ…±°µéÉ¥µ½±ÌµlĞÉÁá|Å™É}…ÕÑ½tµé…À´ÌµéÀ´È€‘ì(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”¹¥€ôôôÍ•±•Ñ•‘%€ü€‰‘ÀµÁ…¹•°µÉ½Ü¥ÌµÍ•±•Ñ•Ñ•áĞµlŒÁÅÌÍtˆ€è€‰‘ÀµÁ…¹•°µÉ½ÜÑ•áĞµlŒÁÅÌÍtˆ(€€€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€€€ñA¥¹	…‘”Á±…”õíÁ±…•ôÍ•±•Ñ•õíÁ±…”¹¥€ôôôÍ•±•Ñ•‘%‘ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰µ¥¸µÜ´Àˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµ½¹Ñ•áĞ‰±½¬ÑÉÕ¹…Ñ”ˆùÑ¥Ù”ƒ
ÜíÉ•¹Ñ…°¹ÁÉ¥•1…‰•±ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½ÉäµÍÑ½Éä‰±½¬ÑÉÕ¹…Ñ”ˆùíÉ•¹Ñ…°¹…‘‘É•ÍÌñğÁ±…”¹¹…µ•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµµ•…¹¥¹œµĞ´À¸Ô‰±½¬ÑÉÕ¹…Ñ”ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€í™…ÑÍôƒ
Ü	Õ¥±‘¥¹œèíÉ•¹Ñ…°¹‰Õ¥±‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµµ•…¹¥¹œµĞ´À¸Ô‰±½¬ÑÉÕ¹…Ñ”ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€U¹¥ĞíÉ•¹Ñ…°¹Õ¹¥Ñôƒ
Ü51LíÉ•¹Ñ…°¹µ±Íôƒ
ÜíÉ•¹Ñ…°¹¹•¥¡‰½É¡½½‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµ…Ñ¥½¸ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€•Ñ…¥±Ì(€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€€€ô(€€€€€€€€€€€€€€€€€½¹ÍĞ½™™•È€ô•Ñ…¹½¹¥…±I•Í¥‘•¹Ñ=™™•È¡Á±…”¤ñğ•ÑI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì¡Á±…”¤ì(€€€€€€€€€€€€€€€€€½¹ÍĞ½™™•ÉQ¥Ñ±”€ô½™™•Èü¹Ñ¥Ñ±”ñğ½™™•Èü¹½™™•ÈñğÁ±…”¹Á•É¬ü¹½™™•ÈñğÁ±…”¹É•½µµ•¹‘•‘}Á•É¬ñğÁ±…”¹Á…ÉÑ¹•É}½ÁÁ½ÉÑÕ¹¥Ñäñğ€ˆˆì(€€€€€€€€€€€€€€€€€½¹ÍĞ¥ÍA•É­I½Ü€ô…Ñ¥Ù•	½ÑÑ½µQ…ˆ€ôôô€‰Á•É­Ìˆ€˜˜¡…ÍÑ¥Ù•A•É­…Ñ„¡Á±…”¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ…ÉÑ¥±”(€€€€€€€€€€€€€€€€€€€€€­•äõíÁ±…”¹¥‘ô(€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”õí‘Àµ‘¥É•Ñ½ÉäµÉ•ÍÕ±ĞµÉ½Ü‘ÀµÉ•Í¥‘•¹Ğµ¹…Ñ¥Ù”µÉ½ÜÉ¥Üµ™Õ±°É¥µ½±ÌµlÌÑÁá|Å™Ét¥Ñ•µÌµÍÑ…ÉĞ…À´ÈÀ´Ä¸ÔÑ•áĞµ±•™ĞÑÉ…¹Í¥Ñ¥½¸µ…±°µéÉ¥µ½±ÌµlĞÉÁá|Å™Étµé…À´ÌµéÀ´È€‘ì(€€€€€€€€€€€€€€€€€€€€€€€Á±…”¹¥€ôôôÍ•±•Ñ•‘%€ü€‰‘ÀµÁ…¹•°µÉ½Ü¥ÌµÍ•±•Ñ•Ñ•áĞµlŒÁÅÌÍtˆ€è€‰‘ÀµÁ…¹•°µÉ½ÜÑ•áĞµlŒÁÅÌÍtˆ(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€ñA¥¹	…‘”Á±…”õíÁ±…•ôÍ•±•Ñ•õíÁ±…”¹¥€ôôôÍ•±•Ñ•‘%‘ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰µ¥¸µÜ´À‘ÀµÉ•Í¥‘•¹Ğµ¹…Ñ¥Ù”µÉ½Üµ‰½‘äˆø(€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹Ğµ¹…Ñ¥Ù”µÉ½Üµµ…¥¸ˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô…É¥„µ±…‰•°õí=Á•¸€‘íÁ±…”¹¹…µ•õôø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµ½¹Ñ•áĞ‰±½¬ÑÉÕ¹…Ñ”ˆùí½™™•Èü¹…Ñ•½ÉäñğÁ±…”¹…Ñ•½Éäñğ€‰½İ¹Ñ½İ¸Á±…”‰ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½ÉäµÍÑ½Éä‰±½¬ÑÉÕ¹…Ñ”ˆùíÁ±…”¹¹…µ•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘Àµ‘¥É•Ñ½Éäµµ•…¹¥¹œµĞ´À¸Ô‰±½¬ˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€íÁ±…”¹‘¥ÍÑÉ¥Ğ€ü€‘íÁ±…”¹‘¥ÍÑÉ¥Ñôƒ
Ü€€è€ˆ‰õí½™™•ÉQ¥Ñ±”ñğ€‰áÁ±½É”İ¡…Ğ¥ÌÕÍ•™Õ°¹•…É‰ä¸‰ô(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€í¥ÍA•É­I½Ü€ü€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÉ½Üµ…Ñ¥½¸µÍÑÉ¥Àˆ…É¥„µ±…‰•°õí€‘íÁ±…”¹¹…µ•ôÁ•É¬…Ñ¥½¹Íôø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÑ½±•M…Ù•¡Á±…”¥ô…É¥„µÁÉ•ÍÍ•õíÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¥ôø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€íÍ…Ù•‘%‘Ì¹¡…Ì¡Á±…”¹¥¤€ü€‰M…Ù•ˆ€è€‰M…Ù”‰ô(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ„¡É•˜õí‘¥É•Ñ¥½¹ÍUÉ°¡Á±…”¥ôÑ…É•Ğô‰}‰±…¹¬ˆÉ•°ô‰¹½É•™•ÉÉ•Èˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¥É•Ñ¥½¹Ì(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½„ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ôùY¥•ÜÁ•É¬ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ•Í¥‘•¹ĞµÉ½Üµ…Ñ¥½¸µÍÑÉ¥Àˆ…É¥„µ±…‰•°õí€‘íÁ±…”¹¹…µ•ô…Ñ¥½¹Íôø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ôùY¥•Ü‘•Ñ…¥±Ìğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô¤ ¤(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€€ì…‘É…İ•ÉAÉ•Ù¥•İA±…•Ì¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÉ½Ü‰œµİ¡¥Ñ”À´ĞÑ•áĞµlÄÍÁát±•…‘¥¹œ´ØÑ•áĞµlŒĞÈÔĞØÙtˆø(€€€€€€€€€€€€€€€€€9½Ñ¡¥¹œ¡•É”å•Ğ¸QÉä„¹•…É‰äÍ•…É °Í…Ù”„Á±…”°½ÈÍİ¥Ñ ™¥±Ñ•ÉÌ¸(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€í¥ÍUÍ¥¹…±±‰…­A±…•Ì€˜˜€ (€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘Àµ¥¹™¼µÉ½Ü‰œµİ¡¥Ñ”À´ĞÑ•áĞµlÄÍÁát±•…‘¥¹œ´ØÑ•áĞµlŒĞÈÔĞØÙtˆø(€€€€€€€€€€€€€€€€€-••Á¥¹œ¹•…É‰ä‘½İ¹Ñ½İ¸Á±…•ÌÙ¥Í¥‰±”İ¡¥±”å½ÕÈÅÕ•ÍÑ¥½¸Í½ÉÑÌÑ¡”‰•ÍĞ¹•áĞ½ÁÑ¥½¹Ì¸(€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€ì¡¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È€üÉ•Í¥‘•¹ÑM…Ù•‘A±…•Ì€è‘¥Í½Ù•É¥ÍÁ±…åA±…•Ì¤¹±•¹Ñ €ø€Ğ€˜˜€ (€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•ÑI•ÍÕ±ÑÍáÁ…¹‘• ¡Ù…±Õ”¤€ôø€…Ù…±Õ”¥ô(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ…Ñ¥½¸µ±¥¹¬Üµ™Õ±°©ÕÍÑ¥™äµ•¹Ñ•È‰œµÑÉ…¹ÍÁ…É•¹ĞÑ•áĞµlÄÅÁátÑ•áĞµlŒÁÅÌÍt¼ØØˆ(€€€€€€€€€€€€€€€€€…É¥„µ•áÁ…¹‘•õíÉ•ÍÕ±ÑÍáÁ…¹‘•‘ô(€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€íÉ•ÍÕ±ÑÍáÁ…¹‘•€ü€‰M¡½Ü±•ÍÌˆ€èM¡½Üµ½É”€ ‘í¥ÍI•Í¥‘•¹ÑM…Ù•‘É…İ•È€ü¡¥‘‘•¹M…Ù•‘AÉ•Ù¥•İ½Õ¹Ğ€è¡¥‘‘•¹AÉ•Ù¥•İ½Õ¹Ñô¥ô(€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€¤€è¹Õ±±ô(€€€€€€€€€€ğ½µ½Ñ¥½¸¹…Í¥‘”ø(€€€€€€€€¥ô(€€€€€€ğ½¹¥µ…Ñ•AÉ•Í•¹”ø((€€€€€€ñ¹¥µ…Ñ•AÉ•Í•¹”ø(€€€€€€€í±ÕÍÑ•ÉÉ…İ•È€˜˜ÕÉ±MÑ…Ñ”¹Ñ…ˆ€ôôô€‰µ…Àˆ€˜˜€ …Í•±•Ñ•ñğÍ•±•Ñ•‘É…İ•É±½Í•¤€˜˜€ (€€€€€€€€€€ñµ½Ñ¥½¸¹…Í¥‘”(€€€€€€€€€€€É•˜õí½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…•ô(€€€€€€€€€€€¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ĞĞõô(€€€€€€€€€€€…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€Àõô(€€€€€€€€€€€•á¥Ğõíì½Á…¥Ñäè€À°äè€ĞĞõô(€€€€€€€€€€€ÑÉ…¹Í¥Ñ¥½¸õíì‘ÕÉ…Ñ¥½¸è€À¸ÈĞ°•…Í”èlÀ¸ÈÈ°€Ä°€À¸ÌØ°€Åtõô(€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ¹…Ñ¥Ù”µ‘É…İ•È‘ÀµÁ…¹•°µÍ¡•±°‘Àµµ…Àµ‘É…İ•ÈµÍ¡•±°…‰Í½±ÕÑ”¥¹Í•Ğµà´À‰½ÑÑ½´´ÀèµlØĞÁtµàµ…ÕÑ¼™±•àµ…àµ µmµ¥¸ àá‘Ù ±…±Œ ÄÀÁ‘Ù ´ÜÉÁà¤¥tµ¥¸µ ´ÀÜµ™Õ±°µ…àµÜ´Íá°™±•àµ½°½Ù•É™±½Üµ¡¥‘‘•¸É½Õ¹‘•µĞµlÄÉÁátµéµ…àµ µlØá‘Ù¡tµéÉ½Õ¹‘•µĞµlÄÉÁátˆ(€€€€€€€€€€€‘…Ñ„µ‘É…İ•ÈµÍÑ…Ñ”ô‰•áÁ…¹‘•ˆ(€€€€€€€€€€€ÍÑå±”õí5A}I]I}MUI}MQe1ô(€€€€€€€€€€€‘…Ñ„µµ½‰¥±”µÁ…¹•°µÍÕÉ™…”ô‰ÑÉÕ”ˆ(€€€€€€€€€€€É½±”ô‰‘¥…±½œˆ(€€€€€€€€€€€…É¥„µµ½‘…°ô‰ÑÉÕ”ˆ(€€€€€€€€€€€…É¥„µ±…‰•°ô‰É½ÕÁ•µ…ÀÁ±…•Ìˆ(€€€€€€€€€€ø(€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ¡•…‘•ÈÍ¡É¥¹¬´Àˆø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰‰ÕÑÑ½¸ˆ½¹±¥¬õí½	…­Q½5…Áô±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ‰…¬ˆ…É¥„µ±…‰•°ô‰	…¬Ñ¼µ…Àˆø(€€€€€€€€€€€€€€€€ñÉÉ½İ1•™Ğ±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ€¼ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ¡•…‘•Èµ½Áäˆø(€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µÑ¥Ñ±”ˆùí•Ñ±ÕÍÑ•ÉQ¥Ñ±”¡±ÕÍÑ•ÉÉ…İ•È°ÕÉ±MÑ…Ñ”¹µ½‘”¥ôğ½ Èø(€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µÍÕ‰Ñ¥Ñ±”ˆùí•Ñ±ÕÍÑ•ÉMÕ‰Ñ¥Ñ±”¡±ÕÍÑ•ÉÉ…İ•È°ÕÉ±MÑ…Ñ”¹µ½‘”¥ôğ½Àø(€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€€€€€€€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì•¹Ñ¥Ñå%è€ˆˆ°‘É…İ•É±½Í•è€ˆˆô¤ì(€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ±½Í”ˆ(€€€€€€€€€€€€€€€…É¥„µ±…‰•°ô‰±½Í”ˆ(€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€ñ`±…ÍÍ9…µ”ô‰ ´ĞÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µ±¥ÍĞµ¥¸µ ´À™±•à´Äˆø(€€€€€€€€€€€€€í±ÕÍÑ•ÉA±…•Í½ÉÉ…İ•È¹µ…À ¡Á±…”¤€ôøì(€€€€€€€€€€€€€€€½¹ÍĞ±¥ÍÑ¥¹œ€ô•Ñ1••¹‘Í1¥ÍÑ¥¹œ¡Á±…”¤ì(€€€€€€€€€€€€€€€½¹ÍĞ•áÁ±¥¥Ñ=™™•È€ô•ÑáÁ±¥¥ÑÉ½ÕÁ•‘=™™•È¡Á±…”¤ì(€€€€€€€€€€€€€€€½¹ÍĞÉ½İ5•Ñ„€ômÁ±…”¹…Ñ•½Éäñğ€‰½İ¹Ñ½İ¸Á±…”ˆ°Á±…”¹‘¥ÍÑÉ¥ĞñğÁ±…”¹¹•¥¡‰½É¡½½ñğ€‰½İ¹Ñ½İ¸‰t¹™¥±Ñ•È¡	½½±•…¸¤¹©½¥¸ ˆƒ
Ü€ˆ¤ì(€€€€€€€€€€€€€€€½¹ÍĞ±¥ÍÑ¥¹5•Ñ„€ô±¥ÍÑ¥¹œ(€€€€€€€€€€€€€€€€€€üm±¥ÍÑ¥¹œ¹ÁÉ¥”°±¥ÍÑ¥¹œ¹‰•‘Ì€ü€‘í±¥ÍÑ¥¹œ¹‰•‘Íô‰‘€€è€ˆˆ°±¥ÍÑ¥¹œ¹‰…Ñ¡Ì€ü€‘í±¥ÍÑ¥¹œ¹‰…Ñ¡Íô‰…€€è€ˆˆ°±¥ÍÑ¥¹œ¹ÍÅ™Ğ€ü€‘í±¥ÍÑ¥¹œ¹ÍÅ™ÑôÍÅ™Ñ€€è€ˆ‰t¹™¥±Ñ•È¡	½½±•…¸¤¹©½¥¸ ˆƒ
Ü€ˆ¤(€€€€€€€€€€€€€€€€€€è€ˆˆì(€€€€€€€€€€€€€€€½¹ÍĞ½™™•É1¥¹”€ô±¥ÍÑ¥¹5•Ñ„ñğ•áÁ±¥¥Ñ=™™•Èì(€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸(€€€€€€€€€€€€€€€€€€€­•äõíÁ±…”¹¥‘ô(€€€€€€€€€€€€€€€€€€€ÑåÁ”ô‰‰ÕÑÑ½¸ˆ(€€€€€€€€€€€€€€€€€€€½¹±¥¬õì ¤€ôøÍ•±•ÑA±…”¡Á±…”¥ô(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µÉ½Üˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µ¥½¸ˆø(€€€€€€€€€€€€€€€€€€€€€€ñA¥¹	…‘”Á±…”õíÁ±…•ô€¼ø(€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µ½Áäˆø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µÑ¥Ñ±”ˆùíÁ±…”¹¹…µ•ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µµ•Ñ„ˆùíÉ½İ5•Ñ…ôğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€€í½™™•É1¥¹”€˜˜€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µ½™™•Èˆùí½™™•É1¥¹•ôğ½ÍÁ…¸ùô(€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰‘ÀµÉ½ÕÁ•µÍÑ…ÑÕÌˆø(€€€€€€€€€€€€€€€€€€€€€í±¥ÍÑ¥¹œ€ü€‰½¹Ñ…Ğˆ€è€‰=Á•¸‰ô(€€€€€€€€€€€€€€€€€€€€ğ½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€ô¥ô(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½µ½Ñ¥½¸¹…Í¥‘”ø(€€€€€€€€¥ô(€€€€€€ğ½¹¥µ…Ñ•AÉ•Í•¹”ø((€€€€€€ñ¹¥µ…Ñ•AÉ•Í•¹”ø(€€€€€€€íÍ•±•Ñ•€˜˜€…Í•±•Ñ•‘É…İ•É±½Í•€˜˜€……Ñ¥Ù•A…ÉÑ¹•ÉA…¹•°€˜˜ÕÉ±MÑ…Ñ”¹Ñ…ˆ€„ôô€‰Á…ÍÌˆ€˜˜€ (€€€€€€€€€€ñµ½Ñ¥½¸¹…Í¥‘”(€€€€€€€€€€€¥ô‰‘Àµ…Ñ¥Ù”µµ…Àµ‘É…İ•Èˆ(€€€€€€€€€€€É•˜õí½¹™¥ÕÉ•5½‰¥±•A…¹•±MÕÉ™…•ô(€€€€€€€€€€€¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ˆÄÀÀ”ˆõô(€€€€€€€€€€€…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€Àõô(€€€€€€€€€€€•á¥Ğõíì½Á…¥Ñäè€À°äè€ˆÄÀÀ”ˆõô(€€€€€€€€€€€ÑÉ…¹Í¥Ñ¥½¸õíì‘ÕÉ…Ñ¥½¸è€À¸ÈĞ°•…Í”èlÀ¸ÈÈ°€Ä°€À¸ÌØ°€Åtõô(€€€€€€€€€€€±…ÍÍ9…µ”õí¥Í%¹-¥¹‘9•Ñİ½É­¹Ñ¥Ñä¡Í•±•Ñ•¤(€€€€€€€€€€€€€€ü€‰‘Àµ¹…Ñ¥Ù”µ‘É…İ•È‘Àµµ…Àµ‘•Ñ…¥°µÍ¡••Ğ‘Àµ¥¹­¥¹µÁ…ÉÑ¹•Èµ‘É…İ•È‘Àµµ…ÀµÁ…¹•°‘ÀµÁ…¹•°µÍ¡•±°‘Àµ‘•Ñ…¥°µ‘É…İ•È‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ‘É…İ•È‘Àµ‘•Ñ…¥°µ™É…µ•İ½É¬‘Àµµ…Àµ‘É…İ•ÈµÁ…¹•°‘Àµ¥½Ìµ™Õ±±ÍÉ••¸µµ…ÀµÁ…¹•°ˆ(€€€€€€€€€€€€€€è‘Àµ¹…Ñ¥Ù”µ‘É…İ•È‘Àµµ…Àµ‘•Ñ…¥°µÍ¡••Ğ‘Àµµ…ÀµÁ…¹•°‘ÀµÁ…¹•°µÍ¡•±°‘Àµ‘•Ñ…¥°µ‘É…İ•È‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ‘É…İ•È‘Àµ‘•Ñ…¥°µ™É…µ•İ½É¬‘Àµµ…Àµ‘É…İ•ÈµÁ…¹•°‘Àµ¥½Ìµ™Õ±±ÍÉ••¸µµ…ÀµÁ…¹•°€‘íÕÍ•Í±•…¹I•Í¥‘•¹Ñ¥…±¹Ñ¥ÑåÉ…İ•È¡Í•±•Ñ•¤€ü€‰‘Àµ•¹Ñ¥Ñäµ‘É…İ•ÈµÍ¡•±°ˆ€è€ˆ‰ô€‘íÍ¡½Õ±‘UÍ•A…ÉÑ¹•É%¹Ñ•±±¥•¹•É…İ•È¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”¤€ü€‰‘ÀµÁ…ÉÑ¹•Èµ‘•ÍÑ¥¹…Ñ¥½¸µÍ¡••Ğˆ€è€ˆ‰õô(€€€€€€€€€€€‘…Ñ„µÁ…¹•°µ­¥¹õí•Ñ5…ÁÉ…İ•ÉA…¹•±-¥¹¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¥ô(€€€€€€€€€€€‘…Ñ„µÁ…¹•°µ±…å½ÕĞô‰‘•Ñ…¥°ˆ(€€€€€€€€€€€‘…Ñ„µ‘É…İ•ÈµÍÑ…Ñ”õí‘•Ñ…¥±É…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€‘…Ñ„µÍ¡••ĞµÍÑ…Ñ”õí‘•Ñ…¥±É…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€‘…Ñ„µµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€‘…Ñ„µ•¹Ñ¥ÑäµÑåÁ”õí•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¥ô(€€€€€€€€€€€‘…Ñ„µµ½‰¥±”µÁ…¹•°µÍÕÉ™…”ô‰ÑÉÕ”ˆ(€€€€€€€€€€€É½±”ô‰‘¥…±½œˆ(€€€€€€€€€€€…É¥„µµ½‘…°ô‰ÑÉÕ”ˆ(€€€€€€€€€€€…É¥„µ±…‰•±±•‘‰äõíl‰Á•É¬ˆ°€‰•Ù•¹Ğˆ°€‰…µÁ…¥¸ˆ°€‰Á½ÉÑ™½±¥¼‰t¹¥¹±Õ‘•Ì¡•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤¤(€€€€€€€€€€€€€€ü…¹½¹¥…°µ‘•Ñ…¥°µÑ¥Ñ±”´‘íÍ•±•Ñ•¹¥‘õ€(€€€€€€€€€€€€€€èÍ¡½Õ±‘UÍ•A…ÉÑ¹•É%¹Ñ•±±¥•¹•É…İ•È¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”¤€üÁ…ÉÑ¹•Èµ‘É…İ•ÈµÑ¥Ñ±”´‘íÍ•±•Ñ•¹¥‘õ€€èÕ¹‘•™¥¹•‘ô(€€€€€€€€€€€…É¥„µ±…‰•°õíl‰Á•É¬ˆ°€‰•Ù•¹Ğˆ°€‰…µÁ…¥¸ˆ°€‰Á½ÉÑ™½±¥¼‰t¹¥¹±Õ‘•Ì¡•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤¤(€€€€€€€€€€€€€€üÕ¹‘•™¥¹•(€€€€€€€€€€€€€€èÍ¡½Õ±‘UÍ•A…ÉÑ¹•É%¹Ñ•±±¥•¹•É…İ•È¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”¤€üÕ¹‘•™¥¹•€è€‘íÍ•±•Ñ•¹¹…µ•ô‘•Ñ…¥±Íô(€€€€€€€€€€ø(€€€€€€€€€€€€ñ5…Á•Ñ…¥±!•…‘•È(€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€¹…Ù¥…Ñ¥½¹Q¥Ñ±”õí•Ñ5…Á•Ñ…¥±9…Ù¥…Ñ¥½¹Q¥Ñ±”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤°ÕÉ±MÑ…Ñ”¹µ½‘”¥ô(€€€€€€€€€€€€€‰…­1…‰•°õí•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤€ôôô€‰Á•É¬ˆ€ü€‰	…¬Ñ¼…Ñ¥Ù”Á•É­Ìˆ€è€‰	…¬‰ô(€€€€€€€€€€€€€Á…¹•±MÑ…Ñ”õí‘•Ñ…¥±É…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€€€½¹A…¹•±MÑ…Ñ•¡…¹”õíÕÁ‘…Ñ••Ñ…¥±É…İ•ÉMÑ…Ñ•ô(€€€€€€€€€€€€€…¹½	…¬õí	½½±•…¸ ¡¥Í%¹-¥¹‘¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€…¥Í%¹-¥¹‘9•Ñİ½É­¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜¥¹-¥¹‘A…É•¹ÑI•˜¹ÕÉÉ•¹Ğ¤ñğÁ••­A…¹•±MÑ…Ñ” ¤¥ô(€€€€€€€€€€€€€½¹	…¬õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€½¹ÍĞÁ…É•¹Ğ€ô¥¹-¥¹‘A…É•¹ÑI•˜¹ÕÉÉ•¹Ğì(€€€€€€€€€€€€€€€€€€€¥˜€¡¥Í%¹-¥¹‘¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€…¥Í%¹-¥¹‘9•Ñİ½É­¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜Á…É•¹Ğ¤ì(€€€€€€€€€€€€€€€€€€€€€¥¹-¥¹‘A…É•¹ÑI•˜¹ÕÉÉ•¹Ğ€ô¹Õ±°ì(€€€€€€€€€€€€€€€€€€€€€Í•±•ÑA±…”¡Á…É•¹Ğ¤ì(€€€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•¥±Ñ•È ‰¥¹-¥¹ˆ¤ì(€€€€€€€€€€€€€€€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì™¥±Ñ•Èè€‰¥¹-¥¹ˆ°½±±•Ñ¥½¸è€‰¥¹­¥¹µ‘¥¹¥¹œµµ…É­•Ğˆ°•¹Ñ¥Ñå%èÁ…É•¹Ğ¹¥°±¥ÍÑ¥¹%è€ˆˆô¤ì(€€€€€€€€€€€€€€€€€€€ô•±Í”É•ÍÑ½É•AÉ•Ù¥½ÕÍ5…ÁA…¹•° ¤ì(€€€€€€€€€€€€€õô(€€€€€€€€€€€€€½¹±½Í”õí±½Í•M•±•Ñ•‘5…ÁÉ…İ•Éô(€€€€€€€€€€€€¼ø(€€€€€€€€€€€€ñ‘¥Ø(€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘•Ñ…¥°µÍÉ½±°‘Àµµ…ÀµÁ…¹•°µÍÉ½±°‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µÍÉ½±°‘Àµ‘É…İ•ÈµÍÉ½±°ˆ(€€€€€€€€€€€€ø(€€€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰‘Àµµ…Àµ‘•Ñ…¥°µ½¹Ñ•¹Ğˆø(€€€€€€€€€€€€€ì  ¤€ôøì(€€€€€€€€€€€€€€€½¹ÍĞ•¹Ñ¥Ñå-¥¹€ô•ÑI•Í¥‘•¹Ñ¹Ñ¥Ñå-¥¹¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ±••¹‘Í1¥ÍÑ¥¹œ€ô•ÑI•Í½±Ù•‘1••¹‘Í1¥ÍÑ¥¹œ¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍI•¹Ñ…°€ô•¹Ñ¥Ñå-¥¹€ôôô€‰É•¹Ñ…°ˆñğ¥ÍI•¹Ñ…±¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í…µÁ…¥¸€ô•¹Ñ¥Ñå-¥¹€ôôô€‰…µÁ…¥¸ˆñğ¥Í…µÁ…¥¹¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍA•É­A…¹•°€ôÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤€ôôô€‰Á•É¬ˆì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍAÉ½Á•ÉÑä€ô€…¥ÍI•¹Ñ…°€˜˜€¡•¹Ñ¥Ñå-¥¹€ôôô€‰ÁÉ½Á•ÉÑäˆñğ	½½±•…¸¡±••¹‘Í1¥ÍÑ¥¹œñğ•Ñ1ÕáÕÉåAÉ•Í•¹•	Õ¥±‘¥¹œ¡Í•±•Ñ•¤ñğ¥Í1••¹‘Í1¥ÍÑ¥¹1¥­”¡Í•±•Ñ•¤¤¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍA…É­¥¹œ€ô¥ÍA…É­¥¹¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í……MÑ½À€ô¥Í……Q½ÕÉA±…”¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í……¥Ù¥Œ€ô¥Í……¥Ù¥¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í%¹-¥¹‘¥¹¥¹œ€ô¥Í%¹-¥¹‘¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í%¹-¥¹‘9•Ñİ½É¬€ô¥Í%¹-¥¹‘9•Ñİ½É­¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í	ÕÉ•É	…ÉA…¹•°€ô¥Í	ÕÉ•É	…É½¹É•ÍÌ¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í1½…±M•ÉÙ¥”€ô¥Í1½…±M•ÉÙ¥•¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍÉ½ÍÑQ½İ•ÉA…¹•°€ô¥ÍÉ½ÍÑQ½İ•É¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í9•¥¡‰½É¡½½‘A…¹•°€ô¥Í9•¥¡‰½É¡½½‘¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ¥Í!½ÍÁ¥Ñ…±¥ÑåA½ÉÑ™½±¥¼€ô•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤€ôôô€‰Á½ÉÑ™½±¥¼ˆì(€€€€€€€€€€€€€€€½¹ÍĞ¥ÍÙ•¹ÑA…¹•°€ô¥ÍÙ•¹Ñ¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€…¥Í…µÁ…¥¸€˜˜€…¥Í!…ÁÁå!½ÕÉ¹Ñ¥Ñä¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€ô•Ñ1••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ñ½ÉA±…”¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ±••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±”€ô•Ñ1••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±•½ÉA±…”¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€½¹ÍĞ½¹Ñ…Ñ½Éµ%€ôµ…Àµ½¹Ñ…Ğµ™½É´´‘íÍ•±•Ñ•¹¥‘õ€ì(€€€€€€€€€€€€€€€½¹ÍĞ½Á•¹½¹Ñ…Ñ½É´€ô€ ¤€ôøì(€€€€€€€€€€€€€€€€€Í•Ñ•¹Ñ½ÉµA±…•%¡Í•±•Ñ•¹¥¤ì(€€€€€€€€€€€€€€€€€Í•Ñ•¹Ñ½ÉµMÕ‰µ¥ÑÑ•¡™…±Í”¤ì(€€€€€€€€€€€€€€€€€İ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕĞ  ¤€ôøì(€€€€€€€€€€€€€€€€€€€‘½Õµ•¹Ğ¹•Ñ±•µ•¹Ñ	å%¡½¹Ñ…Ñ½Éµ%¤ü¹ÍÉ½±±%¹Ñ½Y¥•Ü¡ì‰±½¬è€‰¹•…É•ÍĞˆ°‰•¡…Ù¥½Èè€‰Íµ½½Ñ ˆô¤ì(€€€€€€€€€€€€€€€€€ô°€àÀ¤ì(€€€€€€€€€€€€€€€ôì(€€€€€€€€€€€€€€€½¹ÍĞ±½Í•M•±•Ñ•‘É…İ•È€ô€ ¤€ôøì(€€€€€€€€€€€€€€€€€±½Í•M•±•Ñ•‘5…ÁÉ…İ•È ¤ì(€€€€€€€€€€€€€€€ôì(€€€€€€€€€€€€€€€½¹ÍĞÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ğ€ô€¡•Ù•¹Ñ9…µ”°µ•Ñ…‘…Ñ„€ôíô¤€ôøì(€€€€€€€€€€€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°•Ù•¹Ñ9…µ”°€‰…¹½¹¥…±}‘•Ñ…¥±}Á…¹•°ˆ°ì(€€€€€€€€€€€€€€€€€€€µ•Ñ…‘…Ñ„èì(€€€€€€€€€€€€€€€€€€€€€•¹Ñ¥ÑåQåÁ”è•Ñ…¹½¹¥…±•Ñ…¥±¹Ñ¥ÑåQåÁ”¡Í•±•Ñ•°	½½±•…¸¡ÕÉ±MÑ…Ñ”¹Á•É­%¤¤°(€€€€€€€€€€€€€€€€€€€€€Á…¹•±MÑ…Ñ”è‘•Ñ…¥±É…İ•ÉMÑ…Ñ”°(€€€€€€€€€€€€€€€€€€€€€Í½ÕÉ•MÕÉ™…”èÕÉ±MÑ…Ñ”¹½±±•Ñ¥½¸€ü€‰½±±•Ñ¥½¸ˆ€è€‰µ…Àˆ°(€€€€€€€€€€€€€€€€€€€€€€¸¸¹µ•Ñ…‘…Ñ„°(€€€€€€€€€€€€€€€€€€€ô°(€€€€€€€€€€€€€€€€€ô¤¤ì(€€€€€€€€€€€€€€€ôì(€€€€€€€€€€€€€€€½¹ÍĞ½Á•¹¹Ñ¥Ñå¥±Ñ•È€ô€¡™¥±Ñ•È¤€ôøì(€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡™¥±Ñ•È¤ì(€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ ‰µ…Àˆ¤ì(€€€€€€€€€€€€€€€ôì(€€€€€€€€€€€€€€€½¹ÍĞÍ¡½Õ±‘M¡½İMÑ…¹‘…É‘Ñ¥½¹A…¹•°€ô™…±Í”ì(€€€€€€€€€€€€€€€½¹ÍĞÍÑ…¹‘…É‘Ñ¥½¹A…¹•°€ôÍ¡½Õ±‘M¡½İMÑ…¹‘…É‘Ñ¥½¹A…¹•°€ü€ (€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ÀĞ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€ñ5…ÁÑ¥½¹MÑ…¹‘…É‘A…¹•°(€€€€€€€€€€€€€€€€€€€€€•¹Ñ¥ÑäõíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•õíÍ…Ù•‘%‘Ì¹¡…Ì¡Í•±•Ñ•¹¥¥ô(€€€€€€€€€€€€€€€€€€€€€ÉÍÙÁ•õì¡ÉÉ…ä¹¥ÍÉÉ…ä¡•Ù•¹ÑIÍÙÁÌ¤€ü•Ù•¹ÑIÍÙÁÌ€èmt¤¹Í½µ” ¡¥Ñ•´¤€ôø¥Ñ•´¹¥€ôôôÍ•±•Ñ•¹¥¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹IÍÙÀõì ¤€ôøÑ½±•IÍÙÀ¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹½¹Ñ…Ğõí½Á•¹½¹Ñ…Ñ½Éµô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€¤€è¹Õ±°ì(€€€€€€€€€€€€€€€½¹ÍĞİ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•°€ô€¡½¹Ñ•¹Ğ¤€ôø€ (€€€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€€íÍÑ…¹‘…É‘Ñ¥½¹A…¹•°ñğ¹Õ±±ô(€€€€€€€€€€€€€€€€€€€í½¹Ñ•¹Ñô(€€€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€€€¤ì((€€€€€€€€€€€€€€€¥˜€¡¥Í!½ÍÁ¥Ñ…±¥ÑåA½ÉÑ™½±¥¼¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ!½ÍÁ¥Ñ…±¥ÑåA½ÉÑ™½±¥½É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹¹…±åÑ¥ÌõíÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ñô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í%¹-¥¹‘9•Ñİ½É¬¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ%¹-¥¹‘A…ÉÑ¹•ÉÉ…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ÑY•¹Õ”õì¡Ù•¹Õ”¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€¥¹-¥¹‘A…É•¹ÑI•˜¹ÕÉÉ•¹Ğ€ôÍ•±•Ñ•ì(€€€€€€€€€€€€€€€€€€€€€€€Í•±•ÑA±…”¡Ù•¹Õ”¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•¥±Ñ•È ‰¥¹-¥¹ˆ¤ì(€€€€€€€€€€€€€€€€€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡ì™¥±Ñ•Èè€‰¥¹-¥¹ˆ°½±±•Ñ¥½¸è€‰¥¹­¥¹µ‘¥¹¥¹œµµ…É­•Ğˆ°•¹Ñ¥Ñå%èÙ•¹Õ”¹¥°±¥ÍÑ¥¹%è€ˆˆô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹M¡½İY•¹Õ•Ìõì ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸ ‰¥¹-¥¹ˆ°ì½±±•Ñ¥½¸è€‰¥¹­¥¹µ‘¥¹¥¹œµµ…É­•Ğˆ°¥¹Ñ•¹Ğè€‰¥¹­¥¹ˆô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥ÍQ¡•M¡½É•AÉ½Á•ÉÑå¹Ñ¥Ñä¡Í•±•Ñ•¤¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñQ¡•M¡½É•I•Í¥‘•¹Ñ¥…±¹Ñ¥ÑåÉ…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€…•¹Ñ½ÉµMÕ‰µ¥ÑÑ•õí…•¹Ñ½ÉµMÕ‰µ¥ÑÑ•‘ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M¡½İ…Éõì ¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰Í¡½İ}…Éˆ°€‰Ñ¡•}Í¡½É•}É•Í¥‘•¹Ñ¥…±}‘É…İ•Èˆ¥ô(€€€€€€€€€€€€€€€€€€€€€½¹½¹Ñ…Ğõí½Á•¹½¹Ñ…Ñ½Éµô(€€€€€€€€€€€€€€€€€€€€€½¹MÕ‰µ¥Ñ½¹Ñ…Ğõì ¤€ôøÍ•Ñ•¹Ñ½ÉµMÕ‰µ¥ÑÑ•¡ÑÉÕ”¥ô(€€€€€€€€€€€€€€€€€€€€€½¹áÁ±½É”õì¡ÁÉ½µÁĞ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ€‰9•…É‰äˆì(€€€€€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ìÅÕ•ÉäèÁÉ½µÁĞ°¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°ÁÉ½µÁĞ¤ô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹=Á•¹I½ÕÑ”õí½Á•¹½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€€½¹	…¬õí½	…­Q½5…Áô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í”õí±½Í•M•±•Ñ•‘5…ÁÉ…İ•Éô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í…¹½¹¥…±I•Í¥‘•¹Ñ¥…±5¥á•‘UÍ•¹Ñ¥Ñä¡Í•±•Ñ•¤¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñI•Í¥‘•¹Ñ¥…±5¥á•‘UÍ•É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹áÁ±½É”õì¡ÁÉ½µÁĞ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ€‰9•…É‰äˆì(€€€€€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ì(€€€€€€€€€€€€€€€€€€€€€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€€€€€€€€€€€€€€€€€€€€€¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°ÁÉ½µÁĞ¤°(€€€€€€€€€€€€€€€€€€€€€€€ô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹=Á•¹I½ÕÑ”õí½Á•¹½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€€½¹	…¬õí½	…­Q½5…Áô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í”õí±½Í•M•±•Ñ•‘5…ÁÉ…İ•Éô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥ÍAÉ½Á•ÉÑä€˜˜€…¥ÍI•¹Ñ…°€˜˜€…±••¹‘Í1¥ÍÑ¥¹œ€˜˜€…¥Í1••¹‘Í5…ÁA±…”¡Í•±•Ñ•¤€˜˜€…±••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±”¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñI•Í¥‘•¹Ñ¥…±5¥á•‘UÍ•É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹áÁ±½É”õì¡ÁÉ½µÁĞ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ€‰9•…É‰äˆì(€€€€€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ì(€€€€€€€€€€€€€€€€€€€€€€€€€ÅÕ•ÉäèÁÉ½µÁĞ°(€€€€€€€€€€€€€€€€€€€€€€€€€¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°ÁÉ½µÁĞ¤°(€€€€€€€€€€€€€€€€€€€€€€€ô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹=Á•¹I½ÕÑ”õí½Á•¹½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€ ¡¥ÍI•¹Ñ…°ñğ¥ÍAÉ½Á•ÉÑäñğ±••¹‘Í1¥ÍÑ¥¹œñğ¥Í1••¹‘Í5…ÁA±…”¡Í•±•Ñ•¤¤€˜˜±••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±”€˜˜€…¥Í……MÑ½À¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñ1••¹‘ÍI•Í¥‘•¹Ñ¥…±%¹Ñ•±±¥•¹•É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€ÁÉ½™¥±”õí±••¹‘ÍI•Í¥‘•¹Ñ¥…±AÉ½™¥±•ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹¥±Ñ•Èõí½Á•¹¹Ñ¥Ñå¥±Ñ•Éô(€€€€€€€€€€€€€€€€€€€€€½¹áÁ±½É”õì¡ÁÉ½µÁĞ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ¹•áÑ¥±Ñ•È€ôÉ•Í½±Ù•¥±Ñ•É½É%¹Ñ•¹Ğ¡ÁÉ½µÁĞ°ÕÉ±MÑ…Ñ”¹µ½‘”¤ñğ€‰9•…É‰äˆì(€€€€€€€€€€€€€€€€€€€€€€€‰•¥¹M•…É¡%¹Ñ•¹ÑQÉ…¹Í¥Ñ¥½¸¡¹•áÑ¥±Ñ•È°ìÅÕ•ÉäèÁÉ½µÁĞ°¥¹Ñ•¹Ğè•Ñ…¹½¹¥…±%¹Ñ•¹Ñ½É¥±Ñ•È¡¹•áÑ¥±Ñ•È°ÁÉ½µÁĞ¤ô¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹=Á•¹I½ÕÑ”õí½Á•¹½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€€½¹	…¬õí½	…­Q½5…Áô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í”õí±½Í•M•±•Ñ•‘5…ÁÉ…İ•Éô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í%¹‘•Á•¹‘•¹ÑAÉ½Á•ÉÑå¹Ñ¥Ñä¡Í•±•Ñ•¤¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñ±•…¹%¹‘•Á•¹‘•¹Ñ¹Ñ¥ÑåÉ…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M¡½İ…Éõì ¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰Í¡½İ}…Éˆ°€‰±•…¹}É•Í¥‘•¹Ñ¥…±}‘É…İ•Èˆ¥ô(€€€€€€€€€€€€€€€€€€€€€½¹¥±Ñ•Èõí½Á•¹¹Ñ¥Ñå¥±Ñ•Éô(€€€€€€€€€€€€€€€€€€€€€½¹I½ÕÑ”õì¡¹•áÑMÑ…Ñ”¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€Í•ÑM•±•Ñ•‘% ˆˆ¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•ÑM•±•Ñ•‘A±…•=Ù•ÉÉ¥‘”¡¹Õ±°¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ5…Á¹Íİ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ±ÕÍÑ•ÉÉ…İ•È¡¹Õ±°¤ì(€€€€€€€€€€€€€€€€€€€€€€€Í•ÑÑ¥Ù•	½ÑÑ½µQ…ˆ¡¹•áÑMÑ…Ñ”ü¹Ñ…ˆñğ€‰µ…Àˆ¤ì(€€€€€€€€€€€€€€€€€€€€€€€¥˜€¡¹•áÑMÑ…Ñ”ü¹™¥±Ñ•È¤Í•ÑÑ¥Ù•¥±Ñ•È¡¹•áÑMÑ…Ñ”¹™¥±Ñ•È¤ì(€€€€€€€€€€€€€€€€€€€€€€€¥˜€¡¹•áÑMÑ…Ñ”ü¹‘¥ÍÑÉ¥Ğ€„ôôÕ¹‘•™¥¹•¤Í•Ñ¥ÍÑÉ¥Ğ¡¹•áÑMÑ…Ñ”¹‘¥ÍÑÉ¥Ğñğ11}9%!	=I!==L¤ì(€€€€€€€€€€€€€€€€€€€€€€€ÕÉ±MÑ…Ñ”¹ÕÁ‘…Ñ”¡¹•áÑMÑ…Ñ”¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í9•¥¡‰½É¡½½‘A…¹•°¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñ9•¥¡‰½É¡½½‘•Ñ…¥±É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í!½ÍÁ¥Ñ…±¥Ñå9•Ñİ½É­¹Ñ¥Ñä¡Í•±•Ñ•¤¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ!½ÍÁ¥Ñ…±¥Ñå9•Ñİ½É­É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í%¹-¥¹‘¥¹¥¹œ€˜˜ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ%¹-¥¹‘I•Í¥‘•¹ÑÉ…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í%¹-¥¹‘¥¹¥¹œ€˜˜ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ%¹-¥¹‘A…ÉÑ¹•É=ÁÁ½ÉÑÕ¹¥ÑåÉ…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜€…¥ÍAÉ½Á•ÉÑä¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñA…ÉÑ¹•É%¹Ñ•±±¥•¹•É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹Y¥•İ9•…É‰äõí±½Í•M•±•Ñ•‘5…ÁÉ…İ•Éô(€€€€€€€€€€€€€€€€€€€€€½É…¹¥é…Ñ¥½¹%õíÉ•…‘A…ÉÑ¹•É]½É­ÍÁ…•=É…¹¥é…Ñ¥½¹%¡±½…Ñ¥½¸¹Í•…É ¥ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥Í1½…±M•ÉÙ¥”¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñ1½…±M•ÉÙ¥•É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥ÍA•É­A…¹•°¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ…¹½¹¥…±A•É­•Ñ…¥±É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹UÍ”õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°€‰Á•É­}…Ñ¥Ù…Ñ¥½¹}ÍÑ…ÉÑ•ˆ°€‰…¹½¹¥…±}‘•Ñ…¥±}Á…¹•°ˆ¤¤ì(€€€€€€€€€€€€€€€€€€€€€€€½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰ÕÍ•}Á•É¬ˆ°€‰…¹½¹¥…±}‘•Ñ…¥±}Á…¹•°ˆ¤ì(€€€€€€€€€€€€€€€€€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°€‰Á•É­}ÅÉ}½Á•¹•ˆ°€‰…¹½¹¥…±}‘•Ñ…¥±}Á…¹•°ˆ¤¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹¹…±åÑ¥ÌõíÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ñô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜¥Í…µÁ…¥¸¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€€€ñ…¹½¹¥…±…µÁ…¥¹•Ñ…¥±É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹)½¥¸õì ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€ÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ğ ‰…µÁ…¥¹}©½¥¹•ˆ¤ì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞÉ…İ…µÁ…¥¸€ôÍ•±•Ñ•¹É…Üñğíôì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ™¥ÉÍÑMÑ½Á%€ô€¡Í•±•Ñ•¹…Ñ¥Ù…Ñ¥½¹MÑ½ÁÌñğÉ…İ…µÁ…¥¸¹…Ñ¥Ù…Ñ¥½¹MÑ½ÁÌñğmt¤(€€€€€€€€€€€€€€€€€€€€€€€€€€¹µ…À ¡ÍÑ½À¤€ôøÍÑ½Àü¹•¹Ñ¥Ñå%ñğÍÑ½Àü¹¥¤(€€€€€€€€€€€€€€€€€€€€€€€€€€¹™¥¹¡	½½±•…¸¤(€€€€€€€€€€€€€€€€€€€€€€€€€ñğ€¡Í•±•Ñ•¹Á…ÉÑ¥¥Á…Ñ¥¹¹Ñ¥Ñ¥•ÌñğÉ…İ…µÁ…¥¸¹Á…ÉÑ¥¥Á…Ñ¥¹¹Ñ¥Ñ¥•Ìñğmt¤(€€€€€€€€€€€€€€€€€€€€€€€€€€€€¹µ…À¡MÑÉ¥¹œ¤(€€€€€€€€€€€€€€€€€€€€€€€€€€€€¹™¥¹ ¡¥¤€ôø¥€„ôôMÑÉ¥¹œ¡Í•±•Ñ•¹¥¤¤ì(€€€€€€€€€€€€€€€€€€€€€€€½¹ÍĞ™¥ÉÍÑMÑ½À€ô™¥ÉÍÑMÑ½Á%€üÉ•Í½±Ù•5…Á¹Ñ¥ÑåÉ½µ½±±•Ñ¥½¸¡™¥ÉÍÑMÑ½Á%°Á±…•Ì¤€è¹Õ±°ì(€€€€€€€€€€€€€€€€€€€€€€€¥˜€¡™¥ÉÍÑMÑ½À¤Í•±•ÑA±…”¡™¥ÉÍÑMÑ½À¤ì(€€€€€€€€€€€€€€€€€€€€€€€•±Í”Ñ½±•M…Ù•¡Í•±•Ñ•¤ì(€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹¹…±åÑ¥ÌõíÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ñô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€¥˜€¡¥ÍÙ•¹ÑA…¹•°¤ì(€€€€€€€€€€€€€€€€€É•ÑÕÉ¸İ¥Ñ¡MÑ…¹‘…É‘Ñ¥½¹A…¹•° (€€€€€€€€€€€€€€€€€€€€ñÙ•¹Ñ•Ñ…¥±É…İ•È(€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€•Ù•¹ÑIÍÙÁÌõí•Ù•¹ÑIÍÙÁÍô(€€€€€€€€€€€€€€€€€€€€€½¹IÍÙÀõì ¤€ôøÑ½±•IÍÙÀ¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€½¹¹…±åÑ¥ÌõíÑÉ…­…¹½¹¥…±•Ñ…¥±Ù•¹Ñô(€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô((€€€€€€€€€€€€€€€É•ÑÕÉ¸€ (€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø±…ÍÍ9…µ”õíÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€‰‘Àµµ…ÀµÁ…¹•°µ½¹Ñ•¹Ğ‘ÀµÁ…ÉÑ¹•Èµ‘•Ñ…¥°µ½¹Ñ•¹Ğˆ€è€‰‘Àµµ…ÀµÁ…¹•°µ½¹Ñ•¹Ğ‘Àµ‘•ÍÑ¥¹…Ñ¥½¸µ½¹Ñ•¹Ğ‘Àµ‘•Ñ…¥°µ½¹Ñ•¹Ğ‰ôø(€€€€€€€€€€€€€€€€€€€€ñ•ÍÑ¥¹…Ñ¥½¹!•É¼Á±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô€¼ø(€€€€€€€€€€€€€€€€€€€€ñ¹Ñ¥Ñå%‘•¹Ñ¥ÑåA…¹•°¥‘•¹Ñ¥Ñäõí•Ñ¹Ñ¥Ñå%‘•¹Ñ¥Ñä¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”¥ô€¼ø(€€€€€€€€€€€€€€€€€€€íÍÑ…¹‘…É‘Ñ¥½¹A…¹•±ô(€€€€€€€€€€€€€€€€€€€ì…¥Í%¹-¥¹‘¥¹¥¹œ€˜˜€…¥Í	ÕÉ•É	…ÉA…¹•°€˜˜€…¥Í!…ÁÁå!½ÕÉ¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€„¡ÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜¡…ÍÑ¥Ù•A•É­…Ñ„¡Í•±•Ñ•¤¤€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Àà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñA…¹•±½¹Ñ•áĞÁ±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ä°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€˜˜Í¡½Õ±‘UÍ•A…ÉÑ¹•É%¹Ñ•±±¥•¹•É…İ•È¡Í•±•Ñ•°ÕÉ±MÑ…Ñ”¹µ½‘”¤€ü¹Õ±°€èÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰Á…ÉÑ¹•Èˆ€ü€ (€€€€€€€€€€€€€€€€€€€€€€€€ñA…ÉÑ¹•ÉÉ…İ•ÉÑ¥½¹ÌÁ±…”õíÍ•±•Ñ•‘ô½¹½¹Ñ…Ğõí½Á•¹½¹Ñ…Ñ½Éµô€¼ø(€€€€€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€€€€€ñI•Í¥‘•¹ÑÉ…İ•ÉÑ¥½¹Ì(€€€€€€€€€€€€€€€€€€€€€€€€€Í•±•Ñ•õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í•±•Ñ•‘I•Í¥‘•¹ÑÑ¥½¸õíÍ•±•Ñ•‘I•Í¥‘•¹ÑÑ¥½¹ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€€•Ù•¹ÑIÍÙÁÌõí•Ù•¹ÑIÍÙÁÍô(€€€€€€€€€€€€€€€€€€€€€€€€€±••¹‘Í1¥ÍÑ¥¹œõí±••¹‘Í1¥ÍÑ¥¹ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹½¹Ñ…Ğõí½Á•¹½¹Ñ…Ñ½Éµô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹IÍÙÀõì ¤€ôøÑ½±•IÍÙÀ¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M¡½İ…Éõì ¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰Í¡½İ}…Éˆ°€‰É•Í¥‘•¹Ñ}‘É…İ•É}…Ñ¥½¹Ìˆ¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹Í­5…Àõì ¤€ôø…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ğ¡]¡¥ ¹•…É‰äÁ•É­Ìµ…­”€‘íÍ•±•Ñ•¹¹…µ•ô™¥Ğı€¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹QÉ…­Ñ¥½¸õì¡…Ñ¥½¸°Í½ÕÉ”°•áÑÉ„€ôíô¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€€€€€™¥É•]½É­™±½Ü ˆ½…Á¤½µ…Àµ…Ñ¥½¹Ìˆ°‰Õ¥±‘5…ÁÑ¥½¹A…å±½…¡Í•±•Ñ•°…Ñ¥½¸°Í½ÕÉ”°ì(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€™½É´èì(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¥¹Ñ•¹Ğè…Ñ¥½¸°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€±…‰•°è…Ñ¥½¸°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€¸¸¹•áÑÉ„¹™½É´°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ô°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€µ•Ñ…‘…Ñ„è•áÑÉ„¹µ•Ñ…‘…Ñ„°(€€€€€€€€€€€€€€€€€€€€€€€€€€€ô¤¤ì(€€€€€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€í¥Í…µÁ…¥¸€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ä°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ5…Á9…Ñ¥Ù•…µÁ…¥¹•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€í¥ÍI•¹Ñ…°€ü€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Àà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñI•¹Ñ…±1¥ÍÑ¥¹•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¤€è±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€ü€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Àà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ1••¹‘ÍI•Í¥‘•¹Ñ¥…±5…ÑÉ¥áA…¹•°Á±…”õíÍ•±•Ñ•‘ô½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô½¹½¹Ñ…Ğõí½Á•¹½¹Ñ…Ñ½Éµô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¤€è¥ÍMÁÉ¥¹½¹‘½µ¥¹¥ÕµÌ¡Í•±•Ñ•¤€ü€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Àà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñMÁÉ¥¹½¹‘½µ¥¹¥ÕµÍ•ÍÑ¥¹…Ñ¥½¹A…¹•°½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¤€è¥ÍAÉ½Á•ÉÑä€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Àà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ1••¹‘Í51M…ÑÍM•Ñ¥½¸Á±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô½¹M•±•ĞõíÍ•±•ÑA±…•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€ì¡¥ÍAÉ½Á•ÉÑäñğ¥ÍÉ½ÍÑQ½İ•ÉA…¹•°¤€˜˜€…¥Í……MÑ½À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Äà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ	Õ¥±‘¥¹1½…±M•ÉÙ¥•ÍI…¥°Á±…”õíÍ•±•Ñ•‘ôÁ±…•ÌõíÁ±…•Íô½¹M•±•ĞõíÍ•±•ÑA±…•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜¥Í!…ÁÁå!½ÕÉ¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ÌØ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ!…ÁÁå!½ÕÉ•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ôÍ…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô½¹UÍ”õì ¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰ÕÍ•}Á•É¬ˆ°€‰¡…ÁÁå}¡½ÕÉ}‘•Ñ…¥±Ìˆ¥ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€í¥ÍA…É­¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ÌÜ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñA…É­¥¹	½½­¥¹•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€í¥Í	ÕÉ•É	…ÉA…¹•°€˜˜€…¥Í……MÑ½À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ìä°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ	ÕÉ•É	…É½¹É•ÍÍ•Ñ…¥±Ì(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€í¥Í%¹-¥¹‘¥¹¥¹œ€˜˜€…¥Í	ÕÉ•É	…ÉA…¹•°€˜˜€…¥Í……MÑ½À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ìä°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ%¹-¥¹‘¥¹¥¹•Ñ…¥±Ì(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹±½Í•¹Íİ•Èõì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€íÕÉ±MÑ…Ñ”¹µ½‘”€ôôô€‰É•Í¥‘•¹Ğˆ€˜˜€¡¡…ÍÑ¥Ù•A•É­…Ñ„¡Í•±•Ñ•¤ñğ¥ÍAÉ½Á•ÉÑä¤€˜˜€…¥Í…µÁ…¥¸€˜˜€…¥ÍI•¹Ñ…°€˜˜€…±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€˜˜€…¥Í!…ÁÁå!½ÕÉ¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€…¥ÍA…É­¥¹œ€˜˜€…¥Í%¹-¥¹‘¥¹¥¹œ€˜˜€…¥Í	…Ñ¡•¹Ñ¥Ñä¡Í•±•Ñ•¤€˜˜€…¥Í……MÑ½À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ĞÈ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñI•Í¥‘•¹ÑA•É­•Ñ…¥±Ì(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹UÍ”õì ¤€ôø½Á•¹I•Í¥‘•¹ÑEÉ5½‘…°¡Í•±•Ñ•°€‰ÕÍ•}Á•É¬ˆ°€‰É•Í¥‘•¹Ñ}Á•É­}‘•Ñ…¥±Ìˆ¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€ì¡Í•±•Ñ•¹É…Üü¹¥Í]…Ñ•É±½½A…É¬ñğÍ•±•Ñ•¹¥Í]…Ñ•É±½½A…É¬¤€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ìà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ]…Ñ•É±½½•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ôµ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€ì…±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€˜˜¥Í……MÑ½À€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸Ğà°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ……Q½ÕÉ•Ñ…¥±ÌÁ±…”õíÍ•±•Ñ•‘ôÁ±…•ÌõíÁ±…•Íô½¹M•±•ĞõíÍ•±•ÑA±…•ôÍ…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô½¹M…Ù”õì ¤€ôøÑ½±•M…Ù•¡Í•±•Ñ•¥ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€ì…±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€˜˜¥Í……MÑ½À€˜˜…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ”ü¹ÍÑ½ÁÌü¹±•¹Ñ €˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ÔÈ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ9•…É‰å½¹Ñ•áĞ(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€€€€€É½ÕÑ”õí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€ì…±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€˜˜€…¥Í……MÑ½À€˜˜€…¥Í%¹-¥¹‘¥¹¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ÔØ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ9•…É‰å½¹Ñ•áĞ(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…•ÌõíÁ±…•Íô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€€€€€É½ÕÑ”õí…Ñ¥Ù•½±±•Ñ¥½¹I½ÕÑ•ô(€€€€€€€€€€€€€€€€€€€€€€€€€Í…Ù•‘%‘ÌõíÍ…Ù•‘%‘Íô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€ì…¥ÍI•¹Ñ…°€˜˜€…±••¹‘ÍI•Í¥‘•¹Ñ¥…±½¹Ñ•¹Ğ€˜˜€…¥Í%¹-¥¹‘¥¹¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñµ½Ñ¥½¸¹‘¥Ø¥¹¥Ñ¥…°õíì½Á…¥Ñäè€À°äè€ÄÀõô…¹¥µ…Ñ”õíì½Á…¥Ñäè€Ä°äè€ÀõôÑÉ…¹Í¥Ñ¥½¸õíì‘•±…äè€À¸ØĞ°‘ÕÉ…Ñ¥½¸è€À¸Äàõôø(€€€€€€€€€€€€€€€€€€€€€€€€ñ¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ğ(€€€€€€€€€€€€€€€€€€€€€€€€€Á±…”õíÍ•±•Ñ•‘ô(€€€€€€€€€€€€€€€€€€€€€€€€€µ½‘”õíÕÉ±MÑ…Ñ”¹µ½‘•ô(€€€€€€€€€€€€€€€€€€€€€€€€€…¹Íİ•Èõí•¹Ñ¥Ñå¹Íİ•Éô(€€€€€€€€€€€€€€€€€€€€€€€€€±½…‘¥¹œõí•¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñ1½…‘¥¹ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹Í¬õí…Í­¹Ñ¥ÑåÍÍ¥ÍÑ…¹Ñô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹±½Í”õì ¤€ôøÍ•Ñ¹Ñ¥Ñå¹Íİ•È¡¹Õ±°¥ô(€€€€€€€€€€€€€€€€€€€€€€€€€½¹M•±•ĞõíÍ•±•ÑA±…•ô(€€€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€í¥ÍAÉ½Á•ÉÑä€˜˜±••¹‘Í1¥ÍÑ¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñ1••¹‘Í½¹Ñ…Ñ½É´(€€€€€€€€€€€€€€€€€€€€€€€™½Éµ%õí½¹Ñ…Ñ½Éµ%‘ô(€€€€€€€€€€€€€€€€€€€€€€€±¥ÍÑ¥¹œõíì(€€€€€€€€€€€€€€€€€€€€€€€€€€¸¸¹±••¹‘Í1¥ÍÑ¥¹œ°(€€€€€€€€€€€€€€€€€€€€€€€€€™Õ±±‘‘É•ÍÌè€‘í±••¹‘Í1¥ÍÑ¥¹œ¹…‘‘É•ÍÍô°€‘í±••¹‘Í1¥ÍÑ¥¹œ¹¥Ñåô°€‘í±••¹‘Í1¥ÍÑ¥¹œ¹ÍÑ…Ñ•ô€‘í±••¹‘Í1¥ÍÑ¥¹œ¹é¥Áõ€°(€€€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€€¼ø(€€€€€€€€€€€€€€€€€€€€¥ô((€€€€€€€€€€€€€€€€€€€í¥ÍAÉ½Á•ÉÑä€˜˜€…±••¹‘Í1¥ÍÑ¥¹œ€˜˜€ (€€€€€€€€€€€€€€€€€€€€€€ñ™½É´(€€€€€€€€€€€€€€€€€€€€€€€¥õí½¹Ñ…Ñ½Éµ%‘ô(€€€€€€€€€€€€€€€€€€€€€€€½¹MÕ‰µ¥Ğõì¡•Ù•¹Ğ¤€ôøì(€€€€€€€€€€€€€€€€€€€€€€€€€•Ù•¹Ğ¹ÁÉ•Ù•¹Ñ•™…Õ±Ğ ¤ì(€€€€€€€€€€€€€€€€€€€€€€€€€Í•Ñ•¹Ñ½ÉµMÕ‰µ¥ÑÑ•¡ÑÉÕ”¤ì(€€€€€€€€€€€€€€€€€€€€€€€õô(€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‘Àµ½¹Ñ…Ğµ½¹Ñ¥¹Õ…Ñ¥½¸µĞ´àµéµĞ´ÄÀˆ(€€€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Ñ•áĞµlÄÁÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµl	ĞÙtˆù%¹Ñ•É•ÍÑ•üğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€€€ñ Ì±…ÍÍ9…µ”ô‰µĞ´ÄÑ•áĞµlÄÙÁát™½¹ĞµÍ•µ¥‰½±Ñ•áĞµlŒÁÅÌÍtˆù%¹Ñ•É•ÍÑ•¥¸±¥Ù¥¹œ¡•É”üğ½ Ìø(€€€€€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø((€€€€€€€€€€€€€€€€€€€€€€€í…•¹Ñ½ÉµMÕ‰µ¥ÑÑ•€ü€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µĞ´Ô‰½É‘•ÈµĞ‰½É‘•ÈµmÉ‰„ ÄÄ°ÌÄ°ÔÄ°¸ÀØ¥tÁĞ´ÔÑ•áĞµlÄÍÁát±•…‘¥¹œ´ÔÑ•áĞµlŒÁÅÌÍt¼ÜÀˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€M•¹Ğ¸Q¡”±¥ÍÑ¥¹œÉ•ÅÕ•ÍĞ¥ÌÉ•…‘ä™½ÈÑ¡”…•¹Ğİ¥Ñ Ñ¡¥ÌÁÉ½Á•ÉÑä…ÑÑ…¡•¸(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€¤€è€ (€€€€€€€€€€€€€€€€€€€€€€€€€€ğø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µĞ´ÌÉ¥…À´ÈÍ´éÉ¥µ½±Ì´ÈµéµĞ´Ğˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰É¥…À´ÄÑ•áĞµlÄÅÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍt¼ÔĞˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€9…µ”(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ¥¹ÁÕĞÉ•ÅÕ¥É•±…ÍÍ9…µ”ô‰ ´ä‘ÀµÍ½™Ğµ™¥•±É½Õ¹‘•µláÁát‰œµİ¡¥Ñ”Áà´ÌÑ•áĞµlÄÍÁát™½¹Ğµµ•‘¥Õ´¹½Éµ…°µ…Í”ÑÉ…­¥¹œµ¹½Éµ…°Ñ•áĞµlŒÁÅÌÍt½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµl	ĞÙt¼ÜÀµé ´ÄÀˆÁ±…•¡½±‘•Èô‰e½ÕÈ¹…µ”ˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½±…‰•°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰É¥…À´ÄÑ•áĞµlÄÅÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍt¼ÔĞˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€µ…¥°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ¥¹ÁÕĞÉ•ÅÕ¥É•ÑåÁ”ô‰•µ…¥°ˆ±…ÍÍ9…µ”ô‰ ´ä‘ÀµÍ½™Ğµ™¥•±É½Õ¹‘•µláÁát‰œµİ¡¥Ñ”Áà´ÌÑ•áĞµlÄÍÁát™½¹Ğµµ•‘¥Õ´¹½Éµ…°µ…Í”ÑÉ…­¥¹œµ¹½Éµ…°Ñ•áĞµlŒÁÅÌÍt½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµl	ĞÙt¼ÜÀµé ´ÄÀˆÁ±…•¡½±‘•Èô‰å½Õ•á…µÁ±”¹½´ˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½±…‰•°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰É¥…À´ÄÑ•áĞµlÄÅÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍt¼ÔĞˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€A¡½¹”(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ¥¹ÁÕĞÉ•ÅÕ¥É•±…ÍÍ9…µ”ô‰ ´ä‘ÀµÍ½™Ğµ™¥•±É½Õ¹‘•µláÁát‰œµİ¡¥Ñ”Áà´ÌÑ•áĞµlÄÍÁát™½¹Ğµµ•‘¥Õ´¹½Éµ…°µ…Í”ÑÉ…­¥¹œµ¹½Éµ…°Ñ•áĞµlŒÁÅÌÍt½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµl	ĞÙt¼ÜÀµé ´ÄÀˆÁ±…•¡½±‘•Èô‰A¡½¹”¹Õµ‰•Èˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½±…‰•°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰É¥…À´ÄÑ•áĞµlÄÅÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍt¼ÔĞˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€5½Ù”Q¥µ•±¥¹”(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÍ•±•ĞÉ•ÅÕ¥É•±…ÍÍ9…µ”ô‰ ´ä‘ÀµÍ½™Ğµ™¥•±É½Õ¹‘•µláÁát‰œµİ¡¥Ñ”Áà´ÌÑ•áĞµlÄÍÁát™½¹Ğµµ•‘¥Õ´¹½Éµ…°µ…Í”ÑÉ…­¥¹œµ¹½Éµ…°Ñ•áĞµlŒÁÅÌÍt½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµl	ĞÙt¼ÜÀµé ´ÄÀˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ½ÁÑ¥½¸ùM@ğ½½ÁÑ¥½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ½ÁÑ¥½¸øÌÀ´ØÀ‘…åÌğ½½ÁÑ¥½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ½ÁÑ¥½¸øØÀ´äÀ‘…åÌğ½½ÁÑ¥½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ½ÁÑ¥½¸ù)ÕÍĞ•áÁ±½É¥¹œğ½½ÁÑ¥½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½Í•±•Ğø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½±…‰•°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ±…‰•°±…ÍÍ9…µ”ô‰µĞ´ÈÉ¥…À´ÄÑ•áĞµlÄÅÁát™½¹ĞµÍ•µ¥‰½±ÕÁÁ•É…Í”ÑÉ…­¥¹œµlÀ¸ÄÉ•µtÑ•áĞµlŒÁÅÌÍt¼ÔĞˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€5•ÍÍ…”½ÁÑ¥½¹…°(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñÑ•áÑ…É•„¹…µ”ô‰µ•ÍÍ…”ˆ±…ÍÍ9…µ”ô‰µ¥¸µ ´ÈÀ‘ÀµÍ½™Ğµ™¥•±É½Õ¹‘•µláÁát‰œµİ¡¥Ñ”Áà´ÌÁä´ÈÑ•áĞµlÄÍÁát™½¹Ğµµ•‘¥Õ´¹½Éµ…°µ…Í”ÑÉ…­¥¹œµ¹½Éµ…°Ñ•áĞµlŒÁÅÌÍt½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµl	ĞÙt¼ÜÀˆ‘•™…Õ±ÑY…±Õ”õí$İ½Õ±±¥­”µ½É”¥¹™½Éµ…Ñ¥½¸…‰½ÕĞ€‘íÍ•±•Ñ•¹¹…µ•ô¹ô€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½±…‰•°ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñ‰ÕÑÑ½¸ÑåÁ”ô‰ÍÕ‰µ¥Ğˆ±…ÍÍ9…µ”ô‰‘ÀµÁ…¹•°µ…Ñ¥½¸µÑ•áĞµĞ´Ô¥¹±¥¹”µ™±•à¥Ñ•µÌµ•¹Ñ•È…À´Ä¸Ôˆø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€MÕ‰µ¥Ğ%¹Ñ•É•ÍĞ(€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€ñM•¹±…ÍÍ9…µ”ô‰ ´Ì¸ÔÜ´Ì¸ÔÑ•áĞµl	ĞÙtµé ´ĞµéÜ´Ğˆ€¼ø(€€€€€€€€€€€€€€€€€€€€€€€€€€€€ğ½‰ÕÑÑ½¸ø(€€€€€€€€€€€€€€€€€€€€€€€€€€ğ¼ø(€€€€€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€€€€€ğ½™½É´ø(€€€€€€€€€€€€€€€€€€€€¥ô(€€€€€€€€€€€€€€€€€€ğ½µ½Ñ¥½¸¹‘¥Øø(€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€ô¤ ¥ô(€€€€€€€€€€€€€€ğ½…ÉÑ¥±”ø(€€€€€€€€€€€€ğ½‘¥Øø(€€€€€€€€€€ğ½µ½Ñ¥½¸¹…Í¥‘”ø(€€€€€€€€¥ô(€€€€€€ğ½¹¥µ…Ñ•AÉ•Í•¹”ø((€€€€€íÉ•Í¥‘•¹ÑEÉ5½‘…°€˜˜€ (€€€€€€€€ñI•Í¥‘•¹ÑA•É­I•‘•µÁÑ¥½¹M¡••Ğ(€€€€€€€€€‘…Ñ„õíÉ•Í¥‘•¹ÑEÉ5½‘…±ô(€€€€€€€€€½¹	…¬õì ¤€ôøÍ•ÑI•Í¥‘•¹ÑEÉ5½‘…°¡¹Õ±°¥ô(€€€€€€€€€½¹±½Í”õì ¤€ôøÍ•ÑI•Í¥‘•¹ÑEÉ5½‘…°¡¹Õ±°¥ô(€€€€€€€€¼ø(€€€€€€¥ô((€€€€€€ñ‰½ÕÑ½İ¹Ñ½İ¹A•É­Í5½‘…°½Á•¸õí…‰½ÕÑ=Á•¹ô½¹±½Í”õì ¤€ôøÍ•Ñ‰½ÕÑ=Á•¸¡™…±Í”¥ô€¼ø(€€€€ğ½‘¥Øø(€€¤ì)ô