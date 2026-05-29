import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const FILTER_OPTIONS = {
  timeRange: [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' }
  ],
  campaignFormat: [
    { id: 'founding', label: 'Founding Partner' },
    { id: 'launch', label: 'Launch Campaign' },
    { id: 'resident', label: 'Resident Activation' },
    { id: 'event', label: 'Event-Led Campaign' },
    { id: 'utility', label: 'Utility Campaign' }
  ],
  placementType: [
    { id: 'building_qr', label: 'Building QR' },
    { id: 'venue', label: 'Venue Placement' },
    { id: 'district', label: 'District Activation' },
    { id: 'event', label: 'Event Marker' },
    { id: 'redemption', label: 'Redemption Point' },
    { id: 'map', label: 'Map Discovery' }
  ],
  source: [
    { id: 'building_qr', label: 'Building QR' },
    { id: 'map_discovery', label: 'Map Discovery' },
    { id: 'event_marker', label: 'Event Marker' },
    { id: 'sms', label: 'SMS' },
    { id: 'resident_card', label: 'Resident Card' },
    { id: 'direct_link', label: 'Direct Link' }
  ],
  district: [
    { id: 'rainey', label: 'Rainey' },
    { id: 'seaholm', label: 'Seaholm' },
    { id: 'congress', label: 'Congress' },
    { id: 'red_river', label: 'Red River' }
  ]
};

export default function AnalyticsFiltersPanel({ activeFilters, onFilterChange, onClearAll }) {
  const [expandedFilter, setExpandedFilter] = useState(null);

  const handleToggleFilter = (filterType, filterId) => {
    const current = activeFilters[filterType] || [];
    const updated = current.includes(filterId)
      ? current.filter(f => f !== filterId)
      : [...current, filterId];
    onFilterChange(filterType, updated);
  };

  const activeFilterCount = Object.values(activeFilters).flat().length;

  return (
    <div className="rounded-lg border border-border/50 bg-card/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterType, values]) =>
            values.map(val => {
              const label = FILTER_OPTIONS[filterType]?.find(o => o.id === val)?.label || val;
              return (
                <button
                  key={`${filterType}-${val}`}
                  onClick={() => handleToggleFilter(filterType, val)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {label}
                  <X className="w-3 h-3" />
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-3">
        {Object.entries(FILTER_OPTIONS).map(([filterType, options]) => (
          <div key={filterType} className="border-t border-border/30 pt-3 first:border-t-0 first:pt-0">
            <button
              onClick={() => setExpandedFilter(expandedFilter === filterType ? null : filterType)}
              className="w-full flex items-center justify-between p-2 hover:bg-muted/30 rounded-lg transition-colors group"
            >
              <span className="text-[13px] font-medium text-foreground capitalize">
                {filterType === 'timeRange' ? 'Time Range' : filterType === 'campaignFormat' ? 'Campaign Format' : filterType === 'placementType' ? 'Placement Type' : filterType.replace('_', ' ')}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  expandedFilter === filterType ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {expandedFilter === filterType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 max-h-[260px] space-y-1.5 overflow-y-auto pl-2 pr-1"
                >
                  {options.map(option => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters[filterType]?.includes(option.id) || false}
                        onChange={() => handleToggleFilter(filterType, option.id)}
                        className="w-4 h-4 rounded border-border/40 cursor-pointer"
                      />
                      <span className="text-[13px] text-foreground">{option.label}</span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setExpandedFilter(null)}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-background px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Roll up
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
