/**
 * QRCodeModal — Perk redemption QR flow
 * States: idle | scanning | success | error
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useUnifiedMapStore } from '@/store/unified-map-store';

const RESIDENT_ACCESS_STORAGE_KEY = 'dp_resident_access:current';
const PROFILE_STORAGE_KEY = 'dp_profile_id';
const TOUCHPOINT_STORAGE_KEY = 'downtown-perks-resident-touchpoints';

function getOrCreateResidentUid() {
  if (typeof window === 'undefined') return 'profile-server';

  try {
    const resident = JSON.parse(window.localStorage.getItem(RESIDENT_ACCESS_STORAGE_KEY) || 'null');
    const residentUid = resident?.id || resident?.residentId || resident?.uid || resident?.profileId;
    if (residentUid) return String(residentUid);

    const existing = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (existing) return existing;

    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `profile-${crypto.randomUUID()}`
        : `profile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, next);
    return next;
  } catch {
    return `profile-${Date.now()}`;
  }
}

function recordResidentQrTouchpoint(event) {
  if (typeof window === 'undefined') return;

  try {
    const current = JSON.parse(window.localStorage.getItem(TOUCHPOINT_STORAGE_KEY) || '[]');
    const next = [event, ...(Array.isArray(current) ? current : [])].slice(0, 200);
    window.localStorage.setItem(TOUCHPOINT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Local touchpoint capture should never block the redemption UI.
  }

  window.dispatchEvent(new CustomEvent('downtown-perks:resident-touchpoint', { detail: event }));
}

export default function QRCodeModal({ item, onClose, onSuccess }) {
  const { trackAction } = useUnifiedMapStore();
  const [state, setState] = useState('idle'); // idle | confirming | success | error
  const [rating, setRating] = useState(0);
  const residentUid = useMemo(() => getOrCreateResidentUid(), []);
  const issuedAt = useMemo(() => new Date().toISOString(), []);
  const perkValue = item.perk_value || item.offer || item.primaryAction || 'resident perk';
  const perkDescription = item.perk_description || item.description || item.summary || `${item.name} includes a resident perk through Downtown Perks, giving verified residents a specific local benefit tied to this pin.`;
  const qrPayload = useMemo(() => {
    const cardUrl = new URL('/card', typeof window !== 'undefined' ? window.location.origin : 'https://base-44-h2iq.vercel.app');
    cardUrl.searchParams.set('residentUid', residentUid);
    cardUrl.searchParams.set('touchpoint', 'use_perk');
    cardUrl.searchParams.set('entityId', item.id);

    return {
      type: 'downtown_perks.resident_qr',
      version: 1,
      uid: residentUid,
      profileId: residentUid,
      venueId: item.id,
      venueName: item.name,
      perkValue,
      perkDescription,
      qrValue: cardUrl.toString(),
      timestamp: issuedAt,
    };
  }, [issuedAt, item.id, item.name, perkDescription, perkValue, residentUid]);
  const qrValue = JSON.stringify(qrPayload);

  useEffect(() => {
    recordResidentQrTouchpoint({
      id: `${item.id}-${residentUid}-${issuedAt}`,
      eventType: 'resident_qr_presented',
      action: 'use_perk',
      source: 'unified_drawer_qr_modal',
      uid: residentUid,
      profileId: residentUid,
      entityId: item.id,
      entityName: item.name,
      perkValue,
      perkDescription,
      issuedAt,
    });
  }, [issuedAt, item.id, item.name, perkDescription, perkValue, residentUid]);

  const handleConfirm = async () => {
    setState('confirming');
    try {
      await trackAction(item.id, 'redeem', {
        itemType: 'venue',
        perkValue,
        residentUid,
      });
      setState('success');
      setTimeout(() => onSuccess?.(), 2000);
    } catch (error) {
      setState('error');
    }
  };

  const handleRate = async (value) => {
    setRating(value);
    setTimeout(() => onClose?.(), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute left-4 top-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-[#0B1F33]/8 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-normal text-[#0B1F33]/70 transition-colors hover:text-[#0B1F33]"
          aria-label="Back from QR code"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center space-y-4"
            >
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {perkValue}
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  {perkDescription}
                </p>
              </div>

              {/* QR Code */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex justify-center py-4"
              >
                <div className="bg-white p-4 rounded-lg border-4 border-primary/20">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`}
                    alt="QR Code"
                    className="w-44 h-44"
                  />
                </div>
              </motion.div>

              <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground">
                Or tap confirm to redeem here
              </div>

              <button
                onClick={handleConfirm}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-[13px] hover:bg-primary/90 transition-colors"
              >
                Confirm redemption
              </button>
            </motion.div>
          )}

          {state === 'confirming' && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-12 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[13px] font-medium text-muted-foreground">
                Processing...
              </p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center space-y-4 py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-8 h-8 text-primary animate-pulse" />
              </motion.div>

              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">
                  Perk unlocked!
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  {item.perk_value} at {item.name}
                </p>
              </div>

              {/* Rating */}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRate(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? 'opacity-100' : 'opacity-40'
                      }`}
                    >
                      ⭐
                    </motion.button>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-10 rounded-lg bg-foreground text-background font-semibold text-[13px] hover:bg-foreground/90 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center space-y-4"
            >
              <div className="w-12 h-10 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Something went wrong
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  Please try again or visit the venue.
                </p>
              </div>
              <button
                onClick={() => setState('idle')}
                className="w-full h-10 rounded-lg bg-foreground text-background font-semibold text-[13px] hover:bg-foreground/90 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
