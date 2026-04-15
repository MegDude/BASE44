/**
 * UnifiedDrawer — Mobile bottom sheet + Desktop side drawer
 * States: collapsed | mid | full
 * Fully synced with map and results
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Tag, Heart, Share2 } from 'lucide-react';
import { useUnifiedMapStore } from '@/store/unified-map-store';

export default function UnifiedDrawer({ selected, onMarkerSelect }) {
  const { drawerState, setDrawerState, clearSelection } = useUnifiedMapStore();
  const startYRef = useRef(0);
  const [isPanning, setIsPanning] = useState(false);

  const HEIGHTS = {
    collapsed: 0,
    mid: Math.min(window?.innerHeight * 0.5 || 450, 450),
    full: window?.innerHeight || 800,
  };

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    setIsPanning(true);
  };

  const handleTouchEnd = (e) => {
    if (!isPanning) return;

    const delta = startYRef.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (delta > threshold && drawerState !== 'full') {
      setDrawerState('full');
    } else if (delta < -threshold && drawerState !== 'collapsed') {
      setDrawerState('collapsed');
    }

    setIsPanning(false);
    startYRef.current = 0;
  };

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerState !== 'collapsed') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [drawerState]);

  const height = HEIGHTS[drawerState];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {drawerState === 'full' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerState('mid')}
            className="fixed inset-0 bg-black/20 z-[29]"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {drawerState !== 'collapsed' && selected && (
          <motion.div
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: Math.max(height, 100) }}
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center py-3 px-4 border-b border-border cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {drawerState === 'mid' ? (
                <DrawerPreview selected={selected} />
              ) : (
                <DrawerFull selected={selected} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerPreview({ selected }) {
  const { selectEntity } = useUnifiedMapStore();

  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
          {selected._type}
        </div>
        <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
        {selected.address && (
          <p className="text-sm text-muted-foreground mt-1">
            {selected.address}
          </p>
        )}
      </div>

      {selected._type === 'venue' && selected.perk_value && (
        <div className="bg-primary/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase text-primary">
              Member perk
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {selected.perk_value}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => selectEntity(selected.id, selected._type)}
          className="flex-1 h-11 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
        >
          View details
        </button>
        <button className="h-11 px-3 rounded-lg border border-border bg-white hover:bg-secondary transition-colors">
          <Heart className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function DrawerFull({ selected }) {
  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
          {selected._type}
        </div>
        <h1 className="text-2xl font-bold text-foreground">{selected.name}</h1>
      </div>

      {/* Image */}
      {selected.image_url && (
        <img
          src={selected.image_url}
          alt={selected.name}
          className="w-full aspect-[2/1] object-cover rounded-2xl"
        />
      )}

      {/* Key info */}
      <div className="grid grid-cols-2 gap-3">
        {selected.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Location</div>
              <div className="font-medium text-foreground">
                {selected.address.split(',')[0]}
              </div>
            </div>
          </div>
        )}

        {selected.hours && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Hours</div>
              <div className="font-medium text-foreground">{selected.hours}</div>
            </div>
          </div>
        )}
      </div>

      {/* Perk */}
      {selected._type === 'venue' && selected.perk_value && (
        <div className="bg-primary/10 rounded-xl p-4">
          <div className="text-xs font-semibold text-primary mb-2 uppercase">
            Member perk
          </div>
          <p className="text-base font-semibold text-foreground mb-3">
            {selected.perk_value}
          </p>
          <button className="w-full h-10 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors">
            Get perk
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <button className="flex-1 h-11 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-sm flex items-center justify-center gap-2">
          <Heart className="w-4 h-4" /> Save
        </button>
        <button className="flex-1 h-11 rounded-lg border border-border bg-white hover:bg-secondary transition-colors font-medium text-sm flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}