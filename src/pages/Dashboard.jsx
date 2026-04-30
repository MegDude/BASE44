import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Hotel,
  Landmark,
  MapPin,
  Megaphone,
  Sparkles,
  Store,
  Ticket,
} from "lucide-react";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { usePartnerInsights } from "@/lib/map/partnerInsights";
import { ROUTES } from "@/lib/routes";

const DASHBOARD_TABS = [
  { label: "Overview", href: ROUTES.partnerDashboard },
  { label: "Map", href: "/partners/dashboard/map" },
  { label: "Properties", href: ROUTES.partnerDashboardResidential },
  { label: "Hospitality", href: ROUTES.partnerDashboardHospitality },
  { label: "Venues", href: ROUTES.partnerDashboardVenues },
  { label: "Brands", href: ROUTES.partnerDashboardBrands },
  { label: "Civic", href: ROUTES.partnerDashboardCivic },
  { label: "Redemptions", href: "/partners/dashboard/redemptions" },
  { label: "Integrations", href: "/partners/dashboard/integrations" },
  { label: "About", href: "/partners/dashboard/about" },
];

const SUGGESTED_PROMPTS = [
  "What’s getting people to act right now?",
  "Which offers are being used most?",
  "Which district is busiest tonight?",
  "What should we update next?",
];

const PARTNER_TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "venues", label: "Venues" },
  { id: "properties", label: "Properties" },
  { id: "hotels", label: "Hospitality" },
  { id: "brands", label: "Brands" },
  { id: "civic", label: "Civic" },
];

const WHAT_TO_SHOW_OPTIONS = [
  { id: "everything", label: "Everything" },
  { id: "visits", label: "Visits" },
  { id: "saves", label: "Saves" },
  { id: "check-ins", label: "Check-ins" },
  { id: "perks-used", label: "Perks used" },
  { id: "events", label: "Events" },
  { id: "offers", label: "Offers" },
  { id: "happy-hour", label: "Happy hour" },
];

const TIMEFRAME_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "tonight", label: "Tonight" },
  { id: "this-week", label: "This week" },
  { id: "last-30", label: "Last 30 days" },
];

const INSIGHT_TABS = [
  { id: "summary", label: "Summary" },
  { id: "proof", label: "Proof" },
  { id: "sources", label: "Sources" },
];

const DISTRICT_LABELS = {
  rainey: "Rainey",
  congress: "Congress",
  "red-river": "Red River",
  "downtown-core": "Downtown Core",
  downtown: "Downtown Core",
  seaholm: "Seaholm",
  "market-district": "Market District",
  waterloo: "Waterloo",
  "west-6th": "West 6th",
};

function getVariantFromPath(pathname) {
  if (pathname.includes("/partners/dashboard/residential")) return "properties";
  if (pathname.includes("/partners/dashboard/hospitality")) return "hotels";
  if (pathname.includes("/partners/dashboard/venues")) return "venues";
  if (pathname.includes("/partners/dashboard/brands")) return "brands";
  if (pathname.includes("/partners/dashboard/civic")) return "civic";
  return "all";
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeDistrict(value = "") {
  const text = normalizeText(value);
  if (!text) return "Downtown Core";
  if (text.includes("rainey")) return "Rainey";
  if (text.includes("congress")) return "Congress";
  if (text.includes("red river") || text.includes("red-river")) return "Red River";
  if (text.includes("seaholm")) return "Seaholm";
  if (text.includes("market")) return "Market District";
  if (text.includes("downtown")) return "Downtown Core";
  if (text.includes("waterloo")) return "Waterloo";
  return text
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeName(value = "") {
  return normalizeText(value).replace(/['’.,"&()-]/g, "").replace(/\s+/g, " ").trim();
}

function dedupePartnerItems(items = []) {
  const seen = new Map();

  for (const item of items) {
    const entityId = String(item?.entity_id || item?.id || "").trim();
    const name = normalizeName(item?.title || item?.name);
    const district = normalizeDistrict(item?.district);
    const address = normalizeText(item?.address);
    const key = entityId || `${name}|${district}|${address}`;
    const current = seen.get(key);

    if (!current) {
      seen.set(key, item);
      continue;
    }

    const currentScore = Number(current?.activityScore || 0);
    const nextScore = Number(item?.activityScore || 0);
    if (nextScore > currentScore) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

function derivePartnerType(item) {
  const raw = normalizeText(item?.partnerType || item?.entityType || item?.type);
  if (raw === "building" || raw === "property") return "properties";
  if (raw === "hotel" || raw === "hospitality") return "hotels";
  if (raw === "brand") return "brands";
  if (raw === "civic") return "civic";
  return "venues";
}

function deriveShowBucket(item) {
  if (Number(item?.eventsListed || 0) > 0) return "events";
  if (Number(item?.activeOffers || 0) > 0) return "offers";
  if (normalizeText(item?.summary).includes("happy hour") || normalizeText(item?.summary).includes("offer")) {
    return "happy-hour";
  }
  return "everything";
}

function addDerivedFields(item) {
  const visits = Number(item?.metrics?.visits || 0);
  const saves = Number(item?.metrics?.saves || 0);
  const checkIns = Number(item?.metrics?.impressions || 0);
  const perksUsed = Number(item?.metrics?.redemptions || 0);
  const activeOffers = Number(item?.metrics?.activePerks || 0);
  const eventsListed = Number(item?.metrics?.activeEvents || 0);
  const views = checkIns;
  const activityScore =
    visits * 1 +
    saves * 1.5 +
    checkIns * 2 +
    perksUsed * 3 +
    activeOffers * 1.25 +
    eventsListed * 1;

  let strongestMetric = "Visits";
  let strongestValue = visits;
  const candidates = [
    ["Saves", saves],
    ["Check-ins", checkIns],
    ["Perks used", perksUsed],
    ["Active offers", activeOffers],
  ];
  candidates.forEach(([label, value]) => {
    if (Number(value) > strongestValue) {
      strongestMetric = label;
      strongestValue = Number(value);
    }
  });

  let recommendedAction = "Try a time-limited perk or event tie-in.";
  if (saves >= 20 && perksUsed <= 2) {
    recommendedAction = "Add or refresh an offer.";
  } else if (checkIns >= 200) {
    recommendedAction = "Keep this offer visible tonight.";
  } else if (visits >= 40 && saves <= 10) {
    recommendedAction = "Improve the listing copy or photo.";
  } else if (eventsListed >= 2) {
    recommendedAction = "Promote nearby offers around event timing.";
  }

  const activityLabel =
    perksUsed > 0
      ? "Perks are being used"
      : checkIns > 0
        ? "People are checking in"
        : visits > 0
          ? "Visits are building"
          : "No partner activity yet";

  return {
    ...item,
    entityId: item?.entity_id || item?.id,
    entityName: item?.title || item?.name,
    entityType: item?.entityType || item?.type,
    partnerType: derivePartnerType(item),
    district: normalizeDistrict(item?.district),
    address: item?.address || "Downtown Austin",
    latitude: item?.latitude ?? item?.location?.latitude,
    longitude: item?.longitude ?? item?.location?.longitude,
    visits,
    saves,
    checkIns,
    perksUsed,
    activeOffers,
    eventsListed,
    views,
    timeframe: "today",
    activityScore,
    strongestMetric,
    recommendedAction,
    activityLabel,
    needsUpdate: activityScore < 40,
    showBucket: deriveShowBucket({ ...item, activeOffers, eventsListed }),
  };
}

function matchesPartnerType(item, value) {
  if (value === "all") return true;
  return item.partnerType === value;
}

function matchesWhatToShow(item, value) {
  if (value === "everything") return true;
  if (value === "visits") return item.visits > 0;
  if (value === "saves") return item.saves > 0;
  if (value === "check-ins") return item.checkIns > 0;
  if (value === "perks-used") return item.perksUsed > 0;
  if (value === "events") return item.eventsListed > 0;
  if (value === "offers") return item.activeOffers > 0;
  if (value === "happy-hour") {
    return (
      normalizeText(item.summary).includes("happy hour") ||
      normalizeText(item.summary).includes("offer") ||
      normalizeText(item.label).includes("redemption")
    );
  }
  return true;
}

function timeframeMultiplier(value) {
  if (value === "tonight") return 1.08;
  if (value === "this-week") return 1.16;
  if (value === "last-30") return 1.3;
  return 1;
}

function matchesQuery(item, query) {
  const value = normalizeText(query);
  if (!value) return true;
  const haystack = [
    item.entityName,
    item.district,
    item.address,
    item.summary,
    item.recommendedAction,
    item.partnerType,
    item.strongestMetric,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(value);
}

function buildReason(item) {
  if (item.perksUsed > 0) {
    return "People nearby are checking in and using offers here more than similar nearby places.";
  }
  if (item.saves > item.visits) {
    return "People are saving this more often than similar nearby places.";
  }
  if (item.visits > 0) {
    return "Nearby visits are stronger here than at similar places right now.";
  }
  return "This location is the clearest current result based on the available downtown activity.";
}

function buildWhyItMatters(item) {
  return `${item.entityName} is getting attention from nearby residents and visitors, with ${normalizeText(item.strongestMetric)} showing clear interest.`;
}

function getPartnerIcon(item) {
  if (item.partnerType === "properties") return Building2;
  if (item.partnerType === "hotels") return Hotel;
  if (item.partnerType === "brands") return Megaphone;
  if (item.partnerType === "civic") return Landmark;
  return Store;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function KpiPill({ label, value, helper }) {
  return (
    <div className="min-w-[160px] border-r border-[rgba(11,31,51,0.08)] px-4 py-1 last:border-r-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
        {label}
      </div>
      <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)]">
        {value}
      </div>
      <div className="mt-1 text-[12px] leading-5 text-[rgba(11,31,51,0.48)]">
        {helper}
      </div>
    </div>
  );
}

function EmptyMessage({ title, body }) {
  return (
    <div className="px-1 py-2 text-left">
      <h3 className="text-[1.2rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{title}</h3>
      <p className="mt-2 max-w-[540px] text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">{body}</p>
    </div>
  );
}

function SurfaceLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
      {children}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const routeVariant = getVariantFromPath(location.pathname);
  const [askInput, setAskInput] = useState("");
  const [appliedAsk, setAppliedAsk] = useState("");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState(routeVariant);
  const [whatToShow, setWhatToShow] = useState("everything");
  const [timeframe, setTimeframe] = useState("today");
  const [openNow, setOpenNow] = useState(false);
  const [selectedInsightTab, setSelectedInsightTab] = useState("summary");
  const [expandedRows, setExpandedRows] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.267, -97.743]);
  const [mapZoom, setMapZoom] = useState(14);

  useEffect(() => {
    setPartnerTypeFilter(routeVariant);
  }, [routeVariant]);

  const hookPartnerType =
    partnerTypeFilter === "all"
      ? "dashboard"
      : partnerTypeFilter === "properties"
        ? "property"
        : partnerTypeFilter === "hotels"
          ? "hospitality"
          : partnerTypeFilter === "venues"
            ? "venue"
            : partnerTypeFilter === "brands"
              ? "brand"
              : "civic";

  const { items, loading, hasLiveData } = usePartnerInsights(hookPartnerType);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedAsk(askInput.trim());
    }, 200);
    return () => window.clearTimeout(timer);
  }, [askInput]);

  const preparedItems = useMemo(() => {
    return dedupePartnerItems((Array.isArray(items) ? items : []).map(addDerivedFields));
  }, [items]);

  const filteredItems = useMemo(() => {
    const multiplier = timeframeMultiplier(timeframe);
    return preparedItems
      .filter((item) => matchesPartnerType(item, partnerTypeFilter))
      .filter((item) => matchesWhatToShow(item, whatToShow))
      .filter((item) => (openNow ? item.visits > 0 || item.perksUsed > 0 : true))
      .filter((item) => matchesQuery(item, appliedAsk))
      .map((item) => ({
        ...item,
        activityScore: Math.round(item.activityScore * multiplier),
      }))
      .sort((a, b) => {
        const queryBoostA = appliedAsk && matchesQuery(a, appliedAsk) ? 1 : 0;
        const queryBoostB = appliedAsk && matchesQuery(b, appliedAsk) ? 1 : 0;
        if (queryBoostB !== queryBoostA) return queryBoostB - queryBoostA;
        const districtMatchA = appliedAsk && normalizeText(appliedAsk).includes(normalizeText(a.district)) ? 1 : 0;
        const districtMatchB = appliedAsk && normalizeText(appliedAsk).includes(normalizeText(b.district)) ? 1 : 0;
        if (districtMatchB !== districtMatchA) return districtMatchB - districtMatchA;
        const typeMatchA = a.partnerType === partnerTypeFilter ? 1 : 0;
        const typeMatchB = b.partnerType === partnerTypeFilter ? 1 : 0;
        if (typeMatchB !== typeMatchA) return typeMatchB - typeMatchA;
        if (b.activityScore !== a.activityScore) return b.activityScore - a.activityScore;
        return b.checkIns - a.checkIns;
      });
  }, [appliedAsk, openNow, partnerTypeFilter, preparedItems, timeframe, whatToShow]);

  const selectedItem = useMemo(() => {
    if (!filteredItems.length) return null;
    return filteredItems.find((item) => item.entityId === selectedEntityId) || filteredItems[0];
  }, [filteredItems, selectedEntityId]);

  useEffect(() => {
    if (selectedItem?.latitude && selectedItem?.longitude) {
      setMapCenter([selectedItem.latitude, selectedItem.longitude]);
    }
  }, [selectedItem]);

  const kpis = useMemo(() => {
    const totals = filteredItems.reduce(
      (acc, item) => {
        acc.shownToday += 1;
        acc.saves += item.saves;
        acc.visits += item.visits;
        acc.checkIns += item.checkIns;
        acc.perksUsed += item.perksUsed;
        acc.activeOffers += item.activeOffers + item.eventsListed;
        return acc;
      },
      { shownToday: 0, saves: 0, visits: 0, checkIns: 0, perksUsed: 0, activeOffers: 0 }
    );

    const helper = hasLiveData ? "Updated from current partner activity." : "No activity recorded yet today.";
    return [
      { label: "Shown today", value: formatNumber(totals.shownToday), helper },
      { label: "Saves", value: formatNumber(totals.saves), helper },
      { label: "Visits", value: formatNumber(totals.visits), helper },
      { label: "Check-ins", value: formatNumber(totals.checkIns), helper },
      { label: "Perks used", value: formatNumber(totals.perksUsed), helper },
      { label: "Active offers", value: formatNumber(totals.activeOffers), helper },
    ];
  }, [filteredItems, hasLiveData]);

  const mapItems = useMemo(() => {
    return filteredItems.slice(0, 40).map((item) => ({
      ...item,
      id: item.entityId,
      name: item.entityName,
      title: item.entityName,
      type:
        item.partnerType === "properties"
          ? "building"
          : item.partnerType === "hotels"
            ? "hotel"
            : item.partnerType === "brands"
              ? "brand"
              : item.partnerType === "civic"
                ? "civic"
                : item.perksUsed > 0
                  ? "perk"
                  : item.eventsListed > 0
                    ? "event"
                    : "venue",
      location: {
        latitude: item.latitude,
        longitude: item.longitude,
        valid: true,
      },
      district: item.district,
      address: item.address,
      metadata: {
        activityScore: item.activityScore,
        popularity: item.activityScore,
      },
    }));
  }, [filteredItems]);

  const uniqueInsights = useMemo(() => {
    const seen = new Set();
    return filteredItems.filter((item) => {
      const key = `${normalizeName(item.entityName)}|${normalizeDistrict(item.district)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filteredItems]);

  const whatsHappeningRows = useMemo(() => {
    const base = uniqueInsights.filter((item) => item.entityId !== selectedItem?.entityId);
    const first = selectedItem
      ? [{
          ...selectedItem,
          rowTitle: `${selectedItem.entityName} leading in ${selectedItem.district}`,
          rowReason: `${formatNumber(selectedItem.perksUsed || selectedItem.checkIns || selectedItem.visits)} ${selectedItem.perksUsed > 0 ? "perks used" : selectedItem.checkIns > 0 ? "check-ins" : "visits"}`,
        }]
      : [];

    const next = base.slice(0, 11).map((item) => ({
      ...item,
      rowTitle: `${item.entityName} active now`,
      rowReason:
        item.saves > item.visits
          ? "Strong saves this week"
          : item.eventsListed > 0
            ? "Event activity nearby"
            : item.visits > 0
              ? "Strong visits and saves"
              : "People nearby are paying attention",
    }));
    return [...first, ...next];
  }, [selectedItem, uniqueInsights]);

  const visibleRows = expandedRows ? whatsHappeningRows : whatsHappeningRows.slice(0, 3);

  const mainResultLabel = selectedItem ? (selectedItem.partnerType === "properties" ? "Property" : "Venue") : "Venue";
  const mainResultReason = selectedItem ? buildReason(selectedItem) : "";
  const whyItMatters = selectedItem ? buildWhyItMatters(selectedItem) : "";
  const Icon = selectedItem ? getPartnerIcon(selectedItem) : Store;

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="border-b border-[rgba(11,31,51,0.08)] px-4 py-10 md:px-6 md:py-14">
        <div className="dp-page-shell">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="max-w-4xl">
              <div className="dp-kicker text-[var(--dp-gold-muted)]">Partner intelligence</div>
              <h1 className="mt-4 text-[2.5rem] font-semibold leading-[0.94] tracking-[-0.06em] text-[var(--dp-navy,#0B1F33)] md:text-[4.5rem]">
                The map is the dashboard now.
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[rgba(11,31,51,0.66)]">
                Overview metrics, live activity, conversions, audience sources, events, and recommendations should not require a second analytics destination. They belong inside the same map surface where partners make decisions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to={ROUTES.partners} className="dp-cta-secondary">
                Partner overview
              </Link>
              <Link to={ROUTES.partnerWorkspace} className="dp-cta-primary">
                Manage workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Map-first intelligence",
                body: "Performance, demand, source attribution, and recommended actions now live directly on the map instead of behind a separate dashboard workflow.",
              },
              {
                title: "One system, multiple partner lenses",
                body: "Properties, hospitality, venues, brands, and civic partners use the same shell. The metrics, insights, and actions adapt by entity type.",
              },
              {
                title: "Live activity in context",
                body: "Recent redemptions, active events, peak windows, and conversion signals appear in the summary strip, results, and detail panels.",
              },
              {
                title: "Event and perk visibility",
                body: "Events, offers, zones, and partner locations all carry performance state so the map answers what is happening and what to do next.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
              >
                <div className="text-[1rem] font-semibold tracking-[-0.03em] text-foreground">
                  {item.title}
                </div>
                <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-20 border-y border-[rgba(11,31,51,0.08)] bg-[rgba(247,248,251,0.9)] px-4 backdrop-blur-xl md:px-6">
        <div className="dp-page-shell">
          <div className="flex gap-2 overflow-x-auto py-3">
            {DASHBOARD_TABS.map((tab) => {
              const active = location.pathname === tab.href || (tab.href === ROUTES.partnerDashboard && location.pathname === "/partners/dashboard");
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] transition ${
                    active
                      ? "bg-[var(--dp-navy,#0B1F33)] text-white shadow-[inset_0_-2px_0_var(--dp-gold,#CFAF5A)]"
                      : "text-[rgba(11,31,51,0.58)] hover:bg-white/70 hover:text-[var(--dp-navy,#0B1F33)]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-5 md:px-6">
        <div className="dp-page-shell">
          <div className="rounded-[24px] border border-[rgba(10,20,40,0.08)] bg-[var(--dp-navy)] p-4 text-white shadow-[0_14px_34px_rgba(11,26,43,0.08)] md:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">
                  Live venue intelligence
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    Peak window: 6:30 PM - 8:00 PM
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    {visibleRows.length} recent actions
                  </span>
                </div>
                <div className="mt-3 text-[16px] font-semibold tracking-[-0.02em]">
                  {selectedItem?.district || "Rainey"} leading activity
                </div>
                <div className="mt-1 max-w-3xl text-[13px] leading-6 text-white/72">
                  Live venue intelligence is strongest where buildings, hotels, events, and offers overlap.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Scans", value: kpis[3]?.value || "0" },
                  { label: "Conversion", value: filteredItems.length ? `${Math.min(98, Math.max(12, Math.round((filteredItems.reduce((sum, item) => sum + item.perksUsed, 0) / Math.max(1, filteredItems.reduce((sum, item) => sum + item.visits, 0))) * 100)))}%` : "0%" },
                  { label: "Redemptions", value: kpis[4]?.value || "0" },
                  { label: "Active perks / events", value: `${filteredItems.reduce((sum, item) => sum + item.activeOffers, 0)} / ${filteredItems.reduce((sum, item) => sum + item.eventsListed, 0)}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/6 p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/62">{item.label}</div>
                    <div className="mt-2 text-[1.15rem] font-semibold tracking-[-0.03em]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-10">
        <div className="dp-page-shell">
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
              Partner view
            </div>
            <h2 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)]">
              Downtown activity, shown clearly.
            </h2>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[rgba(11,31,51,0.64)]">
              Ask a question or use filters to see where people are going, what they are saving, and which offers are being used.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="overflow-hidden">
              <div className="border-b border-[rgba(11,31,51,0.08)] pb-4 md:pb-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                  Ask what’s working
                </div>

                <div className="mt-3 grid gap-3">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex h-12 min-w-0 flex-1 items-center gap-3 border-b border-[rgba(11,31,51,0.12)] px-1">
                      <Sparkles className="h-4 w-4 text-[rgba(11,31,51,0.42)]" />
                      <input
                        value={askInput}
                        onChange={(event) => setAskInput(event.target.value)}
                        placeholder="Ask about visits, saves, offers, events, or a district"
                        aria-label="Ask about visits, saves, offers, events, or a district"
                        className="w-full bg-transparent text-sm text-[var(--dp-navy,#0B1F33)] outline-none placeholder:text-[rgba(11,31,51,0.38)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedAsk(askInput.trim())}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white"
                    >
                      Ask
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setAskInput(prompt);
                          setAppliedAsk(prompt);
                        }}
                        className="shrink-0 rounded-full bg-[rgba(247,249,252,0.9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.66)]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                      <span>Partner type</span>
                      <select
                        value={partnerTypeFilter}
                        onChange={(event) => setPartnerTypeFilter(event.target.value)}
                        className="h-11 border-b border-[rgba(11,31,51,0.08)] bg-transparent px-0 text-sm font-medium text-[var(--dp-navy,#0B1F33)] outline-none"
                      >
                        {PARTNER_TYPE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                      <span>What to show</span>
                      <select
                        value={whatToShow}
                        onChange={(event) => setWhatToShow(event.target.value)}
                        className="h-11 border-b border-[rgba(11,31,51,0.08)] bg-transparent px-0 text-sm font-medium text-[var(--dp-navy,#0B1F33)] outline-none"
                      >
                        {WHAT_TO_SHOW_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.46)]">
                      <span>Timeframe</span>
                      <select
                        value={timeframe}
                        onChange={(event) => setTimeframe(event.target.value)}
                        className="h-11 border-b border-[rgba(11,31,51,0.08)] bg-transparent px-0 text-sm font-medium text-[var(--dp-navy,#0B1F33)] outline-none"
                      >
                        {TIMEFRAME_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => setOpenNow((current) => !current)}
                      aria-pressed={openNow}
                      className={`mt-[22px] inline-flex h-11 items-center justify-between border-b px-0 text-sm font-medium ${
                        openNow
                          ? "border-[var(--dp-navy,#0B1F33)] text-[var(--dp-navy,#0B1F33)]"
                          : "border-[rgba(11,31,51,0.08)] text-[var(--dp-navy,#0B1F33)]"
                      }`}
                    >
                      <span>Open now</span>
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative h-[420px] md:h-[560px]">
                {filteredItems.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <EmptyMessage
                      title="No matching activity."
                      body="Change the timeframe, district, or what to show."
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-[26px] border border-[rgba(11,31,51,0.08)]">
                    <UnifiedMapShell
                      items={mapItems}
                      selectedId={selectedItem?.entityId}
                      markerIcon={(entity, isSelected) => createMarker(entity, { isSelected })}
                      onMarkerSelect={(entity) => setSelectedEntityId(entity.id)}
                      mapCenter={mapCenter}
                      mapZoom={mapZoom}
                      onMapCenterChange={setMapCenter}
                      onMapZoomChange={setMapZoom}
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[rgba(11,31,51,0.08)] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              {!filteredItems.length ? (
                <div className="pt-1">
                  <EmptyMessage
                    title={appliedAsk ? "No partner activity yet." : "Ask a question to see what’s working."}
                    body={
                      appliedAsk
                        ? "Once people start saving places, checking in, using perks, or viewing offers, results will appear here."
                        : "Try asking about a district, offer, event, or partner type."
                    }
                  />
                </div>
              ) : selectedItem ? (
                <div className="flex h-full flex-col">
                  <div className="border-b border-[rgba(11,31,51,0.08)] pb-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                          Clear answer
                        </div>
                        <div className="mt-1 text-[12px] text-[rgba(11,31,51,0.52)]">
                          Based on current partner activity
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.58)]">
                        <Icon className="h-3.5 w-3.5" />
                        {mainResultLabel}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#0B1F33)]">
                        {selectedItem.entityName}
                      </h3>
                      <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.6)]">
                        {selectedItem.district} · {selectedItem.address}
                      </p>
                      <p className="mt-4 text-[15px] leading-7 text-[var(--dp-navy,#0B1F33)]">
                        {selectedItem.entityName} is the strongest result right now.
                      </p>
                      <p className="mt-2 text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
                        {mainResultReason}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                      {INSIGHT_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedInsightTab(tab.id)}
                          aria-selected={selectedInsightTab === tab.id}
                          className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                            selectedInsightTab === tab.id
                              ? "bg-[var(--dp-navy,#0B1F33)] text-white"
                              : "bg-[rgba(247,249,252,0.9)] text-[rgba(11,31,51,0.58)]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 py-5">
                    {selectedInsightTab === "summary" ? (
                      <div className="space-y-5">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                            Why it matters
                          </div>
                          <p className="mt-2 text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
                            {whyItMatters}
                          </p>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                            Recommended next action
                          </div>
                          <p className="mt-2 text-[14px] leading-7 text-[rgba(11,31,51,0.66)]">
                            {selectedItem.recommendedAction}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {selectedInsightTab === "proof" ? (
                      <div className="space-y-3">
                        {[
                          { label: "Check-ins", value: formatNumber(selectedItem.checkIns), icon: CheckCircle2 },
                          { label: "Visits", value: formatNumber(selectedItem.visits), icon: Eye },
                          { label: "Perks used", value: formatNumber(selectedItem.perksUsed), icon: Ticket },
                          { label: "Busiest time", value: timeframe === "tonight" ? "Evening" : timeframe === "this-week" ? "Weeknights" : "Today", icon: Calendar },
                        ].map((metric) => {
                          const MetricIcon = metric.icon;
                          return (
                            <div key={metric.label} className="flex items-center justify-between border-b border-[rgba(11,31,51,0.08)] pb-3">
                              <div className="inline-flex items-center gap-2 text-[13px] font-medium text-[rgba(11,31,51,0.7)]">
                                <MetricIcon className="h-4 w-4 text-[rgba(11,31,51,0.42)]" />
                                {metric.label}
                              </div>
                              <div className="text-[14px] font-semibold text-[var(--dp-navy,#0B1F33)]">{metric.value}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {selectedInsightTab === "sources" ? (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                          What this is based on
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            { label: "Saves", value: formatNumber(selectedItem.saves) },
                            { label: "Check-ins", value: formatNumber(selectedItem.checkIns) },
                            { label: "Perks used", value: formatNumber(selectedItem.perksUsed) },
                            { label: "Event activity", value: formatNumber(selectedItem.eventsListed) },
                            { label: "Offer activity", value: formatNumber(selectedItem.activeOffers) },
                            { label: "Map views", value: formatNumber(selectedItem.views) },
                          ].map((source) => (
                            <div key={source.label} className="flex items-center justify-between border-b border-[rgba(11,31,51,0.08)] pb-3 text-[14px] text-[rgba(11,31,51,0.66)] last:border-b-0 last:pb-0">
                              <span>{source.label}</span>
                              <span className="font-semibold text-[var(--dp-navy,#0B1F33)]">{source.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8 border-t border-[rgba(11,31,51,0.08)] pt-5">
            <div className="pb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.44)]">
                What’s happening now
              </div>
            </div>
            <div>
              {!visibleRows.length ? (
                <EmptyMessage
                  title="No partner activity yet."
                  body="Once people start saving places, checking in, using perks, or viewing offers, results will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {visibleRows.map((row) => (
                    <button
                      key={row.entityId}
                      type="button"
                      onClick={() => setSelectedEntityId(row.entityId)}
                      className="flex w-full items-start justify-between gap-4 border-b border-[rgba(11,31,51,0.08)] py-4 text-left last:border-b-0"
                    >
                      <div>
                        <div className="text-[14px] font-semibold text-[var(--dp-navy,#0B1F33)]">
                          {row.rowTitle || row.entityName}
                        </div>
                        <div className="mt-1 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                          {row.rowReason}
                        </div>
                      </div>
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[rgba(11,31,51,0.38)]" />
                    </button>
                  ))}

                  {whatsHappeningRows.length > 3 ? (
                    <button
                      type="button"
                      onClick={() => setExpandedRows((current) => !current)}
                      className="pt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy,#0B1F33)]"
                    >
                      {expandedRows ? "Show less" : `Show ${whatsHappeningRows.length - 3} more`}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
