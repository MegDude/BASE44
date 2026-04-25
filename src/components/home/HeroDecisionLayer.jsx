import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMapPanelStore } from "@/store/useMapPanelStore";
import { mapRepository } from "@/lib/repositories/mapRepository";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";
import { HOME_MAP_INTENT_EVENT, openHomeMapIntent } from "@/lib/homeMapIntent";
import { Calendar } from "@/components/ui/calendar";

const SKYLINE_BOUNDS = {
  north: 30.2795,
  south: 30.2582,
  west: -97.7535,
  east: -97.7382,
};

const QUESTION_PROMPTS = [
  {
    id: "where-go",
    label: "Where do you want to go?",
    query: "Where do you want to go?",
    context: "near",
  },
  {
    id: "what-do",
    label: "What do you want to do?",
    query: "What do you want to do?",
    context: "now",
  },
  {
    id: "who-meet",
    label: "Who do you want to meet?",
    query: "Who do you want to meet?",
    context: "now",
  },
];

const QUESTION_INSIGHTS = {
  "where-go": "Places, districts, and walkable downtown destinations",
  "what-do": "Activities, events, perks, and live plans",
  "who-meet": "People, plans, and what is happening around you",
};

const MAP_INSIGHT_VIEWS = [
  {
    id: "five-minute",
    label: "The 5-Minute Neighborhood",
    title: "Everything you need within walking distance.",
    body:
      "Coffee, food, nightlife, events, and home all connect in one system. This is what downtown living should feel like.",
  },
  {
    id: "people",
    label: "Not Just Places. People.",
    title: "See your neighborhood in motion.",
    body:
      "See who is going. See what is trending. Downtown Perks is a community layer, not a directory.",
  },
  {
    id: "resident",
    label: "Live Here. Get Everything.",
    title: "Resident access should be automatic.",
    body:
      "Residents in partner properties get access to every perk, every event, and every update on the map without needing to hunt for it.",
  },
];

const PIN_LAYERS = [
  { id: "places", label: "Places", icon: MapPin },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "perks", label: "Perks", icon: Sparkles },
  { id: "homes", label: "Homes", icon: Building2 },
  { id: "people", label: "People", icon: Users },
];

function toEventCard(item) {
  const dateValue = item?.metadata?.date;
  const parsedDate = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const hasDate = parsedDate && !Number.isNaN(parsedDate.getTime());

  return {
    ...item,
    name: item.name || item.title || "Downtown event",
    venueName: item?.metadata?.venue_name || item.address || "Downtown Austin",
    date: hasDate ? parsedDate : null,
    fullDateLabel: hasDate
      ? parsedDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "Tonight",
    timeLabel: item?.metadata?.time || "Tonight",
  };
}

function isSameDay(left, right) {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getEventImage(item) {
  const category = String(item?.category || "").toLowerCase();
  if (category === "nightlife" || category === "social") return "/media/austin-skyline-dusk.jpeg";
  return "/media/austin-hero-correct.png";
}

function getPopularity(item) {
  return Number(item?.metadata?.popularity ?? 0);
}

function normalizeMapItems(items = [], context = "now") {
  return items
    .filter(
      (item) =>
        Number.isFinite(item?.location?.latitude) &&
        Number.isFinite(item?.location?.longitude)
    )
    .filter((item) => {
      if (context === "open") return Boolean(item?.isOpenNow || item?.isLive || item?.eventTiming?.isLive);
      return true;
    })
    .sort((a, b) => {
      const liveDelta =
        Number(Boolean(b?.isLive || b?.eventTiming?.isLive)) -
        Number(Boolean(a?.isLive || a?.eventTiming?.isLive));
      if (liveDelta !== 0) return liveDelta;

      const aWalk = a?.metadata?.walkMinutes ?? 999;
      const bWalk = b?.metadata?.walkMinutes ?? 999;
      if (aWalk !== bWalk) return aWalk - bWalk;

      return getPopularity(b) - getPopularity(a);
    });
}

function filterInsightView(items = [], viewId = "five-minute") {
  const normalized = [...items];

  if (viewId === "people") {
    return normalized
      .filter(
        (item) =>
          item?.type === "moment" ||
          item?.type === "event" ||
          item?.isLive ||
          item?.eventTiming?.isLive ||
          getPopularity(item) >= 55
      )
      .sort((a, b) => {
        const liveDelta =
          Number(Boolean(b?.isLive || b?.eventTiming?.isLive)) -
          Number(Boolean(a?.isLive || a?.eventTiming?.isLive));
        if (liveDelta !== 0) return liveDelta;
        return getPopularity(b) - getPopularity(a);
      });
  }

  if (viewId === "resident") {
    return normalized
      .filter(
        (item) =>
          item?.type === "building" ||
          item?.type === "property" ||
          item?.type === "hotel" ||
          item?.metadata?.isLegends ||
          item?.perk?.value ||
          item?.perk_value ||
          item?.type === "event"
      )
      .sort((a, b) => {
        const aHome = Number(["building", "property", "hotel"].includes(a?.type));
        const bHome = Number(["building", "property", "hotel"].includes(b?.type));
        if (bHome !== aHome) return bHome - aHome;
        return getPopularity(b) - getPopularity(a);
      });
  }

  return normalized
    .filter((item) => {
      const walkMinutes = item?.metadata?.walkMinutes ?? 999;
      const category = String(item?.category || "").toLowerCase();
      return (
        ["building", "property", "hotel"].includes(item?.type) ||
        walkMinutes <= 8 ||
        ["coffee", "restaurant", "bar", "entertainment"].includes(category) ||
        item?.type === "event"
      );
    })
    .sort((a, b) => {
      const walkDelta = (a?.metadata?.walkMinutes ?? 999) - (b?.metadata?.walkMinutes ?? 999);
      if (walkDelta !== 0) return walkDelta;
      return getPopularity(b) - getPopularity(a);
    });
}

function getInsightMetrics(items = [], viewId = "five-minute") {
  const buildingCount = items.filter((item) => ["building", "property", "hotel"].includes(item.type)).length;
  const eventCount = items.filter((item) => item.type === "event").length;
  const perkCount = items.filter((item) => item.type === "perk" || item.perk?.value || item.perk_value).length;
  const peopleCount = items.filter((item) => item.type === "moment" || item.isLive || item.eventTiming?.isLive).length;

  if (viewId === "people") {
    return [
      `${peopleCount || 1} live signals`,
      `${eventCount || 1} plans`,
      `${items.filter((item) => getPopularity(item) >= 55).length || 1} trending spots`,
    ];
  }

  if (viewId === "resident") {
    return [
      `${buildingCount || 1} homes`,
      `${perkCount || 1} perks`,
      `${eventCount || 1} events`,
    ];
  }

  return [
    `${buildingCount || 1} homes`,
    `${items.filter((item) => (item.metadata?.walkMinutes ?? 999) <= 5).length || 1} within 5 min`,
    `${eventCount + perkCount || 1} things to do`,
  ];
}

function itemMatchesLayer(item, layerId) {
  if (layerId === "places") return item?.type === "venue";
  if (layerId === "events") return item?.type === "event";
  if (layerId === "perks") return item?.type === "perk" || Boolean(item?.perk?.value || item?.perk_value);
  if (layerId === "homes") return ["building", "property", "hotel"].includes(item?.type);
  if (layerId === "people") return item?.type === "moment" || Boolean(item?.isLive || item?.eventTiming?.isLive);
  return true;
}

function projectToSkyline(latitude, longitude) {
  const x = ((longitude - SKYLINE_BOUNDS.west) / (SKYLINE_BOUNDS.east - SKYLINE_BOUNDS.west)) * 100;
  const y = ((SKYLINE_BOUNDS.north - latitude) / (SKYLINE_BOUNDS.north - SKYLINE_BOUNDS.south)) * 100;

  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(18, Math.min(88, y)),
  };
}

function getSignalWeight(item) {
  let weight = getPopularity(item);
  if (item?.isLive || item?.eventTiming?.isLive) weight += 24;
  if (item?.isOpenNow) weight += 12;
  if (item?.type === "moment") weight += 18;
  if (item?.perk?.value || item?.perk_value) weight += 10;
  const walkMinutes = item?.metadata?.walkMinutes;
  if (Number.isFinite(walkMinutes)) weight += Math.max(0, 14 - walkMinutes);
  return Math.max(18, Math.min(96, weight));
}

function buildSkylineSignals(items = []) {
  return items.slice(0, 26).map((item) => {
    const projection = projectToSkyline(item.location.latitude, item.location.longitude);
    const weight = getSignalWeight(item);
    return {
      id: item.id,
      item,
      x: projection.x,
      y: projection.y,
      size: Math.max(8, Math.min(24, 6 + weight * 0.16)),
      weight,
    };
  });
}

function getStatusLabel(item) {
  if (item?.isLive || item?.eventTiming?.isLive) return "Live now";
  if (item?.isOpenNow) return "Open now";
  if (item?.type === "moment") return "People nearby";
  if (item?.type === "event") return "Coming up";
  if (item?.type === "perk" || item?.perk?.value || item?.perk_value) return "Perk";
  if (["building", "property", "hotel"].includes(item?.type)) return "Home base";
  return "Nearby";
}

function getDominantDistrict(items = []) {
  const counts = new Map();
  items.forEach((item) => {
    const key = String(item?.district || "downtown");
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "downtown";
  if (top === "2nd-street") return "2nd Street";
  if (top === "red-river") return "Red River";
  if (top === "west-6th") return "West 6th";
  if (top === "congress") return "Congress";
  if (top === "rainey") return "Rainey District";
  return top.charAt(0).toUpperCase() + top.slice(1);
}

function SkylineSignalStage({ items, selectedItem, onSelect }) {
  const signals = useMemo(() => buildSkylineSignals(items), [items]);
  const dominantDistrict = useMemo(() => getDominantDistrict(items), [items]);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const feed = await mapRepository.getMapFeed({ filters: { types: ["event"] }, limit: 10 });
        const nextEvents = (feed || [])
          .filter((item) => item?.type === "event")
          .slice(0, 10)
          .map(toEventCard)
          .sort((a, b) => {
            const aTime = a.date?.getTime?.() || 0;
            const bTime = b.date?.getTime?.() || 0;
            return aTime - bTime;
          });

        if (!mounted) return;
        setEvents(nextEvents);
        setSelectedDate(nextEvents[0]?.date || null);
        setActiveEventId(nextEvents[0]?.id || null);
      } catch (error) {
        console.error("Hero calendar load failed:", error);
        if (!mounted) return;
        setEvents([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return events.slice(0, 4);
    const sameDay = events.filter((item) => isSameDay(item.date, selectedDate));
    return sameDay.length ? sameDay : events.slice(0, 4);
  }, [events, selectedDate]);

  const activeEvent =
    selectedEvents.find((item) => item.id === activeEventId) || selectedEvents[0] || null;

  useEffect(() => {
    if (!selectedEvents.length) return;
    if (selectedEvents.some((item) => item.id === activeEventId)) return;
    setActiveEventId(selectedEvents[0].id);
  }, [activeEventId, selectedEvents]);

  return (
    <div className="relative min-h-[640px] overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(11,31,51,0.96)_0%,rgba(11,31,51,0.92)_100%)] shadow-[0_24px_60px_rgba(11,31,51,0.14)]">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.07),transparent_22rem)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_56%,rgba(207,175,90,0.12),transparent_18rem)]" />

      <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-[rgba(255,255,255,0.08)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/64 backdrop-blur-md">
        {dominantDistrict}
      </div>

      <div className="absolute inset-0">
        {signals.map((signal, index) => {
          const active = selectedItem?.id === signal.id;
          return (
            <button
              key={signal.id}
              type="button"
              onClick={() => onSelect(signal.item)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${signal.x}%`, top: `${signal.y}%` }}
              aria-label={signal.item.name}
            >
              <motion.span
                className={`absolute inset-0 rounded-full ${active ? "bg-[rgba(207,175,90,0.4)]" : "bg-[rgba(207,175,90,0.28)]"}`}
                style={{
                  width: `${signal.size * 2.2}px`,
                  height: `${signal.size * 2.2}px`,
                  left: "50%",
                  top: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                animate={{ scale: [0.65, 1.35, 1.6], opacity: [0.45, 0.18, 0] }}
                transition={{ duration: 2.8, ease: "easeOut", repeat: Infinity, delay: index * 0.08 }}
              />
              <motion.span
                className={`relative block rounded-full border ${active ? "border-[rgba(255,255,255,0.95)] bg-[rgba(207,175,90,0.96)]" : "border-[rgba(255,255,255,0.8)] bg-[rgba(207,175,90,0.86)]"}`}
                style={{
                  width: `${signal.size}px`,
                  height: `${signal.size}px`,
                  boxShadow: active
                    ? "0 0 0 6px rgba(207,175,90,0.16), 0 10px 24px rgba(11,31,51,0.22)"
                    : "0 0 0 4px rgba(207,175,90,0.12), 0 8px 18px rgba(11,31,51,0.18)",
                }}
                whileHover={{ scale: 1.12 }}
              />
            </button>
          );
        })}
      </div>

      {activeEvent ? (
        <div className="absolute right-4 top-4 z-20 hidden w-[300px] xl:block">
          <div className="overflow-hidden rounded-[24px] border border-white/12 bg-[rgba(7,16,28,0.76)] text-white shadow-[0_18px_40px_rgba(11,31,51,0.22)] backdrop-blur-xl">
            <img
              src={getEventImage(activeEvent)}
              alt={activeEvent.name}
              className="h-28 w-full object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(207,175,90,0.92)]">
                  Live tonight
                </div>
                <button
                  type="button"
                  onClick={() =>
                    openHomeMapIntent({ query: "Events tonight", context: "now", insightView: "people", layers: ["events", "people"], targetId: "live-tonight" })
                  }
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:text-white"
                >
                  Open
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-2 font-heading text-[1.05rem] leading-[1.04]">
                {activeEvent.name}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/72">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {activeEvent.fullDateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {activeEvent.timeLabel}
                </span>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(value) => value && setSelectedDate(value)}
                  className="w-full text-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedItem ? (
        <div className="absolute inset-x-4 bottom-4 z-20">
          <div className="max-w-[320px] rounded-[22px] border border-white/12 bg-[rgba(7,16,28,0.72)] p-4 text-white shadow-[0_18px_40px_rgba(11,31,51,0.22)] backdrop-blur-xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/72">
              {getStatusLabel(selectedItem)}
            </div>
            <div className="mt-2 font-heading text-[1.15rem] leading-[1.04]">
              {selectedItem.name}
            </div>
            <p className="mt-2 text-[13px] leading-5 text-white/76">
              {selectedItem.description || selectedItem.address || selectedItem.district}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(207,175,90,0.92)]">
              {selectedItem?.metadata?.walkMinutes ? <span>{selectedItem.metadata.walkMinutes} min walk</span> : null}
              {selectedItem?.district ? <span>{selectedItem.district}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function HeroDecisionLayer() {
  const {
    query,
    decision,
    agentExplanation,
    setMode,
    setQuery,
    setDecision,
    setType,
    setCategories,
    setFilters,
    setAgentState,
  } = useMapPanelStore();

  const baseItemsRef = useRef([]);
  const [selectedContext, setSelectedContext] = useState(decision);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState(QUESTION_PROMPTS[0].id);
  const [activeInsightView, setActiveInsightView] = useState(MAP_INSIGHT_VIEWS[0].id);
  const [visibleLayers, setVisibleLayers] = useState(["places", "events", "perks", "homes"]);
  const [agentSource, setAgentSource] = useState("fallback");
  const hasActiveQuery = String(query || "").trim().length > 0;

  async function runAgent(nextQuery = query, nextContext = selectedContext, nextInsightView = activeInsightView) {
    setLoading(true);

    try {
      const hasQuery = String(nextQuery || "").trim().length > 0;
      const response = hasQuery
        ? await mapRepository.searchWithIntent({ query: nextQuery })
        : { items: await mapRepository.getMapFeed({ query: "", limit: 1000 }) };

      const normalizedItems = normalizeMapItems(response.items || [], nextContext);
      baseItemsRef.current = normalizedItems;
      const nextItems = hasQuery ? normalizedItems : filterInsightView(normalizedItems, nextInsightView);

      setAgentState({
        agentExplanation:
          response.explanation ||
          response.intent?.explanation ||
          "Showing what fits nearby right now.",
        agentSuggestions: [],
        agentSource: response.source || "fallback",
      });
      setAgentSource(response.source || "fallback");
      setItems(nextItems);
      setSelectedItem(nextItems[0] || null);
    } catch (error) {
      console.error("Embedded ask-the-map failed:", error);
      setAgentState({
        agentExplanation: "The map is using the live downtown feed.",
        agentSuggestions: [],
        agentSource: "fallback",
      });
      setAgentSource("fallback");
      setItems([]);
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (String(query || "").trim()) return;
    const nextItems = filterInsightView(baseItemsRef.current, activeInsightView);
    setItems(nextItems);
    setSelectedItem((current) => {
      if (current && nextItems.some((item) => item.id === current.id)) return current;
      return nextItems[0] || null;
    });
  }, [activeInsightView, query]);

  useEffect(() => {
    runAgent(query, selectedContext, activeInsightView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (String(query || "").trim()) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveQuestionId((current) => {
        const index = QUESTION_PROMPTS.findIndex((prompt) => prompt.id === current);
        return QUESTION_PROMPTS[(index + 1 + QUESTION_PROMPTS.length) % QUESTION_PROMPTS.length].id;
      });
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [query]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleHomeMapIntent = (event) => {
      const nextQuery = String(event?.detail?.query || "").trim();
      const nextContext = event?.detail?.context || "now";
      const nextInsightView = event?.detail?.insightView;
      const nextLayers =
        Array.isArray(event?.detail?.layers) && event.detail.layers.length
          ? event.detail.layers
          : null;

      setMode("ask");
      setQuery(nextQuery);
      setSelectedContext(nextContext);
      setDecision(nextContext);
      setType("all");
      setCategories([]);
      setFilters({ crowd: false, deals: false, fiveMin: false, tenMin: false, openNow: false });
      if (nextInsightView) setActiveInsightView(nextInsightView);
      if (nextLayers) setVisibleLayers(nextLayers);
      runAgent(nextQuery, nextContext, nextInsightView || activeInsightView);
    };

    window.addEventListener(HOME_MAP_INTENT_EVENT, handleHomeMapIntent);
    return () => window.removeEventListener(HOME_MAP_INTENT_EVENT, handleHomeMapIntent);
  }, [activeInsightView, setCategories, setDecision, setFilters, setMode, setQuery, setType]);

  const activeQuestion =
    QUESTION_PROMPTS.find((prompt) => prompt.id === activeQuestionId) ?? QUESTION_PROMPTS[0];

  const visibleItems = useMemo(
    () => items.filter((item) => visibleLayers.some((layerId) => itemMatchesLayer(item, layerId))),
    [items, visibleLayers]
  );

  useEffect(() => {
    setSelectedItem((current) => {
      if (current && visibleItems.some((item) => item.id === current.id)) return current;
      return visibleItems[0] || null;
    });
  }, [visibleItems]);

  const activeInsightMetrics = getInsightMetrics(visibleItems, activeInsightView);
  const resultLabel = hasActiveQuery
    ? `Showing ${visibleItems.length} matching places for "${query}".`
    : agentExplanation || QUESTION_INSIGHTS[activeQuestion.id];
  const liveResultItems = visibleItems.slice(0, 4);

  function handleSubmit(event) {
    event.preventDefault();
    setMode("ask");
    setDecision(selectedContext);
    setType("all");
    setCategories([]);
    setFilters({ crowd: false, deals: false, fiveMin: false, tenMin: false, openNow: false });
    runAgent(query, selectedContext, activeInsightView);
  }

  const toggleLayer = (layerId) => {
    setVisibleLayers((current) => {
      if (current.includes(layerId)) {
        const next = current.filter((item) => item !== layerId);
        return next.length ? next : current;
      }
      return [...current, layerId];
    });
  };

  const heroMotion = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.35 },
    transition: { duration: 0.48, ease: "easeOut" },
  };

  return (
    <div id="home-map-entry" className="relative overflow-hidden bg-[var(--dp-surface-base)]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-6 lg:px-8 lg:pt-12">
        <div className="mb-6 max-w-[860px]">
          <motion.div
            {...heroMotion}
            className="inline-flex w-fit rounded-full border border-[rgba(11,31,51,0.1)] bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.68)] backdrop-blur"
          >
            Downtown Perks
          </motion.div>

          <motion.h1
            {...heroMotion}
            transition={{ duration: 0.52, ease: "easeOut", delay: 0.04 }}
            className="dp-display-hero mt-5 max-w-none whitespace-nowrap text-[clamp(1.5rem,6vw,4.75rem)] leading-[0.92] tracking-[-0.06em] text-[var(--dp-navy)]"
          >
            {APPROVED_HOME_COPY.hero.title}
          </motion.h1>

          <motion.p
            {...heroMotion}
            transition={{ duration: 0.46, ease: "easeOut", delay: 0.1 }}
            className="mt-4 max-w-[44rem] text-[17px] font-ui font-medium leading-7 text-[rgba(11,31,51,0.88)] md:text-[18px] md:leading-8"
          >
            {APPROVED_HOME_COPY.hero.lead}
          </motion.p>

          <motion.p
            {...heroMotion}
            transition={{ duration: 0.46, ease: "easeOut", delay: 0.16 }}
            className="mt-3 max-w-[52rem] font-ui text-[15px] leading-7 text-[rgba(11,31,51,0.68)] md:text-[16px] md:leading-8"
          >
            {APPROVED_HOME_COPY.hero.body}
          </motion.p>

          <motion.div
            {...heroMotion}
            transition={{ duration: 0.44, ease: "easeOut", delay: 0.2 }}
            className="mt-5 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/explore"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--dp-navy)] px-5 text-[14px] font-semibold text-white"
            >
              {APPROVED_HOME_COPY.hero.primaryCta}
            </Link>
            <Link
              to="/card"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(11,31,51,0.10)] bg-white/84 px-5 text-[14px] font-semibold text-[var(--dp-navy)]"
            >
              {APPROVED_HOME_COPY.hero.secondaryCta}
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white p-4 text-left shadow-[0_18px_44px_rgba(11,31,51,0.08)]"
          >
            <div className="grid gap-3">
              <div className="text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.6)]">
                Ask the map
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUESTION_PROMPTS.map((prompt) => {
                  const isActive =
                    activeQuestionId === prompt.id ||
                    (!String(query || "").trim() && activeQuestion.id === prompt.id);
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => {
                        setActiveQuestionId(prompt.id);
                        setQuery(prompt.query);
                        setMode("ask");
                        setSelectedContext(prompt.context);
                        setDecision(prompt.context);
                        setType("all");
                        setCategories([]);
                        setFilters({ crowd: false, deals: false, fiveMin: false, tenMin: false, openNow: false });
                        runAgent(prompt.query, prompt.context, activeInsightView);
                      }}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition whitespace-normal sm:whitespace-nowrap ${
                        isActive
                          ? "bg-[var(--dp-navy)] text-white"
                          : "bg-[rgba(11,31,51,0.06)] text-[rgba(11,31,51,0.72)]"
                      }`}
                    >
                      {prompt.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <div className="min-w-0 flex-1">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setMode("ask")}
                    placeholder={activeQuestion.label}
                    className="h-12 w-full rounded-[18px] border border-[rgba(11,31,51,0.1)] bg-[rgba(248,250,252,0.98)] px-4 text-left text-[15px] text-[var(--dp-navy)] outline-none placeholder:text-[rgba(11,31,51,0.42)]"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[var(--dp-navy)] px-4.5 text-[14px] font-semibold text-white"
                >
                  <Search className="h-4 w-4" />
                  {loading ? "Searching..." : "Ask the map"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[12px] leading-5 text-[rgba(11,31,51,0.62)]">
                <span>{loading ? "The agent is reading the downtown layer." : resultLabel}</span>
                <span className="rounded-full bg-[rgba(11,31,51,0.06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.52)]">
                  {agentSource === "api" ? "Agent live" : agentSource === "base44" ? "Agent fallback" : "Local fallback"}
                </span>
              </div>

              <div className="grid gap-2">
                {MAP_INSIGHT_VIEWS.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => setActiveInsightView(view.id)}
                    className={`rounded-[20px] border px-4 py-4 text-left transition ${
                      activeInsightView === view.id
                        ? "border-[rgba(207,175,90,0.34)] bg-[rgba(207,175,90,0.12)]"
                        : "border-[rgba(11,31,51,0.08)] bg-[rgba(248,250,252,0.82)]"
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      {view.label}
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold leading-[1.08] text-[var(--dp-navy)]">
                      {view.title}
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-[rgba(11,31,51,0.68)]">
                      {view.body}
                    </p>
                    <div className="mt-3 text-[12px] font-semibold text-[var(--dp-navy)]">
                      Open This View
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {PIN_LAYERS.map((layer) => {
                  const Icon = layer.icon;
                  const active = visibleLayers.includes(layer.id);
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => toggleLayer(layer.id)}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold transition whitespace-normal sm:whitespace-nowrap ${
                        active
                          ? "bg-[var(--dp-navy)] text-white"
                          : "bg-[rgba(11,31,51,0.06)] text-[rgba(11,31,51,0.72)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {layer.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {activeInsightMetrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full bg-[rgba(11,31,51,0.06)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(11,31,51,0.62)]"
                  >
                    {metric}
                  </span>
                ))}
              </div>

              <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-[rgba(248,250,252,0.92)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.52)]">
                    Matching now
                  </div>
                  <div className="text-[11px] font-medium text-[rgba(11,31,51,0.48)]">
                    {visibleItems.length} shown
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {liveResultItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className={`rounded-[18px] border px-3 py-3 text-left transition ${
                        selectedItem?.id === item.id
                          ? "border-[rgba(207,175,90,0.44)] bg-[rgba(207,175,90,0.14)]"
                          : "border-[rgba(11,31,51,0.08)] bg-white hover:bg-[rgba(248,250,252,0.98)]"
                      }`}
                    >
                      <div className="text-[13px] font-semibold leading-5 text-[var(--dp-navy)]">
                        {item.name}
                      </div>
                      <div className="mt-1 text-[11px] leading-4 text-[rgba(11,31,51,0.5)]">
                        {item.address || item.district || "Downtown Austin"}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(194,143,84,0.92)]">
                        <span>{getStatusLabel(item)}</span>
                        {item?.metadata?.walkMinutes ? <span>{item.metadata.walkMinutes} min walk</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </form>

          <SkylineSignalStage
            items={visibleItems}
            selectedItem={selectedItem}
            onSelect={setSelectedItem}
          />
        </div>
      </div>
    </div>
  );
}
