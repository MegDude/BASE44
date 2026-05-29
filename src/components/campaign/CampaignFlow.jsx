import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * CampaignFlow — 4-5 step visual flow showing campaign journey
 */
export default function CampaignFlow({ steps, title, description }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-10">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">How it works</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal mb-2">{title}</h2>
          {description && <p className="text-muted-foreground text-[13px]">{description}</p>}
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div className="w-10 h-10 rounded-full border border-primary/40 bg-card flex items-center justify-center mb-4 z-10">
                  <span className="text-primary font-heading font-medium text-[13px]">{i + 1}</span>
                </div>
                <div className="font-medium text-[13px] text-foreground mb-1.5">{s.label}</div>
                <div className="text-[12px] text-muted-foreground leading-relaxed">{s.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}