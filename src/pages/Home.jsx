import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Clock3,
  Compass,
  Coffee,
  Dumbbell,
  Gift,
  HeartPulse,
  MapPin,
  Moon,
  Music,
  PawPrint,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Utensils,
  Users,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMapStore } from "@/store/map-store";

const HERO_INTENTS = [
  { label: "Dinner tonight", query: "dinner tonight downtown", icon: MapPin },
  { label: "Events nearby", query: "events tonight downtown", icon: Ticket },
  { label: "Resident perks", query: "resident perks nearby", icon: Gift },
  { label: "5 min walk", query: "things within a 5 minute walk", icon: Clock3 },
];

const INTEREST_GROUPS = [
  {
    label: "Daily downtown",
    accent: "navy",
    items: [
      { label: "Coffee", query: "coffee nearby", icon: Coffee },
      { label: "Dinner", query: "dinner tonight", icon: Utensils },
      { label: "5 min walk", query: "within a 5 minute walk", icon: Clock3 },
      { label: "Quiet work spots", query: "quiet places to work", icon: Search },
      { label: "Open now", query: "open now nearby", icon: Radio },
    ],
  },
  {
    label: "What feels worth it",
    accent: "gold",
    items: [
      { label: "Live music", query: "live music tonight", icon: Music },
      { label: "Resident perks", query: "resident perks", icon: Gift },
      { label: "Date night", query: "date night nearby", icon: Sparkles },
      { label: "Late night", query: "late night downtown", icon: Moon },
      { label: "Wellness", query: "wellness and recovery", icon: HeartPulse },
    ],
  },
  {
    label: "My downtown layer",
    accent: "cool",
    items: [
      { label: "Building offers", query: "building resident offers", icon: Building2 },
      { label: "Events tonight", query: "events tonight downtown", icon: Ticket },
      { label: "Fitness", query: "fitness nearby", icon: Dumbbell },
      { label: "Shopping", query: "shopping nearby", icon: ShoppingBag },
      { label: "Pet friendly", query: "pet friendly places", icon: PawPrint },
    ],
  },
];

const SYSTEM_NODES = [
  { label: "Places", detail: "Venues and daily-use stops", icon: MapPin },
  { label: "Events", detail: "What is live, tonight, or worth planning around", icon: Ticket },
  { label: "Perks", detail: "Access and value when it matters", icon: Gift },
  { label: "Properties", detail: "Buildings as neighborhood entry points", icon: Building2 },
  { label: "Signals", detail: "Intent, movement, saves, RSVP, and redemption", icon: Radio },
];

const RESIDENT_LOOP = [
  "Search by intent, not by category.",
  "See nearby results on the live map.",
  "Open details in context without losing place.",
  "Save, RSVP, redeem, or go.",
];

const PLATFORM_LAYERS = [
  {
    eyebrow: "Resident experience",
    title: "A downtown decision loop.",
    body: "Residents discover what is nearby, see why it fits the moment, and move from intent to action without bouncing between search, social, texts, and property emails.",
    points: ["Search", "Save", "RSVP", "Redeem"],
    icon: Users,
    cta: "Open resident flow",
    href: "/resident-app",
  },
  {
    eyebrow: "Property / access layer",
    title: "Buildings become neighborhood entry points.",
    body: "Properties can extend amenity value beyond the lobby by giving residents a branded path into nearby places, offers, events, and walkable context.",
    points: ["QR entry", "Resident onboarding", "Amenity extension", "Leasing proof"],
    icon: Building2,
    cta: "For buildings",
    href: "/downtown-perks/for-buildings",
  },
  {
    eyebrow: "Partner operating surface",
    title: "Partners influence decisions, not impressions.",
    body: "Venues, hotels, brands, and local businesses show up inside the map layer when residents are deciding where to go next.",
    points: ["Offers", "Campaigns", "Leads", "Conversion signals"],
    icon: Zap,
    cta: "Partner options",
    href: "/partners",
  },
  {
    eyebrow: "Operator intelligence",
    title: "The system can be managed, measured, and improved.",
    body: "Operator views turn downtown activity into quality control, content moderation, campaign performance, district coverage, and platform health.",
    points: ["QA", "Analytics", "Approvals", "Rollups"],
    icon: ShieldCheck,
    cta: "Open dashboard",
    href: "/dashboard",
  },
];

const PROOF_ITEMS = [
  "Map-native resident surface",
  "Shared partner and property routes",
  "Base44 entity-backed venue, building, and event feeds",
  "Intent handoff into the unified downtown map",
  "Pricing separated from partner narrative",
  "Dashboard split for resident and partner entry",
];

const SUPPORTED_CATEGORIES = new Set([
  "all",
  "restaurant",
  "fitness",
  "wellness",
  "hotel",
  "entertainment",
  "building",
]);

function normalizeIntentCategory(intent) {
  const categories = Array.isArray(intent?.categories) ? intent.categories : [];
  for (const rawValue of categories) {
    const value = String(rawValue).toLowerCase().trim();
    if (value === "bar" || value === "coffee" || value === "retail") return "restaurant";
    if (value === "event" || value === "events") return "entertainment";
    if (SUPPORTED_CATEGORIES.has(value)) return value;
  }
  return "all";
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,46%)]">
      {children}
    </p>
  );
}

function MapInterfacePreview() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[rgba(252,251,248,0.44)] p-3 shadow-[0_20px_56px_rgba(19,36,67,0.10)] backdrop-blur-xl">
      <div className="relative min-h-[520px] overflow-hidden rounded-[22px] bg-[hsl(42,24%,96%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(19,36,67,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(19,36,67,0.08)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(200,151,58,0.24),transparent_24%),radial-gradient(circle_at_80%_62%,rgba(19,36,67,0.16),transparent_26%)]" />

        <div className="absolute left-5 right-5 top-5 rounded-[18px] bg-white/64 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-[14px] bg-white/70 px-4 py-3">
            <Search className="h-4 w-4 text-[rgba(19,36,67,0.46)]" />
            <span className="flex-1 text-sm text-[rgba(19,36,67,0.62)]">
              Dinner tonight near Rainey
            </span>
            <span className="rounded-[10px] bg-[hsl(218,42%,14%)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
              Ask
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Live", "5 min", "Perks", "Events"].map((item, index) => (
              <span
                key={item}
                className={`rounded-[12px] border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  index === 0
                    ? "border-[rgba(19,36,67,0.18)] bg-[hsl(218,42%,14%)] text-white"
                    : "border-[rgba(19,36,67,0.12)] bg-white/84 text-[rgba(19,36,67,0.68)]"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {[
          { x: "28%", y: "46%", label: "Jo's", active: true },
          { x: "58%", y: "34%", label: "Live", active: false },
          { x: "72%", y: "66%", label: "Perk", active: false },
          { x: "40%", y: "72%", label: "Bldg", active: false },
        ].map((pin) => (
          <div
            key={pin.label}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-3 py-2 shadow-[0_12px_26px_rgba(19,36,67,0.16)] ${
              pin.active
                ? "border-[rgba(200,151,58,0.65)] bg-[hsl(218,42%,14%)] text-white"
                : "border-white/80 bg-white/90 text-[hsl(218,42%,14%)]"
            }`}
            style={{ left: pin.x, top: pin.y }}
          >
            <span className="h-2 w-2 rounded-full bg-[hsl(40,62%,46%)]" />
            <span className="text-[11px] font-semibold">{pin.label}</span>
          </div>
        ))}

        <div className="absolute bottom-4 left-4 right-4 rounded-[22px] border border-[rgba(19,36,67,0.12)] bg-[rgba(252,251,248,0.96)] p-4 shadow-[0_-12px_40px_rgba(19,36,67,0.12)]">
          <div className="mb-3 h-1 w-12 rounded-full bg-[rgba(19,36,67,0.16)]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(19,36,67,0.46)]">
            Best right now
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-[hsl(218,42%,14%)]">
                Jo's Coffee
              </h3>
              <p className="mt-1 text-sm leading-6 text-[rgba(19,36,67,0.64)]">
                Coffee, quick meetings, resident perk, 5-minute walk.
              </p>
            </div>
            <span className="rounded-full bg-[rgba(200,151,58,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[hsl(218,42%,14%)]">
              5 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterestPicker({ selectedInterests, onToggle, onOpenMap }) {
  const selectedCount = selectedInterests.length;

  return (
    <section className="border-b border-[rgba(19,36,67,0.08)] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="relative h-20 w-20">
              <span className="absolute left-4 top-4 h-12 w-12 rounded-full border border-[rgba(11,31,51,0.72)]" />
              <span className="absolute left-8 top-2 h-14 w-10 rotate-45 rounded-full border border-[rgba(11,31,51,0.72)]" />
              <span className="absolute left-2 top-8 h-10 w-14 -rotate-12 rounded-full border border-[rgba(11,31,51,0.72)]" />
              <span className="absolute left-[37px] top-[35px] h-2 w-2 rounded-full bg-[var(--dp-gold,#CFAF5A)]" />
              <span className="absolute left-1 top-7 h-1 w-1 rounded-full bg-[rgba(11,31,51,0.72)]" />
              <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-[rgba(11,31,51,0.72)]" />
              <span className="absolute bottom-2 right-4 h-1.5 w-1.5 rounded-full bg-[rgba(11,31,51,0.72)]" />
            </div>
          </div>
          <SectionLabel>Personalize the map</SectionLabel>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.052em] text-[hsl(218,42%,14%)] md:text-5xl">
            What should downtown{" "}
            <span className="dp-script-accent-inline whitespace-nowrap text-[1.38em]">surface for you?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[rgba(19,36,67,0.64)]">
            Choose three or more signals. You can browse without signing up; these simply tune the first map view.
          </p>
        </div>

        <div className="mt-12 space-y-9">
          {INTEREST_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.01em] text-[rgba(19,36,67,0.82)]">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = selectedInterests.some((interest) => interest.label === item.label);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onToggle(item)}
                      className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm transition ${
                        selected
                          ? "bg-[hsl(218,42%,14%)] text-white"
                          : "border border-[rgba(19,36,67,0.18)] bg-transparent text-[rgba(19,36,67,0.78)] hover:border-[rgba(19,36,67,0.32)] hover:bg-white/34"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${selected ? "text-[hsl(40,62%,56%)]" : "text-[rgba(19,36,67,0.54)]"}`} strokeWidth={1.75} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[rgba(19,36,67,0.08)] pt-7 sm:flex-row">
          <p className="text-sm text-[rgba(19,36,67,0.58)]">
            {selectedCount >= 3
              ? `${selectedCount} signals selected. The map can open with your downtown layer.`
              : `${Math.max(0, 3 - selectedCount)} more signal${3 - selectedCount === 1 ? "" : "s"} recommended before tuning the map.`}
          </p>
          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[hsl(218,42%,14%)] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[hsl(218,42%,12%)]"
          >
            Open tuned map
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const resetToDefaults = useMapStore((state) => state.resetToDefaults);
  const setQueryFilter = useMapStore((state) => state.setQueryFilter);
  const setCategoryFilter = useMapStore((state) => state.setCategoryFilter);
  const setPanelExpanded = useMapStore((state) => state.setPanelExpanded);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeIntent, setActiveIntent] = useState(HERO_INTENTS[0].label);
  const [assistantNote, setAssistantNote] = useState(
    "Search starts the experience. The map holds the system together."
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([
    INTEREST_GROUPS[0].items[0],
    INTEREST_GROUPS[0].items[2],
    INTEREST_GROUPS[1].items[1],
  ]);

  const selectedIntent = useMemo(
    () => HERO_INTENTS.find((item) => item.label === activeIntent) || HERO_INTENTS[0],
    [activeIntent]
  );

  const openMapWithIntent = (query, category = "all") => {
    const nextQuery = query.trim() || selectedIntent.query;
    resetToDefaults();
    setPanelExpanded(true);
    setQueryFilter(nextQuery);
    if (SUPPORTED_CATEGORIES.has(category)) {
      setCategoryFilter(category);
    }
    navigate(`/downtown-perks/explore?q=${encodeURIComponent(nextQuery)}`);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    openMapWithIntent(searchQuery || selectedIntent.query);
  };

  const handleIntentClick = (intent) => {
    setActiveIntent(intent.label);
    setSearchQuery(intent.query);
    setAssistantNote(`Ready to open the live map for ${intent.label.toLowerCase()}.`);
  };

  const toggleInterest = (item) => {
    setSelectedInterests((current) => {
      if (current.some((interest) => interest.label === item.label)) {
        return current.filter((interest) => interest.label !== item.label);
      }
      return [...current, item];
    });
  };

  const openInterestMap = () => {
    const query = selectedInterests.length
      ? selectedInterests.map((interest) => interest.query).join(", ")
      : "places events and perks nearby";
    openMapWithIntent(query);
  };

  const handleAskMap = async () => {
    const query = searchQuery.trim() || selectedIntent.query;
    setAiLoading(true);
    setAssistantNote("Reading intent and routing into the downtown map...");

    try {
      const response = await base44.functions.invoke("searchMapIntent", {
        query,
        context: {
          location: "Downtown Austin",
          time: new Date().toISOString(),
          frame: "neighborhood operating layer",
        },
      });

      const category = normalizeIntentCategory(response.data);
      setAssistantNote(response.data?.reasoning || "Intent recognized. Opening the live downtown layer.");
      openMapWithIntent(query, category);
    } catch (error) {
      console.error("Ask the map failed:", error);
      setAssistantNote("AI routing failed. Opening the live map with your current search.");
      openMapWithIntent(query, "all");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(200,151,58,0.11),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(19,36,67,0.08),transparent_24%),linear-gradient(180deg,hsl(210,33%,98%)_0%,hsl(42,24%,96%)_100%)]" />

      <section className="relative min-h-screen border-b border-[rgba(19,36,67,0.1)] px-5 pb-14 pt-[92px] md:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 lg:grid-cols-[0.96fr_1.04fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <SectionLabel>Downtown Perks</SectionLabel>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-[hsl(218,42%,14%)] md:text-7xl">
              The neighborhood operating layer for{" "}
              <span className="dp-script-accent block pt-3 text-[1.08em] md:pt-4">
                downtown living.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[rgba(19,36,67,0.72)] md:text-lg">
              The map is the interface to a live downtown system connecting residents,
              partners, properties, and operators around what is nearby and what should happen next.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-10 max-w-3xl rounded-[24px] bg-[rgba(252,251,248,0.50)] p-3 shadow-[0_20px_52px_rgba(19,36,67,0.08)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-[16px] bg-white/66 px-4 focus-within:bg-white/84 focus-within:shadow-[0_0_0_1px_rgba(200,151,58,0.34)]">
                  <Search className="h-4 w-4 shrink-0 text-[rgba(19,36,67,0.46)]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Ask what downtown should do next."
                    className="min-w-0 flex-1 bg-transparent text-sm text-[hsl(218,42%,14%)] outline-none placeholder:text-[rgba(19,36,67,0.42)]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[hsl(218,42%,12%)]"
                >
                  Open map
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={handleAskMap}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] bg-white/56 px-6 text-sm font-semibold uppercase tracking-[0.12em] text-[hsl(218,42%,14%)] transition hover:bg-white/78 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Sparkles className={`h-4 w-4 text-[hsl(40,62%,46%)] ${aiLoading ? "animate-pulse" : ""}`} />
                  Ask the map
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {HERO_INTENTS.map((intent) => {
                  const Icon = intent.icon;
                  const active = intent.label === activeIntent;
                  return (
                    <button
                      key={intent.label}
                      type="button"
                      onClick={() => handleIntentClick(intent)}
                      className={`inline-flex h-10 items-center gap-2 rounded-[12px] border px-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                        active
                          ? "border-[rgba(19,36,67,0.18)] bg-[hsl(218,42%,14%)] text-white"
                          : "border-[rgba(19,36,67,0.12)] bg-white/80 text-[rgba(19,36,67,0.7)] hover:bg-white"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-[hsl(40,62%,46%)]" : ""}`} />
                      {intent.label}
                    </button>
                  );
                })}
              </div>
            </form>

            <p className="mt-5 max-w-2xl text-sm leading-6 text-[rgba(19,36,67,0.62)]">
              {assistantNote}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            <MapInterfacePreview />
          </motion.div>
        </div>
      </section>

      <InterestPicker
        selectedInterests={selectedInterests}
        onToggle={toggleInterest}
        onOpenMap={openInterestMap}
      />

      <section className="border-b border-[rgba(19,36,67,0.1)] px-5 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionLabel>The operating layer</SectionLabel>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[hsl(218,42%,14%)] md:text-5xl">
              Downtown organized around movement, access, and{" "}
              <span className="dp-script-accent-inline whitespace-nowrap text-[1.32em]">action.</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SYSTEM_NODES.map((node) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  className="rounded-[22px] border border-[rgba(19,36,67,0.1)] bg-white/72 p-5 shadow-[0_14px_36px_rgba(19,36,67,0.05)]"
                >
                  <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(19,36,67,0.06)]">
                    <Icon className="h-4 w-4 text-[hsl(218,42%,14%)]" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-[hsl(218,42%,14%)]">
                    {node.label}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[rgba(19,36,67,0.62)]">{node.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(19,36,67,0.1)] px-5 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionLabel>Resident experience</SectionLabel>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[hsl(218,42%,14%)] md:text-5xl">
              The core loop is simple: search, see, decide, go.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[rgba(19,36,67,0.68)]">
              Downtown Perks should not explain the city. It should reduce the effort of using it.
            </p>
          </div>
          <div className="rounded-[28px] border border-[rgba(19,36,67,0.12)] bg-[rgba(252,251,248,0.86)] p-4 shadow-[0_24px_60px_rgba(19,36,67,0.1)]">
            {RESIDENT_LOOP.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 border-b border-[rgba(19,36,67,0.09)] px-3 py-5 last:border-b-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[hsl(218,42%,14%)] text-[12px] font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-base font-medium text-[hsl(218,42%,14%)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(19,36,67,0.1)] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <SectionLabel>One ecosystem, four systems</SectionLabel>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[hsl(218,42%,14%)] md:text-5xl">
              Different users, one live downtown layer.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {PLATFORM_LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.eyebrow}
                  className="flex min-h-[420px] flex-col justify-between rounded-[26px] border border-[rgba(19,36,67,0.1)] bg-white/72 p-5 shadow-[0_18px_46px_rgba(19,36,67,0.06)]"
                >
                  <div>
                    <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-[15px] bg-[rgba(19,36,67,0.06)]">
                      <Icon className="h-5 w-5 text-[hsl(218,42%,14%)]" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(40,62%,46%)]">
                      {layer.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-[hsl(218,42%,14%)]">
                      {layer.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[rgba(19,36,67,0.64)]">{layer.body}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {layer.points.map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-[rgba(19,36,67,0.1)] bg-[rgba(247,246,242,0.8)] px-3 py-1.5 text-[11px] font-medium text-[rgba(19,36,67,0.7)]"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={layer.href}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[hsl(218,42%,14%)] transition hover:text-[hsl(40,62%,46%)]"
                  >
                    {layer.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[rgba(19,36,67,0.1)] px-5 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionLabel>Platform proof</SectionLabel>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[hsl(218,42%,14%)] md:text-5xl">
              Built to feel operational, not promotional.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[rgba(19,36,67,0.68)]">
              The homepage now points into the actual platform surfaces: map, resident app, partner routes, building narrative, pricing, and dashboard.
            </p>
          </div>
          <div className="rounded-[28px] border border-[rgba(19,36,67,0.12)] bg-[rgba(252,251,248,0.86)] p-4">
            {PROOF_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-4 border-b border-[rgba(19,36,67,0.08)] px-3 py-4 last:border-b-0">
                <Check className="h-4 w-4 shrink-0 text-[hsl(40,62%,46%)]" />
                <span className="text-sm font-medium text-[rgba(19,36,67,0.76)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-[hsl(218,42%,14%)] p-8 text-white shadow-[0_28px_70px_rgba(19,36,67,0.18)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,56%)]">
                Rollout
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
                A living city interface,{" "}
                <span className="dp-script-accent-inline whitespace-nowrap text-[1.32em] text-[hsl(40,62%,62%)]">
                  delivered in phases.
                </span>
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/68">
                Foundations, resident core, partner tools, property layer, intelligence, and launch hardening should all use the same map-native product language.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                to="/downtown-perks/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-semibold uppercase tracking-[0.12em] text-[hsl(218,42%,14%)] transition hover:bg-[hsl(42,24%,96%)]"
              >
                Open live map
                <Compass className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/18 px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-[hsl(40,62%,56%)]"
              >
                View pricing
                <BarChart3 className="h-4 w-4 text-[hsl(40,62%,56%)]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
