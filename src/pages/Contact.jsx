import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import {
  ANNUAL_PLANS,
  PARTNER_TYPES,
  PRICING_MODULES,
  formatCurrency,
  getBillingKind,
  getPriceText,
} from "@/config/pricingRegistry";
import { STRIPE_PRODUCTS } from "@/config/stripeProducts";

const partnerTypeOptions = [
  "Venue",
  "Property",
  "Hotel",
  "Brand",
  "Civic",
  "Real Estate",
  "Resident",
  "Custom",
];

const enterpriseInterestLabels = {
  "multi-property": "Multi-property",
  "district-programs": "District programs",
  "destination-sponsorships": "Destination sponsorships",
  "major-developments": "Major developments",
  "custom-research": "Custom research",
  "custom-integrations": "Custom integrations",
};

const contactIntents = [
  {
    title: "Venue",
    interest: "annual_partner_plan",
  },
  {
    title: "Property",
    interest: "property_building_setup",
  },
  {
    title: "Hotel",
    interest: "hotel_guest_experience",
  },
  {
    title: "Brand",
    interest: "brand_sponsorship",
  },
  {
    title: "Civic",
    interest: "civic_district_program",
  },
  {
    title: "Real Estate",
    interest: "real_estate_listing",
  },
  {
    title: "Resident",
    partnerType: "Resident",
    interest: "resident_access_question",
  },
  {
    title: "Custom",
    partnerType: "Custom",
    interest: "custom_enterprise_review",
  },
];

const interestOptions = [
  ["annual_partner_plan", "Annual Partner Plan"],
  ["campaign_or_offer", "Campaign or Offer"],
  ["event_promotion", "Event Promotion"],
  ["property_building_setup", "Property or Building Setup"],
  ["hotel_guest_experience", "Hotel Guest Experience"],
  ["civic_district_program", "Civic Program"],
  ["brand_sponsorship", "Brand Sponsorship"],
  ["real_estate_listing", "Real Estate Listing"],
  ["custom_enterprise_review", "Custom / Enterprise Review"],
  ["resident_access_question", "Resident Access Question"],
].map(([value, label]) => ({ value, label }));

const timelineOptions = ["This month", "Next 30 days", "This quarter", "Exploring"];
const budgetOptions = ["Confirm in registration", "$30 to $99/year", "$199/year", "Enterprise / custom"];

const registrationPlanOptions = {
  Venue: [
    { value: "venueFreeListing", label: "Venue Free Listing - $0/year", annualPrice: 0 },
    { value: "venueBasicAnnual", label: "Venue Basic Annual - $30/year", annualPrice: 30 },
    { value: "venueGrowthAnnual", label: "Venue Growth Annual - $79/year", annualPrice: 79 },
    { value: "venueProAnnual", label: "Venue Pro Annual - $199/year", annualPrice: 199 },
  ],
  Property: [
    { value: "propertyBasicBuildingAnnual", label: "Property Starter - $99/year", annualPrice: 99 },
    { value: "propertyResidentPlusAnnual", label: "Property Core - $149/year", annualPrice: 149 },
    { value: "propertyPortfolioCustom", label: "Property Portfolio - Custom", annualPrice: null },
  ],
  Hotel: [
    { value: "hotelStarterAnnual", label: "Hotel Starter - $99/year", annualPrice: 99 },
    { value: "hotelProAnnual", label: "Hotel Guest Experience - $149/year", annualPrice: 149 },
    { value: "hotelPortfolioCustom", label: "Hotel Portfolio - Custom", annualPrice: null },
  ],
  Brand: [
    { value: "brandAccessAnnual", label: "Brand Starter - $99/year", annualPrice: 99 },
    { value: "brandCampaignsAnnual", label: "Brand Campaign - $149/year", annualPrice: 149 },
    { value: "brandSponsorshipCustom", label: "Brand Sponsorship - Custom", annualPrice: null },
  ],
  Civic: [
    { value: "civicCommunityAnnual", label: "Civic Community - $30/year", annualPrice: 30 },
    { value: "civicBasicAnnual", label: "Civic Program - $99/year", annualPrice: 99 },
    { value: "civicDistrictCustom", label: "Civic District - Custom", annualPrice: null },
  ],
  "Real Estate": [
    { value: "realEstateAnnual", label: "Real Estate Listing Starter - $99/year", annualPrice: 99 },
    { value: "realEstateCoreAnnual", label: "Real Estate Core - $149/year", annualPrice: 149 },
    { value: "realEstateProAnnual", label: "Real Estate Pro - $199/year", annualPrice: 199 },
  ],
  Resident: [
    { value: "residentAccessQuestion", label: "Resident access question", annualPrice: null },
  ],
  Custom: [
    { value: "customReview", label: "Custom Review - Custom", annualPrice: null },
  ],
};

function getRegistrationPlanOptions(partnerType) {
  return registrationPlanOptions[partnerType] || registrationPlanOptions.Custom;
}

function getPlanDisplayName(option, fallback = "Review needed") {
  if (!option?.label) return fallback;
  return option.label.replace(/\s+-\s+.*$/, "");
}

function getPlanPriceText(option, fallback = "Review needed") {
  if (!option) return fallback;
  if (option.annualPrice == null) return "Custom";
  return `${formatCurrency(option.annualPrice)}/year`;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  partnerType: "Venue",
  interest: "annual_partner_plan",
  productSku: "venueBasicAnnual",
  timeline: "This month",
  budget: "Confirm in registration",
  serviceArea: "",
  message: "",
};

const faqs = [
  {
    question: "How does partner registration work?",
    answer: [
      "Registration creates the starting point for your Downtown Perks workspace. Choose the partner type that best matches your organization, confirm a plan or request, and submit your details. Once submitted, we use that information to create or configure the correct workspace, permissions, reporting access, and onboarding path.",
      "Most partners can complete setup without a sales process. If your organization requires multiple locations, custom integrations, sponsorships, research, or enterprise reporting, the request routes into the right workspace configuration.",
    ],
  },
  {
    question: "Can I register before choosing every add-on?",
    answer: [
      "Yes. The registration process is designed to get your organization into the platform as quickly as possible.",
      "You can start with a basic annual plan and add campaigns, events, reporting, broadcasts, surveys, QR programs, sponsorships, and other capabilities later from inside the workspace.",
      "You do not need to decide everything before getting started.",
    ],
  },
  {
    question: "What should custom or enterprise partners choose?",
    answer: [
      "Choose Custom if your organization does not fit neatly into a single partner type or if you manage multiple locations, properties, hotels, venues, brands, districts, or programs.",
      "Custom requests are also appropriate for multi-property portfolios, hospitality groups, district-wide initiatives, sponsorship programs, research projects, API or data integrations, and enterprise reporting requirements.",
      "The request routes into the most appropriate workspace structure.",
    ],
  },
  {
    question: "Is this form for residents too?",
    answer: [
      "Residents can use Downtown Perks without creating a partner account.",
      "This registration flow is intended for organizations, businesses, properties, hotels, brands, civic programs, and real estate teams that want access to workspace features, reporting, campaigns, and management tools.",
      "If you are a resident looking for perks, events, places, or local recommendations, open the map and start exploring.",
    ],
  },
  {
    question: "Can campaigns or events be added later?",
    answer: [
      "Yes.",
      "The platform is designed to grow with your participation.",
      "Many partners start with a listing or annual plan and expand over time as they begin running offers, events, campaigns, QR activations, resident programs, or reporting initiatives.",
      "Workspace access is continuous, and additional capabilities can be activated when they become useful.",
    ],
  },
  {
    question: "Will I be able to manage everything myself?",
    answer: [
      "Yes. Downtown Perks is designed as a self-service platform.",
      "Partners can manage profiles, locations, campaigns, events, offers, QR experiences, team members, and reporting directly from the workspace. Support is available when needed, but day-to-day management should not require assistance from the Downtown Perks team.",
    ],
  },
  {
    question: "Can I manage multiple locations or organizations?",
    answer: [
      "Yes. The platform supports multi-location and multi-organization management.",
      "Depending on your permissions, one account can access multiple properties, hotels, venues, brands, civic programs, or real estate portfolios from a single workspace using the organization switcher. Access is controlled through role-based permissions and workspace memberships.",
    ],
  },
];

const planAliases = {
  "venue-free-listing": "venueFreeListing",
  "venue-basic": "venueBasicAnnual",
  "venue-growth": "venueGrowthAnnual",
  "venue-pro": "venueProAnnual",
  "property-starter": "propertyBasicBuildingAnnual",
  "property-core": "propertyResidentPlusAnnual",
  "property-portfolio": "propertyPortfolioCustom",
  "hotel-starter": "hotelStarterAnnual",
  "hotel-guest-experience": "hotelProAnnual",
  "hotel-portfolio": "hotelPortfolioCustom",
  "brand-starter": "brandAccessAnnual",
  "brand-campaign": "brandCampaignsAnnual",
  "brand-sponsorship": "brandSponsorshipCustom",
  "civic-community": "civicCommunityAnnual",
  "civic-program": "civicBasicAnnual",
  "civic-district": "civicDistrictCustom",
  "real-estate-listing-starter": "realEstateAnnual",
  "real-estate-core": "realEstateCoreAnnual",
  "real-estate-pro": "realEstateProAnnual",
  "custom-review": "customReview",
};

const partnerPricingContext = {
  Venue: {
    lead: "For restaurants, bars, coffee shops, wellness, retail, and local services that want nearby people to find them more easily.",
    modules: "Free Listing helps you get discovered. Basic keeps you visible. Growth supports offers and events. Pro turns local discovery into an always-on channel.",
  },
  Property: {
    lead: "For apartments, condos, mixed-use developments, residential towers, and managed communities that want to turn local discovery into a resident amenity.",
    modules: "Starter connects one building to resident discovery. Core turns Downtown Perks into an engagement channel. Portfolio supports multi-property operators.",
  },
  Hotel: {
    lead: "For hotels and guest experience teams that want to connect guests to nearby places, events, perks, and local recommendations.",
    modules: "Give guests a better way to discover what is nearby while tracking engagement across the stay.",
  },
  Brand: {
    lead: "For local, regional, and national brands activating around downtown behavior, events, districts, and real-world moments.",
    modules: "Reach residents, visitors, and downtown audiences through places, events, and real-world moments.",
  },
  Civic: {
    lead: "For districts, associations, nonprofits, and public programs that want to increase awareness, attendance, and participation.",
    modules: "Increase participation, attendance, and awareness across civic programs, public events, districts, and community initiatives.",
  },
  "Real Estate": {
    lead: "For developers, brokerages, and leasing teams connecting listings, buildings, and neighborhood context.",
    modules: "Use this for property pages, neighborhood guides, lead routing, launch campaigns, and leasing support.",
  },
  Resident: {
    lead: "Residents do not need partner registration to use Downtown Perks. Use this option only for access, perks card, or building-specific questions.",
    modules: "Use the message box for perks card help, account access, building questions, saved places, events, or anything you need us to check.",
  },
  Other: {
    lead: "For mixed partner types, multi-location programs, integrations, sponsorships, research, or anything that needs a tailored workspace configuration.",
    modules: "Use the message box for enterprise plans, mixed partner types, integrations, research, sponsorships, or district-wide ideas.",
  },
  Custom: {
    lead: "For mixed partner types, multi-location programs, integrations, sponsorships, research, or anything that needs a tailored workspace configuration.",
    modules: "Use the message box for enterprise plans, mixed partner types, integrations, research, sponsorships, or district-wide ideas.",
  },
};

function getSetupHeading(partnerType) {
  if (partnerType === "Resident") return "Resident access";
  if (partnerType === "Other" || partnerType === "Custom") return "Custom setup";
  return `${partnerType} setup`;
}

function getDisplayPartnerType(partnerType) {
  return partnerType === "Other" ? "Custom" : partnerType;
}

function formatParamMoney(value, suffix = "") {
  if (!value) return "";
  const normalized = String(value).trim();
  if (!normalized) return "";
  if (normalized.toLowerCase() === "custom") return "Custom";
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return normalized;
  return `${formatCurrency(numeric)}${suffix}`;
}

function getUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ContactPage() {
  const formRef = useRef(null);
  const selectedIntentRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);
  const [queryTotals, setQueryTotals] = useState({ annual: "", oneTime: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [errors, setErrors] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const planOptions = useMemo(() => getRegistrationPlanOptions(form.partnerType), [form.partnerType]);
  const displayedPlans = planOptions;
  const selectedProduct = useMemo(
    () => ANNUAL_PLANS.find((item) => item.id === form.productSku),
    [form.productSku],
  );
  const selectedPlanOption = useMemo(
    () => planOptions.find((item) => item.value === form.productSku),
    [form.productSku, planOptions],
  );
  const selectedModules = useMemo(
    () => PRICING_MODULES.filter((module) => selectedModuleIds.includes(module.id)),
    [selectedModuleIds],
  );
  const selectedPlan = selectedProduct && "annualPrice" in selectedProduct ? selectedProduct : undefined;
  const selectedPlanName = getPlanDisplayName(selectedPlanOption, selectedPlan?.label?.replace(/\s+Annual$/i, "") || "Review needed");
  const selectedPlanPrice = selectedPlanOption ? getPlanPriceText(selectedPlanOption) : selectedPlan ? getPriceText(selectedPlan) : "Review needed";
  const oneTimeModuleTotal = selectedModules
    .filter((module) => module.billing !== "Annual add-on")
    .reduce((sum, module) => sum + module.price, 0);
  const annualModuleTotal = selectedModules
    .filter((module) => module.billing === "Annual add-on")
    .reduce((sum, module) => sum + module.price, 0);
  const annualBasePrice = selectedPlanOption?.annualPrice ?? selectedPlan?.annualPrice;
  const computedAnnualTotal = annualBasePrice == null
    ? "Custom"
    : formatCurrency((annualBasePrice || 0) + annualModuleTotal) + "/year";
  const estimatedAnnualTotal = queryTotals.annual || computedAnnualTotal;
  const estimatedOneTimeTotal = queryTotals.oneTime || formatCurrency(oneTimeModuleTotal);
  const pricingContext = partnerPricingContext[form.partnerType] || partnerPricingContext.Other;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const partnerParam = params.get("partnerType");
    const skuParam = params.get("sku");
    const planParam = params.get("plan");
    const modulesParam = params.get("modules");
    const annualTotalParam = params.get("annualTotal");
    const oneTimeTotalParam = params.get("oneTimeTotal");
    const interestParam = params.get("interest");
    const enterpriseParam = params.get("enterprise");
    const normalizedPartnerParam = (partnerParam || "").toLowerCase();
    const matchedPartner = PARTNER_TYPES.find((type) => type.toLowerCase() === normalizedPartnerParam)
      || (["custom", "other"].includes(normalizedPartnerParam) ? "Custom" : undefined);
    const planAlias = planParam ? planAliases[planParam] || planParam : "";
    const matchedProduct = ANNUAL_PLANS.find((item) => item.id === (skuParam || planAlias));
    const matchedModuleSku = PRICING_MODULES.find((item) => item.id === skuParam);
    const enterpriseLabel = enterpriseParam ? enterpriseInterestLabels[enterpriseParam] : "";
    const matchedInterest = interestOptions.find((item) => item.value === interestParam)?.value;
    const registrationPlans = getRegistrationPlanOptions(enterpriseLabel ? "Custom" : matchedPartner || initialForm.partnerType);
    const matchedRegistrationPlan = registrationPlans.find((item) => item.value === (skuParam || planAlias));
    const fallbackPlan = registrationPlans[0];

    if (matchedPartner || matchedProduct || matchedRegistrationPlan || enterpriseLabel || matchedInterest) {
      setForm((current) => ({
        ...current,
        partnerType: enterpriseLabel ? "Custom" : matchedPartner || current.partnerType,
        productSku: matchedRegistrationPlan?.value || matchedProduct?.id || fallbackPlan?.value || current.productSku,
        interest: enterpriseLabel ? "custom_enterprise_review" : matchedInterest || (matchedProduct && "annualPrice" in matchedProduct ? "annual_partner_plan" : current.interest),
        message: enterpriseLabel && !current.message ? `Enterprise registration request: ${enterpriseLabel}.` : current.message,
      }));
    }

    if (modulesParam) {
      setSelectedModuleIds(modulesParam.split(",").map((item) => item.trim()).filter(Boolean));
    } else if (matchedModuleSku) {
      setSelectedModuleIds([matchedModuleSku.id]);
    }
    setQueryTotals({
      annual: formatParamMoney(annualTotalParam, "/year"),
      oneTime: formatParamMoney(oneTimeTotalParam),
    });
  }, []);

  useEffect(() => {
    selectedIntentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [form.partnerType]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateField(field, value) {
    setForm((current) => {
      if (field === "partnerType") {
        const nextPlan = getRegistrationPlanOptions(value)[0];
        return { ...current, partnerType: value, productSku: nextPlan?.value || "customReview" };
      }

      return { ...current, [field]: value };
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function applyIntent(intent) {
    const nextPartnerType = intent.partnerType || intent.title;
    const nextPlan = getRegistrationPlanOptions(nextPartnerType)[0];
    setForm((current) => ({
      ...current,
      partnerType: nextPartnerType,
      interest: intent.interest,
      productSku: nextPlan?.value || current.productSku,
    }));
    setStatus({ type: "idle", message: "" });
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) nextErrors.email = "Use a valid email address.";
    if (!form.company.trim()) nextErrors.company = "Organization name is required.";
    if (!form.partnerType) nextErrors.partnerType = "Partner type is required.";
    if (!form.interest) nextErrors.interest = "Interest is required.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setStatus({ type: "submitting", message: "Sending..." });

    try {
      const sourceUrl = typeof window !== "undefined" ? window.location.href : "";
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "marketing_contact",
          sourcePage: "Marketing Contact",
          sourceUrl,
          pageUrl: sourceUrl,
          message: [
            form.message.trim(),
            form.website?.trim() ? `Website: ${form.website.trim()}` : "",
            form.serviceArea?.trim() ? `Location or service area: ${form.serviceArea.trim()}` : "",
            `Selected setup: ${form.partnerType} / ${selectedPlanName} / Annual total ${estimatedAnnualTotal} / One-time total ${estimatedOneTimeTotal}`,
          ].filter(Boolean).join("\n\n"),
          sku: selectedProduct?.id || form.productSku,
          priceId: selectedProduct ? STRIPE_PRODUCTS[selectedProduct.id]?.priceId || "" : "",
          productTitle: selectedPlanName,
          priceText: selectedPlanPrice,
          billingKind: selectedProduct ? getBillingKind(selectedProduct) : "",
          planInterest: interestOptions.find((item) => item.value === form.interest)?.label || form.interest,
          entryPath: form.interest === "annual_partner_plan" ? "guided_signup" : "guided_review",
          ...getUtm(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Submission failed");

      setStatus({
        type: "success",
          message: "Thanks — we received your request. We’ll follow up with the right partner setup path.",
      });
      setForm(initialForm);
      setSelectedModuleIds([]);
      setQueryTotals({ annual: "", oneTime: "" });
      setErrors({});
    } catch (error) {
      setStatus({
        type: "error",
        message: "We couldn’t submit this yet. Please check the form and try again.",
      });
    }
  }

  return (
    <main className="marketing-contact-page">
      <section className="marketing-contact-hero marketing-contact-container">
        <p className="marketing-contact-eyebrow">Partner registration</p>
        <div className="marketing-contact-hero-grid">
          <h1 className="marketing-contact-two-line-heading">
            <span>Confirm your setup</span>
            <span>and tell us where to route it.</span>
          </h1>
          <div className="marketing-contact-hero-copy">
            <p>Use this page to confirm your selected setup and tell us what you want connected to the workspace.</p>
            <div className="marketing-contact-actions">
              <button type="button" onClick={scrollToForm} className="marketing-contact-button marketing-contact-button-primary">
                Submit partner request
                <ArrowRight aria-hidden="true" />
              </button>
              <a href="/marketing/pricing" className="marketing-contact-button marketing-contact-button-secondary">
                Review pricing
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-contact-section marketing-contact-container" aria-label="Contact intent">
        <SectionHeader
          eyebrow="Partner type"
          title="Choose the lane that matches the work."
          copy="Pick the option that sounds closest. Use Custom for mixed partner types, integrations, research, sponsorships, or anything that needs a tailored setup."
        />
        <div className="marketing-contact-intent-rail">
          {contactIntents.map((intent) => {
            const isSelected = form.partnerType === (intent.partnerType || intent.title);
            return (
              <button
                key={intent.title}
                ref={isSelected ? selectedIntentRef : undefined}
                type="button"
                onClick={() => applyIntent(intent)}
                aria-pressed={isSelected}
                className={`marketing-contact-intent-card ${isSelected ? "is-selected" : ""}`}
              >
                <span className="marketing-contact-intent-title">{intent.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="marketing-contact-section marketing-contact-container marketing-contact-setup-section" aria-label="Selected setup">
        <div className="marketing-contact-setup-layout">
        <aside className="marketing-contact-context" aria-label={`${form.partnerType} partner type context`}>
          <p className="marketing-contact-eyebrow">Partner setup</p>
          <h2>{getSetupHeading(form.partnerType)}</h2>
          <p>{pricingContext.lead}</p>

          {displayedPlans.length > 0 && (
            <div className="marketing-contact-plan-list" aria-label={`${form.partnerType} annual plan options`}>
              {displayedPlans.slice(0, 4).map((plan) => (
                <p key={plan.value} className="marketing-contact-plan-line">
                  <span className="marketing-contact-plan-copy">
                    <span className="marketing-contact-plan-name">{getPlanDisplayName(plan)}</span>
                  </span>
                  <strong>{getPlanPriceText(plan)}</strong>
                </p>
              ))}
            </div>
          )}

          <p className="marketing-contact-context-note">Pricing configures the setup. Registration confirms the setup and routes it into the right workspace path.</p>
        </aside>

        <section className="marketing-contact-setup-summary" aria-label="Your selected setup">
          <div>
            <p className="marketing-contact-eyebrow">Your selected setup</p>
            <h2>Your selected setup</h2>
            <p>This is the setup we’ll carry into registration. You can still adjust the plan, capabilities, or timing before activation.</p>
          </div>
          <dl>
            <div>
              <dt>Partner Type</dt>
              <dd>{getDisplayPartnerType(form.partnerType)}</dd>
            </div>
            <div>
              <dt>Plan</dt>
              <dd>{selectedPlanName}</dd>
            </div>
            <div>
              <dt>Annual Subscription</dt>
              <dd>{selectedPlanPrice}</dd>
            </div>
            <div>
              <dt>Selected Modules</dt>
              <dd>{selectedModules.length ? selectedModules.map((module) => module.label).join(", ") : "None selected yet"}</dd>
            </div>
            <div>
              <dt>Estimated Annual Total</dt>
              <dd>{estimatedAnnualTotal}</dd>
            </div>
            <div>
              <dt>Estimated One-Time Total</dt>
              <dd>{estimatedOneTimeTotal}</dd>
            </div>
          </dl>
          <a href="/marketing/pricing" className="marketing-contact-edit-setup">
            <span aria-hidden="true">←</span>
            Edit pricing setup
          </a>
        </section>
        </div>
      </section>

      <section ref={formRef} id="lead-form" className="marketing-contact-section marketing-contact-container marketing-contact-form-grid">
        <div className="marketing-contact-form-intro">
          <p className="marketing-contact-eyebrow">Registration details</p>
          <h2>Tell us what to connect.</h2>
          <p>These details help us confirm the correct account, workspace, package, location, and next action.</p>
        </div>

        <form onSubmit={handleSubmit} className="marketing-contact-form" aria-label="Downtown Perks contact form" noValidate>
          <div className="marketing-contact-form-group">
            <div className="marketing-contact-form-group-head">
              <h3>Contact</h3>
            </div>
          <div className="marketing-contact-field-grid">
            <Field label="Primary contact" value={form.name} error={errors.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} required />
            <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
          </div>
          </div>

          <div className="marketing-contact-form-group">
            <div className="marketing-contact-form-group-head">
              <h3>Organization</h3>
            </div>
          <div className="marketing-contact-field-grid">
            <Field label="Organization name" value={form.company} error={errors.company} onChange={(value) => updateField("company", value)} required />
            <Field label="Website" value={form.website} onChange={(value) => updateField("website", value)} />
            <Field label="Location or service area" value={form.serviceArea} onChange={(value) => updateField("serviceArea", value)} />
          </div>
          </div>

          <div className="marketing-contact-form-group">
            <div className="marketing-contact-form-group-head">
              <h3>Setup</h3>
            </div>
          <div className="marketing-contact-field-grid">
            <SelectField label="Partner type" value={form.partnerType} options={partnerTypeOptions} error={errors.partnerType} onChange={(value) => updateField("partnerType", value)} required />
            <SelectField label="Interest" value={form.interest} options={interestOptions} error={errors.interest} onChange={(value) => updateField("interest", value)} required />
            <SelectField label="Product / Plan" value={form.productSku} options={planOptions} onChange={(value) => updateField("productSku", value)} />
            <SelectField label="Timeline" value={form.timeline} options={timelineOptions} onChange={(value) => updateField("timeline", value)} />
            <SelectField label="Budget / Plan Interest" value={form.budget} options={budgetOptions} onChange={(value) => updateField("budget", value)} />
          </div>
          </div>

          <div className="marketing-contact-form-group">
            <div className="marketing-contact-form-group-head">
              <h3>Goal</h3>
            </div>
          <label className="marketing-contact-field marketing-contact-field-full">
            <span>
              What are you trying to promote? <b>*</b>
            </span>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={5}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              placeholder="Tell us the location, launch timing, audience, reporting need, or custom request you want connected to this account."
            />
            {errors.message && (
              <small id="message-error" className="marketing-contact-error">
                {errors.message}
              </small>
            )}
          </label>

          <p className="marketing-contact-help">We use these details to confirm the right workspace, plan, access, and next action.</p>
          </div>

          <div className="marketing-contact-submit-row">
            <button type="submit" disabled={status.type === "submitting"} className="marketing-contact-button marketing-contact-button-primary">
              <Send aria-hidden="true" />
              {status.type === "submitting" ? "Sending..." : "Submit partner request"}
            </button>
            {status.message && status.type !== "success" && (
              <p className={`marketing-contact-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                {status.message}
              </p>
            )}
          </div>

          {status.type === "success" && (
            <div className="marketing-contact-success" role="status">
              <h3>Thanks — we received your request.</h3>
              <p>We’ll follow up with the right partner setup path.</p>
              <a href="/partner-portal" className="marketing-contact-button marketing-contact-button-secondary">
                Open partner workspace
                <ArrowRight aria-hidden="true" />
              </a>
              <a href="/marketing/pricing" className="marketing-contact-button marketing-contact-button-secondary">
                Review pricing setup
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          )}
        </form>
      </section>

      <section className="marketing-contact-section marketing-contact-container">
        <SectionHeader eyebrow="Registration FAQ" title="Practical answers." />
        <div className="marketing-contact-faq-list">
          {faqs.map(({ question, answer }, index) => (
            <details key={question} className="marketing-contact-faq" open={openFaqIndex === index}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setOpenFaqIndex((current) => (current === index ? -1 : index));
                }}
              >
                <span>{question}</span>
                <ChevronDown className="marketing-contact-faq-icon" aria-hidden="true" />
              </summary>
              <div className="marketing-contact-faq-answer">
                {answer.map((block, blockIndex) => Array.isArray(block) ? (
                  <ul key={`${question}-list-${blockIndex}`}>
                    {block.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p key={`${question}-paragraph-${blockIndex}`}>{block}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, copy }) {
  return (
    <div className="marketing-contact-section-head">
      <div>
        {eyebrow && <p className="marketing-contact-eyebrow">{eyebrow}</p>}
        {title && <h2>{title}</h2>}
      </div>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, error, required = false }) {
  const id = `contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const errorId = `${id}-error`;
  return (
    <label className="marketing-contact-field" htmlFor={id}>
      <span>
        {label} {required && <b>*</b>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <small id={errorId} className="marketing-contact-error">
          {error}
        </small>
      )}
    </label>
  );
}

function SelectField({ label, value, options, onChange, error, required = false }) {
  const id = `contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const errorId = `${id}-error`;
  const normalizedOptions = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
  return (
    <label className="marketing-contact-field" htmlFor={id}>
      <span>
        {label} {required && <b>*</b>}
      </span>
      <select
        id={id}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <small id={errorId} className="marketing-contact-error">
          {error}
        </small>
      )}
    </label>
  );
}
