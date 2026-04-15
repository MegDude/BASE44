/**
 * MapTopControls — SINGLE ENTRY POINT for map interactions
 * Controls: search, mode, filters
 * RULE: This is the ONLY place that mutates map state
 * NO local state here — all from store
 */

import { Search, X, Settings } from 'lucide-react';
import { useMapStore } from '@/store/map-store';
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

const ENTITY_TYPES = [
  { id: 'venue', label: 'Venues' },
  { id: 'event', label: 'Events' },
  { id: 'building', label: 'Buildings' },
];

export default function MapTopControls() {
  const { activeFilters, setCategoryFilter, setQueryFilter } = useMapStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="absolute top-5 left-6 right-6 z-[500] flex justify-center pointer-events-none">
      <div className="w-full max-w-3xl pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] px-3.5 py-2.5">
        {/* Search input */}
        <Search className="w-4 h-4 text-[#7a746b] shrink-0" />
        <input
          type="search"
          value={activeFilters.query}
          onChange={(e) => setQueryFilter(e.target.value)}
          placeholder="Search venues, events, perks..."
          className="flex-1 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9d9890]"
        />

        {/* Category buttons (desktop) */}
        <div className="hidden md:flex items-center gap-1.5">
          {CATEGORIES.slice(1, 4).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(activeFilters.category === cat.id ? 'all' : cat.id)}
              className={`h-10 px-3.5 rounded-xl border text-[12px] font-medium shrink-0 transition-all ${
                activeFilters.category === cat.id
                  ? 'bg-[#111] text-white border-[#111]'
                  : 'bg-white text-[#3d3934] border-[#e8e5df] hover:border-[#bbb]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter menu toggle (mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="h-10 px-3.5 rounded-xl border border-[#e8e5df] bg-white text-[12px] font-medium text-[#3d3934] hover:bg-[#f5f4f2] transition-all md:hidden"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Clear search */}
        {activeFilters.query && (
          <button
            onClick={() => setQueryFilter('')}
            className="w-8 h-8 rounded-lg border border-[#e8e5df] bg-white flex items-center justify-center hover:bg-[#f5f4f2] transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#111]" />
          </button>
        )}
      </div>

      {/* Mobile filter menu */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-16 left-6 right-6 z-[510] bg-white/95 backdrop-blur-xl border border-black/8 rounded-2xl shadow-[0_16px_40px_rgba(17,17,17,.08)] p-3"
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
                    activeFilters.category === cat.id ? 'bg-[#111] text-white' : 'text-[#3d3934] hover:bg-[#f5f4f2]'
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