import SectionShell from "@/components/shared/SectionShell";
import FAQAccordion from "@/components/FAQAccordion";

export default function PartnerFAQ({ copy, items }) {
  return (
    <SectionShell id="faq" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="border-t border-[rgba(15,23,42,0.08)]">
      <div className="rounded-[28px] border border-[rgba(15,23,42,0.10)] bg-white px-6 py-4">
        <FAQAccordion items={items} />
      </div>
    </SectionShell>
  );
}
