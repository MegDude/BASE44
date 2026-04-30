import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import MapSearchRail from "@/components/map/MapSearchRail";

const layerItems = [
  { id: "all", label: "All" },
  { id: "happy-hour", label: "Happy Hour" },
  { id: "perks", label: "Perks" },
  { id: "events", label: "Events" },
  { id: "dining", label: "Dining" },
  { id: "nightlife", label: "Nightlife" },
  { id: "hotels", label: "Hotels" },
  { id: "shopping", label: "Shopping" },
  { id: "parks", label: "Parks" },
  { id: "transit", label: "Transit" },
  { id: "buildings", label: "Buildings" },
];
const venueCategories = ["bar", "restaurant", "hotel", "speakeasy"];
const districtOptions = [
  { value: "", label: "All districts" },
  { value: "Rainey", label: "Rainey" },
  { value: "6th Street", label: "6th Street" },
  { value: "Red River", label: "Red River" },
  { value: "Congress", label: "Congress" },
  { value: "Downtown Core", label: "Downtown Core" },
  { value: "Seaholm", label: "Seaholm" },
  { value: "Market District", label: "Market District" },
  { value: "West End", label: "West End" },
  { value: "East Austin edge", label: "East Austin edge" },
  { value: "Waterloo / Capitol edge", label: "Waterloo / Capitol edge" },
];
function buildIntentState(setDecision, setType, setFilters, next) {
  return () => {
    setDecision(next.decision);
    setType(next.type);
    setFilters(next.filters);
  };
}

export default function MapControlPanel({
  askLoading = false,
  onAsk = null,
}) {
  const [showRefine, setShowRefine] = useState(false);
  const {
    query,
    decision,
    type,
    district,
    categories,
    filters,
    setMode,
    setQuery,
    setDecision,
    setType,
    setDistrict,
    setFilters,
    submitAsk,
    toggleCategory,
    toggleFilter,
  } = useMapPanelStore();
  const happyHourActive = categories.includes("happy-hour");

  const handleLayerSelect = (layerId) => {
    if (layerId === "all") {
      useMapPanelStore.setState({
        type: "all",
        categories: [],
        district: "",
      });
      return;
    }

    if (layerId === "events") {
      setType("events");
      return;
    }

    if (layerId === "perks") {
      setType("perks");
      setFilters({ deals: true });
      return;
    }

    if (layerId === "buildings") {
      setType("buildings");
      return;
    }

    if (layerId === "hotels") {
      setType("venues");
      useMapPanelStore.setState({ categories: ["hotel"] });
      return;
    }

    setType("venues");
    useMapPanelStore.setState({ categories: [layerId] });
  };

  const handleSubmit = (nextQuery) => {
    const value = String(nextQuery ?? query).trim();
    if (!value) return;
    submitAsk(value);
    if (typeof onAsk === "function") {
      onAsk(value);
    }
  };

  const intentItems = [
    {
      id: "best",
      label: "Best nearby",
      active: type === "all" && decision === "now" && !filters.fiveMin && !filters.tenMin && !filters.deals,
      onClick: buildIntentState(setDecision, setType, setFilters, {
        decision: "now",
        type: "all",
        filters: { crowd: false, deals: false, fiveMin: false, tenMin: false, openNow: false },
      }),
    },
    {
      id: "happy-hour",
      label: "Happy Hour",
      active: happyHourActive,
      accent: true,
      onClick: () => {
        toggleCategory("happy-hour");
        setType("venues");
      },
    },
    {
      id: "places",
      label: "Places",
      active: type === "venues",
      onClick: buildIntentState(setDecision, setType, setFilters, {
        decision: "near",
        type: "venues",
        filters: { ...filters, fiveMin: false, tenMin: false },
      }),
    },
    {
      id: "perks",
      label: "Perks",
      active: type === "perks" || filters.deals,
      accent: true,
      onClick: buildIntentState(setDecision, setType, setFilters, {
        decision: "near",
        type: "perks",
        filters: { ...filters, deals: true, fiveMin: false, tenMin: false },
      }),
    },
    {
      id: "tonight",
      label: "Tonight",
      active: type === "events",
      onClick: buildIntentState(setDecision, setType, setFilters, {
        decision: "now",
        type: "events",
        filters: { ...filters, openNow: true, fiveMin: false, tenMin: false },
      }),
    },
    {
      id: "live",
      label: "Live here",
      active: type === "buildings",
      onClick: buildIntentState(setDecision, setType, setFilters, {
        decision: "near",
        type: "buildings",
        filters: { ...filters, fiveMin: false, tenMin: false, deals: false },
      }),
    },
  ];

  const refineItems = [
    { key: "openNow", label: "Open now" },
    { key: "fiveMin", label: "5 min" },
    { key: "tenMin", label: "10 min" },
    { key: "crowd", label: "Popular" },
  ];
  const happyHourFilterItems = [
    { key: "activeSpecials", label: "With specials" },
    { key: "foodDeals", label: "Food deals" },
    { key: "drinkDeals", label: "Drink deals" },
    { key: "residentPerks", label: "Resident perks" },
    { key: "needsDetails", label: "Needs offer details" },
  ];

  return (
    <div className="absolute left-3 right-3 top-3 z-[500] md:right-auto md:w-[min(560px,calc(100vw-440px))]">
      <div className="rounded-[24px] border border-white/60 bg-white/92 p-3 shadow-[0_18px_48px_rgba(10,20,40,0.12)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.05)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1A2B]">
              <Sparkles className="h-3.5 w-3.5" />
              Ask the map
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Search places, events, perks, and homes from one downtown view.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRefine((value) => !value)}
            className="min-h-10 shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/30"
            aria-label={showRefine ? "Hide map filters" : "Show map filters"}
          >
            {showRefine ? "Less" : "Refine"}
          </button>
        </div>

        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="sr-only" htmlFor="ask-map-query">Ask about places, events, perks, or buildings nearby</label>
            <input
              id="ask-map-query"
              value={query}
              onChange={(event) => {
                setMode("ask");
                setQuery(event.target.value);
              }}
              placeholder="Search by place, district, or special"
              aria-label="Search by place, district, or special"
              className="h-12 flex-1 rounded-[16px] border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#0B1A2B]/25"
            />

            <button
              type="submit"
              disabled={askLoading || !query.trim()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#0B1A2B] px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/30 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Ask the map"
            >
              <Search className="h-4 w-4" />
              {askLoading ? "Searching..." : "Ask"}
            </button>
          </div>

          <MapSearchRail primaryItems={intentItems} className="mt-0.5" />
        </form>

        {showRefine ? (
          <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Browse layers
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Map layers">
                {layerItems.map((item) => {
                  const isActive =
                    item.id === "all"
                      ? categories.length === 0 && type === "all"
                      : item.id === "events"
                        ? type === "events"
                        : item.id === "perks"
                          ? type === "perks" || filters.deals
                          : item.id === "buildings"
                            ? type === "buildings"
                            : item.id === "hotels"
                              ? categories.includes("hotel")
                              : categories.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLayerSelect(item.id)}
                      className={`min-h-10 shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                        isActive
                          ? item.id === "happy-hour"
                            ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                            : "bg-[#0B1A2B] text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                      aria-pressed={isActive}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_200px]">
              <div className="flex flex-wrap gap-2" aria-label="Category filters">
                {venueCategories.map((item) => (
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
                    {item === "bar" ? "Bars" : item === "restaurant" ? "Restaurants" : item === "hotel" ? "Hotels" : "Speakeasies"}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                <span className="whitespace-nowrap font-semibold uppercase tracking-[0.08em] text-slate-500">District</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#0B1A2B] outline-none"
                  aria-label="Select district"
                >
                  {districtOptions.map((item) => (
                    <option key={item.label} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Decision filters">
              {refineItems.map((item) => (
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

            {happyHourActive ? (
              <div className="flex flex-wrap gap-2" aria-label="Happy hour filters">
                {happyHourFilterItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleFilter(item.key)}
                    className={`min-h-10 rounded-full px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B1A2B]/25 ${
                      filters[item.key]
                        ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    aria-pressed={Boolean(filters[item.key])}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
