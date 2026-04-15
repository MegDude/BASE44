import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerCTASection — Closing CTA block for all pages
 */
export default function PartnerCTASection({ headline, description, primaryCTA, primaryHref, secondaryLink }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#e8e5df]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[32px] md:text-[44px] font-bold text-[#111] leading-tight tracking-tight mb-5">
            {headline}
          </h2>

          {description && (
            <p className="text-[16px] text-[#6f6b65] mb-8 max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {primaryCTA && (
              <a
                href={primaryHref || '#'}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {secondaryLink && (
              <a
                href={secondaryLink.href || '#'}
                className="inline-flex items-center h-12 px-6 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors"
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