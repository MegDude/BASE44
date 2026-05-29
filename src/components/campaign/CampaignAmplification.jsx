import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Users, Zap, TrendingUp } from 'lucide-react';

/**
 * CampaignAmplification — Why Downtown Perks improves performance
 * Partner-specific explanation of how the system amplifies
 */
export default function CampaignAmplification({ points }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const icons = {
    map: MapPin,
    proximity: Users,
    timing: Zap,
    growth: TrendingUp,
  };

  return (
    <section ref={ref} className="py-10 px-5 border-t border-border/40">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-8">
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-3">Amplification</span>
          <h2 className="font-heading text-2xl md:text-3xl font-medium leading-[1.2] tracking-normal">Why it performs better in Downtown Perks</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points?.map((p, i) => {
            const Icon = icons[p.icon] || MapPin;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary/60 shrink-0 mt-0.5" />
                  <h3 className="font-medium text-[14px] text-foreground">{p.title}</h3>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{p.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}