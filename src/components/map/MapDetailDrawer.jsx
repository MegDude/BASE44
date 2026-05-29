/**
 * MapDetailDrawer — Conversion Engine
 * RULES:
 * - NO dead info blocks
 * - NO long paragraphs
 * - EVERY section leads to action
 */

import { motion } from 'framer-motion';
import { X, MapPin, Clock, Star, ChevronRight, Share2, ExternalLink, Zap, ArrowLeft } from 'lucide-react';
import WhyThisChip from './WhyThisChip';
import { trackingEvents } from '@/lib/analytics/track';
import { useResidentStore } from '@/store/resident-store';
import { resolveEntityPin } from '@/lib/map/entityPinResolver';

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
      <div className="p-5 pb-4 border-b border-border/40 flex-shrink-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:bg-muted/50"
            aria-label="Back to map results"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border/50 bg-card flex items-center justify-center hover:bg-muted/50 transition-colors shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4 text-foreground/60" />
          </button>
        </div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {reason && <WhyThisChip reason={reason} distance={distance} variant="header" />}
            <h2 className="text-[20px] font-heading font-medium text-foreground leading-tight mt-2 truncate">{entity.name}</h2>
          </div>
        </div>

        {/* Subtitle */}
        {entity.address && (
          <p className="text-[13px] text-muted-foreground">{entity.address}</p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex aspect-[2/1] w-full items-center justify-center border-b border-[#0B1F33]/8 bg-[#F7F8FB]">
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-[#B38F4F]/50 bg-[#0B1F33] text-xl font-semibold text-[#B38F4F]">
            <span dangerouslySetInnerHTML={{ __html: pin.glyph }} />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Context block */}
          {reason && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <div className="text-[12px] text-primary font-medium">
                {reason === 'nearby' && `${distance || '0'} min walk from you`}
                {reason === 'campaign' && 'Featured in active campaign'}
                {reason === 'event_now' && 'Happening right now'}
                {reason === 'perk_match' && 'Exclusive perk available'}
                {reason === 'saved' && 'One of your saved items'}
              </div>
            </div>
          )}

          {/* Description */}
          {entity.description && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">About</div>
              <p className="text-[13px] text-foreground/70 leading-relaxed line-clamp-3">{entity.description}</p>
            </div>
          )}

          {/* Live signals */}
          {(entity.isActive || entity.rsvp_count) && (
            <div className="space-y-2">
              {entity.isActive && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F8FB]/35 border border-[#B38F4F]/30">
                  <Zap className="w-4 h-4 text-[#B38F4F]" />
                  <span className="text-[12px] font-medium text-[#0B1F33]">Open now</span>
                </div>
              )}
              {entity.rsvp_count && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F8FB] border border-[#0B1F33]/8">
                  <ChevronRight className="w-4 h-4 text-[#B38F4F]" />
                  <span className="text-[12px] font-medium text-[#0B1F33]">{entity.rsvp_count} people going</span>
                </div>
              )}
            </div>
          )}

          {/* Perk highlight */}
          {entity.perk_description && (
            <div className="rounded-lg bg-muted/40 border border-muted/60 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Member perk</div>
              <div className="text-[13px] font-medium text-foreground">{entity.perk_description}</div>
              {entity.perk_value && <div className="text-[16px] font-bold text-foreground mt-1">{entity.perk_value}</div>}
            </div>
          )}

          {/* Hours */}
          {entity.hours && (
            <div className="flex items-center gap-2 text-[13px]">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground/70">{entity.hours}</span>
            </div>
          )}

          {/* Tags */}
          {entity.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entity.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-muted/50 text-[11px] text-foreground/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary actions (sticky) */}
      <div className="p-5 pt-4 border-t border-border/40 flex-shrink-0 space-y-2.5">
        {/* Main CTA */}
        {entity.website ? (
          <a
            href={entity.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {entity._type === 'event' ? 'View event' : 'Visit website'}
          </a>
        ) : (
          <button
            onClick={handleDirections}
            className="w-full h-10 rounded-lg bg-foreground text-background font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Get directions
          </button>
        )}

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleSave}
            className={`h-10 rounded-lg border font-medium text-[12px] flex items-center justify-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border/50 text-foreground/60 hover:border-border/80 hover:text-foreground'
            }`}
          >
            <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              trackingEvents.save(entity.id);
            }}
            className="h-10 rounded-lg border border-border/50 text-foreground/60 font-medium text-[12px] flex items-center justify-center gap-1.5 hover:border-border/80 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}
