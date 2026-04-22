import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Coffee,
  Home,
  MapPin,
  Navigation,
  QrCode,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import LiveNearbyCard from "@/components/map/unified/LiveNearbyCard";
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

export default function MapSection({ mapContext, onMapContextChange, mode = "full" }) {
  const ref = useRef(null);
  const mapPanelRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const [activeCategory, setActiveCategory] = useState(mapContext?.category || "all");
  const [walkMinutes, setWalkMinutes] = useState(mapContext?.walkMinutes ?? null);
  const [searchInput, setSearchInput] = useState(mapContext?.query || "");
  const [askMode, setAskMode] = useState(Boolean(mapContext?.askMode));
  const [askLoading, setAskLoading] = useState(false);
  const [askResults, setAskResults] = useState([]);
  const [askLiveNearby, setAskLiveNearby] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [mapCenter, setMapCenter] = useState(AUSTIN_CENTER);
  const [mapZoom, setMapZoom] = useState(14);

  const { items: feedItems, liveNearby: feedLiveNearby, loading: feedLoading } = useSharedMapFeed({
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
      setAskLiveNearby(null);
      return;
    }

    const query = String(searchInput || "").trim();
    if (!query) {
      setAskResults([]);
      setAskLiveNearby(null);
      return;
    }

    let mounted = true;

    (async () => {
      setAskLoading(true);
      try {
        const { items, liveNearby } = await mapRepository.searchWithIntent({
          query,
          userLocation: {
            latitude: mapCenter?.[0],
            longitude: mapCenter?.[1],
          },
        });

        if (mounted) {
          setAskResults(filterValidEntities(items || []));
          setAskLiveNearby(liveNearby || null);
        }
      } catch (error) {
        console.error("Home ask-the-map failed:", error);
        if (mounted) {
          setAskResults([]);
          setAskLiveNearby(null);
        }
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

  const liveNearby = askMode ? askLiveNearby : feedLiveNearby;

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedEntity(null);
      return;
    }

    setSelectedEntity((current) => {
      if (current && visibleItems.some((item) => item.id === current.id)) {
        return visibleItems.find((item) => item.id === current.id) || current;
      }
      return visibleItems[0];
    });
  }, [visibleItems]);

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

  const mapModule = (
    <div
      id="home-live-map"
      ref={mapPanelRef}
      className="overflow-hidden rounded-xl border border-[hsl(218,20%,88%)] bg-white shadow-[0_2px_16px_rgba(14,28,54,.06)]"
    >
      <div className="border-b border-[hsl(218,20%,90%)] p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-primary/80">
              {askMode ? "Ask the map" : "Live downtown map"}
            </div>
            <h3 className="mt-2 font-heading text-2xl font-medium tracking-tight text-foreground">
              {askMode && searchInput.trim()
                ? `Results for "${searchInput.trim()}"`
                : "Everything nearby — in one map."}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
              {askMode
                ? "The agent prompt is wired into the same live downtown feed and updates the plotted map and result cards immediately."
                : "Browse places, events, perks, and properties without leaving the homepage."}
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 rounded-[18px] border border-[hsl(218,20%,88%)] bg-[hsl(42,24%,97%)] p-2 md:flex-row"
          >
            <div className="flex h-11 items-center gap-3 rounded-[14px] border border-[hsl(218,20%,90%)] bg-white px-4 min-w-[260px]">
              <Search className="h-4 w-4 shrink-0 text-foreground/45" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Ask the map..."
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[420px] lg:h-[720px]">
          <UnifiedMapShell
            items={visibleItems}
            selectedId={selectedEntity?.id}
            markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
            onMarkerSelect={setSelectedEntity}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onMapCenterChange={setMapCenter}
            onMapZoomChange={setMapZoom}
            className="h-full w-full"
          />
        </div>

        <div className="border-t border-[hsl(218,20%,90%)] p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
              {askMode ? "Ask results" : "Nearby results"}
            </div>
            {Number.isFinite(walkMinutes) ? (
              <button
                type="button"
                onClick={() => {
                  setWalkMinutes(null);
                  syncContext({ walkMinutes: null });
                }}
                className="text-[11px] font-medium text-primary"
              >
                Clear {walkMinutes} min
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
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 lg:max-h-[660px]">
            {visibleItems.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[hsl(218,20%,88%)] bg-[hsl(42,24%,97%)] p-5 text-[13px] leading-relaxed text-muted-foreground">
                No items available for this filter.
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
                    onClick={() => setSelectedEntity(item)}
                    className={`w-full rounded-[16px] border px-4 py-3 text-left transition-all ${
                      isSelected
                        ? "border-primary/30 bg-primary/5 shadow-[0_8px_24px_rgba(14,28,54,0.08)]"
                        : "border-[hsl(218,20%,90%)] bg-white hover:border-primary/20 hover:bg-[hsl(42,24%,97%)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(198,162,105,0.08)]">
                        <Icon className="h-4 w-4 text-[hsl(42,55%,45%)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-foreground">{featuredSummary.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="flex items-center gap-[3px] text-[hsl(218,42%,18%)]">
                            <Navigation className="h-3 w-3" />
                            {featuredSummary.meta}
                          </span>
                          <span className="font-semibold text-[hsl(42,55%,38%)]">{featuredSummary.subtitle}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (mode === "hero") {
    return mapModule;
  }

  return (
    <section
      ref={ref}
      className="border-t border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)] px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 grid grid-cols-1 items-end gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
              What You Can Do
            </span>
            <h2 className="font-heading text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-[38px]">
              Everything works together —
              <br />
              <em className="text-primary">so you show up more.</em>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[13px] leading-relaxed text-foreground/60"
          >
            Spend less time searching and more time showing up. Everything you need to move through
            downtown is in one place.
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

        <div className="mb-10 grid grid-cols-1 overflow-hidden rounded-xl border border-[hsl(218,20%,88%)] bg-white shadow-[0_2px_16px_rgba(14,28,54,.06)] md:grid-cols-2">
          <div className="border-[hsl(218,20%,90%)] p-8 md:border-r">
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

            <div className="mb-6 rounded-lg border border-[hsl(218,20%,90%)] bg-[hsl(42,24%,96%)] p-4">
              {feedLoading || askLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-border/40 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-border/30 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-border/30 animate-pulse" />
                </div>
              ) : liveNearby ? (
                <LiveNearbyCard
                  item={liveNearby}
                  compact
                  onSelect={(item) => {
                    setSelectedEntity(item);
                    mapPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              ) : selectedEntity ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border border-border/60 bg-muted/60 flex items-center justify-center shrink-0">
                    <Coffee className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{featured.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{featured.subtitle}</div>
                    <div className="mt-1 text-[11px] text-primary/70">{featured.meta}</div>
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-muted-foreground">No items available for this filter.</div>
              )}
            </div>

            <div className="flex gap-3">
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

          <div className="p-8">
            <div className="mb-5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
              How It Works
            </div>
            <div className="divide-y divide-[hsl(218,20%,92%)]">
              {HOW_STEPS.map((step) => (
                <div key={step.label} className="py-5 first:pt-0 last:pb-0">
                  <div className="mb-1.5 text-sm font-medium text-foreground">{step.label}</div>
                  <div className="text-[13px] leading-relaxed text-foreground/60">{step.detail}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-1 border-t border-[hsl(218,20%,92%)] pt-6">
              <p className="font-heading text-base font-medium italic text-foreground">That's how friction dies.</p>
              <p className="text-[12px] leading-relaxed text-foreground/55">
                No extra steps. No guesswork. Just the shortest distance between "maybe" and "I'm going."
              </p>
            </div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SECTION_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group rounded-xl border border-[hsl(218,20%,88%)] bg-white p-6 shadow-[0_1px_4px_rgba(14,28,54,.04)] transition-all hover:border-primary/30 hover:shadow-[0_4px_16px_rgba(14,28,54,.06)]"
              >
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(218,20%,88%)]">
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div className="mb-2 font-heading text-sm font-medium text-foreground">{item.label}</div>
                <div className="mb-4 text-[12px] leading-relaxed text-foreground/60">{item.detail}</div>
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

        <div className="rounded-xl border border-[hsl(218,20%,88%)] bg-white p-8 shadow-[0_1px_8px_rgba(14,28,54,.04)]">
          <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
            <div>
              <h3 className="font-heading text-2xl font-medium leading-[1.1] mb-2 text-foreground">What's Around the Corner</h3>
              <p className="text-[13px] leading-relaxed text-foreground/60">
                Everything you need, within walking distance. See what's close, decide quickly, and go.
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

      </div>
    </section>
  );
}
