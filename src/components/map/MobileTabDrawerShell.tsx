import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import type { DrawerSnapState } from "./mobileTabRegistry";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  state?: DrawerSnapState;
  actions?: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  onStateChange?: (state: DrawerSnapState) => void;
}>;

const states: DrawerSnapState[] = ["collapsed", "medium", "expanded", "full"];

export default function MobileTabDrawerShell({ title, subtitle, state = "medium", actions, onClose, onBack, onStateChange, children }: Props) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef(state);
  const closeRef = useRef(onClose);
  const stateChangeRef = useRef(onStateChange);
  const dragRef = useRef({ y: 0, active: false, moved: false });

  const handleGripPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = { y: event.clientY, active: true, moved: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handleGripPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current.moved = Math.abs(dy) >= 36;
    if (!dragRef.current.moved) return;
    const index = states.indexOf(state);
    if (dy > 0) {
      if (index <= 0) onClose();
      else onStateChange?.(states[index - 1]);
    } else if (index >= 0 && index < states.length - 1) {
      onStateChange?.(states[index + 1]);
    }
  };
  const handleGripClick = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    const index = states.indexOf(state);
    onStateChange?.(states[Math.min(Math.max(index, 0) + 1, states.length - 1)]);
  };

  useEffect(() => {
    stateRef.current = state;
    closeRef.current = onClose;
    stateChangeRef.current = onStateChange;
  }, [onClose, onStateChange, state]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (stateRef.current === "full") stateChangeRef.current?.("expanded");
      else if (stateRef.current === "expanded") stateChangeRef.current?.("medium");
      else closeRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <section className="dp-mobile-tab-drawer" data-drawer-state={state} role="dialog" aria-modal={state === "full"} aria-labelledby="dp-mobile-tab-title">
      <button
        type="button"
        className="dp-mobile-tab-drag-handle"
        aria-label={`Drawer size: ${state}. Swipe down to minimise, up to expand.`}
        onPointerDown={handleGripPointerDown}
        onPointerUp={handleGripPointerUp}
        onClick={handleGripClick}
      ><span aria-hidden="true" /></button>
      <header className="dp-mobile-tab-header">
        {onBack ? <button type="button" onClick={onBack} aria-label={`Go back from ${title}`}><ArrowLeft aria-hidden="true" /></button> : <span aria-hidden="true" />}
        <div><h2 id="dp-mobile-tab-title">{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`}><X aria-hidden="true" /></button>
      </header>
      <div className="dp-mobile-tab-scroll" tabIndex={0}>{children}</div>
      {actions ? <footer className="dp-mobile-tab-actions">{actions}</footer> : null}
    </section>
  );
}
