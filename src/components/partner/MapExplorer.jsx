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
    <section className="py-16 md:py-24 border-b border-[#0B1F33]/8">
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-8">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0B1F33] leading-tight tracking-normal mb-2">
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
                    ? 'border-[#0B1F33] bg-[#0B1F33] text-white'
                    : 'border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#B38F4F]/45'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className={`${height} rounded-lg border border-[#0B1F33]/8 overflow-hidden shadow-lg`}>
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