import { Link } from "react-router-dom";
import { ArrowRight, Building2, ChevronLeft, Landmark, MapPin, Megaphone, Sparkles, Users } from "lucide-react";

const layers = [
  ["Residents", "Annual membership"],
  ["Properties", "Monthly infrastructure subscription"],
  ["Venues", "Free entry + paid amplification"],
  ["Hospitality", "Concierge + guest engagement"],
  ["Brands", "Campaign activations + sponsorship"],
  ["Civic", "Sponsored / enterprise licensing"],
];

const residents = [
  ["Resident Membership", "$25/year", "12 months"],
  ["Building-Included Access", "Included", "Active while property participates"],
];

const residentIncludes = ["save places", "RSVP to events", "redeem perks", "resident-only offers", "map personalization", "QR perks card", "member event access"];

const propertyTiers = [
  ["Pilot", "Free", "90 days", "Start Free Pilot", ["full onboarding", "resident activation", "QR deployment", "live map placement", "event layer", "top-line reporting"]],
  ["Connected", "$149/month", "Most Popular", "Get Started", ["resident dashboard", "save + RSVP analytics", "building communication layer", "featured property profile", "neighborhood engagement reporting"]],
  ["Intelligence", "$499/month", "Luxury residential, mixed-use, retention-focused operators", "Book Strategy Call", ["behavioral analytics", "segmentation reporting", "leasing attribution", "campaign integrations", "district benchmarking", "sponsored placements", "custom programming", "dedicated account manager"]],
  ["District Enterprise", "Custom", "Developers, portfolios, REITs, mixed-use districts", "Contact Sales", ["portfolio analytics", "API integrations", "district overlays", "custom dashboards", "multi-property reporting", "district campaign attribution", "white-label integrations"]],
];

const propertyAddOns = [
  ["Activation", [["QR Activation Kit", "$49/year"], ["Move-In Campaigns", "$149/year"], ["Resident Nudges", "$99/year"]]],
  ["Intelligence", [["Engagement Dashboard", "Included in Connected"], ["Conversion Tracking", "$99/month"], ["Area Intelligence", "$149/month"]]],
  ["Visibility", [["Featured Building Placement", "$99/month"], ["District Highlight Placement", "$249/month"]]],
];

const venueTiers = [
  ["Venue Access", "Free", "Join Free", ["active business", "valid operating hours", "resident perk or offer"], ["map placement", "event visibility", "perk listing", "resident discovery", "QR redemption support"]],
  ["Featured Venue", "$79/month", "Upgrade Visibility", [], ["boosted placement", "featured event visibility", "trending eligibility", "enhanced profile", "campaign participation"]],
  ["Venue Intelligence", "$249/month", "Request Demo", [], ["traffic analytics", "redemption analytics", "district comparisons", "peak engagement timing", "audience behavior insights", "campaign reporting"]],
  ["District Venue Partner", "$499/month", "", [], ["district priority placement", "campaign inclusion", "district trend reporting", "event amplification", "sponsored recommendation inclusion"]],
];

const venueCampaigns = [["Boost", "$49", "24 hours"], ["Standard", "$149", "72 hours"], ["Premium", "$349", "7 days"], ["District Spotlight", "$599", "7 days"]];

const venueAddOns = [
  ["Targeting", [["Radius Targeting", "$49"], ["Time-Based Targeting", "$49"], ["Audience Targeting", "$99"]]],
  ["Visibility", [["Featured Feed Placement", "$99"], ["Priority Pin Boost", "$49"], ["Trending Placement", "$149"]]],
  ["Extensions", [["+1 Day Extension", "$49"], ["+3 Day Extension", "$99"]]],
];

const hospitality = [
  ["Guest Access", "$199/month", ["guest perks access", "live neighborhood map", "hotel-branded layer", "QR guest onboarding", "local recommendations"]],
  ["Concierge Intelligence", "$599/month", ["guest engagement analytics", "sponsored itineraries", "event integrations", "local partnership campaigns", "premium placement"]],
  ["Enterprise Hospitality", "Custom", ["multi-property support", "district sponsorships", "white-label integrations", "concierge API layers", "enterprise analytics"]],
];

const brandPresence = [["Local Presence", "$999/year"], ["District Presence", "$2,500/year"], ["Citywide Presence", "$5,000/year"]];
const brandActivations = [["Standard Activation", "Starting at $2,500"], ["Premium Activation", "Starting at $5,000"], ["District Takeover", "Starting at $10,000"]];
const brandAddOns = [["Sponsored Map Layer", "$2,500"], ["Multi-Venue Overlay", "$999"], ["Audience Targeting", "$499"], ["Premium Analytics", "$999"]];

const civic = [["Community Organizations", "Free"], ["Civic Event Partners", "Sponsored"], ["District Intelligence Access", "Custom"], ["Citywide Licensing", "Enterprise"]];

function PriceLine({ name, price, detail, cta }) {
  return (
    <div className="grid gap-3 border-b border-[var(--dp-divider)] py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_170px_220px] md:items-center">
      <div>
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">{name}</div>
        {detail ? <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{detail}</div> : null}
      </div>
      <div className="font-heading text-[1.9rem] font-semibold tracking-[-0.055em] text-[var(--dp-navy)] md:text-right">{price}</div>
      {cta ? <Link to="/partners/apply" className="dp-link-action justify-self-start md:justify-self-end">{cta}</Link> : <span />}
    </div>
  );
}

function AddOnTable({ title, rows }) {
  return (
    <div className="rounded-[22px] border border-[rgba(11,31,51,0.08)] bg-white/76 p-5">
      <div className="dp-micro-label">{title}</div>
      <div className="mt-4 space-y-3">
        {rows.map(([name, price]) => (
          <div key={`${title}-${name}`} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[var(--dp-divider)] pb-3 text-[13px] last:border-b-0 last:pb-0">
            <span className="font-semibold text-foreground/86">{name}</span>
            <strong className="text-[var(--dp-navy)]">{price}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncludesList({ items, light = false }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold ${light ? "border-white/12 bg-white/6 text-white/76" : "border-[rgba(11,31,51,0.08)] bg-white/70 text-muted-foreground"}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function Pricing() {
  return (
    <main className="min-h-screen bg-[var(--dp-surface-base)] pb-14 pt-[84px] text-foreground">
      <div className="dp-page-shell space-y-4">
        <section className="dp-band p-6 md:p-8 lg:p-10">
          <Link to="/" className="dp-cta-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className="dp-micro-label">Final pricing system</div>
              <h1 className="dp-display-hero mt-4 max-w-4xl text-[2.8rem] text-foreground md:text-[5rem]">
                Infrastructure for how downtown operates.
              </h1>
              <p className="mt-5 max-w-3xl text-[16px] leading-7 text-foreground/78">
                Downtown Perks is not a local deals app. It is a live downtown operating layer connecting residents, buildings, local businesses, hospitality, events, brands, and district intelligence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/partners/apply" className="dp-cta-primary">Start a Partner Conversation</Link>
                <Link to="/downtown-perks/card" className="dp-cta-secondary">Get Resident Access</Link>
              </div>
            </div>
            <div className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white/72 p-5">
              <div className="dp-micro-label">Revenue architecture</div>
              <div className="mt-3 divide-y divide-[var(--dp-divider)]">
                {layers.map(([layer, model]) => (
                  <div key={layer} className="grid grid-cols-[105px_1fr] gap-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">{layer}</span>
                    <strong className="text-[13px] leading-5 text-[var(--dp-navy)]">{model}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="residents" className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="dp-band p-6">
            <div className="dp-micro-label">01 / Residents</div>
            <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.045em] text-foreground">Small access layer. Large signal value.</h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">Residents are not the primary revenue driver. They create density, recurring map usage, and behavioral intelligence for the whole network.</p>
            <IncludesList items={residentIncludes} />
          </div>
          <div className="dp-band dp-band-muted p-6">
            <div className="divide-y divide-[var(--dp-divider)]">
              {residents.map(([name, price, detail]) => <PriceLine key={name} name={name} price={price} detail={detail} cta={name === "Resident Membership" ? "Get Membership" : "Activate Access"} />)}
            </div>
            <div className="mt-5 border-l-4 border-[var(--dp-gold-muted)] bg-white/70 p-4">
              <div className="dp-micro-label">System rule</div>
              <p className="mt-2 text-[13px] font-semibold leading-6 text-foreground/82">If a resident pays individually and later joins a participating building, Downtown Perks automatically refunds the membership or converts it to account credit.</p>
            </div>
          </div>
        </section>

        <section id="properties" className="dp-band dp-band-dark overflow-hidden p-0 text-white">
          <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/8 text-[var(--dp-gold-muted)]"><Building2 className="h-5 w-5" /></div>
              <div className="dp-micro-label mt-6 text-[var(--dp-gold-muted)]">02 / Core infrastructure layer</div>
              <h2 className="mt-4 font-heading text-[2.6rem] font-semibold leading-none tracking-[-0.055em] text-white md:text-[4.4rem]">Properties anchor the system.</h2>
              <p className="mt-5 text-[15px] leading-7 text-white/72">Properties are paying for resident engagement, retention infrastructure, leasing differentiation, neighborhood intelligence, communication systems, and district visibility.</p>
            </div>
            <div className="divide-y divide-white/10">
              {propertyTiers.map(([name, price, detail, cta, includes]) => (
                <div key={name} className="grid gap-4 px-6 py-6 md:grid-cols-[minmax(0,1fr)_180px] md:px-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[1.45rem] font-semibold tracking-[-0.035em] text-white">{name}</h3>
                      {detail === "Most Popular" ? <span className="rounded-full bg-[rgba(207,175,90,0.15)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">Most Popular</span> : null}
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-white/62">{detail === "Most Popular" ? "Best for independent buildings, lease-up properties, and resident engagement rollout." : detail}</p>
                    <IncludesList items={includes} light />
                  </div>
                  <div className="md:text-right">
                    <div className="font-heading text-[2.3rem] font-semibold tracking-[-0.055em] text-white">{price}</div>
                    <Link to="/partners/apply" className="mt-3 inline-flex text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold-muted)]">{cta}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {propertyAddOns.map(([title, rows]) => <AddOnTable key={title} title={`Property ${title}`} rows={rows} />)}
        </section>

        <section id="venues" className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <MapPin className="h-6 w-6 text-[var(--dp-gold-muted)]" />
              <div className="dp-micro-label mt-5">03 / Venues</div>
              <h2 className="mt-3 font-heading text-[2.4rem] font-semibold leading-none tracking-[-0.055em] text-foreground md:text-[3.6rem]">Free entry. Paid amplification.</h2>
              <p className="mt-4 text-[14px] leading-7 text-muted-foreground">Venue growth depends on inventory density, participation volume, and active offers. Entry stays frictionless so the map feels alive.</p>
            </div>
            <div className="rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-white/74 p-5">
              {venueTiers.map(([name, price, cta, requirements, includes]) => (
                <div key={name} className="border-b border-[var(--dp-divider)] py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-foreground">{name}</h3>
                      {requirements.length ? <p className="mt-1 text-[12px] leading-5 text-muted-foreground">Requires {requirements.join(" + ")}.</p> : null}
                    </div>
                    <div className="font-heading text-[2rem] font-semibold tracking-[-0.055em] text-[var(--dp-navy)] md:text-right">{price}</div>
                  </div>
                  <IncludesList items={includes} />
                  {cta ? <Link to="/partners/apply" className="mt-3 inline-flex text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-navy)]">{cta}</Link> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="dp-band dp-band-muted p-6 md:p-8">
            <div className="dp-micro-label">Venue campaigns</div>
            <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.045em] text-foreground">Timed visibility products.</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {venueCampaigns.map(([name, price, duration]) => (
                <div key={name} className="rounded-[20px] bg-white/80 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{name}</div>
                  <div className="mt-2 font-heading text-[2rem] font-semibold tracking-[-0.055em] text-[var(--dp-navy)]">{price}</div>
                  <div className="text-[12px] text-muted-foreground">{duration}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {venueAddOns.map(([title, rows]) => <AddOnTable key={title} title={title} rows={rows} />)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div id="hospitality" className="dp-band p-6 lg:col-span-1">
            <Sparkles className="h-5 w-5 text-[var(--dp-gold-muted)]" />
            <div className="dp-micro-label mt-5">04 / Hospitality</div>
            <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-[-0.045em] text-foreground">Guest experience systems.</h2>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">Hotels are not venues. They are concierge layers and district orientation infrastructure.</p>
          </div>
          <div className="dp-band dp-band-muted p-6 lg:col-span-2">
            {hospitality.map(([name, price, includes]) => <PriceLine key={name} name={name} price={price} detail={includes.join(" · ")} />)}
          </div>
        </section>

        <section id="brands" className="dp-band p-6 md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Megaphone className="h-6 w-6 text-[var(--dp-gold-muted)]" />
              <div className="dp-micro-label mt-5">05 / Brands</div>
              <h2 className="mt-3 font-heading text-[2.4rem] font-semibold leading-none tracking-[-0.055em] text-foreground md:text-[3.4rem]">Context, not impressions.</h2>
              <p className="mt-4 text-[14px] leading-7 text-muted-foreground">Brands pay for contextual visibility, geographic relevance, downtown movement, and real-world engagement.</p>
            </div>
            <div className="grid gap-4">
              <AddOnTable title="Annual Presence" rows={brandPresence} />
              <AddOnTable title="Campaign Activations" rows={brandActivations} />
              <AddOnTable title="Brand Add-Ons" rows={brandAddOns} />
            </div>
          </div>
        </section>

        <section id="civic" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="dp-band p-6 md:p-8">
            <Landmark className="h-6 w-6 text-[var(--dp-gold-muted)]" />
            <div className="dp-micro-label mt-5">06 / Civic</div>
            <h2 className="mt-3 font-heading text-[2.3rem] font-semibold tracking-[-0.05em] text-foreground">Institutional, community-first, non-commercial.</h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">Civic partners use Downtown Perks for event distribution, district awareness, cultural programming support, and sponsored neighborhood initiatives.</p>
          </div>
          <div className="dp-band dp-band-muted p-6 md:p-8">
            {civic.map(([name, price]) => <PriceLine key={name} name={name} price={price} />)}
          </div>
        </section>

        <section className="dp-band p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <Users className="h-6 w-6 text-[var(--dp-gold-muted)]" />
            <div className="dp-micro-label mt-5">Final positioning</div>
            <h2 className="mt-3 font-heading text-[2.2rem] font-semibold tracking-[-0.05em] text-foreground">The pricing reinforces the operating layer.</h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">It should make partners understand that Downtown Perks is infrastructure for downtown movement, not another app competing for attention.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/partners/apply" className="dp-cta-primary">Start Partner Intake</Link>
              <Link to="/partners" className="dp-cta-secondary">View Partner System</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
