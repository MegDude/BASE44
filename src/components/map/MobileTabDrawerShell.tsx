import type { PropsWithChildren, ReactNode } from "react";
import { X } from "lucide-react";
import type { DrawerSnapState } from "./mobileTabRegistry";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  state?: DrawerSnapState;
  actions?: ReactNode;
  onClose: () => void;
  onStateChange?: (state: DrawerSnapState) => void;
}>;

const states: DrawerSnapState[] = ["collapsed", "medium", "expanded", "full"];

export default function MobileTabDrawerShell({ title, subtitle, state = "medium", actions, onClose, onStateChange, children }: Props) {
  return (
    <section className="dp-mobile-tab-drawer" data-drawer-state={state} role="dialog" aria-modal={state === "full"} aria-labelledby="dp-mobile-tab-title">
      <button type="button" className="dp-mobile-tab-drag-handle" aria-label={`Drawer size: ${state}. Activate to expand.`} onClick={() => onStateChange?.(states[Math.min(states.indexOf(state) + 1, states.length - 1)])}><span /></button>
      <header className="dp-mobile-tab-header">
        <div><h2 id="dp-mobile-tab-title">{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`}><X aria-hidden="true" /></button>
      </header>
      <div className="dp-mobile-tab-scroll" tabIndex={0}>{children}</div>
      {actions ? <footer className="dp-mobile-tab-actions">{actions}</footer> : null}
    </section>
  );
}
