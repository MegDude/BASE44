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
import { rankMapEntities } from '@/lib/map/rankMapEntities';

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

  // ─── RANKING INTEGRATION ───────────────────────────────────────────────────
  // Apply ranking hook first, then cap with rankMapEntities
  const rankedResults = useRankedResults(filteredResults);
  
  const displayResults = useMemo(() => {
    return rankMapEntities(rankedResults, {
      intent: searchQuery,
      maxResults: 30,
      savedEntityIds,
    });
  }, [rankedResults, searchQuery, savedEntityIds]);

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

  // ─── DATA LOADING ──────────────────────────────────────────────────────────
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

  // ─── FILTER SYNC ───────────────────────────────────────────────────────────
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

  // ─── ASK MODE RESET ────────────────────────────────────────────────────────
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

  // ─── CLOSE RESULTS ON SELECTION ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedEntity) return;
    setShowResultsList(false);
  }, [selectedEntity, setShowResultsList]);

  // ─── RESULTS PANEL DEFAULT: CLOSED ─────────────────────────────────────────
  // Changed: Results panel is now closed by default on all devices
  useEffect(() => {
    setShowResultsList(false);
  }, [setShowResultsList]);

  // ─── ASK HANDLER ───────────────────────────────────────────────────────────
  const handleAsk = async (q) => {
    const queryStr = String(q || '').trim();
    if (!queryStr) return;
    if (askLoading) return;
    if (lastAskRef.current === queryStr) return;

    setAskLoading(true);
    lastAskRef.current = queryStr;

    try {
      const { items, explanation, suggestions, source, intent } = await mapRepository.searchWithIntent({
        query: queryStr,
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
      console.error('Ask failed:', error);
    } finally {
      setAskLoading(false);
    }
  };

  // ─── MARKER CLICK ──────────────────────────────────────────────────────────
  const handleMarkerClick = (entity) => {
    selectEntity(entity);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8f9fa]">
      {/* URL and state hydration */}
      <MapPanelHydrator />
      <MapPanelUrlSync />

      {/* Back navigation - minimal */}
      <div className="absolute left-4 top-4 z-30">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200/50 text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Results toggle - only shows count badge when collapsed */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setShowResultsList(!showResultsList)}
          className="flex h-10 items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200/50 px-4 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
        >
          {showResultsList ? (
            <>
              <X className="h-4 w-4" />
              <span>Close</span>
            </>
          ) : (
            <>
              <List className="h-4 w-4" />
              <span>Results</span>
              {displayResults.length > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white px-1.5">
                  {displayResults.length}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Map Shell - primary surface */}
      <UnifiedMapShell
        entities={displayResults}
        selectedEntity={selectedEntity}
        onMarkerClick={handleMarkerClick}
        getMarkerIcon={getMarkerIcon}
        center={mapCenter}
        zoom={mapZoom}
        onCenterChange={setMapCenter}
        onZoomChange={setMapZoom}
        loading={loading}
      >
        {heatmapVisible && <HeatmapLayer entities={displayResults} />}
      </UnifiedMapShell>

      {/* Control panel - minimal glass overlay */}
      <MapControlPanel
        onAsk={handleAsk}
        askLoading={askLoading}
        heatmapVisible={heatmapVisible}
        onToggleHeatmap={() => setHeatmapVisible(!heatmapVisible)}
      />

      {/* Results Panel - collapsed by default, compact rows */}
      <AnimatePresence>
        {showResultsList && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 z-20 h-full w-full max-w-sm"
          >
            <UnifiedResultsPanel
              results={displayResults}
              selectedEntity={selectedEntity}
              savedEntityIds={savedEntityIds}
              onSelect={selectEntity}
              onClose={() => setShowResultsList(false)}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decision Drawer - primary interaction surface */}
      <UnifiedDrawer
        selected={selectedEntity}
        desktopMode="floating"
      />
    </div>
  );
}
