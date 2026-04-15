import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, Menu, Filter, List } from 'lucide-react';
import { useMapStore } from '@/store/map-store';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Unified results panel for all map instances
 * Handles collapsed (rolled-up) and expanded states
 * Syncs selection with map markers via store
 * Complete interactive menu system with show/hide controls
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
    filters,
  } = useMapStore();

  const [showMenu, setShowMenu] = useState(false);
  const previewCount = 2;
  const isCollapsed = !isPanelExpanded;
  const displayedResults = isCollapsed ? results.slice(0, previewCount) : results;
  const hiddenCount = Math.max(0, results.length - previewCount);

  return (
    <div className={`w-full md:w-[420px] md:shrink-0 bg-white md:border-r border-t md:border-t-0 border-[#e8e5df] flex flex-col z-10 md:shadow-[2px_0_12px_rgba(0,0,0,.04)] transition-all ${
      isPanelExpanded
        ? 'h-auto md:h-full'
        : 'h-auto md:h-full'
    }`}>
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#e8e5df]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg md:text-[22px] font-semibold text-[#111] tracking-tight leading-tight">
            {/* Dynamic title based on context */}
            {filters.category !== 'all'
              ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
              : 'Results'}
          </h1>
          <div className="flex items-center gap-2">
            {/* Result count badge */}
            <span className="text-[12px] md:text-[13px] font-medium text-[#8d887f] border border-[#e8e5df] rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 bg-[#f5f3ef]">
              {results.length}
            </span>

            {/* Menu toggle button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg border border-[#e8e5df] bg-white flex items-center justify-center hover:bg-[#f5f4f2] transition-colors md:hidden"
              title="Menu"
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4 text-[#111]" />
            </button>

            {/* Show/Hide toggle (mobile & desktop) */}
            <button
              onClick={() => setPanelExpanded(!isPanelExpanded)}
              className="w-8 h-8 rounded-lg border border-[#e8e5df] bg-white flex items-center justify-center hover:bg-[#f5f4f2] transition-colors"
              title={isPanelExpanded ? 'Hide results' : 'Show results'}
              aria-label={isPanelExpanded ? 'Hide results panel' : 'Show results panel'}
            >
              {isPanelExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#111]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#111]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu (expanded on demand) */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mb-3 pb-3 border-t border-[#e8e5df] pt-3 space-y-2"
            >
              <button
                onClick={() => {
                  setPanelExpanded(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#111] bg-[#f5f3ef] hover:bg-[#efe8df] transition-colors"
              >
                <List className="w-4 h-4" />
                Expand Full List
              </button>
              <button
                onClick={() => {
                  setPanelExpanded(false);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#111] bg-[#f5f3ef] hover:bg-[#efe8df] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Collapse Preview
              </button>
              <button
                onClick={() => {
                  clearSelection();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#8d887f] bg-[#f5f3ef] hover:bg-[#efe8df] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden mobile expand zone (no label) */}
        {isCollapsed && hiddenCount > 0 && (
          <button
            onClick={() => setPanelExpanded(true)}
            className="w-full h-2 -mx-4 -mb-3 cursor-pointer"
            aria-label="Expand results"
          />
        )}
      </div>

      {/* Results list (scrollable) — Hidden when panel is collapsed on desktop */}
      {isPanelExpanded && (
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

              {/* Tap zone to expand (no visible button) */}
              {hiddenCount > 0 && (
                <button
                  onClick={() => setPanelExpanded(true)}
                  className="w-full h-3 -mx-3 cursor-pointer"
                  aria-label={`View ${hiddenCount} more results`}
                />
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

              {/* Tap zone to collapse (no visible button) */}
              {results.length > previewCount && (
                <button
                  onClick={() => setPanelExpanded(false)}
                  className="w-full h-3 -mx-3 cursor-pointer sticky bottom-0"
                  aria-label="Show preview only"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}