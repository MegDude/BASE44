import SectionShell from "@/components/shared/SectionShell";
import FAQAccordion from "@/components/FAQAccordion";

export default function HomeFAQ({ copy, items }) {
  return (
    <SectionShell eyebrow={copy.eyebrow} title={copy.title} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white p-6">
        <h3 className="text-[1.1rem] font-semibold text-[var(--dp-navy,#111827)]">{copy.introTitle}</h3>
        <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.introBody}</p>
        <p className="mt-3 text-[14px] leading-7 text-[rgba(71,85,105,0.94)]">{copy.body}</p>
        <div className="mt-6">
          <FAQAccordion items={items} defaultOpenIndex={0} />
        </div>
      </div>
    </SectionShell>
  );
}
