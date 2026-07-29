import { useMemo, useState } from "react";
import { ArrowRight, Mail, MapPinned } from "lucide-react";

const partnerTypes = ["Venue", "Property", "Hotel", "Brand", "Civic", "Real Estate", "Resident", "Custom"];

const interestOptions = [
  ["partner-registration", "Partner registration"],
  ["campaign", "Campaign or offer"],
  ["enterprise", "Enterprise setup"],
  ["support", "General question"],
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  partnerType: "Venue",
  interest: "partner-registration",
  message: "",
};

function getQueryContext() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    intent: params.get("intent") || "",
    partnerType: params.get("partnerType") || "",
    sku: params.get("sku") || "",
    modules: params.get("modules") || "",
    annualTotal: params.get("annualTotal") || "",
    oneTimeTotal: params.get("oneTimeTotal") || "",
    locationCount: params.get("locationCount") || "",
    campaignInterest: params.get("campaignInterest") || "",
    reportingNeeds: params.get("reportingNeeds") || "",
    interest: params.get("interest") || "",
    enterprise: params.get("enterprise") || "",
    customOption: params.get("customOption") || "",
    customOptionTitle: params.get("customOptionTitle") || "",
    message: params.get("message") || "",
  };
}

function formatMoneyParam(value, suffix = "") {
  if (!value) return "";
  if (String(value).toLowerCase() === "custom") return "Custom";
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return value;
  return `$${numeric.toLocaleString("en-US")}${suffix}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ContactPage() {
  const queryContext = useMemo(() => getQueryContext(), []);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    partnerType: partnerTypes.includes(queryContext.partnerType) ? queryContext.partnerType : initialForm.partnerType,
    interest: queryContext.interest === "enterprise" ? "enterprise" : queryContext.intent || initialForm.interest,
    message: queryContext.message || (queryContext.enterprise ? `Enterprise setup request: ${queryContext.enterprise}.` : ""),
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const contextRows = [
    ["Intent", queryContext.intent],
    ["Partner type", queryContext.partnerType],
    ["Selected plan", queryContext.sku],
    ["Add-ons", queryContext.modules ? queryContext.modules.split(",").filter(Boolean).length : ""],
    ["Annual estimate", formatMoneyParam(queryContext.annualTotal, "/year")],
    ["One-time support", formatMoneyParam(queryContext.oneTimeTotal)],
    ["Locations", queryContext.locationCount],
    ["Campaign interest", queryContext.campaignInterest],
    ["Reporting needs", queryContext.reportingNeeds],
    ["Enterprise", queryContext.enterprise],
    ["Custom option", queryContext.customOptionTitle || queryContext.customOption],
  ].filter(([, value]) => value);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!isValidEmail(form.email.trim())) nextErrors.email = "Use a valid email address.";
    if (!form.organization.trim()) nextErrors.organization = "Organization is required.";
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
          company: form.organization,
          source: "marketing_contact",
          sourcePage: "Marketing Contact",
          sourceUrl,
          pageUrl: sourceUrl,
          queryContext,
          message: [
            form.message.trim(),
            contextRows.length ? "Pricing context:" : "",
            ...contextRows.map(([label, value]) => `${label}: ${value}`),
          ].filter(Boolean).join("\n"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Submission failed");
      setStatus({
        type: "success",
        message: "Thanks — we received your request. We’ll follow up with the right partner setup path.",
      });
      setForm(initialForm);
      setErrors({});
    } catch {
      setStatus({
        type: "error",
        message: "We couldn’t submit this yet. Please check the form and try again.",
      });
    }
  }

  return (
    <main className="dp-contact-page">
      <section className="dp-contact-hero">
        <div className="dp-contact-container dp-contact-hero-grid">
          <div>
            <p className="dp-contact-eyebrow">Contact</p>
            <h1>Send a setup request.</h1>
            <p>
              Pricing handles the plan and capability selection. This page simply captures who to contact and where the request should go.
            </p>
            <div className="dp-contact-actions">
              <a href="/marketing/pricing" className="dp-contact-button">
                <span>Review pricing</span>
                <ArrowRight aria-hidden="true" />
              </a>
              <a href="mailto:hello@downtownperks.com" className="dp-contact-button">
                <span>Email directly</span>
                <Mail aria-hidden="true" />
              </a>
            </div>
          </div>
          <aside className="dp-contact-summary" aria-label="Pricing context">
            <div className="dp-contact-summary-head">
              <MapPinned aria-hidden="true" />
              <span>Request context</span>
            </div>
            {contextRows.length ? (
              <dl>
                {contextRows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>No pricing setup was attached. You can still send a general request.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="dp-contact-section" id="contact">
        <div className="dp-contact-container dp-contact-form-grid">
          <header>
            <p className="dp-contact-eyebrow">Request Details</p>
            <h2>Tell us who should handle the setup.</h2>
            <p>Keep it simple. The selected pricing setup, if present, is included with the request automatically.</p>
          </header>

          <form className="dp-contact-form" onSubmit={handleSubmit} noValidate>
            <div className="dp-contact-fields">
              <Field label="Name" value={form.name} error={errors.name} onChange={(value) => updateField("name", value)} required />
              <Field label="Email" type="email" value={form.email} error={errors.email} onChange={(value) => updateField("email", value)} required />
              <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
              <Field label="Organization" value={form.organization} error={errors.organization} onChange={(value) => updateField("organization", value)} required />
              <SelectField label="Partner type" value={form.partnerType} options={partnerTypes.map((type) => [type, type])} onChange={(value) => updateField("partnerType", value)} />
              <SelectField label="Interest" value={form.interest} options={interestOptions} onChange={(value) => updateField("interest", value)} />
              <label className="dp-contact-field dp-contact-field-full">
                <span>Message <b>*</b></span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Tell us what you want to set up, launch, or review."
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message ? <small id="contact-message-error">{errors.message}</small> : null}
              </label>
            </div>

            <div className="dp-contact-submit">
              <button className="dp-contact-button" type="submit" disabled={status.type === "submitting"}>
                <span>{status.type === "submitting" ? "Sending..." : "Send request"}</span>
                <ArrowRight aria-hidden="true" />
              </button>
              {status.message ? (
                <p className={`dp-contact-status is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>
                  {status.message}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, type = "text", value, error, onChange, required = false }) {
  const id = `contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label className="dp-contact-field" htmlFor={id}>
      <span>{label} {required ? <b>*</b> : null}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? <small id={`${id}-error`}>{error}</small> : null}
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  const fieldId = `contact-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label className="dp-contact-field" htmlFor={fieldId}>
      <span>{label}</span>
      <select id={fieldId} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}