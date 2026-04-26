import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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

  const metricsLine = `${filteredResults.length} nearby options · ${summary.live} live/open · ${summary.deals} perks · ${summary.walkable} within 10 min`;

  const primaryItems = [
    { id: "now", label: "Now", active: decision === "now" && !filters.fiveMin && !filters.tenMin, onClick: () => { setDecision("now"); setType(type || "all"); setFilters({ fiveMin: false, tenMin: false }); } },
    { id: "closest", label: "Closest", active: filters.fiveMin, onClick: () => { setDecision("near"); setType("all"); setFilters({ fiveMin: true, tenMin: false }); } },
    { id: "value", label: "Best value", active: filters.deals || type === "perks", onClick: () => { setDecision("near"); setType("all"); setFilters({ deals: true, fiveMin: false, tenMin: false }); } },
    { id: "popular", label: "Popular", active: filters.crowd, onClick: () => { setDecision("near"); setType("all"); setFilters({ crowd: true, fiveMin: false, tenMin: false }); } },
  ];

  const utilityItems = [
    {
      id: "places",
      label: "Places",
      active: type === "venues",
      onClick: () => setType("venues"),
    },
    {
      id: "events",
      label: "Events",
      active: type === "events",
      onClick: () => setType("events"),
    },
    {
      id: "perks",
      label: "Perks",
      active: type === "perks",
      accent: true,
      onClick: () => setType("perks"),
    },
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
    <div className="absolute left-3 right-3 top-3 z-[500] md:right-auto md:w-[min(520px,calc(100vw-440px))]">
      <div className="rounded-[22px] border border-white/50 bg-white/86 p-2.5 shadow-[0_10px_40px_rgba(10,20,40,0.08)] backdrop-blur-xl">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[#0B1A2B]">Ask the map</div>
            <div className="text-xs text-slate-500">One ask. One ranked next move.</div>
          </div>

          <button
            type="button"
            onClick={() => setShowRefine((value) => !value)}
            className="min-h-10 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/30"
            aria-label={showRefine ? "Hide map filters" : "Show map filters"}
          >
            {showRefine ? "Hide filters" : "Refine"}
          </button>
        </div>

        <div className="mb-2.5 flex flex-col gap-1.5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="sr-only" htmlFor="ask-map-query">Search nearby places, perks, events, or buildings</label>
            <input
              id="ask-map-query"
              value={query}
              onChange={(event) => {
                setMode("ask");
                setQuery(event.target.value);
              }}
              placeholder="Ask what to do nearby"
              className="h-11 flex-1 rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0B1A2B]/25"
            />

            <button
              type="button"
              onClick={() => setMode("ask")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0B1A2B] px-3.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/30"
              aria-label="Search nearby with Ask the Map"
            >
              <Search className="h-4 w-4" />
              Ask
            </button>
          </div>

          <MapSearchRail primaryItems={primaryItems} utilityItems={utilityItems} className="mt-0.5" />
        </div>

        {showRefine && (
          <div className="mb-3 space-y-2 border-t border-slate-200 pt-3">
            <div className="flex flex-wrap gap-2" aria-label="Category filters">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  className={`min-h-10 rounded-full px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                    categories.includes(item)
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                  aria-pressed={categories.includes(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Decision filters">
              {utilityFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFilter(item.key)}
                  className={`min-h-10 rounded-full px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                    filters[item.key]
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                  aria-pressed={Boolean(filters[item.key])}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[16px] bg-white/70 px-3 py-2 text-xs text-slate-600" aria-live="polite">
          <div className="font-semibold text-[#0B1A2B]">{headline}</div>
          <div className="mt-0.5 text-[12px] text-slate-500">{decisionLine}</div>
          <div className="mt-1 text-[11px] text-slate-400">{metricsLine}</div>
        </div>
      </div>
    </div>
  );
}
