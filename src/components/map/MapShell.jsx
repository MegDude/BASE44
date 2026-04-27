import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import UnifiedResultsPanel from "@/components/map/unified/UnifiedResultsPanel";
import UnifiedDrawer from "@/components/map/unified/UnifiedDrawer";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { useMapStateStore } from "@/store/mapStateStore";
import { sharedMapItemToMapEntity } from "@/lib/mappers/sharedMapMappers";

const DEFAULT_CENTER = [30.267, -97.743];

const MODE_CONFIG = {
  home: {
    title: "Where downtown meets you.",
    subtitle: "Start with one decision. The map does the rest.",
    prompts: ["Coffee now", "Dinner tonight", "Events tonight"],
    chips: [
      { id: "all", label: "Best nearby now" },
      { id: "venue", label: "Places to go" },
      { id: "perk", label: "Perks nearby" },
      { id: "event", label: "Happening tonight" },
      { id: "building", label: "Want to live here" },
    ],
  },
  resident: {
    title: "Your downtown. In one map.",
    subtitle: "Search, save, RSVP, redeem, and move without leaving the map.",
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
    title: "The people nearby are already deciding.",
    subtitle: "See the same downtown map as a partner intelligence surface.",
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
    title: "Turn the neighborhood into an amenity.",
    subtitle: "Buildings, nearby places, and resident value all in one live layer.",
    prompts: ["properties and perks near residents", "best within 5 minutes", "resident activity tonight"],
    chips: [
      { id: "building", label: "Properties" },
      { id: "perk", label: "Perks nearby" },
      { id: "venue", label: "Places to go" },
      { id: "5min", label: "Best within 5 minutes" },
    ],
  },
  venue: {
    title: "Show up when nearby intent is forming.",
    subtitle: "The same map can rank venues, perks, and live foot-traffic moments.",
    prompts: ["rooftop bars coffee restaurants wellness nearby", "dinner tonight", "open now nearby"],
    chips: [
      { id: "venue", label: "Venues" },
      { id: "perk", label: "Perks nearby" },
      { id: "event", label: "Events" },
      { id: "5min", label: "Best within 5 minutes" },
    ],
  },
  hospitality: {
    title: "Give guests a live downtown layer.",
    subtitle: "Hotels can guide dining, events, perks, and walkable decisions from one map.",
    prompts: ["guest coffee dinner events near hotel", "things to do tonight", "walkable dining nearby"],
    chips: [
      { id: "venue", label: "Places to go" },
      { id: "event", label: "Events" },
      { id: "perk", label: "Perks nearby" },
      { id: "5min", label: "Walkable now" },
    ],
  },
  brand: {
    title: "Brands show up as useful behavior.",
    subtitle: "Sponsor moments, downtown movement, and visible actions in the same live map.",
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
    title: "Make participation easier to see.",
    subtitle: "Civic activity, local business visibility, and district movement in one downtown surface.",
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
    Number(item?.metadata?.popularity ?? 0) +
    (item?.isLive ? 20 : 0) +
    (item?.isOpenNow ? 12 : 0) +
    (item?.perk_value || item?.perk?.value || item?.type === "perk" ? 10 : 0) -
    Number(item?.metadata?.walkMinutes ?? 0)
  );
}

function matchesChip(item, chip) {
  if (chip === "all") return true;
  if (chip === "5min") return (item?.metadata?.walkMinutes ?? 999) <= 5;
  if (chip === "building") return ["building", "property", "hotel"].includes(item?.type);
  return item?.type === chip || item?.entity_type === chip;
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
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [activeChip, setActiveChip] = useState(config.chips[0]?.id || "all");
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const mapCenter = useMapStateStore((state) => state.mapCenter);
  const mapZoom = useMapStateStore((state) => state.mapZoom);
  const setMapCenter = useMapStateStore((state) => state.setMapCenter);
  const setMapZoom = useMapStateStore((state) => state.setMapZoom);
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);

  const { items: feedItems } = useSharedMapFeed({
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
  const sourceItems = normalizedExplicitItems.length > 0 ? normalizedExplicitItems : feedItems;

  const filteredItems = useMemo(() => {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    return dedupeItems(sourceItems)
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
      .sort((a, b) => scoreItem(b) - scoreItem(a));
  }, [activeChip, query, sourceItems]);

  useEffect(() => {
    if (selected) {
      selectEntity(selected);
      return;
    }

    if (!selectedEntity && filteredItems.length > 0) {
      selectEntity(filteredItems[0]);
    }
  }, [filteredItems, selectEntity, selected, selectedEntity]);

  useEffect(() => {
    if (!selected) return;
    selectEntity(selected);
  }, [selectEntity, selected]);

  useEffect(() => {
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(compact ? 13.5 : 14);
  }, [compact, mode, setMapCenter, setMapZoom]);

  const effectiveSelected = selected || selectedEntity;

  return (
    <section
      className={`relative overflow-hidden bg-[#f7f9fc] ${compact ? "min-h-[720px]" : "min-h-screen"} ${className}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-20 md:px-6">
        <div className="mb-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-deep,#A8733C)]" />
            Live downtown map
          </div>
          <h1 className="mt-3 font-heading text-[clamp(2.6rem,5vw,4.75rem)] font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">
            {config.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[rgba(11,31,51,0.64)]">
            {config.subtitle}
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_18px_42px_rgba(11,31,51,0.06)]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[390px_minmax(0,1fr)]">
            <div className="order-2 border-t border-[rgba(11,31,51,0.08)] bg-white lg:order-1 lg:border-r lg:border-t-0">
              <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-4 md:px-5">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-deep,#A8733C)]" />
                  Ask the map
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setQuery(queryInput.trim());
                  }}
                  className="mt-4 flex gap-2"
                >
                  <div className="flex h-11 flex-1 items-center gap-3 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4">
                    <Sparkles className="h-4 w-4 text-[var(--dp-gold-deep,#A8733C)]" />
                    <input
                      value={queryInput}
                      onChange={(event) => setQueryInput(event.target.value)}
                      placeholder="Ask what you want nearby"
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
                  {config.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setQueryInput(prompt);
                        setQuery(prompt);
                      }}
                      className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-3 py-2 text-[11px] font-medium whitespace-nowrap text-foreground/78"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {config.chips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActiveChip(chip.id)}
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
                      Agent results
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {config.chips.find((chip) => chip.id === activeChip)?.label || "Nearby"} · {filteredItems.length} Result{filteredItems.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResultsExpanded((current) => !current)}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] px-3 text-[11px] font-medium text-foreground"
                  >
                    {resultsExpanded ? "Hide results" : "Show results"}
                  </button>
                </div>
              </div>

              {resultsExpanded ? (
                <div className="h-[360px] border-t border-[rgba(11,31,51,0.08)] lg:h-[calc(100%-210px)]">
                  <UnifiedResultsPanel
                    items={filteredItems}
                    title={config.chips.find((chip) => chip.id === activeChip)?.label || "Nearby now"}
                    onSelectResult={(item) => {
                      selectEntity(item);
                      setDrawerState("preview");
                      onSelect?.(item);
                    }}
                  />
                </div>
              ) : (
                <div className="px-4 pb-4 md:px-5">
                  {effectiveSelected ? (
                    <div className="rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                        Top result
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-foreground">{effectiveSelected.name}</div>
                      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {effectiveSelected.address || effectiveSelected.description}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-[#f7f9fc] p-4 text-[12px] text-muted-foreground">
                      Search or change the map state to get the best nearby answer.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="order-1 relative min-h-[460px] bg-[#eef2f7] lg:order-2 lg:min-h-[720px]">
              <UnifiedMapShell
                items={filteredItems}
                enableClustering={false}
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
