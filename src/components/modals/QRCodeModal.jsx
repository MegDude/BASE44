/**
 * QRCodeModal — Perk redemption QR flow
 * States: idle | scanning | success | error
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useUnifiedMapStore } from '@/store/unified-map-store';

export default function QRCodeModal({ item, onClose, onSuccess }) {
  const { trackAction } = useUnifiedMapStore();
  const [state, setState] = useState('idle'); // idle | confirming | success | error
  const [rating, setRating] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const hasPerk = Boolean(item?.perk_value || item?.perk?.value || item?.perk);

  const qrValue = JSON.stringify({
    type: 'perk_redemption',
    venueId: item.id,
    venueName: item.name,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    if (!hasPerk) return;
    const timer = window.setTimeout(() => setShowCard(true), 40);
    return () => window.clearTimeout(timer);
  }, [hasPerk]);

  const handleConfirm = async () => {
    setState('confirming');
    try {
      await trackAction(item.id, 'redeem', {
        itemType: 'venue',
        perkValue: item.perk_value,
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.985 }}
        animate={{ opacity: showCard ? 1 : 0, y: showCard ? 0 : 28, scale: showCard ? 1 : 0.985 }}
        exit={{ opacity: 0, y: 20, scale: 0.985 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-t-[28px] bg-white p-6 pb-7 md:mx-4 md:rounded-[28px]"
      >
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
                  Get {item.perk_value}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Scan this QR at {item.name}
                </p>
              </div>

              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showCard ? 1 : 0, y: showCard ? 0 : 10 }}
                transition={{ duration: 0.24, delay: 0.1, ease: 'easeOut' }}
                className="flex justify-center py-4"
              >
                <div className="relative bg-white p-4 rounded-2xl border-4 border-primary/20">
                  <motion.span
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 0.22, 0], scale: [0.9, 1.04, 1.1] }}
                    transition={{ duration: 1.05, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-[-8px] rounded-[22px] border border-[rgba(207,175,90,0.42)]"
                  />
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
                className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
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
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
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
                className="w-full h-11 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
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
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Something went wrong
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please try again or visit the venue.
                </p>
              </div>
              <button
                onClick={() => setState('idle')}
                className="w-full h-11 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
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
