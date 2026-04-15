import { motion } from 'framer-motion';

/**
 * HowItWorksRail — 4-5 step process, visual + text
 */
export default function HowItWorksRail({ steps = [] }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#e8e5df]">
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
                <div className="w-16 h-16 rounded-2xl bg-[#f5f3ef] border border-[#e8e5df] flex items-center justify-center text-[24px] mb-4">
                  {step.icon}
                </div>
                <div className="text-[14px] font-bold text-[#111]">{step.title}</div>
                {step.description && (
                  <div className="text-[13px] text-[#7a746b] mt-1.5 leading-relaxed">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-[calc((100vw-200px)/5-24px)] h-0.5 bg-gradient-to-r from-[#e8e5df] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}