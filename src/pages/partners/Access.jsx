import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { demoOrganizations } from "@/config/workspaceArchitecture";
import { isSuperAdminSession } from "@/lib/auth/session";
import { DEFAULT_PARTNER_RETURN_PATH, getSafeReturnPath } from "@/lib/authReturnPath";
import {
  canUseProductionAccountAccess,
  ACTION_ACCEPTED_MESSAGE,
  PRODUCTION_ACCOUNT_ACCESS_MESSAGE,
} from "@/lib/productionGuards";
import {
  formatCurrency,
  getPlansForPartnerType,
  PRICING_MODULES,
} from "@/config/pricingRegistry";

const PARTNER_PROFILE_KEY = "dp_partner_workspace:profile:current";
const ADMIN_WORKSPACE_CONTEXT_KEY = "dp_partner_workspace:admin_context";

const PARTNER_TYPES = [
  {
    value: "property",
    label: "Properties",
    section: "Residential",
    summary: "Apartment communities, condominiums, HOAs, and property teams.",
  },
  {
    value: "hotel",
    label: "Hotels",
    section: "Hospitality",
    summary: "Help guests find restaurants, events, and local favorites.",
  },
  {
    value: "venue",
    label: "Venues",
    section: "Local Places",
    summary: "Restaurants, bars, cafes, fitness, wellness, retail, and experiences.",
  },
  {
    value: "brand",
    label: "Brands",
    section: "Campaigns",
    summary: "Run local campaigns and understand what people do next.",
  },
  {
    value: "civic",
    label: "Civic",
    section: "Community",
    summary: "Civic groups, districts, chambers, public spaces, and community programs.",
  },
  {
    value: "real-estate",
    label: "Real Estate",
    section: "Listings",
    summary: "Show buyers and renters what makes the neighborhood valuable.",
  },
  {
    value: "resident",
    label: "Residents",
    section: "Access",
    summary: "Perks Card access, saved places, local offers, and downtown recommendations.",
  },
  {
    value: "custom",
    label: "Custom",
    section: "Other",
    summary: "A different partnership model, portfolio, or launch path.",
  },
];

const SIGN_IN_ACCESS_TYPES = PARTNER_TYPES.filter((type) => type.value !== "resident");

const ACCESS_ROUTE_BY_TYPE = {
  resident: "/map?mode=resident&tab=map&filter=All",
};

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

function getAccessTypeLabel(value) {
  return SIGN_IN_ACCESS_TYPES.find((type) => type.value === value)?.label || getPartnerTypeLabel(value);
}

function normalizePartnerType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (["property", "properties", "building", "buildings", "residential"].includes(normalized)) return "property";
  if (["hotel", "hotels", "hospitality"].includes(normalized)) return "hotel";
  if (["venue", "venues", "restaurant", "restaurants", "business", "businesses"].includes(normalized)) return "venue";
  if (["brand", "brands", "sponsor", "sponsors"].includes(normalized)) return "brand";
  if (["civic", "community", "district"].includes(normalized)) return "civic";
  if (["realestate", "real-estate", "real estate", "listing", "listings", "agent", "broker"].includes(normalized)) return "real-estate";
  if (["resident", "residents", "member", "members", "user", "users"].includes(normalized)) return "resident";
  if (normalized === "custom") return "custom";
  return "";
}

function getAccessRouteForType(value) {
  return ACCESS_ROUTE_BY_TYPE[normalizePartnerType(value)] || "/partner-workspace/overview";
}

function getAccessRoleForType(value) {
  return normalizePartnerType(value) === "resident" ? "resident" : "partner";
}

function savePartnerProfile(profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PARTNER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // The workspace still renders even when browser storage is unavailable.
  }
}

function getAuthFailureMessage(code) {
  const value = String(code || "").trim();
  if (!value) return "";
  if (value === "callback_failed") return "The secure sign-in link could not be completed. Request a new link and try again.";
  if (value === "partner_access_required") return "This account does not have partner access. Request access from your organization owner.";
  if (/expired|otp_expired/i.test(value)) return "That secure sign-in link has expired. Request a new link and try again.";
  return value.replace(/_/g, " ");
}

async function startPartnerSignIn(navigate, signInPartner, { email, password, accountType, returnTo = DEFAULT_PARTNER_RETURN_PATH } = {}) {
  if (!canUseProductionAccountAccess()) return null;
  const partnerType = normalizePartnerType(accountType) || "property";
  const accessLabel = getAccessTypeLabel(partnerType) || "Downtown Perks";
  const destination = returnTo;
  const redirectPath = `/auth/callback?audience=partner&returnTo=${encodeURIComponent(destination)}`;
  const session = await signInPartner({
    email,
    password,
    organization_name: `${accessLabel} Access`,
    contact_name: email || accessLabel,
    partner_type: partnerType,
    partner_type_label: accessLabel,
    role: getAccessRoleForType(partnerType),
    redirectPath,
  });
  if (session?.type === "authenticated") {
    const role = String(session.user?.role || "").toLowerCase();
    navigate(["platform_admin", "super_admin"].includes(role) ? "/admin-studio/command-center" : destination);
  }
  return session;
}

function toPricingPartnerType(value) {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "";
  if (normalized.includes("property")) return "Property";
  if (normalized.includes("hotel")) return "Hotel";
  if (normalized.includes("brand")) return "Brand";
  if (normalized.includes("civic")) return "Civic";
  if (normalized.includes("real")) return "Real Estate";
  if (normalized.includes("resident")) return "Resident";
  return "";
}

const accessActionClass =
  "dp-partner-access-action inline-flex min-h-11 items-center justify-start gap-2 border-0 bg-transparent px-0 py-2 text-[13px] font-semibold normal-case tracking-normal text-[#0B1F33] shadow-none transition hover:text-[#B8963E] focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:text-[#0B1F33]/40";

export default function PartnerAccess({ mode = "sign-in" }) {
  const isSignUp = mode === "sign-up";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, signInPartner } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const requestedReturnTo = getSafeReturnPath(location.search, DEFAULT_PARTNER_RETURN_PATH);
  const callbackError = searchParams.get("error") || "";
  const initialType = normalizePartnerType(
    searchParams.get("type")
      || searchParams.get("partnerTypeSlug")
      || searchParams.get("partnerType"),
  );
  const initialPlan = searchParams.get("plan") || searchParams.get("sku") || "";
  const initialModules = (searchParams.get("modules") || "").split(",").map((item) => item.trim()).filter(Boolean);
  const initialCampaignInterest = searchParams.get("campaignInterest") || CAMPAIGN_INTERESTS[0];
  const initialReportingNeeds = searchParams.get("reportingNeeds") || REPORTING_NEEDS[0];
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    email: "",
    phone: "",
    partner_type: initialType,
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
  const oneTimeTotal = selectedModules.filter((module) => module.billing === "One-time service").reduce((sum, module) => sum + module.price, 0);
  const annualEstimate = selectedPlan?.annualPrice == null ? null : selectedPlan.annualPrice + annualAddOnTotal;
  const firstYearEstimate = selectedPlan?.annualPrice == null ? null : selectedPlan.annualPrice + annualAddOnTotal + oneTimeTotal;
  const [campaignInterest, setCampaignInterest] = useState(initialCampaignInterest);
  const [reportingNeeds, setReportingNeeds] = useState(initialReportingNeeds);
  const [saved, setSaved] = useState(false);
  const [submissionState, setSubmissionState] = useState(callbackError ? "error" : "idle");
  const [submissionMessage, setSubmissionMessage] = useState(getAuthFailureMessage(callbackError));
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInType, setSignInType] = useState(
    SIGN_IN_ACCESS_TYPES.some((type) => type.value === initialType) ? initialType : "property",
  );
  const selectedSignInType = SIGN_IN_ACCESS_TYPES.find((type) => type.value === signInType) || SIGN_IN_ACCESS_TYPES[0];
  const hasPartnerType = Boolean(form.partner_type);
  const accountAccessEnabled = canUseProductionAccountAccess();
  const isSuperAdmin = Boolean(isAuthenticated && isSuperAdminSession({
    email: user?.email,
    role: user?.role,
  }));

  useEffect(() => {
    if (!hasPartnerType) {
      setSelectedPlanId("");
      return;
    }
    if (selectedPlanId && availablePlans.some((plan) => plan.id === selectedPlanId)) return;
    setSelectedPlanId(availablePlans[0]?.id || "");
  }, [availablePlans, hasPartnerType, selectedPlanId]);

  useEffect(() => {
    if (isSignUp || !isAuthenticated || isSuperAdmin) return;
    const accountType = user?.partner_type || user?.role || "property";
    navigate(getAccessRouteForType(accountType), { replace: true });
  }, [isAuthenticated, isSignUp, isSuperAdmin, navigate, user]);

  function openAdminWorkspace(organization) {
    if (!isSuperAdmin || !organization) return;
    const adminContext = {
      organizationId: organization.id,
      organizationName: organization.name,
      organizationType: organization.type,
      plan: organization.plan,
      status: organization.status,
      role: "super_admin",
      adminEmail: user?.email || "",
      accessMode: "admin_workspace_switch",
      selectedAt: new Date().toISOString(),
    };
    savePartnerProfile({
      ...adminContext,
      organization_id: organization.id,
      organization_name: organization.name,
      partner_name: organization.name,
      partner_type: organization.type,
      full_name: user?.full_name || "Meg Dude",
      email: user?.email || "",
    });
    try {
      window.localStorage.setItem(ADMIN_WORKSPACE_CONTEXT_KEY, JSON.stringify(adminContext));
    } catch {
      // The organization query parameter still opens the selected workspace.
    }
    navigate(`/partner-workspace/overview?organizationId=${encodeURIComponent(organization.id)}&admin=1`);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectPartnerType(value) {
    updateField("partner_type", value);
    setSubmissionMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmissionState("submitting");
    setSubmissionMessage("");

    if (!form.partner_type) {
      setSubmissionState("idle");
      setSubmissionMessage("Choose a partner type before registering the account.");
      return;
    }

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
          planInterest: selectedPlan?.label || "Partner account registration",
          selectedPlan: selectedPlan?.label || "Partner account registration",
          selectedAddOns: selectedModules.map((module) => module.label).join(", "),
          estimatedTotal: firstYearEstimate == null ? "Custom" : firstYearEstimate,
          recurringAnnualTotal: annualEstimate == null ? "Custom" : annualEstimate,
          firstYearEstimate: firstYearEstimate == null ? "Custom" : firstYearEstimate,
          campaignInterest,
          reportingNeeds,
          timing: form.timeline,
          website: form.website,
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
      if (accountAccessEnabled) {
        const session = await signInPartner(profile);
        if (session?.type === "partner") {
          setSubmissionMessage("Registration submitted. Opening your workspace.");
          window.setTimeout(() => navigate("/partner-workspace/overview"), 850);
        } else if (session?.type === "supabase_otp") {
          setSubmissionMessage(session.message);
        } else {
          setSubmissionMessage(session?.message || PRODUCTION_ACCOUNT_ACCESS_MESSAGE);
        }
      } else {
        setSubmissionMessage(`${ACTION_ACCEPTED_MESSAGE} ${PRODUCTION_ACCOUNT_ACCESS_MESSAGE}`);
      }
    } catch (error) {
      savePartnerProfile(profile);
      setSaved(true);
      setSubmissionState("error");
      if (accountAccessEnabled) {
        const session = await signInPartner(profile);
        if (session?.type === "partner") {
          setSubmissionMessage(`${ACTION_ACCEPTED_MESSAGE} Opening your workspace.`);
          window.setTimeout(() => navigate("/partner-workspace/overview"), 850);
        } else if (session?.type === "supabase_otp") {
          setSubmissionMessage(`${ACTION_ACCEPTED_MESSAGE} ${session.message}`);
        } else {
          setSubmissionMessage(`${ACTION_ACCEPTED_MESSAGE} ${session?.message || PRODUCTION_ACCOUNT_ACCESS_MESSAGE}`);
        }
      } else {
        setSubmissionMessage(`${ACTION_ACCEPTED_MESSAGE} ${PRODUCTION_ACCOUNT_ACCESS_MESSAGE}`);
      }
    }
  }

  async function handleSignIn() {
    if (!accountAccessEnabled) {
      setSubmissionState("error");
      setSubmissionMessage(PRODUCTION_ACCOUNT_ACCESS_MESSAGE);
      return;
    }
  if ((!signInEmail && !user?.email) || !signInPassword) {
    setSubmissionState("error");
    setSubmissionMessage("Enter your workspace email and password.");
      return;
    }
    setSubmissionState("submitting");
    setSubmissionMessage("");
    const session = await startPartnerSignIn(navigate, signInPartner, {
    email: signInEmail || user?.email || "",
    password: signInPassword,
    accountType: signInType,
      returnTo: requestedReturnTo,
    });
  if (session?.type === "authenticated") return;
  setSubmissionState("error");
  setSubmissionMessage(session?.message || "We could not sign you in with those credentials.");
  }

  return (
    <main className="dp-partner-page dp-partner-access-page min-h-screen bg-white px-5 pb-14 pt-28 text-[#0B1F33]">
      <div className="dp-partner-access-shell mx-auto max-w-5xl">
        <div className="dp-partner-access-nav mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/partners")}
            className="dp-partner-back-button inline-flex items-center justify-center text-[#0B1F33]/68 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
            aria-label="Back to partners"
            title="Back to partners"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <section className="dp-partner-access-grid grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="dp-partner-access-copy">
            <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">
              {isSignUp ? "Partner access" : "Downtown Perks access"}
            </p>
            <h1 className="dp-partner-access-title mt-4 max-w-xl font-heading font-medium text-[#0B1F33]">
              {isSignUp ? "Set up your partner account." : "Sign in to Downtown Perks."}
            </h1>
            <p className="dp-partner-access-lede mt-5 max-w-lg text-[15px] leading-7 text-[#0B1F33]/66">
              {isSignUp
                ? "Your plan travels with you from pricing. Add the details needed to open the right account."
                : accountAccessEnabled
                  ? "Use the email attached to your partner, portfolio, or platform administrator account."
                  : PRODUCTION_ACCOUNT_ACCESS_MESSAGE}
            </p>

            <div className="dp-partner-access-list mt-8 grid gap-3 text-[13px] leading-6 text-[#0B1F33]/68">
              {(isSignUp ? [
                "Review the plan, then add your organization and contact details.",
                "Optional support can be added later.",
              ] : [
                "Choose the partner account type, then use its account email.",
                "A secure link returns you to the right workspace.",
                "Resident access uses the resident sign-in page.",
              ]).map((item) => (
                <div key={item} className="flex gap-3">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[#BFA46A]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dp-partner-access-panel border border-[#0B1F33]/[0.08] bg-white/88 p-5">
            {isSignUp ? (
              <form onSubmit={handleSubmit} className="dp-partner-access-form space-y-4">
                <div className="dp-partner-access-form-head">
                  <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">Sign up</p>
                  <h2 className="dp-partner-access-form-title font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                    Confirm your partner setup
                  </h2>
                </div>

                <section className="dp-partner-access-setup dp-partner-access-setup-editor" aria-label="Selected plan">
                  <div className="dp-partner-access-setup-head">
                    <p className="dp-partner-access-setup-label">Your selection</p>
                    <strong>{!hasPartnerType ? "Choose a plan" : firstYearEstimate == null ? "Custom setup" : `${formatCurrency(firstYearEstimate)} first year`}</strong>
                  </div>
                  <div className="dp-partner-access-setup-fields">
                    <label>
                      <span>Partner type</span>
                      <select
                        className="dp-partner-access-control"
                        value={form.partner_type}
                        onChange={(event) => selectPartnerType(event.target.value)}
                      >
                        <option value="">Choose partner type</option>
                        {PARTNER_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="dp-partner-access-plan-summary"><strong>{selectedPlan?.label || "Choose a plan"}</strong>{selectedModules.length ? ` · ${selectedModules.length} optional service${selectedModules.length === 1 ? "" : "s"}` : ""}</p>
                  <Link className="dp-partner-access-edit-plan" to="/pricing">Change plan or add optional support</Link>
                  <dl>
                    <div>
                      <dt>Annual estimate</dt>
                      <dd>{annualEstimate == null ? "Custom" : `${formatCurrency(annualEstimate)}/year`}</dd>
                    </div>
                    {oneTimeTotal ? <div><dt>One-time support</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div> : null}
                  </dl>
                </section>

                <PartnerAccessField label="Organization name" value={form.organization_name} onChange={(value) => updateField("organization_name", value)} required />
                <PartnerAccessField label="Contact name" value={form.contact_name} onChange={(value) => updateField("contact_name", value)} />
                <PartnerAccessField label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} required />
                <PartnerAccessField label="Phone" type="tel" value={form.phone} onChange={(value) => updateField("phone", value)} />

                <div>
                  <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">Launch timing</label>
                  <select
                    value={form.timeline}
                    onChange={(event) => updateField("timeline", event.target.value)}
                    className="dp-partner-access-control w-full border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition focus:border-[#BFA46A]/55"
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
                    className="dp-partner-access-control w-full resize-none border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#BFA46A]/55"
                    placeholder="Tell us the organization, location, plan, add-ons, launch timing, or custom request you want connected to this account."
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
                  className={`${accessActionClass} dp-acquisition-primary`}
                >
                  {saved ? <Check className="h-4 w-4 text-[#BFA46A]" /> : <UserPlus className="h-4 w-4 text-[#BFA46A]" />}
                  {submissionState === "submitting" ? "Sending" : saved ? "Registration sent" : "Submit setup request"}
                </button>
              </form>
            ) : (
              <div className="dp-partner-access-signin">
                <p className="dp-partner-access-eyebrow text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BFA46A]">Account access</p>
                <h2 className="dp-partner-access-form-title font-body mt-1 text-[18px] font-semibold leading-snug tracking-normal text-[#0B1F33]">
                  Choose your access path
                </h2>
                <p className="dp-partner-access-panel-copy mt-3 text-[13px] leading-6 text-[#0B1F33]/64">
                  Choose the partner account type first. The secure link returns you to the right workspace.
                </p>
                <section className="dp-partner-type-section dp-partner-signin-type-section mt-5" aria-labelledby="signin-type-heading">
                  <div className="dp-partner-type-section-head">
                    <p className="dp-partner-access-label">Access type</p>
                    <h3 id="signin-type-heading">Who is signing in?</h3>
                  </div>
                  <div className="dp-partner-type-grid dp-partner-signin-type-grid" role="radiogroup" aria-label="Account access type">
                    {SIGN_IN_ACCESS_TYPES.map((type) => {
                      const isActive = signInType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          data-active={isActive}
                          onClick={() => {
                            setSignInType(type.value);
                            setSubmissionMessage("");
                          }}
                          className="dp-partner-access-type-row"
                        >
                          <span>{type.section}</span>
                          <strong>{type.label}</strong>
                          <small>{type.summary}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>
  <PartnerAccessField
  label={`${selectedSignInType?.label || "Account"} email`}
  type="email"
  placeholder="name@organization.com"
  value={signInEmail}
  onChange={setSignInEmail}
  required={accountAccessEnabled}
  />
  <PartnerAccessField
  label="Password"
  type="password"
  placeholder="Enter your workspace password"
  value={signInPassword}
  onChange={setSignInPassword}
  required={accountAccessEnabled}
  />
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
                <div className="dp-partner-access-actions mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={!accountAccessEnabled || submissionState === "submitting"}
                    className={`${accessActionClass} dp-acquisition-primary`}
                  >
                    <LogIn className="h-4 w-4 text-[#BFA46A]" />
                    {submissionState === "submitting" ? "Signing in" : accountAccessEnabled ? "Sign in to workspace" : "Sign-in unavailable"}
                  </button>
                  <Link
                    to="/partners/sign-up"
                    className={`${accessActionClass} dp-acquisition-secondary`}
                  >
                    Submit setup request
                    <ArrowRight className="h-4 w-4 text-[#BFA46A]" />
                  </Link>
                  <Link
                    to="/partners/apply?intent=request-access"
                    className={`${accessActionClass} dp-acquisition-secondary`}
                  >
                    Request team access
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

function AdminWorkspaceChooser({ user, onOpenWorkspace }) {
  const [search, setSearch] = useState("");
  const filteredOrganizations = demoOrganizations.filter((organization) => (
    organization.name.toLowerCase().includes(search.trim().toLowerCase())
  ));

  return (
    <section className="dp-admin-workspace-access" aria-labelledby="admin-workspace-access-title">
      <p className="dp-partner-access-eyebrow">Administrator access</p>
      <h2 id="admin-workspace-access-title">Choose a workspace.</h2>
      <p>
        Signed in as {user?.full_name || "Meg Dude"}{user?.email ? ` · ${user.email}` : ""}. Each selection is stored as an admin workspace context before opening.
      </p>
      <label className="dp-admin-workspace-search">
        <span>Find organization</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workspaces"
          autoComplete="off"
        />
      </label>
      <div className="dp-admin-workspace-list" role="list" aria-label="Available organizations">
        {filteredOrganizations.map((organization) => (
          <button
            key={organization.id}
            type="button"
            role="listitem"
            onClick={() => onOpenWorkspace(organization)}
          >
            <span>
              <strong>{organization.name}</strong>
              <small>{formatSetupText(organization.type)} · {formatSetupText(organization.status)}</small>
            </span>
            <span>
              <small>{formatSetupText(organization.plan)} plan</small>
              <ArrowRight aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
      {!filteredOrganizations.length ? (
        <p className="dp-admin-workspace-empty">No workspace matches that search.</p>
      ) : null}
      <div className="dp-admin-workspace-actions">
        <Link to="/admin-studio/command-center">Open admin studio</Link>
        <Link to="/partners">Return to partners</Link>
      </div>
    </section>
  );
}

function formatSetupText(value) {
  return String(value || "")
    .replace(/Annual$/, " annual")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function PartnerAccessField({ label, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div>
      <label className="dp-partner-access-label mb-1.5 block text-[11px] font-medium uppercase tracking-[0.1em] text-[#0B1F33]/55">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="dp-partner-access-control w-full border border-[#0B1F33]/10 bg-white px-4 py-2.5 text-[13px] text-[#0B1F33] outline-none transition placeholder:text-[#0B1F33]/35 focus:border-[#BFA46A]/55"
      />
    </div>
  );
}
