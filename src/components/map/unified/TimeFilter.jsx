/**
 * TimeFilter — Global time control
 * Affects map pins, heatmap, events, trends
 */

import { motion } from 'framer-motion';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { Clock } from 'lucide-react';

const OPTIONS = [
  { id: 'now', label: 'Now', span: '30m' },
  { id: 'today', label: 'Today', span: '24h' },
  { id: 'week', label: 'This week', span: '7d' },
];

export default function TimeFilter() {
  const { timeFilter, setTimeFilter } = useUnifiedMapStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-border rounded-full shadow-sm px-2 py-1.5"
    >
      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />

      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTimeFilter(opt.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            timeFilter === opt.id
              ? 'bg-foreground text-background'
              : 'bg-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
}