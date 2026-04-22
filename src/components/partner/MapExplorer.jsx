import MapShell from '@/components/map/MapShell';

/**
 * MapExplorer — Unified interactive map surface for all partner pages
 * Shows placement, filters, and interaction specific to partner type
 */
export default function MapExplorer({
  mode = 'partner',
  items = [],
  selected,
  onSelect,
  markerIcon,
  filterChips = [],
  activeFilter,
  onFilterChange,
  title = 'Business insight map',
  description,
  height = 'h-[500px]',
}) {
  return (
    <section className="py-16 md:py-24 border-b border-[#e8e5df]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-[30px] md:text-[38px] font-semibold text-[var(--dp-navy,#0B1F33)] leading-tight tracking-[-0.045em] mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] leading-6 text-[rgba(11,31,51,0.62)] max-w-2xl">{description}</p>
          )}
        </div>

        {/* Filter chips */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => onFilterChange?.(chip.id)}
                className={`px-4 py-2 rounded-full border text-[12px] font-medium transition-all ${
                  activeFilter === chip.id
                    ? 'border-[var(--dp-navy,#0B1F33)] bg-[var(--dp-navy,#0B1F33)] text-white'
                    : 'border-[rgba(11,31,51,0.10)] bg-white/72 text-[rgba(11,31,51,0.66)] hover:border-[rgba(11,31,51,0.22)] hover:text-[var(--dp-navy,#0B1F33)]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className={`${height} rounded-[24px] border border-[rgba(11,31,51,0.10)] overflow-hidden shadow-[0_22px_54px_rgba(11,31,51,0.10)]`}>
          <MapShell
            mode={mode}
            items={items}
            selected={selected}
            onSelect={onSelect}
            markerIcon={markerIcon}
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
