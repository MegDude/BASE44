import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { useMapStateStore } from "@/store/mapStateStore";
import MapSearchRail from "@/components/map/MapSearchRail";

const categoryOptions = ["coffee", "dining", "nightlife", "wellness"];
const utilityFilters = [
  { key: "crowd", label: "Popular" },
  { key: "deals", label: "Best value" },
];

function getPerkValue(item) {
  return item?.perk?.value || item?.perk_value || item?.metadata?.perkValue || null;
}

function getWalkLabel(item) {
  const minutes = item?.metadata?.walkMinutes ?? item?.distanceMinutes;
  return Number.isFinite(Number(minutes)) ? `${minutes} min walk` : "nearby";
}

function getStatusLabel(item) {
  if (item?.isLive || item?.eventTiming?.isLive) return "Live now";
  if (item?.isOpenNow) return "Open now";
  if (item?.eventTiming?.startsSoon || item?.eventTiming?.startTime) return "Starting soon";
  return "Nearby";
}

export default function MapControlPanel() {
  const [showRefine, setShowRefine] = useState(false);
  const {
    query,
    decision,
    type,
    categories,
    filters,
    setMode,
    setQuery,
    setDecision,
    setType,
    setFilters,
    toggleCategory,
    toggleFilter,
  } = useMapPanelStore();

  const filteredResults = useMapStateStore((state) => state.filteredResults);

  const rankedTopResult = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      const liveDelta = Number(Boolean(b?.isLive || b?.eventTiming?.isLive)) - Number(Boolean(a?.isLive || a?.eventTiming?.isLive));
      if (liveDelta !== 0) return liveDelta;

      const openDelta = Number(Boolean(b?.isOpenNow)) - Number(Boolean(a?.isOpenNow));
      if (openDelta !== 0) return openDelta;

      const dealDelta = Number(Boolean(getPerkValue(b))) - Number(Boolean(getPerkValue(a)));
      if (dealDelta !== 0) return dealDelta;

      const walkDelta = (a?.metadata?.walkMinutes ?? 999) - (b?.metadata?.walkMinutes ?? 999);
      if (walkDelta !== 0) return walkDelta;

      return (b?.metadata?.popularity ?? 0) - (a?.metadata?.popularity ?? 0);
    })[0];
  }, [filteredResults]);

  const summary = useMemo(
    () => ({
      live: filteredResults.filter((item) => item?.isLive || item?.eventTiming?.isLive || item?.isOpenNow).length,
      deals: filteredResults.filter((item) => Boolean(getPerkValue(item)) || item?.type === "perk").length,
      walkable: filteredResults.filter((item) => (item?.metadata?.walkMinutes ?? 999) <= 10).length,
    }),
    [filteredResults]
  );

  const headline = rankedTopResult
    ? `Best match: ${rankedTopResult.name}`
    : "Best matches right now";

  const decisionLine = rankedTopResult
    ? [getWalkLabel(rankedTopResult), getStatusLabel(rankedTopResult), getPerkValue(rankedTopResult)]
        .filter(Boolean)
        .join(" · ")
    : "Move the map or ask for what you need nearby.";

  const metricsLine = `${filteredResults.length} options · ${summary.live} live/open · ${summary.deals} perks · ${summary.walkable} within 10 min`;

  const primaryItems = [
    { id: "now", label: "Now", active: decision === "now" && !filters.fiveMin && !filters.tenMin, onClick: () => { setDecision("now"); setType(type || "all"); setFilters({ fiveMin: false, tenMin: false }); } },
    { id: "closest", label: "Closest", active: filters.fiveMin, onClick: () => { setDecision("near"); setType("all"); setFilters({ fiveMin: true, tenMin: false }); } },
    { id: "value", label: "Best value", active: filters.deals || type === "perks", onClick: () => { setDecision("near"); setType("all"); setFilters({ deals: true, fiveMin: false, tenMin: false }); } },
    { id: "popular", label: "Popular", active: filters.crowd, onClick: () => { setDecision("near"); setType("all"); setFilters({ crowd: true, fiveMin: false, tenMin: false }); } },
  ];

  const utilityItems = [
    { id: "places", label: "Places", active: type === "venues", onClick: () => setType("venues") },
    { id: "events", label: "Events", active: type === "events", onClick: () => setType("events") },
    { id: "perks", label: "Perks", active: type === "perks", accent: true, onClick: () => setType("perks") },
    {
      id: "10min",
      label: "10 min",
      active: filters.tenMin,
      onClick: () => {
        setDecision("near");
        setFilters({ fiveMin: false, tenMin: true });
      },
    },
  ];

  return (
    <div className="absolute left-3 right-3 top-3 z-[500] md:left-5 md:right-auto md:top-5 md:w-[min(540px,calc(100vw-460px))]">
      <div className="rounded-[24px] border border-white/70 bg-white/72 p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-[18px]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold tracking-[-0.01em] text-[var(--dp-navy,#0B1F33)]">Ask the map</div>
            <div className="text-[11px] leading-4 text-slate-500">See what’s happening nearby.</div>
          </div>

          <button
            type="button"
            onClick={() => setShowRefine((value) => !value)}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[12px] bg-[#f6f8fb] px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25"
            aria-label={showRefine ? "Hide map filters" : "Show map filters"}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showRefine ? "Hide" : "Refine"}
          </button>
        </div>

        <div className="mb-2 flex flex-col gap-2">
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <label className="sr-only" htmlFor="ask-map-query">Search nearby places, perks, events, or buildings</label>
            <div className="flex h-10 items-center gap-2 rounded-[14px] border border-[rgba(7,27,47,0.08)] bg-white/86 px-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <input
                id="ask-map-query"
                value={query}
                onChange={(event) => {
                  setMode("ask");
                  setQuery(event.target.value);
                }}
                placeholder="Ask what to do nearby"
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setMode("ask")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#0B1F33] px-4 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(11,31,51,0.16)] focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/30"
              aria-label="Search nearby with Ask the Map"
            >
              Ask
            </button>
          </div>

          <MapSearchRail primaryItems={primaryItems} utilityItems={utilityItems} className="mt-0" />
        </div>

        {showRefine && (
          <div className="mb-2 space-y-2 border-t border-[rgba(7,27,47,0.08)] pt-2">
            <div className="flex flex-wrap gap-1.5" aria-label="Category filters">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  className={`min-h-9 rounded-full px-3 py-1.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                    categories.includes(item)
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-white text-slate-600"
                  }`}
                  aria-pressed={categories.includes(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5" aria-label="Decision filters">
              {utilityFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFilter(item.key)}
                  className={`min-h-9 rounded-full px-3 py-1.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                    filters[item.key]
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-white text-slate-600"
                  }`}
                  aria-pressed={Boolean(filters[item.key])}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[15px] bg-[#fbfcff]/86 px-3 py-2 text-xs text-slate-600" aria-live="polite">
          <div className="truncate font-semibold text-[#0B1F33]">{headline}</div>
          <div className="mt-0.5 truncate text-[11px] text-slate-500">{decisionLine}</div>
          <div className="mt-1 truncate text-[10px] text-slate-400">{metricsLine}</div>
        </div>
      </div>
    </div>
  );
}
