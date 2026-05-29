import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * CampaignHero — Reusable hero module for all campaign pages
 * Receives campaign-specific copy + metrics
 */
export default function CampaignHero({
  eyebrow,
  headline,
  description,
  metrics,
  cta,
  ctaHref,
  secondaryCta,
  secondaryCtaHref,
  previewContent,
}) {
  return (
    <section className="pt-32 pb-16 px-5 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: copy + proof */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              {eyebrow}
            </span>
            <h1 className="font-heading text-4xl md:text-4xl font-medium leading-[1.05] tracking-normal mb-5">
              {headline}
            </h1>
            <p className="text-muted-foreground text-[14px] leading-relaxed mb-8 max-w-lg">{description}</p>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={ctaHref || '#'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-[13px] hover:bg-primary/90 transition-all shadow-md shadow-primary/15"
              >
                {cta} <ArrowRight className="w-4 h-4" />
              </a>
              {secondaryCta && (
                <a
                  href={secondaryCtaHref || '#'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border/70 text-foreground/70 font-medium text-[13px] hover:text-foreground transition-all"
                >
                  {secondaryCta}
                </a>
              )}
            </div>

            {/* Proof strip */}
            {metrics && (
              <div className="flex flex-wrap gap-4">
                {metrics.map((m, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="font-heading text-2xl font-medium text-foreground">{m.value}</div>
                    <div className="text-[11px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: preview module */}
          {previewContent && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden">{previewContent}</div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}