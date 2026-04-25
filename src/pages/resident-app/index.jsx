import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { resolveResidentContext } from "@/lib/resident/resolveResidentContext";
import { FEATURED_BRANDS } from "@/data/featuredBrands";
import { properties as REPLIT_PROPERTIES } from "@/data/replitApiStore";
import ResidentWalkingMap from "@/components/resident/ResidentWalkingMap";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import UnifiedResultsPanel from "@/components/map/unified/UnifiedResultsPanel";
import UnifiedDrawer from "@/components/map/unified/UnifiedDrawer";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import {
  IconArrowRight,
  IconBookmark,
  IconCalendarCheck,
  IconCard,
  IconChevronDown,
  IconChevronUp,
  getEntityIcon,
  getEntityLabel,
  IconInfo,
  IconNavigation,
  IconPerk,
  getResidentTabIcon,
  IconSearch,
  IconSettings,
} from "@/components/icons/DPIcons";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useMapStateStore } from "@/store/mapStateStore";
import { useResidentStore } from "@/store/resident-store";
import { useResidentMutations } from "@/hooks/useResidentMutations";

const GUEST_RESIDENT = {
  id: "guest-resident",
  full_name: "Meg Dude",
  email: "guest@downtownperks.demo",
  role: "resident",
  is_guest: true,
  homeBuilding: "The Shore",
  district: "Rainey / Waterfront",
  buildingLine: "The Shore · Four Seasons Residences · Plaza Lofts · The Paseo · The Modern · Milago",
};

const RESIDENT_RESIDENCE_ORDER = [
  "The Shore",
  "Four Seasons Residences",
  "Plaza Lofts",
  "The Paseo",
  "The Modern Austin Residences",
  "Milago",
  "70 Rainey",
  "44 East Ave",
  "Northshore",
  "Natiivo Austin",
  "700 River",
  "The Waterline",
];

const THE_MODERN_REFERENCE = {
  id: "resident-modern",
  buildingName: "The Modern Austin Residences",
  address: "611 West 6th St, Austin, TX 78701",
  latitude: 30.2666,
  longitude: -97.7516,
  unitTypes: ["1BR", "2BR", "3BR"],
  priceRange: "$650K – $2.4M",
  unitCount: 224,
  description:
    "A premium West Downtown condo tower with quick access to the lake, Whole Foods, and the everyday downtown loop.",
  amenities: ["Pool", "Fitness Center", "Resident Lounge", "Concierge"],
  isFeatured: true,
  isLegends: false,
  yearBuilt: 2014,
  website: "",
};

const RESIDENT_COMMUNITY_MOMENTS = [
  {
    id: "resident-social-shore",
    title: "Neighbors heading to the trail",
    placeName: "The Shore",
    address: "610 Davis St, Austin, TX 78701",
    latitude: 30.2592,
    longitude: -97.7378,
    district: "Rainey / Waterfront",
    category: "community",
    note: "Meet neighbors before a lake loop, then head to coffee or dinner together.",
    participants: ["shore_anna", "shore_miles", "shore_jules"],
    host: "Resident host",
    visibility: "building",
    perkNearby: "Trail, coffee, and dinner all within a short walk",
  },
  {
    id: "resident-social-four-seasons",
    title: "Lobby meet-up before dinner",
    placeName: "Four Seasons Residences",
    address: "98 San Jacinto Blvd, Austin, TX 78701",
    latitude: 30.26233,
    longitude: -97.74233,
    district: "Congress / Waterfront",
    category: "social",
    note: "Residents can see who is heading out nearby and join in without chasing group texts.",
    participants: ["fsr_mia", "fsr_owen"],
    host: "Resident concierge",
    visibility: "building",
    perkNearby: "Dinner, events, and hotel services nearby",
  },
  {
    id: "resident-social-milago",
    title: "Milago rooftop sunset",
    placeName: "Milago",
    address: "54 Rainey St, Austin, TX 78701",
    latitude: 30.2578,
    longitude: -97.7385,
    district: "Rainey / Waterfront",
    category: "community",
    note: "A simple way for neighbors to meet in real life before moving on to the rest of downtown.",
    participants: ["milago_cam", "milago_zoe", "milago_noah"],
    host: "Resident host",
    visibility: "building",
    perkNearby: "Walk to drinks, dinner, and trail access",
  },
];

const TAB_CONFIG = [
  { id: "now", label: "Now", path: "/resident-app" },
  { id: "saved", label: "Saved", path: "/resident-app/saved" },
  { id: "plan", label: "Plan", path: "/resident-app/plan" },
  { id: "card", label: "Card", path: "/resident-app/card" },
  { id: "you", label: "You", path: "/resident-app/you" },
];

const FILTER_CHIPS = [
  { id: "all", label: "All nearby" },
  { id: "venue", label: "Venues" },
  { id: "event", label: "Events" },
  { id: "perk", label: "Perks" },
  { id: "building", label: "Buildings" },
  { id: "5min", label: "5 min walk" },
  { id: "tonight", label: "Happening tonight" },
  { id: "saved", label: "Saved" },
];

const FAST_PROMPTS = [
  "Coffee Near Me",
  "Drinks After Work",
  "Happening Tonight",
];

const RESIDENT_MAP_LEGEND = [
  { id: "venue", label: "Places to go", description: "Coffee, dinner, bars, and everyday spots.", type: "venue" },
  { id: "perk", label: "Perks", description: "Deals and member offers you can use nearby.", type: "perk" },
  { id: "event", label: "Events", description: "Things happening now or later tonight.", type: "event" },
  { id: "building", label: "Buildings", description: "Homes and residential towers on the map.", type: "building" },
  { id: "moment", label: "Neighbors", description: "Social activity and ways to meet people nearby.", type: "moment" },
];

const RESIDENT_CROSS_APP_LINKS = [
  { label: "Home", href: "/" },
  { label: "Resident App", href: "/resident-app", active: true },
  { label: "Partner Dashboard", href: "/partners/dashboard" },
  { label: "Search", href: "/explore" },
  { label: "Meg Dude", href: "/resident-app/you" },
];

function getActiveTab(pathname, search) {
  if (pathname === "/resident-app/map") return "now";
  const pathMatch = TAB_CONFIG.find((tab) => pathname === tab.path);
  if (pathMatch) return pathMatch.id;
  return resolveResidentContext({ tab: new URLSearchParams(search).get("tab") }).tab;
}

function matchesResidentFilter(item, activeChip, savedIds) {
  if (activeChip === "all") return true;
  if (activeChip === "saved") return savedIds.has(item.id);
  if (activeChip === "5min") return (item.metadata?.walkMinutes ?? 999) <= 5;
  if (activeChip === "tonight") return item.type === "event" || item.isLive;
  if (activeChip === "building") return item.type === "building" || item.type === "property";
  if (activeChip === "hotel") return item.type === "hotel";
  if (activeChip === "coffee") {
    const text = `${item.category || ""} ${item.name || ""} ${item.title || ""}`.toLowerCase();
    return text.includes("coffee") || text.includes("cafe");
  }
  return item.type === activeChip || item.category === activeChip;
}

function matchesQuery(item, query) {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return true;
  const haystack = [
    item.name,
    item.title,
    item.description,
    item.address,
    item.category,
    item.district,
    ...(item.metadata?.tags || []),
    ...(item.metadata?.searchKeywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(value);
}

function getExternalBookingUrl(item) {
  const term = encodeURIComponent(item?.name || item?.title || "Downtown Austin");
  return `https://www.opentable.com/s/?term=${term}`;
}

function getExternalReserveLabel(item) {
  if (item?.type === "event") return "Add To Calendar";
  if (item?.type === "perk") return "Use With Card";
  return "Book / Reserve";
}

function sortResidentItems(items) {
  return [...items].sort((a, b) => {
    const liveDelta = Number(Boolean(b.isLive)) - Number(Boolean(a.isLive));
    if (liveDelta !== 0) return liveDelta;
    const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
    if (walkDelta !== 0) return walkDelta;
    return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
  });
}

function slugifyResidentValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getResidentDistrictLabel(address = "") {
  const value = String(address).toLowerCase();
  if (value.includes("rainey") || value.includes("east ave") || value.includes("river st") || value.includes("davis")) {
    return "Rainey / Waterfront";
  }
  if (value.includes("san jacinto") || value.includes("congress")) return "Congress / Waterfront";
  if (value.includes("6th") || value.includes("lamar") || value.includes("west ave") || value.includes("nueces")) {
    return "West Downtown";
  }
  return "Downtown Core";
}

function createResidentialBuildingEntity(source, options = {}) {
  if (!source?.buildingName && !source?.name) return null;

  const name = source.buildingName || source.name;
  const latitude = Number(source.latitude ?? source.lat);
  const longitude = Number(source.longitude ?? source.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const district = getResidentDistrictLabel(source.address);

  return {
    id: `resident-building-${slugifyResidentValue(name)}`,
    entity_id: `resident-building-${slugifyResidentValue(name)}`,
    entity_type: "building",
    type: "building",
    name,
    title: name,
    subtitle: source.priceRange || source.category || "Residential building",
    description: source.description,
    address: source.address,
    district,
    category: "building",
    latitude,
    longitude,
    lat: latitude,
    lng: longitude,
    location: { latitude, longitude, valid: true },
    status: "active",
    icon: "building",
    iconType: "building",
    isBuilding: true,
    isLegends: Boolean(source.isLegends),
    markerVariant: "resident-residential",
    metadata: {
      address: source.address,
      buildingName: name,
      unitCount: source.unitCount,
      unitTypes: source.unitTypes || [],
      yearBuilt: source.yearBuilt,
      website: source.website,
      priceRange: source.priceRange || source.tag || source.category,
      amenities: source.amenities || [],
      popularity: source.isFeatured ? 92 : 76,
      walkMinutes: options.walkMinutes ?? 4,
      tags: ["residential", "building", district, ...(source.amenities || [])].filter(Boolean),
      searchKeywords: [name, source.address, source.priceRange, district].filter(Boolean),
      askMapIntentTags: ["building", "residential", "want-to-live-here", district].filter(Boolean),
      residentResidential: true,
      wantToLiveHere: Boolean(options.wantToLiveHere),
    },
  };
}

function createWantToLiveHereEntity(building, index = 0) {
  if (!building) return null;
  const latitude = Number(building.latitude ?? building.lat);
  const longitude = Number(building.longitude ?? building.lng);

  return {
    id: `want-to-live-${slugifyResidentValue(building.name)}`,
    entity_id: `want-to-live-${slugifyResidentValue(building.name)}`,
    entity_type: "moment",
    type: "moment",
    name: `Want to live here · ${building.name}`,
    title: `Want to live here · ${building.name}`,
    subtitle: building.district,
    description: `See the building, what is close by, and how people nearby actually spend their time before you decide.`,
    address: building.address,
    district: building.district,
    category: "community",
    latitude: latitude + 0.00014 + index * 0.00002,
    longitude: longitude - 0.0001,
    lat: latitude + 0.00014 + index * 0.00002,
    lng: longitude - 0.0001,
    location: {
      latitude: latitude + 0.00014 + index * 0.00002,
      longitude: longitude - 0.0001,
      valid: true,
    },
    status: "live",
    icon: "moment",
    iconType: "moment",
    isLive: true,
    metadata: {
      address: building.address,
      buildingName: building.name,
      perk_value: "Open the building view",
      popularity: 68,
      walkMinutes: building.metadata?.walkMinutes ?? 5,
      tags: ["want to live here", "community", building.district],
      searchKeywords: [building.name, "want to live here", building.address].filter(Boolean),
      askMapIntentTags: ["want-to-live-here", "residential", "community", building.district].filter(Boolean),
      residentResidential: true,
      wantToLiveHere: true,
    },
  };
}

function createResidentCommunityEntity(moment, index = 0) {
  const latitude = Number(moment.latitude);
  const longitude = Number(moment.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: `resident-community-${moment.id}`,
    entity_id: `resident-community-${moment.id}`,
    entity_type: "moment",
    type: "moment",
    name: moment.title,
    title: moment.title,
    subtitle: moment.placeName,
    description: moment.note,
    address: moment.address,
    district: moment.district,
    category: moment.category || "community",
    latitude: latitude + index * 0.00002,
    longitude: longitude,
    lat: latitude + index * 0.00002,
    lng: longitude,
    location: { latitude: latitude + index * 0.00002, longitude, valid: true },
    status: "live",
    icon: "moment",
    iconType: "moment",
    isLive: true,
    metadata: {
      address: moment.address,
      host: moment.host,
      participants: moment.participants || [],
      perk_value: moment.perkNearby,
      popularity: Array.isArray(moment.participants) ? moment.participants.length + 62 : 62,
      walkMinutes: 5,
      tags: ["neighbors", "community", moment.placeName, moment.district].filter(Boolean),
      searchKeywords: [moment.title, moment.placeName, moment.address, "neighbors", "community"].filter(Boolean),
      askMapIntentTags: ["moment", "social", "resident", "neighbors", "community"].filter(Boolean),
      residentResidential: true,
      communityConnection: true,
    },
  };
}

function dedupeResidentItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${slugifyResidentValue(item?.name || item?.title)}:${item?.type || item?.entity_type}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ResidentHeader({ user, activeTab }) {
  return (
    <div className="border-b border-[rgba(11,31,51,0.08)] bg-[rgba(247,249,252,0.95)] px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex max-w-[1400px] items-center gap-1 overflow-x-auto px-0 pb-4">
          <Link
            to="/"
            className="mr-1 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] bg-[rgba(11,31,51,0.92)] px-2.5 text-[11px] font-semibold text-[rgba(255,255,255,0.8)] transition hover:bg-[rgba(11,31,51,0.98)]"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2.5} />
            Back
          </Link>
          <span className="mr-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.35)]">
            Downtown Perks
          </span>
          <span className="mr-2 shrink-0 text-[rgba(11,31,51,0.15)]">|</span>
          {RESIDENT_CROSS_APP_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`shrink-0 rounded-[6px] px-2.5 py-1 text-[11px] transition-[background,color] duration-200 ${
                link.active
                  ? "bg-[rgba(198,162,105,0.12)] font-semibold text-[rgb(198,162,105)]"
                  : "bg-transparent font-medium text-[rgba(11,31,51,0.55)] hover:bg-[rgba(11,31,51,0.04)] hover:text-[rgba(11,31,51,0.8)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
              Resident app
            </div>
            <h1 className="mt-1 font-heading text-[1.75rem] font-semibold tracking-[-0.045em] text-foreground">
              Downtown, in one place
            </h1>
            <p className="dp-page-intro mt-2">
              Use one live map to see what is nearby, what is worth going to, where people around you live, and how neighbors are connecting in real life.
            </p>
            <div className="mt-2 text-[12px] text-muted-foreground">
              {user.buildingLine || user.homeBuilding} · {user.district} · {TAB_CONFIG.find((tab) => tab.id === activeTab)?.label}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/resident-app/card"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-[#fbfcff]"
            >
              <IconCard className="h-4 w-4" />
              Open card
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResidentTabBar({ activeTab }) {
  return (
    <div className="border-b border-[rgba(11,31,51,0.08)] bg-white px-2 py-2 md:px-4">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
        {TAB_CONFIG.map((tab) => {
          const Icon = getResidentTabIcon(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-[rgba(11,31,51,0.08)] bg-white text-foreground/70 hover:bg-[#f7f9fc]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ResidentMapLegend({ layerVisibility, onToggleLayer }) {
  return (
    <div className="border-t border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
      <div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
            Pin Toggles
          </div>
          <p className="mt-1 max-w-xl text-[12px] leading-5 text-muted-foreground">
            Turn pin groups on or off so the map stays readable while you search.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {RESIDENT_MAP_LEGEND.map((entry) => {
          const Icon = getEntityIcon({ type: entry.type, category: entry.category, isLegends: entry.type === "building" });
          const visible = layerVisibility[entry.id] !== false;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onToggleLayer(entry.id)}
              className={`flex items-start gap-3 rounded-[16px] border px-3 py-3 text-left transition ${
                visible
                  ? "border-[rgba(11,31,51,0.08)] bg-white shadow-[0_6px_18px_rgba(11,31,51,0.04)]"
                  : "border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] text-foreground/58"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] bg-[var(--dp-navy,#0B1F33)] text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-foreground">{entry.label}</div>
                <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{entry.description}</div>
              </div>
              <div className="ml-auto mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                {visible ? "On" : "Off"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResidentMapSurface({
  title,
  subtitle,
  items,
  activeChip,
  onChipChange,
  queryInput,
  onQueryInputChange,
  onRunQuery,
  onPrompt,
  resultsExpanded,
  onToggleResults,
  mapCenter,
  setMapCenter,
  mapZoom,
  setMapZoom,
  layerVisibility,
  onToggleLayer,
  onSaveItem,
  onPrimaryAction,
  savedSet,
}) {
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="order-2 border-t border-[rgba(11,31,51,0.08)] bg-white lg:order-1 lg:border-t-0 lg:border-r">
        <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-deep,#A8733C)]" />
            Ask The Map
          </div>
          <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
          <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{subtitle}</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onRunQuery();
            }}
            className="mt-4 flex gap-2"
          >
            <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4">
              <Sparkles className="h-4 w-4 text-[var(--dp-gold-deep,#A8733C)]" />
              <input
                value={queryInput}
                onChange={(event) => onQueryInputChange(event.target.value)}
                placeholder="Ask What You Want Nearby"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/42"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
            >
              Ask
            </button>
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {FAST_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPrompt(prompt)}
                className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-2 text-[11px] font-medium whitespace-nowrap text-foreground/78"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => onChipChange(chip.id)}
                className={`rounded-full border px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-all ${
                  activeChip === chip.id
                    ? "border-primary bg-primary text-white"
                    : "border-[rgba(11,31,51,0.08)] bg-white text-foreground/70 hover:bg-[#f7f9fc]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                Agent Results
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">
                {FILTER_CHIPS.find((chip) => chip.id === activeChip)?.label || "All Nearby"} · {items.length} Result{items.length === 1 ? "" : "s"}
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleResults}
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(11,31,51,0.08)] px-3 py-1.5 text-[11px] font-medium text-foreground"
            >
              {resultsExpanded ? "Hide results" : "Show results"}
              {resultsExpanded ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <ResidentMapLegend
          layerVisibility={layerVisibility}
          onToggleLayer={onToggleLayer}
        />

        {resultsExpanded ? (
          <div className="h-[320px] border-t border-[rgba(11,31,51,0.08)] lg:h-[calc(100%-356px)]">
            <UnifiedResultsPanel
              items={items}
              title="Nearby now"
              onSelectResult={(item) => {
                selectEntity(item);
                setDrawerState("preview");
              }}
            />
          </div>
        ) : (
          <div className="px-4 pb-4 md:px-5">
            {selectedEntity ? (
              <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                  Selected
                </div>
                <div className="mt-2 text-[15px] font-semibold text-foreground">{selectedEntity.name}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {selectedEntity.address || selectedEntity.description}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSaveItem?.(selectedEntity)}
                    className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy,#0B1F33)]"
                  >
                    {savedSet?.has(selectedEntity.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrimaryAction?.(selectedEntity)}
                    className="inline-flex h-10 items-center justify-center rounded-[12px] bg-primary px-3 text-[12px] font-semibold text-white"
                  >
                    {getExternalReserveLabel(selectedEntity)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-[#f7f9fc] p-4 text-[12px] text-muted-foreground">
                Select a pin to see details, save it, add it to plan, or open your card.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="order-1 relative min-h-[420px] bg-[#eef2f7] lg:order-2 lg:min-h-0">
        <UnifiedMapShell
          items={items}
          enableClustering={false}
          selectedId={selectedEntity?.id}
          markerIcon={(item, isSelected) =>
            createMarker(item, {
              isSelected,
              variant:
                item?.metadata?.residentResidential && (item.type === "building" || item.type === "moment")
                  ? "property-showcase"
                  : undefined,
            })
          }
          onMarkerSelect={(item) => {
            selectEntity(item);
            setDrawerState("preview");
          }}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapCenterChange={setMapCenter}
          onMapZoomChange={setMapZoom}
          className="h-full w-full"
        />
        <UnifiedDrawer
          selected={selectedEntity}
          desktopMode="docked"
          desktopClassName="right-4 top-4 bottom-4"
        />
      </div>
    </div>
  );
}

function ResidentNowTab({ items, onOpenMap, onSelectItem, onSaveItem, onPrimaryAction, savedSet, sharedMapProps }) {
  const liveEvents = items.filter((item) => item.type === "event").slice(0, 5);
  const nearbyPerks = items.filter((item) => item.type === "perk" || item.perk_value).slice(0, 5);
  const residentBuildings = items
    .filter((item) => item.type === "building" && item.metadata?.residentResidential)
    .slice(0, 8);
  const residentCommunity = items
    .filter((item) => item.type === "moment" && item.metadata?.communityConnection)
    .slice(0, 5);
  const topPicks = items.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div id="resident-live-map" className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
        <ResidentMapSurface {...sharedMapProps} onSaveItem={onSaveItem} onPrimaryAction={onPrimaryAction} savedSet={savedSet} />
      </div>

      <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Nearby now
            </div>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
              Good choices in the next 5 to 30 minutes
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">
              Open now, happening tonight, worth saving, and easy to reach from your building.
            </p>
          </div>
          <Link
            to="/resident-app"
            onClick={onOpenMap}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
          >
            Refocus map
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <ResidentRail
        eyebrow="Happening tonight"
        title="Live events and social moments"
        items={liveEvents}
        onSelectItem={onSelectItem}
        onSaveItem={onSaveItem}
        onPrimaryAction={onPrimaryAction}
        savedSet={savedSet}
      />

      <ResidentRail
        eyebrow="Resident-only unlocks"
        title="Perks worth using nearby"
        items={nearbyPerks}
        onSelectItem={onSelectItem}
        onSaveItem={onSaveItem}
        onPrimaryAction={onPrimaryAction}
        savedSet={savedSet}
      />

      <ResidentRail
        eyebrow="Want to live here"
        title="Downtown homes on the same live map"
        items={residentBuildings}
        onSelectItem={onSelectItem}
        onSaveItem={onSaveItem}
        onPrimaryAction={onPrimaryAction}
        savedSet={savedSet}
      />

      <ResidentRail
        eyebrow="Neighbors nearby"
        title="Ways people can actually meet in real life"
        items={residentCommunity}
        onSelectItem={onSelectItem}
        onSaveItem={onSaveItem}
        onPrimaryAction={onPrimaryAction}
        savedSet={savedSet}
      />

      <ResidentRail
        eyebrow="Best within 5 minutes"
        title="Fast local decisions"
        items={topPicks}
        onSelectItem={onSelectItem}
        onSaveItem={onSaveItem}
        onPrimaryAction={onPrimaryAction}
        savedSet={savedSet}
      />

      <ResidentWalkingMap />
    </div>
  );
}

function ResidentRail({ eyebrow, title, items, onSelectItem, onSaveItem, onPrimaryAction, savedSet }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [items]);

  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
  const activeItem = items[safeIndex] || null;
  const ActiveIcon = activeItem ? getEntityIcon(activeItem) : IconSearch;
  const activeLabel = activeItem ? getEntityLabel(activeItem) : "Nearby";

  return (
    <section>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          {eyebrow}
        </div>
        <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
      </div>

      <div className="relative overflow-hidden rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(243,247,251,0.96))] shadow-[0_12px_28px_rgba(11,31,51,0.05)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(207,175,90,0.08),transparent)]" />
        <motion.div
          aria-hidden="true"
          animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-10 right-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(11,31,51,0.08),transparent_68%)]"
        />

        <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1.2fr)_280px]">
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {activeItem ? (
                <motion.button
                  key={activeItem.id}
                  type="button"
                  onClick={() => onSelectItem(activeItem)}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.99 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  className="block w-full rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/90 p-5 text-left shadow-[0_10px_26px_rgba(11,31,51,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/72">
                      <ActiveIcon className="h-3.5 w-3.5" />
                      {activeLabel}
                    </span>
                    {activeItem.metadata?.walkMinutes ? (
                      <span className="rounded-full bg-[rgba(207,175,90,0.14)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-deep,#A97816)]">
                        {activeItem.metadata.walkMinutes} min walk
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 max-w-xl">
                    <div className="text-[22px] font-semibold tracking-[-0.04em] text-foreground md:text-[26px]">
                      {activeItem.name}
                    </div>
                    <div className="mt-3 text-[13px] leading-6 text-muted-foreground">
                      {activeItem.perk_value || activeItem.description || activeItem.address}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {activeItem.address ? (
                      <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-1.5 text-[11px] font-medium text-foreground/72">
                        {activeItem.address}
                      </span>
                    ) : null}
                    {activeItem.district ? (
                      <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-1.5 text-[11px] font-medium text-foreground/72">
                        {activeItem.district}
                      </span>
                    ) : null}
                    {activeItem.metadata?.time ? (
                      <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-1.5 text-[11px] font-medium text-foreground/72">
                        {activeItem.metadata.time}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(11,31,51,0.08)]">
                      <motion.div
                        key={activeItem.id}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.0, ease: "linear" }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--dp-gold,#CFAF5A),var(--dp-navy,#0B1F33))]"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSaveItem?.(activeItem);
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy,#0B1F33)]"
                      >
                        {savedSet?.has(activeItem.id) ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPrimaryAction?.(activeItem);
                        }}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[12px] bg-primary px-3 text-[12px] font-semibold text-white"
                      >
                        {getExternalReserveLabel(activeItem)}
                        <IconArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => {
              const Icon = getEntityIcon(item);
              const isActive = index === safeIndex;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ x: 2 }}
                  className={`flex w-full items-start gap-3 rounded-[18px] border p-3 text-left transition-all ${
                    isActive
                      ? "border-[rgba(207,175,90,0.34)] bg-white shadow-[0_10px_22px_rgba(11,31,51,0.08)]"
                      : "border-transparent bg-white/58 hover:bg-white/80"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isActive ? "bg-[rgba(11,31,51,0.92)] text-white" : "bg-[rgba(11,31,51,0.06)] text-[var(--dp-navy,#0B1F33)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-foreground">{item.name}</div>
                    <div className="mt-1 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                      {item.perk_value || item.description || item.address}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResidentEntityCard({ item, onClick, className = "" }) {
  const EntityIcon = getEntityIcon(item);
  const entityLabel = getEntityLabel(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4 text-left shadow-[0_8px_20px_rgba(11,31,51,0.04)] transition-all hover:-translate-y-[1px] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
          <EntityIcon className="h-3.5 w-3.5" />
          {entityLabel}
        </span>
        {item.metadata?.walkMinutes ? (
          <span className="text-[11px] font-medium text-[var(--dp-gold-muted)]">{item.metadata.walkMinutes} min</span>
        ) : null}
      </div>
      <div className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-foreground">{item.name}</div>
      <div className="mt-2 text-[12px] leading-5 text-muted-foreground">{item.perk_value || item.description || item.address}</div>
    </button>
  );
}

function ResidentSavedTab({ items, onSelectItem }) {
  const savedIds = useResidentStore((state) => state.history.saved);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);
  const savedItems = items.filter((item) => savedSet.has(item.id));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          Saved
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Save places, perks, and events to come back later
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Keep nearby options worth remembering, then move them into your plan when the timing makes sense.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[rgba(11,31,51,0.12)] bg-white p-8">
          <div className="text-lg font-semibold text-foreground">Nothing saved yet</div>
          <div className="mt-2 max-w-xl text-[13px] leading-6 text-muted-foreground">
            Save places, perks, and events from the map or the Now tab. They will show up here instantly.
          </div>
          <Link
            to="/resident-app"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
          >
            Open live layer
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {savedItems.map((item) => (
            <ResidentEntityCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResidentPlanTab({ items }) {
  const tonight = items.filter((item) => item.type === "event" || item.isLive).slice(0, 4);
  const later = items.filter((item) => item.type !== "event").slice(0, 4);

  const sections = [
    { label: "Tonight", items: tonight, description: "Things worth showing up for tonight." },
    { label: "Later this week", items: later, description: "Easy nearby options to keep in mind." },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          Plan
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
          Lightweight planning for tonight and later
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Keep a short list of what fits after work, this weekend, or the next open window downtown.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.label}>
          <div className="mb-4">
            <div className="text-[18px] font-semibold tracking-[-0.02em] text-foreground">{section.label}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{section.description}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {section.items.map((item) => (
              <div
                key={`${section.label}-${item.id}`}
                className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4 shadow-[0_8px_20px_rgba(11,31,51,0.04)]"
              >
                {(() => {
                  const EntityIcon = getEntityIcon(item);
                  const entityLabel = getEntityLabel(item);
                  return (
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(11,31,51,0.05)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/72">
                    <EntityIcon className="h-3.5 w-3.5" />
                    {entityLabel}
                  </span>
                  {item.type === "event" ? <IconCalendarCheck className="h-4 w-4 text-primary" /> : <IconNavigation className="h-4 w-4 text-primary" />}
                </div>
                  );
                })()}
                <div className="mt-3 text-[15px] font-semibold text-foreground">{item.name}</div>
                <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  {item.metadata?.time || item.eventTiming?.title || item.address || item.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResidentCardTab({ user, items, onSaveItem, onPrimaryAction, savedSet }) {
  const nearbyPerks = items.filter((item) => item.type === "perk" || item.perk_value).slice(0, 3);
  const savedIds = useResidentStore((state) => state.history.saved);
  const [showCode, setShowCode] = useState(true);
  const cardCode = `DP-${user.id.slice(0, 6).toUpperCase()}-ATX`;
  const qrValue = JSON.stringify({
    type: "downtown_perks_member_card",
    memberId: cardCode,
    name: user.full_name,
    status: "active",
    source: "resident_app",
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrValue)}`;
  const points = 1240;
  const savedCount = savedIds.length;
  const signalItems = [
    { label: "City activity", value: "Moderate", note: "Live downtown movement" },
    { label: "Saved", value: `${savedCount}`, note: "Places worth coming back to" },
    { label: "Points", value: points.toLocaleString(), note: "Member activity" },
  ];
  const quickActions = ["Use a perk", "Save a place", "RSVP tonight"];

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:px-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-[var(--dp-navy,#0B1F33)] shadow-[0_24px_56px_rgba(11,31,51,0.16)]"
      >
        <div className="relative min-h-[620px]">
          <img
            src="/media/resident-card-hero-reference-2.png"
            alt="Downtown Austin cinematic map moodboard"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.96]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.22)_0%,rgba(6,12,24,0.52)_38%,rgba(6,12,24,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_58%,rgba(194,143,84,0.24),transparent_18%),radial-gradient(circle_at_76%_58%,rgba(194,143,84,0.12),transparent_8%),radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.10),transparent_18%)]" />

          <div className="relative grid min-h-[620px] gap-4 p-5 md:p-6 xl:grid-cols-[1.02fr_0.98fr] xl:grid-rows-[auto_auto_1fr]">
            <div className="xl:max-w-[32rem]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/68">
                Your Access
              </div>
              <h2 className="mt-3 font-heading text-[2.7rem] font-semibold leading-[0.92] tracking-[-0.055em] text-white md:text-[3.8rem]">
                Perks Card
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/78">
                One member card for downtown. Use it when you want to unlock a perk, save a place, or move faster when you are already out.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {quickActions.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-[12px] font-medium text-white/86 backdrop-blur-md"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold,#CFAF5A)]" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/resident-app"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[rgba(194,143,84,0.92)] px-5 text-sm font-semibold text-[var(--dp-navy,#0B1F33)] shadow-[0_12px_28px_rgba(194,143,84,0.24)] transition hover:bg-[rgba(205,156,93,0.96)]"
                >
                  Open the resident map
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCode((current) => !current)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] px-5 text-sm font-semibold text-white backdrop-blur-md"
                >
                  <IconCard className="h-4 w-4 text-[var(--dp-gold,#CFAF5A)]" />
                  {showCode ? "Hide code" : "Show code"}
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="xl:justify-self-end"
            >
              <div className="w-full max-w-[260px] rounded-[22px] border border-[rgba(255,255,255,0.12)] bg-[rgba(7,15,29,0.78)] p-4 text-white shadow-[0_18px_42px_rgba(3,8,18,0.24)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54">
                      City activity
                    </div>
                    <div className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-white">Moderate</div>
                    <div className="mt-1 text-[12px] leading-5 text-white/68">Live activity across downtown Austin</div>
                  </div>
                </div>
                <div className="mt-4 flex items-end gap-1.5">
                  {[0.18, 0.24, 0.22, 0.32, 0.28, 0.4, 0.36, 0.48].map((value, index) => (
                    <motion.span
                      key={index}
                      animate={{ height: [`${Math.max(14, value * 64)}px`, `${Math.max(18, value * 74)}px`, `${Math.max(14, value * 64)}px`] }}
                      transition={{ duration: 2 + index * 0.12, repeat: Infinity, ease: "easeInOut" }}
                      className="w-3 rounded-full bg-[linear-gradient(180deg,rgba(255,207,122,0.96),rgba(194,143,84,0.44))]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-[22px] border border-[rgba(255,255,255,0.12)] bg-[rgba(7,15,29,0.70)] p-4 text-white shadow-[0_16px_34px_rgba(3,8,18,0.22)] backdrop-blur-xl xl:max-w-[420px]"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/64">
                <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold,#CFAF5A)]" />
                Ask the map
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.06)] px-4 py-3">
                <IconSearch className="h-4 w-4 text-white/56" />
                <span className="flex-1 text-[14px] text-white/88">Show perks near me tonight</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(194,143,84,0.96)] text-[var(--dp-navy,#0B1F33)] shadow-[0_10px_24px_rgba(194,143,84,0.22)]">
                  <IconArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-white/72">
                {["Dining", "Nightlife", "Coffee", "Events"].map((item, index) => (
                  <span
                    key={item}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${
                      index === 1
                        ? "bg-[rgba(194,143,84,0.16)] text-[rgba(255,213,149,0.98)]"
                        : "bg-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className="relative overflow-hidden rounded-[26px] border border-[rgba(255,255,255,0.14)] bg-[rgba(7,15,29,0.76)] p-4 shadow-[0_20px_46px_rgba(3,8,18,0.24)] backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute right-8 top-8 h-16 w-16 rounded-full bg-[rgba(194,143,84,0.26)] blur-2xl" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/52">Downtown Perks</div>
                    <div className="mt-2 text-[26px] font-semibold tracking-[-0.05em] text-white">{user.full_name}</div>
                    <div className="mt-1 text-[12px] text-white/54">{cardCode}</div>
                  </div>
                  <div className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold,#CFAF5A)]">
                    Active member
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {signalItems.map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/48">{item.label}</div>
                      <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white">{item.value}</div>
                      <div className="mt-1 text-[11px] leading-4 text-white/54">{item.note}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[22px] bg-white px-4 py-5 text-center shadow-[0_14px_28px_rgba(0,0,0,0.16)]">
                  <div className="mx-auto w-fit rounded-[18px] bg-white p-2">
                    <motion.img
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                      src={qrUrl}
                      alt="Downtown Perks resident QR code"
                      className="h-48 w-48 rounded-[16px] md:h-52 md:w-52"
                    />
                  </div>
                  <div className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                    Show this when you want to unlock something
                  </div>
                  <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                    Staff scans it. Perk activates. You keep moving.
                  </div>
                </div>
              </motion.div>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="rounded-[22px] border border-[rgba(255,255,255,0.12)] bg-[rgba(7,15,29,0.72)] p-4 text-white shadow-[0_16px_34px_rgba(3,8,18,0.22)] backdrop-blur-xl"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold,#CFAF5A)]">
                    Downtown live
                  </div>
                  <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-white">Your card follows the map</div>
                  <div className="mt-2 text-[13px] leading-6 text-white/70">
                    Find a place, save it, show the code when it matters, and keep using the same downtown flow.
                  </div>
                </motion.div>

                {nearbyPerks.length ? (
                  <motion.div
                    id="nearby-unlocks"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26 }}
                    className="rounded-[22px] border border-[rgba(255,255,255,0.12)] bg-[rgba(7,15,29,0.72)] p-4 text-white shadow-[0_16px_34px_rgba(3,8,18,0.22)] backdrop-blur-xl"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/54">
                      Nearby unlocks
                    </div>
                    <div className="mt-3 space-y-2">
                      {nearbyPerks.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-3 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[13px] font-semibold text-white">{item.name}</div>
                              <div className="mt-1 text-[11px] text-[rgba(255,213,149,0.94)]">{item.perk_value || "Member perk"}</div>
                              <div className="mt-1 text-[11px] leading-5 text-white/58">{item.address}</div>
                            </div>
                            <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/38" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onSaveItem?.(item)}
                              className="inline-flex h-9 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-3 text-[11px] font-semibold text-white"
                            >
                              {savedSet?.has(item.id) ? "Saved" : "Save Perk"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onPrimaryAction?.(item)}
                              className="inline-flex h-9 items-center justify-center rounded-[12px] bg-[rgba(194,143,84,0.96)] px-3 text-[11px] font-semibold text-[var(--dp-navy,#0B1F33)]"
                            >
                              Use With Card
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="mx-auto h-px max-w-5xl bg-[linear-gradient(90deg,transparent,rgba(11,31,51,0.18),transparent)]"
      />
    </div>
  );
}

function ResidentYouTab({ user, items }) {
  const savedIds = useResidentStore((state) => state.history.saved);
  const redeemedIds = useResidentStore((state) => state.history.redeemed);
  const savedCount = savedIds.length;
  const redeemedCount = redeemedIds.length;
  const eventCount = items.filter((item) => item.type === "event").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 md:px-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
          You
        </div>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">Your downtown profile</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          Home building, preferences, recent behavior, support, and the settings that shape your resident experience.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
          <div className="text-lg font-semibold text-foreground">{user.full_name}</div>
          <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
          <div className="mt-4 rounded-[16px] bg-[#f7f9fc] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
              Home building
            </div>
            <div className="mt-2 text-[15px] font-semibold text-foreground">{user.homeBuilding}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{user.district}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { label: "Saved", value: savedCount, icon: IconBookmark },
              { label: "Redeemed", value: redeemedCount, icon: IconPerk },
              { label: "Live events nearby", value: eventCount, icon: IconCalendarCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</div>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 text-[1.9rem] font-semibold tracking-[-0.04em] text-foreground">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Preferences
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Coffee", "Dining", "Rooftops", "Live music", "Wellness"].map((item) => (
                <span key={item} className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-2 text-[12px] font-medium text-foreground/76">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
              Support and settings
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {[
                { label: "Notification settings", icon: IconSettings },
                { label: "About Downtown Perks", icon: IconInfo },
                { label: "Help and support", icon: IconBookmark },
                { label: "Reset resident access", icon: IconCard },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[16px] bg-[#f7f9fc] px-4 py-4 text-[13px] font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResidentApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useState(GUEST_RESIDENT);
  const [activeChip, setActiveChip] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);
  const [layerVisibility, setLayerVisibility] = useState({
    venue: true,
    perk: true,
    event: true,
    building: true,
    moment: true,
  });

  const activeTab = getActiveTab(location.pathname, location.search);
  const mutations = useResidentMutations(user.id);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setSaved = useMapStateStore((state) => state.setSaved);
  const savedIds = useResidentStore((state) => state.history.saved);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  useEffect(() => {
    setSaved(savedIds);
  }, [savedIds, setSaved]);

  const { items } = useSharedMapFeed({
    query,
    activeCategory:
      activeChip === "venue" || activeChip === "event" || activeChip === "perk"
        ? activeChip
        : "all",
    limit: 120,
  });

  const residentResidentialItems = useMemo(() => {
    const raineyBuildings = REPLIT_PROPERTIES.filter((property) =>
      ["70 Rainey", "Natiivo Austin", "700 River", "The Shore", "Milago", "Northshore", "44 East Ave"].includes(
        property.buildingName
      )
    );

    const additionalBuildings = [
      REPLIT_PROPERTIES.find((property) => property.buildingName === "Four Seasons Residences"),
      REPLIT_PROPERTIES.find((property) => property.buildingName === "Plaza Lofts"),
      FEATURED_BRANDS.find((brand) => brand.name === "The Paseo"),
      FEATURED_BRANDS.find((brand) => brand.name === "The Waterline"),
      THE_MODERN_REFERENCE,
    ].filter(Boolean);

    const buildingItems = [...raineyBuildings, ...additionalBuildings]
      .map((building, index) => createResidentialBuildingEntity(building, { walkMinutes: 3 + (index % 4) }))
      .filter(Boolean)
      .sort(
        (a, b) =>
          RESIDENT_RESIDENCE_ORDER.indexOf(a.name) - RESIDENT_RESIDENCE_ORDER.indexOf(b.name)
      );

    const wantToLiveItems = buildingItems.map((building, index) => createWantToLiveHereEntity(building, index)).filter(Boolean);
    const communityItems = RESIDENT_COMMUNITY_MOMENTS.map((moment, index) => createResidentCommunityEntity(moment, index)).filter(Boolean);

    return [...buildingItems, ...wantToLiveItems, ...communityItems];
  }, []);

  const residentItems = useMemo(
    () => sortResidentItems(dedupeResidentItems([...residentResidentialItems, ...items])),
    [items, residentResidentialItems]
  );
  const layerFilteredItems = useMemo(() => {
    return residentItems.filter((item) => {
      if (item.type === "venue") return layerVisibility.venue;
      if (item.type === "perk") return layerVisibility.perk;
      if (item.type === "event") return layerVisibility.event;
      if (item.type === "building" || item.type === "property" || item.type === "hotel") return layerVisibility.building;
      if (item.type === "moment") return layerVisibility.moment;
      return true;
    });
  }, [residentItems, layerVisibility]);
  const filteredItems = useMemo(() => {
    const savedSet = new Set(savedIds);
    return layerFilteredItems.filter((item) => matchesResidentFilter(item, activeChip, savedSet) && matchesQuery(item, query));
  }, [activeChip, query, layerFilteredItems, savedIds]);

  const handleSelectItem = async (item) => {
    selectEntity(item);
    await mutations.logInteraction(item, "open", query, { surface: activeTab });
    navigate("/resident-app");
  };

  const handleSaveItem = async (item) => {
    await mutations.toggleSavedItem(item);
  };

  const handlePrimaryAction = async (item) => {
    if (!item) return;

    if (item.type === "event") {
      await mutations.upsertRsvp(item, "going");
      const title = encodeURIComponent(item.name || "Downtown event");
      const details = encodeURIComponent(item.description || item.address || "Downtown Austin");
      const locationValue = encodeURIComponent(item.address || item.district || "Downtown Austin");
      window.open(
        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${locationValue}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (item.type === "perk" || item.perk_value) {
      navigate("/resident-app/card#nearby-unlocks");
      return;
    }

    window.open(getExternalBookingUrl(item), "_blank", "noopener,noreferrer");
  };

  const sharedMapProps = {
    title: "One Search. Nearby Answers.",
    subtitle:
      "Search downtown homes, nearby places, want-to-live-here signals, and neighbor activity in one live layer so deciding where to go or where to live feels simpler.",
    items: filteredItems,
    activeChip,
    onChipChange: setActiveChip,
    queryInput,
    onQueryInputChange: setQueryInput,
    onRunQuery: () => setQuery(queryInput.trim()),
    onPrompt: (prompt) => {
      setQueryInput(prompt);
      setQuery(prompt);
    },
    resultsExpanded,
    onToggleResults: () => setResultsExpanded((current) => !current),
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    layerVisibility,
    onToggleLayer: (layerId) =>
      setLayerVisibility((current) => ({
        ...current,
        [layerId]: !current[layerId],
      })),
  };

  useEffect(() => {
    if (activeTab !== "now" || query) return;
    setMapCenter([30.2593, -97.7387]);
    setMapZoom(15.2);
  }, [activeTab, query]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const nextQuery = searchParams.get("query");
    const nextChip = searchParams.get("chip");

    if (nextQuery) {
      setQueryInput(nextQuery);
      setQuery(nextQuery);
    }

    if (nextChip && FILTER_CHIPS.some((chip) => chip.id === nextChip)) {
      setActiveChip(nextChip);
    }
  }, [location.search]);

  useEffect(() => {
    if (!location.hash) return;
    const targetId = location.hash.replace("#", "");
    const target = document.getElementById(targetId);
    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [location.hash, activeTab]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <ResidentHeader user={user} activeTab={activeTab} />
      <ResidentTabBar activeTab={activeTab} />

      <main className="min-h-[calc(100vh-152px)]">
        {activeTab === "now" ? (
          <ResidentNowTab
            items={filteredItems}
            onOpenMap={() => setQuery(queryInput.trim())}
            onSelectItem={handleSelectItem}
            onSaveItem={handleSaveItem}
            onPrimaryAction={handlePrimaryAction}
            savedSet={savedSet}
            sharedMapProps={sharedMapProps}
          />
        ) : null}
        {activeTab === "saved" ? <ResidentSavedTab items={residentItems} onSelectItem={handleSelectItem} /> : null}
        {activeTab === "plan" ? <ResidentPlanTab items={residentItems} /> : null}
        {activeTab === "card" ? <ResidentCardTab user={user} items={residentItems} onSaveItem={handleSaveItem} onPrimaryAction={handlePrimaryAction} savedSet={savedSet} /> : null}
        {activeTab === "you" ? <ResidentYouTab user={user} items={residentItems} /> : null}
      </main>
    </div>
  );
}
