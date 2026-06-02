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
    copy: "Someone downtown wants coffee, dinner, a workout, or something good to do tonight.",
    image: "/images/residents/downtown-rooftop-evening.png",
    icon: Coffee,
  },
  {
    number: "02",
    title: "See what is close.",
    label: "Open the map",
    copy: "Nearby places, events, perks, and local favorites show up in one simple view.",
    image: "/images/splash/walkable-map.png",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Pick the next move.",
    label: "Choose the moment",
    copy: "Save a spot, RSVP to an event, or pick the place that fits right now.",
    image: "/images/map-entities/perks/partner_coffee_shop_1779052868356.png",
    icon: CalendarDays,
  },
  {
    number: "04",
    title: "Show the card or use the perk.",
    label: "Use access",
    copy: "No complicated steps. Find it, use it, and go.",
    image: "/images/splash/resident-access.jpeg",
    icon: BadgePercent,
  },
  {
    number: "05",
    title: "Partners see what worked.",
    label: "Partner insights",
    copy: "Local businesses can see what people saved, used, RSVP’d to, or checked out.",
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

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % journeySteps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className="relative overflow-hidden bg-[#F7F8FB] px-5 py-14 text-[#0B1F33] md:px-8 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179,143,79,0.16),transparent)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[840px]"
        >
          <p className="mb-5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F] md:text-[12px]">
            How Downtown Perks Works
          </p>
          <h2 className="max-w-[18ch] font-heading text-[42px] font-bold leading-[0.95] tracking-[-0.03em] text-[#0B1F33] max-[420px]:text-[40px] md:text-[60px] md:leading-[0.94] lg:text-[72px]">
            <span className="block">Open The Map.</span>
            <span className="block text-[#B38F4F]">Find The Moment. Go.</span>
          </h2>
          <p className="mt-6 max-w-[700px] font-body text-[17px] font-light leading-[1.68] text-[rgba(66,84,102,0.80)] md:text-[20px] md:leading-[1.62]">
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
            <div className="relative min-h-[520px] overflow-hidden bg-[#F7F8FB] md:min-h-[560px]">
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

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.88),rgba(255,255,255,0.18)_48%,rgba(11,31,51,0.18)),linear-gradient(180deg,rgba(255,255,255,0.10),rgba(11,31,51,0.22))]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.number}
                  initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(5px)" }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-4 right-4 top-4 z-20 bg-white/68 p-4 text-[#0B1F33] sm:left-6 sm:right-6 sm:top-6 sm:p-5 lg:right-auto lg:max-w-[720px] lg:p-6"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.68)",
                    backdropFilter: "blur(22px) saturate(1.08)",
                    WebkitBackdropFilter: "blur(22px) saturate(1.08)",
                    boxShadow:
                      "0 22px 68px rgba(11,31,51,0.10), inset 0 1px 0 rgba(255,255,255,0.78), inset 0 0 0 1px rgba(255,255,255,0.42)",
                  }}
                >
                  <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F]">
                    {active.label}
                  </span>
                  <h3 className="mt-3 max-w-full whitespace-nowrap font-heading text-[clamp(1.85rem,4.6vw,3.15rem)] font-bold leading-[0.98] tracking-[-0.025em] text-[#0B1F33] max-[560px]:whitespace-normal">
                    {active.title}
                  </h3>
                  <p className="mt-4 max-w-[420px] font-body text-[14px] font-light leading-relaxed text-[rgba(66,84,102,0.82)] md:text-[16px]">
                    {active.copy}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="absolute bottom-6 left-5 right-5 z-20 sm:bottom-7 sm:left-6 sm:right-6">
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function SplashPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FB] pt-[68px] text-[#0B1F33]">
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

            <div className="absolute inset-x-0 bottom-0 px-5 pb-7 md:pb-10">
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-6xl"
              >
                <div className="inline-flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F] md:text-[12px]">
                  <Sparkles className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Downtown Perks
                </div>
                <h1 className="mt-3 max-w-[11ch] font-heading text-[42px] font-bold leading-[0.9] tracking-[-0.03em] text-white max-[420px]:text-[38px] md:text-[64px] lg:text-[72px]">
                  <span className="block">Where Downtown</span>
                  <span className="block text-[#B38F4F]">Meets You</span>
                </h1>
                <p className="mt-3 max-w-[34rem] font-body text-[16px] font-light leading-[1.5] text-[#DCE3EB] md:text-[21px] md:leading-[1.45]">
                  Built for the people who actually live downtown — and the businesses that keep it interesting.
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="relative bg-[#F7F8FB] px-5 py-14 md:px-8 md:py-20">
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
            <div className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#B38F4F] md:text-[12px]">
              Live Discovery
            </div>
            <h1 className="mt-6 max-w-[13ch] font-heading text-[44px] font-bold leading-[0.95] tracking-[-0.03em] text-[#0B1F33] max-[420px]:text-[40px] max-[420px]:leading-[0.94] md:text-[68px] md:leading-[0.93] lg:text-[78px]">
              <span className="block">More Charm Than</span>
              <span className="block text-[#B38F4F]">A Biscuit With Honey.</span>
            </h1>
            <p className="mt-6 max-w-[680px] font-body text-[18px] font-light leading-relaxed text-[rgba(66,84,102,0.80)] md:text-[24px] md:leading-[1.56]">
              Downtown Perks brings the heat — and the hospitality.
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-9 max-w-[790px] space-y-6"
            delay={0.04}
            amount={0.24}
          >
            <p className="font-body text-[16px] font-light leading-[1.72] text-[rgba(66,84,102,0.74)] md:text-[19px] md:leading-[1.68]">
              Built for the folks who still call it Town Lake, know the shortcut through the alley off South Congress, and somehow always know where happy hour starts before everyone else gets there.
            </p>
            <p className="font-body text-[16px] font-light leading-[1.72] text-[rgba(66,84,102,0.74)] md:text-[19px] md:leading-[1.68]">
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
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Start as resident
              <ArrowRight className="ml-2 h-4 w-4 text-[#B38F4F]" />
            </Link>
            <Link
              to="/partners"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white/82 px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] backdrop-blur-md transition hover:-translate-y-px hover:bg-white hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Start as partner
            </Link>
          </EditorialReveal>
        </div>
      </section>

      <section className="relative bg-[#F7F8FB] px-5 pb-0 pt-12 md:px-8 md:pb-0 md:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179, 143, 79, 0.08),transparent)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-[720px] text-left">
            <EditorialReveal
              className="max-w-[720px]"
              amount={0.22}
            >
              <p className="font-heading text-[40px] font-bold leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[56px]">
                <span className="block">Downtown should</span>
                <span className="block text-[#B38F4F]">be easier to use.</span>
              </p>
              <div className="mt-5 max-w-[680px] space-y-1 font-body text-[18px] font-light leading-[1.45] text-[rgba(66,84,102,0.86)] md:text-[22px] md:leading-[1.45]">
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
              <p className="font-body text-[16px] font-light leading-[1.72] text-[rgba(66,84,102,0.78)] md:text-[18px]">
                Most things already exist. They’re just scattered across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.
              </p>
            </EditorialReveal>

            <EditorialReveal
              className="mt-10 max-w-[660px] space-y-3 font-body text-[16px] font-light leading-[1.72] text-[rgba(66,84,102,0.78)] md:text-[18px] md:leading-[1.72]"
              delay={0.04}
              amount={0.18}
            >
              <p className="font-heading text-[34px] font-bold leading-[1] tracking-[-0.025em] text-[#0B1F33] md:text-[48px]">
                <span className="block">So we built one map</span>
                <span className="block text-[#B38F4F]">to bring everything together.</span>
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
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
              >
                START AS RESIDENT
              </Link>
              <Link
                to="/partners"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white/82 px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] backdrop-blur-md transition hover:-translate-y-px hover:bg-white hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
              >
                START AS PARTNER
              </Link>
            </EditorialReveal>
          </div>

        </div>
      </section>

      <JourneyNarrative />

      <section className="relative bg-[#F7F8FB] px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16">
        <div className="relative mx-auto max-w-[760px] text-left">
          <EditorialReveal
            className="max-w-[660px]"
            amount={0.24}
          >
            <h2 className="max-w-[19ch] font-heading text-[34px] font-bold leading-[0.98] tracking-[-0.025em] text-[#0B1F33] md:text-[52px] md:leading-[0.96]">
              <span className="block">Whether you’re making plans</span>
              <span className="block text-[#B38F4F]">or part of them.</span>
            </h2>
            <div className="mt-7 max-w-[620px] space-y-4 font-body text-[16px] font-light leading-[1.72] text-[rgba(66,84,102,0.78)] md:text-[18px] md:leading-[1.75]">
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
            <p className="mt-10 max-w-[30ch] font-heading text-[24px] font-bold leading-[1.04] tracking-[-0.02em] text-[rgba(11,31,51,0.86)] md:text-[34px]">
              <span className="block">Come on in. Open the map.</span>
              <span className="block text-[#B38F4F]">And maybe grab something cold while you’re at it.</span>
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            delay={0.04}
            amount={0.2}
          >
            <Link
              to="/residents"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0B1F33] px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_22px_rgba(11,31,51,0.12)] transition hover:-translate-y-px hover:shadow-[0_12px_26px_rgba(11,31,51,0.14),0_0_16px_rgba(179,143,79,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Enter Resident View
            </Link>
            <Link
              to="/partners"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white/82 px-6 font-body text-[12px] font-bold uppercase tracking-[0.12em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] backdrop-blur-md transition hover:-translate-y-px hover:bg-white hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
            >
              Enter Partner View
            </Link>
          </EditorialReveal>
        </div>
      </section>
    </main>
  );
}
