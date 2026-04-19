import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

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
    <div className="min-h-screen bg-[hsl(42,24%,96%)] pt-[68px] text-[hsl(218,42%,14%)]">
      <section className="border-b border-[rgba(19,36,67,0.12)] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,46%)]">
            Pricing
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
                Simple pricing for a downtown product that actually gets used.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[rgba(19,36,67,0.7)]">
                Clear tiers, no noisy pricing wall, and a direct path into the resident or partner workflow.
              </p>
            </div>

            <div className="inline-flex border border-[rgba(19,36,67,0.14)] bg-white/80 p-1 shadow-sm">
              {[
                { id: "monthly", label: "Monthly" },
                { id: "annual", label: "Annual" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBilling(option.id)}
                  className={`h-10 px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
                    billing === option.id
                      ? "bg-[hsl(218,42%,14%)] text-[hsl(42,24%,96%)]"
                      : "text-[rgba(19,36,67,0.64)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:py-14">
        <div className="mx-auto max-w-6xl border-y border-[rgba(19,36,67,0.12)]">
          {plans.map((plan) => (
            <div key={plan.id} className="grid gap-6 border-b border-[rgba(19,36,67,0.12)] py-7 md:grid-cols-[180px_160px_1fr_auto] md:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(19,36,67,0.46)]">
                  {plan.name}
                </p>
              </div>

              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em]">{plan.price}</p>
              </div>

              <div>
                <p className="text-base leading-7 text-[rgba(19,36,67,0.78)]">{plan.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {plan.includes.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 text-sm text-[rgba(19,36,67,0.64)]">
                      <Check className="h-3.5 w-3.5 text-[hsl(40,62%,46%)]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Link
                  to={plan.cta.to}
                  className="inline-flex h-11 items-center gap-2 border border-[rgba(19,36,67,0.14)] bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-all hover:border-[rgba(200,151,58,0.7)] hover:text-[hsl(40,62%,46%)]"
                >
                  {plan.cta.label}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl grid gap-10 border-t border-[rgba(19,36,67,0.12)] pt-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,46%)]">
              Next step
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
              Choose the right mode and move straight into the product.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[rgba(19,36,67,0.7)]">
              Residents should land in the live map and perks flow. Partner teams should land in the management surface.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex h-12 items-center gap-2 bg-[hsl(218,42%,14%)] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(42,24%,96%)] transition-all hover:bg-[hsl(218,42%,12%)]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4 text-[hsl(40,62%,46%)]" />
            </Link>
            <Link
              to="/downtown-perks/explore"
              className="inline-flex h-12 items-center gap-2 border border-[rgba(200,151,58,0.55)] px-5 text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(218,42%,14%)] transition-all hover:bg-[rgba(19,36,67,0.04)]"
            >
              See the live map
              <ArrowRight className="h-4 w-4 text-[hsl(40,62%,46%)]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
