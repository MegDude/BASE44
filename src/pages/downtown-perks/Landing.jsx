import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import MapContainer from "../../components/resident-shell/map/MapContainer";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full bg-[#f7f6f2]">
      {/* Hero with Embedded Map (38-44vh max on mobile) */}
      <section className="relative w-full md:h-[50vh] h-[40vh] overflow-hidden">
        {/* Live Map Background */}
        <MapContainer />

        {/* Overlay Content Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Hero Copy - Minimal, Above Map */}
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

        {/* Ask-the-Map Floating Button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
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
