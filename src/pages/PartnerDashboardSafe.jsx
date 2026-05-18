import { Link } from "react-router-dom";

const metrics = [
  { label: "Map views", value: "12,440", note: "+18% this week" },
  { label: "Saves", value: "712", note: "Nearby intent captured" },
  { label: "Visits", value: "289", note: "From map to door" },
  { label: "Redemptions", value: "96", note: "Offer actions used" },
];

const activity = [
  { query: "coffee near Seaholm", match: "Merit Coffee", outcome: "0.2 mi · offer opened" },
  { query: "dinner near Rainey", match: "Banger's", outcome: "saved by nearby resident" },
  { query: "wellness near Congress", match: "Equinox", outcome: "first class offer viewed" },
  { query: "where should I meet someone", match: "Half Step", outcome: "happy hour trigger active" },
];

const tabs = [
  ["Overview", "/partners/dashboard"],
  ["Map", "/partners/dashboard/map"],
  ["Venues", "/partners/dashboard/venues"],
  ["Redemptions", "/partners/dashboard/redemptions"],
  ["Workspace", "/partner-workspace"],
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PartnerDashboardSafe() {
  return (
    <main className="pearl-page min-h-screen pt-[68px]">
      <section className="px-4 py-6 md:px-6">
        <div className="dp-page-shell">
          <div className="pearl-navy-block rounded-[28px] p-6 md:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Partner dashboard</p>
              <h1 className="dp-display-hero mt-3 text-white">See what’s working downtown right now.</h1>
              <p className="dp-page-intro mt-3 text-white/78">
                Track map views, saves, visits, and redemptions without losing the neighborhood context behind each action.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/partner-workspace" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                Manage offers <Arrow />
              </Link>
              <Link to="/partners" className="dp-cta-secondary border-white/20 text-white hover:bg-white/10">
                Partner overview
              </Link>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Partner dashboard sections">
            {tabs.map(([label, href]) => (
              <Link key={href} to={href} className="dp-chip shrink-0 text-xs">
                {label}
              </Link>
            ))}
          </nav>

          <section className="mt-6 grid gap-3 md:grid-cols-4">
            {metrics.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-white/72 p-5 shadow-[0_18px_60px_rgba(7,27,47,0.08)] ring-1 ring-[rgba(7,27,47,0.08)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dp-slate)]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--dp-navy)]">{item.value}</p>
                <p className="mt-2 text-sm text-[var(--dp-slate)]">{item.note}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[28px] bg-white/72 p-5 shadow-[0_24px_80px_rgba(7,27,47,0.08)] ring-1 ring-[rgba(7,27,47,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold)]">Live intent</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--dp-navy)]">Decision moments happening now</h2>
                </div>
                <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-3 py-1 text-xs font-semibold text-[var(--dp-navy)]">Updated 2 min ago</span>
              </div>

              <div className="mt-5 divide-y divide-[rgba(7,27,47,0.08)]">
                {activity.map((item) => (
                  <div key={item.query} className="grid gap-2 py-4 md:grid-cols-[1fr_1fr_1fr] md:items-center">
                    <p className="text-sm font-medium text-[var(--dp-navy)]">“{item.query}”</p>
                    <p className="text-sm text-[var(--dp-ink)]">{item.match}</p>
                    <p className="text-sm text-[var(--dp-slate)]">{item.outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] bg-[linear-gradient(145deg,#ffffff,#f4f7fb)] p-5 shadow-[0_24px_80px_rgba(7,27,47,0.08)] ring-1 ring-[rgba(7,27,47,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--dp-slate)]">Route recovered</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--dp-navy)]">This page now has a safe render path.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--dp-slate)]">
                The dashboard is intentionally using static fallback data here so the route renders even if a live map, auth state, or partner data feed fails.
              </p>
              <div className="mt-5 space-y-2 text-sm text-[var(--dp-ink)]">
                <p>• No blank screen on route load</p>
                <p>• No external data dependency before first paint</p>
                <p>• Clear path back to workspace and partner overview</p>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
