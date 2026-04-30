import { useState } from "react";
import { Link } from "react-router-dom";
import SectionShell from "@/components/shared/SectionShell";

export default function HomePartnerTabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <SectionShell eyebrow="Partner types" title="Choose the partner path that fits." body="Each role uses the same downtown map, but the value layer changes by who is trying to drive the next move." variant="navy" className="pt-0">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab.label === tab.label}
              className={`rounded-[14px] border px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab.label === tab.label
                  ? "border-[rgba(207,175,90,0.34)] bg-[rgba(207,175,90,0.14)] text-white"
                  : "border-white/10 bg-white/6 text-white/78"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 md:p-8">
          <h3 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-white">{activeTab.title}</h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/76">{activeTab.body}</p>
          <div className="mt-5 inline-flex rounded-[14px] bg-[rgba(207,175,90,0.14)] px-4 py-3 text-sm font-semibold text-[var(--dp-gold,#CFAF5A)]">
            {activeTab.proof}
          </div>
          <div className="mt-6">
            <Link to={activeTab.href} className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-white px-5 py-3 text-sm font-semibold text-[var(--dp-navy,#111827)]">
              {activeTab.cta}
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
