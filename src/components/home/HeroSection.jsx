import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
  Clock3,
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
  SECONDARY_SEARCH_PRESETS,
  getPrimaryPresetDefinition,
} from "@/lib/map/searchUiConfig";

const AUSTIN_CENTER = [30.267, -97.743];

const MAP_VIEWS = [
  {
    id: "five-minute",
    label: "5 min walk",
    defaultPins: ["venue", "event", "building", "perk"],
  },
  {
    id: "people",
    label: "Crowd",
    defaultPins: ["venue", "event", "moment"],
  },
  {
    id: "resident",
    label: "Perks",
    defaultPins: ["building", "perk", "event"],
  },
];

const PIN_TOGGLES = [
  { id: "venue", label: "Places", icon: MapPin },
  { id: "perk", label: "Perks", icon: Sparkles },
  { id: "event", label: "Events", icon: Calendar },
  { id: "building", label: "Homes", icon: Building2 },
  { id: "moment", label: "People", icon: Users },
];

const HERO_PROOF = ["One map", "Everything nearby", "No app download", "No login friction"];

function normalizePinType(item) {
  if (!item) return "venue";
  const type = String(item?.type || item?.entity_type || "").toLowerCase();
  if (["building", "property", "hotel"].includes(type)) return "building";
  if (type === "perk") return "perk";
  if (type === "event") return "event";
  if (type === "moment") return "moment";
  return "venue";
}

function itemMatchesPrimaryPreset(item, activePrimary) {
  const preset = getPrimaryPresetDefinition(activePrimary);
  const normalizedType =
    normalizePinType(item) === "building" ? "property" : normalizePinType(item);
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
      ["building", "perk", "event"].includes(pinType) ||
      Boolean(item?.perk?.value || item?.perk_value)
    );
  }

  return (
    pinType === "building" ||
    pinType === "event" ||
    pinType === "perk" ||
    walkMinutes <= 8 ||
    ["coffee", "restaurant", "bar", "entertainment", "retail", "wellness", "services"].includes(
      String(item?.category || "").toLowerCase()
    )
  );
}

function getPromptSeed(question) {
  if (question?.query) return question.query;
  return "coffee nearby";
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

function getMetricChips(items = [], activeView = "five-minute") {
  const eventCount = items.filter((item) => normalizePinType(item) === "event").length;
  const perkCount = items.filter(
    (item) => normalizePinType(item) === "perk" || item?.perk?.value || item?.perk_value
  ).length;
  const nearbyCount = items.filter((item) => (item?.metadata?.walkMinutes ?? 999) <= 5).length;
  const peopleCount = items.filter(
    (item) => normalizePinType(item) === "moment" || item?.isLive || item?.eventTiming?.isLive
  ).length;

  if (activeView === "people") {
    return [`${peopleCount || 1} live now`, `${eventCount || 1} events`, "Social and nearby"];
  }

  if (activeView === "resident") {
    return [`${perkCount || 1} perks`, `${eventCount || 1} events`, "Card-ready access"];
  }

  return [`${nearbyCount || 1} within 5 min`, `${eventCount || 1} events`, `${perkCount || 1} perks`];
}

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [activePrimary, setActivePrimary] = useState("all");
  const [activeView, setActiveView] = useState("five-minute");
  const [selectedQuestion, setSelectedQuestion] = useState(ASK_MAP_QUESTIONS[0]);
  const [activePins, setActivePins] = useState(MAP_VIEWS[0].defaultPins);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showMoreResults, setShowMoreResults] = useState(false);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [rotatingPromptIndex, setRotatingPromptIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRotatingPromptIndex((current) => (current + 1) % APPROVED_HOME_COPY.hero.prompts.length);
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const nextDefaults = MAP_VIEWS.find((view) => view.id === activeView)?.defaultPins || [];
    setActivePins(nextDefaults);
  }, [activeView]);

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

  const activePromptText = APPROVED_HOME_COPY.hero.prompts[rotatingPromptIndex];
  const results = visibleItems.slice(0, 12);
  const additionalResults = results.filter((item) => item.id !== selectedEntity?.id);
  const mapCenter = selectedEntity?.location
    ? [selectedEntity.location.latitude, selectedEntity.location.longitude]
    : AUSTIN_CENTER;
  const selectedMeta = selectedEntity ? getPreviewMeta(selectedEntity) : null;
  const metricChips = getMetricChips(visibleItems, activeView);

  function handleSubmit(event) {
    event.preventDefault();
  }

  function handleQuestion(question) {
    setSelectedQuestion(question);
    setQuery(getPromptSeed(question));
  }

  function handlePrimaryChip(presetId) {
    const preset = getPrimaryPresetDefinition(presetId);
    setActivePrimary(presetId);
    if (preset.query) setQuery(preset.query);
  }

  function handleViewChip(nextView) {
    setActiveView(nextView);
  }

  return (
    <section id="home-map-entry" className="bg-[var(--dp-surface-base)] pt-[84px] text-[var(--dp-navy)]">
      <div className="dp-page-shell">
        <div className="relative overflow-hidden rounded-[34px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] shadow-[0_24px_60px_rgba(11,31,51,0.08)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(244,246,250,0.56),rgba(244,246,250,0.92)), url('/media/austin-hero-correct.png')",
            }}
          />
          <div className="relative grid gap-6 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                {APPROVED_HOME_COPY.hero.eyebrow}
              </div>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.58)]">
                Downtown Perks
              </div>
              <h1 className="mt-3 max-w-[12ch] font-heading text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.055em] text-[var(--dp-navy)] md:text-[4.9rem]">
                {APPROVED_HOME_COPY.hero.title}
              </h1>
              <p className="mt-4 text-[1.1rem] font-medium tracking-[-0.02em] text-[rgba(11,31,51,0.84)] md:text-[1.3rem]">
                {APPROVED_HOME_COPY.hero.lead}
              </p>
            </div>

            <div className="rounded-[28px] border border-[rgba(255,255,255,0.68)] bg-[rgba(255,255,255,0.58)] p-5 shadow-[0_18px_46px_rgba(11,31,51,0.08)] backdrop-blur-xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                Ask the map
              </div>
              <div className="mt-3 text-[14px] leading-7 text-[rgba(11,31,51,0.74)]">
                Search less. Decide faster. The map answers back with places, events, perks, and nearby context that are actually usable right now.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-20 mt-4 border-y border-[rgba(11,31,51,0.08)] bg-[rgba(244,246,250,0.82)] backdrop-blur-xl">
        <div className="dp-page-shell py-4">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.72)] shadow-[0_18px_44px_rgba(11,31,51,0.08)] backdrop-blur-xl">
            <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-h-[60px] flex-1 items-center gap-3 rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/88 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[rgba(11,31,51,0.05)] text-[var(--dp-gold)]">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.42)]">
                        {activePromptText}
                      </div>
                      <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={APPROVED_HOME_COPY.hero.searchPlaceholder}
                        className="mt-1 w-full bg-transparent text-[15px] font-medium text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.32)]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 lg:shrink-0">
                    <button type="submit" className="dp-cta-primary">
                      <Search className="h-4 w-4" />
                      {APPROVED_HOME_COPY.hero.primaryCta}
                    </button>
                    <Link to={ROUTES.explore} className="dp-cta-secondary">
                      {APPROVED_HOME_COPY.hero.secondaryCta}
                    </Link>
                  </div>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {PRIMARY_SEARCH_PRESETS.map((preset) => {
                  const active = activePrimary === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePrimaryChip(preset.id)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                        active
                          ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                          : "border-[rgba(11,31,51,0.08)] bg-white/86 text-[rgba(11,31,51,0.7)] hover:bg-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}

                {SECONDARY_SEARCH_PRESETS.map((preset) => {
                  const active =
                    (preset.id === "crowd" && activeView === "people") ||
                    (preset.id === "perks" && activeView === "resident");
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleViewChip(preset.id === "crowd" ? "people" : "resident")}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                        active
                          ? "border-[var(--dp-gold)] bg-[rgba(207,175,90,0.14)] text-[var(--dp-navy)]"
                          : "border-[rgba(11,31,51,0.08)] bg-white/86 text-[rgba(11,31,51,0.7)] hover:bg-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleViewChip("five-minute")}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    activeView === "five-minute"
                      ? "border-[var(--dp-gold)] bg-[rgba(207,175,90,0.14)] text-[var(--dp-navy)]"
                      : "border-[rgba(11,31,51,0.08)] bg-white/86 text-[rgba(11,31,51,0.7)] hover:bg-white"
                  }`}
                >
                  5 min walk
                </button>
              </div>
            </div>

            <div className="grid gap-4 px-4 py-4 md:px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="flex flex-wrap gap-2">
                {ASK_MAP_QUESTIONS.map((question) => {
                  const active = selectedQuestion?.title === question.title;
                  return (
                    <button
                      key={question.title}
                      type="button"
                      onClick={() => handleQuestion(question)}
                      className={`rounded-[18px] border px-4 py-3 text-left transition-colors ${
                        active
                          ? "border-[rgba(11,31,51,0.16)] bg-white text-[var(--dp-navy)]"
                          : "border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.55)] text-[rgba(11,31,51,0.7)] hover:bg-white/78"
                      }`}
                    >
                      <div className="text-[13px] font-semibold">{question.title}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {HERO_PROOF.map((item) => (
                  <div
                    key={item}
                    className="rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.58)] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.64)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dp-page-shell py-5 md:py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_24px_60px_rgba(11,31,51,0.08)]">
            <div className="h-[420px] md:h-[560px]">
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
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.76)] shadow-[0_20px_44px_rgba(11,31,51,0.08)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                  Nearby results
                </div>
                <div className="mt-1 text-[15px] font-semibold text-[var(--dp-navy)]">
                  {visibleItems.length} live results nearby now
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResultsPanel((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-white/86 px-3 py-2 text-[12px] font-semibold text-[var(--dp-navy)]"
              >
                {showResultsPanel ? "Roll up" : "Show list"}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showResultsPanel ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="border-t border-[rgba(11,31,51,0.08)] px-4 py-4">
              {!showResultsPanel ? (
                <div>
                  <p className="text-[13px] leading-6 text-[rgba(11,31,51,0.64)]">
                    Keep the list rolled up and use the map or the selected card to stay focused.
                  </p>

                  {selectedEntity ? (
                    <div className="mt-4 rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/86 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]">
                        Selected
                      </div>
                      <div className="mt-2 text-[16px] font-semibold text-[var(--dp-navy)]">
                        {selectedMeta?.title}
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                        {selectedMeta?.summary}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.52)]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {selectedMeta?.detail}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {metricChips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-[rgba(11,31,51,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.64)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {selectedEntity ? (
                    <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/86 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-[12px] bg-[rgba(11,31,51,0.05)] p-2 text-[var(--dp-gold)]">
                          {normalizePinType(selectedEntity) === "event" ? (
                            <Calendar className="h-4 w-4" />
                          ) : normalizePinType(selectedEntity) === "perk" ? (
                            <Sparkles className="h-4 w-4" />
                          ) : normalizePinType(selectedEntity) === "building" ? (
                            <Building2 className="h-4 w-4" />
                          ) : normalizePinType(selectedEntity) === "moment" ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[16px] font-semibold text-[var(--dp-navy)]">
                            {selectedMeta?.title}
                          </div>
                          <div className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                            {selectedMeta?.summary}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.52)]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {selectedMeta?.detail}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link to={buildResultHref(selectedEntity)} className="dp-cta-secondary">
                              Open detail
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                              to={buildResidentCardHref(selectedEntity, query)}
                              className="dp-cta-primary"
                            >
                              Save to perks card
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {additionalResults.length ? (
                    <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/86">
                      <button
                        type="button"
                        onClick={() => setShowMoreResults((current) => !current)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.54)]">
                          {showMoreResults ? "Hide other results" : `More results (${additionalResults.length})`}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-[rgba(11,31,51,0.54)] transition-transform ${
                            showMoreResults ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showMoreResults ? (
                        <div className="divide-y divide-[rgba(11,31,51,0.08)]">
                          {additionalResults.map((item) => {
                            const meta = getPreviewMeta(item);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedEntity(item)}
                                className="w-full px-4 py-3 text-left transition-colors hover:bg-[rgba(11,31,51,0.03)]"
                              >
                                <div className="text-[13px] font-semibold text-[var(--dp-navy)]">
                                  {meta.title}
                                </div>
                                <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.62)]">
                                  {meta.summary}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )}
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
