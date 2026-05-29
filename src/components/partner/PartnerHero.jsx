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
}) {
  return (
    <section className="pt-20 pb-16 md:pt-32 md:pb-24 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={alignment === 'right' ? 'md:order-2' : ''}
        >
          {eyebrow && (
            <div className="text-[12px] font-bold uppercase tracking-[.12em] text-[#0B1F33]/50 mb-4">
              {eyebrow}
            </div>
          )}

          <h1 className="text-[40px] md:text-[52px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-5">
            {headline}
          </h1>

          {description && (
            <p className="text-[16px] text-[#0B1F33]/70 leading-relaxed mb-8 max-w-lg">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {primaryCTA && (
              <a
                href={primaryCTAHref || '#'}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0B1F33] text-white font-semibold text-[14px] hover:bg-[#081521] transition-colors"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTAHref || '#'}
                className="inline-flex items-center h-10 px-5 rounded-lg border border-[#0B1F33]/8 bg-white text-[#0B1F33] font-semibold text-[14px] hover:bg-[#F7F8FB] transition-colors"
              >
                {secondaryCTA}
              </a>
            )}
          </div>

          {/* Stats strip */}
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-[20px] font-bold text-[#0B1F33]">{stat.label}</div>
                  <div className="text-[12px] text-[#0B1F33]/50 mt-1">{stat.value}</div>
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