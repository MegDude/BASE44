import { motion } from 'framer-motion';

/**
 * HowItWorksRail — 4-5 step process, visual + text
 */
export default function HowItWorksRail({ steps = [] }) {
  return (
    <section className="border-b border-[rgba(11,31,51,0.08)] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              {/* Visual */}
              <div className="mb-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(11,31,51,0.08)] bg-[var(--dp-surface-base)] text-[24px] shadow-[0_10px_20px_rgba(11,31,51,0.04)]">
                  {step.icon}
                </div>
                <div className="text-[14px] font-bold text-[#111]">{step.title}</div>
                {step.description && (
                  <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(100%+8px)] hidden h-0.5 w-[calc((100vw-200px)/5-24px)] bg-gradient-to-r from-[rgba(11,31,51,0.12)] to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
