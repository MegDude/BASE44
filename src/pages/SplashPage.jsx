import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BadgePercent,
  CalendarDays,
  Coffee,
  MapPin,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/downtown-austin-drone-cinematic.mp4";

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
    image: "/images/map-entities/perks/partner_coffee_shop_1779052868356.png",
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
    copy: "They can see useful signals like saves, RSVPs, scans, and redemptions.",
    image: "/images/splash/walkable-map.png",
    icon: BarChart3,
  },
];

function EditorialReveal({ children, className = "", delay = 0, amount = 0.22 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(5px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.56, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function JourneyNarrative() {
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const active = journeySteps[activeStep];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % journeySteps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden bg-white px-5 py-14 text-[#0B1F33] md:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179,143,79,0.16),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[840px]"
        >
          <p className="mb-5 font-body text-[11px] font-bold uppercase tracking-[0.24em] text-[#B38F4F] md:text-[12px]">
            How Downtown Perks Works
          </p>
          <h2 className="max-w-[12ch] font-heading text-[58px] font-semibold leading-[0.9] tracking-[-0.045em] text-[#0B1F33] max-[420px]:text-[48px] md:text-[92px] md:leading-[0.88] lg:text-[104px]">
            <span className="block">Open The Map.</span>
            <span className="block text-[#B38F4F]">Find The Moment. Go.</span>
          </h2>
          <p className="mt-8 max-w-[790px] font-body text-[20px] font-light leading-[1.7] tracking-[-0.005em] text-[#6D7886] md:text-[30px] md:leading-[1.62]">
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
          <div className="grid overflow-hidden rounded-md bg-white/76 shadow-[0_18px_58px_rgba(11,31,51,0.06),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md lg:grid-cols-[1.08fr_0.92fr]">
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
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F]">
                  {active.label}
                </span>
                <h3 className="mt-3 font-heading text-[38px] font-medium leading-[0.96] tracking-[-0.03em] text-[#0B1F33] md:text-[52px]">
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
                    className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#B38F4F] transition-all duration-700"
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
                            ? "bg-[#0B1F33] text-[#B38F4F] shadow-[0_10px_24px_rgba(11,31,51,0.12)]"
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

            <div className="flex flex-col justify-center bg-white/78 p-5 text-[#0B1F33] backdrop-blur-[18px] md:p-8">
              <div className="mb-5 flex w-fit items-center gap-2 bg-transparent text-[10px] font-bold uppercase tracking-[0.16em] text-[#425466]">
                <ActiveIcon size={15} className="text-[#B38F4F]" />
                Scene {active.number}
              </div>

              <div className="space-y-1.5">
                {journeySteps.map((step, index) => {
                  const selected = index === activeStep;

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`group grid w-full grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-sm px-2.5 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                        selected ? "bg-white shadow-[0_10px_24px_rgba(11,31,51,0.055)]" : "bg-transparent hover:bg-white/70"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-sm text-[10px] font-bold ${
                          selected ? "bg-[#0B1F33] text-[#B38F4F]" : "bg-[#0B1F33]/6 text-[#0B1F33]/45"
                        }`}
                      >
                        {step.number}
                      </span>

                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#B38F4F]">
                          {step.label}
                        </span>
                        <span className="mt-0.5 block text-[13px] font-medium text-[#0B1F33]/74">
                          {step.title}
                        </span>
                      </span>

                      {selected && <ArrowRight size={14} className="text-[#B38F4F]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function SplashPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="min-h-screen overflow-hidden bg-white pt-[68px] text-[#0B1F33]">
      <AnimatePresence initial={false}>
        {showIntro && (
          <motion.section
            className="fixed inset-0 z-[900] bg-[#0B1F33] text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Downtown Perks opening animation"
          >
            <div className="absolute inset-0 bg-[#0B1F33]" />
            <div className="dp-intro-fallback absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(179,143,79,0.16),transparent_34%),radial-gradient(circle_at_74%_68%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,#0B1F33,#0B1F33)]" />
            <div className="dp-intro-sheen absolute inset-y-0 left-[-28%] w-[42%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)] blur-2xl" />
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              onCanPlay={(event) => {
                event.currentTarget.play().catch(() => {});
              }}
              onEnded={() => setShowIntro(false)}
            />
            <div className="absolute inset-0 bg-[#0B1F33]/42" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,31,51,0.86),rgba(11,31,51,0.18)_48%,rgba(11,31,51,0.62))]" />

            <div className="absolute left-4 right-4 top-[84px] z-10 flex justify-end md:left-6 md:right-6">
              <button
                type="button"
                onClick={() => setShowIntro(false)}
                className="inline-flex h-9 items-center px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:text-white"
              >
                Skip
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-5 pb-8 md:pb-12">
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-6xl"
              >
                <div className="inline-flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.24em] text-[#B38F4F] md:text-[12px]">
                  <Sparkles className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Downtown Perks
                </div>
                <h1 className="mt-7 max-w-[10ch] font-heading text-[58px] font-semibold leading-[0.88] tracking-[-0.045em] text-white max-[420px]:text-[50px] md:text-[94px] lg:text-[108px]">
                  <span className="block">Where Downtown</span>
                  <span className="block text-[#B38F4F]">Meets You</span>
                </h1>
                <p className="mt-7 max-w-[42rem] font-body text-[22px] font-light leading-[1.55] tracking-[-0.01em] text-[#DCE3EB] md:text-[32px] md:leading-[1.5]">
                  Built for the people who actually live downtown — and the businesses that keep it interesting.
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="relative bg-white px-5 py-14 md:px-8 md:py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <video className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" src={VIDEO_SRC} autoPlay muted loop playsInline preload="metadata" />
          <div className="absolute inset-0 bg-white/86" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(255,255,255,0.80),rgba(255,255,255,1))]" />
          <div className="absolute left-[4%] top-[18%] h-56 w-56 rounded-full bg-white/72 blur-3xl" />
          <div className="absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-white/52 blur-[82px]" />
          <div className="absolute bottom-[8%] right-[16%] h-64 w-64 rounded-full bg-[#0B1F33]/10 blur-3xl" />
          <div className="absolute left-1/2 top-[46%] h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/34 blur-[92px]" />
        </div>

        <div className="relative mx-auto max-w-[900px] text-left">
          <EditorialReveal
            amount={0.28}
            className="max-w-[840px]"
          >
            <div className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-[#B38F4F] md:text-[12px]">
              Live Discovery
            </div>
            <h1 className="mt-7 max-w-[13ch] font-heading text-[58px] font-semibold leading-[0.9] tracking-[-0.045em] text-[#0B1F33] max-[420px]:text-[48px] max-[420px]:leading-[0.92] md:text-[92px] md:leading-[0.88] lg:text-[104px]">
              <span className="block">More Charm Than A</span>
              <span className="block text-[#B38F4F]">Biscuit With Honey.</span>
            </h1>
            <p className="mt-8 max-w-[760px] font-body text-[28px] font-light leading-[1.52] tracking-[-0.01em] text-[#5F6B7A] md:text-[36px] md:leading-[1.58]">
              Downtown Perks brings the heat — and the hospitality.
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-9 max-w-[790px] space-y-6"
            delay={0.04}
            amount={0.24}
          >
            <p className="font-body text-[20px] font-light leading-[1.7] tracking-[-0.005em] text-[#6D7886] md:text-[30px] md:leading-[1.62]">
              Built for the folks who still call it Town Lake, know the shortcut through the alley off South Congress, and somehow always know where happy hour starts before everyone else gets there.
            </p>
            <p className="font-body text-[20px] font-light leading-[1.7] tracking-[-0.005em] text-[#6D7886] md:text-[30px] md:leading-[1.62]">
              For the people planning around rooftop weather, happy hour, workout classes, taco runs, live music, and “just one drink” that turns into the whole night.
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            delay={0.06}
            amount={0.2}
          >
            <Link
              to="/residents"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 text-[12px] font-medium tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Start as resident
              <ArrowRight className="ml-2 h-4 w-4 text-[#B38F4F]" />
            </Link>
            <Link
              to="/partners"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-[12px] font-medium tracking-[0.08em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] transition hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Start as partner
            </Link>
          </EditorialReveal>
        </div>
      </section>

      <JourneyNarrative />

      <section className="relative bg-white px-5 pb-0 pt-12 md:px-8 md:pb-0 md:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179, 143, 79, 0.08),transparent)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-[720px] text-left">
            <EditorialReveal
              className="max-w-[720px]"
              amount={0.22}
            >
              <p className="font-heading text-[42px] font-medium leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[58px]">
                Downtown should<br />
                be easier to use.
              </p>
              <div className="mt-5 max-w-[680px] space-y-1 text-[19px] leading-[1.4] tracking-[-0.01em] text-[#0B1F33]/80 md:text-[24px] md:leading-[1.42]">
                <p>The coffee shop you keep meaning to try.</p>
                <p>The workout class you always hear about too late.</p>
                <p>The rooftop before it gets crowded.</p>
                <p>The happy hour two blocks away.</p>
                <p>
                  The local business you pass all the time until someone finally says,<br />
                  “Wait — you’ve never been there?”
                </p>
              </div>
            </EditorialReveal>

            <EditorialReveal
              className="mt-10 max-w-[640px]"
              delay={0.04}
              amount={0.2}
            >
              <p className="text-[18px] leading-[1.8] text-[#0B1F33]/74">
                Most things already exist. They’re just scattered across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.
              </p>
            </EditorialReveal>

            <EditorialReveal
              className="mt-10 max-w-[660px] space-y-3 text-[16px] leading-[1.72] text-[#0B1F33]/70 md:text-[18px] md:leading-[1.72]"
              delay={0.04}
              amount={0.18}
            >
              <p className="font-heading text-[34px] font-medium leading-[1] tracking-[-0.025em] text-[#0B1F33] md:text-[48px]">
                So we built one map<br />
                to bring everything together.
              </p>
              <p>
                Not another app to manage. Not another feed to scroll. Just a better way to figure out what’s nearby, what’s happening, and what feels worth going out for.
              </p>
            </EditorialReveal>

            <EditorialReveal
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
              delay={0.04}
              amount={0.2}
            >
              <Link
                to="/residents"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 text-[12px] font-medium uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
              >
                START AS RESIDENT
              </Link>
              <Link
                to="/partners"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-[12px] font-medium uppercase tracking-[0.08em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] transition hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
              >
                START AS PARTNER
              </Link>
            </EditorialReveal>
          </div>

        </div>
      </section>

      <section className="relative bg-white px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="relative mx-auto max-w-[760px] text-left">
          <EditorialReveal
            className="max-w-[660px]"
            amount={0.24}
          >
            <h2 className="max-w-[660px] font-heading text-[42px] font-medium leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[64px]">
              Whether you’re making plans or part of them.
            </h2>
            <div className="mt-7 max-w-[620px] space-y-4 text-[16px] leading-[1.72] text-[#0B1F33]/68 md:text-[18px] md:leading-[1.75]">
              <p>
                Downtown Perks helps residents make better plans faster — while helping local businesses stay relevant in the moments that actually matter.
              </p>
              <p>
                And when you choose local, you unlock perks, offers, rewards, and little extras from the places that keep downtown interesting.
              </p>
              <p>
                For residents, it means less searching and better plans. For local businesses, it means showing up naturally while people nearby are already deciding where to go.
              </p>
            </div>
            <p className="mt-10 max-w-[620px] font-heading text-[28px] font-medium leading-tight text-[#0B1F33]/82 md:text-[38px]">
              Come on in. Open the map. And maybe grab something cold while you’re at it.
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            delay={0.04}
            amount={0.2}
          >
            <Link
              to="/residents"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 text-[12px] font-medium tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Enter Resident View
            </Link>
            <Link
              to="/partners"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-[12px] font-medium tracking-[0.08em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] transition hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(179, 143, 79, 0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Enter Partner View
            </Link>
          </EditorialReveal>
        </div>
      </section>
    </main>
  );
}
