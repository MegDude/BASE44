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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-5 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="grid grid-cols-[30px_1fr] gap-3 md:block"
            >
              <div className="flex items-start gap-2 font-heading text-[16px] font-bold leading-none text-[#A98B4A] md:text-[20px]">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {step.icon && <span className="mt-0.5 text-[13px] md:hidden">{step.icon}</span>}
              </div>
              <div>
                <div className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{step.title}</div>
                {step.description && (
                  <div className="mt-1.5 text-[12px] leading-5 text-[#425466]">
                    {step.description}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
