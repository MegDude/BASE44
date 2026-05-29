import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Calendar, Gift, Sparkles, MapPin, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const INTENT_PROMPTS = [
  {
    q: "Where do you want to go?",
    a: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.",
    fill: "Coffee near me",
  },
  {
    q: "What do you want to do?",
    a: "See what's on tonight. Find something worth showing up for.",
    fill: "Events tonight",
  },
  {
    q: "Who do you want to meet?",
    a: "See who's going. Join in. Make a plan.",
    fill: "What's happening nearby",
  },
];

const FILTER_CHIPS = [
  { label: "Venues", icon: MapPin },
  { label: "Events", icon: Calendar },
  { label: "Perks", icon: Gift },
  { label: "5 min walk", icon: Sparkles },
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Venues");
  const [intentExpanded, setIntentExpanded] = useState(false);
  const navigate = useNavigate();

  function handlePromptClick(fill) {
    navigate(`/map?mode=resident&tab=map&q=${encodeURIComponent(fill)}`);
    setIntentExpanded(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/map?mode=resident&tab=map${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`);
    setSearchQuery("");
    setIntentExpanded(false);
  }

  function handleOpenMap() {
    navigate("/map?mode=resident&tab=map");
  }

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#F7F8FB]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
          alt="Downtown Austin"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/26 via-white/10 to-[rgba(11,31,51,0.14)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 md:py-28">
        {/* Brand tag */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex items-center gap-2"
        >
          <span className="border border-white/50 bg-white/72 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[#0B1F33] backdrop-blur-md">
            Downtown Perks
          </span>
        </motion.div>

        {/* Refined hero shell */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full max-w-3xl border border-white/44 bg-white/[0.72] p-5 shadow-[0_18px_48px_rgba(11,31,51,0.12)] backdrop-blur-[20px] md:p-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-[30px] font-semibold leading-[1.03] text-[#0B1F33] md:text-[42px]">
              Your downtown, connected in one map.
            </h1>

            <p className="mt-3 text-[13px] leading-6 text-[#0B1F33]/60 md:mt-4 md:text-[15px]">
              Explore places, perks, events, and experiences happening around you right now.
            </p>
          </div>

          {/* Search shell stays more solid than outer card */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-5 max-w-xl border border-white/70 bg-white/[0.92] p-2 shadow-[0_10px_28px_rgba(11,31,51,0.09)] md:mt-6"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex h-10 flex-1 items-center gap-3 border border-[#0B1F33]/10 bg-white px-4 transition-colors focus-within:border-[#B38F4F]/60">
                <Search className="h-4 w-4 flex-shrink-0 text-foreground/45" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIntentExpanded(true)}
                  placeholder="Search downtown..."
                  className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-foreground/35 transition-colors hover:text-foreground/60"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 bg-[#0B1F33] px-5 text-[13px] font-medium text-white shadow-[0_10px_24px_rgba(11,31,51,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#081521] active:translate-y-0"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {intentExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 max-h-[min(52vh,360px)] overflow-y-auto border border-[#0B1F33]/8 bg-white shadow-lg"
                >
                  <div className="divide-y divide-[#0B1F33]/8">
                    {INTENT_PROMPTS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePromptClick(item.fill)}
                        className="group w-full px-4 py-2.5 text-left transition-colors hover:bg-[#F7F8FB]"
                      >
                        <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                          {item.q}
                        </div>
                        <div className="text-[12px] leading-relaxed text-foreground/60">{item.a}</div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIntentExpanded(false)}
                      className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0B1F33]/52 transition-colors hover:text-[#0B1F33]"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      Roll up
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {FILTER_CHIPS.map((chip) => {
                const Icon = chip.icon;
                const isActive = activeChip === chip.label;

                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setActiveChip(chip.label)}
                    className={`inline-flex h-9 items-center gap-2 border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all ${
                      isActive
                        ? "border-[#B38F4F]/45 bg-[#0B1F33]/12 text-[#0B1F33]"
                        : "border-white/70 bg-white/76 text-foreground/70 backdrop-blur-sm hover:border-primary/25 hover:bg-white hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </form>

          {/* CTA row */}
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-6">
            <button
              type="button"
              onClick={handleOpenMap}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 bg-[#0B1F33] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_10px_24px_rgba(11,31,51,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#081521] active:translate-y-0"
            >
              Open the Map
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/partners")}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 border border-white/75 bg-white/76 px-5 py-2.5 text-[13px] font-medium text-foreground shadow-[0_8px_18px_rgba(11,31,51,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-white active:translate-y-0"
            >
              For Partners
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {intentExpanded && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setIntentExpanded(false)}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
