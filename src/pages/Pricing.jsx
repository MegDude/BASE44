import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  calculatePricingTotal,
  formatCurrency,
  PRICING_MODULE_GROUPS,
  getPriceText,
  getPlansForPartnerType,
} from "@/config/pricingRegistry";

const partnerCopy = {
  Venue: {
    body: "For restaurants, bars, coffee shops, wellness, retail and local services.",
    price: "Starting at $30/year",
    cta: "Choose Venue",
  },
  Property: {
    body: "For apartments, condos, mixed-use and residential communities.",
    price: "Starting at $49/year",
    cta: "Choose Property",
  },
  Hotel: {
    body: "For hotels, hospitality groups, and guest experience teams.",
    price: "Starting at $99/year",
    cta: "Choose Hotel",
  },
  Brand: {
    body: "For local, regional and national brands.",
    price: "Starting at $99/year",
    cta: "Choose Brand",
  },
  Civic: {
    body: "For districts, associations, nonprofits and public programs.",
    price: "Starting at $30/year",
    cta: "Choose Civic",
  },
  "Real Estate": {
    body: "For developers, brokerages and leasing teams.",
    price: "$199/year",
    cta: "Choose Real Estate",
  },
};

const faqs = [
  ["Are partner subscriptions monthly or annual?", "Partner subscriptions are annual. Add-ons can be one-time or annual depending on the module."],
  ["Can I start small?", "Yes. Venues can start with a free listing, and paid venue plans now begin at $30/year."],
  ["Can I add campaigns later?", "Yes. Campaigns, events, research, reporting, and sponsorship modules can be added when they are useful."],
  ["What if my setup is custom?", "Send the setup for review and we will route it to the right pilot, checkout, or conversation."],
];

const moduleOrder = [
  "campaigns",
  "events",
  "placements",
  "broadcasts",
  "research",
  "activation",
  "annualAddOns",
];

const PRICING_PARTNER_TYPES = ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate"];

export default function PricingPage() {
  const [partnerType, setPartnerType] = useState("Venue");
  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const [selectedPlanId, setSelectedPlanId] = useState("venueBasicAnnual");
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

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
  const setupHref = `/marketing/contact?partnerType=${encodeURIComponent(partnerType)}&sku=${encodeURIComponent(selectedPlan?.id || "")}&modules=${encodeURIComponent(selectedModuleIds.join(","))}`;

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
        <h1>Choose the setup that fits.</h1>
        <p>
          Start with a partner type, choose an annual plan, add only the modules that matter, then send the setup for checkout or review.
        </p>
      </section>

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="Partner Types" title="Pick the lane." copy="One card per partner type. Plans live in the calculator." />
        <div className="pricing-v4-partner-rail">
          {PRICING_PARTNER_TYPES.map((type) => {
            const copy = partnerCopy[type];
            return (
              <article key={type} className="pricing-v4-partner-card">
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

      <section className="pricing-v4-section pricing-v4-container" aria-label="Pricing calculator">
        <SectionHeader eyebrow="Calculator" title="Build the setup." />
        <div className="pricing-v4-calculator">
          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Choose Partner Type</p>
            <TextRail items={PRICING_PARTNER_TYPES} active={partnerType} onSelect={choosePartner} />
          </div>

          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Choose Plan</p>
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
                  <span>{plan.label}</span>
                  <strong>{getPriceText(plan)}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="pricing-v4-block">
            <p className="pricing-v4-label">Choose Add-ons</p>
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
                      <span>{module.label}</span>
                      <strong>{getPriceText(module)}</strong>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="pricing-v4-summary">
            <p className="pricing-v4-label">Summary</p>
            <h2>{formatCurrency(total)}</h2>
            <div className="pricing-v4-summary-lines" aria-label="Pricing total breakdown">
              <p><span>Annual subscription</span><strong>{formatCurrency(selectedPlan?.annualPrice || 0)}</strong></p>
              <p><span>Annual add-ons</span><strong>{formatCurrency(annualAddOnTotal)}</strong></p>
              <p><span>One-time modules</span><strong>{formatCurrency(oneTimeTotal)}</strong></p>
            </div>
            <p>{selectedPlan?.label || "Choose a plan"} plus {selectedModules.length} module{selectedModules.length === 1 ? "" : "s"}.</p>
            <a href={setupHref} className="pricing-v4-cta pricing-v4-cta-primary" data-sku={selectedPlan?.id || ""}>
              <span>Checkout Setup</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {moduleGroups.map((group) => (
        <section key={group.id} className="pricing-v4-section pricing-v4-container">
          <SectionHeader eyebrow={group.heading} title={group.heading} copy={group.sentence} />
          <div className="pricing-v4-rail">
            {group.modules.map((module) => (
              <article key={module.id} className="pricing-v4-module">
                <h3>{module.label}</h3>
                <strong>{getPriceText(module)}</strong>
                <p>{module.summary}</p>
                <button type="button" onClick={() => toggleModule(module.id)} className="pricing-v4-cta" data-sku={module.id}>
                  <span>{selectedModuleIds.includes(module.id) ? "Remove" : "Add To Setup"}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <a href={`/marketing/contact?sku=${encodeURIComponent(module.id)}`} className="pricing-v4-cta pricing-v4-cta-secondary" data-sku={module.id}>
                  <span>Full Pricing</span>
                  <ArrowRight aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="Enterprise" title="Need something custom?" />
        <div className="pricing-v4-editorial-grid">
          {["Multi-property", "District programs", "Destination sponsorships", "Major developments", "Custom research", "Custom integrations"].map((item) => (
            <article key={item} className="pricing-v4-editorial-item">
              <h3>{item}</h3>
              <p>Send the setup and we will route it to the right checkout, pilot, or conversation.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container">
        <SectionHeader eyebrow="FAQ" title="Practical answers." />
        <div className="pricing-v4-faq">
          {faqs.map(([question, answer]) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pricing-v4-section pricing-v4-container pricing-v4-final">
        <h2>Ready to price the setup?</h2>
        <a href={setupHref} className="pricing-v4-cta pricing-v4-cta-primary">
          <span>Checkout Setup</span>
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
