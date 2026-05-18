/**
 * FilterChipRow — Shared filter chip row primitive
 * Used on Explore, Events, Properties, and any map-adjacent page.
 * Enforces identical chip height, radius, and active state via dp-chip tokens.
 */
export default function FilterChipRow({ chips = [], activeId, onChange, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(chip.id)}
          className={`dp-chip ${activeId === chip.id ? "dp-chip-active" : ""}`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
