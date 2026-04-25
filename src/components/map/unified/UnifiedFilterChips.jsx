import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';
import {
  PRIMARY_SEARCH_PRESETS,
  getPrimaryPresetDefinition,
  isPrimaryPresetActive,
} from '@/lib/map/searchUiConfig';
import { APPROVED_HOME_COPY } from '@/lib/approvedCopy';

const ALL_ENTITY_TYPES = ['venue', 'event', 'perk', 'building'];
const CONTEXT_FILTERS = [
  { id: 'crowd', label: 'Crowd' },
  { id: 'perks', label: 'Perks' },
];

export default function UnifiedFilterChips() {
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const updateFilter = useMapStateStore((state) => state.updateFilter);
  const clearFilters = useMapStateStore((state) => state.clearFilters);

  const activePrimary =
    PRIMARY_SEARCH_PRESETS.find((preset) => isPrimaryPresetActive(preset.id, activeFilters))?.id || 'all';

  const showEventsOnly =
    activeFilters.entityTypes.size === 1 && activeFilters.entityTypes.has('event') && activeFilters.categories.size === 0;

  const applyPrimaryPreset = (presetId) => {
    const preset = getPrimaryPresetDefinition(presetId);
    updateFilter('entityTypes', new Set(preset.entityTypes || ALL_ENTITY_TYPES));
    updateFilter('categories', new Set(preset.categories || []));
    updateFilter('isOpenNow', false);
    updateFilter('isLive', false);
  };

  const toggleContextFilter = (presetId) => {
    if (presetId === 'crowd') {
      updateFilter('isTrending', !activeFilters.isTrending);
      return;
    }

    if (presetId === 'perks') {
      updateFilter('hasPerk', !activeFilters.hasPerk);
      return;
    }

    if (presetId === 'events') {
      if (showEventsOnly) {
        updateFilter('entityTypes', new Set(ALL_ENTITY_TYPES));
      } else {
        updateFilter('entityTypes', new Set(['event']));
        updateFilter('categories', new Set());
      }
    }
  };

  const activeCount =
    Number(activeFilters.isTrending) +
    Number(activeFilters.hasPerk) +
    Number(showEventsOnly) +
    (activePrimary !== 'all' ? 1 : 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="dp-map-panel flex gap-2 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRIMARY_SEARCH_PRESETS.filter((item) => APPROVED_HOME_COPY.explore.filterTabs.includes(item.label)).map((item) => (
          <button
            key={item.id}
            onClick={() => applyPrimaryPreset(item.id)}
            className={activePrimary === item.id ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
          >
            {item.label}
          </button>
        ))}

        {CONTEXT_FILTERS.map((item) => {
          const isActive =
            item.id === 'crowd'
              ? activeFilters.isTrending
              : item.id === 'perks'
                ? activeFilters.hasPerk
                : showEventsOnly;

          return (
            <button
              key={item.id}
              onClick={() => toggleContextFilter(item.id)}
              className={isActive ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
            >
              {item.label}
            </button>
          );
        })}

        {activeCount > 0 ? (
          <button onClick={clearFilters} className="dp-chip shrink-0 hover:border-[rgba(11,31,51,0.24)]">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
