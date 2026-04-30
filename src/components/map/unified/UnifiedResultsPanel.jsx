import { motion, AnimatePresence } from 'framer-motion';
import { useMapStateStore } from '@/store/mapStateStore';
import { useResidentMutations } from '@/hooks/useResidentMutations';
import { trackEvent } from '@/lib/analytics';
import {
  IconAsk,
  IconClock,
  IconClose,
  getEntityIcon,
  getEntityLabel,
  IconNavigation,
  IconSave,
} from '@/components/icons/DPIcons';

function getStatus(item) {
  if (item?.isLive || item?.eventTiming?.isLive) return { label: 'Live now', tone: 'live' };
  if (item?.isOpenNow) return { label: 'Open now', tone: 'open' };
  if (item?.eventTiming?.startsSoon || item?.eventTiming?.startTime) {
    return { label: 'Starting soon', tone: 'soon' };
  }
  return null;
}

function getReason(item) {
  if (item?.metadata?.reason) return item.metadata.reason;
  if (item?.isLive || item?.eventTiming?.isLive) return `Live now${item?.district ? ` near ${item.district}` : ''}`;
  if (item?.isOpenNow && item?.metadata?.walkMinutes) return `Open now · ${item.metadata.walkMinutes} min walk`;
  if (item?.isOpenNow) return 'Open now nearby';
  if (item?.perk?.value || item?.perk_value || item?.type === 'perk') return 'Perk available nearby';
  if (item?.type === 'building' || item?.type === 'property') return item?.district ? `Residential option in ${item.district}` : 'Residential option nearby';
  return item?.category ? `Good match for ${item.category}` : 'Good nearby option right now';
}

function rankItems(items = [], savedEntityIds) {
  return [...items].sort((a, b) => {
    const aLive = Number(Boolean(a?.isLive || a?.eventTiming?.isLive));
    const bLive = Number(Boolean(b?.isLive || b?.eventTiming?.isLive));
    if (bLive !== aLive) return bLive - aLive;

    const aOpen = Number(Boolean(a?.isOpenNow));
    const bOpen = Number(Boolean(b?.isOpenNow));
    if (bOpen !== aOpen) return bOpen - aOpen;

    const aSaved = Number(savedEntityIds.has(a.id));
    const bSaved = Number(savedEntityIds.has(b.id));
    if (bSaved !== aSaved) return bSaved - aSaved;

    const aWalk = a?.metadata?.walkMinutes ?? 999;
    const bWalk = b?.metadata?.walkMinutes ?? 999;
    if (aWalk !== bWalk) return aWalk - bWalk;

    return (b?.metadata?.popularity ?? 0) - (a?.metadata?.popularity ?? 0);
  });
}

function groupItems(items = [], savedEntityIds) {
  const ranked = rankItems(items, savedEntityIds);

  const liveNow = ranked.filter((item) => item?.isLive || item?.eventTiming?.isLive);
  const happeningSoon = ranked.filter(
    (item) =>
      !(item?.isLive || item?.eventTiming?.isLive) &&
      (item?.eventTiming?.startsSoon || item?.eventTiming?.startTime)
  );
  const openNearby = ranked.filter(
    (item) =>
      !(item?.isLive || item?.eventTiming?.isLive) &&
      !(item?.eventTiming?.startsSoon || item?.eventTiming?.startTime) &&
      item?.isOpenNow
  );

  const used = new Set([...liveNow, ...happeningSoon, ...openNearby].map((item) => item.id));
  const rest = ranked.filter((item) => !used.has(item.id));

  return [
    { id: 'live', label: 'Live now', items: liveNow },
    { id: 'soon', label: 'Happening soon', items: happeningSoon },
    { id: 'open', label: 'Open nearby', items: openNearby },
    { id: 'rest', label: 'More nearby', items: rest },
  ].filter((group) => group.items.length > 0);
}

function ResultCard({ item, isSelected, isSaved, onSelect, onToggleSave, onPrimaryAction }) {
  const metaWalk = item.metadata?.walkMinutes ? `${item.metadata.walkMinutes} min walk` : null;
  const EntityIcon = getEntityIcon(item);
  const entityLabel = getEntityLabel(item);
  const status = getStatus(item);
  const reason = getReason(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`w-full rounded-[18px] border px-4 py-3 text-left transition-all ${
        isSelected
          ? 'border-[#0b1f33] bg-[rgba(11,31,51,0.04)]'
          : 'border-border bg-white hover:border-[rgba(11,31,51,0.18)]'
      }`}
    >
      <div className="w-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(182,146,71,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0b1f33]">
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
            <h3 className="mt-2 text-[15px] font-semibold text-[#0b1f33]">{item.name}</h3>
            <p className="mt-1 text-[12px] leading-5 text-slate-600">{reason}</p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}
            className={isSaved ? 'dp-chip dp-chip-active' : 'dp-chip'}
            aria-label={isSaved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
          >
            <IconSave className="h-3.5 w-3.5" />
          </button>
        </div>

        <button type="button" onClick={onSelect} className="mt-3 w-full text-left">
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {item.address && (
              <span className="dp-chip">
                <IconNavigation className="h-3.5 w-3.5" />
                {item.address.split(',')[0]}
              </span>
            )}
            {metaWalk && (
              <span className="dp-chip">
                <IconClock className="h-3.5 w-3.5" />
                {metaWalk}
              </span>
            )}
            {item.perk?.value ? <span className="dp-chip">{item.perk.value}</span> : null}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

export default function UnifiedResultsPanel({
  items = [],
  onSelectResult,
  onClose = null,
  title = null,
  subtitle = null,
}) {
  const selectedEntityId = useMapStateStore((state) => state.selectedEntityId);
  const searchQuery = useMapStateStore((state) => state.searchQuery);
  const savedEntityIds = useMapStateStore((state) => state.savedEntityIds);
  const selectEntity = useMapStateStore((state) => state.selectEntity);
  const toggleSaved = useMapStateStore((state) => state.toggleSaved);
  const mutations = useResidentMutations();
  const groups = groupItems(items, savedEntityIds);

  return (
    <div className="flex h-full flex-col" aria-live="polite">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {title || `${items.length} live near you${searchQuery ? ` for “${searchQuery}”` : ''}`}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {subtitle || 'Ranked for the next 5 to 30 minutes: live now, open now, and closest first.'}
            </p>
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
                <IconClose className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-white px-6 py-12 text-center">
            <IconAsk className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-foreground">Nothing nearby right now</p>
            <p className="mt-1 text-xs text-slate-500">Try a different search, clear a filter, or move the map.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {groups.map((group) => (
                <section key={group.id}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {group.label}
                    </h3>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {group.items.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => {
                      const isSaved = savedEntityIds.has(item.id);
                      const isSelected = selectedEntityId === item.id;

                      return (
                        <ResultCard
                          key={item.id}
                          item={item}
                          isSelected={isSelected}
                          isSaved={isSaved}
                          onSelect={() => {
                            trackEvent('result_selected', { source: 'results_panel', entityId: item.id, entityType: item.type });
                            selectEntity(item);
                            onSelectResult?.(item);
                          }}
                          onToggleSave={async () => {
                            toggleSaved(item.id);
                            await mutations.toggleSavedItem(item);
                          }}
                          onPrimaryAction={async () => {
                            selectEntity(item);
                            onSelectResult?.(item);
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
