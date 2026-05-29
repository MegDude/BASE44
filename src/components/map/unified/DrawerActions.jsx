/**
 * DrawerActions — Transactional action system
 * Save, Redeem, RSVP, Book, Navigate
 * All optimistic updates, instant sync to dashboard
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MapPin, Zap, Calendar, CheckCircle } from 'lucide-react';
import { useUnifiedMapStore } from '@/store/unified-map-store';
import QRCodeModal from '@/components/modals/QRCodeModal';

export default function DrawerActions({ item, itemType, onClose }) {
  const { trackAction, isRedeeming, redeemingId } = useUnifiedMapStore();
  const [showQR, setShowQR] = useState(false);
  const [successAction, setSuccessAction] = useState(null);

  const handlePrimaryAction = async () => {
    if (itemType === 'venue') {
      setShowQR(true);
      await trackAction(item.id, 'scan', { itemType: 'venue' });
    } else if (itemType === 'event') {
      await trackAction(item.id, 'rsvp', { itemType: 'event' });
      setSuccessAction('rsvp');
    }
  };

  const handleSave = async () => {
    await trackAction(item.id, 'save', { itemType });
    setSuccessAction('save');
  };

  const handleShare = () => {
    const text = `Check out ${item.name}${item.address ? ` at ${item.address}` : ''}`;
    if (navigator.share) {
      navigator.share({ title: item.name, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleNavigate = async () => {
    await trackAction(item.id, 'navigate', { itemType });
    if (item.latitude && item.longitude) {
      window.open(
        `https://maps.google.com/?q=${item.latitude},${item.longitude}`,
        '_blank'
      );
    }
  };

  const primaryLabel =
    itemType === 'venue' ? 'Get Perk' : itemType === 'event' ? 'RSVP' : 'Reserve';
  const primaryIcon =
    itemType === 'venue' ? Zap : itemType === 'event' ? Calendar : MapPin;

  const PrimaryIcon = primaryIcon;

  return (
    <>
      {/* Success overlay */}
      <AnimatePresence mode="wait" initial={false}>
        {successAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-12 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="font-bold text-lg text-foreground mb-1">
                {successAction === 'save' ? 'Saved!' : 'Done!'}
              </h3>
              <p className="text-[13px] text-muted-foreground mb-4">
                {successAction === 'save'
                  ? 'Added to your list'
                  : 'Your action was recorded'}
              </p>
              <button
                onClick={() => {
                  setSuccessAction(null);
                  setTimeout(() => onClose?.(), 200);
                }}
                className="w-full h-10 rounded-lg bg-foreground text-background font-semibold text-[13px] hover:bg-foreground/90 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      {showQR && (
        <QRCodeModal
          item={item}
          onClose={() => setShowQR(false)}
          onSuccess={() => {
            setShowQR(false);
            setSuccessAction('redeem');
          }}
        />
      )}

      {/* Action buttons */}
      <div className="space-y-3 pb-4">
        {/* Primary action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrimaryAction}
          disabled={isRedeeming && redeemingId === item.id}
          className={`w-full h-10 rounded-lg font-semibold text-[13px] transition-all flex items-center justify-center gap-2 ${
            isRedeeming && redeemingId === item.id
              ? 'bg-foreground/50 text-background cursor-wait'
              : 'bg-foreground text-background hover:bg-foreground/90 active:scale-95'
          }`}
        >
          {isRedeeming && redeemingId === item.id ? (
            <>
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <PrimaryIcon className="w-4 h-4" />
              {primaryLabel}
            </>
          )}
        </motion.button>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSave}
            className="h-10 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-[13px] flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleShare}
            className="h-10 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-[13px] flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Navigate */}
        {item.latitude && item.longitude && (
          <button
            onClick={handleNavigate}
            className="w-full h-10 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-[13px] flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Get directions
          </button>
        )}
      </div>
    </>
  );
}