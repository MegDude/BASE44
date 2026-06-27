import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import {
  formatCurrency,
  getPlansForPartnerType,
  getPriceText,
  PRICING_MODULES,
} from "@/config/pricingRegistry";

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

const CAMPAIGN_INTERESTS = [
  "Offers and perks",
  "Events",
  "Featured placement",
  "District or portfolio campaign",
  "Not sure yet",
];

const REPORTING_NEEDS = [
  "Standard reporting",
  "Campaign performance",
  "Portfolio reporting",
  "Exports and integrations",
  "Custom reporting",
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

function startPartnerSignIn(navigate, signInPartner, email) {
  signInPartner({
    email,
    organization_name: "Downtown Perks Partner",
    contact_name: email || "Partner",
    partner_type: "partner",
  });
  navigate("/partner-workspace/overview");
}

function toPricingPartnerType(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("property")) return "Property";
  if (normalized.includes("hotel")) return "Hotel";
  if (normalized.includes("brand")) return "Brand";
  if (normalized.includes("civic")) return "Civic";
  if (normalized.includes("real")) return "Real Estate";
  if (normalized.includes("resident")) return "Resident";
  return "Venue";
}

export default function PartnerAccess({ mode = "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const navigate = useNavigate();
  const location = useLocation();
  const { signInPartner } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get("type")
    || searchParams.get("partnerTypeSlug")
    || searchParams.get("partnerType")?.toLowerCase()
    || "venue";
  const initialPlan = searchParams.get("plan") || searchParams.get("sku") || "";
  const initialModules = (searchParams.get("modules") || "").split(",").map((item) => item.trim()).filter(Boolean);
  const initialCampaignInterest = searchParams.get("campaignInterest") || CAMPAIGN_INTERESTS[0];
  const initialReportingNeeds = searchParams.get("reportingNeeds") || REPORTING_NEEDS[0];
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    phone: "",
    partner_type: PARTNER_TYPES.some((type) => type.value === initialType) ? initialType : "venue",
    timeline: "Still planning",
    website: "",
    bio: "",
  });
  const [selectedModuleIds, setSelectedModuleIds] = useState(initialModules);
  const pricingPartnerType = toPricingPartnerType(form.partner_type);
  const availablePlans = useMemo(() => getPlansForPartnerType(pricingPartnerType), [pricingPartnerType]);
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const selectedPlan = availablePlans.find((plan) => plan.id === selectedPlanId) || availablePlans[0] || null;
  const selectedModules = PRICING_MODULES.filter((module) => selectedModuleIds.includes(module.id));
  const annualAddOnTotal = selectedModules.filter((module) => module.billing === "Annual add-on").reduce((sum, module) => sum + module.price, 0);
  const oneTimeTotal = selectedModules.filter((module) => module.billing === "One-time module").reduce((sum, module) => sum + module.price, 0);
  const annualEstimate = selectedPlan?.annualPrice == null ? null : selectedPlan.annualPrice + annualAddOnTotal;
  const firstYearEstimate = selectedPlan?.annualPrice == null ? null : selectedPlan.annualPrice + annualAddOnTotal + oneTimeTotal;
  const [campaignInterest, setCampaignInterest] = useState(initialCampaignInterest);
  const [reportingNeeds, setReportingNeeds] = useState(initialReportingNeeds);
  const [signInEmail, setSignInEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [submissionState, setSubmissionState] = useState("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleModule(moduleId) {
    setSelectedModuleIds((current) => (
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    ));
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
      selected_plan: selectedPlan?.id || "",
      selected_plan_label: selectedPlan?.label || "",
      selected_modules: selectedModuleIds,
      campaign_interest: campaignInterest,
      reporting_needs: reportingNeeds,
      recurring_annual_total: annualEstimate,
      first_year_estimate: firstYearEstimate,
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
          planInterest: selectedPlan?.label || "Partner workspace registration",
          selectedPlan: selectedPlan?.label || "Partner workspace registration",
          addOns: selectedModules.map((module) => module.label).join(", "),
          campaignInterest,
          reportingNeeds,
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
      signInPartner(profile);
      setSaved(true);
      setSubmissionState("success");
      setSubmissionMessage("Registration saved. Opening your workspace now.");
      window.setTimeout(() => navigate("/partner-workspace/overview"), 850);
    } catch (error) {
      savePartnerProfile(profile);
      signInPartner(profile);
      setSaved(true);
      setSubmissionState("error");
      setSubmissionMessage("Your details are saved locally. Opening your workspace now.");
      window.setTimeout(() => navigate("/partner-workspace/overview"), 850);
    }
  }

  function handleSignIn(event) {
    event.preventDefault();
    startPartnerSignIn(navigate, signInPartner, signInEmail);
  }

  return (
    <main className="dp-partner-page dp-partner-access-page min-h-screen bg-white px-5 pb-14 pt-28 text-[#0B1F33]">
      <div className="dp-partner-access-shell mx-auto max-w-5xl">
        <div className="dp-partner-access-nav mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/partners")}
            className="dp-partner-back-button inline-flex items-center justify-center text-[#0B1F33]/68 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A]"
            aria-label="Back to partners"
            title="Back to partners"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <section className="dp-partner-access-grid grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="dp-partner-access-copy">
            <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">
              Partner access
            </p>
            <h1 className="dp-partner-access-title mt-4 max-w-xl font-heading text-4xl font-medium leading-[0.98] tracking-normal text-[#0B1F33] md:text-5xl">
              {isSignUp ? "Create your partner workspace." : "Open your partner workspace."}
            </h1>
            <p className="dp-partner-access-lede mt-5 max-w-lg text-[15px] leading-7 text-[#0B1F33]/66">
              {isSignUp
                ? "Add the basics once, then continue into the workspace to finish your profile, map placement, campaigns, and billing."
                : "Sign in to manage your profile, map details, campaigns, reports, team access, and billing."}
            </p>

            <div className="dp-partner-access-list mt-8 grid gap-3 text-[13px] leading-6 text-[#0B1F33]/68">
              {(isSignUp ? [
                "Choose the plan and add-ons that match your launch.",
                "Share the partner details your workspace needs.",
                "Continue into setup without re-entering the same information.",
              ] : [
                "Update partner details and map placement.",
                "Manage campaigns, offers, and events.",
                "Review reports, team access, and billing.",
              ]).map((item) => (
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

                <section className="dp-partner-access-setup dp-partner-access-setup-editor" aria-label="Selected setup">
                  <div className="dp-partner-access-setup-head">
                    <p className="dp-partner-access-setup-label">Setup</p>
                    <strong>{firstYearEstimate == null ? "Custom review" : `${formatCurrency(firstYearEstimate)} first year`}</strong>
                  </div>
                  <div className="dp-partner-access-setup-fields">
                    <label>
                      <span>Subscription plan</span>
                      <select
                        className="dp-partner-access-control"
                        value={selectedPlan?.id || ""}
                        onChange={(event) => setSelectedPlanId(event.target.value)}
                      >
                        {availablePlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.label} - {getPriceText(plan)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Campaign interest</span>
                      <select
                        className="dp-partner-access-control"
                        value={campaignInterest}
                        onChange={(event) => setCampaignInterest(event.target.value)}
                      >
                        {CAMPAIGN_INTERESTS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Reporting</span>
                      <select
                        className="dp-partner-access-control"
                        value={reportingNeeds}
                        onChange={(event) => setReportingNeeds(event.target.value)}
                      >
                        {REPORTING_NEEDS.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="dp-partner-access-addon-list" aria-label="Available add-ons">
                    {PRICING_MODULES.filter((module) => module.id !== "residentJoinBuildingNotMember").slice(0, 10).map((module) => (
                      <button
                        key={module.id}
                        type="button"
                        data-active={selectedModuleIds.includes(module.id)}
                        onClick={() => toggleModule(module.id)}
                      >
                        <span>{module.label}</span>
                        <small>{getPriceText(module)}</small>
                      </button>
                    ))}
                  </div>
                  <dl>
                    <div>
                      <dt>Annual estimate</dt>
                      <dd>{annualEstimate == null ? "Custom" : `${formatCurrency(annualEstimate)}/year`}</dd>
                    </div>
                    <div>
                      <dt>One-time add-ons</dt>
                      <dd>{formatCurrency(oneTimeTotal)}</dd>
                    </div>
                  </dl>
                </section>

                <PartnerAccessField label="Organization name" value={form.organization_name} onChange={(value) => updateField("organization_name", value)} required />
                <PartnerAccessField label="Contact name" value={form.contact_name} onChange={(value) => updateField("contact_name", value)} />
                <PartnerAccessField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
                <PartnerAccessField label="Phone" type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} />

                <div>
                  <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">Partner type</label>
                  <select
                    value={form.partner_type}
                    onChange={(event) => updateField("partner_type", event.target.value)}
                    className="dp-partner-access-control w-full rounded-[6px] border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition focus:border-[#C8A96A]/55"
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
              <form className="dp-partner-access-signin" onSubmit={handleSignIn}>
                <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#C8A96A]">Partner account</p>
                <h2 className="dp-partner-access-form-title font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                  Sign in
                </h2>
                <p className="dp-partner-access-panel-copy mt-3 text-[13px] leading-6 text-[#0B1F33]/64">
                  Enter your partner email to continue to your workspace.
                </p>
                <div className="mt-6">
                  <PartnerAccessField
                    label="Partner email"
                    type="email"
                    value={signInEmail}
                    onChange={setSignInEmail}
                    required
                  />
                </div>
                <div className="dp-partner-access-actions mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
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
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatSetupText(value) {
  return String(value || "")
    .replace(/Annual$/, " annual")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
