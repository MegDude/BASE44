import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, MapPin, Menu, Search, Sparkles, X } from "lucide-react";

const storyStates = [
  {
    id: "start",
    index: "01",
    navLabel: "Start",
    kicker: "Downtown Perks",
    headlineGroups: [
      [
        { text: "More charm", tone: "gold" },
        { text: "than a", tone: "navy" },
      ],
      [
        { text: "biscuit", tone: "navy" },
        { text: "with honey.", tone: "navy" },
      ],
    ],
    meaning: "Downtown Perks brings the heat — and the hospitality.",
    supporting: [
      "For the people who plan around live music, rooftop weather,",
      "taco runs, and “just one drink” - this is for you.",
    ],
    visual: ["Music", "Rooftop", "Tacos"],
  },
  {
    id: "easier",
    index: "02",
    navLabel: "Easier",
    kicker: "Less scattered",
    headlineGroups: [
      [
        { text: "Downtown", tone: "navy" },
        { text: "should be", tone: "navy", compact: true },
      ],
      [
        { text: "easier to use.", tone: "gold" },
      ],
    ],
    meaning: "Easier to navigate. Easier to connect.\nMore useful day to day.",
    supporting: [
      "Most things already exist.",
      "They’re just scattered.",
      "Across too many apps, group chats, tabs, feeds,",
      "newsletters, screenshots, and half-finished plans.",
    ],
    visual: ["Apps", "Chats", "Tabs", "Plans"],
  },
  {
    id: "one-map",
    index: "03",
    navLabel: "One map",
    kicker: "One place",
    headlineGroups: [
      [
        { text: "So we built", tone: "navy" },
        { text: "one map", tone: "gold" },
      ],
      [
        { text: "to bring", tone: "navy" },
        { text: "everything", tone: "navy" },
      ],
      [
        { text: "together.", tone: "navy" },
      ],
    ],
    meaning: "Not another app to manage. Not another feed to scroll.",
    supporting: [
      "Just a better way to figure out what’s happening, and worth showing up for.",
    ],
    visual: ["Perks", "Events", "Places"],
  },
  {
    id: "access",
    index: "04",
    navLabel: "Access",
    kicker: "All-access",
    headlineGroups: [
      [
        { text: "Your all-access", tone: "gold" },
      ],
      [
        { text: "pass to", tone: "navy" },
        { text: "downtown.", tone: "navy" },
      ],
    ],
    meaning: "For residents, it means less searching and better plans. For local businesses, it means showing up naturally while people nearby are already deciding where to go.",
    supporting: [
      "Coffee around the corner. A last-minute happy hour.",
      "The resident event you would have missed.",
      "Connecting the people, places and perks that make downtown feel alive.",
    ],
    visual: ["Coffee", "Happy hour", "Resident event"],
  },
  {
    id: "perks",
    index: "05",
    navLabel: "Perks",
    kicker: "Choose local",
    headlineGroups: [
      [
        { text: "Whether you’re", tone: "navy" },
      ],
      [
        { text: "making plans", tone: "gold" },
      ],
      [
        { text: "or part of them.", tone: "navy" },
      ],
    ],
    meaning: "Choosing local comes with its perks: discounts, rewards, and little extras from the places that keep downtown interesting.",
    supporting: [
      "Helping residents make better plans faster — while helping local businesses stay relevant in the moments that actually matter.",
    ],
    visual: ["Discounts", "Rewards", "Extras"],
  },
  {
    id: "open",
    index: "06",
    navLabel: "Open",
    kicker: "HOWDY",
    headlineGroups: [
      [
        { text: "So come on in ya'll", tone: "navy" },
      ],
      [
        { text: "Open the map.", tone: "gold" },
      ],
    ],
    meaning: "And maybe, grab something cold while you’re at it.",
    supporting: [],
    visual: ["Open map", "Cold drink", "Downtown"],
  },
];

const residentNavLinks = [
  { to: "/map?mode=resident&tab=map&filter=All", label: "Resident Map" },
  { to: "/map?mode=resident&tab=map&filter=Perks", label: "Perks" },
  { to: "/map?mode=resident&tab=map&filter=Events", label: "Events" },
  { to: "/map?mode=resident&tab=pass&filter=All", label: "Perks Card" },
];

const partnerNavLinks = [
  { to: "/map?mode=partner&tab=map&filter=All", label: "Partner Map" },
  { to: "/map?mode=partner&tab=campaigns&filter=All", label: "Campaigns" },
  { to: "/map?mode=partner&tab=activity&filter=All", label: "Activity" },
  { to: "/partner-workspace/overview", label: "Workspace" },
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
          {state.prelude?.length ? (
            <motion.div
              className="dp-fixed-story-prelude-slot"
              initial={proseMotion.initial}
              animate={proseMotion.animate}
              transition={{ ...proseTransition, delay: reduceMotion ? 0 : 0.02 }}
            >
              <p key={`prelude-${state.id}`} className="dp-fixed-story-prelude">
                {state.prelude.map((line) => (
                  <span key={line} className="dp-fixed-story-prelude-line">{line}</span>
                ))}
              </p>
            </motion.div>
          ) : null}
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
  onOpenMap,
} = {}) {
  const [active, setActive] = useState(0);
  const [storyMenuOpen, setStoryMenuOpen] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState(null);
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
    setOpenNavMenu(null);
  }, []);

  const markMapLaunchReady = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem("dp-opening-story-seen", "true");
    }
    setStoryMenuOpen(false);
    setOpenNavMenu(null);
    onOpenMap?.();
  }, [onOpenMap]);

  const openSearch = useCallback(() => {
    setStoryMenuOpen(false);
    setOpenNavMenu(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dp-open-quick-search"));
    }
  }, []);

  const toggleNavMenu = useCallback((menuName) => {
    setOpenNavMenu((current) => (current === menuName ? null : menuName));
    setStoryMenuOpen(false);
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
      if (event.key === "Escape") {
        setStoryMenuOpen(false);
        setOpenNavMenu(null);
      }
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
            <div className="dp-story-header-inner">
              <Link
                to={residentMapHref}
                className="dp-product-shell-brand dp-story-app-brand"
                aria-label="Downtown Perks app"
                onClick={markMapLaunchReady}
              >
                <MapPin className="dp-story-brand-icon" aria-hidden="true" />
                <span>Downtown Perks</span>
              </Link>

              <nav className="dp-product-shell-nav-rail dp-story-desktop-nav" aria-label="Downtown Perks navigation">
                <Link className="dp-story-nav-link is-active" to={residentMapHref} onClick={markMapLaunchReady}>
                  Resident Map
                </Link>
                <Link className="dp-story-nav-link" to={partnerMapHref} onClick={markMapLaunchReady}>
                  Partner Map
                </Link>

                <div className="dp-story-nav-menu-wrap">
                  <button
                    type="button"
                    className={`dp-story-nav-menu-trigger ${openNavMenu === "residents" ? "is-active" : ""}`}
                    aria-expanded={openNavMenu === "residents"}
                    aria-controls="residents-navigation"
                    onClick={() => toggleNavMenu("residents")}
                  >
                    Residents
                    <ChevronDown aria-hidden="true" />
                  </button>
                  {openNavMenu === "residents" && (
                    <div id="residents-navigation" className="dp-story-nav-menu-panel">
                      {residentNavLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={markMapLaunchReady}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dp-story-nav-menu-wrap">
                  <button
                    type="button"
                    className={`dp-story-nav-menu-trigger ${openNavMenu === "partners" ? "is-active" : ""}`}
                    aria-expanded={openNavMenu === "partners"}
                    aria-controls="partners-navigation"
                    onClick={() => toggleNavMenu("partners")}
                  >
                    Partners
                    <ChevronDown aria-hidden="true" />
                  </button>
                  {openNavMenu === "partners" && (
                    <div id="partners-navigation" className="dp-story-nav-menu-panel">
                      {partnerNavLinks.map((link) => (
                        <Link key={link.to} to={link.to} onClick={markMapLaunchReady}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </nav>

              <div className="dp-story-mobile-actions">
                <button
                  type="button"
                  className="dp-product-shell-menu-button"
                  aria-label={storyMenuOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={storyMenuOpen}
                  aria-controls="dp-story-navigation-menu"
                  onClick={() => {
                    setOpenNavMenu(null);
                    setStoryMenuOpen((open) => !open);
                  }}
                >
                  {storyMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>

              {storyMenuOpen && (
                <nav id="dp-story-navigation-menu" className="dp-product-shell-menu" aria-label="Downtown Perks navigation">
                  <div className="dp-story-mobile-menu-group">
                    <p>Residents</p>
                    {residentNavLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={markMapLaunchReady}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="dp-story-mobile-menu-group">
                    <p>Partners</p>
                    {partnerNavLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={markMapLaunchReady}>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <FixedStoryStage state={state} />
          </AnimatePresence>

          <div className="dp-fixed-story-footer">
            <div className={`dp-fixed-story-cta-footer dp-fixed-story-final-ctas dp-fixed-map-actions ${isLast ? "is-emphasized" : ""}`} aria-label="Open map">
              <button
                type="button"
                className="dp-global-search-icon-button dp-story-footer-search"
                aria-label="Search Downtown Perks"
                onClick={openSearch}
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link className="dp-button dp-button-primary dp-button-wide" to={residentMapHref} onClick={markMapLaunchReady}>
                Open the Map
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
