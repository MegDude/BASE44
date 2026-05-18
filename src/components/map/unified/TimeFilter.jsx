import { motion } from 'framer-motion';
import { Clock3 } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

const OPTIONS = [
  { id: 'all', label: 'All activity' },
  { id: 'open', label: 'Open now' },
  { id: 'live', label: 'Live now' },
];

export default function TimeFilter() {
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const updateFilter = useMapStateStore((state) => state.updateFilter);

  const currentFilter = activeFilters.isLive ? 'live' : activeFilters.isOpenNow ? 'open' : 'all';

  const applyFilter = (next) => {
    if (next === 'all') {
      updateFilter('isOpenNow', false);
      updateFilter('isLive', false);
      return;
    }

    if (next === 'open') {
      updateFilter('isOpenNow', true);
      updateFilter('isLive', false);
      return;
    }

    updateFilter('isOpenNow', false);
    updateFilter('isLive', true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="dp-map-panel flex w-full items-center gap-2 overflow-x-auto px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <span className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(11,31,51,0.06)] text-[#0b1f33]">
        <Clock3 className="h-3.5 w-3.5" />
      </span>

      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => applyFilter(opt.id)}
          className={currentFilter === opt.id ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
}
