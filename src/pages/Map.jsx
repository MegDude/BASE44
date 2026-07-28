Warning: truncated output (original token count: 228458)
Total output lines: 19371

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

function formatSeoNumber(value, fallback = "—") {
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
  eyebrow: "Your building · Rainey District",
  subtitle: "Luxury residential · Rainey District",
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
  ["Banger's Sausage House & Beer Garden", ["banger", "banger’s", "banger's", "banger's sausage house", "banger's sausage house & beer garden"], "Beer garden and live energy nearby", "Drinks nearby", "The Banger's perk gives residents beer garden value tied to outdoor gatherings, live music energy, and easy Rainey-area group plans.", "Show the Resident Pass when the offer is active.", "Drinks"],
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
  return (…178458 tokens truncated…lse);
    navigate(`/map?mode=${urlState.mode}&tab=map&filter=${encodeURIComponent(activeFilter || "All")}`, { replace: true });
  }, [activeFilter, navigate, urlState.mode]);

  const restorePreviousMapPanel = useCallback(() => {
    const previous = popPanelState();
    if (!previous) {
      goBackToMap();
      return;
    }
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    updateActivePerksDrawerState(previous.drawerState);
    navigate(previous.url, { replace: true });
    window.setTimeout(() => {
      const list = document.querySelector("[data-active-perks-scroll='true']");
      if (list) list.scrollTop = previous.scrollTop || 0;
      if (previous.focusId) document.getElementById(previous.focusId)?.focus?.({ preventScroll: true });
    }, 0);
  }, [goBackToMap, navigate, popPanelState, updateActivePerksDrawerState]);

  const closeDirectoryToMap = useCallback(() => {
    beginSearchIntentTransition("All");
    setActiveBottomTab("map");
    setIntelOpen(false);
    setFiltersOpen(false);
    navigate(`/map?mode=${urlState.mode}&tab=map&filter=All`);
  }, [navigate, urlState.mode]);

  const closeSelectedMapDrawer = useCallback(() => {
    if (selected?.id) {
      fireWorkflow("/api/map-actions", buildMapActionPayload(selected, "panel_closed", "map_detail_panel", {
        metadata: { entityType: getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)), panelState: detailDrawerState },
      }));
    }
    clearPanelStack();
    inKindParentRef.current = null;
    setSelectedId("");
    setSelectedPlaceOverride(null);
    setSelectedDrawerClosed(true);
    setSelectedDrawerMinimized(false);
    setClusterDrawer(null);
    setMapAnswer(null);
    setActiveBottomTab("map");
    navigateMapJourney(
      {
        mode: urlState.mode,
        tab: "map",
        filter: activeFilter || "All",
        collection: urlState.collection || "",
        stopId: urlState.stopId || "",
        routeState: urlState.routeState || "",
      },
      { clearSelection: true, replace: true }
    );
  }, [activeFilter, clearPanelStack, detailDrawerState, navigateMapJourney, selected, urlState.collection, urlState.mode, urlState.perkId, urlState.routeState, urlState.stopId]);

  const dismissVisibleNativeDrawer = useCallback(() => {
    if (urlState.mode === "resident" && nativeDrawerState !== "collapsed") {
      setNativeDrawerState("collapsed");
      setConsoleCollapsed(true);
      return;
    }
    closeSelectedMapDrawer();
  }, [closeSelectedMapDrawer, nativeDrawerState, urlState.mode]);

  useEffect(() => {
    if (!selectedId) {
      const trigger = drawerTriggerRef.current;
      drawerTriggerRef.current = null;
      if (trigger?.isConnected) window.setTimeout(() => trigger.focus?.({ preventScroll: true }), 0);
      return undefined;
    }
    const drawer = document.getElementById("dp-active-map-drawer");
    if (!drawer) return undefined;
    const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(drawer.querySelectorAll(focusableSelector)).filter((node) => !node.hasAttribute("hidden"));
    window.requestAnimationFrame(() => focusables()[0]?.focus?.({ preventScroll: true }));
    if (detailDrawerState !== "full") return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const mapSurfaces = Array.from(document.querySelectorAll(".gm-style"));
    const previousInert = mapSurfaces.map((node) => node.inert);
    document.body.style.overflow = "hidden";
    mapSurfaces.forEach((node) => { node.inert = true; });

    function handleFullPanelKeyboard(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSelectedMapDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleFullPanelKeyboard);
    return () => {
      document.removeEventListener("keydown", handleFullPanelKeyboard);
      document.body.style.overflow = previousBodyOverflow;
      mapSurfaces.forEach((node, index) => { node.inert = previousInert[index]; });
    };
  }, [closeSelectedMapDrawer, detailDrawerState, selectedId]);

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
    const organizationId = readPartnerWorkspaceOrganizationId(location.search);
    navigate(withPartnerWorkspaceContext(`/map?mode=partner&tab=${panel}`, organizationId));
  }

  function openPartnerMap(filter = "All") {
    clearOpenMapSelection();
    setConsoleCollapsed(true);
    setActiveBottomTab("map");
    setActiveFilter(filter);
    const organizationId = readPartnerWorkspaceOrganizationId(location.search);
    navigate(withPartnerWorkspaceContext(`/map?mode=partner&tab=map&filter=${encodeURIComponent(filter)}`, organizationId));
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
  const hasOpenMapPanel =
    urlState.tab === "pass" ||
    activeBottomTab !== "map" ||
    Boolean(selected) ||
    Boolean(clusterDrawer) ||
    Boolean(activePartnerPanel);
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
  const showBottomNavigation = !urlState.embed && (urlState.tab === "map" || urlState.tab === "pass" || Boolean(urlState.panelTab));
  useBottomNavigationGeometry(showBottomNavigation);
  const mapPanelNavigationTitle = urlState.mode === "partner"
    ? ({ activity: "Activity", reports: "Reports", campaigns: "Campaigns", info: "Partner guide", civic: "Civic" }[activePartnerPanel] || activeFilter || "Partner map")
    : ({ perks: "Perks", events: "Events", saved: "Saved", info: "Guide" }[activeBottomTab] || activeFilter || "Downtown Austin");
  const configureMobilePanelSurface = useCallback((node) => {
    if (!node || typeof window === "undefined") return;
    // Canonical map detail sheets are governed entirely by the shared
    // stylesheet and state attributes. Clear any legacy inline geometry
    // before the generic native-drawer fallback can claim the surface.
    if (node.classList.contains("dp-map-detail-sheet")) {
      ["inset", "top", "right", "bottom", "left", "padding"].forEach((property) => node.style.removeProperty(property));
      return;
    }
    if (node.classList.contains("dp-native-drawer")) {
      node.style.setProperty("top", "auto", "important");
      node.style.setProperty("right", "0", "important");
      node.style.setProperty("bottom", "0", "important");
      node.style.setProperty("left", "0", "important");
      node.style.setProperty("padding", "0 0 var(--dp-bottom-nav-total-height)", "important");
      return;
    }

    const ownedProperties = [
      "position", "inset", "top", "right", "bottom", "left", "width", "min-width", "max-width", "height", "min-height", "max-height",
      "display", "grid-template-rows", "margin", "padding", "overflow", "border", "border-radius", "box-shadow", "z-index",
    ];
    const panelRail = node.querySelector(":scope > .dp-panel-toolbar, :scope > .dp-panel-header, :scope > .dp-map-panel-header, :scope > .dp-map-directory-toolbar");
    const panelBody = node.querySelector(":scope > .dp-panel-body, :scope > .dp-grouped-list, :scope > .dp-map-panel-scroll, :scope > .dp-map-directory-content");
    const childOwnedProperties = ["grid-row", "grid-column", "display", "grid-template-columns", "align-items", "box-sizing", "width", "min-width", "max-width", "height", "min-height", "max-height", "margin", "padding", "border", "border-bottom", "background", "box-shadow", "overflow-x", "overflow-y"];
    ownedProperties.forEach((property) => node.style.removeProperty(property));
    [panelRail, panelBody].forEach((element) => {
      childOwnedProperties.forEach((property) => element?.style.removeProperty(property));
    });
    panelRail?.querySelectorAll(":scope > button").forEach((button) => {
      ["grid-column", "width", "min-width", "max-width", "height", "min-height", "max-height", "margin", "padding"].forEach((property) => button.style.removeProperty(property));
    });
    const isDetailPanel = node.dataset.panelLayout === "detail";
    const isCompactViewport = window.matchMedia("(max-width: 767px)").matches;
    const detailHeight = "min(78dvh, calc(100dvh - 76px - env(safe-area-inset-bottom, 0px)))";
    const detailWidth = isCompactViewport ? "100dvw" : "min(760px, 100dvw)";
    const panelGeometry = {
      position: "fixed",
      inset: "auto",
      top: isDetailPanel ? "auto" : "0",
      right: "0",
      bottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      left: "0",
      width: isDetailPanel ? detailWidth : "100dvw",
      "min-width": isDetailPanel ? "0" : "100dvw",
      "max-width": isDetailPanel ? detailWidth : "100dvw",
      height: isDetailPanel ? detailHeight : "calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))",
      "min-height": isDetailPanel ? "0" : "calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))",
      "max-height": isDetailPanel ? detailHeight : "calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))",
      display: "grid",
      "grid-template-rows": "calc(56px + env(safe-area-inset-top, 0px)) minmax(0, 1fr)",
      margin: "0",
      padding: "0",
      overflow: "hidden",
      "z-index": "1500",
    };

    Object.entries(panelGeometry).forEach(([property, value]) => {
      node.style.setProperty(property, value, "important");
    });

    const applyImportant = (element, properties) => {
      Object.entries(properties).forEach(([property, value]) => element?.style.setProperty(property, value, "important"));
    };
    applyImportant(panelRail, {
      "grid-row": "1",
      display: "grid",
      "grid-template-columns": "44px minmax(0, 1fr) 44px",
      "align-items": "center",
      "box-sizing": "border-box",
      width: "100%",
      "min-width": "0",
      "max-width": "none",
      height: "calc(56px + env(safe-area-inset-top, 0px))",
      "min-height": "calc(56px + env(safe-area-inset-top, 0px))",
      "max-height": "calc(56px + env(safe-area-inset-top, 0px))",
      margin: "0",
      padding: "calc(6px + env(safe-area-inset-top, 0px)) 8px 6px",
      border: "0",
      "border-bottom": "0",
      background: "transparent",
      "box-shadow": "none",
    });
    const railButtons = panelRail ? Array.from(panelRail.querySelectorAll(":scope > button")) : [];
    railButtons.forEach((button, index) => {
      applyImportant(button, {
        "grid-column": index === 0 ? "1" : index === railButtons.length - 1 ? "3" : "auto",
        width: "44px",
        "min-width": "44px",
        "max-width": "44px",
        height: "44px",
        "min-height": "44px",
        "max-height": "44px",
        margin: "0",
        padding: "0",
      });
    });
    applyImportant(panelBody, {
      "grid-row": "2",
      width: "100%",
      "min-width": "0",
      "max-width": "none",
      height: "100%",
      "min-height": "0",
      "max-height": "none",
      margin: "0",
      "overflow-x": "hidden",
      "overflow-y": "auto",
    });

    // Older map containment styles use intentionally high specificity. Inline
    // priority keeps every active panel on the same viewport-safe surface.
    const innerControls = node.querySelector(".dp-map-panel-scroll .dp-entity-drawer > .dp-drawer-control-row:first-child");
    innerControls?.style.setProperty("display", "none", "important");
  }, []);

  useEffect(() => {
    const refreshMobilePanels = () => {
      document.querySelectorAll("[data-mobile-panel-surface='true']").forEach(configureMobilePanelSurface);
    };
    refreshMobilePanels();
    window.addEventListener("resize", refreshMobilePanels);
    return () => window.removeEventListener("resize", refreshMobilePanels);
  }, [configureMobilePanelSurface]);

  const embedLoadEventKeyRef = useRef("");
  const fullMapHref = useMemo(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.delete("embed");
    return `/map?${params.toString()}`;
  }, [urlState.embed]);

  useEffect(() => {
    if (!urlState.embed) return;
    const eventKey = [
      urlState.entityId,
      urlState.campaignId,
      urlState.partnerId,
      urlState.collection,
      urlState.route,
      urlState.source,
      urlState.utmCampaign,
      district,
    ].join("|");
    if (embedLoadEventKeyRef.current === eventKey) return;
    embedLoadEventKeyRef.current = eventKey;
    fireWorkflow("/api/events", {
      type: "embed.loaded",
      sessionId: getWorkflowSessionId(),
      entityId: urlState.entityId || undefined,
      campaignId: urlState.campaignId || undefined,
      partnerId: urlState.partnerId || undefined,
      district: isAllNeighborhoodScope(district) ? undefined : district,
      source: urlState.source,
      metadata: {
        collectionId: urlState.collection || undefined,
        routeId: urlState.route || undefined,
        utmCampaign: urlState.utmCampaign || undefined,
      },
    });
  }, [district, urlState.campaignId, urlState.collection, urlState.embed, urlState.entityId, urlState.partnerId, urlState.route, urlState.source, urlState.utmCampaign]);

  return (
    <div
      className={`dp-map-page relative h-screen overflow-hidden bg-white text-[#0B1F33] ${urlState.mode === "partner" ? "dp-map-page-partner" : "dp-map-page-resident"} ${urlState.embed ? "dp-map-page-embedded" : ""}`}
      data-map-zoom={mapZoom.toFixed(2)}
      data-top-map-back="false"
    >
      {urlState.embed ? (
        <header className="dp-embed-map-header">
          <div className="dp-embed-map-header__brand">
            <strong>Downtown Perks</strong>
            <span>{activeCollection?.title || (isAllNeighborhoodScope(district) ? "Downtown Austin" : district)}</span>
          </div>
          <div className="dp-embed-map-header__summary">
            <span>{contextCount} {contextCount === 1 ? "place" : "places"}</span>
            {urlState.source !== "embedded-map" ? <span>From {urlState.source.replace(/-/g, " ")}</span> : null}
          </div>
          <a
            href={fullMapHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => fireWorkflow("/api/events", {
              type: "embed.opened_full_map",
              sessionId: getWorkflowSessionId(),
              source: urlState.source,
              campaignId: urlState.campaignId || undefined,
              partnerId: urlState.partnerId || undefined,
              metadata: { collectionId: urlState.collection || undefined, routeId: urlState.route || undefined },
            })}
          >
            Open full map <ArrowRight aria-hidden="true" />
          </a>
        </header>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 top-0">
        <GoogleMapErrorBoundary>
          <GoogleMapCanvas
            center={initialMapView.center}
            zoom={initialMapView.zoom}
            markerLayoutZoom={markerLayoutContext.zoom}
            mapItems={clusteredMapItems}
            collectionRoute={activeCollectionRoute}
            fitPlaces={activeCollectionRoute?.stops?.length ? activeCollectionRoute.stops : discoverDisplayPlaces}
            fitActiveKey={mapResultBoundsKey}
            fitEnabled={hasActiveCategoryScope && !isCleanResidentPerksLaunch && !userHasNavigatedMap && !isStreetLevelMapView}
            selected={selected}
            selectedId={selectedId}
            pulsingPinId={pulsingPinId}
            onSelect={activeCollectionRoute?.stops?.length ? focusCollectionStop : selectPlace}
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
            }}
            onBrowsePerks={() => {
              beginSearchIntentTransition("Perks");
              setConsoleCollapsed(true);
              setActiveBottomTab("perks");
              navigate("/map?mode=resident&tab=map&filter=Perks");
            }}
          />
        </GoogleMapErrorBoundary>
      </div>

      {urlState.tab === "map" && activeCollectionRoute?.stops?.length && (!selected || selectedDrawerClosed || Boolean(urlState.drawerClosed)) ? (
        <RouteExperienceSheet
          route={activeCollectionRoute}
          mode={urlState.mode}
          routeState={urlState.routeState}
          selectedStopId={urlState.stopId || selectedId}
          relatedRoutes={activeRelatedRoutes}
          onSelectStop={focusCollectionStop}
          onOpenStop={openCollectionStop}
          onPrimaryAction={startCollectionRoute}
          onOpenRelatedRoute={openCollectionRoute}
          onExit={exitCollectionRoute}
        />
      ) : null}

      {urlState.tab === "map" && (
        <div
          className="dp-map-search-anchor pointer-events-none absolute inset-x-0 top-[72px] z-[680] px-2.5 md:top-[80px] md:px-5"
        >
          <div className="dp-map-top-nav">
            <MapSearchConsole
              mode={urlState.mode}
              query={search}
              placeholder={searchPlaceholder}
              activeIntent={urlState.mode === "partner" ? urlState.intent : residentSearchIntent.intent}
              activeTime={residentSearchIntent.time}
              activeRadius={radius}
              activeFilter={activeFilter}
              activeCollection={urlState.collection}
              resultCount={mapPlaces.length}
              visibleResultIds={mapPlaces.flatMap((place) => [place.id, place.entity_id, place.entityId]).filter(Boolean)}
              requestStatus={scopedRequestStatus}
              lastTrigger={scopedLastTrigger}
              catalogState={catalogState}
              onCatalogResultSelect={selectCatalogResult}
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
                setSearch("");
                setActiveFilter("All");
                setSelectedId("");
                setSelectedPlaceOverride(null);
                setMapAnswer(null);
                clearScopedMapResults();
                urlState.update({
                  mode,
                  tab: "map",
                  filter: "All",
                  query: "",
                  q: "",
                  prompt: "",
                  intent: "",
                  entityId: "",
                  entityType: "",
                  collection: "",
                });
              }}
              isCollapsed={shouldCollapseSearchConsole}
              onCollapse={() => setConsoleCollapsed(true)}
              onExpand={() => setConsoleCollapsed(false)}
              hasTopMapBack={false}
            />
          </div>
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
              <span className="dp-panel-header-title text-[9px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A] md:text-[10px] md:tracking-[0.16em]">
                Partner scanner
              </span>
              <button type="button" onClick={() => switchMode(urlState.mode, "map")} className="dp-panel-close inline-flex h-8 w-8 items-center justify-center rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] md:h-9 md:w-9" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="dp-pass-panel-body min-h-0 flex-1 overflow-y-auto px-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 sm:px-4 md:pb-4 md:pt-3">
                <div className="px-3 pt-1 sm:px-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#BFA46A] md:text-[10px] md:tracking-[0.16em]">QR verification</p>
                  <h2 className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.025em] text-[#0B1F33] md:mt-1.5 md:text-[25px]">Scan a resident pass</h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#425466]">
                    Check eligibility, review the perk, and record the result.
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
              {!isAuthenticated && !isLoadingAuth ? (
                <section className="dp-resident-card-identity dp-resident-card-identity--signed-out">
                  <p className="dp-map-panel-eyebrow">RESIDENT ACCESS</p>
                  <h2 className="dp-map-panel-title">Sign in to your resident card.</h2>
                  <p className="dp-map-panel-subtitle">See your membership, home property, saved places, and one-time QR pass in one secure view.</p>
                </section>
              ) : null}
              {isLoadingAuth ? (
                <section className="dp-resident-card-identity" role="status">
                  <p className="dp-map-panel-eyebrow">RESIDENT ACCESS</p>
                  <h2 className="dp-map-panel-title">Checking your account.</h2>
                  <p className="dp-map-panel-subtitle">Your resident details will appear here when they are ready.</p>
                </section>
              ) : null}
              {isAuthenticated ? (
                <>
                  <section className="dp-resident-card-identity">
                    <p className="dp-map-panel-eyebrow">RESIDENT ACCESS</p>
                    <h2 className="dp-map-panel-title">{residentAccount?.fullName || "Your Downtown Card"}</h2>
                    <p className="dp-map-panel-subtitle">
                      {residentAccount?.buildingName ? `${residentAccount.buildingName} is connected to this resident card.` : "Use your card when a participating place or event asks to confirm resident access."}
                    </p>
                  </section>

                  <section className={`dp-card-credential ${passPresented ? "is-ready" : ""}`} aria-label="Resident QR code">
                    <div className="dp-card-credential-header">
                      <span className="dp-card-credential-kicker">{residentAccountStatus(residentAccount).toUpperCase()}</span>
                      <span className="dp-card-credential-status">{passPresented ? "Scanned" : "Ready"}</span>
                    </div>
                    <h3 className="dp-card-credential-title">{residentAccount?.buildingName || residentAccount?.buildingDistrict || "Downtown Austin"}</h3>
                    <p className="dp-card-credential-copy">
                      {passPresented ? "Resident access is confirmed for this visit." : "Show this QR code when a participating partner asks to confirm resident access."}
                    </p>
                    <div className="dp-card-qr-wrap"><DemoQrCode code={residentCardPayload.qrValue} className="dp-card-qr-image" /></div>
                    <div className="dp-card-scan-demo" aria-live="polite">
                      <span>{passPresented ? "Resident access confirmed" : "Ready when a partner asks"}</span>
                      <button type="button" onClick={presentResidentPass}>{passPresented ? "Show again" : "Show QR"}</button>
                    </div>
                    <div className="dp-card-verification-row">
                      <span>{residentAccountStatus(residentAccount)}{residentAccount?.buildingName ? ` · ${residentAccount.buildingName}` : ""}</span>
                      <code>{residentCardPayload.uid}</code>
                    </div>
                  </section>

                  <MapPanelMatrix label="YOUR ACCOUNT">
                    <MapPanelMatrixRow label="Name" value={residentAccount?.fullName || user?.full_name || user?.email || "Resident"} />
                    <MapPanelMatrixRow label="Email" value={residentAccount?.email || user?.email || "Not added"} />
                    <MapPanelMatrixRow label="Home" value={residentAccount?.buildingName || "Not connected"} />
                    <MapPanelMatrixRow label="Status" value={residentAccountStatus(residentAccount)} />
                    <MapPanelMatrixRow label="Renewal" value={residentAccount?.renewalDate || residentAccount?.expiresAt || "No renewal date"} />
                  </MapPanelMatrix>

                  <section className="dp-map-panel-section dp-map-panel-section--compact" aria-label="Current access">
                    <p className="dp-map-panel-section-label">WHAT YOU CAN USE</p>
                    <h3 className="dp-map-panel-section-title">Resident benefits nearby</h3>
                    <p className="dp-map-panel-body-copy">Open a participating perk to review its current terms, then show a one-time QR when the partner asks.</p>
                  </section>

                  <section className="dp-map-panel-note">
                    <p className="dp-map-panel-section-label">BUILDING MEMBERSHIP</p>
                    <p className="dp-map-panel-body-copy">If your building is an active Downtown Perks or DANA member, eligible resident access is included automatically.</p>
                  </section>
                </>
              ) : null}
            </div>
            <footer className="dp-map-sheet-action-footer">
              {isAuthenticated ? (
                <>
                  <MapPanelButton action="open-detail" label={passPresented ? "Confirmed" : "Show QR"} ariaLabel={passPresented ? "Show confirmed resident QR again" : "Show resident QR code"} variant="primary" onPress={presentResidentPass} />
                  <div className="dp-map-sheet-action-grid">
                    <MapPanelButton action="open-detail" label="Profile" ariaLabel="Open resident profile" variant="secondary" onPress={() => navigate("/resident/home?panel=card")} />
                    <MapPanelButton action="open-detail" label="Add Wallet" ariaLabel={walletAdded ? "Add wallet already completed" : "Add card to wallet"} variant="secondary" onPress={saveResidentPassForLater} />
                  </div>
                  <button type="button" className="dp-resident-card-signout" onClick={() => logout(true, "/residents/login")}>Sign out</button>
                </>
              ) : !isLoadingAuth ? (
                <div className="dp-map-sheet-action-grid">
                  <MapPanelButton action="open-detail" label="Sign in" ariaLabel="Sign in to resident access" variant="primary" onPress={() => navigate(`/residents/login?returnTo=${encodeURIComponent("/map?mode=resident&tab=pass")}`)} />
                  <MapPanelButton action="open-detail" label="Create account" ariaLabel="Create a resident account" variant="secondary" onPress={() => navigate("/residents/membership")} />
                </div>
              ) : null}
            </footer>
          </MapSheet>
        </div>
      )}

	      {showBottomNavigation && (
        <div data-dp-bottom-navigation="true" className="dp-native-bottom-nav dp-map-bottom-nav-shell pointer-events-none fixed inset-x-0 bottom-0 z-[700] pb-[env(safe-area-inset-bottom)]">
          <nav
            className="dp-native-bottom-nav-list dp-map-bottom-nav pointer-events-auto grid grid-cols-5"
            aria-label="Map bottom navigation"
            role="tablist"
            style={{ "--dp-bottom-nav-count": 5 }}
          >
            {urlState.mode === "resident" && (
              <>
                <button
                  type="button"
                  role="tab"
                  aria-label="Home"
                  onClick={() => navigate("/resident/home")}
                  aria-selected={false}
                >
                  <House className="h-4 w-4" />
                  <span className="dp-native-tab-label">Home</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Map"
                  onClick={() => {
                    beginSearchIntentTransition("All");
                    setConsoleCollapsed(true);
                    setActiveBottomTab("map");
                    navigate("/map?mode=resident&tab=map&filter=All");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "map" && activeFilter === "All"}
                  aria-selected={urlState.tab === "map" && activeBottomTab === "map" && activeFilter === "All"}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="dp-native-tab-label">Map</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Perks"
                  onClick={() => {
                    if (activeBottomTab === "perks" && !selectedId) {
                      updateActivePerksDrawerState(activePerksDrawerState === "peek" ? "expanded" : "peek");
                      return;
                    }
                    beginSearchIntentTransition("Perks");
                    setConsoleCollapsed(true);
                    setActiveBottomTab("perks");
                    updateActivePerksDrawerState("expanded");
                    navigate("/map?mode=resident&tab=perks&filter=Perks");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "perks"}
                  aria-selected={urlState.tab === "map" && activeBottomTab === "perks"}
                >
                  <Gift className="h-4 w-4" />
                  <span className="dp-native-tab-label">Perks</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Events"
                  onClick={() => {
                    beginSearchIntentTransition("Events");
                    setConsoleCollapsed(true);
                    setActiveBottomTab("events");
                    navigate("/map?mode=resident&tab=events&filter=Events");
                  }}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "events"}
                  aria-selected={urlState.tab === "map" && activeBottomTab === "events"}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="dp-native-tab-label">Events</span>
                </button>
                <button type="button" role="tab" aria-label="Card" onClick={() => switchMode("resident", "pass")} aria-selected={urlState.tab === "pass"}>
                  <CreditCard className="h-4 w-4" />
                  <span className="dp-native-tab-label">Card</span>
                </button>
              </>
            )}
            {urlState.mode === "partner" && (
              <>
                <button
                  type="button"
                  role="tab"
                  aria-label="Home"
                  onClick={() => navigate(withPartnerWorkspaceContext("/partner-workspace/overview", readPartnerWorkspaceOrganizationId(location.search)))}
                  aria-selected={false}
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="dp-native-tab-label">Home</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Map"
                  onClick={() => openPartnerMap("All")}
                  aria-pressed={urlState.tab === "map" && activeBottomTab === "map"}
                  aria-selected={urlState.tab === "map" && activeBottomTab === "map"}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="dp-native-tab-label">Map</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Publish"
                  onClick={() => navigate(withPartnerWorkspaceContext("/partner-workspace/publish", readPartnerWorkspaceOrganizationId(location.search)))}
                  aria-selected={false}
                >
                  <Megaphone className="h-4 w-4" />
                  <span className="dp-native-tab-label">Publish</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Performance"
                  onClick={() => navigate(withPartnerWorkspaceContext("/partner-workspace/performance", readPartnerWorkspaceOrganizationId(location.search)))}
                  aria-selected={false}
                >
                  <Activity className="h-4 w-4" />
                  <span className="dp-native-tab-label">Performance</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-label="Workspace"
                  onClick={() => navigate(withPartnerWorkspaceContext("/partner-workspace/workspace", readPartnerWorkspaceOrganizationId(location.search)))}
                  aria-selected={false}
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  <span className="dp-native-tab-label">Workspace</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      <AnimatePresence>
        {urlState.mode === "resident" && urlState.tab === "map" && activeBottomTab === "perks" && !selected && (
          <ActivePerksSheet
            items={activePerkItems}
            drawerState={activePerksDrawerState}
            savedIds={savedIds}
            redeemedIds={redeemedPerkIds}
            initialScrollTop={peekPanelState()?.scrollTop || 0}
            onDrawerStateChange={updateActivePerksDrawerState}
            onClose={closeActivePerksSheet}
            onOpen={openActivePerkItem}
            onRedeem={(item) => openResidentQrModal(item.place, "use_perk", "active_perks_sheet")}
            onSave={(item) => toggleSaved(item.place)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(urlState.tab === "map" || Boolean(urlState.panelTab)) && (
          urlState.mode === "partner"
            ? Boolean(activePartnerPanel) || isLegendsDirectoryLayer
            : ["perks", "events", "saved", "info"].includes(activeBottomTab) || isRentalLayer || isLegendsDirectoryLayer
        ) && !(urlState.mode === "resident" && activeBottomTab === "perks") && (!selected || selectedDrawerClosed || activePartnerPanel) && (
          <motion.aside
            ref={configureMobilePanelSurface}
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={isLegendsDirectoryLayer
              ? "dp-native-drawer dp-map-directory-sheet dp-legends-directory-sheet"
              : `dp-native-drawer dp-panel-shell dp-map-drawer-shell ${isResidentSavedDrawer ? "dp-saved-drawer-shell" : ""} ${isResidentEventsDrawer ? "dp-resident-events-drawer" : ""} ${activePartnerPanel === "campaigns" ? "dp-map-campaign-drawer" : ""} ${activePartnerPanel === "reports" ? "dp-map-reports-drawer" : ""} absolute inset-x-0 bottom-0 z-[620] mx-auto flex max-h-[min(88dvh,calc(100dvh-72px))] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[12px] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:max-h-[64dvh] md:rounded-t-[12px]`}
            style={MAP_DRAWER_SURFACE_STYLE}
            data-drawer-state={isResidentEventsDrawer ? "full" : "expanded"}
            data-mobile-panel-surface="true"
            role="dialog"
            aria-modal="true"
            aria-label={isLegendsDirectoryLayer ? "Legends Real Estate listings" : urlState.mode === "partner" && activePartnerPanel === "reports" ? "Partner map reports" : urlState.mode === "partner" ? "Partner map results" : "Map results"}
          >
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
                  <span className="dp-panel-toolbar-title">{mapPanelNavigationTitle}</span>
                  <button
                    type="button"
                    onClick={goBackToMap}
                    className="dp-panel-close flex h-8 w-8 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] md:h-9 md:w-9"
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
                    Active Legends homes with building context, walkable demand, and nearby lifestyle details for each address.
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
                  <strong>{residentResultCountLabel}</strong>
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
                            <button type="button" onClick={() => selectPlace(place)}>View perk</button>
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
            ref={configureMobilePanelSurface}
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="dp-native-drawer dp-panel-shell dp-map-drawer-shell absolute inset-x-0 bottom-0 z-[640] mx-auto flex max-h-[min(88dvh,calc(100dvh-72px))] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-t-[12px] md:max-h-[68dvh] md:rounded-t-[12px]"
            data-drawer-state="expanded"
            style={MAP_DRAWER_SURFACE_STYLE}
            data-mobile-panel-surface="true"
            role="dialog"
            aria-modal="true"
            aria-label="Grouped map places"
          >
            <div className="dp-panel-header shrink-0">
              <button type="button" onClick={goBackToMap} className="dp-panel-back" aria-label="Back to map">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="dp-panel-header-copy">
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
          <NativeDrawerShell
            id="dp-active-map-drawer"
            ref={configureMobilePanelSurface}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={isInKindNetworkEntity(selected)
              ? "dp-native-drawer dp-map-detail-sheet dp-inkind-partner-drawer dp-map-panel dp-panel-shell dp-detail-drawer dp-destination-drawer dp-detail-framework dp-map-drawer-panel dp-ios-fullscreen-map-panel"
              : `dp-native-drawer dp-map-detail-sheet dp-map-panel dp-panel-shell dp-detail-drawer dp-destination-drawer dp-detail-framework dp-map-drawer-panel dp-ios-fullscreen-map-panel ${usesCleanResidentialEntityDrawer(selected) ? "dp-entity-drawer-shell" : ""} ${shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? "dp-partner-destination-sheet" : ""}`}
            data-panel-kind={getMapDrawerPanelKind(selected, urlState.mode, Boolean(urlState.perkId))}
            data-panel-layout="detail"
            data-drawer-state={detailDrawerState}
            data-sheet-state={detailDrawerState}
            data-mode={urlState.mode}
            data-entity-type={getCanonicalDetailEntityType(selected, Boolean(urlState.perkId))}
            data-mobile-panel-surface="true"
            aria-labelledby={["perk", "event", "campaign", "portfolio"].includes(getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)))
              ? `canonical-detail-title-${selected.id}`
              : shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? `partner-drawer-title-${selected.id}` : undefined}
            aria-label={["perk", "event", "campaign", "portfolio"].includes(getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)))
              ? undefined
              : shouldUsePartnerIntelligenceDrawer(selected, urlState.mode) ? undefined : `${selected.name} details`}
            drawerState={detailDrawerState}
            panelKind={getMapDrawerPanelKind(selected, urlState.mode, Boolean(urlState.perkId))}
            scrollClassName="dp-map-detail-scroll dp-map-panel-scroll dp-destination-scroll dp-drawer-scroll"
            onDrawerStateChange={updateDetailDrawerState}
            onRequestClose={closeSelectedMapDrawer}
            header={<MapDetailHeader
              place={selected}
              navigationTitle={getMapDetailNavigationTitle(selected, Boolean(urlState.perkId), urlState.mode)}
              backLabel={getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)) === "perk" ? "Back to active perks" : "Back"}
              panelState={detailDrawerState}
              onPanelStateChange={updateDetailDrawerState}
              canGoBack={Boolean((isInKindEntity(selected) && !isInKindNetworkEntity(selected) && inKindParentRef.current) || peekPanelState())}
              onBack={() => {
                    const parent = inKindParentRef.current;
                    if (isInKindEntity(selected) && !isInKindNetworkEntity(selected) && parent) {
                      inKindParentRef.current = null;
                      selectPlace(parent);
                      setActiveFilter("inKind");
                      urlState.update({ filter: "inKind", collection: "inkind-dining-market", entityId: parent.id, listingId: "" });
                    } else restorePreviousMapPanel();
              }}
              onClose={closeSelectedMapDrawer}
            />}
            actions={<UniversalEntityActionRail
              place={selected}
              mode={urlState.mode}
              saved={savedIds.has(selected.id)}
              rsvped={(Array.isArray(eventRsvps) ? eventRsvps : []).some((item) => item.id === selected.id)}
              organizationId={readPartnerWorkspaceOrganizationId(location.search)}
              onSave={() => toggleSaved(selected)}
              onRsvp={() => toggleRsvp(selected)}
              onUsePerk={() => openResidentQrModal(selected, "use_perk", "universal_entity_action_rail")}
              onContact={() => {
                setAgentFormPlaceId(selected.id);
                setAgentFormSubmitted(false);
                window.setTimeout(() => document.getElementById(`map-contact-form-${selected.id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 80);
              }}
              onExplore={() => document.querySelector("#dp-active-map-drawer [data-building-section='overview'], #dp-active-map-drawer .dp-native-detail-panel__summary, #dp-active-map-drawer .dp-entity-summary")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              onTrack={(action, source) => fireWorkflow("/api/map-actions", buildMapActionPayload(selected, action, source, {
                metadata: {
                  entityType: getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)),
                  panelState: detailDrawerState,
                  sourceSurface: urlState.collection ? "collection" : "map",
                },
              }))}
            />}
          >
              <article className="dp-map-detail-content">
              {(() => {
                const entityKind = getResidentEntityKind(selected);
                const legendsListing = getResolvedLegendsListing(selected);
                const isRental = entityKind === "rental" || isRentalEntity(selected);
                const isCampaign = entityKind === "campaign" || isCampaignEntity(selected);
                const isPerkPanel = urlState.mode === "resident" && getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)) === "perk";
                const isProperty = !isRental && (entityKind === "property" || Boolean(legendsListing || getLuxuryPresenceBuilding(selected) || isLegendsListingLike(selected)));
                const isParking = isParkingEntity(selected);
                const isDaaStop = isDaaTourPlace(selected);
                const isDaaCivic = isDaaCivicEntity(selected);
                const isInKindDining = isInKindEntity(selected);
                const isInKindNetwork = isInKindNetworkEntity(selected);
                const isBurgerBarPanel = isBurgerBarCongress(selected);
                const isLocalService = isLocalServiceEntity(selected);
                const isFrostTowerPanel = isFrostTowerEntity(selected);
                const isNeighborhoodPanel = isNeighborhoodEntity(selected);
                const isHospitalityPortfolio = getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)) === "portfolio";
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
                const trackCanonicalDetailEvent = (eventName, metadata = {}) => {
                  fireWorkflow("/api/map-actions", buildMapActionPayload(selected, eventName, "canonical_detail_panel", {
                    metadata: {
                      entityType: getCanonicalDetailEntityType(selected, Boolean(urlState.perkId)),
                      panelState: detailDrawerState,
                      sourceSurface: urlState.collection ? "collection" : "map",
                      ...metadata,
                    },
                  }));
                };
                const openEntityFilter = (filter) => {
                  beginSearchIntentTransition(filter);
                  setActiveBottomTab("map");
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

                if (isHospitalityPortfolio) {
                  return (
                    <HospitalityPortfolioDrawer
                      place={selected}
                      places={places}
                      mode={urlState.mode}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      onAnalytics={trackCanonicalDetailEvent}
                    />
                  );
                }

                if (isInKindNetwork) {
                  return (
                    <InKindPartnerDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelectVenue={(venue) => {
                        inKindParentRef.current = selected;
                        selectPlace(venue);
                        setActiveFilter("inKind");
                        urlState.update({ filter: "inKind", collection: "inkind-dining-market", entityId: venue.id, listingId: "" });
                      }}
                      onShowVenues={() => {
                        beginSearchIntentTransition("inKind", { collection: "inkind-dining-market", intent: "inkind" });
                      }}
                    />
                  );
                }

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
                      onExplore={(prompt) => {
                        const nextFilter = resolveFilterForIntent(prompt, urlState.mode) || "Nearby";
                        beginSearchIntentTransition(nextFilter, { query: prompt, intent: getCanonicalIntentForFilter(nextFilter, prompt) });
                      }}
                      onOpenRoute={openCollectionRoute}
                      onBack={goBackToMap}
                      onClose={closeSelectedMapDrawer}
                    />
                  );
                }

                if (isCanonicalResidentialMixedUseEntity(selected)) {
                  return withStandardActionPanel(
                    <ResidentialMixedUseDrawer
                      place={selected}
                      places={places}
                      mode={urlState.mode}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      onExplore={(prompt) => {
                        const nextFilter = resolveFilterForIntent(prompt, urlState.mode) || "Nearby";
                        beginSearchIntentTransition(nextFilter, {
                          query: prompt,
                          intent: getCanonicalIntentForFilter(nextFilter, prompt),
                        });
                      }}
                      onOpenRoute={openCollectionRoute}
                      onBack={goBackToMap}
                      onClose={closeSelectedMapDrawer}
                    />
                  );
                }

                if (isProperty && !isRental && !legendsListing && !isLegendsMapPlace(selected) && !legendsResidentialProfile) {
                  return withStandardActionPanel(
                    <ResidentialMixedUseDrawer
                      place={selected}
                      places={places}
                      mode={urlState.mode}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      onExplore={(prompt) => {
                        const nextFilter = resolveFilterForIntent(prompt, urlState.mode) || "Nearby";
                        beginSearchIntentTransition(nextFilter, {
                          query: prompt,
                          intent: getCanonicalIntentForFilter(nextFilter, prompt),
                        });
                      }}
                      onOpenRoute={openCollectionRoute}
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
                      onExplore={(prompt) => {
                        const nextFilter = resolveFilterForIntent(prompt, urlState.mode) || "Nearby";
                        beginSearchIntentTransition(nextFilter, { query: prompt, intent: getCanonicalIntentForFilter(nextFilter, prompt) });
                      }}
                      onOpenRoute={openCollectionRoute}
                      onBack={goBackToMap}
                      onClose={closeSelectedMapDrawer}
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

                if (isHospitalityNetworkEntity(selected)) {
                  return (
                    <HospitalityNetworkDrawer
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
                  );
                }

                if (isInKindDining && urlState.mode === "resident") {
                  return (
                    <InKindResidentDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onSelect={selectPlace}
                      answer={entityAnswer}
                      loading={entityAssistantLoading}
                      onAsk={askEntityAssistant}
                      onCloseAnswer={() => setEntityAnswer(null)}
                    />
                  );
                }

                if (isInKindDining && urlState.mode === "partner") {
                  return (
                    <InKindPartnerOpportunityDrawer
                      place={selected}
                      places={places}
                      onSelect={selectPlace}
                      answer={entityAnswer}
                      loading={entityAssistantLoading}
                      onAsk={askEntityAssistant}
                      onCloseAnswer={() => setEntityAnswer(null)}
                    />
                  );
                }

                if (urlState.mode === "partner" && !isProperty) {
                  return withStandardActionPanel(
                    <PartnerIntelligenceDrawer
                      place={selected}
                      places={places}
                      onSelect={selectPlace}
                      onViewNearby={closeSelectedMapDrawer}
                      organizationId={readPartnerWorkspaceOrganizationId(location.search)}
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

                if (isPerkPanel) {
                  return (
                    <CanonicalPerkDetailDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onUse={() => {
                        fireWorkflow("/api/map-actions", buildMapActionPayload(selected, "perk_activation_started", "canonical_detail_panel"));
                        openResidentQrModal(selected, "use_perk", "canonical_detail_panel");
                        fireWorkflow("/api/map-actions", buildMapActionPayload(selected, "perk_qr_opened", "canonical_detail_panel"));
                      }}
                      onSelect={selectPlace}
                      onAnalytics={trackCanonicalDetailEvent}
                    />
                  );
                }

                if (urlState.mode === "resident" && isCampaign) {
                  return (
                    <CanonicalCampaignDetailDrawer
                      place={selected}
                      places={places}
                      savedIds={savedIds}
                      onSave={() => toggleSaved(selected)}
                      onJoin={() => {
                        trackCanonicalDetailEvent("campaign_joined");
                        const rawCampaign = selected.raw || {};
                        const firstStopId = (selected.activationStops || rawCampaign.activationStops || [])
                          .map((stop) => stop?.entityId || stop?.id)
                          .find(Boolean)
                          || (selected.participatingEntities || rawCampaign.participatingEntities || [])
                            .map(String)
                            .find((id) => id !== String(selected.id));
                        const firstStop = firstStopId ? resolveMapEntityFromCollection(firstStopId, places) : null;
                        if (firstStop) selectPlace(firstStop);
                        else toggleSaved(selected);
                      }}
                      onSelect={selectPlace}
                      onAnalytics={trackCanonicalDetailEvent}
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
                      onAnalytics={trackCanonicalDetailEvent}
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
                    {urlState.mode === "resident" && (hasActivePerkData(selected) || isProperty) && !isCampaign && !isRental && !legendsResidentialContent && !isHappyHourEntity(selected) && !isParking && !isInKindDining && !isBatheEntity(selected) && !isDaaStop && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.18 }}>
                        <ResidentPerkDetails
                          place={selected}
                          places={places}
                          savedIds={savedIds}
                          onSave={() => toggleSaved(selected)}
                          onUse={() => openResidentQrModal(selected, "use_perk", "resident_perk_details")}
                          onSelect={selectPlace}
                        />
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
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A]">Interested?</div>
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
                                <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#BFA46A]/70 md:h-10" placeholder="Your name" />
                              </label>
                              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Email
                                <input required type="email" className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#BFA46A]/70 md:h-10" placeholder="you@example.com" />
                              </label>
                              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Phone
                                <input required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#BFA46A]/70 md:h-10" placeholder="Phone number" />
                              </label>
                              <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                Move Timeline
                                <select required className="h-9 dp-soft-field rounded-[8px] bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#BFA46A]/70 md:h-10">
                                  <option>ASAP</option>
                                  <option>30-60 days</option>
                                  <option>60-90 days</option>
                                  <option>Just exploring</option>
                                </select>
                              </label>
                            </div>
                            <label className="mt-2 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                              Message optional
                              <textarea name="message" className="min-h-20 dp-soft-field rounded-[8px] bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#BFA46A]/70" defaultValue={`I would like more information about ${selected.name}.`} />
                            </label>
                            <button type="submit" className="dp-panel-action-text mt-5 inline-flex items-center gap-1.5">
                              Submit Interest
                              <Send className="h-3.5 w-3.5 text-[#BFA46A] md:h-4 md:w-4" />
                            </button>
                          </>
                        )}
                      </form>
                    )}
                  </motion.div>
                );
              })()}
              </article>
          </NativeDrawerShell>
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
