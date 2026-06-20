import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import {
  ANNUAL_PLANS,
  PARTNER_TYPES,
  PRICING_MODULES,
  getBillingKind,
  getContactProductOptions,
  getPlansForPartnerType,
  getPriceText,
} from "@/config/pricingRegistry";
import { STRIPE_PRODUCTS } from "@/config/stripeProducts";

const partnerTypes = ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate", "Resident", "Other"];

const contactIntents = [
  {
    title: "Venue",
    interest: "venue_partnership",
  },
  {
    title: "Property",
    interest: "property_partnership",
  },
  {
    title: "Hotel",
    interest: "hotel_partnership",
  },
  {
    title: "Brand",
    interest: "brand_sponsorship",
  },
  {
    title: "Civic",
    interest: "civic_program",
  },
  {
    title: "Real Estate",
    interest: "real_estate",
  },
  {
    title: "Resident",
    interest: "resident_access",
  },
];

const interestOptions = [
  ["annual_partner_plan", "Annual partner plan"],
  ["free_listing_or_pilot", "Free listing / free pilot"],
  ["venue_partnership", "Venue partnership"],
  ["property_partnership", "Property partnership"],
  ["hotel_partnership", "Hotel partnership"],
  ["brand_sponsorship", "Brand sponsorship"],
  ["civic_program", "Civic or district program"],
  ["real_estate", "Real estate / leasing context"],
  ["campaign_activation", "Campaign or perk activation"],
  ["event_promotion", "Event promotion"],
  ["survey_research", "Survey or research"],
  ["analytics_reporting", "Analytics / reporting"],
  ["district_sponsorship", "District sponsorship"],
  ["resident_access", "Resident access"],
  ["general_question", "General question"],
].map(([value, label]) => ({ value, label }));

const timelineOptions = ["This month", "Next 30 days", "This quarter", "Exploring"];
const budgetOptions = ["Not sure yet", "$0 pilot", "$30 to $99/year", "$199/year", "Custom"];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  partnerType: "Venue",
  interest: "annual_partner_plan",
  productSku: "venueBasicAnnual",
  timeline: "This month",
  budget: "Not sure yet",
  message: "",
};

const faqs = [
  [
    "Are partner subscriptions monthly or annual?",
    "Partner subscriptions are annual. Campaigns, events, placements, broadcasts, activation support, and research can be added when you need them.",
  ],
  ["Can I ask questions before choosing a plan?", "Yes. Send a note and we will help you choose the path that fits your location, audience, and timing."],
  [
    "Can I start with a free listing or pilot?",
    "Yes. Venues can start with a free listing path, and some partner types may start with a pilot when that is the cleaner first step.",
  ],
  ["Do residents use the same pricing?", "No. Resident access is handled separately from partner plans."],
  ["Can I add campaigns or events later?", "Yes. Add modules when there is a specific offer, event, launch, survey, or sponsorship worth promoting."],
];

const partnerPricingContext = {
  Venue: {
    lead: "Start with visibility, then add perks, campaigns, events, and reporting when you want Downtown Perks to drive more local decisions.",
    modules: "Common add-ons include perk campaigns, event promotion, placements, broadcasts, and activation support.",
  },
  Property: {
    lead: "Give residents a better way to use the neighborhood around your building, with annual options for access, engagement, reporting, and portfolio support.",
    modules: "Common add-ons include building placements, resident surveys, analytics, launch support, and campaigns.",
  },
  Hotel: {
    lead: "Help guests discover what is worth walking to, booking, saving, or asking about nearby.",
    modules: "Common add-ons include guest campaigns, event promotion, nearby placements, reporting, and custom activation.",
  },
  Brand: {
    lead: "Put your brand into real downtown behavior: trails, hotels, events, retail moments, resident perks, and daily routines.",
    modules: "Common add-ons include sponsored campaigns, surveys, broadcasts, district sponsorships, and destination placements.",
  },
  Civic: {
    lead: "Make civic programs, public spaces, and participation opportunities easier to find and act on.",
    modules: "Common add-ons include survey series, event promotion, district sponsorships, reporting, and broadcast support.",
  },
  "Real Estate": {
    lead: "Show the lifestyle around the address, not just the unit or development details.",
    modules: "Common add-ons include listing tours, neighborhood context, custom research, reporting, and placement support.",
  },
  Resident: {
    lead: "Resident access is separate from partner plans. We can help with access, perks, card support, or building questions.",
    modules: "Use the form for resident access questions or help finding the right resident path.",
  },
  Other: {
    lead: "Not every downtown setup fits a standard lane. Tell us what you are trying to make happen and we will route it correctly.",
    modules: "Use the message field for custom requests, enterprise setup, integrations, or mixed partner types.",
  },
};

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
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [errors, setErrors] = useState({});
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const selectedPartnerType = PARTNER_TYPES.includes(form.partnerType) ? form.partnerType : undefined;
  const selectedPlans = useMemo(() => (selectedPartnerType ? getPlansForPartnerType(selectedPartnerType) : []), [selectedPartnerType]);
  const displayedPlans = selectedPlans;
  const productOptions = useMemo(() => getContactProductOptions(selectedPartnerType), [selectedPartnerType]);
  const selectedProduct = useMemo(
    () => productOptions.find((item) => item.id === form.productSku) || productOptions[0],
    [form.productSku, productOptions],
  );
  const pricingContext = partnerPricingContext[form.partnerType] || partnerPricingContext.Other;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const partnerParam = params.get("partnerType");
    const skuParam = params.get("sku");
    const matchedPartner = PARTNER_TYPES.find((type) => type.toLowerCase() === (partnerParam || "").toLowerCase());
    const matchedProduct = [...ANNUAL_PLANS, ...PRICING_MODULES].find((item) => item.id === skuParam);

    if (matchedPartner || matchedProduct) {
      setForm((current) => ({
        ...current,
        partnerType: matchedPartner || current.partnerType,
        productSku: matchedProduct?.id || current.productSku,
        interest: matchedProduct && "annualPrice" in matchedProduct ? "annual_partner_plan" : current.interest,
      }));
    }
  }, []);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateField(field, value) {
    setForm((current) => {
      if (field === "partnerType") {
        const nextPartner = PARTNER_TYPES.includes(value) ? value : undefined;
        const nextPlan = nextPartner ? getPlansForPartnerType(nextPartner)[0] : undefined;
        return { ...current, partnerType: value, productSku: nextPlan?.id || current.productSku };
      }

      return { ...current, [field]: value };
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function applyIntent(intent) {
    setForm((current) => ({
      ...current,
      partnerType: intent.title,
      interest: intent.interest,
    }));
    setStatus({ type: "idle", message: "" });
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) nextErrors.email = "Use a valid email address.";
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
          sku: selectedProduct?.id || form.productSku,
          priceId: selectedProduct ? STRIPE_PRODUCTS[selectedProduct.id]?.priceId || "" : "",
          productTitle: selectedProduct?.label || "",
          priceText: selectedProduct ? getPriceText(selectedProduct) : "",
          billingKind: selectedProduct ? getBillingKind(selectedProduct) : "",
          planInterest: interestOptions.find((item) => item.value === form.interest)?.label || form.interest,
          entryPath: form.interest === "free_listing_or_pilot" ? "free_pilot" : "guided_signup",
          ...getUtm(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Submission failed");

      setStatus({
        type: "success",
        message: "Message sent. We’ll follow up with the right next step.",
      });
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      setStatus({
        type: "error",
        message: "Something did not send. Please try again or email partners@downtownperks.com.",
      });
    }
  }

  return (
    <main className="marketing-contact-page">
      <section className="marketing-contact-hero marketing-contact-container">
        <p className="marketing-contact-eyebrow">Contact Downtown Perks</p>
        <div className="marketing-contact-hero-grid">
          <h1>Start with the right downtown setup.</h1>
          <div className="marketing-contact-hero-copy">
            <p>
              Tell us what you want to bring into the Downtown Perks map, resident experience, or partner network. We’ll help you choose the cleanest annual plan, pilot path, or activation.
            </p>
            <div className="marketing-contact-actions">
              <button type="button" onClick={scrollToForm} className="marketing-contact-button marketing-contact-button-primary">
                Start Conversation
                <ArrowRight aria-hidden="true" />
              </button>
              <a href="/pricing" className="marketing-contact-button marketing-contact-button-secondary">
                View Pricing
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="marketing-contact-section marketing-contact-container" aria-label="Contact intent">
        <SectionHeader
          eyebrow="Partner type"
          title="Choose the closest fit."
          copy="Select the partner type that best matches your property, venue, brand, or program so we can point you toward the right annual setup."
        />
        <div className="marketing-contact-intent-rail">
          {contactIntents.map((intent) => {
            return (
              <button
                key={intent.title}
                type="button"
                onClick={() => applyIntent(intent)}
                aria-pressed={form.partnerType === intent.title}
                className={`marketing-contact-intent-card ${form.partnerType === intent.title ? "is-selected" : ""}`}
              >
                <span className="marketing-contact-intent-title">{intent.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section ref={formRef} id="lead-form" className="marketing-contact-section marketing-contact-container marketing-contact-form-grid">
        <aside className="marketing-contact-context" aria-label={`${form.partnerType} partner type context`}>
          <p className="marketing-contact-eyebrow">Partner type</p>
          <h2>{form.partnerType === "Resident" ? "Resident support." : `${form.partnerType} options.`}</h2>
          <p>{pricingContext.lead}</p>

          {displayedPlans.length > 0 && (
            <div className="marketing-contact-plan-list" aria-label={`${form.partnerType} annual plan options`}>
              {displayedPlans.slice(0, 4).map((plan) => (
                <p key={plan.id} className="marketing-contact-plan-line">
                  <span>{plan.label}</span>
                  <strong>{getPriceText(plan)}</strong>
                </p>
              ))}
            </div>
          )}

          <p className="marketing-contact-context-note">{pricingContext.modules}</p>
        </aside>

        <form onSubmit={handleSubmit} className="marketing-contact-form" aria-label="Downtown Perks contact form" noValidate>
          <div className="marketing-contact-field-grid">
            <Field label="Name" value={form.name} error={errors.name} onChange={(value) => updateField("name", value)} required />
            <Field label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} required />
            <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
            <Field label="Company / Organization" value={form.company} onChange={(value) => updateField("company", value)} />
          </div>

          <div className="marketing-contact-field-grid">
            <SelectField label="Partner type" value={form.partnerType} options={partnerTypes} error={errors.partnerType} onChange={(value) => updateField("partnerType", value)} required />
            <SelectField label="Interest" value={form.interest} options={interestOptions} error={errors.interest} onChange={(value) => updateField("interest", value)} required />
            <SelectField label="Product / Plan" value={form.productSku} options={productOptions.map((item) => ({ value: item.id, label: `${item.label} - ${getPriceText(item)}` }))} onChange={(value) => updateField("productSku", value)} />
            <SelectField label="Timeline" value={form.timeline} options={timelineOptions} onChange={(value) => updateField("timeline", value)} />
            <SelectField label="Budget / Plan Interest" value={form.budget} options={budgetOptions} onChange={(value) => updateField("budget", value)} />
          </div>

          <label className="marketing-contact-field marketing-contact-field-full">
            <span>
              What should we help you make happen? <b>*</b>
            </span>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={5}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              placeholder="Tell us the location, audience, timeline, or campaign you have in mind."
            />
            {errors.message && (
              <small id="message-error" className="marketing-contact-error">
                {errors.message}
              </small>
            )}
          </label>

          <p className="marketing-contact-help">We’ll reply with the cleanest next step: plan, pilot, checkout link, or quick conversation.</p>

          <div className="marketing-contact-submit-row">
            <button type="submit" disabled={status.type === "submitting"} className="marketing-contact-button marketing-contact-button-primary">
              <Send aria-hidden="true" />
              {status.type === "submitting" ? "Sending..." : "Send message"}
            </button>
            {status.message && (
              <p className={`marketing-contact-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                {status.message}
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="marketing-contact-section marketing-contact-container">
        <SectionHeader title="FAQ's" />
        <div className="marketing-contact-faq-list">
          {faqs.map(([question, answer], index) => (
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
              <p>{answer}</p>
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
