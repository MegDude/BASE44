/**
 * UnifiedDrawer — Decision surface for map entities
 * Mobile: bottom sheet
 * Desktop: right-side floating card
 * No borders, glass effect, minimal actions
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, Star, Navigation, Phone, Calendar, ExternalLink, Check, ChevronLeft } from 'lucide-react';

const ACTION_CONFIGS = {
  go: { label: 'Go', icon: Navigation, primary: true },
  save: { label: 'Save', icon: Star, primary: false },
  redeem: { label: 'Redeem', icon: Check, primary: true },
  rsvp: { label: 'RSVP', icon: Calendar, primary: true },
  call: { label: 'Call', icon: Phone, primary: false },
  details: { label: 'Details', icon: ExternalLink, primary: false },
};

function getActionsForEntity(entity) {
  const actions = [];
  
  // Primary action based on type
  if (entity.eventType || entity.isEvent) {
    actions.push('rsvp');
  } else if (entity.hasPerk || entity.perk) {
    actions.push('redeem');
  } else {
    actions.push('go');
  }
  
  // Always include save
  actions.push('save');
  
  // Optional details
  if (entity.website || entity.url) {
    actions.push('details');
  }
  
  return actions.slice(0, 3); // Max 3 actions
}

export default function UnifiedDrawer({ entity, onClose, onAction }) {
  const drawerRef = useRef(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose?.();
  }, [onClose]);

  if (!entity) return null;

  const actions = getActionsForEntity(entity);
  const reason = entity.reason || entity.whyThis || 'Recommended from the live downtown layer';

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-40 bg-black/20"
      />

      {/* Drawer - Mobile: bottom sheet, Desktop: right side */}
      <motion.div
        ref={drawerRef}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed z-50 
          bottom-0 left-0 right-0 max-h-[85vh]
          md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-96 md:max-h-[calc(100vh-2rem)]
          dp-glass rounded-t-3xl md:rounded-2xl dp-shadow-lg
          overflow-hidden safe-bottom"
      >
        {/* Handle - Mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--dp-navy-muted)] opacity-30" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 p-4 pb-3">
          {/* Back button - Desktop */}
          <button
            onClick={onClose}
            className="hidden md:flex dp-back shrink-0 mt-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Close button - Mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 dp-close"
          >
            <X className="w-4 h-4 text-[var(--dp-navy-muted)]" />
          </button>

          <div className="flex-1 min-w-0 md:mt-0">
            {/* Reason chip */}
            <div className="flex items-center gap-2 mb-2">
              <span className="dp-badge">
                <Star className="w-3 h-3" />
                <span className="line-clamp-1">{reason}</span>
              </span>
            </div>

            {/* Title */}
            <h2 className="dp-h3 text-[var(--dp-navy)] line-clamp-2 mb-1">
              {entity.name || entity.title}
            </h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--dp-navy-muted)]">
              {entity.category && (
                <span>{entity.category}</span>
              )}
              {entity.walkTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {entity.walkTime}
                </span>
              )}
              {entity.distance && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {entity.distance}
                </span>
              )}
              {entity.isOpen && (
                <span className="text-emerald-600 font-medium">Open now</span>
              )}
            </div>
          </div>
        </div>

        {/* Perk highlight */}
        {(entity.perk || entity.offer) && (
          <div className="mx-4 mb-3 px-4 py-3 rounded-xl bg-[var(--dp-gold-soft)]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--dp-gold)]" />
              <span className="font-medium text-[var(--dp-navy)]">
                {entity.perk || entity.offer}
              </span>
            </div>
          </div>
        )}

        {/* Description - Only if short */}
        {entity.description && entity.description.length < 150 && (
          <div className="px-4 pb-3">
            <p className="dp-body-sm line-clamp-2">{entity.description}</p>
          </div>
        )}

        {/* Event details */}
        {(entity.eventType || entity.isEvent) && entity.date && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--dp-gold)]" />
              <span className="font-medium text-[var(--dp-navy)]">
                {entity.date} {entity.time && `· ${entity.time}`}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 pt-2 flex gap-3">
          {actions.map((actionKey) => {
            const config = ACTION_CONFIGS[actionKey];
            if (!config) return null;
            const Icon = config.icon;
            const isPrimary = config.primary;

            return (
              <button
                key={actionKey}
                onClick={() => onAction?.(actionKey, entity)}
                className={`dp-touch flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all duration-150 ${
                  isPrimary
                    ? 'dp-btn-gold'
                    : 'bg-[var(--dp-surface-subtle)] text-[var(--dp-navy)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick info footer */}
        <div className="px-4 pb-4 pt-1 border-t border-[var(--dp-divider)]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--dp-navy-muted)]">
              {entity.address || '78701 Downtown Austin'}
            </span>
            {entity.phone && (
              <a
                href={`tel:${entity.phone}`}
                className="flex items-center gap-1.5 text-[var(--dp-gold)] font-medium"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
