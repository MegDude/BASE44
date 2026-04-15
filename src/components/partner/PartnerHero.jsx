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
    <section className="pt-20 pb-16 md:pt-32 md:pb-24 border-b border-[#e8e5df]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={alignment === 'right' ? 'md:order-2' : ''}
        >
          {eyebrow && (
            <div className="text-[12px] font-bold uppercase tracking-[.12em] text-[#8d887f] mb-4">
              {eyebrow}
            </div>
          )}

          <h1 className="text-[40px] md:text-[52px] font-bold text-[#111] leading-tight tracking-tight mb-5">
            {headline}
          </h1>

          {description && (
            <p className="text-[16px] text-[#4a463f] leading-relaxed mb-8 max-w-lg">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {primaryCTA && (
              <a
                href={primaryCTAHref || '#'}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-[#111] text-white font-semibold text-[14px] hover:bg-[#2a2a2a] transition-colors"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTAHref || '#'}
                className="inline-flex items-center h-12 px-6 rounded-2xl border border-[#e8e5df] bg-white text-[#111] font-semibold text-[14px] hover:bg-[#f5f4f2] transition-colors"
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
                  <div className="text-[20px] font-bold text-[#111]">{stat.label}</div>
                  <div className="text-[12px] text-[#8d887f] mt-1">{stat.value}</div>
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