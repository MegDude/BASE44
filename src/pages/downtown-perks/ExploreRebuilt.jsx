/**
 * Explore (Rebuilt) — Unified map system
 * Now using centralized data layer and validated state management
 */

import { useState, useEffect } from 'react';
import { useMapStateStore, selectFilteredResults, selectSelectedEntity, selectDrawerState } from '@/store/mapStateStore';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

import UnifiedMapShell from '@/components/map/unified/UnifiedMapShell';
import UnifiedSearchBar from '@/components/map/unified/UnifiedSearchBar';
import UnifiedFilterChips from '@/components/map/unified/UnifiedFilterChips';
import UnifiedDrawer from '@/components/map/unified/UnifiedDrawer';
import UnifiedResultsPanel from '@/components/map/unified/UnifiedResultsPanel';
import HeatmapLayer from '@/components/map/unified/HeatmapLayer';
import TimeFilter from '@/components/map/unified/TimeFilter';
import { createMarker } from '@/components/map/markers/MarkerFactory';


// Helper to get marker icon from factory
function getMarkerIcon(entity, isSelected) {
  return createMarker(entity, { isSelected });
}

export default function ExploreRebuilt() {
  const store = useMapStateStore();
  const filteredResults = selectFilteredResults(store);
  const selectedEntity = selectSelectedEntity(store);
  const drawerState = selectDrawerState(store);

  const [allEntities, setAllEntities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize with unified map feed from repositories
  useEffect(() => {
    (async () => {
      try {
        const response = await base44.functions.invoke('getSharedMapFeed', {
          search: '',
          filters: {},
          limit: 1000,
        });
        setAllEntities(response.data?.items || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load map feed:', error);
        setLoading(false);
      }
    })();
  }, []);

  // Apply search and filters
  useEffect(() => {
    if (!allEntities.length) return;

    let results = [...allEntities];

    // Apply search
    if (store.searchQuery.trim()) {
      const lowerSearch = store.searchQuery.toLowerCase();
      results = results.filter((e) =>
        e.title?.toLowerCase().includes(lowerSearch) ||
        e.subtitle?.toLowerCase().includes(lowerSearch) ||
        e.description?.toLowerCase().includes(lowerSearch)
      );
    }

    // Apply filters (entity types)
    if (store.activeFilters.entityTypes.size > 0) {
      results = results.filter((e) =>
        store.activeFilters.entityTypes.has(e.type)
      );
    }

    // Apply category filter
    if (store.activeFilters.categories.size > 0) {
      results = results.filter((e) =>
        e.category && store.activeFilters.categories.has(e.category)
      );
    }

    // Apply district filter
    if (store.activeFilters.districts.size > 0) {
      results = results.filter((e) =>
        e.district && store.activeFilters.districts.has(e.district)
      );
    }

    // Apply walk time filter
    if (store.activeFilters.walkMinutes) {
      results = results.filter((e) =>
        e.metadata?.walkMinutes && e.metadata.walkMinutes <= store.activeFilters.walkMinutes
      );
    }

    // Apply state filters
    if (store.activeFilters.isOpenNow) {
      results = results.filter((e) => e.isOpenNow);
    }
    if (store.activeFilters.isLive) {
      results = results.filter((e) => e.isLive);
    }
    if (store.activeFilters.isSaved) {
      results = results.filter((e) => store.savedEntityIds.has(e.id));
    }

    store.setFilteredResults(results);
  }, [store.searchQuery, store.activeFilters, allEntities, store.savedEntityIds]);

  const handleMarkerSelect = (entity) => {
    store.selectEntity(entity);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[68px] fixed inset-0 flex flex-col md:flex-row overflow-hidden bg-[#F7F8FB]">
      {/* ── MOBILE LAYOUT ────────────────────────────────── */}
      <div className="md:hidden w-full h-[calc(100vh-68px)] flex flex-col">
        {/* Map (full height) */}
        <div className="flex-1 relative">
          <UnifiedMapShell
            items={filteredResults}
            markerIcon={(item, active) =>
              getMarkerIcon(item, active)
            }
            onMarkerSelect={handleMarkerSelect}
            mapCenter={store.mapCenter}
            mapZoom={store.mapZoom}
            onMapCenterChange={(center) => store.setMapCenter(center)}
            onMapZoomChange={(zoom) => store.setMapZoom(zoom)}
            selectedId={selectedEntity?.id}
            className="w-full h-full"
          >
            <HeatmapLayer />
          </UnifiedMapShell>

          {/* Floating search + filters (overlay) */}
          <motion.div className="absolute top-0 left-0 right-0 z-[1200] bg-gradient-to-b from-background/80 via-background/40 to-transparent p-4 space-y-3 pointer-events-none">
            <div className="pointer-events-auto">
              <UnifiedSearchBar />
            </div>
            <div className="pointer-events-auto space-y-2">
              <TimeFilter />
              <UnifiedFilterChips />
            </div>
          </motion.div>
        </div>

        {/* Bottom sheet drawer */}
        <UnifiedDrawer
          selected={selectedEntity}
          onMarkerSelect={handleMarkerSelect}
        />
      </div>

      {/* ── DESKTOP LAYOUT ───────────────────────────────── */}
      <div className="hidden md:flex w-full h-[calc(100vh-68px)] gap-0">
        {/* Map (left 65%) */}
        <div className="w-2/3 relative">
          <UnifiedMapShell
            items={filteredResults}
            markerIcon={(item, active) =>
              getMarkerIcon(item, active)
            }
            onMarkerSelect={handleMarkerSelect}
            mapCenter={store.mapCenter}
            mapZoom={store.mapZoom}
            onMapCenterChange={(center) => store.setMapCenter(center)}
            onMapZoomChange={(zoom) => store.setMapZoom(zoom)}
            selectedId={selectedEntity?.id}
            className="w-full h-full"
          />

          {/* Floating controls (top overlay) */}
          <motion.div className="absolute top-6 left-6 right-6 z-[1200] space-y-3 pointer-events-none">
            <div className="pointer-events-auto">
              <UnifiedSearchBar />
            </div>
            <div className="pointer-events-auto space-y-2">
              <TimeFilter />
              <UnifiedFilterChips />
            </div>
          </motion.div>
        </div>

        {/* Results panel (right 35%) */}
        <div className="w-1/3 bg-white border-l border-border overflow-hidden flex flex-col">
          <UnifiedResultsPanel items={filteredResults} />
        </div>
      </div>
    </div>
  );
}
