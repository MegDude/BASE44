import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronUp, Clock3, Heart, MapPin, X } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';

export default function UnifiedDrawer({ selected }) {
  const drawerState = useMapStateStore((state) => state.drawerState);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);

  if (!selected || drawerState === 'closed') {
    return null;
  }

  const isExpanded = drawerState === 'expanded' || drawerState === 'fullscreen';
  const isSaved = savedEntityIds.has(selected.id);

  const openMaps = () => {
    if (!selected.location?.valid) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${selected.location.latitude},${selected.location.longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDrawerState('closed')}
          className="fixed inset-0 z-[29] bg-[rgba(11,31,51,0.18)] md:hidden"
        />
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          key={selected.id}
          initial={{ y: 320 }}
          animate={{ y: 0 }}
          exit={{ y: 320 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 md:hidden"
        >
          <div className="dp-map-panel overflow-hidden rounded-[28px]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
              <button
                onClick={() => selectEntity(null)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`overflow-y-auto px-4 pb-4 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[42vh]'}`}>
              <div className="pt-4">
                <span className="inline-flex rounded-full bg-[rgba(182,146,71,0.12)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b1f33]">
                  {selected.type}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-[#0b1f33]">{selected.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{selected.description || selected.address}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selected.address && (
                  <span className="dp-chip">
                    <MapPin className="h-3.5 w-3.5" />
                    {selected.address.split(',')[0]}
                  </span>
                )}
                {selected.metadata?.walkMinutes && (
                  <span className="dp-chip">
                    <Clock3 className="h-3.5 w-3.5" />
                    {selected.metadata.walkMinutes} min walk
                  </span>
                )}
                {selected.perk?.value && <span className="dp-chip">{selected.perk.value}</span>}
              </div>

              {isExpanded && (
                <div className="mt-4 rounded-[20px] border border-border bg-[rgba(247,247,251,0.9)] p-4 text-sm text-slate-600">
                  <p>{selected.description || 'This downtown stop is live on the shared resident map.'}</p>
                  {selected.eventTiming?.title && <p className="mt-2 font-medium text-[#0b1f33]">{selected.eventTiming.title}</p>}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleSaved(selected.id)}
                  className={isSaved ? 'dp-chip dp-chip-active justify-center py-3' : 'dp-chip justify-center py-3'}
                >
                  <Heart className="h-3.5 w-3.5" />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button onClick={openMaps} className="dp-chip justify-center py-3">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Directions
                </button>
              </div>

              <button
                onClick={() => setDrawerState(isExpanded ? 'preview' : 'expanded')}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0b1f33] px-4 py-3 text-sm font-medium text-white"
              >
                <ChevronUp className="h-4 w-4" />
                {isExpanded ? 'Collapse details' : 'View full details'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}