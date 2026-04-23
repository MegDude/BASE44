import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WhySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-[var(--dp-surface-base)] px-4 py-10 md:px-6 md:py-12">
      <div className="dp-page-shell">
        <div className="dp-band dp-band-muted grid grid-cols-1 gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="dp-eyebrow mb-4 block">
              Downtown, in one place
            </span>
            <h2 className="dp-display-section max-w-xl text-[2rem] text-foreground md:text-[2.8rem]">
              You live downtown but expect it to be easier.
            </h2>
            <p className="dp-body-copy mt-4">
              Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.
            </p>
            <p className="mt-4 text-[13px] italic leading-6 text-foreground/52 md:text-[14px]">
              Google for restaurants. Instagram for events. Text three friends to find the best happy hour.
            </p>
            <div className="dp-divider-line my-6" />
            <p className="text-sm leading-7 text-foreground/76 md:text-[15px]">
              Downtown Perks fixes that. Because the problem isn't what to do next — it's the effort it takes to decide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid gap-4 md:pt-6"
          >
            <div className="dp-card p-5 md:p-6">
              <h3 className="font-heading text-[1.55rem] font-semibold leading-[1.05] text-foreground">
                Search less. Do more.
              </h3>
              <p className="mt-3 text-[14px] leading-7 text-foreground/64">
                Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
              </p>
            </div>

            <div className="dp-card-compact bg-white/72 p-5 md:p-6">
              <h3 className="font-heading text-[1.35rem] font-semibold leading-[1.06] text-foreground">
                One map. Everything nearby.
              </h3>
              <p className="mt-3 text-[14px] leading-7 text-foreground/64">
                Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
