import { useMemo, useState } from "react";
import { APPROVED_HOME_COPY } from "@/lib/approvedCopy";

function AnimatedMapCard() {
  const pins = useMemo(
    () => [
      { left: "18%", top: "30%", active: false },
      { left: "42%", top: "24%", active: true },
      { left: "65%", top: "38%", active: false },
      { left: "30%", top: "62%", active: false },
      { left: "70%", top: "66%", active: false },
    ],
    []
  );

  return (
    <div className="relative aspect-[1.08/0.92] overflow-hidden rounded-[26px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,#f8fafc,#eef3f8)] shadow-[0_18px_42px_rgba(11,31,51,0.08)]">
      <div className="absolute inset-0 opacity-70">
        {["24%", "50%", "76%"].map((top) => (
          <div key={top} className="absolute inset-x-0 h-px bg-[rgba(11,31,51,0.08)]" style={{ top }} />
        ))}
        {["22%", "48%", "74%"].map((left) => (
          <div key={left} className="absolute inset-y-0 w-px bg-[rgba(11,31,51,0.08)]" style={{ left }} />
        ))}
      </div>
      <div className="absolute left-[44%] top-[52%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0b1f33] shadow-[0_6px_12px_rgba(11,31,51,0.18)]" />
      <div className="absolute bottom-4 left-4 rounded-full bg-white/82 px-3 py-1.5 text-[11px] font-medium text-[#0b1f33] shadow-sm">
        Downtown Austin 78701
      </div>
      {pins.map((pin, index) => (
        <div
          key={`${pin.left}-${pin.top}`}
          className="absolute"
          style={{ left: pin.left, top: pin.top }}
        >
          {pin.active ? (
            <>
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(15,23,42,0.08)]" />
              <div className="relative h-4 w-4 rounded-full border-2 border-white bg-[#0b1f33] shadow-[0_8px_20px_rgba(11,31,51,0.18)]" />
            </>
          ) : (
            <div className="h-3 w-3 rounded-full border border-[rgba(11,31,51,0.18)] bg-[rgba(255,255,255,0.92)]" />
          )}
        </div>
      ))}
    </div>
  );
}

function AnimatedCardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="rounded-[32px] border border-[rgba(11,31,51,0.08)] bg-[#0b1f33] p-3 shadow-[0_24px_54px_rgba(11,31,51,0.18)]">
        <div className="relative overflow-hidden rounded-[24px] bg-[#fafaf7] px-5 pb-5 pt-10">
          <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0e101a]" />
          <div className="text-[9px] font-black uppercase tracking-[0.26em] text-white/58">
            Downtown Perks
          </div>
          <div className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-[#0b1f33]">
            Member Card
          </div>
          <div className="mt-4 rounded-[18px] bg-[#0b1f33] px-4 py-3 text-white">
            <div className="text-[12px] font-semibold">Meg Dude</div>
            <div className="mt-1 text-[9px] tracking-[0.18em] text-white/60">DP-2024-5590</div>
          </div>
          <div className="mt-4 rounded-[20px] border border-[rgba(11,31,51,0.08)] bg-white px-4 py-4">
            <div className="text-center text-[10px] font-medium text-[rgba(11,31,51,0.54)]">
              Show at partner to scan
            </div>
            <div className="relative mx-auto mt-3 h-[112px] w-[112px] rounded-[18px] bg-[linear-gradient(90deg,#0b1f33_0_16%,transparent_16%_22%,#0b1f33_22%_38%,transparent_38%_44%,#0b1f33_44%_56%,transparent_56%_62%,#0b1f33_62%_78%,transparent_78%_84%,#0b1f33_84%_100%)] opacity-90" />
            <div className="absolute left-1/2 mt-[-2px] h-[2px] w-[112px] -translate-x-1/2 bg-[rgba(11,31,51,0.14)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepVisual({ index }) {
  if (index === 0) return <AnimatedMapCard />;
  if (index === 1) return <AnimatedMapCard />;
  return <AnimatedCardPreview />;
}

export default function ApprovedJourneySection() {
  const steps = APPROVED_HOME_COPY.howItWorks.steps;
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell">
        <div className="grid grid-cols-1 gap-8 border-t border-[rgba(11,31,51,0.08)] pt-8 md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-10">
          <div>
            <div className="dp-micro-label mb-4">{APPROVED_HOME_COPY.howItWorks.title}</div>
            <div className="space-y-3">
              {steps.map((step, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-full border-b px-0 py-4 text-left transition-all ${
                      isActive
                        ? "border-[rgba(11,31,51,0.14)] text-[var(--dp-navy)]"
                        : "border-[rgba(11,31,51,0.08)] text-[rgba(11,31,51,0.76)]"
                    }`}
                  >
                    <div className="font-heading text-[1.2rem] font-semibold tracking-[-0.03em] text-foreground">
                      {step.title}
                    </div>
                    <div className="mt-2 text-[14px] leading-6 text-muted-foreground">{step.body}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-[rgba(11,31,51,0.08)] pt-5 text-[var(--dp-navy)]">
              <div className="font-heading text-[1.5rem] font-semibold tracking-[-0.04em]">
                {APPROVED_HOME_COPY.howItWorks.close}
              </div>
              <p className="mt-3 text-[14px] leading-7 text-foreground/68">
                {APPROVED_HOME_COPY.howItWorks.note}
              </p>
            </div>
          </div>

          <div className="relative min-h-[360px]">
            <div className="relative">
              <StepVisual index={activeIndex} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
