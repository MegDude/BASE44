import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, BadgePercent, CalendarDays, Coffee, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const journeySteps = [
  {
    number: "01",
    title: "What should we do?",
    label: "Start nearby",
    copy: "Someone downtown wants coffee, dinner, a workout, or something happening tonight.",
    image: "/images/residents/downtown-rooftop-evening.png",
    icon: Coffee,
  },
  {
    number: "02",
    title: "See what is close.",
    label: "Open the map",
    copy: "Downtown Perks shows nearby places, events, perks, and local favorites in one simple view.",
    image: "/images/splash/walkable-map.png",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Pick the next move.",
    label: "Choose the moment",
    copy: "Save a spot, RSVP to an event, or find a place that fits right now.",
    image: "/images/imported/perks/daydreamer-coffee-at-paseo-tower.jpg",
    icon: CalendarDays,
  },
  {
    number: "04",
    title: "Show the card or use the perk.",
    label: "Use access",
    copy: "No extra app. No complicated steps. Just find it and go.",
    image: "/images/splash/resident-access.jpeg",
    icon: BadgePercent,
  },
  {
    number: "05",
    title: "Partners see what worked.",
    label: "Local places learn",
    copy: "They can see what people saved, opened, used, and came back for.",
    image: "/images/splash/walkable-map.png",
    icon: BarChart3,
  },
];

export default function DowntownPerksHowItWorks({ id = "how-it-works", className = "", initialStep = 2 }) {
  const reduceMotion = useReducedMotion();
  const safeInitialStep = Math.min(Math.max(initialStep, 0), journeySteps.length - 1);
  const [activeStep, setActiveStep] = useState(safeInitialStep);
  const active = journeySteps[activeStep];

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % journeySteps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section id={id} className={cn("relative overflow-hidden bg-white px-5 py-14 text-[#0B1F33] md:px-8 md:py-20", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,169,106,0.16),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C8A96A]">
            How Downtown Perks works
          </p>
          <h2 className="font-heading text-[42px] font-medium leading-[0.96] tracking-[-0.035em] text-[#0B1F33] md:text-[72px]">
            Open the map. Find the moment. <span className="text-[#C8A96A]">Go.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-[#425466] md:text-[18px]">
            Downtown Perks helps residents find nearby places, events, perks, and local favorites without bouncing between apps, websites, group chats, and screenshots. For partners, it creates visibility when people nearby are already deciding where to go.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <div className="overflow-hidden rounded-md bg-white/76 shadow-[0_18px_58px_rgba(11,31,51,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md">
            <div className="relative min-h-[360px] overflow-hidden bg-white md:min-h-[440px]">
              {journeySteps.map((step, index) => (
                <img
                  key={step.title}
                  src={step.image}
                  alt=""
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 h-full w-full object-cover brightness-[1.04] contrast-[1.02] saturate-[0.9] transition-all duration-700 ${
                    activeStep === index ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"
                  }`}
                />
              ))}

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(255,255,255,0.18)),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(11,31,51,0.16))]" />

              <div className="absolute left-5 top-5 z-10 max-w-[20rem] sm:left-6 sm:top-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C8A96A]">
                  {active.label}
                </span>
                <h3 className="mt-3 font-heading text-[38px] font-medium leading-[0.96] tracking-[-0.03em] text-[#0B1F33] md:text-[52px]">
                  {active.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#0B1F33]/66">
                  {active.copy}
                </p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 z-20 sm:bottom-7 sm:left-6 sm:right-6">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#0B1F33]/12" />
                  <div
                    className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#C8A96A] transition-all duration-700"
                    style={{ width: `${(activeStep / (journeySteps.length - 1)) * 100}%` }}
                  />

                  {journeySteps.map((step, index) => {
                    const Icon = step.icon;
                    const reached = activeStep >= index;

                    return (
                      <button
                        key={step.number}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={`relative z-10 grid h-9 w-9 place-items-center rounded-sm transition-all duration-500 sm:h-10 sm:w-10 ${
                          reached
                            ? "bg-[#0B1F33] text-[#C8A96A] shadow-[0_10px_24px_rgba(11,31,51,0.12)]"
                            : "bg-white/84 text-[#0B1F33]/42 shadow-[0_8px_20px_rgba(11,31,51,0.05)]"
                        }`}
                        aria-label={`Show step ${step.number}: ${step.label}`}
                      >
                        <Icon size={15} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
