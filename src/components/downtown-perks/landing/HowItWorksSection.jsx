import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, Smartphone, MapPin, Sparkles } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    step: "01",
    title: "Scan",
    description: "Find a QR code in your building lobby or at a participating venue. One scan starts your journey.",
  },
  {
    icon: Smartphone,
    step: "02",
    title: "Activate",
    description: "A quick SMS flow — your name, your building. No app download. Your perks card is live in seconds.",
  },
  {
    icon: MapPin,
    step: "03",
    title: "Discover",
    description: "Open the interactive map. See what's happening near you right now — venues, events, wellness, dining.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Experience",
    description: "Flash your card. Unlock member perks. Meet neighbors at events. Downtown starts working for you.",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 bg-card/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-widest">
            How It Works
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-heading text-3xl md:text-5xl font-bold text-center mb-20 leading-tight"
        >
          From scan to
          <span className="text-primary"> connected</span>
          <br />
          in under 60 seconds.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className="relative flex gap-5 p-6 rounded-2xl border border-border hover:border-primary/30 bg-card transition-all duration-300 group"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <span className="text-primary/50 font-heading text-xs font-bold tracking-widest">
                  STEP {step.step}
                </span>
                <h3 className="font-heading text-xl font-bold mt-1 mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}