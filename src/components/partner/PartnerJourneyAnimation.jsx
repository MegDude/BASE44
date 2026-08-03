import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgePercent, BarChart3, CalendarDays, MapPin, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const partnerSteps = [
  {
    number: "01",
    title: "Choose your entry point.",
    label: "Start partner setup",
    copy: "Pick the places people will find you: map placement, QR surfaces, events, offers, or a district moment.",
    image: "/images/buildings/lobby-to-street-arrival.png",
    icon: QrCode,
  },
  {
    number: "02",
    title: "Show up on the map.",
    label: "Map visibility",
    copy: "Your listing, offer, event, or public moment appears where nearby residents and visitors are already deciding what to do.",
    image: "/images/splash/walkable-map.png",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Give people a reason to act.",
    label: "Offer or event",
    copy: "Connect the moment to something useful: a perk, RSVP, visit prompt, welcome flow, or local activation.",
    image: "/images/restaurants/bangers-bar.webp",
    icon: CalendarDays,
  },
  {
    number: "04",
    title: "Make the action simple.",
    label: "Scan, save, RSVP",
    copy: "People can scan, save, RSVP, redeem, or show access without another complicated system getting in the way.",
    image: "/images/splash/resident-access.jpeg",
    icon: BadgePercent,
  },
  {
    number: "05",
    title: "See what is worth doing next.",
    label: "What worked",
    copy: "Scans, saves, RSVPs, redemptions, and repeat activity help you decide what to keep, scale, or adjust.",
    image: "/images/splash/walkable-map.png",
    icon: BarChart3,
  },
];

export default function PartnerJourneyAnimation({ id = "partner-journey", className = "", initialStep = 1 }) {
  const reduceMotion = useReducedMotion();
  const safeInitialStep = Math.min(Math.max(initialStep, 0), partnerSteps.length - 1);
  const [activeStep, setActiveStep] = useState(safeInitialStep);
  const active = partnerSteps[activeStep];

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % partnerSteps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section id={id} className={cn("relative overflow-hidden bg-white px-5 py-14 text-[#0B1F33] md:px-8 md:py-20", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(191,164,106,0.16),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-[#BFA46A] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
            Partner operating layer
          </p>
          <h2 className="font-heading text-[42px] font-medium leading-[0.96] tracking-[-0.035em] text-[#0B1F33] md:text-[72px]">
            Launch visibility. Measure behavior. <span className="text-[#BFA46A]">Act.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-[#425466] md:text-[18px]">
            Downtown Perks helps partners appear inside the local decisions already happening nearby, then understand which actions are worth repeating.
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
              {partnerSteps.map((step, index) => (
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

              <div className="absolute left-5 top-5 z-10 max-w-[21rem] bg-white/70 p-4 text-[#0B1F33] shadow-[0_16px_44px_rgba(11,31,51,0.08),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] sm:left-6 sm:top-6">
                <span className="text-[#BFA46A] dp-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
                  {active.label}
                </span>
                <h3 className="mt-3 font-heading text-[36px] font-medium leading-[0.96] tracking-[-0.03em] text-[#0B1F33] md:text-[50px]">
                  {active.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#425466]">
                  {active.copy}
                </p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 z-20 sm:bottom-7 sm:left-6 sm:right-6">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#0B1F33]/12" />
                  <div
                    className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#BFA46A] transition-all duration-700"
                    style={{ width: `${(activeStep / (partnerSteps.length - 1)) * 100}%` }}
                  />

                  {partnerSteps.map((step, index) => {
                    const Icon = step.icon;
                    const reached = activeStep >= index;

                    return (
                      <button
                        key={step.number}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={`relative z-10 grid h-9 w-9 place-items-center rounded-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A] sm:h-10 sm:w-10 ${
                          reached
                            ? "bg-[#0B1F33] text-[#BFA46A] shadow-[0_10px_24px_rgba(11,31,51,0.12)]"
                            : "bg-white/84 text-[#0B1F33]/42 shadow-[0_8px_20px_rgba(11,31,51,0.05)]"
                        }`}
                        aria-label={`Show partner step ${step.number}: ${step.label}`}
                        aria-pressed={activeStep === index}
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
