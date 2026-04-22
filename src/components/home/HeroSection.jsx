import { ArrowRight, Search, Calendar, Gift, Sparkles, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FILTER_CHIPS = [
  { id: "venues", label: "Venues", icon: MapPin },
  { id: "events", label: "Events", icon: Calendar },
  { id: "perks", label: "Perks", icon: Gift },
  { id: "walk", label: "5 min walk", icon: Sparkles },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("venues");
  const [showAskPanel, setShowAskPanel] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("category", category);
    if (query.trim()) params.set("query", query.trim());
    navigate(`/downtown-perks/explore?${params.toString()}`);
  }

  function handleOpenMap() {
    navigate("/downtown-perks/explore");
  }

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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 md:py-28">
        {/* Brand tag */}
        <div className="mb-5 flex items-center gap-2">
          <span className="rounded-full border border-white/40 bg-white/42 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(218,24%,28%)] backdrop-blur-md">
            Downtown Perks
          </span>
        </div>

        {/* Refined hero shell */}
        <div className="w-full max-w-3xl rounded-[30px] border border-white/38 bg-white/[0.68] p-5 shadow-[0_24px_60px_rgba(14,28,54,0.16)] backdrop-blur-xl md:p-8">
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
                  <button
                    type="button"
                    className="group w-full px-4 py-3 text-left transition-colors hover:bg-[hsl(220,20%,97%)]"
                    onClick={() => navigate("/downtown-perks/explore?mode=ask")}
                  >
                    <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                      Where do you want to go?
                    </div>
                    <div className="text-[12px] leading-relaxed text-foreground/60">
                      Coffee. Dinner. Groceries. Fitness. Drinks. All within walking distance.
                    </div>
                  </button>
                  <button
                    type="button"
                    className="group w-full px-4 py-3 text-left transition-colors hover:bg-[hsl(220,20%,97%)]"
                    onClick={() => navigate("/downtown-perks/explore?mode=ask&query=events%20tonight")}
                  >
                    <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                      What do you want to do?
                    </div>
                    <div className="text-[12px] leading-relaxed text-foreground/60">
                      See what&apos;s on tonight. Find something worth showing up for.
                    </div>
                  </button>
                  <button
                    type="button"
                    className="group w-full px-4 py-3 text-left transition-colors hover:bg-[hsl(220,20%,97%)]"
                    onClick={() => navigate("/downtown-perks/explore?mode=ask&query=live%20music%20nearby")}
                  >
                    <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                      Who do you want to meet?
                    </div>
                    <div className="text-[12px] leading-relaxed text-foreground/60">
                      See who&apos;s going. Join in. Make a plan.
                    </div>
                  </button>
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
                    onClick={() => setCategory(chip.id)}
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
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] bg-[hsl(218,42%,14%)] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] active:translate-y-0"
            >
              Explore downtown
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/downtown-perks/explore?mode=ask")}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[16px] border border-white/75 bg-white/76 px-6 py-3 text-sm font-medium text-foreground shadow-[0_8px_18px_rgba(14,28,54,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-white active:translate-y-0"
            >
              Ask the map
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
