/**
 * UnifiedResultsPanel — Desktop right sidebar
 * Shows filtered results, synced with map
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import { Sparkles } from 'lucide-react';

export default function UnifiedResultsPanel({ items = [] }) {
  const { selectedId, selectEntity, query } = useUnifiedMapStore();

  return (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            Results
            {query && ` for "${query}"`}
          </h2>
          <span className="text-xs font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
            {items.length}
          </span>
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground">No results</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search or filter
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            <AnimatePresence>
              {items.map((item) => (
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
                  <h3 className="font-semibold text-foreground text-sm">
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
          </div>
        )}
      </div>
    </>
  );
}