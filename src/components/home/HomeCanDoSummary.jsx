import { useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function HomeCanDoSummary({ copy }) {
  const [activeTab, setActiveTab] = useState(copy.tabs[0]);

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {copy.tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              aria-pressed={activeTab.label === tab.label}
              onClick={() => setActiveTab(tab)}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab.label === tab.label
                  ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)] text-[var(--dp-navy,#111827)]"
                  : "border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.72)] text-[rgba(71,85,105,0.94)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <article className="rounded-[28px] bg-[rgba(255,255,255,0.7)] p-1 shadow-[0_24px_80px_rgba(7,27,47,0.08)]">
          <div className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-white/92 p-6 md:p-8">
          <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">{activeTab.title}</h3>
          <p className="mt-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{activeTab.body}</p>
          <div className="mt-5">
            <Link
              to={activeTab.href}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[14px] bg-[var(--dp-navy,#111827)] px-5 py-3 text-sm font-semibold text-white"
            >
              {activeTab.cta}
            </Link>
          </div>
          </div>
        </article>
      </div>
    </SectionShell>
  );
}
