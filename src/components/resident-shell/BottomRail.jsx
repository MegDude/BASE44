import { motion } from "framer-motion";

export default function BottomRail({ activeTab, onTabChange, tabs }) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40 flex justify-center items-end pb-6 px-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex gap-2 bg-white/65 backdrop-blur-[14px] rounded-full px-3 py-2 border border-white/64 shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_8px_40px_rgba(11,31,51,0.06)]">
        {Object.entries(tabs).map(([key, tab]) => {
          const Icon = tab.icon;
          const isActive = activeTab === key;

          return (
            <motion.button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-slate-900/8 text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium tracking-wider">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
