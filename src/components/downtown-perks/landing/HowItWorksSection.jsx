import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, Smartphone, MapPin, Sparkles } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    step: "01",
    title: "Scan",
    description: "Find a QR code in your building lobby or at a participating venue. One scan starts your membership.",
  },
  {
    icon: Smartphone,
    step: "02",
    title: "Activate",
    description: "A quick SMS flow — your name, your building. No app download. Your card is live in seconds.",
  },
  {
    icon: MapPin,
    step: "03",
    title: "Discover",
    description: "Open the live map. See what's happening near you — venues, events, wellness, dining.",
  },
  {
    icon: Sparkles,
    step: "04",
    title: "Experience",
    description: "Flash your card. Unlock perks. Meet neighbors. Downtown starts working for you.",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-5 border-t border-border/40">
      <div className="max-w-5xl mx-auto">

        {/* Header — split editorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] font-medium text-primary/70 uppercase tracking-[0.16em] block mb-4">
              How It Works
            </span>
            <h2 className="font-heading text-4xl md:text-4xl font-medium leading-[1.1] tracking-normal">
              Scan to connected
              <br />
              <em className="text-primary">in 60 seconds.</em>
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-[14px] leading-relaxed"
          >
            No app store. No account setup. A single QR code starts your entire downtown membership.
          </motion.p>
        </div>

        {/* Steps — numbered, clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className={`flex gap-6 p-8 border-border/40 ${
                i % 2 === 0 ? "md:border-r" : ""
              } ${i < 2 ? "border-b" : ""}`}
            >
              <div className="flex-shrink-0">
                <div className="font-heading text-[11px] font-medium text-primary/50 tracking-[0.12em] mb-3">
                  {step.step}
                </div>
                <div className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="pt-5">
                <h3 className="font-heading text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}