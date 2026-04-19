import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Calendar, Gift, Sparkles, MapPin } from "lucide-react";
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
    navigate(`/downtown-perks/explore?q=${encodeURIComponent(fill)}`);
    setIntentExpanded(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/map${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
    setSearchQuery("");
    setIntentExpanded(false);
  }

  function handleOpenMap() {
    navigate("/downtown-perks/explore");
  }

  return (
    <section className="relative w-full min-h-[92svh] overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
          alt="Downtown Austin"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(252,251,248,0.94)] via-[rgba(252,251,248,0.82)] to-[rgba(252,251,248,0.92)]" />
      </div>

      <div className="relative z-10 flex min-h-[92svh] flex-col items-center justify-center px-4 py-20 md:py-24">
        {/* Brand tag */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 flex items-center gap-2"
        >
          <span className="rounded-full border border-white/40 bg-white/42 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(218,24%,28%)] backdrop-blur-md">
            Downtown Perks
          </span>
        </motion.div>

        {/* Refined hero shell */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full max-w-3xl rounded-[30px] border border-white/38 bg-white/[0.68] p-5 shadow-[0_24px_60px_rgba(14,28,54,0.16)] backdrop-blur-xl md:p-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-[hsl(218,42%,14%)] md:text-[56px]">
              Where downtown meets you
            </h1>

            <p className="mt-3 text-sm leading-6 text-[hsl(218,20%,42%)] md:mt-4 md:text-[15px]">
              Everything nearby — in one map.
            </p>
          </div>

          {/* Search shell stays more solid than outer card */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-5 max-w-xl rounded-[22px] border border-white/70 bg-white/[0.92] p-2 shadow-[0_12px_30px_rgba(14,28,54,0.10)] md:mt-6"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[hsl(218,20%,86%)] bg-white px-4 transition-colors focus-within:border-primary/40">
                <Search className="h-4 w-4 flex-shrink-0 text-foreground/45" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIntentExpanded(true)}
                  placeholder="Where should I go right now?"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
              >
                Open map
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <AnimatePresence>
              {intentExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 overflow-hidden rounded-[18px] border border-[hsl(218,20%,88%)] bg-white shadow-lg"
                >
                  <div className="divide-y divide-[hsl(218,20%,92%)]">
                    {INTENT_PROMPTS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePromptClick(item.fill)}
                        className="group w-full px-4 py-3 text-left transition-colors hover:bg-[hsl(42,24%,97%)]"
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
                      className="w-full px-4 py-2.5 text-[11px] text-foreground/40 transition-colors hover:text-foreground/60"
                    >
                      Dismiss
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
                    className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all ${
                      isActive
                        ? "border-primary/30 bg-primary/10 text-foreground"
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
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
            >
              Explore downtown
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIntentExpanded(true)}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] border border-white/75 bg-white/76 px-6 py-3 text-sm font-medium text-foreground shadow-[0_8px_18px_rgba(14,28,54,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-white active:translate-y-0"
            >
              Ask the map
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
