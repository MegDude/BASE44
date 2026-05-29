import { motion } from "framer-motion";
import { Gift, Clock, MapPin } from "lucide-react";

export default function ResidentPerksTab({ user }) {
  const perks = [
    {
      id: 1,
      title: "15% off coffee",
      venue: "Café Noir",
      expires: "3 days left",
      distance: "0.2 mi",
      type: "discount",
    },
    {
      id: 2,
      title: "Free appetizer",
      venue: "Rainey Rooftop",
      expires: "7 days left",
      distance: "0.1 mi",
      type: "free_item",
    },
    {
      id: 3,
      title: "First class free",
      venue: "Yoga Haven",
      expires: "30 days left",
      distance: "0.3 mi",
      type: "experience",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">Active Perks</h2>
          <p className="text-[13px] text-muted-foreground">
            {perks.length} perks available near you
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["All", "Expiring Soon", "Nearby"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full border border-border/40 bg-white hover:border-primary/50 text-foreground text-[13px] font-medium transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Perks list */}
        <div className="space-y-3">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Gift className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{perk.title}</h3>
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-2">{perk.venue}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {perk.expires}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {perk.distance}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}