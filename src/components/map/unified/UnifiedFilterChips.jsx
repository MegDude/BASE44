import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';
import MapFilterBars from '@/components/map/shared/MapFilterBars';
import {
  PRIMARY_SEARCH_PRESETS,
  SECONDARY_SEARCH_PRESETS,
  getPrimaryPresetDefinition,
  isPrimaryPresetActive,
} from '@/lib/map/searchUiConfig';

const ALL_ENTITY_TYPES = ['venue', 'event', 'perk', 'building'];

export default function UnifiedFilterChips() {
  const activeFilters = useMapStateStore((state) => state.activeFilters);
  const updateFilter = useMapStateStore((state) => state.updateFilter);
  const clearFilters = useMapStateStore((state) => state.clearFilters);

  const activePrimary =
    PRIMARY_SEARCH_PRESETS.find((preset) => isPrimaryPresetActive(preset.id, activeFilters))?.id || 'all';

  const activeSecondary = [
    activeFilters.isTrending || activeFilters.isLive ? 'crowd' : null,
    activeFilters.hasPerk ? 'perks' : null,
  ].filter(Boolean);

  const applyPrimaryPreset = (presetId) => {
    const preset = getPrimaryPresetDefinition(presetId);
    updateFilter('entityTypes', new Set(preset.entityTypes || ALL_ENTITY_TYPES));
    updateFilter('categories', new Set(preset.categories || []));
  };

  const toggleSecondaryPreset = (presetId) => {
    if (presetId === 'crowd') {
      const next = !(activeFilters.isTrending || activeFilters.isLive);
      updateFilter('isTrending', next);
      updateFilter('isLive', next);
      return;
    }

    if (presetId === 'perks') {
      updateFilter('hasPerk', !activeFilters.hasPerk);
    }
  };

  const activeCount =
    activeSecondary.length +
    (activeFilters.walkMinutes ? 1 : 0) +
    (activePrimary !== 'all' ? 1 : 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="overflow-hidden rounded-[18px] border border-[rgba(11,31,51,0.10)] shadow-[0_12px_30px_rgba(11,31,51,0.08)]">
        <MapFilterBars
          primaryOptions={PRIMARY_SEARCH_PRESETS}
          secondaryOptions={SECONDARY_SEARCH_PRESETS}
          activePrimary={activePrimary}
          activeSecondary={activeSecondary}
          onPrimarySelect={applyPrimaryPreset}
          onSecondaryToggle={toggleSecondaryPreset}
        />
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
