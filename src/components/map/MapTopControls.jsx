/**
 * MapTopControls — SINGLE ENTRY POINT for map interactions
 * Controls: search, mode, filters
 * RULE: This is the ONLY place that mutates map state
 * NO local state here — all from store
 */

import { Search, X, Settings } from 'lucide-react';
import { useMapStore } from '@/store/map-store';
import { parseIntent } from '@/lib/map/intent-parser';
import { trackingEvents } from '@/lib/analytics/track';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'restaurant', label: 'Dining' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'entertainment', label: 'Events' },
];

const INTENT_MODES = [
  { id: 'explore', label: 'Explore', description: 'All nearby' },
  { id: 'now', label: 'Now', description: 'Open right now' },
  { id: 'plan', label: 'Plan', description: 'Coming up' },
  { id: 'perks', label: 'Perks', description: 'Deals & offers' },
];

export default function MapTopControls() {
  const { query, filters, intentMode, setCategoryFilter, setQueryFilter, setIntentMode } = useMapStore();
  const [showFilters, setShowFilters] = useState(false);
  const [explanation, setExplanation] = useState('');

  const handleSearch = (e) => {
    const q = e.target.value;
    setQueryFilter(q);

    if (q.trim()) {
      const intent = parseIntent(q);
      if (intent.intentMode) {
        setIntentMode(intent.intentMode);
        trackingEvents.intentModeChange(intent.intentMode);
      }
      setExplanation(intent.explanation);
    } else {
      setExplanation('');
    }
  };

  return (
    <div className="absolute top-5 left-6 right-6 z-[500] flex flex-col gap-3 pointer-events-none">
      {/* Main search bar */}
      <div className="w-full flex justify-center pointer-events-auto">
        <div className="w-full max-w-3xl flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-lg shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
          <Search className="w-4 h-4 text-[#0B1F33]/58 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="Search or ask (e.g. 'coffee now', 'dinner tonight')..."
            className="flex-1 bg-transparent outline-none text-[13px] text-[#0B1F33] placeholder:text-[#0B1F33]/38"
          />

          {/* Category buttons (desktop) */}
          <div className="hidden md:flex items-center gap-1.5">
            {CATEGORIES.slice(1, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(filters.category === cat.id ? 'all' : cat.id);
                  trackingEvents.filterApply(cat.id);
                }}
                className={`h-10 px-3.5 rounded-xl border text-[12px] font-medium shrink-0 transition-all ${
                  filters.category === cat.id
                    ? 'bg-[#0B1F33] text-white border-[#0B1F33]'
                    : 'bg-white text-[#0B1F33]/70 border-[#0B1F33]/8 hover:border-[#B38F4F]/45'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Clear search */}
          {query && (
            <button
              onClick={() => {
                setQueryFilter('');
                setExplanation('');
              }}
              className="w-8 h-8 rounded-lg border border-[#0B1F33]/8 bg-white flex items-center justify-center hover:bg-[#F7F8FB] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#0B1F33]" />
            </button>
          )}

          {/* Filter menu toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 px-3.5 rounded-xl border border-[#0B1F33]/8 bg-white text-[12px] font-medium text-[#0B1F33]/70 hover:bg-[#F7F8FB] transition-all md:hidden"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intent mode chips + explanation */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-center pointer-events-auto"
        >
          <div className="max-w-3xl w-full bg-white/90 backdrop-blur-xl border border-black/8 rounded-xl px-3.5 py-2.5 flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground">{explanation}</span>
            <div className="flex gap-1.5 ml-auto">
              {INTENT_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setIntentMode(mode.id);
                    trackingEvents.intentModeChange(mode.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    intentMode === mode.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile filter menu */}
      <AnimatePresence mode="wait" initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-20 left-6 right-6 z-[510] bg-white/95 backdrop-blur-xl border border-black/8 rounded-lg shadow-[0_16px_40px_rgba(17,17,17,.08)] p-3 w-auto pointer-events-auto"
          >
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setShowFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                    filters.category === cat.id ? 'bg-[#0B1F33] text-white' : 'text-[#0B1F33]/70 hover:bg-[#F7F8FB]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}