/**
 * UnifiedResultsPanel - Compact results list for map-first MVP
 * 
 * Design principles:
 * - Collapsed by default
 * - Compact rows: title, category, walk time, perk indicator
 * - No long descriptions
 * - No duplicate CTAs
 * - Single tap opens drawer
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';
import {
  IconClock,
  getEntityIcon,
  getEntityLabel,
  IconPerk,
} from '@/components/icons/DPIcons';

function getStatus(item) {
  if (item?.isLive || item?.eventTiming?.isLive) return { label: 'Live', tone: 'live' };
  if (item?.isOpenNow) return { label: 'Open', tone: 'open' };
  if (item?.eventTiming?.startsSoon) return { label: 'Soon', tone: 'soon' };
  return null;
}

/**
 * Compact result row - minimal info, tap to select
 */
function CompactResultRow({ item, isSelected, onSelect }) {
  const EntityIcon = getEntityIcon(item);
  const status = getStatus(item);
  const walkMinutes = item.metadata?.walkMinutes || item.distanceMinutes;
  const hasPerk = item.hasPerk || item.perk?.value || item.perk_value;

  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors ${
        isSelected
          ? 'bg-navy/5'
          : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isSelected ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          <EntityIcon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium truncate ${
              isSelected ? 'text-navy' : 'text-slate-900'
            }`}>
              {item.name}
            </span>
            {status && (
              <span className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                status.tone === 'live'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status.tone === 'open'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {status.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span className="capitalize">{getEntityLabel(item)}</span>
            {walkMinutes && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {walkMinutes} min
                </span>
              </>
            )}
            {hasPerk && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 text-gold">
                  <IconPerk className="h-3 w-3" />
                  Perk
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function UnifiedResultsPanel({
  results = [],
  selectedEntity,
  savedEntityIds = new Set(),
  onSelect,
  onClose,
  compact = false,
}) {
  const setShowResultsList = useMapStateStore((state) => state.setShowResultsList);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setShowResultsList(false);
    }
  };

  return (
    <div className="h-full bg-white/95 backdrop-blur-md shadow-xl border-l border-slate-200/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-900">Results</h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {results.length}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results list - compact rows */}
      <div className="flex-1 overflow-y-auto">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
            <p className="text-slate-500 text-sm">No results in this area</p>
            <p className="text-slate-400 text-xs mt-1">Try zooming out or adjusting filters</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {results.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
              >
                <CompactResultRow
                  item={item}
                  isSelected={selectedEntity?.id === item.id}
                  onSelect={onSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer hint */}
      {results.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[11px] text-slate-400 text-center">
            Tap a result to see details
          </p>
        </div>
      )}
    </div>
  );
}
