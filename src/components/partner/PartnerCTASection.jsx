import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCTAFlow } from "@/components/cta/CTAFlowProvider";

/**
 * PartnerCTASection — Closing CTA block for all pages
 */
export default function PartnerCTASection({ headline, description, primaryCTA, primaryHref, primaryFlow = null, secondaryLink }) {
  const { openFlow } = useCTAFlow();

  return (
    <section className="bg-[var(--dp-surface-base)] px-4 py-2 md:px-6">
      <div className="dp-page-shell">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="dp-band dp-band-dark px-6 py-10 text-center md:px-8"
        >
          <h2 className="dp-display-section text-[30px] leading-[1.04] tracking-tight text-white md:text-[40px] mb-4">
            {headline}
          </h2>

          {description && (
            <p className="mx-auto mb-6 max-w-lg text-[15px] leading-7 text-white/72">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {primaryCTA && (
              <button
                type="button"
                onClick={() => {
                  if (primaryFlow) {
                    openFlow(primaryFlow);
                    return;
                  }
                  window.location.assign(primaryHref || "#");
                }}
                className="dp-cta-primary bg-white text-[var(--dp-navy)]"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {secondaryLink && (
              <a
                href={secondaryLink.href || '#'}
                className="dp-cta-secondary border-white/16 bg-white/10 text-white"
              >
                {secondaryLink.label}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
