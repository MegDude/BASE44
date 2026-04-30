import SectionShell from "@/components/shared/SectionShell";
import FAQAccordion from "@/components/FAQAccordion";

export default function HomeFAQ({ copy, items }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} body="" className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <h3 className="text-[1.1rem] font-semibold text-[var(--dp-navy,#111827)]">{copy.introTitle}</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-8 text-[rgba(71,85,105,0.94)]">{copy.introBody}</p>
        </div>
        <div className="mt-6">
          <FAQAccordion items={items} defaultOpenIndex={0} />
        </div>
      </div>
    </SectionShell>
  );
}
