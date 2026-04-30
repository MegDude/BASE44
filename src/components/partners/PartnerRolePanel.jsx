import { useState } from "react";
import { Link } from "react-router-dom";

export default function PartnerRolePanel({ role }) {
  const [activeWhyTab, setActiveWhyTab] = useState(role.whyTabs?.[0]?.label || "");

  const activeWhy = role.whyTabs?.find((item) => item.label === activeWhyTab) || role.whyTabs?.[0];

  return (
    <section
      id={`panel-${role.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${role.id}`}
      className="px-4 py-8 md:px-6 md:py-10"
    >
      <div className="mx-auto max-w-[1180px] rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold,#CFAF5A)]">
              {role.eyebrow}
            </div>
            <h3 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#111827)]">
              {role.title}
            </h3>
            <p className="mt-4 text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">{role.body}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {role.metrics.map((metric) => (
                <div key={metric.label} className="rounded-[20px] bg-[rgba(247,247,251,0.9)] px-4 py-4">
                  <div className="text-[1.5rem] font-semibold tracking-[-0.04em] text-[var(--dp-navy,#111827)]">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[12px] uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={role.href}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
              >
                Open {role.label} page
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                What you get
              </div>
              <div className="mt-3 grid gap-3">
                {role.benefits.map((benefit) => (
                  <article key={benefit.title} className="rounded-[20px] border border-[rgba(15,23,42,0.10)] bg-[rgba(247,247,251,0.88)] p-4">
                    <h4 className="text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{benefit.title}</h4>
                    <p className="mt-2 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{benefit.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                How it works
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {role.workflow.map((step) => (
                  <article key={step.number + step.title} className="rounded-[20px] border border-[rgba(15,23,42,0.10)] bg-white p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                      {step.number}
                    </div>
                    <h4 className="mt-2 text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{step.title}</h4>
                    <p className="mt-2 text-[13px] leading-6 text-[rgba(71,85,105,0.94)]">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                Why it works
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {role.whyTabs.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={activeWhy?.label === item.label}
                    onClick={() => setActiveWhyTab(item.label)}
                    className={`inline-flex min-h-[44px] items-center rounded-full border px-3 py-2 text-[12px] font-semibold transition ${
                      activeWhy?.label === item.label
                        ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                        : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {activeWhy ? (
                <div className="mt-3 rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">
                  {activeWhy.body}
                </div>
              ) : null}
              <div className="mt-4 rounded-[20px] border border-dashed border-[rgba(15,23,42,0.12)] p-4">
                <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  Proof question
                </div>
                <div className="mt-2 text-[14px] leading-7 text-[var(--dp-navy,#111827)]">{role.proofQuestion}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
