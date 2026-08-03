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
            <span className="text-[11px] text-primary/70 uppercase block mb-4 text-[11px] font-bold uppercase tracking-normal">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="grid grid-cols-[34px_1fr] gap-4"
            >
              <div>
                <div className="font-heading text-[16px] font-bold leading-none text-[#A98B4A] md:text-[20px]">
                  {step.step}
                </div>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold leading-snug text-[#0B1F33]">{step.title}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-[#425466]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
