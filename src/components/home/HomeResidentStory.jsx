import SectionShell from "@/components/shared/SectionShell";

export default function HomeResidentStory({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p className="text-[15px] leading-8 text-[rgba(71,85,105,0.94)]">{copy.support}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {copy.points.map((point) => (
            <article key={point.label} className="rounded-[24px] border border-[rgba(15,23,42,0.10)] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
                {point.label}
              </div>
              <p className="mt-3 text-[15px] leading-7 text-[var(--dp-navy,#111827)]">{point.body}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
