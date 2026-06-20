import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

const DOWNTOWN_FRAMES = [
  "https://images.unsplash.com/photo-1531219572322-a0e28f0de204?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558285549-2a075da29cb5?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549400827-0b1a0f8bf3a0?q=80&w=2670&auto=format&fit=crop",
];

const CATEGORY_CHIPS = [
  "Coffee",
  "Dining",
  "Happy Hour",
  "Events",
  "Fitness",
  "Hotels",
  "Perks",
  "Tonight",
  "Nearby Now",
];

export default function Landing() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState("residents");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DOWNTOWN_FRAMES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#f7f6f2]">
      {/* Hero */}
      <section className="relative w-full h-[44vh] md:h-[60vh] overflow-hidden bg-[#111f3d]">
        {DOWNTOWN_FRAMES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Downtown"
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "filter brightness-[0.86] saturate-[0.86]",
              "transition-all ease-out",
              activeIndex === index ? "duration-1000" : "duration-500"
            )}
            style={{
              opacity: activeIndex === index ? 1 : 0,
              transform: activeIndex === index ? "scale(1.01)" : "scale(1.03)",
              zIndex: activeIndex === index ? 10 : 0,
            }}
          />
        ))}

        <div className="absolute inset-0 z-20 pointer-events-none" style={{
          background:
            "linear-gradient(to right, rgba(17,31,61,0.42), rgba(17,31,61,0.12), transparent)",
        }} />

        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-[11px] md:text-[12px] font-inter uppercase tracking-[0.16em] text-white/80 mb-3">
              LIVE DOWNTOWN ACCESS
            </div>
            <h1 className="text-[34px] md:text-[56px] font-canela leading-tight text-white mb-4">
              Downtown, in one place.
            </h1>
            <p className="text-[14px] md:text-[16px] text-white/90 font-inter leading-relaxed max-w-3xl mx-auto">
              You live downtown but expect it to be easier.
              Downtown Perks fixes that—because the problem isn’t what to do next, it’s the effort it takes to decide.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 pointer-events-auto">
              <Link to="/map" className="rounded-full px-6 py-3 bg-[#111f3d] text-white text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-inter border border-white/40 hover:bg-white/10">
                Open the Map
              </Link>
              <Link to="/residents" className="rounded-full px-6 py-3 bg-white/82 text-[#111f3d] text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-inter border border-white/40 hover:bg-white">
                Explore Resident Access
              </Link>
              <Link to="/partners" className="rounded-full px-6 py-3 bg-white/82 text-[#111f3d] text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-inter border border-white/40 hover:bg-white">
                For Partners
              </Link>
              <Link to="/perks-near-me" className="rounded-full px-6 py-3 bg-[#c5a15a] text-[#111f3d] text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-inter border border-[#c5a15a] hover:bg-[#d0ad69]">
                Perks Near Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category rail */}
      <section className="px-4 md:px-8 py-8 bg-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full px-4 py-2 bg-white/72 backdrop-blur-md border border-white/40 text-[11px] font-inter uppercase tracking-[0.12em] text-[#111f3d]"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Split experience toggle */}
      <section className="px-4 md:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex rounded-full bg-white/72 border border-white/40 overflow-hidden pointer-events-auto">
            <button
              type="button"
              onClick={() => setView("residents")}
              className={cn(
                "px-6 py-3 text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]",
                view === "residents" && "bg-white"
              )}
            >
              Residents
            </button>
            <button
              type="button"
              onClick={() => setView("partners")}
              className={cn(
                "px-6 py-3 text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]",
                view === "partners" && "bg-white"
              )}
            >
              Partners
            </button>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {view === "residents" ? (
              <>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Resident preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Find what you need</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    Nearby coffee, dining, fitness, events, perks, and properties—organized by walking distance.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Resident preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Events</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    See what’s happening tonight and RSVP without juggling apps.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Resident preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Perks Card</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    One card unlocks resident-only perks and access experiences.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Partner preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Visibility</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    Show up when nearby residents and guests are deciding where to go.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Partner preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Activation</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    Perks, events, and offers—measured against real downtown usage.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6">
                  <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                    Partner preview
                  </div>
                  <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">Pilot</h3>
                  <p className="text-[14px] font-inter text-[#111f3d]/75">
                    Start with a pilot, decide with data, and scale visibility where it works.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <FAQAccordionBlock
            sectionEyebrow="Questions"
            sectionTitle="Got questions?"
            sectionIntro=""
            items={FAQ_HOMEPAGE}
            styleVariant="split"
            showNumbers={false}
            allowMultipleOpen={false}
            defaultOpenIndex={0}
            pageType="homepage"
            backgroundVariant="light"
          />
        </div>
      </section>

      <footer className="px-4 md:px-8 py-8 bg-white/30 border-t border-white/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[12px] font-inter text-[#111f3d]/60">
            © 2025 Downtown Perks. Made to move downtown.
          </p>
        </div>
      </footer>
    </div>
  );
}