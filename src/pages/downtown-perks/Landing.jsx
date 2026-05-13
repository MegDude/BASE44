import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

const DOWNTOWN_FRAMES = [
  "https://images.unsplash.com/photo-1531219572322-a0e28f0de204?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558285549-2a075da29cb5?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549400827-0b1a0f8bf3a0?q=80&w=2670&auto=format&fit=crop",
];

export default function Landing() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DOWNTOWN_FRAMES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#f7f6f2]">
      {/* Hero with Rotating Environmental Images */}
      <section className="relative w-full h-[38vh] md:h-[50vh] overflow-hidden bg-[#111f3d]">
        {/* Rotating Downtown Environment */}
        {DOWNTOWN_FRAMES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Downtown Austin"
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "filter brightness-[0.88] saturate-[0.82]",
              "mix-blend-luminosity",
              "transition-all ease-out",
              activeIndex === index ? "duration-1000" : "duration-500"
            )}
            style={{
              opacity: activeIndex === index ? 1 : 0,
              transform:
                activeIndex === index ? "scale(1.015)" : "scale(1.03)",
              zIndex: activeIndex === index ? 10 : 0,
            }}
          />
        ))}

        {/* Softer Gradient Overlay */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(17,31,61,0.38), rgba(17,31,61,0.10), transparent)"
          }}
        />

        {/* Hero Copy - Minimal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-[32px] md:text-[48px] font-canela leading-tight text-white mb-3">
              Downtown, Made Visible
            </h1>
            <p className="text-[14px] md:text-[16px] text-white/90 font-inter leading-relaxed">
              Discover what's happening nearby. Move with intention. Experience downtown differently.
            </p>
          </div>
        </div>

        {/* Live Status Overlay - Subtle Live Layers */}
        <div className="absolute bottom-6 left-6 z-30 flex flex-wrap gap-2">
          <div className="rounded-full bg-white/72 backdrop-blur-md border border-white/30 px-4 py-2 text-[10px] tracking-[0.12em] uppercase text-[#111f3d] font-inter font-medium">
            Rainey active now
          </div>
          <div className="rounded-full bg-white/72 backdrop-blur-md border border-white/30 px-4 py-2 text-[10px] tracking-[0.12em] uppercase text-[#111f3d] font-inter font-medium">
            4 events tonight
          </div>
        </div>

        {/* Ask-the-Map Floating Button */}
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
          <button className="flex items-center gap-2 px-5 py-3 bg-white/82 backdrop-blur-xl rounded-full border border-white/40 shadow-[0_20px_60px_rgba(17,31,61,0.12)] hover:bg-white/90 transition-all">
            <Search className="w-4 h-4 text-[#111f3d]" />
            <span className="text-[12px] font-inter font-medium text-[#111f3d] uppercase tracking-[0.08em]">
              Ask the map
            </span>
          </button>
        </div>
      </section>

      {/* Live Status Strip */}
      <section className="px-4 md:px-8 py-6 bg-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#c6a55c] rounded-full animate-pulse" />
            <p className="text-[12px] font-inter uppercase tracking-[0.08em] text-[#111f3d]/70">
              <span className="font-semibold text-[#111f3d]">12 active perks</span> nearby • 3 events today
            </p>
          </div>
        </div>
      </section>

      {/* Discovery Chips - Lightweight Utility */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {["Happy Hour", "Dining", "Fitness", "Events", "Savings"].map((chip) => (
              <button
                key={chip}
                className="rounded-full px-4 py-2 bg-white/72 backdrop-blur-md border border-white/40 hover:bg-white/85 transition-all text-[11px] font-inter font-medium uppercase tracking-[0.12em] text-[#111f3d]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Flow Section */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-canela text-[#111f3d] mb-12">
            Experience Downtown Differently
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Discover", desc: "Find what's nearby" },
              { title: "Move", desc: "Navigate your interests" },
              { title: "Experience", desc: "Participate in events" },
              { title: "Save", desc: "Keep track of favorites" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-[28px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6 hover:shadow-[0_24px_72px_rgba(17,31,61,0.12)] transition-all"
              >
                <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">{item.title}</h3>
                <p className="text-[14px] font-inter text-[#111f3d]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact FAQ */}
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

      {/* Minimal Footer */}
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

      {/* Live Status Strip */}
      <section className="px-4 md:px-8 py-6 bg-white/40 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#c6a55c] rounded-full animate-pulse" />
            <p className="text-[12px] font-inter uppercase tracking-[0.08em] text-[#111f3d]/70">
              <span className="font-semibold text-[#111f3d]">12 active perks</span> nearby • 3 events today
            </p>
          </div>
        </div>
      </section>

      {/* Discovery Chips - Lightweight Utility */}
      <section className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {["Happy Hour", "Dining", "Fitness", "Events", "Savings"].map((chip) => (
              <button
                key={chip}
                className="rounded-full px-4 py-2 bg-white/72 backdrop-blur-md border border-white/40 hover:bg-white/85 transition-all text-[11px] font-inter font-medium uppercase tracking-[0.12em] text-[#111f3d]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Flow Section (Replacing Process) */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-canela text-[#111f3d] mb-12">
            Experience Downtown Differently
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Discover", desc: "Find what's nearby" },
              { title: "Move", desc: "Navigate your interests" },
              { title: "Experience", desc: "Participate in events" },
              { title: "Save", desc: "Keep track of favorites" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-[28px] bg-white/82 backdrop-blur-sm shadow-[0_18px_60px_rgba(17,31,61,0.08)] p-6 hover:shadow-[0_24px_72px_rgba(17,31,61,0.12)] transition-all"
              >
                <div className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="text-[18px] font-canela text-[#111f3d] mb-2">{item.title}</h3>
                <p className="text-[14px] font-inter text-[#111f3d]/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact FAQ */}
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

      {/* Minimal Footer */}
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
