import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Menu, Sparkles, X } from "lucide-react";

const splashNavLinks = [
  { label: "Resident Map", to: "/map?mode=resident&tab=map" },
  { label: "Partner Map", to: "/map?mode=partner&tab=map&filter=All" },
  { label: "Campaign Builder", to: "/partners/campaigns" },
  { label: "Workspace", to: "/partner-workspace/overview" },
];

const storyStates = [
  {
    id: "start",
    number: "01",
    nav: "Start",
    kicker: "Downtown flavor",
    headline: ["More charm than", "a biscuit with honey."],
    meaning: "Downtown Perks brings the heat — and the hospitality.",
    supporting: [
      "Built for the folks who still call it Town Lake, know the shortcut through the alley off South Congress, and somehow always know where happy hour starts before everyone else gets there.",
    ],
    scene: {
      type: "welcome",
      label: "Local cues",
      items: ["Town Lake", "South Congress", "Happy hour", "Hospitality"],
      detail: "Tap a cue to set the mood.",
    },
  },
  {
    id: "scattered",
    number: "02",
    nav: "Scattered",
    kicker: "The old way",
    headline: ["Most things already exist.", "They’re just scattered."],
    meaning: "Across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.",
    supporting: [
      "The coffee shop you keep meaning to try, the workout class you always hear about too late, the rooftop before it gets crowded.",
      "The local business you pass all the time until someone finally says, “Wait — you’ve never been there?”",
    ],
    scene: {
      type: "scatter",
      label: "Scattered signals",
      items: ["Group chat", "Screenshot", "Newsletter", "Open tab", "Saved post"],
      detail: "Each tap pulls one loose plan into view.",
    },
  },
  {
    id: "easier",
    number: "03",
    nav: "Easier",
    kicker: "A better downtown day",
    headline: ["Downtown should be", "easier to use."],
    meaning: "Easier to navigate. Easier to connect. More useful day to day.",
    supporting: [
      "So we built one map to bring everything together.",
      "Not another app to manage. Not another feed to scroll. Just a better way to figure out what’s happening, and worth showing up for.",
    ],
    scene: {
      type: "map",
      label: "One map",
      items: ["Coffee", "Fitness", "Rooftop", "Dinner", "Live music"],
      detail: "Tap a pin to watch the plan come together.",
    },
  },
  {
    id: "plans",
    number: "04",
    nav: "Together",
    kicker: "Both sides of downtown",
    headline: ["Whether you’re", "making plans or part of them."],
    meaning: "Downtown Perks helps residents make better plans faster — while helping local businesses stay relevant in the moments that actually matter.",
    supporting: [
      "And when people choose local, they unlock perks, offers, rewards, and little extras from the places that keep downtown interesting.",
    ],
    scene: {
      type: "connection",
      label: "Plan meets place",
      items: ["Residents", "Hotels", "Events", "Local businesses"],
      detail: "Tap a group to see the connection light up.",
    },
  },
  {
    id: "map",
    number: "05",
    nav: "Perks",
    kicker: "Choosing local",
    headline: ["Choosing local", "comes with its perks."],
    meaning: "Downtown Perks helps residents discover more of downtown with less effort — while helping local businesses show up naturally in the moments that actually matter.",
    supporting: [
      "Discounts, rewards, and little extras from the places that make downtown worth exploring.",
    ],
    scene: {
      type: "perks",
      label: "Perks nearby",
      items: ["Discounts", "Rewards", "Little extras", "Worth exploring"],
      detail: "Tap a perk to preview the payoff.",
    },
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function SplashNavigation({ isOpen, setIsOpen }) {
  const close = () => setIsOpen(false);

  return (
    <header className="dp-scene-topbar dp-fixed-story-topbar">
      <div className="dp-splash-nav-left">
        <Link to="/" className="dp-scene-brand" onClick={close} aria-label="Downtown Perks home">
          <span aria-hidden="true" className="dp-scene-brand-icon">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="dp-scene-brand-wordmark">
            <span>Downtown</span> <span>Perks</span>
          </span>
        </Link>

        <nav className="dp-splash-nav-links" aria-label="Splash navigation">
          {splashNavLinks.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="dp-splash-nav-actions">
        <button
          type="button"
          className="dp-splash-menu-button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/map?mode=resident&tab=pass" className="dp-splash-card-cta">
          Get Your Perks Card
        </Link>
      </div>

      {isOpen && (
        <nav className="dp-splash-mobile-menu" aria-label="Mobile splash navigation">
          {splashNavLinks.map((link) => (
            <Link key={link.label} to={link.to} onClick={close}>
              {link.label}
            </Link>
          ))}
          <Link to="/map?mode=resident&tab=pass" onClick={close} className="is-card">
            Get Your Perks Card
          </Link>
        </nav>
      )}
    </header>
  );
}

function FixedStoryStage({ state, active, go }) {
  const isFirst = active === 0;
  const isLast = active === storyStates.length - 1;

  return (
    <section className="dp-fixed-story-stage dp-scene-stage" aria-label="Downtown Perks story">
      <div className="dp-fixed-story-state">
        <div className="dp-fixed-story-copy">
          <div className="dp-fixed-story-kicker-slot">
            <p key={`kicker-${state.id}`} className="dp-fixed-story-kicker">{state.kicker}</p>
          </div>
          <div className="dp-fixed-story-headline-slot">
            <h1 key={`headline-${state.id}`} className="dp-fixed-story-headline">
              {state.headline.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
          </div>
          <div className="dp-fixed-story-meaning-slot">
            <p key={`meaning-${state.id}`} className="dp-fixed-story-meaning">{state.meaning}</p>
          </div>
          <div className="dp-fixed-story-supporting-slot">
            <div key={`supporting-${state.id}`} className="dp-fixed-story-supporting">
              {state.supporting.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="dp-fixed-story-actions" aria-label="Story navigation">
          <button type="button" onClick={() => go(-1)} disabled={isFirst}>
            <ArrowLeft />
            Back
          </button>
          <button type="button" onClick={() => go(1)} disabled={isLast}>
            Next
            <ArrowRight />
          </button>
        </div>

        <div className="dp-fixed-map-actions" aria-label="Open map views">
          <Link to="/map?mode=resident&tab=map">
            Resident Map
            <ArrowRight />
          </Link>
          <Link to="/map?mode=partner&tab=map&filter=All">
            Partner Map
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function SplashPage() {
  const [active, setActive] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lockRef = useRef(false);
  const touchStartRef = useRef(null);
  const state = storyStates[active];

  const finishIntro = useCallback(() => {
    setShowIntro(false);
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

  const progress = useMemo(() => `${active + 1} / ${storyStates.length}`, [active]);

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
          <button type="button" className="dp-opening-skip dp-story-skip" aria-label="Skip story" onClick={finishIntro}>
            Skip animation
          </button>
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
          </div>
        </section>
      )}

      <a className="dp-skip-link" href="/map?mode=resident&tab=map">
        Skip to map
      </a>

      <SplashNavigation isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />

      {!showIntro && (
        <Link
          to="/map?mode=resident&tab=map&filter=All"
          className="dp-story-narrative-skip"
          aria-label="Skip story and open resident map"
        >
          Skip story
        </Link>
      )}

      {!showIntro && (
        <>
          <aside className="dp-fixed-story-steps" aria-label="Intro story states">
            <ol>
              {storyStates.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={index === active ? "is-active" : ""}
                    onClick={() => activate(index)}
                    aria-current={index === active ? "step" : undefined}
                  >
                    <span>{item.number}</span>
                    {item.nav}
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div className="dp-fixed-story-progress" aria-label="Progress">
            {progress}
          </div>

        </>
      )}

      <FixedStoryStage state={state} active={active} go={go} />
    </main>
  );
}
