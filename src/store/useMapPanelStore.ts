import { create } from "zustand";

export type MapMode = "search" | "ask";
export type Decision = "now" | "open" | "near";
export type ResultType = "all" | "venues" | "events" | "perks" | "buildings";

export type MapPanelState = {
  mode: MapMode;
  query: string;
  submittedQuery: string;
  askVersion: number;
  decision: Decision;
  type: ResultType;
  district: string;
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
    activeSpecials: boolean;
    foodDeals: boolean;
    drinkDeals: boolean;
    residentPerks: boolean;
    needsDetails: boolean;
  };
};

type MapPanelActions = {
  setMode: (mode: MapMode) => void;
  setQuery: (query: string) => void;
  submitAsk: (query?: string) => void;
  setDecision: (decision: Decision) => void;
  setType: (type: ResultType) => void;
  setDistrict: (district: string) => void;
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
  submittedQuery: "",
  askVersion: 0,
  decision: "now",
  type: "all",
  district: "",
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
    activeSpecials: true,
    foodDeals: false,
    drinkDeals: false,
    residentPerks: false,
    needsDetails: false,
  },
};

export const useMapPanelStore = create<MapPanelState & MapPanelActions>((set) => ({
  ...defaultMapPanelState,

  setMode: (mode) => set({ mode }),
  setQuery: (query) => set({ query }),
  submitAsk: (query) =>
    set((state) => {
      const nextQuery = typeof query === "string" ? query : state.query;
      return {
        mode: "ask",
        query: nextQuery,
        submittedQuery: nextQuery.trim(),
        askVersion: state.askVersion + 1,
      };
    }),
  setDecision: (decision) => set({ decision }),
  setType: (type) => set({ type }),
  setDistrict: (district) => set({ district }),
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
      submittedQuery: next.submittedQuery ?? state.submittedQuery,
      askVersion:
        typeof next.askVersion === "number"
          ? next.askVersion
          : next.submittedQuery && state.askVersion === 0
            ? 1
            : state.askVersion,
      categories: next.categories ?? state.categories,
      filters: {
        ...state.filters,
        ...(next.filters ?? {}),
      },
    })),

  resetPanel: () => set(defaultMapPanelState),
}));
