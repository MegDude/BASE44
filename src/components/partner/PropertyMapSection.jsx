import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { usePartnerInsights } from "@/lib/map/partnerInsights";
import { ROUTES } from "@/lib/routes";

const PROMPTS = [
  "Which buildings send people out most",
  "What nearby places residents use most",
  "Where building demand is strongest",
];

const PIN_OPTIONS = [
  { id: "all", label: "Everything", icon: Sparkles },
  { id: "places", label: "Places", icon: MapPin },
  { id: "events", label: "Events", icon: Calendar },
  { id: "buildings", label: "Buildings", icon: Building2 },
];

const TIME_OPTIONS = [
  { id: "live", label: "Live" },
  { id: "5min", label: "5 min" },
  { id: "10min", label: "10 min" },
];

const DISTRICT_5_MIN = ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo"];
const DISTRICT_10_MIN = ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo", "Red River", "Market District"];

function prioritizeTheShore(items) {
  return [...items].sort((left, right) => {
    const leftName = String(left?.title || left?.name || "").trim().toLowerCase();
    const rightName = String(right?.title || right?.name || "").trim().toLowerCase();
    const leftIsShore = leftName === "the shore";
    const rightIsShore = rightName === "the shore";

    if (leftIsShore && !rightIsShore) return -1;
    if (!leftIsShore && rightIsShore) return 1;
    return 0;
  });
}

function toMarkerEntity(item) {
  const typeMap = {
    venue: "venue",
    building: "building",
    hotel: "hotel",
    district: "civic",
    campaign: "brand",
    zone: "moment",
    event: "event",
  };

  return {
    ...item,
    type: typeMap[item.entityType] || "venue",
    markerType: typeMap[item.entityType] || "venue",
  };
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
    ...(item.relatedEvents || []).map((event) => `${event.label} ${event.value}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (haystack.includes(value)) score += 10;
  value.split(/\s+/).forEach((token) => {
    if (token && haystack.includes(token)) score += 2;
  });
  if ((value.includes("building") || value.includes("resident")) && item.entityType === "building") score += 6;
  if ((value.includes("place") || value.includes("nearby")) && (item.entityType === "venue" || item.entityType === "hotel")) score += 5;
  if ((value.includes("event") || value.includes("tonight")) && (item.relatedEvents || []).length) score += 4;
  if ((value.includes("demand") || value.includes("strongest")) && item.insightType === "engagement") score += 4;
  return score;
}

function matchesPinType(item, pinType) {
  if (pinType === "all") return true;
  if (pinType === "places") return item.entityType === "venue" || item.entityType === "hotel";
  if (pinType === "events") return item.entityType === "event" || (item.relatedEvents || []).length > 0;
  if (pinType === "buildings") return item.entityType === "building";
  return true;
}

function matchesTimeWindow(item, timeWindow) {
  if (timeWindow === "5min") return DISTRICT_5_MIN.includes(item.district);
  if (timeWindow === "10min") return DISTRICT_10_MIN.includes(item.district);
  return true;
}

function buildPropertyAnswer(item, query) {
  if (!item) {
    return {
      title: "Ask the map a question.",
      body: "The map will rank the clearest nearby answer, focus the pins, and show what is actually happening around the building layer.",
      recommendedAction: "Use a prompt or type a question about buildings, nearby places, or where resident demand is moving.",
    };
  }

  const queryText = String(query || "").trim().toLowerCase();
  const title = item.title || "This location";

  if (queryText.includes("building") || queryText.includes("send people")) {
    return {
      title: `${title} is the clearest outbound building signal right now.`,
      body: "This is the strongest current answer for where building-linked resident movement is showing up on the map.",
      recommendedAction: item.recommendedAction || "Use this location as the first building-linked activation and compare it against the next strongest property source.",
    };
  }

  if (queryText.includes("nearby") || queryText.includes("places") || queryText.includes("use most")) {
    return {
      title: `${title} is the clearest nearby place signal right now.`,
      body: "This is the place most clearly pulling demand from the property layer based on the current map state.",
      recommendedAction: item.recommendedAction || "Tie building-facing perks or event prompts to this place first, then watch repeat use.",
    };
  }

  if (queryText.includes("demand") || queryText.includes("strongest")) {
    return {
      title: `${title} is where building demand is reading strongest.`,
      body: "This is where the map is showing the clearest concentration of resident interest, visits, or related activity.",
      recommendedAction: item.recommendedAction || "Use this zone as the first test for offers, resident messaging, or linked events.",
    };
  }

  return {
    title: `${title} is the clearest answer from the property layer right now.`,
    body: "The map is surfacing this as the strongest current property-linked signal based on what is nearby, what is active, and what is already pulling response.",
    recommendedAction: item.recommendedAction || "Use this as the first property intelligence action point and compare the next two ranked locations underneath it.",
  };
}

function metricValue(value, suffix = "") {
  if (value === null || value === undefined) return "0";
  return `${Number(value).toLocaleString()}${suffix}`;
}

function MiniMetricBars({ item }) {
  const metrics = [
    { label: "Visits", value: Number(item?.metrics?.visits || 0) },
    { label: "Saves", value: Number(item?.metrics?.saves || 0) },
    { label: "Redemptions", value: Number(item?.metrics?.redemptions || 0) },
  ];
  const max = Math.max(...metrics.map((metric) => metric.value), 1);

  return (
    <div className="grid gap-2">
      {metrics.map((metric) => (
        <div key={metric.label} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-muted-foreground">{metric.label}</span>
            <span className="font-medium text-foreground">{metricValue(metric.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(11,31,51,0.08)]">
            <div
              className="h-full rounded-full bg-[var(--dp-gold,#CFAF5A)]"
              style={{ width: `${Math.max(10, (metric.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PropertyMapSection() {
  const [query, setQuery] = useState("");
  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);
  const [pinType, setPinType] = useState("all");
  const [timeWindow, setTimeWindow] = useState("live");
  const [selected, setSelected] = useState(null);
  const [mapCenter, setMapCenter] = useState(undefined);
  const [mapZoom, setMapZoom] = useState(undefined);
  const [showMoreResults, setShowMoreResults] = useState(false);

  const { items: allItems, loading } = usePartnerInsights("property");
  const activeQuery = String(query || activePrompt || "").trim();

  const filteredItems = useMemo(() => {
    const scoped = allItems
      .filter((item) => matchesPinType(item, pinType))
      .filter((item) => matchesTimeWindow(item, timeWindow));

    const ranked = scoped
      .map((item, index) => ({
        item,
        score:
          getQueryScore(item, activeQuery) +
          Number(item.entityType === "building") * 2 +
          Number((item.relatedEvents || []).length > 0) +
          Math.max(0, 12 - index * 0.2),
      }))
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.item);

    return prioritizeTheShore(ranked);
  }, [allItems, pinType, timeWindow, activeQuery]);

  const mapItems = useMemo(() => filteredItems.map(toMarkerEntity), [filteredItems]);
  const selectedItem = selected && filteredItems.find((item) => item.id === selected.id) ? selected : filteredItems[0] || null;
  const answerCopy = useMemo(() => buildPropertyAnswer(selectedItem, activeQuery), [selectedItem, activeQuery]);
  const topResults = useMemo(() => filteredItems.slice(0, 4), [filteredItems]);
  const searchRailItems = [
    ...PROMPTS.map((prompt) => ({
      id: `prompt-${prompt}`,
      label: prompt,
      active: (query || activePrompt) === prompt,
      onClick: () => handlePrompt(prompt),
    })),
    ...PIN_OPTIONS.map((option) => ({
      id: `pin-${option.id}`,
      label: option.label,
      active: pinType === option.id,
      onClick: () => {
        setPinType(option.id);
        setSelected(null);
      },
    })),
    ...TIME_OPTIONS.map((option) => ({
      id: `time-${option.id}`,
      label: option.label,
      active: timeWindow === option.id,
      onClick: () => {
        setTimeWindow(option.id);
        setSelected(null);
      },
    })),
  ];

  useEffect(() => {
    if (!selectedItem && filteredItems.length > 0) {
      setSelected(filteredItems[0]);
      return;
    }

    if (selected && !filteredItems.some((item) => item.id === selected.id)) {
      setSelected(filteredItems[0] || null);
    }
  }, [filteredItems, selected, selectedItem]);

  function handlePrompt(prompt) {
    setActivePrompt(prompt);
    setQuery(prompt);
    setSelected(null);
  }

  function handleSelect(item) {
    setSelected((current) => (current?.id === item.id ? null : item));
  }

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="mb-6">
          <p className="dp-micro-label">Map intelligence</p>
          <h2 className="dp-display-section mt-2 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Property activity map
          </h2>
        </div>

        <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/92 p-4 shadow-[0_16px_36px_rgba(11,26,43,0.06)] md:p-5">
          <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-[#f7f9fc] px-4 py-3">
            <Search className="h-4 w-4 text-[rgba(11,31,51,0.5)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask the map a question"
              className="w-full bg-transparent text-[14px] font-medium text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.42)]"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {searchRailItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                  item.active
                    ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                    : "border-[rgba(11,31,51,0.08)] bg-white text-[rgba(11,31,51,0.66)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white" style={{ height: 500 }}>
            <UnifiedMapShell
              items={mapItems}
              selectedId={selectedItem?.id}
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

          <div className="space-y-3">
            <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                <Sparkles className="h-3.5 w-3.5" />
                Direct answer
              </div>
              <div className="mt-2 text-[16px] font-semibold leading-6 text-foreground">
                {answerCopy.title}
              </div>
              <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {answerCopy.body}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-[#f7f9fc] p-3">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Signals</div>
                  <div className="mt-1 text-[15px] font-semibold text-foreground">
                    {metricValue(topResults.length)}
                  </div>
                </div>
                <div className="rounded-[14px] bg-[#f7f9fc] p-3">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Pins shown</div>
                  <div className="mt-1 text-[15px] font-semibold text-foreground">
                    {metricValue(mapItems.length)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                Property insight
              </div>
              <div className="mt-3 space-y-2">
                {[
                  "Resident movement from building-linked activity",
                  "Which nearby places are actually pulling demand",
                  "Where offers and events are adding value to the building",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-[12px] leading-5 text-[var(--dp-navy)]">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--dp-gold-muted)]" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedItem ? (
              <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f1f4f8] text-primary">
                    {selectedItem.entityType === "building" ? (
                      <Building2 className="h-4 w-4" />
                    ) : selectedItem.entityType === "event" ? (
                      <Calendar className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold text-foreground">{selectedItem.title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                      {selectedItem.district} · {selectedItem.address}
                    </div>
                    <div className="mt-2 text-[12px] leading-5 text-foreground/74">
                      {selectedItem.shortInsight || selectedItem.summary || "Mapped and ready for live property intelligence."}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Visits", value: metricValue(selectedItem.metrics?.visits) },
                    { label: "Saves / RSVP", value: metricValue(selectedItem.metrics?.saves) },
                    { label: "Redemptions", value: metricValue(selectedItem.metrics?.redemptions) },
                    { label: "Action rate", value: metricValue(selectedItem.metrics?.conversionRate, "%") },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-[14px] bg-[#f7f9fc] p-3">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{metric.label}</div>
                      <div className="mt-1 text-[15px] font-semibold text-foreground">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Quick shape of the data
                    </div>
                    <div className="mt-3">
                      <MiniMetricBars item={selectedItem} />
                    </div>
                  </div>

                  {(selectedItem.sourceBreakdown || []).length ? (
                    <div>
                      <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                        <Users className="h-3.5 w-3.5" />
                        Sources
                      </div>
                      <div className="mt-2 grid gap-2">
                        {selectedItem.sourceBreakdown.slice(0, 2).map((source) => (
                          <div
                            key={source.label}
                            className="flex items-center justify-between rounded-[12px] bg-[#f7f9fc] px-3 py-3 text-[12px]"
                          >
                            <span className="text-foreground">{source.label}</span>
                            <span className="font-semibold text-[var(--dp-gold-muted)]">{source.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-[14px] border border-[rgba(194,143,84,0.22)] bg-[var(--dp-gold-soft)] p-4">
                    <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                      <ArrowRight className="h-3.5 w-3.5" />
                      Recommended action
                    </div>
                    <div className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                      {answerCopy.recommendedAction}
                    </div>
                  </div>

                  <Link
                    to={ROUTES.partnerDashboardResidential}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--dp-navy)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[hsl(214,52%,22%)]"
                  >
                    Open residential dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-[rgba(11,31,51,0.12)] bg-white p-4 text-[13px] leading-6 text-muted-foreground">
                Ask the map a question or tap a pin. The strongest property answer appears here.
              </div>
            )}

            <div className="rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                  Top answers
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Live from the map
                </div>
              </div>

              {loading ? (
                <div className="mt-3 text-[13px] text-muted-foreground">Loading property insights…</div>
              ) : topResults.length === 0 ? (
                <div className="mt-3 text-[13px] text-muted-foreground">No mapped property answers for this view yet.</div>
              ) : (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowMoreResults((current) => !current)}
                    className="flex w-full items-center justify-between rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-3 py-3 text-left"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">
                        {selectedItem?.title || topResults[0]?.title}
                      </div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        {selectedItem?.district || topResults[0]?.district}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/56">
                      {showMoreResults ? "Close" : `Open ${Math.max(topResults.length - 1, 0)} more`}
                    </span>
                  </button>

                  {showMoreResults && topResults.length > 1 ? (
                    <div className="mt-2 space-y-2">
                      {topResults
                        .filter((item) => item.id !== selectedItem?.id)
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="w-full rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white px-3 py-3 text-left transition-colors hover:bg-[#f7f9fc]"
                          >
                            <div className="text-[13px] font-semibold text-foreground">{item.title}</div>
                            <div className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                              {item.district}
                            </div>
                            <div className="mt-1 text-[12px] leading-5 text-foreground/72">
                              {item.shortInsight || item.summary || "Mapped and waiting for live analytics."}
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
