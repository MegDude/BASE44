import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  Hotel,
  Landmark,
  MapPin,
  Receipt,
  Sparkles,
  Store,
} from "lucide-react";
import { ANNUAL_PLANS, PRICING_MODULES, formatCurrency } from "@/config/pricingRegistry";
import { resolveCheckoutTarget } from "@/config/checkoutLinks";

const PARTNER_SETUP_KEY = "dp_partner_lifecycle_setup";

const partnerTypes = [
  { id: "property", label: "Property", icon: Building2, template: "Resident amenity workspace", plan: "Property Starter" },
  { id: "hotel", label: "Hotel", icon: Hotel, template: "Guest experience workspace", plan: "Hotel Starter" },
  { id: "venue", label: "Venue", icon: Store, template: "Local discovery workspace", plan: "Venue Basic" },
  { id: "restaurant", label: "Restaurant", icon: Store, template: "Dining and offer workspace", plan: "Venue Basic" },
  { id: "retail", label: "Retail", icon: Store, template: "Shopping and campaign workspace", plan: "Venue Growth" },
  { id: "brand", label: "Brand", icon: Sparkles, template: "Campaign workspace", plan: "Brand Starter" },
  { id: "civic", label: "Civic", icon: Landmark, template: "District and program workspace", plan: "Civic Community" },
  { id: "real-estate", label: "Real Estate", icon: MapPin, template: "Listing intelligence workspace", plan: "Real Estate Starter" },
];

const setupModules = [
  "Live Map",
  "Campaigns",
  "Reporting",
  "Offers",
  "Events",
  "Team",
  "Billing",
  "QR Experiences",
  "Connections",
  "Map Assistant",
];

const provisioningSteps = [
  "Organization",
  "Workspace",
  "Owner access",
  "Team access",
  "Public profile",
  "Activity view",
  "Reports",
  "Campaign tools",
  "Offers",
  "Events",
  "Map presence",
  "QR materials",
  "Billing",
  "Membership",
  "Map assistant",
];

function getStoredSetup() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PARTNER_SETUP_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalizePartnerType(value) {
  const raw = String(value || "").trim().toLowerCase();
  return partnerTypes.find((type) => type.id === raw || type.label.toLowerCase() === raw || type.label.toLowerCase().replace(/\s+/g, "-") === raw);
}

function hydrateSetupFromParams(search) {
  const params = new URLSearchParams(search);
  const selectedType = normalizePartnerType(params.get("partnerType") || params.get("partnerLabel"));
  const planId = params.get("plan") || params.get("sku");
  const selectedPlan = ANNUAL_PLANS.find((plan) => plan.id === planId);
  const moduleIds = (params.get("modules") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const selectedModules = PRICING_MODULES.filter((module) => moduleIds.includes(module.id));
  const checkoutKey = selectedPlan?.checkoutKey || params.get("checkoutKey");
  const checkoutTarget = checkoutKey && checkoutKey !== "custom" ? resolveCheckoutTarget(checkoutKey) : null;

  return {
    ...(selectedType
      ? {
          organizationType: selectedType.id,
          partnerType: selectedType.label,
          workspaceTemplate: selectedType.template,
          plan: selectedPlan?.label || selectedType.plan,
        }
      : {}),
    ...(selectedPlan
      ? {
          plan: selectedPlan.label,
          sku: selectedPlan.id,
          checkoutKey: selectedPlan.checkoutKey,
          annualTotal: selectedPlan.annualPrice == null ? "custom" : selectedPlan.annualPrice,
        }
      : {}),
    ...(moduleIds.length
      ? {
          modules: moduleIds,
          moduleLabels: selectedModules.map((module) => module.label),
        }
      : {}),
    ...(params.has("annualTotal") ? { annualTotal: params.get("annualTotal") } : {}),
    ...(params.has("oneTimeTotal") ? { oneTimeTotal: params.get("oneTimeTotal") } : {}),
    ...(params.has("annualAddOnTotal") ? { annualAddOnTotal: params.get("annualAddOnTotal") } : {}),
    ...(params.has("locationCount") ? { locationCount: params.get("locationCount") } : {}),
    ...(params.has("campaignInterest") ? { campaignInterest: params.get("campaignInterest") } : {}),
    ...(params.has("reportingNeeds") ? { reportingNeeds: params.get("reportingNeeds") } : {}),
    ...(checkoutTarget ? { checkoutTarget } : {}),
    source: params.get("intent") === "partner-registration" ? "marketing_pricing" : undefined,
  };
}

function saveSetup(nextSetup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARTNER_SETUP_KEY, JSON.stringify(nextSetup));
}

function trackLifecycleEvent(eventName, payload = {}) {
  if (typeof window === "undefined") return;
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    source: "partner_lifecycle",
    ...payload,
  };
  window.dispatchEvent(new CustomEvent("dp:analytics", { detail: event }));
  window.dataLayer?.push(event);
}

function getStage(pathname) {
  if (pathname.includes("/start")) return "start";
  if (pathname.includes("/register")) return "register";
  if (pathname.includes("/checkout")) return "checkout";
  if (pathname.includes("/provision")) return "provision";
  return "start";
}

function LifecycleShell({ stage, children }) {
  const steps = [
    ["Partner type", "/partners/start"],
    ["Registration", "/partners/register"],
    ["Pricing", "/partners/pricing"],
    ["Checkout", "/partners/checkout"],
    ["Workspace", "/partners/provision"],
  ];
  const activeIndex = stage === "start" ? 0 : stage === "register" ? 1 : stage === "checkout" ? 3 : stage === "provision" ? 4 : 2;

  return (
    <main className="dp-partner-lifecycle-page">
      <header className="dp-partner-lifecycle-hero">
        <div>
          <p>Partner platform</p>
          <h1>Start your workspace once. Operate from one place.</h1>
          <span>
            Registration, plan selection, checkout, workspace setup, and daily operations now move through one connected Downtown Perks path.
          </span>
        </div>
        <Link to="/partner-workspace/overview">
          Open Workspace
          <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <nav className="dp-partner-lifecycle-progress" aria-label="Partner setup progress">
        {steps.map(([label, href], index) => (
          <Link key={label} to={href} className={index <= activeIndex ? "is-active" : ""}>
            <small>{index + 1}</small>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {children}
    </main>
  );
}

function StartStage({ setup, setSetup }) {
  const navigate = useNavigate();

  function selectType(type) {
    const nextSetup = {
      ...setup,
      organizationType: type.id,
      partnerType: type.label,
      workspaceTemplate: type.template,
      plan: setup.plan || type.plan,
      defaultModules: setup.defaultModules || setupModules.slice(0, 6),
    };
    setSetup(nextSetup);
    saveSetup(nextSetup);
    navigate(`/partners/register?partnerType=${encodeURIComponent(type.id)}`);
  }

  return (
    <section className="dp-partner-lifecycle-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Partner type</p>
        <h2>Choose the lane that matches the work.</h2>
        <span>Selecting a lane keeps your recommended plan, workspace tools, and setup details together.</span>
      </div>
      <div className="dp-partner-type-grid">
        {partnerTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button key={type.id} type="button" onClick={() => selectType(type)}>
              <Icon aria-hidden="true" />
              <strong>{type.label}</strong>
              <small>{type.template}</small>
              <span>{type.plan}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RegisterStage({ setup, setSetup }) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization: setup.organization || "",
    website: setup.website || "",
    address: setup.address || "",
    contact: setup.contact || "",
    phone: setup.phone || "",
    email: setup.email || "",
    manager: setup.manager || "",
    industry: setup.industry || setup.partnerType || "",
    googleBusiness: setup.googleBusiness || "",
    description: setup.description || "",
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (!form.organization.trim() || !form.contact.trim() || !form.email.trim()) {
      trackLifecycleEvent("registration_validation_failed", {
        partnerType: setup.partnerType,
        missing: ["organization", "contact", "email"].filter((field) => !form[field]?.trim()),
      });
      return;
    }
    const nextSetup = { ...setup, ...form };
    setSetup(nextSetup);
    saveSetup(nextSetup);
    trackLifecycleEvent("registration_completed", {
      partnerType: nextSetup.partnerType,
      plan: nextSetup.plan,
      organization: nextSetup.organization,
    });
    navigate("/partners/pricing");
  }

  return (
    <section className="dp-partner-lifecycle-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Registration</p>
        <h2>Confirm the organization and setup details.</h2>
        <span>These details shape your workspace, public profile, reports, billing, and launch tools.</span>
      </div>

      <form className="dp-partner-register-form" onSubmit={handleSubmit}>
        {[
          ["organization", "Organization"],
          ["website", "Website"],
          ["address", "Address"],
          ["contact", "Primary contact"],
          ["phone", "Phone"],
          ["email", "Email"],
          ["manager", "Manager or owner"],
          ["industry", "Industry"],
          ["googleBusiness", "Google Business profile"],
        ].map(([field, label]) => (
          <label key={field}>
            <span>{label}{["organization", "contact", "email"].includes(field) ? " *" : ""}</span>
            <input
              value={form[field]}
              type={field === "email" ? "email" : field === "website" ? "url" : "text"}
              required={["organization", "contact", "email"].includes(field)}
              aria-invalid={submitted && ["organization", "contact", "email"].includes(field) && !form[field]?.trim() ? "true" : "false"}
              onChange={(event) => updateField(field, event.target.value)}
            />
          </label>
        ))}
        <label className="dp-partner-register-form-wide">
          <span>Description, categories, amenities, hours, logo, images, or launch notes</span>
          <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>

        <aside className="dp-workspace-preview-card">
          <p>Workspace preview</p>
          <h3>This is what your workspace will include.</h3>
          <div>
            {setupModules.map((module) => (
              <span key={module}><Check aria-hidden="true" />{module}</span>
            ))}
          </div>
        </aside>

        <button type="submit">
          Continue to pricing
          <ArrowRight aria-hidden="true" />
        </button>
        {submitted && (!form.organization.trim() || !form.contact.trim() || !form.email.trim()) ? (
          <p className="dp-partner-form-error" role="alert">Organization, primary contact, and email are required before pricing can be confirmed.</p>
        ) : null}
      </form>
    </section>
  );
}

function CheckoutStage({ setup, setSetup }) {
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const selectedPlan = setup.plan || "Venue Basic";
  const checkoutTarget = setup.checkoutTarget || (setup.checkoutKey ? resolveCheckoutTarget(setup.checkoutKey) : null);
  const isStripeReady = checkoutTarget && checkoutTarget.type !== "lead";
  const moduleLabels = Array.isArray(setup.moduleLabels) ? setup.moduleLabels : [];
  const annualTotal = setup.annualTotal && setup.annualTotal !== "custom" ? Number(setup.annualTotal) : null;
  const oneTimeTotal = Number(setup.oneTimeTotal || 0);

  async function handleCheckout() {
    setCheckoutError("");

    const nextSetup = {
      ...setup,
      checkoutStatus: isStripeReady ? "stripe_ready_confirmed" : "registration_confirmed",
      subscription: selectedPlan,
      invoiceMode: isStripeReady ? "Secure checkout available" : "Team-assisted checkout",
    };
    setSetup(nextSetup);
    saveSetup(nextSetup);

    if (isStripeReady && (checkoutTarget.priceId || checkoutTarget.productId)) {
      setIsSubmittingCheckout(true);
      try {
        const response = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: checkoutTarget.priceId,
            productId: checkoutTarget.productId,
            mode: checkoutTarget.mode,
            metadata: {
              source: "partner_lifecycle",
              partnerType: nextSetup.partnerType || "",
              organization: nextSetup.organization || "",
              plan: selectedPlan,
              sku: nextSetup.sku || "",
              modules: Array.isArray(nextSetup.modules) ? nextSetup.modules.join(",") : "",
            },
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.checkoutUrl) {
          throw new Error(data.error || "Checkout session could not be created.");
        }
        trackLifecycleEvent("stripe_checkout_started", {
          partnerType: nextSetup.partnerType,
          plan: selectedPlan,
          checkoutTargetType: checkoutTarget.type,
        });
        window.location.assign(data.checkoutUrl);
        return;
      } catch (error) {
        setCheckoutError(error.message || "Checkout could not start. The setup is still saved.");
      } finally {
        setIsSubmittingCheckout(false);
      }
      return;
    }

    trackLifecycleEvent("checkout_confirmed", {
      partnerType: nextSetup.partnerType,
      plan: selectedPlan,
      checkoutStatus: nextSetup.checkoutStatus,
      checkoutTargetType: checkoutTarget?.type || "lead",
    });
    navigate("/partners/provision?checkout=confirmed");
  }

  return (
    <section className="dp-partner-lifecycle-section dp-partner-checkout-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Checkout</p>
        <h2>Confirm billing and activate the workspace.</h2>
        <span>Review your selected plan, add-ons, and account details before continuing.</span>
      </div>
      <div className="dp-checkout-grid">
        <article>
          <Receipt aria-hidden="true" />
          <h3>{selectedPlan}</h3>
          <p>{setup.partnerType || "Partner"} workspace subscription</p>
          <dl>
            <div><dt>Organization</dt><dd>{setup.organization || "Add during setup"}</dd></div>
            <div><dt>Contact</dt><dd>{setup.email || "Add during setup"}</dd></div>
            <div><dt>Billing</dt><dd>{isStripeReady ? "Secure checkout available" : "Team-assisted checkout"}</dd></div>
            <div><dt>Annual total</dt><dd>{annualTotal == null ? "Custom" : formatCurrency(annualTotal)}</dd></div>
            <div><dt>One-time total</dt><dd>{formatCurrency(oneTimeTotal)}</dd></div>
          </dl>
          {moduleLabels.length ? (
            <div className="dp-checkout-module-list" aria-label="Selected modules">
              {moduleLabels.map((module) => <span key={module}>{module}</span>)}
            </div>
          ) : null}
        </article>
        <article>
          <CreditCard aria-hidden="true" />
          <h3>Payment path</h3>
          <p>{isStripeReady
            ? "Continue through secure checkout. Your workspace details stay connected to the selected plan."
            : "This plan needs a quick review before payment. We will keep your setup details together for the next step."}</p>
          <button type="button" onClick={handleCheckout} disabled={isSubmittingCheckout}>
            {isSubmittingCheckout ? "Opening checkout..." : isStripeReady ? "Continue to checkout" : "Continue with setup"}
          </button>
          {checkoutError ? <p className="dp-partner-form-error" role="alert">{checkoutError}</p> : null}
          <Link to="/partner-workspace/billing?checkout=1">Open billing module</Link>
        </article>
      </div>
    </section>
  );
}

function ProvisionStage({ setup }) {
  const navigate = useNavigate();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setComplete(true), 1200);
    const redirectId = window.setTimeout(() => navigate("/partner-workspace/overview?provisioned=1"), 2600);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(redirectId);
    };
  }, [navigate]);

  return (
    <section className="dp-partner-lifecycle-section dp-partner-provision-section">
      <div className="dp-partner-lifecycle-section-head">
        <p>Workspace setup</p>
        <h2>{complete ? "Workspace is ready." : "Preparing your workspace."}</h2>
        <span>{setup.organization || "Your organization"} is being connected to profile tools, offers, events, reports, billing, and map visibility.</span>
      </div>
      <div className="dp-provision-list">
        {provisioningSteps.map((step, index) => (
          <div key={step} className={complete || index < 9 ? "is-complete" : ""}>
            <BadgeCheck aria-hidden="true" />
            <span>{step}</span>
          </div>
        ))}
      </div>
      <Link to="/partner-workspace/overview?provisioned=1">
        Open workspace
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function PartnerLifecycle() {
  const location = useLocation();
  const stage = getStage(location.pathname);
  const [setup, setSetup] = useState(() => {
    return {
      ...getStoredSetup(),
      ...hydrateSetupFromParams(location.search),
    };
  });

  useEffect(() => {
    const querySetup = hydrateSetupFromParams(location.search);
    const hasQuerySetup = Object.values(querySetup).some((value) => value !== undefined && value !== "");
    if (!hasQuerySetup) return;
    setSetup((current) => {
      const nextSetup = { ...current, ...querySetup };
      saveSetup(nextSetup);
      return nextSetup;
    });
  }, [location.search]);

  const content = useMemo(() => {
    if (stage === "register") return <RegisterStage setup={setup} setSetup={setSetup} />;
    if (stage === "checkout") return <CheckoutStage setup={setup} setSetup={setSetup} />;
    if (stage === "provision") return <ProvisionStage setup={setup} />;
    return <StartStage setup={setup} setSetup={setSetup} />;
  }, [stage, setup]);

  return <LifecycleShell stage={stage}>{content}</LifecycleShell>;
}
