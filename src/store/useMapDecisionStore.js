import { create } from "zustand";

export const useMapDecisionStore = create((set, get) => ({
  intent: "",
  filters: [],
  selectedEntityId: null,
  hoveredEntityId: null,
  results: [],
  viewport: null,
  overlays: {
    radius: 7,
    heatmap: false,
    routes: [],
  },

  setIntent: (intent) => set({ intent }),
  setFilters: (filters) => set({ filters: Array.isArray(filters) ? filters : [] }),
  setResults: (results) => set({ results: Array.isArray(results) ? results : [] }),
  setViewport: (viewport) => set({ viewport }),
  setSelectedEntityId: (selectedEntityId) => set({ selectedEntityId }),
  setHoveredEntityId: (hoveredEntityId) => set({ hoveredEntityId }),
  clearSelection: () => set({ selectedEntityId: null, hoveredEntityId: null }),

  setOverlay: (key, value) =>
    set((state) => ({
      overlays: {
        ...state.overlays,
        [key]: value,
      },
    })),

  getSelectedEntity: () => {
    const { selectedEntityId, results } = get();
    if (!selectedEntityId) return null;
    return results.find((item) => item.id === selectedEntityId) || null;
  },
}));
