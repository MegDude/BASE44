/**
 * Unified Map State Store
 * Single source of truth for all map-related state
 * 
 * Controls:
 * - map center, zoom, bounds
 * - active filters (entity type, category, district, walk radius)
 * - selected entity
 * - filtered result set
 * - view mode
 * - drawer state
 * - interactions (heatmap, live actions, saved items)
 */

import { create } from 'zustand';
import { MapEntity, District, VenueCategory } from '@/data/mapEntities';
import { isValidMapCenter, getValidMapCenter } from '@/lib/mapValidation';

/**
 * View mode determines what is emphasized on the map
 */
export type ViewMode = 
  | 'explore'     // All entities mixed (resident view)
  | 'places'      // Venues only
  | 'events'      // Events only
  | 'perks'       // Perks only
  | 'buildings'   // Buildings/properties only
  | 'partners'    // Partner-oriented view
  | 'resident'    // Resident dashboard view
  | 'list';       // List-only mode

/**
 * Drawer visibility state
 */
export type DrawerState = 'closed' | 'preview' | 'expanded' | 'fullscreen';

/**
 * Active filters configuration
 */
export interface ActiveFilters {
  entityTypes: Set<string>;        // venue, event, perk, building, etc.
  categories: Set<VenueCategory>;  // coffee, bar, fitness, etc.
  districts: Set<District>;        // rainey, congress, etc.
  walkMinutes: number | null;      // Max walk time in minutes
  isOpenNow: boolean;
  isLive: boolean;
  isSaved: boolean;
  isTrending: boolean;
}

/**
 * Map state interface
 */
export interface MapState {
  // ─── Map Viewport ───────────────────────────────
  mapCenter: [number, number];
  mapZoom: number;
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  // ─── Selection & Detail ──────────────────────────
  selectedEntityId: string | null;
  selectedEntity: MapEntity | null;
  drawerState: DrawerState;

  // ─── Filtering ──────────────────────────────────
  activeFilters: ActiveFilters;
  searchQuery: string;

  // ─── Results ────────────────────────────────────
  filteredResults: MapEntity[];
  resultsSortBy: 'distance' | 'relevance' | 'popularity' | 'newest';
  resultsLimit: number;

  // ─── View State ─────────────────────────────────
  viewMode: ViewMode;
  showResultsList: boolean;
  showMapOnly: boolean;
  isMapLoading: boolean;

  // ─── Interactions ───────────────────────────────
  savedEntityIds: Set<string>;
  heatmapVisible: boolean;
  liveActionsVisible: boolean;
  lastInteractionTime: number | null;

  // ─── Actions ────────────────────────────────────
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  selectEntity: (entity: MapEntity | null) => void;
  setDrawerState: (state: DrawerState) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setFilteredResults: (results: MapEntity[]) => void;
  updateFilter: (filterKey: keyof ActiveFilters, value: unknown) => void;
  clearFilters: () => void;
  toggleSaved: (entityId: string) => void;
  setSaved: (entityIds: string[]) => void;
  setHeatmapVisible: (visible: boolean) => void;
  setLiveActionsVisible: (visible: boolean) => void;
  setShowResultsList: (show: boolean) => void;
  setShowMapOnly: (show: boolean) => void;
  setIsMapLoading: (loading: boolean) => void;
  reset: () => void;
}

/**
 * Default filter state
 */
const DEFAULT_FILTERS: ActiveFilters = {
  entityTypes: new Set(['venue', 'event', 'perk', 'building']),
  categories: new Set(),
  districts: new Set(),
  walkMinutes: null,
  isOpenNow: false,
  isLive: false,
  isSaved: false,
  isTrending: false,
};

/**
 * Austin downtown center (fallback)
 */
const AUSTIN_CENTER: [number, number] = [30.267, -97.743];

/**
 * Unified map state store
 */
export const useMapStateStore = create<MapState>((set, get) => ({
  // Initial state
  mapCenter: AUSTIN_CENTER,
  mapZoom: 14,
  mapBounds: undefined,

  selectedEntityId: null,
  selectedEntity: null,
  drawerState: 'closed',

  activeFilters: { ...DEFAULT_FILTERS },
  searchQuery: '',

  filteredResults: [],
  resultsSortBy: 'distance',
  resultsLimit: 50,

  viewMode: 'explore',
  showResultsList: false,
  showMapOnly: false,
  isMapLoading: false,

  savedEntityIds: new Set(),
  heatmapVisible: false,
  liveActionsVisible: false,
  lastInteractionTime: null,

  // ─── Map Viewport Actions ───────────────────────────
  setMapCenter: (center: [number, number]) => {
    const validCenter = getValidMapCenter(center, AUSTIN_CENTER);
    set({ mapCenter: validCenter });
  },

  setMapZoom: (zoom: number) => {
    if (zoom >= 0 && zoom <= 20) {
      set({ mapZoom: zoom });
    }
  },

  // ─── Selection Actions ──────────────────────────────
  selectEntity: (entity: MapEntity | null) => {
    set({
      selectedEntityId: entity?.id || null,
      selectedEntity: entity,
      drawerState: entity ? 'preview' : 'closed',
      lastInteractionTime: Date.now(),
    });

    // Pan map to selected entity if valid location
    if (entity && entity.location) {
      get().setMapCenter([entity.location.latitude, entity.location.longitude]);
    }
  },

  setDrawerState: (state: DrawerState) => {
    set({ drawerState: state });
  },

  // ─── View Mode Actions ──────────────────────────────
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode, lastInteractionTime: Date.now() });
  },

  // ─── Search Actions ────────────────────────────────
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, isMapLoading: true });
  },

  // ─── Filter Actions ────────────────────────────────
  updateFilter: (filterKey: keyof ActiveFilters, value: unknown) => {
    const filters = { ...get().activeFilters };

    if (filterKey === 'entityTypes' && value instanceof Set) {
      filters.entityTypes = value;
    } else if (filterKey === 'categories' && value instanceof Set) {
      filters.categories = value;
    } else if (filterKey === 'districts' && value instanceof Set) {
      filters.districts = value;
    } else if (filterKey === 'walkMinutes') {
      filters.walkMinutes = typeof value === 'number' ? value : null;
    } else if (typeof value === 'boolean') {
      (filters[filterKey] as boolean) = value;
    }

    set({ activeFilters: filters, isMapLoading: true });
  },

  clearFilters: () => {
    set({
      activeFilters: { ...DEFAULT_FILTERS },
      searchQuery: '',
      isMapLoading: true,
    });
  },

  // ─── Results Actions ───────────────────────────────
  setFilteredResults: (results: MapEntity[]) => {
    set({ filteredResults: results, isMapLoading: false });
  },

  // ─── Saved Items Actions ───────────────────────────
  toggleSaved: (entityId: string) => {
    const saved = new Set(get().savedEntityIds);
    if (saved.has(entityId)) {
      saved.delete(entityId);
    } else {
      saved.add(entityId);
    }
    set({ savedEntityIds: saved });
  },

  setSaved: (entityIds: string[]) => {
    set({ savedEntityIds: new Set(entityIds) });
  },

  // ─── Visualization Actions ─────────────────────────
  setHeatmapVisible: (visible: boolean) => {
    set({ heatmapVisible: visible });
  },

  setLiveActionsVisible: (visible: boolean) => {
    set({ liveActionsVisible: visible });
  },

  // ─── Layout Actions ────────────────────────────────
  setShowResultsList: (show: boolean) => {
    set({ showResultsList: show });
  },

  setShowMapOnly: (show: boolean) => {
    set({ showMapOnly: show });
  },

  // ─── Loading State ─────────────────────────────────
  setIsMapLoading: (loading: boolean) => {
    set({ isMapLoading: loading });
  },

  // ─── Reset ──────────────────────────────────────────
  reset: () => {
    set({
      mapCenter: AUSTIN_CENTER,
      mapZoom: 14,
      selectedEntityId: null,
      selectedEntity: null,
      drawerState: 'closed',
      activeFilters: { ...DEFAULT_FILTERS },
      searchQuery: '',
      filteredResults: [],
      viewMode: 'explore',
      showResultsList: false,
      showMapOnly: false,
      isMapLoading: false,
      savedEntityIds: new Set(),
      heatmapVisible: false,
      liveActionsVisible: false,
    });
  },
}));

/**
 * Selector hooks for efficient component subscriptions
 */
export const selectMapCenter = (state: MapState) => state.mapCenter;
export const selectMapZoom = (state: MapState) => state.mapZoom;
export const selectSelectedEntity = (state: MapState) => state.selectedEntity;
export const selectDrawerState = (state: MapState) => state.drawerState;
export const selectActiveFilters = (state: MapState) => state.activeFilters;
export const selectFilteredResults = (state: MapState) => state.filteredResults;
export const selectViewMode = (state: MapState) => state.viewMode;
export const selectSearchQuery = (state: MapState) => state.searchQuery;
export const selectSavedEntityIds = (state: MapState) => state.savedEntityIds;
export const selectIsMapLoading = (state: MapState) => state.isMapLoading;