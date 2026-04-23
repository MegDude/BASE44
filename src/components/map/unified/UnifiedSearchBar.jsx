import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStateStore } from '@/store/mapStateStore';
import { ASK_MAP_QUESTIONS } from '@/lib/map/searchUiConfig';
import { IconAsk, IconClose, IconSearch } from '@/components/icons/DPIcons';

const QUICK_PROMPTS = [
  'coffee nearby',
  'dinner tonight',
  'live music tonight',
  'resident perks',
];

export default function UnifiedSearchBar({
  mode = 'search',
  onAsk,
  askLoading = false,
  onModeChange,
} = {}) {
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const setSearchQuery = useMapStateStore((state) => state.setSearchQuery);
  const clearFilters = useMapStateStore((state) => state.clearFilters);
  const resultCount = useMapStateStore((state) => state.filteredResults.length);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAskPanel, setShowAskPanel] = useState(mode === 'ask');
  const inputRef = useRef(null);

  const hasQuery = useMemo(() => searchQuery.trim().length > 0, [searchQuery]);

  useEffect(() => {
    setShowAskPanel(mode === 'ask');
  }, [mode]);

  const handleAskToggle = () => {
    const nextMode = mode === 'ask' ? 'search' : 'ask';
    onModeChange?.(nextMode);

    if (nextMode === 'ask') {
      setShowAskPanel(true);
      window.requestAnimationFrame(() => inputRef.current?.focus());
      if (searchQuery.trim()) {
        onAsk?.(searchQuery.trim());
      }
      return;
    }

    setShowAskPanel(false);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <div className="dp-map-panel flex items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(11,31,51,0.06)] text-[#0b1f33]">
            {mode === 'ask' ? <IconAsk className="h-4 w-4" /> : <IconSearch className="h-4 w-4" />}
          </span>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              setIsExpanded(true);
              if (mode === 'ask') {
                setShowAskPanel(true);
              }
            }}
            onBlur={() => window.setTimeout(() => setIsExpanded(false), 120)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              if (mode === 'ask') {
                event.preventDefault();
                const q = searchQuery.trim();
                if (q) onAsk?.(q);
                return;
              }
              event.preventDefault();
            }}
            placeholder={mode === 'ask' ? 'Ask the map where to go, what to do, or who to meet' : 'Search venues, events, perks, or a corridor'}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground md:text-base"
          />

          <span className="hidden rounded-full border border-[rgba(11,31,51,0.08)] bg-[rgba(247,247,251,0.95)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:inline-flex">
            {resultCount} live
          </span>

          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              handleAskToggle();
            }}
            className={mode === 'ask' ? 'dp-chip dp-chip-active shrink-0' : 'dp-chip shrink-0'}
            aria-label={mode === 'ask' ? 'Switch to search mode' : 'Switch to ask mode'}
          >
            <IconAsk className="h-3.5 w-3.5" />
            {mode === 'ask' ? 'Search' : 'Ask'}
          </button>

          {hasQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Clear search"
            >
              <IconClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <AnimatePresence>
          {showAskPanel && mode === 'ask' && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mt-2 overflow-hidden rounded-[18px] border border-[rgba(11,31,51,0.10)] bg-white shadow-[0_12px_30px_rgba(11,31,51,0.08)]"
            >
              <div className="divide-y divide-[rgba(11,31,51,0.10)]">
                {ASK_MAP_QUESTIONS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    disabled={askLoading}
                    onMouseDown={() => {
                      setSearchQuery(item.query);
                      onAsk?.(item.query);
                    }}
                    className="group w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60 disabled:opacity-60"
                  >
                    <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80 transition-colors group-hover:text-primary">
                      {item.title}
                    </div>
                    <div className="text-[12px] leading-relaxed text-foreground/60">{item.subtitle}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={() => setShowAskPanel(false)}
                  className="w-full px-4 py-2.5 text-[11px] text-foreground/40 transition-colors hover:text-foreground/60"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  onMouseDown={() => {
                    setSearchQuery(prompt);
                    if (mode === 'ask') {
                      onAsk?.(prompt);
                    }
                  }}
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
