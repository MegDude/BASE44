import { MARKER_COLORS } from './MapMarker';

const LEGEND_ITEMS = [
  { type: 'venue', label: 'Places' },
  { type: 'event', label: 'Events' },
  { type: 'perk', label: 'Perks' },
  { type: 'property', label: 'Homes' },
  { type: 'hotel', label: 'Hotels' },
];

export default function MapLegend({ className = '' }) {
  return (
    <div
      className={`flex flex-wrap gap-x-4 gap-y-2 ${className}`}
      role="list"
      aria-label="Map legend"
    >
      {LEGEND_ITEMS.map(item => (
        <div key={item.type} className="flex items-center gap-1.5" role="listitem">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: MARKER_COLORS[item.type] }}
            aria-hidden="true"
          />
          <span className="text-[11px] font-medium" style={{ color: 'var(--dp-slate)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
