/**
 * AppShell — Universal page wrapper
 * Enforces consistent surface color, top-nav offset, and text base across all pages.
 * Every page must render inside this component.
 */
export default function AppShell({ children, className = "" }) {
  return (
    <div
      className={`min-h-screen bg-[var(--dp-surface-base)] pt-[68px] text-[var(--dp-navy)] ${className}`}
    >
      {children}
    </div>
  );
}
