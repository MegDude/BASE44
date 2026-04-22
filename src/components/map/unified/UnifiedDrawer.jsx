import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';
import { useResidentMutations } from '@/hooks/useResidentMutations';
import {
  IconCalendarCheck,
  IconChevronUp,
  IconClock,
  IconClose,
  getEntityIcon,
  getEntityLabel,
  IconNavigation,
  IconPerk,
  IconSave,
} from '@/components/icons/DPIcons';

export default function UnifiedDrawer({ selected }) {
  const drawerState = useMapStateStore((state) => state.drawerState);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const mutations = useResidentMutations();

  if (!selected || drawerState === 'closed') {
    return null;
  }

  const isExpanded = drawerState === 'expanded' || drawerState === 'fullscreen';
  const isSaved = savedEntityIds.has(selected.id);
  const EntityIcon = getEntityIcon(selected);
  const entityLabel = getEntityLabel(selected);

  const openMaps = async () => {
    if (!selected.location?.valid) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${selected.location.latitude},${selected.location.longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
    await mutations.logInteraction(selected, 'directions', undefined, { surface: 'unified_drawer' });
  };

  const handleSave = async () => {
    toggleSaved(selected.id);
    await mutations.toggleSavedItem(selected);
  };

  const handlePrimaryAction = async () => {
    if (selected.type === 'event') {
      await mutations.upsertRsvp(selected);
      return;
    }

    if (selected.type === 'perk' || selected.perk?.value || selected.perk_value) {
      await mutations.createRedemption(selected);
      return;
    }

    await openMaps();
  };

  const primaryLabel =
    selected.type === 'event'
      ? 'RSVP'
      : selected.type === 'perk' || selected.perk?.value || selected.perk_value
        ? 'Redeem'
        : 'Directions';
  const PrimaryIcon =
    selected.type === 'event'
      ? IconCalendarCheck
      : selected.type === 'perk' || selected.perk?.value || selected.perk_value
        ? IconPerk
        : IconNavigation;

  const closeDrawer = () => {
    selectEntity(null);
    setDrawerState('closed');
  };

  const detailBody = (
    <>
      <div className="pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-navy">
          <EntityIcon className="h-3.5 w-3.5" />
          {entityLabel}
        </span>
        <h2 className="mt-3 text-xl font-semibold text-navy">{selected.name}</h2>
        <p className="mt-2 text-sm text-navy-muted">{selected.description || selected.address}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {selected.address && (
          <span className="dp-chip">
            <IconNavigation className="h-3.5 w-3.5" />
            {selected.address.split(',')[0]}
          </span>
        )}
        {selected.metadata?.walkMinutes && (
          <span className="dp-chip">
            <IconClock className="h-3.5 w-3.5" />
            {selected.metadata.walkMinutes} min walk
          </span>
        )}
        {selected.perk?.value && <span className="dp-chip">{selected.perk.value}</span>}
      </div>

      {isExpanded && (
        <div className="mt-4 rounded-xl border border-border bg-white/80 p-4 text-sm text-navy-muted">
          <p>{selected.description || 'This downtown stop is live on the shared resident map.'}</p>
          {selected.eventTiming?.title && <p className="mt-2 font-medium text-navy">{selected.eventTiming.title}</p>}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          disabled={mutations.pendingAction === 'save'}
          className={isSaved ? 'dp-chip dp-chip-active justify-center py-3' : 'dp-chip justify-center py-3'}
        >
          {mutations.pendingAction === 'save' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IconSave className="h-3.5 w-3.5" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button onClick={openMaps} className="dp-chip justify-center py-3">
          <IconNavigation className="h-3.5 w-3.5" />
          Directions
        </button>
      </div>

      <button
        onClick={handlePrimaryAction}
        disabled={Boolean(mutations.pendingAction)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-medium text-white"
      >
        {mutations.pendingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrimaryIcon className="h-4 w-4" />}
        {primaryLabel}
      </button>

      <div className="mt-2 flex gap-2">
        <button
          onClick={() => setDrawerState(isExpanded ? 'preview' : 'expanded')}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy"
        >
          <IconChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? 'Roll up details' : 'View full details'}
        </button>
        <button
          onClick={closeDrawer}
          className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy"
          aria-label="Close details"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDrawer}
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
          <div className="dp-map-panel overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="h-1.5 w-12 rounded-full bg-navy/10" />
              <button
                onClick={closeDrawer}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className={`overflow-y-auto px-4 pb-4 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[42vh]'}`}>
              {detailBody}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          key={`desktop-${selected.id}`}
          initial={{ opacity: 0, y: 18, x: -12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 18, x: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="pointer-events-auto fixed bottom-6 left-6 z-30 hidden w-[min(420px,calc(100vw-32px))] md:block"
        >
          <div className="dp-map-panel overflow-hidden rounded-[24px] border border-border shadow-[0_24px_60px_rgba(11,31,51,0.18)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">Selected pin</div>
              <button
                onClick={closeDrawer}
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close details"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className={`overflow-y-auto px-5 pb-5 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[46vh]'}`}>
              {detailBody}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
