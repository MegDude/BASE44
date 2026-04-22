import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import MapShell from "@/components/map/MapShell";
import { createMarker } from "@/components/map/markers/MarkerFactory";
import { useSharedMapFeed } from "@/lib/map/useSharedMapFeed";

export default function ResidentNowTab({ user }) {
  const [selected, setSelected] = useState(null);
  const { items, loading } = useSharedMapFeed({ activeCategory: "all", limit: 24 });
  const visibleItems = items.filter((item) => item.isOpenNow || item.isLive || item.isPerk).slice(0, 8);
  const fallbackItems = visibleItems.length > 0 ? visibleItems : items.slice(0, 8);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <MapShell
          mode="resident"
          items={fallbackItems}
          selected={selected}
          onSelect={setSelected}
          markerIcon={(item, isSelected) => createMarker(item, { isSelected })}
          className="w-full h-full"
        />

        {/* Floating "Now Open" Feed */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-20 max-h-96 overflow-y-auto space-y-2">
          {loading ? (
            <div className="rounded-lg border border-white/40 bg-white/95 p-3 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
              Loading nearby places...
            </div>
          ) : null}
          {fallbackItems.map((venue, i) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(venue)}
              className={`p-3 rounded-lg bg-white/95 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all cursor-pointer ${
                selected?.id === venue.id ? "border-primary/40" : "border-white/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{venue.name || venue.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {venue.metadata?.walkMinutes ? `${venue.metadata.walkMinutes} min walk` : venue.category || venue.address}
                  </p>
                </div>
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Feed Panel */}
      <div className="h-48 md:hidden border-t border-border/20 bg-background overflow-y-auto">
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Opening Soon</h3>
          {[
            { time: "5:00 PM", name: "Happy Hour @ Rainey" },
            { time: "7:00 PM", name: "Live Music at The Paseo" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b border-border/20">
              <Clock className="w-4 h-4 text-primary" />
              <div className="flex-1">
                <p className="text-xs text-primary font-medium">{item.time}</p>
                <p className="text-sm text-foreground">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
