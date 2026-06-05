import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * PartnerHero — Unified hero for all partner pages
 * Shows: who this is for, what they get, how they appear on map
 */
export default function PartnerHero({
  eyebrow,
  headline,
  description,
  primaryCTA,
  primaryCTAHref,
  secondaryCTA,
  secondaryCTAHref,
  stats = [],
  preview,
  alignment = 'left', // left | right
  backHref = '/partners',
  backLabel = 'Back',
}) {
  return (
    <section className="border-b border-[#0B1F33]/8 bg-white pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-5">
        <a
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 bg-transparent px-0 font-body text-[12px] font-medium text-[#0B1F33]/68 transition-colors hover:text-[#BFA46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
        >
          <span className="text-[#BFA46A]" aria-hidden="true">←</span>
          {backLabel}
        </a>
      </div>
      <div className={`max-w-7xl mx-auto px-5 grid grid-cols-1 gap-12 items-center ${preview ? 'md:grid-cols-2' : ''}`}>
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={alignment === 'right' ? 'md:order-2' : ''}
        >
          {eyebrow && (
            <div className="mb-4 text-[11px] font-medium uppercase tracking-normal text-[#BFA46A] md:text-[13px]">
              {eyebrow}
            </div>
          )}

          <h1 className="mb-5 font-heading text-[52px] font-medium leading-[0.95] tracking-[-0.035em] text-[#0B1F33] md:text-[72px] lg:text-[96px]">
            {headline}
          </h1>

          {description && (
            <p className="mb-8 max-w-lg font-body text-[16px] leading-[1.6] text-[#0B1F33]/66 md:text-[18px]">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="mb-8 flex flex-nowrap items-center gap-6 overflow-x-auto pb-1">
            {primaryCTA && (
              <a
                href={primaryCTAHref || '#'}
                className="group inline-flex h-8 shrink-0 items-center gap-2 bg-transparent px-0 font-body text-[12px] font-medium uppercase tracking-normal text-[#0B1F33] shadow-none transition-colors hover:text-[#BFA46A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
              >
                {primaryCTA}
                <ArrowRight className="h-3.5 w-3.5 text-[#BFA46A] transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTAHref || '#'}
                className="group inline-flex h-8 shrink-0 items-center gap-2 bg-transparent px-0 font-body text-[12px] font-medium uppercase tracking-normal text-[#0B1F33]/62 shadow-none transition-colors hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
              >
                {secondaryCTA}
                <ArrowRight className="h-3.5 w-3.5 text-[#BFA46A] transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
          </div>

          {/* Stats strip */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="font-heading text-[24px] font-medium leading-none text-[#0B1F33]">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-normal text-[#425466]">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={alignment === 'right' ? 'md:order-1' : ''}
          >
            {preview}
          </motion.div>
        )}
      </div>
    </section>
  );
}
