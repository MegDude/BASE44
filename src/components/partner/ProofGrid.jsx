import { motion } from 'framer-motion';

/**
 * ProofGrid — Analytics tiles (scans, visits, redemptions, etc.)
 */
export default function ProofGrid({ metrics = [] }) {
  return (
    <section className="border-b border-[rgba(11,31,51,0.08)] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight">
            Proof & performance
          </h2>
          <p className="mt-3 max-w-lg text-[15px] text-muted-foreground">
            Real-time metrics showing how the system drives engagement across all partner types.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-[rgba(11,31,51,0.08)] bg-white p-5 transition-colors hover:border-[rgba(11,31,51,0.18)]"
            >
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">
                {metric.label}
              </div>
              <div className="text-[28px] md:text-[32px] font-bold text-[#111] leading-tight">
                {metric.value}
              </div>
              {metric.change && (
                <div className={`mt-2 text-[12px] ${metric.positive ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {metric.change}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
