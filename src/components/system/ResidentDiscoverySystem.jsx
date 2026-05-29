import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, CalendarDays, Check, Coffee, CreditCard, MapPin, Star, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealSection, SectionContainer, SplitLayout } from "@/components/system/DowntownSystem";

const ease = [0.22, 1, 0.36, 1];

const categories = [
  {
    id: "all",
    label: "All",
    icon: MapPin,
    eyebrow: "Explore what is nearby",
    headline: "Everything nearby, in one view.",
    body: "Places to go, things happening, perks worth using, and buildings worth knowing about — all connected through the map.",
    cta: "Open the map",
    href: "/map?mode=resident&tab=map",
    cards: ["Coffee nearby", "Happy hour now", "Tonight’s event", "Nearby property", "Walkable perk"],
  },
  {
    id: "places",
    label: "Places",
    icon: Coffee,
    eyebrow: "Places",
    headline: "The places you actually end up going.",
    body: "Coffee shops, restaurants, bars, workouts, quick stops, and the places that become part of your week.",
    cta: "Open the Map",
    href: "/map?mode=resident&tab=map",
    cards: ["Jo’s Coffee", "Dinner tonight", "Workout nearby", "Corner market", "Late-night spot"],
  },
  {
    id: "offers",
    label: "Offers",
    icon: Tag,
    eyebrow: "Offers",
    headline: "Perks that feel useful.",
    body: "Small things from places you already pass that make downtown feel easier to use.",
    cta: "Show my perks",
    href: "/downtown-perks/perks",
    cards: ["Coffee add-on", "Happy hour perk", "Resident special", "Priority RSVP", "Local discount"],
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
    eyebrow: "Events",
    headline: "Search less. Do more.",
    body: "See what is happening tonight, this week, and around the corner without checking five apps and a group chat.",
    cta: "See what’s on",
    href: "/downtown-perks/events",
    cards: ["Tonight: Lobby Hour — two blocks away.", "This week: Run Club — coffee after.", "Weekend: Rooftop Social — downtown residents welcome."],
  },
  {
    id: "properties",
    label: "Properties",
    icon: Building2,
    eyebrow: "Properties",
    headline: "Live closer to what matters.",
    body: "See buildings nearby, what is available, and what is walkable from the front door.",
    cta: "View availability",
    href: "/map?mode=resident&tab=map",
    cards: ["Available now", "Resident building", "Walkable coffee", "Nearby essentials", "Downtown views"],
  },
];

const journeySteps = [
  {
    label: "01",
    title: "Tap. Learn. Decide.",
    body: "A nearby place card opens with distance and useful context.",
  },
  {
    label: "02",
    title: "Save it or go now.",
    body: "The route appears, your save state activates, and the walk is clear.",
  },
  {
    label: "03",
    title: "Flash your card. Get the perk.",
    body: "They scan. You save. Done.",
  },
];

const nearbyChips = ["5 min walk", "Open now", "Coffee nearby", "Tonight", "Live music", "Resident perk"];

function CategoryRail({ activeId, setActiveId }) {
  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto border-b border-[#0B1F33]/8 pb-3">
      {categories.map((category) => {
        const Icon = category.icon;
        const active = category.id === activeId;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveId(category.id)}
            onFocus={() => setActiveId(category.id)}
            className={cn(
              "relative min-w-[38%] snap-start overflow-hidden rounded-[6px] border px-3 py-2.5 text-left transition-colors duration-300 sm:min-w-[132px]",
              active
                ? "border-[#0B1F33] bg-[#0B1F33] text-white"
                : "border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#B38F4F]/50 hover:text-[#0B1F33]"
            )}
          >
            {active && (
              <motion.span
                layoutId="resident-experience-active-tab"
                className="absolute inset-0 bg-[#0B1F33]"
                transition={{ duration: 0.38, ease }}
              />
            )}
            <span className="relative z-10 flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium">{category.label}</span>
              <Icon className={cn("h-3.5 w-3.5", active ? "text-[#B38F4F]" : "text-[#0B1F33]/42")} />
            </span>
            <span className="relative z-10 mt-3 block h-px overflow-hidden bg-white/10">
              <motion.span
                className="block h-full bg-[#B38F4F]"
                animate={{ x: active ? "0%" : "-100%" }}
                transition={{ duration: 0.4, ease }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MapPinMarker({ className, active = false, icon: Icon = MapPin, label }) {
  return (
    <motion.div
      className={cn("absolute", className)}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease }}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-[999px] border shadow-[0_14px_34px_rgba(11,31,51,0.08)]",
            active ? "border-[#B38F4F]/60 bg-[#0B1F33] text-white" : "border-[#0B1F33]/10 bg-white text-[#0B1F33]/70"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label && (
          <span className="hidden rounded-[6px] border border-[#0B1F33]/8 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-[#0B1F33]/70 sm:inline-flex">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MapPreviewPanel({ activeCategory }) {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[10px] border border-[#0B1F33]/8 bg-[#F7F8FB]">
      <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(rgba(11,31,51,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(11,31,51,.06)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute left-[10%] top-[30%] h-px w-[78%] rotate-[18deg] bg-[#0B1F33]/14" />
      <div className="absolute left-[18%] top-[64%] h-px w-[64%] -rotate-[10deg] bg-[#0B1F33]/12" />
      <motion.div
        className="absolute left-[28%] top-[43%] h-[2px] w-[42%] origin-left rotate-[-18deg] bg-[#B38F4F]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease }}
      />

      <MapPinMarker className="left-[22%] top-[28%]" active={activeCategory.id === "places" || activeCategory.id === "all"} icon={Coffee} label="Jo’s Coffee" />
      <MapPinMarker className="left-[62%] top-[24%]" active={activeCategory.id === "events"} icon={CalendarDays} label="Tonight" />
      <MapPinMarker className="left-[70%] top-[60%]" active={activeCategory.id === "properties"} icon={Building2} label="Property" />
      <MapPinMarker className="left-[36%] top-[68%]" active={activeCategory.id === "offers"} icon={Tag} label="Perk" />

      <motion.div
        className="absolute left-5 top-5 rounded-[6px] border border-[#0B1F33]/8 bg-white/92 p-3 shadow-[0_14px_34px_rgba(11,31,51,0.05)]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease }}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">
          <Star className="h-3 w-3 fill-[#B38F4F]" />
          Saved place
        </div>
        <div className="font-heading text-lg font-medium text-[#0B1F33]">Jo’s Coffee</div>
        <div className="mt-1 text-[12px] text-[#0B1F33]/58">Coffee nearby · open now</div>
      </motion.div>

      <div className="absolute bottom-5 left-5 right-5">
        <div className="max-w-md rounded-[6px] border border-[#0B1F33]/8 bg-white/92 p-4 shadow-[0_14px_34px_rgba(11,31,51,0.05)]">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B38F4F]">5-minute walk</div>
          <div className="font-heading text-xl font-medium text-[#0B1F33]">Coffee, events, and perks nearby.</div>
          <p className="mt-2 text-[12px] leading-[1.6] text-[#0B1F33]/60">Open the map, tap what looks useful, and move through downtown faster.</p>
        </div>
      </div>
      <div className="absolute right-5 top-5 rounded-[6px] border border-[#0B1F33]/8 bg-[#0B1F33] px-3 py-2 text-[12px] font-medium text-white">
        {activeCategory.label}
      </div>
    </div>
  );
}

function CategoryPanel({ category }) {
  return (
    <div className="pt-2">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
        >
          <span className="dp-label mb-2 block text-[10px]">{category.eyebrow}</span>
          <h3 className="font-heading text-2xl font-medium leading-[1.08] tracking-normal text-[#0B1F33]">
            {category.headline}
          </h3>
          <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/64">{category.body}</p>

          <div className="mt-5 divide-y divide-[#0B1F33]/8 border-y border-[#0B1F33]/8">
            {category.cards.map((card, index) => (
              <motion.div
                key={`${category.id}-${card}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.035, ease }}
                className={cn(
                  "flex items-center justify-between py-2.5 text-[13px] font-medium text-[#0B1F33]/72",
                  index === 0 && "text-[#0B1F33]"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-[999px]", index === 0 ? "bg-[#B38F4F]" : "bg-[#0B1F33]/18")} />
                  {card}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#0B1F33]/38">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </div>

          <Link to={category.href} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#081521]">
            {category.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JourneyPanel() {
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = journeySteps[stepIndex];

  useEffect(() => {
    if (paused) return undefined;

    const timer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % journeySteps.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="border-t border-[#0B1F33]/8 pt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <SplitLayout className="items-start gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="dp-label mb-2 block">How It Works</span>
          <h3 className="font-heading text-2xl font-medium leading-tight text-[#0B1F33]">Decide quickly. Move easily.</h3>
          <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/64">
            Open the map, save something for later or head there now, then use your resident card when you arrive.
          </p>
          <div className="mt-4 flex gap-2">
            {journeySteps.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setStepIndex(index);
                  setPaused(true);
                }}
                className={cn(
                  "h-8 rounded-[6px] border px-3 text-[11px] font-medium transition-colors",
                  index === stepIndex ? "border-[#0B1F33] bg-[#0B1F33] text-white" : "border-[#0B1F33]/8 bg-[#F7F8FB] text-[#0B1F33]/62"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[210px] overflow-hidden rounded-[6px] bg-[#F7F8FB] p-4">
          <div className="absolute inset-x-4 top-16 h-px bg-[#0B1F33]/10" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
              className="relative z-10 h-full"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="dp-label">{step.label}</span>
                <span className="rounded-[6px] border border-[#B38F4F]/40 bg-[#0B1F33]/10 px-2.5 py-1 text-[11px] font-medium text-[#0B1F33]/70">
                  5 min walk
                </span>
              </div>
              <div className="font-heading text-xl font-medium text-[#0B1F33]">{step.title}</div>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#0B1F33]/62">{step.body}</p>

              <div className="mt-5">
                {stepIndex === 0 && (
                  <motion.div className="max-w-[260px] rounded-[6px] border border-[#0B1F33]/8 bg-white p-3 shadow-[0_14px_34px_rgba(11,31,51,0.06)]" initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[#0B1F33]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[999px] bg-[#0B1F33] text-white">
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      Better Half
                    </div>
                    <div className="mt-2 text-[11px] text-[#0B1F33]/55">Dinner tonight · 0.4 mi</div>
                  </motion.div>
                )}
                {stepIndex === 1 && (
                  <div className="relative h-24">
                    <motion.div className="absolute left-4 top-10 h-[2px] w-[210px] origin-left bg-[#B38F4F]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease }} />
                    <div className="absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-[999px] bg-white text-[#0B1F33] shadow-[0_14px_34px_rgba(11,31,51,0.06)]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="absolute right-4 top-6 flex h-10 w-10 items-center justify-center rounded-[999px] bg-[#0B1F33] text-white shadow-[0_14px_34px_rgba(11,31,51,0.06)]">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                )}
                {stepIndex === 2 && (
                  <motion.div className="relative max-w-[260px] rounded-[10px] border border-[#0B1F33]/10 bg-[#0B1F33] p-4 text-white shadow-[0_18px_46px_rgba(11,31,51,0.18)]" initial={{ y: 22 }} animate={{ y: 0 }} transition={{ duration: 0.45, ease }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/58">Resident Card</span>
                      <CreditCard className="h-4 w-4 text-[#B38F4F]" />
                    </div>
                    <div className="mt-8 font-heading text-xl font-medium">Perk confirmed</div>
                    <motion.div className="absolute left-3 right-3 top-1/2 h-px bg-[#B38F4F]" initial={{ x: "-110%" }} animate={{ x: "110%" }} transition={{ duration: 1.2, ease }} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </SplitLayout>
    </div>
  );
}

function NearbyStrip() {
  return (
    <div className="border-t border-[#0B1F33]/8 pt-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="dp-label mb-2 block">What’s Around the Corner</span>
          <p className="max-w-2xl text-[13px] leading-[1.65] text-[#0B1F33]/64">
            Everything you need, within walking distance. See what’s close, decide quickly, and go.
          </p>
        </div>
        <Link to="/map?mode=resident&tab=map" className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#0B1F33] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#081521]">
          Explore downtown
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {nearbyChips.map((chip) => (
          <span key={chip} className="rounded-[6px] border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-[12px] font-medium text-[#0B1F33]/65">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResidentDiscoverySystem() {
  const [activeId, setActiveId] = useState("all");
  const activeCategory = categories.find((category) => category.id === activeId) || categories[0];

  return (
    <SectionContainer>
      <SplitLayout className="mb-8 items-end">
        <RevealSection>
          <span className="dp-label mb-4 block">Resident Experience</span>
          <h2 className="font-heading text-3xl font-medium leading-[1.1] tracking-normal md:text-4xl">
            One map. Everything nearby.
          </h2>
        </RevealSection>
        <RevealSection delay={0.12}>
          <p className="dp-copy">
            Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
          </p>
          <p className="mt-3 text-[13px] font-medium text-[#0B1F33]/72">Spend less time searching and more time showing up.</p>
        </RevealSection>
      </SplitLayout>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr] lg:items-start">
        <RevealSection delay={0.14}>
          <MapPreviewPanel activeCategory={activeCategory} />
        </RevealSection>

        <RevealSection delay={0.2} className="space-y-4">
          <div>
            <h3 className="font-heading text-2xl font-medium leading-tight text-[#0B1F33]">
              Everything works together — so you show up more.
            </h3>
            <p className="mt-2 text-[13px] leading-[1.65] text-[#0B1F33]/64">
              Everything you need to move through downtown lives in one place. Nearby places, events, offers, and properties all connected through the map.
            </p>
          </div>
          <CategoryRail activeId={activeId} setActiveId={setActiveId} />
          <CategoryPanel category={activeCategory} />
        </RevealSection>
      </div>

      <div className="mt-4 space-y-4">
        <RevealSection delay={0.12}>
          <JourneyPanel />
        </RevealSection>
        <RevealSection delay={0.16}>
          <NearbyStrip />
        </RevealSection>
      </div>
    </SectionContainer>
  );
}
