import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import {
  calculatePricingTotal,
  formatCurrency,
  PRICING_MODULE_GROUPS,
  getPriceText,
  getPlansForPartnerType,
} from "@/config/pricingRegistry";

const partnerCopy = {
  Venue: {
    body: "Show up in the moments that matter most. Appear while nearby residents and visitors are deciding where to eat, drink, shop, book, or explore.",
    price: "Starting at $30/year",
    cta: "Choose Venue",
  },
  Property: {
    body: "A building amenity people actually use. Connect residents to nearby places, perks, events, and neighborhood discovery through a branded property experience.",
    price: "Starting at $99/year",
    cta: "Choose Property",
  },
  Hotel: {
    body: "The stay starts at check-in. The experience continues outside your doors with nearby discovery guests can actually use.",
    price: "Starting at $99/year",
    cta: "Choose Hotel",
  },
  Brand: {
    body: "Show up where local attention becomes action through places, events, and real-world moments.",
    price: "Starting at $99/year",
    cta: "Choose Brand",
  },
  Civic: {
    body: "Help people discover what is happening around them across civic programs, public events, districts, and community initiatives.",
    price: "Starting at $30/year",
    cta: "Choose Civic",
  },
  "Real Estate": {
    body: "For developers, brokerages, and leasing teams connecting place to demand.",
    price: "$199/year",
    cta: "Choose Real Estate",
  },
};

const faqs = [
  ["Are plans annual?", "Yes. Partner plans are annual. Modules may be one-time or annual depending on the setup."],
  ["Can I start small?", "Yes. Venues can begin with a free listing, and paid plans start at $30/year."],
  ["Can campaigns be added later?", "Yes. Campaigns, events, broadcasts, reports, and activation modules can be added when they are useful."],
  ["What if I manage multiple locations?", "Use a custom or enterprise setup so reporting, permissions, and billing can be organized under one workspace."],
  ["Does this include the partner workspace?", "Yes. Paid partner setups unlock the workspace features connected to the selected plan and modules."],
];

const moduleOrder = [
  "campaigns",
  "events",
  "placements",
  "broadcasts",
  "research",
  "reporting",
  "activation",
  "support",
  "sponsorships",
  "annualAddOns",
];

const PRICING_PARTNER_TYPES = ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate"];

const pricingPrinciples = [
  ["1. Choose Partner Type", "Start with the operating model that matches how your organization shows up downtown."],
  ["2. Select Plan", "Compare maturity levels by what changes operationally, not just by price."],
  ["3. Add Modules", "Layer in campaigns, events, research, reporting, broadcasts, or activation only when useful."],
  ["4. Review Total", "See the annual setup and any one-time modules before moving forward."],
  ["5. Continue to Registration", "Confirm the setup and send the details needed to prepare the workspace."],
];

const moduleEyebrows = {
  campaigns: "One-Time Campaigns",
  events: "Events",
  placements: "Placements",
  broadcasts: "Broadcasts",
  research: "Surveys + Research",
  reporting: "Analytics + Reporting",
  activation: "Activation Services",
  support: "Support Services",
  sponsorships: "Paid Media",
  annualAddOns: "Annual Add-Ons",
};

const moduleGroupCopy = {
  campaigns: "Promote a perk, offer, or featured moment.",
  events: "Help nearby people find something worth doing.",
  placements: "Own a category or district window for a defined period.",
  broadcasts: "Reach nearby residents when timing matters.",
  research: "Ask better local questions and turn the answers into action.",
  reporting: "Translate saves, scans, directions, and redemptions into usable signals.",
  activation: "Add hands-on support for launch, field, and partner moments.",
  support: "Add operational help when the program needs more lift.",
  sponsorships: "Buy visibility around the moments and audiences that matter.",
  annualAddOns: "Keep key capabilities active throughout the year.",
};

const enterpriseOptions = [
  ["Multi-property portfolios", "Organize multiple buildings under one partner workspace with shared reporting, property-level access, and package controls.", "multi-property"],
  ["District programs", "Coordinate civic, venue, property, and sponsor activity across a defined downtown district.", "district-programs"],
  ["Destination sponsorships", "Own a seasonal or category moment with paid media, placements, reporting, and partner activation support.", "destination-sponsorships"],
  ["Major developments", "Connect leasing, retail, hospitality, resident access, and neighborhood storytelling around a new or repositioned address.", "major-developments"],
  ["Custom research", "Run resident, guest, visitor, or tenant research with export-ready results and a clear action plan.", "custom-research"],
  ["Custom integrations", "Connect reporting, calendar, QR, survey, or partner data into an existing operating workflow.", "custom-integrations"],
];

export default function PricingPage() {
  const [partnerType, setPartnerType] = useState("Venue");
  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const [selectedPlanId, setSelectedPlanId] = useState("venueBasicAnnual");
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const moduleGroups = PRICING_MODULE_GROUPS
    .filter((group) => moduleOrder.includes(group.id))
    .sort((a, b) => moduleOrder.indexOf(a.id) - moduleOrder.indexOf(b.id));
  const modules = moduleGroups.flatMap((group) => group.modules);
  const selectedModules = modules.filter((module) => selectedModuleIds.includes(module.id));
  const total = calculatePricingTotal(selectedPlan, selectedModules);
  const annualAddOnTotal = selectedModules
    .filter((module) => module.billing === "Annual add-on")
    .reduce((sum, item) => sum + item.price, 0);
  const oneTimeTotal = selectedModules
    .filter((module) => module.billing === "One-time module")
    .reduce((sum, item) => sum + item.price, 0);
  const totalText = selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(total);
  const setupParams = new URLSearchParams({
    intent: "partner-registration",
    partnerType,
    sku: selectedPlan?.id || "",
    modules: selectedModuleIds.join(","),
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : String(total),
    oneTimeTotal: String(oneTimeTotal),
  });
  const setupHref = `/marketing/contact?${setupParams.toString()}`;

  function choosePartner(nextPartnerType) {
    const nextPlans = getPlansForPartnerType(nextPartnerType);
    setPartnerType(nextPartnerType);
    setSelectedPlanId(nextPlans[0]?.id || "");
  }

  function toggleModule(moduleId) {
    setSelectedModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId],
    );
  }

  return (
    <main className="pricing-v4-page">
      <section className="pricing-v4-hero pricing-v4-container">
        <p className="pricing-v4-eyebrow">Partner Pricing</p>
        <h1>Choose the setup that fits how you show up downtown.</h1>
        <p>
          Start with your partner type. Add the visibility, campaign, reporting, or activation modules you need. Keep the setup simple, annual, and easy to explain.
        </p>
        <div className="pricing-v4-hero-actions">
          <a href="#pricing-builder" className="pricing-v4-cta pricing-v4-cta-primary">
            <span>Build setup</span>
            <ArrowRight aria-hidden="true" />
          </a>
          <a href="/marketing/contact?intent=partner-registration" className="pricing-v4-cta pricing-v4-cta-secondary">
            <span>Request package review</span>
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
        <div className="pricing-v4-proof-grid" aria-label="Pricing model explanation">
          {pricingPrinciples.map(([title, body]) => (
            <div key={title}>
              <Check aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{body}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="Partner Types" title="Start with your role in the local ecosystem." copy="Different partners need different kinds of visibility. Choose the model closest to how your organization participates downtown." />
        <div className="pricing-v4-partner-rail">
          {PRICING_PARTNER_TYPES.map((type) => {
            const copy = partnerCopy[type];
            return (
              <article key={type} className="pricing-v4-partner-card" data-active={partnerType === type}>
                <h3>{type}</h3>
                <p>{copy.body}</p>
                <strong>{copy.price}</strong>
                <button type="button" onClick={() => choosePartner(type)} className="pricing-v4-cta">
                  <span>{copy.cta}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container pricing-v4-module-rollups">
        <SectionHeader eyebrow="Pricing modules" title="Add only what you need." copy="Modules let partners expand from basic visibility into campaigns, events, research, reporting, broadcasts, and activation support." />
        <div className="pricing-v4-module-menu">
          {moduleGroups.map((group) => {
            const selectedCount = group.modules.filter((module) => selectedModuleIds.includes(module.id)).length;
            return (
              <article key={group.id} className="pricing-v4-module-group">
                <header className="pricing-v4-module-group-head">
                  <span>{moduleEyebrows[group.id] || "Pricing modules"}</span>
                  <h3>{group.heading}</h3>
                  <p>{moduleGroupCopy[group.id] || group.sentence}</p>
                  <small>
                    {group.modules.length} option{group.modules.length === 1 ? "" : "s"}
                    {selectedCount > 0 ? ` / ${selectedCount} selected` : ""}
                  </small>
                </header>
                <div className="pricing-v4-module-grid">
                  {group.modules.map((module) => (
                    <article key={module.id} className="pricing-v4-module">
                      <h3>{module.label}</h3>
                      <strong>{getPriceText(module)}</strong>
                      <p>{module.summary}</p>
                      <span className="pricing-v4-module-billing">{module.billing}</span>
                    </article>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="Custom Programs" title="For multi-partner, multi-location, or district-level work." copy="Some programs need more than a listing or campaign. We support larger setups across properties, hotels, venues, civic partners, sponsors, and development teams." />
        <div className="pricing-v4-editorial-grid">
          {enterpriseOptions.map(([title, copy, slug]) => (
            <article key={title} className="pricing-v4-editorial-item">
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href={`/marketing/contact?intent=partner-registration&interest=enterprise&enterprise=${encodeURIComponent(slug)}`} className="pricing-v4-cta pricing-v4-enterprise-cta">
                <span>Request custom setup</span>
                <ArrowRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="FAQ" title="Practical answers." />
        <div className="pricing-v4-faq">
          {faqs.map(([question, answer], index) => (
            <details key={question} open={openFaqIndex === index}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setOpenFaqIndex((current) => (current === index ? -1 : index));
                }}
              >
                <span>{question}</span>
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="pricing-builder" className="pricing-v4-section pricing-v4-container pricing-v4-builder-bottom" aria-label="Pricing calculator">
        <SectionHeader eyebrow="Package builder" title="Build the setup." copy="Use the calculator after reviewing the options. Selected modules map to the partner portal features and package entitlements." />
        <div className="pricing-v4-calculator">
          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Partner type</p>
            <TextRail items={PRICING_PARTNER_TYPES} active={partnerType} onSelect={choosePartner} />
          </div>

          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Annual plan</p>
            <div className="pricing-v4-list">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className="pricing-v4-line-action"
                  data-active={selectedPlan?.id === plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  data-sku={plan.id}
                >
                  <span>
                    {plan.label}
                    <small>{plan.bestFor}</small>
                  </span>
                  <strong>{getPriceText(plan)}</strong>
                  <em>{plan.includes.join(" / ")}</em>
                </button>
              ))}
            </div>
          </div>

          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Optional modules</p>
            <div className="pricing-v4-module-flow">
              {moduleGroups.map((group) => (
                <div key={group.id} className="pricing-v4-mini-group">
                  <h3>{group.heading}</h3>
                  {group.modules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      className="pricing-v4-line-action"
                      data-active={selectedModuleIds.includes(module.id)}
                      onClick={() => toggleModule(module.id)}
                      data-sku={module.id}
                    >
                      <span>
                        {module.label}
                        <small>{module.billing}</small>
                      </span>
                      <strong>{getPriceText(module)}</strong>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="pricing-v4-summary">
            <p className="pricing-v4-label">Setup summary</p>
            <h2>{totalText}</h2>
            <div className="pricing-v4-summary-plan">
              <strong>{selectedPlan?.label || "Choose a plan"}</strong>
              <span>{selectedPlan?.summary || "Select a plan to begin."}</span>
            </div>
            <div className="pricing-v4-summary-lines" aria-label="Pricing total breakdown">
              <p><span>Annual subscription</span><strong>{selectedPlan ? getPriceText(selectedPlan) : "$0/year"}</strong></p>
              <p><span>Annual add-ons</span><strong>{formatCurrency(annualAddOnTotal)}</strong></p>
              <p><span>One-time modules</span><strong>{formatCurrency(oneTimeTotal)}</strong></p>
            </div>
            <div className="pricing-v4-selected-modules">
              {selectedModules.length > 0 ? selectedModules.map((module) => (
                <button key={module.id} type="button" onClick={() => toggleModule(module.id)}>
                  {module.label}
                </button>
              )) : <span>No add-ons selected yet.</span>}
            </div>
            <a href={setupHref} className="pricing-v4-cta pricing-v4-cta-primary" data-sku={selectedPlan?.id || ""}>
              <span>Register partner account</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container pricing-v4-final">
        <p className="pricing-v4-eyebrow">Next Step</p>
        <h2>Register your partner account.</h2>
        <p>Create your account to save this setup, confirm the right package, and unlock the partner workspace for your business.</p>
        <a href={setupHref} className="pricing-v4-cta pricing-v4-cta-primary">
          <span>Register partner account</span>
          <ArrowRight aria-hidden="true" />
        </a>
        <a href="/marketing/contact?intent=partner-registration" className="pricing-v4-cta pricing-v4-cta-secondary">
          <span>Request package review</span>
          <ArrowRight aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="pricing-v4-section-head">
      <p className="pricing-v4-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function TextRail({ items, active, onSelect }) {
  return (
    <div className="pricing-v4-text-rail">
      {items.map((item) => (
        <button key={item} type="button" data-active={active === item} onClick={() => onSelect(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
