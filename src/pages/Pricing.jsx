import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";

const revenueLayers = [
  ["Residents", "Annual membership"],
  ["Properties", "Monthly infrastructure subscription"],
  ["Venues", "Free entry + paid amplification"],
  ["Hospitality", "Concierge + guest engagement"],
  ["Brands", "Campaign activations + sponsorship"],
  ["Civic", "Sponsored / enterprise licensing"],
];

const sections = [
  {
    id: "residents",
    eyebrow: "Membership access",
    title: "Residents",
    model: "Annual membership",
    narrative:
      "Residents create network density, recurring map usage, behavioral signals, and the downtown context that powers partner intelligence.",
    tiers: [
      {
        name: "Resident Membership",
        price: "$25/year",
        detail: "12 months",
        cta: "Get Membership",
        includes: [
          "save places",
          "RSVP to events",
          "redeem perks",
          "resident-only offers",
          "map personalization",
          "downtown activity feed",
          "QR perks card",
          "member event access",
        ],
      },
      {
        name: "Building-Included Access",
        price: "Included",
        detail: "Active while property participates",
        cta: "Activate Building Access",
        includes: ["resident engagement", "building-connected access", "resident-only offers", "QR perks card", "member event access"],
      },
    ],
    rule:
      "If a resident pays individually and later joins a participating building, Downtown Perks automatically refunds the membership or converts it to account credit.",
  },
  {
    id: "properties",
    eyebrow: "Infrastructure pricing",
    title: "Properties",
    model: "Monthly infrastructure subscription",
    narrative:
      "Properties pay for resident engagement, retention infrastructure, leasing differentiation, neighborhood intelligence, communication systems, and district visibility.",
    tiers: [
      {
        name: "Pilot",
        price: "Free",
        detail: "90 days",
        cta: "Start Free Pilot",
        includes: ["full onboarding", "resident activation", "QR deployment", "live map placement", "event layer", "top-line reporting"],
      },
      {
        name: "Connected",
        price: "$149/month",
        badge: "Most Popular",
        detail: "Best for independent buildings, lease-up properties, and resident engagement rollout.",
        cta: "Get Started",
        includes: [
          "everything in Pilot",
          "resident dashboard",
          "save + RSVP analytics",
          "building communication layer",
          "featured property profile",
          "neighborhood engagement reporting",
        ],
      },
      {
        name: "Intelligence",
        price: "$499/month",
        detail: "Best for luxury residential, mixed-use developments, and retention-focused operators.",
        cta: "Book Strategy Call",
        includes: [
          "everything in Connected",
          "behavioral analytics",
          "segmentation reporting",
          "leasing attribution",
          "campaign integrations",
          "district benchmarking",
          "sponsored placements",
          "custom programming",
          "dedicated account manager",
        ],
      },
      {
        name: "District Enterprise",
        price: "Custom",
        detail: "For developers, portfolios, REITs, and mixed-use districts.",
        cta: "Contact Sales",
        includes: [
          "portfolio analytics",
          "API integrations",
          "district overlays",
          "custom dashboards",
          "multi-property reporting",
          "district campaign attribution",
          "white-label integrations",
        ],
      },
    ],
    tables: [
      { title: "Activation", rows: [["QR Activation Kit", "$49/year"], ["Move-In Campaigns", "$149/year"], ["Resident Nudges", "$99/year"]] },
      { title: "Intelligence", rows: [["Engagement Dashboard", "Included in Connected"], ["Conversion Tracking", "$99/month"], ["Area Intelligence", "$149/month"]] },
      { title: "Visibility", rows: [["Featured Building Placement", "$99/month"], ["District Highlight Placement", "$249/month"]] },
    ],
  },
  {
    id: "venues",
    eyebrow: "Free entry + amplification",
    title: "Venues",
    model: "Free entry + paid amplification",
    narrative:
      "Venue entry stays frictionless so the map has dense inventory, active offers, and enough participation volume to make downtown discovery useful.",
    tiers: [
      {
        name: "Venue Access",
        price: "Free",
        cta: "Join Free",
        requirements: ["active business", "valid operating hours", "resident perk or offer"],
        includes: ["map placement", "event visibility", "perk listing", "resident discovery", "QR redemption support"],
      },
      {
        name: "Featured Venue",
        price: "$79/month",
        cta: "Upgrade Visibility",
        includes: ["boosted placement", "featured event visibility", "trending eligibility", "enhanced profile", "campaign participation"],
      },
      {
        name: "Venue Intelligence",
        price: "$249/month",
        cta: "Request Demo",
        includes: ["traffic analytics", "redemption analytics", "district comparisons", "peak engagement timing", "audience behavior insights", "campaign reporting"],
      },
      {
        name: "District Venue Partner",
        price: "$499/month",
        includes: ["district priority placement", "campaign inclusion", "district trend reporting", "event amplification", "sponsored recommendation inclusion"],
      },
    ],
    tables: [
      { title: "Time-Based Visibility", rows: [["Boost", "$49", "24 hours"], ["Standard", "$149", "72 hours"], ["Premium", "$349", "7 days"], ["District Spotlight", "$599", "7 days"]] },
      { title: "Targeting", rows: [["Radius Targeting", "$49"], ["Time-Based Targeting", "$49"], ["Audience Targeting", "$99"]] },
      { title: "Visibility", rows: [["Featured Feed Placement", "$99"], ["Priority Pin Boost", "$49"], ["Trending Placement", "$149"]] },
      { title: "Extensions", rows: [["+1 Day Extension", "$49"], ["+3 Day Extension", "$99"]] },
    ],
  },
  {
    id: "hospitality",
    eyebrow: "Guest experience systems",
    title: "Hospitality",
    model: "Concierge + guest engagement",
    narrative:
      "Hotels are guest experience systems, concierge layers, and district orientation infrastructure inside the Downtown Perks operating layer.",
    tiers: [
      { name: "Guest Access", price: "$199/month", includes: ["guest perks access", "live neighborhood map", "hotel-branded layer", "QR guest onboarding", "local recommendations"] },
      { name: "Concierge Intelligence", price: "$599/month", includes: ["guest engagement analytics", "sponsored itineraries", "event integrations", "local partnership campaigns", "premium placement"] },
      { name: "Enterprise Hospitality", price: "Custom", includes: ["multi-property support", "district sponsorships", "white-label integrations", "concierge API layers", "enterprise analytics"] },
    ],
  },
  {
    id: "brands",
    eyebrow: "Campaign activations",
    title: "Brands",
    model: "Campaign activations + sponsorship",
    narrative:
      "Brands buy contextual visibility, geographic relevance, downtown movement, and real-world engagement rather than generic impressions.",
    tiers: [
      { name: "Local Presence", price: "$999/year", includes: ["geographic relevance", "partner integrations", "district visibility"] },
      { name: "District Presence", price: "$2,500/year", includes: ["district overlays", "event tie-ins", "interactive placements"] },
      { name: "Citywide Presence", price: "$5,000/year", includes: ["branded experiences", "analytics dashboard", "multi-district visibility"] },
    ],
    tables: [
      { title: "Campaign Activations", rows: [["Standard Activation", "Starting at $2,500"], ["Premium Activation", "Starting at $5,000"], ["District Takeover", "Starting at $10,000"]] },
      { title: "Brand Add-Ons", rows: [["Sponsored Map Layer", "$2,500"], ["Multi-Venue Overlay", "$999"], ["Audience Targeting", "$499"], ["Premium Analytics", "$999"]] },
    ],
  },
  {
    id: "civic",
    eyebrow: "District partnerships",
    title: "Civic",
    model: "Sponsored / enterprise licensing",
    narrative:
      "Civic and community partners use the operating layer for district awareness, event distribution, cultural programming, and sponsored neighborhood initiatives.",
    tiers: [
      { name: "Community Organizations", price: "Free", includes: ["event distribution", "community visibility", "cultural programming support"] },
      { name: "Civic Event Partners", price: "Sponsored", includes: ["district awareness", "event distribution", "sponsored neighborhood initiatives"] },
      { name: "District Intelligence Access", price: "Custom", includes: ["district awareness", "community visibility", "district intelligence access"] },
      { name: "Citywide Licensing", price: "Enterprise", includes: ["citywide licensing", "custom reporting", "multi-district coordination"] },
    ],
  },
];

function TierCard({ tier }) {
  return (
    <article className="flex min-h-full w-[18rem] shrink-0 snap-start flex-col rounded-xl border border-[var(--dp-border)] bg-white/82 p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)] md:w-auto">
      <div className="flex min-h-9 items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{tier.name}</p>
        {tier.badge ? <span className="rounded-full bg-[rgba(184,154,88,0.14)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dp-navy)]">{tier.badge}</span> : null}
      </div>
      <p className="mt-4 font-serif text-4xl font-medium tracking-[-0.05em] text-[var(--dp-navy)]">{tier.price}</p>
      {tier.detail ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{tier.detail}</p> : null}
      {tier.requirements ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="basis-full text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Requirements</p>
          {tier.requirements.map((item) => (
            <span key={item} className="rounded-full bg-[rgba(11,31,51,0.06)] px-2.5 py-1 text-xs font-semibold text-[var(--dp-navy)]">{item}</span>
          ))}
        </div>
      ) : null}
      <ul className="mt-5 grid gap-2.5">
        {tier.includes.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-5 text-muted-foreground">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--dp-gold-muted)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {tier.cta ? (
        <Link to="/partners" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--dp-navy)] px-4 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          {tier.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
}

function PricingTable({ table }) {
  return (
    <article className="border-t border-[var(--dp-border)] pt-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{table.title}</h3>
      <div className="mt-4 grid gap-3">
        {table.rows.map(([name, price, duration]) => (
          <div key={`${table.title}-${name}`} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-[var(--dp-divider)] pb-3">
            <span className="text-sm font-semibold text-[var(--dp-navy)]">{name}</span>
            <strong className="text-sm font-semibold text-[var(--dp-navy)]">{price}</strong>
            {duration ? <small className="col-span-2 text-xs text-muted-foreground">{duration}</small> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-foreground">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell dp-band p-6 md:p-8 lg:p-10">
          <Link to="/" className="dp-cta-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="dp-micro-label">Final Pricing System</p>
              <h1 className="dp-display-hero mt-5 max-w-4xl text-5xl md:text-6xl lg:text-7xl">
                Infrastructure for how downtown operates.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                Downtown Perks is not a local deals app. It is a live downtown operating layer connecting residents, buildings, local businesses, hospitality, events, brands, and district intelligence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/partners" className="dp-cta-primary inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.14em]">
                  Start a Partner Conversation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/downtown-perks/card" className="dp-cta-secondary inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.14em]">
                  Get Resident Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-2">
              {revenueLayers.map(([layer, model]) => (
                <div key={layer} className="grid gap-1 border-t border-[var(--dp-border)] py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{layer}</span>
                  <strong className="text-base font-semibold tracking-[-0.02em] text-[var(--dp-navy)]">{model}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 md:px-6">
        <div className="dp-page-shell grid gap-4">
          {sections.map((section, index) => (
            <article key={section.id} id={section.id} className="dp-band grid gap-7 p-6 md:p-8 lg:p-10">
              <div className="grid gap-5 md:grid-cols-[64px_1fr]">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--dp-gold-muted)]">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p className="dp-micro-label">{section.eyebrow}</p>
                  <h2 className="dp-display-section mt-3 text-4xl md:text-5xl">{section.title}</h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{section.narrative}</p>
                  <p className="mt-3 text-sm font-semibold text-[var(--dp-navy)]">{section.model}</p>
                </div>
              </div>

              <div className="-mx-6 grid auto-cols-[18rem] grid-flow-col gap-4 overflow-x-auto px-6 pb-2 snap-x md:mx-0 md:grid-flow-row md:grid-cols-2 md:px-0 lg:grid-cols-4">
                {section.tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
              </div>

              {section.rule ? (
                <div className="border-l-4 border-[var(--dp-gold-muted)] bg-white/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">System rule</p>
                  <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-[var(--dp-navy)]">{section.rule}</p>
                </div>
              ) : null}

              {section.tables ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {section.tables.map((table) => <PricingTable key={`${section.id}-${table.title}`} table={table} />)}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
