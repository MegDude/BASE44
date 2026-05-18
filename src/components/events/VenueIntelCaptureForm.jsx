import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";

const INITIAL_STATE = {
  venueName: "",
  category: "",
  hours: "",
  special: "",
  happyHour: "",
  notes: "",
};

export default function VenueIntelCaptureForm() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const isDisabled = useMemo(
    () => !form.venueName.trim() || !form.hours.trim() || !form.special.trim(),
    [form]
  );

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isDisabled || submitting) return;

    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/venue-intel-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Could not send the update.");
      }

      setForm(INITIAL_STATE);
      setStatus({ type: "success", message: "Update sent to the event and venue intake sheet." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not send the update.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-white/94 p-4 shadow-[0_16px_42px_rgba(11,31,51,0.08)] backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
        Backend intake
      </div>
      <h3 className="mt-2 font-heading text-[1.35rem] leading-[1.05] text-[var(--dp-navy)]">
        Add a venue, special, or event update.
      </h3>
      <p className="mt-2 text-[13px] leading-5 text-[rgba(11,31,51,0.64)]">
        This is the minimum live capture path for hours, drink specials, happy hour, and event notes.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input
          value={form.venueName}
          onChange={(event) => updateField("venueName", event.target.value)}
          placeholder="Venue or event name"
          className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 text-sm outline-none"
        />
        <input
          value={form.category}
          onChange={(event) => updateField("category", event.target.value)}
          placeholder="Category"
          className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 text-sm outline-none"
        />
        <input
          value={form.hours}
          onChange={(event) => updateField("hours", event.target.value)}
          placeholder="Operating times"
          className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 text-sm outline-none"
        />
        <input
          value={form.special}
          onChange={(event) => updateField("special", event.target.value)}
          placeholder="Drink or food special"
          className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 text-sm outline-none"
        />
        <input
          value={form.happyHour}
          onChange={(event) => updateField("happyHour", event.target.value)}
          placeholder="Happy hour"
          className="h-11 rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 text-sm outline-none md:col-span-2"
        />
        <textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Extra notes"
          className="min-h-[92px] rounded-[14px] border border-[rgba(11,31,51,0.08)] bg-[#fafbfe] px-3 py-3 text-sm outline-none md:col-span-2"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className={`text-[12px] ${status.type === "error" ? "text-[#9f2f2f]" : "text-[rgba(11,31,51,0.58)]"}`}>
          {status.message || "Submissions are written to the shared intake sheet."}
        </div>
        <button
          type="submit"
          disabled={isDisabled || submitting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-[var(--dp-navy)] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send update
        </button>
      </div>
    </form>
  );
}
