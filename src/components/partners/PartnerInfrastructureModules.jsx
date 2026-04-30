import { useState } from "react";
import SectionShell from "@/components/shared/SectionShell";

export default function PartnerInfrastructureModules({ modules }) {
  const [active, setActive] = useState(modules[0]?.title || "");
  const activeModule = modules.find((item) => item.title === active) || modules[0];

  return (
    <SectionShell id="infrastructure" eyebrow="Partner infrastructure" title="Keep the deeper system modules, but make them readable." body="These modules belong on the partner landing page because they explain how the map, QR, offers, and proof layers actually work together." className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible">
          {modules.map((module) => {
            const isActive = module.title === activeModule.title;
            return (
              <button
                key={module.title}
                type="button"
                onClick={() => setActive(module.title)}
                aria-pressed={isActive}
                className={`rounded-[20px] border px-4 py-4 text-left transition ${
                  isActive
                    ? "border-[rgba(207,175,90,0.28)] bg-[rgba(207,175,90,0.12)]"
                    : "border-[rgba(15,23,42,0.10)] bg-white"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                  {module.label}
                </div>
                <div className="mt-2 text-[14px] font-semibold text-[var(--dp-navy,#111827)]">{module.title}</div>
              </button>
            );
          })}
        </div>
        {activeModule ? (
          <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
              What it does
            </div>
            <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {activeModule.title}
            </h3>
            <p className="mt-4 text-[15px] leading-7 text-[rgba(71,85,105,0.94)]">{activeModule.body}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  Trigger
                </div>
                <p className="mt-2 text-[14px] leading-7 text-[var(--dp-navy,#111827)]">{activeModule.trigger}</p>
              </div>
              <div className="rounded-[20px] bg-[rgba(247,247,251,0.9)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(71,85,105,0.94)]">
                  System response
                </div>
                <p className="mt-2 text-[14px] leading-7 text-[var(--dp-navy,#111827)]">{activeModule.response}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
