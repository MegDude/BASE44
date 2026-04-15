import { create } from 'zustand';
import { initialMapState, FILTER_CHIPS } from '@/lib/mapSystemConstants';
import { base44 } from '@/api/base44Client';

/**
 * Unified map store
 * Synchronizes search, filters, selection, drawer, and results
 * Single source of truth for all map interactions
 * Extended with live data subscriptions and actions
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
  timeFilter: 'now', // now | today | week
  liveActions: [], // Recent user actions for heatmap
  heatmapVisible: false,
  isRedeeming: false,
  redeemingId: null,

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
  setMapCenter: (center) => {
    // Validate center before storing to prevent NaN propagation
    if (Array.isArray(center) && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      set({
        mapCenter: center,
      });
    }
  },

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

  // ── LIVE DATA & ACTIONS ───────────────────────────────────────

  // Set time filter (affects all layers)
  setTimeFilter: (filter) =>
    set({
      timeFilter: filter,
      isLoading: true,
    }),

  // Toggle heatmap
  setHeatmapVisible: (visible) =>
    set({ heatmapVisible: visible }),

  // Track user action (save, redeem, RSVP, etc.)
  trackAction: async (entityId, actionType, metadata = {}) => {
    try {
      set({ isRedeeming: true, redeemingId: entityId });

      const user = await base44.auth.me();
      if (!user) return;

      const action = {
        user_email: user.email,
        entity_id: entityId,
        action_type: actionType,
        timestamp: new Date().toISOString(),
        metadata,
      };

      await base44.entities.UserAction.create(action);

      // Add to local live feed
      set((state) => ({
        liveActions: [action, ...state.liveActions].slice(0, 20),
      }));

      return action;
    } catch (error) {
      console.error('Action tracking failed:', error);
    } finally {
      set({ isRedeeming: false, redeemingId: null });
    }
  },

  // Subscribe to live actions (for dashboard + heatmap)
  subscribeLiveActions: () => {
    const unsubscribe = base44.entities.UserAction.subscribe((event) => {
      if (event.type === 'create') {
        set((state) => ({
          liveActions: [event.data, ...state.liveActions].slice(0, 20),
        }));
      }
    });
    return unsubscribe;
  },

  // Get heatmap data (filtered by time)
  getHeatmapData: () => {
    const { liveActions, timeFilter } = get();
    const now = new Date();
    const cutoff = new Date();

    if (timeFilter === 'now') cutoff.setMinutes(cutoff.getMinutes() - 30);
    else if (timeFilter === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (timeFilter === 'week') cutoff.setDate(cutoff.getDate() - 7);

    return liveActions.filter(
      (a) => new Date(a.timestamp) >= cutoff
    );
  },

  // Reset everything
  reset: () => set(initialMapState),
}));