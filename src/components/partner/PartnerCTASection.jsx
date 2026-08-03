import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerCTASection — Closing CTA block for all pages
 */
export default function PartnerCTASection({ headline, description, primaryCTA, primaryHref, secondaryLink }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[32px] md:text-[44px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-5">
            {headline}
          </h2>

          {description && (
            <p className="text-[16px] text-[#425466] mb-8 max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex flex-nowrap justify-center gap-6 overflow-x-auto pb-1">
            {primaryCTA && (
              <a
                href={primaryHref || '#'}
                className="group inline-flex h-8 shrink-0 items-center gap-2 bg-transparent px-0 font-body text-[12px] font-bold uppercase tracking-normal text-[#0B1F33] shadow-none transition-colors hover:text-[#A98B4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B4A]"
              >
                {primaryCTA}
                <ArrowRight className="h-3.5 w-3.5 text-[#A98B4A] transition-transform group-hover:translate-x-0.5" />
              </a>
            )}

            {secondaryLink && (
              <a
                href={secondaryLink.href || '#'}
                className="group inline-flex h-8 shrink-0 items-center gap-2 bg-transparent px-0 font-body text-[12px] font-bold uppercase tracking-normal text-[#0B1F33]/62 shadow-none transition-colors hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B4A]"
              >
                {secondaryLink.label}
                <ArrowRight className="h-3.5 w-3.5 text-[#A98B4A]/80 transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
