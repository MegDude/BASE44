import { create } from 'zustand';
import { initialMapState, FILTER_CHIPS } from '@/lib/mapSystemConstants';

/**
 * Unified map store
 * Synchronizes search, filters, selection, drawer, and results
 * Single source of truth for all map interactions
 */

export const useUnifiedMapStore = create((set, get) => ({
  // ── STATE ──────────────────────────────────────────────────────
  selectedId: null,
  selectedType: null,
  query: '',
  activeFilters: Object.fromEntries(
    FILTER_CHIPS.map((chip) => [chip.id, chip.active])
  ),
  results: [],
  isLoading: false,
  drawerState: 'collapsed',
  mapCenter: initialMapState.mapCenter,
  mapZoom: 14,

  // ── ACTIONS ────────────────────────────────────────────────────

  // Select an entity (venue, event, building, etc.)
  selectEntity: (id, type) =>
    set((state) => ({
      selectedId: id,
      selectedType: type,
      drawerState: state.drawerState === 'collapsed' ? 'mid' : state.drawerState,
    })),

  // Clear selection
  clearSelection: () =>
    set({
      selectedId: null,
      selectedType: null,
      drawerState: 'collapsed',
    }),

  // Update search query (triggers AI intent detection)
  setQuery: (query) =>
    set({
      query,
      isLoading: true,
    }),

  // Toggle filter
  toggleFilter: (filterId) =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [filterId]: !state.activeFilters[filterId],
      },
      isLoading: true,
    })),

  // Set multiple filters
  setFilters: (filters) =>
    set({
      activeFilters: filters,
      isLoading: true,
    }),

  // Clear all filters
  clearFilters: () => {
    const cleared = Object.fromEntries(
      Object.keys(get().activeFilters).map((k) => [k, false])
    );
    set({
      activeFilters: cleared,
      isLoading: true,
    });
  },

  // Update results
  setResults: (results) =>
    set({
      results,
      isLoading: false,
    }),

  // Update drawer state
  setDrawerState: (state) =>
    set({
      drawerState: state,
    }),

  // Update map center (from drag/pan)
  setMapCenter: (center) =>
    set({
      mapCenter: center,
    }),

  // Update map zoom
  setMapZoom: (zoom) =>
    set({
      mapZoom: zoom,
    }),

  // Get active filter count
  getActiveFilterCount: () => {
    return Object.values(get().activeFilters).filter(Boolean).length;
  },

  // Get selected entity from results
  getSelectedEntity: () => {
    const { selectedId, results } = get();
    return results.find((r) => r.id === selectedId);
  },

  // Reset everything
  reset: () => set(initialMapState),
}));