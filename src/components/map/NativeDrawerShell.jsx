import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

let openDrawerCount = 0;
let previousBodyOverflow = "";

function lockPage() {
  if (typeof document === "undefined") return () => {};
  if (openDrawerCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.documentElement.classList.add("dp-native-drawer-open");
    document.body.classList.add("dp-native-drawer-open");
    document.body.style.overflow = "hidden";
  }
  openDrawerCount += 1;
  return () => {
    openDrawerCount = Math.max(0, openDrawerCount - 1);
    if (openDrawerCount === 0) {
      document.documentElement.classList.remove("dp-native-drawer-open");
      document.body.classList.remove("dp-native-drawer-open");
      document.body.style.overflow = previousBodyOverflow;
    }
  };
}

/**
 * @typedef {import("framer-motion").HTMLMotionProps<"aside"> & {
 *   children?: import("react").ReactNode,
 *   header?: import("react").ReactNode,
 *   actions?: import("react").ReactNode,
 *   contentClassName?: string,
 *   scrollClassName?: string,
 *   scrollRef?: import("react").Ref<HTMLDivElement>,
 *   scrollProps?: import("react").HTMLAttributes<HTMLDivElement>,
 *   drawerState?: "peek" | "medium" | "expanded" | "full",
 *   panelKind?: string,
 *   hasInternalActions?: boolean,
 *   onDrawerStateChange?: (state: "peek" | "medium" | "expanded" | "full") => void,
 *   onRequestClose?: () => void,
 *   returnFocusRef?: import("react").RefObject<HTMLElement>,
 * }} NativeDrawerShellProps
 */

/** @type {import("react").ForwardRefExoticComponent<NativeDrawerShellProps & import("react").RefAttributes<HTMLElement>>} */
export const NativeDrawerShell = forwardRef(function NativeDrawerShell({
  children,
  header,
  actions,
  className = "",
  contentClassName = "",
  scrollClassName = "",
  scrollRef,
  scrollProps = {},
  drawerState = "medium",
  panelKind = "detail",
  hasInternalActions = false,
  onDrawerStateChange,
  onRequestClose,
  returnFocusRef,
  onKeyDown,
  ...props
}, ref) {
  const shellRef = useRef(null);
  const previousFocusRef = useRef(null);
  useEffect(() => lockPage(), []);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    previousFocusRef.current = returnFocusRef?.current || document.activeElement;
    return () => {
      const focusTarget = returnFocusRef?.current || previousFocusRef.current;
      if (focusTarget && typeof focusTarget.focus === "function" && document.contains(focusTarget)) {
        window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
      }
    };
  }, [returnFocusRef]);
  const handleKeyDown = useCallback((event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    if (drawerState === "full") onDrawerStateChange?.("expanded");
    else if (drawerState === "expanded") onDrawerStateChange?.("medium");
    else onRequestClose?.();
  }, [drawerState, onDrawerStateChange, onKeyDown, onRequestClose]);
  const setShellRef = useCallback((node) => {
    shellRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
    if (!node) return;
    node.style.setProperty("top", "auto", "important");
    node.style.setProperty("right", "0", "important");
    node.style.setProperty("bottom", "0", "important");
    node.style.setProperty("left", "0", "important");
    node.style.setProperty("padding", "0", "important");
    const surface = node.querySelector(":scope > .dp-native-drawer-surface");
    surface?.style.setProperty("background", "#ffffff", "important");
    surface?.style.setProperty("border", "0", "important");
    surface?.style.setProperty("box-shadow", "none", "important");
    node.querySelector(".dp-map-detail-navigation-title")?.style.setProperty("display", "none", "important");

    const detailHeader = node.querySelector(".dp-map-detail-header");
    detailHeader?.style.setProperty("position", "relative", "important");
    detailHeader?.style.setProperty("min-height", "58px", "important");

    const grabber = node.querySelector(".dp-native-detail-grabber");
    grabber?.style.setProperty("display", "grid", "important");
    grabber?.style.setProperty("visibility", "visible", "important");
    grabber?.style.setProperty("opacity", "1", "important");
    grabber?.style.setProperty("position", "absolute", "important");
    grabber?.style.setProperty("top", "7px", "important");
    grabber?.style.setProperty("right", "auto", "important");
    grabber?.style.setProperty("bottom", "auto", "important");
    grabber?.style.setProperty("left", "50%", "important");
    grabber?.style.setProperty("z-index", "4", "important");
    grabber?.style.setProperty("width", "96px", "important");
    grabber?.style.setProperty("min-width", "96px", "important");
    grabber?.style.setProperty("height", "44px", "important");
    grabber?.style.setProperty("min-height", "44px", "important");
    grabber?.style.setProperty("margin", "0", "important");
    grabber?.style.setProperty("transform", "translateX(-50%)", "important");
    grabber?.style.setProperty("pointer-events", "auto", "important");

    const navigation = node.querySelector(".dp-map-detail-navigation");
    navigation?.style.setProperty("pointer-events", "none", "important");

    const close = node.querySelector(".dp-map-detail-close");
    close?.style.setProperty("grid-column", "3", "important");
    close?.style.setProperty("justify-self", "end", "important");
    close?.style.setProperty("width", "44px", "important");
    close?.style.setProperty("min-width", "44px", "important");
    close?.style.setProperty("height", "44px", "important");
    close?.style.setProperty("min-height", "44px", "important");
    close?.style.setProperty("pointer-events", "auto", "important");
  }, [ref]);

  return (
    <motion.aside
      ref={setShellRef}
      className={`dp-native-drawer ${className}`.trim()}
      data-drawer-state={drawerState}
      data-panel-kind={panelKind}
      data-has-drawer-actions={actions || hasInternalActions ? "true" : "false"}
      role="dialog"
      aria-modal="false"
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="dp-native-drawer-surface">
        {header ? <div className="dp-native-drawer-header">{header}</div> : null}
        <div className={`dp-native-drawer-content-viewport ${contentClassName}`.trim()}>
          <div ref={scrollRef} className={`dp-native-drawer-scroll ${scrollClassName}`.trim()} {...scrollProps}>
            {children}
            <div className="dp-native-drawer-content-end" aria-hidden="true" />
          </div>
        </div>
        {actions ? <footer className="dp-native-drawer-actions">{actions}</footer> : null}
        <div className="dp-native-drawer-underlay" aria-hidden="true" />
      </div>
    </motion.aside>
  );
});
