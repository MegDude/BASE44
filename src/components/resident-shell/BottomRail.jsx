import { motion } from "framer-motion";

export default function BottomRail({ activeTab, onTabChange, tabs }) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-40 flex justify-center items-end pb-6 px-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex gap-2 bg-white/88 backdrop-blur-[14px] rounded-full px-3 py-2">
        {Object.entries(tabs).map(([key, tab]) => {
          const Icon = tab.icon;
          const isActive = activeTab === key;

          return (
            <motion.button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-[#111f3d]/8 text-[#111f3d]"
                  : "text-[#111f3d]/60 hover:text-[#111f3d]"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-inter font-medium tracking-[0.08em] uppercase">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
