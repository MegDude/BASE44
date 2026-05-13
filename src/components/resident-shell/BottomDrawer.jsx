import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, X } from "lucide-react";
import { useState, useEffect } from "react";

const DRAWER_HEIGHTS = {
  peek: 0.18,      // 18vh
  preview: 0.5,    // 50vh
  expanded: 0.88,  // 88vh
  fullscreen: 1,   // 100vh
};

export default function BottomDrawer({ state, onStateChange, children, activeTab }) {
  const [touchStart, setTouchStart] = useState(null);
  const heightPercent = DRAWER_HEIGHTS[state] || DRAWER_HEIGHTS.peek;
  const heightVh = heightPercent * 100;

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStart - touchEnd;

    // Swiping up - go to next state
    if (diff > 30) {
      if (state === "peek") onStateChange("preview");
      else if (state === "preview") onStateChange("expanded");
      else if (state === "expanded") onStateChange("fullscreen");
    }

    // Swiping down - go to previous state
    if (diff < -30) {
      if (state === "fullscreen") onStateChange("expanded");
      else if (state === "expanded") onStateChange("preview");
      else if (state === "preview") onStateChange("peek");
    }

    setTouchStart(null);
  };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      animate={{
        pointerEvents: state !== "peek" ? "auto" : "none",
      }}
    >
      {/* Overlay */}
      <AnimatePresence>
        {state !== "peek" && (
          <motion.div
            className="absolute inset-0 bg-black pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            onClick={() => onStateChange("peek")}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Drawer Container */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white/82 backdrop-blur-[14px] border-t border-white/40 shadow-[0_-20px_60px_rgba(17,31,61,0.08)] rounded-t-[28px] flex flex-col pointer-events-auto"
        style={{
          height: `${heightVh}vh`,
        }}
        animate={{
          height: `${heightVh}vh`,
        }}
        transition={{
          duration: 0.5,
          ease: "cubic-bezier(0.32, 0.72, 0.3, 1)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex flex-col items-center justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
          <motion.div
            className="w-8 h-1 bg-[#111f3d]/20 rounded-full"
            whileHover={{ backgroundColor: "#111f3d" }}
          />
        </div>

        {/* Header with Close Button (visible in expanded/fullscreen) */}
        {(state === "expanded" || state === "fullscreen") && (
          <motion.div
            className="flex items-center justify-between px-6 py-3 border-b border-[#111f3d]/8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-[12px] font-inter font-semibold text-[#111f3d] uppercase tracking-[0.12em]">
              {activeTab}
            </h2>
            <motion.button
              onClick={() => onStateChange("peek")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 hover:bg-[#111f3d]/8 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#111f3d]/60" />
            </motion.button>
          </motion.div>
        )}

        {/* Content Area - scrollable */}
        <motion.div
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 text-[#111f3d]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
