import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import UnifiedResultsPanel from "@/components/map/unified/UnifiedResultsPanel";
import UnifiedDrawer from "@/components/map/unified/UnifiedDrawer";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useMapData } from "@/features/map/useMapData";
import { useMapStateStore } from "@/store/mapStateStore";
import { sharedMapItemToMapEntity } from "@/lib/mappers/sharedMapMappers";
import { createExploreLink } from "@/lib/routeHelpers";
import { trackEvent } from "@/lib/analytics";
import { askMap } from "@/lib/api/askMap";
import { getCTA } from "@/lib/ctaRegistry";

const DEFAULT_CENTER = [30.267, -97.743];
const HOME_ALLOWED_DISTRICTS = new Set(["rainey", "congress", "seaholm", "red-river", "2nd-street", "downtown"]);
const HOME_ALLOWED_ZIPS = new Set(["78701", "78702"]);

const MODE_CONFIG = {
  home: {
    eyebrow: "Downtown Austin",
    title: "Where downtown meets you.",
    subtitle: "Built for people who actually live here and the places that make it feel like home.",
    body: "Find what is nearby, see what is worth doing, and use your card when there is a perk.",
    chips: [
      { id: "all", label: "Best nearby now" },
      { id: "venue", label: "Places to go" },
      { id: "perk", label: "Perks nearby" },
      { id: "event", label: "Happening tonight" },
      { id: "building", label: "Want to live here" },
    ],
  },
  resident: {
    title: "Where downtown meets you.",
    subtitle: "One map. Everything nearby. No app download. No login friction.",
    prompts: ["Coffee now", "Happy hour nearby", "Places to walk to"],
    chips: [
      { id: "all", label: "Best nearby now" },
      { id: "perk", label: "Perks nearby" },
      { id: "event", label: "Happening tonight" },
      { id: "building", label: "Want to live here" },
      { id: "5min", label: "Best within 5 minutes" },
    ],
  },
  partners: {
    title: "One downtown layer. Five partner roles.",
    subtitle: "Start with the partner type, then move into map intelligence, rollout, and the right entry model.",
    prompts: ["properties venues brands civic downtown", "Rainey activity tonight", "best converting partners"],
    chips: [
      { id: "all", label: "All signals" },
      { id: "building", label: "Properties" },
      { id: "venue", label: "Venues" },
      { id: "event", label: "Events" },
      { id: "perk", label: "Perks" },
    ],
  },
  property: {
    title: "Turn a building into a neighborhood.",
    subtitle: "Make your address more useful. Connect residents to nearby places, events, and perks.",
    prompts: ["properties and perks near residents", "best within 5 minutes", "resident activity tonight"],
    chips: [
      { id: "building", label: "Properties" },
      { id: "perk", label: "Perks nearby" },
      { id: "venue", label: "Places to go" },
      { id: "5min", label: "Best within 5 minutes" },
    ],
  },
  venue: {
    title: "Be the answer to what's next.",
    subtitle: "Show up when intent is real. Appear in the map when people nearby are already deciding.",
    prompts: ["rooftop bars coffee restaurants wellness nearby", "dinner tonight", "open now nearby"],
    chips: [
      { id: "venue", label: "Venues" },
      { id: "perk", label: "Perks nearby" },
      { id: "event", label: "Events" },
      { id: "5min", label: "Best within 5 minutes" },
    ],
  },
  hospitality: {
    title: "Extend the stay beyond the lobby.",
    subtitle: "Give guests one live map for dining, events, wellness, and nightlife.",
    prompts: ["guest coffee dinner events near hotel", "things to do tonight", "walkable dining nearby"],
    chips: [
      { id: "venue", label: "Places to go" },
      { id: "event", label: "Events" },
      { id: "perk", label: "Perks nearby" },
      { id: "5min", label: "Walkable now" },
    ],
  },
  brand: {
    title: "Run campaigns that live in the city.",
    subtitle: "Buy context, not broad reach. Run campaigns in the right corridor at the right time.",
    prompts: ["brand sponsor zones events nightlife downtown", "district activity tonight", "best partner zones"],
    chips: [
      { id: "all", label: "All signals" },
      { id: "event", label: "Event windows" },
      { id: "perk", label: "Perk activations" },
      { id: "venue", label: "Venue traffic" },
      { id: "building", label: "Residential reach" },
    ],
  },
  civic: {
    title: "Scale the pulse of the district.",
    subtitle: "Make participation visible. Surface district events where people are already looking.",
    prompts: ["community events civic arts downtown", "public activity downtown", "district participation"],
    chips: [
      { id: "all", label: "All signals" },
      { id: "event", label: "Events" },
      { id: "venue", label: "Places" },
      { id: "building", label: "Buildings" },
    ],
  },
};

function dedupeItems(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.id || item?.entity_id || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreItem(item) {
  return (
    Number(item?.metadata?.popularity ?? item?._score ?? 50) +
    (item?.isLive ? 20 : 0) +
    (item?.isOpenNow ? 12 : 0) +
    (item?.perk_value || item?.perk?.value || item?.type === "perk" ? 15 : 0) +
    (item?.type === "event" ? 12 : 0) -
    Number(item?.metadata?.walkMinutes ?? 0)
  );
}

function calculateMapScore(entity, intent) {
  let score = Number(entity?._score || entity?.metadata?.popularity || scoreItem(entity));

  const text = [
    entity?.name,
    entity?.category,
    entity?.description,
    entity?.district,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const query = String(intent || "").toLowerCase();

  if (query && text.includes(query)) score += 30;
  if (entity?.isLive) score += 20;
  if (entity?.type === "perk") score += 15;
  if (entity?.type === "event") score += 12;

  return Math.min(100, score);
}

function matchesChip(item, chip) {
  if (chip === "all") return true;
  if (chip === "5min") return (item?.metadata?.walkMinutes ?? 999) <= 5;
  if (chip === "building") return ["building", "property", "hotel"].includes(item?.type);
  return item?.type === chip || item?.entity_type === chip;
}

function extractZip(value = "") {
  const match = String(value || "").match(/\b(787\d{2})\b/);
  return match ? match[1] : null;
}

function matchesHomeCoverage(item) {
  const district = String(item?.district || "").trim().toLowerCase();
  const address = String(item?.address || item?.metadata?.address || "");
  const zip = extractZip(address);

  if (district && !HOME_ALLOWED_DISTRICTS.has(district)) return false;
  if (zip && !HOME_ALLOWED_ZIPS.has(zip)) return false;

  return Boolean(district || zip);
}

export default function MapShell({
  mode = "resident",
  compact = false,
  initialQuery = "",
  className = "",
  items: explicitItems = [],
  selected = null,
  onSelect,
  markerIcon,
}) {
  const config = MODE_CONFIG[mode] || MODE_CONFIG.home;
  const openMapCta = getCTA(mode === "home" ? "HOME_EXPLORE" : "OPEN_MAP");
  const getCardCta = getCTA(mode === "home" ? "HOME_GET_CARD" : "GET_CARD");
  const becomePartnerCta = getCTA("BECOME_PARTNER");
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [askedResults, setAskedResults] = useState([]);
  const [activeChip, setActiveChip] = useState(config.chips[0]?.id || "all");
  const [resultsExpanded, setResultsExpanded] = useState(mode !== "home");
  const [hasAsked, setHasAsked] = useState(Boolean(initialQuery));
  const mapCenter = useMapStateStore((state) => state.mapCenter);
  const mapZoom = useMapStateStore((state) => state.mapZoom);
  const setMapCenter = useMapStateStore((state) => state.setMapCenter);
  const setMapZoom = useMapStateStore((state) => state.setMapZoom);
  const setFilteredResults = useMapStateStore((state) => state.setFilteredResults);
  const setIntent = useMapStateStore((state) => state.setIntent);
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const drawerState = useMapStateStore((state) => state.drawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);

  const { items: feedItems } = useMapData({
    query,
    activeCategory:
      activeChip === "venue" || activeChip === "event" || activeChip === "perk"
        ? activeChip
        : "all",
    limit: 120,
  });

  const normalizedExplicitItems = useMemo(
    () => explicitItems.map(sharedMapItemToMapEntity).filter(Boolean),
    [explicitItems]
  );
  const sourceItems = normalizedExplicitItems.length > 0 ? normalizedExplicitItems : askedResults.length > 0 ? askedResults : feedItems;

  const filteredItems = useMemo(() => {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    return dedupeItems(sourceItems)
      .filter((item) => (mode === "home" ? matchesHomeCoverage(item) : true))
      .filter((item) => matchesChip(item, activeChip))
      .filter((item) => {
        if (!normalizedQuery) return true;
        const haystack = [
          item?.name,
          item?.title,
          item?.description,
          item?.address,
          item?.category,
          item?.district,
          ...(item?.metadata?.searchKeywords || []),
          ...(item?.metadata?.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => calculateMapScore(b, query) - calculateMapScore(a, query));
  }, [activeChip, query, sourceItems]);
  const visibleItems = useMemo(() => filteredItems.slice(0, 30), [filteredItems]);

  useEffect(() => {
    setFilteredResults(filteredItems);
    setIntent(query || null);
  }, [filteredItems, query, setFilteredResults, setIntent]);

  const selectedChipLabel =
    config.chips.find((chip) => chip.id === activeChip)?.label || "Nearby";

  useEffect(() => {
    if (selected) {
      selectEntity(selected);
      return;
    }

    if (visibleItems.length === 0) {
      if (selectedEntity || drawerState !== "closed") {
        selectEntity(null);
      }
      return;
    }

    const hasMatchingSelection =
      selectedEntity && visibleItems.some((item) => item.id === selectedEntity.id);

    if (!hasMatchingSelection && (selectedEntity || drawerState !== "closed")) {
      selectEntity(null);
    }
  }, [drawerState, mode, selectEntity, selected, selectedEntity, setDrawerState, visibleItems]);

  useEffect(() => {
    if (!selected) return;
    selectEntity(selected);
  }, [selectEntity, selected]);

  useEffect(() => {
    if (!(selected || selectedEntity)) return;
    setResultsExpanded(false);
  }, [selected, selectedEntity]);

  useEffect(() => {
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(compact ? 14.5 : 15);
  }, [compact, mode, setMapCenter, setMapZoom]);

  useEffect(() => {
    if (!hasAsked || visibleItems.length === 0) return;

    const hasMatchingSelection =
      selectedEntity && visibleItems.some((item) => item.id === selectedEntity.id);

    if (!hasMatchingSelection) {
      selectEntity(visibleItems[0]);
      setDrawerState("preview");
      onSelect?.(visibleItems[0]);
    }
  }, [hasAsked, mode, onSelect, selectEntity, selectedEntity, setDrawerState, visibleItems]);

  const effectiveSelected = selected || selectedEntity;
  const intentButtons = useMemo(() => {
    if (mode !== "home") return config.chips;
    return [
      {
        id: "coffee",
        label: "Coffee right now",
        support: "Open nearby coffee, quick stops, and easy first choices.",
        href: createExploreLink({ query: "coffee right now", type: "venue" }),
      },
      {
        id: "dinner",
        label: "Dinner tonight",
        support: "See what is close, open, and worth walking to tonight.",
        href: createExploreLink({ query: "dinner tonight", type: "venue" }),
      },
      {
        id: "happy-hour",
        label: "Happy hour nearby",
        support: "Open the downtown map with places and timed offers ready to go.",
        href: createExploreLink({ query: "happy hour nearby", type: "perk" }),
      },
    ];
  }, [config.chips, mode]);

  function handleIntentSelect(intent) {
    trackEvent("homepage_intent_clicked", { intent: intent.id, href: intent.href || null });
    setActiveChip(intent.id);
    setHasAsked(true);
    setResultsExpanded(mode !== "home");
    setAskedResults([]);
    if (intent.query !== undefined) {
      setQueryInput(intent.query);
      setQuery(intent.query);
    }
  }

  async function handleAskSubmit(event) {
    event.preventDefault();
    const nextQuery = queryInput.trim();
    if (!nextQuery) return;

    setQuery(nextQuery);
    setAskedResults([]);
    setHasAsked(true);
    setResultsExpanded(mode !== "home");

    const asked = await askMap(nextQuery, {
      userLocation: useMapStateStore.getState().userLocation,
      location: "Downtown Austin",
    });
    setIntent(
      asked?.intent?.category ||
      asked?.intent?.intent ||
      nextQuery
    );
    setAskedResults(Array.isArray(asked?.results) ? asked.results.map(sharedMapItemToMapEntity).filter(Boolean) : []);
    if (mode === "home") {
      trackEvent("homepage_open_map_clicked", { source: "ask_submit", query: nextQuery });
      setResultsExpanded(true);
    }
  }

  return (
    <section
      className={`relative overflow-hidden bg-[#f7f9fc] ${compact ? "min-h-[720px]" : "min-h-screen"} ${className}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-20 md:px-6">
        <div className="mb-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-deep,#A8733C)]" />
            {config.eyebrow || "Downtown Austin"}
          </div>
          <h1 className="mt-3 font-heading text-[clamp(2.6rem,5vw,4.75rem)] font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">
            {config.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.64)]">
            {config.subtitle}
          </p>
          {config.body ? (
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.64)]">
              {config.body}
            </p>
          ) : null}
          {mode === "home" ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to={openMapCta?.href || "/explore"}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[#101827] px-5 py-3 text-sm font-semibold text-white"
              >
                {openMapCta?.label || "Open the Map"}
              </Link>
              <Link
                to={getCardCta?.href || "/card"}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] border border-[rgba(16,24,39,0.12)] bg-white px-5 py-3 text-sm font-semibold text-[#101827]"
              >
                {getCardCta?.label || "Get Your Card"}
              </Link>
            </div>
          ) : null}
          {mode === "home" && becomePartnerCta?.href ? (
            <div className="mt-4">
              <Link
                to={becomePartnerCta.href}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] px-1 py-1 text-sm font-semibold text-[rgba(11,31,51,0.68)] transition hover:text-[var(--dp-navy,#0B1F33)]"
              >
                {becomePartnerCta.label}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_18px_42px_rgba(11,31,51,0.06)]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[390px_minmax(0,1fr)]">
            <div className="order-2 border-t border-[rgba(11,31,51,0.08)] bg-white lg:order-1 lg:border-r lg:border-t-0">
              <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
                <form
                  onSubmit={handleAskSubmit}
                  className="mt-4 flex gap-2"
                >
                  <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4">
                    <Sparkles className="h-4 w-4 text-[var(--dp-gold-deep,#A8733C)]" />
                    <input
                      value={queryInput}
                      onChange={(event) => setQueryInput(event.target.value)}
                    placeholder={mode === "home" ? "Coffee, dinner, events, happy hour…" : "Search places, events, perks, or what is nearby"}
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/42"
                  />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
                  >
                    {mode === "home" ? "Ask the Map" : "Ask"}
                  </button>
                </form>

                {mode === "home" ? (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                      One Search. Go Everywhere.
                    </div>
                    <div className="mt-3 grid gap-2">
                      {intentButtons.map((intent) => (
                        <Link
                          key={intent.id}
                          to={intent.href}
                          onClick={() => trackEvent("homepage_intent_clicked", { intent: intent.id, href: intent.href })}
                          className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 py-3 transition hover:bg-white"
                        >
                          <div className="text-[13px] font-semibold text-[var(--dp-navy,#0B1F33)]">{intent.label}</div>
                          <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.62)]">{intent.support}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {config.chips.map((intent) => (
                      <button
                        key={intent.id}
                        type="button"
                        onClick={() => handleIntentSelect(intent)}
                        className={`rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-all ${
                          activeChip === intent.id
                            ? "border-primary bg-primary text-white"
                            : "border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] text-foreground/70 hover:bg-white"
                        }`}
                      >
                        {intent.label}
                      </button>
                    ))}
                  </div>
                )}

                {mode !== "home" && config.prompts?.length ? (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                      Try asking
                    </div>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      {config.prompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => {
                            setQueryInput(prompt);
                            setQuery(prompt);
                            setHasAsked(true);
                            setResultsExpanded(true);
                          }}
                          className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-3 py-2 text-[12px] font-medium whitespace-nowrap text-foreground/70 transition-all hover:bg-[#f7f9fc]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : mode === "home" ? null : (
                  <div className="mt-3 text-[12px] leading-6 text-muted-foreground">
                    Start here, then open the live explore route for a full ask-the-map answer.
                  </div>
                )}
              </div>

              {mode === "home" ? null : (
                <div className="px-4 py-3 md:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50">
                        Ask response
                      </div>
                      <div className="mt-1 text-[12px] text-muted-foreground">
                        {`${selectedChipLabel} · ${filteredItems.length} Result${filteredItems.length === 1 ? "" : "s"}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResultsExpanded((current) => !current)}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] px-3 text-[11px] font-medium text-foreground"
                    >
                      {resultsExpanded ? "Hide results" : `Show results${filteredItems.length > visibleItems.length ? ` (${visibleItems.length})` : ""}`}
                    </button>
                  </div>
                </div>
              )}

              {resultsExpanded && !effectiveSelected ? (
                <div className="h-[360px] border-t border-[rgba(11,31,51,0.08)] lg:h-[calc(100%-210px)]">
                  <UnifiedResultsPanel
                    items={visibleItems}
                    onClose={() => setResultsExpanded(false)}
                    title={mode === "home" ? "Best matches right now" : `${selectedChipLabel} now`}
                    subtitle={
                      mode === "home"
                        ? "Ranked for what fits now: relevance, live context, and walking distance."
                        : hasAsked
                          ? "Results update from the same ask flow and live downtown feed."
                          : "Ask a question or pick a focus to see what the map finds."
                    }
                    onSelectResult={(item) => {
                      trackEvent("result_selected", { source: mode, entityId: item.id, entityType: item.type });
                      selectEntity(item);
                      setDrawerState("preview");
                      setResultsExpanded(false);
                      onSelect?.(item);
                    }}
                  />
                </div>
              ) : (
                <div className="px-4 pb-4 md:px-5">
                  {effectiveSelected ? (
                    <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                        Selected place
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-foreground">{effectiveSelected.name}</div>
                      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {effectiveSelected.metadata?.reason || effectiveSelected.address || effectiveSelected.description}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            selectEntity(null);
                            setDrawerState("closed");
                            setResultsExpanded(true);
                          }}
                          className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[rgba(11,31,51,0.08)] bg-white px-3 text-[12px] font-semibold text-[var(--dp-navy,#0B1F33)]"
                        >
                          Close details
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultsExpanded(true)}
                          className="inline-flex h-10 items-center justify-center rounded-[12px] bg-primary px-3 text-[12px] font-semibold text-white"
                        >
                          Show results
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-[#f7f9fc] p-4 text-[12px] text-muted-foreground">
                      {hasAsked
                        ? "No matching results yet. Try a broader ask or switch the focus above."
                        : mode === "home"
                          ? "Ask the map what you want nearby."
                          : "Ask the map about downtown activity, perks, events, or nearby venues."}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="order-1 relative min-h-[460px] bg-[#eef2f7] lg:order-2 lg:min-h-[720px]">
              <UnifiedMapShell
                items={visibleItems}
                selectedId={effectiveSelected?.id}
                markerIcon={(item, isSelected) =>
                  markerIcon
                    ? markerIcon(item, isSelected)
                    : createMarker(item, {
                        isSelected,
                        variant:
                          item?.metadata?.residentResidential && (item.type === "building" || item.type === "moment")
                            ? "property-showcase"
                            : undefined,
                      })
                }
                onMarkerSelect={(item) => {
                  trackEvent("result_selected", { source: `${mode}_marker`, entityId: item.id, entityType: item.type });
                  selectEntity(item);
                  setDrawerState("preview");
                  onSelect?.(item);
                }}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onMapCenterChange={setMapCenter}
                onMapZoomChange={setMapZoom}
                className="h-full w-full"
              />
              <UnifiedDrawer selected={effectiveSelected} desktopMode="docked" desktopClassName="right-4 top-4 bottom-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
