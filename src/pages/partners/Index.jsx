import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Compass,
  MapPin,
  QrCode,
  Repeat2,
  Sparkles,
  Star,
} from "lucide-react";
import PartnerInsightMap from "@/components/partner/PartnerInsightMap";
import PartnerEventsMap from "@/components/partner/PartnerEventsMap";
import PartnerBrandShowcase from "@/components/partner/PartnerBrandShowcase";
import PartnerHeaderStage from "@/components/partner/PartnerHeaderStage";
import PartnerPlatformMapPreview from "@/components/partner/PartnerPlatformMapPreview";
import ResponsiveScrollSection from "@/components/partner/ResponsiveScrollSection";
import WorkflowVisualizer from "@/components/partner/WorkflowVisualizer";
import ExpandableShowcase from "@/components/shared/ExpandableShowcase";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import {
  BRAND_SHOWCASE_GROUPS,
  PARTNER_DASHBOARD_LINK,
  PARTNER_LANDING_SECTIONS,
  PARTNER_PLATFORM_MODULES,
  PARTNER_TYPE_CONTENT,
} from "@/lib/partnerContent";
import { FAQ_PARTNERS } from "@/lib/faq-partner-data";
import { ROUTES, getPartnerDashboardRoute } from "@/lib/routes";

function SectionLabel({ children }) {
  return <p className="dp-micro-label">{children}</p>;
}

const WHY_IT_WORKS_ICONS = [Compass, Sparkles, Repeat2];
const OPERATING_MODEL_ICONS = {
  discovery: QrCode,
  map: MapPin,
  dashboard: BarChart3,
};
const MODULE_ICONS = [QrCode, Sparkles, Repeat2, Star];
const MODULE_META = {
  "Progressive-access resident flow": {
    menuLabel: "Entry flow",
    detailLabel: "What it does",
  },
  "Dynamic QR infrastructure": {
    menuLabel: "Tracking layer",
    detailLabel: "Why it matters",
  },
  "Partner offer manager": {
    menuLabel: "Offer controls",
    detailLabel: "How teams use it",
  },
  "Attribution and loyalty signals": {
    menuLabel: "Measurement layer",
    detailLabel: "What it reveals",
  },
};

const PARTNER_PLATFORM_TYPES = [
  {
    id: "properties",
    label: "Properties",
    route: ROUTES.partnerProperties,
    mapMode: "property",
    eyebrow: "For properties",
    headline: "The neighborhood becomes the amenity.",
    description:
      "Residents at connected buildings see nearby coffee, dining, events, wellness, and perks in a single live surface. No printed welcome packets, no forgotten app tabs. Just the real downtown, organized around their front door.",
    metrics: [
      { label: "Buildings connected", value: "14" },
      { label: "District coverage", value: "78701" },
      { label: "Average walk radius", value: "5 min" },
    ],
    whatYouGet: [
      {
        title: "Neighborhood layer",
        summary: "Tap to learn more",
        body: "Each connected building gets a live downtown layer centered on the property and tuned to what residents actually use nearby.",
      },
      {
        title: "Resident engagement",
        summary: "Tap to learn more",
        body: "Address or invite access lets residents browse, save, RSVP, and use the card without adding another separate building app.",
      },
      {
        title: "Amenity lift",
        summary: "Tap to learn more",
        body: "The map turns nearby coffee, dinner, wellness, and walkable plans into part of the building experience instead of off-platform noise.",
      },
      {
        title: "Event visibility",
        summary: "Tap to learn more",
        body: "Live events surface in the same resident flow, so the neighborhood feels active and useful without extra outreach work from the property team.",
      },
    ],
    steps: [
      "Connect your property to the Downtown Perks network",
      "Residents receive access through address verification or invite",
      "The map builds a live neighborhood layer around the building",
      "Track engagement, foot traffic, and perk usage from your dashboard",
    ],
    whyItWorks: [
      {
        title: "Nearby value",
        body: "Position the building as connected to a stronger downtown lifestyle.",
      },
      {
        title: "Daily utility",
        body: "Simpler discovery means residents use nearby businesses more often.",
      },
      {
        title: "Retention signal",
        body: "Residents who engage locally renew at higher rates.",
      },
    ],
    mapBehavior:
      "The map centers on each property and highlights what sits within a 5-minute walk. Residents see the places most likely to become part of their routine.",
    mapFeatures: [
      "5-minute neighborhood view around each building",
      "Nearby coffee, dining, wellness, and evening plans",
      "Perks card access tied to address or membership",
      "Live event visibility for what is happening now",
    ],
    ctaPrimaryLabel: "Open the map",
    ctaPrimaryHref: ROUTES.explore,
    ctaSecondaryLabel: "Get in touch",
    ctaSecondaryHref: "/partners/dashboard/about",
  },
  {
    id: "hospitality",
    label: "Hotels",
    route: ROUTES.partnerHospitality,
    mapMode: "hospitality",
    eyebrow: "For hotels",
    headline: "The stay extends beyond the lobby.",
    description:
      "Guests do not need another printed recommendation sheet. Downtown Perks gives hospitality teams one live city layer for dining, events, wellness, nightlife, and nearby movement from the moment a guest arrives.",
    metrics: [
      { label: "Hotels active", value: "9" },
      { label: "Guest interactions", value: "2.1k" },
      { label: "QR access points", value: "18" },
    ],
    whatYouGet: PARTNER_TYPE_CONTENT.hospitality.modules.map((module) => ({
      title: module.title,
      summary: "Tap to learn more",
      body: module.body,
    })),
    steps: [
      "Place QR access points in the lobby, rooms, and guest flow",
      "Guests open the live downtown layer without front-desk friction",
      "Nearby venues, events, and perks stay current throughout the stay",
      "Track what guests browse, save, and turn into visits",
    ],
    whyItWorks: [
      { title: "Guest orientation", body: "Guests decide faster when the best nearby options are visible right away." },
      { title: "Better stay experience", body: "Useful neighborhood context improves the stay without adding staff overhead." },
      { title: "Measurable local lift", body: "Hotels can see what was opened, saved, and actually used after arrival." },
    ],
    mapBehavior:
      "The map opens around the hotel and updates by time of day, event activity, and nearby guest intent.",
    mapFeatures: [
      "Guest QR entry across arrival and room flow",
      "Walkable dining, nightlife, and event visibility",
      "Nearby perk discovery tied to the stay",
      "Attribution from guest open to local action",
    ],
    ctaPrimaryLabel: "Open hospitality page",
    ctaPrimaryHref: ROUTES.partnerHospitality,
    ctaSecondaryLabel: "Open dashboard",
    ctaSecondaryHref: getPartnerDashboardRoute("hospitality"),
  },
  {
    id: "venues",
    label: "Venues",
    route: "/partners/venues",
    mapMode: "venue",
    eyebrow: "For venues",
    headline: "Show up when nearby intent is real.",
    description:
      "Downtown Perks puts venues in front of people who are already downtown and already deciding. The goal is not more noise. It is better timing, better context, and clearer conversion.",
    metrics: [
      { label: "Venues live", value: "24" },
      { label: "Nearby searches", value: "402" },
      { label: "Redemptions", value: "96" },
    ],
    whatYouGet: PARTNER_TYPE_CONTENT.venues.modules.map((module) => ({
      title: module.title,
      summary: "Tap to learn more",
      body: module.body,
    })),
    steps: [
      "Add your venue, category, and current offer or event",
      "Show up in the live map when people nearby are deciding",
      "Use perks and event timing to match real demand windows",
      "Track saves, visits, and redemptions from the same system",
    ],
    whyItWorks: [
      { title: "Decision timing", body: "People remember what is nearby when they are hungry or heading out." },
      { title: "Offer relevance", body: "Perks and programming land better when tied to place and time." },
      { title: "Repeat behavior", body: "Map saves and redemptions show what keeps people coming back." },
    ],
    mapBehavior:
      "The map biases toward walkable demand, current category intent, and the venue’s busiest windows.",
    mapFeatures: [
      "Category visibility in nearby decision moments",
      "Offer and event timing tied to venue rhythm",
      "Selected-place conversion drawer",
      "Save, RSVP, and redemption signals in one loop",
    ],
    ctaPrimaryLabel: "Open venue page",
    ctaPrimaryHref: "/partners/venues",
    ctaSecondaryLabel: "View venue dashboard",
    ctaSecondaryHref: "/partners/dashboard/venues",
  },
  {
    id: "brands",
    label: "Brands",
    route: "/partners/brands",
    mapMode: "brand",
    eyebrow: "For brands",
    headline: "Buy context, not broad reach.",
    description:
      "Brands can use Downtown Perks to show up through buildings, events, hotels, and downtown corridors with visibility tied to where people actually are and what they are about to do.",
    metrics: [
      { label: "Campaigns live", value: "12" },
      { label: "Monthly scans", value: "2.4k+" },
      { label: "Attributed visits", value: "840+" },
    ],
    whatYouGet: PARTNER_TYPE_CONTENT.brands.modules.map((module) => ({
      title: module.title,
      summary: "Tap to learn more",
      body: module.body,
    })),
    steps: [
      "Choose the campaign type, corridor, and source placements",
      "Launch through buildings, venues, events, or hospitality entry points",
      "Track scans, saves, visits, and redemptions by source",
      "Adjust timing and placement based on what converts",
    ],
    whyItWorks: [
      { title: "Useful placement", body: "The best advertising feels like something relevant that appeared at the right time." },
      { title: "Source clarity", body: "The dashboard shows which building, event, or venue did the work." },
      { title: "Downtown fit", body: "Campaigns feel embedded in the district instead of bolted on top of it." },
    ],
    mapBehavior:
      "Brand placements are layered into real downtown behavior, not generic impressions.",
    mapFeatures: [
      "Corridor and district-aware brand visibility",
      "Campaign placement by building, event, or venue",
      "Source-specific scan and visit measurement",
      "Brand moments tied to active downtown movement",
    ],
    ctaPrimaryLabel: "Open brand page",
    ctaPrimaryHref: "/partners/brands",
    ctaSecondaryLabel: "Browse brand pages",
    ctaSecondaryHref: "/brands",
  },
  {
    id: "civic",
    label: "Civic",
    route: "/partners/civic",
    mapMode: "civic",
    eyebrow: "For civic",
    headline: "Make participation easier to see and easier to join.",
    description:
      "District organizations and public initiatives can use Downtown Perks to make events, public programming, and neighborhood activity visible in the same place people are already looking.",
    metrics: [
      { label: "Monthly opens", value: "28k+" },
      { label: "Active civic orgs", value: "8+" },
      { label: "RSVPs / month", value: "3.2k" },
    ],
    whatYouGet: PARTNER_TYPE_CONTENT.civic.modules.map((module) => ({
      title: module.title,
      summary: "Tap to learn more",
      body: module.body,
    })),
    steps: [
      "Set up the district, initiative, or civic moment",
      "Publish events, access points, and participation prompts into the map",
      "Use buildings and local channels to drive discovery",
      "Track turnout, repeat participation, and neighborhood reach",
    ],
    whyItWorks: [
      { title: "Participation visibility", body: "People show up more often when what is happening is easy to find." },
      { title: "Shared surface", body: "Civic information works better when it sits inside the same downtown layer people already use." },
      { title: "Clear outcomes", body: "RSVPs, turnout, and repeat participation become measurable instead of assumed." },
    ],
    mapBehavior:
      "The map treats civic activity as part of daily downtown behavior, not a separate information site.",
    mapFeatures: [
      "District event visibility inside the live map",
      "Participation prompts tied to real nearby context",
      "Public initiative access through QR and location",
      "Repeat participation measurement",
    ],
    ctaPrimaryLabel: "Open civic page",
    ctaPrimaryHref: "/partners/civic",
    ctaSecondaryLabel: "Open dashboard",
    ctaSecondaryHref: getPartnerDashboardRoute("civic"),
  },
];

const PARTNER_BRAND_PAGES = [
  { slug: "the-shore", name: "The Shore", tag: "Residential", route: "/brands/the-shore" },
  { slug: "the-paseo", name: "The Paseo", tag: "Mixed-Use Property", route: "/brands/the-paseo" },
  { slug: "the-waterline", name: "The Waterline", tag: "Premium Residential", route: "/brands/the-waterline" },
  { slug: "bangers", name: "Banger's", tag: "Venue", route: "/brands/bangers" },
  { slug: "the-stay-put", name: "Stay Put", tag: "Local Bar", route: "/brands/the-stay-put" },
  { slug: "fine-eyewear", name: "Fine Eyewear", tag: "Civic Wellness", route: "/brands/fine-eyewear" },
  { slug: "heritage-boots", name: "Heritage Boots", tag: "Retail Campaign", route: "/brands/heritage-boots" },
  { slug: "dottie-may", name: "Dottie May", tag: "Launch Hospitality", route: "/brands/dottie-may" },
  { slug: "topo-chico", name: "Topo Chico", tag: "Launch Beverage", route: "/brands/topo-chico" },
  { slug: "hotel-van-zandt", name: "Hotel Van Zandt", tag: "Hospitality", route: "/brands/hotel-van-zandt" },
  { slug: "four-seasons", name: "Four Seasons", tag: "Hospitality", route: "/brands/four-seasons" },
  { slug: "four-seasons-residences", name: "Four Seasons Residences", tag: "Residential", route: "/brands/four-seasons-residences" },
  { slug: "inspired-closets-austin", name: "Inspired Closets Austin", tag: "Residential Services", route: "/brands/inspired-closets-austin" },
  { slug: "yeti", name: "YETI", tag: "Brand Campaign", route: "/brands/yeti" },
  { slug: "rivian", name: "Rivian", tag: "Mobility", route: "/brands/rivian" },
  { slug: "lululemon", name: "lululemon", tag: "Retail Wellness", route: "/brands/lululemon" },
  { slug: "equinox", name: "Equinox", tag: "Fitness", route: "/brands/equinox" },
  { slug: "austin-fc", name: "Austin FC", tag: "Civic Entertainment", route: "/brands/austin-fc" },
  { slug: "fabi-and-rosi", name: "Fabi & Rosi", tag: "Dining", route: "/brands/fabi-and-rosi" },
];

export default function PartnersIndex() {
  const location = useLocation();
  const [activePrinciple, setActivePrinciple] = useState(0);
  const [activePartnerType, setActivePartnerType] = useState("properties");
  const [expandedModule, setExpandedModule] = useState("Neighborhood layer");
  const [expandedWhyItWorks, setExpandedWhyItWorks] = useState("Nearby value");
  const routeMatchedPartner =
    PARTNER_PLATFORM_TYPES.find((item) => item.route === location.pathname) ?? null;
  const resolvedActivePartnerType = routeMatchedPartner?.id ?? activePartnerType;
  const activePartner =
    PARTNER_PLATFORM_TYPES.find((item) => item.id === resolvedActivePartnerType) ?? PARTNER_PLATFORM_TYPES[0];

  const operatingPrinciples = [
    {
      id: "discovery",
      eyebrow: "Access",
      title: "Let people look around first",
      panelTitle: "Open first. Ask for commitment later.",
      body: "Open the map right away. Only bring in sign-up, card, or scan steps when someone wants to save, RSVP, or redeem.",
    },
    {
      id: "map",
      eyebrow: "Map",
      title: "Show up when someone is deciding",
      panelTitle: "Be visible in the decision window.",
      body: "Your place, offer, or event should appear while someone is already downtown and already deciding what to do next.",
    },
    {
      id: "dashboard",
      eyebrow: "Dashboard",
      title: "Make the numbers easy to use",
      panelTitle: "Turn activity into the next move.",
      body: "Turn scans, saves, RSVPs, visits, and redemptions into one clear read: what is working now, what needs help, and what to do next.",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePrinciple((current) => (current + 1) % operatingPrinciples.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [operatingPrinciples.length]);

  useEffect(() => {
    setExpandedWhyItWorks(activePartner.whyItWorks[0]?.title ?? "");
  }, [activePartner.id]);

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy,#0B1A2B)]">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell grid gap-5">
          <PartnerHeaderStage
            eyebrow="Partners"
            title="One partner page. Five ways to use Downtown Perks."
            description="Buildings, hotels, venues, brands, and civic groups all use the same downtown map, the same customer flow, and the same reporting tools."
            actions={
              <>
                <a href="#partner-types" className="dp-cta-primary">
                  View partner types
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link to={PARTNER_DASHBOARD_LINK} className="dp-cta-secondary">
                  Open dashboard
                </Link>
              </>
            }
          />

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,245,238,0.9))] p-4 shadow-[0_14px_30px_rgba(11,26,43,0.06)] md:p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(11,31,51,0.04)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/52">
                <Sparkles className="h-3.5 w-3.5 text-[var(--dp-gold-muted)]" strokeWidth={1.75} />
                How it works
              </div>
            </div>

            <ResponsiveScrollSection
              items={operatingPrinciples}
              desktopClassName="sm:grid-cols-3 gap-3"
              mobileCardClassName="w-[88%]"
              getKey={(section) => section.title}
              renderItem={(section, index) => {
                const Icon = PARTNER_LANDING_SECTIONS[index]?.icon || Sparkles;
                return (
                  <div className="h-full rounded-[18px] border border-[rgba(11,31,51,0.08)] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(11,26,43,0.04)]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                        <Icon className="h-4 w-4 text-[var(--dp-gold-muted)]" strokeWidth={1.75} />
                      </span>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/44">
                        Step {index + 1}
                      </div>
                    </div>
                    <div className="mt-3 text-[0.98rem] font-semibold tracking-[-0.03em] text-foreground">
                      {section.title}
                    </div>
                    <div className="mt-2 text-[12.5px] leading-5.5 text-muted-foreground">
                      {section.body}
                    </div>
                  </div>
                );
              }}
            />
          </motion.div>
        </div>
      </section>

      <section id="partner-types" className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band dp-band-muted p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <SectionLabel>Partner Platform</SectionLabel>
            <h2 className="dp-heading-modern mt-4 max-w-2xl text-4xl md:text-5xl">
              How Downtown Perks works for your business.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Select your business type below. Each partner category connects to the live downtown map differently, and each one drives measurable value.
            </p>
          </div>

          <div className="mt-8">
            <div className="flex overflow-x-auto border-b border-[rgba(11,31,51,0.08)]">
              {PARTNER_PLATFORM_TYPES.map((type) => (
                <Link
                  key={type.id}
                  to={type.route}
                  onMouseEnter={() => {
                    setActivePartnerType(type.id);
                    setExpandedModule(type.whatYouGet[0]?.title ?? "");
                  }}
                  onFocus={() => {
                    setActivePartnerType(type.id);
                    setExpandedModule(type.whatYouGet[0]?.title ?? "");
                  }}
                  className={`px-5 py-4 text-[11px] font-medium whitespace-nowrap transition-all ${
                    resolvedActivePartnerType === type.id
                      ? "border-b-2 border-[var(--dp-gold-muted)] text-primary"
                      : "text-foreground/55 hover:text-foreground"
                  }`}
                >
                  {type.label}
                </Link>
              ))}
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-10">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--dp-gold-muted)]">
                  {activePartner.eyebrow}
                </div>
                <motion.h3
                  key={activePartner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="dp-heading-modern mt-4 text-3xl md:text-4xl"
                >
                  {activePartner.headline}
                </motion.h3>
                <p className="mt-4 max-w-3xl text-[14px] leading-7 text-muted-foreground">
                  {activePartner.description}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-3 border-y border-[rgba(11,31,51,0.08)] py-4">
                  {activePartner.metrics.map((metric) => (
                    <div key={metric.label} className="pr-3">
                      <div className="text-[1.4rem] font-semibold tracking-[-0.04em] text-foreground">{metric.value}</div>
                      <div className="mt-1 text-[11px] leading-5 text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/48">What you get</div>
                  <div className="mt-4 grid gap-0 sm:grid-cols-2">
                    {activePartner.whatYouGet.map((item) => {
                      const isOpen = expandedModule === item.title;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => setExpandedModule(isOpen ? "" : item.title)}
                          className="border-b border-[rgba(11,31,51,0.08)] p-4 text-left transition hover:bg-[rgba(248,250,252,0.56)] sm:nth-[odd]:border-r sm:border-r-[rgba(11,31,51,0.08)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[14px] font-semibold text-foreground">{item.title}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{item.summary}</div>
                            </div>
                            <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                          {isOpen ? (
                            <p className="mt-4 text-[13px] leading-6 text-muted-foreground">{item.body}</p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                  <div>
                    <WorkflowVisualizer steps={activePartner.steps} title="How it works" />
                  </div>

                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/48">Why it works</div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {activePartner.whyItWorks.map((item, index) => {
                        const Icon = WHY_IT_WORKS_ICONS[index % WHY_IT_WORKS_ICONS.length];
                        const isOpen = expandedWhyItWorks === item.title;

                        return (
                          <button
                            key={item.title}
                            type="button"
                            onClick={() => setExpandedWhyItWorks(isOpen ? "" : item.title)}
                            className={`inline-flex min-h-11 items-center gap-2.5 rounded-full border px-3.5 py-2 text-left transition ${
                              isOpen
                                ? "border-[rgba(207,175,90,0.34)] bg-[rgba(207,175,90,0.1)] text-foreground"
                                : "border-[rgba(11,31,51,0.08)] bg-white text-foreground/74 hover:border-[rgba(11,31,51,0.14)]"
                            }`}
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]">
                              <Icon className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                            <span className="text-[12px] font-semibold">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 min-h-[84px] border-l-2 border-[var(--dp-gold-muted)] pl-4">
                      {activePartner.whyItWorks.map((item, index) => {
                        const Icon = WHY_IT_WORKS_ICONS[index % WHY_IT_WORKS_ICONS.length];
                        const isOpen = expandedWhyItWorks === item.title;
                        if (!isOpen) return null;

                        return (
                          <div key={item.title} className="flex gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy)]">
                              <Icon className="h-4 w-4" strokeWidth={1.8} />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-foreground">{item.title}</div>
                              <p className="mt-1 text-[12px] leading-6 text-muted-foreground">{item.body}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <PartnerPlatformMapPreview
                partnerType={activePartner.mapMode}
                route={activePartner.route}
                ctaPrimaryHref={activePartner.ctaPrimaryHref}
                ctaPrimaryLabel={activePartner.ctaPrimaryLabel}
                ctaSecondaryHref={activePartner.ctaSecondaryHref}
                ctaSecondaryLabel={activePartner.ctaSecondaryLabel}
                label={activePartner.label}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band space-y-8 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
            <SectionLabel>Operating model</SectionLabel>
            <h2 className="dp-heading-modern mt-4 text-4xl md:text-5xl">
              Three simple rules.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep it simple: let people browse first, show up at the right time, and make the results easy to understand.
            </p>
            </div>

            <div className="flex items-center gap-2">
              {operatingPrinciples.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePrinciple(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activePrinciple === index ? "w-8 bg-[var(--dp-gold-muted)]" : "w-2.5 bg-[rgba(11,31,51,0.16)]"
                  }`}
                  aria-label={`Show ${item.title}`}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-[rgba(11,31,51,0.08)] p-6 lg:border-b-0 lg:border-r lg:p-8">
                {operatingPrinciples.map((item, index) => {
                  const Icon = OPERATING_MODEL_ICONS[item.id] || Sparkles;
                  const isActive = activePrinciple === index;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePrinciple(index)}
                      className={`flex w-full items-start gap-3 border-b border-[rgba(11,31,51,0.06)] py-4 text-left last:border-b-0 ${
                        isActive ? "text-foreground" : "text-foreground/68"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy)]" : "bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]"
                      }`}>
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold-muted)]">
                          {item.eyebrow}
                        </div>
                        <div className="mt-1 text-[1rem] font-semibold tracking-[-0.03em]">
                          {item.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-6 md:p-8">
                {operatingPrinciples.map((item, index) => {
                  const isActive = activePrinciple === index;
                  if (!isActive) return null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.26, ease: "easeOut" }}
                    >
                      <div className="dp-heading-modern text-3xl md:text-4xl">
                        {item.panelTitle}
                      </div>
                      <div className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">
                        {item.body}
                      </div>

                      <div className="mt-5 border-t border-[rgba(11,31,51,0.08)] pt-4">
                        {item.id === "map" ? (
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/44">
                              <span>Nearby decision layer</span>
                              <span>Live</span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {["Coffee now", "Dinner tonight", "Open late"].map((chip) => (
                                <div key={chip} className="rounded-full border border-[rgba(11,31,51,0.06)] bg-transparent px-3 py-2 text-[11px] font-medium text-foreground/74">
                                  {chip}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                              {[88, 64, 76].map((height, i) => (
                                <motion.div
                                  key={height}
                                  animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 1.8 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                                  className="rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-transparent p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--dp-gold-muted)]" />
                                    <div className="h-2 w-16 rounded-full bg-[rgba(11,31,51,0.08)]" />
                                  </div>
                                  <div className="mt-3 h-1.5 rounded-full bg-[rgba(11,31,51,0.06)]" />
                                  <div className="mt-2 h-1.5 w-[72%] rounded-full bg-[rgba(11,31,51,0.06)]" />
                                  <div className="mt-3 h-[3px] rounded-full bg-[rgba(207,175,90,0.24)]">
                                    <motion.div
                                      animate={{ width: ["28%", "84%", "36%"] }}
                                      transition={{ duration: 2.4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                                      className="h-full rounded-full bg-[var(--dp-gold-muted)]"
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : item.id === "dashboard" ? (
                          <div>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "Scans", value: "2,875" },
                                { label: "Saves", value: "684" },
                                { label: "RSVPs", value: "84" },
                                { label: "Repeat visits", value: "22%" },
                              ].map((metric, i) => (
                                <motion.div
                                  key={metric.label}
                                  animate={{ scale: [1, 1.02, 1] }}
                                  transition={{ duration: 2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                                  className="rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-transparent p-3"
                                >
                                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/42">
                                    {metric.label}
                                  </div>
                                  <div className="mt-2 text-[1.15rem] font-semibold tracking-[-0.04em] text-foreground">
                                    {metric.value}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <div className="mt-4 rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-transparent p-4">
                              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/42">
                                What to do next
                              </div>
                              <div className="mt-3 flex items-center gap-3">
                                <motion.div
                                  animate={{ x: [0, 4, 0] }}
                                  transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                                  className="h-2.5 w-2.5 rounded-full bg-[var(--dp-gold-muted)]"
                                />
                                <div className="text-[12px] leading-6 text-muted-foreground">
                                  West 6th is pulling more saves than visits. Push an offer before 7pm.
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[18px] border border-[rgba(11,31,51,0.06)] bg-transparent p-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/42">
                              Simple access
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              {["Open map", "Browse", "Save later"].map((itemLabel, i) => (
                                <motion.div
                                  key={itemLabel}
                                  animate={{ y: [0, -2, 0] }}
                                  transition={{ duration: 1.6 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                                  className="rounded-full border border-[rgba(11,31,51,0.06)] bg-[rgba(248,250,252,0.82)] px-3 py-2 text-[11px] font-medium text-foreground/74"
                                >
                                  {itemLabel}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <ExpandableShowcase
            items={PARTNER_PLATFORM_MODULES}
            className="mt-1"
            renderMenuMeta={(module, index, isActive) => {
              const Icon = MODULE_ICONS[index % MODULE_ICONS.length];
              return (
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isActive ? "bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy)]" : "bg-[rgba(11,31,51,0.05)] text-[var(--dp-navy)]"
                }`}>
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                </div>
              );
            }}
            getKey={(module) => module.title}
                            renderMenuBody={(module) => (
              <>
                <div className="text-[13px] font-semibold text-foreground">{module.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {MODULE_META[module.title]?.menuLabel || "Core layer"}
                </div>
              </>
            )}
            renderDetail={(module) => (
              <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">
                    {MODULE_META[module.title]?.detailLabel || "What it does"}
                  </div>
                  <h3 className="dp-heading-modern mt-3 text-[1.45rem]">{module.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{module.body}</p>
                </div>
                <div className="rounded-[22px] bg-[rgba(11,31,51,0.04)] p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                    Live behavior
                  </div>
                  <div className="mt-3 space-y-3">
                    <div className="rounded-[16px] border border-[rgba(11,31,51,0.06)] bg-white/84 px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/42">
                        Trigger
                      </div>
                      <div className="mt-1 text-[12px] leading-6 text-muted-foreground">
                        Someone opens the map, scans a QR, or saves a place.
                      </div>
                    </div>
                    <div className="rounded-[16px] border border-[rgba(11,31,51,0.06)] bg-white/84 px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/42">
                        System response
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
                          className="h-2.5 w-2.5 rounded-full bg-[var(--dp-gold-muted)]"
                        />
                        <div className="text-[12px] leading-6 text-muted-foreground">
                          The shared layer updates what shows up next and what the partner sees in the dashboard.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </section>

      <PartnerEventsMap />

      <PartnerInsightMap
        partnerType="dashboard"
        title="The partner map should help you make decisions."
        description="This view should show what is getting attention, what is driving visits, and what needs work next."
      />

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <SectionLabel>Brand and partner pages</SectionLabel>
            <h2 className="dp-heading-modern mt-4 text-4xl md:text-5xl">
              Open the specific partner stories.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Every card below goes to an existing partner or brand page in the current build. The landing page should expose those surfaces instead of hiding them behind generic copy.
            </p>
          </div>

          <div className="mt-8 grid gap-0 md:grid-cols-2 xl:grid-cols-3">
            {PARTNER_BRAND_PAGES.map((page) => (
              <Link
                key={page.slug}
                to={page.route}
                className="group border-b border-[rgba(11,31,51,0.08)] p-5 transition hover:bg-[rgba(248,250,252,0.56)] md:border-r md:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(3n)]:border-r-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">{page.tag}</div>
                    <div className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">{page.name}</div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-foreground/28 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/brands" className="dp-cta-primary">
              Open all brand pages
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/partners/dashboard/about" className="dp-cta-secondary">
              Open partner dashboard about
            </Link>
          </div>
        </div>
      </section>

      <FAQAccordionBlock
        sectionEyebrow="FAQ"
        sectionTitle="Partner questions, answered."
        sectionIntro="These answers cover the shared operating model across properties, hotels, venues, brands, and civic partners."
        items={FAQ_PARTNERS}
        styleVariant="split"
        defaultOpenIndex={0}
        allowMultipleOpen={false}
        pageType="partners"
        ctaLabel="Open partner dashboard"
        ctaHref={PARTNER_DASHBOARD_LINK}
      />

      <PartnerBrandShowcase groups={BRAND_SHOWCASE_GROUPS} />
    </div>
  );
}
