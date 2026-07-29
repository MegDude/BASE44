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
    label: "Venue",
    short: "Restaurants, cafés, bars, shops and local businesses.",
    description: "Restaurants, cafés, bars, shops and local businesses.",
  },
  Property: {
    label: "Property",
    short: "Apartment communities, condominiums, HOAs and property managers.",
    description: "Apartment communities, condominiums, HOAs and property managers.",
  },
  Hotel: {
    label: "Hotel",
    short: "Help every guest discover more during their stay.",
    description: "Help every guest discover more during their stay.",
  },
  Brand: {
    label: "Brand",
    short: "Run local campaigns and measure their impact.",
    description: "Run local campaigns and measure their impact.",
  },
  Civic: {
    label: "Community",
    short: "Civic organizations, nonprofits and districts.",
    description: "Civic organizations, nonprofits and districts.",
  },
  "Real Estate": {
    label: "Real Estate",
    short: "Show buyers and renters what makes the neighborhood valuable.",
    description: "Show buyers and renters what makes the neighborhood valuable.",
  },
  Resident: {
    label: "Resident",
    short: "Get the Perks Card and discover local offers, places and events.",
    description: "Get the Perks Card and discover local offers, places and events.",
  },
  Custom: {
    label: "Enterprise",
    short: "Multi-property portfolios and custom programs.",
    description: "Multi-property portfolios and custom programs.",
  },
};

const partnerAddOnGroups = PRICING_MODULE_GROUPS.filter((group) => group.id !== "residentAccess");

const UPGRADE_CATEGORIES = [
  { id: "grow", label: "Grow", description: "Campaigns, placements and broadcasts.", sourceGroups: ["campaigns", "broadcasts"], annualIds: ["unlimitedPerkCampaignsAnnual"] },
  { id: "measure", label: "Measure", description: "Analytics, reporting and surveys.", sourceGroups: ["research", "reporting"], annualIds: ["surveySeriesAnnual", "analyticsPlusAnnual", "analyticsProAnnual"] },
  { id: "launch", label: "Launch", description: "Setup, onboarding and launch support.", sourceGroups: ["activation", "support"] },
  { id: "promote", label: "Promote", description: "Events, sponsorships and featured placement.", sourceGroups: ["events", "placements", "sponsorships"], annualIds: ["districtSponsorAnnual"] },
];

const UPGRADE_COPY = {
  unlimitedPerkCampaignsAnnual: { label: "Campaigns", summary: "Run unlimited resident offers and seasonal campaigns." },
  analyticsPlusAnnual: { label: "Analytics", summary: "Understand visits, saves, redemptions and engagement." },
  analyticsProAnnual: { label: "Advanced analytics", summary: "Compare locations, campaigns and resident trends." },
  districtSponsorAnnual: { label: "District sponsorship", summary: "Own a category or neighborhood placement." },
};

function displayModule(module) {
  return { ...module, ...(UPGRADE_COPY[module.id] || {}) };
}

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
  const [activeCapabilityGroup, setActiveCapabilityGroup] = useState("grow");
  const [comparePlansOpen, setComparePlansOpen] = useState(false);
  const [showAllUpgrades, setShowAllUpgrades] = useState(false);
  const [activeCustomOption, setActiveCustomOption] = useState(storedSetup.customOption || customOptions[0].id);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const isResident = partnerType === "Resident";
  const modules = useMemo(() => partnerAddOnGroups.flatMap((group) => group.modules), []);
  const activeUpgradeCategory = UPGRADE_CATEGORIES.find((category) => category.id === activeCapabilityGroup) || UPGRADE_CATEGORIES[0];
  const activeUpgradeModules = useMemo(() => {
    const ids = new Set(activeUpgradeCategory.annualIds || []);
    partnerAddOnGroups.forEach((group) => {
      if (activeUpgradeCategory.sourceGroups.includes(group.id)) {
        group.modules.forEach((module) => ids.add(module.id));
      }
    });
    return modules.filter((module) => ids.has(module.id));
  }, [activeUpgradeCategory, modules]);
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
    plan: selectedPlan?.label || "Custom setup",
    sku: selectedPlan?.id || "custom",
    checkoutKey: selectedPlan?.checkoutKey || "custom",
    checkoutTarget,
    modules: selectedModuleIds,
    moduleLabels: selectedModuleLabels,
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
    recurringAnnualTotal: selectedPlan?.annualPrice == null ? "custom" : recurringAnnualTotal,
    oneTimeTotal,
    annualAddOnTotal,
    customOption: partnerType === "Custom" ? selectedCustomOption.id : "",
    customOptionTitle: partnerType === "Custom" ? selectedCustomOption.title : "",
    status: "pricing_selected",
    updatedAt: new Date().toISOString(),
  }), [annualAddOnTotal, checkoutTarget, oneTimeTotal, partnerType, partnerTypeSlug, recurringAnnualTotal, selectedCustomOption.id, selectedCustomOption.title, selectedModuleIds, selectedModuleLabels, selectedPlan, total]);

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
  });

  if (partnerType === "Custom") {
    setupParams.set("customOption", selectedCustomOption.id);
    setupParams.set("customOptionTitle", selectedCustomOption.title);
    setupParams.set("message", selectedCustomOption.message);
  }

  if (partnerType === "Custom" || selectedPlan?.annualPrice == null) {
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
    // Add-ons belong to the plan path, not to a browser session. Clearing them
    // prevents a venue selection from carrying into an unrelated property or
    // resident decision.
    setSelectedModuleIds([]);
    setComparePlansOpen(false);
    setShowAllUpgrades(false);
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

  function trackCta(label, href) {
    persistPartnerSetup(setupPayload);
    trackPricingEvent("pricing_cta_clicked", { label, href, partnerType, planId: selectedPlan?.id, annualTotal: selectedPlan?.annualPrice == null ? "custom" : total });
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

    trackCta("Continue to registration", setupHref);
    window.location.href = setupHref;
  }

  return (
    <main className="dp-pricing-page">
      <section className="dp-pricing-section dp-pricing-calculator-section" id="pricing-builder" aria-label="Pricing calculator">
        <div className="dp-pricing-container">
          <SectionHeader
            eyebrow="Pricing"
            title="Pricing that stays out of the way."
            copy="Start with your role, choose a plan, then add only the capabilities you need."
          />
          <div className="dp-pricing-calculator">
            <div className="dp-pricing-calculator-controls">
              <fieldset className="dp-pricing-decision" data-step="1">
                <legend><span>1</span> Who are you?</legend>
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
                <fieldset className="dp-pricing-decision" data-step="2">
                  <legend><span>2</span> Choose your access</legend>
                  <article className="dp-pricing-selected-plan">
                    <div><p>Perks Card</p><strong>$25 <small>/ year</small></strong></div>
                    <ul>{selectedPlan?.includes.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
                  </article>
                </fieldset>
              ) : (
                <>
                  <fieldset className="dp-pricing-decision" data-step="2">
                    <legend><span>2</span> Choose your plan</legend>
                    {plans.length > 0 ? (
                      <>
                        <div className="dp-pricing-plan-selector" aria-label="Available plans">
                          {plans.map((plan) => <button key={plan.id} type="button" data-active={selectedPlan?.id === plan.id} onClick={() => selectPlan(plan)}><strong>{plan.tier}</strong><small>{getPriceText(plan)}</small></button>)}
                        </div>
                        {selectedPlan ? <article className="dp-pricing-selected-plan">
                          <div><p>{selectedPlan.label.replace(/ Annual$/, "")}</p><strong>{getPriceText(selectedPlan)}</strong></div>
                          <p>{selectedPlan.summary}</p>
                          <ul>{selectedPlan.includes.slice(0, 4).map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
                        </article> : null}
                        {plans.length > 1 ? <button className="dp-pricing-compare-toggle" type="button" aria-expanded={comparePlansOpen} onClick={() => setComparePlansOpen((open) => !open)}>{comparePlansOpen ? "Hide comparison" : "Compare plans"}</button> : null}
                        {comparePlansOpen ? <div className="dp-pricing-plan-comparison">{plans.map((plan) => <button key={plan.id} type="button" onClick={() => selectPlan(plan)}><span><strong>{plan.tier}</strong><small>{plan.bestFor}</small></span><em>{getPriceText(plan)}</em></button>)}</div> : null}
                      </>
                    ) : (
                      <>
                        <div className="dp-pricing-plan-selector dp-pricing-enterprise-selector">
                          {customOptions.map((option) => <button key={option.id} type="button" data-active={activeCustomOption === option.id} onClick={() => selectCustomOption(option.id)}><strong>{option.title}</strong></button>)}
                        </div>
                        <article className="dp-pricing-selected-plan">
                          <div><p>{selectedCustomOption.title}</p><strong>Custom</strong></div>
                          <p>{selectedCustomOption.description}</p>
                          <ul>{selectedCustomOption.included.slice(0, 4).map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
                        </article>
                      </>
                    )}
                  </fieldset>
                  {partnerType !== "Custom" ? <fieldset className="dp-pricing-decision" data-step="3">
                    <legend><span>3</span> Optional upgrades</legend>
                    <p className="dp-pricing-decision-copy">Add these now or later from your workspace.</p>
                    <div className="dp-pricing-upgrade-groups" role="tablist" aria-label="Upgrade categories">
                      {UPGRADE_CATEGORIES.map((category) => <button key={category.id} type="button" role="tab" aria-selected={activeUpgradeCategory.id === category.id} data-active={activeUpgradeCategory.id === category.id} onClick={() => { setActiveCapabilityGroup(category.id); setShowAllUpgrades(false); }}><strong>{category.label}</strong><small>{category.description}</small></button>)}
                    </div>
                    <div className="dp-pricing-upgrade-list" role="tabpanel" aria-label={`${activeUpgradeCategory.label} upgrades`}>
                      {(showAllUpgrades ? activeUpgradeModules : activeUpgradeModules.slice(0, 4)).map((rawModule) => {
                        const module = displayModule(rawModule);
                        const active = selectedModuleIds.includes(module.id);
                        return <button key={module.id} type="button" data-active={active} aria-pressed={active} onClick={() => toggleModule(module.id)}><span><strong>{module.label}</strong><small>{module.summary}</small></span><em>{getPriceText(module)}</em></button>;
                      })}
                    </div>
                    {activeUpgradeModules.length > 4 ? <button type="button" className="dp-pricing-upgrade-more" aria-expanded={showAllUpgrades} onClick={() => setShowAllUpgrades((show) => !show)}>{showAllUpgrades ? "Show fewer" : `Show ${activeUpgradeModules.length - 4} more`}</button> : null}
                  </fieldset> : null}
                </>
              )}
            </div>
            <aside className="dp-pricing-summary" aria-label="Order Summary">
              <p className="dp-pricing-kicker">Order summary</p>
              <h2>{totalText}</h2>
              <p className="dp-pricing-summary-context">{estimatedTotalLabel}</p>
              <div className="dp-pricing-summary-plan"><strong>{selectedPlan?.label.replace(/ Annual$/, "") || selectedCustomOption.title}</strong><span>{selectedPlan?.summary || selectedCustomOption.description}</span></div>
              <dl>
                <div><dt>{isResident ? "Access" : "Partner type"}</dt><dd>{isResident ? "Perks Card" : selectedPartnerLabel}</dd></div>
                <div><dt>{isResident ? "Perks Card" : "Annual plan"}</dt><dd>{selectedPlan ? getPriceText(selectedPlan) : "Custom"}</dd></div>
                {!isResident ? <div><dt>Annual add-ons</dt><dd>{formatCurrency(annualAddOnTotal)}</dd></div> : null}
                {!isResident ? <div><dt>One-time services</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div> : null}
                {!isResident ? <div><dt>Recurring annual</dt><dd>{selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(recurringAnnualTotal)}</dd></div> : null}
              </dl>
              {!isResident ? <div className="dp-pricing-selected" aria-label="Selected upgrades">{selectedModules.length > 0 ? selectedModules.map((module) => <button key={module.id} type="button" onClick={() => toggleModule(module.id)}>{displayModule(module).label}</button>) : <span>No upgrades selected.</span>}</div> : null}
              <p className="dp-pricing-checkout-note">
                {checkoutMessage || (isResident ? "Resident access is separate from partner subscriptions." : "Continue to create your account. Payment details are requested only when they apply.")}
              </p>
              <button className="dp-pricing-button" type="button" onClick={continueWithSetup}>
                {isResident ? "Get Perks Card" : "Continue to account setup"} <ArrowRight aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return <header className="dp-pricing-section-header"><p className="dp-pricing-eyebrow">{eyebrow}</p><h2>{title}</h2>{copy ? <p>{copy}</p> : null}</header>;
}
