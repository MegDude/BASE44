import { useMemo, useState } from "react";
import { CalendarDays, Car, Check, Clock, ExternalLink, Heart, MapPin, Send, Sparkles, TicketPercent, Users } from "lucide-react";
import { buildMapActionPayload, getMapPanelStandard } from "@/lib/map/mapPanelStandard";
import { directionsUrl } from "@/lib/map/mapActionRegistry";
import { getWorkflowProfileId, getWorkflowSessionId } from "@/lib/backendWorkflows";

const FORM_ACTIONS = new Set([
  "reserve",
  "request_info",
  "request_tour",
  "concierge_request",
  "service_request",
  "campaign_request",
  "plan_visit",
]);

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function actionIcon(action) {
  if (action === "rsvp") return TicketPercent;
  if (action === "route") return Car;
  if (action === "redeem") return Sparkles;
  if (action === "reserve") return CalendarDays;
  if (action === "save") return Heart;
  return Send;
}

export default function MapActionStandardPanel({
  entity,
  mode = "resident",
  saved = false,
  rsvped = false,
  onSave,
  onRsvp,
  onContact,
}) {
  const standard = useMemo(() => getMapPanelStandard(entity, mode), [entity, mode]);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({
    date: todayIsoDate(),
    time: "19:00",
    partySize: "2",
    name: "",
    contact: "",
    note: "",
  });
  const PrimaryIcon = actionIcon(standard.primaryAction);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitAction = async (action = standard.primaryAction, formPayload = form) => {
    setSubmitting(true);
    setResult("");
    try {
      const response = await fetch("/api/map-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildMapActionPayload({
          entity,
          standard,
          action,
          mode,
          form: formPayload,
          sessionId: getWorkflowSessionId(),
          profileId: getWorkflowProfileId(),
        })),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Action failed");
      setResult(payload?.message || "Request saved.");
      setFormOpen(false);
    } catch (error) {
      setResult(error?.message || "Could not save this request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimary = () => {
    if (standard.primaryAction === "rsvp") {
      onRsvp?.();
      submitAction("rsvp", { status: rsvped ? "removed" : "rsvped" });
      return;
    }
    if (standard.primaryAction === "redeem") {
      submitAction("redeem", { status: "opened" });
      return;
    }
    if (standard.primaryAction === "route") {
      submitAction("directions", { status: "opened" });
      window.open(directionsUrl(entity), "_blank", "noopener,noreferrer");
      return;
    }
    if (FORM_ACTIONS.has(standard.primaryAction)) {
      setFormOpen((current) => !current);
      return;
    }
    onContact?.();
  };

  const handleSecondary = (item) => {
    if (item.action === "directions") {
      submitAction("directions", { status: "opened" });
      window.open(directionsUrl(entity), "_blank", "noopener,noreferrer");
      return;
    }
    if (item.action === "save") {
      onSave?.();
      submitAction(saved ? "unsave" : "save", { status: saved ? "removed" : "saved" });
      return;
    }
    if (item.href) {
      submitAction(item.action, { status: "opened" });
      window.open(item.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="dp-map-action-standard" aria-label={`${standard.title} actions`}>
      <div className="dp-map-action-standard__head">
        <div>
          <p className="dp-map-action-standard__eyebrow dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">{standard.eyebrow}</p>
          <h3>{standard.verb} {standard.label}</h3>
          <p>{standard.promise}</p>
        </div>
        <span className="dp-map-action-standard__status">
          {mode === "partner" ? "Partner" : "Resident"}
        </span>
      </div>

      <div className="dp-map-action-standard__meta" aria-label="Action qualities">
        {standard.metrics.map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </div>

      <div className="dp-map-action-standard__primary">
        <button type="button" onClick={handlePrimary} className="dp-map-action-standard__cta" disabled={submitting}>
          <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
          <span>{standard.primaryAction === "rsvp" && rsvped ? "Saved RSVP" : standard.primaryLabel}</span>
        </button>
        <button type="button" onClick={() => handleSecondary({ action: "directions" })} className="dp-map-action-standard__route" aria-label="Get directions">
          <MapPin className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="dp-map-action-standard__secondary">
        {standard.secondaryActions.map((item) => (
          <button key={item.id} type="button" onClick={() => handleSecondary(item)}>
            {item.action === "save" ? <Heart className="h-3.5 w-3.5" aria-hidden="true" /> : <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{item.action === "save" && saved ? "Saved" : item.label}</span>
          </button>
        ))}
      </div>

      {formOpen && (
        <form
          className="dp-map-action-standard__form"
          onSubmit={(event) => {
            event.preventDefault();
            submitAction(standard.primaryAction);
          }}
        >
          <label>
            <span>Date</span>
            <input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} />
          </label>
          <label>
            <span>Time</span>
            <input type="time" value={form.time} onChange={(event) => updateForm("time", event.target.value)} />
          </label>
          <label>
            <span>Party</span>
            <select value={form.partySize} onChange={(event) => updateForm("partySize", event.target.value)}>
              {["1", "2", "3", "4", "5", "6", "7+"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Name</span>
            <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Name" />
          </label>
          <label className="dp-map-action-standard__wide">
            <span>Contact</span>
            <input value={form.contact} onChange={(event) => updateForm("contact", event.target.value)} placeholder="Email or phone" />
          </label>
          <label className="dp-map-action-standard__wide">
            <span>Note</span>
            <textarea value={form.note} onChange={(event) => updateForm("note", event.target.value)} placeholder="Any timing, access, or request details" />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? <Clock className="h-4 w-4" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
            <span>{submitting ? "Saving" : "Send request"}</span>
          </button>
        </form>
      )}

      <div className="dp-map-action-standard__steps" aria-label="Action path">
        {standard.steps.map((step, index) => (
          <span key={step}>
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {index + 1}. {step}
          </span>
        ))}
      </div>

      {result && <p className="dp-map-action-standard__result">{result}</p>}
    </section>
  );
}
