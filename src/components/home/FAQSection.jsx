import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOME } from "@/lib/faq-data";

export default function FAQSection() {
  return (
    <FAQAccordionBlock
      sectionEyebrow="FAQ"
      sectionTitle="Questions, answered simply."
      sectionIntro="Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first."
      items={FAQ_HOME}
      styleVariant="split"
      showNumbers={true}
      allowMultipleOpen={false}
      defaultOpenIndex={0}
      ctaLabel="Learn more about Downtown Perks"
      ctaHref="/downtown-perks/about"
    />
  );
}