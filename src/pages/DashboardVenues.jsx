import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  LineChart,
  MapPinned,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";

const LENS_LINKS = [
  { label: "Overview", href: "/partners/dashboard" },
  { label: "Map", href: "/partners/dashboard/map" },
  { label: "Partner", href: "/partners/dashboard/venues" },
  { label: "Redemptions", href: "/partners/dashboard/redemptions" },
  { label: "Integrations", href: "/partners/dashboard/integrations" },
  { label: "About", href: "/partners/dashboard/about" },
];

const KPI_STRIP = [
  { label: "Total scans", value: "2,875", note: "all time", icon: Sparkles },
  { label: "Conversion", value: "63%", note: "map to visit", icon: LineChart },
  { label: "Redemptions", value: "1,823", note: "tracked completions", icon: Calendar },
  { label: "Events live", value: "6", note: "currently visible", icon: Store },
  { label: "Active members", value: "20", note: "venue network", icon: Users },
  { label: "Partner locations", value: "20", note: "currently plotted", icon: MapPinned },
];

const PERFORMANCE_TABS = [
  "Overview",
  "Visibility",
  "Conversion",
  "Perks",
  "Audience",
  "Events",
  "Actions",
];

const LIVE_ACTIVITY = [
  { label: "Peak window tonight", value: "6:30-8:00pm", note: "highest nearby demand window" },
  { label: "Recent redemptions", value: "3", note: "latest at Le Cafe Crepe" },
  { label: "Event response", value: "84 RSVPs", note: "for Rainey Street Food + Drink Loop" },
  { label: "Venue capacity", value: "56%", note: "at Banger's Sausage House & Beer Garden" },
];

const STORY_CARDS = [
  {
    eyebrow: "Live",
    title: "Le Cafe Crepe leading redemptions",
    body: "301 redemptions from 412 scans. The venue is converting attention into foot traffic without forcing people through extra friction.",
  },
  {
    eyebrow: "Trending",
    title: "2,875 total scans across 20 venues",
    body: "1,823 converted to visits. Nearby intent is measurable when the venue is visible at the exact moment someone is deciding where to go.",
  },
  {
    eyebrow: "All time",
    title: "Measurable movement from downtown",
    body: "This is how venue performance should read: nearby discovery, real saves, tracked redemptions, and daily movement tied back to the map.",
  },
];

export default function DashboardVenues() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell space-y-4">
          <div className="dp-stage-dark overflow-hidden p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-4xl">
                <div className="dp-kicker">Live venue intelligence</div>
                <h1 className="dp-display-hero mt-5 text-[2.6rem] text-white md:text-[4.2rem]">
                  Visible at the exact moment someone nearby decides where to go.
                </h1>
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-white/72">
                  Track how nearby people discover your venue, save your deals, and walk through the door - from map impression to the chair they sit in.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to="/resident-app" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  View Resident App
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/" className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Downtown Perks Home
                </Link>
              </div>
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
              {LENS_LINKS.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`inline-flex min-h-[38px] items-center rounded-[14px] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-all ${
                    item.label === "Partner"
                      ? "bg-white text-[var(--dp-navy)]"
                      : "bg-white/10 text-white/74 hover:bg-white/14 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="dp-band p-6 md:p-8">
            <div className="max-w-4xl">
              <div className="dp-micro-label">Venue performance</div>
              <h2 className="dp-display-section mt-4 text-[2rem] md:text-[2.8rem]">
                Measurable movement from downtown.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                This is how your venue performs when people are deciding where to go. Nearby discovery, saves, visits, events, and redemptions all live in one operating layer.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {KPI_STRIP.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-[22px] bg-white/84 p-4 shadow-[0_14px_28px_rgba(11,31,51,0.05)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      {item.label}
                    </div>
                    <Icon className="h-4 w-4 text-[var(--dp-gold-muted)]" />
                  </div>
                  <div className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="dp-band p-6 md:p-8">
            <div className="dp-micro-label">Overview</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PERFORMANCE_TABS.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full px-3 py-2 text-[12px] font-medium transition-all ${
                    index === 0 ? "bg-[var(--dp-navy)] text-white" : "bg-[rgba(11,31,51,0.05)] text-foreground/72"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                Live activity
              </div>
              <h3 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.04em] text-foreground">
                Here's what's happening nearby right now.
              </h3>
              <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                See what people around you are looking for, where they're headed, and which perks are getting the most attention.
              </p>

              <div className="mt-6 space-y-3">
                {LIVE_ACTIVITY.map((item) => (
                  <div key={item.label} className="rounded-[18px] bg-[rgba(11,31,51,0.04)] px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="mt-1 text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {STORY_CARDS.map((card) => (
              <div key={card.title} className="dp-card p-6">
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                  {card.eyebrow}
                </div>
                <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
                  {card.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType="venue"
        title="Venue visibility, conversion, perks, audience, and events in one map."
        description="Use the map to see where nearby demand is building, which perks are converting, what events are driving movement, and what your venue should do next."
      />
    </div>
  );
}
