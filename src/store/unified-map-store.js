import { useMemo } from 'react';
import { useMapStateStore } from '@/store/mapStateStore';

const LEGACY_ENTITY_TYPES = {
  places: 'venue',
  events: 'event',
  perks: 'perk',
  buildings: 'building',
};

const LEGACY_DRAWER_MAP = {
  collapsed: 'closed',
  mid: 'preview',
  full: 'expanded',
};

export function useUnifiedMapStore() {
  const state = useMapStateStore();

  const legacyFilters = useMemo(
    () => ({
      places: state.activeFilters.entityTypes.has('venue'),
      events: state.activeFilters.entityTypes.has('event'),
      perks: state.activeFilters.entityTypes.has('perk'),
      buildings:
        state.activeFilters.entityTypes.has('building') ||
        state.activeFilters.entityTypes.has('property'),
      'open-now': state.activeFilters.isOpenNow,
      'walkable-5': state.activeFilters.walkMinutes === 5,
      popular: state.activeFilters.isTrending,
      new: state.activeFilters.isLive,
    }),
    [state.activeFilters]
  );

  const timeFilter = state.activeFilters.isLive
    ? 'now'
    : state.activeFilters.isOpenNow
      ? 'today'
      : 'week';

  const selectEntity = (entityOrId, type) => {
    if (!entityOrId) {
      state.selectEntity(null);
      return;
    }

    if (typeof entityOrId === 'object') {
      state.selectEntity(entityOrId);
      return;
    }

    const match = state.filteredResults.find((item) => item.id === entityOrId);
    if (match) {
      state.selectEntity(match);
    } else {
      state.setDrawerState('preview');
    }
  };

  const toggleFilter = (filterId) => {
    if (LEGACY_ENTITY_TYPES[filterId]) {
      const next = new Set(state.activeFilters.entityTypes);
      const entityType = LEGACY_ENTITY_TYPES[filterId];
      if (next.has(entityType)) next.delete(entityType);
      else next.add(entityType);
      state.updateFilter('entityTypes', next);
      return;
    }

    if (filterId === 'open-now') {
      state.updateFilter('isOpenNow', !state.activeFilters.isOpenNow);
      return;
    }

    if (filterId === 'walkable-5') {
      state.updateFilter('walkMinutes', state.activeFilters.walkMinutes === 5 ? null : 5);
      return;
    }

    if (filterId === 'popular') {
      state.updateFilter('isTrending', !state.activeFilters.isTrending);
      return;
    }

    if (filterId === 'new') {
      state.updateFilter('isLive', !state.activeFilters.isLive);
    }
  };

  const setTimeFilter = (filter) => {
    if (filter === 'now') {
      state.updateFilter('isLive', true);
      state.updateFilter('isOpenNow', false);
      return;
    }

    if (filter === 'today') {
      state.updateFilter('isOpenNow', true);
      state.updateFilter('isLive', false);
      return;
    }

    state.updateFilter('isOpenNow', false);
    state.updateFilter('isLive', false);
  };

  const trackAction = async (entityId, actionType, metadata = {}) => {
    if (actionType === 'save') {
      state.toggleSaved(entityId);
    }

    return {
      entityId,
      actionType,
      timestamp: new Date().toISOString(),
      metadata,
    };
  };

  return {
    selectedId: state.selectedEntityId,
    selectedType: state.selectedEntity?.type || null,
    query: state.searchQuery,
    activeFilters: legacyFilters,
    results: state.filteredResults,
    isLoading: state.isMapLoading,
    drawerState:
      state.drawerState === 'closed'
        ? 'collapsed'
        : state.drawerState === 'preview'
          ? 'mid'
          : 'full',
    mapCenter: state.mapCenter,
    mapZoom: state.mapZoom,
    timeFilter,
    liveActions: [],
    heatmapVisible: state.heatmapVisible,
    isRedeeming: false,
    redeemingId: null,
    selectEntity,
    clearSelection: () => state.selectEntity(null),
    setQuery: state.setSearchQuery,
    toggleFilter,
    setFilters: () => {},
    clearFilters: state.clearFilters,
    setResults: state.setFilteredResults,
    setDrawerState: (drawerState) =>
      state.setDrawerState(LEGACY_DRAWER_MAP[drawerState] || 'closed'),
    setMapCenter: state.setMapCenter,
    setMapZoom: state.setMapZoom,
    getActiveFilterCount: () => Object.values(legacyFilters).filter(Boolean).length,
    getSelectedEntity: () => state.selectedEntity,
    setTimeFilter,
    setHeatmapVisible: state.setHeatmapVisible,
    trackAction,
    subscribeLiveActions: () => () => {},
    getHeatmapData: () =>
      state.filteredResults
        .filter((item) => item.location?.valid && (item.isLive || item.metadata?.isTrending))
        .map((item) => ({
          latitude: item.location.latitude,
          longitude: item.location.longitude,
          action_type: item.type,
          timestamp: item.updatedAt || new Date().toISOString(),
        })),
    reset: state.reset,
  };
}