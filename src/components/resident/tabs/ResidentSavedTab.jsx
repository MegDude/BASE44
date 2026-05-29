import { motion } from "framer-motion";
import { MapPin, Trash2 } from "lucide-react";

export default function ResidentSavedTab({ user }) {
  const saved = [
    { id: 1, name: "Café Noir", type: "venue", distance: "0.2 mi" },
    { id: 2, name: "Live Music @ The Paseo", type: "event", distance: "0.5 mi" },
    { id: 3, name: "Rainey Rooftop Happy Hour", type: "perk", distance: "0.1 mi" },
    { id: 4, name: "Yoga Haven", type: "venue", distance: "0.3 mi" },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">Saved</h2>
          <p className="text-[13px] text-muted-foreground">{saved.length} items saved</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["All", "Places", "Events", "Perks"].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full border border-border/40 bg-white hover:border-primary/50 text-foreground text-[13px] font-medium transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Saved items */}
        <div className="space-y-3">
          {saved.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.type}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.distance}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}