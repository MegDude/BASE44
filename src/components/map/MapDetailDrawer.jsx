/**
 * MapDetailDrawer — Conversion Engine
 * RULES:
 * - NO dead info blocks
 * - NO long paragraphs
 * - EVERY section leads to action
 */

import { motion } from 'framer-motion';
import { X, MapPin, Clock, Star, Share2, ExternalLink, ArrowLeft } from 'lucide-react';
import WhyThisChip from './WhyThisChip';
import { trackingEvents } from '@/lib/analytics/track';
import { useResidentStore } from '@/store/resident-store';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';
import { handlePanelMediaError } from '@/lib/map/panelMediaPresentation';

export default function MapDetailDrawer({ entity, onClose, reason, distance }) {
  const { history, addSaved, removeSaved } = useResidentStore();
  const isSaved = history.saved.includes(entity.id);
  const pin = resolveEntityPin(entity);

  const handleSave = () => {
    if (isSaved) {
      removeSaved(entity.id);
      trackingEvents.unsave(entity.id);
    } else {
      addSaved(entity.id);
      trackingEvents.save(entity.id);
    }
  };

  const handleDirections = () => {
    if (entity.lat && entity.lng) {
      const url = `https://maps.google.com/?q=${entity.lat},${entity.lng}`;
      window.open(url, '_blank');
      trackingEvents.directions(entity.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-5 pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="inline-flex h-6 items-center gap-1.5 bg-transparent px-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F33]/58 transition hover:-translate-y-px hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
            aria-label="Back to map results"
          >
            <ArrowLeft className="h-3 w-3 text-[#BFA46A]" />
            Back
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center bg-transparent text-[#0B1F33]/54 transition hover:text-[#0B1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {reason && <WhyThisChip reason={reason} distance={distance} variant="header" />}
            <h2 className="mt-2 truncate text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#0B1F33]">{entity.name}</h2>
          </div>
        </div>

        {/* Subtitle */}
        {entity.address && (
          <p className="text-[13px] text-muted-foreground">{entity.address}</p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden bg-[#F7F8FB]">
          {heroImage ? (
            <img src={heroImage} alt={heroAlt} className="h-full w-full object-cover" loading="eager" decoding="async" onError={handlePanelMediaError} />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(191,164,106,0.08),transparent_60%),radial-gradient(ellipse_at_80%_70%,rgba(11,31,51,0.05),transparent_50%)]" />
              <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-[#0B1F33] text-base font-semibold text-[#BFA46A] shadow-[0_4px_14px_rgba(11,31,51,0.14)]">
                <span dangerouslySetInnerHTML={{ __html: pin.glyph }} />
              </div>
            </>
          )}
        </div>

        <div className="p-5 space-y-3.5">
          {/* Context chip */}
          {reason && (
            <div className="inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(191,164,106,0.24)] bg-[rgba(191,164,106,0.08)] px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#BFA46A]" />
              <span className="text-[11.5px] font-semibold text-[#8B6B2F]">
                {reason === 'nearby' && `${distance || '0'} min walk`}
                {reason === 'campaign' && 'Featured campaign'}
                {reason === 'event_now' && 'Happening now'}
                {reason === 'perk_match' && 'Exclusive perk'}
                {reason === 'saved' && 'Saved by you'}
              </span>
            </div>
          )}

          {/* Description */}
          {entity.description && (
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0B1F33]/44 mb-1.5">About</p>
              <p className="text-[13.5px] text-[#0B1F33]/72 leading-relaxed line-clamp-3">{entity.description}</p>
            </div>
          )}

          {/* Live activity */}
          {(entity.isActive || entity.rsvp_count) && (
            <div className="space-y-2">
              {entity.isActive && (
                <div className="flex items-center gap-2.5 rounded-[8px] border border-[rgba(191,164,106,0.2)] bg-[rgba(191,164,106,0.07)] px-3 py-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-[#BFA46A] shadow-[0_0_4px_rgba(191,164,106,0.6)]" />
                  <span className="text-[12.5px] font-semibold text-[#8B6B2F]">Open now</span>
                </div>
              )}
              {entity.rsvp_count && (
                <div className="flex items-center gap-2.5 rounded-[8px] border border-[rgba(11,31,51,0.07)] bg-[rgba(11,31,51,0.03)] px-3 py-2">
                  <Star className="w-3.5 h-3.5 text-[#BFA46A]" />
                  <span className="text-[12.5px] font-medium text-[#0B1F33]/70">{entity.rsvp_count} people going</span>
                </div>
              )}
            </div>
          )}

          {/* Perk highlight */}
          {entity.perk_description && (
            <div className="rounded-[8px] border border-[rgba(191,164,106,0.2)] bg-[rgba(191,164,106,0.06)] p-3.5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#BFA46A] mb-1.5">Member perk</p>
              <p className="text-[13px] font-medium text-[#0B1F33]">{entity.perk_description}</p>
              {entity.perk_value && <p className="text-[17px] font-bold text-[#0B1F33] mt-1 tracking-tight">{entity.perk_value}</p>}
            </div>
          )}

          {/* Hours */}
          {entity.hours && (
            <div className="flex items-center gap-2 text-[13px]">
              <Clock className="w-3.5 h-3.5 text-[#0B1F33]/40 shrink-0" />
              <span className="text-[#0B1F33]/62">{entity.hours}</span>
            </div>
          )}

          {/* Tags */}
          {entity.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entity.tags.slice(0, 4).map((tag, i) => (
                <span key={i} className="rounded-[6px] border border-[rgba(11,31,51,0.08)] bg-[rgba(11,31,51,0.04)] px-2.5 py-0.5 text-[10.5px] font-medium tracking-wide text-[#0B1F33]/54">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary actions (sticky) */}
      <div className="flex-shrink-0 border-t border-[rgba(11,31,51,0.06)] bg-white/92 p-4 pt-3.5 backdrop-blur-[12px] space-y-2">
        {/* Main CTA */}
        {entity.website ? (
          <a
            href={entity.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0B1F33] text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(11,31,51,0.18),0_8px_20px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(11,31,51,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {entity._type === 'event' ? 'View event' : 'Visit website'}
          </a>
        ) : (
          <button
            onClick={handleDirections}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#0B1F33] text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(11,31,51,0.18),0_8px_20px_rgba(11,31,51,0.12)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0f2740] hover:shadow-[0_4px_14px_rgba(11,31,51,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(11,31,51,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50"
          >
            <MapPin className="w-3.5 h-3.5" />
            Get directions
          </button>
        )}

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSave}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-[7px] border text-[11.5px] font-semibold tracking-[0.04em] transition-all duration-150 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50 ${
              isSaved
                ? 'border-[rgba(191,164,106,0.35)] bg-[rgba(191,164,106,0.09)] text-[#8B6B2F] shadow-none'
                : 'border-[rgba(11,31,51,0.09)] bg-white text-[#0B1F33]/62 shadow-[0_1px_3px_rgba(11,31,51,0.05)] hover:border-[rgba(191,164,106,0.4)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#BFA46A]' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              trackingEvents.save(entity.id);
            }}
            className="flex h-9 items-center justify-center gap-1.5 rounded-[7px] border border-[rgba(11,31,51,0.09)] bg-white text-[11.5px] font-semibold tracking-[0.04em] text-[#0B1F33]/62 shadow-[0_1px_3px_rgba(11,31,51,0.05)] transition-all duration-150 hover:-translate-y-px hover:border-[rgba(11,31,51,0.14)] hover:text-[#0B1F33] hover:shadow-[0_2px_8px_rgba(11,31,51,0.07)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA46A]/50"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}
