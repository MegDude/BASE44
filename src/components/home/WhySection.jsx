import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WhySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

          {/* Left — problem */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-5">
              Downtown, in one place
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-medium leading-[1.15] tracking-tight mb-5">
              You live downtown but expect it to be easier.
            </h2>
            <p className="text-muted-foreground text-[13px] leading-relaxed mb-5">
              Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.
            </p>
            <p className="text-muted-foreground text-[13px] leading-relaxed italic">
              Google for restaurants. Instagram for events. Text three friends to find the best happy hour.
            </p>
            <div className="h-px bg-border/40 my-6" />
            <p className="text-foreground text-sm leading-relaxed">
              Downtown Perks fixes that. Because the problem isn't what to do next — it's the effort it takes to decide.
            </p>
          </motion.div>

          {/* Right — resolution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="md:pt-8 space-y-8"
          >
            <div>
              <h3 className="font-heading text-2xl font-medium leading-[1.2] tracking-tight mb-3">
                Search less. Do more.
              </h3>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-xl font-medium leading-[1.2] tracking-tight mb-3">
                One map. Everything nearby.
              </h3>
              <p className="text-muted-foreground text-[13px] leading-relaxed">
                Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}