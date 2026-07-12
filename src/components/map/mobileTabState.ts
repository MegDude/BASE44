import type { DrawerSnapState, MapAudienceMode } from "./mobileTabRegistry";

export type MobileTabState = {
  mode: MapAudienceMode;
  activeTab: string;
  drawerState: DrawerSnapState;
  selectedEntityId?: string;
  selectedSubView?: string;
  scrollPositions: Record<string, number>;
  filters: { filter: string; district?: string; radius?: string };
  searchIntent?: string;
  lastUserDismissedAt?: number;
};

export const DRAWER_SNAP_HEIGHTS: Record<Exclude<DrawerSnapState, "dismissed">, string> = {
  collapsed: "96px",
  medium: "48dvh",
  expanded: "88dvh",
  full: "calc(100dvh - max(12px, env(safe-area-inset-top)))",
};

export function createMobileTabState(mode: MapAudienceMode, activeTab = "map"): MobileTabState {
  return { mode, activeTab, drawerState: "medium", scrollPositions: {}, filters: { filter: "All" } };
}

export function transitionMobileTabState(current: MobileTabState, next: Partial<MobileTabState>): MobileTabState {
  const modeChanged = next.mode && next.mode !== current.mode;
  return {
    ...current,
    ...next,
    selectedEntityId: modeChanged ? undefined : next.selectedEntityId ?? current.selectedEntityId,
    selectedSubView: modeChanged ? undefined : next.selectedSubView ?? current.selectedSubView,
    scrollPositions: next.scrollPositions || current.scrollPositions,
    filters: next.filters || current.filters,
    searchIntent: modeChanged ? undefined : next.searchIntent ?? current.searchIntent,
  };
}

export function rememberTabScroll(state: MobileTabState, tabId: string, scrollTop: number): MobileTabState {
  return { ...state, scrollPositions: { ...state.scrollPositions, [`${state.mode}:${tabId}`]: Math.max(0, scrollTop) } };
}
