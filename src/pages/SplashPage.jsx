import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const storyStates = [
  {
    id: "start",
    number: "01",
    nav: "Start",
    kicker: "Downtown flavor",
    headline: ["More charm than", "a biscuit with honey."],
    meaning: "Downtown Perks brings the heat — and the hospitality.",
    supporting: [
      "For the people who plan around live music, rooftop weather, taco runs, and “just one drink” - this is for you.",
    ],
    scene: {
      type: "welcome",
      label: "Local cues",
      items: ["Town Lake", "South Congress", "Happy hour", "Hospitality"],
      detail: "Tap a cue to set the mood.",
    },
  },
  {
    id: "easier",
    number: "02",
    nav: "Easier",
    kicker: "A better downtown day",
    headline: ["Downtown should be", "easier to use."],
    meaning: "Easier to navigate. Easier to connect. More useful day to day.",
    supporting: [
      "Most things already exist. They’re just scattered.",
      "Across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.",
    ],
    scene: {
      type: "scatter",
      label: "Scattered signals",
      items: ["Group chat", "Screenshot", "Newsletter", "Open tab", "Saved post"],
      detail: "Each tap pulls one loose plan into view.",
    },
  },
  {
    id: "map",
    number: "03",
    nav: "One map",
    kicker: "Bringing it together",
    headline: ["So we built one map", "to bring everything together."],
    meaning: "Not another app to manage. Not another feed to scroll. Just a better way to figure out what’s happening, and worth showing up for.",
    supporting: [
    ],
    scene: {
      type: "map",
      label: "One map",
      items: ["Coffee", "Fitness", "Rooftop", "Dinner", "Live music"],
      detail: "Tap a pin to watch the plan come together.",
    },
  },
  {
    id: "pass",
    number: "04",
    nav: "Access",
    kicker: "Both sides of downtown",
    headline: ["Your all-access", "pass to downtown."],
    meaning: "For residents, it means less searching and better plans. For local businesses, it means showing up naturally while people nearby are already deciding where to go.",
    supporting: [
      "Coffee around the corner. A last-minute happy hour.",
      "The resident event you would have missed. Connecting the people, places and perks that make downtown feel alive.",
    ],
    scene: {
      type: "connection",
      label: "Plan meets place",
      items: ["Residents", "Hotels", "Events", "Local businesses"],
      detail: "Tap a group to see the connection light up.",
    },
  },
  {
    id: "perks",
    number: "05",
    nav: "Perks",
    kicker: "Choosing local",
    headline: ["Whether you’re making plans", "or part of them."],
    meaning: "Choosing local comes with its perks: discounts, rewards, and little extras from the places that  that keep downtown interesting.",
    supporting: [
      "Helping residents make better plans faster — while helping local businesses stay relevant in the moments that actually matter.",
    ],
    scene: {
      type: "perks",
      label: "Perks nearby",
      items: ["Discounts", "Rewards", "Little extras", "Worth exploring"],
      detail: "Tap a perk to preview the payoff.",
    },
  },
  {
    id: "come-in",
    number: "06",
    nav: "Open",
    kicker: "Come on in",
    headline: ["So come on in.", "Open the map."],
    meaning: "And maybe, grab something cold while you’re at it.",
    supporting: [],
    scene: {
      type: "welcome",
      label: "Open the map",
      items: ["Resident Map", "Partner Map", "Perks nearby", "Something cold"],
      detail: "Choose a map view and step into downtown.",
    },
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function FixedStoryStage({ state }) {
  return (
    <section className="dp-fixed-story-stage dp-scene-stage" aria-label="Downtown Perks story">
      <div className="dp-fixed-story-state">
        <div className="dp-fixed-story-copy">
          <div className="dp-fixed-story-kicker-slot">
            <p key={`kicker-${state.id}`} className="dp-fixed-story-kicker">{state.kicker}</p>
          </div>
          <div className="dp-fixed-story-headline-slot">
            <h1 key={`headline-${state.id}`} className="dp-fixed-story-headline">
              {state.headline.map((line) => {
                const lineClassName = line.length <= 22
                  ? "dp-fixed-story-headline-line is-balanced-single-line"
                  : "dp-fixed-story-headline-line";

                return (
                  <span key={line} className={lineClassName}>{line}</span>
                );
              })}
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

      <FixedStoryStage state={state} />

      {!showIntro && (
        <>
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
        </>
      )}
    </main>
  );
}
