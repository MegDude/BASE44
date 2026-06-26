import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, LogIn, UserPlus, X } from "lucide-react";

const PARTNER_PROFILE_KEY = "dp_partner_workspace:profile:current";

const PARTNER_TYPES = [
  { value: "venue", label: "Venues" },
  { value: "property", label: "Properties / Buildings" },
  { value: "hotel", label: "Hotels" },
  { value: "brand", label: "Brands" },
  { value: "civic", label: "Civic / Community" },
  { value: "real-estate", label: "Real Estate" },
  { value: "resident", label: "Residents" },
  { value: "custom", label: "Custom" },
];

const TIMELINES = [
  "This month",
  "Next 30 days",
  "Next quarter",
  "Still planning",
];

function getPartnerTypeLabel(value) {
  return PARTNER_TYPES.find((type) => type.value === value)?.label || value;
}

function savePartnerProfile(profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PARTNER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // The workspace still renders even when browser storage is unavailable.
  }
}

function startPartnerSignIn(navigate) {
  if (typeof window === "undefined") return;
  navigate("/partner-workspace/overview");
}

export default function PartnerAccess({ mode = "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    phone: "",
    partner_type: "venue",
    timeline: "Still planning",
    website: "",
    bio: "",
  });
  const [saved, setSaved] = useState(false);
  const [submissionState, setSubmissionState] = useState("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmissionState("submitting");
    setSubmissionMessage("");

    const partnerTypeLabel = getPartnerTypeLabel(form.partner_type);
    const organizationName = form.organization_name || form.contact_name || "Downtown Perks Partner";
    const message = form.bio?.trim()
      || `Partner registration request for ${organizationName}. Website: ${form.website || "Not provided"}.`;

    const profile = {
      organization_name: organizationName,
      full_name: form.contact_name || organizationName,
      contact_name: form.contact_name,
      partner_type: form.partner_type,
      partner_type_label: partnerTypeLabel,
      phone: form.phone,
      timeline: form.timeline,
      website: form.website,
      bio: form.bio,
      signup_email: form.email,
      access_status: "registration_submitted",
      updated_date: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: "Partner account registration",
          entryPath: "partner_access_signup",
          name: form.contact_name || organizationName,
          email: form.email,
          phone: form.phone,
          company: organizationName,
          partnerType: partnerTypeLabel,
          planInterest: "Partner workspace registration",
          selectedPlan: "Partner workspace registration",
          timing: form.timeline,
          message,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Registration could not be sent.");
      }

      savePartnerProfile(profile);
      setSaved(true);
      setSubmissionState("success");
      setSubmissionMessage("Registration sent. We saved your workspace details and will connect the right package next.");
      window.setTimeout(() => navigate("/partner-workspace/overview"), 850);
    } catch (error) {
      savePartnerProfile(profile);
      setSaved(true);
      setSubmissionState("error");
      setSubmissionMessage("We saved your workspace details. You can keep going while we connect the account.");
    }
  }

  return (
    <main className="dp-partner-page dp-partner-access-page min-h-screen bg-white px-5 pb-14 pt-28 text-[#0B1F33]">
      <div className="dp-partner-access-shell mx-auto max-w-5xl">
        <div className="dp-partner-access-nav mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/partners")}
            className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-[#0B1F33]/10 bg-white px-3 text-[12px] font-semibold text-[#0B1F33]/68 transition hover:border-[#C8A96A]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Partners
          </button>
          <button
            type="button"
            onClick={() => navigate("/map?mode=partner&tab=map&filter=All")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#0B1F33]/10 bg-white text-[#0B1F33]/68 transition hover:border-[#C8A96A]/45 hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-label="Close partner access"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <section className="dp-partner-access-grid grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="dp-partner-access-copy">
            <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
              Partner Access
            </p>
            <h1 className="dp-partner-access-title mt-4 max-w-xl font-heading text-4xl font-medium leading-[0.98] tracking-normal text-[#0B1F33] md:text-5xl">
              {isSignUp ? "Create a partner workspace." : "Sign in to your partner workspace."}
            </h1>
            <p className="dp-partner-access-lede mt-5 max-w-lg text-[15px] leading-7 text-[#0B1F33]/66">
              {isSignUp
                ? "Register the organization, location, and launch details we need to connect your partner workspace, package, modules, and reporting."
                : "Open the partner workspace to manage saved work, partner details, campaigns, reports, and access. You can still preview the public workspace before approval."}
            </p>

            <div className="dp-partner-access-list mt-8 grid gap-3 text-[13px] leading-6 text-[#0B1F33]/68">
              {[
                "Workspace: perks, events, profile, and civic intelligence.",
                "Dashboard: activity, trade, civic, and partner reporting.",
                "Campaigns: campaign builder and placement planning.",
                "Map: partner inventory, panels, reports, and opportunities.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dp-partner-access-panel rounded-[10px] border border-[#0B1F33]/[0.08] bg-white/88 p-5 shadow-[0_8px_24px_rgba(11,31,51,.055)]">
            {isSignUp ? (
              <form onSubmit={handleSubmit} className="dp-partner-access-form space-y-4">
                <div className="dp-partner-access-form-head">
                  <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Sign up</p>
                  <h2 className="dp-partner-access-form-title font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                    Register your partner account
                  </h2>
                </div>

                <PartnerAccessField label="Organization name" value={form.organization_name} onChange={(value) => updateField("organization_name", value)} required />
                <PartnerAccessField label="Contact name" value={form.contact_name} onChange={(value) => updateField("contact_name", value)} />
                <PartnerAccessField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
                <PartnerAccessField label="Phone" type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} />

                <div>
                  <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">Partner type</label>
                  <select
                    value={form.partner_type}
                    onChange={(event) => updateField("partner_type", event.target.value)}
                    className="dp-partner-access-control w-full rounded-[6px] border border-[#0B1F33]/10 bg-[#F7F8FB] px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition focus:border-[#C8A96A]/55"
                  >
                    {PARTNER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">Launch timing</label>
                  <select
                    value={form.timeline}
                    onChange={(event) => updateField("timeline", event.target.value)}
                    className="dp-partner-access-control w-full rounded-[6px] border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition focus:border-[#C8A96A]/55"
                  >
                    {TIMELINES.map((timeline) => (
                      <option key={timeline} value={timeline}>{timeline}</option>
                    ))}
                  </select>
                </div>

                <PartnerAccessField label="Website" type="url" value={form.website} onChange={(value) => updateField("website", value)} />

                <div>
                  <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">What should we help you make happen?</label>
                  <textarea
                    rows={4}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    className="dp-partner-access-control w-full resize-none rounded-[6px] border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#C8A96A]/55"
                    placeholder="Tell us the organization, location, package, modules, launch timing, or custom request you want connected to this account."
                  />
                </div>

                {submissionMessage ? (
                  <p
                    className={`text-[12px] leading-5 ${
                      submissionState === "error" ? "text-[#8A4B12]" : "text-[#0B1F33]/68"
                    }`}
                    role="status"
                  >
                    {submissionMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submissionState === "submitting"}
                  className="dp-partner-access-action inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-white px-5 text-[12px] font-bold uppercase tracking-[0.09em] text-[#0B1F33] shadow-[0_10px_24px_rgba(11,31,51,.08)] transition hover:text-[#C8A96A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] disabled:cursor-wait disabled:opacity-70"
                >
                  {saved ? <Check className="h-4 w-4 text-[#C8A96A]" /> : <UserPlus className="h-4 w-4 text-[#C8A96A]" />}
                  {submissionState === "submitting" ? "Sending" : saved ? "Registration sent" : "Register account"}
                </button>
              </form>
            ) : (
              <div className="dp-partner-access-signin">
                <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner account</p>
                <h2 className="dp-partner-access-form-title font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                  Open your partner account
                </h2>
                <p className="dp-partner-access-panel-copy mt-3 text-[13px] leading-6 text-[#0B1F33]/64">
                  Continue into your partner workspace to review saved details, workspace modules, campaigns, reports, and account setup.
                </p>
                <div className="dp-partner-access-actions mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => startPartnerSignIn(navigate)}
                    className="dp-partner-access-action inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-white px-5 text-[12px] font-bold uppercase tracking-[0.09em] text-[#0B1F33] shadow-[0_10px_24px_rgba(11,31,51,.08)] transition hover:text-[#C8A96A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  >
                    <LogIn className="h-4 w-4 text-[#C8A96A]" />
                    Sign in
                  </button>
                  <Link
                    to="/partners/sign-up"
                    className="dp-partner-access-action inline-flex h-10 items-center justify-center gap-2 rounded-[2px] bg-white px-5 text-[12px] font-bold uppercase tracking-[0.09em] text-[#0B1F33] shadow-[0_10px_24px_rgba(11,31,51,.08)] transition hover:text-[#C8A96A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
                  >
                    Register account
                    <ArrowRight className="h-4 w-4 text-[#C8A96A]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function PartnerAccessField({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="dp-partner-access-control w-full rounded-[6px] border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#C8A96A]/55"
      />
    </div>
  );
}
