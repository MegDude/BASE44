import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronDown, MapPin, Menu, Search, Sparkles, X } from "lucide-react";

const storyStates = [
  {
    id: "start",
    index: "01",
    navLabel: "Start",
    kicker: "Downtown Perks",
    headlineGroups: [
      [
        { text: "More charm", tone: "gold" },
      ],
      [
        { text: "than a biscuit", tone: "navy" },
      ],
      [
        { text: "with honey.", tone: "navy" },
      ],
    ],
    meaning: "Downtown Perks brings the heat — and the hospitality.",
    supporting: [
      "For the people who plan around live music, rooftop weather, taco runs, and “just one drink” — this is for you.",
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
    meaning: "",
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
        { text: "to bring", tone: "navy" },
      ],
      [
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
    meaning: "",
    supporting: [
      "Coffee around the corner. A last-minute happy hour. The resident event you would have missed.",
      "Connecting the people, places and perks that make downtown feel like home, helping residents make better plans faster while local businesses stay relevant in the moments that actually matter.",
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
    supporting: [],
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

const splashStoryShellVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.32, ease: storyEase },
  },
};

const storySceneVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.52, ease: storyEase },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(6px)",
    transition: { duration: 0.24, ease: storyEase },
  },
};

const storyRevealVariants = {
  hidden: ({ y = 16, blur = 8, reduceMotion = false } = {}) => ({
    opacity: 0,
    y: reduceMotion ? 0 : y,
    filter: reduceMotion ? "none" : `blur(${blur}px)`,
  }),
  visible: ({ delay = 0, reduceMotion = false } = {}) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: reduceMotion ? 0 : 0.64,
      delay: reduceMotion ? 0 : delay,
      ease: storyEase,
    },
  }),
  exit: ({ reduceMotion = false } = {}) => ({
    opacity: reduceMotion ? 1 : 0,
    y: reduceMotion ? 0 : -8,
    filter: reduceMotion ? "none" : "blur(5px)",
    transition: { duration: reduceMotion ? 0 : 0.18, ease: storyEase },
  }),
};

const storySegmentVariants = {
  hidden: ({ y = 10, blur = 5, reduceMotion = false } = {}) => ({
    opacity: 0,
    y: reduceMotion ? 0 : y,
    filter: reduceMotion ? "none" : `blur(${blur}px)`,
  }),
  visible: ({ delay = 0, reduceMotion = false } = {}) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      delay: reduceMotion ? 0 : delay,
      ease: storyEase,
    },
  }),
  exit: ({ reduceMotion = false } = {}) => ({
    opacity: reduceMotion ? 1 : 0,
    y: reduceMotion ? 0 : -6,
    filter: reduceMotion ? "none" : "blur(4px)",
    transition: { duration: reduceMotion ? 0 : 0.16, ease: storyEase },
  }),
};

function SplashStoryScene({ scene, activeIndex, onStep, onActivate }) {
  const reduceMotion = useReducedMotion();
  const motionState = { reduceMotion };
  const headlineRows = scene.headlineGroups || (scene.headlineParts || scene.headline.map((text) => ({ text, tone: "navy" }))).map((part) => [part]);
  const headlineBaseDelay = 0.14;
  const headlineDelayStep = 0.13;
  const meaningDelay = headlineBaseDelay + headlineRows.length * headlineDelayStep + 0.12;
  const supportingDelay = meaningDelay + (scene.meaning ? 0.16 : 0.04);
  const controlsDelay = supportingDelay + (scene.supporting.length ? 0.18 : 0.1);

  return (
    <motion.section
      key={scene.id}
      className="dp-fixed-story-stage dp-scene-stage"
      data-story-scene={scene.id}
      data-story-active="true"
      aria-label="Downtown Perks story"
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit={reduceMotion ? undefined : "exit"}
      variants={storySceneVariants}
    >
      <div className="dp-fixed-story-state">
        <motion.div className="dp-fixed-story-copy" initial="hidden" animate="visible" exit="exit">
          <motion.div
            className="dp-fixed-story-kicker-slot dp-story-reveal"
            custom={{ ...motionState, delay: 0, y: 12, blur: 5 }}
            variants={storyRevealVariants}
          >
            <p key={`kicker-${scene.id}`} className="dp-fixed-story-kicker">{scene.kicker}</p>
          </motion.div>
          {scene.prelude?.length ? (
            <motion.div
              className="dp-fixed-story-prelude-slot dp-story-reveal"
              custom={{ ...motionState, delay: 0.08, y: 14, blur: 6 }}
              variants={storyRevealVariants}
            >
              <p key={`prelude-${scene.id}`} className="dp-fixed-story-prelude">
                {scene.prelude.map((line) => (
                  <span key={line} className="dp-fixed-story-prelude-line">{line}</span>
                ))}
              </p>
            </motion.div>
          ) : null}
          <motion.div
            className="dp-fixed-story-headline-slot"
            custom={{ ...motionState, delay: headlineBaseDelay, y: 18, blur: 8 }}
            variants={storyRevealVariants}
          >
            <motion.h1 key={`headline-${scene.id}`} className="dp-fixed-story-headline">
              {headlineRows.map((group, groupIndex) => (
                <motion.span
                  key={`${scene.id}-headline-group-${groupIndex}`}
                  className="dp-fixed-story-headline-row dp-story-reveal"
                  custom={{ ...motionState, delay: headlineBaseDelay + groupIndex * headlineDelayStep, y: 18, blur: 8 }}
                  variants={storyRevealVariants}
                >
                  {group.map((part, partIndex) => {
                    const segmentClassName = [
                      "dp-fixed-story-headline-segment",
                      part.tone === "gold" ? "dp-fixed-story-line--gold" : "dp-fixed-story-line--navy",
                      part.compact ? "dp-fixed-story-line--compact" : "",
                      part.bold ? "dp-fixed-story-line--bold" : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <motion.span
                        key={`${part.text}-${partIndex}`}
                        className={segmentClassName}
                        custom={{ ...motionState, delay: headlineBaseDelay + groupIndex * headlineDelayStep + partIndex * 0.045, y: 8, blur: 4 }}
                        variants={storySegmentVariants}
                      >
                        {part.text}
                      </motion.span>
                    );
                  })}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
          {scene.meaning ? (
            <motion.div
              className="dp-fixed-story-meaning-slot dp-story-reveal"
              custom={{ ...motionState, delay: meaningDelay, y: 14, blur: 6 }}
              variants={storyRevealVariants}
            >
              <motion.p key={`meaning-${scene.id}`} className="dp-fixed-story-meaning">
                {scene.meaning.split("\n").map((line) => (
                  <span key={line} className="dp-fixed-story-meaning-line">{line}</span>
                ))}
              </motion.p>
            </motion.div>
          ) : null}
          <motion.div
            className="dp-fixed-story-supporting-slot dp-story-reveal"
            custom={{ ...motionState, delay: supportingDelay, y: 14, blur: 6 }}
            variants={storyRevealVariants}
          >
            <motion.div key={`supporting-${scene.id}`} className="dp-fixed-story-supporting">
              {scene.supporting.map((line, lineIndex) => (
                <motion.p
                  key={line}
                  custom={{ ...motionState, delay: supportingDelay + lineIndex * 0.08, y: 10, blur: 5 }}
                  variants={storySegmentVariants}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            className="dp-story-scene-controls dp-story-reveal"
            aria-label="Story controls"
            custom={{ ...motionState, delay: controlsDelay, y: 10, blur: 4 }}
            variants={storyRevealVariants}
          >
            <button type="button" onClick={() => onStep(-1)} disabled={activeIndex === 0} aria-label="Previous story scene">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className="dp-story-scene-dots" aria-label="Story scenes">
              {storyStates.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === activeIndex ? "is-active" : ""}
                  aria-label={`Show ${item.navLabel}`}
                  aria-current={index === activeIndex ? "step" : undefined}
                  onClick={() => onActivate(index)}
                />
              ))}
            </div>
            <button type="button" onClick={() => onStep(1)} disabled={activeIndex === storyStates.length - 1} aria-label="Next story scene">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>

      </div>
    </motion.section>
  );
}

function SplashStoryHeader({
  residentMapHref,
  partnerMapHref,
  storyMenuOpen,
  openNavMenu,
  onLaunchMap,
  onOpenSearch,
  onToggleMobileMenu,
  onToggleNavMenu,
}) {
  return (
    <div className="dp-product-shell-topbar dp-splash-story-header">
      <div className="dp-story-header-inner">
        <Link
          to={residentMapHref}
          className="dp-product-shell-brand dp-story-app-brand"
          aria-label="Downtown Perks app"
          onClick={onLaunchMap}
        >
          <MapPin className="dp-story-brand-icon" aria-hidden="true" />
          <span>Downtown Perks</span>
        </Link>

        <nav className="dp-product-shell-nav-rail dp-story-desktop-nav" aria-label="Downtown Perks navigation">
          <Link className="dp-story-nav-link is-active" to={residentMapHref} onClick={onLaunchMap}>
            Resident Map
          </Link>
          <Link className="dp-story-nav-link" to={partnerMapHref} onClick={onLaunchMap}>
            Partner Map
          </Link>

          <div className="dp-story-nav-menu-wrap">
            <button
              type="button"
              className={`dp-story-nav-menu-trigger ${openNavMenu === "residents" ? "is-active" : ""}`}
              aria-expanded={openNavMenu === "residents"}
              aria-controls="residents-navigation"
              onClick={() => onToggleNavMenu("residents")}
            >
              Residents
              <ChevronDown aria-hidden="true" />
            </button>
            {openNavMenu === "residents" && (
              <div id="residents-navigation" className="dp-story-nav-menu-panel">
                {residentNavLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={onLaunchMap}>
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
              onClick={() => onToggleNavMenu("partners")}
            >
              Partners
              <ChevronDown aria-hidden="true" />
            </button>
            {openNavMenu === "partners" && (
              <div id="partners-navigation" className="dp-story-nav-menu-panel">
                {partnerNavLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={onLaunchMap}>
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
            className="dp-product-shell-menu-button dp-story-top-search"
            aria-label="Search Downtown Perks"
            onClick={onOpenSearch}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="dp-product-shell-menu-button"
            aria-label={storyMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={storyMenuOpen}
            aria-controls="dp-story-navigation-menu"
            onClick={onToggleMobileMenu}
          >
            {storyMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {storyMenuOpen && (
          <nav id="dp-story-navigation-menu" className="dp-product-shell-menu" aria-label="Downtown Perks navigation">
            <div className="dp-story-mobile-menu-group">
              <p>Residents</p>
              {residentNavLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={onLaunchMap}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="dp-story-mobile-menu-group">
              <p>Partners</p>
              {partnerNavLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={onLaunchMap}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function SplashStoryFooter({ isLast, residentMapHref, onLaunchMap }) {
  return (
    <div className="dp-fixed-story-footer dp-splash-story-footer">
      <div className={`dp-fixed-story-cta-footer dp-fixed-story-final-ctas dp-fixed-map-actions ${isLast ? "is-emphasized" : ""}`} aria-label="Open map">
        <Link className="dp-button dp-button-primary dp-button-wide" to={residentMapHref} onClick={onLaunchMap}>
          Open the Map
        </Link>
      </div>
    </div>
  );
}

function SplashStoryShell({ children }) {
  return (
    <motion.section
      className="dp-fixed-story-shell dp-splash-story-shell"
      aria-label="Downtown Perks story"
      initial="hidden"
      animate="visible"
      variants={splashStoryShellVariants}
    >
      {children}
    </motion.section>
  );
}

export default function SplashPage({
  residentMapHref = "/map?mode=resident&tab=map&filter=All",
  partnerMapHref = "/map?mode=partner&tab=map&filter=All",
  onOpenMap,
  replayOpening = false,
} = {}) {
  const [active, setActive] = useState(0);
  const [storyMenuOpen, setStoryMenuOpen] = useState(false);
  const [openNavMenu, setOpenNavMenu] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    if (replayOpening) return true;
    if (window.sessionStorage?.getItem("dp-opening-story-seen") === "true") return false;
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
            preload="metadata"
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
        <SplashStoryShell>
          <SplashStoryHeader
            residentMapHref={residentMapHref}
            partnerMapHref={partnerMapHref}
            storyMenuOpen={storyMenuOpen}
            openNavMenu={openNavMenu}
            onLaunchMap={markMapLaunchReady}
            onOpenSearch={openSearch}
            onToggleNavMenu={toggleNavMenu}
            onToggleMobileMenu={() => {
              setOpenNavMenu(null);
              setStoryMenuOpen((open) => !open);
            }}
          />

          <AnimatePresence mode="wait">
            <SplashStoryScene scene={state} activeIndex={active} onStep={go} onActivate={activate} />
          </AnimatePresence>

          <SplashStoryFooter isLast={isLast} residentMapHref={residentMapHref} onLaunchMap={markMapLaunchReady} />
        </SplashStoryShell>
      )}
    </main>
  );
}
