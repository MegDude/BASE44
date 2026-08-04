import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
  Venue: { label: "Venue", short: "Restaurants, cafés, bars, shops and local businesses." },
  Property: { label: "Property", short: "Apartment communities, condominiums, HOAs and property managers." },
  Hotel: { label: "Hotel", short: "Help every guest discover more during their stay." },
  Brand: { label: "Brand", short: "Run local campaigns and measure their impact." },
  Civic: { label: "Community", short: "Civic organizations, nonprofits and districts." },
  "Real Estate": { label: "Real Estate", short: "Show buyers and renters what makes the neighborhood valuable." },
  Resident: { label: "Resident", short: "Get the Perks Card and discover local offers, places and events." },
  Custom: { label: "Enterprise", short: "Multi-property portfolios and custom programs." },
};

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

const customOptions = [
  { id: "multi-property-portfolios", title: "Multi-property portfolios", description: "For owners, managers, and leasing teams working across several buildings.", included: ["Shared resident access", "Building-level reporting", "QR setup by property", "Portfolio overview"], message: "I'm interested in multi-property portfolio pricing." },
  { id: "district-programs", title: "District programs", description: "For organizations coordinating activity across a downtown area.", included: ["District map presence", "Event and program listings", "QR entry points", "Participation reporting"], message: "I'm interested in planning a district program." },
  { id: "destination-sponsorships", title: "Destination sponsorships", description: "For brands that want to support local experiences people already choose.", included: ["Sponsored placement", "Campaign page", "Event or offer connection", "Performance recap"], message: "I'm interested in destination sponsorship options." },
  { id: "major-developments", title: "Major developments", description: "For new buildings, mixed-use projects, and teams shaping a larger downtown experience.", included: ["Launch plan", "Resident or visitor journey", "Partner coordination", "Custom reporting"], message: "I'm interested in Downtown Perks for a major development." },
];

function displayModule(module) {
  return { ...module, ...(UPGRADE_COPY[module.id] || {}) };
}

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
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PARTNER_SETUP_KEY, JSON.stringify(setup));
  } catch {
    window.dispatchEvent(new CustomEvent("dp:partner-setup-storage-unavailable", { detail: setup }));
    return false;
  }
  window.dispatchEvent(new CustomEvent("dp:partner-setup-updated", { detail: setup }));
  return true;
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
  const [upgradesOpen, setUpgradesOpen] = useState(false);
  const [activeCustomOption, setActiveCustomOption] = useState(storedSetup.customOption || customOptions[0].id);

  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const isResident = partnerType === "Resident";
  const modules = useMemo(() => PRICING_MODULE_GROUPS.filter((group) => group.id !== "residentAccess").flatMap((group) => group.modules), []);
  const selectedModules = modules.filter((module) => selectedModuleIds.includes(module.id));
  const activeUpgradeCategory = UPGRADE_CATEGORIES.find((category) => category.id === activeCapabilityGroup) || UPGRADE_CATEGORIES[0];
  const activeUpgradeModules = useMemo(() => {
    const ids = new Set(activeUpgradeCategory.annualIds || []);
    PRICING_MODULE_GROUPS.forEach((group) => {
      if (activeUpgradeCategory.sourceGroups.includes(group.id)) group.modules.forEach((module) => ids.add(module.id));
    });
    return modules.filter((module) => ids.has(module.id));
  }, [activeUpgradeCategory, modules]);
  const selectedCustomOption = customOptions.find((option) => option.id === activeCustomOption) || customOptions[0];
  const annualAddOnTotal = selectedModules.filter((module) => module.billing === "Annual add-on").reduce((sum, module) => sum + module.price, 0);
  const oneTimeTotal = selectedModules.filter((module) => module.billing === "One-time service").reduce((sum, module) => sum + module.price, 0);
  const total = calculatePricingTotal(selectedPlan, selectedModules);
  const checkoutTarget = selectedPlan?.checkoutKey ? resolveCheckoutTarget(selectedPlan.checkoutKey) : null;
  const totalText = selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(total);
  const selectedPartner = partnerCopy[partnerType] || partnerCopy.Custom;

  const setupPayload = useMemo(() => ({
    source: "pricing",
    organizationType: normalizePartnerSlug(partnerType),
    partnerType,
    plan: selectedPlan?.label || "Custom setup",
    sku: selectedPlan?.id || "custom",
    checkoutKey: selectedPlan?.checkoutKey || "custom",
    checkoutTarget,
    modules: selectedModuleIds,
    moduleLabels: selectedModules.map((module) => module.label),
    annualTotal: selectedPlan?.annualPrice == null ? "custom" : total,
    annualAddOnTotal,
    oneTimeTotal,
    customOption: partnerType === "Custom" ? selectedCustomOption.id : "",
    customOptionTitle: partnerType === "Custom" ? selectedCustomOption.title : "",
    status: "pricing_selected",
    updatedAt: new Date().toISOString(),
  }), [annualAddOnTotal, checkoutTarget, oneTimeTotal, partnerType, selectedCustomOption, selectedModuleIds, selectedModules, selectedPlan, total]);

  const setupHref = useMemo(() => {
    const params = new URLSearchParams({
      intent: "partner-registration",
      partnerType,
      partnerTypeSlug: normalizePartnerSlug(partnerType),
      partnerLabel: selectedPartner.label,
      plan: selectedPlan?.id || "custom",
      sku: selectedPlan?.id || "custom",
      checkoutKey: selectedPlan?.checkoutKey || "custom",
      billingMode: checkoutTarget?.mode || "lead",
      modules: selectedModuleIds.join(","),
      annualTotal: selectedPlan?.annualPrice == null ? "custom" : String(total),
    });
    if (partnerType === "Custom") {
      params.set("customOption", selectedCustomOption.id);
      params.set("customOptionTitle", selectedCustomOption.title);
      params.set("message", selectedCustomOption.message);
    }
    return `/partners/sign-up?${params.toString()}`;
  }, [checkoutTarget, partnerType, selectedCustomOption, selectedModuleIds, selectedPartner.label, selectedPlan, total]);

  useEffect(() => { persistPartnerSetup(setupPayload); }, [setupPayload]);
  useEffect(() => {
    trackPricingEvent("pricing_viewed", { partnerType, planId: selectedPlan?.id, annualTotal: selectedPlan?.annualPrice == null ? "custom" : total });
  }, []);

  function choosePartner(type) {
    const nextPlans = getPlansForPartnerType(type);
    setPartnerType(type);
    setSelectedPlanId(nextPlans[0]?.id || "");
    setSelectedModuleIds([]);
    setUpgradesOpen(false);
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

  function continueWithSetup() {
    persistPartnerSetup(setupPayload);
    if (isResident) {
      trackPricingEvent("pricing_cta_clicked", { label: "Get Perks Card", partnerType, planId: selectedPlan?.id });
      window.location.href = "/card";
      return;
    }
    trackPricingEvent("pricing_cta_clicked", { label: "Continue to account setup", partnerType, planId: selectedPlan?.id });
    window.location.href = setupHref;
  }

  const chosenTitle = selectedPlan?.label.replace(/ Annual$/, "") || selectedCustomOption.title;

  return (
    <main className="dp-pricing-page dp-pricing-guided-page">
      <section className="dp-pricing-section" aria-label="Pricing">
        <div className="dp-pricing-container">
          <header className="dp-pricing-guided-header">
            <Link className="dp-pricing-return" data-page-back="true" to="/partners">For partners</Link>
            <p>Partner plans</p>
            <h1>Build your Downtown Perks plan.</h1>
            <span>Choose your type, select an annual plan, then add support only if you need it.</span>
          </header>

          <div className="dp-pricing-guided-layout">
            <div className="dp-pricing-journey">
              <section className="dp-pricing-step" aria-labelledby="pricing-role-title">
                <div className="dp-pricing-step-heading"><span>01</span><h2 id="pricing-role-title">What are you building?</h2></div>
                <div className="dp-pricing-role-list" role="radiogroup" aria-label="Partner type">
                  {[
                    { value: "Venue", label: "Venue" },
                    { value: "Property", label: "Property" },
                    { value: "Hotel", label: "Hotel" },
                    { value: "Brand", label: "Brand" },
                    { value: "Civic", label: "Community" },
                    { value: "Real Estate", label: "Real Estate" },
                  ].map(({ value, label }) => (
                    <button key={value} type="button" role="radio" aria-checked={partnerType === value} data-active={partnerType === value} onClick={() => choosePartner(value)}>
                      <span>{label}</span>
                      <i aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <p className="dp-pricing-role-context">{partnerCopy[partnerType].short}</p>
              </section>

              <section className="dp-pricing-step" aria-labelledby="pricing-plan-title">
                <div className="dp-pricing-step-heading"><span>02</span><h2 id="pricing-plan-title">{isResident ? "Choose your access" : "Choose your annual plan"}</h2></div>
                {plans.length > 0 ? <div className="dp-pricing-plan-list">
                  {plans.map((plan) => <button key={plan.id} type="button" data-active={selectedPlan?.id === plan.id} aria-pressed={selectedPlan?.id === plan.id} onClick={() => selectPlan(plan)}>
                    <span><strong>{plan.tier}</strong><small>{plan.bestFor}</small></span>
                    <em>{getPriceText(plan)}</em>
                    <i>{selectedPlan?.id === plan.id ? "Selected" : "Choose"}</i>
                  </button>)}
                </div> : <div className="dp-pricing-plan-list">
                  {customOptions.map((option) => <button key={option.id} type="button" data-active={activeCustomOption === option.id} aria-pressed={activeCustomOption === option.id} onClick={() => { setActiveCustomOption(option.id); choosePartner("Custom"); }}>
                    <span><strong>{option.title}</strong><small>{option.description}</small></span><em>Custom</em><i>{activeCustomOption === option.id ? "Selected" : "Choose"}</i>
                  </button>)}
                </div>}
              </section>

              {partnerType !== "Custom" && !isResident ? <section className="dp-pricing-step dp-pricing-services" aria-labelledby="pricing-services-title">
                <div className="dp-pricing-step-heading"><span>03</span><h2 id="pricing-services-title">Add support, if useful</h2></div>
                <button className="dp-pricing-upgrade-toggle" type="button" aria-expanded={upgradesOpen} onClick={() => setUpgradesOpen((open) => !open)}>
                  <span>{upgradesOpen ? "Hide support" : "Add support"}</span><small>{selectedModules.length ? `${selectedModules.length} selected` : "Optional"}</small>
                </button>
                {upgradesOpen ? <div className="dp-pricing-upgrade-content">
                  <div className="dp-pricing-upgrade-groups" role="tablist" aria-label="Service category">
                    {UPGRADE_CATEGORIES.map((category) => <button key={category.id} type="button" role="tab" aria-selected={activeUpgradeCategory.id === category.id} data-active={activeUpgradeCategory.id === category.id} onClick={() => setActiveCapabilityGroup(category.id)}>{category.label}</button>)}
                  </div>
                  <p className="dp-pricing-upgrade-category-copy">{activeUpgradeCategory.description}</p>
                  <div className="dp-pricing-upgrade-list" role="tabpanel" aria-label={`${activeUpgradeCategory.label} services`}>
                    {activeUpgradeModules.slice(0, 4).map((module) => {
                      const service = displayModule(module);
                      const active = selectedModuleIds.includes(service.id);
                      return <button key={service.id} type="button" data-active={active} aria-pressed={active} onClick={() => toggleModule(service.id)}><span><strong>{service.label}</strong><small>{service.summary}</small></span><em>{getPriceText(service)}</em></button>;
                    })}
                  </div>
                </div> : null}
              </section> : null}
            </div>

            <aside className="dp-pricing-review" aria-label="Your selection">
              <p>Your selection</p>
              <h2>{totalText}</h2>
              <span>{isResident ? "Annual access" : "First year"}</span>
              <div><strong>{chosenTitle}</strong></div>
              {selectedModules.length ? <p className="dp-pricing-review-services">{selectedModules.length} service{selectedModules.length === 1 ? "" : "s"} selected</p> : null}
              <button className="dp-pricing-button dp-acquisition-primary" type="button" onClick={continueWithSetup}>{isResident ? "Get Perks Card" : "Continue to account setup"} <ArrowRight aria-hidden="true" /></button>
            </aside>
          </div>

          <section className="dp-pricing-support" aria-labelledby="pricing-support-title">
            <div>
              <p>Need a hand?</p>
              <h2 id="pricing-support-title">Talk through the right setup.</h2>
              <span>We&apos;ll help you choose a partner type, annual plan, and only the support your launch needs.</span>
            </div>
            <div className="dp-pricing-support-actions">
              <Link className="dp-pricing-support-primary" to="/contact?topic=partner-demo">Book a demo</Link>
              <Link className="dp-pricing-support-secondary" to="/contact?topic=pricing-support">Contact support</Link>
            </div>
          </section>
        </div>
      </section>

      <div className="dp-pricing-mobile-action">
        <span><small>{isResident ? "Annual access" : "Selected plan"}</small><strong>{totalText}</strong></span>
        <button className="dp-acquisition-primary" type="button" onClick={continueWithSetup}><span>{isResident ? "Get card" : "Continue"}</span> <ArrowRight aria-hidden="true" /></button>
      </div>
    </main>
  );
}
