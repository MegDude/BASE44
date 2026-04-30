import { useState } from "react";
import SectionShell from "@/components/shared/SectionShell";

export default function OperatingModel({ copy, rules }) {
  const [activeRule, setActiveRule] = useState("Map");
  const selectedRule = rules.find((item) => item.label === activeRule) || rules[1] || rules[0];

  return (
    <SectionShell id="operating-model" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-wrap gap-3 lg:flex-col">
          {rules.map((rule) => {
            const active = selectedRule.label === rule.label;
            return (
              <button
                key={rule.label}
                type="button"
                onClick={() => setActiveRule(rule.label)}
                aria-pressed={active}
                className={`rounded-[20px] border px-5 py-4 text-left transition ${
                  active
                    ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)]"
                    : "border-[rgba(15,23,42,0.10)] bg-white"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  {rule.label}
                </div>
                <div className="mt-2 text-[15px] font-semibold text-[var(--dp-navy,#111827)]">{rule.title}</div>
              </button>
            );
          })}
        </div>
        <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
            {selectedRule.label}
          </div>
          <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
            {selectedRule.title}
          </h3>
          <p className="mt-4 text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">{selectedRule.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {copy.chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex min-h-[36px] items-center rounded-full bg-[rgba(247,247,251,0.9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
