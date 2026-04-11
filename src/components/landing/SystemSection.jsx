import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Unlock, Users } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "Awareness",
    question: "What's around me right now?",
    features: ["Interactive live map", "Category filters", "Proximity-based discovery"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Unlock,
    title: "Access",
    question: "Can I actually do this easily?",
    features: ["Digital perks card", "QR scan to redeem", "Frictionless entry"],
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Users,
    title: "Alignment",
    question: "Who else is doing this?",
    features: ["Curated events", "Shared activity feed", "Soft social layer"],
    color: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function SystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            The System
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-heading text-3xl md:text-5xl font-bold text-center mb-4 leading-tight"
        >
          Three layers that have
          <br />
          <span className="text-primary">never been unified.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-muted-foreground text-center text-lg max-w-xl mx-auto mb-20"
        >
          The map is the interface. The system is the product.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-500"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${pillar.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <pillar.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground italic mb-6">{pillar.question}</p>
                <ul className="space-y-3">
                  {pillar.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-secondary-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}