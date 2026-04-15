import { create } from 'zustand';

/**
 * Unified map store for all map instances
 * Controls: selectedEntityId, filters, drawer state, panel state, mode
 * Single source of truth for map UI + interactions
 * 
 * CRITICAL RULES:
 * - Campaign context is just state, not a separate system
 * - All filtering logic moved to lib/map/selectors.ts
 * - MapShell reads ONLY from store, no prop drilling
 */
export const useMapStore = create((set) => ({
  // Entity selection (from map marker click)
  selectedEntityId: null,
  selectedEntityType: null, // 'venue' | 'building' | 'event'
  
  // Search + filter state
  query: '',
  filters: {
    category: 'all',
    types: [],
    districts: [],
  },
  
  // Map mode ('explore' | 'campaign-preview' | 'search')
  mode: 'explore',
  
  // Intent mode ('explore' | 'now' | 'plan' | 'perks')
  intentMode: 'explore',
  
  // Campaign context (state-only configuration)
  campaignContext: {
    campaignId: null,
    sourceContext: null,
    placementTypes: [],
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

  setQueryFilter: (query) =>
    set({
      query,
      isPanelExpanded: true,
    }),

  setCategoryFilter: (category) =>
    set((state) => ({
      filters: { ...state.filters, category },
      isPanelExpanded: true,
    })),

  setTypeFilters: (types) =>
    set((state) => ({
      filters: { ...state.filters, types },
      isPanelExpanded: true,
    })),

  setDistrictFilters: (districts) =>
    set((state) => ({
      filters: { ...state.filters, districts },
      isPanelExpanded: true,
    })),

  setMode: (mode) =>
    set({ mode }),

  setIntentMode: (intentMode) =>
    set({ intentMode, isPanelExpanded: true }),

  setMapBounds: (bounds) =>
    set({ mapBounds: bounds }),

  setCampaignContext: (context) =>
    set({ campaignContext: context }),

  clearCampaignContext: () =>
    set({
      campaignContext: {
        campaignId: null,
        sourceContext: null,
        placementTypes: [],
      },
    }),

  resetToDefaults: () =>
    set({
      selectedEntityId: null,
      selectedEntityType: null,
      query: '',
      filters: {
        category: 'all',
        types: [],
        districts: [],
      },
      mode: 'explore',
      campaignContext: {
        campaignId: null,
        sourceContext: null,
        placementTypes: [],
      },
      isPanelExpanded: false,
      isDrawerOpen: false,
      mapBounds: null,
    }),
}));