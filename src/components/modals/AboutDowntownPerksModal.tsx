import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  Hotel,
  Landmark,
  Map,
  Megaphone,
  QrCode,
  Search,
  Sparkles,
  Store,
  Users,
  ArrowLeft,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

type AboutDowntownPerksModalProps = {
  open: boolean;
  onClose: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  { icon: Map, title: "Resident Map", body: "See what is nearby, open, useful, and worth leaving for." },
  { icon: CreditCard, title: "Perks Card", body: "Save places, show your card, and use resident access when it is available." },
  { icon: Building2, title: "Homes Nearby", body: "Browse listings with the places, perks, and routines around the address." },
  { icon: Store, title: "Local Offers", body: "Find simple resident perks from places people already know and use." },
  { icon: Users, title: "Building Perks", body: "Buildings can give residents an easier way to find what is close." },
  { icon: BarChart3, title: "Simple Updates", body: "Partners can see what people saved, scanned, joined, and used." },
  { icon: Search, title: "Ask The Map", body: "Ask for coffee, dinner, a showing, a workout, or something to do tonight." },
  { icon: CalendarDays, title: "Events", body: "See what is happening nearby and RSVP without jumping between apps." },
  { icon: QrCode, title: "QR Access", body: "Scan or show a code when a perk, event, or front desk moment needs it." },
  { icon: Sparkles, title: "Local Notes", body: "Keep track of the places, buildings, and plans people actually come back to." },
];

const audiences = [
  {
    icon: Users,
    title: "Residents",
    gain: "A simpler way to see what is nearby.",
    use: "Search, save, RSVP, show the card, and come back to places that fit the day.",
    why: "Downtown feels easier when the useful stuff is in one place.",
  },
  {
    icon: Building2,
    title: "Properties",
    gain: "A clearer way to show what life around the building feels like.",
    use: "Share nearby perks, events, listings, and QR access residents can actually use.",
    why: "The address makes more sense when people can see what is around it.",
  },
  {
    icon: Landmark,
    title: "Brokerages",
    gain: "More helpful context around listings.",
    use: "Show walkable routines, favorite local spots, and nearby plans alongside properties.",
    why: "People feel more confident when they can picture the neighborhood.",
  },
  {
    icon: Store,
    title: "Local Businesses",
    gain: "A better way to be found when people nearby are choosing where to go.",
    use: "Share offers, events, hours, and reasons to stop in.",
    why: "People are more likely to show up when the next step is obvious.",
  },
  {
    icon: Hotel,
    title: "Hotels",
    gain: "A live local guide guests can open instantly.",
    use: "Place QR access in rooms, lobbies, and concierge moments.",
    why: "Guests get a better downtown plan without adding more work for staff.",
  },
  {
    icon: Megaphone,
    title: "Brands",
    gain: "A way to show up where the brand already makes sense.",
    use: "Connect offers, pop-ups, events, and useful moments to nearby residents.",
    why: "A local moment works better when it feels like it belongs there.",
  },
  {
    icon: Landmark,
    title: "Downtown Organizations",
    gain: "A practical way to make participation visible.",
    use: "Share public events, wayfinding, civic moments, and helpful local information.",
    why: "People show up more when local information is easy to find and act on.",
  },
];

const steps = [
  "Open the map",
  "Discover nearby places, events, perks, and listings",
  "Save a place, RSVP, or show your perks card",
  "Partners see what people used and what helped them show up",
];

function GlassButton({
  children,
  to,
  variant = "primary",
  onClick,
}: {
  children: ReactNode;
  to?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) {
  const className =
    variant === "primary"
      ? "dp-button dp-button-primary inline-flex items-center justify-center"
      : "dp-button dp-button-secondary inline-flex items-center justify-center";

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default function AboutDowntownPerksModal({ open, onClose }: AboutDowntownPerksModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  const duration = shouldReduceMotion ? 0 : 0.28;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-end justify-center px-0 md:items-center md:px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease }}
          aria-labelledby="about-dp-title"
          aria-modal="true"
          role="dialog"
        >
          <motion.button
            type="button"
            aria-label="Close Downtown Perks overview"
            className="absolute inset-0 cursor-default bg-[#0B1F33]/[0.06] backdrop-blur-[6px]"
            onClick={onClose}
            tabIndex={-1}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="dp-glass-modal dp-info-panel dp-surface relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden text-[#0B1F33] outline-none md:max-h-[88vh] md:max-w-6xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration, ease }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.28 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 720) onClose();
            }}
          >
            <div className="mx-auto mt-3 h-1 w-11 rounded-[999px] bg-[#0B1F33]/18 md:hidden" />

            <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/40 bg-white/30 px-5 py-2.5 backdrop-blur-[24px] md:px-5">
              <button
                type="button"
                onClick={onClose}
                className="dp-button dp-button-secondary inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em]"
                aria-label="Back from Downtown Perks overview"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <div className="min-w-0 flex-1 truncate text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1F33]/58">
                How Downtown Perks Works
              </div>
              <button
                type="button"
                onClick={onClose}
                className="dp-button dp-button-secondary inline-flex h-[34px] w-[34px] items-center justify-center p-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-28 pt-6 md:px-5 md:pb-7 md:pt-8">
              <section className="grid gap-7 border-b border-white/44 pb-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                <div>
                  <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#C8A96A]">
                    Downtown Perks
                  </span>
                  <h1 id="about-dp-title" className="font-heading text-4xl font-medium leading-[1.02] text-[#0B1F33] md:text-4xl">
                    The neighborhood, finally connected.
                  </h1>
                  <p className="mt-5 max-w-2xl text-[16px] leading-[1.7] text-[#0B1F33]/72">
                    Downtown Perks helps residents find nearby places, perks, events, listings, and local help without bouncing between five different apps.
                  </p>
                  <p className="mt-4 max-w-2xl text-[14px] leading-[1.75] text-[#0B1F33]/58">
                    Open the map, see what is close, save what looks good, and make the next move while the plan still feels easy.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <GlassButton to="/map?mode=resident&tab=map" onClick={onClose}>Explore the Map</GlassButton>
                    <GlassButton to="/map?mode=partner&tab=map&filter=All" variant="secondary" onClick={onClose}>Partner Map</GlassButton>
                  </div>
                </div>

                <div className="dp-glass-card p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Nearby", "Places, events, and services close enough to use now."],
                      ["Perks", "Resident offers from spots people already visit."],
                      ["Homes", "Buildings and listings shown with what is walkable nearby."],
                      ["Ready", "Saved places, RSVPs, card scans, and useful next steps in one place."],
                    ].map(([label, body]) => (
                      <div key={label} className="border border-white/42 bg-white/34 p-2.5 shadow-[0_8px_18px_rgba(11,31,51,0.04)]">
                        <div className="text-[13px] font-semibold text-[#0B1F33]">{label}</div>
                        <div className="mt-1 text-[10.5px] leading-4 text-[#0B1F33]/58">{body}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-[#0B1F33]/58">
                    Built for real downtown decisions: where to go, what to use, what to join, and what is worth checking out nearby.
                  </p>
                </div>
              </section>

              <section className="py-9">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1F33]/50">What it does</span>
                    <h2 className="mt-2 font-heading text-3xl font-medium text-[#0B1F33]">One map for the day-to-day stuff.</h2>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <motion.article
                        key={feature.title}
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.22, ease }}
                        className="group relative overflow-hidden border border-white/44 bg-white/46 p-4 shadow-[0_10px_28px_rgba(11,31,51,0.07)] backdrop-blur-[22px]"
                      >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0B1F33]/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#C8A96A]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="font-body text-[13px] font-semibold text-[#0B1F33]">{feature.title}</h3>
                        <p className="mt-2 text-[12px] leading-relaxed text-[#0B1F33]/58">{feature.body}</p>
                      </motion.article>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-5 border-y border-white/44 py-9 md:grid-cols-[0.85fr_1.15fr]">
                <h2 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">
                  Useful when the plan is still forming.
                </h2>
                <div className="space-y-4 text-[14px] leading-[1.75] text-[#0B1F33]/64">
                  <p>
                    Downtown Perks works because it meets people while they are already downtown and deciding where to go, what to do, or where they might want to live.
                  </p>
                  <p>
                    The map keeps the nearby options close to the decision, so residents get a cleaner plan and partners can see what actually helped someone show up.
                  </p>
                </div>
              </section>

              <section className="py-9">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1F33]/50">Who it serves</span>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {audiences.map((audience) => {
                    const Icon = audience.icon;
                    return (
                      <motion.article
                        key={audience.title}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.22, ease }}
                        className="dp-glass-card p-5"
                      >
                        <div className="mb-4 flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#C8A96A]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3 className="font-body text-[14px] font-semibold text-[#0B1F33]">{audience.title}</h3>
                        </div>
                        <p className="text-[13px] leading-relaxed text-[#0B1F33]/72">{audience.gain}</p>
                        <p className="mt-3 text-[12px] leading-relaxed text-[#0B1F33]/58">{audience.use}</p>
                        <p className="mt-3 border-t border-white/50 pt-3 text-[12px] leading-relaxed text-[#0B1F33]/58">{audience.why}</p>
                      </motion.article>
                    );
                  })}
                </div>
              </section>

              <section className="border-y border-white/44 py-9">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1F33]/50">How it works</span>
                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  {steps.map((step, index) => (
                    <div key={step} className="relative border border-white/44 bg-white/42 p-5 backdrop-blur-[20px]">
                      <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
                        0{index + 1}
                      </div>
                      <p className="text-[13px] font-medium leading-relaxed text-[#0B1F33]">{step}</p>
                      {index < steps.length - 1 && (
                        <div className="absolute right-0 top-1/2 hidden h-px w-8 translate-x-1/2 bg-[#0B1F33]/16 md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-6 pt-9 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <h2 className="font-heading text-3xl font-medium leading-tight text-[#0B1F33]">
                    One map for using downtown.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[14px] leading-[1.75] text-[#0B1F33]/64">
                    Downtown Perks connects residents, real estate, local businesses, and the places people actually spend time.
                  </p>
                </div>
                <div className="hidden gap-3 md:flex">
                  <GlassButton to="/map?mode=resident&tab=map" onClick={onClose}>Open the Map</GlassButton>
                  <GlassButton to="/partners/campaigns" variant="secondary" onClick={onClose}>Campaigns</GlassButton>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 z-20 grid grid-cols-2 gap-2 border-t border-white/44 bg-white/42 p-3 backdrop-blur-[24px] md:hidden">
              <GlassButton to="/map?mode=resident&tab=map" onClick={onClose}>Open the Map</GlassButton>
              <GlassButton to="/partners/campaigns" variant="secondary" onClick={onClose}>Campaigns</GlassButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
