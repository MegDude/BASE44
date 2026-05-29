import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Unlock, Users } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "Awareness",
    question: "What's around me right now?",
    features: ["Interactive live map", "Category filters", "Proximity-based discovery"],
  },
  {
    icon: Unlock,
    title: "Access",
    question: "Can I actually do this easily?",
    features: ["Digital perks card", "QR scan to redeem", "Frictionless entry"],
  },
  {
    icon: Users,
    title: "Alignment",
    question: "Who else is doing this?",
    features: ["Curated events", "Shared activity feed", "Soft social layer"],
  },
];

export default function SystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-5 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              The System
            </span>
            <h2 className="font-heading text-4xl md:text-4xl font-medium leading-[1.1] tracking-normal">
              Three layers.
              <br />
              <em className="text-primary">Never unified.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-[14px] leading-relaxed md:pb-1"
          >
            The map is the interface. The system is the product. Awareness, access, and alignment — built into a single neighborhood layer.
          </motion.p>
        </div>

        {/* Pillars — horizontal editorial strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className="py-8 md:px-5 first:pl-0 last:pr-0 group"
            >
              <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center mb-5 group-hover:border-primary/40 transition-colors">
                <pillar.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="font-heading text-xl font-medium mb-1">{pillar.title}</div>
              <div className="text-muted-foreground text-[13px] italic mb-5">{pillar.question}</div>
              <ul className="space-y-2.5">
                {pillar.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}