/**
 * UnifiedFilterChips — Responsive filter system
 * Mobile: horizontal scroll | Desktop: inline wrap
 * Multi-select, real-time updates
 */

import { motion } from 'framer-motion';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { FILTER_CHIPS } from '@/lib/mapSystemConstants';
import {
  MapPin,
  Calendar,
  Gift,
  Building2,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useRef } from 'react';

const ICON_MAP = {
  MapPin,
  Calendar,
  Gift,
  Building2,
  Clock,
  Sparkles,
  TrendingUp,
  Star,
};

export default function UnifiedFilterChips() {
  const { activeFilters, toggleFilter, getActiveFilterCount } =
    useUnifiedMapStore();
  const scrollContainerRef = useRef(null);

  const activeCount = getActiveFilterCount();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 md:px-5"
    >
      {/* Horizontal scroll wrapper (mobile) / flex (desktop) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 md:flex-wrap"
      >
        {FILTER_CHIPS.map((chip) => {
          const IconComponent = ICON_MAP[chip.icon];
          const isActive = activeFilters[chip.id];

          return (
            <motion.button
              key={chip.id}
              onClick={() => toggleFilter(chip.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`snap-start shrink-0 md:shrink inline-flex items-center gap-1.5 h-10 px-3 md:px-4 border text-xs md:text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B38F4F] ${
                isActive
                  ? 'dp-glass-deep border-white/18 text-white'
                  : 'bg-white/42 border-white/44 text-[#0B1F33]/72 backdrop-blur-[18px] hover:bg-white/58 hover:text-[#0B1F33]'
              }`}
            >
              {IconComponent && (
                <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4" />
              )}
              <span className="whitespace-nowrap">{chip.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active indicator */}
      {activeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#0B1F33]/58 mt-2"
        >
          {activeCount} filter{activeCount !== 1 ? 's' : ''} active
        </motion.div>
      )}
    </motion.div>
  );
}
