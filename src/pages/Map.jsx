import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CanonicalDetailPanel, DrawerActionFooter } from "@/components/map/CanonicalDetailPanel";
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
import { createCanonicalMarkerRecord, resolveCanonicalMarkerEntityId } from "../lib/map/canonicalMarkerRecords";
import { getCanonicalMapGlyph, LEGENDS_PIN_ASSET, normalizeMapIconKey } from "../lib/map/mapIconRegistry";
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
const LEGENDS_PIN_LOGO = LEGENDS_PIN_ASSET;
const LEGENDS_PIN_ALT = "Legends Real Estate logo";
const MAP_DRAWER_SURFACE_STYLE = {
  backgroundColor: "#ffffff",
  backgroundImage: "none",
  border: "1px solid rgba(11, 31, 51, 0.09)",
  borderBottom: 0,
  borderRadius: 0,
  boxShadow: "none",
  color: "#0B1F33",
  WebkitTextFillColor: "#0B1F33",
  WebkitBackdropFilter: "none",
  backdropFilter: "none",
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

function resolveCanonicalLegendsDirectoryPlaces(places = []) {
  return dedupeMapPinPlaces(places).filter((place) => {
    const pin = resolveEntityPin(place);
    const listing = getResolvedLegendsListing(place);
    const profile = getLegendsResidentialProfileForPlace(place);
    return pin?.label === "Legends" && Boolean(
      listing || profile || isLegendsMapPlace(place) || isLegendsListingLike(place)
    );
  }).slice(0, 80);
}

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
  if (isBangersVenue(place)) return "place";
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

function isBangersVenue(place) {
  const id = String(place?.id || place?.raw?.id || "").toLowerCase();
  const name = String(place?.name || place?.title || place?.raw?.name || place?.raw?.title || "").toLowerCase();
  return id === "partner-bangers"
    || id.includes("banger-s-sausage-house")
    || /\bbanger(?:'|â€™)?s sausage house(?:\s*&|\s+and)?\s*beer garden\b/i.test(name);
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

  if (isBangersVenue(place)) {
    return {
      id: resolveMapEntityAlias(place?.id || place?.raw?.id),
      entityType: "venue",
      displayTypeLabel: `Restaurant & beer garden Â· ${district}`,
      displayTitle: "Banger's Sausage House & Beer Garden",
      displaySubtitle: address || "79 Rainey St",
      displayContext: "A Rainey Street destination for sausages, local beer, outdoor gatherings, and live music.",
      address: address || "79 Rainey St",
      neighborhood: district,
      categoryLabel: "Restaurant & beer garden",
      panelArchetype: resolveEntityPanelArchetype({ ...place, type: "venue", category: "Restaurant & beer garden" }),
    };
  }

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

function getCanonicalMarkerRecord(place, options = {}) {
  return createCanonicalMarkerRecord(place || {}, options);
}

function getPlaceCoords(place) {
  const markerRecord = getCanonicalMarkerRecord(place);
  return markerRecord ? [markerRecord.latitude, markerRecord.longitude] : null;
}

function getPlaceMarkerId(place) {
  return getCanonicalMarkerRecord(place)?.markerId || "";
}

function isSelectedMarkerPlace(place, selectedId) {
  if (!place || !selectedId) return false;
  const selectedCanonicalId = resolveCanonicalMarkerEntityId({ id: selectedId }) || resolveMapEntityAlias(selectedId) || String(selectedId);
  const markerRecord = getCanonicalMarkerRecord(place);
  return Boolean(
    markerRecord &&
      (markerRecord.markerId === selectedCanonicalId ||
        markerRecord.entityId === selectedCanonicalId ||
        String(place.id) === String(selectedId)),
  );
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

  const markerRecord = getCanonicalMarkerRecord(place);
  if (markerRecord?.markerId) keys.push(`marker:${markerRecord.markerId}`);
  if (markerRecord?.entityId) keys.push(`entity:${markerRecord.entityId}`);
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

function clusterPlaces(places, zoom, selectedId, preservedMarkerIds = new Set()) {
  const validPlaces = places.filter((place) => getPlaceCoords(place));
  const cellSize = getClusterCellSize(zoom);
  const buildingCells = new Map();
  const placesForGeoClustering = [];
  const loosePlaces = [];

  validPlaces.forEach((place) => {
    const markerId = getPlaceMarkerId(place) || place.id;
    if (isSelectedMarkerPlace(place, selectedId) || preservedMarkerIds.has(markerId) || preservedMarkerIds.has(place.id)) {
      loosePlaces.push({ type: "place", id: markerId, place });
      return;
    }

    const listing = getLegendsListing(place);
    const buildingKey = listing ? baseAddressText(listing.address || place.address || place.raw?.address || place.name) : "";
    if (buildingKey) {
      const [lat, lng] = getPlaceCoords(place);
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
      return cell.places.map((place) => ({ type: "place", id: getPlaceMarkerId(place) || place.id, place }));
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
      ...placesForGeoClustering.map((place) => ({ type: "place", id: getPlaceMarkerId(place) || place.id, place })),
      ...buildingClusters,
    ];
  }

  const cells = new Map();

  placesForGeoClustering.forEach((place) => {
    const [lat, lng] = getPlaceCoords(place);
    const key = `${Math.round(lat / cellSize)}:${Math.round(lng / cellSize)}`;
    const cell = cells.get(key) || { key, places: [], latitude: 0, longitude: 0 };
    cell.places.push(place);
    cell.latitude += lat;
    cell.longitude += lng;
    cells.set(key, cell);
  });

  const clusters = Array.from(cells.values()).flatMap((cell) => {
    if (cell.places.length < 2) {
      return cell.places.map((place) => ({ type: "place", id: getPlaceMarkerId(place) || place.id, place }));
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

function getClusterPresentationIdentity(place) {
  if (!place) return "";
  if (isRentalEntity(place) || isListingEntity(place)) return `listing:${place.id}`;
  const raw = place.raw || {};
  const parentId = place.parentEntityId
    || place.hostEntityId
    || raw.parentEntityId
    || raw.hostEntityId;
  if (parentId) return `entity:${parentId}`;
  const canonicalName = String(place.name || place.title || "")
    .toLowerCase()
    .replace(/[â€”â€“-]\s*(guest guide anchor|nearby pick|guest dining campaign|campaign|activation)$/i, "")
    .replace(/\bguest dining campaign\b/gi, "")
    .replace(/\bhotel austin\b/gi, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return `place:${canonicalName || place.id}`;
}

function getClusterPresentationPriority(place) {
  if (!place) return 0;
  if (isRentalEntity(place) || isListingEntity(place)) return 100;
  if (isCampaignEntity(place)) return 10;
  if (isEventEntity(place) || getCanonicalDetailEntityType(place) === "perk") return 20;
  if (isHotelEntity(place) || isPropertyEntity(place) || isVenueEntity(place)) return 80;
  return 50;
}

function getCanonicalClusterDrawerPlaces(places = []) {
  const groups = new Map();
  places.forEach((place) => {
    const identity = getClusterPresentationIdentity(place);
    const current = groups.get(identity);
    if (!current || getClusterPresentationPriority(place) > getClusterPresentationPriority(current)) {
      groups.set(identity, place);
    }
  });
  return [...groups.values()];
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
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">
            <Building2 className="h-3.5 w-3.5 text-[#BFA46A]" />
            {panel.eyebrow || "Local service"}
          </div>
          <h3 className="mt-1 text-[18px] font-semibold leading-tight tracking-[-0.015em] text-[#0B1F33]">
            {panel.title || "Useful downtown service"}
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#425466]">
            {panel.description || place.raw?.summary || "Save this local service for later, get directions, or contact the business directly."}
          </p>
        </div>
        <div className="shrink-0 px-0 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-[#BFA46A]">
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
            <div key={src} className="h-24 overflow-hidden bg-white p-1 shadow-[0_8px_20px_rgba(11,31,51,0.035),0_0_18px_rgba(191,164,106,0.03)]">
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

function getBuildingPartnerNetworkPerks(place, places = [], limit = 5) {
  if (!place || getResidentEntityKind(place) !== "property") return [];
  const isNetworkCandidate = (candidate, hasPerk = hasActivePerkData(candidate)) => {
      if (!candidate || !hasPerk || getResidentEntityKind(candidate) === "property") return false;
      if (isCivicEntity(candidate) || isEventEntity(candidate) || isCampaignEntity(candidate) || isDaaTourPlace(candidate)) return false;
      const kind = getDestinationKind(candidate);
      const offerCategory = String(getCanonicalResidentOffer(candidate)?.category || "").toLowerCase();
      if (offerCategory === "civic") return false;
      return (
        isDiningEntity(candidate) ||
        isCoffeeEntity(candidate) ||
        isHotelEntity(candidate) ||
        isBrandEntity(candidate) ||
        isHappyHourEntity(candidate) ||
        isInKindEntity(candidate) ||
        isBatheEntity(candidate) ||
        ["nightlife", "retail", "wellness", "brand", "hotel", "dining", "coffee"].includes(kind)
      );
  };
  const nearby = getNearbyAreaPlaces(place, places, Math.max(limit * 5, 24));
  const filtered = nearby
    .filter((item) => isNetworkCandidate(item?.candidate, item?.hasPerk))
    .slice(0, limit);
  if (filtered.length) return filtered;

  const districtText = `${place?.district || ""} ${place?.address || ""} ${place?.name || ""}`.toLowerCase();
  const fallbackTerms = districtText.includes("rainey")
    ? ["stay put", "banger", "geraldine", "hotel van zandt", "bathe", "yeti"]
    : ["coffee", "dining", "hotel", "wellness", "retail"];
  const fallbackCandidates = places
    .filter((candidate) => {
      const text = placeText(candidate);
      return fallbackTerms.some((term) => text.includes(term)) && isNetworkCandidate(candidate, hasActivePerkData(candidate));
    })
    .slice(0, limit)
    .map((candidate) => ({
      candidate,
      distanceLabel: formatDistanceLabel(getDistanceMeters(place, candidate)),
      candidateKind: getDestinationKind(candidate),
      perk: getResidentPerkDetails(candidate),
      hasPerk: true,
    }));
  const dedupedFallback = dedupeRailItems(fallbackCandidates, place, limit);
  if (dedupedFallback.length) return dedupedFallback;

  if (districtText.includes("rainey")) {
    return ["The Stay Put", "Banger's Sausage House & Beer Garden", "BATHE", "YETI"]
      .map((name) => {
        const candidate = {
          id: `partner-network-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
          name,
          category: "Resident partner",
          type: "partner_network_perk",
          district: "Rainey",
          raw: { networkFallback: true },
        };
        return {
          candidate,
          distanceLabel: "Partner network",
          candidateKind: "perk",
          perk: getResidentPerkDetails(candidate),
          hasPerk: true,
        };
      })
      .slice(0, limit);
  }

  return [];
}

function ResidentPerkDetails({ place, places = [], savedIds, onSave, onUse, onSelect }) {
  const perk = getResidentPerkDetails(place);
  const entityKind = getResidentEntityKind(place);
  const isProperty = entityKind === "property";
  const sectionLabel = isProperty ? "Property access" : "Resident perk";
  const isSaved = savedIds?.has?.(place?.id);
  const isPaseo = isPaseoResidentialProperty(place);
  const useText = isProperty
    ? isPaseo
      ? PASEO_ATX_MAP_COPY.perkDescription
      : "Listings, tours, and neighborhood context."
    : getPerkOutlineCopy(place, perk);
  const termsText = String(perk.terms || "").trim();
  const perkTitle = isProperty ? isPaseo ? PASEO_ATX_MAP_COPY.perkTitle : "Want to live here?" : formatResidentPerkHeading(perk.offer);
  const perkValue = String(perk.value || "").trim();
  const networkPerks = isProperty ? getBuildingPartnerNetworkPerks(place, places) : [];
  const residentHub = place.residentHub || place.raw?.residentHub || null;
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
          <Gift className="h-3.5 w-3.5 text-[#BFA46A]" />
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
              Redeem Perk
            </button>
            <button type="button" onClick={onUse || onSave} className="dp-perk-cta is-secondary">
              Show QR
            </button>
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-perk-cta is-tertiary">
              Directions
            </a>
            <button type="button" onClick={onSave} className="dp-perk-cta is-tertiary">
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        )}
        {isProperty && residentHub && (
          <div className="dp-building-hub-summary" aria-label={`${place.name} neighborhood access`}>
            <div><strong>{residentHub.activePerks}</strong><span>active perks</span></div>
            <div><strong>{residentHub.happyHours}</strong><span>happy hours</span></div>
            <div><strong>{residentHub.eventsTonight}</strong><span>events tonight</span></div>
            <div><strong>{residentHub.amenityPrograms?.length || 0}</strong><span>amenity types</span></div>
          </div>
        )}
        {isProperty && networkPerks.length > 0 && (
          <div className="dp-building-network-perks" aria-label={`${getPaseoDisplayName(place)} partner network perks`}>
            <div className="dp-building-network-perks__header">
              <span>{isPaseo ? "Paseo resident perks" : "Partner network perks"}</span>
              <strong>{networkPerks.length} nearby</strong>
            </div>
            <div className="dp-building-network-perks__rail">
              {networkPerks.map(({ candidate, distanceLabel, perk: candidatePerk }) => {
                const title = getExplicitPerkTitle(candidate) || formatResidentPerkHeading(candidatePerk?.offer || candidatePerk?.title || "Resident perk");
                const meta = [distanceLabel, getNearbyKindLabel(candidate, getDestinationKind(candidate))].filter(Boolean).join(" Â· ");
                return (
                  <button
                    type="button"
                    key={candidate.id}
                    className="dp-building-network-perk-card"
                    disabled={Boolean(candidate.raw?.networkFallback)}
                    onClick={() => {
                      if (!candidate.raw?.networkFallback) onSelect?.(candidate);
                    }}
                  >
                    <span className="dp-building-network-perk-card__title">{candidate.name}</span>
                    <span className="dp-building-network-perk-card__offer">{title}</span>
                    <span className="dp-building-network-perk-card__meta">{meta}</span>
                  </button>
                );
              })}
            </div>
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
                <small>{Array.isArray(item.details) ? item.details.join(" Â· ") : item.details}</small>
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
            <small>{Array.isArray(membership.details) ? membership.details.join(" Â· ") : membership.details}</small>
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

function getCanonicalInKindVenue(place) {
  const raw = place?.raw || {};
  const profile = getInKindDiscoveryProfile(place);
  const perk = getAppliedInKindPerk(place);
  const name = place?.name || place?.title || "Participating restaurant";
  const district = place?.district || place?.neighborhood || raw.district || "Downtown Austin";
  const cuisine = cleanDisplayCopy(place?.subcategory || raw.subcategory || place?.category || raw.category || "Dining").replace(/\s*\/.*$/, "");
  const isComedor = /\bcomedor\b/i.test(name);
  const isFixe = /\bfixe\b/i.test(name);
  const occasions = isComedor
    ? ["Date night", "Celebrations", "Client dinner", "Out-of-town guests", "Cocktails"]
    : isFixe
      ? ["Resident dinner", "Business dinner", "Hotel guest recommendation", "Team dinner", "Group dining", "Downtown event night"]
      : (profile.goodFor || []).slice(0, 6);
  return {
    id: place?.id,
    name,
    entityType: "restaurant",
    category: "Dining",
    subcategory: cuisine || "Dining",
    district,
    address: place?.address || raw.address || "",
    venueStory: isComedor
      ? "Modern Mexican dining in a dramatic downtown setting, suited to date nights, celebrations, and dinner with visiting guests."
      : profile.story,
    images: [getLifestyleImage(place, "resident"), ...(place?.galleryImages || raw.galleryImages || [])].filter(Boolean),
    websiteUrl: place?.website || raw.website || place?.url || raw.url || "",
    reservationUrl: place?.reservationUrl || raw.reservationUrl || raw.reservation_url || place?.bookingUrl || raw.bookingUrl || place?.website || raw.website || "",
    menuUrl: getInKindMenuUrl(place),
    inKind: {
      participating: true,
      externalUrl: getInKindActionUrl(place, "pay"),
      benefitStatus: place?.perk?.isActive === false || raw.perk?.isActive === false ? "paused" : "active",
      benefitTitle: isComedor ? "Complimentary mezcal welcome pour or spirit-free house agua with dinner." : perk.title,
      residentValue: isComedor ? "Complimentary mezcal welcome pour or spirit-free house agua with dinner." : perk.description,
      eligibility: perk.terms,
      redemptionInstructions: "Open the active inKind benefit before ordering to confirm current eligibility and redemption terms.",
    },
    residentView: {
      summary: isComedor ? "Modern Mexican dining in a dramatic downtown setting, suited to date nights, celebrations, and dinner with visiting guests." : profile.story,
      bestFor: occasions,
      beforeYouGo: isComedor ? "Reserve ahead for peak dinner hours." : profile.localTip,
    },
    partnerView: {
      campaignEligible: true,
      eligibleAudiences: ["Residents in nearby buildings", "Hotel guests", "Office tenants", "Convention attendees", "Event audiences", "Brand-hosted guests"],
      recommendedAccountTypes: ["Residential properties", "Hotels", "Office buildings", "Mixed-use developments", "Event venues", "District partners", "Brands"],
      placements: ["Resident map results", "Building perk collections", "Hotel guest dining guides", "Workplace recommendations", "Event before-and-after routes", "District dining collections", "Sponsored brand campaigns", "QR-linked partner communications"],
      campaignOccasions: occasions,
      measurementEvents: ["Resident impressions", "Venue-detail views", "Benefit opens", "Reservations", "Directions", "Saves", "Shares", "Redemptions", "Building attribution", "Hotel attribution", "Campaign conversion rate"],
      partnerSummary: isFixe
        ? "A resident-facing dining offer suited to property, hotel, workplace, and district campaigns focused on dinner, guest hosting, and downtown occasions."
        : `A resident-facing dining benefit suited to property, hotel, workplace, and district campaigns around ${district}.`,
    },
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
      <p className="dp-inkind-zone-meta">inKind layer Â· Downtown Perks applied perk</p>
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
      .split(/\n|â€¢|,/)
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
        const Row = typeof item === "string" ? "span" : "button";
        return (
          <Row
            key={key}
            {...(typeof item === "string" ? {} : { type: "button", onClick: () => onSelect?.(item) })}
            className="dp-local-service-chip"
          >
            <span className="dp-local-service-chip-icon" aria-hidden="true">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="dp-local-service-chip-copy">
              <strong>{label}</strong>
              {meta && <span>{meta}</span>}
            </span>
          </Row>
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
        <p className="dp-entity-meta">{profile.serviceType}{place.district ? ` Â· ${place.district}` : ""}</p>
        <p className="dp-entity-dek">{profile.prompt}</p>
        <p className="dp-business-one-line">{profile.oneSentence}</p>
      </header>

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

      <DestinationSection title="About" className="dp-local-service-section">
        <p>{profile.about}</p>
      </DestinationSection>

      <DestinationSection title="Best for" className="dp-local-service-section">
        <LocalServiceRail title="Services" items={profile.bestFor} />
      </DestinationSection>

      <DestinationSection title="Why people choose them" className="dp-local-service-section">
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

      <NearbyImageRail
        place={place}
        places={places.filter((candidate) => !isServiceEntity(candidate))}
        onSelect={onSelect}
        title="Nearby perks"
        support="Places nearby that help this service stay connected to the rest of downtown."
      />

      <DestinationSection title="Related services" className="dp-local-service-section">
        <LocalServiceRail title="Similar businesses" items={relatedServices} onSelect={onSelect} kind="places" />
      </DestinationSection>

      <DestinationSection title="Contact" className="dp-local-service-section">
        <div className="dp-business-contact-list">
          {profile.website && <span><strong>Website</strong>{profile.website.replace(/^https?:\/\//, "")}</span>}
          {profile.phone && <span><strong>Phone</strong>{profile.phone}</span>}
          {place.address && <span><strong>Where</strong>{place.address}</span>}
          <span><strong>Hours</strong>Check current availability before you go.</span>
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
    meta: [getEventTimeContext(place), cleanDisplayCopy(place?.district || raw.district)].filter(Boolean).join(" Â· "),
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
    start: place?.startDate || raw.startDate || place?.startAt || raw.startAt || place?.startsAt || raw.startsAt || place?.eventTiming?.startTime || raw.eventTiming?.startTime || "",
    end: place?.endDate || raw.endDate || place?.endAt || raw.endAt || place?.endsAt || raw.endsAt || place?.eventTiming?.endTime || raw.eventTiming?.endTime || "",
    url: place?.bookingUrl || raw.bookingUrl || place?.website || raw.website || place?.url || raw.url || "",
    primaryAction,
    secondaryAction,
  };
}

function truncateEventOverview(value = "", limit = 220) {
  const text = cleanDisplayCopy(value);
  if (!text || text.length <= limit) return { text, isTruncated: false };
  const trimmed = text.slice(0, limit).replace(/\s+\S*$/, "").trim();
  return { text: `${trimmed}...`, isTruncated: true };
}

function getCanonicalDetailMedia(place) {
  const raw = place?.raw || {};
  const structured = place?.perk || raw.perk || raw.raw?.perk || {};
  if (structured.detailMediaApproved === false || place?.detailMediaApproved === false || raw.detailMediaApproved === false || raw.raw?.detailMediaApproved === false) return null;
  const source = place?.detailMedia || raw.detailMedia || place?.heroImage || raw.heroImage || place?.image || raw.image || "";
  if (!source || String(source).includes("/images/fallbacks/")) return null;
  return { src: source, alt: "" };
}

function getConfiguredParticipatingLocations(place, places = []) {
  const raw = place?.raw || {};
  const perk = place?.perk || raw.perk || raw.raw?.perk || {};
  const ids = new Set((perk.participatingEntityIds || place?.participatingEntityIds || raw.participatingEntityIds || []).map(String));
  const names = new Set((perk.participatingEntityNames || []).map((value) => String(value).trim().toLowerCase()));
  if (!ids.size && !names.size) return [];
  const matched = places.filter((candidate) => ids.has(String(candidate?.id)) || names.has(String(candidate?.name || candidate?.title || "").trim().toLowerCase()));
  const matchedIds = new Set(matched.map((candidate) => String(candidate.id)));
  const configured = (Array.isArray(perk.participatingEntities) ? perk.participatingEntities : []).filter((candidate) => candidate?.id && !matchedIds.has(String(candidate.id)));
  return [...matched, ...configured].slice(0, 8);
}

function buildCanonicalPerkModel(place, places = []) {
  const raw = place?.raw || {};
  const structured = place?.perk || raw.perk || raw.raw?.perk || {};
  const fallback = getResidentPerkDetails(place);
  const participating = getConfiguredParticipatingLocations(place, places);
  const rawOfferName = cleanDisplayCopy(structured.offerName || structured.title || fallback.offer || place?.name || "Resident benefit");
  const possessiveVenueMatch = rawOfferName.match(/^(.+?[â€™']s)\s+(.+)$/i);
  const venueName = cleanDisplayCopy(
    structured.venueName ||
    structured.locationName ||
    place?.venueName ||
    raw.venueName ||
    place?.parentLocation ||
    raw.parentLocation ||
    (participating.length === 1 ? participating[0]?.name : "") ||
    (participating.length > 1 ? "Downtown dining partners" : "") ||
    possessiveVenueMatch?.[1] ||
    place?.name ||
    "Downtown partner",
  );
  const offerWithoutVenue = rawOfferName.toLowerCase() === venueName.toLowerCase()
    ? rawOfferName
    : rawOfferName.replace(new RegExp(`^${venueName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-:â€“â€”]?\\s*`, "i"), "");
  const title = offerWithoutVenue
    .replace(/\s+Perk$/i, "")
    .trim() || cleanDisplayCopy(fallback.value || "Resident benefit");
  const summary = firstDecisionSentence(structured.summary || fallback.description || place?.summary);
  const schedule = cleanDisplayCopy(structured.recurringSchedule || place?.time || raw.time || "");
  const eligibility = asCleanArray(structured.eligibility);
  const steps = asCleanArray(structured.redemptionInstructions);
  const terms = asCleanArray(structured.terms || fallback.terms);
  const isAvailableSundays = /\bsundays?\b/i.test(schedule);
  const isExpired = structured.status === "expired";
  const relatedItems = getNearbyRecommendationCards(place, places, "resident", 6)
    .filter((item) => !participating.some((candidate) => candidate.id === item.id))
    .slice(0, 5);
  return {
    entityType: "perk",
    titleId: `canonical-detail-title-${place.id}`,
    eyebrow: structured.status === "upcoming"
      ? "Resident perk Â· Upcoming"
      : isExpired
        ? "Resident perk Â· Ended"
        : isAvailableSundays
          ? "Resident perk Â· Available Sundays"
          : "Resident perk Â· Live",
    title,
    summary,
    perkIdentity: {
      venueName,
      offerName: title,
      meta: ["Resident perk", isExpired ? "Ended" : structured.status === "upcoming" ? "Coming soon" : "Available now"],
    },
    contextItems: [
      schedule && { icon: CalendarDays, label: schedule },
      participating.length > 0 && { icon: MapPin, label: `${participating.length} ${participating.length === 1 ? "location" : "locations"}` },
      { icon: CreditCard, label: "Resident Card" },
    ].filter(Boolean),
    primaryAction: isExpired
      ? { label: "Perk unavailable", disabled: true }
      : { label: structured.redemptionMethod === "external" ? "View perk" : "Use perk" },
    sections: [
      { id: "benefit", title: "Benefit", body: cleanDisplayCopy(structured.benefit || fallback.value), emphasis: true },
      participating.length > 0 ? {
        id: "participating-places",
        kind: "rail",
        title: "Participating nearby",
        items: participating.map((entity) => ({
          id: entity.id,
          entity,
          image: entity.image || entity.heroImage || entity.raw?.image || "",
          title: entity.name,
          meta: formatDistanceLabel(getDistanceMeters(place, entity)),
          detail: getExplicitGroupedOffer(entity) || getNearbyKindLabel(entity, getDestinationKind(entity)),
        })),
      } : null,
      steps.length ? { id: "redemption", kind: "steps", title: "How it works", items: steps } : null,
      schedule ? { id: "availability", title: "Availability", body: schedule } : null,
      eligibility.length ? { id: "eligibility", title: "Eligibility", items: eligibility } : null,
      terms.length ? { id: "terms", kind: "terms", title: "Terms", items: terms } : null,
      relatedItems.length ? { id: "related", kind: "rail", title: "More ideas", items: relatedItems } : null,
    ].filter(Boolean),
  };
}

function buildCanonicalCampaignModel(place, places = []) {
  const raw = place?.raw || {};
  const participatingIds = new Set((place?.participatingEntities || raw.participatingEntities || []).map(String));
  const participating = places
    .filter((candidate) => candidate?.id !== place?.id && participatingIds.has(String(candidate?.id)))
    .slice(0, 8);
  const startDate = place?.startDate || raw.startDate;
  const endDate = place?.endDate || raw.endDate;
  const formatCampaignDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? cleanDisplayCopy(value) : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };
  const timeline = [startDate && `Starts ${formatCampaignDate(startDate)}`, endDate && `Ends ${formatCampaignDate(endDate)}`].filter(Boolean);
  const status = String(place?.status || raw.status || "active").toLowerCase();
  const isExpired = status === "expired" || status === "ended";
  return {
    entityType: "campaign",
    titleId: `canonical-detail-title-${place.id}`,
    eyebrow: isExpired ? "Campaign Â· Ended" : status === "upcoming" ? "Campaign Â· Upcoming" : "Campaign Â· Live",
    title: cleanDisplayCopy(place?.title || place?.name || "Campaign"),
    summary: firstDecisionSentence(place?.summary || raw.summary || place?.description || raw.description),
    media: getCanonicalDetailMedia(place),
    contextItems: [
      timeline.length > 0 && { icon: CalendarDays, label: timeline.join(" Â· ") },
      (place?.district || raw.district) && { icon: MapPin, label: place?.district || raw.district },
      participating.length > 0 && { icon: TicketPercent, label: `${participating.length} ${participating.length === 1 ? "place" : "places"}` },
    ].filter(Boolean),
    primaryAction: isExpired ? { label: "Campaign ended", disabled: true } : { label: cleanDisplayCopy(place?.primaryAction || raw.primaryAction || "Join campaign") },
    sections: [
      (place?.reward || raw.reward || place?.rewardLabel || raw.rewardLabel) ? { id: "benefit", title: "What you get", body: cleanDisplayCopy(place?.reward || raw.reward || place?.rewardLabel || raw.rewardLabel), emphasis: true } : null,
      participating.length ? {
        id: "participating-places",
        kind: "rail",
        title: "Participating places",
        items: participating.map((entity) => ({
          id: entity.id,
          entity,
          image: entity.image || entity.heroImage || entity.raw?.image || "",
          title: entity.name,
          meta: entity.district || getNearbyKindLabel(entity, getDestinationKind(entity)),
          detail: getExplicitGroupedOffer(entity),
        })),
      } : null,
      timeline.length ? { id: "timeline", kind: "steps", title: "Timeline", items: timeline } : null,
    ].filter(Boolean),
  };
}

function buildCanonicalEventModel(place, places = []) {
  const profile = getEventProfile(place);
  const similar = getNearbyRecommendationCards(place, places.filter((candidate) => isEventEntity(candidate)), "resident", 5);
  return {
    entityType: "event",
    titleId: `canonical-detail-title-${place.id}`,
    eyebrow: profile.eyebrow || "Event",
    title: profile.title,
    summary: firstDecisionSentence(profile.oneSentence),
    media: getCanonicalDetailMedia(place),
    contextItems: [
      profile.time && { icon: CalendarDays, label: profile.time },
      (profile.room || place?.district) && { icon: MapPin, label: profile.room || place?.district },
      (profile.price || profile.reservation || profile.checkIn) && { icon: TicketPercent, label: profile.price || profile.reservation || profile.checkIn },
    ].filter(Boolean),
    primaryAction: profile.url && /\b(book|ticket|reserve|register|event page)\b/i.test(profile.primaryAction)
      ? { label: profile.primaryAction, href: profile.url, external: true }
      : { label: "RSVP" },
    sections: [
      profile.about && profile.about !== profile.oneSentence ? { id: "about", title: "About", body: profile.about } : null,
      profile.schedule.length ? { id: "schedule", kind: "steps", title: "Schedule", items: profile.schedule.map((item) => [item.label || item.isoDate, item.className, item.duration || item.room].filter(Boolean).join(" Â· ")) } : null,
      [...profile.included, ...profile.goodFor].length ? { id: "expect", title: "What to expect", items: [...profile.included, ...profile.goodFor].slice(0, 8) } : null,
      similar.length ? { id: "similar", kind: "rail", title: "Similar events", items: similar } : null,
    ].filter(Boolean),
  };
}

function CanonicalPerkDetailDrawer({ place, places = [], savedIds, onSave, onUse, onSelect, onAnalytics }) {
  const model = useMemo(() => {
    const nextModel = buildCanonicalPerkModel(place, places);
    const qrPayload = buildResidentQrPayload({ place, action: "use_perk", source: "perk_detail" });
    return {
      ...nextModel,
      perkIdentity: {
        ...nextModel.perkIdentity,
        qrCodeSrc: getQrImageUrl(qrPayload.qrValue),
        qrCodeFallbackSrc: PERKS_CARD_QR_SRC,
      },
    };
  }, [place, places]);
  return <CanonicalDetailPanel model={model} saved={savedIds?.has?.(place?.id)} onSave={onSave} onPrimaryAction={onUse} onRelatedSelect={onSelect} onAnalytics={onAnalytics} />;
}

function CanonicalCampaignDetailDrawer({ place, places = [], savedIds, onSave, onJoin, onSelect, onAnalytics }) {
  return <CanonicalDetailPanel model={buildCanonicalCampaignModel(place, places)} saved={savedIds?.has?.(place?.id)} onSave={onSave} onPrimaryAction={onJoin} onRelatedSelect={onSelect} onAnalytics={onAnalytics} />;
}

function buildHospitalityPortfolioModel(place, places = [], mode = "resident") {
  const portfolio = place?.portfolio || place?.raw?.portfolio || {};
  const concepts = Array.isArray(portfolio.concepts) ? portfolio.concepts : [];
  const activeLocations = (portfolio.activeLocations || [])
    .map((id) => places.find((candidate) => String(candidate.id) === String(id) || String(candidate.operatorEntityId || candidate.raw?.operatorEntityId || "") === String(id)) || concepts.find((concept) => concept.id === id))
    .map((entity) => entity && !entity.type ? {
      ...entity,
      isPortfolioFallback: true,
      type: "venue",
      kind: "venue",
      entityType: "venue",
      detailDrawerType: "venue",
      category: "Restaurant / Hospitality",
      district: entity.name?.includes("Rainey") ? "Rainey" : "Downtown Austin",
      summary: `Current ${place?.name || "hospitality"} concept. Operator relationship verified from the official portfolio.`,
      portfolioId: place?.portfolioId,
      publicationStatus: "published",
      mapVisibility: "search_only",
      verificationStatus: "verified",
      hasPerk: false,
    } : entity)
    .filter(Boolean);
  const historic = concepts.filter((concept) => concept.status === "historic");
  const relationshipReview = concepts.filter((concept) => concept.status === "relationship_review" || concept.status === "active_unverified");
  const externalMarkets = concepts.filter((concept) => concept.status === "external_market");
  const draftExperiences = mode === "partner" ? (portfolio.draftExperiences || []) : [];
  return {
    entityType: "portfolio",
    titleId: `canonical-detail-title-${place.id}`,
    eyebrow: "Hospitality portfolio",
    title: place?.name || "Hospitality portfolio",
    summary: place?.summary || "Current concepts and portfolio relationships.",
    contextItems: [
      { icon: MapPin, label: `${activeLocations.length} verified Austin venues` },
      portfolio.keyPeople?.length ? { icon: BriefcaseBusiness, label: portfolio.keyPeople.join(" Â· ") } : { icon: BriefcaseBusiness, label: "Hospitality operator" },
    ],
    primaryAction: { label: "Open website", href: portfolio.website || place.sourceUrl || "https://dunlapatx.com/", external: true },
    sections: [
      activeLocations.length ? {
        id: "current-venues",
        kind: "rail",
        title: "Current concepts",
        items: activeLocations.map((entity) => ({
          id: entity.id,
          entity,
          image: "",
          title: entity.name,
          meta: entity.address || entity.parentLocation || entity.district,
          detail: entity.parentLocation ? `At ${entity.parentLocation}` : "Operating status verified",
          href: entity.isPortfolioFallback && !Number.isFinite(entity.latitude) ? entity.sourceUrl : undefined,
          external: true,
        })),
      } : null,
      place?.portfolioId === DUNLAP_PORTFOLIO_ID ? {
        id: "founder",
        title: "Bridget Dunlap",
        body: "Austin hospitality founder, creative director, coach, speaker, and artist representative.",
      } : null,
      historic.length ? {
        id: "history",
        title: "Portfolio history",
        items: historic.map((concept) => concept.name),
      } : null,
      relationshipReview.length ? {
        id: "relationship-review",
        title: "Verify relationship",
        items: relationshipReview.map((concept) => `${concept.name} Â· ${concept.reviewNote || "Current operator relationship needs confirmation"}`),
      } : null,
      externalMarkets.length ? {
        id: "other-markets",
        title: "Other markets",
        items: externalMarkets.map((concept) => `${concept.name} Â· ${concept.market}`),
      } : null,
      draftExperiences.length ? {
        id: "draft-experiences",
        title: "In review",
        items: draftExperiences,
      } : null,
      portfolio.products?.length ? {
        id: "products",
        kind: "rail",
        title: "Creative work",
        items: portfolio.products.map((product) => ({ ...product, external: true })),
      } : null,
    ].filter(Boolean),
  };
}

function HospitalityPortfolioDrawer({ place, places, mode, savedIds, onSave, onSelect, onAnalytics }) {
  return (
    <CanonicalDetailPanel
      model={buildHospitalityPortfolioModel(place, places, mode)}
      saved={savedIds?.has?.(place?.id)}
      onSave={onSave}
      onRelatedSelect={onSelect}
      onAnalytics={onAnalytics}
    />
  );
}

function EventDetailDrawer({ place, places = [], savedIds, eventRsvps, onRsvp, onSave, onSelect, onAnalytics, answer, loading, onAsk, onCloseAnswer, mode = "resident" }) {
  const profile = getEventProfile(place);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const isSaved = savedIds?.has?.(place?.id);
  const isRsvped = (Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === place?.id);
  const filteredPlaces = places.filter((candidate) => candidate?.id !== place?.id && !isCampaignEntity(candidate));
  const metaItems = [
    profile.address && { icon: MapPin, label: "Venue", value: profile.room || place?.venue || place?.host || place?.district || "Downtown Austin" },
    profile.time && { icon: CalendarDays, label: "When", value: profile.time },
    (profile.price || profile.reservation || profile.checkIn) && { icon: TicketPercent, label: "Entry", value: profile.price || profile.reservation || profile.checkIn },
    profile.duration && { icon: Clock, label: "Duration", value: profile.duration },
  ].filter(Boolean).slice(0, 4);
  const quickFacts = [
    profile.time && { icon: CalendarDays, label: "When", value: profile.time },
    profile.address && { icon: MapPin, label: "Where", value: profile.address },
    (profile.price || profile.reservation || profile.checkIn) && { icon: TicketPercent, label: "Entry", value: profile.price || profile.reservation || profile.checkIn },
    profile.duration && { icon: Clock, label: "Duration", value: profile.duration },
    profile.room && { icon: Landmark, label: "Venue", value: profile.room },
    profile.addOn && { icon: Sparkles, label: "Good to know", value: profile.addOn },
  ].filter(Boolean);
  const aboutText = String(profile.about || "").trim();
  const shouldShowAbout = aboutText && aboutText !== String(profile.oneSentence || "").trim();
  const overview = isOverviewExpanded ? { text: aboutText || profile.oneSentence, isTruncated: false } : truncateEventOverview(aboutText || profile.oneSentence);
  const showReadMore = (aboutText || profile.oneSentence || "").length > 220;
  const usesExternalPrimaryAction = Boolean(profile.url && /\b(book|ticket|reserve|register|event page)\b/i.test(profile.primaryAction));
  const shareEvent = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: profile.title, text: profile.oneSentence, url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard?.writeText?.(shareUrl);
    } catch {
      // Share is best-effort; keep the drawer responsive if the browser blocks it.
    }
  };
  const calendarStart = profile.start ? new Date(profile.start) : null;
  const canAddToCalendar = Boolean(calendarStart && !Number.isNaN(calendarStart.getTime()));
  const addToCalendar = () => {
    if (!canAddToCalendar) return;
    const escapeCalendarText = (value) => String(value || "").replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");
    const formatCalendarDate = (value) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Downtown Perks//Resident Event//EN",
      "BEGIN:VEVENT",
      `UID:${escapeCalendarText(place.id)}@downtownperks`,
      `DTSTAMP:${formatCalendarDate(new Date())}`,
      `DTSTART:${formatCalendarDate(profile.start)}`,
      profile.end && !Number.isNaN(new Date(profile.end).getTime()) ? `DTEND:${formatCalendarDate(profile.end)}` : "",
      `SUMMARY:${escapeCalendarText(profile.title)}`,
      profile.address ? `LOCATION:${escapeCalendarText(profile.address)}` : "",
      profile.oneSentence ? `DESCRIPTION:${escapeCalendarText(profile.oneSentence)}` : "",
      typeof window !== "undefined" ? `URL:${escapeCalendarText(window.location.href)}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean);
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${place.id || "downtown-event"}.ics`;
    link.click();
    URL.revokeObjectURL(href);
  };

  if (mode === "resident") {
    const canonicalModel = buildCanonicalEventModel(place, filteredPlaces);
    const primaryIsExternal = Boolean(canonicalModel.primaryAction?.href);
    return (
      <CanonicalDetailPanel
        model={canonicalModel}
        saved={isSaved}
        onSave={onSave}
        onPrimaryAction={primaryIsExternal ? undefined : onRsvp}
        onRelatedSelect={onSelect}
        onAnalytics={onAnalytics}
      />
    );
  }

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-event-detail-drawer">
      <DestinationHero place={place} mode="resident" />
      <header className="dp-entity-panel-header dp-entity-summary dp-event-summary">
        <p className="dp-entity-eyebrow">{profile.eyebrow}</p>
        <h2 className="dp-entity-title">{profile.title}</h2>
        <p className="dp-entity-dek">{profile.oneSentence}</p>
        {!!metaItems.length && (
          <div className="dp-entity-meta-row" aria-label={`${profile.title} key details`}>
            {metaItems.map(({ icon: Icon, label, value }) => (
              <span key={`${label}-${value}`}>
                <Icon aria-hidden="true" />
                <em>{value}</em>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="dp-primary-action-row dp-editorial-hero-actions dp-event-primary-actions">
        {usesExternalPrimaryAction ? (
          <a href={profile.url} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">{profile.primaryAction}</a>
        ) : (
          <button type="button" onClick={onRsvp} className="dp-panel-action dp-primary-action">
            {isRsvped ? "RSVP submitted" : "RSVP"}
          </button>
        )}
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">
          Directions
        </a>
        <button type="button" onClick={onSave} className="dp-panel-action">
          {isSaved ? "Saved" : "Save"}
        </button>
        <button type="button" onClick={shareEvent} className="dp-panel-action">
          Share
        </button>
        {canAddToCalendar && (
          <button type="button" onClick={addToCalendar} className="dp-panel-action">
            Add to calendar
          </button>
        )}
      </div>

      <DestinationSection title="About this event" className="dp-event-section dp-event-overview-section">
        <p>{overview.text}</p>
        {showReadMore && (
          <button type="button" className="dp-event-read-more" onClick={() => setIsOverviewExpanded((current) => !current)}>
            {isOverviewExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </DestinationSection>

      {!!quickFacts.length && (
        <DestinationSection title="Quick facts" className="dp-event-section dp-event-quick-facts-section">
          <div className="dp-event-quick-fact-grid">
            {quickFacts.slice(0, 6).map(({ icon: Icon, label, value }) => (
              <span key={`${label}-${value}`} className="dp-event-quick-fact">
                <Icon aria-hidden="true" />
                <strong>{label}</strong>
                <em>{value}</em>
              </span>
            ))}
          </div>
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

      {(!!profile.included.length || !!profile.goodFor.length) && (
        <DestinationSection title="What to expect" className="dp-event-section">
          <LocalServiceRail title="What to expect" items={[...profile.included, ...profile.goodFor].slice(0, 8)} />
        </DestinationSection>
      )}

      {(profile.address || profile.room || profile.url) && (
        <DestinationSection title="Venue" className="dp-event-section dp-event-venue-section">
          <div className="dp-event-venue-card">
            <strong>{profile.room || place?.venue || place?.host || place?.district || "Downtown Austin"}</strong>
            {profile.address && <span>{profile.address}</span>}
            {profile.url && (
              <a href={profile.url} target="_blank" rel="noreferrer">
                Event page
              </a>
            )}
          </div>
        </DestinationSection>
      )}

      <NearbyImageRail
        place={place}
        places={filteredPlaces}
        onSelect={onSelect}
        title="Nearby before or after"
        targetKind="dining"
      />

      <NearbyImageRail
        place={place}
        places={filteredPlaces}
        onSelect={onSelect}
        title="Similar events"
        targetKind="event"
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

function DistrictNearbyList({ places = [], onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const visiblePlaces = expanded ? places : places.slice(0, 6);
  if (!places.length) return null;

  return (
    <div className="dp-district-nearby" aria-label="Nearby">
      <div className="dp-district-nearby__list">
        {visiblePlaces.map((candidate) => {
          const category = candidate.category || candidate.type || "Nearby";
          const district = candidate.district || "Downtown Austin";
          return (
            <button
              key={candidate.id}
              type="button"
              className="dp-district-nearby__item"
              aria-label={`Open ${candidate.name}, ${category}, ${district}`}
              onClick={() => onSelect(candidate)}
            >
              <span className="dp-district-nearby__media" aria-hidden="true">
                <img src={resolveEntityImage(candidate, "card")} alt="" loading="lazy" decoding="async" onError={handlePanelImageError} />
              </span>
              <span className="dp-district-nearby__content">
                <strong className="dp-district-nearby__title">{candidate.name}</strong>
                <em className="dp-district-nearby__meta">{category}</em>
                <small className="dp-district-nearby__district">{district}</small>
              </span>
              <ChevronRight className="dp-district-nearby__chevron" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      {places.length > 6 && (
        <button type="button" className="dp-district-nearby__toggle" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show fewer" : "View all"}
        </button>
      )}
    </div>
  );
}

function DistrictDisclosureSection({ title, children, className = "" }) {
  const displayTitle = getV4DestinationSectionTitle(title);
  return (
    <details className={`dp-destination-section dp-district-section dp-district-disclosure ${className}`} open>
      <summary className="dp-district-disclosure__summary">
        <h3>{displayTitle}</h3>
        <ChevronDown className="dp-district-disclosure__chevron" aria-hidden="true" />
      </summary>
      <div className="dp-district-disclosure__body">
        {children}
      </div>
    </details>
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
    .slice(0, 6);
  const campaignRecommendations = list("campaignRecommendations");
  const isResidentMode = mode !== "partner";
  const districtTitle = place?.name || raw?.name || "District";
  const activePerkCount = linkedPlaces.filter((candidate) => hasActivePerkData(candidate) || getResidentEntityKind(candidate) === "perk").length;
  const eventCount = linkedPlaces.filter((candidate) => isEventEntity(candidate)).length;
  const featuredPlaceCount = linkedPlaces.length;
  const residentHighlights = [
    ...(list("localHighlights").length ? list("localHighlights") : []),
    ...(list("dailyEssentials").length ? list("dailyEssentials") : []),
    ...(campaignRecommendations.length ? campaignRecommendations : []),
  ].slice(0, 4);
  const districtBuildings = list("notableBuildings").slice(0, 6);
  const goodFor = list("bestFor").slice(0, 5);

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-neighborhood-drawer dp-district-detail-drawer">
      <DestinationHero place={{ ...place, image }} mode={mode} />
      <EntityIdentityPanel identity={getEntityIdentity(place, mode)} />
      <section className="dp-destination-action-row dp-neighborhood-actions" aria-label={`${place.name} actions`}>
        <button type="button" className="is-primary" onClick={() => {
          const match = linkedPlaces[0];
          if (match) onSelect(match);
        }}>{isResidentMode ? `Explore ${districtTitle}` : "Review district"}</button>
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer">Directions</a>
        <button type="button" onClick={onSave}>{isSaved ? "Saved" : "Save"}</button>
      </section>

      <DestinationSection title={mode === "partner" ? "Why this district matters" : (place.drawerHeadline || raw.drawerHeadline || "Why choose this neighborhood")}>
        <p className="dp-why-people-go">{place.drawerBody || raw.drawerBody || place.description || place.summary}</p>
      </DestinationSection>

      {isResidentMode && (
        <DestinationSection title={`Today in ${districtTitle}`} className="dp-district-section dp-district-today-section">
          <div className="dp-district-snapshot-list" aria-label={`Today in ${districtTitle}`}>
            <span>{activePerkCount || 3} active perks</span>
            <span>{eventCount || 5} events</span>
            <span>{featuredPlaceCount || 12} featured places</span>
          </div>
        </DestinationSection>
      )}

      {!isResidentMode && Array.isArray(comparisonRows) && comparisonRows.length > 0 && (
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

      {districtBuildings.length > 0 && (
        <DestinationSection title="Buildings" className="dp-district-section dp-district-chip-section">
          <div className="dp-district-chip-rail" aria-label="Buildings">
            {districtBuildings.map((item) => (
              <button key={item} type="button" className="dp-district-chip" onClick={() => {
                const match = places.find((candidate) => String(candidate.name || "").toLowerCase() === String(item).toLowerCase());
                if (match) onSelect(match);
              }}>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        </DestinationSection>
      )}

      {residentHighlights.length > 0 && (
        <DestinationSection title={isResidentMode ? "Resident highlights" : "Local highlights"} className="dp-district-chip-section">
          <div className="dp-district-chip-rail" aria-label={isResidentMode ? "Resident highlights" : "Local highlights"}>
            {residentHighlights.map((item) => (
              <button key={item} type="button" className="dp-district-chip" onClick={() => {
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
        <DestinationSection title={featuredPerk.title} className="dp-district-section dp-district-featured-perk">
          <p><strong>{featuredPerk.title}</strong></p>
          <p>{featuredPerk.body}</p>
        </DestinationSection>
      )}

      {list("bestFor").length > 0 && (
        <DestinationSection title="Good for" className="dp-district-section dp-district-good-for-section">
          <div className="dp-district-tag-cloud" aria-label="Good for">
            {goodFor.map((item) => <span key={item} className="dp-district-tag">{item}</span>)}
          </div>
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
        <DestinationSection title="Nearby" className="dp-district-section dp-district-nearby-pins">
          <DistrictNearbyList places={linkedPlaces} onSelect={onSelect} />
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
    ["Category", "Restaurant Â· Burgers Â· Drinks"],
    ["District", "Congress Avenue"],
    ["Audience", "Residents, office workers, hotel guests, convention attendees, event-goers, tourists"],
    ["Visit Patterns", "Lunch Â· Happy Hour Â· Dinner Â· Late Night"],
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
          <span className="mt-2 h-1.5 w-1.5 rounded-[2px] bg-[#BFA46A]" aria-hidden="true" />
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A]">{label}</div>
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
        <p className="dp-inkind-zone-meta">{cuisine} Â· {neighborhood}</p>
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
              const meta = [candidateKind, candidate.district || "Downtown Austin", nearbyItem?.distanceLabel].filter(Boolean).join(" Â· ");
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

function InKindResidentDrawer({ place, places = [], savedIds, onSave, onSelect, answer, loading, onAsk, onCloseAnswer }) {
  const venue = getCanonicalInKindVenue(place);
  const isSaved = savedIds?.has?.(place?.id);
  const activeBenefit = venue.inKind.benefitStatus === "active";
  const recommendations = getNearbyRecommendations({ selectedEntity: place, entities: places, radiusMeters: 900, fallbackRadiusMeters: 1600, limit: 10, mode: "resident" })
    .map((item) => ({ ...item, kind: getDestinationKind(item.entity) }))
    .filter((item) => ["dining", "nightlife", "hotel", "parking", "coffee"].includes(item.kind) && item.entity?.id !== place?.id)
    .slice(0, 6);
  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-inkind-governed-drawer dp-inkind-resident-drawer" data-inkind-renderer="resident">
      <DestinationHero place={place} mode="resident" />
      <header className="dp-entity-panel-header dp-entity-summary">
        <p className="dp-entity-eyebrow">{venue.subcategory} Â· {venue.district}</p>
        <h2 className="dp-entity-title">{venue.name}</h2>
        <p className="dp-entity-dek">{venue.residentView.summary}</p>
        <p className="dp-inkind-benefit-status">{activeBenefit ? "Downtown Perks benefit available" : "Benefit availability unverified"}</p>
      </header>

      <div className="dp-contained-action-grid dp-inkind-governed-actions">
        {activeBenefit && <a href={venue.inKind.externalUrl} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">Open benefit</a>}
        {venue.reservationUrl && <a href={venue.reservationUrl} target="_blank" rel="noreferrer" className="dp-panel-action">Reserve</a>}
        <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">Directions</a>
        <button type="button" onClick={onSave} className="dp-panel-action">{isSaved ? "Saved" : "Save"}</button>
      </div>

      {activeBenefit && (
        <DestinationSection title="Your Downtown Perks benefit" className="dp-inkind-resident-benefit">
          <p className="dp-inkind-benefit-title">{venue.inKind.benefitTitle}</p>
          <p>{venue.inKind.redemptionInstructions}</p>
          <p className="dp-destination-section-note">Available through participating inKind dining benefits. Terms and eligible dining windows may apply.</p>
        </DestinationSection>
      )}

      {activeBenefit && (
        <DestinationSection title="How to redeem" className="dp-inkind-redemption-steps">
          <ol className="dp-step-list">
            <li><span aria-hidden="true">1</span><h3>Open benefit</h3><p>Check the current inKind offer before ordering.</p></li>
            <li><span aria-hidden="true">2</span><h3>Visit</h3><p>Reserve if needed and mention the active benefit.</p></li>
            <li><span aria-hidden="true">3</span><h3>Redeem</h3><p>Follow the restaurantâ€™s current inKind instructions.</p></li>
          </ol>
          <p className="dp-inkind-before-you-go-inline"><strong>Before you go</strong><span>Check the live offer before you leave.</span></p>
        </DestinationSection>
      )}

      {!!recommendations.length && (
        <DestinationSection title="Continue exploring" className="dp-inkind-nearby-zone">
          <div className="dp-inkind-related-rail">
            {recommendations.map(({ entity, distanceLabel, kind }) => (
              <button key={entity.id} type="button" className="dp-inkind-related-card" onClick={() => onSelect(entity)}>
                <img src={getLifestyleImage(entity, "resident")} alt="" loading="lazy" decoding="async" onError={handlePanelImageError} />
                <span>{shortenEntityTitle(entity.name || entity.title)}</span>
                <small>{[getNearbyKindLabel(entity, kind), distanceLabel].filter(Boolean).join(" Â· ")}</small>
              </button>
            ))}
          </div>
        </DestinationSection>
      )}

      <p className="dp-partner-disclosure">Offer availability and redemption are managed by the participating restaurant and inKind. Check the active benefit before ordering.</p>
    </motion.div>
  );
}

function InKindPartnerOpportunityDrawer({ place, places = [], onSelect, answer, loading, onAsk, onCloseAnswer }) {
  const location = useLocation();
  const venue = getCanonicalInKindVenue(place);
  const opportunityPlaces = getNearbyRecommendations({ selectedEntity: place, entities: places, radiusMeters: 1200, fallbackRadiusMeters: 2400, limit: 12, mode: "partner" })
    .map((item) => item.entity)
    .filter((entity) => entity?.id !== place?.id && ["property", "hotel", "event", "brand"].includes(getDestinationKind(entity)))
    .slice(0, 6);
  const partnerCopy = getPartnerPanelCopy(place);
  const priorityAccounts = opportunityPlaces.slice(0, 4).map((entity) => entity.name).filter(Boolean);
  const residentPreviewParams = new URLSearchParams(location.search);
  residentPreviewParams.set("mode", "resident");
  residentPreviewParams.set("tab", "map");
  residentPreviewParams.set("filter", "inKind");
  residentPreviewParams.set("entityId", place.id);
  residentPreviewParams.delete("intent");
  const residentPreview = `/map?${residentPreviewParams.toString()}`;
  const campaignFit = [
    ["Opportunity", partnerCopy.description],
    ["Best timing", partnerCopy.timing],
    ["Where it appears", partnerCopy.placement],
    ["Expected action", partnerCopy.value],
  ].filter(([, value]) => value);

  return (
    <motion.div className="dp-map-panel-content dp-partner-detail-content dp-inkind-governed-drawer dp-inkind-partner-opportunity" data-inkind-renderer="partner">
      <DestinationHero place={place} mode="partner" />
      <header className="dp-entity-panel-header dp-entity-summary">
        <p className="dp-entity-eyebrow">inKind dining partner Â· {venue.district}</p>
        <h2 className="dp-entity-title">{venue.name}</h2>
        <p className="dp-entity-dek">{partnerCopy.description}</p>
      </header>
      <DestinationSection title="Current offer"><p>{venue.inKind.benefitTitle}</p><p className="dp-destination-section-note">Review eligibility and redemption rules before publishing this offer.</p></DestinationSection>
      <div className="dp-contained-action-grid dp-inkind-governed-actions">
        <Link to={campaignRoute(place)} className="dp-panel-action dp-primary-action">Build campaign</Link>
        <Link to={residentPreview} className="dp-panel-action">Preview published view</Link>
        <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action">View performance</Link>
      </div>
      <DestinationSection title="What to do next"><p>{partnerCopy.terms || partnerCopy.value}</p></DestinationSection>
      <DestinationSection title="Recommended campaign brief" className="dp-inkind-partner-brief">
        <dl>{campaignFit.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </DestinationSection>
      {!!priorityAccounts.length && <DestinationSection title="Priority nearby accounts"><p>{priorityAccounts.join(" Â· ")}</p></DestinationSection>}
      {!!opportunityPlaces.length && (
        <DestinationSection title="Participating account network">
          <div className="dp-related-rail">{opportunityPlaces.map((entity) => <button key={entity.id} type="button" className="dp-related-place" onClick={() => onSelect(entity)}><span><strong>{entity.name}</strong><em>{getNearbyKindLabel(entity, getDestinationKind(entity))} Â· {entity.district || "Downtown Austin"}</em></span></button>)}</div>
        </DestinationSection>
      )}
    </motion.div>
  );
}

function HospitalityNetworkDrawer({ place, places = [], mode = "resident", savedIds, onSave, onSelect, answer, loading, onAsk, onCloseAnswer }) {
  const raw = place?.raw || {};
  const placeId = String(place?.id || raw.id || "");
  const isOffer = (raw.kind || place?.kind) === "hospitality-offer" || Boolean(place?.parentHotelId || raw.parentHotelId || raw.parent_entity_id);
  const canonicalParentId = place?.parentHotelId || raw.parentHotelId || raw.parent_entity_id || (placeId.includes("fairmont") ? "brand-fairmont-austin" : "brand-hotel-van-zandt");
  const isParentHotel = !isOffer && ["brand-hotel-van-zandt", "brand-fairmont-austin", "hotel-van-zandt"].includes(placeId);
  const hotelName = place?.parentHotelName || raw.parentHotelName || (canonicalParentId === "brand-fairmont-austin" ? "Fairmont Austin" : "Hotel Van Zandt");
  const residentSummary = place?.residentPanel?.description || raw.residentPanel?.description || place?.residentSummary || raw.residentSummary || place?.summary || raw.summary;
  const partnerSummary = getPartnerPanelCopy(place).description;
  const panel = mode === "partner" ? (place?.partnerPanel || raw.partnerPanel) : (place?.residentPanel || raw.residentPanel);
  const configuredActions = Array.isArray(panel?.actions) ? panel.actions.filter((action) => action?.label).slice(0, 5) : [];
  const offerState = place?.offerState || raw.offerState || "verification_required";
  const validThroughLabel = place?.validThroughLabel || raw.validThroughLabel || place?.validThrough || raw.validThrough;
  const termsSummary = place?.termsSummary || raw.termsSummary;
  const highlights = asCleanArray(place?.highlights || raw.highlights);
  const bestFor = asCleanArray(place?.bestFor || raw.bestFor);
  const bookingUrl = place?.bookingUrl || raw.bookingUrl || place?.website || raw.website || "";
  const sourceUrl = place?.sourceUrl || raw.sourceUrl || bookingUrl;
  const isSaved = savedIds?.has?.(place.id);
  const related = places
    .filter((candidate) => candidate?.id !== place?.id && (candidate?.parentHotelId || candidate?.raw?.parentHotelId || candidate?.raw?.parent_entity_id) === canonicalParentId)
    .slice(0, 12);
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: place.name, text: residentSummary, url });
      else await navigator.clipboard?.writeText?.(url);
    } catch {
      // Sharing is best-effort.
    }
  };
  const actionHref = (action) => {
    if (action.type === "route" && action.target === "google_maps_url") return directionsUrl(place);
    if (action.type === "open_visibility_controls") return `/partner-workspace?entityId=${encodeURIComponent(placeId)}&view=visibility`;
    if (action.type === "open_audience_view") return `/map?mode=partner&tab=map&intent=audience&entityId=${encodeURIComponent(placeId)}`;
    return action.target || sourceUrl;
  };
  const renderConfiguredAction = (action, index) => {
    const className = `dp-panel-action${index === 0 ? " dp-primary-action" : ""}`;
    if (action.type === "toggle_saved_state") return <button key={`${action.label}-${index}`} type="button" onClick={onSave} className={className}>{isSaved ? "Saved" : action.label}</button>;
    const href = actionHref(action);
    if (!href) return null;
    if (href.startsWith("/")) return <Link key={`${action.label}-${index}`} to={href} className={className}>{action.label}</Link>;
    return <a key={`${action.label}-${index}`} href={href} target="_blank" rel="noreferrer" className={className}>{action.label}</a>;
  };

  return (
    <motion.div className="dp-map-panel-content dp-destination-content dp-detail-content dp-hospitality-network-drawer" data-hospitality-renderer={mode}>
      <DestinationHero place={place} mode={mode} />
      <header className="dp-entity-panel-header dp-entity-summary">
        <p className="dp-entity-eyebrow">{isOffer ? "Hotel offer" : "Shared hotel amenity"} Â· {place.district || raw.district || "Downtown Austin"}</p>
        <h2 className="dp-entity-title">{place.name}</h2>
        <p className="dp-entity-meta">{hotelName}</p>
        <p className="dp-entity-dek">{mode === "partner" ? partnerSummary : residentSummary}</p>
      </header>
      <div className="dp-primary-action-row dp-editorial-hero-actions">
        {configuredActions.length ? configuredActions.map(renderConfiguredAction) : mode === "partner" ? (
          <>
            <Link to={campaignRoute(place)} className="dp-panel-action dp-primary-action">Build campaign</Link>
            <Link to={getPartnerDashboardRoute(place)} className="dp-panel-action">View performance</Link>
            <button type="button" onClick={share} className="dp-panel-action">Share</button>
          </>
        ) : (
          <>
            {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer" className="dp-panel-action dp-primary-action">{isParentHotel ? "Book stay" : place.primaryAction || raw.primaryAction || "View offer"}</a>}
            {isParentHotel && <button type="button" className="dp-panel-action" onClick={() => document.querySelector(".dp-hospitality-network-drawer .dp-related-rail")?.scrollIntoView({ behavior: "smooth", block: "center" })}>View offers</button>}
            <a href={directionsUrl(place)} target="_blank" rel="noreferrer" className="dp-panel-action">Directions</a>
            <button type="button" onClick={onSave} className="dp-panel-action">{isSaved ? "Saved" : "Save"}</button>
            <button type="button" onClick={share} className="dp-panel-action">Share</button>
          </>
        )}
      </div>
      {isOffer && (
        <DestinationSection title="Offer details">
          <div className="dp-inkind-tag-row">
            <span>{offerState === "active" ? "Active offer" : offerState === "expiring_soon" ? "Ending soon" : offerState === "expired" ? "Expired" : "Verify availability"}</span>
            {validThroughLabel && <span>{validThroughLabel}</span>}
          </div>
          {termsSummary && <p>{termsSummary}</p>}
          {sourceUrl && <a className="dp-text-action" href={sourceUrl} target="_blank" rel="noreferrer">View official hotel source</a>}
        </DestinationSection>
      )}
      {!!highlights.length && <DestinationSection title={isOffer ? "What is included" : "Amenity details"}><div className="dp-inkind-tag-row">{highlights.map((item) => <span key={item}>{item}</span>)}</div></DestinationSection>}
      {!!bestFor.length && <DestinationSection title="Best for"><div className="dp-inkind-tag-row">{bestFor.map((item) => <span key={item}>{item}</span>)}</div></DestinationSection>}
      {placeId === "hvz-bach-party-experience" && (
        <DestinationSection title="Plan the full stay">
          <div className="dp-partner-context-list">
            {["Rooms and suite options", "Brunch at Geraldineâ€™s", "Cocktails and live music", "Rooftop pool time", "Downtown happenings", "Concierge planning"].map((title) => <div key={title}><h3>{title}</h3><p>Coordinate this part of the experience directly with Hotel Van Zandt.</p></div>)}
          </div>
        </DestinationSection>
      )}
      {!!related.length && (
        <DestinationSection title={isParentHotel ? "Current offers" : `More at ${hotelName}`}>
          <div className="dp-related-rail">{related.map((candidate) => <button key={candidate.id} type="button" className="dp-related-place" onClick={() => onSelect(candidate)}><span><strong>{candidate.name}</strong><em>{candidate.kind === "hospitality-offer" ? "Hotel offer" : "Hotel amenity"}</em></span></button>)}</div>
        </DestinationSection>
      )}
      {onAsk && <EntityAssistant place={place} mode={mode} answer={answer} loading={loading} onAsk={onAsk} onClose={onCloseAnswer} onSelect={onSelect} />}
      {isOffer && <p className="dp-partner-disclosure">Availability, eligibility, and booking terms are managed by {hotelName}. Confirm the active offer before booking.</p>}
    </motion.div>
  );
}

function getMapDetailContextLabel(place, hasPerkContext = false) {
  if (getCanonicalDetailEntityType(place, hasPerkContext) === "perk") return "Perk";
  if (isEventEntity(place)) return "Event";
  if (isCampaignEntity(place)) return "Campaign";
  if (isCanonicalResidentialMixedUseEntity(place) || isTheShorePropertyEntity(place) || isExplicitPropertyRecord(place)) return "Building";
  if (isRentalEntity(place) || isListingEntity(place)) return "Listing";
  if (isHotelEntity(place)) return "Hotel";
  if (isPropertyEntity(place)) return "Building";
  if (getResolvedLegendsListing(place)) return "Listing";
  if (isLocalServiceEntity(place)) return "Service";
  if (isNeighborhoodEntity(place)) return "Neighborhood";
  return "Place";
}

function getMapDetailNavigationTitle(place, hasPerkContext = false, mode = "resident") {
  const entityType = getCanonicalDetailEntityType(place, hasPerkContext);
  if (entityType === "perk") return "Perk details";
  if (entityType === "event") return "Event details";
  if (entityType === "campaign") return "Campaign details";
  if (entityType === "portfolio") return "Portfolio details";
  if (getResidentEntityKind(place) === "route") return "Walking route";
  if (isHotelEntity(place) || isLocalServiceEntity(place) || isNeighborhoodEntity(place)) return "Place details";
  if (isCanonicalResidentialMixedUseEntity(place) || isTheShorePropertyEntity(place) || isExplicitPropertyRecord(place)) return mode === "partner" ? "Property details" : "Resident benefit";
  return place?.name || "Details";
}

function MapDetailHeader({ place, navigationTitle, backLabel = "Back", canGoBack, onBack, onClose, panelState = "medium", onPanelStateChange }) {
  const pointerStartRef = useRef(null);
  const stateOrder = ["medium", "expanded", "full"];
  const movePanel = (direction) => {
    const currentIndex = Math.max(0, stateOrder.indexOf(panelState));
    onPanelStateChange?.(stateOrder[Math.max(0, Math.min(stateOrder.length - 1, currentIndex + direction))]);
  };
  return (
    <header className="dp-map-panel-header dp-map-detail-header" aria-label="Detail navigation">
      <button
        type="button"
        className="dp-native-detail-grabber"
        aria-label={`Panel size: ${panelState}. Activate to ${panelState === "full" ? "collapse" : "expand"}.`}
        aria-expanded={panelState === "full"}
        onClick={() => movePanel(panelState === "full" ? -1 : 1)}
        onPointerDown={(event) => { pointerStartRef.current = event.clientY; event.currentTarget.setPointerCapture?.(event.pointerId); }}
        onPointerUp={(event) => {
          const start = pointerStartRef.current;
          pointerStartRef.current = null;
          if (!Number.isFinite(start)) return;
          const delta = event.clientY - start;
          if (Math.abs(delta) >= 28) movePanel(delta < 0 ? 1 : -1);
        }}
      ><span aria-hidden="true" /></button>
      <nav className="dp-map-detail-navigation" aria-label="Panel controls">
        {canGoBack ? (
          <button type="button" onClick={onBack} className="dp-map-detail-back" aria-label={backLabel}>
            <ArrowLeft aria-hidden="true" />
          </button>
        ) : <span className="dp-map-detail-header-spacer" aria-hidden="true" />}
        <span className="dp-map-detail-navigation-title">{navigationTitle || place?.name || "Details"}</span>
        <button type="button" onClick={onClose} data-map-drawer-close="true" className="dp-map-detail-close" aria-label={`Close ${place?.name || "details"}`}>
          <X aria-hidden="true" />
        </button>
      </nav>
      <span className="sr-only" role="status" aria-live="polite">Panel size {panelState}</span>
    </header>
  );
}

function firstDecisionSentence(value, fallback = "") {
  const clean = cleanDisplayCopy(value || fallback);
  if (!clean) return "";
  const match = clean.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] || clean).trim();
}

function sentenceCaseDetailLabel(value) {
  const text = cleanDisplayCopy(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function ResidentialMixedUseDrawer({ place, places = [], mode = "resident", savedIds, onSave, onSelect, onExplore, onOpenRoute }) {
  const raw = place?.raw || {};
  const isPartner = mode === "partner";
  const residentSummary = place.residentSummary || raw.residentSummary || place.summary;
  const summary = place.id === "44-east-ave"
    ? (isPartner
      ? "A lake-edge residential building with immediate access to the trail and Rainey."
      : "Lake-edge living with direct access to the trail and Rainey.")
    : firstDecisionSentence(residentSummary, place.overview);
  const disclosure = isPartner ? place.partnerDisclosure : place.residentDisclosure;
  const isSaved = savedIds?.has?.(place.id);
  const buildingExperience = useMemo(
    () => createBuildingExperience(place, { places, routeDefinitions: mapCollections }),
    [place, places],
  );
  const isFortyFourEast = /(^|\b)44 east(?: ave| avenue)?(?:\b|$)/i.test(`${place.id || ""} ${place.name || ""}`);
  const residentialHeroImage = isFortyFourEast
    ? fortyFourEastHero
    : resolveMapImage({
      id: place.id,
      name: place.name,
      type: place.type || "property",
      category: place.category,
      district: place.district,
    }, "drawerHeader");
  const sharePlace = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) return await navigator.share({ title: place.name, text: summary, url });
      await navigator.clipboard?.writeText?.(url);
    } catch {
      // Native sharing is best-effort.
    }
  };

  if (isPartner) {
    const workspaceParams = new URLSearchParams({ entityId: String(place.id) });
    if (place.district) workspaceParams.set("district", String(place.district));
    const workspaceRoute = `${mapRoutes.partnerWorkspace}?${workspaceParams.toString()}`;
    const campaignWorkspaceRoute = `/partner-workspace/campaigns?${workspaceParams.toString()}`;
    const performanceRoute = `/partner-workspace/performance?${workspaceParams.toString()}`;
    const profileRoute = `/partner-workspace/profile?section=workspace&entityId=${encodeURIComponent(place.id)}`;
    const visibilityRoute = `/partner-workspace/profile?section=visibility&entityId=${encodeURIComponent(place.id)}`;
    return (
      <div className="dp-entity-drawer dp-residential-system-drawer dp-partner-context-drawer dp-map-detail-entity" role="document" data-residential-content-system="partner">
        <figure className="dp-entity-hero dp-entity-hero-image"><img src={residentialHeroImage} alt={place.name} loading="lazy" decoding="async" onError={handlePanelImageError} /></figure>
        <header className="dp-entity-summary">
          <p className="dp-entity-meta">Residential Â· {place.district || "Downtown"}</p>
          <h2>{place.name}</h2>
          <span className="dp-map-detail-status">Profile live</span>
          <p>{summary}</p>
        </header>
        <div className="dp-map-detail-actions" aria-label="Partner map actions">
          <a className="dp-map-detail-primary-action" href={workspaceRoute}>Open in Workspace</a>
          <div className="dp-map-detail-secondary-actions">
            <a href={campaignWorkspaceRoute}>Create campaign</a>
            <a href={performanceRoute}>View performance</a>
            <details className="dp-map-detail-more">
              <summary>More</summary>
              <div>
                <a href={profileRoute}>Edit profile</a>
                <a href={visibilityRoute}>Edit map visibility</a>
                <a href={`${mapRoutes.partnerWorkspace}?${workspaceParams.toString()}&section=media`}>Manage media</a>
              </div>
            </details>
          </div>
        </div>
        <BuildingExperienceModule building={place} experience={buildingExperience} mode={mode} onSelect={onSelect} onExplore={onExplore} onOpenRoute={onOpenRoute} />
        <section className="dp-entity-section dp-map-detail-workspace-link">
          <h3>Workspace</h3>
          <p>Manage the profile, amenities, audience, campaigns, and reports in Workspace.</p>
          <a className="dp-text-action" href={workspaceRoute}>Open workspace</a>
        </section>
        <section className="dp-entity-section dp-map-detail-source">
          <h3>Source</h3>
          <p>Official building information reviewed.</p>
          {place.sourceUrl && <a className="dp-text-action" href={place.sourceUrl} target="_blank" rel="noreferrer">View official source</a>}
        </section>
      </div>
    );
  }

  return (
    <div className="dp-entity-drawer dp-residential-system-drawer dp-map-detail-entity" role="document" data-residential-content-system={mode}>
      <figure className="dp-entity-hero dp-entity-hero-image"><img src={residentialHeroImage} alt={place.name} loading="lazy" decoding="async" onError={handlePanelImageError} /></figure>
      <header className="dp-entity-summary">
        <p className="dp-entity-meta">{place.category || "Residential"} Â· {place.district}</p>
        <h2>{place.name}</h2><p>{summary}</p>
      </header>
      <div className="dp-map-detail-actions" aria-label={`${mode} actions`}>
        <button type="button" className="dp-map-detail-primary-action" onClick={() => document.querySelector("[data-residential-section='perks']")?.scrollIntoView({ behavior: "smooth", block: "start" })}>View resident perks</button>
        <div className="dp-map-detail-secondary-actions">
          <a href={directionsUrl(place)} target="_blank" rel="noreferrer">Directions</a>
          <button type="button" onClick={onSave}>{isSaved ? "Saved" : "Save"}</button>
          <button type="button" onClick={sharePlace}>Share</button>
        </div>
      </div>
      <BuildingExperienceModule building={place} experience={buildingExperience} mode={mode} onSelect={onSelect} onExplore={onExplore} onOpenRoute={onOpenRoute} />
      {disclosure && <p className="dp-partner-disclosure">{disclosure}</p>}
      <section className="dp-entity-section dp-map-detail-source"><h3>Source</h3><p>Official building information reviewed.</p>{place.sourceUrl && <a className="dp-text-action" href={place.sourceUrl} target="_blank" rel="noreferrer">{place.sourceLabel || "View official source"}</a>}</section>
    </div>
  );
}

function InKindPartnerDrawer({ place, places = [], savedIds, onSave, onSelectVenue, onShowVenues }) {
  if (!isInKindNetworkEntity(place)) return null;
  const participatingVenues = [
    ...places.filter((candidate) => candidate?.id !== place?.id && isInKindEntity(candidate) && !isInKindNetworkEntity(candidate)),
    ...getInKindNearbyDining(place, places),
  ]
    .filter((candidate, index, list) => candidate?.id && list.findIndex((item) => item?.id === candidate.id) === index)
    .slice(0, 6);
  const activeOfferVenue = participatingVenues.find((candidate) => candidate?.perk?.isActive !== false && (candidate?.perk?.title || candidate?.offer || candidate?.deals_offers));
  const activeOffer = activeOfferVenue ? getResidentPerkDetails(activeOfferVenue) : null;
  const externalUrl = place?.website || place?.url || place?.raw?.website || "https://inkind.com";
  const relatedCollections = ["Happy hour nearby", "Date-night dining", "Rainey restaurants", "Hotel guest dining", "Weekend plans"];
  const partnerContexts = [
    ["Residential partners", "Resident welcome offers, neighborhood guides, and building dining campaigns."],
    ["Hotel partners", "Guest maps, pre-arrival recommendations, convention routes, and walkable dinner options."],
    ["Participating venues", "Relevant searches, district collections, nearby recommendations, and targeted dining campaigns."],
    ["Brand and workplace partners", "Hosted dining, customer rewards, tenant events, and sponsored downtown routes."],
  ];

  return (
    <div className="dp-inkind-partner-detail" data-inkind-drawer="network">
      <header className="dp-partner-drawer-hero">
        <div className="dp-partner-drawer-media">
          <img src="/images/partner/drop-in-images/inkind-table-spread.jpg" alt="Dining experiences available through inKind" onError={handlePanelImageError} />
        </div>
      </header>

      <section className="dp-drawer-section dp-partner-summary">
        <p className="dp-drawer-eyebrow">Downtown dining network</p>
        <h1>inKind</h1>
        <p className="dp-drawer-deck">Discover participating restaurants, activate dining offers, and connect downtown residents, hotel guests, workers, and visitors with places they can use now.</p>
        <p className="dp-partner-context-line">Available through participating downtown venues and selected Downtown Perks campaigns.</p>
        <div className="dp-drawer-meta-row" aria-label="Partner metadata">
          <span>Multiple locations</span><span>Downtown Austin</span><span>Dining offers</span><span>Partner network</span>
        </div>
      </section>

      <div className="dp-drawer-primary-actions" aria-label="inKind actions">
        <button type="button" className="dp-button dp-button-primary" onClick={onShowVenues}>View participating restaurants</button>
        <button type="button" className="dp-button dp-button-secondary" onClick={() => document.querySelector('.dp-inkind-active-offer')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>See current dining offers</button>
        <a className="dp-button dp-button-secondary" href={externalUrl} target="_blank" rel="noreferrer">Open inKind</a>
        <button type="button" className="dp-button dp-button-icon" onClick={onSave} aria-label={savedIds?.has(place.id) ? "Remove saved inKind network" : "Save inKind network"}>
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          <span>{savedIds?.has(place.id) ? "Saved" : "Save"}</span>
        </button>
      </div>

      {activeOffer && (
        <section className="dp-drawer-section dp-inkind-active-offer">
          <div className="dp-section-heading-row"><div><p className="dp-drawer-eyebrow">Available now</p><h2>Current dining offers</h2></div></div>
          <article className="dp-offer-card">
            <span className="dp-offer-status">Available now</span>
            <h3>{activeOffer.offer || "Dining credit at participating downtown restaurants"}</h3>
            <p>{activeOffer.description}</p>
            {activeOfferVenue && <button type="button" className="dp-text-action" onClick={() => onSelectVenue(activeOfferVenue)}>View offer</button>}
          </article>
        </section>
      )}

      <section className="dp-drawer-section dp-inkind-participating-venues">
        <div className="dp-section-heading-row">
          <div><p className="dp-drawer-eyebrow">Nearby</p><h2>Participating restaurants</h2></div>
          <button type="button" className="dp-text-action" onClick={onShowVenues}>Show on map</button>
        </div>
        {participatingVenues.length ? (
          <div className="dp-inkind-grid-list dp-inkind-venue-list" role="list">
            {participatingVenues.map((venue) => (
              <button type="button" className="dp-place-card" role="listitem" key={venue.id} onClick={() => onSelectVenue(venue)}>
                <img src={getLifestyleImage(venue, "resident")} alt="" loading="lazy" onError={handlePanelImageError} />
                <span><strong>{venue.name}</strong><small>{[venue.district || "Downtown Austin", venue.category || "Dining"].filter(Boolean).join(" Â· ")}</small><em>inKind available</em></span>
              </button>
            ))}
          </div>
        ) : <p className="dp-drawer-empty-state">Participating restaurant details are being added. Open inKind to see current availability.</p>}
      </section>

      <section className="dp-drawer-section">
        <p className="dp-drawer-eyebrow">How it works</p><h2>How inKind works here</h2>
        <p className="dp-drawer-intro">inKind brings the dining offer and restaurant network. Downtown Perks brings the local audience, map placement, building access, campaign targeting, and measurable resident action.</p>
        <ol className="dp-step-list">
          <li><span>01</span><div><h3>Restaurants provide the experience</h3><p>Participating restaurants supply the dining destination and any active inKind offer.</p></div></li>
          <li><span>02</span><div><h3>Downtown Perks adds local context</h3><p>Restaurants appear when nearby residents, guests, workers, and event audiences are deciding where to go.</p></div></li>
          <li><span>03</span><div><h3>Partner accounts extend the reach</h3><p>Buildings, hotels, venues, and brands can feature relevant restaurants in routes, recommendations, and campaigns.</p></div></li>
        </ol>
      </section>

      <section className="dp-drawer-section">
        <p className="dp-drawer-eyebrow">Useful context</p><h2>Built for downtown partner accounts</h2>
        <div className="dp-partner-context-list">{partnerContexts.map(([title, copy]) => <div key={title}><h3>{title}</h3><p>{copy}</p></div>)}</div>
      </section>

      <section className="dp-drawer-section dp-inkind-related-collections">
        <p className="dp-drawer-eyebrow">Related content</p><h2>Explore more downtown dining</h2>
        <div className="dp-inkind-grid-list dp-inkind-related-list">{relatedCollections.map((label) => <button type="button" key={label} onClick={onShowVenues}>{label}</button>)}</div>
      </section>
      <p className="dp-partner-disclosure">Offers, eligibility, activation, and redemption are managed through participating restaurants and inKind. Downtown Perks provides discovery, local context, and map access.</p>
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
      .split(/\n|â€¢|,/)
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
    ].filter(Boolean).join(" Â· ");
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
    if (isPaseoResidentialProperty(place)) {
      return truncatePanelCopy(PASEO_ATX_MAP_COPY.context, 130);
    }
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
    dining: "More than a place to eat. This spot sits close to downtown homes, hotels, offices, and events â€” useful for lunch, dinner, happy hour, or a plan that does not need much planning.",
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
  if (mode === "partner" && isHospitalityNetworkEntity(place)) {
    return ["Which audiences should receive this?", "Where should this offer appear?", "What campaign should we launch?", "How should success be measured?"];
  }
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
      value: [getNearbyKindLabel(candidate, candidateKind), candidate.district || "Downtown Austin", perkText ? `Resident offer: ${perkText}` : ""].filter(Boolean).join(" Â· "),
    };
  });
}

function normalizeRailDedupeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[â€™']/g, "")
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
      { label: "Trader Joe's", value: "Grocery nearby Â· Seaholm" },
      { label: "Merit Coffee", value: "Coffee nearby Â· Seaholm" },
      { label: "Whole Foods", value: "Grocery nearby Â· Downtown Core" },
      { label: "Ruiz Salon", value: "Wellness nearby Â· Seaholm" },
    ], place, 4);
  }
  const legendsListing = getResolvedLegendsListing(place);
  if (legendsListing) {
    const nearbyItems = getNearbyAreaItems(place, places);
    if (nearbyItems.length) return nearbyItems;
    return dedupeRailItems([
      { label: "Austin Proper Hotel", value: "Hotel experiences nearby Â· 2nd Street" },
      { label: "ACL Live", value: "Music venue nearby Â· 2nd Street" },
      { label: "Royal Blue Grocery", value: "Grocery nearby Â· Resident grocery discount" },
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
  ].filter(Boolean).join(" Â· ");
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
  ×Í=Û†òµë(š+myÒò&rç7FG2¢µÓ°¢6öç7BæÇ—F–72ÒÆ6RææÇ—F–72ÇÂ&rææÇ—F–72ÇÂÆ6RæÖWG&–72ÇÂ&ræÖWG&–72ÇÂ·Ó°¢6öç7B'F–6—F–ærÒ'&’æ—4'&’‡Æ6Rç'F–6—F–ætVçF—F–W2’òÆ6Rç'F–6—F–ætVçF—F–W2¢'&’æ—4'&’‡&rç'F–6—F–ætVçF—F–W2’ò&rç'F–6—F–ætVçF—F–W2¢µÓ°¢6öç7B7F—fF–öå7F÷2Ò'&’æ—4'&’‡Æ6Ræ7F—fF–öå7F÷2’òÆ6Ræ7F—fF–öå7F÷2¢'&’æ—4'&’‡&ræ7F—fF–öå7F÷2’ò&ræ7F—fF–öå7F÷2¢µÓ°¢6öç7B'F–6—F–æt6÷VçBÒ'F–6—F–æræÆVæwFƒ°¢6öç7B&Wv&BÒÆ6Rç&Wv&BÇÂÆ6Rç&Wv&DÆ&VÂÇÂ&rç&Wv&BÇÂ&rç&Wv&DÆ&VÃ°¢6öç7B6×–våG—RÒÆ6Ræ6×–våG—RÇÂ&ræ6×–våG—S°¢6öç7B'FæW$6÷’ÒÖöFRÓÓÒ''FæW""òvWE'FæW%æVÄ6÷’‡Æ6R’¢çVÆÃ°¢6öç7B&W÷'D—FV×2Ò°¢²%f–Ww2"ÂæÇ—F–72çf–Ww5ÒÀ¢²$÷Vç2"ÂæÇ—F–72æ÷Vç5ÒÀ¢²%'F–6—çG2"ÂæÇ—F–72ç'F–6—çG5ÒÀ¢²$6ö×ÆWF–öç2"ÂæÇ—F–72æ6ö×ÆWF–öç5ÒÀ¢²%&VFV×F–öç2"ÂæÇ—F–72ç&VFV×F–öç5ÒÀ¢²$F—&V7F–öç2"ÂæÇ—F–72æF—&V7F–öç5ÒÀ¢Òæf–ÇFW"‚…²ÂfÇVUÒ’ÓâfÇVRÓÒVæFVf–æVBbbfÇVRÓÒçVÆÂbbfÇVRÓÒ""“° ¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖFW7F–æF–öâ×6V7F–öâGÖÖÖæF—fRÖ6×–vâÖFWF–Â#à¢Ç6Æ74æÖSÒ&GÖFW7F–æF–öâ×6V7F–öâÖ¶–6¶W"#ç¶ÖöFRÓÓÒ''FæW""ò$7F—fR6×–vâ"¢$fVGW&VBW‡W&–Væ6R'ÓÂ÷à¢Æƒ3ç¶ÖöFRÓÓÒ''FæW""ò%v†BF†—26×–vâ—2f÷""¢$†÷rFòW6R—B'ÓÂöƒ3à¢²‡Æ6Rç'FæW$Æ–æRÇÂÆ6Rç7öç6÷$æÖR’bb€¢Ç6Æ74æÖSÒ&GÖFW7F–æF–öâ×6V7F–öâÖæ÷FR#äfVGW&VB'’·Æ6Rç'FæW$Æ–æRÇÂÆ6Rç7öç6÷$æÖWÓÂ÷à¢—Ð¢Ç6Æ74æÖSÒ&GÖFW7F–æF–öâ×6V7F–öâÖ6÷’#à¢¶ÖöFRÓÓÒ''FæW" ¢ò'FæW$6÷’æFW67&—F–öà¢¢Æ6RæFW67&—F–öâÇÂ&ræFW67&—F–öâÇÂÆ6Rç7VÖÖ'’ÇÂ&rç7VÖÖ'’ÇÂ%F†—2fVGW&VBW‡W&–Væ6R6öææV7G2æV&'’Æ6W2Â&÷WFW2ÂæBW6VgVÂæW‡B7FW2–âF†RÖâ'Ð¢Â÷à¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖæF—fR×7FBÖw&–B"&–ÖÆ&VÃ×¶G·Æ6RææÖWÒ6×–vâ7FG6Óà¢²‡7FG2æÆVæwF‚ò7FG2¢°¢6×–våG—RòGµ7G&–ær†6×–våG—R’ç&WÆ6R‚òÒörÂ""—Ö¢$Ö6×–vâ"À¢'F–6—F–æt6÷VçBòG·'F–6—F–æt6÷VçGÒ'F–6—F–ærÆ6W6¢$F—66÷fW'’Æ6VÖVçB"À¢&Wv&BÇÂ%&Wv&BG&6¶VB"À¢Ò’ç6Æ–6RƒÂ2’æÖ‚†—FVÒ’Óâ€¢Ç7â¶W“×¶—FV×Óç¶—FV×ÓÂ÷7ãà¢’—Ð¢ÂöF—cà¢·&Wv&Bbb€¢Ç6Æ74æÖSÒ&GÖFW7F–æF–öâ×6V7F–öâÖæ÷FR#å&Wv&C¢·&Wv&GÓÂ÷à¢—Ð¢¶7F—fF–öå7F÷2æÆVæwF‚âbb€¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖ7F—fF–öâÖÆ—7B"&–ÖÆ&VÃ×¶G·Æ6RææÖWÒ7F—fF–öâ7F÷6Óà¢¶7F—fF–öå7F÷2æÖ‚‡7F÷’Óâ€¢ÆF—b¶W“×·7F÷æVçF—G”–BÇÂ7F÷çF—FÆWÒ6Æ74æÖSÒ&GÖ6×–vâÖ7F—fF–öâ×&÷r#à¢Ç7ãà¢Ç7G&öæsç·7F÷çF—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç·7F÷ç&öÆWÓÂ÷6ÖÆÃà¢Â÷7ãà¢Çç·7F÷æFWF–ÇÓÂ÷à¢ÂöF—cà¢’—Ð¢ÂöF—cà¢—Ð¢¶ÖöFRÓÓÒ''FæW""bb&W÷'D—FV×2æÆVæwF‚âbb€¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖæF—fR×&W÷'B"&–ÖÆ&VÃ×¶G·Æ6RææÖWÒ6×–vâW&f÷&Öæ6VÓà¢·&W÷'D—FV×2ç6Æ–6RƒÂb’æÖ‚…¶Æ&VÂÂfÇVUÒ’Óâ€¢Ç7â¶W“×¶Æ&VÇÓà¢Ç7G&öæsç·G—VöbfÇVRÓÓÒ&çVÖ&W""òfÇVRçFôÆö6ÆU7G&–ær‚’¢fÇVWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶Æ&VÇÓÂ÷6ÖÆÃà¢Â÷7ãà¢’—Ð¢ÂöF—cà¢—Ð¢¶ÖöFRÓÓÒ''FæW""bbÅ'FæW$6×–vå&Wf–Wu6V7F–öâÆ6S×·Æ6WÒóçÐ¢Â÷6V7F–öãà¢“°§Ð ¦gVæ7F–öâ&W6–FVçDG&vW$7F–öç2‡°¢6VÆV7FVBÀ¢6VÆV7FVE&W6–FVçD7F–öâÀ¢6fVD–G2À¢WfVçE'7g2ÒµÒÀ¢ÆVvVæG4Æ—7F–ærÀ¢öå'7gÀ¢öå6†÷t6&BÀ¢öä6´ÖÀ¢öå6fRÀ¢öåG&6´7F–öâÀ§Ò’°¢6öç7BVçF—G”¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡6VÆV7FVB“°¢6öç7BæVÄ&6†WG—RÒ&W6öÇfTVçF—G•æVÄ&6†WG—R‡6VÆV7FVB“°¢6öç7BæVÄ6öçFVçBÒ&W6öÇfTVçF—G•æVÄ6öçFVçB‡6VÆV7FVBÂ'&W6–FVçB"“°¢6öç7B—5&VçFÂÒVçF—G”¶–æBÓÓÒ'&VçFÂ#°¢6öç7B—5&÷W'G’ÒVçF—G”¶–æBÓÓÒ'&÷W'G’#°¢6öç7B—4WfVçBÒVçF—G”¶–æBÓÓÒ&WfVçB#°¢6öç7B—46×–vâÒVçF—G”¶–æBÓÓÒ&6×–vâ#°¢6öç7B—4çFöæW5fVçVRÒ—4çFöæW4VçF—G’‡6VÆV7FVB“°¢6öç7B—46—f–57F÷Ò—4FF÷W%Æ6R‡6VÆV7FVB’ÇÂ—46—f–4VçF—G’‡6VÆV7FVB’ÇÂ—4W‡Æ÷&TF÷vçF÷väVçF—G’‡6VÆV7FVB“°¢6öç7B†5W&²Ò†47F—fUW&´FF‡6VÆV7FVB“°¢6öç7B6öçF7G2ÒvWD6öçF7DFWF–Ç2‡6VÆV7FVB“°¢6öç7BvV'6—FT6öçF7BÒ6öçF7G2æf–æB‚†—FVÒ’Óâ—FVÒæ¶–æBÓÓÒ'vV'6—FR"“°¢6öç7Bf–WuW&²Ò‚’ÓâFö7VÖVçBçVW'•6VÆV7F÷"‚"æGÖFW7F–æF–öâÖG&vW"æGÖ–æ¶–æB×W&²×¦öæRÂæGÖFW7F–æF–öâÖG&vW"æG×W&²ÖÖöGVÆRÂæGÖFW7F–æF–öâÖG&vW"æGÖ†’Ö†÷W"×6V7F–öâ"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&6VçFW""Ò“°¢6öç7BW‡Æ÷&TæV&'’Ò‚’ÓâFö7VÖVçBçVW'•6VÆV7F÷"‚"æGÖFW7F–æF–öâÖG&vW"æGÖF—66÷fW'’Ö6öçFW‡B×6V7F–öâÂæGÖFW7F–æF–öâÖG&vW"æG×&÷W'G’ÖæV&'’×6V7F–öâ"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&6VçFW""Ò“°¢6öç7B6†&UÆ6RÒ7–æ2‚’Óâ°¢öåG&6´7F–öãòâ‚'6†&R"Â'&W6–FVçEöG&vW%÷6†&R"“°¢6öç7B6†&UW&ÂÒG—Vöbv–æF÷rÓÒ'VæFVf–æVB"òv–æF÷ræÆö6F–öâæ‡&Vb¢"#°¢6öç7B6†&TFFÒ²F—FÆS¢6VÆV7FVBææÖRÂFW‡C¢6VÆV7FVBç7VÖÖ'’ÇÂ6VÆV7FVBæFW67&—F–öâÇÂ6VÆV7FVBææÖRÂW&Ã¢6†&UW&ÂÓ°¢G'’°¢–b†æf–vF÷"ç6†&R’°¢v—Bæf–vF÷"ç6†&R‡6†&TFF“°¢&WGW&ã°¢Ð¢v—Bæf–vF÷"æ6Æ—&ö&Còçw&—FUFW‡Còâ‡6†&UW&Â“°¢Ò6F6‚°¢òò6†&–ær—2&W7BÖVff÷'C²F†Rf—6–&ÆR7F–öâ6†÷VÆBæWfW"&Æö6²F†RG&vW"à¢Ð¢Ó° ¢–b†—46—f–57F÷’°¢&WGW&âçVÆÃ°¢Ð ¢–b†—5&VçFÂ’°¢6öç7Bf–WtFWF–Ç2Ò‚’ÓâFö7VÖVçBçVW'•6VÆV7F÷"‚"æGÖFW7F–æF–öâÖG&vW"æG×&VçFÂÖFWF–Ç2"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&6VçFW""Ò“°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷r#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·f–WtFWF–Ç7Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·æVÄ&6†WG—Rç&–Ö'”7F–öçÐ¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢æVÄ&6†WG—Rç6V6öæF'”7F–öçÐ¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6†÷t6&GÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢6†÷r6&@¢Âö'WGFöãà¢ÂöF—cà¢“°¢Ð ¢–b†—5&÷W'G’’°¢6öç7Bf–WtÆ—7F–æw2Ò‚’Óâ°¢6öç7BÆ—7F–æw2ÒFö7VÖVçBçVW'•6VÆV7F÷"‚"æGÖFW7F–æF–öâÖG&vW"æGÖÆVvVæG2Ö†öÖRÖÆ—7B"“°¢–b†Æ—7F–æw2’°¢Æ—7F–æw2ç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&6VçFW""Ò“°¢&WGW&ã°¢Ð¢öä6öçF7B‚“°¢Ó°¢&WGW&â€¢Ãà¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷r#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶W‡Æ÷&TæV&'—Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·æVÄ6öçFVçBç&–Ö'”7F–öäÆ&VÂÇÂæVÄ&6†WG—Rç&–Ö'”7F–öçÐ¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢æVÄ&6†WG—Rç6V6öæF'”7F–öçÐ¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6†÷t6&GÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢6†÷r6&@¢Âö'WGFöãà¢ÂöF—cà¢Âóà¢“°¢Ð ¢–b†—46×–vâ’°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷r#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·6VÆV7FVBç&–Ö'”7F–öâÇÂ%7F'B6×–vâ'Ð¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡6VÆV7FVB—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚&F—&V7F–öç2"Â'&W6–FVçEö6×–vå÷&÷WFR"—Óà¢&÷WFP¢Âöà¢ÂöF—cà¢“°¢Ð ¢–b†—4çFöæW5fVçVR’°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷r#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡6VÆV7FVB—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚&F—&V7F–öç2"Â'&W6–FVçEöçFöæW5öF—&V7F–öç2"—Óà¢F—&V7F–öç0¢Âöà¢ÄÆ–æ²Fó×·6VÆV7FVE&W6–FVçD7F–öãòæ‡&VbÇÂ"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÔWfVçG2'Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢W6öÖ–ærWfVçG0¢ÂôÆ–æ³à¢ÂöF—cà¢“°¢Ð ¢–b†—4–ä¶–æDVçF—G’‡6VÆV7FVB’’°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷rGÖVF—F÷&–ÂÖ†W&òÖ7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·f–WuW&·Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢6Æ–Ò&W6–FVçBW&°¢Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡6VÆV7FVB—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚&F—&V7F–öç2"Â'&W6–FVçEö–æ¶–æEöF—&V7F–öç2"—Óà¢F—&V7F–öç0¢Âöà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢ÂöF—cà¢“°¢Ð ¢–b††5W&²bb—4WfVçB’°¢&WGW&âçVÆÃ°¢Ð ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×&–Ö'’Ö7F–öâ×&÷r#à¢¶—4WfVçBò€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå'7gÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢²„'&’æ—4'&’†WfVçE'7g2’òWfVçE'7g2¢µÒ’ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6VÆV7FVBæ–B’ò%6fVB%5e"¢æVÄ6öçFVçBç&–Ö'”7F–öäÆ&VÂÇÂæVÄ&6†WG—Rç&–Ö'”7F–öçÐ¢Âö'WGFöãà¢’¢†5W&²ò€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·f–WuW&·Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·æVÄ6öçFVçBç&–Ö'”7F–öäÆ&VÂÇÂæVÄ&6†WG—Rç&–Ö'”7F–öçÐ¢Âö'WGFöãà¢’¢—46—f–57F÷ò€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶W‡Æ÷&TæV&'—Ò6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢W‡Æ÷&RæV&'¢Âö'WGFöãà¢’¢€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâG×&–Ö'’Ö7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢—Ð¢²—4WfVçBbb††5W&²ÇÂ—46—f–57F÷’bb€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6fWÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢·6fVD–G2æ†2‡6VÆV7FVBæ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢—Ð¢²—4WfVçBbböå6†÷t6&Bbb€¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öå6†÷t6&GÒ6Æ74æÖSÒ&G×æVÂÖ7F–öâ#à¢6†÷r6&@¢Âö'WGFöãà¢—Ð¢²—4WfVçBbb€¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡6VÆV7FVB—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚&F—&V7F–öç2"Â'&W6–FVçEöG&vW%öF—&V7F–öç2"—Óà¢F—&V7F–öç0¢Âöà¢—Ð¢²—4WfVçBbbvV'6—FT6öçF7Bbb€¢Æ‡&Vc×·vV'6—FT6öçF7Bæ‡&VgÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚'vV'6—FR"Â'&W6–FVçEöG&vW%÷vV'6—FR"—Óà¢vV'6—FP¢Âöà¢—Ð¢¶—4WfVçBbbvV'6—FT6öçF7Bbb€¢Æ‡&Vc×·vV'6—FT6öçF7Bæ‡&VgÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&G×æVÂÖ7F–öâ"öä6Æ–6³×²‚’ÓâöåG&6´7F–öãòâ‚'vV'6—FR"Â'&W6–FVçEöWfVçE÷vV'6—FR"—Óà¢·æVÄ&6†WG—Rç6V6öæF'”7F–öçÐ¢Âöà¢—Ð¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ—4–æFWVæFVçE&÷W'G”VçF—G’‡Æ6R’°¢6öç7B–BÒ7G&–ær‡Æ6Sòæ–BÇÂÆ6SòæVçF—G”–BÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BæÖRÒ7G&–ær‡Æ6SòææÖRÇÂÆ6SòçF—FÆRÇÂ""’çFôÆ÷vW$66R‚“°¢&WGW&â€¢–BÓÓÒ'&÷W'G’×F†RÖ–æFWVæFVçB"ÇÀ¢–BÓÓÒ'&–÷&—G’×F†RÖ–æFWVæFVçB"ÇÀ¢–BÓÓÒ&ÇW‡W'’Ö'V–ÆF–ær×F†RÖ–æFWVæFVçB"ÇÀ¢æÖRÓÓÒ'F†R–æFWVæFVçB ¢“°§Ð ¦gVæ7F–öâ—5F†U6†÷&U&÷W'G”VçF—G’‡Æ6R’°¢6öç7B–BÒ7G&–ær‡Æ6Sòæ–BÇÂÆ6SòæVçF—G”–BÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BæÖRÒ7G&–ær‡Æ6SòææÖRÇÂÆ6SòçF—FÆRÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BFG&W72Ò7G&–ær‡Æ6SòæFG&W72ÇÂÆ6Sòç&sòæFG&W72ÇÂ""’çFôÆ÷vW$66R‚“°¢&WGW&â€¢–BÓÓÒ'&÷W'G’×F†R×6†÷&R"ÇÀ¢–BÓÓÒ'&–÷&—G’×F†R×6†÷&R"ÇÀ¢–BÓÓÒ&ÇW‡W'’Ö'V–ÆF–ær×F†R×6†÷&R"ÇÀ¢æÖRÓÓÒ'F†R6†÷&R"ÇÀ¢FG&W72æ–æ6ÇVFW2‚#c2Ff—2"¢“°§Ð ¦gVæ7F–öâW6W46ÆVå&W6–FVçF–ÄVçF—G”G&vW"‡Æ6R’°¢–b††4æöå&W6–FVçF–Ä7F—fF–öå6–væÇ2‡Æ6R’’&WGW&âfÇ6S°¢&WGW&â—4–æFWVæFVçE&÷W'G”VçF—G’‡Æ6R’ÇÂ—5F†U6†÷&U&÷W'G”VçF—G’‡Æ6R’ÇÂ—4ÆVvVæG4ÖÆ6R‡Æ6R’ÇÂ—4ÆVvVæG4Æ—7F–ætÆ–¶R‡Æ6R“°§Ð ¦gVæ7F–öâ6ÆVä–æFWVæFVçDVçF—G”G&vW"‡°¢Æ6RÀ¢ÖöFRÀ¢Æ6W2À¢6fVD–G2À¢öå6VÆV7BÀ¢öå6fRÀ¢öå6†÷t6&BÀ¢öäf–ÇFW"À¢öå&÷WFRÀ§Ò’°¢6öç7B—5'FæW$ÖöFRÒÖöFRÓÓÒ''FæW"#°¢6öç7B—56fVBÒ6fVD–G3òæ†3òâ‡Æ6Ræ–B“°¢6öç7B'FæW$æWGv÷&µW&·2ÒvWD'V–ÆF–æu'FæW$æWGv÷&µW&·2‡Æ6RÂÆ6W2ÂR“°¢6öç7Bf–æD'”æÖRÒ†æÖR’Óâ°¢6öç7BF&vWBÒ7G&–ær†æÖRÇÂ""’çFôÆ÷vW$66R‚“°¢&WGW&â&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ†æÖRÂÆ6W2¢ÇÂÆ6W2æf–æB‚†6æF–FFR’Óâ7G&–ær†6æF–FFSòææÖRÇÂ""’çFôÆ÷vW$66R‚’ÓÓÒF&vWB¢ÇÂÆ6W2æf–æB‚†6æF–FFR’Óâ7G&–ær†6æF–FFSòææÖRÇÂ""’çFôÆ÷vW$66R‚’æ–æ6ÇVFW2‡F&vWB’“°¢Ó°¢6öç7B÷Vå&VÆFVDVçF—G’Ò‡F&vWB’Óâ°¢6öç7BÖF6‚Òf–æD'”æÖR‡F&vWBæ–BÇÂF&vWBçF—FÆR“°¢–b†ÖF6‚’öå6VÆV7B†ÖF6‚“°¢Ó°¢6öç7BæV&'•&÷w2Ò°¢²F—FÆS¢%F†R6Vò"Â6÷“¢%&W6–FVçF–Â²&WF–ÂæV&'’"Â–C¢'&–÷&—G’×F†R×6Vò"ÒÀ¢²F—FÆS¢%F†RvFW&Æ–æR"Â6÷“¢$Ö—†VB×W6RF—7G&–7Bæ6†÷""Â–C¢'&–÷&—G’×F†R×vFW&Æ–æR"ÒÀ¢²F—FÆS¢$†÷FVÂfâ¦æGB"Â6÷“¢%&–æW’†÷FVÂæB×W6–2Öf÷'v&B†÷7—FÆ—G’"Â–C¢''FæW"Ö†÷FVÂ×fâ×¦æGB"ÒÀ¢²F—FÆS¢$vW&ÆF–æRw2"Â6÷“¢$F–ææW"ÂG&–æ·2ÂæBÆ—fR×W6–2æV&'’"Â–C¢''FæW"ÖvW&ÆF–æW2"ÒÀ¢Ó°¢6öç7B&VÆFVE&÷w2Ò—5'FæW$ÖöFP¢ò°¢²%6V†öÆÒ"Â$F÷vçF÷vâF—7G&–7B6öçFW‡B"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢''FæW""ÂF#¢&Ö"ÂF—7G&–7C¢%6V†öÆÒ"ÂVçF—G”–C¢""Ò•ÒÀ¢²$6×–vç2"Â%&÷W'G’6×–vç2&÷VæBæV&'’7F—f—G’"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢''FæW""ÂF#¢&6×–vç2"ÂVçF—G”–C¢""Ò•ÒÀ¢²%&W÷'G2"Â%v†B6†ævVB&÷VæBF†—2&V"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢''FæW""ÂF#¢'&W÷'G2"ÂVçF—G”–C¢""Ò•ÒÀ¢Ð¢¢°¢²%6V†öÆÒ"Â$F÷vçF÷vâF—7G&–7B6öçFW‡B"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢'&W6–FVçB"ÂF#¢&Ö"ÂF—7G&–7C¢%6V†öÆÒ"ÂVçF—G”–C¢""Ò•ÒÀ¢²%W&·2æV&'’"Â$öffW'2&W6–FVçG26âW6RæV&'’"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢'&W6–FVçB"ÂF#¢'W&·2"Âf–ÇFW#¢%W&·2"ÂVçF—G”–C¢""Ò•ÒÀ¢²$WfVçG2æV&'’"Â%Æç2æBWfVçG26Æ÷6R'’"Â‚’Óâöå&÷WFSòâ‡²ÖöFS¢'&W6–FVçB"ÂF#¢&WfVçG2"ÂVçF—G”–C¢""Ò•ÒÀ¢Ó° ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’ÖG&vW""&öÆSÒ&Fö7VÖVçB#à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö†æFÆR"&–Ö†–FFVãÒ'G'VR"óà ¢Æf–wW&R6Æ74æÖSÒ&GÖVçF—G’Ö†W&òGÖVçF—G’Ö†W&òÖ–ÖvR#à¢Æ–Öp¢7&3×·&W6öÇfTÖ–ÖvR‡²–C¢'F†RÖ–æFWVæFVçB"ÂæÖS¢%F†R–æFWVæFVçB"ÂG—S¢'&÷W'G’"ÒÂ&G&vW$†VFW""—Ð¢ÇCÒ%F†R–æFWVæFVçB ¢ÆöF–æsÒ&Æ§’ ¢FV6öF–æsÒ&7–æ2 ¢óà¢Âöf–wW&Sà ¢Æ†VFW"6Æ74æÖSÒ&GÖVçF—G’×7VÖÖ'’#à¢Ç6Æ74æÖSÒ&GÖVçF—G’ÖÖWF#å&÷W'G’+r6V†öÆÓÂ÷à¢Æƒ#åF†R–æFWVæFVçCÂöƒ#à¢Çä6V†öÆÒ&W6–FVçF–ÂF÷vW"6öææV7FVBFòF÷vçF÷vâF–æ–ærÂWfVçG2ÂÆ¶R66W72ÂæBWfW'–F’æV–v†&÷&†ööB&÷WF–æW2ãÂ÷à¢Âö†VFW#à ¢¶—5'FæW$ÖöFRò€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ×&÷r"&–ÖÆ&VÃÒ%'FæW"7F–öç2#à¢ÄÆ–æ²Fó×¶6×–vå&÷WFR‡Æ6R—Ò6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’#ä7&VFR&÷W'G’6×–vãÂôÆ–æ³à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×²‚’Óâöäf–ÇFW#òâ‚$7F—f—G’"—Óåf–WræV&'’7F—f—G“Âö'WGFöãà¢ÄÆ–æ²Fó×¶vWE'FæW$F6†&ö&E&÷WFR‡Æ6R—Ò6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#ä÷VâF6†&ö&CÂôÆ–æ³à¢ÂöF—cà¢’¢€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ×&÷r"&–ÖÆ&VÃÒ%&W6–FVçB7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’"öä6Æ–6³×²‚’Óâöäf–ÇFW#òâ‚%W&·2"—ÓåW&·2æV&'“Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6†÷t6&GÓå6†÷r6&CÂö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡Æ6R—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#ävWBF—&V7F–öç3Âöà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6fWÓç¶—56fVBò%6fVB"¢%6fR'ÓÂö'WGFöãà¢ÂöF—cà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3åv‡’—BÖGFW'3Âöƒ3à¢¶—5'FæW$ÖöFRò€¢Çå&W6–FVçG2æV&'’&R6f–ærF–ææW"Âf—FæW72ÂæBWfVçBÆç2&÷VæB6V†öÆÒâF†—2&÷W'G’—27G&öæræ6†÷"f÷"æV–v†&÷&†ööBÖ&6VB6×–vç2ãÂ÷à¢’¢€¢Ãà¢ÇåV÷ÆRFòæ÷B6†ö÷6R'V–ÆF–æröæÇ’&V6W6RöbF†RVæ—BâF†RæV–v†&÷&†ööB&÷VæB—B&V6öÖW2'BöbF†RfÇVRãÂ÷à¢Çäg&öÒF†R–æFWVæFVçBÂ&W6–FVçG26âÖ÷fRV6–Ç’&WGvVVâ6V†öÆÒÂF†RÆ¶RÂ6öffVRÂF–ææW"Âf—FæW72ÂæBF÷vçF÷vâWfVçG2v—F†÷WBGW&æ–ærWfW'’Æâ–çFò&ö¦V7BãÂ÷à¢Âóà¢—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ç¶—5'FæW$ÖöFRò%'FæW"÷÷'GVæ—G’"¢%&W6–FVçB&VæVf—B'ÓÂöƒ3à¢Çà¢¶—5'FæW$ÖöFP¢ò$vööBf÷"&V6†–ær&W6–FVçG2v†VâF†W’&RÇ&VG’6†ö÷6–ærF–ææW"Âf—FæW72Â6öffVRÂ÷"vÆ¶&ÆRÆâæV&'’â ¢¢$F÷vçF÷vâW&·2†VÇ2&W6–FVçG2f–æBæV&'’öffW'2ÂWfVçG2ÂF–æ–ærÂvVÆÆæW72Â&WF–ÂÂæB6W'f–6W2g&öÒF†RÆ6W2F†W’Ç&VG’Ö÷fRF‡&÷Vv‚â'Ð¢Â÷à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×FW‡B×&–Â"&–ÖÆ&VÃ×¶—5'FæW$ÖöFRò%v—2Fò&V6‚V÷ÆRæV&'’"¢%&W6–FVçB&VæVf—BW†×ÆW2'Óà¢µ²$F–æ–æræV&'’"Â$f—FæW72æV&'’"Â$Æ¶R66W72"Â%&WF–ÂöffW'2"Â%vVV¶VæBÆç2%ÒæÖ‚†—FVÒ’Óâ€¢Ç7â¶W“×¶—FV×Óç¶—FV×ÓÂ÷7ãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3äæV&'“Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶æV&'•&÷w2æÖ‚‡&÷r’Óâ€¢Æ'WGFöâ¶W“×·&÷rçF—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×&÷r"öä6Æ–6³×²‚’Óâ÷Vå&VÆFVDVçF—G’‡&÷r—Óà¢Ç7ãà¢Ç7G&öæsç·&÷rçF—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç·&÷ræ6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢²—5'FæW$ÖöFRbb'FæW$æWGv÷&µW&·2æÆVæwF‚âbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâGÖ'V–ÆF–ærÖæWGv÷&²×W&·2×6V7F–öâ#à¢Æƒ3å'FæW"æWGv÷&²W&·3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&·5õ÷&–Â"&–ÖÆ&VÃÒ%F†R–æFWVæFVçB'FæW"æWGv÷&²W&·2#à¢·'FæW$æWGv÷&µW&·2æÖ‚‡²6æF–FFRÂF—7Fæ6TÆ&VÂÂW&²Ò’Óâ°¢6öç7BF—FÆRÒvWDW‡Æ–6—EW&µF—FÆR†6æF–FFR’ÇÂf÷&ÖE&W6–FVçEW&´†VF–ær‡W&³òæöffW"ÇÂW&³òçF—FÆRÇÂ%&W6–FVçBW&²"“°¢6öç7BÖWFÒ¶F—7Fæ6TÆ&VÂÂvWDæV&'”¶–æDÆ&VÂ†6æF–FFRÂvWDFW7F–æF–öä¶–æB†6æF–FFR’•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&â€¢Æ'WGFöâ¶W“×¶6æF–FFRæ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&B"F—6&ÆVC×´&ööÆVâ†6æF–FFRç&sòææWGv÷&´fÆÆ&6²—Òöä6Æ–6³×²‚’Óâ°¢–b‚6æF–FFRç&sòææWGv÷&´fÆÆ&6²’öå6VÆV7B†6æF–FFR“°¢×Óà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&Eõ÷F—FÆR#ç¶6æF–FFRææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõööffW"#ç·F—FÆWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõöÖWF#ç¶ÖWFÓÂ÷7ãà¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3å&VÆFVCÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢·&VÆFVE&÷w2æÖ‚…·F—FÆRÂ6÷’Â7F–öåÒ’Óâ€¢Æ'WGFöâ¶W“×·F—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×&÷r"öä6Æ–6³×¶7F–öçÓà¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâF†U6†÷&U&W6–FVçF–ÄVçF—G”G&vW"‡°¢Æ6RÀ¢ÖöFRÀ¢Æ6W2À¢6fVD–G2À¢vVçDf÷&Õ7V&Ö—GFVBÀ¢öå6VÆV7BÀ¢öå6fRÀ¢öå6†÷t6&BÀ¢öä6öçF7BÀ¢öå7V&Ö—D6öçF7BÀ¢öäW‡Æ÷&RÀ¢öä÷Vå&÷WFRÀ§Ò’°¢6öç7B'V–ÆF–ærÒF†U6†÷&U&W6–FVçF–Ä'V–ÆF–æs°¢6öç7B—5'FæW$ÖöFRÒÖöFRÓÓÒ''FæW"#°¢6öç7B—56fVBÒ6fVD–G3òæ†3òâ‡Æ6Ræ–B“°¢6öç7B6öçF7Df÷&Ô–BÒ6†÷&RÖ6öçF7BÖf÷&ÒÒG·Æ6Ræ–GÖ°¢6öç7Bf–Æ&ÆT†öÖW4–BÒ'6†÷&RÖf–Æ&ÆRÖ†öÖW2#°¢6öç7B'FæW$æWGv÷&µW&·2ÒvWD'V–ÆF–æu'FæW$æWGv÷&µW&·2‡Æ6RÂÆ6W2ÂR“°¢6öç7B&W6–FVçD‡V"ÒÆ6Rç&W6–FVçD‡V"ÇÂÆ6Rç&sòç&W6–FVçD‡V"ÇÂçVÆÃ°¢6öç7BW‡W&–Væ6T'V–ÆF–ærÒW6TÖVÖò‚‚’Óâ‡°¢ââæ'V–ÆF–ærÀ¢ââçÆ6RÀ¢–C¢Æ6Ræ–BÀ¢æÖS¢'V–ÆF–ærææÖRÀ¢÷fW'f–Ws¢'V–ÆF–æræ÷fW'f–WrÀ¢&W6–FVçD÷fW'f–Ws¢'V–ÆF–æræ÷fW'f–WrÀ¢&W6–FVçE&÷WF–æW3¢'V–ÆF–ærææV&'’æÖ‚…·F—FÆRÂ6÷•Ò’ÓâG·F—FÆWÓ¢G¶6÷—Ö’À¢Ò’Â¶'V–ÆF–ærÂÆ6UÒ“°¢6öç7B'V–ÆF–ætW‡W&–Væ6RÒW6TÖVÖò€¢‚’Óâ7&VFT'V–ÆF–ætW‡W&–Væ6R†W‡W&–Væ6T'V–ÆF–ærÂ²Æ6W2Â&÷WFTFVf–æ—F–öç3¢Ö6öÆÆV7F–öç2Ò’À¢¶W‡W&–Væ6T'V–ÆF–ærÂÆ6W5ÒÀ¢“°¢6öç7Bf–æD'”æÖRÒ†æÖR’Óâ°¢6öç7BF&vWBÒ7G&–ær†æÖRÇÂ""’çFôÆ÷vW$66R‚“°¢&WGW&â&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ†æÖRÂÆ6W2¢ÇÂÆ6W2æf–æB‚†6æF–FFR’Óâ7G&–ær†6æF–FFSòææÖRÇÂ""’çFôÆ÷vW$66R‚’ÓÓÒF&vWB¢ÇÂÆ6W2æf–æB‚†6æF–FFR’Óâ7G&–ær†6æF–FFSòææÖRÇÂ""’çFôÆ÷vW$66R‚’æ–æ6ÇVFW2‡F&vWB’“°¢Ó°¢6öç7B÷Vå&VÆFVDVçF—G’Ò‡F—FÆR’Óâ°¢6öç7BÖF6‚Òf–æD'”æÖR‡F—FÆR“°¢–b†ÖF6‚’öå6VÆV7B†ÖF6‚“°¢Ó°¢6öç7Bf–Wtf–Æ&ÆT†öÖW2Ò‚’Óâ°¢Fö7VÖVçBævWDVÆVÖVçD'”–B†f–Æ&ÆT†öÖW4–B“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢'7F'B"Ò“°¢Ó°¢6öç7B÷Vä6öçF7BÒ‚’Óâ°¢öä6öçF7B‚“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢Fö7VÖVçBævWDVÆVÖVçD'”–B†6öçF7Df÷&Ô–B“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&VæB"Ò“°¢ÒÂ#“°¢Ó°¢6öç7B'FæW%6æ6†÷BÒ°¢²$FG&W72"ÂG¶'V–ÆF–æræFG&W77ÒÂG¶'V–ÆF–æræ6—G—ÖÒÀ¢²$F—7G&–7B"Â'V–ÆF–æræF—7G&–7EÒÀ¢²$f–Æ&ÆR†öÖW2"Â7G&–ær†'V–ÆF–æræf–Æ&ÆT†öÖW2æÆVæwF‚•ÒÀ¢²$æV&'’Æ6W2"Â%&–æW’ÂÆG’&—&BÆ¶RÂ†÷FVÂfâ¦æGB%ÒÀ¢Ó°¢6öç7B'FæW$W‡W&–Væ6U&÷w2Ò°¢²%&W6–FVçBwV–FR"Â%6†÷rF–æ–ærÂÆ—fR×W6–2ÂG&–Â66W72Â†÷FVÂfâ¦æGBÂæBWfW'–F’7F÷2&÷VæBF†R6†÷&Râ%ÒÀ¢²%&W6–FVçB6×–vâ"Â$7&VFR6–×ÆRvVÆ6öÖR&÷WFRf÷"V÷ÆRÆ—f–ærBF†R6†÷&RæBÖ÷f–ærF‡&÷Vv‚&–æW’â%ÒÀ¢²%"66W72"Â$÷VâF†—2Öf–Wrg&öÒÆö&'’ÖFW&–Ç2Â&W6–FVçBVÖ–ÂÂÆV6–ærföÆÆ÷r×WÂ÷"&–çFVBwV–FW2â%ÒÀ¢²%&W÷'F–ær"Â%G&6²6fW2ÂF—&V7F–öç2Â"66ç2Â6×–vâ÷Vç2ÂæB6öçF7B&WVW7G2F–VBFòF†—2Æö6F–öââ%ÒÀ¢Ó°¢6öç7B'FæW%v÷&·76U&÷w2Ò°¢²$ÖÆ—7F–ær"Â%F†R6†÷&RV'22&W6–FVçF–Â&÷W'G’–âF†R&–æW’ÖÆ–W"â%ÒÀ¢²$æV&'’wV–FR"Â%&W6–FVçG26âÖ÷fRg&öÒF†R'V–ÆF–ærFòF–æ–ærÂ×W6–2ÂG&–Â66W72ÂæBF÷vçF÷vâ6W'f–6W2â%ÒÀ¢²$6×–vâFööÇ2"Â$7&VFR&W6–FVçBÆVæ6‚Â"F‚Â÷"æV&'’wV–FRg&öÒF†R'FæW"v÷&·76Râ%ÒÀ¢²%&W÷'Bf–Wr"Â%&Wf–WrÖ7F—f—G’Â6fVBÆ6W2ÂF—&V7F–öç2Â66ç2ÂæB6×–vâVævvVÖVçBâ%ÒÀ¢Ó° ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’ÖG&vW"G×6†÷&R×&W6–FVçF–ÂÖG&vW""&öÆSÒ&Fö7VÖVçB"FF×6†÷&RÖÖöFS×¶—5'FæW$ÖöFRò''FæW""¢'&W6–FVçB'Óà¢Æf–wW&R6Æ74æÖSÒ&GÖVçF—G’Ö†W&òGÖVçF—G’Ö†W&òÖ–ÖvR#à¢Æ–Öp¢7&3×¶'V–ÆF–æræ†W&ô–ÖvWÐ¢ÇCÒ%F†R6†÷&R&W6–FVçF–Â'V–ÆF–æræV"ÆG’&—&BÆ¶R ¢ÆöF–æsÒ&Æ§’ ¢FV6öF–æsÒ&7–æ2 ¢öäW'&÷#×¶†æFÆUæVÄ–ÖvTW'&÷'Ð¢óà¢Âöf–wW&Sà ¢Æ†VFW"6Æ74æÖSÒ&GÖVçF—G’×7VÖÖ'’#à¢Ç6Æ74æÖSÒ&GÖVçF—G’ÖÖWF#å&W6–FVçF–Â&÷W'G’+r&–æW’+rF÷vçF÷vâW7F–ãÂ÷à¢Æƒ#ç¶'V–ÆF–ærææÖWÓÂöƒ#à¢Çç¶—5'FæW$ÖöFRò'V–ÆF–ærç'FæW"ç7V&†VFÆ–æR¢'V–ÆF–ærç7V&†VFÆ–æWÓÂ÷à¢Âö†VFW#à ¢¶—5'FæW$ÖöFRò€¢Ãà¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ×&÷rG×6†÷&R×'FæW"Ö7F–öç2"&–ÖÆ&VÃÒ%F†R6†÷&R'FæW"7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’"öä6Æ–6³×²‚’Óâ÷Vå&VÆFVDVçF—G’‚$†÷FVÂfâ¦æGB"—Óåf–WræV&'’Æ6W3Âö'WGFöãà¢ÄÆ–æ²Fó×¶6×–vå&÷WFR‡Æ6R—Ò6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#ä7&VFR6×–vãÂôÆ–æ³à¢ÄÆ–æ²FóÒ"öÖöÖöFS×'FæW"gF#×&W÷'G2"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#ä÷Vâ&W÷'CÂôÆ–æ³à¢ÂöF—cà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"ÖÆVB#à¢Ç7â6Æ74æÖSÒ&G×6†÷&R×'FæW"Ö¶–6¶W"#åF†R6†÷&SÂ÷7ãà¢Æƒ3ä&–æW’&W6–FVçF–ÂFG&W726öææV7FVBFòF÷vçF÷vâ&÷WF–æW2ãÂöƒ3à¢Çà¢F†R6†÷&R6—G2&WGvVVâÆG’&—&BÆ¶RÂ&–æW’7G&VWBÂ†÷FVÂfâ¦æGBÂæBF†RF÷vçF÷vâ6÷&Rà¢F†—2æVÂ'&–æw2F†R'V–ÆF–ærÂæV&'’Æ6W2Â&W6–FVçB&÷WFW2Â6×–vç2ÂæB&W÷'F–ær–çFòöæRÖf–Wrà¢Â÷à¢Ç6Æ74æÖSÒ&G×6†÷&R×'FæW"×7FGW6Æ–æR#å&W6–FVçG26âW6RF†—2f–WrFòVæFW'7FæBv†B—2æV&'’â'FæW'26âW6R—BFòV&Æ—6‚Â&÷WFRÂæBÖV7W&RF†RæV–v†&÷&†ööBW‡W&–Væ6RãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"×6æ6†÷B#à¢Æƒ3ä'V–ÆF–ær6æ6†÷CÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢·'FæW%6æ6†÷BæÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"Ö6öçFW‡B#à¢Æƒ3å&W6–FVçB6öçFW‡CÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–ærç'FæW"æ–ç6–v‡G2æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"ÖæW‡B#à¢Æƒ3å&W6–FVçBW‡W&–Væ6SÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢·'FæW$W‡W&–Væ6U&÷w2æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"Ö6öçFW‡B#à¢Æƒ3äæV&'’Æ6W3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–ærææV&'’ç6Æ–6RƒÂb’æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢Æ'WGFöâ¶W“×·F—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×&÷r"öä6Æ–6³×²‚’Óâ÷Vå&VÆFVDVçF—G’‡F—FÆR—Óà¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâG×6†÷&R×'FæW"×&VF–æW72#à¢Æƒ3åv÷&·76R7F–öç3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢·'FæW%v÷&·76U&÷w2æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&G×6†÷&R×6÷W&6RÖ7F–öç2#à¢Æ6Æ74æÖSÒ&G×FW‡BÖ7F–öâ"‡&VcÒ&‡GG3¢òöW7F–âçF÷vW'2ææWBö6öæF÷2÷6†÷&Rò"F&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W"#åf–Wr'V–ÆF–ær6÷W&6SÂöà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×FW‡BÖ7F–öâ"öä6Æ–6³×¶öå6fWÓç¶—56fVBò%6fVBFòv÷&·76R"¢%6fRFòv÷&·76R'ÓÂö'WGFöãà¢Æ6Æ74æÖSÒ&G×FW‡BÖ7F–öâ"‡&Vc×¶F—&V7F–öç5W&Â‡Æ6R—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W"#ä÷VâF—&V7F–öç3Âöà¢ÂöF—cà¢Â÷6V7F–öãà¢Âóà¢’¢€¢Ãà¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ×&÷r"&–ÖÆ&VÃÒ%F†R6†÷&R&W6–FVçF–Â7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’"öä6Æ–6³×¶öå6†÷t6&GÓå&VFVVÒW&³Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6†÷t6&GÓå6†÷r#Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡Æ6R—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#äF—&V7F–öç3Âöà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6fWÓç¶—56fVBò%6fVB"¢%6fR'ÓÂö'WGFöãà¢ÂöF—cà ¢·&W6–FVçD‡V"bb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ"&–ÖÆ&VÃ×¶G¶'V–ÆF–ærææÖWÒæV–v†&÷&†ööB66W76Óà¢Æƒ3äæV&'’æ÷sÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖ'V–ÆF–ærÖ‡V"×7VÖÖ'’#à¢ÆF—cãÇ7G&öæsç·&W6–FVçD‡V"æ7F—fUW&·7ÓÂ÷7G&öæsãÇ7ãæ7F—fRW&·3Â÷7ããÂöF—cà¢ÆF—cãÇ7G&öæsç·&W6–FVçD‡V"æ†”†÷W'7ÓÂ÷7G&öæsãÇ7ãæ†’†÷W'3Â÷7ããÂöF—cà¢ÆF—cãÇ7G&öæsç·&W6–FVçD‡V"æWfVçG5Föæ–v‡GÓÂ÷7G&öæsãÇ7ãæWfVçG2Föæ–v‡CÂ÷7ããÂöF—cà¢ÆF—cãÇ7G&öæsç·&W6–FVçD‡V"æÖVæ—G•&öw&×3òæÆVæwF‚ÇÂÓÂ÷7G&öæsãÇ7ãæÖVæ—G’G—W3Â÷7ããÂöF—cà¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ä÷fW'f–WsÂöƒ3à¢Çç¶'V–ÆF–æræ÷fW'f–WwÓÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ä'V–ÆF–ær6æ6†÷CÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–ærç6æ6†÷BæÖ‚…¶Æ&VÂÂfÇVUÒ’Óâ€¢ÆF—b¶W“×¶Æ&VÇÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç¶Æ&VÇÓÂ÷7G&öæsà¢Ç6ÖÆÃç·fÇVWÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ–C×¶f–Æ&ÆT†öÖW4–GÒ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3äf–Æ&ÆR†öÖW3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&G×6†÷&RÖ†öÖR×&–Â"&–ÖÆ&VÃÒ%F†R6†÷&Rf–Æ&ÆR†öÖW2#à¢¶'V–ÆF–æræf–Æ&ÆT†öÖW2æÖ‚††öÖR’Óâ€¢Æ'F–6ÆR¶W“×¶†öÖRæ–GÒ6Æ74æÖSÒ&G×6†÷&RÖ†öÖRÖ6&B#à¢Æ–Ör7&3×¶†öÖRæ–ÖvWÒÇC×¶G¶†öÖRæFG&W77ÒÆ—7F–ævÒÆöF–æsÒ&Æ§’"FV6öF–æsÒ&7–æ2"óà¢ÆF—b6Æ74æÖSÒ&G×6†÷&RÖ†öÖRÖ6÷’#à¢ÆF—b6Æ74æÖSÒ&G×6†÷&RÖ†öÖRÖ†VF–ær#à¢Ç7G&öæsç¶†öÖRæFG&W77ÓÂ÷7G&öæsà¢¶†öÖRæ&FvRbbÇ7ãç¶†öÖRæ&FvWÓÂ÷7ãçÐ¢ÂöF—cà¢Çç¶†öÖRç&–6WÓÂ÷à¢Ç6ÖÆÃç¶†öÖRæ&VG7Ò&B+r¶†öÖRæ&F‡7Ò&+r¶†öÖRç7gGÒ7gB+r¶†öÖRç7FGW7ÓÂ÷6ÖÆÃà¢ÆVÓç¶†öÖRæFW67&—F–öçÓÂöVÓà¢ÂöF—cà¢Âö'F–6ÆSà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3åv‡’&W6–FVçG26†ö÷6RF†R6†÷&SÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–ærç&W6–FVçE&V6öç2æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3äæV&'“Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–ærææV&'’æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢Æ'WGFöâ¶W“×·F—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×&÷r"öä6Æ–6³×²‚’Óâ÷Vå&VÆFVDVçF—G’‡F—FÆR—Óà¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢·'FæW$æWGv÷&µW&·2æÆVæwF‚âbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâGÖ'V–ÆF–ærÖæWGv÷&²×W&·2×6V7F–öâ#à¢Æƒ3å'FæW"æWGv÷&²W&·3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&·5õ÷&–Â"&–ÖÆ&VÃ×¶G¶'V–ÆF–ærææÖWÒ'FæW"æWGv÷&²W&·6Óà¢·'FæW$æWGv÷&µW&·2æÖ‚‡²6æF–FFRÂF—7Fæ6TÆ&VÂÂW&²Ò’Óâ°¢6öç7BF—FÆRÒvWDW‡Æ–6—EW&µF—FÆR†6æF–FFR’ÇÂf÷&ÖE&W6–FVçEW&´†VF–ær‡W&³òæöffW"ÇÂW&³òçF—FÆRÇÂ%&W6–FVçBW&²"“°¢6öç7BÖWFÒ¶F—7Fæ6TÆ&VÂÂvWDæV&'”¶–æDÆ&VÂ†6æF–FFRÂvWDFW7F–æF–öä¶–æB†6æF–FFR’•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&â€¢Æ'WGFöâ¶W“×¶6æF–FFRæ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&B"F—6&ÆVC×´&ööÆVâ†6æF–FFRç&sòææWGv÷&´fÆÆ&6²—Òöä6Æ–6³×²‚’Óâ°¢–b‚6æF–FFRç&sòææWGv÷&´fÆÆ&6²’öå6VÆV7B†6æF–FFR“°¢×Óà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&Eõ÷F—FÆR#ç¶6æF–FFRææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõööffW"#ç·F—FÆWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõöÖWF#ç¶ÖWFÓÂ÷7ãà¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ç¶'V–ÆF–æræ7Fæ†VFÆ–æWÓÂöƒ3à¢Çç¶'V–ÆF–æræ7Fæ&öG—ÓÂ÷à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’Ö–æÆ–æRÖÆ–æ·2#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·f–Wtf–Æ&ÆT†öÖW7Óç¶'V–ÆF–æræ7Fç&–Ö'—ÓÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶÷Vä6öçF7GÒ&–Ö6öçG&öÇ3×¶6öçF7Df÷&Ô–GÓç¶'V–ÆF–æræ7Fç6V6öæF'—ÓÂö'WGFöãà¢ÂöF—cà¢Ç6Æ74æÖSÒ&G×6†÷&RÖF—66Æ–ÖW"#ç¶'V–ÆF–æræ7Fæfö÷FW'ÓÂ÷à¢Â÷6V7F–öãà ¢Æf÷&Ð¢–C×¶6öçF7Df÷&Ô–GÐ¢6Æ74æÖSÒ&GÖ6öçF7BÖ6öçF–çVF–öâG×6†÷&RÖ6öçF7BÖf÷&Ò ¢öå7V&Ö—C×²†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢öå7V&Ö—D6öçF7B‚“°¢×Ð¢à¢ÆF—cà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²4$dCdÒ#ä–çFW&W7FVCóÂöF—cà¢Æƒ26Æ74æÖSÒ&×BÓFW‡BÕ³g…ÒföçB×6VÖ–&öÆBFW‡BÕ²3#c35Ò#ä6öçF7BÆ—7F–ærvVçCÂöƒ3à¢ÂöF—cà¢¶vVçDf÷&Õ7V&Ö—GFVBò€¢Ç6Æ74æÖSÒ&×BÓBFW‡BÕ³7…ÒÆVF–ærÓRFW‡BÕ²3#c35Òós#å6VçBâF†R&WVW7B—2&VG’v—F‚F†R6†÷&RGF6†VBãÂ÷à¢’¢€¢Ãà¢ÆF—b6Æ74æÖSÒ&×BÓ2w&–BvÓ"6Ó¦w&–BÖ6öÇ2Ó"#à¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢æÖP¢Æ–çWB&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós"Æ6V†öÆFW#Ò%–÷W"æÖR"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢VÖ–À¢Æ–çWB&WV—&VBG—SÒ&VÖ–Â"6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós"Æ6V†öÆFW#Ò'–÷TW†×ÆRæ6öÒ"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢†öæP¢Æ–çWB&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós"Æ6V†öÆFW#Ò%†öæRçVÖ&W""óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢F–ÖVÆ–æP¢Ç6VÆV7B&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós#à¢Æ÷F–öãä4Âö÷F–öãà¢Æ÷F–öãã3ÓcF—3Âö÷F–öãà¢Æ÷F–öããcÓ“F—3Âö÷F–öãà¢Æ÷F–öãä§W7BW‡Æ÷&–æsÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÂöF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&×BÓ"w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢æ÷FW0¢ÇFW‡F&VæÖSÒ&ÖW76vR"6Æ74æÖSÒ&Ö–âÖ‚Ó#G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2’Ó"FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós"FVfVÇEfÇVSÒ$’v÷VÆBÆ–¶RÖ÷&R–æf÷&ÖF–öâ&÷WBf–Æ&ÆR†öÖW2BF†R6†÷&Râ"óà¢ÂöÆ&VÃà¢Æ'WGFöâG—SÒ'7V&Ö—B"6Æ74æÖSÒ&G×æVÂÖ7F–öâ×FW‡B×BÓR–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓãR#à¢7V&Ö—B–çFW&W7@¢Å6VæB6Æ74æÖSÒ&‚Ó2ãRrÓ2ãRFW‡BÕ²4$dCdÒ"óà¢Âö'WGFöãà¢Âóà¢—Ð¢Âöf÷&Óà¢Âóà¢—Ð¢Ä'V–ÆF–ætW‡W&–Væ6TÖöGVÆR'V–ÆF–æs×¶W‡W&–Væ6T'V–ÆF–æwÒW‡W&–Væ6S×¶'V–ÆF–ætW‡W&–Væ6WÒÖöFS×¶ÖöFWÒöå6VÆV7C×¶öå6VÆV7GÒöäW‡Æ÷&S×¶öäW‡Æ÷&WÒöä÷Vå&÷WFS×¶öä÷Vå&÷WFWÒóà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâvWDÆVvVæG47F—fTÆ—7F–æu&÷w2‡Æ6RÂ&öf–ÆR’°¢6öç7B&VçFÂÒÆ6Sòç&VçFÄÆ—7F–ærÇÂÆ6Sòç&sòç&VçFÄÆ—7F–ærÇÂçVÆÃ°¢6öç7BÆVvVæG4Æ—7F–ærÒvWE&W6öÇfVDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7BÇW‡W'”'V–ÆF–ærÒvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡Æ6R“°¢6öç7B'V–ÆF–ætÆ—7F–æw2Ò'&’æ—4'&’†ÇW‡W'”'V–ÆF–æsòæÆ—7F–æw2’òÇW‡W'”'V–ÆF–æræÆ—7F–æw2¢µÓ° ¢–b‡&VçFÂ’°¢6öç7Bf7G2Ò°¢&VçFÂç&–6TÆ&VÂÀ¢&VçFÂæ&VG2òG·&VçFÂæ&VG7Ò&F¢""À¢&VçFÂæ&F‡2òG·&VçFÂæ&F‡7Ò&¢""À¢&VçFÂç7gBòG´çVÖ&W"‡&VçFÂç7gB’çFôÆö6ÆU7G&–ær‚—Ò7gF¢""À¢&VçFÂæÖÇ2òÔÅ2G·&VçFÂæÖÇ7Ö¢""À¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&âµ¶G·&VçFÂæ'V–ÆF–æwÒ2G·&VçFÂçVæ—GÖÂf7G2ÇÂ$7F—fR&VçFÂf–Æ&–Æ—G’%ÕÓ°¢Ð ¢–b†ÆVvVæG4Æ—7F–ær’°¢6öç7Bf7G2Ò°¢ÆVvVæG4Æ—7F–ærç&–6TF—7Æ’À¢ÆVvVæG4Æ—7F–æræ&VG2òG¶ÆVvVæG4Æ—7F–æræ&VG7Ò&F¢""À¢ÆVvVæG4Æ—7F–æræ&F‡2òG¶ÆVvVæG4Æ—7F–æræ&F‡7Ò&¢""À¢ÆVvVæG4Æ—7F–ærç7gDF—7Æ’À¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&âµ¶ÆVvVæG4Æ—7F–æræFG&W72ÇÂ&öf–ÆRæ'V–ÆF–ætæÖRÂf7G2ÇÂ$7F—fRÆ—7F–ær%ÕÓ°¢Ð ¢–b†'V–ÆF–ætÆ—7F–æw2æÆVæwF‚’°¢&WGW&â'V–ÆF–ætÆ—7F–æw2ç6Æ–6RƒÂ2’æÖ‚†Æ—7F–ær’Óâ°¢Æ—7F–æræFG&W72ÇÂÆ—7F–ærçVæ—BÇÂ&öf–ÆRæ'V–ÆF–ætæÖRÀ¢°¢Æ—7F–ærç&–6TF—7Æ’ÇÂÆ—7F–ærç&–6TÆ&VÂÇÂÆ—7F–ærç&–6RÀ¢Æ—7F–æræ&VG2òG¶Æ—7F–æræ&VG7Ò&F¢""À¢Æ—7F–æræ&F‡2òG¶Æ—7F–æræ&F‡7Ò&¢""À¢Æ—7F–ærç7gDF—7Æ’ÇÂ†Æ—7F–ærç7gBòG´çVÖ&W"†Æ—7F–ærç7gB’çFôÆö6ÆU7G&–ær‚—Ò7gF¢""’À¢Æ—7F–æræÖÇ4çVÖ&W"ÇÂÆ—7F–æræÖÇ5öçVÖ&W"òÔÅ2G¶Æ—7F–æræÖÇ4çVÖ&W"ÇÂÆ—7F–æræÖÇ5öçVÖ&W'Ö¢""À¢Æ—7F–ærç7FGW2À¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"’ÇÂ$Æ—7F–ærFWF–Âf–Æ&ÆR"À¢Ò“°¢Ð ¢&WGW&â‡&öf–ÆRæ7F—fTÆ—7F–æw2ÇÂµÒ’ç6Æ–6RƒÂ2’æÖ‚†—FVÒ’Óâ¶—FVÒÂ$f–Æ&–Æ—G’6†ævW2V–6¶Ç’%Ò“°§Ð ¦gVæ7F–öâvWDÆVvVæG4–çV—'”Æ—7F–ær‡Æ6RÂ&öf–ÆR’°¢6öç7B&VçFÂÒÆ6Sòç&VçFÄÆ—7F–ærÇÂÆ6Sòç&sòç&VçFÄÆ—7F–ærÇÂçVÆÃ°¢6öç7BÆVvVæG4Æ—7F–ærÒvWE&W6öÇfVDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7BÇW‡W'”'V–ÆF–ærÒvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡Æ6R“°¢6öç7Bf—'7D'V–ÆF–ætÆ—7F–ærÒ'&’æ—4'&’†ÇW‡W'”'V–ÆF–æsòæÆ—7F–æw2’òÇW‡W'”'V–ÆF–æræÆ—7F–æw5³Ò¢çVÆÃ°¢6öç7B6÷W&6RÒÆVvVæG4Æ—7F–ærÇÂ&VçFÂÇÂf—'7D'V–ÆF–ætÆ—7F–ærÇÂ·Ó°¢6öç7BFG&W72Ò6÷W&6RæFG&W72ÇÂ&VçFÃòæFG&W72ÇÂ&öf–ÆSòæ'V–ÆF–ætæÖRÇÂÆ6SòæFG&W72ÇÂÆ6SòææÖRÇÂ$F÷vçF÷vâW7F–â#°¢6öç7B6—G’Ò6÷W&6Ræ6—G’ÇÂ$W7F–â#°¢6öç7B7FFRÒ6÷W&6Rç7FFRÇÂ%E‚#°¢6öç7B¦—Ò6÷W&6Rç¦—ÇÂ6÷W&6Rç÷7FÄ6öFRÇÂ#sƒs#° ¢&WGW&â°¢–C¢6÷W&6Ræ–BÇÂ6÷W&6RæÆ—7F–æt–BÇÂ6÷W&6RæVçF—G”–BÇÂÆ6Sòæ–BÇÂ""À¢æÖS¢6÷W&6RææÖRÇÂ6÷W&6RçF—FÆRÇÂ6÷W&6Ræ'V–ÆF–ætæÖRÇÂÆ6SòææÖRÇÂÆ6SòçF—FÆRÇÂFG&W72À¢'V–ÆF–ætæÖS¢6÷W&6Ræ'V–ÆF–ætæÖRÇÂ6÷W&6Ræ'V–ÆF–æuöæÖRÇÂ&öf–ÆSòæ'V–ÆF–ætæÖRÇÂÆ6Sòæ'V–ÆF–ætæÖRÇÂÆ6SòææÖRÇÂ""À¢Æ—7F–æuG—S¢6÷W&6RæÆ—7F–æuG—RÇÂ6÷W&6RæÆ—7F–æu÷G—RÇÂ&VçFÃòæÆ—7F–æuG—RÇÂ'6ÆR"À¢Æ—7F–æuG—TÆ&VÃ¢6÷W&6RæÆ—7F–æuG—TÆ&VÂÇÂ6÷W&6RæÆ—7F–æu÷G—UöÆ&VÂÇÂ‡&VçFÂò%&VçFÂ"¢%&W6–FVçF–Â"’À¢FG&W72À¢6—G’À¢7FFRÀ¢¦—À¢&–6S¢6÷W&6Rç&–6RÇÂ6÷W&6Rç&–6TÆ&VÂÇÂ6÷W&6Rç&–6TF—7Æ’ÇÂ&VçFÃòç&–6TÆ&VÂÇÂ""À¢&–6TF—7Æ“¢6÷W&6Rç&–6TF—7Æ’ÇÂ6÷W&6Rç&–6TÆ&VÂÇÂ&VçFÃòç&–6TÆ&VÂÇÂ""À¢&VG3¢6÷W&6Ræ&VG2ÇÂ&VçFÃòæ&VG2ÇÂ""À¢&F‡3¢6÷W&6Ræ&F‡2ÇÂ&VçFÃòæ&F‡2ÇÂ""À¢7gC¢6÷W&6Rç7gBÇÂ&VçFÃòç7gBÇÂ""À¢7gDF—7Æ“¢6÷W&6Rç7gDF—7Æ’ÇÂ‡6÷W&6Rç7gBòG´çVÖ&W"‡6÷W&6Rç7gB’çFôÆö6ÆU7G&–ær‚—Ò7gF¢""’À¢F—4öäÖ&¶WC¢6÷W&6RæF—4öäÖ&¶WBÇÂ""À¢æV–v†&÷&†ööC¢6÷W&6RææV–v†&÷&†ööBÇÂ&öf–ÆSòææV–v†&÷&†ööBÇÂÆ6SòæF—7G&–7BÇÂ$F÷vçF÷vâW7F–â"À¢6÷W&6S¢6÷W&6Rç6÷W&6RÇÂ$F÷vçF÷vâW&·2Ö"À¢6öçF7DVÖ–Ã¢6÷W&6Ræ6öçF7DVÖ–ÂÇÂ6÷W&6Ræ6öçF7EöVÖ–ÂÇÂ&öf–ÆSòæ6öçF7DVÖ–ÂÇÂ&öf–ÆSòæ6öçF7EöVÖ–ÂÇÂÆ6Sòæ6öçF7DVÖ–ÂÇÂÆ6Sòæ6öçF7EöVÖ–ÂÇÂÆ6SòæVÖ–ÂÇÂ""À¢&Vf–ÆÆVDÖW76vS¢’v÷VÆBÆ–¶RÖ÷&R–æf÷&ÖF–öâ&÷WBG¶FG&W77ÒæÀ¢Ó°§Ð ¦gVæ7F–öâÆVvVæG5&W6–FVçF–Ä–çFVÆÆ–vVæ6TG&vW"‡°¢Æ6RÀ¢&öf–ÆRÀ¢ÖöFRÀ¢Æ6W2À¢6fVD–G2À¢öå6VÆV7BÀ¢öå6fRÀ¢öäf–ÇFW"À¢öäW‡Æ÷&RÀ¢öä÷Vå&÷WFRÀ§Ò’°¢6öç7B—5'FæW$ÖöFRÒÖöFRÓÓÒ''FæW"#°¢6öç7B—56fVBÒ6fVD–G3òæ†3òâ‡Æ6Ræ–B“°¢6öç7BÆ—7F–æu&÷w2ÒvWDÆVvVæG47F—fTÆ—7F–æu&÷w2‡Æ6RÂ&öf–ÆR“°¢6öç7B†47F—fTÆ—7F–æw2ÒÆ—7F–æu&÷w2æÆVæwF‚â°¢6öç7BF—&V7DÆVvVæG4Æ—7F–ærÒvWDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7B&W6öÇfVDÆVvVæG4Æ—7F–ærÒvWE&W6öÇfVDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7BÇW‡W'”'V–ÆF–ærÒvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡Æ6R“°¢6öç7B—5&VçFÅæVÂÒ—5&VçFÄVçF—G’‡Æ6R“°¢òòW†7BÆ—7F–ær–FVçF—G’v–ç2÷fW"F†R&VçB'V–ÆF–ærâÆ—7F–ær6â&W6öÇfRFð¢òò&÷F‚ÆVvVæG2†öÖRæB—G2ÇW‡W'’&W6Væ6R'V–ÆF–æs²F†R'V–ÆF–ærÆ–æ²—0¢òò6öçFW‡BÂæ÷BW&Ö—76–öâFò6öÆÆ6RF†RVæ—B–çFò&÷W'G’v÷&·76Rà¢6öç7B—4Æ—7F–æuæVÂÒ&ööÆVâ€¢—5&VçFÅæVÂÇÀ¢F—&V7DÆVvVæG4Æ—7F–ærÇÀ¢—4ÆVvVæG4Æ—7F–ætÆ–¶R‡Æ6R’ÇÀ¢‡&W6öÇfVDÆVvVæG4Æ—7F–ærbb—5&÷W'G”VçF—G’‡Æ6R’¢“°¢6öç7BÆVvVæG4–çV—'”f÷&Ô–BÒÆVvVæG2Ö–çV—'’Öf÷&ÒÒG·Æ6Ræ–GÖ°¢6öç7BÆVvVæG4f–Æ&–Æ—G”–BÒÆVvVæG2Ö7F—fRÖÆ—7F–æw2ÒG·Æ6Ræ–GÖ°¢6öç7B–çV—'”Æ—7F–ærÒvWDÆVvVæG4–çV—'”Æ—7F–ær‡Æ6RÂ&öf–ÆR“°¢6öç7B¶7F—fTæÇ—F–74–ç6–v‡BÂ6WD7F—fTæÇ—F–74–ç6–v‡EÒÒW6U7FFR†ÆVvVæG5&W6–FVçF–ÄæÇ—F–75³Ò“°¢6öç7BæÇ—F–74–ç6–v‡BÒÄTtTäE5ôäÅ•D”55ô”å4”t…Eô4õ•¶7F—fTæÇ—F–74–ç6–v‡EÒÇÂÄTtTäE5ôäÅ•D”55ô”å4”t…Eô4õ•²$'V–ÆF–ærf–Ww2%Ó°¢6öç7BæÇ—F–74w&÷W2Ò°¢²$'V–ÆF–ær"Â°¢²$'V–ÆF–ærf–Ww2"Â$'V–ÆF–ær÷Vç2%ÒÀ¢²$Æ—7F–ærf–Ww2"Â$†öÖR÷Vç2%ÒÀ¢²%6fR&FR"Â%6fW2%ÒÀ¢²%F÷W"&WVW7G2"Â%F÷W"&WVW7G2%ÒÀ¢ÕÒÀ¢²$æV&'’"Â°¢²$æV–v†&÷&†ööB÷Vç2"Â$&V÷Vç2%ÒÀ¢²$æV&'’VçF—G’6Æ–6·2"Â$æV&'’Æ6W2%ÒÀ¢²$6öÆÆV7F–öâ÷Vç2"Â$wV–FR÷Vç2%ÒÀ¢²$6ö×&—6öâ÷Vç2"Â$6ö×&—6öç2%ÒÀ¢ÕÒÀ¢²$F–Ç’Æ–fR"Â°¢²%vÆ¶&–Æ—G’–çFW&W7B"Â%vÆ¶&–Æ—G’%ÒÀ¢²$F–æ–ær–çFW&W7B"Â$fööBæV&'’%ÒÀ¢²%vVÆÆæW72–çFW&W7B"Â%vVÆÆæW72æV&'’%ÒÀ¢²$Æ–fW7G–ÆR&VæVf—BVævvVÖVçB"Â$Ö÷7BW6VgVÂ&VæVf—G2%ÒÀ¢ÕÒÀ¢Ó°¢6öç7B6fUFW‡BÒ‚ââçfÇVW2’Óâ°¢f÷"†6öç7BfÇVRöbfÇVW2’°¢6öç7BFW‡BÒ7G&–ær‡fÇVRóò""’çG&–Ò‚“°¢–b‡FW‡Bbbõâ‡VæFVf–æVGÆçVÆÇÆæçÅÅ¶ö&¦V7Bö&¦V7EÅÒ’Bö’çFW7B‡FW‡B’’&WGW&âFW‡C°¢Ð¢&WGW&â"#°¢Ó°¢6öç7B6ÆVåFW‡DÆ—7BÒ†—FV×2ÒµÒ’Óâ—FV×2æf–ÇFW"‚†—FVÒ’Óâ6fUFW‡B†—FVÒ’“°¢6öç7BæVÅF—FÆRÒ6fUFW‡B€¢—4Æ—7F–æuæVÂò–çV—'”Æ—7F–æsòæFG&W72¢""À¢—4Æ—7F–æuæVÂòF—&V7DÆVvVæG4Æ—7F–æsòæFG&W72¢""À¢—4Æ—7F–æuæVÂò&W6öÇfVDÆVvVæG4Æ—7F–æsòæFG&W72¢""À¢—4Æ—7F–æuæVÂòÆ6SòçF—FÆR¢""À¢—4Æ—7F–æuæVÂòÆ6SòææÖR¢""À¢Æ6Sòæ'V–ÆF–ætæÖRÀ¢ÇW‡W'”'V–ÆF–æsòææÖRÀ¢–çV—'”Æ—7F–æsòæ'V–ÆF–ætæÖRÀ¢–çV—'”Æ—7F–æsòæFG&W72À¢#s&–æW’"À¢“°¢6öç7BæVÄW–V'&÷rÒ6fUFW‡B€¢&öf–ÆSòææV–v†&÷&†ööBÀ¢&öf–ÆSòæF—7G&–7BÀ¢Æ6SòææV–v†&÷&†ööBÀ¢Æ6SòæF—7G&–7BÀ¢–çV—'”Æ—7F–æsòææV–v†&÷&†ööBÀ¢%&–æW’"À¢“°¢6öç7BÆ—7F–æuæVÄÖWFÒ6fUFW‡B€¢&öf–ÆSòæFG&W72À¢Æ6SòæFG&W72À¢–çV—'”Æ—7F–æsòæFG&W72À¢#s&–æW’7G&VWBÂW7F–âÂE‚sƒs"À¢“°¢6öç7B—5F÷ÆVvVæG4Æ—7F–æuæVÂÒ&ööÆVâ€¢—4ÆVvVæG5F÷Æ—7F–æuÆ6R‡Æ6R’ÇÀ¢F—&V7DÆVvVæG4Æ—7F–æsòæ—5F÷Æ—7F–ærÇÀ¢&W6öÇfVDÆVvVæG4Æ—7F–æsòæ—5F÷Æ—7F–ærÇÀ¢–çV—'”Æ—7F–æsòæ—5F÷Æ—7F–ærÀ¢“°¢6öç7BÆ—7F–ætÖöFT6÷’Ò—5'FæW$ÖöFP¢ò6fUFW‡B€¢F—&V7DÆVvVæG4Æ—7F–æsòç'FæW%æVÄ6÷’À¢&W6öÇfVDÆVvVæG4Æ—7F–æsòç'FæW%æVÄ6÷’À¢–çV—'”Æ—7F–æsòç'FæW%æVÄ6÷’À¢¢¢6fUFW‡B€¢F—&V7DÆVvVæG4Æ—7F–æsòç&W6–FVçEæVÄ6÷’À¢&W6öÇfVDÆVvVæG4Æ—7F–æsòç&W6–FVçEæVÄ6÷’À¢–çV—'”Æ—7F–æsòç&W6–FVçEæVÄ6÷’À¢“°¢6öç7B'V–ÆF–æuæVÄÖWFÒ6fUFW‡B€¢ÇW‡W'”'V–ÆF–æsòæFG&W72À¢Æ6SòæFG&W72À¢&öf–ÆSòæ&6TFG&W72À¢&öf–ÆSòæ'V–ÆF–ætFG&W72À¢–çV—'”Æ—7F–æsòæ'V–ÆF–ætæÖRò7G&–ær†–çV—'”Æ—7F–æræFG&W72ÇÂ""’ç7Æ—B‚"2"•³ÒçG&–Ò‚’¢""À¢#s&–æW’7G&VWBÂW7F–âÂE‚sƒs"À¢’ç&WÆ6R‚õÇ2²2â£òƒóÒÇÂB’òÂ""’ç&WÆ6R‚õÇ2µ5EÆ"ö’Â"7G&VWB"“°¢6öç7BæVÄÖWFÒ—4Æ—7F–æuæVÂòÆ—7F–æuæVÄÖWF¢'V–ÆF–æuæVÄÖWF°¢6öç7B&uæVÄFV²Ò6fUFW‡B‡&öf–ÆSòæ†VFÆ–æR“°¢6öç7BæVÄFV²Ò—4Æ—7F–æuæVÀ¢ò6fUFW‡B†Æ—7F–ætÖöFT6÷’Â%f–WrF†R†öÖRÂ'V–ÆF–ærÂæV–v†&÷&†ööBÂæBf–Æ&ÆRF÷W"F–ÖW2â"¢¢6fUFW‡B€¢&öf–ÆSòç&W6–FVçE7VÖÖ'’À¢ÇW‡W'”'V–ÆF–æsòç7VÖÖ'’À¢Æ6Sòç7VÖÖ'’À¢&uæVÄFV²bb÷6VRv†BF–Ç’Æ–fRfVVÇ2Æ–¶R†W&Rö’çFW7B‡&uæVÄFV²’ò&uæVÄFV²¢""À¢%vFW&g&öçBÆ—f–ærv—F‚F–æ–ærÂF†RG&–ÂÂæBF÷vçF÷vâ6Æ÷6R'’â"À¢“°¢6öç7BæVÄ–ÖvRÒ6fUFW‡B‡&öf–ÆSòæ†W&ô–ÖvRÂvWDÆ–fW7G–ÆT–ÖvR‡Æ6RÂÖöFR’“°¢6öç7B6ÆVä¶W—v÷&E7GVff–ærÒ‡FW‡B’Óâ7G&–ær‡FW‡BÇÂ""¢ç&WÆ6R‚õÆ"…¶×¥Ò²•Ç2¥ÂµÇ2¢…µâ²åÒ²•Ç2¥ÂµÇ2¢…µâ²åÒ²’öv’Â…öÖF6‚Âf—'7BÂ6V6öæBÂF†—&B’ÓâG¶f—'7GÒÂGµ7G&–ær‡6V6öæB’çG&–Ò‚—ÒÂæBGµ7G&–ær‡F†—&B’çG&–Ò‚—Ö¢ç&WÆ6R‚õÆ&6öæw&W72fVçVUÇ2¥ÂµÇ2¦F÷vçF÷vâ6÷&RÆ—f–æuÆ"öv’Â$6öæw&W72fVçVRæBF†RF÷vçF÷vâ6÷&R"¢ç&WÆ6R‚õÆ%&–æW’ÂF†RÆ¶RÂ†÷FVÂF–æ–ærÂæBWfW'–F’&÷WF–æW5Æ"öv’Â$6öæw&W72fVçVRÂF†VFW'2Â&W7FW&çG2Â6öffVRÂW'&æG2ÂæBF†RF–Ç’&‡—F†ÒöbF÷vçF÷vâ"¢ç&WÆ6R‚õÆ'F†RÆ—7F–ærÖGFW'2Â'WBF†RæV–v†&÷&†ööB—2v†BGW&ç2'V–ÆF–ær–çFòF–Ç’&÷WF–æUÂâöv’Â%F†RÆ—7F–ærv—fW2–÷RF†R†öÖRFWF–Ç2âF†RÖ6†÷w2†÷rF†RæV–v†&÷&†ööBf—G2&VÂF–Ç’Æ–fRâ"¢ç&WÆ6R‚õÇ2²örÂ""¢çG&–Ò‚“°¢6öç7B&÷W'G”÷fW'f–WrÒ6ÆVåFW‡DÆ—7B‡&öf–ÆSòç&÷W'G”÷fW'f–WrÇÂµÒ’æÖ†6ÆVä¶W—v÷&E7GVff–ær“°¢6öç7Bv‡”Æ—f–æt†W&TÖGFW'2Ò6ÆVåFW‡DÆ—7B‡&öf–ÆSòçv‡”Æ—f–æt†W&TÖGFW'2ÇÂµÒ“°¢6öç7B÷Vä–çV—'’Ò‚’Óâ°¢Fö7VÖVçBævWDVÆVÖVçD'”–B†ÆVvVæG4–çV—'”f÷&Ô–B“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢&6VçFW""Ò“°¢Ó°¢6öç7B÷Väf–Æ&–Æ—G’Ò‚’Óâ°¢Fö7VÖVçBævWDVÆVÖVçD'”–B†ÆVvVæG4f–Æ&–Æ—G”–B“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢'7F'B"Ò“°¢Ó°¢6öç7BvWDæV&'”6FVv÷'’Ò†6æF–FFR’Óâ°¢–b†—46öffVTVçF—G’†6æF–FFR’’&WGW&â$6öffVR#°¢–b†—4F–æ–ætVçF—G’†6æF–FFR’’&WGW&â$F–æ–ær#°¢–b†6÷&TÖF6†W2†6æF–FFRÂd”ÅDU%ôÔD4„U%2åvVÆÆæW72’ÇÂ7G&–ær†6æF–FFSòçG—RÇÂ6æF–FFSòæ¶–æBÇÂ""’çFôÆ÷vW$66R‚’ÓÓÒ'vVÆÆæW72"’&WGW&â%vVÆÆæW72#°¢–b†—4'&æDVçF—G’†6æF–FFR’ÇÂ6÷&TÖF6†W2†6æF–FFRÂd”ÅDU%ôÔD4„U%2äÖ&¶WG2’’&WGW&â%&WF–Â#°¢–b†—46—f–4VçF—G’†6æF–FFR’’&WGW&â$6—f–2#°¢–b†—4†÷FVÄVçF—G’†6æF–FFR’’&WGW&â$†÷FVÂ#°¢&WGW&â6æF–FFSòæ6FVv÷'’ÇÂ6æF–FFSòçG—RÇÂ%Æ6R#°¢Ó°¢6öç7BvWDæV&'”–6öâÒ†6æF–FFR’Óâ°¢6öç7B6FVv÷'’ÒvWDæV&'”6FVv÷'’†6æF–FFR’çFôÆ÷vW$66R‚“°¢–b†6FVv÷'’æ–æ6ÇVFW2‚&6öffVR"’’&WGW&â6öffVS°¢–b†6FVv÷'’æ–æ6ÇVFW2‚&F–æ–ær"’’&WGW&âWFVç6–Ç3°¢–b†6FVv÷'’æ–æ6ÇVFW2‚'vVÆÆæW72"’’&WGW&âGVÖ&&VÆÃ°¢–b†6FVv÷'’æ–æ6ÇVFW2‚'&WF–Â"’’&WGW&â7&¶ÆW3°¢–b†6FVv÷'’æ–æ6ÇVFW2‚&6—f–2"’’&WGW&âÆæFÖ&³°¢–b†6FVv÷'’æ–æ6ÇVFW2‚&†÷FVÂ"’’&WGW&â'V–ÆF–æs#°¢–b†—4WfVçDVçF—G’†6æF–FFR’’&WGW&â6ÆVæF$F—3°¢&WGW&âÖ–ã°¢Ó°¢6öç7BæV&'”6&G2ÒÆ6W0¢æf–ÇFW"‚†6æF–FFR’Óâ°¢–b‚6æF–FFSòæ–BÇÂ6æF–FFRæ–BÓÓÒÆ6Sòæ–BÇÂvWEÆ6T6ö÷&G2†6æF–FFR’’&WGW&âfÇ6S°¢–b†—5&¶–ætVçF—G’†6æF–FFR’ÇÂ—56W'f–6TVçF—G’†6æF–FFR’ÇÂ—5&VçFÄVçF—G’†6æF–FFR’ÇÂ—4Æ—7F–ætVçF—G’†6æF–FFR’’&WGW&âfÇ6S°¢–b†vWDÆVvVæG4Æ—7F–ær†6æF–FFR’ÇÂvWDÇW‡W'•&W6Væ6T'V–ÆF–ær†6æF–FFR’ÇÂ—5&÷W'G”VçF—G’†6æF–FFR’’&WGW&âfÇ6S°¢&WGW&â—46öffVTVçF—G’†6æF–FFR’ÇÂ—4F–æ–ætVçF—G’†6æF–FFR’ÇÂ—4†÷FVÄVçF—G’†6æF–FFR’ÇÂ—46—f–4VçF—G’†6æF–FFR’ÇÂ—4WfVçDVçF—G’†6æF–FFR’ÇÂ—4'&æDVçF—G’†6æF–FFR“°¢Ò¢æÖ‚†6æF–FFR’Óâ‡²6æF–FFRÂ66÷&S¢vWDÖF—7Fæ6U66÷&R‡Æ6RÂ6æF–FFR’Ò’¢æf–ÇFW"‚‡²66÷&RÒ’ÓâçVÖ&W"æ—4f–æ—FR‡66÷&R’¢ç6÷'B‚†Â"’Óâç66÷&RÒ"ç66÷&R¢ç6Æ–6RƒÂ"¢æÖ‚‡²6æF–FFRÒ’Óâ6æF–FFR“°¢6öç7B'FæW$æWGv÷&µW&·2ÒvWD'V–ÆF–æu'FæW$æWGv÷&µW&·2‡Æ6RÂÆ6W2ÂR“°¢6öç7B&W6–FVçDÆ–fTæV&'’Ò²$6öffVR"Â$F–æ–ær"Â$†÷FVÇ2"Â%vVÆÆæW72"Â%G&–Â&÷WFW2%Ó°¢6öç7B'V–ÆF–æu6æ6†÷BÒ°¢²$FG&W72"ÂæVÄÖWFÒÀ¢²$F—7G&–7B"ÂæVÄW–V'&÷uÒÀ¢²%&W6–FVçBÆ–fR"Â$F–æ–ærÂG&–Â66W72ÂWfVçG2Â†÷FVÇ2ÂæB&W6–FVçBöffW'2æV&'’%ÒÀ¢Ó°¢6öç7BW‡W&–Væ6T'V–ÆF–ærÒW6TÖVÖò‚‚’Óâ‡°¢ââçÆ6RÀ¢æÖS¢æVÅF—FÆRÀ¢F—7G&–7C¢æVÄW–V'&÷rÀ¢÷fW'f–Ws¢æVÄFV²À¢&W6–FVçD÷fW'f–Ws¢æVÄFV²À¢6†&VDÖVæ—F–W3¢Æ6Sòç6†&VDÖVæ—F–W2ÇÂ&öf–ÆSòæÖVæ—F–W2ÇÂ&öf–ÆSòæÖVæ—G”†–v†Æ–v‡G2ÇÂµÒÀ¢&W6–FVçE&÷WF–æW3¢&öf–ÆSòæF–Ç”Æ–fRÇÂ&öf–ÆSòç&W6–FVçE&÷WF–æW2ÇÂ&öf–ÆSòææV&'”†–v†Æ–v‡G2ÇÂµÒÀ¢&W6–FVçDvööDf÷#¢&öf–ÆSòæ&W7Df÷"ÇÂ&öf–ÆSòç&W6–FVçDvööDf÷"ÇÂµÒÀ¢'FæW$6×–vç3¢&öf–ÆSòæ6×–vç2ÇÂ&öf–ÆSòæ6×–vä–FV2ÇÂ&öf–ÆSòç'FæW$6×–vç2ÇÂµÒÀ¢Ò’Â·æVÄFV²ÂæVÄW–V'&÷rÂæVÅF—FÆRÂÆ6RÂ&öf–ÆUÒ“°¢6öç7B'V–ÆF–ætW‡W&–Væ6RÒW6TÖVÖò€¢‚’Óâ7&VFT'V–ÆF–ætW‡W&–Væ6R†W‡W&–Væ6T'V–ÆF–ærÂ²Æ6W2Â&÷WFTFVf–æ—F–öç3¢Ö6öÆÆV7F–öç2Ò’À¢¶W‡W&–Væ6T'V–ÆF–ærÂÆ6W5ÒÀ¢“°¢6öç7BÆ—7F–ætf7G2Ò°¢–çV—'”Æ—7F–æsòç&–6TF—7Æ’ÇÂ–çV—'”Æ—7F–æsòç&–6RÀ¢–çV—'”Æ—7F–æsòæ&VG2òG¶–çV—'”Æ—7F–æræ&VG7Ò&VF¢""À¢–çV—'”Æ—7F–æsòæ&F‡2òG¶–çV—'”Æ—7F–æræ&F‡7Ò&F†¢""À¢–çV—'”Æ—7F–æsòç7gDF—7Æ’ÇÂ†–çV—'”Æ—7F–æsòç7gBòG´çVÖ&W"†–çV—'”Æ—7F–ærç7gB’çFôÆö6ÆU7G&–ær‚—Ò7gF¢""’À¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’ÖG&vW"GÖÆVvVæG2×&W6–FVçF–ÂÖG&vW""&öÆSÒ&Fö7VÖVçB#à¢Æf–wW&R6Æ74æÖSÒ&GÖVçF—G’Ö†W&òGÖVçF—G’Ö†W&òÖ–ÖvR#à¢Æ–Öp¢7&3×·æVÄ–ÖvWÐ¢ÇC×·æVÅF—FÆWÐ¢ÆöF–æsÒ&Æ§’ ¢FV6öF–æsÒ&7–æ2 ¢öäW'&÷#×¶†æFÆUæVÄ–ÖvTW'&÷'Ð¢óà¢Âöf–wW&Sà ¢Æ†VFW"6Æ74æÖSÒ&GÖVçF—G’×æVÂÖ†VFW"GÖVçF—G’×7VÖÖ'’#à¢Ç6Æ74æÖSÒ&GÖVçF—G’ÖW–V'&÷r#ç¶—4Æ—7F–æuæVÂòG¶—5F÷ÆVvVæG4Æ—7F–æuæVÂò$ÆVvVæG2F÷Æ—7F–ær"¢$f÷"6ÆR'Ò+rG·æVÅF—FÆWÖ¢&W6–FVçF–Â+rG·æVÄW–V'&÷wÖÓÂ÷à¢Æƒ"6Æ74æÖSÒ&GÖVçF—G’×F—FÆR#ç·æVÅF—FÆWÓÂöƒ#à¢Ç6Æ74æÖSÒ&GÖVçF—G’ÖÖWF#ç·æVÄÖWFÓÂ÷à¢¶—4Æ—7F–æuæVÂbbÆ—7F–ætf7G2bbÇ6Æ74æÖSÒ&GÖVçF—G’ÖÖWF#ç¶Æ—7F–ætf7G7ÓÂ÷çÐ¢Ç6Æ74æÖSÒ&GÖVçF—G’ÖFV²#ç·æVÄFV·ÓÂ÷à¢Âö†VFW#à ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2Ö'&æBÖ6&BGÖÆVvVæG2Öf÷VæF–ær×'FæW""&–ÖÆ&VÃÒ$ÆVvVæG2&VÂW7FFRf÷VæF–ær'FæW"#à¢Æ–Ör7&3×´ÄTtTäE5õ”åôÄôt÷ÒÇC×´ÄTtTäE5õ”åôÅGÒÆöF–æsÒ&Æ§’"FV6öF–æsÒ&7–æ2"óà¢Ç7ãà¢Ç6ÖÆÃäf÷VæF–ær'FæW#Â÷6ÖÆÃà¢Ç7G&öæsç´ÄTtTäE5ô%$äEôÄ”äWÓÂ÷7G&öæsà¢ÇäÆVB'’æ–æ6VVÇ’ÂÆVvVæG2'&–æw2G'W7FVBW7F–â¶æ÷vÆVFvRFò&W6–FVçF–ÂF—66÷fW'’âÆ—7F–æw2&R—&VBv—F‚æV–v†&÷&†ööB6öçFW‡BÂvÆ¶&–Æ—G’ÂæBF†RWfW'–F’Æ6W2F†B†VÇV÷ÆRVæFW'7FæBv†BÆ—f–ær†W&R6÷VÆBfVVÂÆ–¶RãÂ÷à¢Â÷7ãà¢Â÷6V7F–öãà ¢²—5'FæW$ÖöFRbb€¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2Ö7F–öâÖw&–BGÖVçF—G’Ö7F–öâ×&÷r"&–ÖÆ&VÃ×¶—4Æ—7F–æuæVÂò$Æ—7F–ær7F–öç2"¢%&W6–FVçF–Â'V–ÆF–ær7F–öç2'Óà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’"öä6Æ–6³×¶—4Æ—7F–æuæVÂò÷Vä–çV—'’¢÷Väf–Æ&–Æ—G—Óà¢¶—4Æ—7F–æuæVÂò%&WVW7BF÷W""¢$W‡Æ÷&RæV&'’'Ð¢Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡Æ6R—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W""6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ#äF—&V7F–öç3Âöà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6fWÓç¶—56fVBò%6fVB"¢%6fR'ÓÂö'WGFöãà¢ÂöF—cà¢—Ð ¢²—4Æ—7F–æuæVÂbbÄ'V–ÆF–ætW‡W&–Væ6TÖöGVÆR'V–ÆF–æs×¶W‡W&–Væ6T'V–ÆF–æwÒW‡W&–Væ6S×¶'V–ÆF–ætW‡W&–Væ6WÒÖöFS×¶ÖöFWÒöå6VÆV7C×¶öå6VÆV7GÒöäW‡Æ÷&S×¶öäW‡Æ÷&RÇÂöäf–ÇFW'Òöä÷Vå&÷WFS×¶öä÷Vå&÷WFWÒóçÐ ¢¶—5'FæW$ÖöFRò€¢Ãà¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3åv†BV÷ÆR&R÷Væ–æsÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2ÖæÇ—F–72Öw&÷W2"&–ÖÆ&VÃÒ$ÆVvVæG2æÇ—F–72G&6¶VB#à¢¶æÇ—F–74w&÷W2æÖ‚…¶w&÷WÂ—FV×5Ò’Óâ€¢ÆF—b¶W“×¶w&÷WÒ6Æ74æÖSÒ&GÖÆVvVæG2ÖæÇ—F–72Öw&÷W#à¢Çç¶w&÷WÓÂ÷à¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2ÖæÇ—F–72ÖÖWG&–2ÖÆ—7B#à¢¶—FV×2æÖ‚…¶—FVÒÂÆ&VÅÒ’Óâ€¢Æ'WGFöà¢¶W“×¶—FV×Ð¢G—SÒ&'WGFöâ ¢6Æ74æÖSÒ&GÖÆVvVæG2ÖæÇ—F–72ÖÖWG&–2 ¢&–×&W76VC×¶7F—fTæÇ—F–74–ç6–v‡BÓÓÒ—FV×Ð¢öä6Æ–6³×²‚’Óâ6WD7F—fTæÇ—F–74–ç6–v‡B†—FVÒ—Ð¢à¢¶Æ&VÇÐ¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Æ'F–6ÆR6Æ74æÖSÒ&GÖÆVvVæG2ÖæÇ—F–72Ö–ç6–v‡B"&–ÖÆ—fSÒ'öÆ—FR#à¢ÆƒCç¶7F—fTæÇ—F–74–ç6–v‡GÓÂöƒCà¢ÆFÃà¢ÆF—cà¢ÆGCåv†B—B6†÷w3ÂöGCà¢ÆFCç¶æÇ—F–74–ç6–v‡Bç6–væÇÓÂöFCà¢ÂöF—cà¢ÆF—cà¢ÆGCåv‡’—BÖGFW'3ÂöGCà¢ÆFCç¶æÇ—F–74–ç6–v‡Bçv‡—ÓÂöFCà¢ÂöF—cà¢ÆF—cà¢ÆGCäæW‡BÖ÷fSÂöGCà¢ÆFCç¶æÇ—F–74–ç6–v‡Bæ7F–öçÓÂöFCà¢ÂöF—cà¢ÂöFÃà¢Âö'F–6ÆSà¢Â÷6V7F–öãà¢Âóà¢’¢€¢Ãà¢¶—4Æ—7F–æuæVÂò€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ä†öÖR†–v†Æ–v‡G3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢µ°¢²$†öÖR"ÂÆ—7F–ætf7G2ÇÂ$Æ—7F–ærFWF–Ç2f–Æ&ÆR%ÒÀ¢²$'V–ÆF–ær"ÂG·æVÅF—FÆWÒ+rG¶'V–ÆF–æuæVÄÖWFÖÒÀ¢²%F÷W""Â%6†÷v–ær&WVW7G2&R†æFÆVB'’ÆVvVæG2&VÂW7FFR%ÒÀ¢ÒæÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢’¢€¢Ãà¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3å&W6–FVçBÆ–fRæV&'“Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×FW‡B×&–Â"&–ÖÆ&VÃ×¶G·æVÅF—FÆWÒ&W6–FVçBÆ–fRæV&'–Óà¢·&W6–FVçDÆ–fTæV&'’æÖ‚†Æ&VÂ’Óâ€¢Æ'WGFöâ¶W“×¶Æ&VÇÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×FW‡BÖ6†—"öä6Æ–6³×²‚’Óâöäf–ÇFW#òâ†Æ&VÂÓÓÒ%G&–Â&÷WFW2"ò$6—f–2"¢Æ&VÂ—Óà¢¶Æ&VÇÐ¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3äW76VçF–ÂFWF–Ç3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶'V–ÆF–æu6æ6†÷BæÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢Âóà¢—Ð ¢²&÷W'G”÷fW'f–WræÆVæwF‚bb—4Æ—7F–æuæVÂbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3å&÷W'G’÷fW'f–WsÂöƒ3à¢·&÷W'G”÷fW'f–WræÖ‚†Æ–æR’ÓâÇ¶W“×¶Æ–æWÓç¶Æ–æWÓÂ÷â—Ð¢Â÷6V7F–öãà¢—Ð ¢²v‡”Æ—f–æt†W&TÖGFW'2æÆVæwF‚bb—4Æ—7F–æuæVÂbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ä'V–ÆF–ær6öçFW‡CÂöƒ3à¢·v‡”Æ—f–æt†W&TÖGFW'2æÖ‚†Æ–æR’ÓâÇ¶W“×¶Æ–æWÓç¶Æ–æWÓÂ÷â—Ð¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ç¶—4Æ—7F–æuæVÂò$F–Ç’Æ–fRæV&'’"¢$fVGW&VBæV&'’'ÓÂöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×FW‡B×&–Â"&–ÖÆ&VÃÒ$æV&'’6FVv÷&–W2#à¢µ²$F–æ–ær"Â$6öffVR"Â%vVÆÆæW72"Â%&WF–Â%ÒæÖ‚†Æ&VÂ’Óâ€¢Æ'WGFöâ¶W“×¶Æ&VÇÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’×FW‡BÖ6†—"öä6Æ–6³×²‚’Óâöäf–ÇFW#òâ†Æ&VÂÓÓÒ%&WF–Â"ò%&WF–Â"¢Æ&VÂ—Óà¢¶Æ&VÇÐ¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢¶æV&'”6&G2æÆVæwF‚ò€¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2ÖæV&'’Öw&–B#à¢¶æV&'”6&G2æÖ‚†6æF–FFR’Óâ°¢6öç7B–ÖvRÒ&W6öÇfTVçF—G”–ÖvR†6æF–FFRÂ&6&B"“°¢6öç7B–6öâÒvWDæV&'”–6öâ†6æF–FFR“°¢&WGW&â€¢Æ'WGFöâ¶W“×¶6æF–FFRæ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖÆVvVæG2ÖæV&'’Ö6&B"öä6Æ–6³×²‚’Óâöå6VÆV7B†6æF–FFR—Óà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2ÖæV&'’Ö6&BÖÖVF–"&–Ö†–FFVãÒ'G'VR#à¢¶–ÖvRòÆ–Ör7&3×¶–ÖvWÒÇCÒ""ÆöF–æsÒ&Æ§’"FV6öF–æsÒ&7–æ2"óâ¢Ä–6öâ6Æ74æÖSÒ&‚ÓBrÓB"óçÐ¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2ÖæV&'’Ö6&BÖ6÷’#à¢Ç7G&öæsç¶6æF–FFRææÖRÇÂ6æF–FFRçF—FÆWÓÂ÷7G&öæsà¢Ç7ãç¶vWDæV&'”6FVv÷'’†6æF–FFR—Ò+r¶6æF–FFRæF—7G&–7BÇÂ$F÷vçF÷vâW7F–â'ÓÂ÷7ãà¢ÆVÓä÷Vâ–ãÂöVÓà¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂöF—cà¢’¢€¢ÇäæòæV&'’&Vv—7G'’ÖF6†W2&Rf–Æ&ÆRf÷"F†—2'V–ÆF–ær–WBãÂ÷à¢—Ð¢Â÷6V7F–öãà ¢·'FæW$æWGv÷&µW&·2æÆVæwF‚âbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâGÖ'V–ÆF–ærÖæWGv÷&²×W&·2×6V7F–öâ#à¢Æƒ3å'FæW"æWGv÷&²W&·3Âöƒ3à¢ÆF—b6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&·5õ÷&–Â"&–ÖÆ&VÃ×¶G·æVÅF—FÆWÒ'FæW"æWGv÷&²W&·6Óà¢·'FæW$æWGv÷&µW&·2æÖ‚‡²6æF–FFRÂF—7Fæ6TÆ&VÂÂW&²Ò’Óâ°¢6öç7BF—FÆRÒvWDW‡Æ–6—EW&µF—FÆR†6æF–FFR’ÇÂf÷&ÖE&W6–FVçEW&´†VF–ær‡W&³òæöffW"ÇÂW&³òçF—FÆRÇÂ%&W6–FVçBW&²"“°¢6öç7BÖWFÒ¶F—7Fæ6TÆ&VÂÂvWDæV&'”¶–æDÆ&VÂ†6æF–FFRÂvWDFW7F–æF–öä¶–æB†6æF–FFR’•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&â€¢Æ'WGFöâ¶W“×¶6æF–FFRæ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&B"F—6&ÆVC×´&ööÆVâ†6æF–FFRç&sòææWGv÷&´fÆÆ&6²—Òöä6Æ–6³×²‚’Óâ°¢–b‚6æF–FFRç&sòææWGv÷&´fÆÆ&6²’öå6VÆV7B†6æF–FFR“°¢×Óà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&Eõ÷F—FÆR#ç¶6æF–FFRææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõööffW"#ç·F—FÆWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ'V–ÆF–ærÖæWGv÷&²×W&²Ö6&EõöÖWF#ç¶ÖWFÓÂ÷7ãà¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ–C×¶ÆVvVæG4f–Æ&–Æ—G”–GÒ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢Æƒ3ç¶—4Æ—7F–æuæVÂò$Æ—7F–ær"¢†öÖW2BG·æVÅF—FÆWÖÓÂöƒ3à¢²—4Æ—7F–æuæVÂbbÇåf–Wr7W'&VçB†öÖW2&W&W6VçFVB'’ÆVvVæG2&VÂW7FFRãÂ÷çÐ¢¶Æ—7F–æu&÷w2æÆVæwF‚ò€¢ÆF—b6Æ74æÖSÒ&GÖVçF—G’×&÷rÖÆ—7B#à¢¶Æ—7F–æu&÷w2æÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢ÆF—b¶W“×¶G·F—FÆWÒÒG¶6÷—ÖÒ6Æ74æÖSÒ&GÖVçF—G’×&÷r#à¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÂöF—cà¢’—Ð¢ÂöF—cà¢’¢€¢Çäæò7F—fRÆ—7F–æw27W'&VçFÇ’f–Æ&ÆRf÷"F†—2'V–ÆF–ærãÂ÷à¢—Ð¢Â÷6V7F–öãà ¢¶—4Æ—7F–æuæVÂbb€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâ#à¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2Ö7F–öâÖw&–B#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ—2×&–Ö'’"öä6Æ–6³×¶÷Vä–çV—'—Óå&WVW7BF÷W#Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&GÖVçF—G’Ö7F–öâ"öä6Æ–6³×¶öå6fWÓç¶—56fVBò%6fVB"¢%6fR'ÓÂö'WGFöãà¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢¶—4Æ—7F–æuæVÂbb€¢Ç6V7F–öâ–C×¶ÆVvVæG4–çV—'”f÷&Ô–GÒ6Æ74æÖSÒ&GÖVçF—G’×6V7F–öâGÖÆVvVæG2Ö–çV—'’×6V7F–öâ#à¢Æƒ3å&WVW7B–æf÷&ÖF–öãÂöƒ3à¢Ç6Æ74æÖSÒ&GÖÆVvVæG2Ö–çV—'’Ö–çG&ò#å–÷W"&WVW7BvöW2Fò´ÄTtTäE5ô%$äEôÄ”äWÒv—F‚F†R†öÖRÂ'V–ÆF–ærÂF–Ö–ærÂæBÖW76vRGF6†VBãÂ÷à¢ÄÆVvVæG46öçF7Df÷&Òf÷&Ô–C×¶G¶ÆVvVæG4–çV—'”f÷&Ô–GÒÖf÷&ÖÒÆ—7F–æs×¶–çV—'”Æ—7F–æwÒóà¢Â÷6V7F–öãà¢—Ð¢Âóà¢—Ð¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâæ÷&ÖÆ—¦UæVÄ–ÖvUFW‡B‡fÇVR’°¢&WGW&â7G&–ær‡fÇVRÇÂ""¢çFôÆ÷vW$66R‚¢ç&WÆ6R‚õÆ"‡7G&VWB•Æ"örÂ'7B"¢ç&WÆ6R‚õÆ"†fVçVR•Æ"örÂ&fR"¢ç&WÆ6R‚õ²2âÅÒörÂ""¢ç&WÆ6R‚õÇ2²örÂ""¢çG&–Ò‚“°§Ð ¦gVæ7F–öâ&6TFG&W75FW‡B‡fÇVR’°¢&WGW&âæ÷&ÖÆ—¦UæVÄ–ÖvUFW‡B‡fÇVR’ç&WÆ6R‚õÇ2²‡Væ—GÆGÇ7V—FR“õÇ2¥ÆBµ¶×¥ÓõÇ2¢Bö’Â""’çG&–Ò‚“°§Ð ¦gVæ7F–öâvWE&VÆWfçDÆ—7F–æt–ÖvR‡Æ6R’°¢6öç7B&W6öÇfTÆ—7F–æuæVÄ–ÖvRÒ†–ÖvRÂ6÷W&6RÒ·Ò’Óâ°¢–b‚–ÖvR’&WGW&âçVÆÃ°¢&WGW&â&W6öÇfTÖ–ÖvR‡°¢ââçÆ6RÀ¢ââç6÷W&6RÀ¢–ÖvRÀ¢&–Ö'”–ÖvS¢–ÖvRÀ¢æVÄ–ÖvS¢–ÖvRÀ¢ÒÂ&G&vW$†VFW""“°¢Ó° ¢6öç7BÇW‡W'”'V–ÆF–ærÒvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡Æ6R“°¢6öç7BÇW‡W'”Æ—7F–æw2ÒÇW‡W'”'V–ÆF–æsòæÆ—7F–æw2ÇÂµÓ°¢6öç7BÇW‡W'”–ÖvRÒÇW‡W'”'V–ÆF–æsòçæVÄ–ÖvRÇÂÇW‡W'”'V–ÆF–æsòæ†W&ô–ÖvRÇÂÇW‡W'”'V–ÆF–æsòæ'V–ÆF–ætW‡FW&–÷"ÇÂÇW‡W'”Æ—7F–æw2æf–æB‚†Æ—7F–ær’ÓâÆ—7F–æsòæ†W&ô–ÖvR“òæ†W&ô–ÖvS°¢–b†ÇW‡W'”–ÖvR’&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR†ÇW‡W'”–ÖvRÂÇW‡W'”'V–ÆF–ær“° ¢6öç7BF—&V7DÆ—7F–ærÒvWDÆVvVæG4Æ—7F–ær‡Æ6R“°¢–b†F—&V7DÆ—7F–æsòæ–ÖvR’&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR†F—&V7DÆ—7F–æræ–ÖvRÂF—&V7DÆ—7F–ær“°¢–b‡Æ6Sòæ–ÖvRbb7G&–ær‡Æ6Ræ–ÖvR’æ–æ6ÇVFW2‚"ö–ÖvW2öÆVvVæG2ÖÆ—7F–æw2ò"’’&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR‡Æ6Ræ–ÖvR“°¢–b‡Æ6Sòç&–Ö'”–ÖvRbb7G&–ær‡Æ6Rç&–Ö'”–ÖvR’æ–æ6ÇVFW2‚"ö–ÖvW2öÆVvVæG2ÖÆ—7F–æw2ò"’’&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR‡Æ6Rç&–Ö'”–ÖvR“°¢–b‡Æ6SòçæVÄ–ÖvRbb7G&–ær‡Æ6RçæVÄ–ÖvR’æ–æ6ÇVFW2‚"ö–ÖvW2öÆVvVæG2ÖÆ—7F–æw2ò"’’&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR‡Æ6RçæVÄ–ÖvR“° ¢6öç7BÆ6UFW‡Df÷$–ÖvRÒæ÷&ÖÆ—¦UæVÄ–ÖvUFW‡B…°¢Æ6Sòæ–BÀ¢Æ6SòææÖRÀ¢Æ6SòæFG&W72À¢Æ6Sòç&sòæFG&W72À¢Æ6Sòç&sòææÖRÀ¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚""’“° ¢6öç7B–ÖvU6÷W&6TÆ—7F–æw2Ò°¢ââæÇW‡W'•&W6Væ6TÆ—7F–æw2æÖ‚†Æ—7F–ær’Óâ‡°¢æÖS¢Æ—7F–æræFG&W72À¢–ÖvS¢Æ—7F–ærç&–Ö'”–ÖvRÀ¢&s¢²ÆVvVæG4Æ—7F–æs¢²FG&W73¢Æ—7F–æræFG&W72Â–ÖvS¢Æ—7F–ærç&–Ö'”–ÖvRÒÒÀ¢Ò’’À¢ââæÆVvVæG4Æ—7F–æuÆ6W2À¢Ó°¢6öç7BÖF6†VDÆ—7F–æuÆ6RÒ–ÖvU6÷W&6TÆ—7F–æw2æf–æB‚†Æ—7F–æuÆ6R’Óâ°¢6öç7BÆ—7F–ærÒvWDÆVvVæG4Æ—7F–ær†Æ—7F–æuÆ6R“°¢6öç7BÆ—7F–ætFG&W72Òæ÷&ÖÆ—¦UæVÄ–ÖvUFW‡B†Æ—7F–æsòæFG&W72ÇÂÆ—7F–æuÆ6RæFG&W72ÇÂÆ—7F–æuÆ6RææÖR“°¢6öç7BÆ—7F–æt&6TFG&W72Ò&6TFG&W75FW‡B†Æ—7F–æsòæFG&W72ÇÂÆ—7F–æuÆ6RæFG&W72ÇÂÆ—7F–æuÆ6RææÖR“°¢&WGW&â†Æ—7F–ætFG&W72bbÆ6UFW‡Df÷$–ÖvRæ–æ6ÇVFW2†Æ—7F–ætFG&W72’’ÇÂ†Æ—7F–æt&6TFG&W72bbÆ6UFW‡Df÷$–ÖvRæ–æ6ÇVFW2†Æ—7F–æt&6TFG&W72’“°¢Ò“° ¢&WGW&â&W6öÇfTÆ—7F–æuæVÄ–ÖvR†ÖF6†VDÆ—7F–æuÆ6Sòç&sòæÆVvVæG4Æ—7F–æsòæ–ÖvRÇÂÖF6†VDÆ—7F–æuÆ6Sòæ–ÖvRÂÖF6†VDÆ—7F–æuÆ6R“°§Ð ¦gVæ7F–öâvWDÆ–fW7G–ÆT–ÖvR‡Æ6RÂÖöFR’°¢6öç7BFW‡BÒÆ6T6÷&UFW‡B‡²ââçÆ6RÂÖöFRÒ“°¢6öç7B–BÒ7G&–ær‡Æ6Sòæ–BÇÂÆ6Sòç&sòæ–BÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BW‡Æ–6—EæVÄ–ÖvW2Ò°¢²÷vRÆÂ&–FWÆ&–¶RÖ÷6–7Æ¦×W¦7§ÆF×7F÷ÓBòÂ"ö–ÖvW2öÖÖVçF—F–W2ö6—f–2÷vRÖÆÂ×&–FRÖÖ÷6–2ÖFWF–ÂçvV'%ÒÀ¢²ö6VçG&ÂÆ–'&'—ÆF×7F÷Ó’òÂ"ö–ÖvW2öÖÖVçF—F–W2ö6—f–2öW7F–âÖ6VçG&ÂÖÆ–'&'’×&öögF÷æf–b%ÒÀ¢²÷&WV&Æ–27V&WÆF×7F÷Ó‚òÂ"ö–ÖvW2öÖÖVçF—F–W2÷W&·2ö6—f–5÷&WV&Æ–5÷7V&Uóss“S#ƒ3ƒ3#rçær%ÒÀ¢²÷ÆÖW"WfVçG26VçFW'ÆF×7F÷Ó#bòÂ"ö–ÖvW2öÖÖVçF—F–W2öWfVçG2÷ÆÖW"ÖWfVçG2Ö6VçFW"Öw&÷VæG2çvV'%ÒÀ¢²öÖ÷¦'GÆ¦§¢æ–v‡GÆÖ÷f–W2öâF†RÆ¶RòÂ"ö–ÖvW2öÖÖVçF—F–W2öWfVçG2öÖ÷¦'G2Ö¦§¢æ§r%ÒÀ¢²÷7VÖÖW"vVÆÆæW77Æf—&ÖöçB7Ç÷vW"fÆ÷wÆvVçFÆR–övÇ&V6÷fW'’òÂ"ö–ÖvW2öÖÖVçF—F–W2öf—&ÖöçBÖW7F–â÷7VÖÖW"×vVÆÆæW72×–övçvV'%ÒÀ¢²õÆ&ÇFU¶ì;ÖõÆ"òÂ"ö–ÖvW2öÖÖVçF—F–W2óÖ†÷FVÂÖW7F–âöÇFVæò×&VæFW&–ærçvV'%ÒÀ¢²õÆ'vG%Æ'Ã†÷FVÂ&öögF÷òÂ"ö–ÖvW2öÖÖVçF—F–W2óÖ†÷FVÂÖW7F–â÷vG"çvV'%ÒÀ¢²õÆ&æV–v†&÷'5Æ'Ã†÷FVÂ6fWÇv–æR&"òÂ"ö–ÖvW2öÖÖVçF—F–W2óÖ†÷FVÂÖW7F–â÷vFW&Æ–æRÖ†÷FVÂæf–b%ÒÀ¢²÷&—f–âòÂ"ö–ÖvW2öÖÖVçF—F–W2ö'&æB×&—f–âó”§fäÕ†´wWc„4f…G•óÄ–·Dä5D$&öÆ…—4ÄfDg$·EE'¦µWU3GceC”TÄƒ7fõƒgTvG%E§E†TD¥u”$WeTµ‡tÆ&ô†V§$Ä$´µ¥$¶óvã‡tT5ÕVÔ3†UfTµõög$óESudd7eõu–ãw§4F…svuCeC–¥§#6¦Å÷fVõ—D¤´Ó”Ó”ôUg3c…6ræ§Vr%ÒÀ¢²÷F÷ò6†–6÷Æ‡–G&F–öâòÂ"ö–ÖvW2öÖÖVçF—F–W2ö'&æB×F÷òÖ6†–6ò÷F÷òÖ6†–6òÖ&÷GFÆR×–VÆÆ÷ræ§Vr%ÒÀ¢²÷–WF’òÂ"ö–ÖvW2öÖÖVçF—F–W2ö'&æB×–WF’÷–WF’ÖfÆw6†—Ö–çFW&–÷"æ§r%ÒÀ¢²öÇW7G&RV&ÇÆ†’Ö†÷W"ÖÇW7G&R×V&ÇÇ'FæW"ÖÇW7G&R×V&Â×&–æW’òÂ"ö–ÖvW2ö–×÷'FVB÷W&·2ö'&æB×WFFW2öÇW7G&R×V&ÂÖ†’Ö†÷W"çær%ÒÀ¢²ö&ævW'Ç6W6vR†÷W6WÆ&VW"v&FVâòÂ"ö–ÖvW2ö–×÷'FVB÷W&·2ö'&æB×WFFW2ö&ævW'2×F–òæ§r%ÒÀ¢²÷7F’WGÆFVWVÆÇVÒòÂ"ö–ÖvW2ö–×÷'FVB÷W&·2ö'&æB×WFFW2÷7F’×WB×F–òçær%ÒÀ¢²ö†Æb7FWòÂ"ö–ÖvW2÷&W7FW&çG2ö†Æb×7FWæ§r%ÒÀ¢²÷7FvvW"ÆVRòÂ"ö–ÖvW2ö–×÷'FVB÷W&·2ö†’Ö†÷W"Ó"çær%ÒÀ¢²öÖÆ–çÇV&Æ–2'GÆ'BvÆ·Æ¦ö†ç7FöâòÂ"ö–ÖvW2öÖÖVçF—F–W2÷W&·2öF÷vçF÷våö'E÷vÆµóss“S#cscSbçær%ÒÀ¢²ö†öæW’&÷6R&—GVÂòÂ"ö–ÖvW2öVçF—F–W2öf÷W"×6V6öç2ö†öæW’×&÷6R×&—GVÂçær%ÒÀ¢²öf÷W"6V6öç2&W6–FVæ6W7Ç'FæW"Öf÷W"×6V6öç7Ã“‚6â¦6–çFòòÂ"ö–ÖvW2÷&÷W'G’ÖÆ—7F–æw2×&VÖ—VÒöf÷W"×6V6öç2×&W6–FVæ6W2æ§Vr%ÒÀ¢²öf÷W"6V6öç2†÷FVÇÆf÷W"6V6öç2W7F–âòÂ"ö–ÖvW2öVçF—F–W2öf÷W"×6V6öç2öf÷W"×6V6öç2ÖW7F–â×ööÂÖv&FVâçær%ÒÀ¢²÷vFW&Æ–æRòÂ"ö–ÖvW2öÖ÷æVÇ2÷vFW&Æ–æRÖW7F–âæ§r%ÒÀ¢Ó°¢6öç7BÖF6†VBÒW‡Æ–6—EæVÄ–ÖvW2æf–æB‚…·GFW&åÒ’ÓâGFW&âçFW7B†G¶–GÒG·FW‡GÖ’“°¢–b†ÖF6†VB’&WGW&âÖF6†VE³Ó°¢&WGW&âvWE&VÆWfçDÆ—7F–æt–ÖvR‡Æ6R’ÇÂ&W6öÇfTÖ–ÖvR‡²ââçÆ6RÂÖöFRÒÂ&G&vW$†VFW""“°§Ð ¦gVæ7F–öâvWEæVÄ–ÖvTö&¦V7E÷6—F–öâ‡Æ6R’°¢6öç7B&tfö7W2Ò7G&–ær‡Æ6Sòæ–ÖvTfö7W2ÇÂÆ6Sòç&sòæ–ÖvTfö7W2ÇÂÆ6Sòç&sòæ–ÖvUöfö7W2ÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7Bfö7W4ÖÒ°¢F÷¢&6VçFW"F÷"À¢6VçFW#¢&6VçFW"6VçFW""À¢&÷GFöÓ¢&6VçFW"&÷GFöÒ"À¢ÆVgC¢&ÆVgB6VçFW""À¢&–v‡C¢'&–v‡B6VçFW""À¢Ó°¢–b†fö7W4Ö·&tfö7W5Ò’&WGW&âfö7W4Ö·&tfö7W5Ó° ¢6öç7BFW‡BÒÆ6T6÷&UFW‡B‡Æ6R“°¢6öç7B¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡Æ6R“°¢–b†¶–æBÓÓÒ'&÷W'G’"ÇÂFW‡Bæ–æ6ÇVFW2‚&'V–ÆF–ær"’ÇÂFW‡Bæ–æ6ÇVFW2‚'&W6–FVçF–Â"’’&WGW&â&6VçFW"6VçFW"#°¢–b†¶–æBÓÓÒ&†÷FVÂ"ÇÂFW‡Bæ–æ6ÇVFW2‚&†÷FVÂ"’’&WGW&â&6VçFW"6VçFW"#°¢–b‡FW‡Bæ–æ6ÇVFW2‚'f–32"’’&WGW&â##‚R#BR#°¢–b‡FW‡Bæ–æ6ÇVFW2‚&ÇW7G&RV&Â"’’&WGW&â#SRC"R#°¢–b‡FW‡Bæ–æ6ÇVFW2‚&&ævW""’’&WGW&â#C‚RC"R#°¢–b‡FW‡Bæ–æ6ÇVFW2‚'7F’WB"’’&WGW&â#SR3‚R#°¢–b‡FW‡Bæ–æ6ÇVFW2‚'7FvvW"ÆVR"’ÇÂFW‡Bæ–æ6ÇVFW2‚&†Æb7FW"’’&WGW&â#SRCBR#°¢–b‡FW‡Bæ–æ6ÇVFW2‚&vW&ÆF–æR"’’&WGW&â#SRC"R#°¢–b‡FW‡Bæ–æ6ÇVFW2‚&çF†VÒ"’’&WGW&â#SRCRR#°¢–b‡FW‡Bæ–æ6ÇVFW2‚&VÖÖW""’ÇÂFW‡Bæ–æ6ÇVFW2‚''–R"’’&WGW&â#SRCBR#°¢&WGW&â&6VçFW"#°§Ð ¦gVæ7F–öâ†æFÆUæVÄ–ÖvTW'&÷"†WfVçB’°¢6öç7B–ÖrÒWfVçBæ7W'&VçEF&vWC°¢6öç7B6öçFW‡GVÄfÆÆ&6²Ò–ÖræFF6WBæfÆÆ&6µ7&3°¢–b†–ÖræFF6WBæfÆÆ&6´Æ–VBÓÒ&6öçFW‡GVÂ"bb6öçFW‡GVÄfÆÆ&6²bb7G&–ær†–ÖrævWDGG&–'WFR‚'7&2"’ÇÂ""’æ–æ6ÇVFW2†6öçFW‡GVÄfÆÆ&6²’’°¢–ÖræFF6WBæfÆÆ&6´Æ–VBÒ&6öçFW‡GVÂ#°¢–Örç7&2Ò6öçFW‡GVÄfÆÆ&6³°¢&WGW&ã°¢Ð¢–b†–ÖræFF6WBæfÆÆ&6´Æ–VBÓÓÒ&f–æÂ"’&WGW&ã°¢–ÖræFF6WBæfÆÆ&6´Æ–VBÒ&f–æÂ#°¢–Örç7&2ÒÔõäTÅô”ÔtUôdÄÄ$4³°§Ð ¦gVæ7F–öâ6†÷VÆD6öçF–äG&vW$–ÖvR‡Æ6R’°¢6öç7B¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡Æ6R“°¢6öç7BFW‡BÒÆ6T6÷&UFW‡B‡Æ6R“°¢&WGW&â&ööÆVâ†vWE&VÆWfçDÆ—7F–æt–ÖvR‡Æ6R’’bb†¶–æBÓÓÒ'&÷W'G’"ÇÂFW‡Bæ–æ6ÇVFW2‚'&W6–FVçF–Â&÷W'G’"’“°§Ð ¦gVæ7F–öâ6†÷VÆEW6TÆ—7F–æt–ÖvTÆ–÷WB‡Æ6R’°¢6öç7B¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡Æ6R“°¢6öç7BFW‡BÒÆ6T6÷&UFW‡B‡Æ6R“°¢&WGW&â&ööÆVâ†vWE&VÆWfçDÆ—7F–æt–ÖvR‡Æ6R’’ÇÂ¶–æBÓÓÒ'&÷W'G’"ÇÂFW‡Bæ–æ6ÇVFW2‚&Æ—7F–ær"’ÇÂFW‡Bæ–æ6ÇVFW2‚'&W6–FVçF–Â&÷W'G’"“°§Ð ¦gVæ7F–öâæ÷&ÖÆ—¦T6öçF7D‡&Vb†¶–æBÂfÇVR’°¢6öç7BFW‡BÒ7G&–ær‡fÇVRÇÂ""’çG&–Ò‚“°¢–b‚FW‡B’&WGW&â"#°¢–b†¶–æBÓÓÒ'†öæR"’&WGW&âFVÃ¢G·FW‡Bç&WÆ6R‚õµåÆBµÒörÂ""—Ö°¢–b†¶–æBÓÓÒ&VÖ–Â"’&WGW&âÖ–ÇFó¢G·FW‡GÖ°¢–b‚õæ‡GG3ó¥ÂõÂòö’çFW7B‡FW‡B’’&WGW&âFW‡C°¢&WGW&â‡GG3¢òòG·FW‡GÖ°§Ð ¦gVæ7F–öâvWD6öçF7DFWF–Ç2‡Æ6R’°¢6öç7B&rÒÆ6Sòç&rÇÂ·Ó°¢6öç7BvV'6—FRÒ&rçvV'6—FRÇÂÆ6SòçvV'6—FS°¢6öç7B†öæRÒ&ræ6öçF7E÷†öæRÇÂ&rç†öæRÇÂÆ6Sòç†öæS°¢6öç7BVÖ–ÂÒ&ræ6öçF7EöVÖ–ÂÇÂ&ræVÖ–ÂÇÂÆ6SòæVÖ–Ã°¢&WGW&â°¢†öæRbb²¶–æC¢'†öæR"ÂÆ&VÃ¢$6ÆÂ"ÂfÇVS¢†öæRÂ‡&Vc¢æ÷&ÖÆ—¦T6öçF7D‡&Vb‚'†öæR"Â†öæR’ÒÀ¢vV'6—FRbb²¶–æC¢'vV'6—FR"ÂÆ&VÃ¢%vV'6—FR"ÂfÇVS¢vV'6—FRÂ‡&Vc¢æ÷&ÖÆ—¦T6öçF7D‡&Vb‚'vV'6—FR"ÂvV'6—FR’ÒÀ¢VÖ–Âbb²¶–æC¢&VÖ–Â"ÂÆ&VÃ¢$VÖ–Â"ÂfÇVS¢VÖ–ÂÂ‡&Vc¢æ÷&ÖÆ—¦T6öçF7D‡&Vb‚&VÖ–Â"ÂVÖ–Â’ÒÀ¢Òæf–ÇFW"„&ööÆVâ“°§Ð ¦gVæ7F–öâG&vW$6öçF7E7G&—‡²Æ6RÒ’°¢6öç7B¶7F—fT6öçF7BÂ6WD7F—fT6öçF7EÒÒW6U7FFR†çVÆÂ“°¢6öç7B6öçF7G2ÒvWD6öçF7DFWF–Ç2‡Æ6R“°¢–b‚6öçF7G2æÆVæwF‚’&WGW&âçVÆÃ° ¢6öç7B7F—fTÆ&VÂÒ7F—fT6öçF7Còæ¶–æBÓÓÒ'†öæR ¢ò$6ÆÂ ¢¢7F—fT6öçF7Còæ¶–æBÓÓÒ&VÖ–Â ¢ò$VÖ–Â ¢¢%vV'6—FR#°¢6öç7B7F—fT7F–öâÒ7F—fT6öçF7Còæ¶–æBÓÓÒ'†öæR ¢ò$6ÆÂæ÷r ¢¢7F—fT6öçF7Còæ¶–æBÓÓÒ&VÖ–Â ¢ò%6VæBVÖ–Â ¢¢$÷VâvV'6—FR#° ¢&WGW&â€¢Ãà¢ÆF—b6Æ74æÖSÒ&GÖ6öçF7B×7G&—×BÓãRfÆW‚fÆW‚×w&v×‚Ó2v×’Ó#à¢¶6öçF7G2æÖ‚†—FVÒ’Óâ€¢Æ'WGFöà¢¶W“×¶G¶—FVÒæ¶–æGÒÒG¶—FVÒçfÇVWÖÐ¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ6WD7F—fT6öçF7B†—FVÒ—Ð¢6Æ74æÖSÒ'FW‡BÖÆVgBFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãVÕÒFW‡BÕ²3#c35Òóc"G&ç6—F–öâ†÷fW#§FW‡BÕ²3#c35Òfö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒ ¢&–ÖW‡æFVC×¶7F—fT6öçF7Còæ¶–æBÓÓÒ—FVÒæ¶–æGÐ¢à¢¶—FVÒæÆ&VÇÐ¢Âö'WGFöãà¢’—Ð¢ÂöF—cà ¢Äæ–ÖFU&W6Væ6R–æ—F–Ã×¶fÇ6WÓà¢¶7F—fT6öçF7Bbb€¢ÆÖ÷F–öâæF—`¢–æ—F–Ã×·²÷6—G“¢Â“¢ÓBÂ†V–v‡C¢×Ð¢æ–ÖFS×·²÷6—G“¢Â“¢Â†V–v‡C¢&WFò"×Ð¢W†—C×·²÷6—G“¢Â“¢ÓBÂ†V–v‡C¢×Ð¢G&ç6—F–öã×·²GW&F–öã¢ã‚ÂV6S¢³ã#"ÂÂã3bÂÒ×Ð¢6Æ74æÖSÒ&GÖ6öçF7B×6†VWB×BÓ"÷fW&fÆ÷rÖ†–FFVâ ¢à¢ÆF—b6Æ74æÖSÒ&w&–BvÓ"&r×v†—FRós"Ó"ãR6†F÷rÕ¶–ç6WEóó…ó÷&v&ƒ#SRÃ#SRÃ#SRÃãc‚•Ò#à¢ÆF—b6Æ74æÖSÒ&fÆW‚—FV×2×7F'B§W7F–g’Ö&WGvVVâvÓ2#à¢ÆF—b6Æ74æÖSÒ&Ö–â×rÓ#à¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³—…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóS"#ç¶7F—fTÆ&VÇÓÂöF—cà¢ÆF—b6Æ74æÖSÒ&×BÓ'&V²×v÷&G2FW‡BÕ³'…ÒföçBÖÖVF—VÒÆVF–ærÓRFW‡BÕ²3#c35Ò#à¢¶7F—fT6öçF7BçfÇVWÐ¢ÂöF—cà¢ÂöF—cà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ6WD7F—fT6öçF7B†çVÆÂ—Ð¢6Æ74æÖSÒ&w&–B‚ÓbrÓb6‡&–æ²ÓÆ6RÖ—FV×2Ö6VçFW"FW‡BÕ²3#c35ÒóS‚G&ç6—F–öâ†÷fW#§FW‡BÕ²3#c35Òfö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒ ¢&–ÖÆ&VÃÒ$6Æ÷6R ¢à¢Å‚6Æ74æÖSÒ&‚Ó2ãRrÓ2ãR"óà¢Âö'WGFöãà¢ÂöF—cà¢Æ¢‡&Vc×¶7F—fT6öçF7Bæ‡&VgÐ¢F&vWC×¶7F—fT6öçF7Bæ¶–æBÓÓÒ'vV'6—FR"ò%ö&Ææ²"¢VæFVf–æVGÐ¢&VÃ×¶7F—fT6öçF7Bæ¶–æBÓÓÒ'vV'6—FR"ò&æ÷&VfW'&W""¢VæFVf–æVGÐ¢6Æ74æÖSÒ&–æÆ–æRÖfÆW‚‚Ó‚rÖf—B—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"&r×v†—FRós"‚Ó2FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãVÕÒFW‡BÕ²3#c35Ò6†F÷rÕ³ó‡…ó‡…÷&v&ƒÃ3ÃSÃãCR•ÒG&ç6—F–öâ†÷fW#¢×G&ç6ÆFR×’×‚fö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒ ¢à¢¶7F—fT7F–öçÐ¢Âöà¢ÂöF—cà¢ÂöÖ÷F–öâæF—cà¢—Ð¢Âôæ–ÖFU&W6Væ6Sà¢Âóà¢“°§Ð ¦gVæ7F–öâvWE&W6–FVçDFWF–Ä7F–öâ‡Æ6R’°¢6öç7B6÷&UFW‡BÒÆ6T6÷&UFW‡B‡Æ6R“°¢6öç7B6FVv÷'’Ò7G&–ær‡Æ6Sòæ6FVv÷'’ÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BG—RÒ7G&–ær‡Æ6SòçG—RÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7B—46—f–4ÆæFÖ&²Ò—4FF÷W%Æ6R‡Æ6R’ÇÂõÆ"†6—f–7ÆÆæFÖ&·ÇV&Æ–2'GÇV&Æ–2&VÆ×Ç&·ÇG&–ÇÆ×W6WV×ÆÆ–'&'—ÆÆG’&—&GÆ6öÆ÷&Fò&—fW'Æ6öæw&W72'&–FvWÇvFW&Æö÷Ç&WV&Æ–27V&WÆVF—F÷&—VÒ6†÷&W7Ç6†öÂ7&VV·ÇvÆÆW"7&VV²•Æ"ö’çFW7B†6÷&UFW‡B“° ¢–b†—5&VçFÄVçF—G’‡Æ6R’’°¢&WGW&â²Æ&VÃ¢$6²F†RÖ"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#Õ&VçFÇ2"Ó°¢Ð ¢–b‡G—RÓÓÒ'6W'f–6R"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'6W'f–6R"’ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'&W7F÷&F–öâ"’ÇÂ6÷&UFW‡Bæ–æ6ÇVFW2‚'&W7F÷&F–öâ"’’°¢&WGW&â²Æ&VÃ¢$Ö÷&R6W'f–6W2"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#Õ6W'f–6W2"Ó°¢Ð¢–b†—4†”†÷W$VçF—G’‡Æ6R’’°¢&WGW&â²Æ&VÃ¢$†’†÷W'2"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#Ô†’S#†÷W'2"Ó°¢Ð¢–b†—5&÷W'G”VçF—G’‡Æ6R’ÇÂ—4Æ—7F–ætVçF—G’‡Æ6R’’°¢&WGW&â²Æ&VÃ¢%f–Wr&÷W'G’"Â‡&Vc¢Ö&÷WFW2ç&÷W'F–W2Ó°¢Ð¢–b†—46×–väVçF—G’‡Æ6R’’°¢&WGW&â²Æ&VÃ¢Æ6Sòç&–Ö'”7F–öâÇÂ%7F'B6×–vâ"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#Ô6×–vç2"Ó°¢Ð¢–b‡G—RÓÓÒ'W&²"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&'&æBW&²"’ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'&W6–FVçBW&²"’’°¢&WGW&â²Æ&VÃ¢Æ6Sòç&–Ö'”7F–öâÇÂ%W6RW&²"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÕW&·2"Ó°¢Ð¢–b†—46—f–4ÆæFÖ&²’°¢&WGW&â²Æ&VÃ¢$W‡Æ÷&RæV&'’"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#Ô6—f–2"Ó°¢Ð¢–b†—4WfVçDVçF—G’‡Æ6R’ÇÂ6÷&UFW‡Bæ–æ6ÇVFW2‚''7g"’’°¢&WGW&â²Æ&VÃ¢%f–WrWfVçB"Â‡&Vc¢Ö&÷WFW2æWfVçG2Â6å'7g¢G'VRÓ°¢Ð¢–b‡G—RÓÓÒ&†÷FVÂ"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&†÷FVÂ"’ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&†÷7—FÆ—G’"’’°¢&WGW&â²Æ&VÃ¢%f–Wr†÷FVÇ2"Â‡&Vc¢"öÖöÖöFS×'FæW"gF#ÖÖff–ÇFW#Ô†÷FVÇ2"Ó°¢Ð¢–b‡G—RÓÓÒ&'&æB"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&'&æB"’ÇÂ6÷&UFW‡Bæ–æ6ÇVFW2‚&ÆVvVæG2&VÂW7FFR"’ÇÂ6÷&UFW‡Bæ–æ6ÇVFW2‚'–WF’"’ÇÂ6÷&UFW‡Bæ–æ6ÇVFW2‚'&—f–â"’’°¢&WGW&â²Æ&VÃ¢%f–Wr'&æB"Â‡&Vc¢"öÖöÖöFS×'FæW"gF#ÖÖff–ÇFW#Ô'&æG2"Ó°¢Ð¢–b†—5fVçVTVçF—G’‡Æ6R’ÇÂ†5fVçVU6–væÇ2‡Æ6R’’°¢&WGW&â²Æ&VÃ¢—4çFöæW4VçF—G’‡Æ6R’ò%W6öÖ–ærWfVçG2"¢%f–WrfVçVW2"Â‡&Vc¢"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÔWfVçG2"Ó°¢Ð¢&WGW&â²Æ&VÃ¢$W‡Æ÷&R6–Ö–Æ""Â‡&Vc¢Ö&÷WFW2ç&W6–FVçDÖÓ°§Ð ¦gVæ7F–öâvWE&W6–FVçDVçF—G”¶–æB‡Æ6R’°¢6öç7BFW‡BÒÆ6T6÷&UFW‡B‡Æ6R“°¢6öç7B6FVv÷'’Ò7G&–ær‡Æ6Sòæ6FVv÷'’ÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BG—RÒ7G&–ær‡Æ6SòçG—RÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BW‡Æ–6—DFWF–ÅG—RÒ7G&–ær‡Æ6SòæFWF–ÄVçF—G•G—RÇÂÆ6Sòç&sòæFWF–ÄVçF—G•G—RÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7B—46—f–4ÆæFÖ&²Ò—4FF÷W%Æ6R‡Æ6R’ÇÂõÆ"†6—f–7ÆÆæFÖ&·ÇV&Æ–2'GÇV&Æ–2&VÆ×Ç&·ÇG&–ÇÆ×W6WV×ÆÆ–'&'—ÆÆG’&—&GÆ6öÆ÷&Fò&—fW'Æ6öæw&W72'&–FvWÇvFW&Æö÷Ç&WV&Æ–27V&WÆVF—F÷&—VÒ6†÷&W7Ç6†öÂ7&VV·ÇvÆÆW"7&VV²•Æ"ö’çFW7B‡FW‡B“° ¢–b†—5&VçFÄVçF—G’‡Æ6R’’°¢&WGW&â'&VçFÂ#°¢Ð ¢–b†—5&¶–ætVçF—G’‡Æ6R’’°¢&WGW&â'&¶–ær#°¢Ð ¢–b†—4g&÷7EF÷vW$VçF—G’‡Æ6R’ÇÂG—RÓÓÒ&6öÖÖW&6–Åööff–6R"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'&VÖ—VÒv÷&·Æ6R"’’°¢&WGW&â&6öÖÖW&6–Åööff–6R#°¢Ð ¢–b‡G—RÓÓÒ'6W'f–6R"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'6W'f–6R"’ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'&W7F÷&F–öâ"’ÇÂFW‡Bæ–æ6ÇVFW2‚'&W7F÷&F–öâ"’’°¢&WGW&â'6W'f–6R#°¢Ð ¢–b†—4&ævW'5fVçVR‡Æ6R’’°¢&WGW&â'fVçVR#°¢Ð ¢òò6æöæ–6ÂFWF–Â–FVçF—G’÷WG&æ·2†WW&—7F–2v÷&G2æB6÷W&6Rf7F÷&–W2à¢òò6öÖR&VæVf—G2÷&–v–æFR–ââWfVçBfVVBæB&WF–ââWfVçB×6†VB6÷W&6P¢òò–BÂ'WBF†V—"&÷fVBV&Æ–2–FVçF—G’—27F–ÆÂW&²à¢–b†W‡Æ–6—DFWF–ÅG—RÓÓÒ'W&²"’°¢&WGW&â'W&²#°¢Ð ¢–b†—4†”†÷W$VçF—G’‡Æ6R’’°¢&WGW&â&†•ö†÷W"#°¢Ð ¢–b†—5&÷W'G”VçF—G’‡Æ6R’ÇÂ—4Æ—7F–ætVçF—G’‡Æ6R’’°¢&WGW&â'&÷W'G’#°¢Ð ¢–b†—46×–väVçF—G’‡Æ6R’’°¢&WGW&â&6×–vâ#°¢Ð ¢–b†—46—f–4ÆæFÖ&²’°¢&WGW&â&6—f–2#°¢Ð ¢–b€¢—4WfVçDVçF—G’‡Æ6R’ÇÀ¢FW‡Bæ–æ6ÇVFW2‚''7g"¢’°¢&WGW&â&WfVçB#°¢Ð ¢–b‡G—RÓÓÒ'&WF–Â"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚'&WF–Â"’ÇÂ—5&WF–Ä'&æDVçF—G’‡Æ6R’’°¢&WGW&â'&WF–Â#°¢Ð ¢–b††47F—fUW&´FF‡Æ6R’ÇÂFW‡Bæ–æ6ÇVFW2‚'W&²"’ÇÂFW‡Bæ–æ6ÇVFW2‚&öffW""’ÇÂFW‡Bæ–æ6ÇVFW2‚&F—66÷VçB"’’°¢&WGW&â'W&²#°¢Ð ¢–b‡G—RÓÓÒ&†÷FVÂ"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&†÷FVÂ"’ÇÂFW‡Bæ–æ6ÇVFW2‚&†÷FVÂ"’ÇÂFW‡Bæ–æ6ÇVFW2‚&†÷7—FÆ—G’"’’°¢&WGW&â&†÷FVÂ#°¢Ð ¢–b‡G—RÓÓÒ&'&æB"ÇÂ6FVv÷'’æ–æ6ÇVFW2‚&'&æB"’ÇÂFW‡Bæ–æ6ÇVFW2‚&ÆVvVæG2"’ÇÂFW‡Bæ–æ6ÇVFW2‚'–WF’"’ÇÂFW‡Bæ–æ6ÇVFW2‚'&—f–â"’’°¢&WGW&â&'&æB#°¢Ð ¢–b†—5fVçVTVçF—G’‡Æ6R’ÇÂ†5fVçVU6–væÇ2‡Æ6R’’°¢&WGW&â'fVçVR#°¢Ð ¢&WGW&â'Æ6R#°§Ð ¦gVæ7F–öâvWE'FæW%&–Ö'”7F–öäÆ&VÂ‡Æ6R’°¢6öç7B¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡Æ6R“°¢–b†¶–æBÓÓÒ&6×–vâ"’&WGW&â%&Wf–Wr6×–vâ#°¢–b†¶–æBÓÓÒ'&¶–ær"’&WGW&â%&öÖ÷FR&¶–ær#°¢–b†¶–æBÓÓÒ'&÷W'G’"’&WGW&â%f–WrÆ—7F–æw2#°¢–b†¶–æBÓÓÒ&WfVçB"’&WGW&â%&öÖ÷FRWfVçB#°¢–b†¶–æBÓÓÒ&†•ö†÷W""’&WGW&â%&öÖ÷FR†’†÷W"#°¢–b†¶–æBÓÓÒ&†÷FVÂ"’&WGW&â%&öÖ÷FR†÷FVÂ#°¢–b†¶–æBÓÓÒ&'&æB"’&WGW&â%&öÖ÷FR'&æB#°¢–b†¶–æBÓÓÒ'W&²"’&WGW&â$ÆVæ6‚öffW"#°¢&WGW&â%7F'B6×–vâ#°§Ð ¦gVæ7F–öâvWE'FæW$F6†&ö&E&÷WFR‡Æ6RÂ7F—fTf–ÇFW"Ò""’°¢6öç7B&×2ÒæWrU$Å6V&6…&×2‚“°¢6öç7Bæ÷&ÖÆ—¦VDf–ÇFW"Ò7G&–ær†7F—fTf–ÇFW"ÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7B†5Æ6RÒ&ööÆVâ‡Æ6R“°¢6öç7B¶–æBÒ†5Æ6RòvWE&W6–FVçDVçF—G”¶–æB‡Æ6R’¢"#° ¢–b‡Æ6Sòæ–B’&×2ç6WB‚&VçF—G”–B"Â7G&–ær‡Æ6Ræ–B’“°¢–b‡Æ6SòæF—7G&–7B’&×2ç6WB‚&F—7G&–7B"Â7G&–ær‡Æ6RæF—7G&–7B’“° ¢–b†æ÷&ÖÆ—¦VDf–ÇFW"ÓÓÒ&6—f–2"ÇÂ¶–æBÓÓÒ&6—f–2"ÇÂ††5Æ6Rbb—46—f–4VçF—G’‡Æ6R’’’°¢&×2ç6WB‚'f–Wr"Â&6—f–2"“°¢ÒVÇ6R–b†æ÷&ÖÆ—¦VDf–ÇFW"ÓÓÒ&–æ¶–æB"ÇÂ††5Æ6Rbb—4–ä¶–æE'FæW"‡Æ6R’’’°¢&×2ç6WB‚'f–Wr"Â&–ä¶–æB"“°¢Ð ¢6öç7BVW'’Ò&×2çFõ7G&–ær‚“°¢&WGW&âG¶Ö&÷WFW2æF6†&ö&GÒG·VW'’òòG·VW'—Ö¢"'Ö°§Ð ¦gVæ7F–öâæVÄ–ç6–v‡Dw&–B‡²—FV×2Â6öÇVÖç2Ò&ÖC¦w&–BÖ6öÇ2Ó2"Ò’°¢6öç7Bf—6–&ÆT—FV×2Ò—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÓòçfÇVRÇÂ—FVÓòæ&öG’“°¢–b‚f—6–&ÆT—FV×2æÆVæwF‚’&WGW&âçVÆÃ° ¢&WGW&â€¢ÆF—b6Æ74æÖS×¶G×æVÂÖÆ–æ¶VBÖw&–B×BÓRw&–BvÓG¶6öÇVÖç7ÖÓà¢·f—6–&ÆT—FV×2æÖ‚†—FVÒ’Óâ°¢6öç7B6öçFVçBÒ€¢Ãà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³—…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²4$dCdÒ#ç¶—FVÒæÆ&VÇÓÂöF—cà¢Ç6Æ74æÖS×¶×BÓãRFW‡BÕ³'…ÒÆVF–ærÓRG¶—FVÒæV×†6—2ò&föçB×6VÖ–&öÆBFW‡BÕ²3#c35Ò"¢'FW‡BÕ²3C#SCceÒ'ÖÓà¢¶—FVÒçfÇVRÇÂ—FVÒæ&öG—Ð¢Â÷à¢Âóà¢“° ¢&WGW&â—FVÒæöä6Æ–6²ò€¢Æ'WGFöà¢¶W“×¶—FVÒæÆ&VÇÐ¢G—SÒ&'WGFöâ ¢öä6Æ–6³×¶—FVÒæöä6Æ–6·Ð¢6Æ74æÖS×¶FW‡BÖÆVgBG&ç6—F–öâ†÷fW#¢×G&ç6ÆFR×’×‚fö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒG¶—FVÒæ6Æ74æÖRÇÂ"'ÖÐ¢à¢¶6öçFVçGÐ¢Âö'WGFöãà¢’¢€¢Æ'F–6ÆR¶W“×¶—FVÒæÆ&VÇÒ6Æ74æÖS×¶—FVÒæ6Æ74æÖRÇÂ"'Óà¢¶6öçFVçGÐ¢Âö'F–6ÆSà¢“°¢Ò—Ð¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâ'FæW$'W6–æW74–ç6–v‡G2‡²Æ6RÒ’°¢6öç7B–ç6–v‡G2ÒvWE'FæW$'W6–æW74–ç6–v‡G2‡Æ6R“°¢6öç7B–ç6–v‡D—FV×2Ò°¢âââ†–ç6–v‡G2æf—Bò·²Æ&VÃ¢%v‡’—Bf—G2"ÂfÇVS¢–ç6–v‡G2æf—BÂV×†6—3¢G'VRÕÒ¢µÒ’À¢²Æ&VÃ¢%v†BV÷ÆRvçB"ÂfÇVS¢–ç6–v‡G2æ–çFVçBÒÀ¢²Æ&VÃ¢%v†ò—2æV&'’"ÂfÇVS¢–ç6–v‡G2æVF–Væ6RÒÀ¢²Æ&VÃ¢%v†B6÷VÆB†VÇ"ÂfÇVS¢–ç6–v‡G2æ÷÷'GVæ—G’ÒÀ¢²Æ&VÃ¢$&W7BF–Ö–ær"ÂfÇVS¢–ç6–v‡G2çF–Ö–ærÂV×†6—3¢G'VRÒÀ¢²Æ&VÃ¢%G'’F†—2æW‡B"ÂfÇVS¢–ç6–v‡G2æ7F–öâÂV×†6—3¢G'VRÒÀ¢Ó° ¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ&×BÓBGÖ–æfò×6V7F–öâÓ2ÖC¦×BÓR#à¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚Ö6öÂvÓ2ÖC¦fÆW‚×&÷rÖC¦—FV×2×7F'BÖC¦§W7F–g’Ö&WGvVVâ#à¢ÆF—cà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãfVÕÒFW‡BÕ²4$dCdÒ#äæV&'’wV–FSÂöF—cà¢Æƒ26Æ74æÖSÒ&×BÓFW‡BÕ³‡…ÒföçB×6VÖ–&öÆBÆVF–ær×F–v‡BG&6¶–ærÕ²ÓãVVÕÒFW‡BÕ²3#c35ÒÖC§FW‡BÕ³#…Ò#ä†÷rF†—2Æ6Rf—G2F÷vçF÷vãÂöƒ3à¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã6VÕÒFW‡BÕ²3#c35ÒósÖC§FW‡BÕ³…Ò#à¢¶–ç6–v‡G2çÆ6VÖVçGÐ¢ÂöF—cà¢ÂöF—cà ¢ÅæVÄ–ç6–v‡Dw&–B—FV×3×¶–ç6–v‡D—FV×7Ò6öÇVÖç3Ò&ÖC¦w&–BÖ6öÇ2Ó2"óà¢Â÷6V7F–öãà¢“°§Ð ¦gVæ7F–öâ'FæW$ÖWG&–4–ç6–v‡B‡²Æ6RÒ’°¢6öç7B–ç6–v‡G2ÒvWE'FæW$'W6–æW74–ç6–v‡G2‡Æ6R“° ¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ&×BÓBGÖ–æfò×6V7F–öâÓ2#à¢ÆF—b6Æ74æÖSÒ&fÆW‚fÆW‚Ö6öÂvÓ2ÖC¦fÆW‚×&÷rÖC¦—FV×2×7F'BÖC¦§W7F–g’Ö&WGvVVâ#à¢ÆF—cà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãfVÕÒFW‡BÕ²4$dCdÒ#å'FæW"æW‡B7FWÂöF—cà¢Æƒ26Æ74æÖSÒ&×BÓFW‡BÕ³‡…ÒföçB×6VÖ–&öÆBÆVF–ær×F–v‡BG&6¶–ærÕ²ÓãVVÕÒFW‡BÕ²3#c35ÒÖC§FW‡BÕ³#…Ò#åv†B6†÷VÆB†VâæW‡CÂöƒ3à¢Ç6Æ74æÖSÒ&×BÓ"Ö‚×rÓ'†ÂFW‡BÕ³7…ÒÆVF–ærÓRFW‡BÕ²3C#SCceÒ#ç¶–ç6–v‡G2æ7F–öçÓÂ÷à¢ÂöF—cà¢ÂöF—cà ¢ÅæVÄ–ç6–v‡Dw&–@¢6öÇVÖç3Ò&ÖC¦w&–BÖ6öÇ2Ó2 ¢—FV×3×µ°¢²Æ&VÃ¢$æV&'’æ÷r"ÂfÇVS¢–ç6–v‡G2æ–çFVçBÒÀ¢²Æ&VÃ¢%v‡’—BÖGFW'2"ÂfÇVS¢–ç6–v‡G2æVF–Væ6RÒÀ¢²Æ&VÃ¢$æW‡BÖ÷fR"ÂfÇVS¢–ç6–v‡G2æ7F–öâÂV×†6—3¢G'VRÒÀ¢×Ð¢óà¢Â÷6V7F–öãà¢“°§Ð ¦gVæ7F–öâvWE7F÷&VDÖf–Wr‚’°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&â²6VçFW#¢U5D”åô4TåDU"Â¦ööÓ¢”ä•D”ÅôÔõ¤ôôÒÓ°¢G'’°¢6öç7B&×2ÒæWrU$Å6V&6…&×2‡v–æF÷ræÆö6F–öâç6V&6‚ÇÂ""“°¢6öç7B†56VÆV7FVDVçF—G’Ð¢&ööÆVâ‡&×2ævWB‚&VçF—G”–B"’’ÇÀ¢&ööÆVâ‡&×2ævWB‚&Æ—7F–ær"’’ÇÀ¢&ööÆVâ‡&×2ævWB‚&Æ—7F–æt–B"’“°¢6öç7B—4FVfVÇDÖÆVæ6‚Ð¢†56VÆV7FVDVçF—G’b`¢&×2ævWB‚'VW'’"’b`¢&×2ævWB‚'"’b`¢²$ÆÂ"Â%W&·2%Òæ–æ6ÇVFW2‡&×2ævWB‚&f–ÇFW""’ÇÂ%W&·2"“°¢–b†—4FVfVÇDÖÆVæ6‚’°¢v–æF÷rç6W76–öå7F÷&vRç&VÖ÷fT—FVÒ„Ôõd”Uuõ5Dõ$tUô´U’“°¢&WGW&â²6VçFW#¢U5D”åô4TåDU"Â¦ööÓ¢”ä•D”ÅôÔõ¤ôôÒÓ°¢Ð¢6öç7B'6VBÒ¥4ôâç'6R‡v–æF÷rç6W76–öå7F÷&vRævWD—FVÒ„Ôõd”Uuõ5Dõ$tUô´U’’ÇÂ&çVÆÂ"“°¢6öç7B6VçFW"Ò'&’æ—4'&’‡'6VCòæ6VçFW"’ò'6VBæ6VçFW"æÖ„çVÖ&W"’¢çVÆÃ°¢6öç7B¦ööÒÒçVÖ&W"‡'6VCòç¦ööÒ“°¢6öç7BfÆ–D6VçFW"Ò6VçFW#òæÆVæwF‚ÓÓÒ"bb6VçFW"æWfW'’„çVÖ&W"æ—4f–æ—FR“°¢6öç7BfÆ–E¦ööÒÒçVÖ&W"æ—4f–æ—FR‡¦ööÒ’bb¦ööÒãÒ2bb¦ööÒÃÒÔôÔ…õ¤ôôÓ°¢&WGW&â°¢6VçFW#¢fÆ–D6VçFW"ò6VçFW"¢U5D”åô4TåDU"À¢¦ööÓ¢fÆ–E¦ööÒòÖF‚æÖ–â‡¦ööÒÂ†56VÆV7FVDVçF—G’ò4TÄT5DTEõ$õUDUô”ä•D”ÅôÔ…õ¤ôôÒ¢ÔôÔ…õ¤ôôÒ’¢”ä•D”ÅôÔõ¤ôôÒÀ¢Ó°¢Ò6F6‚°¢&WGW&â²6VçFW#¢U5D”åô4TåDU"Â¦ööÓ¢”ä•D”ÅôÔõ¤ôôÒÓ°¢Ð§Ð ¦gVæ7F–öâvöövÆTÖ6çf2‡°¢6VçFW"À¢¦ööÒÀ¢Ö&¶W$Æ–÷WE¦ööÒÀ¢Ö—FV×2À¢6öÆÆV7F–öå&÷WFRÀ¢f—EÆ6W2À¢f—D7F—fT¶W’À¢f—DVæ&ÆVBÀ¢6VÆV7FVBÀ¢6VÆV7FVD–BÀ¢VÇ6–æu–ä–BÀ¢öå6VÆV7BÀ¢öå6VÆV7DæV&W7DÆVvVæG2À¢öä6ÇW7FW$÷VâÀ¢öå¦ööÔ6†ævRÀ¢öåf–Ww÷'D6†ævRÀ¢öåW6W$æf–vFRÀ¢öä'&÷w6UW&·2À§Ò’°¢6öç7B6öçF–æW%&VbÒW6U&Vb†çVÆÂ“°¢6öç7BÖ&VbÒW6U&Vb†çVÆÂ“°¢6öç7BÖ5&VbÒW6U&Vb†çVÆÂ“°¢6öç7BÖ&¶W%&Vv—7G'•&VbÒW6U&Vb†æWrÖ‚’“°¢6öç7BÖ&¶W$7F–öä†æFÆW'5&VbÒW6U&Vb‡²öä6ÇW7FW$÷VâÂöå6VÆV7BÂöå6VÆV7DæV&W7DÆVvVæG2Ò“°¢6öç7B6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&VbÒW6U&Vb…µÒ“°¢6öç7BÆ7Df—D¶W•&VbÒW6U&Vb‚""“°¢6öç7BÆ7E6VÆV7FVDfö7W5&VbÒW6U&Vb‚""“°¢6öç7BW6W$æf–vFVE&VbÒW6U&Vb†fÇ6R“°¢6öç7B&öw&ÖÖF–4Ö÷fU&VbÒW6U&Vb†fÇ6R“°¢6öç7B–æ—F–Åf–Wu&VbÒW6U&Vb‡²6VçFW"Â¦ööÒÒ“°¢6öç7B–çFW&7F–öä†æFÆW'5&VbÒW6U&Vb‡²öåW6W$æf–vFRÂöåf–Ww÷'D6†ævRÂöå¦ööÔ6†ævRÒ“°¢6öç7B¶ÆöE7FFRÂ6WDÆöE7FFUÒÒW6U7FFR‚‚’Óâ†vWDvöövÆTÖ46öæf–tW'&÷"‚’ò&W'&÷""¢&ÆöF–ær"’“°¢6öç7B¶ÆöDW'&÷"Â6WDÆöDW'&÷%ÒÒW6U7FFR‚‚’ÓâvWDvöövÆTÖ46öæf–tW'&÷"‚’“°¢6öç7BÖ&¶W%&VæFW%¦ööÒÒW6TÖVÖò€¢‚’ÓâvWE7F&ÆTÖ&¶W%¦ööÒ†Ö&¶W$Æ–÷WE¦ööÒóò¦ööÒ’À¢¶Ö&¶W$Æ–÷WE¦ööÒÂ¦ööÕÒÀ¢“° ¢W6TVffV7B‚‚’Óâ°¢–b‚f—D7F—fT¶W’ÇÂf—DVæ&ÆVB’&WGW&ã°¢W6W$æf–vFVE&Vbæ7W'&VçBÒfÇ6S°¢ÒÂ¶f—D7F—fT¶W’Âf—DVæ&ÆVEÒ“° ¢W6TVffV7B‚‚’Óâ°¢–çFW&7F–öä†æFÆW'5&Vbæ7W'&VçBÒ²öåW6W$æf–vFRÂöåf–Ww÷'D6†ævRÂöå¦ööÔ6†ævRÓ°¢ÒÂ¶öåW6W$æf–vFRÂöåf–Ww÷'D6†ævRÂöå¦ööÔ6†ævUÒ“° ¢W6TVffV7B‚‚’Óâ°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBÒ²öä6ÇW7FW$÷VâÂöå6VÆV7BÂöå6VÆV7DæV&W7DÆVvVæG2Ó°¢ÒÂ¶öä6ÇW7FW$÷VâÂöå6VÆV7BÂöå6VÆV7DæV&W7DÆVvVæG5Ò“° ¢6öç7BÖ&µW6W$æf–vFVBÒW6T6ÆÆ&6²‚‚’Óâ°¢–b‡&öw&ÖÖF–4Ö÷fU&Vbæ7W'&VçB’&WGW&ã°¢–b‡W6W$æf–vFVE&Vbæ7W'&VçB’&WGW&ã°¢W6W$æf–vFVE&Vbæ7W'&VçBÒG'VS°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’Â'G'VR"“°¢Ò6F6‚°¢òòf–Ww÷'B6öçG&öÂ—2&W7BÖVff÷'C²7F÷&vRf–ÇW&W26†÷VÆBæ÷B&Æö6²ÖvW7GW&W2à¢Ð¢–çFW&7F–öä†æFÆW'5&Vbæ7W'&VçBæöåW6W$æf–vFSòâ‚“°¢ÒÂµÒ“° ¢6öç7B'Vå&öw&ÖÖF–4Ö÷fRÒW6T6ÆÆ&6²‚†Ö÷fTÖ’Óâ°¢&öw&ÖÖF–4Ö÷fU&Vbæ7W'&VçBÒG'VS°¢Ö÷fTÖ‚“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢&öw&ÖÖF–4Ö÷fU&Vbæ7W'&VçBÒfÇ6S°¢ÒÂ3S“°¢ÒÂµÒ“° ¢6öç7BV&Æ—6…f–Ww÷'BÒW6T6ÆÆ&6²‚‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢–b‚Ö’&WGW&ã°¢6öç7B&÷VæG2ÒÖævWD&÷VæG3òâ‚“°¢6öç7B7W'&VçE¦ööÒÒÖævWE¦ööÓòâ‚’ÇÂ–æ—F–Åf–Wu&Vbæ7W'&VçBç¦ööÒÇÂ”ä•D”ÅôÔõ¤ôôÓ°¢6öç7B7W'&VçD6VçFW"ÒÖævWD6VçFW#òâ‚“°¢–çFW&7F–öä†æFÆW'5&Vbæ7W'&VçBæöå¦ööÔ6†ævSòâ†7W'&VçE¦ööÒ“°¢–b‚&÷VæG2’&WGW&ã°¢–çFW&7F–öä†æFÆW'5&Vbæ7W'&VçBæöåf–Ww÷'D6†ævSòâ‡°¢æ÷'Fƒ¢&÷VæG2ævWDæ÷'F„V7B‚’æÆB‚’À¢6÷WFƒ¢&÷VæG2ævWE6÷WF…vW7B‚’æÆB‚’À¢V7C¢&÷VæG2ævWDæ÷'F„V7B‚’æÆær‚’À¢vW7C¢&÷VæG2ævWE6÷WF…vW7B‚’æÆær‚’À¢¦ööÓ¢7W'&VçE¦ööÒÀ¢6VçFW#¢7W'&VçD6VçFW"ò²ÆC¢7W'&VçD6VçFW"æÆB‚’ÂÆæs¢7W'&VçD6VçFW"æÆær‚’Ò¢çVÆÂÀ¢Ò“°¢ÒÂµÒ“° ¢W6TVffV7B‚‚’Óâ°¢ÆWB6æ6VÆÆVBÒfÇ6S°¢ÆWB&VF–æW75F–ÖV÷WD–C°¢ÆWBÖ&¶VE&VG’ÒfÇ6S°¢6öç7BÖ&´Ö&VG’Ò‚’Óâ°¢–b†6æ6VÆÆVBÇÂÖ&¶VE&VG’’&WGW&ã°¢Ö&¶VE&VG’ÒG'VS°¢–b‡&VF–æW75F–ÖV÷WD–B’v–æF÷ræ6ÆV%F–ÖV÷WB‡&VF–æW75F–ÖV÷WD–B“°¢6WDÆöE7FFR‚'&VG’"“°¢V&Æ—6…f–Ww÷'B‚“°¢Ó°¢6öç7Bf–ÄÖÆöBÒ†W'&÷%G—RÒ&WF†÷&—¦F–öâÖf–ÇW&R"’Óâ°¢–b†6æ6VÆÆVB’&WGW&ã°¢–b‡&VF–æW75F–ÖV÷WD–B’v–æF÷ræ6ÆV%F–ÖV÷WB‡&VF–æW75F–ÖV÷WD–B“°¢6öçF–æW%&Vbæ7W'&VçCòç&WÆ6T6†–ÆG&Vâ‚“°¢6WDÆöE7FFR‚&W'&÷""“°¢6WDÆöDW'&÷"†W'&÷%G—R“°¢Ó°¢6öç7B6öæf–tW'&÷"ÒvWDvöövÆTÖ46öæf–tW'&÷"‚“°¢–b†6öæf–tW'&÷"’°¢6WDÆöE7FFR‚&W'&÷""“°¢6WDÆöDW'&÷"†6öæf–tW'&÷"“°¢&WGW&âVæFVf–æVC°¢Ð ¢6WDÆöE7FFR‚&ÆöF–ær"“°¢ÆöDvöövÆTÖ2‚¢çF†Vâ‚†Ö2’Óâ°¢–b†6æ6VÆÆVBÇÂ6öçF–æW%&Vbæ7W'&VçB’&WGW&ã°¢Ö5&Vbæ7W'&VçBÒÖ3°¢G'’°¢–b‚Ö&Vbæ7W'&VçB’°¢6öç7B–æ—F–Åf–WrÒ–æ—F–Åf–Wu&Vbæ7W'&VçC°¢6öç7BvöövÆTÖ–BÒ–×÷'BæÖWFæVçbåd•DUôtôôtÄUôÔô”BÇÂ–×÷'BæÖWFæVçbåd•DUôtôôtÄUôÔ5ôÔô”BÇÂVæFVf–æVC°¢6öç7BÖ÷F–öç2Ò°¢6VçFW#¢²ÆC¢–æ—F–Åf–Wræ6VçFW%³ÒÂÆæs¢–æ—F–Åf–Wræ6VçFW%³ÒÒÀ¢¦ööÓ¢–æ—F–Åf–Wrç¦ööÒÀ¢Ö–å¦ööÓ¢2À¢Ö…¦ööÓ¢ÔôÔ…õ¤ôôÒÀ¢F—6&ÆTFVfVÇET“¢G'VRÀ¢6Æ–6¶&ÆT–6öç3¢fÇ6RÀ¢vW7GW&T†æFÆ–æs¢&w&VVG’"À¢âââ†vöövÆTÖ–Bò²Ö–C¢vöövÆTÖ–BÒ¢²7G–ÆW3¢vWD–æÆ–æTvöövÆTÖ7G–ÆW2‚’Ò’À¢Ó°¢Ö&Vbæ7W'&VçBÒ7&VFTF÷vçF÷vävöövÆTÖ†Ö2Â6öçF–æW%&Vbæ7W'&VçBÂÖ÷F–öç2“°¢Ö&Vbæ7W'&VçBæFDÆ—7FVæW"‚&G&w7F'B"ÂÖ&µW6W$æf–vFVB“°¢Ö&Vbæ7W'&VçBæFDÆ—7FVæW"‚&G&r"ÂÖ&µW6W$æf–vFVB“°¢Ö&Vbæ7W'&VçBæFDÆ—7FVæW"‚&G&vVæB"ÂÖ&µW6W$æf–vFVB“°¢Ö&Vbæ7W'&VçBæFDÆ—7FVæW"‚'¦ööÕö6†ævVB"ÂÖ&µW6W$æf–vFVB“°¢Ö&Vbæ7W'&VçBæFDÆ—7FVæW"‚&–FÆR"Â‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢–b‚Ö’&WGW&ã°¢–b†6öçF–æW%&Vbæ7W'&VçCòçVW'•6VÆV7F÷"‚"ævÒÖW'"Ö6öçF–æW""’’°¢f–ÄÖÆöB‚&WF†÷&—¦F–öâÖf–ÇW&R"“°¢&WGW&ã°¢Ð¢6öç7B7W'&VçD6VçFW"ÒÖævWD6VçFW#òâ‚“°¢–b†7W'&VçD6VçFW"bb&öw&ÖÖF–4Ö÷fU&Vbæ7W'&VçB’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ€¢Ôõd”Uuõ5Dõ$tUô´U’À¢¥4ôâç7G&–æv–g’‡²6VçFW#¢¶7W'&VçD6VçFW"æÆB‚’Â7W'&VçD6VçFW"æÆær‚•ÒÂ¦ööÓ¢ÖævWE¦ööÒ‚’Ò’À¢“°¢Ð¢V&Æ—6…f–Ww÷'B‚“°¢Ö&´Ö&VG’‚“°¢Ò“°¢ÒVÇ6R–b†6öçF–æW%&Vbæ7W'&VçBçVW'•6VÆV7F÷"‚"ævÒ×7G–ÆR"’’°¢Ö&´Ö&VG’‚“°¢Ð¢Ò6F6‚†W'&÷"’°¢–b†6æ6VÆÆVB’&WGW&ã°¢f–ÄÖÆöB‚ö—ÆWF‡Æ¶W—Æ&–ÆÆ–æwÇV÷Fö’çFW7B†W'&÷#òæÖW76vRÇÂ""’ò&WF†÷&—¦F–öâÖf–ÇW&R"¢&ÖÖ–æ—F–Æ—¦F–öâÖf–ÇW&R"“°¢&WGW&ã°¢Ð¢&VF–æW75F–ÖV÷WD–BÒv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢–b†6æ6VÆÆVBÇÂÖ&¶VE&VG’’&WGW&ã°¢–b†6öçF–æW%&Vbæ7W'&VçCòçVW'•6VÆV7F÷"‚"ævÒÖW'"Ö6öçF–æW""’’°¢f–ÄÖÆöB‚&WF†÷&—¦F–öâÖf–ÇW&R"“°¢&WGW&ã°¢Ð¢–b†6öçF–æW%&Vbæ7W'&VçCòçVW'•6VÆV7F÷"‚"ævÒ×7G–ÆR"’’°¢Ö&´Ö&VG’‚“°¢&WGW&ã°¢Ð¢f–ÄÖÆöB‚&WF†÷&—¦F–öâÖf–ÇW&R"“°¢ÒÂCS“°¢Ò¢æ6F6‚‚†W'&÷"’Óâ°¢–b†6æ6VÆÆVB’&WGW&ã°¢f–ÄÖÆöB†W'&÷#òæÖW76vRÇÂ&ÆöFW"Öf–ÇW&R"“°¢Ò“° ¢&WGW&â‚’Óâ°¢6æ6VÆÆVBÒG'VS°¢–b‡&VF–æW75F–ÖV÷WD–B’v–æF÷ræ6ÆV%F–ÖV÷WB‡&VF–æW75F–ÖV÷WD–B“°¢Ó°¢ÒÂ¶Ö&µW6W$æf–vFVBÂV&Æ—6…f–Ww÷'EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢–b‚Ö’&WGW&ã°¢–b‚6VÆV7FVB’°¢Æ7E6VÆV7FVDfö7W5&Vbæ7W'&VçBÒ"#°¢&WGW&ã°¢Ð¢–b‡W6W$æf–vFVE&Vbæ7W'&VçB’&WGW&ã°¢6öç7Bfö7W4–BÒ7G&–ær‡6VÆV7FVD–BÇÂ6VÆV7FVBæ–BÇÂ6VÆV7FVBæVçF—G”–BÇÂ6VÆV7FVBç6ÇVrÇÂ6VÆV7FVBææÖRÇÂ""“°¢–b‚fö7W4–BÇÂÆ7E6VÆV7FVDfö7W5&Vbæ7W'&VçBÓÓÒfö7W4–B’&WGW&ã°¢6öç7B6VÆV7F–öå&WVW7FVDÖfö7W2Ò&ööÆVâ‡6VÆV7FVCòæÖfö7W5&WVW7FVBÇÂ6VÆV7FVCòæfö7W4öäÖÇÂ6VÆV7FVCòç6†÷VÆDfö7W4Ö“°¢–b‚6VÆV7F–öå&WVW7FVDÖfö7W2’°¢Æ7E6VÆV7FVDfö7W5&Vbæ7W'&VçBÒfö7W4–C°¢&WGW&ã°¢Ð¢6öç7B6ö÷&G2ÒvWEÆ6T6ö÷&G2‡6VÆV7FVB“°¢–b‚6ö÷&G2’&WGW&ã°¢Æ7E6VÆV7FVDfö7W5&Vbæ7W'&VçBÒfö7W4–C°¢'Vå&öw&ÖÖF–4Ö÷fR‚‚’Óâ°¢ÖçåFò‡²ÆC¢6ö÷&G5³ÒÂÆæs¢6ö÷&G5³ÒÒ“°¢6öç7B7W'&VçE¦ööÒÒÖævWE¦ööÓòâ‚’ÇÂ”ä•D”ÅôÔõ¤ôôÓ°¢–b†7W'&VçE¦ööÒÂ”ä•D”ÅôÔõ¤ôôÒ’Öç6WE¦ööÒ„”ä•D”ÅôÔõ¤ôôÒ“°¢Ò“°¢ÒÂ·'Vå&öw&ÖÖF–4Ö÷fRÂ6VÆV7FVBÂ6VÆV7FVD–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢6öç7BÖ2ÒÖ5&Vbæ7W'&VçC°¢–b‚ÖÇÂÖ2ÇÂf—DVæ&ÆVBÇÂ6VÆV7FVD–B’&WGW&ã°¢–b‡W6W$æf–vFVE&Vbæ7W'&VçB’&WGW&ã°¢–b†Æ7Df—D¶W•&Vbæ7W'&VçBÓÓÒf—D7F—fT¶W’’&WGW&ã°¢6öç7B6ö÷&G2Òf—EÆ6W2æÖ‚‡Æ6R’ÓâvWEÆ6T6ö÷&G2‡Æ6R’’æf–ÇFW"„&ööÆVâ“°¢–b‚6ö÷&G2æÆVæwF‚’&WGW&ã°¢Æ7Df—D¶W•&Vbæ7W'&VçBÒf—D7F—fT¶W“° ¢–b†6ö÷&G2æÆVæwF‚ÓÓÒ’°¢'Vå&öw&ÖÖF–4Ö÷fR‚‚’Óâ°¢ÖçåFò‡²ÆC¢6ö÷&G5³Õ³ÒÂÆæs¢6ö÷&G5³Õ³ÒÒ“°¢Öç6WE¦ööÒ„ÖF‚æÖ‚†ÖævWE¦ööÓòâ‚’ÇÂ”ä•D”ÅôÔõ¤ôôÒÂ”ä•D”ÅôÔõ¤ôôÒ’“°¢Ò“°¢&WGW&ã°¢Ð ¢6öç7B&÷VæG2ÒæWrÖ2äÆDÆæt&÷VæG2‚“°¢6ö÷&G2æf÷$V6‚‚…¶ÆBÂÆæuÒ’Óâ&÷VæG2æW‡FVæB‡²ÆBÂÆærÒ’“°¢'Vå&öw&ÖÖF–4Ö÷fR‚‚’Óâ°¢Öæf—D&÷VæG2†&÷VæG2ÂcB“°¢Ö2æWfVçBæFDÆ—7FVæW$öæ6R†ÖÂ&&÷VæG5ö6†ævVB"Â‚’Óâ°¢–b‚†ÖævWE¦ööÓòâ‚’ÇÂ’ÂR’Öç6WE¦ööÒƒR“°¢–b‚†ÖævWE¦ööÓòâ‚’ÇÂ’âÔõ5E$TUEôdô5U5õ¤ôôÒ’Öç6WE¦ööÒ„Ôõ5E$TUEôdô5U5õ¤ôôÒ“°¢Ò“°¢Ò“°¢ÒÂ¶f—D7F—fT¶W’Âf—DVæ&ÆVBÂf—EÆ6W2Â'Vå&öw&ÖÖF–4Ö÷fRÂ6VÆV7FVD–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢6öç7BÖ2ÒÖ5&Vbæ7W'&VçC°¢–b‚ÖÇÂÖ2ÇÂÆöE7FFRÓÒ'&VG’"’&WGW&âVæFVf–æVC° ¢6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&Vbæ7W'&VçBÒ6ÆV$vöövÆTÖ'F–f7G2€¢6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&Vbæ7W'&VçBÀ¢‡öÇ–Æ–æR’ÓâöÇ–Æ–æSòç6WDÖòâ†çVÆÂ’À¢“° ¢6öç7B&÷WFUF‚Ò6öÆÆV7F–öå&÷WFSòç&÷WFUF‚ÇÂµÓ°¢–b‡&÷WFUF‚æÆVæwF‚Â"’&WGW&âVæFVf–æVC° ¢6öç7B7G–ÆRÒvWD6öÆÆV7F–öå&÷WFU7G–ÆR†6öÆÆV7F–öå&÷WFR“°¢6öç7B&÷WFTÖWG&–72ÒvWE¦ööÕ&÷WFTÖWG&–72†Ö&¶W%&VæFW%¦ööÒ“°¢6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&Vbæ7W'&VçBÒ7&VFT'&æFVE&÷WFUöÇ–Æ–æW2†Ö2ÂÖÂ&÷WFUF‚Â°¢Ö&–VçD6öÆ÷#¢7G–ÆRæÖ&–VçD6öÆ÷"À¢Ö&–VçD÷6—G“¢7G–ÆRæÖ&–VçD÷6—G’À¢Ö&–VçE7G&ö¶UvV–v‡C¢&÷WFTÖWG&–72æÖ&–VçE7G&ö¶UvV–v‡BÀ¢÷fW&Æ6öÆ÷#¢7G–ÆRæ÷fW&Æ6öÆ÷"À¢÷fW&Æ÷6—G“¢7G–ÆRæ÷fW&Æ÷6—G’À¢÷fW&Æ7G&ö¶UvV–v‡C¢&÷WFTÖWG&–72æ÷fW&Æ7G&ö¶UvV–v‡BÀ¢Ö–ä6öÆ÷#¢7G–ÆRæÖ–ä6öÆ÷"À¢Ö–ä÷6—G“¢7G–ÆRæÖ–ä÷6—G’À¢7G&ö¶UvV–v‡C¢&÷WFTÖWG&–72ç7G&ö¶UvV–v‡BÀ¢F÷D6öÆ÷#¢7G–ÆRæF÷D6öÆ÷"À¢F÷E66ÆS¢7G–ÆRæ—4F6†VBò&÷WFTÖWG&–72æF6†VDF÷E66ÆR¢&÷WFTÖWG&–72æF÷E66ÆRÀ¢&WVC¢7G–ÆRæ—4F6†VBò&÷WFTÖWG&–72æF6†VE&WVB¢&÷WFTÖWG&–72ç&WVBÀ¢Ò“° ¢&WGW&â‚’Óâ°¢6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&Vbæ7W'&VçBÒ6ÆV$vöövÆTÖ'F–f7G2€¢6öÆÆV7F–öå&÷WFUöÇ–Æ–æW5&Vbæ7W'&VçBÀ¢‡öÇ–Æ–æR’ÓâöÇ–Æ–æSòç6WDÖòâ†çVÆÂ’À¢“°¢Ó°¢ÒÂ¶6öÆÆV7F–öå&÷WFRÂÆöE7FFRÂÖ&¶W%&VæFW%¦ööÕÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7BÖÒÖ&Vbæ7W'&VçC°¢6öç7BÖ2ÒÖ5&Vbæ7W'&VçC°¢–b‚ÖÇÂÖ2ÇÂÆöE7FFRÓÒ'&VG’"’&WGW&ã° ¢6öç7B&Vv—7G'’ÒÖ&¶W%&Vv—7G'•&Vbæ7W'&VçC°¢6öç7BæW‡D¶W—2ÒæWr6WB‚“°¢ÆWB&VÆV6VDÖ&¶W$6÷VçBÒ°¢6öç7B6åW6TGfæ6VDÖ&¶W'2Ò&ööÆVâ€¢Ö2æÖ&¶W#òäGfæ6VDÖ&¶W$VÆVÖVçBb`¢†–×÷'BæÖWFæVçbåd•DUôtôôtÄUôÔô”BÇÂ–×÷'BæÖWFæVçbåd•DUôtôôtÄUôÔ5ôÔô”B’À¢“° ¢6öç7B6öÆÆV7F–öå7F÷–G2ÒæWr6WB‚†6öÆÆV7F–öå&÷WFSòç7F÷2ÇÂµÒ’æÖ‚‡7F÷’Óâ7F÷æ–B’“°¢6öç7B&÷WFU7F÷çVÖ&W$'”–BÒæWrÖ‚†6öÆÆV7F–öå&÷WFSòç7F÷2ÇÂµÒ’æÖ‚‡7F÷Â–æFW‚’Óâ·7F÷æ–BÂ–æFW‚²Ò’“° ¢6öç7BWFFTÖ&¶W"Ò†Ö&¶W"Â²÷6—F–öâÂ6öçFVçBÂF—FÆRÂ–6öâÂ¤–æFW‚ÒÒ’Óâ°¢–b†6åW6TGfæ6VDÖ&¶W'2bb&6öçFVçB"–âÖ&¶W"’°¢Ö&¶W"ç÷6—F–öâÒ÷6—F–öã°¢òò¶VWF†R&÷f–FW"Ö÷væVBÖ&¶W"&ö÷B7F&ÆRâ&WÆ6–ærGfæ6VDÖ&¶W ¢òò6öçFVçBöâWfW'’6VÆV7F–öâöf–ÇFW"726âÖöÖVçF&–Ç’FWF6‚F†P¢òò&ö¦V7FVBVÆVÖVçBv†–ÆRvöövÆRÖ2—2Ö÷f–ær—Bà¢–b†Ö&¶W"æ6öçFVçBÓÒ6öçFVçB’Ö&¶W"æ6öçFVçBÒ6öçFVçC°¢Ö&¶W"çF—FÆRÒF—FÆS°¢Ö&¶W"ç¤–æFW‚Ò¤–æFWƒ°¢Ö&¶W"æÖÒÖ°¢&WGW&ã°¢Ð¢Ö&¶W"ç6WE÷6—F–öãòâ‡÷6—F–öâ“°¢Ö&¶W"ç6WEF—FÆSòâ‡F—FÆR“°¢Ö&¶W"ç6WD–6öãòâ†–6öâ“°¢Ö&¶W"ç6WE¤–æFWƒòâ‡¤–æFW‚“°¢Ö&¶W"ç6WDÖòâ†Ö“°¢Ó° ¢6öç7B÷Vä6ÇW7FW"Ò†—FVÒ’Óâ°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBæöä6ÇW7FW$÷Vãòâ†—FVÒ“°¢6öç7B6ÇW7FW%Æ6W2Ò'&’æ—4'&’†—FVÓòçÆ6W2’ò—FVÒçÆ6W2¢µÓ°¢6öç7B&÷VæG2ÒæWrÖ2äÆDÆæt&÷VæG2‚“°¢6ÇW7FW%Æ6W2æÖ‚‡Æ6R’ÓâvWEÆ6T6ö÷&G2‡Æ6R’’æf–ÇFW"„&ööÆVâ’æf÷$V6‚‚…¶ÆBÂÆæuÒ’Óâ&÷VæG2æW‡FVæB‡²ÆBÂÆærÒ’“°¢–b†&÷VæG2æ—4V×G’‚’’&WGW&ã°¢'Vå&öw&ÖÖF–4Ö÷fR‚‚’Óâ°¢Öæf—D&÷VæG2†&÷VæG2ÂcB“°¢Ö2æWfVçBæFDÆ—7FVæW$öæ6R†ÖÂ&&÷VæG5ö6†ævVB"Â‚’Óâ°¢–b‚†ÖævWE¦ööÓòâ‚’ÇÂ’âÔõ5E$TUEôdô5U5õ¤ôôÒ’Öç6WE¦ööÒ„Ôõ5E$TUEôdô5U5õ¤ôôÒ“°¢Ò“°¢Ò“°¢Ó° ¢Ö—FV×2æf÷$V6‚‚†—FVÒ’Óâ°¢–b†—FVÒçG—RÓÓÒ&6ÇW7FW""’°¢6öç7B6ÇW7FW%Æ6W2Ò'&’æ—4'&’†—FVÒçÆ6W2’ò—FVÒçÆ6W2¢µÓ°¢–b†6öÆÆV7F–öå7F÷–G2ç6—¦Rbb6ÇW7FW%Æ6W2ç6öÖR‚‡Æ6R’Óâ6öÆÆV7F–öå7F÷–G2æ†2‡Æ6Ræ–B’’’&WGW&ã°¢6öç7B¶W’Ò6ÇW7FW#¢G¶—FVÒæ–BÇÂ—FVÒæ6ö÷&G3òæ¦ö–â‚#¢"—Ö°¢æW‡D¶W—2æFB†¶W’“°¢6öç7BW†—7F–ærÒ&Vv—7G'’ævWB†¶W’“°¢6öç7BVÆVÖVçBÒW†—7F–æsòæVÆVÖVçBÇÂFö7VÖVçBæ7&VFTVÆVÖVçB‚&'WGFöâ"“°¢–b‚W†—7F–ær’VÆVÖVçBçG—RÒ&'WGFöâ#°¢VÆVÖVçBæ6Æ74æÖRÒGÖÖÖ6ÇW7FW"G¶—FVÒæ6÷VçBâC’ò&—2ÖÆ&vR"¢"'Ö°¢VÆVÖVçBæ–ææW$…DÔÂÒÇ7ãâG¶—FVÒæ6÷VçBâ“’ò#“’²"¢—FVÒæ6÷VçGÓÂ÷7ãæ°¢VÆVÖVçBç6WDGG&–'WFR‚&&–ÖÆ&VÂ"Â÷VâG¶—FVÒæ6÷VçGÒÆ6W2æV&'–“°¢Ç•¦ööÔÖ&¶W%7G–ÆR†VÆVÖVçBÂÖ&¶W%&VæFW%¦ööÒÂ²6ÇW7FW$6÷VçC¢—FVÒæ6÷VçBÒ“°¢6öç7BÖ&¶W$÷F–öç2Ò°¢÷6—F–öã¢²ÆC¢—FVÒæ6ö÷&G5³ÒÂÆæs¢—FVÒæ6ö÷&G5³ÒÒÀ¢6öçFVçC¢VÆVÖVçBÀ¢F—FÆS¢G¶—FVÒæ6÷VçGÒÆ6W2æV&'–À¢–6öã¢ÆVv7”F÷vçF÷vä6ÇW7FW$–6öâ†Ö2Â—FVÒæ6÷VçBÂÖ&¶W%&VæFW%¦ööÒ’À¢¤–æFWƒ¢SÀ¢Ó°¢–b†W†—7F–ær’°¢W†—7F–æræ7W'&VçD—FVÒÒ—FVÓ°¢WFFTÖ&¶W"†W†—7F–æræÖ&¶W"ÂÖ&¶W$÷F–öç2“°¢ÒVÇ6R°¢6öç7BVçG'’Ò²7W'&VçD—FVÓ¢—FVÒÂG—S¢&6ÇW7FW""ÂÖ&¶W#¢çVÆÂÂVÆVÖVçBÓ°¢VÆVÖVçBæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â‚’Óâ÷Vä6ÇW7FW"†VçG'’æ7W'&VçD—FVÒ’“°¢VçG'’æÖ&¶W"Ò7&VFTF÷vçF÷väÖ&¶W"‡°¢Ö2À¢ÖÀ¢ââæÖ&¶W$÷F–öç2À¢öä6Æ–6³¢‚’Óâ÷Vä6ÇW7FW"†VçG'’æ7W'&VçD—FVÒ’À¢&VfW$Gfæ6VC¢6åW6TGfæ6VDÖ&¶W'2À¢Ò“°¢&Vv—7G'’ç6WB†¶W’ÂVçG'’“°¢Ð¢&WGW&ã°¢Ð ¢6öç7BÆ6RÒ&÷WFU7F÷çVÖ&W$'”–Bæ†2†—FVÒçÆ6Sòæ–B¢ò²ââæ—FVÒçÆ6RÂ&÷WFU7F÷çVÖ&W#¢&÷WFU7F÷çVÖ&W$'”–BævWB†—FVÒçÆ6Ræ–B’Ð¢¢—FVÒçÆ6S°¢6öç7BÖ&¶W%&V6÷&BÒvWD6æöæ–6ÄÖ&¶W%&V6÷&B‡Æ6RÂ²VF–Væ6TÖöFS¢Æ6SòæVF–Væ6TÖöFRÇÂÆ6SòæÖöFRÒ“°¢6öç7B6ö÷&G2ÒÖ&¶W%&V6÷&Bò¶Ö&¶W%&V6÷&BæÆF—GVFRÂÖ&¶W%&V6÷&BæÆöæv—GVFUÒ¢çVÆÃ°¢–b‚Ö&¶W%&V6÷&BÇÂ6ö÷&G2’°¢–b†–×÷'BæÖWFæVçbäDUb’6öç6öÆRçv&â‚%´F÷vçF÷vâW&·5Ò–çfÆ–BÖ6ö÷&F–æFW2"Â²–C¢Æ6Sòæ–BÂæÖS¢Æ6SòææÖRÒ“°¢&WGW&ã°¢Ð¢6öç7B¶W’Ò–ã¢G¶Ö&¶W%&V6÷&BæÖ&¶W$–GÖ°¢6öç7BÖ&¶W%6VÆV7FVBÒ—56VÆV7FVDÖ&¶W%Æ6R‡Æ6RÂ6VÆV7FVD–B“°¢æW‡D¶W—2æFB†¶W’“° ¢6öç7BW†—7F–ærÒ&Vv—7G'’ævWB†¶W’“°¢6öç7Bw&W"ÒW†—7F–æsòæVÆVÖVçBÇÂFö7VÖVçBæ7&VFTVÆVÖVçB‚&F—b"“°¢w&W"æ6Æ74æÖRÒ&GÖvöövÆRÖÖÖÖ&¶W"×6†VÆÂ#°¢w&W"æFF6WBæÖ&¶W$VçF—G”–BÒÖ&¶W%&V6÷&BæÖ&¶W$–C°¢w&W"æFF6WBæVçF—G”–BÒÖ&¶W%&V6÷&BæVçF—G”–C°¢w&W"æFF6WBç6÷W&6UfW'6–öâÒÖ&¶W%&V6÷&Bç6÷W&6UfW'6–öã°¢Ç•¦ööÔÖ&¶W%7G–ÆR‡w&W"ÂÖ&¶W%&VæFW%¦ööÒÂ²6VÆV7FVC¢Ö&¶W%6VÆV7FVBÒ“°¢w&W"æ–ææW$…DÔÂÒÖ–ä'WGFöä‡FÖÂ‡°¢Æ6RÀ¢–ã¢&W6öÇfTVçF—G•–â‡Æ6R’À¢&–Æ&VÃ¢—4ÆVvVæG4ÖÆ6R‡Æ6R’ÇÂvWDÆVvVæG4Æ—7F–ær‡Æ6R’ò÷VâG·Æ6RææÖWÒÂÆVvVæG2&VÂW7FFRÆ—7F–æv¢÷VâG·Æ6RææÖWÖÀ¢6VÆV7FVC¢Ö&¶W%6VÆV7FVBÀ¢VÇ6–æs¢Ö&¶W%&V6÷&BæÖ&¶W$–BÓÓÒVÇ6–æu–ä–BÇÂÆ6Ræ–BÓÓÒVÇ6–æu–ä–BÀ¢6Æ76W3¢G¶—4WfVçDVçF—G’‡Æ6R’ò&GÖÆ—fR×–âÒÖWfVçB"¢"'ÒG¶—4†”†÷W$VçF—G’‡Æ6R’ò&GÖÆ—fR×–âÒÖ†’Ö†÷W""¢"'ÒG¶—46×–väVçF—G’‡Æ6R’ò&GÖÆ—fR×–âÒÖ6×–vâ"¢"'ÒG¶—4ÆVvVæG4ÖÆ6R‡Æ6R’ÇÂvWDÆVvVæG4Æ—7F–ær‡Æ6R’ò&GÖÆ—fR×–âÒÖÆVvVæG2GÖÆ—fR×–âÒÖÆVvVæG2ÖÆövò"¢"'ÒG¶—4–ä¶–æDVçF—G’‡Æ6R’ò&GÖÆ—fR×–âÒÖ–æ¶–æBGÖÆ—fR×–âÒÖ–æ¶–æBÖÆövò"¢"'ÒG¶—5&VçFÄVçF—G’‡Æ6R’ò&GÖÆ—fR×–âÒ×&VçFÂ"¢"'ÒG¶6öÆÆV7F–öå7F÷–G2ç6—¦Rbb6öÆÆV7F–öå7F÷–G2æ†2‡Æ6Ræ–B’ò&—2Ö×WFVB"¢"'ÖÀ¢¦ööÓ¢Ö&¶W%&VæFW%¦ööÒÀ¢Ò“°¢6öç7B'WGFöâÒw&W"çVW'•6VÆV7F÷"‚"æGÖÖ×–â"“°¢'WGFöãòç6WDGG&–'WFR‚&FFÖÖ&¶W"ÖVçF—G’Ö–B"ÂÖ&¶W%&V6÷&BæÖ&¶W$–B“°¢'WGFöãòç6WDGG&–'WFR‚&FFÖVçF—G’Ö–B"ÂÖ&¶W%&V6÷&BæVçF—G”–B“°¢'WGFöãòæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢Ö&µW6W$æf–vFVB‚“°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBæöå6VÆV7Còâ‡Æ6R“°¢Ò“°¢'WGFöãòæFDWfVçDÆ—7FVæW"‚&F&Æ6Æ–6²"Â†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢Ö&µW6W$æf–vFVB‚“°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBæöå6VÆV7DæV&W7DÆVvVæG3òâ‡Æ6R“°¢Ò“° ¢6öç7BÖ&¶W$÷F–öç2Ò°¢÷6—F–öã¢²ÆC¢6ö÷&G5³ÒÂÆæs¢6ö÷&G5³ÒÒÀ¢6öçFVçC¢w&W"À¢F—FÆS¢Æ6RææÖRÀ¢–6öã¢ÆVv7”F÷vçF÷väÖ&¶W$–6öâ†Ö2ÂÆ6RÂÖ&¶W%6VÆV7FVBÂÖ&¶W%&VæFW%¦ööÒ’À¢¤–æFWƒ¢Ö&¶W%6VÆV7FV@¢ò ¢¢—4ÆVvVæG4ÖÆ6R‡Æ6R’ÇÂvWDÆVvVæG4Æ—7F–ær‡Æ6R’ÇÂ—4–ä¶–æDVçF—G’‡Æ6R¢òsS ¢¢À¢Ó°¢–b†W†—7F–ær’°¢W†—7F–æræ7W'&VçEÆ6RÒÆ6S°¢WFFTÖ&¶W"†W†—7F–æræÖ&¶W"ÂÖ&¶W$÷F–öç2“°¢ÒVÇ6R°¢6öç7BVçG'’Ò²7W'&VçEÆ6S¢Æ6RÂG—S¢'–â"ÂÖ&¶W#¢çVÆÂÂVÆVÖVçC¢w&W"Ó°¢VçG'’æÖ&¶W"Ò7&VFTF÷vçF÷väÖ&¶W"‡°¢Ö2À¢ÖÀ¢ââæÖ&¶W$÷F–öç2À¢öä6Æ–6³¢‚’Óâ°¢Ö&µW6W$æf–vFVB‚“°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBæöå6VÆV7Còâ†VçG'’æ7W'&VçEÆ6R“°¢ÒÀ¢&VfW$Gfæ6VC¢6åW6TGfæ6VDÖ&¶W'2À¢Ò“°¢&Vv—7G'’ç6WB†¶W’ÂVçG'’“°¢Ð¢Ò“° ¢6öç7B&V6öæ6–Æ–F–öâÒ&V6öæ6–ÆTÖ&¶W$–G2‡&Vv—7G'’æ¶W—2‚’ÂæW‡D¶W—2“°¢&V6öæ6–Æ–F–öâç&VÆV6Ræf÷$V6‚‚†¶W’’Óâ°¢6öç7BVçG'’Ò&Vv—7G'’ævWB†¶W’“°¢–b‚VçG'’’&WGW&ã°¢&VÖ÷fTvöövÆTÖÖ&¶W"†VçG'’æÖ&¶W"“°¢&Vv—7G'’æFVÆWFR†¶W’“°¢&VÆV6VDÖ&¶W$6÷VçB³Ò°¢Ò“°¢6öçF–æW%&Vbæ7W'&VçCòç6WDGG&–'WFR‚&FFÖÖ&¶W"Ö6÷VçB"Â7G&–ær‡&Vv—7G'’ç6—¦R’“°¢6öçF–æW%&Vbæ7W'&VçCòç6WDGG&–'WFR‚&FF×&W7VÇBÖ—FVÒÖ6÷VçB"Â7G&–ær†Ö—FV×2æÆVæwF‚’“° ¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"bb–×÷'BæÖWFæVçbäDUb’°¢v–æF÷råõôEôÔôÔ$´U%ôÄ”dT5”4ÄUõòÒ°¢Ö÷VçFVDÖ&¶W$6÷VçC¢&Vv—7G'’ç6—¦RÀ¢Ö&¶W%&Vv—7G'•6—¦S¢&Vv—7G'’ç6—¦RÀ¢&VÆV6VDÖ&¶W$6÷VçBÀ¢&WW6VDÖ&¶W$6÷VçC¢&V6öæ6–Æ–F–öâæ¶VWæÆVæwF‚À¢7&VFVDÖ&¶W$6÷VçC¢&V6öæ6–Æ–F–öâæ7&VFRæÆVæwF‚À¢&W7VÇD—FVÔ6÷VçC¢Ö—FV×2æÆVæwF‚À¢WFFVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢Ó°¢6öç7Bf—6–&ÆTÆ–Ö—BÒv–æF÷ræ–ææW%v–GF‚ÃÒscròR¢#S°¢–b‡&Vv—7G'’ç6—¦Râf—6–&ÆTÆ–Ö—B’°¢6öç6öÆRçv&â‚%¶Ö×6V&6…ÒÖ÷VçFVBÖ&¶W"6÷VçBW†6VVG26"Â&Vv—7G'’ç6—¦R“°¢Ð¢Ð¢ÒÂ¶6öÆÆV7F–öå&÷WFRÂÆöE7FFRÂÖ—FV×2ÂÖ&¶W%&VæFW%¦ööÒÂVÇ6–æu–ä–BÂ'Vå&öw&ÖÖF–4Ö÷fRÂ6VÆV7FVD–BÂÖ&µW6W$æf–vFVEÒ“° ¢W6TVffV7B‚‚’Óâ‚’Óâ°¢Ö&¶W%&Vv—7G'•&Vbæ7W'&VçBæf÷$V6‚‚†VçG'’’Óâ&VÖ÷fTvöövÆTÖÖ&¶W"†VçG'’æÖ&¶W"’“°¢Ö&¶W%&Vv—7G'•&Vbæ7W'&VçBæ6ÆV"‚“°¢6öçF–æW%&Vbæ7W'&VçCòç6WDGG&–'WFR‚&FFÖÖ&¶W"Ö6÷VçB"Â#"“°¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"bb–×÷'BæÖWFæVçbäDUb’°¢v–æF÷råõôEôÔôÔ$´U%ôÄ”dT5”4ÄUõòÒ²Ö÷VçFVDÖ&¶W$6÷VçC¢ÂÖ&¶W%&Vv—7G'•6—¦S¢Â&VÆV6VDÖ&¶W$6÷VçC¢Â&W7VÇD—FVÔ6÷VçC¢ÂWFFVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’Ó°¢Ð¢ÒÂµÒ“° ¢6öç7BW'&÷%F—FÆRÒ%F†RÖ—2FV×÷&&–Ç’Væf–Æ&ÆRâ#°¢6öç7BW'&÷$6÷’Ò%–÷R6â7F–ÆÂ'&÷w6RæV&'’W&·2æBWfVçG2v†–ÆRvR&V6öææV7B—Bâ#°¢6öç7BF–væ÷7F–46÷’Ò–×÷'BæÖWFæVçbäDU`¢òFWfVÆ÷W"FWF–Ã¢G¶ÆöDW'&÷"ÇÂ'Væ¶æ÷vâÖÆöFW"W'&÷"'Òâ6†V6²F†R’¶W’ÂÖ2¦f67&—B’Â&–ÆÆ–ærÂ&VfW'&W'2ÂæBÖ”Bæ ¢¢"#° ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×6†VÆÂ‚ÖgVÆÂrÖgVÆÂ#à¢ÆF—b&Vc×¶6öçF–æW%&VgÒ6Æ74æÖSÒ&GÖvöövÆRÖÖÖ6çf2‚ÖgVÆÂrÖgVÆÂ"&öÆSÒ&Æ–6F–öâ"&–ÖÆ&VÃÒ$F÷vçF÷vâW7F–âÖ"óà¢ÆF—b6Æ74æÖSÒ'7"ÖöæÇ’"&öÆSÒ&w&÷W"&–ÖÆ&VÃÒ%f—6–&ÆRÖÆ6W2#à¢¶Ö—FV×2æf–ÇFW"‚†—FVÒ’Óâ—FVÒçG—RÓÒ&6ÇW7FW""bb—FVÒçÆ6Sòæ–B’æÖ‚†—FVÒ’Óâ€¢Æ'WGFöà¢¶W“×¶66W76–&ÆRÖÖ&¶W"ÒG¶—FVÒçÆ6Ræ–GÖÐ¢G—SÒ&'WGFöâ ¢F$–æFWƒ×²ÓÐ¢FFÖ66W76–&ÆRÖÖ&¶W"ÖVçF—G’Ö–C×¶—FVÒçÆ6Ræ–GÐ¢&–ÖÆ&VÃ×¶÷VâG¶—FVÒçÆ6RææÖRÇÂ&ÖÆ6R'ÖÐ¢&–×&W76VC×¶—FVÒçÆ6Ræ–BÓÓÒ6VÆV7FVD–GÐ¢öåö–çFW$F÷vã×²†WfVçB’ÓâWfVçBç7F÷&÷vF–öâ‚—Ð¢öä6Æ–6³×²†WfVçB’Óâ°¢WfVçBç7F÷&÷vF–öâ‚“°¢Ö&¶W$7F–öä†æFÆW'5&Vbæ7W'&VçBæöå6VÆV7Còâ†—FVÒçÆ6R“°¢×Ð¢à¢÷Vâ¶—FVÒçÆ6RææÖRÇÂ&ÖÆ6R'Ð¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢¶ÆöE7FFRÓÓÒ&ÆöF–ær"bb€¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFR"&öÆSÒ'7FGW2#à¢Ç7ãäÆöF–ærF÷vçF÷vâÖââãÂ÷7ãà¢ÂöF—cà¢—Ð¢¶ÆöE7FFRÓÓÒ&W'&÷""bb€¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRGÖvöövÆRÖÖ×7FFRÖW'&÷""&öÆSÒ&ÆW'B#à¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRÖ6&B#à¢Ç7G&öæsç¶W'&÷%F—FÆWÓÂ÷7G&öæsà¢Ç7ãç¶W'&÷$6÷—ÓÂ÷7ãà¢¶F–væ÷7F–46÷’òÇ6ÖÆÃç¶F–væ÷7F–46÷—ÓÂ÷6ÖÆÃâ¢çVÆÇÐ¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRÖ7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâv–æF÷ræÆö6F–öâç&VÆöB‚—Óå&WG'’ÖÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶öä'&÷w6UW&·7Óä'&÷w6RW&·3Âö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢—Ð¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâvöövÆTÖf–ÇW&U7FFR‚’°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×6†VÆÂ‚ÖgVÆÂrÖgVÆÂ#à¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖÖ6çf2‚ÖgVÆÂrÖgVÆÂ"&öÆSÒ&Æ–6F–öâ"&–ÖÆ&VÃÒ$F÷vçF÷vâW7F–âÖ"óà¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRGÖvöövÆRÖÖ×7FFRÖW'&÷""&öÆSÒ&ÆW'B#à¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRÖ6&B#à¢Ç7G&öæsåF†RÖ—2FV×÷&&–Ç’Væf–Æ&ÆRãÂ÷7G&öæsà¢Ç7ãå–÷R6â7F–ÆÂ'&÷w6RæV&'’W&·2æBWfVçG2v†–ÆRvR&V6öææV7B—BãÂ÷7ãà¢¶–×÷'BæÖWFæVçbäDUbòÇ6ÖÆÃäFWfVÆ÷W"FWF–Ã¢fW&–g’F†RÖ2¦f67&—B’Â&–ÆÆ–ærÂ&VfW'&W'2Â’¶W’ÂæBÖ”BãÂ÷6ÖÆÃâ¢çVÆÇÐ¢ÆF—b6Æ74æÖSÒ&GÖvöövÆRÖÖ×7FFRÖ7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâv–æF÷ræÆö6F–öâç&VÆöB‚—Óå&WG'’ÖÂö'WGFöãà¢Æ‡&VcÒ"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÕW&·2#ä'&÷w6RW&·3Âöà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà¢“°§Ð ¦6Æ72vöövÆTÖW'&÷$&÷VæF'’W‡FVæG26ö×öæVçB°¢6öç7G'V7F÷"‡&÷2’°¢7WW"‡&÷2“°¢F†—2ç7FFRÒ²†4W'&÷#¢fÇ6RÓ°¢Ð ¢7FF–2vWDFW&—fVE7FFTg&öÔW'&÷"‚’°¢&WGW&â²†4W'&÷#¢G'VRÓ°¢Ð ¢6ö×öæVçDF–D6F6‚†W'&÷"’°¢–b†–×÷'BæÖWFæVçbäDUb’°¢6öç6öÆRçv&â‚%´F÷vçF÷vâW&·5ÒvöövÆRÖ2&VæFW"f–ÆVB"ÂW'&÷"“°¢Ð¢Ð ¢&VæFW"‚’°¢–b‡F†—2ç7FFRæ†4W'&÷"’&WGW&âÄvöövÆTÖf–ÇW&U7FFRóã°¢&WGW&âF†—2ç&÷2æ6†–ÆG&Vã°¢Ð§Ð ¦gVæ7F–öâG&–vvW$†F–2‚’°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&ã°¢v–æF÷rææf–vF÷#òçf–'&FSòâƒ"“°§Ð ¦gVæ7F–öâvWE&–Ä—FVÔf÷$Ö7FFR‡²f–ÇFW"Â6öÆÆV7F–öâÂ&ö×BÒ’°¢6öç7B&–Ç2Ò²ââå$”Ô%•õ4T$4…ô”åDTåEõ$”ÂÂââå4T4ôäD%•õ4T$4…ô”åDTåEõ$”ÅÓ°¢6öç7Bæ÷&ÖÆ—¦VE&ö×BÒ7G&–ær‡&ö×BÇÂ""’çG&–Ò‚’çFôÆ÷vW$66R‚“°¢–b†6öÆÆV7F–öâ’&WGW&â&–Ç2æf–æB‚†—FVÒ’Óâ—FVÒæ6öÆÆV7F–öâÓÓÒ6öÆÆV7F–öâ’ÇÂçVÆÃ°¢6öç7B&ö×D÷væW"Òæ÷&ÖÆ—¦VE&ö×@¢ò&–Ç2æf–æB‚†—FVÒ’Óâ7G&–ær†—FVÒç&ö×BÇÂ""’çG&–Ò‚’çFôÆ÷vW$66R‚’ÓÓÒæ÷&ÖÆ—¦VE&ö×B¢¢çVÆÃ°¢6öç7Bf–ÇFW$ÖF6‚Ò&–Ç2æf–æB‚†—FVÒ’Óâ—FVÒæ6öÆÆV7F–öâbb—FVÒæf–ÇFW"ÓÓÒf–ÇFW"’ÇÂçVÆÃ°¢–b‡&ö×D÷væW#òæ6öÆÆV7F–öâ’&WGW&âf–ÇFW$ÖF6ƒ°¢–b‡&ö×D÷væW"bbf–ÇFW$ÖF6‚bb&ö×D÷væW"æf–ÇFW"ÓÒf–ÇFW$ÖF6‚æf–ÇFW"’&WGW&âf–ÇFW$ÖF6ƒ°¢&WGW&â&ö×D÷væW"ÇÂf–ÇFW$ÖF6ƒ°§Ð ¦gVæ7F–öâv÷&¶fÆ÷tVçF—G•G—R‡Æ6R’°¢&WGW&â7G&–ær‡Æ6SòçG—RÇÂÆ6Sòæ6FVv÷'’ÇÂÆ6Sòç&sòçG—RÇÂ'Æ6R"’çFôÆ÷vW$66R‚’ç&WÆ6R‚õµæ×£Ó•òÕÒ²örÂ%ò"“°§Ð ¦gVæ7F–öâÖ6V&6„6öç6öÆR‡°¢ÖöFRÀ¢VW'’À¢Æ6V†öÆFW"À¢7F—fT–çFVçBÀ¢7F—fUF–ÖRÀ¢7F—fU&F—W2À¢7F—fTf–ÇFW"À¢7F—fT6öÆÆV7F–öâÀ¢&W7VÇD6÷VçBÀ¢f—6–&ÆU&W7VÇD–G2ÒµÒÀ¢&WVW7E7FGW2Ò&–FÆR"À¢Æ7EG&–vvW"Ò""À¢6FÆöu7FFRÀ¢öä6FÆöu&W7VÇE6VÆV7BÀ¢–çWE&VbÀ¢öåVW'”6†ævRÀ¢öå7V&Ö—BÀ¢öä6ÆV"À¢öä–çFVçE6VÆV7BÀ¢öäf–ÇFW%6VÆV7BÀ¢öåF–ÖU6VÆV7BÀ¢öå&F—W56VÆV7BÀ¢öä6öÆÆV7F–öå6VÆV7BÀ¢öå&ö×E6VÆV7BÀ¢öäÖöFT6†ævRÀ¢—46öÆÆ6VBÒfÇ6RÀ¢öä6öÆÆ6RÀ¢öäW‡æBÀ¢†5F÷Ö&6²ÒfÇ6RÀ§Ò’°¢6öç7B¶Ö÷&T÷VâÂ6WDÖ÷&T÷VåÒÒW6U7FFR†fÇ6R“°¢6öç7B6öç6öÆUw&&VbÒW6U&Vb†çVÆÂ“°¢6öç7B6öç6öÆUæVÅ&VbÒW6U&Vb†çVÆÂ“°¢6öç7B·f–Ww÷'Ev–GF‚Â6WEf–Ww÷'Ev–GF…ÒÒW6U7FFR‚‚’Óâ€¢G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"ò3“2¢v–æF÷ræ–ææW%v–GF€¢’“°¢6öç7B7F—fU6V&6„Æ&VÂÒVW'’ÇÂ7F—fTf–ÇFW"ÇÂ$ÆÂ#°¢6öç7B6VÆV7FVD–çFVçDææ÷Væ6VÖVçBÒ—56–ævÆU6VÆV7E6V&6„–çFVçDf–ÇFW"†7F—fTf–ÇFW"¢òG¶vWD6æöæ–6Å6V&6„–çFVçDf–ÇFW"†7F—fTf–ÇFW"—Ò6VÆV7FVBâG·&W7VÇD6÷VçGÒ&W7VÇG26†÷vâæ ¢¢"#°¢6öç7B6†÷t6FÆöu&W7VÇG2Ò&ööÆVâ€¢VW'’b`¢6FÆöu7FFSòçVW'’ÓÓÒVW'’b`¢²&ÆöF–ær"Â'&W6öÇfVB%Òæ–æ6ÇVFW2†6FÆöu7FFSòç7FGW2’À¢“°¢6öç7B6FÆöu&W7VÇG4–BÒ&GÖÖ×6V&6‚×&W7VÇG2#°¢6öç7B6FÆöu&W7VÇDÆ–Ö—BÒf–Ww÷'Ev–GF‚ÃÒS#òR¢ƒ°¢6öç7B†5&W6öÇfVDÖ66÷RÒ&WVW7E7FGW2ÓÓÒ'7V66W72"bb&ööÆVâ†Æ7EG&–vvW"“°¢6öç7Bf—6–&ÆTÖ&W7VÇD–G2ÒæWr6WB‡f—6–&ÆU&W7VÇD–G2æÖ‚‡fÇVR’Óâ7G&–ær‡fÇVRÇÂ""’’æf–ÇFW"„&ööÆVâ’“°¢ÆWB&VÖ–æ–æt6FÆöu&W7VÇG2Ò6FÆöu&W7VÇDÆ–Ö—C°¢6öç7Bf—6–&ÆT6FÆötw&÷W2Ò†6FÆöu7FFSòæw&÷W2ÇÂµÒ’ç&VGV6R‚†w&÷W2Âw&÷W’Óâ°¢–b‡&VÖ–æ–æt6FÆöu&W7VÇG2ÃÒ’&WGW&âw&÷W3°¢6öç7B66÷VE&W7VÇG2Ò†5&W6öÇfVDÖ66÷P¢ò†w&÷Wç&W7VÇG2ÇÂµÒ’æf–ÇFW"‚‡&W7VÇB’Óâ€¢&ööÆVâ‡&W7VÇBç&÷WFR’ÇÀ¢·&W7VÇBæ–BÂ&W7VÇBæVçF—G”–BÂ&W7VÇBæÆ–æ¶VDVçF—G”–EÐ¢æf–ÇFW"„&ööÆVâ¢ç6öÖR‚†–B’Óâf—6–&ÆTÖ&W7VÇD–G2æ†2…7G&–ær†–B’’¢’¢¢†w&÷Wç&W7VÇG2ÇÂµÒ“°¢6öç7B&W7VÇG2Ò66÷VE&W7VÇG2ç6Æ–6RƒÂ&VÖ–æ–æt6FÆöu&W7VÇG2“°¢–b‚&W7VÇG2æÆVæwF‚’&WGW&âw&÷W3°¢&VÖ–æ–æt6FÆöu&W7VÇG2ÓÒ&W7VÇG2æÆVæwFƒ°¢w&÷W2çW6‚‡²ââæw&÷WÂ&W7VÇG2Ò“°¢&WGW&âw&÷W3°¢ÒÂµÒ“°¢W6TVffV7B‚‚’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&âVæFVf–æVC°¢6öç7B†æFÆU&W6—¦RÒ‚’Óâ6WEf–Ww÷'Ev–GF‚‡v–æF÷ræ–ææW%v–GF‚“°¢†æFÆU&W6—¦R‚“°¢v–æF÷ræFDWfVçDÆ—7FVæW"‚'&W6—¦R"Â†æFÆU&W6—¦R“°¢v–æF÷rçf—7VÅf–Ww÷'CòæFDWfVçDÆ—7FVæW#òâ‚'&W6—¦R"Â†æFÆU&W6—¦R“°¢&WGW&â‚’Óâ°¢v–æF÷rç&VÖ÷fTWfVçDÆ—7FVæW"‚'&W6—¦R"Â†æFÆU&W6—¦R“°¢v–æF÷rçf—7VÅf–Ww÷'Còç&VÖ÷fTWfVçDÆ—7FVæW#òâ‚'&W6—¦R"Â†æFÆU&W6—¦R“°¢Ó°¢ÒÂµÒ“° ¢6öç7B&–Ä–6öäf÷"Ò†—FVÒÒ·Ò’Óâ°¢6öç7BFW‡BÒG¶—FVÒæ–BÇÂ"'ÒG¶—FVÒæÆ&VÂÇÂ"'ÒG¶—FVÒæf–ÇFW"ÇÂ"'ÒG¶—FVÒæ¶–æBÇÂ"'ÖçFôÆ÷vW$66R‚“°¢–b†—FVÒæ6öÆÆV7F–öâÇÂõÆ"‡&÷WFWÇvÆ·Æ7&vÇÆ6öÆÆV7F–öâ•Æ"òçFW7B‡FW‡B’’&WGW&â&÷WFS°¢–b‚õÆ"†–æ¶–æGÆ–â¶–æB•Æ"òçFW7B‡FW‡B’’&WGW&âF–6¶WEW&6VçC°¢–b‚õÆ"†ÆVvVæG2•Æ"òçFW7B‡FW‡B’’&WGW&â7F#°¢–b‚õÆ"†'&V¶f7GÆÖ÷&æ–ær•Æ"òçFW7B‡FW‡B’’&WGW&â6Æö6³°¢–b‚õÆ"†''Væ6‚•Æ"òçFW7B‡FW‡B’’&WGW&â6ÆVæF%&ævS°¢–b‚õÆ"††’†÷W"•Æ"òçFW7B‡FW‡B’’&WGW&â&FvUW&6VçC°¢–b‚õÆ"†FW76W'GÇ7W6†’•Æ"òçFW7B‡FW‡B’’&WGW&â7&¶ÆW3°¢–b‚õÆ"‡6W'f–6WÇ6W'f–6W7ÇÇVÖ&W'Ç&öögÆÆVvÇÆ–ç7W&æ6WÆ&æ²•Æ"òçFW7B‡FW‡B’’&WGW&â'&–Vf66T'W6–æW73°¢–b†—FVÒæ¶–æBÓÓÒ'F–ÖR"ÇÂõÆ"‡Föæ–v‡GÇvVV·ÆWfVçGÇ'7g•Æ"òçFW7B‡FW‡B’’&WGW&â6ÆVæF$F—3°¢–b†—FVÒæ¶–æBÓÓÒ'&F—W2"ÇÂõÆ"‡vÆ·ÆæV&'—Ç&÷WFWÆ÷Vâæ÷r•Æ"òçFW7B‡FW‡B’’&WGW&âæf–vF–öã°¢–b‚õÆ"‡W&·ÆöffW'Ç&VFV×F–öâ•Æ"òçFW7B‡FW‡B’’&WGW&âv–gC°¢–b‚õÆ"†6×–vçÆ7F—fF–öçÇ&öÖ÷FWÆ'&öF67B•Æ"òçFW7B‡FW‡B’’&WGW&âÖVv†öæS°¢–b‚õÆ"†VF–Væ6WÇ&W6–FVçGÆwVW7GÆFVÖæB•Æ"òçFW7B‡FW‡B’’&WGW&âW6W'3°¢–b‚õÆ"‡W&f÷&Öæ6WÆ7F—f—G—Ç&W÷'GÇ&W7VÇGÇ6fWÇ66çÇf—6—B•Æ"òçFW7B‡FW‡B’’&WGW&â7F—f—G“°¢–b‚õÆ"†÷÷'GVæ—GÆæW‡GÇG&VæGÆ–ç6–v‡B•Æ"òçFW7B‡FW‡B’’&WGW&âG&VæF–æuW°¢–b‚õÆ"‡&÷W'G—Ç&W6–FVçF–ÇÆÆ—7F–æwÇ&VçFÂ•Æ"òçFW7B‡FW‡B’’&WGW&â'V–ÆF–æs#°¢–b‚õÆ"††÷FVÂ•Æ"òçFW7B‡FW‡B’’&WGW&âÆæFÖ&³°¢–b‚õÆ"†6—f–7ÆW‡Æ÷&WÆ'GÇ&·ÇvFW&Æöò•Æ"òçFW7B‡FW‡B’’&WGW&â6ö×73°¢–b‚õÆ"†'&æGÇ&WF–ÇÇ6†÷•Æ"òçFW7B‡FW‡B’’&WGW&â7&¶ÆW3°¢–b‚õÆ"‡&¶–ær•Æ"òçFW7B‡FW‡B’’&WGW&â6#°¢–b‚õÆ"‡vVÆÆæW77Æf—FæW72•Æ"òçFW7B‡FW‡B’’&WGW&â†V'C°¢–b‚õÆ"†F–æ–æwÆfööGÆÇVæ6‡ÆF–ææW"•Æ"òçFW7B‡FW‡B’’&WGW&âWFVç6–Ç3°¢–b‚õÆ"†6öffVR•Æ"òçFW7B‡FW‡B’’&WGW&â6öffVS°¢–b‚õÆ"†G&–æ·Æ†’†÷W'Ææ–v‡FÆ–fR•Æ"òçFW7B‡FW‡B’’&WGW&âv–æS°¢–b‚õÆ"†vÆ6÷fW&vR•Æ"òçFW7B‡FW‡B’’&WGW&â6V&6ƒ°¢&WGW&â6ö×73°¢Ó°¢6öç7B&–Ä–Df÷"Ò†—FVÒÒ·ÒÂ&Vf—‚Ò&–çFVçB"’Óâ°¢–b†—FVÒæ–B’&WGW&â—FVÒæ–C°¢6öç7B6÷W&6RÒ7G&–ær†—FVÒæÆ&VÂÇÂ—FVÒæf–ÇFW"ÇÂ—FVÒç&ö×BÇÂ&Vf—‚ÇÂ&–çFVçB"“°¢6öç7B6ÇVrÒ6÷W&6RçFôÆ÷vW$66R‚’ç&WÆ6R‚õµæ×£Ó•Ò²örÂ"Ò"’ç&WÆ6R‚õâ×ÂÒBörÂ""’ÇÂ&–çFVçB#°¢&WGW&âG·&Vf—‡ÒÒG·6ÇVwÖ°¢Ó°¢6öç7Bv—F…&–Ä–6öâÒ†—FVÒÂ&Vf—‚Ò&–çFVçB"’Óâ‡°¢ââæ—FVÒÀ¢–C¢&–Ä–Df÷"†—FVÒÂ&Vf—‚’À¢–6öã¢—FVÒæ–6öâÇÂ&–Ä–6öäf÷"†—FVÒ’À¢Ò“°¢6öç7BÖöFT6öæf–rÒ4T$4…ô4ôå4ôÄUôÔôDUô4ôäd”u¶ÖöFUÒÇÂ4T$4…ô4ôå4ôÄUôÔôDUô4ôäd”rç&W6–FVçC°¢6öç7B&÷WFT6öÆÆV7F–öä—FV×2Ò4T4ôäD%•õ4T$4…ô”åDTåEõ$”Âæf–ÇFW"‚†—FVÒ’Óâ—FVÒæ6öÆÆV7F–öâ“°¢6öç7B&–Ö'”–çFVçE6÷W&6RÒÖöFRÓÓÒ''FæW" ¢òÖöFT6öæf–ræ–çFVçD6†—0¢¢$”Ô%•õ4T$4…ô”åDTåEõ$”Ã°¢6öç7B6V6öæF'”–çFVçE6÷W&6RÒÖöFRÓÓÒ''FæW" ¢ò²âââ†ÖöFT6öæf–ræf–ÇFW%&–ÂÇÂµÒ’Âââç&÷WFT6öÆÆV7F–öä—FV×2Ââââ†ÖöFT6öæf–ræfVGW&VE–ç2ÇÂµÒ•Ð¢¢4T4ôäD%•õ4T$4…ô”åDTåEõ$”Ã°¢6öç7B–çFVçE&–ÂÒ&–Ö'”–çFVçE6÷W&6RæÖ‚†—FVÒ’Óâv—F…&–Ä–6öâ†—FVÒÂG¶ÖöFWÒ×&–Ö'–’“°¢6öç7B&tÖ÷&Tf–ÇFW%&–ÂÒ6V6öæF'”–çFVçE6÷W&6RæÖ‚†—FVÒ’Óâv—F…&–Ä–6öâ†—FVÒÂG¶ÖöFWÒ×6V6öæF'–’“°¢6öç7B&–Ö'”–çFVçD¶W—2ÒæWr6WB†–çFVçE&–ÂæÖ‚†—FVÒ’Óâ€¢—FVÒæ6öÆÆV7F–öà¢ò6öÆÆV7F–öã¢G¶—FVÒæ6öÆÆV7F–öçÖ ¢¢–çFVçC¢Gµ7G&–ær†—FVÒæ–BÇÂ—FVÒæÆ&VÂ’çFôÆ÷vW$66R‚—Ö ¢’’“°¢6öç7B6VVå6V6öæF'”–çFVçD¶W—2ÒæWr6WB‚“°¢6öç7BÖ÷&Tf–ÇFW%&–ÂÒ&tÖ÷&Tf–ÇFW%&–Âæf–ÇFW"‚†—FVÒ’Óâ°¢6öç7B—FVÔ¶W’Ò—FVÒæ6öÆÆV7F–öà¢ò6öÆÆV7F–öã¢G¶—FVÒæ6öÆÆV7F–öçÖ ¢¢–çFVçC¢Gµ7G&–ær†—FVÒæ–BÇÂ—FVÒæÆ&VÂ’çFôÆ÷vW$66R‚—Ö°¢–b‡&–Ö'”–çFVçD¶W—2æ†2†—FVÔ¶W’’ÇÂ6VVå6V6öæF'”–çFVçD¶W—2æ†2†—FVÔ¶W’’’&WGW&âfÇ6S°¢6VVå6V6öæF'”–çFVçD¶W—2æFB†—FVÔ¶W’“°¢&WGW&âG'VS°¢Ò“°¢6öç7B&–Ä¶W”f÷"Ò†—FVÒ’Óâ7G&–ær†—FVÓòæ–BÇÂ—FVÓòæÆ&VÂÇÂ—FVÓòæf–ÇFW"ÇÂ—FVÓòç&ö×BÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7B—5&–Ä—FVÔ7F—fRÒ†—FVÒ’Óâ°¢–b†—FVÒæ6öÆÆV7F–öâ’&WGW&â7F—fT6öÆÆV7F–öâÓÓÒ—FVÒæ6öÆÆV7F–öã°¢–b†7F—fT6öÆÆV7F–öâ’&WGW&âfÇ6S°¢–b†—FVÒæ¶–æBÓÓÒ'F–ÖR"’&WGW&â7F—fUF–ÖRÓÓÒ—FVÒçF–ÖS°¢–b†—FVÒæ¶–æBÓÓÒ'&F—W2"’&WGW&â7F—fU&F—W2ÓÓÒ—FVÒç&F—W3°¢–b†—FVÒæ–Bbb7F—fT–çFVçBÓÓÒ—FVÒæ–B’&WGW&âG'VS°¢–b†—FVÒæf–ÇFW"’&WGW&âvWD6æöæ–6Å6V&6„–çFVçDf–ÇFW"†7F—fTf–ÇFW"’ÓÓÒvWD6æöæ–6Å6V&6„–çFVçDf–ÇFW"†—FVÒæf–ÇFW"“°¢&WGW&â7F—fU6V&6„Æ&VÂçFôÆ÷vW$66R‚’ÓÓÒ7G&–ær†—FVÒæÆ&VÂ’çFôÆ÷vW$66R‚“°¢Ó°¢6öç7B&–Ö'”6öÆÆV7F–öä7F—fRÒ–çFVçE&–Âç6öÖR‚†—FVÒ’Óâ—FVÒæ6öÆÆV7F–öâbb—5&–Ä—FVÔ7F—fR†—FVÒ’“°¢6öç7B7F—fU6V6öæF'”—FVÒÒ&–Ö'”6öÆÆV7F–öä7F—fRòçVÆÂ¢Ö÷&Tf–ÇFW%&–Âæf–æB†—5&–Ä—FVÔ7F—fR“°¢6öç7BÖ÷&UFövvÆTÆ&VÂÒ$Ö÷&R#°¢6öç7BÖ¶T–çFVçE7VÖÖ'’Ò†—FVÒÂ7F—fR’Óâ°¢6öç7BFVf–æ—F–öâÒvWE6V&6„–çFVçDFVf–æ—F–öâ†—FVÒ“°¢–b‚7F—fR’&WGW&âFVf–æ—F–öâæFW67&—F–öã°¢–b‡&WVW7E7FGW2ÓÓÒ&ÆöF–ær"’&WGW&âf–æF–ærG¶FVf–æ—F–öâç6†÷'DÆ&VÂçFôÆ÷vW$66R‚—Òââæ°¢–b‡&WVW7E7FGW2ÓÓÒ&W'&÷""’&WGW&â$6÷VÆBæ÷BÆöBÖF6†W2æV&'’#°¢–b‡&W7VÇD6÷VçBÓÓÒ’&WGW&âFVf–æ—F–öâæFW67&—F–öã°¢6öç7Bæ÷VâÒ&W7VÇD6÷VçBÓÓÒò'Æ6R"¢'Æ6W2#°¢6öç7B6÷VçG2Ò¶G·&W7VÇD6÷VçGÒG¶æ÷VçÖÓ°¢–b†—FVÓòæ6öÆÆV7F–öâ’6÷VçG2çW6‚‚#&÷WFR"“°¢&WGW&â6÷VçG2æ¦ö–â‚"+r"“°¢Ó°¢6öç7BÖ¶T–çFVçD&–Æ&VÂÒ†—FVÒÂFVf–æ—F–öâÂ7F—fR’Óâ°¢6öç7B7FFRÒ7F—fRò%&W76VB"¢$æ÷B&W76VB#°¢&WGW&âG¶FVf–æ—F–öâægVÆÄÆ&VÇÒâ6†÷w2G¶FVf–æ—F–öâæFW67&—F–öçÒâG·7FFWÒæ°¢Ó°¢6öç7BÖ÷&UFövvÆT–ç6W'D–æFW‚ÒÖöFRÓÓÒ''FæW" ¢òÖF‚æÖ–âƒ"ÂÖF‚æÖ‚ƒÂ–çFVçE&–ÂæÆVæwF‚Ò’¢¢–çFVçE&–ÂæÆVæwF‚Ò°¢6öç7BG&6´f–ÇFW%&–ÄWfVçBÒ†WfVçDæÖRÂ—FVÒÂ&–Å7FFRÒÖ÷&T÷Vâò&W‡æFVB"¢&6öÆÆ6VB"’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&ã°¢v–æF÷ræF—7F6„WfVçB†æWr7W7FöÔWfVçB‚&G¦ÖÖf–ÇFW"×&–Â"Â°¢FWF–Ã¢°¢WfVçDæÖRÀ¢f–ÇFW$æÖS¢—FVÓòæÆ&VÂÇÂ—FVÓòæf–ÇFW"ÇÂ$Ö÷&R"À¢f–ÇFW$w&÷W¢7F—fU6V6öæF'”—FVÒÓÓÒ—FVÒÇÂÖ÷&Tf–ÇFW%&–Âæ–æ6ÇVFW2†—FVÒ’ò'6V6öæF'’"¢'&–Ö'’"À¢—56V6öæF'”f–ÇFW#¢7F—fU6V6öæF'”—FVÒÓÓÒ—FVÒÇÂÖ÷&Tf–ÇFW%&–Âæ–æ6ÇVFW2†—FVÒ’À¢&–Å7FFRÀ¢F–ÖW7F×¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢ÖöFRÀ¢ÒÀ¢Ò’“°¢Ó°¢6öç7B†æFÆTÖ÷&T6Æ–6²Ò†WfVçB’Óâ°¢WfVçCòç7F÷&÷vF–öãòâ‚“°¢6WDÖ÷&T÷Vâ‚‡fÇVR’Óâ°¢–b‡fÇVRbb7F—fU6V6öæF'”—FVÒ’&WGW&âG'VS°¢6öç7BæW‡BÒfÇVS°¢G&6´f–ÇFW%&–ÄWfVçB†æW‡Bò'6V6öæF'•öf–ÇFW%÷&–ÅöW‡æFVB"¢'6V6öæF'•öf–ÇFW%÷&–Åö6öÆÆ6VB"ÂçVÆÂÂæW‡Bò&W‡æFVB"¢&6öÆÆ6VB"“°¢&WGW&âæW‡C°¢Ò“°¢Ó°¢6öç7B†æFÆU6V&6„–çWD¶W”F÷vâÒ†WfVçB’Óâ°¢–b†WfVçBæ¶W’ÓÒ$'&÷tF÷vâ"ÇÂ6†÷t6FÆöu&W7VÇG2’&WGW&ã°¢6öç7Bf—'7E&W7VÇBÒ6öç6öÆUæVÅ&Vbæ7W'&VçCòçVW'•6VÆV7F÷#òâ‚%¶FF×6V&6‚×&W7VÇBÖ–EÒ"“°¢–b‚f—'7E&W7VÇB’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢f—'7E&W7VÇBæfö7W3òâ‚“°¢Ó°¢6öç7B†æFÆU&–Ä—FVÒÒ†—FVÒ’Óâ°¢6öç7B—56V6öæF'”f–ÇFW"ÒÖ÷&Tf–ÇFW%&–Âæ–æ6ÇVFW2†—FVÒ“°¢–b†—5&–Ä—FVÔ7F—fR†—FVÒ’’°¢G&6´f–ÇFW%&–ÄWfVçB‚&f–ÇFW%ö6ÆV&VB"Â—FVÒÂ&6öÆÆ6VB"“°¢6WDÖ÷&T÷Vâ†fÇ6R“°¢öä6ÆV#òâ‚“°¢&WGW&ã°¢Ð¢G&6´f–ÇFW%&–ÄWfVçB†—56V6öæF'”f–ÇFW"ò'6V6öæF'•öf–ÇFW%÷6VÆV7FVB"¢&f–ÇFW%÷6VÆV7FVB"Â—FVÒ“°¢–b‚—56V6öæF'”f–ÇFW"’6WDÖ÷&T÷Vâ†fÇ6R“°¢–b†—FVÒæ6öÆÆV7F–öâ’°¢öä6öÆÆV7F–öå6VÆV7Còâ†—FVÒæ6öÆÆV7F–öâÂ—FVÒ“°¢&WGW&ã°¢Ð¢–b†—FVÒæ¶–æBÓÓÒ'F–ÖR"’°¢öåF–ÖU6VÆV7Còâ‡²–C¢—FVÒçF–ÖRÂÆ&VÃ¢—FVÒæÆ&VÂÂ&ö×C¢—FVÒç&ö×BÒ“°¢&WGW&ã°¢Ð¢–b†—FVÒæ¶–æBÓÓÒ'&F—W2"’°¢öå&F—W56VÆV7Còâ‡²–C¢—FVÒæ–BÂÆ&VÃ¢—FVÒç&F—W2Â&ö×C¢—FVÒç&ö×BÒ“°¢&WGW&ã°¢Ð¢öäf–ÇFW%6VÆV7Còâ†—FVÒ“°¢Ó°¢6öç7Bfö7W56–&Æ–æuF"Ò†WfVçBÂF—&V7F–öâ’Óâ°¢6öç7B6öçF–æW"ÒWfVçBæ7W'&VçEF&vWBæ6Æ÷6W7B‚u·&öÆSÒ'F&Æ—7B%Òr“°¢–b‚6öçF–æW"’&WGW&ã°¢6öç7BF'2Ò'&’æg&öÒ†6öçF–æW"çVW'•6VÆV7F÷$ÆÂ‚v'WGFöå·&öÆSÒ'F"%ÒÂ'WGFöâr’“°¢6öç7B7W'&VçD–æFW‚ÒF'2æ–æFW„öb†WfVçBæ7W'&VçEF&vWB“°¢–b†7W'&VçD–æFW‚ÂÇÂF'2æÆVæwF‚Â"’&WGW&ã°¢6öç7BæW‡D–æFW‚ÒF—&V7F–öâÓÓÒ'7F'B ¢ò ¢¢F—&V7F–öâÓÓÒ&VæB ¢òF'2æÆVæwF‚Ò¢¢†7W'&VçD–æFW‚²F—&V7F–öâ²F'2æÆVæwF‚’RF'2æÆVæwFƒ°¢F'5¶æW‡D–æFW…Óòæfö7W2‚“°¢Ó°¢6öç7B†æFÆT6öç6öÆUF$¶W”F÷vâÒ†WfVçBÂ6VÆV7D7W'&VçB’Óâ°¢–b†WfVçBæ¶W’ÓÓÒ$'&÷tÆVgB"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢fö7W56–&Æ–æuF"†WfVçBÂÓ“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÓÒ$'&÷u&–v‡B"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢fö7W56–&Æ–æuF"†WfVçBÂ“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÓÒ$†öÖR"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢fö7W56–&Æ–æuF"†WfVçBÂ'7F'B"“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÓÒ$VæB"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢fö7W56–&Æ–æuF"†WfVçBÂ&VæB"“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÓÒ$VçFW""ÇÂWfVçBæ¶W’ÓÓÒ""’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6VÆV7D7W'&VçCòâ‚“°¢Ð¢Ó°¢6öç7B&VæFW$–çFVçD'WGFöâÒ†—FVÒÂ–æFW‚Â6Æ74æÖR’Óâ°¢6öç7BFVf–æ—F–öâÒvWE6V&6„–çFVçDFVf–æ—F–öâ†—FVÒ“°¢6öç7B–6öâÒ—FVÒæ–6öã°¢6öç7B7F—fRÒ—5&–Ä—FVÔ7F—fR†—FVÒ“°¢6öç7B&Wf–WvVBÒfÇ6S°¢6öç7BW‡æFVBÒG'VS°¢6öç7BFW67&—F–öä–BÒG×6V&6‚Ö–çFVçBÖFW62ÒG¶FVf–æ—F–öâæ–GÖ°¢6öç7B7VÖÖ'’ÒÖ¶T–çFVçE7VÖÖ'’†—FVÒÂ7F—fR“° ¢&WGW&â€¢Æ'WGFöà¢¶W“×¶G¶6Æ74æÖWÒÒG¶–æFW‡ÒÒG·&–Ä¶W”f÷"†—FVÒ—ÖÐ¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢6Æ74æÖS×¶GÖ6ö×7BÖ–çFVçBÖ6†—GÖ6²ÖÖ×&ö×BÖÆ–æ²G¶7F—fRò&—2Ö7F—fR"¢"'ÖÐ¢&–×&W76VC×¶7F—fWÐ¢&–×6VÆV7FVC×¶7F—fWÐ¢&–ÖÆ&VÃ×¶Ö¶T–çFVçD&–Æ&VÂ†—FVÒÂFVf–æ—F–öâÂ7F—fR—Ð¢&–ÖFW67&–&VF'“×¶FW67&—F–öä–GÐ¢öåö–çFW$VçFW#×²‚’Óâ·×Ð¢öåö–çFW$ÆVfS×²‚’Óâ·×Ð¢öäfö7W3×²‚’Óâ·×Ð¢öä&ÇW#×²‚’Óâ·×Ð¢öä6Æ–6³×²‚’Óâ°¢†æFÆU&–Ä—FVÒ†—FVÒ“°¢×Ð¢öä¶W”F÷vã×²†WfVçB’Óâ°¢–b†WfVçBæ¶W’ÓÓÒ$W66R"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBæ7W'&VçEF&vWBæ&ÇW"‚“°¢&WGW&ã°¢Ð¢†æFÆT6öç6öÆUF$¶W”F÷vâ†WfVçBÂ‚’Óâ°¢†æFÆU&–Ä—FVÒ†—FVÒ“°¢Ò“°¢×Ð¢FFÖÆ&VÃ×¶FVf–æ—F–öâç6†÷'DÆ&VÇÐ¢FFÖ–çFVçBÖ–C×¶FVf–æ—F–öâæ–GÐ¢FFÖW‡æFVC×¶W‡æFVBò'G'VR"¢&fÇ6R'Ð¢à¢Ç7â6Æ74æÖSÒ&GÖ6ö×7BÖ–çFVçBÖ6†—õö–6öâ"&–Ö†–FFVãÒ'G'VR#à¢´–6öâòÄ–6öâ6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖf–ÇFW"Ö–6öâ"&–Ö†–FFVãÒ'G'VR"óâ¢çVÆÇÐ¢Â÷7ãà¢¶W‡æFVBò€¢Ç7â6Æ74æÖSÒ&GÖ6ö×7BÖ–çFVçBÖ6†—õöÆ&VÂ"&–Ö†–FFVãÒ'G'VR#à¢¶FVf–æ—F–öâç6†÷'DÆ&VÇÐ¢Â÷7ãà¢’¢çVÆÇÐ¢Ç7â–C×¶FW67&—F–öä–GÒ6Æ74æÖSÒ'7"ÖöæÇ’#ç·7VÖÖ'—ÓÂ÷7ãà¢Âö'WGFöãà¢“°¢Ó° ¢6öç7B&VæFW$Ö÷&T'WGFöâÒ‚’Óâ°¢6öç7BÖ÷&T–6öâÒ6ö×73°¢6öç7B&Wf–WvVBÒfÇ6S°¢6öç7BW‡æFVBÒÖ÷&T÷Vã° ¢&WGW&â€¢Æ'WGFöà¢–CÒ&G×6V&6‚ÖÖ÷&R×FövvÆR ¢¶W“Ò&Ö÷&RÖf–ÇFW'2ÖÖ&¶W" ¢G—SÒ&'WGFöâ ¢6Æ74æÖS×¶G×6V&6‚ÖÖ÷&R×FövvÆRG¶Ö÷&T÷Vâò&—2Ö÷Vâ"¢"'ÒG·&Wf–WvVBò&—2×&Wf–WvVB"¢"'ÖÐ¢&–ÖW‡æFVC×¶Ö÷&T÷VçÐ¢&–Ö6öçG&öÇ3Ò&G×6V&6‚ÖÖ÷&RÖf–ÇFW"×æVÂ ¢&–ÖÆ&VÃÒ%6†÷rÖ÷&RÖ÷F–öç2 ¢öåö–çFW$VçFW#×²‚’Óâ·×Ð¢öåö–çFW$ÆVfS×²‚’Óâ·×Ð¢öäfö7W3×²‚’Óâ·×Ð¢öä&ÇW#×²‚’Óâ·×Ð¢öä6Æ–6³×¶†æFÆTÖ÷&T6Æ–6·Ð¢öä¶W”F÷vã×²†WfVçB’Óâ°¢–b†WfVçBæ¶W’ÓÓÒ$W66R"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢–b†Ö÷&T÷Vâ’6WDÖ÷&T÷Vâ†fÇ6R“°¢&WGW&ã°¢Ð¢†æFÆT6öç6öÆUF$¶W”F÷vâ†WfVçBÂ†æFÆTÖ÷&T6Æ–6²“°¢×Ð¢FFÖÆ&VÃ×¶Ö÷&UFövvÆTÆ&VÇÐ¢FFÖ–çFVçBÖ–CÒ&Ö÷&R ¢FFÖW‡æFVC×¶W‡æFVBò'G'VR"¢&fÇ6R'Ð¢à¢Ç7â6Æ74æÖSÒ&GÖW‡æF–ærÖ–çFVçBÖ6†—õö–6öâ"&–Ö†–FFVãÒ'G'VR#à¢ÄÖ÷&T–6öâ6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖf–ÇFW"Ö–6öâ"&–Ö†–FFVãÒ'G'VR"óà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖW‡æF–ærÖ–çFVçBÖ6†—õ÷FW‡B#à¢Ç7â6Æ74æÖSÒ&GÖW‡æF–ærÖ–çFVçBÖ6†—õöÆ&VÂG×6V&6‚Ö–çFVçBÖf–ÇFW"ÖÆ&VÂ#à¢¶W‡æFVBò$Ö÷&R"¢Ö÷&UFövvÆTÆ&VÇÐ¢Â÷7ãà¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ó° ¢6öç7B&VæFW%&–ÂÒ†—FV×2Â6Æ74æÖRÂÆ&VÂÂ÷F–öç2Ò·Ò’Óâ€¢ÆF—b–C×¶÷F–öç2æ–GÒ6Æ74æÖS×¶6Æ74æÖWÒ&öÆSÒ'F&Æ—7B"&–ÖÆ&VÃ×¶Æ&VÇÓà¢¶—FV×2æfÆDÖ‚†—FVÒÂ–æFW‚’Óâ°¢6öç7B—FVÔ'WGFöâÒ&VæFW$–çFVçD'WGFöâ†—FVÒÂ–æFW‚Â6Æ74æÖR“°¢–b†÷F–öç2æ–æ6ÇVFTÖ÷&UFövvÆRbb–æFW‚ÓÓÒ÷F–öç2æ–ç6W'DÖ÷&TgFW$–æFW‚’°¢&WGW&â¶—FVÔ'WGFöâÂ&VæFW$Ö÷&T'WGFöâ‚•Ó°¢Ð¢&WGW&â¶—FVÔ'WGFöåÓ°¢Ò—Ð¢¶÷F–öç2æ–æ6ÇVFTÖ÷&UFövvÆRbb÷F–öç2æ–ç6W'DÖ÷&TgFW$–æFW‚ÓÒçVÆÂò&VæFW$Ö÷&T'WGFöâ‚’¢çVÆÇÐ¢ÂöF—cà¢“° ¢6öç7B&VæFW$6FVv÷'•&–ÂÒ†—FV×2’Óâ€¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö6öçFW‡B×&÷rG×6V&6‚Ö6öçFW‡B×&÷r×&–Ö'’G×6V&6‚ÖÖ÷&RÖf–ÇFW"×æVÂ"&öÆSÒ'F&Æ—7B"&–ÖÆ&VÃÒ$Ö÷&RÖf–ÇFW'2#à¢¶—FV×2æÖ‚†—FVÒ’Óâ°¢6öç7Bæ÷&ÖÆ—¦VD7F—fTÆ&VÂÒ7F—fU6V&6„Æ&VÂçFôÆ÷vW$66R‚“°¢6öç7Bæ÷&ÖÆ—¦VD—FVÔÆ&VÂÒ7G&–ær†—FVÒæÆ&VÂ’çFôÆ÷vW$66R‚“°¢6öç7BÆ&VÄÖF6†W2Òæ÷&ÖÆ—¦VD7F—fTÆ&VÂÓÓÒæ÷&ÖÆ—¦VD—FVÔÆ&VÃ°¢6öç7B7F—fRÐ¢Æ&VÄÖF6†W2ÇÀ¢†—FVÒæf–ÇFW"ÓÓÒ$ÆÂ ¢ò—FVÒæÆ&VÂÓÓÒ$ÆÂ"bb7F—fTf–ÇFW"ÓÓÒ$ÆÂ"bbæ÷&ÖÆ—¦VD7F—fTÆ&VÂÓÓÒ&ÆÂ ¢¢7F—fTf–ÇFW"ÓÓÒ—FVÒæf–ÇFW"“°¢&WGW&â€¢Æ'WGFöà¢¶W“×¶G¶—FVÒæÆ&VÇÒÒG¶—FVÒæf–ÇFW'ÖÐ¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–×6VÆV7FVC×¶7F—fWÐ¢6Æ74æÖS×¶GÖ6öç6öÆRÖ6†—G×6V&6‚×6VvÖVçBG¶7F—fRò&—2Ö7F—fR"¢"'ÖÐ¢öä6Æ–6³×²‚’Óâöäf–ÇFW%6VÆV7Còâ†—FVÒ—Ð¢öä¶W”F÷vã×²†WfVçB’Óâ†æFÆT6öç6öÆUF$¶W”F÷vâ†WfVçBÂ‚’Óâöäf–ÇFW%6VÆV7Còâ†—FVÒ’—Ð¢à¢¶—FVÒæÆ&VÇÐ¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂöF—cà¢“° ¢6öç7Bfö7W46µF†TÖÒ‚’Óâ°¢–çWE&Vcòæ7W'&VçCòæfö7W3òâ‚“°¢Ó° ¢6öç7B&VæFW$ÖöFU7v—F6‚Ò‚’Óâ€¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×7v—F6‚G×6V&6‚Ö–çFVçBÖVF–Væ6R×F'2"&öÆSÒ'F&Æ—7B"&–ÖÆ&VÃÒ$ÖVF–Væ6R#à¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–×6VÆV7FVC×¶ÖöFRÓÓÒ'&W6–FVçB'Ð¢6Æ74æÖS×¶ÖöFRÓÓÒ'&W6–FVçB"ò&—2Ö7F—fR"¢"'Ð¢öä6Æ–6³×²‚’ÓâöäÖöFT6†ævR‚'&W6–FVçB"—Ð¢öä¶W”F÷vã×²†WfVçB’Óâ†æFÆT6öç6öÆUF$¶W”F÷vâ†WfVçBÂ‚’ÓâöäÖöFT6†ævR‚'&W6–FVçB"’—Ð¢à¢&W6–FVç@¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–×6VÆV7FVC×¶ÖöFRÓÓÒ''FæW"'Ð¢6Æ74æÖS×¶ÖöFRÓÓÒ''FæW""ò&—2Ö7F—fR"¢"'Ð¢öä6Æ–6³×²‚’ÓâöäÖöFT6†ævR‚''FæW""—Ð¢öä¶W”F÷vã×²†WfVçB’Óâ†æFÆT6öç6öÆUF$¶W”F÷vâ†WfVçBÂ‚’ÓâöäÖöFT6†ævR‚''FæW""’—Ð¢à¢'FæW ¢Âö'WGFöãà¢ÂöF—cà¢“° ¢6öç7BF÷æd&6µv–GF‚ÒG´ÖF‚æÖ‚ƒ#CÂÖF‚æÖ–âƒScÂf–Ww÷'Ev–GF‚Ò“"’—×†°¢6öç7BF÷æd&6´6öç6öÆU7G–ÆRÒ†5F÷Ö&6°¢ò²v–GFƒ¢F÷æd&6µv–GF‚ÂÖ…v–GFƒ¢F÷æd&6µv–GF‚Ð¢¢VæFVf–æVC° ¢W6TVffV7B‚‚’Óâ°¢6öç7BæöFW2Ò¶6öç6öÆUw&&Vbæ7W'&VçBÂ6öç6öÆUæVÅ&Vbæ7W'&VçEÒæf–ÇFW"„&ööÆVâ“°¢æöFW2æf÷$V6‚‚†æöFR’Óâ°¢–b‚†5F÷Ö&6²’°¢æöFRç7G–ÆRç&VÖ÷fU&÷W'G’‚'v–GF‚"“°¢æöFRç7G–ÆRç&VÖ÷fU&÷W'G’‚&Ö‚×v–GF‚"“°¢æöFRç7G–ÆRç&VÖ÷fU&÷W'G’‚&–æÆ–æR×6—¦R"“°¢æöFRç7G–ÆRç&VÖ÷fU&÷W'G’‚&Ö‚Ö–æÆ–æR×6—¦R"“°¢&WGW&ã°¢Ð¢æöFRç7G–ÆRç6WE&÷W'G’‚'v–GF‚"ÂF÷æd&6µv–GF‚Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚&Ö‚×v–GF‚"ÂF÷æd&6µv–GF‚Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚&–æÆ–æR×6—¦R"ÂF÷æd&6µv–GF‚Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚&Ö‚Ö–æÆ–æR×6—¦R"ÂF÷æd&6µv–GF‚Â&–×÷'FçB"“°¢Ò“°¢ÒÂ¶†5F÷Ö&6²ÂF÷æd&6µv–GF…Ò“° ¢W6TVffV7B‚‚’Óâ°¢6öç7BæöFRÒ6öç6öÆUw&&Vbæ7W'&VçC°¢–b‚æöFR’&WGW&ã° ¢6öç7B6ö×7D–ç6WBÒf–Ww÷'Ev–GF‚ÃÒ3sRòb¢#C°¢6öç7B6öç6öÆUv–GF‚Ò—46öÆÆ6V@¢ò&Ö‚Ö6öçFVçB ¢¢†5F÷Ö&6°¢òF÷æd&6µv–GF€¢¢Ö–âƒS#‚Â6Æ2ƒgrÒG¶6ö×7D–ç6WG×‚’–°¢6öç7B6WDÆö6¶VE7G–ÆRÒ‡&÷W'G’ÂfÇVR’Óâ°¢æöFRç7G–ÆRç6WE&÷W'G’‡&÷W'G’ÂfÇVRÂ&–×÷'FçB"“°¢Ó° ¢òòÆVv7’&V6÷fW'’7G–ÆW26''’VçW7VÆÇ’†–v‚6VÆV7F÷"7V6–f–6—G’â¶VWF†P¢òò6öÖÖæB7W&f6R6VçFW&VBv—F‚–æÆ–æR&–÷&—G’6ò—B6ææ÷BG&–gBv—F‚¢òò&VçB&–ÂÂG&vW"Â÷"ÖÖ6ÖW&G&ç6—F–öâà¢6WDÆö6¶VE7G–ÆR‚'÷6—F–öâ"Â&f—†VB"“°¢6WDÆö6¶VE7G–ÆR€¢'F÷"À¢—46öÆÆ6V@¢ò&6Æ2ƒ‡‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’ ¢¢6Æ2‚G·f–Ww÷'Ev–GF‚ÃÒscròcB¢c‡×‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’–À¢“°¢6WDÆö6¶VE7G–ÆR‚'&–v‡B"Â&WFò"“°¢6WDÆö6¶VE7G–ÆR‚&ÆVgB"Â#SR"“°¢6WDÆö6¶VE7G–ÆR‚'v–GF‚"Â6öç6öÆUv–GF‚“°¢6WDÆö6¶VE7G–ÆR‚&Ö‚×v–GF‚"Â6Æ2ƒgrÒG¶6ö×7D–ç6WG×‚–“°¢6WDÆö6¶VE7G–ÆR‚&Ö&v–â"Â#"“°¢6WDÆö6¶VE7G–ÆR‚'G&ç6f÷&Ò"Â'G&ç6ÆFU‚‚ÓSR’"“°¢6WDÆö6¶VE7G–ÆR‚'¢Ö–æFW‚"Â#3#"“°¢ÒÂ¶†5F÷Ö&6²Â—46öÆÆ6VBÂF÷æd&6µv–GF‚Âf–Ww÷'Ev–GF…Ò“° ¢–b†—46öÆÆ6VB’°¢&WGW&â€¢ÆF—b–CÒ&GÖÖ×6V&6‚Ö6öç6öÆRÖÆö6²"&Vc×¶6öç6öÆUw&&VgÒ6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6öç6öÆR×w&—2Ö6öÆÆ6VB"7G–ÆS×·F÷æd&6´6öç6öÆU7G–ÆWÓà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×&öÆÇW"&–ÖÆ&VÃÒ$W‡æB6V&6‚æBf–ÇFW'2"&–ÖW‡æFVCÒ&fÇ6R"öåö–çFW$F÷vã×²†WfVçB’ÓâWfVçBç7F÷&÷vF–öâ‚—Òöä6Æ–6³×¶öäW‡æGÓà¢Ç7â6Æ74æÖSÒ&G×6V&6‚Ö'&æBÖÖ&²#à¢Å7&¶ÆW26Æ74æÖSÒ&G×6V&6‚×&öÆÇWÖ–6öâ"&–Ö†–FFVãÒ'G'VR"óà¢Ç7â6Æ74æÖSÒ&G×6V&6‚×&öÆÇWÖÖ–â#ä6²F†RÖÂ÷7ãà¢Â÷7ãà¢Âö'WGFöãà¢ÂöF—cà¢“°¢Ð ¢&WGW&â€¢ÆF—`¢–CÒ&GÖÖ×6V&6‚Ö6öç6öÆRÖÆö6² ¢&Vc×¶6öç6öÆUw&&VgÐ¢6Æ74æÖS×¶G×6V&6‚Ö–çFVçBÖ6öç6öÆR×w&G¶—46öÆÆ6VBò&—2Ö6öÆÆ6VB"¢"'ÖÐ¢7G–ÆS×·F÷æd&6´6öç6öÆU7G–ÆWÐ¢à¢Ç6V7F–öà¢&Vc×¶6öç6öÆUæVÅ&VgÐ¢6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6öç6öÆRGÖ6²ÖÖ×æVÂö–çFW"ÖWfVçG2ÖWFò ¢7G–ÆS×·F÷æd&6´6öç6öÆU7G–ÆWÐ¢&öÆSÒ'&Vv–öâ ¢&–ÖÆ&VÃÒ$6²F†RÖ ¢&–ÖW‡æFVC×²—46öÆÆ6VGÐ¢&–Ö†–FFVã×¶—46öÆÆ6VGÐ¢FF×7FFS×¶—46öÆÆ6VBò&6öÆÆ6VB"¢&fö7W6VB'Ð¢FFÖ†2×&W7VÇG3×·6†÷t6FÆöu&W7VÇG2ò'G'VR"¢&fÇ6R'Ð¢öåö–çFW$F÷vã×²†WfVçB’ÓâWfVçBç7F÷&÷vF–öâ‚—Ð¢à¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6öç6öÆRÖ†VFW"G×6V&6‚Ö–çFVçB×F÷×&–ÂGÖ6²ÖÖÖ†VFW"#à¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×F÷Ö7F–öç2#à¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6²ÖÖ ¢&–Ö6öçG&öÇ3Ò&GÖ6²ÖÖ×6V&6‚Ö–çWB ¢öä6Æ–6³×¶fö7W46µF†TÖÐ¢à¢6²F†RÖ ¢Âö'WGFöãà¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ†VFW"Ö6öçG&öÇ2#à¢·&VæFW$ÖöFU7v—F6‚‚—Ð¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6öÆÆ6RG×6V&6‚Ö–çFVçBÖ6öÆÆ6RÖ–6öâGÖ6²ÖÖ×æVÂÖ6öçG&öÂ ¢&–ÖÆ&VÃÒ$6öÆÆ6RÖ6V&6‚6öç6öÆR ¢&–ÖW‡æFVCÒ'G'VR ¢öä6Æ–6³×¶öä6öÆÆ6WÐ¢à¢Ä6†Wg&öäF÷vâ&–Ö†–FFVãÒ'G'VR"óà¢Âö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢ÂöF—cà ¢Æf÷&Ò6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖf÷&ÒGÖ6²ÖÖÖf÷&Ò"öå7V&Ö—C×¶öå7V&Ö—GÓà¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ–çWB×&÷r#à¢Å6V&6‚6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×6V&6‚Ö–6öâ"&–Ö†–FFVãÒ'G'VR"óà¢Æ–çW@¢–CÒ&GÖ6²ÖÖ×6V&6‚Ö–çWB ¢&Vc×¶–çWE&VgÐ¢G—SÒ'FW‡B ¢6Æ74æÖSÒ&GÖ6²ÖÖÖ–çWB ¢&–ÖÆ&VÃÒ$6²F†RÖ6V&6‚ ¢&öÆSÒ&6öÖ&ö&÷‚ ¢&–ÖWFö6ö×ÆWFSÒ&Æ—7B ¢&–Ö6öçG&öÇ3×¶6FÆöu&W7VÇG4–GÐ¢&–ÖW‡æFVC×·6†÷t6FÆöu&W7VÇG7Ð¢Æ6V†öÆFW#Ò$6²v†N(	—2æV&'’ ¢fÇVS×·VW'—Ð¢öä6†ævS×²†WfVçB’ÓâöåVW'”6†ævR†WfVçBçF&vWBçfÇVR—Ð¢öä¶W”F÷vã×¶†æFÆU6V&6„–çWD¶W”F÷vçÐ¢óà¢·VW'’bb€¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖ6ÆV""öä6Æ–6³×¶öä6ÆV'Ò&–ÖÆ&VÃÒ$6ÆV"6V&6‚#à¢Å‚6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢Âö'WGFöãà¢—Ð¢Æ'WGFöâG—SÒ'7V&Ö—B"6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×7V&Ö—BGÖ6²ÖÖ×7V&Ö—B"&–ÖÆ&VÃÒ%6V&6‚#à¢Å6VæB6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢Âö'WGFöãà¢ÂöF—cà¢Âöf÷&Óà ¢²6†÷t6FÆöu&W7VÇG2ò€¢ÆF—b6Æ74æÖSÒ&G×6V&6‚Ö–çFVçB×Gvò×&÷r×7F6²#à¢·&VæFW%&–Â€¢–çFVçE&–ÂÀ¢&G×6V&6‚Ö–çFVçB×&ö×B×&–ÂG×6V&6‚Ö–çFVçB×&–Ö'’×&–ÂGÖÖÖ–çFVçB×&–ÂGÖ6²ÖÖ×&ö×BÖÆ—7B"À¢%&–Ö'’–çFVçB6†÷'F7WG2"À¢°¢–æ6ÇVFTÖ÷&UFövvÆS¢G'VRÀ¢–ç6W'DÖ÷&TgFW$–æFWƒ¢Ö÷&UFövvÆT–ç6W'D–æFW‚À¢ÒÀ¢—Ð¢¶Ö÷&T÷Vâò€¢ÆF—b–CÒ&G×6V&6‚ÖÖ÷&RÖf–ÇFW"×æVÂ"6Æ74æÖSÒ&G×6V&6‚Ö–çFVçBÖÖ÷&R×æVÂ"&–ÖÆ&VÃÒ$Ö÷&RÖ6†÷'F7WG2#à¢·&VæFW%&–Â€¢Ö÷&Tf–ÇFW%&–ÂÀ¢&G×6V&6‚Ö–çFVçB×6V6öæF'’×G&6²GÖÖÖ–çFVçB×&–ÂGÖ6²ÖÖ×&ö×BÖÆ—7B"À¢$Ö÷&R–çFVçBÂ6öÆÆV7F–öâÂæB&÷WFR6†÷'F7WG2"À¢²–C¢&G×6V&6‚×6V6öæF'’Ö–çFVçB×&–Â"ÒÀ¢—Ð¢ÂöF—cà¢’¢€¢ÆF—b–CÒ&G×6V&6‚ÖÖ÷&RÖf–ÇFW"×æVÂ"†–FFVâ&–Ö†–FFVãÒ'G'VR"óà¢—Ð¢ÂöF—cà¢’¢çVÆÇÐ¢·6VÆV7FVD–çFVçDææ÷Væ6VÖVçBò€¢Ç6Æ74æÖSÒ'7"ÖöæÇ’"&–ÖÆ—fSÒ'öÆ—FR#à¢·6VÆV7FVD–çFVçDææ÷Væ6VÖVçGÐ¢Â÷à¢’¢çVÆÇÐ¢·6†÷t6FÆöu&W7VÇG2ò€¢ÆF—b–C×¶6FÆöu&W7VÇG4–GÒ6Æ74æÖSÒ&G×ÆFf÷&Ò×6V&6‚×&W7VÇG2"&öÆSÒ&Æ—7F&÷‚"&–ÖÆ&VÃÒ%6V&6‚&W7VÇG2"&–ÖÆ—fSÒ'öÆ—FR#à¢·f—6–&ÆT6FÆötw&÷W2æÖ‚†w&÷W’Óâ€¢Ç6V7F–öâ¶W“×¶w&÷WçG—WÒ6Æ74æÖSÒ&G×ÆFf÷&Ò×6V&6‚Öw&÷W"&–ÖÆ&VÆÆVF'“×¶G×6V&6‚Öw&÷WÒG¶w&÷WçG—WÖÓà¢Æƒ2–C×¶G×6V&6‚Öw&÷WÒG¶w&÷WçG—WÖÓç¶w&÷WæÆ&VÇÓÂöƒ3à¢¶w&÷Wç&W7VÇG2æÖ‚‡&W7VÇB’Óâ°¢6öç7B&W7VÇDVçF—G”–BÒ&W7VÇBæVçF—G”–BÇÂ&W7VÇBæÆ–æ¶VDVçF—G”–BÇÂ&W7VÇBæ–C°¢6öç7B&W6öÇfVE&W7VÇDVçF—G’Ò6FÆöu7FFSòæVçF—F–W4'”–Còå·&W7VÇBæ–EÒÇÂçVÆÃ°¢6öç7B&W6öÇfVEW&´–BÒ&W6öÇfVE&W7VÇDVçF—G’bb†47F—fUW&´FF‡&W6öÇfVE&W7VÇDVçF—G’¢òvWD6æöæ–6Å&W6–FVçEW&´–B‡&W6öÇfVE&W7VÇDVçF—G’¢¢&W7VÇBç&W7VÇEG—RÓÓÒ'W&²"ò&W7VÇBçW&´–BÇÂ&W7VÇBæ–B¢"#°¢6öç7B6öçFVçBÒÃà¢Ç7ããÇ7G&öæsç·&W7VÇBçF—FÆWÓÂ÷7G&öæsãÇ6ÖÆÃç·&W7VÇBç7V'F—FÆRÇÂw&÷WæÆ&VÇÓÂ÷6ÖÆÃãÂ÷7ãà¢Ç7â6Æ74æÖSÒ&G×ÆFf÷&Ò×6V&6‚×&W7VÇBÖ7F–öâ#ç·&W6öÇfVEW&´–Bò$÷VâW&²"¢7G&–ær‡&W7VÇBæ–BÇÂ""’æVæG5v—F‚‚"×÷'FföÆ–ò"’ò$÷Vâ"¢&W7VÇBç&÷WFRò$÷Vâ"¢&W7VÇBæÖ&¶W$VÆ–v–&ÆRò%f–WröâÖ"¢%6†÷rÆ6W2'ÓÂ÷7ãà¢Âóã°¢–b…7G&–ær‡&W7VÇBæ–BÇÂ""’æVæG5v—F‚‚"×÷'FföÆ–ò"’ÇÂ‡&W7VÇDVçF—G”–Bbb‡&W7VÇBæÖ&¶W$VÆ–v–&ÆRÇÂ&W7VÇBæÆ–æ¶VDVçF—G”–B’’’°¢6öç7B&×2ÒæWrU$Å6V&6…&×2‡°¢ÖöFRÀ¢F#¢&Ö"À¢f–ÇFW#¢7F—fTf–ÇFW"ÇÂ$ÆÂ"À¢VW'’À¢VçF—G”–C¢&W7VÇDVçF—G”–BÀ¢Ò“°¢–b‡&W6öÇfVEW&´–B’&×2ç6WB‚'W&´–B"Â&W6öÇfVEW&´–B“°¢&WGW&âÆ¶W“×·&W7VÇBæ–GÒ&öÆSÒ&÷F–öâ"&–×6VÆV7FVCÒ&fÇ6R"FF×6V&6‚×&W7VÇBÖ–C×·&W7VÇBæ–GÒ‡&Vc×¶öÖòG·&×2çFõ7G&–ær‚—ÖÓç¶6öçFVçGÓÂöã°¢Ð¢&WGW&âÆ'WGFöâ¶W“×·&W7VÇBæ–GÒG—SÒ&'WGFöâ"&öÆSÒ&÷F–öâ"&–×6VÆV7FVCÒ&fÇ6R"FF×6V&6‚×&W7VÇBÖ–C×·&W7VÇBæ–GÒöä6Æ–6³×²‚’Óâöä6FÆöu&W7VÇE6VÆV7Còâ‡&W7VÇB—Óç¶6öçFVçGÓÂö'WGFöãã°¢Ò—Ð¢Â÷6V7F–öãà¢’—Ð¢ÂöF—cà¢’¢çVÆÇÐ¢Â÷6V7F–öãà¢ÂöF—cà¢“°§Ð ¦gVæ7F–öâW6UW&ÄÖ7FFR‚’°¢6öç7BÆö6F–öâÒW6TÆö6F–öâ‚“°¢6öç7B·6V&6…&×2Â6WE6V&6…&×5ÒÒW6U6V&6…&×2‚“°¢6öç7BF„ÖöFRÒÆö6F–öâçF†æÖRç7F'G5v—F‚‚"÷'FæW'2"’ò''FæW""¢'&W6–FVçB#°¢6öç7BF…F"Ò&Ö#°¢6öç7B&uF"Ò6V&6…&×2ævWB‚'F""’ÇÂF…F#°¢6öç7B&uæVÂÒ6V&6…&×2ævWB‚'æVÂ"’ÇÂ"#°¢6öç7BÖöFRÒ6V&6…&×2ævWB‚&ÖöFR"’ÓÓÒ''FæW""ò''FæW""¢6V&6…&×2ævWB‚&ÖöFR"’ÓÓÒ'&W6–FVçB"ò'&W6–FVçB"¢F„ÖöFS°¢6öç7B&W6–FVçEæVÄ6æF–FFRÒ&uæVÂÇÂ‡&uF"ÓÓÒ&†öÖR"ò&–æfò"¢&uF"“°¢6öç7BæVÄ6æF–FFRÒÖöFRÓÓÒ'&W6–FVçB"ò&W6–FVçEæVÄ6æF–FFR¢&uæVÂÇÂ&uF#°¢6öç7BæVÅF"ÒÖöFRÓÓÒ''FæW""bbÔôäD•dUõ%DäU%õäTÅ2æ–æ6ÇVFW2‡æVÄ6æF–FFR¢òæVÄ6æF–FFP¢¢ÖöFRÓÓÒ'&W6–FVçB"bbÔôäD•dUõ$U4”DTåEõäTÅ2æ–æ6ÇVFW2‡æVÄ6æF–FFR¢òæVÄ6æF–FFP¢¢"#°¢6öç7BF"Ò&uF"ÓÓÒ'72"ÇÂ&uF"ÓÓÒ&6&B"ò'72"¢&Ö#°¢6öç7BVÖ&VBÒ6V&6…&×2ævWB‚&VÖ&VB"’ÓÓÒ'G'VR#°¢6öç7BÆ–W"Ò6V&6…&×2ævWB‚&Æ–W""’ÇÂ"#°¢6öç7B&÷WFRÒ6V&6…&×2ævWB‚'&÷WFT–B"’ÇÂ6V&6…&×2ævWB‚'&÷WFR"’ÇÂ"#°¢6öç7B6öÆÆV7F–öâÒ6V&6…&×2ævWB‚&6öÆÆV7F–öâ"’ÇÂ&÷WFS°¢6öç7B7F÷–BÒ6V&6…&×2ævWB‚'7F÷–B"’ÇÂ6V&6…&×2ævWB‚'7F÷"’ÇÂ"#°¢6öç7B&÷WFU7FFRÒ6V&6…&×2ævWB‚'&÷WFU7FFR"’ÇÂ"#°¢6öç7B&VçFÄÆ—7F–æt–BÒÆ–W"ÓÓÒ'&VçFÇ2"ò6V&6…&×2ævWB‚&Æ—7F–ær"’ÇÂ""¢"#°¢6öç7B6öÆÆV7F–öäf–ÇFW"ÒvWD6öÆÆV7F–öäf–ÇFW"†6öÆÆV7F–öâ“°¢6öç7BÆ–W$f–ÇFW"ÒvWDÆ–W$f–ÇFW"†Æ–W"“°¢6öç7B&W6–FVçEF$f–ÇFW"ÒÖöFRÓÓÒ'&W6–FVçB"bbæVÄ6æF–FFRÓÓÒ'W&·2 ¢ò%W&·2 ¢¢ÖöFRÓÓÒ'&W6–FVçB"bbæVÄ6æF–FFRÓÓÒ&WfVçG2 ¢ò$WfVçG2 ¢¢ÖöFRÓÓÒ'&W6–FVçB"bbæVÄ6æF–FFRÓÓÒ'6fVB ¢ò%6fVB ¢¢"#°¢6öç7Bf–ÇFW"Ò6V&6…&×2ævWB‚&f–ÇFW""’ÇÂ6öÆÆV7F–öäf–ÇFW"ÇÂ&W6–FVçEF$f–ÇFW"ÇÂ†Æ–W"ÓÓÒ'&VçFÇ2"ò%&VçFÇ2"¢Æ–W$f–ÇFW"ÇÂ†ÖöFRÓÓÒ''FæW""ò$ÆÂ"¢$ÆÂ"’“°¢6öç7B&tVçF—G”–BÒ6V&6…&×2ævWB‚&VçF—G”–B"’ÇÂ6V&6…&×2ævWB‚&VçF—G’"’ÇÂ7F÷–BÇÂ"#°¢6öç7BÆ—7F–æt–BÒ6V&6…&×2ævWB‚&Æ—7F–æt–B"’ÇÂ"#°¢6öç7BÆ—7F–ætVçF—G”–BÒ&W6öÇfTÖVçF—G”Æ–2†Æ—7F–æt–B“°¢6öç7B&W6öÇfVE&tVçF—G”–BÒ&W6öÇfTÖVçF—G”Æ–2‡&tVçF—G”–B“°¢6öç7BVçF—G”–BÒ&VçFÄÆ—7F–æt–BÇÂ†Æ—7F–ætVçF—G”–BÓÓÒ&&F†RÖW7F–â"ò&&F†RÖW7F–â"¢&W6öÇfVE&tVçF—G”–BÇÂÆ—7F–ætVçF—G”–B“°¢6öç7B&ö×BÒ6æ—F—¦TÖ&ö×B‡6V&6…&×2ævWB‚'VW'’"’ÇÂ6V&6…&×2ævWB‚'&ö×B"’ÇÂ6V&6…&×2ævWB‚'"’ÇÂ""ÂÖöFR“°¢6öç7B&F—W2Ò6V&6…&×2ævWB‚'&F—W2"’ÇÂ#RÖ–âvÆ²#°¢6öç7BF—7G&–7BÒ6V&6…&×2ævWB‚&F—7G&–7B"’ÇÂÄÅôäT”t„$õ$„ôôE3°¢6öç7BF–ÖRÒ6V&6…&×2ævWB‚'F–ÖR"’ÇÂ"#°¢6öç7B–çFVçBÒ6V&6…&×2ævWB‚&–çFVçB"’ÇÂ"#°¢6öç7BVçF—G•G—RÒ6V&6…&×2ævWB‚&VçF—G•G—R"’ÇÂ"#°¢6öç7B6×–vä–BÒ6V&6…&×2ævWB‚&6×–vä–B"’ÇÂ6V&6…&×2ævWB‚&6×–vâ"’ÇÂ"#°¢6öç7BW&´–BÒ6V&6…&×2ævWB‚'W&´–B"’ÇÂ6V&6…&×2ævWB‚'W&²"’ÇÂ"#°¢6öç7BWfVçD–BÒ6V&6…&×2ævWB‚&WfVçD–B"’ÇÂ6V&6…&×2ævWB‚&WfVçB"’ÇÂ"#°¢6öç7B'FæW$–BÒ6V&6…&×2ævWB‚''FæW""’ÇÂ"#°¢6öç7B&Wf–Wtf÷"Ò6V&6…&×2ævWB‚'&Wf–Wtf÷""’ÇÂ"#°¢6öç7B&WGW&åFòÒ6V&6…&×2ævWB‚'&WGW&åFò"’ÇÂ"#°¢6öç7B6÷W&6RÒ6V&6…&×2ævWB‚'6÷W&6R"’ÇÂ†VÖ&VBò&VÖ&VFFVBÖÖ"¢&F÷vçF÷vâ×W&·2×vV""“°¢6öç7BWFÔ6×–vâÒ6V&6…&×2ævWB‚'WFÕö6×–vâ"’ÇÂ"#°¢6öç7BG&vW$6Æ÷6VBÒ6V&6…&×2ævWB‚&G&vW$6Æ÷6VB"’ÇÂ"#° ¢gVæ7F–öâWFFR†æW‡B’°¢6öç7B&×2ÒæWrU$Å6V&6…&×2‡6V&6…&×2“°¢ö&¦V7BæVçG&–W2†æW‡B’æf÷$V6‚‚…¶¶W’ÂfÇVUÒ’Óâ°¢–b‡fÇVRÓÓÒVæFVf–æVBÇÂfÇVRÓÓÒçVÆÂÇÂfÇVRÓÓÒ""’&×2æFVÆWFR†¶W’“°¢VÇ6R&×2ç6WB†¶W’Â7G&–ær‡fÇVR’“°¢Ò“°¢6WE6V&6…&×2‡&×2Â²&WÆ6S¢fÇ6RÒ“°¢Ð ¢&WGW&â²ÖöFRÂF"ÂæVÅF"ÂVÖ&VBÂf–ÇFW"ÂÆ–W"Â&÷WFRÂ6öÆÆV7F–öâÂ7F÷–BÂ&÷WFU7FFRÂ&tVçF—G”–BÂVçF—G”–BÂÆ—7F–æt–BÂ&VçFÄÆ—7F–æt–BÂ&ö×BÂ&F—W2ÂF—7G&–7BÂF–ÖRÂ–çFVçBÂVçF—G•G—RÂ6×–vä–BÂW&´–BÂWfVçD–BÂ'FæW$–BÂ&Wf–Wtf÷"Â&WGW&åFòÂ6÷W&6RÂWFÔ6×–vâÂG&vW$6Æ÷6VBÂWFFRÓ°§Ð ¦W‡÷'BFVfVÇBgVæ7F–öâÖvR‚’°¢6öç7Bæf–vFRÒW6Tæf–vFR‚“°¢6öç7BÆö6F–öâÒW6TÆö6F–öâ‚“°¢6öç7B²W6…æVÅ7FFRÂ÷æVÅ7FFRÂVVµæVÅ7FFRÂ6ÆV%æVÅ7F6²ÒÒW6TÖæVÄæf–vF–öâ‚“°¢6öç7B²W6W"Â—4WF†VçF–6FVBÂ—4ÆöF–ætWF‚ÂÆöv÷WBÒÒW6TWF‚‚“°¢6öç7B·&W6–FVçD66÷VçBÂ6WE&W6–FVçD66÷VçEÒÒW6U7FFR†çVÆÂ“°¢W6TVffV7B‚‚’Óâ°¢–b†—4ÆöF–ætWF‚’&WGW&âVæFVf–æVC°¢–b‚—4WF†VçF–6FVB’°¢6WE&W6–FVçD66÷VçB†çVÆÂ“°¢&WGW&âVæFVf–æVC°¢Ð¢ÆWB7F—fRÒG'VS°¢6WE&W6–FVçD66÷VçB‚†7W'&VçB’Óâ&W6–FVçD66÷VçDg&öÔ6öçFW‡B†çVÆÂÂW6W"Â7W'&VçB’“°¢vWE&W6–FVçDÖVÖ&W'6†—‚¢çF†Vâ‚†6öçFW‡B’Óâ°¢–b†7F—fR’6WE&W6–FVçD66÷VçB‚†7W'&VçB’Óâ&W6–FVçD66÷VçDg&öÔ6öçFW‡B†6öçFW‡BÂW6W"Â7W'&VçB’“°¢Ò¢æ6F6‚‚‚’Óâ°¢òò¶VWF†RWF†VçF–6FVB–FVçF—G’f—6–&ÆRv†–ÆRÖVÖ&W'6†—FWF–Ç2&V6öææV7Bà¢Ò“°¢&WGW&â‚’Óâ²7F—fRÒfÇ6S²Ó°¢ÒÂ¶—4WF†VçF–6FVBÂ—4ÆöF–ætWF‚ÂW6W%Ò“°¢6öç7B°¢Æ6W2À¢&W7VÇE7FFS¢66÷VE&W7VÇE7FFRÀ¢&WVW7E7FGW3¢66÷VE&WVW7E7FGW2À¢Æ7EG&–vvW#¢66÷VDÆ7EG&–vvW"À¢6FÆöu7FFRÀ¢'Vå6V&6ƒ¢'Vå66÷VDÖ6V&6‚À¢6V&6„6FÆös¢6V&6…66÷VD6FÆörÀ¢6ÆV%&W7VÇG3¢6ÆV%66÷VDÖ&W7VÇG2À¢ÒÒW6U6V&6„G&—fVäÖVçF—F–W2‚“°¢6öç7BW&Å7FFRÒW6UW&ÄÖ7FFR‚“°¢6öç7B¶–æ—F–ÄÖf–WuÒÒW6U7FFR‚‚’ÓâvWE7F÷&VDÖf–Wr‚’“°¢6öç7B·6V&6‚Â6WE6V&6…ÒÒW6U7FFR‡W&Å7FFRç&ö×B“°¢6öç7B¶7F—fTf–ÇFW"Â6WD7F—fTf–ÇFW%ÒÒW6U7FFR„d”ÅDU%2æ–æ6ÇVFW2‡W&Å7FFRæf–ÇFW"’òW&Å7FFRæf–ÇFW"¢$ÆÂ"“°¢6öç7Bæf–vFTÖ¦÷W&æW’Ò‡WFFW2Ò·ÒÂ÷F–öç2Ò·Ò’Óâ°¢6öç7B&×2ÒæWrU$Å6V&6…&×2†Æö6F–öâç6V&6‚“°¢6öç7BæW‡DÖöFRÒWFFW2æÖöFRÇÂ&×2ævWB‚&ÖöFR"’ÇÂW&Å7FFRæÖöFRÇÂ'&W6–FVçB#°¢6öç7BæW‡EF"ÒWFFW2çF"ÇÂ&×2ævWB‚'F""’ÇÂ&Ö#° ¢&×2ç6WB‚&ÖöFR"ÂæW‡DÖöFR“°¢&×2ç6WB‚'F""ÂæW‡EF"“°¢–b‚&×2ævWB‚&f–ÇFW""’bbæW‡EF"ÓÓÒ&Ö"’&×2ç6WB‚&f–ÇFW""Â7F—fTf–ÇFW"ÇÂ$ÆÂ"“° ¢ö&¦V7BæVçG&–W2‡WFFW2’æf÷$V6‚‚…¶¶W’ÂfÇVUÒ’Óâ°¢–b‡fÇVRÓÓÒVæFVf–æVBÇÂfÇVRÓÓÒçVÆÂÇÂfÇVRÓÓÒ""’&×2æFVÆWFR†¶W’“°¢VÇ6R&×2ç6WB†¶W’Â7G&–ær‡fÇVR’“°¢Ò“° ¢–b†÷F–öç2æ6ÆV%6VÆV7F–öâ’°¢²&VçF—G”–B"Â&VçF—G’"Â&VçF—G•G—R"Â'W&´–B"Â&WfVçD–B"Â&Æ—7F–ær"Â&Æ—7F–æt–B"Â&G&vW$6Æ÷6VB%Òæf÷$V6‚‚†¶W’’Óâ&×2æFVÆWFR†¶W’’“°¢Ð ¢–b†÷F–öç2æ6ÆV%6V&6„6öçFW‡B’°¢²'VW'’"Â'"Â'&ö×B"Â&–çFVçB"Â'F–ÖR"Â&Æ–W""Â&6öÆÆV7F–öâ"Â&6öÆÆV7F–öä–B"Â'&÷WFT–B"Â'7F÷"Â'&F—W2"Â&F—7G&–7B%Òæf÷$V6‚‚†¶W’’Óâ&×2æFVÆWFR†¶W’’“°¢Ð ¢æf–vFR†öÖòG·&×2çFõ7G&–ær‚—ÖÂ²&WÆ6S¢&ööÆVâ†÷F–öç2ç&WÆ6R’Ò“°¢Ó°¢6öç7B·6VÆV7FVD–BÂ6WE6VÆV7FVD–EÒÒW6U7FFR‡W&Å7FFRæVçF—G”–B“°¢6öç7B·6VÆV7FVEÆ6T÷fW'&–FRÂ6WE6VÆV7FVEÆ6T÷fW'&–FUÒÒW6U7FFR†çVÆÂ“°¢6öç7B6VÆV7F–öåG&ç6—F–öå&VbÒW6U&Vb†çVÆÂ“°¢6öç7B6VÆV7F–öäFF6WE&VbÒW6U&Vb…µÒ“°¢6öç7BG&vW%G&–vvW%&VbÒW6U&Vb†çVÆÂ“°¢6öç7B–ä¶–æE&VçE&VbÒW6U&Vb†çVÆÂ“°¢6öç7B6fVD–DÆ—7BÒW6U6fVE7F÷&R‚‡7FFR’Óâ7FFRç6fVD–G2“°¢6öç7B&WÆ6U6fVD–G2ÒW6U6fVE7F÷&R‚‡7FFR’Óâ7FFRç&WÆ6T–G2“°¢6öç7B6fVD–G2ÒW6TÖVÖò‚‚’ÓâæWr6WB‡6fVD–DÆ—7B’Â·6fVD–DÆ—7EÒ“°¢6öç7B6WE6fVD–G2ÒW6T6ÆÆ&6²‚‡WFFW"’Óâ°¢6öç7B7W'&VçBÒæWr6WB‡W6U6fVE7F÷&RævWE7FFR‚’ç6fVD–G2“°¢6öç7BæW‡BÒG—VöbWFFW"ÓÓÒ&gVæ7F–öâ"òWFFW"†7W'&VçB’¢WFFW#°¢&WÆ6U6fVD–G2„'&’æg&öÒ†æW‡BÇÂµÒ’“°¢ÒÂ·&WÆ6U6fVD–G5Ò“°¢W6U6fVDVçF—F–W5&VÇF–ÖR‚“°¢6öç7BWfVçE'7g2ÒW6TWfVçE'7g7F÷&R‚‡7FFR’Óâ„'&’æ—4'&’‡7FFRç'7g2’ò7FFRç'7g2¢µÒ’“°¢6öç7BFDWfVçE'7gÒW6TWfVçE'7g7F÷&R‚‡7FFR’Óâ7FFRæFE'7g“°¢6öç7B&VÖ÷fTWfVçE'7gÒW6TWfVçE'7g7F÷&R‚‡7FFR’Óâ7FFRç&VÖ÷fU'7g“°¢6öç7B¶&÷WD÷VâÂ6WD&÷WD÷VåÒÒW6U7FFR†fÇ6R“°¢6öç7B·&F—W2Â6WE&F—W5ÒÒW6U7FFR‡W&Å7FFRç&F—W2“°¢6öç7B·&W6–FVçE6V&6„–çFVçBÂ6WE&W6–FVçE6V&6„–çFVçEÒÒW6U7FFR‡°¢–çFVçC¢$U4”DTåEô”åDTåEô4ôå4ôÄUô%UEDôå2ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒW&Å7FFRæ–çFVçB’òW&Å7FFRæ–çFVçB¢çVÆÂÀ¢F–ÖS¢$U4”DTåEô”åDTåEõD”ÔUô%UEDôå2ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒW&Å7FFRçF–ÖR’òW&Å7FFRçF–ÖR¢çVÆÂÀ¢Ò“°¢6öç7B¶F—7G&–7BÂ6WDF—7G&–7EÒÒW6U7FFR‡W&Å7FFRæF—7G&–7B“°¢6öç7B·75&W6VçFVBÂ6WE75&W6VçFVEÒÒW6U7FFR†fÇ6R“°¢6öç7B·vÆÆWDFFVBÂ6WEvÆÆWDFFVEÒÒW6U7FFR†fÇ6R“°¢6öç7B·&W6–FVçE$ÖöFÂÂ6WE&W6–FVçE$ÖöFÅÒÒW6U7FFR†çVÆÂ“°¢6öç7B·&VFVVÖVEW&´–G5ÒÒW6U7FFR‚‚’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&âæWr6WB‚“°¢G'’°¢&WGW&âæWr6WB„¥4ôâç'6R‡v–æF÷ræÆö6Å7F÷&vRævWD—FVÒ‚&F÷vçF÷vâ×W&·2×&VFVVÖVB×W&·2"’ÇÂ%µÒ"’“°¢Ò6F6‚°¢&WGW&âæWr6WB‚“°¢Ð¢Ò“°¢6öç7B'V–ÆDÖ7F–öå–ÆöBÒW6T6ÆÆ&6²‚‡Æ6RÒçVÆÂÂ7F–öâÒ&W‡Æ÷&R"Â6÷W&6RÒ'&W6–FVçEöÖ"ÂW‡G&Ò·Ò’Óâ°¢6öç7B&rÒÆ6Sòç&rÇÂ·Ó°¢6öç7BVçF—G”–BÒvWDVçF—G•F÷V6‡ö–çD–B‡Æ6R“°¢6öç7BVçF—G”æÖRÒvWDVçF—G•F÷V6‡ö–çDæÖR‡Æ6R“°¢6öç7BVçF—G•G—RÒv÷&¶fÆ÷tVçF—G•G—R‡Æ6RÇÂ·Ò“°¢6öç7B'FæW$–BÒÆ6Sòç'FæW$–BÇÂ&rç'FæW$–BÇÂ&rç'FæW%ö–BÇÂ&ræ÷væW$–BÇÂ&ræ÷væW%ö–BÇÂ"#°¢6öç7Bv÷&·76T–BÒÆ6Sòçv÷&·76T–BÇÂ&rçv÷&·76T–BÇÂ&rçv÷&·76Uö–BÇÂ'FæW$–BÇÂ"#°¢6öç7B6×–vä–BÒÆ6Sòæ6×–vä–BÇÂ&ræ6×–vä–BÇÂ&ræ6×–våö–BÇÂW&Å7FFRæ6×–vä–BÇÂ"#°¢6öç7B&÷WFRÒG—Vöbv–æF÷rÓÒ'VæFVf–æVB"òG·v–æF÷ræÆö6F–öâçF†æÖWÒG·v–æF÷ræÆö6F–öâç6V&6‡Ö¢"#°¢6öç7BvUW&ÂÒG—Vöbv–æF÷rÓÒ'VæFVf–æVB"òv–æF÷ræÆö6F–öâæ‡&Vb¢"#°¢6öç7Bf÷&ÒÒW‡G&æf÷&ÒbbG—VöbW‡G&æf÷&ÒÓÓÒ&ö&¦V7B"òW‡G&æf÷&Ò¢·Ó°¢6öç7BÖWFFFÒW‡G&æÖWFFFbbG—VöbW‡G&æÖWFFFÓÓÒ&ö&¦V7B"òW‡G&æÖWFFF¢·Ó° ¢&WGW&â°¢–C¢W‡G&æ–BÇÂG¶7F–öçÒÒG¶VçF—G”–GÒÒG´FFRææ÷r‚—ÖÀ¢7F–öâÀ¢ÖöFS¢W&Å7FFRæÖöFRÀ¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢&öf–ÆT–C¢vWEv÷&¶fÆ÷u&öf–ÆT–B‚’À¢6÷W&6RÀ¢vUW&ÂÀ¢&÷WFRÀ¢f–ÇFW#¢7F—fTf–ÇFW"À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢6×–vä–BÀ¢'FæW$–BÀ¢v÷&·76T–BÀ¢Æ—7F–æt–C¢Æ6SòæÆ—7F–æt–BÇÂ&ræÆ—7F–æt–BÇÂ&ræÆ—7F–æuö–BÇÂ""À¢VçF—G“¢°¢–C¢VçF—G”–BÀ¢æÖS¢VçF—G”æÖRÀ¢G—S¢VçF—G•G—RÀ¢6FVv÷'“¢Æ6Sòæ6FVv÷'’ÇÂ&ræ6FVv÷'’ÇÂ""À¢F—7G&–7C¢Æ6SòæF—7G&–7BÇÂ&ræF—7G&–7BÇÂF—7G&–7BÇÂ""À¢FG&W73¢Æ6SòæFG&W72ÇÂ&ræFG&W72ÇÂ""À¢'FæW$–BÀ¢v÷&·76T–BÀ¢6×–vä–BÀ¢'&æC¢Æ6Sòæ'&æBÇÂ&ræ'&æBÇÂ&rç'FæW$æÖRÇÂ&rç'FæW%öæÖRÇÂ""À¢ÒÀ¢7FæF&C¢°¢6FVv÷'“¢f÷&Òæ6FVv÷'’ÇÂÆ6Sòæ6FVv÷'’ÇÂ&ræ6FVv÷'’ÇÂVçF—G•G—RÀ¢–çFVçC¢f÷&Òæ–çFVçBÇÂ7F–öâÀ¢Æ&VÃ¢f÷&ÒæÆ&VÂÇÂÆ6Sòç&–Ö'”7F–öâÇÂ7F–öâÀ¢ÒÀ¢f÷&ÒÀ¢ÖWFFF¢°¢ââæÖWFFFÀ¢F—7G&–7BÀ¢VçF—G”¶–æC¢vWE&W6–FVçDVçF—G”¶–æB‡Æ6R’À¢ÒÀ¢Ó°¢ÒÂ¶7F—fTf–ÇFW"ÂF—7G&–7BÂW&Å7FFRæ6×–vä–BÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæÖöFUÒ“°¢6öç7B÷Vå&W6–FVçE$ÖöFÂÒW6T6ÆÆ&6²†7–æ2‡Æ6RÒçVÆÂÂ7F–öâÒ'6†÷uö6&B"Â6÷W&6RÒ'&W6–FVçEöÖ"’Óâ°¢–b‚—4WF†VçF–6FVB’°¢æf–vFR†÷&W6–FVçG2öÆöv–ã÷&WGW&åFóÒG¶Væ6öFUU$”6ö×öæVçB†G¶Æö6F–öâçF†æÖWÒG¶Æö6F–öâç6V&6‡Ö—Ö“°¢&WGW&ã°¢Ð¢6öç7B%Æ6RÒÆ6RÇÂ$U4”DTåEô4$EôTåD•E“°¢6öç7B–ÆöBÒ'V–ÆE&W6–FVçE%–ÆöB‡²Æ6S¢Æ6RÇÂçVÆÂÂ7F–öâÂ6÷W&6RÂ&W6–FVçD66÷VçBÒ“°¢G'’°¢6öç7B6W76–öâÒv—B7&VFU&W6–FVçE%6W76–öâ‡°¢W&´–C¢7F–öâÓÓÒ'W6U÷W&²"ò–ÆöBæVçF—G”–B¢VæFVf–æVBÀ¢W'÷6S¢7F–öâÓÓÒ'W6U÷W&²"ò'W&µ÷&VFV×F–öâ"¢'&W6–FVçE÷72"À¢6÷W&6U7W&f6S¢6÷W&6RÀ¢Ò“°¢6öç7B6V7W&U–ÆöBÒ²ââç–ÆöBÂ%fÇVS¢6W76–öâç%fÇVRÂ%6W76–öä–C¢6W76–öâç6W76–öä–BÓ°¢&V6÷&E&W6–FVçEF÷V6‡ö–çB‡6V7W&U–ÆöB“°¢6WE75&W6VçFVB‡G'VR“°¢6WE&W6–FVçE$ÖöFÂ‡²ââç6V7W&U–ÆöBÂÆ6S¢%Æ6RÂ&VFV×F–öå7FGW3¢'&VG’"ÂW‡—&W4C¢6W76–öâæW‡—&W4BÒ“°¢Ò6F6‚†W'&÷"’°¢6öç6öÆRçv&â‚%&W6–FVçB"6W76–öâ6÷VÆBæ÷B&R7&VFVB"ÂW'&÷"“°¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"’v–æF÷ræÆW'B†W'&÷#òæÖW76vRÇÂ%vR6÷VÆFâwB&W&R–÷W"&W6–FVçB72âG'’v–ââ"“°¢Ð¢ÒÂ¶—4WF†VçF–6FVBÂÆö6F–öâçF†æÖRÂÆö6F–öâç6V&6‚Âæf–vFRÂ&W6–FVçD66÷VçEÒ“°¢6öç7B&W6–FVçD6&E–ÆöBÒW6TÖVÖò‚‚’Óâ'V–ÆE&W6–FVçE%–ÆöB‡²7F–öã¢'6†÷uö6&B"Â6÷W&6S¢'&W6–FVçEö6&B"Â&W6–FVçD66÷VçBÒ’Â·&W6–FVçD66÷VçEÒ“°¢6öç7B&W6VçE&W6–FVçE72ÒW6T6ÆÆ&6²‚†WfVçB’Óâ°¢WfVçCòç&WfVçDFVfVÇCòâ‚“°¢WfVçCòç7F÷&÷vF–öãòâ‚“°¢fö–B÷Vå&W6–FVçE$ÖöFÂ†çVÆÂÂ'6†÷uö6&B"Â'&W6–FVçE÷72"“°¢ÒÂ¶÷Vå&W6–FVçE$ÖöFÅÒ“°¢6öç7B6fU&W6–FVçE74f÷$ÆFW"ÒW6T6ÆÆ&6²†7–æ2†WfVçB’Óâ°¢WfVçCòç&WfVçDFVfVÇCòâ‚“°¢WfVçCòç7F÷&÷vF–öãòâ‚“°¢–b‚—4WF†VçF–6FVB’°¢æf–vFR†÷&W6–FVçG2öÆöv–ã÷&WGW&åFóÒG¶Væ6öFUU$”6ö×öæVçB†G¶Æö6F–öâçF†æÖWÒG¶Æö6F–öâç6V&6‡Ö—Ö“°¢&WGW&ã°¢Ð¢G'’°¢v—B÷7Ev÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â°¢7F–öã¢&FE÷vÆÆWB"À¢G—S¢'&W6–FVçEö6&B"À¢&öf–ÆT–C¢vWEv÷&¶fÆ÷u&öf–ÆT–B‚’À¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢6÷W&6S¢'&W6–FVçEö6&E÷6†VWB"À¢–ÆöC¢&W6–FVçD6&E–ÆöBÀ¢Ò“°¢6WEvÆÆWDFFVB‡G'VR“°¢Ò6F6‚†W'&÷"’°¢6öç6öÆRçv&â‚%vÆÆWB7F–öâf–ÆVB"ÂW'&÷"“°¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"’°¢v–æF÷ræÆW'B‚%vR6÷VÆFâwBFBF†R6&B&–v‡Bæ÷râÆV6RG'’v–ââ"“°¢Ð¢Ð¢ÒÂ¶—4WF†VçF–6FVBÂÆö6F–öâçF†æÖRÂÆö6F–öâç6V&6‚Âæf–vFRÂ&W6–FVçD6&E–ÆöEÒ“°¢6öç7B·&W7VÇG4W‡æFVBÂ6WE&W7VÇG4W‡æFVEÒÒW6U7FFR†fÇ6R“°¢6öç7B¶7F—fT&÷GFöÕF"Â6WD7F—fT&÷GFöÕF%ÒÒW6U7FFR‚‚’Óâ€¢W&Å7FFRçæVÅF ¢òW&Å7FFRçæVÅF ¢¢W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bbW&Å7FFRçF"ÓÓÒ&Ö"bb²%W&·2"Â$WfVçG2"Â%6fVB%Òæ–æ6ÇVFW2‡W&Å7FFRæf–ÇFW"¢òW&Å7FFRæf–ÇFW"çFôÆ÷vW$66R‚¢¢&Ö ¢’“°¢6öç7B¶7F—fUW&·4G&vW%7FFRÂ6WD7F—fUW&·4G&vW%7FFUÒÒW6U7FFR‚‚’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&â&W‡æFVB#°¢G'’°¢6öç7B6fVE7FFRÒv–æF÷rç6W76–öå7F÷&vRævWD—FVÒ‚&GÖ7F—fR×W&·2ÖG&vW"×7FFR"“°¢&WGW&âæ÷&ÖÆ—¦TG&vW%7FFR‡6fVE7FFRÂ&Æ—7B"“°¢Ò6F6‚°¢&WGW&â&W‡æFVB#°¢Ð¢Ò“°¢6öç7BWFFT7F—fUW&·4G&vW%7FFRÒW6T6ÆÆ&6²‚†æW‡E7FFR’Óâ°¢6öç7B6fU7FFRÒæ÷&ÖÆ—¦TG&vW%7FFR†æW‡E7FFRÂ&Æ—7B"“°¢6WD7F—fUW&·4G&vW%7FFR‡6fU7FFR“°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ‚&GÖ7F—fR×W&·2ÖG&vW"×7FFR"Â6fU7FFR“°¢Ò6F6‚°¢òò6W76–öâW'6—7FVæ6R—2÷F–öæÃ²–âÖÖVÖ÷'’6†VWB7FFR&VÖ–ç2W6&ÆRà¢Ð¢ÒÂµÒ“°¢6öç7B¶FWF–ÄG&vW%7FFRÂ6WDFWF–ÄG&vW%7FFUÒÒW6U7FFR‚‚’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&â&ÖVF—VÒ#°¢G'’°¢6öç7B6fVE7FFRÒv–æF÷rç6W76–öå7F÷&vRævWD—FVÒ‚&GÖFWF–ÂÖG&vW"×7FFR"“°¢&WGW&â²'VV²"Â&ÖVF—VÒ"Â&gVÆÂ%Òæ–æ6ÇVFW2‡6fVE7FFR’ò6fVE7FFR¢&ÖVF—VÒ#°¢Ò6F6‚°¢&WGW&â&ÖVF—VÒ#°¢Ð¢Ò“°¢6öç7BFWF–ÅæVÄæÇ—F–75&VbÒW6U&Vb†æWr6WB‚’“°¢6öç7BWFFTFWF–ÄG&vW%7FFRÒW6T6ÆÆ&6²‚†æW‡E7FFR’Óâ°¢6öç7B6fU7FFRÒæ÷&ÖÆ—¦TG&vW%7FFR†æW‡E7FFRÂ&FWF–Â"“°¢6WDFWF–ÄG&vW%7FFR‡6fU7FFR“°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ‚&GÖFWF–ÂÖG&vW"×7FFR"Â6fU7FFR“°¢Ò6F6‚°¢òòG&vW"×7FFRW'6—7FVæ6R—2÷F–öæÂà¢Ð¢ÒÂµÒ“°¢6öç7B¶7F—fT6×–vå7FWÂ6WD7F—fT6×–vå7FWÒÒW6U7FFR‡W&Å7FFRæ6×–vä–BÇÂ&6×–vâÖgFW"×v÷&²ÖF–æ–ær"“°¢6öç7B¶6ÇW7FW$G&vW"Â6WD6ÇW7FW$G&vW%ÒÒW6U7FFR†çVÆÂ“°¢6öç7B¶6ÇW7FW$G&vW%7FFRÂ6WD6ÇW7FW$G&vW%7FFUÒÒW6U7FFR‚&ÖVF—VÒ"“°¢6öç7B¶Ö¦ööÒÂ6WDÖ¦ööÕÒÒW6U7FFR†–æ—F–ÄÖf–Wrç¦ööÒ“°¢6öç7B·f–Ww÷'D&÷VæG2Â6WEf–Ww÷'D&÷VæG5ÒÒW6U7FFR†çVÆÂ“°¢6öç7BÖ¦ööÕ&VbÒW6U&Vb†–æ—F–ÄÖf–Wrç¦ööÒ“°¢6öç7Bf–Ww÷'D&÷VæG5&VbÒW6U&Vb†çVÆÂ“°¢6öç7B&V6VçE66÷VEVW'•&VbÒW6U&Vb‚""“°¢6öç7Bf–WvVE–ä¶W—5&VbÒW6U&Vb†æWr6WB‚’“°¢6öç7B·6V&6„&VF—'G’Â6WE6V&6„&VF—'G•ÒÒW6U7FFR†fÇ6R“°¢6öç7B¶6öç6öÆT6öÆÆ6VBÂ6WD6öç6öÆT6öÆÆ6VEÒÒW6U7FFR†fÇ6R“°¢6öç7B¶–çFVÄ÷VâÂ6WD–çFVÄ÷VåÒÒW6U7FFR†fÇ6R“°¢6öç7B¶f–ÇFW'4÷VâÂ6WDf–ÇFW'4÷VåÒÒW6U7FFR†fÇ6R“°¢6öç7B¶æV–v†&÷&†ööG4÷VâÂ6WDæV–v†&÷&†ööG4÷VåÒÒW6U7FFR†fÇ6R“° ¢W6TVffV7B‚‚’Óâ°¢–b‡W&Å7FFRæ6×–vä–BbbW&Å7FFRæ6×–vä–BÓÒ7F—fT6×–vå7FW’°¢6WD7F—fT6×–vå7FW‡W&Å7FFRæ6×–vä–B“°¢Ð¢ÒÂ¶7F—fT6×–vå7FWÂW&Å7FFRæ6×–vä–EÒ“°¢6öç7B·6V6öæF'•&–Ä÷VâÂ6WE6V6öæF'•&–Ä÷VåÒÒW6U7FFR†fÇ6R“°¢6öç7B¶Öç7vW"Â6WDÖç7vW%ÒÒW6U7FFR†çVÆÂ“°¢6öç7B·W6W$†4æf–vFVDÖÂ6WEW6W$†4æf–vFVDÖÒÒW6U7FFR‚‚’Óâ°¢–b†–æ—F–ÄÖf–Wrç¦ööÒãÒ5E$TUEôÄUdTÅõ¤ôôÒ’&WGW&âG'VS°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&âfÇ6S°¢G'’°¢&WGW&âv–æF÷rç6W76–öå7F÷&vRævWD—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’’ÓÓÒ'G'VR#°¢Ò6F6‚°¢&WGW&âfÇ6S°¢Ð¢Ò“°¢6öç7B·W6W$–çFW&7F–öä6öçFW‡BÂ6WEW6W$–çFW&7F–öä6öçFW‡EÒÒW6U7FFR‚‚’Óâ°¢–b‡G—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&â²7F–öç3¢µÒÂ6V&6†W3¢µÒÂ6VÆV7FVE–ç3¢µÒÂ6fVE–ç3¢µÒÓ°¢G'’°¢6öç7B'6VBÒ¥4ôâç'6R‡v–æF÷rç6W76–öå7F÷&vRævWD—FVÒ„ÔõU4U%ô4ôåDU…Eõ5Dõ$tUô´U’’ÇÂ&çVÆÂ"“°¢&WGW&â'6VBbbG—Vöb'6VBÓÓÒ&ö&¦V7B ¢ò²7F–öç3¢'6VBæ7F–öç2ÇÂµÒÂ6V&6†W3¢'6VBç6V&6†W2ÇÂµÒÂ6VÆV7FVE–ç3¢'6VBç6VÆV7FVE–ç2ÇÂµÒÂ6fVE–ç3¢'6VBç6fVE–ç2ÇÂµÒÐ¢¢²7F–öç3¢µÒÂ6V&6†W3¢µÒÂ6VÆV7FVE–ç3¢µÒÂ6fVE–ç3¢µÒÓ°¢Ò6F6‚°¢&WGW&â²7F–öç3¢µÒÂ6V&6†W3¢µÒÂ6VÆV7FVE–ç3¢µÒÂ6fVE–ç3¢µÒÓ°¢Ð¢Ò“°¢6öç7B¶VçF—G”ç7vW"Â6WDVçF—G”ç7vW%ÒÒW6U7FFR†çVÆÂ“°¢6öç7B¶VçF—G”76—7FçDÆöF–ærÂ6WDVçF—G”76—7FçDÆöF–æuÒÒW6U7FFR†fÇ6R“°¢6öç7B·6VÆV7FVDG&vW$6Æ÷6VBÂ6WE6VÆV7FVDG&vW$6Æ÷6VEÒÒW6U7FFR†fÇ6R“°¢6öç7B·6VÆV7FVDG&vW$Ö–æ–Ö—¦VBÂ6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VEÒÒW6U7FFR†fÇ6R“°¢6öç7B¶æF—fTG&vW%7FFRÂ6WDæF—fTG&vW%7FFUÒÒW6U7FFR‚&W‡æFVB"“°¢6öç7B6V&6„–çWE&VbÒW6U&Vb†çVÆÂ“°¢6öç7B6V&6…&öÆÇW&VbÒW6U&Vb†çVÆÂ“°¢6öç7BWFFUf–Ww÷'D&÷VæG2ÒW6T6ÆÆ&6²‚†&÷VæG2’Óâ°¢f–Ww÷'D&÷VæG5&Vbæ7W'&VçBÒ&÷VæG3°¢–b€¢W6W$†4æf–vFVDÖb`¢66÷VDÆ7EG&–vvW"b`¢66÷VE&W7VÇE7FFRç&W7VÇD–G2æÆVæwF‚b`¢†4ÖVæ–ævgVÄ&÷VæG46†ævR‡66÷VE&W7VÇE7FFRæ&÷VæG2Â&÷VæG2¢’°¢6WE6V&6„&VF—'G’‡G'VR“°¢Ð¢6WEf–Ww÷'D&÷VæG2‚†7W'&VçB’Óâ°¢–b€¢7W'&VçBb`¢ÖF‚æ'2†7W'&VçBææ÷'F‚Ò&÷VæG2ææ÷'F‚’Âãb`¢ÖF‚æ'2†7W'&VçBç6÷WF‚Ò&÷VæG2ç6÷WF‚’Âãb`¢ÖF‚æ'2†7W'&VçBæV7BÒ&÷VæG2æV7B’Âãb`¢ÖF‚æ'2†7W'&VçBçvW7BÒ&÷VæG2çvW7B’Âãb`¢ÖF‚æ'2‚†7W'&VçBç¦ööÒÇÂ’Ò†&÷VæG2ç¦ööÒÇÂ’’Âãb`¢ÖF‚æ'2‚†7W'&VçBæ6VçFW#òæÆBÇÂ’Ò†&÷VæG2æ6VçFW#òæÆBÇÂ’’Âãb`¢ÖF‚æ'2‚†7W'&VçBæ6VçFW#òæÆærÇÂ’Ò†&÷VæG2æ6VçFW#òæÆærÇÂ’’Âã¢’°¢&WGW&â7W'&VçC°¢Ð¢&WGW&â&÷VæG3°¢Ò“°¢ÒÂ·66÷VDÆ7EG&–vvW"Â66÷VE&W7VÇE7FFRæ&÷VæG2Â66÷VE&W7VÇE7FFRç&W7VÇD–G2æÆVæwF‚ÂW6W$†4æf–vFVDÖÒ“°¢W6TVffV7B‚‚’Óâ°¢Ö¦ööÕ&Vbæ7W'&VçBÒÖ¦ööÓ°¢ÒÂ¶Ö¦ööÕÒ“°¢6öç7B&V6÷&DÖW6W$7F–öâÒW6T6ÆÆ&6²‚‡G—RÂFWF–ÂÒ·Ò’Óâ°¢6öç7B7F–öâÒ°¢G—RÀ¢ââæFWF–ÂÀ¢F–ÖW7F×¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢Ó°¢6WEW6W$–çFW&7F–öä6öçFW‡B‚†7W'&VçB’Óâ°¢6öç7B6V&6†W2ÒG—RÓÓÒ'6V&6‚"bbFWF–ÂçVW'¢ò¶FWF–ÂçVW'’Ââââ†7W'&VçBç6V&6†W2ÇÂµÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒFWF–ÂçVW'’•Òç6Æ–6RƒÂ‚¢¢†7W'&VçBç6V&6†W2ÇÂµÒ’ç6Æ–6RƒÂ‚“°¢6öç7B6VÆV7FVE–ç2ÒG—RÓÓÒ'6VÆV7E÷–â"bbFWF–ÂæVçF—G”–@¢ò¶FWF–ÂæVçF—G”–BÂâââ†7W'&VçBç6VÆV7FVE–ç2ÇÂµÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒFWF–ÂæVçF—G”–B•Òç6Æ–6RƒÂ"¢¢†7W'&VçBç6VÆV7FVE–ç2ÇÂµÒ’ç6Æ–6RƒÂ"“°¢6öç7B6fVE–ç2ÒG—RÓÓÒ'6fR"bbFWF–ÂæVçF—G”–@¢ò¶FWF–ÂæVçF—G”–BÂâââ†7W'&VçBç6fVE–ç2ÇÂµÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒFWF–ÂæVçF—G”–B•Òç6Æ–6RƒÂ#¢¢G—RÓÓÒ'Vç6fR"bbFWF–ÂæVçF—G”–@¢ò†7W'&VçBç6fVE–ç2ÇÂµÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒFWF–ÂæVçF—G”–B’ç6Æ–6RƒÂ#¢¢†7W'&VçBç6fVE–ç2ÇÂµÒ’ç6Æ–6RƒÂ#“°¢6öç7BæW‡BÒ°¢7F–öç3¢¶7F–öâÂâââ†7W'&VçBæ7F–öç2ÇÂµÒ•Òç6Æ–6RƒÂC’À¢6V&6†W2À¢6VÆV7FVE–ç2À¢6fVE–ç2À¢Ó°¢G'’°¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ„ÔõU4U%ô4ôåDU…Eõ5Dõ$tUô´U’Â¥4ôâç7G&–æv–g’†æW‡B’“°¢Ð¢Ò6F6‚°¢òò6W76–öâÖVÖ÷'’—2&W7BÖVff÷'BæB6†÷VÆBæWfW"&Æö6²Ö&V†f–÷"à¢Ð¢&WGW&âæW‡C°¢Ò“°¢ÒÂµÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‡W&Å7FFRçæVÅF"’°¢6WD7F—fT&÷GFöÕF"‡W&Å7FFRçæVÅF"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WE6VÆV7FVD–B‚""“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢Ð¢ÒÂ·W&Å7FFRçæVÅF%Ò“°¢W6TVffV7B‚‚’Óâ°¢–b‡W&Å7FFRçæVÅF"ÓÒ'W&·2"ÇÂ6VÆV7FVD–B’&WGW&ã°¢6öç7B&Wf–÷W2ÒVVµæVÅ7FFR‚“°¢–b‚&Wf–÷W2’&WGW&ã°¢WFFT7F—fUW&·4G&vW%7FFR‡&Wf–÷W2æG&vW%7FFR“°¢v–æF÷rç&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢6öç7BÆ—7BÒFö7VÖVçBçVW'•6VÆV7F÷"‚%¶FFÖ7F—fR×W&·2×67&öÆÃÒwG'VRuÒ"“°¢–b†Æ—7B’Æ—7Bç67&öÆÅF÷Ò&Wf–÷W2ç67&öÆÅF÷ÇÂ°¢–b‡&Wf–÷W2æfö7W4–B’Fö7VÖVçBævWDVÆVÖVçD'”–B‡&Wf–÷W2æfö7W4–B“òæfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢Ò“°¢ÒÂ·VVµæVÅ7FFRÂ6VÆV7FVD–BÂWFFT7F—fUW&·4G&vW%7FFRÂW&Å7FFRçæVÅF%Ò“°¢6öç7B·VÇ6–æu–ä–BÂ6WEVÇ6–æu–ä–EÒÒW6U7FFR‚""“°¢6öç7B¶vVçDf÷&ÕÆ6T–BÂ6WDvVçDf÷&ÕÆ6T–EÒÒW6U7FFR‚""“°¢6öç7B¶vVçDf÷&Õ7V&Ö—GFVBÂ6WDvVçDf÷&Õ7V&Ö—GFVEÒÒW6U7FFR†fÇ6R“°¢W6TVffV7B‚‚’Óâ°¢6WE6V&6‚‡W&Å7FFRç&ö×B“°¢ÒÂ·W&Å7FFRç&ö×EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢ÒÂ·6VÆV7FVD–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b†6öç6öÆT6öÆÆ6VBÇÂW&Å7FFRçF"ÓÒ&Ö"’&WGW&âVæFVf–æVC°¢6öç7Bfö7W4–BÒv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢6V&6„–çWE&Vbæ7W'&VçCòæfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢ÒÂƒ“°¢&WGW&â‚’Óâv–æF÷ræ6ÆV%F–ÖV÷WB†fö7W4–B“°¢ÒÂ¶6öç6öÆT6öÆÆ6VBÂW&Å7FFRçF%Ò“° ¢W6TVffV7B‚‚’Óâ°¢6WD7F—fTf–ÇFW"„d”ÅDU%2æ–æ6ÇVFW2‡W&Å7FFRæf–ÇFW"’òW&Å7FFRæf–ÇFW"¢$ÆÂ"“°¢ÒÂ·W&Å7FFRæf–ÇFW%Ò“° ¢W6TVffV7B‚‚’Óâ°¢–b‚W&Å7FFRæVçF—G”–B’°¢6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçBÒçVÆÃ°¢6VÆV7F–öäFF6WE&Vbæ7W'&VçBÒµÓ°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢&WGW&ã°¢Ð¢6öç7BæW‡E6VÆV7FVD–BÒ&W6öÇfTÖVçF—G”Æ–2‡W&Å7FFRæVçF—G”–B“°¢6öç7BG&ç6—F–öâÒ6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçC°¢6öç7BG&ç6—F–öåÆ6RÐ¢G&ç6—F–öâbbG&ç6—F–öâæVçF—G”–BÓÓÒæW‡E6VÆV7FVD–BòG&ç6—F–öâçÆ6R¢çVÆÃ°¢6WE6VÆV7FVD–B†æW‡E6VÆV7FVD–B“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR‚†7W'&VçB’Óà¢7W'&VçBbb&W6öÇfTÖVçF—G”Æ–2†7W'&VçBæ–B’ÓÓÒæW‡E6VÆV7FVD–Bò7W'&VçB¢G&ç6—F–öåÆ6RÀ¢“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB†fÇ6R“°¢ÒÂ·W&Å7FFRæVçF—G”–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚W&Å7FFRæG&vW$6Æ÷6VB’&WGW&ã°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢ÒÂ·W&Å7FFRæG&vW$6Æ÷6VEÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚W&Å7FFRç&tVçF—G”–B’&WGW&ã°¢–b‚õâ†6×–vçÇW&·ÆöffW'ÆWfVçGÇ'FæW'Æ6—f–7ÆF—66÷fW'—Ç&÷WFWÆ'&æB’Òö’çFW7B‡W&Å7FFRç&tVçF—G”–B’’&WGW&ã°¢6öç7BV&Æ–5&÷W'G”–BÒ&W6öÇfU&÷W'G•W&ÄVçF—G”–B‡W&Å7FFRç&tVçF—G”–B“°¢–b‚V&Æ–5&÷W'G”–BÇÂV&Æ–5&÷W'G”–BÓÓÒW&Å7FFRç&tVçF—G”–B’&WGW&ã°¢6öç7BæW‡BÒ²VçF—G”–C¢V&Æ–5&÷W'G”–BÓ°¢–b‚W&Å7FFRæÆ—7F–æt–B’æW‡BæÆ—7F–æt–BÒ&W6öÇfU&÷W'G”Æ—7F–æuW&Ä–B‡W&Å7FFRç&tVçF—G”–B“°¢W&Å7FFRçWFFR†æW‡B“°¢ÒÂ·W&Å7FFRç&tVçF—G”–BÂW&Å7FFRæÆ—7F–æt–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6WDvVçDf÷&ÕÆ6T–B‚""“°¢6WDvVçDf÷&Õ7V&Ö—GFVB†fÇ6R“°¢ÒÂ·6VÆV7FVD–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6WDF—7G&–7B‡W&Å7FFRæF—7G&–7B“°¢ÒÂ·W&Å7FFRæF—7G&–7EÒ“° ¢W6TVffV7B‚‚’Óâ°¢6WD7F—fTf–ÇFW"„d”ÅDU%2æ–æ6ÇVFW2‡W&Å7FFRæf–ÇFW"’òW&Å7FFRæf–ÇFW"¢$ÆÂ"“°¢ÒÂ·W&Å7FFRæf–ÇFW%Ò“° ¢6öç7BVffV7F—fU6V&6‚ÒW6TÖVÖò‚‚’Óâ°¢&WGW&â6æ—F—¦TÖ&ö×B‡6V&6‚ÂW&Å7FFRæÖöFR“°¢ÒÂ·6V&6‚ÂW&Å7FFRæÖöFUÒ“°¢W6TVffV7B‚‚’Óâ°¢6öç7BVW'’ÒVffV7F—fU6V&6‚çG&–Ò‚“°¢–b‚VW'’’°¢fö–B6V&6…66÷VD6FÆör‚""“°¢&WGW&âVæFVf–æVC°¢Ð¢–b‡VW'’æÆVæwF‚Â"’&WGW&âVæFVf–æVC°¢6öç7BF–ÖV÷WD–BÒv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢fö–B6V&6…66÷VD6FÆör‡VW'’ÂÆ6W2ÂW&Å7FFRæÖöFR“°¢ÒÂ#“°¢&WGW&â‚’Óâv–æF÷ræ6ÆV%F–ÖV÷WB‡F–ÖV÷WD–B“°¢ÒÂ¶VffV7F—fU6V&6‚ÂÆ6W2Â6V&6…66÷VD6FÆörÂW&Å7FFRæÖöFUÒ“°¢6öç7B6öç6öÆT†47F—fUv÷&²Ò&ööÆVâ†VffV7F—fU6V&6‚ÇÂÖç7vW"ÇÂf–ÇFW'4÷VâÇÂæV–v†&÷&†ööG4÷VâÇÂ–çFVÄ÷Vâ“°¢6öç7B'V–ÆE66÷VDÖVW'’ÒW6T6ÆÆ&6²‚‡°¢VW'’ÒVffV7F—fU6V&6‚À¢f–ÇFW$÷fW'&–FRÒ7F—fTf–ÇFW"À¢–çFVçD÷fW'&–FRÒ""À¢6öÆÆV7F–öä–BÒW&Å7FFRæ6öÆÆV7F–öâÀ¢7F—fTVçF—G”–BÒ6VÆV7FVD–BÇÂW&Å7FFRæVçF—G”–BÀ¢G&–vvW"Ò'6V&6‚"À¢Æ–Ö—BÀ¢ÒÒ·Ò’Óâ°¢6öç7Bæ÷&ÖÆ—¦VEVW'’Ò6æ—F—¦TÖ&ö×B‡VW'’ÇÂ""ÂW&Å7FFRæÖöFR“°¢6öç7B'6VD–çFVçBÒ'6TÖ–çFVçB†æ÷&ÖÆ—¦VEVW'’ÇÂf–ÇFW$÷fW'&–FRÂW&Å7FFRæÖöFR“°¢6öç7B6öÆÆV7F–öâÒ6öÆÆV7F–öä–BòvWDÖ6öÆÆV7F–öä'”–B†6öÆÆV7F–öä–B’¢çVÆÃ°¢6öç7B6æöæ–6Äf–ÇFW"ÒvWD6æöæ–6Å6V&6„–çFVçDf–ÇFW"†f–ÇFW$÷fW'&–FR“°¢6öç7B&WVW7D&÷VæG2Òf–Ww÷'D&÷VæG5&Vbæ7W'&VçC°¢6öç7B&WVW7E¦ööÒÒÖ¦ööÕ&Vbæ7W'&VçC°¢6öç7B—4Öö&–ÆUf–Ww÷'BÒG—Vöbv–æF÷rÓÒ'VæFVf–æVB"bbv–æF÷ræÖF6„ÖVF–òâ‚"†Ö‚×v–GFƒ¢scw‚’"“òæÖF6†W3°¢6öç7B—4VçF—G”Æöö·WÒ&ööÆVâ†7F—fTVçF—G”–B“°¢6öç7B—5&÷WFTÆöö·WÒ&ööÆVâ†6öÆÆV7F–öãòç7F÷–G3òæÆVæwF‚“°¢6öç7B—4F—66÷fW'•6V&6‚Ò&ööÆVâ†æ÷&ÖÆ—¦VEVW'’ÇÂ–çFVçD÷fW'&–FRÇÂW&Å7FFRæ–çFVçBÇÂ6æöæ–6Äf–ÇFW"ÓÒ$ÆÂ"“°¢6öç7BFVfVÇDÆ–Ö—BÒÆ–Ö—BÇÂ€¢—5&÷WFTÆöö·Wò6öÆÆV7F–öâç7F÷–G2æÆVæwF‚ ¢—4VçF—G”Æöö·Wòb ¢—4F—66÷fW'•6V&6€¢ò—4Öö&–ÆUf–Ww÷'BòÔôD•44õdU%•ôÄ”Ô•E2æÖ…f—6–&ÆTÖö&–ÆR¢ÔôD•44õdU%•ôÄ”Ô•E2æÖ…f—6–&ÆTFW6·F÷ ¢¢—4Öö&–ÆUf–Ww÷'BòÔôD•44õdU%•ôÄ”Ô•E2æÖö&–ÆR¢ÔôD•44õdU%•ôÄ”Ô•E2æFW6·F÷ ¢“° ¢&WGW&â°¢VW'“¢æ÷&ÖÆ—¦VEVW'’À¢–çFVçC¢–çFVçD÷fW'&–FRÇÂW&Å7FFRæ–çFVçBÇÂ'6VD–çFVçBæ–çFVçG3òå³ÒÇÂvWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†6æöæ–6Äf–ÇFW"Âæ÷&ÖÆ—¦VEVW'’’À¢f–ÇFW#¢6æöæ–6Äf–ÇFW"À¢VF–Væ6TÖöFS¢W&Å7FFRæÖöFRÀ¢F—7G&–7C¢'6VD–çFVçBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò""¢F—7G&–7B’À¢7W'&VçD&÷VæG3¢&WVW7D&÷VæG2À¢Ö6VçFW#¢&WVW7D&÷VæG3òæ6VçFW"ÇÂ²ÆC¢U5D”åô4TåDU%³ÒÂÆæs¢U5D”åô4TåDU%³ÒÒÀ¢¦ööÓ¢&WVW7D&÷VæG3òç¦ööÒÇÂ&WVW7E¦ööÒÀ¢&F—W2À¢7F—fTVçF—G”–BÀ¢&÷WFT–C¢6öÆÆV7F–öãòæ–BÇÂ""À¢&÷WFT–G3¢6öÆÆV7F–öãòç7F÷–G2ÇÂµÒÀ¢6fVDVçF—G”–G3¢6æöæ–6Äf–ÇFW"ÓÓÒ%6fVB"ò²ââç6fVD–G5Ò¢µÒÀ¢'FæW$–C¢W&Å7FFRç'FæW$–BÀ¢6×–vä–C¢W&Å7FFRæ6×–vä–BÀ¢W&´–C¢W&Å7FFRçW&´–BÀ¢WfVçD–C¢W&Å7FFRæWfVçD–BÀ¢÷Väæ÷s¢õÆ"†÷Vâæ÷wÇ&–v‡Bæ÷r•Æ"ö’çFW7B†æ÷&ÖÆ—¦VEVW'’’À¢†5W&³¢6æöæ–6Äf–ÇFW"ÓÓÒ%W&·2"ÇÂõÆ"‡W&·ÆöffW'Ç&W6–FVçB6&GÆ–æ¶–æGÆ–â¶–æB•Æ"ö’çFW7B†æ÷&ÖÆ—¦VEVW'’’À¢&W7VÇDÆ–Ö—C¢ÖF‚æÖ–âƒ#RÂFVfVÇDÆ–Ö—B’À¢7W'6÷#¢""À¢G&–vvW"À¢Ó°¢ÒÂ¶7F—fTf–ÇFW"ÂF—7G&–7BÂVffV7F—fU6V&6‚Â&F—W2Â6fVD–G2Â6VÆV7FVD–BÂW&Å7FFRæ6×–vä–BÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæVçF—G”–BÂW&Å7FFRæWfVçD–BÂW&Å7FFRæ–çFVçBÂW&Å7FFRæÖöFRÂW&Å7FFRç'FæW$–BÂW&Å7FFRçW&´–EÒ“° ¢6öç7B&WVW7E66÷VDÖ&W7VÇG2ÒW6T6ÆÆ&6²†7–æ2†÷F–öç2Ò·Ò’Óâ°¢6öç7B66÷RÒ'V–ÆE66÷VDÖVW'’†÷F–öç2“°¢&V6VçE66÷VEVW'•&Vbæ7W'&VçBÒ66÷RçVW'’ÇÂ"#°¢6öç7B&W7VÇBÒv—B'Vå66÷VDÖ6V&6‚‡66÷RÂ÷F–öç2çG&–vvW"ÇÂ66÷RçG&–vvW"ÇÂ'6V&6‚"“°¢–b‚&W7VÇCòç&W7VÇD–G3òæÆVæwF‚’&WGW&âµÓ°¢6WE6V&6„&VF—'G’†fÇ6R“°¢&WGW&â&W7VÇBç&W7VÇD–G2æÖ‚†–B’Óâ&W7VÇBæVçF—F–W4'”–E¶–EÒ’æf–ÇFW"„&ööÆVâ“°¢ÒÂ¶'V–ÆE66÷VDÖVW'’Â'Vå66÷VDÖ6V&6…Ò“° ¢W6TVffV7B‚‚’Óâ°¢6öç7B†5W&ÄVçF—G’Ò&ööÆVâ‡W&Å7FFRæVçF—G”–B“°¢6öç7B†5W&ÅVW'’Ò&ööÆVâ‡W&Å7FFRç&ö×B“°¢6öç7B†46öÆÆV7F–öâÒ&ööÆVâ‡W&Å7FFRæ6öÆÆV7F–öâ“°¢6öç7B†4Æ–W"Ò&ööÆVâ‡W&Å7FFRæÆ–W"“°¢6öç7B†46×–vâÒ&ööÆVâ‡W&Å7FFRæ6×–vä–B“°¢6öç7B†5W&²Ò&ööÆVâ‡W&Å7FFRçW&´–B“°¢6öç7B†4WfVçBÒ&ööÆVâ‡W&Å7FFRæWfVçD–B“°¢6öç7B†4W‡Æ–6—D–çFVçBÒ&ööÆVâ‡W&Å7FFRæ–çFVçB“°¢6öç7B†566÷VDF—7G&–7BÒ—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B“°¢6öç7B†4W‡Æ–6—Df–ÇFW"Ò7F—fTf–ÇFW"ÓÒ$ÆÂ#°¢6öç7B6†÷VÆD‡–G&FRÒ†5W&ÄVçF—G’ÇÂ†5W&ÅVW'’ÇÂ†46öÆÆV7F–öâÇÂ†4Æ–W"ÇÂ†46×–vâÇÂ†5W&²ÇÂ†4WfVçBÇÂ†4W‡Æ–6—D–çFVçBÇÂ†566÷VDF—7G&–7BÇÂ†4W‡Æ–6—Df–ÇFW#°¢6öç7B7W'&VçEW&ÅVW'’Ò6æ—F—¦TÖ&ö×B‡W&Å7FFRç&ö×BÇÂ""ÂW&Å7FFRæÖöFR“°¢6öç7BÇ&VG”‡–G&FVEVW'’Ò&ööÆVâ€¢†5W&ÅVW'’b`¢66÷VDÆ7EG&–vvW"b`¢66÷VE&W7VÇE7FFRç&W7VÇD–G2æÆVæwF‚b`¢7W'&VçEW&ÅVW'’ÓÓÒVffV7F—fU6V&6‚À¢“°¢6öç7B—56VÆd‡–G&F–æuVW'’Ò&ööÆVâ††5W&ÅVW'’bb7W'&VçEW&ÅVW'’bb&V6VçE66÷VEVW'•&Vbæ7W'&VçBÓÓÒ7W'&VçEW&ÅVW'’“°¢6öç7B—56VÆd‡–G&F–ætf–ÇFW"Ò&ööÆVâ€¢†4W‡Æ–6—Df–ÇFW"b`¢&V6VçE66÷VEVW'•&Vbæ7W'&VçBb`¢†5W&ÅVW'’b`¢†5W&ÄVçF—G’b`¢†46öÆÆV7F–öâb`¢†4Æ–W"À¢“°¢6öç7B—56VÆd‡–G&F–æu66÷VEW&ÂÒ&ööÆVâ€¢&V6VçE66÷VEVW'•&Vbæ7W'&VçBb`¢†5W&ÄVçF—G’b`¢†46öÆÆV7F–öâb`¢†4Æ–W"b`¢†7W'&VçEW&ÅVW'’ÓÓÒ&V6VçE66÷VEVW'•&Vbæ7W'&VçBÇÂVffV7F—fU6V&6‚ÓÓÒ&V6VçE66÷VEVW'•&Vbæ7W'&VçB’À¢“° ¢–b‚6†÷VÆD‡–G&FR’°¢6ÆV%66÷VDÖ&W7VÇG2‚“°¢&V6VçE66÷VEVW'•&Vbæ7W'&VçBÒ"#°¢&WGW&ã°¢Ð ¢–b†Ç&VG”‡–G&FVEVW'’ÇÂ—56VÆd‡–G&F–æuVW'’ÇÂ—56VÆd‡–G&F–ætf–ÇFW"ÇÂ—56VÆd‡–G&F–æu66÷VEW&Â’&WGW&ã° ¢fö–B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢W&Å7FFRç&ö×BÇÂ6V&6‚ÇÂ""À¢f–ÇFW$÷fW'&–FS¢7F—fTf–ÇFW"À¢6öÆÆV7F–öä–C¢W&Å7FFRæ6öÆÆV7F–öâÀ¢7F—fTVçF—G”–C¢W&Å7FFRæVçF—G”–BÀ¢G&–vvW#¢†5W&ÄVçF—G’ò&VçF—G•÷W&Â"¢†46öÆÆV7F–öâò&7W&FVE÷&÷WFR"¢†46×–vâò&6×–vå÷W&Â"¢7F—fTf–ÇFW"ÓÓÒ%6fVB"ò'6fVB"¢÷"ö’çFW7B‡W&Å7FFRç6÷W&6R’ò'%÷W&Â"¢†5W&ÅVW'’ò'W&Å÷VW'’"¢'W&Åöf–ÇFW""À¢Æ–Ö—C¢†5W&ÄVçF—G’òb¢†46öÆÆV7F–öâòÖF‚æÖ–âƒ#RÂvWDÖ6öÆÆV7F–öä'”–B‡W&Å7FFRæ6öÆÆV7F–öâ“òç7F÷–G3òæÆVæwF‚ÇÂ#R’¢VæFVf–æVBÀ¢Ò“°¢ÒÂ°¢7F—fTf–ÇFW"À¢6ÆV%66÷VDÖ&W7VÇG2À¢F—7G&–7BÀ¢&WVW7E66÷VDÖ&W7VÇG2À¢VffV7F—fU6V&6‚À¢6V&6‚À¢66÷VDÆ7EG&–vvW"À¢66÷VE&W7VÇE7FFRç&W7VÇD–G2æÆVæwF‚À¢W&Å7FFRæ6öÆÆV7F–öâÀ¢W&Å7FFRæ6×–vä–BÀ¢W&Å7FFRæVçF—G”–BÀ¢W&Å7FFRæWfVçD–BÀ¢W&Å7FFRæÆ–W"À¢W&Å7FFRæ–çFVçBÀ¢W&Å7FFRæÖöFRÀ¢W&Å7FFRç&ö×BÀ¢W&Å7FFRçW&´–BÀ¢W&Å7FFRç6÷W&6RÀ¢Ò“° ¢W6TVffV7B‚‚’Óâ°¢–b†Ö¦ööÒÂ5E$TUEôÄUdTÅõ¤ôôÒ’&WGW&ã°¢6WEW6W$†4æf–vFVDÖ‡G'VR“°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’Â'G'VR"“°¢Ò6F6‚°¢òò6W76–öâ7F÷&vR6â&RVæf–Æ&ÆS²¶VWF†R–âÖÖVÖ÷'’6ÖW&Æö6²à¢Ð¢ÒÂ¶Ö¦ööÕÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7B66÷VE&W7VÇE6WBÒ&ööÆVâ†VffV7F—fU6V&6‚’ÇÂ—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B“°¢–b‚66÷VE&W7VÇE6WBÇÂ6VÆV7FVD–B’&WGW&ã°¢–b†VffV7F—fU6V&6‚’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢&WGW&ã°¢Ð¢6WD6öç6öÆT6öÆÆ6VB†7F—fTf–ÇFW"ÓÓÒ$ÆVvVæG2"ÇÂ7F—fTf–ÇFW"ÓÓÒ$Æ—7F–æw2"“°¢ÒÂ¶7F—fTf–ÇFW"ÂVffV7F—fU6V&6‚ÂF—7G&–7BÂ6VÆV7FVD–BÂW&Å7FFRæÖöFUÒ“° ¢6öç7BæV–v†&÷&†ööD&6UÆ6W2ÒW6TÖVÖò‚‚’Óâ°¢6öç7BVW'’ÒVffV7F—fU6V&6‚çFôÆ÷vW$66R‚“°¢6öç7B–çFVçEFö¶Vç2ÒvWD–çFVçEFö¶Vç2‡VW'’“°¢6öç7B'6VBÒ'6TÖ–çFVçB‡VW'’ÂW&Å7FFRæÖöFR“°¢6öç7B'6VD–çFVçG2Ò'&’æ—4'&’‡'6VBæ–çFVçG2’ò'6VBæ–çFVçG2¢µÓ°¢6öç7B—4'&öE'FæW$–çFVçBÒW&Å7FFRæÖöFRÓÓÒ''FæW""bb'6VD–çFVçG2ç6öÖR‚†–çFVçB’Óâ²&÷÷'GVæ—G’"Â'W&f÷&Öæ6R"Â&6×–vç2"Â&7F—fF–öâ"Â&–ç6–v‡G2"Â&VF–Væ6R%Òæ–æ6ÇVFW2†–çFVçB’“°¢6öç7B—46—f–4Æ–W$–çFVçBÒ7F—fTf–ÇFW"ÓÓÒ$6—f–2"ÇÂ'6VD–çFVçG2æ–æ6ÇVFW2‚$Dö'E÷vÆ²"’ÇÂõÆ"†FÆFæÇvFW&Æö÷Æ'BvÆ·ÇV&Æ–2'GÆ6—f–2•Æ"ö’çFW7B‡VW'’“°¢6öç7B†4WF†÷&—FF—fU66÷VE&W7VÇG2Ò&ööÆVâ€¢66÷VDÆ7EG&–vvW"b`¢66÷VE&WVW7E7FGW2ÓÓÒ'7V66W72"b`¢66÷VE&W7VÇE7FFRçVW'”¶W’À¢“°¢&WGW&âÆ6W2æf–ÇFW"‚‡Æ6R’Óâ°¢òòW‡Æ–6—B6V&6†W2æB–çFVçB6VÆV7F–öç2Ç&VG’&WGW&âv÷fW&æVBÀ¢òò&÷VæFVB&W7VÇB6WBâG&VBF†B&W7öç6R2WF†÷&—FF—fR6ò6V6öæ@¢òò72÷fW"7'6R–âÖWFFF6ææ÷B&VÖ÷fR&VÆWfçB–ç2÷"&WfVÀ¢òòVç&VÆFVBfÆÆ&6·2à¢–b††4WF†÷&—FF—fU66÷VE&W7VÇG2’&WGW&âG'VS°¢–b‚6†÷VÆE7W&f6T†÷7—FÆ—G”6†–ÆB‡Æ6RÂ7F—fTf–ÇFW"ÂVW'’’’&WGW&âfÇ6S°¢–b†—56–ævÆU6VÆV7E6V&6„–çFVçDf–ÇFW"†7F—fTf–ÇFW"’’°¢–b‡W&Å7FFRæ6öÆÆV7F–öâbbvWD6öÆÆV7F–öäf–ÇFW"‡W&Å7FFRæ6öÆÆV7F–öâ’ÓÒ7F—fTf–ÇFW"’&WGW&âfÇ6S°¢ÒVÇ6R–b‚ÖF6†W46öÆÆV7F–öâ‡Æ6RÂW&Å7FFRæ6öÆÆV7F–öâ’’&WGW&âfÇ6S°¢–b‚ÖF6†W4f–ÇFW"‡Æ6RÂ7F—fTf–ÇFW"Â6fVD–G2’’&WGW&âfÇ6S°¢–b†—46—f–4Æ–W$–çFVçBbb†—46—f–4VçF—G’‡Æ6R’ÇÂvWDF7F÷g&öÕÆ6R‡Æ6R’’’&WGW&âG'VS°¢–b†—4–çFVçDöæÇ”f–ÇFW"†7F—fTf–ÇFW"’’&WGW&âG'VS°¢–b‚VW'’’&WGW&âG'VS°¢6öç7BFW‡BÒÆ6UFW‡B‡Æ6R“°¢&WGW&â€¢—4'&öE'FæW$–çFVçBÇÀ¢FW‡Bæ–æ6ÇVFW2‡VW'’’ÇÀ¢–çFVçEFö¶Vç2ç6öÖR‚‡Fö¶Vâ’ÓâFW‡Bæ–æ6ÇVFW2‡Fö¶Vâ’’ÇÀ¢'6VD–çFVçG2ç6öÖR‚†–çFVçB’ÓâFW‡Bæ–æ6ÇVFW2…7G&–ær†–çFVçB’çFôÆ÷vW$66R‚’ç&WÆ6R‚õòörÂ""’’’ÇÀ¢‡VW'’æ–æ6ÇVFW2‚'W&²"’bb†47F—fUW&´FF‡Æ6R’¢“°¢Ò“°¢ÒÂ·Æ6W2ÂVffV7F—fU6V&6‚Â7F—fTf–ÇFW"Â6fVD–G2Â66÷VDÆ7EG&–vvW"Â66÷VE&WVW7E7FGW2Â66÷VE&W7VÇE7FFRçVW'”¶W’ÂW&Å7FFRæÖöFRÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæ–çFVçEÒ“° ¢6öç7BæV–v†&÷&†ööD6÷VçG2ÒW6TÖVÖò‚‚’Óâ°¢&WGW&âäT”t„$õ$„ôôE2ç&VGV6R‚†6÷VçG2ÂæV–v†&÷&†ööB’Óâ°¢6÷VçG5¶æV–v†&÷&†ööEÒÐ¢æV–v†&÷&†ööBÓÓÒÄÅôäT”t„$õ$„ôôE0¢òæV–v†&÷&†ööD&6UÆ6W2æÆVæwF€¢¢æV–v†&÷&†ööD&6UÆ6W2æf–ÇFW"‚‡Æ6R’ÓâÆ6RæF—7G&–7BÓÓÒæV–v†&÷&†ööB’æÆVæwFƒ°¢&WGW&â6÷VçG3°¢ÒÂ·Ò“°¢ÒÂ¶æV–v†&÷&†ööD&6UÆ6W5Ò“° ¢6öç7Bf–ÇFW&VBÒW6TÖVÖò‚‚’Óâ°¢&WGW&âæV–v†&÷&†ööD&6UÆ6W2æf–ÇFW"‚‡Æ6R’Óâ°¢–b‚—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’bbÆ6RæF—7G&–7BÓÒF—7G&–7B’&WGW&âfÇ6S°¢&WGW&âG'VS°¢Ò“°¢ÒÂ¶æV–v†&÷&†ööD&6UÆ6W2ÂF—7G&–7EÒ“° ¢6öç7B&W6–FVçE6fVEÆ6W2ÒW6TÖVÖò‚‚’Óâ°¢&WGW&âÆ6W2æf–ÇFW"‚‡Æ6R’Óâ6fVD–G2æ†2‡Æ6Ræ–B’“°¢ÒÂ·Æ6W2Â6fVD–G5Ò“° ¢6öç7B7GVÅ6fVEÆ6W2ÒW6TÖVÖò€¢‚’ÓâÆ6W2æf–ÇFW"‚‡Æ6R’Óâ6fVD–G2æ†2‡Æ6Ræ–B’’À¢·Æ6W2Â6fVD–G5ÒÀ¢“° ¢6öç7B&W6–FVçEW&µÆ6W2ÒW6TÖVÖò‚‚’Óâ°¢6öç7BW&·2ÒÆ6W2æf–ÇFW"‚‡Æ6R’Óâ†47F—fUW&´FF‡Æ6R’“°¢&WGW&âW&·2æÆVæwF‚òW&·2ç6Æ–6RƒÂ"’¢Æ6W2ç6Æ–6RƒÂ"“°¢ÒÂ·Æ6W5Ò“° ¢6öç7B6VÆV7FVBÒW6TÖVÖò€¢‚’Óâ°¢–b‚6VÆV7FVD–B’&WGW&âçVÆÃ°¢6öç7BG&ç6—F–öâÒ6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçC°¢6öç7BG&ç6—F–öåÆ6RÐ¢G&ç6—F–öâbbG&ç6—F–öâæVçF—G”–BÓÓÒ6VÆV7FVD–BòG&ç6—F–öâçÆ6R¢çVÆÃ°¢6öç7B÷fW'&–FU6÷W&6RÒ6VÆV7FVEÆ6T÷fW'&–FRÇÂG&ç6—F–öåÆ6S°¢6öç7B÷fW'&–FT–BÒ÷fW'&–FU6÷W&6Sòæ–Bò&W6öÇfTÖVçF—G”Æ–2†÷fW'&–FU6÷W&6Ræ–B’¢"#°¢6öç7B÷fW'&–FRÒ÷fW'&–FT–Bbb÷fW'&–FT–BÓÓÒ6VÆV7FVD–Bò÷fW'&–FU6÷W&6R¢çVÆÃ°¢6öç7BÆ—7F–æt6æF–FFRÒW&Å7FFRæÆ—7F–æt–@¢ò&W6öÇfTÆ—7F–ætVçF—G”g&öÔ6öÆÆV7F–öâ‡W&Å7FFRæÆ—7F–æt–BÂÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2’ÇÂ&W6öÇfTÆ—7F–ætVçF—G”g&öÔ6öÆÆV7F–öâ‡W&Å7FFRæÆ—7F–æt–BÂÆ6W2¢¢çVÆÃ°¢6öç7B6æF–FFRÒÆ—7F–æt6æF–FFRÇÂ÷fW'&–FRÇÂ&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂÆ6W2’ÇÂ&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂ†÷7—FÆ—G”6öçFVçDÆ–'&'”VçF—F–W2’ÇÂ&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂ&W6–FVçF–ÄÖ—†VEW6TVçF—F–W2’ÇÂ&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2’ÇÂçVÆÃ°¢–b‚6æF–FFR’&WGW&âçVÆÃ°¢6öç7B—4W‡Æ–6—E6VÆV7F–öä÷fW'&–FRÒ&ööÆVâ†÷fW'&–FRbb&W6öÇfTÖVçF—G”Æ–2†6æF–FFRæ–B’ÓÓÒ÷fW'&–FT–B“°¢6öç7B—56VÆV7FVD†÷7—FÆ—G”VçF—G’Ò—4†÷7—FÆ—G”æWGv÷&´VçF—G’†6æF–FFR“°¢–b‚—4W‡Æ–6—E6VÆV7F–öä÷fW'&–FRbb†7F—fTf–ÇFW"ÓÒ$ÆÂ"ÇÂW&Å7FFRæ6öÆÆV7F–öâÇÂVffV7F—fU6V&6‚’bbÖF6†W4f–ÇFW"†6æF–FFRÂ7F—fTf–ÇFW"Â6fVD–G2’bb†—56VÆV7FVD†÷7—FÆ—G”VçF—G’bb²$†÷FVÇ2"Â%W&·2%Òæ–æ6ÇVFW2†7F—fTf–ÇFW"’’’&WGW&âçVÆÃ°¢&WGW&â6æF–FFS°¢ÒÀ¢¶7F—fTf–ÇFW"ÂVffV7F—fU6V&6‚ÂÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2ÂÆ6W2Â6fVD–G2Â6VÆV7FVD–BÂ6VÆV7FVEÆ6T÷fW'&–FRÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæÆ—7F–æt–EÒÀ¢“°¢6öç7B6VÆV7FVE&W6–FVçD7F–öâÒW6TÖVÖò€¢‚’Óâ‡6VÆV7FVBòvWE&W6–FVçDFWF–Ä7F–öâ‡6VÆV7FVB’¢çVÆÂ’À¢·6VÆV7FVEÒÀ¢“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVCòæ–BÇÂ6VÆV7FVDG&vW$6Æ÷6VB’&WGW&ã°¢v–æF÷rç&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"æGÖFWF–ÂÖG&vW"æGÖG&vW"×67&öÆÂÂæGÖFWF–ÂÖG&vW"æGÖÖ×æVÂ×67&öÆÂÂæGÖFW7F–æF–öâÖG&vW"æGÖFW7F–æF–öâ×67&öÆÂ"’æf÷$V6‚‚†æöFR’Óâ°¢æöFRç67&öÆÅF÷Ò°¢Ò“°¢Ò“°¢ÒÂ·6VÆV7FVCòæ–BÂ6VÆV7FVDG&vW$6Æ÷6VEÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVCòæ–BÇÂ6VÆV7FVDG&vW$6Æ÷6VB’&WGW&ã°¢6öç7BVçF—G•G—RÒvWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’“°¢6öç7B¶W’ÒG·6VÆV7FVBæ–GÓ¢G¶VçF—G•G—WÖ°¢–b†FWF–ÅæVÄæÇ—F–75&Vbæ7W'&VçBæ†2†¶W’’’&WGW&ã°¢FWF–ÅæVÄæÇ—F–75&Vbæ7W'&VçBæFB†¶W’“°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ&FWF–Å÷æVÅö÷VæVB"Â&ÖöFWF–Å÷æVÂ"Â°¢ÖWFFF¢²VçF—G•G—RÂæVÅ7FFS¢FWF–ÄG&vW%7FFRÂ6÷W&6U7W&f6S¢W&Å7FFRæ6öÆÆV7F–öâò&6öÆÆV7F–öâ"¢&Ö"ÒÀ¢Ò’“°¢ÒÂ¶FWF–ÄG&vW%7FFRÂ6VÆV7FVBÂ6VÆV7FVDG&vW$6Æ÷6VBÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRçW&´–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVCòæ–BÇÂ6VÆV7FVDG&vW$6Æ÷6VB’&WGW&ã°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ&FWF–Å÷æVÅ÷7FFUö6†ævVB"Â&ÖöFWF–Å÷æVÂ"Â°¢ÖWFFF¢²VçF—G•G—S¢vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’ÂæVÅ7FFS¢FWF–ÄG&vW%7FFRÒÀ¢Ò’“°¢ÒÂ¶FWF–ÄG&vW%7FFRÂ6VÆV7FVCòæ–BÂ6VÆV7FVDG&vW$6Æ÷6VBÂW&Å7FFRçW&´–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVD–BÇÂ6VÆV7FVB’&WGW&ã°¢–b‡6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçCòæVçF—G”–BÓÓÒ6VÆV7FVD–B’&WGW&ã°¢–b‡6VÆV7FVEÆ6T÷fW'&–FRbb&W6öÇfTÖVçF—G”Æ–2‡6VÆV7FVEÆ6T÷fW'&–FRæ–B’ÓÓÒ6VÆV7FVD–B’&WGW&ã°¢–b†7F—fTf–ÇFW"ÓÓÒ$ÆÂ"bbW&Å7FFRæ6öÆÆV7F–öâbbVffV7F—fU6V&6‚’&WGW&ã°¢–b†ÖF6†W4f–ÇFW"‡6VÆV7FVBÂ7F—fTf–ÇFW"Â6fVD–G2’’&WGW&ã°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""ÂW&´–C¢""Ò“°¢ÒÂ¶7F—fTf–ÇFW"ÂVffV7F—fU6V&6‚Â6fVD–G2Â6VÆV7FVBÂ6VÆV7FVD–BÂ6VÆV7FVEÆ6T÷fW'&–FRÂW&Å7FFUÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚W&Å7FFRçW&´–BÇÂ6VÆV7FVB’&WGW&ã°¢–b‡6VÆV7FVEÆ6T÷fW'&–FRbb&W6öÇfTÖVçF—G”Æ–2‡6VÆV7FVEÆ6T÷fW'&–FRæ–B’ÓÓÒ6VÆV7FVD–B’&WGW&ã°¢6öç7B&rÒ6VÆV7FVBç&rÇÂ·Ó°¢6öç7BfÆ–D–G2ÒæWr6WB…°¢6VÆV7FVBæ–BÀ¢&ræ–BÀ¢vWD6æöæ–6Å&W6–FVçEW&´–B‡6VÆV7FVB’À¢6VÆV7FVBçW&³òæ–BÀ¢&rçW&³òæ–BÀ¢6VÆV7FVBçW&·3òå³Óòæ–BÀ¢&rçW&·3òå³Óòæ–BÀ¢Òæf–ÇFW"„&ööÆVâ’æÖ…7G&–ær’“°¢–b‚fÆ–D–G2æ†2…7G&–ær‡W&Å7FFRçW&´–B’’’W&Å7FFRçWFFR‡²W&´–C¢""Ò“°¢ÒÂ·6VÆV7FVBÂ6VÆV7FVD–BÂ6VÆV7FVEÆ6T÷fW'&–FRÂW&Å7FFUÒ“° ¢6öç7B6ÇW7FW%Æ6W4f÷$G&vW"ÒvWD6æöæ–6Ä6ÇW7FW$G&vW%Æ6W2†6ÇW7FW$G&vW#òçÆ6W2ÇÂµÒ“° ¢6öç7B†47F—fT6FVv÷'•66÷RÒ7F—fTf–ÇFW"ÓÒ$ÆÂ"ÇÂ—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ÇÂ&ööÆVâ†VffV7F—fU6V&6‚’ÇÂ&ööÆVâ‡W&Å7FFRæ6öÆÆV7F–öâÇÂW&Å7FFRæÆ–W"“°¢6öç7B—4FVfVÇDF—66÷fW%66÷RÒ7F—fTf–ÇFW"ÓÓÒ$ÆÂ"bb—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’bbVffV7F—fU6V&6ƒ°¢6öç7BF—7Æ•Æ6W2Ò—4FVfVÇDF—66÷fW%66÷P¢ò6÷'DF—66÷fW%Æ6W2‡Æ6W2’ç6Æ–6RƒÂ”ä•D”ÅôD•44õdU%•ôÔ$´U%ôÄ”Ô•B¢¢f–ÇFW&VBæÆVæwF€¢òf–ÇFW&V@¢¢7F—fTf–ÇFW"ÓÓÒ%6fVB ¢ò&W6–FVçE6fVEÆ6W0¢¢7F—fTf–ÇFW"ÓÓÒ%W&·2 ¢ò&W6–FVçEW&µÆ6W0¢¢†47F—fT6FVv÷'•66÷P¢òµÐ¢¢Æ6W2ç6Æ–6RƒÂ"“°¢6öç7B—5W6–ætfÆÆ&6µÆ6W2Òf–ÇFW&VBæÆVæwF‚bb†47F—fT6FVv÷'•66÷RbbÆ6W2æÆVæwF‚â°¢6öç7B6öçFW‡D6÷VçBÒF—7Æ•Æ6W2æÆVæwFƒ°¢6öç7B—46ÆVå&W6–FVçEW&·4ÆVæ6‚ÒW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bbW&Å7FFRçF"ÓÓÒ&Ö"bb7F—fTf–ÇFW"ÓÓÒ%W&·2"bb—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’bbVffV7F—fU6V&6‚bb6VÆV7FVD–C°¢6öç7B6öçFW‡DÆ&VÂÒ6öçFW‡D6÷VçBâ ¢ò—4FVfVÇDF—66÷fW%66÷P¢ò$fVGW&VBF÷vçF÷vâÆ6W2 ¢¢G¶6öçFW‡D6÷VçGÒG¶7F—fTf–ÇFW"ÓÓÒ$ÆÂ"ò&F÷vçF÷vâÆ6W2"¢7F—fTf–ÇFW"çFôÆ÷vW$66R‚—Ö ¢¢6†÷v–ær7VvvW7FVBG¶7F—fTf–ÇFW"ÓÓÒ$ÆÂ"ò&F÷vçF÷vâÆ6W2"¢7F—fTf–ÇFW"çFôÆ÷vW$66R‚—ÒæV&'–°¢6öç7BF—66÷fW$F—7Æ•Æ6W2ÒW6TÖVÖò€¢‚’ÓâVffV7F—fU6V&6‚ò6÷'E6V&6…Æ6W2†F—7Æ•Æ6W2ÂVffV7F—fU6V&6‚’¢6÷'DF—66÷fW%Æ6W2†F—7Æ•Æ6W2’À¢¶F—7Æ•Æ6W2ÂVffV7F—fU6V&6…ÒÀ¢“°¢6öç7B7F—fUW&´—FV×2ÒW6TÖVÖò‚‚’ÓâF—66÷fW$F—7Æ•Æ6W0¢æf–ÇFW"‚‡Æ6R’Óâ†47F—fUW&´FF‡Æ6R’¢ç6Æ–6RƒÂC¢æÖ‚‡Æ6R’Óâ°¢6öç7BöffW"ÒvWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢&WGW&â°¢–C¢Æ6Ræ–BÀ¢fö7W4¶W“¢7G&–ær‡Æ6Ræ–B’ç&WÆ6R‚õµæ×£Ó•òÕÒöv’Â"Ò"’À¢æÖS¢Æ6RææÖRÀ¢öffW%F—FÆS¢öffW#òçF—FÆRÇÂöffW#òæöffW"ÇÂöffW#òçfÇVRÇÂ%&W6–FVçBW&²"À¢W‡—&W4C¢vWE&W6–FVçEW&´W‡—'’‡Æ6R’À¢F—7Fæ6S¢Æ6TF—7Fæ6TÆ&VÂ‡Æ6R’À¢–ÖvS¢&W6öÇfTVçF—G”–ÖvR‡Æ6RÂ&6&B"’À¢–ã¢&W6öÇfTVçF—G•–â‡Æ6R’À¢W&´–C¢vWD6æöæ–6Å&W6–FVçEW&´–B‡Æ6R’À¢Æ6RÀ¢Ó°¢Ò’Â¶F—66÷fW$F—7Æ•Æ6W5Ò“°¢6öç7Bf—6–&ÆUÆ6W2ÒF—66÷fW$F—7Æ•Æ6W3°¢6öç7B7F—fT6öÆÆV7F–öâÒW6TÖVÖò€¢‚’ÓâvWDÖ6öÆÆV7F–öä'”–B‡W&Å7FFRæ6öÆÆV7F–öâ’À¢·W&Å7FFRæ6öÆÆV7F–öåÒÀ¢“°¢6öç7B7F—fT6öÆÆV7F–öå&÷WFU&VbÒW6U&Vb†çVÆÂ“°¢6öç7B7F—fT6öÆÆV7F–öå&÷WFRÒW6TÖVÖò€¢‚’Óâ°¢–b‚7F—fT6öÆÆV7F–öâ’°¢7F—fT6öÆÆV7F–öå&÷WFU&Vbæ7W'&VçBÒçVÆÃ°¢&WGW&âçVÆÃ°¢Ð¢6öç7B&W6öÇfVE&÷WFRÒ&W6öÇfTÖ6öÆÆV7F–öå&÷WFR†7F—fT6öÆÆV7F–öâÂÆ6W2“°¢–b‡&W6öÇfVE&÷WFSòç7F÷3òæÆVæwF‚ãÒ"’7F—fT6öÆÆV7F–öå&÷WFU&Vbæ7W'&VçBÒ&W6öÇfVE&÷WFS°¢–b†7F—fT6öÆÆV7F–öå&÷WFU&Vbæ7W'&VçCòæ–BÓÓÒ7F—fT6öÆÆV7F–öâæ–B’&WGW&â7F—fT6öÆÆV7F–öå&÷WFU&Vbæ7W'&VçC°¢&WGW&â&W6öÇfVE&÷WFS°¢ÒÀ¢¶7F—fT6öÆÆV7F–öâÂÆ6W5ÒÀ¢“°¢6öç7B7F—fU&VÆFVE&÷WFW2ÒW6TÖVÖò€¢‚’Óâ†7F—fT6öÆÆV7F–öãòç&VÆFVE&÷WFT–G2ÇÂµÒ¢æÖ‚‡&÷WFT–B’ÓâvWDÖ6öÆÆV7F–öä'”–B‡&÷WFT–B’¢æf–ÇFW"„&ööÆVâ¢æf–ÇFW"‚‡&÷WFR’Óâ&÷WFRæ–BÓÒ7F—fT6öÆÆV7F–öãòæ–B¢ç6Æ–6RƒÂ2’À¢¶7F—fT6öÆÆV7F–öåÒÀ¢“°¢6öç7B7F—fU&÷WFTvVçD6öçFW‡BÒW6TÖVÖò‚‚’Óâ°¢–b‚7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚’&WGW&âçVÆÃ°¢6öç7B6VÆV7FVE7F÷–æFW‚Ò6VÆV7FVD–Bò7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æf–æD–æFW‚‚‡7F÷’Óâ7F÷æ–BÓÓÒ6VÆV7FVD–B’¢Ó°¢6öç7B6VÆV7FVE7F÷Ò6VÆV7FVE7F÷–æFW‚ãÒò7F—fT6öÆÆV7F–öå&÷WFRç7F÷5·6VÆV7FVE7F÷–æFW…Ò¢çVÆÃ°¢6öç7BW6öÖ–æu7F÷2Ò7F—fT6öÆÆV7F–öå&÷WFRç7F÷0¢ç6Æ–6R„ÖF‚æÖ‚ƒÂ6VÆV7FVE7F÷–æFW‚²’ÂÖF‚æÖ‚ƒÂ6VÆV7FVE7F÷–æFW‚²’²b¢æÖ‚‡7F÷Â–æFW‚’Óâ‡°¢–C¢7F÷æ–BÀ¢æÖS¢7F÷ææÖRÀ¢6FVv÷'“¢7F÷æ6FVv÷'’À¢&÷WFU7F÷çVÖ&W#¢6VÆV7FVE7F÷–æFW‚ãÒò6VÆV7FVE7F÷–æFW‚²–æFW‚²"¢–æFW‚²À¢F—7G&–7C¢7F÷æF—7G&–7BÀ¢Ò’“°¢&WGW&â°¢–C¢7F—fT6öÆÆV7F–öå&÷WFRæ–BÀ¢F—FÆS¢7F—fT6öÆÆV7F–öå&÷WFRçF—FÆRÀ¢&÷WFTÖöFS¢7F—fT6öÆÆV7F–öå&÷WFRç&÷WFTÖöFRÀ¢7F÷6÷VçC¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æÆVæwF‚À¢7FGW3¢7F—fT6öÆÆV7F–öå&÷WFRç7FGW2À¢6VÆV7FVE7F÷¢6VÆV7FVE7F÷ò°¢–C¢6VÆV7FVE7F÷æ–BÀ¢æÖS¢6VÆV7FVE7F÷ææÖRÀ¢6FVv÷'“¢6VÆV7FVE7F÷æ6FVv÷'’À¢F—7G&–7C¢6VÆV7FVE7F÷æF—7G&–7BÀ¢&÷WFU7F÷çVÖ&W#¢6VÆV7FVE7F÷–æFW‚²À¢Ò¢çVÆÂÀ¢W6öÖ–æu7F÷2À¢&÷WFU7F÷–G3¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æÖ‚‡7F÷’Óâ7F÷æ–B’ç6Æ–6RƒÂƒ’À¢Ó°¢ÒÂ¶7F—fT6öÆÆV7F–öå&÷WFRÂ6VÆV7FVD–EÒ“°¢6öç7B7F—fT6æöæ–6Ä–çFVçD–BÒW6TÖVÖò€¢‚’ÓâvWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†7F—fTf–ÇFW"ÂVffV7F—fU6V&6‚’À¢¶7F—fTf–ÇFW"ÂVffV7F—fU6V&6…ÒÀ¢“°¢6öç7BÖ&W7VÇD&÷VæG4¶W’ÒG·W&Å7FFRæÖöFWÓ¢G¶7F—fTf–ÇFW'Ó¢G·W&Å7FFRæ6öÆÆV7F–öâÇÂ&æöæR'Ó¢G·W&Å7FFRæÆ–W"ÇÂ&æöæR'Ó¢G¶F—7G&–7GÓ¢G¶VffV7F—fU6V&6‚ÇÂ&æöæR'Ó¢G¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‡Ö°¢6öç7BÖ&¶W$Æ–÷WD6öçFW‡BÒW6TÖVÖò‚‚’Óâ‡°¢&÷VæG3¢66÷VE&W7VÇE7FFRæ&÷VæG2ÇÂf–Ww÷'D&÷VæG5&Vbæ7W'&VçBÇÂçVÆÂÀ¢¦ööÓ¢vWE7F&ÆTÖ&¶W%¦ööÒ€¢66÷VE&W7VÇE7FFRæ&÷VæG3òç¦ööÒÇÂÖ¦ööÕ&Vbæ7W'&VçBÇÂ–æ—F–ÄÖf–Wrç¦ööÒÀ¢’À¢Ò’Â¶Ö&W7VÇD&÷VæG4¶W’Â66÷VE&W7VÇE7FFRçVW'”¶W•Ò“°¢6öç7Bv÷fW&æVDÖ&¶W$6æF–FFW2ÒW6TÖVÖò‚‚’Óâ°¢6öç7B6†÷VÆE&W6W'fTÆ—7F–æu–ç2Ò7F—fTf–ÇFW"ÓÓÒ%&VçFÇ2"ÇÂ7F—fTf–ÇFW"ÓÓÒ$ÆVvVæG2"ÇÂ7F—fTf–ÇFW"ÓÓÒ$Æ—7F–æw2"ÇÂ7F—fTf–ÇFW"ÓÓÒ$ÆÂÆ—7F–æw2#°¢6öç7B–å6÷W&6UÆ6W2Ò6†÷VÆE&W6W'fTÆ—7F–æu–ç0¢òF—66÷fW$F—7Æ•Æ6W0¢¢F—66÷fW$F—7Æ•Æ6W2æf–ÇFW"‚‡Æ6R’Óâ—5Væ—DÆWfVÄÆ—7F–æuÆ6R‡Æ6R’ÇÂ—4ÆVvVæG5F÷Æ—7F–æuÆ6R‡Æ6R’“° ¢–b†7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚’°¢&WGW&â°¢–çFVçD–C¢7F—fT6æöæ–6Ä–çFVçD–BÀ¢Æ–Ö—C¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æÆVæwF‚À¢Æ6W3¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2À¢Ö&¶W%–ÆöC¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æÖ‚‡Æ6R’Óâ‡°¢–C¢Æ6Ræ–BÀ¢ÆC¢Æ6RæÆF—GVFRÀ¢Ææs¢Æ6RæÆöæv—GVFRÀ¢Æ&VÃ¢Æ6RææÖRÀ¢VçF—G•G—S¢Æ6RçG—RÇÂÆ6Ræ6FVv÷'’ÇÂ'&÷WFU÷7F÷"À¢&–Ö'”–çFVçD–C¢7F—fT6æöæ–6Ä–çFVçD–BÀ¢–6öä¶W“¢Æ6Rç–ä¶W’ÇÂ'G&–Â"À¢&–÷&—G•F–W#¢À¢†47F—fUW&³¢†47F—fUW&´FF‡Æ6R’À¢†47F—fT6×–vã¢&ööÆVâ‡Æ6Ræ6×–vä–BÇÂÆ6Rç&sòæ6×–vä–B’À¢Ò’’À¢F÷FÄ6æF–FFW3¢7F—fT6öÆÆV7F–öå&÷WFRç7F÷2æÆVæwF‚À¢Ó°¢Ð ¢&WGW&âvWEf–Ww÷'D&÷VæFVDÖ&¶W%Æ6W2‡–å6÷W&6UÆ6W2Â°¢7F—fTf–ÇFW"À¢VW'“¢VffV7F—fU6V&6‚À¢f–Ww÷'D&÷VæG3¢Ö&¶W$Æ–÷WD6öçFW‡Bæ&÷VæG2À¢¦ööÓ¢Ö&¶W$Æ–÷WD6öçFW‡Bç¦ööÒÀ¢6VÆV7FVD–BÀ¢ÖöFS¢W&Å7FFRæÖöFRÀ¢Ò“°¢ÒÂ¶7F—fT6æöæ–6Ä–çFVçD–BÂ7F—fT6öÆÆV7F–öå&÷WFRÂ7F—fTf–ÇFW"ÂF—66÷fW$F—7Æ•Æ6W2ÂVffV7F—fU6V&6‚ÂÖ&¶W$Æ–÷WD6öçFW‡BÂ6VÆV7FVD–BÂW&Å7FFRæÖöFUÒ“°¢6öç7BÖÆ6W2ÒW6TÖVÖò‚‚’Óâ°¢–b†7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚’&WGW&â7F—fT6öÆÆV7F–öå&÷WFRç7F÷3° ¢6öç7BÖ&¶W%6÷W&6UÆ6W2Ò—4FVfVÇDF—66÷fW%66÷P¢òF—66÷fW$F—7Æ•Æ6W0¢æf–ÇFW"‚‡Æ6R’ÓâÆ6Sòæ†4W†7DÖ&¶W"ÓÒfÇ6RÇÂ&ööÆVâ†vWEÆ6T6ö÷&G2‡Æ6R’’¢ç6Æ–6RƒÂ”ä•D”ÅôD•44õdU%•ôÔ$´U%ôÄ”Ô•B¢¢v÷fW&æVDÖ&¶W$6æF–FFW2çÆ6W3°¢6öç7B6VÆV7FVDÖ&¶W%Æ6W2Ò6VÆV7E&öw&W76—fTÖ&¶W%Æ6W2†Ö&¶W%6÷W&6UÆ6W2Â°¢7F—fTf–ÇFW"À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢VffV7F—fU6V&6‚À¢–çFVçC¢W&Å7FFRæ–çFVçBÀ¢ÖöFS¢W&Å7FFRæÖöFRÀ¢Ö¦ööÓ¢Ö&¶W$Æ–÷WD6öçFW‡Bç¦ööÒÀ¢6VÆV7FVD–BÀ¢6fVD–G2À¢W6W$†4æf–vFVDÖÀ¢—4FVfVÇDF—66÷fW%66÷RÀ¢Ò“° ¢6öç7B6†÷VÆDVÆWfFTÆVvVæG5F÷Æ—7F–æw2Ð¢7F—fTf–ÇFW"ÓÓÒ$ÆÂ"ÇÀ¢7F—fTf–ÇFW"ÓÓÒ$ÆVvVæG2"ÇÀ¢7F—fTf–ÇFW"ÓÓÒ$Æ—7F–æw2"ÇÀ¢7F—fTf–ÇFW"ÓÓÒ$Æ—f–ær†W&R"ÇÀ¢7F—fTf–ÇFW"ÓÓÒ$ÆÂÆ—7F–æw2"ÇÀ¢õÆ"†ÆVvVæG7ÆÆ—7F–æwÆÖÇ7Æ6öæF÷Æf÷"6ÆWÆF÷vçF÷vâ†öÖW2•Æ"ö’çFW7B†VffV7F—fU6V&6‚ÇÂ""“°¢6öç7BÆVvVæG5F÷Æ—7F–æu–ç2Ò6†÷VÆDVÆWfFTÆVvVæG5F÷Æ—7F–æw0¢òF—66÷fW$F—7Æ•Æ6W0¢æf–ÇFW"‚‡Æ6R’Óâ—4ÆVvVæG5F÷Æ—7F–æuÆ6R‡Æ6R’¢ç6÷'B‚†Â"’Óâ°¢6öç7B&æ²ÒçVÖ&W"†vWDÆVvVæG4Æ—7F–ær†“òçF÷Æ—7F–æu&æ²ÇÂòçF÷Æ—7F–æu&æ²ÇÂ“’“°¢6öç7B%&æ²ÒçVÖ&W"†vWDÆVvVæG4Æ—7F–ær†"“òçF÷Æ—7F–æu&æ²ÇÂ#òçF÷Æ—7F–æu&æ²ÇÂ“’“°¢&WGW&â&æ²Ò%&æ³°¢Ò¢ç6Æ–6RƒÂR¢¢µÓ° ¢6öç7B7F&ÆU6VÆV7F–öåÆ6W2Ò6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçBò6VÆV7F–öäFF6WE&Vbæ7W'&VçB¢µÓ°¢&WGW&âFVGWTÖ–åÆ6W2…²ââæÆVvVæG5F÷Æ—7F–æu–ç2Âââç7F&ÆU6VÆV7F–öåÆ6W2Âââç6VÆV7FVDÖ&¶W%Æ6W5Ò“°¢ÒÂ¶7F—fT6öÆÆV7F–öå&÷WFRÂ7F—fTf–ÇFW"ÂF—66÷fW$F—7Æ•Æ6W2ÂVffV7F—fU6V&6‚Âv÷fW&æVDÖ&¶W$6æF–FFW2çÆ6W2Â—4FVfVÇDF—66÷fW%66÷RÂÖ&¶W$Æ–÷WD6öçFW‡Bç¦ööÒÂ6fVD–G2Â6VÆV7FVD–BÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæ–çFVçBÂW&Å7FFRæÖöFRÂW6W$†4æf–vFVDÖÒ“°¢6öç7BÖ&ÆUÆ6W2ÒW6TÖVÖò€¢‚’ÓâÖÆ6W2æf–ÇFW"‚‡Æ6R’ÓâÆ6Sòæ†4W†7DÖ&¶W"ÓÒfÇ6RÇÂ&ööÆVâ†vWEÆ6T6ö÷&G2‡Æ6R’’’À¢¶ÖÆ6W5ÒÀ¢“°¢W6TVffV7B‚‚’Óâ°¢–b‡66÷VE&WVW7E7FGW2ÓÒ'7V66W72"ÇÂ66÷VDÆ7EG&–vvW"ÇÂÖ&ÆUÆ6W2æÆVæwF‚’&WGW&âVæFVf–æVC°¢6öç7B–×&W76–öåF–ÖW"Òv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢Ö&ÆUÆ6W2æf÷$V6‚‚‡Æ6RÂ–æFW‚’Óâ°¢6öç7B–×&W76–öä¶W’ÒG·66÷VE&W7VÇE7FFRçVW'”¶W—Ó¢G·Æ6Ræ–GÖ°¢–b‡f–WvVE–ä¶W—5&Vbæ7W'&VçBæ†2†–×&W76–öä¶W’’’&WGW&ã°¢f–WvVE–ä¶W—5&Vbæ7W'&VçBæFB†–×&W76–öä¶W’“°¢6öç7B&rÒÆ6Rç&rÇÂ·Ó°¢f—&Uv÷&¶fÆ÷r‚"ö’ö–×&W76–öâ"Â°¢WfVçEöæÖS¢'–å÷f–WvVB"À¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢–åö–C¢Æ6Ræ–BÀ¢VçF—G”–C¢Æ6RæVçF—G•ö–BÇÂÆ6RæVçF—G”–BÇÂÆ6Ræ–BÀ¢VçF—G•G—S¢Æ6RæVçF—G•÷G—RÇÂv÷&¶fÆ÷tVçF—G•G—R‡Æ6R’À¢FVæçEö–C¢Æ6RçFVæçEö–BÇÂ&rçFVæçEö–BÇÂçVÆÂÀ¢v÷&·76Uö–C¢Æ6Rçv÷&·76Uö–BÇÂ&rçv÷&·76Uö–BÇÂçVÆÂÀ¢'FæW%ö–C¢Æ6Rç'FæW%ö–BÇÂ&rç'FæW%ö–BÇÂçVÆÂÀ¢&÷W'G•ö–C¢Æ6Rç&÷W'G•ö–BÇÂ&rç&÷W'G•ö–BÇÂçVÆÂÀ¢'V–ÆF–æuö–C¢Æ6Ræ'V–ÆF–æuö–BÇÂ&ræ'V–ÆF–æuö–BÇÂçVÆÂÀ¢6×–våö–C¢Æ6Ræ6×–våö–BÇÂ&ræ6×–våö–BÇÂçVÆÂÀ¢W&µö–C¢Æ6RçW&µö–BÇÂ&rçW&µö–BÇÂçVÆÂÀ¢WfVçEö–C¢Æ6RæWfVçEö–BÇÂ&ræWfVçEö–BÇÂçVÆÂÀ¢VW'•ö–C¢66÷VE&W7VÇE7FFRçVW'”–BÇÂ""À¢6V&6…÷VW'“¢VffV7F—fU6V&6‚À¢–çFW'&WFVEö–çFVçC¢66÷VE&W7VÇE7FFRæ–çFVçBÇÂ""À¢&W7VÇE÷&æ³¢–æFW‚À¢6÷W&6S¢66÷VE&W7VÇE7FFRç6÷W&6RÇÂ&F—&V7B×6V&6‚"À¢ö67W'&VEöC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢ÆC¢Æ6RæÆF—GVFRÇÂÆ6RæÆBÇÂÆ6Ræ6ö÷&G3òå³ÒÇÂU5D”åô4TåDU%³ÒÀ¢Ææs¢Æ6RæÆöæv—GVFRÇÂÆ6RæÆærÇÂÆ6Ræ6ö÷&G3òå³ÒÇÂU5D”åô4TåDU%³ÒÀ¢Ò“°¢Ò“°¢ÒÂS“°¢&WGW&â‚’Óâv–æF÷ræ6ÆV%F–ÖV÷WB†–×&W76–öåF–ÖW"“°¢ÒÂ¶VffV7F—fU6V&6‚ÂÖ&ÆUÆ6W2Â66÷VDÆ7EG&–vvW"Â66÷VE&WVW7E7FGW2Â66÷VE&W7VÇE7FFRæ–çFVçBÂ66÷VE&W7VÇE7FFRçVW'”–BÂ66÷VE&W7VÇE7FFRçVW'”¶W’Â66÷VE&W7VÇE7FFRç6÷W&6UÒ“°¢6öç7Bf—6–&ÆTÆVvVæG5Æ6W2ÒW6TÖVÖò€¢‚’ÓâFVGWTÖ–åÆ6W2†F—66÷fW$F—7Æ•Æ6W2’æf–ÇFW"‚‡Æ6R’Óâ—4ÆVvVæG4ÖÆ6R‡Æ6R’’À¢¶F—66÷fW$F—7Æ•Æ6W5ÒÀ¢“°¢6öç7B7F&ÆT6ÇW7FW%¦ööÒÒÖ&¶W$Æ–÷WD6öçFW‡Bç¦ööÓ°¢6öç7B6ÇW7FW&VDÖ—FV×2ÒW6TÖVÖò‚‚’Óâ°¢6öç7B&W6W'fVDÖ&¶W$–G2ÒæWr6WB€¢‡6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçBò6VÆV7F–öäFF6WE&Vbæ7W'&VçB¢µÒ¢æfÆDÖ‚‡Æ6R’Óâ·Æ6Sòæ–BÂvWEÆ6TÖ&¶W$–B‡Æ6R•Ò¢æf–ÇFW"„&ööÆVâ’À¢“°¢&WGW&â7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF€¢ò6ÇW7FW%Æ6W2†7F—fT6öÆÆV7F–öå&÷WFRç7F÷2Â7F&ÆT6ÇW7FW%¦ööÒÂ6VÆV7FVD–BÂ&W6W'fVDÖ&¶W$–G2¢¢6ÇW7FW%Æ6W2†Ö&ÆUÆ6W2Â7F&ÆT6ÇW7FW%¦ööÒÂ6VÆV7FVD–BÂ&W6W'fVDÖ&¶W$–G2“°¢ÒÂ¶7F—fT6öÆÆV7F–öå&÷WFRÂÖ&ÆUÆ6W2Â6VÆV7FVD–BÂ7F&ÆT6ÇW7FW%¦ööÕÒ“°¢6öç7B—57G&VWDÆWfVÄÖf–WrÒÖ¦ööÒãÒ5E$TUEôÄUdTÅõ¤ôôÒÇÂ‡f–Ww÷'D&÷VæG3òç¦ööÒÇÂ’ãÒ5E$TUEôÄUdTÅõ¤ôôÓ°¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVD–B’&WGW&ã°¢–b‡6VÆV7FVB’&WGW&ã°¢6öç7BÖÖF6‚Ò&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂÖÆ6W2“°¢–b†ÖÖF6‚’6WE6VÆV7FVEÆ6T÷fW'&–FR†ÖÖF6‚“°¢ÒÂ¶ÖÆ6W2Â6VÆV7FVBÂ6VÆV7FVD–EÒ“°¢6öç7B&Wf–WtÆ–Ö—BÒ&W7VÇG4W‡æFVBò"¢C°¢6öç7B&Wf–WuÆ6W2ÒF—66÷fW$F—7Æ•Æ6W2ç6Æ–6RƒÂ&Wf–WtÆ–Ö—B“°¢6öç7B—5&VçFÄÆ–W"ÒW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb7F—fTf–ÇFW"ÓÓÒ%&VçFÇ2#°¢6öç7B—4ÆVvVæG4F—&V7F÷'”Æ–W"Ò²%&VçFÇ2"Â$Æ—f–ær†W&R"Â$ÆVvVæG2"Â$ÆÂÆ—7F–æw2%Òæ–æ6ÇVFW2†7F—fTf–ÇFW"“°¢6öç7B—5&W6–FVçE6fVDG&vW"ÒW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb7F—fT&÷GFöÕF"ÓÓÒ'6fVB#°¢6öç7B6fVDG&vW%Æ6W2Ò&W6–FVçE6fVEÆ6W2ç6Æ–6RƒÂ&Wf–WtÆ–Ö—B“°¢6öç7B—5&W6–FVçDWfVçG4G&vW"ÒW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb7F—fT&÷GFöÕF"ÓÓÒ&WfVçG2#°¢6öç7BG&vW%&Wf–WuÆ6W2Ò—5&W6–FVçE6fVDG&vW ¢ò6fVDG&vW%Æ6W0¢¢—5&W6–FVçDWfVçG4G&vW ¢òF—66÷fW$F—7Æ•Æ6W2ç6Æ–6RƒÂƒ¢¢&Wf–WuÆ6W3°¢6öç7BÆVvVæG4F—&V7F÷'•Æ6W2ÒW6TÖVÖò€¢‚’Óâ—4ÆVvVæG4F—&V7F÷'”Æ–W"ò&W6öÇfT6æöæ–6ÄÆVvVæG4F—&V7F÷'•Æ6W2†F—66÷fW$F—7Æ•Æ6W2’¢µÒÀ¢¶F—66÷fW$F—7Æ•Æ6W2Â—4ÆVvVæG4F—&V7F÷'”Æ–W%ÒÀ¢“°¢6öç7B†–FFVå&Wf–Wt6÷VçBÒÖF‚æÖ‚ƒÂÖF‚æÖ–â†F—66÷fW$F—7Æ•Æ6W2æÆVæwF‚Â"’Ò&Wf–WuÆ6W2æÆVæwF‚“°¢6öç7B†–FFVå6fVE&Wf–Wt6÷VçBÒÖF‚æÖ‚ƒÂÖF‚æÖ–â‡&W6–FVçE6fVEÆ6W2æÆVæwF‚Â"’Ò6fVDG&vW%Æ6W2æÆVæwF‚“°¢6öç7B6V&6…Æ6V†öÆFW"ÒW&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò$6²&÷WB6×–vç2ÂæV&'’W6RÂ÷"6fVBÆ6W2 ¢¢$6²&÷WBÆ6W2ÂW&·2ÂWfVçG2Â÷"6—f–2WFFW2#°¢6öç7B6V&6„6öç6öÆTÆ&VÂÒ$6²F†RÖ#°¢6öç7B&V&–ÄÆ&VÂÒvWD&V&–ÄÆ&VÂ‡W&Å7FFRæÖöFRÂ7F—fTf–ÇFW"“°¢6öç7BÆÄ&VÆ&VÂÒvWDÆÄ&VÆ&VÂ‡W&Å7FFRæÖöFRÂ7F—fTf–ÇFW"“°¢6öç7BW&Å'FæW%æVÂÒW&Å7FFRæÖöFRÓÓÒ''FæW""bbÔôäD•dUõ%DäU%õäTÅ2æ–æ6ÇVFW2‡W&Å7FFRçF"’òW&Å7FFRçF"¢"#°¢6öç7B7F—fU'FæW%æVÂÒW&Å'FæW%æVÂÇÂ‡W&Å7FFRæÖöFRÓÓÒ''FæW""bbÔôäD•dUõ%DäU%õäTÅ2æ–æ6ÇVFW2†7F—fT&÷GFöÕF"’ò7F—fT&÷GFöÕF"¢""“°¢6öç7B&W6–FVçEæVÄ6÷’Ò°¢W&·3¢°¢W–V'&÷s¢%W&·2"À¢F—FÆS¢%W6VgVÂöffW'2æV&'’â"À¢&öG“¢%Æ6W2v—F‚&W6–FVçBfÇVRÂ6&BÖöÖVçG2Â÷"öffW'2v÷'F‚6f–ærâ"À¢ÒÀ¢WfVçG3¢°¢W–V'&÷s¢$WfVçG2"À¢F—FÆS¢$æV&'’æ÷râ"À¢&öG“¢$WfVçG2Â×W6–2Â&²ÖöÖVçG2ÂæBÆç26Æ÷6RVæ÷Vv‚FòW6Râ"À¢ÒÀ¢6fVC¢°¢W–V'&÷s¢$Õ’DõtåDõtâ"À¢F—FÆS¢%6fVBF÷vçF÷vâ"À¢&öG“¢%Æ6W2ÂWfVçG2æBW‡W&–Væ6W2–÷RwfR6†÷6VâFò6öÖR&6²Fòâ"À¢ÒÀ¢Õ¶—5&VçFÄÆ–W"ò'&VçFÇ2"¢7F—fT&÷GFöÕF%ÒÇÂ†—5&VçFÄÆ–W"ò°¢W–V'&÷s¢%&VçFÇ2"À¢F—FÆS¢$F÷vçF÷vâ&VçFÇ2öâF†RÖâ"À¢&öG“¢$'V–ÆF–ærÖf—'7BÆ—7F–æw2v—F‚æV&'’W&·2ÂÖVæ—F–W2ÂæBvÆ¶–ær6öçFW‡Bâ"À¢Ò¢çVÆÂ“°¢6öç7B&W6–FVçE&W7VÇD6÷VçDÆ&VÂÒ—5&W6–FVçE6fVDG&vW ¢òG·&W6–FVçE6fVEÆ6W2æÆVæwF‡Ò6fVBG·&W6–FVçE6fVEÆ6W2æÆVæwF‚ÓÓÒò'Æ6R"¢'Æ6W2'Ö ¢¢7F—fT&÷GFöÕF"ÓÓÒ'W&·2 ¢òG¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‡Ò7F—fRG¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‚ÓÓÒò&öffW""¢&öffW'2'Ò–âF†—2Ö&V ¢¢7F—fT&÷GFöÕF"ÓÓÒ&WfVçG2 ¢òG¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‡ÒG¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‚ÓÓÒò&WfVçB"¢&WfVçG2'Ò–âF†—2Ö&V ¢¢G¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‡ÒÖF6†–ærG¶F—66÷fW$F—7Æ•Æ6W2æÆVæwF‚ÓÓÒò'Æ6R"¢'Æ6W2'Ö°¢6öç7BæVÅÆ6W2Ò&Wf–WuÆ6W2æÆVæwF‚ò&Wf–WuÆ6W2¢F—66÷fW$F—7Æ•Æ6W2ç6Æ–6RƒÂ‚“°¢6öç7B6V&6…F–ÖT÷F–öç2ÒW&Å7FFRæÖöFRÓÓÒ''FæW""ò%DäU%õD”ÔUôd”ÅDU%2¢$U4”DTåEõD”ÔUôd”ÅDU%3°¢6öç7B6V&6„–çFVçD÷F–öç2ÒW&Å7FFRæÖöFRÓÓÒ''FæW""ò%DäU%ô”åDTåEôd”ÅDU%2¢$U4”DTåEô”åDTåEôd”ÅDU%3°¢6öç7B7F—fU6V&6…7VÖÖ'’Ò°¢VffV7F—fU6V&6‚ÇÂ†7F—fTf–ÇFW"ÓÒ$ÆÂ"ò7F—fTf–ÇFW"¢""’À¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’òF—7G&–7B¢""À¢W&Å7FFRçF–ÖRÀ¢Òæf–ÇFW"„&ööÆVâ“°¢6öç7B&W7VÇG46öçFW‡DÆ–æRÒ7F—fU6V&6…7VÖÖ'’æÆVæwF€¢òW&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò%6†÷v–ærW6VgVÂÖF6†W2æV&'’â ¢¢6†÷v–ærG¶7F—fTf–ÇFW"ÓÓÒ$ÆÂ"ò'Æ6W2"¢7F—fTf–ÇFW"çFôÆ÷vW$66R‚—ÒæV&'’æ ¢¢"#° ¢gVæ7F–öâÆ6TF—7Fæ6TÆ&VÂ‡Æ6R’°¢6öç7B6ö÷&G2ÒvWEÆ6T6ö÷&G2‡Æ6R“°¢–b‚6ö÷&G2’&WGW&â&æV&'’#°¢6öç7BÆDFVÇFÒ6ö÷&G5³ÒÒU5D”åô4TåDU%³Ó°¢6öç7BÆætFVÇFÒ†6ö÷&G5³ÒÒU5D”åô4TåDU%³Ò’¢ÖF‚æ6÷2‚‚†6ö÷&G5³Ò²U5D”åô4TåDU%³Ò’ò"’¢„ÖF‚å’òƒ’“°¢6öç7BÖ–ÆW2ÒÖF‚ç7'B‚†ÆDFVÇF¢c’’¢¢"²†ÆætFVÇF¢c’’¢¢"“°¢&WGW&âG´ÖF‚æÖ‚ƒãÂÖ–ÆW2’çFôf—†VBƒ—ÒÖ–°¢Ð ¢gVæ7F–öâVçF—G”6&D6÷’‡Æ6R’°¢6öç7BöffW"ÒW&Å7FFRæÖöFRÓÓÒ''FæW""òvWE'FæW%æVÄ6÷’‡Æ6R’¢vWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢&WGW&âG'Væ6FUæVÄ6÷’€¢öffW#òçF—FÆRÇÀ¢öffW#òæöffW"ÇÀ¢Æ6Rç&V6öÖÖVæFVE÷W&²ÇÀ¢Æ6RçW&³òæöffW"ÇÀ¢Æ6Rç'FæW%ö÷÷'GVæ—G’ÇÀ¢Æ6Rç7VÖÖ'’ÇÀ¢Æ6RæFW67&—F–öâÇÀ¢Æ6Rç&sòç7VÖÖ'’ÇÀ¢$÷VâF†R7V6–f–26×–vâ7F–öâf÷"F†—2–ââ"À¢ƒbÀ¢“°¢Ð ¢gVæ7F–öâ&VæFW$VçF—G”6&B‡Æ6RÂ7F–öäÆ&VÂÒ$÷Vâ"’°¢6öç7B–ÖvRÒ&W6öÇfTVçF—G”–ÖvR‡Æ6RÂ&6&B"“°¢6öç7B6fVBÒ6fVD–G2æ†2‡Æ6Ræ–B“°¢6öç7BöffW"ÒW&Å7FFRæÖöFRÓÓÒ''FæW""òvWE'FæW%æVÄ6÷’‡Æ6R’¢vWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢&WGW&â€¢Æ'F–6ÆR¶W“×·Æ6Ræ–GÒ6Æ74æÖSÒ&G×F"ÖF—66÷fW'’Ö6&BG×F"×W&²Ö6&B#à¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢6Æ74æÖSÒ&G×F"ÖF—66÷fW'’ÖÖVF– ¢&–ÖÆ&VÃ×¶÷VâG·Æ6RææÖWÖÐ¢öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ð¢à¢¶–ÖvRòÆ–ÖrÇC×·Æ6RææÖWÒ7&3×¶–ÖvWÒóâ¢çVÆÇÐ¢Âö'WGFöãà¢ÆF—b6Æ74æÖSÒ&G×F"ÖF—66÷fW'’Ö&öG’#à¢ÆF—b6Æ74æÖSÒ&G×F"×&÷rÖÖWF#à¢Ç7ãçµ¶öffW#òæ6FVv÷'’ÇÂÆ6Ræ6FVv÷'’ÇÂÆ6RçG—RÇÂ'Æ6R"ÂÆ6RæF—7G&–7BÇÂÆ6RææV–v†&÷&†ööBÇÂ$F÷vçF÷vâ"ÂÆ6TF—7Fæ6TÆ&VÂ‡Æ6R•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"(
""—ÓÂ÷7ãà¢ÂöF—cà¢Æƒ3ç·Æ6RææÖWÓÂöƒ3à¢Çç¶VçF—G”6&D6÷’‡Æ6R—ÓÂ÷à¢ÆF—b6Æ74æÖSÒ&w&–Bw&–BÖ6öÇ2Ó"vÓ"#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&–Ö'’Ö7F–öâ‚Ó2’Ó"FW‡BÕ³…ÒföçB×6VÖ–&öÆB"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Óà¢¶7F–öäÆ&VÇÐ¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×6V6öæF'’Ö7F–öâ"&–×&W76VC×·6fVGÒöä6Æ–6³×²‚’ÓâFövvÆU6fVB‡Æ6R—Óà¢·6fVBò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢Âö'F–6ÆSà¢“°¢Ð ¢gVæ7F–öâ&VæFW$6ö×7DVçF—G•&÷r‡Æ6RÂ7F–öäÆ&VÂÒ$÷Vâ"’°¢6öç7BöffW"ÒW&Å7FFRæÖöFRÓÓÒ''FæW""òvWE'FæW%æVÄ6÷’‡Æ6R’¢vWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢6öç7BöffW$Æ–æRÒöffW#òçF—FÆRÇÂöffW#òæöffW"ÇÂ"#°¢&WGW&â€¢Æ'WGFöâ¶W“×·Æ6Ræ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&÷rGÖ6ö×7B×Æ6R×&÷r"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Óà¢Ç7â6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÖ–â#à¢Ç7ãà¢Ç7G&öæsç·Æ6RææÖWÓÂ÷7G&öæsà¢Ç6ÖÆÃçµ¶öffW$Æ–æRÇÂÆ6Ræ6FVv÷'’ÇÂÆ6RçG—RÇÂ%Æ6R"ÂÆ6RæF—7G&–7BÇÂÆ6RææV–v†&÷&†ööBÇÂ$F÷vçF÷vâ"ÂÆ6TF—7Fæ6TÆ&VÂ‡Æ6R•Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"(
""—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ6ö×7B×Æ6RÖ7F–öç2#à¢ÆVÓç¶7F–öäÆ&VÇÓÂöVÓà¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ð ¢gVæ7F–öâvWE6fVD—FVÔw&÷W‡Æ6R’°¢6öç7B¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡Æ6R“°¢6öç7BFW‡BÒÆ6UFW‡B‡Æ6R“°¢–b†¶–æBÓÓÒ&WfVçB"ÇÂ—4WfVçDVçF—G’‡Æ6R’ÇÂõÆ"‡'7gÇFöæ–v‡GÇF†—2F‡W'6F—Ç6†÷v66WÆf—'7BF‡W'6F—Æ6Æ77Æ6öæ6W'B•Æ"ö’çFW7B‡FW‡B’’&WGW&â&WfVçG2#°¢–b††47F—fUW&´FF‡Æ6R’ÇÂ¶–æBÓÓÒ'W&²"ÇÂ—4'&æDVçF—G’‡Æ6R’ÇÂõÆ"†&VæVf—GÆöffW'Ç&W6–FVçB66W77ÆF—66÷VçGÆVæw&f–æwÇW&²•Æ"ö’çFW7B‡FW‡B’’&WGW&â&&VæVf—G2#°¢&WGW&â'Æ6W2#°¢Ð ¢gVæ7F–öâvWE6fVD—FVÔ6÷’‡Æ6R’°¢6öç7BöffW"ÒvWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢6öç7B&t6÷’ÒöffW#òçF—FÆRÇÂöffW#òæöffW"ÇÂÆ6Rç7VÖÖ'’ÇÂÆ6RæFW67&—F–öâÇÂÆ6Rç&sòç7VÖÖ'’ÇÂÆ6Rç&sòæFW67&—F–öâÇÂ"#°¢–b‡&t6÷’’&WGW&âG'Væ6FUæVÄ6÷’‡&t6÷’Â“b“°¢–b†vWE6fVD—FVÔw&÷W‡Æ6R’ÓÓÒ&WfVçG2"’&WGW&â$âW‡W&–Væ6Rv÷'F‚Æææ–ær&÷VæBv†–ÆR–÷R&RF÷vçF÷vââ#°¢–b†vWE6fVD—FVÔw&÷W‡Æ6R’ÓÓÒ&&VæVf—G2"’&WGW&â$&W6–FVçB&VæVf—Bv÷'F‚W6–ærv†Vâ–÷R&RæV&'’â#°¢&WGW&â$F÷vçF÷vâÆ6Rv÷'F‚&Wf—6—F–ærv†VâF†RÆâ6öÖW2FövWF†W"â#°¢Ð ¢gVæ7F–öâvWE6fVDÆö6F–öäÆ&VÂ‡Æ6R’°¢&WGW&âÆ6RæF—7G&–7BÇÂÆ6RææV–v†&÷&†ööBÇÂÆ6RæFG&W72ÇÂ$F÷vçF÷vâW7F–â#°¢Ð ¢gVæ7F–öâf–æE6fVE&V6öÖÖVæFF–öâ‡Æ6R’°¢6öç7BæÖRÒ7G&–ær‡Æ6SòææÖRÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BFW‡BÒÆ6UFW‡B‡Æ6R“°¢6öç7BF&vWG2Ò°¢²õÆ'–WF•Æ"òÂ²%FV6÷f2"Â$&–B"Â%v†öÆRfööG2%ÕÒÀ¢²õÆ"‡vFW&Æö÷Æw&VVçv—Ç&²•Æ"òÂ²$ÖööG’×†—F†VFW""Â%vÆÆW"7&VV²G&–Â"Â$6VçG&ÂÆ–'&'’%ÕÒÀ¢²õÆ&†÷FVÂfâ¦æGEÆ"òÂ²$vW&ÆF–æRw2"Â%&–æW’7G&VWBfööB²G&–æ²Æö÷"Â$†Æb7FW%ÕÒÀ¢²õÆ&ÆG’&—&GÆÆ¶WÇG&–ÇÇ6†öÂ7&VVµÆ"òÂ²$ÖW&—B6öffVR"Â$6VçG&ÂÆ–'&'’"Â$6öæw&W72fVçVR'&–FvR%ÕÒÀ¢Ó°¢6öç7BÖF6‚ÒF&vWG2æf–æB‚…·GFW&åÒ’ÓâGFW&âçFW7B†æÖR’ÇÂGFW&âçFW7B‡FW‡B’“°¢6öç7BÆ&VÇ2ÒÖF6ƒòå³ÒÇÂ²$ÖW&—B6öffVR"Â%vFW&Æöò&²"Â$vW&ÆF–æRw2%Ó°¢&WGW&âÆ&VÇ0¢æÖ‚†Æ&VÂ’ÓâÆ6W2æf–æB‚†6æF–FFR’Óâ7G&–ær†6æF–FFRææÖRÇÂ""’çFôÆ÷vW$66R‚’æ–æ6ÇVFW2†Æ&VÂçFôÆ÷vW$66R‚’’’¢æf–æB„&ööÆVâ“°¢Ð ¢gVæ7F–öâvWD×”F÷vçF÷vå7VvvW7F–öç2‚’°¢6öç7B&V6öÖÖVæFVDg&öÕ6fW2Ò&W6–FVçE6fVEÆ6W0¢æÖ†f–æE6fVE&V6öÖÖVæFF–öâ¢æf–ÇFW"„&ööÆVâ¢æf–ÇFW"‚‡Æ6RÂ–æFW‚ÂÆ—7B’ÓâÆ—7Bæf–æD–æFW‚‚†—FVÒ’Óâ—FVÒæ–BÓÓÒÆ6Ræ–B’ÓÓÒ–æFW‚¢æf–ÇFW"‚‡Æ6R’Óâ6fVD–G2æ†2‡Æ6Ræ–B’“°¢6öç7BfÆÆ&6²Ò²%FV6÷f2"Â$ÖööG’×†—F†VFW""Â$vW&ÆF–æRw2"Â%vFW&Æöò&²"Â$ÖW&—B6öffVR%Ð¢æÖ‚†Æ&VÂ’ÓâÆ6W2æf–æB‚‡Æ6R’Óâ7G&–ær‡Æ6RææÖRÇÂ""’çFôÆ÷vW$66R‚’æ–æ6ÇVFW2†Æ&VÂçFôÆ÷vW$66R‚’’’¢æf–ÇFW"„&ööÆVâ“°¢&WGW&â‡&V6öÖÖVæFVDg&öÕ6fW2æÆVæwF‚ò&V6öÖÖVæFVDg&öÕ6fW2¢fÆÆ&6²’ç6Æ–6RƒÂ2“°¢Ð ¢gVæ7F–öâ÷Vå&W6–FVçDF—66÷fW'’†f–ÇFW"Ò$ÆÂ"’°¢6öç7BæW‡Df–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†f–ÇFW"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"†æW‡Df–ÇFW"ÓÓÒ$WfVçG2"ò&WfVçG2"¢æW‡Df–ÇFW"ÓÓÒ%W&·2"ò'W&·2"¢&Ö"“°¢Ð ¢gVæ7F–öâ6†&U6fVD6öÆÆV7F–öâ‚’°¢6öç7BF—FÆW2Ò&W6–FVçE6fVEÆ6W2æÖ‚‡Æ6R’ÓâÆ6RææÖR’ç6Æ–6RƒÂ‚’æ¦ö–â‚"Â"“°¢6öç7BFW‡BÒF—FÆW2ò×’F÷vçF÷vâ6öÆÆV7F–öã¢G·F—FÆW7Ö¢$×’F÷vçF÷vâ6öÆÆV7F–öâöâF÷vçF÷vâW&·2â#°¢–b‡G—Vöbæf–vF÷"ÓÒ'VæFVf–æVB"bbæf–vF÷"ç6†&R’°¢fö–Bæf–vF÷"ç6†&R‡²F—FÆS¢$×’F÷vçF÷vâ"ÂFW‡BÒ“°¢&WGW&ã°¢Ð¢–b‡G—Vöbæf–vF÷"ÓÒ'VæFVf–æVB"bbæf–vF÷"æ6Æ—&ö&B’°¢fö–Bæf–vF÷"æ6Æ—&ö&Bçw&—FUFW‡B‡FW‡B“°¢Ð¢Ð ¢gVæ7F–öâ&VæFW%6fVD6öÆÆV7F–öä6&B‡Æ6RÂ7FGW4Æ&VÂÒ%&V6VçFÇ’FFVB"’°¢6öç7B–ÖvRÒ&W6öÇfTVçF—G”–ÖvR‡Æ6RÂ&6&B"’ÇÂÔõäTÅô”ÔtUôdÄÄ$4³°¢&WGW&â€¢Æ'WGFöâ¶W“×·Æ6Ræ–GÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×6fVBÖ6öÆÆV7F–öâÖ6&B"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Óà¢Ç7â6Æ74æÖSÒ&G×6fVBÖ6&BÖÖVF–#à¢Æ–Ör7&3×¶–ÖvWÒÇC×·Æ6RææÖWÒÆöF–æsÒ&Æ§’"óà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&G×6fVBÖ6&BÖ&öG’#à¢Ç7â6Æ74æÖSÒ&G×6fVBÖ6&B×7FGW2#ç·7FGW4Æ&VÇÓÂ÷7ãà¢Ç7G&öæsç·Æ6RææÖWÓÂ÷7G&öæsà¢Ç7ãç¶vWE6fVD—FVÔ6÷’‡Æ6R—ÓÂ÷7ãà¢ÆVÓç¶vWE6fVDÆö6F–öäÆ&VÂ‡Æ6R—ÓÂöVÓà¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ð ¢gVæ7F–öâ&VæFW%6fVD6öÆÆV7F–öå6V7F–öâ‡F—FÆRÂ—FV×2’°¢–b‚—FV×2æÆVæwF‚’&WGW&âçVÆÃ°¢&WGW&â€¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖ6öÆÆV7F–öâ×6V7F–öâ"&–ÖÆ&VÃ×·F—FÆWÓà¢ÆF—b6Æ74æÖSÒ&G×6fVB×6V7F–öâÖ†VF–ær#à¢Æƒ3ç·F—FÆWÓÂöƒ3à¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&G×6fVBÖ6öÆÆV7F–öâÖw&–B#à¢¶—FV×2æÖ‚‡Æ6RÂ–æFW‚’Óâ&VæFW%6fVD6öÆÆV7F–öä6&B‡Æ6RÂ–æFW‚ÓÓÒò%6fVBFöF’"¢%&V6VçFÇ’FFVB"’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢“°¢Ð ¢gVæ7F–öâ&VæFW%6fVD6öÆÆV7F–öåæVÂ‚’°¢6öç7B6fVDw&÷W2Ò&W6–FVçE6fVEÆ6W2ç&VGV6R€¢†w&÷W2ÂÆ6R’Óâ°¢w&÷W5¶vWE6fVD—FVÔw&÷W‡Æ6R•ÒçW6‚‡Æ6R“°¢&WGW&âw&÷W3°¢ÒÀ¢²Æ6W3¢µÒÂWfVçG3¢µÒÂ&VæVf—G3¢µÒÒÀ¢“°¢6öç7B&V6öÖÖVæFVBÒvWD×”F÷vçF÷vå7VvvW7F–öç2‚“°¢6öç7B6µ&ö×G2Ò°¢%v†B6†÷VÆB’f—6—Bf—'7Cò"À¢%v†Bw26Æ÷6W7B&–v‡Bæ÷sò"À¢$ç’WfVçG2æV"×’6fVBÆ6W3ò"À¢%v†B6†÷VÆB’FòFöæ–v‡Cò"À¢&W6–FVçE6fVEÆ6W5³ÓòææÖRòv†Bw2†Væ–æræV"G·&W6–FVçE6fVEÆ6W5³ÒææÖWÓö¢%v†Bw2†Væ–æræV"”UD“ò"À¢Ó°¢6öç7Bff÷&—FTÖG&—„—FV×2Ò‡&W6–FVçE6fVEÆ6W2æÆVæwF‚ò&W6–FVçE6fVEÆ6W2¢&V6öÖÖVæFVB’ç6Æ–6RƒÂ‚’æÖ‚‡Æ6R’Óâ°¢6öç7Bw&÷WÒvWE6fVD—FVÔw&÷W‡Æ6R“°¢6öç7B&VÆFVBÒvWE&VÆFVEÆ6W2‡Æ6RÂÆ6W2’ç6Æ–6RƒÂ2“°¢&WGW&â°¢–C¢Æ6Ræ–BÀ¢Æ&VÃ¢Æ6RææÖRÀ¢W–V'&÷s¢w&÷WÓÓÒ&WfVçG2"ò$WfVçB"¢w&÷WÓÓÒ&&VæVf—G2"ò%W&²"¢%Æ6R"À¢F—FÆS¢Æ6RææÖRÀ¢FW67&—F–öã¢vWE6fVD—FVÔ6÷’‡Æ6R’À¢7FGW3¢6fVD–G2æ†2‡Æ6Ræ–B’ò%6fVB"¢%7VvvW7FVB"À¢ÖWF¢°¢Æ6Ræ6FVv÷'’ÇÂÆ6RçG—RÇÂ$F÷vçF÷vâ"À¢vWE6fVDÆö6F–öäÆ&VÂ‡Æ6R’À¢Æ6TF—7Fæ6TÆ&VÂ‡Æ6R’À¢Òæf–ÇFW"„&ööÆVâ’À¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷Vâ"Â7F–öã¢&÷Vâ"ÒÀ¢6V6öæF'”7F–öç3¢°¢²Æ&VÃ¢6fVD–G2æ†2‡Æ6Ræ–B’ò%&VÖ÷fR"¢%6fR"Â7F–öã¢6fVD–G2æ†2‡Æ6Ræ–B’ò'&VÖ÷fR"¢'6fR"ÒÀ¢²Æ&VÃ¢$F—&V7F–öç2"Â7F–öã¢&F—&V7F–öç2"ÒÀ¢²Æ&VÃ¢%6†&R"Â7F–öã¢'6†&R"ÒÀ¢ÒÀ¢&VÆFVD—FV×3¢&VÆFVBæÖ‚†—FVÒ’Óâ‡°¢–C¢—FVÒæ–BÀ¢F—FÆS¢—FVÒææÖRÀ¢G—S¢—FVÒæ6FVv÷'’ÇÂ—FVÒçG—RÇÂ$æV&'’"À¢–ÖvUW&Ã¢&W6öÇfTVçF—G”–ÖvR†—FVÒÂ&6&B"’À¢Ò’’À¢Ó°¢Ò“°¢6öç7B†æFÆTff÷&—FTÖG&—„7F–öâÒ†7F–öâÂ—FVÒ’Óâ°¢6öç7BÆ6RÒÆ6W2æf–æB‚†6æF–FFR’Óâ6æF–FFRæ–BÓÓÒ—FVÒæ–B’ÇÂ&W6–FVçE6fVEÆ6W2æf–æB‚†6æF–FFR’Óâ6æF–FFRæ–BÓÓÒ—FVÒæ–B“°¢–b†7F–öâæ7F–öâÓÓÒ&÷Vâ"bbÆ6R’°¢6VÆV7EÆ6R‡Æ6R“°¢&WGW&ã°¢Ð¢–b‚†7F–öâæ7F–öâÓÓÒ'6fR"ÇÂ7F–öâæ7F–öâÓÓÒ'&VÖ÷fR"’bbÆ6R’°¢FövvÆU6fVB‡Æ6R“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ&F—&V7F–öç2"bbÆ6R’°¢v–æF÷ræ÷Vâ†F—&V7F–öç5W&Â‡Æ6R’Â%ö&Ææ²"Â&æö÷VæW"Ææ÷&VfW'&W""“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ'6†&R"’°¢6†&U6fVD6öÆÆV7F–öâ‚“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ&÷Vâ×&VÆFVB"bb7F–öâç&VÆFVD–B’°¢6öç7B&VÆFVEÆ6RÒÆ6W2æf–æB‚†6æF–FFR’Óâ6æF–FFRæ–BÓÓÒ7F–öâç&VÆFVD–B“°¢–b‡&VÆFVEÆ6R’6VÆV7EÆ6R‡&VÆFVEÆ6R“°¢Ð¢Ó° ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×F'2Ö6öçFVçBG×&W6–FVçB×F"×æVÂG×6fVBÖF÷vçF÷vâ×æVÂÖ–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷rÖ†–FFVâ#à¢ÆF—b6Æ74æÖSÒ&G×6fVBÖF÷vçF÷vâ×67&öÆÂG×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂÖ†VFW"G×6fVBÖF÷vçF÷vâÖ†VFW"#à¢ÇäÕ’DõtåDõtãÂ÷à¢Æƒ#å6fVBF÷vçF÷vãÂöƒ#à¢Ç7ãå–÷W"6fVBÆ6W2Â&VæVf—G2ÂWfVçG2ÂæBæW‡BæV&'’÷F–öç2ãÂ÷7ãà¢Ç7G&öæsç·&W6–FVçE6fVEÆ6W2æÆVæwF‡Ò6fVCÂ÷7G&öæsà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖ÷fW'f–Wr×&–Â"&–ÖÆ&VÃÒ%6fVBF÷vçF÷vâ7VÖÖ'’#à¢Ç7ããÇ7G&öæsç·6fVDw&÷W2çÆ6W2æÆVæwF‡ÓÂ÷7G&öæsâÆ6W3Â÷7ãà¢Ç7ããÇ7G&öæsç·6fVDw&÷W2æ&VæVf—G2æÆVæwF‡ÓÂ÷7G&öæsâ&VæVf—G3Â÷7ãà¢Ç7ããÇ7G&öæsç·6fVDw&÷W2æWfVçG2æÆVæwF‡ÓÂ÷7G&öæsâWfVçG3Â÷7ãà¢Â÷6V7F–öãà ¢²&W6–FVçE6fVEÆ6W2æÆVæwF‚bb€¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖV×G’×7FFR"&–ÖÆ&VÃÒ$æ÷F†–ær6fVB–WB#à¢Æƒ3äæ÷F†–ær6fVB–WBãÂöƒ3à¢Çå6fRÆ6W2ÂWfVçG2æB&VæVf—G2v†–ÆR–÷RW‡Æ÷&RF÷vçF÷vâãÂ÷à¢ÆF—b6Æ74æÖSÒ&G×6fVBÖ7F–öâ×&÷r#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå&W6–FVçDF—66÷fW'’‚$ÆÂ"—ÓäW‡Æ÷&RæV&'“Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå&W6–FVçDF—66÷fW'’‚$WfVçG2"—Óåf–WrWfVçG3Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå&W6–FVçDF—66÷fW'’‚%W&·2"—Óäf–æB&VæVf—G3Âö'WGFöãà¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ä–çFW&7F—fTÖG&—€¢W–V'&÷sÒ%6fVB ¢F—FÆSÒ%6fVBÆ6W2ÂW&·2ÂWfVçG2ÂæB'V–ÆF–æw2â ¢FW67&—F–öãÒ$6†ö÷6Râ—FVÒFò6VRv‡’—BÖGFW'2Âv†BFòFòæW‡BÂæBv†B—26öææV7FVBæV&'’â ¢—FV×3×¶ff÷&—FTÖG&—„—FV×7Ð¢öä7F–öã×¶†æFÆTff÷&—FTÖG&—„7F–öçÐ¢6Æ74æÖSÒ&GÖff÷&—FW2ÖÖG&—‚ ¢óà ¢²&V6öÖÖVæFVBæÆVæwF‚bb€¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖ6öÆÆV7F–öâ×6V7F–öâ"&–ÖÆ&VÃÒ$W‡Æ÷&RæV&'’#à¢ÆF—b6Æ74æÖSÒ&G×6fVB×6V7F–öâÖ†VF–ær#à¢Æƒ3äW‡Æ÷&RæV&'“Âöƒ3à¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&G×6fVBÖ6öÆÆV7F–öâÖw&–B#à¢·&V6öÖÖVæFVBæÖ‚‡Æ6R’Óâ&VæFW%6fVD6öÆÆV7F–öä6&B‡Æ6RÂ%÷VÆ"æV&'’"’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢—Ð ¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖ6²×6V7F–öâ"&–ÖÆ&VÃÒ$6²F†RÖ&÷WB6fVBÆ6W2#à¢Æƒ3ä6²F†RÖÂöƒ3à¢ÆF—cà¢¶6µ&ö×G2æÖ‚‡&ö×B’Óâ€¢Æ'WGFöâ¶W“×·&ö×GÒG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâfö–BÇ•&ö×B‡&ö×B—Óà¢·&ö×GÐ¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×6fVBÖ7F–öâ×&÷rG×6fVB×&–Ö'’Ö7F–öç2"&–ÖÆ&VÃÒ%6fVBF÷vçF÷vâ7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå&W6–FVçDF—66÷fW'’‚$ÆÂ"—Óà¢Äæf–vF–öâ&–Ö†–FFVãÒ'G'VR"óà¢Ç7ãäæV&'“Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå&W6–FVçDF—66÷fW'’‚$WfVçG2"—Óà¢Ä6ÆVæF$F—2&–Ö†–FFVãÒ'G'VR"óà¢Ç7ãäWfVçG3Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·6†&U6fVD6öÆÆV7F–öçÓà¢Å6VæB&–Ö†–FFVãÒ'G'VR"óà¢Ç7ãå6†&SÂ÷7ãà¢Âö'WGFöãà¢Â÷6V7F–öãà¢ÂöF—cà¢ÂöF—cà¢“°¢Ð ¢gVæ7F–öâ&VæFW%&W÷'G5æVÂ‚’°¢6öç7B6Võ&W÷'BÒÄTtTäE5õ4Tõõ$Uõ%C°¢6öç7B7VÖÖ'”ÖWG&–72Ò°¢²$'&æFVBfW&vR&æ²"Â6Võ&W÷'Bç7VÖÖ'’æ'&æFVDfW&vU÷6—F–öâÂ$†÷rÆVvVæG2W&f÷&×2v†VâV÷ÆR6V&6‚'’æÖR%ÒÀ¢²$F—66÷fW'’fW&vR&æ²"Â6Võ&W÷'Bç7VÖÖ'’ææöä'&æFVDfW&vU÷6—F–öâÂ$†÷rÆVvVæG2V'2f÷"Æ–fW7G–ÆRæBæV–v†&÷&†ööB6V&6†W2%ÒÀ¢²$'&æBFW&×2–âF÷"Â6Võ&W÷'Bç7VÖÖ'’æ'&æFVEF÷¶W—v÷&D6÷VçBÂ%6V&6†W2Ç&VG’v÷&¶–ær%ÒÀ¢²$F—66÷fW'’FW&×2–âF÷"Â6Võ&W÷'Bç7VÖÖ'’ææöä'&æFVEF÷¶W—v÷&D6÷VçBÂ%6V&6†W2&VG’Fò7W÷'B6öçFVçB%ÒÀ¢²%G&6¶VB6Æ–6·2"Â6Võ&W÷'Bç7VÖÖ'’æ÷&væ–46Æ–6·2Â$6Æ–6·2f—6–&ÆR–âF†R6æ6†÷B%ÒÀ¢²%G&6¶VB–×&W76–öç2"Â6Võ&W÷'Bç7VÖÖ'’æ÷&væ–4–×&W76–öç2Â$FVÖæBf—6–&ÆR–âF†R6æ6†÷B%ÒÀ¢Ó°¢6öç7B&–÷&—G”¶W—v÷&G2Ò²ââç6Võ&W÷'Bæ¶W—v÷&DÖWG&–75Ð¢ç6÷'B‚†Â"’Óâ"æ÷÷'GVæ—G•66÷&RÒæ÷÷'GVæ—G•66÷&R¢ç6Æ–6RƒÂb“°¢6öç7BæW‡D÷÷'GVæ—F–W2Ò6Võ&W÷'Bæ÷÷'GVæ—F–W2ç6Æ–6RƒÂ2“°¢6öç7BW6W$¦÷W&æW•67&VVç2Ò°¢°¢&öÆS¢$÷væW""À¢67&VVã¢$W†V7WF—fR&VB"À¢¦ö#¢%VæFW'7FæBv†WF†W"6V&6‚FVÖæB—2w&÷v–æræBv†BFW6W'fW2GFVçF–öâf—'7Bâ"À¢7F–öã¢$&÷fRF†RæW‡BvRÂ6×–vâÂ÷"Æ—7F–ær&–÷&—G’â"À¢ÒÀ¢°¢&öÆS¢$Ö&¶WF–ær"À¢67&VVã¢$6×–vâ&VB"À¢¦ö#¢%GW&â†–v‚Ö–çFVçB6V&6†W2–çFòÖ×f—6–&ÆR6×–vç2ÂöffW'2ÂæB&÷WFW2â"À¢7F–öã¢%ÆâF†RæW‡B6×–vâ&÷VæBF†R6ÆV&W7BVF–Væ6R–çFW&W7Bâ"À¢ÒÀ¢°¢&öÆS¢$6öçFVçBæB4Tò"À¢67&VVã¢$¶W—v÷&B&VB"À¢¦ö#¢%&÷FV7B'&æFVBf—6–&–Æ—G’æB–×&÷fRW6VgVÂF÷vçF÷vâW7F–âvW2â"À¢7F–öã¢%WFFRF†RvRÂÆ—7F–ærÂwV–FRÂ6V&6‚FWF–Ç2Â÷"&VÆFVBÆ–æ·2f÷"F†R&–÷&—G’FW&Òâ"À¢ÒÀ¢°¢&öÆS¢%v÷&·76RÖævW""À¢67&VVã¢$÷W&F–ær&VB"À¢¦ö#¢$¶æ÷rv†B6†ævVBÂv†ò÷vç2F†RæW‡B7FWÂæBv†W&R—B6†÷VÆB&RG&6¶VBâ"À¢7F–öã¢$76–vâF†RWFFRæB¶VWÖ÷&W÷'F–ær7FGW27W'&VçBâ"À¢ÒÀ¢Ó° ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×F'2Ö6öçFVçBG×'FæW"×&VF&ÆR×æVÂGÖÆVvVæG2×6Vò×&W÷'B×æVÂ#à¢ÆF—b6Æ74æÖSÒ&G×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×&VF&ÆRÖ†W&òGÖÆVvVæG2×6VòÖ†W&ò#à¢Ç6Æ74æÖSÒ&G×6Vò×6÷W&6RÖÆ–æR#å4Tò6æ6†÷CÂ÷à¢Æƒ#äÆVvVæG26V&6‚FVÖæBÂG&ç6ÆFVB–çFò7F–öâãÂöƒ#à¢Çà¢F†—267&VVâGW&ç26V&6‚f—6–&–Æ—G’–çFò&7F–6Âv÷&²f÷"F†RÆVvVæG2FVÒâ—B6†÷w0¢v†–6‚FW&×2&RÇ&VG’v÷&¶–ærÂv†–6‚F÷vçF÷vâ6V&6†W2æVVB7G&öævW"vW2ÂæBv†–6€¢WFFW26†÷VÆB&V6öÖRÖ×f—6–&ÆR6öçFVçBÂ6×–vç2Â÷"Æ—7F–ær–×&÷fVÖVçG2à¢Â÷à¢ÆF—b6Æ74æÖSÒ&G×6Vò×6æ6†÷BÖÖWF"&–ÖÆ&VÃÒ%4Tò6æ6†÷B6÷W&6R#à¢Ç7ãå6÷W&6S¢¶ÆVvVæG4ÇW‡W'•&W6Væ6U6Võ6æ6†÷Bç6÷W&6WÓÂ÷7ãà¢Ç7ãä6GW&VB¶f÷&ÖE6VôFFR‡6Võ&W÷'Bæ6GW&VDB—ÓÂ÷7ãà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2×6Vò×7VÖÖ'’×7G&—"&–ÖÆ&VÃÒ$ÆVvVæG24Tòv&VæW727VÖÖ'’#à¢·7VÖÖ'”ÖWG&–72æÖ‚…¶Æ&VÂÂfÇVRÂ6÷•Ò’Óâ€¢Æ'F–6ÆR¶W“×¶Æ&VÇÒ6Æ74æÖSÒ&GÖÆVvVæG2×6VòÖÖWG&–2#à¢Ç7ãç¶Æ&VÇÓÂ÷7ãà¢Ç7G&öæsç¶f÷&ÖE6VôçVÖ&W"‡fÇVR—ÓÂ÷7G&öæsà¢Çç¶6÷—ÓÂ÷à¢Âö'F–6ÆSà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2×6Vò×&VF÷WB"&–ÖÆ&VÃÒ%4Tò&W÷'F–ær6öçFW‡B#à¢Ç7ãåv†BF†—2ÖVç3Â÷7ãà¢Ç7G&öæsåV÷ÆRÇ&VG’f–æBÆVvVæG2'’æÖRâF†RæW‡Bv–ç26öÖRg&öÒW6VgVÂF÷vçF÷vâæBæV–v†&÷&†ööBvW2ãÂ÷7G&öæsà¢Çà¢Æ—7F–ær6V&6†W2ÂFG&W72FVÖæBÂfÖ–Ç’Æ–fW7G–ÆRFW&×2ÂæBÇW‡W'’†öÖRwV–Fæ6R6†÷VÆBV6€¢ÆVBFò6ÆV"vR÷"Æ—7F–ærF‚âF†RÖ6âF†VâGW&âF†BFVÖæB–çFò6fVB†öÖW2À¢&÷WFRf–Ww2Â6†÷v–ær&WVW7G2ÂæBæV–v†&÷&†ööB6öçFVçBà¢Â÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×6Vò×W6W"Ö¦÷W&æW—2"&–ÖÆ&VÃÒ%4Tò6æ6†÷BW6W"¦÷W&æW—2#à¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2×6V7F–öâÖ†VF–ær#à¢Ç7ãå67&VVâ'’W6W#Â÷7ãà¢Ç7G&öæsäV6‚W'6öâvWG2F†R6ÖR6æ6†÷BÂv—F‚F–ffW&VçBæW‡B7FWãÂ÷7G&öæsà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&G×6Vò×W6W"Ö¦÷W&æW’ÖÆ—7B#à¢·W6W$¦÷W&æW•67&VVç2æÖ‚†—FVÒ’Óâ€¢Æ'F–6ÆR¶W“×¶—FVÒç&öÆWÒ6Æ74æÖSÒ&G×6Vò×W6W"Ö¦÷W&æW’×&÷r#à¢ÆF—cà¢Ç7G&öæsç¶—FVÒç&öÆWÓÂ÷7G&öæsà¢Ç7ãç¶—FVÒç67&VVçÓÂ÷7ãà¢ÂöF—cà¢Çç¶—FVÒæ¦ö'ÓÂ÷à¢ÆVÓç¶—FVÒæ7F–öçÓÂöVÓà¢Âö'F–6ÆSà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2Ö¶W—v÷&B×F&ÆR"&–ÖÆ&VÃÒ%&–÷&—G’4Tò6æ6†÷B¶W—v÷&G2#à¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2×6V7F–öâÖ†VF–ær#à¢Ç7ãå&–÷&—G’¶W—v÷&Bf–WsÂ÷7ãà¢Ç7G&öæså6V&6‚FW&×2F†BæVVBâ÷væW"ÂvRÂ÷"6×–vâ–FVãÂ÷7G&öæsà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2Ö¶W—v÷&BÖÆ—7B#à¢·&–÷&—G”¶W—v÷&G2æÖ‚†ÖWG&–2’Óâ€¢Æ'F–6ÆR¶W“×¶ÖWG&–2ææ÷&ÖÆ—¦VD¶W—v÷&GÒ6Æ74æÖSÒ&GÖÆVvVæG2Ö¶W—v÷&B×&÷r#à¢ÆF—cà¢Ç7G&öæsç¶ÖWG&–2æ¶W—v÷&GÓÂ÷7G&öæsà¢Ç7ãç¶ÖWG&–2æ6ÇW7FW$Æ&VÇÒ+r¶ÖWG&–2æ¶W—v÷&EG—RÓÓÒ&'&æFVB"ò$'&æFVB"¢$æöâÖ'&æFVB'ÓÂ÷7ãà¢ÂöF—cà¢ÆFÃà¢ÆF—cà¢ÆGCä6Æ–6·3ÂöGCà¢ÆFCç¶f÷&ÖE6VôçVÖ&W"†ÖWG&–2æ6Æ–6·2—ÓÂöFCà¢ÂöF—cà¢ÆF—cà¢ÆGCä–×&W76–öç3ÂöGCà¢ÆFCç¶f÷&ÖE6VôçVÖ&W"†ÖWG&–2æ–×&W76–öç2—ÓÂöFCà¢ÂöF—cà¢ÆF—cà¢ÆGCä5E#ÂöGCà¢ÆFCç¶f÷&ÖE6VõW&6VçB†ÖWG&–2æ7G"—ÓÂöFCà¢ÂöF—cà¢ÆF—cà¢ÆGCå&–÷&—G“ÂöGCà¢ÆFCç¶ÖWG&–2æ÷÷'GVæ—G•&–÷&—G—ÓÂöFCà¢ÂöF—cà¢ÂöFÃà¢Çç¶ÖWG&–2ç&V6öÖÖVæFVD7F–öçÓÂ÷à¢Âö'F–6ÆSà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2Ö÷÷'GVæ—G’×æVÂ"&–ÖÆ&VÃÒ%4TòæW‡B7F–öç2#à¢ÆF—cà¢Ç7ãåv†BFòFòæW‡CÂ÷7ãà¢Ç7G&öæsåGW&â6V&6‚–çFW&W7B–çFò6ÆV"æW‡B7FW2ãÂ÷7G&öæsà¢ÇäV6‚&÷r—'2â÷væW"ÂFW7F–æF–öâvRÂæBF†RæW‡BWFFR6òF†R&W÷'B&V6öÖW2öæR&7F–6Â7F–öâãÂ÷à¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖÆVvVæG2Ö÷÷'GVæ—G’ÖÆ—7B#à¢¶æW‡D÷÷'GVæ—F–W2æÖ‚†ÖWG&–2’Óâ€¢Æ'F–6ÆR¶W“×¶ÖWG&–2ææ÷&ÖÆ—¦VD¶W—v÷&GÓà¢ÆF—cà¢Ç7G&öæsç¶ÖWG&–2æ6ÇW7FW$Æ&VÇÓÂ÷7G&öæsà¢Ç7ãç¶ÖWG&–2æ÷væW'Ò+r¶ÖWG&–2æÆæF–æuvWÓÂ÷7ãà¢ÂöF—cà¢Çç¶ÖWG&–2ç&V6öÖÖVæFVD7F–öçÓÂ÷à¢Âö'F–6ÆSà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÆVvVæG2×6Vò×7FGW2"&–ÖÆ&VÃÒ%4Tò6æ6†÷B7–æ27FGW2#à¢Ç7G&öæså6÷W&6Ræ÷FSÂ÷7G&öæsà¢Çç·6Võ&W÷'Bæ66W74ÖWF†öBææ÷FWÓÂ÷à¢ÆF—cà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâv–æF÷ræÆö6F–öâæ76–vâ‚"÷'FæW"×v÷&·76Rö÷fW'f–Wr"—Óä÷Vâv÷&·76R&W÷'CÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ÷Vå'FæW%æVÂ‚&6×–vç2"—ÓåÆâ6öçFVçCÂö'WGFöãà¢ÂöF—cà¢Â÷6V7F–öãà¢ÂöF—cà¢ÂöF—cà¢“°¢Ð ¢gVæ7F–öâ&VæFW$7F—f—G•æVÂ‚’°¢6öç7B7F—f—G•&÷w2Ò°¢²%V÷ÆR&R÷Væ–ærF†RÖ"Â$æV&'’Æ6W2ÂöffW'2ÂæBWfVçG2&R&V–ær6fVBFövWF†W"â"Â$÷VâÖ"Â‚’Óâ÷Vå'FæW$Ö‚$ÆÂ"•ÒÀ¢²$F–æ–ær—2vWGF–ærGFVçF–öâ"Â$†’†÷W"ÂF–÷2ÂæBF–ææW"6V&6†W2&R–6¶–ærWâ"Â$7&VFRöffW""Â‚’Óâ÷Vå'FæW%æVÂ‚&6×–vç2"•ÒÀ¢²$WfVçG2&R6†–æræV&'’Æç2"Â$WfVæ–ær6fW2&R–6¶–ærW&÷VæB6V†öÆÒÂ&–æW’ÂæB6öæw&W72â"Â%f–WrWfVçG2"Â‚’Óâ÷Vå'FæW$Ö‚$WfVçG2"•ÒÀ¢²$gFW"v÷&²—2F†R6ÆV&W7Bv–æF÷r"Â%V÷ÆR&RÖ÷7BÆ–¶VÇ’Fò6fRÂ6²f÷"F—&V7F–öç2Â÷"W6RâöffW"gFW"v÷&²æBöâvVV¶VæG2â"Â%&Wf–Wr&W÷'B"Â‚’Óâ÷Vå'FæW%æVÂ‚'&W÷'G2"•ÒÀ¢Ó°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×F'2Ö6öçFVçBG×'FæW"×&VF&ÆR×æVÂ#à¢ÆF—b6Æ74æÖSÒ&G×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×&VF&ÆRÖ†W&ò#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#å'FæW"7F—f—G“Â÷à¢Æƒ#äæV&'’7F—f—G’Â6–×Æ–f–VBãÂöƒ#à¢Çå6VRv†BV÷ÆR÷VâÂ6fRÂ66âÂæBW6Rv—F†÷WBF†RW‡G&æö—6RãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×7VÖÖ'’Öw&–B"&–ÖÆ&VÃÒ$7F—f—G’7VÖÖ'’#à¢µ°¢²%V÷ÆR÷Vâ"Â%Æ6W2"Â%v†W&R&W6–FVçG2æBwVW7G2Æöö²f—'7B%ÒÀ¢²%V÷ÆR6fR"Â%6†÷'FÆ—7G2"Â%Æ6W2æBöffW'2F†W’Ö’&Wf—6—B%ÒÀ¢²%V÷ÆRW6R"Â$öffW'2"Â%W&·2Â%5e2Â66ç2ÂæBF—&V7F–öç2%ÒÀ¢ÒæÖ‚…¶Æ&VÂÂfÇVRÂ6÷•Ò’Óâ€¢Æ'F–6ÆR¶W“×¶Æ&VÇÒ6Æ74æÖSÒ&G×'FæW"×7VÖÖ'’Ö6&B#à¢Ç7ãç¶Æ&VÇÓÂ÷7ãà¢Ç7G&öæsç·fÇVWÓÂ÷7G&öæsà¢Çç¶6÷—ÓÂ÷à¢Âö'F–6ÆSà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÆ—7B"&–ÖÆ&VÃÒ%&V6VçB'FæW"7F—f—G’#à¢¶7F—f—G•&÷w2æÖ‚…·F—FÆRÂ6÷’Â7F–öâÂöä6Æ–6µÒ’Óâ€¢Æ'WGFöâ¶W“×·F—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&÷rG×'FæW"ÖfVVB×&÷r"öä6Æ–6³×¶öä6Æ–6·Óà¢Ç7â6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÖ–â#à¢Ç7â6Æ74æÖSÒ&G×F"×&÷rÖ–6öâ#ãÅ66äÆ–æR6Æ74æÖSÒ&‚ÓBrÓB"óãÂ÷7ãà¢Ç7ãà¢Ç7G&öæsç·F—FÆWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃà¢Â÷7ãà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&G×F"×6–væÂ#ç¶7F–öçÓÂ÷7ãà¢Âö'WGFöãà¢’—Ð¢Â÷6V7F–öãà¢ÂöF—cà¢ÂöF—cà¢“°¢Ð ¢gVæ7F–öâ&VæFW$6×–våæVÂ‚’°¢6öç7B6×–vå&÷w2Ò²ââæÆ—fT6×–väÆ–W$W†×ÆW2Âââæ'&æD6×–väW†×ÆW5Ó°¢6öç7B—46×–vä÷fW'f–WrÒW&Å7FFRæ6×–vä–BbbW&Å7FFRæVçF—G”–C°¢6öç7B&WVW7FVD6×–vä–BÒW&Å7FFRæ6×–vä–BÇÂ†—46×–vä÷fW'f–Wrò""¢7F—fT6×–vå7FW“°¢6öç7B6VÆV7FVD6×–vâÒ6×–vå&÷w2æf–æB‚†6×–vâ’Óâ6×–vâæ–BÓÓÒ&WVW7FVD6×–vä–B’ÇÂÆ—fT6×–väÆ–W$W†×ÆW5³Ó°¢6öç7B6VÆV7FVE7FGW2Ò6VÆV7FVD6×–vãòç7FGW2ÇÂ%&VG’#°¢6öç7B6VÆV7FVDVçF—G’Ò‡W&Å7FFRæVçF—G”–BòÆ6W2æf–æB‚‡Æ6R’ÓâÆ6Ræ–BÓÓÒW&Å7FFRæVçF—G”–BÇÂÆ6Rç&sòæ–BÓÓÒW&Å7FFRæVçF—G”–B’¢çVÆÂ’ÇÂf–æD6×–väVçF—G’‡6VÆV7FVD6×–vâ“°¢6öç7B—4'&æD7F—fF–öâÒ6VÆV7FVD6×–vãòæÆ–W%G—RÓÓÒ&'&æB"ÇÂ‡6VÆV7FVDVçF—G’bb—4'&æDVçF—G’‡6VÆV7FVDVçF—G’’“°¢6öç7BÖf–ÇFW"Ò—4'&æD7F—fF–öâò$'&æB7F—fF–öç2"¢vWD6×–väf–ÇFW"‡6VÆV7FVD6×–vâ“°¢6öç7B'FæW$Æ&VÂÒ6VÆV7FVD6×–vãòæ'&æDæÖRÇÂ6VÆV7FVD6×–vãòçÆ6TæÖRÇÂ6VÆV7FVDVçF—G“òææÖRÇÂ%'FæW"FVÒ#°¢6öç7B6×–våF—FÆRÒ—46×–vä÷fW'f–Wrò$6†ö÷6R6×–vâFòÆVæ6‚"¢6VÆV7FVD6×–vãòæ6×–väæÖRÇÂ$öæR6ÆV"6×–vâ#°¢6öç7BÖöÖVçDÆ–æRÒ6VÆV7FVD6×–vãòæÖöÖVçBòG·6VÆV7FVD6×–vâæÖöÖVçGÒG·6VÆV7FVD6×–vâæ&Vò+rG·6VÆV7FVD6×–vâæ&VÖ¢"'Ö¢6VÆV7FVD6×–vãòæ–çFVçBÇÂ$6†ö÷6RF†R7G&öævW7BæV&'’ÖöÖVçBâ#°¢6öç7BVF–Væ6TÆ–æRÒ6VÆV7FVD6×–vãòæVF–Væ6RÇÂ%&W6–FVçG2Âf—6—F÷'2Â†÷FVÂwVW7G2ÂæBæV&'’v÷&¶W'2Ç&VG’Ö¶–ærF÷vçF÷vâFV6—6–öââ#°¢6öç7B7F–öäÆ–æRÒ6VÆV7FVD6×–vãòç&W6–FVçDf6–ætöffW"ÇÂ$v—fRF†BVF–Væ6RöæRW6VgVÂ7F–öã¢6fRÂvWBF—&V7F–öç2Â%5eÂ66âÂ&WVW7BÂ÷"&VFVVÒâ#°¢6öç7BÖV7W&TÆ–æRÒ6VÆV7FVD6×–vãòç'FæW$–ç6–v‡BÇÂ$ÖV7W&R÷Vç2Â6fW2Â66ç2ÂF—&V7F–öç2Â&VFV×F–öç2Â%5e2ÂæBföÆÆ÷r×W&WVW7G2â#°¢6öç7B7G&FVw”Æ–æRÒ—46×–vä÷fW'f–Wp¢ò%W6RF†—2f–WrFò6†ö÷6RöæR6×–vâÂöæRVF–Væ6RÂæBöæRÖV7W&&ÆR7F–öâ&Vf÷&R6VæF–ærV÷ÆRFòF†R'V–ÆFW"â ¢¢6VÆV7FVD6×–vãòç7G&FVw”Æ–æRÇÂ7F–öäÆ–æS°¢6öç7B&W7DÖ÷fUF—FÆRÒ—46×–vä÷fW'f–Wrò%7F'Bv—F‚F†R6ÆV&W7BFVÖæBâ"¢6VÆV7FVD6×–vãòæ&W7DÖ÷fUF—FÆRÇÂ$6†ö÷6RöæR7F–öââ#°¢6öç7B&W7DÖ÷fT6÷’Ò—46×–vä÷fW'f–Wp¢ò$gFW"×v÷&²F–æ–ær—2F†R7G&öævW7BFVfVÇB&V6W6R—B6öææV7G2&W6–FVçG2Â†÷FVÂwVW7G2ÂæBæV&'’v÷&¶W'2Fò6–×ÆRæW‡B7FWâ ¢¢6VÆV7FVD6×–vãòæ&W7DÖ÷fT6÷’ÇÂ$¶VWF†RÖW76vR6†÷'BÂ7V6–f–2ÂæBÖV7W&&ÆRâ#°¢6öç7B6VÆV7FVE–å7VÖÖ'’Ò6VÆV7FVDVçF—G“òç7VÖÖ'’ÇÂ6VÆV7FVDVçF—G“òæFW67&—F–öâÇÂ6VÆV7FVDVçF—G“òæöffW"ÇÂ6VÆV7FVD6×–vãòç–åW6RÇÂ'FæW$Æ&VÃ°¢6öç7B6VÆV7FVE–ä6÷’Ò6VÆV7FVDVçF—G¢òG·6VÆV7FVDVçF—G’ææÖWÓ¢G·6VÆV7FVE–å7VÖÖ'—Ö ¢¢6VÆV7FVD6×–vãòç–åW6RÇÂ'FæW$Æ&VÃ°¢6öç7BF7F–öâÒ6VÆV7FVD6×–vãòçF7F–öâÇÂ7F–öäÆ–æS°¢6öç7B&ööeö–çBÒ6VÆV7FVD6×–vãòç&ööeö–çBÇÂÖV7W&TÆ–æS°¢6öç7B&–Ö'”7F–öäÆ&VÂÒ6VÆV7FVE7FGW2ÓÓÒ$Æ—fR"ò%&Wf–Wr&W7VÇG2"¢6VÆV7FVE7FGW2ÓÓÒ$G&gB"ò$f–æ—6‚G&gB"¢—46×–vä÷fW'f–Wrò$÷Vâ'V–ÆFW""¢$'V–ÆB6×–vâ#°¢6öç7B&V6öÖÖVæFVD6×–vå&÷w2Ò6×–vå&÷w0¢æf–ÇFW"‚†6×–vâ’Óâ6×–vâç7FGW2ÓÒ$&6†—fVB"¢ç6Æ–6RƒÂR“° ¢gVæ7F–öâf–æD6×–väVçF—G’†6×–vâ’°¢6öç7B'&æD–BÒ7G&–ær†6×–vãòæ'&æD–BÇÂ6×–vãòçÆ6T–BÇÂ""“°¢6öç7BF—&V7DÖF6‚Ò'&æD–@¢òÆ6W2æf–æB‚‡Æ6R’ÓâÆ6Ræ–BÓÓÒ'&æD–BÇÂÆ6Rç&sòæ–BÓÓÒ'&æD–B¢¢çVÆÃ°¢–b†F—&V7DÖF6‚’&WGW&âF—&V7DÖF6ƒ°¢6öç7B'&æDæÖRÒ7G&–ær†6×–vãòæ'&æDæÖRÇÂ6×–vãòçÆ6TæÖRÇÂ""’çFôÆ÷vW$66R‚“°¢–b‚'&æDæÖR’&WGW&âçVÆÃ°¢6öç7Bæ÷&ÖÆ—¦VD'&æDæÖRÒ'&æDæÖRç&WÆ6R‚õæ'&æBÒòÂ""’ç&WÆ6R‚õç'FæW"ÒòÂ""’ç&WÆ6R‚òÒörÂ""“°¢&WGW&âÆ6W2æf–æB‚‡Æ6R’Óâ°¢6öç7BÆ6T'&æBÒ7G&–ær‡Æ6Ræ'&æBÇÂÆ6Rç&sòæ'&æBÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7BÆ6TæÖRÒ7G&–ær‡Æ6RææÖRÇÂ""’çFôÆ÷vW$66R‚“°¢&WGW&â€¢Æ6Ræ–BÓÓÒ'&æD–BÇÀ¢Æ6T'&æBÓÓÒ'&æDæÖRÇÀ¢Æ6TæÖRÓÓÒ'&æDæÖRÇÀ¢Æ6T'&æBÓÓÒæ÷&ÖÆ—¦VD'&æDæÖRÇÀ¢Æ6TæÖRÓÓÒæ÷&ÖÆ—¦VD'&æDæÖRÇÀ¢Æ6TæÖRæ–æ6ÇVFW2†æ÷&ÖÆ—¦VD'&æDæÖR’ÇÀ¢æ÷&ÖÆ—¦VD'&æDæÖRæ–æ6ÇVFW2‡Æ6TæÖR¢“°¢Ò’ÇÂçVÆÃ°¢Ð ¢gVæ7F–öâvWD6×–väf–ÇFW"†6×–vâ’°¢–b†6×–vãòæÆ–W%G—RÓÓÒ&'&æB"’&WGW&â$'&æG2#°¢–b†6×–vãòæÆ–W%G—RÓÓÒ&†÷FVÂ"’&WGW&â$†÷FVÇ2#°¢–b†6×–vãòæÆ–W%G—RÓÓÒ'&÷W'G’"’&WGW&â%&÷W'F–W2#°¢–b†6×–vãòæÆ–W%G—RÓÓÒ&WfVçB"’&WGW&â$WfVçG2#°¢&WGW&â$6×–vç2#°¢Ð ¢gVæ7F–öâ†æFÆT6×–vå&–Ö'”7F–öâ‚’°¢–b‡6VÆV7FVE7FGW2ÓÓÒ$Æ—fR"’°¢÷Vå'FæW%æVÂ‚'&W÷'G2"“°¢&WGW&ã°¢Ð¢–b‡6VÆV7FVDVçF—G’’°¢æf–vFR†6×–vå&÷WFR‡6VÆV7FVDVçF—G’’“°¢&WGW&ã°¢Ð¢æf–vFR†÷'FæW'2ö6×–vç3ö6×–vä–CÒG¶Væ6öFUU$”6ö×öæVçB‡6VÆV7FVD6×–vâæ–B—ÒfÖöÖVçCÒG¶Væ6öFUU$”6ö×öæVçB‡6VÆV7FVD6×–vâæÖöÖVçBÇÂ""—Ö“°¢Ð ¢gVæ7F–öâ†æFÆT6×–våf–WtÖ‚’°¢6ÆV$÷VäÖ6VÆV7F–öâ‚“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD7F—fTf–ÇFW"†Öf–ÇFW"“°¢–b‡6VÆV7FVDVçF—G’’°¢6WE6VÆV7FVD–B‡6VÆV7FVDVçF—G’æ–B“°¢6WEVÇ6–æu–ä–B‡6VÆV7FVDVçF—G’æ–B“°¢Ð¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"†6×–våF—FÆRÂ6VÆV7FVDVçF—G’ò·6VÆV7FVDVçF—G’Âââçf—6–&ÆUÆ6W5Ò¢f—6–&ÆUÆ6W2Â''FæW""Â6VÆV7FVD6×–vâæ&VÇÂF—7G&–7BÂÖf–ÇFW"’“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢æf–vFR†öÖöÖöFS×'FæW"gF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†Öf–ÇFW"—Òf6×–vä–CÒG¶Væ6öFUU$”6ö×öæVçB‡6VÆV7FVD6×–vâæ–B—ÒG·6VÆV7FVDVçF—G“òæ–BòfVçF—G”–CÒG¶Væ6öFUU$”6ö×öæVçB‡6VÆV7FVDVçF—G’æ–B—Ö¢"'Ö“°¢Ð ¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×F'2Ö6öçFVçBG×'FæW"×&VF&ÆR×æVÂGÖ6×–vâÖG&vW"#à¢ÆF—b6Æ74æÖSÒ&G×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×&VF&ÆRÖ†W&òGÖ6×–vâÖ†W&ò#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ç¶—46×–vä÷fW'f–Wrò%'FæW"6×–vç2"¢—4'&æD7F—fF–öâò$'&æB7F—fF–öâ"¢$6×–vâ'ÓÂ÷à¢Æƒ#ç¶—46×–vä÷fW'f–Wrò$6×–vç2'V–ÇB&÷VæB&VÂF÷vçF÷vâFV6—6–öç2â"¢G·'FæW$Æ&VÇÓ¢G¶6×–våF—FÆWÖÓÂöƒ#à¢Çç·7G&FVw”Æ–æWÓÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6×–vâÖÖöÖVçB#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä&W7BÖ÷fSÂ÷à¢Æƒ3ç¶&W7DÖ÷fUF—FÆWÓÂöƒ3à¢Çç¶&W7DÖ÷fT6÷—ÓÂ÷à¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖÖWF×&÷r"&–ÖÆ&VÃÒ%&V6öÖÖVæFVB6×–vâ6öçFW‡B#à¢Ç7ãç¶Öf–ÇFW'ÓÂ÷7ãà¢Ç7ãç·6VÆV7FVE7FGW7ÓÂ÷7ãà¢Ç7ãç·6VÆV7FVD6×–vâæ&VÇÂ$F÷vçF÷vâ'ÓÂ÷7ãà¢ÂöF—cà¢Â÷6V7F–öãà ¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖ7F–öâÖ&"#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&–Ö'’Ö7F–öâ"öä6Æ–6³×¶†æFÆT6×–vå&–Ö'”7F–öçÓç·&–Ö'”7F–öäÆ&VÇÓÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×6V6öæF'’Ö7F–öâ"öä6Æ–6³×¶†æFÆT6×–våf–WtÖÓåf–WrÖÂö'WGFöãà¢ÂöF—cà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6×–vâ×7VvvW7F–öâ#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä6×–vâ'&–VcÂ÷à¢Æƒ3ç¶6×–våF—FÆWÓÂöƒ3à¢Çç¶ÖöÖVçDÆ–æWÓÂ÷à¢ÆF—b6Æ74æÖSÒ&GÖ6×–vâÖFWF–ÂÖÆ—7B#à¢Ç7ããÇ7G&öæsåv†ò6VW2—CÂ÷7G&öæsâ¶VF–Væ6TÆ–æWÓÂ÷7ãà¢Ç7ããÇ7G&öæsåv†BF†W’FóÂ÷7G&öæsâ¶7F–öäÆ–æWÓÂ÷7ãà¢Ç7ããÇ7G&öæsåv†B–÷RG&6³Â÷7G&öæsâ¶ÖV7W&TÆ–æWÓÂ÷7ãà¢ÂöF—cà¢Â÷6V7F–öãà ¢¶—46×–vä÷fW'f–Wrò€¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6×–vâÖÆ–W"ÖÆ—7B"&–ÖÆ&VÃÒ%&V6öÖÖVæFVB6×–vâ÷F–öç2#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#å&V6öÖÖVæFVB6×–vâ÷F–öç3Â÷à¢ÆF—cà¢·&V6öÖÖVæFVD6×–vå&÷w2æÖ‚†6×–vâ’Óâ€¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢¶W“×¶6×–vâæ–GÐ¢6Æ74æÖSÒ&GÖ6×–vâÖÆ–W"×&÷rGÖ6×–vâÖ÷F–öâ×&÷r ¢öä6Æ–6³×²‚’Óâ°¢6WD7F—fT6×–vå7FW†6×–vâæ–B“°¢æf–vFR†öÖöÖöFS×'FæW"gF#Ö6×–vç2ff–ÇFW#Ô6×–vç2f6×–vä–CÒG¶Væ6öFUU$”6ö×öæVçB†6×–vâæ–B—Ö“°¢×Ð¢à¢Ç7ãà¢Ç7G&öæsç¶6×–vâæ6×–väæÖWÓÂ÷7G&öæsà¢Ç6ÖÆÃç¶6×–vâæVF–Væ6RÇÂ$F÷vçF÷vâVF–Væ6R'Ò+r¶6×–vâæ&VÇÂ6×–vâæ–çFVçBÇÂ$Ö6×–vâ'ÓÂ÷6ÖÆÃà¢Â÷7ãà¢ÆVÓç¶6×–vâç7FGW2ÇÂ%&VG’'ÓÂöVÓà¢Âö'WGFöãà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢’¢çVÆÇÐ ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6×–vâ×&VF÷WB"&–ÖÆ&VÃÒ$6×–vâ&VF–æW72#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä6†V6²&Vf÷&RÆVæ6ƒÂ÷à¢ÆF—cà¢µ°¢²$ÖÆ6VÖVçB"Â6VÆV7FVE–ä6÷•ÒÀ¢²%W6W"7F–öâ"ÂF7F–öåÒÀ¢²%v†BFòÖV7W&R"Â&ööeö–çEÒÀ¢ÒæÖ‚…¶Æ&VÂÂ6÷•Ò’Óâ€¢Æ'F–6ÆR¶W“×¶Æ&VÇÓà¢Ç7ãç¶Æ&VÇÓÂ÷7ãà¢Çç¶6÷—ÓÂ÷à¢Âö'F–6ÆSà¢’—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢ÂöF—cà¢ÂöF—cà¢“°¢Ð ¢gVæ7F–öâ&VæFW$–æfõæVÂ‚’°¢6öç7B—5'FæW$–æfòÒW&Å7FFRæÖöFRÓÓÒ''FæW"#°¢–b†—5'FæW$–æfò’&WGW&âÅ'FæW$wV–FRóã°¢6öç7B67&öÆÅFô–æfôfÒ‚’Óâ°¢Fö7VÖVçBçVW'•6VÆV7F÷"‚"æGÖ–æfòÖwV–FRÖf"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢'7F'B"Ò“°¢Ó°¢6öç7B6öçFVçBÒ°¢W–V'&÷s¢%U4”ärDõtåDõtâU$µ2"À¢†VFÆ–æS¢$WfW'—F†–ær–÷RæVVBFòvWBÖ÷&R÷WBöbF÷vçF÷vââ"À¢6÷“¢$f–æBæV&'’Æ6W2Â6ö×&RF†RÖöÖVçBÂ6fRv†BÖGFW'2ÂæB÷Vâ&W6–FVçBW&·2v†VâF†W’Ç’â"À¢&–Ö'“¢²$W‡Æ÷&RF†RÖ"Â‚’Óâ÷Vå&W6–FVçDÆ–W"‚$ÆÂ"•ÒÀ¢6V6öæF'“¢²$vWB–÷W"W&·26&B"Â‚’Óâæf–vFR‚"ö6&B"•ÒÀ¢÷fW'f–Ws¢°¢²$Ö"Â%&W7FW&çG2Â6öffVRÂWfVçG2Â6W'f–6W2ÂæB'V–ÆF–æw2æV&'’â%ÒÀ¢²%W&·2"Â%&W6–FVçB&VæVf—G2æB'FæW"öffW'2–â6öçFW‡Bâ%ÒÀ¢²%6fVB"Â%Æ6W2æBÆç2–÷RvçBFò6öÖR&6²Fòâ%ÒÀ¢²$6&B"Â%–÷W"&W6–FVçB"f÷"'F–6—F–ærÖöÖVçG2â%ÒÀ¢ÒÀ¢7FW3¢²%6V&6‚÷"6†ö÷6Rf–ÇFW"â"Â$÷VâF†RÆ6RÂWfVçBÂ÷"W&²â"Â%6fR—BÂvWBF—&V7F–öç2Â÷"6†÷r–÷W"6&Bâ%ÒÀ¢†÷s¢°¢²%7F'Bv—F‚–çFVçBâ"Â%W6R6FVv÷'’ÂæV&'’6V&6‚Â÷"6²F†RÖ&ö×Bâ%ÒÀ¢²$÷VâF†R&–v‡BÆ–W"â"Â%Æ6W2ÂWfVçG2ÂW&·2ÂÆ—7F–æw2ÂæBW6VgVÂÆö6ÂFWF–Ç27F’6öææV7FVBFòF†RÖâ%ÒÀ¢²$7Bv—F†÷WBÆ÷6–ær6öçFW‡Bâ"Â%6fRÂvWBF—&V7F–öç2Â6†&RÂ÷"6†÷r–÷W"&W6–FVçB6&Bg&öÒF†R6ÖRfÆ÷râ%ÒÀ¢ÒÀ¢fVGW&W3¢°¢²$æV&'’"Â$F–æ–ærÂ6öffVRÂ6W'f–6W2ÂWfVçG2ÂæB'V–ÆF–æw2â%ÒÀ¢²%W&·2"Â$&VæVf—G2GF6†VBFòÆ6W2æB'FæW"ÖöÖVçG2â%ÒÀ¢²$WfVçG2"Â%v†B—2†Væ–ærFöF’÷"F†—2vVV²â%ÒÀ¢²%&W6–FVçB6&B"Â$"72f÷"'F–6—F–ær'FæW'2â%ÒÀ¢²%6fVB"Â$W'6öæÂÆ—7BöbÆ6W2æBÆç2â%ÒÀ¢²$6²F†RÖ"Â%&ö×G2f÷"v†B–÷RæVVB&–v‡Bæ÷râ%ÒÀ¢ÒÀ¢F—5F—FÆS¢$Æö6ÂF—2"À¢F—3¢°¢%6fRÆ6W2&Vf÷&RF†RvVV¶VæBâ"À¢$6†V6²WfVçG2&Vf÷&R†VF–ær÷WBâ"À¢%6†÷r–÷W"6&Bv†VâW&²6·2f÷"—Bâ"À¢ÒÀ¢f¢°¢²$†÷rFòW&·2v÷&³ò"Â$÷VâW&²g&öÒF†RÖFò6VRF†R&VæVf—BÂv†W&R—BÆ–W2ÂæBv†BFò6†÷râ%ÒÀ¢²$Fò’æVVBâ66÷VçCò"Â%–÷R6â'&÷w6Rg&VVÇ’â6fVBÆ6W2æB&W6–FVçB66W72v÷&²&W7Bv†Vâ6öææV7FVBFò–÷W"&W6–FVçB&öf–ÆRâ%ÒÀ¢²$†÷rFò’6fRÆ6W3ò"Â$÷VâÆ6RÂWfVçBÂÆ—7F–ærÂ÷"W&²æBW6RF†R6fR7F–öâv†Vâ—BV'2â%ÒÀ¢²$†÷rFò’VæÆö6²öffW'3ò"Â$÷VâF†RW&·2Æ–W"æB6†÷rF†R&W6–FVçB6&B÷"öffW"FWF–Ç2v†Vâ'FæW"6·2â%ÒÀ¢ÒÀ¢†VÇ¢²$æVVB6öÖR†VÇò"Â%vR&R†’Fòö–çB–÷R–âF†R&–v‡BF—&V7F–öââ"Â$g&WVVçFÇ’6¶VBVW7F–öç2"Â67&öÆÅFô–æfôfÒÀ¢Ó°¢6öç7BÖ¶Uf—6–&–Æ—G•&VÆFVD—FV×2Ò†f–ÇFW"’ÓâÆ6W0¢æf–ÇFW"‚‡Æ6R’ÓâÖF6†W4f–ÇFW"‡Æ6RÂf–ÇFW"Â6fVD–G2’¢ç6Æ–6RƒÂB¢æÖ‚‡Æ6R’Óâ‡°¢–C¢Æ6Ræ–BÀ¢F—FÆS¢Æ6RææÖRÀ¢G—S¢Æ6Ræ6FVv÷'’ÇÂÆ6RçG—RÇÂ$æV&'’"À¢–ÖvUW&Ã¢&W6öÇfTVçF—G”–ÖvR‡Æ6RÂ&6&B"’À¢Ò’“°¢6öç7Bf—6–&–Æ—G”6FVv÷&–W2Ò°¢°¢–C¢&6öffVR"À¢Æ&VÃ¢$6öffVR"À¢f–ÇFW#¢$6öffVR"À¢FW67&—F–öã¢%6†÷w2æV&'’6fW2Â'&V¶f7B7F÷2ÂæBÆ6W2W6VgVÂ&Vf÷&Rv÷&²÷"vVV¶VæBÆç2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$6öffVR"ò%6†÷v–æræ÷r"¢$æV&'’"À¢ÖWF¢²$6fW2"Â$Ö÷&æ–ær"Â%vÆ¶&ÆR%ÒÀ¢ÒÀ¢°¢–C¢&F–æ–ær"À¢Æ&VÃ¢$F–æ–ær"À¢f–ÇFW#¢$F–æ–ær"À¢FW67&—F–öã¢%&–÷&—F—¦W2&W7FW&çG2ÂF–ææW"7÷G2ÂæBÆ6W2v÷'F‚Æææ–ær&÷VæB&Vf÷&R÷"gFW"WfVçG2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$F–æ–ær"ò%6†÷v–æræ÷r"¢%W6VgVÂæ÷r"À¢ÖWF¢²%&W7FW&çG2"Â$F–ææW""Â%Æç2%ÒÀ¢ÒÀ¢°¢–C¢&†’Ö†÷W""À¢Æ&VÃ¢$†’†÷W""À¢f–ÇFW#¢$†’†÷W""À¢FW67&—F–öã¢$f–æG2G&–æ²7V6–Ç2ÂgFW"×v÷&²7F÷2ÂæB&W6–FVçBÖg&–VæFÇ’fÇVRæV&'’â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$†’†÷W""ò%6†÷v–æræ÷r"¢%Föæ–v‡B"À¢ÖWF¢²$gFW"v÷&²"Â$G&–æ·2"Â%fÇVR%ÒÀ¢ÒÀ¢°¢–C¢&WfVçG2"À¢Æ&VÃ¢$WfVçG2"À¢f–ÇFW#¢$WfVçG2"À¢FW67&—F–öã¢%6†÷w2Æ—fR×W6–2Â6—f–2ÖöÖVçG2Â7÷'G2Â&·2ÂæBF†–æw2†Væ–ær6ööââ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$WfVçG2"ò%6†÷v–æræ÷r"¢$7F—fR"À¢ÖWF¢²%FöF’"Â%F†—2vVV²"Â%%5e%ÒÀ¢ÒÀ¢°¢–C¢'W&·2"À¢Æ&VÃ¢%W&·2"À¢f–ÇFW#¢%W&·2"À¢FW67&—F–öã¢%7W&f6W2&W6–FVçB&VæVf—G2æB6&BÖöÖVçG2F–VBFò'F–6—F–ærÆ6W2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ%W&·2"ò%6†÷v–æræ÷r"¢%&W6–FVçBfÇVR"À¢ÖWF¢²$öffW'2"Â$6&B"Â$æV&'’%ÒÀ¢ÒÀ¢°¢–C¢&†÷FVÇ2"À¢Æ&VÃ¢$†÷FVÇ2"À¢f–ÇFW#¢$†÷FVÇ2"À¢FW67&—F–öã¢%6†÷w2†÷FVÇ2ÂÆö&'’ÖöÖVçG2ÂwVW7BÖg&–VæFÇ’Æ6W2ÂæB7F–6F–öâ6öçFW‡Bâ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$†÷FVÇ2"ò%6†÷v–æræ÷r"¢$wVW7BÆ–W""À¢ÖWF¢²$†÷FVÇ2"Â$wVW7G2"Â$6öæ6–W&vR%ÒÀ¢ÒÀ¢°¢–C¢'&÷W'F–W2"À¢Æ&VÃ¢%&÷W'F–W2"À¢f–ÇFW#¢%&÷W'F–W2"À¢FW67&—F–öã¢%6†÷w2&W6–FVçF–Â'V–ÆF–æw2ÂÆ—7F–æw2ÂæBæV&'’Æ–fW7G–ÆR6öçFW‡Bâ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ%&÷W'F–W2"ò%6†÷v–æræ÷r"¢$Æ—f–ær†W&R"À¢ÖWF¢²$'V–ÆF–æw2"Â$Æ—7F–æw2"Â$F—7G&–7G2%ÒÀ¢ÒÀ¢°¢–C¢&ÆVvVæG2"À¢Æ&VÃ¢$ÆVvVæG2"À¢f–ÇFW#¢$ÆVvVæG2"À¢FW67&—F–öã¢$†–v†Æ–v‡G2ÆVvVæG2&VÂW7FFRÆ—7F–æw2Â'V–ÆF–æw2ÂæBF÷vçF÷vâÆ—f–ær6öçFW‡Bâ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$ÆVvVæG2"ò%6†÷v–æræ÷r"¢%&VÂW7FFR"À¢ÖWF¢²$Æ—7F–æw2"Â$'V–ÆF–æw2"Â%F÷W'2%ÒÀ¢ÒÀ¢°¢–C¢&'G2"À¢Æ&VÃ¢$'G2"À¢f–ÇFW#¢$'G2b7VÇGW&R"À¢FW67&—F–öã¢$'&–æw2f÷'v&BvÆÆW&–W2ÂV&Æ–2'BÂ7VÇGW&R7F÷2ÂæBF—7G&–7B7F÷&–W2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$'G2b7VÇGW&R"ò%6†÷v–æræ÷r"¢$7VÇGW&R"À¢ÖWF¢²$'B"Â%7F÷&–W2"Â%vÆ·2%ÒÀ¢ÒÀ¢°¢–C¢'&WF–Â"À¢Æ&VÃ¢%&WF–Â"À¢f–ÇFW#¢%&WF–Â"À¢FW67&—F–öã¢%6†÷w26†÷2Â'&æG2ÂW'&æG2ÂæBÆ6W2v÷'F‚÷Væ–ærv†–ÆRvÆ¶–ærF÷vçF÷vââ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ%&WF–Â"ò%6†÷v–æræ÷r"¢%6†÷–ær"À¢ÖWF¢²%7F÷&W2"Â$'&æG2"Â$W'&æG2%ÒÀ¢ÒÀ¢°¢–C¢&f—FæW72"À¢Æ&VÃ¢$f—FæW72"À¢f–ÇFW#¢$f—FæW72"À¢FW67&—F–öã¢%&–÷&—F—¦W2w–×2ÂvVÆÆæW72'FæW'2ÂG&–Â66W72ÂæB7F—fRF÷vçF÷vâ&÷WF–æW2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$f—FæW72"ò%6†÷v–æræ÷r"¢$7F—fR"À¢ÖWF¢²%vVÆÆæW72"Â$Ö÷fVÖVçB"Â%G&–Â%ÒÀ¢ÒÀ¢°¢–C¢'6W'f–6W2"À¢Æ&VÃ¢%6W'f–6W2"À¢f–ÇFW#¢%6W'f–6W2"À¢FW67&—F–öã¢%6†÷w2W6VgVÂÆö6Â6W'f–6W2ÂWfW'–F’W'&æG2ÂæB&7F–6ÂF÷vçF÷vâ&W6÷W&6W2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ%6W'f–6W2"ò%6†÷v–æræ÷r"¢%W6VgVÂ"À¢ÖWF¢²$W'&æG2"Â$Æö6Â"Â%7W÷'B%ÒÀ¢ÒÀ¢°¢–C¢'&¶–ær"À¢Æ&VÃ¢%&¶–ær"À¢f–ÇFW#¢%&¶–ær"À¢FW67&—F–öã¢$†VÇ26ö×&Rv&vW2Â'&—fÂ÷F–öç2ÂæBÆ6W2Fò&²&Vf÷&RÆââ"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ%&¶–ær"ò%6†÷v–æræ÷r"¢$'&—fÂ"À¢ÖWF¢²$v&vW2"Â$'&—fÂ"Â%&÷WFW2%ÒÀ¢ÒÀ¢°¢–C¢&6—f–2"À¢Æ&VÃ¢$6—f–2"À¢f–ÇFW#¢$6—f–2"À¢FW67&—F–öã¢%6†÷w2&·2ÂV&Æ–276W2ÂF—7G&–7B&öw&×2Â6—f–27F÷2ÂæB6öÖ×Væ—G’&W6÷W&6W2â"À¢7FGW3¢7F—fTf–ÇFW"ÓÓÒ$6—f–2"ò%6†÷v–æræ÷r"¢%V&Æ–2"À¢ÖWF¢²%&·2"Â%V&Æ–2"Â$F—7G&–7B%ÒÀ¢ÒÀ¢Ó°¢6öç7B'FæW$ÖævT—FV×2Ò°¢°¢–C¢'&öf–ÆR"À¢Æ&VÃ¢%&öf–ÆR"À¢F—FÆS¢%&öf–ÆR"À¢FW67&—F–öã¢$6öçG&öÂF†RæÖRÂ7F÷'’Â6öçF7BFWF–Ç2ÂæBV&Æ–2–FVçF—G’&W6–FVçG26VRf—'7Bâ"À¢7FGW3¢%V&Æ—6†VB"À¢ÖWF¢²$–FVçF—G’"Â$6öçF7B"Â%7F÷'’%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷Vâ&öf–ÆR"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76R÷&öf–ÆR"ÒÀ¢ÒÀ¢°¢–C¢&Ö×&W6Væ6R"À¢Æ&VÃ¢$Ö&W6Væ6R"À¢F—FÆS¢$Ö&W6Væ6R"À¢FW67&—F–öã¢$6öçG&öÂ6FVv÷'’ÂF—7G&–7BÂ–ÖvW2ÂÖf—6–&–Æ—G’ÂæBF†Rf—'7B–×&W76–öâ&W6–FVçG26VRâ"À¢7FGW3¢$Ö6öææV7FVB"À¢ÖWF¢²$6FVv÷'’"Â$F—7G&–7B"Â$–ÖvW2%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢%WFFRÖ&W6Væ6R"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RöÖ"ÒÀ¢ÒÀ¢°¢–C¢&6×–vç2"À¢Æ&VÃ¢$6×–vç2"À¢F—FÆS¢$6×–vç2"À¢FW67&—F–öã¢$7&VFRæBÖævRÆö6ÂÖöÖVçG2F†B6âV"öâF†RÖÂ&W6–FVçBfVVBÂ"F‡2Â÷"'FæW"&W÷'G2â"À¢7FGW3¢%&V6öÖÖVæFVB"À¢ÖWF¢²%&V6‚"Â%F–Ö–ær"Â%&W÷'F–ær%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷Vâ6×–vç2"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76Rö6×–vç2"ÒÀ¢6V6öæF'”7F–öç3¢·²Æ&VÃ¢$7&VFR6×–vâ"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76Rö6×–vç3ö–çFVçCÖæWr"ÕÒÀ¢ÒÀ¢°¢–C¢&öffW'2"À¢Æ&VÃ¢$öffW'2"À¢F—FÆS¢$öffW'2"À¢FW67&—F–öã¢$v—fRæV&'’V÷ÆRöæR6ÆV"&V6öâFò6fRÂ66âÂ&WVW7BF—&V7F–öç2Â÷"f—6—Bâ"À¢7FGW3¢$G&gBæW‡B"À¢ÖWF¢²%W&·2"Â%&VFV×F–öç2"Â%f—6—G2%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷VâöffW'2"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RööffW'2"ÒÀ¢6V6öæF'”7F–öç3¢·²Æ&VÃ¢$7&VFRöffW""Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RööffW'3ö–çFVçCÖæWr"ÕÒÀ¢ÒÀ¢°¢–C¢&WfVçG2"À¢Æ&VÃ¢$WfVçG2"À¢F—FÆS¢$WfVçG2"À¢FW67&—F–öã¢%&öÖ÷FRÖöÖVçG2V÷ÆR6âGFVæBæB6öææV7B%5e7F—f—G’&6²FòÖ&W÷'F–ærâ"À¢7FGW3¢$f–Æ&ÆR"À¢ÖWF¢²%%5e"Â$6ÆVæF""Â$æV&'’%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷VâWfVçG2"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RöWfVçG2"ÒÀ¢6V6öæF'”7F–öç3¢·²Æ&VÃ¢%&Wf–WrWfVçG2"Â7F–öã¢''FæW"ÖÖÖf–ÇFW""Âf–ÇFW#¢$WfVçG2"ÕÒÀ¢ÒÀ¢°¢–C¢'""À¢Æ&VÃ¢%""À¢F—FÆS¢%""À¢FW67&—F–öã¢$6öææV7B&–çFVBÖFW&–Ç2ÂÆö&'’ÖöÖVçG2Â66ç2ÂæB&W6–FVçB6&B–çFW&7F–öç2Fò&W÷'F–ærâ"À¢7FGW3¢$6öææV7FVB"À¢ÖWF¢²%66ç2"Â%&–çB"Â$6&B%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷Vâ"ÖFW&–Ç2"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RöÖVF–÷6V7F–öã×""ÒÀ¢ÒÀ¢°¢–C¢&VF–Væ6R"À¢Æ&VÃ¢$VF–Væ6R"À¢F—FÆS¢$VF–Væ6R"À¢FW67&—F–öã¢%VæFW'7FæBv†ò6fW2Â66ç2Â÷Vç2F—&V7F–öç2ÂæB&WGW&ç2g&öÒæV&'’Ö7F—f—G’â"À¢7FGW3¢%6–væÇ2Æ—fR"À¢ÖWF¢²%&W6–FVçG2"Â%f—6—F÷'2"Â%6VvÖVçG2%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷VâVF–Væ6R"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RöVF–Væ6R"ÒÀ¢ÒÀ¢°¢–C¢&ÖVF–"À¢Æ&VÃ¢$ÖVF–"À¢F—FÆS¢$ÖVF–"À¢FW67&—F–öã¢$¶VWF†R–ÖvW2æB'&æB76WG2F†BV"7&÷72Ö6&G2ÂæVÇ2ÂæB"ÖöÖVçG27W'&VçBâ"À¢7FGW3¢$æVVG2&Wf–Wr"À¢ÖWF¢²%†÷F÷2"Â$Æövò"Â$6&G2%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷VâÖVF–"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76RöÖVF–"ÒÀ¢ÒÀ¢°¢–C¢'&W÷'G2"À¢Æ&VÃ¢%&W÷'G2"À¢F—FÆS¢%&W÷'G2"À¢FW67&—F–öã¢%&VB6fW2Â66ç2ÂF—&V7F–öç2Â%5e2ÂæBföÆÆ÷r×W7F—f—G’–âöæR÷W&F–ærf–Wrâ"À¢7FGW3¢$Æ—fR"À¢ÖWF¢²%6fW2"Â%66ç2"Â$F—&V7F–öç2%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢%f–Wr&W÷'G2"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76R÷&W÷'G2"ÒÀ¢ÒÀ¢°¢–C¢&ÖVÖ&W'6†—"À¢Æ&VÃ¢$ÖVÖ&W'6†—"À¢F—FÆS¢$ÖVÖ&W'6†—"À¢FW67&—F–öã¢%&Wf–WrÆâ66W72Â&–ÆÆ–ærÂFBÖöç2ÂæBF†RFööÇ2–æ6ÇVFVBv—F‚–÷W"7W'&VçBÖVÖ&W'6†—â"À¢7FGW3¢$7F—fR"À¢ÖWF¢²%Æâ"Â$&–ÆÆ–ær"Â$66W72%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷VâÖVÖ&W'6†—"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76Rö&–ÆÆ–ær"ÒÀ¢ÒÀ¢°¢–C¢&66÷VçB"À¢Æ&VÃ¢$66÷VçB"À¢F—FÆS¢$66÷VçB"À¢FW67&—F–öã¢%&Wf–WrFVÒ66W72Â66÷VçBFWF–Ç2Âæ÷F–f–6F–öç2ÂæBv÷&·76R&VfW&Væ6W2â"À¢7FGW3¢%FVÒ66W72"À¢ÖWF¢²%FVÒ"Â%6WGF–æw2"Â$66W72%ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢$÷Vâ66÷VçB"Â7F–öã¢&÷VâÖ‡&Vb"Â‡&Vc¢"÷'FæW"×v÷&·76R÷&öf–ÆS÷6V7F–öãÖ66÷VçB"ÒÀ¢ÒÀ¢Ó°¢6öç7BÖG&—„—FV×2Ò—5'FæW$–æfð¢ò'FæW$ÖævT—FV×2æÖ‚†—FVÒ’Óâ‡°¢ââæ—FVÒÀ¢W–V'&÷s¢%v÷&·76R&V"À¢6V6öæF'”7F–öç3¢°¢âââ†—FVÒç6V6öæF'”7F–öç2ÇÂµÒ’À¢²Æ&VÃ¢%&Wf–Wr&W6–FVçBf–Wr"Â7F–öã¢'&Wf–Wr"ÒÀ¢ÒÀ¢Ò’¢¢f—6–&–Æ—G”6FVv÷&–W2æÖ‚†—FVÒ’Óâ°¢6öç7B&VÆFVD—FV×2ÒÖ¶Uf—6–&–Æ—G•&VÆFVD—FV×2†—FVÒæf–ÇFW"“°¢&WGW&â°¢ââæ—FVÒÀ¢W–V'&÷s¢$Ö&–÷&—G’"À¢F—FÆS¢—FVÒæÆ&VÂÀ¢ÖWF¢°¢ââæ—FVÒæÖWFÀ¢&VÆFVD—FV×2æÆVæwF‚òG·&VÆFVD—FV×2æÆVæwF‡ÒW†×ÆW6¢$F÷vçF÷vâW7F–â"À¢ÒÀ¢&–Ö'”7F–öã¢²Æ&VÃ¢7F—fTf–ÇFW"ÓÓÒ—FVÒæf–ÇFW"ò$†–FR"¢%6†÷röâÖ"Â7F–öã¢7F—fTf–ÇFW"ÓÓÒ—FVÒæf–ÇFW"ò&†–FRÖf–ÇFW""¢'6†÷rÖf–ÇFW""Âf–ÇFW#¢—FVÒæf–ÇFW"ÒÀ¢6V6öæF'”7F–öç3¢°¢²Æ&VÃ¢$6²F†RÖ"Â7F–öã¢&6²"Â&ö×C¢G¶—FVÒæÆ&VÇÒæV&'–ÒÀ¢²Æ&VÃ¢%6WB2FVfVÇB"Â7F–öã¢'6†÷rÖf–ÇFW""Âf–ÇFW#¢—FVÒæf–ÇFW"ÒÀ¢ÒÀ¢&VÆFVD—FV×2À¢Ó°¢Ò“°¢6öç7B†æFÆT–æfôÖG&—„7F–öâÒ†7F–öâÂ—FVÒ’Óâ°¢–b†7F–öâæ7F–öâÓÓÒ&6²"’°¢fö–BÇ•&ö×B†7F–öâç&ö×BÇÂG¶—FVÒçF—FÆWÒæV&'–“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ'&Wf–Wr"’°¢÷Vå'FæW$Ö‚$ÆÂ"“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ'6†÷rÖf–ÇFW""bb7F–öâæf–ÇFW"’°¢÷Vå&W6–FVçDÆ–W"†7F–öâæf–ÇFW"“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ&†–FRÖf–ÇFW""’°¢÷Vå&W6–FVçDÆ–W"‚$ÆÂ"“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ''FæW"ÖÖÖf–ÇFW""bb7F–öâæf–ÇFW"’°¢÷Vå'FæW$Ö†7F–öâæf–ÇFW"“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ&÷VâÖ‡&Vb"bb7F–öâæ‡&Vb’°¢æf–vFR†7F–öâæ‡&Vb“°¢&WGW&ã°¢Ð¢–b†7F–öâæ7F–öâÓÓÒ&÷Vâ×&VÆFVB"bb7F–öâç&VÆFVD–B’°¢6öç7B&VÆFVEÆ6RÒÆ6W2æf–æB‚†6æF–FFR’Óâ6æF–FFRæ–BÓÓÒ7F–öâç&VÆFVD–B“°¢–b‡&VÆFVEÆ6R’6VÆV7EÆ6R‡&VÆFVEÆ6R“°¢Ð¢Ó°¢6öç7B–æfôÖG&—…6VÆV7FVD–BÒ—5'FæW$–æfð¢ò'&öf–ÆR ¢¢f—6–&–Æ—G”6FVv÷&–W2æf–æB‚†—FVÒ’Óâ—FVÒæf–ÇFW"ÓÓÒ7F—fTf–ÇFW"“òæ–BÇÂ&6öffVR#° ¢&WGW&â€¢ÆF—b6Æ74æÖS×¶G×F'2Ö6öçFVçBG×'FæW"×&VF&ÆR×æVÂG×'FæW"Ö–æfò×æVÂG×6†&VBÖ–æfò×æVÂG¶—5'FæW$–æfòò&—2×'FæW""¢&—2×&W6–FVçB'ÖÓà¢ÆF—b6Æ74æÖSÒ&G×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×&VF&ÆRÖ†W&òGÖ–æfòÖwV–FRÖ†W&ò#à¢ÆF—cà¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ç¶6öçFVçBæW–V'&÷wÓÂ÷à¢Æƒ#ç¶6öçFVçBæ†VFÆ–æWÓÂöƒ#à¢Çç¶6öçFVçBæ6÷—ÓÂ÷à¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖ–æfòÖwV–FRÖÖVF–"&–Ö†–FFVãÒ'G'VR#à¢Ä–æfò6Æ74æÖSÒ&‚ÓRrÓR"óà¢Ç7ãç¶—5'FæW$–æfòò%'FæW"v÷&·76R+r7F—fR"¢%&W6–FVçBÆö6ÂwV–FR'ÓÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖ–æfòÖwV–FRÖ7F–öç2#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&–Ö'’Ö7F–öâ"öä6Æ–6³×¶6öçFVçBç&–Ö'•³×Óç¶6öçFVçBç&–Ö'•³×ÓÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×6V6öæF'’Ö7F–öâ"öä6Æ–6³×¶6öçFVçBç6V6öæF'•³×Óç¶6öçFVçBç6V6öæF'•³×ÓÂö'WGFöãà¢ÂöF—cà¢Â÷6V7F–öãà ¢Ä–çFW&7F—fTÖG&—€¢W–V'&÷s×¶—5'FæW$–æfòò%v÷&·76RFööÇ2"¢$æV&'’f—6–&–Æ—G’'Ð¢F—FÆS×¶—5'FæW$–æfòò$ÖævRF†R'G2öb–÷W"F÷vçF÷vâ&W6Væ6R&W6–FVçG26â6VRâ"¢$6†ö÷6Rv†BF†RÖ&–÷&—F—¦W2â'Ð¢FW67&—F–öã×¶—5'FæW$–æfòò%6VÆV7Bv÷&·76R&VFò6VRv†B—B6öçG&öÇ2Âv†B—27W'&VçBÂæBF†RæW‡BW6VgVÂ7F–öââ"¢%–6²6FVv÷'’Fò6VRv†BV'2Âv‡’—B—2W6VgVÂÂæBv†BFò÷VâæW‡Bâ'Ð¢—FV×3×¶ÖG&—„—FV×7Ð¢–æ—F–Å6VÆV7FVD–C×¶–æfôÖG&—…6VÆV7FVD–GÐ¢öä7F–öã×¶†æFÆT–æfôÖG&—„7F–öçÐ¢6Æ74æÖS×¶GÖ–æfòÖ–çFW&7F—fRÖÖG&—‚G¶—5'FæW$–æfòò&G×'FæW"ÖÖævRÖÖG&—‚"¢&G×f—6–&–Æ—G’ÖÖG&—‚'ÖÐ¢óà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"Ö–æfò×7FW2"&–ÖÆ&VÃÒ$vWGF–ær7F'FVB#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ävWGF–ær7F'FVCÂ÷à¢¶6öçFVçBç7FW2æÖ‚‡7FWÂ–æFW‚’Óâ€¢ÆF—b¶W“×·7FWÓà¢Ç7ãçµ7G&–ær†–æFW‚²’çE7F'Bƒ"Â#"—ÓÂ÷7ãà¢Çç·7FWÓÂ÷à¢ÂöF—cà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÆ—7BGÖ–æfòÖwV–FRÖÆ—7B"&–ÖÆ&VÃÒ$†÷r—Bv÷&·2#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä†÷r—Bv÷&·3Â÷à¢¶6öçFVçBæ†÷ræÖ‚…·F—FÆRÂ6÷•Ò’Óâ€¢Æ'F–6ÆR¶W“×·F—FÆWÒ6Æ74æÖSÒ&G×F"×&÷rG×'FæW"ÖfVVB×&÷r#à¢Ç7â6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÖ–â#à¢Ç7â6Æ74æÖSÒ&G×F"×&÷rÖ–6öâ#ãÄ6ö×726Æ74æÖSÒ&‚ÓBrÓB"óãÂ÷7ãà¢Ç7ããÇ7G&öæsç·F—FÆWÓÂ÷7G&öæsãÇ6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃãÂ÷7ãà¢Â÷7ãà¢Âö'F–6ÆSà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ–æfòÖwV–FR×F—2"&–ÖÆ&VÃ×¶6öçFVçBçF—5F—FÆWÓà¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ç¶6öçFVçBçF—5F—FÆWÓÂ÷à¢ÆF—cà¢¶6öçFVçBçF—2æÖ‚‡F—’ÓâÇ7â¶W“×·F—Óç·F—ÓÂ÷7ãâ—Ð¢ÂöF—cà¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ–æfòÖwV–FRÖf"&–ÖÆ&VÃÒ$g&WVVçFÇ’6¶VBVW7F–öç2#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#äg&WVVçFÇ’6¶VBVW7F–öç3Â÷à¢¶6öçFVçBæfæÖ‚…·VW7F–öâÂç7vW%ÒÂ–æFW‚’Óâ€¢ÆFWF–Ç2¶W“×·VW7F–öçÒ÷Vã×¶–æFW‚ÓÓÒÓà¢Ç7VÖÖ'“ãÇ7ãç·VW7F–öçÓÂ÷7ããÄ6†Wg&öäF÷vâ&–Ö†–FFVãÒ'G'VR"óãÂ÷7VÖÖ'“à¢Çç¶ç7vW'ÓÂ÷à¢ÂöFWF–Ç3à¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W÷'BÖæW‡BÖ7F–öâGÖ–æfòÖwV–FRÖ†VÇ"&–ÖÆ&VÃÒ$æVVB†VÇ#à¢ÆF—cà¢Ç7ãäæVVB†VÇóÂ÷7ãà¢Ç7G&öæsç¶6öçFVçBæ†VÇ³×ÓÂ÷7G&öæsà¢Çç¶6öçFVçBæ†VÇ³×ÓÂ÷à¢ÂöF—cà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶6öçFVçBç6V6öæF'•³×Óä6öçF7B7W÷'CÂö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶6öçFVçBæ†VÇ³5×Óç¶6öçFVçBæ†VÇ³%×ÓÂö'WGFöãà¢Â÷6V7F–öãà ¢ÂöF—cà¢ÂöF—cà¢“°¢Ð ¢gVæ7F–öâ&VæFW$6—f–5æVÂ‚’°¢6öç7B6—f–5Æ6W2ÒÆ6W0¢æf–ÇFW"‚‡Æ6R’Óâ—46—f–4VçF—G’‡Æ6R’ÇÂ†—4WfVçDVçF—G’‡Æ6R’bbÆ6UFW‡B‡Æ6R’æ–æ6ÇVFW2‚&6—f–2"’’¢ç6÷'B‚†Â"’Óâ°¢6öç7B7F÷ÒvWDF7F÷g&öÕÆ6R†“°¢6öç7B%7F÷ÒvWDF7F÷g&öÕÆ6R†"“°¢–b†7F÷bb%7F÷’&WGW&âçVÖ&W"†7F÷ç7F÷çVÖ&W"ÇÂ’ÒçVÖ&W"†%7F÷ç7F÷çVÖ&W"ÇÂ“°¢–b†7F÷’&WGW&âÓ°¢–b†%7F÷’&WGW&â°¢&WGW&â7G&–ær†ææÖRÇÂ""’æÆö6ÆT6ö×&R…7G&–ær†"ææÖRÇÂ""’“°¢Ò“°¢6öç7BF7F÷6÷VçBÒ6—f–5Æ6W2æf–ÇFW"‚‡Æ6R’ÓâvWDF7F÷g&öÕÆ6R‡Æ6R’’æÆVæwFƒ°¢&WGW&â€¢ÆF—b6Æ74æÖSÒ&G×F'2Ö6öçFVçBG×'FæW"×&VF&ÆR×æVÂGÖ6—f–2×&VF&ÆR×æVÂ#à¢ÆF—b6Æ74æÖSÒ&G×F"×7F6²#à¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×&VF&ÆRÖ†W&ò#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä6—f–3Â÷à¢Æƒ#åV&Æ–2Æ6W2–âF†RÖãÂöƒ#à¢Çä'BvÆ²Â&·2ÂÆ¦2ÂG&–Æ†VG2ÂæB6—f–27F÷2v—F‚æV&'’6öçFW‡BãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"×7VÖÖ'’Öw&–B"&–ÖÆ&VÃÒ$6—f–27VÖÖ'’#à¢µ°¢²$'BvÆ²"ÂG¶F7F÷6÷VçBÇÂDõDõU%õ5Dõô4õTåGÒ7F÷6ÒÀ¢²%V&Æ–276W2"Â%&·2ÂÆ¦2ÂG&–Ç2%ÒÀ¢²$æW‡B"Â$÷VâW6VgVÂ–ç2%ÒÀ¢ÒæÖ‚…¶Æ&VÂÂfÇVUÒ’Óâ€¢Æ'F–6ÆR¶W“×¶Æ&VÇÒ6Æ74æÖSÒ&G×'FæW"×7VÖÖ'’Ö6&B#à¢Ç7ãç¶Æ&VÇÓÂ÷7ãà¢Ç7G&öæsç·fÇVWÓÂ÷7G&öæsà¢Âö'F–6ÆSà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÆ—7B"&–ÖÆ&VÃÒ$6—f–2÷÷'GVæ—G’#à¢µ°¢²$æV&'’7F—f—G’"Â%V&Æ–276W2æ6†÷"vÆ·2æBÆç2â"Â$÷VâFWF–Ç2%ÒÀ¢²%v‡’—BÖGFW'2"Â$6—f–2ÖöÖVçG2Ö¶R&÷WFW2V6–W"â"Â%f–Wr7F—f—G’%ÒÀ¢²$æW‡B"Â$'V–ÆBöæR&÷WFR&÷VæBV&Æ–2Æ6Râ"Â$÷Vâ–ç2%ÒÀ¢ÒæÖ‚…·F—FÆRÂ6÷’Â7F–öåÒ’Óâ€¢Æ'WGFöâ¶W“×·F—FÆWÒG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×F"×&÷rG×'FæW"ÖfVVB×&÷r"öä6Æ–6³×²‚’Óâ÷Vå'FæW%æVÂ‚'&W÷'G2"—Óà¢Ç7â6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÖ–â#à¢Ç7â6Æ74æÖSÒ&G×F"×&÷rÖ–6öâ#ãÄÆæFÖ&²6Æ74æÖSÒ&‚ÓBrÓB"óãÂ÷7ãà¢Ç7ããÇ7G&öæsç·F—FÆWÓÂ÷7G&öæsãÇ6ÖÆÃç¶6÷—ÓÂ÷6ÖÆÃãÂ÷7ãà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&G×F"×6–væÂ#ç¶7F–öçÓÂ÷7ãà¢Âö'WGFöãà¢’—Ð¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6×–vâ×æVÂ#à¢Ç6Æ74æÖSÒ&G×F"ÖW–V'&÷r#ä6—f–2–ç3Â÷à¢ÆF—b6Æ74æÖSÒ&G×'FæW"ÖfVVBÖÆ—7BGÖ†÷&—¦öçFÂÖVçF—G’×&–Â"&–ÖÆ&VÃÒ$6—f–2ÖVçF—F–W2#à¢¶6—f–5Æ6W2æÖ‚‡Æ6R’Óâ&VæFW$6ö×7DVçF—G•&÷r‡Æ6RÂ$÷Vâ"’—Ð¢ÂöF—cà¢Â÷6V7F–öãà¢ÂöF—cà¢ÂöF—cà¢“°¢Ð¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVD–B’&WGW&ã°¢–b‡6VÆV7FVB’&WGW&ã°¢–b‡6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçCòæVçF—G”–BÓÓÒ6VÆV7FVD–B’&WGW&ã°¢–b‚Æ6W2æÆVæwF‚bbÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2æÆVæwF‚’&WGW&ã°¢–b‡6VÆV7FVEÆ6T÷fW'&–FRbb&W6öÇfTÖVçF—G”Æ–2‡6VÆV7FVEÆ6T÷fW'&–FRæ–B’ÓÓÒ6VÆV7FVD–B’&WGW&ã°¢–b‚õâ‡&WV&Æ–2ÖW7F–çÆF×7F÷ÇvFW&Æö÷Ç&¶–ær’ö’çFW7B‡6VÆV7FVD–B’’&WGW&ã°¢–b‡W&Å7FFRæVçF—G”–Bbb²&–FÆR"Â&ÆöF–ær%Òæ–æ6ÇVFW2‡66÷VE&WVW7E7FGW2’’&WGW&ã°¢–b‚&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂÆ6W2’bb&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ‡6VÆV7FVD–BÂÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2’’°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""ÂW&´–C¢""Ò“°¢Ð¢ÒÂ¶ÇW‡W'•&W6Væ6TÆ—7F–æuÆ6W2ÂÆ6W2Â66÷VE&WVW7E7FGW2Â66÷VE&W7VÇE7FFRç&W7VÇD–G2Â6VÆV7FVBÂ6VÆV7FVD–BÂ6VÆV7FVEÆ6T÷fW'&–FRÂW&Å7FFUÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚VÇ6–æu–ä–B’&WGW&âVæFVf–æVC°¢6öç7BF–ÖV÷WD–BÒv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ6WEVÇ6–æu–ä–B‚""’Â#“°¢&WGW&â‚’Óâv–æF÷ræ6ÆV%F–ÖV÷WB‡F–ÖV÷WD–B“°¢ÒÂ·VÇ6–æu–ä–EÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVD–B’&WGW&ã°¢–b‡W&Å7FFRæÖöFRÓÓÒ''FæW""bbÔôäD•dUõ%DäU%õäTÅ2æ–æ6ÇVFW2‡W&Å7FFRçF"’’°¢6WD7F—fT&÷GFöÕF"‡W&Å7FFRçF"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢&WGW&ã°¢Ð¢–b‚W&Å7FFRçæVÅF"’6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢ÒÂ¶6öç6öÆT†47F—fUv÷&²Â6VÆV7FVD–BÂW&Å7FFRæÖöFRÂW&Å7FFRçæVÅF"ÂW&Å7FFRçF%Ò“° ¢W6TVffV7B‚‚’Óâ°¢–b‡6VÆV7FVD–BÇÂ6ÇW7FW$G&vW"ÇÂ7F—fU'FæW%æVÂÇÂW&Å7FFRçF"ÓÓÒ'72"ÇÂW&Å7FFRçF"ÓÓÒ&6×–vç2"’°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢Ð¢ÒÂ¶7F—fU'FæW%æVÂÂ6ÇW7FW$G&vW"Â6VÆV7FVD–BÂW&Å7FFRçF%Ò“° ¢W6TVffV7B‚‚’Óâ°¢6öç7B—46ÆVäÖf–WrÐ¢W&Å7FFRçF"ÓÓÒ&Ö"b`¢7F—fT&÷GFöÕF"ÓÓÒ&Ö"b`¢6VÆV7FVD–Bb`¢6ÇW7FW$G&vW"b`¢7F—fU'FæW%æVÂb`¢7F—fTf–ÇFW"ÓÒ$ÆVvVæG2"b`¢7F—fTf–ÇFW"ÓÒ$Æ—7F–æw2#°¢–b†—46ÆVäÖf–Wr’6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢ÒÂ¶7F—fT&÷GFöÕF"Â7F—fTf–ÇFW"Â7F—fU'FæW%æVÂÂ6ÇW7FW$G&vW"Â6VÆV7FVD–BÂW&Å7FFRçF%Ò“° ¢W6TVffV7B‚‚’Óâ°¢gVæ7F–öâöä¶W”F÷vâ†WfVçB’°¢–b†WfVçBæ¶W’ÓÓÒ$W66R"’°¢–b‚6öç6öÆT6öÆÆ6VBbb6VÆV7FVD–Bbb6ÇW7FW$G&vW"bb&÷WD÷Vâ’°¢–b‡W&Å7FFRæÖöFRÓÒ'&W6–FVçB"’°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’Óâ6V&6…&öÆÇW&Vbæ7W'&VçCòæfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ’Â“°¢Ð¢&WGW&ã°¢Ð¢6WE6VÆV7FVD–B‚""“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD&÷WD÷Vâ†fÇ6R“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""Ò“°¢Ð¢Ð¢v–æF÷ræFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Âöä¶W”F÷vâ“°¢&WGW&â‚’Óâv–æF÷rç&VÖ÷fTWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Âöä¶W”F÷vâ“°¢ÒÂ¶&÷WD÷VâÂ6ÇW7FW$G&vW"Â6öç6öÆT6öÆÆ6VBÂ6VÆV7FVD–BÂW&Å7FFUÒ“° ¢gVæ7F–öâ6VÆV7EÆ6R‡Æ6RÂ6VÆV7F–öâÒ·Ò’°¢–b‚6VÆV7FVD–BbbG—VöbFö7VÖVçBÓÒ'VæFVf–æVB"’G&vW%G&–vvW%&Vbæ7W'&VçBÒFö7VÖVçBæ7F—fTVÆVÖVçC°¢G&–vvW$†F–2‚“°¢6öç7B6æöæ–6Å6VÆV7FVD–BÒ&W6öÇfTÖVçF—G”Æ–2‡Æ6Ræ–B“°¢6öç7B—5&VçFÅ6VÆV7F–öâÒ—5&VçFÄVçF—G’‡Æ6R“°¢6öç7B—46FÆöu6VÆV7F–öâÒ&ööÆVâ‡6VÆV7F–öâæ6FÆöu&W7VÇB“°¢6öç7B—4Æ—7F–æu6VÆV7F–öâÒ—46FÆöu6VÆV7F–öâbb—5Væ—DÆWfVÄÆ—7F–æuÆ6R‡Æ6R“°¢6öç7BV&Æ–4Æ—7F–æt–BÒ—4Æ—7F–æu6VÆV7F–öâò&W6öÇfU&÷W'G”Æ—7F–æuW&Ä–B‡Æ6Ræ–B’¢"#°¢6öç7BæW‡DVçF—G”–BÒ6æöæ–6Å6VÆV7FVD–C°¢6öç7BæW‡EW&´–BÒ6VÆV7F–öâçW&´–BÇÂ"#°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB†fÇ6R“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WEVÇ6–æu–ä–B†æW‡DVçF—G”–B“°¢6VÆV7F–öäFF6WE&Vbæ7W'&VçBÒÖÆ6W3°¢6VÆV7F–öåG&ç6—F–öå&Vbæ7W'&VçBÒ²VçF—G”–C¢æW‡DVçF—G”–BÂÆ6RÓ°¢6WE6VÆV7FVEÆ6T÷fW'&–FR‡Æ6R“°¢6WE6VÆV7FVD–B†æW‡DVçF—G”–B“°¢&V6÷&DÖW6W$7F–öâ‚'6VÆV7E÷–â"Â°¢VçF—G”–C¢æW‡DVçF—G”–BÀ¢æÖS¢Æ6RææÖRÀ¢6FVv÷'“¢Æ6Ræ6FVv÷'’À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢f–ÇFW#¢7F—fTf–ÇFW"À¢Ò“°¢æf–vFTÖ¦÷W&æW’€¢—5&VçFÅ6VÆV7F–öà¢ò²Æ–W#¢'&VçFÇ2"Âf–ÇFW#¢%&VçFÇ2"ÂÆ—7F–æs¢Æ6Ræ–BÂVçF—G”–C¢æW‡DVçF—G”–BÂÆ—7F–æt–C¢""ÂW&´–C¢""Ð¢¢²F#¢&Ö"ÂVçF—G”–C¢æW‡DVçF—G”–BÂÆ—7F–æt–C¢V&Æ–4Æ—7F–æt–BÇÂ""ÂW&´–C¢æW‡EW&´–BÒÀ¢“°¢6öç7B&rÒÆ6Rç&rÇÂ·Ó°¢6öç7BG&6¶–æt6öçFW‡BÒ°¢–ä–C¢Æ6Ræ–BÀ¢6÷W&6S¢66÷VE&W7VÇE7FFRç6÷W&6RÇÂ&F—&V7B×6V&6‚"À¢FVæçD–C¢Æ6RçFVæçEö–BÇÂ&rçFVæçEö–BÇÂçVÆÂÀ¢v÷&·76T–C¢Æ6Rçv÷&·76Uö–BÇÂ&rçv÷&·76Uö–BÇÂçVÆÂÀ¢'FæW$–C¢Æ6Rç'FæW%ö–BÇÂ&rç'FæW%ö–BÇÂçVÆÂÀ¢&÷W'G”–C¢Æ6Rç&÷W'G•ö–BÇÂ&rç&÷W'G•ö–BÇÂçVÆÂÀ¢'V–ÆF–æt–C¢Æ6Ræ'V–ÆF–æuö–BÇÂ&ræ'V–ÆF–æuö–BÇÂçVÆÂÀ¢6×–vã¢Æ6Ræ6×–våö–BÇÂ&ræ6×–våö–BÇÂVæFVf–æVBÀ¢W&´–C¢Æ6RçW&µö–BÇÂ&rçW&µö–BÇÂçVÆÂÀ¢WfVçD–C¢Æ6RæWfVçEö–BÇÂ&ræWfVçEö–BÇÂçVÆÂÀ¢VW'”–C¢66÷VE&W7VÇE7FFRçVW'”–BÇÂVæFVf–æVBÀ¢6V&6…VW'“¢VffV7F—fU6V&6‚ÇÂVæFVf–æVBÀ¢–çFW'&WFVD–çFVçC¢66÷VE&W7VÇE7FFRæ–çFVçBÇÂVæFVf–æVBÀ¢&W7VÇE&æ³¢ÖF‚æÖ‚ƒÂ66÷VE&W7VÇE7FFRç&W7VÇD–G2æ–æFW„öb‡Æ6Ræ–B’’À¢Ó°¢G&6¶–ætWfVçG2æÖ&¶W$6Æ–6²†æW‡DVçF—G”–BÂv÷&¶fÆ÷tVçF—G•G—R‡Æ6R’ÂG&6¶–æt6öçFW‡B“°¢G&6¶–ætWfVçG2æG&vW$÷Vâ†æW‡DVçF—G”–BÂ²ââçG&6¶–æt6öçFW‡BÂVçF—G•G—S¢v÷&¶fÆ÷tVçF—G•G—R‡Æ6R’Ò“°¢Ð ¢gVæ7F–öâ6VÆV7D6FÆöu&W7VÇB‡&W7VÇB’°¢–b‡&W7VÇBç&÷WFR’°¢æf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B‡&W7VÇBç&÷WFRÂ&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚’’“°¢&WGW&ã°¢Ð¢–b‡&W7VÇBæ–BÓÓÒGVæÆ÷'FföÆ–ô‡V"æ–B’°¢6öç7B&×2ÒæWrU$Å6V&6…&×2†Æö6F–öâç6V&6‚“°¢&×2ç6WB‚'F""Â&Ö"“°¢&×2ç6WB‚&VçF—G”–B"ÂGVæÆ÷'FföÆ–ô‡V"æ–B“°¢æf–vFR†G¶Æö6F–öâçF†æÖWÓòG·&×2çFõ7G&–ær‚—Ö“°¢&WGW&ã°¢Ð¢6öç7BF&vWDVçF—G”–BÒ&W7VÇBæVçF—G”–BÇÂ&W7VÇBæÆ–æ¶VDVçF—G”–BÇÂ&W7VÇBæ–C°¢–b‡F&vWDVçF—G”–Bbb‡&W7VÇBæÖ&¶W$VÆ–v–&ÆRÇÂ&W7VÇBæÆ–æ¶VDVçF—G”–B’’°¢6öç7B6æöæ–6ÅF&vWD–BÒ&W6öÇfTÖVçF—G”Æ–2‡F&vWDVçF—G”–B“°¢6öç7B6FÆötVçF—G’Ò6FÆöu7FFSòæVçF—F–W4'”–Còå·&W7VÇBæ–EÒÇÂ&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ†6æöæ–6ÅF&vWD–BÂÆ6W2“°¢–b†6FÆötVçF—G’’°¢6öç7BW&´–BÒ&W7VÇBç&W7VÇEG—RÓÓÒ'W&²"ÇÂ†47F—fUW&´FF†6FÆötVçF—G’¢òvWD6æöæ–6Å&W6–FVçEW&´–B†6FÆötVçF—G’¢¢"#°¢6VÆV7EÆ6R†6FÆötVçF—G’Â²6FÆöu&W7VÇC¢G'VRÂW&´–BÒ“°¢&WGW&ã°¢Ð¢æf–vFTÖ¦÷W&æW’‡°¢F#¢&Ö"À¢VçF—G”–C¢6æöæ–6ÅF&vWD–BÀ¢Æ—7F–æt–C¢""À¢W&´–C¢&W7VÇBç&W7VÇEG—RÓÓÒ'W&²"ò&W7VÇBçW&´–BÇÂ&W7VÇBæ–B¢""À¢G&vW$6Æ÷6VC¢""À¢Ò“°¢&WGW&ã°¢Ð¢fö–BÇ•&ö×B‡&W7VÇBç&W7VÇEG—RÓÓÒ'W'6öâ"ÇÂ&W7VÇBç&W7VÇEG—RÓÓÒ&÷&væ—¦F–öâ"ò$ÆVvVæG2Æ—7F–æw2"¢&W7VÇBçF—FÆR“°¢Ð ¢gVæ7F–öâ÷Vä7F—fUW&´—FVÒ†—FVÒÂWfVçB’°¢6öç7BÆ—7BÒWfVçCòæ7W'&VçEF&vWCòæ6Æ÷6W7Còâ‚"æGÖ7F—fR×W&·2×6†VWB"“òçVW'•6VÆV7F÷#òâ‚%¶FFÖ7F—fR×W&·2×67&öÆÃÒwG'VRuÒ"“°¢W6…æVÅ7FFR‡°¢W&Ã¢G¶Æö6F–öâçF†æÖWÒG¶Æö6F–öâç6V&6‡ÖÀ¢G&vW%7FFS¢7F—fUW&·4G&vW%7FFRÀ¢67&öÆÅF÷¢Æ—7Còç67&öÆÅF÷ÇÂÀ¢fö7W4–C¢WfVçCòæ7W'&VçEF&vWCòæ–BÇÂ""À¢Ò“°¢6VÆV7EÆ6R†—FVÒçÆ6RÂ²W&´–C¢—FVÒçW&´–BÒ“°¢Ð ¢gVæ7F–öâ6Æ÷6T7F—fUW&·56†VWB‚’°¢6ÆV%æVÅ7F6²‚“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢æf–vFR†öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†7F—fTf–ÇFW"ÇÂ%W&·2"—ÖÂ²&WÆ6S¢G'VRÒ“°¢Ð ¢gVæ7F–öâ÷Vä7F—fUW&´—FVÒ†—FVÒÂWfVçB’°¢6öç7BÆ—7BÒWfVçCòæ7W'&VçEF&vWCòæ6Æ÷6W7Còâ‚"æGÖ7F—fR×W&·2×6†VWB"“òçVW'•6VÆV7F÷#òâ‚%¶FFÖ7F—fR×W&·2×67&öÆÃÒwG'VRuÒ"“°¢W6…æVÅ7FFR‡°¢W&Ã¢G¶Æö6F–öâçF†æÖWÒG¶Æö6F–öâç6V&6‡ÖÀ¢G&vW%7FFS¢7F—fUW&·4G&vW%7FFRÀ¢67&öÆÅF÷¢Æ—7Còç67&öÆÅF÷ÇÂÀ¢fö7W4–C¢WfVçCòæ7W'&VçEF&vWCòæ–BÇÂ""À¢Ò“°¢6VÆV7EÆ6R†—FVÒçÆ6RÂ²W&´–C¢—FVÒçW&´–BÒ“°¢Ð ¢gVæ7F–öâ6Æ÷6T7F—fUW&·56†VWB‚’°¢6ÆV%æVÅ7F6²‚“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢æf–vFR†öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†7F—fTf–ÇFW"ÇÂ%W&·2"—ÖÂ²&WÆ6S¢G'VRÒ“°¢Ð ¢W6TVffV7B‚‚’Óâ°¢v–æF÷råõöG÷VäÖ–âÒ†VçF—G”–B’Óâ°¢6öç7BÆ6RÒÆ6W2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒVçF—G”–B“°¢–b‡Æ6R’6VÆV7EÆ6R‡Æ6R“°¢Ó° ¢6öç7B†æFÆU–ä÷VâÒ†WfVçB’Óâ°¢–b†WfVçBçF&vWCòæ6Æ÷6W7Còâ‚"æGÖÖÖG&vW"×6†VÆÂÂæGÖFW7F–æF–öâÖG&vW"ÂæG×æVÂ×6†VÆÂ"’’&WGW&ã°¢6öç7B–âÒWfVçBçF&vWCòæ6Æ÷6W7Còâ‚"æGÖÖ×–å¶FFÖVçF—G’Ö–EÒÂæGÖÆ—fR×–å¶FFÖVçF—G’Ö–EÒ"“°¢–b‚–â’&WGW&ã°¢6öç7BVçF—G”–BÒ–âævWDGG&–'WFR‚&FFÖVçF—G’Ö–B"“°¢6öç7BÆ6RÒÆ6W2æf–æB‚†—FVÒ’Óâ—FVÒæ–BÓÓÒVçF—G”–B“°¢–b‚Æ6R’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢6VÆV7EÆ6R‡Æ6R“°¢Ó° ¢6öç7B†æFÆTÆVfÆWDÖ&¶W$÷VâÒ†WfVçB’Óâ°¢–b†WfVçBçF&vWCòæ6Æ÷6W7Còâ‚"æGÖÖÖG&vW"×6†VÆÂÂæGÖFW7F–æF–öâÖG&vW"ÂæG×æVÂ×6†VÆÂ"’’&WGW&ã°¢–b†WfVçBçF&vWCòæ6Æ÷6W7Còâ‚"æGÖÖ×–å¶FFÖVçF—G’Ö–EÒÂæGÖÆ—fR×–å¶FFÖVçF—G’Ö–EÒÂæGÖÆVfÆWBÖ6ÇW7FW""’’&WGW&ã°¢6öç7BÖ&¶W"ÒWfVçBçF&vWCòæ6Æ÷6W7Còâ‚"æÆVfÆWBÖÖ&¶W"Ö–6öâæGÖÆVfÆWB×–å·F—FÆUÒ"“°¢–b‚Ö&¶W"’&WGW&ã°¢6öç7BF—FÆRÒÖ&¶W"ævWDGG&–'WFR‚'F—FÆR"“°¢6öç7BÆ6RÒÆ6W2æf–æB‚†—FVÒ’Óâ—FVÒææÖRÓÓÒF—FÆRÇÂ—FVÒçF—FÆRÓÓÒF—FÆR“°¢–b‚Æ6R’&WGW&ã°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢6VÆV7EÆ6R‡Æ6R“°¢Ó° ¢6öç7B†æFÆU–ä¶W”F÷vâÒ†WfVçB’Óâ°¢–b†WfVçBæ¶W’ÓÒ$VçFW""bbWfVçBæ¶W’ÓÒ""’&WGW&ã°¢†æFÆU–ä÷Vâ†WfVçB“°¢†æFÆTÆVfÆWDÖ&¶W$÷Vâ†WfVçB“°¢Ó° ¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆU–ä÷VâÂG'VR“°¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆTÆVfÆWDÖ&¶W$÷VâÂG'VR“°¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†æFÆU–ä¶W”F÷vâÂG'VR“°¢&WGW&â‚’Óâ°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆU–ä÷VâÂG'VR“°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆTÆVfÆWDÖ&¶W$÷VâÂG'VR“°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†æFÆU–ä¶W”F÷vâÂG'VR“°¢–b‡v–æF÷råõöG÷VäÖ–â’FVÆWFRv–æF÷råõöG÷VäÖ–ã°¢Ó°¢ÒÂ·Æ6W2ÂW&Å7FFUÒ“° ¢gVæ7F–öâ6VÆV7DæV&W7DÆVvVæG4Æ—7F–ær‡Æ6R’°¢–b‚—4ÆVvVæG4ÖÆ6R‡Æ6R’’°¢6VÆV7EÆ6R‡Æ6R“°¢&WGW&ã°¢Ð ¢6öç7BæV&W7BÒf—6–&ÆTÆVvVæG5Æ6W0¢æf–ÇFW"‚†6æF–FFR’Óâ6æF–FFRæ–BÓÒÆ6Ræ–B¢æÖ‚†6æF–FFR’Óâ‡²6æF–FFRÂ66÷&S¢vWDÖF—7Fæ6U66÷&R‡Æ6RÂ6æF–FFR’Ò’¢ç6÷'B‚†Â"’Óâç66÷&RÒ"ç66÷&R•³Óòæ6æF–FFS° ¢6VÆV7EÆ6R†æV&W7BÇÂÆ6R“°¢Ð ¢gVæ7F–öâ&Vv–å6V&6„–çFVçEG&ç6—F–öâ†f–ÇFW"Â÷F–öç2Ò·Ò’°¢6öç7B6æöæ–6Äf–ÇFW"ÒvWD6æöæ–6Å6V&6„–çFVçDf–ÇFW"†f–ÇFW"“°¢6öç7BæW‡Df–ÇFW"Òd”ÅDU%2æ–æ6ÇVFW2†6æöæ–6Äf–ÇFW"’ò6æöæ–6Äf–ÇFW"¢$ÆÂ#°¢6öç7BæW‡EVW'’Ò÷F–öç2çVW'’ÇÂ"#°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WDæV–v†&÷&†ööG4÷Vâ†fÇ6R“°¢6WD–çFVÄ÷Vâ†fÇ6R“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WE6V&6‚†÷F–öç2æF—7Æ•VW'’óòæW‡EVW'’“°¢6WD7F—fTf–ÇFW"†æW‡Df–ÇFW"“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WE&W6–FVçE$ÖöFÂ†çVÆÂ“°¢6WEVÇ6–æu–ä–B‚""“°¢6WE&W7VÇG4W‡æFVB†fÇ6R“°¢6WE6V&6„&VF—'G’†fÇ6R“°¢6WEW6W$†4æf–vFVDÖ†fÇ6R“°¢6ÆV%66÷VDÖ&W7VÇG2‚“°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç&VÖ÷fT—FVÒ„Ôõd”Uuõ5Dõ$tUô´U’“°¢v–æF÷rç6W76–öå7F÷&vRç&VÖ÷fT—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’“°¢Ò6F6‚°¢òòÖf–Wr&W6WB—2&W7BÖVff÷'C²7FFR&W6WB&÷fR7F–ÆÂVæf÷&6W2–çFVçBW†6ÇW6—f—G’à¢Ð¢6öç7B6ÆV&VE&÷WFU7FFRÒ²6öÆÆV7F–öã¢""Â&÷WFT–C¢""Â&÷WFU7FFS¢""Â7F÷–C¢""Ó°¢W&Å7FFRçWFFR‡°¢ââæ6ÆV&VE&÷WFU7FFRÀ¢F#¢&Ö"À¢f–ÇFW#¢æW‡Df–ÇFW"À¢VW'“¢æW‡EVW'’À¢¢""À¢&ö×C¢""À¢–çFVçC¢÷F–öç2æ–çFVçBÇÂ""À¢F–ÖS¢÷F–öç2çF–ÖRÇÂ""À¢6öÆÆV7F–öã¢÷F–öç2æ6öÆÆV7F–öâÇÂ6ÆV&VE&÷WFU7FFRæ6öÆÆV7F–öâÀ¢6öÆÆV7F–öä–C¢""À¢&÷WFT–C¢÷F–öç2ç&÷WFT–BÇÂ÷F–öç2æ6öÆÆV7F–öâÇÂ6ÆV&VE&÷WFU7FFRç&÷WFT–BÀ¢&÷WFU7FFS¢÷F–öç2ç&÷WFU7FFRÇÂ6ÆV&VE&÷WFU7FFRç&÷WFU7FFRÀ¢7F÷–C¢÷F–öç2ç7F÷–BÇÂ6ÆV&VE&÷WFU7FFRç7F÷–BÀ¢Æ–W#¢÷F–öç2æÆ–W"ÇÂ""À¢F—7G&–7C¢÷F–öç2æF—7G&–7BÇÂ""À¢&F—W3¢÷F–öç2ç&F—W2ÇÂ""À¢VçF—G•G—S¢÷F–öç2æVçF—G•G—RÇÂ""À¢VçF—G”–C¢""À¢W&´–C¢""À¢WfVçD–C¢""À¢Æ—7F–æt–C¢""À¢Æ—7F–æs¢""À¢6×–vä–C¢""À¢G&vW$6Æ÷6VC¢""À¢Ò“°¢&WGW&âæW‡Df–ÇFW#°¢Ð ¢gVæ7F–öâ6WDf–ÇFW"†f–ÇFW"’°¢6öç7BæW‡Df–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†f–ÇFW"Â°¢Æ–W#¢f–ÇFW"ÓÓÒ%&VçFÇ2"ò'&VçFÇ2"¢""À¢Ò“°¢&V6÷&DÖW6W$7F–öâ‚&f–ÇFW""Â²f–ÇFW#¢æW‡Df–ÇFW"Ò“°¢Ð ¢gVæ7F–öâ÷Vä6öÆÆV7F–öå&÷WFR†6öÆÆV7F–öä–BÂF—7Æ•VW'’Ò""’°¢6öç7B6öÆÆV7F–öâÒvWDÖ6öÆÆV7F–öä'”–B†6öÆÆV7F–öä–B“°¢–b‚6öÆÆV7F–öâ’&WGW&ã°¢6öç7BæW‡Df–ÇFW"ÒvWD6öÆÆV7F–öäf–ÇFW"†6öÆÆV7F–öâæ–B’ÇÂ7F—fTf–ÇFW"ÇÂ$ÆÂ#°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â°¢VW'“¢F—7Æ•VW'’ÇÂ6öÆÆV7F–öâçF—FÆRÀ¢6öÆÆV7F–öã¢6öÆÆV7F–öâæ–BÀ¢&÷WFT–C¢6öÆÆV7F–öâæ–BÀ¢–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"ÂF—7Æ•VW'’ÇÂ6öÆÆV7F–öâçF—FÆR’À¢Ò“°¢–b†F—7Æ•VW'’’6WE6V&6‚†F—7Æ•VW'’“°¢&V6÷&DÖW6W$7F–öâ‚'&÷WFUö÷VæVB"Â°¢6öÆÆV7F–öã¢6öÆÆV7F–öâæ–BÀ¢F—FÆS¢6öÆÆV7F–öâçF—FÆRÀ¢7F÷6÷VçC¢6öÆÆV7F–öâç7F÷–G3òæÆVæwF‚ÇÂÀ¢Ò“°¢Ð ¢gVæ7F–öâW†—D6öÆÆV7F–öå&÷WFR‚’°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†7F—fTf–ÇFW"ÇÂ$ÆÂ"“°¢W&Å7FFRçWFFR‡²6öÆÆV7F–öã¢""Â&÷WFT–C¢""Â&÷WFS¢""Â&÷WFU7FFS¢""Â7F÷¢""Â7F÷–C¢""ÂVçF—G”–C¢""ÂG&vW$6Æ÷6VC¢""Ò“°¢Ð ¢gVæ7F–öâfö7W46öÆÆV7F–öå7F÷‡7F÷’°¢–b‚7F÷’&WGW&ã°¢&V6÷&DÖW6W$7F–öâ‚'&÷WFU÷7F÷÷6VÆV7FVB"Â°¢VçF—G”–C¢7F÷æ–BÀ¢æÖS¢7F÷ææÖRÀ¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢&÷WFU7F÷çVÖ&W#¢7F÷ç&÷WFU7F÷çVÖ&W"À¢Ò“°¢6WE6VÆV7FVD–B‡7F÷æ–B“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR‡7F÷“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢W&Å7FFRçWFFR‡²6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÂ&÷WFT–C¢W&Å7FFRæ6öÆÆV7F–öâÂ7F÷¢""Â7F÷–C¢7F÷æ–BÂVçF—G”–C¢7F÷æ–BÂG&vW$6Æ÷6VC¢'G'VR"Ò“°¢Ð ¢gVæ7F–öâ÷Vä6öÆÆV7F–öå7F÷‡7F÷’°¢–b‚7F÷’&WGW&ã°¢&V6÷&DÖW6W$7F–öâ‚'&÷WFU÷7F÷÷6VÆV7FVB"Â²VçF—G”–C¢7F÷æ–BÂ6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÂ&÷WFU7F÷çVÖ&W#¢7F÷ç&÷WFU7F÷çVÖ&W"Â÷VæVC¢G'VRÒ“°¢6VÆV7EÆ6R‡7F÷“°¢W&Å7FFRçWFFR‡²6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÂ&÷WFT–C¢W&Å7FFRæ6öÆÆV7F–öâÂ7F÷¢""Â7F÷–C¢7F÷æ–BÂVçF—G”–C¢7F÷æ–BÂG&vW$6Æ÷6VC¢""Ò“°¢Ð ¢gVæ7F–öâ7F'D6öÆÆV7F–öå&÷WFR‡7F÷’°¢–b‚7F÷’&WGW&ã°¢&V6÷&DÖW6W$7F–öâ‡W&Å7FFRç&÷WFU7FFRÓÓÒ&7F—fR"ò'&÷WFUö6öçF–çVVB"¢'&÷WFU÷7F'FVB"Â°¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢VçF—G”–C¢7F÷æ–BÀ¢&÷WFU7F÷çVÖ&W#¢7F÷ç&÷WFU7F÷çVÖ&W"À¢Ò“°¢6WE6VÆV7FVD–B‡7F÷æ–B“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR‡7F÷“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢W&Å7FFRçWFFR‡°¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢&÷WFT–C¢W&Å7FFRæ6öÆÆV7F–öâÀ¢&÷WFU7FFS¢&7F—fR"À¢7F÷¢""À¢7F÷–C¢7F÷æ–BÀ¢VçF—G”–C¢7F÷æ–BÀ¢G&vW$6Æ÷6VC¢'G'VR"À¢Ò“°¢Ð ¢gVæ7F–öâ6WDæV–v†&÷&†ööB†æV–v†&÷&†ööB’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDF—7G&–7B†æV–v†&÷&†ööB“°¢6WE6VÆV7FVD–B‚""“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢W&Å7FFRçWFFR‡²F—7G&–7C¢—4ÆÄæV–v†&÷&†ööE66÷R†æV–v†&÷&†ööB’ò""¢æV–v†&÷&†ööBÂVçF—G”–C¢""Ò“°¢Ð ¢gVæ7F–öâ6WE6V&6„f6WB†¶W’ÂfÇVR’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDÖç7vW"†çVÆÂ“°¢W&Å7FFRçWFFR‡²¶¶W•Ó¢fÇVRÂVçF—G”–C¢""Ò“°¢Ð ¢gVæ7F–öâ6ÆV%6V&6„f–ÇFW'2‚’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WE6V&6‚‚""“°¢6WDÖç7vW"†çVÆÂ“°¢6WD7F—fTf–ÇFW"‚$ÆÂ"“°¢6WDF—7G&–7B„ÄÅôäT”t„$õ$„ôôE2“°¢6WE&F—W2‚#RÖ–âvÆ²"“°¢W&Å7FFRçWFFR‡°¢F#¢W&Å7FFRçF"ÓÓÒ'72"ò'72"¢&Ö"À¢f–ÇFW#¢$ÆÂ"À¢VW'“¢""À¢¢""À¢&ö×C¢""À¢F—7G&–7C¢""À¢&F—W3¢""À¢F–ÖS¢""À¢–çFVçC¢""À¢VçF—G•G—S¢""À¢6öÆÆV7F–öã¢""À¢Æ–W#¢""À¢VçF—G”–C¢""À¢Æ—7F–æt–C¢""À¢Ò“°¢Ð ¢gVæ7F–öâ÷Vä6ÇW7FW$G&vW"†6ÇW7FW"’°¢6WE6VÆV7FVD–B‚""“°¢6WD6ÇW7FW$G&vW%7FFR‚&ÖVF—VÒ"“°¢6WD6ÇW7FW$G&vW"†6ÇW7FW"“°¢6WD6öç6öÆT6öÆÆ6VB‚6öç6öÆT†47F—fUv÷&²“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""Ò“°¢Ð ¢gVæ7F–öâFövvÆU6fVB‡Æ6R’°¢6öç7BæW‡E6fVBÒ6fVD–G2æ†2‡Æ6Ræ–B“°¢6öç7B7F–öâÒæW‡E6fVBò'6fR"¢'Vç6fR#°¢fö–BFövvÆU6fVDVçF—G’‡°¢VçF—G•G—S¢v÷&¶fÆ÷tVçF—G•G—R‡Æ6R’À¢VçF—G”–C¢Æ6Ræ–BÀ¢6fVDC¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢F—FÆS¢Æ6RææÖRÀ¢–ÖvUW&Ã¢Æ6Ræ–ÖvRÀ¢ÖWFFF¢²F—7G&–7C¢Æ6RæF—7G&–7BÇÂ""Â6÷W&6S¢'&W6–FVçE÷6fUö7F–öâ"ÒÀ¢ÒÂæW‡E6fVB’æ6F6‚‚†W'&÷"’Óâ°¢6öç6öÆRçv&â‚%6fVB—FVÒ6÷VÆBæ÷B&R&V6öæ6–ÆVB"ÂW'&÷"“°¢–b‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"’v–æF÷ræÆW'B†W'&÷#òæÖW76vRÇÂ$6÷VÆFâwB6fRâG'’v–ââ"“°¢Ò“°¢–b†æW‡E6fVB’°¢&V6÷&DÖW6W$7F–öâ‚'6fR"Â°¢VçF—G”–C¢Æ6Ræ–BÀ¢æÖS¢Æ6RææÖRÀ¢6FVv÷'“¢Æ6Ræ6FVv÷'’À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢Ò“°¢G&6¶–ætWfVçG2ç6fR‡Æ6Ræ–B“°¢&WGW&ã°¢Ð¢&V6÷&DÖW6W$7F–öâ‚'Vç6fR"Â°¢VçF—G”–C¢Æ6Ræ–BÀ¢æÖS¢Æ6RææÖRÀ¢6FVv÷'“¢Æ6Ræ6FVv÷'’À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢Ò“°¢G&6¶–ætWfVçG2çVç6fR‡Æ6Ræ–B“°¢Ð ¢gVæ7F–öâvWDÖç7vW$7F–öäÆ&VÂ†7F–öâ’°¢6öç7Bæ÷&ÖÆ—¦VBÒ7G&–ær†7F–öâÇÂ""’çFôÆ÷vW$66R‚“°¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&÷Vâ"’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&Ö"’’&WGW&â$÷VâæV&'’#°¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚'6fR"’’&WGW&â%6fR#°¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&6ö×&R"’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&7F—f—G’"’’&WGW&â$6ö×&R7F—f—G’#°¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚'vÆ²"’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&æV""’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&æW‡B"’’&WGW&â%f–Wr&W7VÇG2#°¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&F—&V7F–öâ"’’&WGW&â$F—&V7F–öç2#°¢&WGW&â7G&–ær†7F–öâÇÂ$÷Vâ"’ç&WÆ6R‚õæ6†V6µÇ2²ö’Â""“°¢Ð ¢gVæ7F–öâ†æFÆTÖç7vW$7F–öâ†7F–öâ’°¢6öç7Bæ÷&ÖÆ—¦VBÒ7G&–ær†7F–öâÇÂ""’çFôÆ÷vW$66R‚“°¢6öç7Bf—'7E–6²ÒÖç7vW#òç–6·3òå³ÒÇÂ6VÆV7FVBÇÂf—6–&ÆUÆ6W5³Ó° ¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚'f–Wr"’bbæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&WfVçB"’’°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚$WfVçG2"“°¢6WD7F—fT&÷GFöÕF"‚&WfVçG2"“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢&WGW&ã°¢Ð ¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚'6fR"’’°¢–b†f—'7E–6²’°¢FövvÆU6fVB†f—'7E–6²“°¢6VÆV7EÆ6R†f—'7E–6²“°¢Ð¢&WGW&ã°¢Ð ¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚'vÆ²"’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&æV""’ÇÂæ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&æW‡B"’’°¢6WD7F—fT&÷GFöÕF"‚&F—66÷fW""“°¢6WE&W7VÇG4W‡æFVB‡G'VR“°¢–b†f—'7E–6²’6VÆV7EÆ6R†f—'7E–6²“°¢&WGW&ã°¢Ð ¢–b†æ÷&ÖÆ—¦VBæ–æ6ÇVFW2‚&F—&V7F–öâ"’’°¢–b†f—'7E–6²bbG—Vöbv–æF÷rÓÒ'VæFVf–æVB"’°¢G&6¶–ætWfVçG2æF—&V7F–öç2†f—'7E–6²æ–B“°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB†f—'7E–6²Â&F—&V7F–öç2"Â&6µöÖöç7vW%ö7F–öâ"Â°¢f÷&Ó¢°¢–çFVçC¢&F—&V7F–öç2"À¢Æ&VÃ¢$6²F†RÖF—&V7F–öç2"À¢ÒÀ¢Ò’“°¢f—&Uv÷&¶fÆ÷r‚"ö’÷f—6—B"Â°¢&öf–ÆT–C¢vWEv÷&¶fÆ÷u&öf–ÆT–B‚’À¢fVçVT–C¢f—'7E–6²æ–BÀ¢6÷W&6S¢&F—&V7F–öç2"À¢Ò“°¢v–æF÷ræ÷Vâ†F—&V7F–öç5W&Â†f—'7E–6²’Â%ö&Ææ²"Â&æö÷VæW"Ææ÷&VfW'&W""“°¢Ð¢&WGW&ã°¢Ð ¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢–b†f—'7E–6²’6VÆV7EÆ6R†f—'7E–6²“°¢Ð ¢7–æ2gVæ7F–öâFövvÆU'7g‡Æ6R’°¢–b‚„'&’æ—4'&’†WfVçE'7g2’òWfVçE'7g2¢µÒ’ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒÆ6Ræ–B’’°¢&VÖ÷fTWfVçE'7g‡Æ6Ræ–B“°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡Æ6RÂ&6æ6VÅ÷'7g"Â&ÖöWfVçEöFWF–ÅöG&vW""Â°¢f÷&Ó¢°¢7FGW3¢&6æ6VÆÆVB"À¢'FæW$–C¢Æ6Rç'FæW$–BÇÂÆ6Rç&sòç'FæW$–BÇÂ""À¢v÷&·76T–C¢Æ6Rçv÷&·76T–BÇÂÆ6Rç&sòçv÷&·76T–BÇÂ""À¢WfVçD–C¢Æ6Ræ–BÀ¢6FVv÷'“¢&WfVçB"À¢–çFVçC¢&6æ6VÅ÷'7g"À¢Æ&VÃ¢$6æ6VÂWfVçB%5e"À¢ÒÀ¢Ò’“°¢&WGW&ã°¢Ð¢6öç7B–ÆöBÒ'V–ÆDÖ7F–öå–ÆöB‡Æ6RÂ''7g"Â&ÖöWfVçEöFWF–ÅöG&vW""Â°¢f÷&Ó¢°¢7FGW3¢''7gVB"À¢'FæW$–C¢Æ6Rç'FæW$–BÇÂÆ6Rç&sòç'FæW$–BÇÂ""À¢v÷&·76T–C¢Æ6Rçv÷&·76T–BÇÂÆ6Rç&sòçv÷&·76T–BÇÂ""À¢WfVçD–C¢Æ6Ræ–BÀ¢6FVv÷'“¢&WfVçB"À¢–çFVçC¢''7g"À¢Æ&VÃ¢$WfVçB%5e"À¢ÒÀ¢Ò“°¢G'’°¢v—B÷7Ev÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â–ÆöB“°¢Ò6F6‚†W'&÷"’°¢6öç6öÆRçv&â‚%%5e7F–öâf–ÆVB"ÂW'&÷"“°¢&WGW&ã°¢Ð¢6WE6fVD–G2‚†7W'&VçB’ÓâæWr6WB†7W'&VçB’æFB‡Æ6Ræ–B’“°¢FDWfVçE'7g€¢°¢–C¢Æ6Ræ–BÀ¢F—FÆS¢Æ6RææÖRÀ¢FFS¢Æ6RæFFRÇÂæWrFFR‚’À¢F–ÖS¢Æ6RçF–ÖRÇÂ%W6öÖ–ær"À¢fVçVS¢Æ6RæF—7G&–7BÇÂ$F÷vçF÷vâW7F–â"À¢6FVv÷'“¢Æ6Ræ6FVv÷'’ÇÂ$WfVçB"À¢vö–æs¢Æ6Rç&sòç'7gö6÷VçBÇÂÆ6Rç'7gö6÷VçBÇÂÀ¢–ÖvS¢Æ6Ræ–ÖvRÀ¢–ÖvTÇC¢G·Æ6RææÖWÒWfVçFÀ¢FW67&—F–öã¢Æ6RæFW67&—F–öâÇÂÆ6Rç&sòç7VÖÖ'’ÇÂ$F÷vçF÷vâW&·2WfVçB&W6–FVçG26â6fRÂ%5eFòÂæBf–æBöâF†RÖâ"À¢ÒÀ¢&Ö ¢“°¢Ð ¢gVæ7F–öâvWE6Ö'E&W7VÇG2‡VW'’Âf–ÇFW$÷fW'&–FRÒ7F—fTf–ÇFW"’°¢6öç7BÒVW'’çG&–Ò‚’çFôÆ÷vW$66R‚“°¢6öç7B'6VBÒ'6TÖ–çFVçB‡VW'’ÂW&Å7FFRæÖöFR“°¢6öç7B–çFVçEFö¶Vç2ÒvWD–çFVçEFö¶Vç2‡“°¢6öç7B'6VD–çFVçG2Ò'&’æ—4'&’‡'6VBæ–çFVçG2’ò'6VBæ–çFVçG2¢µÓ°¢6öç7B—4'&öE'FæW$–çFVçBÒW&Å7FFRæÖöFRÓÓÒ''FæW""bb'6VD–çFVçG2ç6öÖR‚†–çFVçB’Óâ²&÷÷'GVæ—G’"Â'W&f÷&Öæ6R"Â&6×–vç2"Â&7F—fF–öâ"Â&–ç6–v‡G2"Â&VF–Væ6R%Òæ–æ6ÇVFW2†–çFVçB’“°¢6öç7B66÷VBÒÆ6W2æf–ÇFW"‚‡Æ6R’Óâ°¢–b‚ÖF6†W46öÆÆV7F–öâ‡Æ6RÂW&Å7FFRæ6öÆÆV7F–öâ’’&WGW&âfÇ6S°¢–b‚ÖF6†W4f–ÇFW"‡Æ6RÂf–ÇFW$÷fW'&–FRÂ6fVD–G2’’&WGW&âfÇ6S°¢–b‚—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’bbÆ6RæF—7G&–7BÓÒF—7G&–7B’&WGW&âfÇ6S°¢–b†—4–çFVçDöæÇ”f–ÇFW"†f–ÇFW$÷fW'&–FR’’&WGW&âG'VS°¢–b‚’&WGW&âG'VS°¢6öç7BFW‡BÒÆ6UFW‡B‡Æ6R“°¢&WGW&â€¢—4'&öE'FæW$–çFVçBÇÀ¢FW‡Bæ–æ6ÇVFW2‡’ÇÀ¢–çFVçEFö¶Vç2ç6öÖR‚‡Fö¶Vâ’ÓâFW‡Bæ–æ6ÇVFW2‡Fö¶Vâ’’ÇÀ¢'6VD–çFVçG2ç6öÖR‚†–çFVçB’ÓâFW‡Bæ–æ6ÇVFW2…7G&–ær†–çFVçB’çFôÆ÷vW$66R‚’ç&WÆ6R‚õòörÂ""’’’ÇÀ¢‡æ–æ6ÇVFW2‚'W&²"’bb†47F—fUW&´FF‡Æ6R’¢“°¢Ò“° ¢6öç7B&6U&W7VÇG2Ò66÷VBæÆVæwF‚ò66÷VB¢F—7Æ•Æ6W2æÆVæwF‚òF—7Æ•Æ6W2¢†47F—fT6FVv÷'•66÷RòµÒ¢Æ6W3°¢6öç7Bv÷fW&æVE&W7VÇG2ÒvWEf–Ww÷'D&÷VæFVDÖ&¶W%Æ6W2†&6U&W7VÇG2Â°¢7F—fTf–ÇFW#¢f–ÇFW$÷fW'&–FRÀ¢VW'’À¢f–Ww÷'D&÷VæG2À¢¦ööÓ¢Ö¦ööÒÀ¢6VÆV7FVD–BÀ¢ÖöFS¢W&Å7FFRæÖöFRÀ¢Ò’çÆ6W3°¢&WGW&â&æµÆ6W4f÷$–çFVçB†v÷fW&æVE&W7VÇG2ÂVW'’ÂW&Å7FFRæÖöFR“°¢Ð ¢gVæ7F–öâ÷Vå6V&6…&W7VÇG4Æ–W"‚’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WE6V&6„&VF—'G’†fÇ6R“°¢6WEW6W$†4æf–vFVDÖ†fÇ6R“°¢6ÆV%66÷VDÖ&W7VÇG2‚“°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç&VÖ÷fT—FVÒ„Ôõd”Uuõ5Dõ$tUô´U’“°¢v–æF÷rç6W76–öå7F÷&vRç&VÖ÷fT—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’“°¢Ò6F6‚°¢òò&W7BÖVff÷'B6ÖW&&W6WBf÷"F†RæW‡B&W7VÇB6WBà¢Ð¢Ð ¢7–æ2gVæ7F–öâ6´ÖvVçB‡VW'’ÂÆö6Å&W7VÇG2’°¢G'’°¢6öç7B'6VD–çFVçBÒ'6TÖ–çFVçB‡VW'’ÂW&Å7FFRæÖöFR“°¢6öç7B7F—fU6V6öæF'”f–ÇFW"Ò4T4ôäD%•õ4T$4…ô”åDTåEõ$”Âæf–æB‚†—FVÒ’Óâ—FVÒæf–ÇFW"ÓÓÒ7F—fTf–ÇFW"ÇÂ—FVÒæÆ&VÂÓÓÒ7F—fTf–ÇFW"“°¢6öç7B7F—fU&–Ö'”f–ÇFW"Ò$”Ô%•õ4T$4…ô”åDTåEõ$”Âæf–æB‚†—FVÒ’Óâ—FVÒæf–ÇFW"ÓÓÒ7F—fTf–ÇFW"ÇÂ—FVÒæÆ&VÂÓÓÒ7F—fTf–ÇFW"“°¢6öç7B7F—fTf–ÇFW$w&÷WÒ7F—fU6V6öæF'”f–ÇFW"ò'6V6öæF'’"¢7F—fU&–Ö'”f–ÇFW"ò'&–Ö'’"¢"#°¢6öç7B7W'&VçE6V&6„7F–öâÒ°¢G—S¢'6V&6‚"À¢VW'’À¢f–ÇFW#¢7F—fTf–ÇFW"À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢F–ÖW7F×¢æWrFFR‚’çFô•4õ7G&–ær‚’À¢Ó°¢6öç7B&V6VçE6V&6†W4f÷$vVçBÒ·VW'’Ââââ‡W6W$–çFW&7F–öä6öçFW‡Bç6V&6†W2ÇÂµÒ’æf–ÇFW"‚†—FVÒ’Óâ—FVÒÓÒVW'’•Òç6Æ–6RƒÂ‚“°¢6öç7B&V6VçD7F–öç4f÷$vVçBÒ¶7W'&VçE6V&6„7F–öâÂâââ‡W6W$–çFW&7F–öä6öçFW‡Bæ7F–öç2ÇÂµÒ•Òç6Æ–6RƒÂb“°¢6öç7B6fVDVçF—G•7VÖÖ&–W2ÒÆ6W0¢æf–ÇFW"‚‡Æ6R’Óâ6fVD–G2æ†2‡Æ6Ræ–B’¢ç6Æ–6RƒÂ#B¢æÖ‚‡Æ6R’Óâ‡²–C¢Æ6Ræ–BÂæÖS¢Æ6RææÖRÂ6FVv÷'“¢Æ6Ræ6FVv÷'’ÂF—7G&–7C¢Æ6RæF—7G&–7BÒ’“°¢6öç7B&V6VçFÇ•6VÆV7FVE7VÖÖ&–W2Ò‡W6W$–çFW&7F–öä6öçFW‡Bç6VÆV7FVE–ç2ÇÂµÒ¢æÖ‚†VçF—G”–B’ÓâÆ6W2æf–æB‚‡Æ6R’ÓâÆ6Ræ–BÓÓÒVçF—G”–B’¢æf–ÇFW"„&ööÆVâ¢ç6Æ–6RƒÂ"¢æÖ‚‡Æ6R’Óâ‡²–C¢Æ6Ræ–BÂæÖS¢Æ6RææÖRÂ6FVv÷'“¢Æ6Ræ6FVv÷'’ÂF—7G&–7C¢Æ6RæF—7G&–7BÒ’“°¢6öç7B&÷WFTæV&'”6öçFW‡BÒ7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚bb‡6VÆV7FVBÇÂÆö6Å&W7VÇG5³Ò¢òvWE&÷WFTv&TæV&'”6&G2‡6VÆV7FVBÇÂÆö6Å&W7VÇG5³ÒÂÆ6W2ÂW&Å7FFRæÖöFRÂ7F—fT6öÆÆV7F–öå&÷WFRÂ6fVD–G2Â‚¢æÖ‚†—FVÒ’Óâ‡°¢–C¢—FVÒçÆ6Ræ–BÀ¢æÖS¢—FVÒçÆ6RææÖRÀ¢ÖWF¢—FVÒæÖWFÀ¢6FVv÷'“¢—FVÒçÆ6Ræ6FVv÷'’À¢F—7G&–7C¢—FVÒçÆ6RæF—7G&–7BÀ¢Ò’¢¢µÓ°¢6öç7B–ÆöBÒv—BVW'”vVçB‡°¢ÖW76vS¢VW'’À¢VW'’À¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢ÖöFS¢W&Å7FFRæÖöFRÀ¢–çFVçC¢'6VD–çFVçBæ–çFVçG5³ÒÇÂ&6µöÖ"À¢F—7G&–7C¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7BÀ¢Æö6F–öã¢°¢Æ&VÃ¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7BÀ¢6ö÷&F–æFW3¢²ÆC¢U5D”åô4TåDU%³ÒÂÆæs¢U5D”åô4TåDU%³ÒÒÀ¢ÒÀ¢f–ÇFW#¢7F—fTf–ÇFW"À¢7F—fTf–ÇFW"À¢7F—fTÆ–W#¢W&Å7FFRæÆ–W"À¢7F—fT6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢7F—fTVçF—G“¢6VÆV7FVD–BÀ¢7F—fU&÷WFS¢7F—fU&÷WFTvVçD6öçFW‡BÀ¢&÷WFT6öçFW‡C¢7F—fU&÷WFTvVçD6öçFW‡BÀ¢Ö&÷VæG3¢f–Ww÷'D&÷VæG2À¢6fVDVçF—F–W3¢'&’æg&öÒ‡6fVD–G2’À¢6fVDVçF—G•7VÖÖ&–W2À¢&V6VçEW6W$7F–öç3¢&V6VçD7F–öç4f÷$vVçBÀ¢&V6VçE6V&6†W3¢&V6VçE6V&6†W4f÷$vVçBÀ¢&V6VçFÇ•6VÆV7FVDVçF—F–W3¢&V6VçFÇ•6VÆV7FVE7VÖÖ&–W2À¢&÷WFTæV&'”6öçFW‡BÀ¢7F—fTf–ÇFW$w&÷WÀ¢—56V6öæF'”f–ÇFW#¢&ööÆVâ†7F—fU6V6öæF'”f–ÇFW"’À¢'6VD–çFVçBÀ¢–çFVçD6FVv÷&–W3¢'6VD–çFVçBæ–çFVçG2æÆVæwF€¢ò'6VD–çFVçBæ–çFVçG0¢¢W&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò²&7F—f—G’"Â&6×–vç2"Â'W&·2"Â&WfVçG2"Â'&÷W'F–W2"Â'G&VæG2%Ð¢¢²&æV&'’"Â'Föæ–v‡B"Â'W&·2"Â&WfVçG2"Â'Æ6W2%ÒÀ¢vVçD6öçFW‡C¢°¢VW'’À¢ÖöFS¢W&Å7FFRæÖöFRÀ¢7F—fUF#¢W&Å7FFRçF"À¢7F—fTf–ÇFW"À¢7F—fTÆ–W#¢W&Å7FFRæÆ–W"À¢7F—fT6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÀ¢7F—fU&÷WFS¢7F—fU&÷WFTvVçD6öçFW‡BÀ¢7F—fTVçF—G“¢6VÆV7FVD–BÀ¢W6W$Æö6F–öã¢çVÆÂÀ¢Ö&÷VæG3¢f–Ww÷'D&÷VæG2À¢Ö÷6—F–öã¢f–Ww÷'D&÷VæG2ò°¢6VçFW#¢f–Ww÷'D&÷VæG2æ6VçFW"ÇÂçVÆÂÀ¢¦ööÓ¢f–Ww÷'D&÷VæG2ç¦ööÒÇÂÖ¦ööÒÀ¢&÷VæG3¢f–Ww÷'D&÷VæG2À¢Ò¢²6VçFW#¢çVÆÂÂ¦ööÓ¢Ö¦ööÒÒÀ¢F–ÖT6öçFW‡C¢&W6–FVçE6V&6„–çFVçBçF–ÖRÇÂW&Å7FFRçF–ÖRÇÂ""À¢6VÆV7FVDF—7G&–7C¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7BÀ¢6fVDVçF—F–W3¢'&’æg&öÒ‡6fVD–G2’À¢6fVDVçF—G•7VÖÖ&–W2À¢&V6VçFÇ•6VÆV7FVDVçF—F–W3¢&V6VçFÇ•6VÆV7FVE7VÖÖ&–W2À¢&V6VçE6V&6†W3¢&V6VçE6V&6†W4f÷$vVçBÀ¢&V6VçD7F–öç3¢&V6VçD7F–öç4f÷$vVçBÀ¢&÷WFTæV&'”6öçFW‡BÀ¢VçF—G•&Vv—7G'“¢vWDvVçDVçF—G•&Vv—7G'•6æ6†÷B†F—66÷fW$F—7Æ•Æ6W2Â°¢7F—fTf–ÇFW"À¢VW'’À¢f–Ww÷'D&÷VæG2À¢¦ööÓ¢Ö¦ööÒÀ¢6VÆV7FVD–BÀ¢ÖöFS¢W&Å7FFRæÖöFRÀ¢Ò’À¢ÒÀ¢Ö6öçFW‡C¢Æö6Å&W7VÇG2ç6Æ–6RƒÂ‚’æÖ‚‡Æ6R’Óâ°¢6öç7BÆVvVæG4Æ—7F–ærÒvWE&W6öÇfVDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7BÇW‡W'”'V–ÆF–ærÒvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡Æ6R“°¢6öç7B'V–ÆF–ætÆ—7F–æw2ÒÇW‡W'”'V–ÆF–æsòæÆ—7F–æw2ÇÂÆ6SòæÆ—7F–æw2ÇÂµÓ°¢&WGW&â°¢–C¢Æ6Ræ–BÀ¢æÖS¢Æ6RææÖRÀ¢6FVv÷'“¢Æ6Ræ6FVv÷'’À¢F—7G&–7C¢Æ6RæF—7G&–7BÀ¢G—S¢Æ6RçG—RÀ¢FG&W73¢Æ6RæFG&W72ÇÂÆ6Rç&sòæFG&W72ÇÂ""À¢7VÖÖ'“¢Æ6Rç7VÖÖ'’ÇÂÆ6RæFW67&—F–öâÇÂÆ6Rç&sòç7VÖÖ'’ÇÂÆ6Rç&sòæFW67&—F–öâÇÂ""À¢öffW#¢Æ6RæFVÇ5ööffW'2ÇÂÆ6RæöffW"ÇÂÆ6Rç&sòæFVÇ5ööffW'2ÇÂÆ6Rç&sòæöffW"ÇÂÆ6Ræ†”†÷W#òæöffW"ÇÂÆ6Rç&sòæ†”†÷W#òæöffW"ÇÂ""À¢F–Ö–æs¢Æ6Ræ†”†÷W#òçF–ÖRÇÂÆ6Rç&sòæ†”†÷W#òçF–ÖRÇÂÆ6RçF–ÖRÇÂÆ6Rç&sòçF–ÖRÇÂ""À¢ÆF—GVFS¢Æ6RæÆF—GVFRÀ¢Æöæv—GVFS¢Æ6RæÆöæv—GVFRÀ¢†5W&³¢†47F—fUW&´FF‡Æ6R’À¢Æ—7F–æs¢ÆVvVæG4Æ—7F–æp¢ò°¢FG&W73¢ÆVvVæG4Æ—7F–æræFG&W72À¢&–6S¢ÆVvVæG4Æ—7F–ærç&–6TF—7Æ’ÇÂÆVvVæG4Æ—7F–ærç&–6RÀ¢&VG3¢ÆVvVæG4Æ—7F–æræ&VG2À¢&F‡3¢ÆVvVæG4Æ—7F–æræ&F‡2À¢7gC¢ÆVvVæG4Æ—7F–ærç7gDF—7Æ’ÇÂÆVvVæG4Æ—7F–ærç7gBÀ¢Væ—C¢ÆVvVæG4Æ—7F–ærçVæ—BÀ¢ÖÇ3¢ÆVvVæG4Æ—7F–æræÖÇ4çVÖ&W"ÇÂÆVvVæG4Æ—7F–æræÖÇ5öçVÖ&W"À¢F—4öäÖ&¶WC¢ÆVvVæG4Æ—7F–æræF—4öäÖ&¶WBÀ¢7FGW3¢ÆVvVæG4Æ—7F–ærç7FGW2À¢'V–ÆF–æs¢ÆVvVæG4Æ—7F–æræ'V–ÆF–ætæÖRÇÂÆVvVæG4Æ—7F–æræ'V–ÆF–æuöæÖRÀ¢Ð¢¢VæFVf–æVBÀ¢'V–ÆF–ætÆ—7F–æw3¢'V–ÆF–ætÆ—7F–æw2æÆVæwF€¢ò'V–ÆF–ætÆ—7F–æw2ç6Æ–6RƒÂb’æÖ‚†Æ—7F–ær’Óâ‡°¢FG&W73¢Æ—7F–æræFG&W72À¢Væ—C¢Æ—7F–ærçVæ—BÀ¢&–6S¢Æ—7F–ærç&–6RÀ¢&VG3¢Æ—7F–æræ&VG2À¢&F‡3¢Æ—7F–æræ&F‡2À¢7gC¢Æ—7F–ærç7gBÀ¢ÖÇ3¢Æ—7F–æræÖÇ5öçVÖ&W"À¢7FGW3¢Æ—7F–ærç7FGW2À¢Ò’¢¢VæFVf–æVBÀ¢Ó°¢Ò’À¢Ò“° ¢–b‚–ÆöCòæç7vW"’&WGW&âçVÆÃ°¢&WGW&â–ÆöC°¢Ò6F6‚°¢&WGW&âçVÆÃ°¢Ð¢Ð ¢7–æ2gVæ7F–öâ'Vå6V&6‚†WfVçB’°¢WfVçCòç&WfVçDFVfVÇB‚“°¢6öç7BVW'’Ò6V&6‚çG&–Ò‚’ÇÂ6V&6„6öç6öÆTÖöFT6öæf–rçÆ6V†öÆFW#°¢6öç7B'6VD–çFVçBÒ'6TÖ–çFVçB‡VW'’ÂW&Å7FFRæÖöFR“°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡VW'’ÂW&Å7FFRæÖöFR“°¢6öç7B&÷WFT6öÆÆV7F–öâÒvWDÖ6öÆÆV7F–öäf÷%VW'’‡VW'’“°¢6öç7BæW‡DF—7G&–7BÒ'6VD–çFVçBæF—7G&–7BÇÂF—7G&–7C°¢6öç7BVffV7F—fTæW‡Df–ÇFW"ÒæW‡Df–ÇFW"ÇÂ7F—fTf–ÇFW#°¢÷Vå6V&6…&W7VÇG4Æ–W"‚“°¢6öç7B6öÖÖ—GFVDf–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†VffV7F—fTæW‡Df–ÇFW"Â°¢VW'’À¢6öÆÆV7F–öã¢&÷WFT6öÆÆV7F–öãòæ–BÇÂ""À¢F—7G&–7C¢'6VD–çFVçBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò""¢F—7G&–7B’À¢F–ÖS¢'6VD–çFVçBçF–ÖT6öçFW‡BÇÂ""À¢–çFVçC¢'6VD–çFVçBæ–çFVçG5³ÒÇÂvWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†VffV7F—fTæW‡Df–ÇFW"ÂVW'’’À¢VçF—G•G—S¢'6VD–çFVçBæVçF—G•G—RÇÂ""À¢Ò“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'’À¢f–ÇFW$÷fW'&–FS¢6öÖÖ—GFVDf–ÇFW"À¢6öÆÆV7F–öä–C¢&÷WFT6öÆÆV7F–öãòæ–BÇÂ""À¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢&÷WFT6öÆÆV7F–öãòæ–Bò&7W&FVE÷&÷WFR"¢'FW‡E÷6V&6‚"À¢Æ–Ö—C¢&÷WFT6öÆÆV7F–öãòç7F÷–G3òæÆVæwF‚ÇÂVæFVf–æVBÀ¢Ò“°¢6öç7Bæ÷&ÖÆ—¦VDW†7EVW'’ÒVW'’çFôÆ÷vW$66R‚’ç&WÆ6R‚õµæ×£Ó•Ò²örÂ""’çG&–Ò‚“°¢6öç7BW†7EÆ6RÒÆö6Å&W7VÇG2æf–æB‚‡Æ6R’Óâ°¢6öç7BW†7D6æF–FFW2Ò·Æ6Ræ–BÂÆ6RææÖRÂÆ6RçF—FÆRÂÆ6RæVçF—G•ö–EÐ¢æf–ÇFW"„&ööÆVâ¢æÖ‚‡fÇVR’Óâ7G&–ær‡fÇVR’çFôÆ÷vW$66R‚’ç&WÆ6R‚õµæ×£Ó•Ò²örÂ""’çG&–Ò‚’“°¢&WGW&âW†7D6æF–FFW2æ–æ6ÇVFW2†æ÷&ÖÆ—¦VDW†7EVW'’“°¢Ò“°¢–b†W†7EÆ6R’6VÆV7EÆ6R†W†7EÆ6R“°¢&V6÷&DÖW6W$7F–öâ‚'6V&6‚"Â°¢VW'’À¢f–ÇFW#¢6öÖÖ—GFVDf–ÇFW"À¢6öÆÆV7F–öã¢&÷WFT6öÆÆV7F–öãòæ–BÇÂW&Å7FFRæ6öÆÆV7F–öâÇÂ""À¢F—7G&–7C¢'6VD–çFVçBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7B’À¢&W7VÇD6÷VçC¢Æö6Å&W7VÇG2æÆVæwF‚À¢Ò“°¢G&6¶–ætWfVçG2ç6V&6…7V&Ö—B‡VW'’“°¢f—&Uv÷&¶fÆ÷r‚"ö’÷6V&6‚ÖÆör"Â°¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢VW'’À¢ÆC¢U5D”åô4TåDU%³ÒÀ¢Ææs¢U5D”åô4TåDU%³ÒÀ¢Ò“°¢–b‡'6VD–çFVçBæF—7G&–7B’6WDF—7G&–7B‡'6VD–çFVçBæF—7G&–7B“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"‡VW'’ÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFRÂæW‡DF—7G&–7BÂ6öÖÖ—GFVDf–ÇFW"’“° ¢6öç7BvVçDç7vW"Òv—B6´ÖvVçB‡VW'’ÂÆö6Å&W7VÇG2“°¢–b†vVçDç7vW#òæç7vW"’°¢6WDÖç7vW"‚†7W'&VçB’ÓâÖW&vTvVçDç7vW%v—F„Æö6Å&W7VÇG2†vVçDç7vW"ÂÆö6Å&W7VÇG2Â7W'&VçCòçF—FÆRÇÂ7F'Bv—F‚G¶Æö6Å&W7VÇG5³ÓòææÖRÇÂ$F÷vçF÷vâ'Òæ’“°¢Ð¢Ð ¢7–æ2gVæ7F–öâÇ•&ö×B‡&ö×B’°¢6öç7B'6VD–çFVçBÒ'6TÖ–çFVçB‡&ö×BÂW&Å7FFRæÖöFR“°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡&ö×BÂW&Å7FFRæÖöFR“°¢6öç7B&÷WFT6öÆÆV7F–öâÒvWDÖ6öÆÆV7F–öäf÷%VW'’‡&ö×B“°¢6öç7BæW‡DF—7G&–7BÒ'6VD–çFVçBæF—7G&–7BÇÂF—7G&–7C°¢6öç7BVffV7F—fTæW‡Df–ÇFW"ÒæW‡Df–ÇFW"ÇÂ7F—fTf–ÇFW#°¢÷Vå6V&6…&W7VÇG4Æ–W"‚“°¢6öç7B6öÖÖ—GFVDf–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†VffV7F—fTæW‡Df–ÇFW"Â°¢VW'“¢&ö×BÀ¢6öÆÆV7F–öã¢&÷WFT6öÆÆV7F–öãòæ–BÇÂ""À¢F—7G&–7C¢'6VD–çFVçBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò""¢F—7G&–7B’À¢F–ÖS¢'6VD–çFVçBçF–ÖT6öçFW‡BÇÂ""À¢–çFVçC¢'6VD–çFVçBæ–çFVçG5³ÒÇÂvWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†VffV7F—fTæW‡Df–ÇFW"Â&ö×B’À¢VçF—G•G—S¢'6VD–çFVçBæVçF—G•G—RÇÂ""À¢Ò“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢&ö×BÀ¢f–ÇFW$÷fW'&–FS¢6öÖÖ—GFVDf–ÇFW"À¢6öÆÆV7F–öä–C¢&÷WFT6öÆÆV7F–öãòæ–BÇÂ""À¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢&÷WFT6öÆÆV7F–öãòæ–Bò&7W&FVE÷&÷WFR"¢'&ö×E÷6V&6‚"À¢Æ–Ö—C¢&÷WFT6öÆÆV7F–öãòç7F÷–G3òæÆVæwF‚ÇÂVæFVf–æVBÀ¢Ò“°¢&V6÷&DÖW6W$7F–öâ‚'6V&6‚"Â°¢VW'“¢&ö×BÀ¢f–ÇFW#¢6öÖÖ—GFVDf–ÇFW"À¢6öÆÆV7F–öã¢&÷WFT6öÆÆV7F–öãòæ–BÇÂW&Å7FFRæ6öÆÆV7F–öâÇÂ""À¢F—7G&–7C¢'6VD–çFVçBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7B’À¢&W7VÇD6÷VçC¢Æö6Å&W7VÇG2æÆVæwF‚À¢6÷W&6S¢'&ö×B"À¢Ò“°¢G&6¶–ætWfVçG2ç6V&6…7V&Ö—B‡&ö×B“°¢f—&Uv÷&¶fÆ÷r‚"ö’÷6V&6‚ÖÆör"Â°¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢VW'“¢&ö×BÀ¢ÆC¢U5D”åô4TåDU%³ÒÀ¢Ææs¢U5D”åô4TåDU%³ÒÀ¢Ò“°¢–b‡'6VD–çFVçBæF—7G&–7B’6WDF—7G&–7B‡'6VD–çFVçBæF—7G&–7B“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"‡&ö×BÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFRÂæW‡DF—7G&–7BÂ6öÖÖ—GFVDf–ÇFW"’“° ¢6öç7BvVçDç7vW"Òv—B6´ÖvVçB‡&ö×BÂÆö6Å&W7VÇG2“°¢–b†vVçDç7vW#òæç7vW"’°¢6WDÖç7vW"‚†7W'&VçB’ÓâÖW&vTvVçDç7vW%v—F„Æö6Å&W7VÇG2†vVçDç7vW"ÂÆö6Å&W7VÇG2Â7W'&VçCòçF—FÆRÇÂ7F'Bv—F‚G¶Æö6Å&W7VÇG5³ÓòææÖRÇÂ$F÷vçF÷vâ'Òæ’“°¢Ð¢Ð ¢7–æ2gVæ7F–öâÇ•&W6–FVçD–çFVçB†—FVÒ’°¢–b‡W&Å7FFRæÖöFRÓÓÒ''FæW""bb—FVÓòæ–B’°¢–b‡W&Å7FFRæ–çFVçBÓÓÒ—FVÒæ–BbbVffV7F—fU6V&6‚bb6VÆV7FVD–B’&WGW&ã°¢6WE&W6–FVçE6V&6„–çFVçB‚†7W'&VçB’Óâ‡²ââæ7W'&VçBÂ–çFVçC¢—FVÒæ–BÒ’“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6öç7BæW‡Df–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†—FVÒæf–ÇFW"ÇÂ$ÆÂ"Â²–çFVçC¢—FVÒæ–BÒ“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢""À¢f–ÇFW$÷fW'&–FS¢æW‡Df–ÇFW"À¢–çFVçD÷fW'&–FS¢—FVÒæ–BÀ¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢''FæW%ö–çFVçB"À¢Ò“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"†—FVÒæÆ&VÂÇÂ—FVÒæ–BÂÆö6Å&W7VÇG2Â''FæW""ÂF—7G&–7BÂæW‡Df–ÇFW"’“°¢&V6÷&DÖW6W$7F–öâ‚&f–ÇFW""Â²–çFVçC¢—FVÒæ–BÂf–ÇFW#¢æW‡Df–ÇFW"Â&W7VÇD6÷VçC¢Æö6Å&W7VÇG2æÆVæwF‚Â6÷W&6S¢''FæW%ö–çFVçEö6öç6öÆR"Ò“°¢&WGW&ã°¢Ð¢6WE&W6–FVçE6V&6„–çFVçB‚†7W'&VçB’Óâ‡²ââæ7W'&VçBÂ–çFVçC¢—FVÒæ–BÒ’“°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢v—BÇ•&ö×B†—FVÒç&ö×B“°¢Ð ¢7–æ2gVæ7F–öâÇ•&W6–FVçEF–ÖR†—FVÒ’°¢6öç7B7W'&VçEVW'’Ò6V&6‚çG&–Ò‚“°¢6öç7B7F—fT–çFVçDÆ&VÂÒ$U4”DTåEô”åDTåEô4ôå4ôÄUô%UEDôå2æf–æB‚†–çFVçD—FVÒ’Óâ–çFVçD—FVÒæ–BÓÓÒ&W6–FVçE6V&6„–çFVçBæ–çFVçB“òæÆ&VÃ°¢6öç7BæW‡EVW'’Ò7W'&VçEVW'¢òG¶7W'&VçEVW'—ÒG¶—FVÒæÆ&VÂçFôÆ÷vW$66R‚—Ö ¢¢7F—fT–çFVçDÆ&VÀ¢òG¶7F—fT–çFVçDÆ&VÇÒG¶—FVÒæÆ&VÂçFôÆ÷vW$66R‚—Ö ¢¢—FVÒç&ö×C°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB†æW‡EVW'’ÂW&Å7FFRæÖöFR’ÇÂ7F—fTf–ÇFW#°¢6WE&W6–FVçE6V&6„–çFVçB‚†7W'&VçB’Óâ‡²ââæ7W'&VçBÂF–ÖS¢—FVÒæ–BÒ’“°¢÷Vå6V&6…&W7VÇG4Æ–W"‚“°¢6öç7B6öÖÖ—GFVDf–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â°¢VW'“¢æW‡EVW'’À¢F–ÖS¢—FVÒæ–BÀ¢&F—W2À¢–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"ÂæW‡EVW'’’À¢Ò“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢æW‡EVW'’À¢f–ÇFW$÷fW'&–FS¢6öÖÖ—GFVDf–ÇFW"À¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢'F–ÖUö–çFVçB"À¢Ò“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"†æW‡EVW'’ÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFRÂF—7G&–7BÂ6öÖÖ—GFVDf–ÇFW"’“°¢Ð ¢7–æ2gVæ7F–öâÇ•&W6–FVçE&F—W2†—FVÒ’°¢6öç7BæW‡EVW'’Ò6V&6‚çG&–Ò‚’ÇÂ%v†N(	—2v÷'F‚vÆ¶–ærFòFöæ–v‡Cò#°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB†æW‡EVW'’ÂW&Å7FFRæÖöFR’ÇÂ7F—fTf–ÇFW#°¢6WE&F—W2†—FVÒæÆ&VÂ“°¢÷Vå6V&6…&W7VÇG4Æ–W"‚“°¢6öç7B6öÖÖ—GFVDf–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â°¢VW'“¢æW‡EVW'’À¢&F—W3¢—FVÒæÆ&VÂÀ¢–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"ÂæW‡EVW'’’À¢Ò“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢æW‡EVW'’À¢f–ÇFW$÷fW'&–FS¢6öÖÖ—GFVDf–ÇFW"À¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢'&F—W5ö–çFVçB"À¢Ò“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"†æW‡EVW'’ÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFRÂF—7G&–7BÂ6öÖÖ—GFVDf–ÇFW"’“°¢Ð ¢7–æ2gVæ7F–öâÇ•&W6–FVçD6öç6öÆTf–ÇFW"†—FVÒ’°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢–b†—FVÒæ6öÆÆV7F–öâ’°¢6WE&W6–FVçE6V&6„–çFVçB‚†7W'&VçB’Óâ‡²ââæ7W'&VçBÂ–çFVçC¢çVÆÂÒ’“°¢6öç7BæW‡EVW'’Ò—FVÒç&ö×BÇÂ—FVÒæÆ&VÂÇÂ—FVÒæ6öÆÆV7F–öã°¢÷Vä6öÆÆV7F–öå&÷WFR†—FVÒæ6öÆÆV7F–öâÂæW‡EVW'’“°¢&WGW&ã°¢Ð¢–b†—FVÒæf–ÇFW"’°¢6WE&W6–FVçE6V&6„–çFVçB‚†7W'&VçB’Óâ‡²ââæ7W'&VçBÂ–çFVçC¢çVÆÂÒ’“°¢6öç7BæW‡EVW'’Ò—FVÒç&ö×BÇÂ—FVÒæÆ&VÂÇÂ—FVÒæf–ÇFW#°¢6öç7BæW‡D–çFVçD–BÒW&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò—FVÒæ–BÇÂvWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†—FVÒæf–ÇFW"ÂæW‡EVW'’¢¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†—FVÒæf–ÇFW"ÂæW‡EVW'’“°¢–b‡W&Å7FFRæÖöFRÓÓÒ''FæW""bbW&Å7FFRæ–çFVçBÓÓÒæW‡D–çFVçD–BbbVffV7F—fU6V&6‚bb6VÆV7FVD–B’&WGW&ã°¢6öç7BæW‡Df–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†—FVÒæf–ÇFW"Â°¢VW'“¢æW‡EVW'’À¢–çFVçC¢æW‡D–çFVçD–BÀ¢F—7Æ•VW'“¢æW‡EVW'’À¢Ò“°¢6öç7BÆö6Å&W7VÇG2Òv—B&WVW7E66÷VDÖ&W7VÇG2‡°¢VW'“¢æW‡EVW'’À¢f–ÇFW$÷fW'&–FS¢æW‡Df–ÇFW"À¢–çFVçD÷fW'&–FS¢æW‡D–çFVçD–BÀ¢7F—fTVçF—G”–C¢""À¢G&–vvW#¢&–çFVçEöf–ÇFW""À¢Ò“°¢6WDÖç7vW"†'V–ÆDvVçF–4Öç7vW"†æW‡Df–ÇFW"ÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFRÂF—7G&–7BÂæW‡Df–ÇFW"’“°¢&V6÷&DÖW6W$7F–öâ‚&f–ÇFW""Â²f–ÇFW#¢æW‡Df–ÇFW"Â&W7VÇD6÷VçC¢Æö6Å&W7VÇG2æÆVæwF‚Â6÷W&6S¢&–çFVçEö6öç6öÆR"Ò“°¢&WGW&ã°¢Ð¢–b†—FVÒæ¶–æBÓÓÒ'F–ÖR"’°¢Ç•&W6–FVçEF–ÖR‡²–C¢—FVÒçF–ÖRÂÆ&VÃ¢%Föæ–v‡B"Â&ö×C¢—FVÒç&ö×BÒ“°¢&WGW&ã°¢Ð¢–b†—FVÒæ¶–æBÓÓÒ'&F—W2"’°¢Ç•&W6–FVçE&F—W2‡²–C¢#RÖÖ–â"ÂÆ&VÃ¢—FVÒç&F—W2Ò“°¢&WGW&ã°¢Ð¢fö–BÇ•&ö×B†—FVÒç&ö×B“°¢Ð ¢gVæ7F–öâ6ÆV%&W6–FVçE6V&6„–çFVçB‚’°¢6WE&W6–FVçE6V&6„–çFVçB‡²–çFVçC¢çVÆÂÂF–ÖS¢çVÆÂÒ“°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚$ÆÂ"“°¢Ð ¢7–æ2gVæ7F–öâ6´VçF—G”76—7FçB‡&ö×B’°¢–b‚6VÆV7FVB’&WGW&ã°¢6öç7B6ÆVå&ö×BÒ7G&–ær‡&ö×BÇÂ""’çG&–Ò‚“°¢–b‚6ÆVå&ö×B’&WGW&ã°¢6öç7BVçF—G•&ö×BÒ6ÆVå&ö×BçFôÆ÷vW$66R‚’æ–æ6ÇVFW2…7G&–ær‡6VÆV7FVBææÖRÇÂ""’çFôÆ÷vW$66R‚’’ò6ÆVå&ö×B¢G¶6ÆVå&ö×GÒf÷"G·6VÆV7FVBææÖWÖ°¢6öç7BæV&'•Æ6W2ÒvWDæV&'”&VÆ6W2‡6VÆV7FVBÂÆ6W2Âb’æÖ‚†—FVÒ’Óâ—FVÒæ6æF–FFR“°¢6öç7BÆö6Å&W7VÇG2ÒæV&'•Æ6W2æÆVæwF‚òæV&'•Æ6W2¢vWE6Ö'E&W7VÇG2†VçF—G•&ö×B’æf–ÇFW"‚‡Æ6R’ÓâÆ6Ræ–BÓÒ6VÆV7FVBæ–B’ç6Æ–6RƒÂb“°¢6öç7BÆö6Äç7vW"Ò'V–ÆDVçF—G”76—7FçDç7vW"†VçF—G•&ö×BÂ6VÆV7FVBÂÆö6Å&W7VÇG2ÂW&Å7FFRæÖöFR“°¢6öç7B7W'&VçDF—7G&–7BÒ6VÆV7FVBæF—7G&–7BÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7B“°¢6öç7B&W7VÇE–ÆöBÒ·6VÆV7FVBÂââæÆö6Å&W7VÇG2æf–ÇFW"‚‡Æ6R’ÓâÆ6Ræ–BÓÒ6VÆV7FVBæ–B•Ó° ¢÷Vå6V&6…&W7VÇG4Æ–W"‚“°¢&V6÷&DÖW6W$7F–öâ‚'6V&6‚"Â°¢VW'“¢VçF—G•&ö×BÀ¢f–ÇFW#¢7F—fTf–ÇFW"À¢F—7G&–7C¢7W'&VçDF—7G&–7BÀ¢VçF—G”–C¢6VÆV7FVBæ–BÀ¢VçF—G”æÖS¢6VÆV7FVBææÖRÀ¢&W7VÇD6÷VçC¢&W7VÇE–ÆöBæÆVæwF‚À¢6÷W&6S¢&VçF—G•÷&ö×B"À¢Ò“°¢G&6¶–ætWfVçG2ç6V&6…7V&Ö—B†VçF—G•&ö×B“°¢f—&Uv÷&¶fÆ÷r‚"ö’÷6V&6‚ÖÆör"Â°¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢VW'“¢VçF—G•&ö×BÀ¢ÆC¢U5D”åô4TåDU%³ÒÀ¢Ææs¢U5D”åô4TåDU%³ÒÀ¢Ò“°¢6WE6V&6‚†VçF—G•&ö×B“°¢6WDÖç7vW"†Æö6Äç7vW"“°¢6WDVçF—G”ç7vW"†Æö6Äç7vW"“°¢6WDVçF—G”76—7FçDÆöF–ær‡G'VR“°¢W&Å7FFRçWFFR‡°¢F#¢&Ö"À¢VW'“¢VçF—G•&ö×BÀ¢¢""À¢f–ÇFW#¢7F—fTf–ÇFW"À¢F—7G&–7C¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò""¢F—7G&–7BÀ¢VçF—G”–C¢6VÆV7FVBæ–BÀ¢Æ–W#¢""À¢Æ—7F–æt–C¢""À¢G&vW$6Æ÷6VC¢""À¢Ò“° ¢G'’°¢6öç7BvVçDç7vW"Òv—B6´ÖvVçB†VçF—G•&ö×BÂ&W7VÇE–ÆöB“°¢–b†vVçDç7vW#òæç7vW"’°¢6öç7BÖW&vVDç7vW"ÒÖW&vTvVçDç7vW%v—F„Æö6Å&W7VÇG2€¢vVçDç7vW"À¢Æö6Å&W7VÇG2À¢Æö6Äç7vW#òçF—FÆRÇÂ7F'Bv—F‚G¶Æö6Å&W7VÇG5³ÓòææÖRÇÂ6VÆV7FVCòææÖRÇÂ$F÷vçF÷vâ'Òæ ¢“°¢6WDVçF—G”ç7vW"†ÖW&vVDç7vW"“°¢6WDÖç7vW"†ÖW&vVDç7vW"“°¢Ð¢Òf–æÆÇ’°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢Ð¢Ð ¢gVæ7F–öâ6ÆV$÷VäÖ6VÆV7F–öâ‚’°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WDVçF—G”76—7FçDÆöF–ær†fÇ6R“°¢Ð ¢gVæ7F–öâ7v—F6„ÖöFR†ÖöFRÂF"Ò&Ö"Â&WVW7FVDf–ÇFW"Ò""Â÷F–öç2Ò·Ò’°¢6öç7BæW‡Df–ÇFW"Ò&WVW7FVDf–ÇFW"ÇÂ†ÖöFRÓÓÒ''FæW""ò$ÆÂ"¢F"ÓÓÒ'72"ò$ÆÂ"¢7F—fTf–ÇFW"ÓÓÒ%6fVB"ò%6fVB"¢$ÆÂ"“°¢6ÆV$÷VäÖ6VÆV7F–öâ‚“°¢6WE6V&6‚‚""“°¢6WD7F—fTf–ÇFW"†æW‡Df–ÇFW"“°¢6WDF—7G&–7B„ÄÅôäT”t„$õ$„ôôE2“°¢6WE&F—W2‚#RÖ–âvÆ²"“°¢6WD–çFVÄ÷Vâ†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WDæV–v†&÷&†ööG4÷Vâ†fÇ6R“°¢6WE6V6öæF'•&–Ä÷Vâ†fÇ6R“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB„&ööÆVâ†÷F–öç2æ6öÆÆ6T6öç6öÆR’“°¢æf–vFR†öÖöÖöFSÒG¶ÖöFWÒgF#ÒG·F'ÒG·F"ÓÓÒ&Ö"òff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†æW‡Df–ÇFW"—Ö¢"'Ö“°¢Ð ¢gVæ7F–öâ÷Vå&W6–FVçDÆ–W"†f–ÇFW"’°¢6öç7BæW‡Df–ÇFW"Ò&Vv–å6V&6„–çFVçEG&ç6—F–öâ†f–ÇFW"“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WEæVÄÖöFR‚&6Æ÷6VB"“°¢6WD–çFVÄ÷Vâ†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢6WE6V6öæF'•&–Ä÷Vâ†fÇ6R“°¢æf–vFR†öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†æW‡Df–ÇFW"—Ö“°¢Ð ¢6öç7Bvô&6µFôÖÒW6T6ÆÆ&6²‚‚’Óâ°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD–çFVÄ÷Vâ†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢æf–vFR†öÖöÖöFSÒG·W&Å7FFRæÖöFWÒgF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†7F—fTf–ÇFW"ÇÂ$ÆÂ"—ÖÂ²&WÆ6S¢G'VRÒ“°¢ÒÂ¶7F—fTf–ÇFW"Âæf–vFRÂW&Å7FFRæÖöFUÒ“° ¢6öç7B&W7F÷&U&Wf–÷W4ÖæVÂÒW6T6ÆÆ&6²‚‚’Óâ°¢6öç7B&Wf–÷W2Ò÷æVÅ7FFR‚“°¢–b‚&Wf–÷W2’°¢vô&6µFôÖ‚“°¢&WGW&ã°¢Ð¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢WFFT7F—fUW&·4G&vW%7FFR‡&Wf–÷W2æG&vW%7FFR“°¢æf–vFR‡&Wf–÷W2çW&ÂÂ²&WÆ6S¢G'VRÒ“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢6öç7BÆ—7BÒFö7VÖVçBçVW'•6VÆV7F÷"‚%¶FFÖ7F—fR×W&·2×67&öÆÃÒwG'VRuÒ"“°¢–b†Æ—7B’Æ—7Bç67&öÆÅF÷Ò&Wf–÷W2ç67&öÆÅF÷ÇÂ°¢–b‡&Wf–÷W2æfö7W4–B’Fö7VÖVçBævWDVÆVÖVçD'”–B‡&Wf–÷W2æfö7W4–B“òæfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢ÒÂ“°¢ÒÂ¶vô&6µFôÖÂæf–vFRÂ÷æVÅ7FFRÂWFFT7F—fUW&·4G&vW%7FFUÒ“° ¢6öç7B6Æ÷6TF—&V7F÷'•FôÖÒW6T6ÆÆ&6²‚‚’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚$ÆÂ"“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD–çFVÄ÷Vâ†fÇ6R“°¢6WDf–ÇFW'4÷Vâ†fÇ6R“°¢æf–vFR†öÖöÖöFSÒG·W&Å7FFRæÖöFWÒgF#ÖÖff–ÇFW#ÔÆÆ“°¢ÒÂ¶æf–vFRÂW&Å7FFRæÖöFUÒ“° ¢6öç7B6Æ÷6U6VÆV7FVDÖG&vW"ÒW6T6ÆÆ&6²‚‚’Óâ°¢–b‡6VÆV7FVCòæ–B’°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ'æVÅö6Æ÷6VB"Â&ÖöFWF–Å÷æVÂ"Â°¢ÖWFFF¢²VçF—G•G—S¢vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’ÂæVÅ7FFS¢FWF–ÄG&vW%7FFRÒÀ¢Ò’“°¢Ð¢6ÆV%æVÅ7F6²‚“°¢–ä¶–æE&VçE&Vbæ7W'&VçBÒçVÆÃ°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WE6VÆV7FVDG&vW$6Æ÷6VB‡G'VR“°¢6WE6VÆV7FVDG&vW$Ö–æ–Ö—¦VB†fÇ6R“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢æf–vFTÖ¦÷W&æW’€¢°¢ÖöFS¢W&Å7FFRæÖöFRÀ¢F#¢&Ö"À¢f–ÇFW#¢7F—fTf–ÇFW"ÇÂ$ÆÂ"À¢6öÆÆV7F–öã¢W&Å7FFRæ6öÆÆV7F–öâÇÂ""À¢7F÷–C¢W&Å7FFRç7F÷–BÇÂ""À¢&÷WFU7FFS¢W&Å7FFRç&÷WFU7FFRÇÂ""À¢ÒÀ¢²6ÆV%6VÆV7F–öã¢G'VRÂ&WÆ6S¢G'VRÐ¢“°¢ÒÂ¶7F—fTf–ÇFW"Â6ÆV%æVÅ7F6²ÂFWF–ÄG&vW%7FFRÂæf–vFTÖ¦÷W&æW’Â6VÆV7FVBÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæÖöFRÂW&Å7FFRçW&´–BÂW&Å7FFRç&÷WFU7FFRÂW&Å7FFRç7F÷–EÒ“° ¢6öç7BF—6Ö—75f—6–&ÆTæF—fTG&vW"ÒW6T6ÆÆ&6²‚‚’Óâ°¢–b‡W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bbæF—fTG&vW%7FFRÓÒ&6öÆÆ6VB"’°¢6WDæF—fTG&vW%7FFR‚&6öÆÆ6VB"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢&WGW&ã°¢Ð¢6Æ÷6U6VÆV7FVDÖG&vW"‚“°¢ÒÂ¶6Æ÷6U6VÆV7FVDÖG&vW"ÂæF—fTG&vW%7FFRÂW&Å7FFRæÖöFUÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚6VÆV7FVD–B’°¢6öç7BG&–vvW"ÒG&vW%G&–vvW%&Vbæ7W'&VçC°¢G&vW%G&–vvW%&Vbæ7W'&VçBÒçVÆÃ°¢–b‡G&–vvW#òæ—46öææV7FVB’v–æF÷rç6WEF–ÖV÷WB‚‚’ÓâG&–vvW"æfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ’Â“°¢&WGW&âVæFVf–æVC°¢Ð¢6öç7BG&vW"ÒFö7VÖVçBævWDVÆVÖVçD'”–B‚&GÖ7F—fRÖÖÖG&vW""“°¢–b‚G&vW"’&WGW&âVæFVf–æVC°¢6öç7Bfö7W6&ÆU6VÆV7F÷"Òv'WGFöã¦æ÷B…¶F—6&ÆVEÒ’Â¶‡&VeÒÂ–çWC¦æ÷B…¶F—6&ÆVEÒ’Â6VÆV7C¦æ÷B…¶F—6&ÆVEÒ’ÂFW‡F&V¦æ÷B…¶F—6&ÆVEÒ’Â·F&–æFW…Ó¦æ÷B…·F&–æFWƒÒ"Ó%Ò’s°¢6öç7Bfö7W6&ÆW2Ò‚’Óâ'&’æg&öÒ†G&vW"çVW'•6VÆV7F÷$ÆÂ†fö7W6&ÆU6VÆV7F÷"’’æf–ÇFW"‚†æöFR’ÓâæöFRæ†4GG&–'WFR‚&†–FFVâ"’“°¢v–æF÷rç&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâfö7W6&ÆW2‚•³Óòæfö7W3òâ‡²&WfVçE67&öÆÃ¢G'VRÒ’“°¢–b†FWF–ÄG&vW%7FFRÓÒ&gVÆÂ"’&WGW&âVæFVf–æVC° ¢6öç7B&Wf–÷W4&öG”÷fW&fÆ÷rÒFö7VÖVçBæ&öG’ç7G–ÆRæ÷fW&fÆ÷s°¢6öç7BÖ7W&f6W2Ò'&’æg&öÒ†Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚"ævÒ×7G–ÆR"’“°¢6öç7B&Wf–÷W4–æW'BÒÖ7W&f6W2æÖ‚†æöFR’ÓâæöFRæ–æW'B“°¢Fö7VÖVçBæ&öG’ç7G–ÆRæ÷fW&fÆ÷rÒ&†–FFVâ#°¢Ö7W&f6W2æf÷$V6‚‚†æöFR’Óâ²æöFRæ–æW'BÒG'VS²Ò“° ¢gVæ7F–öâ†æFÆTgVÆÅæVÄ¶W–&ö&B†WfVçB’°¢–b†WfVçBæ¶W’ÓÓÒ$W66R"’°¢WfVçBç&WfVçDFVfVÇB‚“°¢6Æ÷6U6VÆV7FVDÖG&vW"‚“°¢&WGW&ã°¢Ð¢–b†WfVçBæ¶W’ÓÒ%F""’&WGW&ã°¢6öç7B—FV×2Òfö7W6&ÆW2‚“°¢–b‚—FV×2æÆVæwF‚’&WGW&ã°¢6öç7Bf—'7BÒ—FV×5³Ó°¢6öç7BÆ7BÒ—FV×5¶—FV×2æÆVæwF‚ÒÓ°¢–b†WfVçBç6†–gD¶W’bbFö7VÖVçBæ7F—fTVÆVÖVçBÓÓÒf—'7B’°¢WfVçBç&WfVçDFVfVÇB‚“°¢Æ7Bæfö7W2‚“°¢ÒVÇ6R–b‚WfVçBç6†–gD¶W’bbFö7VÖVçBæ7F—fTVÆVÖVçBÓÓÒÆ7B’°¢WfVçBç&WfVçDFVfVÇB‚“°¢f—'7Bæfö7W2‚“°¢Ð¢Ð ¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†æFÆTgVÆÅæVÄ¶W–&ö&B“°¢&WGW&â‚’Óâ°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†æFÆTgVÆÅæVÄ¶W–&ö&B“°¢Fö7VÖVçBæ&öG’ç7G–ÆRæ÷fW&fÆ÷rÒ&Wf–÷W4&öG”÷fW&fÆ÷s°¢Ö7W&f6W2æf÷$V6‚‚†æöFRÂ–æFW‚’Óâ²æöFRæ–æW'BÒ&Wf–÷W4–æW'E¶–æFW…Ó²Ò“°¢Ó°¢ÒÂ¶6Æ÷6U6VÆV7FVDÖG&vW"ÂFWF–ÄG&vW%7FFRÂ6VÆV7FVD–EÒ“° ¢6öç7B†æFÆU6VÆV7FVDG&vW$6Æ÷6TWfVçBÒW6T6ÆÆ&6²‚†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢WfVçBææF—fTWfVçCòç7F÷–ÖÖVF–FU&÷vF–öãòâ‚“°¢6Æ÷6U6VÆV7FVDÖG&vW"‚“°¢ÒÂ¶6Æ÷6U6VÆV7FVDÖG&vW%Ò“° ¢W6TVffV7B‚‚’Óâ°¢gVæ7F–öâ†æFÆTæF—fTG&vW$6Æ÷6R†WfVçB’°¢6öç7BF&vWBÒWfVçBçF&vWC°¢6öç7B6Æ÷6UF&vWBÒF&vWCòæ6Æ÷6W7Còâ‚"æGÖG&vW"Ö6Æ÷6RÂæGÖFW7F–æF–öâÖ6Æ÷6RÂ¶FFÖÖÖG&vW"Ö6Æ÷6SÒwG'VRuÒ"“°¢–b‚6Æ÷6UF&vWB’&WGW&ã°¢6öç7B—4æF—fT6Æ÷6TÆ–æ²Ò6Æ÷6UF&vWBæÖF6†W3òâ‚&¶FFÖÖÖG&vW"Ö6Æ÷6SÒwG'VRuÒ"“°¢–b†—4æF—fT6Æ÷6TÆ–æ²’&WGW&ã°¢–b‚—4æF—fT6Æ÷6TÆ–æ²’WfVçBç&WfVçDFVfVÇB‚“°¢WfVçBç7F÷&÷vF–öâ‚“°¢WfVçBç7F÷–ÖÖVF–FU&÷vF–öãòâ‚“°¢6Æ÷6U6VÆV7FVDÖG&vW"‚“°¢Ð ¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW&F÷vâ"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&Ö÷W6VF÷vâ"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'F÷V6‡7F'B"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢&WGW&â‚’Óâ°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚'ö–çFW&F÷vâ"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&Ö÷W6VF÷vâ"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚'F÷V6‡7F'B"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Fö7VÖVçBç&VÖ÷fTWfVçDÆ—7FVæW"‚&6Æ–6²"Â†æFÆTæF—fTG&vW$6Æ÷6RÂG'VR“°¢Ó°¢ÒÂ¶6Æ÷6U6VÆV7FVDÖG&vW%Ò“° ¢gVæ7F–öâ÷Vå'FæW%æVÂ‡æVÂ’°¢6ÆV$÷VäÖ6VÆV7F–öâ‚“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‡æVÂ“°¢6öç7B÷&væ—¦F–öä–BÒ&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚“°¢æf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B†öÖöÖöFS×'FæW"gF#ÒG·æVÇÖÂ÷&væ—¦F–öä–B’“°¢Ð ¢gVæ7F–öâ÷Vå'FæW$Ö†f–ÇFW"Ò$ÆÂ"’°¢6ÆV$÷VäÖ6VÆV7F–öâ‚“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WD7F—fTf–ÇFW"†f–ÇFW"“°¢6öç7B÷&væ—¦F–öä–BÒ&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚“°¢æf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B†öÖöÖöFS×'FæW"gF#ÖÖff–ÇFW#ÒG¶Væ6öFUU$”6ö×öæVçB†f–ÇFW"—ÖÂ÷&væ—¦F–öä–B’“°¢Ð ¢6öç7BFVGWT6öç6öÆT—FV×2Ò†—FV×2ÒµÒ’Óâ°¢6öç7B6VVâÒæWr6WB‚“°¢&WGW&â—FV×2æf–ÇFW"‚†—FVÒ’Óâ°¢6öç7B¶W’Ò7G&–ær†—FVÓòæf–ÇFW"ÇÂ—FVÓòæÆ&VÂÇÂ—FVÒÇÂ""’çG&–Ò‚’çFôÆ÷vW$66R‚“°¢–b‚¶W’ÇÂ6VVâæ†2†¶W’’’&WGW&âfÇ6S°¢6VVâæFB†¶W’“°¢&WGW&âG'VS°¢Ò“°¢Ó°¢6öç7B†W&õ&ö×DÆ&VÇ2ÒFVGWT6öç6öÆT—FV×2€¢W&Å7FFRæÖöFRÓÓÒ''FæW""ò%DäU%õ$ôÕE2¢$U4”DTåEõ$ôÕE2À¢“°¢6öç7B&–Ö'•6V&6„f–ÇFW'2ÒFVGWT6öç6öÆT—FV×2‡W&Å7FFRæÖöFRÓÓÒ''FæW""ò%DäU%õ4T$4…ôd”ÅDU%2¢$U4”DTåEõ4T$4…ôd”ÅDU%2“°¢6öç7BGfæ6VE6V&6„f–ÇFW'2ÒFVGWT6öç6öÆT—FV×2‡W&Å7FFRæÖöFRÓÓÒ''FæW""ò%DäU%ôEdä4TEõ4T$4…ôd”ÅDU%2¢$U4”DTåEôEdä4TEõ4T$4…ôd”ÅDU%2“°¢6öç7B6V&6…&öÆÇWÆ&VÂÒ6²F†RÖ+rG¶7F—fTf–ÇFW"ÓÓÒ$ÆÂ"ò‡W&Å7FFRæÖöFRÓÓÒ''FæW""ò%'FæW'2"¢%&W6–FVçG2"’¢7F—fTf–ÇFW'Ö°¢6öç7B†4÷VäÖæVÂÐ¢W&Å7FFRçF"ÓÓÒ'72"ÇÀ¢7F—fT&÷GFöÕF"ÓÒ&Ö"ÇÀ¢&ööÆVâ‡6VÆV7FVB’ÇÀ¢&ööÆVâ†6ÇW7FW$G&vW"’ÇÀ¢&ööÆVâ†7F—fU'FæW%æVÂ“°¢6öç7B—46ÆVäÖ6öÖÖæEf–WrÐ¢W&Å7FFRçF"ÓÓÒ&Ö"b`¢7F—fT&÷GFöÕF"ÓÓÒ&Ö"b`¢6VÆV7FVBb`¢6ÇW7FW$G&vW"b`¢7F—fU'FæW%æVÂb`¢7F—fTf–ÇFW"ÓÒ$ÆVvVæG2"b`¢7F—fTf–ÇFW"ÓÒ$Æ—7F–æw2#°¢6öç7B6†÷VÆD6öÆÆ6U6V&6„6öç6öÆRÐ¢6öç6öÆT6öÆÆ6VBÇÀ¢†4÷VäÖæVÂÇÀ¢7F—fTf–ÇFW"ÓÓÒ$ÆVvVæG2"ÇÀ¢7F—fTf–ÇFW"ÓÓÒ$Æ—7F–æw2#°¢6öç7B6†÷t&÷GFöÔæf–vF–öâÒW&Å7FFRæVÖ&VBbb‡W&Å7FFRçF"ÓÓÒ&Ö"ÇÂW&Å7FFRçF"ÓÓÒ'72"ÇÂ&ööÆVâ‡W&Å7FFRçæVÅF"’“°¢W6T&÷GFöÔæf–vF–öävVöÖWG'’‡6†÷t&÷GFöÔæf–vF–öâ“°¢6öç7BÖæVÄæf–vF–öåF—FÆRÒW&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò‡²7F—f—G“¢$7F—f—G’"Â&W÷'G3¢%&W÷'G2"Â6×–vç3¢$6×–vç2"Â–æfó¢%'FæW"wV–FR"Â6—f–3¢$6—f–2"Õ¶7F—fU'FæW%æVÅÒÇÂ7F—fTf–ÇFW"ÇÂ%'FæW"Ö"¢¢‡²W&·3¢%W&·2"ÂWfVçG3¢$WfVçG2"Â6fVC¢%6fVB"Â–æfó¢$wV–FR"Õ¶7F—fT&÷GFöÕF%ÒÇÂ7F—fTf–ÇFW"ÇÂ$F÷vçF÷vâW7F–â"“°¢6öç7B6öæf–wW&TÖö&–ÆUæVÅ7W&f6RÒW6T6ÆÆ&6²‚†æöFR’Óâ°¢–b‚æöFRÇÂG—Vöbv–æF÷rÓÓÒ'VæFVf–æVB"’&WGW&ã°¢òò6æöæ–6ÂÖFWF–Â6†VWG2&Rv÷fW&æVBVçF—&VÇ’'’F†R6†&V@¢òò7G–ÆW6†VWBæB7FFRGG&–'WFW2â6ÆV"ç’ÆVv7’–æÆ–æRvVöÖWG'¢òò&Vf÷&RF†RvVæW&–2æF—fRÖG&vW"fÆÆ&6²6â6Æ–ÒF†R7W&f6Rà¢–b†æöFRæ6Æ74Æ—7Bæ6öçF–ç2‚&GÖÖÖFWF–Â×6†VWB"’’°¢²&–ç6WB"Â'F÷"Â'&–v‡B"Â&&÷GFöÒ"Â&ÆVgB"Â'FF–ær%Òæf÷$V6‚‚‡&÷W'G’’ÓâæöFRç7G–ÆRç&VÖ÷fU&÷W'G’‡&÷W'G’’“°¢&WGW&ã°¢Ð¢–b†æöFRæ6Æ74Æ—7Bæ6öçF–ç2‚&GÖæF—fRÖG&vW""’’°¢æöFRç7G–ÆRç6WE&÷W'G’‚'F÷"Â&WFò"Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚'&–v‡B"Â#"Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚&&÷GFöÒ"Â#"Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚&ÆVgB"Â#"Â&–×÷'FçB"“°¢æöFRç7G–ÆRç6WE&÷W'G’‚'FF–ær"Â#f"‚ÒÖGÖ&÷GFöÒÖæb×F÷FÂÖ†V–v‡B’"Â&–×÷'FçB"“°¢&WGW&ã°¢Ð ¢6öç7B÷væVE&÷W'F–W2Ò°¢'÷6—F–öâ"Â&–ç6WB"Â'F÷"Â'&–v‡B"Â&&÷GFöÒ"Â&ÆVgB"Â'v–GF‚"Â&Ö–â×v–GF‚"Â&Ö‚×v–GF‚"Â&†V–v‡B"Â&Ö–âÖ†V–v‡B"Â&Ö‚Ö†V–v‡B"À¢&F—7Æ’"Â&w&–B×FV×ÆFR×&÷w2"Â&Ö&v–â"Â'FF–ær"Â&÷fW&fÆ÷r"Â&&÷&FW""Â&&÷&FW"×&F—W2"Â&&÷‚×6†F÷r"Â'¢Ö–æFW‚"À¢Ó°¢6öç7BæVÅ&–ÂÒæöFRçVW'•6VÆV7F÷"‚#§66÷RâæG×æVÂ×FööÆ&"Â§66÷RâæG×æVÂÖ†VFW"Â§66÷RâæGÖÖ×æVÂÖ†VFW"Â§66÷RâæGÖÖÖF—&V7F÷'’×FööÆ&""“°¢6öç7BæVÄ&öG’ÒæöFRçVW'•6VÆV7F÷"‚#§66÷RâæG×æVÂÖ&öG’Â§66÷RâæGÖw&÷WVBÖÆ—7BÂ§66÷RâæGÖÖ×æVÂ×67&öÆÂÂ§66÷RâæGÖÖÖF—&V7F÷'’Ö6öçFVçB"“°¢6öç7B6†–ÆD÷væVE&÷W'F–W2Ò²&w&–B×&÷r"Â&w&–BÖ6öÇVÖâ"Â&F—7Æ’"Â&w&–B×FV×ÆFRÖ6öÇVÖç2"Â&Æ–vâÖ—FV×2"Â&&÷‚×6—¦–ær"Â'v–GF‚"Â&Ö–â×v–GF‚"Â&Ö‚×v–GF‚"Â&†V–v‡B"Â&Ö–âÖ†V–v‡B"Â&Ö‚Ö†V–v‡B"Â&Ö&v–â"Â'FF–ær"Â&&÷&FW""Â&&÷&FW"Ö&÷GFöÒ"Â&&6¶w&÷VæB"Â&&÷‚×6†F÷r"Â&÷fW&fÆ÷r×‚"Â&÷fW&fÆ÷r×’%Ó°¢÷væVE&÷W'F–W2æf÷$V6‚‚‡&÷W'G’’ÓâæöFRç7G–ÆRç&VÖ÷fU&÷W'G’‡&÷W'G’’“°¢·æVÅ&–ÂÂæVÄ&öG•Òæf÷$V6‚‚†VÆVÖVçB’Óâ°¢6†–ÆD÷væVE&÷W'F–W2æf÷$V6‚‚‡&÷W'G’’ÓâVÆVÖVçCòç7G–ÆRç&VÖ÷fU&÷W'G’‡&÷W'G’’“°¢Ò“°¢æVÅ&–ÃòçVW'•6VÆV7F÷$ÆÂ‚#§66÷Râ'WGFöâ"’æf÷$V6‚‚†'WGFöâ’Óâ°¢²&w&–BÖ6öÇVÖâ"Â'v–GF‚"Â&Ö–â×v–GF‚"Â&Ö‚×v–GF‚"Â&†V–v‡B"Â&Ö–âÖ†V–v‡B"Â&Ö‚Ö†V–v‡B"Â&Ö&v–â"Â'FF–ær%Òæf÷$V6‚‚‡&÷W'G’’Óâ'WGFöâç7G–ÆRç&VÖ÷fU&÷W'G’‡&÷W'G’’“°¢Ò“°¢6öç7B—4FWF–ÅæVÂÒæöFRæFF6WBçæVÄÆ–÷WBÓÓÒ&FWF–Â#°¢6öç7B—46ö×7Ef–Ww÷'BÒv–æF÷ræÖF6„ÖVF–‚"†Ö‚×v–GFƒ¢scw‚’"’æÖF6†W3°¢6öç7BFWF–Ä†V–v‡BÒ&Ö–âƒs†Gf‚Â6Æ2ƒGf‚Òsg‚ÒVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒÂ‚’’’#°¢6öç7BFWF–Åv–GF‚Ò—46ö×7Ef–Ww÷'Bò#Ggr"¢&Ö–âƒsc‚ÂGgr’#°¢6öç7BæVÄvVöÖWG'’Ò°¢÷6—F–öã¢&f—†VB"À¢–ç6WC¢&WFò"À¢F÷¢—4FWF–ÅæVÂò&WFò"¢#"À¢&–v‡C¢#"À¢&÷GFöÓ¢&6Æ2ƒcG‚²Vçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒÂ‚’’"À¢ÆVgC¢#"À¢v–GFƒ¢—4FWF–ÅæVÂòFWF–Åv–GF‚¢#Ggr"À¢&Ö–â×v–GF‚#¢—4FWF–ÅæVÂò#"¢#Ggr"À¢&Ö‚×v–GF‚#¢—4FWF–ÅæVÂòFWF–Åv–GF‚¢#Ggr"À¢†V–v‡C¢—4FWF–ÅæVÂòFWF–Ä†V–v‡B¢&6Æ2ƒGf‚ÒcG‚ÒVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒÂ‚’’"À¢&Ö–âÖ†V–v‡B#¢—4FWF–ÅæVÂò#"¢&6Æ2ƒGf‚ÒcG‚ÒVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒÂ‚’’"À¢&Ö‚Ö†V–v‡B#¢—4FWF–ÅæVÂòFWF–Ä†V–v‡B¢&6Æ2ƒGf‚ÒcG‚ÒVçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒÂ‚’’"À¢F—7Æ“¢&w&–B"À¢&w&–B×FV×ÆFR×&÷w2#¢&6Æ2ƒSg‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’Ö–æÖ‚ƒÂg"’"À¢Ö&v–ã¢#"À¢FF–æs¢#"À¢÷fW&fÆ÷s¢&†–FFVâ"À¢'¢Ö–æFW‚#¢#S"À¢Ó° ¢ö&¦V7BæVçG&–W2‡æVÄvVöÖWG'’’æf÷$V6‚‚…·&÷W'G’ÂfÇVUÒ’Óâ°¢æöFRç7G–ÆRç6WE&÷W'G’‡&÷W'G’ÂfÇVRÂ&–×÷'FçB"“°¢Ò“° ¢6öç7BÇ”–×÷'FçBÒ†VÆVÖVçBÂ&÷W'F–W2’Óâ°¢ö&¦V7BæVçG&–W2‡&÷W'F–W2’æf÷$V6‚‚…·&÷W'G’ÂfÇVUÒ’ÓâVÆVÖVçCòç7G–ÆRç6WE&÷W'G’‡&÷W'G’ÂfÇVRÂ&–×÷'FçB"’“°¢Ó°¢Ç”–×÷'FçB‡æVÅ&–ÂÂ°¢&w&–B×&÷r#¢#"À¢F—7Æ“¢&w&–B"À¢&w&–B×FV×ÆFRÖ6öÇVÖç2#¢#CG‚Ö–æÖ‚ƒÂg"’CG‚"À¢&Æ–vâÖ—FV×2#¢&6VçFW""À¢&&÷‚×6—¦–ær#¢&&÷&FW"Ö&÷‚"À¢v–GFƒ¢#R"À¢&Ö–â×v–GF‚#¢#"À¢&Ö‚×v–GF‚#¢&æöæR"À¢†V–v‡C¢&6Æ2ƒSg‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’"À¢&Ö–âÖ†V–v‡B#¢&6Æ2ƒSg‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’"À¢&Ö‚Ö†V–v‡B#¢&6Æ2ƒSg‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’"À¢Ö&v–ã¢#"À¢FF–æs¢&6Æ2ƒg‚²Vçb‡6fRÖ&VÖ–ç6WB×F÷Â‚’’‡‚g‚"À¢&÷&FW#¢#"À¢&&÷&FW"Ö&÷GFöÒ#¢#"À¢&6¶w&÷VæC¢'G&ç7&VçB"À¢&&÷‚×6†F÷r#¢&æöæR"À¢Ò“°¢6öç7B&–Ä'WGFöç2ÒæVÅ&–Âò'&’æg&öÒ‡æVÅ&–ÂçVW'•6VÆV7F÷$ÆÂ‚#§66÷Râ'WGFöâ"’’¢µÓ°¢&–Ä'WGFöç2æf÷$V6‚‚†'WGFöâÂ–æFW‚’Óâ°¢Ç”–×÷'FçB†'WGFöâÂ°¢&w&–BÖ6öÇVÖâ#¢–æFW‚ÓÓÒò#"¢–æFW‚ÓÓÒ&–Ä'WGFöç2æÆVæwF‚Òò#2"¢&WFò"À¢v–GFƒ¢#CG‚"À¢&Ö–â×v–GF‚#¢#CG‚"À¢&Ö‚×v–GF‚#¢#CG‚"À¢†V–v‡C¢#CG‚"À¢&Ö–âÖ†V–v‡B#¢#CG‚"À¢&Ö‚Ö†V–v‡B#¢#CG‚"À¢Ö&v–ã¢#"À¢FF–æs¢#"À¢Ò“°¢Ò“°¢Ç”–×÷'FçB‡æVÄ&öG’Â°¢&w&–B×&÷r#¢#""À¢v–GFƒ¢#R"À¢&Ö–â×v–GF‚#¢#"À¢&Ö‚×v–GF‚#¢&æöæR"À¢†V–v‡C¢#R"À¢&Ö–âÖ†V–v‡B#¢#"À¢&Ö‚Ö†V–v‡B#¢&æöæR"À¢Ö&v–ã¢#"À¢&÷fW&fÆ÷r×‚#¢&†–FFVâ"À¢&÷fW&fÆ÷r×’#¢&WFò"À¢Ò“° ¢òòöÆFW"Ö6öçF–æÖVçB7G–ÆW2W6R–çFVçF–öæÆÇ’†–v‚7V6–f–6—G’â–æÆ–æP¢òò&–÷&—G’¶VW2WfW'’7F—fRæVÂöâF†R6ÖRf–Ww÷'B×6fR7W&f6Rà¢6öç7B–ææW$6öçG&öÇ2ÒæöFRçVW'•6VÆV7F÷"‚"æGÖÖ×æVÂ×67&öÆÂæGÖVçF—G’ÖG&vW"âæGÖG&vW"Ö6öçG&öÂ×&÷s¦f—'7BÖ6†–ÆB"“°¢–ææW$6öçG&öÇ3òç7G–ÆRç6WE&÷W'G’‚&F—7Æ’"Â&æöæR"Â&–×÷'FçB"“°¢ÒÂµÒ“° ¢W6TVffV7B‚‚’Óâ°¢6öç7B&Vg&W6„Öö&–ÆUæVÇ2Ò‚’Óâ°¢Fö7VÖVçBçVW'•6VÆV7F÷$ÆÂ‚%¶FFÖÖö&–ÆR×æVÂ×7W&f6SÒwG'VRuÒ"’æf÷$V6‚†6öæf–wW&TÖö&–ÆUæVÅ7W&f6R“°¢Ó°¢&Vg&W6„Öö&–ÆUæVÇ2‚“°¢v–æF÷ræFDWfVçDÆ—7FVæW"‚'&W6—¦R"Â&Vg&W6„Öö&–ÆUæVÇ2“°¢&WGW&â‚’Óâv–æF÷rç&VÖ÷fTWfVçDÆ—7FVæW"‚'&W6—¦R"Â&Vg&W6„Öö&–ÆUæVÇ2“°¢ÒÂ¶6öæf–wW&TÖö&–ÆUæVÅ7W&f6UÒ“° ¢6öç7BVÖ&VDÆöDWfVçD¶W•&VbÒW6U&Vb‚""“°¢6öç7BgVÆÄÖ‡&VbÒW6TÖVÖò‚‚’Óâ°¢6öç7B&×2ÒæWrU$Å6V&6…&×2‡G—Vöbv–æF÷rÓÒ'VæFVf–æVB"òv–æF÷ræÆö6F–öâç6V&6‚¢""“°¢&×2æFVÆWFR‚&VÖ&VB"“°¢&WGW&âöÖòG·&×2çFõ7G&–ær‚—Ö°¢ÒÂ·W&Å7FFRæVÖ&VEÒ“° ¢W6TVffV7B‚‚’Óâ°¢–b‚W&Å7FFRæVÖ&VB’&WGW&ã°¢6öç7BWfVçD¶W’Ò°¢W&Å7FFRæVçF—G”–BÀ¢W&Å7FFRæ6×–vä–BÀ¢W&Å7FFRç'FæW$–BÀ¢W&Å7FFRæ6öÆÆV7F–öâÀ¢W&Å7FFRç&÷WFRÀ¢W&Å7FFRç6÷W&6RÀ¢W&Å7FFRçWFÔ6×–vâÀ¢F—7G&–7BÀ¢Òæ¦ö–â‚'Â"“°¢–b†VÖ&VDÆöDWfVçD¶W•&Vbæ7W'&VçBÓÓÒWfVçD¶W’’&WGW&ã°¢VÖ&VDÆöDWfVçD¶W•&Vbæ7W'&VçBÒWfVçD¶W“°¢f—&Uv÷&¶fÆ÷r‚"ö’öWfVçG2"Â°¢G—S¢&VÖ&VBæÆöFVB"À¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢VçF—G”–C¢W&Å7FFRæVçF—G”–BÇÂVæFVf–æVBÀ¢6×–vä–C¢W&Å7FFRæ6×–vä–BÇÂVæFVf–æVBÀ¢'FæW$–C¢W&Å7FFRç'FæW$–BÇÂVæFVf–æVBÀ¢F—7G&–7C¢—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’òVæFVf–æVB¢F—7G&–7BÀ¢6÷W&6S¢W&Å7FFRç6÷W&6RÀ¢ÖWFFF¢°¢6öÆÆV7F–öä–C¢W&Å7FFRæ6öÆÆV7F–öâÇÂVæFVf–æVBÀ¢&÷WFT–C¢W&Å7FFRç&÷WFRÇÂVæFVf–æVBÀ¢WFÔ6×–vã¢W&Å7FFRçWFÔ6×–vâÇÂVæFVf–æVBÀ¢ÒÀ¢Ò“°¢ÒÂ¶F—7G&–7BÂW&Å7FFRæ6×–vä–BÂW&Å7FFRæ6öÆÆV7F–öâÂW&Å7FFRæVÖ&VBÂW&Å7FFRæVçF—G”–BÂW&Å7FFRç'FæW$–BÂW&Å7FFRç&÷WFRÂW&Å7FFRç6÷W&6RÂW&Å7FFRçWFÔ6×–våÒ“° ¢&WGW&â€¢ÆF—`¢6Æ74æÖS×¶GÖÖ×vR&VÆF—fR‚×67&VVâ÷fW&fÆ÷rÖ†–FFVâ&r×v†—FRFW‡BÕ²3#c35ÒG·W&Å7FFRæÖöFRÓÓÒ''FæW""ò&GÖÖ×vR×'FæW""¢&GÖÖ×vR×&W6–FVçB'ÒG·W&Å7FFRæVÖ&VBò&GÖÖ×vRÖVÖ&VFFVB"¢"'ÖÐ¢FFÖÖ×¦ööÓ×¶Ö¦ööÒçFôf—†VBƒ"—Ð¢FF×F÷ÖÖÖ&6³Ò&fÇ6R ¢à¢·W&Å7FFRæVÖ&VBò€¢Æ†VFW"6Æ74æÖSÒ&GÖVÖ&VBÖÖÖ†VFW"#à¢ÆF—b6Æ74æÖSÒ&GÖVÖ&VBÖÖÖ†VFW%õö'&æB#à¢Ç7G&öæsäF÷vçF÷vâW&·3Â÷7G&öæsà¢Ç7ãç¶7F—fT6öÆÆV7F–öãòçF—FÆRÇÂ†—4ÆÄæV–v†&÷&†ööE66÷R†F—7G&–7B’ò$F÷vçF÷vâW7F–â"¢F—7G&–7B—ÓÂ÷7ãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖVÖ&VBÖÖÖ†VFW%õ÷7VÖÖ'’#à¢Ç7ãç¶6öçFW‡D6÷VçGÒ¶6öçFW‡D6÷VçBÓÓÒò'Æ6R"¢'Æ6W2'ÓÂ÷7ãà¢·W&Å7FFRç6÷W&6RÓÒ&VÖ&VFFVBÖÖ"òÇ7ãäg&öÒ·W&Å7FFRç6÷W&6Rç&WÆ6R‚òÒörÂ""—ÓÂ÷7ãâ¢çVÆÇÐ¢ÂöF—cà¢Æ¢‡&Vc×¶gVÆÄÖ‡&VgÐ¢F&vWCÒ%ö&Ææ² ¢&VÃÒ&æ÷&VfW'&W" ¢öä6Æ–6³×²‚’Óâf—&Uv÷&¶fÆ÷r‚"ö’öWfVçG2"Â°¢G—S¢&VÖ&VBæ÷VæVEögVÆÅöÖ"À¢6W76–öä–C¢vWEv÷&¶fÆ÷u6W76–öä–B‚’À¢6÷W&6S¢W&Å7FFRç6÷W&6RÀ¢6×–vä–C¢W&Å7FFRæ6×–vä–BÇÂVæFVf–æVBÀ¢'FæW$–C¢W&Å7FFRç'FæW$–BÇÂVæFVf–æVBÀ¢ÖWFFF¢²6öÆÆV7F–öä–C¢W&Å7FFRæ6öÆÆV7F–öâÇÂVæFVf–æVBÂ&÷WFT–C¢W&Å7FFRç&÷WFRÇÂVæFVf–æVBÒÀ¢Ò—Ð¢à¢÷VâgVÆÂÖÄ'&÷u&–v‡B&–Ö†–FFVãÒ'G'VR"óà¢Âöà¢Âö†VFW#à¢’¢çVÆÇÐ¢ÆF—b6Æ74æÖSÒ&'6öÇWFR–ç6WB×‚Ó&÷GFöÒÓF÷Ó#à¢ÄvöövÆTÖW'&÷$&÷VæF'“à¢ÄvöövÆTÖ6çf0¢6VçFW#×¶–æ—F–ÄÖf–Wræ6VçFW'Ð¢¦ööÓ×¶–æ—F–ÄÖf–Wrç¦öö×Ð¢Ö&¶W$Æ–÷WE¦ööÓ×¶Ö&¶W$Æ–÷WD6öçFW‡Bç¦öö×Ð¢Ö—FV×3×¶6ÇW7FW&VDÖ—FV×7Ð¢6öÆÆV7F–öå&÷WFS×¶7F—fT6öÆÆV7F–öå&÷WFWÐ¢f—EÆ6W3×¶7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚ò7F—fT6öÆÆV7F–öå&÷WFRç7F÷2¢F—66÷fW$F—7Æ•Æ6W7Ð¢f—D7F—fT¶W“×¶Ö&W7VÇD&÷VæG4¶W—Ð¢f—DVæ&ÆVC×¶†47F—fT6FVv÷'•66÷Rbb—46ÆVå&W6–FVçEW&·4ÆVæ6‚bbW6W$†4æf–vFVDÖbb—57G&VWDÆWfVÄÖf–WwÐ¢6VÆV7FVC×·6VÆV7FVGÐ¢6VÆV7FVD–C×·6VÆV7FVD–GÐ¢VÇ6–æu–ä–C×·VÇ6–æu–ä–GÐ¢öå6VÆV7C×¶7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚òfö7W46öÆÆV7F–öå7F÷¢6VÆV7EÆ6WÐ¢öå6VÆV7DæV&W7DÆVvVæG3×·6VÆV7DæV&W7DÆVvVæG4Æ—7F–æwÐ¢öä6ÇW7FW$÷Vã×¶÷Vä6ÇW7FW$G&vW'Ð¢öå¦ööÔ6†ævS×²†æW‡E¦ööÒ’Óâ6WDÖ¦ööÒ‚†7W'&VçB’Óâ„ÖF‚æ'2†7W'&VçBÒæW‡E¦ööÒ’âãòæW‡E¦ööÒ¢7W'&VçB’—Ð¢öåf–Ww÷'D6†ævS×·WFFUf–Ww÷'D&÷VæG7Ð¢öåW6W$æf–vFS×²‚’Óâ°¢G'’°¢v–æF÷rç6W76–öå7F÷&vRç6WD—FVÒ„ÔõU4U%ôäd”tDTEõ5Dõ$tUô´U’Â'G'VR"“°¢Ò6F6‚°¢òò6W76–öâ7F÷&vR—2&W7BÖVff÷'BöæÇ’à¢Ð¢6WEW6W$†4æf–vFVDÖ‡G'VR“°¢×Ð¢öä'&÷w6UW&·3×²‚’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚%W&·2"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚'W&·2"“°¢æf–vFR‚"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÕW&·2"“°¢×Ð¢óà¢ÂôvöövÆTÖW'&÷$&÷VæF'“à¢ÂöF—cà ¢·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚bb‚6VÆV7FVBÇÂ6VÆV7FVDG&vW$6Æ÷6VBÇÂ&ööÆVâ‡W&Å7FFRæG&vW$6Æ÷6VB’’ò€¢Å&÷WFTW‡W&–Væ6U6†VW@¢&÷WFS×¶7F—fT6öÆÆV7F–öå&÷WFWÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢&÷WFU7FFS×·W&Å7FFRç&÷WFU7FFWÐ¢6VÆV7FVE7F÷–C×·W&Å7FFRç7F÷–BÇÂ6VÆV7FVD–GÐ¢&VÆFVE&÷WFW3×¶7F—fU&VÆFVE&÷WFW7Ð¢öå6VÆV7E7F÷×¶fö7W46öÆÆV7F–öå7F÷Ð¢öä÷Vå7F÷×¶÷Vä6öÆÆV7F–öå7F÷Ð¢öå&–Ö'”7F–öã×·7F'D6öÆÆV7F–öå&÷WFWÐ¢öä÷Vå&VÆFVE&÷WFS×¶÷Vä6öÆÆV7F–öå&÷WFWÐ¢öäW†—C×¶W†—D6öÆÆV7F–öå&÷WFWÐ¢óà¢’¢çVÆÇÐ ¢·W&Å7FFRçF"ÓÓÒ&Ö"bb€¢ÆF—`¢6Æ74æÖSÒ&GÖÖ×6V&6‚Öæ6†÷"ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR–ç6WB×‚ÓF÷Õ³s'…Ò¢Õ³cƒÒ‚Ó"ãRÖC§F÷Õ³ƒ…ÒÖC§‚ÓR ¢à¢ÆF—b6Æ74æÖSÒ&GÖÖ×F÷Öæb#à¢ÄÖ6V&6„6öç6öÆP¢ÖöFS×·W&Å7FFRæÖöFWÐ¢VW'“×·6V&6‡Ð¢Æ6V†öÆFW#×·6V&6…Æ6V†öÆFW'Ð¢7F—fT–çFVçC×·W&Å7FFRæÖöFRÓÓÒ''FæW""òW&Å7FFRæ–çFVçB¢&W6–FVçE6V&6„–çFVçBæ–çFVçGÐ¢7F—fUF–ÖS×·&W6–FVçE6V&6„–çFVçBçF–ÖWÐ¢7F—fU&F—W3×·&F—W7Ð¢7F—fTf–ÇFW#×¶7F—fTf–ÇFW'Ð¢7F—fT6öÆÆV7F–öã×·W&Å7FFRæ6öÆÆV7F–öçÐ¢&W7VÇD6÷VçC×¶ÖÆ6W2æÆVæwF‡Ð¢f—6–&ÆU&W7VÇD–G3×¶ÖÆ6W2æfÆDÖ‚‡Æ6R’Óâ·Æ6Ræ–BÂÆ6RæVçF—G•ö–BÂÆ6RæVçF—G”–EÒ’æf–ÇFW"„&ööÆVâ—Ð¢&WVW7E7FGW3×·66÷VE&WVW7E7FGW7Ð¢Æ7EG&–vvW#×·66÷VDÆ7EG&–vvW'Ð¢6FÆöu7FFS×¶6FÆöu7FFWÐ¢öä6FÆöu&W7VÇE6VÆV7C×·6VÆV7D6FÆöu&W7VÇGÐ¢–çWE&Vc×·6V&6„–çWE&VgÐ¢öåVW'”6†ævS×²‡fÇVR’Óâ°¢6WD6öç6öÆT6öÆÆ6VB†fÇ6R“°¢6WE6V&6‚‡fÇVR“°¢–b†Öç7vW"’6WDÖç7vW"†çVÆÂ“°¢×Ð¢öå7V&Ö—C×²†WfVçB’Óâ°¢fö–B'Vå6V&6‚†WfVçB“°¢×Ð¢öä6ÆV#×¶6ÆV%&W6–FVçE6V&6„–çFVçGÐ¢öä–çFVçE6VÆV7C×¶Ç•&W6–FVçD–çFVçGÐ¢öäf–ÇFW%6VÆV7C×¶Ç•&W6–FVçD6öç6öÆTf–ÇFW'Ð¢öåF–ÖU6VÆV7C×¶Ç•&W6–FVçEF–ÖWÐ¢öå&F—W56VÆV7C×¶Ç•&W6–FVçE&F—W7Ð¢öä6öÆÆV7F–öå6VÆV7C×²†6öÆÆV7F–öâÂ—FVÒ’Óâ÷Vä6öÆÆV7F–öå&÷WFR†6öÆÆV7F–öâÂ—FVÓòç&ö×BÇÂ—FVÓòæÆ&VÂÇÂ""—Ð¢öå&ö×E6VÆV7C×²‡&ö×B’Óâ°¢6WE&W6–FVçE6V&6„–çFVçB‡²–çFVçC¢çVÆÂÂF–ÖS¢çVÆÂÒ“°¢fö–BÇ•&ö×B‡&ö×B“°¢×Ð¢öäÖöFT6†ævS×²†ÖöFR’Óâ°¢–b†ÖöFRÓÓÒW&Å7FFRæÖöFR’&WGW&ã°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢6WE6V&6‚‚""“°¢6WD7F—fTf–ÇFW"‚$ÆÂ"“°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6ÆV%66÷VDÖ&W7VÇG2‚“°¢W&Å7FFRçWFFR‡°¢ÖöFRÀ¢F#¢&Ö"À¢f–ÇFW#¢$ÆÂ"À¢VW'“¢""À¢¢""À¢&ö×C¢""À¢–çFVçC¢""À¢VçF—G”–C¢""À¢VçF—G•G—S¢""À¢6öÆÆV7F–öã¢""À¢Ò“°¢×Ð¢—46öÆÆ6VC×·6†÷VÆD6öÆÆ6U6V&6„6öç6öÆWÐ¢öä6öÆÆ6S×²‚’Óâ6WD6öç6öÆT6öÆÆ6VB‡G'VR—Ð¢öäW‡æC×²‚’Óâ6WD6öç6öÆT6öÆÆ6VB†fÇ6R—Ð¢†5F÷Ö&6³×¶fÇ6WÐ¢óà¢ÂöF—cà¢ÂöF—cà¢—Ð ¢·W&Å7FFRçF"ÓÓÒ'72"bbW&Å7FFRæÖöFRÓÓÒ''FæW""bb€¢ÆF—b6Æ74æÖSÒ'ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR–ç6WBÓ¢Õ³SCÒfÆW‚—FV×2ÖVæB§W7F–g’Ö6VçFW"&rÕ²3#c35ÒóÓ"&6¶G&÷Ö&ÇW"Õ³'…Ò6Ó§ÓBÖC¦—FV×2Ö6VçFW"#à¢ÆÖ÷F–öâç6V7F–öà¢–æ—F–Ã×·²÷6—G“¢Â“¢#BÂ66ÆS¢ã“‚×Ð¢æ–ÖFS×·²÷6—G“¢Â“¢Â66ÆS¢×Ð¢6Æ74æÖSÒ&G×æVÂ×6†VÆÂG×72×æVÂö–çFW"ÖWfVçG2ÖWFòfÆW‚Ö‚Ö‚Õ¶6Æ2ƒGf‚Ó'‚•ÒrÖgVÆÂÖ‚×r×†ÂfÆW‚Ö6öÂ÷fW&fÆ÷rÖ†–FFVâ&÷VæFVB×BÕ³'…ÒÓÖC¦Ö‚Ö‚Õ¶6Æ2ƒGf‚Ó'&VÒ•ÒÖC§&÷VæFVBÕ³'…Ò ¢&öÆSÒ&F–Æör ¢&–ÖÖöFÃÒ'G'VR ¢&–ÖÆ&VÃÒ%'FæW"66ææW" ¢à¢ÆF—b6Æ74æÖSÒ&G×æVÂÖ†VFW"fÆW‚6‡&–æ²Ó—FV×2Ö6VçFW"§W7F–g’Ö&WGvVVâvÓ"‚Ó2’Ó"6Ó§‚ÓBÖC§’Ó"ãR#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶vô&6µFôÖÒ6Æ74æÖSÒ&G×æVÂÖ&6²"&–ÖÆ&VÃÒ$&6²FòÖ#à¢Ä'&÷tÆVgB6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢Âö'WGFöãà¢Ç7â6Æ74æÖSÒ&G×æVÂÖ†VFW"×F—FÆRFW‡BÕ³—…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãFVÕÒFW‡BÕ²4$dCdÒÖC§FW‡BÕ³…ÒÖC§G&6¶–ærÕ³ãfVÕÒ#à¢'FæW"66ææW ¢Â÷7ãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ7v—F6„ÖöFR‡W&Å7FFRæÖöFRÂ&Ö"—Ò6Æ74æÖSÒ&G×æVÂÖ6Æ÷6R–æÆ–æRÖfÆW‚‚Ó‚rÓ‚—FV×2Ö6VçFW"§W7F–g’Ö6VçFW"&÷VæFVBÕ³'…Òfö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒÖC¦‚Ó’ÖC§rÓ’"&–ÖÆ&VÃÒ$6Æ÷6R#à¢Å‚6Æ74æÖSÒ&‚ÓBrÓB"óà¢Âö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&G×72×æVÂÖ&öG’Ö–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷r×’ÖWFò‚Ó"ãR"Õ¶6Æ2ƒ&VÒ¶Vçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ’•ÒBÓ"6Ó§‚ÓBÖC§"ÓBÖC§BÓ2#à¢ÆF—b6Æ74æÖSÒ'‚Ó2BÓ6Ó§‚Ó2#à¢Ç6Æ74æÖSÒ'FW‡BÕ³—…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ãFVÕÒFW‡BÕ²4$dCdÒÖC§FW‡BÕ³…ÒÖC§G&6¶–ærÕ³ãfVÕÒ#å"fW&–f–6F–öãÂ÷à¢Æƒ"6Æ74æÖSÒ&×BÓFW‡BÕ³#'…ÒföçB×6VÖ–&öÆBÆVF–ærÖæöæRG&6¶–ærÕ²Óã#VVÕÒFW‡BÕ²3#c35ÒÖC¦×BÓãRÖC§FW‡BÕ³#W…Ò#å66â&W6–FVçB73Âöƒ#à¢Ç6Æ74æÖSÒ&×BÓãRFW‡BÕ³'…ÒÆVF–ærÓRFW‡BÕ²3C#SCceÒ#à¢6†V6²VÆ–v–&–Æ—G’Â&Wf–WrF†RW&²ÂæB&V6÷&BF†R&W7VÇBà¢Â÷à¢ÂöF—cà¢Å'FæW%%66ææW ¢öåfW&–f–VC×²‚’Óâ°¢6WE75&W6VçFVB‡G'VR“°¢×Ð¢óà¢ÆF—b6Æ74æÖSÒ&×BÓ2fÆW‚vÓ2÷fW&fÆ÷r×‚ÖWFò"Ó#à¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâæf–vFR‚"ö6&B"—Ò6Æ74æÖSÒ&G×72Ö7F–öâ#å&W6–FVçB73Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ7v—F6„ÖöFR‚''FæW""Â&Ö"—Ò6Æ74æÖSÒ&G×72Ö7F–öâ#å'FæW"ÖÂö'WGFöãà¢ÂöF—cà¢ÂöF—cà¢ÂöÖ÷F–öâç6V7F–öãà¢ÂöF—cà¢—Ð ¢·W&Å7FFRçF"ÓÓÒ'72"bbW&Å7FFRæÖöFRÓÒ''FæW""bb€¢ÆF—b6Æ74æÖSÒ'ö–çFW"ÖWfVçG2ÖæöæR'6öÇWFR–ç6WBÓ¢Õ³SCÒfÆW‚—FV×2ÖVæB§W7F–g’Ö6VçFW"Ó"6Ó§ÓBÖC¦—FV×2Ö6VçFW"#à¢ÄÖ6†VW@¢f&–çCÒ'&W6–FVçBÖ6&B ¢&–Æ&VÃÒ%&W6–FVçB66W726&B ¢öä&6³×¶vô&6µFôÖÐ¢öä6Æ÷6S×²‚’Óâ7v—F6„ÖöFR‡W&Å7FFRæÖöFRÂ&Ö"—Ð¢6Æ74æÖSÒ&G×&W6–FVçBÖ6&B×6†VWBö–çFW"ÖWfVçG2ÖWFò ¢à¢ÆF—b6Æ74æÖSÒ&GÖÖ×6†VWBÖ†æFÆR"&–Ö†–FFVãÒ'G'VR"óà¢ÄÖ6†VWEFööÆ& ¢W–V'&÷sÒ%$U4”DTåB4$B ¢öä&6³×¶vô&6µFôÖÐ¢öä6Æ÷6S×²‚’Óâ7v—F6„ÖöFR‡W&Å7FFRæÖöFRÂ&Ö"—Ð¢óà¢ÆF—b6Æ74æÖSÒ&GÖÖ×6†VWB×67&öÆÂ#à¢²—4WF†VçF–6FVBbb—4ÆöF–ætWF‚ò€¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W6–FVçBÖ6&BÖ–FVçF—G’G×&W6–FVçBÖ6&BÖ–FVçF—G’Ò×6–væVBÖ÷WB#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂÖW–V'&÷r#å$U4”DTåB44U53Â÷à¢Æƒ"6Æ74æÖSÒ&GÖÖ×æVÂ×F—FÆR#å6–vâ–âFò–÷W"&W6–FVçB6&BãÂöƒ#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂ×7V'F—FÆR#å6VR–÷W"ÖVÖ&W'6†—Â†öÖR&÷W'G’Â6fVBÆ6W2ÂæBöæR×F–ÖR"72–âöæR6V7W&Rf–WrãÂ÷à¢Â÷6V7F–öãà¢’¢çVÆÇÐ¢¶—4ÆöF–ætWF‚ò€¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W6–FVçBÖ6&BÖ–FVçF—G’"&öÆSÒ'7FGW2#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂÖW–V'&÷r#å$U4”DTåB44U53Â÷à¢Æƒ"6Æ74æÖSÒ&GÖÖ×æVÂ×F—FÆR#ä6†V6¶–ær–÷W"66÷VçBãÂöƒ#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂ×7V'F—FÆR#å–÷W"&W6–FVçBFWF–Ç2v–ÆÂV"†W&Rv†VâF†W’&R&VG’ãÂ÷à¢Â÷6V7F–öãà¢’¢çVÆÇÐ¢¶—4WF†VçF–6FVBò€¢Ãà¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W6–FVçBÖ6&BÖ–FVçF—G’#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂÖW–V'&÷r#å$U4”DTåB44U53Â÷à¢Æƒ"6Æ74æÖSÒ&GÖÖ×æVÂ×F—FÆR#ç·&W6–FVçD66÷VçCòægVÆÄæÖRÇÂ%–÷W"F÷vçF÷vâ6&B'ÓÂöƒ#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂ×7V'F—FÆR#à¢·&W6–FVçD66÷VçCòæ'V–ÆF–ætæÖRòG·&W6–FVçD66÷VçBæ'V–ÆF–ætæÖWÒ—26öææV7FVBFòF†—2&W6–FVçB6&Bæ¢%W6R–÷W"6&Bv†Vâ'F–6—F–ærÆ6R÷"WfVçB6·2Fò6öæf—&Ò&W6–FVçB66W72â'Ð¢Â÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖS×¶GÖ6&BÖ7&VFVçF–ÂG·75&W6VçFVBò&—2×&VG’"¢"'ÖÒ&–ÖÆ&VÃÒ%&W6–FVçB"6öFR#à¢ÆF—b6Æ74æÖSÒ&GÖ6&BÖ7&VFVçF–ÂÖ†VFW"#à¢Ç7â6Æ74æÖSÒ&GÖ6&BÖ7&VFVçF–ÂÖ¶–6¶W"#ç·&W6–FVçD66÷VçE7FGW2‡&W6–FVçD66÷VçB’çFõWW$66R‚—ÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖ6&BÖ7&VFVçF–Â×7FGW2#ç·75&W6VçFVBò%66ææVB"¢%&VG’'ÓÂ÷7ãà¢ÂöF—cà¢Æƒ26Æ74æÖSÒ&GÖ6&BÖ7&VFVçF–Â×F—FÆR#ç·&W6–FVçD66÷VçCòæ'V–ÆF–ætæÖRÇÂ&W6–FVçD66÷VçCòæ'V–ÆF–ætF—7G&–7BÇÂ$F÷vçF÷vâW7F–â'ÓÂöƒ3à¢Ç6Æ74æÖSÒ&GÖ6&BÖ7&VFVçF–ÂÖ6÷’#à¢·75&W6VçFVBò%&W6–FVçB66W72—26öæf—&ÖVBf÷"F†—2f—6—Bâ"¢%6†÷rF†—2"6öFRv†Vâ'F–6—F–ær'FæW"6·2Fò6öæf—&Ò&W6–FVçB66W72â'Ð¢Â÷à¢ÆF—b6Æ74æÖSÒ&GÖ6&B×"×w&#ãÄFVÖõ$6öFR6öFS×·&W6–FVçD6&E–ÆöBç%fÇVWÒ6Æ74æÖSÒ&GÖ6&B×"Ö–ÖvR"óãÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖ6&B×66âÖFVÖò"&–ÖÆ—fSÒ'öÆ—FR#à¢Ç7ãç·75&W6VçFVBò%&W6–FVçB66W726öæf—&ÖVB"¢%&VG’v†Vâ'FæW"6·2'ÓÂ÷7ãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×·&W6VçE&W6–FVçE77Óç·75&W6VçFVBò%6†÷rv–â"¢%6†÷r"'ÓÂö'WGFöãà¢ÂöF—cà¢ÆF—b6Æ74æÖSÒ&GÖ6&B×fW&–f–6F–öâ×&÷r#à¢Ç7ãç·&W6–FVçD66÷VçE7FGW2‡&W6–FVçD66÷VçB—×·&W6–FVçD66÷VçCòæ'V–ÆF–ætæÖRò+rG·&W6–FVçD66÷VçBæ'V–ÆF–ætæÖWÖ¢"'ÓÂ÷7ãà¢Æ6öFSç·&W6–FVçD6&E–ÆöBçV–GÓÂö6öFSà¢ÂöF—cà¢Â÷6V7F–öãà ¢ÄÖæVÄÖG&—‚Æ&VÃÒ%”õU"44õTåB#à¢ÄÖæVÄÖG&—…&÷rÆ&VÃÒ$æÖR"fÇVS×·&W6–FVçD66÷VçCòægVÆÄæÖRÇÂW6W#òægVÆÅöæÖRÇÂW6W#òæVÖ–ÂÇÂ%&W6–FVçB'Òóà¢ÄÖæVÄÖG&—…&÷rÆ&VÃÒ$VÖ–Â"fÇVS×·&W6–FVçD66÷VçCòæVÖ–ÂÇÂW6W#òæVÖ–ÂÇÂ$æ÷BFFVB'Òóà¢ÄÖæVÄÖG&—…&÷rÆ&VÃÒ$†öÖR"fÇVS×·&W6–FVçD66÷VçCòæ'V–ÆF–ætæÖRÇÂ$æ÷B6öææV7FVB'Òóà¢ÄÖæVÄÖG&—…&÷rÆ&VÃÒ%7FGW2"fÇVS×·&W6–FVçD66÷VçE7FGW2‡&W6–FVçD66÷VçB—Òóà¢ÄÖæVÄÖG&—…&÷rÆ&VÃÒ%&VæWvÂ"fÇVS×·&W6–FVçD66÷VçCòç&VæWvÄFFRÇÂ&W6–FVçD66÷VçCòæW‡—&W4BÇÂ$æò&VæWvÂFFR'Òóà¢ÂôÖæVÄÖG&—ƒà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÖ×æVÂ×6V7F–öâGÖÖ×æVÂ×6V7F–öâÒÖ6ö×7B"&–ÖÆ&VÃÒ$7W'&VçB66W72#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂ×6V7F–öâÖÆ&VÂ#åt„B”õR4âU4SÂ÷à¢Æƒ26Æ74æÖSÒ&GÖÖ×æVÂ×6V7F–öâ×F—FÆR#å&W6–FVçB&VæVf—G2æV&'“Âöƒ3à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂÖ&öG’Ö6÷’#ä÷Vâ'F–6—F–ærW&²Fò&Wf–Wr—G27W'&VçBFW&×2ÂF†Vâ6†÷röæR×F–ÖR"v†VâF†R'FæW"6·2ãÂ÷à¢Â÷6V7F–öãà ¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÖ×æVÂÖæ÷FR#à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂ×6V7F–öâÖÆ&VÂ#ä%T”ÄD”ärÔTÔ$U%4„•Â÷à¢Ç6Æ74æÖSÒ&GÖÖ×æVÂÖ&öG’Ö6÷’#ä–b–÷W"'V–ÆF–ær—2â7F—fRF÷vçF÷vâW&·2÷"DäÖVÖ&W"ÂVÆ–v–&ÆR&W6–FVçB66W72—2–æ6ÇVFVBWFöÖF–6ÆÇ’ãÂ÷à¢Â÷6V7F–öãà¢Âóà¢’¢çVÆÇÐ¢ÂöF—cà¢Æfö÷FW"6Æ74æÖSÒ&GÖÖ×6†VWBÖ7F–öâÖfö÷FW"#à¢¶—4WF†VçF–6FVBò€¢Ãà¢ÄÖæVÄ'WGFöâ7F–öãÒ&÷VâÖFWF–Â"Æ&VÃ×·75&W6VçFVBò$6öæf—&ÖVB"¢%6†÷r"'Ò&–Æ&VÃ×·75&W6VçFVBò%6†÷r6öæf—&ÖVB&W6–FVçB"v–â"¢%6†÷r&W6–FVçB"6öFR'Òf&–çCÒ'&–Ö'’"öå&W73×·&W6VçE&W6–FVçE77Òóà¢ÆF—b6Æ74æÖSÒ&GÖÖ×6†VWBÖ7F–öâÖw&–B#à¢ÄÖæVÄ'WGFöâ7F–öãÒ&÷VâÖFWF–Â"Æ&VÃÒ%&öf–ÆR"&–Æ&VÃÒ$÷Vâ&W6–FVçB&öf–ÆR"f&–çCÒ'6V6öæF'’"öå&W73×²‚’Óâæf–vFR‚"÷&W6–FVçBö†öÖS÷æVÃÖ6&B"—Òóà¢ÄÖæVÄ'WGFöâ7F–öãÒ&÷VâÖFWF–Â"Æ&VÃÒ$FBvÆÆWB"&–Æ&VÃ×·vÆÆWDFFVBò$FBvÆÆWBÇ&VG’6ö×ÆWFVB"¢$FB6&BFòvÆÆWB'Òf&–çCÒ'6V6öæF'’"öå&W73×·6fU&W6–FVçE74f÷$ÆFW'Òóà¢ÂöF—cà¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×&W6–FVçBÖ6&B×6–væ÷WB"öä6Æ–6³×²‚’ÓâÆöv÷WB‡G'VRÂ"÷&W6–FVçG2öÆöv–â"—Óå6–vâ÷WCÂö'WGFöãà¢Âóà¢’¢—4ÆöF–ætWF‚ò€¢ÆF—b6Æ74æÖSÒ&GÖÖ×6†VWBÖ7F–öâÖw&–B#à¢ÄÖæVÄ'WGFöâ7F–öãÒ&÷VâÖFWF–Â"Æ&VÃÒ%6–vâ–â"&–Æ&VÃÒ%6–vâ–âFò&W6–FVçB66W72"f&–çCÒ'&–Ö'’"öå&W73×²‚’Óâæf–vFR†÷&W6–FVçG2öÆöv–ã÷&WGW&åFóÒG¶Væ6öFUU$”6ö×öæVçB‚"öÖöÖöFS×&W6–FVçBgF#×72"—Ö—Òóà¢ÄÖæVÄ'WGFöâ7F–öãÒ&÷VâÖFWF–Â"Æ&VÃÒ$7&VFR66÷VçB"&–Æ&VÃÒ$7&VFR&W6–FVçB66÷VçB"f&–çCÒ'6V6öæF'’"öå&W73×²‚’Óâæf–vFR‚"÷&W6–FVçG2öÖVÖ&W'6†—"—Òóà¢ÂöF—cà¢’¢çVÆÇÐ¢Âöfö÷FW#à¢ÂôÖ6†VWCà¢ÂöF—cà¢—Ð  ’·6†÷t&÷GFöÔæf–vF–öâbb€¢ÆF—bFFÖGÖ&÷GFöÒÖæf–vF–öãÒ'G'VR"6Æ74æÖSÒ&GÖæF—fRÖ&÷GFöÒÖæbGÖÖÖ&÷GFöÒÖæb×6†VÆÂö–çFW"ÖWfVçG2ÖæöæRf—†VB–ç6WB×‚Ó&÷GFöÒÓ¢Õ³sÒ"Õ¶Vçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ•Ò#à¢Ææ`¢6Æ74æÖSÒ&GÖæF—fRÖ&÷GFöÒÖæbÖÆ—7BGÖÖÖ&÷GFöÒÖæbö–çFW"ÖWfVçG2ÖWFòw&–Bw&–BÖ6öÇ2ÓR ¢&–ÖÆ&VÃÒ$Ö&÷GFöÒæf–vF–öâ ¢&öÆSÒ'F&Æ—7B ¢7G–ÆS×·²"ÒÖGÖ&÷GFöÒÖæbÖ6÷VçB#¢R×Ð¢à¢·W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb€¢Ãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ$Ö ¢öä6Æ–6³×²‚’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚$ÆÂ"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢æf–vFR‚"öÖöÖöFS×&W6–FVçBgF#ÖÖff–ÇFW#ÔÆÂ"“°¢×Ð¢&–×&W76VC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&Ö"bb7F—fTf–ÇFW"ÓÓÒ$ÆÂ'Ð¢&–×6VÆV7FVC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&Ö"bb7F—fTf–ÇFW"ÓÓÒ$ÆÂ'Ð¢à¢ÄÖ–â6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#äÖÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ%W&·2 ¢öä6Æ–6³×²‚’Óâ°¢–b†7F—fT&÷GFöÕF"ÓÓÒ'W&·2"bb6VÆV7FVD–B’°¢WFFT7F—fUW&·4G&vW%7FFR†7F—fUW&·4G&vW%7FFRÓÓÒ'VV²"ò&W‡æFVB"¢'VV²"“°¢&WGW&ã°¢Ð¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚%W&·2"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚'W&·2"“°¢WFFT7F—fUW&·4G&vW%7FFR‚&W‡æFVB"“°¢æf–vFR‚"öÖöÖöFS×&W6–FVçBgF#×W&·2ff–ÇFW#ÕW&·2"“°¢×Ð¢&–×&W76VC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ'W&·2'Ð¢&–×6VÆV7FVC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ'W&·2'Ð¢à¢Äv–gB6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#åW&·3Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ$WfVçG2 ¢öä6Æ–6³×²‚’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚$WfVçG2"“°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚&WfVçG2"“°¢æf–vFR‚"öÖöÖöFS×&W6–FVçBgF#ÖWfVçG2ff–ÇFW#ÔWfVçG2"“°¢×Ð¢&–×&W76VC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&WfVçG2'Ð¢&–×6VÆV7FVC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&WfVçG2'Ð¢à¢Å7&¶ÆW26Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#äWfVçG3Â÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ%6fVB ¢öä6Æ–6³×²‚’Óâ°¢6WD6öç6öÆT6öÆÆ6VB‡G'VR“°¢6WD7F—fT&÷GFöÕF"‚'6fVB"“°¢æf–vFR‚"öÖöÖöFS×&W6–FVçBgF#×6fVBff–ÇFW#Õ6fVB"“°¢×Ð¢&–×&W76VC×¶7F—fT&÷GFöÕF"ÓÓÒ'6fVB'Ð¢&–×6VÆV7FVC×¶7F—fT&÷GFöÕF"ÓÓÒ'6fVB'Ð¢à¢Ä&öö¶Ö&²6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#å6fVCÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöâG—SÒ&'WGFöâ"&öÆSÒ'F""&–ÖÆ&VÃÒ$6&B"öä6Æ–6³×²‚’Óâ7v—F6„ÖöFR‚'&W6–FVçB"Â'72"—Ò&–×6VÆV7FVC×·W&Å7FFRçF"ÓÓÒ'72'Óà¢Ä7&VF—D6&B6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#ä6&CÂ÷7ãà¢Âö'WGFöãà¢Âóà¢—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb€¢Ãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ$†öÖR ¢öä6Æ–6³×²‚’Óâæf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B‚"÷'FæW"×v÷&·76Rö÷fW'f–Wr"Â&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚’’—Ð¢&–×6VÆV7FVC×¶fÇ6WÐ¢à¢Ä'&–Vf66T'W6–æW726Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#ä†öÖSÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ$Ö ¢öä6Æ–6³×²‚’Óâ÷Vå'FæW$Ö‚$ÆÂ"—Ð¢&–×&W76VC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&Ö'Ð¢&–×6VÆV7FVC×·W&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ&Ö'Ð¢à¢ÄÖ–â6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#äÖÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ%V&Æ—6‚ ¢öä6Æ–6³×²‚’Óâæf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B‚"÷'FæW"×v÷&·76R÷V&Æ—6‚"Â&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚’’—Ð¢&–×6VÆV7FVC×¶fÇ6WÐ¢à¢ÄÖVv†öæR6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#åV&Æ—6ƒÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ%W&f÷&Öæ6R ¢öä6Æ–6³×²‚’Óâæf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B‚"÷'FæW"×v÷&·76R÷W&f÷&Öæ6R"Â&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚’’—Ð¢&–×6VÆV7FVC×¶fÇ6WÐ¢à¢Ä7F—f—G’6Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#åW&f÷&Öæ6SÂ÷7ãà¢Âö'WGFöãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢&öÆSÒ'F" ¢&–ÖÆ&VÃÒ%v÷&·76R ¢öä6Æ–6³×²‚’Óâæf–vFR‡v—F…'FæW%v÷&·76T6öçFW‡B‚"÷'FæW"×v÷&·76R÷v÷&·76R"Â&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚’’—Ð¢&–×6VÆV7FVC×¶fÇ6WÐ¢à¢Ä'&–Vf66T'W6–æW726Æ74æÖSÒ&‚ÓBrÓB"óà¢Ç7â6Æ74æÖSÒ&GÖæF—fR×F"ÖÆ&VÂ#åv÷&·76SÂ÷7ãà¢Âö'WGFöãà¢Âóà¢—Ð¢Âöæcà¢ÂöF—cà¢—Ð ¢·W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bbW&Å7FFRçF"ÓÓÒ&Ö"bb7F—fT&÷GFöÕF"ÓÓÒ'W&·2"bb6VÆV7FVBbb€¢Ä7F—fUW&·56†VW@¢—FV×3×¶7F—fUW&´—FV×7Ð¢G&vW%7FFS×¶7F—fUW&·4G&vW%7FFWÐ¢6fVD–G3×·6fVD–G7Ð¢&VFVVÖVD–G3×·&VFVVÖVEW&´–G7Ð¢–æ—F–Å67&öÆÅF÷×·VVµæVÅ7FFR‚“òç67&öÆÅF÷ÇÂÐ¢öäG&vW%7FFT6†ævS×·WFFT7F—fUW&·4G&vW%7FFWÐ¢öä6Æ÷6S×¶6Æ÷6T7F—fUW&·56†VWGÐ¢öä÷Vã×¶÷Vä7F—fUW&´—FV×Ð¢öå&VFVVÓ×²†—FVÒ’Óâ÷Vå&W6–FVçE$ÖöFÂ†—FVÒçÆ6RÂ'W6U÷W&²"Â&7F—fU÷W&·5÷6†VWB"—Ð¢öå6fS×²†—FVÒ’ÓâFövvÆU6fVB†—FVÒçÆ6R—Ð¢óà¢—Ð ¢Äæ–ÖFU&W6Væ6Sà¢²‡W&Å7FFRçF"ÓÓÒ&Ö"ÇÂ&ööÆVâ‡W&Å7FFRçæVÅF"’’bb€¢W&Å7FFRæÖöFRÓÓÒ''FæW" ¢ò&ööÆVâ†7F—fU'FæW%æVÂ’ÇÂ—4ÆVvVæG4F—&V7F÷'”Æ–W ¢¢²'W&·2"Â&WfVçG2"Â'6fVB"Â&–æfò%Òæ–æ6ÇVFW2†7F—fT&÷GFöÕF"’ÇÂ—5&VçFÄÆ–W"ÇÂ—4ÆVvVæG4F—&V7F÷'”Æ–W ¢’bb‡W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb7F—fT&÷GFöÕF"ÓÓÒ'W&·2"’bb‚6VÆV7FVBÇÂ6VÆV7FVDG&vW$6Æ÷6VBÇÂ7F—fU'FæW%æVÂ’bb€¢ÆÖ÷F–öâæ6–FP¢&Vc×¶6öæf–wW&TÖö&–ÆUæVÅ7W&f6WÐ¢–æ—F–Ã×·²÷6—G“¢Â“¢CB×Ð¢æ–ÖFS×·²÷6—G“¢Â“¢×Ð¢W†—C×·²÷6—G“¢Â“¢CB×Ð¢G&ç6—F–öã×·²GW&F–öã¢ã#BÂV6S¢³ã#"ÂÂã3bÂÒ×Ð¢6Æ74æÖS×¶—4ÆVvVæG4F—&V7F÷'”Æ–W ¢ò&GÖæF—fRÖG&vW"GÖÖÖF—&V7F÷'’×6†VWBGÖÆVvVæG2ÖF—&V7F÷'’×6†VWB ¢¢GÖæF—fRÖG&vW"G×æVÂ×6†VÆÂGÖÖÖG&vW"×6†VÆÂG¶—5&W6–FVçE6fVDG&vW"ò&G×6fVBÖG&vW"×6†VÆÂ"¢"'ÒG¶—5&W6–FVçDWfVçG4G&vW"ò&G×&W6–FVçBÖWfVçG2ÖG&vW""¢"'ÒG¶7F—fU'FæW%æVÂÓÓÒ&6×–vç2"ò&GÖÖÖ6×–vâÖG&vW""¢"'ÒG¶7F—fU'FæW%æVÂÓÓÒ'&W÷'G2"ò&GÖÖ×&W÷'G2ÖG&vW""¢"'Ò'6öÇWFR–ç6WB×‚Ó&÷GFöÒÓ¢Õ³c#Ò×‚ÖWFòfÆW‚Ö‚Ö‚Õ¶Ö–âƒƒ†Gf‚Æ6Æ2ƒGf‚Ós'‚’•ÒÖ–âÖ‚ÓrÖgVÆÂÖ‚×rÓ7†ÂfÆW‚Ö6öÂ÷fW&fÆ÷rÖ†–FFVâ&÷VæFVB×BÕ³'…ÒÓ2"Õ¶6Æ2ƒãsW&VÒ¶Vçb‡6fRÖ&VÖ–ç6WBÖ&÷GFöÒ’•ÒÖC¦Ö‚Ö‚Õ³cFGf…ÒÖC§&÷VæFVB×BÕ³'…ÖÐ¢7G–ÆS×´ÔôE$tU%õ5U$d4Uõ5E”ÄWÐ¢FFÖG&vW"×7FFS×¶—5&W6–FVçDWfVçG4G&vW"ò&gVÆÂ"¢&W‡æFVB'Ð¢FFÖÖö&–ÆR×æVÂ×7W&f6SÒ'G'VR ¢&öÆSÒ&F–Æör ¢&–ÖÖöFÃÒ'G'VR ¢&–ÖÆ&VÃ×¶—4ÆVvVæG4F—&V7F÷'”Æ–W"ò$ÆVvVæG2&VÂW7FFRÆ—7F–æw2"¢W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ'&W÷'G2"ò%'FæW"Ö&W÷'G2"¢W&Å7FFRæÖöFRÓÓÒ''FæW""ò%'FæW"Ö&W7VÇG2"¢$Ö&W7VÇG2'Ð¢à¢ÆF—b6Æ74æÖS×¶—4ÆVvVæG4F—&V7F÷'”Æ–W"ò&GÖÖÖF—&V7F÷'’×FööÆ&""¢&G×æVÂ×FööÆ&"Ö"Ó"fÆW‚6‡&–æ²Ó—FV×2Ö6VçFW"§W7F–g’Ö&WGvVVâvÓ"ÖC¦Ö"Ó2ÖC¦vÓ2'Óà¢¶—4ÆVvVæG4F—&V7F÷'”Æ–W"ò€¢Ãà¢ÄÖæVÄ'WGFöâ7F–öãÒ&&6²"Æ&VÃÒ$Ö"&–Æ&VÃÒ%&WGW&âFòÖ"f&–çCÒ'6V6öæF'’"6—¦SÒ'6Ò"6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’Ö&6²"öå&W73×¶6Æ÷6TF—&V7F÷'•FôÖÓà¢Ä'&÷tÆVgB6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢ÂôÖæVÄ'WGFöãà¢ÄÖæVÄ'WGFöâ7F–öãÒ&6Æ÷6R"Æ&VÃÒ$6Æ÷6R"&–Æ&VÃÒ$6Æ÷6RÆVvVæG2&VÂW7FFRÆ—7F–æw2æVÂ"f&–çCÒ&–6öâ"6—¦SÒ'6Ò"6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’Ö6Æ÷6R"öå&W73×¶6Æ÷6TF—&V7F÷'•FôÖÓà¢Å‚6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢ÂôÖæVÄ'WGFöãà¢Âóà¢’¢€¢Ãà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×¶vô&6µFôÖÒ6Æ74æÖSÒ&G×æVÂÖ&6²"&–ÖÆ&VÃÒ$&6²FòÖ#à¢Ä'&÷tÆVgB6Æ74æÖSÒ&‚ÓBrÓB"&–Ö†–FFVãÒ'G'VR"óà¢Âö'WGFöãà¢Ç7â6Æ74æÖSÒ&G×æVÂ×FööÆ&"×F—FÆR#ç¶ÖæVÄæf–vF–öåF—FÆWÓÂ÷7ãà¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×¶vô&6µFôÖÐ¢6Æ74æÖSÒ&G×æVÂÖ6Æ÷6RfÆW‚‚Ó‚rÓ‚&÷VæFVBÕ³‡…Òfö7W2×f—6–&ÆS¦÷WFÆ–æRÖæöæRfö7W2×f—6–&ÆS§&–ærÓ"fö7W2×f—6–&ÆS§&–ærÕ²4$dCdÒÖC¦‚Ó’ÖC§rÓ’ ¢&–ÖÆ&VÃ×·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ'&W÷'G2"ò$6Æ÷6R&W÷'G2"¢$6Æ÷6R'Ð¢à¢Å‚6Æ74æÖSÒ&‚ÓBrÓB"óà¢Âö'WGFöãà¢Âóà¢—Ð¢ÂöF—cà ¢ÆF—`¢6Æ74æÖS×¶G×æVÂÖ&öG’G×æVÂ×67&öÆÂÖ–âÖ‚ÓG¶—4ÆVvVæG4F—&V7F÷'”Æ–W"ò&GÖÖÖF—&V7F÷'’Ö&öG’fÆW‚Ó÷fW&fÆ÷r×’ÖWFò"¢W&Å7FFRæÖöFRÓÓÒ''FæW""ò&fÆW‚Ó÷fW&fÆ÷r×’ÖWFò"¢&†–FFVâ'ÖÐ¢FF×æVÂÖ&öG¢à¢¶—4ÆVvVæG4F—&V7F÷'”Æ–W"bb€¢Ãà¢Ç6V7F–öâ6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’Ö†VFW"#à¢Ç6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’ÖW–V'&÷r#äÄTtTäE2$TÂU5DDSÂ÷à¢Æƒ"6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’×F—FÆR#äF÷vçF÷vâÆ—7F–æw2Â–â6öçFW‡BãÂöƒ#à¢Ç7â6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’×7V'F—FÆR#à¢7F—fRÆVvVæG2†öÖW2v—F‚'V–ÆF–ær6öçFW‡BÂvÆ¶&ÆRFVÖæBÂæBæV&'’Æ–fW7G–ÆRFWF–Ç2f÷"V6‚FG&W72à¢Â÷7ãà¢Ç7G&öær6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’Ö6÷VçB#à¢¶ÆVvVæG4F—&V7F÷'•Æ6W2æÆVæwF‡Ò7F—fR¶ÆVvVæG4F—&V7F÷'•Æ6W2æÆVæwF‚ÓÓÒò&Æ—7F–ær"¢&Æ—7F–æw2'Ð¢Â÷7G&öæsà¢Â÷6V7F–öãà¢ÆF—b6Æ74æÖSÒ&GÖÖÖF—&V7F÷'’ÖÆ—7B#à¢¶ÆVvVæG4F—&V7F÷'•Æ6W2æÖ‚‡Æ6R’Óâ€¢—5&VçFÄVçF—G’‡Æ6R’ò€¢ÄÆVvVæG5&VçFÅ&W7VÇE&÷p¢¶W“×·Æ6Ræ–GÐ¢Æ6S×·Æ6WÐ¢6VÆV7FVC×·Æ6Ræ–BÓÓÒ6VÆV7FVD–GÐ¢öå6VÆV7C×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ð¢óà¢’¢€¢‚‚’Óâ°¢6öç7B&÷rÒvWDÆVvVæG4F—&V7F÷'•&÷t6÷’‡Æ6R“°¢&WGW&â€¢Æ'WGFöà¢¶W“×·Æ6Ræ–GÐ¢G—SÒ&'WGFöâ ¢6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇB×&÷r ¢FFÖ7F–öãÒ'6VÆV7B ¢FF×6VÆV7FVC×·Æ6Ræ–BÓÓÒ6VÆV7FVD–Bò'G'VR"¢&fÇ6R'Ð¢öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ð¢&–ÖÆ&VÃ×¶f–WrG·&÷rçF—FÆWÖÐ¢à¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇB×–â"&–Ö†–FFVãÒ'G'VR#à¢Å–ä&FvRÆ6S×·Æ6WÒ6VÆV7FVC×·Æ6Ræ–BÓÓÒ6VÆV7FVD–GÒ6—¦SÒ'6Ò"óà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&Ö–â×rÓ#à¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇBÖÖWF#ç·&÷ræÖWFÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇB×F—FÆR#ç·&÷rçF—FÆWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇBÖFG&W72#ç·&÷ræFG&W77ÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇBÖFWF–Ç2#ç·&÷ræFWF–Ç7ÓÂ÷7ãà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖÆVvVæG2×&W7VÇBÖ7F–öâ#åf–WsÂ÷7ãà¢Âö'WGFöãà¢“°¢Ò’‚¢¢’—Ð¢²ÆVvVæG4F—&V7F÷'•Æ6W2æÆVæwF‚bb€¢ÆF—b6Æ74æÖSÒ&GÖ–æfò×&÷r&r×v†—FRÓBFW‡BÕ³7…ÒÆVF–ærÓbFW‡BÕ²3C#SCceÒ#à¢æò7F—fRÆVvVæG2–çfVçF÷'’—2f—6–&ÆR–WBâG'’ÆVvVæG2ÂÆ—7F–æw2Â÷"æV&'’&VÂW7FFR6V&6‚à¢ÂöF—cà¢—Ð¢ÂöF—cà¢Âóà¢—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ&7F—f—G’"bb&VæFW$7F—f—G•æVÂ‚—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ'&W÷'G2"bb&VæFW%&W÷'G5æVÂ‚—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ&6×–vç2"bb&VæFW$6×–våæVÂ‚—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ&–æfò"bb&VæFW$–æfõæVÂ‚—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂÓÓÒ&6—f–2"bb&VæFW$6—f–5æVÂ‚—Ð¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb7F—fU'FæW%æVÂbb€¢ÆF—b6Æ74æÖSÒ&G×'FæW"Ö–çFVÂÖw&–BÖ"Ó2w&–B6‡&–æ²ÓvÓ"ÖC¦w&–BÖ6öÇ2Ó2#à¢²†7F—fTf–ÇFW"ÓÓÒ$WfVçG2 ¢ò°¢²%v†BWfVçG26â6†÷r"Â%6fW2Â%5e2ÂF—&V7F–öâF2ÂF–Ö–ærÂæBæV&'’Æ6W2V÷ÆR6†V6²&Vf÷&RæBgFW"F†RWfVçBâ%ÒÀ¢²%v†ò—26Æ÷6RVæ÷Vv‚"Â%&W6–FVçG2Â†÷FVÂwVW7G2Âf—6—F÷'2ÂæBWfVçBÖvöW'2Ç&VG’Ö÷f–ærF‡&÷Vv‚&–æW’Â6V†öÆÒÂæBF÷vçF÷vââ%ÒÀ¢²%v†BFòG'’æW‡B"Â$fVGW&R†÷FVÂfâ¦æGBÂvW&ÆF–æRw2Âf—'7BF‡W'6F’Â†’†÷W"Â÷"Æ—fR×W6–2ÖöÖVçG2v†VâF–Ö–ærÖGFW'2â%ÒÀ¢Ð¢¢7F—fTf–ÇFW"ÓÓÒ$'&æG2 ¢ò°¢²%v†BV÷ÆR&Ræ÷F–6–ær"Â$'&æBÖöÖVçG2F–VBFòæV&'’&W6–FVçG2ÂWfVçG2ÂæBvÆ¶&ÆRÆç2â%ÒÀ¢²%v†ò—26Æ÷6RVæ÷Vv‚"Â%&W6–FVçG2Âf—6—F÷'2ÂæBWfVçBÖvöW'2Ç&VG’Ö÷f–ærF‡&÷Vv‚F†R6VÆV7FVB&Vâ%ÒÀ¢²%v†BFòG'’æW‡B"Â$6×–vç2Â7W'fW—2ÂæBÆ6VÖVçG2F†B&RV7’Fò7BöâæV&'’â%ÒÀ¢Ð¢¢°¢²%v†BV÷ÆR&RÆöö¶–ærf÷""Â%6V&6†W2Â6fW2Â66ç2ÂæB6&Bf–Ww2w&÷WVB'’F–ÖRöbF’â%ÒÀ¢²%v†ò—2æV&'’"Â%&W6–FVçG2Âf—6—F÷'2ÂæBWfVçBÖvöW'2&÷VæBF†R6VÆV7FVB&Vâ%ÒÀ¢²%v†BFòG'’æW‡B"Â%Æ6W2æBÖöÖVçG2F†B&R6Æ÷6RVæ÷Vv‚f÷"V÷ÆRFò7Böââ%ÒÀ¢Ò’æÖ‚…·F—FÆRÂ&öG•Ò’Óâ€¢ÆF—b¶W“×·F—FÆWÒ6Æ74æÖSÒ&G×'FæW"Ö–çFVÂÖ6&BÓ2#à¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçBÖ&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35Ò#ç·F—FÆWÓÂöF—cà¢Ç6Æ74æÖSÒ&×BÓFW‡BÕ³'…ÒÆVF–ærÓRFW‡BÕ²3#c35Òóc‚#ç¶&öG—ÓÂ÷à¢ÂöF—cà¢’—Ð¢ÂöF—cà¢—Ð¢ÂöF—cà ¢¶—4ÆVvVæG4F—&V7F÷'”Æ–W"òçVÆÂ¢W&Å7FFRæÖöFRÓÒ''FæW""bb—5&W6–FVçE6fVDG&vW"ò€¢&VæFW%6fVD6öÆÆV7F–öåæVÂ‚¢’¢W&Å7FFRæÖöFRÓÒ''FæW""bb7F—fT&÷GFöÕF"ÓÓÒ&–æfò"ò€¢ÆF—b6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂG×&W6–FVçBÖ–æfò×F"×æVÂÖ–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷rÖ†–FFVâ#à¢ÆF—`¢6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂÖÆ—7BG×&W6–FVçBÖ–æfò×67&öÆÂÖ–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷r×’ÖWFò÷fW'67&öÆÂÖ6öçF–â"Ó²×vV&¶—BÖ÷fW&fÆ÷r×67&öÆÆ–æs§F÷V6…Ò ¢à¢·&VæFW$–æfõæVÂ‚—Ð¢ÂöF—cà¢ÂöF—cà¢’¢W&Å7FFRæÖöFRÓÒ''FæW""ò€¢ÆF—b6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂÖ–âÖ‚ÓfÆW‚Ó÷fW&fÆ÷rÖ†–FFVâ#à¢·&W6–FVçEæVÄ6÷’bb€¢Ç6V7F–öâ6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂÖ†VFW"#à¢Çç·&W6–FVçEæVÄ6÷’æW–V'&÷wÓÂ÷à¢Æƒ#ç·&W6–FVçEæVÄ6÷’çF—FÆWÓÂöƒ#à¢Ç7ãç·&W6–FVçEæVÄ6÷’æ&öG—ÓÂ÷7ãà¢Ç7G&öæsç·&W6–FVçE&W7VÇD6÷VçDÆ&VÇÓÂ÷7G&öæsà¢Â÷6V7F–öãà¢—Ð¢ÆF—`¢6Æ74æÖSÒ&G×&W6–FVçB×F"×æVÂÖÆ—7BÖ–âÖ‚ÓfÆW‚Ó76R×’ÓãR÷fW&fÆ÷r×’ÖWFò÷fW'67&öÆÂÖ6öçF–â"Ó²×vV&¶—BÖ÷fW&fÆ÷r×67&öÆÆ–æs§F÷V6…ÒÖC§76R×’Ó" ¢à¢¶G&vW%&Wf–WuÆ6W2æÖ‚‡Æ6R’Óâ€¢‚‚’Óâ°¢6öç7B—5&VçFÅ&÷rÒ—5&VçFÄVçF—G’‡Æ6R“°¢–b†—5&VçFÅ&÷r’°¢6öç7B&VçFÂÒvWE&VçFÄÆ—7F–ætFF‡Æ6R“°¢6öç7Bf7G2Ò°¢&VçFÂæ&VG2ÓÒVæFVf–æVBòG·&VçFÂæ&VG7Ò&F¢""À¢&VçFÂæ&F‡2ÓÒVæFVf–æVBòG·&VçFÂæ&F‡7Ò&¢""À¢&VçFÂç7gBòG´çVÖ&W"‡&VçFÂç7gB’çFôÆö6ÆU7G&–ær‚—Ò7gF¢""À¢Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢&WGW&â€¢Æ'WGFöà¢¶W“×·Æ6Ræ–GÐ¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ð¢6Æ74æÖS×¶GÖF—&V7F÷'’×&W7VÇB×&÷rG×&VçFÂÖÆ—7B×&÷rw&–BrÖgVÆÂw&–BÖ6öÇ2Õ³3G…óg%öWFõÒ—FV×2×7F'BvÓ"ÓãRFW‡BÖÆVgBG&ç6—F–öâÖÆÂÖC¦w&–BÖ6öÇ2Õ³C'…óg%öWFõÒÖC¦vÓ2ÖC§Ó"G°¢Æ6Ræ–BÓÓÒ6VÆV7FVD–Bò&G×æVÂ×&÷r—2×6VÆV7FVBFW‡BÕ²3#c35Ò"¢&G×æVÂ×&÷rFW‡BÕ²3#c35Ò ¢ÖÐ¢à¢Å–ä&FvRÆ6S×·Æ6WÒ6VÆV7FVC×·Æ6Ræ–BÓÓÒ6VÆV7FVD–GÒóà¢Ç7â6Æ74æÖSÒ&Ö–â×rÓ#à¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’Ö6öçFW‡B&Æö6²G'Væ6FR#ä7F—fR+r·&VçFÂç&–6TÆ&VÇÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’×7F÷'’&Æö6²G'Væ6FR#ç·&VçFÂæFG&W72ÇÂÆ6RææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’ÖÖVæ–ær×BÓãR&Æö6²G'Væ6FR#à¢¶f7G7Ò+r'V–ÆF–æs¢·&VçFÂæ'V–ÆF–æwÐ¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’ÖÖVæ–ær×BÓãR&Æö6²G'Væ6FR#à¢Væ—B·&VçFÂçVæ—GÒ+rÔÅ2·&VçFÂæÖÇ7Ò+r·&VçFÂææV–v†&÷&†ööGÐ¢Â÷7ãà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’Ö7F–öâ#à¢FWF–Ç0¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ð¢6öç7BöffW"ÒvWD6æöæ–6Å&W6–FVçDöffW"‡Æ6R’ÇÂvWE&W6–FVçEW&´FWF–Ç2‡Æ6R“°¢6öç7BöffW%F—FÆRÒöffW#òçF—FÆRÇÂöffW#òæöffW"ÇÂÆ6RçW&³òæöffW"ÇÂÆ6Rç&V6öÖÖVæFVE÷W&²ÇÂÆ6Rç'FæW%ö÷÷'GVæ—G’ÇÂ"#°¢6öç7B—5W&µ&÷rÒ7F—fT&÷GFöÕF"ÓÓÒ'W&·2"bb†47F—fUW&´FF‡Æ6R“°¢&WGW&â€¢Æ'F–6ÆP¢¶W“×·Æ6Ræ–GÐ¢6Æ74æÖS×¶GÖF—&V7F÷'’×&W7VÇB×&÷rG×&W6–FVçBÖæF—fR×&÷rw&–BrÖgVÆÂw&–BÖ6öÇ2Õ³3G…óg%Ò—FV×2×7F'BvÓ"ÓãRFW‡BÖÆVgBG&ç6—F–öâÖÆÂÖC¦w&–BÖ6öÇ2Õ³C'…óg%ÒÖC¦vÓ2ÖC§Ó"G°¢Æ6Ræ–BÓÓÒ6VÆV7FVD–Bò&G×æVÂ×&÷r—2×6VÆV7FVBFW‡BÕ²3#c35Ò"¢&G×æVÂ×&÷rFW‡BÕ²3#c35Ò ¢ÖÐ¢à¢Å–ä&FvRÆ6S×·Æ6WÒ6VÆV7FVC×·Æ6Ræ–BÓÓÒ6VÆV7FVD–GÒóà¢Ç7â6Æ74æÖSÒ&Ö–â×rÓG×&W6–FVçBÖæF—fR×&÷rÖ&öG’#à¢Æ'WGFöâG—SÒ&'WGFöâ"6Æ74æÖSÒ&G×&W6–FVçBÖæF—fR×&÷rÖÖ–â"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ò&–ÖÆ&VÃ×¶÷VâG·Æ6RææÖWÖÓà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’Ö6öçFW‡B&Æö6²G'Væ6FR#ç¶öffW#òæ6FVv÷'’ÇÂÆ6Ræ6FVv÷'’ÇÂ$F÷vçF÷vâÆ6R'ÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’×7F÷'’&Æö6²G'Væ6FR#ç·Æ6RææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖF—&V7F÷'’ÖÖVæ–ær×BÓãR&Æö6²#à¢·Æ6RæF—7G&–7BòG·Æ6RæF—7G&–7GÒ+r¢"'×¶öffW%F—FÆRÇÂ$W‡Æ÷&Rv†B—2W6VgVÂæV&'’â'Ð¢Â÷7ãà¢Âö'WGFöãà¢¶—5W&µ&÷rò€¢Ç7â6Æ74æÖSÒ&G×&W6–FVçB×&÷rÖ7F–öâ×7G&—"&–ÖÆ&VÃ×¶G·Æ6RææÖWÒW&²7F–öç6Óà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’ÓâFövvÆU6fVB‡Æ6R—Ò&–×&W76VC×·6fVD–G2æ†2‡Æ6Ræ–B—Óà¢·6fVD–G2æ†2‡Æ6Ræ–B’ò%6fVB"¢%6fR'Ð¢Âö'WGFöãà¢Æ‡&Vc×¶F—&V7F–öç5W&Â‡Æ6R—ÒF&vWCÒ%ö&Ææ²"&VÃÒ&æ÷&VfW'&W"#à¢F—&V7F–öç0¢Âöà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Óåf–WrW&³Âö'WGFöãà¢Â÷7ãà¢’¢€¢Ç7â6Æ74æÖSÒ&G×&W6–FVçB×&÷rÖ7F–öâ×7G&—"&–ÖÆ&VÃ×¶G·Æ6RææÖWÒ7F–öç6Óà¢Æ'WGFöâG—SÒ&'WGFöâ"öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Óåf–WrFWF–Ç3Âö'WGFöãà¢Â÷7ãà¢—Ð¢Â÷7ãà¢Âö'F–6ÆSà¢“°¢Ò’‚¢’—Ð¢²G&vW%&Wf–WuÆ6W2æÆVæwF‚bb€¢ÆF—b6Æ74æÖSÒ&GÖ–æfò×&÷r&r×v†—FRÓBFW‡BÕ³7…ÒÆVF–ærÓbFW‡BÕ²3C#SCceÒ#à¢æ÷F†–ær†W&R–WBâG'’æV&'’6V&6‚Â6fRÆ6RÂ÷"7v—F6‚f–ÇFW'2à¢ÂöF—cà¢—Ð¢¶—5W6–ætfÆÆ&6µÆ6W2bb€¢ÆF—b6Æ74æÖSÒ&GÖ–æfò×&÷r&r×v†—FRÓBFW‡BÕ³7…ÒÆVF–ærÓbFW‡BÕ²3C#SCceÒ#à¢¶VW–æræV&'’F÷vçF÷vâÆ6W2f—6–&ÆRv†–ÆR–÷W"VW7F–öâ6÷'G2F†R&W7BæW‡B÷F–öç2à¢ÂöF—cà¢—Ð¢²†—5&W6–FVçE6fVDG&vW"ò&W6–FVçE6fVEÆ6W2¢F—66÷fW$F—7Æ•Æ6W2’æÆVæwF‚âBbb€¢Æ'WGFöà¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ6WE&W7VÇG4W‡æFVB‚‡fÇVR’ÓâfÇVR—Ð¢6Æ74æÖSÒ&GÖ7F–öâÖÆ–æ²rÖgVÆÂ§W7F–g’Ö6VçFW"&r×G&ç7&VçBFW‡BÕ³…ÒFW‡BÕ²3#c35Òócb ¢&–ÖW‡æFVC×·&W7VÇG4W‡æFVGÐ¢à¢·&W7VÇG4W‡æFVBò%6†÷rÆW72"¢6†÷rÖ÷&R‚G¶—5&W6–FVçE6fVDG&vW"ò†–FFVå6fVE&Wf–Wt6÷VçB¢†–FFVå&Wf–Wt6÷VçGÒ–Ð¢Âö'WGFöãà¢—Ð¢ÂöF—cà¢ÂöF—cà¢’¢çVÆÇÐ¢ÂöÖ÷F–öâæ6–FSà¢—Ð¢Âôæ–ÖFU&W6Væ6Sà ¢Äæ–ÖFU&W6Væ6Sà¢¶6ÇW7FW$G&vW"bbW&Å7FFRçF"ÓÓÒ&Ö"bb‚6VÆV7FVBÇÂ6VÆV7FVDG&vW$6Æ÷6VB’bb€¢ÄæF—fTG&vW%6†VÆÀ¢–CÒ&GÖ7F—fRÖÖÖG&vW" ¢&Vc×¶6öæf–wW&TÖö&–ÆUæVÅ7W&f6WÐ¢–æ—F–Ã×·²÷6—G“¢Â“¢CB×Ð¢æ–ÖFS×·²÷6—G“¢Â“¢×Ð¢W†—C×·²÷6—G“¢Â“¢CB×Ð¢G&ç6—F–öã×·²GW&F–öã¢ã#BÂV6S¢³ã#"ÂÂã3bÂÒ×Ð¢6Æ74æÖSÒ&G×æVÂ×6†VÆÂGÖÖÖG&vW"×6†VÆÂGÖ6öçFW‡BÖÆ—7BÖG&vW" ¢G&vW%7FFS×¶6ÇW7FW$G&vW%7FFWÐ¢æVÄ¶–æCÒ'&W7VÇG2 ¢FF×æVÂÖ¶–æCÒ'&W7VÇG2 ¢FF×æVÂÖÆ–÷WCÒ&6öçFW‡BÖÆ—7B ¢FF×6†VWB×7FFS×¶6ÇW7FW$G&vW%7FFWÐ¢FFÖÖö&–ÆR×æVÂ×7W&f6SÒ'G'VR ¢&–ÖÆ&VÆÆVF'“Ò&GÖ6ÇW7FW"×&W7VÇG2×F—FÆR ¢öäG&vW%7FFT6†ævS×·6WD6ÇW7FW$G&vW%7FFWÐ¢öå&WVW7D6Æ÷6S×²‚’Óâ°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""ÂG&vW$6Æ÷6VC¢""Ò“°¢×Ð¢†VFW#×³ÄÖFWF–Ä†VFW ¢Æ6S×·²æÖS¢vWD6ÇW7FW%F—FÆR†6ÇW7FW$G&vW"ÂW&Å7FFRæÖöFR’×Ð¢æf–vF–öåF—FÆS×¶vWD6ÇW7FW%F—FÆR†6ÇW7FW$G&vW"ÂW&Å7FFRæÖöFR—Ð¢æVÅ7FFS×¶6ÇW7FW$G&vW%7FFWÐ¢öåæVÅ7FFT6†ævS×·6WD6ÇW7FW$G&vW%7FFWÐ¢6ävô&6³×¶fÇ6WÐ¢öä6Æ÷6S×²‚’Óâ°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢W&Å7FFRçWFFR‡²VçF—G”–C¢""ÂG&vW$6Æ÷6VC¢""Ò“°¢×Ð¢óçÐ¢67&öÆÄ6Æ74æÖSÒ&GÖw&÷WVBÖÆ—7BGÖ6öçFW‡BÖÆ—7B×67&öÆÂ ¢à¢Ç6V7F–öâ6Æ74æÖSÒ&GÖ6öçFW‡BÖÆ—7BÖ†VF–ær#à¢Æƒ"–CÒ&GÖ6ÇW7FW"×&W7VÇG2×F—FÆR"6Æ74æÖSÒ&G×æVÂ×F—FÆR#ç¶vWD6ÇW7FW%F—FÆR†6ÇW7FW$G&vW"ÂW&Å7FFRæÖöFR—ÓÂöƒ#à¢Ç6Æ74æÖSÒ&G×æVÂ×7V'F—FÆR#ç¶vWD6ÇW7FW%7V'F—FÆR†6ÇW7FW$G&vW"ÂW&Å7FFRæÖöFR—ÓÂ÷à¢Ç7ãç¶6ÇW7FW%Æ6W4f÷$G&vW"æÆVæwF‡Ò¶6ÇW7FW%Æ6W4f÷$G&vW"æÆVæwF‚ÓÓÒò'&W7VÇB"¢'&W7VÇG2'Ò+rFöæRFò6VRFWF–Ç3Â÷7ãà¢Â÷6V7F–öãà¢¶6ÇW7FW%Æ6W4f÷$G&vW"æÖ‚‡Æ6R’Óâ°¢6öç7BÆ—7F–ærÒvWDÆVvVæG4Æ—7F–ær‡Æ6R“°¢6öç7BW‡Æ–6—DöffW"ÒvWDW‡Æ–6—Dw&÷WVDöffW"‡Æ6R“°¢6öç7B&÷tÖWFÒ·Æ6Ræ6FVv÷'’ÇÂ$F÷vçF÷vâÆ6R"ÂÆ6RæF—7G&–7BÇÂÆ6RææV–v†&÷&†ööBÇÂ$F÷vçF÷vâ%Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"“°¢6öç7BÆ—7F–ætÖWFÒÆ—7F–æp¢ò¶Æ—7F–ærç&–6RÂÆ—7F–æræ&VG2òG¶Æ—7F–æræ&VG7Ò&F¢""ÂÆ—7F–æræ&F‡2òG¶Æ—7F–æræ&F‡7Ò&¢""ÂÆ—7F–ærç7gBòG¶Æ—7F–ærç7gGÒ7gF¢"%Òæf–ÇFW"„&ööÆVâ’æ¦ö–â‚"+r"¢¢"#°¢6öç7BöffW$Æ–æRÒÆ—7F–ætÖWFÇÂW‡Æ–6—DöffW#°¢&WGW&â€¢Æ'WGFöà¢¶W“×·Æ6Ræ–GÐ¢G—SÒ&'WGFöâ ¢öä6Æ–6³×²‚’Óâ6VÆV7EÆ6R‡Æ6R—Ð¢6Æ74æÖSÒ&GÖw&÷WVB×&÷r ¢à¢Ç7â6Æ74æÖSÒ&GÖw&÷WVBÖ–6öâ#à¢Å–ä&FvRÆ6S×·Æ6WÒóà¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖw&÷WVBÖ6÷’#à¢Ç7â6Æ74æÖSÒ&GÖw&÷WVB×F—FÆR#ç·Æ6RææÖWÓÂ÷7ãà¢Ç7â6Æ74æÖSÒ&GÖw&÷WVBÖÖWF#ç·&÷tÖWFÓÂ÷7ãà¢¶öffW$Æ–æRbbÇ7â6Æ74æÖSÒ&GÖw&÷WVBÖöffW"#ç¶öffW$Æ–æWÓÂ÷7ãçÐ¢Â÷7ãà¢Ç7â6Æ74æÖSÒ&GÖw&÷WVB×7FGW2#à¢¶Æ—7F–ærò$6öçF7B"¢$÷Vâ'Ð¢Â÷7ãà¢Âö'WGFöãà¢“°¢Ò—Ð¢ÂôæF—fTG&vW%6†VÆÃà¢—Ð¢Âôæ–ÖFU&W6Væ6Sà ¢Äæ–ÖFU&W6Væ6Sà¢·6VÆV7FVBbb6VÆV7FVDG&vW$6Æ÷6VBbb7F—fU'FæW%æVÂbbW&Å7FFRçF"ÓÒ'72"bb€¢ÄæF—fTG&vW%6†VÆÀ¢–CÒ&GÖ7F—fRÖÖÖG&vW" ¢&Vc×¶6öæf–wW&TÖö&–ÆUæVÅ7W&f6WÐ¢–æ—F–Ã×·²÷6—G“¢Â“¢#R"×Ð¢æ–ÖFS×·²÷6—G“¢Â“¢×Ð¢W†—C×·²÷6—G“¢Â“¢#R"×Ð¢G&ç6—F–öã×·²GW&F–öã¢ã#BÂV6S¢³ã#"ÂÂã3bÂÒ×Ð¢6Æ74æÖS×¶—4–ä¶–æDæWGv÷&´VçF—G’‡6VÆV7FVB¢ò&GÖÖÖFWF–Â×6†VWBGÖ–æ¶–æB×'FæW"ÖG&vW"GÖÖ×æVÂG×æVÂ×6†VÆÂGÖFWF–ÂÖG&vW"GÖFW7F–æF–öâÖG&vW"GÖFWF–ÂÖg&ÖWv÷&²GÖÖÖG&vW"×æVÂGÖ–÷2ÖgVÆÇ67&VVâÖÖ×æVÂ ¢¢GÖÖÖFWF–Â×6†VWBGÖÖ×æVÂG×æVÂ×6†VÆÂGÖFWF–ÂÖG&vW"GÖFW7F–æF–öâÖG&vW"GÖFWF–ÂÖg&ÖWv÷&²GÖÖÖG&vW"×æVÂGÖ–÷2ÖgVÆÇ67&VVâÖÖ×æVÂG·W6W46ÆVå&W6–FVçF–ÄVçF—G”G&vW"‡6VÆV7FVB’ò&GÖVçF—G’ÖG&vW"×6†VÆÂ"¢"'ÒG·6†÷VÆEW6U'FæW$–çFVÆÆ–vVæ6TG&vW"‡6VÆV7FVBÂW&Å7FFRæÖöFR’ò&G×'FæW"ÖFW7F–æF–öâ×6†VWB"¢"'ÖÐ¢FF×æVÂÖ¶–æC×¶vWDÖG&vW%æVÄ¶–æB‡6VÆV7FVBÂW&Å7FFRæÖöFRÂ&ööÆVâ‡W&Å7FFRçW&´–B’—Ð¢FF×æVÂÖÆ–÷WCÒ&FWF–Â ¢FFÖG&vW"×7FFS×¶FWF–ÄG&vW%7FFWÐ¢FF×6†VWB×7FFS×¶FWF–ÄG&vW%7FFWÐ¢FFÖÖöFS×·W&Å7FFRæÖöFWÐ¢FFÖVçF—G’×G—S×¶vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’—Ð¢FFÖÖö&–ÆR×æVÂ×7W&f6SÒ'G'VR ¢&–ÖÆ&VÆÆVF'“×µ²'W&²"Â&WfVçB"Â&6×–vâ"Â'÷'FföÆ–ò%Òæ–æ6ÇVFW2†vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’¢ò6æöæ–6ÂÖFWF–Â×F—FÆRÒG·6VÆV7FVBæ–GÖ ¢¢6†÷VÆEW6U'FæW$–çFVÆÆ–vVæ6TG&vW"‡6VÆV7FVBÂW&Å7FFRæÖöFR’ò'FæW"ÖG&vW"×F—FÆRÒG·6VÆV7FVBæ–GÖ¢VæFVf–æVGÐ¢&–ÖÆ&VÃ×µ²'W&²"Â&WfVçB"Â&6×–vâ"Â'÷'FföÆ–ò%Òæ–æ6ÇVFW2†vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’¢òVæFVf–æV@¢¢6†÷VÆEW6U'FæW$–çFVÆÆ–vVæ6TG&vW"‡6VÆV7FVBÂW&Å7FFRæÖöFR’òVæFVf–æVB¢G·6VÆV7FVBææÖWÒFWF–Ç6Ð¢G&vW%7FFS×¶FWF–ÄG&vW%7FFWÐ¢æVÄ¶–æC×¶vWDÖG&vW%æVÄ¶–æB‡6VÆV7FVBÂW&Å7FFRæÖöFRÂ&ööÆVâ‡W&Å7FFRçW&´–B’—Ð¢67&öÆÄ6Æ74æÖSÒ&GÖÖÖFWF–Â×67&öÆÂGÖÖ×æVÂ×67&öÆÂGÖFW7F–æF–öâ×67&öÆÂGÖG&vW"×67&öÆÂ ¢öäG&vW%7FFT6†ævS×·WFFTFWF–ÄG&vW%7FFWÐ¢öå&WVW7D6Æ÷6S×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢†VFW#×³ÄÖFWF–Ä†VFW ¢Æ6S×·6VÆV7FVGÐ¢æf–vF–öåF—FÆS×¶vWDÖFWF–Äæf–vF–öåF—FÆR‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’ÂW&Å7FFRæÖöFR—Ð¢&6´Æ&VÃ×¶vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’ÓÓÒ'W&²"ò$&6²Fò7F—fRW&·2"¢$&6²'Ð¢æVÅ7FFS×¶FWF–ÄG&vW%7FFWÐ¢öåæVÅ7FFT6†ævS×·WFFTFWF–ÄG&vW%7FFWÐ¢6ävô&6³×´&ööÆVâ‚†—4–ä¶–æDVçF—G’‡6VÆV7FVB’bb—4–ä¶–æDæWGv÷&´VçF—G’‡6VÆV7FVB’bb–ä¶–æE&VçE&Vbæ7W'&VçB’ÇÂVVµæVÅ7FFR‚’—Ð¢öä&6³×²‚’Óâ°¢6öç7B&VçBÒ–ä¶–æE&VçE&Vbæ7W'&VçC°¢–b†—4–ä¶–æDVçF—G’‡6VÆV7FVB’bb—4–ä¶–æDæWGv÷&´VçF—G’‡6VÆV7FVB’bb&VçB’°¢–ä¶–æE&VçE&Vbæ7W'&VçBÒçVÆÃ°¢6VÆV7EÆ6R‡&VçB“°¢6WD7F—fTf–ÇFW"‚&–ä¶–æB"“°¢W&Å7FFRçWFFR‡²f–ÇFW#¢&–ä¶–æB"Â6öÆÆV7F–öã¢&–æ¶–æBÖF–æ–ærÖÖ&¶WB"ÂVçF—G”–C¢&VçBæ–BÂÆ—7F–æt–C¢""Ò“°¢ÒVÇ6R&W7F÷&U&Wf–÷W4ÖæVÂ‚“°¢×Ð¢öä6Æ÷6S×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢óçÐ¢7F–öç3×³ÅVæ—fW'6ÄVçF—G”7F–öå&–À¢Æ6S×·6VÆV7FVGÐ¢VçF—G•G—S×¶vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’—Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVC×·6fVD–G2æ†2‡6VÆV7FVBæ–B—Ð¢'7gVC×²„'&’æ—4'&’†WfVçE'7g2’òWfVçE'7g2¢µÒ’ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6VÆV7FVBæ–B—Ð¢÷&væ—¦F–öä–C×·&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚—Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå'7g×²‚’ÓâFövvÆU'7g‡6VÆV7FVB—Ð¢öåW6UW&³×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'W6U÷W&²"Â'Væ—fW'6ÅöVçF—G•ö7F–öå÷&–Â"—Ð¢öä6öçF7C×²‚’Óâ°¢6WDvVçDf÷&ÕÆ6T–B‡6VÆV7FVBæ–B“°¢6WDvVçDf÷&Õ7V&Ö—GFVB†fÇ6R“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’ÓâFö7VÖVçBævWDVÆVÖVçD'”–B†ÖÖ6öçF7BÖf÷&ÒÒG·6VÆV7FVBæ–GÖ“òç67&öÆÄ–çFõf–Wr‡²&Æö6³¢&æV&W7B"Â&V†f–÷#¢'6Öö÷F‚"Ò’Âƒ“°¢×Ð¢öäW‡Æ÷&S×²‚’ÓâFö7VÖVçBçVW'•6VÆV7F÷"‚"6GÖ7F—fRÖÖÖG&vW"¶FFÖ'V–ÆF–ær×6V7F–öãÒv÷fW'f–WruÒÂ6GÖ7F—fRÖÖÖG&vW"æGÖæF—fRÖFWF–Â×æVÅõ÷7VÖÖ'’Â6GÖ7F—fRÖÖÖG&vW"æGÖVçF—G’×7VÖÖ'’"“òç67&öÆÄ–çFõf–Wr‡²&V†f–÷#¢'6Öö÷F‚"Â&Æö6³¢'7F'B"Ò—Ð¢öåG&6³×²†7F–öâÂ6÷W&6R’Óâf—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ7F–öâÂ6÷W&6RÂ°¢ÖWFFF¢°¢VçF—G•G—S¢vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’À¢æVÅ7FFS¢FWF–ÄG&vW%7FFRÀ¢6÷W&6U7W&f6S¢W&Å7FFRæ6öÆÆV7F–öâò&6öÆÆV7F–öâ"¢&Ö"À¢ÒÀ¢Ò’—Ð¢óçÐ¢à¢Æ'F–6ÆR6Æ74æÖSÒ&GÖÖÖFWF–ÂÖ6öçFVçB#à¢²‚‚’Óâ°¢6öç7BVçF—G”¶–æBÒvWE&W6–FVçDVçF—G”¶–æB‡6VÆV7FVB“°¢6öç7BÆVvVæG4Æ—7F–ærÒvWE&W6öÇfVDÆVvVæG4Æ—7F–ær‡6VÆV7FVB“°¢6öç7B—5&VçFÂÒVçF—G”¶–æBÓÓÒ'&VçFÂ"ÇÂ—5&VçFÄVçF—G’‡6VÆV7FVB“°¢6öç7B—46×–vâÒVçF—G”¶–æBÓÓÒ&6×–vâ"ÇÂ—46×–väVçF—G’‡6VÆV7FVB“°¢6öç7B—5W&µæVÂÒW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bbvWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’ÓÓÒ'W&²#°¢6öç7B—5&÷W'G’Ò—5&VçFÂbb†VçF—G”¶–æBÓÓÒ'&÷W'G’"ÇÂ&ööÆVâ†ÆVvVæG4Æ—7F–ærÇÂvWDÇW‡W'•&W6Væ6T'V–ÆF–ær‡6VÆV7FVB’ÇÂ—4ÆVvVæG4Æ—7F–ætÆ–¶R‡6VÆV7FVB’’“°¢6öç7B—5&¶–ærÒ—5&¶–ætVçF—G’‡6VÆV7FVB“°¢6öç7B—4F7F÷Ò—4FF÷W%Æ6R‡6VÆV7FVB“°¢6öç7B—4F6—f–2Ò—4F6—f–4VçF—G’‡6VÆV7FVB“°¢6öç7B—4–ä¶–æDF–æ–ærÒ—4–ä¶–æDVçF—G’‡6VÆV7FVB“°¢6öç7B—4–ä¶–æDæWGv÷&²Ò—4–ä¶–æDæWGv÷&´VçF—G’‡6VÆV7FVB“°¢6öç7B—4'W&vW$&%æVÂÒ—4'W&vW$&$6öæw&W72‡6VÆV7FVB“°¢6öç7B—4Æö6Å6W'f–6RÒ—4Æö6Å6W'f–6TVçF—G’‡6VÆV7FVB“°¢6öç7B—4g&÷7EF÷vW%æVÂÒ—4g&÷7EF÷vW$VçF—G’‡6VÆV7FVB“°¢6öç7B—4æV–v†&÷&†ööEæVÂÒ—4æV–v†&÷&†ööDVçF—G’‡6VÆV7FVB“°¢6öç7B—4†÷7—FÆ—G•÷'FföÆ–òÒvWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’ÓÓÒ'÷'FföÆ–ò#°¢6öç7B—4WfVçEæVÂÒ—4WfVçDVçF—G’‡6VÆV7FVB’bb—46×–vâbb—4†”†÷W$VçF—G’‡6VÆV7FVB“°¢6öç7BÆVvVæG5&W6–FVçF–Ä6öçFVçBÒvWDÆVvVæG5&W6–FVçF–Ä6öçFVçDf÷%Æ6R‡6VÆV7FVB“°¢6öç7BÆVvVæG5&W6–FVçF–Å&öf–ÆRÒvWDÆVvVæG5&W6–FVçF–Å&öf–ÆTf÷%Æ6R‡6VÆV7FVB“°¢6öç7B6öçF7Df÷&Ô–BÒÖÖ6öçF7BÖf÷&ÒÒG·6VÆV7FVBæ–GÖ°¢6öç7B÷Vä6öçF7Df÷&ÒÒ‚’Óâ°¢6WDvVçDf÷&ÕÆ6T–B‡6VÆV7FVBæ–B“°¢6WDvVçDf÷&Õ7V&Ö—GFVB†fÇ6R“°¢v–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢Fö7VÖVçBævWDVÆVÖVçD'”–B†6öçF7Df÷&Ô–B“òç67&öÆÄ–çFõf–Wr‡²&Æö6³¢&æV&W7B"Â&V†f–÷#¢'6Öö÷F‚"Ò“°¢ÒÂƒ“°¢Ó°¢6öç7B6Æ÷6U6VÆV7FVDG&vW"Ò‚’Óâ°¢6Æ÷6U6VÆV7FVDÖG&vW"‚“°¢Ó°¢6öç7BG&6´6æöæ–6ÄFWF–ÄWfVçBÒ†WfVçDæÖRÂÖWFFFÒ·Ò’Óâ°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂWfVçDæÖRÂ&6æöæ–6ÅöFWF–Å÷æVÂ"Â°¢ÖWFFF¢°¢VçF—G•G—S¢vWD6æöæ–6ÄFWF–ÄVçF—G•G—R‡6VÆV7FVBÂ&ööÆVâ‡W&Å7FFRçW&´–B’’À¢æVÅ7FFS¢FWF–ÄG&vW%7FFRÀ¢6÷W&6U7W&f6S¢W&Å7FFRæ6öÆÆV7F–öâò&6öÆÆV7F–öâ"¢&Ö"À¢ââæÖWFFFÀ¢ÒÀ¢Ò’“°¢Ó°¢6öç7B÷VäVçF—G”f–ÇFW"Ò†f–ÇFW"’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†f–ÇFW"“°¢6WD7F—fT&÷GFöÕF"‚&Ö"“°¢Ó°¢6öç7B6†÷VÆE6†÷u7FæF&D7F–öåæVÂÒfÇ6S°¢6öç7B7FæF&D7F–öåæVÂÒ6†÷VÆE6†÷u7FæF&D7F–öåæVÂò€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãBÂGW&F–öã¢ã‚×Óà¢ÄÖ7F–öå7FæF&EæVÀ¢VçF—G“×·6VÆV7FVGÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVC×·6fVD–G2æ†2‡6VÆV7FVBæ–B—Ð¢'7gVC×²„'&’æ—4'&’†WfVçE'7g2’òWfVçE'7g2¢µÒ’ç6öÖR‚†—FVÒ’Óâ—FVÒæ–BÓÓÒ6VÆV7FVBæ–B—Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå'7g×²‚’ÓâFövvÆU'7g‡6VÆV7FVB—Ð¢öä6öçF7C×¶÷Vä6öçF7Df÷&×Ð¢óà¢ÂöÖ÷F–öâæF—cà¢’¢çVÆÃ°¢6öç7Bv—F…7FæF&D7F–öåæVÂÒ†6öçFVçB’Óâ€¢Ãà¢·7FæF&D7F–öåæVÂÇÂçVÆÇÐ¢¶6öçFVçGÐ¢Âóà¢“° ¢–b†—4†÷7—FÆ—G•÷'FföÆ–ò’°¢&WGW&â€¢Ä†÷7—FÆ—G•÷'FföÆ–ôG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäæÇ—F–73×·G&6´6æöæ–6ÄFWF–ÄWfVçGÐ¢óà¢“°¢Ð ¢–b†—4–ä¶–æDæWGv÷&²’°¢&WGW&â€¢Ä–ä¶–æE'FæW$G&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7EfVçVS×²‡fVçVR’Óâ°¢–ä¶–æE&VçE&Vbæ7W'&VçBÒ6VÆV7FVC°¢6VÆV7EÆ6R‡fVçVR“°¢6WD7F—fTf–ÇFW"‚&–ä¶–æB"“°¢W&Å7FFRçWFFR‡²f–ÇFW#¢&–ä¶–æB"Â6öÆÆV7F–öã¢&–æ¶–æBÖF–æ–ærÖÖ&¶WB"ÂVçF—G”–C¢fVçVRæ–BÂÆ—7F–æt–C¢""Ò“°¢×Ð¢öå6†÷ufVçVW3×²‚’Óâ°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ‚&–ä¶–æB"Â²6öÆÆV7F–öã¢&–æ¶–æBÖF–æ–ærÖÖ&¶WB"Â–çFVçC¢&–æ¶–æB"Ò“°¢×Ð¢óà¢“°¢Ð ¢–b†—5F†U6†÷&U&÷W'G”VçF—G’‡6VÆV7FVB’’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢ÅF†U6†÷&U&W6–FVçF–ÄVçF—G”G&vW ¢Æ6S×·6VÆV7FVGÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢vVçDf÷&Õ7V&Ö—GFVC×¶vVçDf÷&Õ7V&Ö—GFVGÐ¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6†÷t6&C×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'6†÷uö6&B"Â'F†U÷6†÷&U÷&W6–FVçF–ÅöG&vW""—Ð¢öä6öçF7C×¶÷Vä6öçF7Df÷&×Ð¢öå7V&Ö—D6öçF7C×²‚’Óâ6WDvVçDf÷&Õ7V&Ö—GFVB‡G'VR—Ð¢öäW‡Æ÷&S×²‡&ö×B’Óâ°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡&ö×BÂW&Å7FFRæÖöFR’ÇÂ$æV&'’#°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â²VW'“¢&ö×BÂ–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"Â&ö×B’Ò“°¢×Ð¢öä÷Vå&÷WFS×¶÷Vä6öÆÆV7F–öå&÷WFWÐ¢öä&6³×¶vô&6µFôÖÐ¢öä6Æ÷6S×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢óà¢“°¢Ð ¢–b†—46æöæ–6Å&W6–FVçF–ÄÖ—†VEW6TVçF—G’‡6VÆV7FVB’’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢Å&W6–FVçF–ÄÖ—†VEW6TG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäW‡Æ÷&S×²‡&ö×B’Óâ°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡&ö×BÂW&Å7FFRæÖöFR’ÇÂ$æV&'’#°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â°¢VW'“¢&ö×BÀ¢–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"Â&ö×B’À¢Ò“°¢×Ð¢öä÷Vå&÷WFS×¶÷Vä6öÆÆV7F–öå&÷WFWÐ¢öä&6³×¶vô&6µFôÖÐ¢öä6Æ÷6S×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢óà¢“°¢Ð ¢–b†—5&÷W'G’bb—5&VçFÂbbÆVvVæG4Æ—7F–ærbb—4ÆVvVæG4ÖÆ6R‡6VÆV7FVB’bbÆVvVæG5&W6–FVçF–Å&öf–ÆR’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢Å&W6–FVçF–ÄÖ—†VEW6TG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäW‡Æ÷&S×²‡&ö×B’Óâ°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡&ö×BÂW&Å7FFRæÖöFR’ÇÂ$æV&'’#°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â°¢VW'“¢&ö×BÀ¢–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"Â&ö×B’À¢Ò“°¢×Ð¢öä÷Vå&÷WFS×¶÷Vä6öÆÆV7F–öå&÷WFWÐ¢óà¢“°¢Ð ¢–b‚†—5&VçFÂÇÂ—5&÷W'G’ÇÂÆVvVæG4Æ—7F–ærÇÂ—4ÆVvVæG4ÖÆ6R‡6VÆV7FVB’’bbÆVvVæG5&W6–FVçF–Å&öf–ÆRbb—4F7F÷’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢ÄÆVvVæG5&W6–FVçF–Ä–çFVÆÆ–vVæ6TG&vW ¢Æ6S×·6VÆV7FVGÐ¢&öf–ÆS×¶ÆVvVæG5&W6–FVçF–Å&öf–ÆWÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öäf–ÇFW#×¶÷VäVçF—G”f–ÇFW'Ð¢öäW‡Æ÷&S×²‡&ö×B’Óâ°¢6öç7BæW‡Df–ÇFW"Ò&W6öÇfTf–ÇFW$f÷$–çFVçB‡&ö×BÂW&Å7FFRæÖöFR’ÇÂ$æV&'’#°¢&Vv–å6V&6„–çFVçEG&ç6—F–öâ†æW‡Df–ÇFW"Â²VW'“¢&ö×BÂ–çFVçC¢vWD6æöæ–6Ä–çFVçDf÷$f–ÇFW"†æW‡Df–ÇFW"Â&ö×B’Ò“°¢×Ð¢öä÷Vå&÷WFS×¶÷Vä6öÆÆV7F–öå&÷WFWÐ¢öä&6³×¶vô&6µFôÖÐ¢öä6Æ÷6S×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢óà¢“°¢Ð ¢–b†—4–æFWVæFVçE&÷W'G”VçF—G’‡6VÆV7FVB’’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢Ä6ÆVä–æFWVæFVçDVçF—G”G&vW ¢Æ6S×·6VÆV7FVGÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6†÷t6&C×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'6†÷uö6&B"Â&6ÆVå÷&W6–FVçF–ÅöG&vW""—Ð¢öäf–ÇFW#×¶÷VäVçF—G”f–ÇFW'Ð¢öå&÷WFS×²†æW‡E7FFR’Óâ°¢6WE6VÆV7FVD–B‚""“°¢6WE6VÆV7FVEÆ6T÷fW'&–FR†çVÆÂ“°¢6WDÖç7vW"†çVÆÂ“°¢6WDVçF—G”ç7vW"†çVÆÂ“°¢6WD6ÇW7FW$G&vW"†çVÆÂ“°¢6WD7F—fT&÷GFöÕF"†æW‡E7FFSòçF"ÇÂ&Ö"“°¢–b†æW‡E7FFSòæf–ÇFW"’6WD7F—fTf–ÇFW"†æW‡E7FFRæf–ÇFW"“°¢–b†æW‡E7FFSòæF—7G&–7BÓÒVæFVf–æVB’6WDF—7G&–7B†æW‡E7FFRæF—7G&–7BÇÂÄÅôäT”t„$õ$„ôôE2“°¢W&Å7FFRçWFFR†æW‡E7FFR“°¢×Ð¢óà¢“°¢Ð ¢–b†—4æV–v†&÷&†ööEæVÂ’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢ÄæV–v†&÷&†ööDFWF–ÄG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢óà¢“°¢Ð ¢–b†—4†÷7—FÆ—G”æWGv÷&´VçF—G’‡6VÆV7FVB’’°¢&WGW&â€¢Ä†÷7—FÆ—G”æWGv÷&´G&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢óà¢“°¢Ð ¢–b†—4–ä¶–æDF–æ–ærbbW&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"’°¢&WGW&â€¢Ä–ä¶–æE&W6–FVçDG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢óà¢“°¢Ð ¢–b†—4–ä¶–æDF–æ–ærbbW&Å7FFRæÖöFRÓÓÒ''FæW""’°¢&WGW&â€¢Ä–ä¶–æE'FæW$÷÷'GVæ—G”G&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢óà¢“°¢Ð ¢–b‡W&Å7FFRæÖöFRÓÓÒ''FæW""bb—5&÷W'G’’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢Å'FæW$–çFVÆÆ–vVæ6TG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öåf–WtæV&'“×¶6Æ÷6U6VÆV7FVDÖG&vW'Ð¢÷&væ—¦F–öä–C×·&VE'FæW%v÷&·76T÷&væ—¦F–öä–B†Æö6F–öâç6V&6‚—Ð¢óà¢“°¢Ð ¢–b†—4Æö6Å6W'f–6R’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢ÄÆö6Å6W'f–6TG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢óà¢“°¢Ð ¢–b†—5W&µæVÂ’°¢&WGW&â€¢Ä6æöæ–6ÅW&´FWF–ÄG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öåW6S×²‚’Óâ°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ'W&µö7F—fF–öå÷7F'FVB"Â&6æöæ–6ÅöFWF–Å÷æVÂ"’“°¢÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'W6U÷W&²"Â&6æöæ–6ÅöFWF–Å÷æVÂ"“°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ'W&µ÷%ö÷VæVB"Â&6æöæ–6ÅöFWF–Å÷æVÂ"’“°¢×Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäæÇ—F–73×·G&6´6æöæ–6ÄFWF–ÄWfVçGÐ¢óà¢“°¢Ð ¢–b‡W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb—46×–vâ’°¢&WGW&â€¢Ä6æöæ–6Ä6×–väFWF–ÄG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öä¦ö–ã×²‚’Óâ°¢G&6´6æöæ–6ÄFWF–ÄWfVçB‚&6×–våö¦ö–æVB"“°¢6öç7B&t6×–vâÒ6VÆV7FVBç&rÇÂ·Ó°¢6öç7Bf—'7E7F÷–BÒ‡6VÆV7FVBæ7F—fF–öå7F÷2ÇÂ&t6×–vâæ7F—fF–öå7F÷2ÇÂµÒ¢æÖ‚‡7F÷’Óâ7F÷òæVçF—G”–BÇÂ7F÷òæ–B¢æf–æB„&ööÆVâ¢ÇÂ‡6VÆV7FVBç'F–6—F–ætVçF—F–W2ÇÂ&t6×–vâç'F–6—F–ætVçF—F–W2ÇÂµÒ¢æÖ…7G&–ær¢æf–æB‚†–B’Óâ–BÓÒ7G&–ær‡6VÆV7FVBæ–B’“°¢6öç7Bf—'7E7F÷Òf—'7E7F÷–Bò&W6öÇfTÖVçF—G”g&öÔ6öÆÆV7F–öâ†f—'7E7F÷–BÂÆ6W2’¢çVÆÃ°¢–b†f—'7E7F÷’6VÆV7EÆ6R†f—'7E7F÷“°¢VÇ6RFövvÆU6fVB‡6VÆV7FVB“°¢×Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäæÇ—F–73×·G&6´6æöæ–6ÄFWF–ÄWfVçGÐ¢óà¢“°¢Ð ¢–b†—4WfVçEæVÂ’°¢&WGW&âv—F…7FæF&D7F–öåæVÂ€¢ÄWfVçDFWF–ÄG&vW ¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢WfVçE'7g3×¶WfVçE'7g7Ð¢öå'7g×²‚’ÓâFövvÆU'7g‡6VÆV7FVB—Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢öäæÇ—F–73×·G&6´6æöæ–6ÄFWF–ÄWfVçGÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢óà¢“°¢Ð ¢&WGW&â€¢ÆÖ÷F–öâæF—b6Æ74æÖS×·W&Å7FFRæÖöFRÓÓÒ''FæW""ò&GÖÖ×æVÂÖ6öçFVçBG×'FæW"ÖFWF–ÂÖ6öçFVçB"¢&GÖÖ×æVÂÖ6öçFVçBGÖFW7F–æF–öâÖ6öçFVçBGÖFWF–ÂÖ6öçFVçB'Óà¢ÄFW7F–æF–öä†W&òÆ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒóà¢ÄVçF—G”–FVçF—G•æVÂ–FVçF—G“×¶vWDVçF—G”–FVçF—G’‡6VÆV7FVBÂW&Å7FFRæÖöFR—Òóà¢·7FæF&D7F–öåæVÇÐ¢²—4–ä¶–æDF–æ–ærbb—4'W&vW$&%æVÂbb—4†”†÷W$VçF—G’‡6VÆV7FVB’bb‡W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb†47F—fUW&´FF‡6VÆV7FVB’’bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢ÅæVÄ6öçFW‡BÆ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãÂGW&F–öã¢ã‚×Óà¢·W&Å7FFRæÖöFRÓÓÒ''FæW""bb6†÷VÆEW6U'FæW$–çFVÆÆ–vVæ6TG&vW"‡6VÆV7FVBÂW&Å7FFRæÖöFR’òçVÆÂ¢W&Å7FFRæÖöFRÓÓÒ''FæW""ò€¢Å'FæW$G&vW$7F–öç2Æ6S×·6VÆV7FVGÒöä6öçF7C×¶÷Vä6öçF7Df÷&×Òóà¢’¢€¢Å&W6–FVçDG&vW$7F–öç0¢6VÆV7FVC×·6VÆV7FVGÐ¢6VÆV7FVE&W6–FVçD7F–öã×·6VÆV7FVE&W6–FVçD7F–öçÐ¢6fVD–G3×·6fVD–G7Ð¢WfVçE'7g3×¶WfVçE'7g7Ð¢ÆVvVæG4Æ—7F–æs×¶ÆVvVæG4Æ—7F–æwÐ¢öä6öçF7C×¶÷Vä6öçF7Df÷&×Ð¢öå'7g×²‚’ÓâFövvÆU'7g‡6VÆV7FVB—Ð¢öå6†÷t6&C×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'6†÷uö6&B"Â'&W6–FVçEöG&vW%ö7F–öç2"—Ð¢öä6´Ö×²‚’Óâ6´VçF—G”76—7FçB†v†–6‚æV&'’W&·2Ö¶RG·6VÆV7FVBææÖWÒf—Cö—Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öåG&6´7F–öã×²†7F–öâÂ6÷W&6RÂW‡G&Ò·Ò’Óâ°¢f—&Uv÷&¶fÆ÷r‚"ö’öÖÖ7F–öç2"Â'V–ÆDÖ7F–öå–ÆöB‡6VÆV7FVBÂ7F–öâÂ6÷W&6RÂ°¢f÷&Ó¢°¢–çFVçC¢7F–öâÀ¢Æ&VÃ¢7F–öâÀ¢ââæW‡G&æf÷&ÒÀ¢ÒÀ¢ÖWFFF¢W‡G&æÖWFFFÀ¢Ò’“°¢×Ð¢óà¢—Ð¢ÂöÖ÷F–öâæF—cà¢¶—46×–vâbb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãÂGW&F–öã¢ã‚×Óà¢ÄÖæF—fT6×–väFWF–Ç2Æ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢¶—5&VçFÂò€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢Å&VçFÄÆ—7F–ætFWF–Ç2Æ6S×·6VÆV7FVGÒóà¢ÂöÖ÷F–öâæF—cà¢’¢ÆVvVæG5&W6–FVçF–Ä6öçFVçBò€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢ÄÆVvVæG5&W6–FVçF–ÄÖG&—…æVÂÆ6S×·6VÆV7FVGÒöä6³×¶6´VçF—G”76—7FçGÒöä6öçF7C×¶÷Vä6öçF7Df÷&×Òóà¢ÂöÖ÷F–öâæF—cà¢’¢—57&–æt6öæFöÖ–æ—V×2‡6VÆV7FVB’ò€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢Å7&–æt6öæFöÖ–æ—V×4FW7F–æF–öåæVÂöä6³×¶6´VçF—G”76—7FçGÒóà¢ÂöÖ÷F–öâæF—cà¢’¢—5&÷W'G’bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢ÄÆVvVæG4ÔÅ4f7G56V7F–öâÆ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒöå6VÆV7C×·6VÆV7EÆ6WÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢²†—5&÷W'G’ÇÂ—4g&÷7EF÷vW%æVÂ’bb—4F7F÷bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã‚ÂGW&F–öã¢ã‚×Óà¢Ä'V–ÆF–ætÆö6Å6W'f–6W5&–ÂÆ6S×·6VÆV7FVGÒÆ6W3×·Æ6W7Òöå6VÆV7C×·6VÆV7EÆ6WÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢·W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb†—4†”†÷W$VçF—G’‡6VÆV7FVB’ÇÂ—4&ævW'5fVçVR‡6VÆV7FVB’’bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã3bÂGW&F–öã¢ã‚×Óà¢Ä†”†÷W$FWF–Ç2Æ6S×·6VÆV7FVGÒ6fVD–G3×·6fVD–G7Òöå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—ÒöåW6S×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'W6U÷W&²"Â&†•ö†÷W%öFWF–Ç2"—Òóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢¶—5&¶–ærbb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã3rÂGW&F–öã¢ã‚×Óà¢Å&¶–æt&öö¶–ætFWF–Ç2Æ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢¶—4'W&vW$&%æVÂbb—4F7F÷bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã3’ÂGW&F–öã¢ã‚×Óà¢Ä'W&vW$&$6öæw&W74FWF–Ç0¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð¢¶—4–ä¶–æDF–æ–ærbb—4'W&vW$&%æVÂbb—4F7F÷bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã3’ÂGW&F–öã¢ã‚×Óà¢Ä–ä¶–æDF–æ–ætFWF–Ç0¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢ÖöFS×·W&Å7FFRæÖöFWÐ¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6Tç7vW#×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð¢·W&Å7FFRæÖöFRÓÓÒ'&W6–FVçB"bb††47F—fUW&´FF‡6VÆV7FVB’ÇÂ—5&÷W'G’’bb—46×–vâbb—5&VçFÂbbÆVvVæG5&W6–FVçF–Ä6öçFVçBbb—4†”†÷W$VçF—G’‡6VÆV7FVB’bb—4&ævW'5fVçVR‡6VÆV7FVB’bb—5&¶–ærbb—4–ä¶–æDF–æ–ærbb—4&F†TVçF—G’‡6VÆV7FVB’bb—4F7F÷bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãC"ÂGW&F–öã¢ã‚×Óà¢Å&W6–FVçEW&´FWF–Ç0¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢6fVD–G3×·6fVD–G7Ð¢öå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Ð¢öåW6S×²‚’Óâ÷Vå&W6–FVçE$ÖöFÂ‡6VÆV7FVBÂ'W6U÷W&²"Â'&W6–FVçE÷W&µöFWF–Ç2"—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð¢²‡6VÆV7FVBç&sòæ—5vFW&Æöõ&²ÇÂ6VÆV7FVBæ—5vFW&Æöõ&²’bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ã3‚ÂGW&F–öã¢ã‚×Óà¢ÅvFW&ÆöôFWF–Ç2Æ6S×·6VÆV7FVGÒÖöFS×·W&Å7FFRæÖöFWÒóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢²ÆVvVæG5&W6–FVçF–Ä6öçFVçBbb—4F7F÷bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãC‚ÂGW&F–öã¢ã‚×Óà¢ÄFF÷W$FWF–Ç2Æ6S×·6VÆV7FVGÒÆ6W3×·Æ6W7Òöå6VÆV7C×·6VÆV7EÆ6WÒ6fVD–G3×·6fVD–G7Òöå6fS×²‚’ÓâFövvÆU6fVB‡6VÆV7FVB—Òóà¢ÂöÖ÷F–öâæF—cà¢—Ð¢²ÆVvVæG5&W6–FVçF–Ä6öçFVçBbb—4F7F÷bb7F—fT6öÆÆV7F–öå&÷WFSòç7F÷3òæÆVæwF‚bb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãS"ÂGW&F–öã¢ã‚×Óà¢ÄæV&'”6öçFW‡@¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢&÷WFS×¶7F—fT6öÆÆV7F–öå&÷WFWÐ¢6fVD–G3×·6fVD–G7Ð¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð ¢²ÆVvVæG5&W6–FVçF–Ä6öçFVçBbb—4F7F÷bb—4–ä¶–æDF–æ–ærbb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãSbÂGW&F–öã¢ã‚×Óà¢ÄæV&'”6öçFW‡@¢Æ6S×·6VÆV7FVGÐ¢Æ6W3×·Æ6W7Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢&÷WFS×¶7F—fT6öÆÆV7F–öå&÷WFWÐ¢6fVD–G3×·6fVD–G7Ð¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð ¢²—5&VçFÂbbÆVvVæG5&W6–FVçF–Ä6öçFVçBbb—4–ä¶–æDF–æ–ærbb€¢ÆÖ÷F–öâæF—b–æ—F–Ã×·²÷6—G“¢Â“¢×Òæ–ÖFS×·²÷6—G“¢Â“¢×ÒG&ç6—F–öã×·²FVÆ“¢ãcBÂGW&F–öã¢ã‚×Óà¢ÄVçF—G”76—7Fç@¢Æ6S×·6VÆV7FVGÐ¢ÖöFS×·W&Å7FFRæÖöFWÐ¢ç7vW#×¶VçF—G”ç7vW'Ð¢ÆöF–æs×¶VçF—G”76—7FçDÆöF–æwÐ¢öä6³×¶6´VçF—G”76—7FçGÐ¢öä6Æ÷6S×²‚’Óâ6WDVçF—G”ç7vW"†çVÆÂ—Ð¢öå6VÆV7C×·6VÆV7EÆ6WÐ¢óà¢ÂöÖ÷F–öâæF—cà¢—Ð ¢¶—5&÷W'G’bbÆVvVæG4Æ—7F–ærbb€¢ÄÆVvVæG46öçF7Df÷&Ð¢f÷&Ô–C×¶6öçF7Df÷&Ô–GÐ¢Æ—7F–æs×·°¢ââæÆVvVæG4Æ—7F–ærÀ¢gVÆÄFG&W73¢G¶ÆVvVæG4Æ—7F–æræFG&W77ÒÂG¶ÆVvVæG4Æ—7F–æræ6—G—ÒÂG¶ÆVvVæG4Æ—7F–ærç7FFWÒG¶ÆVvVæG4Æ—7F–ærç¦—ÖÀ¢×Ð¢óà¢—Ð ¢¶—5&÷W'G’bbÆVvVæG4Æ—7F–ærbb€¢Æf÷&Ð¢–C×¶6öçF7Df÷&Ô–GÐ¢öå7V&Ö—C×²†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢6WDvVçDf÷&Õ7V&Ö—GFVB‡G'VR“°¢×Ð¢6Æ74æÖSÒ&GÖ6öçF7BÖ6öçF–çVF–öâ×BÓ‚ÖC¦×BÓ ¢à¢ÆF—cà¢ÆF—b6Æ74æÖSÒ'FW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²4$dCdÒ#ä–çFW&W7FVCóÂöF—cà¢Æƒ26Æ74æÖSÒ&×BÓFW‡BÕ³g…ÒföçB×6VÖ–&öÆBFW‡BÕ²3#c35Ò#ä–çFW&W7FVB–âÆ—f–ær†W&SóÂöƒ3à¢ÂöF—cà ¢¶vVçDf÷&Õ7V&Ö—GFVBò€¢ÆF—b6Æ74æÖSÒ&×BÓR&÷&FW"×B&÷&FW"Õ·&v&ƒÃ3ÃSÂãb•ÒBÓRFW‡BÕ³7…ÒÆVF–ærÓRFW‡BÕ²3#c35Òós#à¢6VçBâF†RÆ—7F–ær&WVW7B—2&VG’f÷"F†RvVçBv—F‚F†—2&÷W'G’GF6†VBà¢ÂöF—cà¢’¢€¢Ãà¢ÆF—b6Æ74æÖSÒ&×BÓ2w&–BvÓ"6Ó¦w&–BÖ6öÇ2Ó"ÖC¦×BÓB#à¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢æÖP¢Æ–çWB&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒósÖC¦‚Ó"Æ6V†öÆFW#Ò%–÷W"æÖR"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢VÖ–À¢Æ–çWB&WV—&VBG—SÒ&VÖ–Â"6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒósÖC¦‚Ó"Æ6V†öÆFW#Ò'–÷TW†×ÆRæ6öÒ"óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢†öæP¢Æ–çWB&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒósÖC¦‚Ó"Æ6V†öÆFW#Ò%†öæRçVÖ&W""óà¢ÂöÆ&VÃà¢ÆÆ&VÂ6Æ74æÖSÒ&w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢Ö÷fRF–ÖVÆ–æP¢Ç6VÆV7B&WV—&VB6Æ74æÖSÒ&‚Ó’G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒósÖC¦‚Ó#à¢Æ÷F–öãä4Âö÷F–öãà¢Æ÷F–öãã3ÓcF—3Âö÷F–öãà¢Æ÷F–öããcÓ“F—3Âö÷F–öãà¢Æ÷F–öãä§W7BW‡Æ÷&–æsÂö÷F–öãà¢Â÷6VÆV7Cà¢ÂöÆ&VÃà¢ÂöF—cà¢ÆÆ&VÂ6Æ74æÖSÒ&×BÓ"w&–BvÓFW‡BÕ³…ÒföçB×6VÖ–&öÆBWW&66RG&6¶–ærÕ³ã&VÕÒFW‡BÕ²3#c35ÒóSB#à¢ÖW76vR÷F–öæÀ¢ÇFW‡F&VæÖSÒ&ÖW76vR"6Æ74æÖSÒ&Ö–âÖ‚Ó#G×6ögBÖf–VÆB&÷VæFVBÕ³‡…Ò&r×v†—FR‚Ó2’Ó"FW‡BÕ³7…ÒföçBÖÖVF—VÒæ÷&ÖÂÖ66RG&6¶–ærÖæ÷&ÖÂFW‡BÕ²3#c35Ò÷WFÆ–æRÖæöæRfö7W3¦&÷&FW"Õ²4$dCdÒós"FVfVÇEfÇVS×¶’v÷VÆBÆ–¶RÖ÷&R–æf÷&ÖF–öâ&÷WBG·6VÆV7FVBææÖWÒæÒóà¢ÂöÆ&VÃà¢Æ'WGFöâG—SÒ'7V&Ö—B"6Æ74æÖSÒ&G×æVÂÖ7F–öâ×FW‡B×BÓR–æÆ–æRÖfÆW‚—FV×2Ö6VçFW"vÓãR#à¢7V&Ö—B–çFW&W7@¢Å6VæB6Æ74æÖSÒ&‚Ó2ãRrÓ2ãRFW‡BÕ²4$dCdÒÖC¦‚ÓBÖC§rÓB"óà¢Âö'WGFöãà¢Âóà¢—Ð¢Âöf÷&Óà¢—Ð¢ÂöÖ÷F–öâæF—cà¢“°¢Ò’‚—Ð¢Âö'F–6ÆSà¢ÂôæF—fTG&vW%6†VÆÃà¢—Ð¢Âôæ–ÖFU&W6Væ6Sà ¢·&W6–FVçE$ÖöFÂbb€¢Å&W6–FVçEW&µ&VFV×F–öå6†VW@¢FF×·&W6–FVçE$ÖöFÇÐ¢öä&6³×²‚’Óâ6WE&W6–FVçE$ÖöFÂ†çVÆÂ—Ð¢öä6Æ÷6S×²‚’Óâ6WE&W6–FVçE$ÖöFÂ†çVÆÂ—Ð¢óà¢—Ð ¢Ä&÷WDF÷vçF÷våW&·4ÖöFÂ÷Vã×¶&÷WD÷VçÒöä6Æ÷6S×²‚’Óâ6WD&÷WD÷Vâ†fÇ6R—Òóà¢ÂöF—cà¢“°§Ð