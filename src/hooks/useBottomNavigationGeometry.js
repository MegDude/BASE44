import { useEffect } from "react";

const DEFAULT_NAV_HEIGHT = 64;

function setViewportVariables() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--dp-visual-viewport-height", `${Math.round(viewportHeight)}px`);
}

export function useBottomNavigationGeometry(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    let observer;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nav = document.querySelector("[data-dp-bottom-navigation='true']");
        nav?.style.setProperty("display", "block", "important");
        nav?.style.setProperty("visibility", "visible", "important");
        nav?.style.setProperty("opacity", "1", "important");
        const measuredHeight = nav?.getBoundingClientRect().height || DEFAULT_NAV_HEIGHT;
        document.documentElement.style.setProperty("--dp-measured-bottom-nav-height", `${Math.round(measuredHeight)}px`);
        setViewportVariables();
      });
    };

    const nav = document.querySelector("[data-dp-bottom-navigation='true']");
    if (nav && "ResizeObserver" in window) {
      observer = new ResizeObserver(update);
      observer.observe(nav);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [enabled]);
}
