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
    <section className="bg-background pt-16 pb-12 md:pt-24 md:pb-16 border-b border-border/70">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={alignment === 'right' ? 'md:order-2' : ''}
        >
          {eyebrow && (
            <div className="text-[11px] font-bold uppercase tracking-[.16em] text-[#B7934E] mb-3">
              {eyebrow}
            </div>
          )}

          <h1 className="text-[34px] md:text-[48px] font-bold text-foreground leading-[1.02] tracking-tight mb-4">
            {headline}
          </h1>

          {description && (
            <p className="text-[15px] text-foreground/72 leading-7 mb-6 max-w-lg">
              {description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {primaryCTA && (
              <a
                href={primaryCTAHref || '#'}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary/92"
              >
                {primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCTA && (
              <a
                href={secondaryCTAHref || '#'}
                className="inline-flex items-center h-11 px-5 rounded-full border border-border bg-white text-foreground font-semibold text-[14px] hover:bg-accent"
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
                  <div className="text-[20px] font-bold text-foreground">{stat.value}</div>
                  <div className="text-[12px] text-muted-foreground mt-1">{stat.label}</div>
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