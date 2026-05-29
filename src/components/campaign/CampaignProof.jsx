import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * CampaignProof — Metrics and analytics module
 * Tied to the specific campaign model
 */
export default function CampaignProof({ headline, metrics, secondaryMetrics }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="font-heading text-2xl md:text-3xl font-medium tracking-normal mb-8">
          {headline}
        </motion.h2>

        {/* Primary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {metrics?.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06 }}
              className="p-5 rounded-lg border border-border/50 bg-card/40 text-center"
            >
              <div className="font-heading text-2xl font-medium text-foreground">{m.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Secondary metrics */}
        {secondaryMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {secondaryMetrics?.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="p-4 rounded-lg border border-border/40 bg-card/20"
              >
                <div className="font-heading text-lg font-medium text-foreground">{m.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{m.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}