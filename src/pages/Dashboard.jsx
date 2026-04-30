import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

const TABS = [
  { label: "Overview", href: ROUTES.partnerDashboard || "/partners/dashboard" },
  { label: "Map", href: "/partners/dashboard/map" },
  { label: "Properties", href: ROUTES.partnerDashboardResidential || "/partners/dashboard/residential" },
  { label: "Hospitality", href: ROUTES.partnerDashboardHospitality || "/partners/dashboard/hospitality" },
  { label: "Venues", href: ROUTES.partnerDashboardVenues || "/partners/dashboard/venues" },
  { label: "Brands", href: ROUTES.partnerDashboardBrands || "/partners/dashboard/brands" },
  { label: "Civic", href: ROUTES.partnerDashboardCivic || "/partners/dashboard/civic" },
  { label: "Redemptions", href: "/partners/dashboard/redemptions" },
  { label: "Workspace", href: ROUTES.partnerWorkspace || "/partner-workspace" },
];

const VARIANTS = {
  dashboard: {
    eyebrow: "Partner intelligence",
    title: "See what’s working downtown right now.",
    description:
      "A map-first operating view for partner activity, nearby intent, offer performance, and neighborhood movement.",
    focus: "All partners",
  },
  residential: {
    eyebrow: "Property intelligence",
    title: "See resident activity around the building.",
    description:
      "Understand where residents go, what they save, and which nearby partners make the property feel more useful.",
    focus: "Properties",
  },
  hospitality: {
    eyebrow: "Hospitality intelligence",
    title: "See guest activity after arrival.",
    description:
      "Track where guests are searching, saving, and moving once they are already downtown.",
    focus: "Hotels",
  },
  venues: {
    eyebrow: "Venue intelligence",
    title: "See what is bringing people in.",
    description:
      "Monitor nearby searches, offer opens, saves, visits, and redemptions from the moment intent forms.",
    focus: "Venues",
  },
  brands: {
    eyebrow: "Brand intelligence",
    title: "See where campaigns are working.",
    description:
      "Connect local brand visibility to neighborhood behavior, venue activity, and measurable campaign signals.",
    focus: "Brands",
  },
  civic: {
    eyebrow: "Civic intelligence",
    title: "See where downtown is active.",
    description:
      "Read district activity by corridor, event window, partner type, and repeat local movement.",
    focus: "Civic",
  },
};

const METRICS = [
  { label: "Map views", value: "12,440", delta: "+18%", note: "Visibility from nearby searches" },
  { label: "Saves", value: "712", delta: "+11%", note: "Intent captured before arrival" },
  { label: "Visits", value: "289", delta: "+9%", note: "Map-to-door actions" },
  { label: "Redemptions", value: "96", delta: "+7%", note: "Offers used on site" },
];

const INTENT = [
  { query: "coffee near Seaholm", match: "Merit Coffee", type: "Offer opened", walk: "0.2 mi", score: 92 },
  { query: "dinner near Rainey", match: "Banger's", type: "Saved nearby", walk: "0.4 mi", score: 86 },
  { query: "wellness near Congress", match: "Equinox", type: "Trial viewed", walk: "0.5 mi", score: 79 },
  { query: "where should I meet someone", match: "Half Step", type: "Happy hour active", walk: "0.3 mi", score: 74 },
];

const PINS = [
  { name: "Half Step", x: 66, y: 58, category: "Venue", signal: "+18%", tone: "gold" },
  { name: "Banger's", x: 76, y: 66, category: "Venue", signal: "Offer", tone: "navy" },
  { name: "Merit Coffee", x: 38, y: 44, category: "Coffee", signal: "Save", tone: "gold" },
  { name: "The Paseo", x: 52, y: 34, category: "Property", signal: "Residents", tone: "navy" },
  { name: "Equinox", x: 44, y: 62, category: "Wellness", signal: "Trial", tone: "gold" },
  { name: "Hotel Van Zandt", x: 70, y: 42, category: "Hospitality", signal: "Guests", tone: "navy" },
];

const OPERATIONS = [
  ["High-intent corridor", "Rainey + Seaholm", "Push venue offers during event windows."],
  ["Best conversion lever", "Saved nearby", "Shorten offer copy and keep directions visible."],
  ["Partner opportunity", "Properties", "Package resident perks around 6-minute walks."],
];

function getVariant(pathname) {
  if (pathname.includes("residential") || pathname.includes("properties")) return "residential";
  if (pathname.includes("hospitality") || pathname.includes("hotels")) return "hospitality";
  if (pathname.includes("venues")) return "venues";
  if (pathname.includes("brands")) return "brands";
  if (pathname.includes("civic")) return "civic";
  return "dashboard";
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardHero({ variant }) {
  return (
    <section className="px-4 pt-6 md:px-6">
      <div className="dp-page-shell">
        <div className="pearl-navy-block overflow-hidden rounded-[30px] p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/58">{variant.eyebrow}</p>
              <h1 className="dp-display-hero mt-3 max-w-3xl text-white">{variant.title}</h1>
              <p className="dp-page-intro mt-4 max-w-2xl text-white/76">{variant.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/partner-workspace" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Manage offers <Arrow />
                </Link>
                <Link to="/partners" className="dp-cta-secondary border-white/20 text-white hover:bg-white/10">
                  Partner overview
                </Link>
              </div>
            </div>
            <div className="rounded-[24px] border border-white/12 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Current focus</p>
              <p className="mt-2 text-2xl font-semibold text-white">{variant.focus}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-white">
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-semibold">24</p><p className="text-[11px] text-white/58">Live</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-semibold">402</p><p className="text-[11px] text-white/58">Searches</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-xl font-semibold">6m</p><p className="text-[11px] text-white/58">Walk</p></div>
              </div>
            </div>
          </div>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Partner dashboard sections">
          {TABS.map((tab) => (
            <Link key={tab.href} to={tab.href} className="dp-chip shrink-0 text-xs">
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

function MetricsStrip() {
  return (
    <section className="px-4 pt-5 md:px-6">
      <div className="dp-page-shell grid gap-3 md:grid-cols-4">
        {METRICS.map((metric) => (
          <article key={metric.label} className="rounded-[24px] bg-white/74 p-5 shadow-[0_20px_70px_rgba(7,27,47,0.08)] ring-1 ring-[rgba(7,27,47,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dp-slate)]">{metric.label}</p>
              <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-2.5 py-1 text-xs font-semibold text-[var(--dp-navy)]">{metric.delta}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-[var(--dp-navy)]">{metric.value}</p>
            <p className="mt-2 text-sm text-[var(--dp-slate)]">{metric.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MapStage() {
  return (
    <section className="px-4 pt-6 md:px-6">
      <div className="dp-page-shell grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#ffffff,#f4f7fb)] p-4 shadow-[0_24px_90px_rgba(7,27,47,0.1)] ring-1 ring-[rgba(7,27,47,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4 px-1 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold)]">Live map layer</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--dp-navy)]">Partner activity by place, trigger, and walk time.</h2>
            </div>
            <div className="flex gap-2 text-xs text-[var(--dp-slate)]">
              <span className="dp-chip">Offers</span>
              <span className="dp-chip">Events</span>
              <span className="dp-chip">Walkable</span>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_30%_20%,rgba(207,175,90,0.22),transparent_22%),linear-gradient(135deg,#e9edf3,#f8fafc)]">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(rgba(7,27,47,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(7,27,47,0.08) 1px, transparent 1px)", backgroundSize: "54px 54px" }} />
            <div className="absolute left-[10%] top-[18%] h-[70%] w-[78%] rounded-[50%] border border-[rgba(7,27,47,0.10)]" />
            <div className="absolute left-[24%] top-[30%] h-[44%] w-[52%] rounded-[50%] border border-[rgba(207,175,90,0.32)]" />
            {PINS.map((pin) => (
              <div key={pin.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
                <div className={pin.tone === "gold" ? "bg-[var(--dp-gold)] text-[var(--dp-navy)]" : "bg-[var(--dp-navy)] text-white" + " relative flex h-10 w-10 items-center justify-center rounded-full shadow-[0_16px_34px_rgba(7,27,47,0.24)] ring-4 ring-white/70"}>
                  <span className="text-xs font-bold">{pin.name.charAt(0)}</span>
                </div>
                <div className="mt-2 min-w-[128px] rounded-2xl bg-white/86 px-3 py-2 text-xs shadow-[0_12px_30px_rgba(7,27,47,0.12)] ring-1 ring-[rgba(7,27,47,0.08)] backdrop-blur">
                  <p className="font-semibold text-[var(--dp-navy)]">{pin.name}</p>
                  <p className="text-[var(--dp-slate)]">{pin.category} · {pin.signal}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-[32px] bg-white/74 p-5 shadow-[0_24px_90px_rgba(7,27,47,0.08)] ring-1 ring-[rgba(7,27,47,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold)]">Decision feed</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--dp-navy)]">Intent becoming action.</h2>
          <div className="mt-5 space-y-3">
            {INTENT.map((item) => (
              <div key={item.query} className="rounded-[22px] bg-[rgba(247,248,251,0.78)] p-4 ring-1 ring-[rgba(7,27,47,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--dp-navy)]">“{item.query}”</p>
                  <span className="text-xs font-semibold text-[var(--dp-gold)]">{item.score}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--dp-ink)]">{item.match}</p>
                <p className="mt-1 text-xs text-[var(--dp-slate)]">{item.walk} · {item.type}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function OperationsPanel() {
  return (
    <section className="px-4 py-6 md:px-6">
      <div className="dp-page-shell rounded-[32px] bg-white/68 p-5 shadow-[0_24px_80px_rgba(7,27,47,0.07)] ring-1 ring-[rgba(7,27,47,0.08)] md:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold)]">Operator view</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--dp-navy)]">What to do next.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--dp-slate)]">
              The dashboard is built to create decisions, not decoration. Each signal translates into an operational next step.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {OPERATIONS.map(([label, value, action]) => (
              <article key={label} className="rounded-[24px] bg-white/78 p-4 ring-1 ring-[rgba(7,27,47,0.07)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dp-slate)]">{label}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--dp-navy)]">{value}</p>
                <p className="mt-2 text-sm leading-5 text-[var(--dp-slate)]">{action}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const variant = VARIANTS[getVariant(location.pathname)] || VARIANTS.dashboard;

  return (
    <main className="pearl-page min-h-screen pt-[68px]">
      <DashboardHero variant={variant} />
      <MetricsStrip />
      <MapStage />
      <OperationsPanel />
    </main>
  );
}
