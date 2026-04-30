import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";

export default function InsightBlock({ title, points = [], body }) {
  return (
    <SectionContainer width="wide">
      <section className="grid gap-8 border-t border-[rgba(11,31,51,0.08)] pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionHeader eyebrow="System intelligence" title={title} />
        <div>
          <div className="space-y-4">
            {points.map((point) => (
              <div
                key={point}
                className="flex items-center gap-4 border-b border-[rgba(11,31,51,0.08)] pb-4 text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)] last:border-b-0"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--dp-gold,#CFAF5A)]" />
                <span>{point}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[620px] text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">{body}</p>
        </div>
      </section>
    </SectionContainer>
  );
}
