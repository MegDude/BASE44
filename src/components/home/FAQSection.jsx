import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";
import { ROUTES } from "@/lib/routes";

export default function FAQSection() {
  return (
    <section className="border-t border-border/40 bg-background px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.6fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="md:sticky md:top-28"
          >
            <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.16em] text-primary/70">
              FAQs
            </span>
            <h2 className="mb-5 font-heading text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-4xl">
              Questions, answered clearly
            </h2>
            <p className="mb-8 text-[13px] leading-relaxed text-muted-foreground">
              Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first.
            </p>
            <Link
              to={ROUTES.about}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-6 py-3 text-sm font-medium text-foreground/70 transition-all hover:border-border hover:text-foreground"
            >
              Learn more about Downtown Perks
            </Link>
          </motion.div>

          <div>
            <FAQAccordionBlock
              sectionEyebrow=""
              sectionTitle=""
              sectionIntro=""
              items={FAQ_HOMEPAGE}
              styleVariant="default"
              showNumbers={false}
              allowMultipleOpen={false}
              defaultOpenIndex={0}
              pageType="homepage"
              backgroundVariant="light"
              className="border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
