"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { MapLocation } from "@/app/data/mapData";
import { parseIntent, getUserContext } from "@/lib/intent-parser";
import { trackEvent, buildProfile, type BehaviorProfile } from "@/lib/behavior";
import { rankItems, type RankedLocation } from "@/lib/map-ranking";
import { generateFeed, type FeedCard } from "@/lib/feed";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-900 text-slate-200 md:h-[720px]">
      Loading map…
    </div>
  ),
});

const FEED_BORDER: Record<FeedCard["type"], string> = {
  best: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  trending: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  boosted: "border-purple-400/30 bg-purple-500/10 text-purple-200",
  context: "border-sky-400/20 bg-sky-500/10 text-sky-200",
};

const FEED_LABEL: Record<FeedCard["type"], string> = {
  best: "Best move",
  trending: "Trending",
  boosted: "Partner offer",
  context: "For you",
};

export default function MapView() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<BehaviorProfile>({
    category: {},
    venue: {},
  });

  // Load behavior profile from localStorage once on mount
  useEffect(() => {
    setProfile(buildProfile());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLocations() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/map-data");

        if (!response.ok) {
          throw new Error("Unable to load map data");
        }

        const payload = await response.json();

        if (!isMounted) return;

        const nextLocations = payload.locations ?? [];
        setLocations(nextLocations);
        setSelectedId(nextLocations[0]?.id ?? null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(locations.map((location) => location.category))],
    [locations],
  );

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesCategory =
        category === "All" || location.category === category;
      const haystack = [
        location.name,
        location.category,
        location.address,
        location.perk,
        location.description,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, locations, query]);

  // Decision engine: intent → ranking → feed
  const context = useMemo(() => getUserContext(), []);
  const intent = useMemo(
    () => (query.trim() ? parseIntent(query) : context),
    [query, context],
  );
  const rankedLocations = useMemo(
    () => rankItems(filteredLocations, intent, profile),
    [filteredLocations, intent, profile],
  );
  const feed = useMemo(
    () => generateFeed(rankedLocations, context),
    [rankedLocations, context],
  );
  const bestId = rankedLocations[0]?.id ?? null;

  useEffect(() => {
    if (rankedLocations.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!rankedLocations.some((location) => location.id === selectedId)) {
      setSelectedId(rankedLocations[0].id);
    }
  }, [rankedLocations, selectedId]);

  const selectedLocation = rankedLocations.find(
    (location) => location.id === selectedId,
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const loc = locations.find((l) => l.id === id);
      if (loc) {
        trackEvent("click", {
          id: loc.id,
          category: loc.category,
          name: loc.name,
        });
        setProfile(buildProfile());
      }
    },
    [locations],
  );

  const handleGoNow = useCallback(() => {
    if (!selectedLocation) return;
    trackEvent("go_now", {
      id: selectedLocation.id,
      category: selectedLocation.category,
      name: selectedLocation.name,
    });
    setProfile(buildProfile());
  }, [selectedLocation]);

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#020617_50%,_#020617_100%)] px-4 py-6 text-white md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-[28px] border border-amber-400/20 bg-white/8 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-amber-200 uppercase">
                Downtown Perks
              </span>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Where downtown meets you.
              </h1>
              <p className="max-w-xl text-sm text-slate-300 md:text-base">
                Search places, perks, and nearby moments from one calm surface.
                The API powers the map and the cards below.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div className="text-lg font-semibold text-amber-200">
                  {locations.length}
                </div>
                <div className="text-slate-300">Live pins</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div className="text-lg font-semibold text-amber-200">
                  {categories.length - 1}
                </div>
                <div className="text-slate-300">Categories</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div className="text-lg font-semibold text-amber-200">ATX</div>
                <div className="text-slate-300">Coverage</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur md:p-5">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="search"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Search by place, perk, or address
                </label>
                <input
                  id="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Coffee, live music, rooftop..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-300"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((item) => {
                  const active = item === category;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`rounded-full px-3 py-2 text-sm transition ${
                        active
                          ? "bg-amber-300 text-slate-950"
                          : "border border-white/10 bg-slate-950/60 text-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommendation feed */}
            {!isLoading && !error && feed.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  Recommended
                </p>
                {feed.map((card, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (card.item) handleSelect(card.item.id);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition ${FEED_BORDER[card.type]} ${
                      card.item
                        ? "cursor-pointer hover:brightness-110"
                        : "cursor-default"
                    }`}
                  >
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-70">
                      {FEED_LABEL[card.type]}
                    </span>
                    <p className="mt-0.5 text-sm font-semibold leading-tight">
                      {card.title}
                    </p>
                    <p className="text-xs opacity-70">{card.subtitle}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-300">
                  Loading locations…
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : rankedLocations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-300">
                  No matches yet. Try a broader search.
                </div>
              ) : (
                rankedLocations.map((location: RankedLocation) => {
                  const active = location.id === selectedId;
                  const isTop = location.id === bestId;

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => handleSelect(location.id)}
                      className={`w-full rounded-[22px] border p-4 text-left transition ${
                        active
                          ? "border-amber-300/60 bg-amber-300/10"
                          : "border-white/10 bg-slate-950/40 hover:border-white/20"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-slate-300 uppercase">
                            {location.category}
                          </span>
                          {isTop && (
                            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase">
                              Best
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-amber-200">
                          {location.distance}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-white">
                        {location.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {location.perk}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        {location.address}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="space-y-4">
            <MapCanvas
              locations={rankedLocations}
              selectedId={selectedId}
              bestId={bestId}
              onSelect={handleSelect}
            />

            {selectedLocation ? (
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5 backdrop-blur">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-amber-200 uppercase">
                      Selected stop
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {selectedLocation.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                    {selectedLocation.status}
                  </span>
                </div>
                <p className="text-slate-300">{selectedLocation.description}</p>
                <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <div className="text-slate-400">Perk</div>
                    <div className="mt-1 font-medium">
                      {selectedLocation.perk}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <div className="text-slate-400">Address</div>
                    <div className="mt-1 font-medium">
                      {selectedLocation.address}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/60 p-3">
                    <div className="text-slate-400">Distance</div>
                    <div className="mt-1 font-medium">
                      {selectedLocation.distance}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoNow}
                  className="mt-4 rounded-full bg-amber-300 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 active:scale-95"
                >
                  Go now →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

