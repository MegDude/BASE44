import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerStoryCarousel from "@/components/partner/PartnerStoryCarousel";
import { PARTNER_TYPE_CONTENT } from "@/lib/partnerContent";
import { ROUTES } from "@/lib/routes";

const DASHBOARD_TABS = [
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
    kicker: "Partner dashboard",
    title: "See what’s working downtown right now.",
    body: "Track visits, saves, check-ins, perks used, active offers, and event activity from the same map residents use to decide where to go.",
    mapTitle: "Downtown activity, shown clearly.",
    mapDescription: "Ask a question or use filters to see where people are going, what they are saving, and which offers are being used.",
    partnerType: "dashboard",
  },
  residential: {
    kicker: "Property dashboard",
    title: "See what residents are using nearby.",
    body: "Track nearby visits, saves, check-ins, perks used, and event activity around the building so the neighborhood becomes a measurable resident amenity.",
    mapTitle: "Resident activity around the building.",
    mapDescription: "See what residents are saving, where they are going, and which nearby offers are being used.",
    partnerType: "property",
  },
  hospitality: {
    kicker: "Hospitality dashboard",
    title: "See where guests go after they arrive.",
    body: "Track nearby dining, events, offers, and guest-ready activity so hotels can extend the stay into the downtown around them.",
    mapTitle: "Guest activity, shown clearly.",
    mapDescription: "See which places guests are choosing nearby and which offers or events are helping them move through downtown.",
    partnerType: "hospitality",
  },
  venues: {
    kicker: "Venue dashboard",
    title: "See what is bringing people in.",
    body: "Track visits, saves, check-ins, active offers, and nearby events so venue teams can see what is working and what to update next.",
    mapTitle: "Venue performance, shown clearly.",
    mapDescription: "See which offers are being used, which nearby events matter, and where activity is strongest right now.",
    partnerType: "venue",
  },
  brands: {
    kicker: "Brand dashboard",
    title: "See where the campaign is working.",
    body: "Track district activity, saves, check-ins, offer use, and event lift so brand teams can adjust placements based on what people actually do.",
    mapTitle: "Brand activity, shown clearly.",
    mapDescription: "See which districts, venues, events, and offers are earning attention and action.",
    partnerType: "brand",
    explainerLabel: "What this view is for",
    explainerTitle: "The brand view answers one practical question: where is this working?",
    explainerBody:
      "It separates broad awareness from actual activity by showing which district, venue, building, event, or offer is creating movement.",
    explainerPoints: [
      "See which placements are getting people to act.",
      "Compare district, building, venue, and event activity.",
      "Decide where to keep, move, or refresh the campaign.",
    ],
  },
  civic: {
    kicker: "Civic dashboard",
    title: "See where downtown activity is building.",
    body: "Track events, public activity, saves, visits, and partner participation so civic teams can understand where downtown needs more support.",
    mapTitle: "District activity, shown clearly.",
    mapDescription: "See where people are gathering, what they are using, and where support or programming can make the biggest difference.",
    partnerType: "civic",
  },
};

const EMPTY_HELPER = "No activity recorded yet today.";

function getDashboardVariant(pathname) {
  if (pathname.includes("/partners/dashboard/residential")) return "residential";
  if (pathname.includes("/partners/dashboard/hospitality")) return "hospitality";
  if (pathname.includes("/partners/dashboard/venues")) return "venues";
  if (pathname.includes("/partners/dashboard/brands")) return "brands";
  if (pathname.includes("/partners/dashboard/civic")) return "civic";
  return "dashboard";
}

function getContentForVariant(variantKey) {
  if (variantKey === "residential") return PARTNER_TYPE_CONTENT.properties;
  if (variantKey === "hospitality") return PARTNER_TYPE_CONTENT.hospitality;
  if (variantKey === "venues") return PARTNER_TYPE_CONTENT.venues;
  if (variantKey === "brands") return PARTNER_TYPE_CONTENT.brands;
  if (variantKey === "civic") return PARTNER_TYPE_CONTENT.civic;
  return null;
}

function metricValue(value, suffix = "") {
  const number = Number(value || 0);
  return `${number.toLocaleString()}${suffix}`;
}

function isActiveTab(pathname, item, index) {
  if (pathname === item.href) return true;
  if (index === 0 && pathname === ROUTES.partnerDashboard) return true;
  return false;
}

export default function Dashboard() {
  const location = useLocation();
  const variantKey = getDashboardVariant(location.pathname);
  const variant = DASHBOARD_VARIANTS[variantKey];
  const content = getContentForVariant(variantKey);
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

  const kpis = [
    { label: "Shown today", value: metricValue(liveSummary?.impressions), helper: liveSummary ? "Map views and partner visibility" : EMPTY_HELPER },
    { label: "Saves", value: metricValue(liveSummary?.saves), helper: liveSummary ? "Places or offers saved" : EMPTY_HELPER },
    { label: "Visits", value: metricValue(liveSummary?.visits || liveSummary?.interactions), helper: liveSummary ? "People going from the map" : EMPTY_HELPER },
    { label: "Check-ins", value: metricValue(liveSummary?.checkIns || liveSummary?.scans), helper: liveSummary ? "People checking in" : EMPTY_HELPER },
    { label: "Perks used", value: metricValue(liveSummary?.redemptions), helper: liveSummary ? "Offers or perks used" : EMPTY_HELPER },
    { label: "Active offers", value: metricValue(liveSummary?.activePerks), helper: liveSummary ? "Live offers available" : EMPTY_HELPER },
    { label: "Events listed", value: metricValue(liveSummary?.activeEvents), helper: liveSummary ? "Events visible now" : EMPTY_HELPER },
  ];

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-6 md:px-6 md:py-8">
        <div className="dp-page-shell">
          <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#0B1F33_0%,#112A44_100%)] p-5 text-white shadow-[0_20px_48px_rgba(11,31,51,0.16)] md:p-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="dp-kicker">{variant.kicker}</div>
                <h1 className="mt-3 max-w-3xl text-[2.15rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-[3.25rem]">
                  {variant.title}
                </h1>
                <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/72">
                  {variant.body}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <Link to="/partner-workspace" className="dp-cta-primary bg-white text-[var(--dp-navy)]">
                  Manage offers
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/partners" className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/72 underline-offset-4 transition hover:text-white hover:underline">
                  View partner overview
                </Link>
              </div>
            </div>

            {variant.explainerTitle ? (
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                  {variant.explainerLabel}
                </div>
                <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] lg:items-start">
                  <div>
                    <div className="text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                      {variant.explainerTitle}
                    </div>
                    <div className="mt-2 max-w-2xl text-[13px] leading-6 text-white/74">
                      {variant.explainerBody}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {variant.explainerPoints?.map((point, index) => (
                      <div key={point} className="flex items-start gap-3">
                        <span className="shrink-0 pt-[2px] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold)]">
                          0{index + 1}
                        </span>
                        <span className="text-[12px] leading-6 text-white/76">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white/80 p-2 shadow-[0_12px_26px_rgba(11,31,51,0.04)] backdrop-blur">
            <div className="flex min-w-max gap-1">
              {DASHBOARD_TABS.map((item, index) => {
                const active = isActiveTab(location.pathname, item, index);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex min-h-[38px] items-center rounded-[13px] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
                      active
                        ? "bg-[var(--dp-navy)] text-white shadow-[0_10px_20px_rgba(11,31,51,0.12)]"
                        : "text-[rgba(11,31,51,0.62)] hover:bg-white hover:text-[var(--dp-navy)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] bg-white/90 px-4 py-4 shadow-[0_16px_34px_rgba(11,31,51,0.06)] backdrop-blur md:px-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="dp-micro-label">Today at a glance</div>
                <p className="mt-1 text-[13px] leading-6 text-muted-foreground">
                  A simple read on what people are doing across the partner map.
                </p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {kpis.map((metric) => (
                <div key={metric.label} className="min-w-[148px] border-l border-[rgba(11,31,51,0.1)] px-4 first:border-l-0 first:pl-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy)]">
                    {metric.value}
                  </div>
                  <div className="mt-1 max-w-[140px] text-[11px] leading-5 text-muted-foreground">
                    {metric.helper}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {content ? (
        <PartnerStoryCarousel
          eyebrow="What this view is for"
          title={`${content.label} teams need answers they can use.`}
          intro="This keeps the dashboard grounded in the decision this partner type is trying to make."
          items={content.storySlides || []}
        />
      ) : null}

      <PartnerInsightMap
        partnerType={variant.partnerType}
        title={variant.mapTitle}
        description={variant.mapDescription}
      />
    </div>
  );
}
