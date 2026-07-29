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

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      if (state === "full") onStateChange?.("expanded");
      else if (state === "expanded") onStateChange?.("medium");
      else onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [onClose, onStateChange, state]);

  return (
    <section className="dp-mobile-tab-drawer" data-drawer-state={state} role="dialog" aria-modal={state === "full"} aria-labelledby="dp-mobile-tab-title">
      <button type="button" className="dp-mobile-tab-drag-handle" aria-label={`Drawer size: ${state}. Activate to expand.`} onClick={() => onStateChange?.(states[Math.min(states.indexOf(state) + 1, states.length - 1)])}><span /></button>
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
