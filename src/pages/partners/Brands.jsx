import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import PartnerMapIntelligenceLayer from "@/components/partner/PartnerMapIntelligenceLayer";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_BRANDS } from "@/lib/faq-partner-data";

const CAMPAIGN_POINTS = [
  {
    id: "campaign-see-austin-differently-fine-eyewear",
    name: "See Austin Differently",
    type: "Discovery trail",
    district: "Waterloo",
    lat: 30.27391,
    lng: -97.73543,
    logo: "/pins/brands/fine-eyewear-logo-gold.svg",
    scans: 0,
    saves: 0,
    redemptions: 0,
    signal: "Fine Eyewear × Waterloo Greenway",
  },
  {
    id: "legends",
    name: "Legends Real Estate",
    type: "Verified listing layer",
    district: "2nd Street",
    lat: 30.2659,
    lng: -97.7475,
    logo: "/pins/downtown-perks/legends-logo.png",
    scans: 340,
    saves: 118,
    redemptions: 58,
    signal: "Listings + resident interest",
  },
  {
    id: "paseo",
    name: "The Paseo",
    type: "Building access",
    district: "Rainey",
    lat: 30.2578,
    lng: -97.7388,
    scans: 620,
    saves: 214,
    redemptions: 96,
    signal: "Lobby QR + resident welcome flow",
  },
  {
    id: "van-zandt",
    name: "Hotel Van Zandt",
    type: "Hospitality placement",
    district: "Rainey",
    lat: 30.2571,
    lng: -97.7392,
    scans: 410,
    saves: 122,
    redemptions: 74,
    signal: "Guest arrival + local visibility",
  },
  {
    id: "waterline",
    name: "Waterline District",
    type: "District activation",
    district: "Congress",
    lat: 30.2633,
    lng: -97.7414,
    scans: 520,
    saves: 176,
    redemptions: 88,
    signal: "Event tie-in + corridor visibility",
  },
];

const BRAND_OPERATING_MATRIX = [
  {
    title: "Map placement",
    use: "Put the campaign beside the places and categories people are already opening.",
    examples: "District pages, category searches, nearby recommendations",
    measured: "Map opens, saves, directions, and offer taps",
  },
  {
    title: "QR entry points",
    use: "Turn a lobby, venue, table tent, event sign, or printed piece into a direct map entry.",
    examples: "Building QR, venue QR, event QR",
    measured: "Scans, source placement, and follow-up actions",
  },
  {
    title: "Event tie-ins",
    use: "Connect the brand to a real event people can save, attend, or use nearby.",
    examples: "RSVP path, timed offer, post-event follow-up",
    measured: "RSVPs, saves, scans, and redemptions",
  },
  {
    title: "Resident access",
    use: "Create a resident-only reason to act without making the moment feel like an ad.",
    examples: "Resident card unlock, building offer, local perk",
    measured: "Card opens, saves, unlocks, and repeat use",
  },
];

const WORKFLOW = [
  ["01", "Choose the moment", "Pick the district, building, event, venue, or resident behavior the campaign should live inside."],
  ["02", "Place the entry points", "Set up map placement, QR access, offer logic, and the surfaces people will actually see."],
  ["03", "Go live downtown", "The campaign appears in context while people are nearby and already making decisions."],
  ["04", "Track what happened", "Measure scans, saves, redemptions, visits, and district activity without relying on vague impressions."],
];

const BRAND_PRICING_MATRIX = [
  ["Brand Starter", "$99 / year", "A brand profile on the partner map with basic placement, contact links, and save/share actions."],
  ["Brand Campaign", "$149 / year", "Starter plus a campaign-ready page for one clear offer, event tie-in, QR entry point, or resident-facing activation."],
  ["Campaign Add-ons", "Priced separately", "Extra placements, multi-location campaigns, event integrations, resident offers, surveys, and QR production."],
  ["Custom Activations", "Custom scope", "District campaigns, sponsorships, sampling programs, larger brand partnerships, and work outside the standard module."],
];

const BRAND_MEASUREMENT_MATRIX = [
  ["Scans", "QR codes, partner links, and campaign entry points", "Shows which physical or digital placement brought someone into the map."],
  ["Saves", "Save buttons on places, offers, events, and campaigns", "Shows what people want to keep, compare, or come back to later."],
  ["Redemptions", "Resident card use, offer unlocks, partner confirmation, or tracked follow-up", "Shows whether the campaign led to a real action."],
  ["Places opened", "Map drawers, nearby recommendations, and category searches", "Shows which downtown context helped someone decide what to do next."],
  ["Directions", "Direction taps from the campaign, pin, offer, or event", "Shows when interest turns into a likely visit."],
  ["Follow-up", "Form starts, RSVPs, requests, shares, and calendar adds", "Shows which next step deserves more attention."],
];

const PROMPTS = [
  "We want to activate a downtown district.",
  "We want a campaign tied to residents and buildings.",
  "We want QR entry points connected to the map.",
  "We want to track real-world scans and redemptions.",
];

function Section({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} className={`border-t border-[#0B1F33]/8 px-5 py-14 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && <span className="dp-label mb-3 block dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{eyebrow}</span>}
            {title && <h2 className="font-heading text-3xl font-medium leading-[1.08] text-[#0B1F33] md:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function PrimaryButton({ href, children }) {
  return (
    <a href={href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-normal text-white transition hover:bg-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]">
      {children}
      <ArrowRight className="h-4 w-4 text-[#BFA46A]" />
    </a>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <a href={href} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-normal text-[#0B1F33] transition hover:border-[#BFA46A]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]">
      {children}
    </a>
  );
}

export default function BrandsPartner() {
  const [activePoint, setActivePoint] = useState(CAMPAIGN_POINTS[0]);
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);
  const [submitted, setSubmitted] = useState(false);

  function submitPlan(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="dp-partner-page min-h-screen bg-white pt-[68px] text-[#0B1F33]">
      <section className="relative overflow-hidden px-5 py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(11,31,51,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,51,0.28) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div className="relative mx-auto max-w-6xl">
          <Link to="/partners" className="dp-partner-back-button mb-8 inline-flex items-center justify-center text-[#0B1F33]/58 transition hover:text-[#0B1F33]" aria-label="Back to partners" title="Back to partners">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <span className="dp-label mb-4 block dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Brand Partner Layer</span>
              <h1 className="font-heading text-[38px] font-medium leading-[1.03] md:text-[56px]">
                Buy the moment, not the impression.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-[#0B1F33]/68">
                The best advertising does not feel like advertising. It feels like something useful that arrived at the right time. Downtown Perks places brands inside decisions already happening downtown: coffee, lunch, drinks, events, tonight.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton href="#brand-form">Start a conversation</PrimaryButton>
                <SecondaryButton href="#brand-map">See where it fits</SecondaryButton>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="dp-glass-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#0B1F33]/50 dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">Campaign preview</span>
                <Sparkles className="h-4 w-4 text-[#BFA46A]" />
              </div>
              <div className="mt-5 rounded-md border border-[#0B1F33]/8 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0B1F33] text-[#BFA46A]">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0B1F33]">{activePoint.name}</div>
                    <div className="text-[11px] text-[#0B1F33]/52">{activePoint.type} · {activePoint.district}</div>
                  </div>
                </div>
                <p className="mt-4 text-[12px] leading-5 text-[#0B1F33]/62">{activePoint.signal}</p>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-[#0B1F33]/52">Start with one place, one reason to act, and one clear way to measure what happened next.</p>
            </motion.aside>
          </div>
        </div>
      </section>

      <Section id="brand-map" eyebrow="Brand placement" title="Where a brand can fit into downtown plans.">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden" style={{ height: 440 }}>
            <PartnerMapIntelligenceLayer
              activeId={activePoint.id}
              caption="Brand placement map"
              insight="Choose a real downtown context first: a building, hotel, event, district, or nearby route."
              kind="brand"
              onSelect={setActivePoint}
              points={CAMPAIGN_POINTS}
            />
          </div>

          <div className="dp-brand-placement-panel">
            <p className="dp-brand-micro-label">Selected example</p>
            <h3>{activePoint.name}</h3>
            <p>{activePoint.type} in {activePoint.district}. {activePoint.signal}.</p>
            <div className="dp-brand-placement-actions">
              <span>Best next step</span>
              <strong>{activePoint.type.includes("QR") || activePoint.type.includes("access") ? "Connect the entry point" : "Create a clear campaign page"}</strong>
            </div>
            <div className="dp-brand-placement-list" aria-label="Brand placement examples">
              {CAMPAIGN_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setActivePoint(point)}
                  className={point.id === activePoint.id ? "is-active" : ""}
                >
                  <span>
                    <strong>{point.name}</strong>
                    <small>{point.type} · {point.district}</small>
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Campaign setup" title="Choose the placement before choosing the offer.">
        <div className="dp-brand-matrix-rail" aria-label="Brand campaign setup options">
          {BRAND_OPERATING_MATRIX.map((item) => (
            <article key={item.title} className="dp-brand-matrix-card">
              <h3>{item.title}</h3>
              <p>{item.use}</p>
              <dl>
                <div>
                  <dt>Example</dt>
                  <dd>{item.examples}</dd>
                </div>
                <div>
                  <dt>What you can measure</dt>
                  <dd>{item.measured}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Workflow" title="How a downtown campaign turns into action." className="bg-white">
        <div className="grid gap-3 md:grid-cols-4">
          {WORKFLOW.map(([num, title, copy]) => (
            <article key={num} className="rounded-md border border-[#0B1F33]/8 bg-white p-5">
              <div className="text-[#BFA46A] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{num}</div>
              <h3 className="mt-4 font-body text-[14px] font-semibold text-[#0B1F33]">{title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#0B1F33]/62">{copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-[#0B1F33]/8 bg-white p-4 text-center text-[13px] font-medium text-[#0B1F33]/70">
          QR entry <span className="mx-3 text-[#0B1F33]/34">→</span>
          Map open <span className="mx-3 text-[#0B1F33]/34">→</span>
          Save or scan <span className="mx-3 text-[#0B1F33]/34">→</span>
          Visit <span className="mx-3 text-[#0B1F33]/34">→</span>
          Redemption
        </div>
      </Section>

      <Section id="proof" eyebrow="Measurement" title="What can be measured, and how.">
        <div className="dp-brand-measurement-table" role="table" aria-label="Brand campaign measurement">
          <div role="row" className="dp-brand-measurement-head">
            <span role="columnheader">What</span>
            <span role="columnheader">How it is captured</span>
            <span role="columnheader">Why it helps</span>
          </div>
          {BRAND_MEASUREMENT_MATRIX.map(([label, capture, helps]) => (
            <div key={label} role="row" className="dp-brand-measurement-row">
              <strong role="cell">{label}</strong>
              <span role="cell">{capture}</span>
              <span role="cell">{helps}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Brand pricing" title="Start with the annual module, then price larger activations separately.">
        <div className="grid gap-5 lg:grid-cols-[0.76fr_1.24fr]">
          <div>
            <p className="text-[14px] leading-7 text-[#0B1F33]/66">
              Brand pricing starts with a simple annual setup. Campaigns, custom activations, sponsorships, sampling, surveys, broadcasts, and larger district work are scoped separately when they sit outside the standard module.
            </p>
            <Link to="/marketing/pricing" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-normal text-white transition hover:bg-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]">
              View pricing matrix
              <ArrowRight className="h-4 w-4 text-[#BFA46A]" />
            </Link>
          </div>
          <div className="dp-brand-pricing-table" role="table" aria-label="Brand pricing options">
            {BRAND_PRICING_MATRIX.map(([tier, price, copy]) => (
              <div key={tier} role="row" className="dp-brand-pricing-row">
                <strong role="cell">{tier}</strong>
                <span role="cell">{price}</span>
                <p role="cell">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="brand-form" eyebrow="Brand Planning" title="Start a brand conversation." className="bg-white">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="dp-brand-form-context">
            <Building2 className="h-5 w-5 text-[#BFA46A]" />
            <h3>Start with the moment you want to own.</h3>
            <p>Tell us where the campaign should live, who it should help, and what someone should be able to do next.</p>
          </div>

          <form onSubmit={submitPlan} className="grid gap-3 rounded-lg border border-[#0B1F33]/8 bg-white p-5">
            {["Brand/Company Name", "Your Name & Role", "Email", "Phone", "Timeline"].map((label) => (
              <label key={label} className="grid gap-1.5">
                <span className="text-[#0B1F33]/50 dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{label}</span>
                <input required={label !== "Phone"} className="h-10 rounded-md border border-[#0B1F33]/10 bg-white px-3 text-[13px] outline-none focus:border-[#BFA46A]" />
              </label>
            ))}
            <label className="grid gap-1.5">
              <span className="text-[#0B1F33]/50 dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">What are you activating?</span>
              <textarea
                value={selectedPrompt}
                onChange={(event) => setSelectedPrompt(event.target.value)}
                className="min-h-28 rounded-md border border-[#0B1F33]/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#BFA46A]"
              />
              <div className="dp-partner-prompt-inline" aria-label="Suggested brand prompts">
                {PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => setSelectedPrompt(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </label>
            <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-[#0B1F33] px-5 text-[12px] font-semibold uppercase tracking-normal text-white transition hover:bg-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]">
              Start a conversation
            </button>
            {submitted && (
              <p className="rounded-md border border-[#BFA46A]/35 bg-white px-3 py-2 text-[12px] text-[#0B1F33]/68">
                Thanks. Your brand campaign request is ready for follow-up.
              </p>
            )}
          </form>
        </div>
      </Section>

      <FAQAccordionBlock
        sectionEyebrow="Brand FAQs"
        sectionTitle="Questions about downtown campaigns"
        sectionIntro="Brands use Downtown Perks to show up inside real downtown plans, not beside them."
        items={FAQ_BRANDS}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="brands"
        backgroundVariant="light"
      />

      <Section eyebrow="Final CTA" title="Build the campaign around the downtown moment.">
        <div className="max-w-3xl">
          <p className="text-[14px] leading-7 text-[#0B1F33]/68">
            Downtown Perks gives brands a way to show up inside live local behavior instead of sitting beside it. Start with the format that fits the objective, then connect placements, offer logic, and measurement into one downtown campaign system.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="#brand-form">Start a conversation</PrimaryButton>
            <Link to="/map?mode=partner&tab=map&filter=All" className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-normal text-[#0B1F33] transition hover:border-[#BFA46A]/45">
              Partner overview
            </Link>
            <Link to="/marketing/pricing" className="inline-flex h-10 items-center justify-center rounded-md border border-[#0B1F33]/10 bg-white px-5 text-[12px] font-semibold uppercase tracking-normal text-[#0B1F33] transition hover:border-[#BFA46A]/45">
              Pricing matrix
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
