import SectionShell from "@/components/shared/SectionShell";

export default function ProductExplanationSection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-3">
        {copy.bullets.map((bullet, index) => (
          <article key={bullet} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              0{index + 1}
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[var(--dp-navy,#111827)]">{bullet}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
