import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Coffee,
  Home,
  MapPin,
  Navigation,
  QrCode,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { filterValidEntities } from "@/lib/mapValidation";
import { mapRepository } from "@/lib/repositories/mapRepository";

const AUSTIN_CENTER = [30.267, -97.743];

const FILTER_TABS = [
  { label: "All", id: "all" },
  { label: "Places", id: "venue" },
  { label: "Offers", id: "perk" },
  { label: "Events", id: "event" },
  { label: "Properties", id: "building" },
];

const FILTER_COPY = {
  all: {
    title: "Find What You Need",
    features: [
      "Restaurants, bars, coffee shops, and services nearby",
      "Events happening tonight, ready to RSVP",
      "Local perks from places you'd go anyway",
      "Places worth coming back to",
      "People around you, when you want to be social",
    ],
  },
  venue: {
    title: "Find What You Need",
    features: [
      "Restaurants, bars, coffee shops, and services nearby",
      "Open-now places worth walking to",
      "Daily-use places that keep downtown useful",
      "Nearby stops without app switching",
      "Map-linked venue cards that stay in context",
    ],
  },
  perk: {
    title: "Find What You Need",
    features: [
      "Local perks from places you'd go anyway",
      "Offers tied to real venues and locations",
      "Redeemable value instead of decorative coupons",
      "Perk discovery that stays inside the same map",
      "Useful savings right where people already are",
    ],
  },
  event: {
    title: "Find What You Need",
    features: [
      "Events happening tonight, ready to RSVP",
      "Live and upcoming events on the same map",
      "Things worth showing up for nearby",
      "Event cards and plotted locations stay synced",
      "No extra searching to make a plan",
    ],
  },
  building: {
    title: "Find What You Need",
    features: [
      "Properties and buildings connected to what is nearby",
      "Hotels and properties in the same system",
      "Building-linked neighborhood context",
      "Nearby perks, venues, and events from the address",
      "Property context without breaking the map-first flow",
    ],
  },
};

const HOW_STEPS = [
  { label: "Tap. Learn. Decide.", detail: "See what it is, why it matters, and how close you are." },
  { label: "Save it or go now.", detail: "Plan ahead — or decide in the moment." },
  { label: "Flash your card. Get the perk.", detail: "They scan. You save. Done." },
];

const ASK_THE_MAP_PROMPTS = [
  {
    title: "Where do you want to go?",
    description: "Coffee, dinner, groceries, fitness, or drinks within walking distance.",
    prompt: "Show me coffee, dinner, groceries, fitness, and drinks within walking distance",
  },
  {
    title: "What do you want to do?",
    description: "See what is on tonight and find something worth showing up for.",
    prompt: "Show me what is happening tonight nearby",
  },
  {
    title: "Who do you want to meet?",
    description: "See who is going, join in, and make a plan.",
    prompt: "Show me places and events where people are gathering nearby",
  },
];

const SECTION_CARDS = [
  {
    icon: Calendar,
    label: "Events Happening Now",
    detail:
      "See what's on. RSVP in one tap. From happy hours to local programming — without leaving the map.",
    actionLabel: "See events",
    mode: "event",
  },
  {
    icon: Home,
    label: "Want to live here?",
    detail:
      "Browse properties nearby. Filter to Properties to view participating buildings, rentals, and homes for sale. Tap any building for availability and what's walkable.",
    actionLabel: "View properties",
    mode: "building",
  },
  {
    icon: QrCode,
    label: "Get Your Perks Card Now",
    detail: "Scan the QR code to get your Perks Card sent directly to your phone. Sign me up.",
    actionLabel: "Sign me up",
    href: "/downtown-perks/card",
  },
];

function getResultIcon(item) {
  if (item?.type === "event") return Calendar;
  if (item?.type === "perk") return Sparkles;
  if (["building", "property", "hotel"].includes(item?.type)) return Home;
  return Coffee;
}

function getFeaturedSummary(item) {
  if (!item) {
    return {
      title: "",
      subtitle: "",
      meta: "",
    };
  }

  const walkMinutes = item?.metadata?.walkMinutes;
  const benefit =
    item?.perk_value ||
    item?.perk_description ||
    item?.description ||
    item?.category ||
    "Live nearby";

  return {
    title: item?.title || item?.name || "Downtown place",
    subtitle: benefit,
    meta: Number.isFinite(walkMinutes)
      ? `${walkMinutes}-minute walk`
      : item?.address || item?.district || "Downtown Austin",
  };
}

function applyCategoryFilter(items, category) {
  if (category === "all") return items;
  return items.filter(
    (item) =>
      item?.type === category ||
      (category === "building" && ["building", "property", "hotel"].includes(item?.type))
  );
}

function applyWalkFilter(items, walkMinutes) {
  if (!Number.isFinite(walkMinutes)) return items;
  return items.filter((item) => (item?.metadata?.walkMinutes ?? 999) <= walkMinutes);
}

export default function MapSection({ mapContext, onMapContextChange }) {
  const ref = useRef(null);
  const mapPanelRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [activeCategory, setActiveCategory] = useState(mapContext?.category || "all");
  const [walkMinutes, setWalkMinutes] = useState(mapContext?.walkMinutes ?? null);
  const [searchInput, setSearchInput] = useState(mapContext?.query || "");
  const [askMode, setAskMode] = useState(Boolean(mapContext?.askMode));
  const [askLoading, setAskLoading] = useState(false);
  const [askResults, setAskResults] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(AUSTIN_CENTER);
  const [mapZoom, setMapZoom] = useState(14);

  const { items: feedItems, loading: feedLoading } = useSharedMapFeed({
    query: askMode ? "" : searchInput,
    activeCategory,
    limit: 200,
  });

  useEffect(() => {
    if (!mapContext) return;

    setSearchInput(mapContext.query || "");
    setAskMode(Boolean(mapContext.askMode));
    setActiveCategory(mapContext.category || "all");
    setWalkMinutes(Number.isFinite(mapContext.walkMinutes) ? mapContext.walkMinutes : null);

    if (mapContext.requestKey) {
      mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mapContext?.requestKey]);

  useEffect(() => {
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!askMode) {
      setAskResults([]);
      return;
    }

    const query = String(searchInput || "").trim();
    if (!query) {
      setAskResults([]);
      return;
    }

    let mounted = true;

    (async () => {
      setAskLoading(true);
      try {
        const { items } = await mapRepository.searchWithIntent({
          query,
          userLocation: {
            latitude: mapCenter?.[0],
            longitude: mapCenter?.[1],
          },
        });

        if (mounted) {
          setAskResults(filterValidEntities(items || []));
        }
      } catch (error) {
        console.error("Home ask-the-map failed:", error);
        if (mounted) setAskResults([]);
      } finally {
        if (mounted) setAskLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [askMode, mapCenter, searchInput]);

  const visibleItems = useMemo(() => {
    const source = askMode ? askResults : feedItems;
    const categoryFiltered = applyCategoryFilter(source || [], activeCategory);
    return filterValidEntities(applyWalkFilter(categoryFiltered, walkMinutes));
  }, [activeCategory, askMode, askResults, feedItems, walkMinutes]);

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedEntity(null);
      return;
    }

    setSelectedEntity((current) => {
      if (current && visibleItems.some((item) => item.id === current.id)) {
        return visibleItems.find((item) => item.id === current.id) || current;
      }
      return null;
    });
  }, [visibleItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) {
      setResultsExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (!selectedEntity?.location) return;
    setMapCenter([selectedEntity.location.latitude, selectedEntity.location.longitude]);
  }, [selectedEntity?.id]);

  const summaryCopy = FILTER_COPY[activeCategory] || FILTER_COPY.all;
  const featured = getFeaturedSummary(selectedEntity || visibleItems[0]);

  function syncContext(next = {}) {
    onMapContextChange?.({
      query: searchInput,
      category: activeCategory,
      askMode,
      walkMinutes,
      ...next,
    });
  }

  function handleFilterChange(nextCategory) {
    setActiveCategory(nextCategory);
    syncContext({ category: nextCategory });
  }

  function handleOpenMap() {
    setAskMode(false);
    mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    syncContext({ askMode: false });
  }

  function handleAskMap() {
    setAskMode(true);
    mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    syncContext({ askMode: true });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setAskMode(false);
    syncContext({ query: searchInput, askMode: false });
  }

  function handlePromptSelect(prompt) {
    setSearchInput(prompt);
    setAskMode(true);
    mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    syncContext({ query: prompt, askMode: true });
  }

  function handleSelectEntity(item) {
    setSelectedEntity((current) => {
      if (current?.id === item.id) {
        return null;
      }
      return item;
    });
  }

  const resultCount = visibleItems.length;

  return (
    <section
      ref={ref}
      className="border-t border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-4 py-16 md:px-6 md:py-18"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 grid grid-cols-1 items-end gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="dp-micro-label mb-3 block">
              What You Can Do
            </span>
            <h2 className="dp-display-section max-w-3xl text-[2.25rem] text-foreground md:text-[3.25rem]">
              Everything works together so you show up more.
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              Search less. Decide faster. The map keeps places, events, perks, and nearby context in one live layer.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white px-5 py-4 text-[13px] leading-6 text-muted-foreground shadow-[0_8px_24px_rgba(11,26,43,0.05)]"
          >
            Ask a question, open the map, tap a pin, and keep the result list rolled up until you need it. The homepage should behave like a product surface, not a directory.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex gap-2 overflow-x-auto pb-0.5"
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap border transition-all ${
                activeCategory === tab.id
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/40 text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 overflow-hidden md:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-white p-6 shadow-[0_10px_28px_rgba(11,26,43,0.05)]">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50 mb-5">
              {summaryCopy.title}
            </div>
            <ul className="mb-8 space-y-3">
              {summaryCopy.features.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13px] text-foreground/60">
                  <div className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mb-5 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f1f4f8] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(10,20,40,0.08)] bg-white">
                  <Coffee className="w-3.5 h-3.5 text-primary/60" />
                </div>
                <div className="min-w-0 flex-1">
                  {feedLoading || askLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-border/40 animate-pulse" />
                      <div className="h-3 w-40 rounded bg-border/30 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-border/30 animate-pulse" />
                    </div>
                  ) : visibleItems.length > 0 ? (
                    <>
                      <div className="text-sm font-medium text-foreground">{featured.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{featured.subtitle}</div>
                      <div className="mt-1 text-[11px] text-primary/70">{featured.meta}</div>
                    </>
                  ) : (
                    <div className="text-[12px] text-muted-foreground">No items available for this filter.</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="shrink-0 rounded-full border border-primary/30 px-2.5 py-1 text-[11px] font-medium text-primary"
                >
                  Show Card
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOpenMap}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[12px] font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                <MapPin className="w-3.5 h-3.5" />
                Explore Downtown
              </button>
              <Link
                to="/downtown-perks/card"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-[12px] font-medium text-foreground/70 transition-all hover:text-foreground"
              >
                Get a Perks Card
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-white p-6 shadow-[0_10px_28px_rgba(11,26,43,0.05)]">
            <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
              How It Works
            </div>
            <div className="dp-carousel md:grid md:grid-cols-1 md:gap-3 md:overflow-visible">
              {HOW_STEPS.map((step) => (
                <div key={step.label} className="min-w-[80%] rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] p-4 md:min-w-0">
                  <div className="mb-1.5 text-sm font-semibold text-foreground">{step.label}</div>
                  <div className="text-[13px] leading-6 text-muted-foreground">{step.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[var(--dp-navy)] p-4">
              <p className="font-ui text-sm font-semibold dp-dark-copy">Less friction. More follow-through.</p>
              <p className="mt-1 text-[12px] leading-5 dp-dark-copy-muted">
                The shortest path between “maybe” and “I’m going” stays inside one map.
              </p>
            </div>
          </div>
        </div>

        <div className="dp-carousel mb-8 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible">
          {SECTION_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group min-w-[84%] rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white p-5 shadow-[0_6px_20px_rgba(11,26,43,0.04)] transition-all hover:border-primary/20 hover:shadow-[0_10px_24px_rgba(11,26,43,0.06)] md:min-w-0"
              >
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(218,20%,88%)]">
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div className="mb-2 font-ui text-sm font-semibold text-foreground">{item.label}</div>
                <div className="mb-4 text-[12px] leading-6 text-muted-foreground">{item.detail}</div>
                {item.href ? (
                  <Link to={item.href} className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                    {item.actionLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAskMode(false);
                      handleFilterChange(item.mode);
                      mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                  >
                    {item.actionLabel} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-white p-6 shadow-[0_6px_20px_rgba(11,26,43,0.04)]">
          <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
            <div>
              <h3 className="font-display text-[2rem] text-foreground">What’s around the corner</h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Open the map, keep the list compact, and move from pin to decision without losing context.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleOpenMap}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                <MapPin className="w-3.5 h-3.5" />
                Explore nearby
              </button>
            </div>
          </div>
        </div>

        <div
          id="home-live-map"
          ref={mapPanelRef}
          className="mt-8 overflow-hidden rounded-[28px] border border-[rgba(10,20,40,0.08)] bg-white shadow-[0_14px_36px_rgba(11,26,43,0.06)]"
        >
          <div className="border-b border-[rgba(10,20,40,0.08)] p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="dp-micro-label">
                  {askMode ? "Ask the map" : "Live downtown map"}
                </div>
                <h3 className="mt-2 font-ui text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground md:text-[1.9rem]">
                  {askMode && searchInput.trim()
                    ? `Results for "${searchInput.trim()}"`
                    : "Everything nearby — in one map."}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {askMode
                    ? "The ask layer uses the same downtown feed and updates the map, selected detail, and result list together."
                    : "Browse places, events, perks, and properties without leaving the homepage."}
                </p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {ASK_THE_MAP_PROMPTS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => handlePromptSelect(item.prompt)}
                      className="min-w-[220px] rounded-[16px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-4 py-3 text-left transition-all hover:border-primary/20 hover:bg-white"
                    >
                      <div className="text-[13px] font-semibold text-foreground">{item.title}</div>
                      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col gap-2 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f1f4f8] p-2 md:flex-row"
              >
                <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[hsl(218,20%,90%)] bg-white px-4 min-w-[260px]">
                  <Search className="h-4 w-4 shrink-0 text-foreground/45" />
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search nearby"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[hsl(218,20%,88%)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-white"
                >
                  Open map
                </button>
                <button
                  type="button"
                  onClick={handleAskMap}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[hsl(218,42%,14%)] px-4 text-sm font-medium text-white"
                >
                  Ask the map
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[460px] lg:h-[720px]">
              <UnifiedMapShell
                items={visibleItems}
                selectedId={selectedEntity?.id}
                markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
                onMarkerSelect={handleSelectEntity}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onMapCenterChange={setMapCenter}
                onMapZoomChange={setMapZoom}
                className="h-full w-full"
              />
            </div>

            <div className="relative z-10 -mt-16 px-3 pb-3 lg:mt-0 lg:border-l lg:border-[rgba(10,20,40,0.08)] lg:p-4">
              <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white/96 p-4 shadow-[0_14px_34px_rgba(11,26,43,0.12)] backdrop-blur lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
                  {askMode ? "Ask results" : "Nearby results"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#f1f4f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
                    {Number.isFinite(walkMinutes) ? `${walkMinutes} min walk` : "Downtown"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {resultCount} {resultCount === 1 ? "result" : "results"}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    {Number.isFinite(walkMinutes) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setWalkMinutes(null);
                          syncContext({ walkMinutes: null });
                        }}
                        className="text-[11px] font-medium text-primary"
                      >
                        Clear filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setWalkMinutes(5);
                          syncContext({ walkMinutes: 5 });
                        }}
                        className="text-[11px] font-medium text-primary"
                      >
                        5 min walk
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setResultsExpanded((current) => !current)}
                      className="inline-flex items-center gap-1 rounded-full border border-[rgba(10,20,40,0.08)] px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-[#f7f9fc]"
                    >
                      {resultsExpanded ? "Hide results" : "Show results"}
                      {resultsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {selectedEntity ? (
                <div className="mt-3 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                        Selected place
                      </div>
                      <div className="mt-1 text-[15px] font-semibold text-foreground">
                        {getFeaturedSummary(selectedEntity).title}
                      </div>
                      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {getFeaturedSummary(selectedEntity).subtitle}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/70">
                        <span className="inline-flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" />
                          {getFeaturedSummary(selectedEntity).meta}
                        </span>
                        {selectedEntity?.type ? (
                          <span className="rounded-full bg-white px-2 py-1 font-medium capitalize text-foreground/70">
                            {selectedEntity.type}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEntity(null)}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(10,20,40,0.08)] bg-white text-foreground/70 transition-colors hover:text-foreground"
                      aria-label="Close selected place"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {resultsExpanded ? (
                <div className="mt-3 space-y-3 overflow-y-auto pr-1 lg:max-h-[420px]">
                  {visibleItems.length === 0 ? (
                    <div className="rounded-[16px] border border-dashed border-[rgba(10,20,40,0.12)] bg-[#f7f9fc] p-5 text-[13px] leading-6 text-muted-foreground">
                      Nothing nearby right now.
                    </div>
                  ) : (
                    visibleItems.map((item) => {
                      const Icon = getResultIcon(item);
                      const featuredSummary = getFeaturedSummary(item);
                      const isSelected = selectedEntity?.id === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectEntity(item)}
                          className={`w-full rounded-[16px] border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? "border-primary/20 bg-primary/[0.04] shadow-[0_8px_18px_rgba(11,26,43,0.06)]"
                              : "border-[rgba(10,20,40,0.08)] bg-white hover:border-primary/15 hover:bg-[#f7f9fc]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-primary text-white" : "bg-[#f1f4f8] text-primary"}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold text-foreground">{featuredSummary.title}</div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                                <span className="flex items-center gap-[3px] text-[hsl(214,52%,18%)]">
                                  <Navigation className="h-3 w-3" />
                                  {featuredSummary.meta}
                                </span>
                                <span className="font-medium text-[var(--dp-gold-muted)]">{featuredSummary.subtitle}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
