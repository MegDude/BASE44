import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            The Problem
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-heading text-3xl md:text-5xl font-bold text-center leading-tight mb-12"
        >
          You live in one of the most dense, vibrant parts of the city…
          <br />
          <span className="text-muted-foreground">
            and still feel like you're doing it alone.
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            {
              number: "50K+",
              label: "residents",
              detail: "stacked in downtown high-rises",
            },
            {
              number: "500+",
              label: "local businesses",
              detail: "competing for attention",
            },
            {
              number: "0",
              label: "shared layer",
              detail: "connecting any of them",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              className="text-center"
            >
              <div className="font-heading text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-foreground font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-muted-foreground text-sm">{stat.detail}</div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center text-muted-foreground mt-16 text-lg"
        >
          Downtown has density without connection.
          <br />
          <span className="text-foreground font-medium">
            Downtown Perks changes that.
          </span>
        </motion.p>
      </div>
    </section>
  );
}