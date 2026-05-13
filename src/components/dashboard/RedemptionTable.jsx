const MOCK_REDEMPTIONS = [
  { id: 1, offer: 'Free Coffee with Scan', venue: "Jo's Coffee", date: 'May 13', count: 24, revenue: '$84' },
  { id: 2, offer: '15% Off Dinner', venue: 'Launderette', date: 'May 12', count: 18, revenue: '$216' },
  { id: 3, offer: 'Complimentary Yoga', venue: 'Equinox', date: 'May 11', count: 31, revenue: '$310' },
  { id: 4, offer: 'Happy Hour Special', venue: "Whisler's", date: 'May 11', count: 42, revenue: '$378' },
];

export default function RedemptionTable() {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--dp-border)' }} role="region" aria-label="Redemption history">
      <table className="w-full text-sm" aria-label="Recent redemptions">
        <thead>
          <tr style={{ backgroundColor: 'var(--dp-bg)' }}>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--dp-slate)' }}>Offer</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--dp-slate)' }}>Venue</th>
            <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--dp-slate)' }}>Date</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--dp-slate)' }}>Redemptions</th>
            <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--dp-slate)' }}>Est. Impact</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_REDEMPTIONS.map((row, i) => (
            <tr key={row.id} style={{ backgroundColor: 'var(--dp-card)', borderTop: i === 0 ? 'none' : `1px solid var(--dp-border)` }}>
              <td className="px-4 py-3.5 font-medium" style={{ color: 'var(--dp-navy)' }}>{row.offer}</td>
              <td className="px-4 py-3.5 hidden sm:table-cell" style={{ color: 'var(--dp-slate)' }}>{row.venue}</td>
              <td className="px-4 py-3.5 hidden md:table-cell" style={{ color: 'var(--dp-slate)' }}>{row.date}</td>
              <td className="px-4 py-3.5 text-right font-semibold" style={{ color: 'var(--dp-navy)' }}>{row.count}</td>
              <td className="px-4 py-3.5 text-right hidden sm:table-cell font-semibold" style={{ color: '#16a34a' }}>{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
