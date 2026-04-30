import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  ChevronDown,
  Clock3,
  Eye,
  Filter,
  LayoutGrid,
  LineChart,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Ticket,
  Target,
  Users2,
} from "lucide-react";
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { getEntityInquiryFlow, getPartnerFlowForType } from "@/lib/cta/partnerFlowHelpers";
import { usePartnerInsights } from "@/lib/map/partnerInsights";
import { getPartnerDashboardRoute, ROUTES } from "@/lib/routes";

const VIEW_OPTIONS = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "demand", label: "Demand", icon: Eye },
  { id: "events", label: "Events", icon: Calendar },
  { id: "offers", label: "Offers", icon: Ticket },
  { id: "sources", label: "Sources", icon: Navigation },
  { id: "repeat", label: "Repeat", icon: Users2 },
];

const LAYER_OPTIONS = [
  { id: "all", label: "Everything", icon: LayoutGrid },
  { id: "venues", label: "Places", icon: MapPin },
  { id: "perks", label: "Perks", icon: Ticket },
  { id: "events", label: "Events", icon: Calendar },
  { id: "buildings", label: "Buildings", icon: Building2 },
];

const PANEL_TABS = [
  { id: "answer", label: "Summary" },
  { id: "proof", label: "Proof" },
  { id: "sources", label: "Sources" },
];

const MAP_CONFIG = {
  dashboard: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know, see, or do?",
    prompts: [
      "What is driving action right now",
      "Which places are converting best tonight",
      "What should we change next",
    ],
    insightsLabel: "Map answer",
    activityLabel: "What the map is seeing now",
  },
  property: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know about your building or residents?",
    prompts: [
      "Which buildings are sending people out",
      "What nearby places residents use most",
      "Where resident activity is building",
    ],
    insightsLabel: "Property signal",
    activityLabel: "What residents are doing nearby",
  },
  hospitality: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know about guest behavior nearby?",
    prompts: [
      "Where guests go after they scan in",
      "What nearby places guests choose first",
      "Which hotel zones need stronger offers",
    ],
    insightsLabel: "Guest signal",
    activityLabel: "What guests are doing nearby",
  },
  venue: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know about venue performance?",
    prompts: [
      "What is bringing people in tonight",
      "Which offers are converting nearby",
      "Where visits are strongest right now",
    ],
    insightsLabel: "Venue signal",
    activityLabel: "What is converting nearby",
  },
  brand: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know about campaign performance?",
    prompts: [
      "Which districts are responding best",
      "Where campaign traffic is coming from",
      "What placements are actually working",
    ],
    insightsLabel: "Campaign signal",
    activityLabel: "What the campaign layer is seeing",
  },
  civic: {
    promptLabel: "Ask the map",
    inputLabel: "What do you want to know about the district right now?",
    prompts: [
      "Where people are showing up now",
      "Which events are building momentum",
      "What parts of downtown need attention",
    ],
    insightsLabel: "District signal",
    activityLabel: "What the map is seeing",
  },
};

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

function toTitleCase(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatEntityLabel(entityType) {
  if (entityType === "venue") return "Venue";
  if (entityType === "building") return "Building";
  if (entityType === "hotel") return "Hotel";
  if (entityType === "district") return "District";
  if (entityType === "campaign") return "Campaign";
  if (entityType === "event") return "Event";
  return toTitleCase(entityType);
}

function formatDistrictLabel(district) {
  if (!district) return "Downtown";
  return toTitleCase(district);
}

function buildAnswerCopy(item, activeFilter, partnerType) {
  if (!item) {
    return {
      title: "Ask the map what you want to know.",
      body: "Use a prompt or type a question. The strongest nearby answer will rise to the top and the map will focus there.",
    };
  }

  const typeLabel = item.entityType === "building" ? "building" : item.entityType === "hotel" ? "hotel" : item.entityType;

  if (activeFilter === "sources") {
    return {
      title: `${item.title} is showing the clearest source mix.`,
      body: `Most activity here is coming from the strongest visible mix of nearby places, buildings, and movement around this ${typeLabel}.`,
    };
  }

  if (activeFilter === "events") {
    return {
      title: `${item.title} is the clearest event-linked answer right now.`,
      body: item.relatedEvents?.length
        ? `Event activity around this ${typeLabel} is helping explain the current movement and response.`
        : `This ${typeLabel} is still the best nearby answer even without a specific event attached.`
    };
  }

  if (activeFilter === "offers") {
    return {
      title: `${item.title} is the strongest offer-led answer right now.`,
      body: `The current mix of scans, visits, and redemptions suggests this is where an offer or perk layer is most visible.`
    };
  }

  if (activeFilter === "repeat") {
    return {
      title: `${item.title} is showing the clearest repeat behavior.`,
      body: `This is where return usage is most obvious right now, which makes it the best read on habit and retention.`
    };
  }

  if (partnerType === "property") {
    return {
      title: `${item.title} is the clearest resident-behavior answer right now.`,
      body: `This location best explains what residents are actually doing nearby and where the building's neighborhood value is showing up.`
    };
  }

  if (partnerType === "venue") {
    return {
      title: `${item.title} is the clearest venue-performance answer right now.`,
      body: `This is where nearby intent is turning into measurable action most clearly at the moment.`
    };
  }

  if (partnerType === "hospitality") {
    return {
      title: `${item.title} is the clearest guest-movement answer right now.`,
      body: `This location best explains where guests are going once they enter the downtown layer.`
    };
  }

  if (partnerType === "brand") {
    return {
      title: `${item.title} is the clearest campaign answer right now.`,
      body: `This is where campaign visibility and attributable response are reading most clearly in the current map state.`
    };
  }

  if (partnerType === "civic") {
    return {
      title: `${item.title} is the clearest district answer right now.`,
      body: `This location best explains where downtown attention is building and where public activity is most visible.`
    };
  }

  return {
    title: `${item.title} is the clearest answer right now.`,
    body: `This is the strongest current answer from the map based on what is nearby, what is active, and where people are responding.`
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
  if (haystack.includes(value)) score += 8;
  value.split(/\s+/).forEach((token) => {
    if (token && haystack.includes(token)) score += 2;
  });
  if (value.includes("underperform") && item.insightType === "coverage") score += 6;
  if (value.includes("perform") && item.insightType === "performance") score += 6;
  if ((value.includes("traffic") || value.includes("going")) && item.insightType === "engagement") score += 6;
  if ((value.includes("building") || value.includes("source")) && item.sourceBreakdown?.length) score += 4;
  if ((value.includes("event") || value.includes("tonight")) && item.relatedEvents?.length) score += 4;
  return score;
}

function getPerformanceState(item) {
  const visits = Number(item.metrics?.visits || 0);
  const conversion = Number(item.metrics?.conversionRate || 0);
  if (item.insightType === "opportunity") return "opportunity";
  if (item.insightType === "campaign") return "spike";
  if (visits >= 600 || conversion >= 35) return "high";
  if (visits >= 300 || conversion >= 18) return "medium";
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
    event: "event",
  };

  return {
    ...item,
    type: entityTypeMap[item.entityType] || "venue",
    markerType: entityTypeMap[item.entityType] || "venue",
    performanceState: getPerformanceState(item),
  };
}

function getFilterLabel(activeFilter) {
  return VIEW_OPTIONS.find((item) => item.id === activeFilter)?.label || "All activity";
}

function MiniMetricBars({ item }) {
  const metrics = [
    { label: "Map views", value: Number(item?.metrics?.impressions || 0), color: "bg-[rgba(11,31,51,0.72)]" },
    { label: "Visits", value: Number(item?.metrics?.visits || 0), color: "bg-[rgba(194,143,84,0.88)]" },
    { label: "Perks used", value: Number(item?.metrics?.redemptions || 0), color: "bg-[rgba(25,94,58,0.82)]" },
  ];
  const max = Math.max(...metrics.map((metric) => metric.value), 1);

  return (
    <div className="grid gap-2">
      {metrics.map((metric) => (
        <div key={metric.label} className="grid gap-1">
          <div className="flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.1em] text-foreground/48">
            <span>{metric.label}</span>
            <span>{metricValue(metric.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgba(11,31,51,0.07)]">
            <div
              className={`h-full rounded-full ${metric.color}`}
              style={{ width: `${Math.max(10, (metric.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PartnerInsightMap({
  partnerType = "dashboard",
  title = "Partner map",
  description = "Use this map to see what is getting attention, what is working, and what needs help next.",
}) {
  const { openFlow } = useCTAFlow();
  const [activeFilter, setActiveFilter] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("answer");
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);
  const [railType, setRailType] = useState("all");
  const [timeWindow, setTimeWindow] = useState("live");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [showMoreAnswers, setShowMoreAnswers] = useState(false);
  const [openControl, setOpenControl] = useState(null);

  const mapConfig = MAP_CONFIG[partnerType] || MAP_CONFIG.dashboard;
  const activeInquiryFlow = activeItem
    ? getEntityInquiryFlow(activeItem, {
        source: `partner_insight_map_${partnerType}`,
        sourceComponent: "PartnerInsightMap",
      })
    : getPartnerFlowForType(partnerType, {
        source: `partner_insight_map_${partnerType}`,
        sourceComponent: "PartnerInsightMap",
      });

  const {
    items: allItems,
    summary,
    activityFeed,
    loading: insightsLoading,
    hasLiveData,
  } = usePartnerInsights(partnerType);

  const filteredItems = useMemo(() => {
    const allowedTypes = FILTER_TO_INSIGHT_TYPES[activeFilter] || [];
    const scoped =
      activeFilter === "radius"
        ? allItems.filter((item) => ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo"].includes(item.district))
        : activeFilter === "sources"
          ? allItems.filter((item) => (item.sourceBreakdown || []).length > 0)
          : activeFilter === "repeat"
            ? allItems.filter((item) => Number(item.metrics?.repeatRate || 0) >= 25)
            : allowedTypes.length > 0
              ? allItems.filter((item) => allowedTypes.includes(item.insightType))
              : allItems;

    const byRailType = scoped.filter((item) => {
      if (railType === "all") return true;
      if (railType === "venues") return item.entityType === "venue" || item.entityType === "hotel";
      if (railType === "perks") {
        const text = `${item.title} ${item.summary} ${item.shortInsight} ${(item.tags || []).join(" ")}`.toLowerCase();
        return Number(item.metrics?.activePerks || 0) > 0 || text.includes("perk") || text.includes("offer");
      }
      if (railType === "events") return item.entityType === "event" || (item.relatedEvents || []).length > 0 || item.insightType === "campaign";
      if (railType === "buildings") return item.entityType === "building";
      return true;
    });

    const byOpenNow = openNowOnly
      ? byRailType.filter((item) => Number(item.metrics?.visits || 0) > 0 || Number(item.metrics?.redemptions || 0) > 0)
      : byRailType;

    const byTimeWindow =
      timeWindow === "5min"
        ? byOpenNow.filter((item) => ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo"].includes(item.district))
        : timeWindow === "10min"
          ? byOpenNow.filter((item) => ["West 6th", "Rainey", "Congress", "Seaholm", "Waterloo", "Red River", "Market District"].includes(item.district))
          : byOpenNow.filter((item) => Number(item.metrics?.impressions || 0) > 0 || Number(item.metrics?.visits || 0) > 0 || Number(item.metrics?.redemptions || 0) > 0);

    const ranked = [...byTimeWindow].sort((a, b) => {
      const queryDelta = getQueryScore(b, appliedQuery) - getQueryScore(a, appliedQuery);
      if (queryDelta !== 0) return queryDelta;
      const visitDelta = Number(b.metrics?.visits || 0) - Number(a.metrics?.visits || 0);
      if (visitDelta !== 0) return visitDelta;
      return Number(b.metrics?.impressions || 0) - Number(a.metrics?.impressions || 0);
    });

    return appliedQuery ? ranked.filter((item) => getQueryScore(item, appliedQuery) > 0) : ranked;
  }, [activeFilter, allItems, appliedQuery, openNowOnly, railType, timeWindow]);

  useEffect(() => {
    setSelected((current) => {
      if (!current) return null;
      return filteredItems.find((item) => item.id === current.id) || null;
    });
  }, [filteredItems]);

  useEffect(() => {
    if (selected) return;
    if (!filteredItems.length) return;
    setSelected(filteredItems[0]);
  }, [filteredItems, selected]);

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
    setActiveTab("answer");
  }

  const activeItem = selected;
  const itemsForMap = filteredItems.map(toMarkerEntity);
  const resultCount = filteredItems.length;
  const answerCopy = buildAnswerCopy(activeItem, activeFilter, partnerType);

  const summaryMetrics = [
    { label: "Shown today", value: metricValue(summary.impressions), icon: Search },
    { label: "People taking action", value: metricValue(summary.conversionRate, "%"), icon: LineChart },
    { label: "Perks used", value: metricValue(summary.redemptions), icon: Sparkles },
    {
      label: partnerType === "civic" ? "Live events" : "Live offers / events",
      value: `${metricValue(summary.activePerks)} / ${metricValue(summary.activeEvents)}`,
      icon: Calendar,
    },
  ];
  const showSummaryMetrics = summaryMetrics.some((item) => item.value !== "0" && item.value !== "0%");

  const shellEyebrow = "Partner view";
  const resultLabel =
    activeFilter === "all" ? "Clear answer" : `${getFilterLabel(activeFilter)} answer`;
  const resultSummaryLabel =
    resultCount === 0 ? "No matching answers" : `${resultCount} ${resultCount === 1 ? "answer" : "answers"}`;
  const activeViewOption = VIEW_OPTIONS.find((option) => option.id === activeFilter) || VIEW_OPTIONS[0];
  const activeLayerOption = LAYER_OPTIONS.find((option) => option.id === railType) || LAYER_OPTIONS[0];
  const activeTimeOption =
    [
      { id: "live", label: "Live" },
      { id: "5min", label: "5 min" },
      { id: "10min", label: "10 min" },
    ].find((option) => option.id === timeWindow) || { id: "live", label: "Live" };

  const compactControls = [
    {
      id: "view",
      label: "View",
      value: activeViewOption.label,
      icon: activeViewOption.icon || BarChart3,
      options: VIEW_OPTIONS.map((option) => ({
        ...option,
        active: activeFilter === option.id,
        onClick: () => {
          setActiveFilter(option.id);
          setSelected(null);
          setOpenControl(null);
        },
      })),
    },
    {
      id: "layers",
      label: "Layers",
      value: activeLayerOption.label,
      icon: activeLayerOption.icon || Filter,
      options: LAYER_OPTIONS.map((option) => ({
        ...option,
        active: railType === option.id,
        onClick: () => {
          setRailType(option.id);
          setSelected(null);
          setOpenControl(null);
        },
      })),
    },
    {
      id: "time",
      label: "Time",
      value: activeTimeOption.label,
      icon: Clock3,
      options: [
        { id: "live", label: "Live" },
        { id: "5min", label: "5 min" },
        { id: "10min", label: "10 min" },
      ].map((option) => ({
        ...option,
        active: timeWindow === option.id,
        onClick: () => {
          setTimeWindow(option.id);
          setOpenControl(null);
        },
      })),
    },
  ];

  const openControlConfig = compactControls.find((control) => control.id === openControl) || null;

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-2 md:px-6">
      <div className="dp-page-shell">
        <div className="overflow-hidden rounded-[30px] bg-white/92 shadow-[0_20px_46px_rgba(11,26,43,0.07)] backdrop-blur-md">
          <div className="p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="dp-micro-label">{shellEyebrow}</div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/56">
                    <Target className="h-3.5 w-3.5" />
                    {insightsLoading ? "Updating" : hasLiveData ? "Live" : "Downtown now"}
                  </span>
                </div>
                <h2 className="mt-2 font-ui text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground md:text-[1.9rem]">
                  {title}
                </h2>
                <p className="mt-2 max-w-3xl text-[13px] leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>

              {showSummaryMetrics ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {summaryMetrics.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-[16px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[10px] uppercase tracking-[0.12em] text-foreground/48">
                            {item.label}
                          </div>
                          <Icon className="h-3.5 w-3.5 text-foreground/42" />
                        </div>
                        <div className="mt-2 text-[0.95rem] font-semibold tracking-[-0.03em] text-foreground">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 rounded-[22px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] p-3 md:p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                {mapConfig.promptLabel}
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2 md:flex-row"
                >
                  <div className="flex h-11 min-w-[280px] items-center gap-3 rounded-[16px] bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                    <Search className="h-4 w-4 shrink-0 text-foreground/45" />
                    <input
                      value={queryInput}
                      onChange={(event) => setQueryInput(event.target.value)}
                      placeholder={mapConfig.inputLabel}
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="dp-cta-primary"
                  >
                    Ask
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="grid gap-2">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mapConfig.prompts.map((prompt) => {
                    const isActive = appliedQuery === prompt || queryInput === prompt;
                    return (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePrompt(prompt)}
                        className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                          isActive
                            ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                            : "border-[rgba(10,20,40,0.08)] bg-white text-foreground/68"
                        }`}
                      >
                        {prompt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {compactControls.map((control) => {
                    const Icon = control.icon;
                    const isOpen = openControl === control.id;
                    return (
                      <button
                        key={control.id}
                        type="button"
                        onClick={() => setOpenControl((current) => (current === control.id ? null : control.id))}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                          isOpen
                            ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                            : "border-[rgba(10,20,40,0.08)] bg-white text-foreground/72"
                        }`}
                        aria-expanded={isOpen}
                        aria-controls={`partner-map-control-${control.id}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{control.label}</span>
                        <span className={`normal-case tracking-normal ${isOpen ? "text-white/78" : "text-foreground/50"}`}>
                          {control.value}
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setOpenNowOnly((current) => !current)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                      openNowOnly
                        ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                        : "border-[rgba(10,20,40,0.08)] bg-white text-foreground/72"
                    }`}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Open</span>
                  </button>
                </div>

                {openControlConfig ? (
                  <div
                    id={`partner-map-control-${openControlConfig.id}`}
                    className="rounded-[18px] border border-[rgba(10,20,40,0.08)] bg-white p-2"
                  >
                    <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/46">
                      <openControlConfig.icon className="h-3.5 w-3.5" />
                      <span>{openControlConfig.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {openControlConfig.options.map((option) => {
                        const OptionIcon = option.icon;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={option.onClick}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                              option.active
                                ? "border-[var(--dp-navy)] bg-[var(--dp-navy)] text-white"
                                : "border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] text-foreground/72"
                            }`}
                          >
                            {OptionIcon ? <OptionIcon className="h-3.5 w-3.5" /> : null}
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
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
              <div className="rounded-[22px] bg-white/96 p-4 shadow-[0_14px_34px_rgba(11,26,43,0.12)] backdrop-blur lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
                      {resultLabel}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      {resultSummaryLabel}
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-foreground/56">
                    Based on current map activity
                  </div>
                </div>

                {activeItem ? (
                  <div className="mt-3 rounded-[18px] bg-[#f7f9fc] p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                          {formatEntityLabel(activeItem.entityType)}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-foreground">
                          {activeItem.title}
                        </div>
                        <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                          {formatDistrictLabel(activeItem.district)} · {activeItem.address}
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
                    </div>

                    <div className="mt-4 rounded-[16px] border border-[rgba(194,143,84,0.22)] bg-[var(--dp-gold-soft)] p-4">
                      <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Why this is leading
                      </div>
                      <div className="mt-2 text-[15px] font-semibold leading-6 text-foreground">
                        {answerCopy.title}
                      </div>
                      <div className="mt-2 text-[13px] leading-6 text-foreground/74">
                        {answerCopy.body}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                      {PANEL_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`rounded-[14px] border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                            activeTab === tab.id
                              ? "border-primary bg-primary text-white"
                              : "border-[rgba(10,20,40,0.08)] bg-white text-foreground/70"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {activeTab === "answer" ? (
                      <>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {[
                            { label: "Map views", value: metricValue(activeItem.metrics?.impressions) },
                            { label: "Visits", value: metricValue(activeItem.metrics?.visits) },
                            { label: "Perks used", value: metricValue(activeItem.metrics?.redemptions) },
                            { label: "Busiest time", value: activeItem.relatedEvents?.[0]?.value || activeItem.trend?.window || "Live now" },
                          ].map((metric) => (
                            <div key={metric.label} className="rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white p-3">
                              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                {metric.label}
                              </div>
                              <div className="mt-1 text-[15px] font-semibold text-foreground">{metric.value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-4 rounded-[14px] bg-white p-4">
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              Context
                            </div>
                            <div className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                              {activeItem.shortInsight}
                            </div>
                            <div className="mt-2 text-[12px] leading-5 text-muted-foreground">
                              {activeItem.summary}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                              <BarChart3 className="h-3.5 w-3.5" />
                              What this is based on
                            </div>
                            <MiniMetricBars item={activeItem} />
                          </div>

                          {activityFeed.length ? (
                            <div className="grid gap-2">
                            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/48">
                              <Clock3 className="h-3.5 w-3.5" />
                              What’s happening now
                            </div>
                              <div className="grid gap-2">
                                {activityFeed.slice(0, 3).map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      const next = filteredItems.find((entry) => entry.id === item.entityId);
                                      if (next) handleSelect(next);
                                    }}
                                    className="rounded-[12px] border border-[rgba(10,20,40,0.08)] bg-[#f7f9fc] px-3 py-3 text-left transition-colors hover:bg-white"
                                  >
                                    <div className="text-[12px] font-semibold text-foreground">{item.title}</div>
                                    <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.detail}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}

                    {activeTab === "proof" ? (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                          {[
                            { label: "Saves / RSVP", value: metricValue(activeItem.metrics?.saves) },
                            { label: "Perks used", value: metricValue(activeItem.metrics?.redemptions) },
                          { label: "People taking action", value: metricValue(activeItem.metrics?.conversionRate, "%") },
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
                    ) : null}

                    {activeTab === "sources" ? (
                      <div className="mt-4 grid gap-2">
                        {(activeItem.sourceBreakdown || []).slice(0, 3).map((source) => (
                          <div key={source.label} className="rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white p-3">
                            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Source</div>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <span className="text-[12px] font-medium text-foreground">{source.label}</span>
                              <span className="text-[12px] font-semibold text-[var(--dp-gold-muted)]">{source.value}%</span>
                            </div>
                          </div>
                        ))}
                        {(activeItem.relatedEvents || []).length ? (
                          <div className="rounded-[14px] border border-[rgba(10,20,40,0.08)] bg-white p-3">
                            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                              <Calendar className="h-3.5 w-3.5" />
                              Related event
                            </div>
                            <div className="mt-2 text-[12px] font-medium text-foreground">
                              {activeItem.relatedEvents[0].label}
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              {activeItem.relatedEvents[0].value}
                            </div>
                          </div>
                        ) : null}
                        <div className="rounded-[14px] border border-[rgba(194,143,84,0.22)] bg-[var(--dp-gold-soft)] p-4">
                          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                            <Target className="h-3.5 w-3.5" />
                            Recommended action
                          </div>
                          <div className="mt-2 text-[13px] font-medium leading-5 text-foreground">
                            {activeItem.recommendedAction}
                          </div>
                        </div>

                        {activeInquiryFlow ? (
                          <button
                            type="button"
                            onClick={() => openFlow(activeInquiryFlow)}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(10,20,40,0.08)] bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy)] transition-colors hover:bg-[#f7f9fc]"
                          >
                            {activeInquiryFlow.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : null}

                        <Link
                          to={partnerType === "dashboard" ? ROUTES.partnerDashboard : getPartnerDashboardRoute(partnerType)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--dp-navy)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[hsl(214,52%,22%)]"
                        >
                          Open dashboard
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 rounded-[18px] border border-dashed border-[rgba(10,20,40,0.12)] bg-[#f7f9fc] p-5 text-[13px] leading-6 text-muted-foreground">
                    Ask a question or tap a pin. The clearest current read appears here.
                  </div>
                )}

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowMoreAnswers((current) => !current)}
                    className="flex w-full items-center justify-between rounded-[16px] border border-[rgba(10,20,40,0.08)] bg-white px-4 py-3 text-left"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">
                        {activeItem?.title || "Top answer"}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {showMoreAnswers ? "Hide remaining answers" : `Show ${Math.max(filteredItems.length - 1, 0)} more`}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-foreground/56 transition-transform ${showMoreAnswers ? "rotate-180" : ""}`} />
                  </button>

                  {showMoreAnswers ? (
                    <div className="mt-3 space-y-3 overflow-y-auto pr-1 lg:max-h-[420px]">
                      {filteredItems.filter((item) => item.id !== activeItem?.id).map((item) => {
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
                            ) : item.entityType === "event" ? (
                              <Calendar className="h-4 w-4" />
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
                                <MapPin className="h-3 w-3" />
                                {item.entityType}
                              </span>
                              <span className="flex items-center gap-[3px] text-[hsl(214,52%,18%)]">
                                <Navigation className="h-3 w-3" />
                                {formatDistrictLabel(item.district)}
                              </span>
                              <span className="font-medium text-[var(--dp-gold-muted)]">
                                {item.entityType === "building"
                                  ? `${metricValue(item.metrics?.activeMembers)} resident actions`
                                  : item.entityType === "hotel"
                                    ? `${metricValue(item.metrics?.conversionRate, "%")} guest conversion`
                                    : item.entityType === "campaign"
                                      ? `${metricValue(item.metrics?.visits)} campaign visits`
                                      : item.entityType === "district"
                                        ? `${metricValue(item.metrics?.visits)} district visits`
                                        : `${metricValue(item.metrics?.visits)} visits today`}
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
      </div>
    </section>
  );
}
