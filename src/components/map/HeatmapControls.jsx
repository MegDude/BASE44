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
            ? 'border-[#0B1F33] bg-[#0B1F33] text-white'
            : 'border-[#0B1F33]/8 bg-white text-[#0B1F33]/70 hover:border-[#B38F4F]/45'
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
          className="px-2.5 py-1.5 rounded-lg border border-[#0B1F33]/8 bg-white text-[12px] font-medium text-[#0B1F33]/70 hover:border-[#B38F4F]/45 transition-colors"
        >
          <option value="now">Last hour</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
        </select>
      )}
    </motion.div>
  );
}