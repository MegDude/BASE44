import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

const chips = ["Venues", "Events", "Perks", "5 min walk"];

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");

  const openMap = (value = query) => {
    const cleaned = value.trim();
    window.location.href = cleaned
      ? `/map?q=${encodeURIComponent(cleaned)}`
      : "/map";
  };

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#f7f7fb] px-4 pt-24 pb-6 sm:px-6 md:min-h-screen md:pt-32 md:pb-10">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          className="h-full w-full object-cover"
          alt="Downtown Austin"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f7fb]/40 via-[#f7f7fb]/68 to-[#f7f7fb]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(216,188,114,0.20),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(11,27,58,0.12),transparent_30%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(92vh-8rem)] w-full max-w-6xl items-end md:min-h-[calc(100vh-10rem)]">
        <div className="w-full rounded-[2rem] bg-white/68 p-5 shadow-[0_24px_70px_rgba(11,27,58,0.12)] ring-1 ring-white/70 backdrop-blur-2xl sm:p-7 md:p-9">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60">
              Downtown Perks
            </p>
            <h1 className="font-heading text-4xl font-medium leading-[0.98] tracking-tight text-primary sm:text-5xl md:text-7xl">
              Where downtown meets you.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Everything nearby — in one map.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground/72 sm:text-base">
              You’re already downtown. This helps you decide what to do next — coffee, dinner, drinks, events, and perks close enough to actually go.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              openMap();
            }}
            className="mx-auto mt-7 max-w-2xl rounded-[1.35rem] bg-white/86 p-2 shadow-[0_16px_40px_rgba(11,27,58,0.10)] ring-1 ring-black/[0.04] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex min-h-12 flex-1 items-center gap-3 rounded-[1rem] bg-[#f7f7fb] px-4 ring-1 ring-black/[0.04]">
                <MapPin className="h-4 w-4 text-primary/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where should I go right now?"
                  className="w-full bg-transparent text-[15px] text-primary outline-none placeholder:text-primary/38"
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1rem] bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[0_10px_28px_rgba(11,27,58,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-primary/92 active:translate-y-0"
              >
                Open map
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mx-auto mt-4 flex max-w-2xl gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => openMap(chip)}
                className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-primary/72 ring-1 ring-black/[0.05] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-primary"
              >
                {chip}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-primary/48">
            Try coffee, dinner, drinks, events, or 5 min walk.
          </p>
        </div>
      </div>
    </section>
  );
}
