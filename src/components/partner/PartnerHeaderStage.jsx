import { motion } from "framer-motion";

export default function PartnerHeaderStage({
  eyebrow,
  title,
  description,
  metrics = [],
  actions = null,
  align = "left",
  className = "",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-[rgba(11,31,51,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,251,0.98))] p-6 shadow-[0_18px_44px_rgba(11,31,51,0.06)] md:p-8 lg:p-10 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(207,175,90,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(11,31,51,0.06),transparent_32%)]" />
      <motion.div
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-16 top-6 h-40 w-40 rounded-full border border-[rgba(207,175,90,0.16)]"
      />
      <motion.div
        animate={{ opacity: [0.22, 0.42, 0.22], y: [0, 8, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-10 top-10 h-px w-40 bg-[linear-gradient(90deg,rgba(207,175,90,0.28),transparent)]"
      />

      <div className={`relative z-10 ${isCenter ? "text-center" : "text-left"}`}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="dp-micro-label"
        >
          {eyebrow}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.04 }}
          className="dp-display-hero mt-4 max-w-5xl text-5xl md:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          className={`mt-4 text-[15px] leading-7 text-muted-foreground ${isCenter ? "mx-auto max-w-3xl" : "max-w-3xl"}`}
        >
          {description}
        </motion.p>

        {metrics.length ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.14 }}
            className={`mt-6 flex flex-wrap gap-2.5 ${isCenter ? "justify-center" : "justify-start"}`}
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.2 + index * 0.18, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white/82 px-3.5 py-2 shadow-[0_8px_18px_rgba(11,31,51,0.05)]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/42">
                  {metric.label}
                </span>
                <span className="ml-2 text-[12px] font-semibold text-foreground">{metric.value}</span>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {actions ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.18 }}
            className={`mt-8 flex flex-wrap gap-3 ${isCenter ? "justify-center" : "justify-start"}`}
          >
            {actions}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
