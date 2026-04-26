import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import { ROUTES } from "@/lib/routes";

const LENS_LINKS = [
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

const DASHBOARD_VARIANTS = {
  dashboard: {
    kicker: "Partner intelligence",
    title: "Ask the map. Get the answer.",
    body: "Use one question, a few small controls, and the live downtown layer.",
    mapTitle: "Ask what you want to know, see, or do.",
    mapDescription: "The map answers back with the clearest current signal.",
    partnerType: "dashboard",
  },
  residential: {
    kicker: "Property intelligence",
    title: "Ask what residents are actually using.",
    body: "Use the map to see where activity is building and what the property should do next.",
    mapTitle: "Ask what residents are using, seeing, or doing nearby.",
    mapDescription: "The map returns the clearest resident-behavior answer.",
    partnerType: "property",
  },
  hospitality: {
    kicker: "Hospitality intelligence",
    title: "Ask where guests go after they arrive.",
    body: "Use the map to see guest movement, nearby intent, and what is converting best.",
    mapTitle: "Ask what guests are doing, seeing, or choosing nearby.",
    mapDescription: "The map returns the clearest guest-movement answer.",
    partnerType: "hospitality",
  },
  venues: {
    kicker: "Venue intelligence",
    title: "Ask what is actually bringing people in.",
    body: "Use the map to see nearby intent, offer performance, and what to do next.",
    mapTitle: "Ask what is driving venue performance right now.",
    mapDescription: "The map returns the clearest venue-performance answer.",
    partnerType: "venue",
  },
  brands: {
    kicker: "Brand intelligence",
    title: "Ask which placements are actually working.",
    body: "Use the map to see which district, building, venue, or event source is driving response.",
    mapTitle: "Ask where the campaign is working and what to adjust next.",
    mapDescription: "The map returns the clearest campaign answer.",
    partnerType: "brand",
  },
  civic: {
    kicker: "Civic intelligence",
    title: "Ask where district activity is actually building.",
    body: "Use the map to see what is drawing attention and where downtown needs more support.",
    mapTitle: "Ask what the district needs to see, support, or strengthen next.",
    mapDescription: "The map returns the clearest district answer.",
    partnerType: "civic",
  },
};

function getDashboardVariant(pathname) {
  if (pathname.includes("/partners/dashboard/residential")) return "residential";
  if (pathname.includes("/partners/dashboard/hospitality")) return "hospitality";
  if (pathname.includes("/partners/dashboard/venues")) return "venues";
  if (pathname.includes("/partners/dashboard/brands")) return "brands";
  if (pathname.includes("/partners/dashboard/civic")) return "civic";
  return "dashboard";
}

export default function Dashboard() {
  const location = useLocation();
  const variantKey = getDashboardVariant(location.pathname);
  const variant = DASHBOARD_VARIANTS[variantKey];
  const [liveSummary, setLiveSummary] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/partner-insights")
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok) return;
        setLiveSummary(payload.summary || null);
      })
      .catch(() => {
        if (active) setLiveSummary(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          <div className="overflow-hidden rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white shadow-[0_20px_48px_rgba(11,31,51,0.16)] md:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <div className="dp-kicker">{variant.kicker}</div>
                <h1 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-[3rem]">
                  {variant.title}
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/72">
                  {variant.body}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to="/downtown-perks/explore" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Open map
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/partners" className="dp-cta-secondary border-white/12 bg-white/10 text-white">
                  Partner overview
                </Link>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {LENS_LINKS.map((item, index) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`inline-flex min-h-[38px] items-center rounded-[14px] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap transition-all ${
                    location.pathname === item.href || (index === 0 && location.pathname === ROUTES.partnerDashboard)
                      ? "bg-white text-[var(--dp-navy)]"
                      : "bg-white/10 text-white/74 hover:bg-white/14 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {liveSummary && (
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {[
                  { label: "Shown today", value: Number(liveSummary.shown || 0).toLocaleString() },
                  { label: "Saved", value: Number(liveSummary.saves || 0).toLocaleString() },
                  { label: "Visits", value: Number(liveSummary.visits || 0).toLocaleString() },
                  { label: "Redemptions", value: `${Number(liveSummary.redemptions || 0).toLocaleString()} -> $${(Number(liveSummary.revenueCents || 0) / 100).toLocaleString()}` },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-white">{metric.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <PartnerInsightMap
        partnerType={variant.partnerType}
        title={variant.mapTitle}
        description={variant.mapDescription}
      />
    </div>
  );
}
