import SectionContainer from "@/components/SectionContainer";

export default function NarrativeSteps({ steps = [] }) {
  return (
    <SectionContainer width="wide">
      <section className="border-t border-[rgba(11,31,51,0.08)]">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="grid gap-4 border-b border-[rgba(11,31,51,0.08)] py-6 md:grid-cols-[88px_minmax(0,1fr)] md:gap-8"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(11,31,51,0.42)]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="max-w-[720px]">
              <h2 className="font-heading text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--dp-navy,#0B1F33)] md:text-[2.6rem]">
                {step.title}
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">{step.body}</p>
            </div>
          </article>
        ))}
      </section>
    </SectionContainer>
  );
}
