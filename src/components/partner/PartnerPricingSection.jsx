import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const PARTNER_PRICING = [
  {
    id: "pilot",
    name: "Pilot",
    price: "Free",
    summary: "Validate demand and launch one partner surface without friction.",
    includes: ["Live map placement", "QR setup", "Usage snapshot", "Basic reporting"],
    cta: { label: "Start pilot", to: "/partner-workspace" },
  },
  {
    id: "connected",
    name: "Connected",
    price: "$39/mo",
    summary: "One active operator layer with dashboard access, reporting, and campaign control.",
    includes: ["Everything in Pilot", "Dashboard access", "Partner workspace", "Monthly reporting"],
    cta: { label: "Open dashboard", to: "/partners/dashboard" },
  },
  {
    id: "intelligence",
    name: "Intelligence",
    price: "$99/mo",
    summary: "For teams that need segmentation, stronger measurement, and broader district visibility.",
    includes: ["Everything in Connected", "Advanced analytics", "Priority support", "Campaign planning"],
    cta: { label: "Talk to the team", to: "/partner-workspace" },
  },
];

export default function PartnerPricingSection({
  title = "Partner pricing",
  intro = "Pricing belongs inside the partner system so teams can understand the model in context.",
}) {
  return (
    <section id="partner-pricing" className="border-b border-[rgba(11,31,51,0.08)] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(40,62%,42%)]">
            Pricing
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.62)]">
            {intro}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {PARTNER_PRICING.map((plan) => (
            <div
              key={plan.id}
              className="rounded-[24px] border border-[rgba(11,31,51,0.10)] bg-white p-6 shadow-[0_10px_24px_rgba(11,31,51,0.04)]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.46)]">
                {plan.name}
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--dp-navy,#0B1F33)]">
                {plan.price}
              </div>
              <p className="mt-4 text-sm leading-6 text-[rgba(11,31,51,0.64)]">
                {plan.summary}
              </p>
              <div className="mt-5 space-y-2">
                {plan.includes.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[rgba(11,31,51,0.72)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(40,62%,42%)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to={plan.cta.to}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--dp-navy,#0B1F33)] px-5 text-sm font-semibold text-white transition hover:bg-[rgba(11,31,51,0.92)]"
              >
                {plan.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
