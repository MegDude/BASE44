import { useMemo, useRef, useState } from 'react';
import { Search, X, Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStateStore } from '@/store/mapStateStore';

const QUICK_PROMPTS = [
  'coffee near Rainey',
  'live music tonight',
  'resident perks',
  'open now',
];

export default function UnifiedSearchBar() {
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const setSearchQuery = useMapStateStore((state) => state.setSearchQuery);
  const clearFilters = useMapStateStore((state) => state.clearFilters);
  const resultCount = useMapStateStore((state) => state.filteredResults.length);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const hasQuery = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <div className="dp-map-panel flex items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(11,31,51,0.06)] text-[#0b1f33]">
            <Search className="h-4 w-4" />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => window.setTimeout(() => setIsExpanded(false), 120)}
            placeholder="Search venues, events, perks, or a corridor"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground md:text-base"
          />

          <span className="hidden rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(247,247,251,0.95)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:inline-flex">
            {resultCount} live
          </span>

          {hasQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="hidden text-[#b69247] md:inline-flex">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && !hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 flex flex-wrap gap-2"
            >
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onMouseDown={() => setSearchQuery(prompt)}
                  className="dp-chip hover:border-[rgba(11,31,51,0.24)]"
                >
                  {prompt}
                </button>
              ))}

              <button
                onMouseDown={() => {
                  clearFilters();
                  setSearchQuery('');
                }}
                className="dp-chip hover:border-[rgba(11,31,51,0.24)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset map
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}