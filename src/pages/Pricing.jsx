import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";

const PLANS = [
  {
    id: "pilot",
    name: "Pilot",
    monthly: "Free",
    annual: "Free",
    summary: "Validate resident demand and prove local usage before you scale.",
    includes: ["Resident access", "QR activation", "Live map listing", "Usage snapshot"],
    cta: { label: "Start free pilot", to: "/dashboard" },
  },
  {
    id: "connected",
    name: "Connected",
    monthly: "$39/mo",
    annual: "$32/mo",
    summary: "A clean operating layer for one property or hospitality team.",
    includes: ["Everything in Pilot", "Partner dashboard", "Communication tools", "Monthly reporting"],
    cta: { label: "Open dashboard", to: "/dashboard/partner" },
  },
  {
    id: "intelligence",
    name: "Intelligence",
    monthly: "$99/mo",
    annual: "$84/mo",
    summary: "For teams that want stronger analytics, segmentation, and district visibility.",
    includes: ["Everything in Connected", "Advanced analytics", "Segmented campaigns", "Priority support"],
    cta: { label: "Talk to the team", to: "/partners" },
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState("monthly");

  const plans = useMemo(
    () =>
      PLANS.map((plan) => ({
        ...plan,
        price: billing === "annual" ? plan.annual : plan.monthly,
      })),
    [billing]
  );

  return (
    <div className="min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-foreground">
      <section className="px-4 py-8 md:px-6 md:py-10">
        <div className="dp-page-shell dp-band p-6 md:p-8 lg:p-10">
          <Link
            to="/"
            className="dp-cta-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <p className="dp-micro-label mt-6">
            Pricing
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="dp-display-hero max-w-3xl text-5xl md:text-6xl">
                Built for the places that build the neighborhood.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                Simple, annual, and performance-backed pricing with a direct path into the resident
                or partner workflow.
              </p>
            </div>

            <div className="inline-flex rounded-full border border-[var(--dp-border)] bg-white/88 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              {[
                { id: "monthly", label: "Monthly" },
                { id: "annual", label: "Annual" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBilling(option.id)}
                  className={`h-10 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    billing === option.id
                      ? "bg-[var(--dp-navy)] text-white shadow-[0_8px_18px_rgba(11,31,51,0.14)]"
                      : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band p-6 md:p-8">
          {plans.map((plan) => (
            <div key={plan.id} className="grid gap-6 border-b border-[var(--dp-divider)] py-7 last:border-b-0 md:grid-cols-[180px_160px_1fr_auto] md:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {plan.name}
                </p>
              </div>

              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em]">{plan.price}</p>
              </div>

              <div>
                <p className="text-base leading-7 text-muted-foreground">{plan.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {plan.includes.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-[var(--dp-gold-muted)]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Link
                  to={plan.cta.to}
                  className="dp-cta-secondary inline-flex h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.14em]"
                >
                  {plan.cta.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-2 md:px-6">
        <div className="dp-page-shell dp-band dp-band-muted grid gap-10 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="dp-micro-label">
              Next step
            </p>
            <h2 className="dp-display-section mt-4 text-4xl">
              Ready when you are.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              People don't choose the best option. They choose the one they notice.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="dp-cta-primary inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/downtown-perks/explore"
              className="dp-cta-secondary inline-flex h-12 items-center gap-2 px-5 text-sm font-semibold uppercase tracking-[0.14em]"
            >
              See the live map
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
