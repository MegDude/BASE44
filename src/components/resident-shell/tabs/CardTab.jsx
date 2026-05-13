import { motion } from "framer-motion";
import { Check, CreditCard } from "lucide-react";

export default function CardTab() {
  const recentRedemptions = [
    {
      id: 1,
      venue: "Uchi Restaurant",
      value: "$25 discount",
      date: "May 10, 2026",
    },
    {
      id: 2,
      venue: "Barton Springs",
      value: "Free entry",
      date: "May 8, 2026",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Resident Card */}
      <motion.div
        className="relative h-48 rounded-[24px] bg-gradient-to-br from-[#111f3d] to-[#0a1829] text-white shadow-[0_20px_60px_rgba(17,31,61,0.2)] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#c6a55c] rounded-full blur-3xl"></div>
        </div>

        {/* Card content */}
        <div className="relative p-6 h-full flex flex-col justify-between z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/60 mb-3 font-inter font-semibold">
              Downtown Perks Resident
            </p>
            <p className="text-[14px] font-canela font-semibold text-white/90">
              Active Member
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-white/50 font-inter mb-1">
                Member Since
              </p>
              <p className="text-[12px] font-inter font-semibold text-white">2024</p>
            </div>
            <CreditCard className="w-8 h-8 text-[#c6a55c]" />
          </div>
        </div>
      </motion.div>

      {/* Card Stats */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-[20px] bg-white/72 backdrop-blur-sm border border-white/40 p-4">
          <p className="text-[11px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
            Perks Used
          </p>
          <p className="text-2xl font-canela font-semibold text-[#111f3d]">12</p>
        </div>
        <div className="rounded-[20px] bg-white/72 backdrop-blur-sm border border-white/40 p-4">
          <p className="text-[11px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-2">
            Value Saved
          </p>
          <p className="text-2xl font-canela font-semibold text-[#c6a55c]">$184</p>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="rounded-[20px] bg-white/72 backdrop-blur-sm border border-white/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-[12px] font-inter uppercase tracking-[0.12em] text-[#111f3d]/60 mb-4 font-semibold">
          Recent Redemptions
        </h3>

        <div className="space-y-3">
          {recentRedemptions.map((redemption, idx) => (
            <motion.div
              key={redemption.id}
              className="flex items-start gap-3 pb-3 border-b border-[#111f3d]/8 last:border-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <div className="mt-1 p-1.5 rounded-full bg-[#c6a55c]/20">
                <Check className="w-3 h-3 text-[#c6a55c]" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-inter font-medium text-[#111f3d]">
                  {redemption.venue}
                </p>
                <p className="text-[11px] text-[#111f3d]/50 mt-0.5">
                  {redemption.value} • {redemption.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
