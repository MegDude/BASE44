import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Sparkles, Clock3 } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

export default function UnifiedResultsPanel({ items = [] }) {
  const selectedEntityId = useMapStateStore((state) => state.selectedEntityId);
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);

  return (
    <div className="flex h-full flex-col bg-[#f7f1e4]/72">
      <div className="px-5 pb-3 pt-5">
        <div className="dp-glass-control rounded-[24px] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="dp-micro-label">Live results</p>
              <h2 className="mt-1 text-lg font-black tracking-[-0.04em] text-[#071c2f]">
                Downtown nearby
                {searchQuery ? ` for ${searchQuery}` : ''}
              </h2>
              <p className="mt-1 text-xs font-medium text-[#071c2f]/56">Places, perks, events, and buildings in one map layer.</p>
            </div>
            <span className="rounded-full border border-[#071c2f]/10 bg-white/72 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#071c2f]/62">
              {items.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {items.length === 0 ? (
          <div className="dp-glass-subtle flex h-full flex-col items-center justify-center rounded-[24px] px-6 py-12 text-center">
            <Sparkles className="mb-3 h-8 w-8 text-[#c69532]/55" />
            <p className="text-sm font-bold text-[#071c2f]">No results yet</p>
            <p className="mt-1 text-xs text-[#071c2f]/52">Try a different search or clear a few filters.</p>
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
                    transition={{ duration: 0.16 }}
                    onClick={() => selectEntity(item)}
                    className={`w-full rounded-[20px] border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-[#071c2f]/24 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.70),0_12px_28px_rgba(7,28,47,0.10)]'
                        : 'border-[#071c2f]/8 bg-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.54),0_3px_12px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-[#c69532]/34 hover:bg-white/82'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-full bg-[#c69532]/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#071c2f]/76">
                          {item.type}
                        </span>
                        <h3 className="mt-2 truncate text-base font-black tracking-[-0.035em] text-[#071c2f]">{item.name}</h3>
                      </div>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSaved(item.id);
                        }}
                        className={isSaved ? 'dp-chip dp-chip-active !p-2.5' : 'dp-chip !p-2.5'}
                        aria-label="Save location"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#071c2f]/62">{item.description || item.address}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#071c2f]/56">
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
