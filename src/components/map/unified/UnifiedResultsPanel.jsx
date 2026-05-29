/**
 * UnifiedResultsPanel — Desktop right sidebar
 * Shows filtered results, synced with map
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function UnifiedResultsPanel({ items = [] }) {
  const { selectedId, selectEntity, query } = useUnifiedMapStore();
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const previewCount = 5;
  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, previewCount)),
    [expanded, items]
  );
  const hiddenCount = Math.max(0, items.length - previewCount);

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">
            Results
            {query && ` for "${query}"`}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              {items.length}
            </span>
            <button
              type="button"
              onClick={() => setHidden((value) => !value)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#0B1F33]/8 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
              aria-expanded={!hidden}
              aria-label={hidden ? "Show results" : "Hide results"}
            >
              {hidden ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {hidden ? "Show" : "Hide"}
            </button>
          </div>
        </div>
        {!hidden && items.length > previewCount && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#0B1F33]/8 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            {expanded ? "Roll up" : `Expand ${hiddenCount} more`}
          </button>
        )}
      </div>

      {/* Results list */}
      {!hidden && (
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-[13px] font-medium text-foreground">No results</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search or filter
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            <AnimatePresence mode="wait" initial={false}>
              {visibleItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => selectEntity(item.id, item._type)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedId === item.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-white border-border hover:border-foreground/30'
                  }`}
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground mb-0.5 capitalize">
                    {item._type}
                  </div>
                  <h3 className="font-semibold text-foreground text-[13px]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.address?.split(',')[0] || item.category}
                  </p>
                  {item.perk_value && (
                    <p className="text-xs font-medium text-primary mt-2">
                      {item.perk_value}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {items.length > previewCount && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="w-full rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
                aria-expanded={expanded}
              >
                {expanded ? "Roll up results" : `Expand list (${hiddenCount} more)`}
              </button>
            )}
          </div>
        )}
      </div>
      )}
    </>
  );
}
