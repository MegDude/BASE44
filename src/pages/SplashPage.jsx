import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Menu, Search, Sparkles, X } from "lucide-react";

const storyStates = [
  {
    id: "start",
    index: "01",
    navLabel: "Start",
    kicker: "",
    headline: ["More charm than a biscuit with honey."],
    headlineParts: [
      { text: "More charm", tone: "gold" },
      { text: "than a biscuit", tone: "navy" },
      { text: "with honey.", tone: "navy" },
    ],
    meaning: "Downtown Perks brings the heat\n— and the hospitality.",
    supporting: [
      "For the people who plan around live music, rooftop weather,",
      "taco runs, and “just one drink” - this is for you.",
    ],
  },
  {
    id: "easier",
    index: "02",
    navLabel: "Easier",
    kicker: "",
    headline: ["Downtown should be easier to use."],
    headlineParts: [
      { text: "Downtown should", tone: "navy", compact: true },
      { text: "be easier to use.", tone: "gold", compact: true },
    ],
    meaning: "Easier to navigate. Easier to connect. \nMore useful day to day.",
    supporting: [
      "Most things already exist.",
      "They’re just scattered.",
      "Across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.",
    ],
  },
  {
    id: "one-map",
    index: "03",
    navLabel: "One map",
    kicker: "",
    headline: ["So we built one map to bring everything together."],
    headlineGroups: [
      [
        { text: "So we built ", tone: "navy" },
        { text: "one map", tone: "gold" },
      ],
      [
        { text: "to bring everything together.", tone: "navy" },
      ],
    ],
    headlineParts: [
      { text: "So we built", tone: "navy" },
      { text: "one map", tone: "gold" },
      { text: "to bring", tone: "navy" },
      { text: "everything", tone: "navy" },
      { text: "together.", tone: "navy" },
    ],
    meaning: "Not another app to manage. Not another feed to scroll.\nJust a better way to figure out what’s happening, and worth showing up for.",
    supporting: [],
  },
  {
    id: "access",
    index: "04",
    navLabel: "Access",
    kicker: "",
    headline: ["Your all-access pass to downtown."],
    headlineGroups: [
      [
        { text: "Your all-access ", tone: "gold" },
        { text: "pass to downtown.", tone: "navy" },
      ],
    ],
    headlineParts: [
      { text: "Your all-access", tone: "gold" },
      { text: "pass to downtown.", tone: "navy", compact: true },
    ],
    meaning: "For residents, it means less searching and better plans. For local businesses, it means showing up naturally while people nearby are already deciding where to go.",
    supporting: [
      "Coffee around the corner. A last-minute happy hour.",
      "The resident event you would have missed.",
      "Connecting the people, places and perks that make downtown feel alive.",
    ],
  },
  {
    id: "perks",
    index: "05",
    navLabel: "Perks",
    kicker: "",
    headline: ["Whether you’re making plans or part of them."],
    headlineParts: [
      { text: "Whether you’re", tone: "navy" },
      { text: "making plans", tone: "gold" },
      { text: "or part of them.", tone: "navy" },
    ],
    meaning: " Choosing local comes with its perks: discounts, rewards, and little extras from the places that  that keep downtown interesting.",
    supporting: [
      "Helping residents make better plans faster — while helping local businesses stay relevant in the moments that actually matter.",
    ],
  },
  {
    id: "open",
    index: "06",
    navLabel: "Open",
    kicker: "",
    headline: ["So come on in. Open the map."],
    headlineParts: [
      { text: "So come on in ya'll", tone: "navy", compact: true },
      { text: "Open the map.", tone: "gold" },
    ],
    meaning: "And maybe, grab something cold while you’re at it.",
    supporting: [],
  },
];

const storyNavLinks = [
  { to: "/app?mode=resident&tab=map", label: "Resident Map" },
  { to: "/app?mode=resident&tab=map&filter=Perks", label: "Perks" },
  { to: "/app?mode=resident&tab=map&filter=Events", label: "Events" },
  { to: "/app?mode=resident&tab=pass", label: "Perks Card" },
  { to: "/app?mode=partner&tab=map&filter=All", label: "Partner Map" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const storyEase = [0.22, 1, 0.36, 1];

const storyMotion = {
  section: {
    initial: { opacity: 0, y: 18, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -12, filter: "blur(8px)" },
  },
  line: {
    initial: { opacity: 0, y: 22, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  prose: {
    initial: { opacity: 0, y: 14, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
};

function FixedStoryStage({ state }) {
  const reduceMotion = useReducedMotion();
  const sceneMotion = reduceMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  } : storyMotion.section;
  const lineMotion = reduceMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  } : storyMotion.line;
  const proseMotion = reduceMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
  } : storyMotion.prose;
  const sceneTransition = reduceMotion ? { duration: 0 } : { duration: 0.52, ease: storyEase };
  const lineTransition = reduceMotion ? { duration: 0 } : { duration: 0.46, ease: storyEase };
  const proseTransition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: storyEase };

  return (
    <motion.section
      key={state.id}
      className="dp-fixed-story-stage dp-scene-stage"
      data-story-scene={state.id}
      aria-label="Downtown Perks story"
      initial={sceneMotion.initial}
      animate={sceneMotion.animate}
      exit={sceneMotion.exit}
      transition={sceneTransition}
    >
      <div className="dp-fixed-story-state">
        <div className="dp-fixed-story-copy">
          <div className="dp-fixed-story-kicker-slot">
            <p key={`kicker-${state.id}`} className="dp-fixed-story-kicker">{state.kicker}</p>
          </div>
          <motion.div
            className="dp-fixed-story-headline-slot"
            initial={proseMotion.initial}
            animate={proseMotion.animate}
            transition={{ ...proseTransition, delay: reduceMotion ? 0 : 0.04 }}
          >
            <motion.h1 key={`headline-${state.id}`} className="dp-fixed-story-headline">
              {state.headlineGroups ? state.headlineGroups.map((group, groupIndex) => (
                <motion.span
                  key={`${state.id}-headline-group-${groupIndex}`}
                  className="dp-fixed-story-headline-row"
                  initial={lineMotion.initial}
                  animate={lineMotion.animate}
                  transition={{ ...lineTransition, delay: reduceMotion ? 0 : 0.1 + groupIndex * 0.12 }}
                >
                  {group.map((part, partIndex) => {
                    const segmentClassName = [
                      "dp-fixed-story-headline-segment",
                      part.tone === "gold" ? "dp-fixed-story-line--gold" : "dp-fixed-story-line--navy",
                      part.compact ? "dp-fixed-story-line--compact" : "",
                      part.bold ? "dp-fixed-story-line--bold" : "",
                    ].filter(Boolean).join(" ");

                    return <span key={`${part.text}-${partIndex}`} className={segmentClassName}>{part.text}</span>;
                  })}
                </motion.span>
              )) : (state.headlineParts || state.headline.map((text) => ({ text, tone: "navy" }))).map((part) => {
                const lineClassName = [
                  "dp-fixed-story-line",
                  "dp-fixed-story-headline-line",
                  part.tone === "gold" ? "dp-fixed-story-line--gold" : "dp-fixed-story-line--navy",
                  part.compact ? "dp-fixed-story-line--compact" : "",
                  part.bold ? "dp-fixed-story-line--bold" : "",
                ].filter(Boolean).join(" ");

                return (
                  <motion.span
                    key={part.text}
                    className={lineClassName}
                    initial={lineMotion.initial}
                    animate={lineMotion.animate}
                    transition={{ ...lineTransition, delay: reduceMotion ? 0 : 0.1 + (state.headlineParts || []).findIndex((item) => item.text === part.text) * 0.1 }}
                  >
                    {part.text}
                  </motion.span>
                );
              })}
            </motion.h1>
          </motion.div>
          <motion.div
            className="dp-fixed-story-meaning-slot"
            initial={proseMotion.initial}
            animate={proseMotion.animate}
            transition={{ ...proseTransition, delay: reduceMotion ? 0 : 0.42 }}
          >
            <motion.p key={`meaning-${state.id}`} className="dp-fixed-story-meaning">
              {state.meaning.split("\n").map((line) => (
                <span key={line} className="dp-fixed-story-meaning-line">{line}</span>
              ))}
            </motion.p>
          </motion.div>
          <motion.div
            className="dp-fixed-story-supporting-slot"
            initial={proseMotion.initial}
            animate={proseMotion.animate}
            transition={{ ...proseTransition, delay: reduceMotion ? 0 : 0.66 }}
          >
            <motion.div key={`supporting-${state.id}`} className="dp-fixed-story-supporting">
              {state.supporting.map((line, lineIndex) => (
                <motion.p
                  key={line}
                  initial={proseMotion.initial}
                  animate={proseMotion.animate}
                  transition={{ ...proseTransition, delay: reduceMotion ? 0 : 0.76 + lineIndex * 0.08 }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
}

export default function SplashPage({
  residentMapHref = "/map?mode=resident&tab=map&filter=All",
  partnerMapHref = "/map?mode=partner&tab=map&filter=All",
  skipHref = "/map?mode=resident&tab=map&filter=All",
  onOpenMap,
} = {}) {
  const [active, setActive] = useState(0);
  const [storyMenuOpen, setStoryMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  });
  const lockRef = useRef(false);
  const touchStartRef = useRef(null);
  const state = storyStates[active];

  const finishIntro = useCallback(() => {
    setShowIntro(false);
    setStoryMenuOpen(false);
  }, []);

  const markMapLaunchReady = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("dp-opening-story-seen", "true");
    }
    setStoryMenuOpen(false);
    onOpenMap?.();
  }, [onOpenMap]);

  const openSearch = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dp-open-quick-search"));
    }
  }, []);

  const activate = useCallback((next) => {
    setActive(clamp(next, 0, storyStates.length - 1));
  }, []);

  const go = useCallback((delta) => {
    if (showIntro || lockRef.current) return;
    lockRef.current = true;
    setActive((current) => clamp(current + delta, 0, storyStates.length - 1));
    window.setTimeout(() => {
      lockRef.current = false;
    }, 520);
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro) return undefined;
    const timeoutId = window.setTimeout(finishIntro, 45000);
    return () => window.clearTimeout(timeoutId);
  }, [finishIntro, showIntro]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("dp-splash-lock");
    body.classList.add("dp-splash-lock");

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 8) return;
      go(event.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (event) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        go(1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        go(-1);
      }
      if (event.key === "Home") activate(0);
      if (event.key === "End") activate(storyStates.length - 1);
      if (event.key === "Escape") setStoryMenuOpen(false);
    };

    const onTouchStart = (event) => {
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event) => {
      if (touchStartRef.current == null) return;
      const delta = (event.changedTouches[0]?.clientY ?? touchStartRef.current) - touchStartRef.current;
      if (Math.abs(delta) > 42) go(delta < 0 ? 1 : -1);
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      html.classList.remove("dp-splash-lock");
      body.classList.remove("dp-splash-lock");
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activate, go]);

  const isFirst = active === 0;
  const isLast = active === storyStates.length - 1;

  return (
    <main className={`dp-splash-page dp-fixed-story-page ${showIntro ? "is-intro-active" : ""}`} aria-label="Downtown Perks introduction">
      {showIntro && (
        <section className="dp-opening-intro" aria-label="Downtown Perks opening animation">
          <div className="dp-opening-fallback" aria-hidden="true" />
          <div className="dp-opening-sheen" aria-hidden="true" />
          <video
            className="dp-opening-video"
            src="/videos/downtown-austin-drone-cinematic.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={finishIntro}
            onError={finishIntro}
          />
          <div className="dp-opening-video-overlay" aria-hidden="true" />
          <div className="dp-opening-gradient" aria-hidden="true" />
          <div className="dp-opening-copy">
            <div className="dp-opening-label">
              <Sparkles className="h-3.5 w-3.5" />
              Downtown Perks
            </div>
            <h1>
              <span>Where Downtown</span>
              <span>Meets You</span>
            </h1>
            <p>
              <span>Built for the people who actually live downtown</span>
              <span>&mdash; and the businesses that keep it interesting.</span>
            </p>
            <button type="button" className="dp-opening-skip dp-story-skip" aria-label="Skip story" onClick={finishIntro}>
              Skip animation
            </button>
          </div>
        </section>
      )}

      {!showIntro && (
        <section className="dp-fixed-story-shell" aria-label="Downtown Perks story">
          <div className="dp-product-shell-topbar">
            <Link
              to={residentMapHref}
              className="dp-product-shell-brand"
              aria-label="Open Downtown Perks resident map"
              onClick={markMapLaunchReady}
            >
              <span className="dp-product-shell-wordmark whitespace-nowrap font-sans text-[18px] font-bold uppercase leading-none tracking-[-0.045em] text-dp-navy sm:text-2xl">
                <span className="text-dp-navy">Downtown</span>{" "}
                <span className="text-dp-gold">Perks</span>
              </span>
            </Link>
            <div className="dp-product-shell-nav-rail" aria-label="Story shortcuts">
              <button
                type="button"
                className="dp-product-shell-search-button"
                aria-label="Search Downtown Perks"
                onClick={openSearch}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Search</span>
              </button>
              <Link
                to={skipHref}
                className="dp-product-shell-skip dp-story-narrative-skip"
                aria-label="Skip story and open resident map"
                onClick={markMapLaunchReady}
              >
                Skip story
              </Link>
            </div>
            <button
              type="button"
              className="dp-product-shell-menu-button"
              aria-label={storyMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={storyMenuOpen}
              aria-controls="dp-story-navigation-menu"
              onClick={() => setStoryMenuOpen((open) => !open)}
            >
              {storyMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>
            {storyMenuOpen && (
              <nav id="dp-story-navigation-menu" className="dp-product-shell-menu" aria-label="Downtown Perks navigation">
                {storyNavLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={markMapLaunchReady}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <AnimatePresence mode="wait">
            <FixedStoryStage state={state} />
          </AnimatePresence>

          <div className="dp-fixed-story-footer">
            <div className="dp-fixed-story-controls dp-fixed-story-actions" aria-label="Story navigation">
              <button type="button" className="dp-fixed-story-control" onClick={() => go(-1)} disabled={isFirst}>
                <ArrowLeft />
                Back
              </button>
              <button type="button" className="dp-fixed-story-control" onClick={() => go(1)} disabled={isLast}>
                Next
                <ArrowRight />
              </button>
            </div>

            <div className={`dp-fixed-story-cta-footer dp-fixed-story-final-ctas dp-fixed-map-actions ${isLast ? "is-emphasized" : ""}`} aria-label="Open map">
              <Link className="dp-button dp-button-primary dp-button-wide" to={residentMapHref} onClick={markMapLaunchReady}>
                Resident Map
                <ArrowRight />
              </Link>
              <Link className="dp-button dp-button-secondary dp-button-wide" to={partnerMapHref} onClick={markMapLaunchReady}>
                Partner Map
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
