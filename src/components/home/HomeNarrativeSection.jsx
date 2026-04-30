import { motion } from "framer-motion";

export default function HomeNarrativeSection() {
  return (
    <section className="border-t border-[hsl(218,20%,88%)] bg-white px-6 py-14 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
              Downtown, in one place
            </span>
            <h2 className="font-heading text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-[38px]">
              You live downtown but expect it to be easier.
            </h2>
            <p className="mb-5 mt-5 text-[13px] leading-relaxed text-foreground/60">
              Easier to navigate. Easier to connect. More useful day to day. Instead, everything you want is spread across too many places.
            </p>
            <p className="text-[13px] italic leading-relaxed text-foreground/50">
              Google for restaurants. Instagram for events. Text three friends to find the best happy hour.
            </p>
            <div className="my-6 h-px bg-[hsl(218,20%,90%)]" />
            <p className="text-sm leading-relaxed text-foreground/80">
              Downtown Perks fixes that. Because the problem isn't what to do next — it's the effort it takes to decide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="space-y-6 md:pt-6"
          >
            <div>
              <h3 className="mb-3 font-heading text-2xl font-medium leading-[1.1] tracking-tight text-foreground">
                Search less. Do more.
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/60">
                Downtown Perks brings places, events, and perks together so it's easier to decide what to do next. A simple live map for people who live downtown — and the businesses that want to meet them there.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-heading text-xl font-medium leading-[1.1] tracking-tight text-foreground">
                One map. Everything nearby.
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/60">
                Places, plans, and perks in one simple view. No app downloads. No account setup. No switching between apps. No piecing things together. Just what matters, in one place.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
