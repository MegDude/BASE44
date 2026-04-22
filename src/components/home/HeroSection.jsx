import { ArrowRight, Compass, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UnifiedMapShell from "@/components/map/unified/UnifiedMapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";
import MapFilterBars from "@/components/map/shared/MapFilterBars";
import {
  ASK_MAP_QUESTIONS,
  PRIMARY_SEARCH_PRESETS,
  SECONDARY_SEARCH_PRESETS,
  getPrimaryPresetDefinition,
} from "@/lib/map/searchUiConfig";

const AUSTIN_CENTER = [30.267, -97.743];
const VALUE_POINTS = [
  "One map",
  "Everything nearby",
  "No app download",
  "No login friction",
];

export default function HeroSection({ mapContext, onExplore, onAsk }) {
  const [query, setQuery] = useState(mapContext?.query || "");
  const [activePrimary, setActivePrimary] = useState(mapContext?.category || "all");
  const [activeSecondary, setActiveSecondary] = useState(mapContext?.toggles || []);
  const [showAskPanel, setShowAskPanel] = useState(false);

  useEffect(() => {
    setQuery(mapContext?.query || "");
    setActivePrimary(mapContext?.category || "all");
    setActiveSecondary(mapContext?.toggles || []);
  }, [mapContext?.requestKey]);

  const preset = useMemo(() => getPrimaryPresetDefinition(activePrimary), [activePrimary]);
  const previewCategory = preset.categories?.[0] || "all";
  const previewQuery = query.trim() || preset.query || "";
  const { items } = useSharedMapFeed({
    query: previewQuery,
    activeCategory: previewCategory,
    limit: 30,
  });

  const previewItems = useMemo(() => {
    let nextItems = [...(items || [])];

    if (preset.categories?.length) {
      nextItems = nextItems.filter((item) => preset.categories.includes(item.category));
    }

    if (activeSecondary.includes("crowd")) {
      nextItems = nextItems.filter(
        (item) => Boolean(item.metadata?.isTrending || (item.metadata?.popularity ?? 0) >= 70)
      );
    }

    if (activeSecondary.includes("perks")) {
      nextItems = nextItems.filter((item) => Boolean(item.perk?.value || item.type === "perk"));
    }

    return nextItems;
  }, [activeSecondary, items, preset.categories]);

  const featuredItems = previewItems.slice(0, 3);
  const mapCenter = featuredItems[0]?.location
    ? [featuredItems[0].location.latitude, featuredItems[0].location.longitude]
    : AUSTIN_CENTER;

  function toggleSecondary(id) {
    setActiveSecondary((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function getSearchPayload(nextQuery = query, askMode = false) {
    return {
      query: String(nextQuery || "").trim(),
      category: activePrimary,
      walkMinutes: null,
      askMode,
      toggles: activeSecondary,
    };
  }

  function handleSearch(e) {
    e.preventDefault();
    setShowAskPanel(false);
    onExplore?.(getSearchPayload(query, false));
  }

  function handleOpenMap() {
    setShowAskPanel(false);
    onExplore?.(getSearchPayload(query, false));
  }

  function handleAskMap(nextQuery = query) {
    setShowAskPanel(false);
    onAsk?.(getSearchPayload(nextQuery, true));
  }

  function handleAskPrompt(nextQuery) {
    setQuery(nextQuery);
    handleAskMap(nextQuery);
  }

  return (
    <section className="relative overflow-hidden border-b border-[rgba(11,31,51,0.08)] bg-[#fbfaf7] pt-[84px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,162,105,0.16),transparent_24rem)]" />
      <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6 md:pb-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="flex flex-col justify-between gap-5 rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_18px_48px_rgba(11,31,51,0.07)] md:p-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(198,162,105,0.10)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B1F33]">
                Downtown Perks
              </div>

              <h1 className="mt-4 font-heading text-[40px] font-semibold leading-[0.95] tracking-[-0.05em] text-[#0B1F33] md:text-[64px]">
                Where downtown
                <br />
                meets you
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[rgba(11,31,51,0.68)]">
                One map. Everything nearby. No app download. No login friction. Search less, do more.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {VALUE_POINTS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.62)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleOpenMap}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-[#0B1F33] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(11,31,51,0.18)] transition-all hover:-translate-y-[1px]"
              >
                Explore live map
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/partners"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.10)] bg-white px-5 text-sm font-semibold text-[#0B1F33] transition-all hover:bg-[rgba(11,31,51,0.03)]"
              >
                Partner platform
                <Compass className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-[rgba(11,31,51,0.08)] bg-white shadow-[0_24px_60px_rgba(11,31,51,0.08)]">
            <div className="relative h-[560px] overflow-hidden md:h-[640px]">
              <UnifiedMapShell
                items={previewItems}
                markerIcon={(item, active) => createMarker(item, { isSelected: active })}
                onMarkerSelect={() => {}}
                mapCenter={mapCenter}
                mapZoom={14}
                selectedId={featuredItems[0]?.id}
                className="h-full w-full"
              />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 md:p-4">
                <div className="pointer-events-auto mx-auto max-w-[560px] overflow-hidden rounded-[22px] border border-[rgba(11,31,51,0.10)] bg-white/94 shadow-[0_18px_42px_rgba(11,31,51,0.10)] backdrop-blur">
                  <div className="border-b border-[rgba(11,31,51,0.08)] px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C6A269]">
                          Ask the map
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#0B1F33]">
                          Search less. Do more.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAskPanel((current) => !current)}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.03)] px-3 text-xs font-semibold text-[#0B1F33]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {showAskPanel ? "Hide prompts" : "Open prompts"}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSearch} className="px-3 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[rgba(11,31,51,0.10)] bg-white px-4">
                        <Search className="h-4 w-4 shrink-0 text-[rgba(11,31,51,0.48)]" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onFocus={() => setShowAskPanel(true)}
                          placeholder="Where should I go right now?"
                          className="flex-1 bg-transparent text-sm text-[#0B1F33] outline-none placeholder:text-[rgba(11,31,51,0.40)]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#0B1F33] px-5 text-sm font-semibold text-white"
                      >
                        Open map
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>

                  <MapFilterBars
                    primaryOptions={PRIMARY_SEARCH_PRESETS}
                    secondaryOptions={SECONDARY_SEARCH_PRESETS}
                    activePrimary={activePrimary}
                    activeSecondary={activeSecondary}
                    onPrimarySelect={setActivePrimary}
                    onSecondaryToggle={toggleSecondary}
                  />

                  {showAskPanel ? (
                    <div className="divide-y divide-[rgba(11,31,51,0.08)] bg-white">
                      {ASK_MAP_QUESTIONS.map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => handleAskPrompt(item.query)}
                          className="block w-full px-4 py-4 text-left transition-colors hover:bg-[rgba(11,31,51,0.03)]"
                        >
                          <h3 className="font-heading text-[28px] font-semibold tracking-[-0.03em] text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-[15px] leading-[1.8] text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowAskPanel(false)}
                        className="w-full px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,31,51,0.46)]"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 md:p-4">
                <div className="pointer-events-auto mx-auto grid max-w-[560px] gap-2 rounded-[22px] border border-[rgba(11,31,51,0.10)] bg-white/94 p-3 shadow-[0_18px_42px_rgba(11,31,51,0.10)] backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(11,31,51,0.48)]">
                      Everything nearby
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenMap}
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0B1F33]"
                    >
                      Open full map
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {featuredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={handleOpenMap}
                        className="rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white px-3 py-3 text-left transition-all hover:border-[rgba(11,31,51,0.18)]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C6A269]">
                          {item.type}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#0B1F33]">
                          {item.name}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-[rgba(11,31,51,0.58)]">
                          {item.perk?.value || item.description || item.address}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
