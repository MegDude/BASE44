import { useCallback, useRef } from "react";

export type MapPanelDrawerState = "peek" | "medium" | "expanded" | "full";

export interface MapPanelHistoryEntry {
  url: string;
  drawerState: MapPanelDrawerState;
  scrollTop: number;
  focusId: string;
}

const STORAGE_KEY = "dp-map-panel-history";

function readStack(): MapPanelHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch {
    return [];
  }
}

function writeStack(stack: MapPanelHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-12)));
  } catch {
    // Panel history is an enhancement; URL state remains canonical.
  }
}

export function useMapPanelNavigation() {
  const stackRef = useRef<MapPanelHistoryEntry[]>(readStack());

  const pushPanelState = useCallback((entry: MapPanelHistoryEntry) => {
    const next = [...stackRef.current.filter((item) => item.url !== entry.url), entry].slice(-12);
    stackRef.current = next;
    writeStack(next);
  }, []);

  const popPanelState = useCallback(() => {
    const next = [...stackRef.current];
    const entry = next.pop() || null;
    stackRef.current = next;
    writeStack(next);
    return entry;
  }, []);

  const peekPanelState = useCallback(() => stackRef.current[stackRef.current.length - 1] || null, []);

  const clearPanelStack = useCallback(() => {
    stackRef.current = [];
    writeStack([]);
  }, []);

  return { pushPanelState, popPanelState, peekPanelState, clearPanelStack };
}
