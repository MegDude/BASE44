import SectionShell from "@/components/shared/SectionShell";

export default function SystemLogic({ copy }) {
  return (
    <SectionShell id="system-logic" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-3">
        {copy.steps.map((step) => (
          <article key={step.label} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              {step.label}
            </div>
            <h3 className="mt-3 text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--dp-navy,#111827)]">
              {step.title}
            </h3>
            <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{step.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
