import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X } from "lucide-react";

const WorkspaceSheetContext = createContext(null);

export function WorkspaceSheetProvider({ children }) {
  const [sheet, setSheet] = useState(null);
  const focusOriginRef = useRef(null);

  const openSheet = useCallback((nextSheet) => {
    focusOriginRef.current = document.activeElement;
    setSheet({ state: "summary", ...nextSheet });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
    requestAnimationFrame(() => focusOriginRef.current?.focus?.({ preventScroll: true }));
  }, []);

  const value = useMemo(() => ({ sheet, openSheet, closeSheet, setSheet }), [sheet, openSheet, closeSheet]);
  return <WorkspaceSheetContext.Provider value={value}>{children}<WorkspaceSheetHost /></WorkspaceSheetContext.Provider>;
}

export function useWorkspaceSheet() {
  const context = useContext(WorkspaceSheetContext);
  if (!context) throw new Error("useWorkspaceSheet must be used inside WorkspaceSheetProvider");
  return context;
}

export function WorkspaceSheetHost() {
  const context = useContext(WorkspaceSheetContext);
  const closeButtonRef = useRef(null);
  const sheet = context?.sheet;

  useEffect(() => {
    if (!sheet) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event) => {
      if (event.key === "Escape") context.closeSheet();
      if (event.key !== "Tab") return;
      const dialog = document.querySelector(".dp-workspace-sheet");
      const focusable = Array.from(dialog?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((node) => !node.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sheet, context]);

  if (!sheet || typeof document === "undefined") return null;
  const titleId = "dp-workspace-sheet-title";
  return createPortal(
    <div className="dp-workspace-sheet-layer" data-state={sheet.state || "summary"}>
      <button className="dp-workspace-sheet-backdrop" type="button" aria-label="Close sheet" onClick={context.closeSheet} />
      <section className="dp-workspace-sheet" data-workspace-drawer="true" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="dp-workspace-sheet-handle" aria-hidden="true"><span /></div>
        <header className="dp-workspace-sheet-header">
          <div>
            {sheet.eyebrow ? <p>{sheet.eyebrow}</p> : null}
            <h2 id={titleId}>{sheet.title}</h2>
          </div>
          <div className="dp-workspace-surface-controls">
            {typeof sheet.onBack === "function" ? <button type="button" onClick={sheet.onBack} aria-label={`Go back from ${sheet.title}`}><ArrowLeft aria-hidden="true" /></button> : null}
            <button ref={closeButtonRef} type="button" onClick={context.closeSheet} aria-label={`Close ${sheet.title}`}><X aria-hidden="true" /></button>
          </div>
        </header>
        <div className="dp-workspace-sheet-body">{sheet.content}</div>
        {sheet.footer ? <footer className="dp-workspace-sheet-footer">{sheet.footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
