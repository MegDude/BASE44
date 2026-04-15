import { create } from 'zustand';

/**
 * Unified map store for all map instances
 * Controls: selectedEntityId, visibleResults, filters, drawer state, panel state
 * Single source of truth for map UI + interactions
 */
export const useMapStore = create((set) => ({
  // Entity selection (from map marker click)
  selectedEntityId: null,
  selectedEntityType: null, // 'venue' | 'building' | 'event'
  
  // Visible results (filtered by category, query, smart filters)
  visibleResults: [],
  
  // Active filters
  activeFilters: {
    category: 'all',
    query: '',
    smartFilters: { walking: false, freePerks: false, eventBased: false },
  },
  
  // Panel state (collapsed = rolled up, expanded = full list visible)
  isPanelExpanded: false,
  
  // Drawer state (detail view open/closed)
  isDrawerOpen: false,
  
  // Map bounds (for geofencing)
  mapBounds: null,
  
  // Actions
  selectEntity: (entityId, entityType) =>
    set({
      selectedEntityId: entityId,
      selectedEntityType: entityType,
      isDrawerOpen: true, // Auto-open drawer when selecting from map
    }),

  clearSelection: () =>
    set({
      selectedEntityId: null,
      selectedEntityType: null,
      isDrawerOpen: false,
    }),

  togglePanelExpanded: () =>
    set((state) => ({ isPanelExpanded: !state.isPanelExpanded })),

  setPanelExpanded: (expanded) =>
    set({ isPanelExpanded: expanded }),

  toggleDrawer: () =>
    set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  setDrawerOpen: (open) =>
    set({ isDrawerOpen: open }),

  setVisibleResults: (results) =>
    set({ visibleResults: results }),

  setActiveFilters: (filters) =>
    set({
      activeFilters: filters,
      isPanelExpanded: true, // Auto-expand when filters change
    }),

  setCategoryFilter: (category) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, category },
      isPanelExpanded: true,
    })),

  setQueryFilter: (query) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, query },
      isPanelExpanded: true,
    })),

  setSmartFilters: (smartFilters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, smartFilters },
      isPanelExpanded: true,
    })),

  setMapBounds: (bounds) =>
    set({ mapBounds: bounds }),

  resetToDefaults: () =>
    set({
      selectedEntityId: null,
      selectedEntityType: null,
      visibleResults: [],
      activeFilters: {
        category: 'all',
        query: '',
        smartFilters: { walking: false, freePerks: false, eventBased: false },
      },
      isPanelExpanded: false,
      isDrawerOpen: false,
      mapBounds: null,
    }),
}));