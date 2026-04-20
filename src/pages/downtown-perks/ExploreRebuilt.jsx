import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Layers3, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMapStateStore, selectFilteredResults, selectSelectedEntity } from '@/store/mapStateStore';
import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedSearchBar from '@/components/map/unified/UnifiedSearchBar';
import UnifiedFilterChips from '@/components/map/unified/UnifiedFilterChips';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';
import HeatmapLayer from '@/components/map/unified/HeatmapLayer';
import TimeFilter from '@/components/map/unified/TimeFilter';
import { createMarker } from '@/components/map/markers/MarkerFactory';
import { MAP_ENTITIES } from '@/data/mapEntities';
import { filterValidEntities } from '@/lib/mapValidation';

function getMarkerIcon(entity, isSelected) {
  return createMarker(entity, { isSelected });
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
  const setMapCenter = useMapStateStore((state) => state.setMapCenter);
  const setMapZoom = useMapStateStore((state) => state.setMapZoom);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const setFilteredResults = useMapStateStore((state) => state.setFilteredResults);
  const setHeatmapVisible = useMapStateStore((state) => state.setHeatmapVisible);

  const [allEntities, setAllEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const response = await base44.functions.invoke('getSharedMapFeed', {
          search: '',
          filters: {},
          limit: 1000,
        });

        const remoteItems = Array.isArray(response?.data?.items) ? response.data.items : [];
        const fallbackItems = Array.isArray(MAP_ENTITIES) ? MAP_ENTITIES : [];
        const safeItems = filterValidEntities(remoteItems.length ? remoteItems : fallbackItems).filter(
          (item) => item.isPlotted !== false
        );

        if (!mounted) return;
        setAllEntities(safeItems);
        setFilteredResults(safeItems);
      } catch (error) {
        console.error('Failed to load map feed:', error);
        if (!mounted) return;
        const safeItems = filterValidEntities(MAP_ENTITIES).filter((item) => item.isPlotted !== false);
        setAllEntities(safeItems);
        setFilteredResults(safeItems);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setFilteredResults]);

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
            </motion.div>

            <div className="pointer-events-auto">
              <UnifiedSearchBar />
            </div>
            <div className="pointer-events-auto space-y-2">
              <TimeFilter />
              <UnifiedFilterChips />
            </div>
          </div>
        </div>

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
            </motion.div>

            <div className="pointer-events-auto">
              <UnifiedSearchBar />
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