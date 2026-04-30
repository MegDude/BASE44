import { useState } from "react";
import SectionShell from "@/components/shared/SectionShell";

export default function WhatYouCanDoSection({ copy }) {
  const tabLabels = Object.keys(copy.tabs);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const activePanel = copy.tabs[activeTab];

  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {tabLabels.map((tab) => (
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
        <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <article className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
            <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {activePanel.title}
            </h3>
            <p className="mt-4 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{activePanel.body}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {activePanel.bullets.map((bullet) => (
                <div key={bullet} className="rounded-[18px] bg-[rgba(247,247,251,0.9)] p-4 text-[13px] leading-6 text-[var(--dp-navy,#111827)]">
                  {bullet}
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-[var(--dp-navy,#111827)] p-6 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              Featured nearby
            </div>
            <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em]">
              Rainey Street Food + Drink Loop
            </h3>
            <p className="mt-3 text-[14px] leading-7 text-white/76">
              A walkable nearby route with dinner, drinks, a short walk, and the kind of context that helps the next move feel obvious.
            </p>
          </article>
        </div>
      </div>
    </SectionShell>
  );
}
