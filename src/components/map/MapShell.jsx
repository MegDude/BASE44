import { useEffect, useMemo, useState } from "react";
import AskTheMap from "@/components/map/AskTheMap";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import UnifiedResultsPanel from "@/components/map/unified/UnifiedResultsPanel";
import UnifiedDrawer from "@/components/map/unified/UnifiedDrawer";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import { useMapStateStore } from "@/store/mapStateStore";
import { sharedMapItemToMapEntity } from "@/lib/mappers/sharedMapMappers";

function SparkleIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3.5l1.7 4.5 4.6 1.7-4.6 1.7L12 16l-1.7-4.6-4.6-1.7 4.6-1.7L12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 15.5l.8 2.1 2.2.9-2.2.8-.8 2.2-.9-2.2-2.1-.8 2.1-.9.9-2.1ZM5.5 14.5l.6 1.5 1.4.5-1.4.6-.6 1.4-.5-1.4-1.5-.6 1.5-.5.5-1.5Z" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DEFAULT_CENTER = [30.267, -97.743];
const HOME_ALLOWED_DISTRICTS = new Set(["rainey", "congress", "seaholm", "red-river", "2nd-street", "downtown"]);
const HOME_ALLOWED_ZIPS = new Set(["78701", "78702"]);

const MODE_CONFIG = {
  home: {
    title: "Where downtown meets you.",
    subtitle: "Start with one decision. The map does the rest.",
    prompts: ["Coffee nearby", "Happy hour now", "Events tonight"],
    chips: [
      { id: "all", label: "All" },
      { id: "venue", label: "Places" },
      { id: "perk", label: "Perks" },
      { id: "event", label: "Events" },
      { id: "building", label: "Homes" },
      { id: "5min", label: "5 min walk" },
    ],
  },
  resident: {
    title: "Where downtown meets you.",
    subtitle: "One map. Everything nearby. No app download. No login friction.",
    prompts: ["Coffee nearby", "Happy hour now", "Events tonight"],
    chips: [
      { id: "all", label: "All" },
      { id: "venue", label: "Places" },
      { id: "perk", label: "Perks" },
      { id: "event", label: "Events" },
      { id: "building", label: "Homes" },
      { id: "5min", label: "5 min walk" },
    ],
  },
  partners: {
    title: "One downtown layer. Five partner roles.",
    subtitle: "Start with the partner type, then move into map intelligence, rollout, and the right entry model.",
    prompts: ["Rainey activity tonight", "Best converting partners", "Source buildings"],
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
    prompts: ["Perks near residents", "Best within 5 minutes", "Resident activity tonight"],
    chips: [
      { id: "building", label: "Properties" },
      { id: "perk", label: "Perks" },
      { id: "venue", label: "Places" },
      { id: "5min", label: "5 min walk" },
    ],
  },
  venue: {
    title: "Be the answer to what's next.",
    subtitle: "Show up when intent is real. Appear in the map when people nearby are already deciding.",
    prompts: ["Dinner tonight", "Open now nearby", "Happy hour now"],
    chips: [
      { id: "venue", label: "Venues" },
      { id: "perk", label: "Perks" },
      { id: "event", label: "Events" },
      { id: "5min", label: "5 min walk" },
    ],
  },
  hospitality: {
    title: "Extend the stay beyond the lobby.",
    subtitle: "Give guests one live map for dining, events, wellness, and nightlife.",
    prompts: ["Things to do tonight", "Walkable dining nearby", "Coffee near hotel"],
    chips: [
      { id: "venue", label: "Places" },
      { id: "event", label: "Events" },
      { id: "perk", label: "Perks" },
      { id: "5min", label: "Walkable now" },
    ],
  },
  brand: {
    title: "Run campaigns that live in the city.",
    subtitle: "Buy context, not broad reach. Run campaigns in the right corridor at the right time.",
    prompts: ["District activity tonight", "Best partner zones", "Event windows"],
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
    prompts: ["Community events", "Public activity downtown", "District participation"],
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
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [activeChip, setActiveChip] = useState(config.chips[0]?.id || "all");
  const [resultsExpanded, setResultsExpanded] = useState(true);
  const mapCenter = useMapStateStore((state) => state.mapCenter);
  const mapZoom = useMapStateStore((state) => state.mapZoom);
  const setMapCenter = useMapStateStore((state) => state.setMapCenter);
  const setMapZoom = useMapStateStore((state) => state.setMapZoom);
  const selectedEntity = useMapStateStore((state) => state.selectedEntity);
  const drawerState = useMapStateStore((state) => state.drawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);

  const { items: feedItems } = useSharedMapFeed({
    query,
    activeCategory: activeChip === "venue" || activeChip === "event" || activeChip === "perk" ? activeChip : "all",
    limit: 120,
  });

  const normalizedExplicitItems = useMemo(() => explicitItems.map(sharedMapItemToMapEntity).filter(Boolean), [explicitItems]);
  const sourceItems = normalizedExplicitItems.length > 0 ? normalizedExplicitItems : feedItems;

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
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => scoreItem(b) - scoreItem(a));
  }, [activeChip, mode, query, sourceItems]);

  useEffect(() => {
    selectEntity(null);
    setDrawerState("closed");
  }, [mode, selectEntity, setDrawerState]);

  useEffect(() => {
    if (!selected) return;
    selectEntity(selected);
    setDrawerState("preview");
  }, [selectEntity, selected, setDrawerState]);

  useEffect(() => {
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(compact ? 13.5 : 14);
  }, [compact, mode, setMapCenter, setMapZoom]);

  const effectiveSelected = selected || selectedEntity;
  const shouldShowDrawer = Boolean(effectiveSelected && drawerState !== "closed");

  function clearSelection() {
    selectEntity(null);
    setDrawerState("closed");
  }

  function handleSubmit(nextQuery) {
    setQuery(String(nextQuery || queryInput || "").trim());
    clearSelection();
  }

  function handleFilterChange(nextChip) {
    setActiveChip(nextChip);
    clearSelection();
  }

  return (
    <section className={`pearl-page relative overflow-hidden ${compact ? "min-h-[720px]" : "min-h-screen"} ${className}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-20 md:px-6">
        <div className="mb-6 max-w-3xl">
          <div className="dp-page-kicker inline-flex items-center gap-2">
            <SparkleIcon className="h-3.5 w-3.5 text-[var(--dp-gold)]" />
            Downtown Austin
          </div>
          <h1 className="dp-display-hero mt-3 text-[clamp(2.6rem,5vw,4.75rem)]">{config.title}</h1>
          <p className="dp-page-intro mt-4 max-w-2xl">{config.subtitle}</p>
        </div>

        <div className="pearl-surface overflow-hidden rounded-[28px]">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[390px_minmax(0,1fr)]">
            <div className="order-2 border-t border-[var(--dp-border)] bg-[rgba(255,255,255,0.48)] lg:order-1 lg:border-r lg:border-t-0">
              <div className="border-b border-[var(--dp-border)] px-4 py-4 md:px-5">
                <AskTheMap
                  value={queryInput}
                  onChange={setQueryInput}
                  onSubmit={handleSubmit}
                  quickPrompts={config.prompts}
                  filters={config.chips}
                  activeFilter={activeChip}
                  onFilterChange={handleFilterChange}
                  mode="compact"
                  placeholder="Search places, events, perks, or what is nearby"
                />
              </div>

              <div className="px-4 py-3 md:px-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="dp-micro-label">Nearby results</div>
                    <div className="mt-1 text-[12px] text-[rgba(20,32,51,0.62)]">
                      {config.chips.find((chip) => chip.id === activeChip)?.label || "Nearby"} · {filteredItems.length} Result{filteredItems.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <button type="button" onClick={() => setResultsExpanded((current) => !current)} className="dp-cta-secondary h-9 min-h-0 px-3 text-[11px] normal-case tracking-normal">
                    {resultsExpanded ? "Hide results" : "Show results"}
                  </button>
                </div>
              </div>

              {resultsExpanded ? (
                <div className="h-[360px] border-t border-[var(--dp-border)] lg:h-[calc(100%-210px)]">
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
                  <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-[rgba(255,255,255,0.48)] p-4 text-[12px] text-[rgba(20,32,51,0.62)]">
                    Select a result or tap a pin to see details.
                  </div>
                </div>
              )}
            </div>

            <div className="order-1 relative min-h-[460px] bg-[#eef2f7] lg:order-2 lg:min-h-[720px]">
              <UnifiedMapShell
                items={filteredItems}
                enableClustering
                selectedId={shouldShowDrawer ? effectiveSelected?.id : undefined}
                markerIcon={(item, isSelected) =>
                  markerIcon
                    ? markerIcon(item, isSelected)
                    : createMarker(item, {
                        isSelected,
                        variant: item?.metadata?.residentResidential && (item.type === "building" || item.type === "moment") ? "property-showcase" : undefined,
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
              {shouldShowDrawer ? <UnifiedDrawer selected={effectiveSelected} desktopMode="docked" desktopClassName="right-4 top-4 bottom-4" /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
