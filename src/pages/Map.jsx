import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronUp,
  CreditCard,
  Gift,
  Info,
  MapPin,
  QrCode,
  ScanLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import AboutDowntownPerksModal from "@/components/modals/AboutDowntownPerksModal";
import { useLocations } from "../lib/useLocations";
import { directionsUrl, campaignRoute, mapRoutes } from "../lib/map/mapActionRegistry";
import { resolveEntityGallery, resolveEntityImage } from "../lib/map/entityImageResolver";
import { resolveEntityPin } from "../lib/map/entityPinResolver";
import { useEventRsvpStore } from "@/store/event-rsvp-store";
import { SEARCH_PROMPTS } from "@/lib/mapSystemConstants";

const AUSTIN_CENTER = [30.2672, -97.7431];
const INITIAL_MAP_ZOOM = 15;
const FILTERS = [
  "All",
  "Perks",
  "Happy Hours",
  "inKind",
  "Properties",
  "Venues",
  "Hotels",
  "Brands",
  "Events",
  "Civic",
  "Services",
  "Local Guide",
];

const FILTER_MATCHERS = {
  Perks: ["offer", "perk", "deal", "discount", "reward", "card"],
  "Happy Hours": ["happy hour", "happy_hour"],
  inKind: ["inkind", "offer", "perk", "restaurant"],
  Properties: ["property", "residential", "apartment", "condo", "tower", "listing", "building"],
  Venues: ["venue", "bar", "restaurant", "coffee", "dining", "nightlife", "retail", "store"],
  Hotels: ["hotel", "hospitality", "stay", "guest"],
  Brands: ["brand", "sponsor", "rivian", "yeti", "ariat", "lululemon", "equinox", "legends real estate"],
  Events: ["event", "activation", "music", "show", "festival", "rsvp"],
  Civic: ["civic", "public", "district", "city"],
  Services: ["service", "concierge", "mobility", "parking"],
  "Local Guide": ["guide", "local", "downtown", "austin"],
};

const ASK_PROMPTS = SEARCH_PROMPTS.map((prompt) => prompt.q);

const NON_SEARCH_PROMPTS = [
  "Where do you want to go?",
  "What do you want to do?",
  "Who do you want to meet?",
  "Search downtown...",
  "Analyze intelligence...",
];

const ALL_NEIGHBORHOODS = "District";
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

const LIVE_CARD_URL = "https://downtown-perks-live.base44.app/card";
const DEMO_CARD_CODE = "DP-DEMO-78701";

function getResidentQrUrl(cardCode = DEMO_CARD_CODE) {
  const cardUrl = `${LIVE_CARD_URL}?code=${encodeURIComponent(cardCode)}&source=resident-map-pass`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(cardUrl)}`;
}

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
  if (activeFilter === "Happy Hours") return isHappyHourEntity(place);
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
  const scope = district === ALL_NEIGHBORHOODS ? "downtown" : district;
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
  const scope = district === ALL_NEIGHBORHOODS ? "downtown" : district;
  const audience = mode === "partner" ? "partner" : "resident";

  if (!topResults.length) return base;

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
          ? `The strongest current signals are ${names.join(", ")}. Use them to compare visibility, timing, and local context before launching an offer or campaign.`
          : `The map is showing ${names.join(", ")} first. Use this to scan events, perks, listings, and places without jumping between apps.`,
      picks: topResults,
    };
  }

  if (promptIntent === "do") {
    return {
      title: audience === "partner" ? "Actions the map can help with" : "A simple next move",
      body:
        audience === "partner"
          ? `Use ${names[0]} as the starting point, then open Intel or a campaign action to decide where to participate and who nearby should see it.`
          : `Pick ${names[0]} first, then save it, get directions, or compare similar nearby options. The map keeps the next step close to the decision.`,
      picks: topResults,
    };
  }

  return base;
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
  const listing = place?.raw?.legendsListing;
  return listing && typeof listing === "object" ? listing : null;
}

function isLegendsMapPlace(place) {
  return Boolean(getLegendsListing(place)) || String(place?.pinKey || place?.brand || place?.source || "").toLowerCase().includes("legends");
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

function escapeInlineJsString(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, " ");
}

function mapPinButtonHtml({ place, pin, ariaLabel, selected, pulsing, classes }) {
  const entityId = escapeInlineJsString(place.id);
  const escapedId = escapeHtmlAttribute(place.id);
  const escapedLabel = escapeHtmlAttribute(ariaLabel);
  const pinLabel = escapeHtmlAttribute(pin.label);
  const activeClass = selected ? "is-selected" : "";
  const pulseClass = pulsing ? "is-pulsing" : "";
  const openScript = `event.stopPropagation(); var dpUrl = new URL(window.location.href); dpUrl.searchParams.set('entityId', '${entityId}'); window.location.href = dpUrl.toString();`;

  return `<button type="button" class="dp-live-pin ${classes} ${activeClass} ${pulseClass}" data-entity-id="${escapedId}" data-pin-label="${pinLabel}" aria-label="${escapedLabel}" onclick="${openScript}" ondblclick="${openScript}"><span class="dp-live-pin__halo" aria-hidden="true"></span><span class="dp-live-pin__core">${pin.glyph}</span></button>`;
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
  const iconSize = isLegendsPin
    ? (selected ? [40, 40] : [36, 36])
    : isEventPin || isHappyHourPin
      ? (selected ? [29, 29] : [26, 26])
      : selected
        ? [31, 31]
        : [28, 28];
  const iconAnchor = isLegendsPin
    ? (selected ? [20, 20] : [18, 18])
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
      pulsing,
      classes: `${eventPinClass} ${happyHourPinClass} ${legendsPinClass}`,
    }),
    iconSize,
    iconAnchor,
    popupAnchor: [0, -18],
  });
}

function clusterIcon(count) {
  return L.divIcon({
    className: "dp-leaflet-cluster",
    html: `<div class="dp-map-cluster" aria-hidden="true"><span>${count}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function getClusterCellSize(zoom) {
  if (zoom >= 17) return 0;
  if (zoom >= 16) return 0.0012;
  if (zoom >= 15) return 0.0025;
  if (zoom >= 14) return 0.0045;
  return 0.008;
}

function clusterPlaces(places, zoom, selectedId) {
  const validPlaces = places.filter((place) => getPlaceCoords(place));
  const cellSize = getClusterCellSize(zoom);
  if (!cellSize) {
    return validPlaces.map((place) => ({ type: "place", id: place.id, place }));
  }

  const cells = new Map();
  const loosePlaces = [];

  validPlaces.forEach((place) => {
    if (place.id === selectedId) {
      loosePlaces.push({ type: "place", id: place.id, place });
      return;
    }

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

  return [...loosePlaces, ...clusters];
}

function PinBadge({ place, selected = false, size = "sm" }) {
  const pin = resolveEntityPin(place);
  const dimensions = size === "lg" ? "h-20 w-20 text-xl md:h-24 md:w-24 md:text-2xl" : "h-8 w-8 text-[11px] md:h-10 md:w-10 md:text-[12px]";

  return (
    <span
      className={`${dimensions} inline-flex shrink-0 items-center justify-center rounded-md font-semibold shadow-[0_10px_24px_rgba(11,31,51,0.07)] transition ${
        selected
          ? "bg-[#0B1F33] text-[#B38F4F]"
          : "bg-white/82 text-[#0B1F33]"
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
    <div className="dp-soft-tile bg-white/72 p-2">
      <img
        src={getResidentQrUrl(code)}
        alt={`Downtown Perks resident QR code for ${code}`}
        className="mx-auto h-28 w-28 rounded-[4px] bg-white object-contain"
      />
      <code className="mt-1.5 block text-center font-mono text-[9px] font-semibold tracking-[0.1em] text-[#B38F4F]">
        {code}
      </code>
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

function getResidentPerkDetails(place) {
  const raw = place?.raw || {};
  const embeddedPerk = raw.perk && typeof raw.perk === "object" ? raw.perk : null;
  const fallbackOffer = getResidentFallbackOffer(place);
  const listedOffer = cleanPerkValue(embeddedPerk?.title || raw.deals_offers || place?.deals_offers);
  const offer = listedOffer || fallbackOffer.title;
  const value = cleanPerkValue(embeddedPerk?.value || listedOffer) || fallbackOffer.value || "Resident card access";
  const description = listedOffer
    ? cleanDisplayCopy(embeddedPerk?.description) ||
      cleanDisplayCopy(raw.alignment_to_downtown_perks) ||
      cleanDisplayCopy(raw.summary) ||
      fallbackOffer.description
    : fallbackOffer.description;
  const terms = cleanDisplayCopy(raw.terms || raw.perk_terms) || fallbackOffer.terms;
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

function getResidentFallbackOffer(place) {
  const text = placeText(place);
  const district = place?.district || "Downtown Austin";

  if (text.includes("coffee") || text.includes("cafe") || text.includes("espresso")) {
    return {
      title: "Resident coffee stop",
      value: "Card-friendly coffee perk",
      description: `A nearby coffee stop for residents moving through ${district}, built for quick mornings, meetings, and easy walkable plans.`,
      terms: "Show your Downtown Perks Card before ordering. Staff can confirm the resident perk at the counter.",
    };
  }

  if (text.includes("pizza")) {
    return {
      title: "Resident pizza perk",
      value: "Easy pizza-night access",
      description: `A simple resident offer for pizza plans in ${district}, made for quick dinners, group nights, and last-minute plans.`,
      terms: "Show your Downtown Perks Card before ordering. Staff can apply the resident perk when available.",
    };
  }

  if (text.includes("bar") || text.includes("nightlife") || text.includes("cocktail") || text.includes("pub")) {
    return {
      title: "Resident night-out access",
      value: "Resident night-out perk",
      description: `A nearby night-out perk for residents deciding where to go next in ${district}. Good for drinks, music, and after-dinner plans.`,
      terms: "Show your Downtown Perks Card when you arrive. Staff can confirm the resident access moment for the night.",
    };
  }

  if (text.includes("restaurant") || text.includes("dining") || text.includes("food") || text.includes("kitchen")) {
    return {
      title: "Resident dining perk",
      value: "Dining perk with your card",
      description: `A nearby dining perk for residents deciding where to eat around ${district}, without the usual back-and-forth search.`,
      terms: "Show your Downtown Perks Card before ordering or checking in. Staff can apply the resident perk when available.",
    };
  }

  if (text.includes("hotel") || text.includes("hospitality")) {
    return {
      title: "Local resident rate",
      value: "Resident hospitality access",
      description: `Resident-friendly hospitality access tied to downtown stays, lounges, dining, and local discovery near ${district}.`,
      terms: "Show your Downtown Perks Card and ask staff to confirm the resident rate or access moment.",
    };
  }

  if (text.includes("event") || text.includes("music") || text.includes("activation")) {
    return {
      title: "Resident event access",
      value: "Save, RSVP, and show up",
      description: `A resident-friendly event moment near ${district}, with the details close at hand when you are deciding what to do tonight.`,
      terms: "Use the card or RSVP before arrival. Access may vary by event timing and capacity.",
    };
  }

  if (text.includes("property") || text.includes("apartment") || text.includes("condo") || text.includes("residential")) {
    return {
      title: "Resident neighborhood view",
      value: "Walkable life around the building",
      description: `See what is walkable from this building and which resident perks, places, and events are nearby in ${district}.`,
      terms: "Use the card to compare nearby places, perks, and events connected to this property.",
    };
  }

  if (text.includes("retail") || text.includes("store") || text.includes("eyewear") || text.includes("shop")) {
    return {
      title: "Resident retail perk",
      value: "Resident shopping access",
      description: `A resident-friendly retail moment for shopping, appointments, and useful stops near ${district}.`,
      terms: "Show your Downtown Perks Card before checkout or booking. Staff can confirm the resident offer.",
    };
  }

  return {
    title: "Resident access perk",
    value: "Useful nearby resident access",
    description: `Use Downtown Perks to save this place, get directions, and make a quick plan near ${district}.`,
    terms: "Show your Downtown Perks Card when you arrive. Staff can confirm the resident access moment.",
  };
}

function BusinessServiceDetails({ place }) {
  const panel = place.raw?.resident_panel || {};
  const phone = place.raw?.contact_phone || place.phone;
  const website = place.raw?.website || place.website;
  const gallery = resolveEntityGallery(place);

  return (
    <section className="mt-4 dp-soft-panel p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
            <Building2 className="h-3.5 w-3.5 text-[#B38F4F]" />
            {panel.eyebrow || "Local service"}
          </div>
          <h3 className="mt-1 font-heading text-xl font-medium text-[#0B1F33]">
            {panel.title || "Useful downtown service"}
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#425466]">
            {panel.description || place.raw?.summary || "Save this local service for later, get directions, or contact the business directly."}
          </p>
        </div>
        <div className="shrink-0 px-0 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-[#B38F4F]">
          Service
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/45">Address</div>
          <div className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">{place.address || "Downtown Austin"}</div>
        </div>
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/45">Phone</div>
          <div className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">{phone || "Not listed"}</div>
        </div>
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/45">Best for</div>
          <div className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">Water, fire, storm, mold</div>
        </div>
      </div>

      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {gallery.slice(1, 3).map((src) => (
            <div key={src} className="h-24 overflow-hidden rounded-[10px] shadow-[0_10px_26px_rgba(11,31,51,0.08)]">
              <img src={src} alt={`${place.name} service context`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33] transition hover:text-[#B38F4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
        >
          Visit website
        </a>
      )}
    </section>
  );
}

function ResidentPerkDetails({ place }) {
  const perk = getResidentPerkDetails(place);
  const hasOffer = Boolean(perk.offer);
  const entityKind = getResidentEntityKind(place);
  const isProperty = entityKind === "property";
  const sectionLabel = isProperty ? "Property details" : "Resident perk";
  const statusLabel = isProperty ? "Active listing" : "ACTIVE PERK";

  return (
    <section className="mt-4 dp-soft-panel p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
            <Gift className="h-3.5 w-3.5 text-[#B38F4F]" />
            {sectionLabel}
          </div>
          <h3 className="mt-1 font-heading text-xl font-medium text-[#0B1F33]">
            {perk.offer}
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#425466]">
            {perk.description}
          </p>
        </div>
        <div className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.05)] ${
          hasOffer
            ? "bg-white/88 text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(179, 143, 79, 0.08),0_0_20px_rgba(179,143,79,0.10)]"
            : "bg-white/72 text-[#425466]"
        }`}>
          {statusLabel}
        </div>
      </div>
    </section>
  );
}

function HappyHourDetails({ place }) {
  const happyHour = place.raw?.happyHour || place.happyHour || {};
  const venueName = place.raw?.venueName || place.venueName || place.name;
  const days = happyHour.days || "This week";
  const time = happyHour.time || "Happy hour window";
  const offer = happyHour.offer || "Resident happy hour offer";
  const details = happyHour.details || place.raw?.summary || "A nearby happy hour for residents looking for an easy place to start.";
  const redemption = happyHour.redemption || "Show your Downtown Perks Card when you arrive.";

  return (
    <section className="mt-4 dp-soft-panel p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
            <Gift className="h-3.5 w-3.5 text-[#B38F4F]" />
            Happy hour
          </div>
          <h3 className="mt-1 font-heading text-xl font-medium text-[#0B1F33]">{venueName}</h3>
          <p className="mt-1.5 text-[13px] leading-5 text-[#425466]">{details}</p>
        </div>
        <div className="shrink-0 rounded-md bg-[#0B1F33] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-white shadow-[0_0_22px_rgba(179, 143, 79, 0.08),inset_0_0_0_1px_rgba(179, 143, 79, 0.08)]">
          Live
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/48">When</div>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">{days} · {time}</p>
        </div>
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/48">Offer</div>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">{offer}</p>
        </div>
        <div className="dp-soft-tile p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/48">Use it</div>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-[#0B1F33]">{redemption}</p>
        </div>
      </div>
    </section>
  );
}

function LegendsContactForm({ listing }) {
  const [submitted, setSubmitted] = useState(false);
  const contactMethods = ["Email", "Phone", "Text"];

  if (submitted) {
    return (
      <div className="mt-3 dp-soft-panel p-3 text-[12px] leading-5 text-[#0B1F33]/72 md:mt-4 md:p-4 md:text-[13px]">
        Thanks — your request has been sent to Legends Real Estate. The team will follow up with listing details and next steps.
      </div>
    );
  }

  return (
    <form
      className="mt-3 dp-soft-panel p-3 md:mt-4 md:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="flex items-start gap-2.5 md:gap-3">
        <img
          src="/pins/downtown-perks/legends-logo.avif"
          alt=""
          className="h-8 w-8 shrink-0 object-contain md:h-10 md:w-10"
        />
        <div>
          <h3 className="text-[14px] font-semibold text-[#0B1F33] md:text-[15px]">Contact Legends Real Estate about this listing</h3>
          <p className="mt-1 text-[12px] leading-5 text-[#425466]">
            Send a quick request tied to this listing. Legends Real Estate will follow up with availability, showing options, and the next useful details.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 md:mt-4">
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
          Name
          <input required name="name" className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70" placeholder="Full name" />
        </label>
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
          Email
          <input required type="email" name="email" className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70" placeholder="you@email.com" />
        </label>
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
          Phone
          <input name="phone" className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70" placeholder="Optional" />
        </label>
        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
          Preferred contact
          <select name="preferredContactMethod" className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70">
            {contactMethods.map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-2 grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
        Message
        <textarea required name="message" className="min-h-20 dp-soft-field rounded-md bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70" defaultValue={listing.prefilledMessage} />
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

      <button type="submit" className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]">
        Send Listing Request
        <Send className="h-3.5 w-3.5 text-[#B38F4F]" />
      </button>
    </form>
  );
}

function LegendsListingDetails({ listing }) {
  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const stats = [
    ["Beds", listing.beds],
    ["Baths", listing.baths],
    ["Sq ft", listing.sqftDisplay],
    ["Days on market", listing.daysOnMarket],
  ];

  return (
      <section className="mt-3 dp-soft-panel p-3 md:mt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <img
            src="/pins/downtown-perks/legends-logo.avif"
            alt="Legends Real Estate"
            className="h-10 w-10 shrink-0 object-contain md:h-12 md:w-12"
          />
          <div className="min-w-0">
            <div className="inline-flex rounded-md bg-[#0B1F33] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_20px_rgba(179, 143, 79, 0.08)]">
              {listing.listingTypeLabel}
            </div>
            <h3 className="mt-2 text-[18px] font-semibold leading-tight text-[#0B1F33] md:text-[20px]">{listing.address}</h3>
            <p className="mt-1 text-[12px] font-medium text-[#425466]">{listing.city}, {listing.state} {listing.zip}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/46">Listed at</div>
          <div className="mt-1 text-[20px] font-semibold text-[#0B1F33]">{listing.priceDisplay}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="dp-soft-tile p-2.5">
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/45">{label}</div>
            <div className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{value}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[13px] leading-6 text-[#425466]">{listing.panelCopy}</p>
      {listing.reconciliationNote && (
        <p className="mt-2 text-[11px] leading-5 text-[#0B1F33]/48">
          Source note: 48 of 65 stated for-sale listings were provided; 17 still need reconciliation before launch.
        </p>
      )}

      <LegendsContactForm listing={{ ...listing, fullAddress }} />
    </section>
  );
}

function getLifestyleImage(place, mode) {
  return resolveEntityImage({ ...place, mode });
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
  if (kind === "property") return "Create Property Plan";
  if (kind === "event") return "Promote Event";
  if (kind === "happy_hour") return "Promote Happy Hour";
  if (kind === "hotel") return "Create Guest Guide";
  if (kind === "brand") return "Plan Brand Moment";
  if (kind === "perk") return "Launch Offer";
  return "Create Map Plan";
}

function PartnerBusinessInsights({ place }) {
  const insights = getPartnerBusinessInsights(place);
  const insightCards = [
    ["What people are looking for", insights.intent],
    ["Who is nearby", insights.audience],
    ["What to try next", insights.opportunity],
  ];

  return (
    <section className="mt-4 dp-soft-panel p-3 md:mt-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">Partner view</div>
          <h3 className="mt-1 font-heading text-[22px] font-medium leading-tight text-[#0B1F33] md:text-2xl">What this place can help you understand</h3>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/70 md:text-[11px]">
          {insights.placement}
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {insightCards.map(([title, body]) => (
          <article key={title} className="dp-soft-tile p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">{title}</div>
            <p className="mt-2 text-[13px] leading-5 text-[#425466]">{body}</p>
          </article>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr]">
        <div className="dp-soft-tile p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">Best time to show up</div>
          <p className="mt-2 text-[13px] font-semibold text-[#0B1F33]">{insights.timing}</p>
        </div>
        <div className="rounded-md bg-[#0B1F33] p-3 text-white shadow-[0_18px_42px_rgba(11,31,51,0.18),0_0_34px_rgba(179,143,79,0.10)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">Good next step</div>
          <p className="mt-2 text-[13px] font-semibold">{insights.action}</p>
        </div>
      </div>
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
    <section className="mt-4 dp-soft-panel p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">Intel</div>
          <h3 className="mt-1 font-heading text-[22px] font-medium leading-tight text-[#0B1F33] md:text-2xl">{activeInsight.title}</h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#425466]">{activeInsight.body}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            type="button"
            onClick={() => onSelectMetric(metric)}
            className={`min-w-[108px] shrink-0 rounded-md px-2.5 py-1.5 text-left transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
              selectedMetric.id === metric.id
                ? "bg-[#0B1F33] text-white shadow-[0_12px_28px_rgba(11,31,51,0.14),0_0_24px_rgba(179, 143, 79, 0.08)]"
                : "bg-white/72 text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.025)] hover:bg-white hover:shadow-[inset_0_0_0_1px_rgba(179, 143, 79, 0.08),0_10px_24px_rgba(11,31,51,0.04)]"
            }`}
            aria-pressed={selectedMetric.id === metric.id}
          >
            <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.12em] opacity-65">{metric.label}</span>
            <span className="mt-0.5 block text-[14px] font-semibold leading-none">{metric.value}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr]">
        <div className="dp-soft-tile p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">What it tells you</div>
          <p className="mt-2 text-[13px] leading-5 text-[#425466]">{selectedMetric.copy}</p>
        </div>
        <div className="dp-soft-tile p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">How to use it</div>
          <p className="mt-2 text-[13px] leading-5 text-[#425466]">{activeInsight.use}</p>
        </div>
      </div>

      <div className="mt-3 rounded-md bg-[#0B1F33] p-3 text-white shadow-[0_18px_42px_rgba(11,31,51,0.18),0_0_34px_rgba(179,143,79,0.10)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">Good next step</div>
        <p className="mt-2 text-[13px] font-semibold">{insights.action}</p>
      </div>
    </section>
  );
}

function MapFocus({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) return;
    const coords = getPlaceCoords(selected);
    if (!coords) return;
    map.flyTo(coords, Math.max(map.getZoom(), 15), {
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
  const prompt = searchParams.get("prompt") || searchParams.get("q") || "";
  const radius = searchParams.get("radius") || "5 min";
  const district = searchParams.get("district") || "District";

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
  const [scanStatus, setScanStatus] = useState("idle");
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("map");
  const [selectedDrawerTab, setSelectedDrawerTab] = useState("details");
  const [clusterDrawer, setClusterDrawer] = useState(null);
  const [mapZoom, setMapZoom] = useState(INITIAL_MAP_ZOOM);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [intelOpen, setIntelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [mapAnswer, setMapAnswer] = useState(null);
  const [pulsingPinId, setPulsingPinId] = useState("");
  const [agentFormPlaceId, setAgentFormPlaceId] = useState("");
  const [agentFormSubmitted, setAgentFormSubmitted] = useState(false);

  function runDemoScan() {
    setScanStatus("scanning");
    window.setTimeout(() => {
      setScanStatus("verified");
      setPassPresented(true);
    }, 700);
  }

  useEffect(() => {
    setSearch(urlState.prompt);
  }, [urlState.prompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("downtown-perks-card-items", JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIndex((index) => (index + 1) % ASK_PROMPTS.length);
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
    setSelectedDrawerTab("details");
  }, [selectedId]);

  useEffect(() => {
    setAgentFormPlaceId("");
    setAgentFormSubmitted(false);
  }, [selectedId]);

  useEffect(() => {
    setDistrict(urlState.district);
  }, [urlState.district]);

  const effectiveSearch = useMemo(() => {
    const trimmed = search.trim();
    const normalized = trimmed.toLowerCase();
    return NON_SEARCH_PROMPTS.some((prompt) => prompt.toLowerCase() === normalized) ? "" : trimmed;
  }, [search]);

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
      if (district !== "District" && place.district !== district) return false;
      return true;
    });
  }, [neighborhoodBasePlaces, district]);

  const selected = useMemo(
    () => places.find((place) => place.id === selectedId) || null,
    [places, selectedId],
  );
  const selectedResidentAction = useMemo(
    () => (selected ? getResidentDetailAction(selected) : null),
    [selected],
  );
  const clusterPlacesForDrawer = clusterDrawer?.places || [];

  const hasActiveCategoryScope = activeFilter !== "All" || district !== ALL_NEIGHBORHOODS || Boolean(effectiveSearch);
  const displayPlaces = filtered.length ? filtered : hasActiveCategoryScope ? [] : places;
  const isUsingFallbackPlaces = !filtered.length && !hasActiveCategoryScope && places.length > 0;
  const contextCount = displayPlaces.length;
  const contextLabel = contextCount > 0
    ? `${contextCount} ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()}`
    : `No ${activeFilter === "All" ? "downtown places" : activeFilter.toLowerCase()} in this view`;
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
  const hiddenPreviewCount = Math.max(0, Math.min(displayPlaces.length, 12) - previewPlaces.length);
  const activePrompt = ASK_PROMPTS[promptIndex];

  useEffect(() => {
    if (!selectedId) return;
    if (!places.some((place) => place.id === selectedId)) {
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

  useEffect(() => {
    function openPinnedEntity(event) {
      const pin =
        event.target?.closest?.(".dp-live-pin[data-entity-id]") ||
        event.target?.closest?.(".leaflet-marker-icon")?.querySelector?.(".dp-live-pin[data-entity-id]");
      if (!pin) return;

      const place = places.find((item) => item.id === pin.getAttribute("data-entity-id"));
      if (!place) return;

      event.preventDefault?.();
      event.stopPropagation?.();
      triggerHaptic();
      setActiveBottomTab("map");
      setClusterDrawer(null);
      setConsoleCollapsed(true);
      setPulsingPinId(place.id);
      setSelectedId(place.id);
      urlState.update({ entityId: place.id });
    }

    document.addEventListener("click", openPinnedEntity, true);
    document.addEventListener("touchend", openPinnedEntity, true);
    return () => {
      document.removeEventListener("click", openPinnedEntity, true);
      document.removeEventListener("touchend", openPinnedEntity, true);
    };
  }, [places, urlState]);

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
    urlState.update({ district: neighborhood === ALL_NEIGHBORHOODS ? "" : neighborhood, entityId: "" });
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
      if (district !== ALL_NEIGHBORHOODS && place.district !== district) return false;
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
          district: district === ALL_NEIGHBORHOODS ? "Downtown Austin" : district,
          filter: activeFilter,
          context: localResults.slice(0, 8).map((place) => ({
            id: place.id,
            name: place.name,
            category: place.category,
            district: place.district,
            type: place.type,
            hasPerk: hasActivePerkData(place),
          })),
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
      setMapAnswer((current) => ({
        title: agentAnswer.title || current?.title || `Answering: “${query}”`,
        body: agentAnswer.answer,
        picks: localResults.slice(0, 3),
      }));
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
      setMapAnswer((current) => ({
        title: agentAnswer.title || current?.title || `Answering: “${prompt}”`,
        body: agentAnswer.answer,
        picks: localResults.slice(0, 3),
      }));
    }
  }

  function switchMode(mode, tab = "map") {
    navigate(`/map?mode=${mode}&tab=${tab}`);
  }

  const primaryFilters = urlState.mode === "partner"
    ? ["All", "Happy Hours", "Perks"]
    : ["All", "Happy Hours", "Events"];
  const visibleFilters = Array.from(new Set([...primaryFilters, activeFilter])).filter((item) => FILTERS.includes(item));
  const overflowFilters = FILTERS.filter((filter) => !visibleFilters.includes(filter));

  return (
    <div className="relative h-screen overflow-hidden bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
      <div className="absolute inset-x-0 bottom-0 top-[68px]">
        <MapContainer
          center={AUSTIN_CENTER}
          zoom={INITIAL_MAP_ZOOM}
          minZoom={13}
          maxZoom={19}
          zoomControl={false}
          className="dp-spatial-map h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFocus selected={selected} />
          <MapZoomTracker onZoomChange={setMapZoom} />
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
                onHover={(place) => setPulsingPinId(place.id)}
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
          className="pointer-events-none absolute inset-x-0 top-[76px] z-[510] px-2.5 md:top-[84px] md:px-5"
        >
          {consoleCollapsed ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setConsoleCollapsed(false)}
              className="pointer-events-auto mx-auto flex h-7 items-center justify-center gap-1.5 bg-white/74 px-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/62 shadow-[0_10px_28px_rgba(11,31,51,0.06)] backdrop-blur-xl transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:h-8 md:px-3 md:text-[10px]"
              aria-expanded="false"
            >
              <Sparkles className="h-4 w-4 text-[#B38F4F]" />
              Show map controls
            </motion.button>
          ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell pointer-events-auto relative mx-auto max-h-[calc(100vh-124px)] max-w-3xl overflow-y-auto rounded-md p-2 pr-9 md:max-h-[calc(100vh-142px)] md:rounded-lg md:p-3 md:pr-11"
            role="region"
            aria-label="Map command console"
          >
            <button
              type="button"
              onClick={() => setConsoleCollapsed(true)}
              className="dp-panel-close absolute right-2 top-2 z-10 flex h-7 w-7 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:right-2.5 md:top-2.5 md:h-8 md:w-8"
              aria-label="Collapse map controls"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F]">
                  <Sparkles className="h-3 w-3 text-[#B38F4F] md:h-3.5 md:w-3.5" />
                  {urlState.mode === "partner" ? "PARTNER MAP AGENT" : "RESIDENT MAP AGENT"}
                </div>
                <h1 className="mt-0.5 truncate font-heading text-[16px] font-medium leading-tight text-[#0B1F33] md:text-[22px]">
                  {activePrompt}
                </h1>
              </div>

                <div className="flex shrink-0 gap-1.5">
                {urlState.mode === "partner" ? (
                  <>
                    <button type="button" onClick={() => switchMode("resident")} className="dp-map-control">Resident</button>
                    <Link to={mapRoutes.dashboard} className="dp-map-control">Dashboard</Link>
                  </>
	                ) : (
	                  <>
	                    <button type="button" onClick={() => switchMode("partner")} className="dp-map-control">Partner</button>
	                  </>
	                )}
                <button type="button" onClick={() => setAboutOpen(true)} className="dp-map-control" aria-label="About Downtown Perks">
                  <Info className="h-4 w-4 text-[#B38F4F]" />
                </button>
                </div>
              </div>

              <form onSubmit={runSearch} className="grid gap-1.5 md:grid-cols-[1fr_auto]">
                <label className="group flex h-8 items-center gap-2 dp-soft-field rounded-md bg-white px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-all focus-within:border-[#B38F4F]/70 md:h-9 md:px-3">
                  <Search className="h-4 w-4 shrink-0 text-[#0B1F33]/50" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.input
                      key={activePrompt}
                      type="text"
                      placeholder={activePrompt}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        if (mapAnswer) setMapAnswer(null);
                      }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="min-w-0 flex-1 bg-transparent text-[12px] text-[#0B1F33] placeholder:text-[#0B1F33]/42 focus:outline-none md:text-[13px]"
                    />
                  </AnimatePresence>
                  {!search && (
                    <button
                      type="button"
                      onClick={() => applyPrompt(activePrompt)}
                      className="hidden px-0 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#B38F4F] transition hover:text-[#0B1F33] sm:inline-flex"
                    >
                      Use
                    </button>
                  )}
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setSearch("");
                        setMapAnswer(null);
                      }}
                      className="flex h-7 w-7 items-center justify-center text-[#0B1F33]/58 hover:text-[#0B1F33]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>

                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#0B1F33] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:h-9 md:gap-2 md:px-4 md:text-[12px] md:tracking-[0.14em]"
                >
                  Ask
                  <ArrowRight className="h-4 w-4 text-[#B38F4F]" />
                </button>
              </form>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
              {visibleFilters.map((filter) => {
                const active = filter === activeFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFilter(filter)}
                    className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:px-2.5 md:py-1.5 md:text-[11px] ${
                      active
                        ? "border-[#0B1F33] bg-[#0B1F33] text-white shadow-[0_12px_30px_rgba(11,31,51,0.14)]"
                        : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:-translate-y-0.5 hover:border-[#B38F4F]/60"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
                <button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:px-2.5 md:py-1.5 md:text-[11px] ${
                    filtersOpen ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:border-[#B38F4F]/60"
                  }`}
                  aria-expanded={filtersOpen}
                >
                  More
                </button>
                <button
                  type="button"
                  onClick={() => setNeighborhoodsOpen((value) => !value)}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.12em] ${
                    neighborhoodsOpen ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                  }`}
                  aria-expanded={neighborhoodsOpen}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {urlState.mode === "partner" ? `Scope: ${radius}` : district === ALL_NEIGHBORHOODS ? "Neighborhoods" : district}
                </button>
                {urlState.mode === "partner" && (
                  <button
                    type="button"
                    onClick={() => setIntelOpen((value) => !value)}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.12em] ${
                      intelOpen ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                    }`}
                    aria-expanded={intelOpen}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Intel
                  </button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {filtersOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-1.5 overflow-x-auto border-t border-[#0B1F33]/8 pt-2">
                      {overflowFilters.map((filter) => {
                        const active = filter === activeFilter;
                        return (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setFilter(filter)}
                            className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:px-2.5 md:py-1.5 md:text-[11px] ${
                              active
                                ? "border-[#0B1F33] bg-[#0B1F33] text-white shadow-[0_12px_30px_rgba(11,31,51,0.14)]"
                                : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:-translate-y-0.5 hover:border-[#B38F4F]/60"
                            }`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setFiltersOpen(false)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.12em]"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                        Roll up
                      </button>
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
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {["5 min", "10 min", "District"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setRadius(item);
                                setDistrict(item === "District" ? "District" : district);
                                setMapAnswer(null);
                                urlState.update({ radius: item });
                              }}
                              className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.12em] ${
                                radius === item ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-white text-[#0B1F33]"
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {NEIGHBORHOODS.map((neighborhood) => {
                        const active = neighborhood === district || (neighborhood === ALL_NEIGHBORHOODS && district === ALL_NEIGHBORHOODS);
                        const count = neighborhoodCounts[neighborhood] || 0;
                        const label = neighborhood === ALL_NEIGHBORHOODS ? "All districts" : neighborhood;
                        return (
                    <button
                      key={neighborhood}
                      type="button"
                      onClick={() => setNeighborhood(neighborhood)}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-[11px] ${
                        active
                          ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white shadow-[0_12px_30px_rgba(11,31,51,0.14)]"
                          : "border-[#0B1F33]/8 bg-white text-[#0B1F33] hover:-translate-y-0.5 hover:border-[#B38F4F]/60"
                      }`}
                      aria-pressed={active}
                    >
                      {label}
                      <span className={`rounded-[4px] px-1.5 py-0.5 text-[10px] leading-none ${
                        active ? "bg-white/12 text-white/82" : "bg-[#F7F8FB] text-[#0B1F33]/52"
                      }`}>
                        {count}
                      </span>
                    </button>
                        );
                      })}
                        <button
                          type="button"
                          onClick={() => setNeighborhoodsOpen(false)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:gap-1.5 md:px-2.5 md:py-1.5 md:text-[10px] md:tracking-[0.12em]"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                          Roll up
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
                              className={`min-w-[112px] shrink-0 rounded-md px-2.5 py-1.5 text-left transition ${
                                selectedMetric.id === metric.id
                                  ? "bg-[#0B1F33] text-white shadow-[0_10px_24px_rgba(11,31,51,0.12),0_0_18px_rgba(179,143,79,0.08)]"
                                  : "bg-white/72 text-[#0B1F33] shadow-[inset_0_0_0_1px_rgba(11,31,51,0.025)] hover:bg-white"
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
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F]">What people are doing</div>
                            <p className="mt-1 text-[12px] leading-5 text-[#425466]">Open the bottom Intel drawer for the fuller view.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBottomTab("discover");
                              setIntelOpen(false);
                            }}
                            className="dp-panel-row p-2 text-left"
                          >
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F]">Who is nearby</div>
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
                            <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F]">What to try next</div>
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
                            Open Intel drawer
                          </button>
                          <Link to={campaignRoute(selected || undefined)} className="dp-map-control">Campaigns</Link>
                          <Link to={mapRoutes.reports} className="dp-map-control">Reports</Link>
                          <button type="button" onClick={() => setIntelOpen(false)} className="dp-map-control">
                            <ChevronUp className="h-3.5 w-3.5" />
                            Roll up
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
                className="dp-soft-panel mt-2 overflow-hidden p-3"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F4F]" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">Map answer</div>
                    <h3 className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{mapAnswer.title}</h3>
                    <p className="mt-1 text-[13px] leading-5 text-[#425466]">{mapAnswer.body}</p>
                  </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapAnswer(null)}
                    className="dp-map-control inline-flex shrink-0 items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Roll up
                  </button>
                </div>
                {mapAnswer.picks.length > 0 && (
                  <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                    {mapAnswer.picks.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className="dp-panel-row shrink-0 px-2.5 py-1.5 text-left text-[11px] text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
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
            className="dp-panel-shell pointer-events-auto max-h-[calc(100dvh-0.75rem)] w-full max-w-xl overflow-y-auto rounded-t-xl p-2.5 sm:p-4 md:max-h-[calc(100dvh-2rem)] md:rounded-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Resident pass"
          >
            <div className="dp-panel-header sticky top-0 z-10 -mx-2.5 -mt-2.5 mb-2 flex items-center justify-between gap-2 px-2.5 py-1.5 sm:-mx-4 sm:-mt-4 sm:px-4 sm:py-2 md:mb-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F] md:text-[10px] md:tracking-[0.16em]">Resident pass</span>
              <button type="button" onClick={() => switchMode("resident", "map")} className="dp-panel-close rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:p-2" aria-label="Close pass">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-start justify-between gap-3 md:gap-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F] md:text-[10px] md:tracking-[0.16em]">Resident pass</p>
                <h2 className="mt-1 font-heading text-[24px] font-medium leading-none md:mt-1.5 md:text-[28px]">Downtown Perks Card</h2>
                <p className="mt-1.5 text-[12px] leading-5 text-[#425466]">
                  Show the QR. The partner scans it. Your perk is confirmed right there.
                </p>
              </div>
            </div>
            <div className="mt-2.5 rounded-md bg-[#0B1F33] p-2.5 text-white shadow-[0_16px_42px_rgba(11,31,51,0.18),0_0_30px_rgba(179,143,79,0.10)] md:mt-3 md:p-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#B38F4F]" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/58">Downtown Perks</div>
              </div>
              <div className="mt-1.5 text-lg font-semibold leading-tight">Resident Access</div>
              <div className="mt-3 rounded-md bg-white/10 p-2 text-[11px] leading-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                {scanStatus === "verified"
                  ? "Verified. The partner can apply the perk."
                  : passPresented
                    ? "Pass ready to present."
                    : "Tap Present Pass when you are ready to redeem."}
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="dp-soft-panel p-2.5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
                  <QrCode className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Resident shows
                </div>
                <div className="mt-2">
                  <DemoQrTile />
                </div>
                <p className="mt-2 text-[12px] leading-5 text-[#425466]">
                  Demo resident QR for perks, events, hotels, and building desks.
                </p>
              </div>
              <div className="dp-soft-panel p-2.5">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
                  <ScanLine className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Partner scans
                </div>
                <div className="mt-2 rounded-md bg-[#0B1F33] p-2.5 text-white shadow-[0_18px_42px_rgba(11,31,51,0.18),0_0_30px_rgba(179,143,79,0.10)]">
                  <div className={`flex h-16 items-center justify-center rounded-md bg-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09)] transition ${scanStatus === "scanning" ? "animate-pulse" : ""}`}>
                    {scanStatus === "verified" ? (
                      <ShieldCheck className="h-7 w-7 text-[#B38F4F]" />
                    ) : (
                      <ScanLine className="h-7 w-7 text-[#B38F4F]" />
                    )}
                  </div>
                  <div className="mt-2 text-[11px] font-semibold">
                    {scanStatus === "verified" ? "Resident pass verified" : scanStatus === "scanning" ? "Scanning demo QR..." : "Scanner reads the resident code"}
                  </div>
                  <p className="mt-1 text-[10px] leading-4 text-white/62">
                    {scanStatus === "verified"
                      ? `${DEMO_CARD_CODE} is ready for a partner perk, event check-in, or front desk confirmation.`
                      : "Staff confirm the card, apply the perk, and the visit shows up in partner reporting."}
                  </p>
                  <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={runDemoScan}
                      disabled={scanStatus === "scanning"}
                      className="dp-pass-action border-white/20 disabled:opacity-60"
                    >
                      {scanStatus === "verified" ? "Scan Again" : scanStatus === "scanning" ? "Scanning" : "Scan Demo QR"}
                    </button>
                    {scanStatus === "verified" && (
                      <button type="button" onClick={() => setScanStatus("idle")} className="dp-pass-action border-white/20">
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              <button type="button" onClick={() => setPassPresented(true)} className="dp-pass-action dp-pass-action-primary">{passPresented ? "Pass Ready" : "Present Pass"}</button>
              <button type="button" onClick={() => setWalletAdded(true)} className="dp-pass-action">{walletAdded ? "Wallet Added" : "Add Wallet"}</button>
              <button type="button" onClick={() => navigate("/map?mode=resident&tab=map&filter=Perks")} className="dp-pass-action">Perks</button>
              <button type="button" onClick={() => switchMode("partner")} className="dp-pass-action">Partner View</button>
            </div>
          </motion.section>
        </div>
      )}

	      {urlState.tab === "map" && !selected && !clusterDrawer && activeBottomTab !== "discover" && (
        <div className="pointer-events-none fixed inset-x-0 bottom-2 z-[700] flex justify-center px-2 pb-[env(safe-area-inset-bottom)] md:bottom-3 md:px-4">
          <nav
            className="pointer-events-auto flex max-w-[calc(100vw-1rem)] gap-4 overflow-x-auto bg-white/76 px-3 py-2 shadow-[0_14px_34px_rgba(11,31,51,0.07)] backdrop-blur-xl md:max-w-[min(460px,calc(100vw-2rem))] md:gap-5 md:px-4"
            aria-label="Map bottom navigation"
          >
            <button
              type="button"
              onClick={() => {
                setActiveBottomTab("map");
                if (urlState.tab !== "map") switchMode(urlState.mode, "map");
              }}
              className={`inline-flex h-5 shrink-0 items-center justify-center gap-1.5 px-0 text-[9px] font-semibold uppercase tracking-[0.13em] transition md:h-6 md:text-[10px] ${
                urlState.tab === "map" && activeBottomTab === "map" ? "border-b border-[#B38F4F] text-[#0B1F33]" : "text-[#0B1F33]/58 hover:text-[#0B1F33]"
              }`}
              aria-pressed={urlState.tab === "map" && activeBottomTab === "map"}
            >
              <MapPin className="h-3 w-3 text-[#B38F4F] md:h-3.5 md:w-3.5" />
              Map
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveBottomTab("discover");
                if (urlState.tab !== "map") switchMode(urlState.mode, "map");
              }}
              className={`inline-flex h-5 shrink-0 items-center justify-center gap-1.5 px-0 text-[9px] font-semibold uppercase tracking-[0.13em] transition md:h-6 md:text-[10px] ${
                urlState.tab === "map" && activeBottomTab === "discover" ? "border-b border-[#B38F4F] text-[#0B1F33]" : "text-[#0B1F33]/58 hover:text-[#0B1F33]"
              }`}
              aria-pressed={urlState.tab === "map" && activeBottomTab === "discover"}
            >
              <Sparkles className="h-3 w-3 text-[#B38F4F] md:h-3.5 md:w-3.5" />
              {urlState.mode === "partner" ? "Intel" : "Discover"}
              <span className="text-[9px] leading-none text-[#B38F4F] md:text-[10px]">
                {contextCount > 0 ? contextCount : "Live"}
              </span>
            </button>
            {urlState.mode === "resident" && (
              <button
                type="button"
                onClick={() => switchMode("resident", "pass")}
                className={`inline-flex h-5 shrink-0 items-center justify-center gap-1.5 px-0 text-[9px] font-semibold uppercase tracking-[0.13em] transition md:h-6 md:text-[10px] ${
                  urlState.tab === "pass" ? "border-b border-[#B38F4F] text-[#0B1F33]" : "text-[#0B1F33]/58 hover:text-[#0B1F33]"
                }`}
                aria-pressed={urlState.tab === "pass"}
              >
                <CreditCard className="h-3 w-3 text-[#B38F4F] md:h-3.5 md:w-3.5" />
                Card
              </button>
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
            className="dp-panel-shell fixed inset-x-0 bottom-0 z-[620] mx-auto max-h-[52vh] w-full max-w-3xl overflow-hidden rounded-t-xl p-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] md:max-h-[56vh] md:rounded-t-2xl md:p-3 md:pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
            role="dialog"
            aria-modal="true"
            aria-label={urlState.mode === "partner" ? "Partner map results" : "Discover results"}
          >
            <div className="mx-auto mb-2 h-0.5 w-10 rounded-full bg-[#0B1F33]/14 md:mb-3 md:h-1 md:w-12" aria-hidden="true" />
            <div className="mb-2 flex items-center justify-between gap-2 md:mb-3 md:gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F] md:text-[10px] md:tracking-[0.16em]">
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
                className="dp-panel-close flex h-8 w-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:h-9 md:w-9"
                aria-label="Close discover results"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {urlState.mode === "partner" && (
              <div className="mb-3 grid gap-2 md:grid-cols-3">
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
                  <div key={title} className="dp-soft-tile p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F]">{title}</div>
                    <p className="mt-1 text-[12px] leading-5 text-[#425466]">{body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="max-h-[38vh] space-y-1.5 overflow-y-auto pr-1 md:max-h-[42vh] md:space-y-2">
              {previewPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectPlace(place)}
                  className={`grid w-full grid-cols-[34px_1fr_auto] items-center gap-2 p-1.5 text-left transition-all hover:-translate-y-0.5 md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2 ${
                    place.id === selectedId ? "bg-[#0B1F33] text-white shadow-[0_12px_30px_rgba(11,31,51,0.12),0_0_18px_rgba(179, 143, 79, 0.06)]" : "dp-panel-row text-[#0B1F33]"
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
                <div className="dp-soft-tile bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  No {activeFilter === "All" ? "places" : activeFilter.toLowerCase()} match this view. Try a nearby district or clear the filter.
                </div>
              )}
              {isUsingFallbackPlaces && (
                <div className="dp-soft-tile bg-white p-4 text-[13px] leading-6 text-[#425466]">
                  Keeping nearby downtown places visible while your question sorts the best next options.
                </div>
              )}
              {displayPlaces.length > 4 && (
                <button
                  type="button"
                  onClick={() => setResultsExpanded((value) => !value)}
                  className="w-full bg-transparent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#0B1F33]/56 transition hover:-translate-y-0.5 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                  aria-expanded={resultsExpanded}
                >
                  {resultsExpanded ? "Roll up results" : `Expand results (${hiddenPreviewCount} more)`}
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
            className="dp-panel-shell fixed inset-x-0 bottom-0 z-[640] mx-auto flex max-h-[62vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl md:max-h-[68vh] md:rounded-t-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Grouped map places"
          >
            <div className="dp-panel-header shrink-0">
              <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-full bg-[#0B1F33]/14 md:mt-2 md:h-1 md:w-12" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#B38F4F] md:text-[10px] md:tracking-[0.16em]">
                    {urlState.mode === "partner" ? "Grouped partner places" : "Grouped nearby places"}
                  </div>
                  <div className="mt-0.5 text-[13px] font-semibold text-[#0B1F33]">
                    {clusterPlacesForDrawer.length} places in this area
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClusterDrawer(null);
                    setActiveBottomTab("map");
                  }}
                  className="dp-panel-close rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                  aria-label="Close grouped places"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:space-y-2 md:px-4 md:py-4 md:pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {clusterPlacesForDrawer.map((place) => {
                const perk = getResidentPerkDetails(place);
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="dp-panel-row grid w-full grid-cols-[34px_1fr_auto] items-center gap-2 p-2 text-left text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:grid-cols-[42px_1fr_auto] md:gap-3 md:p-2.5"
                  >
                    <PinBadge place={place} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{place.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#0B1F33]/58">{place.category || "Downtown place"} · {place.district}</span>
                      {urlState.mode === "resident" && (
                        <span className="mt-1 block truncate text-[11px] text-[#B38F4F]">{perk.offer}</span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#0B1F33]/42" />
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
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 44 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="dp-panel-shell fixed inset-x-0 bottom-0 z-[650] mx-auto flex max-h-[76vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-xl md:bottom-0 md:max-h-[80vh] md:rounded-t-[18px]"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.name} details`}
          >
            <div className="dp-panel-header shrink-0">
              <div className="mx-auto mt-1.5 h-0.5 w-10 rounded-full bg-[#0B1F33]/14 md:mt-2 md:h-1 md:w-12" aria-hidden="true" />
              <div className="flex items-center justify-between gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-2.5">
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F] md:text-xs md:tracking-[0.16em]">
                  {urlState.mode === "partner" ? "Partner details" : "Perks and details"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId("");
                    setActiveBottomTab("map");
                    urlState.update({ entityId: "" });
                  }}
                  className="dp-panel-close rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:p-2"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-0.5 flex gap-4 overflow-x-auto px-3 pb-2 md:mt-1 md:px-4 md:pb-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedDrawerTab("details")}
                  className={`dp-panel-tab ${selectedDrawerTab === "details" ? "is-active" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]`}
                  aria-pressed={selectedDrawerTab === "details"}
                >
                  Details
                </button>
                {urlState.mode === "partner" && (
                  <button
                    type="button"
                    onClick={() => setSelectedDrawerTab("intel")}
                    className={`dp-panel-tab ${selectedDrawerTab === "intel" ? "is-active" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]`}
                    aria-pressed={selectedDrawerTab === "intel"}
                  >
                    Intel
                  </button>
                )}
	                <button
                  type="button"
                  onClick={() => {
                    setSelectedId("");
                    setActiveBottomTab("map");
                    setSelectedDrawerTab("details");
                    urlState.update({ entityId: "" });
                  }}
                  className="dp-panel-tab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                >
                  Map
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-4 md:pb-[calc(1rem+env(safe-area-inset-bottom))] md:pt-4">
            <div className="grid gap-3 md:grid-cols-[200px_1fr] md:items-start md:gap-4">
              <div className="group relative h-32 w-full overflow-hidden rounded-[10px] shadow-[0_12px_30px_rgba(11,31,51,.09),0_0_28px_rgba(179,143,79,0.07)] sm:h-36 md:h-40 md:rounded-[14px] md:shadow-[0_16px_40px_rgba(11,31,51,.10),0_0_36px_rgba(179,143,79,0.08)]">
                <img
                  src={getLifestyleImage(selected, urlState.mode)}
                  alt={`${selected.name} downtown context`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33]/30 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <PinBadge place={selected} selected />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F] md:gap-2 md:text-xs md:tracking-[0.16em]">
                  <MapPin className="h-3.5 w-3.5 text-[#B38F4F] md:h-4 md:w-4" />
                  {selected.category} · {selected.district}
                </div>
                <h2 className="mt-2 font-heading text-2xl font-medium md:mt-3 md:text-3xl">{selected.name}</h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#425466] md:mt-3 md:leading-6">
                  {urlState.mode === "partner"
                    ? "A quick read on nearby demand, audience fit, and the moments this location can own."
                    : selected.raw?.summary || "A nearby downtown place connected to resident access, walkability, perks, events, and local context."}
                </p>
              </div>
            </div>

            {urlState.mode === "partner" ? (
              selectedDrawerTab === "intel" ? (
                <>
                  <PartnerMetricInsight place={selected} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
                  <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                    <Link to={campaignRoute(selected)} className="dp-drawer-action dp-drawer-action-compact dp-drawer-action-primary">{getPartnerPrimaryActionLabel(selected)}</Link>
                    <Link to={mapRoutes.reports} className="dp-drawer-action dp-drawer-action-compact">Reports</Link>
                    <Link to={mapRoutes.dashboard} className="dp-drawer-action dp-drawer-action-compact">Dashboard</Link>
                    <Link to="/contact" className="dp-drawer-action dp-drawer-action-compact">Contact</Link>
                  </div>
                </>
              ) : (
                <>
                  {getLegendsListing(selected) ? (
                    <LegendsListingDetails listing={getLegendsListing(selected)} />
                  ) : (
                    <>
                      {isHappyHourEntity(selected) && <HappyHourDetails place={selected} />}
                      <PartnerBusinessInsights place={selected} />
                    </>
                  )}
                  <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                    <Link to={campaignRoute(selected)} className="dp-drawer-action dp-drawer-action-compact dp-drawer-action-primary">{getPartnerPrimaryActionLabel(selected)}</Link>
                    <Link to={mapRoutes.reports} className="dp-drawer-action dp-drawer-action-compact">Reports</Link>
                    <Link to={mapRoutes.dashboard} className="dp-drawer-action dp-drawer-action-compact">Dashboard</Link>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMetric(METRICS[0]);
                        setSelectedDrawerTab("intel");
                      }}
                      className="dp-drawer-action dp-drawer-action-compact"
                    >
                      People Nearby
                    </button>
                    <Link to="/contact" className="dp-drawer-action dp-drawer-action-compact">Contact</Link>
                  </div>
                </>
              )
            ) : (
              <>
                {(() => {
                  const entityKind = getResidentEntityKind(selected);
                  const legendsListing = getLegendsListing(selected);
                  const isProperty = entityKind === "property";
                  const isEvent = entityKind === "event";
                  const isService = entityKind === "service";
                  const isHappyHour = entityKind === "happy_hour";
                  const isPerk = entityKind === "perk" || entityKind === "place" || entityKind === "hotel" || entityKind === "brand" || isHappyHour;
                  return (
                    <>
                      {legendsListing ? (
                        <LegendsListingDetails listing={legendsListing} />
                      ) : isService ? (
                        <BusinessServiceDetails place={selected} />
                      ) : isHappyHour ? (
                        <HappyHourDetails place={selected} />
                      ) : (
                        <ResidentPerkDetails place={selected} />
                      )}
                      <div className="dp-resident-action-rail mt-4">
                        {isProperty && !legendsListing && (
                          <button
                            type="button"
                            onClick={() => {
                              setAgentFormPlaceId(selected.id);
                              setAgentFormSubmitted(false);
                            }}
                            className="dp-drawer-action dp-drawer-action-primary"
                          >
                            Contact Agent
                          </button>
                        )}
                        {isEvent && (
                          <button type="button" onClick={() => toggleRsvp(selected)} className="dp-drawer-action dp-drawer-action-primary">
                            {eventRsvps.some((item) => item.id === selected.id) ? "Cancel RSVP" : "RSVP"}
                          </button>
                        )}
                        {!isProperty && isPerk && (
                          <button type="button" onClick={() => switchMode("resident", "pass")} className="dp-drawer-action dp-drawer-action-primary">
                            Show Card
                          </button>
                        )}
                        <button type="button" onClick={() => toggleSaved(selected)} className="dp-drawer-action">
                          {isService ? (savedIds.has(selected.id) ? "Saved" : "Save") : (savedIds.has(selected.id) ? "Added to Card" : "Save to Card")}
                        </button>
                        <a href={directionsUrl(selected)} target="_blank" rel="noreferrer" className="dp-drawer-action">
                          Get Directions
                        </a>
                        {selectedResidentAction && (
                          <Link to={selectedResidentAction.href} className="dp-drawer-action">
                            {selectedResidentAction.label}
                          </Link>
                        )}
                        {!isProperty && !isEvent && !isService && (
                          <Link to={mapRoutes.partners} className="dp-drawer-action">List Your Business</Link>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {isProperty && agentFormPlaceId === selected.id && (
                          <motion.form
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            onSubmit={(event) => {
                              event.preventDefault();
                              setAgentFormSubmitted(true);
                            }}
                            className="mt-3 dp-soft-panel p-3 md:mt-4 md:p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]/52">Contact agent</div>
                                <h3 className="mt-1 text-[16px] font-semibold text-[#0B1F33]">{selected.name}</h3>
                                <p className="mt-1 text-[12px] leading-5 text-[#0B1F33]/62">
                                  Send a quick note about this listing. The agent gets the property, your contact info, and the request.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAgentFormPlaceId("")}
                                className="rounded-md bg-white/82 p-1.5 text-[#0B1F33]/62 shadow-[inset_0_0_0_1px_rgba(11,31,51,0.05)] transition hover:-translate-y-0.5 hover:text-[#0B1F33] hover:shadow-[inset_0_0_0_1px_rgba(179, 143, 79, 0.08),0_10px_24px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:p-2"
                                aria-label="Close contact agent form"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {agentFormSubmitted ? (
                              <div className="mt-4 dp-soft-tile bg-white p-3 text-[13px] leading-5 text-[#0B1F33]/70">
                                Sent. The listing request is ready for the agent with this property attached.
                              </div>
                            ) : (
                              <>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 md:mt-4">
                                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                    Name
                                    <input required className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70 md:h-10" placeholder="Your name" />
                                  </label>
                                  <label className="grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                    Phone or email
                                    <input required className="h-9 dp-soft-field rounded-md bg-white px-3 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70 md:h-10" placeholder="Best way to reach you" />
                                  </label>
                                </div>
                                <label className="mt-2 grid gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/54">
                                  Message
                                  <textarea className="min-h-20 dp-soft-field rounded-md bg-white px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[#0B1F33] outline-none focus:border-[#B38F4F]/70" defaultValue={`I would like more information about ${selected.name}.`} />
                                </label>
                                <button type="submit" className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#0B1F33] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] md:h-10 md:gap-2 md:px-4 md:text-xs md:tracking-[0.14em]">
                                  Send Request
                                  <Send className="h-3.5 w-3.5 text-[#B38F4F] md:h-4 md:w-4" />
                                </button>
                              </>
                            )}
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })()}
              </>
            )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AboutDowntownPerksModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
