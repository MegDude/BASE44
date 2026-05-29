import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-system";

/**
 * StatGrid — Unified stats/metrics display for proof, KPIs, performance
 * Items: { label, value, change?, positive? }
 */
export default function StatGrid({
  items = [],
  columns = 3,
  variant = "card", // card | glass | minimal
}) {
  const gridClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    6: "md:grid-cols-2 lg:grid-cols-3",
  }[columns] || "md:grid-cols-3";

  const surfaceClass = {
    card: "border border-border/40 bg-white rounded-lg p-5",
    glass: "bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg p-5",
    minimal: "p-5",
  }[variant];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridClass} gap-4`}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className={surfaceClass}
        >
          <div className={`${TYPOGRAPHY.uiSmall} text-primary/70 mb-2`}>
            {item.label}
          </div>

          <div className="flex items-baseline gap-2">
            <div className={`${TYPOGRAPHY.sectionHeadline} text-foreground text-2xl md:text-3xl`}>
              {item.value}
            </div>

            {item.change && (
              <span className={`text-[12px] font-medium ${item.positive ? "text-[#B38F4F]" : "text-[#0B1F33]/58"}`}>
                {item.positive ? "↑" : "↓"} {item.change}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}