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
      transition={{ duration: 0.22 }}
    >
      <div className="relative">
        <motion.div
          animate={{ scale: isExpanded ? 1.012 : 1 }}
          transition={{ duration: 0.16 }}
          className="dp-map-panel-strong flex min-h-[64px] items-center gap-3 rounded-full px-3 py-2 md:px-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#071c2f] text-[#fff8e9] shadow-[0_10px_20px_rgba(7,28,47,0.16)]">
            <Search className="h-4 w-4" />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => window.setTimeout(() => setIsExpanded(false), 140)}
            placeholder="Ask the map: coffee, events, perks, walkable tonight"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#071c2f] outline-none placeholder:text-[#071c2f]/52 md:text-base"
          />

          <span className="hidden rounded-full border border-[#071c2f]/10 bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#071c2f]/62 md:inline-flex">
            {resultCount} live
          </span>

          {hasQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-2 text-[#071c2f]/58 hover:bg-[#071c2f]/7 hover:text-[#071c2f]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="hidden rounded-full bg-[#c69532]/12 p-2 text-[#a8751f] md:inline-flex">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
        </motion.div>

        <AnimatePresence>
          {isExpanded && !hasQuery && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="dp-glass-control absolute left-0 right-0 top-[calc(100%+8px)] z-30 flex flex-wrap gap-2 rounded-[22px] p-3"
            >
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onMouseDown={() => setSearchQuery(prompt)}
                  className="dp-chip"
                >
                  {prompt}
                </button>
              ))}

              <button
                onMouseDown={() => {
                  clearFilters();
                  setSearchQuery('');
                }}
                className="dp-chip"
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
