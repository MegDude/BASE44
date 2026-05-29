import { motion } from "framer-motion";
import { MapPin, CheckCircle2, Lock } from "lucide-react";

export default function ResidentBuildingsTab({ user }) {
  const buildings = [
    {
      id: 1,
      name: "The Waterline",
      address: "123 Rainey St",
      verified: true,
      units: 340,
      amenities: ["Rooftop", "Gym", "Coworking"],
    },
    {
      id: 2,
      name: "The Paseo",
      address: "456 Congress Ave",
      verified: false,
      units: 285,
      amenities: ["Fitness", "Lounge"],
    },
    {
      id: 3,
      name: "The Shore",
      address: "789 Lamar St",
      verified: false,
      units: 210,
      amenities: ["Rooftop Pool", "Yoga"],
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-medium mb-2">Buildings</h2>
          <p className="text-[13px] text-muted-foreground">Discover where to live downtown</p>
        </div>

        {/* Your Building */}
        {buildings.filter((b) => b.verified).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-foreground text-[13px] mb-3">Your Building</h3>
            {buildings
              .filter((b) => b.verified)
              .map((building) => (
                <div
                  key={building.id}
                  className="p-4 rounded-xl border-2 border-primary bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{building.name}</h4>
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{building.address}</p>
                  <div className="flex flex-wrap gap-1">
                    {building.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-[10px] font-medium px-2 py-1 bg-white rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </motion.div>
        )}

        {/* Other Buildings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-foreground text-[13px] mb-3">Nearby Buildings</h3>
          <div className="space-y-3">
            {buildings
              .filter((b) => !b.verified)
              .map((building, i) => (
                <div
                  key={building.id}
                  className="p-4 rounded-xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-foreground text-[13px]">{building.name}</h4>
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {building.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {building.units} units
                    </p>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Learn more
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}