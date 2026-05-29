import { motion } from 'framer-motion';

const FUNNEL_STAGES = [
  { id: 'impression', label: 'Seen on map', color: 'bg-[#0B1F33]' },
  { id: 'open', label: 'Popup opened', color: 'bg-[#081521]' },
  { id: 'unlock', label: 'Scanned QR', color: 'bg-[#0B1F33]' },
  { id: 'save', label: 'Save / RSVP', color: 'bg-[#B38F4F]' },
  { id: 'visit_intent', label: 'Asked for directions', color: 'bg-[#B38F4F]' },
  { id: 'visit', label: 'Visited in person', color: 'bg-[#B38F4F]' },
  { id: 'redemption', label: 'Used offer or booked', color: 'bg-[#0B1F33]' }
];

export default function AnalyticsFunnel({ data = {} }) {
  const maxValue = Math.max(...FUNNEL_STAGES.map(s => data[s.id] || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em] mb-1">
          What people did
        </h3>
        <p className="text-[13px] text-muted-foreground">
          A simple view of how people move from seeing you to using an offer.
        </p>
      </div>

      <div className="space-y-3">
        {FUNNEL_STAGES.map((stage, idx) => {
          const value = data[stage.id] || 0;
          const percentage = maxValue ? Math.round((value / maxValue) * 100) : 0;
          const prevValue = idx > 0 ? (data[FUNNEL_STAGES[idx - 1].id] || 0) : value;
          const conversionRate = prevValue > 0 ? Math.round((value / prevValue) * 100) : 100;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-foreground w-12 text-right">
                    {value.toLocaleString()}
                  </span>
                  {idx > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {conversionRate}% kept going
                    </span>
                  )}
                </div>
              </div>

              <div className="h-2.5 rounded-full bg-border/30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className={`h-full rounded-full ${stage.color}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="text-[12px] text-muted-foreground">
          <span className="font-medium text-foreground">Overall use rate:</span>{' '}
          {data.impression && data.redemption ? Math.round((data.redemption / data.impression) * 100) : '—'}%
        </div>
      </div>
    </div>
  );
}
