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
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  const setShellRef = useCallback((node) => {
    shellRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || !header) return;
    const duplicateTitle = shell.querySelector(".dp-map-detail-navigation-title");
    duplicateTitle?.style.setProperty("display", "none", "important");
    const grabber = shell.querySelector(".dp-native-detail-grabber");
    grabber?.style.setProperty("display", "grid", "important");
    grabber?.style.setProperty("visibility", "visible", "important");
    grabber?.style.setProperty("opacity", "1", "important");
    grabber?.style.setProperty("left", "50%", "important");
    grabber?.style.setProperty("transform", "translateX(-50%)", "important");
    const close = shell.querySelector(".dp-map-detail-close");
    close?.style.setProperty("grid-column", "3", "important");
    close?.style.setProperty("justify-self", "end", "important");
  }, [header]);
  // Swipe-to-resize on the grip: dragging down steps the drawer toward the
  // bottom (full → expanded → medium → peek → close); dragging up steps it back.
  const dragRef = useRef({ y: 0, active: false, moved: false });
  const handleGripPointerDown = useCallback((event) => {
    dragRef.current = { y: event.clientY, active: true, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);
  const settleGripDrag = useCallback((clientY) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const dy = clientY - dragRef.current.y;
    dragRef.current.moved = Math.abs(dy) >= 36;
    if (!dragRef.current.moved) return;
    const order = panelKind === "list"
      ? ["peek", "expanded"]
      : ["peek", "medium", "expanded", "full"];
    const index = order.indexOf(drawerState);
    if (dy > 0) {
      if (index <= 0) onRequestClose?.();
      else onDrawerStateChange?.(order[index - 1]);
    } else if (index >= 0 && index < order.length - 1) {
      onDrawerStateChange?.(order[index + 1]);
    }
  }, [drawerState, onDrawerStateChange, onRequestClose, panelKind]);
  const handleGripPointerUp = useCallback((event) => settleGripDrag(event.clientY), [settleGripDrag]);
  const handleGripTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    if (touch) dragRef.current = { y: touch.clientY, active: true, moved: false };
  }, []);
  const handleGripTouchEnd = useCallback((event) => {
    const touch = event.changedTouches[0];
    if (touch) settleGripDrag(touch.clientY);
  }, [settleGripDrag]);
  const cycleGripState = useCallback(() => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    const order = panelKind === "list"
      ? ["peek", "expanded"]
      : ["peek", "medium", "expanded", "full"];
    const index = order.indexOf(drawerState);
    if (panelKind === "list") {
      onDrawerStateChange?.(drawerState === "expanded" ? "peek" : "expanded");
      return;
    }
    onDrawerStateChange?.(order[Math.min(Math.max(index, 0) + 1, order.length - 1)]);
  }, [drawerState, onDrawerStateChange, panelKind]);
  const drawerClassName = [
    "dp-native-drawer",
    ...className.split(/\s+/).filter((token) => token && token !== "dp-native-drawer"),
  ].join(" ");

  return (
    <motion.aside
      ref={setShellRef}
      className={drawerClassName}
      data-drawer-state={drawerState}
      data-panel-kind={panelKind}
      data-has-drawer-actions={actions || hasInternalActions ? "true" : "false"}
      role="dialog"
      aria-modal="false"
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="dp-native-drawer-surface">
        <button
          type="button"
          className="dp-native-drawer-grip flex w-full items-center justify-center py-2.5 shrink-0 cursor-grab active:cursor-grabbing bg-white border-0"
          aria-label={`Drawer size: ${drawerState}. Swipe down to minimise, up to expand.`}
          onPointerDown={handleGripPointerDown}
          onPointerUp={handleGripPointerUp}
          onTouchStart={handleGripTouchStart}
          onTouchEnd={handleGripTouchEnd}
          onClick={cycleGripState}
        >
          <span className="h-1 w-10 rounded-full bg-black/20" aria-hidden="true" />
        </button>
        {header ? <div className="dp-native-drawer-header shrink-0 border-b border-black/5 bg-white">{header}</div> : null}
        <div className={`dp-native-drawer-content-viewport flex-1 min-h-0 overflow-y-auto px-5 py-5 overscroll-contain ${contentClassName}`.trim()}>
          <div ref={scrollRef} className={`dp-native-drawer-scroll ${scrollClassName}`.trim()} {...scrollProps}>
            {children}
            <div className="dp-native-drawer-content-end" aria-hidden="true" />
          </div>
        </div>
        {actions ? <footer className="dp-native-drawer-actions shrink-0 border-t border-black/5 bg-white p-4">{actions}</footer> : null}
        <div className="dp-native-drawer-underlay" aria-hidden="true" />
      </div>
    </motion.aside>
  );
});
