import { create } from "zustand";

export type MapMode = "search" | "ask";
export type Decision = "now" | "open" | "near";
export type ResultType = "all" | "venues" | "events" | "perks" | "buildings";

export type MapPanelState = {
  mode: MapMode;
  query: string;
  decision: Decision;
  type: ResultType;
  agentExplanation: string;
  agentSuggestions: string[];
  agentSource: "idle" | "api" | "base44" | "fallback";
  categories: string[];
  filters: {
    crowd: boolean;
    deals: boolean;
    fiveMin: boolean;
    tenMin: boolean;
    openNow: boolean;
  };
};

type MapPanelActions = {
  setMode: (mode: MapMode) => void;
  setQuery: (query: string) => void;
  setDecision: (decision: Decision) => void;
  setType: (type: ResultType) => void;
  setAgentState: (agent: Partial<Pick<MapPanelState, "agentExplanation" | "agentSuggestions" | "agentSource">>) => void;
  setCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  toggleFilter: (key: keyof MapPanelState["filters"]) => void;
  setFilters: (filters: Partial<MapPanelState["filters"]>) => void;
  hydrateFromState: (next: Partial<MapPanelState>) => void;
  resetPanel: () => void;
};

export const defaultMapPanelState: MapPanelState = {
  mode: "ask",
  query: "",
  decision: "now",
  type: "all",
  agentExplanation: "",
  agentSuggestions: [],
  agentSource: "idle",
  categories: [],
  filters: {
    crowd: false,
    deals: false,
    fiveMin: false,
    tenMin: false,
    openNow: false,
  },
};

export const useMapPanelStore = create<MapPanelState & MapPanelActions>((set) => ({
  ...defaultMapPanelState,

  setMode: (mode) => set({ mode }),
  setQuery: (query) => set({ query }),
  setDecision: (decision) => set({ decision }),
  setType: (type) => set({ type }),
  setAgentState: (agent) =>
    set((state) => ({
      agentExplanation: agent.agentExplanation ?? state.agentExplanation,
      agentSuggestions: agent.agentSuggestions ?? state.agentSuggestions,
      agentSource: agent.agentSource ?? state.agentSource,
    })),
  setCategories: (categories) => set({ categories }),

  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),

  toggleFilter: (key) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: !state.filters[key],
      },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),

  hydrateFromState: (next) =>
    set((state) => ({
      ...state,
      ...next,
      categories: next.categories ?? state.categories,
      filters: {
        ...state.filters,
        ...(next.filters ?? {}),
      },
    })),

  resetPanel: () => set(defaultMapPanelState),
}));
