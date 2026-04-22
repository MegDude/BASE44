import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerCTASection — Closing CTA block for all pages
 */
export default function PartnerCTASection({
  headline,
  description,
  primaryCTA,
  primaryHref,
  secondaryLink,
  footerText,
}) {
  return (
    <section className="py-12 md:py-16 border-b border-border/70 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[30px] md:text-[40px] font-bold text-foreground leading-[1.04] tracking-tight mb-4">
            {headline}
          </h2>

          {description && (
            <p className="text-[15px] text-foreground/72 mb-6 max-w-lg mx-auto leading-7">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {primaryCTA && (
              <a
                href={primaryHref || '#'}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary/92"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {secondaryLink && (
              <a
                href={secondaryLink.href || '#'}
                className="inline-flex items-center h-11 px-5 rounded-full border border-border bg-white text-foreground font-semibold text-[14px] hover:bg-accent"
              >
                {secondaryLink.label}
              </a>
            )}
          </div>
          {footerText ? (
            <p className="mt-5 text-[12px] text-foreground/56">
              {footerText}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
