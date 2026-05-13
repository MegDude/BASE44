export const MARKER_COLORS = {
  venue: '#111F3D',
  event: '#CFAF5A',
  perk: '#22C55E',
  property: '#3B82F6',
  hotel: '#8B5CF6',
  default: '#6E768A',
};

export default function MapMarker({ type = 'venue', active = false, label }) {
  const color = MARKER_COLORS[type] ?? MARKER_COLORS.default;
  const size = active ? 44 : 36;

  return (
    <div
      role="img"
      aria-label={label ?? `${type} marker`}
      style={{
        width: size,
        height: size,
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        backgroundColor: color,
        border: active ? '3px solid white' : '2px solid white',
        boxShadow: active ? '0 4px 20px rgba(17,31,61,0.4)' : '0 2px 8px rgba(17,31,61,0.2)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ transform: 'rotate(45deg)', color: 'white' }}>
        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
    </div>
  );
}
