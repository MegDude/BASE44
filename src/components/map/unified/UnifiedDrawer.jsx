import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { downloadCalendarEntry } from '@/lib/calendar';
import { useMapStateStore } from '@/store/mapStateStore';
import { useResidentMutations } from '@/hooks/useResidentMutations';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useCTAFlow } from '@/components/cta/CTAFlowProvider';
import { getEntityInquiryFlow } from '@/lib/cta/partnerFlowHelpers';
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

function getStatus(item) {
  if (item?.isLive || item?.eventTiming?.isLive) return { label: 'Live now', tone: 'live' };
  if (item?.isOpenNow) return { label: 'Open now', tone: 'open' };
  if (item?.eventTiming?.startsSoon || item?.eventTiming?.startTime) return { label: 'Starting soon', tone: 'soon' };
  return null;
}

function getMobilePanelHeight(drawerState) {
  if (drawerState === 'collapsed') return 'h-[76px]';
  if (drawerState === 'expanded' || drawerState === 'fullscreen') return 'h-[84vh]';
  return 'h-[48vh]';
}

function getMobileToggleLabel(drawerState) {
  if (drawerState === 'expanded' || drawerState === 'fullscreen') return 'Collapse';
  if (drawerState === 'collapsed') return 'Open';
  return 'Expand';
}

export default function UnifiedDrawer({ selected, desktopMode = 'floating', desktopClassName = '' }) {
  const drawerState = useMapStateStore((state) => state.drawerState);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const mutations = useResidentMutations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { openFlow } = useCTAFlow();

  const closeDrawer = () => {
    selectEntity(null);
    setDrawerState('closed');
  };

  useEffect(() => {
    if (!selected) return undefined;
    const handleKeydown = (event) => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selected]);

  if (!selected || drawerState === 'closed') return null;

  const isExpanded = drawerState === 'expanded' || drawerState === 'fullscreen';
  const isCollapsed = drawerState === 'collapsed';
  const isSaved = savedEntityIds.has(selected.id);
  const EntityIcon = getEntityIcon(selected);
  const entityLabel = getEntityLabel(selected);
  const status = getStatus(selected);
  const groupedListingCount = Number(selected?.metadata?.groupedListingCount || 0);
  const listingTypes = Array.isArray(selected?.metadata?.listingTypes) ? selected.metadata.listingTypes : [];
  const unitTypes = Array.isArray(selected?.metadata?.unitTypes) ? selected.metadata.unitTypes : [];
  const priceRange = selected?.metadata?.priceRange || selected?.subtitle;
  const clusterItems = Array.isArray(selected?.metadata?.clusterItems) ? selected.metadata.clusterItems : [];
  const clusterCount = Number(selected?.metadata?.clusterCount || clusterItems.length || 0);

  const openDetails = async () => {
    setDrawerState('expanded');
    await mutations.logInteraction(selected, 'detail_open', undefined, { surface: 'unified_drawer' });
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
    await openDetails();
  };

  const togglePanel = () => {
    if (drawerState === 'collapsed') {
      setDrawerState('preview');
      return;
    }
    if (isExpanded) {
      setDrawerState('preview');
      return;
    }
    setDrawerState('expanded');
  };

  const primaryLabel =
    selected.type === 'cluster'
      ? 'Open area'
      : selected.type === 'event'
        ? 'RSVP'
        : selected.type === 'perk' || selected.perk?.value || selected.perk_value
          ? 'Redeem'
          : 'Details';
  const PrimaryIcon =
    selected.type === 'cluster'
      ? IconChevronUp
      : selected.type === 'event'
        ? IconCalendarCheck
        : selected.type === 'perk' || selected.perk?.value || selected.perk_value
          ? IconPerk
          : IconChevronUp;
  const canAddToCalendar = Boolean(
    selected.type === 'event' ||
    selected.type === 'perk' ||
    selected.perk?.value ||
    selected.perk_value ||
    selected.perk_description
  );

  const inquiryFlow = getEntityInquiryFlow(selected, {
    source: 'unified_drawer',
    sourceComponent: 'UnifiedDrawer',
  });

  const detailBody = (
    <>
      <div className="pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-navy">
            <EntityIcon className="h-3.5 w-3.5" />
            {entityLabel}
          </span>
          {status ? (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                status.tone === 'live'
                  ? 'bg-[rgba(47,111,85,0.12)] text-[#2F6F55]'
                  : status.tone === 'soon'
                    ? 'bg-[rgba(198,168,90,0.16)] text-[#7E622A]'
                    : 'bg-[rgba(11,31,51,0.08)] text-[#0b1f33]'
              }`}
            >
              {status.label}
            </span>
          ) : null}
        </div>
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
        {groupedListingCount > 1 && <span className="dp-chip">{groupedListingCount} listings</span>}
        {selected.type === 'cluster' && clusterCount > 1 && <span className="dp-chip">{clusterCount} grouped pins</span>}
        {listingTypes.length > 0 && (
          <span className="dp-chip">
            {listingTypes.map((type) => String(type).charAt(0).toUpperCase() + String(type).slice(1)).join(' + ')}
          </span>
        )}
        {priceRange && <span className="dp-chip">{priceRange}</span>}
        {selected.perk?.value && <span className="dp-chip">{selected.perk.value}</span>}
      </div>

      {isExpanded && (
        <div className="mt-4 rounded-xl border border-border bg-white/80 p-4 text-sm text-navy-muted">
          <p>{selected.description || 'This downtown stop is live on the shared resident map.'}</p>
          {(groupedListingCount > 1 || unitTypes.length > 0) && (
            <div className="mt-3 space-y-2">
              {groupedListingCount > 1 && (
                <p className="font-medium text-navy">{groupedListingCount} active listings grouped in this building.</p>
              )}
              {unitTypes.length > 0 && <p>Unit mix: {unitTypes.join(', ')}</p>}
            </div>
          )}
          {selected.eventTiming?.title && <p className="mt-2 font-medium text-navy">{selected.eventTiming.title}</p>}
        </div>
      )}

      {selected.type === 'cluster' && clusterItems.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-white/80 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/54">In this area</div>
          <div className="mt-3 space-y-2">
            {clusterItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectEntity(item);
                  setDrawerState('preview');
                }}
                className="flex w-full items-start justify-between gap-3 rounded-[14px] border border-border bg-white px-3 py-3 text-left transition-colors hover:bg-[#f8fafc]"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-navy">{item.name}</div>
                  <div className="mt-1 text-[12px] leading-5 text-navy-muted">
                    {item.address || item.description || item.category}
                  </div>
                </div>
                {item.metadata?.walkMinutes ? (
                  <span className="shrink-0 text-[11px] font-medium text-navy/54">{item.metadata.walkMinutes} min</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handlePrimaryAction}
          disabled={Boolean(mutations.pendingAction)}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-medium text-white"
        >
          {mutations.pendingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <PrimaryIcon className="h-4 w-4" />}
          {primaryLabel}
        </button>
        <button
          onClick={handleSave}
          disabled={mutations.pendingAction === 'save'}
          className={isSaved ? 'dp-chip dp-chip-active justify-center py-3' : 'dp-chip justify-center py-3'}
        >
          {mutations.pendingAction === 'save' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IconSave className="h-3.5 w-3.5" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {inquiryFlow ? (
        <button
          onClick={() => openFlow(inquiryFlow)}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy"
        >
          {inquiryFlow.label}
        </button>
      ) : null}

      {canAddToCalendar ? (
        <button
          onClick={() => downloadCalendarEntry(selected)}
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy"
        >
          <IconCalendarCheck className="h-4 w-4" />
          Add to calendar
        </button>
      ) : null}

      <div className="mt-2 flex gap-2">
        <button
          onClick={togglePanel}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy"
        >
          <IconChevronUp className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {getMobileToggleLabel(drawerState)}
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

  const mobilePanelHeight = getMobilePanelHeight(drawerState);

  return (
    <AnimatePresence>
      <motion.div
        key={`drawer-${selected.id}-${isDesktop ? 'desktop' : 'mobile'}`}
        initial={isDesktop ? { opacity: 0, x: 420 } : { y: 320 }}
        animate={isDesktop ? { opacity: 1, x: 0 } : { y: 0 }}
        exit={isDesktop ? { opacity: 0, x: 420 } : { y: 320 }}
        drag={isDesktop ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (isDesktop) return;
          if (info.offset.y > 80) setDrawerState('collapsed');
          if (info.offset.y < -80) setDrawerState('expanded');
        }}
        transition={isDesktop ? { duration: 0.22, ease: 'easeOut' } : { type: 'spring', damping: 28, stiffness: 240 }}
        className={
          isDesktop
            ? `pointer-events-auto absolute bottom-5 right-5 top-5 z-30 w-[380px] overflow-hidden rounded-[28px] border border-border bg-[#fbfbfd] shadow-[0_24px_60px_rgba(11,31,51,0.12)] md:flex md:flex-col ${desktopClassName}`.trim()
            : 'pointer-events-auto absolute inset-x-0 bottom-0 z-30 px-3 pb-3'
        }
      >
        <div
          className={
            isDesktop
              ? 'flex h-full flex-col bg-[#fbfbfd]'
              : `dp-map-panel overflow-hidden rounded-2xl transition-[height] duration-200 ease-out ${mobilePanelHeight}`
          }
        >
          {isDesktop ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--dp-gold-muted)]">Selected place</div>
                <button
                  onClick={closeDrawer}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(11,31,51,0.08)] bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Close details"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
              <div className={`overflow-y-auto px-5 pb-5 ${desktopMode === 'docked' ? 'flex-1 pt-0' : ''} ${isExpanded ? 'max-h-[70vh]' : 'max-h-[46vh]'}`}>
                {detailBody}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setDrawerState(isCollapsed ? 'preview' : 'collapsed')}
                className="flex w-full cursor-pointer justify-center py-2"
                aria-label={isCollapsed ? 'Open details' : 'Collapse details'}
              >
                <div className="h-1.5 w-12 rounded-full bg-navy/20" />
              </button>

              <div className="flex items-center justify-between border-b border-border px-4 pb-3">
                <div className="min-w-0 pr-3">
                  <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/48">{entityLabel}</div>
                  <div className="truncate text-sm font-semibold text-navy">{selected.name}</div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="shrink-0 rounded-full p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close details"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              {!isCollapsed ? (
                <div className="h-[calc(100%-72px)] overflow-y-auto px-4 pb-4">
                  {detailBody}
                </div>
              ) : null}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}