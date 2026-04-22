import { ArrowRight, Search, Calendar, Gift, Sparkles, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

const FILTER_CHIPS = [
  { id: "venue", label: "Venues", icon: MapPin },
  { id: "event", label: "Events", icon: Calendar },
  { id: "perk", label: "Perks", icon: Gift },
  { id: "walk", label: "5 min walk", icon: Sparkles },
];

const CHIP_PROMPTS = {
  venue: [
    {
      title: "Where should I eat or drink?",
      subtitle: "Coffee, dinner, patios, and everyday stops that are actually nearby.",
      query: "best venues nearby right now",
    },
    {
      title: "What is open close by?",
      subtitle: "Useful places you can walk to without leaving the map flow.",
      query: "open now nearby",
    },
  ],
  event: [
    {
      title: "What is on tonight?",
      subtitle: "Live events, music, and things worth showing up for nearby.",
      query: "events tonight",
    },
    {
      title: "What can I do right now?",
      subtitle: "Immediate options for a plan without extra searching.",
      query: "live events nearby",
    },
  ],
  perk: [
    {
      title: "What perks can I actually use?",
      subtitle: "Real resident value at places you would go anyway.",
      query: "resident perks nearby",
    },
    {
      title: "What is worth saving?",
      subtitle: "Offers tied to actual locations instead of decorative coupons.",
      query: "best perks downtown",
    },
  ],
  walk: [
    {
      title: "What is within five minutes?",
      subtitle: "The shortest useful options around you right now.",
      query: "5 minute walk nearby",
    },
    {
      title: "What can I do fast?",
      subtitle: "Quick nearby places, events, and perks without a long walk.",
      query: "quick nearby options",
    },
  ],
};

const DEFAULT_ASK_PROMPTS = [
  {
    title: "Where do you want to go?",
    subtitle: "Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.",
    query: "coffee nearby",
  },
  {
    title: "What do you want to do?",
    subtitle: "See what's on tonight. Find something worth showing up for.",
    query: "events tonight",
  },
  {
    title: "Who do you want to meet?",
    subtitle: "See who's going. Join in. Make a plan.",
    query: "live music nearby",
  },
];

export default function HeroSection({ mapContext, onExplore, onAsk, children }) {
  const [query, setQuery] = useState(mapContext?.query || "");
  const [category, setCategory] = useState(mapContext?.category || "venue");
  const [showAskPanel, setShowAskPanel] = useState(false);

  useEffect(() => {
    setQuery(mapContext?.query || "");
    setCategory(mapContext?.category === "all" ? "venue" : mapContext?.category || "venue");
  }, [mapContext?.requestKey]);

  function getCurrentSelection() {
    if (category === "walk") {
      return {
        category: "all",
        walkMinutes: 5,
      };
    }

    return {
      category,
      walkMinutes: null,
    };
  }

  function handleSearch(e) {
    e.preventDefault();
    const selection = getCurrentSelection();
    setShowAskPanel(false);
    onExplore?.({
      query: query.trim(),
      category: selection.category,
      walkMinutes: selection.walkMinutes,
    });
  }

  function handleOpenMap() {
    const selection = getCurrentSelection();
    setShowAskPanel(false);
    onExplore?.({
      query: query.trim(),
      category: selection.category,
      walkMinutes: selection.walkMinutes,
    });
  }

  function handleAskMap(nextQuery = query) {
    const selection = getCurrentSelection();
    setShowAskPanel(false);
    onAsk?.({
      query: String(nextQuery || "").trim(),
      category: selection.category,
      walkMinutes: selection.walkMinutes,
    });
  }

  function handleAskPrompt(nextQuery) {
    setQuery(nextQuery);
    handleAskMap(nextQuery);
  }

  function handleChipClick(chipId) {
    setCategory(chipId);
    setShowAskPanel(true);
  }

  const promptSet = CHIP_PROMPTS[category] || DEFAULT_ASK_PROMPTS;

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#f6f3ee]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80"
          alt="Downtown Austin"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/26 via-white/10 to-[rgba(15,23,42,0.14)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 md:py-24">
        {/* Brand tag */}
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-full border border-white/40 bg-white/42 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(218,24%,28%)] backdrop-blur-md">
            Downtown Perks
          </span>
        </div>

        {/* Refined hero shell */}
        <div className="w-full max-w-6xl rounded-[30px] border border-white/38 bg-white/[0.68] p-5 shadow-[0_24px_60px_rgba(14,28,54,0.16)] backdrop-blur-xl md:p-8">
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowAskPanel(true)}
                  placeholder="Where should I go right now?"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowAskPanel((current) => !current)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(218,20%,86%)] bg-[hsl(42,26%,96%)] text-[hsl(218,42%,14%)] transition hover:border-primary/25 hover:bg-white"
                  aria-label="Ask the map"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
              >
                Open map
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {showAskPanel && (
              <div className="mt-2 overflow-hidden rounded-[18px] border border-[hsl(218,20%,88%)] bg-white shadow-lg">
                <div className="divide-y divide-[hsl(218,20%,92%)]">
                  {promptSet.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className="group w-full px-4 py-3 text-left transition-colors hover:bg-[hsl(42,24%,97%)]"
                      onClick={() => handleAskPrompt(item.query)}
                    >
                      <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                        {item.title}
                      </div>
                      <div className="text-[12px] leading-relaxed text-foreground/60">
                        {item.subtitle}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-[11px] text-foreground/40 transition-colors hover:text-foreground/60"
                    onClick={() => setShowAskPanel(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Filter chips */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {FILTER_CHIPS.map((chip) => {
                const Icon = chip.icon;
                const isActive = category === chip.id;

                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleChipClick(chip.id)}
                    className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold tracking-[0.01em] transition-all ${
                      isActive
                        ? "border-gold/40 bg-gold/10 text-[hsl(218,42%,14%)]"
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
              className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
            >
              Explore downtown
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {children ? <div className="mt-6 md:mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
