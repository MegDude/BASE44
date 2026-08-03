import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
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

const primaryFeatureTitles = new Set(["Resident Map", "Perks Card", "Homes Nearby", "Local Offers", "Ask The Map", "Events"]);
const displayTitle = (title: string) => {
  if (title === "Simple Updates") return "Partner Updates";
  if (title === "Local Notes") return "Saved Notes";
  return title;
};

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
            className="dp-info-panel relative z-10 mx-auto flex h-[88dvh] max-h-[88dvh] w-[calc(100vw-24px)] max-w-[720px] flex-col overflow-hidden rounded-[22px] bg-white text-[#0B1F33] shadow-[0_24px_80px_rgba(11,31,51,0.22)] outline-none md:h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-4rem)] md:w-[min(920px,calc(100vw-48px))] md:max-w-5xl md:rounded-[26px]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration, ease }}
          >
<header className="sticky top-0 z-20 grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 border-b border-[#0B1F33]/8 bg-white/92 px-4 backdrop-blur-xl">
<button type="button" onClick={onClose} className="dp-modal-back inline-flex h-11 w-11 items-center justify-center" aria-label="Back from Downtown Perks overview">
<ArrowLeft className="h-4 w-4" />
</button>
<p className="dp-modal-kicker text-center dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">How Downtown Perks works</p>
              <button
                type="button"
                onClick={onClose}
                className="dp-modal-close inline-flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 md:px-8 md:pb-8 md:pt-8">
              <section className="dp-overview-hero">
                <div>
                  <span>Downtown Perks</span>
                  <h1 id="about-dp-title">The neighborhood, finally connected.</h1>
                  <p>Find nearby places, perks, events, listings, and local help without bouncing between different apps.</p>
                  <div className="dp-overview-actions">
                    <GlassButton to="/map?mode=resident&tab=map" onClick={onClose}>Open the Map</GlassButton>
                    <GlassButton to="/map?mode=partner&tab=map&filter=All" variant="secondary" onClick={onClose}>Partner View</GlassButton>
                  </div>
                </div>
              </section>

              <section className="dp-overview-value-grid">
                {[
                  ["Nearby", "Places, events, and services close enough to use now."],
                  ["Perks", "Resident offers from spots people already visit."],
                  ["Homes", "Listings shown with what is walkable nearby."],
                  ["Ready", "Saves, RSVPs, scans, and next steps in one place."],
                ].map(([label, body]) => (
                  <article key={label}>
                    <strong>{label}</strong>
                    <p>{body}</p>
                  </article>
                ))}
              </section>

              <section className="dp-overview-section">
                <span className="dp-section-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">What it does</span>
                <h2>One map for everyday downtown decisions.</h2>
                <div className="dp-overview-feature-grid">
                  {features.filter((feature) => primaryFeatureTitles.has(feature.title)).map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <article key={feature.title} className="dp-overview-feature-card">
                        <div className="icon">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3>{displayTitle(feature.title)}</h3>
                          <p>{feature.body}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="dp-overview-chip-row">
                  {features.filter((feature) => !primaryFeatureTitles.has(feature.title)).map((feature) => (
                    <span key={feature.title}>{displayTitle(feature.title)}</span>
                  ))}
                </div>
              </section>

              <section className="dp-overview-section">
                <span className="dp-section-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Built for the people using downtown.</span>
                <div className="dp-audience-list">
                  {audiences.map((audience) => {
                    const Icon = audience.icon;
                    return (
                      <details key={audience.title} open={["Residents", "Properties", "Local Businesses", "Hotels"].includes(audience.title)}>
                        <summary>
                          <span className="icon">
                            <Icon className="h-4 w-4" />
                          </span>
                          <h3>{audience.title}</h3>
                        </summary>
                        <p>{audience.gain} {audience.use}</p>
                      </details>
                    );
                  })}
                </div>
              </section>

              <section className="dp-overview-section">
                <span className="dp-section-eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">How it works</span>
                <ol className="dp-overview-steps">
                  {steps.map((step, index) => (
                    <li key={step}><span>0{index + 1}</span><p>{step}</p></li>
                  ))}
                </ol>
              </section>

              <section className="dp-overview-section dp-overview-final">
                <div>
                  <h2>Useful before the plan is decided.</h2>
                  <p>Downtown Perks keeps nearby options close to the decision, so residents get a cleaner plan and partners can see what helped people show up.</p>
                </div>
              </section>
            </div>

            <footer className="dp-overview-sticky-cta">
              <GlassButton to="/map?mode=resident&tab=map" onClick={onClose}>Open the Map</GlassButton>
              <GlassButton to="/partners/campaigns" variant="secondary" onClick={onClose}>Campaigns</GlassButton>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
