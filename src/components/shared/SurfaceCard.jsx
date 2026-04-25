/**
 * SurfaceCard — Shared card surface primitive
 * All content cards and module cards across the app use this component.
 * Do not create ad-hoc card wrappers; extend via className only.
 */
const PADDING = {
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8 lg:p-10",
};

export default function SurfaceCard({
  children,
  className = "",
  padding = "md",
  compact = false,
  dark = false,
}) {
  return (
    <div
      className={[
        compact ? "dp-card-compact" : "dp-card",
        "rounded-[var(--dp-radius-card)]",
        PADDING[padding],
        dark
          ? "bg-[linear-gradient(180deg,rgba(11,31,51,0.98),rgba(22,49,73,0.96))] text-white"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
