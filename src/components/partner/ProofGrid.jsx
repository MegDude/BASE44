import { motion } from 'framer-motion';

/**
 * ProofGrid — Analytics tiles (scans, visits, redemptions, etc.)
 */
export default function ProofGrid({ metrics = [] }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal">
            Proof & performance
          </h2>
          <p className="text-[15px] text-[#6f6b65] mt-3 max-w-lg">
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
              className="p-5 rounded-lg border border-[#0B1F33]/8 bg-white hover:border-[#B38F4F]/45 transition-colors"
            >
              <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#0B1F33]/50 mb-3">
                {metric.label}
              </div>
              <div className="text-[28px] md:text-[32px] font-bold text-[#0B1F33] leading-tight">
                {metric.value}
              </div>
              {metric.change && (
                <div className={`text-[12px] mt-2 ${metric.positive ? 'text-[#B38F4F]' : 'text-[#0B1F33]/58'}`}>
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