import { useState } from "react";
import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";

function StepButton({ index, label, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onSelect}
      aria-pressed={active}
      className={`w-full border-l-2 px-0 py-4 text-left transition-all duration-200 ${
        active
          ? "border-[var(--dp-gold,#CFAF5A)] pl-4"
          : "border-transparent pl-4 hover:border-[rgba(11,31,51,0.12)]"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span className={`text-[0.95rem] font-semibold ${active ? "text-[var(--dp-gold-deep,#A97816)]" : "text-[rgba(11,31,51,0.46)]"}`}>
          {index + 1}
        </span>
        <span className="text-[1.02rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{label}</span>
      </div>
    </button>
  );
}

export default function StepRail({ steps = [], detail, eyebrow, title, description }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex];

  return (
    <SectionContainer width="wide">
      <section>
        <SectionHeader
          eyebrow={eyebrow || "How it works"}
          title={title || "Ask the map. See what’s happening. Take the next step."}
          description={description}
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <div className="overflow-x-auto pb-2 lg:overflow-visible">
            <div className="flex min-w-max gap-4 lg:min-w-0 lg:flex-col lg:gap-0">
              {steps.map((step, index) => (
                <StepButton
                  key={step.title}
                  index={index}
                  label={step.title}
                  active={activeIndex === index}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
          <div className="border-t border-[rgba(11,31,51,0.08)] pt-5 md:pt-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
              Step {activeIndex + 1}
            </div>
            <h3 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.6rem]">
              {activeStep.title}
            </h3>
            <p className="mt-4 max-w-[620px] text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
              {activeStep.body}
            </p>
            {detail ? (
              <div className="mt-8 border-t border-[rgba(11,31,51,0.08)] pt-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.42)]">
                  {detail.title}
                </div>
                <p className="mt-3 max-w-[580px] text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">
                  {detail.body}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </SectionContainer>
  );
}
