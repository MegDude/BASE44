import { useState } from "react";
import { trackEvent } from "@/lib/trackEvent";

export default function ResidentCardForm({ source = "resident_page" }) {
  const [status, setStatus] = useState("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    building: ""
  });

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
      message: "Resident perks card request"
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
        <p className="dp-eyebrow">Perks card requested</p>
        <h3 className="mt-2 dp-heading-modern text-2xl">Your downtown flow is ready to start.</h3>
        <p className="mt-3 dp-body-copy">
          Keep exploring nearby perks, events, and places while your access is confirmed.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a href="/map" className="dp-cta-primary">Open the map</a>
          <a href="/perks" className="dp-cta-secondary">View perks</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="dp-glass-main rounded-[24px] p-5">
      <p className="dp-eyebrow">Resident access</p>
      <h3 className="mt-2 dp-heading-modern text-2xl">Get your perks card.</h3>
      <p className="mt-3 dp-body-copy">
        No app download. No source field. Just your details and the building or neighborhood you are connected to.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input className="dp-input" name="name" placeholder="Name" value={form.name} onChange={updateField} required />
        <input className="dp-input" type="email" name="email" placeholder="Email" value={form.email} onChange={updateField} required />
        <input className="dp-input" name="phone" placeholder="Phone" value={form.phone} onChange={updateField} />
        <input className="dp-input" name="building" placeholder="Building or neighborhood" value={form.building} onChange={updateField} />
      </div>

      {status === "error" && (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          Something did not submit correctly. Please try again.
        </p>
      )}

      <button type="submit" className="mt-5 dp-cta-primary w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Get card"}
      </button>
    </form>
  );
}
