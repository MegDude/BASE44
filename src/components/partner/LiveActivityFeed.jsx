import { motion } from 'framer-motion';

/**
 * LiveActivityFeed — Activity stream (one per page)
 */
export default function LiveActivityFeed({ activities = [] }) {
  return (
    <section className="border-b border-[rgba(11,31,51,0.08)] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h3 className="text-[24px] md:text-[28px] font-bold text-[#111] leading-tight">
            Live activity
          </h3>
          <p className="mt-2 text-[14px] text-muted-foreground">
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
              className="flex items-start gap-3 rounded-xl border border-[rgba(11,31,51,0.08)] bg-white/60 p-4 transition-colors hover:bg-white"
            >
              <div className="w-2 h-2 rounded-full bg-[#111] mt-2 shrink-0 animate-pulse" />

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#111]">{activity.action}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-muted-foreground">{activity.source}</span>
                  <span className="text-[11px] text-foreground/28">•</span>
                  <span className="text-[11px] text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
