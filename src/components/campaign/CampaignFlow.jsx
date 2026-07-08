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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-[30px_1fr] gap-3 md:block"
              >
                <div className="font-heading text-[16px] font-bold leading-none text-[#A98B4A] md:text-[20px]">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{s.label}</div>
                  <div className="mt-1.5 text-[12px] leading-5 text-[#425466]">{s.description}</div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
