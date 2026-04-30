import { useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function HomePartnerOverview({ copy }) {
  const [activeTab, setActiveTab] = useState(copy.tabs[0]);
  const panel = copy.panels[activeTab];

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 lg:grid-cols-3">
        {copy.steps.map((step) => (
          <article key={step.number} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">{step.number}</div>
            <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{step.title}</h3>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {copy.tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-3 text-left text-sm font-semibold lg:rounded-[20px] ${
                activeTab === tab
                  ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                  : "border-[rgba(15,23,42,0.10)] bg-white text-[rgba(71,85,105,0.94)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{panel.title}</h3>
          <p className="mt-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{panel.body}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {panel.bullets.map((bullet) => (
              <div key={bullet} className="rounded-[18px] bg-[rgba(247,247,251,0.9)] p-4 text-[13px] leading-6 text-[var(--dp-navy,#111827)]">
                {bullet}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link to={panel.href} className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white">
              {panel.cta}
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
