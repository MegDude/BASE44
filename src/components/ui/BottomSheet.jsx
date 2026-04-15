import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';

/**
 * BottomSheet — Mobile gesture-driven sheet for results/drawer
 * 
 * States: collapsed (80px) → mid (45vh) → full (100vh)
 * 
 * Rules:
 * - Sheet bounds capture touch ONLY
 * - Map retains all gestures outside sheet
 * - Drag up/down transitions between states
 * - Swipe down from full → returns to mid/collapsed
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
    mid: Math.min(window.innerHeight * 0.45, 400),
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

  const handleMouseMove = (e) => {
    if (startYRef.current === 0 || !isDraggable) return;
    // Handled on mouse up
  };

  const handleMouseUp = (e) => {
    if (startYRef.current === 0) return;

    const delta = startYRef.current - e.clientY; // positive = drag up
    const threshold = 30;

    if (Math.abs(delta) < threshold) {
      startYRef.current = 0;
      return;
    }

    let newState = startStateRef.current;

    if (delta > threshold) {
      // Drag up → expand
      const nextIndex = Math.min(currentIndex + 1, STATE_ORDER.length - 1);
      newState = STATE_ORDER[nextIndex];
    } else if (delta < -threshold) {
      // Drag down → collapse
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
    <motion.div
      ref={sheetRef}
      initial={{ y: HEIGHTS.collapsed }}
      animate={{ y: window.innerHeight - height }}
      exit={{ y: window.innerHeight }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="fixed inset-x-0 bottom-0 z-30 bg-white rounded-t-2xl shadow-xl overflow-hidden"
      style={{
        height,
        paddingBottom: `calc(${bottomSafeArea})`,
        touchAction: 'pan-y',
      }}
    >
      {/* Drag handle */}
      {isDraggable && (
        <div
          className="w-full py-3 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-[#e8e5df]"
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="w-4 h-4 text-[#bbb]" />
        </div>
      )}

      {/* Content container */}
      <div
        className={`w-full ${
          state === 'full' ? 'h-full overflow-hidden flex flex-col' : 'max-h-[calc(100%-44px)] overflow-y-auto'
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}