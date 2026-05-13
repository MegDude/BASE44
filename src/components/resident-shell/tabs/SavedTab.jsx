import { motion } from "framer-motion";
import { Heart, Calendar } from "lucide-react";

export default function SavedTab() {
  const saved = [
    {
      id: 1,
      title: "Uchi Restaurant",
      category: "Fine Dining",
      savedDate: "Added 3 days ago",
      image: "🍣",
    },
    {
      id: 2,
      title: "Barton Springs",
      category: "Recreation",
      savedDate: "Added 1 week ago",
      image: "🏊",
    },
    {
      id: 3,
      title: "Zilker Park Run Club",
      category: "Fitness",
      savedDate: "Added 2 weeks ago",
      image: "🏃",
    },
    {
      id: 4,
      title: "South Congress Avenue",
      category: "Shopping",
      savedDate: "Added 1 month ago",
      image: "🛍️",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-3">
          Your saved places & events
        </h3>
      </div>

      {saved.length > 0 ? (
        saved.map((item, idx) => (
          <motion.div
            key={item.id}
            className="rounded-lg bg-white/72 backdrop-blur-sm p-4 hover:bg-white/78 transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex gap-3 items-start justify-between">
              <div className="flex gap-3 items-start flex-1">
                <div className="text-2xl">{item.image}</div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-canela font-semibold text-[#111f3d] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[12px] font-inter text-[#111f3d]/60 mb-2">
                    {item.category}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-[#111f3d]/50">
                    <Calendar className="w-3 h-3" />
                    {item.savedDate}
                  </div>
                </div>
              </div>
              <motion.button
                className="p-2 rounded-full hover:bg-[#c6a55c]/20 transition-colors opacity-0 group-hover:opacity-100"
                whileHover={{ scale: 1.1 }}
              >
                <Heart className="w-4 h-4 text-[#c6a55c] fill-[#c6a55c]" />
              </motion.button>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <Heart className="w-8 h-8 text-[#111f3d]/30 mx-auto mb-3" />
          <p className="text-[13px] font-inter text-[#111f3d]/50">
            Save places and events to keep track of them
          </p>
        </div>
      )}
    </div>
  );
}
