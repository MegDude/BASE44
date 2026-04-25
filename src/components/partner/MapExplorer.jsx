import { useEffect, useMemo, useState } from 'react';
import { Building2, Calendar, MapPin, Sparkles, Ticket } from 'lucide-react';
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
  const [internalSelected, setInternalSelected] = useState(selected || items[0] || null);

  useEffect(() => {
    setInternalSelected(selected || items[0] || null);
  }, [items, selected]);

  const activeItem = selected || internalSelected;

  const handleSelect = (item) => {
    setInternalSelected(item);
    onSelect?.(item);
  };

  const activeIcon = useMemo(() => {
    if (!activeItem) return MapPin;
    if (activeItem.type === 'building' || activeItem.type === 'hotel') return Building2;
    if (activeItem.type === 'event') return Calendar;
    if (activeItem.type === 'perk' || activeItem.perk?.value || activeItem.perk_value) return Ticket;
    return Sparkles;
  }, [activeItem]);

  return (
    <section className="rounded-[28px] border border-[rgba(11,31,51,0.08)] bg-white p-5 shadow-[0_18px_42px_rgba(11,31,51,0.06)]">
      <div>
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className={`${height} overflow-hidden rounded-[24px] border border-[rgba(11,31,51,0.10)] shadow-[0_22px_54px_rgba(11,31,51,0.10)]`}>
            <MapShell
              mode={mode}
              items={items}
              selected={activeItem}
              onSelect={handleSelect}
              markerIcon={markerIcon}
              className="w-full h-full"
            />
          </div>

          <div className="rounded-[24px] border border-[rgba(11,31,51,0.08)] bg-[#fbfbfd] p-4 shadow-[0_16px_36px_rgba(11,26,43,0.06)]">
            {activeItem ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(207,175,90,0.16)] text-[var(--dp-navy,#0B1F33)]">
                    {(() => {
                      const Icon = activeIcon;
                      return <Icon className="h-4.5 w-4.5" />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(11,31,51,0.48)]">
                      {activeItem.category || activeItem.type || "Selected place"}
                    </div>
                    <div className="mt-1 text-[1.05rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[var(--dp-navy,#0B1F33)]">
                      {activeItem.name || activeItem.title}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-[13px] leading-6 text-[rgba(11,31,51,0.66)]">
                  {activeItem.address ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--dp-gold,#C6A269)]" />
                      <span>{activeItem.address}</span>
                    </div>
                  ) : null}
                  <div>
                    {activeItem.description || "Select a pin to read the live context, nearby relevance, and what this point adds to the map."}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeItem.metadata?.walkMinutes ? (
                    <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(11,31,51,0.62)]">
                      {activeItem.metadata.walkMinutes} min walk
                    </span>
                  ) : null}
                  {activeItem.perk?.value || activeItem.perk_value ? (
                    <span className="rounded-full bg-[rgba(207,175,90,0.16)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--dp-navy,#0B1F33)]">
                      {activeItem.perk?.value || activeItem.perk_value}
                    </span>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="rounded-[18px] border border-dashed border-[rgba(11,31,51,0.12)] bg-white p-4 text-[13px] leading-6 text-[rgba(11,31,51,0.62)]">
                Click a pin to open the mapped detail for that place.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
