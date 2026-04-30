import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";

export default function UseCaseGrid({ items = [] }) {
  return (
    <SectionContainer width="wide">
      <section>
        <SectionHeader eyebrow="Use cases" title="What people and partners actually use it for." />
        <div className="mt-8 grid gap-x-8 gap-y-6 border-t border-[rgba(11,31,51,0.08)] pt-6 md:grid-cols-2">
          {items.map((item, index) => (
            <article key={item.title} className="border-b border-[rgba(11,31,51,0.08)] pb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-[0.95rem] font-semibold text-[var(--dp-gold-deep,#A97816)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[1rem] font-semibold text-[var(--dp-navy,#0B1F33)]">{item.title}</h3>
              </div>
              <p className="mt-3 max-w-[420px] text-[14px] leading-7 text-[rgba(11,31,51,0.68)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </SectionContainer>
  );
}
