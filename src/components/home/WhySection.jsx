import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WhySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">
          {/* Left — problem statement */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-5">
              Downtown, in one place
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-6">
              You live downtown.
              <br />
              <em className="text-muted-foreground font-normal">It should be easier than this.</em>
            </h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Google for restaurants. Instagram for events. Text three friends to find the best happy hour. The problem isn't what to do next — it's the effort it takes to decide.
            </p>
          </motion.div>

          {/* Right — resolution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="md:pt-12"
          >
            <h3 className="font-heading text-2xl font-medium leading-[1.2] tracking-tight mb-4">
              Search less. Do more.
            </h3>
            <p className="text-muted-foreground text-[13px] leading-relaxed mb-6">
              Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
            </p>
            <div className="h-px bg-border/40 mb-6" />
            <p className="font-heading text-lg font-medium text-foreground leading-snug">
              One map. Everything nearby.
              <span className="block mt-1 text-muted-foreground text-sm font-normal font-body">No app downloads. No account setup. No switching between apps.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}