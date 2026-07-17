import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Location, NavigateFunction } from "react-router-dom";

const STORAGE_KEY = "downtown-perks-map-panel-stack-v1";

export type MapPanelFrame = {
  drawerState: string;
  scrollTop: number;
  url: string;
};

type PushOptions = {
  drawerState?: string;
  scrollTop?: number;
};

type MapPanelNavigationOptions = {
  location: Location;
  navigate: NavigateFunction;
};

function readStoredFrames(): MapPanelFrame[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((frame) => frame?.url) : [];
  } catch {
    return [];
  }
}

export function useMapPanelNavigation({ location, navigate }: MapPanelNavigationOptions) {
  const framesRef = useRef<MapPanelFrame[]>(readStoredFrames());
  const focusOriginsRef = useRef<HTMLElement[]>([]);
  const [depth, setDepth] = useState(framesRef.current.length);

  const persist = useCallback(() => {
    setDepth(framesRef.current.length);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(framesRef.current));
    } catch {
      // Navigation still works when session storage is unavailable.
    }
  }, []);

  const pushPanel = useCallback((options: PushOptions = {}) => {
    const url = `${location.pathname}${location.search}${location.hash}`;
    const previous = framesRef.current.at(-1);
    if (previous?.url !== url) {
      framesRef.current.push({
        drawerState: options.drawerState || "expanded",
        scrollTop: options.scrollTop || 0,
        url,
      });
      const active = document.activeElement;
      if (active instanceof HTMLElement) focusOriginsRef.current.push(active);
      persist();
    }
  }, [location.hash, location.pathname, location.search, persist]);

  const replacePanel = useCallback((url: string) => {
    navigate(url, { replace: true });
  }, [navigate]);

  const popPanel = useCallback(() => {
    const frame = framesRef.current.pop() || null;
    const focusOrigin = focusOriginsRef.current.pop();
    persist();
    if (!frame) return null;
    navigate(frame.url, { replace: true });
    window.setTimeout(() => focusOrigin?.focus?.({ preventScroll: true }), 0);
    return frame;
  }, [navigate, persist]);

  const closePanel = useCallback(() => {
    const focusOrigin = focusOriginsRef.current[0];
    framesRef.current = [];
    focusOriginsRef.current = [];
    persist();
    window.setTimeout(() => focusOrigin?.focus?.({ preventScroll: true }), 0);
  }, [persist]);

  const restoreState = useCallback(() => framesRef.current.at(-1) || null, []);

  useEffect(() => {
    function handleBrowserBack() {
      if (!framesRef.current.length) return;
      framesRef.current.pop();
      focusOriginsRef.current.pop();
      persist();
    }
    window.addEventListener("popstate", handleBrowserBack);
    return () => window.removeEventListener("popstate", handleBrowserBack);
  }, [persist]);

  return useMemo(() => ({
    closePanel,
    depth,
    goBack: popPanel,
    openPanel: pushPanel,
    popPanel,
    pushPanel,
    replacePanel,
    restoreState,
  }), [closePanel, depth, popPanel, pushPanel, replacePanel, restoreState]);
}
