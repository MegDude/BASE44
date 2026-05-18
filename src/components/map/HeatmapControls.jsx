import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * HeatmapControls — Toggle and time filter for live activity heatmap
 */
export default function HeatmapControls({ visible, onVisibilityChange, timeFilter, onTimeFilterChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      {/* Heatmap toggle */}
      <button
        onClick={() => onVisibilityChange(!visible)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
          visible
            ? 'border-[#111] bg-[#111] text-white'
            : 'border-[rgba(11,31,51,0.08)] bg-white text-foreground/78 hover:border-[rgba(11,31,51,0.18)]'
        }`}
      >
        <Zap className="w-3.5 h-3.5" />
        Live heat
      </button>

      {/* Time filter (only show when heatmap is visible) */}
      {visible && (
        <select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value)}
          className="rounded-lg border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1.5 text-[12px] font-medium text-foreground/78 transition-colors hover:border-[rgba(11,31,51,0.18)]"
        >
          <option value="now">Last hour</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
        </select>
      )}
    </motion.div>
  );
}
