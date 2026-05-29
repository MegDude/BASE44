import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { number: "50K+", label: "Residents", detail: "stacked in downtown high-rises" },
  { number: "500+", label: "Local businesses", detail: "competing for attention" },
  { number: "0", label: "Shared layer", detail: "connecting any of them — until now" },
];

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-5">
      <div className="max-w-5xl mx-auto">

        {/* Editorial label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em]">
            The Gap
          </span>
        </motion.div>

        {/* Main statement — editorial, not promotional */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-heading text-4xl md:text-4xl font-medium leading-[1.15] tracking-normal mb-6 max-w-3xl"
        >
          You live in one of the most walkable parts of the city.
          <br />
          <span className="text-muted-foreground font-normal italic">
            And still feel like you're doing it alone.
          </span>
        </motion.h2>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-border/60 max-w-3xl mb-16"
        />

        {/* Stats — horizontal, clean */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
              className="py-8 sm:px-5 first:pl-0 last:pr-0"
            >
              <div className="font-heading text-4xl font-medium text-primary mb-2 tracking-normal">
                {stat.number}
              </div>
              <div className="text-foreground text-[13px] font-medium mb-1">{stat.label}</div>
              <div className="text-muted-foreground text-[13px] leading-relaxed">{stat.detail}</div>
            </motion.div>
          ))}
        </div>

        {/* Resolution */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-16 text-muted-foreground text-[14px] border-l-2 border-primary/40 pl-5 max-w-lg leading-relaxed"
        >
          Downtown has proximity without connection.
          <span className="block mt-1 text-foreground font-medium">
            Downtown Perks changes that.
          </span>
        </motion.p>
      </div>
    </section>
  );
}