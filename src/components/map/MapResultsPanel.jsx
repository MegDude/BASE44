import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useMapStore } from '@/store/map-store';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified results panel for all map instances
 * Handles collapsed (rolled-up) and expanded states
 * Syncs selection with map markers via store
 */
export default function MapResultsPanel({ 
  results = [], 
  renderCard,
  renderEmptyState,
}) {
  const {
    selectedEntityId,
    isPanelExpanded,
    setPanelExpanded,
    selectEntity,
    clearSelection,
    activeFilters,
  } = useMapStore();

  const previewCount = 2;
  const isCollapsed = !isPanelExpanded;
  const displayedResults = isCollapsed ? results.slice(0, previewCount) : results;
  const hiddenCount = Math.max(0, results.length - previewCount);

  return (
    <div className="w-full md:w-[420px] md:shrink-0 bg-white md:border-r border-t md:border-t-0 border-[#e8e5df] flex flex-col h-auto md:h-full z-10 md:shadow-[2px_0_12px_rgba(0,0,0,.04)] transition-all">
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#e8e5df]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg md:text-[22px] font-semibold text-[#111] tracking-tight leading-tight">
            {/* Dynamic title based on context */}
            {activeFilters.smartFilters.walking || activeFilters.smartFilters.freePerks || activeFilters.smartFilters.eventBased
              ? 'Filtered'
              : activeFilters.category !== 'all'
              ? activeFilters.category.charAt(0).toUpperCase() + activeFilters.category.slice(1)
              : 'Results'}
          </h1>
          <div className="flex items-center gap-2">
            {/* Result count badge */}
            <span className="text-[12px] md:text-[13px] font-medium text-[#8d887f] border border-[#e8e5df] rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 bg-[#f5f3ef]">
              {results.length}
            </span>

            {/* Collapse/Expand toggle (desktop only) */}
            <button
              onClick={() => setPanelExpanded(!isPanelExpanded)}
              className="hidden md:flex w-8 h-8 rounded-lg border border-[#e8e5df] bg-white items-center justify-center hover:bg-[#f5f4f2] transition-colors"
              title={isPanelExpanded ? 'Collapse' : 'Expand'}
            >
              <span className="text-[#111] font-bold">{isPanelExpanded ? '←' : '→'}</span>
            </button>
          </div>
        </div>

        {/* Collapsed header info (mobile only) */}
        {isCollapsed && (
          <button
            onClick={() => setPanelExpanded(true)}
            className="w-full md:hidden flex items-center justify-between h-10 px-3 rounded-lg bg-[#f5f4f2] border border-[#e8e5df] text-[12px] font-medium text-[#3d3934] hover:bg-[#ede8e0] transition-colors"
          >
            <span>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results list (scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4 max-h-[40vh] md:max-h-none">
        {results.length === 0 ? (
          renderEmptyState ? (
            renderEmptyState()
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[15px] font-semibold text-[#3d3934]">No results found</p>
              <p className="text-[13px] text-[#8d887f] mt-1">Try adjusting your filters.</p>
            </div>
          )
        ) : isCollapsed ? (
          <>
            {/* Collapsed preview: show top N cards */}
            <AnimatePresence mode="wait">
              {displayedResults.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCard(
                    item,
                    selectedEntityId === item.id,
                    () => selectEntity(item.id, item._type || 'venue')
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show expand button if more results */}
            {hiddenCount > 0 && (
              <button
                onClick={() => setPanelExpanded(true)}
                className="w-full h-12 rounded-2xl border border-[#e8e5df] bg-[#f5f4f2] text-[#3d3934] font-semibold text-[14px] hover:bg-[#ede8e0] transition-colors flex items-center justify-center gap-2"
              >
                <ChevronUp className="w-4 h-4" />
                Show all {results.length} results
              </button>
            )}
          </>
        ) : (
          <>
            {/* Expanded: show all results */}
            <AnimatePresence mode="wait">
              {displayedResults.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCard(
                    item,
                    selectedEntityId === item.id,
                    () => selectEntity(item.id, item._type || 'venue')
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Collapse button when expanded */}
            {results.length > previewCount && (
              <button
                onClick={() => setPanelExpanded(false)}
                className="w-full h-12 rounded-2xl border border-[#e8e5df] bg-[#f5f4f2] text-[#3d3934] font-semibold text-[14px] hover:bg-[#ede8e0] transition-colors flex items-center justify-center gap-2 sticky bottom-0"
              >
                <ChevronDown className="w-4 h-4" />
                Collapse
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}