import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Sparkles, Clock3, X, ChevronRight } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

export default function UnifiedResultsPanel({ items = [], onSelectResult, onClose = null, title = null }) {
  const selectedEntityId = useMapStateStore((state) => state.selectedEntityId);
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {title || 'Downtown results'}
              {searchQuery ? ` for “${searchQuery}”` : ''}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Pins, perks, events, and properties in one live view.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[rgba(11,31,51,0.08)] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {items.length}
            </span>
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Close results"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-white px-6 py-12 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-foreground">No results yet</p>
            <p className="mt-1 text-xs text-slate-500">Try a different search or clear a few filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => {
                const isSaved = savedEntityIds.has(item.id);
                const isSelected = selectedEntityId === item.id;
                const metaWalk = item.metadata?.walkMinutes ? `${item.metadata.walkMinutes} min walk` : null;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    onClick={() => {
                      selectEntity(item);
                      onSelectResult?.(item);
                    }}
                    className={`w-full rounded-[22px] border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-[#0b1f33] bg-[rgba(11,31,51,0.04)] shadow-sm'
                        : 'border-border bg-white hover:border-[rgba(11,31,51,0.22)] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-full bg-[rgba(182,146,71,0.12)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b1f33]">
                          {item.type}
                        </span>
                        <h3 className="mt-2 text-base font-semibold text-[#0b1f33]">{item.name}</h3>
                      </div>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaved(item.id);
                        }}
                        className={isSaved ? 'dp-chip dp-chip-active' : 'dp-chip'}
                        aria-label="Save location"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">{item.description || item.address}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {item.address && (
                        <span className="dp-chip">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.address.split(',')[0]}
                        </span>
                      )}
                      {metaWalk && (
                        <span className="dp-chip">
                          <Clock3 className="h-3.5 w-3.5" />
                          {metaWalk}
                        </span>
                      )}
                      {item.perk?.value && <span className="dp-chip">{item.perk.value}</span>}
                    </div>

                    <div className="mt-3 flex items-center justify-end text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        View details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
