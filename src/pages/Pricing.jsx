import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
    short: "Restaurants, cafés, bars, shops and local businesses.",
    description: "Restaurants, cafés, bars, shops and local businesses.",
  },
  Property: {
    label: "Properties",
    short: "Apartment communities, condominiums, HOAs and property managers.",
    description: "Apartment communities, condominiums, HOAs and property managers.",
  },
  Hotel: {
    label: "Hotels",
    short: "Help every guest discover more during their stay.",
    description: "Help every guest discover more during their stay.",
  },
  Brand: {
    label: "Brands",
    short: "Run local campaigns and measure their impact.",
    description: "Run local campaigns and measure their impact.",
  },
  Civic: {
    label: "Civic",
    short: "Support residents, visitors and community initiatives.",
    description: "Support residents, visitors and community initiatives.",
  },
  "Real Estate": {
    label: "Real Estate",
    short: "Show buyers and renters what makes the neighborhood valuable.",
    description: "Show buyers and renters what makes the neighborhood valuable.",
  },
  Resident: {
    label: "Residents",
    short: "Get the Perks Card and discover local offers, places and events.",
    description: "Get the Perks Card and discover local offers, places and events.",
  },
  Custom: {
    label: "Custom",
    short: "Custom programs, enterprise partnerships and tailored services.",
    description: "Custom programs, enterprise partnerships and tailored services.",
  },
};

const groupLabels = {
  annualAddOns: "Annual add-ons",
  campaigns: "Campaigns",
  events: "Events",
  placements: "Placements",
  broadcasts: "Broadcasts",
  research: "Research",
  reporting: "Reporting",
  activation: "Launch Support",
  support: "Support",
  sponsorships: "Sponsorship",
  residentAccess: "Resident Access",
};

const partnerAddOnGroups = PRICING_MODULE_GROUPS.filter((group) => group.id !== "residentAccess");

const customOptions = [
  {
    id: "multi-property-portfolios",
    title: "Multi-property portfolios",
    description: "For owners, managers, and leasing teams working across several buildings.",
    bestFor: [
      "Apartment groups",
      "Condo associations",
      "Mixed-use properties",
      "Portfolio leasing teams",
    ],
    included: [
      "Shared resident access",
      "Building-level reporting",
      "QR setup by property",
      "Portfolio overview",
    ],
    cta: "Talk through portfolio setup",
    message: "I'm interested in multi-property portfolio pricing.",
  },
  {
    id: "district-programs",
    title: "District programs",
    description: "For organizations coordinating activity across a downtown area.",
    bestFor: [
      "District groups",
      "Nonprofits",
      "Public-space partners",
      "Neighborhood programs",
    ],
    included: [
      "District map presence",
      "Event and program listings",
      "QR entry points",
      "Participation reporting",
    ],
    cta: "Plan a district program",
    message: "I'm interested in planning a district program.",
  },
  {
    id: "destination-sponsorships",
    title: "Destination sponsorships",
    description: "For brands that want to support local experiences people already choose.",
    bestFor: [
      "Local campaigns",
      "Seasonal sponsorships",
      "Hospitality moments",
      "Downtown activations",
    ],
    included: [
      "Sponsored placement",
      "Campaign page",
      "Event or offer connection",
      "Performance recap",
    ],
    cta: "Discuss sponsorship",
    message: "I'm interested in destination sponsorship options.",
  },
  {
    id: "major-developments",
    title: "Major developments",
    description: "For new buildings, mixed-use projects, and teams shaping a larger downtown experience.",
    bestFor: [
      "New developments",
      "Mixed-use projects",
      "Leasing launches",
      "Neighborhood positioning",
    ],
    included: [
      "Launch plan",
      "Resident or visitor journey",
      "Partner coordination",
      "Custom reporting",
    ],
    cta: "Talk through the project",
    message: "I'm interested in Downtown Perks for a major development.",
  },
];

function normalizePartnerSlug(type) {
  return String(type || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function readPartnerSetup() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PARTNER_SETUP_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistPartnerSetup(setup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARTNER_SETUP_KEY, JSON.stringify(setup));
  window.dispatchEvent(new CustomEvent("dp:partner-setup-updated", { detail: setup }));
}

function trackPricingEvent(eventName, payload) {
  if (typeof window === "undefined") return;
  const event = { event: eventName, timestamp: new Date().toISOString(), source: "pricing", ...payload };
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
  const [activeCapabilityGroup, setActiveCapabilityGroup] = useState("campaigns");
  const [activeCustomOption, setActiveCustomOption] = useState(storedSetup.customOption || customOptions[0].id);
  const [checkoutState, setCheckoutState] = useState("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const isResident = partnerType === "Resident";
  const visibleModuleGroups = isResident ? [] : partnerAddOnGroups;
  const activeModuleGroup = visibleModuleGroups.find((group) => group.id === activeCapabilityGroup) || visibleModuleGroups[0];
  const modules = useMemo(() => partnerAddOnGroups.flatMap((group) => group.modules), []);
  const selectedModules = modules.filter((module) => selectedModuleIds.includes(module.id));
  const selectedModuleLabels = useMemo(() => selectedModules.map((module) => module.label), [selectedModules]);
  const annualAddOnTotal = selectedModules.filter((module) => module.billing === "Annual add-on").reduce((sum, module) => sum + module.price, 0);
  const oneTimeTotal = selectedModules.filter((module) => module.billing === "One-time service").reduce((sum, module) => sum + module.price, 0);
  const recurringAnnualTotal = (selectedPlan?.annualPrice || 0) + annualAddOnTotal;
  const total = calculatePricingTotal(selectedPlan, selectedModules);
  const checkoutTarget = selectedPlan?.checkoutKey ? resolveCheckoutTarget(selectedPlan.checkoutKey) : null;
  const partnerTypeSlug = normalizePartnerSlug(partnerType);
  const selectedPartner = partnerCopy[partnerType] || partnerCopy.Custom;
  const selectedPartnerLabel = selectedPartner.label;
  const selectedCustomOption = customOptions.find((option) => option.id === activeCustomOption) || customOptions[0];
  const totalText = selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(total);
  const estimatedTotalLabel = isResident ? "Estimated annual total" : "Estimated first-year total";

  const setupPayload = useMemo(() => ({
    source: "pricing",
    organizationType: partnerTypeSlug,
    partnerType,
    plan: selectedPlan?.label || "Custom review",
    sku: selectedPlan?.id || "custom",
    checkoutKey: selectedPlan?.checkoutKey || "custom",
    checkoutTarget,
    modules: selectedModuleIds,
    moduleLabels: selectedModuleLabels,
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
    recurringAnnualTotal: selectedPlan?.annualPrice == null ? "custom" : recurringAnnualTotal,
    oneTimeTotal,
    annualAddOnTotal,
    locationCount,
    campaignInterest,
    reportingNeeds,
    customOption: partnerType === "Custom" ? selectedCustomOption.id : "",
    customOptionTitle: partnerType === "Custom" ? selectedCustomOption.title : "",
    status: "pricing_selected",
    updatedAt: new Date().toISOString(),
  }), [annualAddOnTotal, campaignInterest, checkoutTarget, locationCount, oneTimeTotal, partnerType, partnerTypeSlug, recurringAnnualTotal, reportingNeeds, selectedCustomOption.id, selectedCustomOption.title, selectedModuleIds, selectedModuleLabels, selectedPlan, total]);

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
    recurringAnnualTotal: selectedPlan?.annualPrice == null ? "custom" : String(recurringAnnualTotal),
    oneTimeTotal: String(oneTimeTotal),
    annualAddOnTotal: String(annualAddOnTotal),
    locationCount: String(locationCount),
    campaignInterest,
    reportingNeeds,
  });

  if (partnerType === "Custom") {
    setupParams.set("customOption", selectedCustomOption.id);
    setupParams.set("customOptionTitle", selectedCustomOption.title);
    setupParams.set("message", selectedCustomOption.message);
  }

  if (partnerType === "Custom" || locationCount > 1 || selectedPlan?.annualPrice == null) {
    setupParams.set("interest", "custom");
  }

  const setupHref = `/partners/sign-up?${setupParams.toString()}`;

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

  function choosePartner(type) {
    const nextPlans = getPlansForPartnerType(type);
    setPartnerType(type);
    setSelectedPlanId(nextPlans[0]?.id || "");
    if (type === "Resident") {
      setSelectedModuleIds([]);
    }
    trackPricingEvent("partner_type_changed", { partnerType: type });
  }

  function selectPlan(plan) {
    setSelectedPlanId(plan.id);
    trackPricingEvent("plan_selected", { partnerType, planId: plan.id, planLabel: plan.label, annualPrice: plan.annualPrice });
  }

  function toggleModule(moduleId) {
    setSelectedModuleIds((current) => current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]);
    trackPricingEvent("pricing_module_toggled", { moduleId, partnerType, planId: selectedPlan?.id });
  }

  function selectCustomOption(optionId) {
    setActiveCustomOption(optionId);
    setPartnerType("Custom");
    const next = customOptions.find((option) => option.id === optionId);
    trackPricingEvent("custom_pricing_option_selected", { optionId, optionTitle: next?.title });
  }

  function contactCustomOption(option) {
    setPartnerType("Custom");
    const nextPayload = {
      ...setupPayload,
      partnerType: "Custom",
      organizationType: "custom",
      customOption: option.id,
      customOptionTitle: option.title,
      campaignInterest: option.title,
      status: "custom_pricing_contact",
    };
    persistPartnerSetup(nextPayload);
    trackPricingEvent("custom_pricing_cta_clicked", { optionId: option.id, optionTitle: option.title });
    const params = new URLSearchParams({
      intent: "partner-registration",
      interest: "enterprise",
      partnerType: "Custom",
      partnerTypeSlug: "custom",
      customOption: option.id,
      customOptionTitle: option.title,
      campaignInterest: option.title,
      message: option.message,
      annualTotal: "custom",
      recurringAnnualTotal: "custom",
      locationCount: String(locationCount),
      reportingNeeds,
    });
    window.location.href = `/contact?${params.toString()}#contact`;
  }

  function viewCustomOptionDetails(option) {
    setActiveCustomOption(option.id);
    setPartnerType("Custom");
    document.getElementById("custom-pricing-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function trackCta(label, href) {
    persistPartnerSetup(setupPayload);
    trackPricingEvent("pricing_cta_clicked", { label, href, partnerType, planId: selectedPlan?.id, annualTotal: selectedPlan?.annualPrice == null ? "custom" : total });
  }

  function getCheckoutLineItems() {
    const targets = [
      selectedPlan?.checkoutKey ? resolveCheckoutTarget(selectedPlan.checkoutKey) : null,
      ...selectedModules.map((module) => resolveCheckoutTarget(module.id)),
    ].filter(Boolean);

    return targets
      .filter((target) => target.type === "price" && target.priceId)
      .map((target) => ({ priceId: target.priceId, quantity: 1 }));
  }

  async function continueWithSetup(event) {
    event.preventDefault();
    persistPartnerSetup(setupPayload);
    setCheckoutMessage("");

    if (isResident) {
      trackCta("Get Perks Card", "/card");
      window.location.href = "/card";
      return;
    }

    if (!checkoutTarget || checkoutTarget.type === "lead" || selectedPlan?.annualPrice === 0 || selectedPlan?.annualPrice == null) {
      trackCta("Continue to registration", setupHref);
      window.location.href = setupHref;
      return;
    }

    if (checkoutTarget.type === "url" && checkoutTarget.url) {
      trackCta("Open Stripe checkout link", checkoutTarget.url);
      window.location.href = checkoutTarget.url;
      return;
    }

    const lineItems = getCheckoutLineItems();
    if (!lineItems.length && checkoutTarget.type !== "product") {
      trackCta("Continue to registration", setupHref);
      window.location.href = setupHref;
      return;
    }

    try {
      setCheckoutState("loading");
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: checkoutTarget.mode || "subscription",
          lineItems,
          productId: checkoutTarget.type === "product" ? checkoutTarget.productId : undefined,
          metadata: {
            source: "pricing",
            setupVersion: "workspace_activation_v1",
            partnerType,
            plan: selectedPlan?.label || "Custom review",
            sku: selectedPlan?.id || "custom",
            modules: selectedModuleIds.join(","),
            moduleLabels: selectedModuleLabels.join(", "),
            locationCount: String(locationCount),
            annualTotal: selectedPlan?.annualPrice == null ? "custom" : String(total),
            recurringAnnualTotal: selectedPlan?.annualPrice == null ? "custom" : String(recurringAnnualTotal),
            oneTimeTotal: String(oneTimeTotal),
            annualAddOnTotal: String(annualAddOnTotal),
            campaignInterest,
            reportingNeeds,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || "Checkout is not configured yet.");
      }
      trackCta("Open Stripe checkout", result.checkoutUrl);
      window.location.href = result.checkoutUrl;
    } catch (error) {
      setCheckoutState("error");
      setCheckoutMessage("Checkout is not connected for this selection yet. Registration will preserve this plan and billing can be attached from your workspace.");
    }
  }

  return (
    <main className="dp-pricing-page">
      <section className="dp-pricing-section dp-pricing-calculator-section" id="pricing-builder" aria-label="Pricing calculator">
        <div className="dp-pricing-container">
          <SectionHeader eyebrow="Pricing" title="Choose your plan." />
          <div className="dp-pricing-calculator">
            <div className="dp-pricing-calculator-controls">
              <fieldset>
                <legend>Partner Type</legend>
                <div className="dp-pricing-choice-grid dp-pricing-partner-type-grid">
                  {PARTNER_TYPES.map((type) => (
                    <button key={type} type="button" data-active={partnerType === type} onClick={() => choosePartner(type)}>
                      <strong>{partnerCopy[type].label}</strong>
                      <small>{partnerCopy[type].short}</small>
                    </button>
                  ))}
                </div>
              </fieldset>
              {isResident ? (
                <section className="dp-pricing-resident-access" aria-labelledby="resident-access-heading">
                  <p className="dp-pricing-kicker">Resident Access</p>
                  <h3 id="resident-access-heading">Get the Downtown Perks Card and start discovering local perks, places and events.</h3>
                  <article className="dp-pricing-resident-card">
                    <div>
                      <p className="dp-pricing-kicker">Perks Card</p>
                      <h4>Perks Card</h4>
                      <strong>$25/year</strong>
                      <p>For residents who want access to local perks, saved places and downtown recommendations.</p>
                    </div>
                    <ul>
                      {selectedPlan?.includes.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}
                    </ul>
                  </article>
                </section>
              ) : (
                <>
                  <fieldset>
                    <legend>Plan cards</legend>
                    <div className="dp-pricing-plan-card-grid">
                      {plans.length > 0 ? plans.map((plan) => (
                        <button key={plan.id} type="button" className="dp-pricing-plan-choice" data-active={selectedPlan?.id === plan.id} onClick={() => selectPlan(plan)}>
                          <span>
                            <strong>{plan.label}</strong>
                            <small>{plan.summary || plan.bestFor}</small>
                          </span>
                          <em>{getPriceText(plan)}</em>
                          <ul>
                            {plan.includes.slice(0, 4).map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}
                          </ul>
                        </button>
                      )) : (
                        <div className="dp-pricing-empty"><strong>Custom review</strong><span>This path routes to plan review.</span></div>
                      )}
                    </div>
                  </fieldset>
                  <div className="dp-pricing-field-grid">
                    <label><span>Number of locations/properties</span><input type="number" min="1" value={locationCount} onChange={(event) => setLocationCount(Math.max(1, Number(event.target.value) || 1))} /></label>
                    <label><span>Campaign interest</span><select value={campaignInterest} onChange={(event) => setCampaignInterest(event.target.value)}><option>Offers and perks</option><option>Events</option><option>Featured placement</option><option>District or portfolio campaign</option><option>Not sure yet</option></select></label>
                    <label><span>Reporting needs</span><select value={reportingNeeds} onChange={(event) => setReportingNeeds(event.target.value)}><option>Standard reporting</option><option>Campaign performance</option><option>Portfolio reporting</option><option>Exports and integrations</option><option>Custom executive reporting</option></select></label>
                  </div>
                  <fieldset className="dp-custom-options-fieldset">
                    <legend>Enterprise / Custom</legend>
                    <div className="dp-pricing-addons-head">
                      <h3>Custom setup paths</h3>
                      <p>Choose the shape of the program so the next step carries the right business context.</p>
                      <span>Built for portfolios, districts, sponsorships, and larger development work.</span>
                    </div>
                    <div className="dp-custom-option-grid">
                      {customOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className="dp-custom-option-card"
                          aria-expanded={activeCustomOption === option.id}
                          aria-controls="custom-pricing-detail"
                          onClick={() => selectCustomOption(option.id)}
                        >
                          <span className="dp-custom-option-title">{option.title}</span>
                          <span className="dp-custom-option-copy">{option.description}</span>
                        </button>
                      ))}
                    </div>
                    {selectedCustomOption ? (
                      <div className="dp-custom-option-detail" id="custom-pricing-detail">
                        <p className="dp-pricing-guide-eyebrow">
                          <span className="dp-pricing-guide-eyebrow-text">Custom Setup</span>
                        </p>
                        <h3>{selectedCustomOption.title}</h3>
                        <p>{selectedCustomOption.description}</p>
                        <div className="dp-custom-option-detail-grid">
                          <div>
                            <h4>Good for</h4>
                            <ul>
                              {selectedCustomOption.bestFor.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4>Included</h4>
                            <ul>
                              {selectedCustomOption.included.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="dp-pricing-guide-actions">
                          <button type="button" className="dp-button dp-button-primary" onClick={() => contactCustomOption(selectedCustomOption)}>
                            {selectedCustomOption.cta}
                          </button>
                          <button type="button" className="dp-button dp-button-secondary" onClick={() => viewCustomOptionDetails(selectedCustomOption)}>
                            View details
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </fieldset>
                  <fieldset>
                    <legend>Add-ons</legend>
                    <div className="dp-pricing-addons-head">
                      <h3>Add-ons</h3>
                      <p>Only pay for what you need.</p>
                      <span>Add services now or anytime from your workspace.</span>
                    </div>
                    <div className="dp-pricing-addon-rail" role="tablist" aria-label="Add-on groups">
                      {visibleModuleGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          role="tab"
                          aria-selected={activeModuleGroup?.id === group.id}
                          data-active={activeModuleGroup?.id === group.id}
                          onClick={() => setActiveCapabilityGroup(group.id)}
                        >
                          <span>{groupLabels[group.id] || group.heading}</span>
                          <small>{group.modules.length} {group.modules.length === 1 ? "option" : "options"}</small>
                        </button>
                      ))}
                    </div>
                    {activeModuleGroup ? (
                      <section className="dp-pricing-addon-panel" role="tabpanel" aria-label={`${activeModuleGroup.heading} add-ons`}>
                        <div className="dp-pricing-addon-intro">
                          <strong>{activeModuleGroup.heading}</strong>
                          <p>{activeModuleGroup.sentence}</p>
                        </div>
                        <div className="dp-pricing-option-list">
                          {activeModuleGroup.modules.map((module) => (
                            <button key={module.id} type="button" data-active={selectedModuleIds.includes(module.id)} onClick={() => toggleModule(module.id)}>
                              <span><strong>{module.label}</strong><small>{module.summary}</small></span>
                              <em>{getPriceText(module)}</em>
                            </button>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </fieldset>
                </>
              )}
            </div>
            <aside className="dp-pricing-summary" aria-label="Order Summary">
              <p className="dp-pricing-kicker">Order Summary</p>
              <h2>{totalText}</h2>
              <p className="dp-pricing-summary-context">{estimatedTotalLabel}</p>
              <div className="dp-pricing-summary-plan"><strong>{selectedPlan?.label || "Custom review"}</strong><span>{selectedPlan?.summary || "Select a standard plan or continue with custom review."}</span></div>
              <dl>
                <div><dt>{isResident ? "Access" : "Partner type"}</dt><dd>{isResident ? "Perks Card" : selectedPartnerLabel}</dd></div>
                <div><dt>{isResident ? "Perks Card" : "Annual plan"}</dt><dd>{selectedPlan ? getPriceText(selectedPlan) : "Custom"}</dd></div>
                {!isResident ? <div><dt>Annual add-ons</dt><dd>{formatCurrency(annualAddOnTotal)}</dd></div> : null}
                {!isResident ? <div><dt>One-time services</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div> : null}
                {!isResident ? <div><dt>Recurring annual</dt><dd>{selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(recurringAnnualTotal)}</dd></div> : null}
                {!isResident ? <div><dt>Locations/properties</dt><dd>{locationCount}</dd></div> : null}
              </dl>
              {!isResident ? <div className="dp-pricing-selected" aria-label="Selected add-ons">{selectedModules.length > 0 ? selectedModules.map((module) => <button key={module.id} type="button" onClick={() => toggleModule(module.id)}>{module.label}</button>) : <span>No add-ons selected.</span>}</div> : null}
              <p className="dp-pricing-checkout-note">
                {checkoutMessage || (isResident ? "Resident access is separate from partner subscriptions." : "Review everything before checkout. Paid plans continue securely through Stripe. Free and custom plans continue to registration.")}
              </p>
              <button className="dp-pricing-button" type="button" disabled={checkoutState === "loading"} onClick={continueWithSetup}>
                {checkoutState === "loading" ? "Opening checkout" : isResident ? "Get Perks Card" : "Continue to Checkout"} <ArrowRight aria-hidden="true" />
              </button>
            </aside>
          </div>
          <p className="dp-pricing-footer-note">Helping people discover more of downtown while helping local businesses, properties and organizations reach them at the right moment.</p>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return <header className="dp-pricing-section-header"><p className="dp-pricing-eyebrow">{eyebrow}</p><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</header>;
}
