import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  LineChart,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import {
  getPartnerInsightPins,
  getPartnerInsightSummary,
} from "@/lib/map/partnerInsights";

const FILTERS = [
  { id: "all", label: "All zones" },
  { id: "demand", label: "Immediate demand" },
  { id: "radius", label: "5 min radius" },
  { id: "events", label: "Event traffic" },
  { id: "offers", label: "Offer performance" },
  { id: "sources", label: "Source buildings" },
  { id: "repeat", label: "Repeat signals" },
];

const PARTNER_PROMPTS = [
  "Where are people going right now",
  "Which venues are performing best tonight",
  "What is happening around Rainey",
  "Which buildings are generating traffic",
  "Low engagement zones nearby",
];

const FILTER_TO_INSIGHT_TYPES = {
  all: [],
  demand: ["engagement", "performance"],
  radius: [],
  events: ["campaign", "engagement"],
  offers: ["performance", "opportunity"],
  sources: ["engagement", "coverage"],
  repeat: ["performance", "engagement"],
};

function metricValue(value, suffix = "") {
  if (value === null || value === undefined) return "0";
  return `${Number(value).toLocaleString()}${suffix}`;
}

function getQueryScore(item, query) {
  const value = String(query || "").trim().toLowerCase();
  if (!value) return 0;

  const haystack = [
    item.title,
    item.summary,
    item.shortInsight,
    item.district,
    item.address,
    item.entityType,
    item.insightType,
    item.recommendedAction,
    ...(item.tags || []),
    ...(item.sourceBreakdown || []).map((source) => source.label),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (haystack.includes(value)) score += 8;
  value.split(/\s+/).forEach((token) => {
    if (token && haystack.includes(token)) score += 2;
  });
  if (value.includes("underperform") && item.insightType === "coverage") score += 6;
  if (value.includes("perform") && item.insightType === "performance") score += 6;
  if ((value.includes("traffic") || value.includes("going")) && item.insightType === "engagement") score += 6;
  if ((value.includes("building") || value.includes("source")) && item.sourceBreakdown?.length) score += 4;
  if ((value.includes("event") || value.includes("tonight")) && item.tags?.some((tag) => String(tag).includes("event"))) score += 4;
  return score;
}

function getPerformanceState(item) {
  const visits = Number(item.metrics?.visits || 0);
  const conversion = Number(item.metrics?.conversionRate || 0);
  if (item.insightType === "opportunity") return "opportunity";
  if (item.insightType === "campaign") return "spike";
  if (visits >= 600 || conversion >= 20) return "high";
  if (visits >= 300 || conversion >= 12) return "medium";
  return "low";
}

function toMarkerEntity(item) {
  const entityTypeMap = {
    venue: "venue",
    building: "building",
    hotel: "hotel",
    district: "civic",
    campaign: "brand",
    zone: "moment",
  };

  return {
    ...item,
    type: entityTypeMap[item.entityType] || "venue",
    markerType: entityTypeMap[item.entityType] || "venue",
    performanceState: getPerformanceState(item),
  };
}

export default function PartnerInsightMap({
  partnerType = "dashboard",
  title = "Business insight map",
  description = "Partner mode shows activity, coverage, campaigns, and opportunity zones instead of resident discovery perks.",
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [resultsExpanded, setResultsExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);

  const allItems = useMemo(() => getPartnerInsightPins({ partnerType }), [partnerType]);
  const filteredItems = useMemo(() => {
    const allowedTypes = FILTER_TO_INSIGHT_TYPES[activeFilter] || [];
    const scoped =
      activeFilter === "radius"
        ? allItems.filter((item) => ["West 6th", "Rainey", "Congress"].includes(item.district))
        : activeFilter === "sources"
          ? allItems.filter((item) => (item.sourceBreakdown || []).length > 0)
          : activeFilter === "repeat"
            ? allItems.filter((item) => Number(item.metrics?.repeatRate || 0) >= 25)
            : allowedTypes.length > 0
              ? allItems.filter((item) => allowedTypes.includes(item.insightType))
              : allItems;

    const ranked = [...scoped].sort((a, b) => {
      const queryDelta = getQueryScore(b, appliedQuery) - getQueryScore(a, appliedQuery);
      if (queryDelta !== 0) return queryDelta;
      const visitDelta = Number(b.metrics?.visits || 0) - Number(a.metrics?.visits || 0);
      if (visitDelta !== 0) return visitDelta;
      return Number(b.metrics?.impressions || 0) - Number(a.metrics?.impressions || 0);
    });

    return appliedQuery ? ranked.filter((item) => getQueryScore(item, appliedQuery) > 0) : ranked;
  }, [activeFilter, allItems, appliedQuery]);

  const summary = useMemo(() => getPartnerInsightSummary({ partnerType }), [partnerType]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setResultsExpanded(true);
    }
  }, []);

  useEffect(() => {
    setSelected((current) => {
      if (!current) return null;
      return filteredItems.find((item) => item.id === current.id) || null;
    });
  }, [filteredItems]);

  useEffect(() => {
    if (!selected?.location) return;
    setMapCenter([selected.location.latitude, selected.location.longitude]);
  }, [selected?.id]);

  function handleSubmit(event) {
    event.preventDefault();
    setAppliedQuery(queryInput.trim());
  }

  function handlePrompt(prompt) {
    setQueryInput(prompt);
    setAppliedQuery(prompt);
  }

  function handleSelect(item) {
    setSelected((current) => (current?.id === item.id ? null : item));
  }

  const activeItem = selected;
  const itemsForMap = filteredItems.map(toMarkerEntity);
  const resultCount = filteredItems.length;

  return (
    <section className="border-y border-[rgba(10,20,40,0.08)] bg-[#f7f9fc]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Active zones", value: summary.activeZones, icon: MapPin },
            { label: "Tracked visits", value: metricValue(summary.interactions), icon: LineChart },
            { label: "Redemptions", value: metricValue(summary.redemptions), icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[20px] border border-[rgba(10,20,40,0.08)] bg-white p-4 shadow-[0_8px_20px_rgba(11,26,43,0.04)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground">
                      {item.value}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#f1f4f8] text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[rgba(10,20,40,0.08)] bg-white shadow-[0_18px_40px_rgba(11,26,43,0.06)]">
          <div className="border-b border-[rgba(10,20,40,0.08)] p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="dp-micro-label">Partner map</div>
                <h2 className="mt-2 font-ui text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground md:text-[1.9rem]">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted-foreground">
                  {description}
                </p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {PARTNER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePrompt(prompt)}
                      className="min-w-[220px] rounded-[16px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-4 py-3 text-left transition-all hover:border-primary/20 hover:bg-white"
                    >
                      <div className="text-[12px] font-semibold text-foreground">{prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f1f4f8] p-2 md:flex-row"
              >
                <div className="flex h-11 min-w-[280px] items-center gap-3 rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white px-4">
                  <Search className="h-4 w-4 shrink-0 text-foreground/45" />
                  <input
                    value={queryInput}
                    onChange={(event) => setQueryInput(event.target.value)}
                    placeholder="Ask what is happening here"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-medium text-white"
                >
                  Analyze map
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setSelected(null);
                  }}
                  className={`rounded-full border px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? "border-primary bg-primary text-white"
                      : "border-[rgba(10,20,40,0.08)] bg-white text-foreground/70 hover:bg-[#f7f9fc]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[460px] lg:h-[720px]">
              <UnifiedMapShell
                items={itemsForMap}
                selectedId={activeItem?.id}
                markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
                onMarkerSelect={(entity) => {
                  const next = filteredItems.find((item) => item.id === entity.id);
                  if (next) handleSelect(next);
                }}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                onMapCenterChange={setMapCenter}
                onMapZoomChange={setMapZoom}
                className="h-full w-full"
              />
            </div>

            <div className="relative z-10 -mt-16 px-3 pb-3 lg:mt-0 lg:border-l lg:border-[rgba(10,20,40,0.08)] lg:p-4">
              <div className="rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-white/96 p-4 shadow-[0_14px_34px_rgba(11,26,43,0.12)] backdrop-blur lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
                    Ranked intelligence
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f1f4f8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
                      {activeFilter === "all" ? "All signals" : FILTERS.find((item) => item.id === activeFilter)?.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {resultCount} {resultCount === 1 ? "zone" : "zones"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResultsExpanded((current) => !current)}
                      className="inline-flex items-center gap-1 rounded-full border border-[rgba(10,20,40,0.08)] px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-[#f7f9fc]"
                    >
                      {resultsExpanded ? "Hide results" : "Show results"}
                      {resultsExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {activeItem ? (
                  <div className="mt-3 rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                          {activeItem.entityType}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-foreground">
                          {activeItem.title}
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                          {activeItem.district} · {activeItem.address}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/70">
                          <span className="inline-flex items-center gap-1">
                            <Navigation className="h-3.5 w-3.5" />
                            {activeItem.trend?.delta} {activeItem.trend?.window}
                          </span>
                          <span className="rounded-full bg-white px-2 py-1 font-medium capitalize text-foreground/70">
                            {activeItem.label}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(10,20,40,0.08)] bg-white text-foreground/70 transition-colors hover:text-foreground"
                        aria-label="Close selected insight"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        { label: "Impressions", value: metricValue(activeItem.metrics?.impressions) },
                        { label: "Visits", value: metricValue(activeItem.metrics?.visits) },
                        { label: "Saves / RSVP", value: metricValue(activeItem.metrics?.saves) },
                        { label: "Redemptions", value: metricValue(activeItem.metrics?.redemptions) },
                        { label: "Conversion", value: metricValue(activeItem.metrics?.conversionRate, "%") },
                        { label: "Repeat rate", value: metricValue(activeItem.metrics?.repeatRate, "%") },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white p-3">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            {metric.label}
                          </div>
                          <div className="mt-1 text-[15px] font-semibold text-foreground">{metric.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[14px] bg-[var(--dp-navy)] p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] dp-dark-copy-muted">
                        Context
                      </div>
                      <div className="mt-2 text-[13px] font-medium leading-5 dp-dark-copy">
                        {activeItem.shortInsight}
                      </div>
                      <div className="mt-2 text-[12px] leading-5 dp-dark-copy-muted">
                        {activeItem.summary}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-3 lg:grid-cols-1">
                      {(activeItem.sourceBreakdown || []).slice(0, 3).map((source) => (
                        <div key={source.label} className="rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white p-3">
                          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                            Source
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span className="text-[12px] font-medium text-foreground">{source.label}</span>
                            <span className="text-[12px] font-semibold text-[var(--dp-gold-muted)]">{source.value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[14px] border border-[rgba(198,168,90,0.24)] bg-[rgba(198,168,90,0.08)] p-4">
                      <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                        <Target className="h-3.5 w-3.5" />
                        Recommended action
                      </div>
                      <div className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                        {activeItem.recommendedAction}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[18px] border border-dashed border-[rgba(10,20,40,0.12)] bg-[#f7f9fc] p-5 text-[13px] leading-6 text-muted-foreground">
                    Select a pin to see metrics, source attribution, and the next action for that zone.
                  </div>
                )}

                {resultsExpanded ? (
                  <div className="mt-3 space-y-3 overflow-y-auto pr-1 lg:max-h-[420px]">
                    {filteredItems.map((item) => {
                      const isSelected = activeItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className={`w-full rounded-[16px] border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? "border-primary/20 bg-primary/[0.04] shadow-[0_8px_18px_rgba(11,26,43,0.06)]"
                              : "border-[rgba(10,20,40,0.08)] bg-white hover:border-primary/15 hover:bg-[#f7f9fc]"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-primary text-white" : "bg-[#f1f4f8] text-primary"}`}>
                              {item.entityType === "building" || item.entityType === "hotel" ? (
                                <Building2 className="h-4 w-4" />
                              ) : item.insightType === "opportunity" ? (
                                <Target className="h-4 w-4" />
                              ) : (
                                <LineChart className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13px] font-semibold text-foreground">{item.title}</div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px]">
                                <span className="flex items-center gap-[3px] text-[hsl(214,52%,18%)]">
                                  <Navigation className="h-3 w-3" />
                                  {item.district}
                                </span>
                                <span className="font-medium text-[var(--dp-gold-muted)]">
                                  {metricValue(item.metrics?.visits)} visits today
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] leading-5 text-muted-foreground">
                                {item.shortInsight}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
