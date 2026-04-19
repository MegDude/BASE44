import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Gift,
  Building2,
  Clock3,
  Flame,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

const TYPE_CHIPS = [
  { id: 'venue', label: 'Venues', icon: MapPin },
  { id: 'event', label: 'Events', icon: Calendar },
  { id: 'perk', label: 'Perks', icon: Gift },
  { id: 'building', label: 'Properties', icon: Building2 },
];

const QUICK_CHIPS = [
  { id: 'isOpenNow', label: 'Open now', icon: Clock3 },
  { id: 'isLive', label: 'Live now', icon: Flame },
  { id: 'isSaved', label: 'Saved', icon: Heart },
];

export default function UnifiedFilterChips() {
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const updateFilter = useMapStateStore((state) => state.updateFilter);
  const clearFilters = useMapStateStore((state) => state.clearFilters);

  const toggleEntityType = (entityType) => {
    const next = new Set(activeFilters.entityTypes);
    if (next.has(entityType)) next.delete(entityType);
    else next.add(entityType);
    updateFilter('entityTypes', next);
  };

  const activeCount =
    QUICK_CHIPS.filter((chip) => activeFilters[chip.id]).length +
    (activeFilters.walkMinutes ? 1 : 0) +
    (activeFilters.entityTypes.size > 0 && activeFilters.entityTypes.size < TYPE_CHIPS.length
      ? activeFilters.entityTypes.size
      : 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="flex flex-wrap gap-2">
        {TYPE_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeFilters.entityTypes.has(chip.id);

          return (
            <button
              key={chip.id}
              onClick={() => toggleEntityType(chip.id)}
              className={isActive ? 'dp-chip dp-chip-active' : 'dp-chip'}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </button>
          );
        })}

        {QUICK_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = Boolean(activeFilters[chip.id]);

          return (
            <button
              key={chip.id}
              onClick={() => updateFilter(chip.id, !isActive)}
              className={isActive ? 'dp-chip dp-chip-active' : 'dp-chip'}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </button>
          );
        })}

        <button
          onClick={() => updateFilter('walkMinutes', activeFilters.walkMinutes === 5 ? null : 5)}
          className={activeFilters.walkMinutes === 5 ? 'dp-chip dp-chip-active' : 'dp-chip'}
        >
          5 min walk
        </button>

        {activeCount > 0 && (
          <button onClick={clearFilters} className="dp-chip hover:border-[rgba(11,31,51,0.24)]">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </motion.div>
  );
}