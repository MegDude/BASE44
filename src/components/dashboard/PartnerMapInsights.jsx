const MOCK_DISTRICTS = [
  { name: 'Rainey Street', scans: 142, color: '#CFAF5A' },
  { name: 'Congress Ave', scans: 98, color: '#111F3D' },
  { name: 'Seaholm', scans: 76, color: '#3B82F6' },
  { name: '2nd Street', scans: 64, color: '#8B5CF6' },
  { name: 'Red River', scans: 51, color: '#22C55E' },
];

export default function PartnerMapInsights() {
  const max = Math.max(...MOCK_DISTRICTS.map(d => d.scans));

  return (
    <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--dp-card)', borderColor: 'var(--dp-border)' }} role="region" aria-label="Map insights by district">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--dp-navy)' }}>Foot Traffic by District</h3>
      <div className="space-y-3" role="list">
        {MOCK_DISTRICTS.map(district => (
          <div key={district.name} className="flex items-center gap-3" role="listitem">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: district.color }} aria-hidden="true" />
            <span className="text-xs font-medium w-28 flex-shrink-0 truncate" style={{ color: 'var(--dp-ink)' }}>{district.name}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--dp-bg)' }} role="progressbar" aria-valuenow={district.scans} aria-valuemin={0} aria-valuemax={max} aria-label={`${district.scans} scans`}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(district.scans / max) * 100}%`, backgroundColor: district.color }} />
            </div>
            <span className="text-xs font-semibold w-10 text-right" style={{ color: 'var(--dp-slate)' }}>{district.scans}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
