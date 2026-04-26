import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

const PARTNER_OPTIONS = [
  { value: "resident", label: "Resident" },
  { value: "property", label: "Property or building" },
  { value: "venue", label: "Venue or local business" },
  { value: "hospitality", label: "Hotel or hospitality" },
  { value: "brand", label: "Brand or sponsor" },
  { value: "civic", label: "Civic or community partner" }
];

export default function PartnerInterestForm({
  partnerType = "venue",
  source = "site_form",
  title = "Start with the right downtown layer.",
  description = "Tell us who you are and we will route the request without making you fill out a system form."
}) {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    partnerType,
    message: ""
  });

  const helper = useMemo(() => {
    const copy = {
      resident: "We will check whether your building already has access and point you to the right perks card flow.",
      property: "We will help you map the building, QR entry points, resident flow, and reporting package.",
      venue: "We will help you list your place, offer, events, redemption flow, and dashboard view.",
      hospitality: "We will help you turn guest orientation into a live neighborhood map.",
      brand: "We will help you shape a district, event, or perks-card activation.",
      civic: "We will help you make local events, businesses, and participation easier to find."
    };

    return copy[form.partnerType] || copy.venue;
  }, [form.partnerType]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");

    const searchParams = new URLSearchParams(window.location.search);

    const payload = {
      ...form,
      source,
      page: window.location.pathname,
      campaign: searchParams.get("utm_campaign") || null,
      medium: searchParams.get("utm_medium") || null,
      utmSource: searchParams.get("utm_source") || null,
      referrer: document.referrer || null
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    await trackEvent("partner_interest_submit", {
      partnerType: form.partnerType,
      source,
      metadata: {
        organization: form.organization || null
      }
    });

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="dp-glass-main rounded-[24px] p-5 md:p-6">
        <p className="dp-eyebrow">Request received</p>
        <h3 className="mt-2 dp-heading-modern text-2xl">You are in the right flow.</h3>
        <p className="mt-3 dp-body-copy">
          We received your request and kept you inside the Downtown Perks experience. You can keep exploring the map or preview the partner dashboard now.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="/map" className="dp-cta-primary">Open the live map</a>
          <a href="/partners/dashboard" className="dp-cta-secondary">Preview dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="dp-glass-main rounded-[24px] p-5 md:p-6">
      <div className="mb-5">
        <p className="dp-eyebrow">Partner intake</p>
        <h3 className="mt-2 dp-heading-modern text-2xl">{title}</h3>
        <p className="mt-3 dp-body-copy">{description}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Name</span>
          <input className="dp-input" name="name" value={form.name} onChange={updateField} required />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Email</span>
          <input className="dp-input" type="email" name="email" value={form.email} onChange={updateField} required />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Phone</span>
          <input className="dp-input" name="phone" value={form.phone} onChange={updateField} />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Organization</span>
          <input className="dp-input" name="organization" value={form.organization} onChange={updateField} />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Role</span>
          <input className="dp-input" name="role" value={form.role} onChange={updateField} />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--dp-navy)]">Partner type</span>
          <select className="dp-input" name="partnerType" value={form.partnerType} onChange={updateField}>
            {PARTNER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 grid gap-1.5">
        <span className="text-sm font-semibold text-[var(--dp-navy)]">What should this help you do?</span>
        <textarea
          className="dp-input min-h-[112px]"
          name="message"
          value={form.message}
          onChange={updateField}
          placeholder="Tell us about your building, business, activation, or resident flow."
        />
      </label>

      <p className="mt-3 text-sm text-[var(--dp-text-soft)]">{helper}</p>

      {status === "error" && (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          Something did not submit correctly. Please try again.
        </p>
      )}

      <button type="submit" className="mt-5 dp-cta-primary w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Submit interest"}
      </button>
    </form>
  );
}
