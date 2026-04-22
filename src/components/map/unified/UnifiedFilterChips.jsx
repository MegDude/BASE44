import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Gift,
  Building2,
  Heart,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

const ALL_ENTITY_TYPES = ['venue', 'event', 'perk', 'building'];

const TYPE_CHIPS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'venue', label: 'Venues', icon: MapPin },
  { id: 'event', label: 'Events', icon: Calendar },
  { id: 'perk', label: 'Perks', icon: Gift },
  { id: 'building', label: 'Properties', icon: Building2 },
];

const QUICK_CHIPS = [
  { id: 'isSaved', label: 'Saved', icon: Heart },
  { id: 'isTrending', label: 'Trending', icon: TrendingUp },
];

export default function UnifiedFilterChips() {
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const updateFilter = useMapStateStore((state) => state.updateFilter);
  const clearFilters = useMapStateStore((state) => state.clearFilters);

  const toggleEntityType = (entityType) => {
    if (entityType === 'all') {
      updateFilter('entityTypes', new Set(ALL_ENTITY_TYPES));
      return;
    }

    const next = new Set(activeFilters.entityTypes);
    if (next.has(entityType)) {
      next.delete(entityType);
    } else {
      next.add(entityType);
    }

    if (next.size === 0) {
      ALL_ENTITY_TYPES.forEach((type) => next.add(type));
    }

    updateFilter('entityTypes', next);
  };

  const isAllTypesActive =
    activeFilters.entityTypes.size === ALL_ENTITY_TYPES.length &&
    ALL_ENTITY_TYPES.every((type) => activeFilters.entityTypes.has(type));

  const activeCount =
    QUICK_CHIPS.filter((chip) => activeFilters[chip.id]).length +
    (activeFilters.walkMinutes ? 1 : 0) +
    (!isAllTypesActive && activeFilters.entityTypes.size > 0
      ? activeFilters.entityTypes.size
      : 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPE_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = chip.id === 'all' ? isAllTypesActive : activeFilters.entityTypes.has(chip.id);

          return (
            <button
              key={chip.id}
              onClick={() => toggleEntityType(chip.id)}
              className={isActive ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {QUICK_CHIPS.map((chip) => {
          const Icon = chip.icon;
          const isActive = Boolean(activeFilters[chip.id]);

          return (
            <button
              key={chip.id}
              onClick={() => updateFilter(chip.id, !isActive)}
              className={isActive ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </button>
          );
        })}

        <button
          onClick={() => updateFilter('walkMinutes', activeFilters.walkMinutes === 5 ? null : 5)}
          className={activeFilters.walkMinutes === 5 ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
        >
          5 min walk
        </button>

        {activeCount > 0 && (
          <button onClick={clearFilters} className="dp-chip shrink-0 hover:border-[rgba(11,31,51,0.24)]">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </motion.div>
  );
}
