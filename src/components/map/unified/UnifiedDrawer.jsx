/**
 * UnifiedDrawer - Decision surface for map-first MVP
 * 
 * Design principles:
 * - Shows decision reason near the title
 * - Only 3 primary actions: Go/Details, Save, Redeem/RSVP (when relevant)
 * - No repeated chips restating metadata
 * - Mobile: bottom sheet
 * - Desktop: right-side dock
 * - Avoid bordered nested cards
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useMapStateStore } from '@/store/mapStateStore';
import { useResidentMutations } from '@/hooks/useResidentMutations';
import useMediaQuery from '@/hooks/useMediaQuery';
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

export default function UnifiedDrawer({
  selected,
  desktopMode = 'floating',
  desktopClassName = '',
}) {
  const drawerState = useMapStateStore((state) => state.drawerState);
  const setDrawerState = useMapStateStore((state) => state.setDrawerState);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const mutations = useResidentMutations();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!selected || drawerState === 'closed') {
    return null;
  }

  const isExpanded = drawerState === 'expanded' || drawerState === 'fullscreen';
  const isSaved = savedEntityIds.has(selected.id);
  const EntityIcon = getEntityIcon(selected);
  const entityLabel = getEntityLabel(selected);
  const status = getStatus(selected);
  
  // Decision reason - the key differentiator
  const decisionReason = selected.reason || selected.metadata?.reason || 'Recommended from the live downtown layer.';

  // Action handlers
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

  const handleGoAction = () => {
    const lat = selected.location?.lat || selected.lat;
    const lng = selected.location?.lng || selected.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  // Determine primary action label and icon
  const isEvent = selected.type === 'event';
  const isPerk = selected.type === 'perk' || selected.perk?.value || selected.perk_value;
  
  const primaryLabel = isEvent ? 'RSVP' : isPerk ? 'Redeem' : 'Details';
  const PrimaryIcon = isEvent ? IconCalendarCheck : isPerk ? IconPerk : IconChevronUp;
  const showPrimaryAction = isEvent || isPerk || !isExpanded;

  const closeDrawer = () => {
    selectEntity(null);
    setDrawerState('closed');
  };

  // ─── MOBILE BOTTOM SHEET ───────────────────────────────────────────────────
  if (!isDesktop) {
    return (
      <AnimatePresence>
        <motion.div
          key="drawer-mobile"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40"
        >
          <div className="bg-white rounded-t-[24px] shadow-2xl border-t border-slate-200/50 max-h-[70vh] overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            {/* Content */}
            <div className="px-5 pb-6">
              {/* Header with close */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  {/* Entity type badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
                      <EntityIcon className="h-3.5 w-3.5" />
                      {entityLabel}
                    </span>
                    {status && (
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
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

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-navy truncate">{selected.name}</h2>
                  
                  {/* Decision reason */}
                  <p className="text-sm text-slate-500 mt-1">{decisionReason}</p>
                </div>

                <button
                  onClick={closeDrawer}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              {/* Walk time if available */}
              {selected.metadata?.walkMinutes && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                  <IconClock className="h-4 w-4" />
                  <span>{selected.metadata.walkMinutes} min walk</span>
                </div>
              )}

              {/* Actions - only the essentials */}
              <div className="flex items-center gap-3">
                {/* Go / Navigation */}
                <button
                  onClick={handleGoAction}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-navy text-white font-medium hover:bg-navy/90 transition-colors"
                >
                  <IconNavigation className="h-4 w-4" />
                  <span>Go</span>
                </button>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    isSaved
                      ? 'bg-gold/10 border-gold text-gold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <IconSave className="h-5 w-5" filled={isSaved} />
                </button>

                {/* Primary action (Redeem/RSVP) - only when relevant */}
                {showPrimaryAction && (isEvent || isPerk) && (
                  <button
                    onClick={handlePrimaryAction}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gold text-navy font-medium hover:bg-gold/90 transition-colors"
                  >
                    <PrimaryIcon className="h-4 w-4" />
                    <span>{primaryLabel}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── DESKTOP RIGHT DOCK ────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        key="drawer-desktop"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`absolute right-4 top-20 z-30 w-80 ${desktopClassName}`}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Content */}
          <div className="p-5">
            {/* Header with close */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                {/* Entity type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
                    <EntityIcon className="h-3.5 w-3.5" />
                    {entityLabel}
                  </span>
                  {status && (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
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

                {/* Title */}
                <h2 className="text-lg font-semibold text-navy">{selected.name}</h2>
                
                {/* Decision reason */}
                <p className="text-sm text-slate-500 mt-1">{decisionReason}</p>
              </div>

              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            {/* Walk time if available */}
            {selected.metadata?.walkMinutes && (
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                <IconClock className="h-4 w-4" />
                <span>{selected.metadata.walkMinutes} min walk</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Go / Navigation */}
              <button
                onClick={handleGoAction}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-navy text-white text-sm font-medium hover:bg-navy/90 transition-colors"
              >
                <IconNavigation className="h-4 w-4" />
                <span>Go</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  isSaved
                    ? 'bg-gold/10 border-gold text-gold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <IconSave className="h-4 w-4" filled={isSaved} />
              </button>

              {/* Primary action (Redeem/RSVP) - only when relevant */}
              {showPrimaryAction && (isEvent || isPerk) && (
                <button
                  onClick={handlePrimaryAction}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-gold text-navy text-sm font-medium hover:bg-gold/90 transition-colors"
                >
                  <PrimaryIcon className="h-4 w-4" />
                  <span>{primaryLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
