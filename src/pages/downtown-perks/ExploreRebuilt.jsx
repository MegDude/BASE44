import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Flame, Layers3, List, MapPin, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useMapStateStore, selectFilteredResults, selectSelectedEntity } from '@/store/mapStateStore';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedSearchBar from '@/components/map/unified/UnifiedSearchBar';
import UnifiedFilterChips from '@/components/map/unified/UnifiedFilterChips';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import LiveNearbyCard from '@/components/map/unified/LiveNearbyCard';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';
import HeatmapLayer from '@/components/map/unified/HeatmapLayer';
import TimeFilter from '@/components/map/unified/TimeFilter';
import { createMarker } from '@/components/map/markers/MarkerFactory';
import { filterValidEntities } from '@/lib/mapValidation';
import { mapRepository } from '@/lib/repositories/mapRepository';

function getMarkerIcon(entity, isSelected) {
  return createMarker(entity, { isSelected });
}

function parseExploreParams(search) {
  const params = new URLSearchParams(search || '');
  const query = params.get('query') || params.get('q') || '';
  const category = params.get('category') || '';
  const mode = params.get('mode') || '';
  return { query, category, mode };
}

export default function ExploreRebuilt() {
  const location = useLocation();
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

  const [allEntities, setAllEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [askLoading, setAskLoading] = useState(false);
  const [askMode, setAskMode] = useState(false);
  const [liveNearby, setLiveNearby] = useState(null);
  const baseEntitiesRef = useRef([]);
  const lastAskRef = useRef('');

  const exploreParams = useMemo(() => parseExploreParams(location.search), [location.search]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const feed = await mapRepository.getIntelligenceFeed({ query: '', filters: {}, limit: 1000 });
        const safeItems = filterValidEntities(feed.items).filter(
          (item) => item.isPlotted !== false
        );

        if (!mounted) return;
        baseEntitiesRef.current = safeItems;
        setAllEntities(safeItems);
        setFilteredResults(safeItems);
        setLiveNearby(feed.liveNearby || safeItems[0] || null);
      } catch (error) {
        console.error('Failed to load map feed:', error);
        if (!mounted) return;
        setAllEntities([]);
        setFilteredResults([]);
        setLiveNearby(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setFilteredResults]);

  useEffect(() => {
    const nextAskMode = exploreParams.mode === 'ask';
    setAskMode(nextAskMode);

    // Apply URL query into the map store for consistent filtering/highlights
    if (typeof exploreParams.query === 'string') {
      setSearchQuery(exploreParams.query);
    }

    const rawCategory = String(exploreParams.category || '').trim().toLowerCase();
    if (!rawCategory) return;

    // Landing categories are plural; store expects entityTypes.
    if (rawCategory === 'venues' || rawCategory === 'venue') {
      updateFilter('entityTypes', new Set(['venue']));
    } else if (rawCategory === 'events' || rawCategory === 'event') {
      updateFilter('entityTypes', new Set(['event']));
    } else if (rawCategory === 'perks' || rawCategory === 'perk') {
      updateFilter('entityTypes', new Set(['perk']));
    } else if (
      rawCategory === 'buildings' ||
      rawCategory === 'building' ||
      rawCategory === 'properties' ||
      rawCategory === 'property'
    ) {
      updateFilter('entityTypes', new Set(['building']));
    } else if (rawCategory === 'walk' || rawCategory === '5min' || rawCategory === '5-min') {
      updateFilter('walkMinutes', 5);
    }
  }, [exploreParams.category, exploreParams.mode, exploreParams.query, setSearchQuery, updateFilter]);

  useEffect(() => {
    if (askMode) return;
    if (!lastAskRef.current) return;

    // Leaving ask mode restores the base feed so explore doesn't get "stuck" on an AI subset.
    lastAskRef.current = '';
    const base = baseEntitiesRef.current;
    if (Array.isArray(base) && base.length > 0) {
      setAllEntities(base);
      setFilteredResults(base);
      setLiveNearby(base.find((item) => item?.metadata?.intelligence?.isLiveNearby) || base[0] || null);
    }
  }, [askMode, setFilteredResults]);

  useEffect(() => {
    if (!selectedEntity) return;
    setShowResultsList(false);
  }, [selectedEntity, setShowResultsList]);

  const handleAsk = async (q) => {
    const query = String(q || '').trim();
    if (!query) return;
    if (askLoading) return;
    if (lastAskRef.current === query) return;

    setAskLoading(true);
    lastAskRef.current = query;

    try {
      const { items, liveNearby: nextLiveNearby } = await mapRepository.searchWithIntent({
        query,
        userLocation: {
          latitude: mapCenter?.[0],
          longitude: mapCenter?.[1],
        },
      });

      const safeItems = filterValidEntities(items).filter((item) => item.isPlotted !== false);
      setAllEntities(safeItems);
      setFilteredResults(safeItems);
      setLiveNearby(nextLiveNearby || safeItems[0] || null);
    } catch (error) {
      console.error('Ask the map failed:', error);
    } finally {
      setAskLoading(false);
    }
  };

  useEffect(() => {
    if (!askMode) return;
    if (!exploreParams.query?.trim()) return;
    handleAsk(exploreParams.query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askMode]);

  useEffect(() => {
    if (!allEntities.length) return;

    let results = [...allEntities].filter((item) => item.isVisibleInResults !== false);
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

    results.sort((a, b) => {
      const liveDelta = Number(Boolean(b.isLive || b.eventTiming?.isLive)) - Number(Boolean(a.isLive || a.eventTiming?.isLive));
      if (liveDelta !== 0) return liveDelta;

      const walkDelta = (a.metadata?.walkMinutes ?? 999) - (b.metadata?.walkMinutes ?? 999);
      if (walkDelta !== 0) return walkDelta;

      return (b.metadata?.popularity ?? 0) - (a.metadata?.popularity ?? 0);
    });

    setFilteredResults(results);
    setLiveNearby(
      results.find((item) => item?.metadata?.intelligence?.isLiveNearby) ||
        results[0] ||
        null
    );
  }, [allEntities, searchQuery, activeFilters, savedEntityIds, setFilteredResults]);

  const summary = useMemo(
    () => ({
      venues: filteredResults.filter((item) => item.type === 'venue').length,
      events: filteredResults.filter((item) => item.type === 'event').length,
      perks: filteredResults.filter((item) => item.type === 'perk').length,
      properties: filteredResults.filter((item) => ['building', 'property', 'hotel'].includes(item.type)).length,
    }),
    [filteredResults]
  );

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
    <div className="fixed inset-0 bg-background pt-[68px]">
      <div className="flex h-[calc(100vh-68px)] flex-col md:hidden">
        <div className="relative flex-1">
          <UnifiedMapShell
            items={filteredResults}
            markerIcon={(item, active) => getMarkerIcon(item, active)}
            onMarkerSelect={handleMarkerSelect}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onMapCenterChange={setMapCenter}
            onMapZoomChange={setMapZoom}
            selectedId={selectedEntity?.id}
            className="h-full w-full"
          >
            <HeatmapLayer items={filteredResults} />
          </UnifiedMapShell>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 space-y-3 p-4">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto dp-map-panel px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="dp-micro-label">Downtown live map</div>
                  <div className="mt-1 text-sm font-semibold text-[#0b1f33]">Explore what is worth walking to right now.</div>
                </div>
                <button
                  onClick={() => setHeatmapVisible(!heatmapVisible)}
                  className={heatmapVisible ? 'dp-chip dp-chip-active' : 'dp-chip'}
                >
                  <Activity className="h-3.5 w-3.5" />
                  Activity
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="dp-chip">{summary.venues} venues</span>
                <span className="dp-chip">{summary.events} events</span>
                <span className="dp-chip">{summary.perks} perks</span>
              </div>
              {liveNearby ? (
                <div className="mt-3">
                  <LiveNearbyCard item={liveNearby} compact onSelect={handleMarkerSelect} />
                </div>
              ) : null}
            </motion.div>

            <div className="pointer-events-auto">
              <UnifiedSearchBar
                mode={askMode ? 'ask' : 'search'}
                onAsk={handleAsk}
                askLoading={askLoading}
                onModeChange={(nextMode) => setAskMode(nextMode === 'ask')}
              />
            </div>
            <div className="pointer-events-auto space-y-2">
              <TimeFilter />
              <UnifiedFilterChips />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4">
            <div className="pointer-events-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowResultsList(!showResultsList)}
                className={showResultsList ? 'dp-chip dp-chip-active min-h-11' : 'dp-chip min-h-11'}
              >
                {showResultsList ? <X className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {showResultsList ? 'Hide results' : `Results (${filteredResults.length})`}
              </button>

              <div className="dp-map-panel px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {askMode ? 'Ask mode' : 'Search mode'}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
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
                      items={filteredResults}
                      onSelectResult={() => setShowResultsList(false)}
                    />
                  </div>
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <UnifiedDrawer selected={selectedEntity} />
      </div>

      <div className="hidden h-[calc(100vh-68px)] md:flex">
        <div className="relative flex-[1.45] p-5">
          <UnifiedMapShell
            items={filteredResults}
            markerIcon={(item, active) => getMarkerIcon(item, active)}
            onMarkerSelect={handleMarkerSelect}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onMapCenterChange={setMapCenter}
            onMapZoomChange={setMapZoom}
            selectedId={selectedEntity?.id}
            className="h-full w-full rounded-[28px]"
          >
            <HeatmapLayer items={filteredResults} />
          </UnifiedMapShell>

          <div className="pointer-events-none absolute left-8 right-8 top-8 z-20 space-y-3 pr-[32%]">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-auto dp-map-panel px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="dp-micro-label">Restored map-first system</div>
                  <h1 className="mt-1 text-xl font-semibold text-[#0b1f33]">A live operating layer for downtown residents.</h1>
                  <p className="mt-1 text-sm text-slate-600">Search, filter, save, and move through the neighborhood with one consistent interface.</p>
                </div>
                <button
                  onClick={() => setHeatmapVisible(!heatmapVisible)}
                  className={heatmapVisible ? 'dp-chip dp-chip-active' : 'dp-chip'}
                >
                  <Flame className="h-3.5 w-3.5" />
                  {heatmapVisible ? 'Hide activity' : 'Show activity'}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="dp-chip"><Layers3 className="h-3.5 w-3.5" /> {summary.venues} venues</span>
                <span className="dp-chip"><MapPin className="h-3.5 w-3.5" /> {summary.events} events</span>
                <span className="dp-chip">{summary.perks} perks</span>
                <span className="dp-chip">{summary.properties} properties</span>
              </div>
              {liveNearby ? (
                <div className="mt-4 max-w-xl">
                  <LiveNearbyCard item={liveNearby} onSelect={handleMarkerSelect} />
                </div>
              ) : null}
            </motion.div>

            <div className="pointer-events-auto">
              <UnifiedSearchBar
                mode={askMode ? 'ask' : 'search'}
                onAsk={handleAsk}
                askLoading={askLoading}
                onModeChange={(nextMode) => setAskMode(nextMode === 'ask')}
              />
            </div>
            <div className="pointer-events-auto space-y-2">
              <TimeFilter />
              <UnifiedFilterChips />
            </div>
          </div>
        </div>

        <aside className="flex w-[32%] flex-col border-l border-border bg-[#fbfbfd]">
          <UnifiedResultsPanel items={filteredResults} />
        </aside>
      </div>
    </div>
  );
}
