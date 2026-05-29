import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

const SOURCES = [
  { id: 'building_qr', label: 'Building QR', icon: '📍' },
  { id: 'map_discovery', label: 'Map Discovery', icon: '🗺️' },
  { id: 'event_marker', label: 'Event Marker', icon: '📌' },
  { id: 'sms', label: 'SMS', icon: '📱' },
  { id: 'resident_card', label: 'Resident Card', icon: '🎫' },
  { id: 'direct_link', label: 'Direct Link', icon: '🔗' }
];

export default function AnalyticsAttributionTable({ data = {}, onSort, sortBy = 'actions' }) {
  const [sortDir, setSortDir] = useState('desc');

  const tableData = SOURCES.map(source => ({
    ...source,
    actions: data[source.id]?.actions || 0,
    visits: data[source.id]?.visits || 0,
    redemptions: data[source.id]?.redemptions || 0,
    visitRate: data[source.id]?.visits && data[source.id]?.actions 
      ? Math.round((data[source.id].visits / data[source.id].actions) * 100)
      : 0,
    redemptionRate: data[source.id]?.redemptions && data[source.id]?.visits
      ? Math.round((data[source.id].redemptions / data[source.id].visits) * 100)
      : 0,
    trend: data[source.id]?.trend || 'neutral'
  }));

  const sorted = [...tableData].sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      onSort?.(col);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
          Source Attribution
        </h3>
        <p className="text-[13px] text-muted-foreground">
          How each channel drives discovery, visits, and redemptions.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border/50 bg-card/40 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="border-b border-border/30 bg-muted/20">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">Source</th>
              <th className="text-right p-4 font-medium text-foreground cursor-pointer hover:bg-muted/40"
                onClick={() => handleSort('actions')}>
                <div className="flex items-center justify-end gap-2">
                  Actions
                  {sortBy === 'actions' && (sortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />)}
                </div>
              </th>
              <th className="text-right p-4 font-medium text-foreground cursor-pointer hover:bg-muted/40"
                onClick={() => handleSort('visitRate')}>
                <div className="flex items-center justify-end gap-2">
                  Visit Rate
                  {sortBy === 'visitRate' && (sortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />)}
                </div>
              </th>
              <th className="text-right p-4 font-medium text-foreground cursor-pointer hover:bg-muted/40"
                onClick={() => handleSort('redemptionRate')}>
                <div className="flex items-center justify-end gap-2">
                  Redemption Rate
                  {sortBy === 'redemptionRate' && (sortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />)}
                </div>
              </th>
              <th className="text-right p-4 font-medium text-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-border/20 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4 text-foreground font-medium">{row.icon} {row.label}</td>
                <td className="p-4 text-right text-foreground">{row.actions.toLocaleString()}</td>
                <td className="p-4 text-right text-foreground">{row.visitRate}%</td>
                <td className="p-4 text-right text-foreground">{row.redemptionRate}%</td>
                <td className="p-4 text-right">
                  <span className={`text-[12px] font-medium ${
                    row.trend === 'up' ? 'text-[#B38F4F]' : row.trend === 'down' ? 'text-[#0B1F33]/58' : 'text-muted-foreground'
                  }`}>
                    {row.trend === 'up' ? '+12%' : row.trend === 'down' ? '-8%' : 'Stable'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {sorted.map((row, idx) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{row.icon} {row.label}</span>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${
                row.trend === 'up' ? 'bg-[#0B1F33]/10 text-[#B38F4F]' : row.trend === 'down' ? 'bg-[#0B1F33]/8 text-[#0B1F33]/58' : 'bg-muted/50 text-muted-foreground'
              }`}>
                {row.trend === 'up' ? '+12%' : row.trend === 'down' ? '-8%' : 'Stable'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[12px]">
              <div className="space-y-0.5">
                <div className="text-muted-foreground">Actions</div>
                <div className="font-semibold text-foreground">{row.actions.toLocaleString()}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-muted-foreground">Visit %</div>
                <div className="font-semibold text-foreground">{row.visitRate}%</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-muted-foreground">Redemp. %</div>
                <div className="font-semibold text-foreground">{row.redemptionRate}%</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}