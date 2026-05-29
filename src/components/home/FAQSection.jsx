import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

export default function FAQSection() {
  return (
    <FAQAccordionBlock
      sectionEyebrow="FAQs"
      sectionTitle="Questions, answered clearly"
      sectionIntro="Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first."
      items={FAQ_HOMEPAGE}
      styleVariant="split"
      showNumbers={false}
      allowMultipleOpen={false}
      defaultOpenIndex={0}
      pageType="homepage"
      backgroundVariant="light"
    />
  );
}
