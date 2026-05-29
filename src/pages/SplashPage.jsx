import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  MapPin,
  QrCode,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const VIDEO_SRC = "/videos/downtown-austin-drone-cinematic.mp4";

const signalPoints = [
  { label: "Launch", value: "Map + card", icon: MapPin },
  { label: "Measure", value: "Scans + RSVPs", icon: QrCode },
  { label: "Decide", value: "Act on what works", icon: Building2 },
];

const lifestyleTiles = [
  {
    image: "/images/splash/walkable-map.png",
    label: "Walkable map",
    className: "left-[5%] top-[7%] h-24 w-36 sm:h-28 sm:w-44",
    drift: { x: [0, 8, -3, 0], y: [0, -8, 5, 0], opacity: [0.62, 0.9, 0.7, 0.62] },
  },
  {
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
    label: "Coffee nearby",
    className: "right-[6%] top-[10%] h-24 w-36 sm:h-28 sm:w-40",
    drift: { x: [0, -6, 3, 0], y: [0, 7, -4, 0], opacity: [0.52, 0.76, 0.58, 0.52] },
  },
  {
    image: "/images/splash/resident-access.jpeg",
    label: "Resident access",
    className: "left-[9%] bottom-[8%] h-28 w-40 sm:h-32 sm:w-48",
    drift: { x: [0, 7, -5, 0], y: [0, 8, -5, 0], opacity: [0.58, 0.86, 0.68, 0.58] },
  },
  {
    image: "/images/splash/rooftop-nearby.jpeg",
    label: "Rooftop nearby",
    className: "right-[8%] bottom-[9%] h-24 w-40 sm:h-28 sm:w-48",
    drift: { x: [0, -8, 4, 0], y: [0, -6, 6, 0], opacity: [0.58, 0.88, 0.66, 0.58] },
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

function ChoosePathStoryboard() {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -40]);

  return (
    <motion.section
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative min-h-[420px] overflow-hidden rounded-md bg-white/90 shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04),0_18px_54px_rgba(11,31,51,0.06)] sm:min-h-[360px]">
        <div className="absolute inset-0">
          <div className="dp-section-light absolute left-[12%] top-[16%] h-40 w-40 bg-white/76 blur-3xl" />
          <div className="dp-section-light absolute bottom-[8%] right-[14%] h-44 w-44 bg-[#0B1F33]/7 blur-3xl [animation-delay:-5s]" />

          <motion.div className="absolute inset-0" style={{ y: imageY }} aria-hidden="true">
            {lifestyleTiles.map((tile) => (
              <motion.div
                key={tile.label}
                className={`absolute z-0 overflow-hidden bg-white/70 opacity-70 shadow-[0_18px_42px_rgba(11,31,51,0.10),0_0_34px_rgba(179,143,79,0.08)] ${tile.className}`}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: tile.drift.x,
                        y: tile.drift.y,
                        opacity: tile.drift.opacity,
                      }
                }
                whileHover={{ y: -6 }}
                transition={{
                  duration: 8,
                  repeat: reduceMotion ? 0 : Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              >
                <img src={tile.image} alt="" loading="eager" decoding="async" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-white/66 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#B38F4F]">
                  {tile.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 720 360" preserveAspectRatio="none" aria-hidden="true">
          <motion.path
            d="M130 126 C230 66, 330 90, 390 84 C500 72, 545 180, 490 236 C430 302, 305 268, 260 252"
            fill="none"
            stroke="#B38F4F"
            strokeWidth="2"
            strokeDasharray="8 10"
            initial={false}
            animate={
              reduceMotion
                ? { pathLength: 1, opacity: 0.52 }
                : { pathLength: 1, opacity: [0.42, 0.68, 0.42], strokeDashoffset: [0, -36] }
            }
            transition={{
              pathLength: { duration: 1.1, ease: "easeInOut" },
              opacity: { duration: 4.8, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" },
              strokeDashoffset: { duration: 6.5, repeat: reduceMotion ? 0 : Infinity, ease: "linear" },
            }}
          />
        </svg>

        <div className="pointer-events-none absolute left-1/2 top-[43%] z-[15] w-[min(74vw,330px)] -translate-x-1/2 -translate-y-1/2 sm:top-[43%] sm:w-[360px]">
          <motion.div
            className="bg-white/76 px-3 py-2.5 text-center shadow-[0_18px_46px_rgba(11,31,51,0.10),0_0_34px_rgba(179,143,79,0.10)] sm:px-4 sm:py-3"
            initial={false}
            animate={reduceMotion ? { opacity: 0.94, y: 0, scale: 1 } : { opacity: 0.94, y: [0, -3, 0], scale: [1, 1.01, 1] }}
            transition={{ duration: reduceMotion ? 0.45 : 5.4, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F] sm:text-[9px]">
              <Sparkles className="h-3 w-3 text-[#B38F4F]" />
              Search less. Spend less. Do more.
            </div>
            <div className="mt-1.5 font-heading text-[17px] font-medium leading-tight text-[#0B1F33] sm:text-[20px]">
              One downtown layer for resident plans and partner visibility.
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-[8px] font-semibold uppercase tracking-[0.13em] text-[#B38F4F]/76 sm:text-[9px]">
              <span>Launch</span>
              <span className="text-[#B38F4F]">Measure</span>
              <span>Decide</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-30 flex gap-2 overflow-x-auto pb-1 sm:inset-x-4 sm:bottom-4">
          {signalPoints.map((point) => {
            const Icon = point.icon;

            return (
              <motion.div
                key={point.label}
                whileHover={{ y: -1, backgroundColor: "rgba(255,255,255,0.94)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-[132px] shrink-0 bg-white/82 p-3 shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04),0_12px_30px_rgba(11,31,51,0.04)] sm:min-w-0 sm:flex-1"
              >
                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
                  <Icon className="h-3.5 w-3.5 text-[#B38F4F]" />
                  {point.label}
                </div>
                <div className="mt-1 text-[13px] font-semibold text-[#0B1F33]">{point.value}</div>
              </motion.div>
            );
          })}
          <Link
            to="/map?mode=resident&tab=map"
            className="min-w-[132px] shrink-0 bg-[linear-gradient(90deg,#0B1F33,#132b45,#0B1F33)] bg-[length:200%_100%] p-3 text-white shadow-[0_12px_30px_rgba(11,31,51,0.10)] transition-[background-position,box-shadow] duration-300 hover:bg-[position:100%_0] hover:shadow-[0_24px_60px_rgba(11,31,51,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:min-w-0 sm:flex-1"
          >
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#B38F4F]">
              <ArrowRight className="h-3.5 w-3.5 text-[#B38F4F]" />
              Open map
            </div>
            <div className="mt-1 text-[13px] font-semibold text-white">Resident view</div>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

export default function SplashPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [introReady, setIntroReady] = useState(false);

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
            <div className="dp-intro-fallback absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(179,143,79,0.16),transparent_34%),radial-gradient(circle_at_74%_68%,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,#0B1F33,#081521)]" />
            <div className="dp-intro-sheen absolute inset-y-0 left-[-28%] w-[42%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.10),transparent)] blur-2xl" />
            <video
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                introReady ? "opacity-100" : "opacity-0"
              }`}
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIntroReady(true)}
              onCanPlay={() => setIntroReady(true)}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-6xl"
              >
                <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F]">
                  <Sparkles className="h-3.5 w-3.5 text-[#B38F4F]" />
                  Downtown Perks
                </div>
                <h1 className="mt-5 max-w-4xl font-heading text-[42px] font-medium leading-[0.98] md:text-[72px]">
                  Where Downtown Meets You
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/72">
                  Built for the people who actually live downtown — and the businesses that keep it interesting.
                </p>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="relative px-5 py-14 md:px-8 md:py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <video className="absolute inset-0 h-full w-full object-cover opacity-[0.18]" src={VIDEO_SRC} autoPlay muted loop playsInline preload="metadata" />
          <div className="absolute inset-0 bg-[#F7F8FB]/84" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,248,251,0.98),rgba(247,248,251,0.78),rgba(247,248,251,1))]" />
          <div className="absolute left-[4%] top-[18%] h-56 w-56 rounded-full bg-white/72 blur-3xl" />
          <div className="absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-white/52 blur-[82px]" />
          <div className="absolute bottom-[8%] right-[16%] h-64 w-64 rounded-full bg-[#0B1F33]/10 blur-3xl" />
          <div className="absolute left-1/2 top-[46%] h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/34 blur-[92px]" />
        </div>

        <div className="relative mx-auto max-w-[840px] text-left">
          <EditorialReveal
            amount={0.28}
            className="max-w-[760px]"
          >
            <div className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B38F4F] shadow-[0_0_0_1px_rgba(11,31,51,0.035),0_12px_34px_rgba(11,31,51,0.06)]">
              <Sparkles className="h-3.5 w-3.5 text-[#B38F4F]" />
              Downtown Perks
            </div>
            <h1 className="mt-5 font-heading text-[52px] font-medium leading-[0.9] tracking-[-0.045em] text-[#0B1F33] max-[420px]:text-[48px] max-[420px]:leading-[0.92] md:text-[92px]">
              More charm than a biscuit with honey.
            </h1>
            <p className="mt-3 max-w-[620px] font-heading text-[24px] font-medium leading-[1.08] text-[#0B1F33]/70 md:text-[34px]">
              Downtown Perks brings the heat — and the hospitality.
            </p>
          </EditorialReveal>

          <EditorialReveal
            className="mt-8 max-w-[620px] space-y-4 text-[16px] leading-[1.72] text-[#0B1F33]/70 md:text-[18px] md:leading-[1.75]"
            delay={0.04}
            amount={0.24}
          >
            <p>
              Built for the folks who still call it Town Lake, know the shortcut through the alley off South Congress, and somehow always know where happy hour starts before everyone else gets there.
            </p>
            <p>
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

      <section className="relative bg-[#FAFAFC] px-5 py-12 md:px-8 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(179, 143, 79, 0.08),transparent)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="max-w-[720px] text-left">
            <EditorialReveal
              className="max-w-[720px]"
              amount={0.22}
            >
              <p className="font-heading text-[42px] font-medium leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[58px]">
                Downtown should be easier to use.
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
                So we built one map to bring everything together.
              </p>
              <p>
                Not another app to manage. Not another feed to scroll. Just a better way to figure out what’s nearby, what’s happening, and what feels worth getting out for.
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
                Start as resident
              </Link>
              <Link
                to="/partners"
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-[12px] font-medium uppercase tracking-[0.08em] text-[#0B1F33] shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_8px_20px_rgba(11,31,51,0.05)] transition hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(179,143,79,0.08),0_10px_22px_rgba(11,31,51,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] sm:w-auto"
              >
                Start as partner
              </Link>
            </EditorialReveal>
          </div>

          <EditorialReveal
            className="relative overflow-hidden rounded-lg bg-white/72 p-3 shadow-[0_0_0_1px_rgba(11,31,51,0.04),0_24px_70px_rgba(11,31,51,0.08),0_0_42px_rgba(11,31,51,0.04)]"
            delay={0.08}
            amount={0.18}
          >
            <div className="relative rounded-md bg-[#FAFAFC]/82 p-3 shadow-[inset_0_0_0_1px_rgba(11,31,51,0.04)]">
              <ChoosePathStoryboard />
            </div>
          </EditorialReveal>
        </div>
      </section>

      <section className="relative bg-[#F7F8FB] px-5 py-14 md:px-8 md:py-20">
        <div className="relative mx-auto max-w-[760px] text-left">
          <EditorialReveal
            className="max-w-[700px]"
            amount={0.24}
          >
            <h2 className="font-heading text-[42px] font-medium leading-[0.98] tracking-[-0.03em] text-[#0B1F33] md:text-[64px]">
              Whether you’re making plans or part of them.
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-[1.72] text-[#0B1F33]/68 md:text-[18px] md:leading-[1.75]">
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
            <p className="mt-8 max-w-[620px] font-heading text-[28px] font-medium leading-tight text-[#0B1F33]/82 md:text-[38px]">
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
