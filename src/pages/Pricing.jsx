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
    short: "Restaurants, bars, shops, coffee, wellness, and local destinations.",
    description: "Show up when people nearby are deciding where to eat, drink, meet, shop, or explore.",
    media: "/images/imported/perks/bangers-outside.webp",
  },
  Property: {
    label: "Properties",
    short: "Residential buildings, leasing teams, and resident programs.",
    description: "Connect residents to nearby perks, events, places, and neighborhood activity.",
    media: "/images/imported/perks/waterline-hero.webp",
  },
  Hotel: {
    label: "Hotels",
    short: "Guest guides, concierge moments, lobby QR, and nearby discovery.",
    description: "Help guests discover what is nearby while measuring engagement beyond the lobby.",
    media: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
  },
  Brand: {
    label: "Brands",
    short: "Campaigns, sponsorships, activations, and measurable reach.",
    description: "Reach people in real places during real downtown decision-making moments.",
    media: "/images/map-entities/brand-yeti/yeti-austin-fc.png",
  },
  Civic: {
    label: "Civic",
    short: "Districts, public programs, cultural moments, and wayfinding.",
    description: "Promote public spaces, programs, events, districts, and community participation.",
    media: "/images/imported/perks/civic-tour.png",
  },
  "Real Estate": {
    label: "Real Estate",
    short: "Listings, leasing, development, and neighborhood context.",
    description: "Show properties alongside the places, amenities, and activity that shape buyer interest.",
    media: "/images/imported/perks/modern-austin-residences.jpg",
  },
  Resident: {
    label: "Residents",
    short: "Resident access, building perks, saved places, and local help.",
    description: "Support resident access, building perks, saved places, and local discovery questions.",
    media: "/images/imported/perks/residents-leaving-buiklding.png",
  },
  Custom: {
    label: "Custom",
    short: "Portfolios, sponsorships, research, integrations, and larger launches.",
    description: "Plan multi-location, sponsorship, research, integration, or enterprise partner setups.",
    media: "/images/imported/perks/multi-property.png",
  },
};

const planMedia = {
  venueFreeListing: "/images/imported/perks/stay-put-sign.jpg",
  venueBasicAnnual: "/images/imported/perks/venues-before-decide-what-to-do.png",
  venueGrowthAnnual: "/images/imported/perks/qr-code-redemption.png",
  venueProAnnual: "/images/imported/perks/dashboard.png",
  propertyPartnerAnnual: "/images/imported/perks/multi-property.png",
  propertyBasicBuildingAnnual: "/images/imported/perks/qr-in-lobby-lobb.png",
  propertyResidentPlusAnnual: "/images/imported/perks/lobby-to-street-arrival.png",
  hotelStarterAnnual: "/images/imported/perks/scn-qr-code-hotel.png",
  hotelProAnnual: "/images/imported/perks/rooftop-pools-austin-hotel-van-zandt-hero.jpg",
  brandAccessAnnual: "/images/map-entities/brand-yeti/yeti-flagship-interior.jpg",
  brandCampaignsAnnual: "/images/imported/perks/featured-campaign.png",
  civicBasicAnnual: "/images/imported/perks/civic-tour.png",
  civicPlusAnnual: "/images/imported/perks/civic-republic-square-1779052838327.png",
  civicProAnnual: "/images/imported/perks/republic-square-terrace.jpg",
  realEstateAnnual: "/images/imported/perks/modern-austin-residences.jpg",
};

const groupMedia = {
  annualAddOns: "/images/partners/pricing/rail/cafe-perk-redemption.jpg",
  campaigns: "/images/imported/perks/perk-campaign.png",
  events: "/images/imported/perks/parker-jazz-club-2.jpg",
  placements: "/images/partners/pricing/rail/rainey-street-placement.jpg",
  broadcasts: "/images/imported/perks/resident-flow.png",
  research: "/images/imported/perks/survey.png",
  reporting: "/images/imported/perks/reporting.png",
  activation: "/images/partners/pricing/rail/lobby-qr-tabletop.jpg",
  support: "/images/partners/pricing/rail/partner-dashboard.jpg",
  sponsorships: "/images/imported/perks/sponsorored-campaign.png",
  residentAccess: "/images/partners/pricing/rail/resident-map-phone.jpg",
};

const moduleMedia = {
  unlimitedPerkCampaignsAnnual: "/images/partners/pricing/rail/cafe-perk-redemption.jpg",
  surveySeriesAnnual: "/images/imported/perks/survey.png",
  analyticsPlusAnnual: "/images/imported/perks/reporting.png",
  analyticsProAnnual: "/images/imported/perks/dashboard.png",
  districtSponsorAnnual: "/images/imported/perks/district-picnic.png",
  perkCampaign: "/images/imported/perks/qr-code-redemption.png",
  featuredCampaign: "/images/imported/perks/featured-campaign.png",
  sponsoredCampaign: "/images/imported/perks/sponsorored-campaign.png",
  eventBoost: "/images/imported/perks/parker-jazz-club-2.jpg",
  featuredEvent: "/images/imported/perks/bluesotg-3cc.jpg",
  sponsoredEvent: "/images/imported/perks/drop-in-summer-concert-series-photo-by-brynn-osborn-e1715893817272.jpg",
  categoryFeatured7d: "/images/imported/perks/live-map-listing.png",
  categoryFeatured30d: "/images/imported/perks/map-ui.png",
  categoryFeatured90d: "/images/imported/perks/vent-placement.png",
  districtFeatured30d: "/images/imported/perks/downtown-austin.jpg",
  districtFeatured90d: "/images/imported/perks/downtown-discovery.png",
  broadcastPushSmall: "/images/imported/perks/walking-towards-coffee-shop.png",
  broadcastPushMedium: "/images/imported/perks/resident-scan-qr-code.png",
  broadcastPushLarge: "/images/imported/perks/hotel-van-zandt-entrance.jpg",
  broadcastEmailSmall: "/images/imported/perks/coffee-shop-card.png",
  broadcastEmailMedium: "/images/imported/perks/residents-making-plans.png",
  broadcastEmailLarge: "/images/imported/perks/people-at-event.png",
  broadcastInApp: "/images/imported/perks/resident-flow.png",
  singleSurvey: "/images/imported/perks/survey.png",
  customResearchProject: "/images/imported/perks/boop-survey.png",
  customPartnerReport: "/images/imported/perks/reporting.png",
  inVenueActivation: "/images/imported/perks/00-venue-qr-code.png",
  propertyActivation: "/images/imported/perks/qr-in-lobby-lobb.png",
  multiLocationActivation: "/images/imported/perks/multi-property-2.png",
  streetTeamHalfDay: "/images/imported/perks/atx-street.png",
  streetTeamFullDay: "/images/imported/perks/austin-downtown-farmers-market-59703d6252.jpg",
  surveyPulse: "/images/imported/perks/00-qr-survey.png",
  campaignLaunchKit: "/images/imported/perks/pricing-campaign-add-ons.png",
  buildingPlacementPack: "/images/imported/perks/elevator-qr.png",
  seasonalSponsor: "/images/imported/perks/swsx-desitnation-campaign.png",
  residentJoinBuildingNotMember: "/images/imported/perks/desnudo-coffee-hands.png",
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

const pageAnchors = [
  ["Plans", "#partner-plans"],
  ["Add-ons", "#capabilities"],
  ["Checkout", "#pricing-builder"],
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

function scrollToCalculator() {
  window.requestAnimationFrame(() => {
    document.getElementById("pricing-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
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
  const [checkoutState, setCheckoutState] = useState("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const plans = useMemo(() => getPlansForPartnerType(partnerType), [partnerType]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const modules = useMemo(() => PRICING_MODULE_GROUPS.flatMap((group) => group.modules), []);
  const selectedModules = modules.filter((module) => selectedModuleIds.includes(module.id));
  const selectedModuleLabels = useMemo(() => selectedModules.map((module) => module.label), [selectedModules]);
  const annualAddOnTotal = selectedModules.filter((module) => module.billing === "Annual add-on").reduce((sum, module) => sum + module.price, 0);
  const oneTimeTotal = selectedModules.filter((module) => module.billing === "One-time module").reduce((sum, module) => sum + module.price, 0);
  const recurringAnnualTotal = (selectedPlan?.annualPrice || 0) + annualAddOnTotal;
  const total = calculatePricingTotal(selectedPlan, selectedModules);
  const checkoutTarget = selectedPlan?.checkoutKey ? resolveCheckoutTarget(selectedPlan.checkoutKey) : null;
  const partnerTypeSlug = normalizePartnerSlug(partnerType);
  const selectedPartner = partnerCopy[partnerType] || partnerCopy.Custom;
  const selectedPartnerLabel = selectedPartner.label;
  const activeCapability = PRICING_MODULE_GROUPS.find((group) => group.id === activeCapabilityGroup) || PRICING_MODULE_GROUPS[0];
  const totalText = selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(total);
  const recurringText = selectedPlan?.annualPrice == null ? "Custom" : `${formatCurrency(recurringAnnualTotal)}/year`;

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
    status: "pricing_selected",
    updatedAt: new Date().toISOString(),
  }), [annualAddOnTotal, campaignInterest, checkoutTarget, locationCount, oneTimeTotal, partnerType, partnerTypeSlug, recurringAnnualTotal, reportingNeeds, selectedModuleIds, selectedModuleLabels, selectedPlan, total]);

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

  function choosePartner(type, shouldScroll = false) {
    const nextPlans = getPlansForPartnerType(type);
    setPartnerType(type);
    setSelectedPlanId(nextPlans[0]?.id || "");
    trackPricingEvent("partner_type_changed", { partnerType: type });
    if (shouldScroll) scrollToCalculator();
  }

  function selectPlan(plan, shouldScroll = false) {
    setSelectedPlanId(plan.id);
    trackPricingEvent("plan_selected", { partnerType, planId: plan.id, planLabel: plan.label, annualPrice: plan.annualPrice });
    if (shouldScroll) scrollToCalculator();
  }

  function toggleModule(moduleId) {
    setSelectedModuleIds((current) => current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]);
    trackPricingEvent("pricing_module_toggled", { moduleId, partnerType, planId: selectedPlan?.id });
  }

  function addModuleToSetup(moduleId) {
    setSelectedModuleIds((current) => current.includes(moduleId) ? current : [...current, moduleId]);
    trackPricingEvent("pricing_module_added", { moduleId, partnerType, planId: selectedPlan?.id });
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

    if (!checkoutTarget || checkoutTarget.type === "lead" || selectedPlan?.annualPrice === 0 || selectedPlan?.annualPrice == null) {
      trackCta("Continue to partner signup", setupHref);
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
      trackCta("Continue to partner signup", setupHref);
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
      setCheckoutMessage("Checkout is not connected for this selection yet. Continue with sign-up and we will attach billing from your workspace.");
    }
  }

  return (
    <main className="dp-pricing-page">
      <section className="dp-pricing-hero">
        <div className="dp-pricing-container">
          <nav className="dp-pricing-page-nav" aria-label="Pricing sections">
            {pageAnchors.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
          <div className="dp-pricing-hero-grid">
            <div className="dp-pricing-hero-copy">
              <p className="dp-pricing-eyebrow">Pricing</p>
              <h1>Choose the setup that fits how people use you downtown.</h1>
              <p>Pick a partner type, choose a plan, add only what you need, then continue to checkout or finish setup in the partner workspace.</p>
              <div className="dp-pricing-live-strip" aria-label="Current pricing setup">
                <div><span>Partner type</span><strong>{selectedPartnerLabel}</strong></div>
                <div><span>Plan</span><strong>{selectedPlan?.label || "Custom review"}</strong></div>
                <div><span>Estimate</span><strong>{recurringText}</strong></div>
              </div>
              <div className="dp-pricing-actions">
                <a className="dp-pricing-button" href="#partner-plans">Choose plan</a>
                <a className="dp-pricing-button" href="#pricing-builder" onClick={() => trackCta("Jump to checkout", "#pricing-builder")}>Continue</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="partner-plans">
        <div className="dp-pricing-container">
          <SectionHeader eyebrow="Plans" title="Choose the closest fit." copy="The plans below update by partner type. You can change your selection before checkout." />
          <div className="dp-pricing-partner-list" aria-label="Partner type selector">
            {PARTNER_TYPES.map((type) => (
              <button key={type} type="button" data-active={partnerType === type} onClick={() => choosePartner(type)}>
                <span>{partnerCopy[type].label}</span>
                <small>{partnerCopy[type].short}</small>
              </button>
            ))}
          </div>
          <div className="dp-pricing-plan-list">
            {plans.length > 0 ? plans.map((plan) => (
              <article className="dp-pricing-plan-card" data-active={selectedPlan?.id === plan.id} key={plan.id}>
                <figure><img src={planMedia[plan.id] || selectedPartner.media} alt="" loading="lazy" decoding="async" /></figure>
                <div>
                  <p className="dp-pricing-kicker">{selectedPartner.label}</p>
                  <h3>{plan.label}</h3>
                  <strong>{getPriceText(plan)}</strong>
                  <p>{plan.summary || plan.bestFor}</p>
                  <ul>
                    {plan.includes.slice(0, 4).map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}
                  </ul>
                  <button className="dp-pricing-button" type="button" onClick={() => selectPlan(plan, true)}>Select plan</button>
                </div>
              </article>
            )) : (
              <article className="dp-pricing-plan-card" data-active="true">
                <figure><img src={partnerCopy.Custom.media} alt="" loading="lazy" decoding="async" /></figure>
                <div>
                  <p className="dp-pricing-kicker">Custom</p>
                  <h3>Custom review</h3>
                  <strong>Custom</strong>
                  <p>Use the calculator at the end to describe the setup and send it for review.</p>
                  <a className="dp-pricing-button" href="#pricing-builder">Open calculator</a>
                </div>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section" id="capabilities">
        <div className="dp-pricing-container">
          <SectionHeader eyebrow="Add-ons" title="Add only what you will use." copy="Campaigns, placements, reports, and setup support can be added now or later from the workspace." />
          <div className="dp-pricing-capability-tabs" aria-label="Capability groups">
            {PRICING_MODULE_GROUPS.map((group) => (
              <button key={group.id} type="button" data-active={activeCapabilityGroup === group.id} onClick={() => setActiveCapabilityGroup(group.id)}>
                {groupLabels[group.id] || group.heading}
              </button>
            ))}
          </div>
          <div className="dp-pricing-capability-layout">
            <figure><img src={groupMedia[activeCapability.id] || selectedPartner.media} alt="" loading="lazy" decoding="async" /></figure>
            <div className="dp-pricing-capability-copy">
              <p className="dp-pricing-kicker">{groupLabels[activeCapability.id] || "Capability"}</p>
              <h3>{activeCapability.heading}</h3>
              <p>{activeCapability.sentence}</p>
            </div>
          </div>
          <div className="dp-pricing-module-list">
            {activeCapability.modules.map((module) => (
              <article key={module.id} data-active={selectedModuleIds.includes(module.id)}>
                <img src={moduleMedia[module.id] || groupMedia[activeCapability.id] || selectedPartner.media} alt="" loading="lazy" decoding="async" />
                <div>
                  <p className="dp-pricing-kicker">{module.billing}</p>
                  <h3>{module.label}</h3>
                  <strong>{getPriceText(module)}</strong>
                  <p>{module.summary}</p>
                  <button className="dp-pricing-button" type="button" onClick={() => addModuleToSetup(module.id)}>
                    {selectedModuleIds.includes(module.id) ? "Added" : "Add to setup"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dp-pricing-section dp-pricing-calculator-section" id="pricing-builder" aria-label="Pricing calculator">
        <div className="dp-pricing-container">
          <SectionHeader eyebrow="Checkout" title="Confirm the setup." copy="Review the plan, locations, and add-ons. Paid plans continue to Stripe when billing is configured. Free and custom setups continue to sign-up." />
          <div className="dp-pricing-calculator">
            <div className="dp-pricing-calculator-controls">
              <fieldset>
                <legend>Partner type</legend>
                <div className="dp-pricing-choice-grid">
                  {PARTNER_TYPES.map((type) => <button key={type} type="button" data-active={partnerType === type} onClick={() => choosePartner(type)}>{partnerCopy[type].label}</button>)}
                </div>
              </fieldset>
              <div className="dp-pricing-field-grid">
                <label><span>Number of locations/properties</span><input type="number" min="1" value={locationCount} onChange={(event) => setLocationCount(Math.max(1, Number(event.target.value) || 1))} /></label>
                <label><span>Campaign interest</span><select value={campaignInterest} onChange={(event) => setCampaignInterest(event.target.value)}><option>Offers and perks</option><option>Events</option><option>Featured placement</option><option>District or portfolio campaign</option><option>Not sure yet</option></select></label>
                <label><span>Reporting needs</span><select value={reportingNeeds} onChange={(event) => setReportingNeeds(event.target.value)}><option>Standard reporting</option><option>Campaign performance</option><option>Portfolio reporting</option><option>Exports and integrations</option><option>Custom executive reporting</option></select></label>
              </div>
              <fieldset>
                <legend>Annual plan</legend>
                <div className="dp-pricing-option-list">
                  {plans.length > 0 ? plans.map((plan) => <button key={plan.id} type="button" data-active={selectedPlan?.id === plan.id} onClick={() => selectPlan(plan)}><span><strong>{plan.label}</strong><small>{plan.bestFor}</small></span><em>{getPriceText(plan)}</em></button>) : <div className="dp-pricing-empty"><strong>Custom review</strong><span>This path routes to the setup review form.</span></div>}
                </div>
              </fieldset>
              <fieldset>
                <legend>Optional capabilities</legend>
                <div className="dp-pricing-addon-stack">
                  {PRICING_MODULE_GROUPS.map((group) => (
                    <details key={group.id} open={activeCapabilityGroup === group.id} onToggle={(event) => event.currentTarget.open && setActiveCapabilityGroup(group.id)}>
                      <summary><span>{groupLabels[group.id] || group.heading}</span><small>{group.modules.length} {group.modules.length === 1 ? "option" : "options"}</small></summary>
                      <div className="dp-pricing-option-list">
                        {group.modules.map((module) => <button key={module.id} type="button" data-active={selectedModuleIds.includes(module.id)} onClick={() => toggleModule(module.id)}><span><strong>{module.label}</strong><small>{module.summary}</small></span><em>{getPriceText(module)}</em></button>)}
                      </div>
                    </details>
                  ))}
                </div>
              </fieldset>
            </div>
            <aside className="dp-pricing-summary" aria-label="Setup summary">
              <p className="dp-pricing-kicker">Setup summary</p>
              <h2>{totalText}</h2>
              <p className="dp-pricing-summary-context">First-year estimate for {selectedPartnerLabel.toLowerCase()}.</p>
              <div className="dp-pricing-summary-plan"><strong>{selectedPlan?.label || "Custom review"}</strong><span>{selectedPlan?.summary || "Select a standard plan or continue with custom review."}</span></div>
              <dl>
                <div><dt>Partner type</dt><dd>{selectedPartnerLabel}</dd></div>
                <div><dt>Annual plan</dt><dd>{selectedPlan ? getPriceText(selectedPlan) : "Custom"}</dd></div>
                <div><dt>Annual add-ons</dt><dd>{formatCurrency(annualAddOnTotal)}</dd></div>
                <div><dt>One-time modules</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div>
                <div><dt>Recurring annual</dt><dd>{selectedPlan?.annualPrice == null ? "Custom" : formatCurrency(recurringAnnualTotal)}</dd></div>
                <div><dt>Locations/properties</dt><dd>{locationCount}</dd></div>
              </dl>
              <div className="dp-pricing-selected" aria-label="Selected add-ons">{selectedModules.length > 0 ? selectedModules.map((module) => <button key={module.id} type="button" onClick={() => toggleModule(module.id)}>{module.label}</button>) : <span>No add-ons selected.</span>}</div>
              <p className="dp-pricing-checkout-note">
                {checkoutMessage || "Paid plans continue to Stripe Checkout when billing is connected. Free and custom setups continue to partner sign-up."}
              </p>
              <button className="dp-pricing-button" type="button" disabled={checkoutState === "loading"} onClick={continueWithSetup}>
                {checkoutState === "loading" ? "Opening checkout" : "Continue"} <ArrowRight aria-hidden="true" />
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
