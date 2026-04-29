import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, LineChart, Search, Sparkles, Target } from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerStoryCarousel from "@/components/partner/PartnerStoryCarousel";
import { PARTNER_TYPE_CONTENT, PARTNER_TYPE_ORDER } from "@/lib/partnerContent";
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
    title: "Not just what happened. What to do next.",
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
    title: "See what is driving response before you spend more on the wrong placement.",
    body: "This view tells a brand team where attention turns into movement: which district is waking up, which building or venue is sending qualified traffic, and which event or activation source is actually earning follow-through.",
    mapTitle: "Ask where the campaign is working and what to adjust next.",
    mapDescription: "The map returns the clearest campaign answer, then shows the proof behind it.",
    partnerType: "brand",
    explainerLabel: "What this block is doing",
    explainerTitle: "The brand view is here to answer one hard question clearly.",
    explainerBody:
      "It should show whether the campaign is working because of the district, the building, the venue, the event moment, or the offer itself. The next section then turns that answer into a live map view with proof, sources, and the next move.",
    explainerPoints: [
      "See which placements are generating real response instead of broad visibility.",
      "Separate district lift from building-led, venue-led, and event-led traffic.",
      "Use the live map section below to decide where to keep, move, or stop the campaign."
    ],
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

function getContentForVariant(variantKey) {
  if (variantKey === "residential") return PARTNER_TYPE_CONTENT.properties;
  if (variantKey === "hospitality") return PARTNER_TYPE_CONTENT.hospitality;
  if (variantKey === "venues") return PARTNER_TYPE_CONTENT.venues;
  if (variantKey === "brands") return PARTNER_TYPE_CONTENT.brands;
  if (variantKey === "civic") return PARTNER_TYPE_CONTENT.civic;
  return null;
}

function metricValue(value, suffix = "") {
  if (value === null || value === undefined) return "0";
  return `${Number(value).toLocaleString()}${suffix}`;
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

  const heroMetrics = liveSummary
    ? [
        { label: "Scans", value: metricValue(liveSummary.impressions), icon: Search },
        { label: "Action rate", value: metricValue(liveSummary.conversionRate, "%"), icon: LineChart },
        { label: "Redemptions", value: metricValue(liveSummary.redemptions), icon: Sparkles },
        {
          label: variantKey === "civic" ? "Live events" : "Live offers / events",
          value: `${metricValue(liveSummary.activePerks)} / ${metricValue(liveSummary.activeEvents)}`,
          icon: Calendar,
        },
      ]
    : [];

  const overviewBlocks = [
    {
      title: "Direct answer",
      body: "Ask one question and let the map bring the clearest current answer to the top instead of making people sort through raw tables first.",
    },
    {
      title: "Proof",
      body: "Once an answer surfaces, the dashboard should show the movement behind it: scans, visits, redemptions, saves, and where that response is coming from.",
    },
    {
      title: "Sources",
      body: "The useful part is knowing whether the action came from a building, event, venue cluster, offer, or district moment so the next move is obvious.",
    },
  ];

  const usageSteps = [
    {
      title: "Start with the question",
      body: "Open with what you need to know right now, not with filters for their own sake.",
    },
    {
      title: "Let the map narrow it down",
      body: "Use the live layer to cut the noise and focus attention on the strongest current signal.",
    },
    {
      title: "Turn the answer into an action",
      body: "Adjust the offer, placement, timing, or follow-up while the signal is still useful.",
    },
  ];

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

            {variant.explainerTitle ? (
              <div className="mt-5 p-1 md:p-2">
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

            {heroMetrics.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {heroMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                  <div
                    key={metric.label}
                    className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/60">
                        {metric.label}
                      </div>
                      <Icon className="h-3.5 w-3.5 text-white/46" />
                    </div>
                    <div className="mt-2 text-[0.98rem] font-semibold tracking-[-0.03em] text-white">{metric.value}</div>
                  </div>
                );})}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {content ? (
        <PartnerStoryCarousel
          eyebrow="What this view is for"
          title={`${content.label} teams need answers they can use.`}
          intro="This keeps the dashboard grounded in what the team is actually trying to figure out, not a generic analytics story."
          items={content.storySlides || []}
        />
      ) : (
        <section className="px-4 py-8 md:px-6 md:py-10">
          <div className="dp-page-shell">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_32px_rgba(11,31,51,0.05)] md:p-6">
                <div className="dp-micro-label">Overview</div>
                <h2 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground md:text-[2rem]">
                  This dashboard should answer the question, not bury it.
                </h2>
                <p className="mt-3 max-w-2xl text-[14px] leading-7 text-muted-foreground">
                  The point of the overview is to get from a live downtown question to one usable answer, then show the proof and the source behind it in the same surface.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {overviewBlocks.map((block, index) => (
                    <div key={block.title} className="rounded-[18px] bg-[#f7f9fc] p-4">
                      <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                        <Target className="h-3.5 w-3.5" />
                        0{index + 1}
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-foreground">{block.title}</div>
                      <div className="mt-2 text-[12px] leading-6 text-muted-foreground">{block.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_32px_rgba(11,31,51,0.05)] md:p-6">
                <div className="dp-micro-label">Use it well</div>
                <h2 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.03em] text-foreground md:text-[2rem]">
                  One downtown view, five partner angles.
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                  Each lens should be opened for a different kind of decision. The structure stays the same, but the job to be done changes by partner type.
                </p>

                <div className="mt-5 space-y-3">
                  {usageSteps.map((step, index) => (
                    <div key={step.title} className="rounded-[18px] bg-[#f7f9fc] p-4">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                        Step 0{index + 1}
                      </div>
                      <div className="mt-2 text-[15px] font-semibold text-foreground">{step.title}</div>
                      <div className="mt-2 text-[12px] leading-6 text-muted-foreground">{step.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {PARTNER_TYPE_ORDER.map((key) => {
                const item = PARTNER_TYPE_CONTENT[key];
                const href = `/partners/dashboard/${key === "properties" ? "residential" : key}`;

                return (
                  <Link
                    key={item.id}
                    to={href}
                    className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_16px_32px_rgba(11,31,51,0.05)] transition hover:translate-y-[-1px]"
                  >
                    <div className="dp-micro-label">{item.eyebrow}</div>
                    <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                      {item.label}
                    </h3>
                    <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-gold-muted)]">
                      Open lens
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <PartnerInsightMap
        partnerType={variant.partnerType}
        title={variant.mapTitle}
        description={variant.mapDescription}
      />
    </div>
  );
}
