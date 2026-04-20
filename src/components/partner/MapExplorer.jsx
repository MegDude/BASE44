import MapShell from '@/components/map/MapShell';

/**
 * MapExplorer — Unified interactive map surface for all partner pages
 * Shows placement, filters, and interaction specific to partner type
 */
export default function MapExplorer({
  items = [],
  selected,
  onSelect,
  markerIcon,
  filterChips = [],
  activeFilter,
  onFilterChange,
  title = 'Map placement',
  description,
  height = 'h-[500px]',
}) {
  return (
    <section className="py-16 md:py-24 border-b border-[#e8e5df]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#111] leading-tight tracking-tight mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-[15px] text-[#6f6b65] max-w-2xl">{description}</p>
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
                    ? 'border-[#111] bg-[#111] text-white'
                    : 'border-[#e8e5df] bg-white text-[#3d3934] hover:border-[#bbb]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className={`${height} rounded-2xl border border-[#e8e5df] overflow-hidden shadow-lg`}>
          <MapShell
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