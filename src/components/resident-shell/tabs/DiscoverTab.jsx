import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";

export default function DiscoverTab() {
  const discoverItems = [
    {
      id: 1,
      title: "Rainey Street Crawl",
      category: "Dining & Nightlife",
      distance: "0.3 mi",
      trend: "trending now",
      image: "🍺",
    },
    {
      id: 2,
      title: "Barton Springs Pool",
      category: "Wellness & Recreation",
      distance: "1.2 mi",
      trend: "open now",
      image: "🏊",
    },
    {
      id: 3,
      title: "Congress Ave Shops",
      category: "Retail & Entertainment",
      distance: "0.5 mi",
      trend: "busy",
      image: "🛍️",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-3">
          Curated for you
        </h3>
      </div>

      {discoverItems.map((item, idx) => (
        <motion.div
          key={item.id}
          className="rounded-lg bg-white/72 backdrop-blur-sm p-4 hover:bg-white/78 transition-all cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex gap-3 items-start">
            <div className="text-2xl">{item.image}</div>
            <div className="flex-1">
              <h4 className="text-[14px] font-canela font-semibold text-[#111f3d] mb-1">
                {item.title}
              </h4>
              <p className="text-[12px] font-inter text-[#111f3d]/60 mb-2">
                {item.category}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#111f3d]/50">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.distance}
                </div>
                <div className="flex items-center gap-1 text-[#c6a55c]">
                  <TrendingUp className="w-3 h-3" />
                  {item.trend}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
