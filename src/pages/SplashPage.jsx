import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowRight, MapPin, Menu, Sparkles, X } from "lucide-react";

const splashNavLinks = [
  { label: "Resident Map", to: "/map?mode=resident&tab=map" },
  { label: "Partner Map", to: "/map?mode=partner&tab=map&filter=All" },
  { label: "Campaigns", to: "/partners/campaigns" },
  { label: "Dashboard", to: "/partners/dashboard" },
  { label: "Workspace", to: "/partner-workspace/overview" },
  { label: "Pricing", to: "/pricing" },
];

const scenes = [
  {
    id: "start",
    number: "01",
    nav: "Start",
    eyebrow: "Start here",
    label: "Downtown Perks",
    title: ["More charm than", "a biscuit with honey."],
    subtitle: ["Downtown Perks brings the heat", "and the hospitality."],
    body: [
      "Built for the folks who still call it Town Lake, know the shortcut through the alley off South Congress, and somehow always know where happy hour starts before everyone else gets there.",
    ],
    primary: { label: "Explore Downtown", to: "/map?mode=resident&tab=map" },
    secondary: "Show me",
    startStage: true,
  },
  {
    id: "idea",
    number: "02",
    nav: "The idea",
    eyebrow: "Downtown should be easier to use",
    title: ["The coffee shop you keep meaning to try.", "The workout class you always hear about too late.", "The rooftop before it gets crowded."],
    body: [
      "The happy hour two blocks away.",
      "The local business you pass all the time until someone finally says, \"Wait - you've never been there?\"",
    ],
    variant: "list",
  },
  {
    id: "features",
    number: "03",
    nav: "What you get",
    eyebrow: "Why it gets messy",
    title: ["Most things already exist.", "They're just scattered."],
    body: [
      "Across too many apps, group chats, tabs, feeds, newsletters, screenshots, and half-finished plans.",
      "So we built one map to bring everything together.",
    ],
    movedCopy: "For the people planning around rooftop weather, happy hour, workout classes, taco runs, live music, and \"just one drink\" that turns into the whole night.",
    variant: "center",
  },
  {
    id: "explore",
    number: "04",
    nav: "Explore",
    eyebrow: "What you can find",
    title: ["Everything nearby.", "Coffee before work.", "The workout class after.", "The rooftop when the weather is right.", "All in one place."],
    body: [
      "The restaurant you've been meaning to try.",
      "The event someone texts you about at 6:17 PM.",
    ],
    variant: "stack",
    primary: { label: "Enter Resident View", to: "/map?mode=resident&tab=map" },
  },
  {
    id: "partners",
    number: "05",
    nav: "Partners",
    eyebrow: "For the people part of the plan",
    title: ["Whether you're making plans", "or part of them."],
    body: [
      "Downtown Perks helps residents make better plans faster - while helping local businesses stay relevant in the moments that actually matter.",
      "And when you choose local, you unlock perks, offers, rewards, and little extras from the places that keep downtown interesting.",
      "For residents, it means less searching and better plans. For local businesses, it means showing up naturally while people nearby are already deciding where to go.",
    ],
    variant: "closing",
    primary: { label: "Open Partner Map", to: "/map?mode=partner&tab=map&filter=All" },
  },
  {
    id: "come-in",
    number: "06",
    nav: "Come in",
    eyebrow: "Ready when you are",
    title: ["So come on in.", "Open the map."],
    variant: "final",
    closing: ["And maybe grab something cold", "while you're at it."],
    primary: { label: "Explore Downtown", to: "/map?mode=resident&tab=map" },
  },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function SceneHeader({ scene, progress, isActive, isLast, go }) {
  return (
    <div className="dp-scene-kicker">
      <div className="dp-scene-kicker-copy">
        <span>{scene.number}</span>
        <i aria-hidden="true" />
        <em>{scene.eyebrow}</em>
      </div>
      {isActive && (
        <div className="dp-scene-kicker-action">
          <span aria-label="Progress">{progress}</span>
          <button type="button" onClick={() => go(1)} aria-label="Next scene" disabled={isLast}>
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function SceneTitle({ lines, variant = "" }) {
  return (
    <h1 className={`dp-scene-title ${variant ? `is-${variant}` : ""}`}>
      {lines.map((line) => (
        <span key={line} className="dp-scene-line">
          <span>{line}</span>
        </span>
      ))}
    </h1>
  );
}

function SceneBody({ scene }) {
  return (
    <div className={`dp-scene-body ${scene.variant ? `is-${scene.variant}` : ""}`}>
      {scene.body?.map((copy) => {
        if (copy.startsWith("Downtown Perks helps residents")) {
          return (
            <p key={copy} className="dp-scene-partner-opening">
              <span>Downtown Perks helps residents make better plans faster - while helping</span>
              <span>local businesses stay relevant in the moments that actually matter.</span>
            </p>
          );
        }
        if (copy.startsWith("And when you choose local")) {
          return (
            <p key={copy} className="dp-scene-partner-emphasis">
              {copy}
            </p>
          );
        }
        if (copy.startsWith("For residents, it means")) {
          return (
            <p key={copy} className="dp-scene-partner-split">
              <span>For residents, it means less searching more doing.</span>
              <span>For local businesses, it means showing up naturally</span>
              <span className="dp-scene-partner-nowrap">while people nearby are deciding where to go.</span>
            </p>
          );
        }
        if (!copy.includes("\"Wait - you've never been there?\"")) return <p key={copy}>{copy}</p>;
        const [lead, quote] = copy.split("\"Wait - you've never been there?\"");
        return (
          <p key={copy} className="dp-scene-editorial-line">
            {lead}
            <span>"{quote || "Wait - you've never been there?"}"</span>
          </p>
        );
      })}
    </div>
  );
}

function FeaturesScene({ scene, index, go }) {
  const closingLine = scene.body[1];
  const splitClosing = "So we built one map";
  const finalLine = "that turns into the whole night.";

  return (
    <>
      <h1 className="dp-scene-title is-center">
        <span className="dp-scene-line">
          <span>{scene.title[0]}</span>
        </span>
        <span className="dp-scene-line is-gold">
          <span>{scene.title[1]}</span>
        </span>
      </h1>

      <div className="dp-scene-body is-center">
        <p>{scene.body[0]}</p>
      </div>

      <div className="dp-scene-feature-closing" aria-label={closingLine}>
        <span>{splitClosing}</span>
        <span>to bring everything together.</span>
      </div>

      {scene.movedCopy && (
        <p className="dp-scene-moved-copy">
          <span>For the people planning around rooftop weather, happy hour, workout classes,</span>
          <span>taco runs, live music, and "just one drink" that turns into the whole night.</span>
        </p>
      )}

      <SceneActions scene={scene} index={index} go={go} />
    </>
  );
}

function StartScene({ scene, index, go }) {
  const finalLine = "that turns into the whole night.";

  return (
    <div className="dp-start-stage">
      {scene.label && <p className="dp-splash-label">{scene.label}</p>}
      <h1 className="dp-start-title">
        <span className="dp-scene-line">
          <span>{scene.title[0]}</span>
        </span>
        <span className="dp-scene-line is-gold">
          <span>{scene.title[1]}</span>
        </span>
      </h1>

      {scene.subtitle && (
        <h2 className="dp-start-subtitle">
          {scene.subtitle.map((line) => (
            <span key={line} className="dp-scene-line">
              <span>{line}</span>
            </span>
          ))}
        </h2>
      )}

      <div className="dp-start-body">
        {scene.body.map((copy) => {
          if (!copy.includes(finalLine)) return <p key={copy}>{copy}</p>;
          const [lead] = copy.split(finalLine);
          return (
            <p key={copy}>
              {lead.trimEnd()}{" "}
              <span className="dp-start-final-line">{finalLine}</span>
            </p>
          );
        })}
      </div>

      <SceneActions scene={scene} index={index} go={go} />
    </div>
  );
}

function SceneClosing({ scene }) {
  if (!scene.closing?.length) return null;
  return (
    <div className="dp-scene-closing" aria-label="Closing message">
      {scene.closing.map((line, index) => (
        <span key={line} className={scene.variant !== "final" && index === scene.closing.length - 1 ? "is-gold" : ""}>
          {line}
        </span>
      ))}
    </div>
  );
}

function SceneActions({ scene, index, go }) {
  return (
    <div className="dp-scene-actions">
      {scene.primary && (
        <Link className="dp-scene-cta is-primary" to={scene.primary.to}>
          {scene.primary.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
      {scene.secondaryLink ? (
        <Link className="dp-scene-cta" to={scene.secondaryLink.to}>
          {scene.secondaryLink.label}
        </Link>
      ) : scene.secondary ? (
        <button type="button" className="dp-scene-cta" onClick={() => go(1)}>
          {scene.secondary}
        </button>
      ) : !scene.primary ? (
        <button type="button" className="dp-scene-cta" onClick={() => go(1)}>
          Next
        </button>
      ) : null}
      {index > 0 && (
        <button type="button" className="dp-scene-ghost" onClick={() => go(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      )}
    </div>
  );
}

function ScenePreview({ scene }) {
  if (!scene.list?.length) return null;
  return (
    <div className="dp-scene-preview" aria-label={`${scene.nav} highlights`}>
      {scene.list.map((item) => (
        <div key={item}>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function SplashNavigation({ isOpen, setIsOpen }) {
  const close = () => setIsOpen(false);

  return (
    <header className="dp-scene-topbar">
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

export default function SplashPage() {
  const [active, setActive] = useState(0);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const lockRef = useRef(false);
  const touchStartRef = useRef(null);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  const activate = useCallback((next) => {
    setActive((current) => {
      const normalized = clamp(next, 0, scenes.length - 1);
      return normalized === current ? current : normalized;
    });
  }, []);

  const go = useCallback((delta) => {
    if (showIntro) return;
    if (lockRef.current) return;
    lockRef.current = true;
    setActive((current) => clamp(current + delta, 0, scenes.length - 1));
    window.setTimeout(() => {
      lockRef.current = false;
    }, 680);
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
      if (event.key === "End") activate(scenes.length - 1);
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

  useEffect(() => {
    const activeContent = document.querySelector(".dp-scene-slide.is-active .dp-scene-content");
    if (activeContent) activeContent.scrollTop = 0;
  }, [active]);

  const progress = useMemo(() => `${active + 1} / ${scenes.length}`, [active]);

  return (
    <main className="dp-splash-page dp-scene-page" aria-label="Downtown Perks introduction">
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
          <button type="button" className="dp-opening-skip" onClick={finishIntro}>
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
        <Link className="dp-story-skip" to="/map?mode=resident&tab=map">
          Skip story
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}

      <aside className="dp-scene-steps" aria-label="Intro scenes">
        <ol>
          {scenes.map((scene, index) => (
            <li key={scene.id}>
              <button
                type="button"
                className={index === active ? "is-active" : ""}
                onClick={() => activate(index)}
                aria-current={index === active ? "step" : undefined}
              >
                <span>{scene.number}</span>
                {scene.nav}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="dp-scene-stage">
        {scenes.map((scene, index) => (
          <section
            key={scene.id}
            className={`dp-scene-slide ${index === active && !showIntro ? "is-active" : ""}`}
            aria-hidden={index !== active || showIntro}
            inert={index !== active || showIntro ? "" : undefined}
          >
            <div className="dp-scene-content">
              <div className="dp-scene-frame">
                <SceneHeader scene={scene} progress={progress} isActive={index === active && !showIntro} isLast={index === scenes.length - 1} go={go} />
                <div className={`dp-scene-main ${scene.variant ? `is-${scene.variant}` : ""}`}>
                  {scene.startStage ? (
                    <StartScene scene={scene} index={index} go={go} />
                  ) : scene.variant === "center" ? (
                    <FeaturesScene scene={scene} index={index} go={go} />
                  ) : (
                    <>
                      {scene.label && <p className="dp-splash-label">{scene.label}</p>}
                      <SceneTitle lines={scene.title} variant={scene.variant} />
                      {scene.subtitle && <SceneTitle lines={scene.subtitle} variant="subtitle" />}
                      <SceneBody scene={scene} />
                      <SceneClosing scene={scene} />
                      <ScenePreview scene={scene} />
                      <SceneActions scene={scene} index={index} go={go} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
