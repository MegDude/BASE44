import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * CampaignConcept — Campaign brief visual module
 * Shows: objective, audience, placements, offer, metrics
 */
export default function CampaignConcept({
  name,
  objective,
  audience,
  placements,
  offer,
  keyMetrics,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Campaign concept</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">{name}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: brief */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 }}>
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">Objective</div>
                <p className="text-[14px] text-foreground">{objective}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">Target audience</div>
                <p className="text-[14px] text-foreground">{audience}</p>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">Offer / value</div>
                <p className="text-[14px] text-foreground">{offer}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: placements + metrics */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.15 }}>
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">Primary placements</div>
                <div className="space-y-2">
                  {placements?.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span className="text-[13px] text-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">Key metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  {keyMetrics?.map((m, i) => (
                    <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-[12px] font-bold text-primary">{m.label}</div>
                      <div className="text-[13px] text-foreground mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}