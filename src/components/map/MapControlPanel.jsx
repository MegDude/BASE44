import { useMemo, useState } from "react";
import { Building2, Calendar, MapPin, Search, Sparkles, UtensilsCrossed } from "lucide-react";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { useMapStateStore } from "@/store/mapStateStore";
import MapSearchRail from "@/components/map/MapSearchRail";

const categoryOptions = ["coffee", "dining", "nightlife", "wellness"];
const utilityFilters = [
  { key: "crowd", label: "Crowd" },
  { key: "deals", label: "Deals" },
];

export default function MapControlPanel() {
  const [showRefine, setShowRefine] = useState(false);
  const {
    query,
    decision,
    agentExplanation,
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

  const activeTypeLabel =
    type === "venues"
      ? "places"
      : type === "events"
        ? "events"
        : type === "perks"
          ? "perks"
          : type === "buildings"
            ? "buildings"
            : "matches";

  const activeWindowLabel = filters.fiveMin
    ? "within 5 minutes"
    : filters.tenMin
      ? "within 10 minutes"
      : decision === "open" || filters.openNow
        ? "open now"
        : decision === "near"
          ? "nearby"
          : "nearby right now";

  const summary = useMemo(
    () => ({
      venues: filteredResults.filter((item) => item.type === "venue").length,
      events: filteredResults.filter((item) => item.type === "event").length,
      perks: filteredResults.filter((item) => item.type === "perk").length,
      buildings: filteredResults.filter((item) => item.type === "building" || item.type === "property" || item.type === "hotel").length,
    }),
    [filteredResults]
  );

  const headline = agentExplanation || `${filteredResults.length} ${activeTypeLabel} ${activeWindowLabel}.`;
  const metricsLine = `${Math.max(summary.venues, 1)} venues - ${Math.max(summary.events, 1)} events - ${Math.max(summary.perks, 1)} perks - ${Math.max(summary.buildings, 1)} buildings`;

  const primaryItems = [
    { id: "all", label: "All", icon: MapPin, active: type === "all", onClick: () => setType("all") },
    { id: "places", label: "Places", icon: UtensilsCrossed, active: type === "venues", onClick: () => setType("venues") },
    { id: "perks", label: "Perks", icon: Sparkles, active: type === "perks", onClick: () => setType("perks") },
    { id: "events", label: "Events", icon: Calendar, active: type === "events", onClick: () => setType("events") },
    { id: "buildings", label: "Buildings", icon: Building2, active: type === "buildings", onClick: () => setType("buildings") },
  ];

  const utilityItems = [
    {
      id: "live",
      label: "Live",
      active: decision === "now" && !filters.fiveMin && !filters.tenMin,
      accent: true,
      onClick: () => {
        setDecision("now");
        setFilters({ fiveMin: false, tenMin: false });
      },
    },
    {
      id: "5min",
      label: "5 min",
      active: filters.fiveMin,
      onClick: () => {
        setDecision("near");
        setFilters({ fiveMin: true, tenMin: false });
      },
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
    <div className="absolute left-3 right-3 top-3 z-[500]">
      <div className="rounded-[22px] border border-white/50 bg-white/82 p-2.5 shadow-[0_10px_40px_rgba(10,20,40,0.08)] backdrop-blur-xl">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[#0B1A2B]">Ask the map</div>
            <div className="text-xs text-slate-500">Ask once. See what is nearby.</div>
          </div>

          <button
            type="button"
            onClick={() => setShowRefine((value) => !value)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {showRefine ? "Hide filters" : "Refine"}
          </button>
        </div>

        <div className="mb-2.5 flex flex-col gap-1.5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              value={query}
              onChange={(event) => {
                setMode("ask");
                setQuery(event.target.value);
              }}
              placeholder="Ask what to do nearby"
              className="h-10 flex-1 rounded-[14px] border border-slate-200 bg-white px-3.5 text-sm outline-none"
            />

            <button
              type="button"
              onClick={() => setMode("ask")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#0B1A2B] px-3.5 text-sm font-medium text-white"
            >
              <Search className="h-4 w-4" />
              Ask
            </button>
          </div>

          <MapSearchRail primaryItems={primaryItems} utilityItems={utilityItems} className="mt-0.5" />
        </div>

        {showRefine && (
          <div className="mb-3 space-y-2 border-t border-slate-200 pt-3">
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCategory(item)}
                  className={`rounded-full px-3 py-2 text-xs ${
                    categories.includes(item)
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {utilityFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleFilter(item.key)}
                  className={`rounded-full px-3 py-2 text-xs ${
                    filters[item.key]
                      ? "bg-[#0B1A2B] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-600">
          <div className="font-medium">
            {headline}
          </div>
          <div className="text-[11px] text-slate-400">
            {metricsLine}
          </div>
        </div>

      </div>
    </div>
  );
}
