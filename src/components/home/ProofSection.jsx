import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Activity, MapPinned, Target } from "lucide-react";
import { Link } from "react-router-dom";

const proofColumns = [
  {
    label: "Broad targeting",
    icon: Activity,
    metric: "0.6%",
    detail: "Wide reach, weak intent. People see it, but timing and proximity do not line up.",
  },
  {
    label: "Corridor targeting",
    icon: MapPinned,
    metric: "3.8–4.2%",
    detail: "Rainey corridor engagement when people are already nearby, already walking, and already deciding.",
    featured: true,
  },
  {
    label: "Event targeting",
    icon: Target,
    metric: "2.1%",
    detail: "Strong for planned moments, but still narrower than a live map people can return to daily.",
  },
];

export default function ProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-t border-[hsl(218,20%,88%)] bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 grid grid-cols-1 items-end gap-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
              Proof System
            </span>
            <h2 className="font-heading text-3xl font-medium leading-[1.1] tracking-tight text-foreground md:text-[38px]">
              Better timing beats broader reach.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[13px] leading-relaxed text-foreground/60"
          >
            Downtown Perks is designed around measurable local behavior. The point is not to flood the corridor with impressions. The point is to help residents act when they are close enough to do something with the information.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {proofColumns.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
                className={`rounded-[24px] border p-6 shadow-[0_1px_8px_rgba(14,28,54,.04)] transition-all ${
                  item.featured
                    ? "border-primary/35 bg-[hsl(42,24%,97%)] shadow-[0_12px_28px_rgba(14,28,54,.08)]"
                    : "border-[hsl(218,20%,88%)] bg-white"
                }`}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(218,20%,88%)] bg-white">
                    <Icon className={`h-4 w-4 ${item.featured ? "text-primary" : "text-foreground/55"}`} />
                  </div>
                  {item.featured && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                      Highlight
                    </span>
                  )}
                </div>

                <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/45">
                  {item.label}
                </div>
                <div className="font-heading text-[34px] leading-none text-foreground">{item.metric}</div>
                <p className="mt-3 text-[13px] leading-relaxed text-foreground/60">{item.detail}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-col gap-4 rounded-[24px] border border-[hsl(218,20%,88%)] bg-[hsl(42,24%,96%)] p-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/45">
              Corridor readout
            </div>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-foreground/60">
              Rainey is the current proof point: a tighter geography, a clearer decision context, and a stronger engagement band than broad awareness campaigns can typically deliver.
            </p>
          </div>
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90"
          >
            See partnership fit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}