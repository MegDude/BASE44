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
import { getValidMapCenter } from '@/lib/mapValidation';

export type ViewMode =
  | 'explore'
  | 'places'
  | 'events'
  | 'perks'
  | 'buildings'
  | 'partners'
  | 'resident'
  | 'list';

export type DrawerState = 'closed' | 'preview' | 'expanded' | 'fullscreen' | 'collapsed';

export interface ActiveFilters {
  entityTypes: Set<string>;
  categories: Set<VenueCategory>;
  districts: Set<District>;
  walkMinutes: number | null;
  isOpenNow: boolean;
  isLive: boolean;
  isSaved: boolean;
  isTrending: boolean;
  hasPerk: boolean;
}

export interface MapState {
  mapCenter: [number, number];
  mapZoom: number;
  mapBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };

  selectedEntityId: string | null;
  selectedEntity: MapEntity | null;
  drawerState: DrawerState;

  activeFilters: ActiveFilters;
  searchQuery: string;

  filteredResults: MapEntity[];
  resultsSortBy: 'distance' | 'relevance' | 'popularity' | 'newest';
  resultsLimit: number;

  viewMode: ViewMode;
  showResultsList: boolean;
  showMapOnly: boolean;
  isMapLoading: boolean;

  savedEntityIds: Set<string>;
  heatmapVisible: boolean;
  liveActionsVisible: boolean;
  lastInteractionTime: number | null;

  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  selectEntity: (entity: MapEntity | null, options?: { openDrawer?: boolean; panToEntity?: boolean }) => void;
  openEntity: (entity: MapEntity | null, state?: DrawerState) => void;
  clearSelection: () => void;
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

const DEFAULT_FILTERS: ActiveFilters = {
  entityTypes: new Set(['venue', 'event', 'perk', 'building']),
  categories: new Set(),
  districts: new Set(),
  walkMinutes: null,
  isOpenNow: false,
  isLive: false,
  isSaved: false,
  isTrending: false,
  hasPerk: false,
};

const AUSTIN_CENTER: [number, number] = [30.267, -97.743];

export const useMapStateStore = create<MapState>((set, get) => ({
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

  setMapCenter: (center: [number, number]) => {
    const validCenter = getValidMapCenter(center, AUSTIN_CENTER);
    set({ mapCenter: validCenter });
  },

  setMapZoom: (zoom: number) => {
    if (zoom >= 0 && zoom <= 20) {
      set({ mapZoom: zoom });
    }
  },

  selectEntity: (entity: MapEntity | null, options = {}) => {
    const openDrawer = Boolean(options.openDrawer);
    const panToEntity = options.panToEntity !== false;

    set({
      selectedEntityId: entity?.id || null,
      selectedEntity: entity,
      drawerState: entity && openDrawer ? 'preview' : 'closed',
      lastInteractionTime: entity ? Date.now() : get().lastInteractionTime,
    });

    if (entity && panToEntity && entity.location) {
      get().setMapCenter([entity.location.latitude, entity.location.longitude]);
    }
  },

  openEntity: (entity: MapEntity | null, state: DrawerState = 'preview') => {
    set({
      selectedEntityId: entity?.id || null,
      selectedEntity: entity,
      drawerState: entity ? state : 'closed',
      lastInteractionTime: entity ? Date.now() : get().lastInteractionTime,
    });

    if (entity?.location) {
      get().setMapCenter([entity.location.latitude, entity.location.longitude]);
    }
  },

  clearSelection: () => {
    set({ selectedEntityId: null, selectedEntity: null, drawerState: 'closed' });
  },

  setDrawerState: (state: DrawerState) => {
    set({ drawerState: state });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode, lastInteractionTime: Date.now() });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, isMapLoading: true });
  },

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
    set({ activeFilters: { ...DEFAULT_FILTERS }, searchQuery: '', isMapLoading: true });
  },

  setFilteredResults: (results: MapEntity[]) => {
    set({ filteredResults: results, isMapLoading: false });
  },

  toggleSaved: (entityId: string) => {
    const saved = new Set(get().savedEntityIds);
    if (saved.has(entityId)) saved.delete(entityId);
    else saved.add(entityId);
    set({ savedEntityIds: saved });
  },

  setSaved: (entityIds: string[]) => {
    set({ savedEntityIds: new Set(entityIds) });
  },

  setHeatmapVisible: (visible: boolean) => set({ heatmapVisible: visible }),
  setLiveActionsVisible: (visible: boolean) => set({ liveActionsVisible: visible }),
  setShowResultsList: (show: boolean) => set({ showResultsList: show }),
  setShowMapOnly: (show: boolean) => set({ showMapOnly: show }),
  setIsMapLoading: (loading: boolean) => set({ isMapLoading: loading }),

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
