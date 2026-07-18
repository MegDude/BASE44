import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * BottomSheet — Mobile gesture-driven drawer with four native states
 * 
 * States: dismissed → peek → medium → expanded
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
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);

  const HEIGHTS = {
    collapsed: 80,
    peek: Math.min(viewportHeight * 0.28, 240),
    mid: Math.min(viewportHeight * 0.54, 480),
    medium: Math.min(viewportHeight * 0.54, 480),
    expanded: Math.min(viewportHeight * 0.88, 820),
    full: Math.min(viewportHeight * 0.88, 820),
  };

  const STATE_ORDER = ['collapsed', 'peek', 'medium', 'expanded'];
  const normalizedState = state === 'mid' ? 'medium' : state === 'full' ? 'expanded' : state;
  const currentIndex = Math.max(0, STATE_ORDER.indexOf(normalizedState));

  // Handle drag gesture
  const handleMouseDown = (e) => {
    if (!isDraggable) return;
    startYRef.current = e.clientY;
    startStateRef.current = normalizedState;
  };

  const handleTouchStart = (e) => {
    if (!isDraggable) return;
    startYRef.current = e.touches[0].clientY;
    startStateRef.current = normalizedState;
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

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  const height = HEIGHTS[normalizedState] || HEIGHTS.medium;
  const bottomSafeArea = 'env(safe-area-inset-bottom)';

  return (
    <AnimatePresence mode="wait" initial={false}>
      {normalizedState !== 'collapsed' && (
        <>
          {/* Backdrop (only on full) */}
          {normalizedState === 'expanded' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onStateChange?.('medium')}
              className="fixed inset-0 bg-[#0B1F33]/20 z-[29]"
            />
          )}

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: HEIGHTS.collapsed }}
            animate={{ y: viewportHeight - height }}
            exit={{ y: viewportHeight }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-x-0 bottom-0 z-30 overflow-hidden rounded-t-[18px] border border-b-0 border-[#0B1F33]/10 bg-white shadow-[0_4px_12px_rgba(11,31,51,0.06),0_22px_56px_rgba(11,31,51,0.10)] flex flex-col"
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
                {normalizedState === 'expanded' && (
                  <button
                    type="button"
                    aria-label="Collapse sheet"
                    onClick={() => onStateChange?.('medium')}
                    className="w-11 h-11 rounded-[14px] bg-white flex items-center justify-center hover:bg-[#F2F4F7] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#0B1F33]" />
                  </button>
                )}
              </div>
            )}

            {/* Content container */}
            <div
              className={`w-full ${
                normalizedState === 'expanded'
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
