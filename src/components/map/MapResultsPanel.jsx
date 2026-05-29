import { useState } from 'react';
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
  const [isHidden, setIsHidden] = useState(false);
  const previewCount = 2;
  const isCollapsed = !isPanelExpanded;
  const displayedResults = isCollapsed ? results.slice(0, previewCount) : results;
  const hiddenCount = Math.max(0, results.length - previewCount);

  return (
    <div className={`w-full md:w-[420px] md:shrink-0 bg-white md:border-r border-t md:border-t-0 border-[#0B1F33]/8 flex flex-col z-10 md:shadow-[2px_0_12px_rgba(0,0,0,.04)] transition-all ${
      isPanelExpanded
        ? 'h-auto md:h-full'
        : 'h-auto md:h-full'
    }`}>
      {/* Header */}
      <div className="px-4 md:px-5 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-[#0B1F33]/8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg md:text-[22px] font-semibold text-[#0B1F33] tracking-normal leading-tight">
            {/* Dynamic title based on context */}
            {filters.category !== 'all'
              ? filters.category.charAt(0).toUpperCase() + filters.category.slice(1)
              : 'Results'}
          </h1>
          <div className="flex items-center gap-2">
            {/* Result count badge */}
            <span className="text-[12px] md:text-[13px] font-medium text-[#0B1F33]/50 border border-[#0B1F33]/8 rounded-xl px-2.5 md:px-3 py-1 md:py-1.5 bg-[#F7F8FB]">
              {results.length}
            </span>

            {/* Menu toggle button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg border border-[#0B1F33]/8 bg-white flex items-center justify-center hover:bg-[#F7F8FB] transition-colors md:hidden"
              title="Menu"
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4 text-[#0B1F33]" />
            </button>

            {/* Roll up / expand toggle (mobile & desktop) */}
            <button
              onClick={() => setIsHidden((value) => !value)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#0B1F33]/8 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/68 transition-colors hover:bg-[#F7F8FB] hover:text-[#0B1F33]"
              title={isHidden ? 'Show results' : 'Hide results'}
              aria-label={isHidden ? 'Show results list' : 'Hide results list'}
              aria-expanded={!isHidden}
            >
              {isHidden ? <ChevronUp className="w-4 h-4 text-[#0B1F33]" /> : <ChevronDown className="w-4 h-4 text-[#0B1F33]" />}
              {isHidden ? 'Show' : 'Hide'}
            </button>
            <button
              onClick={() => setPanelExpanded(!isPanelExpanded)}
              disabled={isHidden}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#0B1F33]/8 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/68 transition-colors hover:bg-[#F7F8FB] hover:text-[#0B1F33]"
              title={isPanelExpanded ? 'Collapse results' : 'Expand results'}
              aria-label={isPanelExpanded ? 'Collapse results panel' : 'Expand results panel'}
            >
              {isPanelExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 text-[#0B1F33]" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4 text-[#0B1F33]" />
                  Expand
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu (expanded on demand) */}
        <AnimatePresence mode="wait" initial={false}>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mb-3 pb-3 border-t border-[#0B1F33]/8 pt-3 space-y-2"
            >
              <button
                onClick={() => {
                  setPanelExpanded(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#0B1F33] bg-[#F7F8FB] hover:bg-[#FFFFFF] transition-colors"
              >
                <List className="w-4 h-4" />
                Expand Full List
              </button>
              <button
                onClick={() => {
                  setPanelExpanded(false);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#0B1F33] bg-[#F7F8FB] hover:bg-[#FFFFFF] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Collapse Preview
              </button>
              <button
                onClick={() => {
                  clearSelection();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-[#0B1F33]/50 bg-[#F7F8FB] hover:bg-[#FFFFFF] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Selection
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visible collapsed summary */}
        {!isHidden && isCollapsed && hiddenCount > 0 && (
          <button
            onClick={() => setPanelExpanded(true)}
            className="w-full rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-left text-[12px] font-medium text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
            aria-label="Expand results"
          >
            Showing {previewCount} of {results.length}. Expand list to view {hiddenCount} more.
          </button>
        )}
      </div>

      {/* Results list (scrollable) */}
      {!isHidden && (isPanelExpanded || results.length > 0) && (
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2.5 md:py-4 space-y-3 md:space-y-4 max-h-[40vh] md:max-h-none">
          {results.length === 0 ? (
            renderEmptyState ? (
              renderEmptyState()
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[15px] font-semibold text-[#0B1F33]/70">No results found</p>
                <p className="text-[13px] text-[#0B1F33]/50 mt-1">Try adjusting your filters.</p>
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

              {/* Expand list */}
              {hiddenCount > 0 && (
                <button
                  onClick={() => setPanelExpanded(true)}
                  className="w-full rounded-md border border-[#0B1F33]/8 bg-[#F7F8FB] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
                  aria-label={`View ${hiddenCount} more results`}
                >
                  Expand list ({hiddenCount} more)
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

              {/* Collapse list */}
              {results.length > previewCount && (
                <button
                  onClick={() => setPanelExpanded(false)}
                  className="sticky bottom-0 w-full rounded-md border border-[#0B1F33]/8 bg-white/92 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/62 shadow-[0_-10px_24px_rgba(11,31,51,0.05)] backdrop-blur-xl transition hover:border-[#B38F4F]/45 hover:text-[#0B1F33]"
                  aria-label="Show preview only"
                >
                  Roll up results
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
