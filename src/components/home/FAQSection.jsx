import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

const [introItem, ...accordionItems] = FAQ_HOMEPAGE;

export default function FAQSection() {
  return (
    <section className="border-t border-border/40 bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="dp-page-shell max-w-5xl">
        <div className="mb-6 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,238,0.92))] p-6 shadow-[0_18px_38px_rgba(11,26,43,0.06)] md:p-8">
          <div className="dp-micro-label mb-4">FAQs</div>
          <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <h2 className="font-heading text-[2rem] font-medium leading-[1.04] tracking-[-0.04em] text-foreground md:text-[2.7rem]">
                {introItem.question}
              </h2>
            </div>
            <p className="text-[14px] leading-7 text-muted-foreground">{introItem.answer}</p>
          </div>
        </div>

        <FAQAccordionBlock
          sectionEyebrow=""
          sectionTitle="Questions people ask before they start."
          sectionIntro="This covers resident access, partner pricing, launch timing, what gets tracked, and how the map actually works."
          items={accordionItems}
          styleVariant="default"
          showNumbers={false}
          allowMultipleOpen={false}
          defaultOpenIndex={0}
          pageType="homepage"
          backgroundVariant="light"
        />
      </div>
    </section>
  );
}
