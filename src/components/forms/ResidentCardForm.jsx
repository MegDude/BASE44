import { useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

export default function ResidentCardForm({
  source = "resident_page",
  initialBuilding = "",
  sourceContext = "",
  onCancel,
  compact = false,
}) {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    building: initialBuilding,
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }

    setForm({
      name: "",
      email: "",
      phone: "",
      building: initialBuilding,
    });
    setStatus("idle");
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");

    const payload = {
      ...form,
      partnerType: "resident",
      organization: form.building,
      source,
      page: window.location.pathname,
      message: "Resident perks card request",
      metadata: {
        sourceContext: sourceContext || source,
        buildingContext: form.building || initialBuilding || null,
      },
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

    await trackEvent("resident_signup", { source, metadata: { building: form.building || null } });
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="dp-glass-main rounded-[24px] p-5">
        <p className="dp-eyebrow">Resident access requested</p>
        <h3 className="mt-2 dp-heading-modern text-2xl">We have your request.</h3>
        <p className="mt-3 dp-body-copy">
          We attached the building and source context to this request so the team can place you in the right resident access flow.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="/map" className="dp-cta-primary">Open the map</a>
          <a href="/perks" className="dp-cta-secondary">View perks</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_10px_24px_rgba(11,31,51,0.05)] ${compact ? "" : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.48)]">
        Resident access
      </p>
      <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-foreground">Get your perks card</h3>
      <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
        Resident card request with building and source context attached. Direct resident access is $25 per year unless your building is already live, and that fee is refunded if the building joins later.
      </p>

      {(sourceContext || form.building) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {form.building ? (
            <span className="inline-flex items-center rounded-full bg-[#f7f9fc] px-3 py-2 text-[11px] font-medium text-foreground/72">
              Building: {form.building}
            </span>
          ) : null}
          {sourceContext ? (
            <span className="inline-flex items-center rounded-full bg-[#f7f9fc] px-3 py-2 text-[11px] font-medium text-foreground/72">
              Source: {sourceContext}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-[12px] font-medium text-foreground">
          <span>Your name</span>
          <input className="dp-input" name="name" value={form.name} onChange={updateField} required />
        </label>
        <label className="grid gap-2 text-[12px] font-medium text-foreground">
          <span>Phone</span>
          <input className="dp-input" name="phone" value={form.phone} onChange={updateField} required />
        </label>
        <label className="grid gap-2 text-[12px] font-medium text-foreground">
          <span>Email</span>
          <input className="dp-input" type="email" name="email" value={form.email} onChange={updateField} required />
        </label>
        <label className="grid gap-2 text-[12px] font-medium text-foreground">
          <span>Building</span>
          <input className="dp-input" name="building" value={form.building} onChange={updateField} />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          Something did not submit correctly. Please try again.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleCancel} className="dp-cta-secondary w-full sm:w-auto">
          Cancel
        </button>
        <button type="submit" className="dp-cta-primary w-full sm:w-auto" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Request resident access"}
        </button>
      </div>
    </form>
  );
}
