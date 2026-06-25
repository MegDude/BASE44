import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, Building2, MapPinned, Sparkles } from "lucide-react";
import { resolveCheckoutTarget } from "@/config/checkoutLinks";
import {
  calculatePricingTotal,
  formatCurrency,
  getPlansForPartnerType,
  getPriceText,
  PRICING_MODULE_GROUPS,
} from "@/config/pricingRegistry";

const PARTNER_TYPES = ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate", "Resident", "Custom"];
const PARTNER_SETUP_KEY = "dp_partner_lifecycle_setup";

const partnerCopy = {
  Venue: {
    label: "Venues",
    description: "Appear when people nearby are deciding where to eat, drink, meet, shop, or explore.",
    media: "/images/imported/perks/bangers-outside.webp",
  },
  Property: {
    label: "Properties",
    description: "Connect residents to nearby perks, events, places, and neighborhood activity.",
    media: "/images/imported/perks/waterline-hero.webp",
  },
  Hotel: {
    label: "Hotels",
    description: "Help guests discover what is nearby while measuring engagement beyond the lobby.",
    media: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
  },
  Brand: {
    label: "Brands",
    description: "Reach people in real places during real downtown decision-making moments.",
    media: "/images/imported/perks/featured-campaign.png",
  },
  Civic: {
    label: "Civic",
    description: "Promote public spaces, programs, events, districts, and community participation.",
    media: "/images/imported/perks/rebuplic-square-event.jpg",
  },
  "Real Estate": {
    label: "Real Estate",
    description: "Show properties alongside the places, amenities, and activity that shape buyer interest.",
    media: "/images/imported/perks/real-estate-agent.png",
  },
  Resident: {
    label: "Residents",
    description: "Support resident access, building perks, saved places, and local discovery questions.",
    media: "/images/imported/perks/residents-leaving-buiklding.png",
  },
  Custom: {
    label: "Custom",
    description: "Plan multi-location, sponsorship, research, integration, or enterprise partner setups.",
    media: "/images/imported/perks/multi-property.png",
  },
};

const groupMedia = {
  annualAddOns: "/images/partners/pricing/rail/cafe-perk-redemption.jpg",
  campaigns: "/images/imported/perks/perk-campaign.png",
  events: "/images/imported/perks/parker-jazz-club-2.jpg",
  placements: "/images/partners/pricing/rail/rainey-street-placement.jpg",
  broadcasts: "/images/imported/perks/resident-flow.png",
  research: "/images/partners/pricing/rail/survey-qr-phone.jpg",
  reporting: "/images/imported/perks/reporting.png",
  activation: "/images/partners/pricing/rail/lobby-qr-tabletop.jpg",
  support: "/images/partners/pricing/rail/partner-dashboard.jpg",
  sponsorships: "/images/imported/perks/sponsorored-campaign.png",
  residentAccess: "/images/partners/pricing/rail/resident-map-phone.jpg",
};

const groupLabels = {
  annualAddOns: "Annual Add-ons",
  campaigns: "Campaigns",
  events: "Events",
  placements: "Placements",
  broadcasts: "Broadcasts",
  research: "Research",
  reporting: "Reporting",
  activation: "Activation",
  support: "Support",
  sponsorships: "Sponsorship",
  residentAccess: "Resident Access",
};

const enterprisePaths = [
  {
    title: "Multi-property portfolios",
    copy: "Centralize visibility, reporting, locations, and team access across multiple buildings.",
    image: "/images/imported/perks/multi-property.png",
    slug: "multi-property",
  },
  {
    title: "District programs",
    copy: "Coordinate civic, venue, property, and sponsor activity across a downtown district.",
    image: "/images/imported/perks/republic-square-terrace.jpg",
    slug: "district-programs",
  },
  {
    title: "Destination sponsorships",
    copy: "Own a seasonal or category moment with placements, campaigns, reporting, and activation.",
    image: "/images/imported/perks/designation-campaign.png",
    slug: "destination-sponsorships",
  },
  {
    title: "Major developments",
    copy: "Connect leasing, retail, hospitality, resident access, and neighborhood storytelling.",
    image: "/images/imported/perks/1-major-mixed-use.png",
    slug: "major-developments",
  },
];

const faqItems = [
  ["Can I start with a small setup?", "Yes. Choose a partner type, select the lowest useful plan, then add capabilities only when needed."],
  ["Can campaigns be added later?", "Yes. Campaign, event, broadcast, reporting, and activation services can be added to an existing setup."],
  ["What happens for multiple locations?", "The builder routes multi-location and custom plans to the enterprise review path so the workspace can be configured correctly."],
  ["Does this connect to partner registration?", "Yes. The request review button carries the selected partner type, plan, add-ons, locations, and reporting needs into the contact flow."],
];

const pageAnchors = [
  ["Plans", "#partner-plans"],
  ["Builder", "#pricing-builder"],
  ["Capabilities", "#capabilities"],
  ["Enterprise", "#enterprise"],
  ["FAQ", "#pricing-faq"],
];

const outcomeTiles = [
  ["Visibility", "Appear in map, listing, category, and district discovery moments.", MapPinned],
  ["Participation", "Turn attention into saves, scans, RSVPs, redemptions, and visits.", Sparkles],
  ["Reporting", "Understand what is working and what to improve next.", BarChart3],
];

function normalizePartnerSlug(type) {
  return String(type || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function persistPartnerSetup(setup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARTNER_SETUP_KEY, JSON.stringify(setup));
  window.dispatchEvent(new CustomEvent("dp:partner-setup-updated", { detail: setup }));
}

function readPartnerSetup() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PARTNER_SETUP_KEY) || "{}");
  } catch {
    return {};
  }
}

function trackPricingEvent(eventName, payload) {
  if (typeof window === "undefined") return;
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    source: "marketing_pricing",
    ...payload,
  };

  window.dispatchEvent(new CustomEvent("dp:analytics", { detail: event }));
  window.dataLayer?.push(event);
}

export default function PricingPage() {
  const storedSetup = useMemo(() => readPartnerSetup(), []);
  const storedPartnerType = PARTNER_TYPES.includes(storedSetup.partnerType) ? storedSetup.partnerType : "Venue";
  const [partnerType, setPartnerType] = useState(storedPartnerType);
  const [selectedPlanId, setSelectedPlanId] = useState(storedSetup.sku || "venueBasicAnnual");
  const [selectedModuleIds, setSelectedModuleIds] = useState(Array.isArray(storedSetup.modules) ? storedSetup.modules : []);
  const [locationCount, setLocationCount] = useState(Math.max(1, Number(storedSetup.locationCount) || 1));
  const [campaignInterest, setCampaignInterest] = useState(storedSetup.campaignInterest || "Offers and perks");
  const [reportingNeeds, setReportingNeeds] = useState(storedSetup.reportingNeeds || "Standard reporting");

  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const modules = PRICING_MODULE_GROUPS.flatMap((group) => group.modules);
  const selectedModules = modules.filter((module) => selectedModuleIds.includes(module.id));
  const annualAddOnTotal = selectedModules
    .filter((module) => module.billing === "Annual add-on")
    .reduce((sum, module) => sum + module.price, 0);
  const oneTimeTotal = selectedModules
    .filter((module) => module.billing === "One-time module")
    .reduce((sum, module) => sum + module.price, 0);
  const total = calculatePricingTotal(selectedPlan, selectedModules);
  const totalText = selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(total);
  const selectedPartnerLabel = partnerCopy[partnerType]?.label || partnerType;
  const selectedAnnualLabel = selectedPlan?.annualPrice == null ? "Custom setup" : `${formatCurrency(total)}/year`;
  const checkoutTarget = selectedPlan?.checkoutKey ? resolveCheckoutTarget(selectedPlan.checkoutKey) : null;
  const partnerTypeSlug = normalizePartnerSlug(partnerType);
  const selectedModuleLabels = useMemo(() => selectedModules.map((module) => module.label), [selectedModules]);
  const setupPayload = useMemo(() => ({
    source: "marketing_pricing",
    organizationType: partnerTypeSlug,
    partnerType,
    plan: selectedPlan?.label || "Custom review",
    sku: selectedPlan?.id || "custom",
    checkoutKey: selectedPlan?.checkoutKey || "custom",
    checkoutTarget,
    modules: selectedModuleIds,
    moduleLabels: selectedModuleLabels,
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
    oneTimeTotal,
    annualAddOnTotal,
    locationCount,
    campaignInterest,
    reportingNeeds,
    status: "pricing_selected",
    updatedAt: new Date().toISOString(),
  }), [
    annualAddOnTotal,
    campaignInterest,
    checkoutTarget,
    locationCount,
    oneTimeTotal,
    partnerType,
    partnerTypeSlug,
    reportingNeeds,
    selectedModuleIds,
    selectedModuleLabels,
    selectedPlan,
    total,
  ]);

  const setupParams = new URLSearchParams({
    intent: "partner-registration",
    partnerType,
    partnerTypeSlug,
    partnerLabel: partnerType,
    plan: selectedPlan?.id || "custom",
    sku: selectedPlan?.id || "custom",
    checkoutKey: selectedPlan?.checkoutKey || "custom",
    billingMode: checkoutTarget?.mode || "lead",
    modules: selectedModuleIds.join(","),
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : String(total),
    oneTimeTotal: String(oneTimeTotal),
    annualAddOnTotal: String(annualAddOnTotal),
    locationCount: String(locationCount),
    campaignInterest,
    reportingNeeds,
  });

  if (partnerType === "Custom" || locationCount > 1 || selectedPlan?.annualPrice == null) {
    setupParams.set("interest", "enterprise");
    setupParams.set("enterprise", "multi-property");
  }

  const setupHref = `/marketing/contact?${setupParams.toString()}`;

  useEffect(() => {
    persistPartnerSetup(setupPayload);
  }, [setupPayload]);

  useEffect(() => {
    trackPricingEvent("pricing_viewed", {
      partnerType,
      planId: selectedPlan?.id,
      annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
    });
  }, []);

  function choosePartner(type, scrollToBuilder = false) {
    const nextPlans = getPlansForPartnerType(type);
    setPartnerType(type);
    setSelectedPlanId(nextPlans[0]?.id || "");
    trackPricingEvent("partner_type_changed", { partnerType: type });

    if (scrollToBuilder) {
      window.requestAnimationFrame(() => {
        document.getElementById("pricing-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function toggleModule(moduleId) {
    setSelectedModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId],
    );
    trackPricingEvent("pricing_module_toggled", { moduleId, partnerType, planId: selectedPlan?.id });
  }

  function selectPlan(plan) {
    setSelectedPlanId(plan.id);
    trackPricingEvent("plan_selected", {
      partnerType,
      planId: plan.id,
      planLabel: plan.label,
      annualPrice: plan.annualPrice,
    });
  }

  function trackCta(label, href) {
    persistPartnerSetup(setupPayload);
    trackPricingEvent("pricing_cta_clicked", {
      label,
      href,
      partnerType,
      planId: selectedPlan?.id,
      annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
      checkoutReady: checkoutTarget?.type !== "lead",
    });
  }

  return (
    <main className="dp-pricing-page">
      <section className="dp-pricing-hero">
        <div className="dp-pricing-container">
          <nav className="dp-pricing-page-nav" aria-label="Pricing sections">
            {pageAnchors.map(([label, href]) => (
              <a key={label} href={href}>{label}</a>
            ))}
          </nav>
          <div className="dp-pricing-hero-grid">
            <div className="dp-pricing-hero-copy">
              <p className="dp-pricing-eyebrow">Partner Pricing</p>
              <h1>Build the setup that fits how you show up downtown.</h1>
              <p>
                Understand how people move through downtown, publish experiences they can discover, and measure the actions that follow.
              </p>
              <div className="dp-pricing-live-strip" aria-label="Current pricing setup">
                <div>
                  <span>Partner path</span>
                  <strong>{selectedPartnerLabel}</strong>
                </div>
                <div>
                  <span>Selected plan</span>
                  <strong>{selectedPlan?.label || "Custom review"}</strong>
                </div>
                <div>
                  <span>Current estimate</span>
                  <strong>{selectedAnnualLabel}</strong>
                </div>
              </div>
              <div className="dp-pricing-actions">
                <a className="dp-pricing-button" href="#pricing-builder" onClick={() => trackCta("Build setup", "#pricing-builder")}>
                  <span>Build setup</span>
                  <ArrowRight aria-hidden="true" />
                </a>
                <a className="dp-pricing-button" href={setupHref} onClick={() => trackCta("Request setup review", setupHref)}>
                  <span>Request setup review</span>
                  <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
            <aside className="dp-pricing-hero-panel" aria-label="Pricing path">
              <div className="dp-pricing-hero-panel-head">
                <Building2 aria-hidden="true" />
                <span>Workspace setup</span>
              </div>
              {["Choose partner type", "Select plan", "Add capabilities", "Review setup"].map((item, index) => (
                <div key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </aside>
          </div>
          <div className="dp-pricing-outcome-grid" aria-label="Pricing outcomes">
            {outcomeTiles.map(([title, copy, Icon]) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="partner-plans">
        <div className="dp-pricing-container">
          <SectionHeader
            eyebrow="Partner Plans"
            title="Start with the role closest to your business."
            copy="Each path uses the same clean workflow: pick a plan, add capabilities, and send the setup for review."
          />
          <div className="dp-pricing-card-grid">
            {PARTNER_TYPES.map((type) => {
              const copy = partnerCopy[type];
              return (
                <article className="dp-pricing-card" data-active={partnerType === type} key={type}>
                  <figure>
                    <img src={copy.media} alt="" loading="lazy" decoding="async" />
                  </figure>
                  <div>
                    <p className="dp-pricing-kicker">Partner path</p>
                    <h3>{copy.label}</h3>
                    <p>{copy.description}</p>
                    <button className="dp-pricing-button" type="button" onClick={() => choosePartner(type, true)}>
                      <span>Select plan</span>
                      <ArrowRight aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section dp-pricing-builder-section" id="pricing-builder" aria-label="Pricing builder">
        <div className="dp-pricing-container">
          <SectionHeader
            eyebrow="Pricing Builder"
            title="Choose the setup, then review the total."
            copy="This calculator keeps the route simple and sends the selected context into the partner setup form."
          />
          <div className="dp-pricing-builder">
            <div className="dp-pricing-builder-controls">
              <fieldset>
                <legend>Partner type</legend>
                <div className="dp-pricing-choice-grid">
                  {PARTNER_TYPES.map((type) => (
                    <button key={type} type="button" data-active={partnerType === type} onClick={() => choosePartner(type)}>
                      {partnerCopy[type].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="dp-pricing-field-grid">
                <label>
                  <span>Number of locations/properties</span>
                  <input
                    type="number"
                    min="1"
                    value={locationCount}
                    onChange={(event) => setLocationCount(Math.max(1, Number(event.target.value) || 1))}
                  />
                </label>
                <label>
                  <span>Campaign interest</span>
                  <select value={campaignInterest} onChange={(event) => setCampaignInterest(event.target.value)}>
                    <option>Offers and perks</option>
                    <option>Events</option>
                    <option>Featured visibility</option>
                    <option>District or portfolio campaign</option>
                    <option>Not sure yet</option>
                  </select>
                </label>
                <label>
                  <span>Reporting needs</span>
                  <select value={reportingNeeds} onChange={(event) => setReportingNeeds(event.target.value)}>
                    <option>Standard reporting</option>
                    <option>Campaign performance</option>
                    <option>Portfolio reporting</option>
                    <option>Exports and integrations</option>
                    <option>Custom executive reporting</option>
                  </select>
                </label>
              </div>

              <fieldset>
                <legend>Annual plan</legend>
                <div className="dp-pricing-option-list">
                  {plans.length > 0 ? plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      data-active={selectedPlan?.id === plan.id}
                      onClick={() => selectPlan(plan)}
                    >
                      <span>
                        <strong>{plan.label}</strong>
                        <small>{plan.bestFor}</small>
                      </span>
                      <em>{getPriceText(plan)}</em>
                    </button>
                  )) : (
                    <div className="dp-pricing-empty">
                      <strong>Custom review</strong>
                      <span>This path routes to the setup review form.</span>
                    </div>
                  )}
                </div>
              </fieldset>

              <fieldset>
                <legend>Optional capabilities</legend>
                <div className="dp-pricing-addon-stack">
                  {PRICING_MODULE_GROUPS.map((group) => (
                    <details key={group.id} open={["annualAddOns", "campaigns", "events"].includes(group.id)}>
                      <summary>
                        <span>{groupLabels[group.id] || group.heading}</span>
                        <small>{group.modules.length} options</small>
                      </summary>
                      <div className="dp-pricing-option-list">
                        {group.modules.map((module) => (
                          <button
                            key={module.id}
                            type="button"
                            data-active={selectedModuleIds.includes(module.id)}
                            onClick={() => toggleModule(module.id)}
                          >
                            <span>
                              <strong>{module.label}</strong>
                              <small>{module.summary}</small>
                            </span>
                            <em>{getPriceText(module)}</em>
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </fieldset>
            </div>

            <aside className="dp-pricing-summary" aria-label="Setup summary">
              <p className="dp-pricing-kicker">Setup summary</p>
              <h2>{totalText}</h2>
              <p className="dp-pricing-summary-context">{selectedPartnerLabel} / {locationCount} location{locationCount === 1 ? "" : "s"} / {selectedModules.length} add-on{selectedModules.length === 1 ? "" : "s"}</p>
              <div className="dp-pricing-summary-plan">
                <strong>{selectedPlan?.label || "Custom review"}</strong>
                <span>{selectedPlan?.summary || "Select a standard plan or continue with custom review."}</span>
              </div>
              <dl>
                <div><dt>Annual subscription</dt><dd>{selectedPlan ? getPriceText(selectedPlan) : "Custom"}</dd></div>
                <div><dt>Annual add-ons</dt><dd>{formatCurrency(annualAddOnTotal)}</dd></div>
                <div><dt>One-time support</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div>
                <div><dt>Locations/properties</dt><dd>{locationCount}</dd></div>
                <div><dt>Campaign interest</dt><dd>{campaignInterest}</dd></div>
                <div><dt>Reporting needs</dt><dd>{reportingNeeds}</dd></div>
              </dl>
              <div className="dp-pricing-selected">
                {selectedModules.length > 0 ? selectedModules.map((module) => (
                  <button key={module.id} type="button" onClick={() => toggleModule(module.id)}>
                    {module.label}
                  </button>
                )) : <span>No add-ons selected.</span>}
              </div>
              <p className="dp-pricing-checkout-note">
                Pricing context will carry into the setup request so the contact page does not repeat the builder.
              </p>
              <a className="dp-pricing-button" href={setupHref} onClick={() => trackCta("Request setup review", setupHref)}>
                <span>Request setup review</span>
                <ArrowRight aria-hidden="true" />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="capabilities">
        <div className="dp-pricing-container">
          <SectionHeader
            eyebrow="Capabilities"
            title="Add visibility, engagement, and reporting when it helps."
            copy="Use these as optional building blocks rather than a long catalogue of disconnected actions."
          />
          <div className="dp-pricing-group-grid">
            {PRICING_MODULE_GROUPS.map((group) => (
              <article className="dp-pricing-group-card" key={group.id}>
                <figure>
                  <img src={groupMedia[group.id] || "/images/districts/congress-hero.jpg"} alt="" loading="lazy" decoding="async" />
                </figure>
                <div>
                  <p className="dp-pricing-kicker">{groupLabels[group.id] || "Capability"}</p>
                  <h3>{group.heading}</h3>
                  <p>{group.sentence}</p>
                  <button className="dp-pricing-button" type="button" onClick={() => document.getElementById("pricing-builder")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    <span>Add to setup</span>
                    <ArrowRight aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="enterprise">
        <div className="dp-pricing-container">
          <SectionHeader
            eyebrow="Enterprise"
            title="For portfolios, districts, sponsorships, and custom programs."
            copy="Larger setups route to a review path so the workspace, reporting, and team structure can be configured correctly."
          />
          <div className="dp-pricing-enterprise-grid">
            {enterprisePaths.map((path) => (
              <article className="dp-pricing-enterprise-card" key={path.slug}>
                <img src={path.image} alt="" loading="lazy" decoding="async" />
                <div>
                  <p className="dp-pricing-kicker">Custom path</p>
                  <h3>{path.title}</h3>
                  <p>{path.copy}</p>
                  <a className="dp-pricing-button" href={`/marketing/contact?intent=partner-registration&interest=enterprise&enterprise=${path.slug}`} onClick={() => trackCta(`Enterprise ${path.slug}`, `/marketing/contact?intent=partner-registration&interest=enterprise&enterprise=${path.slug}`)}>
                    <span>Request custom setup</span>
                    <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="pricing-faq">
        <div className="dp-pricing-container dp-pricing-faq-layout">
          <SectionHeader eyebrow="FAQ" title="Simple answers before setup." />
          <div className="dp-pricing-faq-list">
            {faqItems.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-pricing-final">
        <div className="dp-pricing-container">
          <p className="dp-pricing-eyebrow">Next Step</p>
          <h2>Send the selected setup for review.</h2>
          <p>The form will include the partner type, plan, locations, campaign interest, reporting needs, and selected add-ons.</p>
          <div className="dp-pricing-final-actions">
            <a className="dp-pricing-button" href={setupHref} onClick={() => trackCta("Request setup review", setupHref)}>
              <span>Request setup review</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <header className="dp-pricing-section-header">
      <p className="dp-pricing-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </header>
  );
}
