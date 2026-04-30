import SectionContainer from "@/components/SectionContainer";
import SectionHeader from "@/components/SectionHeader";

export default function RuleList({ items = [], title, description }) {
  return (
    <SectionContainer width="wide">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SectionHeader
          eyebrow="Product truth"
          title={title || "Everything runs through one map."}
          description={description}
        />
        <div className="border-t border-[rgba(11,31,51,0.08)]">
          {items.map((item) => (
            <div
              key={item}
              className="border-b border-[rgba(11,31,51,0.08)] py-4 text-[15px] leading-7 text-[rgba(11,31,51,0.72)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </SectionContainer>
  );
}
