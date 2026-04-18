import { useState } from "react";
import { ArrowRight, ExternalLink, MapPin, Sparkles } from "lucide-react";

const PRESET_QUERIES = [
  { label: "Venues", value: "best places to hang out nearby" },
  { label: "Events", value: "what is happening downtown tonight" },
  { label: "Perks", value: "best local deals and perks nearby" },
  { label: "5 min walk", value: "best spots within a 5 minute walk" },
];

function buildMapUrl(place) {
  if (!place) {
    return "https://www.google.com/maps?q=downtown+austin&z=14&output=embed";
  }

  const search = place.mapQuery || `${place.name} Downtown Austin TX`;
  return `https://www.google.com/maps?q=${encodeURIComponent(search)}&z=15&output=embed`;
}

export default function HeroSection({ heroImage }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapSrc = buildMapUrl(selectedPlace);
  const mapLink = selectedPlace
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.mapQuery || `${selectedPlace.name} Downtown Austin TX`)}`
    : "https://www.google.com/maps/search/?api=1&query=downtown+austin";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!query.trim()) {
      setError("Enter what you want to find first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ask-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          location: "Downtown Austin",
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      const places = Array.isArray(data.places) ? data.places : [];

      setResults(places);
      setSelectedPlace(places[0] || null);

      if (!places.length) {
        setError("No places came back. Try a more specific search.");
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("The map assistant could not load results right now.");
      setResults([]);
      setSelectedPlace(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Downtown Austin skyline"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,32,0.18)_0%,rgba(11,18,32,0.55)_48%,rgba(11,18,32,0.78)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[92vh] w-full max-w-7xl items-end px-6 pb-12 pt-28 md:px-8 lg:px-10">
        <div className="w-full rounded-[32px] border border-white/35 bg-white/58 px-6 py-8 shadow-[0_30px_80px_rgba(7,16,30,0.26)] backdrop-blur-xl md:px-8 md:py-10 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(218,42%,14%)]">
              <Sparkles className="h-3.5 w-3.5" />
              Ask the map
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.03em] text-[hsl(218,42%,14%)] md:text-5xl lg:text-6xl">
              Downtown made easier to use.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[hsl(218,18%,28%)] md:text-lg">
              Ask one question and get ranked places, a live map preview, and a faster answer to what to do next.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 max-w-3xl rounded-[24px] border border-white/80 bg-white shadow-[0_18px_44px_rgba(14,28,54,0.12)]"
          >
            <div className="p-2.5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex h-13 flex-1 items-center gap-3 rounded-[18px] border border-[hsl(218,20%,82%)] bg-white px-4 transition-all focus-within:border-[hsl(218,42%,34%)] focus-within:shadow-[0_0_0_3px_rgba(36,63,110,0.08)]">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-foreground/45" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="text"
                    placeholder="Where should I go right now?"
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-[hsl(218,42%,14%)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(14,28,54,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_28px_rgba(14,28,54,0.24)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Searching..." : "Open map"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {PRESET_QUERIES.map((preset, index) => {
                  const isPrimary = index === 0;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuery(preset.value)}
                      className={isPrimary
                        ? "inline-flex h-9 items-center gap-2 rounded-full border border-[#cfaf5a]/45 bg-[#cfaf5a]/12 px-3.5 text-xs font-semibold tracking-[0.01em] text-[hsl(218,42%,14%)] transition-all"
                        : "inline-flex h-9 items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3.5 text-xs font-semibold tracking-[0.01em] text-foreground/70 backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-white hover:text-foreground"}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {error ? (
            <p className="mx-auto mt-3 max-w-3xl text-sm text-white/92">
              {error}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-[26px] border border-white/40 bg-white/70 shadow-[0_18px_40px_rgba(14,28,54,0.12)] backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Live map preview
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedPlace ? selectedPlace.name : "Downtown Austin"}
                    </p>
                  </div>

                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(218,42%,18%)]"
                  >
                    Open full map
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <iframe
                  title="Downtown map preview"
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[380px] w-full border-0"
                />
              </div>

              <div className="rounded-[26px] border border-white/40 bg-white/70 p-4 shadow-[0_18px_40px_rgba(14,28,54,0.12)] backdrop-blur-md md:p-5">
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Best matches
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[hsl(218,42%,14%)]">
                    AI-ranked picks for “{query}”
                  </h2>
                </div>

                <div className="space-y-3">
                  {results.map((place, index) => {
                    const isSelected = selectedPlace?.name === place.name;

                    return (
                      <button
                        key={`${place.name}-${index}`}
                        type="button"
                        onClick={() => setSelectedPlace(place)}
                        className={isSelected
                          ? "w-full rounded-[18px] border border-[hsl(218,42%,32%)] bg-white px-4 py-3 text-left shadow-[0_10px_24px_rgba(14,28,54,0.08)]"
                          : "w-full rounded-[18px] border border-slate-200 bg-white/78 px-4 py-3 text-left transition-all hover:border-slate-300 hover:bg-white"}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[hsl(218,42%,14%)]">
                              {place.name}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {place.reason}
                            </p>
                          </div>
                          <span className="mt-0.5 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
                            {index + 1}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-3xl rounded-[24px] border border-white/30 bg-white/28 px-5 py-4 backdrop-blur-md">
              <p className="text-sm text-white/90">
                Search for a vibe, event, deal, or walkable plan. The assistant will rank places and load a live map preview below.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
