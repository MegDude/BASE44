import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, List, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMapStateStore, selectFilteredResults, selectSelectedEntity } from '@/store/mapStateStore';
import { useMapPanelStore } from '@/store/useMapPanelStore';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';
import HeatmapLayer from '@/components/map/unified/HeatmapLayer';
import MapControlPanel from '@/components/map/MapControlPanel';
import MapPanelHydrator from '@/components/map/MapPanelHydrator';
import MapPanelUrlSync from '@/components/map/MapPanelUrlSync';
import { createMarker } from '@/components/map/markers/MarkerFactory';
import { filterValidEntities } from '@/lib/mapValidation';
import { mapRepository } from '@/lib/repositories/mapRepository';
import { useRankedResults } from '@/hooks/useRankedResults';

function getMarkerIcon(entity, isSelected) {
  return createMarker(entity, {
    isSelected,
    radiusMinutes: useMapStateStore.getState().activeFilters.walkMinutes,
  });
}

export default function ExploreRebuilt() {
  const filteredResults = useMapStateStore(selectFilteredResults);
  const selectedEntity = useMapStateStore(selectSelectedEntity);
  const mapCenter = useMapStateStore((state) => state.mapCenter);
  const mapZoom = useMapStateStore((state) => state.mapZoom);
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const heatmapVisible = useMapStateStore((state) => state.heatmapVisible);
  const showResultsList = useMapStateStore((state) => state.showResultsList);
  const setMapCenter = useMapStateStore((state) => state.setMapCenter);
  const setMapZoom = useMapStateStore((state) => state.setMapZoom);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setFilteredResults = useMapStateStore((state) => state.setFilteredResults);
  const setHeatmapVisible = useMapStateStore((state) => state.setHeatmapVisible);
  const setSearchQuery = useMapStateStore((state) => state.setSearchQuery);
  const setShowResultsList = useMapStateStore((state) => state.setShowResultsList);
  const updateFilter = useMapStateStore((state) => state.updateFilter);
  const clearFilters = useMapStateStore((state) => state.clearFilters);

  const [allEntities, setAllEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askLoading, setAskLoading] = useState(false);
  const baseEntitiesRef = useRef([]);
  const lastAskRef = useRef('');

  const {
    mode,
    query,
    decision,
    type,
    setAgentState,
    categories,
    filters,
  } = useMapPanelStore();

  const describeType = (value) => {
    if (value === 'venues') return 'places';
    if (value === 'events') return 'events';
    if (value === 'perks') return 'perks';
    if (value === 'buildings') return 'buildings';
    return 'results';
  };

  const describeWindow = () => {
    if (filters.fiveMin) return 'within 5 minutes';
    if (filters.tenMin) return 'within 10 minutes';
    if (decision === 'open' || filters.openNow) return 'open now';
    if (decision === 'near') return 'nearby';
    return 'nearby right now';
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const feedItems = await mapRepository.getMapFeed({ query: '', filters: {}, limit: 1000 });
        const safeItems = filterValidEntities(feedItems).filter(
          (item) => item.isPlotted !== false
        );

        if (!mounted) return;
        baseEntitiesRef.current = safeItems;
        setAllEntities(safeItems);
        setFilteredResults(safeItems);
      } catch (error) {
        console.error('Failed to load map feed:', error);
        if (!mounted) return;
        setAllEntities([]);
        setFilteredResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setFilteredResults]);

  useEffect(() => {
    clearFilters();
    setSearchQuery(query);

    if (type === 'venues') {
      updateFilter('entityTypes', new Set(['venue', 'hotel']));
    } else if (type === 'events') {
      updateFilter('entityTypes', new Set(['event']));
    } else if (type === 'perks') {
      updateFilter('entityTypes', new Set(['perk']));
    } else if (type === 'buildings') {
      updateFilter('entityTypes', new Set(['building', 'property', 'hotel']));
    } else {
      updateFilter('entityTypes', new Set(['venue', 'event', 'perk', 'building', 'property', 'hotel']));
    }

    if (categories.length > 0) {
      updateFilter('categories', new Set(categories));
    }

    if (decision === 'now') {
      updateFilter('isLive', true);
    }

    if (decision === 'open' || filters.openNow) {
      updateFilter('isOpenNow', true);
    }

    if (filters.crowd) {
      updateFilter('isTrending', true);
    }

    if (filters.deals) {
      updateFilter('hasPerk', true);
    }

    if (filters.fiveMin) {
      updateFilter('walkMinutes', 5);
    } else if (filters.tenMin) {
      updateFilter('walkMinutes', 10);
    }
  }, [categories, clearFilters, decision, filters, query, setSearchQuery, type, updateFilter]);

  useEffect(() => {
    if (mode === 'ask') return;
    if (!lastAskRef.current) return;

    lastAskRef.current = '';
    const base = baseEntitiesRef.current;
    if (Array.isArray(base) && base.length > 0) {
      setAllEntities(base);
      setFilteredResults(base);
    }
  }, [mode, setFilteredResults]);

  useEffect(() => {
    if (!selectedEntity) return;
    setShowResultsList(false);
  }, [selectedEntity, setShowResultsList]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) {
      setShowResultsList(true);
    }
  }, [setShowResultsList]);

  const handleAsk = async (q) => {
    const query = String(q || '').trim();
    if (!query) return;
    if (askLoading) return;
    if (lastAskRef.current === query) return;

    setAskLoading(true);
    lastAskRef.current = query;

    try {
      const { items, explanation, suggestions, source, intent } = await mapRepository.searchWithIntent({
        query,
        userLocation: {
          latitude: mapCenter?.[0],
          longitude: mapCenter?.[1],
        },
      });

      const safeItems = filterValidEntities(items).filter((item) => item.isPlotted !== false);
      setAgentState({
        agentExplanation: explanation || intent?.explanation || "Showing what fits nearby.",
        agentSuggestions: suggestions || intent?.suggestions || [],
        agentSource: source || "fallback",
      });
      setAllEntities(safeItems);
      setFilteredResults(safeItems);
    } catch (error) {
      console.error('Ask the map failed:', error);
      setAgentState({
        agentExplanation: "Showing the live downtown layer.",
        agentSuggestions: [],
        agentSource: "fallback",
      });
    } finally {
      setAskLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== 'ask') return;
    if (!query?.trim()) return;
    handleAsk(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, query]);

  useEffect(() => {
    if (!allEntities.length) return;

    let results = [...allEntities].filter((item) => item.isVisibleInResults !== false);
    const baselineResults = [...results];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      results = results.filter((item) => {
        const haystack = [
          item.name,
          item.description,
          item.address,
          item.category,
          item.district,
          ...(item.metadata?.tags || []),
          ...(item.metadata?.searchKeywords || []),
          ...(item.metadata?.askMapIntentTags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(q);
      });
    }

    if (activeFilters.entityTypes.size > 0) {
      results = results.filter(
        (item) =>
          activeFilters.entityTypes.has(item.type) ||
          (item.type === 'property' && activeFilters.entityTypes.has('building'))
      );
    }

    if (activeFilters.categories.size > 0) {
      results = results.filter((item) => item.category && activeFilters.categories.has(item.category));
    }

    if (activeFilters.districts.size > 0) {
      results = results.filter((item) => item.district && activeFilters.districts.has(item.district));
    }

    if (typeof activeFilters.walkMinutes === 'number') {
      results = results.filter((item) => (item.metadata?.walkMinutes ?? 999) <= activeFilters.walkMinutes);
    }

    if (activeFilters.isOpenNow) {
      results = results.filter((item) => Boolean(item.isOpenNow));
    }

    if (activeFilters.isLive) {
      results = results.filter((item) => Boolean(item.isLive || item.eventTiming?.isLive));
    }

    if (activeFilters.isSaved) {
      results = results.filter((item) => savedEntityIds.has(item.id));
    }

    if (activeFilters.isTrending) {
      results = results.filter((item) => Boolean(item.metadata?.isTrending || (item.metadata?.popularity ?? 0) >= 70));
    }

    if (activeFilters.hasPerk) {
      results = results.filter((item) => Boolean(item.perk?.value || item.perk_value || item.type === 'perk'));
    }

    results.sort((a, b) => {
      const liveDelta = Number(Boolean(b.isLive || b.eventTiming?.isLive)) - Number(Boolean(a.isLive || a.eventTiming?.isLive));
      if (liveDelta !== 0) return liveDelta;

      const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
      if (walkDelta !== 0) return walkDelta;

      return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
    });

    let finalResults = results;
    let explanation = `${results.length} ${describeType(type)} ${describeWindow()}.`;

    if (results.length === 0) {
      let fallback = [...baselineResults];

      if (activeFilters.entityTypes.size > 0) {
        fallback = fallback.filter(
          (item) =>
            activeFilters.entityTypes.has(item.type) ||
            (item.type === 'property' && activeFilters.entityTypes.has('building'))
        );
      }

      if (activeFilters.categories.size > 0) {
        fallback = fallback.filter((item) => item.category && activeFilters.categories.has(item.category));
      }

      if (activeFilters.districts.size > 0) {
        fallback = fallback.filter((item) => item.district && activeFilters.districts.has(item.district));
      }

      fallback.sort((a, b) => {
        const liveDelta = Number(Boolean(b.isLive || b.eventTiming?.isLive || b.isOpenNow)) - Number(Boolean(a.isLive || a.eventTiming?.isLive || a.isOpenNow));
        if (liveDelta !== 0) return liveDelta;

        const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
        if (walkDelta !== 0) return walkDelta;

        return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
      });

      finalResults = fallback.slice(0, 60);
      explanation = finalResults.length
        ? `No exact matches for that filter. Showing the nearest ${describeType(type)} instead.`
        : `Showing the live downtown layer.`;
    }

    setFilteredResults(finalResults);
    setAgentState({
      agentExplanation: explanation,
    });
  }, [allEntities, searchQuery, activeFilters, savedEntityIds, setFilteredResults, setAgentState, type, decision, filters.fiveMin, filters.tenMin, filters.openNow]);

  const summary = useMemo(
    () => ({
      venues: filteredResults.filter((item) => item.type === 'venue').length,
      events: filteredResults.filter((item) => item.type === 'event').length,
      perks: filteredResults.filter((item) => item.type === 'perk').length,
      properties: filteredResults.filter((item) => ['building', 'property', 'hotel'].includes(item.type)).length,
    }),
    [filteredResults]
  );

  const liveCount = useMemo(
    () => filteredResults.filter((item) => Boolean(item.isLive || item.eventTiming?.isLive || item.isOpenNow)).length,
    [filteredResults]
  );

  const annotatedResults = useMemo(
    () =>
      filteredResults.map((item) => ({
        ...item,
        isSaved: savedEntityIds.has(item.id),
        isOpen: Boolean(item.isOpenNow),
        hasDeal: Boolean(item.perk?.value || item.perk_value || item.type === 'perk'),
        distanceMinutes: item.metadata?.walkMinutes,
        liveScore: Number(item.isLive || item.eventTiming?.isLive) * 20 + (item.metadata?.popularity ?? 0),
        crowdScore: item.metadata?.crowdLevel ?? item.metadata?.popularity ?? 0,
      })),
    [filteredResults, savedEntityIds]
  );
  const displayResults = useRankedResults(annotatedResults);

  const handleMarkerSelect = (entity) => {
    selectEntity(entity);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="dp-map-panel flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#0b1f33]" />
          Loading the live downtown layer…
        </div>
      </div>
    );
  }

  return (
    <>
      <MapPanelHydrator />
      <MapPanelUrlSync />
      <div className="fixed inset-0 bg-background pt-[68px]">
      <div className="relative isolate h-[calc(100vh-68px)] overflow-hidden bg-background">
        <UnifiedMapShell
          items={displayResults}
          markerIcon={(item, active) => getMarkerIcon(item, active)}
          onMarkerSelect={handleMarkerSelect}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onMapCenterChange={setMapCenter}
          onMapZoomChange={setMapZoom}
          selectedId={selectedEntity?.id}
          className="absolute inset-0 z-0 h-full w-full"
        >
          <HeatmapLayer items={displayResults} />
        </UnifiedMapShell>

        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="flex h-full flex-col p-4 md:p-5">
            <div className={`space-y-3 ${showResultsList ? 'md:pr-[408px]' : 'md:pr-0'}`}>
              <div className="pointer-events-auto">
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[16px] border border-[rgba(11,31,51,0.08)] bg-white/92 px-4 text-sm font-medium text-[#0b1f33] shadow-[0_12px_30px_rgba(11,31,51,0.08)] backdrop-blur"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Link>
              </div>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto">
                <MapControlPanel />
              </motion.div>
            </div>

            <div className="pointer-events-none mt-auto flex items-end justify-between gap-3">
              <div className="pointer-events-auto md:hidden">
                <button
                  type="button"
                  onClick={() => setShowResultsList(!showResultsList)}
                  className={showResultsList ? 'dp-chip dp-chip-active min-h-11' : 'dp-chip min-h-11'}
                >
                  {showResultsList ? <X className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                  {showResultsList ? 'Close results' : 'Results'}
                </button>
              </div>

              <div className="pointer-events-auto ml-auto hidden md:block">
                <button
                  type="button"
                  onClick={() => setShowResultsList(!showResultsList)}
                  className={`${showResultsList ? 'dp-chip dp-chip-active' : 'dp-chip'} min-h-11`}
                >
                  {showResultsList ? <X className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                  {showResultsList ? 'Close results' : 'Results'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showResultsList && !selectedEntity ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowResultsList(false)}
                className="fixed inset-0 z-[24] bg-[rgba(11,31,51,0.18)] md:hidden"
                aria-label="Close results"
              />

              <motion.div
                initial={{ y: 440 }}
                animate={{ y: 0 }}
                exit={{ y: 440 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="fixed inset-x-0 bottom-0 z-[25] px-3 pb-3 md:hidden"
              >
                <div className="dp-map-panel max-h-[58vh] overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="h-1.5 w-12 rounded-full bg-navy/10" />
                    <button
                      type="button"
                      onClick={() => setShowResultsList(false)}
                      className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Close results"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="max-h-[calc(58vh-56px)] overflow-y-auto">
                    <UnifiedResultsPanel
                      items={displayResults}
                      onSelectResult={() => setShowResultsList(false)}
                      title="Results"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.aside
                initial={{ x: 420, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 420, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="pointer-events-auto absolute bottom-5 right-5 top-5 z-30 hidden w-[380px] overflow-hidden rounded-[28px] border border-border bg-[#fbfbfd] shadow-[0_24px_60px_rgba(11,31,51,0.12)] md:flex md:flex-col"
              >
                <UnifiedResultsPanel
                  items={displayResults}
                  onClose={() => setShowResultsList(false)}
                  title="Results"
                />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <UnifiedDrawer
          selected={selectedEntity}
          desktopMode="docked"
          desktopClassName="md:rounded-[28px]"
        />
      </div>
      </div>
    </>
  );
}
