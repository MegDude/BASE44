import { motion } from 'framer-motion';

/**
 * HowItWorksRail — 4-5 step process, visual + text
 */
export default function HowItWorksRail({ steps = [] }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal">
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
                <div className="w-16 h-16 rounded-lg bg-[#F7F8FB] border border-[#0B1F33]/8 flex items-center justify-center text-[24px] mb-4">
                  {step.icon}
                </div>
                <div className="text-[14px] font-bold text-[#0B1F33]">{step.title}</div>
                {step.description && (
                  <div className="text-[13px] text-[#0B1F33]/58 mt-1.5 leading-relaxed">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(100%+8px)] w-[calc((100vw-200px)/5-24px)] h-0.5 bg-gradient-to-r from-[#0B1F33]/10 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}