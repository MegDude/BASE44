import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X } from 'lucide-react';

/**
 * BottomSheet — Mobile gesture-driven drawer with three states
 * 
 * States: collapsed (preview) → mid (results) → full (detail with CTAs)
 * - Tap pin → mid state opens
 * - Swipe up → expands to full
 * - Swipe down → collapses back
 * - X button on full state → closes to mid
 * 
 * Rules:
 * - Sheet bounds capture touch ONLY
 * - Map retains all gestures outside sheet
 * - Drag up/down transitions between states
 * - Full state has backdrop and close button
 */

export default function BottomSheet({
  state = 'collapsed',
  onStateChange,
  children,
  isDraggable = true,
}) {
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const startStateRef = useRef(state);

  const HEIGHTS = {
    collapsed: 80,
    mid: Math.min(window.innerHeight * 0.5, 450),
    full: window.innerHeight,
  };

  const STATE_ORDER = ['collapsed', 'mid', 'full'];
  const currentIndex = STATE_ORDER.indexOf(state);

  // Handle drag gesture
  const handleMouseDown = (e) => {
    if (!isDraggable) return;
    startYRef.current = e.clientY;
    startStateRef.current = state;
  };

  const handleTouchStart = (e) => {
    if (!isDraggable) return;
    startYRef.current = e.touches[0].clientY;
    startStateRef.current = state;
  };

  const handleMouseUp = (e) => {
    if (startYRef.current === 0) return;

    const delta = startYRef.current - e.clientY; // positive = drag up
    const threshold = 50; // Swipe sensitivity

    if (Math.abs(delta) < threshold) {
      startYRef.current = 0;
      return;
    }

    let newState = startStateRef.current;

    if (delta > threshold) {
      // Swipe up → expand
      const nextIndex = Math.min(currentIndex + 1, STATE_ORDER.length - 1);
      newState = STATE_ORDER[nextIndex];
    } else if (delta < -threshold) {
      // Swipe down → collapse
      const prevIndex = Math.max(currentIndex - 1, 0);
      newState = STATE_ORDER[prevIndex];
    }

    onStateChange?.(newState);
    startYRef.current = 0;
  };

  const handleTouchEnd = (e) => {
    if (startYRef.current === 0) return;

    const delta = startYRef.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (Math.abs(delta) < threshold) {
      startYRef.current = 0;
      return;
    }

    let newState = startStateRef.current;

    if (delta > threshold) {
      const nextIndex = Math.min(currentIndex + 1, STATE_ORDER.length - 1);
      newState = STATE_ORDER[nextIndex];
    } else if (delta < -threshold) {
      const prevIndex = Math.max(currentIndex - 1, 0);
      newState = STATE_ORDER[prevIndex];
    }

    onStateChange?.(newState);
    startYRef.current = 0;
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (state !== 'collapsed') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [state]);

  const height = HEIGHTS[state];
  const bottomSafeArea = 'env(safe-area-inset-bottom)';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state !== 'collapsed' && (
        <>
          {/* Backdrop (only on full) */}
          {state === 'full' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onStateChange?.('mid')}
              className="fixed inset-0 bg-black/20 z-[29]"
            />
          )}

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: HEIGHTS.collapsed }}
            animate={{ y: window.innerHeight - height }}
            exit={{ y: window.innerHeight }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              height,
              paddingBottom: `calc(${bottomSafeArea})`,
              touchAction: 'pan-y',
            }}
          >
            {/* Drag handle + close button */}
            {isDraggable && (
              <div
                className="w-full py-2.5 px-4 flex items-center justify-between shrink-0 border-b border-[#0B1F33]/8 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="w-12 h-1 rounded-full bg-[#0B1F33]/8" />
                {state === 'full' && (
                  <button
                    onClick={() => onStateChange?.('mid')}
                    className="w-8 h-8 rounded-full bg-[#F7F8FB] flex items-center justify-center hover:bg-[#F7F8FB] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#0B1F33]" />
                  </button>
                )}
              </div>
            )}

            {/* Content container */}
            <div
              className={`w-full ${
                state === 'full'
                  ? 'flex-1 overflow-y-auto'
                  : 'max-h-[calc(100%-44px)] overflow-y-auto'
              }`}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}