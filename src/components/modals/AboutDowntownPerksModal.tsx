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
  { icon: Map, title: "Resident Map", body: "A live map for what is nearby, useful, open, and relevant right now." },
  { icon: CreditCard, title: "Digital Perks Card", body: "A clean resident access layer for saving, redeeming, and showing eligibility." },
  { icon: Building2, title: "Property Discovery", body: "Buildings and listings gain neighborhood context instead of standing alone." },
  { icon: Megaphone, title: "Local Campaigns", body: "Partners can place offers and moments where downtown decisions happen." },
  { icon: Users, title: "Building Engagement", body: "Residential teams can connect residents to local routines and events." },
  { icon: BarChart3, title: "Simple Reports", body: "Scans, saves, RSVPs, and redemptions show what people actually used." },
  { icon: Search, title: "Resident Directory", body: "Useful local surfaces help residents orient without another disconnected app." },
  { icon: CalendarDays, title: "Event Discovery", body: "Events appear in the same map context as places, perks, and buildings." },
  { icon: QrCode, title: "QR Redemption Flow", body: "QR entry points connect real-world surfaces to measurable local behavior." },
  { icon: Sparkles, title: "Useful Neighborhood Notes", body: "The map shows which places, buildings, and moments are getting people to show up." },
];

const audiences = [
  {
    icon: Users,
    title: "Residents",
    gain: "A simpler way to understand what is nearby.",
    use: "They search, save, redeem, RSVP, and return to places that fit their day.",
    why: "It turns downtown from scattered options into a usable local layer.",
  },
  {
    icon: Building2,
    title: "Properties",
    gain: "A stronger amenity and clearer neighborhood story.",
    use: "Teams use QR access, map placement, and activity signals around the building.",
    why: "It helps residents and prospects see the value around an address.",
  },
  {
    icon: Landmark,
    title: "Brokerages",
    gain: "More context around listings and client decisions.",
    use: "Agents show walkable routines, favorite local spots, and nearby activity alongside properties.",
    why: "Neighborhood confidence is often what turns interest into action.",
  },
  {
    icon: Store,
    title: "Local Businesses",
    gain: "Visibility when people nearby are choosing where to go.",
    use: "Venues publish offers, events, and map presence tied to proximity.",
    why: "It connects attention to real-world visits instead of broad impressions.",
  },
  {
    icon: Hotel,
    title: "Hotels",
    gain: "A live local guide guests can open instantly.",
    use: "Hotels place QR access in rooms, lobbies, and concierge workflows.",
    why: "It extends the stay into the neighborhood without adding staff burden.",
  },
  {
    icon: Megaphone,
    title: "Brands",
    gain: "Campaign placement inside real downtown behavior.",
    use: "Brands activate by district, building, venue, event, or resident source.",
    why: "Context and timing outperform generic reach.",
  },
  {
    icon: Landmark,
    title: "Downtown Organizations",
    gain: "A practical way to make participation visible.",
    use: "Districts surface public events, wayfinding, civic moments, and activity.",
    why: "People show up more when local information is easy to find and act on.",
  },
];

const steps = [
  "Open the map",
  "Discover nearby places, events, perks, and listings",
  "Save or redeem through the perks card",
  "Partners track engagement and activity through the dashboard",
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
      ? "inline-flex h-10 items-center justify-center bg-[#0B1F33] px-5 text-[13px] font-medium text-white shadow-[0_12px_26px_rgba(11,31,51,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#081521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
      : "inline-flex h-10 items-center justify-center border border-[rgba(11,31,51,0.08)] bg-[rgba(255,255,255,0.58)] px-5 text-[13px] font-medium text-[#0B1F33] backdrop-blur-[20px] transition-all hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]";

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
            className="dp-glass-modal relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[18px] text-[#0B1F33] outline-none md:max-h-[88vh] md:max-w-6xl md:rounded-[10px]"
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
                className="inline-flex h-9 items-center gap-1.5 border border-[rgba(11,31,51,0.08)] bg-white/58 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/68 transition-colors hover:bg-white hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
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
                className="inline-flex h-9 w-9 items-center justify-center border border-[rgba(11,31,51,0.08)] bg-white/58 text-[#0B1F33] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 pb-28 pt-6 md:px-5 md:pb-7 md:pt-8">
              <section className="grid gap-7 border-b border-white/44 pb-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                <div>
                  <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.18em] text-[#B38F4F]">
                    Downtown Perks
                  </span>
                  <h1 id="about-dp-title" className="font-heading text-4xl font-medium leading-[1.02] text-[#0B1F33] md:text-4xl">
                    The neighborhood, finally connected.
                  </h1>
                  <p className="mt-5 max-w-2xl text-[16px] leading-[1.7] text-[#0B1F33]/72">
                    Downtown Perks brings residents, buildings, local businesses, events, and property discovery into one intelligent map-based experience.
                  </p>
                  <p className="mt-4 max-w-2xl text-[14px] leading-[1.75] text-[#0B1F33]/58">
                    Instead of forcing people to search across apps, tabs, websites, social feeds, and listing platforms, Downtown Perks creates one clear layer for discovering what matters nearby.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <GlassButton to="/map" onClick={onClose}>Explore the Map</GlassButton>
                    <GlassButton to="/partners" variant="secondary" onClick={onClose}>Partner With Us</GlassButton>
                  </div>
                </div>

                <div className="dp-glass-card p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Nearby", "Places, events, and services close enough to use now."],
                      ["Perks", "Resident offers from spots people already visit."],
                      ["Homes", "Buildings and listings shown with what is walkable nearby."],
                      ["Live", "Fresh signals from saves, scans, RSVPs, and map activity."],
                    ].map(([label, body]) => (
                      <div key={label} className="border border-white/42 bg-white/34 p-2.5 shadow-[0_8px_18px_rgba(11,31,51,0.04)]">
                        <div className="text-[13px] font-semibold text-[#0B1F33]">{label}</div>
                        <div className="mt-1 text-[10.5px] leading-4 text-[#0B1F33]/58">{body}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-[#0B1F33]/58">
                    Map-first context for real-world decisions: where to go, what to use, what to join, and where downtown activity is forming.
                  </p>
                </div>
              </section>

              <section className="py-9">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B1F33]/50">What it does</span>
                    <h2 className="mt-2 font-heading text-3xl font-medium text-[#0B1F33]">One operating layer, many surfaces.</h2>
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
                        <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#B38F4F]">
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
                  Visibility at the moment of decision.
                </h2>
                <div className="space-y-4 text-[14px] leading-[1.75] text-[#0B1F33]/64">
                  <p>
                    Downtown Perks works because it connects people to places while they are already downtown and actively deciding where to go, what to do, or where to live.
                  </p>
                  <p>
                    Proximity, timing, local context, and resident behavior are treated as one system. That makes the map useful for residents and measurable for partners without turning the experience into a coupon wall or generic dashboard.
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
                          <span className="flex h-9 w-9 items-center justify-center bg-[#0B1F33] text-[#B38F4F]">
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
                      <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F]">
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
                    One map for the downtown experience.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[14px] leading-[1.75] text-[#0B1F33]/64">
                    Downtown Perks creates a cleaner connection between residents, real estate, local businesses, and the places people actually spend time.
                  </p>
                </div>
                <div className="hidden gap-3 md:flex">
                  <GlassButton to="/map" onClick={onClose}>Open the Live Map</GlassButton>
                  <GlassButton to="/partners#get-started" variant="secondary" onClick={onClose}>Book a Walkthrough</GlassButton>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 z-20 grid grid-cols-2 gap-2 border-t border-white/44 bg-white/42 p-3 backdrop-blur-[24px] md:hidden">
              <GlassButton to="/map" onClick={onClose}>Open the Live Map</GlassButton>
              <GlassButton to="/partners#get-started" variant="secondary" onClick={onClose}>Book a Walkthrough</GlassButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
