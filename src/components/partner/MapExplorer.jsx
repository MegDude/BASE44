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
            <p className="text-[15px] text-[#425466] max-w-2xl">{description}</p>
          )}
        </div>

        {/* Filter chips */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => onFilterChange?.(chip.id)}
                className={`rounded-[12px] border px-4 py-2 text-[12px] font-medium transition-all ${
                  activeFilter === chip.id
                    ? 'border-[#C8A96A]/45 bg-white/82 text-[#0B1F33] shadow-[0_10px_28px_rgba(11,31,51,0.055)]'
                    : 'border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#C8A96A]/45'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Map */}
        <div className={`${height} overflow-hidden rounded-[28px] border border-[#0B1F33]/8 bg-white shadow-[0_24px_80px_rgba(11,31,51,0.08)]`}>
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
