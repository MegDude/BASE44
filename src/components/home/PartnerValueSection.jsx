import SectionShell from "@/components/shared/SectionShell";

export default function PartnerValueSection({ copy }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)] bg-[var(--dp-navy,#111827)] text-white">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Show up inside real downtown decisions.",
          "Make nearby context easier to notice.",
          "Measure what people actually saved, scanned, attended, or redeemed.",
        ].map((point, index) => (
          <article key={point} className="rounded-[24px] border border-white/12 bg-white/6 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--dp-gold,#CFAF5A)]">
              0{index + 1}
            </div>
            <p className="mt-3 text-[14px] leading-7 text-white/82">{point}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
