import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";

export default function ComparisonStrip({ title, description, rows = [] }) {
  return (
    <SectionContainer width="wide">
      <section>
        <SectionHeader
          eyebrow="Why this feels different"
          title={title || "A shared decision layer instead of disconnected inputs."}
          description={description}
        />
        <div className="mt-8 overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.44))] px-6 py-3 shadow-[0_18px_40px_rgba(11,31,51,0.05)]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="border-b border-[rgba(11,31,51,0.08)] py-4 last:border-b-0"
            >
              <div className="grid gap-1 md:grid-cols-[minmax(0,1fr)_220px] md:items-baseline md:gap-6">
                <span className="text-[15px] font-semibold text-[var(--dp-navy,#0B1F33)]">
                  {row.label}
                </span>
                <span className="text-[15px] font-semibold text-[rgba(11,31,51,0.74)] md:text-right">
                  {row.value}
                </span>
              </div>
              {row.detail ? (
                <p className="mt-2 max-w-[760px] text-[14px] leading-7 text-[rgba(11,31,51,0.62)] md:pr-[220px]">
                  {row.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </SectionContainer>
  );
}
