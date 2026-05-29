import { motion } from 'framer-motion';

/**
 * LiveActivityFeed — Activity stream (one per page)
 */
export default function LiveActivityFeed({ activities = [] }) {
  return (
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-8">
          <h3 className="text-[24px] md:text-[28px] font-bold text-[#0B1F33] leading-tight">
            Live activity
          </h3>
          <p className="text-[14px] text-[#0B1F33]/58 mt-2">
            Real-time engagement from the platform right now.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          {activities.slice(0, 8).map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-[#0B1F33]/8 bg-white/50 hover:bg-white transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-[#0B1F33] mt-2 shrink-0 animate-pulse" />

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#0B1F33]">{activity.action}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-[#0B1F33]/58">{activity.source}</span>
                  <span className="text-[11px] text-[#bbb]">•</span>
                  <span className="text-[11px] text-[#0B1F33]/58">{activity.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}