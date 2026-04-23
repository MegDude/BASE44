import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Clock3,
  Compass,
  Filter,
  Gift,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
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

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=2400&q=80";

const AUSTIN_CENTER = [30.267, -97.743];

function getSearchDefaults(view) {
  const preset = getPrimaryPresetDefinition(view);
  return {
    query: preset?.query || "",
    walkMinutes: null,
  };
}

function getPreviewMeta(item) {
  const walkMinutes = item?.metadata?.walkMinutes;
  const supporting =
    item?.perk?.value ||
    item?.perk_value ||
    item?.description ||
    item?.category ||
    "Live nearby";

  return {
    title: item?.title || item?.name || "Downtown pick",
    supporting,
    detail: Number.isFinite(walkMinutes)
      ? `${walkMinutes} min walk`
      : item?.district || item?.address || "Downtown Austin",
  };
}

function filterPreviewItems(items, view) {
  if (!Array.isArray(items)) return [];
  const preset = getPrimaryPresetDefinition(view);
  const allowedTypes = new Set((preset?.entityTypes || []).map((type) => (type === "building" ? "property" : type)));
  const allowedCategories = new Set((preset?.categories || []).map((category) => String(category).toLowerCase()));

  return items.filter((item) => {
    const itemType = item?.type === "building" ? "property" : item?.type;
    const itemCategory = String(item?.category || item?.subcategory || "").toLowerCase();

    if (allowedTypes.size > 0 && !allowedTypes.has(itemType)) {
      return false;
    }

    if (allowedCategories.size > 0 && !allowedCategories.has(itemCategory)) {
      return false;
    }

    return true;
  });
}

export default function HeroSection({ mapContext, onExplore, onAsk }) {
  const [query, setQuery] = useState(mapContext?.query || "");
  const [interactionMode, setInteractionMode] = useState(mapContext?.askMode ? "ask" : "search");
  const [activePrimary, setActivePrimary] = useState(mapContext?.category || "all");
  const [activeSecondary, setActiveSecondary] = useState(
    Array.isArray(mapContext?.toggles) ? mapContext.toggles : []
  );
  const [walkMinutes, setWalkMinutes] = useState(
    Number.isFinite(mapContext?.walkMinutes) ? mapContext.walkMinutes : null
  );
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectionDismissed, setSelectionDismissed] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);

  useEffect(() => {
    setQuery(mapContext?.query || "");
    setInteractionMode(mapContext?.askMode ? "ask" : "search");
    setActivePrimary(mapContext?.category || "all");
    setActiveSecondary(Array.isArray(mapContext?.toggles) ? mapContext.toggles : []);
    setWalkMinutes(Number.isFinite(mapContext?.walkMinutes) ? mapContext.walkMinutes : null);
  }, [mapContext?.requestKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setResultsExpanded(window.innerWidth >= 1024);
  }, []);

  const activeSecondarySet = useMemo(() => new Set(activeSecondary), [activeSecondary]);
  const searchDefaults = useMemo(() => getSearchDefaults(activePrimary), [activePrimary]);
  const previewQuery = String(query || "").trim() || searchDefaults.query;

  const { items } = useSharedMapFeed({
    query: previewQuery,
    activeCategory: "all",
    limit: 40,
  });

  const previewItems = useMemo(
    () =>
      filterPreviewItems(items, activePrimary)
        .filter((item) => {
          if (walkMinutes && (item?.metadata?.walkMinutes ?? 999) > walkMinutes) {
            return false;
          }

          if (
            activeSecondarySet.has("perks") &&
            !(item?.type === "perk" || item?.perk?.value || item?.perk_value)
          ) {
            return false;
          }

          if (
            activeSecondarySet.has("crowd") &&
            !(item?.isTrending || item?.isLive || item?.metadata?.crowdLevel)
          ) {
            return false;
          }

          return true;
        })
        .slice(0, 18),
    [activePrimary, activeSecondarySet, items, walkMinutes]
  );

  useEffect(() => {
    if (!previewItems.length) {
      setSelectedEntity(null);
      setSelectionDismissed(false);
      return;
    }

    setSelectedEntity((current) => {
      if (current && previewItems.some((item) => item.id === current.id)) {
        return previewItems.find((item) => item.id === current.id) || current;
      }

      if (selectionDismissed) {
        return null;
      }

      return previewItems[0];
    });
  }, [previewItems, selectionDismissed]);

  const featuredCards = previewItems.slice(0, 3);
  const mapCenter = selectedEntity?.location
    ? [selectedEntity.location.latitude, selectedEntity.location.longitude]
      : featuredCards[0]?.location
        ? [featuredCards[0].location.latitude, featuredCards[0].location.longitude]
        : AUSTIN_CENTER;

  function buildPayload(nextQuery = query) {
    const trimmedQuery = String(nextQuery || "").trim();
    return {
      query: trimmedQuery || searchDefaults.query,
      category: activePrimary || "all",
      walkMinutes,
      toggles: activeSecondary,
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = buildPayload(query);
    if (interactionMode === "ask") {
      onAsk?.(payload);
      return;
    }
    onExplore?.(payload);
  }

  function handlePrimarySelect(nextValue) {
    setActivePrimary(nextValue);
    setSelectionDismissed(false);
  }

  function handleSecondaryToggle(nextValue) {
    setActiveSecondary((current) =>
      current.includes(nextValue)
        ? current.filter((value) => value !== nextValue)
        : [...current, nextValue]
    );
    setSelectionDismissed(false);
  }

  function handleAsk(nextQuery = query) {
    setInteractionMode("ask");
    setSelectionDismissed(false);
    onAsk?.(buildPayload(nextQuery));
  }

  function handleSelectEntity(item) {
    setSelectionDismissed(false);
    setSelectedEntity(item);
  }

  function handleCloseDetail() {
    setSelectionDismissed(true);
    setSelectedEntity(null);
  }

  return (
    <section className="relative overflow-hidden bg-[#0b1730] pt-[84px] text-white">
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Downtown Austin skyline"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,34,0.64)_0%,rgba(11,23,48,0.55)_40%,rgba(11,23,48,0.86)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(168,197,255,0.42),transparent_22rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(11,23,48,0)_0%,rgba(11,23,48,0.92)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 md:px-6 md:pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-end">
          <div className="pt-10 md:pt-16 lg:pt-20">
            <div className="max-w-[560px] rounded-[28px] border border-white/18 bg-white/14 p-5 shadow-[0_24px_80px_rgba(3,10,24,0.28)] backdrop-blur-xl md:p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
                Downtown Perks
              </div>

              <h1 className="mt-4 font-heading text-[42px] font-semibold leading-[0.94] tracking-[-0.05em] text-white md:text-[68px]">
                Where downtown
                <br />
                meets you
              </h1>

              <p className="mt-3 max-w-[40rem] text-[15px] leading-7 text-white/78 md:text-[16px]">
                Everything nearby — in one map.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-6 rounded-[24px] border border-white/22 bg-white/88 p-2 shadow-[0_18px_46px_rgba(6,16,34,0.18)]"
              >
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="flex h-12 flex-1 items-center gap-3 rounded-[18px] border border-[rgba(11,31,51,0.12)] bg-white px-4">
                    <Search className="h-4 w-4 shrink-0 text-[rgba(11,31,51,0.46)]" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={
                        interactionMode === "ask"
                          ? "Ask where to go, what to do, or who to meet"
                          : "Search places, events, perks, or what is nearby"
                      }
                      className="flex-1 bg-transparent text-sm text-[#0B1F33] outline-none placeholder:text-[rgba(11,31,51,0.40)]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setInteractionMode((current) => (current === "ask" ? "search" : "ask"))
                      }
                      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                        interactionMode === "ask"
                          ? "border-[#0B1F33] bg-[#0B1F33] text-white"
                          : "border-[rgba(11,31,51,0.10)] text-[rgba(11,31,51,0.68)] hover:bg-[rgba(11,31,51,0.04)]"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {interactionMode === "ask" ? "Ask on" : "Ask"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#0B1F33] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#122743]"
                  >
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 overflow-hidden rounded-[18px] border border-[rgba(11,31,51,0.10)] bg-white shadow-[0_10px_24px_rgba(11,31,51,0.08)]">
                  <MapFilterBars
                    primaryOptions={PRIMARY_SEARCH_PRESETS}
                    secondaryOptions={SECONDARY_SEARCH_PRESETS}
                    activePrimary={activePrimary}
                    activeSecondary={activeSecondary}
                    onPrimarySelect={handlePrimarySelect}
                    onSecondaryToggle={handleSecondaryToggle}
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkMinutes((current) => (current === 5 ? null : 5))}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      walkMinutes === 5
                        ? "border-[#0B1F33] bg-[#0B1F33] text-white"
                        : "border-[rgba(11,31,51,0.10)] bg-white text-[rgba(11,31,51,0.76)] hover:bg-[rgba(11,31,51,0.04)]"
                    }`}
                  >
                    5 min walk
                  </button>

                  {ASK_MAP_QUESTIONS.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        setQuery(item.query);
                        handleAsk(item.query);
                      }}
                      className="rounded-full border border-[rgba(11,31,51,0.10)] bg-[rgba(11,31,51,0.03)] px-3 py-1.5 text-xs font-medium text-[rgba(11,31,51,0.72)] transition-colors hover:bg-white"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-white/74">
                <span>One map</span>
                <span>Everything nearby</span>
                <span>No app download</span>
                <span>No login friction</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:justify-end">
            <Link
              to="/partners"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/16 bg-white/10 px-5 text-sm font-semibold text-white/92 shadow-[0_12px_32px_rgba(3,10,24,0.16)] backdrop-blur-xl transition-colors hover:bg-white/14"
            >
              Partner platform
              <Compass className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[30px] border border-white/14 bg-white/10 shadow-[0_24px_70px_rgba(3,10,24,0.24)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-white/12 px-4 py-3 md:px-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                Live downtown map
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                The map is the product.
              </div>
            </div>

            <div className="hidden items-center gap-2 text-[12px] text-white/70 md:flex">
              <Sparkles className="h-3.5 w-3.5 text-[#d6ba7a]" />
              Nearby now
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="relative h-[360px] overflow-hidden md:h-[440px]">
              <UnifiedMapShell
                items={previewItems}
                markerIcon={(item, active) => createMarker(item, { isSelected: active })}
                onMarkerSelect={setSelectedEntity}
                mapCenter={mapCenter}
                mapZoom={14}
                selectedId={selectedEntity?.id}
                className="h-full w-full"
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 md:p-4">
                <div className="pointer-events-auto flex gap-3 overflow-x-auto pb-1">
                  {featuredCards.map((item) => {
                    const meta = getPreviewMeta(item);
                    const isActive = item.id === selectedEntity?.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedEntity(item)}
                        className={`min-w-[220px] rounded-[20px] border px-4 py-3 text-left shadow-[0_14px_36px_rgba(6,16,34,0.16)] backdrop-blur-xl transition-all ${
                          isActive
                            ? "border-white/28 bg-white/92"
                            : "border-white/18 bg-white/84 hover:bg-white/92"
                        }`}
                      >
                        <div className="text-sm font-semibold text-[#0B1F33]">{meta.title}</div>
                        <div className="mt-1 text-[13px] leading-5 text-[rgba(11,31,51,0.66)]">
                          {meta.supporting}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[rgba(11,31,51,0.54)]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {meta.detail}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-white/12 bg-[rgba(11,23,48,0.34)] p-4 lg:border-l lg:border-t-0 lg:bg-[rgba(255,255,255,0.08)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                    Nearby results
                  </div>
                  <div className="mt-1 text-sm text-white/78">
                    {previewItems.length} live results {walkMinutes ? `within ${walkMinutes} min walk` : "nearby now"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setResultsExpanded((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/78 transition-colors hover:bg-white/14"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {resultsExpanded ? "Hide list" : "Show list"}
                </button>
              </div>

              {selectedEntity ? (
                <div className="mb-3 rounded-[18px] border border-white/16 bg-white/14 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/58">
                        Selected now
                      </div>
                      <div className="mt-1 text-base font-semibold text-white">
                        {getPreviewMeta(selectedEntity).title}
                      </div>
                      <div className="mt-2 text-[13px] leading-5 text-white/74">
                        {getPreviewMeta(selectedEntity).supporting}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCloseDetail}
                      className="rounded-full border border-white/12 bg-white/10 p-2 text-white/76 transition-colors hover:bg-white/16"
                      aria-label="Close selected location"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.1em] text-white/54">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {getPreviewMeta(selectedEntity).detail}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {interactionMode === "ask" ? "Ask result" : "Nearby pick"}
                    </span>
                  </div>
                </div>
              ) : null}

              {resultsExpanded ? (
                <div className="space-y-3 lg:max-h-[360px] lg:overflow-y-auto lg:pr-1">
                  {(previewItems.length ? previewItems : []).slice(0, 6).map((item) => {
                  const meta = getPreviewMeta(item);
                  const isEvent = item?.type === "event";
                  const isPerk = item?.type === "perk" || Boolean(item?.perk?.value || item?.perk_value);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectEntity(item)}
                      className={`w-full rounded-[18px] border px-4 py-3 text-left transition-colors ${
                        item.id === selectedEntity?.id
                          ? "border-white/26 bg-white/18"
                          : "border-white/12 bg-white/8 hover:bg-white/14"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{meta.title}</div>
                          <div className="mt-1 text-[13px] leading-5 text-white/70">
                            {meta.supporting}
                          </div>
                        </div>

                        {isEvent ? (
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#d6ba7a]" />
                        ) : isPerk ? (
                          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-[#d6ba7a]" />
                        ) : (
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d6ba7a]" />
                        )}
                      </div>

                      <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-white/52">
                        {meta.detail}
                      </div>
                    </button>
                  );
                })}

                {!previewItems.length ? (
                  <div className="rounded-[18px] border border-white/12 bg-white/8 px-4 py-5 text-[13px] leading-6 text-white/68">
                    No items available for this filter yet.
                  </div>
                ) : null}
                </div>
              ) : (
                <div className="rounded-[18px] border border-white/12 bg-white/8 px-4 py-4 text-[13px] leading-6 text-white/68">
                  Keep the list rolled up and use the map or the selected card to stay focused.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
