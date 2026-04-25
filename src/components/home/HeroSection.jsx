import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
  Clock3,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";
import { ROUTES } from "@/lib/routes";
import MobileActionPanel from "@/components/shared/MobileActionPanel";
import {
  ASK_MAP_QUESTIONS,
  PRIMARY_SEARCH_PRESETS,
  getPrimaryPresetDefinition,
} from "@/lib/map/searchUiConfig";

const AUSTIN_CENTER = [30.267, -97.743];

const SEARCH_PRESETS = [
  {
    id: "walkable",
    label: "Restaurants, bars, coffee shops, and services nearby",
    query: "restaurants bars coffee and services nearby",
    activeView: "five-minute",
    activePrimary: "all",
  },
  {
    id: "tonight",
    label: "Events happening tonight, ready to RSVP",
    query: "events happening tonight downtown Austin",
    activeView: "people",
    activePrimary: "all",
  },
  {
    id: "perks",
    label: "Local perks from places you'd go anyway",
    query: "local perks nearby",
    activeView: "resident",
    activePrimary: "all",
  },
  {
    id: "saved",
    label: "Places worth coming back to",
    query: "best places worth coming back to downtown Austin",
    activeView: "resident",
    activePrimary: "all",
  },
];

const ROTATING_SEARCH_LINES = [
  "Where do you want to go",
  "What do you want to do",
  "Who do you want to meet",
];

const MAP_VIEWS = [
  {
    id: "five-minute",
    label: "The 5-Minute Neighborhood",
    description: "Walkable neighborhood",
    defaultPins: ["venue", "event", "building"],
  },
  {
    id: "people",
    label: "Not Just Places. People.",
    description: "Social and trending activity",
    defaultPins: ["venue", "event", "moment"],
  },
  {
    id: "resident",
    label: "Live Here. Get Everything.",
    description: "Homes, perks, events, and access",
    defaultPins: ["building", "perk", "event", "brand"],
  },
];

const PIN_TOGGLES = [
  { id: "venue", label: "Places", icon: MapPin },
  { id: "perk", label: "Perks", icon: Sparkles },
  { id: "event", label: "Events", icon: Calendar },
  { id: "building", label: "Homes", icon: Building2 },
  { id: "moment", label: "People", icon: Users },
  { id: "brand", label: "Brands", icon: Sparkles },
];

function normalizePinType(item) {
  if (!item) return "venue";
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  if (["building", "property", "hotel"].includes(type)) return "building";
  if (type === "perk") return "perk";
  if (type === "event") return "event";
  if (type === "moment") return "moment";
  if (type === "brand") return "brand";
  return "venue";
}

function getPromptSeed(question) {
  if (question?.query) return question.query;
  return "coffee nearby";
}

function itemMatchesPrimaryPreset(item, activePrimary) {
  const preset = getPrimaryPresetDefinition(activePrimary);
  const normalizedType = normalizePinType(item) === "building" ? "property" : normalizePinType(item);
  const category = String(item?.category || item?.subcategory || "").toLowerCase();

  if (preset.entityTypes?.length && !preset.entityTypes.includes(normalizedType)) return false;
  if (preset.categories?.length && !preset.categories.includes(category)) return false;
  return true;
}

function itemMatchesMapView(item, activeView) {
  const walkMinutes = item?.metadata?.walkMinutes ?? 999;
  const popularity = Number(item?.metadata?.popularity ?? 0);
  const pinType = normalizePinType(item);

  if (activeView === "people") {
    return (
      pinType === "moment" ||
      pinType === "event" ||
      item?.isLive ||
      item?.eventTiming?.isLive ||
      popularity >= 55
    );
  }

  if (activeView === "resident") {
    return (
      ["building", "perk", "event", "brand"].includes(pinType) ||
      Boolean(item?.perk?.value || item?.perk_value)
    );
  }

  return (
    pinType === "building" ||
    pinType === "event" ||
    walkMinutes <= 8 ||
    ["coffee", "restaurant", "bar", "entertainment", "retail", "wellness", "services"].includes(
      String(item?.category || "").toLowerCase()
    )
  );
}

function getMapMetrics(items = [], activeView = "five-minute") {
  const liveNow = items.some((item) => item?.isLive || item?.eventTiming?.isLive);
  const hasEvents = items.some((item) => normalizePinType(item) === "event");
  const hasShortWalk = items.some((item) => (item?.metadata?.walkMinutes ?? 999) <= 8);
  const hasPerks = items.some((item) => normalizePinType(item) === "perk" || item?.perk?.value || item?.perk_value);
  const hasCardReady = items.some((item) => item?.perk?.value || item?.perk_value || normalizePinType(item) === "perk");
  const hasDistrict = items.some((item) => item?.district);

  if (activeView === "people") {
    return [
      liveNow ? "Open now" : "Open nearby",
      hasEvents ? "Events tonight" : "People nearby",
      hasDistrict ? "District relevance" : "Nearby now",
    ];
  }

  if (activeView === "resident") {
    return [
      hasShortWalk ? "Walk time" : "Nearby now",
      hasPerks ? "Nearby perks" : "Card-ready access",
      hasCardReady ? "Card-ready access" : "District relevance",
    ];
  }

  return [
    liveNow ? "Open now" : "Nearby now",
    hasEvents ? "Events tonight" : "Walk time",
    hasPerks ? "Nearby perks" : hasDistrict ? "District relevance" : "Card-ready access",
  ];
}

function getPreviewMeta(item) {
  const walkMinutes = item?.metadata?.walkMinutes;
  return {
    title: item?.title || item?.name || "Downtown pick",
    detail: Number.isFinite(walkMinutes)
      ? `${walkMinutes} min walk`
      : item?.district || item?.address || "Downtown Austin",
    summary:
      item?.perk?.value ||
      item?.perk_value ||
      item?.description ||
      item?.category ||
      "Nearby now",
  };
}

function buildResultHref(item) {
  const type = normalizePinType(item);
  if (type === "building") return ROUTES.partnerProperties;
  if (type === "brand") return ROUTES.partnerBrands;
  if (type === "event") return ROUTES.events;
  if (type === "perk") return ROUTES.perks;
  return ROUTES.explore;
}

function buildResidentCardHref(item, query) {
  const params = new URLSearchParams();
  params.set("query", String(item?.title || item?.name || query || "nearby perks"));

  const type = normalizePinType(item);
  if (type === "event") params.set("chip", "event");
  else if (type === "perk") params.set("chip", "perk");
  else params.set("chip", "venue");

  return `${ROUTES.residentAppCard}?${params.toString()}`;
}

export default function HeroSection({ mapContext, onAsk }) {
  const [query, setQuery] = useState(mapContext?.query || "");
  const [activePrimary, setActivePrimary] = useState("all");
  const [activeView, setActiveView] = useState("five-minute");
  const [selectedQuestion, setSelectedQuestion] = useState(ASK_MAP_QUESTIONS[0]);
  const [activePins, setActivePins] = useState(MAP_VIEWS[0].defaultPins);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMoreResults, setShowMoreResults] = useState(false);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [rotatingPromptIndex, setRotatingPromptIndex] = useState(0);

  useEffect(() => {
    setQuery(mapContext?.query || "");
  }, [mapContext?.requestKey]);

  useEffect(() => {
    const nextDefaults = MAP_VIEWS.find((view) => view.id === activeView)?.defaultPins || [];
    setActivePins(nextDefaults);
  }, [activeView]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRotatingPromptIndex((current) => (current + 1) % ROTATING_SEARCH_LINES.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  const primaryPreset = useMemo(() => getPrimaryPresetDefinition(activePrimary), [activePrimary]);
  const previewQuery = String(query || "").trim() || primaryPreset.query || "";

  const { items } = useSharedMapFeed({
    query: previewQuery,
    activeCategory: "all",
    limit: 260,
  });

  const visibleItems = useMemo(() => {
    const activePinSet = new Set(activePins);
    return (items || [])
      .filter((item) => itemMatchesMapView(item, activeView))
      .filter((item) => itemMatchesPrimaryPreset(item, activePrimary))
      .filter((item) => activePinSet.has(normalizePinType(item)))
      .slice(0, 180);
  }, [activePins, activePrimary, activeView, items]);

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
    setShowMoreResults(false);
  }, [selectedEntity?.id, query, activePrimary, activeView, activePins.join("|")]);

  const results = visibleItems.slice(0, 10);
  const additionalResults = results.filter((item) => item.id !== selectedEntity?.id);
  const mapCenter = selectedEntity?.location
    ? [selectedEntity.location.latitude, selectedEntity.location.longitude]
    : AUSTIN_CENTER;
  const metrics = getMapMetrics(visibleItems, activeView);
  const withinFiveCount = visibleItems.filter((item) => (item?.metadata?.walkMinutes ?? 999) <= 5).length;
  const homesCount = visibleItems.filter((item) => normalizePinType(item) === "building").length;
  const nearbyCount = visibleItems.length;
  const groupedCategorySummaries = [
    {
      id: "all",
      label: "Nearby",
      count: nearbyCount,
    },
    {
      id: "coffee",
      label: "Coffee",
      count: visibleItems.filter((item) => String(item?.category || "").toLowerCase() === "coffee").length,
    },
    {
      id: "dining",
      label: "Dining",
      count: visibleItems.filter((item) =>
        ["restaurant", "bar", "food", "dining"].includes(String(item?.category || "").toLowerCase())
      ).length,
    },
    {
      id: "nightlife",
      label: "Nightlife",
      count: visibleItems.filter((item) =>
        ["nightlife", "bar", "music", "entertainment"].includes(String(item?.category || "").toLowerCase())
      ).length,
    },
    {
      id: "wellness",
      label: "Wellness",
      count: visibleItems.filter((item) =>
        ["wellness", "fitness", "spa"].includes(String(item?.category || "").toLowerCase())
      ).length,
    },
  ].filter((item) => item.count > 0);
  const activePromptText = ROTATING_SEARCH_LINES[rotatingPromptIndex];
  const selectedMeta = selectedEntity ? getPreviewMeta(selectedEntity) : null;
  const searchRailItems = [
    ...SEARCH_PRESETS.map((preset) => ({
      id: `preset-${preset.id}`,
      label: preset.label,
      active:
        activeView === preset.activeView &&
        String(query || "").trim().toLowerCase() === preset.query.toLowerCase(),
      onClick: () => handleSearchPreset(preset),
    })),
    ...ASK_MAP_QUESTIONS.map((question) => ({
      id: `question-${question.title}`,
      label: question.title.replace("?", ""),
      active: selectedQuestion?.title === question.title,
      onClick: () => handleQuestion(question),
    })),
  ];

  function buildPayload(nextQuery = query) {
    const trimmedQuery = String(nextQuery || "").trim();
    return {
      query: trimmedQuery || primaryPreset.query || "",
      category: activePrimary || "all",
      walkMinutes: activeView === "five-minute" ? 5 : null,
      toggles: activePins,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    onAsk?.(buildPayload(query));
  }

  function handlePrompt(prompt) {
    setQuery(prompt.query);
    onAsk?.(buildPayload(prompt.query));
  }

  function handleSearchPreset(preset) {
    setActiveView(preset.activeView);
    setActivePrimary(preset.activePrimary);
    const nextDefaults = MAP_VIEWS.find((view) => view.id === preset.activeView)?.defaultPins || [];
    setActivePins(nextDefaults);
    setQuery(preset.query);
    onAsk?.({
      query: preset.query,
      category: preset.activePrimary,
      walkMinutes: preset.activeView === "five-minute" ? 5 : null,
      toggles: nextDefaults,
    });
  }

  function handleQuestion(question) {
    setSelectedQuestion(question);
    const seed = getPromptSeed(question);
    setQuery(seed);
  }

  function togglePin(pinId) {
    setActivePins((current) => {
      if (current.includes(pinId)) {
        const next = current.filter((value) => value !== pinId);
        return next.length ? next : current;
      }
      return [...current, pinId];
    });
  }

  return (
    <section className="relative overflow-hidden bg-[#0b1730] pt-[84px] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,168,90,0.14),transparent_28%),linear-gradient(180deg,rgba(8,17,36,0.8)_0%,rgba(10,22,44,0.9)_44%,rgba(11,23,48,1)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_center,rgba(198,168,90,0.14),transparent_62%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 md:px-6 md:pb-14">
        <div className="mx-auto max-w-[58rem] pt-8 text-center md:pt-12 lg:pt-16">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82">
            {APPROVED_HOME_COPY.hero.eyebrow}
          </div>
          <h1 className="mx-auto mt-4 max-w-[13ch] font-heading text-[2.7rem] font-semibold leading-[0.92] tracking-[-0.055em] text-white md:text-[4.5rem]">
            {APPROVED_HOME_COPY.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[rgba(255,255,255,0.9)] md:text-[17px]">
            {APPROVED_HOME_COPY.hero.lead}
          </p>
          <p className="mx-auto mt-3 max-w-[42rem] text-[13px] leading-6 text-[rgba(255,255,255,0.78)]">
            {APPROVED_HOME_COPY.hero.body}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={ROUTES.explore}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-white px-5 text-sm font-semibold text-[var(--dp-navy)] shadow-[0_12px_28px_rgba(4,10,22,0.12)] transition-colors hover:bg-white/94"
            >
              {APPROVED_HOME_COPY.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={ROUTES.residentAppCard}
              className="inline-flex h-12 items-center justify-center rounded-[16px] bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
            >
              {APPROVED_HOME_COPY.hero.secondaryCta}
            </Link>
            <Link
              to={ROUTES.partners}
              className="inline-flex h-12 items-center justify-center rounded-[16px] border border-[var(--dp-gold)]/28 bg-[rgba(207,175,90,0.14)] px-5 text-sm font-semibold text-[var(--dp-gold)] transition-colors hover:bg-[rgba(207,175,90,0.2)]"
            >
              {APPROVED_HOME_COPY.hero.tertiaryCta}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-6xl">
          <div className="px-4 py-4 md:px-5 md:py-5">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/88">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                  One Search. Go Everywhere.
                </div>
                <div className="mt-3 font-ui text-[1.28rem] font-semibold tracking-[-0.03em] text-white md:text-[1.6rem]">
                  One Search. Go Everywhere.
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">
                  <span>Where to go</span>
                  <span className="text-white/34">•</span>
                  <span>What to do</span>
                  <span className="text-white/34">•</span>
                  <span>Who to meet</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5">
                <div className="relative mx-auto max-w-4xl">
                  <div className="flex min-h-[64px] items-center gap-3 rounded-[18px] border border-white/14 bg-[rgba(255,255,255,0.95)] px-4 py-3 shadow-[0_18px_40px_rgba(6,16,34,0.12)] backdrop-blur-xl md:min-h-[70px] md:px-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-gold-muted)]">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.4)]">
                        {activePromptText}
                      </div>
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={APPROVED_HOME_COPY.hero.searchPlaceholder}
                        className="mt-1 w-full bg-transparent text-[15px] font-medium text-[#0B1F33] outline-none placeholder:text-[rgba(11,31,51,0.32)] md:text-[16px]"
                      />
                    </div>

                    <div className="relative flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFilterMenu((current) => !current)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white text-[var(--dp-navy)] transition-colors hover:bg-[rgba(11,31,51,0.04)]"
                        aria-label="Open search filters"
                      >
                        <Filter className="h-4 w-4" />
                      </button>

                      <button
                        type="submit"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0B1F33] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#122743] md:px-5"
                      >
                        <Search className="h-4 w-4" />
                        Ask
                      </button>

                      {showFilterMenu ? (
                        <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[320px] rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4 text-left text-[var(--dp-navy)] shadow-[0_22px_60px_rgba(6,16,34,0.18)]">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                            Search mode
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {PRIMARY_SEARCH_PRESETS.map((preset) => {
                              const Icon = preset.icon;
                              const active = activePrimary === preset.id;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => setActivePrimary(preset.id)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                    active
                                      ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                                      : "bg-[rgba(11,31,51,0.05)] text-[rgba(11,31,51,0.74)] hover:bg-[rgba(11,31,51,0.08)]"
                                  }`}
                                >
                                  {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                            Show on map
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {PIN_TOGGLES.map((toggle) => {
                              const Icon = toggle.icon;
                              const active = activePins.includes(toggle.id);
                              return (
                                <button
                                  key={toggle.id}
                                  type="button"
                                  onClick={() => togglePin(toggle.id)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                    active
                                      ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                                      : "bg-[rgba(11,31,51,0.05)] text-[rgba(11,31,51,0.74)] hover:bg-[rgba(11,31,51,0.08)]"
                                  }`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {toggle.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </form>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {searchRailItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      item.active
                        ? "border-white bg-white text-[var(--dp-navy)]"
                        : "border-[rgba(255,255,255,0.14)] bg-white/8 text-white/88 hover:bg-white/14"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                <Filter className="h-3.5 w-3.5" />
                Filters tucked into the search bar
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative h-[420px] overflow-hidden rounded-[24px] shadow-[0_24px_70px_rgba(3,10,24,0.18)] md:h-[540px]">
              <UnifiedMapShell
                items={visibleItems}
                markerIcon={(item, active) => createMarker(item, { isSelected: active })}
                onMarkerSelect={setSelectedEntity}
                mapCenter={mapCenter}
                mapZoom={13.25}
                selectedId={selectedEntity?.id}
                className="h-full w-full"
                enableClustering={false}
              />
            </div>

            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-[22px] bg-[rgba(255,255,255,0.06)]">
                <button
                  type="button"
                  onClick={() => setShowResultsPanel((current) => !current)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                >
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                      Nearby Results
                    </div>
                    <div className="mt-1 text-[14px] font-semibold text-white">
                      {showResultsPanel ? "Hide result details" : "Open result details"}
                    </div>
                  </div>
                  <ChevronDown
                    className={`mt-0.5 h-4 w-4 text-white/72 transition-transform ${showResultsPanel ? "rotate-180" : ""}`}
                  />
                </button>

                <div className="border-t border-white/12 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/84">
                      {withinFiveCount} Within 5 Min
                    </span>
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/84">
                      {homesCount} Homes
                    </span>
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/84">
                      {nearbyCount} Nearby
                    </span>
                    {groupedCategorySummaries.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "all") {
                            setActivePrimary("all");
                            return;
                          }
                          setActivePrimary(item.id);
                        }}
                        className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/82 transition-colors hover:bg-white/14"
                      >
                        {item.count} {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {showResultsPanel ? (
                  <div className="border-t border-white/12">
                    <div className="flex items-start justify-between gap-3 px-4 py-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72">
                          Top Result
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-white">
                          {selectedEntity?.title || selectedEntity?.name || "Nearby now"}
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-white/82">
                          RSVP-ready, nearby, and close enough to make the decision easy.
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        {metrics.map((metric) => (
                          <span
                            key={metric}
                            className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/84"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedEntity ? (
                      <div className="border-t border-white/12 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 rounded-[12px] bg-white/12 p-2">
                            {normalizePinType(selectedEntity) === "event" ? (
                              <Calendar className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                            ) : normalizePinType(selectedEntity) === "perk" ? (
                              <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                            ) : normalizePinType(selectedEntity) === "building" ? (
                              <Building2 className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                            ) : normalizePinType(selectedEntity) === "moment" ? (
                              <Users className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-semibold text-white">{selectedMeta?.title}</div>
                            <div className="mt-2 text-[13px] leading-6 text-white/84">{selectedMeta?.summary}</div>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/66">
                              <Clock3 className="h-3.5 w-3.5" />
                              {selectedMeta?.detail}
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                              <Link
                                to={buildResultHref(selectedEntity)}
                                className="inline-flex items-center gap-2 rounded-[12px] bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white/14"
                              >
                                Open detail
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                to={buildResidentCardHref(selectedEntity, query)}
                                className="inline-flex items-center gap-2 rounded-[12px] bg-[var(--dp-gold)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--dp-navy)] transition-colors hover:bg-[#d2b46a]"
                              >
                                Save to perks card
                                <Sparkles className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {additionalResults.length ? (
                      <div className="border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowMoreResults((current) => !current)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/76">
                            {showMoreResults ? "Hide other results" : `More results (${additionalResults.length})`}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-white/72 transition-transform ${showMoreResults ? "rotate-180" : ""}`}
                          />
                        </button>

                        {showMoreResults ? (
                          <div className="divide-y divide-white/10">
                            {additionalResults.map((item) => {
                              const meta = getPreviewMeta(item);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setSelectedEntity(item)}
                                  className="w-full px-4 py-3 text-left transition-colors hover:bg-white/6"
                                >
                                  <div className="text-[13px] font-semibold text-white">{meta.title}</div>
                                  <div className="mt-1 text-[12px] leading-5 text-white/80">{meta.summary}</div>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {!visibleItems.length ? (
                      <div className="border-t border-white/12 px-4 py-4 text-[13px] leading-6 text-white/80">
                        No map results for this combination yet.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedEntity ? (
              <motion.div
                key={selectedEntity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <MobileActionPanel
                  eyebrow={String(selectedEntity?.category || normalizePinType(selectedEntity) || "Nearby").toLowerCase()}
                  title={selectedMeta?.title || "Nearby now"}
                  meta={selectedMeta?.detail}
                  onClose={() => setSelectedEntity(null)}
                  closeLabel="Close selected result"
                  actions={
                    <>
                      <Link to={buildResultHref(selectedEntity)} className="dp-cta-primary flex-1 justify-center">
                        Open detail
                      </Link>
                      <Link
                        to={buildResidentCardHref(selectedEntity, query)}
                        className="dp-cta-secondary flex-1 justify-center"
                      >
                        Save to perks card
                      </Link>
                    </>
                  }
                >
                  <div className="text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                    {selectedMeta?.summary}
                  </div>
                </MobileActionPanel>
              </motion.div>
            ) : null}
          </AnimatePresence>
      </div>
    </section>
  );
}
